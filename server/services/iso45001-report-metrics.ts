import {
  ISO45001_REPORT_STRUCTURE,
  STANDARD_TO_ISO45001,
} from "@shared/iso45001-mapping";

export type Iso45001CompanyType = "tipo1" | "tipo2" | "tipo3" | "tipo4";

export interface Iso45001ReportStandard {
  id: string;
  numeroEstandar: string;
  nombre: string;
  puntajeTipo1: number | null;
  puntajeTipo2: number | null;
  puntajeTipo3: number | null;
  puntajeTipo4: number | null;
}

export interface Iso45001ReportResponse {
  id: string;
  estandarId: string;
  cumple: number;
  noAplica: number;
  puntajeObtenido: number;
  puntajeMaximo: number;
  updatedAt: Date | string | null;
}

export interface Iso45001ChapterMetrics {
  standardCount: number;
  compliantCount: number;
  scoreObtained: number;
  maxScore: number;
}

export interface Iso45001ReportMetrics {
  standards: Iso45001ReportStandard[];
  responsesByStandardId: Map<string, Iso45001ReportResponse>;
  chapterMetricsByChapter: Map<string, Iso45001ChapterMetrics>;
  scoreObtained: number;
  maxScore: number;
  percentage: number;
  answeredCount: number;
  unansweredCount: number;
  progressPercentage: number;
  isComplete: boolean;
}

function getRecordedStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    "en-progreso": "EN PROGRESO",
    completada: "COMPLETADA",
    aprobada: "APROBADA",
    rechazada: "RECHAZADA",
  };
  return labels[status] || String(status || "SIN ESTADO").toUpperCase();
}

export function getIso45001ReportStatusLabel(
  status: string,
  metrics: Iso45001ReportMetrics,
): string {
  if (metrics.isComplete) {
    return status === "aprobada" ? "EVALUACIÓN COMPLETA Y APROBADA" : "EVALUACIÓN COMPLETA";
  }
  if (status === "en-progreso") {
    return metrics.unansweredCount === 0
      ? "BORRADOR — EN PROGRESO; RESPUESTAS COMPLETAS, SIN FINALIZAR"
      : "BORRADOR — EN PROGRESO";
  }
  return `INCOMPLETA — ESTADO REGISTRADO: ${getRecordedStatusLabel(status)}`;
}

export function buildIso45001ReportDeclaration(
  companyName: string,
  year: string | number,
  status: string,
  metrics: Iso45001ReportMetrics,
): string {
  const points = `${metrics.scoreObtained.toFixed(1)} de ${metrics.maxScore.toFixed(1)} puntos (${metrics.percentage}%)`;
  if (metrics.isComplete) {
    return `La evaluación de los ${metrics.standards.length} estándares aplicables del SG-SST de ${companyName} se encuentra completa para el período ${year}, con un resultado registrado de ${points}. Este reporte presenta los datos registrados y su alineación con ISO 45001:2018; no constituye por sí mismo una certificación ni acredita la implementación integral del sistema.`;
  }
  if (status === "en-progreso" && metrics.unansweredCount === 0) {
    return `BORRADOR — Se respondieron los ${metrics.answeredCount} de ${metrics.standards.length} estándares aplicables, pero la evaluación conserva el estado EN PROGRESO y no ha sido finalizada. El resultado de ${points} no representa una evaluación final ni acredita la implementación o el cumplimiento integral del SG-SST.`;
  }
  if (status === "en-progreso") {
    return `BORRADOR — La evaluación del SG-SST de ${companyName} continúa EN PROGRESO: se respondieron ${metrics.answeredCount} de ${metrics.standards.length} estándares aplicables y faltan ${metrics.unansweredCount}. El resultado de ${points} es parcial; este documento no representa una evaluación final ni acredita la implementación o el cumplimiento integral del sistema.`;
  }
  return `INCOMPLETA — El estado registrado es ${getRecordedStatusLabel(status)}. Se respondieron ${metrics.answeredCount} de ${metrics.standards.length} estándares aplicables y faltan ${metrics.unansweredCount}. Este documento no se considera una evaluación final ni acredita la implementación o el cumplimiento integral del SG-SST.`;
}

export function getIso45001StandardMaximum(
  standard: Iso45001ReportStandard,
  companyType: Iso45001CompanyType,
): number {
  const scoreByType = {
    tipo1: standard.puntajeTipo1,
    tipo2: standard.puntajeTipo2,
    tipo3: standard.puntajeTipo3,
    tipo4: standard.puntajeTipo4,
  };
  const value = scoreByType[companyType];
  return value === null || value === undefined ? 0 : value;
}

function responseTimestamp(response: Iso45001ReportResponse): number {
  if (!response.updatedAt) return Number.NEGATIVE_INFINITY;
  const timestamp = new Date(response.updatedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

export function buildIso45001ReportMetrics(
  standards: Iso45001ReportStandard[],
  responses: Iso45001ReportResponse[],
  companyType: Iso45001CompanyType,
  evaluationStatus: string,
): Iso45001ReportMetrics {
  const standardsById = new Map<string, Iso45001ReportStandard>();
  for (const standard of standards) {
    if (!standardsById.has(standard.id)) standardsById.set(standard.id, standard);
  }
  const uniqueStandards = [...standardsById.values()];

  const responsesByStandardId = new Map<string, Iso45001ReportResponse>();
  for (const response of responses) {
    if (!standardsById.has(response.estandarId)) continue;
    const existing = responsesByStandardId.get(response.estandarId);
    if (!existing || responseTimestamp(response) >= responseTimestamp(existing)) {
      responsesByStandardId.set(response.estandarId, response);
    }
  }

  const maxScore = uniqueStandards.reduce(
    (total, standard) => total + getIso45001StandardMaximum(standard, companyType),
    0,
  );
  const scoreObtained = [...responsesByStandardId.values()].reduce(
    (total, response) => total + (Number(response.puntajeObtenido) || 0),
    0,
  );
  const answeredCount = responsesByStandardId.size;
  const totalStandards = uniqueStandards.length;
  const unansweredCount = Math.max(0, totalStandards - answeredCount);
  const percentage = maxScore > 0 ? Math.round((scoreObtained / maxScore) * 100) : 0;
  const progressPercentage = totalStandards > 0 ? (answeredCount / totalStandards) * 100 : 0;
  const isComplete =
    totalStandards > 0 &&
    answeredCount === totalStandards &&
    (evaluationStatus === "completada" || evaluationStatus === "aprobada");

  const chapterMetricsByChapter = new Map<string, Iso45001ChapterMetrics>();
  for (const chapter of ISO45001_REPORT_STRUCTURE) {
    const chapterStandards = uniqueStandards.filter(standard => {
      const clauses = STANDARD_TO_ISO45001[standard.numeroEstandar] || [];
      const firstReportChapter = ISO45001_REPORT_STRUCTURE.find(candidate =>
        candidate.clauses.some(clause => clauses.includes(clause)),
      );
      return firstReportChapter?.chapter === chapter.chapter;
    });

    let chapterScore = 0;
    let chapterMaxScore = 0;
    let compliantCount = 0;
    for (const standard of chapterStandards) {
      const maximum = getIso45001StandardMaximum(standard, companyType);
      chapterMaxScore += maximum;
      const response = responsesByStandardId.get(standard.id);
      if (response) {
        const obtained = Number(response.puntajeObtenido) || 0;
        chapterScore += obtained;
        if (response.cumple === 1 || response.noAplica === 1) compliantCount++;
      }
    }

    chapterMetricsByChapter.set(chapter.chapter, {
      standardCount: chapterStandards.length,
      compliantCount,
      scoreObtained: chapterScore,
      maxScore: chapterMaxScore,
    });
  }

  return {
    standards: uniqueStandards,
    responsesByStandardId,
    chapterMetricsByChapter,
    scoreObtained,
    maxScore,
    percentage,
    answeredCount,
    unansweredCount,
    progressPercentage,
    isComplete,
  };
}
