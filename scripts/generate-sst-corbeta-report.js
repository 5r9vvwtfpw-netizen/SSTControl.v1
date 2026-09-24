import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(
  process.cwd(),
  "documents",
  "informe-alcance-sst-colombia-los-picas-corbeta.pdf",
);
const logoPath = path.join(process.cwd(), "server", "assets", "sst-colombia-logo.png");
const regularFont = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const boldFont = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const C = {
  deep: "#12442E",
  dark: "#0B3524",
  green: "#217346",
  accent: "#42A461",
  pale: "#EAF3ED",
  pale2: "#F4F8F5",
  ink: "#1F2D25",
  muted: "#5E6D63",
  line: "#D8E3DB",
  white: "#FFFFFF",
  blue: "#3D6B73",
  redPale: "#F9EFEA",
  red: "#A24D34",
};
const W = 595.28;
const H = 841.89;
const L = 48;
const R = 48;
const CW = W - L - R;

const doc = new PDFDocument({
  size: "A4",
  autoFirstPage: false,
  compress: true,
});
doc.registerFont("Reg", regularFont).registerFont("Bold", boldFont);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const output = fs.createWriteStream(outputPath);
doc.pipe(output);

function text(value, x, y, width, size = 9, color = C.ink, font = "Reg", lineGap = 2.5) {
  doc.font(font).fontSize(size).fillColor(color).text(value, x, y, { width, lineGap });
}

function label(value, x, y, color = C.green, size = 7.4) {
  doc.font("Bold").fontSize(size).fillColor(color).text(value.toUpperCase(), x, y, {
    characterSpacing: 0.6,
  });
}

function line(x1, y1, x2, y2, color = C.line, width = 1) {
  doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(width).strokeColor(color).stroke();
}

function box(x, y, width, height, fill = C.white, stroke = C.line, radius = 10) {
  doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke);
}

function addBodyPage(number, section) {
  doc.addPage({ size: "A4", margins: { top: 60, right: R, bottom: 48, left: L } });
  doc.image(logoPath, L, 20, { width: 26, height: 26 });
  doc.font("Bold").fontSize(8.3).fillColor(C.deep).text("SST COLOMBIA", L + 34, 22, {
    characterSpacing: 0.4,
  });
  doc.font("Reg").fontSize(7).fillColor(C.muted).text("SADGI S.A.S.  ·  INFORME INFORMATIVO", L + 34, 35);
  doc.font("Bold").fontSize(7).fillColor(C.green).text(section.toUpperCase(), W - R - 170, 27, {
    width: 125,
    align: "right",
    characterSpacing: 0.4,
  });
  doc.font("Bold").fontSize(8).fillColor(C.deep).text(String(number).padStart(2, "0"), W - R - 31, 25, {
    width: 25,
    align: "right",
  });
  line(L, 56, W - R, 56);
  line(L, H - 69, W - R, H - 69);
  doc.font("Reg").fontSize(7).fillColor(C.muted).text(
    "Documento informativo  ·  Los Picas S.A.S.  ·  Colombiana de Comercio S.A. (Corbeta)",
    L,
    H - 59,
    { width: CW - 4 },
  );
}

function titleBlock(kicker, title, subtitle) {
  label(kicker, L, 77, C.accent, 7.7);
  text(title, L, 94, CW, 20, C.deep, "Bold", 2);
  text(subtitle, L, 124, CW, 9, C.muted, "Reg", 2.5);
}

function card(x, y, width, height, kicker, title, body, accent = C.accent) {
  box(x, y, width, height, C.white, C.line, 10);
  doc.roundedRect(x, y + 12, 3, height - 24, 1.5).fill(accent);
  label(kicker, x + 15, y + 14, accent, 6.8);
  text(title, x + 15, y + 30, width - 29, 10.1, C.deep, "Bold", 2);
  text(body, x + 15, y + 50, width - 29, 7.8, C.muted, "Reg", 2.2);
}

// 1. Portada
doc.addPage({ size: "A4", margins: { top: 0, right: 0, bottom: 0, left: 0 } });
doc.rect(0, 0, W, H).fill(C.dark);
doc.circle(W - 5, 136, 185).fill("#12432E");
doc.circle(W - 4, 132, 117).fill("#16553A");
doc.rect(0, 0, 9, H).fill(C.accent);
doc.image(logoPath, 52, 48, { width: 48, height: 48 });
doc.font("Bold").fontSize(11).fillColor(C.white).text("SST COLOMBIA", 111, 52, {
  characterSpacing: 0.7,
});
doc.font("Reg").fontSize(8).fillColor("#B8D8C3").text("SADGI S.A.S.  ·  SISTEMA DE GESTIÓN SST", 111, 71, {
  characterSpacing: 0.25,
});
doc.roundedRect(W - 188, 55, 136, 25, 12).fill("#1C6342");
doc.font("Bold").fontSize(7).fillColor("#E8F4EC").text("DIRIGIDO A CORBETA", W - 180, 63, {
  width: 120,
  align: "center",
  characterSpacing: 0.4,
});
label("Alcance de acompañamiento", 55, 177, "#8DD1A2", 8.2);
text("Acompañamiento para el\nSG-SST de Los Picas", 52, 202, 493, 33, C.white, "Bold", 4);
text(
  "Alcance propuesto para organizar, ejecutar, verificar y mejorar la gestión de Seguridad y Salud en el Trabajo de Los Picas S.A.S.",
  55,
  310,
  450,
  11.4,
  "#D5E8DB",
  "Reg",
  3.5,
);
line(55, 383, 143, 383, C.accent, 3);
label("Empresa proveedora", 55, 419, "#8DD1A2", 7);
text("Los Picas S.A.S.", 55, 436, 230, 11.2, C.white, "Bold");
label("Destinatario", 310, 419, "#8DD1A2", 7);
text("Colombiana de Comercio S.A.\n(Corbeta)", 310, 436, 235, 10.2, C.white, "Bold", 2.4);
label("Ubicación", 55, 486, "#8DD1A2", 7);
text("Medellín, Colombia", 55, 503, 230, 9.2, C.white);
label("Fecha", 310, 486, "#8DD1A2", 7);
text("24 de septiembre de 2026", 310, 503, 235, 9.2, C.white);
box(54, 623, 487, 135, "#F2F7F3", "#DDEAE0", 12);
label("Objeto y condición del informe", 74, 644, C.green, 7.2);
text(
  "Este documento presenta el acompañamiento propuesto para organizar, ejecutar, verificar y mejorar el SG-SST de Los Picas S.A.S. No constituye una certificación ni una auditoría de cumplimiento.",
  74,
  664,
  444,
  9.2,
  C.ink,
  "Reg",
  3.5,
);
text(
  "Los Picas S.A.S. aún no está suscrita. El diagnóstico, las actividades y los resultados se definirán tras revisar su operación; este informe no atribuye avances ni registros existentes.",
  74,
  715,
  444,
  8,
  C.muted,
  "Reg",
  2.5,
);
doc.font("Reg").fontSize(7.1).fillColor("#B8D8C3").text("SST COLOMBIA  ·  SADGI S.A.S.", 55, H - 47, {
  characterSpacing: 0.4,
});
doc.font("Reg").fontSize(7.1).fillColor("#B8D8C3").text("01 / 06", W - 105, H - 47, {
  width: 50,
  align: "right",
});

// 2. Metodología propuesta
addBodyPage(2, "Metodología SG-SST");
titleBlock(
  "01  ·  METODOLOGÍA DE CUMPLIMIENTO",
  "Metodología para gestionar el SG-SST",
  "El acompañamiento se organizará con el ciclo PHVA, a partir de un diagnóstico específico de Los Picas y de los requisitos aplicables a su operación.",
);
box(L, 155, CW, 78, C.pale, C.pale, 10);
label("Punto de partida", L + 16, 171, C.green, 7);
text(
  "Antes de fijar actividades y metas, Ely revisará la actividad, sedes, tareas, personal, peligros y documentos existentes para precisar obligaciones, necesidades y prioridades.",
  L + 16,
  189,
  CW - 32,
  9.1,
  C.deep,
  "Reg",
  3,
);
const gap = 12;
const half = (CW - gap) / 2;
const moduleHeight = 168;
card(L, 250, half, moduleHeight, "P  ·  PLANEAR", "Diagnosticar y priorizar", "Contrastar el SG-SST con los estándares mínimos y requisitos aplicables; identificar brechas; revisar peligros y formular objetivos, indicadores y plan anual con responsables y fechas.");
card(L + half + gap, 250, half, moduleHeight, "H  ·  HACER", "Coordinar la ejecución", "Acompañar el plan de trabajo, las capacitaciones, inspecciones y medidas preventivas; orientar el registro de incidentes y la participación del personal junto con los responsables internos.");
card(L, 430, half, moduleHeight, "V  ·  VERIFICAR", "Revisar avances y evidencias", "Evaluar periódicamente indicadores, objetivos, auditorías, inspecciones, accidentes y avance del plan; identificar desviaciones, actividades pendientes y acciones vencidas.");
card(L + half + gap, 430, half, moduleHeight, "A  ·  ACTUAR", "Corregir y mejorar", "Acordar responsables y plazos para cerrar brechas; verificar evidencias y eficacia de las acciones; documentar ajustes para el siguiente ciclo de gestión.");
box(L, 615, CW, 106, C.pale2, C.pale2, 10);
label("Responsabilidad del empleador", L + 15, 633, C.blue, 7);
text(
  "Ely asesora, coordina y hace seguimiento. Los Picas designa responsables, facilita recursos y ejecuta los controles. El alcance definitivo se ajustará al diagnóstico y a las obligaciones aplicables.",
  L + 15,
  651,
  CW - 30,
  8.4,
  C.muted,
  "Reg",
  2.7,
);

// 3. Evidencias e informes
addBodyPage(3, "Evidencias SG-SST");
titleBlock(
  "02  ·  SOPORTES DE LA GESTIÓN",
  "Evidencias del cumplimiento del SG-SST",
  "Se organizarán y revisarán los registros necesarios para sustentar cada etapa del SG-SST. Los reportes reflejarán únicamente las actividades y datos que Los Picas registre y valide.",
);
const cardGap = 12;
const cardWidth = (CW - cardGap) / 2;
const reportHeight = 145;
const reportY = 174;
const reportGap = 10;
card(L, reportY, cardWidth, reportHeight, "GESTIÓN Y CUMPLIMIENTO", "Evaluaciones y rendición", "Evaluación de estándares mínimos y del SG-SST; seguimiento de requisitos críticos; rendición de cuentas, designaciones y documentos del sistema.");
card(L + cardWidth + cardGap, reportY, cardWidth, reportHeight, "PLAN ANUAL Y FORMACIÓN", "Planificación y capacitación", "Plan anual de trabajo, programa y cronograma de capacitación, evidencias de inducción y reinducción y listas de asistencia.");
card(L, reportY + reportHeight + reportGap, cardWidth, reportHeight, "ACCIDENTALIDAD", "Incidentes y accidentes", "Indicadores, formatos FURAT en PDF y Excel, investigaciones y seguimiento a las acciones que se deriven de los eventos reportados.");
card(L + cardWidth + cardGap, reportY + reportHeight + reportGap, cardWidth, reportHeight, "VERIFICACIÓN Y MEJORA", "Auditorías y acciones", "Informes de auditorías internas, seguimiento de objetivos e indicadores, revisiones por la dirección y acciones de mejora.");
card(L, reportY + 2 * (reportHeight + reportGap), cardWidth, reportHeight, "INSPECCIÓN Y SALUD", "Registros de control", "Inspecciones, condiciones de salud, exámenes médicos, conservación auditiva y medidas preventivas, según corresponda.");
card(L + cardWidth + cardGap, reportY + 2 * (reportHeight + reportGap), cardWidth, reportHeight, "PESV, SI APLICA", "Seguridad vial", "Si el diagnóstico confirma su aplicabilidad: evidencias de rutas, liderazgo, inspecciones, auditorías y matriz de peligros viales.");
box(L, 650, CW, 70, C.pale2, C.pale2, 9);
label("Criterio de uso", L + 14, 664, C.blue, 6.8);
text(
  "Las evidencias deben corresponder a actividades realmente ejecutadas y contar con soportes verificables; los reportes no sustituyen la revisión profesional ni las responsabilidades del empleador.",
  L + 14,
  681,
  CW - 28,
  8.1,
  C.muted,
  "Reg",
  2.5,
);

// 4. Portal del trabajador
addBodyPage(4, "Portal de Empleados");
titleBlock(
  "03  ·  PARTICIPACIÓN DEL PERSONAL",
  "Portal de Empleados",
  "Canal para que los trabajadores participen en formación, inspecciones y reportes definidos para la operación de Los Picas.",
);
const portalY = 168;
const portalHeight = 130;
const portalGap = 12;
const portalCardWidth = (CW - portalGap) / 2;
card(
  L,
  portalY,
  portalCardWidth,
  portalHeight,
  "ANTES DE CONDUCIR",
  "Encuesta diaria del conductor",
  "Autorreporte de sueño y estados físico y emocional antes de la jornada; registra consumo de alcohol y, si la empresa lo habilita, el resultado de alcoholimetría. Ayuda a identificar alertas de aptitud.",
);
card(
  L + portalCardWidth + portalGap,
  portalY,
  portalCardWidth,
  portalHeight,
  "INSPECCIÓN PREOPERACIONAL",
  "Vehículos",
  "Lista digital de 16 chequeos en cuatro grupos: exterior, interior, mecánica y seguridad. Genera resultado Apto, Apto con observaciones o No apto y se refleja en el módulo H06 del PESV.",
);
card(
  L,
  portalY + portalHeight + portalGap,
  portalCardWidth,
  portalHeight,
  "INSPECCIÓN PREOPERACIONAL",
  "Maquinaria amarilla y equipos",
  "Checklist específico por equipo, con turno, horómetro y frente de trabajo; cubre hidráulica, fugas, tren de rodaje, implementos, luces y más. Una falla exige comentario y genera resultado No apta.",
);
card(
  L + portalCardWidth + portalGap,
  portalY + portalHeight + portalGap,
  portalCardWidth,
  portalHeight,
  "PARTICIPACIÓN DEMOCRÁTICA",
  "Elecciones virtuales",
  "Los trabajadores consultan convocatorias activas y votan desde el portal en procesos electorales del COPASST y del Comité de Convivencia Laboral.",
);
card(
  L,
  portalY + 2 * (portalHeight + portalGap),
  portalCardWidth,
  portalHeight,
  "FORMACIÓN A LO LARGO DEL AÑO",
  "Capacitación virtual continua",
  "El trabajador accede a inducciones y reinducciones virtuales SST/PESV, y a capacitaciones PESV programadas. Consulta actividades pendientes, completadas e historial.",
);
card(
  L + portalCardWidth + portalGap,
  portalY + 2 * (portalHeight + portalGap),
  portalCardWidth,
  portalHeight,
  "COMUNICACIÓN Y REPORTE",
  "Canal directo con el trabajador",
  "Consulta Comunicaciones SST y confirma lectura; reporta incidentes y revisa sus propios reportes. El portal también ofrece opciones de participación y salud ocupacional.",
  C.blue,
);
box(L, 606, CW, 112, C.pale, C.pale, 10);
label("Trazabilidad y seguimiento", L + 15, 624, C.green, 7);
text(
  "Los registros de encuestas e inspecciones quedan disponibles para consulta en los módulos administrativos relacionados. El portal reúne actividades pendientes, confirmaciones y antecedentes del trabajador para facilitar el seguimiento.",
  L + 15,
  643,
  CW - 30,
  8.2,
  C.deep,
  "Reg",
  2.8,
);

// 5. Acompañamiento profesional para Los Picas
addBodyPage(5, "Acompañamiento profesional");
titleBlock(
  "04  ·  PLAN DE TRABAJO PROFESIONAL",
  "Plan profesional para Los Picas",
  "Ely Johana Casarrubia Rojas liderará el acompañamiento técnico en las etapas de planificación, ejecución, verificación y mejora del SG-SST.",
);
const professionalY = 168;
const professionalHeight = 128;
const professionalGap = 12;
const professionalCardWidth = (CW - professionalGap) / 2;
card(
  L,
  professionalY,
  professionalCardWidth,
  professionalHeight,
  "P  ·  DIAGNÓSTICO",
  "Evaluación inicial",
  "Revisará actividad, sedes, tareas, trabajadores y documentos existentes; contrastará la situación con estándares mínimos y requisitos aplicables, identificará brechas y propondrá prioridades.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY,
  professionalCardWidth,
  professionalHeight,
  "P  ·  PLANIFICACIÓN",
  "Plan anual, metas e indicadores",
  "Con Los Picas, organizará objetivos e indicadores y estructurará el plan anual con actividades, responsables internos, fechas y evidencias; revisará avances y elevará pendientes para decisión.",
);
card(
  L,
  professionalY + professionalHeight + professionalGap,
  professionalCardWidth,
  professionalHeight,
  "P  ·  GESTIÓN DEL RIESGO",
  "Matriz IPER y controles",
  "Facilitará la revisión de tareas y peligros con responsables y trabajadores; apoyará la actualización de la matriz IPER, la documentación de controles y el seguimiento a su aplicación.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY + professionalHeight + professionalGap,
  professionalCardWidth,
  professionalHeight,
  "H  ·  EJECUCIÓN",
  "Capacitación y participación",
  "Coordinará el programa de capacitación, inducciones y reinducciones; verificará cronogramas y soportes de asistencia, y orientará inspecciones, reportes, elecciones y comunicaciones del personal.",
);
card(
  L,
  professionalY + 2 * (professionalHeight + professionalGap),
  professionalCardWidth,
  professionalHeight,
  "V  ·  SEGUIMIENTO",
  "Indicadores y verificación",
  "Revisará indicadores, objetivos, auditorías, inspecciones y avance del plan; identificará desviaciones, actividades pendientes y acciones vencidas, y presentará resultados a los responsables.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY + 2 * (professionalHeight + professionalGap),
  professionalCardWidth,
  professionalHeight,
  "A  ·  INVESTIGACIÓN Y MEJORA",
  "Eventos y cierre de acciones",
  "Si ocurre un accidente, apoyará la investigación y el registro de acciones según severidad y requisitos. Dará seguimiento a compromisos, plazos, evidencias y eficacia de las medidas correctivas.",
  C.blue,
);
box(L, 606, CW, 112, C.pale, C.pale, 10);
label("Responsabilidades y herramienta de seguimiento", L + 15, 624, C.green, 7);
text(
  "Ely orienta, coordina, revisa y hace seguimiento con los responsables de Los Picas. La empresa facilita recursos y ejecuta los controles. El portal apoya la consulta de información, la trazabilidad de las actividades y el control de pendientes.",
  L + 15,
  643,
  CW - 30,
  8.1,
  C.deep,
  "Reg",
  2.7,
);

// 6. Ruta de inicio y condiciones
addBodyPage(6, "Ruta de inicio");
titleBlock(
  "05  ·  SECUENCIA DE IMPLEMENTACIÓN",
  "Ruta de trabajo y condiciones",
  "La secuencia comenzará después de formalizar el servicio; las prioridades y actividades definitivas se acordarán con base en el diagnóstico de Los Picas.",
);
box(L, 161, CW, 140, C.pale, C.pale, 11);
doc.roundedRect(L, 161, 5, 140, 2.5).fill(C.accent);
label("Profesional SST propuesta", L + 19, 180, C.green, 7.1);
text("Ely Johana Casarrubia Rojas", L + 19, 198, CW - 38, 16, C.deep, "Bold", 2);
text(
  "Liderará la orientación, coordinación y seguimiento técnico del SG-SST junto con los responsables internos. Acompañará la revisión de evidencias, indicadores, auditorías e investigaciones cuando corresponda.",
  L + 19,
  228,
  CW - 38,
  8.5,
  C.ink,
  "Reg",
  2.5,
);

label("Secuencia de inicio propuesta", L, 326, C.blue, 7.2);
const steps = [
  ["01", "Levantar información de la operación", "Reunir actividad, sedes, tareas, personal, vehículos y equipos, documentos y responsables internos."],
  ["02", "Diagnosticar y priorizar brechas", "Contrastar la situación con requisitos aplicables y definir prioridades; confirmar si corresponde incluir obligaciones PESV."],
  ["03", "Acordar el plan de trabajo", "Definir actividades, responsables, fechas, indicadores y evidencias necesarias para el seguimiento."],
  ["04", "Ejecutar, verificar y ajustar", "Acompañar formación e inspecciones, revisar resultados y acciones, documentar pendientes y proponer ajustes al plan."],
];
let stepY = 346;
for (let i = 0; i < steps.length; i++) {
  const [number, heading, description] = steps[i];
  doc.circle(L + 14, stepY + 12, 11).fill(i === 3 ? C.green : C.pale);
  doc.font("Bold").fontSize(7).fillColor(i === 3 ? C.white : C.green).text(number, L + 5, stepY + 8.7, {
    width: 18,
    align: "center",
  });
  if (i < steps.length - 1) line(L + 14, stepY + 24, L + 14, stepY + 61, C.line, 1.2);
  text(heading, L + 38, stepY, CW - 44, 9.2, C.deep, "Bold", 1.5);
  text(description, L + 38, stepY + 17, CW - 44, 7.8, C.muted, "Reg", 2.1);
  stepY += 61;
}
box(L, 615, CW, 123, C.redPale, C.redPale, 10);
label("Condición de este alcance", L + 15, 634, C.red, 7);
text(
  "Los Picas S.A.S. aún no está suscrita. Este informe plantea una metodología de trabajo; no acredita actividades realizadas ni resultados de cumplimiento. El diagnóstico definirá el alcance y las prioridades. La responsabilidad legal permanece en el empleador.",
  L + 15,
  653,
  CW - 30,
  8.1,
  C.ink,
  "Reg",
  2.7,
);

doc.end();
output.on("finish", () => {
  console.log(`PDF generado: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
});
output.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});