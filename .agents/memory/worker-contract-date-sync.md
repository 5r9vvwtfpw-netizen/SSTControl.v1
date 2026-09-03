---
name: Worker and contract date synchronization
description: La fecha laboral existe en workers y contracts; ambas representaciones deben permanecer sincronizadas para el contrato activo.
---

La fecha de inicio y fin editadas desde el perfil del trabajador deben actualizar el contrato activo, y las editadas desde el contrato deben actualizar el perfil del trabajador. Los contratos históricos no se modifican.

**Why:** La interfaz muestra datos heredados del trabajador y datos del contrato en pestañas distintas; sin sincronización, el usuario puede guardar una fecha y seguir viendo la anterior en la otra pestaña.

**How to apply:** Mantener la sincronización acotada al contrato con estado `activo`; no propagar cambios a contratos terminados, vencidos o suspendidos.