# 🔐 Solución: Corregir Contraseñas en Producción

## ❌ Problema Identificado

El usuario **laurent** con contraseña **lolo123** no puede iniciar sesión en producción porque:

1. ✅ El usuario existe en la base de datos de producción
2. ❌ La contraseña está almacenada en **texto plano** ("lolo123")
3. ❌ El sistema espera contraseñas **hasheadas con scrypt**

---

## ✅ Solución Rápida

### Opción 1: Ejecutar Script de Corrección (Recomendado)

**Desde el entorno de producción:**

```bash
NODE_ENV=production tsx server/fix-passwords.ts
```

Este script:
- ✅ Detecta automáticamente contraseñas en texto plano
- ✅ Las hashea usando scrypt (el mismo método que usa el sistema)
- ✅ **NO cambia las contraseñas** - solo las hashea
- ✅ Preserva la contraseña original ("lolo123" seguirá siendo "lolo123")

**Después de ejecutarlo:**
- ✅ Podrás entrar con: `laurent` / `lolo123`

---

### Opción 2: Hashear Manualmente via SQL

Si no puedes ejecutar el script TypeScript, puedes crear un usuario temporal con la contraseña correctamente hasheada:

**Paso 1:** Exporta los datos de producción para crear un backup:
```bash
pg_dump $DATABASE_URL > backup-antes-fix.sql
```

**Paso 2:** Usa la consola de Replit para hashear la contraseña:

```typescript
// En una shell de Node.js o en el archivo fix-passwords.ts
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Ejecutar:
hashPassword('lolo123').then(console.log);
```

**Paso 3:** Actualiza la contraseña en la base de datos:
```sql
UPDATE users 
SET password = '<hash_generado_arriba>' 
WHERE username = 'laurent';
```

---

## 🎯 ¿Por qué ocurrió esto?

### Flujo Correcto (Desarrollo):
1. Usuario crea cuenta vía interfaz
2. La contraseña se hashea automáticamente antes de guardar
3. ✅ Base de datos contiene: `hash.salt`

### Lo que pasó en Producción:
1. Usuario "laurent" fue creado directamente en la base de datos
2. La contraseña se insertó como texto plano: "lolo123"
3. ❌ Base de datos contiene: `lolo123` (sin hashear)
4. ❌ El login falla porque compara hash vs texto plano

---

## 📋 Script Creado

He creado el script `server/fix-passwords.ts` que:

```typescript
✅ Lee todos los usuarios
✅ Detecta contraseñas sin hashear (< 100 caracteres, sin punto)
✅ Hashea las contraseñas usando scrypt
✅ Actualiza la base de datos
✅ Muestra un resumen detallado
```

---

## 🚀 Ejecución del Script

### En Desarrollo (Ya ejecutado ✅):

```bash
NODE_ENV=development tsx server/fix-passwords.ts
```

**Resultado:**
```
✅ Contraseñas hasheadas: 1 (test_admin)
✓  Ya estaban hasheadas: 13
📊 Total procesado: 14
```

### En Producción (Pendiente ⚠️):

```bash
NODE_ENV=production tsx server/fix-passwords.ts
```

**Resultado esperado:**
```
✅ Contraseñas hasheadas: 1 (laurent)
✓  Ya estaban hasheadas: X
📊 Total procesado: Y
```

---

## ✅ Verificación Post-Corrección

Después de ejecutar el script en producción:

1. **Verifica que la contraseña se hasheó:**
   ```sql
   SELECT username, LENGTH(password) as len 
   FROM users 
   WHERE username = 'laurent';
   ```
   
   Debería mostrar: `len = 161` (o cercano)

2. **Intenta iniciar sesión:**
   - Usuario: `laurent`
   - Contraseña: `lolo123`
   - ✅ Debería funcionar

---

## 🔐 Mejores Prácticas

Para evitar este problema en el futuro:

1. ✅ **Siempre crea usuarios vía la interfaz de la aplicación**
   - Nunca insertes usuarios directamente en SQL

2. ✅ **Si debes crear un usuario manualmente:**
   ```typescript
   // Usa este código para generar el hash primero
   import { scrypt, randomBytes } from 'crypto';
   import { promisify } from 'util';
   
   const scryptAsync = promisify(scrypt);
   const salt = randomBytes(16).toString('hex');
   const buf = await scryptAsync('tu_password', salt, 64);
   const hashedPassword = `${buf.toString('hex')}.${salt}`;
   ```

3. ✅ **Después de importar datos:**
   - Ejecuta `fix-passwords.ts` para asegurar que todo está correcto

---

## 📞 Resumen

**Problema:** Usuario laurent no puede entrar porque su contraseña está en texto plano en producción

**Solución:** Ejecutar `NODE_ENV=production tsx server/fix-passwords.ts`

**Tiempo estimado:** < 30 segundos

**Impacto:** Ninguno - Las contraseñas originales se preservan, solo se hashean

---

**Última actualización:** ${new Date().toISOString()}
