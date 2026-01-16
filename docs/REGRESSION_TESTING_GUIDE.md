# Guía de Tests de Regresión - Dashboards PHVA

## Cumplimiento Normativo

Esta suite de tests de regresión asegura que los dashboards PHVA (Planear-Hacer-Verificar-Actuar) mantienen la precisión de indicadores críticos bajo escenarios de estados mixtos, cumpliendo con:

- **Resolución 0312/2019**: Estándares Mínimos del Sistema de Gestión de SST
- **ISO 45001:2018**: Sistemas de Gestión de Seguridad y Salud en el Trabajo
- **Decreto 1072/2015**: Decreto Único Reglamentario del Sector Trabajo

## Estructura de Tests

### Archivo Principal
```
tests/regression/phva-dashboards.test.ts
```

### Cobertura de Tests

#### 1. Dashboard HACER (Planear-Hacer)
- ✅ Estados mixtos de trabajadores (activo/inactivo/retirado)
- ✅ Distribución de capacitaciones por estado
- ✅ Gestión de incidentes bajo carga alta
- ✅ Umbrales regulados Resolución 0312/2019

#### 2. Dashboard VERIFICAR (Verificar)
- ✅ Tasas de aprobación de inspecciones
- ✅ Monitoreo de estados pendientes
- ✅ Cumplimiento ISO 45001:2018
- ✅ Indicadores de severidad de incidentes

#### 3. Dashboard ACTUAR (Actuar)
- ✅ Cierre de ciclo PHVA
- ✅ Mejora continua de indicadores
- ✅ Reducción de no conformidades
- ✅ Cumplimiento global Decreto 1072/2015

#### 4. Integración Cross-Dashboard
- ✅ Consistencia de datos entre dashboards
- ✅ Alineación de métricas de incidentes
- ✅ Trazabilidad normativa

## Fixtures Definidos

### Escenario 1: Empresa Pequeña
- **Trabajadores**: 15 total (10 activos, 3 inactivos, 2 retirados)
- **Incidentes**: 2 menores (clasificación leve)
- **Capacitaciones**: 8 total (estados mixtos)
- **Inspecciones**: 12 total (mayoría aprobadas)

### Escenario 2: Empresa Mediana
- **Trabajadores**: 150 total (120 activos, 20 inactivos, 10 retirados)
- **Incidentes**: 8 total (5 leves, 3 graves)
- **Capacitaciones**: 45 total (plan intensivo)
- **Inspecciones**: 60 total (sistema riguroso)

### Escenario 3: Empresa Grande
- **Trabajadores**: 520 total (450 activos, 50 inactivos, 20 retirados)
- **Incidentes**: 25 total (18 leves, 6 graves, 1 mortal)
- **Capacitaciones**: 180 total (sistema robusto)
- **Inspecciones**: 240 total (auditorías continuas)

## Umbrales Regulados

### Indicador de Frecuencia de Accidentalidad (IFA)
```
IFA = (Número de accidentes × 200,000) / Horas trabajadas
Umbral Máximo Aceptable: 15 por cada 200,000 horas
Tendencia Esperada: Decreciente
```

### Indicador de Severidad (IS)
```
IS = (Días perdidos × 200,000) / Horas trabajadas
Umbral Máximo Aceptable: 500 por cada 200,000 horas
Tendencia Esperada: Decreciente
```

### Cobertura de Capacitación
```
Mínimo Legal: 95% de trabajadores activos
Crítico: 100% (Art. 2.2.4.6.11 Decreto 1072/2015)
```

### Ejecución de Inspecciones
```
Frecuencia Mínima: 4 inspecciones/mes
Tasa Aprobación Mínima: 70%
Tasa Rechazo Máxima: 15%
```

### Gestión de Incidentes
```
Investigación: 100% de incidentes graves/mortales
Tiempo Máximo: 15 días calendario
Cierre Acciones Correctivas: 90% mínimo
```

### Cumplimiento PHVA Global
```
Mínimo Global: 80%
Crítico: < 60% (incumplimiento crítico)
```

## Cómo Ejecutar los Tests

### Prerrequisitos
```bash
# Instalar dependencias de testing (si aún no están instaladas)
npm install --save-dev @jest/globals jest ts-jest @types/jest
```

### Configuración de Jest

Crear archivo `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@/(.*)$': '<rootDir>/client/src/$1'
  }
};
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests de regresión
npm test tests/regression/phva-dashboards.test.ts

# Ejecutar con verbose para detalles completos
npm test tests/regression/phva-dashboards.test.ts -- --verbose

# Ejecutar solo tests de un dashboard específico
npm test tests/regression/phva-dashboards.test.ts -- -t "Dashboard HACER"

# Ejecutar con cobertura de código
npm test tests/regression/phva-dashboards.test.ts -- --coverage
```

## Interpretación de Resultados

### ✅ Todos los Tests Pasan
**Significado**: Los dashboards PHVA mantienen precisión de indicadores bajo estados mixtos. El sistema cumple con umbrales regulados.

**Acción**: Ninguna acción requerida. Continuar monitoreo regular.

### ⚠️ Algunos Tests Fallan
**Significado**: Existen desviaciones en indicadores críticos bajo escenarios de estados mixtos.

**Acciones**:
1. Revisar logs detallados del test fallido
2. Verificar cálculos en componentes del dashboard afectado
3. Validar queries a base de datos para estados mixtos
4. Corregir lógica de agregación de métricas

### ❌ Múltiples Tests Fallan
**Significado**: Regresión crítica en sistema de dashboards PHVA.

**Acciones Inmediatas**:
1. **BLOQUEAR DEPLOY**: No desplegar a producción
2. Identificar commit que introdujo la regresión
3. Revertir cambios o aplicar hotfix urgente
4. Ejecutar suite completa de tests de integración
5. Notificar a Coordinador SST sobre incumplimiento temporal

## Casos de Uso Críticos

### Caso 1: Pre-Deploy a Producción
```bash
# OBLIGATORIO antes de cada deploy
npm test tests/regression/phva-dashboards.test.ts

# Si pasa: ✅ Proceder con deploy
# Si falla: ❌ BLOQUEAR deploy, investigar y corregir
```

### Caso 2: Post-Modificación de Schemas
```bash
# Después de cambios en shared/schema.ts
npm test tests/regression/phva-dashboards.test.ts -- --verbose

# Validar que enums y estados mixtos funcionan correctamente
```

### Caso 3: Auditoría Regulatoria
```bash
# Generar evidencia de cumplimiento para auditoría
npm test tests/regression/phva-dashboards.test.ts -- --verbose --coverage

# Adjuntar reporte a documentación de auditoría interna
```

## Mantenimiento de Tests

### Actualización de Fixtures
Cuando cambian requisitos normativos o perfiles de empresas:

1. Editar `FIXTURE_EMPRESA_*` en `phva-dashboards.test.ts`
2. Ajustar proporciones de estados según nueva distribución esperada
3. Ejecutar tests para validar ajustes
4. Documentar cambios en commit message

### Actualización de Umbrales
Cuando se actualizan normas colombianas SST:

1. Revisar nueva normativa (Ministerio del Trabajo)
2. Actualizar `UMBRALES_REGULADOS` con nuevos valores
3. Añadir referencia legal en comentarios
4. Ejecutar suite completa para validar compliance
5. Actualizar esta documentación

### Añadir Nuevos Escenarios
```typescript
// Ejemplo: Añadir escenario de empresa en crisis
const FIXTURE_EMPRESA_CRISIS = {
  workers: {
    total: 100,
    estados: {
      activo: 50,
      inactivo: 40,
      retirado: 10
    }
  },
  incidents: {
    total: 15,
    clasificacion: {
      leve: 5,
      grave: 8,
      mortal: 2 // ❌ Indicador crítico
    }
  },
  // ... resto de métricas
};
```

## Referencias Normativas

### Resolución 0312 de 2019
- Estándares Mínimos del Sistema de Gestión de SST
- Capítulo III: Estándar de Gestión de Peligros y Riesgos
- Capítulo VI: Estándar de Gestión de Incidentes
- URL: https://www.mintrabajo.gov.co/

### ISO 45001:2018
- Cláusula 9.1: Seguimiento, medición, análisis y evaluación del desempeño
- Cláusula 9.3: Revisión por la dirección
- Cláusula 10.2: Mejora continua

### Decreto 1072 de 2015
- Artículo 2.2.4.6.11: Capacitación en SST
- Artículo 2.2.4.6.15: Identificación de peligros, evaluación y valoración de riesgos
- Artículo 2.2.4.6.24: Investigación de incidentes, accidentes y enfermedades laborales

## Soporte

Para preguntas sobre tests de regresión:
- **Coordinador SST**: Responsable de interpretación de umbrales regulados
- **Equipo Técnico**: Responsable de mantenimiento de fixtures y tests
- **Auditoría Interna**: Validación de compliance con normativa vigente

---

**Última Actualización**: 2025-01-13  
**Versión**: 1.0  
**Responsable**: Equipo SST Colombia
