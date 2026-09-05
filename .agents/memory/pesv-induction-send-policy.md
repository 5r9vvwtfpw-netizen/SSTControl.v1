---
name: PESV induction send policy
description: Regla funcional para asignar y completar inducciones virtuales PESV sin exigir configuración previa de materiales.
---

Las sesiones de inducción PESV se pueden enviar de forma individual o masiva sin exigir contenidos publicados ni que cada empresa gestione preguntas. Los contenidos son opcionales y el cuestionario PESV ya está establecido en el sistema.

**Why:** La evaluación PESV ya forma parte del sistema y no debe duplicarse, redefinirse ni presentarse como configuración de cada empresa. El envío tampoco debe quedar bloqueado por una carga adicional de materiales.

**How to apply:** No agregar validaciones previas de contenido o preguntas a los endpoints ni a los botones de envío PESV. Las sesiones PESV deben consultar las preguntas activas ya existentes; nunca crear otro cuestionario como fallback. Si una respuesta queda vacía, bloquear firma y finalización. La ausencia de contenidos lleva directamente a la evaluación. No crear otra sesión activa del mismo tipo para el mismo trabajador.