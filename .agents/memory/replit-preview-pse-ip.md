---
name: IP de cliente en Preview para PSE
description: Limitación observada del proxy de desarrollo al probar proveedores que exigen IP pública.
---

**Regla:** No asumir que la cabecera X-Forwarded-For del Preview contiene la IP pública del pagador. Si no hay IP válida, no atribuir a ePayco un fallo ocurrido antes de crear la transacción.

**Why:** En una prueba autenticada de este entorno, tanto la IP de la petición como X-Forwarded-For eran locales; otras cabeceras habituales de IP estaban ausentes. El proxy descartó incluso una X-Forwarded-For pública añadida por el navegador automatizado. Por eso la validación previa respondió 503 y no llegó a crear una operación.

**How to apply:** Separar pruebas del formulario y autorización local de una prueba real con proveedor. Si se usa una IP de salida como sustituto para un sandbox, la excepción debe ser autorizada, temporal y limitada a desarrollo y a una empresa de prueba; retirarla al terminar y nunca presentarla como validación de la IP real ni usarla en producción.