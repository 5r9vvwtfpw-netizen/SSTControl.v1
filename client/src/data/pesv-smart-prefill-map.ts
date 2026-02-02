/**
 * Mapeo de campos auto-llenables para formularios inteligentes PESV
 * 
 * Este archivo define qué campos pueden ser pre-llenados automáticamente
 * para cada paso del ciclo PESV, reduciendo la entrada manual de datos.
 * 
 * Fuentes de datos disponibles:
 * - company: Datos de la empresa actual
 * - vehicles: Registro de vehículos
 * - drivers: Registro de conductores
 * - workers: Lista de trabajadores
 * - sstObjectives: Objetivos SST vinculados
 */

export interface PrefillFieldConfig {
  field: string;
  source: 'company' | 'vehicles' | 'drivers' | 'workers' | 'sstObjectives' | 'calculated';
  sourceField?: string;
  transform?: 'count' | 'list' | 'first' | 'active' | 'expiring' | 'byType';
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
  // ==================== PLANEAR ====================
  {
    codigo: 'P01',
    nombre: 'Conformación del equipo de trabajo',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'responsablePesv',
        source: 'company',
        sourceField: 'responsableSst',
        label: 'Responsable SST/PESV'
      },
      {
        field: 'representanteLegal',
        source: 'company',
        sourceField: 'representanteLegal',
        label: 'Representante Legal'
      },
      {
        field: 'miembrosEquipo',
        source: 'workers',
        transform: 'list',
        label: 'Trabajadores disponibles para el equipo'
      },
      {
        field: 'totalTrabajadores',
        source: 'workers',
        transform: 'count',
        label: 'Total de trabajadores'
      }
    ]
  },
  {
    codigo: 'P02',
    nombre: 'Política de seguridad vial',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'nit',
        source: 'company',
        sourceField: 'nit',
        label: 'NIT'
      },
      {
        field: 'actividadEconomica',
        source: 'company',
        sourceField: 'actividadEconomica',
        label: 'Actividad económica'
      },
      {
        field: 'representanteLegal',
        source: 'company',
        sourceField: 'representanteLegal',
        label: 'Representante Legal'
      }
    ]
  },
  {
    codigo: 'P03',
    nombre: 'Diagnóstico de la organización',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'nit',
        source: 'company',
        sourceField: 'nit',
        label: 'NIT'
      },
      {
        field: 'actividadEconomica',
        source: 'company',
        sourceField: 'actividadEconomica',
        label: 'Actividad económica'
      },
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos'
      },
      {
        field: 'vehiculosActivos',
        source: 'vehicles',
        transform: 'active',
        label: 'Vehículos activos'
      },
      {
        field: 'vehiculosPorTipo',
        source: 'vehicles',
        transform: 'byType',
        label: 'Vehículos por tipo'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      },
      {
        field: 'conductoresActivos',
        source: 'drivers',
        transform: 'active',
        label: 'Conductores activos'
      },
      {
        field: 'totalTrabajadores',
        source: 'workers',
        transform: 'count',
        label: 'Total de trabajadores'
      }
    ],
    autoCalculations: [
      {
        field: 'nivelPesv',
        formula: 'max(totalVehiculos, totalConductores) > 50 ? "avanzado" : max(totalVehiculos, totalConductores) > 10 ? "estandar" : "basico"',
        description: 'Nivel PESV calculado automáticamente'
      }
    ]
  },
  {
    codigo: 'P04',
    nombre: 'Caracterización y evaluación del riesgo vial',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      }
    ]
  },
  {
    codigo: 'P05',
    nombre: 'Objetivos y metas del PESV',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'objetivosSstVinculados',
        source: 'sstObjectives',
        transform: 'list',
        label: 'Objetivos SST para vincular'
      }
    ]
  },
  {
    codigo: 'P06',
    nombre: 'Programas y planes de acción',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      }
    ]
  },
  {
    codigo: 'P07',
    nombre: 'Roles y responsabilidades',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'responsablePesv',
        source: 'company',
        sourceField: 'responsableSst',
        label: 'Responsable SST/PESV'
      },
      {
        field: 'representanteLegal',
        source: 'company',
        sourceField: 'representanteLegal',
        label: 'Representante Legal'
      },
      {
        field: 'trabajadoresDisponibles',
        source: 'workers',
        transform: 'list',
        label: 'Trabajadores para asignar roles'
      }
    ]
  },
  {
    codigo: 'P08',
    nombre: 'Recursos para el PESV',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      }
    ]
  },

  // ==================== HACER ====================
  {
    codigo: 'H01',
    nombre: 'Fortalecimiento institucional - Factor Humano',
    fields: [
      {
        field: 'conductoresRegistrados',
        source: 'drivers',
        transform: 'list',
        label: 'Conductores registrados'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      }
    ]
  },
  {
    codigo: 'H02',
    nombre: 'Capacitación en seguridad vial',
    fields: [
      {
        field: 'conductoresParaCapacitar',
        source: 'drivers',
        transform: 'list',
        label: 'Conductores para capacitar'
      },
      {
        field: 'trabajadoresParaCapacitar',
        source: 'workers',
        transform: 'list',
        label: 'Trabajadores para capacitar'
      },
      {
        field: 'totalAsistentesEsperados',
        source: 'calculated',
        label: 'Total asistentes esperados'
      }
    ]
  },
  {
    codigo: 'H03',
    nombre: 'Control de documentación de conductores',
    fields: [
      {
        field: 'conductoresRegistrados',
        source: 'drivers',
        transform: 'list',
        label: 'Conductores registrados'
      },
      {
        field: 'conductoresConLicenciaPorVencer',
        source: 'drivers',
        transform: 'expiring',
        label: 'Conductores con licencia por vencer (30 días)'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      }
    ]
  },
  {
    codigo: 'H04',
    nombre: 'Gestión de vehículos seguros',
    fields: [
      {
        field: 'vehiculosRegistrados',
        source: 'vehicles',
        transform: 'list',
        label: 'Vehículos registrados'
      },
      {
        field: 'vehiculosActivos',
        source: 'vehicles',
        transform: 'active',
        label: 'Vehículos activos'
      },
      {
        field: 'vehiculosPorTipo',
        source: 'vehicles',
        transform: 'byType',
        label: 'Distribución por tipo'
      },
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos'
      }
    ]
  },
  {
    codigo: 'H05',
    nombre: 'Plan de mantenimiento de vehículos',
    fields: [
      {
        field: 'vehiculosParaMantenimiento',
        source: 'vehicles',
        transform: 'list',
        label: 'Vehículos para mantenimiento'
      },
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos'
      }
    ]
  },
  {
    codigo: 'H06',
    nombre: 'Inspecciones preoperacionales',
    fields: [
      {
        field: 'vehiculosParaInspeccion',
        source: 'vehicles',
        transform: 'active',
        label: 'Vehículos activos para inspección'
      },
      {
        field: 'conductoresAsignados',
        source: 'drivers',
        transform: 'active',
        label: 'Conductores activos'
      }
    ]
  },
  {
    codigo: 'H07',
    nombre: 'Gestión de la velocidad',
    fields: [
      {
        field: 'vehiculosMonitoreados',
        source: 'vehicles',
        transform: 'active',
        label: 'Vehículos para monitoreo'
      }
    ]
  },
  {
    codigo: 'H08',
    nombre: 'Gestión de rutas seguras',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      }
    ]
  },
  {
    codigo: 'H09',
    nombre: 'Gestión de fatiga y somnolencia',
    fields: [
      {
        field: 'conductoresActivos',
        source: 'drivers',
        transform: 'active',
        label: 'Conductores activos'
      }
    ]
  },
  {
    codigo: 'H10',
    nombre: 'Gestión de alcohol y sustancias psicoactivas',
    fields: [
      {
        field: 'conductoresParaPruebas',
        source: 'drivers',
        transform: 'list',
        label: 'Conductores para pruebas'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      }
    ]
  },
  {
    codigo: 'H11',
    nombre: 'Atención a víctimas de siniestros viales',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'arl',
        source: 'company',
        sourceField: 'arl',
        label: 'ARL'
      }
    ]
  },

  // ==================== VERIFICAR ====================
  {
    codigo: 'V01',
    nombre: 'Indicadores de gestión del PESV',
    fields: [
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos (línea base)'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores (línea base)'
      },
      {
        field: 'totalTrabajadores',
        source: 'workers',
        transform: 'count',
        label: 'Total de trabajadores (línea base)'
      }
    ],
    autoCalculations: [
      {
        field: 'tasaCoberturaConductores',
        formula: '(conductoresCapacitados / totalConductores) * 100',
        description: 'Tasa de cobertura de capacitación'
      },
      {
        field: 'tasaCumplimientoInspecciones',
        formula: '(inspeccionesRealizadas / inspeccionesProgramadas) * 100',
        description: 'Tasa de cumplimiento de inspecciones'
      }
    ]
  },
  {
    codigo: 'V02',
    nombre: 'Registro y análisis de siniestros viales',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      }
    ]
  },
  {
    codigo: 'V03',
    nombre: 'Auditoría del PESV',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'responsablePesv',
        source: 'company',
        sourceField: 'responsableSst',
        label: 'Responsable PESV'
      }
    ]
  },

  // ==================== ACTUAR ====================
  {
    codigo: 'A01',
    nombre: 'Acciones de mejora continua',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      }
    ]
  },
  {
    codigo: 'A02',
    nombre: 'Revisión por la alta dirección',
    fields: [
      {
        field: 'nombreEmpresa',
        source: 'company',
        sourceField: 'name',
        label: 'Nombre de la empresa'
      },
      {
        field: 'representanteLegal',
        source: 'company',
        sourceField: 'representanteLegal',
        label: 'Representante Legal'
      },
      {
        field: 'responsablePesv',
        source: 'company',
        sourceField: 'responsableSst',
        label: 'Responsable PESV'
      },
      {
        field: 'totalVehiculos',
        source: 'vehicles',
        transform: 'count',
        label: 'Total de vehículos'
      },
      {
        field: 'totalConductores',
        source: 'drivers',
        transform: 'count',
        label: 'Total de conductores'
      }
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
