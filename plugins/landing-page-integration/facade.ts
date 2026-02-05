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
 */

import type { 
  QuotePayload, 
  NormalizedQuoteData, 
  QuoteVerificationResult,
  PluginConfig 
} from "./types";
import { decodeWithFallback } from "./verifier";

let pluginEnabled = true;
let pluginConfig: PluginConfig = {
  enabled: true,
  jwtSecret: process.env.LANDING_PAGE_API_KEY || null,
  tokenMaxAge: '30m',
  allowLegacyBase64: true,
};

/**
 * KILL SWITCH - Disable the plugin entirely
 * When disabled, all verification attempts will fail gracefully
 */
export function disablePlugin(): void {
  pluginEnabled = false;
  console.log("[LandingPagePlugin] 🔴 Plugin DISABLED via kill switch");
}

/**
 * Enable the plugin
 */
export function enablePlugin(): void {
  pluginEnabled = true;
  console.log("[LandingPagePlugin] 🟢 Plugin ENABLED");
}

/**
 * Check if plugin is enabled
 */
export function isPluginEnabled(): boolean {
  return pluginEnabled;
}

/**
 * Update plugin configuration
 */
export function updateConfig(config: Partial<PluginConfig>): void {
  pluginConfig = { ...pluginConfig, ...config };
  console.log("[LandingPagePlugin] Configuration updated");
}

/**
 * Refresh configuration from environment
 * Call this if environment variables change at runtime
 */
export function refreshConfig(): void {
  pluginConfig.jwtSecret = process.env.LANDING_PAGE_API_KEY || null;
  console.log("[LandingPagePlugin] Configuration refreshed from environment");
}

/**
 * STABLE INTERFACE: Verify a quote token from the landing page
 * 
 * @param token - The JWT or base64 token from ?quote= parameter
 * @returns QuoteVerificationResult with normalized data or error
 */
export function verifyQuote(token: string): QuoteVerificationResult {
  if (!pluginEnabled) {
    return {
      valid: false,
      data: null,
      error: "Integración con landing page deshabilitada temporalmente"
    };
  }

  if (!pluginConfig.jwtSecret) {
    console.error("[LandingPagePlugin] LANDING_PAGE_API_KEY not configured");
    return {
      valid: false,
      data: null,
      error: "Configuración de integración incompleta"
    };
  }

  try {
    const quoteData = decodeWithFallback(token, pluginConfig);
    const normalized = normalizeQuoteData(quoteData);
    
    return {
      valid: true,
      data: normalized,
      error: null
    };
  } catch (error: any) {
    return {
      valid: false,
      data: null,
      error: error.message || "Error al verificar cotización"
    };
  }
}

/**
 * STABLE INTERFACE: Get raw quote payload (for advanced use cases)
 * 
 * @param token - The JWT or base64 token
 * @returns The raw QuotePayload or throws an error
 */
export function getRawQuotePayload(token: string): QuotePayload {
  if (!pluginEnabled) {
    throw new Error("Integración con landing page deshabilitada temporalmente");
  }

  if (!pluginConfig.jwtSecret) {
    throw new Error("Configuración de integración incompleta");
  }

  return decodeWithFallback(token, pluginConfig);
}

/**
 * STABLE INTERFACE: Get a summary of quote data for logging
 * Does not expose sensitive information
 */
export function getQuoteSummary(data: NormalizedQuoteData): string {
  return `${data.employees} empleados, Riesgo ${data.riskLevel}, ` +
         `${data.vehicles} vehículos, ` +
         `Precio: ${data.currentPeriodPrice} COP` +
         (data.couponCode ? `, Cupón: ${data.couponCode}` : '') +
         (data.referrerId ? `, Referido por: ${data.referrerId}` : '');
}

/**
 * Normalize raw quote payload to simplified structure for main app
 */
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
