/**
 * Catálogo Completo de Tipos de Medidas Preventivas/Correctivas/Mejora
 * Para auto-llenado inteligente de formularios
 * Basado en Decreto 1072/2015, Resolución 0312/2019, ISO 45001:2018
 * y normativa colombiana aplicable en SST
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
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║                    MEDIDAS PREVENTIVAS                           ║
  // ╚══════════════════════════════════════════════════════════════════╝

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
  {
    codigo: 'MP-CAP-005',
    categoria: 'preventiva',
    nombre: 'Capacitación en primeros auxilios',
    descripcionSugerida: 'Formación básica en primeros auxilios para brigadistas y personal designado.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Brigadas', 'SST', 'Emergencias'],
    etiquetas: ['Primeros auxilios', 'Brigada', 'Emergencias']
  },
  {
    codigo: 'MP-CAP-006',
    categoria: 'preventiva',
    nombre: 'Capacitación en control de incendios',
    descripcionSugerida: 'Formación en prevención y control de incendios, uso de extintores y evacuación.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Brigadas', 'Seguridad', 'Emergencias'],
    etiquetas: ['Incendios', 'Extintores', 'Brigada']
  },
  {
    codigo: 'MP-CAP-007',
    categoria: 'preventiva',
    nombre: 'Capacitación en evacuación y rescate',
    descripcionSugerida: 'Entrenamiento en procedimientos de evacuación, puntos de encuentro y técnicas de rescate básico.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Brigadas', 'SST', 'Emergencias'],
    etiquetas: ['Evacuación', 'Rescate', 'Emergencias']
  },
  {
    codigo: 'MP-CAP-008',
    categoria: 'preventiva',
    nombre: 'Capacitación en riesgo eléctrico',
    descripcionSugerida: 'Formación en prevención de riesgo eléctrico según RETIE y normas aplicables.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Mantenimiento', 'Electricidad', 'Operaciones'],
    etiquetas: ['Eléctrico', 'RETIE', 'Seguridad']
  },
  {
    codigo: 'MP-CAP-009',
    categoria: 'preventiva',
    nombre: 'Capacitación en espacios confinados',
    descripcionSugerida: 'Formación en trabajo seguro en espacios confinados: identificación, permisos y rescate.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 45,
    areasSugeridas: ['Mantenimiento', 'Operaciones', 'Construcción'],
    etiquetas: ['Espacios confinados', 'Permisos', 'Rescate']
  },
  {
    codigo: 'MP-CAP-010',
    categoria: 'preventiva',
    nombre: 'Capacitación en manejo defensivo',
    descripcionSugerida: 'Formación en técnicas de manejo defensivo para conductores de la empresa.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Transporte', 'Logística', 'Ventas'],
    etiquetas: ['Manejo defensivo', 'Vehículos', 'PESV']
  },
  {
    codigo: 'MP-CAP-011',
    categoria: 'preventiva',
    nombre: 'Capacitación en riesgo biomecánico',
    descripcionSugerida: 'Formación en higiene postural, manipulación de cargas y pausas activas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Administrativo', 'Producción', 'Logística'],
    etiquetas: ['Ergonomía', 'Posturas', 'DME']
  },
  {
    codigo: 'MP-CAP-012',
    categoria: 'preventiva',
    nombre: 'Capacitación en riesgo psicosocial',
    descripcionSugerida: 'Formación en manejo del estrés, comunicación asertiva y prevención del acoso laboral.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Recursos Humanos', 'Todas las áreas', 'SST'],
    etiquetas: ['Psicosocial', 'Estrés', 'Batería']
  },
  {
    codigo: 'MP-CAP-013',
    categoria: 'preventiva',
    nombre: 'Capacitación en seguridad vial',
    descripcionSugerida: 'Formación en normas de tránsito, señalización y comportamiento seguro como peatón, conductor o pasajero.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Transporte', 'Logística', 'Todas las áreas'],
    etiquetas: ['Seguridad vial', 'PESV', 'Tránsito']
  },
  {
    codigo: 'MP-CAP-014',
    categoria: 'preventiva',
    nombre: 'Capacitación en bloqueo y etiquetado (LOTO)',
    descripcionSugerida: 'Formación en procedimientos de bloqueo y etiquetado de energías peligrosas.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Mantenimiento', 'Producción', 'Operaciones'],
    etiquetas: ['LOTO', 'Energías', 'Bloqueo']
  },
  {
    codigo: 'MP-CAP-015',
    categoria: 'preventiva',
    nombre: 'Capacitación en trabajo en caliente',
    descripcionSugerida: 'Formación en prevención de riesgos durante soldadura, oxicorte y trabajos con llama.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Mantenimiento', 'Taller', 'Construcción'],
    etiquetas: ['Trabajo caliente', 'Soldadura', 'Permisos']
  },
  {
    codigo: 'MP-CAP-016',
    categoria: 'preventiva',
    nombre: 'Capacitación en izaje de cargas',
    descripcionSugerida: 'Formación en operación segura de grúas, montacargas y equipos de izaje.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 45,
    areasSugeridas: ['Logística', 'Almacén', 'Producción'],
    etiquetas: ['Izaje', 'Grúas', 'Montacargas']
  },
  {
    codigo: 'MP-CAP-017',
    categoria: 'preventiva',
    nombre: 'Capacitación en radiaciones ionizantes',
    descripcionSugerida: 'Formación en protección radiológica para personal expuesto a radiaciones ionizantes.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Radiología', 'Laboratorio', 'Médico'],
    etiquetas: ['Radiación', 'Ionizante', 'Protección']
  },
  {
    codigo: 'MP-CAP-018',
    categoria: 'preventiva',
    nombre: 'Capacitación en riesgo biológico',
    descripcionSugerida: 'Formación en prevención de exposición a agentes biológicos y bioseguridad.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Salud', 'Laboratorio', 'Servicios'],
    etiquetas: ['Biológico', 'Bioseguridad', 'Infecciones']
  },
  {
    codigo: 'MP-CAP-019',
    categoria: 'preventiva',
    nombre: 'Capacitación en manejo de residuos peligrosos',
    descripcionSugerida: 'Formación en clasificación, almacenamiento y disposición de residuos peligrosos.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Ambiental', 'Producción', 'Mantenimiento'],
    etiquetas: ['RESPEL', 'Residuos', 'Ambiental']
  },
  {
    codigo: 'MP-CAP-020',
    categoria: 'preventiva',
    nombre: 'Capacitación del COPASST/Vigía',
    descripcionSugerida: 'Formación de 20 horas para miembros del COPASST o Vigía de SST según normativa.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['COPASST', 'SST', 'Recursos Humanos'],
    etiquetas: ['COPASST', 'Vigía', 'Formación']
  },
  {
    codigo: 'MP-CAP-021',
    categoria: 'preventiva',
    nombre: 'Curso virtual de 50 horas SST',
    descripcionSugerida: 'Completar curso virtual de 50 horas del Ministerio del Trabajo para responsables del SG-SST.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Gerencia'],
    etiquetas: ['50 horas', 'Ministerio', 'Virtual']
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
  {
    codigo: 'MP-INS-005',
    categoria: 'preventiva',
    nombre: 'Inspección de EPP',
    descripcionSugerida: 'Verificación del estado y vigencia de elementos de protección personal entregados a trabajadores.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Producción', 'Todas las áreas'],
    etiquetas: ['EPP', 'Estado', 'Reposición']
  },
  {
    codigo: 'MP-INS-006',
    categoria: 'preventiva',
    nombre: 'Inspección de equipos de emergencia',
    descripcionSugerida: 'Verificación de camillas, botiquines, duchas de emergencia, lavaojos y equipos de primeros auxilios.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Emergencias', 'SST', 'Todas las áreas'],
    etiquetas: ['Emergencia', 'Botiquines', 'Camillas']
  },
  {
    codigo: 'MP-INS-007',
    categoria: 'preventiva',
    nombre: 'Inspección de vehículos',
    descripcionSugerida: 'Verificación preoperacional de vehículos: luces, frenos, llantas, documentación y kit de carretera.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Transporte', 'Logística', 'Ventas'],
    etiquetas: ['Vehículos', 'Preoperacional', 'PESV']
  },
  {
    codigo: 'MP-INS-008',
    categoria: 'preventiva',
    nombre: 'Inspección de escaleras y andamios',
    descripcionSugerida: 'Verificación del estado de escaleras portátiles, fijas y andamios antes de su uso.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Mantenimiento', 'Construcción', 'Almacén'],
    etiquetas: ['Escaleras', 'Andamios', 'Alturas']
  },
  {
    codigo: 'MP-INS-009',
    categoria: 'preventiva',
    nombre: 'Inspección de instalaciones eléctricas',
    descripcionSugerida: 'Verificación del estado de tableros, cableado, conexiones y elementos de protección eléctrica.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Mantenimiento', 'Electricidad', 'Infraestructura'],
    etiquetas: ['Eléctrico', 'Tableros', 'RETIE']
  },
  {
    codigo: 'MP-INS-010',
    categoria: 'preventiva',
    nombre: 'Inspección de orden y aseo (5S)',
    descripcionSugerida: 'Verificación del cumplimiento de estándares de orden, aseo y organización en áreas de trabajo.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Todas las áreas', 'Producción', 'Oficinas'],
    etiquetas: ['5S', 'Orden', 'Aseo']
  },
  {
    codigo: 'MP-INS-011',
    categoria: 'preventiva',
    nombre: 'Inspección de señalización y demarcación',
    descripcionSugerida: 'Verificación del estado de señales de seguridad, rutas de evacuación y demarcación de áreas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Infraestructura', 'Todas las áreas'],
    etiquetas: ['Señalización', 'Demarcación', 'Evacuación']
  },
  {
    codigo: 'MP-INS-012',
    categoria: 'preventiva',
    nombre: 'Inspección de equipos de izaje',
    descripcionSugerida: 'Verificación del estado de grúas, polipastos, eslingas, ganchos y aparejos de izaje.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Logística', 'Mantenimiento', 'Almacén'],
    etiquetas: ['Izaje', 'Eslingas', 'Grúas']
  },
  {
    codigo: 'MP-INS-013',
    categoria: 'preventiva',
    nombre: 'Inspección de sistemas de ventilación',
    descripcionSugerida: 'Verificación del funcionamiento de sistemas de ventilación, extracción localizada y aire acondicionado.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Mantenimiento', 'Producción', 'Infraestructura'],
    etiquetas: ['Ventilación', 'Extracción', 'Aire']
  },
  {
    codigo: 'MP-INS-014',
    categoria: 'preventiva',
    nombre: 'Inspección de almacenamiento de químicos',
    descripcionSugerida: 'Verificación de condiciones de almacenamiento de sustancias químicas: compatibilidad, etiquetado, contención.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Almacén', 'Producción', 'Laboratorio'],
    etiquetas: ['Químicos', 'Almacenamiento', 'SGA']
  },
  {
    codigo: 'MP-INS-015',
    categoria: 'preventiva',
    nombre: 'Inspección de puestos de trabajo ergonómicos',
    descripcionSugerida: 'Evaluación de condiciones ergonómicas en puestos de trabajo: mobiliario, pantallas, iluminación.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Administrativo', 'Oficinas', 'SST'],
    etiquetas: ['Ergonomía', 'Puestos', 'VDT']
  },

  // === MEDICIONES Y MONITOREO ===
  {
    codigo: 'MP-MED-001',
    categoria: 'preventiva',
    nombre: 'Medición de ruido ocupacional',
    descripcionSugerida: 'Realizar sonometría/dosimetría para evaluar niveles de exposición a ruido en áreas de trabajo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Producción', 'Operaciones', 'SST'],
    etiquetas: ['Ruido', 'Sonometría', 'Higiene']
  },
  {
    codigo: 'MP-MED-002',
    categoria: 'preventiva',
    nombre: 'Medición de iluminación',
    descripcionSugerida: 'Realizar luxometría para verificar niveles de iluminación según actividad y normativa.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Todas las áreas', 'Oficinas', 'Producción'],
    etiquetas: ['Iluminación', 'Luxometría', 'Higiene']
  },
  {
    codigo: 'MP-MED-003',
    categoria: 'preventiva',
    nombre: 'Medición de material particulado',
    descripcionSugerida: 'Evaluar concentración de material particulado respirable en ambientes de trabajo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Producción', 'Taller', 'Construcción'],
    etiquetas: ['Partículas', 'Polvo', 'Higiene']
  },
  {
    codigo: 'MP-MED-004',
    categoria: 'preventiva',
    nombre: 'Medición de temperatura y humedad',
    descripcionSugerida: 'Evaluar condiciones de confort térmico en áreas de trabajo mediante medición de temperatura y humedad.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Producción', 'Almacén', 'Oficinas'],
    etiquetas: ['Temperatura', 'Confort', 'Térmico']
  },
  {
    codigo: 'MP-MED-005',
    categoria: 'preventiva',
    nombre: 'Medición de vibraciones',
    descripcionSugerida: 'Evaluar niveles de exposición a vibraciones mano-brazo y cuerpo entero.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Producción', 'Mantenimiento', 'Construcción'],
    etiquetas: ['Vibraciones', 'Mano-brazo', 'Higiene']
  },
  {
    codigo: 'MP-MED-006',
    categoria: 'preventiva',
    nombre: 'Medición de gases y vapores',
    descripcionSugerida: 'Evaluar concentración de gases y vapores químicos en ambientes de trabajo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Producción', 'Laboratorio', 'Almacén'],
    etiquetas: ['Gases', 'Vapores', 'Químico']
  },
  {
    codigo: 'MP-MED-007',
    categoria: 'preventiva',
    nombre: 'Aplicación de batería de riesgo psicosocial',
    descripcionSugerida: 'Aplicar batería de instrumentos para evaluar factores de riesgo psicosocial según Res. 2764/2022.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Recursos Humanos', 'SST', 'Todas las áreas'],
    etiquetas: ['Psicosocial', 'Batería', 'Estrés']
  },

  // === MANTENIMIENTO PREVENTIVO ===
  {
    codigo: 'MP-MAN-001',
    categoria: 'preventiva',
    nombre: 'Mantenimiento de sistema contra incendios',
    descripcionSugerida: 'Mantenimiento preventivo de red contra incendios, hidrantes, rociadores y sistemas de detección.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Mantenimiento', 'Emergencias', 'Infraestructura'],
    etiquetas: ['Incendios', 'Mantenimiento', 'Detección']
  },
  {
    codigo: 'MP-MAN-002',
    categoria: 'preventiva',
    nombre: 'Recarga de extintores',
    descripcionSugerida: 'Programar recarga anual de extintores con empresa certificada.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Compras', 'SST', 'Emergencias'],
    etiquetas: ['Extintores', 'Recarga', 'Anual']
  },
  {
    codigo: 'MP-MAN-003',
    categoria: 'preventiva',
    nombre: 'Mantenimiento de equipos de primeros auxilios',
    descripcionSugerida: 'Reposición de insumos vencidos en botiquines y verificación de equipos de emergencia.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Compras', 'Emergencias'],
    etiquetas: ['Botiquín', 'Primeros auxilios', 'Reposición']
  },
  {
    codigo: 'MP-MAN-004',
    categoria: 'preventiva',
    nombre: 'Mantenimiento de guardas de seguridad',
    descripcionSugerida: 'Verificación y reparación de guardas protectoras en maquinaria y equipos.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Mantenimiento', 'Producción', 'Operaciones'],
    etiquetas: ['Guardas', 'Maquinaria', 'Seguridad']
  },
  {
    codigo: 'MP-MAN-005',
    categoria: 'preventiva',
    nombre: 'Calibración de instrumentos de medición',
    descripcionSugerida: 'Programar calibración de equipos de medición de higiene industrial.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Laboratorio', 'Calidad'],
    etiquetas: ['Calibración', 'Instrumentos', 'Metrología']
  },

  // === VIGILANCIA EPIDEMIOLÓGICA ===
  {
    codigo: 'MP-PVE-001',
    categoria: 'preventiva',
    nombre: 'Exámenes médicos ocupacionales',
    descripcionSugerida: 'Programar exámenes médicos de ingreso, periódicos o retiro según profesiograma.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Salud'],
    etiquetas: ['Exámenes', 'Médico', 'Profesiograma']
  },
  {
    codigo: 'MP-PVE-002',
    categoria: 'preventiva',
    nombre: 'Implementación de PVE Osteomuscular',
    descripcionSugerida: 'Desarrollo de programa de vigilancia epidemiológica para desórdenes músculo-esqueléticos.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Salud', 'Producción'],
    etiquetas: ['DME', 'Osteomuscular', 'PVE']
  },
  {
    codigo: 'MP-PVE-003',
    categoria: 'preventiva',
    nombre: 'Implementación de PVE Conservación Auditiva',
    descripcionSugerida: 'Desarrollo de programa de vigilancia epidemiológica para conservación auditiva.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Salud', 'Producción'],
    etiquetas: ['Ruido', 'Auditivo', 'PVE']
  },
  {
    codigo: 'MP-PVE-004',
    categoria: 'preventiva',
    nombre: 'Implementación de PVE Respiratorio',
    descripcionSugerida: 'Desarrollo de programa de vigilancia epidemiológica para protección respiratoria.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Salud', 'Producción'],
    etiquetas: ['Respiratorio', 'Químico', 'PVE']
  },
  {
    codigo: 'MP-PVE-005',
    categoria: 'preventiva',
    nombre: 'Implementación de PVE Visual',
    descripcionSugerida: 'Desarrollo de programa de vigilancia epidemiológica para salud visual.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Salud', 'Administrativo'],
    etiquetas: ['Visual', 'VDT', 'PVE']
  },
  {
    codigo: 'MP-PVE-006',
    categoria: 'preventiva',
    nombre: 'Implementación de PVE Cardiovascular',
    descripcionSugerida: 'Desarrollo de programa de vigilancia epidemiológica para riesgo cardiovascular.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Salud', 'Todas las áreas'],
    etiquetas: ['Cardiovascular', 'Estilos vida', 'PVE']
  },
  {
    codigo: 'MP-PVE-007',
    categoria: 'preventiva',
    nombre: 'Programa de pausas activas',
    descripcionSugerida: 'Implementar programa de pausas activas y gimnasia laboral para prevención de DME.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Todas las áreas', 'Producción'],
    etiquetas: ['Pausas', 'Gimnasia', 'DME']
  },

  // === DOCUMENTACIÓN Y PROCEDIMIENTOS ===
  {
    codigo: 'MP-DOC-001',
    categoria: 'preventiva',
    nombre: 'Elaboración de procedimiento de trabajo seguro',
    descripcionSugerida: 'Desarrollar procedimiento estándar de trabajo seguro para actividad crítica identificada.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Área específica', 'Calidad'],
    etiquetas: ['Procedimiento', 'PTS', 'Documentación']
  },
  {
    codigo: 'MP-DOC-002',
    categoria: 'preventiva',
    nombre: 'Elaboración de matriz IPERC',
    descripcionSugerida: 'Desarrollar matriz de identificación de peligros, evaluación y valoración de riesgos.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 45,
    areasSugeridas: ['SST', 'COPASST', 'Todas las áreas'],
    etiquetas: ['IPERC', 'Matriz', 'Riesgos']
  },
  {
    codigo: 'MP-DOC-003',
    categoria: 'preventiva',
    nombre: 'Elaboración de plan de emergencias',
    descripcionSugerida: 'Desarrollar plan de prevención, preparación y respuesta ante emergencias.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Brigadas', 'Gerencia'],
    etiquetas: ['Emergencias', 'Plan', 'Brigadas']
  },
  {
    codigo: 'MP-DOC-004',
    categoria: 'preventiva',
    nombre: 'Elaboración de ATS/AST',
    descripcionSugerida: 'Desarrollar análisis de trabajo seguro para actividades de alto riesgo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Operaciones', 'Área específica'],
    etiquetas: ['ATS', 'AST', 'Análisis']
  },
  {
    codigo: 'MP-DOC-005',
    categoria: 'preventiva',
    nombre: 'Actualización de fichas de seguridad (FDS)',
    descripcionSugerida: 'Solicitar y actualizar fichas de datos de seguridad de sustancias químicas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Compras', 'Almacén'],
    etiquetas: ['FDS', 'Químicos', 'SGA']
  },

  // === SIMULACROS Y PREPARACIÓN ===
  {
    codigo: 'MP-SIM-001',
    categoria: 'preventiva',
    nombre: 'Simulacro de evacuación',
    descripcionSugerida: 'Realizar simulacro de evacuación general con participación de toda la empresa.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Brigadas', 'SST', 'Todas las áreas'],
    etiquetas: ['Simulacro', 'Evacuación', 'Emergencias']
  },
  {
    codigo: 'MP-SIM-002',
    categoria: 'preventiva',
    nombre: 'Simulacro de incendio',
    descripcionSugerida: 'Realizar simulacro de respuesta ante conato de incendio.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Brigadas', 'Emergencias', 'SST'],
    etiquetas: ['Simulacro', 'Incendio', 'Brigada']
  },
  {
    codigo: 'MP-SIM-003',
    categoria: 'preventiva',
    nombre: 'Simulacro de primeros auxilios',
    descripcionSugerida: 'Realizar simulacro de atención de emergencias médicas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Brigadas', 'Salud', 'SST'],
    etiquetas: ['Simulacro', 'Primeros auxilios', 'Médico']
  },
  {
    codigo: 'MP-SIM-004',
    categoria: 'preventiva',
    nombre: 'Simulacro de derrame químico',
    descripcionSugerida: 'Realizar simulacro de respuesta ante derrame de sustancia química.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Brigadas', 'Producción', 'Ambiental'],
    etiquetas: ['Simulacro', 'Derrame', 'Químico']
  },
  {
    codigo: 'MP-SIM-005',
    categoria: 'preventiva',
    nombre: 'Simulacro de sismo',
    descripcionSugerida: 'Realizar simulacro de respuesta ante movimiento sísmico.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Brigadas', 'SST', 'Todas las áreas'],
    etiquetas: ['Simulacro', 'Sismo', 'Terremoto']
  },

  // === SEÑALIZACIÓN Y DEMARCACIÓN ===
  {
    codigo: 'MP-SEÑ-001',
    categoria: 'preventiva',
    nombre: 'Instalación de señalización de seguridad',
    descripcionSugerida: 'Instalar señales de seguridad según NTC 1461 en áreas identificadas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Mantenimiento', 'Infraestructura'],
    etiquetas: ['Señalización', 'NTC 1461', 'Seguridad']
  },
  {
    codigo: 'MP-SEÑ-002',
    categoria: 'preventiva',
    nombre: 'Demarcación de áreas y rutas',
    descripcionSugerida: 'Demarcar áreas de trabajo, almacenamiento, tránsito y rutas de evacuación.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Infraestructura', 'Mantenimiento', 'SST'],
    etiquetas: ['Demarcación', 'Rutas', 'Áreas']
  },
  {
    codigo: 'MP-SEÑ-003',
    categoria: 'preventiva',
    nombre: 'Señalización de equipos de emergencia',
    descripcionSugerida: 'Instalar señalización de ubicación de extintores, botiquines, camillas y salidas.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Infraestructura', 'Emergencias'],
    etiquetas: ['Señalización', 'Emergencia', 'Extintores']
  },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║                    MEDIDAS CORRECTIVAS                           ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // === CORRECCIÓN DE HALLAZGOS DE INSPECCIÓN ===
  {
    codigo: 'MC-HAL-001',
    categoria: 'correctiva',
    nombre: 'Corrección de hallazgo de inspección de seguridad',
    descripcionSugerida: 'Implementación de acciones correctivas para subsanar hallazgos identificados durante inspecciones de seguridad.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Área afectada', 'Mantenimiento', 'SST'],
    etiquetas: ['Hallazgo', 'Corrección', 'Inspección']
  },
  {
    codigo: 'MC-HAL-002',
    categoria: 'correctiva',
    nombre: 'Corrección de condición insegura locativa',
    descripcionSugerida: 'Reparación de condiciones inseguras en instalaciones: pisos, techos, paredes, escaleras.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Mantenimiento', 'Infraestructura', 'Área afectada'],
    etiquetas: ['Locativo', 'Condición', 'Reparación']
  },
  {
    codigo: 'MC-HAL-003',
    categoria: 'correctiva',
    nombre: 'Corrección de deficiencia en maquinaria',
    descripcionSugerida: 'Reparación o adecuación de máquinas con guardas faltantes, dispositivos dañados o condiciones inseguras.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Mantenimiento', 'Producción', 'SST'],
    etiquetas: ['Maquinaria', 'Guardas', 'Reparación']
  },
  {
    codigo: 'MC-HAL-004',
    categoria: 'correctiva',
    nombre: 'Corrección de deficiencia eléctrica',
    descripcionSugerida: 'Reparación de instalaciones eléctricas con condiciones inseguras identificadas.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Electricidad', 'Mantenimiento', 'Infraestructura'],
    etiquetas: ['Eléctrico', 'Reparación', 'Seguridad']
  },
  {
    codigo: 'MC-HAL-005',
    categoria: 'correctiva',
    nombre: 'Reposición de EPP deteriorado',
    descripcionSugerida: 'Reemplazo inmediato de elementos de protección personal en mal estado o vencidos.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['SST', 'Compras', 'Almacén'],
    etiquetas: ['EPP', 'Reposición', 'Deteriorado']
  },
  {
    codigo: 'MC-HAL-006',
    categoria: 'correctiva',
    nombre: 'Corrección de almacenamiento incorrecto',
    descripcionSugerida: 'Adecuación de condiciones de almacenamiento de materiales o sustancias químicas.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Almacén', 'Logística', 'SST'],
    etiquetas: ['Almacenamiento', 'Orden', 'Corrección']
  },
  {
    codigo: 'MC-HAL-007',
    categoria: 'correctiva',
    nombre: 'Reparación de equipo de emergencia',
    descripcionSugerida: 'Reparación o reemplazo de equipos de emergencia dañados o fuera de servicio.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 7,
    areasSugeridas: ['Emergencias', 'SST', 'Compras'],
    etiquetas: ['Emergencia', 'Reparación', 'Equipos']
  },

  // === ACCIONES POR ACCIDENTE DE TRABAJO ===
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
    codigo: 'MC-ACC-002',
    categoria: 'correctiva',
    nombre: 'Control de causa inmediata de accidente',
    descripcionSugerida: 'Implementación de control para eliminar la causa inmediata identificada en investigación de accidente.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Área del accidente', 'SST', 'Mantenimiento'],
    etiquetas: ['Accidente', 'Causa inmediata', 'Control']
  },
  {
    codigo: 'MC-ACC-003',
    categoria: 'correctiva',
    nombre: 'Control de causa básica de accidente',
    descripcionSugerida: 'Implementación de control para eliminar la causa básica (factor personal o del trabajo) identificada.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Gerencia'],
    etiquetas: ['Accidente', 'Causa básica', 'Control']
  },
  {
    codigo: 'MC-ACC-004',
    categoria: 'correctiva',
    nombre: 'Reporte de accidente a ARL',
    descripcionSugerida: 'Radicar FURAT dentro de los 2 días hábiles siguientes al accidente.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 2,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Salud'],
    etiquetas: ['FURAT', 'ARL', 'Reporte']
  },
  {
    codigo: 'MC-ACC-005',
    categoria: 'correctiva',
    nombre: 'Investigación de accidente grave/mortal',
    descripcionSugerida: 'Realizar investigación de accidente grave o mortal dentro de los 15 días siguientes.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'COPASST', 'Gerencia'],
    etiquetas: ['Investigación', 'Grave', 'Mortal']
  },

  // === ACCIONES POR INCIDENTE ===
  {
    codigo: 'MC-INC-001',
    categoria: 'correctiva',
    nombre: 'Acción correctiva por incidente de trabajo',
    descripcionSugerida: 'Implementación de medidas de control derivadas de investigación de incidente.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Área del incidente', 'SST', 'COPASST'],
    etiquetas: ['Incidente', 'Casi accidente', 'Control']
  },
  {
    codigo: 'MC-INC-002',
    categoria: 'correctiva',
    nombre: 'Análisis de incidente con potencial grave',
    descripcionSugerida: 'Investigación y análisis de casi-accidente con potencial de causar lesión grave.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'COPASST', 'Área afectada'],
    etiquetas: ['Incidente', 'Potencial', 'Análisis']
  },

  // === ACCIONES POR ENFERMEDAD LABORAL ===
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
    codigo: 'MC-ENF-002',
    categoria: 'correctiva',
    nombre: 'Reporte de enfermedad laboral a ARL',
    descripcionSugerida: 'Radicar reporte de enfermedad laboral ante ARL y EPS.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 5,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Salud'],
    etiquetas: ['Enfermedad', 'ARL', 'Reporte']
  },
  {
    codigo: 'MC-ENF-003',
    categoria: 'correctiva',
    nombre: 'Reubicación laboral por enfermedad',
    descripcionSugerida: 'Implementar reubicación o readaptación laboral por recomendación médico-ocupacional.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Recursos Humanos', 'SST', 'Salud'],
    etiquetas: ['Reubicación', 'Restricción', 'Médico']
  },
  {
    codigo: 'MC-ENF-004',
    categoria: 'correctiva',
    nombre: 'Ajuste de puesto de trabajo ergonómico',
    descripcionSugerida: 'Adecuación ergonómica de puesto de trabajo por diagnóstico de DME.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Mantenimiento', 'Área afectada'],
    etiquetas: ['Ergonomía', 'DME', 'Ajuste']
  },

  // === ACCIONES POR AUDITORÍA ===
  {
    codigo: 'MC-AUD-001',
    categoria: 'correctiva',
    nombre: 'Cierre de no conformidad de auditoría interna',
    descripcionSugerida: 'Implementación de acciones correctivas para cerrar no conformidades identificadas en auditoría interna.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Área auditada', 'SST', 'Calidad'],
    etiquetas: ['Auditoría', 'No conformidad', 'Interna']
  },
  {
    codigo: 'MC-AUD-002',
    categoria: 'correctiva',
    nombre: 'Cierre de hallazgo de auditoría externa',
    descripcionSugerida: 'Implementación de acciones correctivas para cerrar hallazgos de auditoría externa o ARL.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 45,
    areasSugeridas: ['SST', 'Área auditada', 'Gerencia'],
    etiquetas: ['Auditoría', 'Externa', 'ARL']
  },
  {
    codigo: 'MC-AUD-003',
    categoria: 'correctiva',
    nombre: 'Cierre de observación de auditoría',
    descripcionSugerida: 'Atención de observaciones o recomendaciones derivadas de auditoría.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 45,
    areasSugeridas: ['Área auditada', 'SST', 'Calidad'],
    etiquetas: ['Auditoría', 'Observación', 'Mejora']
  },
  {
    codigo: 'MC-AUD-004',
    categoria: 'correctiva',
    nombre: 'Cierre de no conformidad mayor',
    descripcionSugerida: 'Atención urgente de no conformidad mayor que afecta la eficacia del SG-SST.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Gerencia', 'Área afectada'],
    etiquetas: ['No conformidad', 'Mayor', 'Urgente']
  },

  // === ACCIONES POR REVISIÓN POR LA DIRECCIÓN ===
  {
    codigo: 'MC-REV-001',
    categoria: 'correctiva',
    nombre: 'Acción por revisión por la dirección',
    descripcionSugerida: 'Implementación de acción derivada de la revisión por la alta dirección del SG-SST.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Gerencia', 'Área designada'],
    etiquetas: ['Revisión', 'Dirección', 'Estratégico']
  },

  // === ACCIONES POR AUTORIDADES ===
  {
    codigo: 'MC-AUT-001',
    categoria: 'correctiva',
    nombre: 'Atención de requerimiento del Ministerio',
    descripcionSugerida: 'Atención de requerimiento del Ministerio del Trabajo derivado de inspección o queja.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Legal', 'Gerencia'],
    etiquetas: ['Ministerio', 'Requerimiento', 'Legal']
  },
  {
    codigo: 'MC-AUT-002',
    categoria: 'correctiva',
    nombre: 'Atención de recomendación ARL',
    descripcionSugerida: 'Implementación de recomendaciones emitidas por la ARL.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Área afectada', 'Gerencia'],
    etiquetas: ['ARL', 'Recomendación', 'Asesoría']
  },
  {
    codigo: 'MC-AUT-003',
    categoria: 'correctiva',
    nombre: 'Cierre de auto de sanción',
    descripcionSugerida: 'Atención de auto de sanción por incumplimiento normativo en SST.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['Legal', 'SST', 'Gerencia'],
    etiquetas: ['Sanción', 'Multa', 'Legal']
  },

  // === ACCIONES POR COPASST/COMITÉ CONVIVENCIA ===
  {
    codigo: 'MC-COP-001',
    categoria: 'correctiva',
    nombre: 'Atención de queja del COPASST',
    descripcionSugerida: 'Atención de queja o recomendación del COPASST sobre condiciones de trabajo.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Área afectada', 'COPASST'],
    etiquetas: ['COPASST', 'Queja', 'Trabajadores']
  },
  {
    codigo: 'MC-COP-002',
    categoria: 'correctiva',
    nombre: 'Atención de caso de comité de convivencia',
    descripcionSugerida: 'Implementación de medidas derivadas de caso atendido por Comité de Convivencia Laboral.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Recursos Humanos', 'Convivencia', 'Gerencia'],
    etiquetas: ['Convivencia', 'Acoso', 'Laboral']
  },

  // === ACCIONES POR GESTIÓN DEL CAMBIO ===
  {
    codigo: 'MC-CAM-001',
    categoria: 'correctiva',
    nombre: 'Control de riesgo por cambio no gestionado',
    descripcionSugerida: 'Implementación de controles por riesgos materializados en cambio no gestionado.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 15,
    areasSugeridas: ['SST', 'Área afectada', 'Gerencia'],
    etiquetas: ['Cambio', 'Riesgo', 'Control']
  },

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║                    MEDIDAS DE MEJORA CONTINUA                    ║
  // ╚══════════════════════════════════════════════════════════════════╝

  // === MEJORA DE PROCEDIMIENTOS ===
  {
    codigo: 'MM-PRO-001',
    categoria: 'mejora',
    nombre: 'Actualización de procedimiento de trabajo seguro',
    descripcionSugerida: 'Revisión y mejora de procedimientos de trabajo seguro según lecciones aprendidas y mejores prácticas.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['Área del procedimiento', 'SST', 'Calidad'],
    etiquetas: ['Procedimiento', 'Actualización', 'Mejora']
  },
  {
    codigo: 'MM-PRO-002',
    categoria: 'mejora',
    nombre: 'Simplificación de proceso documental',
    descripcionSugerida: 'Reducción de documentación innecesaria y optimización de formatos del SG-SST.',
    prioridadSugerida: 'baja',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Calidad', 'Todas las áreas'],
    etiquetas: ['Documentación', 'Simplificación', 'Eficiencia']
  },
  {
    codigo: 'MM-PRO-003',
    categoria: 'mejora',
    nombre: 'Automatización de proceso SST',
    descripcionSugerida: 'Implementación de herramientas digitales para automatizar procesos del SG-SST.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 90,
    areasSugeridas: ['SST', 'Sistemas', 'Gerencia'],
    etiquetas: ['Automatización', 'Digital', 'Software']
  },

  // === MEJORA DE INDICADORES ===
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
    codigo: 'MM-IND-002',
    categoria: 'mejora',
    nombre: 'Rediseño de tablero de indicadores',
    descripcionSugerida: 'Mejora en la presentación y análisis de indicadores del SG-SST.',
    prioridadSugerida: 'baja',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Gerencia', 'Calidad'],
    etiquetas: ['Dashboard', 'Indicadores', 'Visualización']
  },

  // === MEJORA DE CONTROLES ===
  {
    codigo: 'MM-TEC-001',
    categoria: 'mejora',
    nombre: 'Implementación de control de ingeniería',
    descripcionSugerida: 'Instalación de controles de ingeniería para eliminar o reducir exposición a factores de riesgo.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Área de implementación', 'Mantenimiento', 'SST'],
    etiquetas: ['Ingeniería', 'Control', 'Tecnología']
  },
  {
    codigo: 'MM-TEC-002',
    categoria: 'mejora',
    nombre: 'Mejora de sistema de ventilación',
    descripcionSugerida: 'Optimización de sistema de ventilación o extracción localizada.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Mantenimiento', 'Producción', 'Infraestructura'],
    etiquetas: ['Ventilación', 'Extracción', 'Mejora']
  },
  {
    codigo: 'MM-TEC-003',
    categoria: 'mejora',
    nombre: 'Mejora de iluminación',
    descripcionSugerida: 'Optimización de niveles de iluminación en áreas de trabajo.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 45,
    areasSugeridas: ['Mantenimiento', 'Infraestructura', 'SST'],
    etiquetas: ['Iluminación', 'Confort', 'Mejora']
  },
  {
    codigo: 'MM-TEC-004',
    categoria: 'mejora',
    nombre: 'Mejora de control de ruido',
    descripcionSugerida: 'Implementación de medidas adicionales para reducir exposición a ruido ocupacional.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Mantenimiento', 'Producción', 'SST'],
    etiquetas: ['Ruido', 'Control', 'Insonorización']
  },
  {
    codigo: 'MM-TEC-005',
    categoria: 'mejora',
    nombre: 'Sustitución de sustancia química peligrosa',
    descripcionSugerida: 'Reemplazo de sustancia química peligrosa por una menos tóxica.',
    prioridadSugerida: 'alta',
    diasPlazoSugerido: 90,
    areasSugeridas: ['Compras', 'Producción', 'SST'],
    etiquetas: ['Químicos', 'Sustitución', 'Menos tóxico']
  },

  // === MEJORA DE DOCUMENTACIÓN ===
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
  {
    codigo: 'MM-DOC-002',
    categoria: 'mejora',
    nombre: 'Actualización de política SST',
    descripcionSugerida: 'Revisión y actualización de la política de SST por cambios organizacionales.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Gerencia', 'Recursos Humanos'],
    etiquetas: ['Política', 'Actualización', 'Dirección']
  },
  {
    codigo: 'MM-DOC-003',
    categoria: 'mejora',
    nombre: 'Actualización de objetivos SST',
    descripcionSugerida: 'Revisión y actualización de objetivos e indicadores del SG-SST.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Gerencia', 'Calidad'],
    etiquetas: ['Objetivos', 'Metas', 'Indicadores']
  },
  {
    codigo: 'MM-DOC-004',
    categoria: 'mejora',
    nombre: 'Actualización del plan de emergencias',
    descripcionSugerida: 'Revisión y mejora del plan de prevención, preparación y respuesta ante emergencias.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 45,
    areasSugeridas: ['SST', 'Brigadas', 'Gerencia'],
    etiquetas: ['Emergencias', 'Plan', 'Actualización']
  },
  {
    codigo: 'MM-DOC-005',
    categoria: 'mejora',
    nombre: 'Actualización del plan de trabajo anual',
    descripcionSugerida: 'Revisión y actualización del plan de trabajo anual del SG-SST.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'Gerencia', 'COPASST'],
    etiquetas: ['Plan', 'Anual', 'Cronograma']
  },

  // === MEJORA DE CULTURA SST ===
  {
    codigo: 'MM-CUL-001',
    categoria: 'mejora',
    nombre: 'Campaña de cultura de seguridad',
    descripcionSugerida: 'Implementación de campaña para fortalecer la cultura de seguridad en la organización.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Comunicaciones', 'Recursos Humanos'],
    etiquetas: ['Cultura', 'Campaña', 'Seguridad']
  },
  {
    codigo: 'MM-CUL-002',
    categoria: 'mejora',
    nombre: 'Programa de reconocimiento SST',
    descripcionSugerida: 'Implementación de programa de incentivos y reconocimiento por comportamiento seguro.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 45,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Gerencia'],
    etiquetas: ['Reconocimiento', 'Incentivos', 'Comportamiento']
  },
  {
    codigo: 'MM-CUL-003',
    categoria: 'mejora',
    nombre: 'Fortalecimiento del reporte de condiciones',
    descripcionSugerida: 'Mejora del sistema de reporte de condiciones inseguras y sugerencias de trabajadores.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 30,
    areasSugeridas: ['SST', 'COPASST', 'Todas las áreas'],
    etiquetas: ['Reporte', 'Participación', 'Condiciones']
  },

  // === MEJORA DE BIENESTAR ===
  {
    codigo: 'MM-BIE-001',
    categoria: 'mejora',
    nombre: 'Programa de estilos de vida saludable',
    descripcionSugerida: 'Fortalecimiento del programa de promoción de estilos de vida saludable.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Bienestar'],
    etiquetas: ['EVS', 'Salud', 'Bienestar']
  },
  {
    codigo: 'MM-BIE-002',
    categoria: 'mejora',
    nombre: 'Mejora de espacios de descanso',
    descripcionSugerida: 'Adecuación de áreas de descanso, comedores y zonas de esparcimiento.',
    prioridadSugerida: 'baja',
    diasPlazoSugerido: 60,
    areasSugeridas: ['Infraestructura', 'Recursos Humanos', 'Gerencia'],
    etiquetas: ['Descanso', 'Bienestar', 'Infraestructura']
  },
  {
    codigo: 'MM-BIE-003',
    categoria: 'mejora',
    nombre: 'Programa de manejo del estrés',
    descripcionSugerida: 'Implementación de programa para manejo del estrés y prevención del burnout.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Recursos Humanos', 'Psicología'],
    etiquetas: ['Estrés', 'Psicosocial', 'Burnout']
  },

  // === MEJORA DEL SISTEMA DE GESTIÓN ===
  {
    codigo: 'MM-SGS-001',
    categoria: 'mejora',
    nombre: 'Integración con otros sistemas de gestión',
    descripcionSugerida: 'Alineación del SG-SST con sistemas de calidad, ambiental u otros.',
    prioridadSugerida: 'baja',
    diasPlazoSugerido: 90,
    areasSugeridas: ['SST', 'Calidad', 'Gerencia'],
    etiquetas: ['Integración', 'ISO', 'Sistemas']
  },
  {
    codigo: 'MM-SGS-002',
    categoria: 'mejora',
    nombre: 'Preparación para certificación ISO 45001',
    descripcionSugerida: 'Implementación de requisitos adicionales para certificación ISO 45001:2018.',
    prioridadSugerida: 'media',
    diasPlazoSugerido: 180,
    areasSugeridas: ['SST', 'Gerencia', 'Calidad'],
    etiquetas: ['ISO 45001', 'Certificación', 'Internacional']
  },
  {
    codigo: 'MM-SGS-003',
    categoria: 'mejora',
    nombre: 'Benchmarking en SST',
    descripcionSugerida: 'Estudio comparativo de prácticas de SST con empresas del sector.',
    prioridadSugerida: 'baja',
    diasPlazoSugerido: 60,
    areasSugeridas: ['SST', 'Gerencia', 'Calidad'],
    etiquetas: ['Benchmarking', 'Comparativo', 'Mejores prácticas']
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

/**
 * Busca medidas por texto en nombre o descripción
 */
export function buscarMedidas(texto: string): TipoMedidaPreventiva[] {
  const textoBusqueda = texto.toLowerCase();
  return TIPOS_MEDIDAS_PREVENTIVAS.filter(m => 
    m.nombre.toLowerCase().includes(textoBusqueda) ||
    m.descripcionSugerida.toLowerCase().includes(textoBusqueda) ||
    m.etiquetas.some(e => e.toLowerCase().includes(textoBusqueda))
  );
}

/**
 * Estadísticas del catálogo
 */
export const ESTADISTICAS_CATALOGO = {
  totalMedidas: TIPOS_MEDIDAS_PREVENTIVAS.length,
  preventivas: TIPOS_MEDIDAS_PREVENTIVAS.filter(m => m.categoria === 'preventiva').length,
  correctivas: TIPOS_MEDIDAS_PREVENTIVAS.filter(m => m.categoria === 'correctiva').length,
  mejoras: TIPOS_MEDIDAS_PREVENTIVAS.filter(m => m.categoria === 'mejora').length,
};
