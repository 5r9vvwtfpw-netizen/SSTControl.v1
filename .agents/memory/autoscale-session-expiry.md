---
name: Autoscale session expiry
description: Limitaciones del cierre de sesiones por inactividad en despliegues Autoscale.
---

No depender exclusivamente de `setInterval` para cerrar sesiones por inactividad en un despliegue Autoscale. Las instancias pueden suspenderse al no recibir tráfico, por lo que el monitor no se ejecuta justo al cumplirse el límite.

**Why:** En producción pueden quedar registros de sesiones vencidas marcados como activos aunque su cookie ya debería haber expirado; también los navegadores suspenden temporizadores de pestañas en segundo plano.

**How to apply:** Renueva la cookie solo tras actividad real, comprueba el vencimiento cuando la pestaña vuelve a estar visible y ejecuta una limpieza limitada al entrar tráfico. Mantén el intervalo para entornos con proceso permanente, donde sí puede ejecutar el cierre puntual.