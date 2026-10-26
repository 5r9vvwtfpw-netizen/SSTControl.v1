import XLSX from "xlsx-js-style";
import type * as schema from "@shared/schema";

type Company = Pick<typeof schema.companies.$inferSelect, "name" | "nit">;
type RiskRow = typeof schema.riesgosViales.$inferSelect & { responsableName: string | null };
type TreatmentRow = typeof schema.tratamientosRiesgoVial.$inferSelect & { responsableName: string | null };

function excelValue(value: unknown): string | number {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") return value;
  return String(value);
}

function createDataSheet<T extends object>(
  rows: T[],
  columns: Array<[string, (row: T) => unknown]>,
) {
  const sheet = XLSX.utils.aoa_to_sheet([
    columns.map(([header]) => header),
    ...rows.map((row) => columns.map(([, value]) => excelValue(value(row)))),
  ]);
  sheet["!cols"] = columns.map(([header]) => ({ wch: Math.min(Math.max(header.length + 3, 16), 38) }));
  sheet["!autofilter"] = { ref: XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: Math.max(rows.length, 1), c: columns.length - 1 },
  }) };
  return sheet;
}

export function buildPesvAnnualRiskMatrixExcelBuffer(input: {
  company: Company;
  risks: RiskRow[];
  treatments: TreatmentRow[];
  isTestCompany: boolean;
}): Buffer {
  const { company, risks, treatments, isTestCompany } = input;
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Matriz de riesgos de seguridad vial",
    Subject: "Copia de la matriz fuente P04",
    Author: "SST Colombia",
  };

  const activeRisks = risks.filter((risk) => risk.activo !== 0);
  const info = XLSX.utils.aoa_to_sheet([
    ["INFORME ANUAL SISI/PESV · 10"],
    ["Pregunta", "¿Posee matriz de riesgos de seguridad vial, de acuerdo con la operación de la organización?"],
    ["Evidencia solicitada", "Copia en archivo Excel"],
    ["Empresa", company.name],
    ["NIT", company.nit || ""],
    ["Generado el", new Date().toISOString()],
    ["Riesgos activos", activeRisks.length],
    ["Riesgos inactivos / históricos", risks.length - activeRisks.length],
    ["Tratamientos registrados", treatments.length],
    ["Fuente", "Matriz de Riesgos Viales · PESV P04"],
    ["Alcance", "Copia de los registros existentes; no valida por sí sola que la matriz corresponda a toda la operación ni acredita cumplimiento."],
    ...(isTestCompany ? [["Aviso", "DATOS DE DEMO-PRUEBA: archivo generado para prueba funcional; no presentar como evidencia real."]] : []),
  ]);
  info["!cols"] = [{ wch: 30 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(workbook, info, "Información");

  const riskColumns: Array<[string, (row: RiskRow) => unknown]> = [
    ["ID", (row) => row.id],
    ["Código", (row) => row.codigo],
    ["Nombre", (row) => row.nombre],
    ["Descripción", (row) => row.descripcion],
    ["Categoría", (row) => row.categoria],
    ["Fuente del riesgo", (row) => row.fuenteRiesgo],
    ["Causas raíz", (row) => row.causasRaiz],
    ["Consecuencias", (row) => row.consecuencias],
    ["Probabilidad inherente", (row) => row.probabilidad],
    ["Impacto inherente", (row) => row.impacto],
    ["Valor del riesgo", (row) => row.valorRiesgo],
    ["Nivel del riesgo", (row) => row.nivelRiesgo],
    ["Probabilidad residual", (row) => row.probabilidadResidual],
    ["Impacto residual", (row) => row.impactoResidual],
    ["Valor residual", (row) => row.valorRiesgoResidual],
    ["Nivel residual", (row) => row.nivelRiesgoResidual],
    ["Controles existentes", (row) => row.controlesExistentes],
    ["Eficacia de controles", (row) => row.eficaciaControles],
    ["Estado", (row) => row.estado],
    ["Responsable", (row) => row.responsableName],
    ["Fecha de identificación", (row) => row.fechaIdentificacion],
    ["Última evaluación", (row) => row.fechaUltimaEvaluacion],
    ["Próxima revisión", (row) => row.fechaProximaRevision],
    ["Paso PESV relacionado", (row) => row.pasoPesvRelacionado],
    ["Accidente relacionado", (row) => row.accidenteRelacionadoId],
    ["Inspección relacionada", (row) => row.inspeccionRelacionadaId],
    ["Observaciones", (row) => row.observaciones],
    ["Activo", (row) => row.activo === 0 ? "No" : "Sí"],
    ["Creado el", (row) => row.createdAt],
    ["Actualizado el", (row) => row.updatedAt],
  ];
  XLSX.utils.book_append_sheet(workbook, createDataSheet(risks, riskColumns), "Matriz de riesgos");

  const treatmentColumns: Array<[string, (row: TreatmentRow) => unknown]> = [
    ["ID", (row) => row.id],
    ["ID del riesgo", (row) => row.riesgoVialId],
    ["Tipo de tratamiento", (row) => row.tipoTratamiento],
    ["Descripción", (row) => row.descripcion],
    ["Justificación", (row) => row.justificacion],
    ["Acciones requeridas", (row) => row.accionesRequeridas],
    ["Recursos necesarios", (row) => row.recursosNecesarios],
    ["Presupuesto estimado", (row) => row.presupuestoEstimado],
    ["Responsable", (row) => row.responsableName],
    ["Fecha de inicio", (row) => row.fechaInicio],
    ["Fecha límite", (row) => row.fechaLimite],
    ["Fecha de implementación", (row) => row.fechaImplementacion],
    ["Estado", (row) => row.estado],
    ["Porcentaje de avance", (row) => row.porcentajeAvance],
    ["Resultados obtenidos", (row) => row.resultadosObtenidos],
    ["Reducción de probabilidad", (row) => row.reduccionProbabilidad],
    ["Reducción de impacto", (row) => row.reduccionImpacto],
    ["Eficacia", (row) => row.eficacia],
    ["Acción de mejora PESV", (row) => row.accionMejoraPesvId],
    ["Observaciones", (row) => row.observaciones],
    ["Creado el", (row) => row.createdAt],
    ["Actualizado el", (row) => row.updatedAt],
  ];
  XLSX.utils.book_append_sheet(workbook, createDataSheet(treatments, treatmentColumns), "Tratamientos");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
