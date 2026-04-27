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
  margins: { top: 105, bottom: 60, left: 65, right: 65 },
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

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 1 — Encabezado principal
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(L, 55, W, 58).fill(GREEN);
doc.fontSize(18).font('Helvetica-Bold').fillColor('white')
   .text('SST-Colombia', L + 14, 64, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.95)')
   .text(RAZÓN, L + 14, 89, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.72)')
   .text(`${NIT}  ·  sst.sagisas.co  ·  admin@sst-colombia.com`, L + 14, 101, { lineBreak: false });
doc.y = 130;

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

// ── CLÁUSULAS — paginación automática ─────────────────────────────────────────

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
bul('SUSCRIPCIÓN A LA PLATAFORMA: Cada empresa paga directamente a LA EMPRESA la tarifa mensual por el uso de SST-Colombia. Obligatorio para acceder a la plataforma.');
bul('HONORARIOS AL PROFESIONAL: Las empresas que decidan contratar a EL PROFESIONAL le pagarán directamente los honorarios de la Cláusula Cuarta, con independencia de la suscripción.');
p('LA EMPRESA no interviene en los pagos entre las empresas y EL PROFESIONAL. La relación económica por servicios profesionales es directa entre ambas partes.');

sect('CUARTA', 'TARIFAS DEL SERVICIO DE ACOMPAÑAMIENTO SST MENSUAL');
p('Las partes acuerdan las siguientes tarifas mensuales según el nivel de riesgo ARL de cada empresa, determinado por el CIIU registrado en la plataforma:');
doc.moveDown(0.2);

// ── Tabla de tarifas ──────────────────────────────────────────────────────────
const COL_N = 175;
const COL_A = W - COL_N - 110;
const COL_T = 110;
const tcols = [L, L + COL_N, L + COL_N + COL_A];
const tcw   = [COL_N, COL_A, COL_T];
const trh   = 20;
let   try_  = doc.y;

doc.rect(L, try_, W, trh).fill(GREEN);
['Nivel de Riesgo ARL', 'Sectores Representativos', 'Tarifa Mensual'].forEach((h, i) => {
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(h, tcols[i] + 5, try_ + 5, { width: tcw[i] - 8, align: i === 2 ? 'right' : 'left', lineBreak: false });
});
try_ += trh;

[
  ['Nivel I — Bajo',         'Oficinas, comercio, servicios financieros',  '$150.000 COP'],
  ['Nivel II — Medio',       'Manufactura ligera, salud, educación',        '$250.000 COP'],
  ['Nivel III — Medio-Alto', 'Industria, transporte, construcción menor',   '$350.000 COP'],
  ['Nivel IV — Alto',        'Construcción, minería superficial, químicos', '$450.000 COP'],
  ['Nivel V — Muy Alto',     'Minería subterránea, explosivos, alturas',    '$550.000 COP'],
].forEach((row, ri) => {
  doc.rect(L, try_, W, trh).fill(ri % 2 === 0 ? '#ffffff' : '#f3faf4');
  doc.rect(L, try_, W, trh).strokeColor('#dddddd').lineWidth(0.4).stroke();
  row.forEach((cell, ci) => {
    doc.fontSize(9)
       .font(ci === 0 || ci === 2 ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(ci === 2 ? GREEN : DARK)
       .text(cell, tcols[ci] + 5, try_ + 5, { width: tcw[ci] - 8, align: ci === 2 ? 'right' : 'left', lineBreak: false });
  });
  try_ += trh;
});
doc.y = try_ + 10;

p('Las tarifas anteriores corresponden EXCLUSIVAMENTE al servicio de auditoría y seguimiento SST mensual — es decir, las visitas de campo y el acompañamiento profesional que requieren la presencia y el criterio licenciado de EL PROFESIONAL.');

// Cuadro explicativo: qué NO genera trabajo adicional al profesional
const cx0 = doc.y;
doc.rect(L, cx0, W, 13).fill('#1f6b41');
doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
   .text('¿Por qué la tarifa cubre solo auditorías?  —  El sistema hace el resto automáticamente', L + 8, cx0 + 3, { width: W - 14, lineBreak: false });
doc.y = cx0 + 13;
const cby = doc.y;
doc.rect(L, cby, W, 52).fill('#f0fff4');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1f6b41')
   .text('SST-Colombia genera de forma automática — sin intervención del profesional:', L + 8, cby + 5, { width: W - 14, lineBreak: false });
const autoItems = [
  'Implementación completa del SG-SST: matrices, formatos, programas y planes normativos.',
  'Informes ejecutivos, estadísticas e indicadores de gestión en tiempo real.',
  'Documentación legal, actas, registros y trazabilidad de todas las actividades.',
];
autoItems.forEach((item, i) => {
  doc.fontSize(8).font('Helvetica').fillColor('#1a4731')
     .text('✓  ' + item, L + 12, cby + 18 + i * 12, { width: W - 20, lineBreak: false });
});
doc.y = cby + 58;

p('EL PROFESIONAL acuerda aplicar estas tarifas a las empresas contratadas a través del ecosistema de SST-Colombia.');

// Bloque servicios adicionales
const iy0 = doc.y;
doc.rect(L, iy0, W, 14).fill('#eef6ef');
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(GREEN)
   .text('Servicios adicionales — Plena autonomía de EL PROFESIONAL', L + 8, iy0 + 3, { width: W - 14, lineBreak: false });
doc.y = iy0 + 20;

p('SST-Colombia incluye en su suscripción la gestión digital de capacitaciones, investigaciones de accidentes, inspecciones, matriz GTC-45, plan de emergencias, auditorías y salud ocupacional. EL PROFESIONAL tiene plena libertad para acordar y cobrar por servicios que requieran presencia física o equipos especializados fuera de la plataforma:');
bul('Impartir capacitaciones presenciales: charlas, talleres y entrenamiento directo a trabajadores en sitio.');
bul('Visitas técnicas presenciales: inspecciones físicas de instalaciones, puestos de trabajo y equipos.');
bul('Ejecución de simulacros de emergencia: coordinación y dirección in situ.');
bul('Exámenes médicos ocupacionales y profesiogramas por médico especialista en salud ocupacional.');
bul('Mediciones ambientales e higiene industrial: ruido, vibraciones, iluminación y material particulado con equipos certificados.');
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
p('Vigencia de doce (12) meses, renovable automáticamente. Cualquiera de las partes puede retirarse con quince (15) días de aviso escrito, sin obligación de indemnización. La alianza termina automáticamente si EL PROFESIONAL pierde su licencia en SST.');

sect('NOVENA', 'CONFIDENCIALIDAD');
p('Ambas partes mantendrán confidencialidad sobre la información intercambiada, durante la vigencia y por dos (2) años posteriores a su terminación.');

sect('DÉCIMA', 'RESOLUCIÓN DE DIFERENCIAS');
p('Las diferencias se resolverán de forma directa en quince (15) días hábiles. De no lograrse acuerdo, las partes acudirán a mecanismos alternativos de solución de conflictos o a la jurisdicción ordinaria de Medellín, Antioquia.');

// ── Firmas ────────────────────────────────────────────────────────────────────
doc.moveDown(0.6);
divider();
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo:',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(1.5);

const sw  = (W - 30) / 2;
const ssy = doc.y;
doc.rect(L, ssy, sw, 76).stroke('#aaaaaa').lineWidth(0.6);
doc.rect(L + sw + 30, ssy, sw, 76).stroke('#aaaaaa').lineWidth(0.6);
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, ssy + 44, { width: sw, align: 'center', lineBreak: false })
   .text('EL PROFESIONAL ALIADO', L + sw + 30, ssy + 44, { width: sw, align: 'center', lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(GRAY)
   .text(RAZÓN, L, ssy + 57, { width: sw, align: 'center', lineBreak: false })
   .text(NIT, L, ssy + 68, { width: sw, align: 'center', lineBreak: false })
   .text('Hernán Valencia Gil', L + sw + 30, ssy + 57, { width: sw, align: 'center', lineBreak: false })
   .text('Profesional en SST  ·  Lic. vigente', L + sw + 30, ssy + 68, { width: sw, align: 'center', lineBreak: false });

// ══════════════════════════════════════════════════════════════════════════════
// INSERTAR ENCABEZADOS EN PÁGINAS 2+ (antes de cerrar el buffer)
// ══════════════════════════════════════════════════════════════════════════════
const range = doc.bufferedPageRange();
for (let i = 1; i < range.count; i++) {
  doc.switchToPage(i);
  doc.rect(L, 55, W, 32).fill(GREEN);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('white')
     .text('SST-Colombia  ·  Acuerdo de Alianza Estratégica', L + 12, 63, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
     .text(`${RAZÓN}  ·  ${NIT}`, L + 12, 76, { lineBreak: false });
}

doc.end();
doc.on('end', () => {
  const r = doc.bufferedPageRange ? doc.bufferedPageRange() : { count: '?' };
  console.log(`PDF listo: ${OUT}`);
});
