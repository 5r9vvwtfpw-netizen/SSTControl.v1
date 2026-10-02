---
name: Compatibilidad de roles con enums de producción
description: Diferencias entre los roles reconocidos por el código y los labels del enum PostgreSQL en AWS RDS.
---

No asumir que todos los roles reconocidos por el código existen como labels del enum PostgreSQL en producción. La base AWS RDS puede conservar un catálogo anterior al de desarrollo.

**Why:** Se comprobó que producción reconoce cuentas LSO mediante el rol `lso`, pero su enum no incluye `lso_externo`. Incluir ese segundo valor en una comparación directa contra el enum hacía fallar toda la consulta de destinatarios, aun con una asignación activa válida.

**How to apply:** Para filtros de lectura que admiten varias etiquetas históricas, comparar el enum como texto cuando corresponda. Mantener la validación de empresa y asignación activa; no ampliar contactos ni modificar roles/asignaciones para resolver una incompatibilidad de consulta. Si se necesita almacenar una etiqueta nueva, verificar y gestionar el esquema por separado.