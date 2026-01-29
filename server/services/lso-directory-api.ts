/**
 * LSO Directory API Client
 * 
 * Servicio para integración con la API externa del Directorio de LSO
 * URL Base: https://lso.sst-colombia.com.co
 * 
 * Este servicio permite:
 * - Consultar el directorio de profesionales LSO confirmados
 * - Obtener detalles de un LSO específico
 * - Sincronizar datos para asignación a empresas
 * 
 * Flujo de autenticación:
 * 1. Usar LANDING_PAGE_API_KEY para obtener un JWT token
 * 2. Usar ese JWT token para todas las consultas subsiguientes
 */

const LSO_API_BASE_URL = process.env.LSO_API_BASE_URL || 'https://lso.sst-colombia.com.co';
const LANDING_PAGE_API_KEY = process.env.LANDING_PAGE_API_KEY || '';

export interface LsoRegistration {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'email_failed';
  confirmedAt: string | null;
  createdAt: string;
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiry?: string;
  professionType?: string;
  signatureUrl?: string;
  documentId?: string;
}

export interface LsoDirectoryResponse {
  ok: boolean;
  data: LsoRegistration[];
  total: number;
  limit: number;
  offset: number;
}

export interface LsoApiError {
  ok: false;
  code?: string;
  error: string;
}

interface TokenResponse {
  ok: boolean;
  data: {
    token: string;
    expiresAt: string;
  };
}

/**
 * Cliente para la API del Directorio LSO
 */
export class LsoDirectoryApiClient {
  private baseUrl: string;
  private landingApiKey: string;
  private jwtToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor() {
    this.baseUrl = LSO_API_BASE_URL;
    this.landingApiKey = LANDING_PAGE_API_KEY;
  }

  /**
   * Verifica si la API está configurada correctamente
   */
  isConfigured(): boolean {
    return !!this.landingApiKey && this.landingApiKey.length > 0;
  }

  /**
   * Obtiene un JWT token para autenticación
   */
  private async getJwtToken(): Promise<string> {
    if (this.jwtToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.jwtToken;
    }

    console.log('[LSO-API] Requesting new JWT token...');

    const response = await fetch(`${this.baseUrl}/api/external/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.landingApiKey}`,
      },
      body: JSON.stringify({
        clientId: 'sst-colombia',
        permissions: ['read'],
        expiresIn: '30d',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[LSO-API] Failed to get JWT token:', data.error);
      throw new Error(data.error || 'Error al obtener token JWT del Directorio LSO');
    }

    const tokenData = data as TokenResponse;
    this.jwtToken = tokenData.data.token;
    this.tokenExpiresAt = new Date(tokenData.data.expiresAt);

    console.log('[LSO-API] JWT token obtained, expires at:', this.tokenExpiresAt.toISOString());
    return this.jwtToken;
  }

  /**
   * Realiza una petición a la API externa
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('LANDING_PAGE_API_KEY no está configurada. Configura la variable de entorno.');
    }

    const token = await this.getJwtToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!data.ok) {
      const error = data as LsoApiError;
      throw new Error(error.error || 'Error en la API del Directorio LSO');
    }

    return data as T;
  }

  /**
   * Obtiene la lista de profesionales LSO confirmados
   * @param options Opciones de filtrado y paginación
   */
  async getConfirmedRegistrations(options: {
    limit?: number;
    offset?: number;
    since?: Date;
  } = {}): Promise<LsoDirectoryResponse> {
    const params = new URLSearchParams();
    params.append('status', 'confirmed');
    
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }
    if (options.since) {
      params.append('since', options.since.toISOString());
    }

    return this.request<LsoDirectoryResponse>(
      `/api/external/registrations?${params.toString()}`
    );
  }

  /**
   * Obtiene todos los profesionales LSO confirmados (con paginación automática)
   */
  async getAllConfirmedRegistrations(): Promise<LsoRegistration[]> {
    const allRegistrations: LsoRegistration[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const result = await this.getConfirmedRegistrations({ limit, offset });
      allRegistrations.push(...result.data);

      if (result.data.length < limit) {
        break;
      }

      offset += limit;
    }

    return allRegistrations;
  }

  /**
   * Busca profesionales LSO por nombre o ciudad
   * @param query Texto de búsqueda
   */
  async searchLso(query: string): Promise<LsoRegistration[]> {
    const allRegistrations = await this.getAllConfirmedRegistrations();
    const queryLower = query.toLowerCase();

    return allRegistrations.filter(lso => 
      lso.fullName.toLowerCase().includes(queryLower) ||
      lso.city.toLowerCase().includes(queryLower) ||
      lso.email.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Obtiene un profesional LSO por su ID externo
   * @param externalId ID del LSO en el directorio externo
   */
  async getLsoById(externalId: number): Promise<LsoRegistration | null> {
    const allRegistrations = await this.getAllConfirmedRegistrations();
    return allRegistrations.find(lso => lso.id === externalId) || null;
  }

  /**
   * Obtiene nuevos registros desde una fecha específica (para sincronización incremental)
   * @param sinceDate Fecha desde la cual buscar nuevos registros
   */
  async getNewRegistrations(sinceDate: Date): Promise<LsoRegistration[]> {
    const result = await this.getConfirmedRegistrations({ since: sinceDate });
    return result.data;
  }
}

export const lsoDirectoryApi = new LsoDirectoryApiClient();
