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
 * 
 * @module plugins/landing-page-integration/verifier
 */

import jwt from "jsonwebtoken";
import type { QuotePayload, PluginConfig } from "./types";

/**
 * Validates the structure of a decoded JWT payload
 * Prevents injection of malformed data
 */
function validatePayloadStructure(payload: unknown): payload is QuotePayload {
  if (!payload || typeof payload !== 'object') return false;
  
  const p = payload as Record<string, unknown>;
  
  if (!p.sub_data || typeof p.sub_data !== 'object') return false;
  const subData = p.sub_data as Record<string, unknown>;
  if (typeof subData.base_monthly_price !== 'number') return false;
  if (typeof subData.current_period_price !== 'number') return false;
  if (typeof subData.discount_duration_months !== 'number') return false;
  if (subData.currency !== 'COP') return false;
  
  if (subData.base_monthly_price < 0 || subData.base_monthly_price > 100000000) return false;
  if (subData.current_period_price < 0 || subData.current_period_price > 100000000) return false;
  if (subData.discount_duration_months < 0 || subData.discount_duration_months > 24) return false;
  
  if (!p.metadata || typeof p.metadata !== 'object') return false;
  const metadata = p.metadata as Record<string, unknown>;
  if (typeof metadata.employees !== 'number' || metadata.employees < 1 || metadata.employees > 10000) return false;
  if (!['I', 'II', 'III', 'IV', 'V'].includes(metadata.risk_level as string)) return false;
  if (typeof metadata.vehicles !== 'number' || metadata.vehicles < 0 || metadata.vehicles > 1000) return false;
  
  if (metadata.coupon_code !== null && typeof metadata.coupon_code !== 'string') return false;
  
  if (p.referral !== null) {
    if (typeof p.referral !== 'object') return false;
    const referral = p.referral as Record<string, unknown>;
    if (typeof referral.referrer_id !== 'string') return false;
    if (referral.program_type !== 'aliados_2026') return false;
  }
  
  return true;
}

/**
 * Verifies a JWT token using the configured secret
 */
export function verifyJWT(token: string, config: PluginConfig): QuotePayload {
  if (!config.jwtSecret) {
    console.error("[LandingPagePlugin] JWT secret not configured");
    throw new Error("Configuración de seguridad incompleta");
  }
  
  if (!token || typeof token !== 'string' || token.length > 5000) {
    throw new Error("Token de cotización inválido");
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
      maxAge: config.tokenMaxAge,
    });
    
    if (!validatePayloadStructure(decoded)) {
      console.error("[LandingPagePlugin] Payload structure validation failed");
      throw new Error("Estructura de cotización inválida");
    }
    
    console.log("[LandingPagePlugin] ✅ JWT verified successfully", {
      employees: (decoded as QuotePayload).metadata.employees,
      riskLevel: (decoded as QuotePayload).metadata.risk_level,
      coupon: (decoded as QuotePayload).metadata.coupon_code || 'none',
      hasReferral: !!(decoded as QuotePayload).referral
    });
    
    return decoded as QuotePayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("[LandingPagePlugin] Token expired");
      throw new Error("La cotización ha expirado. Por favor, genera una nueva desde la página principal.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn("[LandingPagePlugin] Invalid token:", error.message);
      throw new Error("Cotización inválida o manipulada.");
    }
    throw error;
  }
}

/**
 * Decodes a token with fallback to legacy base64 format
 * For backward compatibility during migration period
 */
export function decodeWithFallback(token: string, config: PluginConfig): QuotePayload {
  if (!token || typeof token !== 'string') {
    throw new Error("Token de cotización requerido");
  }
  
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  
  if (jwtPattern.test(token)) {
    return verifyJWT(token, config);
  }
  
  if (!config.allowLegacyBase64) {
    throw new Error("Formato de token no soportado");
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    
    if (!validatePayloadStructure(decoded)) {
      throw new Error("Estructura de cotización legacy inválida");
    }
    
    console.warn("[LandingPagePlugin] ⚠️ WARNING: Received legacy base64 quote. Landing page needs update.");
    return decoded as QuotePayload;
  } catch (base64Error) {
    console.error("[LandingPagePlugin] Failed to decode as base64:", base64Error);
    throw new Error("Formato de cotización no reconocido");
  }
}
