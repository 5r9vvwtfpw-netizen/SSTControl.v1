---
name: Generador de informes regulatorios PESV
description: Regla del usuario para organizar informes regulatorios PESV a partir de módulos fuente existentes.
---

Debe existir un solo módulo generador de informes en el menú PESV. El archivo de salida reúne todos los campos solicitados en un informe completo y se puede descargar en Excel y PDF. Cada dato se toma del módulo fuente existente; si allí falta un campo necesario, se amplía ese módulo, sin crear módulos de captura separados por requisito.

**Why:** El usuario pidió expresamente esta arquitectura para mantener coherencia con los módulos actuales y evitar duplicar la captura.

**How to apply:** Antes de construir futuros informes regulatorios PESV, relacionar cada dato solicitado con su módulo fuente, completar allí los datos faltantes y después agregarlos al único generador.
