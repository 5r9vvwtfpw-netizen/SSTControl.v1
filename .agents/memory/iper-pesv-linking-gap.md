---
name: Vinculación IPER-PESV en P04
description: Comportamiento actual de la asociación entre peligros IPER y riesgos viales del paso P04.
---

La asociación formal entre un peligro IPER y un riesgo vial P04 se guarda en la tabla de vinculación y se puede consultar desde ambos extremos. El flujo visual actual de la matriz vial copia los textos del peligro IPER al formulario, pero no conserva su ID; además, el componente visual de vinculación está importado pero no se muestra en las tarjetas de riesgos.

**Why:** Una prueba funcional puede demostrar la relación persistida por API, pero no debe afirmar que la selección directa o el indicador visual están disponibles en la interfaz hasta corregir esas dos brechas.

**How to apply:** Para validar P04, consultar la relación por riesgo vial y por peligro IPER, y distinguir explícitamente entre importación de campos, sincronización PESV→SST y vinculación formal IPER↔PESV.