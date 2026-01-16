export interface InspeccionPredefinida {
  codigo: string;
  area: string;
  descripcion: string;
  itemsVerificacion: string[];
  frecuencia: 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
  categoria: 'epp' | 'equipos' | 'instalaciones' | 'orden-aseo' | 'emergencias' | 'vehiculos' | 'ergonomia';
  criticidad: 'alta' | 'media' | 'baja';
  normativa?: string;
}

export const inspeccionesSstPredefinidas: InspeccionPredefinida[] = [
  {
    codigo: 'INS-EPP-01',
    area: 'Elementos de Protección Personal (EPP)',
    descripcion: 'Inspección del estado y uso adecuado de equipos de protección personal en todas las áreas de trabajo.',
    itemsVerificacion: [
      'Uso correcto de cascos de seguridad',
      'Estado de botas de seguridad',
      'Utilización de gafas de protección',
      'Uso de guantes según la tarea',
      'Estado de protección auditiva',
      'Verificación de protección respiratoria',
      'Arneses y líneas de vida en buen estado'
    ],
    frecuencia: 'semanal',
    categoria: 'epp',
    criticidad: 'alta',
    normativa: 'Resolución 2400/1979 - Art. 176-177'
  },
  {
    codigo: 'INS-EQU-01',
    area: 'Extintores Portátiles',
    descripcion: 'Inspección mensual del estado, accesibilidad y vigencia de extintores portátiles.',
    itemsVerificacion: [
      'Ubicación y señalización adecuada',
      'Acceso libre y despejado',
      'Manómetro en zona verde',
      'Precinto de seguridad intacto',
      'Manguera y boquilla en buen estado',
      'Tarjeta de inspección al día',
      'Fecha de recarga vigente',
      'Libre de golpes y corrosión'
    ],
    frecuencia: 'mensual',
    categoria: 'equipos',
    criticidad: 'alta',
    normativa: 'NSR-10 Título J - NTC 2885'
  },
  {
    codigo: 'INS-EQU-02',
    area: 'Botiquines de Primeros Auxilios',
    descripcion: 'Verificación del contenido, estado y vigencia de los elementos de botiquines de primeros auxilios.',
    itemsVerificacion: [
      'Señalización y ubicación visible',
      'Inventario completo de elementos',
      'Medicamentos dentro de fecha de vencimiento',
      'Material de curación estéril',
      'Presencia de guía de primeros auxilios',
      'Orden y limpieza del botiquín',
      'Registro de uso actualizado'
    ],
    frecuencia: 'mensual',
    categoria: 'equipos',
    criticidad: 'alta',
    normativa: 'Resolución 0705/2007'
  },
  {
    codigo: 'INS-INS-01',
    area: 'Instalaciones Eléctricas',
    descripcion: 'Inspección de seguridad en instalaciones eléctricas, tableros, tomas y extensiones.',
    itemsVerificacion: [
      'Estado de cableado sin empalmes expuestos',
      'Tableros eléctricos cerrados y señalizados',
      'Tomas eléctricas en buen estado',
      'Extensiones eléctricas sin sobrecarga',
      'Sistema de puesta a tierra funcional',
      'Ausencia de cables en pasillos',
      'Protecciones diferenciales operativas'
    ],
    frecuencia: 'mensual',
    categoria: 'instalaciones',
    criticidad: 'alta',
    normativa: 'Resolución 5018/2019 - RETIE'
  },
  {
    codigo: 'INS-ORD-01',
    area: 'Orden y Aseo General',
    descripcion: 'Inspección de condiciones de orden, limpieza y organización en todas las áreas de trabajo.',
    itemsVerificacion: [
      'Pisos limpios y libres de obstáculos',
      'Pasillos y salidas despejadas',
      'Herramientas y materiales organizados',
      'Residuos en contenedores apropiados',
      'Áreas de trabajo ordenadas',
      'Iluminación adecuada',
      'Ausencia de derrames'
    ],
    frecuencia: 'semanal',
    categoria: 'orden-aseo',
    criticidad: 'media',
    normativa: 'Resolución 2400/1979'
  },
  {
    codigo: 'INS-EME-01',
    area: 'Señalización de Emergencia',
    descripcion: 'Verificación del estado y visibilidad de señalización de emergencias, rutas de evacuación y puntos de encuentro.',
    itemsVerificacion: [
      'Señales de salida visibles y legibles',
      'Rutas de evacuación señalizadas',
      'Punto de encuentro identificado',
      'Señales fotoluminiscentes funcionales',
      'Planos de evacuación actualizados',
      'Señales de no obstruir en salidas',
      'Identificación de equipos de emergencia'
    ],
    frecuencia: 'mensual',
    categoria: 'emergencias',
    criticidad: 'alta',
    normativa: 'NTC 1461 - NSR-10'
  },
  {
    codigo: 'INS-EME-02',
    area: 'Luces de Emergencia',
    descripcion: 'Inspección del funcionamiento de sistemas de iluminación de emergencia.',
    itemsVerificacion: [
      'Prueba de encendido automático',
      'Tiempo de autonomía adecuado',
      'Cobertura de iluminación suficiente',
      'Estado de baterías',
      'Lámparas sin daños',
      'Ubicación estratégica',
      'Mantenimiento al día'
    ],
    frecuencia: 'mensual',
    categoria: 'emergencias',
    criticidad: 'alta',
    normativa: 'NSR-10 Título J'
  },
  {
    codigo: 'INS-INS-02',
    area: 'Escaleras y Barandas',
    descripcion: 'Inspección de condiciones de seguridad en escaleras, pasamanos y barandas.',
    itemsVerificacion: [
      'Peldaños en buen estado',
      'Superficie antideslizante',
      'Barandas firmes y completas',
      'Pasamanos a altura adecuada',
      'Iluminación suficiente',
      'Señalización de escalones',
      'Ausencia de obstáculos'
    ],
    frecuencia: 'mensual',
    categoria: 'instalaciones',
    criticidad: 'alta',
    normativa: 'Resolución 2400/1979'
  },
  {
    codigo: 'INS-EQU-03',
    area: 'Herramientas Manuales y Eléctricas',
    descripcion: 'Verificación del estado de herramientas manuales y eléctricas en uso.',
    itemsVerificacion: [
      'Mangos y empuñaduras en buen estado',
      'Ausencia de fisuras o desgaste',
      'Cables eléctricos sin daños',
      'Guardas de protección presentes',
      'Herramientas limpias y libres de grasa',
      'Almacenamiento adecuado',
      'Identificación y registro'
    ],
    frecuencia: 'mensual',
    categoria: 'equipos',
    criticidad: 'media',
    normativa: 'Resolución 2400/1979 - Título IV'
  },
  {
    codigo: 'INS-INS-03',
    area: 'Almacenamiento de Materiales',
    descripcion: 'Inspección de condiciones de almacenamiento y apilamiento de materiales.',
    itemsVerificacion: [
      'Apilamiento estable y seguro',
      'Altura de apilado adecuada',
      'Materiales pesados en niveles bajos',
      'Estanterías ancladas y en buen estado',
      'Capacidad de carga respetada',
      'Pasillos de circulación despejados',
      'Identificación de materiales peligrosos'
    ],
    frecuencia: 'mensual',
    categoria: 'instalaciones',
    criticidad: 'media',
    normativa: 'Resolución 2400/1979'
  },
  {
    codigo: 'INS-VEH-01',
    area: 'Vehículos - Inspección Preoperacional',
    descripcion: 'Inspección diaria preoperacional de vehículos antes de su uso.',
    itemsVerificacion: [
      'Niveles de fluidos (aceite, refrigerante, líquidos)',
      'Estado de neumáticos y presión',
      'Funcionamiento de luces y direccionales',
      'Espejos retrovisores completos',
      'Frenos operativos',
      'Cinturones de seguridad funcionales',
      'Presencia de botiquín y extintor',
      'Documentación del vehículo vigente'
    ],
    frecuencia: 'diaria',
    categoria: 'vehiculos',
    criticidad: 'alta',
    normativa: 'Resolución 1565/2014 - PESV'
  },
  {
    codigo: 'INS-ERG-01',
    area: 'Puestos de Trabajo - Ergonomía',
    descripcion: 'Inspección de condiciones ergonómicas en puestos de trabajo.',
    itemsVerificacion: [
      'Silla ajustable y con soporte lumbar',
      'Altura de escritorio adecuada',
      'Monitor a altura y distancia correcta',
      'Iluminación suficiente sin reflejos',
      'Espacio para movimiento de piernas',
      'Teclado y mouse a altura adecuada',
      'Postura de trabajo correcta',
      'Implementación de pausas activas'
    ],
    frecuencia: 'trimestral',
    categoria: 'ergonomia',
    criticidad: 'media',
    normativa: 'Resolución 2400/1979 - Capítulo V'
  },
  {
    codigo: 'INS-EQU-04',
    area: 'Maquinaria y Equipos Industriales',
    descripcion: 'Inspección de seguridad en maquinaria y equipos de producción.',
    itemsVerificacion: [
      'Guardas de protección instaladas',
      'Botones de parada de emergencia accesibles',
      'Sistema de bloqueo/etiquetado disponible',
      'Ausencia de fugas de aceite o fluidos',
      'Ruido dentro de límites permisibles',
      'Señalización de advertencia visible',
      'Mantenimiento preventivo al día'
    ],
    frecuencia: 'mensual',
    categoria: 'equipos',
    criticidad: 'alta',
    normativa: 'Resolución 2400/1979 - Título IV'
  },
  {
    codigo: 'INS-INS-04',
    area: 'Sanitarios y Vestuarios',
    descripcion: 'Inspección de condiciones de higiene y funcionalidad de servicios sanitarios.',
    itemsVerificacion: [
      'Limpieza y desinfección adecuada',
      'Sanitarios funcionales',
      'Agua potable disponible',
      'Jabón y papel higiénico suficiente',
      'Secadores o toallas disponibles',
      'Iluminación y ventilación adecuadas',
      'Estado de pisos y paredes',
      'Privacidad garantizada'
    ],
    frecuencia: 'semanal',
    categoria: 'instalaciones',
    criticidad: 'media',
    normativa: 'Resolución 2400/1979 - Art. 17-19'
  },
  {
    codigo: 'INS-EME-03',
    area: 'Sistema de Detección y Alarma',
    descripcion: 'Verificación del funcionamiento de sistemas de detección de incendio y alarmas.',
    itemsVerificacion: [
      'Detectores de humo limpios y operativos',
      'Pulsadores manuales accesibles',
      'Prueba de sonido de alarma',
      'Panel de control sin fallas',
      'Batería de respaldo funcional',
      'Señalización de pulsadores visible',
      'Registro de pruebas actualizado'
    ],
    frecuencia: 'mensual',
    categoria: 'emergencias',
    criticidad: 'alta',
    normativa: 'NSR-10 Título J - NTC 2388'
  }
];

export function getInspeccionByCodigo(codigo: string): InspeccionPredefinida | undefined {
  return inspeccionesSstPredefinidas.find(insp => insp.codigo === codigo);
}

export const categoriaInspeccionLabels = {
  epp: 'Elementos de Protección Personal',
  equipos: 'Equipos y Herramientas',
  instalaciones: 'Instalaciones',
  'orden-aseo': 'Orden y Aseo',
  emergencias: 'Emergencias',
  vehiculos: 'Vehículos',
  ergonomia: 'Ergonomía'
};

export const frecuenciaLabels = {
  diaria: 'Diaria',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual'
};
