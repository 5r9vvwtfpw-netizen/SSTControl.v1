---
name: Evidencia contractual para pagos
description: Relación entre aceptación histórica de checkout y firma SaaS para habilitar pagos.
---

La aceptación de checkout y la firma SaaS real vigente son vías distintas de consentimiento. Una empresa que ya tiene una firma válida no debe quedar obligada a aceptar otra vez solo porque la marca histórica de la suscripción esté vacía. Conservar la validez de las aceptaciones históricas y excluir firmas técnicas, de otra empresa o sin evidencia coherente.

**Why:** Una empresa mostraba su contrato como firmado, pero el envío del enlace PSE solo consultaba la aceptación antigua y lo rechazaba. Duplicar la aceptación no resuelve la falta de coherencia entre módulos.

**How to apply:** Toda comprobación contractual de un pago debe reconocer ambas vías, sin modificar el documento firmado ni inventar fechas de aceptación. Una consulta fallida debe bloquear explícitamente la operación, no autorizarla.