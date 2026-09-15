/**
 * Wompi PSE Routes — Pasarela de Pagos con Transferencia Bancaria
 *
 * Endpoints:
 *   GET  /api/wompi/estado                     — Verificar si Wompi está configurado
 *   GET  /api/wompi/bancos                     — Lista de bancos PSE
 *   POST /api/wompi/pse/iniciar                — Crear transacción PSE
 *   GET  /api/wompi/pse/estado/:transactionId  — Consultar estado de transacción
 *   POST /api/wompi/webhook                    — Webhook de eventos Wompi
 */

import type { Express } from "express";
import { requireAuth } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { and, eq, gte, ne, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { z } from "zod";
import logger from "../lib/logger";
import { paymentOperationLimiter, webhookRateLimiter } from "../middleware/rate-limit";
import crypto from "crypto";
import {
  isWompiEnabled,
  isWompiConfigured,
  getWompiPublicKey,
  isWompiSandbox,
  getFinancialInstitutions,
  createPseTransaction,
  getTransaction,
  verifyWebhookSignature,
  type WompiWebhookEvent,
} from "../services/wompi";

// Referencia PSE — formato: sst-pse-{subscriptionId}-{timestamp}-{nonce}
function getEffectiveCompanyId(req: any): string | null {
  // Solo el proveedor SaaS puede seleccionar otra empresa para una operación
  // de cobro. Los roles LSO no deben iniciar pagos para empresas por encabezado.
  const globalRoles = ['superadmin'];
  if (globalRoles.includes(req.user?.role)) {
    const headerCompanyId = req.headers['x-company-id'] as string | undefined;
    const queryCompanyId = req.query?.companyId as string | undefined;
    if (headerCompanyId) return headerCompanyId;
    if (queryCompanyId) return queryCompanyId;
  }
  return req.user?.companyId || null;
}

function buildReference(subscriptionId: string): string {
  return `sst-pse-${subscriptionId}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
}

function extractSubscriptionId(reference: string): string | null {
  const match = reference.match(
    /^sst-pse-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-\d+(?:-[a-f0-9]{12})?$/i
  );
  return match ? match[1] : null;
}

const contractAcceptanceSchema = z.object({
  acceptedTerms: z.literal(true),
  acceptedDataTreatment: z.literal(true),
  acceptedAutoRenewal: z.literal(true),
  acceptedAt: z.string().datetime({ offset: true }).optional(),
  planName: z.string().min(1).optional(),
});

type ContractAcceptance = {
  acceptedTerms: true;
  acceptedDataTreatment: true;
  acceptedAutoRenewal: true;
  acceptedAt: string;
  planName?: string;
  planId: string;
  amountCOP: number;
  acceptedByUserId: string;
  ipAddress: string;
};

function getExpectedAmountInCents(company: any): number | null {
  const base = Number(company.quoteBaseMonthlyPrice);
  const current = Number(company.quoteCurrentPeriodPrice);
  const priceCOP = Number.isFinite(current) && current > 0 ? current : base;
  if (!Number.isFinite(priceCOP) || priceCOP <= 0) return null;
  return Math.round(priceCOP * 100);
}

function addOneCalendarMonth(date: Date): Date {
  const originalDay = date.getDate();
  const originalMonthLastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
  const preserveEndOfMonth = originalDay === originalMonthLastDay;
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + 1);
  const targetLastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();
  result.setDate(preserveEndOfMonth ? targetLastDay : Math.min(originalDay, targetLastDay));
  return result;
}

function getContractAcceptance(description: string | null): ContractAcceptance | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description);
    const value = parsed?.contractAcceptance;
    const result = contractAcceptanceSchema.safeParse(value);
    if (
      !result.success ||
      typeof value.acceptedAt !== "string" ||
      typeof value.planId !== "string" ||
      typeof value.amountCOP !== "number" ||
      typeof value.acceptedByUserId !== "string" ||
      typeof value.ipAddress !== "string"
    ) {
      return null;
    }
    return value as ContractAcceptance;
  } catch {
    return null;
  }
}

// Activar/renovar suscripción tras pago PSE aprobado. La actualización de la
// transacción y de la suscripción se reclama en una única transacción DB para
// que un webhook duplicado no vuelva a extender el período.
async function activateSubscriptionAfterPse(
  subscriptionId: string,
  wompiTransaction: {
    id: string;
    reference: string;
    amount_in_cents: number;
    currency: string;
    payment_method_type: string;
  },
  localTransaction: schema.PaymentTransaction
): Promise<void> {
  const subscription = await storage.getSubscription(subscriptionId);
  if (!subscription) {
    throw new Error("Suscripción no encontrada");
  }

  if (
    localTransaction.companyId !== subscription.companyId ||
    localTransaction.subscriptionId !== subscription.id ||
    localTransaction.wompiReference !== wompiTransaction.reference ||
    (localTransaction.wompiTransactionId !== null &&
      localTransaction.wompiTransactionId !== wompiTransaction.id)
  ) {
    throw new Error("La propiedad de la transacción no coincide con la suscripción");
  }

  const company = await storage.getCompany(subscription.companyId);
  if (
    !company ||
    wompiTransaction.currency !== "COP" ||
    localTransaction.currency !== "COP" ||
    wompiTransaction.amount_in_cents !== localTransaction.amount ||
    wompiTransaction.payment_method_type !== "PSE"
  ) {
    throw new Error("La transacción PSE no coincide con la cotización vigente");
  }

  const acceptance = getContractAcceptance(localTransaction.description);
  if (!acceptance) {
    throw new Error("La transacción no contiene la aceptación del contrato");
  }

  const now = new Date();
  let nextPeriodEnd = now;
  const invoiceNumber = `SST-PSE-${now.getFullYear()}-${localTransaction.id}`;
  const amountInPesos = Math.round(wompiTransaction.amount_in_cents / 100);

  const claimed = await db.transaction(async (tx) => {
    // Serializa toda finalización de pagos de una misma suscripción.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${subscriptionId}))`);
    const [lockedSubscription] = await tx
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscriptionId))
      .limit(1);
    if (!lockedSubscription) throw new Error("Suscripción no encontrada al finalizar el pago");

    const [updatedPayment] = await tx
      .update(schema.paymentTransactions)
      .set({
        status: "APPROVED",
        paidAt: now,
        wompiTransactionId: wompiTransaction.id,
        wompiPaymentMethod: "PSE",
      })
      .where(
        and(
          eq(schema.paymentTransactions.id, localTransaction.id),
          ne(schema.paymentTransactions.status, "APPROVED")
        )
      )
      .returning({ id: schema.paymentTransactions.id });

    if (!updatedPayment) return false;

    const existingPeriodEnd = new Date(lockedSubscription.currentPeriodEnd);
    const periodStart =
      lockedSubscription.status === "active" && existingPeriodEnd > now
        ? existingPeriodEnd
        : now;
    nextPeriodEnd = addOneCalendarMonth(periodStart);

    await tx
      .update(schema.subscriptions)
      .set({
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: nextPeriodEnd,
        lastPaymentDate: now,
        nextPaymentDate: nextPeriodEnd,
        trialEnd: null,
        contractAcceptedAt: new Date(acceptance.acceptedAt),
        contractTermsVersion: "1.0",
        contractData: {
          acceptedTerms: acceptance.acceptedTerms,
          acceptedDataTreatment: acceptance.acceptedDataTreatment,
          acceptedAutoRenewal: acceptance.acceptedAutoRenewal,
          planName: acceptance.planName,
          planId: acceptance.planId,
          amountCOP: acceptance.amountCOP,
          acceptedAt: acceptance.acceptedAt,
          acceptedByUserId: acceptance.acceptedByUserId,
          ipAddress: acceptance.ipAddress,
        },
      })
      .where(eq(schema.subscriptions.id, subscriptionId));

    const [existingInvoice] = await tx
      .select()
      .from(schema.invoices)
      .where(
        and(
          eq(schema.invoices.subscriptionId, subscriptionId),
          eq(schema.invoices.periodEnd, nextPeriodEnd)
        )
      )
      .limit(1);

    let invoiceId = existingInvoice?.id;
    if (existingInvoice) {
      if (
        existingInvoice.companyId !== subscription.companyId ||
        existingInvoice.transactionId ||
        existingInvoice.currency !== "COP" ||
        existingInvoice.total !== amountInPesos ||
        existingInvoice.subtotal !== amountInPesos ||
        existingInvoice.periodStart.getTime() !== periodStart.getTime()
      ) {
        throw new Error("La factura existente no coincide con el pago PSE");
      }
      await tx
        .update(schema.invoices)
        .set({
          status: "paid",
          paidDate: now,
          dueDate: now,
          transactionId: localTransaction.id,
        })
        .where(eq(schema.invoices.id, existingInvoice.id));
    } else {
      const [invoice] = await tx
        .insert(schema.invoices)
        .values({
          companyId: subscription.companyId,
          subscriptionId,
          transactionId: localTransaction.id,
          invoiceNumber,
          status: "paid",
          subtotal: amountInPesos,
          taxAmount: 0,
          total: amountInPesos,
          currency: "COP",
          periodStart,
          periodEnd: nextPeriodEnd,
          issueDate: now,
          dueDate: now,
          paidDate: now,
          customerName: company.name,
          customerNit: company.nit || "N/A",
          customerEmail: company.contactEmail || "",
          customerAddress: company.address || "",
          lineItems: JSON.stringify([{
            description: "Suscripción mensual Software SST Colombia - PSE",
            quantity: 1,
            unitPrice: amountInPesos,
            total: amountInPesos,
          }]),
          snapshotCiiuCode: company.ciiuCode || null,
          snapshotNumberOfWorkers: company.numberOfWorkers ?? null,
          snapshotNumberOfVehicles: company.numberOfVehicles ?? null,
        })
        .returning({ id: schema.invoices.id });
      invoiceId = invoice.id;
    }

    await tx
      .update(schema.paymentTransactions)
      .set({
        invoiceId,
        periodStart,
        periodEnd: nextPeriodEnd,
      })
      .where(eq(schema.paymentTransactions.id, localTransaction.id));

    return true;
  });

  if (!claimed) {
    await storage.ensurePricingPluginSync(subscription.companyId, "active", null);
    logger.info(
      { subscriptionId, transactionId: wompiTransaction.id },
      "[Wompi] Pago ya procesado; no se extiende nuevamente la suscripción"
    );
    return;
  }

  await storage.ensurePricingPluginSync(subscription.companyId, "active", null);

  logger.info(
    { subscriptionId, companyId: subscription.companyId, nextPeriodEnd, transactionId: wompiTransaction.id },
    "[Wompi-Webhook] Suscripción activada/renovada exitosamente vía PSE"
  );
}

export function registerWompiRoutes(app: Express) {
  // ==========================================================================
  // GET /api/wompi/estado — Estado de configuración Wompi
  // ==========================================================================
  app.get("/api/wompi/estado", requireAuth, (_req, res) => {
    const enabled = isWompiEnabled();
    const configured = isWompiConfigured();
    res.json({
      enabled,
      configured,
      sandbox: isWompiSandbox(),
      publicKey: enabled && configured ? getWompiPublicKey() : null,
    });
  });

  // ==========================================================================
  // GET /api/wompi/bancos — Lista de bancos PSE disponibles
  // ==========================================================================
  app.get("/api/wompi/bancos", requireAuth, async (_req, res) => {
    if (!isWompiEnabled() || !isWompiConfigured()) {
      return res.status(503).json({
        error: isWompiEnabled() ? "wompi_not_configured" : "wompi_disabled",
        message: "El pago por PSE no está disponible en este momento. Por favor use tarjeta de crédito/débito.",
      });
    }

    try {
      const banks = await getFinancialInstitutions();
      res.json({ banks });
    } catch (error: any) {
      logger.error({ error: error.message }, "[Wompi] Error obteniendo bancos");
      res.status(500).json({ error: "No se pudo obtener la lista de bancos PSE" });
    }
  });

  // ==========================================================================
  // POST /api/wompi/pse/iniciar — Iniciar transacción PSE
  // ==========================================================================
  app.post("/api/wompi/pse/iniciar", paymentOperationLimiter, requireAuth, async (req, res) => {
    if (!isWompiEnabled() || !isWompiConfigured()) {
      return res.status(503).json({
        error: isWompiEnabled() ? "wompi_not_configured" : "wompi_disabled",
        message: "El pago por PSE no está disponible. Use tarjeta de crédito/débito.",
      });
    }
    if (!["superadmin", "superusuario", "admin"].includes(req.user!.role)) {
      return res.status(403).json({
        error: "No tiene permisos para aceptar el contrato e iniciar pagos de la empresa.",
      });
    }

    const bodySchema = z.object({
      bankCode: z.string().min(1, "Seleccione un banco"),
      userType: z.number().int().min(0).max(1), // 0=natural, 1=jurídica
      idType: z.enum(["CC", "CE", "NIT", "PP", "TI"]),
      idNumber: z.string().min(5, "Número de documento inválido"),
      email: z.string().email("Email inválido"),
      fullName: z.string().min(3, "Nombre inválido"),
      contractAcceptance: contractAcceptanceSchema,
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { bankCode, userType, idType, idNumber, email, fullName, contractAcceptance } = parsed.data;

    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      // Obtener suscripción y precio de cotización
      const subscription = await storage.getSubscriptionByCompany(companyId);
      if (!subscription) {
        return res.status(404).json({ error: "No tiene una suscripción. Contacte a soporte." });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      const companyAny = company as any;
      const quoteBase = Number(companyAny.quoteBaseMonthlyPrice);
      const quoteCurrent = Number(companyAny.quoteCurrentPeriodPrice);
      const amountInCents = getExpectedAmountInCents(company);

      if (amountInCents === null) {
        return res.status(400).json({
          error: "Su empresa no tiene una cotización de precio. Visite sst-colombia.com.co para obtener una cotización antes de proceder al pago.",
        });
      }

      // Las cotizaciones se almacenan en pesos COP completos. Wompi exige
      // centavos de COP.
      const monthlyPriceCOP = quoteCurrent > 0 ? quoteCurrent : quoteBase;
      const verifiedContractAcceptance: ContractAcceptance = {
        acceptedTerms: true,
        acceptedDataTreatment: true,
        acceptedAutoRenewal: true,
        acceptedAt: new Date().toISOString(),
        planName: contractAcceptance.planName,
        planId: subscription.planId,
        amountCOP: monthlyPriceCOP,
        acceptedByUserId: req.user!.id,
        ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      };

      // Construir URL de retorno
      const baseUrl =
        process.env.APP_URL ||
        (process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
          : process.env.REPLIT_DEV_DOMAIN
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "http://localhost:5000");

      const reference = buildReference(subscription.id);
      const redirectUrl = `${baseUrl}/pago-pse/retorno`;

      // No hay columnas de metadata en payment_transactions. Se conserva la
      // aceptación en la descripción de la transacción pendiente para poder
      // aplicarla a subscription únicamente cuando el pago sea aprobado.
      const localDescription = JSON.stringify({
        label: `Pago PSE mensual SST Colombia — ${company.name}`,
        contractAcceptance: verifiedContractAcceptance,
      });
      const pendingTransaction = await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${subscription.id}))`);
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);
        const [existingPending] = await tx
          .select()
          .from(schema.paymentTransactions)
          .where(
            and(
              eq(schema.paymentTransactions.subscriptionId, subscription.id),
              eq(schema.paymentTransactions.status, "PENDING"),
              gte(schema.paymentTransactions.createdAt, cutoff)
            )
          )
          .limit(1);
        if (existingPending) return null;
        const [created] = await tx
          .insert(schema.paymentTransactions)
          .values({
            companyId,
            subscriptionId: subscription.id,
            wompiReference: reference,
            type: "subscription_payment",
            status: "PENDING",
            amount: amountInCents,
            currency: "COP",
            wompiPaymentMethod: "PSE",
            description: localDescription,
          })
          .returning();
        return created;
      });
      if (!pendingTransaction) {
        return res.status(409).json({
          error: "Ya existe un pago PSE en proceso para esta suscripción. Finalícelo o espere 30 minutos antes de intentar nuevamente.",
        });
      }

      let transaction;
      try {
        transaction = await createPseTransaction({
          amountInCents,
          currency: "COP",
          customerEmail: email,
          customerName: fullName,
          customerIdType: idType,
          customerIdNumber: idNumber,
          userType,
          financialInstitutionCode: bankCode,
          redirectUrl,
          reference,
          description: `Suscripción mensual SST Colombia — ${company.name}`,
        });
        await storage.updateTransaction(pendingTransaction.id, {
          wompiTransactionId: transaction.id,
          // La activación debe ser reclamada por el procesador de pago, incluso
          // si Wompi devuelve APPROVED al crear la transacción.
          status: "PENDING",
          wompiPaymentMethod: transaction.payment_method_type || "PSE",
        });
      } catch (error: any) {
        await storage.updateTransaction(pendingTransaction.id, {
          status: "ERROR",
          failedAt: new Date(),
          wompiErrorCode: "CREATE_TRANSACTION_FAILED",
          wompiStatusMessage: String(error?.message || "Error creando transacción PSE").slice(0, 500),
        });
        throw error;
      }

      // URL del banco donde el cliente completa el pago
      const bankRedirectUrl = transaction.payment_method?.extra?.async_payment_url;
      if (!bankRedirectUrl) {
        await storage.updateTransaction(pendingTransaction.id, {
          status: "ERROR",
          failedAt: new Date(),
          wompiErrorCode: "MISSING_BANK_REDIRECT_URL",
          wompiStatusMessage: "Wompi no devolvió URL de redirección bancaria",
        });
        logger.error({ transaction }, "[Wompi] Transacción PSE sin URL de banco");
        return res.status(500).json({ error: "No se obtuvo la URL del banco. Intente de nuevo." });
      }

      logger.info(
        { transactionId: transaction.id, reference, companyId, amount: monthlyPriceCOP },
        "[Wompi] PSE iniciado exitosamente"
      );

      res.json({
        transactionId: transaction.id,
        reference,
        bankRedirectUrl,
        amountInCents,
        status: transaction.status,
      });
    } catch (error: any) {
      logger.error({ error: error.message, userId: req.user!.id }, "[Wompi] Error iniciando PSE");
      res.status(500).json({ error: error.message || "Error iniciando transacción PSE" });
    }
  });

  // ==========================================================================
  // GET /api/wompi/pse/estado/:transactionId — Consultar estado de transacción
  // ==========================================================================
  app.get("/api/wompi/pse/estado/:transactionId", requireAuth, async (req, res) => {
    if (!isWompiEnabled() || !isWompiConfigured()) {
      return res.status(503).json({
        error: isWompiEnabled() ? "wompi_not_configured" : "wompi_disabled",
        message: "El pago por PSE no está disponible en este momento.",
      });
    }

    try {
      const { transactionId } = req.params;
      if (!transactionId || transactionId.length < 5) {
        return res.status(400).json({ error: "ID de transacción inválido" });
      }

      const transaction = await getTransaction(transactionId);
      const effectiveCompanyId = getEffectiveCompanyId(req);
      const subscriptionId = extractSubscriptionId(transaction.reference);
      const subscription = subscriptionId ? await storage.getSubscription(subscriptionId) : undefined;
      if (
        !effectiveCompanyId ||
        !subscription ||
        subscription.companyId !== effectiveCompanyId
      ) {
        return res.status(403).json({ error: "La transacción no pertenece a la empresa activa" });
      }

      const localTransaction =
        (await storage.getTransactionByWompiId(transaction.id)) ||
        (await storage.getTransactionByReference(transaction.reference));
      if (
        localTransaction &&
        (localTransaction.companyId !== effectiveCompanyId ||
          localTransaction.subscriptionId !== subscription.id ||
          localTransaction.wompiReference !== transaction.reference ||
          (localTransaction.wompiTransactionId !== null &&
            localTransaction.wompiTransactionId !== transaction.id))
      ) {
        return res.status(403).json({ error: "La transacción no pertenece a la empresa activa" });
      }

      // Si fue aprobada y la suscripción aún no está activa, activarla
      // (fallback en caso de que el webhook llegue tarde)
      if (transaction.status === "APPROVED" && localTransaction) {
        logger.info(
          { subscriptionId, transactionId },
          "[Wompi] Activando suscripción via polling (webhook tardío)"
        );
        await activateSubscriptionAfterPse(subscription.id, transaction, localTransaction);
      }

      res.json({
        id: transaction.id,
        status: transaction.status,
        reference: transaction.reference,
        amountInCents: transaction.amount_in_cents,
        currency: transaction.currency,
        paymentMethod: transaction.payment_method_type,
        createdAt: transaction.created_at,
        finalizedAt: transaction.finalized_at,
      });
    } catch (error: any) {
      logger.error({ error: error.message }, "[Wompi] Error consultando estado de transacción");
      res.status(500).json({ error: "No se pudo consultar el estado del pago" });
    }
  });

  // ==========================================================================
  // POST /api/wompi/webhook — Receptor de eventos Wompi
  // ==========================================================================
  app.post("/api/wompi/webhook", webhookRateLimiter, async (req, res) => {
    try {
      if (!isWompiEnabled()) {
        return res.status(200).json({ received: true, ignored: "wompi_disabled" });
      }
      const event = req.body as WompiWebhookEvent;

      if (!event?.event || !event?.data?.transaction) {
        logger.warn("[Wompi-Webhook] Payload inválido recibido");
        return res.status(400).json({ error: "Payload inválido" });
      }

      // Verificar firma de integridad
      const signatureValid = verifyWebhookSignature(event);
      if (!signatureValid) {
        logger.warn(
          { event: event.event, transactionId: event.data?.transaction?.id },
          "[Wompi-Webhook] FIRMA INVÁLIDA — ignorando evento"
        );
        return res.status(401).json({ error: "Firma inválida" });
      }

      const { transaction } = event.data;

      logger.info(
        { event: event.event, transactionId: transaction.id, status: transaction.status, reference: transaction.reference },
        "[Wompi-Webhook] Evento recibido"
      );

      // Solo procesar transacciones PSE de suscripción SST
      if (!transaction.reference?.startsWith("sst-pse-")) {
        logger.info({ reference: transaction.reference }, "[Wompi-Webhook] Referencia no SST — ignorando");
        return res.status(200).json({ received: true });
      }

      if (event.event !== "transaction.updated") {
        return res.status(200).json({ received: true });
      }

      if (transaction.status === "APPROVED") {
        const subscriptionId = extractSubscriptionId(transaction.reference);
        if (!subscriptionId) {
          throw new Error("No se pudo extraer subscriptionId de la referencia");
        }

        const localTransaction =
          (await storage.getTransactionByWompiId(transaction.id)) ||
          (await storage.getTransactionByReference(transaction.reference));
        if (!localTransaction) {
          throw new Error("Transacción PSE no encontrada en el almacenamiento local");
        }

        await activateSubscriptionAfterPse(subscriptionId, transaction, localTransaction);
      } else if (
        transaction.status === "DECLINED" ||
        transaction.status === "ERROR" ||
        transaction.status === "VOIDED"
      ) {
        const localTransaction =
          (await storage.getTransactionByWompiId(transaction.id)) ||
          (await storage.getTransactionByReference(transaction.reference));
        if (localTransaction && localTransaction.status === "PENDING") {
          await storage.updateTransaction(localTransaction.id, {
            status: transaction.status,
            failedAt: new Date(),
            wompiErrorCode: transaction.status,
            wompiStatusMessage: `Wompi reportó estado ${transaction.status}`,
          });
        }
        logger.warn(
          { transactionId: transaction.id, status: transaction.status, reference: transaction.reference },
          "[Wompi-Webhook] Transacción PSE rechazada o con error"
        );
        // No bloqueamos la empresa por un pago fallido — el cron de expiración lo maneja
      }
      return res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error({ error: error.message }, "[Wompi-Webhook] Error procesando evento");
      return res.status(500).json({ error: "Error procesando el evento" });
    }
  });
}
