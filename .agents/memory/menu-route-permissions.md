---
name: Global menu route permissions
description: Las nuevas opciones del menú PHVA requieren registro explícito en routePermissions para que aparezcan.
---

Las rutas nuevas del menú global deben registrarse en `shared/route-permissions.ts`; el filtrado del menú deniega por defecto las rutas no listadas, aunque exista el enlace y la página.

**Why:** El menú filtra cada opción con `canAccessRoute`, por lo que una ruta no registrada desaparece silenciosamente para todos los roles.

**How to apply:** Al añadir una opción a `phvaMenus`, agregar también su permiso correspondiente, normalmente `billing:global_view` para funciones exclusivas de superadmin.