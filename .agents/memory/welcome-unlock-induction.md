---
name: Desbloqueo y aviso de inducción
description: La reactivación de acceso no equivale a completar una inducción.
---

Al reactivar manualmente el acceso de una empresa, ocultar el aviso de bienvenida para todos sus usuarios, incluso si la inducción no está registrada como completada. No marcar la inducción como completada solo para suprimir una alerta.

**Why:** «Desbloquear empresa» reactiva la suscripción; «Liberar empresa» registra inducción completada. Mezclar ambos hechos produce un historial engañoso y antes dejaba el aviso visible después de restaurar el acceso.

**How to apply:** Mantener separados el estado de bienvenida y el de inducción. Si se agrega otro camino de desbloqueo manual, sincronizar la supresión del aviso allí; los clientes con el aviso abierto necesitan recibir el cambio sin recargar la página.