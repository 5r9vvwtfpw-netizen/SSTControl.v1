const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
  info: {
    Title: 'SST Colombia – Folleto Comercial',
    Author: 'SST Colombia – SAGISAS SAS',
  }
});

const outPath = path.join(__dirname, '..', 'folleto-sst-colombia.pdf');
doc.pipe(fs.createWriteStream(outPath));

const W = 595.28;
const H = 841.89;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const col1x = 30;
const col2x = W / 2 + 10;
const colW  = W / 2 - 40;

function hex(color) { return color; }

// ─── HEADER BAND ─────────────────────────────────────────────────────────────
doc.rect(0, 0, W, 88).fill('#1B4332');
doc.rect(0, 88, W, 5).fill('#40916C');

doc.fillColor('#FFFFFF')
   .font('Helvetica-Bold').fontSize(22)
   .text('SST COLOMBIA™', 30, 18);

doc.font('Helvetica').fontSize(9).fillColor('#A8D8B9')
   .text('Sistema Integral de Gestión en Salud y Seguridad en el Trabajo', 30, 44);

doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
   .text('Cumplimiento · Digitalización · Trazabilidad', 30, 58);

// Badge: ISO 45001 | Res. 0312/2019 | PESV Res. 40595/2022
const badges = ['ISO 45001:2018', 'Res. 0312/2019', 'PESV · Res. 40595/2022'];
let bx = W - 30;
badges.reverse().forEach(b => {
  const tw = doc.widthOfString(b, { fontSize: 7 }) + 10;
  bx -= tw + 4;
  doc.roundedRect(bx, 30, tw, 15, 4).fill('#40916C');
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#FFFFFF')
     .text(b, bx + 5, 34.5, { lineBreak: false });
});

// ─── INTRO BLOCK ─────────────────────────────────────────────────────────────
doc.rect(0, 93, W, 42).fill('#F0FAF4');
doc.font('Helvetica').fontSize(8.5).fillColor('#1B4332')
   .text(
     'SST Colombia digitaliza y automatiza el ciclo PHVA completo de su organización: ' +
     'desde la asignación del Licenciado SST hasta la firma digital del trabajador, dejando ' +
     'generados automáticamente los informes exigidos por el Ministerio de Trabajo ' +
     'y la Superintendencia de Transporte. Todo en una sola plataforma, sin papeles.',
     30, 100, { width: W - 60, align: 'justify' }
   );

// ─── SECTION TITLE helper ────────────────────────────────────────────────────
function sectionTitle(text, x, y, w) {
  doc.rect(x, y, w, 14).fill('#1B4332');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF')
     .text(text.toUpperCase(), x + 6, y + 3.5, { width: w - 8, lineBreak: false });
  return y + 14;
}

// ─── BULLET helper ───────────────────────────────────────────────────────────
function bullet(text, x, y, w, accent) {
  doc.circle(x + 4, y + 3.8, 2.5).fill(accent || '#40916C');
  doc.font('Helvetica').fontSize(7.5).fillColor('#1a1a1a')
     .text(text, x + 11, y, { width: w - 12, lineBreak: false });
  return y + 12;
}

function bulletBold(label, body, x, y, w, accent) {
  doc.circle(x + 4, y + 3.8, 2.5).fill(accent || '#40916C');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1a1a1a')
     .text(label + ' ', x + 11, y, { width: w - 12, continued: true, lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor('#444')
     .text(body, { width: w - 12, lineBreak: false });
  return y + 12;
}

// ─── LEFT COLUMN ─────────────────────────────────────────────────────────────
let ly = 142;

// 1) Módulos SST
ly = sectionTitle('Módulos SG-SST — Ciclo PHVA Completo', col1x, ly, colW + 10);
ly += 4;

const sstMods = [
  ['Gestión de Trabajadores', 'perfil sociodemográfico, afiliaciones SGSSS, EPP, inducción'],
  ['Evaluación Inicial (Res. 0312/2019)', 'diagnóstico por estándar, semáforo de cumplimiento'],
  ['Matriz de Peligros GTC-45', 'valoración de riesgos, controles por cargo'],
  ['Capacitaciones y Programa Anual', 'asistencia digital con firma, indicadores de cobertura'],
  ['COPASST / Comité de Convivencia', 'períodos, actas, seguimiento de compromisos'],
  ['Investigación de Accidentes', 'árbol de causas, FURAT automático, indicadores'],
  ['Vigilancia Epidemiológica', 'seguimiento de casos, estadísticas por patología'],
  ['Objetivos SST y Plan de Trabajo', 'metas, avances, trazabilidad al ciclo PHVA'],
  ['Brigadas de Emergencia', 'roles, equipos asignados, cronograma de simulacros'],
  ['Organigrama SST', 'estructura jerárquica legal (Decreto 1072/2015 Art. 2.2.4.6.8)'],
];

sstMods.forEach(([label, body]) => {
  ly = bulletBold(label + ':', body, col1x, ly, colW + 10);
});

ly += 6;

// 2) Informes Ministerio de Trabajo
ly = sectionTitle('Informes Generados — Ministerio de Trabajo', col1x, ly, colW + 10);
ly += 4;

const mintrabReports = [
  'Informe de cumplimiento Res. 0312/2019 con "Hilo Dorado" de trazabilidad',
  'FURAT (Formato Único de Reporte) listo para radicar ante ARL y Ministerio',
  'Plan de Mejoramiento con acciones, responsables y fechas de cierre',
  'Programa Anual de Capacitación con registros firmados digitalmente',
  'Estadísticas de accidentalidad: tasa de incidencia, severidad, letalidad',
  'Actas de COPASST firmadas y archivadas con control de cumplimiento',
  'Certificados de entrega de EPP con firma del trabajador desde el celular',
];

mintrabReports.forEach(t => { ly = bullet(t, col1x, ly, colW + 10, '#1B4332'); });

// ─── RIGHT COLUMN ─────────────────────────────────────────────────────────────
let ry = 142;

// 3) Módulo PESV
ry = sectionTitle('Módulo PESV — Res. 40595/2022 (Supertransporte)', col2x, ry, colW + 10);
ry += 4;

const pesvMods = [
  ['Evaluación de 24 pasos PHVA', 'P01-P08 · H01-H11 · V01-V03 · A01-A02, con nivel de cumplimiento %'],
  ['Conductores y Licencias', 'vencimiento de licencias, categorías, comparendos por conductor'],
  ['Flota vehicular', 'hoja de vida del vehículo, SOAT, revisión técnico-mecánica, mantenimiento'],
  ['Inspecciones Pre-operacionales', 'checklist digital desde celular, firma del conductor, historial'],
  ['Encuesta Diaria de Aptitud', 'fatiga, somnolencia, consumo de sustancias — registro trazable'],
  ['Control de Alcohol y Sustancias', 'registro de pruebas con resultado y nombre del responsable'],
  ['Rutas Seguras', 'análisis de rutas, riesgos viales identificados, controles aplicados'],
  ['Comité de Seguridad Vial', 'actas, integrantes, cronograma de reuniones, actos administrativos'],
  ['Siniestros Viales', 'investigación, árbol de causas, costos, indicadores de siniestralidad'],
  ['Plan de Mejora Continua (PESV)', 'acciones correctivas con trazabilidad bidireccional a pasos PHVA'],
  ['Indicadores PESV', 'tasas de siniestralidad, cobertura de conductores, cumplimiento por paso'],
];

pesvMods.forEach(([label, body]) => {
  ry = bulletBold(label + ':', body, col2x, ry, colW + 10);
});

ry += 6;

// 4) Informes Supertransporte
ry = sectionTitle('Informes Generados — Superintendencia de Transporte', col2x, ry, colW + 10);
ry += 4;

const superTReports = [
  'Diagnóstico PESV: % de cumplimiento por fase (Planear, Hacer, Verificar, Actuar)',
  'Informe de siniestralidad vial con indicadores exigidos por Res. 40595/2022',
  'Reporte de conductores: licencias, vencimientos, comparendos y aptitud',
  'Actas del Comité de Seguridad Vial firmadas y listas para entrega',
  'Evidencias documentales por paso PESV exportables en PDF para auditoría',
  'Plan de mejora con estado de cada acción y responsable asignado',
];

superTReports.forEach(t => { ry = bullet(t, col2x, ry, colW + 10, '#1B4332'); });

// ─── VALOR DIFERENCIAL ────────────────────────────────────────────────────────
const diffY = Math.max(ly, ry) + 8;

doc.rect(0, diffY, W, 14).fill('#40916C');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF')
   .text('¿QUÉ NOS DIFERENCIA?', 30, diffY + 3.5);

const diffs = [
  { icon: '✔', text: 'Portal del empleado móvil — el trabajador firma, responde encuestas e inspecciones desde su celular, sin papel' },
  { icon: '✔', text: 'Firma digital del Licenciado SST (LSO) — 5 tipos de documentos firmados con número de licencia y validez legal' },
  { icon: '✔', text: 'Multi-empresa con clasificación automática por CIIU y ARL — niveles de riesgo y estándares aplicables calculados al instante' },
  { icon: '✔', text: 'Informes con "Hilo Dorado" — cada PDF del Ministerio incluye trazabilidad cruzada entre hallazgo, acción y evidencia' },
  { icon: '✔', text: 'Alertas automáticas de cumplimiento — notifica estándares 0312 pendientes, vencimientos de licencias y acciones atrasadas' },
];

let dy = diffY + 18;
diffs.forEach(d => {
  doc.circle(col1x + 4, dy + 3.8, 2.5).fill('#1B4332');
  doc.font('Helvetica').fontSize(7.5).fillColor('#1a1a1a')
     .text(d.text, col1x + 11, dy, { width: W - 52, lineBreak: false });
  dy += 12;
});

// ─── FOOTER BAND ─────────────────────────────────────────────────────────────
const footY = H - 42;
doc.rect(0, footY, W, 42).fill('#1B4332');

doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
   .text('Solicite su demostración de 10 minutos:', 30, footY + 8);

doc.font('Helvetica').fontSize(8).fillColor('#A8D8B9')
   .text('sst.sagisas.co  ·  Adriana Díaz · CEO · SST Colombia · SAGISAS SAS', 30, footY + 21);

doc.font('Helvetica').fontSize(7.5).fillColor('#6BCB8B')
   .text('Plataforma en la nube · Implementación inmediata · Soporte técnico incluido · Sin instalaciones', 30, footY + 33);

doc.end();
console.log('PDF generado en:', outPath);
