---
name: PDF Standardizer API
description: Firmas correctas de las funciones helper de pdf-standardizer.ts — errores aquí causan stream cortado a mitad de descarga.
---

# PDF Standardizer — Referencia de API

Archivo: `server/services/pdf-standardizer.ts`

## Constantes

### PDF_COLORS
Solo existen estas 6 claves. Usar cualquier otra devuelve `undefined` y rompe PDFKit mid-stream:
```
PDF_COLORS.GREEN_PRIMARY  '#1e7e34'
PDF_COLORS.GREEN_DARK     '#155724'
PDF_COLORS.WHITE          '#FFFFFF'
PDF_COLORS.BLACK          '#000000'
PDF_COLORS.GRAY_LIGHT     '#f8f9fa'
PDF_COLORS.GRAY_BORDER    '#dee2e6'
```
NO existen: `secondary`, `muted`, `primary`, `accent`.

### PDF_CONFIG
Siempre en MAYÚSCULAS:
```
PDF_CONFIG.MARGIN          35
PDF_CONFIG.HEADER_HEIGHT   100
PDF_CONFIG.FOOTER_HEIGHT   80
PDF_CONFIG.CONTENT_START_Y 120
PDF_CONFIG.PAGE_SIZE       'LETTER'
```
NO existe `PDF_CONFIG.margin` (minúscula).

## Firmas de funciones

### checkPageBreak
```typescript
checkPageBreak(doc, neededHeight: number, currentY?: number): number
```
- 2do arg = **altura requerida** (px que necesita el siguiente bloque)
- 3er arg = **posición Y actual**
- CORRECTO: `y = checkPageBreak(doc, 80, y)`
- INCORRECTO: `y = checkPageBreak(doc, y, 80)` ← args invertidos

### addSectionBar
```typescript
addSectionBar(doc, title: string, y?: number): number
```
- 3er arg es **número** directo, NO un objeto
- CORRECTO: `y = addSectionBar(doc, 'Titulo', y)`
- INCORRECTO: `y = addSectionBar(doc, 'Titulo', { y })` ← pasa objeto, PDFKit recibe `undefined` como número

### addParagraph
```typescript
addParagraph(doc, text: string, options?: { fontSize?, bold?, indent?, y? }): number
```
- NO soporta opción `color` — ignorarla no basta, puede causar comportamiento inesperado
- CORRECTO: `y = addParagraph(doc, texto, { y })`
- INCORRECTO: `y = addParagraph(doc, texto, { y, color: PDF_COLORS.muted })`

### addLabeledField
```typescript
addLabeledField(doc, label: string, value: string, options?: { y?, labelWidth? }): number
```
- NO soporta `inline`. Pasar `{ y, inline: true }` no causa error de runtime pero la opción se ignora.
- CORRECTO: `y = addLabeledField(doc, 'Placa', vehicle.plate, { y })`

### addSimpleTable
```typescript
addSimpleTable(doc, headers: string[], rows: string[][], options?: { y?, columnWidths?, headerBgColor?, headerTextColor? }): number
```

### addStandardHeader
```typescript
addStandardHeader({ doc, company, documentTitle, documentCode, logoBuffer }): Promise<number>
```
- Retorna `y` inicial del contenido (después del encabezado)

### addSignatureFooter
```typescript
addSignatureFooter(
  doc,
  signers: PdfSigners,
  includeLSO?: boolean,
  opts?: { startY?: number }
): Promise<void>
```
- Llamar al final, antes de `doc.end()`
- Para informes con coordenadas manuales, reservar antes la altura completa de la sección final y pasar `startY`; no depender de `doc.y` si el contenido usa posiciones explícitas.

## Patrón correcto para una ruta PDF

```typescript
const doc = new PDFDocument({ margin: 35, size: 'LETTER' });
setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'inline; filename="nombre.pdf"');
doc.pipe(res);

let y = await addStandardHeader({ doc, company, documentTitle: '...', documentCode: '...', logoBuffer });
y = addParagraph(doc, 'Texto introductorio...', { y });
y = checkPageBreak(doc, 80, y);           // ¿cabe un bloque de 80px?
y = addSectionBar(doc, 'Sección', y);     // y es número, no objeto
y = addLabeledField(doc, 'Campo', valor, { y });
y = addSimpleTable(doc, headers, rows, { y });

await addSignatureFooter(doc, signers, true);
doc.end();
```

**Why:** Pasar `{ y }` (objeto) donde se espera número hace que PDFKit use `undefined` como coordenada y lanza excepción interna. El stream se corta a mitad de descarga, dejando un PDF corrupto (se ve en el historial del navegador como "Reanudando..." sin completar).

## Regla para la biblioteca de informes

Los PDF expuestos en la biblioteca de informes no deben limitarse a usar el encabezado y la firma estándar: todo el cuerpo variable debe construirse con `addSectionBar`, `addSimpleTable`, `addParagraph`, `addLabeledField` y `checkPageBreak`, propagando siempre el valor `y` retornado.

Los documentos generados por el sistema deben seguir la estandarización institucional. Los PDF originales aportados como evidencia deben conservarse sin alteraciones para no modificar el contenido ni invalidar firmas; se abren como el archivo original, no como una versión reconstruida.

**Why:** El usuario indicó que todos los PDF del sistema deben respetar la estandarización; los soportes fuente firmados también deben mantener su autenticidad.

**How to apply:** Aplicar el estándar común a todo PDF que el sistema componga. Para evidencia PDF cargada por la empresa, preservar el archivo original byte por byte y aclarar que no se modifica.

**Why:** Los bloques manuales con `doc.rect`, alturas fijas y coordenadas incrementadas a mano llegaron a producir texto superpuesto aunque la descarga respondiera HTTP 200 y el archivo tuviera una firma PDF válida.

**How to apply:** Al crear o modificar un informe, validar tanto la integridad del archivo (`%PDF-` y `%%EOF`) como su renderizado visual con datos largos, múltiples filas, saltos de página y la tabla de firmas.

## Flujo vertical en actas guiadas

Cada bloque que devuelve una posición nueva debe reasignarse antes de dibujar la siguiente sección:
`y = addParagraph(...)`, `y = addSectionBar(...)`, `y = addSimpleTable(...)` y `y = addLabeledField(...)`.

**Why:** En actas de comité, omitir la reasignación después del texto narrativo dejó las tablas de participantes, agenda y compromisos dibujadas sobre el mismo contenido aunque la descarga del PDF fuera válida.

**How to apply:** Al agregar una sección a un acta, mantener una sola variable `y`, propagarla entre todos los helpers y renderizar al menos una muestra con salto de página antes de cerrar el cambio.

En actas de comité, la constancia fija de firma física debe formar parte del bloque inferior de firmas, no ser una sección independiente inmediatamente antes del footer.

**Why:** La reserva genérica de espacio para footers puede enviar una constancia de pocas líneas a una página adicional, dejando una tercera página casi vacía.

**How to apply:** Mantener el aviso y las líneas de firma como un bloque compacto; si se cambia su altura, validar actas con agenda extensa y compromisos.

## Bloques finales y páginas casi vacías

El checklist, la declaración legal y las firmas deben tratarse como un solo bloque al calcular el salto de página. Después del salto, las firmas deben colocarse con `opts.startY` dentro del flujo del contenido.

**Why:** Reservar espacio solo para el checklist permitió que PDFKit enviara cada línea legal y el pie a páginas automáticas distintas, generando una hoja vacía o casi vacía aunque el PDF fuera válido.

**How to apply:** Calcular la altura total del bloque terminal, saltar antes de dibujarlo y verificar con `pdfinfo` más extracción de texto por página; ninguna página debe contener únicamente una línea o el pie.
