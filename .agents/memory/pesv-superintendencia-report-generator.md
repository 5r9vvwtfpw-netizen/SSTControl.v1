---
name: Generador de informes regulatorios PESV
description: Regla del usuario para organizar informes regulatorios PESV a partir de módulos fuente existentes.
---

En el menú PESV se conserva "Informe mensual Superintendencia" y se agrega una entrada separada "Informe trimestral Superintendencia", que reunirá nueve informes. Implementar cada informe trimestral de uno en uno y esperar la aprobación del usuario antes de iniciar el siguiente. El primer informe es el registro de vehículos siniestrados, ya existente en la sección mensual; se reutiliza su captura y sus datos en la vista trimestral, sin duplicar módulos de registro.

Cada informe completo se puede descargar en Excel y PDF. Los datos salen de los módulos fuente existentes; si falta un campo necesario, se amplía el módulo fuente, sin crear módulos de captura separados por requisito.

Cuando falten datos, la pantalla debe indicar el paso/código del PESV, el módulo fuente y su ruta, con un enlace directo. Para el acta que analiza un siniestro, la ruta es Paso 1 (P01, Planear) > Comité PESV > Actas; después se vuelve a Siniestros Viales (Paso 21, V02) para asociar el acta al registro.

Un período sin siniestros puede producir un informe con todos los indicadores numéricos en cero, pero requiere que la empresa confirme explícitamente ambas fechas. El informe no debe crear una fila ficticia ni inferir que la ausencia de registros prueba que no hubo accidentes. Se captura un registro por accidente real —no por cada vehículo de la flota— y se selecciona el vehículo desde la lista existente.

La periodicidad de presentación de los nuevos informes es trimestral, no anual. El primer informe trimestral es el registro de vehículos siniestrados ya implementado en la sección mensual.

**Why:** El usuario pidió expresamente esta arquitectura para mantener coherencia con los módulos actuales y evitar duplicar la captura. También señaló que un cliente no sabe dónde encontrar un dato como el acta si el informe solo indica que falta. La confirmación expresa evita reportar ceros cuando en realidad los accidentes aún no se han registrado. El usuario corrigió la periodicidad a trimestral, pidió una nueva entrada PESV independiente del informe mensual con nueve informes y aprobación antes de avanzar de uno a otro.

**How to apply:** Mantener separadas las entradas mensual y trimestral en el menú PESV. Construir los nueve informes trimestrales en secuencia, esperando aprobación entre informes. Para cada uno, relacionar los datos solicitados con su módulo fuente y paso, completar allí los campos faltantes y agregarlos a la sección trimestral. Evitar mensajes genéricos como “completar en el módulo”; mostrar la ruta específica y un acceso directo. Para períodos sin eventos, exigir confirmación clara, presentar indicadores en cero sin inventar incidentes.
