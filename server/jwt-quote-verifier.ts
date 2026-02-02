/**
 * JWT Quote Verifier - Verificación segura de cotizaciones desde la landing page
 * 
 * Este módulo verifica JWT firmados criptográficamente que contienen datos de
 * cotización de precios enviados desde sst-colombia.com.co
 * 
 * SEGURIDAD:
 * - Los JWT están firmados con HMAC-SHA256 usando JWT_SECRET compartido
 * - Expiran en 30 minutos para prevenir replay attacks
 * - Los precios NO se recalculan - se confía en el JWT firmado
 * 
 * @module jwt-quote-verifier
 */

import jwt from "jsonwebtoken";

/**
 * Estructura del payload del JWT de cotización
 * Contiene todos los datos necesarios para crear una suscripción
 */
export interface QuotePayload {
  sub_data: {
    base_monthly_price: number;       // Precio base mensual (sin descuento)
    current_period_price: number;     // Precio a cobrar este período (con descuento si aplica)
    discount_duration_months: number; // Meses que dura el descuento
    currency: "COP";
  };
  metadata: {
    employees: number;                // Número de empleados
    risk_level: "I" | "II" | "III" | "IV" | "V";
    vehicles: number;                 // Vehículos para PESV
    coupon_code: string | null;       // Código del cupón aplicado
  };
  referral: {
    referrer_id: string;              // ID de la empresa que refirió
    program_type: "aliados_2026";
  } | null;
  iat: number;                        // Timestamp de creación
  exp: number;                        // Timestamp de expiración
}

/**
 * Valida la estructura del payload decodificado
 * Previene ataques de inyección de datos malformados
 */
function validatePayloadStructure(payload: unknown): payload is QuotePayload {
  if (!payload || typeof payload !== 'object') return false;
  
  const p = payload as Record<string, unknown>;
  
  // Validar sub_data
  if (!p.sub_data || typeof p.sub_data !== 'object') return false;
  const subData = p.sub_data as Record<string, unknown>;
  if (typeof subData.base_monthly_price !== 'number') return false;
  if (typeof subData.current_period_price !== 'number') return false;
  if (typeof subData.discount_duration_months !== 'number') return false;
  if (subData.currency !== 'COP') return false;
  
  // Validar que los precios sean razonables (no negativos, no absurdamente altos)
  if (subData.base_monthly_price < 0 || subData.base_monthly_price > 100000000) return false;
  if (subData.current_period_price < 0 || subData.current_period_price > 100000000) return false;
  if (subData.discount_duration_months < 0 || subData.discount_duration_months > 24) return false;
  
  // Validar metadata
  if (!p.metadata || typeof p.metadata !== 'object') return false;
  const metadata = p.metadata as Record<string, unknown>;
  if (typeof metadata.employees !== 'number' || metadata.employees < 1 || metadata.employees > 10000) return false;
  if (!['I', 'II', 'III', 'IV', 'V'].includes(metadata.risk_level as string)) return false;
  if (typeof metadata.vehicles !== 'number' || metadata.vehicles < 0 || metadata.vehicles > 1000) return false;
  
  // coupon_code puede ser null o string
  if (metadata.coupon_code !== null && typeof metadata.coupon_code !== 'string') return false;
  
  // Validar referral (puede ser null)
  if (p.referral !== null) {
    if (typeof p.referral !== 'object') return false;
    const referral = p.referral as Record<string, unknown>;
    if (typeof referral.referrer_id !== 'string') return false;
    if (referral.program_type !== 'aliados_2026') return false;
  }
  
  return true;
}

/**
 * Verifica y decodifica un JWT de cotización de sst-colombia.com.co
 * 
 * @param token - El JWT recibido en el parámetro quote
 * @returns El payload decodificado si es válido
 * @throws Error si el JWT es inválido, expirado, o fue manipulado
 */
export function verifyQuoteJWT(token: string): QuotePayload {
  const JWT_SECRET = process.env.LANDING_PAGE_API_KEY;
  
  if (!JWT_SECRET) {
    console.error("[JWT-Quote] LANDING_PAGE_API_KEY not configured");
    throw new Error("Configuración de seguridad incompleta");
  }
  
  // Validar formato básico del token antes de procesar
  if (!token || typeof token !== 'string' || token.length > 5000) {
    throw new Error("Token de cotización inválido");
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Solo aceptar HMAC-SHA256
      maxAge: '30m',         // Rechazar tokens con más de 30 minutos
    });
    
    // Validar estructura del payload
    if (!validatePayloadStructure(decoded)) {
      console.error("[JWT-Quote] Payload structure validation failed");
      throw new Error("Estructura de cotización inválida");
    }
    
    console.log("[JWT-Quote] ✅ Quote JWT verified successfully", {
      employees: (decoded as QuotePayload).metadata.employees,
      riskLevel: (decoded as QuotePayload).metadata.risk_level,
      coupon: (decoded as QuotePayload).metadata.coupon_code || 'none',
      hasReferral: !!(decoded as QuotePayload).referral
    });
    
    return decoded as QuotePayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("[JWT-Quote] Token expired");
      throw new Error("La cotización ha expirado. Por favor, genera una nueva desde la página principal.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn("[JWT-Quote] Invalid token:", error.message);
      throw new Error("Cotización inválida o manipulada.");
    }
    throw error;
  }
}

/**
 * Intenta decodificar como JWT firmado, con fallback a base64 legacy
 * Esto permite compatibilidad con versiones anteriores durante la transición
 * 
 * NOTA: El fallback a base64 debe eliminarse después de confirmar que la
 * landing page está completamente actualizada
 * 
 * @param token - El token recibido (puede ser JWT o base64)
 * @returns El payload decodificado
 */
export function decodeQuoteWithFallback(token: string): QuotePayload {
  // Validar entrada básica
  if (!token || typeof token !== 'string') {
    throw new Error("Token de cotización requerido");
  }
  
  // Detectar si es JWT (tiene formato header.payload.signature)
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  
  if (jwtPattern.test(token)) {
    // Es formato JWT - usar verificación criptográfica
    return verifyQuoteJWT(token);
  }
  
  // Fallback a base64 legacy (formato anterior)
  // ADVERTENCIA: Este código debe eliminarse cuando la landing esté completamente migrada
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    
    // Validar estructura incluso para legacy
    if (!validatePayloadStructure(decoded)) {
      throw new Error("Estructura de cotización legacy inválida");
    }
    
    console.warn("[JWT-Quote] ⚠️ WARNING: Received legacy base64 quote. Landing page needs update.");
    return decoded as QuotePayload;
  } catch (base64Error) {
    console.error("[JWT-Quote] Failed to decode as base64:", base64Error);
    throw new Error("Formato de cotización no reconocido");
  }
}

/**
 * Extrae información resumida del quote para logging seguro
 * No expone datos sensibles
 */
export function getQuoteSummary(quote: QuotePayload): string {
  return `${quote.metadata.employees} empleados, Riesgo ${quote.metadata.risk_level}, ` +
         `${quote.metadata.vehicles} vehículos, ` +
         `Precio: ${quote.sub_data.current_period_price} COP` +
         (quote.metadata.coupon_code ? `, Cupón: ${quote.metadata.coupon_code}` : '') +
         (quote.referral ? `, Referido por: ${quote.referral.referrer_id}` : '');
}
