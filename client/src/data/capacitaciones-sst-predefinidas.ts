export interface CapacitacionPredefinida {
  codigo: string;
  titulo: string;
  descripcion: string;
  duracionHoras: number;
  validezMeses?: number;
  categoria: 'seguridad' | 'salud' | 'emergencias' | 'normatividad' | 'especializadas';
  nivel: 'basico' | 'intermedio' | 'avanzado';
  obligatoria: boolean;
  normativa?: string;
}

export const capacitacionesSstPredefinidas: CapacitacionPredefinida[] = [
  {
    codigo: 'CAP-SEG-01',
    titulo: 'Inducción y Reinducción en SST',
    descripcion: 'Capacitación de inducción para nuevos trabajadores y reinducción anual para personal existente sobre el Sistema de Gestión de Seguridad y Salud en el Trabajo de la empresa.',
    duracionHoras: 4,
    validezMeses: 12,
    categoria: 'normatividad',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'Resolución 0312/2019 - Art. 18'
  },
  {
    codigo: 'CAP-SEG-02',
    titulo: 'Trabajo en Alturas - Nivel Básico',
    descripcion: 'Capacitación obligatoria para trabajadores que realizan labores en alturas con riesgos de caída mayores a 1.50 metros. Incluye medidas de prevención, protección contra caídas, selección y uso de equipos.',
    duracionHoras: 8,
    validezMeses: 24,
    categoria: 'seguridad',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'Resolución 1409/2012 - Trabajo en Alturas'
  },
  {
    codigo: 'CAP-SEG-03',
    titulo: 'Trabajo en Alturas - Nivel Avanzado',
    descripcion: 'Capacitación avanzada para supervisores de trabajo en alturas, rescatistas y coordinadores. Incluye evaluación de riesgos, supervisión de trabajos, técnicas de rescate y procedimientos de emergencia.',
    duracionHoras: 40,
    validezMeses: 24,
    categoria: 'seguridad',
    nivel: 'avanzado',
    obligatoria: false,
    normativa: 'Resolución 1409/2012 - Trabajo en Alturas'
  },
  {
    codigo: 'CAP-SEG-04',
    titulo: 'Uso y Mantenimiento de Elementos de Protección Personal (EPP)',
    descripcion: 'Capacitación sobre selección, uso correcto, mantenimiento y almacenamiento de EPP. Incluye cascos, gafas, guantes, protección auditiva, respiratoria y equipos de protección contra caídas.',
    duracionHoras: 2,
    validezMeses: 12,
    categoria: 'seguridad',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'Resolución 2400/1979 - Art. 176-177'
  },
  {
    codigo: 'CAP-SEG-05',
    titulo: 'Prevención y Control de Incendios',
    descripcion: 'Capacitación en prevención de incendios, uso de extintores portátiles, clases de fuego, plan de evacuación y actuación en caso de conato de incendio.',
    duracionHoras: 4,
    validezMeses: 12,
    categoria: 'emergencias',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'NSR-10 Título J'
  },
  {
    codigo: 'CAP-SEG-06',
    titulo: 'Brigada de Emergencias - Nivel Básico',
    descripcion: 'Formación de brigadistas en primeros auxilios, evacuación, prevención y control de incendios, y comunicaciones de emergencia. Incluye práctica y simulacros.',
    duracionHoras: 16,
    validezMeses: 12,
    categoria: 'emergencias',
    nivel: 'intermedio',
    obligatoria: false,
    normativa: 'Resolución 2400/1979'
  },
  {
    codigo: 'CAP-SAL-01',
    titulo: 'Primeros Auxilios Básicos',
    descripcion: 'Capacitación en atención inicial de emergencias médicas: RCP, atención de hemorragias, fracturas, quemaduras, desmayos, shock y traslado de lesionados.',
    duracionHoras: 8,
    validezMeses: 12,
    categoria: 'emergencias',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'Resolución 0705/2007'
  },
  {
    codigo: 'CAP-SAL-02',
    titulo: 'Prevención de Riesgos Ergonómicos',
    descripcion: 'Capacitación en identificación y control de riesgos ergonómicos, pausas activas, higiene postural, manipulación manual de cargas y acondicionamiento del puesto de trabajo.',
    duracionHoras: 4,
    validezMeses: 12,
    categoria: 'salud',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'Resolución 2400/1979 - Capítulo V'
  },
  {
    codigo: 'CAP-SAL-03',
    titulo: 'Prevención de Riesgos Psicosociales',
    descripcion: 'Capacitación en identificación de factores de riesgo psicosocial, prevención del estrés laboral, manejo de conflictos y promoción de la salud mental en el trabajo.',
    duracionHoras: 4,
    validezMeses: 12,
    categoria: 'salud',
    nivel: 'basico',
    obligatoria: true,
    normativa: 'Resolución 2646/2008'
  },
  {
    codigo: 'CAP-SAL-04',
    titulo: 'Prevención del Consumo de Alcohol y Sustancias Psicoactivas',
    descripcion: 'Capacitación sobre efectos del consumo de alcohol, tabaco y sustancias psicoactivas en el ambiente laboral, estrategias de prevención y apoyo al trabajador.',
    duracionHoras: 2,
    validezMeses: 12,
    categoria: 'salud',
    nivel: 'basico',
    obligatoria: false,
    normativa: 'Ley 1566/2012'
  },
  {
    codigo: 'CAP-SEG-07',
    titulo: 'Seguridad Eléctrica',
    descripcion: 'Capacitación sobre riesgos eléctricos, protección contra contactos directos e indirectos, procedimientos de trabajo seguro con energía eléctrica, bloqueo y etiquetado.',
    duracionHoras: 8,
    validezMeses: 12,
    categoria: 'seguridad',
    nivel: 'intermedio',
    obligatoria: false,
    normativa: 'Resolución 5018/2019 - RETIE'
  },
  {
    codigo: 'CAP-SEG-08',
    titulo: 'Manejo Seguro de Sustancias Químicas',
    descripcion: 'Capacitación en identificación de sustancias peligrosas, interpretación de fichas de seguridad (SDS), Sistema Globalmente Armonizado (SGA), uso de EPP químico y respuesta a derrames.',
    duracionHoras: 6,
    validezMeses: 12,
    categoria: 'seguridad',
    nivel: 'intermedio',
    obligatoria: false,
    normativa: 'Decreto 1496/2018 - SGA'
  },
  {
    codigo: 'CAP-SEG-09',
    titulo: 'Espacios Confinados',
    descripcion: 'Capacitación sobre identificación de espacios confinados, evaluación de atmósferas peligrosas, procedimientos de entrada segura, uso de equipos de ventilación y rescate.',
    duracionHoras: 8,
    validezMeses: 12,
    categoria: 'seguridad',
    nivel: 'avanzado',
    obligatoria: false,
    normativa: 'Resolución 2400/1979 - Art. 191-193'
  },
  {
    codigo: 'CAP-SEG-10',
    titulo: 'Seguridad Vial y Conducción Defensiva',
    descripcion: 'Capacitación en normatividad vial colombiana, técnicas de conducción defensiva, gestión del riesgo vial, prevención de accidentes de tránsito y responsabilidad del conductor.',
    duracionHoras: 4,
    validezMeses: 12,
    categoria: 'seguridad',
    nivel: 'basico',
    obligatoria: false,
    normativa: 'Resolución 1565/2014 - PESV'
  },
  {
    codigo: 'CAP-SEG-11',
    titulo: 'Máquinas y Herramientas',
    descripcion: 'Capacitación sobre uso seguro de maquinaria industrial, herramientas manuales y eléctricas, protecciones mecánicas, mantenimiento preventivo y procedimientos de trabajo seguro.',
    duracionHoras: 4,
    validezMeses: 12,
    categoria: 'seguridad',
    nivel: 'intermedio',
    obligatoria: false,
    normativa: 'Resolución 2400/1979 - Título IV'
  },
  {
    codigo: 'CAP-NOR-01',
    titulo: 'Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)',
    descripcion: 'Capacitación sobre el Sistema de Gestión de SST según Decreto 1072/2015, ciclo PHVA, estándares mínimos Resolución 0312/2019, roles y responsabilidades.',
    duracionHoras: 6,
    validezMeses: 12,
    categoria: 'normatividad',
    nivel: 'intermedio',
    obligatoria: true,
    normativa: 'Decreto 1072/2015 - Libro 2, Parte 2, Título 4, Capítulo 6'
  },
  {
    codigo: 'CAP-NOR-02',
    titulo: 'Investigación de Accidentes e Incidentes de Trabajo',
    descripcion: 'Capacitación en metodología de investigación de accidentes e incidentes, identificación de causas básicas e inmediatas, análisis de árbol de causas, reporte y medidas correctivas.',
    duracionHoras: 8,
    validezMeses: 12,
    categoria: 'normatividad',
    nivel: 'intermedio',
    obligatoria: true,
    normativa: 'Resolución 1401/2007'
  },
  {
    codigo: 'CAP-NOR-03',
    titulo: 'COPASST - Comité Paritario de Seguridad y Salud en el Trabajo',
    descripcion: 'Capacitación para miembros del COPASST sobre funciones, obligaciones, investigación de incidentes, inspecciones de seguridad y participación en el SG-SST.',
    duracionHoras: 50,
    validezMeses: 24,
    categoria: 'normatividad',
    nivel: 'avanzado',
    obligatoria: true,
    normativa: 'Resolución 2013/1986 - Decreto 1072/2015'
  },
  {
    codigo: 'CAP-NOR-04',
    titulo: 'Comité de Convivencia Laboral',
    descripcion: 'Capacitación para integrantes del Comité de Convivencia sobre prevención y manejo del acoso laboral, procedimientos de atención de quejas y resolución de conflictos.',
    duracionHoras: 20,
    validezMeses: 24,
    categoria: 'normatividad',
    nivel: 'intermedio',
    obligatoria: true,
    normativa: 'Resolución 652/2012 - Ley 1010/2006'
  },
  {
    codigo: 'CAP-ESP-01',
    titulo: 'Curso de 50 Horas en SST (Decreto 1443)',
    descripcion: 'Capacitación de 50 horas para personal del SG-SST sobre implementación, mantenimiento y mejora continua del sistema según normativa colombiana vigente.',
    duracionHoras: 50,
    validezMeses: undefined,
    categoria: 'especializadas',
    nivel: 'avanzado',
    obligatoria: false,
    normativa: 'Decreto 1072/2015 - Art. 2.2.4.6.11'
  }
];

export function getCapacitacionByCodigo(codigo: string): CapacitacionPredefinida | undefined {
  return capacitacionesSstPredefinidas.find(cap => cap.codigo === codigo);
}

export const categoriaLabels = {
  seguridad: 'Seguridad Industrial',
  salud: 'Salud Ocupacional',
  emergencias: 'Emergencias',
  normatividad: 'Normatividad SST',
  especializadas: 'Especializadas'
};

export const nivelLabels = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado'
};
