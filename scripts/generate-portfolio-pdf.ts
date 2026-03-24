import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const logoPath = path.resolve("attached_assets/SST-Colombia-logo-3_1768408022586.png");
const outputPath = path.resolve("Portafolio_SST_Colombia_Alpina.pdf");

const GREEN = "#1e7e34";
const DARK_GREEN = "#155724";
const LIGHT_GREEN = "#d4edda";
const GRAY = "#6c757d";
const DARK = "#212529";
const WHITE = "#ffffff";
const LIGHT_BG = "#f8f9fa";

function drawHeader(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, doc.page.width, 120).fill(DARK_GREEN);

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 15, { height: 90 });
  }

  doc.fillColor(WHITE)
    .font("Helvetica-Bold").fontSize(22)
    .text("PORTAFOLIO DE SERVICIOS", 200, 30, { width: 370, align: "right" });

  doc.font("Helvetica").fontSize(11)
    .text("Sistema de Gestion de Seguridad y", 200, 58, { width: 370, align: "right" })
    .text("Salud en el Trabajo - SG-SST", 200, 73, { width: 370, align: "right" });

  doc.fontSize(9).fillColor("#a8d5a2")
    .text("SADGI S.A.S. | NIT 902.036.337-4", 200, 95, { width: 370, align: "right" });
}

function drawFooter(doc: PDFKit.PDFDocument, pageNum: number) {
  const y = doc.page.height - 40;
  doc.rect(0, y - 5, doc.page.width, 45).fill(DARK_GREEN);
  doc.fillColor("#a8d5a2").font("Helvetica").fontSize(8)
    .text("SADGI S.A.S. | NIT 902.036.337-4 | soporte@sst-colombia.com | sst.sagisas.co", 40, y + 5, { width: 450 })
    .text(`${pageNum}`, 40, y + 5, { width: doc.page.width - 80, align: "right" });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string, y: number): number {
  doc.rect(40, y, doc.page.width - 80, 32).fill(GREEN);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(13)
    .text(title.toUpperCase(), 55, y + 9, { width: doc.page.width - 110 });
  return y + 45;
}

function bulletItem(doc: PDFKit.PDFDocument, text: string, y: number, indent = 55): number {
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(10)
    .text("\u2714", indent - 15, y);
  doc.fillColor(DARK).font("Helvetica").fontSize(10)
    .text(text, indent, y, { width: doc.page.width - indent - 55 });
  const lines = Math.ceil(doc.widthOfString(text, { width: doc.page.width - indent - 55 }) / (doc.page.width - indent - 55));
  return y + Math.max(16, lines * 14) + 2;
}

function checkPageBreak(doc: PDFKit.PDFDocument, y: number, needed: number, pageNum: { val: number }): number {
  if (y + needed > doc.page.height - 60) {
    drawFooter(doc, pageNum.val);
    pageNum.val++;
    doc.addPage();
    drawHeader(doc);
    return 140;
  }
  return y;
}

async function generatePortfolio() {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 50, bottom: 50, left: 40, right: 40 } });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const pageNum = { val: 1 };

  // PAGE 1: Cover
  drawHeader(doc);
  let y = 145;

  // Personalized for Alpina
  doc.rect(40, y, doc.page.width - 80, 55).fill(LIGHT_GREEN);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(14)
    .text("Propuesta Comercial Personalizada", 55, y + 10);
  doc.fillColor(DARK).font("Helvetica").fontSize(12)
    .text("Preparada para: Alpina Colombia (alpina.com)", 55, y + 30);
  y += 70;

  // Intro
  doc.fillColor(DARK).font("Helvetica").fontSize(10.5)
    .text("SST-Colombia es una plataforma tecnologica integral para la gestion de Seguridad y Salud en el Trabajo, disenada para cumplir con la normatividad colombiana vigente. Automatizamos el ciclo PHVA completo, permitiendo a las empresas alcanzar el cumplimiento normativo de manera eficiente, trazable y sin depender de procesos manuales.", 40, y, { width: doc.page.width - 80, align: "justify", lineGap: 3 });
  y += 75;

  // WHY SST-COLOMBIA
  y = sectionTitle(doc, "Por que SST-Colombia para Alpina?", y);

  const whyItems = [
    "Plataforma 100% en la nube, accesible desde cualquier sede o planta de Alpina a nivel nacional",
    "Cumplimiento automatizado de la Resolucion 0312/2019 con los 61 estandares minimos",
    "Gestion centralizada de multiples sedes con un solo sistema y vision consolidada",
    "Modulo PESV completo para la flota vehicular de distribucion (Resolucion 40595/2022)",
    "Portal de empleados para que cada trabajador acceda a su informacion SST",
    "Portal de profesional SST licenciado con firma digital de documentos obligatorios",
    "Asistente de Inteligencia Artificial especializado en normativa colombiana",
    "Generacion automatica de informes para el Ministerio de Trabajo",
    "Trazabilidad completa: cada documento, accion y evaluacion queda registrada",
  ];

  for (const item of whyItems) {
    y = checkPageBreak(doc, y, 20, pageNum);
    y = bulletItem(doc, item, y);
  }

  y += 10;

  // MODULES
  y = checkPageBreak(doc, y, 250, pageNum);
  y = sectionTitle(doc, "Modulos del Sistema", y);

  const modules = [
    { name: "PLANEAR", items: [
      "Evaluacion Inicial SG-SST (Resolucion 0312/2019)",
      "Matriz de Identificacion de Peligros y Riesgos (IPERC - GTC-45)",
      "Matriz Legal actualizada",
      "Planes de Trabajo Anual con seguimiento automatico",
      "Designacion de responsable SST y recursos",
      "Politica y objetivos SST con indicadores vinculados",
    ]},
    { name: "HACER", items: [
      "Gestion de trabajadores, contratos y perfiles de cargo",
      "Capacitaciones con 50+ temas predefinidos y seguimiento",
      "Examenes medicos ocupacionales con alertas de vencimiento",
      "Inspecciones de seguridad con listas de verificacion",
      "Entrega y control de EPP (77 elementos catalogados)",
      "Gestion de sustancias quimicas con fichas de seguridad",
      "Plan de emergencias con brigadas y simulacros",
      "Programa de conservacion auditiva (PCA)",
      "Investigacion de accidentes e incidentes con analisis de causas",
    ]},
    { name: "VERIFICAR", items: [
      "Indicadores SST automaticos (estructura, proceso, resultado)",
      "Auditorias internas con hallazgos clasificados por severidad",
      "Revision por la alta direccion",
      "Seguimiento de indicadores de accidentalidad",
    ]},
    { name: "ACTUAR", items: [
      "Acciones correctivas, preventivas y de mejora",
      "Seguimiento de efectividad de acciones",
      "Recomendaciones ARL con trazabilidad",
      "Informe de gestion para el Ministerio de Trabajo",
    ]},
  ];

  const phvaColors: Record<string, string> = {
    PLANEAR: "#2563eb",
    HACER: "#16a34a",
    VERIFICAR: "#7c3aed",
    ACTUAR: "#d97706",
  };

  for (const mod of modules) {
    y = checkPageBreak(doc, y, 30 + mod.items.length * 18, pageNum);

    doc.rect(40, y, doc.page.width - 80, 24).fill(phvaColors[mod.name] || GREEN);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(11)
      .text(mod.name, 55, y + 6);
    y += 32;

    for (const item of mod.items) {
      y = checkPageBreak(doc, y, 18, pageNum);
      y = bulletItem(doc, item, y, 65);
    }
    y += 8;
  }

  // PESV MODULE
  y = checkPageBreak(doc, y, 150, pageNum);
  y = sectionTitle(doc, "Modulo PESV - Plan Estrategico de Seguridad Vial", y);

  doc.fillColor(DARK).font("Helvetica").fontSize(10)
    .text("Ideal para la flota de distribucion de Alpina. Cumple con la Resolucion 40595/2022 y el Decreto 1252/2021.", 55, y, { width: doc.page.width - 110, lineGap: 2 });
  y += 30;

  const pesvItems = [
    "24 pasos de implementacion segun metodologia vigente",
    "Tres niveles de complejidad: Basico, Estandar y Avanzado",
    "Gestion de flota vehicular: SOAT, revision tecnico-mecanica, seguros",
    "Base de datos de conductores con verificacion de licencias",
    "Inspecciones preoperacionales diarias",
    "Mantenimiento preventivo y correctivo de vehiculos",
    "Matriz de riesgos viales con metodologia ISO 31000:2018",
    "12+ indicadores de desempeno de seguridad vial (SPI)",
    "Generacion de informes PDF para auditorias y Ministerio de Transporte",
    "Trazabilidad bidireccional con el SG-SST",
  ];

  for (const item of pesvItems) {
    y = checkPageBreak(doc, y, 18, pageNum);
    y = bulletItem(doc, item, y);
  }

  // PORTALS
  y += 10;
  y = checkPageBreak(doc, y, 120, pageNum);
  y = sectionTitle(doc, "Portales Integrados", y);

  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(10.5)
    .text("Portal de Empleados", 55, y);
  y += 16;
  const portalEmpItems = [
    "Acceso individual para cada trabajador de Alpina",
    "Consulta de contrato, perfil de cargo y capacitaciones",
    "Reportes de condiciones y actos inseguros",
    "Participacion en elecciones COPASST y Convivencia",
    "Historial de examenes medicos y EPP entregados",
  ];
  for (const item of portalEmpItems) {
    y = checkPageBreak(doc, y, 18, pageNum);
    y = bulletItem(doc, item, y, 65);
  }

  y += 8;
  y = checkPageBreak(doc, y, 100, pageNum);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(10.5)
    .text("Portal de Profesional SST Licenciado", 55, y);
  y += 16;
  const portalLsoItems = [
    "Gestion de multiples empresas desde un solo portal",
    "Firma digital obligatoria en 5 tipos de documentos",
    "Dashboard de cumplimiento por empresa asignada",
    "Sistema de tickets de soporte tecnico",
    "Boveda de documentos por empresa",
  ];
  for (const item of portalLsoItems) {
    y = checkPageBreak(doc, y, 18, pageNum);
    y = bulletItem(doc, item, y, 65);
  }

  // AI
  y += 10;
  y = checkPageBreak(doc, y, 120, pageNum);
  y = sectionTitle(doc, "Inteligencia Artificial Aplicada", y);

  const aiItems = [
    "Chatbot especializado en normativa SST colombiana (Decreto 1072/2015, Res. 0312/2019)",
    "Asistente inteligente GTC-45 que auto-completa matrices de riesgo",
    "Sugerencias automaticas de peligros segun actividad economica (codigo CIIU)",
    "Motor de acciones correctivas: sugiere medidas basadas en causas identificadas",
    "Auto-llenado inteligente de formularios basado en normativa vigente",
    "Catalogo de 1.300+ medidas preventivas categorizadas por prioridad",
  ];
  for (const item of aiItems) {
    y = checkPageBreak(doc, y, 18, pageNum);
    y = bulletItem(doc, item, y);
  }

  // PILOT STRATEGY
  y += 10;
  y = checkPageBreak(doc, y, 200, pageNum);
  y = sectionTitle(doc, "Piloto Tecnico de Implementacion - 9 Semanas", y);

  doc.rect(40, y, doc.page.width - 80, 45).fill(LIGHT_GREEN);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(10.5)
    .text("Sin costo inicial. El objetivo es que Alpina alcance entre un 60% y 75%", 55, y + 8, { width: doc.page.width - 110 })
    .text("de cumplimiento normativo automatizado en un solo trimestre.", 55, y + 23, { width: doc.page.width - 110 });
  y += 58;

  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10).text("Semanas 1-3: Configuracion y Diagnostico", 55, y);
  y += 16;
  const s1Items = [
    "Registro de la empresa, sedes y estructura organizacional",
    "Carga masiva de trabajadores via Excel",
    "Evaluacion inicial SG-SST automatizada",
    "Identificacion del capitulo aplicable (I, II o III)",
  ];
  for (const item of s1Items) { y = checkPageBreak(doc, y, 18, pageNum); y = bulletItem(doc, item, y, 70); }

  y += 6;
  y = checkPageBreak(doc, y, 80, pageNum);
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10).text("Semanas 4-6: Implementacion del HACER", 55, y);
  y += 16;
  const s2Items = [
    "Construccion de la matriz IPERC (GTC-45) con asistente inteligente",
    "Programacion de capacitaciones y examenes medicos",
    "Configuracion del PESV para flota vehicular",
    "Activacion del portal de empleados",
  ];
  for (const item of s2Items) { y = checkPageBreak(doc, y, 18, pageNum); y = bulletItem(doc, item, y, 70); }

  y += 6;
  y = checkPageBreak(doc, y, 80, pageNum);
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10).text("Semanas 7-9: Verificacion y Entrega", 55, y);
  y += 16;
  const s3Items = [
    "Revision de indicadores y dashboards PHVA",
    "Generacion del informe SG-SST para el Ministerio de Trabajo",
    "Evaluacion de cumplimiento final con porcentaje alcanzado",
    "Presentacion de resultados y propuesta de continuidad",
  ];
  for (const item of s3Items) { y = checkPageBreak(doc, y, 18, pageNum); y = bulletItem(doc, item, y, 70); }

  // SUSTAINABILITY
  y += 10;
  y = checkPageBreak(doc, y, 80, pageNum);
  doc.rect(40, y, doc.page.width - 80, 60).fill(LIGHT_BG);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(10.5)
    .text("Sostenibilidad del modelo:", 55, y + 8);
  doc.fillColor(DARK).font("Helvetica").fontSize(10)
    .text("Durante las 9 semanas, Alpina cumple con la ley sin inversion previa a la herramienta. Al verificar la eficiencia y la facilidad de \"HACER\" con nuestra tecnologia, la transicion a la suscripcion se convierte en el paso natural para mantener su estatus legal y su productividad de forma permanente.", 55, y + 24, { width: doc.page.width - 110, lineGap: 2 });
  y += 75;

  // PRICING REFERENCE
  y = checkPageBreak(doc, y, 160, pageNum);
  y = sectionTitle(doc, "Planes de Suscripcion (Posterior al Piloto)", y);

  const plans = [
    { name: "Esencial", price: "$199.000", workers: "1-10", highlight: false },
    { name: "Profesional", price: "$499.000", workers: "11-50", highlight: false },
    { name: "Empresarial", price: "$999.000", workers: "51-200", highlight: true },
    { name: "Corporativo", price: "$1.999.000", workers: "Ilimitado", highlight: false },
  ];

  // Table header
  doc.rect(40, y, doc.page.width - 80, 22).fill(DARK_GREEN);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9);
  doc.text("Plan", 55, y + 6, { width: 140 });
  doc.text("Precio Mensual (COP)", 200, y + 6, { width: 150 });
  doc.text("Trabajadores", 370, y + 6, { width: 140 });
  y += 22;

  for (const plan of plans) {
    const bg = plan.highlight ? LIGHT_GREEN : WHITE;
    doc.rect(40, y, doc.page.width - 80, 22).fill(bg);
    doc.fillColor(DARK).font(plan.highlight ? "Helvetica-Bold" : "Helvetica").fontSize(9);
    doc.text(plan.name + (plan.highlight ? " (Recomendado)" : ""), 55, y + 6, { width: 140 });
    doc.text(plan.price + "/mes", 200, y + 6, { width: 150 });
    doc.text(plan.workers, 370, y + 6, { width: 140 });
    y += 22;
  }

  y += 8;
  doc.fillColor(GRAY).font("Helvetica").fontSize(8.5)
    .text("Todos los planes incluyen actualizaciones normativas, soporte tecnico y almacenamiento en la nube.", 55, y, { width: doc.page.width - 110 })
    .text("Descuento del 16.7% en plan anual (pague 10 meses, obtenga 12).", 55, y + 12, { width: doc.page.width - 110 });

  // DIFFERENTIATORS
  y += 35;
  y = checkPageBreak(doc, y, 130, pageNum);
  y = sectionTitle(doc, "Diferenciadores Clave", y);

  const diffItems = [
    "100% alineado con normativa colombiana: Decreto 1072/2015, Res. 0312/2019, Res. 40595/2022",
    "Certificable bajo ISO 45001:2018 - reportes con estandar internacional",
    "Multi-sede: gestion centralizada de todas las plantas de Alpina",
    "Cifrado AES-256-GCM para proteccion de datos sensibles de trabajadores",
    "Infraestructura AWS con 99.9% de disponibilidad",
    "Soporte tecnico dedicado con tiempos de respuesta garantizados",
    "Sin instalacion: acceso inmediato desde navegador web",
  ];

  for (const item of diffItems) {
    y = checkPageBreak(doc, y, 18, pageNum);
    y = bulletItem(doc, item, y);
  }

  // CONTACT
  y += 15;
  y = checkPageBreak(doc, y, 100, pageNum);
  doc.rect(40, y, doc.page.width - 80, 70).fill(DARK_GREEN);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(13)
    .text("Contacto", 55, y + 12);
  doc.font("Helvetica").fontSize(10)
    .text("Plataforma: sst.sagisas.co", 55, y + 32)
    .text("Correo: soporte@sst-colombia.com", 55, y + 47);

  drawFooter(doc, pageNum.val);
  doc.end();

  return new Promise<void>((resolve) => {
    stream.on("finish", () => {
      console.log(`PDF generado: ${outputPath}`);
      const stats = fs.statSync(outputPath);
      console.log(`Tamano: ${(stats.size / 1024).toFixed(0)} KB`);
      resolve();
    });
  });
}

generatePortfolio().catch(console.error);
