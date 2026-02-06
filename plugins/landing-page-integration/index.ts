/**
 * Landing Page Integration Plugin
 * 
 * Secure JWT-based integration with sst-colombia.com.co landing page.
 * Handles quote verification, price validation, and referral tracking.
 * 
 * ARCHITECTURE:
 * - Sidecar pattern: Independent module that can be disabled without affecting main app
 * - Stable facade: Main app only imports from this index file
 * 
 * USAGE:
 * ```typescript
 * import { verifyQuote, getRawQuotePayload } from "../plugins/landing-page-integration";
 * 
 * // For registration form pre-fill
 * const result = verifyQuote(token);
 * if (result.valid) {
 *   // Use result.data for form pre-fill
 * }
 * 
 * // For Stripe checkout (raw payload needed)
 * const payload = getRawQuotePayload(token);
 * ```
 * 
 * @module plugins/landing-page-integration
 * @version 1.1.0
 */

export { default as landingPageRouter } from "./routes";

export {
  verifyQuote,
  getRawQuotePayload,
  getQuoteSummary,
} from "./facade";

export type {
  QuotePayload,
  NormalizedQuoteData,
  QuoteVerificationResult,
} from "./types";
