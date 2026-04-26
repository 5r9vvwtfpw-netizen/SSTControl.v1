import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/acuerdo-lso-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DARK  = '#111111';
const GRAY  = '#555555';
const LGRAY = '#eef6ef';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 58, bottom: 55, left: 65, right: 65 },
  bufferPages: true,
  info: { Title: 'Acuerdo de Servicios — Profesional SST', Author: 'SAGDI S.A.S.' },
});
doc.pipe(fs.createWriteStream(OUT));

const W = doc.page.width - 130;
const L = 65;
const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                'septiembre','octubre','noviembre','diciembre'];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function sect(n, t) {
  doc.moveDown(0.6);
  const y0 = doc.y;
  doc.rect(L, y0, W, 18).fill(LGRAY);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(GREEN)
     .text(`${n} — ${t}`, L + 8, y0 + 4, { width: W - 14, lineBreak: false });
  doc.y = y0 + 22;
  doc.moveDown(0.4);
}

function p(text) {
  doc.fontSize(10).font('Helvetica').fillColor(DARK)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 2 });
  doc.moveDown(0.55);
}

function bul(text) {
  doc.fontSize(10).font('Helvetica').fillColor(DARK)
     .text(`\u2022   ${text}`, L + 14, doc.y, { width: W - 14, align: 'justify', lineGap: 2 });
  doc.moveDown(0.4);
}

function lbl(text) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
     .text(text, L, doc.y, { width: W });
  doc.moveDown(0.3);
}

function divider() {
  doc.moveDown(0.3);
  doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.6).stroke();
  doc.moveDown(0.4);
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 1
// ══════════════════════════════════════════════════════════════════════════════

// Encabezado
doc.rect(L, 55, W, 55).fill(GREEN);
doc.fontSize(16).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.', L + 14, 66, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('white')
   .text('Sistema de Gestión SG-SST Colombia  ·  NIT 902.036.337-4', L + 14, 84, { lineBreak: false });
doc.fontSize(8.5).fillColor('rgba(255,255,255,0.8)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', L + 14, 97, { lineBreak: false });
doc.y = 122;

// Título
doc.fontSize(13).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE PRESTACIÓN DE SERVICIOS', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.25);
doc.fontSize(10).font('Helvetica').fillColor(GRAY)
   .text('Profesional en Seguridad y Salud en el Trabajo — Modelo Tarifario por Nivel de Riesgo',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.25);
doc.fontSize(9).fillColor(GRAY)
   .text(`Medellín, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`,
         L, doc.y, { width: W, align: 'right' });
doc.moveDown(0.4);
divider();

// PRIMERA
sect('PRIMERA', 'PARTES CONTRATANTES');
p('LA CONTRATANTE: SAGDI S.A.S., sociedad debidamente constituida bajo las leyes colombianas, identificada con NIT 902.036.337-4, con domicilio principal en Colombia, representada para este acto por su representante legal, en adelante denominada "LA EMPRESA".');
p('EL CONTRATISTA: Hernán Valencia Gil, Profesional en Seguridad y Salud en el Trabajo con licencia vigente expedida por la autoridad competente, de conformidad con la Resolución 4927 de 2016 del Ministerio de Trabajo, en adelante denominado "EL PROFESIONAL".');
p('Las partes, con plena capacidad legal para contratar, acuerdan celebrar el presente Acuerdo de Prestación de Servicios, que se regirá por las cláusulas siguientes:');

// SEGUNDA
sect('SEGUNDA', 'OBJETO DEL ACUERDO');
p('EL PROFESIONAL se compromete a prestar sus servicios en Seguridad y Salud en el Trabajo a las empresas clientes de LA EMPRESA, utilizando de forma exclusiva la plataforma tecnológica SST Colombia (sst.sagisas.co) para la gestión, supervisión, firma digital de documentos y seguimiento del Sistema de Gestión SG-SST, en cumplimiento de la Resolución 0312 de 2019 y el Decreto 1072 de 2015.');

// TERCERA
sect('TERCERA', 'MODELO DE SERVICIO');
p('El servicio se prestará bajo la modalidad de Profesional SST de Cabecera para el portafolio de empresas clientes de LA EMPRESA. Las responsabilidades de EL PROFESIONAL incluyen:');
bul('Supervisión técnica del SG-SST de las empresas asignadas.');
bul('Revisión y firma digital de investigaciones de accidentes e incidentes de trabajo.');
bul('Validación de documentos técnicos que requieran firma de profesional en SST.');
bul('Atención de consultas técnicas de las empresas asignadas en máximo 48 horas hábiles.');
bul('Cumplimiento de los plazos legales establecidos por la normativa vigente.');
doc.moveDown(0.2);
p('LA EMPRESA proveerá acceso completo a la plataforma SST Colombia, soporte técnico permanente y la cartera de empresas clientes asignadas, sin que EL PROFESIONAL deba gestionar, facturar ni contactar comercialmente a dichos clientes de forma directa.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();

// Encabezado pág 2
doc.rect(L, 55, W, 28).fill(GREEN);
doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.  ·  Acuerdo de Prestación de Servicios', L + 12, 64, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
   .text('NIT 902.036.337-4  ·  sst.sagisas.co', L + 12, 75, { lineBreak: false });
doc.y = 96;

// CUARTA
sect('CUARTA', 'TARIFAS POR NIVEL DE RIESGO ARL');
p('LA EMPRESA reconocerá a EL PROFESIONAL una tarifa mensual fija por cada empresa activa asignada, de acuerdo con el nivel de riesgo ARL clasificado según el código CIIU (Resolución 0312 de 2019):');
doc.moveDown(0.3);

// Tabla de tarifas
const tcols = [L, L+160, L+430];
const tcw   = [160, 270, W - (430 - L)];
const trh   = 21;
let   try_  = doc.y;

doc.rect(L, try_, W, trh).fill(GREEN);
['Nivel de Riesgo', 'Actividades Representativas', 'Tarifa / Mes'].forEach((h, i) => {
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(h, tcols[i] + 5, try_ + 6, { width: tcw[i] - 8, lineBreak: false });
});
try_ += trh;

const filas = [
  ['Nivel I — Bajo',         'Oficinas, comercio, servicios financieros',  '$150.000 COP'],
  ['Nivel II — Medio',       'Manufactura ligera, salud, educación',        '$250.000 COP'],
  ['Nivel III — Medio-Alto', 'Industria, transporte, construcción menor',   '$350.000 COP'],
  ['Nivel IV — Alto',        'Construcción, minería superficial, químicos', '$450.000 COP'],
  ['Nivel V — Muy Alto',     'Minería subterránea, explosivos, alturas',    '$550.000 COP'],
];
filas.forEach((row, ri) => {
  doc.rect(L, try_, W, trh).fill(ri % 2 === 0 ? '#ffffff' : '#f3faf4');
  doc.rect(L, try_, W, trh).strokeColor('#dddddd').lineWidth(0.4).stroke();
  row.forEach((cell, ci) => {
    doc.fontSize(9).font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor(DARK)
       .text(cell, tcols[ci] + 5, try_ + 6, { width: tcw[ci] - 8, lineBreak: false });
  });
  try_ += trh;
});
doc.y = try_ + 8;

p('Las tarifas aquí establecidas serán revisadas anualmente de mutuo acuerdo entre las partes. Los valores corresponden al ingreso neto de EL PROFESIONAL, excluyendo los impuestos y obligaciones de seguridad social que le correspondan según la normativa tributaria vigente.');

// QUINTA
sect('QUINTA', 'FORMA Y PERIODICIDAD DE PAGO');
p('LA EMPRESA liquidará mensualmente el total de honorarios de EL PROFESIONAL con base en el número de empresas activas asignadas al cierre de cada mes calendario. El pago se realizará dentro de los primeros cinco (5) días hábiles del mes siguiente, mediante transferencia bancaria a la cuenta que EL PROFESIONAL designe por escrito.');
p('Con cada pago, LA EMPRESA entregará un comprobante detallado de liquidación mensual que especificará: listado de empresas atendidas, nivel de riesgo ARL y tarifa aplicada a cada una.');

// SEXTA
sect('SEXTA', 'OBLIGACIONES DE LAS PARTES');
lbl('Obligaciones de EL PROFESIONAL:');
bul('Mantener vigente su licencia en SST durante toda la vigencia del acuerdo.');
bul('Responder solicitudes de las empresas asignadas en máximo 48 horas hábiles.');
bul('Firmar los documentos técnicos requeridos dentro de los plazos legales establecidos.');
bul('Mantener absoluta confidencialidad sobre la información de los clientes de LA EMPRESA.');
bul('Usar exclusivamente la plataforma SST Colombia para gestionar las empresas asignadas.');

doc.moveDown(0.35);
lbl('Obligaciones de LA EMPRESA:');
bul('Proveer acceso permanente a la plataforma SST Colombia con perfil Profesional SST.');
bul('Asignar empresas clientes respetando la capacidad operativa de EL PROFESIONAL.');
bul('Realizar los pagos en los términos y plazos pactados en la cláusula quinta.');
bul('Notificar con mínimo 15 días de anticipación cualquier cambio en tarifas o condiciones.');
bul('Brindar soporte técnico sobre el uso de la plataforma cuando sea requerido.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();

// Encabezado pág 3
doc.rect(L, 55, W, 28).fill(GREEN);
doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.  ·  Acuerdo de Prestación de Servicios', L + 12, 64, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
   .text('NIT 902.036.337-4  ·  sst.sagisas.co', L + 12, 75, { lineBreak: false });
doc.y = 96;

// SÉPTIMA
sect('SÉPTIMA', 'NATURALEZA JURÍDICA DEL ACUERDO');
p('El presente acuerdo es de naturaleza civil y comercial, correspondiente a un contrato de prestación de servicios independiente. Su celebración no genera relación laboral, vínculo de subordinación ni prestaciones sociales entre las partes.');
p('EL PROFESIONAL actuará en todo momento como contratista independiente y será el único responsable del cumplimiento de sus obligaciones tributarias, de seguridad social (salud y pensión) y de cualquier otra obligación legal que le corresponda conforme a la legislación colombiana vigente.');

// OCTAVA
sect('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
p('El presente acuerdo tendrá una duración inicial de doce (12) meses contados a partir de la fecha de suscripción por ambas partes. Al vencimiento de este plazo, el acuerdo se renovará automáticamente por períodos iguales, salvo que cualquiera de las partes manifieste por escrito su intención de no renovarlo con un mínimo de treinta (30) días calendario de anticipación.');
p('Cualquiera de las partes podrá dar por terminado el acuerdo de forma anticipada y sin lugar a indemnización, mediante comunicación escrita dirigida a la otra parte con treinta (30) días de antelación. En caso de incumplimiento grave y comprobado de las obligaciones pactadas, la terminación podrá ser inmediata y sin previo aviso.');

// NOVENA
sect('NOVENA', 'RESOLUCIÓN DE CONTROVERSIAS');
p('Las diferencias o controversias que surjan con ocasión de la interpretación, ejecución o terminación del presente acuerdo serán resueltas, en primera instancia, de manera directa y amigable entre las partes dentro de los quince (15) días hábiles siguientes a la fecha en que se presente la reclamación. De no llegarse a un acuerdo, las partes acudirán a los mecanismos alternativos de solución de conflictos o, en su defecto, a la jurisdicción ordinaria competente.');

// Firmas
doc.moveDown(0.6);
divider();
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación y conformidad, las partes suscriben el presente acuerdo:',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(1.5);

const sw = (W - 30) / 2;
const sy = doc.y;
doc.rect(L, sy, sw, 72).stroke('#aaaaaa').lineWidth(0.6);
doc.rect(L + sw + 30, sy, sw, 72).stroke('#aaaaaa').lineWidth(0.6);

doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, sy + 48, { width: sw, align: 'center', lineBreak: false })
   .text('EL PROFESIONAL', L + sw + 30, sy + 48, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor(GRAY)
   .text('SAGDI S.A.S.  ·  NIT 902.036.337-4', L, sy + 60, { width: sw, align: 'center', lineBreak: false })
   .text('Hernán Valencia Gil  ·  Profesional SST', L + sw + 30, sy + 60, { width: sw, align: 'center', lineBreak: false });

doc.y = sy + 82;
doc.moveDown(0.6);
divider();
doc.fontSize(8).font('Helvetica').fillColor('#aaaaaa')
   .text('SAGDI S.A.S.  ·  NIT 902.036.337-4  ·  admin@sst-colombia.com  ·  sst.sagisas.co',
         L, doc.y, { width: W, align: 'center', lineBreak: false });

doc.end();
doc.on('end', () => console.log('PDF listo:', OUT));
