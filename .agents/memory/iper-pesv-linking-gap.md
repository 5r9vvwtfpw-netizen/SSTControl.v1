---
name: Vinculación IPER-PESV en P04
description: Comportamiento actual de la asociación entre peligros IPER y riesgos viales del paso P04.
---

La asociación formal entre un peligro IPER y un riesgo vial P04 se guarda en la tabla de vinculación y se puede consultar desde ambos extremos. El alta desde el selector IPER envía el ID del peligro junto con los datos del riesgo vial; el backend valida que pertenezca a la empresa activa y crea el riesgo y la vinculación en una transacción. Las tarjetas de la matriz vial muestran el banner SST-PESV.

**Why:** La selección visual y la persistencia deben representar la misma relación formal; crear solo un riesgo vial con textos copiados deja la trazabilidad IPER-PESV incompleta.

**How to apply:** Para validar P04, usar el selector IPER, comprobar la relación por riesgo vial y por peligro IPER, y distinguir la vinculación formal IPER↔PESV de la sincronización PESV→SST.