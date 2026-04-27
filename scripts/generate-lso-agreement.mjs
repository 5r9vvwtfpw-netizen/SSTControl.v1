import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/acuerdo-alianza-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DGREEN= '#155a25';
const DARK  = '#111111';
const GRAY  = '#555555';
const LGRAY = '#eef6ef';
const BGRAY = '#f7f7f7';
const RAZÓN = 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.';
const NIT   = 'NIT 902.036.337-4';

const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                'agosto','septiembre','octubre','noviembre','diciembre'];
const FECHA = `${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`;

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 118, bottom: 72, left: 65, right: 65 },
  bufferPages: true,
  info: {
    Title: 'Acuerdo de Alianza Estratégica — Profesional SST',
    Author: RAZÓN,
    Subject: 'Vinculación de Profesional SST — Hernán Valencia Gil',
  },
});
doc.pipe(fs.createWriteStream(OUT));

const PW = doc.page.width;
const PH = doc.page.height;
const W  = PW - 130;
const L  = 65;

// ── HELPERS ──────────────────────────────────────────────────────────────────
function sect(n, t) {
  if (doc.y > PH - 160) doc.addPage();
  doc.moveDown(0.5);
  const y0 = doc.y;
  doc.rect(L, y0, W, 20).fill(GREEN);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor('white')
     .text(`${n}  —  ${t}`, L + 10, y0 + 5, { width: W - 16, lineBreak: false });
  doc.y = y0 + 26;
}

function subsect(t) {
  const y0 = doc.y;
  doc.rect(L, y0, W, 17).fill(LGRAY);
  doc.rect(L, y0, 3, 17).fill(GREEN);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(GREEN)
     .text(t, L + 10, y0 + 4, { width: W - 16, lineBreak: false });
  doc.y = y0 + 23;
}

function p(text) {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 2.5 });
  doc.moveDown(0.5);
}

function bul(text) {
  const sy = doc.y;
  doc.fontSize(9.5).font('Helvetica').fillColor(GREEN)
     .text('\u2022', L + 8, sy, { width: 14, lineBreak: false });
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(text, L + 24, sy, { width: W - 24, align: 'justify', lineGap: 2.5 });
  doc.moveDown(0.25);
}

function divider() {
  doc.moveDown(0.25);
  doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

// Dibuja encabezado compacto y pie en la página actual (páginas 2+)
let pageNum = 0;
function drawRunningDecor() {
  // Salvar y remover márgenes temporalmente
  const origTop    = doc.page.margins.top;
  const origBottom = doc.page.margins.bottom;
  const savedY     = doc.y;
  doc.page.margins.top    = 0;
  doc.page.margins.bottom = 0;

  // Encabezado compacto
  doc.rect(L, 48, W, 38).fill(GREEN);
  doc.rect(L, 48, 4, 38).fill(DGREEN);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('white')
     .text('SST-Colombia  ·  Acuerdo de Alianza Estratégica', L + 14, 56, { lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
     .text(`${RAZÓN}  ·  ${NIT}`, L + 14, 70, { lineBreak: false });

  // Pie
  doc.moveTo(L, PH - 50).lineTo(L + W, PH - 50).strokeColor('#cccccc').lineWidth(0.4).stroke();
  doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
     .text(`Documento Confidencial  ·  SST-Colombia  ·  sst.sagisas.co  ·  Página ${pageNum}`,
           L, PH - 44, { lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('#aaaaaa')
     .text(FECHA, L, PH - 34, { lineBreak: false });

  // Restaurar
  doc.page.margins.top    = origTop;
  doc.page.margins.bottom = origBottom;
  doc.y = savedY;
}

// Evento: cada vez que se agrega una página nueva, dibuja encabezado+pie
doc.on('pageAdded', () => {
  pageNum++;
  drawRunningDecor();
});

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 1 — Encabezado principal
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(L, 48, W, 68).fill(GREEN);
doc.rect(L, 48, 4, 68).fill(DGREEN);
doc.fontSize(20).font('Helvetica-Bold').fillColor('white')
   .text('SST-Colombia', L + 16, 57, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.9)')
   .text(RAZÓN, L + 16, 82, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.65)')
   .text(`${NIT}  ·  sst.sagisas.co  ·  admin@sst-colombia.com`, L + 16, 95, { lineBreak: false });
doc.fontSize(7.5).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.55)')
   .text('ACUERDO N.°', PW - 175, 57, { width: 108, align: 'right', lineBreak: false });
doc.fontSize(9).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.9)')
   .text(`AL-${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`,
         PW - 175, 68, { width: 108, align: 'right', lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.55)')
   .text(FECHA, PW - 175, 84, { width: 108, align: 'right', lineBreak: false });

doc.y = 130;
doc.fontSize(14).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE ALIANZA ESTRATÉGICA', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.2);
doc.fontSize(10).font('Helvetica').fillColor(GRAY)
   .text('Vinculación de Profesional SST a la Red de Aliados de SST-Colombia',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.55);
divider();

// ── CLÁUSULAS ─────────────────────────────────────────────────────────────────

sect('PRIMERA', 'DEFINICIONES Y PARTES');
p('Para efectos del presente acuerdo se establecen las siguientes definiciones:');
bul(`LA EMPRESA: ${RAZÓN}, ${NIT}, domiciliada en Medellín, Antioquia, representada legalmente por Luz Adriana Díaz Calle. Empresa comercializadora de SST-Colombia. En adelante "LA EMPRESA".`);
bul('SST-Colombia: Plataforma tecnológica para la gestión del SG-SST, disponible en sst.sagisas.co, comercializada por LA EMPRESA. En adelante "LA PLATAFORMA".');
bul('EL PROFESIONAL: Hernán Valencia Gil, Profesional en SST con licencia vigente según la Resolución 4927 de 2016. En adelante "EL PROFESIONAL".');
p('Las partes suscriben este acuerdo de forma voluntaria y no exclusiva, bajo las condiciones aquí descritas.');

sect('SEGUNDA', 'NATURALEZA Y OBJETO DE LA ALIANZA');
p('Este acuerdo establece los términos bajo los cuales EL PROFESIONAL se vincula como aliado a la red de Profesionales SST de SST-Colombia. La alianza tiene por objeto:');
bul('Incluir el perfil de EL PROFESIONAL como opción de asesoría SST para las empresas del ecosistema digital de LA PLATAFORMA.');
bul('Acordar las tarifas del servicio de acompañamiento SST mensual que EL PROFESIONAL prestará a las empresas que lo contraten directamente.');
bul('Definir los derechos, compromisos y autonomía de cada parte dentro del ecosistema de SST-Colombia.');
p('Esta alianza no genera relación laboral, de subordinación ni de exclusividad entre las partes.');

sect('TERCERA', 'MODELO DE PAGOS — DOS SERVICIOS INDEPENDIENTES');
p('Las empresas suscritas a SST-Colombia reciben dos servicios distintos, pagados de forma independiente:');
bul('SUSCRIPCIÓN A LA PLATAFORMA: Cada empresa se registra directamente en sst.sagisas.co y completa el pago de su suscripción mensual a través de la pasarela Stripe. El acceso a la plataforma se activa de forma automática. Obligatorio para operar en SST-Colombia.');
bul('HONORARIOS AL PROFESIONAL: Las empresas que decidan contratar a EL PROFESIONAL le pagarán directamente sus honorarios, según las tarifas de la Cláusula Cuarta. Este pago es independiente de la suscripción a la plataforma.');
p('LA EMPRESA no interviene en los pagos entre las empresas y EL PROFESIONAL. La relación económica por servicios profesionales es directa entre ambas partes.');

sect('CUARTA', 'TARIFAS DEL SERVICIO DE ACOMPAÑAMIENTO SST MENSUAL');
p('Las partes acuerdan las siguientes tarifas mensuales según el nivel de riesgo ARL de cada empresa, determinado por el CIIU registrado en la plataforma:');
doc.moveDown(0.2);

// ── Tabla de tarifas ─────────────────────────────────────────────────────────
const COL_N = 175;
const COL_A = W - COL_N - 112;
const COL_T = 112;
const tcols = [L, L + COL_N, L + COL_N + COL_A];
const tcw   = [COL_N, COL_A, COL_T];
const trh   = 21;
let   try_  = doc.y;

doc.rect(L, try_, W, trh).fill(GREEN);
doc.rect(L, try_, W, trh).strokeColor(DGREEN).lineWidth(0.3).stroke();
['Nivel de Riesgo ARL', 'Sectores Representativos', 'Tarifa Mensual'].forEach((h, i) => {
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(h, tcols[i] + 6, try_ + 6, { width: tcw[i] - 10, align: i === 2 ? 'right' : 'left', lineBreak: false });
});
try_ += trh;

[
  ['Nivel I — Bajo',         'Oficinas, comercio, servicios financieros',  '$150.000 COP'],
  ['Nivel II — Medio',       'Manufactura ligera, salud, educación',        '$250.000 COP'],
  ['Nivel III — Medio-Alto', 'Industria, transporte, construcción menor',   '$350.000 COP'],
  ['Nivel IV — Alto',        'Construcción, minería superficial, químicos', '$450.000 COP'],
  ['Nivel V — Muy Alto',     'Minería subterránea, explosivos, alturas',    '$550.000 COP'],
].forEach((row, ri) => {
  doc.rect(L, try_, W, trh).fill(ri % 2 === 0 ? '#ffffff' : BGRAY);
  doc.rect(L, try_, W, trh).strokeColor('#dddddd').lineWidth(0.3).stroke();
  row.forEach((cell, ci) => {
    doc.fontSize(9)
       .font(ci === 0 || ci === 2 ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(ci === 2 ? GREEN : DARK)
       .text(cell, tcols[ci] + 6, try_ + 6, { width: tcw[ci] - 10, align: ci === 2 ? 'right' : 'left', lineBreak: false });
  });
  try_ += trh;
});
doc.y = try_ + 12;

p('Las tarifas anteriores corresponden exclusivamente al servicio de acompañamiento y gestión SST mensual en la plataforma. EL PROFESIONAL acuerda aplicar estas tarifas a las empresas contratadas a través del ecosistema de SST-Colombia.');

subsect('Alcance incluido en la tarifa mensual');
p('Para empresas que no presenten solicitudes especiales, requerimientos extraordinarios ni necesidad de compilación, reconstrucción o depuración documental adicional, la tarifa mensual de EL PROFESIONAL incluye la revisión y firma de todos los formatos, formularios y reportes ordinarios del SG-SST que deban ser presentados o enviados periódicamente al Ministerio del Trabajo, siempre que la información necesaria se encuentre completa, veraz y actualizada en LA PLATAFORMA.');
p('Cualquier gestión adicional derivada de información incompleta, inconsistencias, requerimientos especiales, trámites extraordinarios o compilación documental manual podrá ser acordada y cobrada por separado entre EL PROFESIONAL y la empresa contratante.');

subsect('Servicios adicionales — Plena autonomía de EL PROFESIONAL');
p('SST-Colombia incluye en su suscripción la gestión digital de capacitaciones, investigaciones de accidentes, inspecciones, matriz GTC-45, plan de emergencias, auditorías y salud ocupacional. EL PROFESIONAL tiene plena libertad para acordar y cobrar por servicios que requieran presencia física o equipos especializados:');
bul('Capacitaciones presenciales: charlas, talleres y entrenamiento directo a trabajadores en sitio.');
bul('Visitas técnicas presenciales: inspecciones físicas de instalaciones, puestos de trabajo y equipos.');
bul('Ejecución de simulacros de emergencia: coordinación y dirección in situ.');
bul('Exámenes médicos ocupacionales y profesiogramas por médico especialista.');
bul('Mediciones ambientales e higiene industrial: ruido, vibraciones, iluminación y material particulado.');
bul('Cualquier otro servicio que requiera presencia física o equipos especializados, conforme a su licencia y la normativa colombiana.');

sect('QUINTA', 'COMPROMISOS DE EL PROFESIONAL');
bul('Mantener vigente su licencia en SST durante toda la vigencia de esta alianza.');
bul('Aplicar las tarifas de la Cláusula Cuarta para el servicio de acompañamiento SST mensual.');
bul('Utilizar SST-Colombia como herramienta de gestión al atender las empresas contratantes.');
bul('Prestar sus servicios con los más altos estándares técnicos, éticos y legales.');
bul('Notificar a LA EMPRESA si su disponibilidad o licencia se ve afectada.');

sect('SEXTA', 'COMPROMISOS DE LA EMPRESA');
bul('Publicar el perfil de EL PROFESIONAL en SST-Colombia como aliado disponible.');
bul('Mostrar las tarifas de la Cláusula Cuarta cuando las empresas seleccionen su nivel de riesgo durante el registro.');
bul('Proveer acceso con perfil de Profesional SST a la plataforma sin costo alguno.');
bul('Sugerir a EL PROFESIONAL como opción de asesoría, dejando la decisión final a la empresa.');

sect('SÉPTIMA', 'AUTONOMÍA E INDEPENDENCIA PROFESIONAL');
p('EL PROFESIONAL conserva plena autonomía e independencia. LA EMPRESA actúa únicamente como facilitador tecnológico y de visibilidad, sin intervenir ni asumir responsabilidad por la relación contractual entre EL PROFESIONAL y sus clientes.');

sect('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
p('Vigencia de doce (12) meses contados a partir de la firma, renovable automáticamente por períodos iguales. Cualquiera de las partes puede retirarse con quince (15) días hábiles de aviso escrito, sin obligación de indemnización. La alianza termina automáticamente si EL PROFESIONAL pierde o suspende su licencia en SST.');

sect('NOVENA', 'CONFIDENCIALIDAD');
p('Ambas partes mantendrán confidencialidad sobre la información comercial, técnica y operativa intercambiada durante la ejecución de este acuerdo, durante su vigencia y por dos (2) años posteriores a su terminación, salvo obligación legal en contrario.');

sect('DÉCIMA', 'RESOLUCIÓN DE DIFERENCIAS');
p('Las diferencias derivadas de la interpretación o cumplimiento del presente acuerdo se resolverán de forma directa entre las partes en un plazo máximo de quince (15) días hábiles. De no lograrse acuerdo, las partes acudirán a mecanismos alternativos de solución de conflictos o a la jurisdicción ordinaria de la ciudad de Medellín, Antioquia.');

sect('DÉCIMA PRIMERA', 'OFERTA ESPECIAL DE INCORPORACIÓN — VÁLIDA POR 30 DÍAS');

// Banner oferta
const of0 = doc.y;
doc.rect(L, of0, W, 20).fill(GREEN);
doc.rect(L, of0, 4, 20).fill(DGREEN);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor('white')
   .text('OFERTA DE VALOR — SUSCRIPCIÓN GRATUITA 6 MESES PARA SU PORTAFOLIO DE EMPRESAS', L + 12, of0 + 5, { width: W - 16, lineBreak: false });
doc.y = of0 + 26;

p('En reconocimiento al portafolio de clientes de EL PROFESIONAL y con el objetivo de facilitar su incorporación al ecosistema de SST-Colombia, LA EMPRESA extiende la siguiente oferta especial de bienvenida:');

subsect('1.  Suscripción gratuita de bienvenida — 6 meses sin costo');
p('Si EL PROFESIONAL orienta a la totalidad o parte de las treinta y cinco (35) empresas de su portafolio actual para que se registren en SST-Colombia dentro de los treinta (30) días calendario siguientes a la firma del presente acuerdo, LA EMPRESA aplicará una promoción de seis (6) meses completamente gratuitos a cada una de esas empresas.');
bul('Cada empresa realiza su propio registro directamente en sst.sagisas.co, ingresa sus datos y completa el proceso a través de la pasarela de pago Stripe. EL PROFESIONAL no gestiona cuentas, contraseñas ni información de sus clientes.');
bul('Para acceder a los 6 meses gratuitos, cada empresa deberá ingresar durante su registro el código promocional exclusivo que LA EMPRESA generará para el portafolio de EL PROFESIONAL. Stripe aplicará automáticamente el descuento del 100% durante seis (6) meses.');
bul('Vencido el período promocional, Stripe reanudará el cobro automático según la tarifa que corresponda al nivel de riesgo ARL de cada empresa, sin intervención adicional de ninguna de las partes.');

subsect('2.  Condiciones generales de la oferta');
bul('La gratuidad aplica exclusivamente a las empresas que utilicen el código promocional asignado a EL PROFESIONAL durante su registro en la landing page, dentro del plazo de 30 días. No aplica a empresas que se registren sin dicho código.');
bul('LA EMPRESA generará y entregará el código promocional a EL PROFESIONAL dentro de los tres (3) días hábiles siguientes a la firma del presente acuerdo.');
bul('Si EL PROFESIONAL decide retirarse de la alianza, las empresas activas continuarán con su suscripción de forma independiente y podrán seguir usando la plataforma sin interrupción.');
bul('Esta oferta no es acumulable con otras promociones vigentes, salvo acuerdo escrito entre las partes.');

// ── Bloque de firmas ──────────────────────────────────────────────────────────
if (doc.y > PH - 200) doc.addPage();
doc.moveDown(0.8);
divider();
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo en la ciudad de Medellín,',
         L, doc.y, { width: W, align: 'center' });
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text(`Antioquia, a los ${today.getDate()} días del mes de ${meses[today.getMonth()]} de ${today.getFullYear()}.`,
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(2.2);

const sw  = (W - 36) / 2;
const ssy = doc.y;

doc.rect(L, ssy, sw, 72).fill(BGRAY).stroke('#cccccc');
doc.moveTo(L + 14, ssy + 42).lineTo(L + sw - 14, ssy + 42).strokeColor('#999999').lineWidth(0.7).stroke();
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, ssy + 46, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
   .text(RAZÓN, L, ssy + 57, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
   .text(NIT, L, ssy + 67, { width: sw, align: 'center', lineBreak: false });

const rx = L + sw + 36;
doc.rect(rx, ssy, sw, 72).fill(BGRAY).stroke('#cccccc');
doc.moveTo(rx + 14, ssy + 42).lineTo(rx + sw - 14, ssy + 42).strokeColor('#999999').lineWidth(0.7).stroke();
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
   .text('EL PROFESIONAL ALIADO', rx, ssy + 46, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
   .text('Hernán Valencia Gil', rx, ssy + 57, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
   .text('Profesional SST  ·  Licencia vigente Res. 4927/2016', rx, ssy + 67, { width: sw, align: 'center', lineBreak: false });

// ── Pie página 1 (la primera página no pasa por el evento pageAdded) ──────────
{
  const origTop    = doc.page.margins.top;
  const origBottom = doc.page.margins.bottom;
  doc.switchToPage(0);
  doc.page.margins.top    = 0;
  doc.page.margins.bottom = 0;
  doc.moveTo(L, PH - 50).lineTo(L + W, PH - 50).strokeColor('#cccccc').lineWidth(0.4).stroke();
  doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
     .text('Documento Confidencial  ·  SST-Colombia  ·  sst.sagisas.co  ·  Página 1',
           L, PH - 44, { lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('#aaaaaa')
     .text(FECHA, L, PH - 34, { lineBreak: false });
  doc.page.margins.top    = origTop;
  doc.page.margins.bottom = origBottom;
}

doc.end();
doc.on('end', () => console.log(`PDF listo: ${OUT}`));
