export interface PricingParams {
  minFeeSmall: number;
  price1To10: number;
  price11To49: number;
  price50To199: number;
  price200Plus: number;
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

  let tier: string;
  let pricePerLicense: number;
  let minimumFee: number;
  let monthlyCost: number;

  if (employees >= 1 && employees <= 10) {
    tier = "1-10";
    pricePerLicense = config.price1To10;
    const baseAmount = employees * pricePerLicense;
    minimumFee = config.minFeeSmall;
    monthlyCost = Math.max(minimumFee, baseAmount);
  } else if (employees >= 11 && employees <= 49) {
    tier = "11-49";
    pricePerLicense = config.price11To49;
    minimumFee = 0;
    monthlyCost = employees * pricePerLicense;
  } else if (employees >= 50 && employees <= 199) {
    tier = "50-199";
    pricePerLicense = config.price50To199;
    minimumFee = 0;
    monthlyCost = employees * pricePerLicense;
  } else {
    tier = "200+";
    pricePerLicense = config.price200Plus;
    minimumFee = 0;
    monthlyCost = employees * pricePerLicense;
  }

  const costPerEmployee = monthlyCost / employees;

  return {
    tier,
    employeeCount: employees,
    pricePerLicense,
    minimumFee,
    monthlyCost,
    costPerEmployee,
    currency: config.currency,
  };
}
