/**
 * Landing Page Integration Plugin - Facade (Stable Interface)
 * 
 * THIS IS THE ONLY FILE THE MAIN APPLICATION SHOULD IMPORT
 * 
 * This facade provides a stable interface that will not change even if
 * the internal implementation changes. The main application should ONLY
 * interact with this module.
 * 
 * STABILITY GUARANTEE:
 * - Function signatures will not change
 * - Return types will not change
 * - New fields may be added but existing fields will not be removed
 * 
 * @module plugins/landing-page-integration/facade
 * @version 1.1.0
 */

import type { 
  QuotePayload, 
  NormalizedQuoteData, 
  QuoteVerificationResult 
} from "./types";
import { verifyJWT } from "./verifier";

const jwtSecret = process.env.LANDING_PAGE_API_KEY || null;

/**
 * STABLE INTERFACE: Verify a quote token from the landing page
 * 
 * @param token - The JWT token from ?quote= parameter
 * @returns QuoteVerificationResult with normalized data or error
 */
export function verifyQuote(token: string): QuoteVerificationResult {
  if (!jwtSecret) {
    console.error("[LandingPagePlugin] LANDING_PAGE_API_KEY not configured");
    return {
      valid: false,
      data: null,
      error: "Configuración de integración incompleta"
    };
  }

  if (!token || typeof token !== 'string') {
    return {
      valid: false,
      data: null,
      error: "Token de cotización requerido"
    };
  }

  try {
    const quoteData = verifyJWT(token, jwtSecret);
    const normalized = normalizeQuoteData(quoteData);
    
    return {
      valid: true,
      data: normalized,
      error: null
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al verificar cotización";
    return {
      valid: false,
      data: null,
      error: message
    };
  }
}

/**
 * STABLE INTERFACE: Get raw quote payload (for Stripe checkout)
 * 
 * @param token - The JWT token
 * @returns The raw QuotePayload
 * @throws Error if verification fails
 */
export function getRawQuotePayload(token: string): QuotePayload {
  if (!jwtSecret) {
    throw new Error("Configuración de integración incompleta");
  }

  return verifyJWT(token, jwtSecret);
}

/**
 * STABLE INTERFACE: Get a summary of quote data for logging
 * Does not expose sensitive information
 */
export function getQuoteSummary(data: NormalizedQuoteData): string {
  const parts = [
    `${data.employees} empleados`,
    `Riesgo ${data.riskLevel}`,
    `${data.vehicles} vehículos`,
    `${formatCOP(data.baseMonthlyPrice)}/mes`
  ];
  
  if (data.couponCode) {
    parts.push(`Cupón: ${data.couponCode}`);
  }
  
  if (data.referrerId) {
    parts.push(`Ref: ${data.referrerId.substring(0, 8)}...`);
  }
  
  return parts.join(', ');
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function normalizeQuoteData(quote: QuotePayload): NormalizedQuoteData {
  return {
    companyName: quote.metadata.company_name || null,
    employees: quote.metadata.employees,
    riskLevel: quote.metadata.risk_level,
    vehicles: quote.metadata.vehicles,
    ciiuCode: quote.metadata.ciiu_code || null,
    standardsCount: quote.metadata.standards_count || null,
    couponCode: quote.metadata.coupon_code,
    baseMonthlyPrice: quote.sub_data.base_monthly_price,
    currentPeriodPrice: quote.sub_data.current_period_price,
    discountDurationMonths: quote.sub_data.discount_duration_months,
    referrerId: quote.referral?.referrer_id || null,
    currency: quote.sub_data.currency,
  };
}
