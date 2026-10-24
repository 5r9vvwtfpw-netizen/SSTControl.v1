import PDFDocument from "pdfkit";
import type {
  Company,
  PesvCriterioVerificacion,
  PesvEvidenciaDocumento,
  RespuestaPasoPesv,
  RiesgoVial,
  TratamientoRiesgoVial,
} from "@shared/schema";
import {
  addParagraph,
  addSectionBar,
  addSignatureFooter,
  addSimpleTable,
  addStandardHeader,
  checkPageBreak,
  type PdfSigners,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

type AnnualRiskControlPdfData = {
  company: Company;
  evaluation: { anio: number; mes: number | null; estado: string } | null;
  p04Response: Pick<RespuestaPasoPesv, "cumple" | "noAplica" | "evidencias" | "observaciones"> | null;
  criteria: PesvCriterioVerificacion[];
  documents: PesvEvidenciaDocumento[];
  risks: RiesgoVial[];
  treatments: TratamientoRiesgoVial[];
  signers: PdfSigners;
  isTestCompany: boolean;
  watermark?: boolean;
};

function value(input: string | number | null | undefined): string {
  if (input === null || input === undefined || String(input).trim() === "") return "Sin registro";
  return String(input).trim();
}

function responseStatus(response: AnnualRiskControlPdfData["p04Response"]): string {
  if (!response) return "Sin respuesta registrada";
  if (response.noAplica === 1) return "Marcado como no aplica";
  if (response.cumple === 1) return "Marcado como cumple en la evaluación";
  if (response.cumple === 0) return "Marcado como no cumple en la evaluación";
  return "Pendiente de valoración";
}

function hasTestMarker(data: AnnualRiskControlPdfData): boolean {
  const values = [
    data.p04Response?.evidencias,
    data.p04Response?.observaciones,
    ...data.criteria.flatMap((item) => [item.criterioTexto, item.observacion]),
    ...data.documents.flatMap((item) => [item.evidenciaTexto, item.archivoNombre, item.observacion]),
    ...data.risks.flatMap((risk) => [
      risk.codigo, risk.nombre, risk.descripcion, risk.observaciones, risk.controlesExistentes,
    ]),
    ...data.treatments.flatMap((treatment) => [
      treatment.descripcion, treatment.observaciones, treatment.resultadosObtenidos,
    ]),
  ];
  return data.isTestCompany || values.some((text) => /PRUEBA FUNCIONAL|ESCENARIO DE PRUEBA/i.test(text || ""));
}

function categoryLabel(category: string | null): string {
  const labels: Record<string, string> = {
    conductor: "Factor humano / conductor",
    vehiculo: "Vehículos",
    via: "Infraestructura vial",
    entorno: "Entorno",
    organizacional: "Organizacional",
  };
  return category ? labels[category] || category : "Sin registro";
}

function treatmentLabel(treatment: string | null): string {
  const labels: Record<string, string> = {
    evitar: "Evitar",
    reducir: "Reducir",
    compartir: "Compartir / transferir",
    aceptar: "Aceptar",
  };
  return treatment ? labels[treatment] || treatment : "Sin registro";
}

function readableDate(input: Date | string | null): string {
  if (!input) return "Sin registro";
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? String(input) : date.toLocaleDateString("es-CO", { timeZone: "America/Bogota" });
}

export async function buildPesvAnnualRiskControlPdfBuffer(data: AnnualRiskControlPdfData): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 35,
    size: "LETTER",
    bufferPages: true,
    info: {
      Title: "Evaluación y control de riesgos en seguridad vial",
      Author: "SST-Colombia",
      Subject: "SISI/PESV anual n.º 9 — P04",
    },
  });
  setupTrialWatermarkOnAllPages(doc, Boolean(data.watermark));
  const testScenario = hasTestMarker(data);
  const pageLabel = testScenario
    ? "PRUEBA FUNCIONAL — NO PRESENTAR COMO EVIDENCIA REAL"
    : `${data.company.name} · SISI/PESV · Evaluación y control de riesgos P04`;
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

  const activeRisks = data.risks.filter((risk) => risk.activo !== 0);
  const treatmentsByRisk = new Map<string, TratamientoRiesgoVial[]>();
  for (const treatment of data.treatments) {
    const existing = treatmentsByRisk.get(treatment.riesgoVialId) ?? [];
    existing.push(treatment);
    treatmentsByRisk.set(treatment.riesgoVialId, existing);
  }
  const activeRiskIds = new Set(activeRisks.map((risk) => risk.id));
  const activeTreatments = data.treatments.filter((treatment) => activeRiskIds.has(treatment.riesgoVialId));
  const implementedTreatments = activeTreatments.filter((treatment) =>
    treatment.estado.toLocaleLowerCase("es-CO") === "implementado"
    || (treatment.porcentajeAvance ?? 0) >= 100,
  );
  const uncoveredRisks = activeRisks.filter((risk) => !(treatmentsByRisk.get(risk.id)?.length));

  let y = await addStandardHeader({
    doc,
    company: data.company,
    documentTitle: "EVALUACIÓN Y CONTROL DE RIESGOS EN SEGURIDAD VIAL",
    documentCode: "SISI-PESV-ANUAL-09",
  });
  y = addParagraph(doc, "PESV P04 · Resolución 40595 de 2022, artículo 8 · Evidencia solicitada: copia en PDF.", {
    y,
    bold: true,
  });
  y = addParagraph(doc, `Fecha de generación: ${new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}`, { y });

  if (testScenario) {
    y = checkPageBreak(doc, 65, y);
    y = addSectionBar(doc, "ADVERTENCIA — DATOS DE PRUEBA", y);
    y = addParagraph(
      doc,
      "Este documento corresponde a DEMO-PRUEBA o contiene información marcada como prueba funcional. Sirve para revisar la generación y consolidación del informe; no representa evidencia real ni debe presentarse ante SISI/PESV.",
      { y },
    );
  }

  y = checkPageBreak(doc, 95, y);
  y = addSectionBar(doc, "Pregunta y estado de las fuentes", y);
  y = addSimpleTable(doc, ["Dato", "Registro consultado"], [
    ["Pregunta SISI/PESV", "¿Se tiene definido y aplicado un procedimiento de evaluación y control de riesgos en seguridad vial?"],
    ["Empresa", `${value(data.company.name)} · NIT ${value(data.company.nit)}`],
    ["Evaluación PESV", data.evaluation ? `${data.evaluation.anio} · ${value(data.evaluation.estado)}` : "No hay evaluación PESV registrada."],
    ["Valoración P04", responseStatus(data.p04Response)],
    ["Riesgos activos", String(activeRisks.length)],
    ["Riesgos activos sin tratamiento asociado", String(uncoveredRisks.length)],
    ["Tratamientos de riesgos activos", String(activeTreatments.length)],
    ["Tratamientos implementados o con avance registrado del 100 %", String(implementedTreatments.length)],
    ["Criterios P04 verificados", `${data.criteria.filter((item) => item.verificado === 1).length}/${data.criteria.length}`],
    ["Soportes documentales P04 con archivo", String(data.documents.filter((item) => Boolean(item.archivoUrl)).length)],
  ], { y, columnWidths: [220, 322] });
  y = addParagraph(
    doc,
    "La presencia de registros o una valoración positiva en P04 no prueba por sí sola que exista un procedimiento formal aprobado ni que todos los controles se hayan aplicado y evaluado. Este PDF presenta el estado registrado para revisión; no emite una declaración automática de cumplimiento.",
    { y },
  );
  if (data.p04Response?.evidencias?.trim()) {
    y = addParagraph(doc, `Descripción de evidencia P04: ${data.p04Response.evidencias.trim()}`, { y });
  }
  if (data.p04Response?.observaciones?.trim()) {
    y = addParagraph(doc, `Observaciones P04: ${data.p04Response.observaciones.trim()}`, { y });
  }

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, `1. Riesgos viales activos (${activeRisks.length})`, y);
  const riskRows = activeRisks.map((risk) => [
    value(risk.codigo),
    value(risk.nombre),
    categoryLabel(risk.categoria),
    `${value(risk.probabilidad)} × ${value(risk.impacto)} · ${value(risk.nivelRiesgo)}`,
    value(risk.controlesExistentes),
    `${value(risk.probabilidadResidual)} × ${value(risk.impactoResidual)} · ${value(risk.nivelRiesgoResidual)}`,
  ]);
  y = addSimpleTable(
    doc,
    ["Código", "Riesgo", "Línea / categoría registrada", "Valoración inicial", "Controles existentes", "Valoración residual"],
    riskRows.length ? riskRows : [["Sin riesgos activos registrados", "", "", "", "", ""]],
    { y, columnWidths: [48, 92, 92, 80, 112, 83] },
  );

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, `2. Tratamientos y seguimiento (${activeTreatments.length})`, y);
  const treatmentRows = activeTreatments.map((treatment) => {
    const risk = activeRisks.find((item) => item.id === treatment.riesgoVialId);
    return [
      risk ? `${value(risk.codigo)} · ${value(risk.nombre)}` : "Riesgo no activo",
      treatmentLabel(treatment.tipoTratamiento),
      value(treatment.descripcion),
      value(treatment.estado),
      `${treatment.porcentajeAvance ?? 0}%`,
      value(treatment.resultadosObtenidos),
      value(treatment.eficacia),
    ];
  });
  y = addSimpleTable(
    doc,
    ["Riesgo", "Tipo", "Medida registrada", "Estado", "Avance", "Resultado", "Eficacia"],
    treatmentRows.length ? treatmentRows : [["Sin tratamientos registrados para riesgos activos", "", "", "", "", "", ""]],
    { y, columnWidths: [87, 62, 112, 57, 42, 102, 45] },
  );

  const detailedRows = activeTreatments.map((treatment) => {
    const risk = activeRisks.find((item) => item.id === treatment.riesgoVialId);
    return [
      risk ? `${value(risk.codigo)} · ${value(risk.nombre)}` : "Riesgo no activo",
      value(treatment.accionesRequeridas),
      value(treatment.recursosNecesarios),
      value(treatment.responsableId),
      `${readableDate(treatment.fechaInicio)} – ${readableDate(treatment.fechaLimite)}`,
      readableDate(treatment.fechaImplementacion),
      value(treatment.observaciones),
    ];
  });
  if (detailedRows.length) {
    doc.addPage();
    y = 55;
    y = addSectionBar(doc, "Detalle de acciones, recursos y fechas", y);
    y = addSimpleTable(
      doc,
      ["Riesgo", "Acciones requeridas", "Recursos", "Responsable (registro)", "Inicio y límite", "Implementación", "Observaciones"],
      detailedRows,
      { y, columnWidths: [76, 105, 80, 68, 76, 62, 60] },
    );
  }

  doc.addPage();
  y = 55;
  y = addSectionBar(doc, `3. Verificación del paso P04 (${data.criteria.length} criterios)`, y);
  const criterionRows = data.criteria.map((item) => [
    item.criterioTexto,
    item.verificado === 1 ? "Verificado" : "Pendiente de verificación",
    value(item.verificadoNombre),
    readableDate(item.fechaVerificacion),
    value(item.observacion),
  ]);
  y = addSimpleTable(
    doc,
    ["Criterio registrado", "Estado", "Verificado por", "Fecha", "Observación"],
    criterionRows.length ? criterionRows : [["No hay criterios P04 verificados en la evaluación consultada", "", "", "", ""]],
    { y, columnWidths: [190, 100, 85, 70, 82] },
  );

  y = checkPageBreak(doc, 100, y);
  y = addSectionBar(doc, `4. Soportes documentales asociados a P04 (${data.documents.length})`, y);
  const documentRows = data.documents.map((item) => [
    item.evidenciaTexto,
    value(item.archivoNombre),
    item.archivoUrl ? "Archivo registrado" : "Sin archivo adjunto",
    readableDate(item.fechaSubida),
    value(item.observacion),
  ]);
  y = addSimpleTable(
    doc,
    ["Evidencia solicitada", "Archivo", "Disponibilidad", "Fecha de carga", "Observación"],
    documentRows.length ? documentRows : [["No hay soportes documentales P04 asociados a la evaluación consultada", "", "", "", ""]],
    { y, columnWidths: [150, 120, 90, 80, 87] },
  );

  y = checkPageBreak(doc, 110, y);
  y = addSectionBar(doc, "Alcance, verificación pendiente y trazabilidad", y);
  y = addParagraph(
    doc,
    `La matriz registra riesgos en las categorías disponibles del sistema. La cobertura de las cinco líneas de acción exigidas por P04 debe revisarse con los criterios y soportes documentales. La categoría “atención a víctimas” no se infiere de una categoría distinta de la matriz.`,
    { y },
  );
  y = addParagraph(
    doc,
    "La matriz y el seguimiento de tratamientos proceden de P04 → Matriz de Riesgos Viales. La valoración, los criterios verificados y los archivos asociados proceden de la evaluación PESV más reciente consultada. Revise su vigencia y correspondencia antes de presentar este PDF.",
    { y },
  );
  y = addParagraph(
    doc,
    "Los firmantes y las firmas gráficas se toman de la configuración de la empresa y de la asignación vigente del LSO.",
    { y, bold: true },
  );

  await addSignatureFooter(doc, data.signers, true);
  doc.end();
  return finished;
}
