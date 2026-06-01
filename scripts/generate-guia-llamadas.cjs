const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const outPath = path.join(__dirname, '..', 'guia-llamadas-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(outPath));

const W = 595.28;
const H = 841.89;

// ── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  dark:    '#0D2B1F',
  green:   '#1B4332',
  mid:     '#2D6A4F',
  accent:  '#40916C',
  light:   '#D8F3DC',
  white:   '#FFFFFF',
  gray:    '#F4F4F4',
  txt:     '#1a1a1a',
  sub:     '#444444',
  red:     '#B91C1C',
  amber:   '#B45309',
  blue:    '#1D4ED8',
  purple:  '#6D28D9',
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function band(y, h, color) {
  doc.rect(0, y, W, h).fill(color);
}

function boxed(x, y, w, h, fill, stroke) {
  doc.rect(x, y, w, h).fill(fill);
  if (stroke) { doc.rect(x, y, w, h).stroke(stroke); }
}

function txt(text, x, y, opts, color, font, size) {
  doc.font(font || 'Helvetica').fontSize(size || 8)
     .fillColor(color || C.txt)
     .text(text, x, y, opts || {});
}

function bold(text, x, y, opts, color, size) {
  txt(text, x, y, opts, color, 'Helvetica-Bold', size || 8);
}

function step(num, label, x, y, w, color) {
  doc.rect(x, y, w, 15).fill(color);
  doc.circle(x + 10, y + 7.5, 6.5).fill(C.white);
  bold(num, x + 7, y + 3, { lineBreak: false }, color, 7.5);
  bold(label.toUpperCase(), x + 20, y + 4, { width: w - 22, lineBreak: false }, C.white, 7.5);
  return y + 15;
}

// Arrow between steps
function arrow(x, y) {
  doc.moveTo(x, y).lineTo(x, y + 8)
     .moveTo(x - 4, y + 5).lineTo(x, y + 9).lineTo(x + 4, y + 5)
     .lineWidth(1.2).strokeColor(C.accent).stroke();
}

// Decision diamond
function diamond(cx, cy, hw, hh, fill, label, labelColor) {
  doc.moveTo(cx, cy - hh)
     .lineTo(cx + hw, cy)
     .lineTo(cx, cy + hh)
     .lineTo(cx - hw, cy)
     .closePath()
     .fill(fill);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(labelColor || C.white)
     .text(label, cx - hw + 6, cy - 4.5, { width: hw * 2 - 12, align: 'center', lineBreak: false });
}

// Script bubble
function script(text, x, y, w, accent) {
  const bx = x + 4;
  doc.rect(x, y, 3, 0).fill(accent);  // left border trick — use polygon
  doc.moveTo(x, y).lineTo(x + 3, y).lineTo(x + 3, y + 28).lineTo(x, y + 28).fill(accent);
  doc.rect(x + 3, y, w - 3, 28).fill('#F8FFF9');
  doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#0D3320')
     .text('"' + text + '"', x + 8, y + 4, { width: w - 14, lineBreak: true });
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 1
// ══════════════════════════════════════════════════════════════════════════════

// HEADER
band(0, 60, C.dark);
band(60, 4, C.accent);

bold('GUÍA DE LLAMADAS TELEFÓNICAS', 22, 10, {}, C.white, 16);
txt('SST COLOMBIA™  ·  Árbol de decisiones para gestión comercial', 22, 31, {}, '#A8D8B9', 'Helvetica', 8.5);
txt('Objetivo: Agendar demo de 10 min o enviar el folleto PDF técnico', 22, 44, {}, '#6BCB8B', 'Helvetica', 7.5);

// PRE-CALL REMINDER BOX
band(64, 26, C.light);
bold('Antes de marcar — tenga listo: ', 12, 69, { continued: true }, C.green, 7);
txt('nombre del gerente  ·  correo confirmado  ·  nombre de la empresa  ·  sector (transporte / industria)', 12, 69,
  { lineBreak: false }, C.mid, 'Helvetica', 7);

// ── PASO 1: EL FILTRO ─────────────────────────────────────────────────────────
let y = 92;
y = step('1', 'El filtro — Secretaria / Recepcionista', 12, y, W - 24, C.green);
y += 4;

txt('Guión de apertura:', 12, y, {}, C.sub, 'Helvetica-Bold', 7);
y += 10;
script(
  '«Buenos días, mi nombre es [Nombre] de parte de Adriana Díaz, CEO de SST Colombia. ' +
  '¿Me comunica con el señor/señora [Nombre del Gerente], por favor?»',
  12, y, W - 24, C.accent
);
y += 32;

txt('Si preguntan "¿Para qué es?":', 12, y, {}, C.sub, 'Helvetica-Bold', 7);
y += 10;
script(
  '«Es para confirmarle un asunto técnico sobre la automatización de informes para el Ministerio de Trabajo ' +
  'y la Superintendencia de Transporte. Es breve.»',
  12, y, W - 24, C.accent
);
y += 34;

// DECISION 1
const d1cx = W / 2;
diamond(d1cx, y + 12, 90, 14, C.mid, '¿Lo pasan?', C.white);
y += 28;

// YES → PASO 2
doc.moveTo(d1cx + 90, y - 16).lineTo(d1cx + 90 + 30, y - 16).lineTo(d1cx + 90 + 30, y + 80)
   .lineWidth(1).strokeColor(C.accent).dash(3, { space: 2 }).stroke();
doc.undash();

// NO → Nivel 1
const noX = 12;
doc.moveTo(d1cx - 90, y - 16).lineTo(noX + 100, y - 16)
   .lineWidth(1).strokeColor(C.red).stroke();

// NO label
bold('NO está / no puede pasar', noX, y - 24, {}, C.red, 6.5);
boxed(noX, y - 14, 180, 42, '#FFF1F1', C.red);
bold('NIVEL 1 — Dejar mensaje y capturar datos', noX + 5, y - 10, {}, C.red, 6.5);
txt('«Perfecto. ¿Me podría dar su correo directo o extensión? Es para reenviarle ' +
    'el resumen técnico de 1 página sobre los informes para el Ministerio y la Supertransporte.»', noX + 5, y - 0,
    { width: 170 }, C.txt, 'Helvetica', 6.5);

// SÍ label
const siX = d1cx - 30;
bold('SÍ → PASO 2', siX, y - 22, {}, C.green, 7);
arrow(d1cx, y - 2);

y += 6;

// ── PASO 2: TOMADOR DE DECISIÓN ────────────────────────────────────────────────
y = step('2', 'El tomador de decisión — Gerente / Representante Legal', 12, y, W - 24, C.mid);
y += 4;

txt('Guión de apertura:', 12, y, {}, C.sub, 'Helvetica-Bold', 7);
y += 10;
script(
  '«Señor/Señora [Nombre], buenos días. Le habla [Asistente] de parte de Adriana Díaz. Muy breve: ' +
  'le escribimos hace unos días sobre cómo estamos ayudando a empresas de su sector a tener ' +
  'listos automáticamente los informes del Ministerio de Trabajo y la Supertransporte, ' +
  'sin papeles y con firma digital. ¿Pudo ver el mensaje?»',
  12, y, W - 24, C.mid
);
y += 40;

// DECISION 2
diamond(d1cx, y + 12, 110, 14, C.green, '¿Cuál es la respuesta?', C.white);
y += 30;

// 4 branches
const bw = 124;
const gap = 10;
const bxs = [12, 12 + bw + gap, 12 + (bw + gap) * 2, 12 + (bw + gap) * 3];
const bcolors = [C.green, C.blue, C.amber, C.purple];
const blabels = ['A  "Sí lo vi"', 'B  "No lo vi"', 'C  "Estoy ocupado"', 'D  "No me interesa"'];

bxs.forEach((bx, i) => {
  boxed(bx, y, bw, 11, bcolors[i]);
  bold(blabels[i], bx + 4, y + 2, { lineBreak: false }, C.white, 6.5);
});
y += 11;

// Content per branch
const bh = 128;
bxs.forEach((bx, i) => {
  doc.rect(bx, y, bw, bh).fill(i % 2 === 0 ? C.gray : '#F0F4FF');
});

// Branch A
let ay = y + 5;
const ax = bxs[0];
bold('«¡Excelente! Lo llamamos para ofrecerle', ax + 4, ay, { width: bw - 8 }, bcolors[0], 6.5);
ay += 18;
txt('enviarle el folleto de 1 página donde ve visualmente cómo conductores y trabajadores ' +
    'registran todo desde el celular y el sistema genera solo los informes para el Ministerio y la Supertransporte.»',
    ax + 4, ay, { width: bw - 8 }, C.txt, 'Helvetica-Oblique', 6.5);
ay += 44;
bold('→ Si acepta el PDF:', ax + 4, ay, { width: bw - 8 }, bcolors[0], 6.5);
ay += 10;
txt('«¿Me confirma el celular para avisarle por WhatsApp en cuanto lo envíe?»', ax + 4, ay, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);
ay += 16;
bold('→ Si muestra interés:', ax + 4, ay, { width: bw - 8 }, bcolors[0], 6.5);
ay += 10;
txt('«¿Le queda bien una sesión virtual de 10 min el martes a las 9 am o el miércoles en la tarde?»', ax + 4, ay, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);

// Branch B
let by2 = y + 5;
const bx2 = bxs[1];
bold('«No se preocupe. En 20 segundos le cuento:', bx2 + 4, by2, { width: bw - 8 }, bcolors[1], 6.5);
by2 += 18;
txt('Ayudamos a empresas como la suya a que el control de inspecciones, ' +
    'comités y entrega de dotaciones deje de ser papeles y genere automáticamente ' +
    'los informes para el Ministerio del Trabajo y la Supertransporte.»',
    bx2 + 4, by2, { width: bw - 8 }, C.txt, 'Helvetica-Oblique', 6.5);
by2 += 46;
bold('→ Solicitar correo:', bx2 + 4, by2, { width: bw - 8 }, bcolors[1], 6.5);
by2 += 10;
txt('«¿Me confirma su correo directo para enviarle el resumen de 1 página?»', bx2 + 4, by2, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);
by2 += 16;
bold('→ Valide bien el correo', bx2 + 4, by2, { width: bw - 8 }, bcolors[1], 6.5);
by2 += 10;
txt('y prometa el envío inmediato. Registrar en base de datos.', bx2 + 4, by2, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);

// Branch C
let cy2 = y + 5;
const cx2 = bxs[2];
bold('«Le entiendo perfectamente.', cx2 + 4, cy2, { width: bw - 8 }, bcolors[2], 6.5);
cy2 += 14;
txt('Le reenvío ahora mismo el resumen técnico de 1 página. No le quita ni un minuto revisarlo cuando tenga calma.»',
    cx2 + 4, cy2, { width: bw - 8 }, C.txt, 'Helvetica-Oblique', 6.5);
cy2 += 34;
bold('→ Acordar momento exacto:', cx2 + 4, cy2, { width: bw - 8 }, bcolors[2], 6.5);
cy2 += 10;
txt('«¿Le marco el [día] a las [hora] para encontrarle directo?»', cx2 + 4, cy2, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);
cy2 += 16;
bold('Registrar: fecha/hora y nombre de quien confirma.', cx2 + 4, cy2, { width: bw - 8 }, bcolors[2], 6.5);

// Branch D
let dy2 = y + 5;
const dx = bxs[3];
bold('«Le comprendo, y qué bueno que ya tienen eso cubierto.', dx + 4, dy2, { width: bw - 8 }, bcolors[3], 6.5);
dy2 += 18;
txt('Lo valioso es que no competimos con su ARL ni su asesor: automatizamos lo que ellos no hacen — ' +
    'las firmas digitales, los comités en app y los informes listos para el Ministerio y la Supertransporte.»',
    dx + 4, dy2, { width: bw - 8 }, C.txt, 'Helvetica-Oblique', 6.5);
dy2 += 48;
bold('→ Si acepta ver el PDF:', dx + 4, dy2, { width: bw - 8 }, bcolors[3], 6.5);
dy2 += 10;
txt('Enviar de inmediato. Anotar correo.', dx + 4, dy2, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);
dy2 += 12;
bold('→ Si insiste en no:', dx + 4, dy2, { width: bw - 8 }, bcolors[3], 6.5);
dy2 += 10;
txt('«Muchas gracias por su tiempo, que tenga un excelente día.»', dx + 4, dy2, { width: bw - 8 }, C.txt, 'Helvetica', 6.5);

y += bh + 10;

// ── REGISTRO ──────────────────────────────────────────────────────────────────
band(y, 12, C.green);
bold('REGISTRO OBLIGATORIO POR CADA LLAMADA', 14, y + 2.5, {}, C.white, 7);
y += 12;

band(y, 28, C.light);
const fields = ['Empresa:', 'Nombre del gerente:', 'Cargo:', 'Correo confirmado:', 'Celular/WhatsApp:', 'Resultado:', 'Próxima acción:'];
let fx = 14;
fields.forEach((f, i) => {
  if (i === 4) { fx = 14; y += 14; }
  bold(f, fx, y + 2, { lineBreak: false }, C.green, 6.5);
  doc.moveTo(fx + doc.widthOfString(f, { fontSize: 6.5 }) + 2, y + 11)
     .lineTo(fx + 70, y + 11).lineWidth(0.5).strokeColor('#AAAAAA').stroke();
  fx += 78;
});
y += 14;

// ── ARGUMENTOS CLAVE ──────────────────────────────────────────────────────────
y += 4;
band(y, 12, C.dark);
bold('ARGUMENTOS CLAVE SI PREGUNTA MÁS', 14, y + 2.5, {}, C.white, 7);
y += 14;

const args = [
  ['Ministerio del Trabajo', 'Generamos el informe Res. 0312/2019 con "Hilo Dorado": cada hallazgo trazable a su acción y su evidencia. FURAT automático listo para radicar.'],
  ['Supertransporte / PESV', 'Evaluación de 24 pasos (Res. 40595/2022), informes de siniestralidad, reporte de conductores con licencias y comparendos, actas de comité firmadas.'],
  ['Portal móvil del trabajador', 'El operario firma, hace inspecciones pre-operacionales y responde encuestas diarias de aptitud desde el celular. Cero papel, 100% trazable.'],
  ['Firma digital del LSO',       'Documentos firmados con número de licencia del profesional SST: validez legal plena ante cualquier visita de inspección.'],
];

args.forEach(([label, body], i) => {
  const ax2 = i < 2 ? 12 : W / 2 + 4;
  const aY  = i < 2 ? y + (i * 22) : y + ((i - 2) * 22);
  doc.rect(ax2, aY, 4, 18).fill(C.accent);
  bold(label, ax2 + 8, aY + 1, { lineBreak: false }, C.green, 7);
  txt(body, ax2 + 8, aY + 10, { width: W / 2 - 24 }, C.sub, 'Helvetica', 6.5);
});

y += 46;

// ── FOOTER ─────────────────────────────────────────────────────────────────────
band(H - 26, 26, C.dark);
bold('SST COLOMBIA™  ·  sst.sagisas.co  ·  Adriana Díaz, CEO  ·  SAGISAS SAS', 14, H - 19, {}, '#A8D8B9', 7);
txt('Uso interno — Equipo Comercial', W - 120, H - 19, {}, '#6BCB8B', 'Helvetica', 6.5);

doc.end();
console.log('PDF generado en:', outPath);
