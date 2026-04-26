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
  margins: { top: 95, bottom: 50, left: 62, right: 62 },
  info: { Title: 'Acuerdo de Alianza Estratégica — Profesional SST', Author: RAZÓN },
});
doc.pipe(fs.createWriteStream(OUT));

const W  = doc.page.width  - 124;   // 488 pt
const L  = 62;
const PH = doc.page.height;         // 792 pt
const MB = 50;                       // bottom margin
const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                'septiembre','octubre','noviembre','diciembre'];

// ── Pequeño encabezado para páginas 2 y 3 ────────────────────────────────────
function pageHeader() {
  doc.rect(L, 52, W, 29).fill(GREEN);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor('white')
     .text('SST-Colombia  ·  Acuerdo de Alianza Estratégica', L + 10, 59, { lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.82)')
     .text(`${RAZÓN}  ·  ${NIT}`, L + 10, 71, { lineBreak: false });
}

// Registrar encabezado en páginas 2+ (pageAdded no dispara para la página 1 del constructor)
doc.on('pageAdded', pageHeader);

// ── HELPERS ───────────────────────────────────────────────────────────────────
function sect(num, title) {
  doc.moveDown(0.4);
  const y0 = doc.y;
  doc.rect(L, y0, W, 15).fill(LGRAY);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(GREEN)
     .text(`${num} — ${title}`, L + 6, y0 + 3, { width: W - 10, lineBreak: false });
  doc.y = y0 + 19;
  doc.moveDown(0.2);
}

function p(text) {
  doc.fontSize(9).font('Helvetica').fillColor(DARK)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 1 });
  doc.moveDown(0.35);
}

function bul(text) {
  const sy = doc.y;
  doc.fontSize(9).font('Helvetica').fillColor(DARK)
     .text('\u2022', L + 8, sy, { width: 10, lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor(DARK)
     .text(text, L + 20, sy, { width: W - 20, align: 'justify', lineGap: 1 });
  doc.moveDown(0.18);
}

function divider() {
  doc.moveDown(0.25);
  doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor('#cccccc').lineWidth(0.5).stroke();
  doc.moveDown(0.3);
}

// ════════════════════════════════════════════════════════════════════════════
// PÁGINA 1 — Encabezado principal
// ════════════════════════════════════════════════════════════════════════════
doc.rect(L, 50, W, 53).fill(GREEN);
doc.fontSize(17).font('Helvetica-Bold').fillColor('white')
   .text('SST-Colombia', L + 12, 58, { lineBreak: false });
doc.fontSize(8).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.95)')
   .text(RAZÓN, L + 12, 82, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text(`${NIT}  ·  sst.sagisas.co  ·  admin@sst-colombia.com`, L + 12, 93, { lineBreak: false });
doc.y = 118;

doc.fontSize(12).font('Helvetica-Bold').fillColor(DARK)
   .text('ACUERDO DE ALIANZA ESTRATÉGICA', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.18);
doc.fontSize(9).font('Helvetica').fillColor(GRAY)
   .text('Vinculación de Profesional SST a la Red de Aliados de SST-Colombia', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.18);
doc.fontSize(8.5).fillColor(GRAY)
   .text(`Medellín, ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`, L, doc.y, { width: W, align: 'right' });
doc.moveDown(0.28);
divider();

// ── CLÁUSULAS ─────────────────────────────────────────────────────────────────
sect('PRIMERA', 'DEFINICIONES Y PARTES');
bul(`LA EMPRESA: ${RAZÓN}, ${NIT}, domiciliada en Medellín, representada por Luz Adriana Díaz Calle, comercializadora de SST-Colombia. En adelante "LA EMPRESA".`);
bul('SST-Colombia: Plataforma tecnológica SG-SST (sst.sagisas.co). En adelante "LA PLATAFORMA".');
bul('EL PROFESIONAL: Hernán Valencia Gil, Profesional en SST, licencia vigente (Res. 4927/2016). En adelante "EL PROFESIONAL".');
p('Las partes suscriben este acuerdo de forma voluntaria y no exclusiva.');

sect('SEGUNDA', 'OBJETO DE LA ALIANZA');
bul('Incluir el perfil de EL PROFESIONAL como opción de asesoría SST en el ecosistema de LA PLATAFORMA.');
bul('Acordar las tarifas del servicio de acompañamiento SST mensual para las empresas que lo contraten.');
bul('Definir derechos, compromisos y autonomía. Esta alianza no genera relación laboral ni exclusividad.');

sect('TERCERA', 'MODELO DE PAGOS — DOS SERVICIOS INDEPENDIENTES');
bul('SUSCRIPCIÓN: Cada empresa paga a LA EMPRESA la tarifa mensual por uso de SST-Colombia (obligatorio).');
bul('HONORARIOS: Las empresas pagan directamente a EL PROFESIONAL según la Cláusula Cuarta (independiente de la suscripción).');
p('LA EMPRESA no interviene en los pagos entre empresas y EL PROFESIONAL.');

sect('CUARTA', 'TARIFAS DEL SERVICIO DE ACOMPAÑAMIENTO SST MENSUAL');
p('Tarifas acordadas según nivel de riesgo ARL, determinado por el CIIU registrado en la plataforma:');
doc.moveDown(0.1);

// Tabla
const C1 = 160; const C3 = 100; const C2 = W - C1 - C3;
const cx = [L, L+C1, L+C1+C2];  const cw = [C1, C2, C3];
const rh = 17;  let ty = doc.y;

doc.rect(L, ty, W, rh).fill(GREEN);
['Nivel de Riesgo ARL','Sectores Representativos','Tarifa/Mes'].forEach((h,i)=>{
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('white')
     .text(h, cx[i]+4, ty+4, {width:cw[i]-6, align: i===2?'right':'left', lineBreak:false});
}); ty += rh;

[['Nivel I — Bajo','Oficinas, comercio, servicios financieros','$150.000'],
 ['Nivel II — Medio','Manufactura ligera, salud, educación','$250.000'],
 ['Nivel III — Medio-Alto','Industria, transporte, construcción menor','$350.000'],
 ['Nivel IV — Alto','Construcción, minería, químicos','$450.000'],
 ['Nivel V — Muy Alto','Minería subterránea, explosivos, alturas','$550.000'],
].forEach((row,ri)=>{
  doc.rect(L,ty,W,rh).fill(ri%2===0?'#fff':'#f3faf4');
  doc.rect(L,ty,W,rh).strokeColor('#ddd').lineWidth(0.4).stroke();
  row.forEach((cell,ci)=>{
    doc.fontSize(8.5).font(ci===0||ci===2?'Helvetica-Bold':'Helvetica').fillColor(ci===2?GREEN:DARK)
       .text(cell, cx[ci]+4, ty+4, {width:cw[ci]-6, align:ci===2?'right':'left', lineBreak:false});
  }); ty += rh;
});
doc.y = ty + 8;
p('EL PROFESIONAL aplicará estas tarifas a las empresas contratadas a través del ecosistema de SST-Colombia.');

// Bloque servicios adicionales — solo si hay espacio suficiente
if (doc.y + 130 > PH - MB) doc.addPage();

const gy = doc.y;
doc.rect(L, gy, W, 13).fill('#eef6ef');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(GREEN)
   .text('Servicios adicionales — Plena autonomía de EL PROFESIONAL', L+6, gy+2.5, {width:W-10, lineBreak:false});
doc.y = gy + 16;

p('SST-Colombia gestiona digitalmente capacitaciones, investigaciones, inspecciones, matriz GTC-45, plan de emergencias, auditorías y salud ocupacional. EL PROFESIONAL puede cobrar libremente por servicios con presencia física o equipos especializados:');
bul('Capacitaciones presenciales: charlas, talleres y entrenamiento directo a trabajadores en sitio.');
bul('Visitas e inspecciones físicas de instalaciones, puestos de trabajo y equipos en sitio.');
bul('Dirección y ejecución in situ de simulacros de emergencia y evacuación.');
bul('Exámenes médicos ocupacionales y profesiogramas (médico especialista en salud ocupacional).');
bul('Mediciones ambientales: ruido, vibraciones, iluminación, material particulado con equipos certificados.');

sect('QUINTA', 'COMPROMISOS DE EL PROFESIONAL');
bul('Mantener vigente su licencia SST y aplicar las tarifas de la Cláusula Cuarta para el acompañamiento mensual.');
bul('Usar SST-Colombia como herramienta de gestión y actuar con los más altos estándares técnicos y éticos.');
bul('Notificar a LA EMPRESA ante cualquier situación que afecte su disponibilidad o licencia.');

sect('SEXTA', 'COMPROMISOS DE LA EMPRESA');
bul('Publicar el perfil y tarifas de EL PROFESIONAL en la plataforma y mostrarlos al momento del registro de cada empresa.');
bul('Proveer acceso con perfil Profesional SST sin costo y sugerirlo como opción, dejando la decisión final a la empresa.');

sect('SÉPTIMA', 'AUTONOMÍA, DURACIÓN Y CONFIDENCIALIDAD');
bul('Autonomía: EL PROFESIONAL actúa con plena independencia. LA EMPRESA es solo facilitador tecnológico y de visibilidad.');
bul('Duración: doce (12) meses renovables. Retiro con 15 días de aviso escrito. Termina si EL PROFESIONAL pierde la licencia.');
bul('Confidencialidad: información intercambiada se mantiene reservada durante la vigencia y por dos (2) años posteriores.');

sect('OCTAVA', 'RESOLUCIÓN DE DIFERENCIAS');
p('Las diferencias se resolverán directamente en 15 días hábiles. De no lograrse acuerdo, se acudirá a la jurisdicción ordinaria de Medellín, Antioquia.');

// ── Firmas ────────────────────────────────────────────────────────────────────
doc.moveDown(0.4);
divider();
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK)
   .text('En señal de aceptación, las partes suscriben el presente acuerdo:', L, doc.y, {width:W, align:'center'});
doc.moveDown(1.2);

const sw = (W - 28) / 2;
const fy = doc.y;
doc.rect(L, fy, sw, 68).stroke('#aaa').lineWidth(0.5);
doc.rect(L+sw+28, fy, sw, 68).stroke('#aaa').lineWidth(0.5);
doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK)
   .text('LA EMPRESA', L, fy+38, {width:sw, align:'center', lineBreak:false})
   .text('EL PROFESIONAL ALIADO', L+sw+28, fy+38, {width:sw, align:'center', lineBreak:false});
doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
   .text(RAZÓN, L, fy+50, {width:sw, align:'center', lineBreak:false})
   .text(NIT, L, fy+60, {width:sw, align:'center', lineBreak:false})
   .text('Hernán Valencia Gil', L+sw+28, fy+50, {width:sw, align:'center', lineBreak:false})
   .text('Profesional en SST  ·  Lic. vigente', L+sw+28, fy+60, {width:sw, align:'center', lineBreak:false});

doc.y = fy + 80;
divider();
doc.fontSize(7.5).font('Helvetica').fillColor('#aaa')
   .text(`${RAZÓN}  ·  ${NIT}  ·  admin@sst-colombia.com  ·  sst.sagisas.co`, L, doc.y, {width:W, align:'center', lineBreak:false});

doc.end();
doc.on('end', () => console.log(`PDF listo: ${OUT}`));
