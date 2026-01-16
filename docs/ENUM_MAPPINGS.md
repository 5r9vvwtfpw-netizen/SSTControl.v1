# Mapeo de Estados y Enums - SST Colombia

**Documento de Referencia**: Sincronización de schema de base de datos PostgreSQL con definiciones TypeScript (Drizzle ORM)

**Fecha**: 2025-11-13  
**Relacionado con**: Task 27 (Bloque 5 - Validación Integral)

---

## Resumen Ejecutivo

Este documento registra la sincronización manual de enums entre el schema TypeScript (`shared/schema.ts`) y la base de datos PostgreSQL, realizada debido a problemas de introspección con `drizzle-kit push --force` (comando se queda colgado con schemas grandes de ~120 enums).

**Estado Actual**: 120 enums sincronizados correctamente entre TypeScript y PostgreSQL.

---

## Enums Renombrados en Base de Datos

Durante la sincronización se identificaron 4 enums con sufijo `_enum` en PostgreSQL que no coincidían con las definiciones del schema TypeScript. Se ejecutaron los siguientes renames para alinear nombres:

| Nombre Anterior (BD) | Nombre Nuevo (Coincide con Schema) | Tabla Afectada | Columna |
|---------------------|-----------------------------------|----------------|---------|
| `tipo_accion_revision_enum` | `tipo_accion_auditoria` | `acciones_revision` | `accion` |
| `rol_participante_revision_enum` | `tipo_participante_revision` | `participantes_revision` | `tipo` |
| `tipo_decision_revision_enum` | `tipo_decision_revision` | `decisiones_revision` | `tipo` |
| `estado_revision_direccion_enum` | `estado_revision_direccion` | `revisiones_direccion` | `estado` |

**Comando SQL Ejecutado**:
```sql
ALTER TYPE tipo_accion_revision_enum RENAME TO tipo_accion_auditoria;
ALTER TYPE rol_participante_revision_enum RENAME TO tipo_participante_revision;
ALTER TYPE tipo_decision_revision_enum RENAME TO tipo_decision_revision;
ALTER TYPE estado_revision_direccion_enum RENAME TO estado_revision_direccion;
```

**Impacto**: Sin pérdida de datos. PostgreSQL permite renombrar tipos enum sin afectar columnas dependientes.

---

## Enums Creados en Base de Datos

Se crearon 3 enums faltantes que estaban definidos en el schema TypeScript pero no existían en PostgreSQL:

### 1. categoria_norma
**Propósito**: Clasificar normatividad colombiana SST en la Matriz Legal  
**Tabla**: `matriz_legal`  
**Columna**: `categoria` (VARCHAR → categoria_norma)

**Valores**:
```typescript
'sistema-gestion', 'seguridad-industrial', 'medicina-trabajo', 
'higiene-industrial', 'seguridad-vial', 'riesgo-psicosocial', 
'emergencias', 'sustancias-quimicas', 'trabajo-alturas', 
'espacios-confinados', 'seguridad-electrica', 'prevencion-incendios', 
'comites-sst', 'investigacion-incidentes', 'capacitacion', 'otras'
```

**Migración Realizada**:
```sql
CREATE TYPE categoria_norma AS ENUM (...);
ALTER TABLE matriz_legal ALTER COLUMN categoria TYPE categoria_norma 
USING categoria::categoria_norma;
```

---

### 2. estado_cumplimiento
**Propósito**: Estados de cumplimiento normativo para Matriz Legal  
**Tablas**: `matriz_legal`  
**Columnas**: `estado_cumplimiento`, `estado_automatico` (ambas VARCHAR → estado_cumplimiento)

**Valores**:
```typescript
'cumple', 'cumple-parcialmente', 'no-cumple', 'no-aplica'
```

**Migración Realizada**:
```sql
CREATE TYPE estado_cumplimiento AS ENUM (...);

-- Remover default, convertir, restaurar default
ALTER TABLE matriz_legal ALTER COLUMN estado_cumplimiento DROP DEFAULT;
ALTER TABLE matriz_legal ALTER COLUMN estado_cumplimiento TYPE estado_cumplimiento 
USING estado_cumplimiento::estado_cumplimiento;
ALTER TABLE matriz_legal ALTER COLUMN estado_cumplimiento SET DEFAULT 'no-cumple'::estado_cumplimiento;

-- Convertir columna nullable
ALTER TABLE matriz_legal ALTER COLUMN estado_automatico TYPE estado_cumplimiento 
USING CASE WHEN estado_automatico IS NULL THEN NULL ELSE estado_automatico::estado_cumplimiento END;
```

---

### 3. tipo_tema_revision
**Propósito**: Clasificar temas tratados en Revisiones por Dirección  
**Tabla**: `temas_revision` (columna `tipo` aún no agregada - ver nota de drift)  
**Estado**: Enum creado, columna pendiente

**Valores**:
```typescript
'indicadores_sst', 'objetivos_metas', 'auditorias', 
'accidentes_incidentes', 'enfermedades', 'capacitaciones', 
'recursos', 'cambios_normativos', 'programas_gestion',
'riesgos_oportunidades', 'quejas_sugerencias', 'partes_interesadas',
'cambios_procesos', 'clima_laboral', 'otro'
```

**SQL Ejecutado**:
```sql
CREATE TYPE tipo_tema_revision AS ENUM (...);
```

**⚠️ NOTA**: La tabla `temas_revision` presenta schema drift severo. La columna `tipo` está definida en `shared/schema.ts` pero no existe en la base de datos. Ver **Task 34** para reconciliación de columnas.

---

## Estados Críticos para Dashboards PHVA

### Auditorías Internas (Dashboard VERIFICAR)

**Enum**: `auditoria_estado`  
**Valores Canónicos**:
- `programada`: Auditoría planificada
- `en_ejecucion`: Auditoría en curso
- `cerrada`: Auditoría completada

**⚠️ CORRECCIÓN APLICADA (Task 24)**: 
El código en `server/storage.ts` usaba estados incorrectos ('completada', 'aprobada', 'en_curso') que fueron corregidos a los estados canónicos del enum.

**Ubicación**: `server/storage.ts` líneas ~6467, 6478-6479

**Código Correcto**:
```typescript
// Antes (INCORRECTO):
.where(eq(schema.auditoriasInternas.estado, "completada"))
.where(inArray(schema.auditoriasInternas.estado, ["aprobada", "en_curso"]))

// Después (CORRECTO):
.where(eq(schema.auditoriasInternas.estado, "cerrada"))
.where(inArray(schema.auditoriasInternas.estado, ["cerrada", "en_ejecucion"]))
```

---

### Revisiones por Dirección (Dashboard VERIFICAR)

**Enum**: `estado_revision_direccion`  
**Valores Canónicos**:
- `programada`: Revisión planificada
- `en_ejecucion`: Revisión en curso
- `cerrada`: Revisión completada

**Default**: `'programada'`

---

### Acciones de Revisión (Dashboard ACTUAR)

**Enum**: `tipo_accion_auditoria` (renombrado desde `tipo_accion_revision_enum`)  
**Valores Canónicos**:
- `correctiva`: Acción correctiva
- `preventiva`: Acción preventiva
- `mejora`: Acción de mejora

**Estados de Acción**: `estado_accion`
- `pendiente`: Acción no iniciada
- `en-proceso`: Acción en ejecución (NOTA: con guión, no guión bajo)
- `completada`: Acción finalizada
- `vencida`: Acción no completada en plazo

**⚠️ CORRECCIÓN APLICADA (Task 24)**:
```typescript
// Antes (INCORRECTO):
.where(eq(schema.accionesMejora, estado, "en_proceso"))

// Después (CORRECTO):
.where(eq(schema.accionesMejora.estado, "en-proceso")) // con guión
```

---

## Enums Definidos pero No Usados

### medios_comunicacion
**Estado**: Definido como enum en `shared/schema.ts` línea 3251, pero la columna real en `comunicaciones_sst.medios_comunicacion` es `text().array()` (línea 3319).

**Razón**: Permite flexibilidad para múltiples medios de comunicación simultáneos sin restricciones de enum.

**Recomendación**: Mantener la definición del enum por si se requiere en el futuro, o eliminarla para evitar confusión. Por ahora, **documentado como intencionalmente no usado**.

---

## Problemas Conocidos

### drizzle-kit push --force Se Queda Colgado

**Síntoma**: El comando `npm run db:push -- --force` se queda indefinidamente en "Pulling schema from database..." sin completar.

**Causa**: Schema grande (~120 enums, 99 tablas, cientos de relaciones) causa que la introspección de metadata (`pg_type/pg_enum/pg_constraint`) exceda timeouts en la instancia managed de Postgres.

**Solución Temporal**: Sincronización manual mediante SQL directo para enums, luego `drizzle-kit generate` para verificar drift restante (reportó "No schema changes" después de correcciones de enums).

**Solución Permanente Propuesta**:
1. Reportar issue a Drizzle con versión CLI, tamaño de schema, y logs de console loop
2. Considerar migraciones incrementales en lugar de push full-schema
3. Monitorear futuras versiones de drizzle-kit con mejor manejo de schemas grandes

---

## Guía de Prevención de Regresiones

### Al Modificar Estados de Auditorías/Revisiones

1. **Consultar este documento** antes de usar valores hardcoded
2. **Buscar en el schema** el enum correspondiente:
   ```bash
   grep "auditoria_estado\|estado_revision_direccion" shared/schema.ts
   ```
3. **Usar solo valores definidos en el enum** - NO inventar estados
4. **Recordar convenciones**:
   - Auditorías/Revisiones cerradas: `'cerrada'` (NO 'completada', 'finalizada', 'aprobada')
   - En ejecución: `'en_ejecucion'` (guión bajo, NO 'en_curso', 'en-ejecucion')
   - Acciones en proceso: `'en-proceso'` (guión, NO 'en_proceso', 'en_ejecucion')

### Al Agregar Nuevos Módulos

1. **Definir enums en `shared/schema.ts`** primero
2. **Ejecutar `npm run db:push --force`** (si funciona) o crear migración manual
3. **Verificar en BD** que el enum fue creado:
   ```sql
   SELECT * FROM pg_type WHERE typname = 'nombre_enum';
   ```
4. **Actualizar este documento** con el nuevo enum y sus valores

---

## Tests de Regresión Recomendados

Ver **Task 29** para implementación de tests que validen:

1. **Dashboard VERIFICAR**:
   - Métricas de auditorías con estados mixtos ('programada', 'en_ejecucion', 'cerrada')
   - Métricas de revisiones con estados mixtos
   - Cálculos de porcentajes de cumplimiento

2. **Dashboard ACTUAR**:
   - Acciones con todos los estados posibles ('pendiente', 'en-proceso', 'completada', 'vencida')
   - Filtros por prioridad y tipo

3. **Matriz Legal**:
   - Filtros por categoría_norma (16 valores)
   - Estados de cumplimiento (4 valores)

---

## Historial de Cambios

| Fecha | Cambio | Responsable | Task |
|-------|--------|-------------|------|
| 2025-11-13 | Documento inicial, sincronización de 120 enums | Replit Agent | Task 27-28 |
| 2025-11-13 | Correcciones de estados en Dashboard VERIFICAR | Replit Agent | Task 24 |
| 2025-11-13 | Identificación de drift en temas_revision | Replit Agent | Task 27 → Task 34 |

---

## Referencias

- **Schema TypeScript**: `shared/schema.ts`
- **Storage Layer**: `server/storage.ts` (métodos getDashboardVerificar, getDashboardActuar)
- **Auditorías de Cumplimiento**: 
  - `docs/AUDITORIA_RESOLUCION_0312_2019.md`
  - `docs/AUDITORIA_ISO_45001_2018.md`
- **Drift Pendiente**: Task 34 - Reconciliación de columnas `temas_revision`

---

## Contacto

Para preguntas sobre este documento o reportar nuevos drifts de schema, consultar con el equipo de desarrollo o crear un issue vinculado al Bloque 5 (Validación Integral).
