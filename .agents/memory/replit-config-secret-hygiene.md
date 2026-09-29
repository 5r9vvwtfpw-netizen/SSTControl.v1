---
name: Seguridad de la configuración Replit
description: Cómo depurar .replit sin exponer valores sensibles y qué queda pendiente tras retirar valores versionados.
---

Las ediciones directas de `.replit` pueden ser rechazadas: preparar un TOML temporal dentro del workspace y pasarlo por `verifyAndReplaceDotReplit` para validarlo antes del reemplazo. Cuando hay valores sensibles, transformar el contenido sin imprimirlo ni incorporarlo al parche. Confirmar solo la existencia de los secretos por entorno.

**Why:** Un archivo de configuración versionado contenía valores sensibles en texto plano. Retirar esas entradas conserva las claves configuradas en Replit Secrets, pero el contenido anterior puede seguir en el historial de control de versiones; eliminar las líneas no equivale a rotar las credenciales.

**How to apply:** Antes de publicar cambios que toquen `.replit`, comprobar la existencia de los secretos en desarrollo y producción, reemplazar mediante la validación de la plataforma y verificar arranque. Solicitar rotación del valor original en cada servicio emisor y actualizar Replit Secrets por el flujo seguro, sin copiar valores al chat ni al código.