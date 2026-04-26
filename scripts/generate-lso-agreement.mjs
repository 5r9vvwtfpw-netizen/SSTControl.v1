import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT = './attached_assets/acuerdo-lso-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DARK  = '#1a1a1a';
const GRAY  = '#666666';
const LGRAY = '#f0f7f1';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 55, bottom: 55, left: 65, right: 65 },
  bufferPages: true,
  info: { Title: 'Acuerdo de Servicios — Profesional SST', Author: 'SAGDI S.A.S.' },
});

doc.pipe(fs.createWriteStream(OUT));

const W = doc.page.width - 130;
const L = 65;
const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const sect = (n, t) => {
  doc.moveDown(0.4);
  const y0 = doc.y;
  doc.rect(L, y0, W, 17).fill(LGRAY);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(GREEN)
     .text(`${n} — ${t}`, L + 8, y0 + 4, { width: W - 16, lineBreak: false });
  doc.moveDown(0.7);
};

const p = t => {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(t, L, doc.y, { width: W, align: 'justify', lineGap: 1.5 });
  doc.moveDown(0.45);
};

const b = t => {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(`\u2022  ${t}`, L + 10, doc.y, { width: W - 10, align: 'justify', lineGap: 1.5 });
  doc.moveDown(0.3);
};

const h = t => {
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK)
     .text(t, L, doc.y, { width: W });
  doc.moveDown(0.25);
};

// ── ENCABEZADO ───────────────────────────────────────────────────────────────
doc.rect(L, 55, W, 60).fill(GREEN);
doc.fontSize(16).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.', L + 14, 68, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('white')
   .text('Sistema de Gestión SG-SST Colombia  ·  NIT 902.036.337-4', L + 14, 88, { lineBreak: false });
doc.fontSize(8).fillColor('rgba(255,255,255,0.75)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', L + 14, 102, { lineBreak: false });
doc.y = 130;

// ── TÍTULO ───────────────────────────────────────────────────────────────────
doc.fontSize(13).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE PRESTACIÓN DE SERVICIOS', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.2);
doc.fontSize(9.5).font('Helvetica').fillColor(GRAY)
   .text('Profesional en Seguridad y Salud en el Trabajo — Modelo Tarifario por Nivel de Riesgo', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.2);
doc.fontSize(8.5).fillColor(GRAY)
   .text(`Medellín, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`, L, doc.y, { width: W, align: 'right' });
doc.moveDown(0.3);
doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.7).stroke();
doc.moveDown(0.5);

// ── PRIMERA ───────────────────────────────────────────────────────────────────
sect('PRIMERA', 'PARTES CONTRATANTES');
p('Entre los suscritos, a saber:');
p('LA CONTRATANTE: SAGDI S.A.S., sociedad debidamente constituida bajo las leyes colombianas, identificada con NIT 902.036.337-4, con domicilio en Colombia, representada para este acto por su representante legal, en adelante "LA EMPRESA".');
p('EL CONTRATISTA: Hernán Valencia Gil, Profesional en Seguridad y Salud en el Trabajo con licencia vigente expedida por la autoridad competente, de conformidad con la Resolución 4927 de 2016 del Ministerio de Trabajo, en adelante "EL PROFESIONAL".');
p('Manifiestan que han acordado celebrar el presente Acuerdo de Prestación de Servicios, el cual se regirá por las siguientes cláusulas:');

// ── SEGUNDA ───────────────────────────────────────────────────────────────────
sect('SEGUNDA', 'OBJETO DEL ACUERDO');
p('EL PROFESIONAL se compromete a prestar sus servicios en Seguridad y Salud en el Trabajo a las empresas clientes de LA EMPRESA, utilizando exclusivamente la plataforma tecnológica SST Colombia (sst.sagisas.co) para la gestión, supervisión, firma digital de documentos y seguimiento del Sistema de Gestión SG-SST, en cumplimiento de la Resolución 0312 de 2019 y el Decreto 1072 de 2015.');

// ── TERCERA ───────────────────────────────────────────────────────────────────
sect('TERCERA', 'MODELO DE SERVICIO');
p('El servicio se prestará bajo la modalidad de Profesional SST de Cabecera para el portafolio de empresas clientes de LA EMPRESA. Las responsabilidades de EL PROFESIONAL incluyen:');
b('Supervisión técnica del SG-SST de las empresas asignadas.');
b('Revisión y firma digital de investigaciones de accidentes e incidentes de trabajo.');
b('Validación de documentos técnicos que requieran firma de profesional en SST.');
b('Atención de consultas técnicas de las empresas asignadas a través del sistema.');
b('Cumplimiento de los plazos legales establecidos por la normativa vigente.');
doc.moveDown(0.1);
p('LA EMPRESA proveerá acceso completo a la plataforma SST Colombia, soporte técnico y la cartera de empresas clientes asignadas, sin que EL PROFESIONAL deba gestionar, facturar ni contactar comercialmente a dichos clientes.');

// ── CUARTA ────────────────────────────────────────────────────────────────────
sect('CUARTA', 'TARIFAS POR NIVEL DE RIESGO ARL');
p('LA EMPRESA reconocerá a EL PROFESIONAL una tarifa mensual fija por cada empresa activa asignada, de acuerdo con el nivel de riesgo ARL según el código CIIU (Resolución 0312/2019):');
doc.moveDown(0.1);

// Tabla simple sin posicionamiento absoluto
const rows = [
  ['Nivel I — Bajo',        'Oficinas, comercio, servicios financieros',   'Hasta 10 trab.',   '$ 120.000 COP'],
  ['Nivel II — Medio',      'Manufactura ligera, salud, educación',         'Hasta 50 trab.',   '$ 200.000 COP'],
  ['Nivel III — Medio-Alto','Industria, transporte, construcción menor',    'Hasta 200 trab.',  '$ 350.000 COP'],
  ['Nivel IV — Alto',       'Construcción, minería superficial, químicos',  'Hasta 500 trab.',  '$ 550.000 COP'],
  ['Nivel V — Muy Alto',    'Minería subterránea, explosivos, alturas',     'Sin límite',       '$ 800.000 COP'],
];

const cw = [115, 175, 100, 92];
const cx = [L, L+115, L+290, L+390];
const rh = 19;

// Header
let ry = doc.y;
doc.rect(L, ry, W, rh).fill(GREEN);
['Nivel de Riesgo','Actividades Típicas','Trabajadores','Tarifa/Mes'].forEach((h, i) => {
  doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
     .text(h, cx[i] + 4, ry + 5, { width: cw[i] - 6, lineBreak: false });
});
ry += rh;

rows.forEach((row, ri) => {
  doc.rect(L, ry, W, rh).fill(ri % 2 === 0 ? 'white' : '#f4faf5');
  doc.rect(L, ry, W, rh).strokeColor('#dddddd').lineWidth(0.4).stroke();
  row.forEach((cell, ci) => {
    doc.fontSize(8).font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor(DARK)
       .text(cell, cx[ci] + 4, ry + 5, { width: cw[ci] - 6, lineBreak: false });
  });
  ry += rh;
});

doc.y = ry + 6;
doc.moveDown(0.4);
p('Las tarifas serán revisadas anualmente de mutuo acuerdo. Estos valores corresponden al ingreso neto de EL PROFESIONAL, sin incluir los impuestos que le correspondan según la normativa tributaria vigente.');

// ── QUINTA ────────────────────────────────────────────────────────────────────
sect('QUINTA', 'FORMA Y PERIODICIDAD DE PAGO');
p('LA EMPRESA liquidará mensualmente los honorarios de EL PROFESIONAL con base en el número de empresas activas asignadas al cierre de cada mes. El pago se realizará dentro de los primeros cinco (5) días hábiles del mes siguiente, mediante transferencia bancaria a la cuenta que EL PROFESIONAL designe por escrito.');
p('LA EMPRESA entregará un comprobante detallado de la liquidación mensual con el listado de empresas atendidas, nivel de riesgo y tarifa aplicada a cada una.');

// ── SEXTA ─────────────────────────────────────────────────────────────────────
sect('SEXTA', 'OBLIGACIONES DE LAS PARTES');
h('Obligaciones de EL PROFESIONAL:');
b('Mantener vigente su licencia en SST durante toda la vigencia del acuerdo.');
b('Responder solicitudes de las empresas asignadas en un plazo máximo de 48 horas hábiles.');
b('Firmar los documentos técnicos requeridos dentro de los plazos legales establecidos.');
b('Mantener confidencialidad sobre la información de los clientes de LA EMPRESA.');
b('Usar exclusivamente la plataforma SST Colombia para la gestión de las empresas asignadas.');
doc.moveDown(0.2);
h('Obligaciones de LA EMPRESA:');
b('Proveer acceso permanente a la plataforma SST Colombia con perfil Profesional SST.');
b('Asignar empresas clientes respetando la capacidad operativa de EL PROFESIONAL.');
b('Realizar los pagos en los términos pactados en la cláusula quinta.');
b('Notificar con mínimo 15 días de anticipación cambios en tarifas o condiciones.');
b('Brindar soporte técnico sobre el uso de la plataforma cuando sea requerido.');

// ── SÉPTIMA ───────────────────────────────────────────────────────────────────
sect('SÉPTIMA', 'NATURALEZA JURÍDICA DEL ACUERDO');
p('El presente acuerdo es de naturaleza civil y comercial, de prestación de servicios independiente. No genera relación laboral alguna entre las partes. EL PROFESIONAL actuará como contratista independiente y será responsable del pago de sus propias obligaciones tributarias y de seguridad social conforme a la legislación colombiana vigente.');

// ── OCTAVA ────────────────────────────────────────────────────────────────────
sect('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
p('El presente acuerdo tendrá una duración inicial de doce (12) meses contados a partir de la fecha de suscripción, renovándose automáticamente por períodos iguales, salvo que cualquiera de las partes manifieste por escrito su intención de no renovarlo con un mínimo de treinta (30) días de anticipación.');
p('Cualquiera de las partes podrá dar por terminado el acuerdo de forma anticipada sin lugar a indemnización, mediante comunicación escrita con treinta (30) días de antelación. En caso de incumplimiento grave de las obligaciones, la terminación podrá ser inmediata.');

// ── FIRMAS ────────────────────────────────────────────────────────────────────
doc.moveDown(0.4);
doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.7).stroke();
doc.moveDown(0.6);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo:', L, doc.y, { width: W, align: 'center' });
doc.moveDown(1);

const sigW = (W - 25) / 2;
const sigY = doc.y;
doc.rect(L, sigY, sigW, 70).stroke('#bbbbbb').lineWidth(0.5);
doc.rect(L + sigW + 25, sigY, sigW, 70).stroke('#bbbbbb').lineWidth(0.5);
doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, sigY + 48, { width: sigW, align: 'center', lineBreak: false })
   .text('EL PROFESIONAL', L + sigW + 25, sigY + 48, { width: sigW, align: 'center', lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(GRAY)
   .text('SAGDI S.A.S. · NIT 902.036.337-4', L, sigY + 59, { width: sigW, align: 'center', lineBreak: false })
   .text('Hernán Valencia Gil · Profesional SST', L + sigW + 25, sigY + 59, { width: sigW, align: 'center', lineBreak: false });

doc.y = sigY + 80;
doc.moveDown(0.4);
doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.4).stroke();
doc.moveDown(0.3);
doc.fontSize(7.5).font('Helvetica').fillColor('#aaaaaa')
   .text('SAGDI S.A.S. · NIT 902.036.337-4 · admin@sst-colombia.com · sst.sagisas.co', L, doc.y, { width: W, align: 'center', lineBreak: false });

doc.end();
doc.on('end', () => console.log('PDF listo:', OUT));
