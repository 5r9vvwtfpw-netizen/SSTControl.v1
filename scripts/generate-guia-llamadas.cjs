const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4', margin: 0 });
const out = path.join(__dirname, '..', 'guia-llamadas-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(out));

const W = 595.28;
const H = 841.89;

// ── Paleta ────────────────────────────────────────────────────────────────────
const G = {
  dark:   '#0B2218',
  green:  '#1A4232',
  mid:    '#2D6A4F',
  light:  '#52B788',
  pale:   '#D8F3DC',
  white:  '#FFFFFF',
  bg:     '#F7FAFA',
  line:   '#B7E4C7',
  txt:    '#17291F',
  sub:    '#3A5A47',
  muted:  '#6B8F77',
  red:    '#C0392B',
  blue:   '#154360',
  amber:  '#7D4A00',
  purple: '#4A235A',
  rlight: '#FDECEA',
  blight: '#EAF2F8',
  alight: '#FEF5E7',
  plight: '#F5EEF8',
};

// ── Primitivos ────────────────────────────────────────────────────────────────
const fill  = (c) => doc.fillColor(c);
const font  = (f, s) => doc.font(f).fontSize(s);
const t     = (str, x, y, opts, col, fnt, sz) => {
  doc.font(fnt || 'Helvetica').fontSize(sz || 8).fillColor(col || G.txt)
     .text(str, x, y, opts || {});
};
const b = (str, x, y, opts, col, sz) =>
  doc.font('Helvetica-Bold').fontSize(sz || 8).fillColor(col || G.txt)
     .text(str, x, y, opts || {});
const rect = (x, y, w, h, c) => doc.rect(x, y, w, h).fill(c);
const line = (x1, y1, x2, y2, c, lw, dash) => {
  if (dash) doc.dash(dash[0], { space: dash[1] });
  doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(lw || 1).strokeColor(c || G.light).stroke();
  if (dash) doc.undash();
};

// Arrow down
const arrowD = (cx, y1, y2, c) => {
  line(cx, y1, cx, y2 - 5, c, 1.5);
  doc.moveTo(cx - 5, y2 - 5).lineTo(cx, y2).lineTo(cx + 5, y2 - 5)
     .lineWidth(1.5).strokeColor(c || G.light).stroke();
};
const arrowR = (x1, x2, cy, c) => {
  line(x1, cy, x2 - 5, cy, c, 1.5);
  doc.moveTo(x2 - 5, cy - 4).lineTo(x2, cy).lineTo(x2 - 5, cy + 4)
     .lineWidth(1.5).strokeColor(c || G.light).stroke();
};

// Rounded rect
const rrect = (x, y, w, h, r, c) => doc.roundedRect(x, y, w, h, r).fill(c);

// Diamond
function diamond(cx, cy, hw, hh, fc, label, lc, sz) {
  doc.moveTo(cx, cy - hh).lineTo(cx + hw, cy)
     .lineTo(cx, cy + hh).lineTo(cx - hw, cy).closePath().fill(fc);
  doc.font('Helvetica-Bold').fontSize(sz || 7.5).fillColor(lc || G.white)
     .text(label, cx - hw + 6, cy - 5, { width: hw * 2 - 12, align: 'center', lineBreak: false });
}

// Step number badge
function stepBadge(num, label, bx, by, bw, bh, bgColor) {
  rrect(bx, by, bw, bh, 4, bgColor);
  // Circle number
  doc.circle(bx + 18, by + bh / 2, 11).fill(G.white);
  b(String(num), bx + 14.5, by + bh / 2 - 5, { lineBreak: false }, bgColor, 10);
  b(label, bx + 34, by + bh / 2 - 5.5, { width: bw - 40, lineBreak: false }, G.white, 8.5);
}

// Script box (italic quote with left accent bar)
function scriptBox(text, x, y, bw, bh, accent) {
  rrect(x, y, bw, bh, 4, G.white);
  rect(x, y, 4, bh, accent);
  doc.roundedRect(x, y, bw, bh, 4).lineWidth(0.5).strokeColor(accent).stroke();
  doc.font('Helvetica-Oblique').fontSize(7.8).fillColor(G.dark)
     .text('\u201c' + text + '\u201d', x + 10, y + 7, { width: bw - 16, align: 'justify' });
}

// Tag pill
function pill(text, x, y, bg, tc, sz) {
  const pw = doc.font('Helvetica-Bold').fontSize(sz || 6.5).widthOfString(text) + 12;
  rrect(x, y, pw, 13, 6, bg);
  doc.font('Helvetica-Bold').fontSize(sz || 6.5).fillColor(tc || G.white)
     .text(text, x + 6, y + 3, { lineBreak: false });
  return pw;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PÁGINA 1: Introducción + Paso 1
// ══════════════════════════════════════════════════════════════════════════════

// Background
rect(0, 0, W, H, G.bg);

// Header
rect(0, 0, W, 80, G.dark);
rect(0, 80, W, 3, G.light);

b('GUÍA DE LLAMADAS TELEFÓNICAS', 28, 16, {}, G.white, 20);
t('SST COLOMBIA™  ·  Árbol de decisiones para gestión comercial', 28, 42, {}, '#A8D8B9', 'Helvetica', 9);
t('Objetivo: Agendar demostración de 10 minutos  o  enviar folleto PDF técnico', 28, 57, {}, G.light, 'Helvetica', 8);

// Badges top-right
let px = W - 20;
['PESV · Res. 40595/2022', 'Res. 0312/2019', 'ISO 45001:2018'].forEach(lb => {
  const pw = doc.font('Helvetica-Bold').fontSize(6.5).widthOfString(lb) + 12;
  px -= pw + 6;
  rrect(px, 16, pw, 14, 6, G.mid);
  b(lb, px + 6, 19.5, { lineBreak: false }, G.white, 6.5);
});

// Pre-call bar
rect(0, 83, W, 22, '#EAF7EE');
b('Antes de marcar — tenga listo: ', 22, 91, { continued: true }, G.green, 7.5);
t('nombre del gerente  ·  correo confirmado  ·  nombre empresa  ·  sector (transporte / industria / manufactura)', 22, 91, {}, G.mid, 'Helvetica', 7.5);

// ── PASO 1 ────────────────────────────────────────────────────────────────────
let y = 116;
stepBadge(1, 'EL FILTRO — SECRETARIA / RECEPCIONISTA', 22, y, W - 44, 28, G.green);
y += 36;

b('Guión de apertura:', 22, y, {}, G.mid, 7.5);
y += 12;
scriptBox(
  'Buenos días, mi nombre es [Nombre] de parte de Adriana Díaz, CEO de SST Colombia. ' +
  '¿Me comunica con el señor/señora [Nombre del Gerente], por favor?',
  22, y, W - 44, 44, G.green
);
y += 52;

// "If they ask..."
rrect(22, y, W - 44, 52, 4, '#F0FBF4');
doc.roundedRect(22, y, W - 44, 52, 4).lineWidth(0.5).strokeColor(G.pale).stroke();
b('Si le preguntan "¿Para qué es?" o "¿De qué empresa llama?":', 30, y + 8, {}, G.green, 7.5);
doc.font('Helvetica-Oblique').fontSize(7.8).fillColor(G.dark)
   .text(
     '\u201cLlamamos de SST Colombia. Es para confirmarle un asunto técnico urgente sobre la documentación ' +
     'de cumplimiento legal — los informes que su empresa debe tener listos para el Ministerio del Trabajo ' +
     'y la Superintendencia de Transporte. Es muy breve.\u201d',
     30, y + 20, { width: W - 68, align: 'justify' }
   );
y += 60;

// Decision diamond
const d1X = W / 2;
const d1Y = y + 22;
arrowD(d1X, y, d1Y - 14, G.light);
diamond(d1X, d1Y, 86, 18, G.mid, '¿Lo comunican con el gerente?', G.white, 8);
y = d1Y + 18;

// YES branch (right)
const yesX = d1X + 86;
const yesTargetX = d1X + 86;
line(yesX, d1Y, W - 22, d1Y, G.light, 1.5);
arrowD(W - 22, d1Y, d1Y + 28, G.light);

rrect(W - 22 - 100, d1Y - 10, 98, 12, 6, G.mid);
b('SÍ  →  VER PÁGINA 2', W - 22 - 94, d1Y - 7, { lineBreak: false }, G.white, 7);

// NO branch (left)
const noX = 22;
line(d1X - 86, d1Y, noX + 150, d1Y, G.red, 1.5);
arrowD(noX + 150, d1Y, d1Y + 28, G.red);

rrect(noX, d1Y - 10, 148, 12, 6, '#C0392B');
b('NO  →  NIVEL 1 · Dejar mensaje', noX + 6, d1Y - 7, { lineBreak: false }, G.white, 7);

y = d1Y + 28;

// NO block
const noBlockW = 242;
rrect(22, y, noBlockW, 130, 6, G.white);
rect(22, y, 5, 130, G.red);
doc.roundedRect(22, y, noBlockW, 130, 6).lineWidth(0.5).strokeColor('#F1948A').stroke();

b('NIVEL 1 — Dejar mensaje y capturar datos', 34, y + 8, { width: noBlockW - 18 }, G.red, 7.5);
t('Si no puede pasar la llamada o el gerente no está:', 34, y + 22, { width: noBlockW - 18 }, G.sub, 'Helvetica', 7);

doc.font('Helvetica-Oblique').fontSize(7.8).fillColor(G.dark)
   .text(
     '\u201cPerfecto, le entiendo. ¿Me podría dar su correo directo o su extensión? ' +
     'Es para reenviarle la nota técnica de una sola página sobre los informes de cumplimiento para el Ministerio del Trabajo.\u201d',
     34, y + 34, { width: noBlockW - 18 }
   );

b('Si le dan correo / extensión:', 34, y + 72, { width: noBlockW - 18 }, G.red, 7);
t('Anotar. Enviar correo personalizado. Programar rellamada en 48h.', 34, y + 82, { width: noBlockW - 18 }, G.sub, 'Helvetica', 7);

b('Si NO dan datos:', 34, y + 96, { width: noBlockW - 18 }, G.red, 7);
t('\u201c¿A qué hora le recomiendan marcar para encontrarle directo?\u201d  — Anotar y cerrar cordialmente.', 34, y + 106, { width: noBlockW - 18 }, G.sub, 'Helvetica', 7);

// YES block
const yesW = 270;
const yesBlockX = W - 22 - yesW;
rrect(yesBlockX, y, yesW, 130, 6, '#EAF7EE');
rect(yesBlockX, y, 5, 130, G.green);
doc.roundedRect(yesBlockX, y, yesW, 130, 6).lineWidth(0.5).strokeColor(G.pale).stroke();

b('¡Lo pasaron! — Continúe con calma y confianza', yesBlockX + 12, y + 8, { width: yesW - 18 }, G.green, 7.5);

const tips = [
  'Respire y baje el ritmo antes de hablar.',
  'Use el nombre del gerente al inicio de cada idea.',
  'Escuche más de lo que habla. Si interrumpe, deje terminar.',
  'Su único objetivo ahora: llegar al Paso 2 (página 2).',
];
tips.forEach((tip, i) => {
  doc.circle(yesBlockX + 16, y + 28 + i * 22 + 4, 3).fill(G.light);
  t(tip, yesBlockX + 24, y + 28 + i * 22, { width: yesW - 34 }, G.txt, 'Helvetica', 7.5);
});

y += 140;

// Footer p1
rect(0, H - 24, W, 24, G.dark);
b('SST COLOMBIA™  ·  sst.sagisas.co  ·  Adriana Díaz, CEO  ·  SAGISAS SAS', 22, H - 16, {}, '#A8D8B9', 7);
b('Página 1 de 2  —  Uso interno · Equipo Comercial', W - 160, H - 16, {}, G.light, 7);

// ══════════════════════════════════════════════════════════════════════════════
//  PÁGINA 2: Paso 2 + 4 ramas + Argumentos clave
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
rect(0, 0, W, H, G.bg);

// Header slim
rect(0, 0, W, 44, G.dark);
rect(0, 44, W, 3, G.light);
b('GUÍA DE LLAMADAS TELEFÓNICAS  ·  SST COLOMBIA™', 22, 8, {}, G.white, 11);
t('Página 2 de 2  —  Paso 2: El Tomador de Decisión', 22, 25, {}, '#A8D8B9', 'Helvetica', 8);

y = 58;

// ── PASO 2 ────────────────────────────────────────────────────────────────────
stepBadge(2, 'EL TOMADOR DE DECISIÓN — GERENTE / REPRESENTANTE LEGAL', 22, y, W - 44, 28, G.mid);
y += 36;

b('Guión de apertura (máximo 30 segundos):', 22, y, {}, G.mid, 7.5);
y += 12;
scriptBox(
  'Señor/Señora [Nombre], buenos días. Le habla [Nombre del Asistente] de parte de Adriana Díaz. ' +
  'Muy breve: llevamos años ayudando a empresas del sector a tener listos automáticamente — con firma digital — ' +
  'los informes que pide el Ministerio del Trabajo y la Superintendencia de Transporte. ' +
  'Le enviamos un mensaje hace unos días. ¿Pudo verlo?',
  22, y, W - 44, 60, G.mid
);
y += 68;

// Decision 2
const d2X = W / 2;
const d2Y = y + 20;
arrowD(d2X, y, d2Y - 14, G.light);
diamond(d2X, d2Y, 110, 18, G.green, '¿Cuál es su respuesta?', G.white, 8.5);
y = d2Y + 18;

// Branches
const BR = [
  { letter: 'A', label: '"Sí lo vi"',      bg: G.green,  txt: G.white, lt: '#EBF8F0' },
  { letter: 'B', label: '"No lo vi"',       bg: G.blue,   txt: G.white, lt: '#EBF4FB' },
  { letter: 'C', label: '"Estoy ocupado"',  bg: G.amber,  txt: G.white, lt: '#FEF9EF' },
  { letter: 'D', label: '"No me interesa"', bg: G.purple, txt: G.white, lt: '#F5EEF8' },
];

const bw4 = (W - 44 - 9) / 4;  // 4 cols with 3 gaps of 3
const bx0 = 22;
const gap4 = 3;
const headerH = 26;
const bodyH = 172;

BR.forEach((br, i) => {
  const bx = bx0 + i * (bw4 + gap4);
  // Arrow from diamond to column
  const cx = bx + bw4 / 2;
  line(d2X, d2Y, cx, d2Y, G.light, 0.8, [3, 2]);
  arrowD(cx, d2Y, y + 2, G.light);
  // Header
  rrect(bx, y, bw4, headerH, 4, br.bg);
  b(br.letter + '  ' + br.label, bx + 8, y + 9, { width: bw4 - 12, lineBreak: false }, br.txt, 8);
});

y += headerH;

const SCRIPTS = [
  // A
  [
    { type: 'body', text: '«¡Excelente! Lo llamamos para ofrecerle enviarle el folleto técnico de 1 página donde ve en imágenes cómo los trabajadores y conductores registran todo desde el celular — y el sistema genera solo los informes para el Ministerio y la Supertransporte.»' },
    { type: 'if',   text: '→ Si acepta el PDF:', sub: '«¿Me confirma su celular para avisarle por WhatsApp en cuanto lo envíe?»' },
    { type: 'if',   text: '→ Si muestra interés:', sub: '«¿Le queda bien una sesión virtual de 10 min este martes a las 9 am o el miércoles en la tarde?»' },
  ],
  // B
  [
    { type: 'body', text: '«No se preocupe, es muy comprensible con el día a día. En 20 segundos: ayudamos a empresas como la suya a que comités, inspecciones y entregas de dotaciones dejen de ser papeles y generen solos los informes para el Ministerio del Trabajo.»' },
    { type: 'if',   text: '→ Solicitar correo directo:', sub: '«¿Me confirma su correo para enviarle el resumen de 1 página ahora mismo?»' },
    { type: 'note', text: 'Validar bien el correo letra por letra. Prometer envío inmediato. Registrar y dar seguimiento.' },
  ],
  // C
  [
    { type: 'body', text: '«Le entiendo perfectamente, no le quito ni un segundo. Le reenvío el documento técnico de 1 página a su correo ahora mismo para que lo tenga a la mano cuando tenga calma.»' },
    { type: 'if',   text: '→ Acordar momento exacto:', sub: '«¿Le marco el [día] a las [hora] para encontrarle directo? ¿Le funciona mejor en la mañana o en la tarde?»' },
    { type: 'note', text: 'Anotar día, hora y nombre de quien confirma. Cerrar amablemente y cumplir la rellamada puntual.' },
  ],
  // D
  [
    { type: 'body', text: '«Le comprendo, señor [Nombre], y qué bueno que ya tienen eso cubierto. Lo valioso es que no competimos con su ARL ni con su asesor: automatizamos lo que ellos no hacen — las firmas digitales, los comités en app y los informes listos para el Ministerio y la Supertransporte, sin papeles.»' },
    { type: 'if',   text: '→ Si acepta ver el PDF:', sub: 'Enviar de inmediato. Anotar correo.' },
    { type: 'if',   text: '→ Si insiste en no:', sub: '«Muchas gracias por su tiempo — que tenga un excelente día.» Cerrar con calidad.' },
  ],
];

BR.forEach((br, i) => {
  const bx = bx0 + i * (bw4 + gap4);
  rrect(bx, y, bw4, bodyH, 0, br.lt);
  // bottom-left/right rounding
  doc.roundedRect(bx, y + bodyH - 4, bw4, 8, 4).fill(br.lt);

  let ty = y + 8;
  SCRIPTS[i].forEach(item => {
    if (item.type === 'body') {
      doc.font('Helvetica-Oblique').fontSize(7.4).fillColor(G.dark)
         .text(item.text, bx + 7, ty, { width: bw4 - 14, align: 'justify' });
      ty = doc.y + 6;
    } else if (item.type === 'if') {
      doc.font('Helvetica-Bold').fontSize(7).fillColor(br.bg)
         .text(item.text, bx + 7, ty, { width: bw4 - 14 });
      ty = doc.y + 2;
      doc.font('Helvetica').fontSize(7.2).fillColor(G.txt)
         .text(item.sub, bx + 7, ty, { width: bw4 - 14 });
      ty = doc.y + 6;
    } else if (item.type === 'note') {
      rrect(bx + 6, ty, bw4 - 12, 22, 3, br.bg + '22');
      doc.font('Helvetica').fontSize(6.8).fillColor(br.bg)
         .text(item.text, bx + 10, ty + 4, { width: bw4 - 20 });
      ty += 28;
    }
  });
});

y += bodyH + 14;

// ── ARGUMENTOS CLAVE ──────────────────────────────────────────────────────────
rect(0, y, W, 14, G.dark);
b('ARGUMENTOS CLAVE — Si pregunta más detalles durante la llamada', 22, y + 3.5, {}, G.white, 8);
y += 14;

const ARGS = [
  {
    icon: 'MinTrab', label: 'Ministerio del Trabajo — Res. 0312/2019',
    body: 'El sistema genera el informe de cumplimiento con "Hilo Dorado": cada estándar enlazado ' +
          'a su evidencia y su acción de mejora. FURAT automático listo para radicar ante la ARL. ' +
          'Actas de COPASST firmadas digitalmente. Estadísticas de accidentalidad al instante.',
    bg: '#E8F5F0', accent: G.green,
  },
  {
    icon: 'STrans', label: 'Superintendencia de Transporte — PESV · Res. 40595/2022',
    body: 'Evaluación de 24 pasos PHVA, % de cumplimiento por fase. Gestión de conductores ' +
          'con licencias, vencimientos y comparendos. Flota vehicular, inspecciones pre-operacionales ' +
          'desde celular, control de alcohol/fatiga. Evidencias exportables en PDF para auditoría.',
    bg: '#E8EEF8', accent: G.blue,
  },
  {
    icon: 'Móvil', label: 'Portal móvil del trabajador y el conductor',
    body: 'El operario firma recibos de EPP, asiste a capacitaciones y hace inspecciones ' +
          'desde su celular. El conductor registra su encuesta diaria de aptitud y checklist del ' +
          'vehículo. Cero papel, 100% trazable, disponible las 24h.',
    bg: '#F0FBF4', accent: G.light,
  },
  {
    icon: 'LSO', label: 'Firma digital del Licenciado SST (LSO)',
    body: 'Cinco tipos de documentos firmados con número de licencia vigente del profesional SST. ' +
          'Validez legal plena ante cualquier visita de inspección del Ministerio. ' +
          'El Licenciado gestiona todas sus empresas desde un portal unificado.',
    bg: '#F8F0FB', accent: G.purple,
  },
];

const aw = (W - 44 - 9) / 4;
ARGS.forEach((arg, i) => {
  const ax = 22 + i * (aw + 3);
  rrect(ax, y + 6, aw, 116, 5, arg.bg);
  rect(ax, y + 6, 4, 116, arg.accent);
  b(arg.label, ax + 10, y + 12, { width: aw - 14 }, arg.accent, 7);
  t(arg.body, ax + 10, y + 26, { width: aw - 16, align: 'justify' }, G.sub, 'Helvetica', 7);
});

y += 130;

// Cierre llamada
rect(0, y, W, 13, G.mid);
b('CIERRE PROFESIONAL — aplica en todos los escenarios', 22, y + 2.5, {}, G.white, 7.5);
y += 13;

rrect(22, y, W - 44, 44, 4, '#EAF7EE');
doc.font('Helvetica-Oblique').fontSize(8).fillColor(G.dark)
   .text(
     '\u201cMuchas gracias por su tiempo, [Nombre]. Le confirmo el envío del documento por correo ' +
     'y si tiene alguna pregunta, con mucho gusto la atendemos. ¡Que tenga un excelente día!\u201d',
     32, y + 8, { width: W - 68, align: 'center' }
   );

y += 52;

// Footer p2
rect(0, H - 24, W, 24, G.dark);
b('SST COLOMBIA™  ·  sst.sagisas.co  ·  Adriana Díaz, CEO  ·  SAGISAS SAS', 22, H - 16, {}, '#A8D8B9', 7);
b('Página 2 de 2  —  Uso interno · Equipo Comercial', W - 160, H - 16, {}, G.light, 7);

doc.end();
console.log('PDF generado:', out);
