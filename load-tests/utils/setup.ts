/**
 * Setup de ambiente para load tests
 * SST Colombia - Bloque 5: Validación Integral
 * 
 * Este módulo maneja la autenticación para load tests.
 * Usa el usuario admin creado por scripts/seed-admin.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

interface SetupResult {
  success: boolean;
  username: string;
  password: string;
  sessionCookie?: string;
  error?: string;
}

/**
 * Intenta hacer login con credenciales dadas
 */
async function attemptLogin(username: string, password: string): Promise<string | null> {
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
      return null;
    }

    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) {
      return null;
    }

    return setCookieHeader.split(';')[0];
  } catch (error) {
    return null;
  }
}

/**
 * Prepara el ambiente de testing
 * Usa el usuario admin existente (creado por scripts/seed-admin.ts)
 */
export async function setupTestEnvironment(): Promise<SetupResult> {
  // Obtener credenciales de env o usar defaults
  // Por defecto usa el usuario admin creado por seed-admin.ts
  const username = process.env.TEST_USERNAME || 'admin';
  const password = process.env.TEST_PASSWORD || 'admin123';

  console.log('🔧 Configurando ambiente de testing...');
  console.log(`   Usuario: ${username}`);
  console.log(`   Base URL: ${BASE_URL}`);

  // Intentar login
  const sessionCookie = await attemptLogin(username, password);

  // Verificar resultado
  if (sessionCookie) {
    console.log('✅ Ambiente de testing configurado exitosamente');
    return {
      success: true,
      username,
      password,
      sessionCookie,
    };
  }

  // Fallo - instruir al usuario
  console.error('\n❌ ERROR: No se pudo obtener sesión autenticada');
  console.error('   El usuario admin no existe o las credenciales son incorrectas');
  console.error('\n📋 SOLUCIÓN:');
  console.error('   1. Ejecutar: npx tsx scripts/seed-admin.ts');
  console.error('   2. O configurar credenciales válidas:');
  console.error('      export TEST_USERNAME="mi_usuario"');
  console.error('      export TEST_PASSWORD="mi_password"\n');
  
  return {
    success: false,
    username,
    password,
    error: 'Could not obtain authenticated session',
  };
}

/**
 * Limpia el ambiente de testing (opcional)
 */
export async function cleanupTestEnvironment(): Promise<void> {
  // No se requiere limpieza
  console.log('🧹 Limpieza de ambiente (no requerida)');
}
