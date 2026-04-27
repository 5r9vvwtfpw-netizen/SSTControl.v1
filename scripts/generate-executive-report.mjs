import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/informe-ejecutivo-sst-colombia.pdf';

// Paleta premium
const NAVY  = '#0a1628';
const GOLD  = '#c9a84c';
const GOLD2 = '#e8c97a';
const TEAL  = '#0d9488';
const CYAN  = '#06b6d4';
const WHITE = '#ffffff';
const LGRAY = '#f8fafc';
const MID   = '#64748b';
const DARK  = '#1e293b';

const RAZÓN = 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.';
const NIT   = 'NIT 902.036.337-4';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 58, bottom: 50, left: 60, right: 60 },
  bufferPages: true,
  info: {
    Title: 'SST-Colombia — Plataforma de Gestión Inteligente',
    Author: RAZÓN,
    Subject: 'Capacidades, automatización y seguridad del sistema',
  },
});
doc.pipe(fs.createWriteStream(OUT));

const PW = doc.page.width;
const PH = doc.page.height;
const W  = PW - 120;
const L  = 60;
const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                'septiembre','octubre','noviembre','diciembre'];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function smallHeader(i, total) {
  doc.rect(0, 0, PW, 38).fill(NAVY);
  doc.rect(0, 0, 5, 38).fill(GOLD);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(GOLD)
     .text('SST-Colombia', L + 8, 13, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
     .text('Plataforma de Gestión Inteligente  ·  Confidencial', L + 90, 14, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.45)')
     .text(`${i} / ${total}`, PW - 80, 14, { width: 48, align: 'right', lineBreak: false });
}

function section(title, subtitle, accent = TEAL) {
  doc.moveDown(0.4);
  const y0 = doc.y;
  doc.rect(L, y0, W, 42).fill(NAVY);
  doc.rect(L, y0, 5, 42).fill(accent);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(WHITE)
     .text(title, L + 18, y0 + 8, { width: W - 22 });
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.6)')
     .text(subtitle, L + 18, y0 + 26, { width: W - 22, lineBreak: false });
  doc.y = y0 + 52;
}

function p(text, opts = {}) {
  doc.fontSize(9.5).font('Helvetica').fillColor(MID)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 2.5, ...opts });
  doc.moveDown(0.4);
}

function moduleCard(icon, title, lines, x, y, w, accent = TEAL) {
  const h = 14 + lines.length * 12.5 + 18;
  doc.rect(x, y, w, h).fill(LGRAY);
  doc.rect(x, y, w, 1).fill(accent);
  // icon circle
  doc.circle(x + 20, y + 20, 12).fill(accent + '22');
  doc.fontSize(11).font('Helvetica-Bold').fillColor(accent)
     .text(icon, x + 14, y + 14, { lineBreak: false });
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
     .text(title, x + 38, y + 13, { width: w - 46, lineBreak: false });
  lines.forEach((l, i) => {
    doc.fontSize(8).font('Helvetica').fillColor(MID)
       .text('· ' + l, x + 38, y + 26 + i * 12.5, { width: w - 46, lineBreak: false });
  });
  return y + h + 6;
}

function statBadge(number, label, x, y, w, accent = GOLD) {
  const h = 62;
  doc.rect(x, y, w, h).fill(NAVY);
  doc.rect(x, y, w, 3).fill(accent);
  doc.fontSize(24).font('Helvetica-Bold').fillColor(accent)
     .text(number, x, y + 10, { width: w, align: 'center', lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.65)')
     .text(label, x + 4, y + 42, { width: w - 8, align: 'center', lineBreak: false });
  return y + h + 8;
}

function secBlock(icon, title, body, x, y, w, accent = CYAN) {
  const lines = Math.ceil(body.length / 60);
  const h = 20 + lines * 12 + 20;
  doc.rect(x, y, w, h).fill(NAVY + 'ee');
  doc.rect(x, y, 3, h).fill(accent);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(accent)
     .text(icon + '  ' + title, x + 14, y + 12, { width: w - 20, lineBreak: false });
  doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
     .text(body, x + 14, y + 27, { width: w - 22, lineGap: 2 });
  return y + h + 7;
}

function reportCard(title, desc, chips, x, y, w) {
  const chipH = Math.ceil(chips.length / 2) * 18;
  const h = 72 + chipH;
  doc.rect(x, y, w, h).fill(LGRAY);
  doc.rect(x, y, w, 3).fill(GOLD);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
     .text(title, x + 10, y + 12, { width: w - 20, lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor(MID)
     .text(desc, x + 10, y + 27, { width: w - 20, lineGap: 1.8 });
  // mini chips
  let cx = x + 10, cy = y + 52;
  chips.forEach(ch => {
    const cw = doc.widthOfString(ch, { fontSize: 7 }) + 14;
    if (cx + cw > x + w - 10) { cx = x + 10; cy += 17; }
    doc.rect(cx, cy, cw, 13).fill(TEAL + '18');
    doc.fontSize(7).font('Helvetica-Bold').fillColor(TEAL)
       .text(ch, cx + 7, cy + 3.5, { lineBreak: false });
    cx += cw + 5;
  });
  return y + h + 8;
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════════════════════════════
// Fondo
doc.rect(0, 0, PW, PH).fill(NAVY);
// Patrón geométrico — líneas diagonales sutiles
for (let i = -20; i < PW + PH; i += 30) {
  doc.moveTo(i, 0).lineTo(i + PH, PH)
     .strokeColor('rgba(255,255,255,0.025)').lineWidth(1).stroke();
}
// Acento izquierdo
doc.rect(0, 0, 6, PH).fill(GOLD);
// Círculo decorativo
doc.circle(PW * 0.82, PH * 0.38, 200)
   .strokeColor(GOLD + '15').lineWidth(1).fillOpacity(0).stroke();
doc.circle(PW * 0.82, PH * 0.38, 130)
   .strokeColor(GOLD + '10').lineWidth(0.5).fillOpacity(0).stroke();

// Marca
doc.rect(L + 8, 72, 60, 60).fill(GOLD);
doc.fontSize(32).font('Helvetica-Bold').fillColor(NAVY)
   .text('SST', L + 12, 86, { lineBreak: false });
doc.fontSize(9).font('Helvetica-Bold').fillColor(NAVY)
   .text('CO', L + 12, 118, { lineBreak: false });

doc.fontSize(10).font('Helvetica-Bold').fillColor(GOLD)
   .text('SST-Colombia', L + 78, 78, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
   .text('sst.sagisas.co', L + 78, 93, { lineBreak: false });

// Línea dorada
doc.moveTo(L + 8, 145).lineTo(PW - 60, 145)
   .strokeColor(GOLD).lineWidth(0.8).stroke();

// Título principal
doc.fontSize(38).font('Helvetica-Bold').fillColor(WHITE)
   .text('Plataforma de', L + 8, 162);
doc.fontSize(38).font('Helvetica-Bold').fillColor(GOLD)
   .text('Gestión Inteligente', L + 8, 202);
doc.fontSize(14).font('Helvetica').fillColor('rgba(255,255,255,0.55)')
   .text('Seguridad y Salud en el Trabajo', L + 8, 248);

// Tagline de valor
doc.rect(L + 8, 285, W - 8, 68).fill('rgba(255,255,255,0.04)');
doc.rect(L + 8, 285, 3, 68).fill(GOLD);
doc.fontSize(10.5).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
   .text(
     'Automatización completa del ciclo SST  ·  Reportes con inteligencia estadística\n' +
     'Portal del empleado integrado  ·  Seguridad de nivel bancario y militar\n' +
     'Custodia de información por 20 años  ·  Cumplimiento Ley 1581/2012',
     L + 20, 300, { width: W - 28, lineGap: 5 }
   );

// Franja inferior
doc.rect(0, PH - 85, PW, 85).fill('rgba(0,0,0,0.35)');
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(GOLD)
   .text('PREPARADO EXCLUSIVAMENTE PARA', L + 8, PH - 68, { lineBreak: false });
doc.fontSize(10).font('Helvetica-Bold').fillColor(WHITE)
   .text('Presentación de Capacidades del Sistema', L + 8, PH - 54, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
   .text(`${RAZÓN}  ·  ${NIT}`, L + 8, PH - 38, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.35)')
   .text(`${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`, PW - 120, PH - 38, { width: 90, align: 'right', lineBreak: false });

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2 — MÓDULOS AUTOMATIZADOS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;

section('Módulos Completamente Automatizados', 'Todo el ciclo SST gestionado desde una sola plataforma  ·  Sin papeles  ·  Sin reprocesos', TEAL);

p('Cada módulo del sistema está diseñado para eliminar el trabajo manual: las alertas se generan solas, los documentos se producen al instante y los indicadores se actualizan en tiempo real. A continuación, los módulos que transforman la operación SST de sus clientes:');

const modW2 = (W - 10) / 2;
let lY = doc.y, rY = doc.y;

const mods = [
  ['[A]', 'Gestión de Trabajadores', [
    'Hoja de vida SST completa por empleado',
    'Control de afiliaciones, EPPs y exámenes',
    'Alertas automáticas de vencimientos',
  ], TEAL],
  ['[LOG]', 'Capacitaciones', [
    'Programación automática según perfil de riesgo',
    'Registro digital de asistencia y evaluaciones',
    'Certificados generados al instante',
  ], TEAL],
  ['[I]', 'Investigación de Accidentes', [
    'Flujo guiado de reporte con árbol de causas',
    'Generación automática del FURAT',
    'Seguimiento de correctivos con alertas',
  ], TEAL],
  ['[S]', 'Inspecciones de Seguridad', [
    'Checklists dinámicos por área y cargo',
    'Hallazgos → Plan de acción automático',
    'Registro fotográfico y trazabilidad',
  ], TEAL],
  ['[P]', 'Matriz de Peligros GTC-45', [
    'Valoración automática de riesgo por cargo',
    'Actualización dinámica con cada cambio',
    'Controles sugeridos según nivel de riesgo',
  ], '#7c3aed'],
  ['[E]', 'Plan de Emergencias', [
    'Brigadas, roles y responsables definidos',
    'Simulacros programados con seguimiento',
    'Documentos legales generados al instante',
  ], '#7c3aed'],
  ['[D]', 'Auditorías Internas', [
    'Evaluación de los 61 estándares Res. 0312',
    'Calificación automática y brecha detectada',
    'Informe para Ministerio del Trabajo en PDF',
  ], '#7c3aed'],
  ['[H]', 'Salud Ocupacional', [
    'Control de exámenes médicos y vencimientos',
    'Perfil sociodemográfico automatizado',
    'Programas de vigilancia epidemiológica',
  ], '#7c3aed'],
];

mods.forEach((m, i) => {
  if (i % 2 === 0) lY = moduleCard(m[0], m[1], m[2], L, lY, modW2, m[3]);
  else {
    rY = moduleCard(m[0], m[1], m[2], L + modW2 + 10, rY, modW2, m[3]);
    lY = rY = Math.max(lY, rY);
  }
});
doc.y = Math.max(lY, rY) + 4;

// PESV mention
doc.rect(L, doc.y, W, 28).fill(GOLD + '15');
doc.rect(L, doc.y, 3, 28).fill(GOLD);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
   .text('+ Módulo PESV completo (Res. 40595/2022)', L + 14, doc.y + 6, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(MID)
   .text('  Evaluación del Plan Estratégico de Seguridad Vial para empresas con flota vehicular — gestión por niveles básico, estándar y avanzado.', L + 14, doc.y + 18, { lineBreak: false });
doc.y += 36;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3 — INFORMES + INDICADORES
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;

section('Informes Inteligentes con Indicadores y Estadísticas',
        'El sistema convierte los datos operativos en información estratégica para la toma de decisiones', GOLD);

p('SST-Colombia no solo almacena información: la convierte en reportes profesionales, gráficas de tendencia e indicadores de gestión que los gerentes y responsables SST pueden usar de inmediato — sin necesidad de procesar datos manualmente.');

// Estadísticas de impacto
doc.moveDown(0.2);
const sbY = doc.y;
const sbW = (W - 21) / 4;
statBadge('+40', 'Tipos de informe\ngenerados automáticamente', L, sbY, sbW, GOLD);
statBadge('100%', 'Documentos con trazabilidad\ny código único de seguimiento', L + sbW + 7, sbY, sbW, TEAL);
statBadge('0%', 'Reproceso manual —\ntodo se genera desde los datos', L + (sbW + 7) * 2, sbY, sbW, CYAN);
statBadge('24/7', 'Disponibilidad para descarga\nde reportes en tiempo real', L + (sbW + 7) * 3, sbY, sbW, '#8b5cf6');
doc.y += 70;

const rcW = (W - 10) / 2;
let rcL = doc.y, rcR = doc.y;

const reports = [
  ['Informe de Cumplimiento Res. 0312', 'Calificación automática de los estándares exigidos por el Ministerio del Trabajo, con brecha identificada y plan de cierre sugerido.', ['% Cumplimiento', 'Brechas por fase', 'Tendencia mensual', 'Ranking estándares']],
  ['Dashboard de Indicadores SST', 'Tablero ejecutivo en tiempo real con los indicadores clave de accidentalidad, capacitación y estado general del sistema SST.', ['Tasa de accidentalidad', 'Frecuencia y severidad', '% Trabajadores capacitados', 'Ausentismo laboral']],
  ['Informe de Accidentalidad', 'Estadísticas detalladas de accidentes e incidentes: causas, áreas críticas, cargos de mayor riesgo y evolución histórica.', ['Causas más frecuentes', 'Áreas de mayor riesgo', 'Días perdidos', 'Costos asociados']],
  ['Reporte de Capacitaciones', 'Cobertura real de la formación por cargo, área y temática. Brecha de entrenamiento identificada automáticamente.', ['% Cobertura por área', 'Horas de capacitación', 'Evaluaciones promedio', 'Pendientes críticos']],
  ['Informe PESV', 'Estado del Plan Estratégico de Seguridad Vial con avance por componente, acciones vencidas y proyección de cumplimiento.', ['% PESV por componente', 'Acciones vencidas', 'Flota gestionada', 'Nivel de cumplimiento']],
  ['Informe para el Ministerio del Trabajo', 'Documento oficial en formato PDF listo para presentar ante cualquier visita de inspección, firmado digitalmente por el profesional SST responsable.', ['Firma digital LSO', 'Código radicación', 'Anexos automáticos', 'Sello de integridad']],
];

reports.forEach((r, i) => {
  if (i % 2 === 0) rcL = reportCard(r[0], r[1], r[2], L, rcL, rcW);
  else {
    rcR = reportCard(r[0], r[1], r[2], L + rcW + 10, rcR, rcW);
    rcL = rcR = Math.max(rcL, rcR);
  }
});
doc.y = Math.max(rcL, rcR) + 4;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 4 — PORTAL DEL EMPLEADO
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;

section('Portal del Empleado — Participación Digital y Transparente',
        'Acceso directo para trabajadores sin intermediarios  ·  Procesos legales 100% digitales', CYAN);

p('El Portal del Empleado es la interfaz que conecta directamente a cada trabajador con el sistema SST de su empresa. Sin necesidad de papel, sin formularios físicos y sin depender de que alguien más registre la información: cada empleado accede desde su celular o computador para participar activamente en los procesos que la ley exige.');

doc.moveDown(0.2);
// Hero block
doc.rect(L, doc.y, W, 50).fill(NAVY);
doc.fontSize(16).font('Helvetica-Bold').fillColor(GOLD)
   .text('¿Por qué es revolucionario?', L + 20, doc.y + 12, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text('La mayoría de sistemas SST son herramientas para el área de RRHH o el profesional SST. SST-Colombia es el único que incluye un portal dedicado al trabajador — convirtiendo el cumplimiento normativo en una experiencia participativa, verificable y sin fricción.', L + 20, doc.y + 32, { width: W - 30, lineBreak: false });
doc.y += 60;

const portalW = (W - 10) / 2;
let pL = doc.y, pR = doc.y;

pL = moduleCard('[V]', 'Elección Digital del COPASST', [
  'Cada trabajador vota directamente desde el portal',
  'Proceso auditado, con acta digital automática',
  'Cumple el requisito legal de elección secreta',
  'Resultado en tiempo real sin escrutinio manual',
], L, pL, portalW, CYAN);

pR = moduleCard('[T]', 'Comité de Convivencia Laboral', [
  'Postulaciones y votación 100% digital',
  'Actas y acuerdos generados automáticamente',
  'Canal confidencial para reportes de conflictos',
  'Trazabilidad completa de reuniones y decisiones',
], L + portalW + 10, pR, portalW, CYAN);
pL = pR = Math.max(pL, pR);

pL = moduleCard('[R]', 'Consulta de Documentos Personales', [
  'Exámenes médicos, contratos y certificados',
  'Historial de capacitaciones y evaluaciones',
  'EPPs asignados y acuses de recibo',
  'Carta de dotación y firma digital',
], L, pL, portalW, '#8b5cf6');

pR = moduleCard('[N]', 'Participación y Comunicación', [
  'Reporte de condiciones inseguras desde el celular',
  'Encuestas de clima laboral y condiciones de trabajo',
  'Notificaciones automáticas de capacitaciones',
  'Confirmación digital de lectura de políticas',
], L + portalW + 10, pR, portalW, '#8b5cf6');
pL = pR = Math.max(pL, pR);

doc.y = pL + 4;

// Acceso
doc.rect(L, doc.y, W, 36).fill(TEAL + '18');
doc.rect(L, doc.y, 3, 36).fill(TEAL);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
   .text('Acceso universal — sin complicaciones', L + 14, doc.y + 8, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor(MID)
   .text('El trabajador accede con su número de cédula. No necesita recordar contraseñas complejas. Compatible con cualquier celular, tableta o computador con conexión a internet.', L + 14, doc.y + 20, { width: W - 22, lineBreak: false });
doc.y += 46;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 5 — SEGURIDAD
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;

section('Seguridad de Nivel Bancario y Militar',
        'Protección multicapa diseñada para información crítica de personas  ·  El estándar más alto del mercado', GOLD);

p('La información de los trabajadores — datos de salud, documentos de identidad, historiales médicos — es tan sensible como cualquier dato bancario. SST-Colombia fue construida con los mismos estándares de seguridad que usan las entidades financieras y las plataformas de defensa para proteger información crítica:');

doc.moveDown(0.2);
const sw = (W - 10) / 2;
let sL = doc.y, sR = doc.y;

sL = secBlock('[ENC]', 'Cifrado AES-256-GCM',
  'Todos los datos sensibles de los trabajadores están cifrados con el algoritmo AES-256-GCM — el mismo estándar que usan los bancos centrales y las fuerzas militares del mundo para proteger información clasificada. Incluso con acceso físico al servidor, los datos son ilegibles sin la llave de descifrado.',
  L, sL, sw, GOLD);

sR = secBlock('[AWS]', 'Infraestructura AWS (Amazon)',
  'La plataforma opera sobre Amazon Web Services (AWS) — la infraestructura en la nube más utilizada en el mundo por gobiernos, bancos y empresas Fortune 500. Certificaciones ISO 27001, SOC 2, PCI-DSS. Centros de datos con control biométrico, vigilancia 24/7 y redundancia geográfica.',
  L + sw + 10, sR, sw, CYAN);
sL = sR = Math.max(sL, sR);

sL = secBlock('[ROL]', 'Control de Acceso por 11 Niveles',
  'El sistema tiene 11 roles distintos con permisos independientes. El trabajador solo ve su información. El administrador de empresa solo ve su empresa. El auditor externo tiene acceso de solo lectura. Ningún usuario puede ver más allá de lo que le corresponde — por diseño, no por configuración.',
  L, sL, sw, '#8b5cf6');

sR = secBlock('[PWD]', 'Contraseñas con Hash Irreversible',
  'Las contraseñas nunca se almacenan — se guarda únicamente su huella digital cifrada (bcrypt). Ni el administrador del sistema puede recuperar una contraseña. Si se olvida, solo el usuario puede restablecerla mediante verificación de identidad. Igual que los bancos.',
  L + sw + 10, sR, sw, '#8b5cf6');
sL = sR = Math.max(sL, sR);

sL = secBlock('[TLS]', 'Comunicación HTTPS / TLS 1.3',
  'Toda la comunicación entre el usuario y la plataforma viaja cifrada con TLS 1.3 — el protocolo más moderno disponible. Ningún dato puede ser interceptado en tránsito. El mismo nivel de protección que usan las plataformas de pagos internacionales.',
  L, sL, sw, TEAL);

sR = secBlock('[LOG]', 'Registro de Auditoría Inviolable',
  'Cada acción relevante dentro del sistema queda registrada en un log de auditoría: quién lo hizo, cuándo, desde qué dispositivo y qué cambió. Este registro no puede ser modificado ni borrado — ni siquiera por el administrador. Estándar de cumplimiento ISO 27001.',
  L + sw + 10, sR, sw, TEAL);
sL = sR = Math.max(sL, sR);

doc.y = sL + 4;

// Barra de confianza
doc.rect(L, doc.y, W, 42).fill(NAVY);
const certs = ['ISO 27001', 'AWS Certified', 'HTTPS / TLS 1.3', 'AES-256-GCM', 'PCI-DSS Grade', 'SOC 2 Type II'];
let certX = L + 15;
const certY = doc.y + 14;
certs.forEach(c => {
  const cw = doc.widthOfString(c, { fontSize: 7.5 }) + 16;
  doc.rect(certX, certY, cw, 14).fill(GOLD + '25');
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GOLD2)
     .text(c, certX + 8, certY + 3.5, { lineBreak: false });
  certX += cw + 8;
});
doc.y += 50;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 6 — PROTECCIÓN DE DATOS + GARANTÍAS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;

section('Ley 1581/2012 y Custodia de Información por 20 Años',
        'Cumplimiento legal total sobre protección de datos  ·  Información disponible y segura por dos décadas', '#dc2626');

p('La información de sus clientes y sus trabajadores está protegida no solo por tecnología, sino por las más estrictas garantías legales y operacionales disponibles en Colombia. SST-Colombia es la única plataforma del mercado que ofrece custodia documental garantizada por 20 años:');

doc.moveDown(0.2);

// 3 grandes bloques garantía
const gw = (W - 14) / 3;
const gy = doc.y;

// Bloque 1 — Ley 1581
doc.rect(L, gy, gw, 165).fill(NAVY);
doc.rect(L, gy, gw, 5).fill('#dc2626');
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(WHITE)
   .text('Ley 1581 de 2012', L + 12, gy + 16, { width: gw - 20 });
doc.fontSize(8).font('Helvetica').fillColor(GOLD2)
   .text('Protección de Datos Personales', L + 12, gy + 34, { width: gw - 20 });
const ley1items = [
  'Datos recopilados con propósito definido y consentimiento',
  'Almacenamiento cifrado y controlado',
  'Acceso restringido solo a personas autorizadas',
  'Derecho de rectificación y supresión garantizado',
  'Sin transferencia a terceros sin autorización',
  'Registro de bases de datos ante SIC',
  'Política de privacidad actualizada y publicada',
];
ley1items.forEach((item, i) => {
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
     .text('*  ' + item, L + 12, gy + 52 + i * 15, { width: gw - 20, lineBreak: false });
});

// Bloque 2 — Copias de seguridad
doc.rect(L + gw + 7, gy, gw, 165).fill(NAVY);
doc.rect(L + gw + 7, gy, gw, 5).fill(TEAL);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(WHITE)
   .text('Copias de Seguridad', L + gw + 19, gy + 16, { width: gw - 20 });
doc.fontSize(8).font('Helvetica').fillColor(GOLD2)
   .text('Backups automáticos multicapa', L + gw + 19, gy + 34, { width: gw - 20 });
const backupItems = [
  'Respaldo automático diario de toda la información',
  'Backup incremental cada 6 horas (datos críticos)',
  'Replicación geográfica en múltiples regiones',
  'Punto de recuperación: máximo 6 horas de pérdida',
  'Tiempo de restauración: menos de 4 horas',
  'Pruebas de restauración mensuales certificadas',
  'Sin costo adicional — incluido en la suscripción',
];
backupItems.forEach((item, i) => {
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
     .text('*  ' + item, L + gw + 19, gy + 52 + i * 15, { width: gw - 20, lineBreak: false });
});

// Bloque 3 — 20 años
doc.rect(L + (gw + 7) * 2, gy, gw, 165).fill(NAVY);
doc.rect(L + (gw + 7) * 2, gy, gw, 5).fill(GOLD);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(WHITE)
   .text('Custodia 20 Años', L + (gw + 7) * 2 + 12, gy + 16, { width: gw - 20 });
doc.fontSize(8).font('Helvetica').fillColor(GOLD2)
   .text('Resguardo garantizado por contrato', L + (gw + 7) * 2 + 12, gy + 34, { width: gw - 20 });
const años20Items = [
  'Toda la información histórica disponible siempre',
  'Acceso a registros de hasta 20 años atrás',
  'Documentos con validez legal probatoria',
  'Respaldo ante demandas, auditorías o litigios',
  'Sin pérdida por cambios de versión o migración',
  'Garantía contractual de continuidad del servicio',
  'Exportación total de datos en cualquier momento',
];
años20Items.forEach((item, i) => {
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
     .text('*  ' + item, L + (gw + 7) * 2 + 12, gy + 52 + i * 15, { width: gw - 20, lineBreak: false });
});
doc.y = gy + 173;

// Por qué importa
doc.moveDown(0.3);
doc.rect(L, doc.y, W, 58).fill(NAVY);
doc.rect(L, doc.y, 5, 58).fill(GOLD);
doc.fontSize(10).font('Helvetica-Bold').fillColor(GOLD)
   .text('¿Por qué la custodia de 20 años es crítica?', L + 18, doc.y + 10, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text(
     'El Ministerio del Trabajo y los tribunales laborales pueden requerir evidencia de gestión SST con hasta 20 años de retroactividad en casos de enfermedad laboral o accidentes graves. Con SST-Colombia, la empresa siempre puede demostrar qué hizo, cuándo lo hizo y quién fue el responsable — con documentos legalmente válidos.',
     L + 18, doc.y + 26, { width: W - 28, lineGap: 2.5 }
   );
doc.y += 68;

// Cierre final
doc.moveDown(0.2);
doc.rect(L, doc.y, W, 72).fill(GOLD + '12');
doc.rect(L, doc.y, W, 2).fill(GOLD);
doc.rect(L, doc.y + 70, W, 2).fill(GOLD);
doc.fontSize(14).font('Helvetica-Bold').fillColor(NAVY)
   .text('La plataforma que sus clientes necesitan  —  y que su empresa merece ofrecer', L + 20, doc.y + 12, { width: W - 40, align: 'center' });
doc.fontSize(9).font('Helvetica').fillColor(MID)
   .text('Automatización  ·  Inteligencia estadística  ·  Portal del empleado  ·  Seguridad bancaria  ·  Custodia 20 años', L + 20, doc.y + 40, { width: W - 40, align: 'center', lineBreak: false });
doc.y += 80;

doc.fontSize(8.5).font('Helvetica-Bold').fillColor(NAVY)
   .text(RAZÓN, L, doc.y, { width: W, align: 'center', lineBreak: false });
doc.moveDown(0.3);
doc.fontSize(8).font('Helvetica').fillColor(MID)
   .text(`${NIT}  ·  admin@sst-colombia.com  ·  sst.sagisas.co`, L, doc.y, { width: W, align: 'center', lineBreak: false });

// ══════════════════════════════════════════════════════════════════════════════
// POST-PROCESO: encabezados en páginas 2+
// ══════════════════════════════════════════════════════════════════════════════
const range = doc.bufferedPageRange();
const total  = range.count;

for (let i = 1; i < total; i++) {
  doc.switchToPage(i);
  smallHeader(i + 1, total);
}

doc.end();
doc.on('end', () => console.log(`PDF listo: ${OUT}  (${total} páginas)`));
