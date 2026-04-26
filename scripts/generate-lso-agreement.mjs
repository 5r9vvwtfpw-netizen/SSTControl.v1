import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUTPUT_PATH = './attached_assets/acuerdo-lso-hernan-valencia.pdf';

const GREEN = '#1e7e34';
const DARK = '#1a1a1a';
const GRAY = '#555555';
const LIGHT_GRAY = '#f5f5f5';
const BORDER_GRAY = '#dddddd';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 65, right: 65 },
  info: {
    Title: 'Acuerdo de Servicios LSO — Hernán Valencia Gil',
    Author: 'SAGDI S.A.S.',
    Subject: 'Acuerdo de Prestación de Servicios de Licenciado en SST',
  },
});

const stream = fs.createWriteStream(OUTPUT_PATH);
doc.pipe(stream);

const pageWidth = doc.page.width - 130; // margins

// ── HEADER ──────────────────────────────────────────────────────────────────
doc.rect(65, 60, pageWidth, 70).fill(GREEN);

doc.fontSize(18).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.', 85, 75);
doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.85)')
   .text('Sistema de Gestión SG-SST Colombia · NIT 902.036.337-4', 85, 97);
doc.fontSize(8).fillColor('rgba(255,255,255,0.75)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', 85, 111);

doc.moveDown(4.5);

// ── TITLE ───────────────────────────────────────────────────────────────────
doc.fontSize(14).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE PRESTACIÓN DE SERVICIOS', { align: 'center' });
doc.fontSize(11).font('Helvetica').fillColor(GRAY)
   .text('Licenciado en Seguridad y Salud en el Trabajo — Modelo por Nivel de Riesgo', { align: 'center' });

doc.moveDown(0.4);
doc.moveTo(65, doc.y).lineTo(65 + pageWidth, doc.y).strokeColor(BORDER_GRAY).lineWidth(1).stroke();
doc.moveDown(0.8);

// ── CIUDAD Y FECHA ───────────────────────────────────────────────────────────
const today = new Date();
const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const dateStr = `Medellín, ${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;
doc.fontSize(9).font('Helvetica').fillColor(GRAY).text(dateStr, { align: 'right' });
doc.moveDown(0.8);

// ── SECTION HELPER ───────────────────────────────────────────────────────────
function section(title, y) {
  doc.rect(65, doc.y, pageWidth, 20).fill('#eef6f0');
  doc.fontSize(10).font('Helvetica-Bold').fillColor(GREEN)
     .text(title, 75, doc.y - 17);
  doc.moveDown(0.2);
}

function body(text, indent = 0) {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(text, 65 + indent, doc.y, { width: pageWidth - indent, align: 'justify', lineGap: 2 });
  doc.moveDown(0.5);
}

// ── PARTES ───────────────────────────────────────────────────────────────────
section('PRIMERA — PARTES CONTRATANTES');
doc.moveDown(0.6);

body('Entre los suscritos, a saber:\n\n' +
     'LA CONTRATANTE: SAGDI S.A.S., sociedad debidamente constituida bajo las leyes colombianas, identificada con NIT 902.036.337-4, con domicilio en Colombia, representada para este acto por su representante legal, en adelante "LA EMPRESA".\n\n' +
     'EL CONTRATISTA: Hernán Valencia Gil, profesional en Seguridad y Salud en el Trabajo, con licencia en SST vigente expedida por la autoridad competente, en adelante "EL LICENCIADO".\n\n' +
     'Manifiestan que han acordado celebrar el presente Acuerdo de Prestación de Servicios, el cual se regirá por las siguientes cláusulas:');

doc.moveDown(0.3);

// ── OBJETO ───────────────────────────────────────────────────────────────────
section('SEGUNDA — OBJETO DEL ACUERDO');
doc.moveDown(0.6);
body('EL LICENCIADO se compromete a prestar sus servicios profesionales de Licenciado en Seguridad y Salud en el Trabajo a las empresas clientes de LA EMPRESA, utilizando exclusivamente la plataforma tecnológica SST Colombia (sst.sagisas.co) para la gestión, supervisión, firma digital de documentos y seguimiento del Sistema de Gestión SG-SST, de conformidad con la Resolución 0312 de 2019 y el Decreto 1072 de 2015.');

// ── MODELO DE SERVICIO ───────────────────────────────────────────────────────
section('TERCERA — MODELO DE SERVICIO');
doc.moveDown(0.6);
body('El servicio se prestará bajo la modalidad de LSO de Cabecera para el portafolio de empresas clientes de LA EMPRESA. Las responsabilidades de EL LICENCIADO incluyen:\n');
const items = [
  'Supervisión técnica del SG-SST de las empresas asignadas.',
  'Revisión y firma digital de investigaciones de accidentes e incidentes de trabajo.',
  'Validación de documentos técnicos que requieran firma de profesional licenciado.',
  'Atención de consultas técnicas de las empresas asignadas a través del sistema.',
  'Cumplimiento de los tiempos de respuesta establecidos por la normativa vigente.',
];
items.forEach(item => {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(`• ${item}`, 75, doc.y, { width: pageWidth - 10, lineGap: 2 });
  doc.moveDown(0.3);
});
doc.moveDown(0.2);
body('LA EMPRESA proveerá acceso completo a la plataforma SST Colombia, soporte técnico y la cartera de empresas clientes asignadas, sin que EL LICENCIADO deba gestionar, facturar o contactar directamente a dichos clientes para efectos comerciales.');

// ── TARIFAS ──────────────────────────────────────────────────────────────────
section('CUARTA — TARIFAS POR NIVEL DE RIESGO ARL');
doc.moveDown(0.6);
body('LA EMPRESA reconocerá a EL LICENCIADO una tarifa mensual fija por cada empresa activa asignada, de acuerdo con el nivel de riesgo ARL clasificado según el código CIIU, así:');
doc.moveDown(0.4);

// Table header
const col1 = 65, col2 = 185, col3 = 300, col4 = 415;
const rowH = 22;
let ty = doc.y;

doc.rect(col1, ty, pageWidth, rowH).fill(GREEN);
doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
   .text('Nivel de Riesgo', col1 + 8, ty + 7)
   .text('Actividades Típicas', col2 + 8, ty + 7)
   .text('Trabajadores Ref.', col3 + 8, ty + 7)
   .text('Tarifa Mensual/Empresa', col4 + 8, ty + 7);

const rows = [
  ['Nivel I — Bajo', 'Servicios financieros, comercio, oficinas', 'Hasta 10', '$ 120.000 COP'],
  ['Nivel II — Medio', 'Manufactura ligera, salud, educación', 'Hasta 50', '$ 200.000 COP'],
  ['Nivel III — Medio-Alto', 'Industria, transporte, construcción menor', 'Hasta 200', '$ 350.000 COP'],
  ['Nivel IV — Alto', 'Construcción, minería superficial, químicos', 'Hasta 500', '$ 550.000 COP'],
  ['Nivel V — Muy Alto', 'Minería subterránea, explosivos, alturas', 'Sin límite', '$ 800.000 COP'],
];

rows.forEach((row, i) => {
  ty += rowH;
  doc.rect(col1, ty, pageWidth, rowH).fill(i % 2 === 0 ? 'white' : LIGHT_GRAY);
  doc.rect(col1, ty, pageWidth, rowH).stroke(BORDER_GRAY).lineWidth(0.5);
  doc.fontSize(8.5).font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor(DARK)
     .text(row[0], col1 + 8, ty + 7)
     .text(row[1], col2 + 8, ty + 7, { width: 110 })
     .text(row[2], col3 + 8, ty + 7)
     .text(row[3], col4 + 8, ty + 7);
});

doc.y = ty + rowH + 10;
doc.moveDown(0.5);
body('Las tarifas anteriores serán revisadas y actualizadas de mutuo acuerdo entre las partes anualmente o cuando las condiciones del mercado así lo requieran. Estos valores son el ingreso neto para EL LICENCIADO, sin incluir impuestos que correspondan según la normativa tributaria vigente.');

// ── FORMA DE PAGO ────────────────────────────────────────────────────────────
section('QUINTA — FORMA Y PERIODICIDAD DE PAGO');
doc.moveDown(0.6);
body('LA EMPRESA liquidará mensualmente el total de honorarios correspondientes a EL LICENCIADO, con base en el número de empresas activas asignadas al cierre de cada mes calendario. El pago se realizará dentro de los primeros cinco (5) días hábiles del mes siguiente, mediante transferencia bancaria a la cuenta que EL LICENCIADO designe por escrito.\n\nLA EMPRESA generará un comprobante detallado de la liquidación mensual, especificando el listado de empresas atendidas, su nivel de riesgo y la tarifa aplicada.');

// ── OBLIGACIONES ─────────────────────────────────────────────────────────────
section('SEXTA — OBLIGACIONES DE LAS PARTES');
doc.moveDown(0.6);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK).text('Obligaciones de EL LICENCIADO:', 65, doc.y);
doc.moveDown(0.3);
['Mantener vigente su licencia en SST durante toda la vigencia del acuerdo.',
 'Responder las solicitudes de las empresas asignadas en un plazo máximo de 48 horas hábiles.',
 'Firmar los documentos técnicos requeridos dentro de los plazos legales establecidos.',
 'Mantener confidencialidad sobre la información de los clientes de LA EMPRESA.',
 'Utilizar exclusivamente la plataforma SST Colombia para la gestión de las empresas asignadas.',
].forEach(item => {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(`• ${item}`, 75, doc.y, { width: pageWidth - 10, lineGap: 2 });
  doc.moveDown(0.3);
});

doc.moveDown(0.3);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK).text('Obligaciones de LA EMPRESA:', 65, doc.y);
doc.moveDown(0.3);
['Proveer acceso permanente a la plataforma SST Colombia con perfil LSO.',
 'Asignar las empresas clientes de forma ordenada, respetando la capacidad del LICENCIADO.',
 'Realizar los pagos en los términos pactados en la cláusula quinta.',
 'Notificar con mínimo 15 días de anticipación cualquier cambio en las tarifas o condiciones.',
 'Brindar soporte técnico sobre el uso de la plataforma cuando sea requerido.',
].forEach(item => {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(`• ${item}`, 75, doc.y, { width: pageWidth - 10, lineGap: 2 });
  doc.moveDown(0.3);
});

// ── NATURALEZA DEL ACUERDO ───────────────────────────────────────────────────
section('SÉPTIMA — NATURALEZA DEL ACUERDO');
doc.moveDown(0.6);
body('El presente acuerdo es de naturaleza civil y comercial, de prestación de servicios independiente. No genera relación laboral alguna entre las partes. EL LICENCIADO actuará como contratista independiente y será responsable del pago de sus propias obligaciones tributarias y de seguridad social conforme a la legislación colombiana vigente.');

// ── DURACIÓN ─────────────────────────────────────────────────────────────────
section('OCTAVA — DURACIÓN Y TERMINACIÓN');
doc.moveDown(0.6);
body('El presente acuerdo tendrá una duración inicial de doce (12) meses contados a partir de la fecha de suscripción, renovándose automáticamente por períodos iguales, salvo que cualquiera de las partes manifieste por escrito su intención de no renovarlo con un mínimo de treinta (30) días de anticipación.\n\nCualquiera de las partes podrá dar por terminado el acuerdo de forma anticipada, sin lugar a indemnización, mediante comunicación escrita con treinta (30) días de antelación. En caso de incumplimiento grave de las obligaciones pactadas, la terminación podrá ser inmediata.');

// ── FIRMAS ───────────────────────────────────────────────────────────────────
doc.moveDown(0.5);
doc.moveTo(65, doc.y).lineTo(65 + pageWidth, doc.y).strokeColor(BORDER_GRAY).lineWidth(0.5).stroke();
doc.moveDown(1);

doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('EN FE DE LO ANTERIOR, las partes suscriben el presente acuerdo en señal de aceptación:', { align: 'center' });
doc.moveDown(1.5);

// Signature boxes
const sigW = (pageWidth - 30) / 2;
const sigY = doc.y;

// Left sig
doc.rect(65, sigY, sigW, 80).stroke(BORDER_GRAY).lineWidth(0.5);
doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', 65, sigY + 55, { width: sigW, align: 'center' });
doc.fontSize(8.5).font('Helvetica').fillColor(GRAY)
   .text('SAGDI S.A.S.', 65, sigY + 67, { width: sigW, align: 'center' });

// Right sig
doc.rect(65 + sigW + 30, sigY, sigW, 80).stroke(BORDER_GRAY).lineWidth(0.5);
doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK)
   .text('EL LICENCIADO', 65 + sigW + 30, sigY + 55, { width: sigW, align: 'center' });
doc.fontSize(8.5).font('Helvetica').fillColor(GRAY)
   .text('Hernán Valencia Gil — LSO', 65 + sigW + 30, sigY + 67, { width: sigW, align: 'center' });

doc.y = sigY + 90;
doc.moveDown(0.5);

// ── FOOTER ───────────────────────────────────────────────────────────────────
doc.moveTo(65, doc.y).lineTo(65 + pageWidth, doc.y).strokeColor(BORDER_GRAY).lineWidth(0.5).stroke();
doc.moveDown(0.4);
doc.fontSize(7.5).font('Helvetica').fillColor('#aaaaaa')
   .text('SAGDI S.A.S. · NIT 902.036.337-4 · admin@sst-colombia.com · sst.sagisas.co', { align: 'center' });
doc.fontSize(7.5).fillColor('#aaaaaa')
   .text('Documento generado por SST Colombia — Plataforma de Gestión SG-SST', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log(`PDF generado: ${OUTPUT_PATH}`);
});
