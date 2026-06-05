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
import { sql } from "drizzle-orm";
import { z } from "zod";
import logger from "../lib/logger";
import { webhookRateLimiter } from "../middleware/rate-limit";
import {
  isWompiConfigured,
  getWompiPublicKey,
  isWompiSandbox,
  getFinancialInstitutions,
  createPseTransaction,
  getTransaction,
  verifyWebhookSignature,
  type WompiWebhookEvent,
} from "../services/wompi";

// Referencia PSE — formato: sst-pse-{subscriptionId}-{timestamp}
function buildReference(subscriptionId: string): string {
  return `sst-pse-${subscriptionId}-${Date.now()}`;
}

function extractSubscriptionId(reference: string): string | null {
  const match = reference.match(/^sst-pse-([a-f0-9-]+)-\d+$/);
  return match ? match[1] : null;
}

// Activar/renovar suscripción tras pago PSE aprobado
async function activateSubscriptionAfterPse(
  subscriptionId: string,
  transactionId: string,
  amountInCents: number
): Promise<void> {
  const subscription = await storage.getSubscription(subscriptionId);
  if (!subscription) {
    logger.error({ subscriptionId }, "[Wompi-Webhook] Suscripción no encontrada");
    return;
  }

  const now = new Date();
  const nextPeriodEnd = new Date(now);
  nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

  // Actualizar tabla principal de suscripciones
  await storage.updateSubscription(subscriptionId, {
    status: "active" as any,
    currentPeriodStart: now,
    currentPeriodEnd: nextPeriodEnd,
    lastPaymentDate: now,
    nextPaymentDate: nextPeriodEnd,
    trialEnd: null,
  });

  // Sincronizar con pricing_plugin_subscriptions (fuente de verdad del middleware de bloqueo)
  await storage.ensurePricingPluginSync(subscription.companyId, "active", null);

  // Registrar transacción de pago en la tabla de auditoría
  try {
    await db.execute(sql`
      INSERT INTO payment_transactions (
        id, company_id, subscription_id,
        wompi_transaction_id, wompi_reference,
        type, status, amount, currency,
        wompi_payment_method, paid_at,
        description
      ) VALUES (
        gen_random_uuid(),
        ${subscription.companyId},
        ${subscriptionId},
        ${transactionId},
        ${`wompi-${transactionId}`},
        'subscription_payment',
        'APPROVED',
        ${amountInCents},
        'COP',
        'PSE',
        ${now.toISOString()},
        'Pago PSE mensual SST Colombia'
      )
      ON CONFLICT (wompi_transaction_id) DO NOTHING
    `);
  } catch (err: any) {
    // No bloquear si la tabla no existe o hay duplicado — el pago ya fue procesado
    logger.warn({ err: err.message }, "[Wompi-Webhook] No se pudo insertar en payment_transactions");
  }

  logger.info(
    { subscriptionId, companyId: subscription.companyId, nextPeriodEnd },
    "[Wompi-Webhook] Suscripción activada/renovada exitosamente vía PSE"
  );
}

export function registerWompiRoutes(app: Express) {
  // ==========================================================================
  // GET /api/wompi/estado — Estado de configuración Wompi
  // ==========================================================================
  app.get("/api/wompi/estado", requireAuth, (_req, res) => {
    const configured = isWompiConfigured();
    res.json({
      configured,
      sandbox: isWompiSandbox(),
      publicKey: configured ? getWompiPublicKey() : null,
    });
  });

  // ==========================================================================
  // GET /api/wompi/bancos — Lista de bancos PSE disponibles
  // ==========================================================================
  app.get("/api/wompi/bancos", requireAuth, async (_req, res) => {
    if (!isWompiConfigured()) {
      return res.status(503).json({
        error: "wompi_not_configured",
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
  app.post("/api/wompi/pse/iniciar", requireAuth, async (req, res) => {
    if (!isWompiConfigured()) {
      return res.status(503).json({
        error: "wompi_not_configured",
        message: "El pago por PSE no está disponible. Use tarjeta de crédito/débito.",
      });
    }

    const bodySchema = z.object({
      bankCode: z.string().min(1, "Seleccione un banco"),
      userType: z.number().int().min(0).max(1), // 0=natural, 1=jurídica
      idType: z.enum(["CC", "CE", "NIT", "PP", "TI"]),
      idNumber: z.string().min(5, "Número de documento inválido"),
      email: z.string().email("Email inválido"),
      fullName: z.string().min(3, "Nombre inválido"),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { bankCode, userType, idType, idNumber, email, fullName } = parsed.data;

    try {
      const companyId = req.user!.companyId;
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
      const quoteBase = companyAny.quoteBaseMonthlyPrice as number | null;
      const quoteCurrent = companyAny.quoteCurrentPeriodPrice as number | null;

      if (!quoteBase || quoteBase <= 0) {
        return res.status(400).json({
          error: "Su empresa no tiene una cotización de precio. Visite sst-colombia.com.co para obtener una cotización antes de proceder al pago.",
        });
      }

      // El precio en pesos (quoteBase está en centavos de COP)
      const monthlyPriceCOP = quoteCurrent != null && quoteCurrent > 0 ? quoteCurrent : quoteBase;

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

      const transaction = await createPseTransaction({
        amountInCents: monthlyPriceCOP,
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

      // URL del banco donde el cliente completa el pago
      const bankRedirectUrl = transaction.payment_method?.extra?.async_payment_url;
      if (!bankRedirectUrl) {
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
        amountInCents: monthlyPriceCOP,
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
    if (!isWompiConfigured()) {
      return res.status(503).json({ error: "Wompi no configurado" });
    }

    try {
      const { transactionId } = req.params;
      if (!transactionId || transactionId.length < 5) {
        return res.status(400).json({ error: "ID de transacción inválido" });
      }

      const transaction = await getTransaction(transactionId);

      // Si fue aprobada y la suscripción aún no está activa, activarla
      // (fallback en caso de que el webhook llegue tarde)
      if (transaction.status === "APPROVED") {
        const subscriptionId = extractSubscriptionId(transaction.reference);
        if (subscriptionId) {
          const subscription = await storage.getSubscription(subscriptionId);
          if (subscription && subscription.status !== "active") {
            logger.info(
              { subscriptionId, transactionId },
              "[Wompi] Activando suscripción via polling (webhook tardío)"
            );
            await activateSubscriptionAfterPse(subscriptionId, transactionId, transaction.amount_in_cents);
          }
        }
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
    // Responder 200 inmediatamente para confirmar recepción a Wompi
    res.status(200).json({ received: true });

    try {
      const event = req.body as WompiWebhookEvent;

      if (!event?.event || !event?.data?.transaction) {
        logger.warn("[Wompi-Webhook] Payload inválido recibido");
        return;
      }

      // Verificar firma de integridad
      const signatureValid = verifyWebhookSignature(event);
      if (!signatureValid) {
        logger.warn(
          { event: event.event, transactionId: event.data?.transaction?.id },
          "[Wompi-Webhook] FIRMA INVÁLIDA — ignorando evento"
        );
        return;
      }

      const { transaction } = event.data;

      logger.info(
        { event: event.event, transactionId: transaction.id, status: transaction.status, reference: transaction.reference },
        "[Wompi-Webhook] Evento recibido"
      );

      // Solo procesar transacciones PSE de suscripción SST
      if (!transaction.reference?.startsWith("sst-pse-")) {
        logger.info({ reference: transaction.reference }, "[Wompi-Webhook] Referencia no SST — ignorando");
        return;
      }

      if (event.event !== "transaction.updated") {
        return;
      }

      if (transaction.status === "APPROVED") {
        const subscriptionId = extractSubscriptionId(transaction.reference);
        if (!subscriptionId) {
          logger.error({ reference: transaction.reference }, "[Wompi-Webhook] No se pudo extraer subscriptionId de la referencia");
          return;
        }

        await activateSubscriptionAfterPse(subscriptionId, transaction.id, transaction.amount_in_cents);
      } else if (transaction.status === "DECLINED" || transaction.status === "ERROR") {
        logger.warn(
          { transactionId: transaction.id, status: transaction.status, reference: transaction.reference },
          "[Wompi-Webhook] Transacción PSE rechazada o con error"
        );
        // No bloqueamos la empresa por un pago fallido — el cron de expiración lo maneja
      }
    } catch (error: any) {
      logger.error({ error: error.message }, "[Wompi-Webhook] Error procesando evento");
    }
  });
}
