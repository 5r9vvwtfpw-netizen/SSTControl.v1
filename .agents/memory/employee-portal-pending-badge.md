---
name: Employee portal pending badge
description: Criterio funcional para el contador de pendientes del portal y el distintivo de la PWA instalada.
---

La campana del Portal de Empleados, el distintivo de la PWA instalada y los Web Push deben usar el mismo total absoluto de acciones pendientes. Cuentan únicamente obligaciones que el empleado puede resolver dentro de su portal: confirmaciones, inducciones, exámenes, audiometrías, votaciones abiertas y tareas diarias de conductor. Los trabajadores no tienen acceso a Mensajes Internos, por lo que esos mensajes nunca deben aparecer ni sumar en su campana.

**Why:** Contadores separados o parciales hacen que el empleado no sepa que debe entrar al portal; sumar módulos históricos, informativos o voluntarios genera alertas que nunca puede limpiar.

**How to apply:** Toda categoría nueva con una acción obligatoria y accesible desde el Portal de Empleados debe incorporarse al cálculo central y sus eventos deben enviar Web Push con el total absoluto. No usar incrementos locales, contar simples listados ni incluir Mensajes Internos. En iPhone/iPad, un contador correcto no aparece en el icono hasta que la PWA instalada tenga habilitados Notificaciones y Distintivos; al activar el permiso se debe resincronizar el total por navigator y por el registro del service worker.