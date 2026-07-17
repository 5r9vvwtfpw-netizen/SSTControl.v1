import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

export interface SpiCalculationResult {
  valor: number | null;
  numerador: number;
  denominador: number;
  observaciones: string;
  fuente: string;
  calculable: boolean;
  metaSugerida?: number;
  minimoSugerido?: number;
  maximoSugerido?: number;
}

export interface SpiAutoCalculate {
  [indicadorNombre: string]: SpiCalculationResult;
}

function safeDiv(n: number, d: number, multiplier = 1): number {
  if (!d || !Number.isFinite(d)) return 0;
  return Math.round((n / d) * multiplier * 100) / 100;
}

function getTodayCol(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

function getCurrentYearRange() {
  const now = new Date();
  const year = now.getFullYear();
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

async function calcSiniestros(companyId: string): Promise<SpiCalculationResult> {
  const [incidents, vehicles] = await Promise.all([
    db.select().from(schema.roadIncidents).where(eq(schema.roadIncidents.companyId, companyId)),
    db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId)),
  ]);
  const { start, end } = getCurrentYearRange();
  const siniestrosAnio = incidents.filter(i => i.incidentDate >= start && i.incidentDate <= end).length;
  const totalVehiculos = vehicles.length;
  const valor = safeDiv(siniestrosAnio, totalVehiculos, 100);
  return {
    valor,
    numerador: siniestrosAnio,
    denominador: totalVehiculos,
    observaciones: `${siniestrosAnio} siniestros en el año / ${totalVehiculos} vehículos en flota × 100`,
    fuente: "Registro de siniestros viales y flota vehicular",
    calculable: true,
    metaSugerida: 0,
    minimoSugerido: 0,
    maximoSugerido: 5,
  };
}

async function calcSeveridad(companyId: string): Promise<SpiCalculationResult> {
  const incidents = await db.select().from(schema.roadIncidents).where(eq(schema.roadIncidents.companyId, companyId));
  const { start, end } = getCurrentYearRange();
  const enAnio = incidents.filter(i => i.incidentDate >= start && i.incidentDate <= end);
  const totalHeridos = enAnio.reduce((s, i) => s + (i.injuries || 0), 0);
  const totalSiniestros = enAnio.length;
  const valor = safeDiv(totalHeridos, totalSiniestros || 1);
  return {
    valor,
    numerador: totalHeridos,
    denominador: totalSiniestros || 1,
    observaciones: `${totalHeridos} heridos / ${totalSiniestros} siniestros. Nota: usa heridos como proxy de gravedad.`,
    fuente: "Registro de siniestros y ausentismo laboral",
    calculable: true,
    metaSugerida: 0,
    minimoSugerido: 0,
    maximoSugerido: 2,
  };
}

async function calcMortalidad(companyId: string): Promise<SpiCalculationResult> {
  const [incidents, workers] = await Promise.all([
    db.select().from(schema.roadIncidents).where(eq(schema.roadIncidents.companyId, companyId)),
    db.select().from(schema.workers).where(eq(schema.workers.companyId, companyId)),
  ]);
  const { start, end } = getCurrentYearRange();
  const enAnio = incidents.filter(i => i.incidentDate >= start && i.incidentDate <= end);
  const totalFallecidos = enAnio.reduce((s, i) => s + (i.fatalities || 0), 0);
  const totalTrabajadores = workers.length;
  const valor = safeDiv(totalFallecidos, totalTrabajadores || 1, 100000);
  return {
    valor,
    numerador: totalFallecidos,
    denominador: totalTrabajadores,
    observaciones: `${totalFallecidos} víctimas mortales / ${totalTrabajadores} trabajadores × 100,000`,
    fuente: "Registro de siniestros viales y nómina",
    calculable: true,
    metaSugerida: 0,
    minimoSugerido: 0,
    maximoSugerido: 1,
  };
}

async function calcInspecciones(companyId: string): Promise<SpiCalculationResult> {
  const [inspecciones, vehicles] = await Promise.all([
    db.select().from(schema.vehicleInspections).where(eq(schema.vehicleInspections.companyId, companyId)),
    db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId)),
  ]);
  const { start, end } = getCurrentYearRange();
  const realizadas = inspecciones.filter(i => i.inspectionDate >= start && i.inspectionDate <= end).length;
  const DIAS_LABORALES_MES = 22;
  const MESES = new Date().getMonth() + 1;
  const programadas = vehicles.length * DIAS_LABORALES_MES * MESES;
  const valor = Math.min(safeDiv(realizadas, programadas || 1, 100), 100);
  return {
    valor,
    numerador: realizadas,
    denominador: programadas,
    observaciones: `${realizadas} inspecciones realizadas / ${programadas} programadas (${vehicles.length} veh × ${DIAS_LABORALES_MES} días × ${MESES} meses) × 100`,
    fuente: "Registro de inspecciones vehiculares preoperacionales",
    calculable: true,
    metaSugerida: 95,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

async function calcCapacitacionVial(companyId: string): Promise<SpiCalculationResult> {
  const capacitaciones = await db.select().from(schema.roadSafetyTrainings).where(eq(schema.roadSafetyTrainings.companyId, companyId));
  const { start, end } = getCurrentYearRange();
  const enAnio = capacitaciones.filter(c => c.trainingDate >= start && c.trainingDate <= end);
  const ejecutadas = enAnio.filter(c => c.status === "completada").length;
  const planeadas = enAnio.length;
  const valor = safeDiv(ejecutadas, planeadas || 1, 100);
  return {
    valor,
    numerador: ejecutadas,
    denominador: planeadas,
    observaciones: `${ejecutadas} capacitaciones ejecutadas / ${planeadas} planeadas en el año × 100`,
    fuente: "Plan de capacitación vial y registros de asistencia",
    calculable: true,
    metaSugerida: 100,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

async function calcInfracciones(companyId: string): Promise<SpiCalculationResult> {
  const [comparendos, conductores] = await Promise.all([
    db.select().from(schema.driverComparendos).where(eq(schema.driverComparendos.companyId, companyId)),
    db.select().from(schema.drivers).where(eq(schema.drivers.companyId, companyId)),
  ]);
  const { start, end } = getCurrentYearRange();
  const enAnio = comparendos.filter(c => c.fechaComparendo >= start && c.fechaComparendo <= end).length;
  const totalConductores = conductores.length;
  const valor = safeDiv(enAnio, totalConductores || 1, 100);
  return {
    valor,
    numerador: enAnio,
    denominador: totalConductores,
    observaciones: `${enAnio} infracciones en el año / ${totalConductores} conductores × 100`,
    fuente: "SIMIT y registros internos de conductores",
    calculable: true,
    metaSugerida: 0,
    minimoSugerido: 0,
    maximoSugerido: 5,
  };
}

async function calcLicenciaVigente(companyId: string): Promise<SpiCalculationResult> {
  const conductores = await db.select().from(schema.drivers).where(eq(schema.drivers.companyId, companyId));
  const today = getTodayCol();
  const activos = conductores.filter(c => c.status === "activo");
  const conLicenciaVigente = activos.filter(c => c.licenseExpiry && c.licenseExpiry >= today).length;
  const total = activos.length;
  const valor = safeDiv(conLicenciaVigente, total || 1, 100);
  return {
    valor,
    numerador: conLicenciaVigente,
    denominador: total,
    observaciones: `${conLicenciaVigente} conductores con licencia vigente / ${total} conductores activos × 100`,
    fuente: "Base de datos de conductores (módulo PESV - H03)",
    calculable: true,
    metaSugerida: 100,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

async function calcMantenimiento(companyId: string): Promise<SpiCalculationResult> {
  const mantenimientos = await db.select().from(schema.vehicleMaintenances).where(eq(schema.vehicleMaintenances.companyId, companyId));
  const { start, end } = getCurrentYearRange();
  const enAnio = mantenimientos.filter(m => m.maintenanceDate >= start && m.maintenanceDate <= end);
  const preventivos = enAnio.filter(m => m.maintenanceType === "preventivo").length;
  const total = enAnio.length;
  const valor = total === 0 ? 0 : safeDiv(preventivos, total, 100);
  return {
    valor,
    numerador: preventivos,
    denominador: total,
    observaciones: total === 0
      ? "Sin registros de mantenimiento en el período. Registre mantenimientos en PESV → H05."
      : `${preventivos} mantenimientos preventivos / ${total} mantenimientos totales × 100`,
    fuente: "Plan de mantenimiento vehicular (módulo PESV - H05)",
    calculable: total > 0,
    metaSugerida: 95,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

async function calcFrecuenciaSiniestros(_companyId: string): Promise<SpiCalculationResult> {
  return {
    valor: null,
    numerador: 0,
    denominador: 0,
    observaciones: "Este indicador requiere datos de kilómetros recorridos (GPS/odómetro). Ingrese el valor manualmente.",
    fuente: "Registros GPS y control de kilometraje",
    calculable: false,
    metaSugerida: 0,
    minimoSugerido: 0,
    maximoSugerido: 10,
  };
}

async function calcExamenesConductores(companyId: string): Promise<SpiCalculationResult> {
  const conductores = await db.select().from(schema.drivers).where(eq(schema.drivers.companyId, companyId));
  const today = getTodayCol();
  const activos = conductores.filter(c => c.status === "activo");
  const conExamenVigente = activos.filter(c => c.medicalExamExpiry && c.medicalExamExpiry >= today).length;
  const total = activos.length;
  const valor = safeDiv(conExamenVigente, total || 1, 100);
  return {
    valor,
    numerador: conExamenVigente,
    denominador: total,
    observaciones: `${conExamenVigente} conductores con examen médico vigente / ${total} conductores activos × 100`,
    fuente: "Registros de salud ocupacional (módulo PESV - H04)",
    calculable: true,
    metaSugerida: 100,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

async function calcDocumentosVehiculos(companyId: string): Promise<SpiCalculationResult> {
  const vehicles = await db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId));
  const today = getTodayCol();
  const activos = vehicles.filter(v => v.status === "activo");
  const conDocsVigentes = activos.filter(v => {
    const soatOk = v.soatExpiry && v.soatExpiry >= today;
    const techOk = v.technicalReviewExpiry && v.technicalReviewExpiry >= today;
    return soatOk && techOk;
  }).length;
  const total = activos.length;
  const valor = safeDiv(conDocsVigentes, total || 1, 100);
  return {
    valor,
    numerador: conDocsVigentes,
    denominador: total,
    observaciones: `${conDocsVigentes} vehículos con SOAT y RTM vigentes / ${total} vehículos activos × 100`,
    fuente: "Registro de documentación vehicular (módulo PESV - H02)",
    calculable: true,
    metaSugerida: 100,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

async function calcEficaciaAcciones(companyId: string): Promise<SpiCalculationResult> {
  const incidents = await db.select().from(schema.roadIncidents).where(eq(schema.roadIncidents.companyId, companyId));
  const { start, end } = getCurrentYearRange();
  const enAnio = incidents.filter(i => i.incidentDate >= start && i.incidentDate <= end);
  const conAcciones = enAnio.filter(i => i.correctiveActions && i.correctiveActions.trim().length > 0).length;
  const total = enAnio.length;
  const valor = safeDiv(conAcciones, total || 1, 100);
  return {
    valor,
    numerador: conAcciones,
    denominador: total,
    observaciones: total === 0
      ? "Sin siniestros registrados en el período."
      : `${conAcciones} siniestros con acciones correctivas documentadas / ${total} siniestros totales × 100`,
    fuente: "Seguimiento de investigaciones de siniestros (módulo PESV)",
    calculable: true,
    metaSugerida: 100,
    minimoSugerido: 0,
    maximoSugerido: 100,
  };
}

const KEYWORD_MAP: Array<{ keywords: string[]; fn: (companyId: string) => Promise<SpiCalculationResult> }> = [
  { keywords: ["mortalidad", "víctimas mortales", "victimas mortales", "mortal"], fn: calcMortalidad },
  { keywords: ["tasa de siniestros", "siniestros viales"], fn: calcSiniestros },
  { keywords: ["severidad", "gravedad", "días perdidos", "dias perdidos"], fn: calcSeveridad },
  { keywords: ["inspecciones vehiculares", "preoperacional"], fn: calcInspecciones },
  { keywords: ["capacitación vial", "capacitacion vial", "plan de capacitación"], fn: calcCapacitacionVial },
  { keywords: ["infracciones", "tasa de infracciones", "comparendos"], fn: calcInfracciones },
  { keywords: ["licencia vigente", "licencia de conducción", "licencia de conduccion"], fn: calcLicenciaVigente },
  { keywords: ["mantenimiento preventivo", "mantenimientos", "mantenimiento vehicular", "plan de mantenimiento", "mantenimiento"], fn: calcMantenimiento },
  { keywords: ["frecuencia de siniestros", "kilómetros", "kilometros", "millón de km"], fn: calcFrecuenciaSiniestros },
  { keywords: ["exámenes médicos", "examenes medicos", "aptitud para conducir"], fn: calcExamenesConductores },
  { keywords: ["documentación vigente", "documentacion vigente", "soat", "revisión técnico"], fn: calcDocumentosVehiculos },
  { keywords: ["acciones correctivas viales", "eficacia", "causa raíz", "causa raiz"], fn: calcEficaciaAcciones },
];

export async function calcularSpiIndicador(
  companyId: string,
  indicadorNombre: string,
): Promise<SpiCalculationResult> {
  const nombreLower = indicadorNombre.toLowerCase();

  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(kw => nombreLower.includes(kw.toLowerCase()))) {
      try {
        return await entry.fn(companyId);
      } catch (err) {
        return {
          valor: null,
          numerador: 0,
          denominador: 0,
          observaciones: `Error calculando automáticamente: ${err instanceof Error ? err.message : "desconocido"}`,
          fuente: "",
          calculable: false,
        };
      }
    }
  }

  return {
    valor: null,
    numerador: 0,
    denominador: 0,
    observaciones: "Este indicador no tiene cálculo automático disponible. Ingrese el valor manualmente.",
    fuente: "Manual",
    calculable: false,
  };
}

export async function calcularTodosSpi(companyId: string): Promise<Record<string, SpiCalculationResult>> {
  const [
    siniestros, severidad, mortalidad, inspecciones,
    capacitacion, infracciones, licencia, mantenimiento,
    frecuencia, examenes, documentos, eficacia
  ] = await Promise.all([
    calcSiniestros(companyId),
    calcSeveridad(companyId),
    calcMortalidad(companyId),
    calcInspecciones(companyId),
    calcCapacitacionVial(companyId),
    calcInfracciones(companyId),
    calcLicenciaVigente(companyId),
    calcMantenimiento(companyId),
    calcFrecuenciaSiniestros(companyId),
    calcExamenesConductores(companyId),
    calcDocumentosVehiculos(companyId),
    calcEficaciaAcciones(companyId),
  ]);

  return {
    tasaSiniestros: siniestros,
    indiceSeveridad: severidad,
    tasaMortalidad: mortalidad,
    cumplimientoInspecciones: inspecciones,
    cumplimientoCapacitacion: capacitacion,
    tasaInfracciones: infracciones,
    licenciaVigente: licencia,
    cumplimientoMantenimiento: mantenimiento,
    frecuenciaSiniestros: frecuencia,
    coberturExamenes: examenes,
    documentosVigentes: documentos,
    eficaciaAcciones: eficacia,
  };
}
