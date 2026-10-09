---
name: Generador de informes regulatorios PESV
description: Regla del usuario para organizar informes regulatorios PESV a partir de módulos fuente existentes.
---

Debe existir un solo módulo generador de informes en el menú PESV. El archivo de salida reúne todos los campos solicitados en un informe completo y se puede descargar en Excel y PDF. Cada dato se toma del módulo fuente existente; si allí falta un campo necesario, se amplía ese módulo, sin crear módulos de captura separados por requisito.

Cuando falten datos, la pantalla debe indicar el paso/código del PESV, el módulo fuente y su ruta, con un enlace directo. Para el acta que analiza un siniestro, la ruta es Paso 1 (P01, Planear) > Comité PESV > Actas; después se vuelve a Siniestros Viales (Paso 21, V02) para asociar el acta al registro.

**Why:** El usuario pidió expresamente esta arquitectura para mantener coherencia con los módulos actuales y evitar duplicar la captura. También señaló que un cliente no sabe dónde encontrar un dato como el acta si el informe solo indica que falta.

**How to apply:** Antes de construir futuros informes regulatorios PESV, relacionar cada dato solicitado con su módulo fuente y paso, completar allí los datos faltantes y después agregarlos al único generador. Evitar mensajes genéricos como “completar en el módulo”; mostrar la ruta específica y un acceso directo.
