import { sql } from "drizzle-orm";
import { verifyRecalculateToken } from "../../plugins/landing-page-integration";
import { db } from "../db";
import {
  calculateWorkerPricingCharge,
  getCompanyWorkerPricing,
  type WorkerPricingMode,
} from "./company-worker-pricing";

export interface WorkerBillingQuote {
  employeeCount: number;
  baseMonthlyPrice: number;
  currentPeriodPrice: number;
  paymentAmount: number;
  publicBaseMonthlyPrice: number;
  effectiveUnitPriceCop: number;
  pricingMode: WorkerPricingMode;
  discountPercent: number | null;
  discountDurationMonths: number;
  couponCode: string | null;
  currency: "COP";
}

export class WorkerBillingQuoteError extends Error {}

/**
 * Quotes workers eligible for the upcoming payment. On the first PSE payment,
 * current_period_end is the cutoff for externally paid history. After PSE is
 * established, the latest approved transaction's created_at is the coverage
 * snapshot, so registrations made between initiation and approval are retained.
 * Retirees are included when they retired at/after the next cycle boundary, or
 * entered the app after the last paid coverage snapshot.
 */
export async function getVerifiedWorkerBillingQuote(
  company: { id: string; name: string; quoteCouponCode?: string | null },
  subscriptionId: string,
): Promise<WorkerBillingQuote> {
  const cutoffResult = await db.execute(sql`
    SELECT
      COALESCE(s.current_period_end, s.trial_end, s.current_period_start) AS next_cycle_start,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM epayco_pse_transactions
          WHERE company_id = s.company_id
            AND purchase_type = 'subscription'
            AND status = 'APPROVED'
        ) THEN (
          SELECT p.created_at
          FROM epayco_pse_transactions p
          WHERE p.company_id = s.company_id
            AND p.purchase_type = 'subscription'
            AND p.status = 'APPROVED'
          ORDER BY p.created_at DESC
          LIMIT 1
        )
        WHEN s.status = 'active' THEN s.current_period_end
        ELSE s.current_period_start
      END AS billing_cutoff
    FROM subscriptions s
    WHERE s.id = ${subscriptionId} AND s.company_id = ${company.id}
    LIMIT 1
  `);
  const billingCutoff = cutoffResult.rows[0]?.billing_cutoff;
  const nextCycleStart = cutoffResult.rows[0]?.next_cycle_start;
  if (!billingCutoff || !nextCycleStart) {
    throw new WorkerBillingQuoteError("No se pudo determinar el período de facturación. No se inició ningún cobro.");
  }

  const countResult = await db.execute(sql`
    SELECT COUNT(*)::int AS employee_count
    FROM workers
    WHERE company_id = ${company.id}
      AND (
        status IN ('activo', 'inactivo')
        OR (
          status = 'retirado'
          AND (
            retirement_date >= ${nextCycleStart}
            OR created_at >= ${billingCutoff}
          )
        )
      )
  `);
  const employeeCount = Number(countResult.rows[0]?.employee_count);
  if (!Number.isSafeInteger(employeeCount) || employeeCount < 1 || employeeCount > 10000) {
    throw new WorkerBillingQuoteError("No hay una cantidad válida de trabajadores para cotizar. No se inició ningún cobro.");
  }

  const pricing = await getCompanyWorkerPricing(company.id);
  const landingUrl = process.env.LANDING_PAGE_BASE_URL || "https://sst-colombia.com.co";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(`${landingUrl.replace(/\/+$/, "")}/api/recalculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: company.name,
        employees: employeeCount,
        vehicles: 0,
        risk_level: "I",
        coupon_code: pricing.mode === "standard" ? company.quoteCouponCode || undefined : undefined,
      }),
      signal: controller.signal,
    });
  } catch {
    throw new WorkerBillingQuoteError("No se pudo verificar el precio vigente. No se inició ningún cobro.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new WorkerBillingQuoteError("La cotización no está disponible en este momento. No se inició ningún cobro.");
  }

  let token: unknown;
  try {
    token = (await response.json() as { token?: unknown }).token;
  } catch {
    throw new WorkerBillingQuoteError("La respuesta de cotización no es válida. No se inició ningún cobro.");
  }
  if (typeof token !== "string") {
    throw new WorkerBillingQuoteError("La respuesta de cotización no es válida. No se inició ningún cobro.");
  }

  const verification = verifyRecalculateToken(token);
  const quote = verification.data;
  if (
    !verification.valid ||
    !quote ||
    quote.employees !== employeeCount ||
    !Number.isSafeInteger(quote.baseMonthlyPrice) ||
    quote.baseMonthlyPrice <= 0 ||
    !Number.isSafeInteger(quote.currentPeriodPrice) ||
    quote.currentPeriodPrice < 0
  ) {
    throw new WorkerBillingQuoteError("No se pudo verificar el precio y la cantidad cotizados. No se inició ningún cobro.");
  }

  const confirmationResult = await db.execute(sql`
    SELECT COUNT(*)::int AS employee_count
    FROM workers
    WHERE company_id = ${company.id}
      AND (
        status IN ('activo', 'inactivo')
        OR (
          status = 'retirado'
          AND (
            retirement_date >= ${nextCycleStart}
            OR created_at >= ${billingCutoff}
          )
        )
      )
  `);
  if (Number(confirmationResult.rows[0]?.employee_count) !== employeeCount) {
    throw new WorkerBillingQuoteError("La cantidad de trabajadores cambió durante la cotización. Actualice la cotización antes de pagar.");
  }

  const charge = calculateWorkerPricingCharge(
    pricing,
    employeeCount,
    quote.baseMonthlyPrice,
    quote.currentPeriodPrice,
  );

  return {
    employeeCount,
    baseMonthlyPrice: quote.baseMonthlyPrice,
    currentPeriodPrice: charge.currentPeriodAmount,
    paymentAmount: charge.paymentAmount,
    publicBaseMonthlyPrice: quote.baseMonthlyPrice,
    effectiveUnitPriceCop: charge.effectiveUnitPriceCop,
    pricingMode: charge.mode,
    discountPercent: charge.discountPercent,
    discountDurationMonths: pricing.mode === "standard" ? quote.discountDurationMonths : 0,
    couponCode: pricing.mode === "standard" ? quote.couponCode : null,
    currency: "COP",
  };
}