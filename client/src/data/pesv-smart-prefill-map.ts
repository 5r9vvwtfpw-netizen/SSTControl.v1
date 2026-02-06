/**
 * Mapeo de campos auto-llenables para formularios inteligentes PESV
 * Resolución 40595/2022 - Smart Forms System
 * 
 * Fuentes de datos disponibles:
 * - company: Datos de la empresa actual
 * - vehicles: Registro de vehículos
 * - drivers: Registro de conductores
 * - workers: Lista de trabajadores
 * - sstObjectives: Objetivos SST vinculados
 * - inspections: Inspecciones vehiculares preoperacionales
 * - incidents: Siniestros viales registrados
 * - trainings: Capacitaciones de seguridad vial
 * - audits: Auditorías internas SST
 * - calculated: Valores calculados dinámicamente
 */

export interface PrefillFieldConfig {
  field: string;
  source: 'company' | 'vehicles' | 'drivers' | 'workers' | 'sstObjectives' | 'inspections' | 'incidents' | 'trainings' | 'audits' | 'calculated';
  sourceField?: string;
  transform?: 'count' | 'list' | 'first' | 'active' | 'expiring' | 'byType' | 'summary' | 'passed' | 'failed' | 'completed' | 'injuries' | 'fatalities';
  label: string;
  description?: string;
}

export interface StepPrefillConfig {
  codigo: string;
  nombre: string;
  fields: PrefillFieldConfig[];
  autoCalculations?: {
    field: string;
    formula: string;
    description: string;
  }[];
}

export const PESV_SMART_PREFILL_MAP: StepPrefillConfig[] = [
  // ==================== PLANEAR (P01-P08) ====================
  {
    codigo: 'P01',
    nombre: 'Conformación del equipo de trabajo',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'responsablePesv', source: 'company', sourceField: 'responsableSst', label: 'Responsable SST/PESV' },
      { field: 'representanteLegal', source: 'company', sourceField: 'representanteLegal', label: 'Representante Legal' },
      { field: 'miembrosEquipo', source: 'workers', transform: 'list', label: 'Trabajadores disponibles para el equipo' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Total de trabajadores' }
    ]
  },
  {
    codigo: 'P02',
    nombre: 'Política de seguridad vial',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'nit', source: 'company', sourceField: 'nit', label: 'NIT' },
      { field: 'actividadEconomica', source: 'company', sourceField: 'actividadEconomica', label: 'Actividad económica' },
      { field: 'representanteLegal', source: 'company', sourceField: 'representanteLegal', label: 'Representante Legal' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Total trabajadores alcance política' }
    ]
  },
  {
    codigo: 'P03',
    nombre: 'Diagnóstico de la organización',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'nit', source: 'company', sourceField: 'nit', label: 'NIT' },
      { field: 'actividadEconomica', source: 'company', sourceField: 'actividadEconomica', label: 'Actividad económica' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'vehiculosActivos', source: 'vehicles', transform: 'active', label: 'Vehículos activos' },
      { field: 'vehiculosPorTipo', source: 'vehicles', transform: 'byType', label: 'Vehículos por tipo' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'conductoresActivos', source: 'drivers', transform: 'active', label: 'Conductores activos' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Total de trabajadores' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Historial de siniestros viales', description: 'Datos para línea base del diagnóstico' }
    ],
    autoCalculations: [
      { field: 'nivelPesv', formula: 'max(totalVehiculos, totalConductores) > 50 ? "avanzado" : max(totalVehiculos, totalConductores) > 10 ? "estandar" : "basico"', description: 'Nivel PESV calculado automáticamente' }
    ]
  },
  {
    codigo: 'P04',
    nombre: 'Caracterización y evaluación del riesgo vial',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'vehiculosPorTipo', source: 'vehicles', transform: 'byType', label: 'Distribución por tipo de vehículo' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Historial siniestros (factor riesgo)', description: 'Datos para evaluación del nivel de riesgo vial' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Estado inspecciones vehiculares', description: 'Indicador de riesgo mecánico' }
    ]
  },
  {
    codigo: 'P05',
    nombre: 'Objetivos y metas del PESV',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'objetivosSstVinculados', source: 'sstObjectives', transform: 'list', label: 'Objetivos SST para vincular' },
      { field: 'totalSiniestros', source: 'incidents', transform: 'count', label: 'Total siniestros (línea base)', description: 'Para definir metas de reducción' },
      { field: 'totalCapacitaciones', source: 'trainings', transform: 'count', label: 'Capacitaciones realizadas (línea base)' },
      { field: 'tasaInspecciones', source: 'inspections', transform: 'summary', label: 'Cumplimiento inspecciones (línea base)' }
    ]
  },
  {
    codigo: 'P06',
    nombre: 'Programas y planes de acción',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Vehículos (dimensionar programas)' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Conductores (alcance programas)' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Trabajadores (alcance programas)' },
      { field: 'capacitacionesProgramadas', source: 'trainings', transform: 'summary', label: 'Capacitaciones planificadas' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Siniestros (priorizar líneas de acción)' }
    ]
  },
  {
    codigo: 'P07',
    nombre: 'Roles y responsabilidades',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'responsablePesv', source: 'company', sourceField: 'responsableSst', label: 'Responsable SST/PESV' },
      { field: 'representanteLegal', source: 'company', sourceField: 'representanteLegal', label: 'Representante Legal' },
      { field: 'trabajadoresDisponibles', source: 'workers', transform: 'list', label: 'Trabajadores para asignar roles' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Conductores con responsabilidades viales' }
    ]
  },
  {
    codigo: 'P08',
    nombre: 'Recursos para el PESV',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Vehículos (dimensionar recursos)' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Conductores (personal operativo)' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Trabajadores (recurso humano total)' },
      { field: 'capacitacionesRealizadas', source: 'trainings', transform: 'summary', label: 'Capacitaciones (recursos formativos)' }
    ]
  },

  // ==================== HACER (H01-H11) ====================
  {
    codigo: 'H01',
    nombre: 'Fortalecimiento institucional - Factor Humano',
    fields: [
      { field: 'conductoresRegistrados', source: 'drivers', transform: 'list', label: 'Conductores registrados' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'conductoresActivos', source: 'drivers', transform: 'active', label: 'Conductores activos' },
      { field: 'licenciasPorVencer', source: 'drivers', transform: 'expiring', label: 'Licencias por vencer (30 días)', description: 'Conductores que requieren renovación de aptitud' }
    ]
  },
  {
    codigo: 'H02',
    nombre: 'Capacitación en seguridad vial',
    fields: [
      { field: 'conductoresParaCapacitar', source: 'drivers', transform: 'list', label: 'Conductores para capacitar' },
      { field: 'trabajadoresParaCapacitar', source: 'workers', transform: 'list', label: 'Trabajadores para capacitar' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total conductores' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Total trabajadores' },
      { field: 'capacitacionesRealizadas', source: 'trainings', transform: 'summary', label: 'Capacitaciones viales realizadas', description: 'Resumen del programa de formación' },
      { field: 'ultimasCapacitaciones', source: 'trainings', transform: 'list', label: 'Últimas capacitaciones registradas' }
    ],
    autoCalculations: [
      { field: 'totalAsistentesEsperados', formula: 'totalConductores + totalTrabajadores', description: 'Total asistentes esperados al programa' }
    ]
  },
  {
    codigo: 'H03',
    nombre: 'Control de documentación de conductores',
    fields: [
      { field: 'conductoresRegistrados', source: 'drivers', transform: 'list', label: 'Conductores registrados' },
      { field: 'conductoresConLicenciaPorVencer', source: 'drivers', transform: 'expiring', label: 'Conductores con licencia por vencer (30 días)' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'conductoresActivos', source: 'drivers', transform: 'active', label: 'Conductores activos' }
    ]
  },
  {
    codigo: 'H04',
    nombre: 'Gestión de vehículos seguros',
    fields: [
      { field: 'vehiculosRegistrados', source: 'vehicles', transform: 'list', label: 'Vehículos registrados' },
      { field: 'vehiculosActivos', source: 'vehicles', transform: 'active', label: 'Vehículos activos' },
      { field: 'vehiculosPorTipo', source: 'vehicles', transform: 'byType', label: 'Distribución por tipo' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Estado de inspecciones técnicas', description: 'Condición técnica actual de la flota' }
    ]
  },
  {
    codigo: 'H05',
    nombre: 'Plan de mantenimiento de vehículos',
    fields: [
      { field: 'vehiculosParaMantenimiento', source: 'vehicles', transform: 'list', label: 'Vehículos para mantenimiento' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'inspeccionesConHallazgos', source: 'inspections', transform: 'failed', label: 'Inspecciones con hallazgos', description: 'Vehículos que requieren mantenimiento correctivo' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Estado general de inspecciones' }
    ]
  },
  {
    codigo: 'H06',
    nombre: 'Inspecciones preoperacionales',
    fields: [
      { field: 'vehiculosParaInspeccion', source: 'vehicles', transform: 'active', label: 'Vehículos activos para inspección' },
      { field: 'conductoresAsignados', source: 'drivers', transform: 'active', label: 'Conductores activos' },
      { field: 'totalInspecciones', source: 'inspections', transform: 'count', label: 'Total inspecciones realizadas' },
      { field: 'inspeccionesAprobadas', source: 'inspections', transform: 'passed', label: 'Inspecciones aprobadas' },
      { field: 'inspeccionesRechazadas', source: 'inspections', transform: 'failed', label: 'Inspecciones con hallazgos' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Resumen cumplimiento inspecciones' },
      { field: 'ultimasInspecciones', source: 'inspections', transform: 'list', label: 'Últimas inspecciones registradas' }
    ],
    autoCalculations: [
      { field: 'tasaCumplimiento', formula: '(inspeccionesAprobadas / totalInspecciones) * 100', description: 'Tasa de aprobación de inspecciones' }
    ]
  },
  {
    codigo: 'H07',
    nombre: 'Gestión de la velocidad',
    fields: [
      { field: 'vehiculosMonitoreados', source: 'vehicles', transform: 'active', label: 'Vehículos para monitoreo' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Siniestros relacionados con velocidad' }
    ]
  },
  {
    codigo: 'H08',
    nombre: 'Gestión de rutas seguras',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Vehículos en operación' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Conductores en rutas' },
      { field: 'siniestrosPorUbicacion', source: 'incidents', transform: 'list', label: 'Siniestros por ubicación', description: 'Identificación de puntos críticos' }
    ]
  },
  {
    codigo: 'H09',
    nombre: 'Gestión de fatiga y somnolencia',
    fields: [
      { field: 'conductoresActivos', source: 'drivers', transform: 'active', label: 'Conductores activos' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'capacitacionesFatiga', source: 'trainings', transform: 'summary', label: 'Capacitaciones sobre fatiga realizadas' }
    ]
  },
  {
    codigo: 'H10',
    nombre: 'Gestión de alcohol y sustancias psicoactivas',
    fields: [
      { field: 'conductoresParaPruebas', source: 'drivers', transform: 'list', label: 'Conductores para pruebas' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Total trabajadores (alcance programa)' }
    ]
  },
  {
    codigo: 'H11',
    nombre: 'Atención a víctimas de siniestros viales',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'arl', source: 'company', sourceField: 'arl', label: 'ARL' },
      { field: 'totalSiniestros', source: 'incidents', transform: 'count', label: 'Total siniestros registrados' },
      { field: 'lesionados', source: 'incidents', transform: 'injuries', label: 'Total lesionados' },
      { field: 'fatalidades', source: 'incidents', transform: 'fatalities', label: 'Total fatalidades' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Resumen siniestralidad', description: 'Historial para protocolo de atención' }
    ]
  },

  // ==================== VERIFICAR (V01-V03) ====================
  {
    codigo: 'V01',
    nombre: 'Indicadores de gestión del PESV',
    fields: [
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos (línea base)' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores (línea base)' },
      { field: 'totalTrabajadores', source: 'workers', transform: 'count', label: 'Total de trabajadores (línea base)' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Indicador inspecciones preoperacionales' },
      { field: 'resumenCapacitaciones', source: 'trainings', transform: 'summary', label: 'Indicador capacitaciones viales' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Indicador siniestralidad vial' },
      { field: 'resumenAuditorias', source: 'audits', transform: 'summary', label: 'Indicador auditorías realizadas' }
    ],
    autoCalculations: [
      { field: 'tasaCoberturaConductores', formula: '(conductoresCapacitados / totalConductores) * 100', description: 'Tasa de cobertura de capacitación' },
      { field: 'tasaCumplimientoInspecciones', formula: '(inspeccionesRealizadas / inspeccionesProgramadas) * 100', description: 'Tasa de cumplimiento de inspecciones' }
    ]
  },
  {
    codigo: 'V02',
    nombre: 'Registro y análisis de siniestros viales',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'totalSiniestros', source: 'incidents', transform: 'count', label: 'Total siniestros registrados' },
      { field: 'lesionados', source: 'incidents', transform: 'injuries', label: 'Total lesionados' },
      { field: 'fatalidades', source: 'incidents', transform: 'fatalities', label: 'Total fatalidades' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Análisis consolidado siniestralidad' },
      { field: 'ultimosSiniestros', source: 'incidents', transform: 'list', label: 'Últimos siniestros para análisis' }
    ]
  },
  {
    codigo: 'V03',
    nombre: 'Auditoría del PESV',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'responsablePesv', source: 'company', sourceField: 'responsableSst', label: 'Responsable PESV' },
      { field: 'resumenAuditorias', source: 'audits', transform: 'summary', label: 'Auditorías SST realizadas', description: 'Historial de auditorías para trazabilidad' },
      { field: 'ultimasAuditorias', source: 'audits', transform: 'list', label: 'Últimas auditorías registradas' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Cumplimiento inspecciones (hallazgo auditoría)' },
      { field: 'resumenCapacitaciones', source: 'trainings', transform: 'summary', label: 'Cumplimiento capacitaciones (hallazgo auditoría)' }
    ]
  },

  // ==================== ACTUAR (A01-A02) ====================
  {
    codigo: 'A01',
    nombre: 'Acciones de mejora continua',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'responsablePesv', source: 'company', sourceField: 'responsableSst', label: 'Responsable PESV' },
      { field: 'resumenAuditorias', source: 'audits', transform: 'summary', label: 'Auditorías con hallazgos', description: 'Fuente de acciones correctivas' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Siniestros (fuente de mejoras)', description: 'Análisis causal para acciones preventivas' },
      { field: 'inspeccionesConHallazgos', source: 'inspections', transform: 'failed', label: 'Inspecciones con hallazgos', description: 'Fuente de acciones correctivas vehiculares' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Estado inspecciones (oportunidades de mejora)' }
    ]
  },
  {
    codigo: 'A02',
    nombre: 'Revisión por la alta dirección',
    fields: [
      { field: 'nombreEmpresa', source: 'company', sourceField: 'name', label: 'Nombre de la empresa' },
      { field: 'representanteLegal', source: 'company', sourceField: 'representanteLegal', label: 'Representante Legal' },
      { field: 'responsablePesv', source: 'company', sourceField: 'responsableSst', label: 'Responsable PESV' },
      { field: 'totalVehiculos', source: 'vehicles', transform: 'count', label: 'Total de vehículos' },
      { field: 'totalConductores', source: 'drivers', transform: 'count', label: 'Total de conductores' },
      { field: 'resumenSiniestros', source: 'incidents', transform: 'summary', label: 'Resumen siniestralidad (insumo revisión)' },
      { field: 'resumenInspecciones', source: 'inspections', transform: 'summary', label: 'Resumen inspecciones (insumo revisión)' },
      { field: 'resumenCapacitaciones', source: 'trainings', transform: 'summary', label: 'Resumen capacitaciones (insumo revisión)' },
      { field: 'resumenAuditorias', source: 'audits', transform: 'summary', label: 'Resumen auditorías (insumo revisión)' }
    ]
  }
];

/**
 * Obtiene la configuración de prefill para un paso específico
 */
export function getPrefillConfigForStep(codigo: string): StepPrefillConfig | undefined {
  return PESV_SMART_PREFILL_MAP.find(step => step.codigo === codigo);
}

/**
 * Obtiene los campos auto-llenables para una fase específica
 */
export function getPrefillConfigsForPhase(fase: 'planear' | 'hacer' | 'verificar' | 'actuar'): StepPrefillConfig[] {
  const prefixMap = {
    planear: 'P',
    hacer: 'H',
    verificar: 'V',
    actuar: 'A'
  };
  const prefix = prefixMap[fase];
  return PESV_SMART_PREFILL_MAP.filter(step => step.codigo.startsWith(prefix));
}

/**
 * Cuenta los campos auto-llenables disponibles para un paso
 */
export function countPrefillableFields(codigo: string): number {
  const config = getPrefillConfigForStep(codigo);
  return config ? config.fields.length : 0;
}
