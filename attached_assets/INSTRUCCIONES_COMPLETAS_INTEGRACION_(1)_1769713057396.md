# Instrucciones Completas de Integración con LSO Directory API

## IMPORTANTE: Principio de solo agregar
- Solo agregar NUEVO código y archivos
- NO modificar ni eliminar código existente
- Preservar toda la funcionalidad actual

---

## PASO 1: Configurar Secrets

Agregar estas 3 variables de entorno como **secrets**:

| Variable | Valor |
|----------|-------|
| `LANDING_PAGE_API_KEY` | `tiV0o//Qhm6GqL6RYnTtrX3fDh5gsvkNNW4Wuk7zstQ=` |
| `JWT_SECRET` | `CQcG2mZNrdM4JZ8rDqGpTgV4IUGChqUFgl6qgo9Ga/Pf+kHivJydldC+ThZclPNg` |
| `LSO_DIRECTORY_API_URL` | `https://lso.sst-colombia.com.co` |

---

## PASO 2: Crear NUEVO archivo cliente API

Crear el archivo `server/lso-directory-client.ts`:

```typescript
// server/lso-directory-client.ts
// Cliente para conectar con LSO Directory Plugin API

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
```

---

## PASO 3: Agregar NUEVAS rutas al servidor

Agregar estas rutas al **FINAL** del archivo de rutas existente (NO modificar rutas existentes):

```typescript
// ============================================
// NUEVAS RUTAS - Integración LSO Directory API
// Agregar al FINAL del archivo de rutas
// ============================================

import { 
  searchLSOProfessionals, 
  createContact, 
  getCompanyContacts,
  updateContactStatus,
  testConnection
} from "./lso-directory-client";

// Identificador único para esta aplicación
const COMPANY_CLIENT_ID = "sst-colombia-landing";

// Test de conexión con LSO Directory
app.get("/api/lso/test", async (req, res) => {
  try {
    const success = await testConnection(COMPANY_CLIENT_ID);
    return res.json({ 
      ok: success, 
      message: success ? "Conexión exitosa" : "Error de conexión"
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Buscar profesionales en directorio externo LSO
app.get("/api/lso/search", async (req, res) => {
  try {
    const { name, department, city, professionType, limit, offset } = req.query;
    
    const result = await searchLSOProfessionals(COMPANY_CLIENT_ID, {
      name: name as string,
      department: department as string,
      city: city as string,
      professionType: professionType as string,
      limit: limit ? parseInt(limit as string) : 10,
      offset: offset ? parseInt(offset as string) : 0
    });

    return res.json(result);
  } catch (error: any) {
    console.error("LSO search error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Contactar a un profesional
app.post("/api/lso/contact", async (req, res) => {
  try {
    const { lsoRegistrationId, notes } = req.body;
    
    if (!lsoRegistrationId) {
      return res.status(400).json({ ok: false, error: "lsoRegistrationId requerido" });
    }

    const result = await createContact(COMPANY_CLIENT_ID, {
      lsoRegistrationId: parseInt(lsoRegistrationId),
      status: "contactado",
      notes
    });

    return res.json(result);
  } catch (error: any) {
    console.error("LSO contact error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Obtener mis contactos
app.get("/api/lso/contacts", async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const result = await getCompanyContacts(COMPANY_CLIENT_ID, {
      status: status as string,
      search: search as string
    });

    return res.json(result);
  } catch (error: any) {
    console.error("LSO contacts error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Actualizar estado de contacto
app.patch("/api/lso/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ ok: false, error: "status requerido" });
    }

    const result = await updateContactStatus(
      COMPANY_CLIENT_ID,
      parseInt(id),
      status,
      notes
    );

    return res.json(result);
  } catch (error: any) {
    console.error("LSO update contact error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});
```

---

## PASO 4: Probar la conexión

Después de configurar todo, probar con:

```bash
curl http://localhost:5000/api/lso/test
```

Respuesta esperada:
```json
{"ok": true, "message": "Conexión exitosa"}
```

---

## Resumen de URLs del API externo

| URL | Descripción |
|-----|-------------|
| `https://lso.sst-colombia.com.co` | Dominio personalizado (recomendado) |
| `https://lso-directory-plugin.replit.app` | Dominio Replit alternativo |

Ambas URLs funcionan igual.

---

## Estados de contacto disponibles

| Estado | Descripción |
|--------|-------------|
| `contactado` | Primer contacto realizado |
| `en_discusión` | En proceso de negociación |
| `rechazado` | Profesional rechazó la oferta |
| `sin_respuesta` | Sin respuesta del profesional |
| `contratado` | Profesional contratado |

---

## Nuevas rutas locales creadas

| Método | Ruta Local | Descripción |
|--------|------------|-------------|
| GET | `/api/lso/test` | Probar conexión |
| GET | `/api/lso/search` | Buscar profesionales |
| POST | `/api/lso/contact` | Crear contacto |
| GET | `/api/lso/contacts` | Obtener mis contactos |
| PATCH | `/api/lso/contacts/:id` | Actualizar estado |

---

## Troubleshooting

**Error: "Invalid token or API key"**
- Verificar que `LANDING_PAGE_API_KEY` está configurado correctamente como secret
- El valor debe ser exactamente: `tiV0o//Qhm6GqL6RYnTtrX3fDh5gsvkNNW4Wuk7zstQ=`

**Error: "Token request failed: 401"**
- El API key no coincide
- Verificar que ambos sistemas tienen el mismo `LANDING_PAGE_API_KEY`

**Retorna HTML en lugar de JSON**
- El header Authorization no se está enviando correctamente
- Verificar que usas `Bearer ${token}` en el header

**Error: "LANDING_PAGE_API_KEY not configured"**
- El secret no está configurado
- Agregar la variable de entorno como secret (no como variable normal)
