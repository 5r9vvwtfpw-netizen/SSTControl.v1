/**
 * Load Test: Dashboards PHVA
 * SST Colombia - Bloque 5: Validación Integral
 * 
 * Pruebas de carga para dashboards ejecutivos del ciclo PHVA:
 * - GET /api/dashboard/hacer
 * - GET /api/dashboard/verificar (CRÍTICO - recién corregido Task 24)
 * - GET /api/dashboard/actuar
 * 
 * Target: p95 < 2000ms (dashboards son más pesados que APIs simples)
 */

import {
  measureRequest,
  generateReport,
  printReport,
  sleep,
  type RequestResult,
  type MetricsReport,
} from '../utils/metrics';
import { getAuthenticatedSession } from '../utils/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

interface DashboardScenario {
  name: string;
  endpoint: string;
  virtualUsers: number;
  duration: number; // seconds
  p95Target: number; // ms
}

/**
 * Configuración de escenarios de prueba para dashboards
 */
const DASHBOARD_SCENARIOS: DashboardScenario[] = [
  {
    name: 'Dashboard HACER',
    endpoint: '/api/dashboard/hacer',
    virtualUsers: 40,
    duration: 30,
    p95Target: 2000, // 2 segundos
  },
  {
    name: 'Dashboard VERIFICAR',
    endpoint: '/api/dashboard/verificar',
    virtualUsers: 40,
    duration: 30,
    p95Target: 2000,
  },
  {
    name: 'Dashboard ACTUAR',
    endpoint: '/api/dashboard/actuar',
    virtualUsers: 40,
    duration: 30,
    p95Target: 2000,
  },
];

/**
 * Imprime reporte de métricas con target custom para dashboards
 */
function printDashboardReport(report: MetricsReport, p95Target: number) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 DASHBOARD LOAD TEST REPORT: ${report.endpoint}`);
  console.log('='.repeat(80));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`\n📈 Request Summary:`);
  console.log(`  Total Requests:      ${report.totalRequests}`);
  console.log(`  Successful:          ${report.successfulRequests} (${report.successRate.toFixed(2)}%)`);
  console.log(`  Failed:              ${report.failedRequests}`);
  console.log(`  Throughput:          ${report.throughput.toFixed(2)} req/s`);
  
  console.log(`\n⏱️  Response Time (ms):`);
  console.log(`  Min:                 ${report.duration.min.toFixed(2)}`);
  console.log(`  Mean:                ${report.duration.mean.toFixed(2)}`);
  console.log(`  Median (p50):        ${report.duration.median.toFixed(2)}`);
  console.log(`  p95:                 ${report.duration.p95.toFixed(2)}`);
  console.log(`  p99:                 ${report.duration.p99.toFixed(2)}`);
  console.log(`  Max:                 ${report.duration.max.toFixed(2)}`);
  
  if (Object.keys(report.errors).length > 0) {
    console.log(`\n❌ Errors:`);
    Object.entries(report.errors).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}`);
    });
  }
  
  // Validar objetivos (custom p95 target)
  console.log(`\n🎯 Performance Targets:`);
  const p95Pass = report.duration.p95 <= p95Target;
  console.log(`  p95 < ${p95Target}ms:       ${p95Pass ? '✅ PASS' : '❌ FAIL'} (${report.duration.p95.toFixed(2)}ms)`);
  
  const successRateTarget = 99;
  const successRatePass = report.successRate >= successRateTarget;
  console.log(`  Success Rate ≥ ${successRateTarget}%:  ${successRatePass ? '✅ PASS' : '❌ FAIL'} (${report.successRate.toFixed(2)}%)`);
  
  console.log('='.repeat(80) + '\n');
  
  return {
    p95Pass,
    successRatePass,
    overallPass: p95Pass && successRatePass,
  };
}

/**
 * Ejecuta un escenario de load testing para dashboard
 */
async function runDashboardScenario(
  scenario: DashboardScenario,
  sessionCookie?: string
): Promise<{ pass: boolean; report: MetricsReport }> {
  console.log(`\n🚀 Iniciando escenario: ${scenario.name}`);
  console.log(`   Endpoint: GET ${scenario.endpoint}`);
  console.log(`   Usuarios Virtuales: ${scenario.virtualUsers}`);
  console.log(`   Duración: ${scenario.duration}s`);
  console.log(`   Target p95: ${scenario.p95Target}ms`);

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

  // Dashboards son consultados menos frecuentemente que APIs
  const requestsPerSecond = 1; // Cada usuario hace ~1 request/segundo
  const delayBetweenRequests = 1000 / requestsPerSecond;

  // Ejecutar requests concurrentemente
  const userPromises = Array.from({ length: scenario.virtualUsers }, async (_, userIndex) => {
    while (Date.now() < endTime) {
      const result = await measureRequest(url, {
        method: 'GET',
        headers,
      });

      results.push(result);

      // Delay entre requests (con jitter)
      await sleep(delayBetweenRequests + Math.random() * 500);
    }
  });

  await Promise.all(userPromises);

  const totalDuration = Date.now() - startTime;
  const report = generateReport(scenario.endpoint, results, totalDuration);
  const validation = printDashboardReport(report, scenario.p95Target);

  return {
    pass: validation.overallPass,
    report,
  };
}

/**
 * Ejecuta todos los escenarios de dashboards
 */
export async function runDashboardsLoadTest(sessionCookie?: string): Promise<{
  allPass: boolean;
  results: Array<{ pass: boolean; report: MetricsReport }>;
}> {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 LOAD TEST: DASHBOARDS PHVA');
  console.log('═'.repeat(80));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Escenarios: ${DASHBOARD_SCENARIOS.length}`);
  console.log(`Target: p95 < 2000ms, Success Rate ≥ 99%`);
  console.log('═'.repeat(80));

  // Obtener sesión autenticada si no se proveyó
  if (!sessionCookie) {
    sessionCookie = await getAuthenticatedSession();
    
    if (!sessionCookie) {
      console.warn('⚠️  No se pudo obtener sesión autenticada');
      console.warn('⚠️  Los tests continuarán pero pueden retornar 401 Unauthorized');
    }
  }

  const results: Array<{ pass: boolean; report: MetricsReport }> = [];
  let allPass = true;

  for (const scenario of DASHBOARD_SCENARIOS) {
    const result = await runDashboardScenario(scenario, sessionCookie);
    results.push(result);

    if (!result.pass) {
      allPass = false;
    }

    // Pausa entre escenarios
    await sleep(5000);
  }

  // Resumen final
  console.log('\n' + '═'.repeat(80));
  console.log('📋 RESUMEN FINAL - DASHBOARDS PHVA');
  console.log('═'.repeat(80));

  const passedCount = results.filter(r => r.pass).length;
  const failedCount = results.length - passedCount;

  console.log(`Total Dashboards: ${results.length}`);
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
  runDashboardsLoadTest()
    .then(({ allPass }) => {
      process.exit(allPass ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error ejecutando load test:', error);
      process.exit(1);
    });
}
