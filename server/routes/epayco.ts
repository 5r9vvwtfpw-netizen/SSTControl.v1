/**
 * ePayco PSE — transferencia bancaria únicamente.
 *
 * Este flujo no usa Smart Checkout porque ese checkout puede mostrar otros
 * medios de pago. La API bancaria directa de ePayco limita la operación a PSE.
 */

import crypto from "crypto";
import { isIP } from "net";
import type { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import logger from "../lib/logger";
import { paymentOperationLimiter } from "../middleware/rate-limit";
import { getSubscriptionStatus } from "../middleware/subscription-check";
import { userRoleEnum, type Subscription } from "@shared/schema";
import {
  createEpaycoPseTransaction,
  EpaycoPseRejectedError,
  getEpaycoClientIp,
  getEpaycoPseBanks,
  getEpaycoPseTransaction,
  isEpaycoConfigured,
  isEpaycoTestMode,
  normalizeEpaycoStatus,
  validateEpaycoConfirmationSignature,
} from "../services/epayco";
import type { EpaycoPseLookup } from "../services/epayco";
import { sendEpaycoPaymentLinkEmail } from "../services/payment-link-email";
import {
  getVerifiedWorkerBillingQuote,
  WorkerBillingQuoteError,
} from "../services/worker-billing-quote";
import {
  workerPricingConfigMatchesQuote,
  workerPricingSnapshotMatchesQuote,
} from "../services/company-worker-pricing";
import { assertWorkerPricingSchemaReady } from "../services/worker-pricing-schema-state";
import { hasAcceptedPaymentContract } from "../services/payment-contract-acceptance";

const paymentLinkReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

async function requireAcceptedPaymentContract(subscription: Subscription, res: Response): Promise<boolean> {
  try {
    if (await hasAcceptedPaymentContract(subscription)) return true;
    res.status(403).json({
      error: "Debe aceptar el contrato antes de continuar con el pago.",
      redirectTo: "/checkout",
    });
  } catch (error: any) {
    logger.error({ companyId: subscription.companyId, error: error.message }, "[ePayco] No se pudo verificar aceptación del contrato");
    res.status(503).json({ error: "No se pudo verificar el contrato. Intente nuevamente; no se inició ningún cobro." });
  }
  return false;
}

function requireWorkerPricingSchema(_req: any, res: any, next: any) {
  try {
    assertWorkerPricingSchemaReady();
    next();
  } catch (error: any) {
    return res.status(503).json({ error: error.message });
  }
}

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

function getPaymentLinkAppUrl(): string {
  const configuredUrl = process.env.APP_URL?.trim();
  if (!configuredUrl) throw new Error("APP_URL must be configured for payment links");
  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("APP_URL is invalid for payment links");
  }
  const hostname = url.hostname.toLowerCase();
  const bareHostname = hostname.replace(/^\[|\]$/g, "");
  const isPrivateIpv4 = (value: string) => {
    const octets = value.split(".").map(Number);
    const [first, second] = octets;
    return first === 0 || first === 10 || first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      first >= 224;
  };
  const ipVersion = isIP(bareHostname);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    (ipVersion === 4 && isPrivateIpv4(bareHostname)) ||
    (ipVersion === 6 && /^(?:fc|fd|fe[89ab]|::ffff:)/i.test(bareHostname))
  ) {
    throw new Error("Production payment links require a public HTTPS APP_URL");
  }
  return url.toString().replace(/\/+$/, "");
}

function getPaymentLinkToken(req: Request): string | null {
  const value = req.get("X-Payment-Link-Token");
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

async function lockSubscriptionPseInitiation(tx: any, companyId: string): Promise<boolean> {
  await tx.execute(sql`
    SELECT pg_advisory_xact_lock(hashtext(${companyId}), hashtext('epayco_subscription_pse_init'))
  `);
  const pending = await tx.execute(sql`
    SELECT invoice
    FROM epayco_pse_transactions
    WHERE company_id = ${companyId}
      AND purchase_type = 'subscription'
      AND status = 'PENDING'
    LIMIT 1
    FOR UPDATE
  `);
  return pending.rows.length === 0;
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
    ADD COLUMN IF NOT EXISTS billed_worker_count integer,
    ADD COLUMN IF NOT EXISTS role varchar,
    ADD COLUMN IF NOT EXISTS worker_pricing_mode varchar,
    ADD COLUMN IF NOT EXISTS worker_pricing_base_amount integer,
    ADD COLUMN IF NOT EXISTS billed_unit_price_cop numeric(14, 2),
    ADD COLUMN IF NOT EXISTS worker_discount_percent integer
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS epayco_pse_payment_links (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      token_hash varchar NOT NULL UNIQUE,
      company_id varchar NOT NULL,
      subscription_id varchar NOT NULL,
      amount integer NOT NULL,
      currency varchar NOT NULL DEFAULT 'COP',
      payment_invoice varchar UNIQUE,
      created_at timestamp NOT NULL DEFAULT now(),
      expires_at timestamp NOT NULL,
      sent_at timestamp NOT NULL DEFAULT now(),
      used_at timestamp,
      revoked_at timestamp
    )
  `);
  await db.execute(sql`
    ALTER TABLE epayco_pse_payment_links
    ADD COLUMN IF NOT EXISTS payment_invoice varchar,
    ADD COLUMN IF NOT EXISTS billed_worker_count integer,
    ADD COLUMN IF NOT EXISTS worker_pricing_mode varchar,
    ADD COLUMN IF NOT EXISTS worker_pricing_base_amount integer,
    ADD COLUMN IF NOT EXISTS billed_unit_price_cop numeric(14, 2),
    ADD COLUMN IF NOT EXISTS worker_discount_percent integer
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS epayco_pse_payment_links_company_created_idx
    ON epayco_pse_payment_links (company_id, created_at DESC)
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS epayco_pse_payment_links_invoice_idx
    ON epayco_pse_payment_links (payment_invoice)
    WHERE payment_invoice IS NOT NULL
  `);
}

function hashPaymentLinkToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function paymentLinkMatchesQuote(
  link: {
    amount: number;
    billed_worker_count: number | null;
    worker_pricing_mode: string | null;
    worker_pricing_base_amount: number | null;
    billed_unit_price_cop: string | number | null;
    worker_discount_percent: number | null;
  },
  quote: Awaited<ReturnType<typeof getVerifiedWorkerBillingQuote>>,
): boolean {
  return workerPricingSnapshotMatchesQuote(quote, {
    amount: Number(link.amount),
    employeeCount: Number(link.billed_worker_count),
    mode: link.worker_pricing_mode,
    publicBaseAmount: link.worker_pricing_base_amount == null
      ? null
      : Number(link.worker_pricing_base_amount),
    effectiveUnitPriceCop: link.billed_unit_price_cop,
    discountPercent: link.worker_discount_percent == null
      ? null
      : Number(link.worker_discount_percent),
  });
}

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

async function saveVerifiedSubscriptionQuote(
  companyId: string,
  quote: Awaited<ReturnType<typeof getVerifiedWorkerBillingQuote>>,
): Promise<void> {
  await db.execute(sql`
    UPDATE companies
    SET quote_base_monthly_price = ${quote.baseMonthlyPrice},
        quote_current_period_price = ${quote.currentPeriodPrice},
        quote_discount_duration_months = ${quote.discountDurationMonths},
        quote_coupon_code = ${quote.couponCode}
    WHERE id = ${companyId}
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

    // An approved PSE payment must also appear in the same billing history as
    // other subscription payments. The locked payment row makes this idempotent
    // across a callback and a simultaneous status poll.
    const note = `Suscripción mensual pagada por PSE ePayco. Referencia: ${payment.invoice}`;
    const existingInvoice = await tx.execute(sql`
      SELECT id FROM invoices
      WHERE company_id = ${payment.company_id} AND notes = ${note}
      LIMIT 1
    `);
    if (!existingInvoice.rows.length) {
      const billedWorkerResult = await tx.execute(sql`
        SELECT billed_worker_count, worker_pricing_mode, worker_pricing_base_amount,
               billed_unit_price_cop, worker_discount_percent
        FROM epayco_pse_transactions WHERE id = ${payment.id}
      `);
      const billingSnapshot = billedWorkerResult.rows[0] as {
        billed_worker_count: number | null;
        worker_pricing_mode: string | null;
        worker_pricing_base_amount: number | null;
        billed_unit_price_cop: string | number | null;
        worker_discount_percent: number | null;
      } | undefined;
      const billedWorkerCount = Number(billingSnapshot?.billed_worker_count);
      const companyResult = await tx.execute(sql`
        SELECT name, nit, contact_email, address, ciiu_code,
               number_of_workers, number_of_vehicles
        FROM companies WHERE id = ${payment.company_id}
      `);
      const company = companyResult.rows[0] as {
        name: string; nit: string | null; contact_email: string | null;
        address: string | null; ciiu_code: string | null;
        number_of_workers: number | null; number_of_vehicles: number | null;
      } | undefined;
      if (!company) throw new Error("Empresa no encontrada para el comprobante PSE");

      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('sst_invoice_number'))`);
      const year = now.getUTCFullYear();
      const prefix = `SST-${year}-`;
      const last = await tx.execute(sql`
        SELECT invoice_number FROM invoices
        WHERE invoice_number LIKE ${prefix + "%"}
        ORDER BY invoice_number DESC LIMIT 1
      `);
      const lastNumber = Number(String(last.rows[0]?.invoice_number || "").split("-").pop()) || 0;
      const invoiceNumber = `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
      const amount = Number(payment.amount);
      const subtotal = Math.round(amount / 1.19);
      const hasWorkerPricingSnapshot =
        ["standard", "fixed", "percentage"].includes(billingSnapshot?.worker_pricing_mode || "") &&
        Number.isSafeInteger(billedWorkerCount) &&
        billedWorkerCount > 0 &&
        Number.isFinite(Number(billingSnapshot?.billed_unit_price_cop));
      let invoiceLineItems: unknown[];
      if (hasWorkerPricingSnapshot) {
        const unitPriceCop = Number(billingSnapshot!.billed_unit_price_cop);
        const workerLineTotal = Math.floor(amount / billedWorkerCount) * billedWorkerCount;
        const roundingRemainder = amount - workerLineTotal;
        invoiceLineItems = [{
          description: `Suscripción Software SST Colombia — ${billedWorkerCount} trabajadores` +
            ` (tarifa efectiva ${unitPriceCop.toFixed(2)} COP por trabajador)` +
            (billingSnapshot!.worker_pricing_mode === "fixed" ? " (tarifa fija)" :
              billingSnapshot!.worker_pricing_mode === "percentage"
                ? ` (descuento negociado ${billingSnapshot!.worker_discount_percent}%)`
                : ""),
          quantity: billedWorkerCount,
          unitPrice: Math.floor(amount / billedWorkerCount),
          total: workerLineTotal,
          pricingMode: billingSnapshot!.worker_pricing_mode,
          billedWorkerCount,
          discountPercent: billingSnapshot!.worker_discount_percent,
          publicBaseAmount: billingSnapshot!.worker_pricing_base_amount,
          effectiveUnitPriceCop: unitPriceCop,
          paymentAmount: amount,
        }];
        if (roundingRemainder > 0) {
          invoiceLineItems.push({
            description: "Ajuste de redondeo para conciliar el total facturado",
            quantity: 1,
            unitPrice: roundingRemainder,
            total: roundingRemainder,
            pricingAdjustment: "rounding",
          });
        }
      } else {
        invoiceLineItems = [{
            description: "Suscripción Software SST Colombia - Mensual",
            quantity: 1, unitPrice: amount, total: amount,
        }];
      }
      const lineItems = JSON.stringify(invoiceLineItems);

      await tx.execute(sql`
        INSERT INTO invoices (
          company_id, subscription_id, invoice_number, status,
          subtotal, tax_amount, total, currency,
          period_start, period_end, issue_date, due_date, paid_date,
          customer_name, customer_nit, customer_email, customer_address,
          line_items, notes, snapshot_ciiu_code,
          snapshot_number_of_workers, snapshot_number_of_vehicles
        ) VALUES (
          ${payment.company_id}, ${payment.subscription_id}, ${invoiceNumber}, 'paid',
          ${subtotal}, ${amount - subtotal}, ${amount}, ${payment.currency},
          ${now}, ${nextPeriodEnd}, ${now}, ${now}, ${now},
          ${company.name}, ${company.nit || "N/A"}, ${company.contact_email || ""},
          ${company.address || ""}, ${lineItems}, ${note}, ${company.ciiu_code},
          ${Number.isSafeInteger(billedWorkerCount) && billedWorkerCount > 0
            ? billedWorkerCount
            : company.number_of_workers}, ${company.number_of_vehicles}
        )
      `);
    }
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
      } else if (lookup?.status === "DECLINED" || lookup?.status === "ERROR") {
        await db.execute(sql`
          UPDATE epayco_pse_transactions
          SET status = ${lookup.status},
              response = ${lookup.reason || lookup.status},
              response_reason = ${lookup.reason},
              updated_at = now()
          WHERE id = ${payment.id} AND status <> 'APPROVED'
        `);
        payment.status = lookup.status;
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

  app.get("/api/epayco/pse/cotizacion", paymentLinkReadLimiter, requireAuth, requireWorkerPricingSchema, async (req: any, res) => {
    const companyId = getEffectiveCompanyId(req);
    if (!companyId) return res.status(403).json({ error: "Usuario no asociado a una empresa" });
    if (["lso", "lso_externo", "trabajador"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Este portal no requiere pagos de suscripción" });
    }
    const subscription = await storage.getSubscriptionByCompany(companyId);
    if (!subscription) return res.status(404).json({ error: "No tiene una suscripción. Contacte a soporte." });
    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });
    try {
      const quote = await getVerifiedWorkerBillingQuote(company, subscription.id);
      return res.json(quote);
    } catch (error: any) {
      logger.warn({ companyId, error: error.message }, "[ePayco] No se pudo calcular cotización vigente");
      return res.status(error instanceof WorkerBillingQuoteError ? 409 : 503).json({
        error: error instanceof WorkerBillingQuoteError
          ? error.message
          : "No se pudo verificar el precio vigente. No se inició ningún cobro.",
      });
    }
  });

  app.post("/api/epayco/pse/enlace/enviar", paymentOperationLimiter, requireAuth, requireWorkerPricingSchema, async (req: any, res) => {
    if (process.env.NODE_ENV !== "production") {
      return res.status(503).json({ error: "El envío de enlaces de pago no está disponible en este entorno." });
    }
    if (!isEpaycoConfigured()) {
      return res.status(503).json({ error: "El pago por transferencia bancaria aún no está configurado." });
    }
    let appUrl: string;
    try {
      appUrl = getPaymentLinkAppUrl();
    } catch (error: any) {
      logger.error({ error: error.message }, "[ePayco] APP_URL inválida para enlaces PSE");
      return res.status(503).json({ error: "El envío de enlaces de pago no está configurado." });
    }
    const companyId = getEffectiveCompanyId(req);
    if (!companyId) return res.status(403).json({ error: "Usuario no asociado a una empresa" });
    if (["lso", "lso_externo", "trabajador"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Este portal no requiere pagos de suscripción" });
    }

    const subscription = await storage.getSubscriptionByCompany(companyId);
    if (!subscription) return res.status(404).json({ error: "No tiene una suscripción. Contacte a soporte." });
    if (!await requireAcceptedPaymentContract(subscription, res)) return;
    const liveStatus = await getSubscriptionStatus(companyId);
    if (subscription.status === "active" && liveStatus.isActive) {
      return res.status(409).json({ error: "La suscripción ya está activa. Verifique el estado antes de iniciar otro pago." });
    }

    const pendingPayment = await db.execute(sql`
      SELECT invoice FROM epayco_pse_transactions
      WHERE company_id = ${companyId}
        AND purchase_type = 'subscription'
        AND status = 'PENDING'
      LIMIT 1
    `);
    if (pendingPayment.rows.length) {
      return res.status(409).json({ error: "Hay un pago PSE pendiente de confirmación. Revise su estado antes de iniciar otro." });
    }

    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });
    const recipient = String(company.contactEmail || "").trim();
    if (!recipient || !z.string().email().safeParse(recipient).success) {
      return res.status(409).json({ error: "La empresa no tiene un correo de contacto válido registrado." });
    }
    let quote: Awaited<ReturnType<typeof getVerifiedWorkerBillingQuote>>;
    try {
      quote = await getVerifiedWorkerBillingQuote(company, subscription.id);
    } catch (error: any) {
      logger.warn({ companyId, error: error.message }, "[ePayco] No se pudo verificar cotización para enlace");
      return res.status(error instanceof WorkerBillingQuoteError ? 409 : 503).json({
        error: error instanceof WorkerBillingQuoteError
          ? error.message
          : "No se pudo verificar el precio vigente. No se creó ningún enlace.",
      });
    }
    const amount = quote.paymentAmount;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(409).json({
        error: "Su empresa no tiene una cotización de precio válida para pagar.",
      });
    }
    await saveVerifiedSubscriptionQuote(companyId, quote);

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = hashPaymentLinkToken(token);
    const issuedLink = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${companyId}), hashtext('epayco_pse_payment_link'))`);
      const pricingRowResult = await tx.execute(sql`
        SELECT worker_pricing_mode, worker_unit_price_cop, worker_discount_percent
        FROM companies WHERE id = ${companyId} FOR SHARE
      `);
      const pricingRow = pricingRowResult.rows[0] as {
        worker_pricing_mode: string;
        worker_unit_price_cop: number | null;
        worker_discount_percent: number | null;
      } | undefined;
      if (!pricingRow || !workerPricingConfigMatchesQuote(quote, {
        mode: (pricingRow.worker_pricing_mode || "standard") as "standard" | "fixed" | "percentage",
        unitPriceCop: pricingRow.worker_unit_price_cop == null ? null : Number(pricingRow.worker_unit_price_cop),
        discountPercent: pricingRow.worker_discount_percent == null ? null : Number(pricingRow.worker_discount_percent),
      })) {
        return "stale" as const;
      }
      const recent = await tx.execute(sql`
        SELECT id FROM epayco_pse_payment_links
        WHERE company_id = ${companyId} AND sent_at > now() - interval '60 seconds'
        LIMIT 1
      `);
      if (recent.rows.length) return "rate_limited" as const;

      await tx.execute(sql`
        INSERT INTO epayco_pse_payment_links (
          token_hash, company_id, subscription_id, amount, currency, billed_worker_count,
          worker_pricing_mode, worker_pricing_base_amount, billed_unit_price_cop,
          worker_discount_percent, expires_at
        ) VALUES (
          ${tokenHash}, ${companyId}, ${subscription.id}, ${amount}, 'COP',
          ${quote.employeeCount}, ${quote.pricingMode}, ${quote.publicBaseMonthlyPrice},
          ${quote.effectiveUnitPriceCop}, ${quote.discountPercent}, now() + interval '24 hours'
        )
      `);
      return "issued" as const;
    });
    if (issuedLink === "stale") {
      return res.status(409).json({ error: "La tarifa cambió durante la cotización. Revise el importe antes de solicitar un enlace." });
    }
    if (issuedLink === "rate_limited") {
      return res.status(429).json({ error: "Espere un minuto antes de solicitar otro enlace de pago." });
    }

    const paymentUrl = `${appUrl}/pago-pse/enlace#${encodeURIComponent(token)}`;
    try {
      await sendEpaycoPaymentLinkEmail({
        recipient,
        companyName: company.name,
        amount,
        currency: "COP",
        paymentUrl,
      });
    } catch (error: any) {
      await db.execute(sql`
        UPDATE epayco_pse_payment_links SET revoked_at = now()
        WHERE token_hash = ${tokenHash}
      `);
      logger.error({ companyId, error: error.message }, "[ePayco] No se pudo enviar enlace PSE");
      return res.status(502).json({ error: "No se pudo enviar el enlace de pago. Intente de nuevo más tarde." });
    }
    await db.execute(sql`
      UPDATE epayco_pse_payment_links
      SET revoked_at = now()
      WHERE company_id = ${companyId}
        AND token_hash <> ${tokenHash}
        AND revoked_at IS NULL
    `);

    return res.json({
      message: "Enlace de pago enviado al correo de contacto registrado.",
      recipientMasked: maskEmail(recipient),
    });
  });

  app.get("/api/epayco/pse/enlace/detalle", paymentLinkReadLimiter, requireWorkerPricingSchema, async (req, res) => {
    const token = getPaymentLinkToken(req);
    if (!token) return res.status(404).json({ error: "Enlace de pago no válido o vencido." });
    const tokenHash = hashPaymentLinkToken(token);
    const result = await db.execute(sql`
      SELECT l.company_id, l.subscription_id, l.amount, l.currency, l.billed_worker_count,
             l.worker_pricing_mode, l.worker_pricing_base_amount, l.billed_unit_price_cop,
             l.worker_discount_percent, l.expires_at, l.used_at, l.revoked_at,
             c.name AS company_name
      FROM epayco_pse_payment_links l
      JOIN companies c ON c.id = l.company_id
      WHERE l.token_hash = ${tokenHash}
      LIMIT 1
    `);
    const link = result.rows[0] as {
      company_id: string; subscription_id: string; amount: number; currency: string;
      billed_worker_count: number | null;
      worker_pricing_mode: string | null; worker_pricing_base_amount: number | null;
      billed_unit_price_cop: string | number | null; worker_discount_percent: number | null;
      expires_at: Date; used_at: Date | null; revoked_at: Date | null; company_name: string;
    } | undefined;
    if (!link || (link.revoked_at && !link.used_at) ||
      (!link.used_at && new Date(link.expires_at).getTime() <= Date.now())) {
      return res.status(404).json({ error: "Enlace de pago no válido o vencido." });
    }

    if (!link.used_at) {
      if (
        link.billed_worker_count === null ||
        link.worker_pricing_mode === null ||
        link.worker_pricing_base_amount === null ||
        link.billed_unit_price_cop === null
      ) {
        return res.status(409).json({ error: "Este enlace fue emitido antes de la cotización vigente. Solicite un nuevo enlace de pago." });
      }
      const subscription = await storage.getSubscription(link.subscription_id);
      const company = await storage.getCompany(link.company_id);
      if (!subscription || !company) {
        return res.status(404).json({ error: "No se encontró la suscripción asociada al enlace." });
      }
      try {
        const quote = await getVerifiedWorkerBillingQuote(company, subscription.id);
        if (!paymentLinkMatchesQuote(link, quote)) {
          return res.status(409).json({ error: "El precio del enlace cambió. Solicite un nuevo enlace de pago." });
        }
      } catch (error: any) {
        logger.warn({ companyId: link.company_id, error: error.message }, "[ePayco] No se pudo verificar cotización del enlace");
        return res.status(error instanceof WorkerBillingQuoteError ? 409 : 503).json({
          error: error instanceof WorkerBillingQuoteError
            ? error.message
            : "No se pudo verificar el precio vigente. No se inició ningún cobro.",
        });
      }
    }

    let banks: Awaited<ReturnType<typeof getEpaycoPseBanks>> = [];
    if (!link.used_at && process.env.NODE_ENV !== "test") {
      if (!isEpaycoConfigured()) {
        return res.status(503).json({ error: "El pago por transferencia bancaria aún no está configurado." });
      }
      try {
        banks = await getEpaycoPseBanks();
      } catch (error: any) {
        logger.error({ error: error.message }, "[ePayco] Error obteniendo bancos para enlace PSE");
        return res.status(502).json({ error: "No se pudo obtener la lista de bancos PSE" });
      }
    }

    let status = link.used_at ? "USED" : "READY";
    if (link.used_at) {
      const payment = await db.execute(sql`
        SELECT status FROM epayco_pse_transactions WHERE invoice = (
          SELECT payment_invoice FROM epayco_pse_payment_links WHERE token_hash = ${tokenHash}
        ) LIMIT 1
      `);
      if (payment.rows[0]?.status) status = String(payment.rows[0].status);
    }
    return res.json({
      companyName: link.company_name,
      amount: Number(link.amount),
      currency: link.currency,
      banks,
      status,
    });
  });

  app.post("/api/epayco/pse/enlace/iniciar", paymentOperationLimiter, requireWorkerPricingSchema, async (req, res) => {
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
    if (process.env.NODE_ENV === "test") {
      return res.status(503).json({ error: "El inicio de pagos está deshabilitado en pruebas." });
    }
    if (!isEpaycoConfigured()) {
      return res.status(503).json({ error: "El pago por transferencia bancaria aún no está configurado." });
    }
    let appUrl: string;
    try {
      appUrl = getPaymentLinkAppUrl();
    } catch (error: any) {
      logger.error({ error: error.message }, "[ePayco] APP_URL inválida para iniciar enlace PSE");
      return res.status(503).json({ error: "El inicio de pagos no está configurado." });
    }

    const token = getPaymentLinkToken(req);
    if (!token) return res.status(404).json({ error: "Enlace de pago no válido o vencido." });
    const tokenHash = hashPaymentLinkToken(token);
    const linkResult = await db.execute(sql`
      SELECT company_id, subscription_id, amount, currency, billed_worker_count,
             worker_pricing_mode, worker_pricing_base_amount, billed_unit_price_cop,
             worker_discount_percent, expires_at, used_at, revoked_at
      FROM epayco_pse_payment_links
      WHERE token_hash = ${tokenHash}
      LIMIT 1
    `);
    const link = linkResult.rows[0] as {
      company_id: string; subscription_id: string; amount: number; currency: string;
      billed_worker_count: number | null;
      worker_pricing_mode: string | null; worker_pricing_base_amount: number | null;
      billed_unit_price_cop: string | number | null; worker_discount_percent: number | null;
      expires_at: Date; used_at: Date | null; revoked_at: Date | null;
    } | undefined;
    if (!link || link.revoked_at || link.used_at || new Date(link.expires_at).getTime() <= Date.now()) {
      return res.status(410).json({ error: "Este enlace ya fue utilizado o venció." });
    }
    if (
      link.billed_worker_count === null ||
      link.worker_pricing_mode === null ||
      link.worker_pricing_base_amount === null ||
      link.billed_unit_price_cop === null
    ) {
      return res.status(409).json({ error: "Este enlace fue emitido antes de la cotización vigente. Solicite un nuevo enlace de pago." });
    }

    const subscription = await storage.getSubscription(link.subscription_id);
    if (!subscription || subscription.companyId !== link.company_id) {
      return res.status(404).json({ error: "No se encontró la suscripción asociada al enlace." });
    }
    if (!await requireAcceptedPaymentContract(subscription, res)) return;
    const liveStatus = await getSubscriptionStatus(link.company_id);
    if (subscription.status === "active" && liveStatus.isActive) {
      return res.status(409).json({ error: "La suscripción ya está activa. Verifique el estado antes de iniciar otro pago." });
    }
    const company = await storage.getCompany(link.company_id);
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });
    let currentQuote: Awaited<ReturnType<typeof getVerifiedWorkerBillingQuote>>;
    try {
      currentQuote = await getVerifiedWorkerBillingQuote(company, subscription.id);
    } catch (error: any) {
      logger.warn({ companyId: link.company_id, error: error.message }, "[ePayco] No se pudo verificar cotización del enlace");
      return res.status(error instanceof WorkerBillingQuoteError ? 409 : 503).json({
        error: error instanceof WorkerBillingQuoteError
          ? error.message
          : "No se pudo verificar el precio vigente. No se inició ningún cobro.",
      });
    }
    if (!paymentLinkMatchesQuote(link, currentQuote)) {
      return res.status(409).json({ error: "El precio de la suscripción cambió. Solicite un nuevo enlace de pago." });
    }

    const forwardedFor = req.headers["x-forwarded-for"];
    let clientIp: string;
    try {
      clientIp = getEpaycoClientIp(
        typeof forwardedFor === "string" ? forwardedFor : undefined,
        req.ip,
      );
    } catch (error: any) {
      return res.status(503).json({ error: error.message });
    }

    const start = await db.transaction(async (tx) => {
      if (!(await lockSubscriptionPseInitiation(tx, link.company_id))) {
        return { kind: "pending" as const };
      }
      const pricingRowResult = await tx.execute(sql`
        SELECT worker_pricing_mode, worker_unit_price_cop, worker_discount_percent
        FROM companies WHERE id = ${link.company_id} FOR SHARE
      `);
      const pricingRow = pricingRowResult.rows[0] as {
        worker_pricing_mode: string;
        worker_unit_price_cop: number | null;
        worker_discount_percent: number | null;
      } | undefined;
      if (!pricingRow || !workerPricingConfigMatchesQuote(currentQuote, {
        mode: (pricingRow.worker_pricing_mode || "standard") as "standard" | "fixed" | "percentage",
        unitPriceCop: pricingRow.worker_unit_price_cop == null ? null : Number(pricingRow.worker_unit_price_cop),
        discountPercent: pricingRow.worker_discount_percent == null ? null : Number(pricingRow.worker_discount_percent),
      })) {
        return { kind: "stale" as const };
      }
      const lockedLinkResult = await tx.execute(sql`
        SELECT company_id, subscription_id, amount, currency, billed_worker_count,
               worker_pricing_mode, worker_pricing_base_amount, billed_unit_price_cop,
               worker_discount_percent
        FROM epayco_pse_payment_links
        WHERE token_hash = ${tokenHash}
          AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now()
        FOR UPDATE
      `);
      const lockedLink = lockedLinkResult.rows[0] as {
        company_id: string;
        subscription_id: string;
        amount: number;
        currency: string;
        billed_worker_count: number | null;
        worker_pricing_mode: string | null;
        worker_pricing_base_amount: number | null;
        billed_unit_price_cop: string | number | null;
        worker_discount_percent: number | null;
      } | undefined;
      if (!lockedLink) return { kind: "unavailable" as const };
      if (!paymentLinkMatchesQuote(lockedLink, currentQuote)) return { kind: "stale" as const };

      const claimed = await tx.execute(sql`
        UPDATE epayco_pse_payment_links
        SET used_at = now()
        WHERE token_hash = ${tokenHash}
          AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now()
        RETURNING company_id, subscription_id, amount, currency, billed_worker_count,
                  worker_pricing_mode, worker_pricing_base_amount, billed_unit_price_cop,
                  worker_discount_percent
      `);
      const claimedLink = claimed.rows[0] as {
        company_id: string; subscription_id: string; amount: number; currency: string;
        billed_worker_count: number | null;
        worker_pricing_mode: string | null; worker_pricing_base_amount: number | null;
        billed_unit_price_cop: string | number | null; worker_discount_percent: number | null;
      } | undefined;
      if (!claimedLink) return { kind: "unavailable" as const };

      const invoice = `sst-pse-${claimedLink.subscription_id}-${Date.now()}`;
      await tx.execute(sql`
        INSERT INTO epayco_pse_transactions (
          company_id, subscription_id, invoice, amount, currency, status, purchase_type,
          billed_worker_count, worker_pricing_mode, worker_pricing_base_amount,
          billed_unit_price_cop, worker_discount_percent
        ) VALUES (
          ${claimedLink.company_id}, ${claimedLink.subscription_id}, ${invoice},
          ${Number(claimedLink.amount)}, ${claimedLink.currency}, 'PENDING', 'subscription',
          ${claimedLink.billed_worker_count}, ${claimedLink.worker_pricing_mode},
          ${claimedLink.worker_pricing_base_amount}, ${claimedLink.billed_unit_price_cop},
          ${claimedLink.worker_discount_percent}
        )
      `);
      await tx.execute(sql`
        UPDATE epayco_pse_payment_links
        SET payment_invoice = ${invoice}
        WHERE token_hash = ${tokenHash} AND used_at IS NOT NULL
      `);
      return { kind: "claimed" as const, claimedLink, invoice };
    });
    if (start.kind === "pending") {
      return res.status(409).json({ error: "Hay un pago PSE pendiente de confirmación. Revise su estado antes de iniciar otro." });
    }
    if (start.kind === "stale") {
      return res.status(409).json({ error: "La tarifa cambió. Solicite un nuevo enlace de pago antes de continuar." });
    }
    if (start.kind === "unavailable") return res.status(410).json({ error: "Este enlace ya fue utilizado o venció." });
    const { claimedLink, invoice } = start;
    const { firstName, lastName } = splitFullName(parsed.data.fullName);
    try {
      const result = await createEpaycoPseTransaction({
        bankCode: parsed.data.bankCode,
        invoice,
        description: `Suscripción mensual SST Colombia — ${company.name}`,
        amount: Number(claimedLink.amount),
        documentType: parsed.data.idType,
        documentNumber: parsed.data.idNumber,
        personType: parsed.data.userType,
        firstName,
        lastName,
        email: parsed.data.email,
        cellPhone: parsed.data.cellPhone,
        ip: clientIp,
        responseUrl: `${appUrl}/pago-pse/enlace/retorno?invoice=${encodeURIComponent(invoice)}`,
        confirmationUrl: `${appUrl}/api/epayco/pse/confirmacion`,
      });
      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET ticket_id = ${result.ticketId},
            transaction_id = ${result.transactionId},
            ref_payco = ${result.refPayco},
            updated_at = now()
        WHERE invoice = ${invoice}
      `);
      return res.json({ bankRedirectUrl: result.bankRedirectUrl, invoice });
    } catch (error: any) {
      // A network timeout can occur after ePayco has accepted the request.
      // Keep this attempt pending until it can be reconciled; marking it ERROR
      // would let the company start a second charge for the same subscription.
      const definitelyRejected = error instanceof EpaycoPseRejectedError;
      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET status = ${definitelyRejected ? "ERROR" : "PENDING"},
            response = ${error.message}, updated_at = now()
        WHERE invoice = ${invoice}
      `);
      logger.error({ error: error.message, companyId: claimedLink.company_id, invoice }, "[ePayco] Error iniciando PSE desde enlace");
      return res.status(502).json({ error: definitelyRejected
        ? "No se pudo iniciar el pago PSE. Solicite un nuevo enlace."
        : "No se pudo confirmar el inicio del pago. No intente otro cobro hasta que soporte verifique esta transacción." });
    }
  });

  app.get("/api/epayco/pse/enlace/estado", paymentLinkReadLimiter, async (req, res) => {
    const token = getPaymentLinkToken(req);
    if (!token) return res.status(404).json({ error: "Enlace de pago no válido o vencido." });
    const result = await db.execute(sql`
      SELECT l.company_id, l.subscription_id, l.expires_at, l.used_at, l.revoked_at, l.payment_invoice,
             p.id, p.company_id AS payment_company_id, p.subscription_id AS payment_subscription_id,
             p.invoice, p.ticket_id, p.transaction_id, p.ref_payco, p.amount, p.currency,
             p.status, p.response, p.purchase_type, p.role
      FROM epayco_pse_payment_links l
      LEFT JOIN epayco_pse_transactions p ON p.invoice = l.payment_invoice
      WHERE l.token_hash = ${hashPaymentLinkToken(token)}
      LIMIT 1
    `);
    const row = result.rows[0] as ({
      company_id: string; subscription_id: string; expires_at: Date; used_at: Date | null; revoked_at: Date | null;
      payment_invoice: string | null;
      id: string | null; payment_company_id: string | null; payment_subscription_id: string | null;
      invoice: string | null; ticket_id: string | null; transaction_id: string | null; ref_payco: string | null;
      amount: number | null; currency: string | null; status: string | null; response: string | null;
      purchase_type: string | null; role: string | null;
    }) | undefined;
    if (!row || (row.revoked_at && !row.used_at)) return res.status(404).json({ error: "Enlace de pago no válido." });
    if (new Date(row.expires_at).getTime() <= Date.now() && !row.used_at) {
      return res.json({ status: "EXPIRED", providerStatus: null });
    }

    const payment = row.id && row.invoice && row.amount !== null && row.currency
      ? ({
          id: row.id,
          company_id: row.payment_company_id || row.company_id,
          subscription_id: row.payment_subscription_id || row.subscription_id,
          invoice: row.invoice,
          ticket_id: row.ticket_id,
          transaction_id: row.transaction_id,
          ref_payco: row.ref_payco,
          amount: Number(row.amount),
          currency: row.currency,
          status: row.status || "PENDING",
          response: row.response,
          purchase_type: row.purchase_type || "subscription",
          role: row.role,
        } satisfies EpaycoPaymentRow)
      : null;
    if (!payment) {
      return res.json({ status: row.used_at ? "PENDING" : "READY", providerStatus: null });
    }

    let providerStatus: EpaycoPseLookup["status"] | null = null;
    if (payment.status !== "APPROVED" && payment.ticket_id && process.env.NODE_ENV !== "test") {
      try {
        const verified = await getEpaycoPseTransaction(payment.ticket_id);
        if (matchesVerifiedPayment(payment, verified)) {
          providerStatus = verified.status;
          if (verified.status === "APPROVED") {
            await activateSubscriptionAfterEpayco(payment, verified.transactionId);
            payment.status = "APPROVED";
          } else if (verified.status === "DECLINED" || verified.status === "ERROR") {
            await db.execute(sql`
              UPDATE epayco_pse_transactions
              SET status = ${verified.status}, response = ${verified.reason || verified.status},
                  response_reason = ${verified.reason}, updated_at = now()
              WHERE id = ${payment.id} AND status <> 'APPROVED'
            `);
            payment.status = verified.status;
          }
        } else {
          logger.warn({ invoice: payment.invoice }, "[ePayco] Consulta por enlace PSE no coincide con el pago local");
        }
      } catch (error: any) {
        logger.warn({ invoice: payment.invoice, error: error.message }, "[ePayco] No se pudo consultar estado PSE del enlace");
        return res.status(503).json({ error: "No se pudo verificar el estado del pago. Intente de nuevo." });
      }
    } else if (payment.status === "APPROVED") {
      providerStatus = "APPROVED";
    }

    return res.json({ status: payment.status, providerStatus });
  });

  app.post("/api/epayco/pse/iniciar", paymentOperationLimiter, requireAuth, async (req: any, res) => {
    const bodySchema = z.object({
      purchaseType: z.enum(["subscription", "extra_seat"]).optional().default("subscription"),
      expectedAmount: z.number().int().nonnegative().optional(),
      expectedEmployeeCount: z.number().int().min(1).optional(),
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
    if (parsed.data.purchaseType === "subscription") {
      try {
        assertWorkerPricingSchemaReady();
      } catch (error: any) {
        return res.status(503).json({ error: error.message });
      }
    }
    if (!isEpaycoConfigured()) {
      return res.status(503).json({
        error: "epayco_not_configured",
        message: "El pago por transferencia bancaria aún no está configurado.",
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
    if (parsed.data.purchaseType === "subscription" && !await requireAcceptedPaymentContract(subscription, res)) return;
    if (parsed.data.purchaseType === "subscription") {
      const liveStatus = await getSubscriptionStatus(companyId);
      if (subscription.status === "active" && liveStatus.isActive) {
        return res.status(409).json({ error: "La suscripción ya está activa. Verifique el estado antes de iniciar otro pago." });
      }
    }
    if (parsed.data.purchaseType === "extra_seat") {
      const pendingPayment = await db.execute(sql`
        SELECT invoice FROM epayco_pse_transactions
        WHERE company_id = ${companyId}
          AND purchase_type = 'extra_seat'
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
    }

    const company = await storage.getCompany(companyId);
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });

    let verifiedSubscriptionQuote: Awaited<ReturnType<typeof getVerifiedWorkerBillingQuote>> | null = null;
    let quoteWorkerCount: number | null = null;
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

    let amount: number;
    if (parsed.data.purchaseType === "extra_seat") {
      amount = 10000;
    } else {
      if (parsed.data.expectedAmount === undefined) {
        return res.status(400).json({ error: "Debe revisar la cotización vigente antes de iniciar el pago." });
      }
      if (parsed.data.expectedEmployeeCount === undefined) {
        return res.status(400).json({ error: "Debe confirmar la cantidad de trabajadores facturables antes de iniciar el pago." });
      }
      try {
        verifiedSubscriptionQuote = await getVerifiedWorkerBillingQuote(company, subscription.id);
      } catch (error: any) {
        logger.warn({ companyId, error: error.message }, "[ePayco] No se pudo verificar cotización antes de iniciar PSE");
        return res.status(error instanceof WorkerBillingQuoteError ? 409 : 503).json({
          error: error instanceof WorkerBillingQuoteError
            ? error.message
            : "No se pudo verificar el precio vigente. No se inició ningún cobro.",
        });
      }
      if (
        verifiedSubscriptionQuote.paymentAmount !== parsed.data.expectedAmount ||
        verifiedSubscriptionQuote.employeeCount !== parsed.data.expectedEmployeeCount
      ) {
        return res.status(409).json({
          error: "La cotización cambió. Revise el nuevo importe antes de continuar.",
          quote: {
            employeeCount: verifiedSubscriptionQuote.employeeCount,
            paymentAmount: verifiedSubscriptionQuote.paymentAmount,
          },
        });
      }
      if (verifiedSubscriptionQuote.paymentAmount <= 0) {
        return res.status(409).json({
          error: "Esta cotización tiene descuento total. Active su prueba gratuita desde Mi suscripción.",
        });
      }
      amount = verifiedSubscriptionQuote.paymentAmount;
      quoteWorkerCount = verifiedSubscriptionQuote.employeeCount;
    }
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount))) {
      return res.status(400).json({
        error: "Su empresa no tiene una cotización de precio válida para pagar.",
      });
    }

    const invoice = `sst-pse-${subscription.id}-${Date.now()}`;
    const inserted = await db.transaction(async (tx) => {
      if (
        parsed.data.purchaseType === "subscription" &&
        !(await lockSubscriptionPseInitiation(tx, companyId))
      ) {
        return { kind: "pending" as const };
      }
      if (parsed.data.purchaseType === "subscription") {
        if (!verifiedSubscriptionQuote) return { kind: "pending" as const };
        const pricingResult = await tx.execute(sql`
          SELECT worker_pricing_mode, worker_unit_price_cop, worker_discount_percent
          FROM companies
          WHERE id = ${companyId}
          FOR SHARE
        `);
        const pricingRow = pricingResult.rows[0] as {
          worker_pricing_mode: string | null;
          worker_unit_price_cop: number | null;
          worker_discount_percent: number | null;
        } | undefined;
        if (!pricingRow || !workerPricingConfigMatchesQuote(verifiedSubscriptionQuote, {
          mode: (pricingRow.worker_pricing_mode || "standard") as "standard" | "fixed" | "percentage",
          unitPriceCop: pricingRow.worker_unit_price_cop == null ? null : Number(pricingRow.worker_unit_price_cop),
          discountPercent: pricingRow.worker_discount_percent == null ? null : Number(pricingRow.worker_discount_percent),
        })) {
          return { kind: "stale" as const };
        }
        await tx.execute(sql`
          UPDATE companies
          SET quote_base_monthly_price = ${verifiedSubscriptionQuote.baseMonthlyPrice},
              quote_current_period_price = ${verifiedSubscriptionQuote.currentPeriodPrice},
              quote_discount_duration_months = ${verifiedSubscriptionQuote.discountDurationMonths},
              quote_coupon_code = ${verifiedSubscriptionQuote.couponCode}
          WHERE id = ${companyId}
        `);
      }
      await tx.execute(sql`
        INSERT INTO epayco_pse_transactions (
          company_id, subscription_id, invoice, amount, currency, status, purchase_type, role,
            billed_worker_count, worker_pricing_mode, worker_pricing_base_amount,
            billed_unit_price_cop, worker_discount_percent
        ) VALUES (
          ${companyId}, ${subscription.id}, ${invoice}, ${Math.round(amount)}, 'COP', 'PENDING',
          ${parsed.data.purchaseType}, ${extraSeatRole},
            ${parsed.data.purchaseType === 'subscription' ? quoteWorkerCount : null},
            ${parsed.data.purchaseType === 'subscription' ? verifiedSubscriptionQuote?.pricingMode ?? null : null},
            ${parsed.data.purchaseType === 'subscription' ? verifiedSubscriptionQuote?.publicBaseMonthlyPrice ?? null : null},
            ${parsed.data.purchaseType === 'subscription' ? verifiedSubscriptionQuote?.effectiveUnitPriceCop ?? null : null},
            ${parsed.data.purchaseType === 'subscription' ? verifiedSubscriptionQuote?.discountPercent ?? null : null}
        )
      `);
      return { kind: "inserted" as const };
    });
    if (inserted.kind === "stale") {
      return res.status(409).json({
        error: "La tarifa cambió mientras se preparaba el pago. Revise la cotización antes de continuar.",
      });
    }
    if (inserted.kind === "pending") {
      return res.status(409).json({
        error: "Hay un pago PSE pendiente de confirmación. Revise su estado antes de iniciar otro.",
      });
    }

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
      const definitelyRejected = error instanceof EpaycoPseRejectedError;
      await db.execute(sql`
        UPDATE epayco_pse_transactions
        SET status = ${definitelyRejected ? "ERROR" : "PENDING"},
            response = ${error.message}, updated_at = now()
        WHERE invoice = ${invoice}
      `);
      logger.error({ error: error.message, companyId, invoice }, "[ePayco] Error iniciando PSE");
      return res.status(502).json({ error: definitelyRejected
        ? "No se pudo iniciar el pago PSE. Intente de nuevo más tarde."
        : "No se pudo confirmar el inicio del pago. No intente otro cobro hasta que soporte verifique esta transacción." });
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