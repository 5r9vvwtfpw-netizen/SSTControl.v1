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
 * - Strict payload structure validation prevents injection
 * 
 * @module plugins/landing-page-integration/verifier
 * @version 1.1.0
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

function validatePayloadStructure(payload: unknown): payload is QuotePayload {
  if (!payload || typeof payload !== 'object') return false;
  
  const p = payload as Record<string, unknown>;
  
  if (!p.sub_data || typeof p.sub_data !== 'object') return false;
  const subData = p.sub_data as Record<string, unknown>;
  
  if (typeof subData.base_monthly_price !== 'number' ||
      subData.base_monthly_price < 0 || 
      subData.base_monthly_price > MAX_PRICE) return false;
  
  if (typeof subData.current_period_price !== 'number' ||
      subData.current_period_price < 0 || 
      subData.current_period_price > MAX_PRICE) return false;
  
  if (typeof subData.discount_duration_months !== 'number' ||
      subData.discount_duration_months < 0 || 
      subData.discount_duration_months > MAX_DISCOUNT_MONTHS) return false;
  
  if (subData.currency !== 'COP') return false;
  
  if (!p.metadata || typeof p.metadata !== 'object') return false;
  const metadata = p.metadata as Record<string, unknown>;
  
  if (typeof metadata.employees !== 'number' || 
      metadata.employees < 1 || 
      metadata.employees > MAX_EMPLOYEES) return false;
  
  if (!VALID_RISK_LEVELS.includes(metadata.risk_level as typeof VALID_RISK_LEVELS[number])) return false;
  
  if (typeof metadata.vehicles !== 'number' || 
      metadata.vehicles < 0 || 
      metadata.vehicles > MAX_VEHICLES) return false;
  
  if (metadata.coupon_code !== undefined && metadata.coupon_code !== null && typeof metadata.coupon_code !== 'string') return false;
  
  if (metadata.coupon !== undefined && metadata.coupon !== null) {
    if (typeof metadata.coupon !== 'object') return false;
    const coupon = metadata.coupon as Record<string, unknown>;
    if (typeof coupon.code !== 'string') return false;
  }
  
  if (p.referral !== null && p.referral !== undefined) {
    if (typeof p.referral !== 'object') return false;
    const referral = p.referral as Record<string, unknown>;
    if (typeof referral.referrer_id !== 'string') return false;
    if (referral.program_type !== 'aliados_2026') return false;
  }
  
  return true;
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
    
    if (!validatePayloadStructure(decoded)) {
      throw new Error("Estructura de cotización inválida");
    }
    
    return decoded as QuotePayload;
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
