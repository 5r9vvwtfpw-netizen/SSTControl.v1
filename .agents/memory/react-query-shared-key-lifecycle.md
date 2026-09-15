---
name: React Query shared-key lifecycle
description: Evita cargas infinitas causadas al eliminar consultas compartidas mientras hay componentes observándolas.
---

No llamar `removeQueries` sobre una clave compartida desde un efecto de montaje de un provider cuando otras pantallas pueden estar consultando esa misma clave.

**Why:** React Query puede cancelar y eliminar la consulta mientras la petición sigue en curso. La respuesta HTTP llega correctamente, pero el observador activo descarta el resultado y queda pendiente sin error visible.

**How to apply:** Limpiar estado local y de sesión sin eliminar consultas activas. Si hace falta aislar caché por usuario, limpiar al cerrar sesión o incluir identidad/alcance en la clave.