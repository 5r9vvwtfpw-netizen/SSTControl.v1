import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const PROVIDER_LEGAL_NAME = "SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.";
const PROVIDER_NIT = "902.036.337-4";
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;

function normalizeText(value, field, maxLength, required = false) {
  if (typeof value !== "string" || CONTROL_CHARACTERS.test(value)) {
    throw new Error(`El campo ${field} debe ser texto válido.`);
  }
  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length > maxLength) {
    throw new Error(`El campo ${field} no cumple con la longitud permitida.`);
  }
  return trimmed;
}

export async function generateInformeEjecutivoPdf(input) {
const recipients = input?.recipients;
if (
  !Array.isArray(recipients) ||
  recipients.length < 1 ||
  recipients.length > 2 ||
  recipients.some((recipient) => !recipient || typeof recipient !== "object")
) {
  throw new Error("El informe debe tener una o dos empresas.");
}
const destinatarios = recipients.map((recipient, index) => ({
  name: normalizeText(recipient.name, `empresaDestinataria${index + 1}`, 120, true),
  nit: normalizeText(recipient.nit ?? "", `nitDestinataria${index + 1}`, 30),
}));
const professionalName = normalizeText(input.professionalName ?? "", "nombreProfesional", 100);
if (
  destinatarios.length === 2 &&
  destinatarios[0].name.replace(/\s+/g, " ").toLocaleLowerCase("es") ===
    destinatarios[1].name.replace(/\s+/g, " ").toLocaleLowerCase("es")
) {
  throw new Error("Las empresas deben ser diferentes.");
}
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
const chunks = [];
doc.on("data", (chunk) => chunks.push(chunk));
const pdfComplete = new Promise((resolve, reject) => {
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.on("error", reject);
});

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
  doc.font("Reg").fontSize(7).fillColor(C.muted).text("SADGI S.A.S.  ·  INFORME EJECUTIVO", L + 34, 35);
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
  doc.font("Reg").fontSize(6.5).fillColor(C.muted).text(
    "SST COLOMBIA  ·  INFORME EJECUTIVO SG-SST",
    L, H - 59, { width: CW - 4, lineBreak: false },
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
text(
  `${PROVIDER_LEGAL_NAME}  ·  NIT ${PROVIDER_NIT}`,
  55,
  105,
  CW,
  6.7,
  "#B8D8C3",
);
doc.roundedRect(W - 188, 55, 136, 25, 12).fill("#1C6342");
doc.font("Bold").fontSize(7).fillColor("#E8F4EC").text("INFORME EJECUTIVO", W - 180, 63, {
  width: 120,
  align: "center",
  characterSpacing: 0.4,
});
label("Alcance para la empresa", 55, 177, "#8DD1A2", 8.2);
text("Gestión del SG-SST\nde la empresa", 52, 202, 493, 33, C.white, "Bold", 4);
text(
  "Cómo SST Colombia ayudaría a la empresa objeto del informe a gestionar su SG-SST de forma ágil y sistematizada, con acompañamiento profesional y PESV cuando corresponda.",
  55,
  310,
  450,
  11.4,
  "#D5E8DB",
  "Reg",
  3.5,
);
line(55, 383, 143, 383, C.accent, 3);
label(
  destinatarios.length === 1 ? "Empresa a la que se dirige el informe" : "Empresas a las que se dirige el informe",
  55, 419, "#8DD1A2", 7,
);
  const recipientGap = 16;
  const recipientWidth = destinatarios.length === 1
    ? CW
    : (CW - recipientGap) / 2;
  for (let index = 0; index < destinatarios.length; index++) {
    const recipient = destinatarios[index];
    const recipientX = L + index * (recipientWidth + recipientGap);
    let recipientSize = destinatarios.length === 1 ? 10 : 8.5;
    doc.font("Bold").fontSize(recipientSize);
    while (
      recipientSize > 5.5 &&
      doc.heightOfString(recipient.name, { width: recipientWidth, lineGap: 1 }) > 65
    ) {
      recipientSize -= 0.25;
      doc.fontSize(recipientSize);
    }
    const nameHeight = doc.heightOfString(recipient.name, {
      width: recipientWidth,
      lineGap: 1,
    });
    text(recipient.name, recipientX, 440, recipientWidth, recipientSize, C.white, "Bold", 1);
    if (recipient.nit) {
      text(
        `NIT: ${recipient.nit}`,
        recipientX,
        440 + nameHeight + 3,
        recipientWidth,
        7.5,
        "#D5E8DB",
        "Reg",
        1,
      );
    }
  }
  label("Lugar de emisión", 55, 566, "#8DD1A2", 7);
  text("Medellín, Colombia", 55, 583, 230, 9.2, C.white);
  label("Fecha", 310, 566, "#8DD1A2", 7);
  const issueDate = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  text(issueDate, 310, 583, 235, 9.2, C.white);
box(54, 623, 487, 135, "#F2F7F3", "#DDEAE0", 12);
label("Objeto y condición del informe", 74, 644, C.green, 7.2);
text(
  "Este documento presenta una ruta para gestionar el SG-SST de la empresa con el sistema y acompañamiento profesional; el PESV se incluiría si corresponde. No acredita cumplimiento.",
  74,
  664,
  444,
  9.2,
  C.ink,
  "Reg",
  3.5,
);
text(
  "El alcance, el diagnóstico y los resultados se precisarán con base en la operación de la empresa objeto del informe. Este informe no atribuye avances ni registros existentes.",
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
  "Tras formalizar el servicio, la profesional SST realizará auditorías internas, investigará eventos y capacitará al personal, en el marco del ciclo PHVA de la empresa.",
);
box(L, 155, CW, 78, C.pale, C.pale, 10);
label("Punto de partida", L + 16, 171, C.green, 7);
text(
  "La empresa aportará información de su operación, riesgos, documentos y protocolos de contingencia y emergencia establecidos. Con esa base se precisarán el alcance, los responsables y la programación, sin atribuir resultados previos.",
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
card(L, 250, half, moduleHeight, "P  ·  PLANEAR", "Acordar las actividades", "Con la información aportada por la empresa se acordarán el alcance de las auditorías, los temas de capacitación y las prioridades de prevención según sus riesgos y procedimientos.");
card(L + half + gap, 250, half, moduleHeight, "H  ·  HACER", "Capacitar e investigar", "La profesional SST capacitará al personal en SST y en los protocolos de contingencia y emergencia aplicables; investigará con los responsables los incidentes y accidentes que correspondan.");
card(L, 430, half, moduleHeight, "V  ·  VERIFICAR", "Auditar el SG-SST", "La profesional SST auditará evidencias y controles y usará los indicadores e informes generados con datos de la empresa para identificar avances, hallazgos y pendientes.");
card(L + half + gap, 430, half, moduleHeight, "A  ·  ACTUAR", "Seguir las mejoras", "La empresa definirá y ejecutará las medidas correctivas y preventivas; la profesional SST dará seguimiento técnico a los hallazgos e investigaciones y revisará las evidencias de cierre cuando existan.");
box(L, 615, CW, 106, C.pale2, C.pale2, 10);
label("Responsabilidades y soportes", L + 15, 633, C.blue, 7);
text(
  "La profesional SST auditará, investigará y capacitará, documentando sus resultados. La empresa aportará información, designará responsables y ejecutará las medidas; los registros del sistema servirán para sustentar y seguir lo efectivamente realizado.",
  L + 15,
  651,
  CW - 30,
  8.4,
  C.muted,
  "Reg",
  2.7,
);

// Primero se explica cómo se gestionaría el SG-SST; después, sus informes.
function addReportsPage() {
addBodyPage(4, "Informes SG-SST");
titleBlock(
  "03  ·  INFORMES Y ESTADÍSTICAS",
  "Informes y estadísticas del SG-SST",
  "SST Colombia muestra indicadores y genera informes descargables a partir de registros reales. Estas salidas ayudarían a la empresa a verificar avances y rendir cuentas después de iniciar su gestión.",
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
label("Para qué sirven a la empresa", L + 14, 664, C.blue, 6.8);
text(
  "Los paneles permiten revisar avances y pendientes; los PDF dejan trazabilidad para auditoría y rendición de cuentas. Sin registros de la empresa, no hay cifras ni resultados que presentar.",
  L + 14,
  681,
  CW - 28,
  8.1,
  C.muted,
  "Reg",
  2.5,
);
}

function addSstManagementPage() {
addBodyPage(3, "Gestión del SG-SST");
titleBlock(
  "02  ·  LA GESTIÓN SST EN EL SISTEMA",
  "Gestión sistematizada del SG-SST",
  "La plataforma permitiría a la empresa organizar la información, programar actividades, documentar su ejecución y dar seguimiento a los asuntos pendientes del SG-SST.",
);
const stepY = 174;
const stepHeight = 96;
const stepGap = 12;
card(
  L,
  stepY,
  CW,
  stepHeight,
  "01  ·  BASE DE LA EMPRESA",
  "Partir de una base común",
  "Trabajadores, cargos, actividades y evaluación SST quedan en un mismo entorno. Los responsables conocen el punto de partida y pueden continuar la gestión sin reunir archivos dispersos.",
);
card(
  L,
  stepY + stepHeight + stepGap,
  CW,
  stepHeight,
  "02  ·  PLAN DE TRABAJO",
  "Organizar el trabajo del año",
  "El plan anual reúne actividades de prevención, salud, capacitación, inspecciones y emergencias con responsables, fechas y estado. Cada tarea tiene un lugar y un seguimiento.",
);
card(
  L,
  stepY + 2 * (stepHeight + stepGap),
  CW,
  stepHeight,
  "03  ·  PREVENCIÓN Y SALUD",
  "Registrar y atender lo que ocurre",
  "La matriz IPERC, las inspecciones y la entrega de EPP documentan la prevención. Exámenes ocupacionales, ausencias, incidentes y accidentes dejan registro para atender y seguir las medidas.",
);
card(
  L,
  stepY + 3 * (stepHeight + stepGap),
  CW,
  stepHeight,
  "04  ·  PARTICIPACIÓN Y MEJORA",
  "Retomar pendientes y verificar",
  "COPASST, Comité de Convivencia, brigadas y simulacros tienen actividades y soportes. Objetivos, auditorías y acciones de mejora permiten revisar avances y decidir qué sigue.",
  C.blue,
);
box(L, 612, CW, 106, C.pale, C.pale, 10);
label("La diferencia práctica", L + 15, 630, C.green, 7);
text(
  "La app no sustituye a quienes gestionan el SG-SST: reduce la dispersión. La empresa podrá consultar con rapidez tareas, responsables, estados y evidencias, y continuar desde donde quedó sin reconstruir su gestión entre carpetas u hojas de cálculo. Todo depende de sus registros y ejecución reales.",
  L + 15,
  649,
  CW - 30,
  8.1,
  C.deep,
  "Reg",
  2.7,
);
}

addSstManagementPage();
addReportsPage();

// 5. Portal del trabajador
addBodyPage(5, "Portal de Empleados");
titleBlock(
  "04  ·  PARTICIPACIÓN DEL PERSONAL",
  "Portal de Empleados",
  "Canal para que los trabajadores participen en formación, inspecciones y reportes definidos para la operación de la empresa.",
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
label("05  ·  ACTIVIDADES DE LA PROFESIONAL SST", L, 77, C.accent, 7.7);
text("Trabajo previsto para la empresa", L, 94, CW, 20, C.deep, "Bold", 2);
const professionalIntro = `Una vez formalizado el servicio, ${professionalName || "la profesional SST"} desarrollará estas actividades con los responsables de la empresa, según sus riesgos y protocolos establecidos.`;
let professionalIntroSize = 9;
doc.font("Reg").fontSize(professionalIntroSize);
while (
  professionalIntroSize > 7 &&
  doc.heightOfString(professionalIntro, { width: CW, lineGap: 2.5 }) > 40
) {
  professionalIntroSize -= 0.25;
  doc.fontSize(professionalIntroSize);
}
text(professionalIntro, L, 124, CW, professionalIntroSize, C.muted, "Reg", 2.5);
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
  "Auditará el SG-SST frente a los requisitos aplicables y procedimientos de la empresa; revisará evidencias, controles e indicadores y documentará hallazgos y recomendaciones.",
);
card(
  L + professionalCardWidth + professionalGap,
  professionalY,
  professionalCardWidth,
  professionalHeight,
  "SEGUIMIENTO",
  "Acciones de mejora",
  "Revisará con los responsables las acciones surgidas de auditorías e investigaciones, sus soportes y eficacia; comunicará los pendientes que requieran decisión de la empresa.",
);
card(
  L,
  professionalY + professionalHeight + professionalGap,
  professionalCardWidth,
  professionalHeight,
  "INVESTIGACIÓN",
  "Incidentes y accidentes",
  "Investigará los eventos que correspondan junto con los responsables de la empresa; documentará hechos, causas y medidas correctivas y preventivas conforme al procedimiento establecido.",
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
  "Para capacitar e investigar, aplicará los protocolos de contingencia y emergencia establecidos por la empresa y coordinará con los responsables designados en ellos.",
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
  "La profesional SST auditará el SG-SST, investigará los incidentes y accidentes que correspondan y capacitará al personal conforme a los protocolos de contingencia y emergencia establecidos por la empresa. Comunicará hallazgos y recomendaciones para que la empresa adopte y ejecute las medidas pertinentes.",
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
label("Acompañamiento profesional SST", L + 19, 180, C.green, 7.1);
const professionalDisplayName = professionalName || "Profesional SST";
let professionalNameSize = 16;
doc.font("Bold").fontSize(professionalNameSize);
while (
  professionalNameSize > 7 &&
  doc.widthOfString(professionalDisplayName) > CW - 38
) {
  professionalNameSize -= 0.25;
  doc.fontSize(professionalNameSize);
}
text(professionalDisplayName, L + 19, 198, CW - 38, professionalNameSize, C.deep, "Bold", 2);
text(
  "La profesional SST auditará el SG-SST, investigará los eventos que correspondan y capacitará al personal. Articulará su trabajo con los responsables internos y los protocolos de contingencia y emergencia establecidos.",
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
  ["01", "Formalizar y reunir la información", "La empresa aportará registros del SG-SST, riesgos y protocolos vigentes; se acordará la programación."],
  ["02", "Auditar el SG-SST", "La profesional SST revisará evidencias y procedimientos, y dejará constancia de hallazgos y recomendaciones."],
  ["03", "Investigar y capacitar", "Investigará los eventos que correspondan y capacitará al personal conforme a los protocolos establecidos."],
  ["04", "Documentar y hacer seguimiento", "Usará informes y estadísticas disponibles para revisar con la empresa el avance de las medidas definidas."],
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
  "Las actividades descritas son futuras y su ejecución dependerá de formalizar el servicio, revisar la operación y contar con información disponible. No se presentan auditorías, investigaciones, capacitaciones ni resultados ya realizados. La responsabilidad legal permanece en el empleador.",
  L + 15,
  653,
  CW - 30,
  8.1,
  C.ink,
  "Reg",
  2.7,
);

doc.end();
return pdfComplete;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(process.cwd(), "scripts/generate-sst-corbeta-report.js")
) {
  const outputPath = path.join(
    process.cwd(),
    "documents",
    "informe-alcance-sst-colombia-los-picas-corbeta.pdf",
  );
  try {
    const pdf = await generateInformeEjecutivoPdf({
      recipients: [
        { name: "Los Picas S.A.S." },
        { name: "Colombiana de Comercio S.A. (Corbeta)" },
      ],
    });
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdf);
    console.log(`PDF generado: ${outputPath} (${pdf.length} bytes)`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}