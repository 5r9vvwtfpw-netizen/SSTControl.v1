/**
 * Guía de Llamadas Telefónicas — SST Colombia
 * Sigue el mismo patrón de generación de PDFs del proyecto:
 *  - Cursor natural (doc.y + doc.moveDown)
 *  - doc.addPage() explícito entre páginas
 *  - Sin coordenadas absolutas para texto
 *  - Exactamente 2 páginas
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
});

const out = path.join(__dirname, '..', 'guia-llamadas-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(out));

// ── Constantes ────────────────────────────────────────────────────────────
const PW = doc.page.width;   // 595.28
const PH = doc.page.height;  // 841.89
const ML = 28;               // margen lateral

const C = {
  dark:   '#0B2218',
  green:  '#1A4232',
  mid:    '#2D6A4F',
  light:  '#52B788',
  pale:   '#D8F3DC',
  white:  '#FFFFFF',
  bg:     '#F7FAF8',
  txt:    '#17291F',
  sub:    '#3A5A47',
  red:    '#B91C1C',
  rlight: '#FEF2F2',
  amber:  '#92400E',
  alight: '#FFFBEB',
  blue:   '#1A4F8A',
  blight: '#EAF2F8',
  purple: '#4A235A',
  plight: '#F5EEF8',
};

// ── Primitivos gráficos (NO afectan doc.y) ────────────────────────────────
function fillRect(x, y, w, h, color) {
  doc.rect(x, y, w, h).fill(color);
}
function rrect(x, y, w, h, r, color) {
  doc.roundedRect(x, y, w, h, r).fill(color);
}
function strokeRect(x, y, w, h, r, color, lw) {
  doc.roundedRect(x, y, w, h, r).lineWidth(lw || 0.6).strokeColor(color).stroke();
}
function arrowDown(cx, y1, y2, color) {
  doc.moveTo(cx, y1).lineTo(cx, y2 - 5).lineWidth(2).strokeColor(color).stroke();
  doc.moveTo(cx - 5, y2 - 5).lineTo(cx, y2).lineTo(cx + 5, y2 - 5)
     .lineWidth(2).strokeColor(color).stroke();
}

// ── Texto: SIEMPRE usa doc.y para fluir, devuelve nueva Y ─────────────────
function bold(text, x, y, w, color, size) {
  doc.font('Helvetica-Bold').fontSize(size || 9).fillColor(color || C.txt)
     .text(text, x, y, { width: w, lineBreak: false });
  return doc.y;
}
function normal(text, x, y, w, color, size) {
  doc.font('Helvetica').fontSize(size || 8.5).fillColor(color || C.txt)
     .text(text, x, y, { width: w, align: 'left' });
  return doc.y;
}
function italic(text, x, y, w, color, size) {
  doc.font('Helvetica-Oblique').fontSize(size || 8.5).fillColor(color || C.txt)
     .text(text, x, y, { width: w, align: 'left' });
  return doc.y;
}

// ── Footer fijo al fondo de cada página (absoluto, no afecta flujo) ───────
function drawFooter(page) {
  const fy = PH - 22;
  fillRect(0, fy, PW, 22, C.dark);
  bold('SST COLOMBIA\u2122  \u00b7  sst.sagisas.co  \u00b7  Adriana D\u00edaz, CEO  \u00b7  SAGISAS SAS', ML, fy + 7, 300, '#A8D8B9', 7.5);
  bold('P\u00e1g. ' + page + ' / 2  \u2014  Uso interno', PW - 140, fy + 7, 112, C.light, 7.5);
}

// ── Bloque: barra de paso ─────────────────────────────────────────────────
// Devuelve la Y después de la barra
function stepBar(num, label, y, color) {
  rrect(ML, y, PW - ML * 2, 28, 5, color);
  doc.circle(ML + 18, y + 14, 11).fill(C.white);
  bold(String(num), ML + 13.5, y + 8, 10, color, 10);
  bold(label, ML + 34, y + 9, PW - ML * 2 - 42, C.white, 9);
  return y + 28;
}

// ── Bloque: caja de guión (texto en itálica con borde izquierdo) ──────────
// lines: array de strings (cada string = 1 línea visual)
// Devuelve la Y después de la caja
function scriptBox(lines, y, accent) {
  const h = lines.length * 14 + 12;
  const w = PW - ML * 2;
  rrect(ML, y, w, h, 4, C.white);
  fillRect(ML, y, 4, h, accent);
  strokeRect(ML, y, w, h, 4, accent);
  lines.forEach((line, i) => {
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(C.dark)
       .text(line, ML + 10, y + 6 + i * 14, { width: w - 16, lineBreak: false });
  });
  return y + h;
}

// ── Bloque: caja de información (tip) ────────────────────────────────────
function tipBox(titleText, bodyText, y, bg, border) {
  const bodyLines = Math.ceil(bodyText.length / 80) + 1;
  const h = 14 + bodyLines * 12 + 12;
  const w = PW - ML * 2;
  rrect(ML, y, w, h, 4, bg);
  strokeRect(ML, y, w, h, 4, border, 0.6);
  bold(titleText, ML + 10, y + 8, w - 18, border, 8);
  doc.font('Helvetica').fontSize(8).fillColor(C.sub)
     .text(bodyText, ML + 10, y + 20, { width: w - 18, align: 'left' });
  // Resetear cursor al principio del box para que doc.y no desborde
  doc.text('', ML, y, { lineBreak: false });
  return y + h;
}

// ── Bloque: caso en página 2 ──────────────────────────────────────────────
function caseBlock(letter, label, scriptLines, tipTitle, tipBody, y, headerColor, scriptAccent, tipBg) {
  // Header
  rrect(ML, y, PW - ML * 2, 18, 4, headerColor);
  bold(letter + '    ' + label, ML + 10, y + 4.5, PW - ML * 2 - 18, C.white, 9);
  y += 18;

  // Guión
  y = scriptBox(scriptLines, y, scriptAccent) + 5;

  // Tip
  y = tipBox(tipTitle, tipBody, y, tipBg, scriptAccent) + 10;

  return y;
}

// ════════════════════════════════════════════════════════════════════════════
//  PÁGINA 1
// ════════════════════════════════════════════════════════════════════════════
fillRect(0, 0, PW, PH, C.bg);

// Header
fillRect(0, 0, PW, 68, C.dark);
fillRect(0, 68, PW, 3, C.light);

bold('GU\u00cdA DE LLAMADAS TELEF\u00d3NICAS  \u00b7  SST COLOMBIA\u2122', ML, 13, PW - ML * 2, C.white, 17);
bold('Objetivo: que el gerente acepte el PDF o agende una demostraci\u00f3n de 10 minutos', ML, 36, PW - ML * 2, '#A8D8B9', 9);
bold('Siga los pasos en orden  \u00b7  Lea en voz alta antes de llamar', ML, 51, PW - ML * 2, C.light, 8);

// Badges top-right
['Res. 0312/2019', 'PESV \u00b7 Res. 40595', 'ISO 45001'].forEach((lb, i) => {
  const pw = doc.font('Helvetica-Bold').fontSize(7).widthOfString(lb) + 12;
  const bx = PW - ML - (i === 0 ? pw : (doc.font('Helvetica-Bold').fontSize(7).widthOfString(['Res. 0312/2019','PESV \u00b7 Res. 40595','ISO 45001'].slice(0,i+1).join('')) + (i+1)*16));
  rrect(PW - ML - [0,1,2].slice(0,i+1).reduce((a,j) => a + doc.font('Helvetica-Bold').fontSize(7).widthOfString(['Res. 0312/2019','PESV \u00b7 Res. 40595','ISO 45001'][j]) + 16, 0), 18, pw, 13, 5, C.mid);
  bold(lb, PW - ML - [0,1,2].slice(0,i+1).reduce((a,j) => a + doc.font('Helvetica-Bold').fontSize(7).widthOfString(['Res. 0312/2019','PESV \u00b7 Res. 40595','ISO 45001'][j]) + 16, 0) + 6, 21.5, pw - 10, C.white, 7);
});

// Pre-call strip
let y = 79;
rrect(ML, y, PW - ML * 2, 20, 4, '#EAF7EE');
bold('Antes de llamar tenga listo:', ML + 10, y + 6, 175, C.green, 8.5);
bold('nombre del gerente  \u00b7  nombre empresa  \u00b7  sector', ML + 190, y + 6, PW - ML * 2 - 198, C.mid, 8.5);
y += 26;

// PASO 1
y = stepBar(1, 'LLAME Y PIDA HABLAR CON EL GERENTE', y, C.green) + 8;
bold('Diga exactamente esto a quien conteste el tel\u00e9fono:', ML, y, PW - ML * 2, C.mid, 8);
y += 12;
y = scriptBox([
  '\u201cBuenos d\u00edas, mi nombre es [su nombre] de parte de Adriana D\u00edaz, CEO de SST Colombia.',
  '\u00bfPor favor me comunica con el se\u00f1or / se\u00f1ora [nombre del gerente]?\u201d',
], y, C.green) + 8;
y = tipBox(
  'Si le preguntan \u201c\u00bfPara qu\u00e9 es?\u201d:',
  '\u201cEs para confirmarle un asunto t\u00e9cnico sobre los informes que debe tener listos para el Ministerio del Trabajo. Es muy breve.\u201d',
  y, '#EAF7EE', C.green
) + 8;

// Decisión 1
arrowDown(PW / 2, y, y + 18, C.light);
y += 18;
rrect(PW / 2 - 90, y, 180, 20, 10, C.mid);
bold('\u00bfLo comunican con el gerente?', PW / 2 - 82, y + 5.5, 164, C.white, 9);
y += 20 + 6;

// Flechas y badges
const hw = (PW - ML * 2 - 8) / 2;
arrowDown(ML + hw / 2, y, y + 12, C.red);
arrowDown(ML + hw + 8 + hw / 2, y, y + 12, C.green);
rrect(ML + hw / 2 - 22, y + 12, 44, 16, 8, C.red);
bold('NO', ML + hw / 2 - 8, y + 15.5, 16, C.white, 8);
rrect(ML + hw + 8 + hw / 2 - 22, y + 12, 44, 16, 8, C.green);
bold('S\u00cd', ML + hw + 8 + hw / 2 - 8, y + 15.5, 16, C.white, 8);
y += 30;

// Dos bloques lado a lado — dibujo a Y fija para ambos
const blockH = 108;
const blockY = y;

// Bloque NO
rrect(ML, blockY, hw, blockH, 5, C.white);
fillRect(ML, blockY, 5, blockH, C.red);
strokeRect(ML, blockY, hw, blockH, 5, '#F87171');
bold('No est\u00e1 disponible \u2014 diga esto:', ML + 10, blockY + 8, hw - 16, C.red, 8.5);
doc.font('Helvetica-Oblique').fontSize(8.2).fillColor(C.txt)
   .text(
     '\u201cNo hay problema. \u00bfMe da su correo directo para enviarle un resumen de 1 p\u00e1gina? O \u00bfa qu\u00e9 hora le recomiendan llamar para encontrarlo?\u201d',
     ML + 10, blockY + 22, { width: hw - 18, align: 'left' }
   );
bold('\u2192 Anote el correo o la hora de rellamada y env\u00ede el PDF hoy.', ML + 10, blockY + 78, hw - 16, C.red, 7.5);

// Bloque SÍ
const bx2 = ML + hw + 8;
rrect(bx2, blockY, hw, blockH, 5, '#EAF7EE');
fillRect(bx2, blockY, 5, blockH, C.green);
strokeRect(bx2, blockY, hw, blockH, 5, C.pale);
bold('\u00a1Lo pasaron! \u2014 respire y contin\u00fae con calma', bx2 + 10, blockY + 8, hw - 16, C.green, 8.5);
const tips = [
  'Escuche m\u00e1s de lo que habla.',
  'Use el nombre del gerente en cada frase.',
  'No enumere funciones: cuente c\u00f3mo resuelven su problema.',
  'Solo busca que acepte el PDF o los 10 minutos.',
];
tips.forEach((t, i) => {
  doc.circle(bx2 + 15, blockY + 28 + i * 18 + 4, 3).fill(C.light);
  bold(t, bx2 + 23, blockY + 28 + i * 18, hw - 30, C.txt, 7.5);
});

y = blockY + blockH + 10;

// PASO 2
arrowDown(PW / 2, y, y + 14, C.light);
y += 14;
y = stepBar(2, 'HABLE CON EL GERENTE \u2014 APERTURA (m\u00e1x. 30 segundos)', y, C.mid) + 8;

bold('Diga esto en voz calmada. Haga una pausa larga despu\u00e9s de la \u00faltima pregunta:', ML, y, PW - ML * 2, C.mid, 8);
y += 12;
y = scriptBox([
  '\u201cSe\u00f1or/Se\u00f1ora [nombre], buenos d\u00edas. Le habla [su nombre] de parte de Adriana D\u00edaz.',
  'Ayudamos a empresas del sector a tener listos \u2014 con firma digital \u2014 los informes del',
  'Ministerio del Trabajo y la Superintendencia de Transporte. Sin papeles, sin estr\u00e9s.',
  'Le enviamos un mensaje hace unos d\u00edas. \u00bfPudo verlo?\u201d',
], y, C.mid) + 8;

// Tip de pausa
rrect(ML, y, PW - ML * 2, 22, 4, '#FFFBEB');
strokeRect(ML, y, PW - ML * 2, 22, 4, '#F59E0B', 0.8);
bold('\u23f8  Haga una pausa y espere. No llene el silencio. El gerente responder\u00e1.  \u2192  Pase a la P\u00e1gina 2.', ML + 12, y + 7, PW - ML * 2 - 22, C.amber, 8.5);

drawFooter('1');

// ════════════════════════════════════════════════════════════════════════════
//  PÁGINA 2
// ════════════════════════════════════════════════════════════════════════════
doc.addPage();
fillRect(0, 0, PW, PH, C.bg);

// Slim header
fillRect(0, 0, PW, 42, C.dark);
fillRect(0, 42, PW, 3, C.light);
bold('GU\u00cdA DE LLAMADAS  \u00b7  P\u00c1GINA 2  \u00b7  SST COLOMBIA\u2122', ML, 9, PW - ML * 2, C.white, 11);
bold('Qu\u00e9 hacer seg\u00fan la respuesta del gerente', ML, 26, PW - ML * 2, '#A8D8B9', 9);

y = 55;
y = stepBar(3, 'RESPONDA SEG\u00daN LO QUE DIGA EL GERENTE', y, C.green) + 10;

// CASO A
y = caseBlock(
  'A', '"S\u00ed lo vi" / "Me suena"',
  [
    '\u201c\u00a1Excelente! Lo llamamos justo para eso. \u00bfLe env\u00edo ahora el folleto de 1 p\u00e1gina?',
    'Se lo mando a su correo para que lo vea con calma.\u201d',
  ],
  'Si acepta el PDF \u2192',
  '\u201c\u00bfMe confirma su celular para avisarle por WhatsApp en cuanto lo env\u00ede?\u201d  Enviar PDF hoy.',
  y, C.green, C.green, '#EAF7EE'
);

// CASO B
y = caseBlock(
  'B', '"No lo vi" / "No me lleg\u00f3"',
  [
    '\u201cNo se preocupe, es normal. En 15 segundos: ayudamos a empresas como la suya a',
    'generar solos los informes del Ministerio del Trabajo y la Supertransporte.',
    '\u00bfMe confirma su correo para enviarle el resumen de 1 p\u00e1gina?\u201d',
  ],
  'Cuando le den el correo:',
  'Rep\u00edtalo letra por letra para confirmar. Enviar PDF de inmediato.',
  y, C.blue, C.blue, C.blight
);

// CASO C
y = caseBlock(
  'C', '"Estoy ocupado/a" / "Ll\u00e1meme luego"',
  [
    '\u201cClaro, le entiendo. No le quito ni un segundo m\u00e1s. \u00bfMe permite enviarle el resumen',
    'de 1 p\u00e1gina a su correo? Y \u00bfa qu\u00e9 hora le queda mejor que le marque esta semana?\u201d',
  ],
  'Anote el d\u00eda y la hora exacta:',
  'Marcar puntual en esa fecha genera confianza desde el primer contacto.',
  y, C.amber, C.amber, C.alight
);

// CASO D
y = caseBlock(
  'D', '"No me interesa" / "Ya tenemos ARL / asesor"',
  [
    '\u201cLe entiendo. Nosotros no reemplazamos a su ARL: hacemos algo diferente \u2014 generamos',
    'autom\u00e1ticamente los informes del Ministerio del Trabajo y la Supertransporte,',
    'con firma digital. \u00bfLe permito enviarle el documento de 1 p\u00e1gina?\u201d',
  ],
  'Si insiste en no:',
  '\u201cMuchas gracias por su tiempo \u2014 que tenga un excelente d\u00eda.\u201d  Cerrar siempre con amabilidad.',
  y, C.purple, C.purple, C.plight
);

// PASO 4
arrowDown(PW / 2, y, y + 12, C.light);
y += 12;
y = stepBar(4, 'DESPU\u00c9S DE CADA LLAMADA \u2014 3 acciones inmediatas', y, C.mid) + 10;

const acts = [
  ['1', 'Enviar el PDF', 'Si lo solicitaron: hacerlo en los pr\u00f3ximos 5 minutos, no al final del d\u00eda.'],
  ['2', 'Anotar el resultado', 'Empresa \u00b7 Nombre gerente \u00b7 Correo \u00b7 Resultado (PDF enviado / rellamada / no interesado).'],
  ['3', 'Agendar rellamada', 'Si qued\u00f3 en volver a llamar: ag\u00e9ndelo AHORA con nombre y tel\u00e9fono.'],
];

const sw = (PW - ML * 2 - 8) / 3;
const cardH = 72;

acts.forEach(([n, title, body], i) => {
  const sx = ML + i * (sw + 4);
  rrect(sx, y, sw, cardH, 5, C.white);
  fillRect(sx, y, 5, cardH, C.light);
  strokeRect(sx, y, sw, cardH, 5, C.pale);
  doc.circle(sx + 20, y + 18, 10).fill(C.green);
  bold(n, sx + 15.5, y + 12, 10, C.white, 10);
  bold(title, sx + 10, y + 32, sw - 16, C.green, 8.5);
  doc.font('Helvetica').fontSize(7.8).fillColor(C.sub)
     .text(body, sx + 10, y + 46, { width: sw - 16, lineBreak: true });
  // Resetear cursor para que no afecte el flujo
  doc.text('', ML, y, { lineBreak: false });
});

drawFooter('2');

doc.end();
console.log('PDF generado:', out);
