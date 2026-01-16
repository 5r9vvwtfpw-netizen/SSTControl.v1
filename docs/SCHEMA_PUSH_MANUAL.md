# 📋 PROCEDIMIENTO: Schema Push Manual - Audit Logs

**Acción Requerida:** Push de tabla audit_logs a base de datos  
**Tiempo Estimado:** 30 segundos  
**Prioridad:** Alta (bloqueante para audit logging)

---

## 🎯 OBJETIVO

Crear la tabla `audit_logs` y el enum `audit_action` en la base de datos PostgreSQL (Neon) para habilitar el sistema de auditoría legal.

---

## 📋 PROCEDIMIENTO

### Paso 1: Ejecutar db:push

```bash
npm run db:push
```

### Paso 2: Responder al Prompt Interactivo

Cuando aparezca el siguiente prompt:

```
Is audit_action enum created or renamed from another enum?
❯ + audit_action                                  create enum  ← SELECCIONAR ESTA OPCIÓN
  ~ estado_revision_direccion_enum › audit_action rename enum
  ~ rol_participante_revision_enum › audit_action rename enum
  ~ tipo_accion_revision_enum › audit_action      rename enum
```

**Acción:** Presionar **Enter** para seleccionar la primera opción ("+  audit_action create enum")

**Explicación:** Esto crea un nuevo enum llamado `audit_action` sin afectar enums existentes.

### Paso 3: Confirmar Cambios

El comando aplicará los siguientes cambios a la base de datos:

1. **Crear enum** `audit_action` con valores:
   - `create`
   - `update`
   - `delete`
   - `view`
   - `export`
   - `access_report`

2. **Crear tabla** `audit_logs` con columnas:
   - `id` (UUID, primary key)
   - `company_id` (UUID, foreign key)
   - `user_id` (UUID, foreign key)
   - `user_role` (text)
   - `username` (text)
   - `entity_type` (text)
   - `entity_id` (text)
   - `action` (audit_action enum)
   - `data_subject_id` (text, nullable)
   - `data_subject_name` (text, nullable)
   - `old_values` (text/JSON, nullable)
   - `new_values` (text/JSON, nullable)
   - `changed_fields` (text/JSON, nullable)
   - `timestamp` (timestamp)
   - `ip_address` (text, nullable)
   - `user_agent` (text, nullable)
   - `request_id` (text, nullable)
   - `description` (text, nullable)
   - `source` (text, default 'api')
   - `created_at` (timestamp)

### Paso 4: Verificar Creación

```bash
# Conectar a base de datos
psql $DATABASE_URL

# Verificar enum
\dT+ audit_action

# Verificar tabla
\d audit_logs

# Salir
\q
```

**Output Esperado:**
```sql
-- Enum audit_action debe existir
List of data types
Schema | Name          | Type | Owner
public | audit_action  | enum | ...

-- Tabla audit_logs debe existir con ~20 columnas
```

---

## ✅ CRITERIOS DE ÉXITO

- [x] Enum `audit_action` existe en base de datos
- [x] Tabla `audit_logs` existe con todas las columnas
- [x] Foreign keys a `companies` y `users` están activas
- [x] No hay errores de migración

---

## 🚨 TROUBLESHOOTING

### Error: "enum value already exists"
**Causa:** Ya seleccionaste una opción anterior que creó el enum  
**Solución:** Verificar con `\dT+ audit_action` en psql. Si existe, el schema ya está pusheado.

### Error: "relation audit_logs already exists"
**Causa:** Tabla ya fue creada anteriormente  
**Solución:** Schema push ya está completo. No requiere acción.

### Prompt no aparece
**Causa:** Schema ya está sincronizado  
**Solución:** Ejecutar `psql` y verificar si tabla existe. Si existe, todo está listo.

---

## 📝 NOTAS

- Este procedimiento es **one-time only** - solo debe ejecutarse una vez
- El prompt interactivo es una característica de drizzle-kit para prevenir errores de migración
- Una vez completado, la tabla estará disponible para todos los entornos que comparten la misma base de datos

---

**Versión:** 1.0  
**Owner:** Equipo Backend SST Colombia  
**Estado:** Pendiente de ejecución
