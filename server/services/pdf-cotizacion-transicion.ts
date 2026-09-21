import PDFDocument from "pdfkit";

export interface CotizacionTransicionParams {
  empresa: string;
  nit?: string;
  ciudad?: string;
  tarifaHora?: string | number;
  horasMinimas?: string | number;
  horasPorSesion?: string | number;
  vigenciaDias?: string | number;
  fechaInicio?: string;
  fechaFin?: string;
  nombreProveedor?: string;
  nitProveedor?: string;
  email?: string;
  whatsapp?: string;
  fechaEmision?: string;
  mensajePrincipal?: string;
}

const C = {
  green: "#123F2E",
  green2: "#1B6847",
  gold: "#D3AE3D",
  mint: "#DCEFE2",
  pale: "#F4F7F4",
  text: "#1D2924",
  muted: "#637069",
  border: "#D5DED8",
  white: "#FFFFFF",
  warning: "#FFF7E3",
  warningBorder: "#D8B34B",
};

const IVA_RATE = 0.19;

const money = (amount: number) =>
  `$${amount.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

const numberValue = (value: string | number | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const formatDate = (value: string | undefined, fallback: Date) => {
  const parts = value?.split("-").map(Number);
  const date = parts?.length === 3 && parts.every(Number.isFinite)
    ? new Date(parts[0], parts[1] - 1, parts[2])
    : fallback;
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const dateKey = (value: string | undefined) => {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.replace(/-/g, "");
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
};

export async function generateCotizacionTransicionPdf(
  params: CotizacionTransicionParams,
): Promise<Buffer> {
  const empresa = params.empresa.trim();
  const nit = params.nit?.trim() || "";
  const ciudad = params.ciudad?.trim() || "Medellín, Antioquia";
  const tarifaHora = numberValue(params.tarifaHora, 50000);
  const horasMinimas = Math.max(1, Math.round(numberValue(params.horasMinimas, 8)));
  const horasPorSesion = Math.max(1, Math.round(numberValue(params.horasPorSesion, 2)));
  const sesiones = Math.ceil(horasMinimas / horasPorSesion);
  const vigenciaDias = Math.max(1, Math.round(numberValue(params.vigenciaDias, 15)));
  const nombreProveedor = params.nombreProveedor?.trim() || "SADGI S.A.S.";
  const nitProveedor = params.nitProveedor?.trim() || "902.036.337-4";
  const email = params.email?.trim() || "admin@sst-colombia.com";
  const whatsapp = params.whatsapp?.trim() || "311 555 2054";
  const fecha = params.fechaEmision
    ? params.fechaEmision
    : undefined;
  const fechaTexto = formatDate(fecha, new Date());
  const periodoCapacitacion = params.fechaInicio || params.fechaFin
    ? `${formatDate(params.fechaInicio, new Date())}${params.fechaFin ? ` al ${formatDate(params.fechaFin, new Date())}` : ""}`
    : "A coordinar con la empresa";
  const subtotal = tarifaHora * horasMinimas;
  const iva = Math.round(subtotal * IVA_RATE);
  const total = subtotal + iva;
  const mensajePrincipal = params.mensajePrincipal?.trim() ||
    `Capacitar y habilitar al equipo designado por ${empresa} para reemplazar al Profesional en SST y continuar directamente la gestión SST y PESV dentro de la infraestructura digital de SST Colombia, utilizando la suscripción que la empresa ya tiene activa.`;
  const cotizacionNo = `COT-${dateKey(fecha)}-01`;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    info: {
      Title: `Cotización de transición SST/PESV — ${empresa}`,
      Author: nombreProveedor,
      Subject: "Capacitación para transición SST y PESV",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const header = (title: string, subtitle: string) => {
    doc.rect(0, 0, doc.page.width, 144).fill(C.green);
    doc.roundedRect(54, 25, 175, 25, 12).fill(C.gold);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(C.green)
      .text("SST COLOMBIA", 72, 33, { width: 140, align: "center" });
    doc.font("Helvetica-Bold").fontSize(23).fillColor(C.white)
      .text(title, 54, 68, { width: 487, align: "center" });
    doc.font("Helvetica").fontSize(10).fillColor("#D9E9DF")
      .text(subtitle, 54, 106, { width: 487, align: "center" });
    doc.rect(0, 140, doc.page.width, 5).fill(C.gold);
  };

  const footer = () => {
    const y = doc.page.height - 66;
    doc.moveTo(54, y - 10).lineTo(doc.page.width - 54, y - 10)
      .strokeColor(C.border).lineWidth(0.7).stroke();
    doc.font("Helvetica").fontSize(7).fillColor(C.muted)
      .text(`${nombreProveedor} · NIT ${nitProveedor} · ${ciudad}, Colombia`, 54, y, { width: 300, lineBreak: false });
    doc.text(`${email} · ${whatsapp}`, 300, y, { width: 258, align: "right", lineBreak: false });
  };

  const sectionTitle = (text: string, y: number) => {
    doc.font("Helvetica-Bold").fontSize(13).fillColor(C.green).text(text, 54, y);
    doc.moveTo(54, y + 19).lineTo(541, y + 19)
      .strokeColor(C.gold).lineWidth(1.2).stroke();
  };

  const bullet = (text: string, y: number) => {
    doc.circle(63, y + 6, 2.2).fill(C.green2);
    doc.font("Helvetica").fontSize(10).fillColor(C.text)
      .text(text, 73, y, { width: 460, lineGap: 2 });
  };

  const labelValue = (label: string, value: string, x: number, y: number, width: number) => {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.muted)
      .text(label.toUpperCase(), x, y, { width });
    doc.font("Helvetica").fontSize(10.5).fillColor(C.text)
      .text(value, x, y + 14, { width });
  };

  header("Cotización de transición SST y PESV", "Capacitación para reemplazar al Profesional en SST");
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.green)
    .text(`COTIZACIÓN No. ${cotizacionNo}`, 54, 171);
  doc.font("Helvetica").fontSize(9).fillColor(C.muted)
    .text(`Fecha de emisión: ${fechaTexto}`, 54, 188);

  doc.roundedRect(54, 220, 487, 96, 8).fill(C.pale)
    .strokeColor(C.border).lineWidth(0.7).stroke();
  labelValue("Cliente", empresa, 70, 237, 220);
  labelValue("Servicio", "Reemplazo operativo del Profesional en SST", 310, 237, 205);
  labelValue("Modalidad", "Virtual · individual · una empresa", 70, 291, 220);
  labelValue("Vigencia", `${vigenciaDias} días calendario`, 310, 291, 205);
  if (nit) {
    doc.font("Helvetica").fontSize(8).fillColor(C.muted).text(`NIT ${nit}`, 70, 318, { width: 220 });
  }
  doc.font("Helvetica").fontSize(8).fillColor(C.muted)
    .text(`Periodo previsto de capacitación: ${periodoCapacitacion}`, 310, 318, { width: 205 });

  sectionTitle("Objeto de la propuesta", 338);
  doc.font("Helvetica").fontSize(10.5).fillColor(C.text)
    .text(mensajePrincipal, 54, 364, { width: 487, lineGap: 4 });

  sectionTitle("Alcance de la capacitación", 444);
  bullet(`Mínimo requerido para enseñar los tres portales: ${horasMinimas} horas, divididas en ${sesiones} sesiones de ${horasPorSesion} horas diarias.`, 472);
  bullet(`Transferencia operativa para que ${empresa} reemplace al Profesional en SST.`, 496);
  bullet("Portal de la Empresa: usuarios, actividades, documentos, cronogramas y seguimiento.", 520);
  bullet("Portal de gestión SST: estándares, evidencias, actividades pendientes, avances e informes.", 544);
  bullet("Portal de Empleados: inducciones, capacitaciones, evaluaciones y confirmaciones.", 568);
  bullet(`Ejercicio práctico utilizando la información de ${empresa}.`, 592);
  bullet("Una sesión virtual de seguimiento de hasta 30 minutos dentro de los 7 días siguientes.", 616);

  doc.addPage();
  header("Propuesta económica", "Transferencia operativa para la continuidad del programa de gestión");
  sectionTitle("Inversión", 174);
  const tableX = 54;
  const tableY = 204;
  const tableW = 487;
  const amountX = tableX + 376;
  const amountW = 93;
  doc.roundedRect(tableX, tableY, tableW, 34).fill(C.green);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white)
    .text("CONCEPTO", tableX + 14, tableY + 12)
    .text("VALOR", amountX, tableY + 12, { width: amountW, align: "right" });
  doc.rect(tableX, tableY + 34, tableW, 64).fill(C.pale)
    .strokeColor(C.border).lineWidth(0.7).stroke();
  doc.font("Helvetica").fontSize(10).fillColor(C.text)
    .text(`Capacitación virtual para enseñar los tres portales y reemplazar al Profesional en SST (mínimo ${horasMinimas} horas)`, tableX + 14, tableY + 50, { width: 345 })
    .text(money(subtotal), amountX, tableY + 50, { width: amountW, align: "right" });
  doc.text("Tarifa por hora", tableX + 275, tableY + 108, { width: 95, align: "right" })
    .text(money(tarifaHora), amountX, tableY + 108, { width: amountW, align: "right" });
  doc.text("Subtotal", tableX + 275, tableY + 136, { width: 95, align: "right" })
    .text(money(subtotal), amountX, tableY + 136, { width: amountW, align: "right" });
  doc.text("IVA (19%)", tableX + 275, tableY + 158, { width: 95, align: "right" })
    .text(money(iva), amountX, tableY + 158, { width: amountW, align: "right" });
  doc.roundedRect(tableX + 270, tableY + 184, 217, 42, 6).fill(C.gold);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(C.green)
    .text("TOTAL", tableX + 284, tableY + 199)
    .text(money(total), amountX, tableY + 199, { width: amountW, align: "right" });
  doc.font("Helvetica").fontSize(8.5).fillColor(C.muted)
    .text("Tratamiento aplicado: servicio de capacitación privada sujeto a la tarifa general del IVA.", tableX, tableY + 238, { width: tableW });

  sectionTitle("Incluye", 474);
  bullet(`Acceso habilitado únicamente para la operación de ${empresa}.`, 502);
  bullet("No incluye una licencia nueva ni una mensualidad adicional para la consultora.", 526);
  doc.roundedRect(54, 591, 487, 122, 8).fill(C.warning)
    .strokeColor(C.warningBorder).lineWidth(1).stroke();
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.green).text("Precisión importante", 70, 609);
  doc.font("Helvetica").fontSize(9.5).fillColor(C.text).text(
    `Esta capacitación se limita al uso de la plataforma y a la transferencia operativa del estado del programa de ${empresa}. No sustituye los requisitos profesionales, académicos, de experiencia o de licencia que puedan resultar exigibles para asumir formalmente funciones de SST o PESV. La empresa contratante debe verificar, antes de habilitarla, que el perfil de la nueva responsable sea adecuado y que cuente con las autorizaciones o licencias aplicables.`,
    70, 633, { width: 455, lineGap: 3.5 },
  );
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.green).text("Aceptación de la propuesta", 54, 724);
  doc.font("Helvetica").fontSize(9.5).fillColor(C.text).text(
    `El pago se realiza por adelantado. Una vez confirmado el pago, se enviará la agenda con la distribución mínima de ${horasMinimas} horas: ${sesiones} sesiones virtuales de ${horasPorSesion} horas diarias para enseñar los tres portales y coordinar la habilitación del usuario.`,
    54, 743, { width: 487 },
  );
  footer();
  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}