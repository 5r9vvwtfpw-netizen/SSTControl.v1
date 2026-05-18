/**
 * Fórmula de precios simplificada:
 * - 1 trabajador: $20,000 COP/mes
 * - 2 trabajadores: $20,000 COP/mes (el segundo es gratis)
 * - Cada trabajador adicional más allá de 2: $10,000 COP/mes
 *
 * Configuración en pricing_config:
 *   min_fee_small  = precio base (para 1-2 trabajadores) → $20,000
 *   price_1_10     = precio por trabajador adicional más allá de 2 → $10,000
 */

export interface PricingParams {
  basePrice: number;
  additionalWorkerPrice: number;
  currency: string;
}

export interface PricingResult {
  tier: string;
  employeeCount: number;
  pricePerLicense: number;
  minimumFee: number;
  monthlyCost: number;
  costPerEmployee: number;
  currency: string;
}

export function calculatePricing(employees: number, config: PricingParams): PricingResult {
  if (employees < 1) {
    throw new Error("Employee count must be at least 1");
  }

  const additionalWorkers = Math.max(0, employees - 2);
  const monthlyCost = config.basePrice + additionalWorkers * config.additionalWorkerPrice;
  const costPerEmployee = monthlyCost / employees;

  return {
    tier: "flat",
    employeeCount: employees,
    pricePerLicense: config.additionalWorkerPrice,
    minimumFee: config.basePrice,
    monthlyCost,
    costPerEmployee,
    currency: config.currency,
  };
}
