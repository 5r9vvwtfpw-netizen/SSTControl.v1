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
import {
  createEpaycoPseTransaction,
  getEpaycoClientIp,
  getEpaycoPseBanks,
  isEpaycoConfigured,
  isEpaycoTestMode,
  normalizeEpaycoStatus,
  validateEpaycoConfirmationSignature,
} from "../services/epayco";

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
}

async function getPaymentByReference(reference: string): Promise<EpaycoPaymentRow | null> {
  if (!reference) return null;
  const result = await db.execute(sql`
    SELECT id, company_id, subscription_id, invoice, ticket_id, transaction_id,
           ref_payco, amount, currency, status, response
    FROM epayco_pse_transactions
    WHERE invoice = ${reference}
       OR transaction_id = ${reference}
       OR ref_payco = ${reference}
    LIMIT 1
  `);
  return (result.rows[0] as EpaycoPaymentRow | undefined) || null;
}

async function activateSubscriptionAfterEpayco(
  payment: EpaycoPaymentRow,
  transactionId: string
): Promise<void> {
  const subscription = await storage.getSubscription(payment.subscription_id);
  if (!subscription) {
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

  await db.execute(sql`
    UPDATE epayco_pse_transactions
    SET status = 'APPROVED',
        response = 'Aceptada',
        transaction_id = COALESCE(${transactionId || null}, transaction_id),
        paid_at = now(),
        updated_at = now()
    WHERE id = ${payment.id}
  `);
}

export async function registerEpaycoRoutes(app: Express): Promise<void> {
  await ensureEpaycoTable();

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
      SELECT invoice, status, response_reason, updated_at
      FROM epayco_pse_transactions
      WHERE company_id = ${companyId} ${invoiceFilter}
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const payment = result.rows[0];
    if (!payment) return res.status(404).json({ error: "No se encontró el pago PSE" });

    return res.json({
      invoice: payment.invoice,
      status: payment.status,
      reason: payment.response_reason,
      updatedAt: payment.updated_at,
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

    const forwardedFor = req.headers["x-forwarded-for"];
    let clientIp: string;
    try {
      clientIp = getEpaycoClientIp(
        typeof forwardedFor === "string" ? forwardedFor : undefined,
        req.ip
      );
    } catch (error: any) {
      logger.warn("[ePayco] No se recibió una IP pública del pagador");
      return res.status(503).json({ error: error.message });
    }

    const companyId = getEffectiveCompanyId(req);
    if (!companyId) return res.status(403).json({ error: "Usuario no asociado a una empresa" });

    const subscription = await storage.getSubscriptionByCompany(companyId);
    if (!subscription) {
      return res.status(404).json({ error: "No tiene una suscripción. Contacte a soporte." });
    }

    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });

    const companyAny = company as any;
    const quoteBase = Number(companyAny.quoteBaseMonthlyPrice || 0);
    const quoteCurrent = Number(companyAny.quoteCurrentPeriodPrice || 0);
    const amount = quoteCurrent > 0 ? quoteCurrent : quoteBase;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Su empresa no tiene una cotización de precio válida para pagar.",
      });
    }

    const invoice = `sst-pse-${subscription.id}-${Date.now()}`;
    await db.execute(sql`
      INSERT INTO epayco_pse_transactions (
        company_id, subscription_id, invoice, amount, currency, status
      ) VALUES (
        ${companyId}, ${subscription.id}, ${invoice}, ${Math.round(amount)}, 'COP', 'PENDING'
      )
    `);

    const { firstName, lastName } = splitFullName(parsed.data.fullName);
    const baseUrl = getBaseUrl();

    try {
      const result = await createEpaycoPseTransaction({
        bankCode: parsed.data.bankCode,
        invoice,
        description: `Suscripción mensual SST Colombia — ${company.name}`,
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
      try {
        await activateSubscriptionAfterEpayco(payment, transactionId);
      } catch (error: any) {
        logger.error({ error: error.message, invoice }, "[ePayco] Error activando suscripción");
        return res.status(500).send("Retry");
      }
    } else {
      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET status = ${normalizedStatus},
            response = ${response},
            response_reason = ${reason},
            transaction_id = ${transactionId},
            ref_payco = ${refPayco},
            updated_at = now()
        WHERE id = ${payment.id}
      `);
    }

    return res.status(200).send("OK");
  };

  app.post("/api/epayco/pse/confirmacion", confirmationHandler);
  app.get("/api/epayco/pse/confirmacion", confirmationHandler);
}