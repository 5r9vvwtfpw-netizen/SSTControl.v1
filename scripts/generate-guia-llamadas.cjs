const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// bufferPages: true evita que PDFKit agregue páginas automáticamente por overflow
const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true, bufferPages: true });
const out = path.join(__dirname, '..', 'guia-llamadas-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(out));

const W = 595.28;
const H = 841.89;
const M = 26;
const CW = W - M * 2;

const G = {
  dark: '#0B2218', green: '#1A4232', mid: '#2D6A4F', light: '#52B788',
  pale: '#D8F3DC', white: '#FFFFFF', bg: '#F7FAF8', txt: '#17291F',
  sub: '#3A5A47', red: '#B91C1C', rlight: '#FEF2F2',
  amber: '#92400E', alight: '#FFFBEB', blue: '#1A4F8A',
  purple: '#4A235A', plight: '#F5EEF8',
};

// ─── Primitivos ────────────────────────────────────────────────────────────
function R(x,y,w,h,c){ doc.rect(x,y,w,h).fill(c); }
function RR(x,y,w,h,r,c){ doc.roundedRect(x,y,w,h,r).fill(c); }
function STR(x,y,w,h,r,c,lw){ doc.roundedRect(x,y,w,h,r).lineWidth(lw||0.7).strokeColor(c).stroke(); }

// Texto bold (1 línea, nunca hace overflow)
function B(s, x, y, w, c, sz) {
  doc.font('Helvetica-Bold').fontSize(sz||8.5).fillColor(c||G.txt)
     .text(s, x, y, { width: w, lineBreak: false, ellipsis: true });
}

// Texto normal multilínea con altura máxima para que no haga overflow
function T(s, x, y, w, c, sz, ital, maxH) {
  doc.font(ital ? 'Helvetica-Oblique' : 'Helvetica').fontSize(sz||8)
     .fillColor(c||G.txt)
     .text(s, x, y, { width: w, height: maxH || 200, lineBreak: true, ellipsis: false });
  // Resetear cursor a posición segura después del texto
  doc.text('', 0, y, { lineBreak: false });
}

function arrowDown(cx, y1, y2, c) {
  doc.moveTo(cx, y1).lineTo(cx, y2-6).lineWidth(2).strokeColor(c).stroke();
  doc.moveTo(cx-6, y2-6).lineTo(cx, y2).lineTo(cx+6, y2-6).lineWidth(2).strokeColor(c).stroke();
}

function stepBar(num, label, x, y, color) {
  RR(x, y, CW, 29, 5, color);
  doc.circle(x+19, y+14.5, 11).fill(G.white);
  B(String(num), x+14.5, y+8.5, 10, color, 10);
  B(label, x+36, y+9.5, CW-44, G.white, 9);
  return y + 29;
}

function quoteBox(lines, x, y, w, h, accent) {
  RR(x, y, w, h, 5, G.white);
  R(x, y, 5, h, accent);
  STR(x, y, w, h, 5, accent);
  lines.forEach((line, i) => {
    const isItal = line.startsWith('~');
    const text = isItal ? line.slice(1) : line;
    doc.font(isItal ? 'Helvetica-Oblique' : 'Helvetica').fontSize(8.5)
       .fillColor(G.dark)
       .text(text, x+11, y+8+i*13, { width: w-18, lineBreak: false, ellipsis: true });
  });
  doc.text('', 0, y, { lineBreak: false });
}

function infoBox(line1, line2, x, y, w, h, bg, border) {
  RR(x, y, w, h, 5, bg);
  STR(x, y, w, h, 5, border, 0.6);
  B(line1, x+10, y+9, w-18, border, 8);
  if (line2) T(line2, x+10, y+22, w-18, G.sub, 7.5, false, h-28);
  doc.text('', 0, y, { lineBreak: false });
}

function caseHeader(letter, label, x, y, color) {
  RR(x, y, CW, 18, 5, color);
  B(letter + '   ' + label, x+10, y+4.5, CW-18, G.white, 9);
}

function footer(pg) {
  R(0, H-22, W, 22, G.dark);
  B('SST COLOMBIA\u2122  \u00b7  sst.sagisas.co  \u00b7  Adriana D\u00edaz, CEO  \u00b7  SAGISAS SAS', M, H-14, 300, '#A8D8B9', 7.5);
  B('P\u00e1gina '+pg+' de 2  \u2014  Uso interno \u00b7 Equipo Comercial', W-175, H-14, 150, G.light, 7.5);
}

// ══════════════════════════════════════════════════════════════════════════
//  PÁGINA 1
// ══════════════════════════════════════════════════════════════════════════
R(0, 0, W, H, G.bg);

// Header
R(0, 0, W, 66, G.dark); R(0, 66, W, 4, G.light);
B('GU\u00cdA DE LLAMADAS  \u00b7  SST COLOMBIA\u2122', M, 12, CW, G.white, 18);
B('Objetivo: que el gerente acepte el PDF o agende los 10 minutos de demo', M, 37, CW, '#A8D8B9', 8.5);
B('Siga los pasos en orden \u00b7 Lea en voz alta antes de llamar', M, 51, CW, G.light, 8);

// Badges
const bgs = ['PESV \u00b7 Res. 40595', 'Res. 0312/2019', 'ISO 45001'];
let bx = W - M;
bgs.forEach(lb => {
  const pw = doc.font('Helvetica-Bold').fontSize(6.5).widthOfString(lb)+12;
  bx -= pw+4; RR(bx, 14, pw, 13, 5, G.mid);
  B(lb, bx+6, 17.5, pw-10, G.white, 6.5);
});

// Pre-call
RR(M, 78, CW, 20, 5, '#EAF7EE');
B('Antes de llamar tenga listo:', M+10, 87, 165, G.green, 8);
B('nombre del gerente  \u00b7  nombre empresa  \u00b7  sector', M+178, 87, CW-188, G.mid, 8);

// ── PASO 1 ────────────────────────────────────────────────────────────────
let y = 107;
y = stepBar(1, 'LLAME Y PIDA HABLAR CON EL GERENTE', M, y, G.green) + 8;

B('Diga exactamente esto:', M, y, CW, G.mid, 8); y += 12;
quoteBox([
  '~\u201cBuenos d\u00edas, mi nombre es [su nombre] de parte de Adriana D\u00edaz, CEO de SST Colombia.',
  '~\u00bfPor favor me comunica con el se\u00f1or / se\u00f1ora [nombre del gerente]?\u201d',
], M, y, CW, 38, G.green); y += 46;

infoBox(
  'Si le preguntan \u201c\u00bfPara qu\u00e9 es?\u201d:',
  '\u201cEs para confirmarle un asunto t\u00e9cnico sobre los informes que debe tener listos para el Ministerio del Trabajo. Es muy breve.\u201d',
  M, y, CW, 42, '#EAF7EE', G.light
); y += 50;

// Decisión 1
arrowDown(W/2, y, y+18, G.light); y += 18;
RR(W/2-96, y, 192, 21, 10, G.mid);
B('\u00bfLo comunican con el gerente?', W/2-88, y+6, 176, G.white, 9); y += 21+5;

// Dos bloques
const hw = (CW-8)/2;
arrowDown(M+hw/2, y, y+13, G.red);
arrowDown(M+hw+8+hw/2, y, y+13, G.green);

RR(M,      y+13, 52, 17, 8, G.red);   B('NO', M+17, y+17, 18, G.white, 8);
RR(M+hw+8+hw/2-26, y+13, 52, 17, 8, G.green); B('S\u00cd', M+hw+8+hw/2-11, y+17, 18, G.white, 8);
y += 32;

// Block NO
RR(M, y, hw, 110, 6, G.white); R(M, y, 6, 110, G.red); STR(M, y, hw, 110, 6, '#F87171');
B('No est\u00e1 disponible \u2014 diga esto:', M+12, y+9, hw-18, G.red, 8);
doc.font('Helvetica-Oblique').fontSize(8.2).fillColor(G.txt)
   .text('\u201cNo hay problema. \u00bfMe da su correo directo para enviarle un resumen t\u00e9cnico de 1 p\u00e1gina? O \u00bfa qu\u00e9 hora le recomiendan llamar?\u201d', M+12, y+23, { width: hw-20, lineBreak: true });
doc.text('', 0, y, { lineBreak: false });
B('\u2192 Anote el correo o la rellamada. Env\u00ede el PDF hoy.', M+12, y+78, hw-18, G.red, 7.5);

// Block SÍ
const yx = M+hw+8;
RR(yx, y, hw, 110, 6, '#EAF7EE'); R(yx, y, 6, 110, G.green); STR(yx, y, hw, 110, 6, G.pale);
B('\u00a1Lo pasaron! \u2014 respire y contin\u00fae con calma', yx+12, y+9, hw-18, G.green, 8);
const tips = ['Escuche m\u00e1s de lo que habla.','Use el nombre del gerente.','No enumere funciones: cuente c\u00f3mo resuelven su problema.','Solo busca que acepte el PDF o los 10 minutos.'];
tips.forEach((t,i) => {
  doc.circle(yx+16, y+28+i*19+4, 3).fill(G.light);
  B(t, yx+23, y+28+i*19, hw-32, G.txt, 7.5);
});
y += 118;

// ── PASO 2 ────────────────────────────────────────────────────────────────
arrowDown(W/2, y, y+16, G.light); y += 16;
y = stepBar(2, 'HABLE CON EL GERENTE \u2014 APERTURA (30 segundos)', M, y, G.mid) + 8;

B('Diga esto en voz calmada \u2014 haga una pausa larga despu\u00e9s de la \u00faltima pregunta:', M, y, CW, G.mid, 8); y += 12;
quoteBox([
  '~\u201cSe\u00f1or/Se\u00f1ora [nombre], buenos d\u00edas. Le habla [su nombre] de parte de Adriana D\u00edaz.',
  '~Ayudamos a empresas del sector a tener listos \u2014 con firma digital \u2014 los informes del',
  '~Ministerio del Trabajo y la Superintendencia de Transporte. Sin papeles, sin estr\u00e9s.',
  '~Le enviamos un mensaje hace unos d\u00edas. \u00bfPudo verlo?\u201d',
], M, y, CW, 60, G.mid); y += 68;

RR(M, y, CW, 22, 5, '#FFFBEB'); STR(M, y, CW, 22, 5, '#F59E0B');
B('\u23f8  Haga una pausa y espere. No llene el silencio. El gerente responder\u00e1.  \u2192  Pase a la P\u00e1gina 2.', M+12, y+7, CW-22, G.amber, 8.5);

footer('1');

// ══════════════════════════════════════════════════════════════════════════
//  PÁGINA 2
// ══════════════════════════════════════════════════════════════════════════
doc.addPage();
R(0, 0, W, H, G.bg);

R(0, 0, W, 42, G.dark); R(0, 42, W, 3, G.light);
B('GU\u00cdA DE LLAMADAS  \u00b7  P\u00e1gina 2  \u00b7  SST COLOMBIA\u2122', M, 9, CW, G.white, 11);
B('Qu\u00e9 hacer seg\u00fan la respuesta del gerente', M, 26, CW, '#A8D8B9', 8.5);

y = 55;
y = stepBar(3, 'RESPONDA SEG\u00daN LO QUE DIGA EL GERENTE', M, y, G.green) + 10;

// CASO A
caseHeader('A', '"S\u00ed lo vi" / "Me suena"', M, y, G.green); y += 18;
quoteBox([
  '~\u201c\u00a1Excelente! Lo llamamos justo para eso. \u00bfLe env\u00edo ahora el folleto de 1 p\u00e1gina?',
  '~Se lo mando a su correo en este momento para que lo vea con calma.\u201d',
], M, y, CW, 36, G.green); y += 44;
infoBox(
  'Si acepta el PDF \u2192',
  '\u201c\u00bfMe confirma su celular para avisarle por WhatsApp en cuanto lo env\u00ede?\u201d  \u2014  Enviar PDF hoy.',
  M, y, CW/2-4, 40, '#EAF7EE', G.green
);
infoBox(
  'Si quiere saber m\u00e1s \u2192',
  '\u201c\u00bfTiene 10 minutos esta semana? Le muestro c\u00f3mo funciona para su empresa.\u201d',
  M+CW/2+4, y, CW/2-4, 40, '#EAF7EE', G.green
); y += 48;

// CASO B
caseHeader('B', '"No lo vi" / "No me lleg\u00f3"', M, y, G.blue); y += 18;
quoteBox([
  '~\u201cNo se preocupe, es normal con el d\u00eda a d\u00eda. En 15 segundos: ayudamos a empresas',
  '~como la suya a generar solos los informes del Ministerio del Trabajo y la',
  '~Superintendencia de Transporte. \u00bfMe confirma su correo para enviarle el resumen?\u201d',
], M, y, CW, 46, G.blue); y += 54;
infoBox(
  'Cuando le den el correo:',
  'Rep\u00edtalo letra por letra para confirmar. Env\u00ede el PDF hoy mismo.',
  M, y, CW, 34, G.white, G.light
); y += 42;

// CASO C
caseHeader('C', '"Estoy ocupado/a" / "Ll\u00e1meme luego"', M, y, G.amber); y += 18;
quoteBox([
  '~\u201cClaro, le entiendo. No le quito ni un segundo m\u00e1s. \u00bfMe permite enviarle el',
  '~documento de 1 p\u00e1gina a su correo? Y \u00bfa qu\u00e9 hora le queda mejor que le marque?\u201d',
], M, y, CW, 36, G.amber); y += 44;
infoBox(
  'Anote el d\u00eda y la hora exacta.',
  'Marque puntual en esa fecha \u2014 la puntualidad genera confianza desde el primer contacto.',
  M, y, CW, 34, G.alight, G.amber
); y += 42;

// CASO D
caseHeader('D', '"No me interesa" / "Ya tenemos ARL / asesor"', M, y, G.purple); y += 18;
quoteBox([
  '~\u201cLe entiendo, y qu\u00e9 bueno que ya tienen eso cubierto. Nosotros no reemplazamos a',
  '~su ARL: hacemos algo diferente \u2014 generamos autom\u00e1ticamente los informes del',
  '~Ministerio del Trabajo y la Supertransporte, con firma digital. Sin papeleo.',
  '~\u00bfLe permito enviarle el documento de 1 p\u00e1gina para que lo conozca?\u201d',
], M, y, CW, 59, G.purple); y += 67;
infoBox(
  'Si acepta \u2192 enviar PDF. Si insiste en no:',
  '\u201cMuchas gracias por su tiempo \u2014 que tenga un excelente d\u00eda.\u201d  Cerrar siempre con amabilidad.',
  M, y, CW, 34, G.plight, G.purple
); y += 42;

// ── PASO 4 ────────────────────────────────────────────────────────────────
y = stepBar(4, 'DESPU\u00c9S DE CADA LLAMADA \u2014 3 acciones inmediatas', M, y, G.mid) + 10;

const acts = [
  ['1', 'Enviar el PDF',       'Si lo solicitaron: hacerlo en los pr\u00f3ximos 5 minutos. No al final del d\u00eda.'],
  ['2', 'Anotar el resultado', 'Empresa \u00b7 Nombre gerente \u00b7 Correo \u00b7 Resultado (PDF enviado / rellamada / no interesado).'],
  ['3', 'Agendar rellamada',   'Si qued\u00f3 en volver a llamar \u2014 ag\u00e9ndelo AHORA con nombre y tel\u00e9fono.'],
];
const sw = (CW-8)/3;
acts.forEach(([n, title, body], i) => {
  const sx = M + i*(sw+4);
  RR(sx, y, sw, 68, 6, G.white); R(sx, y, 6, 68, G.light); STR(sx, y, sw, 68, 6, G.pale);
  doc.circle(sx+21, y+18, 11).fill(G.green);
  B(n, sx+16.5, y+12, 10, G.white, 11);
  B(title, sx+10, y+32, sw-16, G.green, 8);
  T(body, sx+10, y+45, sw-16, G.sub, 7.5, false, 22);
});

footer('2');

// Finalizar — flushPages asegura exactamente las páginas que creamos
doc.flushPages();
doc.end();
console.log('PDF listo:', out);
