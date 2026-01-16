/**
 * Sistema de Automatización para Gestión de Cambios SST
 * 
 * Este módulo implementa las automatizaciones que se disparan cuando un cambio
 * es aprobado completamente. Las automatizaciones crean registros automáticamente
 * en otros módulos del sistema SST para garantizar una gestión integral.
 * 
 * Integraciones implementadas:
 * - Matriz de Riesgos: Crear nuevos peligros derivados del cambio
 * - Plan Anual de Trabajo: Crear actividades de implementación y seguimiento
 * - Capacitaciones: Programar entrenamientos para personal afectado
 * - COPASST: Crear acta de solicitud de aprobación
 * - Matriz Legal: Actualizar requisitos normativos
 * - Políticas SST: Sugerir actualizaciones de políticas
 * - Indicadores SST: Crear indicadores de seguimiento del cambio
 * - Notificaciones: Alertar a stakeholders sobre el cambio aprobado
 */

import { storage } from "./storage";
import type { 
  CambioSst, 
  EvaluacionImpactoCambio,
  ControlCambio,
  InsertAutomatizacionCambioLog
} from "@shared/schema";

/**
 * Interfaz para el resultado de las automatizaciones
 */
interface AutomationResult {
  success: boolean;
  cambioId: string;
  automations: {
    riskMatrix: { created: number; ids: string[] };
    workPlan: { created: number; ids: string[] };
    trainings: { created: number; ids: string[] };
    copasst: { created: number; ids: string[] };
    legalMatrix: { updated: boolean; message: string };
    policies: { requiresUpdate: boolean; suggestions: string[] };
    indicators: { created: number; ids: string[] };
    notifications: { sent: number; recipients: string[] };
  };
  errors: string[];
}

/**
 * Helper function to log automation results
 */
async function logAutomation(
  cambioId: string,
  companyId: string,
  moduloDestino: InsertAutomatizacionCambioLog["moduloDestino"],
  estado: InsertAutomatizacionCambioLog["estado"],
  mensaje: string,
  registroDestinoId?: string
): Promise<void> {
  try {
    await storage.createAutomatizacionLog({
      cambioId,
      moduloDestino,
      estado,
      mensaje,
      registroDestinoId: registroDestinoId || null
    }, companyId);
  } catch (error: any) {
    console.error(`Error logging automation: ${error.message}`);
  }
}

/**
 * Helper to get current month as mesesEnum value
 */
function getCurrentMonth(): string {
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return months[new Date().getMonth()];
}

/**
 * Helper to get current trimester (1-4)
 */
function getCurrentTrimester(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

/**
 * Función principal de automatización
 * Se ejecuta cuando un cambio es completamente aprobado
 */
export async function processApprovedChange(
  cambioId: string,
  companyId: string,
  userId?: string
): Promise<AutomationResult> {
  const result: AutomationResult = {
    success: true,
    cambioId,
    automations: {
      riskMatrix: { created: 0, ids: [] },
      workPlan: { created: 0, ids: [] },
      trainings: { created: 0, ids: [] },
      copasst: { created: 0, ids: [] },
      legalMatrix: { updated: false, message: "" },
      policies: { requiresUpdate: false, suggestions: [] },
      indicators: { created: 0, ids: [] },
      notifications: { sent: 0, recipients: [] }
    },
    errors: []
  };

  try {
    // 1. Obtener información del cambio y sus evaluaciones
    const cambio = await storage.getCambioSst(cambioId, companyId);
    if (!cambio) {
      throw new Error("Cambio no encontrado");
    }

    const evaluaciones = await storage.getEvaluacionesImpactoCambio(cambioId, companyId);
    const controles = await storage.getControlesCambio(cambioId, companyId);

    // 2. Ejecutar automatizaciones según flags del cambio
    
    // 2.1 Crear entradas en Matriz de Riesgos (si requiereActualizacionMatrizRiesgos === 1)
    if (cambio.requiereActualizacionMatrizRiesgos === 1) {
      try {
        const riskResult = await createRiskMatrixEntries(cambio, evaluaciones, companyId);
        result.automations.riskMatrix = riskResult;
        await logAutomation(
          cambioId, companyId, "matriz_riesgos",
          riskResult.created > 0 ? "exito" : "pendiente",
          riskResult.created > 0 
            ? `Se crearon ${riskResult.created} registros de seguimiento de matriz de riesgos`
            : "Se marcó la necesidad de revisar la matriz de riesgos",
          riskResult.ids[0]
        );
      } catch (error: any) {
        result.errors.push(`Error en Matriz de Riesgos: ${error.message}`);
        await logAutomation(cambioId, companyId, "matriz_riesgos", "error", error.message);
      }
    }

    // 2.2 Crear actividades en Plan Anual de Trabajo (si requiereActualizacionPlanTrabajo === 1)
    if (cambio.requiereActualizacionPlanTrabajo === 1) {
      try {
        const workPlanResult = await createWorkPlanActivities(cambio, evaluaciones, controles, companyId);
        result.automations.workPlan = workPlanResult;
        await logAutomation(
          cambioId, companyId, "plan_trabajo",
          workPlanResult.created > 0 ? "exito" : "error",
          workPlanResult.created > 0 
            ? `Se crearon ${workPlanResult.created} actividades en el plan de trabajo`
            : "No se encontró plan de trabajo activo para el año actual",
          workPlanResult.ids[0]
        );
      } catch (error: any) {
        result.errors.push(`Error en Plan Anual: ${error.message}`);
        await logAutomation(cambioId, companyId, "plan_trabajo", "error", error.message);
      }
    }

    // 2.3 Programar capacitaciones (si requiereCapacitacion === 1)
    if (cambio.requiereCapacitacion === 1) {
      try {
        const trainingResult = await createTrainingEvents(cambio, companyId);
        result.automations.trainings = trainingResult;
        await logAutomation(
          cambioId, companyId, "capacitaciones",
          trainingResult.created > 0 ? "exito" : "error",
          trainingResult.created > 0 
            ? `Se programaron ${trainingResult.created} capacitaciones`
            : "No se encontró programa de capacitación activo",
          trainingResult.ids[0]
        );
      } catch (error: any) {
        result.errors.push(`Error en Capacitaciones: ${error.message}`);
        await logAutomation(cambioId, companyId, "capacitaciones", "error", error.message);
      }
    }

    // 2.4 Crear solicitud de aprobación COPASST (si requiereAprobacionCopasst === 1)
    if (cambio.requiereAprobacionCopasst === 1) {
      try {
        const copasstResult = await createCopasstApprovalRequest(cambio, evaluaciones, companyId);
        result.automations.copasst = copasstResult;
        await logAutomation(
          cambioId, companyId, "copasst",
          copasstResult.created > 0 ? "exito" : "error",
          copasstResult.created > 0 
            ? `Se creó acta de solicitud COPASST`
            : "Error creando acta COPASST",
          copasstResult.ids[0]
        );
      } catch (error: any) {
        result.errors.push(`Error en COPASST: ${error.message}`);
        await logAutomation(cambioId, companyId, "copasst", "error", error.message);
      }
    }

    // 2.5 Actualizar Matriz Legal
    try {
      const legalResult = await updateLegalMatrix(cambio, evaluaciones, companyId);
      result.automations.legalMatrix = legalResult;
      if (legalResult.updated) {
        await logAutomation(
          cambioId, companyId, "matriz_legal", "exito", legalResult.message
        );
      }
    } catch (error: any) {
      result.errors.push(`Error en Matriz Legal: ${error.message}`);
      await logAutomation(cambioId, companyId, "matriz_legal", "error", error.message);
    }

    // 2.6 Evaluar actualización de Políticas SST
    try {
      const policyResult = await evaluatePolicyUpdates(cambio, evaluaciones);
      result.automations.policies = policyResult;
      if (policyResult.requiresUpdate) {
        await logAutomation(
          cambioId, companyId, "politicas", "pendiente",
          `Se identificaron ${policyResult.suggestions.length} actualizaciones de políticas sugeridas`
        );
      }
    } catch (error: any) {
      result.errors.push(`Error en Políticas: ${error.message}`);
      await logAutomation(cambioId, companyId, "politicas", "error", error.message);
    }

    // 2.7 Crear indicadores de seguimiento
    if (cambio.requiereAprobacionCopasst === 1) {
      try {
        const indicatorResult = await createTrackingIndicators(cambio, companyId);
        result.automations.indicators = indicatorResult;
        await logAutomation(
          cambioId, companyId, "indicadores",
          indicatorResult.created > 0 ? "exito" : "error",
          indicatorResult.created > 0 
            ? `Se crearon ${indicatorResult.created} indicadores de seguimiento`
            : "No se crearon indicadores",
          indicatorResult.ids[0]
        );
      } catch (error: any) {
        result.errors.push(`Error en Indicadores: ${error.message}`);
        await logAutomation(cambioId, companyId, "indicadores", "error", error.message);
      }
    }

    // 2.8 Enviar notificaciones
    try {
      const notificationResult = await notifyStakeholders(cambio, companyId, userId);
      result.automations.notifications = notificationResult;
      await logAutomation(
        cambioId, companyId, "notificaciones",
        notificationResult.sent > 0 ? "exito" : "pendiente",
        `Notificaciones programadas para: ${notificationResult.recipients.join(", ")}`
      );
    } catch (error: any) {
      result.errors.push(`Error en Notificaciones: ${error.message}`);
      await logAutomation(cambioId, companyId, "notificaciones", "error", error.message);
    }

    // Marcar si hubo errores
    result.success = result.errors.length === 0;

    return result;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Error general: ${error.message}`);
    return result;
  }
}

/**
 * AUTOMATIZACIÓN 1: Matriz de Riesgos
 * Crea seguimiento para actualización de matriz cuando el cambio lo requiere
 */
async function createRiskMatrixEntries(
  cambio: CambioSst,
  evaluaciones: EvaluacionImpactoCambio[],
  companyId: string
): Promise<{ created: number; ids: string[] }> {
  const created: string[] = [];

  // Verificar si hay evaluaciones de alto impacto
  const tieneImpactoAlto = evaluaciones.some(e => 
    e.nivelRiesgoResultante === "alto" || 
    e.nivelRiesgoResultante === "muy_alto" ||
    e.nivelRiesgoResultante === "critico"
  );

  // Crear seguimiento documentando la necesidad de actualizar la matriz
  const peligrosIdentificados = evaluaciones
    .map(e => e.peligrosIdentificados)
    .filter(Boolean)
    .join("; ");

  const seguimientoText = `
AUTOMATIZACIÓN: Matriz de Riesgos
- Tipo de cambio: ${cambio.tipo} - ${cambio.categoria}
- Área afectada: ${cambio.areaAfectada || "No especificada"}
- Proceso afectado: ${cambio.procesoAfectado || "No especificado"}
- Trabajadores afectados: ${cambio.numeroTrabajadoresAfectados || 0}
- Evaluaciones de impacto: ${evaluaciones.length} realizadas
- Impacto alto detectado: ${tieneImpactoAlto ? "Sí" : "No"}
- Peligros identificados: ${peligrosIdentificados || "Ver evaluaciones de impacto"}
- Acción requerida: El coordinador SST debe revisar y actualizar la matriz de riesgos IPERC
`;

  const seguimiento = await storage.createSeguimientoCambio({
    cambioId: cambio.id,
    fechaSeguimiento: new Date(),
    responsable: "Sistema de Automatización SST",
    tipoSeguimiento: "automatico",
    hallazgos: seguimientoText,
    observaciones: "Seguimiento automático generado - Requiere actualización de Matriz de Riesgos",
    incidentesRelacionados: 0
  }, companyId);

  created.push(seguimiento.id);

  return { created: created.length, ids: created };
}

/**
 * AUTOMATIZACIÓN 2: Plan Anual de Trabajo
 * Crea actividades automáticamente para implementación del cambio
 */
async function createWorkPlanActivities(
  cambio: CambioSst,
  evaluaciones: EvaluacionImpactoCambio[],
  controles: ControlCambio[],
  companyId: string
): Promise<{ created: number; ids: string[] }> {
  const created: string[] = [];
  const currentYear = new Date().getFullYear();

  // Obtener planes de trabajo del año actual
  const planes = await storage.getPlanesTrabajoAnual(companyId);
  
  // Buscar plan del año actual, o cualquier plan activo como fallback
  let planActual = planes.find(p => p.anio === currentYear);
  
  // Si no hay plan del año actual, buscar cualquier plan con estado vigente o aprobado
  if (!planActual) {
    planActual = planes.find(p => p.estado === "vigente" || p.estado === "aprobado");
  }
  
  // Si aún no hay plan, buscar el más reciente
  if (!planActual && planes.length > 0) {
    planActual = planes.sort((a, b) => (b.anio || 0) - (a.anio || 0))[0];
  }

  if (!planActual) {
    console.log(`No hay plan de trabajo disponible, no se crean actividades automáticas`);
    return { created: 0, ids: [] };
  }
  
  console.log(`Usando plan de trabajo: ${planActual.titulo || 'Plan ' + planActual.anio} (Año: ${planActual.anio})`);

  // Crear actividad de implementación del cambio
  try {
    const actividadImplementacion = await storage.createActividadPlanTrabajo({
      planTrabajoId: planActual.id,
      programa: "mejora-continua",
      actividad: `Implementar cambio: ${cambio.titulo}`,
      objetivo: `Gestionar la implementación del cambio tipo ${cambio.tipo} - ${cambio.categoria}`,
      meta: "100% de implementación según cronograma",
      responsable: cambio.responsableImplementacion || "Por asignar",
      cargo: "Responsable de Implementación",
      mes: getCurrentMonth() as any,
      trimestre: getCurrentTrimester(),
      estado: "pendiente",
      recursosFinancieros: 0,
      observaciones: `Actividad generada automáticamente desde Gestión de Cambios (ID: ${cambio.id}). Área afectada: ${cambio.areaAfectada || "No especificada"}. Proceso: ${cambio.procesoAfectado || "No especificado"}.`
    }, companyId);

    created.push(actividadImplementacion.id);
  } catch (error: any) {
    console.error("Error creando actividad de implementación:", error);
  }

  // Crear actividad de seguimiento si hay controles definidos
  if (controles.length > 0) {
    try {
      const siguienteMes = new Date();
      siguienteMes.setMonth(siguienteMes.getMonth() + 1);
      const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      const mesProximo = meses[siguienteMes.getMonth()];
      const trimestreProximo = Math.floor(siguienteMes.getMonth() / 3) + 1;

      const actividadSeguimiento = await storage.createActividadPlanTrabajo({
        planTrabajoId: planActual.id,
        programa: "mejora-continua",
        actividad: `Verificar controles del cambio: ${cambio.titulo}`,
        objetivo: `Seguimiento de ${controles.length} controles implementados para el cambio`,
        meta: "100% de controles verificados como efectivos",
        responsable: "Coordinador SST",
        cargo: "Coordinador SST",
        mes: mesProximo as any,
        trimestre: trimestreProximo,
        estado: "pendiente",
        recursosFinancieros: 0,
        observaciones: `Seguimiento automático de controles del cambio ${cambio.id}. Controles a verificar: ${controles.map(c => c.descripcionControl).join("; ")}`
      }, companyId);

      created.push(actividadSeguimiento.id);
    } catch (error: any) {
      console.error("Error creando actividad de seguimiento:", error);
    }
  }

  return { created: created.length, ids: created };
}

/**
 * AUTOMATIZACIÓN 3: Capacitaciones
 * Programa capacitaciones para personal afectado por el cambio
 */
async function createTrainingEvents(
  cambio: CambioSst,
  companyId: string
): Promise<{ created: number; ids: string[] }> {
  const created: string[] = [];

  // Verificar si existe programa de capacitación anual
  const currentYear = new Date().getFullYear();
  const programas = await storage.getTrainingPrograms(companyId);
  const programaActual = programas.find((p: any) => p.year === currentYear);

  if (!programaActual) {
    console.log(`No hay programa de capacitación para ${currentYear}`);
    return { created: 0, ids: [] };
  }

  // Crear capacitación relacionada con el cambio
  try {
    const fechaCapacitacion = cambio.fechaImplementacionPlanificada 
      ? new Date(cambio.fechaImplementacionPlanificada)
      : new Date();
    
    // La capacitación debe ser antes de la implementación
    fechaCapacitacion.setDate(fechaCapacitacion.getDate() - 7);
    
    // Asegurar que la fecha no sea en el pasado
    if (fechaCapacitacion < new Date()) {
      fechaCapacitacion.setDate(new Date().getDate() + 7);
    }

    const capacitacion = await storage.createProgramTraining({
      programId: programaActual.id,
      topic: `Capacitación sobre cambio: ${cambio.titulo}`,
      description: `Preparar al personal para la implementación del cambio tipo ${cambio.tipo} - ${cambio.categoria}. Área afectada: ${cambio.areaAfectada || "No especificada"}. Proceso: ${cambio.procesoAfectado || "No especificado"}.`,
      trainingCategory: "gestion_cambio",
      scheduledDate: fechaCapacitacion,
      duration: 4,
      instructor: cambio.responsableImplementacion || "Por asignar",
      targetAudience: `Personal de ${cambio.areaAfectada || "áreas afectadas"} (${cambio.numeroTrabajadoresAfectados || 0} trabajadores)`,
      frequency: "unica",
      status: "programada",
      isObligatory: 1,
      observations: `Capacitación generada automáticamente desde Gestión de Cambios (ID: ${cambio.id})`
    }, companyId);

    created.push(capacitacion.id);
  } catch (error: any) {
    console.error("Error creando capacitación:", error);
  }

  return { created: created.length, ids: created };
}

/**
 * AUTOMATIZACIÓN 4: COPASST
 * Crea acta de solicitud de aprobación por el Comité COPASST
 */
async function createCopasstApprovalRequest(
  cambio: CambioSst,
  evaluaciones: EvaluacionImpactoCambio[],
  companyId: string
): Promise<{ created: number; ids: string[] }> {
  const created: string[] = [];

  try {
    // Preparar resumen de evaluaciones
    const resumenEvaluaciones = evaluaciones.map(e => 
      `- Nivel de riesgo: ${e.nivelRiesgoResultante}, Probabilidad: ${e.probabilidadOcurrencia}/5, Severidad: ${e.severidadConsecuencia}/5`
    ).join("\n");

    // Crear acta COPASST con tema de aprobación del cambio
    const fechaProxima = new Date();
    fechaProxima.setDate(fechaProxima.getDate() + 7); // Programar para la próxima semana

    const acta = await storage.createCopasstActa({
      fecha: fechaProxima.toISOString().split('T')[0],
      tipo: "ordinaria",
      numero: 0, // Se asignará automáticamente
      horaInicio: "08:00",
      horaFin: "10:00",
      lugar: "Sala de reuniones",
      notas: `SOLICITUD DE APROBACIÓN DE CAMBIO SST

CAMBIO: ${cambio.titulo}
CÓDIGO: ${cambio.codigo}

DETALLES:
- Tipo: ${cambio.tipo}
- Categoría: ${cambio.categoria}
- Área Afectada: ${cambio.areaAfectada || "No especificada"}
- Proceso Afectado: ${cambio.procesoAfectado || "No especificado"}
- Trabajadores Afectados: ${cambio.numeroTrabajadoresAfectados || 0}
- Fecha de Implementación Planificada: ${cambio.fechaImplementacionPlanificada || "Por definir"}
- Responsable: ${cambio.responsableImplementacion || "Por asignar"}

EVALUACIONES DE IMPACTO:
${resumenEvaluaciones || "No hay evaluaciones registradas"}

JUSTIFICACIÓN:
${cambio.justificacion || "Ver documentación del cambio"}

ACCIÓN REQUERIDA:
El Comité COPASST debe revisar y emitir concepto sobre este cambio según Decreto 1072/2015 Art. 2.2.4.6.26.`,
      temas: `APROBACIÓN DE CAMBIO SST: ${cambio.titulo}

DETALLES DEL CAMBIO:
- Tipo: ${cambio.tipo}
- Categoría: ${cambio.categoria}
- Área Afectada: ${cambio.areaAfectada || "No especificada"}
- Proceso Afectado: ${cambio.procesoAfectado || "No especificado"}
- Trabajadores Afectados: ${cambio.numeroTrabajadoresAfectados || 0}
- Fecha de Implementación Planificada: ${cambio.fechaImplementacionPlanificada || "Por definir"}
- Responsable: ${cambio.responsableImplementacion || "Por asignar"}

EVALUACIONES DE IMPACTO:
${resumenEvaluaciones || "No hay evaluaciones registradas"}

JUSTIFICACIÓN:
${cambio.justificacion || "Ver documentación del cambio"}

ACCIÓN REQUERIDA:
El Comité COPASST debe revisar y aprobar/rechazar este cambio según Decreto 1072/2015.`,
      acuerdos: `Pendiente de discusión en reunión COPASST.
Se requiere decisión sobre el cambio ID: ${cambio.id}`,
      observaciones: `Acta generada automáticamente por el Sistema de Gestión de Cambios SST.
Este cambio requiere aprobación del COPASST antes de su implementación.`,
      estado: "pendiente"
    }, companyId);

    created.push(acta.id);
  } catch (error: any) {
    console.error("Error creando acta COPASST:", error);
    throw error;
  }

  return { created: created.length, ids: created };
}

/**
 * AUTOMATIZACIÓN 5: Matriz Legal
 * Actualiza requisitos normativos si el cambio afecta cumplimiento legal
 */
async function updateLegalMatrix(
  cambio: CambioSst,
  evaluaciones: EvaluacionImpactoCambio[],
  companyId: string
): Promise<{ updated: boolean; message: string }> {
  
  // Determinar si el cambio afecta requisitos legales basándose en el tipo y categoría
  const tiposQuePuedenAfectarLegal = [
    "normativa",
    "proceso",
    "organizacional",
    "sustancias_quimicas"
  ];

  const afectaCumplimientoLegal = tiposQuePuedenAfectarLegal.includes(cambio.tipo) ||
    evaluaciones.some(e => 
      e.nivelRiesgoResultante === "alto" || 
      e.nivelRiesgoResultante === "muy_alto" ||
      e.nivelRiesgoResultante === "critico"
    );

  if (!afectaCumplimientoLegal) {
    return { 
      updated: false, 
      message: "El cambio no afecta requisitos legales" 
    };
  }

  // Obtener matriz legal
  const matrices = await storage.getMatrizLegal(companyId);
  
  if (matrices.length === 0) {
    return { 
      updated: false, 
      message: "No existe matriz legal para actualizar" 
    };
  }

  // Crear seguimiento indicando la necesidad de revisar la matriz legal
  await storage.createSeguimientoCambio({
    cambioId: cambio.id,
    fechaSeguimiento: new Date(),
    responsable: "Sistema de Automatización SST",
    tipoSeguimiento: "automatico",
    hallazgos: `Se identificó que el cambio "${cambio.titulo}" puede afectar el cumplimiento legal. Tipo: ${cambio.tipo}. Se recomienda revisar la matriz legal y actualizar requisitos normativos aplicables.`,
    observaciones: "Seguimiento automático - Revisión de Matriz Legal requerida",
    incidentesRelacionados: 0
  }, companyId);

  return { 
    updated: true, 
    message: `Se identificó que el cambio "${cambio.titulo}" puede afectar cumplimiento legal. Se recomienda revisar la matriz legal.` 
  };
}

/**
 * AUTOMATIZACIÓN 6: Políticas SST
 * Evalúa si el cambio requiere actualización de políticas
 */
async function evaluatePolicyUpdates(
  cambio: CambioSst,
  evaluaciones: EvaluacionImpactoCambio[]
): Promise<{ requiresUpdate: boolean; suggestions: string[] }> {
  const suggestions: string[] = [];

  // Cambios que típicamente requieren actualización de políticas
  const tiposQueAfectanPoliticas = [
    "organizacional",
    "proceso",
    "sustancias_quimicas",
    "normativa"
  ];

  const requiresUpdate = tiposQueAfectanPoliticas.includes(cambio.tipo);

  if (requiresUpdate) {
    suggestions.push(`Revisar y actualizar la Política SST considerando el cambio: ${cambio.titulo}`);
    
    if (cambio.tipo === "sustancias_quimicas") {
      suggestions.push("Actualizar la sección de gestión de sustancias químicas en las políticas");
    }
    
    if (cambio.tipo === "organizacional") {
      suggestions.push("Revisar responsabilidades y roles en la Política SST");
    }

    if (cambio.tipo === "proceso") {
      suggestions.push("Actualizar procedimientos documentados en el Sistema de Gestión");
    }
  }

  // Verificar impacto alto en evaluaciones
  const impactoAlto = evaluaciones.some(e => 
    e.nivelRiesgoResultante === "alto" || 
    e.nivelRiesgoResultante === "muy_alto" ||
    e.nivelRiesgoResultante === "critico"
  );

  if (impactoAlto) {
    suggestions.push("Revisar objetivos SST relacionados con los procesos afectados");
    suggestions.push("Considerar actualización del plan de emergencias si aplica");
  }

  return { requiresUpdate, suggestions };
}

/**
 * AUTOMATIZACIÓN 7: Indicadores SST
 * Crea indicadores de seguimiento del cambio
 */
async function createTrackingIndicators(
  cambio: CambioSst,
  companyId: string
): Promise<{ created: number; ids: string[] }> {
  const created: string[] = [];

  try {
    // Crear indicador de cumplimiento de implementación
    const indicador = await storage.createIndicadorSst({
      nombre: `Cumplimiento implementación: ${cambio.titulo}`,
      tipo: "proceso",
      definicion: `Verificar cumplimiento del plan de implementación del cambio tipo ${cambio.tipo} - ${cambio.categoria}`,
      interpretacion: "Porcentaje de actividades completadas según el cronograma del cambio. 100% indica implementación completa.",
      formula: "(Actividades completadas / Total actividades planificadas) × 100",
      fuenteInformacion: "Sistema de Gestión de Cambios SST - Módulo de Seguimiento",
      meta: "≥ 100%",
      valorMeta: 100,
      unidadMedida: "%",
      frecuenciaMedicion: "mensual",
      responsables: cambio.responsableImplementacion || "Coordinador SST"
    }, companyId);

    created.push(indicador.id);
  } catch (error: any) {
    console.error("Error creando indicador:", error);
  }

  return { created: created.length, ids: created };
}

/**
 * AUTOMATIZACIÓN 8: Notificaciones
 * Envía notificaciones a stakeholders sobre el cambio aprobado
 * Crea una comunicación real en el Portal de Empleados
 */
async function notifyStakeholders(
  cambio: CambioSst,
  companyId: string,
  userId?: string
): Promise<{ sent: number; recipients: string[] }> {
  const recipients: string[] = [];

  try {
    // Obtener todos los trabajadores de la empresa
    const workers = await storage.getWorkers(companyId);
    const workerIds = workers.map(w => w.id);
    
    // Obtener usuarios de la empresa para log
    const users = await storage.getUsersByCompany(companyId);
    const coordinadores = users.filter(u => u.role === "coordinador_sst");
    const altaDireccion = users.filter(u => u.role === "admin");

    // Agregar responsable de implementación si existe
    if (cambio.responsableImplementacion) {
      recipients.push(cambio.responsableImplementacion);
    }
    recipients.push(...coordinadores.map(u => u.username));
    recipients.push(...altaDireccion.map(u => u.username));

    console.log(`Notificaciones programadas para: ${recipients.join(", ")}`);
    console.log(`Cambio aprobado: ${cambio.titulo} (${cambio.id})`);

    // Crear comunicación SST real para el Portal de Empleados
    if (workerIds.length > 0) {
      const tipoLabel = cambio.tipo === "interno" ? "Interno" : "Externo";
      const categoriaLabel = cambio.categoria.charAt(0).toUpperCase() + cambio.categoria.slice(1).replace(/_/g, " ");
      
      // Determinar el userId para la comunicación (usar el que aprobó o buscar un admin/coordinador)
      let senderId = userId;
      if (!senderId) {
        const admins = users.filter(u => u.role === "admin" || u.role === "coordinador_sst");
        if (admins.length > 0) {
          senderId = admins[0].id;
        }
      }
      
      if (senderId) {
        const contenidoProfesional = [
          `Estimado(a) colaborador(a),`,
          ``,
          `Le informamos que se ha aprobado e implementado el siguiente cambio en el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST):`,
          ``,
          
          `INFORMACIÓN DEL CAMBIO`,
          
          ``,
          `Título: ${cambio.titulo || "No especificado"}`,
          `Tipo de cambio: ${tipoLabel}`,
          `Categoría: ${categoriaLabel}`,
          ``,
          cambio.descripcion ? `Descripción:\n${cambio.descripcion}` : "",
          ``,
          cambio.justificacion ? `Justificación:\n${cambio.justificacion}` : "",
          ``,
          
          `RESPONSABLE DE IMPLEMENTACIÓN`,
          
          ``,
          cambio.responsableImplementacion || "Por asignar",
          ``,
          
          ``,
          `Este cambio ha sido evaluado y aprobado conforme a los procedimientos establecidos en el Decreto 1072 de 2015, Artículo 2.2.4.6.26 (Gestión del cambio).`,
          ``,
          `Para cualquier consulta relacionada con este cambio, por favor comuníquese con el área de Seguridad y Salud en el Trabajo.`,
          ``,
          `Atentamente,`,
          `Sistema de Gestión SST`
        ].filter(line => line !== "" || true).join("\n");
        
        await storage.createComunicacionSst({
          tipo: "informativo",
          asunto: `Notificación de Cambio Aprobado - ${cambio.titulo || "SG-SST"}`,
          contenido: contenidoProfesional,
          publicoObjetivo: "todos",
          mediosUtilizados: ["aplicacion"],
          requiereConfirmacionLectura: 0,
          fechaEnvio: new Date()
        }, companyId, senderId, workerIds);
        
        console.log(`Comunicación SST creada para ${workerIds.length} trabajadores`);
      } else {
        console.warn("No se encontró usuario válido para enviar la comunicación SST");
      }
    }

    // Crear seguimiento de notificación
    await storage.createSeguimientoCambio({
      cambioId: cambio.id,
      fechaSeguimiento: new Date(),
      responsable: "Sistema de Automatización SST",
      tipoSeguimiento: "automatico",
      hallazgos: `Comunicación SST enviada a ${workerIds.length} trabajadores. Notificaciones a usuarios: ${recipients.join(", ")}`,
      observaciones: "Notificación automática de cambio aprobado - Portal de Empleados",
      incidentesRelacionados: 0
    }, companyId);

  } catch (error: any) {
    console.error("Error enviando notificaciones:", error);
  }

  return { sent: recipients.length, recipients };
}

/**
 * Verificar si un cambio está completamente aprobado
 */
export async function isChangeFullyApproved(
  cambioId: string,
  companyId: string
): Promise<boolean> {
  const cambio = await storage.getCambioSst(cambioId, companyId);
  if (!cambio) return false;

  const aprobaciones = await storage.getAprobacionesCambio(cambioId, companyId);
  
  // Si no hay aprobaciones, el cambio no está aprobado
  if (aprobaciones.length === 0) return false;
  
  // Obtener solo la aprobación MÁS RECIENTE por nivel
  const aprobacionesPorNivel = new Map<string, typeof aprobaciones[0]>();
  
  for (const aprobacion of aprobaciones) {
    const existing = aprobacionesPorNivel.get(aprobacion.nivelAprobacion);
    if (!existing || (aprobacion.fechaAprobacion && existing.fechaAprobacion && 
        new Date(aprobacion.fechaAprobacion) > new Date(existing.fechaAprobacion))) {
      aprobacionesPorNivel.set(aprobacion.nivelAprobacion, aprobacion);
    }
  }
  
  // Verificar si requiere aprobación COPASST
  const requiereCopasst = cambio.requiereAprobacionCopasst === 1;
  
  // Determinar niveles mínimos requeridos
  let nivelesNecesarios = ["coordinador_sst"];
  if (requiereCopasst) {
    nivelesNecesarios.push("copasst");
  }
  
  // Verificar que todos los niveles necesarios estén aprobados
  for (const nivel of nivelesNecesarios) {
    const aprobacion = aprobacionesPorNivel.get(nivel);
    if (!aprobacion) {
      return false; // Falta la aprobación de este nivel
    }
    if (aprobacion.estado === "rechazado") {
      return false; // El nivel más reciente está rechazado
    }
    if (aprobacion.estado !== "aprobado") {
      return false; // El nivel más reciente no está aprobado
    }
  }

  // Todos los niveles necesarios están aprobados
  return true;
}
