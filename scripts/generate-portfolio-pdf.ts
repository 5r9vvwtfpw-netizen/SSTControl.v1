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

  // ═══ HEADER ═══
  doc.rect(0, 0, W, 85).fill(DK);
  if (fs.existsSync(logoPath)) doc.image(logoPath, M, 5, { height: 72 });
  doc.fillColor(WH).font("Helvetica-Bold").fontSize(18)
    .text("PORTAFOLIO DE SERVICIOS", 200, 18, { width: 370, align: "right", lineBreak: false });
  doc.font("Helvetica").fontSize(9)
    .text("Sistema de Gestion de Seguridad y Salud en el Trabajo", 200, 40, { width: 370, align: "right", lineBreak: false });
  doc.fontSize(7.5).fillColor("#a8d5a2")
    .text("SADGI S.A.S. | NIT 902.036.337-4", 200, 58, { width: 370, align: "right", lineBreak: false });

  y = 95;

  // ═══ PROPUESTA PERSONALIZADA ═══
  doc.save().rect(M, y, CW, 25).fill(LG);
  doc.fillColor(DK).font("Helvetica-Bold").fontSize(11)
    .text("Propuesta de Suscripcion para: Alpina Colombia", M + 10, y + 7, { width: CW - 20, lineBreak: false });
  doc.restore();
  y += 32;

  txt("Ponemos a disposicion de Alpina nuestra plataforma tecnologica para automatizar la gestion de Seguridad y Salud en el Trabajo en todas sus sedes y plantas, cumpliendo con la normatividad colombiana vigente de manera eficiente y trazable.", 9, "Helvetica", BK, { align: "justify", lineGap: 1 });
  y += 4;

  // ═══ PROBLEMA / SOLUCION ═══
  bar("El reto de cumplir con SST en una operacion como Alpina");
  bul("Multiples sedes y plantas con cientos de trabajadores requieren control centralizado");
  bul("La normativa exige cumplir 61 estandares minimos (Resolucion 0312/2019) con evidencias");
  bul("La flota vehicular de distribucion debe cumplir el PESV (Resolucion 40595/2022)");
  bul("Los informes al Ministerio de Trabajo deben estar listos en fechas especificas");
  bul("El seguimiento manual genera riesgos de incumplimiento, sanciones y reprocesos");
  y += 3;

  bar("Nuestra solucion: suscripcion SST-Colombia");
  txt("Con una sola suscripcion, Alpina accede a un sistema completo que automatiza todo el ciclo PHVA de seguridad y salud en el trabajo:", 9, "Helvetica", BK, { lineGap: 1 });
  y += 3;

  // PHVA
  const phva: [string, string, string[]][] = [
    ["PLANEAR", "#2563eb", ["Evaluacion Inicial automatizada | Matriz de riesgos IPERC GTC-45 | Matriz Legal | Plan de Trabajo Anual"]],
    ["HACER", "#16a34a", ["Gestion de trabajadores y contratos | 50+ temas de capacitacion | Examenes medicos con alertas | Inspecciones | Control de EPP | Sustancias quimicas | Plan de emergencias | Investigacion de accidentes"]],
    ["VERIFICAR", "#7c3aed", ["Indicadores SST automaticos | Auditorias internas | Revision por alta direccion | Indicadores de accidentalidad"]],
    ["ACTUAR", "#d97706", ["Acciones correctivas y preventivas | Seguimiento de efectividad | Recomendaciones ARL | Informe listo para Ministerio de Trabajo"]],
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

  // PESV
  bar("Modulo PESV para la flota de Alpina");
  bul("Implementacion completa segun Resolucion 40595/2022 (24 pasos metodologicos)");
  bul("Gestion de vehiculos: SOAT, revision tecnico-mecanica, seguros, mantenimiento preventivo");
  bul("Control de conductores con verificacion de licencias e inspecciones preoperacionales");
  bul("Matriz de riesgos viales ISO 31000 | 12+ indicadores de desempeno vial");
  bul("Informes PDF listos para auditorias y reporte al Ministerio de Transporte");
  y += 3;

  // PORTALS - FREE
  bar("Incluido en la suscripcion sin costo adicional");
  sub("Portal de Empleados - GRATIS e ilimitado");
  bul("Cada trabajador de Alpina accede a su informacion: contrato, perfil, capacitaciones, EPP", 58);
  bul("Pueden reportar condiciones inseguras y participar en elecciones COPASST/Convivencia", 58);
  sub("Portal del Profesional SST Licenciado - GRATIS");
  bul("El profesional SST asignado a Alpina accede al sistema con firma digital incluida", 58);
  bul("Firma obligatoria en 5 tipos de documentos | Dashboard de cumplimiento | Boveda de documentos", 58);
  y += 3;

  // AI
  bar("Inteligencia Artificial integrada");
  bul("Chatbot especializado en normativa SST colombiana para resolver dudas en tiempo real");
  bul("Asistente GTC-45 que auto-completa la matriz de riesgos segun actividad economica");
  bul("Motor de acciones correctivas con 1.300+ medidas preventivas categorizadas");
  y += 5;

  // ═══ PILOT ═══
  bar("Piloto Tecnico de Implementacion - 9 Semanas sin costo", DK);
  ck(28);
  doc.save().rect(M, y, CW, 22).fill(LG);
  doc.fillColor(DK).font("Helvetica-Bold").fontSize(8.5)
    .text("Alpina puede iniciar sin inversion previa. Objetivo: alcanzar 60%-75% de cumplimiento en 9 semanas.", M + 10, y + 6, { width: CW - 20 });
  doc.restore();
  y += 28;

  sub("Semanas 1-3: Diagnostico y configuracion");
  bul("Registro de sedes y estructura organizacional | Carga masiva de trabajadores | Evaluacion inicial", 58);
  sub("Semanas 4-6: Puesta en marcha");
  bul("Matriz IPERC con asistente IA | Programacion de capacitaciones y examenes | Configuracion PESV | Activacion portal empleados", 58);
  sub("Semanas 7-9: Verificacion de resultados");
  bul("Revision de dashboards PHVA | Informe para Ministerio | Evaluacion de cumplimiento final", 58);
  y += 5;

  ck(40);
  doc.save().rect(M, y, CW, 35).fill(BG);
  doc.fillColor(DK).font("Helvetica-Bold").fontSize(9).text("Despues del piloto:", M + 10, y + 5);
  doc.fillColor(BK).font("Helvetica").fontSize(8.5)
    .text("Al verificar la eficiencia del sistema, la transicion a la suscripcion es el paso natural para que Alpina mantenga su cumplimiento normativo y productividad de forma permanente. El precio se ajusta al numero de trabajadores y nivel de riesgo de la operacion.", M + 10, y + 17, { width: CW - 20, lineGap: 1 });
  doc.restore();
  y += 45;

  // ═══ WHAT'S INCLUDED ═══
  bar("Que incluye la suscripcion");
  bul("Acceso completo a todos los modulos del sistema (PHVA + PESV)");
  bul("Portal de empleados gratuito e ilimitado para todos los trabajadores");
  bul("Portal del profesional SST licenciado incluido sin costo");
  bul("Actualizaciones normativas automaticas cuando cambie la legislacion");
  bul("Almacenamiento en la nube para documentos y evidencias");
  bul("Soporte tecnico dedicado con tiempos de respuesta garantizados");
  bul("Infraestructura AWS con cifrado AES-256 y 99.9% de disponibilidad");
  y += 6;

  // ═══ CONTACT ═══
  ck(45);
  doc.save().rect(M, y, CW, 40).fill(DK);
  doc.fillColor(WH).font("Helvetica-Bold").fontSize(12)
    .text("Siguiente paso", M + 12, y + 6, { lineBreak: false });
  doc.font("Helvetica").fontSize(9)
    .text("Solicite su piloto gratuito de 9 semanas: admin@sst-colombia.com | sst.sagisas.co", M + 12, y + 23, { lineBreak: false });
  doc.restore();

  // Footers
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
