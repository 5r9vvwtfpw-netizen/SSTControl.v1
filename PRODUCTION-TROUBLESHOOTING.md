# 🔍 Diagnóstico de Error 500 en Producción

## ❌ Problema Actual

Error 500 (Internal Server Error) al intentar iniciar sesión en producción con cualquier usuario.

---

## 🔧 Pasos de Diagnóstico

### 1. Verificar que el SQL se ejecutó correctamente

En el panel de base de datos de producción, ejecuta:

```sql
SELECT id, username, role, LENGTH(password) as password_length 
FROM users 
WHERE username IN ('production_admin', 'admin', 'laurent')
ORDER BY username;
```

**Resultado esperado:**
- `admin` - password_length: ~161 caracteres
- `laurent` - password_length: 7 caracteres (texto plano "lolo123")
- `production_admin` - password_length: ~161 caracteres

Si `production_admin` NO aparece → El INSERT no se ejecutó correctamente.

---

### 2. Verificar logs de producción

**Desde la interfaz de Replit:**
1. Ve a tu deployment publicado
2. Busca la pestaña "Logs" o "Console"
3. Intenta iniciar sesión de nuevo
4. Revisa los errores que aparecen

**Errores comunes a buscar:**
- `Cannot read properties of undefined`
- `password comparison failed`
- `User not found`
- Database connection errors

---

### 3. Intentar con el usuario admin por defecto

Prueba primero con:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

Este usuario debería existir automáticamente si ejecutaste los seeds.

**Si funciona:** El problema es solo con los otros usuarios
**Si NO funciona:** Hay un problema general de autenticación en producción

---

## ✅ Soluciones Según el Caso

### Caso A: production_admin no existe en la base de datos

**Solución:** Re-ejecutar el SQL INSERT

```sql
-- Primero verifica que no exista
SELECT * FROM users WHERE username = 'production_admin';

-- Si no existe, ejecuta:
INSERT INTO users (id, username, password, role, company_id, created_at)
VALUES (
  '0f6d684c-66e4-4c86-a5b5-0fc9f7ee88cb',
  'production_admin',
  '64e379771395415057c9ea9840410a413cd1cf6dd707a3d4b5ee2a8447bdfe6e26e09ca18b392eb32ceff5caac72651ab1213a6e3d997f9ee6851b4f86cf7c99.55968b779c13cd999951cd6e027b82c1',
  'admin',
  NULL,
  NOW()
);
```

---

### Caso B: El usuario existe pero la contraseña está mal

**Verifica:**
```sql
SELECT username, LEFT(password, 20) as password_start, LENGTH(password) as len
FROM users 
WHERE username = 'production_admin';
```

**Si password_length < 100:**
- La contraseña está en texto plano
- Necesitas actualizar con el hash correcto

**Solución:**
```sql
UPDATE users 
SET password = '64e379771395415057c9ea9840410a413cd1cf6dd707a3d4b5ee2a8447bdfe6e26e09ca18b392eb32ceff5caac72651ab1213a6e3d997f9ee6851b4f86cf7c99.55968b779c13cd999951cd6e027b82c1'
WHERE username = 'production_admin';
```

---

### Caso C: Error general de autenticación (admin tampoco funciona)

**Posibles causas:**
1. Problema con la configuración de sesiones en producción
2. Variable de entorno SESSION_SECRET no configurada
3. Base de datos no conectada correctamente
4. Error en el código de autenticación

**Solución:**
1. Revisa los logs de producción para el error específico
2. Verifica que DATABASE_URL y SESSION_SECRET estén configurados
3. Reinicia el deployment

---

### Caso D: Todos los usuarios tienen contraseñas en texto plano

Si todos los usuarios en producción tienen contraseñas sin hashear:

**Opción 1 - Importar datos de desarrollo:**
```bash
# Desde la shell de producción
psql $DATABASE_URL < data-export.sql
```

Esto importará todos los usuarios de desarrollo con contraseñas ya hasheadas.

**Opción 2 - Script de corrección:**
```bash
# Desde la shell de producción
NODE_ENV=production tsx server/fix-passwords.ts
```

---

## 🔍 Query de Diagnóstico Completo

Ejecuta esto en producción para ver el estado completo:

```sql
SELECT 
  username,
  role,
  LENGTH(password) as password_length,
  CASE 
    WHEN LENGTH(password) > 100 THEN 'Hasheada'
    ELSE 'Texto plano'
  END as password_status,
  company_id,
  created_at
FROM users
ORDER BY created_at DESC;
```

---

## 🎯 Siguiente Paso Recomendado

**Ejecuta primero el query de diagnóstico** y comparte el resultado. Con eso sabré exactamente qué está fallando y te daré la solución específica.

---

**Creado:** ${new Date().toISOString()}
