import PDFDocument from 'pdfkit';
import fs from 'fs';

const OUT   = './attached_assets/informe-ejecutivo-sst-colombia.pdf';
const GREEN = '#1e7e34';
const DGRN  = '#14532d';
const DARK  = '#111111';
const GRAY  = '#444444';
const LGRAY = '#f0fdf4';
const MGRAY = '#e5e7eb';
const RAZÓN = 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.';
const NIT   = 'NIT 902.036.337-4';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 55, left: 65, right: 65 },
  bufferPages: true,
  info: {
    Title: 'Informe Ejecutivo — SST-Colombia',
    Author: RAZÓN,
    Subject: 'Plataforma de Gestión SST para Empresas',
  },
});
doc.pipe(fs.createWriteStream(OUT));

const PW = doc.page.width;
const PH = doc.page.height;
const W  = PW - 130;
const L  = 65;
const today = new Date();
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                'septiembre','octubre','noviembre','diciembre'];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function col2(left, right, yBase, wLeft = (W * 0.48)) {
  const wRight = W - wLeft - 16;
  const xRight = L + wLeft + 16;
  const y0 = yBase;
  const lyEnd = left(L, y0, wLeft);
  const ryEnd = right(xRight, y0, wRight);
  doc.y = Math.max(lyEnd, ryEnd) + 6;
}

function box(label, body, x, y, w, accent = GREEN) {
  const textY  = y + 36;
  const lineH  = 13.5;
  const lines  = Math.ceil(body.length / 52);
  const boxH   = textY - y + lines * lineH + 12;

  doc.rect(x, y, w, 28).fill(accent);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(label, x + 10, y + 9, { width: w - 20, lineBreak: false });
  doc.rect(x, y + 28, w, boxH - 28).fill(LGRAY);
  doc.fontSize(9).font('Helvetica').fillColor(DARK)
     .text(body, x + 10, y + 38, { width: w - 20, align: 'left', lineGap: 1.5 });
  return y + boxH + 8;
}

function p(text, options = {}) {
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
     .text(text, L, doc.y, { width: W, align: 'justify', lineGap: 2.5, ...options });
  doc.moveDown(0.5);
}

function heading(text) {
  doc.moveDown(0.5);
  const y0 = doc.y;
  doc.rect(L, y0, 4, 18).fill(GREEN);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(DGRN)
     .text(text, L + 12, y0 + 2, { width: W - 12 });
  doc.moveDown(0.5);
}

function chip(text, x, y, accent = GREEN) {
  const tw = doc.widthOfString(text, { fontSize: 8 }) + 18;
  doc.rect(x, y, tw, 16).fill(accent + '22');
  doc.rect(x, y, tw, 16).strokeColor(accent).lineWidth(0.6).stroke();
  doc.fontSize(8).font('Helvetica-Bold').fillColor(accent)
     .text(text, x + 9, y + 4, { lineBreak: false });
  return tw + 6;
}

function smallHeader(i, total) {
  doc.rect(0, 0, PW, 42).fill(GREEN);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text('SST-Colombia  ·  Informe Ejecutivo Confidencial', L, 14, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
     .text(`${RAZÓN}  ·  ${NIT}`, L, 26, { lineBreak: false });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
     .text(`Pág. ${i} / ${total}  ·  Confidencial`, PW - 160, 20, { width: 120, align: 'right', lineBreak: false });
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTADA — Página 1
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, PW, PH).fill('#0d2818');

// Fondo decorativo — círculos
for (let r of [280, 360, 440]) {
  doc.circle(PW * 0.75, PH * 0.35, r)
     .strokeColor(GREEN).lineWidth(0.4).fillOpacity(0).stroke();
}

// Franja verde lateral
doc.rect(0, 0, 8, PH).fill(GREEN);

// Logo / Marca
doc.rect(L, 80, 52, 52).fill(GREEN);
doc.fontSize(28).font('Helvetica-Bold').fillColor('white')
   .text('SST', L + 6, 97, { lineBreak: false });

doc.fontSize(11).font('Helvetica-Bold').fillColor(GREEN)
   .text('SST-Colombia', L + 66, 86, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.65)')
   .text('Plataforma de Gestión Integral de\nSeguridad y Salud en el Trabajo', L + 66, 101);

// Línea divisora
doc.moveTo(L, 150).lineTo(PW - 65, 150).strokeColor(GREEN).lineWidth(1).stroke();

// Título principal
doc.fontSize(34).font('Helvetica-Bold').fillColor('white')
   .text('Informe Ejecutivo', L, 175);
doc.fontSize(18).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text('Solución Integral SST para su Empresa', L, 220);

// Subtítulo descriptivo
doc.rect(L, 265, W, 2).fill(GREEN);
doc.moveDown(0);
doc.fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.85)')
   .text(
     'Este documento presenta el alcance, los beneficios y las garantías de seguridad\n' +
     'de SST-Colombia — la plataforma líder en gestión del cumplimiento normativo\n' +
     'en Seguridad y Salud en el Trabajo para empresas colombianas.',
     L, 278, { width: W * 0.72, lineGap: 4 }
   );

// Caja de datos del emisor
const cby = PH - 160;
doc.rect(L, cby, W, 100).fill('#1a3a25');
doc.fontSize(8).font('Helvetica-Bold').fillColor(GREEN)
   .text('PREPARADO POR', L + 20, cby + 14, { lineBreak: false });
doc.fontSize(10).font('Helvetica-Bold').fillColor('white')
   .text(RAZÓN, L + 20, cby + 28, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text(`${NIT}  ·  Medellín, Colombia`, L + 20, cby + 44, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text('sst.sagisas.co  ·  admin@sst-colombia.com', L + 20, cby + 58, { lineBreak: false });

doc.fontSize(8).font('Helvetica-Bold').fillColor(GREEN)
   .text('FECHA', L + 20, cby + 76, { lineBreak: false });
doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
   .text(`${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`, L + 20, cby + 89, { lineBreak: false });

doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.4)')
   .text('CONFIDENCIAL — Uso exclusivo del destinatario', L, PH - 28, { width: W, align: 'center', lineBreak: false });

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2 — ¿Por qué SST es obligatorio?
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 65;

heading('¿Por qué toda empresa colombiana debe gestionar el SST?');

p('En Colombia, la Seguridad y Salud en el Trabajo no es opcional: es una obligación legal respaldada por el Ministerio del Trabajo. Toda empresa — sin importar su tamaño o sector — debe demostrar que protege activamente a sus trabajadores y que cumple con los estándares establecidos por la norma.');

p('El incumplimiento tiene consecuencias directas: multas que pueden llegar hasta 1.000 salarios mínimos mensuales, cierre temporal del establecimiento y, en casos de accidente grave, responsabilidad penal para el representante legal. Más allá de las sanciones, una empresa con accidentes laborales frecuentes pierde productividad, reputación y talento humano.');

doc.moveDown(0.3);
const ry = doc.y;
const bw = (W - 12) / 3;
const b1e = box('Multas económicas', 'Hasta $1.000 millones de pesos según la gravedad de la infracción (Decreto 472/2015).', L, ry, bw, '#dc2626');
const b2e = box('Cierre de operaciones', 'El Ministerio del Trabajo puede ordenar el cierre inmediato ante riesgos graves para los trabajadores.', L + bw + 6, ry, bw, '#d97706');
const b3e = box('Responsabilidad penal', 'El representante legal puede enfrentar procesos judiciales por omisión ante accidentes graves.', L + (bw + 6) * 2, ry, bw, '#7c3aed');
doc.y = Math.max(b1e, b2e, b3e) + 4;

heading('La norma que define los requisitos');

p('La Resolución 0312 de 2019 del Ministerio del Trabajo establece los Estándares Mínimos del Sistema de Gestión SST. Según el tamaño y el nivel de riesgo de la empresa, puede exigir entre 7 y 61 estándares de cumplimiento, cada uno verificable en cualquier momento mediante visita o requerimiento del inspector de trabajo.');

const ey = doc.y;
const ew = (W - 8) / 2;
box('Para empresas pequeñas (hasta 10 trabajadores y riesgo I o II)', '7 estándares mínimos obligatorios. La plataforma guía paso a paso cada uno.', L, ey, ew);
const ey2 = doc.y;
box('Para empresas medianas y grandes (11 o más trabajadores)', 'Entre 21 y 61 estándares, con requisitos más detallados de documentación, capacitación y vigilancia.', L + ew + 8, ey, ew);
doc.y = ey2;

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 3 — Qué hace SST-Colombia
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 65;

heading('¿Qué hace SST-Colombia por su empresa?');

p('SST-Colombia es una plataforma digital completa que centraliza toda la gestión del Sistema de Seguridad y Salud en el Trabajo. En lugar de carpetas físicas, hojas de cálculo y documentos dispersos, sus empresas tienen todo organizado, actualizado y accesible desde cualquier dispositivo con internet.');

p('La plataforma está diseñada siguiendo el ciclo PHVA (Planear, Hacer, Verificar, Actuar), que es el estándar internacional reconocido por la norma ISO 45001:2018 y exigido implícitamente por la regulación colombiana:');

doc.moveDown(0.2);
// PHVA visual
const phvaW = (W - 18) / 4;
const phvaY = doc.y;
const phvas = [
  { letra: 'P', nombre: 'PLANEAR', desc: 'Diagnóstico inicial, política SST, objetivos y plan de trabajo anual.' },
  { letra: 'H', nombre: 'HACER',   desc: 'Capacitaciones, inspecciones, investigación de accidentes, control de riesgos.' },
  { letra: 'V', nombre: 'VERIFICAR', desc: 'Auditorías internas, medición de indicadores, revisión de cumplimiento.' },
  { letra: 'A', nombre: 'ACTUAR', desc: 'Plan de mejora, acciones correctivas y seguimiento de compromisos.' },
];
phvas.forEach((ph, i) => {
  const px = L + i * (phvaW + 6);
  doc.rect(px, phvaY, phvaW, 30).fill(GREEN);
  doc.fontSize(18).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.25)')
     .text(ph.letra, px + phvaW - 28, phvaY + 5, { lineBreak: false });
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(ph.nombre, px + 8, phvaY + 10, { width: phvaW - 30, lineBreak: false });
  doc.rect(px, phvaY + 30, phvaW, 55).fill(LGRAY);
  doc.fontSize(8.5).font('Helvetica').fillColor(DARK)
     .text(ph.desc, px + 8, phvaY + 38, { width: phvaW - 16, lineGap: 1.5 });
});
doc.y = phvaY + 93;
doc.moveDown(0.5);

heading('Módulos principales del sistema');

p('Cada módulo está diseñado para cumplir requisitos específicos de la norma. A continuación, los componentes clave:');

doc.moveDown(0.2);
const modY = doc.y;
const modW = (W - 8) / 2;
const mods = [
  ['Gestión de Trabajadores', 'Registro completo de cada trabajador: cargo, perfil de riesgo, afiliaciones, exámenes médicos, documentos y seguimiento de su ciclo en la empresa.'],
  ['Capacitaciones y Formación', 'Programación, registro de asistencia y seguimiento de todas las capacitaciones obligatorias. Histórico verificable en cualquier momento.'],
  ['Investigación de Accidentes', 'Reporte y análisis de accidentes e incidentes con seguimiento de causas, correctivos y cumplimiento de los plazos legales de reporte al FURAT.'],
  ['Inspecciones de Seguridad', 'Checklists digitales para inspección de puestos de trabajo, instalaciones, equipos y EPPs. Los hallazgos generan planes de acción automáticos.'],
  ['Matriz de Peligros (GTC-45)', 'Identificación y valoración de todos los peligros de la empresa según la metodología GTC-45. Actualizable en tiempo real.'],
  ['Plan de Emergencias', 'Elaboración del plan de emergencias, brigadas de respuesta y simulacros programados con trazabilidad completa.'],
  ['Auditorías Internas', 'Evaluación periódica del cumplimiento de los estándares exigidos por la Resolución 0312/2019, con informe automático para el Ministerio del Trabajo.'],
  ['Salud Ocupacional', 'Control de exámenes médicos, perfil sociodemográfico de los trabajadores y programas de vigilancia epidemiológica.'],
];
let leftY = modY, rightY = modY;
mods.forEach((m, i) => {
  if (i % 2 === 0) {
    leftY = box(m[0], m[1], L, leftY, modW);
  } else {
    rightY = box(m[0], m[1], L + modW + 8, rightY, modW);
    leftY = rightY = Math.max(leftY, rightY);
  }
});
doc.y = Math.max(leftY, rightY);

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 4 — PESV + Multi-empresa + Documentos
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 65;

heading('Plan Estratégico de Seguridad Vial (PESV)');

p('Para las empresas que tienen vehículos propios o contratados — flota de camiones, motos, carros de reparto o cualquier tipo de transporte — el Ministerio de Transporte exige el Plan Estratégico de Seguridad Vial según la Resolución 40595/2022. SST-Colombia tiene un módulo especializado que gestiona este plan en su totalidad:');

const pesvY = doc.y;
const pesvW = (W - 8) / 2;
box('Evaluación del nivel de cumplimiento', 'Diagnóstico automático del estado actual del PESV según los criterios de la resolución vigente: básico, estándar o avanzado.', L, pesvY, pesvW, '#0369a1');
const pesvY2 = doc.y;
box('Seguimiento de acciones y metas', 'Plan de trabajo con responsables, fechas y avance de cada acción requerida para alcanzar y mantener el cumplimiento.', L + pesvW + 8, pesvY, pesvW, '#0369a1');
doc.y = pesvY2;

doc.moveDown(0.3);
heading('Gestión de múltiples empresas desde un solo lugar');

p('Si usted administra o asesora varias empresas, SST-Colombia permite gestionar cada una de forma independiente desde un único acceso. Cada empresa tiene su propio espacio, sus propios trabajadores, documentos y registros — con total privacidad entre ellas.');

const meY = doc.y;
const meW = (W - 8) / 2;
box('Un panel, varias empresas', 'Acceda a cada empresa con un clic. Vea el estado de cumplimiento de cada una sin mezclar información.', L, meY, meW, '#7c3aed');
const meY2 = doc.y;
box('Control por sedes y ubicaciones', 'Si una empresa tiene múltiples sedes o puntos de operación, cada una puede gestionarse por separado dentro de la misma cuenta.', L + meW + 8, meY, meW, '#7c3aed');
doc.y = meY2;

doc.moveDown(0.3);
heading('Documentos legales generados automáticamente');

p('Uno de los mayores beneficios de la plataforma es la generación automática de todos los documentos que exigen los entes de control. Cada registro queda almacenado con fecha, firma digital del responsable y trazabilidad completa:');

doc.moveDown(0.2);
const docsY = doc.y;
const chips = [
  'Política SST firmada', 'Plan de trabajo anual', 'Matriz de peligros GTC-45',
  'Informe de accidentes', 'Actas de capacitación', 'Plan de emergencias',
  'Informe de auditoría interna', 'Informe Ministerio del Trabajo', 'Profesiograma',
  'Actas COPASST', 'Programa de vigilancia epidemiológica', 'Organigrama SST',
];
let cx = L, cy = docsY;
chips.forEach(ch => {
  const cw = doc.widthOfString(ch, { fontSize: 8 }) + 20;
  if (cx + cw > L + W) { cx = L; cy += 22; }
  chip(ch, cx, cy);
  cx += cw + 4;
});
doc.y = cy + 28;

doc.moveDown(0.3);
heading('Alertas automáticas de cumplimiento');
p('El sistema monitorea continuamente el estado de cada empresa y envía alertas automáticas cuando hay estándares pendientes, capacitaciones vencidas, evaluaciones anuales sin iniciar o acciones correctivas sin cerrar. El responsable del SST y el representante legal reciben estas alertas por correo electrónico, garantizando que ningún requisito quede sin atender.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 5 — Seguridad, Privacidad y Respaldo
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 65;

heading('Seguridad y protección de la información');

p('La información de sus empresas y trabajadores es un activo crítico. SST-Colombia ha sido construida desde el inicio con una arquitectura de seguridad empresarial que protege cada dato almacenado, cada acceso al sistema y cada documento generado. A continuación, explicamos en términos claros cómo protegemos su información:');

doc.moveDown(0.2);
const segY = doc.y;
const segW = (W - 8) / 2;

const s1 = box('Cifrado de datos sensibles', 'Los datos personales de los trabajadores — números de cédula, información médica, contratos — están cifrados dentro de la base de datos. Incluso si alguien accediera al servidor, no podría leer esa información.', L, segY, segW, '#1e40af');
const s2 = box('Base de datos en la nube (AWS)', 'La información se almacena en los servidores de Amazon Web Services (AWS) en su capa de base de datos empresarial (RDS). AWS es el proveedor de nube más utilizado en el mundo, con certificaciones de seguridad internacionales.', L + segW + 8, segY, segW, '#1e40af');
const s3 = Math.max(s1, s2);

const t1 = box('Acceso por roles y permisos', 'No todos ven todo. El sistema tiene 11 niveles de acceso distintos: el trabajador solo ve su información, el administrador ve su empresa, y el soporte técnico tiene acceso restringido y auditado. Nadie puede ver más de lo que le corresponde.', L, s3, segW, '#065f46');
const t2 = box('Contraseñas protegidas', 'Las contraseñas nunca se almacenan en texto legible. Se guardan con un sistema de cifrado irreversible (hashing) que impide recuperarlas incluso desde adentro del sistema.', L + segW + 8, s3, segW, '#065f46');
const t3 = Math.max(t1, t2);

const u1 = box('Registro de actividad (auditoría)', 'Cada acción importante dentro del sistema queda registrada: quién la hizo, cuándo y desde qué lugar. Este registro es inviolable y permite rastrear cualquier evento ante una revisión interna o legal.', L, t3, segW, '#7c2d12');
const u2 = box('Comunicación cifrada (HTTPS)', 'Toda la comunicación entre el usuario y la plataforma viaja cifrada a través del protocolo HTTPS. Es el mismo estándar que utilizan los bancos para proteger las transacciones en línea.', L + segW + 8, t3, segW, '#7c2d12');
doc.y = Math.max(u1, u2) + 4;

heading('Copias de seguridad y disponibilidad');
p('La plataforma opera en una infraestructura de alta disponibilidad que garantiza acceso continuo. Las copias de seguridad de la información se realizan automáticamente, asegurando que ningún dato se pierda ante fallas técnicas. El sistema puede recuperar información histórica cuando sea necesario.');

heading('Cumplimiento de la Ley de Protección de Datos (Ley 1581 de 2012)');
p('SST-Colombia cumple con todas las disposiciones de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales en Colombia. Los datos de los trabajadores se recopilan con propósito definido, se almacenan de forma segura y no se comparten con terceros sin autorización. La plataforma cuenta con Política de Privacidad, Aviso de Privacidad y Acuerdo de Procesamiento de Datos disponibles para consulta.');

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 6 — Beneficios + Red de Profesionales + Cierre
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.y = 65;

heading('Beneficios concretos para su organización');

doc.moveDown(0.2);
const benY = doc.y;
const benW = (W - 8) / 2;

const bn = [
  ['Cumplimiento garantizado', 'La plataforma le dice exactamente qué estándares cumple y cuáles faltan, con guía paso a paso para completarlos antes de cualquier visita del Ministerio del Trabajo.', '#1e7e34'],
  ['Reducción del riesgo legal', 'Con toda la documentación organizada y actualizada, su empresa puede demostrar cumplimiento ante cualquier requerimiento legal, auditoría o proceso judicial.', '#1e7e34'],
  ['Ahorro de tiempo y papel', 'Los procesos que antes tomaban días de trabajo en oficina — elaborar actas, matrices, planes — se realizan en minutos con la plataforma.', '#0369a1'],
  ['Visibilidad total del estado SST', 'Un tablero de control unificado muestra el estado de cumplimiento, los indicadores clave y las tareas pendientes de todas sus empresas en un solo lugar.', '#0369a1'],
  ['Tranquilidad del representante legal', 'La norma responsabiliza personalmente al representante legal. Con SST-Colombia, usted tiene evidencia documentada de que está cumpliendo, lo que lo protege ante cualquier contingencia.', '#7c2d12'],
  ['Accesible desde cualquier lugar', 'No se necesita software instalado ni equipos especiales. Funciona desde el navegador de cualquier computador, tableta o celular con conexión a internet.', '#7c2d12'],
];
let bnLeftY = benY, bnRightY = benY;
bn.forEach((b, i) => {
  if (i % 2 === 0) bnLeftY = box(b[0], b[1], L, bnLeftY, benW, b[2]);
  else {
    bnRightY = box(b[0], b[1], L + benW + 8, bnRightY, benW, b[2]);
    bnLeftY = bnRightY = Math.max(bnLeftY, bnRightY);
  }
});
doc.y = Math.max(bnLeftY, bnRightY) + 4;

heading('Red de Profesionales SST Aliados');

p('SST-Colombia no solo es una herramienta digital: tiene una red de Profesionales en Seguridad y Salud en el Trabajo vinculados a la plataforma. Si su empresa necesita un profesional licenciado que asesore directamente, gestione el sistema y firme los documentos que exige la ley, podemos conectarla con un aliado de nuestra red a una tarifa fija y transparente.');

p('Esta relación es completamente independiente: el profesional y la empresa acuerdan directamente su contrato de servicios. SST-Colombia actúa como facilitador, garantizando que el profesional asignado conozca la plataforma y pueda acompañar a su equipo desde el primer día.');

doc.moveDown(0.2);
const cloY = doc.y;
doc.rect(L, cloY, W, 2).fill(GREEN);
doc.moveDown(0.5);
doc.fontSize(13).font('Helvetica-Bold').fillColor(DGRN)
   .text('Una inversión, múltiples beneficios', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').fillColor(GRAY)
   .text(
     'SST-Colombia le permite cumplir la ley, proteger a sus trabajadores, reducir el riesgo\n' +
     'legal de sus representantes y centralizar la gestión de todas sus empresas desde un único lugar.\n' +
     'Todo esto, con la tranquilidad de saber que su información está protegida con los más\n' +
     'altos estándares de seguridad disponibles.',
     L, doc.y, { width: W, align: 'center', lineGap: 3 }
   );
doc.moveDown(0.6);
doc.rect(L, doc.y, W, 2).fill(GREEN);
doc.moveDown(0.5);

doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK)
   .text('Para más información o para agendar una demostración personalizada:', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').fillColor(GREEN)
   .text('admin@sst-colombia.com  ·  sst.sagisas.co', L, doc.y, { width: W, align: 'center' });
doc.moveDown(0.2);
doc.fontSize(9).font('Helvetica').fillColor(GRAY)
   .text(RAZÓN + '  ·  ' + NIT + '  ·  Medellín, Colombia', L, doc.y, { width: W, align: 'center' });

// ══════════════════════════════════════════════════════════════════════════════
// POST-PROCESO: encabezados y pie de página en páginas 2+
// ══════════════════════════════════════════════════════════════════════════════
const range = doc.bufferedPageRange();
const total  = range.count;

for (let i = 1; i < total; i++) {
  doc.switchToPage(i);
  smallHeader(i + 1, total);
}

doc.end();
doc.on('end', () => console.log(`PDF listo: ${OUT}  (${total} páginas)`));
