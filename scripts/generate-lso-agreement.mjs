import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/acuerdo-alianza-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DARK  = '#111111';
const GRAY  = '#555555';
const LGRAY = '#eef6ef';
const RAZÓN = 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.';
const NIT   = 'NIT 902.036.337-4';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 58, bottom: 55, left: 65, right: 65 },
  bufferPages: true,
  info: { Title: 'Acuerdo de Alianza Estratégica — Profesional SST', Author: RAZÓN },
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
  const bx = L + 10;
  const tx = L + 24;
  const tw = W - 24;
  const sy = doc.y;
  doc.fontSize(10).font('Helvetica').fillColor(DARK)
     .text('\u2022', bx, sy, { width: 12, lineBreak: false });
  doc.fontSize(10).font('Helvetica').fillColor(DARK)
     .text(text, tx, sy, { width: tw, align: 'justify', lineGap: 2 });
  doc.moveDown(0.3);
}

function divider() {
  doc.moveDown(0.3);
  doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.6).stroke();
  doc.moveDown(0.4);
}

function pageHeader() {
  doc.rect(L, 55, W, 30).fill(GREEN);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('white')
     .text('SST-Colombia  ·  Acuerdo de Alianza Estratégica', L + 12, 62, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
     .text(`${RAZÓN}  ·  ${NIT}`, L + 12, 76, { lineBreak: false });
  doc.y = 98;
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 1 — Encabezado principal
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(L, 55, W, 58).fill(GREEN);

// Nombre de la plataforma
doc.fontSize(18).font('Helvetica-Bold').fillColor('white')
   .text('SST-Colombia', L + 14, 64, { lineBreak: false });

// Razón social y NIT
doc.fontSize(8.5).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.95)')
   .text(RAZÓN, L + 14, 92, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
   .text(`${NIT}  ·  sst.sagisas.co  ·  admin@sst-colombia.com`, L + 14, 104, { lineBreak: false });

doc.y = 128;

doc.fontSize(13).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE ALIANZA ESTRATÉGICA', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.25);
doc.fontSize(10).font('Helvetica').fillColor(GRAY)
   .text('Vinculación de Profesional SST a la Red de Aliados de SST-Colombia',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.25);
doc.fontSize(9).fillColor(GRAY)
   .text(`Medellín, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`,
         L, doc.y, { width: W, align: 'right' });
doc.moveDown(0.4);
divider();

sect('PRIMERA', 'DEFINICIONES Y PARTES');
p('Para efectos del presente acuerdo se establecen las siguientes definiciones:');
bul(`LA EMPRESA: ${RAZÓN}, ${NIT}, con domicilio en Medellín, Antioquia, representada legalmente por Luz Adriana Díaz Calle. Es la empresa comercializadora de SST-Colombia. En adelante "LA EMPRESA".`);
bul('SST-Colombia: Plataforma tecnológica para la gestión del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), disponible en sst.sagisas.co, comercializada por LA EMPRESA. En adelante "LA PLATAFORMA".');
bul('EL PROFESIONAL: Hernán Valencia Gil, Profesional en Seguridad y Salud en el Trabajo con licencia vigente según la Resolución 4927 de 2016 del Ministerio de Trabajo. En adelante "EL PROFESIONAL".');
p('Las partes suscriben este acuerdo de alianza de forma voluntaria y no exclusiva, bajo las condiciones aquí descritas.');

sect('SEGUNDA', 'NATURALEZA Y OBJETO DE LA ALIANZA');
p('Este acuerdo establece los términos bajo los cuales EL PROFESIONAL se vincula como aliado a la red de Profesionales SST de LA PLATAFORMA SST-Colombia. La alianza tiene por objeto:');
bul('Permitir que LA PLATAFORMA incluya el perfil de EL PROFESIONAL como opción de asesoría SST para las empresas que se incorporen a su ecosistema digital.');
bul('Acordar las tarifas aplicables al servicio de acompañamiento SST mensual que EL PROFESIONAL prestará a las empresas suscritas que lo contraten directamente.');
bul('Definir los derechos, compromisos y autonomía de cada parte dentro del ecosistema de SST-Colombia.');
doc.moveDown(0.2);
p('Esta alianza no genera relación laboral, de subordinación ni de exclusividad entre las partes.');

sect('TERCERA', 'MODELO DE PAGOS — DOS SERVICIOS INDEPENDIENTES');
p('Las empresas suscritas a SST-Colombia reciben dos servicios distintos, pagados de forma independiente a entidades diferentes:');
bul(`SUSCRIPCIÓN A LA PLATAFORMA: Cada empresa paga directamente a LA EMPRESA la tarifa mensual por el uso de SST-Colombia según el plan contratado. Este pago es obligatorio para acceder a la plataforma.`);
bul('HONORARIOS AL PROFESIONAL: Las empresas que decidan contratar a EL PROFESIONAL le pagarán directamente a él los honorarios establecidos en la Cláusula Cuarta. Este pago es independiente de la suscripción a la plataforma.');
doc.moveDown(0.2);
p('LA EMPRESA no interviene ni es intermediaria en los pagos entre las empresas y EL PROFESIONAL. La relación económica derivada de los servicios profesionales es directa entre EL PROFESIONAL y cada empresa contratante.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
pageHeader();

sect('CUARTA', 'TARIFAS DEL SERVICIO DE ACOMPAÑAMIENTO SST MENSUAL');
p('Las partes acuerdan las siguientes tarifas mensuales que EL PROFESIONAL aplicará a cada empresa que lo contrate a través del ecosistema de SST-Colombia, según el nivel de riesgo ARL determinado por el CIIU registrado en la plataforma:');
doc.moveDown(0.3);

// Tabla de tarifas
const COL_N = 175;
const COL_A = W - COL_N - 110;
const COL_T = 110;
const tcols = [L, L + COL_N, L + COL_N + COL_A];
const tcw   = [COL_N, COL_A, COL_T];
const trh   = 21;
let   try_  = doc.y;

doc.rect(L, try_, W, trh).fill(GREEN);
['Nivel de Riesgo ARL', 'Sectores Representativos', 'Tarifa Mensual'].forEach((h, i) => {
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(h, tcols[i] + 5, try_ + 6, { width: tcw[i] - 8, align: i === 2 ? 'right' : 'left', lineBreak: false });
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
    doc.fontSize(9)
       .font(ci === 0 || ci === 2 ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(ci === 2 ? GREEN : DARK)
       .text(cell, tcols[ci] + 5, try_ + 6, { width: tcw[ci] - 8, align: ci === 2 ? 'right' : 'left', lineBreak: false });
  });
  try_ += trh;
});
doc.y = try_ + 10;

p('Las tarifas anteriores corresponden exclusivamente al servicio de acompañamiento y gestión SST mensual en la plataforma. EL PROFESIONAL acuerda aplicar estas tarifas a las empresas que lo contraten a través del ecosistema de SST-Colombia.');

doc.moveDown(0.2);
const iy0 = doc.y;
doc.rect(L, iy0, W, 14).fill('#eef6ef');
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(GREEN)
   .text('Servicios adicionales — Plena autonomía de EL PROFESIONAL', L + 8, iy0 + 3, { width: W - 14, lineBreak: false });
doc.y = iy0 + 18;
doc.moveDown(0.3);

p('La plataforma SST-Colombia incluye en su suscripción la gestión digital de capacitaciones, investigaciones de accidentes, inspecciones, matriz de peligros GTC-45, plan de emergencias, auditorías y salud ocupacional. Por tanto, EL PROFESIONAL tiene plena libertad para acordar y cobrar directamente a las empresas la tarifa que considere adecuada por servicios que requieran presencia física, equipos especializados o expertise técnico por fuera de las herramientas digitales de la plataforma, entre ellos:');
bul('Impartir capacitaciones presenciales: charlas, talleres, simulacros y entrenamiento directo a trabajadores en sitio.');
bul('Visitas técnicas presenciales: inspecciones físicas de instalaciones, puestos de trabajo, maquinaria y equipos que requieran la presencia del profesional en las instalaciones.');
bul('Ejecución de simulacros de emergencia: coordinación y dirección in situ de los simulacros de evacuación y atención de emergencias.');
bul('Exámenes médicos ocupacionales y profesiogramas: valoraciones realizadas por médico con especialización en medicina del trabajo o salud ocupacional.');
bul('Mediciones ambientales y de higiene industrial: ruido, vibraciones, iluminación, material particulado y otras mediciones que requieran equipos certificados.');
bul('Cualquier otro servicio SST que requiera presencia física del profesional o equipos técnicos especializados, conforme a su licencia y a la normativa colombiana vigente.');

sect('QUINTA', 'COMPROMISOS DE EL PROFESIONAL');
bul('Mantener vigente su licencia en SST durante toda la vigencia de esta alianza.');
bul('Aplicar las tarifas acordadas en la Cláusula Cuarta para el servicio de acompañamiento SST mensual.');
bul('Atender a las empresas que lo contraten utilizando SST-Colombia como herramienta de gestión.');
bul('Prestar sus servicios con los más altos estándares técnicos, éticos y legales.');
bul('Responder oportunamente las solicitudes de las empresas contratantes.');
bul('Informar a LA EMPRESA sobre situaciones que afecten su disponibilidad o licencia.');

sect('SEXTA', 'COMPROMISOS DE LA EMPRESA');
bul('Publicar el perfil de EL PROFESIONAL en SST-Colombia como aliado disponible para las empresas.');
bul('Mostrar las tarifas acordadas en la Cláusula Cuarta al momento en que las empresas escojan su nivel de riesgo durante el registro en la plataforma.');
bul('Proveer a EL PROFESIONAL acceso con perfil de Profesional SST a SST-Colombia sin costo alguno.');
bul('Sugerir a EL PROFESIONAL como opción de asesoría a las empresas que así lo requieran, dejando siempre la decisión final a la empresa.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
pageHeader();

sect('SÉPTIMA', 'AUTONOMÍA E INDEPENDENCIA PROFESIONAL');
p('EL PROFESIONAL conserva plena autonomía e independencia en la prestación de sus servicios. LA EMPRESA no interviene, supervisa ni es responsable de la relación contractual entre EL PROFESIONAL y sus clientes. Cada empresa es responsable de verificar las credenciales del profesional que elija.');
p('La vinculación de una empresa con EL PROFESIONAL es un acuerdo exclusivamente entre ellos. LA EMPRESA actúa únicamente como facilitador tecnológico y de visibilidad, sin asumir responsabilidad por el contenido, calidad o resultados de los servicios profesionales.');

sect('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
p('Este acuerdo tendrá una vigencia de doce (12) meses a partir de su suscripción, renovándose automáticamente por períodos iguales. Cualquiera de las partes podrá retirarse mediante comunicación escrita con quince (15) días de anticipación, sin que ello genere obligación de indemnización.');
p('La alianza terminará automáticamente si EL PROFESIONAL pierde su licencia en SST o si LA PLATAFORMA cesa sus operaciones.');

sect('NOVENA', 'CONFIDENCIALIDAD');
p('Ambas partes se comprometen a mantener la confidencialidad sobre la información comercial y operativa que intercambien en el marco de esta alianza, durante su vigencia y por dos (2) años después de su terminación.');

sect('DÉCIMA', 'RESOLUCIÓN DE DIFERENCIAS');
p('Cualquier diferencia derivada de este acuerdo será resuelta de forma directa y amigable dentro de los quince (15) días hábiles siguientes. De no lograrse acuerdo, las partes acudirán a mecanismos alternativos de solución de conflictos o a la jurisdicción ordinaria competente en Medellín, Antioquia.');

// ── Firmas ───────────────────────────────────────────────────────────────────
doc.moveDown(0.6);
divider();
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo de alianza:',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(1.5);

const sw = (W - 30) / 2;
const sy = doc.y;
doc.rect(L, sy, sw, 76).stroke('#aaaaaa').lineWidth(0.6);
doc.rect(L + sw + 30, sy, sw, 76).stroke('#aaaaaa').lineWidth(0.6);

doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, sy + 44, { width: sw, align: 'center', lineBreak: false })
   .text('EL PROFESIONAL ALIADO', L + sw + 30, sy + 44, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(GRAY)
   .text(RAZÓN, L, sy + 57, { width: sw, align: 'center', lineBreak: false })
   .text(NIT, L, sy + 68, { width: sw, align: 'center', lineBreak: false })
   .text('Hernán Valencia Gil', L + sw + 30, sy + 57, { width: sw, align: 'center', lineBreak: false })
   .text('Profesional en SST  ·  Lic. vigente', L + sw + 30, sy + 68, { width: sw, align: 'center', lineBreak: false });

doc.y = sy + 88;
doc.moveDown(0.6);
divider();
doc.fontSize(8).font('Helvetica').fillColor('#aaaaaa')
   .text(`${RAZÓN}  ·  ${NIT}  ·  admin@sst-colombia.com  ·  sst.sagisas.co`,
         L, doc.y, { width: W, align: 'center', lineBreak: false });

doc.end();
doc.on('end', () => console.log('PDF listo:', OUT));
