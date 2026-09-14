/**
 * Deterministic, client-readable summary rules for the LSO report.
 *
 * This module deliberately knows nothing about Drizzle, PDFKit, or the
 * database.  Its input is the set of facts already collected by the report
 * query, so every sentence it creates can be checked against a source fact.
 */

export type SummaryPriority = "informativa" | "atencion" | "urgente";

export type LsoSummaryItem = {
  sourceLabel: string;
  count: number | null;
  fact: string;
  text: string;
  priority?: SummaryPriority;
};

export type LsoReportFacts = {
  sstEvaluation?: {
    exists: boolean;
    percentage?: number | null;
    nonCompliantAnswers?: number | null;
    pendingActions?: number | null;
    totalActions?: number | null;
  };
  pesvEvaluation?: {
    exists: boolean;
    percentage?: number | null;
    nonCompliantAnswers?: number | null;
    pendingActions?: number | null;
    totalActions?: number | null;
  };
  annualPlan?: {
    exists: boolean;
    activities?: number | null;
    completedActivities?: number | null;
    percentage?: number | null;
  };
  hazardIdentification?: {
    matrices: number | null;
  };
  investigations?: {
    total: number | null;
    overdue: number | null;
    missingSignatures: number | null;
    pendingActions?: number | null;
    totalActions?: number | null;
  };
  fleet?: {
    vehicles: number | null;
    drivers: number | null;
    expiredDocuments: number | null;
  };
  inspections?: {
    total: number | null;
    requiresReviewBeforeOperating: number | null;
  };
  pesvFindings?: {
    total: number | null;
    open: number | null;
  };
  roadIncidents?: {
    total: number | null;
    serious: number | null;
    fatalities: number | null;
  };
  moduleErrors?: string[];
};

export type LsoReportSummary = {
  overallStatus:
    | "Satisfactorio"
    | "Aceptable con asuntos pendientes"
    | "Requiere atención prioritaria";
  strengths: LsoSummaryItem[];
  attentionItems: LsoSummaryItem[];
  recommendations: {
    next30Days: LsoSummaryItem[];
    next60Days: LsoSummaryItem[];
    continuityNext90Days: LsoSummaryItem[];
  };
  handoverConcept: LsoSummaryItem;
  overallNarrative: string;
};

export function pluralizeSpanish(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/** Short PDF rendering; count and fact remain available in the structured result. */
export function formatLsoSummaryItemForPdf(entry: LsoSummaryItem): string {
  return `${entry.text} Origen: ${entry.sourceLabel}.`;
}

export function limitExecutiveItems<T>(items: T[], limit: number): T[] {
  return items.slice(0, Math.max(0, limit));
}

export type ExecutiveRecommendationGroup = {
  label: string;
  entries: LsoSummaryItem[];
};

export function groupRecommendationPeriods(
  recommendations: LsoReportSummary["recommendations"],
): ExecutiveRecommendationGroup[] {
  const groups: ExecutiveRecommendationGroup[] = [];
  for (const [label, entries] of [
    ["Próximos 30 días:", recommendations.next30Days],
    ["Próximos 60 días:", recommendations.next60Days],
    ["Continuidad próximos 90 días:", recommendations.continuityNext90Days],
  ] as const) {
    if (entries.length) groups.push({ label, entries });
  }
  return groups;
}

export function selectExecutiveRecommendationGroups(
  recommendations: LsoReportSummary["recommendations"],
  limit = 4,
): ExecutiveRecommendationGroup[] {
  let slots = Math.max(0, limit);
  return groupRecommendationPeriods(recommendations).flatMap(({ label, entries }) => {
    const visible = entries.slice(0, slots);
    slots -= visible.length;
    return visible.length ? [{ label, entries: visible }] : [];
  });
}

const known = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const readableValue = (value: unknown, empty = "sin información registrada") => {
  if (value === null || value === undefined || String(value).trim() === "") return empty;
  const words = String(value).replace(/_/g, " ").toLowerCase().trim().split(/\s+/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

/** Converts stored deadline values into language suitable for the client PDF. */
export function formatInvestigationDeadlineStatus(value: unknown): string {
  const status = String(value ?? "").trim().toLowerCase();
  if (status === "vencido") return "superó el plazo establecido";
  if (status === "en_tiempo") return "se encuentra dentro del plazo establecido";
  if (status === "proximo_vencer") return "se acerca al plazo establecido";
  if (status === "sin_fecha") return "no tiene un plazo establecido registrado";
  return status ? readableValue(status) : "no tiene un plazo establecido registrado";
}

/** Converts stored event type values without exposing snake_case to clients. */
export function formatInvestigationEventType(value: unknown): string {
  const status = String(value ?? "").trim().toLowerCase();
  const knownLabels: Record<string, string> = {
    accidente_trabajo: "accidente de trabajo",
    incidente: "incidente",
    enfermedad_laboral: "enfermedad laboral",
  };
  return knownLabels[status] || readableValue(status);
}

/** Converts stored workflow states without exposing raw status values. */
export function formatInvestigationStatus(value: unknown): string {
  const status = String(value ?? "").trim().toLowerCase();
  const knownLabels: Record<string, string> = {
    pendiente: "pendiente",
    pending: "pendiente",
    en_proceso: "en proceso",
    in_progress: "en proceso",
    completada: "completada",
    completado: "completado",
    completed: "completada",
    cerrada: "cerrada",
    cerrado: "cerrado",
    closed: "cerrada",
    abierta: "abierta",
    open: "abierta",
  };
  return knownLabels[status] || readableValue(status);
}

/** Describes action progress using the client-facing pending count. */
export function formatInvestigationActions(implemented: unknown, total: unknown): string {
  const implementedCount = Number(implemented);
  const totalCount = Number(total);
  if (!Number.isFinite(implementedCount) || !Number.isFinite(totalCount)) {
    return "No se encontró información registrada sobre las acciones";
  }
  const safeTotal = Math.max(totalCount, 0);
  if (safeTotal === 0) return "No se encontraron acciones registradas";
  const pending = Math.max(safeTotal - Math.max(implementedCount, 0), 0);
  return `tiene ${pending} ${pluralizeSpanish(pending, "acción pendiente", "acciones pendientes")} de ${safeTotal}`;
}

const item = (
  sourceLabel: string,
  count: number | null | undefined,
  fact: string,
  text: string,
  priority?: SummaryPriority,
): LsoSummaryItem => ({
  sourceLabel,
  count: known(count) ? count : null,
  fact,
  text,
  ...(priority ? { priority } : {}),
});

/**
 * Builds the short summary shown before the detailed modules.
 *
 * No item is made from a missing optional fact.  Missing evaluations are
 * explicit exceptions because their absence is itself a verified report
 * fact, and the resulting wording never says that the organisation failed.
 */
export function buildLsoManagementReportSummary(facts: LsoReportFacts): LsoReportSummary {
  const strengths: LsoSummaryItem[] = [];
  const attentionItems: LsoSummaryItem[] = [];
  const next30Days: LsoSummaryItem[] = [];
  const next60Days: LsoSummaryItem[] = [];
  const continuityNext90Days: LsoSummaryItem[] = [];

  const recommendationText = (sourceLabel: string, count: number | null | undefined, fact: string): string => {
    const quantity = (singular: string, plural: string) =>
      known(count) ? `${count} ${pluralizeSpanish(count, singular, plural)}` : plural;
    if (sourceLabel.startsWith("Acciones de mejora") || sourceLabel.startsWith("Acciones del Plan") || sourceLabel.startsWith("Acciones de investigaciones")) {
      const area = sourceLabel.includes("seguridad y salud") ? "de seguridad y salud en el trabajo" :
        sourceLabel.includes("investigaciones") ? "de investigaciones de accidentes" : "de seguridad vial";
      return `Definir responsables y fechas para ${quantity("acción pendiente", "acciones pendientes")} ${area}.`;
    }
    if (sourceLabel === "Plan anual de trabajo") {
      return `Priorizar ${quantity("actividad pendiente", "actividades pendientes")} del plan anual.`;
    }
    if (sourceLabel === "Investigaciones de accidentes") {
      return `Completar las acciones y registrar el avance de ${quantity("investigación", "investigaciones")} de accidentes.`;
    }
    if (sourceLabel === "Firmas de investigaciones de accidentes") {
      return `Completar las firmas pendientes de ${quantity("investigación", "investigaciones")} de accidentes.`;
    }
    if (sourceLabel === "Documentos de vehículos") {
      return `Actualizar los documentos vencidos de ${quantity("vehículo", "vehículos")} antes de operar.`;
    }
    if (sourceLabel === "Inspecciones de vehículos") {
      return `Inspeccionar ${quantity("vehículo señalado", "vehículos señalados")} antes de operar.`;
    }
    if (sourceLabel === "Hallazgos de auditorías de seguridad vial") {
      return `Cerrar ${quantity("hallazgo abierto", "hallazgos abiertos")} de la auditoría.`;
    }
    if (sourceLabel === "Siniestros viales") {
      return `Revisar los documentos y el seguimiento de ${quantity("siniestro vial", "siniestros viales")} registrado.`;
    }
    if (sourceLabel.startsWith("Evaluación de seguridad y salud") || sourceLabel.startsWith("Evaluación del Plan Estratégico")) {
      if (fact.startsWith("No se encontró información registrada")) {
        return "Registrar la evaluación correspondiente a la vigencia consultada.";
      }
      return known(count) ? `Revisar los criterios que sustentan el porcentaje registrado de ${count}%.` : "Revisar los criterios de la evaluación registrada.";
    }
    if (sourceLabel === "Identificación de peligros y valoración de riesgos") {
      return "Registrar una matriz para identificar peligros y valorar riesgos.";
    }
    return `Mantener actualizado el registro de ${sourceLabel.toLowerCase()}.`;
  };

  const addAttention = (
    sourceLabel: string,
    count: number | null | undefined,
    fact: string,
    text: string,
    priority: SummaryPriority = "atencion",
    days: 30 | 60 = priority === "urgente" ? 30 : 60,
  ) => {
    const attention = item(sourceLabel, count, fact, text, priority);
    attentionItems.push(attention);
    const recommendation = item(
      sourceLabel,
      count,
      fact,
      recommendationText(sourceLabel, count, fact),
      priority,
    );
    (days === 30 ? next30Days : next60Days).push(recommendation);
  };

  const sst = facts.sstEvaluation;
  if (!sst || sst.exists === false) {
    addAttention(
      "Evaluación de seguridad y salud en el trabajo",
      null,
      "No se encontró información registrada de una evaluación de seguridad y salud en el trabajo para la vigencia consultada.",
      "No se encontró información registrada de una evaluación de seguridad y salud en el trabajo para la vigencia consultada.",
      "atencion",
      60,
    );
  } else if (sst?.exists === true) {
    if (known(sst.percentage)) {
      if (sst.percentage >= 85) {
        strengths.push(item(
          "Evaluación de seguridad y salud en el trabajo",
          sst.percentage,
          `La evaluación de seguridad y salud en el trabajo registra ${sst.percentage}% de cumplimiento.`,
          `La evaluación de seguridad y salud en el trabajo registra ${sst.percentage}% de cumplimiento.`,
        ));
      } else {
        addAttention(
          "Evaluación de seguridad y salud en el trabajo",
          sst.percentage,
          `La evaluación de seguridad y salud en el trabajo registra ${sst.percentage}% de cumplimiento.`,
          `La evaluación de seguridad y salud en el trabajo registra ${sst.percentage}% de cumplimiento; requiere seguimiento.`,
          "atencion",
          60,
        );
      }
    }
    if (known(sst.nonCompliantAnswers) && sst.nonCompliantAnswers > 0) {
      addAttention(
        "Evaluación de seguridad y salud en el trabajo",
        sst.nonCompliantAnswers,
        `${sst.nonCompliantAnswers} ${pluralizeSpanish(sst.nonCompliantAnswers, "respuesta", "respuestas")} de la evaluación de seguridad y salud en el trabajo no cumplen.`,
        `La evaluación de seguridad y salud en el trabajo registra ${sst.nonCompliantAnswers} ${pluralizeSpanish(sst.nonCompliantAnswers, "respuesta que no cumple", "respuestas que no cumplen")}.`,
        "urgente",
        30,
      );
    }
    if (known(sst.pendingActions) && known(sst.totalActions) && sst.pendingActions > 0) {
      addAttention(
        "Acciones de mejora de seguridad y salud en el trabajo",
        sst.pendingActions,
        `Hay ${sst.pendingActions} ${pluralizeSpanish(sst.pendingActions, "acción pendiente", "acciones pendientes")} de ${sst.totalActions}.`,
        `Hay ${sst.pendingActions} ${pluralizeSpanish(sst.pendingActions, "acción pendiente", "acciones pendientes")} de ${sst.totalActions} en seguridad y salud en el trabajo.`,
        "urgente",
        30,
      );
    } else if (known(sst.pendingActions) && known(sst.totalActions) && sst.totalActions > 0 && sst.pendingActions === 0) {
      strengths.push(item(
        "Acciones de mejora de seguridad y salud en el trabajo",
        sst.totalActions,
        `Las ${sst.totalActions} ${pluralizeSpanish(sst.totalActions, "acción registrada", "acciones registradas")} no tienen pendientes.`,
        `Las ${sst.totalActions} ${pluralizeSpanish(sst.totalActions, "acción registrada", "acciones registradas")} de seguridad y salud en el trabajo no tienen pendientes.`,
      ));
    }
  }

  const pesv = facts.pesvEvaluation;
  if (!pesv || pesv.exists === false) {
    addAttention(
      "Evaluación del Plan Estratégico de Seguridad Vial",
      null,
      "No se encontró información registrada de una evaluación del Plan Estratégico de Seguridad Vial para la vigencia consultada.",
      "No se encontró información registrada de una evaluación del Plan Estratégico de Seguridad Vial para la vigencia consultada.",
      "atencion",
      60,
    );
  } else if (pesv?.exists === true) {
    if (known(pesv.percentage)) {
      if (pesv.percentage >= 85) {
        strengths.push(item(
          "Evaluación del Plan Estratégico de Seguridad Vial",
          pesv.percentage,
          `La evaluación del Plan Estratégico de Seguridad Vial registra ${pesv.percentage}% de cumplimiento.`,
          `La evaluación del Plan Estratégico de Seguridad Vial registra ${pesv.percentage}% de cumplimiento.`,
        ));
      } else {
        addAttention(
          "Evaluación del Plan Estratégico de Seguridad Vial",
          pesv.percentage,
          `La evaluación del Plan Estratégico de Seguridad Vial registra ${pesv.percentage}% de cumplimiento.`,
          `La evaluación del Plan Estratégico de Seguridad Vial registra ${pesv.percentage}% de cumplimiento; requiere seguimiento.`,
          "atencion",
          60,
        );
      }
    }
    if (known(pesv.nonCompliantAnswers) && pesv.nonCompliantAnswers > 0) {
      addAttention(
        "Evaluación del Plan Estratégico de Seguridad Vial",
        pesv.nonCompliantAnswers,
        `${pesv.nonCompliantAnswers} ${pluralizeSpanish(pesv.nonCompliantAnswers, "respuesta", "respuestas")} de la evaluación del Plan Estratégico de Seguridad Vial no cumplen.`,
        `La evaluación del Plan Estratégico de Seguridad Vial registra ${pesv.nonCompliantAnswers} ${pluralizeSpanish(pesv.nonCompliantAnswers, "respuesta que no cumple", "respuestas que no cumplen")}.`,
        "urgente",
        30,
      );
    }
    if (known(pesv.pendingActions) && known(pesv.totalActions) && pesv.pendingActions > 0) {
      addAttention(
        "Acciones del Plan Estratégico de Seguridad Vial",
        pesv.pendingActions,
        `Hay ${pesv.pendingActions} ${pluralizeSpanish(pesv.pendingActions, "acción pendiente", "acciones pendientes")} de ${pesv.totalActions}.`,
        `Hay ${pesv.pendingActions} ${pluralizeSpanish(pesv.pendingActions, "acción pendiente", "acciones pendientes")} de ${pesv.totalActions} en seguridad vial.`,
        "urgente",
        30,
      );
    } else if (known(pesv.pendingActions) && known(pesv.totalActions) && pesv.totalActions > 0 && pesv.pendingActions === 0) {
      strengths.push(item(
        "Acciones del Plan Estratégico de Seguridad Vial",
        pesv.totalActions,
        `Las ${pesv.totalActions} ${pluralizeSpanish(pesv.totalActions, "acción registrada", "acciones registradas")} no tienen pendientes.`,
        `Las ${pesv.totalActions} ${pluralizeSpanish(pesv.totalActions, "acción registrada", "acciones registradas")} de seguridad vial no tienen pendientes.`,
      ));
    }
  }

  const plan = facts.annualPlan;
  if (plan?.exists === false) {
    addAttention(
      "Plan anual de trabajo",
      null,
      "No se encontró información registrada de un plan anual de trabajo para la vigencia consultada.",
      "No se encontró información registrada de un plan anual de trabajo para la vigencia consultada.",
    );
  } else if (plan?.exists === true) {
    if (known(plan.activities) && known(plan.completedActivities)) {
      if (plan.activities > 0 && plan.completedActivities === plan.activities) {
        strengths.push(item(
          "Plan anual de trabajo",
          plan.activities,
          `El plan registra ${plan.activities} ${pluralizeSpanish(plan.activities, "actividad", "actividades")} y ${plan.completedActivities} ${pluralizeSpanish(plan.completedActivities, "actividad completada", "actividades completadas")}.`,
          `El plan anual de trabajo registra ${plan.activities} ${pluralizeSpanish(plan.activities, "actividad", "actividades")} y ${plan.completedActivities} ${pluralizeSpanish(plan.completedActivities, "actividad completada", "actividades completadas")}.`,
        ));
      } else if (plan.completedActivities < plan.activities) {
        addAttention(
          "Plan anual de trabajo",
          plan.activities - plan.completedActivities,
          `El plan registra ${plan.activities - plan.completedActivities} ${pluralizeSpanish(plan.activities - plan.completedActivities, "actividad pendiente", "actividades pendientes")} de ${plan.activities}.`,
          `El plan anual de trabajo tiene ${plan.activities - plan.completedActivities} ${pluralizeSpanish(plan.activities - plan.completedActivities, "actividad pendiente", "actividades pendientes")} de ${plan.activities}.`,
        );
      }
    }
  }

  const hazardMatrices = facts.hazardIdentification?.matrices;
  if (known(hazardMatrices) && hazardMatrices > 0) {
    strengths.push(item(
      "Identificación de peligros y valoración de riesgos",
      hazardMatrices,
      `Hay ${hazardMatrices} ${pluralizeSpanish(hazardMatrices, "matriz registrada", "matrices registradas")}.`,
      `Hay ${hazardMatrices} ${pluralizeSpanish(hazardMatrices, "matriz registrada", "matrices registradas")} para identificar peligros y valorar riesgos.`,
    ));
  } else if (hazardMatrices === 0) {
    addAttention(
      "Identificación de peligros y valoración de riesgos",
      0,
      "No se encontró información registrada de una matriz para identificar peligros y valorar riesgos.",
      "No se encontró información registrada de una matriz para identificar peligros y valorar riesgos.",
    );
  }

  const investigations = facts.investigations;
  if (investigations && known(investigations.total)) {
    if (investigations.total > 0 && known(investigations.overdue) && investigations.overdue === 0) {
      strengths.push(item(
        "Investigaciones de accidentes",
        investigations.total,
        `Hay ${investigations.total} ${pluralizeSpanish(investigations.total, "investigación registrada", "investigaciones registradas")} y ninguna superó el plazo establecido.`,
        `Hay ${investigations.total} ${pluralizeSpanish(investigations.total, "investigación de accidentes registrada", "investigaciones de accidentes registradas")} y ninguna superó el plazo establecido.`,
      ));
    }
    if (known(investigations.overdue) && investigations.overdue > 0) {
      addAttention(
        "Investigaciones de accidentes",
        investigations.overdue,
        `${investigations.overdue} ${pluralizeSpanish(investigations.overdue, "investigación superó", "investigaciones superaron")} el plazo establecido.`,
        `${investigations.overdue} ${pluralizeSpanish(investigations.overdue, "investigación de accidentes superó", "investigaciones de accidentes superaron")} el plazo establecido.`,
        "urgente",
        30,
      );
    }
    if (known(investigations.missingSignatures) && investigations.missingSignatures > 0) {
      addAttention(
        "Firmas de investigaciones de accidentes",
        investigations.missingSignatures,
        `Hay ${investigations.missingSignatures} ${pluralizeSpanish(investigations.missingSignatures, "investigación sin firma registrada", "investigaciones sin firma registrada")}.`,
        `Hay ${investigations.missingSignatures} ${pluralizeSpanish(investigations.missingSignatures, "investigación de accidentes sin firma registrada", "investigaciones de accidentes sin firma registrada")}.`,
        "atencion",
        60,
      );
    }
    if (known(investigations.pendingActions) && known(investigations.totalActions) && investigations.pendingActions > 0) {
      addAttention(
        "Acciones de investigaciones de accidentes",
        investigations.pendingActions,
        `Hay ${investigations.pendingActions} ${pluralizeSpanish(investigations.pendingActions, "acción pendiente", "acciones pendientes")} de ${investigations.totalActions}.`,
        `Hay ${investigations.pendingActions} ${pluralizeSpanish(investigations.pendingActions, "acción pendiente", "acciones pendientes")} de ${investigations.totalActions} en investigaciones de accidentes.`,
      );
    }
  }

  const fleet = facts.fleet;
  if (fleet && known(fleet.vehicles)) {
    if (fleet.vehicles > 0 && known(fleet.expiredDocuments) && fleet.expiredDocuments === 0) {
      strengths.push(item(
        "Documentos de vehículos",
        fleet.vehicles,
        `Hay ${fleet.vehicles} ${pluralizeSpanish(fleet.vehicles, "vehículo", "vehículos")} y ningún documento vencido registrado.`,
        `Hay ${fleet.vehicles} ${pluralizeSpanish(fleet.vehicles, "vehículo", "vehículos")} y ningún documento vencido registrado.`,
      ));
    }
    if (known(fleet.expiredDocuments) && fleet.expiredDocuments > 0) {
      addAttention(
        "Documentos de vehículos",
        fleet.expiredDocuments,
        `Hay ${fleet.expiredDocuments} ${pluralizeSpanish(fleet.expiredDocuments, "vehículo", "vehículos")} con algún documento vencido.`,
        `Hay ${fleet.expiredDocuments} ${pluralizeSpanish(fleet.expiredDocuments, "vehículo", "vehículos")} con algún documento vencido; requieren revisión antes de operar.`,
        "urgente",
        30,
      );
    }
  }

  const inspections = facts.inspections;
  if (inspections && known(inspections.requiresReviewBeforeOperating) && inspections.requiresReviewBeforeOperating > 0) {
    addAttention(
      "Inspecciones de vehículos",
      inspections.requiresReviewBeforeOperating,
      `${inspections.requiresReviewBeforeOperating} ${pluralizeSpanish(inspections.requiresReviewBeforeOperating, "inspección registra un vehículo que requiere", "inspecciones registran vehículos que requieren")} revisión antes de operar.`,
      `${inspections.requiresReviewBeforeOperating} ${pluralizeSpanish(inspections.requiresReviewBeforeOperating, "inspección de vehículos requiere", "inspecciones de vehículos requieren")} revisión antes de operar.`,
      "urgente",
      30,
    );
  } else if (inspections && known(inspections.total) && inspections.total > 0 && inspections.requiresReviewBeforeOperating === 0) {
    strengths.push(item(
      "Inspecciones de vehículos",
      inspections.total,
      `Hay ${inspections.total} ${pluralizeSpanish(inspections.total, "inspección registrada", "inspecciones registradas")} sin vehículos que requieran revisión antes de operar.`,
      `Hay ${inspections.total} ${pluralizeSpanish(inspections.total, "inspección de vehículos registrada", "inspecciones de vehículos registradas")} y ninguna indica revisión antes de operar.`,
    ));
  }

  const findings = facts.pesvFindings;
  const findingsTotalLabel = findings && known(findings.total)
    ? `${findings.total} ${pluralizeSpanish(findings.total, "hallazgo registrado", "hallazgos registrados")}`
    : "un total no registrado";
  if (findings && known(findings.open) && findings.open > 0) {
    addAttention(
      "Hallazgos de auditorías de seguridad vial",
      findings.open,
      `Hay ${findings.open} ${pluralizeSpanish(findings.open, "hallazgo abierto", "hallazgos abiertos")}; total registrado: ${findingsTotalLabel}.`,
      `Hay ${findings.open} ${pluralizeSpanish(findings.open, "hallazgo abierto", "hallazgos abiertos")}; total registrado: ${findingsTotalLabel} en auditorías de seguridad vial.`,
      "urgente",
      30,
    );
  } else if (findings && known(findings.total) && findings.total > 0 && findings.open === 0) {
    strengths.push(item(
      "Hallazgos de auditorías de seguridad vial",
      findings.total,
      `Hay ${findings.total} ${pluralizeSpanish(findings.total, "hallazgo registrado", "hallazgos registrados")} y ninguno está abierto.`,
      `Hay ${findings.total} ${pluralizeSpanish(findings.total, "hallazgo registrado", "hallazgos registrados")} en auditorías de seguridad vial y ninguno está abierto.`,
    ));
  }

  const incidents = facts.roadIncidents;
  if (incidents && known(incidents.total) && incidents.total > 0) {
    addAttention(
      "Siniestros viales",
      incidents.total,
      `Hay ${incidents.total} ${pluralizeSpanish(incidents.total, "siniestro vial registrado", "siniestros viales registrados")}.`,
      `Hay ${incidents.total} ${pluralizeSpanish(incidents.total, "siniestro vial registrado", "siniestros viales registrados")}; revisar sus documentos de respaldo y seguimientos.`,
      "atencion",
      60,
    );
  }

  // Keep the list useful on a client-facing first page without hiding facts.
  strengths.splice(5);

  if (strengths.length > 0) {
    const source = strengths[0];
    continuityNext90Days.push(item(
      source.sourceLabel,
      source.count,
      source.fact,
      `Mantener la revisión periódica de ${source.sourceLabel.toLowerCase()} con base en el registro disponible: ${source.fact}`,
      "informativa",
    ));
  }

  const hasUrgent = attentionItems.some((entry) => entry.priority === "urgente");
  const overallStatus = hasUrgent
    ? "Requiere atención prioritaria"
    : attentionItems.length > 0
      ? "Aceptable con asuntos pendientes"
      : "Satisfactorio";

  const strongest = strengths[0];
  const priorityCategories = [...new Set(
    [...attentionItems]
      .sort((left, right) => (left.priority === "urgente" ? 0 : 1) - (right.priority === "urgente" ? 0 : 1))
      .map((entry) => entry.sourceLabel.toLowerCase()),
  )].slice(0, 2);
  const strongestMessage = strongest?.text.replace(/[.]+$/, "") || "";
  const favorableNarrative = strongest
    ? `Según los registros disponibles, ${strongestMessage.toLowerCase()}`
    : "Según los registros disponibles, no se identificó una fortaleza suficiente para describir un resultado favorable";
  const attentionNarrative = attentionItems.length > 0
    ? ` La empresa requiere atención por ${attentionItems.length} ${pluralizeSpanish(attentionItems.length, "asunto", "asuntos")} registrados. Los principales se relacionan con ${priorityCategories.join(" y ")}.`
    : " La empresa no registra asuntos pendientes.";
  const overallNarrative = `${favorableNarrative}.${attentionNarrative}`;

  const handoverFact = attentionItems.length > 0
    ? `${attentionItems.length} ${pluralizeSpanish(attentionItems.length, "asunto requiere", "asuntos requieren")} seguimiento; ${strengths.length} ${pluralizeSpanish(strengths.length, "fortaleza fue identificada", "fortalezas fueron identificadas")} según los registros disponibles.`
    : `${strengths.length} ${pluralizeSpanish(strengths.length, "fortaleza fue identificada", "fortalezas fueron identificadas")} y no se registran asuntos pendientes según los registros disponibles.`;
  const handoverConcept = item(
    "Resumen de la entrega",
    attentionItems.length,
    handoverFact,
    attentionItems.length > 0
      ? `La entrega deja ${attentionItems.length} ${pluralizeSpanish(attentionItems.length, "asunto", "asuntos")} para seguimiento y ${strengths.length} ${pluralizeSpanish(strengths.length, "fortaleza identificada", "fortalezas identificadas")} según los registros disponibles.`
      : `La entrega deja ${strengths.length} ${pluralizeSpanish(strengths.length, "fortaleza identificada", "fortalezas identificadas")} y no registra asuntos pendientes según los registros disponibles.`,
  );

  return {
    overallStatus,
    overallNarrative,
    strengths,
    attentionItems,
    recommendations: { next30Days, next60Days, continuityNext90Days },
    handoverConcept,
  };
}
