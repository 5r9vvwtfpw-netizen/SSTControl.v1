---
name: Induction resend policy
description: Reglas funcionales para reenviar inducciones SST/PESV y usar sus evaluaciones prediseñadas.
---

Las sesiones de inducción SST y PESV se pueden enviar repetidamente al mismo trabajador, de forma individual o masiva, incluso cuando ya tiene otra sesión pendiente o en progreso. Cada envío crea una sesión independiente. Las evaluaciones virtuales SST, reinducción y PESV están prediseñadas en el portal y no dependen de preguntas administradas por cada empresa.

**Why:** La empresa puede necesitar reenviar una inducción por corrección, nueva convocatoria o repetición, sin esperar a que expire la anterior. Las evaluaciones SST y PESV ya forman parte del sistema y no deben duplicarse ni redefinirse por empresa.

**How to apply:** No excluir trabajadores por sesiones anteriores o activas en endpoints ni botones de envío SST/PESV. Cada solicitud explícita debe crear tokens e instantáneas nuevos sin reemplazar el historial. SST debe usar el cuestionario prediseñado según el nivel de riesgo y PESV sus ocho preguntas establecidas, incluso para sesiones antiguas con instantáneas vacías. Si una respuesta queda vacía, bloquear firma y finalización.