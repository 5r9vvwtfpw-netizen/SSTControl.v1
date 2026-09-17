---
name: IPER CIIU integration boundary
description: La clasificación CIIU y la generación de peligros concretos en la matriz IPER son flujos separados.
---

La automatización CIIU de la empresa solo determina el nivel de riesgo y el capítulo de estándares; no crea registros en `peligros_iperc`. La interfaz IPER debe combinar las cuatro actividades CIIU para sugerir peligros y dejar que el usuario confirme y complete la evaluación GTC-45 antes de guardar.

**Why:** Un riesgo ARL correcto no garantiza que la matriz tenga peligros específicos visibles. Tratar ambos resultados como el mismo flujo deja la matriz vacía o solo usa la actividad principal.

**How to apply:** Al ampliar CIIU, propagar `ciiuCode`, `ciiuCode2`, `ciiuCode3` y `ciiuCode4` desde la empresa asociada a la matriz, unir sugerencias sin duplicados y prellenar el formulario de peligro sin insertar automáticamente valores de evaluación no confirmados.