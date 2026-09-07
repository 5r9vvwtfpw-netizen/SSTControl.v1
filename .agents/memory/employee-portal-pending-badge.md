---
name: Employee portal pending badge
description: Criterio funcional para el contador de pendientes del portal y el distintivo de la PWA instalada.
---

La campana del Portal de Empleados, el distintivo de la PWA instalada y los Web Push deben usar el mismo total absoluto de acciones pendientes. Cuentan obligaciones que el empleado puede resolver: mensajes sin leer, confirmaciones, inducciones, exámenes, audiometrías, votaciones abiertas y tareas diarias de conductor.

**Why:** Contadores separados o parciales hacen que el empleado no sepa que debe entrar al portal; sumar módulos históricos, informativos o voluntarios genera alertas que nunca puede limpiar.

**How to apply:** Toda categoría nueva con una acción obligatoria debe incorporarse al cálculo central y sus eventos deben enviar Web Push con el total absoluto. No usar incrementos locales ni contar simples listados.