import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const logoPath = path.resolve("attached_assets/SST-Colombia-logo-3_1768408022586.png");
const outputPath = path.resolve("Portafolio_SST_Colombia_Alpina.pdf");

const W = 612, H = 792, M = 45, CW = W - M * 2;
const GREEN = rgb(30 / 255, 126 / 255, 52 / 255);
const DK_GREEN = rgb(21 / 255, 87 / 255, 36 / 255);
const LT_GREEN = rgb(212 / 255, 237 / 255, 218 / 255);
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const GRAY = rgb(0.45, 0.45, 0.45);
const LTGRAY = rgb(0.95, 0.95, 0.95);
const BLUE = rgb(37 / 255, 99 / 255, 235 / 255);
const TEAL = rgb(22 / 255, 163 / 255, 74 / 255);
const PURPLE = rgb(124 / 255, 58 / 255, 237 / 255);
const AMBER = rgb(217 / 255, 119 / 255, 6 / 255);
const LT_GREEN_A = rgb(0.83, 0.93, 0.85);

async function gen() {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let logoImage: any = null;
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  }

  const pages: any[] = [];
  let page: any;
  let y = 0;

  function addPage() {
    page = pdfDoc.addPage([W, H]);
    pages.push(page);
    y = H - M;
    return page;
  }

  function ck(needed: number) {
    if (y - needed < 50) {
      addPage();
    }
  }

  function drawFooter() {
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      p.drawRectangle({ x: 0, y: 0, width: W, height: 28, color: DK_GREEN });
      p.drawText(`SADGI S.A.S. | NIT 902.036.337-4 | admin@sst-colombia.com | sst.sagisas.co`, {
        x: M, y: 10, size: 7, font: helvetica, color: rgb(0.66, 0.84, 0.64)
      });
      p.drawText(`${i + 1}`, {
        x: W - M - 10, y: 10, size: 7, font: helvetica, color: rgb(0.66, 0.84, 0.64)
      });
    }
  }

  function bar(title: string, color = GREEN) {
    ck(30);
    page.drawRectangle({ x: M, y: y - 22, width: CW, height: 22, color });
    page.drawText(title, { x: M + 12, y: y - 16, size: 10, font: helveticaBold, color: WHITE });
    y -= 30;
  }

  function bul(text: string, indent = 14) {
    const maxW = CW - indent - 5;
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (helvetica.widthOfTextAtSize(test, 9) > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const lineH = 12;
    const totalH = lines.length * lineH + 4;
    ck(totalH);

    page.drawText("\u2022", { x: M + indent - 8, y: y - 10, size: 9, font: helveticaBold, color: GREEN });
    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], { x: M + indent, y: y - 10 - (i * lineH), size: 9, font: helvetica, color: BLACK });
    }
    y -= totalH;
  }

  function subLabel(text: string) {
    ck(18);
    page.drawText(text, { x: M + 10, y: y - 12, size: 9.5, font: helveticaBold, color: DK_GREEN });
    y -= 18;
  }

  function para(text: string, sz = 9) {
    const maxW = CW - 10;
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (helvetica.widthOfTextAtSize(test, sz) > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const lineH = sz + 3;
    const totalH = lines.length * lineH + 4;
    ck(totalH);

    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], { x: M + 5, y: y - 10 - (i * lineH), size: sz, font: helvetica, color: BLACK });
    }
    y -= totalH;
  }

  function phvaBar(label: string, color: any) {
    ck(16);
    const textWidth = helveticaBold.widthOfTextAtSize(label, 9.5);
    page.drawText(label, { x: M + 10, y: y - 12, size: 9.5, font: helveticaBold, color });
    y -= 16;
  }

  // ═══════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════
  addPage();

  // Header
  page.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: DK_GREEN });
  if (logoImage) {
    const logoDims = logoImage.scale(0.25);
    page.drawImage(logoImage, { x: M, y: H - 82, width: logoDims.width, height: logoDims.height });
  }
  page.drawText("PORTAFOLIO DE SERVICIOS", { x: 250, y: H - 40, size: 18, font: helveticaBold, color: WHITE });
  page.drawText("Sistema de Gestion de Seguridad y Salud en el Trabajo", { x: 250, y: H - 56, size: 9, font: helvetica, color: WHITE });
  page.drawText("SADGI S.A.S. | NIT 902.036.337-4", { x: 250, y: H - 72, size: 8, font: helvetica, color: rgb(0.66, 0.84, 0.64) });

  y = H - 105;

  // Client banner
  page.drawRectangle({ x: M, y: y - 28, width: CW, height: 28, color: LT_GREEN });
  page.drawText("Propuesta de Suscripcion para: Alpina Colombia", { x: M + 12, y: y - 20, size: 12, font: helveticaBold, color: DK_GREEN });
  y -= 40;

  para("Ponemos a disposicion de Alpina nuestra plataforma tecnologica para automatizar la gestion de Seguridad y Salud en el Trabajo en todas sus sedes y plantas, cumpliendo con la normatividad colombiana vigente.");
  y -= 6;

  // Problem
  bar("El reto de cumplir con SST en una operacion como Alpina");
  bul("Multiples sedes y plantas con cientos de trabajadores requieren control centralizado");
  bul("La normativa exige cumplir 61 estandares minimos (Resolucion 0312/2019) con evidencias");
  bul("La flota vehicular de distribucion debe cumplir el PESV (Resolucion 40595/2022)");
  bul("Los informes al Ministerio de Trabajo deben estar listos en fechas especificas");
  bul("El seguimiento manual genera riesgos de incumplimiento, sanciones y reprocesos");
  y -= 6;

  // Solution
  bar("Nuestra solucion: suscripcion SST-Colombia");
  para("Con una sola suscripcion, Alpina accede a un sistema completo que automatiza todo el ciclo PHVA:");
  y -= 2;

  phvaBar("PLANEAR", BLUE);
  bul("Evaluacion Inicial automatizada | Matriz de riesgos IPERC GTC-45 | Matriz Legal | Plan de Trabajo Anual", 20);

  phvaBar("HACER", TEAL);
  bul("Trabajadores y contratos | Programa de capacitaciones (registro y seguimiento) | Examenes medicos", 20);
  bul("Inspecciones | Control de EPP | Sustancias quimicas | Plan emergencias | Inv. accidentes", 20);

  phvaBar("VERIFICAR", PURPLE);
  bul("Indicadores SST automaticos | Auditorias internas | Revision alta direccion | Accidentalidad", 20);

  phvaBar("ACTUAR", AMBER);
  bul("Acciones correctivas/preventivas | Efectividad | Recomendaciones ARL | Informe Ministerio", 20);
  y -= 6;

  // PESV
  bar("Modulo PESV para la flota de Alpina");
  bul("Implementacion completa segun Resolucion 40595/2022 (24 pasos metodologicos)");
  bul("Gestion vehicular: SOAT, revision tecnico-mecanica, seguros, mantenimiento preventivo");
  bul("Conductores con verificacion de licencias | Inspecciones preoperacionales diarias");
  bul("Matriz de riesgos viales ISO 31000 | 12+ indicadores de desempeno vial");
  bul("Informes PDF listos para auditorias y reporte al Ministerio de Transporte");
  y -= 6;

  // Portals - FREE
  bar("Incluido sin costo adicional en la suscripcion");
  subLabel("Portal de Empleados - GRATIS e ilimitado");
  bul("Cada trabajador accede a su informacion: contrato, perfil, capacitaciones, EPP, reportes de seguridad", 20);
  bul("Elecciones del COPASST y Comite de Convivencia 100% en linea desde el portal", 20);
  y -= 2;
  subLabel("Portal del Profesional SST Licenciado - GRATIS");
  bul("El profesional SST asignado accede al sistema con firma digital incluida", 20);
  bul("Firma obligatoria en 5 tipos de documentos | Dashboard de cumplimiento | Boveda de documentos", 20);
  y -= 6;

  // AI
  bar("Inteligencia Artificial integrada");
  bul("Chatbot especializado en normativa SST colombiana para resolver dudas en tiempo real");
  bul("Asistente GTC-45 que auto-completa la matriz de riesgos segun actividad economica (CIIU)");
  bul("Motor de acciones correctivas con 1.300+ medidas preventivas categorizadas");
  y -= 8;

  // Pilot
  bar("Piloto Tecnico - 9 Semanas sin costo inicial", DK_GREEN);
  ck(30);
  page.drawRectangle({ x: M, y: y - 24, width: CW, height: 24, color: LT_GREEN });
  page.drawText("Alpina puede iniciar sin inversion previa. Objetivo: 60%-75% de cumplimiento en 9 semanas.", {
    x: M + 12, y: y - 17, size: 9, font: helveticaBold, color: DK_GREEN
  });
  y -= 34;

  subLabel("Semanas 1-3: Diagnostico y configuracion");
  bul("Registro de sedes | Carga masiva de trabajadores | Evaluacion inicial SG-SST", 20);

  subLabel("Semanas 4-6: Puesta en marcha");
  bul("Matriz IPERC con asistente IA | Registro de capacitaciones | PESV flota | Portal empleados", 20);

  subLabel("Semanas 7-9: Verificacion de resultados");
  bul("Dashboards PHVA | Informe Ministerio | Evaluacion de cumplimiento final", 20);
  y -= 6;

  // Sustainability
  ck(45);
  page.drawRectangle({ x: M, y: y - 38, width: CW, height: 38, color: LTGRAY });
  page.drawText("Despues del piloto:", { x: M + 10, y: y - 12, size: 9, font: helveticaBold, color: DK_GREEN });
  page.drawText("La transicion a la suscripcion es el paso natural para mantener el cumplimiento", { x: M + 10, y: y - 24, size: 8.5, font: helvetica, color: BLACK });
  page.drawText("permanente. El precio se ajusta al numero de trabajadores y nivel de riesgo.", { x: M + 10, y: y - 35, size: 8.5, font: helvetica, color: BLACK });
  y -= 48;

  // What's included
  bar("Que incluye la suscripcion");
  bul("Acceso completo a todos los modulos del sistema (PHVA completo + PESV)");
  bul("Portal de empleados GRATIS e ilimitado para todos los trabajadores");
  bul("Portal del profesional SST licenciado incluido sin costo adicional");
  bul("Actualizaciones normativas automaticas | Almacenamiento en la nube");
  bul("Soporte tecnico dedicado | Infraestructura AWS | Cifrado AES-256 | 99.9% disponibilidad");
  y -= 8;

  // Contact CTA
  ck(45);
  page.drawRectangle({ x: M, y: y - 42, width: CW, height: 42, color: DK_GREEN });
  page.drawText("Siguiente paso", { x: M + 15, y: y - 16, size: 13, font: helveticaBold, color: WHITE });
  page.drawText("Solicite su piloto gratuito de 9 semanas:  admin@sst-colombia.com  |  sst.sagisas.co", {
    x: M + 15, y: y - 32, size: 9.5, font: helvetica, color: WHITE
  });

  // Add footers
  drawFooter();

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF: ${outputPath} (${(pdfBytes.length / 1024).toFixed(0)} KB, ${pages.length} pags)`);
}

gen().catch(console.error);
