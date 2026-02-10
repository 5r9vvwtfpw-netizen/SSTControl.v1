/**
 * Landing Page Integration Plugin - JWT Verifier
 * 
 * Handles cryptographic verification of quotes from the landing page.
 * This is an internal module - use the facade for external access.
 * 
 * SECURITY:
 * - JWTs are signed with HMAC-SHA256 using shared secret
 * - Tokens expire in 30 minutes to prevent replay attacks
 * - Prices are NOT recalculated - we trust the signed JWT
 * - Payload structure validation with diagnostic logging
 * 
 * @module plugins/landing-page-integration/verifier
 * @version 1.2.0
 */

import jwt from "jsonwebtoken";
import type { QuotePayload } from "./types";

const VALID_RISK_LEVELS = ['I', 'II', 'III', 'IV', 'V'] as const;
const MAX_TOKEN_LENGTH = 5000;
const MAX_PRICE = 100_000_000;
const MAX_EMPLOYEES = 10_000;
const MAX_VEHICLES = 1_000;
const MAX_DISCOUNT_MONTHS = 24;
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const TOKEN_MAX_AGE = '30m';

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!isNaN(parsed) && isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeDecodedPayload(raw: Record<string, unknown>): Record<string, unknown> | null {
  const result: Record<string, unknown> = { ...raw };

  if (!raw.sub_data || typeof raw.sub_data !== 'object') {
    console.error('[LandingPagePlugin] Normalization failed: missing sub_data. Keys:', JSON.stringify(Object.keys(raw)));
    return null;
  }
  const rawSubData = raw.sub_data as Record<string, unknown>;
  const subData: Record<string, unknown> = { ...rawSubData };

  const basePrice = toNumberOrNull(rawSubData.base_monthly_price);
  if (basePrice === null || basePrice < 0 || basePrice > MAX_PRICE) {
    console.error('[LandingPagePlugin] Normalization failed: base_monthly_price =', rawSubData.base_monthly_price, '(type:', typeof rawSubData.base_monthly_price + ')');
    return null;
  }
  subData.base_monthly_price = basePrice;

  const currentPrice = toNumberOrNull(rawSubData.current_period_price);
  if (currentPrice === null || currentPrice < 0 || currentPrice > MAX_PRICE) {
    console.error('[LandingPagePlugin] Normalization failed: current_period_price =', rawSubData.current_period_price, '(type:', typeof rawSubData.current_period_price + ')');
    return null;
  }
  subData.current_period_price = currentPrice;

  const discountMonths = toNumberOrNull(rawSubData.discount_duration_months);
  if (rawSubData.discount_duration_months === undefined || rawSubData.discount_duration_months === null) {
    subData.discount_duration_months = 0;
  } else if (discountMonths === null || discountMonths < 0 || discountMonths > MAX_DISCOUNT_MONTHS) {
    console.error('[LandingPagePlugin] Normalization failed: discount_duration_months =', rawSubData.discount_duration_months, '(type:', typeof rawSubData.discount_duration_months + ')');
    return null;
  } else {
    subData.discount_duration_months = discountMonths;
  }

  const currency = rawSubData.currency;
  if (typeof currency === 'string' && currency.toUpperCase() === 'COP') {
    subData.currency = 'COP';
  } else {
    console.error('[LandingPagePlugin] Normalization failed: currency =', currency);
    return null;
  }

  result.sub_data = subData;

  if (!raw.metadata || typeof raw.metadata !== 'object') {
    console.error('[LandingPagePlugin] Normalization failed: missing metadata. Keys:', JSON.stringify(Object.keys(raw)));
    return null;
  }
  const rawMetadata = raw.metadata as Record<string, unknown>;
  const metadata: Record<string, unknown> = { ...rawMetadata };

  const employees = toNumberOrNull(rawMetadata.employees);
  if (employees === null || employees < 1 || employees > MAX_EMPLOYEES) {
    console.error('[LandingPagePlugin] Normalization failed: employees =', rawMetadata.employees, '(type:', typeof rawMetadata.employees + ')');
    return null;
  }
  metadata.employees = employees;

  if (!VALID_RISK_LEVELS.includes(rawMetadata.risk_level as typeof VALID_RISK_LEVELS[number])) {
    console.error('[LandingPagePlugin] Normalization failed: risk_level =', rawMetadata.risk_level);
    return null;
  }

  if (rawMetadata.vehicles === undefined || rawMetadata.vehicles === null) {
    metadata.vehicles = 0;
  } else {
    const vehicles = toNumberOrNull(rawMetadata.vehicles);
    if (vehicles === null || vehicles < 0 || vehicles > MAX_VEHICLES) {
      console.error('[LandingPagePlugin] Normalization failed: vehicles =', rawMetadata.vehicles, '(type:', typeof rawMetadata.vehicles + ')');
      return null;
    }
    metadata.vehicles = vehicles;
  }

  if (rawMetadata.coupon_code !== undefined && rawMetadata.coupon_code !== null && typeof rawMetadata.coupon_code !== 'string') {
    console.error('[LandingPagePlugin] Normalization failed: coupon_code type =', typeof rawMetadata.coupon_code);
    return null;
  }

  if (rawMetadata.coupon !== undefined && rawMetadata.coupon !== null) {
    if (typeof rawMetadata.coupon !== 'object') {
      console.error('[LandingPagePlugin] Normalization failed: coupon type =', typeof rawMetadata.coupon);
      return null;
    }
    const coupon = rawMetadata.coupon as Record<string, unknown>;
    if (typeof coupon.code !== 'string') {
      console.error('[LandingPagePlugin] Normalization failed: coupon.code =', coupon.code);
      return null;
    }
  }

  result.metadata = metadata;

  if (raw.referral !== null && raw.referral !== undefined) {
    if (typeof raw.referral !== 'object') {
      console.error('[LandingPagePlugin] Normalization failed: referral type =', typeof raw.referral);
      return null;
    }
    const referral = raw.referral as Record<string, unknown>;
    if (typeof referral.referrer_id !== 'string') {
      console.error('[LandingPagePlugin] Normalization failed: referral.referrer_id =', referral.referrer_id);
      return null;
    }
    if (referral.program_type !== 'aliados_2026') {
      console.error('[LandingPagePlugin] Normalization failed: referral.program_type =', referral.program_type);
      return null;
    }
  }

  return result;
}

/**
 * Verifies and decodes a JWT quote token.
 * 
 * @param token - The raw JWT string from ?quote= parameter
 * @param secret - The HMAC-SHA256 shared secret (LANDING_PAGE_API_KEY)
 * @returns Validated QuotePayload
 * @throws Error with user-facing message on any failure
 */
export function verifyJWT(token: string, secret: string): QuotePayload {
  if (!token || typeof token !== 'string') {
    throw new Error("Token de cotización requerido");
  }

  if (token.length > MAX_TOKEN_LENGTH) {
    throw new Error("Token de cotización inválido");
  }

  if (!JWT_PATTERN.test(token)) {
    throw new Error("Formato de token no soportado");
  }
  
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      maxAge: TOKEN_MAX_AGE,
    });
    
    if (!decoded || typeof decoded !== 'object') {
      throw new Error("Estructura de cotización inválida");
    }

    const normalized = normalizeDecodedPayload(decoded as Record<string, unknown>);
    if (!normalized) {
      throw new Error("Estructura de cotización inválida");
    }
    
    return normalized as unknown as QuotePayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("La cotización ha expirado. Por favor, genera una nueva desde la página principal.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Cotización inválida o manipulada.");
    }
    throw error;
  }
}
