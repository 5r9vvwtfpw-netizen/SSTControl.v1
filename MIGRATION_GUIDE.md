# Guía de Migración de Datos: Desarrollo → Producción

Esta guía te ayudará a copiar todos los datos de tu base de datos de desarrollo a producción.

## 📋 Resumen

El proceso consta de 3 pasos simples:
1. **Exportar** datos desde desarrollo
2. **Transferir** el archivo SQL a producción
3. **Importar** datos en producción

---

## 🔄 Paso 1: Exportar Datos desde Desarrollo

### Opción A: Desde el entorno Replit (Recomendado)

1. Abre la terminal (Shell) en tu Repl
2. Ejecuta el siguiente comando:

```bash
NODE_ENV=development tsx server/export-sql.ts
```

3. Espera a que se complete la exportación. Verás algo como:

```
✅ Exportación SQL completada exitosamente!
📁 Archivo guardado en: /home/runner/workspace/data-export.sql
```

### Opción B: Descarga el archivo exportado

El archivo `data-export.sql` se encuentra en la raíz del proyecto. Puedes:
- Visualizarlo en el panel de archivos de Replit
- Descargarlo a tu computadora local

---

## 📤 Paso 2: Transferir el Archivo

Si trabajas en Replit y quieres importar a producción en el mismo Repl:
- ✅ **No necesitas hacer nada** - El archivo ya está disponible

Si necesitas transferir a otro servidor:
- 📥 Descarga `data-export.sql` desde Replit
- 📤 Súbelo al servidor de producción

---

## 📥 Paso 3: Importar Datos en Producción

### ⚠️ ADVERTENCIA IMPORTANTE

**Este proceso SOBRESCRIBIRÁ todos los datos existentes en producción.**

Antes de continuar:
- ✅ Asegúrate de tener un backup de producción
- ✅ Verifica que NO haya usuarios activos
- ✅ Confirma que quieres reemplazar TODOS los datos

### Método 1: Usando la terminal de Replit (Producción)

1. Cambia al entorno de producción en Replit (haz clic en "Publish")
2. Abre una terminal en el entorno de producción
3. Ejecuta:

```bash
psql $DATABASE_URL < data-export.sql
```

### Método 2: Usando un cliente PostgreSQL local

Si tienes acceso directo a la base de datos de producción:

```bash
psql "postgresql://usuario:contraseña@host:puerto/database" < data-export.sql
```

### Método 3: Script de importación automatizado (Más seguro)

Hemos incluido un script que:
- ✅ Verifica el entorno
- ✅ Muestra un resumen antes de importar
- ✅ Da 5 segundos para cancelar

```bash
NODE_ENV=production tsx server/import-data-sql.ts
```

---

## 📊 Datos Exportados

Tu exportación incluye datos de las siguientes tablas:

### Tablas Base
- ✅ Componentes SST (7 registros)
- ✅ Estándares SST (8 registros)
- ✅ Empresas
- ✅ Usuarios
- ✅ Trabajadores

### Módulos SST
- ✅ Perfiles de cargo
- ✅ Contratos laborales
- ✅ Exámenes médicos
- ✅ Designaciones de responsabilidad
- ✅ Asignación de recursos
- ✅ Afiliaciones SSSS
- ✅ Trabajadores de alto riesgo

### Gestión de Seguridad
- ✅ Accidentes
- ✅ Capacitaciones
- ✅ Inspecciones
- ✅ Medidas preventivas

### PESV
- ✅ Vehículos
- ✅ Conductores
- ✅ Inspecciones vehiculares
- ✅ Incidentes viales
- ✅ Capacitaciones de seguridad vial
- ✅ Auditorías PESV

### Actas y Programas
- ✅ Actas COPASST
- ✅ Actas Comité de Convivencia
- ✅ Programas de capacitación
- ✅ Curso 50 horas
- ✅ Registros de inducción

### Gestión Ambiental
- ✅ Mediciones ambientales
- ✅ Sustancias peligrosas

### SVE
- ✅ Programas SVE
- ✅ Casos SVE

### Políticas y Evaluaciones
- ✅ Políticas SST
- ✅ Evaluaciones SST
- ✅ Respuestas a estándares
- ✅ Acciones de mejora

### Planificación
- ✅ Planes de trabajo anual
- ✅ Actividades del plan
- ✅ Matriz legal

### Programas de Capacitación
- ✅ Programas de capacitación
- ✅ Capacitaciones programadas
- ✅ Asistencia a capacitaciones

---

## 🔧 Solución de Problemas

### Error: "relation does not exist"

**Causa:** La tabla no existe en la base de datos de producción.

**Solución:**
1. Asegúrate de haber ejecutado las migraciones en producción
2. Ejecuta: `npm run db:push` en producción

### Error: "duplicate key value violates unique constraint"

**Causa:** Los datos ya existen en producción.

**Solución:**
1. El script SQL usa `ON CONFLICT DO NOTHING`, así que este error no debería ocurrir
2. Si persiste, limpia la base de datos de producción primero

### Error: "permission denied"

**Causa:** No tienes permisos para modificar la base de datos.

**Solución:**
1. Verifica que estés usando las credenciales correctas
2. Contacta al administrador de la base de datos

---

## ✅ Verificación Post-Importación

Después de importar, verifica que todo funcionó correctamente:

### 1. Verifica el número de registros

```sql
-- Empresas
SELECT COUNT(*) FROM companies;

-- Usuarios
SELECT COUNT(*) FROM users;

-- Trabajadores
SELECT COUNT(*) FROM workers;
```

### 2. Prueba el inicio de sesión

Intenta iniciar sesión con tus credenciales de desarrollo.

### 3. Verifica los módulos principales

- [ ] Panel de control carga correctamente
- [ ] Puedes ver trabajadores
- [ ] Puedes ver capacitaciones
- [ ] Las políticas SST están disponibles
- [ ] El plan de trabajo anual se muestra

---

## 🔐 Credenciales por Defecto

Si la base de datos de producción estaba vacía, el sistema creará automáticamente:

**Usuario admin:**
- Usuario: `admin`
- Contraseña: `admin123`

**⚠️ IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer inicio de sesión.

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs del servidor
2. Verifica que la base de datos de producción esté accesible
3. Asegúrate de que las tablas existan en producción
4. Contacta al equipo de soporte técnico

---

## 🎯 Próximos Pasos

Después de una migración exitosa:

1. ✅ Cambia las contraseñas predeterminadas
2. ✅ Verifica todos los módulos
3. ✅ Realiza una prueba completa del sistema
4. ✅ Informa a los usuarios que el sistema está listo
5. ✅ Programa backups regulares

---

**Última actualización:** ${new Date().toLocaleDateString('es-CO')}
