---
name: Autenticación ePayco
description: Interpretación de respuestas del login al habilitar pagos bancarios.
---

El login de ePayco puede responder HTTP 200 aunque rechace las llaves: no considerar operativo el proveedor hasta comprobar que el cuerpo contiene un token válido y no indica error.

**Why:** En comprobaciones de solo lectura, tanto el login antiguo como APIFY devolvieron HTTP 200 con rechazo de autenticación; una comprobación basada solo en el código HTTP anunciaría pagos disponibles falsamente.

**How to apply:** Al probar credenciales o exponer disponibilidad del botón PSE, verificar explícitamente el resultado semántico de autenticación sin registrar ni mostrar secretos.