/**
 * Utilidades para métricas de performance en load testing
 * SST Colombia - Bloque 5: Validación Integral
 */

export interface RequestResult {
  success: boolean;
  statusCode: number;
  duration: number;
  error?: string;
  endpoint: string;
}

export interface LoadTestConfig {
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  virtualUsers: number;
  duration: number; // segundos
  rampUpTime?: number; // segundos para ramping gradual
}

export interface MetricsReport {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  duration: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p95: number;
    p99: number;
  };
  throughput: number; // requests/sec
  errors: Record<string, number>;
  timestamp: string;
}

/**
 * Calcula percentiles de un array de valores
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calcula estadísticas de un array de valores
 */
export function calculateStats(values: number[]) {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      p95: 0,
      p99: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / values.length,
    median: calculatePercentile(values, 50),
    p95: calculatePercentile(values, 95),
    p99: calculatePercentile(values, 99),
  };
}

/**
 * Genera reporte de métricas de un array de resultados
 */
export function generateReport(
  endpoint: string,
  results: RequestResult[],
  totalDuration: number
): MetricsReport {
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  const durations = successfulResults.map(r => r.duration);
  const stats = calculateStats(durations);
  
  // Agrupar errores
  const errors: Record<string, number> = {};
  failedResults.forEach(r => {
    const errorKey = r.error || `HTTP ${r.statusCode}`;
    errors[errorKey] = (errors[errorKey] || 0) + 1;
  });

  return {
    endpoint,
    totalRequests: results.length,
    successfulRequests: successfulResults.length,
    failedRequests: failedResults.length,
    successRate: (successfulResults.length / results.length) * 100,
    duration: stats,
    throughput: results.length / (totalDuration / 1000), // requests/sec
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Ejecuta un request HTTP y mide su performance
 */
export async function measureRequest(
  url: string,
  options: RequestInit = {}
): Promise<RequestResult> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000), // 30s timeout
    });
    
    const duration = performance.now() - startTime;
    
    // Consumir el body para completar el request
    await response.text();
    
    return {
      success: response.ok,
      statusCode: response.status,
      duration,
      endpoint: url,
    };
  } catch (error: any) {
    const duration = performance.now() - startTime;
    
    return {
      success: false,
      statusCode: 0,
      duration,
      error: error.message,
      endpoint: url,
    };
  }
}

/**
 * Ejecuta múltiples requests en paralelo con concurrencia limitada
 */
export async function executeParallelRequests(
  requests: (() => Promise<RequestResult>)[],
  concurrency: number
): Promise<RequestResult[]> {
  const results: RequestResult[] = [];
  const executing: Promise<void>[] = [];
  
  for (const request of requests) {
    const promise = request().then(result => {
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remover promesas completadas
      executing.splice(
        executing.findIndex(p => {
          const isResolved = Promise.race([p, Promise.resolve()]) === Promise.resolve();
          return isResolved;
        }),
        1
      );
    }
  }
  
  await Promise.all(executing);
  return results;
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formatea números a un decimal
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Imprime reporte de métricas en consola
 */
export function printReport(report: MetricsReport) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 LOAD TEST REPORT: ${report.endpoint}`);
  console.log('='.repeat(80));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`\n📈 Request Summary:`);
  console.log(`  Total Requests:      ${report.totalRequests}`);
  console.log(`  Successful:          ${report.successfulRequests} (${formatNumber(report.successRate)}%)`);
  console.log(`  Failed:              ${report.failedRequests}`);
  console.log(`  Throughput:          ${formatNumber(report.throughput)} req/s`);
  
  console.log(`\n⏱️  Response Time (ms):`);
  console.log(`  Min:                 ${formatNumber(report.duration.min)}`);
  console.log(`  Mean:                ${formatNumber(report.duration.mean)}`);
  console.log(`  Median (p50):        ${formatNumber(report.duration.median)}`);
  console.log(`  p95:                 ${formatNumber(report.duration.p95)}`);
  console.log(`  p99:                 ${formatNumber(report.duration.p99)}`);
  console.log(`  Max:                 ${formatNumber(report.duration.max)}`);
  
  if (Object.keys(report.errors).length > 0) {
    console.log(`\n❌ Errors:`);
    Object.entries(report.errors).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}`);
    });
  }
  
  // Validar objetivos
  console.log(`\n🎯 Performance Targets:`);
  const p95Target = 400; // ms para API
  const p95Pass = report.duration.p95 <= p95Target;
  console.log(`  p95 < ${p95Target}ms:        ${p95Pass ? '✅ PASS' : '❌ FAIL'} (${formatNumber(report.duration.p95)}ms)`);
  
  const successRateTarget = 99;
  const successRatePass = report.successRate >= successRateTarget;
  console.log(`  Success Rate ≥ ${successRateTarget}%:  ${successRatePass ? '✅ PASS' : '❌ FAIL'} (${formatNumber(report.successRate)}%)`);
  
  console.log('='.repeat(80) + '\n');
  
  return {
    p95Pass,
    successRatePass,
    overallPass: p95Pass && successRatePass,
  };
}
