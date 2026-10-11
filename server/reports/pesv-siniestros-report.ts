import XLSX from "xlsx-js-style";
import type { Company } from "@shared/schema";
import { addLabeledField, addParagraph, addSectionBar, addStandardHeader, checkPageBreak, loadCompanyLogo, PDF_CONFIG } from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

export type SiniestroReportCompany = Pick<Company, "id" | "name" | "nit" | "address" | "logoUrl">;

export type SiniestroReportRecord = {
  id: string;
  incidentDate: string | null;
  fatalities: number | null;
  severeInjuries: number | null;
  minorInjuries: number | null;
  simpleCollisionPeople: number | null;
  vehiclePlate: string | null;
  driverName: string | null;
  driverIdentification: string | null;
  policeReport: string | null;
  ipatAuthorityName: string | null;
  committeeActaId: string | null;
  committeeActaNumber: number | null;
  committeeAnalysisDate: string | null;
};

export type SiniestroReportPeriod = {
  from?: string;
  to?: string;
};

export const SINIESTROS_REPORT_HEADERS = [
  "Fecha del siniestro",
  "Nivel de pérdida",
  "Fatalidad (personas)",
  "Heridos graves (personas)",
  "Heridos leves (personas)",
  "Choque simple (personas implicadas)",
  "Placa del vehículo de la empresa",
  "Nombre del conductor de la empresa",
  "Identificación del conductor de la empresa",
  "Consecutivo del IPAT en RNAT/RUNT",
  "Organismo de tránsito o autoridad que elaboró el IPAT",
  "Número del acta del comité",
  "Fecha del comité donde fue analizado",
];

export function formatSiniestroReportDate(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("es-CO");
}

export function describeSiniestroReportPeriod(period?: SiniestroReportPeriod): string {
  if (!period?.from && !period?.to) return "";
  const from = period.from ? formatSiniestroReportDate(period.from) : "Inicio";
  const to = period.to ? formatSiniestroReportDate(period.to) : "Actualidad";
  return `Período consultado: ${from} al ${to}`;
}

export function describeSiniestroLossLevel(record: Pick<
  SiniestroReportRecord,
  "fatalities" | "severeInjuries" | "minorInjuries" | "simpleCollisionPeople"
>): string {
  const levels = [
    ["Fatalidad", record.fatalities],
    ["Heridos graves", record.severeInjuries],
    ["Heridos leves", record.minorInjuries],
    ["Choque simple", record.simpleCollisionPeople],
  ] as const;

  const populated = levels
    .filter(([, count]) => typeof count === "number" && count > 0)
    .map(([label, count]) => `${label}: ${count}`);

  return populated.join("; ") || "Sin personas clasificadas";
}

export function getMissingSiniestroReportFields(record: SiniestroReportRecord): string[] {
  const missing: string[] = [];
  if (!record.incidentDate) missing.push("Fecha del siniestro");
  if (record.fatalities == null) missing.push("Cantidad de personas fallecidas");
  if (record.severeInjuries == null) missing.push("Cantidad de heridos graves");
  if (record.minorInjuries == null) missing.push("Cantidad de heridos leves");
  if (record.simpleCollisionPeople == null) missing.push("Cantidad de personas en choque simple");

  const peopleInvolved = [
    record.fatalities,
    record.severeInjuries,
    record.minorInjuries,
    record.simpleCollisionPeople,
  ].reduce<number>((total, count) => total + (typeof count === "number" ? count : 0), 0);
  if (peopleInvolved < 1) missing.push("Al menos una persona clasificada por nivel de pérdida");

  if (!record.vehiclePlate?.trim()) missing.push("Placa del vehículo");
  if (!record.driverName?.trim()) missing.push("Nombre del conductor");
  if (!record.driverIdentification?.trim()) missing.push("Identificación del conductor");
  if (!record.policeReport?.trim()) missing.push("Consecutivo IPAT en RNAT/RUNT");
  if (!record.ipatAuthorityName?.trim()) missing.push("Organismo de tránsito o autoridad del IPAT");
  if (!record.committeeActaId || !record.committeeAnalysisDate) {
    missing.push("Acta y fecha del comité que analizó el siniestro");
  }

  return missing;
}

export function buildSiniestrosExcelBuffer(
  company: Pick<SiniestroReportCompany, "name" | "nit">,
  records: SiniestroReportRecord[],
  generatedAt: Date = new Date(),
  period?: SiniestroReportPeriod,
  noIncidentsConfirmed = false,
): Buffer {
  if (records.length === 0 && !noIncidentsConfirmed) {
    throw new Error("Confirma que no hubo siniestros en un período definido para generar el informe en cero.");
  }
  if (records.length > 0 && noIncidentsConfirmed) {
    throw new Error("No se puede declarar un período sin siniestros cuando sí existen registros.");
  }
  if (noIncidentsConfirmed && (!period?.from || !period.to)) {
    throw new Error("El informe en cero requiere fecha inicial y final.");
  }

  const title = "REGISTRO DE VEHÍCULOS SINIESTRADOS";
  const metadata = `Empresa: ${company.name} · NIT: ${company.nit}`;
  const periodLabel = describeSiniestroReportPeriod(period);
  const generatedLabel = `Generado: ${generatedAt.toLocaleString("es-CO")}${periodLabel ? ` · ${periodLabel}` : ""}`;
  const declarationText =
    `DECLARACIÓN DE LA EMPRESA\nLa empresa declara que no se presentaron siniestros viales durante el período consultado: ${formatSiniestroReportDate(period?.from)} al ${formatSiniestroReportDate(period?.to)}.`;
  const rows = records.map((record) => [
    formatSiniestroReportDate(record.incidentDate),
    describeSiniestroLossLevel(record),
    record.fatalities,
    record.severeInjuries,
    record.minorInjuries,
    record.simpleCollisionPeople,
    record.vehiclePlate,
    record.driverName,
    record.driverIdentification,
    record.policeReport,
    record.ipatAuthorityName,
    record.committeeActaNumber,
    formatSiniestroReportDate(record.committeeAnalysisDate),
  ]);

  const worksheetRows: (string | number | null)[][] = [
    [title],
    [metadata],
    [generatedLabel],
  ];
  const headerRow = noIncidentsConfirmed ? 5 : 4;
  if (noIncidentsConfirmed) worksheetRows.push([declarationText]);
  worksheetRows.push([]);
  worksheetRows.push(SINIESTROS_REPORT_HEADERS, ...rows);
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
  const lastColumn = SINIESTROS_REPORT_HEADERS.length - 1;
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumn } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumn } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastColumn } },
  ];
  if (noIncidentsConfirmed) {
    worksheet["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: lastColumn } });
    worksheet["!rows"] = [
      { hpt: 28 },
      { hpt: 20 },
      { hpt: 22 },
      { hpt: 52 },
    ];
    worksheet["A1"].s = {
      font: { name: "Arial", sz: 16, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "246B45" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
    worksheet["A2"].s = {
      font: { name: "Arial", sz: 11, bold: true },
      alignment: { vertical: "center" },
    };
    worksheet["A3"].s = {
      font: { name: "Arial", sz: 10, color: { rgb: "404040" } },
      alignment: { vertical: "center", wrapText: true },
    };
    worksheet["A4"].s = {
      font: { name: "Arial", sz: 15, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "246B45" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: "1B5134" } },
        bottom: { style: "medium", color: { rgb: "1B5134" } },
      },
    };
    worksheet["!rows"][4] = { hpt: 8 };
    worksheet[`A${headerRow + 1}`].s = {
      font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B7657" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
    };
    worksheet["!rows"][headerRow] = { hpt: 36 };
  }
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRow, c: 0 },
      e: { r: headerRow + records.length, c: lastColumn },
    }),
  };
  worksheet["!cols"] = SINIESTROS_REPORT_HEADERS.map((header, index) => {
    const widestValue = Math.max(
      header.length,
      ...rows.map((row) => String(row[index] ?? "").length),
    );
    return { wch: Math.min(48, Math.max(14, widestValue + 2)) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Siniestros PESV");
  if (noIncidentsConfirmed) {
    const summaryRows = [
      ["RESUMEN DEL PERÍODO SIN SINIESTROS"],
      [declarationText],
      [],
      ["Empresa", company.name],
      ["NIT", company.nit],
      ["Período", `${formatSiniestroReportDate(period?.from)} al ${formatSiniestroReportDate(period?.to)}`],
      ["Siniestros viales", 0],
      ["Fatalidades", 0],
      ["Heridos graves", 0],
      ["Heridos leves", 0],
      ["Personas implicadas en choque simple", 0],
      ["Total personas afectadas", 0],
      ["Vehículo, conductor, IPAT y acta", "No aplica: no se reportaron siniestros."],
      ["Generado", generatedAt.toLocaleString("es-CO")],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 38 }, { wch: 80 }];
    summarySheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    ];
    summarySheet["!rows"] = [{ hpt: 30 }, { hpt: 54 }];
    summarySheet["A1"].s = {
      font: { name: "Arial", sz: 16, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "246B45" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
    summarySheet["A2"].s = {
      font: { name: "Arial", sz: 13, bold: true, color: { rgb: "1B5134" } },
      fill: { fgColor: { rgb: "E5F2EA" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: "246B45" } },
        bottom: { style: "medium", color: { rgb: "246B45" } },
      },
    };
    for (let row = 4; row <= summaryRows.length; row += 1) {
      const labelCell = summarySheet[`A${row}`];
      if (labelCell) {
        labelCell.s = {
          font: { name: "Arial", sz: 11, bold: true },
          alignment: { vertical: "center", wrapText: true },
        };
      }
      const valueCell = summarySheet[`B${row}`];
      if (valueCell) {
        valueCell.s = {
          font: { name: "Arial", sz: 11 },
          alignment: { vertical: "center", wrapText: true },
        };
      }
    }
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen sin siniestros");
  }
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function buildSiniestrosPdfBuffer(
  company: SiniestroReportCompany,
  records: SiniestroReportRecord[],
  requiresWatermark: boolean,
  period?: SiniestroReportPeriod,
  noIncidentsConfirmed = false,
): Promise<Buffer> {
  if (records.length === 0 && !noIncidentsConfirmed) {
    throw new Error("Confirma que no hubo siniestros en un período definido para generar el informe en cero.");
  }
  if (records.length > 0 && noIncidentsConfirmed) {
    throw new Error("No se puede declarar un período sin siniestros cuando sí existen registros.");
  }
  if (noIncidentsConfirmed && (!period?.from || !period.to)) {
    throw new Error("El informe en cero requiere fecha inicial y final.");
  }

  const { default: PDFDocument } = await import("pdfkit");
  const document = new PDFDocument({ margin: PDF_CONFIG.MARGIN, size: "LEGAL", layout: "landscape" });
  const chunks: Buffer[] = [];
  const bufferPromise = new Promise<Buffer>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  setupTrialWatermarkOnAllPages(document, requiresWatermark);
  const periodLabel = describeSiniestroReportPeriod(period);

  if (noIncidentsConfirmed) {
    let y = await addStandardHeader({
      doc: document,
      company,
      documentTitle: "INFORME PESV · SINIESTROS VIALES",
      documentCode: "PESV-SINIESTROS-01",
    });
    const boxX = PDF_CONFIG.MARGIN;
    const boxY = y + 5;
    const boxWidth = document.page.width - PDF_CONFIG.MARGIN * 2;
    const boxHeight = 76;
    document
      .roundedRect(boxX, boxY, boxWidth, boxHeight, 6)
      .fillAndStroke("#E5F2EA", "#246B45");
    document
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#1B5134")
      .text("DECLARACIÓN DE LA EMPRESA: SIN SINIESTROS VIALES", boxX + 16, boxY + 12, {
        width: boxWidth - 32,
        align: "center",
      });
    document
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#222222")
      .text(
        `La empresa declara que no se presentaron siniestros viales durante el período consultado: ${formatSiniestroReportDate(period?.from)} al ${formatSiniestroReportDate(period?.to)}.`,
        boxX + 18,
        boxY + 37,
        { width: boxWidth - 36, align: "center", lineGap: 2 },
      );
    y = boxY + boxHeight + 12;
    y = addSectionBar(document, "Resumen del período", y);
    const zeroSummaryFields = [
      ["Período consultado", `${formatSiniestroReportDate(period?.from)} al ${formatSiniestroReportDate(period?.to)}`],
      ["Siniestros viales", "0"],
      ["Fatalidades", "0"],
      ["Heridos graves", "0"],
      ["Heridos leves", "0"],
      ["Personas implicadas en choque simple", "0"],
      ["Total personas afectadas", "0"],
      ["Vehículo, conductor, IPAT y acta", "No aplica: no se reportaron siniestros."],
    ];
    for (const [label, value] of zeroSummaryFields) {
      y = checkPageBreak(document, 26, y);
      y = addLabeledField(document, label, value, { y, labelWidth: 230 });
    }

    const footerY = document.page.height - PDF_CONFIG.MARGIN - 22;
    document.fontSize(7).font("Helvetica").text(
      "SST Colombia · Página 1 de 1",
      PDF_CONFIG.MARGIN,
      footerY,
      { width: document.page.width - PDF_CONFIG.MARGIN * 2, align: "right" },
    );
    document.end();
    return bufferPromise;
  }

  const reportFields = (record: SiniestroReportRecord, index: number) => [
    ["Fecha del siniestro", formatSiniestroReportDate(record.incidentDate)],
    ["Nivel de pérdida", describeSiniestroLossLevel(record)],
    ["Fatalidad (personas)", String(record.fatalities)],
    ["Heridos graves (personas)", String(record.severeInjuries)],
    ["Heridos leves (personas)", String(record.minorInjuries)],
    ["Choque simple (personas implicadas)", String(record.simpleCollisionPeople)],
    ["Placa del vehículo de la empresa", record.vehiclePlate || ""],
    ["Nombre del conductor de la empresa", record.driverName || ""],
    ["Identificación del conductor de la empresa", record.driverIdentification || ""],
    ["Consecutivo del IPAT en RNAT/RUNT", record.policeReport || ""],
    ["Organismo de tránsito o autoridad que elaboró el IPAT", record.ipatAuthorityName || ""],
    ["Número del acta del comité", record.committeeActaNumber == null ? "" : String(record.committeeActaNumber)],
    ["Fecha del comité donde fue analizado", formatSiniestroReportDate(record.committeeAnalysisDate)],
    ["Registro del informe", `${index + 1} de ${records.length}`],
  ];

  for (let index = 0; index < records.length; index += 1) {
    if (index > 0) document.addPage();
    let y = await addStandardHeader({
      doc: document,
      company,
      documentTitle: "REGISTRO DE VEHÍCULOS SINIESTRADOS",
      documentCode: "PESV-SINIESTROS-01",
    });
    const reportIntroduction = [
      "Informe generado desde los registros vigentes del módulo PESV.",
      periodLabel,
    ].filter(Boolean).join(" ");
    y = addParagraph(document, reportIntroduction, {
      y,
      fontSize: 9,
    });
    y = addSectionBar(document, "Datos del siniestro", y);

    for (const [label, value] of reportFields(records[index], index)) {
      y = checkPageBreak(document, 26, y);
      y = addLabeledField(document, label, value || "—", { y, labelWidth: 230 });
    }

    const footerY = document.page.height - PDF_CONFIG.MARGIN - 22;
    document.fontSize(7).font("Helvetica").text(
      `SST Colombia · Página ${index + 1} de ${records.length}`,
      PDF_CONFIG.MARGIN,
      footerY,
      { width: document.page.width - PDF_CONFIG.MARGIN * 2, align: "right" },
    );
  }

  document.end();
  return bufferPromise;
}
