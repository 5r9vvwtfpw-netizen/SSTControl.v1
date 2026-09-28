import { sql } from "drizzle-orm";
import { db } from "../db";
import { assertWorkerPricingSchemaReady } from "./worker-pricing-schema-state";

export type WorkerPricingMode = "standard" | "fixed" | "percentage";
const MAX_COP_INTEGER = 2_147_483_647;

export interface CompanyWorkerPricing {
  mode: WorkerPricingMode;
  unitPriceCop: number | null;
  discountPercent: number | null;
  updatedAt?: Date | string | null;
  updatedBy?: string | null;
}

export interface WorkerPricingCharge {
  mode: WorkerPricingMode;
  publicBaseAmount: number;
  currentPeriodAmount: number;
  paymentAmount: number;
  effectiveUnitPriceCop: number;
  discountPercent: number | null;
}

export interface WorkerPricingSnapshotIdentity {
  amount: number;
  employeeCount: number;
  mode: WorkerPricingMode | string | null;
  publicBaseAmount: number | null;
  effectiveUnitPriceCop: number | string | null;
  discountPercent: number | null;
}

export class WorkerPricingValidationError extends Error {}

export function workerPricingSnapshotMatchesQuote(
  quote: {
    paymentAmount: number;
    employeeCount: number;
    pricingMode: WorkerPricingMode;
    publicBaseMonthlyPrice: number;
    effectiveUnitPriceCop: number;
    discountPercent: number | null;
  },
  snapshot: WorkerPricingSnapshotIdentity,
): boolean {
  return snapshot.amount === quote.paymentAmount &&
    snapshot.employeeCount === quote.employeeCount &&
    snapshot.mode === quote.pricingMode &&
    snapshot.publicBaseAmount === quote.publicBaseMonthlyPrice &&
    snapshot.discountPercent === quote.discountPercent &&
    Number.isFinite(Number(snapshot.effectiveUnitPriceCop)) &&
    Math.round(Number(snapshot.effectiveUnitPriceCop) * 100) ===
      Math.round(quote.effectiveUnitPriceCop * 100);
}

export function workerPricingConfigMatchesQuote(
  quote: {
    pricingMode: WorkerPricingMode;
    effectiveUnitPriceCop: number;
    discountPercent: number | null;
  },
  pricing: Pick<CompanyWorkerPricing, "mode" | "unitPriceCop" | "discountPercent">,
): boolean {
  if (pricing.mode !== quote.pricingMode) return false;
  if (pricing.mode === "fixed") {
    return pricing.unitPriceCop === quote.effectiveUnitPriceCop &&
      pricing.discountPercent === null;
  }
  if (pricing.mode === "percentage") {
    return pricing.discountPercent === quote.discountPercent &&
      pricing.unitPriceCop === null;
  }
  return pricing.unitPriceCop === null && pricing.discountPercent === null;
}

export function parseWorkerPricingUpdate(input: unknown): CompanyWorkerPricing {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new WorkerPricingValidationError("El cuerpo de la solicitud no es válido.");
  }

  const value = input as Record<string, unknown>;
  const allowedKeys = new Set(["mode", "unitPriceCop", "discountPercent"]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
    throw new WorkerPricingValidationError("La solicitud contiene campos no permitidos.");
  }

  if (!["standard", "fixed", "percentage"].includes(String(value.mode))) {
    throw new WorkerPricingValidationError("La modalidad debe ser estándar, fija o porcentual.");
  }

  if (value.mode === "standard") {
    if (value.unitPriceCop !== undefined || value.discountPercent !== undefined) {
      throw new WorkerPricingValidationError("La tarifa estándar no admite precio ni descuento configurado.");
    }
    return { mode: "standard", unitPriceCop: null, discountPercent: null };
  }

  if (value.mode === "fixed") {
    if (
      !Number.isSafeInteger(value.unitPriceCop) ||
      Number(value.unitPriceCop) <= 0 ||
      Number(value.unitPriceCop) > MAX_COP_INTEGER ||
      value.discountPercent !== undefined
    ) {
      throw new WorkerPricingValidationError(
        "La tarifa fija requiere un precio entero positivo válido por trabajador y no admite descuento porcentual.",
      );
    }
    return {
      mode: "fixed",
      unitPriceCop: Number(value.unitPriceCop),
      discountPercent: null,
    };
  }

  if (
    !Number.isSafeInteger(value.discountPercent) ||
    Number(value.discountPercent) < 1 ||
    Number(value.discountPercent) > 99 ||
    value.unitPriceCop !== undefined
  ) {
    throw new WorkerPricingValidationError(
      "La tarifa porcentual requiere un descuento entero entre 1 y 99 y no admite precio fijo.",
    );
  }
  return {
    mode: "percentage",
    unitPriceCop: null,
    discountPercent: Number(value.discountPercent),
  };
}

export function calculateWorkerPricingCharge(
  pricing: Pick<CompanyWorkerPricing, "mode" | "unitPriceCop" | "discountPercent">,
  employeeCount: number,
  publicBaseAmount: number,
  publicCurrentPeriodAmount: number,
): WorkerPricingCharge {
  if (!Number.isSafeInteger(employeeCount) || employeeCount < 1) {
    throw new WorkerPricingValidationError("La cantidad de trabajadores no es válida.");
  }
  if (!Number.isSafeInteger(publicBaseAmount) || publicBaseAmount <= 0) {
    throw new WorkerPricingValidationError("El precio público verificado no es válido.");
  }
  if (!Number.isSafeInteger(publicCurrentPeriodAmount) || publicCurrentPeriodAmount < 0) {
    throw new WorkerPricingValidationError("El precio vigente verificado no es válido.");
  }

  if (pricing.mode === "standard") {
    const paymentAmount = publicCurrentPeriodAmount < publicBaseAmount
      ? publicCurrentPeriodAmount
      : publicBaseAmount;
    return {
      mode: "standard",
      publicBaseAmount,
      currentPeriodAmount: publicCurrentPeriodAmount,
      paymentAmount,
      effectiveUnitPriceCop: Math.round((paymentAmount / employeeCount) * 100) / 100,
      discountPercent: null,
    };
  }

  let paymentAmount: number;
  if (pricing.mode === "fixed") {
    if (!Number.isSafeInteger(pricing.unitPriceCop) || !pricing.unitPriceCop || pricing.unitPriceCop <= 0) {
      throw new WorkerPricingValidationError("La tarifa fija por trabajador no está configurada correctamente.");
    }
    paymentAmount = employeeCount * pricing.unitPriceCop;
    if (!Number.isSafeInteger(paymentAmount) || paymentAmount > MAX_COP_INTEGER) {
      throw new WorkerPricingValidationError("El total de la tarifa fija excede el valor permitido.");
    }
  } else {
    if (
      !Number.isSafeInteger(pricing.discountPercent) ||
      !pricing.discountPercent ||
      pricing.discountPercent < 1 ||
      pricing.discountPercent > 99
    ) {
      throw new WorkerPricingValidationError("El descuento porcentual no está configurado correctamente.");
    }
    paymentAmount = Math.round(publicBaseAmount * (100 - pricing.discountPercent) / 100);
  }
  if (paymentAmount > MAX_COP_INTEGER) {
    throw new WorkerPricingValidationError("El total de la tarifa excede el valor permitido.");
  }
  if (paymentAmount <= 0) {
    throw new WorkerPricingValidationError(
      "La tarifa acordada resulta en un total de cero. Revise el descuento antes de cobrar.",
    );
  }

  return {
    mode: pricing.mode,
    publicBaseAmount,
    // Negotiated pricing does not stack with a landing-page coupon.
    currentPeriodAmount: publicBaseAmount,
    paymentAmount,
    effectiveUnitPriceCop: Math.round((paymentAmount / employeeCount) * 100) / 100,
    discountPercent: pricing.mode === "percentage" ? pricing.discountPercent! : null,
  };
}

export async function getCompanyWorkerPricing(companyId: string): Promise<CompanyWorkerPricing> {
  assertWorkerPricingSchemaReady();
  const result = await db.execute(sql`
    SELECT worker_pricing_mode, worker_unit_price_cop, worker_discount_percent,
           worker_pricing_updated_at, worker_pricing_updated_by
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `);
  const row = result.rows[0] as {
    worker_pricing_mode?: string | null;
    worker_unit_price_cop?: number | null;
    worker_discount_percent?: number | null;
    worker_pricing_updated_at?: Date | string | null;
    worker_pricing_updated_by?: string | null;
  } | undefined;

  if (!row) throw new WorkerPricingValidationError("Empresa no encontrada.");
  const mode = row.worker_pricing_mode || "standard";
  if (mode !== "standard" && mode !== "fixed" && mode !== "percentage") {
    throw new WorkerPricingValidationError("La modalidad de cobro de la empresa no es válida.");
  }

  return {
    mode,
    unitPriceCop: row.worker_unit_price_cop == null ? null : Number(row.worker_unit_price_cop),
    discountPercent: row.worker_discount_percent == null ? null : Number(row.worker_discount_percent),
    updatedAt: row.worker_pricing_updated_at ?? null,
    updatedBy: row.worker_pricing_updated_by ?? null,
  };
}