import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/acuerdo-lso-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DARK  = '#1a1a1a';
const GRAY  = '#777777';
const LGRAY = '#eef6ef';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 42, bottom: 36, left: 42, right: 42 },
  bufferPages: true,
  info: { Title: 'Acuerdo de Servicios — Profesional SST', Author: 'SAGDI S.A.S.' },
});
doc.pipe(fs.createWriteStream(OUT));

const PW = doc.page.width;   // 612
const PH = doc.page.height;  // 792
const ML = 42, MR = 42, MT = 42, MB = 36;
const W  = PW - ML - MR;     // 528
const L  = ML;

const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

// ──────────────────────────────────────────────────────────────────
// HELPER: cursor manual (columnas)
// ──────────────────────────────────────────────────────────────────
const CG = 12;                  // gap entre columnas
const CW = (W - CG) / 2;       // ancho de cada columna  ≈ 258
const C1 = L;                   // columna izquierda x
const C2 = L + CW + CG;        // columna derecha x

let col = 0;      // 0=izq, 1=der
let cy  = 0;      // y actual dentro de la columna activa
const colTop = () => 0; // se asigna después del encabezado

let colStart = 0; // y donde empieza la zona de columnas

const cx  = () => col === 0 ? C1 : C2;
const cw  = () => CW;

// ── Escribe texto en la columna actual; retorna la nueva cy ───────
function txt(str, opts = {}) {
  const x = cx();
  const w = cw();
  const absY = colStart + cy;
  doc.text(str, x, absY, { width: w, ...opts });
  cy = doc.y - colStart;
}

function gap(pts) { cy += pts; }

function sect(n, t) {
  gap(3);
  const absY = colStart + cy;
  doc.rect(cx(), absY, cw(), 13).fill(LGRAY);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(GREEN)
     .text(`${n} — ${t}`, cx() + 5, absY + 3, { width: cw() - 8, lineBreak: false });
  cy += 16;
}

function p(str) {
  doc.fontSize(7.5).font('Helvetica').fillColor(DARK);
  txt(str, { align: 'justify', lineGap: 0.5 });
  gap(2);
}

function bul(str) {
  const x = cx() + 7;
  const w = cw() - 7;
  const absY = colStart + cy;
  doc.fontSize(7.5).font('Helvetica').fillColor(DARK)
     .text(`\u2022  ${str}`, x, absY, { width: w, lineGap: 0.5 });
  cy = doc.y - colStart + 1.5;
}

function lbl(str) {
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(DARK);
  txt(str, { lineBreak: false });
  gap(1.5);
}

function hline(color = '#cccccc', lw = 0.5) {
  const absY = colStart + cy;
  doc.moveTo(cx(), absY).lineTo(cx() + cw(), absY)
     .strokeColor(color).lineWidth(lw).stroke();
  gap(3);
}

// Cambia a la siguiente columna (o nueva página)
function nextCol() {
  col = 1;
  cy  = 0;
}

// ═══════════════════════════════════════════════════════════════════
// ENCABEZADO (full-width, fuera de columnas)
// ═══════════════════════════════════════════════════════════════════
doc.rect(L, MT, W, 42).fill(GREEN);
doc.fontSize(13).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.', L + 10, MT + 7, { lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor('white')
   .text('Sistema de Gestión SG-SST Colombia  ·  NIT 902.036.337-4', L + 10, MT + 22, { lineBreak: false });
doc.fontSize(7).fillColor('rgba(255,255,255,0.8)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', L + 10, MT + 32, { lineBreak: false });

// Título centrado
const titleY = MT + 48;
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE PRESTACIÓN DE SERVICIOS', L, titleY, { width: W, align: 'center', lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
   .text(
     `Profesional en Seguridad y Salud en el Trabajo  ·  Modelo Tarifario por Nivel de Riesgo  ·  ` +
     `Medellín, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`,
     L, titleY + 13, { width: W, align: 'center', lineBreak: false }
   );
doc.moveTo(L, titleY + 23).lineTo(L + W, titleY + 23)
   .strokeColor('#aaaaaa').lineWidth(0.6).stroke();

colStart = titleY + 28;
cy = 0;

// ═══════════════════════════════════════════════════════════════════
// COLUMNA IZQUIERDA  (col=0)
// ═══════════════════════════════════════════════════════════════════
col = 0; cy = 0;

sect('PRIMERA', 'PARTES CONTRATANTES');
p('LA CONTRATANTE: SAGDI S.A.S., NIT 902.036.337-4, en adelante "LA EMPRESA".');
p('EL CONTRATISTA: Hernán Valencia Gil, Profesional en SST con licencia vigente (Res. 4927/2016 Min. Trabajo), en adelante "EL PROFESIONAL".');
p('Acuerdan celebrar el presente contrato bajo las siguientes cláusulas:');

sect('SEGUNDA', 'OBJETO');
p('EL PROFESIONAL prestará servicios en SST a las empresas clientes de LA EMPRESA usando la plataforma SST Colombia (sst.sagisas.co), en cumplimiento de la Res. 0312/2019 y Decreto 1072/2015.');

sect('TERCERA', 'MODELO DE SERVICIO');
p('Modalidad Profesional SST de Cabecera. Responsabilidades:');
bul('Supervisión técnica del SG-SST de las empresas asignadas.');
bul('Revisión y firma digital de investigaciones de accidentes.');
bul('Validación de documentos que requieran firma de profesional SST.');
bul('Atención de consultas en máximo 48 horas hábiles.');
gap(1);
p('LA EMPRESA proveerá acceso a la plataforma, soporte técnico y la cartera de clientes.');

sect('CUARTA', 'TARIFAS POR NIVEL DE RIESGO ARL');
p('Tarifa mensual fija por empresa activa asignada según nivel CIIU (Res. 0312/2019):');
gap(2);

// Tabla dentro de columna
const tcw = [88, 92, 42, 36];           // anchos columnas tabla
const tcx = [cx(), cx()+88, cx()+180, cx()+222]; // x absolutas
const trh = 13;
let   try_ = colStart + cy;

doc.rect(cx(), try_, cw(), trh).fill(GREEN);
['Nivel','Actividades','Trab.','Tarifa'].forEach((h, i) => {
  doc.fontSize(7).font('Helvetica-Bold').fillColor('white')
     .text(h, tcx[i] + 2, try_ + 3, { width: tcw[i] - 2, lineBreak: false });
});
try_ += trh;

const filas = [
  ['I — Bajo',        'Oficinas, comercio, finanzas',             '≤10',   '$200k'],
  ['II — Medio',      'Manufactura, salud, educación',            '≤50',   '$300k'],
  ['III — Med-Alto',  'Industria, transporte, construcción',      '≤200',  '$400k'],
  ['IV — Alto',       'Construcción, minería superficial',        '≤500',  '$500k'],
  ['V — Muy Alto',    'Minería subterránea, explosivos',          'Ilim.', '$600k'],
];
filas.forEach((row, ri) => {
  doc.rect(cx(), try_, cw(), trh).fill(ri % 2 === 0 ? 'white' : '#f3faf4');
  doc.rect(cx(), try_, cw(), trh).strokeColor('#dddddd').lineWidth(0.3).stroke();
  row.forEach((cell, ci) => {
    doc.fontSize(7).font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor(DARK)
       .text(cell, tcx[ci] + 2, try_ + 3, { width: tcw[ci] - 2, lineBreak: false });
  });
  try_ += trh;
});
cy = try_ - colStart + 3;
p('Valores netos para EL PROFESIONAL, revisables anualmente. No incluyen obligaciones tributarias.');

// ═══════════════════════════════════════════════════════════════════
// COLUMNA DERECHA  (col=1)
// ═══════════════════════════════════════════════════════════════════
nextCol();

sect('QUINTA', 'FORMA DE PAGO');
p('LA EMPRESA liquidará mensualmente los honorarios dentro de los primeros 5 días hábiles del mes siguiente, por transferencia bancaria. Entregará comprobante detallado con listado de empresas y tarifas aplicadas.');

sect('SEXTA', 'OBLIGACIONES');
lbl('EL PROFESIONAL:');
bul('Mantener vigente su licencia SST durante la vigencia del acuerdo.');
bul('Firmar documentos técnicos dentro de los plazos legales.');
bul('Guardar confidencialidad sobre la información de los clientes.');
bul('Usar exclusivamente la plataforma SST Colombia.');
gap(2);
lbl('LA EMPRESA:');
bul('Proveer acceso a la plataforma con perfil Profesional SST.');
bul('Asignar empresas respetando la capacidad operativa acordada.');
bul('Pagar en los términos pactados. Notificar cambios con 15 días.');
bul('Brindar soporte técnico sobre el uso de la plataforma.');

sect('SÉPTIMA', 'NATURALEZA JURÍDICA');
p('Contrato de prestación de servicios independiente. No genera relación laboral. EL PROFESIONAL es responsable de sus propias obligaciones tributarias y de seguridad social conforme a la legislación vigente.');

sect('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
p('Duración inicial de 12 meses, prorrogable automáticamente. Cualquier parte puede terminar con 30 días de preaviso escrito. En caso de incumplimiento grave, la terminación es inmediata.');

// ─── LÍNEA SEPARADORA FIRMAS ─────────────────────────────────────
gap(6);
hline('#aaaaaa', 0.6);

// Texto firmas
doc.fontSize(8).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben:', cx(), colStart + cy, { width: cw(), align: 'center', lineBreak: false });
cy += 12;

// Dos cuadros de firma dentro de la columna derecha (stacked, uno arriba otro abajo)
const bsw = cw();
const bsh = 48;
const bs1y = colStart + cy;
const bsMid = cx() + bsw / 2;

// Dividir la columna en 2 mitades para firmas
const hw = (cw() - 8) / 2;
const hx1 = cx();
const hx2 = cx() + hw + 8;

doc.rect(hx1, bs1y, hw, bsh).stroke('#bbbbbb').lineWidth(0.5);
doc.rect(hx2, bs1y, hw, bsh).stroke('#bbbbbb').lineWidth(0.5);
doc.fontSize(7.5).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', hx1, bs1y + 31, { width: hw, align: 'center', lineBreak: false })
   .text('EL PROFESIONAL', hx2, bs1y + 31, { width: hw, align: 'center', lineBreak: false });
doc.fontSize(7).font('Helvetica').fillColor(GRAY)
   .text('SAGDI S.A.S. · NIT 902.036.337-4', hx1, bs1y + 39, { width: hw, align: 'center', lineBreak: false })
   .text('Hernán Valencia Gil', hx2, bs1y + 39, { width: hw, align: 'center', lineBreak: false });
cy += bsh + 5;

// Footer de columna derecha
hline('#cccccc', 0.3);
doc.fontSize(6.5).font('Helvetica').fillColor('#aaaaaa')
   .text('SAGDI S.A.S. · NIT 902.036.337-4 · admin@sst-colombia.com · sst.sagisas.co',
         cx(), colStart + cy, { width: cw(), align: 'center', lineBreak: false });

// ─── LÍNEA DIVISORIA ENTRE COLUMNAS (página 1) ───────────────────
// Dibujamos la línea divisoria después de saber el alto de ambas columnas
// La línea va de colStart hasta el fondo del contenido de la col más alta
// (aprox. hasta donde esté el pie de página)

doc.end();
doc.on('end', () => console.log('PDF generado:', OUT));
