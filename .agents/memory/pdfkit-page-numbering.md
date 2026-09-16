---
name: PDFKit page numbering
description: Paginación en PDFKit con bufferPages y saltos automáticos
---

Cuando un documento PDFKit usa `bufferPages`, escribir números de página cerca del borde inferior puede activar el salto automático aunque se haya usado una coordenada explícita y `lineBreak: false`. Esto puede crear una página nueva por cada número y dejar hojas que solo contienen el watermark o la paginación.

**Why:** La posición inferior queda dentro de la zona de desbordamiento calculada por PDFKit; el archivo puede conservar una firma PDF válida y responder 200, pero su conteo real de páginas no coincide con la numeración.

**How to apply:** Escribir la paginación en una franja segura del encabezado (por ejemplo, encima del encabezado corporativo), después de conocer `bufferedPageRange()`, y validar siempre `pdfinfo`, `%%EOF` y los marcadores de página del PDF generado.