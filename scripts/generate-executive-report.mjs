import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT = './attached_assets/informe-ejecutivo-sst-colombia.pdf';

// ── Paleta: Verde claro · Blanco · Negro ─────────────────────────────────────
const GREEN  = '#2e8b57';   // verde principal (sea green — más claro y amable)
const DGREEN = '#1f6b41';   // verde oscuro (portada, headers de sección)
const MGREEN = '#48bb78';   // verde medio / acento
const LGREEN = '#f0fff4';   // verde muy claro (fondos de card)
const BGREEN = '#9ae6b4';   // verde borde sutil
const WHITE  = '#ffffff';
const BLACK  = '#111111';
const DARK   = '#1f2937';
const MID    = '#4b5563';
const LGRAY  = '#f9fafb';
const BORDER = '#d1d5db';

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
  doc.rect(0, 0, PW, 38).fill(DGREEN);
  doc.rect(0, 0, 5, 38).fill(MGREEN);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(WHITE)
     .text('SST-Colombia', L + 8, 13, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.55)')
     .text('Plataforma de Gestion Inteligente  -  Confidencial', L + 100, 14, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
     .text(`${i} / ${total}`, PW - 80, 14, { width: 48, align: 'right', lineBreak: false });
}

function section(title, subtitle) {
  doc.moveDown(0.3);
  const y0 = doc.y;
  doc.rect(L, y0, W, 44).fill(GREEN);
  doc.rect(L, y0, 5, 44).fill(MGREEN);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(WHITE)
     .text(title, L + 18, y0 + 8, { width: W - 24, lineBreak: false });
  doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.72)')
     .text(subtitle, L + 18, y0 + 28, { width: W - 24, lineBreak: false });
  doc.y = y0 + 54;
}

function p(text, opts = {}) {
  doc.fontSize(9.5).font('Helvetica').fillColor(DARK)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 2.5, ...opts });
  doc.moveDown(0.4);
}

// Tarjeta de módulo: banda verde arriba, fondo blanco/verde claro
function moduleCard(label, title, lines, x, y, w) {
  // lineH holgado para que el texto pueda hacer wrap dentro de la tarjeta
  const lineH = 24;
  const h     = 14 + 18 + lines.length * lineH + 10;
  // fondo y barra superior
  doc.rect(x, y, w, h).fill(LGREEN);
  doc.rect(x, y, w, 3).fill(GREEN);
  // clip: nada escapa de los bordes de la tarjeta
  doc.save();
  doc.rect(x + 1, y + 1, w - 2, h - 2).clip();
  // etiqueta pequeña
  doc.fontSize(7).font('Helvetica-Bold').fillColor(GREEN)
     .text(label, x + 10, y + 7, { width: w - 16, lineBreak: false });
  // título
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(BLACK)
     .text(title, x + 10, y + 18, { width: w - 16, lineBreak: false });
  // bullets con wrap activado
  lines.forEach((l, i) => {
    doc.fontSize(7.8).font('Helvetica').fillColor(MID)
       .text('- ' + l, x + 10, y + 34 + i * lineH, { width: w - 18, lineBreak: true });
  });
  doc.restore();
  return y + h + 6;
}

// Badge estadístico: fondo verde oscuro, número grande blanco
function statBadge(number, label, x, y, w) {
  const h = 58;
  doc.rect(x, y, w, h).fill(DGREEN);
  doc.rect(x, y, w, 3).fill(MGREEN);
  doc.fontSize(22).font('Helvetica-Bold').fillColor(WHITE)
     .text(number, x, y + 8, { width: w, align: 'center', lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
     .text(label, x + 4, y + 38, { width: w - 8, align: 'center', lineBreak: false });
  return y + h + 8;
}

// Tarjeta de reporte: blanco con borde superior verde
function reportCard(title, desc, chips, x, y, w) {
  const chipRows = Math.ceil(chips.length / 2);
  const h = 68 + chipRows * 17;
  doc.rect(x, y, w, h).fill(WHITE);
  doc.rect(x, y, w, h).strokeColor(BGREEN).lineWidth(0.6).stroke();
  doc.rect(x, y, w, 3).fill(GREEN);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(BLACK)
     .text(title, x + 10, y + 12, { width: w - 18, lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor(MID)
     .text(desc, x + 10, y + 26, { width: w - 18, lineGap: 2 });
  let cx = x + 10, cy = y + 50;
  chips.forEach(ch => {
    const cw = doc.widthOfString(ch, { fontSize: 7 }) + 14;
    if (cx + cw > x + w - 8) { cx = x + 10; cy += 16; }
    doc.rect(cx, cy, cw, 12).fill(LGREEN);
    doc.rect(cx, cy, cw, 12).strokeColor(BGREEN).lineWidth(0.5).stroke();
    doc.fontSize(7).font('Helvetica-Bold').fillColor(GREEN)
       .text(ch, cx + 7, cy + 3, { lineBreak: false });
    cx += cw + 4;
  });
  return y + h + 8;
}

// Bloque de seguridad: fondo blanco con borde verde, texto oscuro
function secBlock(label, title, body, x, y, w) {
  // Cálculo preciso: ~4.8px/char a 8.5pt Helvetica en el ancho disponible
  const charsPerLine = Math.max(28, Math.floor((w - 26) / 4.8));
  const bodyLines    = Math.ceil(body.length / charsPerLine) + 1;
  const h = 14 + 16 + bodyLines * 13 + 12;
  // Fondo y bordes
  doc.rect(x, y, w, h).fill(LGREEN);
  doc.rect(x, y, w, h).strokeColor(BGREEN).lineWidth(0.5).stroke();
  doc.rect(x, y, 4, h).fill(GREEN);
  // Clip: ningún texto escapa del bloque
  doc.save();
  doc.rect(x + 1, y + 1, w - 2, h - 2).clip();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(GREEN)
     .text(label, x + 14, y + 9, { lineBreak: false });
  doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK)
     .text(title, x + 14, y + 21, { width: w - 20, lineBreak: true });
  doc.fontSize(8.5).font('Helvetica').fillColor(DARK)
     .text(body, x + 14, y + 38, { width: w - 22, lineGap: 2.5 });
  doc.restore();
  return y + h + 7;
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTADA — margen inferior en 0 para que el diseño full-bleed no desborde
// ══════════════════════════════════════════════════════════════════════════════
doc.page.margins.bottom = 0;
doc.page.margins.top    = 0;

doc.rect(0, 0, PW, PH).fill(DGREEN);
// Franja lateral
doc.rect(0, 0, 6, PH).fill(MGREEN);
// Círculo decorativo
doc.circle(PW * 0.8, PH * 0.38, 210).strokeColor('rgba(255,255,255,0.06)').lineWidth(1).fillOpacity(0).stroke();
doc.circle(PW * 0.8, PH * 0.38, 135).strokeColor('rgba(255,255,255,0.04)').lineWidth(0.5).fillOpacity(0).stroke();
doc.fillOpacity(1); // restaurar: fillOpacity(0) queda como estado global en PDFKit

// ── Cabecera empresa ─────────────────────────────────────────────────────────
// Nombre comercial (sin cuadro, todo blanco)
doc.fontSize(22).font('Helvetica-Bold').fillColor(WHITE)
   .text('SST-Colombia', L + 8, 68, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor(WHITE)
   .text(RAZÓN, L + 8, 95, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(WHITE)
   .text(`${NIT}   |   sst.sagisas.co`, L + 8, 109, { lineBreak: false });

// Línea separadora
doc.moveTo(L + 8, 128).lineTo(PW - 60, 128).strokeColor(WHITE).lineWidth(0.4).stroke();

// INFORME EJECUTIVO — solo texto, sin caja
doc.fontSize(9).font('Helvetica-Bold').fillColor(WHITE)
   .text('INFORME EJECUTIVO', L + 8, 144, { lineBreak: false });

// Título principal — todo blanco
doc.fontSize(38).font('Helvetica-Bold').fillColor(WHITE)
   .text('Plataforma de', L + 8, 168);
doc.fontSize(38).font('Helvetica-Bold').fillColor(WHITE)
   .text('Gestion Inteligente', L + 8, 210);
doc.fontSize(13).font('Helvetica').fillColor(WHITE)
   .text('Seguridad y Salud en el Trabajo  —  Colombia', L + 8, 258);

// Puntos clave — sin caja, texto blanco
const bullets = [
  'Modulos 100% automatizados  -  sin papel, sin reprocesos',
  'Informes ejecutivos con indicadores y estadisticas en tiempo real',
  'Portal del Empleado: votacion COPASST y Convivencia digital',
  'Seguridad nivel bancario: AES-256 + AWS + TLS 1.3 + auditoria',
  'GPS integrado por API  -  Rastreo de flota en tiempo real',
  'Custodia garantizada de informacion por 20 anos  -  Ley 1581',
];
bullets.forEach((b, i) => {
  const by = 288 + i * 14;
  doc.fontSize(9).font('Helvetica').fillColor(WHITE)
     .text('—  ' + b, L + 8, by, { lineBreak: false });
});

// Franja inferior
doc.rect(0, PH - 80, PW, 80).fill('rgba(0,0,0,0.28)');
doc.fontSize(7.5).font('Helvetica-Bold').fillColor(WHITE)
   .text('DOCUMENTO CONFIDENCIAL  —  INICIO DE PILOTO', L + 8, PH - 66, { lineBreak: false });
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(WHITE)
   .text('Software de Gestion SST  —  Capacidades y Caracteristicas del Sistema', L + 8, PH - 52, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(WHITE)
   .text(`${RAZÓN}  -  ${NIT}`, L + 8, PH - 34, { lineBreak: false });
doc.fontSize(8).font('Helvetica').fillColor(WHITE)
   .text(`${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`, PW - 130, PH - 34, { width: 98, align: 'right', lineBreak: false });

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2 — MÓDULOS SST AUTOMATIZADOS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;
section('Modulos SST Completamente Automatizados',
        'Todo el ciclo SST desde una sola plataforma  -  Sin papeles  -  Sin reprocesos');

p('Cada modulo elimina el trabajo manual: las alertas se generan solas, los documentos se producen al instante y los indicadores se actualizan en tiempo real. Esto es lo que encuentra en el sistema:');

const mCols = 3;
const mGap  = 8;
const mw3   = (W - mGap * (mCols - 1)) / mCols;

const mods = [
  ['TRABAJADORES', 'Trabajadores y Perfiles', [
    'Hoja de vida SST completa por empleado',
    'Control de afiliaciones, EPPs y examenes medicos',
    'Alertas automaticas de vencimientos criticos',
  ]],
  ['CAPACITACION', 'Capacitaciones', [
    'Programacion automatica segun perfil de riesgo',
    'Registro digital de asistencia y evaluaciones',
    'Certificados generados al instante',
  ]],
  ['ACCIDENTES', 'Investigacion y FURAT', [
    'Flujo guiado de reporte con arbol de causas',
    'Generacion automatica del FURAT oficial',
    'Seguimiento de correctivos con alertas',
  ]],
  ['INSPECCION', 'Inspecciones de Seguridad', [
    'Checklists dinamicos por area y cargo',
    'Hallazgo genera plan de accion automatico',
    'Registro fotografico y trazabilidad completa',
  ]],
  ['RIESGOS', 'Matriz de Peligros GTC-45', [
    'Valoracion automatica de riesgo por cargo',
    'Actualizacion dinamica con cada cambio',
    'Controles sugeridos segun nivel de riesgo',
  ]],
  ['EMERGENCIAS', 'Plan de Emergencias', [
    'Brigadas, roles y responsables definidos',
    'Simulacros programados con seguimiento',
    'Documentos legales generados al instante',
  ]],
  ['AUDITORIA', 'Evaluacion Res. 0312/2019', [
    'Los 61 estandares obligatorios evaluados',
    'Calificacion automatica y brecha detectada',
    'Informe oficial listo para Ministerio del Trabajo',
  ]],
  ['SALUD', 'Salud Ocupacional', [
    'Control de examenes medicos y vencimientos',
    'Perfil sociodemografico automatizado',
    'Programas de vigilancia epidemiologica',
  ]],
];

const rowYs = [doc.y, doc.y, doc.y];
mods.forEach((m, i) => {
  const col = i % mCols;
  const x   = L + col * (mw3 + mGap);
  rowYs[col] = moduleCard(m[0], m[1], m[2], x, rowYs[col], mw3);
  if (col === mCols - 1 || i === mods.length - 1) {
    const maxRow = Math.max(...rowYs);
    rowYs.fill(maxRow);
  }
});
doc.y = Math.max(...rowYs) + 4;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3 — MÓDULO PESV COMPLETO
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;
section('Plan Estrategico de Seguridad Vial  —  PESV',
        'Res. 40595/2022  -  Niveles basico, estandar y avanzado  -  Con GPS integrado por API');

p('El modulo PESV de SST-Colombia es el unico del mercado con integracion GPS en tiempo real. Conecta directamente con los dispositivos GPS de su flota via API, sin necesidad de operadores adicionales, convirtiendo datos de telemetria en evidencia legal de cumplimiento.');

// Banner GPS destacado — alto calculado para contener el texto completo
const gpsY0 = doc.y + 4;
const gpsH  = 64;
doc.rect(L, gpsY0, W, gpsH).fill(DGREEN);
doc.rect(L, gpsY0, 5, gpsH).fill(MGREEN);
doc.fontSize(11).font('Helvetica-Bold').fillColor(WHITE)
   .text('GPS INTEGRADO POR API  —  Tiempo Real', L + 18, gpsY0 + 9, { width: W - 28, lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor(BGREEN)
   .text('Conexion directa con Teltonika, Queclink, Coban y principales marcas GPS del mercado. Los datos de velocidad, frenadas bruscas, rutas y alertas se convierten automaticamente en evidencia legal de cumplimiento PESV.',
         L + 18, gpsY0 + 27, { width: W - 30, lineBreak: true, lineGap: 2 });
doc.y = gpsY0 + gpsH + 8;

const pesvMods = [
  ['DIAGNOSTICO', 'Evaluacion de Lineamientos', [
    'Los 10 lineamientos de la Res. 40595/2022',
    'Nivel de complejidad calculado automaticamente',
    'Brechas identificadas con plan de cierre',
  ]],
  ['GPS / API', 'Rastreo GPS en Tiempo Real', [
    'Integracion directa con dispositivos GPS via API',
    'Velocidad, frenadas bruscas y desvios detectados',
    'Historial de rutas con evidencia legal automatica',
  ]],
  ['CONDUCTORES', 'Gestion de Conductores', [
    'Licencias, infracciones y capacitaciones',
    'Alertas automaticas de vencimientos por conductor',
    'Historial completo de comportamiento vial',
  ]],
  ['FLOTA', 'Control de Vehiculos', [
    'SOAT, tecnomecanica y mantenimientos controlados',
    'Plan de accion ante vencimientos automatico',
    'Estado de la flota actualizado en tiempo real',
  ]],
  ['PLAN ACCION', 'Plan de Accion PESV', [
    'Cronograma de actividades generado automaticamente',
    'Semaforo de cumplimiento por lineamiento',
    'Cierre de acciones con evidencia digital',
  ]],
  ['CAPACITACION', 'Formacion en Seguridad Vial', [
    'Programas de capacitacion segun perfil del conductor',
    'Evaluaciones y certificados generados al instante',
    'Control de brecha de formacion vial por cargo',
  ]],
  ['INCIDENTES', 'Accidentes Viales', [
    'Reporte guiado de accidente de transito',
    'Cruce automatico con datos GPS del momento',
    'Estadisticas de siniestralidad por conductor y ruta',
  ]],
  ['REPORTES', 'Informes PESV Oficiales', [
    'Informe de avance listo para Superintendencia',
    'Indicadores de cumplimiento en tiempo real',
    'Trazabilidad bidireccional completa del plan',
  ]],
];

const pRowYs = [doc.y, doc.y, doc.y];
pesvMods.forEach((m, i) => {
  const col = i % mCols;
  const x   = L + col * (mw3 + mGap);
  pRowYs[col] = moduleCard(m[0], m[1], m[2], x, pRowYs[col], mw3);
  if (col === mCols - 1 || i === pesvMods.length - 1) {
    const maxRow = Math.max(...pRowYs);
    pRowYs.fill(maxRow);
  }
});
doc.y = Math.max(...pRowYs) + 4;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3 — INFORMES + INDICADORES
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;
section('Informes Inteligentes con Indicadores y Estadisticas',
        'Los datos operativos convertidos en informacion estrategica lista para usar');

p('SST-Colombia no solo almacena datos: los convierte en reportes profesionales, graficas de tendencia e indicadores de gestion que gerentes y responsables SST pueden usar de inmediato, sin procesar nada manualmente.');

// Badges
doc.moveDown(0.2);
const sbY = doc.y;
const sbW = (W - 21) / 4;
statBadge('+40', 'Tipos de informe\ngenerados automaticamente', L, sbY, sbW);
statBadge('100%', 'Documentos con trazabilidad\ny codigo unico', L + sbW + 7, sbY, sbW);
statBadge('0%', 'Reproceso manual: todo\nse genera desde los datos', L + (sbW + 7) * 2, sbY, sbW);
statBadge('24/7', 'Descarga de reportes\nen tiempo real', L + (sbW + 7) * 3, sbY, sbW);
doc.y = sbY + 66;

const rcW = (W - 10) / 2;
let rcL = doc.y, rcR = doc.y;

const reports = [
  ['Cumplimiento Res. 0312/2019',
   'Calificacion automatica de los estandares del Ministerio del Trabajo, con brecha identificada y plan de cierre.',
   ['% Cumplimiento global', 'Brechas por fase', 'Tendencia mensual', 'Ranking estandares']],
  ['Dashboard de Indicadores SST',
   'Tablero ejecutivo en tiempo real con indicadores clave de accidentalidad, capacitacion y estado del sistema.',
   ['Tasa de accidentalidad', 'Frecuencia y severidad', '% Capacitados', 'Ausentismo']],
  ['Informe de Accidentalidad',
   'Estadisticas de accidentes e incidentes: causas, areas criticas, cargos de mayor riesgo y evolucion historica.',
   ['Causas mas frecuentes', 'Areas de riesgo', 'Dias perdidos', 'Costos asociados']],
  ['Reporte de Capacitaciones',
   'Cobertura real de la formacion por cargo y area. Brecha de entrenamiento identificada automaticamente.',
   ['% Cobertura por area', 'Horas de capacitacion', 'Evaluaciones promedio', 'Pendientes criticos']],
  ['Informe PESV',
   'Estado del Plan Estrategico de Seguridad Vial, avance por componente y proyeccion de cumplimiento.',
   ['% PESV por componente', 'Acciones vencidas', 'Flota gestionada', 'Nivel cumplimiento']],
  ['Informe Ministerio del Trabajo',
   'Documento oficial en PDF listo para cualquier visita de inspeccion, con firma digital del profesional SST responsable.',
   ['Firma digital LSO', 'Codigo de radicacion', 'Anexos automaticos', 'Sello de integridad']],
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
section('Portal del Empleado — Participacion Digital y Transparente',
        'Acceso directo para trabajadores  -  Procesos legales 100% digitales desde cualquier celular');

p('El Portal del Empleado conecta directamente a cada trabajador con el sistema SST de su empresa. Sin papel, sin formularios fisicos: cada empleado accede desde su celular o computador para participar activamente en los procesos que exige la ley.');

// Hero — alto calculado para contener todo el texto sin desbordarse
const heroY0 = doc.y + 4;
const heroH  = 78;
doc.rect(L, heroY0, W, heroH).fill(DGREEN);
doc.rect(L, heroY0, 5, heroH).fill(MGREEN);
doc.fontSize(10).font('Helvetica-Bold').fillColor(WHITE)
   .text('Por que es diferente?', L + 16, heroY0 + 9, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor('rgba(255,255,255,0.88)')
   .text('La mayoria de sistemas SST son herramientas para el area de RRHH. SST-Colombia es el unico que incluye un portal dedicado al trabajador, convirtiendo el cumplimiento normativo en una experiencia participativa, verificable y sin friccion para toda la organizacion.',
         L + 16, heroY0 + 26, { width: W - 28, lineGap: 3 });
doc.y = heroY0 + heroH + 10;

const pw4 = (W - 10) / 2;
let pL = doc.y, pR = doc.y;

pL = moduleCard('COPASST', 'Eleccion Digital del COPASST', [
  'Cada trabajador vota directamente desde el portal',
  'Proceso auditado con acta digital automatica',
  'Cumple el requisito legal de eleccion secreta',
  'Resultado en tiempo real, sin escrutinio manual',
], L, pL, pw4);

pR = moduleCard('CONVIVENCIA', 'Comite de Convivencia Laboral', [
  'Postulaciones y votacion 100% digital',
  'Actas y acuerdos generados automaticamente',
  'Canal confidencial para reportes de conflictos',
  'Trazabilidad completa de reuniones y decisiones',
], L + pw4 + 10, pR, pw4);
pL = pR = Math.max(pL, pR);

pL = moduleCard('DOCUMENTOS', 'Consulta de Documentos Personales', [
  'Examenes medicos, contratos y certificados',
  'Historial de capacitaciones y evaluaciones',
  'EPPs asignados y acuses de recibo digital',
  'Carta de dotacion con firma electronica',
], L, pL, pw4);

pR = moduleCard('PARTICIPACION', 'Comunicacion y Reportes', [
  'Reporte de condiciones inseguras desde el celular',
  'Encuestas de clima laboral digitales',
  'Notificaciones automaticas de capacitaciones',
  'Confirmacion digital de lectura de politicas',
], L + pw4 + 10, pR, pw4);
pL = pR = Math.max(pL, pR);

doc.y = pL + 4;

const accY0 = doc.y;
doc.rect(L, accY0, W, 42).fill(LGREEN);
doc.rect(L, accY0, 4, 42).fill(GREEN);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(BLACK)
   .text('Acceso universal sin complicaciones', L + 14, accY0 + 8, { lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor(MID)
   .text('El trabajador accede con su numero de cedula. Sin contraseñas complejas. Compatible con cualquier celular, tableta o computador con internet.',
         L + 14, accY0 + 23, { width: W - 22, lineBreak: true });
doc.y = accY0 + 50;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 5 — SEGURIDAD NIVEL BANCARIO Y MILITAR
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;
section('Seguridad de Nivel Bancario y Militar',
        'Proteccion multicapa para informacion critica de personas  -  El estandar mas alto del mercado');

p('Los datos de salud, cedulas e historiales de los trabajadores son tan sensibles como cualquier dato bancario. SST-Colombia fue construida con los mismos estandares que usan entidades financieras y plataformas de defensa:');

doc.moveDown(0.2);
const sw = (W - 10) / 2;
let sL = doc.y, sR = doc.y;

sL = secBlock('CIFRADO', 'AES-256-GCM — El algoritmo de los bancos centrales',
  'Todos los datos sensibles estan cifrados con AES-256-GCM: el mismo estandar que usan los bancos centrales y las fuerzas militares del mundo para proteger informacion clasificada. Incluso con acceso fisico al servidor, los datos son ilegibles sin la llave de descifrado.',
  L, sL, sw);

sR = secBlock('INFRAESTRUCTURA', 'Amazon Web Services (AWS) — Clase empresarial',
  'La plataforma opera sobre AWS, la infraestructura en la nube mas utilizada por gobiernos, bancos y empresas Fortune 500. Certificaciones ISO 27001, SOC 2 y PCI-DSS. Centros de datos con control biometrico, vigilancia 24/7 y redundancia geografica.',
  L + sw + 10, sR, sw);
sL = sR = Math.max(sL, sR);

sL = secBlock('CONTROL DE ACCESO', '11 Niveles de Permisos Independientes',
  'El sistema tiene 11 roles distintos: el trabajador solo ve su informacion, el administrador solo ve su empresa, el auditor externo tiene acceso de solo lectura. Nadie puede ver mas alla de lo que le corresponde — por diseno, no por configuracion.',
  L, sL, sw);

sR = secBlock('CONTRASEÑAS', 'Hash Irreversible — Ni el administrador puede verlas',
  'Las contraseñas nunca se almacenan en texto. Se guarda unicamente su huella digital cifrada (bcrypt). Ni el administrador del sistema puede recuperar una contraseña. Si se olvida, solo el usuario la restablece mediante verificacion de identidad. Igual que los bancos.',
  L + sw + 10, sR, sw);
sL = sR = Math.max(sL, sR);

sL = secBlock('COMUNICACION', 'HTTPS / TLS 1.3 — El protocolo mas moderno',
  'Toda comunicacion entre el usuario y la plataforma viaja cifrada con TLS 1.3. Ningun dato puede ser interceptado en transito. El mismo nivel de proteccion que usan las plataformas de pagos internacionales y los portales bancarios en Colombia.',
  L, sL, sw);

sR = secBlock('AUDITORIA', 'Registro Inviolable de Actividad',
  'Cada accion relevante queda registrada: quien lo hizo, cuando, desde que dispositivo y que cambio. Este registro no puede ser modificado ni borrado — ni siquiera por el administrador. Estandar ISO 27001, obligatorio para auditorias formales.',
  L + sw + 10, sR, sw);
sL = sR = Math.max(sL, sR);

doc.y = sL + 4;

// Barra certificaciones
doc.rect(L, doc.y, W, 36).fill(LGREEN);
doc.rect(L, doc.y, W, 36).strokeColor(BGREEN).lineWidth(0.5).stroke();
doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GREEN)
   .text('ESTANDARES Y CERTIFICACIONES APLICADOS', L, doc.y + 8, { width: W, align: 'center', lineBreak: false });
const certs = ['ISO 27001', 'AWS RDS', 'TLS 1.3', 'AES-256-GCM', 'PCI-DSS', 'SOC 2 Type II', 'bcrypt'];
let cx0 = L + 10, certY = doc.y + 18;
certs.forEach(c => {
  const cw = doc.widthOfString(c, { fontSize: 7.5 }) + 16;
  doc.rect(cx0, certY, cw, 13).fill(WHITE);
  doc.rect(cx0, certY, cw, 13).strokeColor(BGREEN).lineWidth(0.5).stroke();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GREEN)
     .text(c, cx0 + 8, certY + 3, { lineBreak: false });
  cx0 += cw + 6;
});
doc.y += 46;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 6 — LEY 1581 + CUSTODIA 20 AÑOS
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 55;
section('Ley 1581/2012 y Custodia de Informacion por 20 Anos',
        'Cumplimiento legal total en proteccion de datos  -  Informacion disponible y segura por dos decadas');

p('La informacion de sus clientes y sus trabajadores esta protegida no solo por tecnologia, sino por las mas estrictas garantias legales y operacionales disponibles en Colombia. SST-Colombia es la unica plataforma del mercado que ofrece custodia documental garantizada por 20 anos:');

doc.moveDown(0.2);

const gw = (W - 14) / 3;
const gy = doc.y;

// Función helper para los 3 bloques de garantía
function garantiaBlock(titulo, subtitulo, items, bx, by, bw, accentColor) {
  doc.rect(bx, by, bw, 168).fill(WHITE);
  doc.rect(bx, by, bw, 168).strokeColor(BGREEN).lineWidth(0.6).stroke();
  doc.rect(bx, by, bw, 36).fill(accentColor);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(WHITE)
     .text(titulo, bx + 12, by + 10, { width: bw - 18, lineBreak: false });
  doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
     .text(subtitulo, bx + 12, by + 25, { width: bw - 18, lineBreak: false });
  items.forEach((item, i) => {
    doc.fontSize(7.5).font('Helvetica').fillColor(DARK)
       .text('- ' + item, bx + 12, by + 46 + i * 15, { width: bw - 18, lineBreak: false });
  });
}

garantiaBlock('Ley 1581 de 2012', 'Proteccion de Datos Personales', [
  'Datos recopilados con proposito definido',
  'Almacenamiento cifrado y controlado',
  'Acceso solo a personas autorizadas',
  'Derecho de rectificacion garantizado',
  'Sin transferencia a terceros',
  'Registro ante Superintendencia (SIC)',
  'Politica de privacidad publicada',
], L, gy, gw, DGREEN);

garantiaBlock('Copias de Seguridad', 'Backups automaticos multicapa', [
  'Respaldo automatico diario completo',
  'Backup incremental cada 6 horas',
  'Replicacion en multiples regiones AWS',
  'Recuperacion en menos de 4 horas',
  'Perdida maxima: 6 horas de datos',
  'Pruebas de restauracion mensuales',
  'Sin costo adicional — incluido',
], L + gw + 7, gy, gw, GREEN);

garantiaBlock('Custodia 20 Anos', 'Resguardo garantizado por contrato', [
  'Toda la historia disponible siempre',
  'Acceso a registros de hace 20 anos',
  'Documentos con validez legal probatoria',
  'Respaldo ante demandas o litigios',
  'Sin perdida por migraciones o versiones',
  'Garantia contractual de continuidad',
  'Exportacion total de datos',
], L + (gw + 7) * 2, gy, gw, DGREEN);
doc.y = gy + 178;

// Por que importa
doc.moveDown(0.3);
const custY0 = doc.y;
const custH  = 80;
doc.rect(L, custY0, W, custH).fill(LGREEN);
doc.rect(L, custY0, 4, custH).fill(GREEN);
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK)
   .text('Por que la custodia de 20 anos es critica para sus clientes?', L + 16, custY0 + 10, { width: W - 24, lineBreak: false });
doc.fontSize(8.5).font('Helvetica').fillColor(DARK)
   .text('El Ministerio del Trabajo y los tribunales laborales pueden requerir evidencia de gestion SST con hasta 20 anos de retroactividad en casos de enfermedad laboral o accidente grave. Con SST-Colombia, la empresa siempre puede demostrar que hizo, cuando lo hizo y quien fue el responsable — con documentos legalmente validos.',
         L + 16, custY0 + 27, { width: W - 24, lineGap: 2.5 });
doc.y = custY0 + custH + 8;

// Cierre
doc.moveDown(0.2);
doc.rect(L, doc.y, W, 2).fill(GREEN);
doc.moveDown(0.3);
doc.fontSize(14).font('Helvetica-Bold').fillColor(BLACK)
   .text('La plataforma que sus clientes necesitan — y que su empresa merece ofrecer', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.3);
doc.fontSize(8.5).font('Helvetica').fillColor(MID)
   .text('Automatizacion  -  Estadisticas  -  Portal empleado  -  Seguridad bancaria  -  Custodia 20 anos', L, doc.y, { width: W, align: 'center', lineBreak: false });
doc.moveDown(0.4);
doc.rect(L, doc.y, W, 2).fill(GREEN);
doc.moveDown(0.4);
doc.fontSize(8.5).font('Helvetica-Bold').fillColor(BLACK)
   .text(RAZÓN, L, doc.y, { width: W, align: 'center', lineBreak: false });
doc.moveDown(0.3);
doc.fontSize(8).font('Helvetica').fillColor(MID)
   .text(`${NIT}  -  admin@sst-colombia.com  -  sst.sagisas.co`, L, doc.y, { width: W, align: 'center', lineBreak: false });

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
doc.on('end', () => console.log(`PDF listo: ${OUT}  (${total} paginas)`));
