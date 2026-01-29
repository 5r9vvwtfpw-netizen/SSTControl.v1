/**
 * LSO Directory JWT Client
 * 
 * Cliente de integración con el Directorio Externo de LSO usando autenticación JWT
 * URL Base: https://lso.sst-colombia.com.co
 * 
 * Este servicio implementa:
 * - Autenticación JWT con token cacheado
 * - Renovación automática de token antes de expiración
 * - Búsqueda de profesionales LSO vía /api/public/search
 * 
 * Sigue el principio de "solo agregar" - archivo nuevo sin modificar existentes
 */

import logger from "../lib/logger";

const LSO_API_BASE_URL = process.env.LSO_API_BASE_URL || 'https://lso.sst-colombia.com.co';
// Usar JWT_SECRET como API key para la integración externa (según solicitud del usuario)
const LSO_API_KEY = process.env.JWT_SECRET || process.env.LANDING_PAGE_API_KEY || '';
const CLIENT_ID = 'sst-colombia';

export interface LsoPublicProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  professionType?: string;
  specialties?: string[];
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiry?: string;
  signatureUrl?: string;
  documentId?: string;
  status: 'confirmed';
  confirmedAt: string;
}

export interface LsoSearchResponse {
  ok: boolean;
  data: LsoPublicProfile[];
  total: number;
  limit: number;
  offset: number;
}

export interface LsoTokenResponse {
  ok: boolean;
  data: {
    token: string;
    expiresAt: string;
  };
}

interface CachedToken {
  token: string;
  expiresAt: Date;
}

/**
 * Cliente JWT para el Directorio LSO Externo
 * Implementa caché de token y renovación automática
 */
class LsoDirectoryJwtClient {
  private baseUrl: string;
  private apiKey: string;
  private cachedToken: CachedToken | null = null;
  
  constructor() {
    this.baseUrl = LSO_API_BASE_URL;
    this.apiKey = LSO_API_KEY;
  }

  /**
   * Verifica si el cliente está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Obtiene un token JWT nuevo desde la API externa
   */
  private async fetchNewToken(): Promise<CachedToken> {
    if (!this.isConfigured()) {
      throw new Error('[LSO-JWT] LANDING_PAGE_API_KEY no está configurada');
    }

    logger.info({}, '[LSO-JWT] Solicitando nuevo token JWT...');

    const response = await fetch(`${this.baseUrl}/api/external/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        permissions: ['read'],
        expiresIn: '30d'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, error: errorText }, '[LSO-JWT] Error obteniendo token');
      throw new Error(`[LSO-JWT] Error obteniendo token: ${response.status}`);
    }

    const result = await response.json() as LsoTokenResponse;

    if (!result.ok || !result.data?.token) {
      throw new Error('[LSO-JWT] Respuesta inválida al obtener token');
    }

    const cachedToken: CachedToken = {
      token: result.data.token,
      expiresAt: new Date(result.data.expiresAt)
    };

    logger.info({ expiresAt: cachedToken.expiresAt.toISOString() }, '[LSO-JWT] Token JWT obtenido exitosamente');

    return cachedToken;
  }

  /**
   * Obtiene el token JWT (del caché o solicita uno nuevo si expiró)
   * Renueva automáticamente 24 horas antes de expirar
   */
  private async getValidToken(): Promise<string> {
    const now = new Date();
    const renewThreshold = 24 * 60 * 60 * 1000; // 24 horas en ms

    if (this.cachedToken) {
      const timeUntilExpiry = this.cachedToken.expiresAt.getTime() - now.getTime();
      
      if (timeUntilExpiry > renewThreshold) {
        return this.cachedToken.token;
      }
      
      logger.info({}, '[LSO-JWT] Token próximo a expirar, renovando...');
    }

    this.cachedToken = await this.fetchNewToken();
    return this.cachedToken.token;
  }

  /**
   * Realiza una petición autenticada con JWT a la API pública
   */
  private async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getValidToken();
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ endpoint, status: response.status, error: errorText }, '[LSO-JWT] Error en petición');
      
      // Si el token expiró, invalidar caché y reintentar una vez
      if (response.status === 401) {
        logger.info({}, '[LSO-JWT] Token inválido, obteniendo nuevo token...');
        this.cachedToken = null;
        const newToken = await this.getValidToken();
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...options.headers,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`[LSO-JWT] Error después de renovar token: ${retryResponse.status}`);
        }

        return retryResponse.json() as Promise<T>;
      }

      throw new Error(`[LSO-JWT] Error en petición: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Busca profesionales LSO en el directorio público
   * @param query Texto de búsqueda (nombre, licencia, ciudad)
   * @param specialty Filtro por especialidad (opcional)
   * @param limit Límite de resultados (default: 50)
   * @param offset Offset para paginación (default: 0)
   */
  async searchLso(options: {
    query?: string;
    specialty?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<LsoSearchResponse> {
    if (!this.isConfigured()) {
      logger.warn({}, '[LSO-JWT] Cliente no configurado, retornando lista vacía');
      return { ok: true, data: [], total: 0, limit: 50, offset: 0 };
    }

    const params = new URLSearchParams();
    
    if (options.query) {
      params.append('q', options.query);
    }
    if (options.specialty) {
      params.append('specialty', options.specialty);
    }
    params.append('limit', (options.limit || 50).toString());
    params.append('offset', (options.offset || 0).toString());

    const endpoint = `/api/public/search?${params.toString()}`;
    
    logger.info({ query: options.query, specialty: options.specialty }, '[LSO-JWT] Buscando profesionales LSO');

    return this.authenticatedRequest<LsoSearchResponse>(endpoint);
  }

  /**
   * Obtiene un profesional LSO por su ID externo
   * @param externalId ID del LSO en el directorio externo
   */
  async getLsoById(externalId: number): Promise<LsoPublicProfile | null> {
    if (!this.isConfigured()) {
      logger.warn({}, '[LSO-JWT] Cliente no configurado');
      return null;
    }

    try {
      // Buscar por ID específico
      const endpoint = `/api/public/lso/${externalId}`;
      const response = await this.authenticatedRequest<{ ok: boolean; data: LsoPublicProfile }>(endpoint);
      
      if (response.ok && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error({ externalId, error }, '[LSO-JWT] Error obteniendo LSO por ID');
      return null;
    }
  }

  /**
   * Valida que un LSO existe y está confirmado antes de asignarlo
   * @param externalId ID del LSO en el directorio externo
   */
  async validateLsoForAssignment(externalId: number): Promise<{
    valid: boolean;
    lso?: LsoPublicProfile;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return { valid: false, error: 'Integración con directorio LSO no configurada' };
    }

    const lso = await this.getLsoById(externalId);
    
    if (!lso) {
      return { valid: false, error: 'Profesional LSO no encontrado en el directorio' };
    }

    if (lso.status !== 'confirmed') {
      return { valid: false, error: 'El profesional LSO no está confirmado en el directorio' };
    }

    // Validar que la licencia no esté expirada (si tiene fecha de expiración)
    if (lso.licenseExpiry) {
      const expiryDate = new Date(lso.licenseExpiry);
      if (expiryDate < new Date()) {
        return { valid: false, error: 'La licencia del profesional LSO ha expirado' };
      }
    }

    return { valid: true, lso };
  }

  /**
   * Invalida el token cacheado (útil para testing o forzar renovación)
   */
  invalidateToken(): void {
    this.cachedToken = null;
    logger.info({}, '[LSO-JWT] Token invalidado manualmente');
  }
}

// Exportar instancia singleton
export const lsoDirectoryJwtClient = new LsoDirectoryJwtClient();
