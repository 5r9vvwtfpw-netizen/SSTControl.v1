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

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 35;
const MAX_Y = FOOTER_Y - 15;

let currentPage = 1;

function drawPageFooter(doc: PDFKit.PDFDocument) {
  doc.save();
  doc.rect(0, FOOTER_Y - 5, PAGE_W, 40).fill(DARK_GREEN);
  doc.fillColor("#a8d5a2").font("Helvetica").fontSize(7)
    .text("SADGI S.A.S. | NIT 902.036.337-4 | soporte@sst-colombia.com | sst.sagisas.co", MARGIN, FOOTER_Y + 3, { width: CONTENT_W - 40 })
    .text(`${currentPage}`, MARGIN, FOOTER_Y + 3, { width: CONTENT_W, align: "right" });
  doc.restore();
}

function newPage(doc: PDFKit.PDFDocument): number {
  drawPageFooter(doc);
  currentPage++;
  doc.addPage();
  return MARGIN;
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, needed: number): number {
  if (y + needed > MAX_Y) return newPage(doc);
  return y;
}

function sectionBar(doc: PDFKit.PDFDocument, y: number, title: string, color = GREEN): number {
  y = ensureSpace(doc, y, 28);
  doc.save();
  doc.rect(MARGIN, y, CONTENT_W, 22).fill(color);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(11)
    .text(title.toUpperCase(), MARGIN + 12, y + 5, { width: CONTENT_W - 24 });
  doc.restore();
  return y + 28;
}

function bullet(doc: PDFKit.PDFDocument, y: number, text: string, indent = 52): number {
  y = ensureSpace(doc, y, 14);
  const textW = PAGE_W - indent - MARGIN;
  doc.save();
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(9).text("\u2714", indent - 12, y);
  doc.fillColor(DARK).font("Helvetica").fontSize(9);
  const h = doc.heightOfString(text, { width: textW });
  doc.text(text, indent, y, { width: textW });
  doc.restore();
  return y + h + 3;
}

function labeledBullets(doc: PDFKit.PDFDocument, y: number, label: string, items: string[], labelColor = DARK_GREEN): number {
  y = ensureSpace(doc, y, 16);
  doc.fillColor(labelColor).font("Helvetica-Bold").fontSize(9.5).text(label, MARGIN + 12, y, { width: CONTENT_W - 24 });
  y += 15;
  for (const item of items) {
    y = bullet(doc, y, item, 60);
  }
  return y + 4;
}

async function generatePortfolio() {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN }, autoFirstPage: true });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // ── PAGE 1: COVER ──
  doc.rect(0, 0, PAGE_W, 100).fill(DARK_GREEN);
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN, 8, { height: 82 });
  }
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(20)
    .text("PORTAFOLIO DE SERVICIOS", 220, 22, { width: 350, align: "right" });
  doc.font("Helvetica").fontSize(10)
    .text("Sistema de Gestion de Seguridad y Salud en el Trabajo", 220, 48, { width: 350, align: "right" });
  doc.fontSize(8).fillColor("#a8d5a2")
    .text("SADGI S.A.S. | NIT 902.036.337-4", 220, 72, { width: 350, align: "right" });

  let y = 115;

  // Client banner
  doc.rect(MARGIN, y, CONTENT_W, 35).fill(LIGHT_GREEN);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(12)
    .text("Propuesta Comercial para: Alpina Colombia", MARGIN + 12, y + 10, { width: CONTENT_W - 24 });
  y += 45;

  // Intro
  doc.fillColor(DARK).font("Helvetica").fontSize(9.5)
    .text("SST-Colombia es una plataforma tecnologica integral para la gestion de Seguridad y Salud en el Trabajo, disenada para cumplir con la normatividad colombiana vigente. Automatizamos el ciclo PHVA completo, permitiendo a las empresas alcanzar el cumplimiento normativo de manera eficiente, trazable y sin procesos manuales.", MARGIN, y, { width: CONTENT_W, align: "justify", lineGap: 2 });
  y += 55;

  // Why Alpina
  y = sectionBar(doc, y, "Por que SST-Colombia para Alpina?");
  const whyItems = [
    "Plataforma 100% en la nube, accesible desde cualquier sede o planta a nivel nacional",
    "Cumplimiento automatizado de la Resolucion 0312/2019 con los 61 estandares minimos",
    "Gestion centralizada de multiples sedes con vision consolidada",
    "Modulo PESV completo para flota vehicular de distribucion (Res. 40595/2022)",
    "Portal de empleados y portal de profesional SST con firma digital",
    "Asistente de IA especializado en normativa colombiana SST",
    "Generacion automatica de informes para el Ministerio de Trabajo",
    "Cifrado AES-256-GCM | Infraestructura AWS | 99.9% disponibilidad",
  ];
  for (const item of whyItems) y = bullet(doc, y, item);

  // PHVA Modules
  y += 6;
  y = sectionBar(doc, y, "Modulos del Sistema - Ciclo PHVA Automatizado");

  const phvaColors: Record<string, string> = { PLANEAR: "#2563eb", HACER: "#16a34a", VERIFICAR: "#7c3aed", ACTUAR: "#d97706" };
  const modules = [
    { name: "PLANEAR", items: [
      "Evaluacion Inicial SG-SST (Res. 0312/2019) | Matriz IPERC GTC-45 | Matriz Legal",
      "Planes de Trabajo Anual | Designacion de responsable SST | Politica y objetivos SST",
    ]},
    { name: "HACER", items: [
      "Trabajadores, contratos y perfiles de cargo | 50+ temas de capacitacion",
      "Examenes medicos con alertas | Inspecciones de seguridad | Control de EPP (77 elementos)",
      "Sustancias quimicas | Plan de emergencias | Conservacion auditiva | Investigacion de accidentes",
    ]},
    { name: "VERIFICAR", items: [
      "Indicadores SST automaticos (estructura, proceso, resultado) | Auditorias internas",
      "Revision por alta direccion | Seguimiento de accidentalidad",
    ]},
    { name: "ACTUAR", items: [
      "Acciones correctivas, preventivas y de mejora | Seguimiento de efectividad",
      "Recomendaciones ARL | Informe de gestion para Ministerio de Trabajo",
    ]},
  ];

  for (const mod of modules) {
    y = ensureSpace(doc, y, 20);
    doc.save();
    doc.rect(MARGIN + 5, y, CONTENT_W - 10, 17).fill(phvaColors[mod.name]);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9).text(mod.name, MARGIN + 15, y + 4);
    doc.restore();
    y += 21;
    for (const item of mod.items) y = bullet(doc, y, item, 60);
    y += 2;
  }

  // PESV
  y += 4;
  y = sectionBar(doc, y, "Modulo PESV - Seguridad Vial (Res. 40595/2022)");
  doc.fillColor(DARK).font("Helvetica").fontSize(9)
    .text("Ideal para la flota de distribucion de Alpina. Cumple Resolucion 40595/2022 y Decreto 1252/2021.", MARGIN + 12, y, { width: CONTENT_W - 24 });
  y += 16;
  const pesvItems = [
    "24 pasos de implementacion | Niveles Basico, Estandar y Avanzado",
    "Flota vehicular: SOAT, revision tecnico-mecanica, seguros, mantenimiento",
    "Base de datos de conductores | Inspecciones preoperacionales diarias",
    "Matriz de riesgos viales ISO 31000 | 12+ indicadores SPI",
    "Informes PDF para auditorias y Ministerio de Transporte",
  ];
  for (const item of pesvItems) y = bullet(doc, y, item);

  // Portals
  y += 4;
  y = sectionBar(doc, y, "Portales Integrados");
  y = labeledBullets(doc, y, "Portal de Empleados", [
    "Acceso individual por trabajador: contrato, perfil, capacitaciones, EPP",
    "Reportes de condiciones inseguras | Elecciones COPASST y Convivencia",
  ]);
  y = labeledBullets(doc, y, "Portal de Profesional SST Licenciado", [
    "Gestion multi-empresa | Firma digital en 5 tipos de documentos obligatorios",
    "Dashboard de cumplimiento | Boveda de documentos | Soporte tecnico",
  ]);

  // AI
  y += 2;
  y = sectionBar(doc, y, "Inteligencia Artificial Aplicada");
  const aiItems = [
    "Chatbot especializado en normativa SST colombiana (Decreto 1072, Res. 0312)",
    "Asistente GTC-45 auto-completa matrices | Sugerencias por codigo CIIU",
    "Motor de acciones correctivas automaticas | 1.300+ medidas preventivas catalogadas",
  ];
  for (const item of aiItems) y = bullet(doc, y, item);

  // ── PILOT STRATEGY ──
  y += 6;
  y = sectionBar(doc, y, "Piloto Tecnico de Implementacion - 9 Semanas");

  y = ensureSpace(doc, y, 35);
  doc.rect(MARGIN, y, CONTENT_W, 28).fill(LIGHT_GREEN);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(9.5)
    .text("Sin costo inicial. El objetivo es que Alpina alcance entre 60% y 75% de cumplimiento normativo automatizado en un solo trimestre.", MARGIN + 12, y + 8, { width: CONTENT_W - 24 });
  y += 38;

  y = labeledBullets(doc, y, "Semanas 1-3: Configuracion y Diagnostico", [
    "Registro de empresa y sedes | Carga masiva de trabajadores | Evaluacion inicial",
  ]);
  y = labeledBullets(doc, y, "Semanas 4-6: Implementacion del HACER", [
    "Matriz IPERC con asistente IA | Capacitaciones y examenes | PESV flota | Portal empleados",
  ]);
  y = labeledBullets(doc, y, "Semanas 7-9: Verificacion y Entrega", [
    "Indicadores y dashboards PHVA | Informe Ministerio | Evaluacion final | Propuesta de continuidad",
  ]);

  // Sustainability
  y = ensureSpace(doc, y, 45);
  doc.rect(MARGIN, y, CONTENT_W, 38).fill(LIGHT_BG);
  doc.fillColor(DARK_GREEN).font("Helvetica-Bold").fontSize(9).text("Sostenibilidad:", MARGIN + 10, y + 5);
  doc.fillColor(DARK).font("Helvetica").fontSize(8.5)
    .text("Durante las 9 semanas, Alpina cumple con la ley sin inversion previa. Al verificar la eficiencia, la transicion a la suscripcion es el paso natural para mantener el cumplimiento permanente.", MARGIN + 10, y + 17, { width: CONTENT_W - 20, lineGap: 1 });
  y += 48;

  // ── PRICING ──
  y = sectionBar(doc, y, "Planes de Suscripcion (Posterior al Piloto)");

  const colW = [160, 130, 100, 140];
  const colX = [MARGIN + 2, MARGIN + 162, MARGIN + 292, MARGIN + 392];

  y = ensureSpace(doc, y, 18);
  doc.rect(MARGIN, y, CONTENT_W, 16).fill(DARK_GREEN);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
  doc.text("Plan", colX[0], y + 4, { width: colW[0] });
  doc.text("Precio/mes (COP)", colX[1], y + 4, { width: colW[1] });
  doc.text("Trabajadores", colX[2], y + 4, { width: colW[2] });
  doc.text("Destacado", colX[3], y + 4, { width: colW[3] });
  y += 16;

  const plans = [
    { n: "Esencial", p: "$199.000", w: "1-10", d: "Ideal para microempresas" },
    { n: "Profesional", p: "$499.000", w: "11-50", d: "El mas popular" },
    { n: "Empresarial", p: "$999.000", w: "51-200", d: "Recomendado para Alpina" },
    { n: "Corporativo", p: "$1.999.000", w: "Ilimitado", d: "SLA 99.9% + dedicado" },
  ];

  for (let i = 0; i < plans.length; i++) {
    const pl = plans[i];
    const bg = i === 2 ? LIGHT_GREEN : (i % 2 === 0 ? WHITE : LIGHT_BG);
    const fnt = i === 2 ? "Helvetica-Bold" : "Helvetica";
    doc.rect(MARGIN, y, CONTENT_W, 15).fill(bg);
    doc.fillColor(DARK).font(fnt).fontSize(8);
    doc.text(pl.n, colX[0], y + 3, { width: colW[0] });
    doc.text(pl.p, colX[1], y + 3, { width: colW[1] });
    doc.text(pl.w, colX[2], y + 3, { width: colW[2] });
    doc.text(pl.d, colX[3], y + 3, { width: colW[3] });
    y += 15;
  }

  y += 6;
  doc.fillColor(GRAY).font("Helvetica").fontSize(7.5)
    .text("Descuento 16.7% en plan anual (pague 10 meses). Incluye actualizaciones normativas y soporte.", MARGIN, y, { width: CONTENT_W });
  y += 18;

  // Contact
  y = ensureSpace(doc, y, 50);
  doc.rect(MARGIN, y, CONTENT_W, 45).fill(DARK_GREEN);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(12)
    .text("Contactenos", MARGIN + 15, y + 8);
  doc.font("Helvetica").fontSize(9.5)
    .text("sst.sagisas.co  |  soporte@sst-colombia.com", MARGIN + 15, y + 26);

  drawPageFooter(doc);
  doc.end();

  return new Promise<void>((resolve) => {
    stream.on("finish", () => {
      const stats = fs.statSync(outputPath);
      console.log(`PDF generado: ${outputPath} (${(stats.size / 1024).toFixed(0)} KB, ${currentPage} paginas)`);
      resolve();
    });
  });
}

generatePortfolio().catch(console.error);
