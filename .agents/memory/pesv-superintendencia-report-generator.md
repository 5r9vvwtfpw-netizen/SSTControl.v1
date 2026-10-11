---
name: Generador de informes regulatorios PESV
description: Regla del usuario para organizar informes regulatorios PESV a partir de módulos fuente existentes.
---

Debe existir un solo módulo generador de informes en el menú PESV. El archivo de salida reúne todos los campos solicitados en un informe completo y se puede descargar en Excel y PDF. Cada dato se toma del módulo fuente existente; si allí falta un campo necesario, se amplía ese módulo, sin crear módulos de captura separados por requisito.

Cuando falten datos, la pantalla debe indicar el paso/código del PESV, el módulo fuente y su ruta, con un enlace directo. Para el acta que analiza un siniestro, la ruta es Paso 1 (P01, Planear) > Comité PESV > Actas; después se vuelve a Siniestros Viales (Paso 21, V02) para asociar el acta al registro.

Un período sin siniestros puede producir un informe con todos los indicadores numéricos en cero, pero requiere que la empresa confirme explícitamente ambas fechas. El informe no debe crear una fila ficticia ni inferir que la ausencia de registros prueba que no hubo accidentes. Se captura un registro por accidente real —no por cada vehículo de la flota— y se selecciona el vehículo desde la lista existente.

La periodicidad de presentación de estos informes es trimestral, no anual. El usuario entregará los informes requeridos de uno en uno; implementar solo el informe en curso y esperar su aprobación antes de comenzar el siguiente.

**Why:** El usuario pidió expresamente esta arquitectura para mantener coherencia con los módulos actuales y evitar duplicar la captura. También señaló que un cliente no sabe dónde encontrar un dato como el acta si el informe solo indica que falta. La confirmación expresa evita reportar ceros cuando en realidad los accidentes aún no se han registrado. El usuario corrigió la periodicidad a trimestral y pidió aprobar cada informe antes de seguir con los demás.

**How to apply:** Construir informes regulatorios PESV para períodos trimestrales y trabajar en secuencia, esperando aprobación entre informes. Para cada uno, relacionar los datos solicitados con su módulo fuente y paso, completar allí los campos faltantes y agregarlos al único generador. Evitar mensajes genéricos como “completar en el módulo”; mostrar la ruta específica y un acceso directo. Para períodos sin eventos, exigir confirmación clara, presentar indicadores en cero sin inventar incidentes.
