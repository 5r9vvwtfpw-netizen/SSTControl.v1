---
name: Pruebas autenticadas de desarrollo
description: Errores no evidentes al crear cuentas temporales y reutilizar sesiones en pruebas API.
---

Cuando una prueba de desarrollo crea una cuenta temporal, no asumir que un correo vacío permite iniciar sesión: algunos roles requieren fecha de verificación de correo aunque la cuenta se haya insertado correctamente. No debilitar la autenticación de la aplicación para resolver una fixture de prueba.

**Why:** Una prueba funcional se detuvo en login por verificación pendiente en una cuenta temporal sin correo; era una condición del rol, no un fallo del retiro de trabajadores.

**How to apply:** Crear una cuenta temporal delimitada a la empresa, usar un correo sintético no entregable y marcar verificada solamente esa cuenta en desarrollo, o emplear un rol que ya esté exento si su permiso permite el flujo. Eliminar después solo la cuenta temporal por su ID y marcador exactos; conservar los registros funcionales solicitados.

En clientes HTTP de Node, reenviar todas las cookies de `Set-Cookie` recibidas en el login, no solo la primera.

**Why:** La primera cookie puede identificar el dispositivo y la cookie de sesión ir después; enviar solo la primera produce un 401 en solicitudes autenticadas aunque el login haya devuelto 200.

**How to apply:** Usar `headers.getSetCookie()` y unir únicamente los pares `nombre=valor` de cada cookie para el encabezado `Cookie` de las llamadas siguientes. Nunca imprimir contraseñas ni valores de cookies en la evidencia.