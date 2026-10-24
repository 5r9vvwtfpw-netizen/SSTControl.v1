import PDFDocument from "pdfkit";
import type {
  Company,
  ContextoOrganizacionalPesv,
  Driver,
  EvaluacionPesv,
  RespuestaPasoPesv,
  SafeRoute,
  Vehicle,
} from "@shared/schema";
import {
  addParagraph,
  addSectionBar,
  addSimpleTable,
  addStandardHeader,
  checkPageBreak,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

type DiagnosisPdfData = {
  company: Company;
  evaluation: Pick<EvaluacionPesv, "anio" | "mes" | "estado"> | null;
  p03Response: Pick<RespuestaPasoPesv, "cumple" | "noAplica" | "evidencias" | "observaciones"> | null;
  contextFactors: ContextoOrganizacionalPesv[];
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: SafeRoute[];
  isTestCompany: boolean;
  watermark?: boolean;
};

function value(value: string | number | null | undefined): string {
  if (value === null || value === undefined || String(value).trim() === "") return "Sin registro";
  return String(value).trim();
}

function statusText(response: DiagnosisPdfData["p03Response"]): string {
  if (!response) return "Sin respuesta registrada";
  if (response.noAplica === 1) return "Marcado como no aplica";
  if (response.cumple === 1) return "Marcado como cumple en la evaluación";
  if (response.cumple === 0) return "Marcado como no cumple en la evaluación";
  return "Pendiente de valoración";
}

function readableJson(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Sin registro";
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return raw.trim();
  }
}

function hasCriticalPointData(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length > 0;
    if (parsed && typeof parsed === "object") return Object.keys(parsed).length > 0;
    return Boolean(parsed);
  } catch {
    return true;
  }
}

function hasTestMarker(data: DiagnosisPdfData): boolean {
  const candidates = [
    data.p03Response?.evidencias,
    data.p03Response?.observaciones,
    ...data.contextFactors.flatMap((factor) => [factor.nombre, factor.descripcion, factor.impactoSeguridad]),
    ...data.vehicles.flatMap((vehicle) => [vehicle.observations, vehicle.technicalObservations]),
    ...data.drivers.map((driver) => driver.observations),
    ...data.routes.flatMap((route) => [route.routeName, route.observations, route.criticalPoints]),
  ];
  return data.isTestCompany || candidates.some((text) => /PRUEBA FUNCIONAL|ESCENARIO DE PRUEBA/i.test(text || ""));
}

export async function buildPesvOrganizationalDiagnosisPdfBuffer(data: DiagnosisPdfData): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 35,
    size: "LETTER",
    bufferPages: true,
    info: {
      Title: "Diagnóstico consolidado del estado actual de la seguridad vial",
      Author: "SST-Colombia",
      Subject: "PESV P03 — Diagnóstico de la organización",
    },
  });
  setupTrialWatermarkOnAllPages(doc, Boolean(data.watermark));
  const testScenario = hasTestMarker(data);
  const pageLabel = testScenario
    ? "PRUEBA FUNCIONAL — NO PRESENTAR COMO EVIDENCIA REAL"
    : `${data.company.name} · SISI/PESV · Diagnóstico P03`;
  const addPageLabel = () => {
    doc.save();
    doc.fillColor(testScenario ? "#a12622" : "#52635a").font("Helvetica-Bold").fontSize(7)
      .text(pageLabel, 35, 14, { width: doc.page.width - 70, align: "center" });
    doc.restore();
  };
  addPageLabel();
  doc.on("pageAdded", addPageLabel);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  let y = await addStandardHeader({
    doc,
    company: data.company,
    documentTitle: "DIAGNÓSTICO CONSOLIDADO DEL ESTADO ACTUAL DE LA SEGURIDAD VIAL",
    documentCode: "SISI-PESV-ANUAL-08",
  });
  y = addParagraph(doc, "PESV P03 — Diagnóstico de la organización · Resolución 40595 de 2022, artículo 7.", {
    y,
    bold: true,
  });
  y = addParagraph(doc, `Fecha de generación: ${new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}`, { y });

  if (testScenario) {
    y = checkPageBreak(doc, 65, y);
    y = addSectionBar(doc, "ADVERTENCIA — DATOS DE PRUEBA", y);
    y = addParagraph(
      doc,
      "Este documento contiene datos marcados como prueba funcional o pertenece a DEMO-PRUEBA. Sirve para revisar la generación y consolidación del informe; no representa una declaración empresarial ni debe presentarse como evidencia real.",
      { y },
    );
  }

  y = checkPageBreak(doc, 70, y);
  y = addSectionBar(doc, "Respuesta registrada y alcance del documento", y);
  y = addSimpleTable(doc, ["Dato", "Registro actual"], [
    ["Pregunta SISI/PESV", "¿La empresa ha definido el diagnóstico del estado actual de la seguridad vial?"],
    ["Evaluación PESV", data.evaluation ? `${data.evaluation.anio} · ${value(data.evaluation.estado)}` : "No hay evaluación PESV registrada."],
    ["Valoración guardada de P03", statusText(data.p03Response)],
    ["Descripción de evidencia P03", value(data.p03Response?.evidencias)],
    ["Observaciones P03", value(data.p03Response?.observaciones)],
  ], { y, columnWidths: [150, 392] });
  y = addParagraph(
    doc,
    "Este PDF consolida en un solo archivo la información actualmente registrada en los módulos fuente. Los datos incluidos no equivalen por sí solos a una inspección vial, una caracterización firmada ni a una validación de cumplimiento.",
    { y },
  );

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, "1. Caracterización de la empresa", y);
  y = addSimpleTable(doc, ["Campo", "Información registrada"], [
    ["Empresa", value(data.company.name)],
    ["NIT", value(data.company.nit)],
    ["Dirección", value(data.company.address)],
    ["Municipio", value(data.company.city)],
    ["Actividad económica principal (CIIU)", value(data.company.ciiuCode)],
    ["Trabajadores reportados en el perfil", value(data.company.numberOfWorkers)],
    ["Vehículos reportados en el perfil", value(data.company.numberOfVehicles)],
    ["Nivel de riesgo registrado", value(data.company.riskLevel)],
  ], { y, columnWidths: [220, 322] });
  y = addParagraph(
    doc,
    "Este apartado reúne los campos de caracterización disponibles en la ficha empresarial. No incorpora un archivo narrativo firmado.",
    { y },
  );

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, `2. Inventario de vehículos (${data.vehicles.length} registros)`, y);
  const vehicleRows = data.vehicles.map((vehicle) => [
    value(vehicle.plate),
    `${value(vehicle.brand)} ${value(vehicle.model)} · ${value(vehicle.year)}`,
    value(vehicle.type),
    value(vehicle.ownership),
    value(vehicle.status),
  ]);
  y = addSimpleTable(doc, ["Placa", "Marca / modelo / año", "Tipo", "Vinculación", "Estado"], vehicleRows.length ? vehicleRows : [["Sin vehículos registrados", "", "", "", ""]], {
    y,
    columnWidths: [72, 190, 95, 95, 90],
  });

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, `3. Base de conductores (${data.drivers.length} registros)`, y);
  const driverRows = data.drivers.map((driver) => [
    value(driver.name),
    value(driver.identificationNumber),
    `${value(driver.licenseType)} · ${value(driver.licenseNumber)}`,
    value(driver.licenseExpiry),
    value(driver.status),
  ]);
  y = addSimpleTable(doc, ["Nombre", "Identificación", "Licencia", "Vencimiento", "Estado"], driverRows.length ? driverRows : [["Sin conductores registrados", "", "", "", ""]], {
    y,
    columnWidths: [130, 95, 145, 90, 82],
  });

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, `4. Rutas y puntos críticos (${data.routes.length} rutas activas)`, y);
  const routeRows = data.routes.map((route) => [
    value(route.routeName),
    `${value(route.origin)} → ${value(route.destination)}`,
    value(route.routeType),
    value(route.riskLevel),
    readableJson(route.criticalPoints),
  ]);
  y = addSimpleTable(doc, ["Ruta", "Origen → destino", "Tipo", "Riesgo", "Puntos críticos registrados"], routeRows.length ? routeRows : [["Sin rutas activas", "", "", "", ""]], {
    y,
    columnWidths: [94, 130, 65, 65, 188],
  });

  const contextRows = data.contextFactors.map((factor) => [
    factor.tipoFactor === "interno" ? "Interno" : "Externo",
    value(factor.nombre),
    value(factor.categoria),
    value(factor.descripcion),
    value(factor.impactoSeguridad),
  ]);
  const contextPages = contextRows.length
    ? Array.from({ length: Math.ceil(contextRows.length / 4) }, (_, index) => contextRows.slice(index * 4, index * 4 + 4))
    : [[["", "Sin factores de contexto activos", "", "", ""]]];
  contextPages.forEach((rows, index) => {
    doc.addPage();
    y = 55;
    y = addSectionBar(
      doc,
      `Información complementaria de contexto (${data.contextFactors.length} factores activos)${index > 0 ? " · continuación" : ""}`,
      y,
    );
    y = addSimpleTable(doc, ["Tipo", "Factor", "Categoría", "Descripción", "Impacto en seguridad vial"], rows, {
      y,
      columnWidths: [54, 110, 88, 150, 140],
    });
  });

  y = checkPageBreak(doc, 80, y);
  y = addSectionBar(doc, "Verificación documental pendiente", y);
  y = addParagraph(
    doc,
    `P03 requiere caracterización de la empresa, inventario actualizado de vehículos, base de conductores y diagnóstico de infraestructura vial (rutas y puntos críticos). Registros consultados: ${data.vehicles.length} vehículos, ${data.drivers.length} conductores, ${data.routes.length} rutas activas y ${data.routes.filter((route) => hasCriticalPointData(route.criticalPoints)).length} rutas con puntos críticos registrados. La cantidad de registros no verifica su vigencia ni sustituye la revisión técnica del diagnóstico.`,
    { y },
  );
  y = addParagraph(
    doc,
    "Documento generado a partir de los registros actuales del sistema. Debe ser revisado y validado por la empresa antes de radicarlo en SISI/PESV. No incluye firmas ni constituye aprobación.",
    { y, bold: true },
  );

  doc.end();
  return finished;
}
