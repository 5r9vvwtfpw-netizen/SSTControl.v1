---
name: Compatibilidad de roles con enums PostgreSQL
description: Los roles reconocidos por el código pueden no estar disponibles como labels PostgreSQL en producción o desarrollo.
---

No asumir que todos los roles reconocidos por el código existen como labels del enum PostgreSQL en producción. La base AWS RDS puede conservar un catálogo anterior al de desarrollo.

Tampoco asumir que desarrollo contiene todos los roles: su enum también rechazó `lso_externo` durante una prueba autenticada. Comprobar cómo se representan realmente los profesionales externos antes de sembrar cuentas o migrar etiquetas.

**Why:** La lógica de autorización admitía ese nombre de rol, pero la base de desarrollo no permitía crear la cuenta. La prueba directa de la regla no equivale a una verificación con sesión iniciada para ese rol.

**How to apply:** Revisar el enum del entorno y la representación canónica del usuario externo. No modificarlo automáticamente para satisfacer una fixture; tratar cualquier cambio de esquema como trabajo separado.

**Why:** Se comprobó que producción reconoce cuentas LSO mediante el rol `lso`, pero su enum no incluye `lso_externo`. Incluir ese segundo valor en una comparación directa contra el enum hacía fallar toda la consulta de destinatarios, aun con una asignación activa válida.

**How to apply:** Para filtros de lectura que admiten varias etiquetas históricas, comparar el enum como texto cuando corresponda. Mantener la validación de empresa y asignación activa; no ampliar contactos ni modificar roles/asignaciones para resolver una incompatibilidad de consulta. Si se necesita almacenar una etiqueta nueva, verificar y gestionar el esquema por separado.