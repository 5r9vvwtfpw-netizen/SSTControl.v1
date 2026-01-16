/**
 * Load Test: API Endpoints Críticos
 * SST Colombia - Bloque 5: Validación Integral
 * 
 * Pruebas de carga para endpoints core del sistema:
 * - GET /api/workers (listado de trabajadores)
 * - GET /api/incidents (listado de incidentes)
 * - GET /api/trainings (listado de capacitaciones)
 * - POST /api/workers (creación de trabajador)
 */

import {
  measureRequest,
  generateReport,
  printReport,
  sleep,
  type RequestResult,
  type LoadTestConfig,
} from '../utils/metrics';
import { getAuthenticatedSession } from '../utils/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

interface TestScenario {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  virtualUsers: number;
  duration: number; // seconds
}

/**
 * Configuración de escenarios de prueba
 */
const SCENARIOS: TestScenario[] = [
  {
    name: 'Listado de Trabajadores',
    endpoint: '/api/workers',
    method: 'GET',
    virtualUsers: 50, // 50 usuarios concurrentes
    duration: 30, // 30 segundos
  },
  {
    name: 'Listado de Incidentes/Accidentes',
    endpoint: '/api/incidents',
    method: 'GET',
    virtualUsers: 30,
    duration: 30,
  },
  {
    name: 'Listado de Capacitaciones',
    endpoint: '/api/trainings',
    method: 'GET',
    virtualUsers: 25,
    duration: 30,
  },
  {
    name: 'Listado de Inspecciones',
    endpoint: '/api/inspections',
    method: 'GET',
    virtualUsers: 20,
    duration: 30,
  },
];

/**
 * Ejecuta un escenario de load testing
 */
async function runScenario(
  scenario: TestScenario,
  sessionCookie?: string
): Promise<{ pass: boolean; report: any }> {
  console.log(`\n🚀 Iniciando escenario: ${scenario.name}`);
  console.log(`   Endpoint: ${scenario.method} ${scenario.endpoint}`);
  console.log(`   Usuarios Virtuales: ${scenario.virtualUsers}`);
  console.log(`   Duración: ${scenario.duration}s`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }

  const url = `${BASE_URL}${scenario.endpoint}`;
  const results: RequestResult[] = [];
  const startTime = Date.now();
  const endTime = startTime + scenario.duration * 1000;

  // Calcular requests por segundo por usuario virtual
  const requestsPerSecond = 2; // Cada usuario hace ~2 requests/segundo
  const delayBetweenRequests = 1000 / requestsPerSecond;

  // Ejecutar requests concurrentemente
  const userPromises = Array.from({ length: scenario.virtualUsers }, async (_, userIndex) => {
    while (Date.now() < endTime) {
      const result = await measureRequest(url, {
        method: scenario.method,
        headers,
        body: scenario.body ? JSON.stringify(scenario.body) : undefined,
      });

      results.push(result);

      // Pequeño delay entre requests
      await sleep(delayBetweenRequests + Math.random() * 100);
    }
  });

  await Promise.all(userPromises);

  const totalDuration = Date.now() - startTime;
  const report = generateReport(scenario.endpoint, results, totalDuration);
  const validation = printReport(report);

  return {
    pass: validation.overallPass,
    report,
  };
}

/**
 * Ejecuta todos los escenarios de API endpoints
 */
export async function runApiEndpointsLoadTest(sessionCookie?: string): Promise<{
  allPass: boolean;
  results: any[];
}> {
  console.log('\n' + '═'.repeat(80));
  console.log('🔥 LOAD TEST: API ENDPOINTS CRÍTICOS');
  console.log('═'.repeat(80));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Escenarios: ${SCENARIOS.length}`);
  console.log(`Target: p95 < 400ms, Success Rate ≥ 99%`);
  console.log('═'.repeat(80));

  // Obtener sesión autenticada si no se proveyó
  if (!sessionCookie) {
    sessionCookie = await getAuthenticatedSession();
    
    if (!sessionCookie) {
      console.warn('⚠️  No se pudo obtener sesión autenticada');
      console.warn('⚠️  Los tests continuarán pero pueden retornar 401 Unauthorized');
    }
  }

  const results: Array<{ pass: boolean; report: any }> = [];
  let allPass = true;

  for (const scenario of SCENARIOS) {
    const result = await runScenario(scenario, sessionCookie);
    results.push(result);

    if (!result.pass) {
      allPass = false;
    }

    // Pausa entre escenarios
    await sleep(5000);
  }

  // Resumen final
  console.log('\n' + '═'.repeat(80));
  console.log('📋 RESUMEN FINAL - API ENDPOINTS');
  console.log('═'.repeat(80));

  const passedCount = results.filter(r => r.pass).length;
  const failedCount = results.length - passedCount;

  console.log(`Total Scenarios: ${results.length}`);
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`\nOverall Result: ${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('═'.repeat(80) + '\n');

  return {
    allPass,
    results,
  };
}

// Ejecutar si es el script principal
if (import.meta.url === `file://${process.argv[1]}`) {
  runApiEndpointsLoadTest()
    .then(({ allPass }) => {
      process.exit(allPass ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error ejecutando load test:', error);
      process.exit(1);
    });
}
