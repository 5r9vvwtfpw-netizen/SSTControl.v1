import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUTPUT_PATH = './attached_assets/acuerdo-lso-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DARK = '#1a1a1a';
const GRAY = '#555555';
const LIGHT = '#f0f7f1';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 65, right: 65 },
  autoFirstPage: true,
  info: {
    Title: 'Acuerdo de Servicios LSO — Hernán Valencia Gil',
    Author: 'SAGDI S.A.S.',
  },
});

const stream = fs.createWriteStream(OUTPUT_PATH);
doc.pipe(stream);

const W = doc.page.width - 130;
const L = 65;

const today = new Date();
const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const dateStr = `Medellín, ${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;

// ── CABECERA ─────────────────────────────────────────────────────────────────
doc.rect(L, 55, W, 65).fill(GREEN);
doc.fontSize(17).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.', L + 15, 67, { width: W });
doc.fontSize(9).font('Helvetica').fillColor('white')
   .text('Sistema de Gestión SG-SST · NIT 902.036.337-4', L + 15, 88, { width: W });
doc.fontSize(8).fillColor('rgba(255,255,255,0.8)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', L + 15, 103, { width: W });

doc.y = 135;

// ── TÍTULO ───────────────────────────────────────────────────────────────────
doc.fontSize(14).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE PRESTACIÓN DE SERVICIOS', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').fillColor(GRAY)
   .text('Licenciado en Seguridad y Salud en el Trabajo — Modelo por Nivel de Riesgo', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.3);
doc.fontSize(8.5).fillColor(GRAY).text(dateStr, L, doc.y, { width: W, align: 'right' });
doc.moveDown(0.5);
doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.8).stroke();
doc.moveDown(0.8);

// ── HELPERS ───────────────────────────────────────────────────────────────────
function sectionTitle(num, title) {
  doc.moveDown(0.3);
  doc.rect(L, doc.y, W, 18).fill(LIGHT);
  const sy = doc.y + 4;
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(GREEN)
     .text(`${num} — ${title}`, L + 8, sy, { width: W - 16 });
  doc.y = sy + 18;
  doc.moveDown(0.4);
}

function para(text) {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 1.5 });
  doc.moveDown(0.5);
}

function bullet(text) {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(`•  ${text}`, L + 12, doc.y, { width: W - 12, align: 'justify', lineGap: 1.5 });
  doc.moveDown(0.35);
}

function bold(text) {
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK)
     .text(text, L, doc.y, { width: W });
  doc.moveDown(0.3);
}

// ── PRIMERA — PARTES ──────────────────────────────────────────────────────────
sectionTitle('PRIMERA', 'PARTES CONTRATANTES');
para('Entre los suscritos, a saber:');
para('LA CONTRATANTE: SAGDI S.A.S., sociedad debidamente constituida bajo las leyes colombianas, identificada con NIT 902.036.337-4, con domicilio en Colombia, representada para este acto por su representante legal, en adelante "LA EMPRESA".');
para('EL CONTRATISTA: Hernán Valencia Gil, profesional en Seguridad y Salud en el Trabajo, con licencia en SST vigente expedida por la autoridad competente, en adelante "EL LICENCIADO".');
para('Manifiestan que han acordado celebrar el presente Acuerdo de Prestación de Servicios, el cual se regirá por las siguientes cláusulas:');

// ── SEGUNDA — OBJETO ──────────────────────────────────────────────────────────
sectionTitle('SEGUNDA', 'OBJETO DEL ACUERDO');
para('EL LICENCIADO se compromete a prestar sus servicios profesionales de Licenciado en Seguridad y Salud en el Trabajo a las empresas clientes de LA EMPRESA, utilizando exclusivamente la plataforma tecnológica SST Colombia (sst.sagisas.co) para la gestión, supervisión, firma digital de documentos y seguimiento del Sistema de Gestión SG-SST, de conformidad con la Resolución 0312 de 2019 y el Decreto 1072 de 2015.');

// ── TERCERA — MODELO ──────────────────────────────────────────────────────────
sectionTitle('TERCERA', 'MODELO DE SERVICIO');
para('El servicio se prestará bajo la modalidad de LSO de Cabecera para el portafolio de empresas clientes de LA EMPRESA. Las responsabilidades de EL LICENCIADO incluyen:');
bullet('Supervisión técnica del SG-SST de las empresas asignadas.');
bullet('Revisión y firma digital de investigaciones de accidentes e incidentes de trabajo.');
bullet('Validación de documentos técnicos que requieran firma de profesional licenciado.');
bullet('Atención de consultas técnicas de las empresas asignadas a través del sistema.');
bullet('Cumplimiento de los tiempos de respuesta establecidos por la normativa vigente.');
doc.moveDown(0.2);
para('LA EMPRESA proveerá acceso completo a la plataforma SST Colombia, soporte técnico y la cartera de empresas clientes asignadas, sin que EL LICENCIADO deba gestionar, facturar ni contactar directamente a dichos clientes para efectos comerciales.');

// ── CUARTA — TARIFAS ──────────────────────────────────────────────────────────
sectionTitle('CUARTA', 'TARIFAS POR NIVEL DE RIESGO ARL');
para('LA EMPRESA reconocerá a EL LICENCIADO una tarifa mensual fija por cada empresa activa asignada, de acuerdo con el nivel de riesgo ARL clasificado según el código CIIU:');
doc.moveDown(0.2);

// Tabla de tarifas
const cols = [L, L+115, L+285, L+390];
const cw   = [115, 170, 105, W - (390 - L)];
const rh = 20;
let ty = doc.y;

// Header
doc.rect(L, ty, W, rh).fill(GREEN);
['Nivel de Riesgo','Actividades Típicas','Trabajadores','Tarifa/Empresa/Mes'].forEach((h, i) => {
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('white')
     .text(h, cols[i] + 5, ty + 6, { width: cw[i] - 5 });
});

const filas = [
  ['Nivel I — Bajo',       'Oficinas, comercio, servicios financieros',  'Hasta 10',    '$ 120.000 COP'],
  ['Nivel II — Medio',     'Manufactura ligera, salud, educación',        'Hasta 50',    '$ 200.000 COP'],
  ['Nivel III — Medio-Alto','Industria, transporte, construcción menor',  'Hasta 200',   '$ 350.000 COP'],
  ['Nivel IV — Alto',      'Construcción, minería superficial, químicos', 'Hasta 500',   '$ 550.000 COP'],
  ['Nivel V — Muy Alto',   'Minería subterránea, explosivos, alturas',    'Sin límite',  '$ 800.000 COP'],
];

filas.forEach((fila, i) => {
  ty += rh;
  doc.rect(L, ty, W, rh).fill(i % 2 === 0 ? 'white' : '#f5faf6');
  doc.rect(L, ty, W, rh).stroke('#cccccc').lineWidth(0.4);
  fila.forEach((cell, j) => {
    doc.fontSize(8.5).font(j === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor(DARK)
       .text(cell, cols[j] + 5, ty + 6, { width: cw[j] - 8 });
  });
});

doc.y = ty + rh + 8;
doc.moveDown(0.4);
para('Las tarifas serán revisadas anualmente de mutuo acuerdo. Estos valores corresponden al ingreso neto para EL LICENCIADO, sin incluir los impuestos que le correspondan según la normativa tributaria vigente.');

// ── QUINTA — PAGO ─────────────────────────────────────────────────────────────
sectionTitle('QUINTA', 'FORMA Y PERIODICIDAD DE PAGO');
para('LA EMPRESA liquidará mensualmente el total de honorarios de EL LICENCIADO, con base en el número de empresas activas asignadas al cierre de cada mes calendario. El pago se realizará dentro de los primeros cinco (5) días hábiles del mes siguiente, mediante transferencia bancaria a la cuenta que EL LICENCIADO designe por escrito.');
para('LA EMPRESA generará un comprobante detallado de liquidación mensual especificando: listado de empresas atendidas, nivel de riesgo y tarifa aplicada a cada una.');

// ── SEXTA — OBLIGACIONES ──────────────────────────────────────────────────────
sectionTitle('SEXTA', 'OBLIGACIONES DE LAS PARTES');
bold('Obligaciones de EL LICENCIADO:');
bullet('Mantener vigente su licencia en SST durante toda la vigencia del acuerdo.');
bullet('Responder las solicitudes de las empresas en un plazo máximo de 48 horas hábiles.');
bullet('Firmar los documentos técnicos requeridos dentro de los plazos legales establecidos.');
bullet('Mantener confidencialidad sobre la información de los clientes de LA EMPRESA.');
bullet('Utilizar exclusivamente la plataforma SST Colombia para la gestión de las empresas asignadas.');
doc.moveDown(0.3);
bold('Obligaciones de LA EMPRESA:');
bullet('Proveer acceso permanente a la plataforma SST Colombia con perfil LSO.');
bullet('Asignar empresas clientes respetando la capacidad operativa de EL LICENCIADO.');
bullet('Realizar los pagos en los términos pactados en la cláusula quinta.');
bullet('Notificar con mínimo 15 días de anticipación cambios en tarifas o condiciones.');
bullet('Brindar soporte técnico sobre el uso de la plataforma cuando sea requerido.');

// ── SÉPTIMA — NATURALEZA ──────────────────────────────────────────────────────
sectionTitle('SÉPTIMA', 'NATURALEZA JURÍDICA DEL ACUERDO');
para('El presente acuerdo es de naturaleza civil y comercial, de prestación de servicios independiente. No genera relación laboral alguna entre las partes. EL LICENCIADO actuará como contratista independiente y será responsable del cumplimiento de sus propias obligaciones tributarias y de seguridad social conforme a la legislación colombiana vigente.');

// ── OCTAVA — DURACIÓN ─────────────────────────────────────────────────────────
sectionTitle('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
para('El presente acuerdo tendrá una duración inicial de doce (12) meses contados a partir de la fecha de suscripción, renovándose automáticamente por períodos iguales, salvo que cualquiera de las partes manifieste por escrito su intención de no renovarlo con un mínimo de treinta (30) días de anticipación.');
para('Cualquiera de las partes podrá dar por terminado el acuerdo de forma anticipada, sin lugar a indemnización, mediante comunicación escrita con treinta (30) días de antelación. En caso de incumplimiento grave, la terminación podrá ser inmediata.');

// ── FIRMAS ────────────────────────────────────────────────────────────────────
doc.moveDown(0.5);
doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.8).stroke();
doc.moveDown(0.8);
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo:', L, doc.y, { width: W, align: 'center' });
doc.moveDown(1.2);

const half = (W - 30) / 2;
const sigY = doc.y;

doc.rect(L, sigY, half, 75).stroke('#cccccc').lineWidth(0.5);
doc.rect(L + half + 30, sigY, half, 75).stroke('#cccccc').lineWidth(0.5);

doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, sigY + 52, { width: half, align: 'center' })
   .text('EL LICENCIADO', L + half + 30, sigY + 52, { width: half, align: 'center' });
doc.fontSize(8).font('Helvetica').fillColor(GRAY)
   .text('SAGDI S.A.S. · NIT 902.036.337-4', L, sigY + 63, { width: half, align: 'center' })
   .text('Hernán Valencia Gil — LSO', L + half + 30, sigY + 63, { width: half, align: 'center' });

doc.y = sigY + 85;
doc.moveDown(0.6);
doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.4).stroke();
doc.moveDown(0.3);
doc.fontSize(7.5).font('Helvetica').fillColor('#aaaaaa')
   .text('SAGDI S.A.S. · NIT 902.036.337-4 · admin@sst-colombia.com · sst.sagisas.co', L, doc.y, { width: W, align: 'center' });

doc.end();
stream.on('finish', () => console.log('PDF listo:', OUTPUT_PATH));
