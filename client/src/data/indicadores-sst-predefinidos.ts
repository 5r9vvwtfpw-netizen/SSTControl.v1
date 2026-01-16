export interface IndicadorPredefinido {
  codigo: string;
  nombre: string;
  tipo: "estructura" | "proceso" | "resultado";
  definicion: string;
  interpretacion: string;
  formula: string;
  unidadMedida: string;
  frecuenciaMedicion: "mensual" | "trimestral" | "semestral" | "anual";
  fuenteInformacion: string;
  meta?: string;
}

export const indicadoresSstPredefinidos: IndicadorPredefinido[] = [
  // ========================================
  // INDICADORES DE ESTRUCTURA
  // ========================================
  {
    codigo: "IE-01",
    nombre: "Cobertura del Sistema de Gestión SST",
    tipo: "estructura",
    definicion: "Mide el porcentaje de trabajadores cubiertos por el Sistema de Gestión de SST implementado",
    interpretacion: "Un valor del 100% indica que todos los trabajadores están cubiertos por el SG-SST. Valores inferiores requieren acciones de inclusión.",
    formula: "(Trabajadores cubiertos por SG-SST / Total de trabajadores) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Registros de personal y documentos del SG-SST",
    meta: "100%"
  },
  {
    codigo: "IE-02",
    nombre: "Cumplimiento de Recursos SST",
    tipo: "estructura",
    definicion: "Porcentaje de cumplimiento del presupuesto asignado para actividades de SST vs. presupuesto planificado",
    interpretacion: "Indica si los recursos económicos destinados a SST están siendo ejecutados según lo planificado. Valores bajos pueden afectar la implementación del sistema.",
    formula: "(Presupuesto SST ejecutado / Presupuesto SST planificado) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Área financiera y Plan Anual de Trabajo SST",
    meta: "≥ 90%"
  },
  {
    codigo: "IE-03",
    nombre: "Conformación COPASST",
    tipo: "estructura",
    definicion: "Verifica la conformación legal del Comité Paritario de Seguridad y Salud en el Trabajo según normativa colombiana",
    interpretacion: "Valor de 100% indica cumplimiento total. Incluye elección, capacitación y reuniones periódicas del comité.",
    formula: "(Requisitos COPASST cumplidos / Total requisitos COPASST exigidos) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "anual",
    fuenteInformacion: "Actas de reuniones COPASST y documentos de conformación",
    meta: "100%"
  },
  {
    codigo: "IE-04",
    nombre: "Asignación de Responsabilidades SST",
    tipo: "estructura",
    definicion: "Porcentaje de cargos con responsabilidades SST claramente asignadas y documentadas",
    interpretacion: "Mide qué tan bien están definidas las responsabilidades en SST a nivel organizacional. 100% indica definición completa.",
    formula: "(Cargos con responsabilidades SST asignadas / Total de cargos) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "anual",
    fuenteInformacion: "Perfiles de cargo y matriz de responsabilidades SST",
    meta: "100%"
  },

  // ========================================
  // INDICADORES DE PROCESO
  // ========================================
  {
    codigo: "IP-01",
    nombre: "Cumplimiento del Plan Anual de Trabajo SST",
    tipo: "proceso",
    definicion: "Porcentaje de actividades ejecutadas del Plan Anual de Trabajo en SST respecto a las planificadas",
    interpretacion: "Indica el nivel de ejecución del plan. Valores por debajo del 80% requieren análisis de causas y acciones correctivas.",
    formula: "(Actividades SST ejecutadas / Actividades SST planificadas) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Plan Anual de Trabajo SST y registros de ejecución",
    meta: "≥ 90%"
  },
  {
    codigo: "IP-02",
    nombre: "Cobertura de Capacitación en SST",
    tipo: "proceso",
    definicion: "Porcentaje de trabajadores que han recibido capacitación en SST durante el período",
    interpretacion: "Mide la efectividad del programa de capacitación. 100% indica que todos los trabajadores han sido capacitados según lo programado.",
    formula: "(Trabajadores capacitados en SST / Total de trabajadores) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "semestral",
    fuenteInformacion: "Registros de asistencia a capacitaciones y nómina",
    meta: "100%"
  },
  {
    codigo: "IP-03",
    nombre: "Cumplimiento de Inspecciones de Seguridad",
    tipo: "proceso",
    definicion: "Porcentaje de inspecciones de seguridad realizadas respecto a las programadas",
    interpretacion: "Evalúa el cumplimiento del cronograma de inspecciones. Valores inferiores al 90% indican debilidades en el seguimiento.",
    formula: "(Inspecciones realizadas / Inspecciones programadas) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteInformacion: "Programa de inspecciones y registros de inspecciones ejecutadas",
    meta: "≥ 95%"
  },
  {
    codigo: "IP-04",
    nombre: "Cumplimiento de Exámenes Médicos Ocupacionales",
    tipo: "proceso",
    definicion: "Porcentaje de exámenes médicos ocupacionales realizados según el programa de vigilancia epidemiológica",
    interpretacion: "Mide el cumplimiento del programa de medicina del trabajo. 100% indica cumplimiento total de exámenes programados.",
    formula: "(Exámenes médicos realizados / Exámenes médicos programados) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Programa de vigilancia epidemiológica y registros médicos",
    meta: "100%"
  },
  {
    codigo: "IP-05",
    nombre: "Intervención de Condiciones Inseguras",
    tipo: "proceso",
    definicion: "Porcentaje de condiciones inseguras identificadas que han sido intervenidas/corregidas",
    interpretacion: "Mide la efectividad en la corrección de condiciones inseguras. Valores altos indican gestión proactiva del riesgo.",
    formula: "(Condiciones inseguras corregidas / Total condiciones inseguras identificadas) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteInformacion: "Registros de inspecciones y plan de acción correctiva",
    meta: "≥ 85%"
  },
  {
    codigo: "IP-06",
    nombre: "Investigación de Incidentes y Accidentes",
    tipo: "proceso",
    definicion: "Porcentaje de incidentes y accidentes investigados dentro del plazo establecido",
    interpretacion: "Evalúa la capacidad de respuesta ante eventos. 100% indica que todos los eventos son investigados oportunamente.",
    formula: "(Incidentes investigados a tiempo / Total de incidentes reportados) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteInformacion: "Registros de accidentes/incidentes y reportes de investigación",
    meta: "100%"
  },
  {
    codigo: "IP-07",
    nombre: "Entrega de Elementos de Protección Personal (EPP)",
    tipo: "proceso",
    definicion: "Porcentaje de trabajadores que cuentan con los EPP necesarios según la matriz de EPP",
    interpretacion: "Mide el cumplimiento en la provisión de EPP. 100% indica que todos los trabajadores tienen los EPP requeridos.",
    formula: "(Trabajadores con EPP completos / Total trabajadores que requieren EPP) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Matriz de EPP y registros de entrega",
    meta: "100%"
  },

  // ========================================
  // INDICADORES DE RESULTADO
  // ========================================
  {
    codigo: "IR-01",
    nombre: "Índice de Frecuencia de Accidentes de Trabajo (IFAT)",
    tipo: "resultado",
    definicion: "Número de accidentes de trabajo por cada 100 trabajadores en el período",
    interpretacion: "Mide la cantidad de accidentes. Valores bajos indican mejor desempeño. Se compara con promedios del sector.",
    formula: "(Número de AT / Número promedio de trabajadores) * 100",
    unidadMedida: "AT por cada 100 trabajadores",
    frecuenciaMedicion: "mensual",
    fuenteInformacion: "Registros de accidentes de trabajo y nómina",
    meta: "< 2"
  },
  {
    codigo: "IR-02",
    nombre: "Índice de Severidad de Accidentes de Trabajo (ISAT)",
    tipo: "resultado",
    definicion: "Número de días perdidos por accidentes de trabajo por cada 100 trabajadores",
    interpretacion: "Mide la gravedad de los accidentes. Valores altos indican accidentes más severos que generan mayor pérdida de tiempo laboral.",
    formula: "(Total días perdidos por AT / Número promedio de trabajadores) * 100",
    unidadMedida: "Días perdidos por cada 100 trabajadores",
    frecuenciaMedicion: "mensual",
    fuenteInformacion: "Registros de accidentes de trabajo y días de incapacidad",
    meta: "< 50"
  },
  {
    codigo: "IR-03",
    nombre: "Índice de Lesiones Incapacitantes (ILI)",
    tipo: "resultado",
    definicion: "Combina frecuencia y severidad para medir el impacto global de los accidentes de trabajo",
    interpretacion: "Indicador compuesto que refleja tanto la frecuencia como la gravedad de los AT. Valores bajos son mejores.",
    formula: "(IFAT * ISAT) / 100",
    unidadMedida: "Índice",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Cálculo a partir de IFAT e ISAT",
    meta: "< 1"
  },
  {
    codigo: "IR-04",
    nombre: "Tasa de Ausentismo por Enfermedad Laboral",
    tipo: "resultado",
    definicion: "Porcentaje de días perdidos por enfermedad laboral respecto al total de días laborables",
    interpretacion: "Mide el impacto de enfermedades laborales en la productividad. Valores altos requieren intervención en vigilancia epidemiológica.",
    formula: "(Días perdidos por EL / (Total trabajadores * Días laborables)) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Registros de enfermedades laborales y ausentismo",
    meta: "< 2%"
  },
  {
    codigo: "IR-05",
    nombre: "Prevalencia de Enfermedad Laboral",
    tipo: "resultado",
    definicion: "Número de casos de enfermedad laboral diagnosticados por cada 100 trabajadores",
    interpretacion: "Mide la proporción de trabajadores afectados por enfermedades laborales. Valores altos requieren reforzar programas de prevención.",
    formula: "(Casos de EL diagnosticados / Número promedio de trabajadores) * 100",
    unidadMedida: "Casos por cada 100 trabajadores",
    frecuenciaMedicion: "anual",
    fuenteInformacion: "Registros de medicina del trabajo y diagnósticos médicos",
    meta: "< 1"
  },
  {
    codigo: "IR-06",
    nombre: "Reducción de Condiciones de Riesgo",
    tipo: "resultado",
    definicion: "Porcentaje de reducción de condiciones de riesgo identificadas en el período comparado con el período anterior",
    interpretacion: "Mide la mejora continua en la eliminación de riesgos. Valores positivos indican reducción efectiva de condiciones inseguras.",
    formula: "((Riesgos período anterior - Riesgos período actual) / Riesgos período anterior) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "semestral",
    fuenteInformacion: "Matriz de riesgos IPERC y registros de inspecciones",
    meta: "≥ 10%"
  },
  {
    codigo: "IR-07",
    nombre: "Cumplimiento de Acciones Correctivas y Preventivas",
    tipo: "resultado",
    definicion: "Porcentaje de acciones correctivas y preventivas cerradas efectivamente en el plazo establecido",
    interpretacion: "Mide la efectividad del sistema para cerrar brechas identificadas. 100% indica gestión óptima de mejoras.",
    formula: "(Acciones cerradas a tiempo / Total de acciones generadas) * 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Registros de acciones correctivas y preventivas",
    meta: "≥ 90%"
  },
  {
    codigo: "IR-08",
    nombre: "Tasa de Incidencia de Accidentes de Trabajo (por 240,000 HHT)",
    tipo: "resultado",
    definicion: "Número de accidentes de trabajo por cada 240,000 horas hombre trabajadas (estándar internacional)",
    interpretacion: "Indicador estándar OSHA que permite comparaciones internacionales. Valores bajos indican mejor desempeño en seguridad.",
    formula: "(Número de AT * 240,000) / Total HHT",
    unidadMedida: "AT por 240,000 HHT",
    frecuenciaMedicion: "trimestral",
    fuenteInformacion: "Registros de AT y horas hombre trabajadas",
    meta: "< 3"
  },
  {
    codigo: "IR-09",
    nombre: "Índice de Frecuencia de Incidentes",
    tipo: "resultado",
    definicion: "Número de incidentes (eventos sin lesión) reportados por cada 100 trabajadores",
    interpretacion: "Mide eventos potencialmente peligrosos. Valores altos pueden ser positivos (buena cultura de reporte) pero requieren análisis de causas.",
    formula: "(Número de incidentes / Número promedio de trabajadores) * 100",
    unidadMedida: "Incidentes por cada 100 trabajadores",
    frecuenciaMedicion: "mensual",
    fuenteInformacion: "Registros de incidentes y casi accidentes",
    meta: "Tendencia decreciente"
  },
  {
    codigo: "IR-10",
    nombre: "Mejora en Evaluación de Estándares Mínimos (Resolución 0312)",
    tipo: "resultado",
    definicion: "Incremento porcentual en la calificación de Estándares Mínimos SST comparado con evaluación anterior",
    interpretacion: "Mide la mejora del SG-SST según normativa colombiana. Valores positivos indican avance hacia cumplimiento total.",
    formula: "Calificación actual - Calificación período anterior",
    unidadMedida: "Puntos o %",
    frecuenciaMedicion: "anual",
    fuenteInformacion: "Autoevaluación de Estándares Mínimos Resolución 0312/2019",
    meta: "≥ 5 puntos o alcanzar 100%"
  }
];

export function getIndicadorByCodigo(codigo: string): IndicadorPredefinido | undefined {
  return indicadoresSstPredefinidos.find(ind => ind.codigo === codigo);
}

export function getIndicadoresByTipo(tipo: "estructura" | "proceso" | "resultado"): IndicadorPredefinido[] {
  return indicadoresSstPredefinidos.filter(ind => ind.tipo === tipo);
}

export const formulasSugeridas = {
  estructura: [
    "(Recursos disponibles / Recursos requeridos) * 100",
    "(Requisitos cumplidos / Total requisitos) * 100",
    "(Personal capacitado / Total personal requerido) * 100",
    "(Documentos implementados / Total documentos SG-SST) * 100"
  ],
  proceso: [
    "(Actividades ejecutadas / Actividades programadas) * 100",
    "(Controles implementados / Controles identificados) * 100",
    "(Inspecciones realizadas / Inspecciones programadas) * 100",
    "(Capacitaciones realizadas / Capacitaciones programadas) * 100"
  ],
  resultado: [
    "(Número de AT / Número promedio de trabajadores) * 100",
    "(Días perdidos por AT / Número promedio de trabajadores) * 100",
    "(Condiciones corregidas / Condiciones identificadas) * 100",
    "((Valor período anterior - Valor actual) / Valor período anterior) * 100"
  ]
};
