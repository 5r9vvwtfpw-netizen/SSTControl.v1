import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/acuerdo-alianza-hernan-valencia.pdf';
const GREEN = '#1e7e34';
const DARK  = '#111111';
const GRAY  = '#555555';
const LGRAY = '#eef6ef';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 58, bottom: 55, left: 65, right: 65 },
  bufferPages: true,
  info: { Title: 'Acuerdo de Alianza Estratégica — Profesional SST', Author: 'SAGDI S.A.S.' },
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
  const bx = L + 10;   // x del bullet
  const tx = L + 24;   // x del texto (sangría colgante)
  const tw = W - 24;   // ancho del texto
  const sy = doc.y;
  // Bullet en su posición fija
  doc.fontSize(10).font('Helvetica').fillColor(DARK)
     .text('\u2022', bx, sy, { width: 12, lineBreak: false });
  // Texto con indent: si hace salto de línea, sigue desde tx, no desde bx
  doc.fontSize(10).font('Helvetica').fillColor(DARK)
     .text(text, tx, sy, { width: tw, align: 'justify', lineGap: 2 });
  doc.moveDown(0.3);
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
doc.rect(L, 55, W, 55).fill(GREEN);
doc.fontSize(16).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.', L + 14, 66, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('white')
   .text('Sistema de Gestión SG-SST Colombia  ·  NIT 902.036.337-4', L + 14, 84, { lineBreak: false });
doc.fontSize(8.5).fillColor('rgba(255,255,255,0.8)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', L + 14, 97, { lineBreak: false });
doc.y = 122;

doc.fontSize(13).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE ALIANZA ESTRATÉGICA', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.25);
doc.fontSize(10).font('Helvetica').fillColor(GRAY)
   .text('Vinculación de Profesional SST a la Red de Aliados de la Plataforma SST Colombia',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.25);
doc.fontSize(9).fillColor(GRAY)
   .text(`Medellín, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`,
         L, doc.y, { width: W, align: 'right' });
doc.moveDown(0.4);
divider();

sect('PRIMERA', 'PARTES');
p('LA PLATAFORMA: SAGDI S.A.S., sociedad identificada con NIT 902.036.337-4, desarrolladora y operadora de la plataforma tecnológica SST Colombia (sst.sagisas.co), en adelante "LA PLATAFORMA".');
p('EL PROFESIONAL ALIADO: Hernán Valencia Gil, Profesional en Seguridad y Salud en el Trabajo con licencia vigente, de conformidad con la Resolución 4927 de 2016 del Ministerio de Trabajo, en adelante "EL PROFESIONAL".');
p('Las partes acuerdan establecer una alianza estratégica voluntaria y no exclusiva, bajo las condiciones descritas en las siguientes cláusulas:');

sect('SEGUNDA', 'NATURALEZA Y OBJETO DE LA ALIANZA');
p('El presente acuerdo establece los términos bajo los cuales EL PROFESIONAL se integra como aliado de la red de Profesionales SST de la plataforma SST Colombia. Esta alianza tiene por objeto:');
bul('Permitir que LA PLATAFORMA sugiera a EL PROFESIONAL como opción de asesoría profesional SST a las empresas que se incorporen a su ecosistema digital.');
bul('Establecer las tarifas de referencia que EL PROFESIONAL aplicará a las empresas que decidan contratarlo directamente.');
bul('Definir las condiciones de uso de la plataforma SST Colombia por parte de EL PROFESIONAL en la atención de sus clientes.');
doc.moveDown(0.2);
p('Esta alianza no genera ninguna relación de subordinación, exclusividad ni vinculación laboral entre las partes. Las empresas clientes de LA PLATAFORMA son completamente libres de contratar a EL PROFESIONAL u optar por otro profesional de su preferencia.');

sect('TERCERA', 'MODELO DE PAGOS — DOS SERVICIOS INDEPENDIENTES');
p('Los servicios que recibe cada empresa cliente son independientes entre sí y se pagan por separado a entidades distintas:');
bul('PAGO A LA PLATAFORMA: Cada empresa paga directamente a SAGDI S.A.S. la suscripción mensual por el uso de la plataforma tecnológica SST Colombia, según el plan contratado. Este pago es obligatorio para todas las empresas que usen la plataforma.');
bul('PAGO AL PROFESIONAL: Las empresas suscritas a la plataforma SST Colombia que decidan contratar a EL PROFESIONAL, le pagarán directamente los honorarios acordados según su nivel de riesgo ARL. Este pago se realiza de forma independiente a la suscripción de la plataforma, pero está enmarcado dentro del ecosistema de servicios de SST Colombia.');
doc.moveDown(0.2);
p('LA PLATAFORMA no actúa como intermediaria en los pagos de honorarios entre las empresas y EL PROFESIONAL, ni recibe comisión alguna por la contratación del servicio profesional.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();

doc.rect(L, 55, W, 28).fill(GREEN);
doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.  ·  Acuerdo de Alianza Estratégica', L + 12, 64, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
   .text('NIT 902.036.337-4  ·  sst.sagisas.co', L + 12, 75, { lineBreak: false });
doc.y = 96;

sect('CUARTA', 'TARIFAS DE REFERENCIA DEL PROFESIONAL SST');
p('Las partes acuerdan las siguientes tarifas mensuales de referencia que EL PROFESIONAL aplicará a las empresas que decidan contratarlo. Estas tarifas serán publicadas como referencia en la plataforma SST Colombia y en los presupuestos del sitio web, para orientación de las empresas:');
doc.moveDown(0.3);

// Tabla
const COL_N = 175;
const COL_A = W - COL_N - 110;
const COL_T = 110;
const tcols = [L, L + COL_N, L + COL_N + COL_A];
const tcw   = [COL_N, COL_A, COL_T];
const trh   = 21;
let   try_  = doc.y;

doc.rect(L, try_, W, trh).fill(GREEN);
['Nivel de Riesgo ARL', 'Actividades Representativas', 'Tarifa / Mes'].forEach((h, i) => {
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
       .font(ci === 0 ? 'Helvetica-Bold' : ci === 2 ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(ci === 2 ? GREEN : DARK)
       .text(cell, tcols[ci] + 5, try_ + 6, { width: tcw[ci] - 8, align: ci === 2 ? 'right' : 'left', lineBreak: false });
  });
  try_ += trh;
});
doc.y = try_ + 8;

p('Estas tarifas podrán ser ajustadas de mutuo acuerdo entre EL PROFESIONAL y cada empresa contratante. LA PLATAFORMA las publica únicamente como referencia orientativa y no es parte en dicha relación contractual.');

sect('QUINTA', 'COMPROMISOS DE EL PROFESIONAL');
bul('Mantener vigente su licencia en SST durante toda la vigencia de esta alianza.');
bul('Atender las empresas que lo contraten utilizando la plataforma SST Colombia.');
bul('Aplicar los más altos estándares técnicos y éticos en la prestación de sus servicios.');
bul('Responder oportunamente las solicitudes de las empresas que lo hayan contratado.');
bul('Informar a LA PLATAFORMA sobre cualquier situación que pueda afectar su disponibilidad.');

sect('SEXTA', 'COMPROMISOS DE LA PLATAFORMA');
bul('Publicar el perfil y tarifas de referencia de EL PROFESIONAL en la plataforma y en el sitio web.');
bul('Proveer a EL PROFESIONAL acceso con perfil de Profesional SST a la plataforma SST Colombia.');
bul('Sugerir a EL PROFESIONAL como opción de asesoría a las empresas que así lo requieran.');
bul('No cobrar comisión ni porcentaje alguno sobre los honorarios pagados a EL PROFESIONAL.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();

doc.rect(L, 55, W, 28).fill(GREEN);
doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
   .text('SAGDI S.A.S.  ·  Acuerdo de Alianza Estratégica', L + 12, 64, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
   .text('NIT 902.036.337-4  ·  sst.sagisas.co', L + 12, 75, { lineBreak: false });
doc.y = 96;

sect('SÉPTIMA', 'AUTONOMÍA E INDEPENDENCIA');
p('EL PROFESIONAL conserva plena autonomía e independencia en la prestación de sus servicios a las empresas que lo contraten. LA PLATAFORMA no interviene, supervisa ni es responsable de la relación contractual entre EL PROFESIONAL y sus clientes. Cada empresa contratante es responsable de verificar las credenciales y la idoneidad del profesional que elija.');
p('La vinculación de una empresa con EL PROFESIONAL es un acuerdo exclusivamente entre ellos dos. LA PLATAFORMA actúa únicamente como facilitador tecnológico y de visibilidad, sin asumir responsabilidad alguna por el contenido, calidad o resultados de los servicios profesionales prestados.');

sect('OCTAVA', 'DURACIÓN Y TERMINACIÓN');
p('El presente acuerdo de alianza tendrá una vigencia de doce (12) meses contados desde su suscripción, renovándose automáticamente por períodos iguales. Cualquiera de las partes podrá retirarse de la alianza mediante comunicación escrita con quince (15) días de anticipación, sin que esto genere obligación de indemnización alguna.');
p('La alianza terminará automáticamente si EL PROFESIONAL pierde o no renueva su licencia en SST, o si LA PLATAFORMA cesa sus operaciones.');

sect('NOVENA', 'CONFIDENCIALIDAD');
p('Ambas partes se comprometen a mantener la confidencialidad sobre la información comercial y operativa que intercambien en el marco de esta alianza, durante su vigencia y por un período de dos (2) años después de su terminación.');

sect('DÉCIMA', 'RESOLUCIÓN DE DIFERENCIAS');
p('Cualquier diferencia derivada de este acuerdo será resuelta de forma directa y amigable dentro de los quince (15) días hábiles siguientes al surgimiento de la misma. De no lograrse acuerdo, las partes acudirán a los mecanismos alternativos de solución de conflictos o a la jurisdicción ordinaria competente.');

// Firmas
doc.moveDown(0.6);
divider();
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo de alianza:',
         L, doc.y, { width: W, align: 'center' });
doc.moveDown(1.5);

const sw = (W - 30) / 2;
const sy = doc.y;
doc.rect(L, sy, sw, 72).stroke('#aaaaaa').lineWidth(0.6);
doc.rect(L + sw + 30, sy, sw, 72).stroke('#aaaaaa').lineWidth(0.6);
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('LA PLATAFORMA', L, sy + 48, { width: sw, align: 'center', lineBreak: false })
   .text('EL PROFESIONAL ALIADO', L + sw + 30, sy + 48, { width: sw, align: 'center', lineBreak: false });
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
