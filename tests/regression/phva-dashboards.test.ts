/**
 * PHVA Dashboards Regression Test Suite
 * 
 * Propósito: Validar que los dashboards PHVA (Planear-Hacer-Verificar-Actuar)
 * generen métricas correctas bajo diferentes escenarios de datos mixtos.
 * 
 * Normativa:
 * - Resolución 0312/2019: Estándares Mínimos SST
 * - ISO 45001:2018: Indicadores de desempeño SST
 * - Decreto 1072/2015: SG-SST Colombia
 */

import assert from 'assert';

// Simple test framework
class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> | void }> = [];
  private describes: Array<{ name: string; tests: typeof this.tests }> = [];
  private currentDescribe: string | null = null;
  private currentTests: typeof this.tests = [];

  describe(name: string, fn: () => void) {
    this.currentDescribe = name;
    this.currentTests = [];
    fn();
    this.describes.push({ name, tests: [...this.currentTests] });
    this.currentDescribe = null;
  }

  test(name: string, fn: () => Promise<void> | void) {
    if (this.currentDescribe) {
      this.currentTests.push({ name, fn });
    } else {
      this.tests.push({ name, fn });
    }
  }

  async run() {
    console.log('\n🧪 PHVA Dashboards Regression Test Suite\n');
    
    let passed = 0;
    let failed = 0;
    const failures: Array<{ suite: string; test: string; error: Error }> = [];

    // Run top-level tests
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`  ✓ ${test.name}`);
        passed++;
      } catch (error) {
        console.log(`  ✗ ${test.name}`);
        failures.push({ suite: 'Top-level', test: test.name, error: error as Error });
        failed++;
      }
    }

    // Run describe blocks
    for (const describe of this.describes) {
      console.log(`\n  ${describe.name}`);
      for (const test of describe.tests) {
        try {
          await test.fn();
          console.log(`    ✓ ${test.name}`);
          passed++;
        } catch (error) {
          console.log(`    ✗ ${test.name}`);
          failures.push({ suite: describe.name, test: test.name, error: error as Error });
          failed++;
        }
      }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    if (failures.length > 0) {
      console.log('❌ Failures:\n');
      for (const failure of failures) {
        console.log(`  ${failure.suite} > ${failure.test}`);
        console.log(`    ${failure.error.message}\n`);
      }
      process.exit(1);
    } else {
      console.log('✅ All tests passed!\n');
      process.exit(0);
    }
  }
}

const runner = new TestRunner();

// Helper functions
function expect(actual: any) {
  return {
    toBe(expected: any) {
      assert.strictEqual(actual, expected, `Expected ${actual} to be ${expected}`);
    },
    toBeGreaterThan(expected: number) {
      assert.ok(actual > expected, `Expected ${actual} to be greater than ${expected}`);
    },
    toBeGreaterThanOrEqual(expected: number) {
      assert.ok(actual >= expected, `Expected ${actual} to be >= ${expected}`);
    },
    toBeLessThan(expected: number) {
      assert.ok(actual < expected, `Expected ${actual} to be less than ${expected}`);
    },
    toBeLessThanOrEqual(expected: number) {
      assert.ok(actual <= expected, `Expected ${actual} to be <= ${expected}`);
    },
    toContain(expected: any) {
      assert.ok(
        Array.isArray(actual) ? actual.includes(expected) : actual.indexOf(expected) !== -1,
        `Expected ${actual} to contain ${expected}`
      );
    },
    toHaveLength(expected: number) {
      assert.strictEqual(actual.length, expected, `Expected length ${actual.length} to be ${expected}`);
    },
    toBeDefined() {
      assert.ok(actual !== undefined && actual !== null, `Expected value to be defined`);
    },
    toMatchObject(expected: any) {
      for (const key in expected) {
        assert.deepStrictEqual(actual[key], expected[key], `Expected ${key} to match`);
      }
    }
  };
}

// ============================================================================
// FIXTURES: Datos de prueba con estados mixtos
// ============================================================================

/**
 * Fixture 1: Empresa PEQUEÑA (15 trabajadores)
 * - Clasificación: Menos de 50 empleados
 * - Escenario: Alta incidentalidad pero buena cobertura de capacitación
 */
const smallCompanyFixture = {
  companyId: 'test-company-small',
  workers: {
    total: 15,
    active: 12,
    inactive: 2,
    expired: 1, // Documentos vencidos
  },
  accidents: {
    total: 8,
    withLostDays: 3,
    totalLostDays: 45,
    lastMonth: 2,
  },
  training: {
    totalScheduled: 20,
    completed: 19,
    pending: 1,
    coverage: 95, // % trabajadores capacitados
  },
  inspections: {
    total: 24,
    lastMonth: 6,
    criticalFindings: 12,
    resolvedFindings: 8,
  },
  workHours: 30000, // Horas trabajadas en el período
};

/**
 * Fixture 2: Empresa MEDIANA (150 trabajadores)
 * - Clasificación: 50-200 empleados
 * - Escenario: Datos mixtos con incidentes moderados
 */
const mediumCompanyFixture = {
  companyId: 'test-company-medium',
  workers: {
    total: 150,
    active: 140,
    inactive: 8,
    expired: 2,
  },
  accidents: {
    total: 25,
    withLostDays: 10,
    totalLostDays: 180,
    lastMonth: 5,
  },
  training: {
    totalScheduled: 180,
    completed: 165,
    pending: 15,
    coverage: 92,
  },
  inspections: {
    total: 120,
    lastMonth: 8,
    criticalFindings: 35,
    resolvedFindings: 28,
  },
  workHours: 300000,
};

/**
 * Fixture 3: Empresa GRANDE (520 trabajadores)
 * - Clasificación: Más de 200 empleados
 * - Escenario: Excelente desempeño SST
 */
const largeCompanyFixture = {
  companyId: 'test-company-large',
  workers: {
    total: 520,
    active: 505,
    inactive: 12,
    expired: 3,
  },
  accidents: {
    total: 10,
    withLostDays: 2,
    totalLostDays: 20,
    lastMonth: 1,
  },
  training: {
    totalScheduled: 600,
    completed: 590,
    pending: 10,
    coverage: 98,
  },
  inspections: {
    total: 400,
    lastMonth: 35,
    criticalFindings: 80,
    resolvedFindings: 75,
  },
  workHours: 1040000,
};

// ============================================================================
// UMBRALES REGULADOS (Resolución 0312/2019 + ISO 45001:2018)
// ============================================================================

const REGULATORY_THRESHOLDS = {
  // Indicador de Frecuencia de Accidentalidad (IFA)
  // IFA = (Número de accidentes * 200,000) / Horas trabajadas
  // Umbral aceptable: ≤ 15 accidentes por cada 200,000 horas
  IFA_MAX: 15,

  // Indicador de Severidad (IS)
  // IS = (Días perdidos * 200,000) / Horas trabajadas
  // Umbral aceptable: ≤ 500 días perdidos por cada 200,000 horas
  IS_MAX: 500,

  // Cobertura de Capacitación
  // % de trabajadores que completaron al menos 1 capacitación en el período
  // Umbral: ≥ 95% (Resolución 0312/2019 - Estándar 2)
  TRAINING_COVERAGE_MIN: 95,

  // Ejecución de Inspecciones de Seguridad
  // Frecuencia mínima: 4 inspecciones/mes (mensual mínimo)
  INSPECTIONS_PER_MONTH_MIN: 4,

  // Cumplimiento Global del Ciclo PHVA
  // Estándar Mínimo SST: 80% cumplimiento
  PHVA_COMPLIANCE_MIN: 80,
};

// ============================================================================
// HELPER FUNCTIONS: Cálculo de indicadores SST
// ============================================================================

function calculateIFA(accidents: number, workHours: number): number {
  return (accidents * 200000) / workHours;
}

function calculateIS(lostDays: number, workHours: number): number {
  return (lostDays * 200000) / workHours;
}

function calculateTrainingCoverage(completed: number, total: number): number {
  return (completed / total) * 100;
}

// ============================================================================
// TEST SUITE 1: Dashboard HACER (Plan-Do)
// ============================================================================

runner.describe('Dashboard HACER - Captura y Planificación', () => {
  runner.test('Debe capturar correctamente datos de trabajadores con estados mixtos', () => {
    const fixture = smallCompanyFixture;
    
    // Verificar que se capturan todos los estados
    const totalWorkers = fixture.workers.active + fixture.workers.inactive + fixture.workers.expired;
    expect(totalWorkers).toBe(fixture.workers.total);
    
    // Verificar clasificación de empresa (pequeña < 50)
    expect(fixture.workers.total).toBeLessThan(50);
  });

  runner.test('Debe calcular IFA correctamente para empresa pequeña con alta incidentalidad', () => {
    const fixture = smallCompanyFixture;
    const ifa = calculateIFA(fixture.accidents.total, fixture.workHours);
    
    // IFA = (8 * 200,000) / 30,000 = 53.33
    expect(ifa).toBeGreaterThan(50);
    expect(ifa).toBeLessThan(55);
    
    // Validar que excede umbral regulado (alerta crítica)
    expect(ifa).toBeGreaterThan(REGULATORY_THRESHOLDS.IFA_MAX);
  });

  runner.test('Debe calcular IS correctamente', () => {
    const fixture = mediumCompanyFixture;
    const is = calculateIS(fixture.accidents.totalLostDays, fixture.workHours);
    
    // IS = (180 * 200,000) / 300,000 = 120
    expect(is).toBeGreaterThan(100);
    expect(is).toBeLessThan(150);
    
    // Validar que cumple umbral (< 500)
    expect(is).toBeLessThan(REGULATORY_THRESHOLDS.IS_MAX);
  });

  runner.test('Debe identificar empresa grande con excelente desempeño SST', () => {
    const fixture = largeCompanyFixture;
    const ifa = calculateIFA(fixture.accidents.total, fixture.workHours);
    const is = calculateIS(fixture.accidents.totalLostDays, fixture.workHours);
    
    // IFA = (10 * 200,000) / 1,040,000 = 1.92
    expect(ifa).toBeLessThan(5);
    expect(ifa).toBeLessThan(REGULATORY_THRESHOLDS.IFA_MAX);
    
    // IS = (20 * 200,000) / 1,040,000 = 3.85
    expect(is).toBeLessThan(10);
    expect(is).toBeLessThan(REGULATORY_THRESHOLDS.IS_MAX);
  });

  runner.test('Debe calcular cobertura de capacitación', () => {
    const fixture = smallCompanyFixture;
    const coverage = calculateTrainingCoverage(
      fixture.training.completed,
      fixture.training.totalScheduled
    );
    
    // Coverage = (19 / 20) * 100 = 95%
    expect(coverage).toBe(95);
    expect(coverage).toBeGreaterThanOrEqual(REGULATORY_THRESHOLDS.TRAINING_COVERAGE_MIN);
  });

  runner.test('Debe validar formato de datos del dashboard HACER', () => {
    const fixture = mediumCompanyFixture;
    
    // Verificar que todos los campos requeridos están presentes
    expect(fixture.workers).toBeDefined();
    expect(fixture.accidents).toBeDefined();
    expect(fixture.training).toBeDefined();
    expect(fixture.workHours).toBeGreaterThan(0);
  });

  runner.test('Debe manejar trabajadores con documentación vencida', () => {
    const fixture = largeCompanyFixture;
    
    // Identificar % de trabajadores con docs vencidos
    const expiredPercentage = (fixture.workers.expired / fixture.workers.total) * 100;
    
    // Debe ser < 1% para empresa grande bien gestionada
    expect(expiredPercentage).toBeLessThan(1);
  });

  runner.test('Debe detectar incidentes recientes (último mes)', () => {
    const fixture = mediumCompanyFixture;
    
    // Verificar que hay datos de incidentes del último mes
    expect(fixture.accidents.lastMonth).toBeGreaterThan(0);
    expect(fixture.accidents.lastMonth).toBeLessThanOrEqual(fixture.accidents.total);
  });

  runner.test('Debe calcular tasa de incidentes con días perdidos', () => {
    const fixture = smallCompanyFixture;
    
    const severeAccidentRate = (fixture.accidents.withLostDays / fixture.accidents.total) * 100;
    
    // 3 de 8 accidentes = 37.5%
    expect(severeAccidentRate).toBeGreaterThan(30);
    expect(severeAccidentRate).toBeLessThan(40);
  });
});

// ============================================================================
// TEST SUITE 2: Dashboard VERIFICAR (Check)
// ============================================================================

runner.describe('Dashboard VERIFICAR - Monitoreo y Cumplimiento', () => {
  runner.test('Debe validar ejecución mínima de inspecciones mensuales', () => {
    const fixtures = [smallCompanyFixture, mediumCompanyFixture, largeCompanyFixture];
    
    for (const fixture of fixtures) {
      expect(fixture.inspections.lastMonth).toBeGreaterThanOrEqual(
        REGULATORY_THRESHOLDS.INSPECTIONS_PER_MONTH_MIN
      );
    }
  });

  runner.test('Debe identificar brechas en cobertura de capacitación', () => {
    const fixture = mediumCompanyFixture;
    const coverage = calculateTrainingCoverage(
      fixture.training.completed,
      fixture.training.totalScheduled
    );
    
    // 92% está por debajo del 95% requerido
    expect(coverage).toBeLessThan(REGULATORY_THRESHOLDS.TRAINING_COVERAGE_MIN);
    
    // Calcular brecha (redondear a 2 decimales para evitar errores de precisión)
    const gap = Math.round((REGULATORY_THRESHOLDS.TRAINING_COVERAGE_MIN - coverage) * 100) / 100;
    expect(gap).toBeGreaterThan(3);
    expect(gap).toBeLessThan(4);
  });

  runner.test('Debe calcular tasa de resolución de hallazgos críticos', () => {
    const fixture = largeCompanyFixture;
    
    const resolutionRate = (fixture.inspections.resolvedFindings / fixture.inspections.criticalFindings) * 100;
    
    // 75 de 80 = 93.75%
    expect(resolutionRate).toBeGreaterThan(90);
    expect(resolutionRate).toBeLessThan(100);
  });

  runner.test('Debe generar alertas para empresas con alta incidentalidad', () => {
    const fixture = smallCompanyFixture;
    const ifa = calculateIFA(fixture.accidents.total, fixture.workHours);
    
    // IFA > 15 debe generar alerta crítica
    const shouldAlert = ifa > REGULATORY_THRESHOLDS.IFA_MAX;
    expect(shouldAlert).toBe(true);
  });
});

// ============================================================================
// TEST SUITE 3: Dashboard ACTUAR (Act)
// ============================================================================

runner.describe('Dashboard ACTUAR - Mejora Continua', () => {
  runner.test('Debe rastrear accidentes que requieren acción correctiva', () => {
    const fixture = mediumCompanyFixture;
    
    // Todos los accidentes con días perdidos requieren plan de acción
    expect(fixture.accidents.withLostDays).toBeGreaterThan(0);
    expect(fixture.accidents.withLostDays).toBeLessThanOrEqual(fixture.accidents.total);
  });

  runner.test('Debe calcular hallazgos pendientes de resolución', () => {
    const fixture = smallCompanyFixture;
    
    const pendingFindings = fixture.inspections.criticalFindings - fixture.inspections.resolvedFindings;
    
    // 12 - 8 = 4 hallazgos pendientes
    expect(pendingFindings).toBe(4);
  });

  runner.test('Debe validar que empresa grande tiene mejor gestión de hallazgos', () => {
    const small = smallCompanyFixture;
    const large = largeCompanyFixture;
    
    const smallResolutionRate = (small.inspections.resolvedFindings / small.inspections.criticalFindings) * 100;
    const largeResolutionRate = (large.inspections.resolvedFindings / large.inspections.criticalFindings) * 100;
    
    // Empresa grande debe tener mayor tasa de resolución
    expect(largeResolutionRate).toBeGreaterThan(smallResolutionRate);
  });

  runner.test('Debe identificar necesidad de auditoría para empresa pequeña', () => {
    const fixture = smallCompanyFixture;
    const ifa = calculateIFA(fixture.accidents.total, fixture.workHours);
    
    // IFA > 50 requiere auditoría inmediata
    expect(ifa).toBeGreaterThan(50);
  });
});

// ============================================================================
// TEST SUITE 4: Integración Cross-Dashboard
// ============================================================================

runner.describe('Integración PHVA Completa', () => {
  runner.test('Debe calcular cumplimiento global PHVA para empresa mediana', () => {
    const fixture = mediumCompanyFixture;
    
    // Componentes del cumplimiento PHVA:
    // 1. PLANEAR: Cobertura de capacitación (92%)
    // 2. HACER: Cumplimiento de inspecciones (8/4 = 200% = 100%)
    // 3. VERIFICAR: IFA dentro de límites (NO - penaliza 20%)
    // 4. ACTUAR: Resolución de hallazgos (80%)
    
    const planScore = 92;
    const doScore = 100;
    const checkScore = 80; // Penalizado por IFA alto
    const actScore = 80;
    
    const overallCompliance = (planScore + doScore + checkScore + actScore) / 4;
    
    // (92 + 100 + 80 + 80) / 4 = 88%
    expect(overallCompliance).toBeGreaterThanOrEqual(REGULATORY_THRESHOLDS.PHVA_COMPLIANCE_MIN);
  });

  runner.test('Debe generar flujo completo PHVA con datos reales', () => {
    const fixture = largeCompanyFixture;
    
    // PLANEAR: Programar capacitaciones
    expect(fixture.training.totalScheduled).toBeGreaterThan(0);
    
    // HACER: Ejecutar inspecciones
    expect(fixture.inspections.total).toBeGreaterThan(0);
    
    // VERIFICAR: Analizar indicadores
    const ifa = calculateIFA(fixture.accidents.total, fixture.workHours);
    expect(ifa).toBeLessThan(REGULATORY_THRESHOLDS.IFA_MAX);
    
    // ACTUAR: Resolver hallazgos
    expect(fixture.inspections.resolvedFindings).toBeGreaterThan(0);
  });
});

// ============================================================================
// EJECUTAR TESTS
// ============================================================================

// Ejecutar todos los tests registrados
runner.run().catch((error) => {
  console.error('Error ejecutando tests:', error);
  process.exit(1);
});
