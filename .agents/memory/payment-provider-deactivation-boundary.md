---
name: Payment provider deactivation boundary
description: Desactivar un proveedor de pagos exige bloquear creación, consulta, webhook y UI, conservando el código histórico para migración.
---

La desactivación de un proveedor de pagos debe aplicarse en una compuerta central del servicio y repetirse en el webhook; ocultar el método en el checkout no basta.

**Why:** Un webhook o una ruta antigua puede seguir activando suscripciones aunque el método ya no aparezca en la interfaz.

**How to apply:** Cuando se migre Wompi a ePayco u otro proveedor, conservar los adaptadores históricos sin credenciales operativas, devolver respuestas explícitas de no disponibilidad y evitar polling o redirecciones desde el frontend.