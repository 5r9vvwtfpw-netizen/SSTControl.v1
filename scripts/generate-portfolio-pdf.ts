import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const logoPath = path.resolve("attached_assets/SST-Colombia-logo-3_1768408022586.png");
const outputPath = path.resolve("Portafolio_SST_Colombia_Alpina.pdf");

const GREEN = "#1e7e34";
const DK = "#155724";
const LG = "#d4edda";
const GY = "#6c757d";
const BK = "#212529";
const WH = "#ffffff";
const BG = "#f8f9fa";

const W = 612, H = 792, M = 40, CW = W - M * 2;

async function gen() {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: M, bottom: M, left: M, right: M },
    bufferPages: true,
    autoFirstPage: true
  });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  let y = 0;

  function footer(pg: number) {
    doc.save();
    doc.rect(0, H - 30, W, 30).fill(DK);
    doc.fillColor("#a8d5a2").font("Helvetica").fontSize(7)
      .text("SADGI S.A.S. | NIT 902.036.337-4 | admin@sst-colombia.com | sst.sagisas.co", M, H - 22, { width: CW - 30, lineBreak: false })
      .text(`${pg}`, M, H - 22, { width: CW, align: "right", lineBreak: false });
    doc.restore();
  }

  function np(): number {
    doc.addPage({ size: "LETTER", margins: { top: M, bottom: M, left: M, right: M } });
    return M;
  }

  function ck(needed: number): void {
    if (y + needed > H - 45) { y = np(); }
  }

  function bar(title: string, c = GREEN) {
    ck(24);
    doc.save().rect(M, y, CW, 20).fill(c);
    doc.fillColor(WH).font("Helvetica-Bold").fontSize(10)
      .text(title, M + 10, y + 5, { width: CW - 20, lineBreak: false });
    doc.restore();
    y += 24;
  }

  function bul(txt: string, ind = 52) {
    ck(13);
    const tw = W - ind - M;
    doc.save();
    doc.fillColor(GREEN).font("ZapfDingbats").fontSize(8).text("\u2714", ind - 11, y + 1, { lineBreak: false });
    doc.fillColor(BK).font("Helvetica").fontSize(8.5);
    const h = doc.heightOfString(txt, { width: tw });
    doc.text(txt, ind, y, { width: tw });
    doc.restore();
    y += Math.max(h + 2, 12);
  }

  function sub(label: string) {
    ck(14);
    doc.save().fillColor(DK).font("Helvetica-Bold").fontSize(9)
      .text(label, M + 10, y, { width: CW - 20, lineBreak: false });
    doc.restore();
    y += 13;
  }

  function txt(t: string, sz = 8.5, font = "Helvetica", color = BK, opts: any = {}) {
    doc.save().fillColor(color).font(font).fontSize(sz);
    const h = doc.heightOfString(t, { width: opts.width || CW, ...opts });
    ck(h + 2);
    doc.fillColor(color).font(font).fontSize(sz)
      .text(t, opts.x || M, y, { width: opts.width || CW, ...opts });
    doc.restore();
    y += h + 2;
  }

  // ═══ PAGE 1 ═══
  doc.rect(0, 0, W, 85).fill(DK);
  if (fs.existsSync(logoPath)) doc.image(logoPath, M, 5, { height: 72 });
  doc.fillColor(WH).font("Helvetica-Bold").fontSize(18)
    .text("PORTAFOLIO DE SERVICIOS", 200, 18, { width: 370, align: "right", lineBreak: false });
  doc.font("Helvetica").fontSize(9)
    .text("Sistema de Gestion de Seguridad y Salud en el Trabajo", 200, 40, { width: 370, align: "right", lineBreak: false });
  doc.fontSize(7.5).fillColor("#a8d5a2")
    .text("SADGI S.A.S. | NIT 902.036.337-4", 200, 58, { width: 370, align: "right", lineBreak: false });

  y = 95;

  doc.save().rect(M, y, CW, 25).fill(LG);
  doc.fillColor(DK).font("Helvetica-Bold").fontSize(11)
    .text("Propuesta Comercial para: Alpina Colombia", M + 10, y + 7, { width: CW - 20, lineBreak: false });
  doc.restore();
  y += 32;

  txt("SST-Colombia es una plataforma tecnologica integral que automatiza el ciclo PHVA completo para la gestion de Seguridad y Salud en el Trabajo, cumpliendo con toda la normatividad colombiana vigente.", 9, "Helvetica", BK, { align: "justify", lineGap: 1 });
  y += 4;

  bar("Por que SST-Colombia para Alpina?");
  for (const t of [
    "Plataforma 100% en la nube, accesible desde cualquier sede o planta a nivel nacional",
    "Cumplimiento automatizado de la Resolucion 0312/2019 con los 61 estandares minimos",
    "Gestion centralizada de multiples sedes con vision consolidada",
    "Modulo PESV completo para flota vehicular (Resolucion 40595/2022)",
    "Portal de empleados y portal de profesional SST con firma digital",
    "Asistente de IA especializado en normativa SST colombiana",
    "Informes automaticos para Ministerio de Trabajo | Cifrado AES-256 | AWS 99.9%",
  ]) bul(t);
  y += 3;

  bar("Ciclo PHVA Automatizado");
  const phva: [string, string, string[]][] = [
    ["PLANEAR", "#2563eb", ["Evaluacion Inicial (Res. 0312) | Matriz IPERC GTC-45 | Matriz Legal | Plan de Trabajo Anual"]],
    ["HACER", "#16a34a", ["Trabajadores y contratos | 50+ capacitaciones | Examenes medicos | Inspecciones | EPP (77 items) | Sustancias quimicas | Plan emergencias | Investigacion accidentes"]],
    ["VERIFICAR", "#7c3aed", ["Indicadores SST automaticos | Auditorias internas | Revision alta direccion | Accidentalidad"]],
    ["ACTUAR", "#d97706", ["Acciones correctivas/preventivas | Efectividad | Recomendaciones ARL | Informe Ministerio"]],
  ];
  for (const [nm, cl, items] of phva) {
    ck(15);
    doc.save().rect(M + 4, y, CW - 8, 14).fill(cl);
    doc.fillColor(WH).font("Helvetica-Bold").fontSize(8).text(nm, M + 12, y + 3, { lineBreak: false });
    doc.restore();
    y += 17;
    for (const it of items) bul(it, 58);
  }
  y += 3;

  bar("PESV - Seguridad Vial (Res. 40595/2022)");
  for (const t of [
    "24 pasos | Niveles Basico, Estandar y Avanzado | Flota: SOAT, RTM, seguros, mantenimiento",
    "Conductores con verificacion de licencias | Inspecciones preoperacionales | Riesgos viales ISO 31000",
    "12+ indicadores SPI | Informes PDF para auditorias y Ministerio de Transporte",
  ]) bul(t);
  y += 3;

  bar("Portales Integrados (Incluidos sin costo adicional)");
  sub("Portal de Empleados - GRATIS");
  bul("Acceso individual ilimitado para cada trabajador, sin costo adicional por usuario", 58);
  bul("Contrato, perfil de cargo, capacitaciones, EPP, reportes de seguridad, elecciones COPASST", 58);
  sub("Portal Profesional SST (LSO) - GRATIS");
  bul("Acceso gratuito para el profesional licenciado en salud ocupacional asignado", 58);
  bul("Multi-empresa | Firma digital 5 documentos | Dashboard cumplimiento | Boveda documentos", 58);
  y += 3;

  bar("Inteligencia Artificial");
  bul("Chatbot normativo SST | Asistente GTC-45 | Sugerencias por CIIU | 1.300+ medidas preventivas");
  y += 5;

  // ═══ PILOT ═══
  bar("Piloto Tecnico de Implementacion - 9 Semanas", DK);
  ck(28);
  doc.save().rect(M, y, CW, 22).fill(LG);
  doc.fillColor(DK).font("Helvetica-Bold").fontSize(8.5)
    .text("Sin costo inicial. Objetivo: 60%-75% de cumplimiento normativo automatizado en un trimestre.", M + 10, y + 6, { width: CW - 20 });
  doc.restore();
  y += 28;

  sub("Semanas 1-3: Configuracion");
  bul("Registro empresa/sedes | Carga masiva trabajadores | Evaluacion inicial SG-SST", 58);
  sub("Semanas 4-6: Implementacion");
  bul("Matriz IPERC con IA | Capacitaciones | Examenes | PESV flota | Portal empleados", 58);
  sub("Semanas 7-9: Verificacion");
  bul("Dashboards PHVA | Informe Ministerio | Evaluacion final | Propuesta de continuidad", 58);
  y += 3;

  ck(32);
  doc.save().rect(M, y, CW, 28).fill(BG);
  doc.fillColor(DK).font("Helvetica").fontSize(8)
    .text("Sostenibilidad: Durante las 9 semanas Alpina cumple sin inversion previa. La transicion a suscripcion es el paso natural para mantener el cumplimiento permanente.", M + 10, y + 5, { width: CW - 20, lineGap: 1 });
  doc.restore();
  y += 35;

  // ═══ PRICING ═══
  bar("Planes de Suscripcion");
  ck(80);
  const cx = [M, M + 130, M + 260, M + 360];
  const cw = [128, 128, 98, CW - 360];

  doc.save().rect(M, y, CW, 14).fill(DK);
  doc.fillColor(WH).font("Helvetica-Bold").fontSize(7.5);
  doc.text("Plan", cx[0] + 6, y + 3, { width: cw[0], lineBreak: false });
  doc.text("Precio/mes", cx[1] + 6, y + 3, { width: cw[1], lineBreak: false });
  doc.text("Trabajadores", cx[2] + 6, y + 3, { width: cw[2], lineBreak: false });
  doc.text("Destaque", cx[3] + 6, y + 3, { width: cw[3], lineBreak: false });
  doc.restore();
  y += 14;

  const plans = [
    ["Esencial", "$199.000", "1-10", "Microempresas"],
    ["Profesional", "$499.000", "11-50", "Mas popular"],
    ["Empresarial", "$999.000", "51-200", "Recomendado Alpina"],
    ["Corporativo", "$1.999.000", "Ilimitado", "SLA 99.9%"],
  ];
  for (let i = 0; i < plans.length; i++) {
    const bg = i === 2 ? LG : (i % 2 === 0 ? WH : BG);
    const fn = i === 2 ? "Helvetica-Bold" : "Helvetica";
    doc.save().rect(M, y, CW, 13).fill(bg);
    doc.fillColor(BK).font(fn).fontSize(7.5);
    doc.text(plans[i][0], cx[0] + 6, y + 3, { width: cw[0], lineBreak: false });
    doc.text(plans[i][1], cx[1] + 6, y + 3, { width: cw[1], lineBreak: false });
    doc.text(plans[i][2], cx[2] + 6, y + 3, { width: cw[2], lineBreak: false });
    doc.text(plans[i][3], cx[3] + 6, y + 3, { width: cw[3], lineBreak: false });
    doc.restore();
    y += 13;
  }
  y += 4;
  doc.save().fillColor(GY).font("Helvetica").fontSize(7)
    .text("Descuento 16.7% anual (pague 10 meses). Incluye actualizaciones normativas y soporte tecnico.", M, y, { width: CW, lineBreak: false });
  doc.restore();
  y += 14;

  // Contact
  ck(40);
  doc.save().rect(M, y, CW, 35).fill(DK);
  doc.fillColor(WH).font("Helvetica-Bold").fontSize(11)
    .text("Contactenos", M + 12, y + 6, { lineBreak: false });
  doc.font("Helvetica").fontSize(9)
    .text("sst.sagisas.co  |  admin@sst-colombia.com", M + 12, y + 22, { lineBreak: false });
  doc.restore();

  // Add footers to all pages
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    footer(i + 1);
  }

  doc.end();

  return new Promise<void>((resolve) => {
    stream.on("finish", () => {
      const stats = fs.statSync(outputPath);
      console.log(`PDF: ${outputPath} (${(stats.size / 1024).toFixed(0)} KB, ${pageCount} pags)`);
      resolve();
    });
  });
}

gen().catch(console.error);
