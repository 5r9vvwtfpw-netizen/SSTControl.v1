/**
 * Catálogo de Tipos de Medidas Preventivas/Correctivas
 * Para auto-llenado inteligente de formularios
 * Basado en Decreto 1072/2015 Art. 2.2.4.6.33 y Resolución 0312/2019 Est. 4.1.1
 */

export interface TipoMedidaPreventiva {
  codigo: string;
  categoria: 'preventiva' | 'correctiva' | 'mejora';
  nombre: string;
  descripcionSugerida: string;
  prioridadSugerida: 'baja' | 'media' | 'alta';
  diasPlazoSugerido: number;
  areasSugeridas: string[];
  etiquetas: string[];
}

export const CATEGORIAS_MEDIDAS = [
  { id: 'preventiva', nombre: 'Preventiva', descripcion: 'Acción para eliminar la causa de una no conformidad potencial' },
  { id: 'correctiva', nombre: 'Correctiva', descripcion: 'Acción para eliminar la causa de una no conformidad detectada' },
  { id: 'mejora', nombre: 'Mejora Continua', descripcion: 'Acción para mejorar el desempeño del SG-SST' },
];

export const TIPOS_MEDIDAS_PREVENTIVAS: TipoMedidaPreventiva[] = [
  // === CAPACITACIÓN Y FORMACIÓN ===
  {
    codigo: 'MP-CAP-001',
    categoria: 'preventiva',
    nombre: 'Capacitación en uso de EPP',
    descripcionSugerida: 'Programa de formación para el uso correcto de elementos de protección personal según riesgos identificados en el puesto de trabajo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Producción', 'Mantenimiento', 'Logística'],
    etiquetas: ['EPP', 'Capacitación', 'Seguridad']
  },
  {
    codigo: 'MP-CAP-002',
    categoria: 'preventiva',
    nombre: 'Entrenamiento en trabajo en alturas',
    descripcionSugerida: 'Formación y certificación en trabajo seguro en alturas conforme a Resolución 4272/2021.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 45,
    areasSugeridas: ['Construcción', 'Mantenimiento', 'Instalaciones'],
    etiquetas: ['Alturas', 'Certificación', 'Seguridad']
  },
  {
    codigo: 'MP-CAP-003',
    categoria: 'preventiva',
    nombre: 'Capacitación en manejo de sustancias químicas',
    descripcionSugerida: 'Formación en manipulación, almacenamiento y respuesta a derrames de sustancias químicas según SGA/GHS.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Laboratorio', 'Producción', 'Almacén'],
    etiquetas: ['Químicos', 'SGA', 'FDS']
  },
  {
    codigo: 'MP-CAP-004',
    categoria: 'preventiva',
    nombre: 'Inducción y reinducción SST',
    descripcionSugerida: 'Programa de inducción para trabajadores nuevos y reinducción anual sobre el SG-SST de la empresa.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Recursos Humanos', 'SST', 'Todas las áreas'],
    etiquetas: ['Inducción', 'SG-SST', 'Nuevos']
  },
  
  // === INSPECCIONES Y CONTROLES ===
  {
    codigo: 'MP-INS-001',
    categoria: 'preventiva',
    nombre: 'Inspección de extintores',
    descripcionSugerida: 'Verificación mensual del estado, ubicación, accesibilidad y vigencia de recarga de extintores portátiles.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Todas las áreas', 'Emergencias', 'Seguridad'],
    etiquetas: ['Extintores', 'Inspección', 'Emergencias']
  },
  {
    codigo: 'MP-INS-002',
    categoria: 'preventiva',
    nombre: 'Inspección de instalaciones locativas',
    descripcionSugerida: 'Revisión del estado de pisos, techos, paredes, señalización, iluminación y condiciones de orden y aseo.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Infraestructura', 'Mantenimiento', 'Todas las áreas'],
    etiquetas: ['Locativo', 'Infraestructura', 'Inspección']
  },
  {
    codigo: 'MP-INS-003',
    categoria: 'preventiva',
    nombre: 'Inspección de maquinaria y equipos',
    descripcionSugerida: 'Verificación del estado de máquinas, guardas de seguridad, dispositivos de emergencia y etiquetado.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Producción', 'Mantenimiento', 'Operaciones'],
    etiquetas: ['Maquinaria', 'Guardas', 'Seguridad']
  },
  {
    codigo: 'MP-INS-004',
    categoria: 'preventiva',
    nombre: 'Inspección de herramientas manuales',
    descripcionSugerida: 'Revisión del estado de herramientas manuales, eléctricas y neumáticas antes de su uso.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Mantenimiento', 'Producción', 'Taller'],
    etiquetas: ['Herramientas', 'Inspección', 'Manual']
  },
  
  // === CORRECTIVAS ===
  {
    codigo: 'MC-HAL-001',
    categoria: 'correctiva',
    nombre: 'Corrección de hallazgo de inspección',
    descripcionSugerida: 'Implementación de acciones correctivas para subsanar hallazgos identificados durante inspecciones de seguridad.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Área afectada', 'Mantenimiento', 'SST'],
    etiquetas: ['Hallazgo', 'Corrección', 'Inspección']
  },
  {
    codigo: 'MC-ACC-001',
    categoria: 'correctiva',
    nombre: 'Acción correctiva por accidente de trabajo',
    descripcionSugerida: 'Implementación de medidas de control derivadas de la investigación de accidente de trabajo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Área del accidente', 'SST', 'Gerencia'],
    etiquetas: ['Accidente', 'Investigación', 'Control']
  },
  {
    codigo: 'MC-ENF-001',
    categoria: 'correctiva',
    nombre: 'Acción correctiva por enfermedad laboral',
    descripcionSugerida: 'Implementación de controles para prevenir nuevos casos de enfermedad laboral detectada.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 45,
    areasSugeridas: ['Salud Ocupacional', 'Área afectada', 'SST'],
    etiquetas: ['Enfermedad', 'Salud', 'PVE']
  },
  {
    codigo: 'MC-AUD-001',
    categoria: 'correctiva',
    nombre: 'Cierre de no conformidad de auditoría',
    descripcionSugerida: 'Implementación de acciones correctivas para cerrar no conformidades identificadas en auditoría interna o externa.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Área auditada', 'SST', 'Calidad'],
    etiquetas: ['Auditoría', 'No conformidad', 'Cierre']
  },
  
  // === MEJORA CONTINUA ===
  {
    codigo: 'MM-PRO-001',
    categoria: 'mejora',
    nombre: 'Actualización de procedimiento de trabajo',
    descripcionSugerida: 'Revisión y mejora de procedimientos de trabajo seguro según lecciones aprendidas y mejores prácticas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Área del procedimiento', 'SST', 'Calidad'],
    etiquetas: ['Procedimiento', 'Actualización', 'Mejora']
  },
  {
    codigo: 'MM-IND-001',
    categoria: 'mejora',
    nombre: 'Mejora de indicadores SST',
    descripcionSugerida: 'Implementación de acciones para mejorar indicadores de gestión en seguridad y salud en el trabajo.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Gerencia', 'Todas las áreas'],
    etiquetas: ['Indicadores', 'Gestión', 'Mejora']
  },
  {
    codigo: 'MM-TEC-001',
    categoria: 'mejora',
    nombre: 'Implementación de nuevo control de ingeniería',
    descripcionSugerida: 'Instalación de controles de ingeniería para eliminar o reducir exposición a factores de riesgo.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Área de implementación', 'Mantenimiento', 'SST'],
    etiquetas: ['Ingeniería', 'Control', 'Tecnología']
  },
  {
    codigo: 'MM-DOC-001',
    categoria: 'mejora',
    nombre: 'Actualización de matriz IPERC',
    descripcionSugerida: 'Revisión y actualización de la matriz de identificación de peligros, evaluación y valoración de riesgos.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 45,
    areasSugeridas: ['SST', 'Todas las áreas', 'COPASST'],
    etiquetas: ['IPERC', 'Matriz', 'Riesgos']
  },
];

/**
 * Genera código único para medida preventiva/correctiva
 * Formato: {Tipo}-{Año}-{Consecutivo}
 * Ejemplo: MP-2026-001, MC-2026-002
 */
export function generarCodigoMedida(
  categoria: 'preventiva' | 'correctiva' | 'mejora',
  consecutivoExistente: number
): string {
  const prefijos = {
    preventiva: 'MP',
    correctiva: 'MC',
    mejora: 'MM'
  };
  const year = new Date().getFullYear();
  const consecutivo = String(consecutivoExistente + 1).padStart(3, '0');
  return `${prefijos[categoria]}-${year}-${consecutivo}`;
}

/**
 * Calcula fecha de vencimiento sugerida
 */
export function calcularFechaVencimiento(diasPlazo: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasPlazo);
  return fecha.toISOString().split('T')[0];
}

/**
 * Filtra medidas por categoría
 */
export function getMedidasPorCategoria(categoria: 'preventiva' | 'correctiva' | 'mejora'): TipoMedidaPreventiva[] {
  return TIPOS_MEDIDAS_PREVENTIVAS.filter(m => m.categoria === categoria);
}

/**
 * Busca medidas por etiqueta
 */
export function getMedidasPorEtiqueta(etiqueta: string): TipoMedidaPreventiva[] {
  return TIPOS_MEDIDAS_PREVENTIVAS.filter(m => 
    m.etiquetas.some(e => e.toLowerCase().includes(etiqueta.toLowerCase()))
  );
}
