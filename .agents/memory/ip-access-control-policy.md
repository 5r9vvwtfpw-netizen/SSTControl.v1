---
name: IP access-control policy
description: Política acordada para monitoreo y autorización de IP en cuentas de usuario.
---

Una cuenta solo queda restringida por IP cuando el superadmin configura al menos una IP autorizada. Una IP nueva o no registrada debe generar una alerta y quedar en el historial, pero no bloquear automáticamente el primer acceso.

**Why:** Las IP pueden cambiar por proveedor, VPN, red móvil o red compartida; bloquear el primer cambio puede dejar fuera a una persona legítima.

Con monitoreo activo, se permiten y alertan los primeros tres accesos no autorizados dentro de una ventana móvil de 24 horas; el cuarto se bloquea hasta que el acceso permitido más antiguo salga de la ventana.

La atribución combina cuenta, sesión, IP, navegador, identificador persistente del navegador y geolocalización aproximada. No debe presentarse como identificación física concluyente.

La verificación de dos pasos por correo se exige en cada login a todos los roles excepto `superadmin`, `trabajador` y `tecnico_mecanico`; aplica también al portal de soporte.

**How to apply:** Mantener la lista vacía como modo sin restricción. Enviar correo a superadmins por cada alerta en producción; las fallas de correo o GeoIP no deben interrumpir accesos legítimos. Cuando un superadmin activa la restricción estricta en una cuenta, cualquier IP fuera de la lista se bloquea inmediatamente; el modo gradual de tres intentos solo aplica a cuentas sin esa opción.

Cada vez que el superadmin guarda una lista de IP autorizadas, cambia el modo estricto o elimina todas las IP, empieza una nueva ventana de control. Los intentos no autorizados anteriores no pueden mantener bloqueada la cuenta después del cambio. Una lista vacía también debe apagar el modo estricto.

**Why:** Autorizar una IP o retirar la restricción es una acción explícita de recuperación; conservar el contador de intentos previo deja bloqueados tanto a trabajadores como a cuentas de empresa aunque el administrador ya haya corregido la política.

En despliegues Replit, la IP de cliente debe extraerse explícitamente de `X-Forwarded-For`; `req.ip` puede devolver el proxy intermedio cuando hay más de una capa.

**Why:** La geolocalización de una IP de proxy puede atribuir el acceso a Google u otro proveedor en vez de a la red real del usuario, debilitando las alertas y las listas autorizadas.