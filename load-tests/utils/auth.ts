/**
 * Utilidades de autenticación para load tests
 * SST Colombia - Bloque 5: Validación Integral
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

interface LoginResponse {
  success: boolean;
  sessionCookie?: string;
  error?: string;
}

/**
 * Realiza login y obtiene cookie de sesión
 * Usa credenciales de usuario admin por defecto
 */
export async function login(
  username: string = 'admin',
  password: string = 'admin123'
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      redirect: 'manual',
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        error: `Login failed with status ${response.status}: ${body}`,
      };
    }

    // Extraer cookie de sesión
    const setCookieHeader = response.headers.get('set-cookie');
    
    if (!setCookieHeader) {
      return {
        success: false,
        error: 'No session cookie received',
      };
    }

    // Parsear cookie (extraer solo el valor antes del primer ;)
    const sessionCookie = setCookieHeader.split(';')[0];

    return {
      success: true,
      sessionCookie,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verifica si una sesión es válida
 */
export async function verifySession(sessionCookie: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/user`, {
      headers: {
        Cookie: sessionCookie,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtiene o reutiliza una sesión autenticada
 * Cache simple para evitar múltiples logins
 */
let cachedSession: { cookie: string; timestamp: number } | null = null;
const SESSION_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export async function getAuthenticatedSession(): Promise<string | undefined> {
  // Verificar cache
  if (cachedSession) {
    const age = Date.now() - cachedSession.timestamp;
    
    if (age < SESSION_CACHE_TTL) {
      // Verificar que la sesión sigue válida
      const isValid = await verifySession(cachedSession.cookie);
      
      if (isValid) {
        console.log('✅ Reutilizando sesión cacheada');
        return cachedSession.cookie;
      }
    }
  }

  // Login nuevo
  console.log('🔐 Iniciando sesión...');
  
  // Obtener credenciales de env o usar defaults
  const username = process.env.TEST_USERNAME || 'admin';
  const password = process.env.TEST_PASSWORD || 'admin123';
  
  const loginResult = await login(username, password);

  if (!loginResult.success || !loginResult.sessionCookie) {
    console.warn(`⚠️  Login failed: ${loginResult.error}`);
    console.warn(`⚠️  Continuando sin autenticación (algunos endpoints pueden fallar)`);
    console.warn(`⚠️  Para tests con auth, configurar TEST_USERNAME y TEST_PASSWORD en env`);
    return undefined; // Retornar undefined en lugar de throw
  }

  console.log('✅ Sesión autenticada exitosamente');

  // Cachear sesión
  cachedSession = {
    cookie: loginResult.sessionCookie,
    timestamp: Date.now(),
  };

  return loginResult.sessionCookie;
}
