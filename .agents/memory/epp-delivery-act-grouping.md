---
name: EPP delivery act grouping
description: Regla de persistencia y edición para actas de entrega con varios elementos.
---

Una acta de entrega EPP puede contener varios elementos, pero cada elemento permanece como una fila individual enlazada por un identificador común de acta. Los registros históricos sin agrupación representan actas individuales.

**Why:** Otros módulos consumen las filas individuales y cada una conserva estado, devoluciones, firma, IPERC y trazabilidad propia. Reemplazar todas las filas durante una edición destruye esa auditoría.

**How to apply:** En ediciones, actualizar en sitio las filas cuyos IDs continúan, insertar solo elementos nuevos y eliminar solo los retirados explícitamente. El listado y los PDF deben operar por acta y mostrar una única zona de firmas.