# Load Tests - SST Colombia

**Bloque 5: Validación Integral**

Sistema de pruebas de carga para validar el rendimiento del aplicativo SST Colombia bajo condiciones que simulan 50+ tenants concurrentes.

---

## Objetivos de Performance

### API Endpoints
- **p95 < 400ms**: El 95% de requests deben completarse en menos de 400ms
- **Success Rate ≥ 99%**: Al menos 99% de requests deben ser exitosos (HTTP 200-299)

### Dashboards PHVA
- **p95 < 2000ms**: El 95% de requests deben completarse en menos de 2 segundos
- **Success Rate ≥ 99%**: Al menos 99% de requests deben ser exitosos

---

## Estructura del Proyecto

```
load-tests/
├── utils/
│   └── metrics.ts          # Utilidades para métricas y reporting
├── scenarios/
│   ├── api-endpoints.ts    # Tests de API endpoints críticos
│   └── dashboards.ts       # Tests de dashboards PHVA
├── results/                # Resultados de ejecuciones (JSON)
│   └── load-test-*.json
├── run-all.ts              # Runner principal
└── README.md               # Este archivo
```

---

## Instalación

Los load tests usan Node.js/TypeScript y no requieren dependencias adicionales más allá de las ya instaladas en el proyecto.

```bash
# Verificar que el proyecto está funcionando
npm run dev
```

---

## Uso

### Ejecutar Suite Completa

```bash
# Ejecutar todos los escenarios de load testing
npx tsx load-tests/run-all.ts
```

Esto ejecutará:
1. API Endpoints (4 escenarios, ~2 minutos)
2. Dashboards PHVA (3 escenarios, ~2 minutos)
3. Generará reporte consolidado en `load-tests/results/`

### Ejecutar Escenarios Individuales

```bash
# Solo API endpoints
npx tsx load-tests/scenarios/api-endpoints.ts

# Solo dashboards
npx tsx load-tests/scenarios/dashboards.ts
```

---

## Escenarios de Prueba

### 1. API Endpoints Críticos

| Endpoint | Método | Usuarios Virtuales | Duración | Target p95 |
|----------|--------|-------------------|----------|------------|
| `/api/workers` | GET | 50 | 30s | 400ms |
| `/api/incidents` | GET | 30 | 30s | 400ms |
| `/api/trainings` | GET | 25 | 30s | 400ms |
| `/api/inspections` | GET | 20 | 30s | 400ms |

**Total de usuarios concurrentes**: ~125 (equivalente a 50+ tenants)

### 2. Dashboards PHVA

| Dashboard | Endpoint | Usuarios Virtuales | Duración | Target p95 |
|-----------|----------|-------------------|----------|------------|
| HACER | `/api/dashboard/hacer` | 40 | 30s | 2000ms |
| VERIFICAR | `/api/dashboard/verificar` | 40 | 30s | 2000ms |
| ACTUAR | `/api/dashboard/actuar` | 40 | 30s | 2000ms |

**Total de usuarios concurrentes**: ~120

---

## Configuración

### Variables de Entorno

```bash
# Base URL del servidor (default: http://localhost:5000)
export BASE_URL=http://localhost:5000

# Ejecutar tests
npx tsx load-tests/run-all.ts
```

### Autenticación

**IMPORTANTE**: El sistema SST Colombia requiere autenticación para endpoints protegidos.

#### Usuario Admin Existente

El runner de load tests usa el **usuario admin existente** creado por el seeder oficial:

**Credenciales por Defecto**:
- Username: `admin`
- Password: `admin123`
- Role: `admin` (permisos completos)

#### Configuración Personalizada (Opcional)

**Variables de Entorno**:

```bash
export TEST_USERNAME="mi_usuario_admin"
export TEST_PASSWORD="mi_password"
npx tsx load-tests/run-all.ts
```

#### Si el Usuario Admin No Existe

```bash
# Ejecutar el seeder oficial
npx tsx scripts/seed-admin.ts
```

Esto creará el usuario `admin/admin123` con permisos completos.

#### Comportamiento en Caso de Falla

Si el login falla:
- ❌ Imprime error y solución
- 🛑 No ejecuta tests (requiere autenticación válida)
- 📋 Instruye ejecutar seeder de admin

---

## Interpretación de Resultados

### Output en Consola

Cada escenario imprime:

```
📊 LOAD TEST REPORT: /api/workers
================================================================================
Timestamp: 2025-11-13T12:34:56.789Z

📈 Request Summary:
  Total Requests:      3000
  Successful:          2985 (99.50%)
  Failed:              15
  Throughput:          100.00 req/s

⏱️  Response Time (ms):
  Min:                 45.23
  Mean:                235.67
  Median (p50):        220.45
  p95:                 380.12
  p99:                 450.89
  Max:                 890.23

🎯 Performance Targets:
  p95 < 400ms:        ✅ PASS (380.12ms)
  Success Rate ≥ 99%:  ✅ PASS (99.50%)
================================================================================
```

### Archivo de Resultados

Los resultados se guardan en formato JSON:

```json
{
  "timestamp": "2025-11-13T12:34:56.789Z",
  "environment": {
    "baseUrl": "http://localhost:5000",
    "nodeVersion": "v20.x.x"
  },
  "apiEndpoints": {
    "allPass": true,
    "results": [...]
  },
  "dashboards": {
    "allPass": true,
    "results": [...]
  },
  "summary": {
    "totalScenarios": 7,
    "passedScenarios": 7,
    "failedScenarios": 0,
    "overallPass": true
  }
}
```

---

## Métricas Clave

### p95 (Percentil 95)
El 95% de requests completan más rápido que este valor. Excluye outliers extremos.

**¿Por qué p95?**
- Más representativo que promedio (no afectado por outliers)
- Refleja la experiencia real del 95% de usuarios
- Estándar de industria para SLAs

### Success Rate
Porcentaje de requests HTTP exitosos (status 200-299).

**Target ≥ 99%**: Permite 1% de fallas por:
- Timeouts ocasionales
- Rate limiting
- Errores transitorios de red

### Throughput
Requests procesados por segundo.

**Uso**: Validar capacidad del servidor bajo carga sostenida.

---

## Troubleshooting

### ❌ Tests fallan con p95 > target

**Posibles causas**:
1. Base de datos lenta (consultas sin índices)
2. N+1 queries en ORMs
3. CPU/memoria insuficiente
4. Demasiados usuarios concurrentes

**Soluciones**:
1. Revisar queries con `EXPLAIN ANALYZE`
2. Agregar índices a columnas filtradas
3. Implementar paginación
4. Cachear resultados frecuentes

### ❌ Success Rate < 99%

**Posibles causas**:
1. Timeouts (requests > 30s)
2. Errores 500 en servidor
3. Rate limiting agresivo
4. Conexiones de BD agotadas

**Soluciones**:
1. Aumentar timeout en fetch (default 30s)
2. Revisar logs del servidor para errores
3. Ajustar rate limits
4. Aumentar pool de conexiones de BD

### ❌ Errores de autenticación

**Causa**: `getSessionCookie()` no implementado o cookie inválida.

**Solución**: Implementar login real en `run-all.ts`.

---

## Mejores Prácticas

### 1. Ejecutar en Ambiente Limpio
```bash
# Limpiar caché de BD
npm run db:push --force

# Reiniciar servidor
npm run dev
```

### 2. Baseline antes de Cambios
```bash
# Guardar baseline
npx tsx load-tests/run-all.ts > baseline.log

# Hacer cambios...

# Comparar resultados
npx tsx load-tests/run-all.ts > after-changes.log
diff baseline.log after-changes.log
```

### 3. Monitorear Recursos del Sistema
```bash
# Mientras corren los tests, en otra terminal:
top -p $(pgrep -f "npm run dev")
```

---

## Próximos Pasos

### Task 31: Ejecutar Load Tests
- [x] Configurar infraestructura (Task 30)
- [ ] Ejecutar suite completa (Task 31)
- [ ] Capturar resultados
- [ ] Validar cumplimiento de targets
- [ ] Ajustar índices de BD si es necesario

### Optimizaciones Futuras
- [ ] Implementar caching de dashboards
- [ ] Agregar índices compuestos en tablas grandes
- [ ] Implementar paginación en listados
- [ ] Connection pooling optimizado

---

## Referencias

- **Métricas de Performance**: `load-tests/utils/metrics.ts`
- **Scripts de Prueba**: `load-tests/scenarios/`
- **Resultados Históricos**: `load-tests/results/`
- **Documentación Bloque 5**: `docs/BLOQUE_5_VALIDACION_INTEGRAL.md` (si existe)

---

**Última actualización**: 2025-11-13  
**Versión**: 1.0.0  
**Status**: Production Ready (pending execution - Task 31)
