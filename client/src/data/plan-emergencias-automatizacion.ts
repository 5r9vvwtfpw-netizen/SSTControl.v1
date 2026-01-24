/**
 * Catálogo de datos predefinidos para automatización del módulo Plan de Emergencias
 * Basado en normativa colombiana vigente 2025:
 * - Decreto 1072/2015 (Art. 2.2.4.6.25)
 * - Resolución 0312/2019 (Estándar 2.5.1)
 * - Ley 1523/2012 (Gestión del Riesgo de Desastres)
 * - NTC 1700 (Medidas de seguridad en edificaciones)
 * - NFPA 10, 600, 1600
 */

// ============================================
// TIPOS DE PLANES DE EMERGENCIA
// ============================================
export interface TipoPlan {
  codigo: string;
  nombre: string;
  descripcion: string;
  normativa: string;
  alcancePredefinido: string;
  objetivoPredefinido: string;
  componentesRequeridos: string[];
}

export const TIPOS_PLANES_EMERGENCIA: TipoPlan[] = [
  {
    codigo: "PE-GEN",
    nombre: "Plan de Emergencias General",
    descripcion: "Plan integral que cubre todas las amenazas identificadas en la organización",
    normativa: "Decreto 1072/2015 Art. 2.2.4.6.25",
    alcancePredefinido: "Aplica a todos los trabajadores, contratistas, visitantes y partes interesadas que se encuentren en las instalaciones de la empresa, incluyendo todas las áreas, procesos y actividades.",
    objetivoPredefinido: "Establecer los procedimientos de prevención, preparación y respuesta ante situaciones de emergencia que puedan afectar la seguridad y salud de las personas, los bienes y el medio ambiente.",
    componentesRequeridos: ["Análisis de amenazas", "Análisis de vulnerabilidad", "Brigadas de emergencia", "Procedimientos operativos", "Recursos de emergencia", "Plan de evacuación"]
  },
  {
    codigo: "PE-INC",
    nombre: "Plan de Contingencia contra Incendios",
    descripcion: "Plan específico para prevención y control de incendios",
    normativa: "NFPA 600 / Ley 9 de 1979",
    alcancePredefinido: "Aplica a todas las áreas de la empresa donde exista riesgo de incendio, incluyendo áreas de almacenamiento, producción, oficinas y zonas comunes.",
    objetivoPredefinido: "Prevenir la ocurrencia de incendios y establecer procedimientos para su detección temprana, control inicial, evacuación segura y notificación a organismos de socorro.",
    componentesRequeridos: ["Sistema de detección", "Equipos de extinción", "Brigada contra incendios", "Procedimiento de evacuación", "Coordinación con Bomberos"]
  },
  {
    codigo: "PE-SIS",
    nombre: "Plan de Contingencia Sísmica",
    descripcion: "Plan de respuesta ante eventos sísmicos",
    normativa: "Ley 1523/2012 / NSR-10",
    alcancePredefinido: "Aplica a todas las edificaciones y estructuras de la empresa, personal en todas las áreas incluyendo trabajo en alturas y espacios confinados.",
    objetivoPredefinido: "Establecer medidas de prevención, protección y respuesta ante movimientos telúricos para minimizar lesiones personales y daños a la infraestructura.",
    componentesRequeridos: ["Evaluación estructural", "Zonas seguras internas", "Rutas de evacuación", "Puntos de encuentro", "Procedimiento de búsqueda y rescate"]
  },
  {
    codigo: "PE-DER",
    nombre: "Plan de Contingencia Derrames Químicos",
    descripcion: "Plan para manejo de derrames de sustancias químicas",
    normativa: "Decreto 1072/2015 / GTC-45",
    alcancePredefinido: "Aplica a todas las áreas donde se manipulen, almacenen o transporten sustancias químicas peligrosas, incluyendo laboratorios, bodegas y áreas de producción.",
    objetivoPredefinido: "Prevenir derrames de sustancias químicas y establecer procedimientos de contención, limpieza y disposición final que protejan a las personas y el medio ambiente.",
    componentesRequeridos: ["Inventario de sustancias", "Hojas de seguridad (SDS)", "Kits de derrames", "EPP especializado", "Procedimiento de contención", "Disposición de residuos"]
  },
  {
    codigo: "PE-EVA",
    nombre: "Plan de Evacuación",
    descripcion: "Plan específico para evacuación de instalaciones",
    normativa: "Resolución 0312/2019 Est. 2.5.1 / NTC 1700",
    alcancePredefinido: "Aplica a todas las personas presentes en las instalaciones: trabajadores, contratistas, visitantes, personas con discapacidad y toda persona que requiera ser evacuada.",
    objetivoPredefinido: "Garantizar la evacuación segura, ordenada y rápida de todas las personas ante cualquier situación de emergencia que amerite el desalojo de las instalaciones.",
    componentesRequeridos: ["Rutas de evacuación", "Puntos de encuentro", "Sistema de alarma", "Coordinadores de evacuación", "Procedimientos para personas con discapacidad"]
  },
  {
    codigo: "PE-MED",
    nombre: "Plan de Emergencias Médicas",
    descripcion: "Plan para atención de emergencias médicas y primeros auxilios",
    normativa: "Resolución 0312/2019 / Decreto 1072/2015",
    alcancePredefinido: "Aplica a todas las emergencias médicas que ocurran en las instalaciones de la empresa, incluyendo accidentes de trabajo, enfermedades súbitas y eventos cardiovasculares.",
    objetivoPredefinido: "Proporcionar atención inicial de emergencias médicas de manera oportuna y eficiente, estabilizando al paciente hasta la llegada de servicios especializados.",
    componentesRequeridos: ["Brigada de primeros auxilios", "Botiquines", "DEA (si aplica)", "Camillas", "Protocolo de atención", "Líneas de emergencia"]
  }
];

// ============================================
// TIPOS DE BRIGADAS DE EMERGENCIA
// ============================================
export interface TipoBrigada {
  codigo: string;
  tipoEnum: "primeros_auxilios" | "evacuacion" | "control_incendios" | "busqueda_rescate" | "comunicaciones" | "integral";
  nombre: string;
  descripcion: string;
  funcionesAntes: string;
  funcionesDurante: string;
  funcionesDespues: string;
  equipamientoRequerido: string[];
  capacitacionRequerida: string[];
  normativa: string;
}

export const TIPOS_BRIGADAS: TipoBrigada[] = [
  {
    codigo: "BRI-PAU",
    tipoEnum: "primeros_auxilios",
    nombre: "Brigada de Primeros Auxilios",
    descripcion: "Encargada de prestar atención inicial de emergencias médicas a trabajadores y visitantes",
    funcionesAntes: "• Mantener actualizado el inventario de botiquines y equipos médicos\n• Verificar fechas de vencimiento de medicamentos\n• Participar en capacitaciones de primeros auxilios\n• Conocer las condiciones de salud especiales del personal\n• Mantener actualizados los números de emergencia médica",
    funcionesDurante: "• Prestar atención inicial de primeros auxilios a los afectados\n• Estabilizar signos vitales del paciente\n• Aplicar técnicas de RCP si es necesario\n• Controlar hemorragias y inmovilizar fracturas\n• Coordinar traslado a centro asistencial\n• Mantener comunicación con coordinador de emergencias",
    funcionesDespues: "• Reponer materiales utilizados del botiquín\n• Elaborar informe de atención prestada\n• Realizar seguimiento del estado de los afectados\n• Participar en evaluación post-emergencia\n• Identificar oportunidades de mejora",
    equipamientoRequerido: ["Botiquín tipo A (según Res. 0705/2007)", "Camilla rígida con inmovilizador cervical", "Tablilla de inmovilización", "Tensiómetro y fonendoscopio", "Guantes de látex", "Tijeras de trauma", "DEA (Desfibrilador Externo Automático)"],
    capacitacionRequerida: ["Primeros auxilios básicos (20 horas mínimo)", "RCP y uso de DEA", "Manejo de heridas y hemorragias", "Inmovilización y transporte de lesionados", "Atención de emergencias cardiovasculares"],
    normativa: "Resolución 0312/2019 Art. 18"
  },
  {
    codigo: "BRI-EVA",
    tipoEnum: "evacuacion",
    nombre: "Brigada de Evacuación",
    descripcion: "Responsable de guiar y coordinar la evacuación segura del personal e instalaciones",
    funcionesAntes: "• Conocer y verificar las rutas de evacuación\n• Verificar señalización de emergencia y estado de salidas\n• Mantener actualizado el censo de personal por áreas\n• Identificar personas con necesidades especiales\n• Participar en simulacros de evacuación",
    funcionesDurante: "• Activar alarma de evacuación cuando se indique\n• Guiar al personal por las rutas establecidas\n• Verificar que todas las áreas queden vacías\n• Llevar control del personal evacuado en punto de encuentro\n• Impedir el reingreso de personas\n• Reportar novedades al coordinador de emergencias",
    funcionesDespues: "• Verificar censo completo de personal evacuado\n• Reportar personas no localizadas\n• Participar en orden de reingreso a instalaciones\n• Elaborar informe de evacuación\n• Identificar fallas en el proceso de evacuación",
    equipamientoRequerido: ["Chaleco distintivo de evacuación", "Linterna recargable", "Megáfono o silbato", "Lista de censo de personal", "Radio de comunicación", "Brazalete identificador"],
    capacitacionRequerida: ["Técnicas de evacuación y primeros auxilios psicológicos", "Manejo de personas con discapacidad en emergencias", "Uso de equipos de comunicación", "Liderazgo en situaciones de crisis", "Señalización y rutas de evacuación"],
    normativa: "NTC 1700 / Resolución 0312/2019"
  },
  {
    codigo: "BRI-INC",
    tipoEnum: "control_incendios",
    nombre: "Brigada contra Incendios",
    descripcion: "Especializada en prevención, detección y control inicial de incendios",
    funcionesAntes: "• Inspeccionar mensualmente extintores y equipos contra incendio\n• Verificar funcionamiento de sistemas de detección\n• Mantener despejadas las áreas de extintores e hidrantes\n• Conocer ubicación de válvulas de corte de servicios\n• Participar en prácticas de manejo de extintores",
    funcionesDurante: "• Evaluar la magnitud del incendio\n• Intentar control inicial con extintores (solo si es seguro)\n• Activar sistema de alarma contra incendio\n• Cortar suministro de gas y electricidad si es necesario\n• Guiar y apoyar a bomberos cuando lleguen\n• Mantenerse en comunicación con coordinador",
    funcionesDespues: "• Verificar que el incendio esté completamente controlado\n• Apoyar en la evaluación de daños\n• Reponer extintores utilizados\n• Elaborar informe detallado del evento\n• Participar en investigación de causas",
    equipamientoRequerido: ["Extintor portátil (según tipo de fuego)", "Equipo de protección (casco, guantes, botas)", "Hacha y barra de palanca", "Manguera y llave de gabinete", "Linterna antiexplosiva", "Detector de humo portátil"],
    capacitacionRequerida: ["Teoría del fuego y clasificación de incendios", "Uso y manejo de extintores (todos los tipos)", "Técnicas de control de incendios incipientes", "Uso de gabinetes e hidrantes", "Evacuación en caso de incendio"],
    normativa: "NFPA 600 / Ley 9 de 1979"
  },
  {
    codigo: "BRI-BYR",
    tipoEnum: "busqueda_rescate",
    nombre: "Brigada de Búsqueda y Rescate",
    descripcion: "Especializada en localización y rescate de personas atrapadas o en peligro",
    funcionesAntes: "• Conocer todas las áreas de la empresa incluyendo sótanos y terrazas\n• Mantener actualizados planos de la edificación\n• Verificar equipos de rescate y EPP\n• Identificar posibles zonas de colapso\n• Practicar técnicas de rescate regularmente",
    funcionesDurante: "• Realizar búsqueda sistemática área por área\n• Rescatar personas atrapadas usando técnicas seguras\n• Señalizar áreas ya revisadas\n• Reportar ubicación de víctimas localizadas\n• Coordinar con brigada de primeros auxilios\n• Evaluar riesgos antes de ingresar a cualquier área",
    funcionesDespues: "• Verificar que todas las áreas fueron revisadas\n• Elaborar informe de personas rescatadas\n• Evaluar daños estructurales observados\n• Reponer equipos utilizados\n• Participar en evaluación post-emergencia",
    equipamientoRequerido: ["Casco con linterna frontal", "Guantes de cuero reforzado", "Cuerdas y arnés de rescate", "Barra de palanca y hacha", "Botiquín de trauma", "Radio de comunicación", "Camilla de rescate"],
    capacitacionRequerida: ["Técnicas de búsqueda y rescate", "Rescate en espacios confinados", "Manejo de víctimas con trauma", "Uso de cuerdas y nudos de rescate", "Evaluación de daños estructurales básica"],
    normativa: "Ley 1523/2012 / Decreto 1072/2015"
  },
  {
    codigo: "BRI-COM",
    tipoEnum: "comunicaciones",
    nombre: "Brigada de Comunicaciones",
    descripcion: "Responsable de coordinar las comunicaciones internas y externas durante emergencias",
    funcionesAntes: "• Mantener actualizado directorio de emergencias\n• Verificar funcionamiento de radios y sistemas de comunicación\n• Conocer protocolos de comunicación con entidades externas\n• Mantener actualizada lista de contactos de familiares\n• Coordinar con recepción y vigilancia",
    funcionesDurante: "• Activar sistema de alarma según protocolo\n• Notificar a organismos de socorro (Bomberos, Policía, Ambulancia)\n• Mantener comunicación entre brigadas y coordinador\n• Controlar información que sale de la empresa\n• Atender llamadas de familiares preocupados\n• Documentar cronología del evento",
    funcionesDespues: "• Notificar finalización de emergencia\n• Comunicar a familiares el estado del personal\n• Elaborar comunicado oficial si es necesario\n• Recopilar registros de comunicaciones\n• Participar en evaluación post-emergencia",
    equipamientoRequerido: ["Radios de dos vías", "Teléfono celular de emergencia", "Directorio de emergencias actualizado", "Megáfono o sistema de altavoces", "Computador con acceso a correo", "Grabadora de voz"],
    capacitacionRequerida: ["Protocolos de comunicación en emergencias", "Manejo de crisis comunicacionales", "Primeros auxilios psicológicos", "Uso de equipos de comunicación", "Manejo de información sensible"],
    normativa: "Decreto 1072/2015 Art. 2.2.4.6.25"
  },
  {
    codigo: "BRI-INT",
    tipoEnum: "integral",
    nombre: "Brigada Integral",
    descripcion: "Brigada capacitada en todas las especialidades para empresas con recursos limitados",
    funcionesAntes: "• Cumplir todas las funciones preventivas de las brigadas especializadas\n• Mantener inventario completo de equipos de emergencia\n• Participar en todas las capacitaciones requeridas\n• Conocer todos los procedimientos de emergencia\n• Verificar sistemas de alarma y rutas de evacuación",
    funcionesDurante: "• Evaluar tipo de emergencia y priorizar acciones\n• Ejecutar primeros auxilios a afectados\n• Controlar conatos de incendio\n• Coordinar evacuación del personal\n• Realizar búsqueda de personas atrapadas si es seguro\n• Mantener comunicación con organismos de socorro",
    funcionesDespues: "• Ejecutar todas las funciones post-emergencia\n• Elaborar informe integral del evento\n• Reponer todos los equipos utilizados\n• Liderar evaluación post-emergencia\n• Proponer mejoras al plan de emergencias",
    equipamientoRequerido: ["Equipos de primeros auxilios completos", "Extintores y equipos contra incendio", "Equipos de evacuación", "Equipos de comunicación", "EPP especializado"],
    capacitacionRequerida: ["Primeros auxilios certificados", "Manejo de extintores y control de incendios", "Técnicas de evacuación", "Búsqueda y rescate básico", "Comunicaciones en emergencia"],
    normativa: "Resolución 0312/2019 (para empresas < 50 trabajadores)"
  }
];

// ============================================
// AMENAZAS Y ANÁLISIS DE VULNERABILIDAD
// ============================================
export interface TipoAmenaza {
  codigo: string;
  categoria: "natural" | "tecnologica" | "social" | "biologica";
  nombre: string;
  descripcion: string;
  fuenteGeneradora: string;
  posiblesEfectos: string[];
  medidasPreventivas: string[];
}

export const TIPOS_AMENAZAS: TipoAmenaza[] = [
  // AMENAZAS NATURALES
  {
    codigo: "AME-SIS",
    categoria: "natural",
    nombre: "Sismo / Terremoto",
    descripcion: "Movimiento telúrico que puede afectar estructuras e instalaciones",
    fuenteGeneradora: "Actividad tectónica, fallas geológicas activas",
    posiblesEfectos: ["Colapso estructural", "Atrapamiento de personas", "Incendios secundarios", "Ruptura de tuberías de gas y agua", "Cortes de energía"],
    medidasPreventivas: ["Reforzamiento estructural según NSR-10", "Fijación de estantes y equipos pesados", "Identificación de zonas seguras", "Simulacros de evacuación", "Reserva de agua y alimentos"]
  },
  {
    codigo: "AME-INU",
    categoria: "natural",
    nombre: "Inundación",
    descripcion: "Desbordamiento de cuerpos de agua o acumulación por lluvias intensas",
    fuenteGeneradora: "Lluvias intensas, desbordamiento de ríos, fallas en drenajes",
    posiblesEfectos: ["Daños a infraestructura y equipos", "Interrupción de operaciones", "Contaminación del agua", "Electrocución", "Enfermedades transmitidas por agua"],
    medidasPreventivas: ["Limpieza periódica de desagües", "Protección de equipos eléctricos en zonas bajas", "Barreras de contención", "Bombas de achique", "Plan de reubicación de materiales"]
  },
  {
    codigo: "AME-TOR",
    categoria: "natural",
    nombre: "Tormenta Eléctrica / Vendaval",
    descripcion: "Fenómeno atmosférico con rayos, vientos fuertes y granizo",
    fuenteGeneradora: "Condiciones atmosféricas adversas",
    posiblesEfectos: ["Electrocución", "Caída de objetos y estructuras", "Daños a equipos electrónicos", "Cortes de energía", "Incendios por rayos"],
    medidasPreventivas: ["Sistema de pararrayos certificado", "Protección de equipos electrónicos (UPS)", "Aseguramiento de elementos externos", "Poda de árboles cerca de instalaciones", "Refugio seguro identificado"]
  },
  {
    codigo: "AME-DES",
    categoria: "natural",
    nombre: "Deslizamiento / Remoción en Masa",
    descripcion: "Movimiento de tierra que puede afectar estructuras",
    fuenteGeneradora: "Lluvias intensas, erosión, construcciones inadecuadas",
    posiblesEfectos: ["Sepultamiento de instalaciones", "Bloqueo de vías de acceso", "Daño a infraestructura", "Atrapamiento de personas"],
    medidasPreventivas: ["Evaluación geotécnica del terreno", "Sistemas de drenaje adecuados", "Muros de contención", "Monitoreo de grietas", "Restricción de construcción en zonas de riesgo"]
  },
  // AMENAZAS TECNOLÓGICAS
  {
    codigo: "AME-INC",
    categoria: "tecnologica",
    nombre: "Incendio",
    descripcion: "Fuego no controlado que puede afectar instalaciones y personas",
    fuenteGeneradora: "Cortocircuitos, materiales inflamables, negligencia, fuentes de calor",
    posiblesEfectos: ["Pérdidas humanas y materiales", "Contaminación del aire", "Daño estructural", "Interrupción de operaciones", "Explosiones secundarias"],
    medidasPreventivas: ["Sistema de detección de humo", "Extintores según tipo de riesgo", "Gabinetes contra incendio", "Control de materiales inflamables", "Inspección de instalaciones eléctricas"]
  },
  {
    codigo: "AME-EXP",
    categoria: "tecnologica",
    nombre: "Explosión",
    descripcion: "Liberación súbita de energía con efectos destructivos",
    fuenteGeneradora: "Gases combustibles, sustancias químicas, calderas, equipos a presión",
    posiblesEfectos: ["Pérdidas humanas graves", "Destrucción de infraestructura", "Proyección de fragmentos", "Incendios secundarios", "Onda expansiva"],
    medidasPreventivas: ["Mantenimiento de equipos a presión", "Detectores de gases combustibles", "Ventilación adecuada", "Control de fuentes de ignición", "Certificación de equipos"]
  },
  {
    codigo: "AME-DER",
    categoria: "tecnologica",
    nombre: "Derrame de Sustancias Peligrosas",
    descripcion: "Liberación no controlada de sustancias químicas",
    fuenteGeneradora: "Ruptura de contenedores, fallas de equipos, errores operacionales",
    posiblesEfectos: ["Intoxicación de personas", "Contaminación ambiental", "Quemaduras químicas", "Incendios o explosiones", "Daños a equipos"],
    medidasPreventivas: ["Almacenamiento según compatibilidad química", "Diques de contención", "Kits de derrames", "Capacitación en manejo de SDS", "EPP especializado disponible"]
  },
  {
    codigo: "AME-FUG",
    categoria: "tecnologica",
    nombre: "Fuga de Gas",
    descripcion: "Escape de gases combustibles o tóxicos",
    fuenteGeneradora: "Deterioro de tuberías, conexiones defectuosas, válvulas dañadas",
    posiblesEfectos: ["Explosión", "Asfixia", "Intoxicación", "Incendio", "Evacuación masiva"],
    medidasPreventivas: ["Mantenimiento preventivo de tuberías", "Detectores de gas instalados", "Válvulas de corte accesibles", "Ventilación natural o forzada", "Inspecciones periódicas certificadas"]
  },
  {
    codigo: "AME-EST",
    categoria: "tecnologica",
    nombre: "Falla Estructural / Colapso",
    descripcion: "Pérdida de capacidad de carga de estructuras",
    fuenteGeneradora: "Diseño deficiente, sobrecarga, deterioro, sismos",
    posiblesEfectos: ["Atrapamiento de personas", "Pérdidas humanas", "Daños totales a instalaciones", "Interrupción prolongada de operaciones"],
    medidasPreventivas: ["Evaluación estructural periódica", "Respeto de cargas máximas", "Mantenimiento de estructuras", "Reforzamiento si se requiere", "Monitoreo de grietas y fisuras"]
  },
  // AMENAZAS SOCIALES
  {
    codigo: "AME-ATR",
    categoria: "social",
    nombre: "Atraco / Asalto",
    descripcion: "Acción delictiva con intención de robo o lesión",
    fuenteGeneradora: "Delincuencia común, manejo de dinero en efectivo",
    posiblesEfectos: ["Lesiones a trabajadores", "Trauma psicológico", "Pérdidas económicas", "Interrupción de operaciones"],
    medidasPreventivas: ["Sistema de vigilancia CCTV", "Control de acceso", "Botón de pánico", "Protocolo de no resistencia", "Manejo mínimo de efectivo", "Iluminación perimetral"]
  },
  {
    codigo: "AME-SEC",
    categoria: "social",
    nombre: "Secuestro / Toma de Rehenes",
    descripcion: "Retención forzada de personas",
    fuenteGeneradora: "Grupos delincuenciales, conflicto armado",
    posiblesEfectos: ["Trauma físico y psicológico", "Pérdidas económicas", "Afectación a familias", "Interrupción de operaciones"],
    medidasPreventivas: ["Análisis de seguridad perimetral", "Protocolos de comunicación", "Coordinación con autoridades", "Bajo perfil en movimientos de ejecutivos", "Seguro de secuestro"]
  },
  {
    codigo: "AME-TER",
    categoria: "social",
    nombre: "Atentado Terrorista / Amenaza de Bomba",
    descripcion: "Acción violenta con fines de intimidación o destrucción",
    fuenteGeneradora: "Grupos terroristas, amenazas políticas",
    posiblesEfectos: ["Pérdidas humanas masivas", "Destrucción de instalaciones", "Trauma colectivo", "Interrupción prolongada"],
    medidasPreventivas: ["Control de acceso estricto", "Inspección de paquetes y vehículos", "Sistema de vigilancia", "Protocolo de amenaza de bomba", "Coordinación con Policía y GAULA"]
  },
  {
    codigo: "AME-MOT",
    categoria: "social",
    nombre: "Asonada / Disturbio Civil",
    descripcion: "Alteración del orden público cerca de instalaciones",
    fuenteGeneradora: "Protestas sociales, conflictos laborales",
    posiblesEfectos: ["Vandalismo", "Bloqueo de accesos", "Lesiones a personal", "Daños a instalaciones", "Interrupción de operaciones"],
    medidasPreventivas: ["Monitoreo de situación social", "Reforzamiento de cerramientos", "Plan de cierre anticipado", "Comunicación con trabajadores", "Coordinación con autoridades"]
  },
  // AMENAZAS BIOLÓGICAS
  {
    codigo: "AME-PAN",
    categoria: "biologica",
    nombre: "Pandemia / Epidemia",
    descripcion: "Propagación masiva de enfermedades infecciosas",
    fuenteGeneradora: "Virus, bacterias, agentes biológicos",
    posiblesEfectos: ["Ausentismo masivo", "Contagio entre trabajadores", "Interrupción de operaciones", "Pérdidas económicas", "Fallecimientos"],
    medidasPreventivas: ["Protocolo de bioseguridad", "EPP biológico disponible", "Promoción de vacunación", "Teletrabajo cuando sea posible", "Ventilación adecuada", "Puntos de desinfección"]
  },
  {
    codigo: "AME-INT",
    categoria: "biologica",
    nombre: "Intoxicación Alimentaria Masiva",
    descripcion: "Afectación de múltiples personas por consumo de alimentos contaminados",
    fuenteGeneradora: "Alimentos en mal estado, contaminación cruzada, manipulación inadecuada",
    posiblesEfectos: ["Múltiples personas enfermas", "Ausentismo", "Demandas legales", "Afectación de imagen"],
    medidasPreventivas: ["Control de proveedores de alimentos", "Inspección de cocina y casino", "Capacitación a manipuladores", "Cadena de frío controlada", "Análisis microbiológico periódico"]
  },
  {
    codigo: "AME-PLA",
    categoria: "biologica",
    nombre: "Plagas (Roedores, Insectos)",
    descripcion: "Presencia de vectores que pueden transmitir enfermedades",
    fuenteGeneradora: "Condiciones sanitarias deficientes, acumulación de residuos",
    posiblesEfectos: ["Enfermedades transmitidas por vectores", "Contaminación de productos", "Daños a instalaciones", "Cierre sanitario"],
    medidasPreventivas: ["Programa de control de plagas certificado", "Manejo adecuado de residuos", "Sellado de grietas y orificios", "Almacenamiento adecuado de alimentos", "Inspecciones sanitarias periódicas"]
  }
];

export const CATEGORIAS_AMENAZAS = [
  { codigo: "natural", nombre: "Amenazas Naturales", descripcion: "Fenómenos de origen natural" },
  { codigo: "tecnologica", nombre: "Amenazas Tecnológicas", descripcion: "Originadas por actividades humanas o fallas técnicas" },
  { codigo: "social", nombre: "Amenazas Sociales", descripcion: "Derivadas de comportamientos humanos delictivos o conflictos" },
  { codigo: "biologica", nombre: "Amenazas Biológicas", descripcion: "Relacionadas con agentes biológicos y enfermedades" }
];

// ============================================
// METODOLOGÍAS DE ANÁLISIS DE VULNERABILIDAD
// ============================================
export interface MetodologiaVulnerabilidad {
  codigo: string;
  nombre: string;
  descripcion: string;
  normativa: string;
  nivelRiesgo: { valor: string; etiqueta: string; color: string }[];
}

export const METODOLOGIAS_VULNERABILIDAD: MetodologiaVulnerabilidad[] = [
  {
    codigo: "diamante",
    nombre: "Análisis de Vulnerabilidad por Diamante",
    descripcion: "Metodología que evalúa vulnerabilidad en personas, recursos, sistemas y procesos, recuperación",
    normativa: "FOPAE / IDIGER Bogotá",
    nivelRiesgo: [
      { valor: "bajo", etiqueta: "Bajo (0-25%)", color: "green" },
      { valor: "medio", etiqueta: "Medio (26-50%)", color: "yellow" },
      { valor: "alto", etiqueta: "Alto (51-75%)", color: "orange" },
      { valor: "muy_alto", etiqueta: "Muy Alto (76-100%)", color: "red" }
    ]
  },
  {
    codigo: "colores",
    nombre: "Análisis por Colores",
    descripcion: "Metodología simplificada que usa código de colores para evaluar amenaza, vulnerabilidad y riesgo",
    normativa: "FOPAE / ARL",
    nivelRiesgo: [
      { valor: "posible", etiqueta: "Posible (Verde)", color: "green" },
      { valor: "probable", etiqueta: "Probable (Amarillo)", color: "yellow" },
      { valor: "inminente", etiqueta: "Inminente (Rojo)", color: "red" }
    ]
  },
  {
    codigo: "semicuantitativo",
    nombre: "Método Semicuantitativo",
    descripcion: "Evaluación numérica de probabilidad e impacto de amenazas",
    normativa: "ISO 31000 / GTC-45",
    nivelRiesgo: [
      { valor: "aceptable", etiqueta: "Aceptable (1-4)", color: "green" },
      { valor: "moderado", etiqueta: "Moderado (5-8)", color: "yellow" },
      { valor: "importante", etiqueta: "Importante (9-16)", color: "orange" },
      { valor: "inaceptable", etiqueta: "Inaceptable (17-25)", color: "red" }
    ]
  }
];

// ============================================
// RECURSOS DE EMERGENCIA
// ============================================
export interface TipoRecurso {
  codigo: string;
  tipo: string;
  nombre: string;
  descripcion: string;
  especificacionesTecnicas: string[];
  normativaCertificacion: string;
  frecuenciaInspeccion: string;
  ubicacionesSugeridas: string[];
}

export const TIPOS_RECURSOS_EMERGENCIA: TipoRecurso[] = [
  {
    codigo: "REC-EXT-ABC",
    tipo: "extintor",
    nombre: "Extintor Multipropósito ABC",
    descripcion: "Extintor de polvo químico seco para fuegos clase A, B y C",
    especificacionesTecnicas: ["Capacidad: 10, 20 o 30 libras", "Agente: Polvo químico seco ABC", "Alcance: 3-6 metros", "Presión: 195-200 PSI", "Duración descarga: 10-25 segundos"],
    normativaCertificacion: "NTC 2885 / NFPA 10",
    frecuenciaInspeccion: "Mensual visual, anual mantenimiento certificado",
    ubicacionesSugeridas: ["Pasillos principales", "Áreas de producción", "Cocinas", "Cuartos eléctricos", "Bodegas"]
  },
  {
    codigo: "REC-EXT-CO2",
    tipo: "extintor",
    nombre: "Extintor de CO2",
    descripcion: "Extintor de dióxido de carbono para fuegos clase B y C (equipos eléctricos)",
    especificacionesTecnicas: ["Capacidad: 5, 10, 15 o 20 libras", "Agente: CO2 gaseoso", "Alcance: 1-2.5 metros", "No deja residuos"],
    normativaCertificacion: "NTC 2885 / NFPA 10",
    frecuenciaInspeccion: "Mensual visual, anual mantenimiento certificado",
    ubicacionesSugeridas: ["Salas de servidores", "Cuartos eléctricos", "Laboratorios", "Equipos electrónicos sensibles"]
  },
  {
    codigo: "REC-EXT-K",
    tipo: "extintor",
    nombre: "Extintor Clase K (Cocinas)",
    descripcion: "Extintor para fuegos en aceites y grasas de cocina",
    especificacionesTecnicas: ["Capacidad: 6 litros mínimo", "Agente: Acetato de potasio", "Diseñado para grasas calientes"],
    normativaCertificacion: "NFPA 10 / UL 300",
    frecuenciaInspeccion: "Mensual visual, semestral mantenimiento",
    ubicacionesSugeridas: ["Cocinas industriales", "Cafeterías", "Comedores"]
  },
  {
    codigo: "REC-BOT-A",
    tipo: "botiquin",
    nombre: "Botiquín Tipo A (Básico)",
    descripcion: "Botiquín para empresas con menos de 25 trabajadores",
    especificacionesTecnicas: ["Gasas estériles", "Esparadrapo", "Vendas elásticas", "Guantes de látex", "Tijeras", "Alcohol antiséptico", "Jabón quirúrgico", "Manual de primeros auxilios"],
    normativaCertificacion: "Resolución 0705/2007",
    frecuenciaInspeccion: "Mensual inventario, verificar vencimientos",
    ubicacionesSugeridas: ["Recepción", "Oficinas principales", "Cada piso o área de trabajo"]
  },
  {
    codigo: "REC-BOT-B",
    tipo: "botiquin",
    nombre: "Botiquín Tipo B (Intermedio)",
    descripcion: "Botiquín para empresas entre 25 y 50 trabajadores",
    especificacionesTecnicas: ["Todo lo del Tipo A", "Inmovilizadores cervicales", "Tablillas de inmovilización", "Bolsas de hielo químico", "Linterna", "Termómetro"],
    normativaCertificacion: "Resolución 0705/2007",
    frecuenciaInspeccion: "Mensual inventario, verificar vencimientos",
    ubicacionesSugeridas: ["Enfermería", "Área de producción", "Portería principal"]
  },
  {
    codigo: "REC-BOT-C",
    tipo: "botiquin",
    nombre: "Botiquín Tipo C (Completo)",
    descripcion: "Botiquín para empresas con más de 50 trabajadores",
    especificacionesTecnicas: ["Todo lo de Tipo A y B", "Tensiómetro", "Fonendoscopio", "Oxímetro de pulso", "Equipos de sutura (solo para profesionales)", "Camilla portátil"],
    normativaCertificacion: "Resolución 0705/2007",
    frecuenciaInspeccion: "Quincenal inventario, verificar vencimientos",
    ubicacionesSugeridas: ["Área de salud ocupacional", "Enfermería", "Áreas de alto riesgo"]
  },
  {
    codigo: "REC-CAM",
    tipo: "camilla",
    nombre: "Camilla de Emergencias",
    descripcion: "Camilla rígida para transporte de lesionados",
    especificacionesTecnicas: ["Capacidad: mínimo 150 kg", "Material: aluminio o plástico reforzado", "Incluye correas de sujeción", "Incluye inmovilizador cervical"],
    normativaCertificacion: "NTC 4264",
    frecuenciaInspeccion: "Mensual estado físico y correas",
    ubicacionesSugeridas: ["Enfermería", "Cada piso", "Áreas de alto riesgo", "Punto cercano a escaleras"]
  },
  {
    codigo: "REC-DEA",
    tipo: "dea",
    nombre: "Desfibrilador Externo Automático (DEA)",
    descripcion: "Dispositivo para tratamiento de paro cardíaco súbito",
    especificacionesTecnicas: ["Automático o semiautomático", "Incluye electrodos adulto", "Batería de larga duración", "Instrucciones de voz"],
    normativaCertificacion: "Ley 1831/2017 (obligatorio en lugares públicos)",
    frecuenciaInspeccion: "Mensual verificación de batería y electrodos",
    ubicacionesSugeridas: ["Recepción principal", "Gimnasios", "Áreas con más de 50 personas", "Cada 100 metros en grandes instalaciones"]
  },
  {
    codigo: "REC-KIT-DER",
    tipo: "kit_derrames",
    nombre: "Kit para Control de Derrames",
    descripcion: "Conjunto de elementos para contención y limpieza de derrames químicos",
    especificacionesTecnicas: ["Material absorbente (paños, almohadillas)", "Diques de contención", "Bolsas para disposición", "EPP: guantes, gafas, delantal", "Pala y recogedor"],
    normativaCertificacion: "Decreto 1076/2015 / Decreto 4741/2005",
    frecuenciaInspeccion: "Mensual verificación de contenido",
    ubicacionesSugeridas: ["Áreas de almacenamiento químico", "Laboratorios", "Zonas de carga y descarga", "Cada área con sustancias peligrosas"]
  },
  {
    codigo: "REC-LIN",
    tipo: "linterna_emergencia",
    nombre: "Linterna de Emergencia Recargable",
    descripcion: "Linterna de alta potencia para evacuación nocturna o sin energía",
    especificacionesTecnicas: ["LED de alta potencia", "Batería recargable", "Autonomía mínima 4 horas", "Resistente a impactos"],
    normativaCertificacion: "N/A",
    frecuenciaInspeccion: "Mensual verificación de carga",
    ubicacionesSugeridas: ["Brigadas de evacuación", "Salidas de emergencia", "Cuartos de control", "Áreas sin iluminación natural"]
  },
  {
    codigo: "REC-MEG",
    tipo: "megafono",
    nombre: "Megáfono con Sirena",
    descripcion: "Amplificador de voz para coordinación de evacuaciones",
    especificacionesTecnicas: ["Alcance mínimo 500 metros", "Incluye sirena integrada", "Baterías de respaldo"],
    normativaCertificacion: "N/A",
    frecuenciaInspeccion: "Mensual verificación de funcionamiento",
    ubicacionesSugeridas: ["Coordinadores de emergencia", "Puntos de encuentro", "Portería principal"]
  },
  {
    codigo: "REC-GAB",
    tipo: "gabinete_incendio",
    nombre: "Gabinete Contra Incendio",
    descripcion: "Gabinete con manguera y accesorios para control de incendios",
    especificacionesTecnicas: ["Manguera de 1.5 pulgadas", "Longitud 30 metros", "Pitón de chorro-niebla", "Válvula de 2.5 pulgadas", "Hacha y llave spanner"],
    normativaCertificacion: "NFPA 14 / NTC 1669",
    frecuenciaInspeccion: "Trimestral funcionamiento, anual prueba hidrostática",
    ubicacionesSugeridas: ["Cada 30 metros en pasillos", "Cerca de escaleras", "Áreas de alto riesgo de incendio"]
  },
  {
    codigo: "REC-SEN",
    tipo: "senalizacion",
    nombre: "Señalización de Emergencia Fotoluminiscente",
    descripcion: "Señales para indicar rutas de evacuación, equipos y puntos de encuentro",
    especificacionesTecnicas: ["Material fotoluminiscente", "Visible en oscuridad mínimo 8 horas", "Resistente a la intemperie si es exterior"],
    normativaCertificacion: "NTC 1461 / ISO 7010",
    frecuenciaInspeccion: "Trimestral estado y luminiscencia",
    ubicacionesSugeridas: ["Rutas de evacuación", "Salidas de emergencia", "Ubicación de extintores", "Puntos de encuentro", "Ubicación de equipos de emergencia"]
  }
];

// ============================================
// TIPOS DE SIMULACROS
// ============================================
export interface TipoSimulacro {
  codigo: string;
  nombre: string;
  descripcion: string;
  objetivos: string[];
  actividadesPrincipales: string[];
  indicadoresEvaluacion: string[];
  frecuenciaMinima: string;
  normativa: string;
}

export const TIPOS_SIMULACROS: TipoSimulacro[] = [
  {
    codigo: "SIM-EVA",
    nombre: "Simulacro de Evacuación General",
    descripcion: "Práctica de desalojo total de instalaciones",
    objetivos: ["Evaluar tiempos de evacuación", "Verificar funcionamiento de alarmas", "Identificar obstáculos en rutas", "Evaluar coordinación de brigadas"],
    actividadesPrincipales: ["Activación de alarma", "Evacuación por rutas establecidas", "Censo en punto de encuentro", "Simulación de búsqueda de rezagados"],
    indicadoresEvaluacion: ["Tiempo total de evacuación", "Porcentaje de personal evacuado", "Funcionamiento de alarmas", "Claridad de rutas de evacuación"],
    frecuenciaMinima: "Semestral (mínimo 2 al año)",
    normativa: "Decreto 1072/2015 Art. 2.2.4.6.25"
  },
  {
    codigo: "SIM-INC",
    nombre: "Simulacro de Incendio",
    descripcion: "Práctica de respuesta ante conato de incendio",
    objetivos: ["Evaluar respuesta de brigada contra incendios", "Verificar disponibilidad y estado de extintores", "Practicar técnicas de extinción", "Coordinar evacuación y control"],
    actividadesPrincipales: ["Detección y alarma de incendio", "Uso de extintores en fuego controlado", "Evacuación simultánea", "Coordinación con bomberos (si aplica)"],
    indicadoresEvaluacion: ["Tiempo de respuesta de brigada", "Efectividad en uso de extintores", "Coordinación entre brigadas", "Tiempo de evacuación"],
    frecuenciaMinima: "Anual (mínimo 1 al año)",
    normativa: "NFPA 600 / Resolución 0312/2019"
  },
  {
    codigo: "SIM-SIS",
    nombre: "Simulacro de Sismo",
    descripcion: "Práctica de respuesta ante movimiento telúrico",
    objetivos: ["Practicar técnica de protección (agáchese, cúbrase, agárrese)", "Evaluar evacuación post-sismo", "Identificar zonas seguras", "Practicar búsqueda de atrapados"],
    actividadesPrincipales: ["Señal de sismo", "Protección en zonas seguras", "Espera de réplicas", "Evacuación controlada", "Inspección de daños"],
    indicadoresEvaluacion: ["Reacción ante señal de sismo", "Ubicación en zonas seguras", "Comportamiento ordenado", "Inspección post-sismo"],
    frecuenciaMinima: "Anual (mínimo 1 al año)",
    normativa: "Ley 1523/2012 / NSR-10"
  },
  {
    codigo: "SIM-DER",
    nombre: "Simulacro de Derrame Químico",
    descripcion: "Práctica de respuesta ante derrame de sustancias peligrosas",
    objetivos: ["Evaluar uso de kits de derrames", "Practicar contención y limpieza", "Verificar uso de EPP especializado", "Coordinar evacuación de área afectada"],
    actividadesPrincipales: ["Detección del derrame", "Aislamiento del área", "Uso de EPP", "Contención y absorción", "Disposición de residuos"],
    indicadoresEvaluacion: ["Tiempo de respuesta", "Uso correcto de EPP", "Efectividad de contención", "Disposición adecuada de residuos"],
    frecuenciaMinima: "Anual (en áreas con químicos)",
    normativa: "Decreto 1076/2015 / Decreto 4741/2005"
  },
  {
    codigo: "SIM-PAU",
    nombre: "Simulacro de Primeros Auxilios",
    descripcion: "Práctica de atención de emergencias médicas",
    objetivos: ["Evaluar respuesta de brigada de primeros auxilios", "Practicar técnicas de RCP y uso de DEA", "Verificar estado de botiquines", "Coordinar traslado a centro médico"],
    actividadesPrincipales: ["Detección de víctima", "Evaluación inicial", "RCP y uso de DEA (si aplica)", "Atención de heridas/fracturas", "Traslado con camilla"],
    indicadoresEvaluacion: ["Tiempo de llegada de brigadista", "Técnica de RCP correcta", "Uso adecuado de botiquín", "Estabilización de víctima"],
    frecuenciaMinima: "Semestral (mínimo 2 al año)",
    normativa: "Resolución 0312/2019 Art. 18"
  },
  {
    codigo: "SIM-CON",
    nombre: "Simulacro de Confinamiento",
    descripcion: "Práctica de resguardo en instalaciones ante amenaza externa",
    objetivos: ["Evaluar procedimiento de resguardo", "Verificar sistemas de comunicación", "Practicar cierre de accesos", "Coordinar con autoridades"],
    actividadesPrincipales: ["Señal de confinamiento", "Cierre de puertas y ventanas", "Resguardo en zonas seguras", "Comunicación centralizada", "Espera de orden de evacuación"],
    indicadoresEvaluacion: ["Tiempo de cierre de accesos", "Comunicación efectiva", "Comportamiento del personal", "Coordinación con vigilancia"],
    frecuenciaMinima: "Anual (según análisis de riesgo)",
    normativa: "Decreto 1072/2015"
  },
  {
    codigo: "SIM-INT",
    nombre: "Simulacro Integral",
    descripcion: "Práctica que combina múltiples escenarios de emergencia",
    objetivos: ["Evaluar respuesta a emergencia compleja", "Verificar coordinación entre brigadas", "Practicar toma de decisiones", "Evaluar plan de emergencias completo"],
    actividadesPrincipales: ["Escenario con múltiples eventos", "Activación de todas las brigadas", "Coordinación con organismos externos", "Evacuación y atención de víctimas", "Centro de comando operativo"],
    indicadoresEvaluacion: ["Coordinación general", "Tiempo total de respuesta", "Efectividad de comunicaciones", "Toma de decisiones acertadas"],
    frecuenciaMinima: "Anual (altamente recomendado)",
    normativa: "Decreto 1072/2015 / ISO 45001"
  }
];

export const ROLES_SIMULACRO = [
  { valor: "evacuado", etiqueta: "Evacuado", descripcion: "Persona que participa evacuando las instalaciones" },
  { valor: "victima", etiqueta: "Víctima simulada", descripcion: "Persona que simula estar herida o atrapada" },
  { valor: "observador", etiqueta: "Observador", descripcion: "Persona que evalúa el desarrollo del simulacro" },
  { valor: "coordinador_area", etiqueta: "Coordinador de área", descripcion: "Responsable de coordinar evacuación de un área" },
  { valor: "brigadista", etiqueta: "Brigadista activo", descripcion: "Miembro de brigada que ejecuta funciones de emergencia" },
  { valor: "evaluador_externo", etiqueta: "Evaluador externo", descripcion: "Persona externa que evalúa objetivamente" }
];

// ============================================
// EVACUACIÓN (Zonas, Rutas, Puntos de Encuentro)
// ============================================
export interface TipoZona {
  codigo: string;
  nombre: string;
  descripcion: string;
  capacidadMaxima: string;
  caracteristicas: string[];
}

export const TIPOS_ZONAS_EVACUACION: TipoZona[] = [
  { codigo: "ZON-ADM", nombre: "Zona Administrativa / Oficinas", descripcion: "Áreas de trabajo de oficina con personal administrativo", capacidadMaxima: "Variable según área", caracteristicas: ["Bajo riesgo de incendio", "Fácil evacuación", "Requiere censo de personal"] },
  { codigo: "ZON-PRO", nombre: "Zona de Producción", descripcion: "Áreas donde se realizan procesos productivos", capacidadMaxima: "Según proceso", caracteristicas: ["Maquinaria que requiere paro seguro", "Posible manejo de químicos", "EPP requerido para evacuación"] },
  { codigo: "ZON-BOD", nombre: "Zona de Almacenamiento / Bodega", descripcion: "Áreas de almacenamiento de materiales", capacidadMaxima: "Bajo", caracteristicas: ["Riesgo de caída de objetos", "Posibles materiales peligrosos", "Verificar antes de reingresar"] },
  { codigo: "ZON-LAB", nombre: "Zona de Laboratorio", descripcion: "Laboratorios con sustancias químicas o biológicas", capacidadMaxima: "Limitada", caracteristicas: ["Sustancias peligrosas", "Procedimiento de aseguramiento", "Verificación de fugas antes de reingreso"] },
  { codigo: "ZON-COM", nombre: "Zona Común / Servicios", descripcion: "Comedores, baños, áreas de descanso", capacidadMaxima: "Variable", caracteristicas: ["Alto flujo de personas", "Múltiples rutas de evacuación", "Fácil acceso"] },
  { codigo: "ZON-EXT", nombre: "Zona Exterior / Parqueadero", descripcion: "Áreas al aire libre y parqueaderos", capacidadMaxima: "Variable", caracteristicas: ["Riesgo de vehículos", "Punto de referencia para evacuación", "Verificar ausencia de peligros"] },
  { codigo: "ZON-TEC", nombre: "Zona Técnica / Cuartos de Máquinas", descripcion: "Subestaciones, calderas, compresores", capacidadMaxima: "Solo personal autorizado", caracteristicas: ["Alto riesgo eléctrico", "Equipos críticos", "Procedimiento de corte de energía"] }
];

export interface TipoRutaEvacuacion {
  codigo: string;
  nombre: string;
  descripcion: string;
  caracteristicas: string[];
  senalizacionRequerida: string[];
}

export const TIPOS_RUTAS_EVACUACION: TipoRutaEvacuacion[] = [
  {
    codigo: "RUT-PRI",
    nombre: "Ruta Principal",
    descripcion: "Ruta más directa y segura hacia el punto de encuentro",
    caracteristicas: ["Ancho mínimo 1.20 metros", "Libre de obstáculos", "Iluminación de emergencia", "Señalización visible"],
    senalizacionRequerida: ["Flechas direccionales", "Señal de salida de emergencia", "Iluminación fotoluminiscente"]
  },
  {
    codigo: "RUT-ALT",
    nombre: "Ruta Alterna",
    descripcion: "Ruta secundaria cuando la principal está bloqueada",
    caracteristicas: ["Claramente identificada", "Conocida por todo el personal", "Iluminación de emergencia"],
    senalizacionRequerida: ["Señalización de ruta alterna", "Flechas direccionales", "Punto de decisión marcado"]
  },
  {
    codigo: "RUT-ESC",
    nombre: "Ruta por Escaleras de Emergencia",
    descripcion: "Evacuación vertical por escaleras",
    caracteristicas: ["Presurización (edificios altos)", "Pasamanos en ambos lados", "Iluminación de emergencia"],
    senalizacionRequerida: ["Señal de escaleras de emergencia", "Número de piso en cada nivel", "Dirección de evacuación"]
  }
];

export interface TipoPuntoEncuentro {
  codigo: string;
  nombre: string;
  descripcion: string;
  criterios: string[];
}

export const TIPOS_PUNTOS_ENCUENTRO: TipoPuntoEncuentro[] = [
  {
    codigo: "PE-PRI",
    nombre: "Punto de Encuentro Principal",
    descripcion: "Punto primario de concentración post-evacuación",
    criterios: ["Distancia segura del edificio (mínimo 50 metros)", "Espacio suficiente para todo el personal", "Sin riesgo de caída de objetos", "Acceso para vehículos de emergencia", "Identificado con señalización visible"]
  },
  {
    codigo: "PE-ALT",
    nombre: "Punto de Encuentro Alterno",
    descripcion: "Punto secundario cuando el principal no es seguro",
    criterios: ["Ubicación diferente al principal", "Mismas características de seguridad", "Conocido por todo el personal", "Señalizado como punto alterno"]
  }
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

export function generarCodigoPlan(tipo: string, consecutivo: number): string {
  const año = new Date().getFullYear();
  return `${tipo}-${año}-${String(consecutivo).padStart(3, '0')}`;
}

export function generarNombrePlan(tipoPlan: TipoPlan): string {
  const año = new Date().getFullYear();
  return `${tipoPlan.nombre} - ${año}`;
}

export function generarCodigoBrigada(tipo: string, consecutivo: number): string {
  return `BRI-${tipo.toUpperCase().substring(0, 3)}-${String(consecutivo).padStart(2, '0')}`;
}

export function generarCodigoRecurso(tipo: string, ubicacion: string, consecutivo: number): string {
  const tipoCode = tipo.toUpperCase().substring(0, 3);
  const ubicacionCode = ubicacion.toUpperCase().replace(/\s/g, '').substring(0, 4);
  return `${tipoCode}-${ubicacionCode}-${String(consecutivo).padStart(3, '0')}`;
}

export function generarCodigoSimulacro(tipo: string, consecutivo: number): string {
  const año = new Date().getFullYear();
  const tipoCode = tipo.toUpperCase().substring(0, 3);
  return `SIM-${tipoCode}-${año}-${String(consecutivo).padStart(2, '0')}`;
}

export function generarCodigoZona(tipo: string, consecutivo: number): string {
  return `${tipo}-${String(consecutivo).padStart(2, '0')}`;
}

export function generarCodigoRuta(origen: string, destino: string): string {
  const origenCode = origen.toUpperCase().replace(/\s/g, '').substring(0, 4);
  const destinoCode = destino.toUpperCase().replace(/\s/g, '').substring(0, 4);
  return `RUT-${origenCode}-${destinoCode}`;
}

export function generarCodigoPuntoEncuentro(numero: number): string {
  return `PE-${String(numero).padStart(2, '0')}`;
}

export function getAmenazasPorCategoria(categoria: string): TipoAmenaza[] {
  return TIPOS_AMENAZAS.filter(a => a.categoria === categoria);
}

export function getBrigadaPorTipo(tipo: string): TipoBrigada | undefined {
  return TIPOS_BRIGADAS.find(b => b.codigo.includes(tipo.toUpperCase()));
}

export function getRecursoPorTipo(tipo: string): TipoRecurso[] {
  return TIPOS_RECURSOS_EMERGENCIA.filter(r => r.tipo === tipo);
}

export function getSimulacroPorTipo(tipo: string): TipoSimulacro | undefined {
  return TIPOS_SIMULACROS.find(s => s.codigo.includes(tipo.toUpperCase()));
}

// Estados predefinidos
export const ESTADOS_PLAN = [
  { valor: "borrador", etiqueta: "Borrador", color: "gray" },
  { valor: "vigente", etiqueta: "Vigente", color: "green" },
  { valor: "en_revision", etiqueta: "En Revisión", color: "blue" },
  { valor: "obsoleto", etiqueta: "Obsoleto", color: "red" }
];

export const ESTADOS_RECURSO = [
  { valor: "operativo", etiqueta: "Operativo", color: "green" },
  { valor: "requiere_mantenimiento", etiqueta: "Requiere Mantenimiento", color: "yellow" },
  { valor: "vencido", etiqueta: "Vencido", color: "red" },
  { valor: "fuera_servicio", etiqueta: "Fuera de Servicio", color: "gray" }
];

export const ESTADOS_SIMULACRO = [
  { valor: "programado", etiqueta: "Programado", color: "blue" },
  { valor: "en_ejecucion", etiqueta: "En Ejecución", color: "yellow" },
  { valor: "completado", etiqueta: "Completado", color: "green" },
  { valor: "cancelado", etiqueta: "Cancelado", color: "red" }
];

// Roles de miembros de brigada
export const ROLES_BRIGADA = [
  { valor: "jefe_brigada", etiqueta: "Jefe de Brigada" },
  { valor: "subjefe_brigada", etiqueta: "Subjefe de Brigada" },
  { valor: "brigadista", etiqueta: "Brigadista" },
  { valor: "brigadista_apoyo", etiqueta: "Brigadista de Apoyo" }
];
