import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper para extraer mensajes de error legibles en español
function extractErrorMessage(text: string): string {
  // Si está vacío, usar mensaje genérico
  if (!text || text.trim() === '') {
    return "Ocurrió un error inesperado";
  }

  // Intentar parsear como JSON
  try {
    const parsed = JSON.parse(text);
    
    // Caso 1: Array de errores de Zod (ej: [{message: "..."}])
    if (Array.isArray(parsed)) {
      const messages = parsed
        .map((err: any) => err.message)
        .filter((msg: string) => msg && typeof msg === 'string');
      if (messages.length > 0) {
        return messages.join(". ");
      }
    }
    
    // Caso 2: Objeto con propiedad "message"
    if (parsed.message && typeof parsed.message === 'string') {
      if (parsed.details && typeof parsed.details === 'string') {
        return `${parsed.message}. ${parsed.details}`;
      }
      return parsed.message;
    }
    
    // Caso 3: Objeto con propiedad "error"
    if (parsed.error && typeof parsed.error === 'string') {
      if (parsed.details && typeof parsed.details === 'string') {
        return `${parsed.error}: ${parsed.details}`;
      }
      return parsed.error;
    }
    
    // Caso 4: Objeto con array de errores
    if (parsed.errors && Array.isArray(parsed.errors)) {
      const messages = parsed.errors
        .map((err: any) => err.message)
        .filter((msg: string) => msg && typeof msg === 'string');
      if (messages.length > 0) {
        return messages.join(". ");
      }
    }
    
    // Si no coincide ningún formato conocido, devolver el texto original
    return text;
  } catch {
    // No es JSON válido, devolver el texto tal cual
    return text;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    try {
      const parsed = JSON.parse(text);
      if (parsed.error === "demo_readonly" || parsed.error === "demo_blocked") {
        const demoError = new Error(parsed.message || "Función no disponible en la demostración");
        (demoError as any).isDemoReadonly = true;
        throw demoError;
      }
    } catch (e) {
      if ((e as any).isDemoReadonly) throw e;
    }
    const friendlyMessage = extractErrorMessage(text);
    throw new Error(friendlyMessage);
  }
}

// Helper to get the selected company ID from localStorage (for superadmin or LSO)
function getSelectedCompanyId(): string | null {
  try {
    const session = localStorage.getItem("superadmin_access_session");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.companyId) return parsed.companyId;
    }
  } catch {
    // Ignore parse errors
  }
  // Vault navigation context: set by DetalleEvaluacionSst/Pesv when superadmin views a company's
  // evaluation. Applied when: (1) navigating via sub-modules with ?from=evaluation in URL, or
  // (2) on any /pesv/evaluacion/* route (all 24 PESV steps share the same evaluation context).
  try {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPesvEvaluacionRoute = typeof window !== 'undefined' &&
      window.location.pathname.match(/^\/pesv\/evaluacion\//);
    if (params.get('from') === 'evaluation' || isPesvEvaluacionRoute) {
      const vaultCompany = localStorage.getItem("superadmin_vault_company");
      if (vaultCompany) return vaultCompany;
    }
  } catch {
    // Ignore errors
  }
  try {
    const lsoContext = localStorage.getItem("lso_company_context");
    if (lsoContext) {
      const parsed = JSON.parse(lsoContext);
      if (parsed.companyId) return parsed.companyId;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Build headers including X-Company-Id for superadmin context
export function buildHeaders(includeContentType: boolean = false): HeadersInit {
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  const selectedCompanyId = getSelectedCompanyId();
  if (selectedCompanyId) {
    headers["X-Company-Id"] = selectedCompanyId;
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: buildHeaders(!!data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: buildHeaders(false),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 5_000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
