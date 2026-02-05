/**
 * Landing Page Integration Plugin - Type Definitions
 * 
 * STABLE INTERFACE CONTRACT:
 * These types define the communication contract between the landing page
 * and the SST Colombia application. Changes to these types should be
 * backward compatible to avoid breaking the integration.
 * 
 * @module plugins/landing-page-integration/types
 */

/**
 * Quote payload structure from landing page JWT
 * This is the data that comes signed from sst-colombia.com.co
 */
export interface QuotePayload {
  sub_data: {
    base_monthly_price: number;
    current_period_price: number;
    discount_duration_months: number;
    currency: "COP";
  };
  metadata: {
    company_name?: string;
    employees: number;
    risk_level: "I" | "II" | "III" | "IV" | "V";
    vehicles: number;
    coupon_code: string | null;
    ciiu_code?: string;
    standards_count?: number;
  };
  referral: {
    referrer_id: string;
    program_type: "aliados_2026";
  } | null;
  iat: number;
  exp: number;
}

/**
 * Normalized quote data for use by the main application
 * This is what the main app receives - a simplified, validated structure
 */
export interface NormalizedQuoteData {
  companyName: string | null;
  employees: number;
  riskLevel: "I" | "II" | "III" | "IV" | "V";
  vehicles: number;
  ciiuCode: string | null;
  standardsCount: number | null;
  couponCode: string | null;
  baseMonthlyPrice: number;
  currentPeriodPrice: number;
  discountDurationMonths: number;
  referrerId: string | null;
  currency: "COP";
}

/**
 * Result of quote verification
 */
export interface QuoteVerificationResult {
  valid: boolean;
  data: NormalizedQuoteData | null;
  error: string | null;
}

/**
 * Plugin configuration options
 */
export interface PluginConfig {
  enabled: boolean;
  jwtSecret: string | null;
  tokenMaxAge: string;
  allowLegacyBase64: boolean;
}
