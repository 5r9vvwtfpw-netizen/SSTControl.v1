const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
const out = path.join(__dirname, '..', 'guia-llamadas-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(out));

const W = 595.28;
const H = 841.89;
const M = 28;
const CW = W - M * 2;

// Palette
const G = {
  dark: '#0B2218', green: '#1A4232', mid: '#2D6A4F', light: '#52B788',
  pale: '#D8F3DC', white: '#FFFFFF', bg: '#F8FAF9', txt: '#17291F',
  sub: '#3A5A47', red: '#B91C1C', rlight: '#FEF2F2',
  amber: '#92400E', alight: '#FFFBEB',
};

// ─── helpers ────────────────────────────────────────────────────────────────
const R = (x, y, w, h, c) => doc.rect(x, y, w, h).fill(c);
const RR = (x, y, w, h, r, c) => doc.roundedRect(x, y, w, h, r).fill(c);
const stroke = (x, y, w, h, r, c, lw) =>
  doc.roundedRect(x, y, w, h, r).lineWidth(lw || 0.8).strokeColor(c).stroke();
const B = (s, x, y, w, c, sz) =>
  doc.font('Helvetica-Bold').fontSize(sz || 9).fillColor(c || G.txt)
     .text(s, x, y, { width: w, lineBreak: false });
const T = (s, x, y, w, c, sz, italic) =>
  doc.font(italic ? 'Helvetica-Oblique' : 'Helvetica').fontSize(sz || 9)
     .fillColor(c || G.txt).text(s, x, y, { width: w, lineBreak: true });
const lineV = (x, y1, y2, c) =>
  doc.moveTo(x, y1).lineTo(x, y2).lineWidth(2).strokeColor(c).stroke();
const arrowD = (cx, y1, y2, c) => {
  lineV(cx, y1, y2 - 6, c);
  doc.moveTo(cx - 6, y2 - 6).lineTo(cx, y2).lineTo(cx + 6, y2 - 6)
     .lineWidth(2).strokeColor(c).stroke();
};

// Step number circle + label bar
function stepBar(num, label, x, y, w, color) {
  RR(x, y, w, 30, 5, color);
  doc.circle(x + 20, y + 15, 12).fill(G.white);
  B(String(num), x + 15.5, y + 9, 12, color, 11);
  B(label, x + 38, y + 10, w - 48, G.white, 9.5);
  return y + 30;
}

// Quote box with left bar
function quoteBox(text, x, y, w, h, accent) {
  RR(x, y, w, h, 5, G.white);
  R(x, y, 5, h, accent);
  stroke(x, y, w, h, 5, accent);
  T('\u201c' + text + '\u201d', x + 12, y + 8, w - 20, G.dark, 8.5, true);
}

// YES / NO badge
function badge(text, x, y, bg, tc) {
  RR(x, y, 52, 18, 9, bg);
  B(text, x + 6, y + 4.5, 40, tc || G.white, 8);
}

// Info tip box
function tipBox(text, x, y, w, h, bg, accent) {
  RR(x, y, w, h, 5, bg);
  stroke(x, y, w, h, 5, accent, 0.6);
  T(text, x + 10, y + 8, w - 18, G.sub, 8);
}

// Outcome block (wide, simple)
function outcomeBlock(title, body, x, y, w, h, accent, bg) {
  RR(x, y, w, h, 6, bg);
  R(x, y, 6, h, accent);
  stroke(x, y, w, h, 6, accent);
  B(title, x + 14, y + 9, w - 22, accent, 8.5);
  T(body, x + 14, y + 24, w - 22, G.txt, 8);
}

function footer(pg) {
  R(0, H - 22, W, 22, G.dark);
  B('SST COLOMBIA\u2122  \u00b7  sst.sagisas.co  \u00b7  Adriana D\u00edaz, CEO', M, H - 14, 260, '#A8D8B9', 7.5);
  B('P\u00e1gina ' + pg + ' de 2  \u2014  Uso interno \u00b7 Equipo Comercial', W - 180, H - 14, 155, G.light, 7.5);
}

// ════════════════════════════════════════════════════════════════════════════
//  PÁGINA 1
// ════════════════════════════════════════════════════════════════════════════
R(0, 0, W, H, G.bg);

// Header
R(0, 0, W, 70, G.dark);
R(0, 70, W, 4, G.light);
B('GU\u00cdA DE LLAMADAS  \u00b7  SST COLOMBIA\u2122', M, 14, CW, G.white, 18);
T('Objetivo: conseguir que el gerente acepte el PDF o agende los 10 minutos de demo', M, 42, CW, '#A8D8B9', 8.5);
T('Siga los pasos en orden. Lea en voz alta antes de llamar.', M, 55, CW, G.light, 8);

// Pre-call strip
RR(M, 84, CW, 24, 5, '#EAF7EE');
B('Antes de llamar tenga listo: ', M + 10, 93, 170, G.green, 8);
T('nombre del gerente  \u00b7  nombre de la empresa  \u00b7  sector de la empresa', M + 180, 93, CW - 190, G.mid, 8);

let y = 120;

// ── PASO 1 ──────────────────────────────────────────────────────────────────
y = stepBar(1, 'LLAME Y PIDA HABLAR CON EL GERENTE', M, y, CW, G.green) + 10;

T('Diga exactamente esto a quien conteste el tel\u00e9fono:', M, y, CW, G.mid, 8);
y += 14;
quoteBox(
  'Buenos d\u00edas, mi nombre es [su nombre] de parte de Adriana D\u00edaz, CEO de SST Colombia. ' +
  '\u00bfPor favor me comunica con el se\u00f1or / se\u00f1ora [nombre del gerente]?',
  M, y, CW, 52, G.green
);
y += 60;

// Si preguntan
tipBox(
  'Si le preguntan \u201c\u00bfPara qu\u00e9 es?\u201d:  Responda \u2192  \u201cEs para confirmarle un asunto t\u00e9cnico sobre los informes ' +
  'que debe tener listos para el Ministerio del Trabajo. Es muy breve.\u201d',
  M, y, CW, 36, '#EAF7EE', G.light
);
y += 44;

// Decision: ¿Lo pasan?
arrowD(W / 2, y, y + 20, G.light);
y += 20;
RR(W / 2 - 88, y, 176, 22, 11, G.mid);
B('\u00bfLo comunican con el gerente?', W / 2 - 80, y + 6.5, 160, G.white, 9);
y += 22 + 6;

// Two outcomes side by side
const hw = (CW - 10) / 2;

// NO
arrowD(M + hw / 2, y, y + 14, G.red);
badge('NO', M + hw / 2 - 26, y + 14, G.red);
y += 35;
outcomeBlock(
  'No est\u00e1 disponible \u2014 deje este mensaje:',
  '\u201cNo hay problema. \u00bfMe podr\u00eda dar su correo directo para enviarle un documento t\u00e9cnico de 1 p\u00e1gina? ' +
  'O si prefiere, \u00bfa qu\u00e9 hora me recomienda llamar para encontrarle?\u201d\n\n' +
  '\u2192 Anote el correo o el d\u00eda/hora de rellamada. Env\u00ede el PDF hoy mismo.',
  M, y, hw, 90, G.red, G.rlight
);

// SÍ
arrowD(M + hw + 10 + hw / 2, y - 35 + 22 - 22, y - 35 + 22 - 22 + 14, G.green);
badge('S\u00cd', M + hw + 10 + hw / 2 - 26, y - 35 + 22 - 22 + 14, G.green);
outcomeBlock(
  '\u00a1Lo pasaron! \u2014 Vaya al Paso 2 (abajo)',
  'Respire, sonr\u00eda y contin\u00fae. Tiene algo de valor que ofrecerle.\n\n' +
  'Recuerde: escuche m\u00e1s de lo que habla. Use su nombre al inicio de cada frase.',
  M + hw + 10, y, hw, 90, G.green, '#EAF7EE'
);

y += 100;

// ── PASO 2 ──────────────────────────────────────────────────────────────────
arrowD(W / 2, y, y + 16, G.light);
y += 16;
y = stepBar(2, 'HABLE CON EL GERENTE \u2014 APERTURA (30 segundos)', M, y, CW, G.mid) + 10;

T('Diga esto \u2014 lento, claro, con pausa despu\u00e9s de la \u00faltima pregunta:', M, y, CW, G.mid, 8);
y += 14;
quoteBox(
  'Se\u00f1or/Se\u00f1ora [nombre], buenos d\u00edas. Le habla [su nombre] de parte de Adriana D\u00edaz. ' +
  'Muy breve: ayudamos a empresas como la suya a tener listos \u2014 de forma autom\u00e1tica y con firma digital \u2014 ' +
  'los informes del Ministerio del Trabajo y la Superintendencia de Transporte. Sin papeles, sin estr\u00e9s. ' +
  'Le enviamos un mensaje hace unos d\u00edas. \u00bfPudo verlo?',
  M, y, CW, 68, G.mid
);
y += 76;

// Pause tip
RR(M, y, CW, 22, 5, '#FFF8E1');
stroke(M, y, CW, 22, 5, '#F59E0B');
B('\u23f8 Haga una pausa y espere. No llene el silencio. El gerente responder\u00e1.  \u2192  Pase a la P\u00e1gina 2.', M + 12, y + 7, CW - 20, G.amber, 8);

footer('1');

// ════════════════════════════════════════════════════════════════════════════
//  PÁGINA 2
// ════════════════════════════════════════════════════════════════════════════
doc.addPage();
R(0, 0, W, H, G.bg);

R(0, 0, W, 44, G.dark);
R(0, 44, W, 3, G.light);
B('GU\u00cdA DE LLAMADAS  \u00b7  P\u00e1gina 2  \u00b7  SST COLOMBIA\u2122', M, 10, CW, G.white, 12);
T('Respuestas posibles del gerente \u2014 qu\u00e9 hacer en cada caso', M, 27, CW, '#A8D8B9', 8.5);

y = 58;
y = stepBar(3, 'RESPONDA SEG\u00daN LO QUE DIGA EL GERENTE', M, y, CW, G.green) + 14;

// ── CASO A ───────────────────────────────────────────────────────────────────
RR(M, y, CW, 18, 5, G.green);
B('CASO A  \u2014  Dice: \u201cS\u00ed lo vi\u201d  o  \u201cMe suena\u201d', M + 10, y + 4.5, CW - 18, G.white, 9);
y += 18;
quoteBox(
  '\u00a1Excelente! Lo llamamos justo para eso. \u00bfLe env\u00edo ahora el folleto de 1 p\u00e1gina para que vea ' +
  'c\u00f3mo funciona? Se lo mando a su correo en este momento.',
  M, y, CW, 46, G.green
);
y += 54;
tipBox(
  'Si acepta \u2192  \u201c\u00bfMe confirma su celular para avisarle por WhatsApp en cuanto lo env\u00ede?\u201d  \u2014  Enviar PDF hoy.\n' +
  'Si quiere saber m\u00e1s \u2192  \u201c\u00bfTiene 10 minutos esta semana para una videollamada? Le muestro c\u00f3mo funciona para su empresa.\u201d',
  M, y, CW, 46, '#EAF7EE', G.green
);
y += 54;

// ── CASO B ───────────────────────────────────────────────────────────────────
RR(M, y, CW, 18, 5, '#1A4F8A');
B('CASO B  \u2014  Dice: \u201cNo lo vi\u201d  o  \u201cNo me lleg\u00f3\u201d', M + 10, y + 4.5, CW - 18, G.white, 9);
y += 18;
quoteBox(
  'No se preocupe \u2014 es normal con el d\u00eda a d\u00eda. Se lo resumo en 15 segundos: ' +
  'ayudamos a empresas como la suya a que los informes del Ministerio del Trabajo queden generados solos, ' +
  'con firma digital, sin papeles. \u00bfMe confirma su correo para enviarle el resumen de 1 p\u00e1gina ahora mismo?',
  M, y, CW, 58, '#1A4F8A'
);
y += 66;
tipBox(
  'Cuando le den el correo: rep\u00edtalo letra por letra para confirmar. Env\u00ede el PDF hoy mismo.',
  M, y, CW, 28, G.bg, G.light
);
y += 36;

// ── CASO C ───────────────────────────────────────────────────────────────────
RR(M, y, CW, 18, 5, G.amber);
B('CASO C  \u2014  Dice: \u201cEstoy ocupado\u201d  o  \u201cLl\u00e1meme luego\u201d', M + 10, y + 4.5, CW - 18, G.white, 9);
y += 18;
quoteBox(
  'Claro, le entiendo. No le quito ni un segundo m\u00e1s. \u00bfMe permite enviarle el documento de 1 p\u00e1gina ' +
  'a su correo para que lo tenga a la mano? Y \u00bfa qu\u00e9 hora le queda mejor que le marque esta semana?',
  M, y, CW, 52, G.amber
);
y += 60;
tipBox(
  'Anote el d\u00eda y la hora exacta que le indique. Marque puntual \u2014 eso genera confianza.',
  M, y, CW, 28, G.alight, G.amber
);
y += 36;

// ── CASO D ───────────────────────────────────────────────────────────────────
RR(M, y, CW, 18, 5, '#4A235A');
B('CASO D  \u2014  Dice: \u201cNo me interesa\u201d  o  \u201cYa tenemos ARL / asesor\u201d', M + 10, y + 4.5, CW - 18, G.white, 9);
y += 18;
quoteBox(
  'Le entiendo, y qu\u00e9 bueno que ya tienen eso cubierto. Nosotros no reemplazamos a su ARL ni a su asesor \u2014 ' +
  'lo que hacemos es diferente: generamos autom\u00e1ticamente los informes para el Ministerio del Trabajo y la ' +
  'Superintendencia de Transporte, con firma digital. \u00bfLe permito enviarle el documento de 1 p\u00e1gina para que lo conozca?',
  M, y, CW, 64, '#4A235A'
);
y += 72;
tipBox(
  'Si acepta: enviar PDF. Si insiste en no: \u201cMuchas gracias por su tiempo \u2014 que tenga un excelente d\u00eda.\u201d  Cerrar con amabilidad.',
  M, y, CW, 28, '#F5EEF8', '#4A235A'
);
y += 36;

// ── PASO 4: DESPUÉS DE LA LLAMADA ─────────────────────────────────────────
y = stepBar(4, 'DESPU\u00c9S DE CADA LLAMADA \u2014 3 acciones inmediatas', M, y, CW, G.mid) + 10;

const steps4 = [
  ['1', 'Enviar el PDF', 'Si lo solicitaron \u2014 hacerlo en los pr\u00f3ximos 5 minutos. No espere al final del d\u00eda.'],
  ['2', 'Anotar el resultado', 'Empresa \u00b7 Nombre del gerente \u00b7 Correo \u00b7 Resultado (PDF enviado / rellamada / no interesado).'],
  ['3', 'Programar la rellamada', 'Si qued\u00f3 en volver a llamar \u2014 ag\u00e9ndelo ahora en su calendario con nombre y tel\u00e9fono.'],
];

const sw = (CW - 10) / 3;
steps4.forEach(([num, title, body], i) => {
  const sx = M + i * (sw + 5);
  RR(sx, y, sw, 70, 6, G.white);
  R(sx, y, 6, 70, G.light);
  stroke(sx, y, sw, 70, 6, G.pale);
  doc.circle(sx + 22, y + 18, 12).fill(G.green);
  B(num, sx + 17.5, y + 11.5, 10, G.white, 11);
  B(title, sx + 12, y + 33, sw - 18, G.green, 8);
  T(body, sx + 12, y + 46, sw - 18, G.sub, 7.5);
});

footer('2');

doc.end();
console.log('PDF listo:', out);
