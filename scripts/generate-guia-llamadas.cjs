const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
const out = path.join(__dirname, '..', 'guia-llamadas-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(out));

const W  = 595.28;
const H  = 841.89;
const ML = 22;          // margin left
const MR = 22;          // margin right
const CW = W - ML - MR; // content width

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  dark:   '#0B2218', green:  '#1A4232', mid:    '#2D6A4F',
  light:  '#52B788', pale:   '#D8F3DC', white:  '#FFFFFF',
  bg:     '#F7FAFA', line:   '#B7E4C7', txt:    '#17291F',
  sub:    '#3A5A47', muted:  '#6B8F77',
  red:    '#C0392B', blue:   '#1A4F8A', amber:  '#7D4A00', purple: '#4A235A',
  rlight: '#FDECEA', blight: '#EAF2F8', alight: '#FEF5E7', plight: '#F5EEF8',
};

// ── Drawing helpers ────────────────────────────────────────────────────────
function fillRect(x, y, w, h, color) {
  doc.rect(x, y, w, h).fill(color);
}
function rrect(x, y, w, h, r, color) {
  doc.roundedRect(x, y, w, h, r).fill(color);
}
function bdr(x, y, w, h, r, color) {
  doc.roundedRect(x, y, w, h, r).lineWidth(0.6).strokeColor(color).stroke();
}
function txt(s, x, y, w, color, italic, size) {
  doc.font(italic ? 'Helvetica-Oblique' : 'Helvetica')
     .fontSize(size || 7.5).fillColor(color || C.txt)
     .text(s, x, y, { width: w, lineBreak: true });
}
function bold(s, x, y, w, color, size) {
  doc.font('Helvetica-Bold').fontSize(size || 7.5)
     .fillColor(color || C.txt)
     .text(s, x, y, { width: w, lineBreak: false });
}
function lineH(x1, x2, y, color, lw) {
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(lw || 1).strokeColor(color).stroke();
}
function lineV(x, y1, y2, color, lw) {
  doc.moveTo(x, y1).lineTo(x, y2).lineWidth(lw || 1).strokeColor(color).stroke();
}
function arrowDown(cx, y1, y2, color) {
  lineV(cx, y1, y2 - 5, color, 1.5);
  doc.moveTo(cx - 5, y2 - 5).lineTo(cx, y2).lineTo(cx + 5, y2 - 5)
     .lineWidth(1.5).strokeColor(color).stroke();
}
function diamond(cx, cy, hw, hh, fill, label, lc, sz) {
  doc.moveTo(cx, cy - hh).lineTo(cx + hw, cy)
     .lineTo(cx, cy + hh).lineTo(cx - hw, cy).closePath().fill(fill);
  doc.font('Helvetica-Bold').fontSize(sz || 8).fillColor(lc || C.white)
     .text(label, cx - hw + 6, cy - 5.5, { width: hw * 2 - 12, align: 'center', lineBreak: false });
}
function scriptBox(text, x, y, w, h, accent) {
  rrect(x, y, w, h, 4, C.white);
  fillRect(x, y, 4, h, accent);
  bdr(x, y, w, h, 4, accent);
  txt('\u201c' + text + '\u201d', x + 10, y + 6, w - 18, C.dark, true, 7.6);
}
function stepBadge(num, label, x, y, w, h, bg) {
  rrect(x, y, w, h, 4, bg);
  doc.circle(x + 18, y + h / 2, 11).fill(C.white);
  bold(String(num), x + 14.5, y + h / 2 - 5, 14, bg, 10);
  bold(label, x + 34, y + h / 2 - 5, w - 42, C.white, 8.5);
}
function footerBand(page) {
  fillRect(0, H - 24, W, 24, C.dark);
  bold('SST COLOMBIA\u2122  \u00b7  sst.sagisas.co  \u00b7  Adriana D\u00edaz, CEO  \u00b7  SAGISAS SAS', ML, H - 16, 320, '#A8D8B9', 7);
  bold('P\u00e1gina ' + page + ' de 2  \u2014  Uso interno \u00b7 Equipo Comercial', W - 180, H - 16, 160, C.light, 7);
}

// ══════════════════════════════════════════════════════════════════════════
//  PÁGINA 1
// ══════════════════════════════════════════════════════════════════════════
fillRect(0, 0, W, H, C.bg);

// Header
fillRect(0, 0, W, 78, C.dark);
fillRect(0, 78, W, 3, C.light);
bold('GU\u00cdA DE LLAMADAS TELEF\u00d3NICAS', ML, 14, CW, C.white, 20);
txt('SST COLOMBIA\u2122  \u00b7  \u00c1rbol de decisiones para gesti\u00f3n comercial', ML, 40, CW, '#A8D8B9', false, 9);
txt('Objetivo: Agendar demostraci\u00f3n de 10 minutos  o  enviar folleto PDF t\u00e9cnico al gerente', ML, 55, CW, C.light, false, 7.8);

// Badges top-right
const badges = ['PESV \u00b7 Res. 40595/2022', 'Res. 0312/2019', 'ISO 45001:2018'];
let bx = W - MR;
badges.forEach(lb => {
  const pw = doc.font('Helvetica-Bold').fontSize(6.5).widthOfString(lb) + 12;
  bx -= pw + 5;
  rrect(bx, 20, pw, 13, 5, C.mid);
  bold(lb, bx + 6, 23, pw - 10, C.white, 6.5);
});

// Pre-call bar
fillRect(0, 81, W, 21, '#EAF7EE');
bold('Antes de marcar \u2014 tenga listo: ', ML, 89, 160, C.green, 7.5);
txt('nombre del gerente  \u00b7  correo confirmado  \u00b7  nombre empresa  \u00b7  sector', ML + 162, 89, 310, C.mid, false, 7.5);

// PASO 1
let y = 111;
stepBadge(1, 'EL FILTRO \u2014 SECRETARIA / RECEPCIONISTA', ML, y, CW, 27, C.green);
y += 35;

bold('Gui\u00f3n de apertura:', ML, y, CW, C.mid, 7.5);
y += 12;
scriptBox(
  'Buenos d\u00edas, mi nombre es [Nombre] de parte de Adriana D\u00edaz, CEO de SST Colombia. ' +
  '\u00bfMe comunica con el se\u00f1or/se\u00f1ora [Nombre del Gerente], por favor?',
  ML, y, CW, 42, C.green
);
y += 50;

// "Si preguntan" box
rrect(ML, y, CW, 58, 4, '#F0FBF4');
bdr(ML, y, CW, 58, 4, C.pale);
bold('Si le preguntan \u201c\u00bfPara qu\u00e9 es?\u201d o \u201c\u00bfDe qu\u00e9 empresa llama?\u201d:', ML + 8, y + 7, CW - 16, C.green, 7.5);
txt(
  '\u201cLlamamos de SST Colombia. Es para confirmarle un asunto t\u00e9cnico sobre la documentaci\u00f3n de ' +
  'cumplimiento legal \u2014 los informes que su empresa debe tener listos para el Ministerio del Trabajo ' +
  'y la Superintendencia de Transporte. Es muy breve.\u201d',
  ML + 8, y + 20, CW - 18, C.dark, true, 7.6
);
y += 66;

// Arrow to diamond
arrowDown(W / 2, y, y + 20, C.light);
y += 20;
diamond(W / 2, y + 16, 90, 17, C.mid, '\u00bfLo comunican con el gerente?', C.white, 8.5);
const dY = y + 16;  // diamond center
y = dY + 17;        // bottom of diamond

// Branch labels
const noLabelX = ML;
const yesLabelX = W / 2 + 30;

// Arrow left (NO)
doc.moveTo(W / 2 - 90, dY).lineTo(noLabelX + 152, dY).lineWidth(1.5).strokeColor(C.red).stroke();
arrowDown(noLabelX + 152, dY, y + 5, C.red);
rrect(noLabelX, dY - 9, 150, 13, 5, C.red);
bold('NO \u2192 Nivel 1 \u00b7 Dejar mensaje', noLabelX + 5, dY - 6.5, 140, C.white, 7);

// Arrow right (SÍ)
doc.moveTo(W / 2 + 90, dY).lineTo(W - MR - 130, dY).lineWidth(1.5).strokeColor(C.green).stroke();
arrowDown(W - MR - 130, dY, y + 5, C.green);
rrect(W - MR - 128, dY - 9, 128, 13, 5, C.green);
bold('S\u00cd \u2192 Continuar \u2014 VER P\u00c1GINA 2', W - MR - 123, dY - 6.5, 118, C.white, 7);

y += 8;

// Two side-by-side blocks
const blockH = 168;
const colW2 = (CW - 8) / 2;

// NO block
rrect(ML, y, colW2, blockH, 5, C.white);
fillRect(ML, y, 5, blockH, C.red);
bdr(ML, y, colW2, blockH, 5, '#F1948A');
bold('NIVEL 1 \u2014 Dejar mensaje y capturar datos', ML + 10, y + 8, colW2 - 16, C.red, 7.5);
txt('Si el gerente no est\u00e1 o no puede atender:', ML + 10, y + 22, colW2 - 16, C.sub, false, 7);
txt(
  '\u201cPerfecto, le entiendo. \u00bfMe podr\u00eda dar su correo directo o su extensi\u00f3n? Es para reenviarle ' +
  'la nota t\u00e9cnica de 1 p\u00e1gina sobre los informes de cumplimiento para el Ministerio del Trabajo.\u201d',
  ML + 10, y + 33, colW2 - 16, C.dark, true, 7.6
);
bold('Si dan correo / extensi\u00f3n:', ML + 10, y + 80, colW2 - 16, C.red, 7);
txt('Anotar. Enviar correo personalizado hoy. Programar rellamada en 48 horas.', ML + 10, y + 91, colW2 - 16, C.sub, false, 7);
bold('Si NO dan datos:', ML + 10, y + 112, colW2 - 16, C.red, 7);
txt('\u201c\u00bfA qu\u00e9 hora me recomienda marcar para encontrarle directo? Muchas gracias.\u201d  \u2014  Anotar y cerrar cordialmente.', ML + 10, y + 123, colW2 - 16, C.sub, false, 7);

// YES block
const yx = ML + colW2 + 8;
rrect(yx, y, colW2, blockH, 5, '#EAF7EE');
fillRect(yx, y, 5, blockH, C.green);
bdr(yx, y, colW2, blockH, 5, C.pale);
bold('\u00a1Lo pasaron! \u2014 Contin\u00fae con calma y seguridad', yx + 10, y + 8, colW2 - 16, C.green, 7.5);
txt('Antes de hablar, respire profundo. Usted tiene algo de valor que ofrecerle.', yx + 10, y + 22, colW2 - 16, C.sub, false, 7);

const tips = [
  'Use el nombre del gerente al inicio de cada idea.',
  'Escuche m\u00e1s de lo que habla. Si interrumpe, deje terminar.',
  'No enumere funciones: cuente c\u00f3mo resolvemos su problema.',
  'Su \u00fanico objetivo: que acepte el PDF o agende los 10 minutos.',
  'Tono de aliado t\u00e9cnico, no de vendedor. Usted confirma, no vende.',
];
tips.forEach((tip, i) => {
  doc.circle(yx + 14, y + 46 + i * 21 + 4, 3).fill(C.light);
  txt(tip, yx + 21, y + 46 + i * 21, colW2 - 30, C.txt, false, 7.5);
});

footerBand('1');

// ══════════════════════════════════════════════════════════════════════════
//  PÁGINA 2
// ══════════════════════════════════════════════════════════════════════════
doc.addPage();
fillRect(0, 0, W, H, C.bg);

// Slim header
fillRect(0, 0, W, 44, C.dark);
fillRect(0, 44, W, 3, C.light);
bold('GU\u00cdA DE LLAMADAS TELEF\u00d3NICAS  \u00b7  SST COLOMBIA\u2122', ML, 8, CW, C.white, 11);
txt('P\u00e1gina 2 de 2  \u2014  Paso 2: El Tomador de Decisi\u00f3n \u2014 \u00c1rbol de respuestas', ML, 26, CW, '#A8D8B9', false, 8);

y = 57;
stepBadge(2, 'EL TOMADOR DE DECISI\u00d3N \u2014 GERENTE / REPRESENTANTE LEGAL', ML, y, CW, 27, C.mid);
y += 35;

bold('Gui\u00f3n de apertura (m\u00e1ximo 30 segundos \u2014 natural y directo):', ML, y, CW, C.mid, 7.5);
y += 12;
scriptBox(
  'Se\u00f1or/Se\u00f1ora [Nombre], buenos d\u00edas. Le habla [Nombre del Asistente] de parte de Adriana D\u00edaz. ' +
  'Muy breve: llevamos a\u00f1os ayudando a empresas del sector a tener listos \u2014 con firma digital \u2014 ' +
  'los informes del Ministerio del Trabajo y la Superintendencia de Transporte. Sin papeles, sin estr\u00e9s. ' +
  'Le enviamos un mensaje hace unos d\u00edas. \u00bfPudo verlo?',
  ML, y, CW, 56, C.mid
);
y += 64;

// Arrow + diamond
arrowDown(W / 2, y, y + 16, C.light);
y += 16;
diamond(W / 2, y + 14, 108, 16, C.green, '\u00bfCu\u00e1l es su respuesta?', C.white, 9);
const d2Y = y + 14;
y = d2Y + 16;

// 4 columns
const BR = [
  { let: 'A', lab: '\u201cS\u00ed, lo vi\u201d',       bg: C.green,  lt: '#E8F5F0' },
  { let: 'B', lab: '\u201cNo lo vi\u201d',              bg: C.blue,   lt: '#EBF4FB' },
  { let: 'C', lab: '\u201cEstoy ocupado/a\u201d',       bg: C.amber,  lt: '#FEF9EF' },
  { let: 'D', lab: '\u201cNo me interesa\u201d',        bg: C.purple, lt: '#F5EEF8' },
];

const N   = 4;
const GAP = 4;
const BW  = (CW - GAP * (N - 1)) / N;
const BHH = 22;   // header height
const BBH = 190;  // body height

// Arrows from diamond to columns
BR.forEach((br, i) => {
  const cx = ML + i * (BW + GAP) + BW / 2;
  doc.moveTo(W / 2, d2Y).lineTo(cx, d2Y).lineWidth(0.8).strokeColor(C.line)
     .dash(3, { space: 2 }).stroke();
  doc.undash();
  arrowDown(cx, d2Y, y, C.line);
});

BR.forEach((br, i) => {
  const bx = ML + i * (BW + GAP);
  // Header
  rrect(bx, y, BW, BHH, 4, br.bg);
  bold(br.let + '  ' + br.lab, bx + 7, y + 7, BW - 10, C.white, 7.5);
});

y += BHH;

// Body content per branch
const CONTENT = [
  // A: Sí lo vi
  [
    ['script', '\u00a1Excelente! Lo llamamos para ofrecerle enviarle el resumen t\u00e9cnico de 1 p\u00e1gina \u2014 ver\u00e1 c\u00f3mo los trabajadores registran todo desde el celular y el sistema genera solo los informes para el Ministerio y la Supertransporte.\u201d'],
    ['head',   '\u2192 Si acepta el PDF:'],
    ['body',   '\u201c\u00bfMe confirma su celular para avisarle por WhatsApp en cuanto lo env\u00ede?\u201d'],
    ['head',   '\u2192 Si muestra inter\u00e9s:'],
    ['body',   '\u201c\u00bfLe queda bien una sesi\u00f3n virtual de 10 min el martes a las 9 am o el mi\u00e9rcoles en la tarde?\u201d'],
  ],
  // B: No lo vi
  [
    ['script', 'No se preocupe, el d\u00eda a d\u00eda es as\u00ed. En 20 segundos: ayudamos a empresas como la suya a que comit\u00e9s, inspecciones y entregas de dotaci\u00f3n generen solos los informes para el Ministerio del Trabajo y la Supertransporte.\u201d'],
    ['head',   '\u2192 Solicitar correo directo:'],
    ['body',   '\u201c\u00bfMe confirma su correo para enviarle el resumen de 1 p\u00e1gina ahora mismo?\u201d'],
    ['note',   'Validar letra por letra. Prometer env\u00edo inmediato. Registrar y hacer seguimiento.'],
  ],
  // C: Estoy ocupado
  [
    ['script', 'Le entiendo perfectamente \u2014 no le quito ni un segundo. Le env\u00edo ahora el documento t\u00e9cnico de 1 p\u00e1gina para que lo tenga a la mano cuando tenga calma. Sin compromisos.\u201d'],
    ['head',   '\u2192 Acordar momento exacto:'],
    ['body',   '\u201c\u00bfLe marco el [d\u00eda] a las [hora]? \u00bfLe funciona mejor ma\u00f1ana o tarde?\u201d'],
    ['note',   'Anotar d\u00eda, hora y nombre de quien confirma. Rellamada puntual.'],
  ],
  // D: No me interesa
  [
    ['script', 'Le comprendo, y qu\u00e9 bueno que ya tienen eso cubierto. No competimos con su ARL \u2014 automatizamos lo que ellas no hacen: firmas digitales, comit\u00e9s en app e informes listos para el Ministerio y la Supertransporte.\u201d'],
    ['head',   '\u2192 Si acepta ver el PDF:'],
    ['body',   'Enviar de inmediato. Anotar correo confirmado.'],
    ['head',   '\u2192 Si insiste en no:'],
    ['body',   '\u201cMuchas gracias por su tiempo \u2014 que tenga un excelente d\u00eda.\u201d  Cerrar con calidad.'],
  ],
];

BR.forEach((br, i) => {
  const bx = ML + i * (BW + GAP);
  rrect(bx, y, BW, BBH, 0, br.lt);
  // bottom rounded corners
  rrect(bx, y + BBH - 5, BW, 9, 4, br.lt);

  let ty = y + 7;

  CONTENT[i].forEach(item => {
    const [type, text] = item;
    if (type === 'script') {
      // italic quote
      doc.font('Helvetica-Oblique').fontSize(7.3).fillColor(C.dark)
         .text('\u201c' + text, bx + 7, ty, { width: BW - 14, lineBreak: true });
      ty += 66;
    } else if (type === 'head') {
      doc.font('Helvetica-Bold').fontSize(7).fillColor(br.bg)
         .text(text, bx + 7, ty, { width: BW - 14, lineBreak: false });
      ty += 13;
    } else if (type === 'body') {
      doc.font('Helvetica').fontSize(7.2).fillColor(C.txt)
         .text(text, bx + 7, ty, { width: BW - 14, lineBreak: true });
      ty += 22;
    } else if (type === 'note') {
      rrect(bx + 6, ty, BW - 12, 24, 3, br.bg + '30');
      doc.font('Helvetica').fontSize(6.8).fillColor(br.bg)
         .text(text, bx + 10, ty + 5, { width: BW - 20, lineBreak: true });
      ty += 32;
    }
  });
});

y += BBH + 12;

// ARGUMENTOS CLAVE
fillRect(0, y, W, 14, C.dark);
bold('ARGUMENTOS CLAVE \u2014 Si el gerente pregunta m\u00e1s detalles', ML, y + 3.5, CW, C.white, 8);
y += 14;

const ARGS = [
  { label: 'Ministerio del Trabajo \u2014 Res. 0312/2019',
    body:  'Informe de cumplimiento con "Hilo Dorado": cada est\u00e1ndar enlazado a su evidencia y acci\u00f3n. FURAT autom\u00e1tico para ARL. Actas de COPASST firmadas. Estad\u00edsticas de accidentalidad al instante.',
    accent: C.green, lt: '#E8F5F0' },
  { label: 'Supertransporte \u2014 PESV \u00b7 Res. 40595/2022',
    body:  'Evaluaci\u00f3n de 24 pasos PHVA, % de cumplimiento por fase. Conductores, licencias, comparendos. Flota, inspecciones desde celular, control de alcohol/fatiga. Evidencias en PDF para auditor\u00eda.',
    accent: C.blue, lt: '#EBF4FB' },
  { label: 'Portal m\u00f3vil del trabajador y conductor',
    body:  'Firma recibos de EPP, asiste a capacitaciones y hace inspecciones desde el celular. Encuesta diaria de aptitud. Cero papel, disponible las 24h, 100% trazable para inspecci\u00f3n.',
    accent: C.mid, lt: '#EAF7EE' },
  { label: 'Firma digital del Licenciado SST (LSO)',
    body:  '5 tipos de documentos firmados con n\u00famero de licencia vigente. Validez legal plena ante el Ministerio. El LSO gestiona todas sus empresas desde un portal unificado.',
    accent: C.purple, lt: '#F5EEF8' },
];

const AW = (CW - GAP * (N - 1)) / N;
const AH = 94;
ARGS.forEach((arg, i) => {
  const ax = ML + i * (AW + GAP);
  rrect(ax, y, AW, AH, 5, arg.lt);
  fillRect(ax, y, 4, AH, arg.accent);
  bold(arg.label, ax + 10, y + 8, AW - 16, arg.accent, 7);
  txt(arg.body, ax + 10, y + 22, AW - 16, C.sub, false, 7);
});

y += AH + 10;

// Cierre
fillRect(0, y, W, 13, C.mid);
bold('CIERRE PROFESIONAL \u2014 aplicar en todos los escenarios', ML, y + 3, CW, C.white, 7.5);
y += 13;

rrect(ML, y, CW, 38, 4, '#EAF7EE');
doc.font('Helvetica-Oblique').fontSize(8).fillColor(C.dark)
   .text(
     '\u201cMuchas gracias por su tiempo, [Nombre]. Le confirmo el env\u00edo del documento por correo y, si tiene alguna pregunta, con mucho gusto la atendemos. \u00a1Que tenga un excelente d\u00eda!\u201d',
     ML + 16, y + 8, { width: CW - 32, align: 'center', lineBreak: false }
   );

footerBand('2');

doc.end();
console.log('PDF listo:', out);
