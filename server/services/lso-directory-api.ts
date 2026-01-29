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
 * Autenticación:
 * - Usa LSO_API_KEY directamente como Bearer token
 */

const LSO_API_BASE_URL = process.env.LSO_API_BASE_URL || 'https://lso.sst-colombia.com.co';
const LSO_API_KEY = process.env.LSO_API_KEY || '';

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

/**
 * Cliente para la API del Directorio LSO
 */
export class LsoDirectoryApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = LSO_API_BASE_URL;
    this.apiKey = LSO_API_KEY;
  }

  /**
   * Verifica si la API está configurada correctamente
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Realiza una petición a la API externa
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('LSO_API_KEY no está configurado. Configura la variable de entorno.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('[LSO-API] Making request to:', url);
    console.log('[LSO-API] Using API key:', this.apiKey.substring(0, 8) + '...');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    const data = await response.json();
    console.log('[LSO-API] Response status:', response.status);
    console.log('[LSO-API] Response ok:', data.ok);

    if (!data.ok) {
      const error = data as LsoApiError;
      console.error('[LSO-API] Request failed:', error.error);
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
