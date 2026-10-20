---
name: Passport LocalStrategy error handling
description: Evita que fallos de base de datos durante la verificación de credenciales dejen colgado el request de acceso.
---

El verificador de credenciales asíncrono de Passport LocalStrategy debe capturar sus errores y resolverlos llamando `done(error)`. No asumir que Passport esperará o propagará automáticamente una Promise rechazada.

**Why:** En producción, la resolución DNS del RDS falló durante la búsqueda del usuario; el request de inicio de sesión quedó pendiente y se generó un `unhandledRejection`.

**How to apply:** En cualquier flujo que comparta el verificador local, envolver las consultas de usuario y comparación de contraseña en `try/catch`, registrar el error y llamar `done(error)`. Mantener también un límite de espera visible en el cliente para evitar indicadores de carga infinitos.
