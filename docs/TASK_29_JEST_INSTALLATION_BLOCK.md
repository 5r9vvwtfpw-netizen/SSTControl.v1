# Task 29: Bloqueo Técnico - Instalación de Jest

**Fecha**: 13 de Noviembre de 2025  
**Task**: Bloque 5 - Task 29 - Tests de Regresión PHVA  
**Estado**: BLOQUEADO - Requiere intervención manual

---

## Resumen

Los tests de regresión para dashboards PHVA están **completamente especificados** en `tests/regression/phva-dashboards.test.ts` (467 líneas), pero NO pueden ejecutarse porque **Jest no se instaló** debido a un error de npm recurrente.

---

## Entregables Completados ✅

1. ✅ **Suite de tests completa**: `tests/regression/phva-dashboards.test.ts`
2. ✅ **Fixtures de datos**: 3 escenarios (pequeña/mediana/grande empresa)
3. ✅ **Umbrales regulados**: IFA, IS, Cobertura, Inspecciones, PHVA Global
4. ✅ **Documentación**: `docs/REGRESSION_TESTING_GUIDE.md`
5. ✅ **Configuración Jest**: `jest.config.js` creado

---

## Bloqueo Técnico

### Error npm ENOTEMPTY

**Síntoma**:
```bash
npm error code ENOTEMPTY
npm error syscall rename
npm error path /home/runner/workspace/node_modules/artillery
npm error dest /home/runner/workspace/node_modules/.artillery-mRVsMp4t
npm error errno -39
npm error ENOTEMPTY: directory not empty, rename
```

**Intentos Realizados**:
1. ✅ `packager_tool` con `jest`, `@types/jest`, `ts-jest`
2. ✅ Reintento inmediato (mismo error)
3. ❌ Bash install (bloqueado por sistema)

**Root Cause**: Conflicto de directorio npm con paquete `artillery` (usado en load testing)

---

## Soluciones Propuestas

### Opción A: Instalación Manual (RECOMENDADO)

**Para el usuario**:
```bash
# Limpiar cache corrupto
rm -rf node_modules/.artillery*

# Reinstalar
npm install --no-audit jest @types/jest ts-jest

# Añadir script de test a package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}

# Ejecutar tests
npm test
```

### Opción B: Usar Runner Alternativo (ts-node)

**Si Jest sigue fallando**:
```bash
# Instalar ts-node (si no está)
npm install --save-dev ts-node

# Ejecutar tests directamente
npx ts-node --esm tests/regression/phva-dashboards.test.ts
```

**Limitación**: ts-node NO ejecuta assertions de Jest (solo compila TypeScript)

### Opción C: Reintento Workflow Restart

**Si el workflow está bloqueado**:
1. Detener workflow "Start application"
2. Limpiar `node_modules/.artillery*`
3. Reiniciar workflow
4. Reinstalar Jest vía packager_tool

---

## Tests Entregados (NO EJECUTABLES aún)

### Archivo: `tests/regression/phva-dashboards.test.ts`

**Cobertura**:
- ✅ Dashboard HACER: 9 tests
  - Captura de datos fuente
  - Cálculo de indicadores SST (IFA, IS)
  - Validación de umbrales regulados
  - Formato de dashboards
  - Estados mixtos (activo/inactivo/vencido)
  
- ✅ Dashboard VERIFICAR: 4 tests
  - Ejecución de inspecciones (min 4/mes)
  - Cobertura de capacitación (min 95%)
  - Detección de brechas regulatorias
  - Alertas tempranas

- ✅ Dashboard ACTUAR: 4 tests
  - Registro de accidentes/incidentes
  - Planes de acción correctivos
  - Auditorías internas SST
  - Mejora continua

- ✅ Integración Cross-Dashboard: 2 tests
  - Flujo completo PHVA
  - Cumplimiento global (min 80%)

**Total**: 19 casos de prueba + 3 fixtures + documentación

---

## Validación de Tests (Sin Jest)

### Método Alternativo: Code Review

**Verificación manual realizada** ✅:

1. **Imports correctos**: 
   - ✅ Fixtures importan tipos de `@shared/schema`
   - ✅ Test structure sigue Jest conventions

2. **Fixtures válidos**:
   - ✅ Empresa pequeña (15 trabajadores, 8 incidentes, 20 inspecciones)
   - ✅ Empresa mediana (150 trabajadores, 25 incidentes, 120 inspecciones)
   - ✅ Empresa grande (520 trabajadores, 10 incidentes, 400 inspecciones)

3. **Umbrales regulados documentados**:
   - ✅ IFA ≤ 15 accidentes/200k horas (Resolución 0312/2019)
   - ✅ IS ≤ 500 días perdidos/200k horas
   - ✅ Cobertura capacitación ≥ 95%
   - ✅ Inspecciones ≥ 4/mes
   - ✅ Cumplimiento PHVA ≥ 80%

4. **Assertions lógicamente correctas**:
   - ✅ Tests verifican cálculos de indicadores
   - ✅ Tests validan umbrales normativos
   - ✅ Tests comprueban estados mixtos

---

## Impacto en Bloque 5

### Status de Tasks

| Task | Entregable | Estado | Architect |
|------|------------|--------|-----------|
| 29 | Tests regresión | ⚠️ BLOQUEADO | RECHAZADO |
| 32 | Checklist OWASP | ✅ | APROBADO |
| 33 | Auditoría OWASP | ✅ | APROBADO |
| 34 | Schema reconciliation | ✅ | APROBADO |

**Bloque 5**: 7/8 tasks completadas (87.5%)

**Architect Feedback**:
> "Task 29 cannot be approved because the delivered Jest regression suite is not runnable in the current repository (Jest and its test script are still absent), so the regression objective is unmet."

---

## Próximos Pasos

### Para Completar Task 29:

1. **Usuario instala Jest manualmente** (Opción A recomendada)
2. **Añadir script `test` a package.json**:
   ```json
   "scripts": {
     "test": "jest"
   }
   ```
3. **Ejecutar tests**:
   ```bash
   npm test
   ```
4. **Validar que todos los tests pasan**
5. **Marcar Task 29 como COMPLETED**

### Criterios de Aprobación:

- [x] Tests especificados (467 líneas)
- [x] Fixtures creados (3 escenarios)
- [x] Umbrales documentados (5 métricas)
- [x] Guía de testing escrita
- [ ] **Jest instalado y ejecutable** ❌ BLOQUEADO
- [ ] **Tests pasan exitosamente** ⏸️ PENDIENTE

---

## Referencias

- **Tests**: `tests/regression/phva-dashboards.test.ts`
- **Guía**: `docs/REGRESSION_TESTING_GUIDE.md`
- **Jest Config**: `jest.config.js`
- **Error npm**: `ENOTEMPTY` (conflicto con artillery)
- **Architect Review**: 2025-11-13 - Task 29 RECHAZADO (Jest no ejecutable)

---

**Conclusión**: Tests están **100% especificados** pero **0% ejecutables**. Requiere instalación manual de Jest por el usuario para completar Task 29.

**Alternativa**: Si el usuario no puede instalar Jest, se puede implementar un test runner custom usando ts-node + mocha/chai (o sin framework - solo aserciones nativas TypeScript).
