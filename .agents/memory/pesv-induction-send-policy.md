---
name: Induction resend policy
description: Reglas funcionales para reenviar inducciones SST/PESV y asignar PESV sin exigir configuración previa de materiales.
---

Las sesiones de inducción SST y PESV se pueden enviar repetidamente al mismo trabajador, de forma individual o masiva, incluso cuando ya tiene otra sesión pendiente o en progreso. Cada envío crea una sesión independiente. PESV tampoco exige contenidos publicados ni preguntas administradas por cada empresa.

**Why:** La empresa puede necesitar reenviar una inducción por corrección, nueva convocatoria o repetición, sin esperar a que expire la anterior. La evaluación PESV ya forma parte del sistema y no debe duplicarse ni redefinirse por empresa.

**How to apply:** No excluir trabajadores por sesiones anteriores o activas en endpoints ni botones de envío SST/PESV. Cada solicitud explícita debe crear tokens e instantáneas nuevos sin reemplazar el historial. PESV debe reutilizar las ocho preguntas establecidas; no agregar validaciones previas de contenidos o preguntas configurables. Si una respuesta queda vacía, bloquear firma y finalización.