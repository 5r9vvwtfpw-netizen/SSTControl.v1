/**
 * Load Test Runner - Ejecuta todos los escenarios
 * SST Colombia - Bloque 5: Validación Integral
 * 
 * Simula carga de 50+ tenants ejecutando:
 * 1. API Endpoints críticos
 * 2. Dashboards PHVA
 * 
 * Targets:
 * - API: p95 < 400ms
 * - Dashboards: p95 < 2000ms
 * - Success Rate: ≥ 99%
 */

import { runApiEndpointsLoadTest } from './scenarios/api-endpoints';
import { runDashboardsLoadTest } from './scenarios/dashboards';
import { setupTestEnvironment } from './utils/setup';
import * as fs from 'fs';
import * as path from 'path';

interface TestSuiteResult {
  timestamp: string;
  environment: {
    baseUrl: string;
    nodeVersion: string;
  };
  apiEndpoints: {
    allPass: boolean;
    results: any[];
  };
  dashboards: {
    allPass: boolean;
    results: any[];
  };
  summary: {
    totalScenarios: number;
    passedScenarios: number;
    failedScenarios: number;
    overallPass: boolean;
  };
}

/**
 * Obtiene cookie de sesión autenticada
 * Configura el ambiente de testing automáticamente
 */
async function getSessionCookie(): Promise<string | undefined> {
  const setup = await setupTestEnvironment();
  
  if (!setup.success) {
    console.error('\n❌ ADVERTENCIA: No se pudo configurar ambiente de testing');
    console.error('   Los tests pueden fallar si los endpoints requieren autenticación');
    console.error('   Continuando de todas formas...\n');
  }
  
  return setup.sessionCookie;
}

/**
 * Guarda resultados en archivo JSON
 */
function saveResults(results: TestSuiteResult) {
  const resultsDir = path.join(process.cwd(), 'load-tests', 'results');
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const filename = `load-test-${new Date().toISOString().replace(/:/g, '-')}.json`;
  const filepath = path.join(resultsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));

  console.log(`\n💾 Resultados guardados en: ${filepath}`);
}

/**
 * Ejecuta la suite completa de load tests
 */
async function runLoadTestSuite() {
  console.log('\n' + '█'.repeat(80));
  console.log('🔥 SST COLOMBIA - LOAD TEST SUITE');
  console.log('█'.repeat(80));
  console.log(`Fecha/Hora: ${new Date().toISOString()}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Base URL: ${process.env.BASE_URL || 'http://localhost:5000'}`);
  console.log('█'.repeat(80) + '\n');

  const startTime = Date.now();

  // Configurar ambiente de testing y obtener sesión autenticada
  const setupResult = await getSessionCookie();
  
  if (!setupResult) {
    console.error('\n❌ ERROR CRÍTICO: No se pudo obtener sesión autenticada');
    console.error('   Los load tests requieren autenticación válida para ejecutarse');
    console.error('   Por favor resolver el problema de autenticación antes de continuar\n');
    process.exit(1);
  }
  
  const sessionCookie = setupResult;

  // Ejecutar tests de API endpoints
  console.log('\n🔹 FASE 1: API ENDPOINTS CRÍTICOS');
  const apiResults = await runApiEndpointsLoadTest(sessionCookie);

  // Pausa entre fases
  console.log('\n⏸️  Pausa de 10 segundos entre fases...\n');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Ejecutar tests de dashboards
  console.log('\n🔹 FASE 2: DASHBOARDS PHVA');
  const dashboardResults = await runDashboardsLoadTest(sessionCookie);

  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000; // segundos

  // Compilar resultados
  const totalScenarios = apiResults.results.length + dashboardResults.results.length;
  const passedScenarios = 
    apiResults.results.filter(r => r.pass).length +
    dashboardResults.results.filter(r => r.pass).length;
  const failedScenarios = totalScenarios - passedScenarios;
  const overallPass = apiResults.allPass && dashboardResults.allPass;

  const results: TestSuiteResult = {
    timestamp: new Date().toISOString(),
    environment: {
      baseUrl: process.env.BASE_URL || 'http://localhost:5000',
      nodeVersion: process.version,
    },
    apiEndpoints: apiResults,
    dashboards: dashboardResults,
    summary: {
      totalScenarios,
      passedScenarios,
      failedScenarios,
      overallPass,
    },
  };

  // Guardar resultados
  saveResults(results);

  // Reporte final
  console.log('\n' + '█'.repeat(80));
  console.log('🏁 LOAD TEST SUITE - REPORTE FINAL');
  console.log('█'.repeat(80));
  console.log(`Duración Total: ${totalDuration.toFixed(2)}s`);
  console.log(`\nEscenarios Totales: ${totalScenarios}`);
  console.log(`  ✅ Passed: ${passedScenarios}`);
  console.log(`  ❌ Failed: ${failedScenarios}`);
  console.log(`\nResultado Final: ${overallPass ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  console.log('█'.repeat(80) + '\n');

  // Exit code
  process.exit(overallPass ? 0 : 1);
}

// Ejecutar
runLoadTestSuite().catch(error => {
  console.error('❌ Error fatal ejecutando load test suite:', error);
  process.exit(1);
});
