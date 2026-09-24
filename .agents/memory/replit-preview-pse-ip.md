---
name: IP de cliente en Preview para PSE
description: Limitación observada del proxy de desarrollo al probar proveedores que exigen IP pública.
---

**Regla:** No asumir que la cabecera X-Forwarded-For del Preview contiene la IP pública del pagador. Si no hay IP válida, no atribuir a ePayco un fallo ocurrido antes de crear la transacción.

**Why:** En una prueba autenticada de este entorno, tanto la IP de la petición como X-Forwarded-For eran locales; otras cabeceras habituales de IP estaban ausentes. El proxy descartó incluso una X-Forwarded-For pública añadida por el navegador automatizado. Por eso la validación previa respondió 503 y no llegó a crear una operación.

**How to apply:** Separar pruebas del formulario y autorización local de una prueba real con proveedor. Para probar el sandbox sin IP de cliente, cualquier sustitución por IP de salida debe ser explícita, temporal y limitada a desarrollo y empresa de pruebas; nunca presentarla como validación de la IP real ni usarla silenciosamente en producción.

El usuario autorizó explícitamente usar la IP pública de salida del servidor solo para DEMO-PRUEBA en desarrollo mientras se repite la prueba PSE; el Dashboard de ePayco fue confirmado en modo de pruebas. Tras la prueba, retirar la configuración temporal. No deducir de esta autorización un permiso para otras empresas o para producción.