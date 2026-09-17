---
name: IPER CIIU integration boundary
description: La clasificación CIIU y la generación de peligros concretos en la matriz IPER son flujos separados.
---

La automatización CIIU de la empresa solo determina el nivel de riesgo y el capítulo de estándares; la creación de registros en `peligros_iperc` es un flujo separado. Al crear una matriz IPER nueva, la interfaz puede generar automáticamente los peligros específicos combinados de las cuatro actividades CIIU con una evaluación inicial editable. Las matrices existentes no se rellenan retroactivamente sin una acción explícita.

**Why:** Un riesgo ARL correcto no garantiza que la matriz tenga peligros específicos visibles. El usuario necesita que una matriz nueva sea utilizable desde el primer momento, pero rellenar matrices anteriores sin confirmación puede introducir registros inesperados.

**How to apply:** Al ampliar CIIU, propagar `ciiuCode`, `ciiuCode2`, `ciiuCode3` y `ciiuCode4` desde la empresa asociada a la matriz, unir peligros sin duplicados y, al crear una matriz nueva, generar registros con valores iniciales explícitos que sigan siendo editables.