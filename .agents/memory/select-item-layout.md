---
name: Layout de opciones Select
description: Restricción visual del componente Select compartido al presentar opciones largas.
---

Las opciones de Select deben usar texto plano o elementos inline simples; no deben contener bloques `div` anidados dentro del texto de la opción. Para nombres largos, usar espaciado, ajuste de línea controlado y un ancho suficiente en el menú.

**Why:** El indicador de texto de Radix renderiza el contenido de la opción dentro de un elemento inline; bloques anidados pueden superponerse con el control y las descripciones cercanas.

**How to apply:** Mantener una sola línea semántica por `SelectItem`, limitar el texto visible del trigger cuando sea necesario y mostrar detalles auxiliares fuera del menú o en una zona separada.