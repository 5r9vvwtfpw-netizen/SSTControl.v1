/**
 * ePayco PSE — transferencia bancaria únicamente.
 *
 * Este flujo no usa Smart Checkout porque ese checkout puede mostrar otros
 * medios de pago. La API bancaria directa de ePayco limita la operación a PSE.
 */

import type { Express, Request } from "express";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import logger from "../lib/logger";
import { paymentOperationLimiter } from "../middleware/rate-limit";
import { getSubscriptionStatus } from "../middleware/subscription-check";
import { userRoleEnum } from "@shared/schema";
import {
  createEpaycoPseTransaction,
  getEpaycoClientIp,
  getEpaycoPseBanks,
  getEpaycoPseTransaction,
  isEpaycoConfigured,
  isEpaycoTestMode,
  normalizeEpaycoStatus,
  validateEpaycoConfirmationSignature,
} from "../services/epayco";
import type { EpaycoPseLookup } from "../services/epayco";

type EpaycoPaymentRow = {
  id: string;
  company_id: string;
  subscription_id: string;
  invoice: string;
  ticket_id: string | null;
  transaction_id: string | null;
  ref_payco: string | null;
  amount: number;
  currency: string;
  status: string;
  response: string | null;
  purchase_type: string;
  role: string | null;
};

function getEffectiveCompanyId(req: any): string | null {
  if (req.user?.role === "lso" || req.user?.role === "lso_externo") {
    return req.validatedLsoCompanyId || null;
  }
  if (req.user?.role === "superadmin") {
    const headerCompanyId = req.headers["x-company-id"] as string | undefined;
    const queryCompanyId = req.query?.companyId as string | undefined;
    if (headerCompanyId) return headerCompanyId;
    if (queryCompanyId) return queryCompanyId;
  }
  return req.user?.companyId || null;
}

function getBaseUrl(): string {
  // En desarrollo, APP_URL puede apuntar al dominio publicado (está compartida
  // con producción). Priorizar el dominio del preview evita enviar allí los
  // retornos y confirmaciones de las transacciones de prueba.
  if (process.env.NODE_ENV !== "production" && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }

  return (
    process.env.APP_URL ||
    (process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "http://localhost:5000")
  );
}

function getRequestValue(req: Request, key: string): string {
  const bodyValue = (req.body as Record<string, unknown> | undefined)?.[key];
  const queryValue = (req.query as Record<string, unknown> | undefined)?.[key];
  const value = bodyValue ?? queryValue ?? "";
  return Array.isArray(value) ? String(value[0] ?? "") : String(value);
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "Cliente", lastName: "SST" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

async function ensureEpaycoTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS epayco_pse_transactions (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL,
      subscription_id varchar NOT NULL,
      invoice varchar NOT NULL UNIQUE,
      ticket_id varchar,
      transaction_id varchar UNIQUE,
      ref_payco varchar UNIQUE,
      amount integer NOT NULL,
      currency varchar NOT NULL DEFAULT 'COP',
      status varchar NOT NULL DEFAULT 'PENDING',
      response varchar,
      response_reason varchar,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now(),
      paid_at timestamp
    )
  `);
  await db.execute(sql`
    ALTER TABLE epayco_pse_transactions
    ADD COLUMN IF NOT EXISTS purchase_type varchar NOT NULL DEFAULT 'subscription',
    ADD COLUMN IF NOT EXISTS role varchar
  `);
}

async function getPaymentByReference(reference: string): Promise<EpaycoPaymentRow | null> {
  if (!reference) return null;
  const result = await db.execute(sql`
    SELECT id, company_id, subscription_id, invoice, ticket_id, transaction_id,
           ref_payco, amount, currency, status, response, purchase_type, role
    FROM epayco_pse_transactions
    WHERE invoice = ${reference}
       OR transaction_id = ${reference}
       OR ref_payco = ${reference}
    LIMIT 1
  `);
  return (result.rows[0] as EpaycoPaymentRow | undefined) || null;
}

function matchesVerifiedPayment(payment: EpaycoPaymentRow, verified: EpaycoPseLookup): boolean {
  return (
    verified.invoice === payment.invoice &&
    !!payment.ref_payco &&
    verified.refPayco === payment.ref_payco &&
    !!payment.transaction_id &&
    verified.transactionId === payment.transaction_id &&
    Number.isFinite(verified.amount) &&
    verified.amount === Number(payment.amount) &&
    verified.currency === payment.currency &&
    verified.test === isEpaycoTestMode()
  );
}

async function grantExtraSeatAfterEpayco(
  payment: EpaycoPaymentRow,
  transactionId: string,
  refPayco: string,
  response: string,
  reason: string,
): Promise<boolean> {
  if (!payment.role) throw new Error("El pago no tiene un rol de asiento adicional");

  return db.transaction(async (tx) => {
    // Atomically claim the approved invoice before granting its seat. Concurrent
    // confirmations for the same invoice can only pass this update once.
    const claimed = await tx.execute(sql`
      UPDATE epayco_pse_transactions
      SET status = 'APPROVED',
          response = ${response},
          response_reason = ${reason},
          transaction_id = ${transactionId},
          ref_payco = ${refPayco},
          paid_at = now(),
          updated_at = now()
      WHERE id = ${payment.id} AND status <> 'APPROVED'
      RETURNING company_id, role
    `);
    const row = claimed.rows[0] as { company_id: string; role: string } | undefined;
    if (!row) return false;

    // Serialize purchases for one company/role as company_extra_seats does not
    // have a unique company+role constraint in existing installations.
    await tx.execute(sql`
      SELECT pg_advisory_xact_lock(hashtext(${row.company_id}), hashtext(${row.role}))
    `);
    const existing = await tx.execute(sql`
      SELECT id, extra_seats
      FROM company_extra_seats
      WHERE company_id = ${row.company_id} AND role = ${row.role} AND status = 'active'
      ORDER BY created_at
      LIMIT 1
      FOR UPDATE
    `);
    const seat = existing.rows[0] as { id: string; extra_seats: number } | undefined;
    if (seat) {
      await tx.execute(sql`
        UPDATE company_extra_seats
        SET extra_seats = extra_seats + 1, updated_at = now()
        WHERE id = ${seat.id}
      `);
    } else {
      await tx.execute(sql`
        INSERT INTO company_extra_seats (
          company_id, role, extra_seats, price_per_seat_cop, status
        ) VALUES (${row.company_id}, ${row.role}, 1, 10000, 'active')
      `);
    }
    return true;
  });
}

async function activateSubscriptionAfterEpayco(
  payment: EpaycoPaymentRow,
  transactionId: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const locked = await tx.execute(sql`
      SELECT status FROM epayco_pse_transactions WHERE id = ${payment.id} FOR UPDATE
    `);
    if (locked.rows[0]?.status === 'APPROVED') return;
    const subscription = await storage.getSubscription(payment.subscription_id);
    if (!subscription || subscription.companyId !== payment.company_id) {
      throw new Error("Suscripción no encontrada para el pago ePayco");
    }
    const now = new Date();
    const nextPeriodEnd = new Date(now);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
    await storage.updateSubscription(payment.subscription_id, {
      status: "active" as any,
      currentPeriodStart: now,
      currentPeriodEnd: nextPeriodEnd,
      lastPaymentDate: now,
      nextPaymentDate: nextPeriodEnd,
      trialEnd: null,
    });
    await storage.ensurePricingPluginSync(subscription.companyId, "active", null);
    await tx.execute(sql`
      UPDATE epayco_pse_transactions
      SET status = 'APPROVED',
          response = 'Aceptada',
          transaction_id = ${transactionId},
          paid_at = now(),
          updated_at = now()
      WHERE id = ${payment.id}
    `);
  });
}

export async function registerEpaycoRoutes(app: Express): Promise<void> {
  await ensureEpaycoTable();
  const providerLookupCache = new Map<string, { until: number; result: EpaycoPseLookup | null }>();

  app.get("/api/epayco/estado", requireAuth, (_req, res) => {
    res.json({
      configured: isEpaycoConfigured(),
      test: isEpaycoTestMode(),
      method: "PSE",
    });
  });

  app.get("/api/epayco/pse/transaccion", requireAuth, async (req: any, res) => {
    const companyId = getEffectiveCompanyId(req);
    if (!companyId) return res.status(403).json({ error: "Usuario no asociado a una empresa" });

    const invoice = typeof req.query.invoice === "string" ? req.query.invoice : null;
    if (invoice !== null && (!invoice || invoice.length > 255)) {
      return res.status(400).json({ error: "Referencia de pago inválida" });
    }

    const invoiceFilter = invoice ? sql`AND invoice = ${invoice}` : sql``;
    const result = await db.execute(sql`
      SELECT id, company_id, subscription_id, invoice, status, purchase_type, role,
             response, response_reason, updated_at, ticket_id, transaction_id,
             ref_payco, amount, currency
      FROM epayco_pse_transactions
      WHERE company_id = ${companyId} ${invoiceFilter}
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const payment = result.rows[0] as (EpaycoPaymentRow & {
      response_reason: string | null;
      updated_at: Date;
    }) | undefined;
    if (!payment) return res.status(404).json({ error: "No se encontró el pago PSE" });

    let providerStatus: EpaycoPseLookup["status"] | null = null;
    let providerReason: string | null = null;
    if (payment.status !== "APPROVED" && payment.ticket_id) {
      const key = String(payment.invoice);
      const cached = providerLookupCache.get(key);
      let lookup = cached && cached.until > Date.now() ? cached.result : null;
      if (!cached || cached.until <= Date.now()) {
        try {
          lookup = await getEpaycoPseTransaction(String(payment.ticket_id));
          if (!matchesVerifiedPayment(payment, lookup)) {
            logger.warn({ invoice: key }, "[ePayco] Consulta PSE no coincide con el pago local");
            lookup = null;
          }
        } catch (error: any) {
          logger.warn({ invoice: key, error: error.message }, "[ePayco] No se pudo consultar estado PSE");
          lookup = null;
        }
        if (providerLookupCache.size >= 200) providerLookupCache.clear();
        providerLookupCache.set(key, { until: Date.now() + 30_000, result: lookup });
      }
      providerStatus = lookup?.status ?? null;
      providerReason = lookup?.reason ?? null;
      if (lookup?.status === "APPROVED") {
        try {
          if (payment.purchase_type === "extra_seat") {
            await grantExtraSeatAfterEpayco(
              payment, lookup.transactionId, lookup.refPayco,
              "Aceptada", lookup.reason || "Aprobada por ePayco"
            );
          } else if (payment.purchase_type === "subscription") {
            await activateSubscriptionAfterEpayco(payment, lookup.transactionId);
          } else {
            throw new Error("Tipo de compra PSE no reconocido");
          }
          payment.status = "APPROVED";
          providerLookupCache.delete(key);
        } catch (error: any) {
          logger.error({ invoice: key, error: error.message }, "[ePayco] No se pudo aplicar el pago PSE verificado");
          return res.status(503).json({ error: "El pago fue aprobado, pero aún no se pudo activar. Reintente consultar su estado." });
        }
      }
    }

    return res.json({
      invoice: payment.invoice,
      status: payment.status,
      purchaseType: payment.purchase_type,
      reason: payment.response_reason,
      updatedAt: payment.updated_at,
      providerStatus,
      providerReason,
    });
  });

  app.get("/api/epayco/pse/bancos", paymentOperationLimiter, requireAuth, async (_req, res) => {
    if (!isEpaycoConfigured()) {
      return res.status(503).json({
        error: "epayco_not_configured",
        message: "El pago por transferencia bancaria aún no está configurado.",
      });
    }

    try {
      res.json({ banks: await getEpaycoPseBanks() });
    } catch (error: any) {
      logger.error({ error: error.message }, "[ePayco] Error obteniendo bancos PSE");
      res.status(502).json({ error: "No se pudo obtener la lista de bancos PSE" });
    }
  });

  app.post("/api/epayco/pse/iniciar", paymentOperationLimiter, requireAuth, async (req: any, res) => {
    if (!isEpaycoConfigured()) {
      return res.status(503).json({
        error: "epayco_not_configured",
        message: "El pago por transferencia bancaria aún no está configurado.",
      });
    }

    const bodySchema = z.object({
      purchaseType: z.enum(["subscription", "extra_seat"]).optional().default("subscription"),
      role: z.string().optional(),
      bankCode: z.string().min(1, "Seleccione un banco"),
      userType: z.enum(["0", "1"]),
      idType: z.enum(["CC", "CE", "NIT", "PP", "TI"]),
      idNumber: z.string().min(5, "Número de documento inválido").max(30),
      email: z.string().email("Email inválido"),
      fullName: z.string().min(3, "Nombre inválido").max(120),
      cellPhone: z.string().trim().regex(/^[0-9]{10}$/, "Ingrese un celular colombiano de 10 dígitos"),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.errors.map((error) => error.message),
      });
    }

    const companyId = getEffectiveCompanyId(req);
    if (!companyId) return res.status(403).json({ error: "Usuario no asociado a una empresa" });
    if (["lso", "lso_externo", "trabajador"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Este portal no requiere pagos de suscripción" });
    }

    let extraSeatRole: string | null = null;
    if (parsed.data.purchaseType === "extra_seat") {
      const user = req.user;
      if (!user?.companyId || user.companyId !== companyId) {
        return res.status(403).json({ error: "La compra debe asociarse a la empresa de su cuenta" });
      }
      if (user.role !== "admin" && user.role !== "superusuario") {
        return res.status(403).json({ error: "No tiene permisos para comprar usuarios adicionales" });
      }
      const role = parsed.data.role;
      const excludedRoles = new Set(["superadmin", "soporte", "lso_externo"]);
      if (!role || !userRoleEnum.enumValues.includes(role as (typeof userRoleEnum.enumValues)[number]) || excludedRoles.has(role)) {
        return res.status(400).json({ error: "Rol de usuario adicional inválido" });
      }
      extraSeatRole = role;
    }

    const subscription = await storage.getSubscriptionByCompany(companyId);
    if (!subscription) {
      return res.status(404).json({ error: "No tiene una suscripción. Contacte a soporte." });
    }

    if (parsed.data.purchaseType === "extra_seat" && !["active", "trial"].includes(subscription.status)) {
      return res.status(403).json({
        error: "Se requiere suscripción activa",
        message: "Debes tener una suscripción activa para agregar usuarios adicionales.",
      });
    }
    if (parsed.data.purchaseType === "subscription" && !subscription.contractAcceptedAt) {
      return res.status(403).json({
        error: "Debe aceptar el contrato antes de continuar con el pago.",
        redirectTo: "/checkout",
      });
    }
    if (parsed.data.purchaseType === "subscription") {
      const liveStatus = await getSubscriptionStatus(companyId);
      if (subscription.status === "active" && liveStatus.isActive) {
        return res.status(409).json({ error: "La suscripción ya está activa. Verifique el estado antes de iniciar otro pago." });
      }
    }
    const pendingPayment = await db.execute(sql`
      SELECT invoice FROM epayco_pse_transactions
      WHERE company_id = ${companyId}
        AND purchase_type = ${parsed.data.purchaseType}
        AND status = 'PENDING'
        AND ticket_id IS NOT NULL
        AND created_at > now() - interval '30 minutes'
      LIMIT 1
    `);
    if (pendingPayment.rows.length > 0) {
      return res.status(409).json({
        error: "Hay un pago PSE pendiente de confirmación. Revise su estado antes de iniciar otro.",
      });
    }

    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });

    const forwardedFor = req.headers["x-forwarded-for"];
    let clientIp: string;
    try {
      clientIp = getEpaycoClientIp(
        typeof forwardedFor === "string" ? forwardedFor : undefined,
        req.ip,
      );
    } catch (error: any) {
      logger.warn("[ePayco] No se recibió una IP pública del pagador");
      return res.status(503).json({ error: error.message });
    }

    const companyAny = company as any;
    const quoteBase = Number(companyAny.quoteBaseMonthlyPrice || 0);
    const quoteCurrent = Number(companyAny.quoteCurrentPeriodPrice || 0);
    if (parsed.data.purchaseType === "subscription" && quoteBase > 0 && companyAny.quoteCurrentPeriodPrice === 0) {
      return res.status(409).json({
        error: "Esta cotización tiene descuento total. Active su prueba gratuita desde Mi suscripción.",
      });
    }
    const amount = parsed.data.purchaseType === "extra_seat"
      ? 10000
      : quoteCurrent > 0 && quoteCurrent < quoteBase ? quoteCurrent : quoteBase;
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount))) {
      return res.status(400).json({
        error: "Su empresa no tiene una cotización de precio válida para pagar.",
      });
    }

    const invoice = `sst-pse-${subscription.id}-${Date.now()}`;
    await db.execute(sql`
      INSERT INTO epayco_pse_transactions (
        company_id, subscription_id, invoice, amount, currency, status, purchase_type, role
      ) VALUES (
        ${companyId}, ${subscription.id}, ${invoice}, ${Math.round(amount)}, 'COP', 'PENDING',
        ${parsed.data.purchaseType}, ${extraSeatRole}
      )
    `);

    const { firstName, lastName } = splitFullName(parsed.data.fullName);
    const baseUrl = getBaseUrl();

    try {
      const result = await createEpaycoPseTransaction({
        bankCode: parsed.data.bankCode,
        invoice,
        description: parsed.data.purchaseType === "extra_seat"
          ? `Usuario adicional (${extraSeatRole}) — ${company.name}`
          : `Suscripción mensual SST Colombia — ${company.name}`,
        amount: Math.round(amount),
        documentType: parsed.data.idType,
        documentNumber: parsed.data.idNumber,
        personType: parsed.data.userType,
        firstName,
        lastName,
        email: parsed.data.email,
        cellPhone: parsed.data.cellPhone,
        ip: clientIp,
        responseUrl: `${baseUrl}/pago-pse/retorno?provider=epayco&invoice=${encodeURIComponent(invoice)}`,
        confirmationUrl: `${baseUrl}/api/epayco/pse/confirmacion`,
      });

      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET ticket_id = ${result.ticketId},
            transaction_id = ${result.transactionId},
            ref_payco = ${result.refPayco},
            updated_at = now()
        WHERE invoice = ${invoice}
      `);

      return res.json({
        invoice,
        ticketId: result.ticketId,
        transactionId: result.transactionId,
        bankRedirectUrl: result.bankRedirectUrl,
        amount,
        currency: "COP",
        status: "PENDING",
      });
    } catch (error: any) {
      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET status = 'ERROR', response = ${error.message}, updated_at = now()
        WHERE invoice = ${invoice}
      `);
      logger.error({ error: error.message, companyId, invoice }, "[ePayco] Error iniciando PSE");
      return res.status(502).json({ error: error.message || "No se pudo iniciar el pago PSE" });
    }
  });

  const confirmationHandler = async (req: Request, res: any) => {
    const invoice = getRequestValue(req, "x_id_invoice") || getRequestValue(req, "x_extra1");
    const refPayco = getRequestValue(req, "x_ref_payco") || getRequestValue(req, "ref_payco");
    const transactionId = getRequestValue(req, "x_transaction_id");
    const amount = getRequestValue(req, "x_amount");
    const currency = getRequestValue(req, "x_currency_code");
    const signature = getRequestValue(req, "x_signature");
    const response = getRequestValue(req, "x_response");
    const reason = getRequestValue(req, "x_response_reason_text");

    if (!invoice || !refPayco || !transactionId || !amount || !currency || !signature) {
      return res.status(400).send("Invalid confirmation payload");
    }

    if (
      !validateEpaycoConfirmationSignature({
        refPayco,
        transactionId,
        amount,
        currency,
        signature,
      })
    ) {
      logger.warn({ invoice, transactionId }, "[ePayco] Firma de confirmación inválida");
      return res.status(400).send("Invalid signature");
    }

    const payment = await getPaymentByReference(invoice);
    if (!payment) {
      logger.warn({ invoice, transactionId }, "[ePayco] Confirmación sin pago local");
      return res.status(200).send("OK");
    }

    if (payment.ref_payco && payment.ref_payco !== refPayco) {
      logger.warn({ invoice }, "[ePayco] La referencia firmada no coincide con el pago local");
      return res.status(400).send("Invalid reference");
    }
    if (payment.status === "APPROVED") return res.status(200).send("OK");

    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(amount);
    if (!Number.isFinite(receivedAmount) || Math.round(receivedAmount) !== expectedAmount || currency !== "COP") {
      logger.warn(
        { invoice, expectedAmount, receivedAmount, currency },
        "[ePayco] Confirmación con monto o moneda inválida"
      );
      return res.status(400).send("Invalid amount");
    }

    const normalizedStatus = normalizeEpaycoStatus(response);
    if (normalizedStatus === "APPROVED") {
      if (!payment.ticket_id) {
        logger.warn({ invoice }, "[ePayco] Pago sin identificador consultable en el proveedor");
        return res.status(503).send("Retry");
      }
      let verified: EpaycoPseLookup;
      try {
        verified = await getEpaycoPseTransaction(payment.ticket_id);
      } catch (error: any) {
        logger.warn({ invoice, error: error.message }, "[ePayco] No se pudo verificar la aprobación con el proveedor");
        return res.status(503).send("Retry");
      }
      if (verified.status !== "APPROVED" || !matchesVerifiedPayment(payment, verified)) {
        logger.warn({ invoice }, "[ePayco] La aprobación no coincide con la consulta directa al proveedor");
        return res.status(503).send("Retry");
      }
      try {
        if (payment.purchase_type === "extra_seat") {
          await grantExtraSeatAfterEpayco(payment, verified.transactionId, verified.refPayco, response, reason);
        } else if (payment.purchase_type === "subscription") {
          await activateSubscriptionAfterEpayco(payment, verified.transactionId);
        } else {
          throw new Error("Tipo de compra PSE no reconocido");
        }
      } catch (error: any) {
        logger.error({ error: error.message, invoice }, "[ePayco] Error procesando pago aprobado");
        return res.status(500).send("Retry");
      }
    } else {
      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET status = ${normalizedStatus},
            response = ${response},
            response_reason = ${reason},
            updated_at = now()
        WHERE id = ${payment.id} AND status <> 'APPROVED'
      `);
    }

    return res.status(200).send("OK");
  };

  app.post("/api/epayco/pse/confirmacion", confirmationHandler);
  app.get("/api/epayco/pse/confirmacion", confirmationHandler);
}