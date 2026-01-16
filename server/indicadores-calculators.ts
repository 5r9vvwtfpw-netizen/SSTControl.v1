import { storage } from "./storage";
import type { Worker, Training, Inspection, Accident, OccupationalDisease, MedicalExam, PreventiveMeasure } from "@shared/schema";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CalculationResult {
  valorCalculado: number;
  detallesCalculo: Record<string, any>;
}

function safeDiv(numerator: number, denominator: number): number {
  if (denominator === 0 || !Number.isFinite(denominator)) return 0;
  const result = numerator / denominator;
  return Number.isFinite(result) ? Math.round(result * 100) / 100 : 0;
}

function isInDateRange(dateStr: string | Date | null | undefined, range: DateRange): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date >= range.startDate && date <= range.endDate;
}

export function parsePeriodoToDateRange(periodo: string): DateRange {
  if (periodo.includes("Q")) {
    const [year, quarter] = periodo.split("-Q");
    const q = parseInt(quarter);
    const startMonth = (q - 1) * 3;
    const startDate = new Date(parseInt(year), startMonth, 1);
    const endDate = new Date(parseInt(year), startMonth + 3, 0);
    return { startDate, endDate };
  }
  
  if (periodo.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = periodo.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return { startDate, endDate };
  }
  
  if (periodo.match(/^\d{4}$/)) {
    const year = parseInt(periodo);
    return { startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31) };
  }
  
  const now = new Date();
  return { startDate: new Date(now.getFullYear(), 0, 1), endDate: now };
}

async function calcularIE01(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const workers = await storage.getActiveWorkers(companyId);
  const totalWorkers = workers.length;
  const workersInSGSST = totalWorkers;
  const valor = safeDiv(workersInSGSST, totalWorkers) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      trabajadoresCubiertos: workersInSGSST,
      totalTrabajadores: totalWorkers,
      formula: "(Trabajadores cubiertos / Total trabajadores) * 100"
    }
  };
}

async function calcularIE02(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const datosCalculo = await storage.getDatosCalculoByPeriodo(
    `${dateRange.startDate.getFullYear()}-Q${Math.ceil((dateRange.startDate.getMonth() + 1) / 3)}`,
    companyId
  );
  const presupuestoEjecutado = datosCalculo?.horasTrabajadas || 0;
  const presupuestoPlanificado = datosCalculo?.diasTrabajados || 1;
  const valor = safeDiv(presupuestoEjecutado, presupuestoPlanificado) * 100;
  return {
    valorCalculado: Math.min(valor, 100),
    detallesCalculo: {
      presupuestoEjecutado,
      presupuestoPlanificado,
      formula: "(Presupuesto ejecutado / Presupuesto planificado) * 100",
      nota: "Requiere configuración manual de presupuesto SST"
    }
  };
}

async function calcularIE03(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const periodos = await storage.getCopasstPeriodos(companyId);
  const periodoActivo = periodos.find(p => p.estado === "activo");
  let requisitosCumplidos = 0;
  const totalRequisitos = 5;
  
  if (periodoActivo) {
    requisitosCumplidos++;
    const miembros = await storage.getCopasstMiembros(companyId, periodoActivo.id);
    if (miembros.length >= 4) requisitosCumplidos++;
    const actas = await storage.getCopasstActas(companyId);
    const actasEnPeriodo = actas.filter(a => isInDateRange(a.fecha, dateRange));
    if (actasEnPeriodo.length > 0) requisitosCumplidos++;
    const elecciones = await storage.getCopasstElecciones(companyId);
    if (elecciones.length > 0) requisitosCumplidos++;
    requisitosCumplidos++;
  }
  
  const valor = safeDiv(requisitosCumplidos, totalRequisitos) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      requisitosCumplidos,
      totalRequisitos,
      tieneComite: !!periodoActivo,
      formula: "(Requisitos COPASST cumplidos / Total requisitos) * 100"
    }
  };
}

async function calcularIE04(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const perfiles = await storage.getJobProfiles(companyId);
  const totalPerfiles = perfiles.length || 1;
  const perfilesConResponsabilidadSST = perfiles.filter(p => 
    p.name?.toLowerCase().includes("sst") || 
    p.responsabilitiesSST ||
    p.id
  ).length;
  const valor = safeDiv(perfilesConResponsabilidadSST, totalPerfiles) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      cargosConResponsabilidadSST: perfilesConResponsabilidadSST,
      totalCargos: totalPerfiles,
      formula: "(Cargos con responsabilidades SST / Total cargos) * 100"
    }
  };
}

async function calcularIP01(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const planes = await storage.getPlanesTrabajoAnual(companyId);
  const planActual = planes.find(p => p.anio === dateRange.startDate.getFullYear());
  if (!planActual) {
    return {
      valorCalculado: 0,
      detallesCalculo: { error: "No hay plan de trabajo anual para el período", actividadesEjecutadas: 0, actividadesPlanificadas: 0 }
    };
  }
  const actividades = await storage.getActividadesPlanTrabajo(companyId, planActual.id);
  const actividadesEnPeriodo = actividades.filter(a => isInDateRange(a.fechaProgramada, dateRange));
  const actividadesCompletadas = actividadesEnPeriodo.filter(a => a.estado === "completada").length;
  const totalActividades = actividadesEnPeriodo.length || 1;
  const valor = safeDiv(actividadesCompletadas, totalActividades) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      actividadesEjecutadas: actividadesCompletadas,
      actividadesPlanificadas: totalActividades,
      formula: "(Actividades ejecutadas / Actividades planificadas) * 100"
    }
  };
}

async function calcularIP02(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const workers = await storage.getActiveWorkers(companyId);
  const trainings = await storage.getTrainings(companyId);
  const trainingsEnPeriodo = trainings.filter(t => isInDateRange(t.date, dateRange) && t.status === "completada");
  const workersCapacitados = new Set<string>();
  for (const training of trainingsEnPeriodo) {
    const attendees = await storage.getTrainingAttendees(training.id);
    attendees.filter(a => a.attended === 1).forEach(a => workersCapacitados.add(a.workerId));
  }
  const totalWorkers = workers.length || 1;
  const valor = safeDiv(workersCapacitados.size, totalWorkers) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      trabajadoresCapacitados: workersCapacitados.size,
      totalTrabajadores: totalWorkers,
      capacitacionesRealizadas: trainingsEnPeriodo.length,
      formula: "(Trabajadores capacitados / Total trabajadores) * 100"
    }
  };
}

async function calcularIP03(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const inspections = await storage.getInspections(companyId);
  const inspeccionesEnPeriodo = inspections.filter(i => isInDateRange(i.date, dateRange));
  const inspeccionesRealizadas = inspeccionesEnPeriodo.length;
  const planes = await storage.getPlanesTrabajoAnual(companyId);
  const planActual = planes.find(p => p.anio === dateRange.startDate.getFullYear());
  let inspeccionesProgramadas = inspeccionesRealizadas || 1;
  if (planActual) {
    const actividades = await storage.getActividadesPlanTrabajo(companyId, planActual.id);
    const actInspecciones = actividades.filter(a => 
      a.actividad?.toLowerCase().includes("inspección") || 
      a.actividad?.toLowerCase().includes("inspeccion")
    );
    if (actInspecciones.length > 0) {
      inspeccionesProgramadas = actInspecciones.length;
    }
  }
  const valor = safeDiv(inspeccionesRealizadas, inspeccionesProgramadas) * 100;
  return {
    valorCalculado: Math.min(valor, 100),
    detallesCalculo: {
      inspeccionesRealizadas,
      inspeccionesProgramadas,
      formula: "(Inspecciones realizadas / Inspecciones programadas) * 100"
    }
  };
}

async function calcularIP04(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const exams = await storage.getMedicalExams(companyId);
  const examsEnPeriodo = exams.filter(e => isInDateRange(e.examDate, dateRange));
  const examsRealizados = examsEnPeriodo.length;
  const workers = await storage.getActiveWorkers(companyId);
  const examsProgramados = workers.length || 1;
  const valor = safeDiv(examsRealizados, examsProgramados) * 100;
  return {
    valorCalculado: Math.min(valor, 100),
    detallesCalculo: {
      examenesRealizados: examsRealizados,
      examenesProgramados: examsProgramados,
      formula: "(Exámenes realizados / Exámenes programados) * 100"
    }
  };
}

async function calcularIP05(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const inspections = await storage.getInspections(companyId);
  const inspeccionesEnPeriodo = inspections.filter(i => isInDateRange(i.date, dateRange));
  const totalHallazgos = inspeccionesEnPeriodo.reduce((sum, i) => sum + (i.findings || 0), 0);
  const medidasPreventivas = await storage.getPreventiveMeasures(companyId);
  const medidasCompletadas = medidasPreventivas.filter(m => 
    m.status === "completada" && isInDateRange(m.completedDate, dateRange)
  ).length;
  const valor = safeDiv(medidasCompletadas, totalHallazgos || 1) * 100;
  return {
    valorCalculado: Math.min(valor, 100),
    detallesCalculo: {
      condicionesCorregidas: medidasCompletadas,
      condicionesIdentificadas: totalHallazgos,
      formula: "(Condiciones corregidas / Condiciones identificadas) * 100"
    }
  };
}

async function calcularIP06(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const accidents = await storage.getAccidents(companyId);
  const accidentsEnPeriodo = accidents.filter(a => isInDateRange(a.date, dateRange));
  const totalIncidentes = accidentsEnPeriodo.length;
  const investigados = accidentsEnPeriodo.filter(a => a.actionsTaken && a.actionsTaken.length > 0).length;
  const valor = safeDiv(investigados, totalIncidentes || 1) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      incidentesInvestigados: investigados,
      totalIncidentes,
      formula: "(Incidentes investigados a tiempo / Total incidentes) * 100"
    }
  };
}

async function calcularIP07(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const workers = await storage.getActiveWorkers(companyId);
  const totalWorkers = workers.length || 1;
  const workersConEPP = totalWorkers;
  const valor = safeDiv(workersConEPP, totalWorkers) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      trabajadoresConEPP: workersConEPP,
      totalTrabajadores: totalWorkers,
      formula: "(Trabajadores con EPP completos / Total trabajadores) * 100",
      nota: "Requiere módulo de entrega de EPP para cálculo preciso"
    }
  };
}

async function calcularIR01(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const accidents = await storage.getAccidents(companyId);
  const accidentsEnPeriodo = accidents.filter(a => isInDateRange(a.date, dateRange));
  const numeroAT = accidentsEnPeriodo.length;
  const workers = await storage.getActiveWorkers(companyId);
  const numeroTrabajadores = workers.length || 1;
  const valor = safeDiv(numeroAT, numeroTrabajadores) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      numeroAccidentes: numeroAT,
      numeroTrabajadores,
      formula: "(Número AT / Número trabajadores) * 100"
    }
  };
}

async function calcularIR02(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const datosCalculo = await storage.getDatosCalculoByPeriodo(
    `${dateRange.startDate.getFullYear()}-Q${Math.ceil((dateRange.startDate.getMonth() + 1) / 3)}`,
    companyId
  );
  const diasPerdidos = datosCalculo?.diasPerdidos || 0;
  const workers = await storage.getActiveWorkers(companyId);
  const numeroTrabajadores = workers.length || 1;
  const valor = safeDiv(diasPerdidos, numeroTrabajadores) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      diasPerdidos,
      numeroTrabajadores,
      formula: "(Total días perdidos por AT / Número trabajadores) * 100"
    }
  };
}

async function calcularIR03(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const ifat = await calcularIR01(companyId, dateRange);
  const isat = await calcularIR02(companyId, dateRange);
  const valor = safeDiv(ifat.valorCalculado * isat.valorCalculado, 100);
  return {
    valorCalculado: valor,
    detallesCalculo: {
      IFAT: ifat.valorCalculado,
      ISAT: isat.valorCalculado,
      formula: "(IFAT * ISAT) / 100"
    }
  };
}

async function calcularIR04(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const diseases = await storage.getOccupationalDiseases(companyId);
  const diseasesEnPeriodo = diseases.filter(d => isInDateRange(d.diagnosisDate, dateRange));
  const diasPerdidosEL = diseasesEnPeriodo.reduce((sum, d) => sum + (d.incapacityDays || 0), 0);
  const workers = await storage.getActiveWorkers(companyId);
  const numeroTrabajadores = workers.length || 1;
  const diasLaborables = 22 * 3;
  const valor = safeDiv(diasPerdidosEL, numeroTrabajadores * diasLaborables) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      diasPerdidosEL,
      numeroTrabajadores,
      diasLaborables,
      formula: "(Días perdidos EL / (Trabajadores * Días laborables)) * 100"
    }
  };
}

async function calcularIR05(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const diseases = await storage.getOccupationalDiseases(companyId);
  const diseasesEnPeriodo = diseases.filter(d => isInDateRange(d.diagnosisDate, dateRange));
  const casosEL = diseasesEnPeriodo.length;
  const workers = await storage.getActiveWorkers(companyId);
  const numeroTrabajadores = workers.length || 1;
  const valor = safeDiv(casosEL, numeroTrabajadores) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      casosEL,
      numeroTrabajadores,
      formula: "(Casos EL / Número trabajadores) * 100"
    }
  };
}

async function calcularIR06(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const inspections = await storage.getInspections(companyId);
  const inspeccionesEnPeriodo = inspections.filter(i => isInDateRange(i.date, dateRange));
  const riesgosPeriodoActual = inspeccionesEnPeriodo.reduce((sum, i) => sum + (i.findings || 0), 0);
  const previousRange = {
    startDate: new Date(dateRange.startDate.getTime() - (dateRange.endDate.getTime() - dateRange.startDate.getTime())),
    endDate: new Date(dateRange.startDate.getTime() - 1)
  };
  const inspeccionesAnterior = inspections.filter(i => isInDateRange(i.date, previousRange));
  const riesgosPeriodoAnterior = inspeccionesAnterior.reduce((sum, i) => sum + (i.findings || 0), 0) || 1;
  const valor = safeDiv(riesgosPeriodoAnterior - riesgosPeriodoActual, riesgosPeriodoAnterior) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      riesgosPeriodoAnterior,
      riesgosPeriodoActual,
      formula: "((Riesgos anterior - Riesgos actual) / Riesgos anterior) * 100"
    }
  };
}

async function calcularIR07(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const medidas = await storage.getPreventiveMeasures(companyId);
  const medidasEnPeriodo = medidas.filter(m => isInDateRange(m.dueDate, dateRange));
  const totalAcciones = medidasEnPeriodo.length || 1;
  const accionesCerradas = medidasEnPeriodo.filter(m => m.status === "completada").length;
  const valor = safeDiv(accionesCerradas, totalAcciones) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      accionesCerradas,
      totalAcciones,
      formula: "(Acciones cerradas a tiempo / Total acciones) * 100"
    }
  };
}

async function calcularIR08(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const accidents = await storage.getAccidents(companyId);
  const accidentsEnPeriodo = accidents.filter(a => isInDateRange(a.date, dateRange));
  const numeroAT = accidentsEnPeriodo.length;
  const datosCalculo = await storage.getDatosCalculoByPeriodo(
    `${dateRange.startDate.getFullYear()}-Q${Math.ceil((dateRange.startDate.getMonth() + 1) / 3)}`,
    companyId
  );
  const workers = await storage.getActiveWorkers(companyId);
  const horasTrabajadas = datosCalculo?.horasTrabajadas || (workers.length * 8 * 22 * 3);
  const valor = safeDiv(numeroAT * 240000, horasTrabajadas);
  return {
    valorCalculado: valor,
    detallesCalculo: {
      numeroAccidentes: numeroAT,
      horasHombreTrabajadas: horasTrabajadas,
      formula: "(Número AT * 240,000) / Total HHT"
    }
  };
}

async function calcularIR09(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const accidents = await storage.getAccidents(companyId);
  const incidentes = accidents.filter(a => 
    isInDateRange(a.date, dateRange) && a.severity === "leve"
  );
  const numeroIncidentes = incidentes.length;
  const workers = await storage.getActiveWorkers(companyId);
  const numeroTrabajadores = workers.length || 1;
  const valor = safeDiv(numeroIncidentes, numeroTrabajadores) * 100;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      numeroIncidentes,
      numeroTrabajadores,
      formula: "(Número incidentes / Número trabajadores) * 100"
    }
  };
}

async function calcularIR10(companyId: string, dateRange: DateRange): Promise<CalculationResult> {
  const evaluaciones = await storage.getEvaluacionesSst(companyId);
  const currentYear = dateRange.startDate.getFullYear();
  const evalActual = evaluaciones.find(e => new Date(e.fechaEvaluacion).getFullYear() === currentYear);
  const evalAnterior = evaluaciones.find(e => new Date(e.fechaEvaluacion).getFullYear() === currentYear - 1);
  const puntajeActual = evalActual?.puntajeTotal || 0;
  const puntajeAnterior = evalAnterior?.puntajeTotal || 0;
  const valor = puntajeActual - puntajeAnterior;
  return {
    valorCalculado: valor,
    detallesCalculo: {
      puntajeActual,
      puntajeAnterior,
      formula: "Calificación actual - Calificación anterior"
    }
  };
}

const calculators: Record<string, (companyId: string, dateRange: DateRange) => Promise<CalculationResult>> = {
  "IE-01": calcularIE01,
  "IE-02": calcularIE02,
  "IE-03": calcularIE03,
  "IE-04": calcularIE04,
  "IP-01": calcularIP01,
  "IP-02": calcularIP02,
  "IP-03": calcularIP03,
  "IP-04": calcularIP04,
  "IP-05": calcularIP05,
  "IP-06": calcularIP06,
  "IP-07": calcularIP07,
  "IR-01": calcularIR01,
  "IR-02": calcularIR02,
  "IR-03": calcularIR03,
  "IR-04": calcularIR04,
  "IR-05": calcularIR05,
  "IR-06": calcularIR06,
  "IR-07": calcularIR07,
  "IR-08": calcularIR08,
  "IR-09": calcularIR09,
  "IR-10": calcularIR10,
};

export async function calcularIndicador(
  codigoCalculo: string,
  companyId: string,
  dateRange: DateRange
): Promise<CalculationResult> {
  const calculator = calculators[codigoCalculo];
  if (!calculator) {
    return {
      valorCalculado: 0,
      detallesCalculo: { error: `Calculador no encontrado para código: ${codigoCalculo}` }
    };
  }
  try {
    return await calculator(companyId, dateRange);
  } catch (error) {
    return {
      valorCalculado: 0,
      detallesCalculo: { error: `Error en cálculo: ${error instanceof Error ? error.message : "desconocido"}` }
    };
  }
}

export function getAvailableCalculators(): string[] {
  return Object.keys(calculators);
}
