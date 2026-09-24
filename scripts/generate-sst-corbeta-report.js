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
label("Alcance para Los Picas", 55, 177, "#8DD1A2", 8.2);
text("Automatización del\nSG-SST y PESV", 52, 202, 493, 33, C.white, "Bold", 4);
text(
  "Cómo SST Colombia sistematizaría la gestión del SG-SST y, cuando aplique, del PESV de Los Picas S.A.S., con acompañamiento profesional.",
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
  "Este documento presenta la sistematización propuesta del SG-SST y, si aplica, del PESV de Los Picas, con acompañamiento profesional. No es una certificación de cumplimiento.",
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
doc.font("Reg").fontSize(7.1).fillColor("#B8D8C3").text("01 / 07", W - 105, H - 47, {
  width: 50,
  align: "right",
});

// 2. Metodología propuesta
addBodyPage(2, "Metodología SG-SST");
titleBlock(
  "01  ·  METODOLOGÍA DE CUMPLIMIENTO",
  "Metodología para gestionar el SG-SST",
  "Tras formalizar el servicio, la profesional SST realizará auditorías internas, investigará eventos y capacitará al personal, en el marco del ciclo PHVA de Los Picas.",
);
box(L, 155, CW, 78, C.pale, C.pale, 10);
label("Punto de partida", L + 16, 171, C.green, 7);
text(
  "Los Picas aportará información de su operación, riesgos, documentos y protocolos de contingencia y emergencia establecidos. Con esa base se precisarán el alcance, los responsables y la programación, sin atribuir resultados previos.",
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
card(L, 250, half, moduleHeight, "P  ·  PLANEAR", "Acordar las actividades", "Con la información aportada por Los Picas se acordarán el alcance de las auditorías, los temas de capacitación y las prioridades de prevención según sus riesgos y procedimientos.");
card(L + half + gap, 250, half, moduleHeight, "H  ·  HACER", "Capacitar e investigar", "La profesional SST capacitará al personal en SST y en los protocolos de contingencia y emergencia aplicables; investigará con los responsables los incidentes y accidentes que correspondan.");
card(L, 430, half, moduleHeight, "V  ·  VERIFICAR", "Auditar el SG-SST", "La profesional SST auditará evidencias y controles y usará los indicadores e informes generados con datos de Los Picas para identificar avances, hallazgos y pendientes.");
card(L + half + gap, 430, half, moduleHeight, "A  ·  ACTUAR", "Seguir las mejoras", "Los Picas definirá y ejecutará las medidas correctivas y preventivas; la profesional SST dará seguimiento técnico a los hallazgos e investigaciones y revisará las evidencias de cierre cuando existan.");
box(L, 615, CW, 106, C.pale2, C.pale2, 10);
label("Responsabilidades y soportes", L + 15, 633, C.blue, 7);
text(
  "La profesional SST auditará, investigará y capacitará, documentando sus resultados. Los Picas aportará información, designará responsables y ejecutará las medidas; los registros del sistema servirán para sustentar y seguir lo efectivamente realizado.",
  L + 15,
  651,
  CW - 30,
  8.4,
  C.muted,
  "Reg",
  2.7,
);

// Las dos secciones se emiten en el orden: plataforma, luego informes.
function addReportsPage() {
addBodyPage(4, "Informes SG-SST");
titleBlock(
  "03  ·  INFORMES Y ESTADÍSTICAS",
  "Informes y estadísticas del SG-SST",
  "SST Colombia muestra indicadores y genera informes descargables a partir de registros reales. Estas salidas ayudarían a Los Picas a verificar avances y rendir cuentas después de iniciar su gestión.",
);
const cardGap = 12;
const cardWidth = (CW - cardGap) / 2;
const reportHeight = 145;
const reportY = 174;
const reportGap = 10;
card(L, reportY, cardWidth, reportHeight, "PANEL PHVA", "Avance anual", "Muestra evaluación SG-SST, avance del plan, inspecciones, peligros, auditorías y accidentalidad por año a partir de los registros de la empresa.");
card(L + cardWidth + cardGap, reportY, cardWidth, reportHeight, "OBJETIVOS E INDICADORES", "Metas medibles", "Muestra objetivos cumplidos, porcentaje de cumplimiento y avance promedio; genera un PDF consolidado de objetivos e indicadores para seguir las metas.");
card(L, reportY + reportHeight + reportGap, cardWidth, reportHeight, "AUSENTISMO LABORAL", "Tasa y días perdidos", "Según las ausencias registradas, muestra casos, días perdidos por causa, tasa de ausentismo y duración promedio; permite descargar estadísticas en PDF.");
card(L + cardWidth + cardGap, reportY + reportHeight + reportGap, cardWidth, reportHeight, "RENDICIÓN MENSUAL", "Informe de gestión", "PDF mensual con trabajadores, capacitaciones, inspecciones y hallazgos, accidentes, condiciones de salud y exámenes médicos registrados.");
card(L, reportY + 2 * (reportHeight + reportGap), cardWidth, reportHeight, "AUDITORÍAS Y ACCIONES", "Hallazgos y eficacia", "PDF consolidado de auditorías internas y panel de acciones completadas, pendientes y vencidas, con porcentajes de completitud y eficacia.");
card(L + cardWidth + cardGap, reportY + 2 * (reportHeight + reportGap), cardWidth, reportHeight, "OTROS INFORMES", "Formación y SST/PESV", "PDF de capacitaciones y accidentes por período e informe anual consolidado SST/PESV para la profesional autorizada, con los datos disponibles.");
box(L, 650, CW, 70, C.pale2, C.pale2, 9);
label("Para qué sirven a Los Picas", L + 14, 664, C.blue, 6.8);
text(
  "Los paneles permiten revisar avances y pendientes; los PDF dejan trazabilidad para auditoría y rendición de cuentas. Sin registros de Los Picas, no hay cifras ni resultados que presentar.",
  L + 14,
  681,
  CW - 28,
  8.1,
  C.muted,
  "Reg",
  2.5,
);
}

function addAutomationPage() {
addBodyPage(3, "Automatización SST/PESV");
titleBlock(
  "02  ·  ALCANCE DE LA PLATAFORMA",
  "Automatización SST y PESV",
  "SST Colombia ayuda a organizar y seguir los procesos del SG-SST y, cuando corresponda, del PESV de Los Picas, con registros verificables.",
);
const automationY = 168;
const automationHeight = 128;
const automationGap = 12;
const automationCardWidth = (CW - automationGap) / 2;
card(
  L,
  automationY,
  automationCardWidth,
  automationHeight,
  "GESTIÓN SST",
  "Requisitos aplicables",
  "Organiza los requisitos de Seguridad y Salud en el Trabajo que deban gestionarse y facilita su seguimiento documental. Su pertinencia se verifica con Los Picas.",
);
card(
  L + automationCardWidth + automationGap,
  automationY,
  automationCardWidth,
  automationHeight,
  "GESTIÓN DE RIESGOS",
  "Matriz de peligros",
  "Permite documentar peligros, valorar riesgos y hacer seguimiento a las medidas de control, de acuerdo con la operación y la revisión técnica de Los Picas.",
);
card(
  L,
  automationY + automationHeight + automationGap,
  automationCardWidth,
  automationHeight,
  "EVALUACIÓN SG-SST",
  "Avances y pendientes",
  "Sistematiza la evaluación y sus soportes para visualizar avances y pendientes, y facilitar el seguimiento de las acciones de mejora.",
);
card(
  L + automationCardWidth + automationGap,
  automationY + automationHeight + automationGap,
  automationCardWidth,
  automationHeight,
  "GESTIÓN PESV",
  "Seguimiento vial",
  "Si el PESV corresponde, ordena actividades, evidencias y seguimiento de seguridad vial en un mismo entorno para consultar el estado de su gestión.",
);
card(
  L,
  automationY + 2 * (automationHeight + automationGap),
  automationCardWidth,
  automationHeight,
  "OPERACIÓN DIARIA",
  "Registros digitales",
  "Inducciones, comunicaciones, reportes e inspecciones pueden registrarse y consultarse digitalmente por los participantes autorizados.",
);
card(
  L + automationCardWidth + automationGap,
  automationY + 2 * (automationHeight + automationGap),
  automationCardWidth,
  automationHeight,
  "CONTROL DE GESTIÓN",
  "Pendientes e informes",
  "Los responsables consultan avances y pendientes; los informes generados a partir de los registros apoyan la revisión y la rendición de cuentas.",
  C.blue,
);
box(L, 606, CW, 112, C.pale, C.pale, 10);
label("Valor de la sistematización", L + 15, 624, C.green, 7);
text(
  "La plataforma reúne procesos, registros y evidencias para reducir trabajo manual y facilitar la trazabilidad. Los Picas y la profesional SST validarán la información y ejecutarán las actividades; el componente PESV se utilizará si aplica.",
  L + 15,
  643,
  CW - 30,
  8.1,
  C.deep,
  "Reg",
  2.7,
);
}

addAutomationPage();
addReportsPage();

// 5. Portal del trabajador
addBodyPage(5, "Portal de Empleados");
titleBlock(
  "04  ·  PARTICIPACIÓN DEL PERSONAL",
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
  "El conductor registra su condición antes de iniciar la jornada. Los responsables pueden revisar las novedades que correspondan para apoyar la prevención de riesgos.",
);
card(
  L + portalCardWidth + portalGap,
  portalY,
  portalCardWidth,
  portalHeight,
  "INSPECCIÓN PREOPERACIONAL",
  "Vehículos",
  "La inspección digital antes de la operación deja registro del estado del vehículo y de las novedades que requieren seguimiento por parte de la empresa.",
);
card(
  L,
  portalY + portalHeight + portalGap,
  portalCardWidth,
  portalHeight,
  "INSPECCIÓN PREOPERACIONAL",
  "Maquinaria amarilla y equipos",
  "Permite documentar la revisión de maquinaria y equipos antes de su uso, registrar observaciones y dar seguimiento a las novedades detectadas.",
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
  "El trabajador puede consultar las inducciones y actividades de formación que la empresa le asigne, junto con sus actividades pendientes y completadas.",
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
  "Los registros de participación quedan disponibles para seguimiento por los responsables autorizados. El portal reúne actividades pendientes y confirmaciones para facilitar la gestión del personal.",
  L + 15,
  643,
  CW - 30,
  8.2,
  C.deep,
  "Reg",
  2.8,
);

// 6. Alcance propuesto de la profesional SST
addBodyPage(6, "Acompañamiento profesional");
titleBlock(
  "05  ·  ACTIVIDADES DE LA PROFESIONAL SST",
  "Trabajo previsto para Los Picas",
  "Una vez formalizado el servicio, Ely Johana Casarrubia Rojas desarrollará estas actividades con los responsables de Los Picas, según sus riesgos y protocolos establecidos.",
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
  "AUDITORÍA",
  "Revisión del SG-SST",
  "Auditará el SG-SST frente a los requisitos aplicables y procedimientos de Los Picas; revisará evidencias, controles e indicadores y documentará hallazgos y recomendaciones.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY,
  professionalCardWidth,
  professionalHeight,
  "SEGUIMIENTO",
  "Acciones de mejora",
  "Revisará con los responsables las acciones surgidas de auditorías e investigaciones, sus soportes y eficacia; comunicará los pendientes que requieran decisión de Los Picas.",
);
card(
  L,
  professionalY + professionalHeight + professionalGap,
  professionalCardWidth,
  professionalHeight,
  "INVESTIGACIÓN",
  "Incidentes y accidentes",
  "Investigará los eventos que correspondan junto con los responsables de Los Picas; documentará hechos, causas y medidas correctivas y preventivas conforme al procedimiento establecido.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY + professionalHeight + professionalGap,
  professionalCardWidth,
  professionalHeight,
  "FORMACIÓN",
  "Capacitación SST",
  "Capacitará a trabajadores y responsables en los riesgos y medidas preventivas aplicables a su labor. Dejará registro de temas y asistencia para evidenciar la formación realizada.",
);
card(
  L,
  professionalY + 2 * (professionalHeight + professionalGap),
  professionalCardWidth,
  professionalHeight,
  "CONTINGENCIAS Y EMERGENCIAS",
  "Protocolos establecidos",
  "Para capacitar e investigar, aplicará los protocolos de contingencia y emergencia establecidos por Los Picas y coordinará con los responsables designados en ellos.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY + 2 * (professionalHeight + professionalGap),
  professionalCardWidth,
  professionalHeight,
  "RESULTADOS",
  "Hallazgos y evidencias",
  "Presentará resultados de auditorías, investigaciones y capacitaciones; usará los indicadores e informes disponibles para sustentar recomendaciones y dar seguimiento a las acciones.",
  C.blue,
);
box(L, 606, CW, 112, C.pale, C.pale, 10);
label("Alcance de la profesional SST", L + 15, 624, C.green, 7);
text(
  "La profesional SST auditará el SG-SST, investigará los incidentes y accidentes que correspondan y capacitará al personal conforme a los protocolos de contingencia y emergencia establecidos por Los Picas. Comunicará hallazgos y recomendaciones para que la empresa adopte y ejecute las medidas pertinentes.",
  L + 15,
  643,
  CW - 30,
  8.1,
  C.deep,
  "Reg",
  2.7,
);

// 7. Ruta de acompañamiento y condiciones
addBodyPage(7, "Ruta de acompañamiento");
titleBlock(
  "06  ·  RUTA DE ACOMPAÑAMIENTO",
  "Inicio y desarrollo del servicio",
  "Las actividades propuestas comenzarán tras formalizar el servicio.",
);
box(L, 161, CW, 140, C.pale, C.pale, 11);
doc.roundedRect(L, 161, 5, 140, 2.5).fill(C.accent);
label("Profesional SST propuesta", L + 19, 180, C.green, 7.1);
text("Ely Johana Casarrubia Rojas", L + 19, 198, CW - 38, 16, C.deep, "Bold", 2);
text(
  "La profesional SST auditará el SG-SST, investigará los eventos que correspondan y capacitará al personal de Los Picas. Articulará su trabajo con los responsables internos y los protocolos de contingencia y emergencia establecidos.",
  L + 19,
  228,
  CW - 38,
  8.5,
  C.ink,
  "Reg",
  2.5,
);

label("Secuencia propuesta", L, 326, C.blue, 7.2);
const steps = [
  ["01", "Formalizar y reunir la información", "Los Picas aportará registros del SG-SST, riesgos y protocolos vigentes; se acordará la programación."],
  ["02", "Auditar el SG-SST", "La profesional SST revisará evidencias y procedimientos, y dejará constancia de hallazgos y recomendaciones."],
  ["03", "Investigar y capacitar", "Investigará los eventos que correspondan y capacitará al personal conforme a los protocolos establecidos."],
  ["04", "Documentar y hacer seguimiento", "Usará informes y estadísticas disponibles para revisar con Los Picas el avance de las medidas definidas."],
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
  "Los Picas S.A.S. aún no está suscrita. Estas actividades son futuras: no se presentan auditorías, investigaciones, capacitaciones ni resultados ya realizados. Su ejecución dependerá del servicio formalizado y de la información disponible. La responsabilidad legal permanece en el empleador.",
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