// server/lso-directory-client.ts
// Cliente para conectar con LSO Directory Plugin API
// NUEVO archivo - No modifica código existente

const API_BASE = process.env.LSO_DIRECTORY_API_URL || "https://lso.sst-colombia.com.co";
const API_KEY = process.env.LANDING_PAGE_API_KEY;

interface TokenResponse {
  ok: boolean;
  data?: {
    token: string;
    expiresAt: string;
  };
  error?: string;
}

interface SearchParams {
  name?: string;
  department?: string;
  city?: string;
  professionType?: string;
  limit?: number;
  offset?: number;
}

interface LSOProfessional {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  department?: string;
  professionType?: string;
  licenseNumber?: string;
  status: string;
}

interface SearchResponse {
  ok: boolean;
  data?: LSOProfessional[];
  total?: number;
  error?: string;
}

interface ContactData {
  lsoRegistrationId: number;
  status?: "contactado" | "en_discusión" | "rechazado" | "sin_respuesta" | "contratado";
  notes?: string;
}

// Cache para el token JWT
let cachedToken: { token: string; expiresAt: Date } | null = null;

// Obtener token JWT (handshake seguro)
export async function getJwtToken(clientId: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("LANDING_PAGE_API_KEY not configured");
  }

  // Verificar si hay token en cache y no ha expirado
  if (cachedToken && cachedToken.expiresAt > new Date(Date.now() + 60000)) {
    return cachedToken.token;
  }

  console.log(`[LSO Client] Requesting JWT token from ${API_BASE}/api/external/token`);

  const response = await fetch(`${API_BASE}/api/external/token`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      clientId,
      permissions: ["read", "write"],
      expiresIn: "24h"
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[LSO Client] Token request failed: ${response.status} - ${text}`);
    throw new Error(`Token request failed: ${response.status}`);
  }

  const result: TokenResponse = await response.json();
  
  if (!result.ok || !result.data) {
    throw new Error(result.error || "Failed to get JWT token");
  }

  console.log("[LSO Client] JWT token obtained successfully");

  // Guardar en cache
  cachedToken = {
    token: result.data.token,
    expiresAt: new Date(result.data.expiresAt)
  };

  return cachedToken.token;
}

// Buscar profesionales LSO en el directorio externo
export async function searchLSOProfessionals(
  clientId: string,
  params: SearchParams
): Promise<SearchResponse> {
  const token = await getJwtToken(clientId);
  
  const queryParams = new URLSearchParams();
  if (params.name) queryParams.set("name", params.name);
  if (params.department) queryParams.set("department", params.department);
  if (params.city) queryParams.set("city", params.city);
  if (params.professionType) queryParams.set("professionType", params.professionType);
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.offset) queryParams.set("offset", params.offset.toString());

  const url = `${API_BASE}/api/public/search?${queryParams}`;
  console.log(`[LSO Client] Searching professionals: ${url}`);

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[LSO Client] Search failed: ${response.status} - ${text}`);
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

// Crear contacto con un profesional
export async function createContact(
  clientId: string,
  data: ContactData
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const token = await getJwtToken(clientId);

  console.log(`[LSO Client] Creating contact for registration ${data.lsoRegistrationId}`);

  const response = await fetch(`${API_BASE}/api/public/contacts`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

// Obtener contactos de la empresa
export async function getCompanyContacts(
  clientId: string,
  params?: { status?: string; search?: string }
): Promise<{ ok: boolean; data?: any[]; error?: string }> {
  const token = await getJwtToken(clientId);

  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set("status", params.status);
  if (params?.search) queryParams.set("search", params.search);

  const response = await fetch(`${API_BASE}/api/public/contacts?${queryParams}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response.json();
}

// Actualizar estado de contacto
export async function updateContactStatus(
  clientId: string,
  contactId: number,
  status: string,
  notes?: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const token = await getJwtToken(clientId);

  const response = await fetch(`${API_BASE}/api/public/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status, notes })
  });

  return response.json();
}

// Eliminar contacto
export async function deleteContact(
  clientId: string,
  contactId: number
): Promise<{ ok: boolean; error?: string }> {
  const token = await getJwtToken(clientId);

  const response = await fetch(`${API_BASE}/api/public/contacts/${contactId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response.json();
}

// Test de conexión
export async function testConnection(clientId: string): Promise<boolean> {
  try {
    console.log("[LSO Client] Testing connection...");
    const result = await searchLSOProfessionals(clientId, { limit: 1 });
    console.log("[LSO Client] Connection test result:", result.ok);
    return result.ok === true;
  } catch (error) {
    console.error("[LSO Client] Connection test failed:", error);
    return false;
  }
}
