// Mapeo de peligros prioritarios por código CIIU según GTC-45
// Basado en Decreto 768/2022 y análisis de peligros por actividad económica

export interface PeligroPorCIIU {
  codigoCIIU: string;
  descripcionCIIU: string;
  nivelRiesgo: 'I' | 'II' | 'III' | 'IV' | 'V';
  sector: string;
  peligrosPrioritarios: string[]; // Códigos de peligros-gtc45-predefinidos.ts
  peligrosEspecificos: PeligroEspecificoSector[];
  normativaEspecifica: NormativaEspecifica[];
  eppRecomendado: string[];
  capacitacionesObligatorias: string[];
}

export interface PeligroEspecificoSector {
  codigo: string;
  clasificacion: 'biologico' | 'fisico' | 'quimico' | 'psicosocial' | 'biomecanico' | 'condiciones_seguridad' | 'fenomenos_naturales';
  peligro: string;
  descripcion: string;
  riesgoPotencial: string;
  efectosPosibles: string;
  medidasControl: string[];
}

export interface NormativaEspecifica {
  codigo: string;
  norma: string;
  descripcion: string;
  obligatorio: boolean;
}

// ==================== MAPEO CIIU → PELIGROS ====================

export const peligrosPorCIIU: PeligroPorCIIU[] = [
  // ==================== SERVICIOS PERSONALES ====================
  {
    codigoCIIU: '9602',
    descripcionCIIU: 'Peluquería y otros tratamientos de belleza',
    nivelRiesgo: 'III',
    sector: 'Servicios personales',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'QUI-004', 'BIO-001', 'BIO-002', 'BIO-003', 'BIO-MEC-001', 'BIO-MEC-002', 'FIS-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'PEL-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Tintes y colorantes capilares',
        descripcion: 'Exposición a peróxido de hidrógeno, amoníaco, PPD (parafenilendiamina) en tintes',
        riesgoPotencial: 'Dermatitis alérgica ocupacional, sensibilización',
        efectosPosibles: 'Dermatitis (58% casos), alergias cutáneas, asma ocupacional',
        medidasControl: ['Guantes de nitrilo', 'Ventilación adecuada', 'Uso de tintes sin amoníaco', 'Prueba de sensibilidad previa']
      },
      {
        codigo: 'PEL-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Productos de alisado con formol',
        descripcion: 'Exposición a formaldehído en tratamientos de keratina y alisado',
        riesgoPotencial: 'Irritación respiratoria, cáncer (cancerígeno grupo 1 IARC)',
        efectosPosibles: 'Irritación ojos/nariz, asma, cáncer nasofaríngeo',
        medidasControl: ['Mascarilla N95/FFP2', 'Extracción localizada', 'Productos alternativos sin formol', 'Límite de exposición']
      },
      {
        codigo: 'PEL-QUI-003',
        clasificacion: 'quimico',
        peligro: 'Esmaltes y removedores de uñas',
        descripcion: 'Exposición a acetona, tolueno, formaldehído en productos de manicure',
        riesgoPotencial: 'Irritación cutánea y respiratoria',
        efectosPosibles: 'Dermatitis, mareos, cefalea, daño hepático crónico',
        medidasControl: ['Ventilación cruzada', 'Guantes de nitrilo', 'Productos "3-free" o "5-free"', 'Pausas en área ventilada']
      },
      {
        codigo: 'PEL-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Infecciones por instrumentos cortopunzantes',
        descripcion: 'Riesgo de transmisión de VIH, hepatitis B/C por tijeras, navajas, cortaúñas',
        riesgoPotencial: 'Infecciones de transmisión sanguínea',
        efectosPosibles: 'Hepatitis, VIH, infecciones bacterianas',
        medidasControl: ['Esterilización de instrumentos', 'Uso único de cuchillas', 'Protocolo bioseguridad', 'Vacunación hepatitis B']
      },
      {
        codigo: 'PEL-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Equipos térmicos de alta temperatura',
        descripcion: 'Uso de planchas (180-230°C), secadores, rizadores',
        riesgoPotencial: 'Quemaduras por contacto',
        efectosPosibles: 'Quemaduras de primer y segundo grado en manos y cara',
        medidasControl: ['Guantes térmicos', 'Superficies aislantes', 'Mantenimiento preventivo', 'Capacitación en uso seguro']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2117-2010', norma: 'Resolución 2117/2010', descripcion: 'Requisitos para establecimientos de estética ornamental', obligatorio: true },
      { codigo: 'RES-5194-2010', norma: 'Resolución 5194/2010', descripcion: 'Manual de bioseguridad para actividades cosméticas', obligatorio: true },
      { codigo: 'RES-2263-2004', norma: 'Resolución 2263/2004', descripcion: 'Requisitos para centros de estética', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla N95/FFP2', 'Delantal impermeable', 'Gafas de protección', 'Calzado cerrado antideslizante'],
    capacitacionesObligatorias: ['Bioseguridad', 'Manejo seguro de químicos', 'Esterilización de instrumentos', 'Primeros auxilios']
  },

  // ==================== CONSTRUCCIÓN E INSTALACIONES ====================
  {
    codigoCIIU: '4321',
    descripcionCIIU: 'Instalaciones eléctricas',
    nivelRiesgo: 'IV',
    sector: 'Construcción',
    peligrosPrioritarios: ['SEG-004', 'SEG-001', 'SEG-005', 'FIS-004', 'BIO-MEC-002', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'ELEC-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Arco eléctrico',
        descripcion: 'Descarga de energía por cortocircuito o falla de aislamiento',
        riesgoPotencial: 'Quemaduras graves, ceguera, muerte',
        efectosPosibles: 'Quemaduras de 2do/3er grado, daño auditivo, trauma ocular',
        medidasControl: ['EPP resistente a arco (categoría 2 mínimo)', 'Distancias de seguridad', 'Verificación de ausencia de tensión', 'Puesta a tierra']
      },
      {
        codigo: 'ELEC-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Contacto eléctrico directo en alta tensión',
        descripcion: 'Contacto con conductores energizados >1000V',
        riesgoPotencial: 'Electrocución fatal',
        efectosPosibles: 'Fibrilación ventricular, quemaduras internas, muerte (80-100mA fatal)',
        medidasControl: ['Procedimiento LOTO', 'Verificador de ausencia de tensión', 'Guantes clase 2-4', 'Distancias RETIE']
      },
      {
        codigo: 'ELEC-003',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en postes y torres',
        descripcion: 'Ascenso a estructuras para instalación/mantenimiento de líneas',
        riesgoPotencial: 'Caídas de altura, contacto con líneas energizadas',
        efectosPosibles: 'Fracturas, traumatismos, electrocución, muerte',
        medidasControl: ['Arnés certificado', 'Línea de vida retráctil', 'Certificación trabajo en alturas', 'Escalera dieléctrica']
      },
      {
        codigo: 'ELEC-004',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en ambientes húmedos con electricidad',
        descripcion: 'Instalaciones eléctricas en zonas mojadas o con agua',
        riesgoPotencial: 'Electrocución por conducción aumentada',
        efectosPosibles: 'Descarga eléctrica severa incluso a bajo voltaje',
        medidasControl: ['Interruptores GFCI', 'Herramientas con doble aislamiento', 'Botas dieléctricas', 'Verificación de conexión a tierra']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-5018-2019', norma: 'Resolución 5018/2019', descripcion: 'Requisitos SST para sector eléctrico', obligatorio: true },
      { codigo: 'RETIE', norma: 'RETIE', descripcion: 'Reglamento Técnico de Instalaciones Eléctricas', obligatorio: true },
      { codigo: 'NTC-2050', norma: 'NTC 2050', descripcion: 'Código Eléctrico Colombiano', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos clase 2-4', 'Casco dieléctrico', 'Zapatos dieléctricos', 'Arnés de cuerpo entero', 'Gafas de seguridad', 'Ropa resistente a arco', 'Herramientas aisladas 1000V'],
    capacitacionesObligatorias: ['Riesgo eléctrico (Res. 5018/2019)', 'Trabajo seguro en alturas', 'LOTO (Bloqueo y etiquetado)', 'Primeros auxilios - RCP', 'RETIE básico']
  },

  {
    codigoCIIU: '4111',
    descripcionCIIU: 'Construcción de edificios residenciales',
    nivelRiesgo: 'V',
    sector: 'Construcción',
    peligrosPrioritarios: ['SEG-001', 'SEG-002', 'SEG-005', 'SEG-006', 'QUI-002', 'FIS-001', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'CONS-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caída de objetos',
        descripcion: 'Caída de herramientas, materiales o escombros desde altura',
        riesgoPotencial: 'Traumatismo craneoencefálico, fracturas',
        efectosPosibles: 'Contusiones, fracturas, muerte',
        medidasControl: ['Casco de seguridad', 'Mallas de protección', 'Zonas de exclusión', 'Bolsas de herramientas', 'Redes de contención']
      },
      {
        codigo: 'CONS-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Colapso de excavaciones',
        descripcion: 'Derrumbe de paredes en excavaciones y zanjas',
        riesgoPotencial: 'Sepultamiento, asfixia',
        efectosPosibles: 'Asfixia, fracturas múltiples, muerte',
        medidasControl: ['Entibado', 'Taludes según tipo de suelo', 'Acceso seguro', 'Monitoreo de paredes', 'Bombeo de agua']
      },
      {
        codigo: 'CONS-003',
        clasificacion: 'quimico',
        peligro: 'Exposición a polvo de cemento y sílice',
        descripcion: 'Inhalación de partículas durante mezcla, corte y demolición',
        riesgoPotencial: 'Silicosis, enfermedades pulmonares',
        efectosPosibles: 'Silicosis, EPOC, cáncer pulmonar',
        medidasControl: ['Respirador N95/P100', 'Humidificación de materiales', 'Extracción localizada', 'Espirometrías periódicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Trabajo en espacios confinados', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Arnés de cuerpo entero', 'Botas con puntera de acero', 'Guantes de cuero', 'Gafas de seguridad', 'Respirador N95', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas', 'Izaje de cargas', 'Excavaciones seguras', 'Primeros auxilios', 'Señalización y demarcación']
  },

  // ==================== SALUD ====================
  {
    codigoCIIU: '8610',
    descripcionCIIU: 'Actividades de hospitales y clínicas con internación',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-005', 'QUI-008', 'QUI-009', 'QUI-010', 'PSI-001', 'PSI-006', 'BIO-MEC-008', 'FIS-007', 'SEG-017'],
    peligrosEspecificos: [
      {
        codigo: 'HOSP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Accidente por cortopunzante contaminado (pinchazo de aguja/bisturí)',
        descripcion: 'Pinchazos con agujas hipodérmicas, bisturís u objetos cortopunzantes contaminados con sangre o fluidos de pacientes',
        riesgoPotencial: 'Infección por VIH, Hepatitis B y C',
        efectosPosibles: 'VIH/SIDA, hepatitis B crónica, hepatitis C, bacteriemia',
        medidasControl: ['Agujas con mecanismo de seguridad retráctil', 'Nunca reencapuchar agujas con dos manos', 'Contenedores rígidos resistentes a perforación en punto de uso', 'Doble guante en procedimientos invasivos', 'Protocolo post-exposición con PEP en <2h', 'Vacunación obligatoria VHB']
      },
      {
        codigo: 'HOSP-BIO-002',
        clasificacion: 'biologico',
        peligro: 'Exposición a patógenos de transmisión aérea (TBC, COVID, sarampión)',
        descripcion: 'Atención de pacientes con enfermedades de transmisión respiratoria en salas de hospitalización, urgencias y UCI',
        riesgoPotencial: 'Infección respiratoria grave de origen ocupacional',
        efectosPosibles: 'Tuberculosis laboral, COVID-19 severo, otras infecciones respiratorias',
        medidasControl: ['Mascarilla N95 o superior para precauciones de aerosoles', 'Habitaciones de aislamiento con presión negativa', 'Prueba tuberculínica (PPD) anual', 'Vacunación influenza anual', 'Protocolo de aislamiento respiratorio']
      },
      {
        codigo: 'HOSP-BIO-003',
        clasificacion: 'biologico',
        peligro: 'Manejo de residuos hospitalarios peligrosos (RESPEL)',
        descripcion: 'Clasificación, transporte interno y almacenamiento de residuos anatomopatológicos, infecciosos, cortopunzantes y químicos peligrosos — regido por Decreto 351/2014',
        riesgoPotencial: 'Infección, intoxicación química o accidente biológico en personal de aseo',
        efectosPosibles: 'Infecciones por contacto con residuos, cortaduras con material contaminado, exposición química',
        medidasControl: ['Código de colores ICONTEC: rojo (infeccioso), negro (ordinario), verde (orgánico)', 'EPP completo para personal de servicios generales hospitalarios', 'Ruta sanitaria documentada y horarios definidos', 'Cuarto de almacenamiento con ventilación y temperatura controlada', 'Gestor ambiental autorizado por ANLA', 'Capacitación semestral en gestión de RESPEL hospitalarios']
      },
      {
        codigo: 'HOSP-BIO-004',
        clasificacion: 'biologico',
        peligro: 'Infecciones Asociadas a la Atención en Salud (IAAS) — microorganismos multirresistentes',
        descripcion: 'Riesgo de adquirir SARM, BLEE, Klebsiella NDM, Clostridium difficile y otros microorganismos multirresistentes durante la prestación de servicios hospitalarios',
        riesgoPotencial: 'Infección nosocomial por bacteria resistente',
        efectosPosibles: 'Bacteriemia, neumonía nosocomial, infección de herida quirúrgica, sepsis grave',
        medidasControl: ['Programa de higiene de manos OMS (5 momentos)', 'Precauciones de contacto con bata y guantes para casos MDR', 'Vigilancia activa de microorganismos multirresistentes', 'Uso racional de antibióticos (comité de infectología)', 'Limpieza y desinfección terminal de habitaciones en casos MDR']
      },
      {
        codigo: 'HOSP-BIO-005',
        clasificacion: 'biologico',
        peligro: 'Alergia al látex en personal de salud',
        descripcion: 'Sensibilización al látex natural en personal hospitalario con exposición crónica a guantes y equipos de látex (hasta 12-17% de enfermeras sensibilizadas)',
        riesgoPotencial: 'Reacción alérgica sistémica al látex incluyendo anafilaxia',
        efectosPosibles: 'Dermatitis de contacto, urticaria, rinitis, asma, anafilaxia grave',
        medidasControl: ['Sustitución de guantes de látex por nitrilo o neopreno en toda la institución', 'Tamizaje de alergia al látex en examen de ingreso', 'Señalización de zonas libres de látex', 'Disponibilidad de adrenalina autoinyectable (EpiPen) en servicio', 'Vigilancia dermatológica anual para personal expuesto']
      },
      {
        codigo: 'HOSP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Gases anestésicos residuales en quirófano y sala de recuperación',
        descripcion: 'Inhalación crónica de trazas de halogenados (sevoflurano, isoflurano, desflurano) y óxido nitroso en quirófanos y áreas de recuperación',
        riesgoPotencial: 'Hepatotoxicidad, nefrotoxicidad, teratogénesis, aborto espontáneo',
        efectosPosibles: 'Aborto espontáneo, malformaciones fetales, daño hepático crónico, deterioro cognitivo',
        medidasControl: ['Sistema de evacuación de gases anestésicos residuales (SEGAR) obligatorio', 'Mantenimiento preventivo de equipos de anestesia sin fugas', 'Monitoreo ambiental de N₂O y halogenados dos veces al año', 'Ventilación con mínimo 20 recambios de aire/hora en quirófano', 'Restricción en mujeres embarazadas en servicios de anestesia', 'Rotación de personal expuesto']
      },
      {
        codigo: 'HOSP-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Preparación y administración de agentes citostáticos (quimioterapia)',
        descripcion: 'Exposición a medicamentos oncológicos (ciclofosfamida, metotrexato, doxorrubicina, vincristina, cisplatino) en farmacia oncológica, salas de quimioterapia y hospitalización oncológica',
        riesgoPotencial: 'Carcinogénesis, mutagenicidad, teratogénesis',
        efectosPosibles: 'Leucemia secundaria, linfoma, aborto espontáneo, malformaciones fetales en hijos de trabajadores expuestos',
        medidasControl: ['Cabina de flujo laminar vertical Clase II B2 para preparación en farmacia', 'Guantes de quimioterapia dobles certificados ASTM D6978', 'Bata de polipropileno de manga larga no reutilizable', 'Descarte como residuo RESPEL especial (bolsa amarilla)', 'Capacitación certificada en manejo de citostáticos', 'Biomonitoreo urinario periódico al personal de oncología']
      },
      {
        codigo: 'HOSP-QUI-003',
        clasificacion: 'quimico',
        peligro: 'Formaldehído en patología y glutaraldehído en endoscopía',
        descripcion: 'Exposición a formaldehído en servicios de anatomía patológica (fijación de tejidos) y a glutaraldehído en esterilización de endoscopios en gastroenterología y neumología',
        riesgoPotencial: 'Cáncer nasofaríngeo (formaldehído IARC Grupo 1), sensibilización severa',
        efectosPosibles: 'Cáncer nasofaríngeo, dermatitis de contacto profesional, asma ocupacional por glutaraldehído, conjuntivitis crónica',
        medidasControl: ['Cabina con extracción local forzada en anatomía patológica', 'Guantes de nitrilo gruesos o neopreno (cambio cada 2 horas)', 'Gafas o careta facial splash', 'Monitoreo ambiental (TLV-TWA ACGIH: 0.3 ppm para formaldehído)', 'Sustitución por fixativos alternativos cuando sea posible (zinc formalin, NBF neutral)']
      },
      {
        codigo: 'HOSP-QUI-004',
        clasificacion: 'quimico',
        peligro: 'Desinfectantes de alto nivel hospitalarios',
        descripcion: 'Uso intensivo de hipoclorito de sodio, ácido peracético, amonio cuaternario, OPA (ortoftaldehído) y clorhexidina en limpieza y desinfección hospitalaria',
        riesgoPotencial: 'Asma ocupacional, sensibilización respiratoria y dermatológica',
        efectosPosibles: 'Asma ocupacional por desinfectantes, dermatitis de contacto, irritación de mucosas nasales y oculares crónica',
        medidasControl: ['Guantes de nitrilo para manipulación de todos los desinfectantes', 'Diluciones correctas según ficha de seguridad vigente', 'Ventilación forzada durante aplicación', 'No mezclar hipoclorito con amonio cuaternario ni con ácidos (cloraminas tóxicas)', 'Capacitación en uso seguro y almacenamiento de desinfectantes']
      },
      {
        codigo: 'HOSP-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes (Rx, TAC, fluoroscopía, arco en C, medicina nuclear)',
        descripcion: 'Exposición ocupacional crónica a radiaciones ionizantes en radiología convencional, tomografía, fluoroscopía intraoperatoria (arco en C quirúrgico) y medicina nuclear',
        riesgoPotencial: 'Cáncer, daño genético, cataratas por radiación',
        efectosPosibles: 'Leucemia, cáncer de tiroides, cataratas por radiación ionizante, aborto o daño fetal',
        medidasControl: ['Dosímetro personal TLD u OSL obligatorio con lectura mensual', 'Delantal plomado ≥0.5 mm Pb, protector tiroideo y gafas plomadas en fluoroscopía', 'Principios ALARA: distancia máxima, tiempo mínimo, blindaje óptimo', 'Límite de dosis 50 mSv/año trabajadores (5 mSv para mujeres que puedan estar en gestación)', 'Restricción absoluta mujeres embarazadas en áreas con radiación directa', 'Historial dosimétrico individual actualizado']
      },
      {
        codigo: 'HOSP-FIS-002',
        clasificacion: 'fisico',
        peligro: 'Frío y corrientes de aire en quirófano (temperatura 16-20°C)',
        descripcion: 'Exposición a temperatura baja sostenida y corrientes de aire de sistemas de climatización en quirófanos donde el personal permanece en bipedestación por horas',
        riesgoPotencial: 'Estrés térmico por frío, trastornos vasculares, disconfort térmico',
        efectosPosibles: 'Fenómeno de Raynaud, lumbalgias agravadas por frío y postura, varices, mayor fatiga muscular',
        medidasControl: ['Ropa térmica interior bajo uniforme quirúrgico', 'Calzado con suela aislante', 'Tapetes antifatiga en puestos fijos de quirófano', 'Rotación de personal en cirugías que superen 4 horas', 'Pausas de calentamiento en cirugías muy largas']
      },
      {
        codigo: 'HOSP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización manual de pacientes (patient handling) — principal lesión en enfermería',
        descripcion: 'Transferencia, giro, levantamiento y posicionamiento de pacientes en cama, camilla, silla de ruedas y ducha — causa número uno de incapacidades laborales en personal de enfermería',
        riesgoPotencial: 'Lesión grave de columna lumbar y hombros',
        efectosPosibles: 'Hernia discal lumbar L4-L5, L5-S1; desgarro de manguito rotador; esguince lumbar; incapacidades permanentes y parciales',
        medidasControl: ['Grúas de transferencia de techo o móviles para pacientes dependientes', 'Tablas y cojines de deslizamiento para transferencias cama-camilla', 'Cinturones de marcha y levantamiento', 'Evaluación de riesgo ergonómico mediante método MAPO institucional', 'Mínimo 2 personas para movilización de pacientes dependientes', 'Capacitación semestral certificada en ergonomía hospitalaria y movilización de pacientes']
      },
      {
        codigo: 'HOSP-BIO-MEC-002',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de pie prolongado en quirófano y urgencias',
        descripcion: 'Bipedestación continua de 4 a 16 horas en cirugías largas, guardias de urgencias y procedimientos hospitalarios de larga duración',
        riesgoPotencial: 'Insuficiencia venosa crónica, lumbalgias, fascitis plantar',
        efectosPosibles: 'Varices de miembros inferiores, edema, lumbalgias, fascitis plantar, fatiga muscular severa, síndrome de piernas inquietas',
        medidasControl: ['Tapetes antifatiga en puestos de trabajo fijos en quirófano y urgencias', 'Medias de compresión graduada (clase II) para personal de quirófano', 'Calzado de seguridad con soporte plantar y absorción de impacto', 'Rotación de personal entre servicios en guardias largas', 'Pausas cortas de 5-10 minutos cuando el procedimiento lo permita']
      },
      {
        codigo: 'HOSP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Burnout, trauma vicario y fatiga por compasión en personal de salud',
        descripcion: 'Exposición continua a sufrimiento, muerte, situaciones críticas y decisiones de alto impacto clínico — principal causa de burnout profesional en médicos y enfermeras en Colombia',
        riesgoPotencial: 'Síndrome de burnout, fatiga compasión, TEPT secundario, errores clínicos',
        efectosPosibles: 'Depresión, ansiedad, insomnio, consumo de sustancias, despersonalización, abandono profesional, aumento de errores clínicos',
        medidasControl: ['Grupos de apoyo entre pares (peer support programs)', 'Psicólogo organizacional disponible para personal de salud', 'Rotación de servicios de alta carga emocional (oncología, UCI neonatal, urgencias)', 'Capacitación en duelo, autocuidado emocional y técnicas de resiliencia', 'Reconocimiento institucional del impacto emocional del trabajo asistencial', 'Batería de riesgo psicosocial MINTRA anual']
      },
      {
        codigo: 'HOSP-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Violencia de usuarios y familiares hacia personal de salud',
        descripcion: 'Agresiones verbales, amenazas y ataques físicos de pacientes en crisis, familiares alterados o personas bajo efectos de sustancias psicoactivas — especialmente en urgencias y psiquiatría',
        riesgoPotencial: 'Trauma físico y psicológico, TEPT laboral',
        efectosPosibles: 'Lesiones físicas, síndrome de estrés postraumático laboral, ausentismo, abandono del cargo',
        medidasControl: ['Protocolo institucional de atención a pacientes y familiares agresivos', 'Capacitación en manejo de crisis y desescalada verbal', 'Sistemas de alarma silenciosa en salas de urgencias y psiquiatría', 'Doble personal en zonas de alto riesgo de violencia', 'Atención psicológica post-incidente garantizada dentro de 48h', 'Reporte y registro estadístico de incidentes de violencia']
      },
      {
        codigo: 'HOSP-PSI-003',
        clasificacion: 'psicosocial',
        peligro: 'Trabajo nocturno, guardias de 24h y turnos rotativos',
        descripcion: 'Guardias de 12 a 24 horas con rotación día/noche que altera irreversiblemente el ritmo circadiano del personal hospitalario',
        riesgoPotencial: 'Trastornos del sueño, síndrome metabólico, mayor riesgo de accidentes y errores clínicos',
        efectosPosibles: 'Insomnio crónico, fatiga, diabetes tipo 2, hipertensión, enfermedad coronaria, depresión, mayor riesgo de error clínico nocturno',
        medidasControl: ['Rotación de turnos preferiblemente en sentido horario (mañana → tarde → noche)', 'Máximo 2-3 noches consecutivas seguidas de días libres compensatorios', 'Descanso mínimo de 12 horas entre turnos', 'Evaluación médica periódica con énfasis cardiovascular, metabólico y del sueño', 'Batería de riesgo psicosocial MINTRA anual con énfasis en jornada']
      },
      {
        codigo: 'HOSP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Electrocirugía y riesgo eléctrico de equipos biomédicos',
        descripcion: 'Uso de bisturí eléctrico (ESU), desfibriladores, equipos de electrocirugía y numerosos dispositivos médicos eléctricos que generan riesgo de quemadura eléctrica e incendio quirúrgico',
        riesgoPotencial: 'Quemaduras eléctricas del paciente/personal, incendio en campo quirúrgico',
        efectosPosibles: 'Quemaduras en sitio de placa de retorno, incendio quirúrgico (O₂ + drapeados + chispa ESU), interferencia con marcapasos y desfibriladores implantados',
        medidasControl: ['Verificación de placa de retorno activa y correctamente posicionada antes de cada cirugía', 'No activar electrocirugía en presencia de O₂ suplementario o gases anestésicos inflamables', 'Mantenimiento preventivo anual certificado de todas las unidades ESU', 'Programa de gestión de tecnología biomédica (GTB) con inventario activo', 'Capacitación específica en uso seguro de equipos eléctricos médicos y prevención de incendio quirúrgico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud - condiciones de habilitación', obligatorio: true },
      { codigo: 'DEC-351-2014', norma: 'Decreto 351/2014', descripcion: 'Gestión integral de residuos hospitalarios y similares (PGIRHS)', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Manual de Buenas Prácticas en Radiología e Imágenes Diagnósticas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'Decreto Único Reglamentario del Sector Trabajo - SG-SST', obligatorio: true },
      { codigo: 'RES-0256-2016', norma: 'Resolución 0256/2016', descripcion: 'Sistema Único de Habilitación - indicadores de calidad en salud', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Prevención y manejo de residuos peligrosos', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo (preferir sobre látex)', 'Mascarilla N95 / FFP2', 'Bata impermeable manga larga desechable', 'Gafas de protección splash', 'Careta facial completa en procedimientos de alto riesgo', 'Gorro quirúrgico', 'Calzado de seguridad cerrado antideslizante con puntera reforzada', 'Delantal plomado 0.5mm Pb (personal en radiología/fluoroscopía)', 'Dosímetro personal TLD (personal en radiología/medicina nuclear)', 'Medias de compresión graduada clase II'],
    capacitacionesObligatorias: ['Bioseguridad hospitalaria y precauciones estándar OMS', 'Gestión integral de residuos hospitalarios RESPEL (Decreto 351/2014)', 'Protocolo post-exposición a accidente biológico (ABO)', 'Ergonomía hospitalaria y movilización segura de pacientes (MAPO)', 'Manejo seguro de citostáticos', 'Riesgo psicosocial y autocuidado emocional en salud (Res. 2646)', 'RCP avanzado y primeros auxilios', 'Radioprotección y dosimetría (personal con exposición a radiación)', 'Manejo de desinfectantes y productos químicos hospitalarios']
  },

  {
    codigoCIIU: '8622',
    descripcionCIIU: 'Actividades de la práctica odontológica',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-005', 'QUI-003', 'FIS-001', 'FIS-007', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'ODONT-001',
        clasificacion: 'biologico',
        peligro: 'Aerosoles biológicos generados por turbina dental y ultrasonido',
        descripcion: 'Generación de bioaerosoles contaminados con sangre y saliva del paciente durante procedimientos de alta velocidad (turbina, ultrasonido, profilaxis)',
        riesgoPotencial: 'Infección respiratoria y sistémica de transmisión aérea',
        efectosPosibles: 'COVID-19, tuberculosis, hepatitis B aerolizada, herpes, SARS — odontología es una de las profesiones de mayor riesgo de aerosoles biológicos',
        medidasControl: ['Mascarilla N95 o FFP2 como mínimo para todos los procedimientos generadores de aerosoles', 'Careta facial protección total', 'Succión de alta potencia (HVE) durante turbina y ultrasonido', 'Enjuague antiséptico preoperatorio con clorhexidina 0.12% o H₂O₂ 1.5%', 'Ventilación con extracción de aire del consultorio (6-12 cambios/hora)', 'Descanso entre pacientes para sedimentación de aerosoles']
      },
      {
        codigo: 'ODONT-002',
        clasificacion: 'biologico',
        peligro: 'Accidente con cortopunzante odontológico contaminado',
        descripcion: 'Pinchazos con agujas de carpule, limas endodónticas, instrumentos cortantes o bisturís contaminados con sangre de pacientes',
        riesgoPotencial: 'Infección por VIH, Hepatitis B y C',
        efectosPosibles: 'Hepatitis B (riesgo ~30% por pinchazo sin vacuna), Hepatitis C (~3%), VIH (~0.3%)',
        medidasControl: ['Técnica de reencapuchado con una sola mano o sistema de aguja de seguridad', 'Contenedores de cortopunzantes en punto de uso', 'Doble guante en pacientes con factores de riesgo conocidos', 'Protocolo post-exposición < 2 horas con lavado exhaustivo y reporte', 'Vacunación obligatoria VHB completa antes de práctica clínica']
      },
      {
        codigo: 'ODONT-003',
        clasificacion: 'quimico',
        peligro: 'Mercurio dental (amalgamas) — preparación, colocación y remoción',
        descripcion: 'Exposición a vapores de mercurio elemental durante mezcla, colocación y especialmente remoción de amalgamas dentales',
        riesgoPotencial: 'Intoxicación crónica por mercurio con daño neurológico y renal',
        efectosPosibles: 'Daño neurológico (temblores, insomnio, irritabilidad), nefrotoxicidad, efectos reproductivos en mujeres embarazadas',
        medidasControl: ['Ventilación local con extracción en punto de uso', 'Separador de amalgama en unidades odontológicas', 'EPP completo durante remoción (mascarilla N95, gafas, guantes gruesos)', 'Uso de alternativas sin mercurio (resinas compuestas, ionómero)', 'Mercurimetría urinaria periódica al personal que realiza remoción de amalgamas', 'Almacenamiento de residuos de amalgama en frascos con agua (no secos)']
      },
      {
        codigo: 'ODONT-004',
        clasificacion: 'quimico',
        peligro: 'Materiales dentales irritantes y sensibilizantes (metacrilatos, eugenol)',
        descripcion: 'Exposición a monómeros de metacrilato (acrílicos, composite), eugenol, blanqueadores (H₂O₂ alta concentración) y adhesivos dentales',
        riesgoPotencial: 'Dermatitis de contacto alérgica, asma ocupacional por metacrilatos',
        efectosPosibles: 'Dermatitis profesional de manos, asma ocupacional (metacrilato es sensibilizador reconocido), conjuntivitis',
        medidasControl: ['Guantes de nitrilo (NO látex) para todos los procedimientos', 'Gafas de protección al manipular ácidos grabadores y blanqueadores', 'Ventilación adecuada al fotopolimerizar y trabajar con acrílicos', 'Fichas de seguridad actualizadas para todos los materiales', 'Seguimiento dermatológico anual del personal clínico']
      },
      {
        codigo: 'ODONT-005',
        clasificacion: 'fisico',
        peligro: 'Ruido de alta frecuencia por turbinas y micromotores dentales',
        descripcion: 'Exposición crónica a ruido de alta frecuencia generado por turbinas de alta velocidad (300.000-500.000 rpm), micromotores, ultrasonido y compresores de aire',
        riesgoPotencial: 'Pérdida auditiva inducida por ruido (PAIR) ocupacional',
        efectosPosibles: 'Hipoacusia neurosensorial a 4.000 Hz, tinnitus, hiperacusia, estrés',
        medidasControl: ['Audiometría de ingreso y anual para todo el personal de odontología', 'Mantenimiento preventivo de turbinas y micromotores para reducir vibración', 'Uso de turbinas con certificación de nivel de ruido reducido', 'Protección auditiva en procedimientos largos o con múltiples pacientes seguidos', 'Pausas entre pacientes que permitan recuperación auditiva']
      },
      {
        codigo: 'ODONT-006',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes en radiología odontológica periapical y panorámica',
        descripcion: 'Exposición a rayos X en toma de radiografías periapicales, bitewing, panorámicas y CBCT odontológico',
        riesgoPotencial: 'Daño por radiación ionizante acumulativa',
        efectosPosibles: 'Cataratas por radiación, cáncer de cabeza y cuello, daño fetal en embarazadas',
        medidasControl: ['Posicionarse a mínimo 1.5 metros del cabezal o detrás de barrera plomada', 'Delantal plomado y protector tiroideo para el operador', 'Dosímetro personal TLD', 'Técnica de radiografía digital para reducir dosis vs. película convencional', 'Colimadores rectangulares para reducir campo de radiación']
      },
      {
        codigo: 'ODONT-007',
        clasificacion: 'biomecanico',
        peligro: 'Posturas forzadas y estáticas en práctica odontológica',
        descripcion: 'Mantenimiento de posturas asimétricas con flexión y rotación de cuello, tronco y hombros durante procedimientos odontológicos que pueden durar horas',
        riesgoPotencial: 'Trastornos musculoesqueléticos cervicales y de extremidad superior',
        efectosPosibles: 'Cervicalgia, síndrome de hombro doloroso, síndrome del túnel carpiano, lumbalgias — 70-80% de odontólogos reportan TME',
        medidasControl: ['Unidad dental con sillón de altura regulable y reposacabezas ajustable', 'Trabajo en posición sentado con lupa magnificadora para reducir flexión cervical', 'Pausas activas con estiramientos cervicales, de hombros y manos cada 45 minutos', 'Iluminación en eje óptico para reducir postura de cuello', 'Evaluación ergonómica del puesto de trabajo anual', 'Capacitación en higiene postural en odontología']
      },
      {
        codigo: 'ODONT-008',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por alta exigencia técnica y pacientes ansiosos o fóbicos',
        descripcion: 'Alta demanda cognitiva, precisión extrema, trabajo en campo visual reducido con pacientes que presentan ansiedad dental (dentofobia), lo que aumenta el estrés del profesional',
        riesgoPotencial: 'Burnout profesional, errores clínicos por fatiga mental',
        efectosPosibles: 'Burnout, errores técnicos, cefaleas tensionales, deterioro de relaciones laborales',
        medidasControl: ['Manejo del paciente ansioso con técnicas de comunicación y sedación consciente cuando aplique', 'Límite razonable de pacientes por jornada', 'Pausas entre consultas complejas', 'Apoyo psicológico para el odontólogo', 'Gestión del tiempo en agenda']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud incluyendo odontología', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Manual de bioseguridad en odontología', obligatorio: true },
      { codigo: 'DEC-351-2014', norma: 'Decreto 351/2014', descripcion: 'Gestión de residuos hospitalarios y amalgamas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo (NO látex)', 'Mascarilla N95 / FFP2 para procedimientos con aerosoles', 'Mascarilla quirúrgica para consultas sin aerosoles', 'Careta facial integral', 'Gafas de protección', 'Bata manga larga con puños ajustados', 'Gorro', 'Protección auditiva en sesiones largas', 'Delantal plomado y protector tiroideo (radiología)', 'Dosímetro personal TLD'],
    capacitacionesObligatorias: ['Bioseguridad odontológica y precauciones de aerosoles', 'Protocolo post-exposición a accidente biológico', 'Manejo seguro de amalgamas y residuos odontológicos', 'Ergonomía y postura en odontología', 'Radiología odontológica y radioprotección', 'Manejo del paciente ansioso']
  },

  {
    codigoCIIU: '8623',
    descripcionCIIU: 'Actividades de otros profesionales de la salud humana (enfermería, nutrición, psicología, optometría, instrumentación quirúrgica)',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-005', 'BIO-009', 'PSI-001', 'PSI-006', 'BIO-MEC-006', 'BIO-MEC-008', 'QUI-015'],
    peligrosEspecificos: [
      {
        codigo: 'PROF-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a fluidos corporales y patógenos en atención de enfermería',
        descripcion: 'Contacto con sangre, orina, heces, vómito, secreciones y heridas en actividades de enfermería hospitalaria o domiciliaria',
        riesgoPotencial: 'Infección por agentes biológicos de transmisión sanguínea, fecal-oral y respiratoria',
        efectosPosibles: 'Hepatitis B/C, VIH, norovirus, Clostridium difficile, tuberculosis, infecciones diversas',
        medidasControl: ['Precauciones estándar para todo paciente siempre', 'Guantes para contacto con fluidos corporales, membranas y piel no intacta', 'Mascarilla quirúrgica o N95 según nivel de transmisión', 'Lavado de manos 5 momentos OMS', 'Vacunación completa (Hepatitis B, influenza, tétanos, varicela)']
      },
      {
        codigo: 'PROF-BIO-002',
        clasificacion: 'biologico',
        peligro: 'Accidente con cortopunzante en enfermería (venopunción, sondas, cateterismo)',
        descripcion: 'Riesgo de pinchazo con agujas durante venopunción, instalación de catéteres, inyecciones, sutura de heridas y manejo de instrumental médico-quirúrgico en sala o domicilio',
        riesgoPotencial: 'Infección por VIH, Hepatitis B y C',
        efectosPosibles: 'Hepatitis B (alto riesgo sin vacuna), Hepatitis C, VIH, bacteriemia',
        medidasControl: ['Agujas de seguridad con mecanismo de protección activo o pasivo', 'Nunca reencapuchar agujas con dos manos', 'Contenedor rígido de cortopunzantes en punto de cuidado', 'Protocolo post-exposición conocido y practicado', 'Vacunación VHB obligatoria y títulos de anticuerpos confirmados']
      },
      {
        codigo: 'PROF-BIO-003',
        clasificacion: 'biologico',
        peligro: 'Alergia al látex en profesionales de salud con exposición frecuente',
        descripcion: 'Sensibilización por exposición crónica al látex en enfermeras, instrumentadoras y otros profesionales que usan guantes de látex decenas de veces al día',
        riesgoPotencial: 'Reacción alérgica sistémica al látex (anafilaxia)',
        efectosPosibles: 'Dermatitis de contacto, urticaria, rinitis, asma, anafilaxia grave potencialmente fatal',
        medidasControl: ['Política institucional de sustitución de guantes de látex por nitrilo', 'Tamizaje de alergia al látex en examen de ingreso (cuestionario + IgE)', 'Señalización de zonas libres de látex', 'Disponibilidad de adrenalina autoinyectable en unidad', 'Seguimiento dermatológico y alergológico anual']
      },
      {
        codigo: 'PROF-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de pacientes como tarea cotidiana de enfermería',
        descripcion: 'Turnos completos de enfermería con múltiples movilizaciones, giros, levantamientos y transferencias de pacientes hospitalizados con dependencia parcial o total',
        riesgoPotencial: 'Lesión musculoesquelética de columna y miembros superiores — mayor causa de incapacidad en enfermería en Colombia',
        efectosPosibles: 'Hernia discal lumbar, desgarro de manguito rotador, esguince lumbar agudo y crónico',
        medidasControl: ['Grúas de transferencia disponibles en cada unidad hospitalaria', 'Protocolos de movilización segura con mínimo 2 personas para pacientes dependientes', 'Evaluación ergonómica mediante metodología MAPO por unidad', 'Formación continua en ergonomía hospitalaria', 'Supervisión del cumplimiento de las normas de movilización segura']
      },
      {
        codigo: 'PROF-BIO-MEC-002',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de pie prolongado en turnos de enfermería (12-24 horas)',
        descripcion: 'Bipedestación sostenida durante turnos de 8, 12 o 24 horas en salas de hospitalización, urgencias, UCI y quirófano',
        riesgoPotencial: 'Insuficiencia venosa, varices, fascitis plantar, lumbalgias',
        efectosPosibles: 'Varices de miembros inferiores, edema, trombosis venosa superficial, lumbalgias, fascitis plantar',
        medidasControl: ['Medias de compresión graduada clase II obligatorias en turnos largos', 'Calzado profesional con soporte plantar y amortiguación', 'Tapetes antifatiga en estaciones de enfermería', 'Rotación de actividades con trabajo administrativo sentado', 'Pausa obligatoria con elevación de piernas en guardias largas']
      },
      {
        codigo: 'PROF-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Burnout, carga emocional y fatiga por compasión en enfermería y trabajo social',
        descripcion: 'Acompañamiento continuo de sufrimiento, muerte, dolor y situaciones traumáticas en profesionales de salud que tienen contacto intensivo y prolongado con pacientes',
        riesgoPotencial: 'Síndrome de burnout y fatiga por compasión',
        efectosPosibles: 'Depresión, ansiedad, insomnio, despersonalización, abandono profesional, consumo de sustancias',
        medidasControl: ['Grupos de apoyo entre pares (peer support)', 'Psicólogo institucional disponible para el personal', 'Rotación de servicios de alta carga emocional', 'Capacitación en duelo y autocuidado emocional en salud', 'Reconocimiento del impacto emocional del cuidado de pacientes']
      },
      {
        codigo: 'PROF-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Violencia de pacientes y familiares hacia enfermería',
        descripcion: 'Agresiones verbales y físicas recibidas por personal de enfermería — estadísticamente el grupo de salud más agredido físicamente en hospitales colombianos',
        riesgoPotencial: 'Trauma físico y psicológico, TEPT laboral',
        efectosPosibles: 'Lesiones físicas, síndrome de estrés postraumático, ausentismo, abandono del cargo',
        medidasControl: ['Protocolo institucional de atención a pacientes y familiares agresivos', 'Capacitación en desescalada verbal y manejo de crisis', 'Doble personal en zonas de alta conflictividad', 'Sistemas de alarma rápida', 'Atención psicológica post-incidente dentro de 48 horas', 'Registro estadístico de incidentes de violencia laboral en salud']
      },
      {
        codigo: 'PROF-PSI-003',
        clasificacion: 'psicosocial',
        peligro: 'Trabajo nocturno y turnos rotativos en enfermería',
        descripcion: 'Rotación obligatoria día-noche en turnos de enfermería que altera permanentemente el ritmo circadiano del personal',
        riesgoPotencial: 'Trastornos del sueño, síndrome metabólico, aumento de riesgo de errores de medicación',
        efectosPosibles: 'Insomnio crónico, fatiga, mayor riesgo de error de medicación en noches, diabetes tipo 2, depresión',
        medidasControl: ['Rotación horaria en sentido favorable (mañana-tarde-noche)', 'No más de 2-3 noches consecutivas', 'Descanso compensatorio real post-turno nocturno', 'Evaluación médica periódica con énfasis cardiovascular y metabólico', 'Batería de riesgo psicosocial MINTRA anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'DEC-351-2014', norma: 'Decreto 351/2014', descripcion: 'Gestión de residuos hospitalarios', obligatorio: true },
      { codigo: 'LEY-266-1996', norma: 'Ley 266/1996', descripcion: 'Reglamentación de la profesión de enfermería en Colombia', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo (no látex)', 'Mascarilla quirúrgica o N95 según nivel de precaución', 'Bata impermeable para procedimientos con fluidos', 'Gafas de protección splash', 'Gorro quirúrgico en procedimientos estériles', 'Calzado profesional cerrado antideslizante con soporte plantar', 'Medias de compresión graduada clase II en turnos de pie', 'Dosímetro TLD si trabaja en radiología o procedimientos con fluoroscopía'],
    capacitacionesObligatorias: ['Bioseguridad hospitalaria y precauciones estándar OMS', 'Protocolo post-exposición a accidente biológico', 'Ergonomía hospitalaria y movilización segura de pacientes (MAPO)', 'Riesgo psicosocial y autocuidado emocional en salud (Res. 2646)', 'RCP avanzado y manejo de emergencias', 'Manejo de residuos hospitalarios RESPEL', 'Prevención de errores de medicación', 'Manejo del paciente agresivo y desescalada verbal']
  },

  // ==================== MANUFACTURA ====================
  {
    codigoCIIU: '1410',
    descripcionCIIU: 'Confección de prendas de vestir',
    nivelRiesgo: 'III',
    sector: 'Manufactura',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'FIS-001', 'FIS-002', 'SEG-005', 'PSI-003'],
    peligrosEspecificos: [
      {
        codigo: 'CONF-001',
        clasificacion: 'biomecanico',
        peligro: 'Movimientos repetitivos en costura',
        descripcion: 'Operación continua de máquinas de coser con movimientos de manos y pies',
        riesgoPotencial: 'Trastornos musculoesqueléticos',
        efectosPosibles: 'Síndrome túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Pausas activas cada hora', 'Rotación de tareas', 'Máquinas ergonómicas', 'Ejercicios de estiramiento']
      },
      {
        codigo: 'CONF-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en máquinas de coser',
        descripcion: 'Contacto con agujas, cortadoras y mecanismos en movimiento',
        riesgoPotencial: 'Heridas punzantes, atrapamiento de dedos',
        efectosPosibles: 'Perforaciones, laceraciones, amputación de falanges',
        medidasControl: ['Guardas de protección', 'Capacitación operación segura', 'Mantenimiento preventivo', 'Iluminación adecuada']
      },
      {
        codigo: 'CONF-003',
        clasificacion: 'quimico',
        peligro: 'Fibras textiles y polvos',
        descripcion: 'Inhalación de fibras de algodón, sintéticas y polvo',
        riesgoPotencial: 'Bisinosis, alergias respiratorias',
        efectosPosibles: 'Bisinosis ("pulmón de lunes"), asma ocupacional, rinitis',
        medidasControl: ['Ventilación con extracción', 'Mascarilla desechable', 'Limpieza húmeda', 'Espirometría periódica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla desechable', 'Gafas de seguridad', 'Protección auditiva (si hay ruido)', 'Calzado cerrado'],
    capacitacionesObligatorias: ['Operación segura de máquinas', 'Ergonomía en el puesto', 'Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2011',
    descripcionCIIU: 'Fabricación de sustancias y productos químicos básicos',
    nivelRiesgo: 'IV',
    sector: 'Manufactura',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'QUI-003', 'QUI-004', 'SEG-006', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'QUIM-001',
        clasificacion: 'quimico',
        peligro: 'Reacciones químicas peligrosas',
        descripcion: 'Reacciones exotérmicas no controladas, polimerización',
        riesgoPotencial: 'Explosión, incendio, liberación de gases',
        efectosPosibles: 'Quemaduras, intoxicación masiva, muerte',
        medidasControl: ['Control de temperatura', 'Sistemas de enfriamiento', 'Sensores de presión', 'Plan de emergencias químicas']
      },
      {
        codigo: 'QUIM-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a sustancias cancerígenas',
        descripcion: 'Contacto con benceno, formaldehído, amianto, otros cancerígenos',
        riesgoPotencial: 'Cáncer ocupacional',
        efectosPosibles: 'Leucemia, cáncer de pulmón, mesotelioma',
        medidasControl: ['Sustitución por sustancias menos peligrosas', 'Sistemas cerrados', 'Monitoreo biológico', 'EPP específico']
      },
      {
        codigo: 'QUIM-003',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atmósferas explosivas (ATEX)',
        descripcion: 'Presencia de gases, vapores o polvos inflamables',
        riesgoPotencial: 'Explosión',
        efectosPosibles: 'Quemaduras graves, muerte, daños materiales masivos',
        medidasControl: ['Clasificación de zonas ATEX', 'Equipos antiexplosión', 'Ventilación antideflagrante', 'Control de fuentes de ignición']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1496-2018', norma: 'Decreto 1496/2018', descripcion: 'Sistema Globalmente Armonizado (SGA)', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Traje químico Tyvek', 'Respirador con filtros específicos', 'Guantes resistentes a químicos', 'Botas de seguridad químicas', 'Gafas herméticas', 'Careta facial'],
    capacitacionesObligatorias: ['Manejo de sustancias químicas', 'SGA - Etiquetado y FDS', 'Respuesta a emergencias químicas', 'Espacios confinados', 'Primeros auxilios químicos']
  },

  // ==================== TRANSPORTE ====================
  {
    codigoCIIU: '4923',
    descripcionCIIU: 'Transporte de carga por carretera',
    nivelRiesgo: 'IV',
    sector: 'Transporte',
    peligrosPrioritarios: ['SEG-002', 'BIO-MEC-002', 'BIO-MEC-003', 'PSI-001', 'PSI-004', 'FIS-003'],
    peligrosEspecificos: [
      {
        codigo: 'TRANS-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Accidentes de tránsito',
        descripcion: 'Colisiones, volcamientos, atropellos en vías',
        riesgoPotencial: 'Traumatismos múltiples, muerte',
        efectosPosibles: 'Fracturas, TEC, lesiones medulares, muerte',
        medidasControl: ['PESV implementado', 'Mantenimiento vehicular', 'Control de velocidad GPS', 'Capacitación en conducción defensiva']
      },
      {
        codigo: 'TRANS-002',
        clasificacion: 'psicosocial',
        peligro: 'Fatiga del conductor',
        descripcion: 'Conducción prolongada, privación de sueño, presión por entregas',
        riesgoPotencial: 'Microsueños, pérdida de atención',
        efectosPosibles: 'Accidentes por somnolencia, estrés crónico',
        medidasControl: ['Jornadas máximas de conducción', 'Pausas obligatorias cada 4h', 'Control de horas de servicio', 'Exámenes de sueño']
      },
      {
        codigo: 'TRANS-003',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caída de carga/objetos',
        descripcion: 'Desprendimiento de carga durante transporte o cargue/descargue',
        riesgoPotencial: 'Aplastamiento, golpes',
        efectosPosibles: 'Fracturas, traumatismos, muerte',
        medidasControl: ['Aseguramiento de carga', 'Inspección pre-viaje', 'Uso de tarimas y flejes', 'Capacitación en amarre']
      },
      {
        codigo: 'TRANS-004',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Robo y violencia en carretera',
        descripcion: 'Asaltos, hurto de mercancía, secuestro',
        riesgoPotencial: 'Lesiones por violencia, trauma psicológico',
        efectosPosibles: 'Heridas, trauma psicológico, muerte',
        medidasControl: ['Rastreo GPS', 'Rutas seguras', 'Protocolo de emergencias', 'Comunicación constante', 'Paradas en sitios seguros']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1079-2015', norma: 'Decreto 1079/2015', descripcion: 'Decreto Único Reglamentario Transporte', obligatorio: true },
      { codigo: 'RES-1565-2014', norma: 'Resolución 1565/2014', descripcion: 'Plan Estratégico de Seguridad Vial', obligatorio: true },
      { codigo: 'LEY-769-2002', norma: 'Ley 769/2002', descripcion: 'Código Nacional de Tránsito', obligatorio: true }
    ],
    eppRecomendado: ['Casco (para cargue/descargue)', 'Guantes de cuero', 'Botas de seguridad', 'Chaleco reflectivo', 'Gafas de sol (antireflejos)'],
    capacitacionesObligatorias: ['Conducción defensiva', 'PESV', 'Aseguramiento de carga', 'Primeros auxilios en vía', 'Manejo de fatiga']
  },

  // ==================== AGRICULTURA ====================
  {
    codigoCIIU: '0111',
    descripcionCIIU: 'Cultivo de cereales y otros cultivos',
    nivelRiesgo: 'III',
    sector: 'Agricultura',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'BIO-001', 'BIO-004', 'FIS-004', 'FIS-005', 'SEG-005', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'AGRI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a plaguicidas',
        descripcion: 'Aplicación y contacto con herbicidas, insecticidas, fungicidas',
        riesgoPotencial: 'Intoxicación aguda y crónica',
        efectosPosibles: 'Intoxicación, daño neurológico, cáncer, alteraciones reproductivas',
        medidasControl: ['EPP completo para fumigación', 'Capacitación en manejo seguro', 'Almacenamiento seguro', 'Periodos de reentrada', 'Ducha post-aplicación']
      },
      {
        codigo: 'AGRI-002',
        clasificacion: 'biologico',
        peligro: 'Picaduras y mordeduras',
        descripcion: 'Contacto con serpientes, arañas, alacranes, abejas',
        riesgoPotencial: 'Envenenamiento, reacciones alérgicas',
        efectosPosibles: 'Envenenamiento, anafilaxia, muerte',
        medidasControl: ['Botas altas', 'Guantes gruesos', 'Revisión del área antes de trabajar', 'Botiquín con antihistamínicos', 'Acceso a suero antiofídico']
      },
      {
        codigo: 'AGRI-003',
        clasificacion: 'fisico',
        peligro: 'Radiación solar intensa',
        descripcion: 'Exposición prolongada al sol durante jornada laboral',
        riesgoPotencial: 'Cáncer de piel, golpe de calor',
        efectosPosibles: 'Quemaduras solares, melanoma, deshidratación, insolación',
        medidasControl: ['Bloqueador solar FPS 50+', 'Ropa manga larga clara', 'Sombrero de ala ancha', 'Hidratación constante', 'Pausas en sombra']
      },
      {
        codigo: 'AGRI-004',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en maquinaria agrícola',
        descripcion: 'Contacto con cosechadoras, tractores, implementos agrícolas',
        riesgoPotencial: 'Amputaciones, muerte',
        efectosPosibles: 'Amputaciones, fracturas múltiples, muerte',
        medidasControl: ['Guardas de protección', 'Capacitación en operación', 'Señalización', 'Mantenimiento preventivo', 'Ropa ajustada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Sombrero de ala ancha', 'Gafas de protección', 'Respirador con filtros', 'Guantes de nitrilo largos', 'Overol manga larga', 'Botas de caucho altas', 'Delantal impermeable'],
    capacitacionesObligatorias: ['Manejo seguro de plaguicidas', 'Primeros auxilios rurales', 'Operación de maquinaria agrícola', 'Prevención de mordeduras']
  },

  // ==================== MINERÍA ====================
  {
    codigoCIIU: '0510',
    descripcionCIIU: 'Extracción de hulla (carbón de piedra)',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['SEG-003', 'SEG-006', 'QUI-001', 'QUI-002', 'FIS-001', 'FIS-003', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'MIN-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosión por grisú',
        descripcion: 'Acumulación de metano (CH4) en galerías subterráneas',
        riesgoPotencial: 'Explosión masiva',
        efectosPosibles: 'Quemaduras graves, asfixia, muerte, derrumbe',
        medidasControl: ['Medición continua de metano', 'Ventilación mecánica', 'Equipos antiexplosión', 'Límite de concentración <1%', 'Evacuación inmediata']
      },
      {
        codigo: 'MIN-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Derrumbe de túneles',
        descripcion: 'Colapso de techos y paredes de galerías',
        riesgoPotencial: 'Sepultamiento, aplastamiento',
        efectosPosibles: 'Fracturas múltiples, asfixia, muerte',
        medidasControl: ['Sostenimiento de galerías', 'Inspección geotécnica', 'Monitoreo de convergencia', 'Refugios mineros', 'Equipos de rescate']
      },
      {
        codigo: 'MIN-003',
        clasificacion: 'quimico',
        peligro: 'Neumoconiosis por polvo de carbón',
        descripcion: 'Inhalación crónica de polvo de carbón',
        riesgoPotencial: 'Enfermedad pulmonar irreversible',
        efectosPosibles: 'Antracosis, fibrosis pulmonar masiva progresiva, muerte',
        medidasControl: ['Supresión de polvo con agua', 'Respiradores P100', 'Monitoreo de partículas', 'Espirometrías periódicas', 'Rotación de personal']
      },
      {
        codigo: 'MIN-004',
        clasificacion: 'fisico',
        peligro: 'Deficiencia de oxígeno',
        descripcion: 'Desplazamiento de O2 por gases (CO2, CH4, CO) en espacios confinados',
        riesgoPotencial: 'Asfixia',
        efectosPosibles: 'Pérdida de conciencia, daño cerebral, muerte',
        medidasControl: ['Monitoreo continuo de O2', 'Equipos de respiración autónoma', 'Ventilación forzada', 'Alarmas de bajo O2', 'Rescate inmediato']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1886-2015', norma: 'Decreto 1886/2015', descripcion: 'Reglamento de seguridad en labores mineras subterráneas', obligatorio: true },
      { codigo: 'DEC-2222-1993', norma: 'Decreto 2222/1993', descripcion: 'Reglamento de higiene y seguridad en minería', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Casco minero con lámpara', 'Autorescatador', 'Respirador P100', 'Botas de seguridad mineras', 'Guantes de cuero', 'Overol reflectivo', 'Gafas antiempañantes'],
    capacitacionesObligatorias: ['Seguridad minera subterránea', 'Uso de autorescatador', 'Evacuación de emergencia', 'Primeros auxilios', 'Detección de gases', 'Sostenimiento de galerías']
  },
  
  // Código CIIU 1200 - Alias de clasificación antigua para minería de carbón
  {
    codigoCIIU: '1200',
    descripcionCIIU: 'Extracción de carbón y lignito (clasificación CIIU Rev. 3)',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['SEG-003', 'SEG-006', 'QUI-001', 'QUI-002', 'FIS-001', 'FIS-003', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'MIN-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosión por grisú',
        descripcion: 'Acumulación de metano (CH4) en galerías subterráneas',
        riesgoPotencial: 'Explosión masiva',
        efectosPosibles: 'Quemaduras graves, asfixia, muerte, derrumbe',
        medidasControl: ['Medición continua de metano', 'Ventilación mecánica', 'Equipos antiexplosión', 'Límite de concentración <1%', 'Evacuación inmediata']
      },
      {
        codigo: 'MIN-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Derrumbe de túneles',
        descripcion: 'Colapso de techos y paredes de galerías',
        riesgoPotencial: 'Sepultamiento, aplastamiento',
        efectosPosibles: 'Fracturas múltiples, asfixia, muerte',
        medidasControl: ['Sostenimiento de galerías', 'Inspección geotécnica', 'Monitoreo de convergencia', 'Refugios mineros', 'Equipos de rescate']
      },
      {
        codigo: 'MIN-003',
        clasificacion: 'quimico',
        peligro: 'Neumoconiosis por polvo de carbón',
        descripcion: 'Inhalación crónica de polvo de carbón',
        riesgoPotencial: 'Enfermedad pulmonar irreversible',
        efectosPosibles: 'Antracosis, fibrosis pulmonar masiva progresiva, muerte',
        medidasControl: ['Supresión de polvo con agua', 'Respiradores P100', 'Monitoreo de partículas', 'Espirometrías periódicas', 'Rotación de personal']
      },
      {
        codigo: 'MIN-004',
        clasificacion: 'fisico',
        peligro: 'Deficiencia de oxígeno',
        descripcion: 'Desplazamiento de O2 por gases (CO2, CH4, CO) en espacios confinados',
        riesgoPotencial: 'Asfixia',
        efectosPosibles: 'Pérdida de conciencia, daño cerebral, muerte',
        medidasControl: ['Monitoreo continuo de O2', 'Equipos de respiración autónoma', 'Ventilación forzada', 'Alarmas de bajo O2', 'Rescate inmediato']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1886-2015', norma: 'Decreto 1886/2015', descripcion: 'Reglamento de seguridad en labores mineras subterráneas', obligatorio: true },
      { codigo: 'DEC-2222-1993', norma: 'Decreto 2222/1993', descripcion: 'Reglamento de higiene y seguridad en minería', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Casco minero con lámpara', 'Autorescatador', 'Respirador P100', 'Botas de seguridad mineras', 'Guantes de cuero', 'Overol reflectivo', 'Gafas antiempañantes'],
    capacitacionesObligatorias: ['Seguridad minera subterránea', 'Uso de autorescatador', 'Evacuación de emergencia', 'Primeros auxilios', 'Detección de gases', 'Sostenimiento de galerías']
  },

  // ==================== COMERCIO ====================
  {
    codigoCIIU: '4711',
    descripcionCIIU: 'Comercio al por menor en establecimientos no especializados',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-003', 'SEG-002', 'PSI-001', 'PSI-003'],
    peligrosEspecificos: [
      {
        codigo: 'COM-001',
        clasificacion: 'biomecanico',
        peligro: 'Bipedestación prolongada',
        descripcion: 'Permanecer de pie durante toda la jornada laboral',
        riesgoPotencial: 'Trastornos circulatorios y musculoesqueléticos',
        efectosPosibles: 'Várices, lumbalgia, fatiga de piernas, edema',
        medidasControl: ['Tapetes antifatiga', 'Pausas para sentarse', 'Calzado ergonómico', 'Medias de compresión', 'Rotación de tareas']
      },
      {
        codigo: 'COM-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atraco y violencia',
        descripcion: 'Riesgo de robo, asalto, agresión en punto de venta',
        riesgoPotencial: 'Lesiones por violencia, trauma psicológico',
        efectosPosibles: 'Heridas, trauma psicológico, ansiedad',
        medidasControl: ['Cámaras de seguridad', 'Botón de pánico', 'Iluminación adecuada', 'Caja fuerte con tiempo', 'Capacitación en manejo de atracos']
      },
      {
        codigo: 'COM-003',
        clasificacion: 'biomecanico',
        peligro: 'Manipulación de mercancía',
        descripcion: 'Levantamiento y traslado de productos pesados',
        riesgoPotencial: 'Lesiones de espalda',
        efectosPosibles: 'Lumbalgias, hernias discales',
        medidasControl: ['Carros de transporte', 'Técnica de levantamiento', 'Límite de peso', 'Trabajo en equipo para cargas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Guantes para manipulación', 'Faja lumbar (si manipula cargas)'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Atención a emergencias', 'Protocolo de atracos', 'Pausas activas', 'Riesgo psicosocial']
  },

  // ==================== TECNOLOGÍA ====================
  {
    codigoCIIU: '6201',
    descripcionCIIU: 'Actividades de desarrollo de sistemas informáticos',
    nivelRiesgo: 'I',
    sector: 'Tecnología',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'FIS-002', 'PSI-001', 'PSI-003', 'PSI-004'],
    peligrosEspecificos: [
      {
        codigo: 'TEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Síndrome de pantalla de visualización',
        descripcion: 'Uso prolongado de computador (>4 horas diarias)',
        riesgoPotencial: 'Fatiga visual, TME de miembro superior',
        efectosPosibles: 'Síndrome de ojo seco, cefalea, túnel carpiano, cervicalgia',
        medidasControl: ['Regla 20-20-20', 'Monitor a altura de ojos', 'Iluminación sin reflejos', 'Silla ergonómica', 'Pausas activas']
      },
      {
        codigo: 'TEC-002',
        clasificacion: 'psicosocial',
        peligro: 'Tecnoestrés',
        descripcion: 'Presión por entregas, disponibilidad constante, cambios tecnológicos',
        riesgoPotencial: 'Burnout, ansiedad',
        efectosPosibles: 'Agotamiento, depresión, trastornos de sueño',
        medidasControl: ['Desconexión digital', 'Gestión de carga de trabajo', 'Metodologías ágiles', 'Apoyo psicológico', 'Horarios flexibles']
      },
      {
        codigo: 'TEC-003',
        clasificacion: 'biomecanico',
        peligro: 'Sedentarismo laboral',
        descripcion: 'Permanecer sentado durante toda la jornada',
        riesgoPotencial: 'Enfermedades cardiovasculares, obesidad',
        efectosPosibles: 'Obesidad, diabetes, enfermedades cardiacas, trombosis',
        medidasControl: ['Escritorios de pie', 'Pausas cada 30-60 min', 'Ejercicio regular', 'Silla ergonómica', 'Reuniones caminando']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-2346-2007', norma: 'Resolución 2346/2007', descripcion: 'Exámenes médicos ocupacionales', obligatorio: true }
    ],
    eppRecomendado: ['Filtro de pantalla antireflejos (opcional)', 'Reposamuñecas', 'Soporte lumbar'],
    capacitacionesObligatorias: ['Ergonomía en oficinas', 'Pausas activas', 'Manejo del estrés', 'Higiene visual']
  },

  // ==================== RESTAURANTES ====================
  {
    codigoCIIU: '5611',
    descripcionCIIU: 'Expendio a la mesa de comidas preparadas',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'SEG-002', 'SEG-006', 'BIO-MEC-002', 'QUI-003'],
    peligrosEspecificos: [
      {
        codigo: 'REST-001',
        clasificacion: 'fisico',
        peligro: 'Quemaduras por equipos calientes',
        descripcion: 'Contacto con hornos, planchas, freidoras, líquidos calientes',
        riesgoPotencial: 'Quemaduras de segundo y tercer grado',
        efectosPosibles: 'Quemaduras en manos, brazos, cara',
        medidasControl: ['Guantes térmicos', 'Manijas aislantes', 'Señalización de superficies calientes', 'Capacitación en manejo seguro']
      },
      {
        codigo: 'REST-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes con utensilios',
        descripcion: 'Uso de cuchillos, procesadores, rebanadoras',
        riesgoPotencial: 'Heridas cortantes',
        efectosPosibles: 'Laceraciones, amputación de falanges',
        medidasControl: ['Guantes anticorte', 'Tablas de corte estables', 'Cuchillos afilados', 'Capacitación técnica de corte']
      },
      {
        codigo: 'REST-003',
        clasificacion: 'biologico',
        peligro: 'Contaminación de alimentos',
        descripcion: 'Manejo inadecuado de alimentos, contaminación cruzada',
        riesgoPotencial: 'ETA (Enfermedades Transmitidas por Alimentos)',
        efectosPosibles: 'Intoxicación alimentaria en clientes y trabajadores',
        medidasControl: ['BPM (Buenas Prácticas de Manufactura)', 'Control de temperaturas', 'Lavado de manos', 'Separación de alimentos crudos/cocidos']
      },
      {
        codigo: 'REST-004',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Pisos resbalosos',
        descripcion: 'Superficies mojadas por agua, grasa, alimentos',
        riesgoPotencial: 'Caídas al mismo nivel',
        efectosPosibles: 'Fracturas, contusiones, esguinces',
        medidasControl: ['Calzado antideslizante', 'Limpieza inmediata de derrames', 'Pisos antideslizantes', 'Señalización de piso mojado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'Requisitos sanitarios para alimentos', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado antideslizante', 'Delantal', 'Guantes térmicos', 'Guantes anticorte', 'Gorro/cofia', 'Tapabocas'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'BPM', 'Prevención de incendios', 'Primeros auxilios', 'Ergonomía']
  },

  // ==================== SECCIÓN A: AGRICULTURA, GANADERÍA ====================
  {
    codigoCIIU: '0121',
    descripcionCIIU: 'Cría de ganado bovino y bufalino',
    nivelRiesgo: 'III',
    sector: 'Agricultura y ganadería',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-004', 'FIS-004', 'FIS-005', 'SEG-005', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'GAN-001',
        clasificacion: 'biologico',
        peligro: 'Zoonosis',
        descripcion: 'Enfermedades transmitidas de animales a humanos (brucelosis, leptospirosis, rabia)',
        riesgoPotencial: 'Infección zoonótica',
        efectosPosibles: 'Brucelosis, leptospirosis, tuberculosis bovina',
        medidasControl: ['Vacunación del ganado', 'EPP completo', 'Lavado de manos', 'Exámenes médicos periódicos']
      },
      {
        codigo: 'GAN-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Golpes y aplastamiento por animales',
        descripcion: 'Patadas, cornadas, pisotones de ganado',
        riesgoPotencial: 'Traumatismos por animales',
        efectosPosibles: 'Fracturas, contusiones, heridas penetrantes',
        medidasControl: ['Mangas y corrales seguros', 'Capacitación en manejo animal', 'No trabajar solo', 'Calzado de seguridad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caucho', 'Guantes de cuero', 'Overol', 'Gafas de seguridad', 'Sombrero'],
    capacitacionesObligatorias: ['Manejo seguro de ganado', 'Zoonosis', 'Primeros auxilios rurales']
  },

  {
    codigoCIIU: '0311',
    descripcionCIIU: 'Pesca marítima',
    nivelRiesgo: 'IV',
    sector: 'Pesca',
    peligrosPrioritarios: ['SEG-002', 'FIS-004', 'FIS-005', 'BIO-MEC-003', 'NAT-002', 'NAT-003'],
    peligrosEspecificos: [
      {
        codigo: 'PESCA-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caída al mar/ahogamiento',
        descripcion: 'Caída desde embarcación por oleaje o pérdida de equilibrio',
        riesgoPotencial: 'Ahogamiento',
        efectosPosibles: 'Ahogamiento, hipotermia, muerte',
        medidasControl: ['Chaleco salvavidas obligatorio', 'Líneas de vida', 'Capacitación en natación', 'Equipo de rescate']
      },
      {
        codigo: 'PESCA-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en redes y maquinaria',
        descripcion: 'Enganche en cabos, redes, winches y maquinaria de pesca',
        riesgoPotencial: 'Atrapamiento, amputaciones',
        efectosPosibles: 'Laceraciones, amputaciones, ahogamiento',
        medidasControl: ['Guardas en winches', 'Ropa ajustada', 'Cuchillo de emergencia', 'Paradas de emergencia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-2324-1984', norma: 'Decreto 2324/1984', descripcion: 'Actividades marítimas', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas', 'Guantes impermeables', 'Botas de caucho antideslizantes', 'Traje impermeable', 'Cuchillo de emergencia'],
    capacitacionesObligatorias: ['Seguridad marítima', 'Natación y rescate', 'Primeros auxilios', 'Supervivencia en el mar']
  },

  // ==================== SECCIÓN B: MINERÍA Y PETRÓLEO ====================
  {
    codigoCIIU: '0610',
    descripcionCIIU: 'Extracción de petróleo crudo',
    nivelRiesgo: 'V',
    sector: 'Petróleo y gas',
    peligrosPrioritarios: ['SEG-006', 'SEG-003', 'QUI-001', 'QUI-002', 'FIS-001', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'PET-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosión de pozos/blowout',
        descripcion: 'Liberación no controlada de hidrocarburos a presión',
        riesgoPotencial: 'Explosión masiva, incendio',
        efectosPosibles: 'Quemaduras graves, muerte, daño ambiental',
        medidasControl: ['BOP (Blowout Preventer)', 'Control de pozos', 'Monitoreo de presión', 'Plan de emergencias']
      },
      {
        codigo: 'PET-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a H2S (ácido sulfhídrico)',
        descripcion: 'Gas tóxico presente en operaciones petroleras',
        riesgoPotencial: 'Intoxicación aguda, muerte',
        efectosPosibles: 'Parálisis respiratoria, muerte (>100 ppm)',
        medidasControl: ['Detectores H2S personales', 'SCBA disponible', 'Alarmas de gas', 'Evacuación inmediata']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1073-2015', norma: 'Decreto 1073/2015', descripcion: 'Sector minero-energético', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Casco con barboquejo', 'Gafas de seguridad', 'Protección auditiva', 'Botas de seguridad', 'Ropa ignífuga', 'Detector H2S', 'SCBA'],
    capacitacionesObligatorias: ['Control de pozos', 'H2S y gases tóxicos', 'Espacios confinados', 'Trabajo en alturas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0620',
    descripcionCIIU: 'Extracción de gas natural',
    nivelRiesgo: 'V',
    sector: 'Petróleo y gas',
    peligrosPrioritarios: ['SEG-006', 'SEG-003', 'QUI-001', 'FIS-001', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'GAS-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Fuga de gas inflamable',
        descripcion: 'Escape de metano u otros gases inflamables',
        riesgoPotencial: 'Explosión, incendio',
        efectosPosibles: 'Quemaduras, asfixia, muerte',
        medidasControl: ['Detectores de gas', 'Ventilación', 'Equipos antiexplosión', 'Procedimientos LOTO']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1073-2015', norma: 'Decreto 1073/2015', descripcion: 'Sector minero-energético', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Gafas de seguridad', 'Ropa ignífuga', 'Detector de gases', 'Botas antiestáticas'],
    capacitacionesObligatorias: ['Manejo de gases inflamables', 'Detección de fugas', 'Control de emergencias', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0811',
    descripcionCIIU: 'Extracción de piedra, arena y arcilla',
    nivelRiesgo: 'IV',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'FIS-003', 'SEG-005', 'SEG-001', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'CANT-001',
        clasificacion: 'quimico',
        peligro: 'Silicosis por polvo de sílice',
        descripcion: 'Inhalación de partículas de sílice cristalina',
        riesgoPotencial: 'Enfermedad pulmonar irreversible',
        efectosPosibles: 'Silicosis, cáncer pulmonar, fibrosis',
        medidasControl: ['Respirador P100', 'Humidificación', 'Extracción localizada', 'Espirometrías']
      },
      {
        codigo: 'CANT-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Derrumbe de taludes',
        descripcion: 'Colapso de paredes de excavación a cielo abierto',
        riesgoPotencial: 'Sepultamiento',
        efectosPosibles: 'Fracturas múltiples, asfixia, muerte',
        medidasControl: ['Diseño de taludes', 'Monitoreo geotécnico', 'Bermas de seguridad', 'Señalización']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-2222-1993', norma: 'Decreto 2222/1993', descripcion: 'Reglamento de higiene en minería', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Respirador P100', 'Gafas antiempañantes', 'Protección auditiva', 'Botas de seguridad', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Seguridad en canteras', 'Protección respiratoria', 'Manejo de explosivos', 'Primeros auxilios']
  },

  // ==================== SECCIÓN C: MÁS MANUFACTURA ====================
  {
    codigoCIIU: '1011',
    descripcionCIIU: 'Procesamiento y conservación de carne',
    nivelRiesgo: 'III',
    sector: 'Manufactura',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'SEG-005', 'FIS-004', 'BIO-MEC-001', 'QUI-003'],
    peligrosEspecificos: [
      {
        codigo: 'CARN-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes con cuchillos y sierras',
        descripcion: 'Uso de herramientas cortantes para despiece',
        riesgoPotencial: 'Laceraciones graves, amputaciones',
        efectosPosibles: 'Cortes profundos, amputación de dedos',
        medidasControl: ['Guantes de malla metálica', 'Cuchillos con guardamanos', 'Capacitación', 'Mantenimiento de filos']
      },
      {
        codigo: 'CARN-002',
        clasificacion: 'fisico',
        peligro: 'Exposición a frío en cuartos refrigerados',
        descripcion: 'Trabajo prolongado en temperaturas <5°C',
        riesgoPotencial: 'Hipotermia, enfermedades respiratorias',
        efectosPosibles: 'Hipotermia, congelación, bronquitis',
        medidasControl: ['Ropa térmica', 'Rotación de personal', 'Pausas en zonas cálidas', 'Bebidas calientes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1500-2007', norma: 'Decreto 1500/2007', descripcion: 'Requisitos sanitarios carne', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de malla metálica', 'Delantal de malla', 'Botas de caucho', 'Gorro/cofia', 'Ropa térmica', 'Gafas'],
    capacitacionesObligatorias: ['Manipulación de cárnicos', 'BPM', 'Uso de herramientas cortantes', 'Cadena de frío']
  },

  {
    codigoCIIU: '1081',
    descripcionCIIU: 'Elaboración de productos de panadería',
    nivelRiesgo: 'II',
    sector: 'Manufactura',
    peligrosPrioritarios: ['FIS-004', 'SEG-006', 'QUI-002', 'BIO-MEC-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PAN-001',
        clasificacion: 'fisico',
        peligro: 'Quemaduras por hornos',
        descripcion: 'Contacto con superficies calientes de hornos industriales',
        riesgoPotencial: 'Quemaduras térmicas',
        efectosPosibles: 'Quemaduras de 1ro, 2do y 3er grado',
        medidasControl: ['Guantes térmicos', 'Señalización', 'Herramientas de mango largo', 'Capacitación']
      },
      {
        codigo: 'PAN-002',
        clasificacion: 'quimico',
        peligro: 'Asma del panadero (harina)',
        descripcion: 'Inhalación de polvo de harina y aditivos',
        riesgoPotencial: 'Enfermedad respiratoria ocupacional',
        efectosPosibles: 'Asma ocupacional, rinitis, dermatitis',
        medidasControl: ['Ventilación con extracción', 'Mascarilla N95', 'Sistemas cerrados', 'Espirometrías']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'Requisitos sanitarios alimentos', obligatorio: true }
    ],
    eppRecomendado: ['Guantes térmicos', 'Delantal', 'Gorro/cofia', 'Mascarilla', 'Calzado cerrado'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'BPM', 'Prevención de incendios', 'Ergonomía']
  },

  {
    codigoCIIU: '1104',
    descripcionCIIU: 'Elaboración de bebidas no alcohólicas',
    nivelRiesgo: 'II',
    sector: 'Manufactura',
    peligrosPrioritarios: ['FIS-001', 'SEG-005', 'BIO-MEC-003', 'QUI-003', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'BEB-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en líneas de embotellado',
        descripcion: 'Contacto con bandas transportadoras y maquinaria de envasado',
        riesgoPotencial: 'Atrapamiento, aplastamiento',
        efectosPosibles: 'Fracturas, amputaciones, contusiones',
        medidasControl: ['Guardas de seguridad', 'Paradas de emergencia', 'LOTO', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'Requisitos sanitarios alimentos', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Protección auditiva', 'Gafas de seguridad', 'Botas de seguridad', 'Guantes'],
    capacitacionesObligatorias: ['Operación segura de maquinaria', 'LOTO', 'BPM', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2410',
    descripcionCIIU: 'Industrias básicas de hierro y acero',
    nivelRiesgo: 'V',
    sector: 'Manufactura',
    peligrosPrioritarios: ['FIS-004', 'FIS-005', 'SEG-005', 'SEG-006', 'QUI-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'SIDER-001',
        clasificacion: 'fisico',
        peligro: 'Radiación infrarroja y calor extremo',
        descripcion: 'Exposición a metal fundido (>1500°C)',
        riesgoPotencial: 'Quemaduras graves, golpe de calor',
        efectosPosibles: 'Quemaduras, cataratas, deshidratación severa',
        medidasControl: ['Trajes aluminizados', 'Pantallas de protección', 'Hidratación', 'Rotación de personal']
      },
      {
        codigo: 'SIDER-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Salpicadura de metal fundido',
        descripcion: 'Proyección de acero líquido durante colada',
        riesgoPotencial: 'Quemaduras de tercer grado',
        efectosPosibles: 'Quemaduras profundas, muerte',
        medidasControl: ['EPP ignífugo completo', 'Distancias de seguridad', 'Procedimientos de colada', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Casco con careta', 'Traje aluminizado', 'Guantes de cuero largos', 'Botas de seguridad', 'Protección auditiva', 'Gafas IR'],
    capacitacionesObligatorias: ['Manejo de metal fundido', 'Control de emergencias', 'Primeros auxilios quemaduras', 'Protección térmica']
  },

  {
    codigoCIIU: '2511',
    descripcionCIIU: 'Fabricación de productos metálicos estructurales',
    nivelRiesgo: 'III',
    sector: 'Manufactura',
    peligrosPrioritarios: ['SEG-005', 'FIS-001', 'FIS-003', 'QUI-004', 'SEG-001', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'MET-001',
        clasificacion: 'fisico',
        peligro: 'Proyección de partículas metálicas',
        descripcion: 'Fragmentos de metal durante corte, esmerilado, soldadura',
        riesgoPotencial: 'Lesiones oculares, heridas',
        efectosPosibles: 'Cuerpos extraños en ojos, laceraciones',
        medidasControl: ['Gafas de seguridad', 'Caretas', 'Pantallas protectoras', 'EPP facial']
      },
      {
        codigo: 'MET-002',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura',
        descripcion: 'Inhalación de humos metálicos durante soldadura',
        riesgoPotencial: 'Fiebre de los humos metálicos, neumoconiosis',
        efectosPosibles: 'Fiebre, tos, fibrosis pulmonar',
        medidasControl: ['Extracción localizada', 'Respirador con filtros', 'Ventilación', 'Rotación de personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Gafas de seguridad', 'Careta de soldador', 'Guantes de cuero', 'Delantal de cuero', 'Botas de seguridad', 'Protección auditiva'],
    capacitacionesObligatorias: ['Soldadura segura', 'Manejo de herramientas', 'Trabajo en alturas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2930',
    descripcionCIIU: 'Fabricación de partes, piezas y accesorios para vehículos',
    nivelRiesgo: 'III',
    sector: 'Manufactura',
    peligrosPrioritarios: ['SEG-005', 'FIS-001', 'QUI-004', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'AUTO-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en prensas hidráulicas',
        descripcion: 'Operación de prensas de estampado y conformado',
        riesgoPotencial: 'Amputaciones, aplastamiento',
        efectosPosibles: 'Amputación de extremidades, muerte',
        medidasControl: ['Doble mando', 'Cortinas de luz', 'Guardas fijas', 'LOTO', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Protección auditiva', 'Guantes anticorte', 'Botas de seguridad', 'Ropa ajustada'],
    capacitacionesObligatorias: ['Operación de prensas', 'LOTO', 'Seguridad en máquinas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3250',
    descripcionCIIU: 'Fabricación de instrumentos, aparatos y materiales médicos y odontológicos',
    nivelRiesgo: 'III',
    sector: 'Manufactura',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-001', 'QUI-003', 'SEG-005', 'FIS-006', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'MED-001',
        clasificacion: 'biologico',
        peligro: 'Contaminación con material biológico en pruebas',
        descripcion: 'Contacto con sangre, fluidos corporales durante pruebas de calidad de dispositivos',
        riesgoPotencial: 'Infección por patógenos',
        efectosPosibles: 'Hepatitis B/C, VIH, infecciones bacterianas',
        medidasControl: ['Guantes de nitrilo', 'Bata desechable', 'Gafas de seguridad', 'Protocolos de bioseguridad', 'Vacunación Hepatitis B']
      },
      {
        codigo: 'MED-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a óxido de etileno (esterilización)',
        descripcion: 'Gas utilizado para esterilizar dispositivos médicos sensibles al calor',
        riesgoPotencial: 'Intoxicación, efectos carcinogénicos',
        efectosPosibles: 'Irritación respiratoria, náuseas, cáncer (exposición prolongada), efectos reproductivos',
        medidasControl: ['Sistemas de esterilización cerrados', 'Monitores de gas', 'Ventilación con extracción', 'Respirador con filtros específicos', 'Límites de exposición ocupacional']
      },
      {
        codigo: 'MED-003',
        clasificacion: 'fisico',
        peligro: 'Radiación ionizante en control de calidad',
        descripcion: 'Uso de rayos X o gamma para inspección de dispositivos',
        riesgoPotencial: 'Efectos de radiación',
        efectosPosibles: 'Daño celular, cáncer, efectos en sistema reproductivo',
        medidasControl: ['Blindaje de plomo', 'Dosímetros personales', 'Distancia y tiempo mínimo', 'Capacitación en radioprotección', 'Exámenes médicos periódicos']
      },
      {
        codigo: 'MED-004',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes con instrumentos quirúrgicos en fabricación',
        descripcion: 'Manipulación de bisturíes, agujas, implantes cortantes durante ensamble',
        riesgoPotencial: 'Laceraciones, heridas punzantes',
        efectosPosibles: 'Cortes profundos, heridas punzantes, riesgo de infección',
        medidasControl: ['Guantes anticorte nivel 5', 'Pinzas de manipulación', 'Contenedores para cortopunzantes', 'Capacitación en manipulación segura']
      },
      {
        codigo: 'MED-005',
        clasificacion: 'quimico',
        peligro: 'Adhesivos y resinas para dispositivos',
        descripcion: 'Uso de cianoacrilatos, resinas epoxi y siliconas médicas',
        riesgoPotencial: 'Sensibilización cutánea y respiratoria',
        efectosPosibles: 'Dermatitis de contacto, asma ocupacional, irritación ocular',
        medidasControl: ['Ventilación localizada', 'Guantes de nitrilo', 'Gafas de seguridad', 'Rotación de tareas', 'Productos de baja emisión de VOC']
      },
      {
        codigo: 'MED-006',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de precisión bajo microscopio',
        descripcion: 'Ensamble de microcomponentes con visión forzada y postura estática',
        riesgoPotencial: 'Fatiga visual y músculo-esquelética',
        efectosPosibles: 'Síndrome de visión por computador, cervicalgia, tendinitis',
        medidasControl: ['Microscopios ergonómicos', 'Pausas visuales cada 20 min', 'Iluminación adecuada', 'Sillas ajustables', 'Ejercicios de estiramiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-4725-2005', norma: 'Decreto 4725/2005', descripcion: 'Régimen de registros sanitarios de dispositivos médicos', obligatorio: true },
      { codigo: 'RES-4002-2007', norma: 'Resolución 4002/2007', descripcion: 'Buenas Prácticas de Manufactura para dispositivos médicos', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true },
      { codigo: 'ISO-13485', norma: 'ISO 13485:2016', descripcion: 'Sistema de gestión de calidad para dispositivos médicos', obligatorio: false }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Guantes anticorte', 'Gafas de seguridad', 'Bata de laboratorio', 'Cofia', 'Calzado cerrado', 'Respirador con filtros (según proceso)', 'Dosímetro (si aplica)'],
    capacitacionesObligatorias: ['Bioseguridad', 'Buenas Prácticas de Manufactura', 'Manejo de sustancias químicas', 'Ergonomía', 'Uso de EPP', 'Radioprotección (si aplica)']
  },

  // ==================== SECCIÓN D: ELECTRICIDAD ====================
  {
    codigoCIIU: '3511',
    descripcionCIIU: 'Generación de energía eléctrica',
    nivelRiesgo: 'IV',
    sector: 'Electricidad',
    peligrosPrioritarios: ['SEG-004', 'SEG-001', 'FIS-001', 'SEG-005', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'GEN-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Contacto con alta tensión',
        descripcion: 'Exposición a tensiones >1000V en generadores y transformadores',
        riesgoPotencial: 'Electrocución fatal',
        efectosPosibles: 'Fibrilación ventricular, quemaduras, muerte',
        medidasControl: ['LOTO obligatorio', 'Distancias RETIE', 'EPP dieléctrico', 'Verificación ausencia tensión']
      },
      {
        codigo: 'GEN-002',
        clasificacion: 'fisico',
        peligro: 'Ruido de turbinas y generadores',
        descripcion: 'Exposición continua a ruido >90 dBA',
        riesgoPotencial: 'Pérdida auditiva',
        efectosPosibles: 'Hipoacusia neurosensorial',
        medidasControl: ['Doble protección auditiva', 'Cabinas insonorizadas', 'Rotación', 'Audiometrías']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-5018-2019', norma: 'Resolución 5018/2019', descripcion: 'SST sector eléctrico', obligatorio: true },
      { codigo: 'RETIE', norma: 'RETIE', descripcion: 'Reglamento Técnico Instalaciones Eléctricas', obligatorio: true }
    ],
    eppRecomendado: ['Casco dieléctrico', 'Guantes dieléctricos', 'Botas dieléctricas', 'Ropa ignífuga', 'Protección auditiva', 'Gafas'],
    capacitacionesObligatorias: ['Riesgo eléctrico AT', 'LOTO', 'Trabajo en alturas', 'Espacios confinados', 'Primeros auxilios RCP']
  },

  // ==================== SECCIÓN E: AGUA Y SANEAMIENTO ====================
  {
    codigoCIIU: '3600',
    descripcionCIIU: 'Captación, tratamiento y distribución de agua',
    nivelRiesgo: 'III',
    sector: 'Agua y saneamiento',
    peligrosPrioritarios: ['SEG-003', 'BIO-001', 'BIO-004', 'QUI-003', 'SEG-002', 'NAT-002'],
    peligrosEspecificos: [
      {
        codigo: 'AGUA-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en tanques y pozos (espacios confinados)',
        descripcion: 'Ingreso a tanques de almacenamiento, pozos de inspección',
        riesgoPotencial: 'Asfixia, ahogamiento',
        efectosPosibles: 'Asfixia por gases, ahogamiento, intoxicación',
        medidasControl: ['Permiso de entrada', 'Medición de gases', 'Vigía externo', 'Equipos de rescate']
      },
      {
        codigo: 'AGUA-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a cloro gaseoso',
        descripcion: 'Manejo de cloro para potabilización',
        riesgoPotencial: 'Intoxicación respiratoria',
        efectosPosibles: 'Irritación severa, edema pulmonar',
        medidasControl: ['Detectores de cloro', 'Respirador con filtro específico', 'Ducha de emergencia', 'Ventilación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Arnés', 'Botas de caucho', 'Guantes de nitrilo', 'Respirador', 'Detector multigas'],
    capacitacionesObligatorias: ['Espacios confinados', 'Manejo de cloro', 'Rescate', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3700',
    descripcionCIIU: 'Evacuación y tratamiento de aguas residuales',
    nivelRiesgo: 'IV',
    sector: 'Agua y saneamiento',
    peligrosPrioritarios: ['SEG-003', 'BIO-001', 'BIO-002', 'BIO-004', 'QUI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'ALCANT-001',
        clasificacion: 'biologico',
        peligro: 'Patógenos en aguas residuales',
        descripcion: 'Contacto con aguas negras y lodos',
        riesgoPotencial: 'Infecciones gastrointestinales, hepatitis',
        efectosPosibles: 'Hepatitis A, leptospirosis, gastroenteritis',
        medidasControl: ['EPP impermeable completo', 'Vacunación', 'Higiene estricta', 'Desinfección']
      },
      {
        codigo: 'ALCANT-002',
        clasificacion: 'quimico',
        peligro: 'Gases tóxicos en alcantarillado (H2S, CH4)',
        descripcion: 'Acumulación de gases en redes de alcantarillado',
        riesgoPotencial: 'Intoxicación, explosión',
        efectosPosibles: 'Muerte súbita por H2S, explosión por metano',
        medidasControl: ['Detector multigas obligatorio', 'Ventilación forzada', 'Nunca trabajar solo', 'SCBA disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Traje impermeable Tyvek', 'Botas de caucho altas', 'Guantes largos', 'Respirador con filtros', 'Detector multigas', 'Arnés'],
    capacitacionesObligatorias: ['Espacios confinados', 'Detección de gases', 'Bioseguridad', 'Rescate', 'Primeros auxilios']
  },

  // ==================== SECCIÓN F: MÁS CONSTRUCCIÓN ====================
  {
    codigoCIIU: '4210',
    descripcionCIIU: 'Construcción de carreteras y vías de ferrocarril',
    nivelRiesgo: 'V',
    sector: 'Construcción',
    peligrosPrioritarios: ['SEG-002', 'SEG-005', 'FIS-001', 'FIS-004', 'QUI-002', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'VIAL-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atropellamiento por vehículos/maquinaria',
        descripcion: 'Trabajo en vías con tráfico vehicular activo',
        riesgoPotencial: 'Atropellamiento',
        efectosPosibles: 'Fracturas múltiples, traumatismos, muerte',
        medidasControl: ['Señalización vial', 'Chaleco reflectivo', 'Conos y barreras', 'Vigías de tráfico']
      },
      {
        codigo: 'VIAL-002',
        clasificacion: 'quimico',
        peligro: 'Vapores de asfalto caliente',
        descripcion: 'Exposición a humos de asfalto durante pavimentación',
        riesgoPotencial: 'Irritación respiratoria, cáncer',
        efectosPosibles: 'Irritación de vías respiratorias, dermatitis, cáncer de piel',
        medidasControl: ['Respirador con filtros orgánicos', 'Trabajar a favor del viento', 'Ropa protectora', 'Hidratación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-1409-2012', norma: 'Resolución 1409/2012', descripcion: 'Trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Chaleco reflectivo clase 3', 'Gafas', 'Protección auditiva', 'Botas de seguridad', 'Guantes', 'Respirador'],
    capacitacionesObligatorias: ['Señalización vial', 'Manejo de maquinaria pesada', 'Primeros auxilios', 'Control de tráfico']
  },

  {
    codigoCIIU: '4322',
    descripcionCIIU: 'Instalaciones de fontanería, calefacción y aire acondicionado',
    nivelRiesgo: 'III',
    sector: 'Construcción',
    peligrosPrioritarios: ['SEG-003', 'SEG-004', 'BIO-MEC-002', 'QUI-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'PLOM-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en espacios reducidos y confinados',
        descripcion: 'Instalación en cuartos técnicos, ductos, pozos',
        riesgoPotencial: 'Atrapamiento, asfixia',
        efectosPosibles: 'Asfixia, lesiones por espacio reducido',
        medidasControl: ['Evaluación de espacio confinado', 'Vigía', 'Ventilación', 'Comunicación constante']
      },
      {
        codigo: 'PLOM-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a gases refrigerantes',
        descripcion: 'Fugas de freón u otros refrigerantes durante mantenimiento',
        riesgoPotencial: 'Asfixia, congelación',
        efectosPosibles: 'Asfixia en espacios cerrados, quemaduras por frío',
        medidasControl: ['Detectores de refrigerante', 'Ventilación', 'Guantes criogénicos', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Gafas', 'Guantes de trabajo', 'Rodilleras', 'Botas de seguridad', 'Respirador'],
    capacitacionesObligatorias: ['Espacios confinados', 'Manejo de refrigerantes', 'Trabajo en alturas', 'Primeros auxilios']
  },

  // ==================== SECCIÓN G: MÁS COMERCIO ====================
  {
    codigoCIIU: '4511',
    descripcionCIIU: 'Comercio de vehículos automotores nuevos',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'CONC-001',
        clasificacion: 'biomecanico',
        peligro: 'Bipedestación prolongada en sala de ventas',
        descripcion: 'Permanecer de pie durante jornada atendiendo clientes',
        riesgoPotencial: 'Trastornos circulatorios',
        efectosPosibles: 'Várices, fatiga, lumbalgia',
        medidasControl: ['Pausas para sentarse', 'Calzado ergonómico', 'Tapetes antifatiga']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico'],
    capacitacionesObligatorias: ['Ergonomía', 'Manejo del estrés', 'Pausas activas']
  },

  {
    codigoCIIU: '4520',
    descripcionCIIU: 'Mantenimiento y reparación de vehículos automotores',
    nivelRiesgo: 'III',
    sector: 'Comercio',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'QUI-004', 'FIS-001', 'BIO-MEC-002', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'TALL-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Aplastamiento por vehículos',
        descripcion: 'Caída de vehículos desde elevadores o gatos',
        riesgoPotencial: 'Aplastamiento',
        efectosPosibles: 'Fracturas múltiples, aplastamiento de tórax, muerte',
        medidasControl: ['Mantenimiento de elevadores', 'Calzos de seguridad', 'Capacitación', 'Inspección previa']
      },
      {
        codigo: 'TALL-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a gases de escape y solventes',
        descripcion: 'Inhalación de CO, combustibles y desengrasantes',
        riesgoPotencial: 'Intoxicación, daño neurológico',
        efectosPosibles: 'Cefalea, mareos, daño hepático, intoxicación por CO',
        medidasControl: ['Extracción de gases', 'Ventilación cruzada', 'Respirador', 'Detectores CO']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Overol', 'Guantes de nitrilo', 'Gafas de seguridad', 'Botas de seguridad', 'Respirador para vapores'],
    capacitacionesObligatorias: ['Uso seguro de elevadores', 'Manejo de sustancias químicas', 'Primeros auxilios', 'Prevención de incendios']
  },

  {
    codigoCIIU: '4721',
    descripcionCIIU: 'Comercio al por menor de productos alimenticios en establecimientos especializados',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-003', 'SEG-002', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'TIEN-001',
        clasificacion: 'biomecanico',
        peligro: 'Manipulación de cajas y productos',
        descripcion: 'Levantamiento repetido de mercancía para surtido',
        riesgoPotencial: 'Lesiones de espalda',
        efectosPosibles: 'Lumbalgias, hernias discales',
        medidasControl: ['Carros de transporte', 'Técnica de levantamiento', 'Límite de peso', 'Pausas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'Requisitos sanitarios alimentos', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cerrado', 'Guantes para manipulación', 'Faja lumbar opcional'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'Manejo de cargas', 'Pausas activas']
  },

  {
    codigoCIIU: '4773',
    descripcionCIIU: 'Comercio al por menor de productos farmacéuticos',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'PSI-001', 'BIO-001'],
    peligrosEspecificos: [
      {
        codigo: 'FARM-001',
        clasificacion: 'psicosocial',
        peligro: 'Atención a público con demandas emocionales',
        descripcion: 'Atención a pacientes con dolor, ansiedad o urgencia',
        riesgoPotencial: 'Estrés emocional, burnout',
        efectosPosibles: 'Agotamiento emocional, ansiedad, estrés',
        medidasControl: ['Capacitación en manejo emocional', 'Rotación', 'Apoyo psicológico', 'Pausas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Guantes desechables para inyectología'],
    capacitacionesObligatorias: ['Servicio al cliente', 'Manejo del estrés', 'Bioseguridad básica']
  },

  // ==================== SECCIÓN H: MÁS TRANSPORTE ====================
  {
    codigoCIIU: '4921',
    descripcionCIIU: 'Transporte de pasajeros',
    nivelRiesgo: 'III',
    sector: 'Transporte',
    peligrosPrioritarios: ['SEG-002', 'PSI-001', 'PSI-004', 'BIO-MEC-002', 'FIS-003'],
    peligrosEspecificos: [
      {
        codigo: 'TPAS-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por tráfico y pasajeros',
        descripcion: 'Presión por cumplir horarios, tráfico, pasajeros conflictivos',
        riesgoPotencial: 'Estrés crónico, fatiga',
        efectosPosibles: 'Hipertensión, ansiedad, agotamiento',
        medidasControl: ['Jornadas reguladas', 'Capacitación manejo de conflictos', 'Apoyo psicológico', 'Pausas']
      },
      {
        codigo: 'TPAS-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Agresiones de pasajeros',
        descripcion: 'Violencia verbal y física por parte de usuarios',
        riesgoPotencial: 'Lesiones, trauma psicológico',
        efectosPosibles: 'Golpes, heridas, estrés postraumático',
        medidasControl: ['Cámaras de seguridad', 'Botón de pánico', 'Protocolo de emergencias', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-1565-2014', norma: 'Resolución 1565/2014', descripcion: 'PESV', obligatorio: true }
    ],
    eppRecomendado: ['Cinturón de seguridad', 'Uniforme visible'],
    capacitacionesObligatorias: ['PESV', 'Conducción defensiva', 'Primeros auxilios', 'Manejo de conflictos']
  },

  {
    codigoCIIU: '5111',
    descripcionCIIU: 'Transporte aéreo de pasajeros',
    nivelRiesgo: 'IV',
    sector: 'Transporte',
    peligrosPrioritarios: ['FIS-006', 'FIS-001', 'PSI-004', 'BIO-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'AERO-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a radiación cósmica',
        descripcion: 'Radiación ionizante a gran altitud para tripulaciones',
        riesgoPotencial: 'Efectos acumulativos de radiación',
        efectosPosibles: 'Mayor riesgo de cáncer, cataratas',
        medidasControl: ['Monitoreo de dosis', 'Límite de horas de vuelo', 'Exámenes médicos', 'Rotación de rutas']
      },
      {
        codigo: 'AERO-002',
        clasificacion: 'fisico',
        peligro: 'Ruido de motores en pista',
        descripcion: 'Exposición a ruido >140 dB cerca de aeronaves',
        riesgoPotencial: 'Pérdida auditiva inmediata',
        efectosPosibles: 'Trauma acústico, hipoacusia permanente',
        medidasControl: ['Doble protección auditiva', 'Comunicación por señales', 'Distancia de seguridad', 'Audiometrías']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RAC', norma: 'Reglamentos Aeronáuticos de Colombia', descripcion: 'Normativa aeronáutica', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva doble', 'Chaleco reflectivo', 'Gafas de protección', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Seguridad aeroportuaria', 'Primeros auxilios', 'Emergencias en vuelo', 'Mercancías peligrosas']
  },

  {
    codigoCIIU: '5210',
    descripcionCIIU: 'Almacenamiento y depósito',
    nivelRiesgo: 'III',
    sector: 'Transporte',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-005', 'SEG-002', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'ALMAC-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caída de estanterías y mercancía',
        descripcion: 'Colapso de racks por sobrecarga o impacto de montacargas',
        riesgoPotencial: 'Aplastamiento',
        efectosPosibles: 'Fracturas, contusiones graves, muerte',
        medidasControl: ['Inspección de racks', 'Límites de carga', 'Protectores de columnas', 'Capacitación operadores']
      },
      {
        codigo: 'ALMAC-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atropellamiento por montacargas',
        descripcion: 'Tránsito de equipos de carga en pasillos',
        riesgoPotencial: 'Atropellamiento',
        efectosPosibles: 'Fracturas, lesiones graves',
        medidasControl: ['Señalización de pasillos', 'Alarmas en montacargas', 'Velocidad limitada', 'Espejos en esquinas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Chaleco reflectivo', 'Botas de seguridad', 'Guantes'],
    capacitacionesObligatorias: ['Operación de montacargas', 'Almacenamiento seguro', 'Manejo de cargas', 'Primeros auxilios']
  },

  // ==================== SECCIÓN I: HOTELERÍA ====================
  {
    codigoCIIU: '5511',
    descripcionCIIU: 'Alojamiento en hoteles',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-003', 'QUI-003', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'HOT-001',
        clasificacion: 'biomecanico',
        peligro: 'Posturas forzadas en limpieza de habitaciones',
        descripcion: 'Agacharse, estirarse para limpiar baños, tender camas',
        riesgoPotencial: 'Trastornos musculoesqueléticos',
        efectosPosibles: 'Lumbalgias, tendinitis de hombro, síndrome del manguito rotador',
        medidasControl: ['Herramientas ergonómicas', 'Rotación de tareas', 'Pausas', 'Capacitación postural']
      },
      {
        codigo: 'HOT-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a productos de limpieza',
        descripcion: 'Uso de desinfectantes, blanqueadores, desengrasantes',
        riesgoPotencial: 'Irritación y sensibilización',
        efectosPosibles: 'Dermatitis, irritación respiratoria, asma',
        medidasControl: ['Guantes de nitrilo', 'Ventilación', 'Productos menos tóxicos', 'No mezclar productos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Calzado antideslizante', 'Uniforme', 'Mascarilla para productos fuertes'],
    capacitacionesObligatorias: ['Ergonomía', 'Manejo de químicos', 'Servicio al cliente', 'Emergencias']
  },

  // ==================== SECCIÓN J: INFORMACIÓN Y COMUNICACIONES ====================
  {
    codigoCIIU: '6110',
    descripcionCIIU: 'Actividades de telecomunicaciones alámbricas',
    nivelRiesgo: 'III',
    sector: 'Telecomunicaciones',
    peligrosPrioritarios: ['SEG-001', 'SEG-004', 'FIS-005', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'TELCO-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en postes y torres de telecomunicaciones',
        descripcion: 'Instalación y mantenimiento de antenas y cables en altura',
        riesgoPotencial: 'Caídas de altura, electrocución',
        efectosPosibles: 'Fracturas, traumatismos, muerte',
        medidasControl: ['Arnés certificado', 'Línea de vida', 'Verificación de estructuras', 'Trabajo en equipo']
      },
      {
        codigo: 'TELCO-002',
        clasificacion: 'fisico',
        peligro: 'Exposición a radiofrecuencias',
        descripcion: 'Trabajo cerca de antenas transmisoras activas',
        riesgoPotencial: 'Efectos térmicos de RF',
        efectosPosibles: 'Quemaduras internas, efectos en ojos',
        medidasControl: ['Distancias de seguridad', 'Medición de RF', 'Apagado de antenas para trabajo', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Casco con barboquejo', 'Arnés de cuerpo entero', 'Guantes dieléctricos', 'Botas de seguridad', 'Gafas'],
    capacitacionesObligatorias: ['Trabajo en alturas', 'Riesgo eléctrico', 'Radiofrecuencias', 'Rescate en alturas']
  },

  // ==================== SECCIÓN K: FINANZAS Y SEGUROS ====================
  {
    codigoCIIU: '6411',
    descripcionCIIU: 'Banca central',
    nivelRiesgo: 'I',
    sector: 'Finanzas',
    peligrosPrioritarios: ['PSI-001', 'PSI-003', 'BIO-MEC-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'BANC-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por responsabilidad financiera',
        descripcion: 'Manejo de grandes sumas, decisiones de alto impacto',
        riesgoPotencial: 'Burnout, ansiedad',
        efectosPosibles: 'Ansiedad, depresión, insomnio, hipertensión',
        medidasControl: ['Gestión de carga laboral', 'Apoyo psicológico', 'Vacaciones obligatorias', 'Ambiente laboral saludable']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Mobiliario ergonómico', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Ergonomía de oficina', 'Manejo del estrés', 'Pausas activas', 'Higiene visual']
  },


  // ==================== SECCIÓN M: SERVICIOS PROFESIONALES ====================
  {
    codigoCIIU: '6910',
    descripcionCIIU: 'Actividades jurídicas',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'PSI-003', 'BIO-MEC-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'ABOG-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por casos judiciales',
        descripcion: 'Presión por plazos procesales, casos complejos',
        riesgoPotencial: 'Burnout, ansiedad',
        efectosPosibles: 'Agotamiento, ansiedad, trastornos del sueño',
        medidasControl: ['Gestión de casos', 'Límite de carga', 'Apoyo entre colegas', 'Vacaciones']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Mobiliario ergonómico'],
    capacitacionesObligatorias: ['Manejo del estrés', 'Ergonomía', 'Pausas activas']
  },


  // ==================== SECCIÓN N: SERVICIOS ADMINISTRATIVOS ====================
  {
    codigoCIIU: '7810',
    descripcionCIIU: 'Actividades de agencias de empleo',
    nivelRiesgo: 'I',
    sector: 'Servicios administrativos',
    peligrosPrioritarios: ['PSI-001', 'PSI-003', 'BIO-MEC-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'RH-001',
        clasificacion: 'psicosocial',
        peligro: 'Carga emocional por atención a desempleados',
        descripcion: 'Interacción con personas en situación vulnerable',
        riesgoPotencial: 'Fatiga por compasión',
        efectosPosibles: 'Agotamiento emocional, estrés vicario',
        medidasControl: ['Rotación de funciones', 'Apoyo psicológico', 'Límite de atenciones diarias']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Mobiliario ergonómico'],
    capacitacionesObligatorias: ['Atención al público', 'Manejo del estrés', 'Ergonomía']
  },

  {
    codigoCIIU: '8010',
    descripcionCIIU: 'Actividades de seguridad privada',
    nivelRiesgo: 'IV',
    sector: 'Servicios administrativos',
    peligrosPrioritarios: ['SEG-002', 'PSI-001', 'PSI-004', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'VIG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Agresión física durante servicio',
        descripcion: 'Enfrentamiento con delincuentes o personas violentas',
        riesgoPotencial: 'Lesiones por violencia',
        efectosPosibles: 'Heridas, contusiones, trauma psicológico, muerte',
        medidasControl: ['Capacitación en defensa', 'Equipos de comunicación', 'Trabajo en equipo', 'Apoyo policial']
      },
      {
        codigo: 'VIG-002',
        clasificacion: 'psicosocial',
        peligro: 'Turnos nocturnos y rotativos',
        descripcion: 'Trabajo nocturno que altera ciclo circadiano',
        riesgoPotencial: 'Trastornos del sueño',
        efectosPosibles: 'Insomnio, fatiga crónica, enfermedades cardiovasculares',
        medidasControl: ['Rotación planificada', 'Exámenes médicos periódicos', 'Pausas nocturnas', 'Alimentación adecuada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-356-1994', norma: 'Decreto 356/1994', descripcion: 'Estatuto de vigilancia', obligatorio: true }
    ],
    eppRecomendado: ['Uniforme visible', 'Chaleco antibalas (según riesgo)', 'Calzado de seguridad', 'Radio comunicación'],
    capacitacionesObligatorias: ['Defensa personal', 'Primeros auxilios', 'Manejo de conflictos', 'Procedimientos de seguridad']
  },

  // ==================== SECCIÓN P: EDUCACIÓN ====================
  {
    codigoCIIU: '8530',
    descripcionCIIU: 'Establecimientos que combinan diferentes niveles de educación',
    nivelRiesgo: 'I',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-002', 'BIO-001'],
    peligrosEspecificos: [
      {
        codigo: 'EDU-001',
        clasificacion: 'psicosocial',
        peligro: 'Síndrome de burnout docente',
        descripcion: 'Agotamiento por carga académica, estudiantes difíciles, presión administrativa',
        riesgoPotencial: 'Burnout, depresión',
        efectosPosibles: 'Agotamiento emocional, despersonalización, baja realización',
        medidasControl: ['Número adecuado de estudiantes', 'Apoyo administrativo', 'Capacitación', 'Pausas']
      },
      {
        codigo: 'EDU-002',
        clasificacion: 'biomecanico',
        peligro: 'Disfonía por uso excesivo de voz',
        descripcion: 'Hablar en voz alta durante toda la jornada',
        riesgoPotencial: 'Patología vocal ocupacional',
        efectosPosibles: 'Nódulos vocales, disfonía crónica, afonía',
        medidasControl: ['Amplificación de voz', 'Técnicas vocales', 'Hidratación', 'Pausas de voz']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Micrófono/amplificador', 'Mobiliario ergonómico'],
    capacitacionesObligatorias: ['Manejo del estrés', 'Técnicas vocales', 'Ergonomía', 'Primeros auxilios']
  },

  // ==================== SECCIÓN Q: SERVICIOS SOCIALES Y SALUD ====================
  {
    codigoCIIU: '8710',
    descripcionCIIU: 'Actividades de atención residencial a personas mayores',
    nivelRiesgo: 'II',
    sector: 'Servicios sociales',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-MEC-003', 'PSI-001', 'PSI-002'],
    peligrosEspecificos: [
      {
        codigo: 'GERONT-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de pacientes',
        descripcion: 'Levantamiento y transferencia de adultos mayores dependientes',
        riesgoPotencial: 'Lesiones de espalda',
        efectosPosibles: 'Lumbalgias, hernias, lesiones de hombro',
        medidasControl: ['Grúas de transferencia', 'Técnicas de movilización', 'Trabajo en equipo', 'Capacitación']
      },
      {
        codigo: 'GERONT-002',
        clasificacion: 'psicosocial',
        peligro: 'Fatiga por compasión',
        descripcion: 'Cuidado continuo de personas vulnerables, manejo de duelo',
        riesgoPotencial: 'Agotamiento emocional',
        efectosPosibles: 'Burnout, depresión, estrés vicario',
        medidasControl: ['Apoyo psicológico', 'Grupos de soporte', 'Rotación', 'Autocuidado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación servicios', obligatorio: true }
    ],
    eppRecomendado: ['Guantes desechables', 'Bata', 'Calzado cerrado antideslizante'],
    capacitacionesObligatorias: ['Movilización de pacientes', 'Bioseguridad', 'Primeros auxilios', 'Autocuidado emocional']
  },

  // ==================== SECCIÓN S: OTROS SERVICIOS ====================
  {
    codigoCIIU: '9521',
    descripcionCIIU: 'Mantenimiento y reparación de aparatos electrónicos de consumo',
    nivelRiesgo: 'II',
    sector: 'Otros servicios',
    peligrosPrioritarios: ['SEG-004', 'BIO-MEC-001', 'QUI-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'ELEC-REP-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Descarga eléctrica en reparación',
        descripcion: 'Contacto con condensadores cargados o circuitos energizados',
        riesgoPotencial: 'Electrocución',
        efectosPosibles: 'Quemaduras, paro cardíaco',
        medidasControl: ['Descarga de condensadores', 'Medidor de voltaje', 'Aislamiento', 'Capacitación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Pulsera antiestática', 'Gafas de aumento', 'Guantes aislantes'],
    capacitacionesObligatorias: ['Riesgo eléctrico', 'Manejo de residuos electrónicos', 'Ergonomía']
  },

  {
    codigoCIIU: '9601',
    descripcionCIIU: 'Lavado y limpieza de prendas de tela y de piel',
    nivelRiesgo: 'II',
    sector: 'Otros servicios',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'FIS-004', 'BIO-MEC-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'LAVAND-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a percloroetileno (lavado en seco)',
        descripcion: 'Inhalación de solventes en limpieza en seco',
        riesgoPotencial: 'Intoxicación, daño hepático',
        efectosPosibles: 'Mareos, daño hepático, neurológico, cáncer',
        medidasControl: ['Ventilación con extracción', 'Máquinas cerradas', 'Respirador con filtros orgánicos', 'Monitoreo ambiental']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Respirador con filtros orgánicos', 'Delantal', 'Gafas'],
    capacitacionesObligatorias: ['Manejo de solventes', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9603',
    descripcionCIIU: 'Pompas fúnebres y actividades relacionadas',
    nivelRiesgo: 'III',
    sector: 'Otros servicios',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-004', 'QUI-003', 'PSI-001', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'FUN-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a cadáveres y fluidos',
        descripcion: 'Manipulación de cuerpos con enfermedades infecciosas',
        riesgoPotencial: 'Infección por patógenos',
        efectosPosibles: 'Tuberculosis, hepatitis, HIV (postmortem)',
        medidasControl: ['EPP completo', 'Vacunación', 'Desinfección', 'Protocolo de bioseguridad']
      },
      {
        codigo: 'FUN-002',
        clasificacion: 'quimico',
        peligro: 'Exposición a formaldehído (embalsamamiento)',
        descripcion: 'Uso de formol para preservación de cuerpos',
        riesgoPotencial: 'Cáncer, irritación severa',
        efectosPosibles: 'Cáncer nasofaríngeo, irritación ocular y respiratoria',
        medidasControl: ['Ventilación con extracción', 'Respirador con filtros específicos', 'Sistemas cerrados', 'Límite de exposición']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-5194-2010', norma: 'Resolución 5194/2010', descripcion: 'Bioseguridad', obligatorio: true }
    ],
    eppRecomendado: ['Traje impermeable', 'Guantes de nitrilo largos', 'Gafas herméticas', 'Respirador con filtros formaldehído', 'Botas impermeables'],
    capacitacionesObligatorias: ['Bioseguridad', 'Manejo de formaldehído', 'Protección respiratoria', 'Primeros auxilios']
  },


  // ==================== SECCIÓN G - COMERCIO ====================

  {
    codigoCIIU: '4512',
    descripcionCIIU: 'Comercio de vehículos automotores usados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'BIO-MEC-003', 'PSI-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'COM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manipulación de repuestos y vehículos',
        descripcion: 'Movimiento y posicionamiento de vehículos, carga de llantas y partes pesadas',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, hernias discales, lesiones de hombro',
        medidasControl: ['Equipos de apoyo (gatos, grúas)', 'Capacitación en manejo de cargas', 'Pausas activas', 'Evaluación ergonómica']
      },
      {
        codigo: 'COM-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Presión por metas de ventas',
        descripcion: 'Estrés por cumplimiento de cuotas, trato con clientes difíciles',
        riesgoPotencial: 'Estrés laboral crónico',
        efectosPosibles: 'Ansiedad, burnout, trastornos del sueño',
        medidasControl: ['Programa de gestión del estrés', 'Metas realistas', 'Pausas programadas', 'Canales de comunicación abiertos']
      },
      {
        codigo: 'COM-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caídas al mismo nivel en patio de vehículos',
        descripcion: 'Superficies irregulares, manchas de aceite, obstáculos en el patio',
        riesgoPotencial: 'Traumatismos por caída',
        efectosPosibles: 'Contusiones, fracturas, esguinces',
        medidasControl: ['Señalización de zonas húmedas', 'Calzado antideslizante', 'Orden y aseo permanente', 'Iluminación adecuada del patio']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'Sistema de Gestión de Seguridad y Salud en el Trabajo', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos del SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado de seguridad antideslizante', 'Guantes de trabajo', 'Chaleco reflectivo en patio'],
    capacitacionesObligatorias: ['Manejo manual de cargas', 'Pausas activas', 'Prevención de riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4530',
    descripcionCIIU: 'Comercio de partes, piezas (autopartes) y accesorios para vehículos',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-001', 'QUI-001', 'SEG-002', 'FIS-001', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'AUT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a aceites y fluidos automotrices',
        descripcion: 'Manipulación de aceites de motor, líquidos de freno, refrigerantes y combustibles en almacén',
        riesgoPotencial: 'Dermatitis por contacto, irritación respiratoria',
        efectosPosibles: 'Dermatitis crónica, irritación de vías respiratorias superiores',
        medidasControl: ['Guantes de nitrilo', 'Ventilación natural o forzada', 'Hojas de seguridad (SDS) disponibles', 'No comer en área de almacén']
      },
      {
        codigo: 'AUT-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de piezas pesadas en bodega',
        descripcion: 'Carga y descarga de motores, transmisiones, llantas y baterías de vehículo',
        riesgoPotencial: 'Lesiones osteomusculares',
        efectosPosibles: 'Lumbalgias, lesiones de columna, hernias',
        medidasControl: ['Carros porta-piezas', 'Límite de carga manual (25 kg hombres, 12.5 kg mujeres según ICONTEC)', 'Capacitación en biomecánica']
      },
      {
        codigo: 'AUT-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caída de estanterías y materiales en bodega',
        descripcion: 'Piezas almacenadas en altura sin anclaje adecuado, estantes sobrecargados',
        riesgoPotencial: 'Traumatismos por impacto de objetos',
        efectosPosibles: 'Contusiones, fracturas, traumatismo craneoencefálico',
        medidasControl: ['Anclaje de estanterías a la pared', 'Casco en bodega', 'Límite de carga por estante', 'Inspección periódica de estructuras']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial - almacenamiento', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Calzado con puntera de acero', 'Casco en bodega de altura', 'Faja lumbar para carga pesada'],
    capacitacionesObligatorias: ['Manejo manual de cargas', 'Almacenamiento seguro', 'Manejo de sustancias químicas (SDS)', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4541',
    descripcionCIIU: 'Comercio de motocicletas y de sus partes, piezas y accesorios',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'MOTO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Posturas forzadas en exhibición y atención al cliente',
        descripcion: 'Bipedestación prolongada, carga de motocicletas y accesorios en sala',
        riesgoPotencial: 'Fatiga muscular y lesiones osteomusculares',
        efectosPosibles: 'Dolor lumbar, várices, fatiga de miembros inferiores',
        medidasControl: ['Calzado ergonómico', 'Tapetes antifatiga', 'Rotación de funciones', 'Pausas activas']
      },
      {
        codigo: 'MOTO-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Atención al cliente y presión comercial',
        descripcion: 'Contacto directo con clientes, negociaciones y presión por ventas',
        riesgoPotencial: 'Estrés y fatiga emocional',
        efectosPosibles: 'Burnout, ansiedad, ausentismo',
        medidasControl: ['Capacitación en manejo de clientes difíciles', 'Rotación en atención', 'Clima laboral positivo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Guantes de trabajo para carga de motos'],
    capacitacionesObligatorias: ['Pausas activas', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4542',
    descripcionCIIU: 'Mantenimiento y reparación de motocicletas y de sus partes y piezas',
    nivelRiesgo: 'III',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'SEG-004', 'SEG-005', 'BIO-MEC-002', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPMOTO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a combustibles, aceites y solventes en taller',
        descripcion: 'Manipulación directa de gasolina, aceite de motor, desengrasantes y pinturas',
        riesgoPotencial: 'Intoxicación, dermatitis, incendio',
        efectosPosibles: 'Dermatitis crónica, intoxicación aguda, quemaduras',
        medidasControl: ['Guantes de nitrilo resistentes a hidrocarburos', 'Ventilación forzada del taller', 'Extintor tipo ABC', 'SDS disponibles']
      },
      {
        codigo: 'REPMOTO-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Contacto con herramientas y piezas calientes',
        descripcion: 'Uso de herramientas manuales, motores calientes, tubo de escape',
        riesgoPotencial: 'Quemaduras y cortes',
        efectosPosibles: 'Quemaduras de 1° y 2° grado, laceraciones',
        medidasControl: ['Guantes térmicos', 'Tiempo de enfriamiento antes de intervención', 'Señalización de superficies calientes']
      },
      {
        codigo: 'REPMOTO-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido de motores en pruebas de funcionamiento',
        descripcion: 'Pruebas de arranque y aceleración en espacio cerrado del taller',
        riesgoPotencial: 'Hipoacusia laboral',
        efectosPosibles: 'Pérdida auditiva inducida por ruido, acúfenos',
        medidasControl: ['Protección auditiva (tapones o copa)', 'Pruebas en zona exterior o ventilada', 'Audiometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo resistentes', 'Protección auditiva', 'Gafas de seguridad', 'Delantal de cuero', 'Calzado con puntera de acero'],
    capacitacionesObligatorias: ['Manejo seguro de sustancias químicas', 'Prevención de incendios', 'Primeros auxilios', 'Uso correcto de EPP']
  },

  {
    codigoCIIU: '4610',
    descripcionCIIU: 'Comercio al por mayor a cambio de una retribución o por contrata',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['PSI-001', 'PSI-003', 'BIO-MEC-002', 'FIS-002', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'AGT-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Carga de trabajo y presión por resultados comerciales',
        descripcion: 'Alta exigencia en gestión de pedidos, negociaciones y cumplimiento de metas',
        riesgoPotencial: 'Estrés laboral y burnout',
        efectosPosibles: 'Ansiedad, agotamiento emocional, trastornos cardiovasculares',
        medidasControl: ['Programa de gestión de riesgo psicosocial (Res. 2646/2008)', 'Distribución equitativa de carga', 'Pausas programadas']
      },
      {
        codigo: 'AGT-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo prolongado frente a pantalla (PVD)',
        descripcion: 'Uso intensivo de computador para gestión de pedidos, facturación y comunicaciones',
        riesgoPotencial: 'Síndrome de fatiga visual y lesiones musculoesqueléticas',
        efectosPosibles: 'Cefalea, fatiga visual, dolor cervical y lumbar, síndrome del túnel carpiano',
        medidasControl: ['Puesto ergonómico regulable', 'Regla 20-20-20 para fatiga visual', 'Pausas activas cada hora', 'Evaluación ergonómica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Reposapiés', 'Filtro de pantalla anti-reflejo'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4620',
    descripcionCIIU: 'Comercio al por mayor de materias primas agropecuarias',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-004', 'BIO-001', 'BIO-002', 'QUI-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'AGRO-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con materias primas de origen animal y vegetal',
        descripcion: 'Manipulación de granos, forrajes, semillas y productos de origen animal con presencia de hongos, bacterias o parásitos',
        riesgoPotencial: 'Enfermedades infecciosas y alérgicas',
        efectosPosibles: 'Alergias respiratorias, micotoxicosis, parasitosis',
        medidasControl: ['Mascarilla para polvos orgánicos (N95)', 'Guantes de nitrilo', 'Rotación de inventarios (FIFO)', 'Control de humedad en bodega']
      },
      {
        codigo: 'AGRO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a plaguicidas y agroquímicos almacenados',
        descripcion: 'Almacenamiento de pesticidas, fertilizantes y agroquímicos en bodega',
        riesgoPotencial: 'Intoxicación aguda o crónica',
        efectosPosibles: 'Intoxicación, daño hepático/renal, cáncer (exposición crónica)',
        medidasControl: ['Bodega separada para agroquímicos', 'EPP específico (overol, guantes, mascarilla)', 'SDS disponibles', 'Capacitación en manejo de plaguicidas']
      },
      {
        codigo: 'AGRO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Carga y descarga de bultos pesados',
        descripcion: 'Manejo de costales, pacas y contenedores de materias primas agrícolas',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, hernias, lesiones de columna',
        medidasControl: ['Montacargas o carretillas hidráulicas', 'Límite de peso manual', 'Pausas activas', 'Faja lumbar para trabajos de alta demanda']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true },
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla N95', 'Guantes de nitrilo o cuero', 'Botas de caucho', 'Overol de trabajo', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo seguro de plaguicidas', 'Manejo de cargas', 'Bioseguridad básica', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4631',
    descripcionCIIU: 'Comercio al por mayor de productos alimenticios',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-003', 'BIO-MEC-003', 'FIS-004', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'ALIM-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manipulación de alimentos con riesgo microbiológico',
        descripcion: 'Contacto con alimentos crudos, productos cárnicos, lácteos o de temporada con contaminación biológica',
        riesgoPotencial: 'Enfermedades transmitidas por alimentos (ETA)',
        efectosPosibles: 'Gastroenteritis, salmonelosis, hepatitis A, listeriosis',
        medidasControl: ['BPM según Resolución 2674/2013', 'Lavado de manos frecuente', 'Carné de manipulación de alimentos', 'Temperatura controlada en bodega']
      },
      {
        codigo: 'ALIM-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a temperaturas extremas (frío en cuartos fríos)',
        descripcion: 'Trabajo en cámaras de refrigeración y congelación para conservación de alimentos',
        riesgoPotencial: 'Hipotermia, congelamiento de extremidades',
        efectosPosibles: 'Hipotermia, enfermedades respiratorias, lesiones por frío',
        medidasControl: ['Ropa térmica de trabajo', 'Límite de tiempo de permanencia en cámara fría', 'Sistema de alarma dentro de cámara', 'Rotación de personal']
      },
      {
        codigo: 'ALIM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Carga y descarga de mercancía alimentaria pesada',
        descripcion: 'Manejo de cajas, estibas y palés de alimentos en bodega y cargue de camiones',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, hernias, lesiones de hombro',
        medidasControl: ['Montacargas y estibadoras eléctricas', 'Capacitación en manejo de cargas', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'Buenas Prácticas de Manufactura para alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de látex o nitrilo', 'Delantal impermeable', 'Botas de caucho', 'Ropa térmica para cuartos fríos', 'Gorra o cofia'],
    capacitacionesObligatorias: ['Manipulación higiénica de alimentos', 'BPM', 'Manejo de cargas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4632',
    descripcionCIIU: 'Comercio al por mayor de bebidas y tabaco',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-004', 'SEG-006', 'QUI-001', 'SEG-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'BEB-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de envases pesados (cajas de vidrio, barriles)',
        descripcion: 'Carga y descarga de cajas de bebidas en vidrio, barriles de cerveza y bidones',
        riesgoPotencial: 'Lesiones musculoesqueléticas y accidentes',
        efectosPosibles: 'Hernias, lumbalgias, cortes por rotura de vidrio',
        medidasControl: ['Guantes anticorte', 'Calzado con puntera', 'Equipos de izado', 'Límites de peso manual']
      },
      {
        codigo: 'BEB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a gases de fermentación y CO2',
        descripcion: 'Emanación de CO2 en bodegas cerradas de almacenamiento de bebidas fermentadas',
        riesgoPotencial: 'Asfixia por desplazamiento de oxígeno',
        efectosPosibles: 'Mareos, pérdida de conciencia, asfixia',
        medidasControl: ['Ventilación forzada de bodegas', 'Detector de CO2', 'Nunca entrar solo a bodega cerrada', 'Capacitación en espacios confinados']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte', 'Calzado con puntera de acero', 'Faja lumbar', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manejo manual de cargas', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4641',
    descripcionCIIU: 'Comercio al por mayor de productos textiles, productos confeccionados para uso doméstico',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-002', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'TEX-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de fibras textiles',
        descripcion: 'Partículas de algodón, lana sintética, poliéster en almacenamiento y manipulación',
        riesgoPotencial: 'Afecciones respiratorias',
        efectosPosibles: 'Rinitis, asma ocupacional, bisinosis (fibras naturales)',
        medidasControl: ['Mascarilla para partículas', 'Ventilación de bodegas', 'Rotación de personal', 'Espirometrías periódicas']
      },
      {
        codigo: 'TEX-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de fardos y rollos de tela',
        descripcion: 'Carga de rollos de tela de gran peso y volumen en bodega',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, hernias discales',
        medidasControl: ['Carros porta-rollos', 'Límite de peso manual', 'Faja lumbar para cargas altas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para partículas', 'Guantes de trabajo', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Higiene postural', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4642',
    descripcionCIIU: 'Comercio al por mayor de calzado',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'CAL-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Bipedestación y manipulación de cajas en bodega',
        descripcion: 'Permanencia de pie prolongada en sala de ventas y carga de cajas en bodega',
        riesgoPotencial: 'Fatiga musculoesquelética',
        efectosPosibles: 'Dolor de pies, várices, lumbalgia',
        medidasControl: ['Tapetes antifatiga', 'Calzado ergonómico', 'Pausas activas', 'Rotación de funciones']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga en caja'],
    capacitacionesObligatorias: ['Pausas activas', 'Higiene postural', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4643',
    descripcionCIIU: 'Comercio al por mayor de aparatos y equipo de uso doméstico',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-002', 'SEG-004', 'BIO-MEC-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'DOM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de electrodomésticos pesados',
        descripcion: 'Carga de neveras, lavadoras, estufas y equipos de gran volumen en bodega',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Hernias, lumbalgias, lesiones de hombro',
        medidasControl: ['Carretillas y dolly para equipos', 'Trabajo en equipo para cargas pesadas', 'Capacitación en biomecánica']
      },
      {
        codigo: 'DOM-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en demostración de equipos',
        descripcion: 'Conexión y demostración de electrodomésticos en sala de ventas',
        riesgoPotencial: 'Contacto eléctrico directo o indirecto',
        efectosPosibles: 'Quemaduras eléctricas, paro cardiorrespiratorio',
        medidasControl: ['Instalaciones eléctricas certificadas', 'No manipular equipos dañados', 'Tomacorrientes con polo a tierra']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Calzado con puntera de acero', 'Faja lumbar para carga pesada'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Riesgo eléctrico básico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4644',
    descripcionCIIU: 'Comercio al por mayor de productos farmacéuticos, medicinales, cosméticos y de tocador',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'FARM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a medicamentos y sustancias activas',
        descripcion: 'Manipulación de fármacos, antibióticos, citostáticos y productos cosméticos con ingredientes activos',
        riesgoPotencial: 'Sensibilización, alergia ocupacional',
        efectosPosibles: 'Dermatitis alérgica, asma ocupacional, reacciones adversas',
        medidasControl: ['Guantes de nitrilo', 'Mascarilla para partículas', 'No manipular medicamentos dañados', 'Higiene de manos']
      },
      {
        codigo: 'FARM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en bodega con estanterías altas',
        descripcion: 'Alistamiento de pedidos, subida a escaleras y uso de montacargas manuales',
        riesgoPotencial: 'Caída en altura y lesiones musculoesqueléticas',
        efectosPosibles: 'Caídas, lesiones de columna, lesiones de tobillo',
        medidasControl: ['Escaleras certificadas con barandas', 'Nunca subirse a estantes', 'Equipos de picking adecuados']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-1403-2007', norma: 'Resolución 1403/2007', descripcion: 'Modelo de Gestión del Servicio Farmacéutico', obligatorio: false },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla para partículas', 'Calzado de seguridad antideslizante'],
    capacitacionesObligatorias: ['Manejo de medicamentos y sustancias activas', 'Higiene postural', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4645',
    descripcionCIIU: 'Comercio al por mayor de productos de perfumería, artículos de uso personal y de limpieza',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'BIO-MEC-001', 'SEG-006', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'PERF-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Vapores de perfumes, alcoholes y solventes',
        descripcion: 'Inhalación de alcohol isopropílico, fragancias concentradas y solventes en bodega y sala de ventas',
        riesgoPotencial: 'Irritación de vías respiratorias y alergias',
        efectosPosibles: 'Cefalea, irritación nasal, sensibilización alérgica',
        medidasControl: ['Ventilación adecuada de bodega', 'No almacenar junto a fuentes de calor', 'Rotación frecuente de personal expuesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla para vapores orgánicos en bodega'],
    capacitacionesObligatorias: ['Manejo seguro de productos químicos', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4649',
    descripcionCIIU: 'Comercio al por mayor de otros utensilios domésticos n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-002', 'BIO-MEC-001', 'FIS-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'UTEN-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de utensilios y menaje en bodega',
        descripcion: 'Carga, organización y despacho de cajas con artículos de cocina, cristalería y decoración',
        riesgoPotencial: 'Lesiones musculoesqueléticas y cortes',
        efectosPosibles: 'Lumbalgia, hernias, laceraciones',
        medidasControl: ['Guantes anticorte para cristalería', 'Carros de carga', 'Correcta técnica de levantamiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte', 'Calzado de seguridad', 'Faja lumbar'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4651',
    descripcionCIIU: 'Comercio al por mayor de computadores, equipo periférico y programas de informática',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'FIS-002', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'TEC-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo prolongado frente a pantallas',
        descripcion: 'Demostración y asesoría de equipos con uso intensivo de PVD',
        riesgoPotencial: 'Fatiga visual y lesiones musculoesqueléticas',
        efectosPosibles: 'Síndrome de fatiga visual, dolor cervical, síndrome del túnel carpiano',
        medidasControl: ['Pausas de 10 min cada hora', 'Regla 20-20-20', 'Silla ergonómica', 'Iluminación sin reflejos']
      },
      {
        codigo: 'TEC-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en demostración de equipos',
        descripcion: 'Conexión de múltiples equipos electrónicos y regletas en sala de ventas',
        riesgoPotencial: 'Sobrecarga eléctrica, cortocircuito',
        efectosPosibles: 'Incendio, electrocución',
        medidasControl: ['No sobrecargar regletas', 'Mantenimiento de instalaciones eléctricas', 'Extintor tipo BC en sala']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Filtro antireflex en monitores de demostración'],
    capacitacionesObligatorias: ['Ergonomía en oficina y ventas', 'Riesgo eléctrico básico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4652',
    descripcionCIIU: 'Comercio al por mayor de equipo, partes y piezas electrónicos y de telecomunicaciones',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-001', 'SEG-004', 'QUI-001', 'PSI-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'ELEC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Baterías y componentes electrónicos con sustancias peligrosas',
        descripcion: 'Manejo de baterías de litio, plomo-ácido y componentes con metales pesados (plomo, mercurio)',
        riesgoPotencial: 'Intoxicación por metales pesados',
        efectosPosibles: 'Saturnismo, neurotoxicidad, irritación cutánea',
        medidasControl: ['Guantes de nitrilo', 'No almacenar baterías dañadas', 'Gestión de residuos RAEE según Ley 1672/2013']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-1672-2013', norma: 'Ley 1672/2013', descripcion: 'Gestión de Residuos de Aparatos Eléctricos y Electrónicos (RAEE)', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Gestión de residuos RAEE', 'Manejo de baterías', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4653',
    descripcionCIIU: 'Comercio al por mayor de maquinaria y equipo agropecuarios',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-005', 'SEG-002', 'QUI-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'MAQAGRO-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Maquinaria agrícola sin protecciones en demostración',
        descripcion: 'Manejo y demostración de tractores, guadañas, fumigadoras y maquinaria de labranza',
        riesgoPotencial: 'Atrapamiento, cortes y golpes por maquinaria',
        efectosPosibles: 'Amputaciones, cortes graves, contusiones',
        medidasControl: ['Guardas de seguridad en maquinaria', 'Solo personal capacitado opera maquinaria', 'Área de demostración delimitada', 'EPP completo']
      },
      {
        codigo: 'MAQAGRO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de implementos agrícolas pesados',
        descripcion: 'Carga y descarga de maquinaria, implementos y repuestos pesados',
        riesgoPotencial: 'Lesiones osteomusculares',
        efectosPosibles: 'Hernias, lesiones de columna',
        medidasControl: ['Equipos de izado (grúas, montacargas)', 'Trabajo en equipo', 'Capacitación en biomecánica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Guantes de cuero', 'Botas con puntera', 'Gafas de seguridad', 'Protección auditiva'],
    capacitacionesObligatorias: ['Manejo seguro de maquinaria', 'Manejo de cargas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4659',
    descripcionCIIU: 'Comercio al por mayor de otros tipos de maquinaria y equipo n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-005', 'SEG-004', 'QUI-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'MAQGEN-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en demostración de maquinaria industrial',
        descripcion: 'Operación de maquinaria de diverso tipo para demostración a clientes',
        riesgoPotencial: 'Atrapamiento y cortes',
        efectosPosibles: 'Amputaciones, cortes, fracturas',
        medidasControl: ['Guardas de seguridad activas', 'Solo personal autorizado opera la maquinaria', 'Señalización de área de demostración', 'EPP específico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Guantes de cuero', 'Botas con puntera', 'Gafas de seguridad', 'Protección auditiva'],
    capacitacionesObligatorias: ['Manejo seguro de maquinaria', 'Inspección de equipos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4661',
    descripcionCIIU: 'Comercio al por mayor de combustibles sólidos, líquidos, gaseosos y productos conexos',
    nivelRiesgo: 'III',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'SEG-006', 'QUI-004', 'BIO-MEC-003', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'COMB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a vapores de hidrocarburos',
        descripcion: 'Inhalación de vapores de gasolina, ACPM, gas propano y derivados del petróleo durante carga y descarga',
        riesgoPotencial: 'Intoxicación aguda y crónica, incendio',
        efectosPosibles: 'Mareos, narcosis, daño hepático/renal, leucemia (benceno)',
        medidasControl: ['Respirador para vapores orgánicos', 'Equipo antiestático', 'No fumar en área de operación', 'Detector de gases']
      },
      {
        codigo: 'COMB-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo de incendio y explosión',
        descripcion: 'Almacenamiento y despacho de combustibles líquidos y gaseosos',
        riesgoPotencial: 'Incendio o explosión',
        efectosPosibles: 'Quemaduras graves, lesiones por onda expansiva, muerte',
        medidasControl: ['Plan de emergencias específico', 'Sistemas de puesta a tierra', 'Extinción automática', 'Prohibición de fumar y llamas abiertas', 'Equipos antiexplosión']
      },
      {
        codigo: 'COMB-SEG-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo en espacios confinados (tanques y cisternas)',
        descripcion: 'Limpieza y mantenimiento de tanques de almacenamiento',
        riesgoPotencial: 'Asfixia, explosión en espacio confinado',
        efectosPosibles: 'Pérdida de conciencia, quemaduras, muerte',
        medidasControl: ['Permiso de trabajo en espacio confinado', 'Medición de atmósfera antes de entrar', 'Vigía externo', 'Equipo de rescate disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1521-1998', norma: 'Decreto 1521/1998', descripcion: 'Almacenamiento, manejo y transporte de combustibles derivados del petróleo', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Trabajo en espacios confinados', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador para vapores orgánicos', 'Traje antiestático', 'Botas de caucho antiestáticas', 'Guantes resistentes a hidrocarburos', 'Extintor personal'],
    capacitacionesObligatorias: ['Manejo seguro de combustibles', 'Prevención y control de incendios', 'Trabajo en espacios confinados', 'Plan de emergencias', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4662',
    descripcionCIIU: 'Comercio al por mayor de metales y minerales metalíferos',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-004', 'SEG-005', 'QUI-002', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'MET-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de cargas metálicas pesadas',
        descripcion: 'Carga y organización de varillas, láminas, perfiles metálicos y minerales a granel',
        riesgoPotencial: 'Lesiones musculoesqueléticas y accidentes',
        efectosPosibles: 'Hernias, lumbalgias, aplastamiento de extremidades',
        medidasControl: ['Puentes grúa o montacargas', 'Calzado con puntera de acero', 'Guantes de cuero', 'Nunca pasar debajo de cargas suspendidas']
      },
      {
        codigo: 'MET-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes y golpes con materiales metálicos',
        descripcion: 'Manipulación de bordes cortantes en láminas, varillas y perfiles',
        riesgoPotencial: 'Cortes y traumatismos',
        efectosPosibles: 'Laceraciones profundas, amputaciones, contusiones',
        medidasControl: ['Guantes anticorte de alta resistencia', 'Casco de seguridad', 'Gafas de seguridad', 'Uso de herramientas adecuadas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte nivel 5', 'Casco de seguridad', 'Botas con puntera de acero', 'Gafas de seguridad', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Manejo de cargas con equipos mecánicos', 'Uso correcto de EPP', 'Señalización de bodega', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4663',
    descripcionCIIU: 'Comercio al por mayor de materiales de construcción, artículos de ferretería y vidrio',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'QUI-002', 'SEG-001', 'SEG-002', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'FERR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de cemento, arena y materiales de construcción',
        descripcion: 'Manipulación y despacho de cemento, cal, arena, yeso y sílice en bodega',
        riesgoPotencial: 'Enfermedades respiratorias',
        efectosPosibles: 'Silicosis, neumoconiosis, irritación de vías respiratorias',
        medidasControl: ['Mascarilla N95 al manipular polvos', 'Humedecer materiales antes de manipular', 'Ventilación de bodega', 'Espirometrías periódicas']
      },
      {
        codigo: 'FERR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Manejo de vidrio y materiales cortantes',
        descripcion: 'Manipulación y corte de vidrios, cerámica y materiales frágiles',
        riesgoPotencial: 'Cortes graves',
        efectosPosibles: 'Laceraciones profundas, hemorragias',
        medidasControl: ['Guantes anticorte nivel 5', 'Protección ocular', 'Técnica segura de transporte de vidrio', 'Equipo de primeros auxilios visible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla N95', 'Guantes anticorte', 'Gafas de seguridad', 'Calzado con puntera', 'Casco en bodega de altura'],
    capacitacionesObligatorias: ['Manejo de materiales peligrosos (polvo/sílice)', 'Manejo de cargas', 'Uso de EPP', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4664',
    descripcionCIIU: 'Comercio al por mayor de productos químicos básicos, cauchos y plásticos en formas primarias',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'QUI-004', 'SEG-006', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'QUIM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a productos químicos básicos y solventes',
        descripcion: 'Almacenamiento y despacho de ácidos, bases, solventes, resinas y monómeros',
        riesgoPotencial: 'Intoxicación aguda, quemaduras químicas, incendio',
        efectosPosibles: 'Quemaduras, irritación respiratoria, daño orgánico',
        medidasControl: ['Hojas SDS disponibles y actualizadas', 'EPP químico completo', 'Gabinetes de seguridad para líquidos inflamables', 'Duchas de emergencia']
      },
      {
        codigo: 'QUIM-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incompatibilidad de productos químicos almacenados',
        descripcion: 'Almacenamiento de productos incompatibles que pueden reaccionar entre sí',
        riesgoPotencial: 'Explosión, incendio, emisión de gases tóxicos',
        efectosPosibles: 'Intoxicación masiva, incendio, explosión',
        medidasControl: ['Separación por incompatibilidad química', 'Señalización de riesgo de cada producto', 'Plan de emergencia específico', 'Capacitación en manejo de derrames']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos peligrosos', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Traje Tyvek o similar', 'Guantes de nitrilo grueso', 'Respirador con filtro para vapores químicos', 'Botas de caucho', 'Careta facial'],
    capacitacionesObligatorias: ['Manejo de sustancias peligrosas', 'Control de derrames', 'Uso de SDS', 'Plan de emergencias químicas', 'Primeros auxilios - quemaduras']
  },

  {
    codigoCIIU: '4665',
    descripcionCIIU: 'Comercio al por mayor de desperdicios, desechos y chatarra',
    nivelRiesgo: 'III',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-004', 'QUI-001', 'SEG-005', 'BIO-MEC-004', 'FIS-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'CHAT-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con residuos orgánicos y material contaminado',
        descripcion: 'Manejo de chatarra, residuos industriales y desechos con posible contaminación biológica',
        riesgoPotencial: 'Infecciones cutáneas y sistémicas',
        efectosPosibles: 'Tétanos, hepatitis, infecciones cutáneas',
        medidasControl: ['Vacunación antitetánica y hepatitis B', 'Guantes de cuero reforzado', 'Calzado de seguridad', 'Higiene rigurosa al salir de jornada']
      },
      {
        codigo: 'CHAT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a metales pesados y sustancias tóxicas en chatarra',
        descripcion: 'Plomo, mercurio, cromo hexavalente y asbesto en materiales de desecho',
        riesgoPotencial: 'Intoxicación crónica por metales pesados',
        efectosPosibles: 'Saturnismo, daño neurológico, cáncer',
        medidasControl: ['Mascarilla para polvos y partículas metálicas', 'Prohibición de comer en área de trabajo', 'Higiene de manos obligatoria', 'Monitoreo biológico periódico']
      },
      {
        codigo: 'CHAT-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes, pinchazos y golpes con chatarra',
        descripcion: 'Manipulación de metal irregular, vidrios rotos, madera con clavos',
        riesgoPotencial: 'Lesiones traumáticas y cortantes',
        efectosPosibles: 'Laceraciones, perforaciones, fracturas',
        medidasControl: ['Guantes anticorte de alto nivel', 'Casco', 'Botas con puntera y suela antiperforo', 'Clasificación manual mínima']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Manejo de residuos peligrosos', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte nivel 5', 'Casco', 'Botas con puntera y antiperforo', 'Mascarilla N95', 'Gafas de seguridad', 'Overol de trabajo resistente'],
    capacitacionesObligatorias: ['Manejo de residuos peligrosos', 'Bioseguridad', 'Uso de EPP completo', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4669',
    descripcionCIIU: 'Comercio al por mayor de otros productos n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-002', 'PSI-001', 'FIS-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'MAYONCP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de mercancía diversa en bodega',
        descripcion: 'Carga, descarga y organización de productos variados con diferentes pesos y volúmenes',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, hernias, lesiones de extremidades',
        medidasControl: ['Equipos de manutención adecuados', 'Capacitación en manejo de cargas', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Calzado de seguridad', 'Faja lumbar'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4690',
    descripcionCIIU: 'Comercio al por mayor no especializado',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-002', 'PSI-001', 'FIS-002', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'MAYONOESP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo y almacenamiento de productos variados',
        descripcion: 'Operaciones de bodega con gran diversidad de mercancía',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, hernias, lesiones articulares',
        medidasControl: ['Equipos de carga mecánica', 'Límite de peso manual', 'Pausas activas programadas']
      },
      {
        codigo: 'MAYONOESP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta variabilidad de tareas y carga de trabajo irregular',
        descripcion: 'Gestión de pedidos variados, múltiples proveedores y clientes con distintas exigencias',
        riesgoPotencial: 'Estrés laboral',
        efectosPosibles: 'Fatiga crónica, ansiedad, errores por sobrecarga cognitiva',
        medidasControl: ['Planificación de tareas', 'Distribución equitativa de carga', 'Reuniones periódicas de equipo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado de seguridad', 'Guantes de trabajo', 'Faja lumbar'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4719',
    descripcionCIIU: 'Comercio al por menor en establecimientos no especializados, con surtido compuesto principalmente por alimentos, bebidas o tabaco',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'TIENDA-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manipulación de alimentos en tienda de barrio',
        descripcion: 'Contacto con alimentos sin refrigeración adecuada, manipulación sin lavado de manos',
        riesgoPotencial: 'Enfermedades de transmisión alimentaria',
        efectosPosibles: 'Gastroenteritis, salmonelosis, intoxicaciones',
        medidasControl: ['Carné de manipulación de alimentos', 'Lavado de manos frecuente', 'Control de temperatura de alimentos perecederos', 'Aseo del establecimiento']
      },
      {
        codigo: 'TIENDA-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Jornadas largas y trabajo en solitario',
        descripcion: 'Trabajo en jornadas extendidas, muchas veces solo, con exposición a atracos',
        riesgoPotencial: 'Estrés, fatiga y riesgo de violencia',
        efectosPosibles: 'Agotamiento, trastornos del sueño, trauma psicológico por robo',
        medidasControl: ['Medidas de seguridad física', 'No trabajar solo en horarios nocturnos', 'Límite de jornada según Código Sustantivo del Trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM - Manipulación de alimentos', obligatorio: true }
    ],
    eppRecomendado: ['Delantal', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'Prevención de riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4722',
    descripcionCIIU: 'Comercio al por menor de leche, productos lácteos y huevos, en establecimientos especializados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'BIO-MEC-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'LACT-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico en lácteos y huevos',
        descripcion: 'Manejo de leche, quesos, yogures y huevos con riesgo de contaminación por Salmonella, Listeria y Staphylococcus',
        riesgoPotencial: 'Enfermedades transmitidas por alimentos',
        efectosPosibles: 'Salmonelosis, listeriosis, intoxicación estafilocócica',
        medidasControl: ['Carné de manipulación de alimentos', 'Control de cadena de frío', 'Lavado de manos', 'Limpieza y desinfección de neveras']
      },
      {
        codigo: 'LACT-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición al frío en cuartos de refrigeración',
        descripcion: 'Trabajo continuo cerca de neveras y cuartos fríos para mantenimiento de cadena de frío',
        riesgoPotencial: 'Hipotermia leve y enfermedades respiratorias',
        efectosPosibles: 'Resfriados frecuentes, bronquitis',
        medidasControl: ['Ropa abrigada de trabajo', 'Limitar tiempo de permanencia en cuartos fríos', 'Turnos rotativos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true }
    ],
    eppRecomendado: ['Delantal impermeable', 'Guantes de látex', 'Calzado antideslizante', 'Gorra o cofia'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'Cadena de frío', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4723',
    descripcionCIIU: 'Comercio al por menor de carnes, productos cárnicos, pescados y productos de mar',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'SEG-005', 'FIS-004', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'CARN-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico en carnes crudas y productos del mar',
        descripcion: 'Manejo de carnes crudas, vísceras y mariscos con alto riesgo de contaminación por Salmonella, E. coli y Vibrio',
        riesgoPotencial: 'Enfermedades de transmisión alimentaria y zoonosis',
        efectosPosibles: 'Gastroenteritis grave, salmonelosis, brucelosis',
        medidasControl: ['Lavado de manos obligatorio', 'Separación de superficies crudas y cocidas', 'Carné de manipulación', 'Control de temperatura de almacenamiento']
      },
      {
        codigo: 'CARN-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes con cuchillos y equipos de corte',
        descripcion: 'Uso de cuchillos de carnicero, sierras y máquinas de corte en actividad cotidiana',
        riesgoPotencial: 'Cortes y amputaciones',
        efectosPosibles: 'Laceraciones profundas, pérdida de dedos',
        medidasControl: ['Guantes anticorte de malla metálica', 'Cuchillos afilados (más seguros)', 'Protector de antebrazo', 'Capacitación en técnica segura de corte']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1500-2007', norma: 'Decreto 1500/2007', descripcion: 'Reglamento técnico de carne', obligatorio: true },
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte de malla metálica', 'Delantal de malla o plástico', 'Botas de caucho', 'Gorra o cofia', 'Mascarilla'],
    capacitacionesObligatorias: ['Manejo seguro de cuchillos', 'BPM carnes', 'Zoonosis y enfermedades transmitidas por alimentos', 'Primeros auxilios - hemorragias']
  },

  {
    codigoCIIU: '4724',
    descripcionCIIU: 'Comercio al por menor de bebidas y productos del tabaco, en establecimientos especializados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-006', 'PSI-001', 'BIO-MEC-002', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'BEB-RET-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de cajas y envases pesados',
        descripcion: 'Carga de cajas de vidrio y barriles en punto de venta',
        riesgoPotencial: 'Lesiones musculoesqueléticas y cortes',
        efectosPosibles: 'Hernias, lumbalgias, laceraciones por vidrio',
        medidasControl: ['Carretillas', 'Guantes anticorte', 'Calzado con puntera', 'Técnica correcta de levantamiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte', 'Calzado con puntera', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4729',
    descripcionCIIU: 'Comercio al por menor de otros productos alimenticios n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-MEC-001', 'PSI-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'ALIMRET-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manipulación de alimentos especializados',
        descripcion: 'Manejo de panadería, pastelería, granos, especias u otros alimentos con riesgo de contaminación',
        riesgoPotencial: 'Enfermedades transmitidas por alimentos',
        efectosPosibles: 'Intoxicaciones alimentarias, alergias',
        medidasControl: ['Carné de manipulación de alimentos', 'BPM', 'Control de fechas de vencimiento', 'Limpieza y desinfección']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Delantal', 'Guantes desechables', 'Gorra o cofia', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'BPM', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4731',
    descripcionCIIU: 'Comercio al por menor de combustible para automotores',
    nivelRiesgo: 'III',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'SEG-006', 'QUI-004', 'FIS-005', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'COMB-RET-001',
        clasificacion: 'quimico',
        peligro: 'Inhalación de vapores de gasolina y ACPM',
        descripcion: 'Exposición crónica a vapores de hidrocarburos durante despacho de combustible',
        riesgoPotencial: 'Intoxicación crónica por hidrocarburos',
        efectosPosibles: 'Cefalea, náuseas, daño neurológico, leucemia (benceno)',
        medidasControl: ['Trabajar en área ventilada', 'Mascarilla para vapores orgánicos en derrames', 'Rotación de personal', 'Medición de exposición periódica']
      },
      {
        codigo: 'COMB-RET-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio y explosión en estación de servicio',
        descripcion: 'Vapores inflamables de gasolina y ACPM en área de surtidores',
        riesgoPotencial: 'Incendio y explosión',
        efectosPosibles: 'Quemaduras graves, muerte',
        medidasControl: ['Prohibición absoluta de fumar en área', 'Paro de motor durante despacho', 'Extintor de CO2 y espuma en cada isla', 'Sistema eléctrico antiexplosión']
      },
      {
        codigo: 'COMB-RET-003',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo de atraco y violencia',
        descripcion: 'Estaciones de servicio con alto flujo de efectivo, objetivo frecuente de delincuencia',
        riesgoPotencial: 'Trauma psicológico y lesiones físicas',
        efectosPosibles: 'Trauma psicológico, lesiones físicas, muerte',
        medidasControl: ['Cámaras de seguridad', 'Protocolo para manejo de robos', 'Mínimo efectivo en caja', 'Comunicación directa con autoridades']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1521-1998', norma: 'Decreto 1521/1998', descripcion: 'Almacenamiento y distribución de combustibles', obligatorio: true },
      { codigo: 'RES-40095-2014', norma: 'Resolución 40095/2014', descripcion: 'Reglamento técnico de instalaciones eléctricas en estaciones de servicio', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Overol ignífugo', 'Calzado antiestático', 'Guantes resistentes a hidrocarburos', 'Mascarilla para vapores orgánicos (derrames)'],
    capacitacionesObligatorias: ['Manejo de combustibles y derrames', 'Prevención y control de incendios', 'Primeros auxilios - quemaduras', 'Protocolo de seguridad ante atracos']
  },

  {
    codigoCIIU: '4732',
    descripcionCIIU: 'Comercio al por menor de lubricantes, aditivos y productos de limpieza para automotores',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'SEG-006', 'BIO-MEC-003', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'LUB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a aceites, lubricantes y aditivos',
        descripcion: 'Manipulación de aceites minerales y sintéticos, líquido de freno, anticongelantes y limpiadores',
        riesgoPotencial: 'Dermatitis por contacto, irritación respiratoria',
        efectosPosibles: 'Dermatitis crónica, irritación cutánea, intoxicación por absorción',
        medidasControl: ['Guantes de nitrilo', 'Ventilación adecuada', 'SDS en español disponibles', 'Ropa de trabajo protectora']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Overol de trabajo', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Manejo de productos químicos', 'Uso de SDS', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4741',
    descripcionCIIU: 'Comercio al por menor de computadores, equipos periféricos, programas de informática y equipos de telecomunicaciones',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'FIS-002', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'TEC-RET-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en demostración con posturas inadecuadas',
        descripcion: 'Demostración de equipos con posición de cuclillas, inclinación o bipedestación prolongada',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Dolor lumbar, cervical y de extremidades',
        medidasControl: ['Mostradores a altura ergonómica', 'Rotación de funciones', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga en mostrador'],
    capacitacionesObligatorias: ['Ergonomía en ventas', 'Riesgo eléctrico básico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4742',
    descripcionCIIU: 'Comercio al por menor de equipos y aparatos de sonido y de video',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['FIS-001', 'SEG-004', 'BIO-MEC-003', 'BIO-MEC-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'AUDIO-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a ruido en sala de demostración de equipos de sonido',
        descripcion: 'Demostración de parlantes, equipos de audio a alto volumen',
        riesgoPotencial: 'Daño auditivo temporal o permanente',
        efectosPosibles: 'Pérdida auditiva, tinnitus',
        medidasControl: ['Limitar tiempo de demostración a alto volumen', 'Protección auditiva para personal en sala', 'Audiometrías periódicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-8321-1983', norma: 'Resolución 8321/1983', descripcion: 'Protección y conservación de la audición', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva (tapones) para demostraciones', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Conservación auditiva', 'Manejo de cargas (equipos pesados)', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4751',
    descripcionCIIU: 'Comercio al por menor de productos textiles en establecimientos especializados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-002', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'TEX-RET-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de fibras textiles en sala de ventas',
        descripcion: 'Partículas de tela en el ambiente durante corte, manipulación y organización de rollos',
        riesgoPotencial: 'Afecciones respiratorias',
        efectosPosibles: 'Rinitis, asma ocupacional',
        medidasControl: ['Ventilación adecuada', 'Mascarilla para partículas en corte', 'Limpieza frecuente de la sala']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para partículas', 'Calzado antideslizante', 'Calzado ergonómico'],
    capacitacionesObligatorias: ['Higiene respiratoria', 'Higiene postural', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4752',
    descripcionCIIU: 'Comercio al por menor de artículos de ferretería, pinturas y productos de vidrio',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'SEG-006', 'BIO-MEC-003', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'FERR-RET-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a vapores de pinturas, solventes y pegamentos',
        descripcion: 'Venta de pinturas, thinner, selladores y adhesivos con emisión de COV (compuestos orgánicos volátiles)',
        riesgoPotencial: 'Intoxicación por vapores orgánicos',
        efectosPosibles: 'Cefalea, mareos, daño hepático en exposición crónica',
        medidasControl: ['Ventilación del local', 'Almacenamiento en área separada', 'No destabilizar envases en sala', 'Extintor tipo BC']
      },
      {
        codigo: 'FERR-RET-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes con vidrios y materiales cortantes',
        descripcion: 'Manejo y corte de vidrios, láminas y artículos de ferretería con bordes filosos',
        riesgoPotencial: 'Cortes graves',
        efectosPosibles: 'Laceraciones, hemorragias',
        medidasControl: ['Guantes anticorte', 'Gafas de seguridad', 'Técnica correcta de manejo de vidrio']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte', 'Gafas de seguridad', 'Calzado de seguridad', 'Mascarilla para vapores orgánicos (en pinturas)'],
    capacitacionesObligatorias: ['Manejo de pinturas y solventes', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4753',
    descripcionCIIU: 'Comercio al por menor de tapices, alfombras y cubrimientos para paredes y pisos',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['QUI-002', 'BIO-MEC-003', 'BIO-MEC-002', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'TAP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de rollos de alfombra y tapetes pesados',
        descripcion: 'Carga, transporte y exhibición de rollos de gran tamaño y peso',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, hernias, lesiones de hombro',
        medidasControl: ['Carros porta-rollos', 'Trabajo en equipo para rollos de gran tamaño', 'Capacitación en biomecánica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Calzado de seguridad', 'Mascarilla para polvo'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4754',
    descripcionCIIU: 'Comercio al por menor de electrodomésticos y gasodomésticos de uso doméstico',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'SEG-004', 'BIO-MEC-002', 'SEG-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'ELDOM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manipulación de electrodomésticos grandes',
        descripcion: 'Carga y transporte de neveras, lavadoras, estufas en sala de ventas y bodega',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Hernias, lumbalgias, lesiones articulares',
        medidasControl: ['Dolly y carretillas para equipos grandes', 'Trabajo en equipo mínimo 2 personas', 'Calzado con puntera de acero']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Calzado con puntera de acero', 'Faja lumbar'],
    capacitacionesObligatorias: ['Manejo de cargas pesadas', 'Riesgo eléctrico básico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4755',
    descripcionCIIU: 'Comercio al por menor de artículos y utensilios de uso doméstico y de cocina',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'SEG-002', 'PSI-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'COCINA-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes en manejo de artículos de cocina (cuchillos, vajillas)',
        descripcion: 'Exhibición y venta de cuchillos, vajillas de cristal y porcelana con riesgo de corte o rotura',
        riesgoPotencial: 'Cortes y laceraciones',
        efectosPosibles: 'Laceraciones en manos y brazos',
        medidasControl: ['Guantes anticorte en zona de cuchillería', 'Manejo cuidadoso de vajillas', 'Técnica de exhibición segura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte en cuchillería', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manejo seguro de artículos cortantes', 'Primeros auxilios']
  },


  {
    codigoCIIU: '4761',
    descripcionCIIU: 'Comercio al por menor de libros, periódicos, materiales y artículos de papelería y escritorio',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'FIS-002', 'QUI-001'],
    peligrosEspecificos: [
      {
        codigo: 'PAPEL-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a tintas, solventes y pegamentos en artículos de papelería',
        descripcion: 'Inhalación de vapores de tintas, cementos y adhesivos en tienda de papelería',
        riesgoPotencial: 'Irritación de vías respiratorias',
        efectosPosibles: 'Cefalea, mareos, irritación nasal',
        medidasControl: ['Ventilación del local', 'No abrir múltiples envases a la vez', 'Almacenamiento separado de solventes']
      },
      {
        codigo: 'PAPEL-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Atención prolongada de pie o en escritorio',
        descripcion: 'Trabajo en mostrador con posiciones estáticas prolongadas',
        riesgoPotencial: 'Fatiga musculoesquelética',
        efectosPosibles: 'Lumbalgia, dolor cervical, várices',
        medidasControl: ['Tapete antifatiga', 'Silla alta en mostrador', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga'],
    capacitacionesObligatorias: ['Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4762',
    descripcionCIIU: 'Comercio al por menor de artículos deportivos, en establecimientos especializados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-002', 'SEG-002', 'PSI-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'DEP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de equipos deportivos pesados',
        descripcion: 'Exhibición y carga de bicicletas, máquinas de ejercicio, pesas y equipos de gran tamaño',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgias, lesiones articulares',
        medidasControl: ['Equipos de apoyo para artículos pesados', 'Trabajo en equipo', 'Capacitación en biomecánica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado de seguridad', 'Guantes de trabajo', 'Faja lumbar para cargas pesadas'],
    capacitacionesObligatorias: ['Manejo de cargas', 'Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4769',
    descripcionCIIU: 'Comercio al por menor de otros artículos culturales y de entretenimiento n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'PSI-001', 'FIS-002', 'SEG-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'CULT-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Atención al cliente y gestión de quejas',
        descripcion: 'Contacto con clientes con diversas exigencias en artículos culturales y de colección',
        riesgoPotencial: 'Estrés laboral',
        efectosPosibles: 'Burnout, ansiedad, agotamiento emocional',
        medidasControl: ['Programa de gestión de riesgo psicosocial', 'Capacitación en atención al cliente', 'Espacios de descanso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial', 'Atención al cliente', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4771',
    descripcionCIIU: 'Comercio al por menor de prendas de vestir y sus accesorios en establecimientos especializados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'PSI-003', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'ROPA-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Bipedestación prolongada en atención al cliente',
        descripcion: 'Atención en sala de ventas de pie durante toda la jornada laboral',
        riesgoPotencial: 'Fatiga musculoesquelética y vascular',
        efectosPosibles: 'Dolor de piernas, várices, lumbalgia',
        medidasControl: ['Calzado ergonómico', 'Tapetes antifatiga', 'Pausas activas', 'Rotación entre caja y sala']
      },
      {
        codigo: 'ROPA-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Trabajo monótono y repetitivo en temporadas altas',
        descripcion: 'Ciclos de trabajo intensos en temporadas de ventas con alta exigencia y monotonía',
        riesgoPotencial: 'Fatiga mental y estrés laboral',
        efectosPosibles: 'Burnout, ansiedad, ausentismo',
        medidasControl: ['Rotación de tareas', 'Distribución equitativa de carga en temporada alta', 'Espacios de descanso adecuados']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga en puntos de caja'],
    capacitacionesObligatorias: ['Pausas activas', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4772',
    descripcionCIIU: 'Comercio al por menor de todo tipo de calzado y artículos de cuero y sucedáneos del cuero',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'CALZ-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Posturas de cuclillas y flexión en atención al cliente',
        descripcion: 'Agacharse frecuentemente para calzar y mostrar zapatos a clientes sentados',
        riesgoPotencial: 'Lesiones de rodilla y columna',
        efectosPosibles: 'Gonartrosis precoz, lumbalgia, tendinitis de rodilla',
        medidasControl: ['Banco de atención que eleve la altura del pie del cliente', 'Pausas activas', 'Rotación de funciones']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Rodilleras para actividad de agacharse frecuente'],
    capacitacionesObligatorias: ['Higiene postural', 'Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4774',
    descripcionCIIU: 'Comercio al por menor de otros productos nuevos en establecimientos especializados n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'PSI-001', 'SEG-002', 'FIS-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'NUEVOS-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Atención al cliente en posición estática prolongada',
        descripcion: 'Trabajo en mostrador de pie o sentado sin variación postural adecuada',
        riesgoPotencial: 'Fatiga musculoesquelética',
        efectosPosibles: 'Dolor lumbar, cervical y de extremidades inferiores',
        medidasControl: ['Silla alta en mostrador', 'Tapete antifatiga', 'Pausas activas periódicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga'],
    capacitacionesObligatorias: ['Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4775',
    descripcionCIIU: 'Comercio al por menor de artículos de segunda mano',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-002', 'BIO-003', 'BIO-MEC-003', 'SEG-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'SEGUNDA-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con artículos usados potencialmente contaminados',
        descripcion: 'Manipulación de ropa, muebles, electrodomésticos y objetos de uso personal de segunda mano',
        riesgoPotencial: 'Infecciones cutáneas y parasitosis',
        efectosPosibles: 'Dermatitis, escabiosis, infecciones fúngicas',
        medidasControl: ['Guantes para manipulación inicial de artículos', 'Higiene de manos frecuente', 'Desinfección de artículos antes de exhibición', 'No llevar artículos a domicilio sin desinfectar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla para polvo', 'Delantal de trabajo'],
    capacitacionesObligatorias: ['Higiene y bioseguridad básica', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4781',
    descripcionCIIU: 'Comercio al por menor de alimentos, bebidas y tabaco en puestos de venta móviles',
    nivelRiesgo: 'II',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'FIS-005', 'BIO-MEC-004', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'MOVIL-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manipulación de alimentos sin infraestructura adecuada',
        descripcion: 'Preparación y venta de alimentos en puesto móvil con condiciones limitadas de higiene',
        riesgoPotencial: 'Enfermedades transmitidas por alimentos',
        efectosPosibles: 'ETA, salmonelosis, hepatitis A',
        medidasControl: ['Carné de manipulación de alimentos', 'Agua potable disponible para lavado de manos', 'Neveras o termos para control de temperatura', 'Superficies limpias y desinfectadas']
      },
      {
        codigo: 'MOVIL-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a condiciones climáticas extremas',
        descripcion: 'Trabajo a la intemperie bajo sol, lluvia o bajas temperaturas',
        riesgoPotencial: 'Estrés térmico e insolación',
        efectosPosibles: 'Golpe de calor, deshidratación, hipotermia',
        medidasControl: ['Sombrilla o techo en puesto', 'Hidratación frecuente', 'Ropa adecuada según clima', 'Descanso en sombra']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gorra o sombrero', 'Delantal impermeable', 'Guantes desechables', 'Calzado cómodo antideslizante'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'Prevención de golpe de calor', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4782',
    descripcionCIIU: 'Comercio al por menor de productos textiles, prendas de vestir y calzado en puestos de venta móviles',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['FIS-004', 'FIS-005', 'BIO-MEC-004', 'BIO-MEC-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'MOVILTEXT-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición solar prolongada en trabajo a la intemperie',
        descripcion: 'Jornadas completas en plazas de mercado o vías sin protección solar',
        riesgoPotencial: 'Daño solar y estrés térmico',
        efectosPosibles: 'Cáncer de piel, golpe de calor, deshidratación',
        medidasControl: ['Sombrero o sombrilla', 'Bloqueador solar (SPF 50+)', 'Hidratación frecuente', 'Ropa de manga larga en colores claros']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Sombrero o sombrilla', 'Bloqueador solar', 'Ropa ligera de manga larga', 'Calzado cómodo'],
    capacitacionesObligatorias: ['Prevención de estrés térmico', 'Protección solar', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4789',
    descripcionCIIU: 'Comercio al por menor de otros productos en puestos de venta móviles y mercados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['FIS-004', 'BIO-MEC-004', 'SEG-002', 'PSI-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'MOVILGEN-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a condiciones ambientales adversas',
        descripcion: 'Trabajo a la intemperie con exposición a lluvia, sol, frío y humedad',
        riesgoPotencial: 'Estrés térmico y enfermedades respiratorias',
        efectosPosibles: 'Resfriados frecuentes, golpe de calor, fatiga',
        medidasControl: ['Ropa adecuada para clima', 'Hidratación constante', 'Pausas en lugar techado', 'Bloqueador solar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Ropa impermeable', 'Calzado antideslizante', 'Sombrero'],
    capacitacionesObligatorias: ['Prevención de estrés térmico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4791',
    descripcionCIIU: 'Comercio al por menor realizado a través de internet',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'PSI-004', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'ECOM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo prolongado frente a pantalla (PVD)',
        descripcion: 'Gestión de pedidos, atención al cliente, actualizaciones de catálogo y administración en línea',
        riesgoPotencial: 'Lesiones musculoesqueléticas y fatiga visual',
        efectosPosibles: 'Síndrome del túnel carpiano, dolor cervical, fatiga visual digital',
        medidasControl: ['Puesto ergonómico', 'Pausas cada hora', 'Regla 20-20-20 para ojos', 'Evaluación ergonómica del puesto']
      },
      {
        codigo: 'ECOM-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Disponibilidad permanente y trabajo en casa (teletrabajo)',
        descripcion: 'Dificultad de separación entre vida laboral y personal en negocios en línea operados desde casa',
        riesgoPotencial: 'Burnout y desconexión laboral deficiente',
        efectosPosibles: 'Estrés crónico, ansiedad, trastornos del sueño',
        medidasControl: ['Horarios definidos de trabajo', 'Desconexión digital al finalizar jornada', 'Espacios de trabajo separados del hogar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-2191-2022', norma: 'Ley 2191/2022', descripcion: 'Derecho a la desconexión digital', obligatorio: true },
      { codigo: 'DEC-0555-2022', norma: 'Decreto 0555/2022', descripcion: 'Teletrabajo y trabajo en casa', obligatorio: false }
    ],
    eppRecomendado: ['Silla ergonómica', 'Monitor con altura regulable', 'Teclado y ratón ergonómicos'],
    capacitacionesObligatorias: ['Ergonomía en teletrabajo', 'Higiene visual digital', 'Prevención de riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4792',
    descripcionCIIU: 'Comercio al por menor realizado a través de casas de venta o por correo',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'PSI-003', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'CORREO-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Trabajo monótono y repetitivo en call center o gestión de catálogos',
        descripcion: 'Atención telefónica continua, gestión de pedidos repetitiva',
        riesgoPotencial: 'Fatiga mental y estrés laboral',
        efectosPosibles: 'Agotamiento, ansiedad, absentismo',
        medidasControl: ['Rotación de tareas', 'Pausas programadas', 'Gestión del riesgo psicosocial', 'Espacios de descanso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Diadema ergonómica para llamadas', 'Silla ergonómica', 'Reposamuñecas'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '4799',
    descripcionCIIU: 'Otros tipos de comercio al por menor no realizado en establecimientos, puestos de venta o mercados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['FIS-004', 'BIO-MEC-004', 'PSI-001', 'SEG-002', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'VENTDIR-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por trabajo a comisión y metas de venta',
        descripcion: 'Venta directa puerta a puerta o por medios no convencionales con ingresos variables',
        riesgoPotencial: 'Estrés e incertidumbre económica',
        efectosPosibles: 'Ansiedad, agotamiento emocional',
        medidasControl: ['Metas realistas y alcanzables', 'Apoyo de equipo de ventas', 'Programa de bienestar laboral']
      },
      {
        codigo: 'VENTDIR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a condiciones climáticas en trabajo de campo',
        descripcion: 'Desplazamiento y trabajo en la calle bajo diferentes condiciones climáticas',
        riesgoPotencial: 'Estrés térmico',
        efectosPosibles: 'Golpe de calor, deshidratación, resfriados',
        medidasControl: ['Hidratación constante', 'Ropa adecuada para clima', 'Sombrero o protección solar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Sombrero o protección solar', 'Calzado cómodo para caminata', 'Ropa impermeable'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial', 'Seguridad vial (Decreto 1079/2015)', 'Primeros auxilios']
  },

  // ==================== SECCIÓN I - HOTELERÍA Y RESTAURANTES ====================

  {
    codigoCIIU: '5512',
    descripcionCIIU: 'Alojamiento en apartahoteles',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-003', 'QUI-004', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'HOT-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en limpieza de habitaciones',
        descripcion: 'Contacto con fluidos corporales, ropa de cama y superficies potencialmente contaminadas en cambio de lencería',
        riesgoPotencial: 'Infecciones bacterianas y virales',
        efectosPosibles: 'Infecciones cutáneas, enfermedades respiratorias, hepatitis',
        medidasControl: ['Guantes de látex o nitrilo', 'Mascarilla', 'Manejo de ropa sucia con doble bolsa', 'Lavado de manos', 'Vacunación (hepatitis B, influenza)']
      },
      {
        codigo: 'HOT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a productos de limpieza y desinfección',
        descripcion: 'Uso de desinfectantes, lejía, limpiadores ácidos y básicos en habitaciones y zonas comunes',
        riesgoPotencial: 'Irritación y quemaduras químicas',
        efectosPosibles: 'Dermatitis, irritación ocular y respiratoria, quemaduras',
        medidasControl: ['Guantes de nitrilo', 'Gafas protectoras en uso de ácidos/bases', 'Nunca mezclar productos de limpieza', 'SDS disponibles', 'Ventilación en habitaciones']
      },
      {
        codigo: 'HOT-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Posturas forzadas en tendido de camas y limpieza',
        descripcion: 'Trabajo con flexión de tronco, rodillas y extensión de brazos en tendido de camas y limpieza de baños',
        riesgoPotencial: 'Lesiones musculoesqueléticas de alta incidencia',
        efectosPosibles: 'Lumbalgia, tendinitis de hombro, lesiones de rodilla',
        medidasControl: ['Carros de limpieza a altura adecuada', 'Mopas con mango extensible', 'Capacitación en biomecánica', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla desechable', 'Calzado antideslizante', 'Delantal impermeable', 'Gafas de protección para limpieza con ácidos'],
    capacitacionesObligatorias: ['Manejo seguro de productos de limpieza', 'Bioseguridad', 'Higiene postural', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5513',
    descripcionCIIU: 'Alojamiento en centros vacacionales',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-004', 'SEG-001', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'VAC-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición solar en áreas recreativas al aire libre',
        descripcion: 'Personal de recreación, mantenimiento de piscinas y jardines con exposición solar prolongada',
        riesgoPotencial: 'Quemaduras solares y estrés térmico',
        efectosPosibles: 'Cáncer de piel, golpe de calor, deshidratación',
        medidasControl: ['Bloqueador solar SPF 50+', 'Ropa de trabajo manga larga', 'Sombrero', 'Hidratación frecuente', 'Horarios sin exposición al mediodía']
      },
      {
        codigo: 'VAC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a cloro y productos de tratamiento de piscinas',
        descripcion: 'Manejo de hipoclorito, ácido clorhídrico y otros productos para tratamiento del agua de piscina',
        riesgoPotencial: 'Irritación respiratoria y quemaduras',
        efectosPosibles: 'Irritación ocular y respiratoria, quemaduras cutáneas',
        medidasControl: ['Guantes de nitrilo grueso', 'Gafas de seguridad', 'Mascarilla en manejo de cloro', 'Almacenar en área ventilada', 'SDS disponibles']
      },
      {
        codigo: 'VAC-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo de ahogamiento en supervisión de piscinas',
        descripcion: 'Personal sin capacitación de salvavidas en supervisión de áreas acuáticas',
        riesgoPotencial: 'Ahogamiento de bañistas y accidentes al intentar rescate',
        efectosPosibles: 'Muerte por ahogamiento, lesiones en rescate',
        medidasControl: ['Salvavidas certificado en cada piscina en servicio', 'Equipo de rescate disponible', 'Señalización de profundidades', 'Procedimiento de emergencia acuática']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-1618-2010', norma: 'Resolución 1618/2010', descripcion: 'Estándares para parques y piscinas', obligatorio: true }
    ],
    eppRecomendado: ['Bloqueador solar', 'Sombrero', 'Guantes de nitrilo para piscina', 'Calzado antideslizante en zonas mojadas'],
    capacitacionesObligatorias: ['Manejo de químicos para piscina', 'Prevención de estrés térmico', 'Salvamento acuático básico', 'Primeros auxilios - RCP']
  },

  {
    codigoCIIU: '5514',
    descripcionCIIU: 'Alojamiento rural',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-004', 'FIS-004', 'NAT-001', 'NAT-002', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'RURAL-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con fauna silvestre y vectores',
        descripcion: 'Presencia de serpientes, arácnidos, insectos vectores (dengue, malaria, chikungunya) en entorno rural',
        riesgoPotencial: 'Accidentes ofídicos, picaduras y enfermedades vectoriales',
        efectosPosibles: 'Envenenamiento, infecciones, enfermedades febriles',
        medidasControl: ['Botas de caña alta en campo', 'Repelente de insectos', 'Toldillos en áreas de descanso', 'Protocolo de accidente ofídico', 'Vacunación para zona endémica']
      },
      {
        codigo: 'RURAL-NAT-001',
        clasificacion: 'fenomenos_naturales',
        peligro: 'Riesgos naturales en zona rural (deslizamientos, crecientes)',
        descripcion: 'Exposición a riesgos geológicos e hidrológicos propios del entorno rural colombiano',
        riesgoPotencial: 'Traumatismos y muerte por fenómenos naturales',
        efectosPosibles: 'Lesiones, sepultamiento, ahogamiento',
        medidasControl: ['Plan de emergencias con rutas de evacuación', 'Comunicación con UNGRD', 'Monitoreo de alertas tempranas', 'Capacitación en gestión del riesgo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-1523-2012', norma: 'Ley 1523/2012', descripcion: 'Política Nacional de Gestión del Riesgo de Desastres', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caña alta', 'Repelente de insectos', 'Ropa de trabajo de manga larga', 'Bloqueador solar'],
    capacitacionesObligatorias: ['Gestión del riesgo de desastres', 'Accidentes ofídicos y picaduras', 'Primeros auxilios en zona rural', 'Emergencias acuáticas']
  },

  {
    codigoCIIU: '5519',
    descripcionCIIU: 'Otros tipos de alojamiento para visitantes n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-004', 'BIO-MEC-001', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'ALOJ-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en limpieza de espacios de alojamiento',
        descripcion: 'Manejo de lencería, baños y superficies de huéspedes con posible contaminación',
        riesgoPotencial: 'Infecciones y enfermedades de transmisión',
        efectosPosibles: 'Infecciones bacterianas, virales, micóticas',
        medidasControl: ['Guantes de nitrilo', 'Mascarilla', 'Protocolo de limpieza y desinfección', 'Higiene de manos', 'Vacunación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Calzado antideslizante', 'Delantal'],
    capacitacionesObligatorias: ['Bioseguridad y limpieza', 'Manejo de productos químicos de limpieza', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5520',
    descripcionCIIU: 'Actividades de zonas de camping y parques para vehículos recreacionales',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-004', 'NAT-001', 'NAT-002', 'FIS-004', 'SEG-004', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'CAMP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en conexiones para vehículos recreacionales',
        descripcion: 'Instalaciones eléctricas para carga de vehículos y campistas en zonas al aire libre',
        riesgoPotencial: 'Contacto eléctrico y cortocircuito',
        efectosPosibles: 'Electrocución, quemaduras, incendio',
        medidasControl: ['Instalaciones eléctricas certificadas RETIE', 'Disyuntores diferenciales', 'Señalización de puntos eléctricos', 'Inspección periódica']
      },
      {
        codigo: 'CAMP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con fauna silvestre y vectores en zona de camping',
        descripcion: 'Exposición a insectos, serpientes y animales silvestres en actividades al aire libre',
        riesgoPotencial: 'Picaduras y mordeduras',
        efectosPosibles: 'Alergias, envenenamiento, enfermedades vectoriales',
        medidasControl: ['Protocolos de respuesta a encuentros con fauna', 'Repelente de insectos', 'Botas para personal de campo', 'Capacitación en primeros auxilios para picaduras']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-1523-2012', norma: 'Ley 1523/2012', descripcion: 'Gestión del Riesgo de Desastres', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caña alta', 'Repelente', 'Ropa de trabajo de manga larga', 'Bloqueador solar'],
    capacitacionesObligatorias: ['Gestión del riesgo en zonas naturales', 'Riesgo eléctrico básico', 'Primeros auxilios - fauna silvestre']
  },

  {
    codigoCIIU: '5530',
    descripcionCIIU: 'Servicio por horas',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-004', 'PSI-001', 'BIO-MEC-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'HRS-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Alto índice de rotación de huéspedes y limpieza frecuente',
        descripcion: 'Limpieza de habitaciones múltiples veces al día con alta exposición a fluidos y superficies contaminadas',
        riesgoPotencial: 'Infecciones por contacto con fluidos corporales',
        efectosPosibles: 'ETS, infecciones bacterianas y virales',
        medidasControl: ['Doble guante en limpieza de baño', 'Protocolo estricto de desinfección', 'Vacunación hepatitis B', 'Ropa de trabajo exclusiva']
      },
      {
        codigo: 'HRS-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por alta rotación y exigencia de rapidez',
        descripcion: 'Presión para tener habitaciones listas en tiempo muy reducido entre huéspedes',
        riesgoPotencial: 'Estrés laboral y agotamiento',
        efectosPosibles: 'Burnout, errores por presión de tiempo, lesiones por prisa',
        medidasControl: ['Tiempos mínimos de rotación realistas', 'Dotación de personal suficiente', 'Gestión del riesgo psicosocial']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Dobles guantes de nitrilo', 'Mascarilla', 'Delantal impermeable', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Bioseguridad y manejo de fluidos', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5590',
    descripcionCIIU: 'Otros tipos de alojamiento n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Hotelería y turismo',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-004', 'BIO-MEC-001', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'ALOJNCP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en aseo y mantenimiento de instalaciones',
        descripcion: 'Limpieza de instalaciones de alojamiento con contacto con superficies y elementos de huéspedes',
        riesgoPotencial: 'Infecciones y enfermedades de transmisión',
        efectosPosibles: 'Infecciones diversas, dermatitis de contacto',
        medidasControl: ['Guantes de nitrilo', 'Mascarilla', 'Protocolos de limpieza', 'Higiene de manos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Bioseguridad básica', 'Manejo de productos de limpieza', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5612',
    descripcionCIIU: 'Expendio por autoservicio de comidas preparadas',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'QUI-003', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'REST-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contaminación cruzada en preparación de alimentos',
        descripcion: 'Manipulación de alimentos crudos y cocidos sin separación adecuada en autoservicio',
        riesgoPotencial: 'Enfermedades transmitidas por alimentos (ETA)',
        efectosPosibles: 'Intoxicación alimentaria, gastroenteritis, salmonelosis',
        medidasControl: ['BPM Resolución 2674/2013', 'Tablas de corte por color', 'Carné de manipulación de alimentos', 'Temperatura de servicio >60°C', 'Lavado de manos obligatorio']
      },
      {
        codigo: 'REST-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Quemaduras en cocina de alto volumen',
        descripcion: 'Manipulación de superficies calientes, vapor, frituras y líquidos en ebullición',
        riesgoPotencial: 'Quemaduras por contacto y salpicaduras',
        efectosPosibles: 'Quemaduras de 1°, 2° y 3° grado',
        medidasControl: ['Guantes térmicos', 'Delantal resistente al calor', 'Tapa al revolver', 'Señalización de superficies calientes', 'Equipo de primeros auxilios para quemaduras']
      },
      {
        codigo: 'REST-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Cortes con cuchillos y equipos de cocina',
        descripcion: 'Uso intensivo de cuchillos, mandolinas y procesadoras en producción masiva',
        riesgoPotencial: 'Cortes y amputaciones',
        efectosPosibles: 'Laceraciones graves, pérdida de dedos',
        medidasControl: ['Guantes anticorte de malla', 'Cuchillos siempre afilados', 'Tabla de corte antideslizante', 'Capacitación en técnica de corte']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'Buenas Prácticas de Manufactura para alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte de malla', 'Guantes térmicos', 'Delantal resistente al calor', 'Gorra o cofia', 'Calzado antideslizante con puntera', 'Mascarilla'],
    capacitacionesObligatorias: ['BPM para restaurantes', 'Manejo seguro de cuchillos', 'Prevención de quemaduras', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5613',
    descripcionCIIU: 'Expendio de comidas preparadas en cafeterías',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'CAF-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manipulación de alimentos en cafetería de alto flujo',
        descripcion: 'Preparación y servicio de alimentos en horarios pico con alta rotación de personal',
        riesgoPotencial: 'Contaminación de alimentos y ETA',
        efectosPosibles: 'Gastroenteritis, intoxicaciones alimentarias',
        medidasControl: ['Carné de manipulación', 'BPM vigentes', 'Control de temperatura', 'Higiene de manos obligatoria antes de manipular alimentos']
      },
      {
        codigo: 'CAF-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Quemaduras en manejo de bebidas calientes (café, agua)',
        descripcion: 'Preparación y servicio de bebidas calientes con exposición a vapor y superficies a alta temperatura',
        riesgoPotencial: 'Quemaduras por salpicadura',
        efectosPosibles: 'Quemaduras de 1° y 2° grado',
        medidasControl: ['Guantes térmicos', 'Bandeja para transporte de bebidas', 'Señalización de riesgo en área de preparación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gorra o cofia', 'Delantal', 'Guantes desechables', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manipulación de alimentos', 'Prevención de quemaduras', 'Atención al cliente', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5619',
    descripcionCIIU: 'Otros tipos de expendio de comidas preparadas n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'BIO-MEC-001', 'SEG-006', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'COMNCP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico en preparación de comidas diversas',
        descripcion: 'Manipulación de ingredientes de diverso origen con riesgo biológico variable',
        riesgoPotencial: 'ETA por contaminación cruzada',
        efectosPosibles: 'Intoxicaciones, gastroenteritis',
        medidasControl: ['Carné de manipulación de alimentos', 'BPM', 'Control de temperaturas', 'Higiene rigurosa']
      },
      {
        codigo: 'COMNCP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo de incendio en cocinas con gas natural o propano',
        descripcion: 'Uso de combustibles gaseosos en cocinas con ventilación insuficiente',
        riesgoPotencial: 'Incendio y explosión',
        efectosPosibles: 'Quemaduras graves, explosión, muerte',
        medidasControl: ['Válvulas de cierre rápido', 'Extintor tipo K en cocina', 'Detector de gas', 'Mantenimiento de instalaciones de gas', 'Ventilación de campana']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Delantal ignífugo', 'Guantes anticorte', 'Calzado antideslizante', 'Gorra'],
    capacitacionesObligatorias: ['BPM cocinas', 'Prevención y control de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5621',
    descripcionCIIU: 'Catering para eventos',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'BIO-MEC-003', 'BIO-MEC-004', 'PSI-004'],
    peligrosEspecificos: [
      {
        codigo: 'CATER-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Transporte y servicio de alimentos fuera de instalaciones',
        descripcion: 'Manejo de alimentos en transporte, montaje y servicio en diferentes locaciones sin infraestructura fija',
        riesgoPotencial: 'Ruptura de cadena de frío y contaminación',
        efectosPosibles: 'Intoxicación alimentaria masiva en eventos',
        medidasControl: ['Contenedores isotérmicos certificados', 'Termómetros de control', 'Tiempo máximo de exposición de alimentos', 'BPM en cada etapa']
      },
      {
        codigo: 'CATER-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Transporte y montaje de equipos de catering pesados',
        descripcion: 'Carga de vajilla, equipos de cocción, mesas y estructuras para eventos',
        riesgoPotencial: 'Lesiones musculoesqueléticas por esfuerzo',
        efectosPosibles: 'Hernias, lumbalgias, lesiones articulares',
        medidasControl: ['Equipos de transporte (carretillas, rodachines)', 'Trabajo en equipo', 'Planificación de logística']
      },
      {
        codigo: 'CATER-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Jornadas extendidas en eventos nocturnos o de larga duración',
        descripcion: 'Trabajo en eventos que superan la jornada ordinaria, turnos nocturnos y de fin de semana',
        riesgoPotencial: 'Fatiga y accidentes por somnolencia',
        efectosPosibles: 'Errores, accidentes, agotamiento',
        medidasControl: ['Limitación de jornada según CST', 'Descansos compensatorios', 'Rotación de personal para eventos largos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos - catering', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes desechables', 'Gorra o cofia', 'Delantal', 'Calzado antideslizante', 'Guantes térmicos para servicio caliente'],
    capacitacionesObligatorias: ['BPM en catering y eventos', 'Manejo de cargas', 'Jornadas nocturnas y fatiga', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5629',
    descripcionCIIU: 'Actividades de otros servicios de comidas',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'BIO-MEC-001', 'SEG-006', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'SERVCOM-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en servicios de comida institucional',
        descripcion: 'Preparación masiva de alimentos para comedores institucionales, colegios, hospitales',
        riesgoPotencial: 'ETA con impacto masivo',
        efectosPosibles: 'Intoxicación colectiva, gastroenteritis grave',
        medidasControl: ['BPM rigurosas', 'HACCP para cocinas institucionales', 'Control de proveedores', 'Temperaturas de cocción y almacenamiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gorra o cofia', 'Delantal', 'Guantes desechables', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['BPM y HACCP en cocinas', 'Prevención de intoxicación masiva', 'Primeros auxilios']
  },

  {
    codigoCIIU: '5630',
    descripcionCIIU: 'Expendio de bebidas alcohólicas para el consumo dentro del establecimiento',
    nivelRiesgo: 'II',
    sector: 'Hotelería y restaurantes',
    peligrosPrioritarios: ['PSI-001', 'SEG-006', 'BIO-MEC-002', 'SEG-002', 'QUI-001'],
    peligrosEspecificos: [
      {
        codigo: 'BAR-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Exposición a violencia de clientes bajo efecto del alcohol',
        descripcion: 'Trabajo en ambiente donde clientes pueden estar bajo efectos del alcohol, generando agresividad',
        riesgoPotencial: 'Agresión física y psicológica',
        efectosPosibles: 'Trauma psicológico, lesiones físicas',
        medidasControl: ['Protocolo de manejo de clientes conflictivos', 'Comunicación directa con seguridad', 'Formación en desescalada de conflictos', 'Prohibición de ingreso en estado de embriaguez']
      },
      {
        codigo: 'BAR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio por inflamabilidad del alcohol',
        descripcion: 'Almacenamiento y despacho de bebidas alcohólicas de alta graduación en área de servicio',
        riesgoPotencial: 'Incendio',
        efectosPosibles: 'Quemaduras, intoxicación por humo, muerte',
        medidasControl: ['Almacenamiento separado de la fuente de calor', 'Extintor tipo BC en bar', 'No manipular fósforos cerca de dispensadores', 'Salidas de emergencia despejadas']
      },
      {
        codigo: 'BAR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido en establecimiento nocturno',
        descripcion: 'Exposición a música a alto volumen durante jornadas prolongadas',
        riesgoPotencial: 'Pérdida auditiva',
        efectosPosibles: 'Hipoacusia, tinnitus',
        medidasControl: ['Protección auditiva para baristas y personal de servicio', 'Audiometrías periódicas', 'Limitación de niveles de ruido según normativa municipal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-8321-1983', norma: 'Resolución 8321/1983', descripcion: 'Protección y conservación de la audición', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva', 'Calzado antideslizante', 'Guantes para manejo de vidrio'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial - violencia laboral', 'Conservación auditiva', 'Prevención de incendios', 'Primeros auxilios']
  },

  // ==================== SECCIÓN M - SERVICIOS PROFESIONALES, CIENTÍFICOS Y TÉCNICOS ====================

  {
    codigoCIIU: '6920',
    descripcionCIIU: 'Actividades de contabilidad, teneduría de libros, auditoría financiera y asesoría tributaria',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'PSI-004', 'FIS-002', 'PSI-003'],
    peligrosEspecificos: [
      {
        codigo: 'CONT-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo prolongado frente a pantalla (PVD)',
        descripcion: 'Uso intensivo de computador durante toda la jornada para análisis financiero, digitación y revisión de documentos',
        riesgoPotencial: 'Síndrome de fatiga visual y lesiones musculoesqueléticas',
        efectosPosibles: 'Síndrome del túnel carpiano, dolor cervical, fatiga visual digital, lumbalgia',
        medidasControl: ['Puesto ergonómico regulable (silla, pantalla, teclado)', 'Pausas cada 45-60 min', 'Regla 20-20-20 para vista', 'Evaluación ergonómica']
      },
      {
        codigo: 'CONT-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga de trabajo en temporadas de cierre y declaraciones',
        descripcion: 'Picos de trabajo extremos en cierres de mes/año y fechas de declaraciones tributarias',
        riesgoPotencial: 'Estrés agudo y burnout estacional',
        efectosPosibles: 'Agotamiento, errores por fatiga, ansiedad, trastornos del sueño',
        medidasControl: ['Planificación anticipada de tareas', 'Distribución equitativa de carga', 'Apoyo de personal adicional en temporadas pico', 'Horas extra con debido descanso compensatorio']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica regulable', 'Reposapiés', 'Monitor a altura adecuada', 'Teclado y ratón ergonómicos'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Prevención riesgo psicosocial', 'Higiene visual digital', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7010',
    descripcionCIIU: 'Actividades de administración empresarial',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002', 'PSI-004'],
    peligrosEspecificos: [
      {
        codigo: 'ADM-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta responsabilidad y toma de decisiones bajo presión',
        descripcion: 'Carga cognitiva elevada por gestión directiva, toma de decisiones estratégicas y manejo de conflictos organizacionales',
        riesgoPotencial: 'Estrés laboral crónico y burnout directivo',
        efectosPosibles: 'Trastornos cardiovasculares, ansiedad, depresión',
        medidasControl: ['Programa de gestión de riesgo psicosocial', 'Apoyo de equipo de trabajo', 'Delegación efectiva', 'Espacios de bienestar directivo']
      },
      {
        codigo: 'ADM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Sedentarismo por trabajo de oficina prolongado',
        descripcion: 'Permanencia sentado durante jornadas completas en gestión administrativa',
        riesgoPotencial: 'Enfermedad cardiovascular y musculoesquelética',
        efectosPosibles: 'Lumbalgia, síndrome metabólico, enfermedades cardiovasculares',
        medidasControl: ['Pausas activas programadas', 'Escritorio de pie opcional', 'Fomento de actividad física fuera de jornada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Monitor regulable'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Liderazgo saludable', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7020',
    descripcionCIIU: 'Actividades de consultoría de gestión',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'PSI-004', 'BIO-MEC-002', 'FIS-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'CONSUL-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Trabajo con clientes exigentes y plazos ajustados',
        descripcion: 'Entrega de proyectos de consultoría con deadlines estrictos y clientes de alta exigencia',
        riesgoPotencial: 'Estrés crónico y burnout',
        efectosPosibles: 'Agotamiento, ansiedad, errores en entregas',
        medidasControl: ['Gestión realista de alcances y tiempos', 'Comunicación clara con clientes', 'Programa de bienestar', 'Distribución equitativa de proyectos']
      },
      {
        codigo: 'CONSUL-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en campo y desplazamientos frecuentes',
        descripcion: 'Visitas a clientes, trabajo en instalaciones ajenas con condiciones variables de ergonomía',
        riesgoPotencial: 'Lesiones musculoesqueléticas y accidentes de tránsito',
        efectosPosibles: 'Dolor lumbar, lesiones por accidente vial',
        medidasControl: ['Gestión de seguridad vial (PESV)', 'Kits de trabajo ergonómico portátiles', 'Tiempo entre desplazamientos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Portátil con soporte elevado en campo'],
    capacitacionesObligatorias: ['Ergonomía en entornos variables', 'Seguridad vial', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7110',
    descripcionCIIU: 'Actividades de arquitectura e ingeniería y otras actividades conexas de consultoría técnica',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['SEG-001', 'SEG-002', 'BIO-MEC-002', 'PSI-001', 'QUI-002', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'ING-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Visitas de inspección a obras y ambientes industriales',
        descripcion: 'Trabajo de campo en obras en construcción, plantas industriales y sitios con riesgos múltiples',
        riesgoPotencial: 'Caídas, golpes y exposición a riesgos de campo',
        efectosPosibles: 'Traumatismos, caídas, lesiones diversas según el sitio visitado',
        medidasControl: ['EPP de campo obligatorio en visitas (casco, botas, gafas)', 'Inducción a cada sitio antes de visitar', 'Acompañamiento de personal del cliente']
      },
      {
        codigo: 'ING-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en oficina con uso intensivo de PVD',
        descripcion: 'Diseño CAD, modelado y elaboración de planos durante jornadas completas',
        riesgoPotencial: 'Lesiones musculoesqueléticas y fatiga visual',
        efectosPosibles: 'Dolor cervical, túnel carpiano, fatiga visual digital',
        medidasControl: ['Puesto ergonómico', 'Pantallas de alta resolución', 'Pausas activas cada hora', 'Evaluación ergonómica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas (visitas de campo)', obligatorio: false },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad para visitas de obra', 'Gafas de seguridad', 'Botas con puntera para campo', 'Chaleco reflectivo', 'Silla ergonómica para oficina'],
    capacitacionesObligatorias: ['Seguridad en visitas a campo y obras', 'Ergonomía en oficina', 'Riesgo eléctrico básico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7120',
    descripcionCIIU: 'Ensayos y análisis técnicos',
    nivelRiesgo: 'II',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'QUI-004', 'BIO-001', 'BIO-002', 'FIS-005', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'LAB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a reactivos y sustancias químicas de laboratorio',
        descripcion: 'Manejo de ácidos, bases, solventes, reactivos y muestras para análisis técnicos',
        riesgoPotencial: 'Intoxicación, quemaduras químicas',
        efectosPosibles: 'Quemaduras cutáneas y oculares, intoxicación aguda o crónica',
        medidasControl: ['Cabinas de extracción para reactivos volátiles', 'EPP completo (guantes, gafas, bata, mascarilla)', 'SDS actualizadas', 'Duchas de emergencia en laboratorio']
      },
      {
        codigo: 'LAB-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a radiaciones no ionizantes (UV, IR) en equipos de análisis',
        descripcion: 'Uso de equipos con radiación UV para esterilización, análisis ópticos y cromatografía',
        riesgoPotencial: 'Daño ocular y cutáneo por radiación',
        efectosPosibles: 'Fotoqueratitis, quemaduras UV, daño de retina',
        medidasControl: ['Gafas con protección UV', 'Nunca mirar directamente a la fuente UV', 'Uso de blindajes', 'Ropa de manga larga']
      },
      {
        codigo: 'LAB-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manejo de muestras biológicas en análisis',
        descripcion: 'Análisis de muestras de agua, suelo, alimentos y tejidos con posible contaminación biológica',
        riesgoPotencial: 'Infección por manejo de muestras',
        efectosPosibles: 'Infecciones bacterianas, virales, intoxicación por toxinas',
        medidasControl: ['Nivel de bioseguridad BSL-2 mínimo', 'Dobles guantes', 'Nunca pipetear con la boca', 'Autoclave para residuos biológicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial - laboratorios', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos peligrosos de laboratorio', obligatorio: true }
    ],
    eppRecomendado: ['Bata de laboratorio', 'Guantes de nitrilo (dobles en riesgo alto)', 'Gafas de seguridad con protección UV', 'Mascarilla FFP2', 'Calzado cerrado de seguridad'],
    capacitacionesObligatorias: ['Bioseguridad en laboratorio', 'Manejo de sustancias químicas peligrosas', 'Gestión de residuos de laboratorio', 'Primeros auxilios - quemaduras químicas']
  },

  {
    codigoCIIU: '7210',
    descripcionCIIU: 'Investigaciones y desarrollo experimental en ciencias naturales e ingeniería',
    nivelRiesgo: 'II',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'BIO-001', 'BIO-002', 'FIS-005', 'SEG-004', 'PSI-001'],
    peligrosEspecificos: [
      {
        codigo: 'IDI-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Manejo de sustancias experimentales y reactivos en I+D',
        descripcion: 'Uso de sustancias no catalogadas, reactivos de alta pureza y materiales experimentales',
        riesgoPotencial: 'Intoxicación por sustancias nuevas sin historial de exposición',
        efectosPosibles: 'Toxicidad aguda o crónica desconocida',
        medidasControl: ['Principio de precaución en manejo de nuevas sustancias', 'EPP completo', 'Cabinas de seguridad', 'Registro de experimentos y exposiciones']
      },
      {
        codigo: 'IDI-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Presión por publicación, resultados y financiación de investigaciones',
        descripcion: 'Estrés por evaluación de pares, entrega de proyectos, cumplimiento de métricas de investigación',
        riesgoPotencial: 'Estrés crónico y burnout académico',
        efectosPosibles: 'Ansiedad, depresión, abandono de carrera investigativa',
        medidasControl: ['Programa de bienestar para investigadores', 'Metas realistas de publicación', 'Cultura de apoyo entre pares']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos peligrosos', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Bata de laboratorio', 'Guantes de nitrilo', 'Gafas de seguridad', 'Mascarilla según sustancia', 'Protección UV'],
    capacitacionesObligatorias: ['Bioseguridad en I+D', 'Manejo de residuos de laboratorio', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7220',
    descripcionCIIU: 'Investigaciones y desarrollo experimental en ciencias sociales y humanidades',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'CIENSOC-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Exposición vicaria en investigaciones con poblaciones vulnerables',
        descripcion: 'Trabajo con comunidades víctimas de violencia, desplazamiento, pobreza extrema o trauma',
        riesgoPotencial: 'Trauma vicario y fatiga por compasión',
        efectosPosibles: 'Estrés traumático secundario, burnout, depresión',
        medidasControl: ['Supervisión y apoyo emocional para investigadores de campo', 'Rotación de equipos', 'Protocolos de contención emocional', 'Acceso a salud mental']
      },
      {
        codigo: 'CIENSOC-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de campo en condiciones de seguridad variables',
        descripcion: 'Investigación en zonas rurales, comunidades remotas o contextos de vulnerabilidad social',
        riesgoPotencial: 'Accidentes de campo y de tránsito',
        efectosPosibles: 'Lesiones en campo, accidentes viales',
        medidasControl: ['Protocolos de seguridad en campo', 'Comunicación permanente con base', 'Gestión de seguridad vial']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica de oficina', 'Botiquín de primeros auxilios para trabajo de campo'],
    capacitacionesObligatorias: ['Primeros auxilios psicológicos', 'Seguridad en campo y vial', 'Prevención riesgo psicosocial - fatiga compasión']
  },

  {
    codigoCIIU: '7310',
    descripcionCIIU: 'Publicidad',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'PSI-004', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'PUB-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta presión por creatividad, plazos y aprobación de clientes',
        descripcion: 'Trabajo con deadlines ajustados, revisiones múltiples y exigencia creativa constante',
        riesgoPotencial: 'Estrés creativo y burnout',
        efectosPosibles: 'Agotamiento, bloqueo creativo, ansiedad',
        medidasControl: ['Gestión realista de tiempos', 'Ambientes de trabajo estimulantes', 'Programa de bienestar laboral', 'Rotación de proyectos']
      },
      {
        codigo: 'PUB-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo prolongado frente a múltiples pantallas',
        descripcion: 'Diseño gráfico, edición de video y gestión de campañas con uso intensivo de PVD',
        riesgoPotencial: 'Fatiga visual y lesiones musculoesqueléticas',
        efectosPosibles: 'Fatiga visual digital, dolor cervical, túnel carpiano',
        medidasControl: ['Pantallas de alta calidad y calibradas', 'Silla ergonómica', 'Pausas visuales', 'Iluminación adecuada sin reflejos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Monitor calibrado de alta resolución', 'Filtro antireflex'],
    capacitacionesObligatorias: ['Ergonomía en oficina creativa', 'Higiene visual digital', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7320',
    descripcionCIIU: 'Estudios de mercado y realización de encuestas de opinión pública',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'PSI-003', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'MKT-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Trabajo monótono en encuestas telefónicas o en campo',
        descripcion: 'Realización repetitiva de encuestas, atención a respuestas negativas y rechazo de personas entrevistadas',
        riesgoPotencial: 'Fatiga emocional y monotonía laboral',
        efectosPosibles: 'Desmotivación, estrés, alta rotación',
        medidasControl: ['Rotación de tareas', 'Descansos frecuentes', 'Reconocimiento del trabajo', 'Límite de llamadas por hora']
      },
      {
        codigo: 'MKT-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo en trabajo de campo en zonas de encuesta',
        descripcion: 'Encuestadores en campo en zonas de alta inseguridad o entornos desconocidos',
        riesgoPotencial: 'Robo, agresión física',
        efectosPosibles: 'Lesiones físicas, trauma psicológico, pérdida de equipos',
        medidasControl: ['Evaluación de zonas de seguridad antes de enviar personal', 'Trabajo en parejas', 'Comunicación permanente con base', 'Protocolo ante incidentes de seguridad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Diadema ergonómica para encuestas telefónicas', 'Calzado cómodo para trabajo de campo'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial', 'Seguridad en campo', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7410',
    descripcionCIIU: 'Actividades especializadas de diseño',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-001', 'FIS-002', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'DIS-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de diseño frente a pantalla de alta demanda visual',
        descripcion: 'Diseño gráfico, industrial, de interiores o de moda con uso intensivo de pantallas y software especializado',
        riesgoPotencial: 'Fatiga visual y lesiones musculoesqueléticas',
        efectosPosibles: 'Ojo seco digital, dolor cervical, síndrome del túnel carpiano',
        medidasControl: ['Pantallas de alta calidad (mínimo Full HD)', 'Iluminación sin reflejos', 'Pausa activa cada 50 min', 'Ratón ergonómico y tableta gráfica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Tableta gráfica ergonómica', 'Monitor de alta calidad'],
    capacitacionesObligatorias: ['Ergonomía en diseño gráfico', 'Higiene visual digital', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7420',
    descripcionCIIU: 'Actividades de fotografía',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-004', 'FIS-005', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'FOTO-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a luz estroboscópica y flash de alta potencia',
        descripcion: 'Uso de flash de estudio, luces LED de alta intensidad y equipo de iluminación especializado',
        riesgoPotencial: 'Daño ocular',
        efectosPosibles: 'Fotofobia, daño de retina, crisis epilépticas (luz estroboscópica)',
        medidasControl: ['Nunca mirar directamente al flash', 'Uso de sincronizadores inalámbricos', 'Advertencia a modelos con epilepsia fotosensible']
      },
      {
        codigo: 'FOTO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Carga y transporte de equipo fotográfico pesado',
        descripcion: 'Transporte de cámaras, lentes, trípodes, iluminación y accesorios en sesiones de campo',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, lesiones de hombro, esguinces',
        medidasControl: ['Mochilas ergonómicas para equipo', 'Distribución del peso', 'Carretillas para equipo pesado en estudio']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas fotosensibles en exteriores', 'Rodilleras para tomas en suelo', 'Calzado cómodo para trabajo de pie'],
    capacitacionesObligatorias: ['Ergonomía con equipo fotográfico', 'Trabajo en alturas en fotografía aérea', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7490',
    descripcionCIIU: 'Otras actividades profesionales, científicas y técnicas n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'PROFNCP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en oficina o campo según la actividad específica',
        descripcion: 'Condiciones variables según actividad profesional específica, con riesgos ergonómicos de oficina o campo',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Dolor lumbar, cervical, fatiga visual',
        medidasControl: ['Evaluación ergonómica del puesto', 'Pausas activas', 'Ajuste de condiciones de trabajo según actividad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'EPP específico según actividad de campo'],
    capacitacionesObligatorias: ['Ergonomía específica según puesto', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '7500',
    descripcionCIIU: 'Actividades veterinarias',
    nivelRiesgo: 'II',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-003', 'QUI-001', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'VET-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Zoonosis en manejo de animales',
        descripcion: 'Contacto con animales enfermos o portadores de zoonosis como rabia, leptospirosis, brucela, toxoplasmosis',
        riesgoPotencial: 'Transmisión de enfermedades zoonóticas',
        efectosPosibles: 'Rabia, leptospirosis, brucelosis, psitacosis, toxoplasmosis',
        medidasControl: ['Vacunación antirrábica profiláctica', 'Guantes y mascarilla en examen de animales', 'Protocolo de mordedura/arañazo', 'Lavado de manos después de cada paciente']
      },
      {
        codigo: 'VET-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Mordeduras y arañazos de animales',
        descripcion: 'Manipulación de animales estresados o en dolor que pueden reaccionar agresivamente',
        riesgoPotencial: 'Heridas por mordedura y arañazo',
        efectosPosibles: 'Laceraciones, infecciones, transmisión de zoonosis',
        medidasControl: ['Técnicas de sujeción segura', 'Protocolos de sedación', 'Guantes de cuero para animales agresivos', 'Profilaxis post-exposición disponible']
      },
      {
        codigo: 'VET-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a fármacos veterinarios y anestésicos',
        descripcion: 'Manejo de ketamina, xilacina, antibióticos inyectables y citostáticos veterinarios',
        riesgoPotencial: 'Intoxicación accidental y sensibilización',
        efectosPosibles: 'Reacciones alérgicas, efectos neurológicos, sensibilización',
        medidasControl: ['Guantes en preparación de fármacos', 'Protección ocular', 'Nunca recapsular agujas', 'Contenedores para cortopunzantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2346-2007', norma: 'Resolución 2346/2007', descripcion: 'Evaluaciones médicas ocupacionales incluyendo zoonosis', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos biológico-infecciosos', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo y cuero (según animal)', 'Bata de laboratorio', 'Mascarilla FFP2', 'Gafas de seguridad', 'Botas de caucho', 'Delantal de plástico'],
    capacitacionesObligatorias: ['Prevención de zoonosis', 'Manejo seguro de fármacos veterinarios', 'Protocolo de mordedura y arañazo', 'Bioseguridad clínica', 'Primeros auxilios']
  },

  // ==================== SECCIÓN P - EDUCACIÓN ====================

  {
    codigoCIIU: '8511',
    descripcionCIIU: 'Educación de la primera infancia',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-003', 'PSI-001', 'PSI-002', 'BIO-MEC-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'EDU-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Alta exposición a enfermedades infecciosas de niños pequeños',
        descripcion: 'Contacto continuo con niños menores de 5 años con alta incidencia de infecciones respiratorias, gastrointestinales y cutáneas',
        riesgoPotencial: 'Enfermedades infecciosas de alta frecuencia',
        efectosPosibles: 'Gripa frecuente, gastroenteritis, conjuntivitis, varicela, mano-pie-boca',
        medidasControl: ['Vacunación del personal (influenza, MMR, varicela)', 'Lavado de manos frecuente', 'Mascarilla en epidemias', 'Limpieza y desinfección de juguetes', 'Dotación adecuada de EPP']
      },
      {
        codigo: 'EDU-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta demanda emocional en cuidado de primera infancia',
        descripcion: 'Atención de niños pequeños con alta demanda de atención, llanto prolongado, conflictos y exigencias de padres',
        riesgoPotencial: 'Fatiga emocional y estrés',
        efectosPosibles: 'Burnout, agotamiento emocional, ausentismo',
        medidasControl: ['Ratio niño-educador adecuado (máx. según lineamiento ICBF)', 'Rotación de grupos', 'Programa de bienestar docente', 'Canales de apoyo emocional']
      },
      {
        codigo: 'EDU-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Posturas inadecuadas al trabajar con niños pequeños (mesas bajas)',
        descripcion: 'Trabajo con mobiliario adaptado a la estatura infantil que obliga al adulto a agacharse, arrodillarse o trabajar encorvado',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, dolor de rodilla, tendinitis',
        medidasControl: ['Muebles regulables en altura', 'Pausas activas', 'Capacitación en biomecánica para educadores de primera infancia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'LIN-ICBF-CDI', norma: 'Lineamiento ICBF CDI', descripcion: 'Condiciones de calidad para educación inicial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para cambio de pañal', 'Mascarilla desechable', 'Delantal de trabajo', 'Calzado cómodo antideslizante'],
    capacitacionesObligatorias: ['Bioseguridad en primera infancia', 'Higiene postural con niños', 'Prevención riesgo psicosocial docente', 'Primeros auxilios pediátricos']
  },

  {
    codigoCIIU: '8512',
    descripcionCIIU: 'Educación preescolar',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'PSI-001', 'BIO-MEC-001', 'BIO-MEC-002', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'PRESC-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a enfermedades infecciosas en niños en edad preescolar',
        descripcion: 'Contacto con niños de 3 a 5 años con alta circulación de virus respiratorios, gastrointestinales y exantemas',
        riesgoPotencial: 'Contagio frecuente de enfermedades infecto-contagiosas',
        efectosPosibles: 'Resfriados frecuentes, gastroenteritis, varicela, conjuntivitis',
        medidasControl: ['Vacunación del personal', 'Higiene de manos', 'Ventilación de aulas', 'Aislamiento de niños enfermos', 'Limpieza de materiales didácticos']
      },
      {
        codigo: 'PRESC-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés y carga emocional en educación preescolar',
        descripcion: 'Manejo de grupos numerosos, conflictos entre niños y exigencias de padres en etapa sensible del desarrollo',
        riesgoPotencial: 'Burnout docente',
        efectosPosibles: 'Agotamiento emocional, ausentismo, desmotivación',
        medidasControl: ['Programa de bienestar docente', 'Tamaño de grupo adecuado', 'Apoyos pedagógicos y psicológicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla desechable en épocas de alta circulación viral', 'Calzado cómodo antideslizante'],
    capacitacionesObligatorias: ['Bioseguridad básica', 'Prevención riesgo psicosocial docente', 'Primeros auxilios pediátricos']
  },

  {
    codigoCIIU: '8513',
    descripcionCIIU: 'Educación básica primaria',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['BIO-001', 'PSI-001', 'PSI-002', 'BIO-MEC-002', 'FIS-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'PRIM-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Carga laboral y demandas administrativas excesivas',
        descripcion: 'Alta carga de trabajo docente incluyendo planeación, calificación, informes y atención a padres fuera de jornada',
        riesgoPotencial: 'Estrés crónico y burnout docente',
        efectosPosibles: 'Agotamiento, desmotivación, enfermedades relacionadas con el estrés',
        medidasControl: ['Distribución equitativa de carga administrativa', 'Horas de preparación incluidas en jornada', 'Programa de bienestar docente']
      },
      {
        codigo: 'PRIM-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Disfonia y problemas de voz por uso intensivo de la voz',
        descripcion: 'Proyección de voz continua durante clases, en aulas con mala acústica o ruido ambiental',
        riesgoPotencial: 'Patología vocal',
        efectosPosibles: 'Disfonía funcional, nódulos en cuerdas vocales, laringitis crónica',
        medidasControl: ['Técnica vocal', 'Micrófonos en aulas grandes', 'Hidratación frecuente', 'Evaluación fonoaudiológica periódica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo', 'Mascarilla en épocas de alta circulación viral'],
    capacitacionesObligatorias: ['Higiene vocal', 'Prevención riesgo psicosocial docente', 'Bioseguridad básica', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8521',
    descripcionCIIU: 'Educación básica secundaria',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-001', 'FIS-001', 'BIO-MEC-002', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'SECU-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Violencia escolar y conflicto con estudiantes',
        descripcion: 'Confrontaciones, situaciones de conflicto o agresión por parte de estudiantes adolescentes',
        riesgoPotencial: 'Violencia laboral y trauma psicológico',
        efectosPosibles: 'Estrés postraumático, burnout, miedo a ir al trabajo',
        medidasControl: ['Protocolos de convivencia escolar', 'Ruta de atención a violencia escolar', 'Apoyo psicológico al docente', 'Trabajo con orientación escolar']
      },
      {
        codigo: 'SECU-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Problemas de voz por exposición a ruido de adolescentes',
        descripcion: 'Grupos numerosos de adolescentes con alto nivel de ruido obligan al docente a forzar la voz',
        riesgoPotencial: 'Patología vocal y estrés auditivo',
        efectosPosibles: 'Nódulos vocales, disfonía, cefalea por ruido',
        medidasControl: ['Técnica vocal', 'Sistemas de amplificación en aulas grandes', 'Control de ruido en el aula', 'Hidratación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'LEY-1620-2013', norma: 'Ley 1620/2013', descripcion: 'Sistema de Convivencia Escolar', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo', 'Mascarilla en temporadas de gripa'],
    capacitacionesObligatorias: ['Convivencia escolar y manejo de conflictos', 'Higiene vocal', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8522',
    descripcionCIIU: 'Educación media académica',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-001', 'FIS-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'MEDIA-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Presión académica y carga evaluativa',
        descripcion: 'Alta exigencia en preparación de estudiantes para pruebas de Estado (ICFES) y educación superior',
        riesgoPotencial: 'Estrés docente por resultados académicos',
        efectosPosibles: 'Burnout, ansiedad, desmotivación',
        medidasControl: ['Metas realistas alineadas con contexto institucional', 'Apoyo pedagógico', 'Programa de bienestar docente']
      },
      {
        codigo: 'MEDIA-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Disfonía por uso intensivo de la voz',
        descripcion: 'Clases magistrales con uso extenso de la voz en salones con mala acústica',
        riesgoPotencial: 'Patología vocal crónica',
        efectosPosibles: 'Nódulos, laringitis, afonia recurrente',
        medidasControl: ['Evaluación fonoaudiológica en ingreso', 'Técnica vocal', 'Sistemas de amplificación', 'Hidratación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo', 'Micrófono portátil en aulas grandes'],
    capacitacionesObligatorias: ['Higiene vocal', 'Prevención riesgo psicosocial docente', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8523',
    descripcionCIIU: 'Educación media técnica y de formación laboral',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'PSI-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'TECMED-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo en talleres técnicos con estudiantes',
        descripcion: 'Uso de maquinaria, herramientas eléctricas y equipos de taller en prácticas con estudiantes sin experiencia',
        riesgoPotencial: 'Accidentes por uso inadecuado de maquinaria',
        efectosPosibles: 'Cortes, quemaduras, golpes, amputaciones',
        medidasControl: ['Guardas de seguridad en toda maquinaria', 'Supervisión directa en talleres', 'EPP obligatorio para prácticas', 'Inducción de seguridad antes de cada práctica']
      },
      {
        codigo: 'TECMED-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a sustancias en talleres técnicos (soldadura, pintura, química)',
        descripcion: 'Prácticas con soldadura, pintura, productos químicos según la especialidad técnica',
        riesgoPotencial: 'Exposición a humos, solventes, ácidos',
        efectosPosibles: 'Irritación respiratoria, intoxicación, quemaduras',
        medidasControl: ['Ventilación de talleres', 'EPP específico por taller', 'Supervisión de docente', 'SDS disponibles']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial en talleres', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad en talleres', 'Gafas de seguridad', 'Guantes de cuero', 'Calzado con puntera', 'Mascarilla según especialidad'],
    capacitacionesObligatorias: ['Seguridad en talleres técnicos', 'Supervisión segura de prácticas', 'Manejo de EPP', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8541',
    descripcionCIIU: 'Educación técnica profesional',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'BIO-001', 'SEG-005', 'BIO-MEC-002', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'TECPRO-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga docente en programas técnicos con prácticas',
        descripcion: 'Coordinación de componente teórico y práctico con exigencias de Ministerio de Educación',
        riesgoPotencial: 'Estrés por doble rol (docente-tutor de práctica)',
        efectosPosibles: 'Burnout, agotamiento, errores en supervisión',
        medidasControl: ['Distribución de carga entre teoría y práctica', 'Apoyo administrativo', 'Programa de bienestar docente']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['EPP específico según área técnica de enseñanza'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial', 'Seguridad en prácticas técnicas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8542',
    descripcionCIIU: 'Educación tecnológica',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'FIS-002', 'BIO-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'TECNO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Uso intensivo de PVD en programas tecnológicos',
        descripcion: 'Docentes y estudiantes con alto uso de computadores, simuladores y equipos tecnológicos',
        riesgoPotencial: 'Lesiones musculoesqueléticas y fatiga visual',
        efectosPosibles: 'Dolor cervical, túnel carpiano, fatiga visual digital',
        medidasControl: ['Puestos de cómputo ergonómicos', 'Pausas cada hora', 'Evaluación ergonómica de laboratorios de sistemas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica en laboratorios', 'Filtro antireflex en monitores'],
    capacitacionesObligatorias: ['Ergonomía en laboratorios de cómputo', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8543',
    descripcionCIIU: 'Educación de instituciones universitarias o de escuelas tecnológicas',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'PSI-004', 'BIO-MEC-002', 'FIS-002', 'QUI-001', 'BIO-001'],
    peligrosEspecificos: [
      {
        codigo: 'IU-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Triple rol docente: enseñanza, investigación y extensión',
        descripcion: 'Exigencias simultáneas de dictado de clases, producción académica, proyectos de extensión y administración',
        riesgoPotencial: 'Sobrecarga laboral y burnout docente',
        efectosPosibles: 'Agotamiento, ansiedad, deterioro de calidad académica',
        medidasControl: ['Distribución equitativa de roles', 'Reconocimiento de horas de investigación', 'Programa de bienestar docente universitario']
      },
      {
        codigo: 'IU-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a sustancias en laboratorios de docencia',
        descripcion: 'Preparación y supervisión de prácticas de laboratorio con reactivos químicos',
        riesgoPotencial: 'Intoxicación o quemaduras en supervisión',
        efectosPosibles: 'Quemaduras, irritación ocular o respiratoria',
        medidasControl: ['EPP completo en laboratorio', 'Cabinas de extracción', 'SDS actualizadas', 'Supervisión de prácticas con EPP']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['EPP de laboratorio según materia', 'Silla ergonómica en oficina docente'],
    capacitacionesObligatorias: ['Bioseguridad en laboratorios docentes', 'Prevención riesgo psicosocial', 'Higiene vocal', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8544',
    descripcionCIIU: 'Educación de universidades',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-002', 'QUI-001', 'BIO-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'UNIV-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Presión por producción académica y productividad investigativa',
        descripcion: 'Exigencias de publicaciones indexadas, ponencias, proyectos, y evaluaciones de pares con indicadores cuantitativos',
        riesgoPotencial: 'Burnout académico y estrés crónico',
        efectosPosibles: 'Agotamiento extremo, depresión, deterioro de relaciones interpersonales',
        medidasControl: ['Cargas de investigación razonables', 'Cultura de colaboración', 'Acceso a salud mental', 'Reconocimiento del trabajo académico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica en oficina', 'EPP de laboratorio según área de investigación'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial universitario', 'Higiene vocal', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8551',
    descripcionCIIU: 'Formación para el trabajo y el desarrollo humano',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'BIO-001', 'FIS-001', 'BIO-MEC-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'FORM-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Disfonía en capacitaciones intensivas',
        descripcion: 'Dictado de cursos intensivos de varias horas con uso continuo de la voz',
        riesgoPotencial: 'Patología vocal aguda',
        efectosPosibles: 'Disfonía aguda, laringitis, afonia temporal',
        medidasControl: ['Técnica vocal adecuada', 'Micrófonos en grupos grandes', 'Hidratación frecuente', 'Descansos vocales entre sesiones']
      },
      {
        codigo: 'FORM-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Carga alta en diseño y dictado de múltiples cursos',
        descripcion: 'Formadores con alta carga por diseño instruccional, preparación de materiales y evaluación',
        riesgoPotencial: 'Sobrecarga laboral',
        efectosPosibles: 'Fatiga, errores en contenidos, baja calidad de formación',
        medidasControl: ['Distribución razonable de cursos por formador', 'Apoyo en diseño instruccional', 'Evaluación de carga de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Micrófono portátil', 'Calzado cómodo', 'EPP según área técnica de formación'],
    capacitacionesObligatorias: ['Higiene vocal', 'Ergonomía en formación', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8552',
    descripcionCIIU: 'Enseñanza deportiva y recreativa',
    nivelRiesgo: 'II',
    sector: 'Educación',
    peligrosPrioritarios: ['BIO-MEC-004', 'SEG-002', 'FIS-004', 'BIO-001', 'SEG-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'DEP-EDU-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Accidentes deportivos durante clases y entrenamientos',
        descripcion: 'Entrenamiento físico intensivo con riesgo de caídas, golpes y lesiones deportivas',
        riesgoPotencial: 'Lesiones musculoesqueléticas y traumatismos',
        efectosPosibles: 'Esguinces, fracturas, contusiones, lesiones de columna',
        medidasControl: ['Calentamiento previo obligatorio', 'Superficies de entrenamiento adecuadas', 'Equipos de protección deportiva', 'Protocolo de atención a lesiones', 'Botiquín de primeros auxilios en instalación']
      },
      {
        codigo: 'DEP-EDU-002',
        clasificacion: 'fisico',
        peligro: 'Exposición solar en entrenamiento al aire libre',
        descripcion: 'Clases y entrenamientos deportivos en canchas o espacios exteriores sin protección solar adecuada',
        riesgoPotencial: 'Estrés térmico e insolación',
        efectosPosibles: 'Golpe de calor, deshidratación, quemaduras solares',
        medidasControl: ['Hidratación frecuente antes, durante y después', 'Sombreros', 'Horarios evitando el mediodía', 'Bloqueador solar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado deportivo adecuado', 'Protectores según deporte', 'Bloqueador solar', 'Sombrero en exterior'],
    capacitacionesObligatorias: ['Primeros auxilios deportivos', 'Prevención de golpe de calor', 'Técnicas de calentamiento y estiramiento']
  },

  {
    codigoCIIU: '8553',
    descripcionCIIU: 'Enseñanza cultural',
    nivelRiesgo: 'I',
    sector: 'Educación',
    peligrosPrioritarios: ['FIS-001', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'CULT-EDU-001',
        clasificacion: 'biomecanico',
        peligro: 'Posturas específicas en enseñanza de artes escénicas y música',
        descripcion: 'Posturas de instrumento musical, danza o actuación con riesgo de lesión por movimientos repetitivos o forzados',
        riesgoPotencial: 'Lesiones músculo-esqueléticas específicas del arte',
        efectosPosibles: 'Tendinitis de instrumentista, lesiones de bailarín, disfonía vocal',
        medidasControl: ['Calentamiento antes de sesiones', 'Técnica correcta de instrumento o movimiento', 'Descansos activos', 'Evaluación médica especializada en medicina de las artes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva para músicos expuestos a alto volumen', 'Calzado de baile adecuado'],
    capacitacionesObligatorias: ['Medicina de las artes y prevención de lesiones', 'Conservación auditiva en músicos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8559',
    descripcionCIIU: 'Otros tipos de educación n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'FIS-001', 'BIO-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'EDNCP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés por variabilidad de grupos y temáticas de formación',
        descripcion: 'Instructores que atienden grupos muy diversos en contenido, edad o nivel educativo',
        riesgoPotencial: 'Fatiga cognitiva y estrés',
        efectosPosibles: 'Agotamiento mental, errores en contenidos',
        medidasControl: ['Especialización o segmentación de instructores', 'Tiempo de preparación adecuado', 'Programa de bienestar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo', 'Micrófono portátil en grupos grandes'],
    capacitacionesObligatorias: ['Higiene vocal', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8560',
    descripcionCIIU: 'Actividades de apoyo a la educación',
    nivelRiesgo: 'I',
    sector: 'Educación',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'BIO-001', 'SEG-002', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'APOYED-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Carga administrativa y relacional en apoyo educativo',
        descripcion: 'Orientadores, psicólogos y trabajadores sociales en entornos educativos con alta demanda emocional',
        riesgoPotencial: 'Fatiga emocional y burnout',
        efectosPosibles: 'Agotamiento, trauma vicario, desmotivación',
        medidasControl: ['Supervisión y apoyo entre pares', 'Límite de casos por profesional', 'Espacio de descarga emocional', 'Acceso a salud mental']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica en oficina'],
    capacitacionesObligatorias: ['Autocuidado emocional', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  // ==================== SECCIÓN Q - SALUD Y SERVICIOS SOCIALES ====================

    {
    codigoCIIU: '8621',
    descripcionCIIU: 'Actividades de la práctica médica, sin internación',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-005', 'QUI-015', 'FIS-007', 'PSI-001', 'PSI-005', 'PSI-006', 'BIO-MEC-002', 'SEG-012'],
    peligrosEspecificos: [
      {
        codigo: 'MED-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a agentes infecciosos en consulta médica ambulatoria',
        descripcion: 'Contacto con pacientes portadores de enfermedades infectocontagiosas (COVID-19, influenza, TBC, varicela) en consultorio médico o en domicilio',
        riesgoPotencial: 'Infecciones nosocomiales y comunitarias de origen ocupacional',
        efectosPosibles: 'COVID-19, tuberculosis laboral, influenza grave, hepatitis A, infecciones respiratorias',
        medidasControl: ['EPP según nivel de precaución (estándar / gotas / aerosoles)', 'Lavado de manos antes y después de cada paciente (5 momentos OMS)', 'Vacunación anual de influenza, Hepatitis B completa', 'Ventilación adecuada del consultorio (renovaciones de aire)', 'Triaje respiratorio para separar pacientes febriles']
      },
      {
        codigo: 'MED-BIO-002',
        clasificacion: 'biologico',
        peligro: 'Accidente con cortopunzante en procedimientos ambulatorios',
        descripcion: 'Pinchazos con agujas de sutura, agujas hipodérmicas o instrumentos cortantes durante procedimientos como suturas, biopsias, inyecciones e infiltraciones',
        riesgoPotencial: 'Infección por VIH, Hepatitis B y C',
        efectosPosibles: 'Hepatitis B, hepatitis C, VIH, infecciones bacterianas post-pinchazo',
        medidasControl: ['Agujas de seguridad con mecanismo de retracción', 'Nunca reencapuchar con dos manos', 'Contenedor de cortopunzantes en el punto de atención', 'Protocolo post-exposición disponible y conocido', 'Vacunación obligatoria VHB antes del inicio de la práctica clínica']
      },
      {
        codigo: 'MED-BIO-003',
        clasificacion: 'biologico',
        peligro: 'Manejo de residuos biológicos en consultorio médico ambulatorio',
        descripcion: 'Disposición de gasas con sangre, guantes contaminados, material de curación y cortopunzantes generados en la consulta médica ambulatoria',
        riesgoPotencial: 'Infección del personal de aseo o de servicios generales',
        efectosPosibles: 'Infecciones por contacto con residuos biológicos, pinchazos con agujas en basura',
        medidasControl: ['Bolsa roja para residuos infecciosos (incluye material de curación)', 'Contenedor rígido de cortopunzantes en sala de procedimientos', 'Capacitación al personal de aseo en manejo de residuos biológicos', 'Gestor ambiental autorizado para recolección']
      },
      {
        codigo: 'MED-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes en consultorios con equipo de radiología',
        descripcion: 'Uso de equipos de rayos X (periapical, portable) en consultorios médicos con capacidad de imágenes diagnósticas',
        riesgoPotencial: 'Daño por radiación ionizante acumulativa',
        efectosPosibles: 'Daño celular acumulativo, leucemia, cáncer de tiroides en exposición crónica sin protección',
        medidasControl: ['Dosímetro personal obligatorio con lectura mensual', 'Delantal plomado y protector tiroideo', 'Posición a mínimo 1.5 m del cabezal o detrás de barrera', 'Inspección del equipo por SNC/INVIMA cada 2 años', 'Restricción en mujeres embarazadas']
      },
      {
        codigo: 'MED-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Desinfectantes y antisépticos en consultorio (clorhexidina, H₂O₂, hipoclorito)',
        descripcion: 'Uso frecuente de soluciones desinfectantes para superficies y antisépticos para procedimientos en consultorio médico',
        riesgoPotencial: 'Irritación respiratoria y dermatitis de contacto',
        efectosPosibles: 'Dermatitis de contacto en manos, asma leve por inhalación crónica, irritación de mucosas',
        medidasControl: ['Guantes de nitrilo para manipulación', 'Diluciones correctas según ficha técnica', 'Ventilación adecuada del consultorio', 'No mezclar hipoclorito con amonio cuaternario', 'Crema barrera y emolientes para higiene frecuente de manos']
      },
      {
        codigo: 'MED-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Postura sedente prolongada y trabajo con pantalla (historia clínica electrónica)',
        descripcion: 'Trabajo sedentario continuo frente a computador durante la consulta médica y diligenciamiento de historias clínicas electrónicas — hasta 8-10 horas diarias',
        riesgoPotencial: 'Trastornos musculoesqueléticos cervicales y de extremidad superior',
        efectosPosibles: 'Cervicalgia, dorsalgia, síndrome visual informático, síndrome del túnel carpiano, lumbalgias',
        medidasControl: ['Silla ergonómica regulable con soporte lumbar', 'Monitor a altura de ojos a 50-70 cm', 'Regla 20-20-20 para la vista', 'Pausas activas cada 45-60 minutos', 'Teclado y ratón ergonómico']
      },
      {
        codigo: 'MED-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga asistencial, presión por número de consultas y burnout médico',
        descripcion: 'Sistemas de salud colombianos (IPS, EPS) con alta presión de consultas por hora (5-7 min/paciente), escasa autonomía clínica, trámites de autorización y alta responsabilidad',
        riesgoPotencial: 'Burnout médico de alta prevalencia en Colombia',
        efectosPosibles: 'Agotamiento emocional, despersonalización, errores clínicos, abandono de la medicina, depresión, suicidio profesional',
        medidasControl: ['Número de consultas por hora razonable (máximo 3-4 consultas/hora para medicina general)', 'Apoyo psicológico disponible para el personal médico', 'Programa de bienestar laboral con actividades de autocuidado', 'Autonomía clínica real (no solo protocolos)', 'Batería de riesgo psicosocial MINTRA anual']
      },
      {
        codigo: 'MED-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Violencia verbal y física de pacientes o familiares',
        descripcion: 'Agresiones verbales, amenazas e incluso agresiones físicas de pacientes insatisfechos, familiares o personas bajo sustancias psicoactivas en sala de espera y consultorios',
        riesgoPotencial: 'Trauma psicológico, lesiones físicas',
        efectosPosibles: 'TEPT, lesiones físicas, ausentismo, abandono del cargo',
        medidasControl: ['Protocolo de atención al usuario agresivo', 'Capacitación en desescalada verbal y manejo de conflictos', 'Sistema de alarma o botón de pánico', 'Nunca atender solo a pacientes con historial de agresividad', 'Reporte y estadística de incidentes de violencia']
      },
      {
        codigo: 'MED-PSI-003',
        clasificacion: 'psicosocial',
        peligro: 'Carga emocional y fatiga por compasión en médico de familia y general',
        descripcion: 'Acompañamiento de pacientes con enfermedades crónicas, terminales o situaciones familiares complejas que generan desgaste emocional acumulativo en el médico',
        riesgoPotencial: 'Fatiga por compasión, burnout empático',
        efectosPosibles: 'Despersonalización, agotamiento emocional, abandono de la empatía clínica, depresión',
        medidasControl: ['Grupos de reflexión clínica entre pares', 'Acceso a psicólogo ocupacional', 'Capacitación en manejo del duelo y autocuidado emocional', 'Reconocimiento del impacto emocional del trabajo médico', 'Rotación periódica de especialidades o tipo de consulta']
      },
      {
        codigo: 'MED-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en domicilio o zonas de difícil acceso (médico rural, visita domiciliaria)',
        descripcion: 'Atención médica en domicilios, zonas rurales o de difícil acceso con riesgo de seguridad pública, accidente de tránsito y trabajo en solitario',
        riesgoPotencial: 'Accidente de tránsito, agresión, trabajo en solitario sin apoyo',
        efectosPosibles: 'Politrauma por accidente de tránsito, agresión, accidente sin atención oportuna',
        medidasControl: ['Evaluación de riesgo de zona antes de visita domiciliaria', 'Comunicación periódica con base o coordinación', 'No visitar zonas de alto riesgo sin acompañante', 'GPS o check-in de ubicación', 'Kit de emergencias médicas portátil']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Adopción del Manual de Buenas Prácticas en Radiología', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos biológico-infecciosos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Bata de laboratorio o uniforme clínico', 'Guantes de nitrilo', 'Mascarilla FFP2 / N95', 'Gafas de protección splash', 'Delantal plomado en consultorios con Rx', 'Dosímetro personal TLD (si hay radiación)', 'Calzado cerrado cómodo'],
    capacitacionesObligatorias: ['Bioseguridad en atención médica ambulatoria y precauciones estándar', 'Protocolo post-exposición a accidente biológico', 'Manejo de residuos biológicos en consultorio', 'Prevención riesgo psicosocial en salud (Res. 2646)', 'Radioprotección (si hay equipo de Rx)', 'RCP básico y primeros auxilios', 'Manejo del paciente agresivo']
  },

    {
    codigoCIIU: '8691',
    descripcionCIIU: 'Actividades de apoyo diagnóstico (laboratorio clínico, imágenes diagnósticas)',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-005', 'QUI-003', 'QUI-009', 'FIS-007', 'PSI-001', 'BIO-MEC-005', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'DIAG-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manejo de muestras biológicas con alto riesgo infeccioso (sangre, LCR, tejidos)',
        descripcion: 'Procesamiento de muestras clínicas (hemocultivos, BK, muestras de LCR, biopsias) en laboratorio clínico con posibilidad de exposición a patógenos de nivel BSL-2 y BSL-3',
        riesgoPotencial: 'Infección por accidente biológico en laboratorio',
        efectosPosibles: 'VIH, Hepatitis B y C, TBC (laboratorio de micobacterias), Brucella, otras infecciones',
        medidasControl: ['Nivel de bioseguridad BSL-2 como mínimo', 'Cabina de bioseguridad Clase II tipo A2 para muestras de alto riesgo', 'Doble guante en muestras de pacientes con infecciones conocidas de alto riesgo', 'Nunca pipetear con la boca', 'Centrifugación en rotor cerrado o cabina de bioseguridad', 'Protocolo post-exposición con reporte inmediato en < 2 horas']
      },
      {
        codigo: 'DIAG-BIO-002',
        clasificacion: 'biologico',
        peligro: 'Exposición a aerosoles biológicos en laboratorio de microbiología',
        descripcion: 'Generación de aerosoles contaminantes durante siembra de cultivos, agitación de tubos, trabajo con muestras de pacientes con enfermedades respiratorias (TBC, COVID)',
        riesgoPotencial: 'Infección respiratoria de origen laboral',
        efectosPosibles: 'Tuberculosis laboral (especialmente en laboratorio de micobacterias), infecciones respiratorias diversas',
        medidasControl: ['Cabina de bioseguridad Clase II para todo trabajo con cultivos', 'Mascarilla N95 obligatoria en laboratorio de micobacterias', 'Prueba PPD anual al personal de laboratorio de microbiología', 'No abrir tubos fuera de la cabina', 'Descontaminación de superficies con hipoclorito al 0.5% tras trabajo']
      },
      {
        codigo: 'DIAG-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Reactivos de laboratorio clínico (ácidos, bases, solventes, colorantes)',
        descripcion: 'Uso de reactivos para tinción de Gram, Ziehl-Neelsen, análisis bioquímico, inmunohistoquímica y procesamiento de muestras con ácido clorhídrico, metanol, acetona, formalina',
        riesgoPotencial: 'Quemaduras químicas, irritación e intoxicación crónica',
        efectosPosibles: 'Quemaduras oculares y cutáneas, irritación respiratoria crónica, dermatitis de contacto, hepatotoxicidad por metanol',
        medidasControl: ['Cabina de extracción química para trabajo con reactivos volátiles', 'Gafas de seguridad obligatorias en el laboratorio', 'Guantes de nitrilo (cambio frecuente)', 'Ducha lavaojos en cada área del laboratorio', 'SDS (fichas de seguridad) actualizadas y accesibles', 'Almacenamiento segregado según compatibilidad química']
      },
      {
        codigo: 'DIAG-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Formaldehído en anatomía patológica e histopatología',
        descripcion: 'Exposición a vapores de formaldehído en la fijación de biopsias, piezas quirúrgicas y muestras anatomopatológicas en el servicio de patología',
        riesgoPotencial: 'Carcinogenicidad nasofaríngea (IARC Grupo 1), sensibilización',
        efectosPosibles: 'Cáncer nasofaríngeo, leucemia, dermatitis de contacto, asma ocupacional, conjuntivitis crónica',
        medidasControl: ['Campana de extracción de vapores en área de macroscopía', 'Guantes de nitrilo gruesos o neopreno con cambio frecuente', 'Gafas de protección y mascarilla con filtro de vapores orgánicos', 'Monitoreo ambiental de formaldehído (máximo 0.3 ppm ACGIH)', 'Usar formalina al 10% neutral tamponada (no formaldehído concentrado)', 'Sustituir por fijadores alternativos cuando sea posible']
      },
      {
        codigo: 'DIAG-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes en imágenes diagnósticas (Rx, TAC, fluoroscopía, gammagrafía)',
        descripcion: 'Operación de equipos de radiología convencional, tomografía computada, fluoroscopía, densitometría ósea y medicina nuclear (gammagrafía, PET)',
        riesgoPotencial: 'Cáncer, leucemia, cataratas por radiación ionizante crónica',
        efectosPosibles: 'Leucemia mieloide, cáncer de tiroides y mama (mujeres), cataratas por radiación ionizante, daño fetal en embarazadas',
        medidasControl: ['Dosímetro personal TLD u OSL obligatorio con lectura mensual', 'Delantal plomado ≥0.5mm Pb y protector tiroideo', 'Trabajo detrás de mamparas plomadas o a distancia de seguridad', 'Principios ALARA aplicados en cada exposición', 'Restricción en mujeres embarazadas con reasignación inmediata', 'Límite de dosis 50 mSv/año con registro histórico individual']
      },
      {
        codigo: 'DIAG-FIS-002',
        clasificacion: 'fisico',
        peligro: 'Campos electromagnéticos intensos en resonancia magnética (RM)',
        descripcion: 'Exposición a campos magnéticos estáticos de alta intensidad (1.5T - 3T) y campos de radiofrecuencia en salas de resonancia magnética',
        riesgoPotencial: 'Efecto proyectil de objetos metálicos, quemaduras por calentamiento, interferencia con implantes',
        efectosPosibles: 'Quemaduras dérmicas por dispositivos conductores, interferencia con marcapasos e implantes cocleares, efecto proyectil de objetos ferromagnéticos',
        medidasControl: ['Cribado metálico estricto antes de entrar a sala de RM (cuestionario + detector)', 'Restricción absoluta de portadores de marcapasos, desfibriladores y clips de aneurisma en zona 3 y 4', 'Entrenamiento anual de todo el personal en seguridad en RM', 'Señalización de zonas de acceso restringido (zona 1, 2, 3, 4)', 'Nunca entrar con objetos metálicos al campo magnético']
      },
      {
        codigo: 'DIAG-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo sedentario prolongado con pantallas (interpretación de imágenes)',
        descripcion: 'Lectura e interpretación de imágenes diagnósticas (radiología, ecografía, patología digital) durante horas continuas frente a monitores de alta resolución',
        riesgoPotencial: 'Síndrome visual informático, trastornos musculoesqueléticos cervicales',
        efectosPosibles: 'Ojo seco, cefalea visual, miopía progresiva, cervicalgia, síndrome del túnel carpiano en ecografistas',
        medidasControl: ['Monitores calibrados DICOM a 50-70 cm de distancia', 'Regla 20-20-20 estricta', 'Iluminación ambiental controlada sin reflejos en pantallas', 'Examen visual anual para personal de radiología', 'Pausas de 10 minutos cada hora de interpretación continua']
      },
      {
        codigo: 'DIAG-BIO-MEC-002',
        clasificacion: 'biomecanico',
        peligro: 'Posturas forzadas en ecografía y sonografía',
        descripcion: 'Mantenimiento de posturas estáticas con abducción y elevación del brazo derecho durante procedimientos ecográficos (ecografía abdominal, obstétrica, ecocardiografía)',
        riesgoPotencial: 'Síndrome de hombro doloroso y tendinitis del manguito rotador',
        efectosPosibles: 'Tendinitis del supraespinoso, síndrome de hombro doloroso, bursitis subacromial, epicondilitis',
        medidasControl: ['Mesa de exploración a altura regulable sin forzar la elevación del brazo', 'Transductor con mango ergonómico', 'Fuerza de agarre mínima sobre el transductor', 'Pausas activas cada 45 minutos con ejercicios de hombro', 'Evaluación ergonómica específica para ecografistas anual']
      },
      {
        codigo: 'DIAG-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta exigencia técnica y responsabilidad diagnóstica',
        descripcion: 'Responsabilidad sobre diagnósticos que condicionan tratamientos críticos, con presión de tiempo y alto volumen de casos en laboratorio y radiología',
        riesgoPotencial: 'Burnout del especialista diagnóstico, errores diagnósticos por fatiga',
        efectosPosibles: 'Burnout, errores diagnósticos con consecuencias para pacientes, deterioro cognitivo por fatiga, depresión',
        medidasControl: ['Número razonable de estudios por día (estándares ACR/RSNA para radiología)', 'Doble lectura en casos complejos', 'Apoyo psicológico institucional', 'Capacitación en prevención del error diagnóstico', 'Batería de riesgo psicosocial MINTRA anual']
      },
      {
        codigo: 'DIAG-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico de equipos biomédicos de diagnóstico',
        descripcion: 'Contacto con equipos biomédicos de alta tecnología (tomógrafos, resonadores, equipos de angiografía) con alto consumo eléctrico y riesgo de falla en ambiente húmedo',
        riesgoPotencial: 'Electrocución, incendio eléctrico por falla de equipos',
        efectosPosibles: 'Quemaduras eléctricas, fibrilación ventricular, incendio de sala',
        medidasControl: ['Programa de mantenimiento preventivo certificado de equipos biomédicos', 'Revisión de conexiones a tierra en equipos de alta potencia', 'No operar equipos con signos de daño eléctrico', 'Extintor de CO₂ en sala de equipos (no agua)', 'Capacitación en seguridad eléctrica básica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Buenas Prácticas en Radiología e Imágenes Diagnósticas', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos biológico-infecciosos y peligrosos', obligatorio: true },
      { codigo: 'RES-1995-1999', norma: 'Resolución 1995/1999', descripcion: 'Historias clínicas y registros de laboratorio', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true }
    ],
    eppRecomendado: ['Bata de laboratorio manga larga', 'Guantes de nitrilo dobles para muestras de alto riesgo', 'Gafas de seguridad en laboratorio', 'Mascarilla N95 en microbiología y micobacterias', 'Calzado cerrado y antideslizante', 'Dosímetro personal TLD (personal de radiología)', 'Delantal plomado (radiología)', 'Protector tiroideo (radiología)'],
    capacitacionesObligatorias: ['Bioseguridad en laboratorio clínico (niveles BSL-1 y BSL-2)', 'Protocolo post-exposición a accidente biológico', 'Radiaciones ionizantes y radioprotección (personal de imágenes)', 'Seguridad en resonancia magnética (personal de RM)', 'Gestión de residuos peligrosos RESPEL', 'Primeros auxilios y RCP básico', 'Prevención riesgo psicosocial (Res. 2646)']
  },

    {
    codigoCIIU: '8692',
    descripcionCIIU: 'Actividades de apoyo terapéutico (fisioterapia, fonoaudiología, terapia ocupacional, nutrición)',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-005', 'BIO-MEC-001', 'BIO-MEC-002', 'BIO-MEC-008', 'PSI-001', 'PSI-006', 'FIS-003'],
    peligrosEspecificos: [
      {
        codigo: 'TERAP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a fluidos corporales en procedimientos terapéuticos',
        descripcion: 'Contacto con heridas, secreciones, sangre y fluidos corporales durante fisioterapia de heridas, drenaje postural, terapia respiratoria y procedimientos invasivos terapéuticos',
        riesgoPotencial: 'Infección por contacto con fluidos de pacientes',
        efectosPosibles: 'Hepatitis B y C, infecciones de piel y partes blandas, infecciones respiratorias',
        medidasControl: ['Guantes para todo contacto con fluidos corporales', 'Mascarilla en terapia respiratoria y drenaje postural', 'Lavado de manos entre pacientes', 'Vacunación Hepatitis B y cuadro de vacunas al día', 'Protocolo post-exposición conocido por todo el personal terapéutico']
      },
      {
        codigo: 'TERAP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización manual de pacientes con limitaciones funcionales',
        descripcion: 'Transferencia, posicionamiento y asistencia en ejercicios de pacientes con discapacidad motora, hemiplejia, paraplejia o post-cirugía — tarea central de fisioterapia',
        riesgoPotencial: 'Lesión musculoesquelética grave del fisioterapeuta o terapeuta ocupacional',
        efectosPosibles: 'Hernia discal lumbar, desgarro de manguito rotador, esguince lumbar, incapacidades laborales crónicas',
        medidasControl: ['Equipos de ayuda a la transferencia (grúas, tablas de deslizamiento, cinturones)', 'Técnica MAPO de movilización segura de pacientes', 'Trabajo en equipo para pacientes con gran dependencia', 'Evaluación ergonómica del servicio de fisioterapia', 'Camillas de altura regulable a nivel del centro de gravedad del terapeuta']
      },
      {
        codigo: 'TERAP-BIO-MEC-002',
        clasificacion: 'biomecanico',
        peligro: 'Posturas mantenidas en bipedestación durante sesiones terapéuticas',
        descripcion: 'Trabajo en posición de pie prolongada durante sesiones de fisioterapia, terapia ocupacional y fonoaudiología que pueden extenderse a 6-8 horas diarias',
        riesgoPotencial: 'Insuficiencia venosa crónica, lumbalgias, fatiga de miembros inferiores',
        efectosPosibles: 'Varices, lumbalgias, fascitis plantar, edema de extremidades inferiores',
        medidasControl: ['Tapetes antifatiga en puestos de trabajo', 'Medias de compresión graduada', 'Calzado con soporte plantar adecuado', 'Alternar entre sesiones de pie y trabajo administrativo', 'Pausas activas cada 2 horas']
      },
      {
        codigo: 'TERAP-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones no ionizantes terapéuticas (ultrasonido, láser, electroterapia, microondas)',
        descripcion: 'Uso de equipos de fisioterapia que emiten ultrasonido terapéutico, láser de bajo nivel (LLLT), TENS, electroestimulación, microondas terapéuticas y ondas de choque',
        riesgoPotencial: 'Quemaduras, lesión ocular por láser, efectos de campos electromagnéticos en terapeuta',
        efectosPosibles: 'Quemaduras cutáneas por mal uso de ultrasonido, lesión ocular por láser clase IIIb/IV, quemaduras por microondas',
        medidasControl: ['Gafas de protección láser específicas para la longitud de onda del equipo', 'Nunca dirigir el haz de ultrasonido o láser hacia los ojos', 'Verificar calibración de equipos antes de cada uso', 'No usar electroterapia en portadores de marcapasos o en zona del tronco en embarazadas', 'Mantenimiento preventivo certificado de todos los equipos de fisioterapia']
      },
      {
        codigo: 'TERAP-FIS-002',
        clasificacion: 'fisico',
        peligro: 'Vibraciones transmitidas por equipos de fisioterapia',
        descripcion: 'Exposición a vibraciones mano-brazo durante uso de vibradores terapéuticos, percusores, equipos de ondas de choque y técnicas de drenaje percutivo',
        riesgoPotencial: 'Síndrome de vibración mano-brazo en fisioterapeuta',
        efectosPosibles: 'Fenómeno de Raynaud profesional, neuropatía periférica, síndrome del túnel carpiano agravado por vibración',
        medidasControl: ['Guantes antivibración certificados EN ISO 10819', 'Limitar el tiempo de uso continuo de equipos vibratorios', 'Rotación de tareas durante la jornada', 'Evaluación de dosis de vibración mano-brazo (ISO 5349)', 'Vigilancia médica con énfasis vascular y neurológico']
      },
      {
        codigo: 'TERAP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Agentes tópicos y desinfectantes en fisioterapia (alcohol, geles, aceites)',
        descripcion: 'Uso frecuente de geles de contacto para ultrasonido, aceites de masaje, alcohol etílico para desinfección de equipos y pomadas terapéuticas',
        riesgoPotencial: 'Dermatitis de contacto, sensibilización por uso repetido',
        efectosPosibles: 'Dermatitis de contacto alérgica o irritativa en manos del terapeuta',
        medidasControl: ['Guantes de nitrilo para procedimientos con contacto de fluidos', 'Crema barrera e hidratante para higiene frecuente de manos', 'Rotación de productos cuando hay sensibilización', 'Fichas de seguridad disponibles de todos los productos usados']
      },
      {
        codigo: 'TERAP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Fatiga por compasión y carga emocional en terapia con pacientes complejos',
        descripcion: 'Trabajo continuo con pacientes que tienen dolor crónico, discapacidades graves, enfermedades neurodegenerativas o estancias largas de rehabilitación que generan vinculación emocional intensa',
        riesgoPotencial: 'Fatiga por compasión, burnout terapéutico',
        efectosPosibles: 'Agotamiento emocional, despersonalización, depresión, abandono de la profesión',
        medidasControl: ['Supervisión clínica entre pares (supervisión de casos)', 'Distribución equitativa de casos complejos', 'Acceso a psicólogo institucional', 'Espacios de descarga emocional grupal', 'Capacitación en autocuidado emocional en profesiones de ayuda']
      },
      {
        codigo: 'TERAP-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Violencia de usuarios o acompañantes en servicios de rehabilitación',
        descripcion: 'Posibilidad de conductas agresivas de pacientes con alteraciones neurológicas (TCE, ACV, demencias) o de familiares en procesos de rehabilitación difíciles',
        riesgoPotencial: 'Lesiones físicas y trauma psicológico del terapeuta',
        efectosPosibles: 'Golpes, mordiscos, arañazos (especialmente en terapia ocupacional con pacientes con alteración cognitiva), TEPT',
        medidasControl: ['Protocolo de manejo de pacientes con conductas agresivas', 'Capacitación en técnicas de contención segura', 'Nunca trabajar en solitario con pacientes de alto riesgo conductual', 'Rotación de pacientes agresivos entre terapeutas', 'Reporte y registro de incidentes de violencia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para procedimientos con fluidos', 'Calzado antideslizante de trabajo con soporte plantar', 'Mascarilla de procedimientos o N95 en terapia respiratoria', 'Gafas de protección láser (si hay equipo láser)', 'Guantes antivibración (uso de equipos vibratorios)', 'Faja lumbar para movilización de pacientes de gran dependencia', 'Medias de compresión graduada'],
    capacitacionesObligatorias: ['Movilización segura de pacientes y técnica MAPO', 'Bioseguridad en terapias y precauciones estándar', 'Seguridad en uso de equipos de fisioterapia (ultrasonido, láser, electroterapia)', 'Prevención de riesgo psicosocial y autocuidado emocional en salud', 'Ergonomía para terapeutas: posturas y técnicas corporales', 'Primeros auxilios básico y RCP']
  },

    {
    codigoCIIU: '8699',
    descripcionCIIU: 'Otras actividades de atención de la salud humana n.c.p. (optometría, psicología clínica, nutrición, medicina alternativa)',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'PSI-001', 'PSI-005', 'PSI-006', 'BIO-MEC-001', 'BIO-MEC-005', 'QUI-015'],
    peligrosEspecificos: [
      {
        codigo: 'SALUDNCP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a agentes biológicos en atención de salud no hospitalaria',
        descripcion: 'Contacto con pacientes y sus fluidos en consultorios de optometría, psicología clínica, nutrición, acupuntura, quiropráctica y otras terapias alternativas',
        riesgoPotencial: 'Infección por agentes biológicos de transmisión respiratoria o por contacto',
        efectosPosibles: 'Enfermedades respiratorias, COVID-19, influenza, infecciones de piel',
        medidasControl: ['Precauciones estándar siempre con todo paciente', 'Guantes y mascarilla en procedimientos con contacto de mucosas o piel no intacta', 'Lavado de manos entre pacientes', 'Vacunación del personal de salud al día', 'Ventilación adecuada del consultorio']
      },
      {
        codigo: 'SALUDNCP-BIO-002',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en acupuntura y terapias con agujas',
        descripcion: 'Manejo de agujas de acupuntura, mesoterapia, dry needling y otras técnicas invasivas con agujas en terapias alternativas reconocidas por el MPS',
        riesgoPotencial: 'Accidente biológico por pinchazo, infección cruzada entre pacientes',
        efectosPosibles: 'VIH, Hepatitis B y C por pinchazo o reuso inadvertido de agujas',
        medidasControl: ['Uso exclusivo de agujas desechables de un solo uso', 'Contenedor de cortopunzantes en punto de uso', 'Guantes para el profesional', 'Protocolo post-exposición a accidente biológico', 'Vacunación Hepatitis B obligatoria']
      },
      {
        codigo: 'SALUDNCP-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones no ionizantes en optometría (lámpara de hendidura, láser)',
        descripcion: 'Exposición a luz intensa de lámpara de hendidura, fundoscopio, láseres de bajo nivel y equipos de diagnóstico ocular con emisión lumínica intensa',
        riesgoPotencial: 'Daño ocular acumulativo (retina, cristalino)',
        efectosPosibles: 'Daño de retina, cataratas precoces, fotoqueratitis por exposición repetida',
        medidasControl: ['Nunca dirigir el haz de fundoscopio hacia los propios ojos', 'Gafas de filtro específicas para láser ocular usado en el servicio', 'Mantenimiento y calibración de lámparas de hendidura', 'Examen oftalmológico anual para el personal de optometría', 'Pausas visuales durante evaluaciones prolongadas']
      },
      {
        codigo: 'SALUDNCP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Carga emocional extrema en psicología clínica y salud mental',
        descripcion: 'Acompañamiento psicológico de pacientes con trastornos mentales graves, trauma, ideación suicida, conductas autolesivas y casos de violencia intrafamiliar',
        riesgoPotencial: 'Trauma vicario, burnout del psicólogo, fatiga compasión',
        efectosPosibles: 'Trauma secundario, depresión, ansiedad, insomnio, abandono de la profesión, agotamiento empático',
        medidasControl: ['Supervisión clínica individual o grupal semanal o quincenal', 'Límite razonable de pacientes con alto riesgo por jornada', 'Espacios de supervisión y descarga emocional', 'Psicoterapia personal del profesional', 'Capacitación en manejo del trauma vicario y autocuidado del psicoterapeuta']
      },
      {
        codigo: 'SALUDNCP-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Riesgo de violencia en atención de pacientes con trastornos mentales o conductuales',
        descripcion: 'Posibilidad de agresión física o verbal de pacientes con psicosis aguda, trastorno de personalidad o bajo efecto de sustancias psicoactivas en consulta individual',
        riesgoPotencial: 'Agresión física o psicológica al profesional de salud mental',
        efectosPosibles: 'Lesiones físicas, TEPT del terapeuta, abandono del cargo',
        medidasControl: ['Nunca atender en solitario pacientes en crisis aguda con historia de violencia', 'Sistema de alarma o botón de pánico en consultorio', 'Disposición de mobiliario que permita salida libre (terapeuta entre paciente y la puerta)', 'Protocolo de manejo de situaciones de crisis', 'Capacitación en desescalada verbal']
      },
      {
        codigo: 'SALUDNCP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Postura sedente prolongada en consulta psicológica, nutricional y de optometría',
        descripcion: 'Trabajo sedentario durante consultas psicológicas, nutricionales o de optometría que implican largas sesiones frente a pacientes o frente a pantallas',
        riesgoPotencial: 'Trastornos musculoesqueléticos, síndrome metabólico',
        efectosPosibles: 'Lumbalgias, dorsalgias, cervicalgias, síndrome metabólico, síndrome visual informático',
        medidasControl: ['Silla ergonómica regulable', 'Pausas activas cada 45-60 minutos entre consultas', 'Breve caminata entre pacientes', 'Monitor a altura correcta', 'Evaluación ergonómica del puesto de trabajo']
      },
      {
        codigo: 'SALUDNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Productos desinfectantes y antisépticos en consultorios de salud',
        descripcion: 'Uso de hipoclorito, alcohol isopropílico, clorhexidina y desinfectantes de superficies para limpieza entre pacientes en consultorios de diversas disciplinas de salud',
        riesgoPotencial: 'Dermatitis de contacto, irritación respiratoria',
        efectosPosibles: 'Dermatitis de manos, eccema por uso repetido de alcohol, irritación de vías respiratorias altas',
        medidasControl: ['Guantes de nitrilo para manipulación de desinfectantes', 'Crema barrera e hidratante para uso frecuente de alcohol gel', 'Ventilación del consultorio al desinfectar', 'Fichas de seguridad de todos los desinfectantes', 'Capacitación en uso seguro']
      },
      {
        codigo: 'SALUDNCP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en domicilio o centros comunitarios (salud en casa, terapia domiciliaria)',
        descripcion: 'Profesionales de salud que prestan servicios en domicilios, centros comunitarios o zonas de difícil acceso con riesgo de seguridad, accidente de tránsito y trabajo en solitario',
        riesgoPotencial: 'Accidente de tránsito, agresión, trabajo en solitario',
        efectosPosibles: 'Politrauma, agresión, accidente sin atención oportuna',
        medidasControl: ['Evaluación previa de zona de visita', 'Check-in periódico con base', 'No realizar visitas a zonas de riesgo sin acompañamiento', 'GPS en vehículos o aplicación de rastreo', 'Protocolo de reporte ante incidente en campo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos biológico-infecciosos', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla de procedimientos', 'Bata de trabajo', 'Calzado cerrado', 'Gafas de protección (si hay láser o luz intensa)', 'Dosímetro (optometría con láser clase III/IV)'],
    capacitacionesObligatorias: ['Bioseguridad en atención de salud ambulatoria', 'Manejo de residuos biológicos', 'Prevención riesgo psicosocial en salud (Res. 2646)', 'Ergonomía en consulta', 'Primeros auxilios y RCP básico', 'Protocolo post-exposición biológica']
  },

    {
    codigoCIIU: '8710',
    descripcionCIIU: 'Actividades de atención residencial medicalizada (clínicas de reposo, centros de rehabilitación, internados psiquiátricos)',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'PSI-001', 'PSI-005', 'PSI-006', 'BIO-MEC-003', 'BIO-MEC-008', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'RESMED-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en atención residencial de pacientes crónicos o con enfermedades mentales',
        descripcion: 'Exposición a fluidos corporales, heridas y agentes infecciosos en la atención continua de pacientes con enfermedades crónicas, discapacidades, trastornos mentales o en rehabilitación prolongada',
        riesgoPotencial: 'Infecciones nosocomiales e infecciones laborales',
        efectosPosibles: 'Infecciones de transmisión sanguínea, fecal-oral y respiratoria en personal de cuidado',
        medidasControl: ['Precauciones estándar en toda atención', 'Guantes para todo contacto con fluidos', 'Lavado de manos 5 momentos', 'Vacunación completa del personal', 'Programa de higiene de manos en la institución']
      },
      {
        codigo: 'RESMED-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Agresión física de pacientes con trastornos mentales graves (psicosis, manía, demencia)',
        descripcion: 'Conductas agresivas de pacientes internados con esquizofrenia, trastorno bipolar en fase maníaca, demencias con agitación, intoxicación o estados confusionales agudos',
        riesgoPotencial: 'Lesiones físicas y trauma psicológico del personal de salud mental',
        efectosPosibles: 'Golpes, mordiscos, arañazos, empujones, TEPT laboral, ausentismo',
        medidasControl: ['Protocolo de manejo de la agitación psicomotora (PMPA)', 'Técnicas de contención verbal antes de contención física', 'Personal entrenado en contención física segura', 'Nunca hacer contención en solitario', 'Atención psicológica post-incidente garantizada', 'Registro y análisis estadístico de incidentes de violencia']
      },
      {
        codigo: 'RESMED-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Carga emocional extrema en cuidado de salud mental residencial',
        descripcion: 'Acompañamiento intensivo de pacientes con enfermedades mentales graves, intentos de suicidio, conductas autolesivas y situaciones de alto impacto emocional en instituciones de salud mental',
        riesgoPotencial: 'Trauma vicario, burnout severo, TEPT secundario',
        efectosPosibles: 'TEPT secundario, depresión mayor, abandono profesional, alcoholismo, burnout severo',
        medidasControl: ['Supervisión psicológica quincenal obligatoria para personal de salud mental', 'Rotación de casos de alta complejidad emocional', 'Grupos de apoyo entre pares con facilitador externo', 'Límite de carga asistencial por profesional', 'Programa institucional de autocuidado y salud mental del personal']
      },
      {
        codigo: 'RESMED-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de pacientes con trastornos motores o dependientes en rehabilitación',
        descripcion: 'Movilización frecuente de pacientes con secuelas neurológicas (ACV, TCE, parkinson), dependencia funcional alta o con sedación farmacológica en unidades de rehabilitación y reposo',
        riesgoPotencial: 'Lesiones musculoesqueléticas graves de columna lumbar y hombros',
        efectosPosibles: 'Hernia discal, lesión de hombro, lumbalgias crónicas, incapacidades permanentes en personal de enfermería',
        medidasControl: ['Grúas de transferencia y equipos de movilización disponibles en la unidad', 'Evaluación MAPO de riesgo ergonómico', 'Mínimo 2 personas para movilización de pacientes dependientes totales', 'Camas hospitalarias regulables en altura', 'Capacitación semestral en movilización segura de pacientes']
      },
      {
        codigo: 'RESMED-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Fuga o evasión de pacientes y situaciones de crisis en institución cerrada',
        descripcion: 'Situaciones de crisis, fuga, intentos de suicidio y emergencias médicas en instituciones de internación psiquiátrica o centros de rehabilitación con régimen cerrado',
        riesgoPotencial: 'Lesiones durante manejo de emergencias psiquiátricas',
        efectosPosibles: 'Lesiones del personal al manejar crisis, trauma al presenciar intentos de suicidio, exposición a situaciones de alta carga emocional',
        medidasControl: ['Protocolos de crisis y emergencias psiquiátricas documentados', 'Revisión periódica de condiciones físicas de seguridad de la institución', 'Formación específica en primeros auxilios psiquiátricos', 'Comunicación y coordinación con servicios de urgencias externos', 'Revisión de pacientes y entorno para elementos peligrosos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud mental', obligatorio: true },
      { codigo: 'LEY-1616-2013', norma: 'Ley 1616/2013', descripcion: 'Salud Mental en Colombia', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'DEC-351-2014', norma: 'Decreto 351/2014', descripcion: 'Gestión de residuos hospitalarios', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla de procedimientos', 'Bata manga larga', 'Calzado antideslizante cerrado', 'Faja lumbar para movilización de pacientes'],
    capacitacionesObligatorias: ['Bioseguridad en salud mental y atención residencial', 'Manejo de la agitación psicomotora y contención segura', 'Ergonomía y movilización segura de pacientes', 'Prevención del riesgo psicosocial en salud mental', 'Primeros auxilios psiquiátricos y básicos', 'Autocuidado emocional del personal de salud mental']
  },

  {
    codigoCIIU: '8720',
    descripcionCIIU: 'Actividades de atención residencial para el cuidado de personas con discapacidad intelectual, física o sensorial',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-004', 'BIO-MEC-008', 'PSI-001', 'PSI-005', 'PSI-006', 'BIO-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'DISCAP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de personas con discapacidad motora severa o dependencia total',
        descripcion: 'Transferencia, posicionamiento, baño, cambio de pañal y traslado de usuarios con parálisis cerebral, cuadriplejia, hemiplejia o dependencia funcional total',
        riesgoPotencial: 'Lesiones musculoesqueléticas graves en cuidadores y auxiliares',
        efectosPosibles: 'Hernias discales lumbares, lesiones de hombro, esguinces lumbares, incapacidades crónicas',
        medidasControl: ['Equipos de transferencia (grúas de techo o de pie, cojines deslizantes)', 'Camas regulables en altura', 'Técnicas ergonómicas de movilización sin levantamiento manual', 'Trabajo en equipo para usuarios de gran dependencia', 'Evaluación de riesgo ergonómico MAPO por unidad', 'Capacitación semestral en movilización de personas con discapacidad']
      },
      {
        codigo: 'DISCAP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Conductas desafiantes y agresión de usuarios con discapacidad intelectual',
        descripcion: 'Cuidado de personas con discapacidad intelectual (síndrome de Down con alteraciones de conducta, autismo, daño neurológico) que pueden presentar mordiscos, golpes, arañazos y autolesiones',
        riesgoPotencial: 'Lesiones físicas y trauma psicológico en cuidadores',
        efectosPosibles: 'Lesiones de partes blandas, TEPT, burnout del cuidador, ausentismo',
        medidasControl: ['Análisis funcional de conducta para cada usuario', 'Plan de soporte conductual positivo individualizado', 'Capacitación en manejo de conductas desafiantes sin castigo', 'Nunca trabajar en solitario con usuarios de alto riesgo conductual', 'Rotación de cuidadores para prevenir sobrecarga', 'Apoyo psicológico al personal post-incidente']
      },
      {
        codigo: 'DISCAP-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Fatiga emocional y burnout del cuidador de personas con discapacidad',
        descripcion: 'Cuidado de largo plazo de personas con necesidades complejas, alta dependencia y discapacidades que generan desgaste emocional crónico en el cuidador profesional',
        riesgoPotencial: 'Burnout del cuidador, fatiga compasión, TEPT secundario',
        efectosPosibles: 'Depresión, ansiedad, agotamiento, abandono de la profesión de cuidado',
        medidasControl: ['Rotación entre usuarios de distintos niveles de complejidad', 'Grupos de apoyo emocional para el equipo de cuidadores', 'Acceso a psicólogo institucional', 'Límite razonable de usuarios por cuidador', 'Reconocimiento del trabajo emocional en los sistemas de evaluación del desempeño']
      },
      {
        codigo: 'DISCAP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en atención de usuarios con bajo control de esfínteres',
        descripcion: 'Manejo de incontinencia, higienización y cambio de pañal de usuarios con discapacidad severa que no controlan esfínteres',
        riesgoPotencial: 'Infecciones gastrointestinales, hepatitis A, infecciones entéricas',
        efectosPosibles: 'Gastroenteritis, hepatitis A y E, infecciones por bacterias entéricas',
        medidasControl: ['Guantes siempre para cambios de pañal e higienización', 'Lavado de manos exhaustivo después del procedimiento', 'Delantal impermeable en higienización', 'Vacunación Hepatitis A para personal de cuidado', 'Gestión adecuada de residuos con materia orgánica']
      },
      {
        codigo: 'DISCAP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caídas y accidentes durante apoyos de movilidad de usuarios',
        descripcion: 'Riesgo de caída de usuarios durante traslados, ejercicios de movilidad o deambulación asistida que pueden lesionar también al cuidador',
        riesgoPotencial: 'Caídas del usuario y del cuidador durante apoyo de deambulación',
        efectosPosibles: 'Fracturas de usuario, lesión del cuidador al intentar evitar la caída, golpes',
        medidasControl: ['Calzado antideslizante para usuarios', 'Barandas y agarraderas en zonas de deambulación', 'Cinturones de marcha para apoyo de deambulación', 'Colchonetas de caída en zonas de riesgo', 'Valoración del riesgo de caída de cada usuario y plan de prevención']
      },
      {
        codigo: 'DISCAP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Manejo de medicamentos psicotrópicos y anticonvulsivantes',
        descripcion: 'Preparación y administración de medicamentos controlados (benzodiacepinas, antipsicóticos, anticonvulsivantes) a usuarios con discapacidad',
        riesgoPotencial: 'Exposición accidental a medicamentos controlados, error de medicación',
        efectosPosibles: 'Intoxicación accidental del trabajador, error de medicación en usuario',
        medidasControl: ['Doble verificación en la preparación y administración de psicotrópicos', 'Almacenamiento bajo llave de medicamentos controlados', 'Registro de administración firmado', 'Capacitación en manejo seguro de medicamentos controlados', 'Lavado de manos después de manipular medicamentos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'LEY-1618-2013', norma: 'Ley 1618/2013', descripcion: 'Derechos de personas con discapacidad en Colombia', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud para discapacidad', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Calzado antideslizante cerrado', 'Mascarilla', 'Delantal impermeable para higienización', 'Faja lumbar para movilizaciones frecuentes', 'Protecciones específicas según conductas del usuario (evaluación individual)'],
    capacitacionesObligatorias: ['Movilización segura de personas con discapacidad y técnica MAPO', 'Manejo de conductas desafiantes sin castigo (ABA positivo)', 'Bioseguridad en atención a personas con discapacidad', 'Prevención de riesgo psicosocial y autocuidado del cuidador', 'Primeros auxilios básico', 'Manejo seguro de medicamentos controlados']
  },

    {
    codigoCIIU: '8730',
    descripcionCIIU: 'Actividades de atención en instituciones para el cuidado de personas mayores — hogares geriátricos, ancianatos, centros de día',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-008', 'BIO-001', 'PSI-001', 'PSI-006', 'FIS-004', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'GER-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de adultos mayores con dependencia funcional',
        descripcion: 'Transferencias, baño, cambio de pañal, posicionamiento y traslado de adultos mayores con dependencia parcial o total — múltiples veces al día en hogares geriátricos',
        riesgoPotencial: 'Lesiones musculoesqueléticas crónicas en auxiliares de geriatría',
        efectosPosibles: 'Hernias discales lumbares, lesión de hombro, esguinces lumbares, incapacidades permanentes',
        medidasControl: ['Grúas de transferencia de techo o móviles para usuarios no ambulantes', 'Camas geriátricas regulables en altura con barandas', 'Técnicas de movilización sin levantamiento manual', 'Mínimo 2 personas para usuarios con dependencia total', 'Evaluación MAPO de riesgo ergonómico en cada unidad', 'Formación continua en movilización de adultos mayores']
      },
      {
        codigo: 'GER-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en higienización y cuidado de adultos mayores con incontinencia',
        descripcion: 'Manejo de incontinencia urinaria y fecal, cuidado de heridas crónicas (úlceras por presión), manejo de sondas y catéteres en adultos mayores con alta susceptibilidad a infecciones',
        riesgoPotencial: 'Infecciones entéricas, infecciones de herida, infecciones urinarias cruzadas',
        efectosPosibles: 'Gastroenteritis, hepatitis A, infecciones del tracto urinario, infecciones de piel y partes blandas',
        medidasControl: ['Guantes siempre para higienización y manejo de heridas', 'Lavado de manos antes y después de cada procedimiento', 'Delantal impermeable para baños y cambios de pañal', 'Precauciones de contacto para úlceras colonizadas', 'Vacunación hepatitis A y B para personal de geriatría']
      },
      {
        codigo: 'GER-BIO-002',
        clasificacion: 'biologico',
        peligro: 'Brotes infecciosos en instituciones geriátricas (influenza, norovirus, COVID)',
        descripcion: 'Alta susceptibilidad de la población mayor institucionalizada a brotes de influenza, COVID-19, norovirus, tuberculosis y sarna en espacios cerrados con alta densidad de pacientes',
        riesgoPotencial: 'Infección del personal en brote institucional',
        efectosPosibles: 'Influenza grave, COVID-19 severo, gastroenteritis por norovirus, tuberculosis, sarna noruega',
        medidasControl: ['Vacunación anual de influenza para todo el personal y usuarios', 'Protocolo de detección e aislamiento precoz de casos', 'EPP de aerosoles en casos respiratorios sospechosos', 'Cohortización de casos y contactos en brotes', 'Ventilación adecuada de instalaciones']
      },
      {
        codigo: 'GER-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Burnout y fatiga por compasión en cuidadores de adultos mayores',
        descripcion: 'Cuidado continuo de adultos mayores en deterioro progresivo, con demencias avanzadas, en proceso de muerte o con alta dependencia emocional al cuidador',
        riesgoPotencial: 'Burnout del cuidador geriátrico, fatiga por compasión',
        efectosPosibles: 'Depresión, ansiedad, agotamiento, abandono de la profesión de cuidado',
        medidasControl: ['Grupos de apoyo emocional entre pares para cuidadores', 'Rotación entre usuarios de distintos niveles de complejidad', 'Acceso a psicólogo institucional', 'Capacitación en duelo y acompañamiento de fin de vida', 'Reconocimiento institucional del esfuerzo emocional del cuidado geriátrico']
      },
      {
        codigo: 'GER-PSI-002',
        clasificacion: 'psicosocial',
        peligro: 'Violencia de adultos mayores con demencia o estados confusionales',
        descripcion: 'Golpes, mordiscos, insultos y resistencia durante el cuidado de adultos mayores con demencia avanzada (Alzheimer, Lewy), delirium, o trastornos de conducta nocturnos',
        riesgoPotencial: 'Lesiones físicas y trauma psicológico del cuidador',
        efectosPosibles: 'Lesiones de partes blandas, TEPT, burnout, ausentismo, abandono del cargo',
        medidasControl: ['Entrenamiento en comunicación con personas con demencia (enfoque centrado en la persona)', 'Estrategias no farmacológicas para el manejo de agitación', 'Nunca cuidar en solitario a usuarios altamente agitados', 'Rotación de cuidadores', 'Reporte y análisis de incidentes de violencia']
      },
      {
        codigo: 'GER-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Caídas de adultos mayores durante asistencia de deambulación',
        descripcion: 'Riesgo de caída del adulto mayor durante deambulación asistida, ejercicios de fisioterapia o transferencias, que puede lesionar también al auxiliar al intentar evitarla',
        riesgoPotencial: 'Fractura del usuario y lesión musculoesquelética del cuidador',
        efectosPosibles: 'Fractura de cadera del usuario, lesión lumbar o de hombro del cuidador al intentar frenar la caída',
        medidasControl: ['Evaluación de riesgo de caída con escala Morse o Downton para cada usuario', 'Calzado antideslizante para usuarios', 'Barandas y agarraderas en pasillos, baños y habitaciones', 'Cinturón de marcha para apoyo de deambulación', 'Iluminación nocturna adecuada en pasillos y baños', 'Protocolo de atención post-caída']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud geriátricos', obligatorio: true },
      { codigo: 'DEC-1171-2016', norma: 'Decreto 1171/2016', descripcion: 'Política de envejecimiento y vejez en Colombia', obligatorio: false }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla de procedimientos', 'Delantal impermeable para baños y cambios', 'Calzado antideslizante cerrado con soporte plantar', 'Faja lumbar para movilizaciones frecuentes', 'Medias de compresión graduada en turnos largos de pie'],
    capacitacionesObligatorias: ['Movilización segura de adultos mayores y técnica MAPO', 'Bioseguridad en geriatría y manejo de brotes', 'Cuidado centrado en la persona con demencia', 'Prevención de riesgo psicosocial y autocuidado del cuidador geriátrico', 'Primeros auxilios básico y manejo de caídas', 'Prevención y manejo de úlceras por presión']
  },

  {
    codigoCIIU: '8790',
    descripcionCIIU: 'Otras actividades de atención en instituciones con alojamiento n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'PSI-001', 'BIO-MEC-001', 'BIO-MEC-003', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'ALOJSOC-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en instituciones de cuidado con alojamiento',
        descripcion: 'Atención residencial de personas con necesidades especiales incluyendo exposición a fluidos y agentes infecciosos',
        riesgoPotencial: 'Infección por contacto con usuarios',
        efectosPosibles: 'Enfermedades infecciosas diversas',
        medidasControl: ['Precauciones estándar', 'Guantes y mascarilla', 'Vacunación del personal', 'Higiene de manos estricta']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos biológico-infecciosos', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Delantal impermeable', 'Calzado cerrado antideslizante'],
    capacitacionesObligatorias: ['Bioseguridad en cuidado residencial', 'Movilización de personas', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8810',
    descripcionCIIU: 'Actividades de asistencia social sin alojamiento para personas mayores y discapacitadas',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['PSI-001', 'BIO-001', 'BIO-MEC-001', 'SEG-002', 'PSI-002'],
    peligrosEspecificos: [
      {
        codigo: 'ASSOC-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga emocional en trabajo con personas mayores y con discapacidad',
        descripcion: 'Trabajadores sociales y asistentes sociales que acompañan situaciones de sufrimiento, abandono y deterioro',
        riesgoPotencial: 'Fatiga compasión y burnout social',
        efectosPosibles: 'Agotamiento emocional, depresión, trauma vicario',
        medidasControl: ['Supervisión profesional', 'Límite de casos por profesional', 'Espacios de descarga emocional', 'Acceso a salud mental para el profesional']
      },
      {
        codigo: 'ASSOC-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en campo en zonas de vulnerabilidad',
        descripcion: 'Visitas domiciliarias en zonas de alta vulnerabilidad social con riesgo de seguridad',
        riesgoPotencial: 'Agresión y robo en trabajo de campo',
        efectosPosibles: 'Lesiones físicas, trauma, pérdida de equipos',
        medidasControl: ['Evaluación previa de zona de visita', 'Trabajo en duplas', 'Comunicación con base', 'Protocolo ante incidentes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo para campo', 'Botiquín de primeros auxilios portátil'],
    capacitacionesObligatorias: ['Autocuidado emocional en trabajo social', 'Seguridad en campo', 'Primeros auxilios', 'Primeros auxilios psicológicos']
  },

  {
    codigoCIIU: '8890',
    descripcionCIIU: 'Otras actividades de asistencia social sin alojamiento',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-001', 'SEG-002', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'ASSOCNCP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Exposición a situaciones de alto impacto emocional',
        descripcion: 'Asistencia a poblaciones en situación de calle, consumo de sustancias, víctimas de violencia o pobreza extrema',
        riesgoPotencial: 'Trauma vicario y burnout',
        efectosPosibles: 'Estrés postraumático secundario, agotamiento, desmotivación',
        medidasControl: ['Supervisión psicológica', 'Protocolos de contención emocional', 'Rotación de casos', 'Acceso a salud mental']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo', 'Guantes de nitrilo en atención de campo'],
    capacitacionesObligatorias: ['Autocuidado emocional', 'Primeros auxilios psicológicos', 'Seguridad en campo', 'Primeros auxilios']
  },

  // ==================== SECCIÓN S - OTRAS ACTIVIDADES DE SERVICIOS ====================

  {
    codigoCIIU: '9411',
    descripcionCIIU: 'Actividades de asociaciones empresariales y de empleadores',
    nivelRiesgo: 'I',
    sector: 'Servicios asociativos',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002', 'PSI-004'],
    peligrosEspecificos: [
      {
        codigo: 'ASOCGREM-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta demanda cognitiva en representación gremial',
        descripcion: 'Representación de intereses empresariales, negociación con gobierno y sindicatos con alta exigencia cognitiva',
        riesgoPotencial: 'Estrés laboral',
        efectosPosibles: 'Ansiedad, fatiga mental, burnout',
        medidasControl: ['Distribución de cargas de representación', 'Programa de bienestar', 'Delegación efectiva']
      },
      {
        codigo: 'ASOCGREM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de oficina con uso prolongado de PVD',
        descripcion: 'Trabajo administrativo y de gestión con uso intensivo de computador',
        riesgoPotencial: 'Lesiones musculoesqueléticas por sedentarismo',
        efectosPosibles: 'Dolor lumbar, cervical, túnel carpiano',
        medidasControl: ['Puesto ergonómico', 'Pausas activas', 'Escritorio de pie opcional']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Reposapiés', 'Monitor regulable'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9412',
    descripcionCIIU: 'Actividades de asociaciones profesionales',
    nivelRiesgo: 'I',
    sector: 'Servicios asociativos',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'PSI-003', 'FIS-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'ASOCPROF-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo administrativo en oficina',
        descripcion: 'Gestión de afiliaciones, certificaciones y eventos gremiales con trabajo de oficina prolongado',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, cervicalgia, síndrome del túnel carpiano',
        medidasControl: ['Puesto ergonómico', 'Pausas activas programadas', 'Evaluación ergonómica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Monitor regulable'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9420',
    descripcionCIIU: 'Actividades de sindicatos de empleados',
    nivelRiesgo: 'I',
    sector: 'Servicios asociativos',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-002', 'FIS-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'SIND-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Conflictos laborales y presión en negociación colectiva',
        descripcion: 'Líderes sindicales expuestos a presiones de empleadores, tensiones con afiliados y conflictos institucionales',
        riesgoPotencial: 'Estrés por conflicto y acoso laboral',
        efectosPosibles: 'Ansiedad, burnout, aislamiento social',
        medidasControl: ['Redes de apoyo entre líderes sindicales', 'Acceso a asesoría jurídica', 'Programas de bienestar', 'Espacios de descarga emocional']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Prevención de acoso laboral (Ley 1010/2006)', 'Ergonomía en oficina', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9491',
    descripcionCIIU: 'Actividades de asociaciones religiosas',
    nivelRiesgo: 'I',
    sector: 'Servicios asociativos',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'FIS-001', 'BIO-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'RELIG-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido en celebraciones y amplificación de audio',
        descripcion: 'Exposición a sistemas de sonido de alta potencia en ceremonias religiosas con amplificación',
        riesgoPotencial: 'Pérdida auditiva',
        efectosPosibles: 'Hipoacusia, tinnitus',
        medidasControl: ['Protección auditiva para técnicos de sonido', 'Calibración de sistemas de audio', 'Audiometrías periódicas']
      },
      {
        codigo: 'RELIG-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga pastoral y acompañamiento de comunidades en crisis',
        descripcion: 'Líderes religiosos que acompañan duelos, crisis familiares y situaciones de sufrimiento de feligreses',
        riesgoPotencial: 'Fatiga compasión y burnout pastoral',
        efectosPosibles: 'Agotamiento, depresión, pérdida de vocación',
        medidasControl: ['Espacios de retiro y descanso', 'Comunidad de apoyo entre pares', 'Rotación de responsabilidades pastorales']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva para técnicos de sonido'],
    capacitacionesObligatorias: ['Conservación auditiva', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9492',
    descripcionCIIU: 'Actividades de asociaciones políticas',
    nivelRiesgo: 'I',
    sector: 'Servicios asociativos',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-002', 'FIS-002', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'POL-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Estrés y acoso en entornos políticos',
        descripcion: 'Trabajo bajo presión política, exposición a conflictos y tensiones propias del entorno político colombiano',
        riesgoPotencial: 'Estrés crónico y acoso laboral/político',
        efectosPosibles: 'Ansiedad, burnout, problemas de salud mental',
        medidasControl: ['Programa de gestión de riesgo psicosocial', 'Canales de denuncia de acoso', 'Apoyo psicológico', 'Comunidades de apoyo entre pares']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Prevención riesgo psicosocial', 'Prevención acoso laboral', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9499',
    descripcionCIIU: 'Actividades de otras asociaciones n.c.p.',
    nivelRiesgo: 'I',
    sector: 'Servicios asociativos',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'FIS-002', 'SEG-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'ASOCNCP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de oficina en gestión asociativa',
        descripcion: 'Gestión administrativa de la asociación con trabajo de oficina prolongado',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Dolor lumbar, cervical',
        medidasControl: ['Puesto ergonómico', 'Pausas activas', 'Variación postural']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9511',
    descripcionCIIU: 'Mantenimiento y reparación de computadores y de equipo periférico',
    nivelRiesgo: 'II',
    sector: 'Servicios de reparación',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'FIS-005', 'BIO-MEC-002', 'QUI-003'],
    peligrosEspecificos: [
      {
        codigo: 'REPCMP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en reparación de equipos electrónicos',
        descripcion: 'Trabajo con fuentes de poder, circuitos energizados y equipos de alta tensión interna',
        riesgoPotencial: 'Contacto eléctrico',
        efectosPosibles: 'Quemaduras eléctricas, paro cardiorrespiratorio',
        medidasControl: ['LOTO (bloqueo y etiquetado) antes de abrir equipos', 'Descarga de capacitores', 'Pulsera antiestática', 'Nunca trabajar en equipos enchufados']
      },
      {
        codigo: 'REPCMP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a solventes y flux de soldadura',
        descripcion: 'Uso de flux, alcohol isopropílico, limpiadores de circuitos y resinas de soldadura',
        riesgoPotencial: 'Irritación respiratoria y cutánea',
        efectosPosibles: 'Dermatitis, irritación nasal y ocular, cefalea',
        medidasControl: ['Ventilación en área de soldadura', 'Mascarilla para vapores orgánicos', 'Guantes de nitrilo', 'Extractor de humos de soldadura']
      },
      {
        codigo: 'REPCMP-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones de equipos de comunicación y baterías',
        descripcion: 'Trabajo con baterías de litio, baterías de plomo y radiaciones de dispositivos inalámbricos',
        riesgoPotencial: 'Exposición a radiaciones no ionizantes y sustancias de baterías',
        efectosPosibles: 'Irritación en baterías dañadas, quemaduras por cortocircuito',
        medidasControl: ['Guantes al manipular baterías dañadas', 'No comprimir ni perforar baterías de litio', 'Manejo seguro de residuos RAEE']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true },
      { codigo: 'LEY-1672-2013', norma: 'Ley 1672/2013', descripcion: 'Gestión de RAEE', obligatorio: true }
    ],
    eppRecomendado: ['Pulsera antiestática', 'Guantes de nitrilo', 'Gafas de seguridad', 'Mascarilla para vapores', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Riesgo eléctrico y LOTO', 'Manejo de solventes en electrónica', 'Gestión de RAEE', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9512',
    descripcionCIIU: 'Mantenimiento y reparación de equipos de comunicación',
    nivelRiesgo: 'II',
    sector: 'Servicios de reparación',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'FIS-005', 'BIO-MEC-002', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPCOM-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en alturas para instalación y reparación de antenas',
        descripcion: 'Subida a techos, postes y torres para reparación de equipos de comunicación',
        riesgoPotencial: 'Caída en trabajo en alturas',
        efectosPosibles: 'Traumatismos graves, muerte',
        medidasControl: ['Certificación en trabajo en alturas (Res. 4272/2021)', 'Arnés de cuerpo entero', 'Análisis de riesgo antes de subir', 'Doble línea de vida']
      },
      {
        codigo: 'REPCOM-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a radiaciones no ionizantes de antenas y equipos',
        descripcion: 'Trabajo cerca de antenas de telecomunicaciones activas emitiendo radiación electromagnética',
        riesgoPotencial: 'Exposición a campos electromagnéticos de alta frecuencia',
        efectosPosibles: 'Calentamiento de tejidos, efectos neurológicos en exposición crónica',
        medidasControl: ['Apagado o reducción de potencia antes de trabajar en cercanía', 'Distancias mínimas de seguridad según ICNIRP', 'Monitoreo de exposición']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo entero', 'Casco de seguridad', 'Guantes de trabajo', 'Calzado con puntera y antideslizante', 'Pulsera antiestática'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas', 'Riesgo eléctrico', 'Radiaciones no ionizantes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9522',
    descripcionCIIU: 'Mantenimiento y reparación de aparatos y equipos domésticos y de jardinería',
    nivelRiesgo: 'II',
    sector: 'Servicios de reparación',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'SEG-005', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPDOM-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico y mecánico en reparación de electrodomésticos',
        descripcion: 'Reparación de neveras, lavadoras, estufas y equipos de jardín con riesgo eléctrico y mecánico',
        riesgoPotencial: 'Electrocución y atrapamiento mecánico',
        efectosPosibles: 'Quemaduras, electrocución, amputaciones',
        medidasControl: ['LOTO obligatorio antes de reparar', 'Verificación de ausencia de tensión', 'Guardas de seguridad en prueba', 'Herramientas aisladas']
      },
      {
        codigo: 'REPDOM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a refrigerantes y gases en equipos de refrigeración',
        descripcion: 'Manejo de gases refrigerantes (freón, R410A, R134a) en reparación de neveras y aires acondicionados',
        riesgoPotencial: 'Exposición a refrigerantes con efectos en salud y ambiente',
        efectosPosibles: 'Irritación respiratoria, asfixia, quemaduras criogénicas',
        medidasControl: ['Equipos de recuperación de refrigerante certificados', 'Gafas y guantes criogénicos', 'Área ventilada', 'Capacitación en manejo de refrigerantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Gafas de seguridad', 'Herramientas aisladas', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Riesgo eléctrico y LOTO', 'Manejo de refrigerantes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9523',
    descripcionCIIU: 'Reparación de calzado y artículos de cuero',
    nivelRiesgo: 'I',
    sector: 'Servicios de reparación',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'BIO-MEC-002', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'ZAPT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a pegamentos y solventes en zapatería',
        descripcion: 'Uso de cementos de contacto (tolueno, hexano), brilladores y tinturas en reparación de calzado y cuero',
        riesgoPotencial: 'Intoxicación crónica por solventes',
        efectosPosibles: 'Daño neurológico (neuropatía por hexano), cefalea, mareos, daño hepático',
        medidasControl: ['Ventilación forzada del local', 'Mascarilla para vapores orgánicos', 'Guantes de nitrilo', 'Preferir pegamentos de base acuosa']
      },
      {
        codigo: 'ZAPT-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Postura sedente prolongada en zapatería',
        descripcion: 'Trabajo sentado en posición forzada y con movimientos repetitivos de manos en costura y pegado',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, síndrome del túnel carpiano, tendinitis de manos',
        medidasControl: ['Silla con soporte lumbar', 'Apoyo para brazos', 'Pausas activas frecuentes', 'Evaluación ergonómica del puesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para vapores orgánicos', 'Guantes de nitrilo', 'Silla ergonómica con soporte lumbar'],
    capacitacionesObligatorias: ['Manejo seguro de solventes y pegamentos', 'Higiene postural en trabajo sedente', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9524',
    descripcionCIIU: 'Reparación de muebles y accesorios para el hogar',
    nivelRiesgo: 'II',
    sector: 'Servicios de reparación',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'SEG-005', 'FIS-001', 'BIO-MEC-003'],
    peligrosEspecificos: [
      {
        codigo: 'MUEB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a lacas, barnices y solventes en reparación de muebles',
        descripcion: 'Aplicación de lacas nitrocelulósicas, barnices con solventes y pinturas en taller de muebles',
        riesgoPotencial: 'Intoxicación por vapores y riesgo de incendio',
        efectosPosibles: 'Daño hepático y neurológico crónico, irritación respiratoria, incendio',
        medidasControl: ['Cabina de pintura con ventilación forzada', 'Mascarilla con filtro para vapores orgánicos', 'No fumar en taller', 'Extintor tipo BC']
      },
      {
        codigo: 'MUEB-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en uso de maquinaria de carpintería',
        descripcion: 'Uso de sierra circular, lijadora, torno y otras herramientas eléctricas de carpintería',
        riesgoPotencial: 'Amputaciones y cortes graves',
        efectosPosibles: 'Amputación de dedos o manos, laceraciones',
        medidasControl: ['Guardas en todas las máquinas', 'Nunca retirar guardas', 'Herramienta empujadora (nunca mano directa)', 'Capacitación obligatoria antes de operar']
      },
      {
        codigo: 'MUEB-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Polvo de madera en operaciones de carpintería',
        descripcion: 'Generación de partículas de madera en corte, lijado y fresado',
        riesgoPotencial: 'Enfermedades respiratorias y cáncer de cavidad nasal',
        efectosPosibles: 'Rinitis, asma ocupacional, adenocarcinoma nasosinusal (maderas duras)',
        medidasControl: ['Sistema de extracción de polvo en cada máquina', 'Mascarilla P100 en lijado', 'Espirometrías periódicas', 'Distancia de seguridad en corte']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100 y para vapores orgánicos', 'Gafas de seguridad', 'Protección auditiva', 'Guantes anticorte', 'Calzado con puntera de acero'],
    capacitacionesObligatorias: ['Seguridad en maquinaria de carpintería', 'Manejo de lacas y solventes', 'Prevención de incendios', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9529',
    descripcionCIIU: 'Mantenimiento y reparación de otros efectos personales y enseres domésticos',
    nivelRiesgo: 'II',
    sector: 'Servicios de reparación',
    peligrosPrioritarios: ['QUI-001', 'SEG-004', 'BIO-MEC-001', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Solventes y sustancias de limpieza en reparaciones',
        descripcion: 'Uso de solventes, desengrasantes y productos de limpieza según el artículo a reparar',
        riesgoPotencial: 'Irritación y exposición química',
        efectosPosibles: 'Dermatitis, irritación respiratoria',
        medidasControl: ['Guantes de nitrilo', 'Ventilación adecuada', 'Preferir alternativas menos tóxicas', 'SDS disponibles']
      },
      {
        codigo: 'REPNCP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en reparación de artículos eléctricos',
        descripcion: 'Reparación de artículos eléctricos del hogar con riesgo de contacto eléctrico',
        riesgoPotencial: 'Electrocución',
        efectosPosibles: 'Quemaduras, paro cardiorrespiratorio',
        medidasControl: ['LOTO antes de reparar', 'Herramientas aisladas', 'Verificación de ausencia de tensión']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Herramientas aisladas', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Riesgo eléctrico básico', 'Manejo de solventes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '9609',
    descripcionCIIU: 'Otras actividades de servicios personales n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Servicios personales',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'PSI-001', 'BIO-MEC-001', 'QUI-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'SERVNCP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en servicios personales de contacto',
        descripcion: 'Servicios de tatuaje, piercing, depilación u otros servicios con contacto directo con piel',
        riesgoPotencial: 'Infecciones por contacto cutáneo o vía parenteral',
        efectosPosibles: 'Hepatitis B y C, VIH, infecciones bacterianas locales',
        medidasControl: ['Material estéril de uso único', 'Guantes de nitrilo', 'Vacunación hepatitis B', 'Protocolo de bioseguridad', 'Esterilización de equipos reutilizables']
      },
      {
        codigo: 'SERVNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Tintas y sustancias en servicios de tatuaje',
        descripcion: 'Exposición a tintas de tatuaje, productos de depilación y sustancias cosméticas diversas',
        riesgoPotencial: 'Dermatitis de contacto y sensibilización',
        efectosPosibles: 'Dermatitis alérgica, reacciones cutáneas',
        medidasControl: ['Guantes de nitrilo siempre', 'Prueba de alergia con productos nuevos', 'Ficha técnica de cada producto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2117-2010', norma: 'Resolución 2117/2010', descripcion: 'Requisitos para establecimientos de estética', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Gafas de protección para procedimientos con riesgo de salpicadura'],
    capacitacionesObligatorias: ['Bioseguridad en servicios de estética', 'Manejo de material cortopunzante', 'Primeros auxilios']
  },

  // ==================== SECCIÓN B - MINERÍA Y CANTERAS ====================

  {
    codigoCIIU: '0520',
    descripcionCIIU: 'Extracción de carbón lignito',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['SEG-003', 'QUI-002', 'QUI-001', 'SEG-006', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'CARBON-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Derrumbes y colapso de labores subterráneas',
        descripcion: 'Riesgo de colapso de techos, paredes y pilares en minería subterránea de carbón',
        riesgoPotencial: 'Sepultamiento',
        efectosPosibles: 'Aplastamiento, asfixia, muerte',
        medidasControl: ['Plan de sostenimiento certificado', 'Inspección diaria de labores', 'Entibado o pernos de anclaje', 'Prohibición de ingreso a zonas sin sostenimiento', 'Sistema de alerta temprana']
      },
      {
        codigo: 'CARBON-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Gases de mina (grisú, CO, CO2, H2S)',
        descripcion: 'Acumulación de metano (grisú), monóxido de carbono, dióxido de carbono e hidrógeno sulfurado en labores',
        riesgoPotencial: 'Explosión, asfixia, intoxicación',
        efectosPosibles: 'Muerte por explosión o asfixia, intoxicación aguda',
        medidasControl: ['Detectores de gas portátiles obligatorios', 'Ventilación forzada de labores', 'No ingreso si detector activa', 'Equipos de aire autónomo disponibles', 'Capacitación en minería segura']
      },
      {
        codigo: 'CARBON-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Polvo de carbón - neumoconiosis',
        descripcion: 'Inhalación crónica de polvo de carbón en minería subterránea y a cielo abierto',
        riesgoPotencial: 'Neumoconiosis del minero del carbón',
        efectosPosibles: 'Antracosis, silicosis, fibrosis masiva progresiva, cáncer de pulmón',
        medidasControl: ['Humectación de frentes de trabajo', 'Respirador P100', 'Espirometría y radiografía de tórax anuales', 'Control de polvo en transporte y cargue']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1335-1987', norma: 'Decreto 1335/1987', descripcion: 'Reglamento de Seguridad en Minería Subterránea de Carbón', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Casco minero con linterna', 'Respirador P100', 'Detector de gas personal', 'Equipo de aire autónomo (SCBA) en zonas de riesgo', 'Botas con puntera', 'Ropa ignífuga', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Seguridad en minería subterránea de carbón', 'Manejo de gases de mina', 'Plan de evacuación', 'Primeros auxilios en mina', 'Uso de equipo de respiración autónoma']
  },

  {
    codigoCIIU: '0710',
    descripcionCIIU: 'Extracción de minerales de hierro',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['SEG-001', 'QUI-002', 'SEG-005', 'FIS-001', 'BIO-MEC-004', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'HIERRO-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Voladuras y explosivos en minería a cielo abierto',
        descripcion: 'Uso de explosivos para fragmentación de roca en extracción de mineral de hierro',
        riesgoPotencial: 'Lesiones por onda expansiva y proyectiles',
        efectosPosibles: 'Traumatismos graves, muerte, sordera',
        medidasControl: ['Solo personal certificado maneja explosivos', 'Zona de exclusión en voladuras', 'Señalización y avisos antes de volar', 'Inspección post-voladura antes de reingreso']
      },
      {
        codigo: 'HIERRO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice en extracción de mineral',
        descripcion: 'Exposición crónica a sílice libre cristalina en perforación, cargue y transporte de mineral',
        riesgoPotencial: 'Silicosis',
        efectosPosibles: 'Silicosis aguda o crónica, fibrosis pulmonar, cáncer de pulmón',
        medidasControl: ['Perforación con humectación (agua)', 'Respirador P100 en zonas de polvo', 'Espirometría y Rx de tórax anuales', 'Monitoreo de polvo respirable']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true },
      { codigo: 'DEC-0035-1994', norma: 'Decreto 0035/1994', descripcion: 'Reglamento de Higiene y Seguridad en Minería a Cielo Abierto', obligatorio: true }
    ],
    eppRecomendado: ['Casco con visera', 'Respirador P100', 'Protección auditiva', 'Chaleco reflectivo', 'Botas con puntera', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de explosivos', 'Control de polvo de sílice', 'Operación segura de maquinaria pesada', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0721',
    descripcionCIIU: 'Extracción de minerales de uranio y de torio',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['FIS-005', 'QUI-002', 'SEG-003', 'SEG-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'URAN-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a radiaciones ionizantes alfa y beta de minerales radiactivos',
        descripcion: 'Inhalación de radón y exposición externa a radiación alfa/beta en minería de uranio',
        riesgoPotencial: 'Cáncer de pulmón y otros cánceres por radiación',
        efectosPosibles: 'Cáncer de pulmón, leucemia, daño genético',
        medidasControl: ['Dosímetro personal obligatorio (dosímetría individual)', 'Ventilación especial para reducir radón', 'Respirador con filtro para partículas radiactivas', 'Monitoreo radiológico permanente', 'Límites de dosis según ICRP y normativa colombiana']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-2272-2010', norma: 'Decreto 2272/2010', descripcion: 'Normas en materia nuclear y radiológica', obligatorio: true }
    ],
    eppRecomendado: ['Dosímetro personal', 'Respirador con filtro HEPA', 'Traje de protección radiológica', 'Guantes de nitrilo grueso'],
    capacitacionesObligatorias: ['Protección radiológica', 'Manejo de materiales radiactivos', 'Plan de emergencias radiológico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0722',
    descripcionCIIU: 'Extracción de oro y otros metales preciosos',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'SEG-001', 'SEG-003', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'ORO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a mercurio y cianuro en beneficio del oro',
        descripcion: 'Uso de mercurio para amalgamación y cianuro de sodio para lixiviación en extracción artesanal e industrial',
        riesgoPotencial: 'Intoxicación aguda y crónica por mercurio y cianuro',
        efectosPosibles: 'Temblores, daño neurológico (mercurio), muerte por cianuro',
        medidasControl: ['Prohibición de mercurio según Ley 1658/2013', 'EPP completo en manejo de cianuro', 'Duchas de emergencia y lavaojos', 'Detector de cianuro en área', 'Capacitación en toxicología minera']
      },
      {
        codigo: 'ORO-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice en minería de filón de oro',
        descripcion: 'Perforación en roca cuarzosa con alta concentración de sílice libre',
        riesgoPotencial: 'Silicosis acelerada o aguda',
        efectosPosibles: 'Silicosis, fibrosis pulmonar, muerte prematura',
        medidasControl: ['Perforación con agua', 'Respirador P100', 'Espirometrías cada 6 meses en minería de filón']
      }
    ],
    normativaEspecifica: [
      { codigo: 'LEY-1658-2013', norma: 'Ley 1658/2013', descripcion: 'Prohibición y eliminación del uso de mercurio en minería', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Guantes de nitrilo grueso', 'Gafas herméticas', 'Traje Tyvek en manejo de cianuro', 'Casco minero', 'Botas con puntera'],
    capacitacionesObligatorias: ['Prohibición uso de mercurio - Ley 1658/2013', 'Manejo seguro de cianuro', 'Primeros auxilios - intoxicación', 'Silicosis - prevención']
  },

  {
    codigoCIIU: '0723',
    descripcionCIIU: 'Extracción de minerales de níquel',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-004', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'NIQU-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a níquel y polvo de mineral',
        descripcion: 'Contacto con polvo y aerosoles de níquel en extracción y beneficio del mineral',
        riesgoPotencial: 'Cáncer de pulmón y nasal, dermatitis alérgica',
        efectosPosibles: 'Cáncer, dermatitis por níquel (sensibilización), rinitis',
        medidasControl: ['Respirador P100 en zonas de polvo', 'Controles de ingeniería para supresión de polvo', 'Monitoreo biológico', 'Espirometrías anuales']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Guantes de cuero', 'Casco', 'Gafas de seguridad', 'Botas con puntera'],
    capacitacionesObligatorias: ['Control de polvo metálico', 'Vigilancia epidemiológica de cáncer ocupacional', 'Operación segura de maquinaria minera', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0729',
    descripcionCIIU: 'Extracción de otros minerales metalíferos no ferrosos n.c.p.',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'SEG-001', 'SEG-003', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'METNO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de minerales metálicos (plomo, zinc, cobre, cromo)',
        descripcion: 'Inhalación de polvo y aerosoles de metales pesados en extracción y beneficio',
        riesgoPotencial: 'Intoxicación por metales pesados',
        efectosPosibles: 'Saturnismo (plomo), daño neurológico, cáncer',
        medidasControl: ['Respirador P100 específico', 'Monitoreo ambiental y biológico periódico', 'No comer/beber en zona de trabajo', 'Higiene rigurosa al terminar jornada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Casco', 'Guantes de cuero', 'Gafas de seguridad', 'Botas con puntera'],
    capacitacionesObligatorias: ['Control de metales pesados en minería', 'Monitoreo biológico', 'Primeros auxilios - intoxicación por metales']
  },

  {
    codigoCIIU: '0812',
    descripcionCIIU: 'Extracción de arcillas de uso industrial, caliza, caolín y bentonitas',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'SEG-005', 'SEG-001', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'ARCI-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice y minerales industriales',
        descripcion: 'Generación de polvo rico en sílice libre en extracción de arcilla, caliza y caolín',
        riesgoPotencial: 'Silicosis y neumoconiosis',
        efectosPosibles: 'Silicosis, fibrosis pulmonar, cáncer de pulmón',
        medidasControl: ['Supresión de polvo con agua', 'Respirador P100 en zonas de polvo', 'Espirometría anual', 'Monitoreo de polvo respirable en puesto de trabajo']
      },
      {
        codigo: 'ARCI-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Taludes inestables en explotación a cielo abierto',
        descripcion: 'Riesgo de deslizamiento de taludes de cantera por inestabilidad geotécnica',
        riesgoPotencial: 'Sepultamiento y aplastamiento',
        efectosPosibles: 'Traumatismos graves, muerte',
        medidasControl: ['Diseño geotécnico de taludes', 'Inspección de taludes antes de cada turno', 'Zona de exclusión en pie de talud', 'Monitoreo de movimientos geotécnicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-0035-1994', norma: 'Decreto 0035/1994', descripcion: 'Reglamento de Higiene y Seguridad en Minería', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Casco', 'Gafas de seguridad', 'Protección auditiva', 'Botas con puntera', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Control de polvo de sílice', 'Estabilidad de taludes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0820',
    descripcionCIIU: 'Extracción de esmeraldas, piedras preciosas y semipreciosas',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['SEG-003', 'QUI-002', 'SEG-001', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'ESMER-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo de derrumbe en minería de esmeraldas',
        descripcion: 'Labores subterráneas y a cielo abierto en minería de piedras preciosas con riesgo de colapso',
        riesgoPotencial: 'Sepultamiento',
        efectosPosibles: 'Aplastamiento, asfixia, muerte',
        medidasControl: ['Sostenimiento adecuado de labores', 'Inspección de geomecánica', 'Plan de evacuación', 'Sistema de aviso en caso de inestabilidad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Casco minero', 'Respirador P100', 'Botas con puntera', 'Linterna de casco', 'Guantes de cuero'],
    capacitacionesObligatorias: ['Seguridad en minería subterránea', 'Control de polvo', 'Primeros auxilios en mina']
  },

  {
    codigoCIIU: '0891',
    descripcionCIIU: 'Extracción de minerales para la fabricación de abonos y productos químicos',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'QUI-001', 'SEG-001', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'ABONO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de fosfatos y sulfatos en extracción minera',
        descripcion: 'Inhalación de polvo de rocas fosfóricas y sulfatos en extracción y procesamiento',
        riesgoPotencial: 'Enfermedades respiratorias crónicas',
        efectosPosibles: 'Bronquitis crónica, neumoconiosis, irritación de mucosas',
        medidasControl: ['Supresión de polvo con agua', 'Respirador P100', 'Espirometría anual', 'Monitoreo de polvo en puesto de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Casco', 'Gafas de seguridad', 'Botas con puntera'],
    capacitacionesObligatorias: ['Control de polvo industrial', 'Seguridad minera', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0892',
    descripcionCIIU: 'Extracción de halita (sal)',
    nivelRiesgo: 'IV',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'SEG-003', 'BIO-MEC-004', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'SAL-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sal en minería y procesamiento',
        descripcion: 'Inhalación de polvo de cloruro de sodio y potasio en extracción y procesamiento de sal',
        riesgoPotencial: 'Irritación de vías respiratorias',
        efectosPosibles: 'Irritación nasal y faríngea, rinitis, afecciones respiratorias crónicas',
        medidasControl: ['Humectación de frentes de trabajo', 'Mascarilla para polvo', 'Ventilación de labores subterráneas', 'Espirometría periódica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-1335-1987', norma: 'Decreto 1335/1987', descripcion: 'Reglamento de Seguridad en Minería Subterránea', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para polvo N95', 'Casco', 'Botas de caucho', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Seguridad en minería de sal', 'Control de polvo', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0899',
    descripcionCIIU: 'Extracción de otros minerales no metálicos n.c.p.',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'SEG-001', 'SEG-005', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'MINNM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de minerales no metálicos diverso',
        descripcion: 'Inhalación de polvo de grafito, mica, talco, amianto (si aplica), barita u otros minerales no metálicos',
        riesgoPotencial: 'Neumoconiosis específica según mineral',
        efectosPosibles: 'Asbestosis (en amianto), talcosis, grafitosis, silicosis',
        medidasControl: ['Identificación del mineral y su riesgo específico', 'Respirador específico para el mineral', 'Espirometría anual', 'Monitoreo de polvo respirable']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Casco', 'Gafas de seguridad', 'Botas con puntera'],
    capacitacionesObligatorias: ['Identificación y control de polvo mineral', 'Seguridad minera', 'Primeros auxilios']
  },

  {
    codigoCIIU: '0910',
    descripcionCIIU: 'Actividades de apoyo para la extracción de petróleo y de gas natural',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['SEG-006', 'QUI-001', 'SEG-003', 'SEG-001', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'PETAP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosión e incendio en instalaciones de petróleo y gas',
        descripcion: 'Operaciones en ambientes con alta concentración de hidrocarburos inflamables en pozos y facilidades',
        riesgoPotencial: 'Incendio, explosión, BLEVE',
        efectosPosibles: 'Quemaduras graves, explosión, muerte',
        medidasControl: ['Clasificación de áreas peligrosas (NFPA 70)', 'Equipos a prueba de explosión', 'Detector de gas H2S y HC permanente', 'Procedimientos de trabajo seguro en caliente']
      },
      {
        codigo: 'PETAP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a H2S en operaciones de pozo',
        descripcion: 'Gas sulfuro de hidrógeno en operaciones de perforación, prueba y mantenimiento de pozos',
        riesgoPotencial: 'Intoxicación aguda fulminante',
        efectosPosibles: 'Pérdida de conciencia, paro respiratorio, muerte',
        medidasControl: ['Detector de H2S personal (umbral 10 ppm)', 'Equipo de aire autónomo disponible', 'Dos personas como mínimo en zonas de H2S', 'Capacitación obligatoria H2S']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-180508-2010', norma: 'Resolución 180508/2010', descripcion: 'Reglamento técnico de instalaciones eléctricas RETIE en zonas de riesgo', obligatorio: true }
    ],
    eppRecomendado: ['Detector de H2S personal', 'SCBA (equipo de aire autónomo)', 'Ropa ignífuga', 'Casco', 'Botas de seguridad antiestáticas', 'Guantes resistentes a HC'],
    capacitacionesObligatorias: ['H2S safety', 'Prevención de incendios en petróleo y gas', 'Trabajo en espacios confinados', 'Primeros auxilios en campo petrolero']
  },

  {
    codigoCIIU: '0990',
    descripcionCIIU: 'Actividades de apoyo para otras actividades de explotación de minas y canteras',
    nivelRiesgo: 'V',
    sector: 'Minería',
    peligrosPrioritarios: ['QUI-002', 'SEG-005', 'SEG-001', 'FIS-001', 'BIO-MEC-004', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'MINAPO-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgos múltiples en apoyo a minería y canteras',
        descripcion: 'Operaciones de perforación, voladura, transporte de material y mantenimiento en minería',
        riesgoPotencial: 'Traumatismos por maquinaria, caídas, aplastamientos',
        efectosPosibles: 'Lesiones graves, muerte',
        medidasControl: ['EPP completo según tarea', 'Análisis de riesgo por tarea (ART)', 'Permisos de trabajo para actividades críticas', 'Señalización de zonas de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-685-2001', norma: 'Ley 685/2001', descripcion: 'Código de Minas', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Respirador P100', 'Gafas de seguridad', 'Protección auditiva', 'Botas con puntera', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Seguridad minera general', 'ART para tareas críticas', 'Operación de maquinaria pesada', 'Primeros auxilios']
  },

  // ==================== SECCIÓN C - INDUSTRIAS MANUFACTURERAS ====================

  {
    codigoCIIU: '1012',
    descripcionCIIU: 'Procesamiento y conservación de pescados, crustáceos y moluscos',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'QUI-003', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'PESCA-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico y parasitario en pescado y mariscos',
        descripcion: 'Manipulación de pescado y mariscos crudos con Listeria, Vibrio, Anisakis y otros patógenos',
        riesgoPotencial: 'Infecciones y parasitosis',
        efectosPosibles: 'Gastroenteritis, listeriosis, infecciones cutáneas, anisakiosis',
        medidasControl: ['Carné de manipulación', 'BPM Resolución 2674/2013', 'Control de temperatura de la cadena de frío', 'Lavado de manos y calzado en ingreso a planta']
      },
      {
        codigo: 'PESCA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a amoníaco en sistemas de refrigeración de planta',
        descripcion: 'Uso de amoníaco como refrigerante en plantas procesadoras con riesgo de fuga',
        riesgoPotencial: 'Intoxicación por amoníaco',
        efectosPosibles: 'Irritación severa de vías respiratorias, quemaduras oculares, asfixia',
        medidasControl: ['Detectores de NH3 en planta', 'Plan de emergencia por fuga de amoníaco', 'SCBA disponible', 'Mantenimiento preventivo del sistema de refrigeración']
      },
      {
        codigo: 'PESCA-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Trabajo en ambiente frío en cámaras y proceso de congelación',
        descripcion: 'Exposición a temperaturas bajo cero en cámaras de congelación y zonas de proceso frío',
        riesgoPotencial: 'Hipotermia y enfermedades por frío',
        efectosPosibles: 'Hipotermia, congelamiento de extremidades, infecciones respiratorias',
        medidasControl: ['Ropa térmica certificada', 'Límite de tiempo de exposición', 'Rotación de personal', 'Zona de calentamiento disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM para industria de alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caucho con puntera', 'Guantes de malla anticorte', 'Ropa térmica para cámaras', 'Gorra o cofia', 'Delantal impermeable', 'Mascarilla'],
    capacitacionesObligatorias: ['BPM en industria pesquera', 'Prevención de hipotermia', 'Manejo de amoníaco', 'Primeros auxilios - quemaduras por frío']
  },

  {
    codigoCIIU: '1020',
    descripcionCIIU: 'Procesamiento y conservación de frutas, legumbres, hortalizas y tubérculos',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['BIO-001', 'QUI-003', 'BIO-MEC-001', 'FIS-004', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'FRUTA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a ácidos y conservantes en procesamiento',
        descripcion: 'Uso de ácido cítrico, acético, sorbato de potasio y otros aditivos conservantes',
        riesgoPotencial: 'Irritación cutánea y respiratoria',
        efectosPosibles: 'Dermatitis de contacto, irritación de vías respiratorias',
        medidasControl: ['Guantes de nitrilo', 'Ventilación en área de aditivos', 'SDS de cada aditivo', 'Gafas de seguridad en dilución de ácidos']
      },
      {
        codigo: 'FRUTA-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Maquinaria de corte y pelado de frutas y hortalizas',
        descripcion: 'Uso de trituradoras, peladores, cortadoras y despulpadoras con partes en movimiento',
        riesgoPotencial: 'Amputaciones y cortes graves',
        efectosPosibles: 'Amputación de dedos, laceraciones',
        medidasControl: ['Guardas en toda la maquinaria', 'LOTO para mantenimiento', 'Herramienta empujadora', 'Capacitación obligatoria']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte', 'Gafas de seguridad', 'Delantal impermeable', 'Botas de caucho', 'Gorra o cofia'],
    capacitacionesObligatorias: ['BPM en procesamiento de frutas', 'Seguridad en maquinaria de alimentos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1030',
    descripcionCIIU: 'Elaboración de aceites y grasas de origen vegetal y animal',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['SEG-006', 'QUI-001', 'FIS-004', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'ACEIT-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio en planta de aceites vegetales',
        descripcion: 'Alta concentración de vapores de aceite y hexano en extracción por solvente, riesgo de incendio',
        riesgoPotencial: 'Incendio y explosión',
        efectosPosibles: 'Quemaduras graves, explosión',
        medidasControl: ['Sistema de detección y extinción automática', 'Equipo antiexplosión en áreas de solvente', 'Control de fuentes de ignición', 'Plan de emergencias de incendio']
      },
      {
        codigo: 'ACEIT-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Quemaduras por aceite caliente en proceso de refinación',
        descripcion: 'Manipulación de aceites a alta temperatura en neutralización, blanqueo y desodorización',
        riesgoPotencial: 'Quemaduras graves',
        efectosPosibles: 'Quemaduras de 2° y 3° grado',
        medidasControl: ['Ropa de algodón tratado', 'Guantes térmicos resistentes a aceite', 'Pantalla facial', 'Señalización de superficies calientes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Delantal y ropa resistente al calor', 'Guantes térmicos', 'Pantalla facial', 'Botas de caucho', 'Mascarilla para vapores'],
    capacitacionesObligatorias: ['Prevención y control de incendios', 'Manejo de solventes', 'Primeros auxilios - quemaduras']
  },

  {
    codigoCIIU: '1040',
    descripcionCIIU: 'Elaboración de productos lácteos',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-003', 'FIS-004', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'LACT-MFAB-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico en leche cruda y derivados',
        descripcion: 'Manejo de leche cruda con posible contaminación por Listeria, Brucella, Salmonella y E. coli',
        riesgoPotencial: 'Zoonosis y ETA en planta',
        efectosPosibles: 'Brucelosis ocupacional, listeriosis, salmonelosis',
        medidasControl: ['Carné de manipulación de alimentos', 'Vacunación brucelosis (personal en contacto con leche cruda)', 'BPM rigurosas', 'Control de temperatura de pasteurización']
      },
      {
        codigo: 'LACT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Limpieza y desinfección con CIP (clean in place) - ácidos y bases fuertes',
        descripcion: 'Circulación de ácido nítrico, ácido fosfórico y soda cáustica en sistemas CIP de planta láctea',
        riesgoPotencial: 'Quemaduras químicas por ruptura de línea',
        efectosPosibles: 'Quemaduras graves en piel y ojos',
        medidasControl: ['Careta facial en conexión/desconexión de líneas CIP', 'Ducha de emergencia', 'Guantes de nitrilo grueso', 'Procedimiento estricto de mantenimiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-616-2006', norma: 'Decreto 616/2006', descripcion: 'Reglamento técnico de la leche', obligatorio: true },
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta facial para CIP', 'Guantes de nitrilo grueso', 'Botas de caucho', 'Delantal impermeable', 'Gorra'],
    capacitacionesObligatorias: ['BPM en industria láctea', 'Brucelosis y zoonosis', 'Manejo seguro de ácidos y bases', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1051',
    descripcionCIIU: 'Elaboración de productos de molinería',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-002', 'SEG-006', 'FIS-001', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'MOLIN-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de cereal y harina - riesgo explosivo y respiratorio',
        descripcion: 'Alta concentración de polvo de trigo, maíz, arroz que puede generar explosiones de polvo',
        riesgoPotencial: 'Explosión de polvo y neumoconiosis',
        efectosPosibles: 'Explosión de polvo orgánico, asma del panadero, bronquitis crónica',
        medidasControl: ['Sistema de extracción y filtrado de polvo', 'Eliminación de fuentes de ignición', 'Mascarilla para polvo orgánico', 'Espirometría anual', 'Limpieza con aspiradoras industriales (no soplando)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para polvo orgánico (FFP2)', 'Protección auditiva', 'Casco', 'Botas con puntera', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Prevención de explosiones de polvo', 'Vigilancia médica respiratoria', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1052',
    descripcionCIIU: 'Elaboración de almidones y productos derivados del almidón',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-002', 'SEG-006', 'BIO-MEC-001', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'ALMID-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de almidón con riesgo de explosión',
        descripcion: 'Alta concentración de polvo orgánico de almidón con potencial de explosión',
        riesgoPotencial: 'Explosión de polvo orgánico',
        efectosPosibles: 'Quemaduras, traumatismos, muerte',
        medidasControl: ['Sistema de extracción de polvo', 'Control de fuentes de ignición', 'Instalaciones equipotenciales', 'No barrer sino aspirar el polvo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Ropa antiestática', 'Calzado antiestático', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Prevención de explosiones de polvo orgánico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1061',
    descripcionCIIU: 'Trilla de café',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'BIO-004', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'CAFE-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de café y cascarilla en trilla',
        descripcion: 'Alta concentración de polvo orgánico de café y cascarilla en operaciones de trilla, clasificación y empaque',
        riesgoPotencial: 'Asma ocupacional y neumoconiosis',
        efectosPosibles: 'Asma del procesador de café, bronquitis, rinitis alérgica',
        medidasControl: ['Sistema de extracción de polvo en cada equipo', 'Mascarilla FFP2', 'Espirometría anual', 'Rotación de personal sensibilizado']
      },
      {
        codigo: 'CAFE-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido en operaciones de trilla y clasificación',
        descripcion: 'Exposición a ruido de trilladoras, ventiladores y clasificadoras por encima de 85 dB(A)',
        riesgoPotencial: 'Hipoacusia laboral',
        efectosPosibles: 'Pérdida auditiva inducida por ruido',
        medidasControl: ['Protección auditiva obligatoria', 'Audiometría anual', 'Control de ruido en la fuente (aislamientos acústicos)', 'Rotación de personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-8321-1983', norma: 'Resolución 8321/1983', descripcion: 'Protección auditiva', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Protección auditiva', 'Gafas de seguridad', 'Botas de caucho', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Conservación auditiva', 'Vigilancia epidemiológica respiratoria', 'BPM en trilla de café', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1062',
    descripcionCIIU: 'Descafeinado, tostión y molienda del café',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'FIS-004', 'FIS-001', 'SEG-006', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'TOST-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor y vapor en proceso de tostión del café',
        descripcion: 'Trabajo cerca de tostadores rotatorios a alta temperatura con emisión de vapor y calor',
        riesgoPotencial: 'Estrés térmico y quemaduras',
        efectosPosibles: 'Golpe de calor, quemaduras por contacto con tostador',
        medidasControl: ['Ropa de trabajo de algodón', 'Guantes térmicos', 'Ventilación de área de tostión', 'Tiempo límite de exposición al calor']
      },
      {
        codigo: 'TOST-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Vapores de tostión y COV del café',
        descripcion: 'Inhalación de compuestos orgánicos volátiles (diacetil, furfural) emitidos en tostión de café',
        riesgoPotencial: 'Bronquiolitis obliterante ("popcorn lung") y afecciones respiratorias',
        efectosPosibles: 'Bronquiolitis obliterante, asma, irritación respiratoria',
        medidasControl: ['Ventilación por extracción en tostadores', 'Mascarilla con filtro de vapores orgánicos', 'Espirometrías periódicas', 'Monitoreo de diacetil']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro de vapores orgánicos', 'Guantes térmicos', 'Ropa de algodón', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Vigilancia respiratoria - diacetil', 'Prevención de estrés térmico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1063',
    descripcionCIIU: 'Otros derivados del café',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'FIS-001', 'FIS-004', 'BIO-001'],
    peligrosEspecificos: [
      {
        codigo: 'CAFDER-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo repetitivo en líneas de producción de derivados de café',
        descripcion: 'Operaciones de envasado, etiquetado y empaque de derivados de café con movimientos repetitivos',
        riesgoPotencial: 'Lesiones musculoesqueléticas por movimientos repetitivos',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Rotación de tareas', 'Pausas activas programadas', 'Herramientas ergonómicas', 'Evaluación ergonómica de puestos de envasado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para polvo de café', 'Guantes de trabajo', 'Protección auditiva'],
    capacitacionesObligatorias: ['Ergonomía en líneas de producción', 'Vigilancia médica respiratoria', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1071',
    descripcionCIIU: 'Elaboración y refinación de azúcar',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['FIS-004', 'QUI-002', 'SEG-006', 'FIS-001', 'SEG-005', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'AZUC-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Estrés térmico severo en proceso de evaporación y cristalización',
        descripcion: 'Trabajo en ambientes de alta temperatura en trapiche y evaporadores de azúcar',
        riesgoPotencial: 'Golpe de calor',
        efectosPosibles: 'Agotamiento por calor, golpe de calor, deshidratación severa',
        medidasControl: ['Índice WBGT monitoreo permanente', 'Hidratación programada cada 20 min', 'Rotación de personal en zonas calientes', 'Sala de descanso climatizada', 'Bebidas con electrolitos']
      },
      {
        codigo: 'AZUC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de azúcar con riesgo de explosión',
        descripcion: 'Polvo fino de azúcar en refinería con potencial de explosión en altas concentraciones',
        riesgoPotencial: 'Explosión de polvo orgánico',
        efectosPosibles: 'Quemaduras, explosión',
        medidasControl: ['Sistemas de extracción y filtrado de polvo', 'Equipotencialidad y puesta a tierra', 'No fumar en planta', 'Limpieza frecuente de superficies']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Ropa de algodón de manga larga', 'Mascarilla FFP2', 'Calzado antiestático', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Prevención de estrés térmico', 'Explosiones de polvo orgánico', 'Seguridad eléctrica en zona azucarera', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1072',
    descripcionCIIU: 'Elaboración de panela',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['FIS-004', 'SEG-006', 'BIO-MEC-004', 'QUI-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'PANEL-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor extremo en hornillas de trapiches paneleros',
        descripcion: 'Trabajo en hornillas con temperaturas del jugo de caña superiores a 120°C, calor radiante intenso',
        riesgoPotencial: 'Quemaduras graves y golpe de calor',
        efectosPosibles: 'Quemaduras de 2° y 3° grado, golpe de calor',
        medidasControl: ['Ropa de algodón protectora', 'Hidratación obligatoria y frecuente', 'Rotación de personal en hornillas', 'No manipular melado hirviendo sin EPP']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0779-2006', norma: 'Resolución 0779/2006', descripcion: 'Reglamento técnico panela', obligatorio: true }
    ],
    eppRecomendado: ['Ropa de algodón de manga larga', 'Guantes térmicos de cuero', 'Delantal de cuero', 'Calzado de cuero cerrado'],
    capacitacionesObligatorias: ['Prevención de quemaduras en trapiches', 'Prevención de estrés térmico', 'Primeros auxilios - quemaduras']
  },

  {
    codigoCIIU: '1082',
    descripcionCIIU: 'Elaboración de cacao, chocolate y productos de confitería',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-002', 'FIS-004', 'BIO-MEC-001', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'CHOC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de cacao y azúcar en ambiente de trabajo',
        descripcion: 'Inhalación de polvo fino de cacao y azúcar en tostión, molienda y tempering de chocolate',
        riesgoPotencial: 'Asma ocupacional y alergia respiratoria',
        efectosPosibles: 'Asma al cacao, rinitis, bronquitis',
        medidasControl: ['Sistema de extracción de polvo', 'Mascarilla FFP2', 'Espirometría anual', 'Ventilación general de planta']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Gorra', 'Calzado antideslizante', 'Guantes de nitrilo desechables'],
    capacitacionesObligatorias: ['BPM en confitería', 'Vigilancia médica respiratoria', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1083',
    descripcionCIIU: 'Elaboración de macarrones, fideos, alcuzcuz y productos farináceos similares',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'BIO-MEC-001', 'SEG-005', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'PASTA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de harina en elaboración de pastas',
        descripcion: 'Inhalación de polvo de harina de trigo en mezclado, extrusión y secado de pastas',
        riesgoPotencial: 'Asma del panadero y rinitis',
        efectosPosibles: 'Asma ocupacional, rinitis, conjuntivitis alérgica',
        medidasControl: ['Sistema de extracción de polvo', 'Mascarilla FFP2', 'Espirometría anual', 'Limpieza húmeda o por aspiración']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Gorra', 'Calzado antideslizante', 'Guantes'],
    capacitacionesObligatorias: ['BPM en industria de pastas', 'Vigilancia médica respiratoria', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1084',
    descripcionCIIU: 'Elaboración de comidas y platos preparados',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'FIS-004', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PLATOS-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico en comidas preparadas',
        descripcion: 'Manipulación de múltiples materias primas en preparación de platos con alto riesgo de contaminación cruzada',
        riesgoPotencial: 'ETA en producción masiva',
        efectosPosibles: 'Intoxicaciones masivas de consumidores, afectación al trabajador',
        medidasControl: ['HACCP obligatorio', 'BPM Res. 2674/2013', 'Control de temperatura de cocción >74°C', 'Separación de alergenos', 'Monitoreo microbiológico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gorra', 'Guantes desechables', 'Delantal', 'Calzado antideslizante con puntera'],
    capacitacionesObligatorias: ['HACCP y BPM', 'Control de temperaturas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1089',
    descripcionCIIU: 'Elaboración de otros productos alimenticios n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['BIO-001', 'QUI-001', 'BIO-MEC-001', 'FIS-004', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'ALIMNCP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo microbiológico en elaboración de alimentos especializados',
        descripcion: 'Producción de salsas, condimentos, snacks, encurtidos u otros alimentos con riesgo de contaminación',
        riesgoPotencial: 'ETA por falla en proceso',
        efectosPosibles: 'Intoxicación alimentaria',
        medidasControl: ['BPM y HACCP según producto', 'Control de parámetros críticos (pH, aw, temperatura)', 'Carné de manipulación de alimentos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2674-2013', norma: 'Resolución 2674/2013', descripcion: 'BPM alimentos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gorra', 'Guantes desechables', 'Calzado antideslizante', 'Mascarilla según proceso'],
    capacitacionesObligatorias: ['BPM y HACCP', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1090',
    descripcionCIIU: 'Elaboración de alimentos preparados para animales',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Alimentos',
    peligrosPrioritarios: ['QUI-002', 'BIO-004', 'FIS-001', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PIENSO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo orgánico y micotoxinas en materias primas de alimentos para animales',
        descripcion: 'Inhalación de polvo de harinas animales, cereales y materias primas con posible presencia de micotoxinas',
        riesgoPotencial: 'Neumoconiosis y micotoxicosis',
        efectosPosibles: 'Afecciones respiratorias, hipersensibilidad, daño hepático por micotoxinas',
        medidasControl: ['Sistema de extracción de polvo', 'Mascarilla FFP2', 'Control de calidad de materias primas (aflatoxinas)', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Gafas de seguridad', 'Guantes de nitrilo', 'Botas de caucho'],
    capacitacionesObligatorias: ['Control de polvo orgánico', 'Manejo de micotoxinas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1101',
    descripcionCIIU: 'Destilación, rectificación y mezcla de bebidas alcohólicas',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Bebidas',
    peligrosPrioritarios: ['SEG-006', 'QUI-001', 'FIS-004', 'SEG-003', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'DEST-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio y explosión por vapores de alcohol',
        descripcion: 'Acumulación de vapores de etanol en destilería con alto potencial de ignición',
        riesgoPotencial: 'Incendio y explosión',
        efectosPosibles: 'Quemaduras graves, explosión',
        medidasControl: ['Ventilación explosionproof', 'Detector de vapores inflamables', 'Equipos eléctricos antiexplosión', 'Control de fuentes de ignición', 'Extinción automática']
      },
      {
        codigo: 'DEST-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a vapores de etanol y metanol',
        descripcion: 'Inhalación de vapores de alcohol etílico y metílico en proceso de destilación',
        riesgoPotencial: 'Intoxicación y narcosis',
        efectosPosibles: 'Cefalea, mareos, narcosis, daño ocular por metanol',
        medidasControl: ['Ventilación por extracción', 'Mascarilla con filtro para vapores orgánicos', 'Monitoreo de vapores de alcohol', 'Rotación de personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Gafas de seguridad', 'Guantes de nitrilo', 'Ropa ignífuga'],
    capacitacionesObligatorias: ['Prevención de incendios en destilería', 'Manejo de vapores inflamables', 'Primeros auxilios - intoxicación por alcohol']
  },

  {
    codigoCIIU: '1102',
    descripcionCIIU: 'Elaboración de bebidas fermentadas no destiladas',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Bebidas',
    peligrosPrioritarios: ['QUI-001', 'SEG-003', 'BIO-001', 'FIS-004', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'FERM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Acumulación de CO2 en tanques y espacios confinados de fermentación',
        descripcion: 'Generación de CO2 en fermentación de vino, chicha, kumis u otras bebidas fermentadas',
        riesgoPotencial: 'Asfixia por desplazamiento de oxígeno',
        efectosPosibles: 'Pérdida de conciencia, asfixia, muerte',
        medidasControl: ['Ventilación de bodega de fermentación', 'Detector de CO2', 'Permiso de trabajo en espacios confinados', 'Nunca entrar solo en tanques']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Detector de CO2 portátil', 'SCBA para entrada a tanques', 'Botas de caucho', 'Guantes de nitrilo'],
    capacitacionesObligatorias: ['Trabajo en espacios confinados', 'Manejo de CO2', 'Primeros auxilios - asfixia']
  },

  {
    codigoCIIU: '1103',
    descripcionCIIU: 'Producción de malta, elaboración de cervezas y otras bebidas malteadas',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Bebidas',
    peligrosPrioritarios: ['QUI-001', 'SEG-003', 'FIS-004', 'QUI-002', 'SEG-006', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'CERV-QUI-001',
        clasificacion: 'quimico',
        peligro: 'CO2 en procesos de fermentación y carbonatación de cerveza',
        descripcion: 'Altas concentraciones de CO2 en tanques de fermentación, bodegas y salas de empaque',
        riesgoPotencial: 'Asfixia',
        efectosPosibles: 'Pérdida de conciencia, muerte',
        medidasControl: ['Detectores de CO2 fijos y portátiles', 'Ventilación permanente', 'Permiso de espacio confinado para tanques', 'Sistema de alarma al personal']
      },
      {
        codigo: 'CERV-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor en cocción y ebullición de mosto',
        descripcion: 'Trabajo en salas de cocción con temperaturas superiores a 100°C y vapor de agua',
        riesgoPotencial: 'Quemaduras y estrés térmico',
        efectosPosibles: 'Quemaduras por vapor, golpe de calor',
        medidasControl: ['Ropa de algodón manga larga', 'Guantes térmicos', 'Acceso controlado a líneas de vapor', 'Hidratación frecuente']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Detector de CO2 portátil', 'Ropa de trabajo de algodón', 'Guantes térmicos', 'Botas de caucho', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Espacios confinados en cervecería', 'Prevención de quemaduras', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1311',
    descripcionCIIU: 'Preparación e hilatura de fibras textiles',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'BIO-MEC-001', 'SEG-005', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'HILAR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de fibras textiles (bisinosis en algodón)',
        descripcion: 'Inhalación de polvo de algodón, lana, fibras sintéticas en preparación e hilatura',
        riesgoPotencial: 'Bisinosis, asma textil, neumoconiosis',
        efectosPosibles: 'Bisinosis por algodón, asma ocupacional, EPOC',
        medidasControl: ['Sistema de extracción de polvo en cada máquina', 'Mascarilla FFP2', 'Espirometría anual', 'Rotación fuera del área en personal sensibilizado']
      },
      {
        codigo: 'HILAR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido de maquinaria de hilatura',
        descripcion: 'Exposición a ruido de cardas, coneras y husos por encima de 85 dB(A)',
        riesgoPotencial: 'Hipoacusia laboral',
        efectosPosibles: 'Pérdida auditiva progresiva',
        medidasControl: ['Protección auditiva obligatoria', 'Audiometría anual', 'Encapsulamiento acústico de maquinaria', 'Rotación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Protección auditiva', 'Gafas de seguridad', 'Guantes de cuero', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Vigilancia epidemiológica respiratoria - bisinosis', 'Conservación auditiva', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1312',
    descripcionCIIU: 'Tejeduría de productos textiles',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['FIS-001', 'QUI-002', 'BIO-MEC-001', 'BIO-MEC-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'TEJED-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido de telares',
        descripcion: 'Telares mecánicos y de lanzadera generan niveles de ruido superiores a 95 dB(A)',
        riesgoPotencial: 'Hipoacusia severa',
        efectosPosibles: 'Pérdida auditiva grave e irreversible',
        medidasControl: ['Protección auditiva de copa obligatoria', 'Audiometría semestral', 'Encapsulamiento de telares', 'Rotación en zona de telares']
      },
      {
        codigo: 'TEJED-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en partes móviles del telar',
        descripcion: 'Riesgo de atrapamiento de manos o cabello en lanzaderas, rodillos y peines del telar en marcha',
        riesgoPotencial: 'Amputaciones y fracturas',
        efectosPosibles: 'Amputaciones de dedos, fractura de manos',
        medidasControl: ['Guardas de malla en partes móviles', 'Dispositivo de paro de emergencia', 'Cabello recogido obligatorio', 'LOTO para mantenimiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-8321-1983', norma: 'Resolución 8321/1983', descripcion: 'Protección auditiva', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva de copa', 'Gafas de seguridad', 'Calzado de seguridad', 'Gorra obligatoria (cabello recogido)'],
    capacitacionesObligatorias: ['Conservación auditiva', 'Seguridad en maquinaria textil', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1313',
    descripcionCIIU: 'Acabado de productos textiles',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'QUI-004', 'FIS-004', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'ACAB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a colorantes, blanqueadores y aprestos químicos',
        descripcion: 'Uso de colorantes reactivos, ácidos, soda cáustica, hipoclorito y resinas en acabados textiles',
        riesgoPotencial: 'Dermatitis alérgica, afecciones respiratorias e intoxicación',
        efectosPosibles: 'Dermatitis, asma ocupacional, irritación de mucosas',
        medidasControl: ['Guantes de nitrilo grueso', 'Careta facial para ácidos/bases', 'Ventilación por extracción', 'SDS disponibles', 'Duchas de emergencia']
      },
      {
        codigo: 'ACAB-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Vapor y calor en calandrias y autoclaves de acabado',
        descripcion: 'Trabajo en equipos de termofijado, calandrias y autoclaves a alta temperatura y presión',
        riesgoPotencial: 'Quemaduras y estrés térmico',
        efectosPosibles: 'Quemaduras por vapor, golpe de calor',
        medidasControl: ['Válvulas de seguridad en equipos a presión', 'EPP térmico', 'Distancia de seguridad en apertura de cámaras']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo grueso', 'Careta facial', 'Mascarilla para vapores químicos', 'Delantal de PVC', 'Botas de caucho'],
    capacitacionesObligatorias: ['Manejo seguro de colorantes y ácidos', 'Vigilancia médica dermatológica', 'Primeros auxilios - quemaduras químicas']
  },

  {
    codigoCIIU: '1391',
    descripcionCIIU: 'Fabricación de tejidos de punto y ganchillo',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'BIO-MEC-001', 'BIO-MEC-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'PUNTO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movimientos repetitivos en tejedoras de punto',
        descripcion: 'Atención de tejedoras circulares con movimientos repetitivos de manos y muñecas',
        riesgoPotencial: 'Lesiones por trauma acumulativo',
        efectosPosibles: 'Síndrome del túnel carpiano, epicondilitis, tendinitis',
        medidasControl: ['Rotación de tareas', 'Pausas activas cada hora', 'Evaluación ergonómica de puestos', 'Herramientas ergonómicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva', 'Mascarilla para polvo de fibra'],
    capacitacionesObligatorias: ['Ergonomía en industria textil', 'Conservación auditiva', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1392',
    descripcionCIIU: 'Confección de artículos con materiales textiles, excepto prendas de vestir',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'FIS-001', 'QUI-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'CONF-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Postura sedente prolongada y movimientos repetitivos en confección',
        descripcion: 'Operación de máquinas de coser en posición sentada todo el día con movimientos repetitivos de brazos',
        riesgoPotencial: 'Lesiones musculoesqueléticas de alta prevalencia',
        efectosPosibles: 'Dolor lumbar, síndrome del túnel carpiano, tendinitis de hombro',
        medidasControl: ['Silla ergonómica regulable', 'Mesa de trabajo a altura correcta', 'Pausas activas cada 50 min', 'Iluminación adecuada en puesto de costura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica regulable', 'Dedal', 'Lentes correctivos si hay fatiga visual'],
    capacitacionesObligatorias: ['Ergonomía en confección', 'Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1393',
    descripcionCIIU: 'Fabricación de tapetes y alfombras para pisos',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['QUI-002', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'TAPIZ-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de fibras y adhesivos en fabricación de tapetes',
        descripcion: 'Inhalación de polvo de fibras sintéticas, látex y adhesivos en fabricación de tapetes',
        riesgoPotencial: 'Afecciones respiratorias y alérgicas',
        efectosPosibles: 'Rinitis, asma, dermatitis por látex',
        medidasControl: ['Sistema de extracción de polvo', 'Mascarilla FFP2', 'Guantes sin látex (nitrilo) en personal alérgico', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Guantes de nitrilo', 'Protección auditiva'],
    capacitacionesObligatorias: ['Control de polvo de fibras', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1394',
    descripcionCIIU: 'Fabricación de cuerdas, cordeles, cables, bramantes y redes',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['SEG-005', 'QUI-002', 'FIS-001', 'BIO-MEC-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'CORD-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento en maquinaria de torcido y trenzado',
        descripcion: 'Riesgo de atrapamiento de manos, ropa o cabello en maquinaria de torcido de cuerdas',
        riesgoPotencial: 'Amputaciones y traumatismos',
        efectosPosibles: 'Amputaciones, desgarros, avulsiones',
        medidasControl: ['Guardas completas en toda la maquinaria', 'Ropa ajustada', 'Cabello recogido', 'Distancia de seguridad durante operación', 'LOTO para mantenimiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Calzado con puntera', 'Protección auditiva', 'Guantes de trabajo (no sueltos)'],
    capacitacionesObligatorias: ['Seguridad en maquinaria de cuerdas', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1399',
    descripcionCIIU: 'Fabricación de otros artículos textiles n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['QUI-002', 'BIO-MEC-001', 'FIS-001', 'SEG-005', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'TEXNCP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movimientos repetitivos en producción textil diversa',
        descripcion: 'Fabricación de artículos como bordados, encajes, etiquetas con operaciones repetitivas de mano',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis',
        medidasControl: ['Rotación de puestos', 'Pausas activas', 'Herramientas ergonómicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para polvo', 'Protección auditiva'],
    capacitacionesObligatorias: ['Ergonomía en textiles', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1420',
    descripcionCIIU: 'Fabricación de artículos de piel',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Cuero',
    peligrosPrioritarios: ['BIO-002', 'QUI-001', 'BIO-MEC-001', 'BIO-MEC-002', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'PIEL-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Biocidas y conservantes en pieles no curtidas',
        descripcion: 'Exposición a sales de arsénico, formaldehído y biocidas para conservación de pieles',
        riesgoPotencial: 'Intoxicación y sensibilización',
        efectosPosibles: 'Dermatitis, irritación respiratoria, intoxicación crónica por arsénico',
        medidasControl: ['Guantes de nitrilo', 'Mascarilla para vapores', 'SDS disponibles', 'Ventilación del área']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Delantal de trabajo'],
    capacitacionesObligatorias: ['Manejo de biocidas en pieles', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1430',
    descripcionCIIU: 'Fabricación de artículos de punto y ganchillo',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'FIS-001', 'QUI-002', 'PSI-003'],
    peligrosEspecificos: [
      {
        codigo: 'ARTPUNT-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo sedente prolongado en confección de punto',
        descripcion: 'Operación de máquinas de tejido de punto y acabados manuales en posición sentada prolongada',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, tendinitis, síndrome del túnel carpiano',
        medidasControl: ['Silla ergonómica', 'Pausas activas', 'Iluminación correcta', 'Evaluación ergonómica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Iluminación adecuada en puesto'],
    capacitacionesObligatorias: ['Ergonomía en confección de punto', 'Pausas activas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1511',
    descripcionCIIU: 'Curtido y recurtido de cueros; recurtido y teñido de pieles',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Cuero',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'QUI-004', 'BIO-001', 'BIO-002', 'SEG-004', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'CURT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Cromo hexavalente y sulfuros en curtiembre',
        descripcion: 'Exposición a cromo trivalente (riesgo de Cr VI), sulfuro de sodio, cal y formaldehído en proceso de curtido',
        riesgoPotencial: 'Cáncer, úlceras nasales, dermatitis crónica',
        efectosPosibles: 'Cáncer de pulmón y nasal (Cr VI), úlceras nasales, dermatitis de contacto',
        medidasControl: ['Guantes de PVC o nitrilo grueso', 'Botas de caucho', 'Delantal impermeable', 'Careta facial', 'Monitoreo de Cr VI en orina', 'Cabinas de extracción en sulfuros']
      },
      {
        codigo: 'CURT-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con cueros crudos con contaminación biológica',
        descripcion: 'Manipulación de cueros frescos o salados con bacterias, parásitos y posible carbunco',
        riesgoPotencial: 'Infecciones y zoonosis',
        efectosPosibles: 'Ántrax cutáneo, brucelosis, leptospirosis',
        medidasControl: ['Guantes de cuero o PVC', 'Vacunación', 'Lavado de manos riguroso', 'No manipular cueros sin guantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos peligrosos de curtiembre', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de PVC o nitrilo grueso', 'Botas de caucho con puntera', 'Careta facial', 'Delantal impermeable de PVC', 'Mascarilla con filtro para gases/vapores'],
    capacitacionesObligatorias: ['Manejo seguro de cromo y curtientes', 'Bioseguridad en curtiembre', 'Gestión de residuos peligrosos', 'Primeros auxilios - quemaduras químicas']
  },

  {
    codigoCIIU: '1512',
    descripcionCIIU: 'Fabricación de artículos de viaje, bolsos de mano, maletas y artículos similares',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Cuero',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'BIO-MEC-002', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'BOLSO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Pegamentos y solventes en fabricación de marroquinería',
        descripcion: 'Uso de adhesivos de contacto (tolueno, hexano) en ensamble de bolsos y maletas',
        riesgoPotencial: 'Intoxicación crónica por solventes',
        efectosPosibles: 'Neuropatía periférica, daño hepático, narcosis',
        medidasControl: ['Cabina de extracción en área de pegados', 'Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Preferir adhesivos de base acuosa']
      },
      {
        codigo: 'BOLSO-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo sedente con movimientos repetitivos de mano',
        descripcion: 'Costura, pegado y ensamble de piezas en posición sentada prolongada',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Túnel carpiano, tendinitis, lumbalgia',
        medidasControl: ['Silla ergonómica', 'Mesa de trabajo a altura correcta', 'Pausas activas', 'Rotación de tareas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para vapores orgánicos', 'Guantes de nitrilo', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Manejo de adhesivos y solventes', 'Ergonomía en marroquinería', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1513',
    descripcionCIIU: 'Fabricación de artículos de talabartería y guarnicionería',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Cuero',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'SEG-005', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'TALA-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Esfuerzo manual en corte y costura de cuero grueso',
        descripcion: 'Uso de corte manual, sacabocados y máquinas de coser cuero de alta resistencia',
        riesgoPotencial: 'Lesiones musculoesqueléticas y cortes',
        efectosPosibles: 'Tendinitis, túnel carpiano, laceraciones',
        medidasControl: ['Cuchillos afilados (más seguros que desafilados)', 'Guantes anticorte', 'Herramientas ergonómicas', 'Rotación de tareas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte', 'Delantal de cuero', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Manejo seguro de herramientas de corte', 'Ergonomía', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1521',
    descripcionCIIU: 'Fabricación de calzado de cuero y piel',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Calzado',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'BIO-MEC-001', 'BIO-MEC-002', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'CALZ-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Pegamentos de hexano y tolueno en fabricación de calzado',
        descripcion: 'Uso masivo de pegamentos de contacto con solventes orgánicos en cadenas de producción de calzado',
        riesgoPotencial: 'Neuropatía periférica por hexano (síndrome del zapatero)',
        efectosPosibles: 'Neuropatía periférica grave, daño neurológico permanente, daño hepático',
        medidasControl: ['Cabinas de extracción localizadas en cada puesto de pegado', 'Mascarilla con filtro para vapores orgánicos', 'Sustitución de solventes por adhesivos de base acuosa', 'Monitoreo biológico de n-hexano en orina']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Riesgo por hexano en calzado', 'Vigilancia neurológica', 'Sustitución de solventes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1522',
    descripcionCIIU: 'Fabricación de otros tipos de calzado, excepto calzado de cuero y piel',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Calzado',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'BIO-MEC-002', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'CALZNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Adhesivos y solventes en calzado sintético',
        descripcion: 'Uso de pegamentos de contacto con solventes en fabricación de calzado de materiales sintéticos',
        riesgoPotencial: 'Intoxicación por solventes',
        efectosPosibles: 'Daño neurológico, hepático y renal',
        medidasControl: ['Extracción localizada', 'Mascarilla para vapores orgánicos', 'Guantes de nitrilo', 'Preferir adhesivos acuosos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para vapores orgánicos', 'Guantes de nitrilo', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Manejo de adhesivos con solvente', 'Ergonomía en calzado', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1523',
    descripcionCIIU: 'Fabricación de partes del calzado',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Calzado',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'BIO-MEC-001', 'FIS-001', 'QUI-002'],
    peligrosEspecificos: [
      {
        codigo: 'PART-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Caucho vulcanizado y químicos de proceso en suelas',
        descripcion: 'Vulcanización de caucho con azufre y acelerantes en fabricación de suelas',
        riesgoPotencial: 'Dermatitis alérgica y afecciones respiratorias',
        efectosPosibles: 'Dermatitis por tiuramos, irritación respiratoria',
        medidasControl: ['Guantes de nitrilo', 'Ventilación de área de vulcanización', 'Monitoreo de mercaptobenzotiazol']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla para vapores', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de caucho y vulcanización', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1610',
    descripcionCIIU: 'Aserrado, acepillado e impregnación de la madera',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Madera',
    peligrosPrioritarios: ['QUI-002', 'SEG-005', 'FIS-001', 'QUI-001', 'BIO-MEC-001', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'ASERR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Sierra circular y cinta sin fin',
        descripcion: 'Operación de sierras circulares de gran diámetro y sierras de cinta para corte de troncos',
        riesgoPotencial: 'Amputaciones graves',
        efectosPosibles: 'Amputaciones de dedos, manos, brazo',
        medidasControl: ['Guardas ajustables certificadas', 'Herramienta empujadora obligatoria', 'LOTO para mantenimiento y ajuste', 'Capacitación certificada en operación de sierra', 'Pantalla deflectora de aserrín']
      },
      {
        codigo: 'ASERR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de madera - riesgo cancerígeno en maderas duras',
        descripcion: 'Inhalación de polvo de madera dura (roble, haya, cedro) clasificado como cancerígeno IARC grupo 1',
        riesgoPotencial: 'Cáncer nasosinusal y de cavidad nasal',
        efectosPosibles: 'Adenocarcinoma nasosinusal, asma del carpintero',
        medidasControl: ['Extracción en el punto de generación', 'Mascarilla P100 (mínimo FFP3)', 'Espirometría y ORL anuales', 'Monitoreo de polvo respirable <1 mg/m³']
      },
      {
        codigo: 'ASERR-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Preservantes e impregnantes de madera',
        descripcion: 'Aplicación de pentaclorofenol, creosota, CCA (cromo-cobre-arsénico) y otros preservantes',
        riesgoPotencial: 'Intoxicación y cáncer',
        efectosPosibles: 'Dermatitis, hepatotoxicidad, cáncer (CCA)',
        medidasControl: ['EPP completo en impregnación', 'Sustituir CCA por preservantes menos tóxicos', 'Gestión de residuos como peligrosos', 'Duchas de emergencia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100 (FFP3)', 'Protección auditiva', 'Gafas de seguridad', 'Guantes de cuero', 'Calzado con puntera', 'Casco en zona de troncos'],
    capacitacionesObligatorias: ['Seguridad en operación de sierras', 'Prevención de cáncer por polvo de madera dura', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1620',
    descripcionCIIU: 'Fabricación de hojas de madera para enchapado; fabricación de tableros contrachapados',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Madera',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'FIS-004', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'TABLA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Formaldehído en resinas de tableros contrachapados',
        descripcion: 'Inhalación de formaldehído emitido por resinas urea-formaldehído y fenol-formaldehído en prensado',
        riesgoPotencial: 'Cáncer nasofaríngeo y leucemia',
        efectosPosibles: 'Irritación ocular y nasal, sensibilización alérgica, cáncer en exposición crónica',
        medidasControl: ['Ventilación por extracción en prensas', 'Mascarilla con filtro para formaldehído', 'Monitoreo de niveles de HCHO (<0.08 ppm)', 'Sustitución de resinas de bajo formaldehído (E1/E0)']
      },
      {
        codigo: 'TABLA-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor y vapor en prensado en caliente de tableros',
        descripcion: 'Trabajo con prensas a alta temperatura (170-200°C) y vapor en ciclo de prensado',
        riesgoPotencial: 'Quemaduras y estrés térmico',
        efectosPosibles: 'Quemaduras de contacto, golpe de calor',
        medidasControl: ['Guantes térmicos', 'Ropa de algodón', 'Procedimiento de apertura segura de prensa', 'Tiempo de espera de enfriamiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para formaldehído', 'Guantes térmicos', 'Gafas de seguridad', 'Protección auditiva'],
    capacitacionesObligatorias: ['Control de formaldehído', 'Prevención de quemaduras en prensas', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1630',
    descripcionCIIU: 'Fabricación de partes y piezas de madera, de carpintería y ebanistería',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Madera',
    peligrosPrioritarios: ['QUI-002', 'SEG-005', 'FIS-001', 'QUI-001', 'BIO-MEC-001', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'CARPIN-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de madera dura - cancerígeno confirmado',
        descripcion: 'Inhalación de polvo de maderas duras en operaciones de corte, lijado y fresado en carpintería y ebanistería',
        riesgoPotencial: 'Adenocarcinoma nasosinusal (IARC Grupo 1)',
        efectosPosibles: 'Cáncer nasosinusal, asma del carpintero',
        medidasControl: ['Extracción en el punto de generación', 'Mascarilla P100 o FFP3', 'Espirometría y ORL anuales', 'Monitoreo de polvo respirable <1 mg/m³ (maderas duras) o <5 mg/m³ (maderas blandas)']
      },
      {
        codigo: 'CARPIN-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Maquinaria de carpintería (sierra, fresadora, canteadora)',
        descripcion: 'Operación de maquinaria de carpintería con alta frecuencia de accidentes graves',
        riesgoPotencial: 'Amputaciones y cortes graves',
        efectosPosibles: 'Amputaciones, laceraciones profundas',
        medidasControl: ['Guardas ajustables en todas las máquinas', 'Pusher/herramienta empujadora siempre', 'LOTO para cualquier intervención', 'Capacitación específica por máquina']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100 (FFP3)', 'Gafas de seguridad con protección lateral', 'Protección auditiva', 'Guantes anticorte (no sueltos)', 'Calzado con puntera de acero'],
    capacitacionesObligatorias: ['Seguridad en maquinaria de carpintería', 'Polvo de madera dura - cáncer ocupacional', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1640',
    descripcionCIIU: 'Fabricación de recipientes de madera',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Madera',
    peligrosPrioritarios: ['QUI-002', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'QUI-001'],
    peligrosEspecificos: [
      {
        codigo: 'RECMAD-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de madera en fabricación de recipientes',
        descripcion: 'Inhalación de polvo en corte, cepillado y ensamble de recipientes de madera',
        riesgoPotencial: 'Afecciones respiratorias y cáncer en maderas duras',
        efectosPosibles: 'Asma, rinitis, cáncer nasosinusal (maderas duras)',
        medidasControl: ['Extracción localizada', 'Mascarilla P100', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Control de polvo de madera', 'Seguridad en maquinaria', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1690',
    descripcionCIIU: 'Fabricación de otros productos de madera; fabricación de artículos de corcho, cestería y espartería',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Madera',
    peligrosPrioritarios: ['QUI-002', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'QUI-001'],
    peligrosEspecificos: [
      {
        codigo: 'MADNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de madera, corcho y fibras vegetales',
        descripcion: 'Inhalación de polvo orgánico en fabricación de artículos de madera, corcho y cestería',
        riesgoPotencial: 'Afecciones respiratorias',
        efectosPosibles: 'Rinitis, asma ocupacional, posible efecto cancerígeno',
        medidasControl: ['Sistema de extracción de polvo', 'Mascarilla FFP2 o P100', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Protección auditiva', 'Gafas de seguridad', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Control de polvo de madera', 'Seguridad en maquinaria', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1701',
    descripcionCIIU: 'Fabricación de pulpas (pastas) celulósicas; papel y cartón',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Papel',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'FIS-004', 'SEG-006', 'SEG-003', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PULPA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Dióxido de cloro y sulfuro en blanqueo de pulpa',
        descripcion: 'Exposición a dióxido de cloro (ClO2), cloro, sulfuro de hidrógeno y sulfuro de dimetilo en planta de celulosa',
        riesgoPotencial: 'Intoxicación aguda por gases tóxicos',
        efectosPosibles: 'Edema pulmonar, irritación severa de vías respiratorias',
        medidasControl: ['Detectores de gas fijos en toda la planta', 'SCBA disponible en área de blanqueo', 'Alarmas de gas audibles y visuales', 'Plan de emergencia por fuga química']
      },
      {
        codigo: 'PULPA-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Vapor de alta presión en proceso papelero',
        descripcion: 'Riesgo de estallido de tuberías de vapor de alta presión en digestores y secadores',
        riesgoPotencial: 'Quemaduras graves por vapor',
        efectosPosibles: 'Quemaduras de 3° grado, traumatismos por onda de presión',
        medidasControl: ['Mantenimiento preventivo de tuberías y válvulas', 'Inspección NDT periódica', 'Zona de exclusión en válvulas y bridas', 'Ropa resistente a vapor']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['SCBA', 'Traje de protección química', 'Casco', 'Botas de caucho', 'Guantes de nitrilo grueso', 'Gafas herméticas'],
    capacitacionesObligatorias: ['Manejo de gases tóxicos en papel', 'Espacios confinados', 'Manejo de vapor de alta presión', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1702',
    descripcionCIIU: 'Fabricación de papel y cartón ondulado; fabricación de envases, empaques y embalajes de papel y cartón',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Papel',
    peligrosPrioritarios: ['QUI-001', 'FIS-001', 'SEG-005', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'CART-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Adhesivos y tintas en fabricación de cajas de cartón',
        descripcion: 'Uso de almidón de maíz, adhesivos vinílicos y tintas de impresión en corrugado y cajas',
        riesgoPotencial: 'Irritación respiratoria y dermatitis',
        efectosPosibles: 'Dermatitis de contacto, irritación nasal',
        medidasControl: ['Ventilación en área de encolado', 'Guantes de nitrilo', 'SDS de tintas y adhesivos']
      },
      {
        codigo: 'CART-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Maquinaria de troquelado y corte de cartón',
        descripcion: 'Troqueladoras y cortadoras de cartón con alta energía y posibilidad de prensamiento',
        riesgoPotencial: 'Amputaciones por prensamiento',
        efectosPosibles: 'Amputaciones de dedos, aplastamiento de manos',
        medidasControl: ['Dispositivos de seguridad de doble mano', 'Cortina fotoeléctrica', 'Nunca acceder a la zona de corte con la máquina en marcha']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de cuero (no sueltos)', 'Gafas de seguridad', 'Protección auditiva', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en troqueladoras', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1709',
    descripcionCIIU: 'Fabricación de otros artículos de papel y cartón',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Papel',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'PAPNCP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo repetitivo en líneas de conversión de papel',
        descripcion: 'Producción de cuadernos, sobres, bolsas u otros artículos con movimientos repetitivos',
        riesgoPotencial: 'Lesiones musculoesqueléticas por repetición',
        efectosPosibles: 'Túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Rotación de tareas', 'Pausas activas', 'Herramientas ergonómicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Protección auditiva'],
    capacitacionesObligatorias: ['Ergonomía en líneas de producción', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1811',
    descripcionCIIU: 'Actividades de impresión',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Impresión',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'FIS-001', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'IMPR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Tintas y solventes de impresión',
        descripcion: 'Inhalación de vapores de solventes en tintas offset, serigrafía, flexografía y huecograbado',
        riesgoPotencial: 'Intoxicación crónica por solventes',
        efectosPosibles: 'Daño hepático, neurológico y renal por solventes',
        medidasControl: ['Extracción localizada en prensas', 'Mascarilla con filtro para vapores orgánicos', 'Preferir tintas UV o a base de agua', 'Monitoreo ambiental de solventes']
      },
      {
        codigo: 'IMPR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Ruido de maquinaria de impresión offset y rotativa',
        descripcion: 'Prensas offset y rotativas con niveles de ruido superiores a 85-95 dB(A)',
        riesgoPotencial: 'Hipoacusia laboral',
        efectosPosibles: 'Pérdida auditiva inducida por ruido',
        medidasControl: ['Protección auditiva obligatoria en prensa', 'Audiometría anual', 'Encapsulamiento de prensas', 'Rotación de personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Protección auditiva', 'Guantes de nitrilo', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de solventes en impresión', 'Conservación auditiva', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1812',
    descripcionCIIU: 'Actividades de servicios relacionados con la impresión',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Impresión',
    peligrosPrioritarios: ['QUI-001', 'FIS-005', 'BIO-MEC-001', 'FIS-002', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'PREIMPR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiación UV en planchas de impresión',
        descripcion: 'Exposición a radiación ultravioleta en procesos de insolación de planchas offset y estereotipia',
        riesgoPotencial: 'Daño ocular y cutáneo por UV',
        efectosPosibles: 'Fotoqueratitis, quemaduras UV en piel',
        medidasControl: ['Gafas con filtro UV', 'Protección de manos al limpiar planchas UV', 'Cubrimiento de zonas UV activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con protección UV', 'Guantes de nitrilo', 'Mascarilla para vapores de solventes de limpieza'],
    capacitacionesObligatorias: ['Protección contra radiaciones no ionizantes', 'Manejo de solventes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1820',
    descripcionCIIU: 'Producción de copias a partir de grabaciones originales',
    nivelRiesgo: 'I',
    sector: 'Manufactura - Impresión',
    peligrosPrioritarios: ['BIO-MEC-002', 'BIO-MEC-001', 'PSI-003', 'FIS-002', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'COPIA-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo repetitivo y sedente en producción de copias',
        descripcion: 'Operación de duplicadoras, empacadoras y líneas de reproducción en posición sedente',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Lumbalgia, síndrome del túnel carpiano',
        medidasControl: ['Silla ergonómica', 'Rotación de puestos', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Protección auditiva (si hay maquinaria ruidosa)'],
    capacitacionesObligatorias: ['Ergonomía en líneas de producción', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1910',
    descripcionCIIU: 'Fabricación de productos de hornos de coque',
    nivelRiesgo: 'V',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'FIS-004', 'SEG-006', 'SEG-003', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'COQUE-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Hidrocarburos aromáticos policíclicos (HAP) cancerígenos en coquización',
        descripcion: 'Exposición a benzo[a]pireno, antraceno y otros HAP en hornos de coque',
        riesgoPotencial: 'Cáncer de pulmón, vejiga y piel',
        efectosPosibles: 'Cáncer en múltiples órganos, enfermedades respiratorias crónicas',
        medidasControl: ['SCBA en zona de hornos', 'Monitoreo biológico de HAP (1-OH-pireno en orina)', 'Ropa de trabajo específica no reutilizable', 'Rotación de puestos para reducir dosis acumulada']
      },
      {
        codigo: 'COQUE-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor radiante extremo en zona de hornos',
        descripcion: 'Trabajo en hornos de coque con temperaturas de más de 1000°C con calor radiante intenso',
        riesgoPotencial: 'Estrés térmico grave',
        efectosPosibles: 'Golpe de calor, deshidratación severa, fallo renal agudo',
        medidasControl: ['Ropa aluminizada reflectante', 'Rotación estricta de exposición', 'WBGT monitoreo permanente', 'Hidratación obligatoria']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['SCBA', 'Ropa aluminizada', 'Botas de seguridad resistentes al calor', 'Guantes de horno resistentes a calor radiante'],
    capacitacionesObligatorias: ['Prevención de cáncer ocupacional por HAP', 'Manejo de estrés térmico extremo', 'Espacios confinados', 'Primeros auxilios - golpe de calor']
  },

  {
    codigoCIIU: '1921',
    descripcionCIIU: 'Fabricación de productos de la refinación del petróleo',
    nivelRiesgo: 'V',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'SEG-006', 'SEG-003', 'FIS-004', 'QUI-004'],
    peligrosEspecificos: [
      {
        codigo: 'REFIN-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio y explosión en refinería de petróleo',
        descripcion: 'Presencia permanente de hidrocarburos inflamables en toda la planta',
        riesgoPotencial: 'BLEVE, flash fire, explosión en nube de vapor',
        efectosPosibles: 'Muerte, quemaduras graves, explosión masiva',
        medidasControl: ['Sistema de detección de HC y H2S permanente', 'SCBA disponible en toda la planta', 'Equipos a prueba de explosión en zonas clasificadas', 'Permisos de trabajo en caliente rigurosos', 'Simulacros de emergencia']
      },
      {
        codigo: 'REFIN-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Benceno cancerígeno en refinería',
        descripcion: 'Exposición crónica a benceno (IARC grupo 1) en múltiples operaciones de refinería',
        riesgoPotencial: 'Leucemia y aplasia medular',
        efectosPosibles: 'Leucemia (especialmente LMA), aplasia de médula ósea',
        medidasControl: ['Monitoreo ambiental y biológico de benceno', 'SCBA en zonas de alta exposición', 'Rotación de personal', 'Límite de exposición <1 ppm (OSHA PEL)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['SCBA', 'Ropa ignífuga', 'Detector de gas personal (H2S y HC)', 'Casco', 'Botas antiestáticas'],
    capacitacionesObligatorias: ['H2S safety', 'Prevención de incendios en refinería', 'Espacios confinados', 'Benceno - vigilancia de leucemia', 'Primeros auxilios']
  },

  {
    codigoCIIU: '1922',
    descripcionCIIU: 'Actividad de mezcla de combustibles',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'SEG-006', 'FIS-004', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'MZCOMB-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio en operación de mezcla de combustibles',
        descripcion: 'Mezcla de naftas, bioetanol, MTBE y otros componentes de combustible con alta inflamabilidad',
        riesgoPotencial: 'Incendio y explosión',
        efectosPosibles: 'Quemaduras graves, explosión',
        medidasControl: ['Equipo antiexplosión', 'Control de estática (tierras físicas)', 'Detector de HC permanente', 'Permisos de trabajo rigurosos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-1521-1998', norma: 'Decreto 1521/1998', descripcion: 'Manejo de combustibles', obligatorio: true }
    ],
    eppRecomendado: ['Ropa ignífuga', 'Detector de gas HC personal', 'SCBA en área de mezcla', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Prevención de incendios con combustibles', 'Manejo de productos inflamables', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2012',
    descripcionCIIU: 'Fabricación de abonos y compuestos inorgánicos nitrogenados',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'SEG-006', 'SEG-003', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'ABON-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosividad del nitrato de amonio',
        descripcion: 'Almacenamiento y manejo de nitrato de amonio en fabricación de abonos nitrogenados',
        riesgoPotencial: 'Explosión catastrófica',
        efectosPosibles: 'Explosión masiva, muerte, destrucción de planta',
        medidasControl: ['Almacenamiento según normativa específica de nitrato', 'Separación de fuentes de calor e ignición', 'Formación específica para personal de almacén', 'Plan de emergencia APELL']
      },
      {
        codigo: 'ABON-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Amoníaco gaseoso en síntesis de fertilizantes nitrogenados',
        descripcion: 'Exposición a amoníaco anhydro en síntesis de urea y nitrato amónico',
        riesgoPotencial: 'Intoxicación aguda grave',
        efectosPosibles: 'Quemaduras de vías respiratorias, edema pulmonar, ceguera',
        medidasControl: ['Detectores de NH3 fijos y portátiles', 'SCBA disponible', 'Plan de emergencia por fuga', 'Inspección periódica de líneas y válvulas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Manejo de residuos peligrosos', obligatorio: true }
    ],
    eppRecomendado: ['SCBA', 'Ropa de protección química', 'Gafas herméticas', 'Guantes de nitrilo grueso', 'Botas de caucho'],
    capacitacionesObligatorias: ['Seguridad con nitrato de amonio', 'Manejo de NH3 (amoníaco)', 'Plan de emergencias APELL', 'Primeros auxilios - quemaduras químicas']
  },

  {
    codigoCIIU: '2013',
    descripcionCIIU: 'Fabricación de plásticos en formas primarias',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'FIS-004', 'FIS-001', 'SEG-006', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PLAST-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Monómeros y aditivos en fabricación de polímeros',
        descripcion: 'Exposición a monómeros de estireno, cloruro de vinilo, acrilonitrilo en polimerización',
        riesgoPotencial: 'Cáncer y daño neurológico por monómeros',
        efectosPosibles: 'Angiosarcoma hepático (CVM), cáncer de pulmón, daño neurológico',
        medidasControl: ['Monitoreo ambiental de monómeros', 'SCBA en zonas de alta exposición', 'Sustitución por polímeros más seguros', 'Monitoreo biológico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Gafas de seguridad', 'Ropa de trabajo resistente'],
    capacitacionesObligatorias: ['Vigilancia de cáncer ocupacional en plásticos', 'Manejo de monómeros peligrosos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2014',
    descripcionCIIU: 'Fabricación de caucho sintético en formas primarias',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'FIS-004', 'SEG-006', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'CAUC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Monómeros de butadieno y estireno en caucho sintético',
        descripcion: 'Exposición a 1,3-butadieno (IARC grupo 1) y estireno en polimerización de cauchos',
        riesgoPotencial: 'Cáncer hematológico',
        efectosPosibles: 'Leucemia y linfoma (butadieno), daño neurológico',
        medidasControl: ['Monitoreo ambiental de butadieno', 'SCBA en zonas de alta concentración', 'Monitoreo biológico de metabolitos', 'Hermeticidad de sistemas de polimerización']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'SCBA en área de polimerización'],
    capacitacionesObligatorias: ['Prevención de cáncer por butadieno', 'Manejo de monómeros peligrosos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2021',
    descripcionCIIU: 'Fabricación de plaguicidas y otros productos químicos de uso agropecuario',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'BIO-001', 'SEG-006', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'PLAG-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a ingredientes activos de plaguicidas en formulación',
        descripcion: 'Manejo de organofosforados, carbamatos, piretroides y herbicidas en planta de formulación',
        riesgoPotencial: 'Intoxicación aguda y crónica por plaguicidas',
        efectosPosibles: 'Síndrome colinérgico, daño neurológico, cáncer (algunos plaguicidas)',
        medidasControl: ['EPP específico por familia de plaguicida', 'Ducha y cambiada de ropa al salir', 'Monitoreo biológico de colinesterasa (OP y carbamatos)', 'Hermeticidad máxima en formulación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Traje Tyvek (desechable en formulación)', 'Guantes de nitrilo grueso', 'Mascarilla con filtro para pesticidas', 'Gafas herméticas', 'Botas de caucho'],
    capacitacionesObligatorias: ['Toxicología de plaguicidas', 'EPP específico por formulación', 'Monitoreo biológico', 'Primeros auxilios - intoxicación por plaguicidas']
  },

  {
    codigoCIIU: '2022',
    descripcionCIIU: 'Fabricación de pinturas, barnices y revestimientos similares, tintas de imprenta y masillas',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'SEG-006', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'PINT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Solventes orgánicos y monómeros en fabricación de pinturas',
        descripcion: 'Exposición a xileno, tolueno, metil etil cetona, naftas en mezcla y formulación de pinturas',
        riesgoPotencial: 'Intoxicación crónica y cáncer',
        efectosPosibles: 'Daño hepático, neurológico y renal, leucemia (benceno residual)',
        medidasControl: ['Extracción localizada en mezcladores', 'Mascarilla con filtro para vapores orgánicos', 'Monitoreo ambiental de solventes', 'Sustitución de solventes peligrosos por acuosos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Gafas de seguridad', 'Ropa de trabajo resistente a solventes'],
    capacitacionesObligatorias: ['Manejo seguro de solventes en pinturas', 'Vigilancia de cáncer por exposición a solventes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2023',
    descripcionCIIU: 'Fabricación de jabones y detergentes, preparados para limpiar y pulir',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-003', 'QUI-001', 'FIS-004', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'JABON-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Soda cáustica y ácidos en saponificación y formulación',
        descripcion: 'Manejo de hidróxido de sodio al 50% y ácidos sulfónico, acético en fabricación de jabones',
        riesgoPotencial: 'Quemaduras químicas graves',
        efectosPosibles: 'Quemaduras de piel y ojos, irritación severa de vías respiratorias',
        medidasControl: ['Careta facial en manejo de álcalis/ácidos concentrados', 'Guantes de PVC o nitrilo grueso', 'Ducha de emergencia y lavaojos en planta', 'Procedimiento de dilución segura (siempre añadir ácido al agua)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Careta facial', 'Guantes de PVC o nitrilo grueso', 'Botas de caucho', 'Delantal de PVC', 'Mascarilla para vapores'],
    capacitacionesObligatorias: ['Manejo seguro de ácidos y bases', 'Primeros auxilios - quemaduras químicas']
  },



  {
    codigoCIIU: '2720',
    descripcionCIIU: 'Fabricación de pilas, baterías y acumuladores eléctricos',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'SEG-004', 'QUI-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'BATER-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Plomo en fabricación de baterías de plomo-ácido',
        descripcion: 'Exposición a polvo y humos de plomo en fundición, rejillas y empastado de baterías',
        riesgoPotencial: 'Saturnismo (intoxicación crónica por plomo)',
        efectosPosibles: 'Daño neurológico, renal, hematológico; efecto en desarrollo fetal',
        medidasControl: ['Respirador P100 en todas las áreas de polvo de plomo', 'Higiene extrema (no comer/beber/fumar en planta)', 'Plombemia trimestral obligatoria', 'Duchas y cambio de ropa al salir']
      },
      {
        codigo: 'BATER-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Ácido sulfúrico en baterías de plomo',
        descripcion: 'Manejo de ácido sulfúrico concentrado en llenado y formación de baterías',
        riesgoPotencial: 'Quemaduras químicas graves',
        efectosPosibles: 'Quemaduras de piel y ojos, irritación respiratoria severa',
        medidasControl: ['Careta facial en llenado de ácido', 'Guantes de nitrilo grueso', 'Ducha de emergencia', 'Procedimientos de dilución seguros']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Careta facial', 'Guantes de nitrilo grueso', 'Delantal de PVC', 'Botas de caucho', 'Overol de trabajo (que no sale de la planta)'],
    capacitacionesObligatorias: ['Vigilancia plombemia', 'Manejo de ácido sulfúrico', 'Higiene industrial en plantas de plomo', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2731',
    descripcionCIIU: 'Fabricación de hilos y cables eléctricos y de fibra óptica',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['QUI-001', 'FIS-004', 'SEG-005', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'CABLE-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Vapores de PVC y aditivos en extrusión de aislamiento',
        descripcion: 'Inhalación de vapores de PVC, ftalatos y estabilizadores en extrusión de cables',
        riesgoPotencial: 'Irritación respiratoria e intoxicación crónica',
        efectosPosibles: 'Irritación de mucosas, daño hepático (organoestaño), efectos hormonales (ftalatos)',
        medidasControl: ['Extracción localizada en extrusoras', 'Mascarilla con filtro para vapores orgánicos', 'Monitoreo ambiental', 'Sustitución de ftalatos peligrosos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores', 'Protección auditiva', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Control de vapores en extrusión', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2732',
    descripcionCIIU: 'Fabricación de dispositivos de cableado',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['SEG-004', 'BIO-MEC-001', 'QUI-001', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'CABLY-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en ensamble y prueba de dispositivos',
        descripcion: 'Ensamble y pruebas de conectores, cajas de distribución y dispositivos eléctricos',
        riesgoPotencial: 'Contacto eléctrico',
        efectosPosibles: 'Quemaduras, electrocución',
        medidasControl: ['LOTO en pruebas de equipos energizados', 'Herramientas aisladas', 'Guantes dieléctricos', 'Procedimientos escritos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Herramientas aisladas', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Riesgo eléctrico y LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2740',
    descripcionCIIU: 'Fabricación de equipos eléctricos de iluminación',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'FIS-005', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'ILUM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Mercurio en fabricación de lámparas fluorescentes',
        descripcion: 'Exposición a mercurio elemental en fabricación de tubos fluorescentes y bombillas de vapor',
        riesgoPotencial: 'Intoxicación crónica por mercurio',
        efectosPosibles: 'Temblores, daño renal, erethismo (comportamiento)',
        medidasControl: ['Encapsulamiento del proceso de dosificación de mercurio', 'Monitoreo de mercurio en aire y biológico', 'Gestión de residuos de mercurio como peligrosos', 'Sustitución por LED (sin mercurio)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'LEY-1658-2013', norma: 'Ley 1658/2013', descripcion: 'Eliminación del mercurio', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores de mercurio', 'Guantes de nitrilo', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo seguro de mercurio', 'Gestión de residuos RAEE', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2750',
    descripcionCIIU: 'Fabricación de aparatos de uso doméstico',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['SEG-004', 'SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'ELDOMFAB-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico y mecánico en líneas de ensamble de electrodomésticos',
        descripcion: 'Ensamble de electrodomésticos con prensas, soldadoras, herramientas eléctricas y pruebas eléctricas',
        riesgoPotencial: 'Electrocución, prensamiento',
        efectosPosibles: 'Electrocución, amputaciones, quemaduras',
        medidasControl: ['LOTO en toda maquinaria', 'Guantes dieléctricos en pruebas', 'Guardas en prensas', 'Capacitación certificada por puesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Gafas de seguridad', 'Protección auditiva', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Riesgo eléctrico y LOTO', 'Seguridad en líneas de ensamble', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2790',
    descripcionCIIU: 'Fabricación de otros tipos de equipo eléctrico n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'ELECNCP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en fabricación y prueba de equipos eléctricos',
        descripcion: 'Ensamble, prueba y calibración de equipos eléctricos diversos',
        riesgoPotencial: 'Contacto eléctrico y arco eléctrico',
        efectosPosibles: 'Quemaduras, electrocución',
        medidasControl: ['LOTO', 'Guantes dieléctricos', 'Herramientas aisladas', 'Procedimientos de prueba seguros']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Gafas de seguridad', 'Protección auditiva'],
    capacitacionesObligatorias: ['Riesgo eléctrico', 'LOTO', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2421',
    descripcionCIIU: 'Fabricación de productos primarios de metales preciosos y metales no ferrosos',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metalurgia',
    peligrosPrioritarios: ['FIS-004', 'QUI-001', 'QUI-002', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'METPREC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de metales preciosos y no ferrosos en fundición',
        descripcion: 'Inhalación de humos de oro, plata, cobre, aluminio, plomo y zinc en fundición',
        riesgoPotencial: 'Intoxicación por metales pesados',
        efectosPosibles: 'Saturnismo (plomo), manganismo, fiebre del metal',
        medidasControl: ['Extracción localizada', 'Respirador P100', 'Monitoreo biológico específico por metal', 'Rotación de puestos en fundición']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Ropa resistente al calor', 'Guantes de horno', 'Gafas con filtro IR'],
    capacitacionesObligatorias: ['Toxicología de metales en fundición', 'Vigilancia biológica de metales', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2429',
    descripcionCIIU: 'Fabricación de otros productos primarios de metales no ferrosos n.c.p.',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metalurgia',
    peligrosPrioritarios: ['FIS-004', 'QUI-002', 'SEG-005', 'FIS-001', 'QUI-001'],
    peligrosEspecificos: [
      {
        codigo: 'METNFNCP-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor en fundición de metales no ferrosos',
        descripcion: 'Trabajo en hornos de fusión de aluminio, cobre, zinc u otros no ferrosos',
        riesgoPotencial: 'Estrés térmico y quemaduras',
        efectosPosibles: 'Golpe de calor, quemaduras por metal líquido',
        medidasControl: ['Ropa resistente al calor', 'Rotación de personal', 'Hidratación', 'Careta facial']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Ropa resistente al calor', 'Guantes de horno', 'Careta facial', 'Respirador P100'],
    capacitacionesObligatorias: ['Seguridad en fundición', 'Primeros auxilios - quemaduras']
  },

  {
    codigoCIIU: '2431',
    descripcionCIIU: 'Fundición de hierro y acero',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metalurgia',
    peligrosPrioritarios: ['FIS-004', 'QUI-002', 'QUI-001', 'SEG-005', 'FIS-001', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'FUND-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice y humos metálicos en fundición de hierro',
        descripcion: 'Polvo de arena de moldeo (sílice) y humos de hierro-manganeso en fundidoras',
        riesgoPotencial: 'Silicosis y manganismo',
        efectosPosibles: 'Silicosis, manganismo (síndrome parkinsoniano), siderosis',
        medidasControl: ['Extracción de polvo en área de moldeo', 'Respirador P100 en desmoldeo', 'Monitoreo de sílice y manganeso', 'Espirometría y neurológico anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Ropa resistente al calor', 'Careta de fundición', 'Guantes de horno', 'Protección auditiva'],
    capacitacionesObligatorias: ['Silicosis en fundiciones', 'Manganismo', 'Seguridad en fundición', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2512',
    descripcionCIIU: 'Fabricación de tanques, depósitos y recipientes de metal, excepto los utilizados para maquinaria y equipos',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['QUI-001', 'SEG-003', 'SEG-005', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'TANQ-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Espacios confinados en fabricación y reparación de tanques',
        descripcion: 'Trabajo de soldadura interior en tanques, silos y recipientes cerrados',
        riesgoPotencial: 'Asfixia y explosión en espacio confinado',
        efectosPosibles: 'Asfixia, intoxicación por humos, explosión por acumulación de gases',
        medidasControl: ['Permiso de trabajo en espacio confinado', 'Medición de atmósfera antes de entrar', 'Ventilación forzada permanente', 'Vigía externo', 'SCBA disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Trabajo en espacios confinados', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['SCBA', 'Detector de gases multi-gas', 'Careta de soldadura', 'Arnés de rescate', 'Mascarilla P100'],
    capacitacionesObligatorias: ['Espacios confinados', 'Seguridad en soldadura', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2591',
    descripcionCIIU: 'Forja, prensado, estampado y laminado de metal; pulvimetalurgia',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['SEG-005', 'FIS-001', 'FIS-004', 'FIS-003', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'FORJA-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Prensas y martinetes de forja',
        descripcion: 'Operación de prensas excéntricas y martinetes de forja con alta energía de impacto',
        riesgoPotencial: 'Amputaciones y aplastamiento',
        efectosPosibles: 'Amputaciones de manos y dedos',
        medidasControl: ['Doble mando en prensas de forja', 'Cortinas fotoeléctricas', 'LOTO para ajuste', 'Distancia de seguridad']
      },
      {
        codigo: 'FORJA-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Vibraciones de cuerpo entero en operación de martinetes',
        descripcion: 'Exposición a vibraciones de baja frecuencia de martinetes y prensas de forja',
        riesgoPotencial: 'Enfermedad de columna por vibraciones',
        efectosPosibles: 'Lumbalgia crónica, hernias discales aceleradas',
        medidasControl: ['Plataformas antivibratorias', 'Rotación de operadores', 'Sillas antivibratorias', 'Vigilancia médica de columna']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva de copa', 'Gafas de seguridad', 'Guantes de cuero', 'Botas de acero refractario', 'Ropa resistente al calor'],
    capacitacionesObligatorias: ['Seguridad en prensas y forja', 'Vibraciones de cuerpo entero', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2592',
    descripcionCIIU: 'Tratamiento y revestimiento de metales; mecanizado',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'FIS-005', 'SEG-004', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'GALV-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Cromo hexavalente y ácidos en galvanoplastia y cromado',
        descripcion: 'Exposición a ácido crómico (Cr VI), ácido sulfúrico, niebla ácida en baños de electrodeposición',
        riesgoPotencial: 'Cáncer de nariz y pulmón (Cr VI), ulceraciones nasales',
        efectosPosibles: 'Ulceración del tabique nasal, cáncer nasofaríngeo y pulmonar, dermatitis',
        medidasControl: ['Extracción por aspiración en bordes del baño', 'Agentes humectantes para suprimir niebla', 'Respirador P100 en galvanoplastia', 'Monitoreo de Cr VI en orina y aire', 'Guantes y delantal de PVC']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos peligrosos de galvanoplastia', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Guantes de PVC', 'Careta facial', 'Delantal de PVC', 'Botas de caucho'],
    capacitacionesObligatorias: ['Carcinogenicidad del Cr VI', 'Manejo de ácidos en galvanoplastia', 'Gestión de residuos peligrosos', 'Primeros auxilios - quemaduras químicas']
  },

  {
    codigoCIIU: '2593',
    descripcionCIIU: 'Fabricación de artículos de cuchillería, herramientas de mano y artículos de ferretería',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['SEG-005', 'FIS-001', 'QUI-001', 'BIO-MEC-001', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'HERR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Maquinaria de estampado y corte en herramientas',
        descripcion: 'Operación de prensas, cizallas y rectificadoras en fabricación de herramientas',
        riesgoPotencial: 'Cortes y amputaciones',
        efectosPosibles: 'Amputaciones, cortes graves',
        medidasControl: ['Guardas en toda la maquinaria', 'Doble mando en prensas', 'LOTO para ajustes', 'Capacitación por máquina']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Protección auditiva', 'Guantes anticorte', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en maquinaria metalmecánica', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2599',
    descripcionCIIU: 'Fabricación de otros productos elaborados de metal n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'METNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura y pintura en metalmecánica',
        descripcion: 'Soldadura, pintura y acabados metálicos con exposición a humos y vapores',
        riesgoPotencial: 'Afecciones respiratorias y cáncer',
        efectosPosibles: 'Siderosis, manganismo, intoxicación por solventes',
        medidasControl: ['Extracción localizada', 'Mascarilla apropiada por proceso', 'Monitoreo ambiental', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Gafas de seguridad', 'Protección auditiva', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Seguridad en soldadura y pintura', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2610',
    descripcionCIIU: 'Fabricación de componentes y tableros electrónicos',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['QUI-001', 'FIS-005', 'SEG-004', 'BIO-MEC-002', 'QUI-002'],
    peligrosEspecificos: [
      {
        codigo: 'ELECTR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Flux de soldadura y solventes en ensamble electrónico',
        descripcion: 'Inhalación de humos de resina de flux en soldadura de componentes SMD y through-hole',
        riesgoPotencial: 'Asma ocupacional y afecciones respiratorias',
        efectosPosibles: 'Asma por colofonia, dermatitis de contacto',
        medidasControl: ['Extractor de humos en cada puesto de soldadura', 'Mascarilla para humos de soldadura', 'Preferir flux libre de colofonia', 'Espirometría anual']
      },
      {
        codigo: 'ELECTR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones UV en lámparas de curado UV',
        descripcion: 'Uso de lámparas UV para curado de barnices y adhesivos en placas electrónicas',
        riesgoPotencial: 'Daño ocular y cutáneo por UV',
        efectosPosibles: 'Fotoqueratitis, quemaduras UV en piel',
        medidasControl: ['Gafas con filtro UV', 'Cubierta de zona UV activa', 'No exposición directa de piel']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Extractor de humos personalizado', 'Gafas con protección UV', 'Guantes ESD', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Asma por colofonia', 'Seguridad en soldadura electrónica', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2620',
    descripcionCIIU: 'Fabricación de computadores y de equipo periférico',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['QUI-001', 'SEG-004', 'BIO-MEC-002', 'FIS-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'COMPU-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en línea de ensamble de computadores con movimientos repetitivos',
        descripcion: 'Ensamble de componentes, atornillado y verificación con movimientos repetitivos de manos',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Rotación de puestos cada 2 horas', 'Herramientas ergonómicas', 'Pausas activas', 'Evaluación ergonómica de línea']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes ESD', 'Calzado antiestático', 'Silla ergonómica en puestos de ensamble'],
    capacitacionesObligatorias: ['Ergonomía en líneas de ensamble', 'Riesgo eléctrico básico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2630',
    descripcionCIIU: 'Fabricación de equipos de comunicación',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['QUI-001', 'FIS-005', 'SEG-004', 'BIO-MEC-002', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'TELCOM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Flux y solventes en ensamble de equipos de comunicación',
        descripcion: 'Soldadura de componentes y limpieza con isopropanol en líneas de fabricación',
        riesgoPotencial: 'Irritación respiratoria',
        efectosPosibles: 'Cefalea, irritación de mucosas, dermatitis',
        medidasControl: ['Extractor de humos en soldadura', 'Guantes de nitrilo', 'Ventilación general de planta']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes antiestáticos', 'Mascarilla para humos', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Seguridad en ensamble electrónico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2640',
    descripcionCIIU: 'Fabricación de aparatos electrónicos de consumo y de sus partes y piezas',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['QUI-001', 'SEG-004', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'ELECTRCON-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo repetitivo en ensamble de electrónica de consumo',
        descripcion: 'Líneas de ensamble de televisores, equipos de audio con ciclos cortos repetitivos',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Rotación de puestos', 'Pausas activas', 'Herramientas ergonómicas', 'Evaluación ergonómica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes ESD', 'Calzado antiestático', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en líneas de ensamble electrónico', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2651',
    descripcionCIIU: 'Fabricación de equipo de medición, prueba, navegación y control',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['QUI-001', 'FIS-005', 'BIO-MEC-002', 'SEG-004', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'MEDIC-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo de precisión en ensamble de instrumentación',
        descripcion: 'Ensamble de instrumentos de medición con alta demanda visual y movimientos finos repetitivos',
        riesgoPotencial: 'Fatiga visual y lesiones musculoesqueléticas',
        efectosPosibles: 'Fatiga visual, túnel carpiano, cervicalgia',
        medidasControl: ['Lupas o microscopios de calidad', 'Iluminación adecuada en puesto', 'Pausas visuales frecuentes', 'Silla ergonómica regulable']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de protección UV en curado', 'Calzado antiestático', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de precisión', 'Higiene visual', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2652',
    descripcionCIIU: 'Fabricación de relojes',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['BIO-MEC-002', 'FIS-002', 'QUI-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'RELOJ-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Alta demanda de precisión visual y manual',
        descripcion: 'Ensamble de componentes de reloj con herramientas de micromecánica bajo microscopio o lupa',
        riesgoPotencial: 'Fatiga visual severa y lesiones de mano',
        efectosPosibles: 'Fatiga ocular, síndrome del túnel carpiano',
        medidasControl: ['Microscopios de calidad con soporte', 'Iluminación óptima', 'Pausas obligatorias', 'Evaluación oftalmológica en ingreso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de protección en trabajo con lupa/microscopio'],
    capacitacionesObligatorias: ['Ergonomía en micromecánica', 'Higiene visual', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2660',
    descripcionCIIU: 'Fabricación de equipo de irradiación y equipo electrónico de uso médico y terapéutico',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['FIS-005', 'SEG-004', 'QUI-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'MEDEQUIP-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes y no ionizantes en prueba de equipos médicos',
        descripcion: 'Pruebas de calibración de equipos de rayos X, láser y ultrasónico médico',
        riesgoPotencial: 'Exposición a radiaciones diversas',
        efectosPosibles: 'Daño ocular por láser, daño por radiación ionizante',
        medidasControl: ['Dosímetro en trabajo con fuentes de radiación ionizante', 'Gafas anti-láser certificadas', 'Zona de exclusión en pruebas', 'Señalización de peligro de radiación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-2272-2010', norma: 'Decreto 2272/2010', descripcion: 'Protección radiológica', obligatorio: true }
    ],
    eppRecomendado: ['Dosímetro personal', 'Gafas anti-láser', 'Delantal plomado en pruebas de RX'],
    capacitacionesObligatorias: ['Protección radiológica', 'Seguridad con láseres', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2670',
    descripcionCIIU: 'Fabricación de instrumentos ópticos y equipo fotográfico',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['FIS-005', 'QUI-001', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'OPTIC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Solventes y pulimentos en fabricación óptica',
        descripcion: 'Uso de alcohol isopropílico, acetona y pulimentos abrasivos en manufactura de lentes',
        riesgoPotencial: 'Irritación de mucosas y dermatitis',
        efectosPosibles: 'Dermatitis de contacto, irritación respiratoria',
        medidasControl: ['Ventilación del área de pulimento', 'Guantes de nitrilo', 'Mascarilla para vapores orgánicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Gafas de seguridad', 'Mascarilla para vapores'],
    capacitacionesObligatorias: ['Manejo de solventes', 'Higiene visual en óptica', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2811',
    descripcionCIIU: 'Fabricación de motores, turbinas, y partes para motores de combustión interna',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['QUI-001', 'FIS-001', 'SEG-005', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'MOTOR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Aceites, combustibles y solventes en fabricación de motores',
        descripcion: 'Contacto con aceites de corte, combustibles y solventes de limpieza en mecanizado y pruebas',
        riesgoPotencial: 'Dermatitis y afecciones respiratorias',
        efectosPosibles: 'Dermatitis por aceites de corte, irritación respiratoria',
        medidasControl: ['Guantes de nitrilo', 'Ventilación en área de pruebas de motor', 'Protección auditiva en pruebas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Seguridad en mecanizado', 'Manejo de aceites industriales', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2812',
    descripcionCIIU: 'Fabricación de equipos de potencia hidráulica y neumática',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'BIO-MEC-001', 'FIS-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'HIDRA-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Pruebas hidráulicas a alta presión',
        descripcion: 'Pruebas de cilindros, bombas y válvulas hidráulicas a presiones de hasta 700 bar',
        riesgoPotencial: 'Inyección hidráulica (lesión gravísima)',
        efectosPosibles: 'Inyección de fluido hidráulico en tejidos (amputación potencial), fracturas por presión',
        medidasControl: ['Nunca colocar mano en el chorro de líquido', 'Revisión de mangueras antes de prueba', 'Pantalla de protección en zona de prueba', 'Procedimiento escrito de prueba hidráulica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Guantes resistentes al aceite', 'Careta facial en pruebas'],
    capacitacionesObligatorias: ['Seguridad en sistemas hidráulicos de alta presión', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2813',
    descripcionCIIU: 'Fabricación de otras bombas, compresores, grifos y válvulas',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'BOMB-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en mecanizado de piezas de bombas y compresores',
        descripcion: 'Torneado, fresado y rectificado de piezas de alta precisión',
        riesgoPotencial: 'Atrapamiento y cortes en centros de mecanizado',
        efectosPosibles: 'Amputaciones, laceraciones',
        medidasControl: ['Puertas de seguridad en centros CNC', 'Guardas en tornos y fresas', 'LOTO', 'Nunca abrir durante el mecanizado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Protección auditiva', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en mecanizado CNC', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2814',
    descripcionCIIU: 'Fabricación de cojinetes, engranajes, trenes de engranajes y piezas de transmisión',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['QUI-001', 'FIS-001', 'SEG-005', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'ENGR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Aceites de corte y refrigerantes en mecanizado de engranajes',
        descripcion: 'Exposición a niebla de aceite de corte en tallado de engranajes y fabricación de rodamientos',
        riesgoPotencial: 'Dermatitis y afecciones respiratorias',
        efectosPosibles: 'Dermatitis por aceites de corte, bronquitis',
        medidasControl: ['Extracción en máquinas de corte', 'Guantes de nitrilo', 'Mascarilla para niebla de aceite', 'Cambio frecuente de aceites de corte']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Gafas de seguridad', 'Mascarilla para niebla de aceite', 'Protección auditiva'],
    capacitacionesObligatorias: ['Control de aceites de corte', 'Seguridad en mecanizado', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2815',
    descripcionCIIU: 'Fabricación de hornos, hogares y quemadores industriales',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['FIS-004', 'SEG-004', 'SEG-006', 'QUI-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'HORN-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor en pruebas de hornos industriales fabricados',
        descripcion: 'Pruebas de funcionamiento de hornos industriales con temperaturas de operación',
        riesgoPotencial: 'Estrés térmico y quemaduras',
        efectosPosibles: 'Quemaduras, golpe de calor',
        medidasControl: ['Ropa resistente al calor', 'Guantes térmicos', 'Tiempo limitado de exposición en pruebas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Ropa resistente al calor', 'Guantes térmicos', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Prevención de quemaduras industriales', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2816',
    descripcionCIIU: 'Fabricación de equipo de elevación y manipulación',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'BIO-MEC-003', 'SEG-001', 'FIS-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'ELEV-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Pruebas de carga en grúas y montacargas fabricados',
        descripcion: 'Pruebas de capacidad de carga de grúas, polipastos y montacargas con cargas máximas',
        riesgoPotencial: 'Caída de carga, fallo estructural',
        efectosPosibles: 'Aplastamiento, traumatismos graves, muerte',
        medidasControl: ['Zona de exclusión de 150% radio de acción durante prueba', 'Procedimiento de prueba documentado', 'Personal competente en pruebas de carga']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Chaleco reflectivo', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en pruebas de equipos de elevación', 'Operación de maquinaria pesada', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2817',
    descripcionCIIU: 'Fabricación de maquinaria y equipo de oficina (excepto computadoras y equipos periféricos)',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['BIO-MEC-001', 'SEG-005', 'QUI-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'OFICMAQ-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Trabajo en líneas de ensamble de equipo de oficina',
        descripcion: 'Ensamble de fotocopiadoras, impresoras y equipos de oficina con ciclos repetitivos',
        riesgoPotencial: 'Lesiones musculoesqueléticas',
        efectosPosibles: 'Tendinitis, síndrome del túnel carpiano',
        medidasControl: ['Rotación de puestos', 'Pausas activas', 'Herramientas ergonómicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Gafas de seguridad', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Ergonomía en ensamble', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2818',
    descripcionCIIU: 'Fabricación de herramientas manuales con motor',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['FIS-001', 'FIS-003', 'SEG-005', 'QUI-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'HERRMOT-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Vibraciones mano-brazo en pruebas de herramientas',
        descripcion: 'Pruebas de taladros, amoladoras y sierras de mano con transmisión de vibraciones',
        riesgoPotencial: 'Síndrome de vibración mano-brazo',
        efectosPosibles: 'Vibración mano-brazo, síndrome del dedo blanco (Raynaud), neuropatía',
        medidasControl: ['Límite de tiempo de exposición a vibraciones', 'Guantes antivibratorios certificados', 'Rotación de personal en pruebas', 'Vigilancia médica de mano-brazo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes antivibratorios', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Vibraciones mano-brazo', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2819',
    descripcionCIIU: 'Fabricación de otros tipos de maquinaria y equipo de uso general n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'MAQGEN-NCP-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en fabricación de maquinaria diversa',
        descripcion: 'Mecanizado, soldadura y ensamble de maquinaria industrial de tipo general',
        riesgoPotencial: 'Cortes y aplastamientos',
        efectosPosibles: 'Amputaciones, laceraciones, contusiones',
        medidasControl: ['EPP completo por tarea', 'Guardas en maquinaria de fabricación', 'ART para tareas críticas', 'LOTO']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Gafas de seguridad', 'Protección auditiva', 'Guantes de cuero', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en metalmecánica', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2821',
    descripcionCIIU: 'Fabricación de maquinaria agropecuaria y forestal',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'MAQAGRO2-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Fabricación de piezas de alta resistencia para maquinaria agrícola',
        descripcion: 'Soldadura, conformado y montaje de componentes de tractores, cosechadoras y maquinaria forestal',
        riesgoPotencial: 'Lesiones por maquinaria y soldadura',
        efectosPosibles: 'Quemaduras, atrapamientos, contusiones',
        medidasControl: ['EPP completo en fabricación', 'Guardas en equipos de producción', 'Careta de soldadura', 'LOTO']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'Guantes de cuero', 'Calzado con puntera', 'Casco', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad en fabricación de maquinaria agrícola', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2822',
    descripcionCIIU: 'Fabricación de máquinas formadoras de metal y de máquinas herramienta',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'FIS-001', 'QUI-001', 'BIO-MEC-001', 'FIS-003'],
    peligrosEspecificos: [
      {
        codigo: 'FORMMET-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Alta precisión y riesgo mecánico en fabricación de máquinas herramienta',
        descripcion: 'Mecanizado de alta precisión, montaje de guías, husillo y motores en centros de mecanizado',
        riesgoPotencial: 'Atrapamiento y cortes en ensamble',
        efectosPosibles: 'Aplastamiento de manos, laceraciones',
        medidasControl: ['Procedimientos de montaje con bloqueo mecánico', 'Trabajo en equipo para componentes pesados', 'Herramientas adecuadas para cada operación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Guantes anticorte', 'Calzado con puntera', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad en fabricación de máquinas herramienta', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2823',
    descripcionCIIU: 'Fabricación de maquinaria para la metalurgia',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['FIS-004', 'SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'MAQMET-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor en pruebas de maquinaria metalúrgica',
        descripcion: 'Pruebas de hornos de tratamiento térmico, laminadores y equipos metalúrgicos fabricados',
        riesgoPotencial: 'Estrés térmico y quemaduras',
        efectosPosibles: 'Golpe de calor, quemaduras por contacto',
        medidasControl: ['Ropa resistente al calor en pruebas', 'Tiempo limitado de exposición', 'Hidratación programada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Ropa de algodón manga larga', 'Guantes de horno', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Estrés térmico', 'Seguridad en maquinaria metalúrgica', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2824',
    descripcionCIIU: 'Fabricación de maquinaria para explotación de minas y canteras y para obras de construcción',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'BIO-MEC-003', 'FIS-001', 'QUI-001', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'MAQMIN-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Manejo y pruebas de maquinaria pesada de minería',
        descripcion: 'Ensamble y pruebas de retroexcavadoras, cargadores, perforadoras y volquetas de gran tonelaje',
        riesgoPotencial: 'Aplastamiento y atrapamiento',
        efectosPosibles: 'Aplastamiento, traumatismos graves, muerte',
        medidasControl: ['Zona de exclusión durante pruebas de maquinaria pesada', 'Señalización visible', 'Solo operadores certificados en pruebas', 'Bloqueadores mecánicos en posición de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Chaleco reflectivo de alta visibilidad', 'Calzado con puntera', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad con maquinaria pesada', 'Operación de equipos de gran tonelaje', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2825',
    descripcionCIIU: 'Fabricación de maquinaria para la elaboración de alimentos, bebidas y tabaco',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'MAQALIM-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en fabricación de equipos de procesamiento de alimentos',
        descripcion: 'Ensamble y pruebas de mezcladoras, picadoras, pasteurizadoras y llenadoras',
        riesgoPotencial: 'Atrapamiento y cortes',
        efectosPosibles: 'Amputaciones, laceraciones',
        medidasControl: ['Guardas en todas las partes móviles durante pruebas', 'Dispositivos de emergencia (seta de paro)', 'LOTO para ajustes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas de seguridad', 'Guantes anticorte', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en fabricación de maquinaria de alimentos', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2826',
    descripcionCIIU: 'Fabricación de maquinaria para la elaboración de productos textiles, prendas de vestir y cueros',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'FIS-001', 'QUI-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'MAQTEX-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Pruebas de telares, tejedoras y máquinas de confección',
        descripcion: 'Operación de prueba de telares, máquinas de coser industriales y acabadoras textiles',
        riesgoPotencial: 'Atrapamiento en partes móviles',
        efectosPosibles: 'Lesiones de mano, amputaciones',
        medidasControl: ['Guardas activas durante prueba', 'Paro de emergencia accesible', 'Procedimientos de prueba escritos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva', 'Gafas de seguridad', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Seguridad en maquinaria textil', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2829',
    descripcionCIIU: 'Fabricación de otros tipos de maquinaria y equipo de uso especial n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Maquinaria',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'FIS-001', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'MAQESP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en fabricación de maquinaria especializada',
        descripcion: 'Fabricación de maquinaria de uso especial con operaciones de mecanizado, soldadura y ensamble',
        riesgoPotencial: 'Atrapamiento y cortes',
        efectosPosibles: 'Amputaciones, lesiones graves',
        medidasControl: ['Análisis de riesgo por tarea (ART)', 'EPP completo por operación', 'LOTO', 'Guardas en maquinaria']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'Guantes de cuero', 'Calzado con puntera', 'Casco'],
    capacitacionesObligatorias: ['Seguridad en fabricación de maquinaria especial', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2910',
    descripcionCIIU: 'Fabricación de vehículos automotores y sus motores',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Automotriz',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'SEG-005', 'FIS-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'AUTO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Isocianatos en pintura en cabina automotriz',
        descripcion: 'Exposición a isocianatos (MDI, TDI) en pintura de carrocerías con pintura bicomponente',
        riesgoPotencial: 'Asma ocupacional grave',
        efectosPosibles: 'Asma por isocianatos (incapacitante y crónico), hipersensibilidad',
        medidasControl: ['SCBA en cabina de pintura con isocianatos', 'Ropa de protección completa (desechable)', 'Monitoreo de isocianatos en aire', 'Espirometría y evaluación de hipersensibilidad previa']
      },
      {
        codigo: 'AUTO-QUI-002',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura en ensamble de carrocería',
        descripcion: 'Soldadura MIG/MAG masiva en líneas de ensamble de carrocería',
        riesgoPotencial: 'Afecciones respiratorias por humos metálicos',
        efectosPosibles: 'Siderosis, fiebre del metal, irritación pulmonar crónica',
        medidasControl: ['Extracción por captor en cada punto de soldadura', 'Mascarilla P100 en soldadura', 'Espirometría semestral']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['SCBA en cabina de pintura', 'Mascarilla P100 en soldadura', 'Careta de soldadura', 'Guantes de cuero', 'Calzado con puntera', 'Ropa ignífuga'],
    capacitacionesObligatorias: ['Asma por isocianatos', 'Seguridad en soldadura automotriz', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2920',
    descripcionCIIU: 'Fabricación de carrocerías para vehículos automotores; fabricación de remolques y semirremolques',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Automotriz',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'CARRO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura y pinturas en carrocerías',
        descripcion: 'Soldadura estructural y pintura de carrocerías con isocianatos, epóxicos y poliuretano',
        riesgoPotencial: 'Afecciones respiratorias',
        efectosPosibles: 'Asma por isocianatos, siderosis, daño hepático',
        medidasControl: ['Extracción localizada en soldadura', 'SCBA en aplicación de pinturas', 'Mascarilla P100 en lijado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'SCBA en pintura', 'Mascarilla P100', 'Guantes de cuero', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en carrocería', 'Isocianatos', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3011',
    descripcionCIIU: 'Construcción de barcos y de estructuras flotantes',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Material de transporte',
    peligrosPrioritarios: ['SEG-001', 'QUI-001', 'SEG-003', 'SEG-005', 'FIS-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'ASTILL-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en alturas en construcción naval',
        descripcion: 'Trabajo en andamios sobre plataformas, cubiertas y mástiles de embarcaciones en construcción',
        riesgoPotencial: 'Caída en trabajo en alturas',
        efectosPosibles: 'Traumatismos graves, muerte',
        medidasControl: ['Certificación en trabajo en alturas (Res. 4272/2021)', 'Arnés y línea de vida certificados', 'Redes de seguridad bajo andamios', 'Plataformas certificadas']
      },
      {
        codigo: 'ASTILL-SEG-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en espacios confinados de doble casco y tanques',
        descripcion: 'Soldadura y limpieza en tanques de combustible, dobles fondos y espacios angostos de barcos',
        riesgoPotencial: 'Asfixia y explosión en espacio confinado',
        efectosPosibles: 'Muerte por asfixia o explosión',
        medidasControl: ['Permiso de trabajo en espacio confinado', 'Monitoreo de atmósfera cada 30 min', 'Ventilación forzada', 'Vigía externo certificado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo entero', 'Casco con barbuquejo', 'Careta de soldadura', 'Mascarilla P100', 'Detector de gas multi-gas', 'SCBA'],
    capacitacionesObligatorias: ['Trabajo en alturas en astillero', 'Espacios confinados navales', 'Soldadura subacuática (si aplica)', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3012',
    descripcionCIIU: 'Construcción de embarcaciones de recreo y deporte',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Material de transporte',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'SEG-005', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'EMBREC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Resinas de poliéster y gelcoat en fabricación de fibra de vidrio',
        descripcion: 'Exposición a estireno, peróxido de metil etil cetona y fibras de vidrio en fabricación de embarcaciones de fibra',
        riesgoPotencial: 'Irritación respiratoria y daño neurológico por estireno',
        efectosPosibles: 'Irritación nasal y ocular, daño del SNC (estireno), irritación cutánea por fibra de vidrio',
        medidasControl: ['Extracción en laminado', 'Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Ropa de manga larga para fibra de vidrio', 'Monitoreo de estireno en aire']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Ropa de protección manga larga', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de estireno y resinas', 'Fibra de vidrio - riesgo dermatológico y respiratorio', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3020',
    descripcionCIIU: 'Fabricación de locomotoras y de material rodante para ferrocarriles',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Material de transporte',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-003', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'FERRO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura y pinturas en fabricación de material rodante',
        descripcion: 'Soldadura masiva de estructuras ferroviarias y pintura con poliuretano e isocianatos',
        riesgoPotencial: 'Afecciones respiratorias graves',
        efectosPosibles: 'Asma por isocianatos, siderosis, manganismo',
        medidasControl: ['Extracción en todos los puestos de soldadura', 'SCBA en pintura con isocianatos', 'Espirometría semestral en soldadores']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'SCBA en pintura', 'Mascarilla P100', 'Casco', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en soldadura ferroviaria', 'Isocianatos', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3030',
    descripcionCIIU: 'Fabricación de aeronaves, naves espaciales y de maquinaria conexa',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Material de transporte',
    peligrosPrioritarios: ['QUI-001', 'SEG-001', 'SEG-005', 'FIS-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'AERO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Materiales compuestos y adhesivos aeroespaciales',
        descripcion: 'Manejo de fibra de carbono, kevlar, resinas epóxicas y adhesivos estructurales en fabricación aeronáutica',
        riesgoPotencial: 'Sensibilización, irritación respiratoria y cutánea',
        efectosPosibles: 'Asma por epóxicos, dermatitis alérgica, irritación por fibra de carbono',
        medidasControl: ['Sala limpia con ventilación controlada', 'EPP completo para composites', 'Mascarilla P100 en corte de fibra', 'Monitoreo de aminas en epóxicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Guantes de nitrilo', 'Ropa de protección especial', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de materiales compuestos aeronáuticos', 'Salud ocupacional en aviación', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3040',
    descripcionCIIU: 'Fabricación de vehículos militares de combate',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Material de transporte',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'MILITA-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico en fabricación de vehículos blindados',
        descripcion: 'Corte, soldadura y ensamble de acero de alta resistencia para blindaje',
        riesgoPotencial: 'Atrapamiento y lesiones por soldadura',
        efectosPosibles: 'Amputaciones, quemaduras graves',
        medidasControl: ['EPP completo en cada operación', 'Guardas en maquinaria de corte', 'Careta de soldadura', 'LOTO']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'Guantes de cuero', 'Casco', 'Calzado con puntera', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad en industria de defensa', 'Soldadura de aceros especiales', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3091',
    descripcionCIIU: 'Fabricación de motocicletas',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Automotriz',
    peligrosPrioritarios: ['QUI-001', 'FIS-001', 'SEG-005', 'BIO-MEC-001', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'MOTO-FAB-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura y pintura en fabricación de motocicletas',
        descripcion: 'Soldadura de chasis, pintura en polvo y líquida, y ensamble de motores',
        riesgoPotencial: 'Afecciones respiratorias',
        efectosPosibles: 'Siderosis, asma, irritación respiratoria',
        medidasControl: ['Extracción en soldadura', 'Cabina de pintura con ventilación', 'Mascarilla P100']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Careta de soldadura', 'Calzado con puntera', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad en fabricación de motos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3092',
    descripcionCIIU: 'Fabricación de bicicletas y de sillas de ruedas para personas con discapacidad',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Automotriz',
    peligrosPrioritarios: ['BIO-MEC-001', 'QUI-001', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'BICI-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Pintura y soldadura en fabricación de bicicletas',
        descripcion: 'Soldadura de marco y pintura de componentes de bicicleta',
        riesgoPotencial: 'Afecciones respiratorias por humos',
        efectosPosibles: 'Irritación respiratoria, siderosis',
        medidasControl: ['Extracción en soldadura', 'Cabina de pintura', 'Mascarilla apropiada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'Mascarilla para pintura', 'Gafas de seguridad', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Seguridad en soldadura', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3099',
    descripcionCIIU: 'Fabricación de otros tipos de equipo de transporte n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Material de transporte',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'TRANSNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura y solventes en fabricación de equipo de transporte diverso',
        descripcion: 'Soldadura y pintura de equipos de transporte como carretas, camillas, etc.',
        riesgoPotencial: 'Afecciones respiratorias',
        efectosPosibles: 'Siderosis, irritación respiratoria',
        medidasControl: ['Extracción en soldadura', 'Mascarilla P100', 'Cabina de pintura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura', 'Mascarilla P100', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en fabricación', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3110',
    descripcionCIIU: 'Fabricación de muebles',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Muebles',
    peligrosPrioritarios: ['QUI-002', 'QUI-001', 'SEG-005', 'FIS-001', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'MUEB-FAB-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de madera y formaldehído en fabricación de muebles',
        descripcion: 'Corte y lijado con polvo de madera (potencialmente cancerígeno) y barnizado con lacas que emiten formaldehído',
        riesgoPotencial: 'Adenocarcinoma nasosinusal y asma',
        efectosPosibles: 'Cáncer nasosinusal, asma, irritación mucosas',
        medidasControl: ['Extracción en todos los puntos de generación', 'Mascarilla P100 en lijado y corte', 'Mascarilla para vapores en barnizado', 'Espirometría y ORL anuales']
      },
      {
        codigo: 'MUEB-FAB-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Maquinaria de carpintería en fabricación de muebles',
        descripcion: 'Sierras, fresadoras, canteadoras y trompos en producción de muebles',
        riesgoPotencial: 'Amputaciones y cortes',
        efectosPosibles: 'Amputación de dedos, manos',
        medidasControl: ['Guardas ajustables en toda la maquinaria', 'Pusher obligatorio', 'LOTO', 'Capacitación certificada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Protección auditiva', 'Gafas de seguridad', 'Calzado con puntera', 'Guantes anticorte (no sueltos)'],
    capacitacionesObligatorias: ['Seguridad en maquinaria de carpintería', 'Polvo de madera dura y cáncer', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3120',
    descripcionCIIU: 'Fabricación de colchones y somieres',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Muebles',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'BIO-MEC-001', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'COLCH-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Espumas de poliuretano y adhesivos en colchones',
        descripcion: 'Corte y fabricación de espumas de poliuretano con exposición a TDI residual y adhesivos',
        riesgoPotencial: 'Asma por isocianatos y sensibilización',
        efectosPosibles: 'Asma ocupacional, rinitis, dermatitis',
        medidasControl: ['Ventilación en área de espumas y pegado', 'Mascarilla con filtro', 'Monitoreo de isocianatos en producción de espuma', 'Guantes de nitrilo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores', 'Guantes de nitrilo', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Manejo de espumas de poliuretano', 'Isocianatos y asma', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3210',
    descripcionCIIU: 'Fabricación de joyas, bisutería y artículos conexos',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Otras',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'FIS-004', 'BIO-MEC-002', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'JOYER-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Metales preciosos y fundentes en joyería',
        descripcion: 'Fundición de oro, plata, platino y soldadura con aleaciones en fabricación de joyas',
        riesgoPotencial: 'Inhalación de humos metálicos y fundentes',
        efectosPosibles: 'Irritación respiratoria, posible intoxicación por fundentes (borax, ácidos)',
        medidasControl: ['Extracción en zona de fundición', 'Mascarilla FFP2', 'Guantes térmicos en fusión', 'Ventilación general del taller']
      },
      {
        codigo: 'JOYER-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiación UV en soldadura láser de joyería',
        descripcion: 'Uso de soldadores láser de alta precisión en joyería con emisión de UV e IR',
        riesgoPotencial: 'Daño ocular por radiación láser',
        efectosPosibles: 'Ceguera por daño de retina, quemaduras oculares',
        medidasControl: ['Gafas certificadas para el tipo de láser (longitud de onda específica)', 'Nunca mirar el rayo directo', 'Zona de seguridad señalizada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Gafas certificadas para láser', 'Mascarilla FFP2', 'Guantes térmicos', 'Lupa con protección UV'],
    capacitacionesObligatorias: ['Seguridad con láseres en joyería', 'Manejo de fundentes y ácidos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3220',
    descripcionCIIU: 'Fabricación de instrumentos musicales',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Otras',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'BIO-MEC-002', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'MUSIC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Lacas, barnices y maderas en fabricación de instrumentos',
        descripcion: 'Lijado de maderas duras (ébano, palosanto) y barnizado de instrumentos con lacas nitrocelulósicas',
        riesgoPotencial: 'Cáncer por polvo de maderas duras y solventes',
        efectosPosibles: 'Cáncer nasosinusal, daño hepático, asma',
        medidasControl: ['Extracción en lijado', 'Mascarilla P100 en trabajo con maderas duras', 'Ventilación en barnizado', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Polvo de madera dura y cáncer', 'Manejo de lacas y barnices', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3230',
    descripcionCIIU: 'Fabricación de artículos y equipo para la práctica del deporte',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Otras',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'SPORT-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Solventes y adhesivos en fabricación de artículos deportivos',
        descripcion: 'Uso de adhesivos de contacto, solventes y resinas en fabricación de equipos deportivos',
        riesgoPotencial: 'Intoxicación por solventes',
        efectosPosibles: 'Daño neurológico, hepático',
        medidasControl: ['Ventilación en área de adhesivos', 'Mascarilla para vapores orgánicos', 'Guantes de nitrilo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para vapores', 'Guantes de nitrilo', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de adhesivos y solventes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3240',
    descripcionCIIU: 'Fabricación de juegos, juguetes y rompecabezas',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Otras',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'JUGUE-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Pinturas, plásticos y materiales de juguetes',
        descripcion: 'Uso de pinturas al plomo (regulado), plásticos con ftalatos y adhesivos en fabricación de juguetes',
        riesgoPotencial: 'Exposición a pigmentos metálicos y ftalatos',
        efectosPosibles: 'Intoxicación por plomo (pinturas), alteración hormonal (ftalatos)',
        medidasControl: ['Uso solo de pinturas sin plomo (cumplimiento ASTM F963)', 'Ventilación en área de pintura', 'Monitoreo de plomo en personal de pintura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla para polvo y pinturas', 'Guantes de nitrilo', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Materiales seguros en fabricación de juguetes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3290',
    descripcionCIIU: 'Otras industrias manufactureras n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Otras',
    peligrosPrioritarios: ['QUI-001', 'BIO-MEC-001', 'SEG-005', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'MANNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Sustancias químicas variables según producto fabricado',
        descripcion: 'Producción de artículos varios con uso de materias primas y procesos de riesgo variable',
        riesgoPotencial: 'Exposición a sustancias según producto específico',
        efectosPosibles: 'Variable según proceso y materiales usados',
        medidasControl: ['Identificación de peligros específicos del producto', 'SDS de cada materia prima', 'EPP adecuado al proceso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['EPP específico según proceso y materiales'],
    capacitacionesObligatorias: ['Identificación de peligros por proceso', 'SDS', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3311',
    descripcionCIIU: 'Mantenimiento y reparación especializado de productos elaborados en metal',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['QUI-001', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'REPMET-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura y decapantes en reparación de metal',
        descripcion: 'Soldadura de reparación, corte y decapado con ácidos de estructuras y recipientes metálicos',
        riesgoPotencial: 'Afecciones respiratorias y quemaduras',
        efectosPosibles: 'Siderosis, manganismo, quemaduras por ácidos',
        medidasControl: ['Extracción localizada', 'Mascarilla P100', 'Guantes y careta facial para ácidos']
      },
      {
        codigo: 'REPMET-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Espacios confinados en reparación de tanques y recipientes',
        descripcion: 'Soldadura y limpieza interior de tanques y recipientes metálicos',
        riesgoPotencial: 'Asfixia y explosión en espacio confinado',
        efectosPosibles: 'Muerte por asfixia o explosión',
        medidasControl: ['Permiso de espacio confinado', 'Monitoreo de atmósfera', 'Ventilación forzada', 'Vigía externo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Careta de soldadura', 'Guantes de cuero', 'SCBA para espacios confinados'],
    capacitacionesObligatorias: ['Espacios confinados', 'Seguridad en soldadura', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3312',
    descripcionCIIU: 'Mantenimiento y reparación especializado de maquinaria y equipo',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'SEG-004', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPMAQ-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Energías peligrosas en mantenimiento de maquinaria industrial',
        descripcion: 'Mantenimiento de maquinaria con energías eléctricas, hidráulicas, neumáticas y térmicas residuales',
        riesgoPotencial: 'Arranque intempestivo o liberación de energía residual',
        efectosPosibles: 'Amputaciones, aplastamiento, electrocución',
        medidasControl: ['LOTO aplicado rigurosamente', 'Verificación de ausencia de energía residual', 'Comunicación de estado del equipo', 'Permiso de trabajo de mantenimiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Candados LOTO personales', 'Guantes dieléctricos', 'Careta facial', 'Calzado con puntera', 'Casco'],
    capacitacionesObligatorias: ['LOTO (bloqueo y etiquetado)', 'Mantenimiento seguro', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3313',
    descripcionCIIU: 'Mantenimiento y reparación especializado de equipo electrónico y óptico',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'FIS-005', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'REPELEC-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en reparación de equipos electrónicos de alta tensión',
        descripcion: 'Trabajo con fuentes de alimentación, capacitores cargados y equipos de alta tensión',
        riesgoPotencial: 'Electrocución por carga residual',
        efectosPosibles: 'Quemaduras eléctricas, paro cardíaco',
        medidasControl: ['Descarga de capacitores antes de intervenir', 'LOTO', 'Herramientas aisladas', 'No trabajar solo en equipos de alta tensión']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Herramientas aisladas', 'Pulsera antiestática', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Riesgo eléctrico en electrónica', 'LOTO', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3314',
    descripcionCIIU: 'Mantenimiento y reparación especializado de equipo eléctrico',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'FIS-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPELCT-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Arco eléctrico en mantenimiento de tableros y subestaciones',
        descripcion: 'Mantenimiento de transformadores, celdas de media tensión y tableros de distribución',
        riesgoPotencial: 'Arco eléctrico y electrocución',
        efectosPosibles: 'Quemaduras severas por arco, ceguera, muerte',
        medidasControl: ['Análisis de peligro de arco (NFPA 70E)', 'Traje de arco eléctrico', 'Careta de arco con escudo facial', 'Desenergización antes de mantenimiento (LOTO)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-180508-2010', norma: 'Resolución 180508/2010', descripcion: 'RETIE', obligatorio: true }
    ],
    eppRecomendado: ['Traje de arco eléctrico (Nomex)', 'Careta de arco con escudo', 'Guantes dieléctricos', 'Calzado dieléctrico'],
    capacitacionesObligatorias: ['Seguridad eléctrica - arco eléctrico', 'LOTO eléctrico', 'Primeros auxilios - quemaduras eléctricas']
  },

  {
    codigoCIIU: '3315',
    descripcionCIIU: 'Mantenimiento y reparación especializado de equipo de transporte, excepto los vehículos automotores',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['QUI-001', 'SEG-001', 'SEG-005', 'BIO-MEC-001', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'RЕПТRANS-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en alturas en mantenimiento de aeronaves, barcos y trenes',
        descripcion: 'Mantenimiento de aeronaves en hangares, barcos en dique seco y material rodante ferroviario',
        riesgoPotencial: 'Caída en trabajo en alturas',
        efectosPosibles: 'Traumatismos graves, muerte',
        medidasControl: ['Certificación trabajo en alturas', 'Arnés y línea de vida', 'Plataformas certificadas de mantenimiento', 'Análisis de riesgo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo entero', 'Casco', 'Calzado con puntera', 'Mascarilla P100 en soldadura'],
    capacitacionesObligatorias: ['Trabajo en alturas', 'Mantenimiento de equipos de transporte', 'Espacios confinados', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3319',
    descripcionCIIU: 'Mantenimiento y reparación de otros tipos de equipos y sus componentes n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['SEG-005', 'QUI-001', 'SEG-004', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'REPNCP-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo mecánico y eléctrico en mantenimiento de equipos diversos',
        descripcion: 'Mantenimiento de equipos variados con riesgos mecánicos, eléctricos y químicos variables',
        riesgoPotencial: 'Atrapamiento, cortes, electrocución',
        efectosPosibles: 'Amputaciones, quemaduras, lesiones graves',
        medidasControl: ['LOTO obligatorio', 'ART por tarea', 'EPP específico por equipo', 'Permiso de trabajo para actividades críticas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['LOTO propio', 'EPP según equipo a intervenir', 'Calzado con puntera'],
    capacitacionesObligatorias: ['LOTO universal', 'ART', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3320',
    descripcionCIIU: 'Instalación especializada de maquinaria y equipo industrial',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Reparación',
    peligrosPrioritarios: ['SEG-001', 'BIO-MEC-003', 'SEG-005', 'SEG-004', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'INSTAL-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en alturas y con cargas suspendidas en instalación de maquinaria',
        descripcion: 'Montaje de maquinaria industrial pesada con grúas, polipastos y trabajo en alturas',
        riesgoPotencial: 'Caída en altura y aplastamiento por carga',
        efectosPosibles: 'Traumatismos graves, aplastamiento, muerte',
        medidasControl: ['Certificación en trabajo en alturas', 'Operadores de grúa certificados', 'Zona de exclusión bajo cargas suspendidas', 'Plan de izaje']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo entero', 'Casco con barbuquejo', 'Calzado con puntera', 'Chaleco reflectivo', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Trabajo en alturas', 'Operación de equipos de izaje', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2100',
    descripcionCIIU: 'Fabricación de productos farmacéuticos, sustancias químicas medicinales y productos botánicos de uso farmacéutico',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Farmacéutica',
    peligrosPrioritarios: ['QUI-001', 'QUI-004', 'BIO-001', 'BIO-MEC-001', 'QUI-002'],
    peligrosEspecificos: [
      {
        codigo: 'FARM-FAB-001',
        clasificacion: 'quimico',
        peligro: 'Principios activos farmacéuticos potentes (HPAPI)',
        descripcion: 'Manejo de citostáticos, hormonas, antibióticos potentes y otras HPAPI en síntesis y formulación',
        riesgoPotencial: 'Toxicidad específica del principio activo (mutagénico, citotóxico, teratogénico)',
        efectosPosibles: 'Daños reproductivos, cáncer, inmunosupresión según principio activo',
        medidasControl: ['Salas blancas con presión negativa para HPAPI', 'EPP de confinamiento total', 'Banding de HPAPI (categoría por OEB)', 'Monitoreo biológico específico', 'Capacitación certificada']
      },
      {
        codigo: 'FARM-FAB-002',
        clasificacion: 'quimico',
        peligro: 'Polvo de medicamentos en granulación y envasado',
        descripcion: 'Inhalación de polvo de principios activos y excipientes en mezcla, granulación y llenado',
        riesgoPotencial: 'Sensibilización y toxicidad por el principio activo inhalado',
        efectosPosibles: 'Alergias, efectos farmacológicos involuntarios',
        medidasControl: ['Contención en equipos cerrados', 'Mascarilla FFP3 o SCBA', 'Monitoreo ambiental de polvo', 'No tomar medicamentos del área de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-1403-2007', norma: 'Resolución 1403/2007', descripcion: 'Gestión del Servicio Farmacéutico', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos farmacéuticos peligrosos', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP3 o SCBA (según HPAPI)', 'Traje Tyvek desechable', 'Guantes de nitrilo doble', 'Gafas herméticas', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Manejo de HPAPI', 'Bioseguridad en industria farmacéutica', 'Gestión de residuos farmacéuticos', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2219',
    descripcionCIIU: 'Fabricación de otros productos de caucho',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Caucho y Plásticos',
    peligrosPrioritarios: ['QUI-001', 'FIS-004', 'FIS-001', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'CAUCNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de vulcanización en productos de caucho',
        descripcion: 'Vulcanización de perfiles, empaquetaduras y piezas de caucho con emisión de humos',
        riesgoPotencial: 'Afecciones respiratorias y posible efecto cancerígeno',
        efectosPosibles: 'Bronquitis, asma, irritación crónica de vías respiratorias',
        medidasControl: ['Extracción en prensas', 'Mascarilla P100', 'Ventilación general de planta', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Protección auditiva', 'Guantes de cuero'],
    capacitacionesObligatorias: ['Control de humos de caucho', 'Primeros auxilios']
  },


  {
    codigoCIIU: '2310',
    descripcionCIIU: 'Fabricación de vidrio y productos de vidrio',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['FIS-004', 'QUI-002', 'SEG-005', 'FIS-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'VIDR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor extremo en hornos de fusión de vidrio',
        descripcion: 'Trabajo en hornos de fusión de vidrio a temperaturas superiores a 1500°C',
        riesgoPotencial: 'Estrés térmico grave, catarata por infrarrojos',
        efectosPosibles: 'Catarata profesional, golpe de calor, quemaduras',
        medidasControl: ['Gafas con filtro infrarrojo certificadas', 'Ropa aluminizada', 'Rotación de personal', 'Monitoreo WBGT']
      },
      {
        codigo: 'VIDR-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice en preparación de mezcla de vidrio',
        descripcion: 'Manipulación de arena de sílice como materia prima principal del vidrio',
        riesgoPotencial: 'Silicosis',
        efectosPosibles: 'Silicosis aguda o crónica',
        medidasControl: ['Sistemas de manejo hermético de arena', 'Respirador P100', 'Espirometría cada 6 meses', 'Monitoreo de sílice respirable']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con filtro IR certificadas', 'Ropa aluminizada reflectante', 'Respirador P100', 'Protección auditiva', 'Calzado con puntera refractaria'],
    capacitacionesObligatorias: ['Prevención de catarata profesional', 'Control de polvo de sílice', 'Estrés térmico extremo', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2391',
    descripcionCIIU: 'Fabricación de productos refractarios',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'FIS-004', 'FIS-001', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'REFRAC-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice, alúmina y amianto en refractarios',
        descripcion: 'Fabricación de ladrillos refractarios con sílice, alúmina, magnesia y posiblemente amianto en productos viejos',
        riesgoPotencial: 'Silicosis, asbestosis, cáncer de mesotelio',
        efectosPosibles: 'Silicosis, asbestosis, mesotelioma',
        medidasControl: ['Prohibición estricta de amianto en productos nuevos', 'Respirador P100 en todo el proceso', 'Espirometría semestral', 'Monitoreo de sílice respirable']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Gafas de seguridad', 'Calzado con puntera', 'Ropa de protección manga larga'],
    capacitacionesObligatorias: ['Silicosis en refractarios', 'Amianto - prohibición y manejo seguro', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2392',
    descripcionCIIU: 'Fabricación de materiales de arcilla para la construcción',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'FIS-004', 'FIS-001', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'ARCILLA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice y arcilla en ladrilleras',
        descripcion: 'Preparación de mezcla, moldeo y cocción de ladrillos, tejas y baldosas con exposición a polvo de sílice',
        riesgoPotencial: 'Silicosis en trabajadores de ladrilleras',
        efectosPosibles: 'Silicosis, fibrosis pulmonar, EPOC',
        medidasControl: ['Humectación de materias primas', 'Respirador P100 en todas las áreas de polvo', 'Espirometría anual', 'Sustitución de sílice donde sea posible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Calzado con puntera', 'Gafas de seguridad', 'Ropa de trabajo'],
    capacitacionesObligatorias: ['Silicosis en ladrilleras', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2393',
    descripcionCIIU: 'Fabricación de otros productos de cerámica y porcelana',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'FIS-004', 'QUI-001', 'FIS-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'CERAM-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice y feldespato en cerámica',
        descripcion: 'Manipulación de cuarzo, feldespato y arcillas en preparación y moldeo de cerámicas',
        riesgoPotencial: 'Silicosis y enfermedades respiratorias',
        efectosPosibles: 'Silicosis, bronquitis crónica',
        medidasControl: ['Humectación y extracción de polvo', 'Respirador P100', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Gafas de seguridad', 'Protección auditiva', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Control de sílice en cerámica', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2394',
    descripcionCIIU: 'Fabricación de cemento, cal y yeso',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'FIS-004', 'SEG-005', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'CEMEN-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de cemento y cal - alcalinos y polvo de sílice',
        descripcion: 'Inhalación de polvo alcalino de cemento y cal que causa quemaduras de vías respiratorias y sílice en materias primas',
        riesgoPotencial: 'Silicosis, quemaduras de mucosas, dermatitis alcalina',
        efectosPosibles: 'Silicosis, úlceras de nariz y boca (cemento), dermatitis química',
        medidasControl: ['Sistemas cerrados de transporte de polvo', 'Respirador P100 en toda la planta', 'Lavado de piel con agua abundante si hay contacto', 'Espirometría semestral']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Gafas herméticas de seguridad', 'Guantes de PVC', 'Ropa de trabajo de manga larga', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Silicosis y polvo alcalino', 'Dermatitis por cemento', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2395',
    descripcionCIIU: 'Fabricación de artículos de hormigón, cemento y yeso',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'BIO-MEC-003', 'FIS-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'HORM-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Manejo de piezas pesadas de concreto',
        descripcion: 'Carga y montaje de bloques, viguetas y piezas de hormigón prefabricado de gran peso',
        riesgoPotencial: 'Lesiones musculoesqueléticas y aplastamiento',
        efectosPosibles: 'Hernias, lumbalgias, aplastamiento de extremidades',
        medidasControl: ['Grúas y montacargas para piezas pesadas', 'Nunca cargar más de lo establecido', 'Calzado con puntera', 'Trabajo en equipo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100 en zona de polvo', 'Calzado con puntera', 'Guantes de trabajo', 'Casco'],
    capacitacionesObligatorias: ['Manejo de cargas pesadas', 'Control de polvo de cemento', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2396',
    descripcionCIIU: 'Corte, tallado y acabado de la piedra',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PIEDRA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de sílice en corte de granito y mármol',
        descripcion: 'Corte, pulido y tallado de granito y cuarcita con alta concentración de sílice libre',
        riesgoPotencial: 'Silicosis aguda (en corte en seco sin ventilación)',
        efectosPosibles: 'Silicosis acelerada, fibrosis masiva progresiva, muerte prematura',
        medidasControl: ['Corte con agua obligatorio', 'Respirador P100 en corte en seco', 'Extracción local en pulidoras', 'Espirometría cada 6 meses en cortadores', 'Prohibición de soplar polvo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Gafas de seguridad', 'Protección auditiva', 'Guantes anticorte', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Silicosis en canteras y marmolerías', 'Corte seguro con agua', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2399',
    descripcionCIIU: 'Fabricación de otros productos minerales no metálicos n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Minerales no metálicos',
    peligrosPrioritarios: ['QUI-002', 'FIS-004', 'FIS-001', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'MINNMFAB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de minerales no metálicos en fabricación',
        descripcion: 'Exposición a polvo de minerales según el producto (talco, asbesto-cemento, abrasivos)',
        riesgoPotencial: 'Neumoconiosis según mineral',
        efectosPosibles: 'Silicosis, talcosis, asbestosis (según mineral)',
        medidasControl: ['Identificar mineral y riesgo específico', 'Respirador P100', 'Espirometría anual', 'Sustitución de materiales peligrosos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Respirador P100', 'Gafas de seguridad', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Control de polvo mineral', 'Vigilancia epidemiológica neumoconiosis', 'Primeros auxilios']
  },

  // ==================== SECCIÓN D - SUMINISTRO DE ELECTRICIDAD, GAS, VAPOR Y AIRE ACONDICIONADO ====================

  {
    codigoCIIU: '3512',
    descripcionCIIU: 'Transmisión de energía eléctrica',
    nivelRiesgo: 'IV',
    sector: 'Energía eléctrica',
    peligrosPrioritarios: ['SEG-004', 'SEG-001', 'FIS-005', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'TRANS-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Alta tensión en líneas de transmisión y subestaciones',
        descripcion: 'Trabajo en líneas de extra alta tensión (230 kV, 500 kV) y subestaciones de transmisión',
        riesgoPotencial: 'Arco eléctrico y electrocución de alta tensión',
        efectosPosibles: 'Muerte, quemaduras por arco, traumatismo por caída inducida',
        medidasControl: ['LOTO rígido con distancias de seguridad para cada nivel de tensión', 'Análisis de arco eléctrico (IEEE 1584)', 'EPP para arco EAT', 'Trabajo bajo tensión (TBT) solo por personal certificado']
      },
      {
        codigo: 'TRANS-SEG-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en alturas en torres de transmisión',
        descripcion: 'Mantenimiento e inspección de torres de 30 a 100 m de altura',
        riesgoPotencial: 'Caída fatal en trabajo en alturas',
        efectosPosibles: 'Muerte o incapacidad permanente',
        medidasControl: ['Certificación avanzada en trabajo en alturas', 'Arnés de suspensión completo', 'Sistemas de posicionamiento y rescate', 'Inspección de arnés antes de cada ascenso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-180508-2010', norma: 'Resolución 180508/2010', descripcion: 'RETIE', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Traje de arco eléctrico EAT', 'Casco dieléctrico', 'Guantes dieléctricos de alta tensión', 'Arnés de cuerpo entero con absorbedor', 'Calzado dieléctrico', 'Detector de tensión'],
    capacitacionesObligatorias: ['Trabajo bajo tensión en líneas de transmisión', 'Trabajo en alturas en torres', 'Arco eléctrico en subestaciones', 'Primeros auxilios - RCP en accidente eléctrico']
  },

  {
    codigoCIIU: '3513',
    descripcionCIIU: 'Distribución de energía eléctrica',
    nivelRiesgo: 'IV',
    sector: 'Energía eléctrica',
    peligrosPrioritarios: ['SEG-004', 'SEG-001', 'FIS-005', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'DISTR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Alta y media tensión en redes de distribución',
        descripcion: 'Trabajo en redes de media tensión (11.4 kV, 13.2 kV) y baja tensión en zonas urbanas y rurales',
        riesgoPotencial: 'Electrocución y arco eléctrico',
        efectosPosibles: 'Muerte, quemaduras graves',
        medidasControl: ['Procedimientos de 5 reglas de oro (desenergización segura)', 'EPP dieléctrico calibrado', 'Trabajo bajo tensión certificado cuando no es posible desenergizar', 'Coordinación con centro de control']
      },
      {
        codigo: 'DISTR-SEG-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en postes y alturas en tendido eléctrico',
        descripcion: 'Subida a postes de concreto y madera para mantenimiento de redes de distribución',
        riesgoPotencial: 'Caída en alturas',
        efectosPosibles: 'Traumatismos graves, muerte',
        medidasControl: ['Certificación en trabajo en alturas para liniero', 'Correas de posición y anti-caída', 'Inspección de postes antes de subir', 'Sistema de rescate en alturas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-180508-2010', norma: 'Resolución 180508/2010', descripcion: 'RETIE', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos clase 2 o 3', 'Casco dieléctrico', 'Gafas de seguridad', 'Arnés de liniero', 'Calzado dieléctrico', 'Detector de tensión personal'],
    capacitacionesObligatorias: ['5 reglas de oro de la electricidad', 'Liniero - trabajo en postes', 'Trabajo bajo tensión BT/MT', 'Primeros auxilios - accidentes eléctricos']
  },

  {
    codigoCIIU: '3514',
    descripcionCIIU: 'Comercialización de energía eléctrica',
    nivelRiesgo: 'II',
    sector: 'Energía eléctrica',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-002', 'BIO-MEC-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'COMER-ELEC-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Presión por resultados comerciales en mercado de energía',
        descripcion: 'Alta competencia y exigencia en comercialización de energía en mercado mayorista y minorista',
        riesgoPotencial: 'Estrés laboral crónico',
        efectosPosibles: 'Burnout, ansiedad, enfermedades cardiovasculares',
        medidasControl: ['Gestión del riesgo psicosocial', 'Metas realistas', 'Pausas programadas', 'Programa de bienestar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Monitor regulable'],
    capacitacionesObligatorias: ['Ergonomía en oficina', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3520',
    descripcionCIIU: 'Producción de gas; distribución de combustibles gaseosos por tuberías',
    nivelRiesgo: 'IV',
    sector: 'Energía - Gas',
    peligrosPrioritarios: ['SEG-006', 'QUI-001', 'SEG-003', 'SEG-004', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'GAS-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Incendio y explosión en distribución de gas',
        descripcion: 'Operación y mantenimiento de redes de gas natural con riesgo de fuga e ignición',
        riesgoPotencial: 'Explosión e incendio',
        efectosPosibles: 'Explosión, quemaduras graves, muerte',
        medidasControl: ['Detector de gas natural (metano) personal y fijo', 'Procedimientos de trabajo seguro en líneas con gas', 'Ventilación antes de trabajar en espacios', 'Plan de emergencia por fuga de gas', 'No usar herramientas que generen chispas en zona de riesgo']
      },
      {
        codigo: 'GAS-SEG-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Espacios confinados en cámaras y válvulas de gas',
        descripcion: 'Mantenimiento de válvulas, reguladores y acometidas en cámaras de gas subterráneas',
        riesgoPotencial: 'Asfixia y explosión en espacio confinado',
        efectosPosibles: 'Muerte por asfixia o explosión',
        medidasControl: ['Permiso de espacio confinado', 'Medición de atmósfera (CH4, CO, O2)', 'Ventilación forzada', 'Vigía externo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-90902-1997', norma: 'Resolución 90902/1997 CREG', descripcion: 'Reglamento de distribución de gas natural', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Detector de gas CH4 personal', 'Calzado antiestático', 'Ropa antiestática', 'SCBA para espacios confinados', 'Guantes de cuero'],
    capacitacionesObligatorias: ['Seguridad en redes de gas natural', 'Espacios confinados', 'Prevención y control de fugas de gas', 'Primeros auxilios - intoxicación por gas']
  },

  {
    codigoCIIU: '3530',
    descripcionCIIU: 'Suministro de vapor y aire acondicionado',
    nivelRiesgo: 'III',
    sector: 'Energía - Vapor',
    peligrosPrioritarios: ['FIS-004', 'SEG-004', 'SEG-003', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'VAPOR-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Quemaduras por vapor de alta presión y temperatura',
        descripcion: 'Operación de calderas, intercambiadores y redes de vapor de proceso con presiones y temperaturas extremas',
        riesgoPotencial: 'Quemaduras graves por vapor',
        efectosPosibles: 'Quemaduras de 2° y 3° grado, traumatismos por onda de presión',
        medidasControl: ['Mantenimiento preventivo de válvulas y líneas', 'Zona de exclusión en aperturas', 'EPP térmico al operar válvulas de vapor', 'Procedimientos de purga y venteo seguros']
      },
      {
        codigo: 'VAPOR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosión de calderas por falla en controles de presión',
        descripcion: 'Operación de calderas acuotubulares y pirotubulares con presiones de trabajo elevadas',
        riesgoPotencial: 'Explosión de caldera (BLEVE)',
        efectosPosibles: 'Destrucción de instalaciones, muerte, lesiones graves',
        medidasControl: ['Programa de inspección de calderas por ICONTEC o entidad competente', 'Válvulas de seguridad calibradas', 'Operadores de caldera certificados', 'Mantenimiento preventivo riguroso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-2106-1983', norma: 'Decreto 2106/1983', descripcion: 'Recipientes y calderas sujetas a presión', obligatorio: true }
    ],
    eppRecomendado: ['Guantes térmicos resistentes a vapor', 'Careta facial térmica', 'Ropa de algodón o nomex', 'Calzado de seguridad térmico'],
    capacitacionesObligatorias: ['Operación segura de calderas', 'Mantenimiento de recipientes a presión', 'Prevención de quemaduras por vapor', 'Primeros auxilios']
  },

  // ==================== SECCIÓN E - DISTRIBUCIÓN DE AGUA, ALCANTARILLADO, GESTIÓN DE RESIDUOS ====================

  {
    codigoCIIU: '3811',
    descripcionCIIU: 'Recolección de desechos no peligrosos',
    nivelRiesgo: 'IV',
    sector: 'Saneamiento ambiental',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-004', 'BIO-MEC-003', 'SEG-005', 'FIS-003'],
    peligrosEspecificos: [
      {
        codigo: 'BASUR-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Agentes biológicos en residuos sólidos urbanos',
        descripcion: 'Exposición a bacterias, virus, hongos y parásitos en recolección de basuras domésticas',
        riesgoPotencial: 'Enfermedades infecciosas diversas',
        efectosPosibles: 'Hepatitis A, gastroenteritis, dermatitis, leptospirosis, tetanus',
        medidasControl: ['Vacunación (hepatitis A, tétanos, influenza)', 'Guantes de cuero o goma resistente', 'No manipular residuos con manos directas', 'Higiene rigurosa al terminar jornada', 'Ropa de trabajo exclusiva']
      },
      {
        codigo: 'BASUR-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Atrapamiento por maquinaria compactadora',
        descripcion: 'Riesgo de atrapamiento de extremidades en la tolva de compactación del carro recolector',
        riesgoPotencial: 'Aplastamiento y amputación',
        efectosPosibles: 'Amputaciones, aplastamiento grave, muerte',
        medidasControl: ['Procedimiento de carga en el lateral nunca por detrás', 'Comunicación permanente entre conductor y recolectores', 'Sistema de paro de emergencia de la compactadora', 'Nunca montar en el estribo del carro']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-0596-2016', norma: 'Decreto 0596/2016', descripcion: 'Esquema de prestación del servicio de aseo', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de cuero o PVC resistente', 'Botas de caucho con puntera', 'Ropa reflectiva de alta visibilidad', 'Mascarilla para polvo', 'Casco si se trabaja cerca de maquinaria'],
    capacitacionesObligatorias: ['Bioseguridad en recolección de residuos', 'Seguridad operacional con vehículos compactadores', 'Manejo de lesiones cortopunzantes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3812',
    descripcionCIIU: 'Recolección de desechos peligrosos',
    nivelRiesgo: 'V',
    sector: 'Saneamiento ambiental',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'BIO-001', 'BIO-002', 'FIS-005', 'SEG-006'],
    peligrosEspecificos: [
      {
        codigo: 'RESISP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a sustancias peligrosas en recolección de RESPEL',
        descripcion: 'Manejo de residuos peligrosos: solventes, ácidos, metales pesados, radioactivos y biosanitarios',
        riesgoPotencial: 'Intoxicación, quemaduras y contaminación radioactiva',
        efectosPosibles: 'Intoxicación aguda o crónica, quemaduras, cáncer',
        medidasControl: ['EPP nivel C o D según residuo', 'Manifiesto de residuos peligrosos', 'Capacitación específica por tipo de residuo', 'Plan de emergencias para derrames']
      },
      {
        codigo: 'RESISP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Residuos biosanitarios y anatomopatológicos',
        descripcion: 'Recolección de residuos hospitalarios infecciosos de alto riesgo',
        riesgoPotencial: 'Infección por VIH, hepatitis B/C, patógenos hospitalarios',
        efectosPosibles: 'VIH, hepatitis B y C, tuberculosis, sepsis',
        medidasControl: ['EPP para nivel de riesgo biológico', 'Vacunación obligatoria (hepatitis B, tétanos)', 'Protocolo de accidente con material biológico', 'Nunca abrir bolsas de residuos sin saber su contenido']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión integral de residuos peligrosos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-8321-1983', norma: 'Resolución 0673-1996 MinSalud', descripcion: 'Manejo de residuos hospitalarios peligrosos', obligatorio: true }
    ],
    eppRecomendado: ['Traje de protección química nivel C (Tyvek + equipo autónomo según residuo)', 'Guantes dobles de nitrilo grueso', 'Botas de caucho con puntera', 'Gafas herméticas', 'SCBA para RESPEL gaseosos'],
    capacitacionesObligatorias: ['Decreto 4741/2005 - RESPEL', 'EPP para residuos peligrosos', 'Manejo de emergencias por derrames', 'Bioseguridad nivel 2-3', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3821',
    descripcionCIIU: 'Tratamiento y disposición de desechos no peligrosos',
    nivelRiesgo: 'IV',
    sector: 'Saneamiento ambiental',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-001', 'SEG-003', 'SEG-006', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'RELLENO-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en relleno sanitario y planta de tratamiento',
        descripcion: 'Trabajo en relleno sanitario con alta concentración de microorganismos patógenos en lixiviados y frentes de trabajo',
        riesgoPotencial: 'Enfermedades infecciosas diversas',
        efectosPosibles: 'Gastroenteritis, infecciones respiratorias, leptospirosis',
        medidasControl: ['Vacunación completa del personal', 'EPP completo en frente de trabajo', 'Higiene rigurosa al terminar jornada', 'No comer/beber en zona de trabajo', 'Agua potable disponible para higiene']
      },
      {
        codigo: 'RELLENO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Biogás (metano, CO2, H2S) en relleno sanitario',
        descripcion: 'Emisión de gases de descomposición con metano explosivo y H2S tóxico',
        riesgoPotencial: 'Explosión e intoxicación',
        efectosPosibles: 'Explosión, asfixia, intoxicación por H2S',
        medidasControl: ['Detector de CH4 y H2S personal en frente de trabajo', 'Sistemas de captación y quema de biogás', 'Prohibición de fumar en relleno', 'SCBA disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-0838-2005', norma: 'Decreto 0838/2005', descripcion: 'Disposición final de residuos sólidos', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caucho con puntera', 'Guantes de PVC o cuero', 'Ropa de trabajo reflectiva', 'Mascarilla N95', 'Detector de gas personal', 'Casco'],
    capacitacionesObligatorias: ['Bioseguridad en rellenos sanitarios', 'Manejo de biogás', 'Seguridad con maquinaria pesada', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3822',
    descripcionCIIU: 'Tratamiento y disposición de desechos peligrosos',
    nivelRiesgo: 'V',
    sector: 'Saneamiento ambiental',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'BIO-001', 'FIS-005', 'SEG-006', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'TRESPEL-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Exposición a sustancias peligrosas en tratamiento de RESPEL',
        descripcion: 'Tratamiento térmico, fisicoquímico o biológico de residuos peligrosos con alta variabilidad de riesgos',
        riesgoPotencial: 'Intoxicación, quemaduras, explosión, cáncer',
        efectosPosibles: 'Intoxicación aguda, cáncer ocupacional, quemaduras',
        medidasControl: ['EPP específico por tipo de residuo y proceso', 'Monitoreo ambiental permanente', 'Plan de emergencias químicas', 'Capacitación avanzada en gestión de RESPEL']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión integral de residuos peligrosos', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Traje de protección química nivel B o C', 'SCBA', 'Guantes dobles de nitrilo', 'Botas de caucho con puntera', 'Dosímetro si hay fuentes radiactivas'],
    capacitacionesObligatorias: ['Gestión avanzada de RESPEL', 'Emergencias químicas', 'Uso de EPP de alto nivel', 'Primeros auxilios - intoxicaciones']
  },

  {
    codigoCIIU: '3830',
    descripcionCIIU: 'Recuperación de materiales',
    nivelRiesgo: 'III',
    sector: 'Saneamiento ambiental',
    peligrosPrioritarios: ['BIO-001', 'BIO-004', 'QUI-001', 'BIO-MEC-003', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'RECUP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Contacto con materiales reciclables potencialmente contaminados',
        descripcion: 'Clasificación y procesamiento de papel, plástico, vidrio y metales recuperados de residuos',
        riesgoPotencial: 'Infecciones cutáneas y sistémicas',
        efectosPosibles: 'Infecciones, cortes infectados, parasitosis',
        medidasControl: ['Guantes resistentes a cortes y biológicos', 'Vacunación (hepatitis A, tétanos)', 'Higiene de manos rigurosa', 'No manipular sin guantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-2981-2013', norma: 'Decreto 2981/2013', descripcion: 'Servicio público de aseo y reciclaje', obligatorio: true }
    ],
    eppRecomendado: ['Guantes anticorte nivel 4', 'Botas de caucho con puntera', 'Mascarilla para polvo', 'Ropa de trabajo reflectiva'],
    capacitacionesObligatorias: ['Bioseguridad en reciclaje', 'Manejo de materiales cortopunzantes', 'Primeros auxilios']
  },

  {
    codigoCIIU: '3900',
    descripcionCIIU: 'Actividades de saneamiento ambiental y otros servicios de gestión de desechos',
    nivelRiesgo: 'III',
    sector: 'Saneamiento ambiental',
    peligrosPrioritarios: ['QUI-001', 'BIO-001', 'BIO-002', 'SEG-003', 'BIO-MEC-004'],
    peligrosEspecificos: [
      {
        codigo: 'SANEA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Plaguicidas y desinfectantes en servicios de fumigación y saneamiento',
        descripcion: 'Aplicación de plaguicidas, rodenticidas y desinfectantes industriales en servicios de control de vectores',
        riesgoPotencial: 'Intoxicación aguda y crónica por plaguicidas',
        efectosPosibles: 'Síndrome colinérgico, daño neurológico, sensibilización',
        medidasControl: ['EPP completo para aplicación de plaguicidas (Decreto 1843/1991)', 'Monitoreo de colinesterasa en operadores', 'Rotación del ingrediente activo', 'Ficha técnica del plaguicida disponible']
      },
      {
        codigo: 'SANEA-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Espacios confinados en saneamiento de alcantarillas y sumideros',
        descripcion: 'Desatascos, limpiezas y muestreos en redes de alcantarillado y cámaras subterráneas',
        riesgoPotencial: 'Asfixia y explosión en espacio confinado',
        efectosPosibles: 'Muerte por gases tóxicos (H2S, CO, metano) o asfixia',
        medidasControl: ['Permiso de espacio confinado obligatorio', 'Monitoreo de H2S, CO, CH4 y O2 antes y durante', 'Ventilación forzada', 'SCBA disponible', 'Vigía externo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Overol de fumigación', 'Guantes de nitrilo grueso', 'Mascarilla con filtro para pesticidas', 'Gafas herméticas', 'Botas de caucho', 'SCBA para espacios confinados'],
    capacitacionesObligatorias: ['Manejo seguro de plaguicidas', 'Espacios confinados en alcantarillado', 'Monitoreo biológico de colinesterasa', 'Primeros auxilios - intoxicación por plaguicidas']
  },


  // ==================== SECCIÓN A - AGRICULTURA, GANADERÍA, CAZA, SILVICULTURA Y PESCA ====================

  {
    codigoCIIU: '0112',
    descripcionCIIU: 'Cultivo de arroz',
    sector: 'Agricultura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a plaguicidas y herbicidas',
        categoria: 'Químico',
        descripcion: 'Aplicación de herbicidas, fungicidas e insecticidas en cultivos de arroz',
        fuenteGeneradora: 'Fumigación aérea y manual de cultivos',
        actividadAsociada: 'Siembra, mantenimiento y cosecha de arroz',
        riesgoPotencial: 'Intoxicación aguda o crónica por plaguicidas',
        efectosPosibles: 'Daño neurológico, dérmico y respiratorio',
        medidasControl: ['Capacitación en manejo seguro de agroquímicos', 'EPP completo para fumigación', 'Rotación de cultivos', 'Control biológico de plagas']
      },
      {
        codigo: 'FIS-003',
        nombre: 'Estrés térmico en campo abierto',
        categoria: 'Físico',
        descripcion: 'Exposición prolongada al sol en cultivos de arroz anegados',
        fuenteGeneradora: 'Trabajo en campo abierto bajo sol directo',
        actividadAsociada: 'Trasplante, deshierbe y cosecha manual',
        riesgoPotencial: 'Golpe de calor, deshidratación',
        efectosPosibles: 'Agotamiento térmico, insolación, colapso',
        medidasControl: ['Hidratación cada 20 minutos', 'Descanso en sombra', 'Ropa de trabajo adecuada', 'Jornadas en horas frescas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Sombrero de ala ancha', 'Protector solar factor 50+', 'Guantes de nitrilo', 'Botas de caucho', 'Overol de trabajo', 'Mascarilla N95 para fumigación'],
    capacitacionesObligatorias: ['Manejo seguro de agroquímicos', 'Prevención de estrés térmico', 'Higiene postural en campo', 'Primeros auxilios agropecuarios']
  },
  {
    codigoCIIU: '0113',
    descripcionCIIU: 'Cultivo de hortalizas, raíces y tubérculos',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a agroquímicos',
        categoria: 'Químico',
        descripcion: 'Uso de fertilizantes, pesticidas y fungicidas en horticultura',
        fuenteGeneradora: 'Aplicación manual y mecánica de agroquímicos',
        actividadAsociada: 'Mantenimiento de cultivos de hortalizas',
        riesgoPotencial: 'Intoxicación por plaguicidas organofosforados',
        efectosPosibles: 'Inhibición colinesterasa, toxicidad sistémica',
        medidasControl: ['EPP para fumigación', 'Monitoreo biológico de colinesterasa', 'Capacitación en MSDS', 'Sustitución de productos más tóxicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Botas de caucho', 'Protector solar', 'Mascarilla para agroquímicos', 'Overol', 'Sombrero'],
    capacitacionesObligatorias: ['Manejo seguro de agroquímicos', 'Higiene postural', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0114',
    descripcionCIIU: 'Cultivo de tabaco',
    sector: 'Agricultura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Absorción percutánea de nicotina (Green Tobacco Sickness)',
        categoria: 'Químico',
        descripcion: 'Contacto dérmico con hojas húmedas de tabaco que contienen nicotina',
        fuenteGeneradora: 'Cosecha manual de hojas de tabaco',
        actividadAsociada: 'Cosecha y curado de tabaco',
        riesgoPotencial: 'Intoxicación aguda por nicotina',
        efectosPosibles: 'Náuseas, vómitos, mareos, taquicardia',
        medidasControl: ['Guantes impermeables durante cosecha', 'Ropa de manga larga', 'Ducha inmediata si hay contacto', 'No cosechar con hojas mojadas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Manejo de sustancias tóxicas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes impermeables de nitrilo', 'Overol manga larga', 'Botas de caucho', 'Protector solar'],
    capacitacionesObligatorias: ['Enfermedad del tabaco verde', 'Manejo de agroquímicos', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0115',
    descripcionCIIU: 'Cultivo de plantas textiles',
    sector: 'Agricultura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'BIO-001',
        nombre: 'Exposición a fibras vegetales y polvos',
        categoria: 'Biológico',
        descripcion: 'Inhalación de polvo de plantas textiles (algodón, fique, cáñamo)',
        fuenteGeneradora: 'Cosecha y procesamiento primario',
        actividadAsociada: 'Cosecha, secado y enfardado',
        riesgoPotencial: 'Bisinosis (enfermedad del pulmón de algodón)',
        efectosPosibles: 'Obstrucción bronquial, bronquitis crónica',
        medidasControl: ['Mascarilla para polvo orgánico', 'Ventilación adecuada', 'Vigilancia médica respiratoria', 'Control de polvo ambiental']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla N95', 'Guantes de tela', 'Gafas de seguridad', 'Overol', 'Protector solar'],
    capacitacionesObligatorias: ['Riesgos por polvo orgánico', 'Uso de EPP respiratorio', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0119',
    descripcionCIIU: 'Otros cultivos transitorios n.c.p.',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a agroquímicos varios',
        categoria: 'Químico',
        descripcion: 'Uso de pesticidas y fertilizantes en cultivos transitorios diversos',
        fuenteGeneradora: 'Aplicación de agroquímicos',
        actividadAsociada: 'Mantenimiento y protección de cultivos',
        riesgoPotencial: 'Intoxicación por plaguicidas',
        efectosPosibles: 'Daño hepático, renal, neurológico',
        medidasControl: ['EPP completo', 'Capacitación en agroquímicos', 'Rotación de cultivos', 'Monitoreo biológico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Uso y manejo de plaguicidas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Botas de caucho', 'Protector solar'],
    capacitacionesObligatorias: ['Manejo de agroquímicos', 'Primeros auxilios agropecuarios']
  },
  {
    codigoCIIU: '0122',
    descripcionCIIU: 'Cultivo de plátano y banano',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a nematicidas y fungicidas en platanales',
        categoria: 'Químico',
        descripcion: 'Aplicación de productos para control de sigatoka y nematodos',
        fuenteGeneradora: 'Fumigación aérea y terrestre de cultivos',
        actividadAsociada: 'Mantenimiento fitosanitario del cultivo',
        riesgoPotencial: 'Intoxicación crónica por fungicidas sistémicos',
        efectosPosibles: 'Daño hepático, afectaciones dérmicas, cáncer',
        medidasControl: ['EPP para fumigación', 'Capacitación en plaguicidas', 'Zonas de exclusión durante fumigación', 'Monitoreo médico periódico']
      },
      {
        codigo: 'SEG-001',
        nombre: 'Caída de racimos durante cosecha',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Riesgo de golpe por caída de racimos durante el corte con machete',
        fuenteGeneradora: 'Cosecha manual con machete',
        actividadAsociada: 'Corte y acarreo de racimos',
        riesgoPotencial: 'Golpe por objeto pesado, cortes',
        efectosPosibles: 'Traumatismos, fracturas, laceraciones',
        medidasControl: ['Uso de casco de seguridad', 'Coordinación en corte y recibo', 'Técnica correcta de corte', 'Calzado con punta de acero']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Guantes de nitrilo', 'Mascarilla para fumigación', 'Botas de caucho', 'Protector solar', 'Overol'],
    capacitacionesObligatorias: ['Manejo de agroquímicos', 'Técnicas seguras de cosecha', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0123',
    descripcionCIIU: 'Cultivo de café',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-MEC-001',
        nombre: 'Esfuerzo postural en recolección manual en ladera',
        categoria: 'Biomecánico',
        descripcion: 'Posturas de trabajo en laderas durante la recolección de café',
        fuenteGeneradora: 'Recolección manual en terreno inclinado',
        actividadAsociada: 'Cosecha de café',
        riesgoPotencial: 'Lesiones musculoesqueléticas, caídas en pendiente',
        efectosPosibles: 'Lumbalgia, golpes, fracturas por caída',
        medidasControl: ['Calzado antideslizante', 'Capacitación en higiene postural', 'Pausas activas', 'Restricción en pendientes extremas con lluvia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado antideslizante', 'Guantes', 'Mascarilla', 'Sombrero', 'Protector solar', 'Overol'],
    capacitacionesObligatorias: ['Higiene postural en terreno inclinado', 'Manejo de agroquímicos', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0124',
    descripcionCIIU: 'Cultivo de caña de azúcar',
    sector: 'Agricultura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'FIS-003',
        nombre: 'Estrés térmico extremo en cañaverales',
        categoria: 'Físico',
        descripcion: 'Trabajo en campos de caña bajo sol intenso con alta carga física',
        fuenteGeneradora: 'Trabajo en campo abierto en valles cálidos',
        actividadAsociada: 'Corte manual y mecanizado de caña',
        riesgoPotencial: 'Golpe de calor, enfermedad renal crónica',
        efectosPosibles: 'Insuficiencia renal, muerte por golpe de calor',
        medidasControl: ['Hidratación forzada cada 15 minutos', 'Trabajo en horas frescas', 'Descanso en sombra', 'Vigilancia médica renal periódica']
      },
      {
        codigo: 'SEG-001',
        nombre: 'Riesgos por machete en corte de caña',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Uso de machetes y herramientas afiladas en corte de caña',
        fuenteGeneradora: 'Corte manual de caña',
        actividadAsociada: 'Zafra (cosecha de caña)',
        riesgoPotencial: 'Laceraciones y amputaciones',
        efectosPosibles: 'Heridas profundas, pérdida de dedos',
        medidasControl: ['Guantes de corte resistentes', 'Técnica segura de corte', 'Mantenimiento de herramientas', 'Capacitación en uso seguro']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Higiene y seguridad en el trabajo', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de corte nivel 5', 'Polainas de cuero', 'Casco', 'Botas punta de acero', 'Ropa de algodón clara', 'Sombrero amplio'],
    capacitacionesObligatorias: ['Uso seguro de machete', 'Prevención estrés térmico', 'Hidratación en campo', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0125',
    descripcionCIIU: 'Cultivo de flor de corte',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición intensiva a plaguicidas en floricultura',
        categoria: 'Químico',
        descripcion: 'Alta frecuencia de aplicación de fungicidas e insecticidas en cultivos de flores',
        fuenteGeneradora: 'Fumigación frecuente en invernaderos',
        actividadAsociada: 'Mantenimiento fitosanitario de flores',
        riesgoPotencial: 'Intoxicación crónica, afectaciones reproductivas',
        efectosPosibles: 'Alteraciones hormonales, cáncer, problemas reproductivos',
        medidasControl: ['Restricción de ingreso post-fumigación', 'EPP completo', 'Monitoreo biológico', 'Rotación de trabajadoras embarazadas']
      },
      {
        codigo: 'BIO-MEC-001',
        nombre: 'Movimientos repetitivos en clasificación y empaque de flores',
        categoria: 'Biomecánico',
        descripcion: 'Trabajo de pie con movimientos repetitivos en mesas de clasificación',
        fuenteGeneradora: 'Clasificación y empaque de flores',
        actividadAsociada: 'Postcosecha de flores',
        riesgoPotencial: 'Desórdenes musculoesqueléticos de miembros superiores',
        efectosPosibles: 'Síndrome del túnel carpiano, epicondilitis',
        medidasControl: ['Rotación de estaciones', 'Reposapiés y asientos ergonómicos', 'Pausas activas', 'Análisis ergonómico de puestos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true },
      { codigo: 'RES-2346-2007', norma: 'Resolución 2346/2007', descripcion: 'Evaluaciones médicas ocupacionales', obligatorio: true }
    ],
    eppRecomendado: ['Traje Tyvek para fumigación', 'Respirador con filtro orgánico', 'Guantes de nitrilo', 'Gafas herméticas', 'Botas de caucho'],
    capacitacionesObligatorias: ['Plaguicidas en floricultura', 'Ergonomía en postcosecha', 'Salud reproductiva y exposición química', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0126',
    descripcionCIIU: 'Cultivo de palma para aceite (palma africana) y otros frutos oleaginosos',
    sector: 'Agricultura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Caída de racimos y espinas de palma',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Peligro por caída de pesados racimos de palma durante cosecha con malayo',
        fuenteGeneradora: 'Cosecha con malayo (vara larga)',
        actividadAsociada: 'Cosecha de racimos de fruta fresca',
        riesgoPotencial: 'Golpe por caída de racimo (20-50 kg)',
        efectosPosibles: 'Traumatismos severos, fracturas, muerte',
        medidasControl: ['Casco con barbuquejo', 'Zona de despeje durante corte', 'Técnica correcta de corte', 'Calzado con punta de acero']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco con visera y barbuquejo', 'Guantes de nitrilo', 'Botas punta de acero', 'Overol', 'Mascarilla para pesticidas'],
    capacitacionesObligatorias: ['Técnica segura de cosecha de palma', 'Manejo de plaguicidas', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0127',
    descripcionCIIU: 'Cultivo de plantas con las que se preparan bebidas',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'FIS-003',
        nombre: 'Exposición solar en cultivos para bebidas',
        categoria: 'Físico',
        descripcion: 'Trabajo prolongado bajo sol en cultivos de cacao, guaraná y similares',
        fuenteGeneradora: 'Labores agrícolas en campo abierto',
        actividadAsociada: 'Siembra, mantenimiento y cosecha',
        riesgoPotencial: 'Estrés térmico, quemaduras solares',
        efectosPosibles: 'Golpe de calor, cáncer de piel a largo plazo',
        medidasControl: ['Protector solar', 'Sombrero', 'Hidratación continua', 'Jornadas en horas frescas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Sombrero de ala ancha', 'Protector solar', 'Guantes', 'Botas de caucho', 'Overol'],
    capacitacionesObligatorias: ['Prevención estrés térmico', 'Manejo de agroquímicos', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0128',
    descripcionCIIU: 'Cultivo de especias y de plantas aromáticas y medicinales',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-001',
        nombre: 'Reacciones alérgicas a aceites esenciales',
        categoria: 'Biológico',
        descripcion: 'Exposición a aceites esenciales y compuestos volátiles de plantas aromáticas',
        fuenteGeneradora: 'Contacto con plantas aromáticas durante cosecha',
        actividadAsociada: 'Cosecha y secado de plantas medicinales',
        riesgoPotencial: 'Dermatitis de contacto, reacciones alérgicas',
        efectosPosibles: 'Eccema, urticaria, asma ocupacional',
        medidasControl: ['Guantes de nitrilo', 'Evaluación médica previa', 'Rotación de tareas', 'Ventilación adecuada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Overol', 'Botas de caucho', 'Protector solar'],
    capacitacionesObligatorias: ['Riesgos por plantas aromáticas', 'Prevención de alergias ocupacionales', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0129',
    descripcionCIIU: 'Otros cultivos permanentes n.c.p.',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a agroquímicos en cultivos permanentes',
        categoria: 'Químico',
        descripcion: 'Uso de fertilizantes y pesticidas en cultivos permanentes varios',
        fuenteGeneradora: 'Aplicación regular de agroquímicos',
        actividadAsociada: 'Mantenimiento fitosanitario',
        riesgoPotencial: 'Intoxicación crónica',
        efectosPosibles: 'Daño orgánico acumulativo',
        medidasControl: ['EPP para fumigación', 'Capacitación en agroquímicos', 'Manejo integrado de plagas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes', 'Mascarilla', 'Overol', 'Botas', 'Protector solar'],
    capacitacionesObligatorias: ['Manejo de agroquímicos', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0130',
    descripcionCIIU: 'Propagación de plantas (viveros)',
    sector: 'Agricultura',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'BIO-001',
        nombre: 'Exposición a hongos y patógenos del suelo en viveros',
        categoria: 'Biológico',
        descripcion: 'Contacto con tierra, sustratos y material vegetal potencialmente contaminado',
        fuenteGeneradora: 'Manipulación de sustratos y plantas en vivero',
        actividadAsociada: 'Germinación, repique y mantenimiento de plántulas',
        riesgoPotencial: 'Infecciones dérmicas por hongos del suelo',
        efectosPosibles: 'Micosis cutánea, dermatitis',
        medidasControl: ['Guantes de jardín', 'Lavado frecuente de manos', 'Calzado cerrado', 'Control de humedad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de jardín', 'Delantal', 'Calzado cerrado antideslizante', 'Protector solar'],
    capacitacionesObligatorias: ['Manejo higiénico de sustratos', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0141',
    descripcionCIIU: 'Cría de ganado bovino y bufalino',
    sector: 'Pecuario',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'BIO-002',
        nombre: 'Zoonosis en ganadería bovina',
        categoria: 'Biológico',
        descripcion: 'Riesgo de brucelosis, leptospirosis, ántrax por contacto con bovinos',
        fuenteGeneradora: 'Contacto directo con animales y sus fluidos',
        actividadAsociada: 'Ordeño, partos asistidos, vacunación, manejo de cadáveres',
        riesgoPotencial: 'Brucelosis, leptospirosis, tuberculosis bovina',
        efectosPosibles: 'Enfermedad sistémica crónica, fiebres ondulantes',
        medidasControl: ['Vacunación de trabajadores expuestos', 'Guantes y mascarilla en partos', 'Higiene post-contacto con animales', 'Control sanitario del hato']
      },
      {
        codigo: 'SEG-001',
        nombre: 'Traumatismos por animales bovinos',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Patadas, cornadas y aplastamiento por ganado bovino',
        fuenteGeneradora: 'Manejo y sujeción de animales',
        actividadAsociada: 'Manejo en manga, ordeño, vacunación',
        riesgoPotencial: 'Traumatismos graves, fracturas, aplastamiento',
        efectosPosibles: 'Fracturas, contusiones severas, muerte',
        medidasControl: ['Instalaciones adecuadas (manga, cepo)', 'Técnicas de manejo animal', 'Nunca trabajar solo con toros', 'Botas punta de acero']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caucho punta de acero', 'Guantes de cuero', 'Overol', 'Casco para manejo de toros', 'Mascarilla'],
    capacitacionesObligatorias: ['Manejo seguro de bovinos', 'Zoonosis y bioseguridad', 'Primeros auxilios agropecuarios']
  },
  {
    codigoCIIU: '0142',
    descripcionCIIU: 'Cría de caballos y otros equinos',
    sector: 'Pecuario',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Traumatismos por equinos',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Coces, mordeduras y aplastamiento durante manejo de caballos',
        fuenteGeneradora: 'Manejo, monta y herraje de equinos',
        actividadAsociada: 'Manejo diario de caballos y mulas',
        riesgoPotencial: 'Traumatismos por coz, caída de jinete',
        efectosPosibles: 'Fracturas, TCE, contusiones graves',
        medidasControl: ['Casco de equitación', 'Botas de equitación', 'Técnicas de aproximación segura', 'Nunca pararse detrás del animal sin aviso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco de equitación', 'Botas de equitación', 'Guantes de cuero', 'Mascarilla', 'Chaleco protector'],
    capacitacionesObligatorias: ['Manejo seguro de equinos', 'Zoonosis equinas', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0143',
    descripcionCIIU: 'Cría de ovejas y cabras',
    sector: 'Pecuario',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-002',
        nombre: 'Zoonosis en ovinos y caprinos',
        categoria: 'Biológico',
        descripcion: 'Riesgo de brucelosis, fiebre Q en pequeños rumiantes',
        fuenteGeneradora: 'Contacto con animales y fluidos durante partos',
        actividadAsociada: 'Partos asistidos, ordeño, vacunación',
        riesgoPotencial: 'Brucelosis caprina (B. melitensis)',
        efectosPosibles: 'Fiebre ondulante, artritis séptica, daño orgánico',
        medidasControl: ['Guantes en partos', 'Higiene post-contacto', 'Vacunación del rebaño', 'Leche pasteurizada para consumo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes', 'Overol', 'Botas de caucho', 'Mascarilla'],
    capacitacionesObligatorias: ['Zoonosis en pequeños rumiantes', 'Bioseguridad ganadera', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0144',
    descripcionCIIU: 'Cría de ganado porcino',
    sector: 'Pecuario',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-002',
        nombre: 'Zoonosis en porcicultura',
        categoria: 'Biológico',
        descripcion: 'Riesgo de leptospirosis, influenza porcina, erisipela en granjas porcinas',
        fuenteGeneradora: 'Contacto con cerdos y sus secreciones',
        actividadAsociada: 'Manejo diario, partos, vacunación',
        riesgoPotencial: 'Influenza zoonótica, leptospirosis',
        efectosPosibles: 'Enfermedad respiratoria, fiebre, daño renal',
        medidasControl: ['Mascarilla N95', 'Guantes', 'Higiene estricta', 'Vigilancia epidemiológica']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Gases tóxicos en pozos de purines',
        categoria: 'Químico',
        descripcion: 'Generación de H2S, NH3, CH4 en fosas de purines porcinos',
        fuenteGeneradora: 'Manejo de residuos y pozos de purines',
        actividadAsociada: 'Limpieza de corrales y manejo de purines',
        riesgoPotencial: 'Intoxicación por gases, asfixia',
        efectosPosibles: 'Pérdida de conciencia, muerte',
        medidasControl: ['Ventilación forzada antes de entrar', 'Detector de gases', 'Nunca trabajar solo en pozos', 'Plan de emergencia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0491-2020', norma: 'Resolución 0491/2020', descripcion: 'Espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla N95', 'Guantes de nitrilo', 'Overol', 'Botas de caucho', 'Detector de gases H2S'],
    capacitacionesObligatorias: ['Zoonosis porcinas', 'Manejo de gases en granjas', 'Espacios confinados', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0145',
    descripcionCIIU: 'Cría de aves de corral',
    sector: 'Pecuario',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-002',
        nombre: 'Zoonosis avícola',
        categoria: 'Biológico',
        descripcion: 'Riesgo de influenza aviar, Newcastle, salmonelosis en galpones avícolas',
        fuenteGeneradora: 'Contacto con aves y sus secreciones',
        actividadAsociada: 'Manejo de ponedoras, pollos de engorde, pavos',
        riesgoPotencial: 'Influenza aviar H5N1, salmonelosis',
        efectosPosibles: 'Enfermedad respiratoria grave, gastroenteritis',
        medidasControl: ['Bioseguridad estricta de galpón', 'Mascarilla N95', 'Guantes', 'Vigilancia epidemiológica activa']
      },
      {
        codigo: 'FIS-004',
        nombre: 'Polvo orgánico y amoniaco en galpones avícolas',
        categoria: 'Físico',
        descripcion: 'Alta concentración de polvo y amoniaco en galpones',
        fuenteGeneradora: 'Cama de pollos, heces, plumas en suspensión',
        actividadAsociada: 'Trabajo diario en galpones',
        riesgoPotencial: 'Enfermedades respiratorias ocupacionales',
        efectosPosibles: 'Bronquitis crónica, asma ocupacional',
        medidasControl: ['Mascarilla con filtro orgánico', 'Ventilación adecuada del galpón', 'Humidificación del piso', 'Espirometrías periódicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla N95 o respirador', 'Guantes', 'Overol Tyvek', 'Botas', 'Gafas de protección'],
    capacitacionesObligatorias: ['Zoonosis avícola', 'Bioseguridad avícola', 'Riesgos por polvo orgánico', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0149',
    descripcionCIIU: 'Cría de otros animales n.c.p.',
    sector: 'Pecuario',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-002',
        nombre: 'Zoonosis en fauna diversa',
        categoria: 'Biológico',
        descripcion: 'Riesgo de transmisión de enfermedades en cría de abejas, camarones, peces, cuyes',
        fuenteGeneradora: 'Contacto con animales diversos',
        actividadAsociada: 'Manejo, alimentación y cosecha de animales',
        riesgoPotencial: 'Zoonosis específicas según especie, picaduras/mordeduras',
        efectosPosibles: 'Enfermedades infecciosas, reacciones alérgicas',
        medidasControl: ['EPP específico por especie', 'Capacitación en zoonosis', 'Vigilancia médica', 'Vacunación según exposición']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes', 'Overol', 'Calzado adecuado', 'Mascarilla'],
    capacitacionesObligatorias: ['Zoonosis y bioseguridad', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0150',
    descripcionCIIU: 'Explotación mixta (agrícola y pecuaria)',
    sector: 'Agropecuario',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Múltiples exposiciones químicas y biológicas combinadas',
        categoria: 'Químico',
        descripcion: 'Exposición simultánea a agroquímicos y agentes biológicos en fincas mixtas',
        fuenteGeneradora: 'Actividades agrícolas y pecuarias combinadas',
        actividadAsociada: 'Labores agropecuarias diversas en la misma unidad',
        riesgoPotencial: 'Exposición múltiple y sinérgica a tóxicos y patógenos',
        efectosPosibles: 'Efectos combinados de toxicidad química y biológica',
        medidasControl: ['Identificación de riesgos por área', 'EPP diferenciado por actividad', 'Higiene al cambiar de actividad', 'SG-SST estructurado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true },
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['EPP completo diferenciado por actividad', 'Botas de caucho', 'Guantes', 'Mascarilla'],
    capacitacionesObligatorias: ['Riesgos agropecuarios combinados', 'Manejo de agroquímicos', 'Zoonosis', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0161',
    descripcionCIIU: 'Actividades de apoyo a la agricultura',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a agroquímicos en servicios de fumigación',
        categoria: 'Químico',
        descripcion: 'Servicios de fumigación, preparación de suelos y asistencia técnica agropecuaria',
        fuenteGeneradora: 'Servicios de soporte a agricultores',
        actividadAsociada: 'Fumigación, análisis de suelos, asistencia técnica',
        riesgoPotencial: 'Intoxicación por plaguicidas en aplicadores',
        efectosPosibles: 'Toxicidad aguda y crónica por agroquímicos',
        medidasControl: ['EPP especializado', 'Certificación de aplicadores', 'Hojas de datos de seguridad', 'Monitoreo biológico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Plaguicidas', obligatorio: true }
    ],
    eppRecomendado: ['Traje de fumigación', 'Respirador con filtros', 'Guantes de nitrilo', 'Gafas herméticas', 'Botas impermeables'],
    capacitacionesObligatorias: ['Aplicación segura de plaguicidas', 'Certificación de fumigadores', 'Primeros auxilios - intoxicación']
  },
  {
    codigoCIIU: '0162',
    descripcionCIIU: 'Actividades de apoyo a la ganadería',
    sector: 'Pecuario',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-002',
        nombre: 'Zoonosis en servicios veterinarios de campo',
        categoria: 'Biológico',
        descripcion: 'Riesgo de zoonosis en herrado, inseminación artificial, sanidad animal',
        fuenteGeneradora: 'Trabajo directo con animales y fluidos',
        actividadAsociada: 'Inseminación, palpación, herrado, vacunación',
        riesgoPotencial: 'Brucelosis, leptospirosis, rabia',
        efectosPosibles: 'Enfermedades infecciosas crónicas',
        medidasControl: ['Guantes dobles en maniobras invasivas', 'Vacunación antirrábica', 'Higiene y desinfección de instrumental', 'Vigilancia médica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes veterinarios', 'Overol impermeable', 'Botas de caucho', 'Mascarilla'],
    capacitacionesObligatorias: ['Zoonosis en servicios veterinarios', 'Manejo seguro de animales', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0163',
    descripcionCIIU: 'Actividades posteriores a la cosecha',
    sector: 'Agricultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-MEC-001',
        nombre: 'Movimientos repetitivos en postcosecha',
        categoria: 'Biomecánico',
        descripcion: 'Clasificación, empaque y almacenamiento de productos agrícolas',
        fuenteGeneradora: 'Líneas de clasificación y empaque manual',
        actividadAsociada: 'Lavado, clasificación, empaque de frutas y hortalizas',
        riesgoPotencial: 'Desórdenes musculoesqueléticos',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis',
        medidasControl: ['Rotación de puestos', 'Herramientas ergonómicas', 'Pausas activas', 'Asientos ergonómicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Delantal', 'Botas antideslizantes', 'Soporte lumbar'],
    capacitacionesObligatorias: ['Ergonomía en postcosecha', 'Higiene en manejo de alimentos', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0164',
    descripcionCIIU: 'Tratamiento de semillas para propagación',
    sector: 'Agricultura',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a curasemillas (fungicidas+insecticidas)',
        categoria: 'Químico',
        descripcion: 'Tratamiento químico de semillas con curasemillas sistémicos y colorantes tóxicos',
        fuenteGeneradora: 'Maquinaria de curado de semillas',
        actividadAsociada: 'Curado y tratamiento de semillas antes de distribución',
        riesgoPotencial: 'Intoxicación por curasemillas sistémicos',
        efectosPosibles: 'Toxicidad neurológica, afectaciones dérmicas',
        medidasControl: ['EPP completo', 'Ventilación en sala de curado', 'Procedimientos escritos', 'Etiquetado correcto de semillas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1843-1991', norma: 'Decreto 1843/1991', descripcion: 'Manejo de plaguicidas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Respirador con filtro químico', 'Overol', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Manejo de curasemillas', 'Primeros auxilios - intoxicación']
  },
  {
    codigoCIIU: '0170',
    descripcionCIIU: 'Caza ordinaria y mediante trampas y actividades de servicios conexas',
    sector: 'Caza y fauna',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Riesgos por uso de armas y trampas',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Manejo de armas de fuego, trampas y equipos de captura',
        fuenteGeneradora: 'Uso de armas y dispositivos de captura',
        actividadAsociada: 'Caza legal y captura de fauna',
        riesgoPotencial: 'Accidente por armas, heridas por trampas',
        efectosPosibles: 'Heridas de bala, amputaciones, traumatismos',
        medidasControl: ['Capacitación en manejo de armas', 'Permisos legales vigentes', 'Normas de seguridad en campo', 'Nunca apuntar hacia personas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Botas resistentes', 'Guantes de protección', 'Casco', 'Chaleco de caza'],
    capacitacionesObligatorias: ['Manejo seguro de armas', 'Normativa de caza', 'Primeros auxilios en campo']
  },
  {
    codigoCIIU: '0210',
    descripcionCIIU: 'Silvicultura y otras actividades forestales',
    sector: 'Forestal',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Caída de árboles y ramas en trabajo forestal',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Trabajo en bosques con riesgo de impacto por material forestal',
        fuenteGeneradora: 'Tala, poda y manejo de bosques',
        actividadAsociada: 'Plantación, mantenimiento y aprovechamiento forestal',
        riesgoPotencial: 'Aplastamiento por árbol o rama caída',
        efectosPosibles: 'Aplastamiento, fractura, muerte',
        medidasControl: ['Evaluación previa de árboles peligrosos', 'Zonas de exclusión', 'Casco forestal', 'Procedimientos de tala segura']
      },
      {
        codigo: 'NAT-001',
        nombre: 'Animales peligrosos en bosque',
        categoria: 'Natural',
        descripcion: 'Encuentro con serpientes, avispas, arañas en trabajo forestal',
        fuenteGeneradora: 'Trabajo en áreas forestales',
        actividadAsociada: 'Labores en bosques naturales y plantaciones',
        riesgoPotencial: 'Mordedura de serpiente, picadura de insectos',
        efectosPosibles: 'Envenenamiento, reacción anafiláctica',
        medidasControl: ['Botas forestales de media caña', 'Suero antiofídico disponible', 'Capacitación en fauna peligrosa', 'Sistema de comunicación en campo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco forestal con visera', 'Botas de cuero media caña', 'Guantes de cuero', 'Pantalón anticorte', 'Overol de alta visibilidad'],
    capacitacionesObligatorias: ['Tala segura de árboles', 'Fauna peligrosa en bosques', 'Primeros auxilios en campo remoto', 'Uso seguro de motosierra']
  },
  {
    codigoCIIU: '0220',
    descripcionCIIU: 'Extracción de madera',
    sector: 'Forestal',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Tala y extracción de madera con motosierra',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Peligros múltiples en aprovechamiento forestal: motosierra, caída de árboles, arrastre de trozas',
        fuenteGeneradora: 'Motosierra, cable de arrastre, maquinaria forestal',
        actividadAsociada: 'Tala, troceo, extracción y apilado de madera',
        riesgoPotencial: 'Contacto con motosierra, aplastamiento por trozas',
        efectosPosibles: 'Amputaciones, aplastamiento, muerte',
        medidasControl: ['Pantalón anticorte Nivel 2', 'Casco integral forestal', 'Procedimiento escrito de tala', 'Nunca trabajar solo', 'Revisión diaria de motosierra']
      },
      {
        codigo: 'FIS-003',
        nombre: 'Vibración mano-brazo por motosierra',
        categoria: 'Físico',
        descripcion: 'Vibración mano-brazo por uso prolongado de motosierra',
        fuenteGeneradora: 'Motosierra en operación',
        actividadAsociada: 'Corte y troceo de madera',
        riesgoPotencial: 'Síndrome de vibración mano-brazo',
        efectosPosibles: 'Fenómeno de Raynaud, neuropatía periférica',
        medidasControl: ['Límite de exposición diaria (2.5 m/s²)', 'Guantes antivibratorios', 'Pausas programadas', 'Vigilancia médica neurológica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco forestal', 'Pantalón anticorte', 'Botas forestales punta de acero', 'Guantes antivibratorios', 'Protección auditiva', 'Gafas de protección'],
    capacitacionesObligatorias: ['Operación segura de motosierra', 'Técnica de tala dirigida', 'Primeros auxilios en campo', 'Mantenimiento de motosierra']
  },
  {
    codigoCIIU: '0230',
    descripcionCIIU: 'Recolección de productos forestales diferentes a la madera',
    sector: 'Forestal',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'NAT-001',
        nombre: 'Fauna peligrosa en recolección forestal',
        categoria: 'Natural',
        descripcion: 'Exposición a serpientes, arañas e insectos durante recolección de resinas y frutos forestales',
        fuenteGeneradora: 'Trabajo en bosques y selvas',
        actividadAsociada: 'Recolección de látex, resinas, frutos, semillas y hongos',
        riesgoPotencial: 'Mordedura de serpiente venenosa, picadura de artrópodos',
        efectosPosibles: 'Envenenamiento, anafilaxia',
        medidasControl: ['Botas forestales altas', 'Suero antiofídico disponible', 'Comunicación en campo', 'Capacitación en fauna peligrosa']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Botas forestales altas', 'Guantes de cuero', 'Sombrero', 'Overol de manga larga'],
    capacitacionesObligatorias: ['Fauna peligrosa', 'Uso de suero antiofídico', 'Primeros auxilios en campo remoto']
  },
  {
    codigoCIIU: '0240',
    descripcionCIIU: 'Servicios de apoyo a la silvicultura',
    sector: 'Forestal',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Riesgos en trabajos forestales de apoyo',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Inventarios forestales, control de incendios, podas en bosques',
        fuenteGeneradora: 'Trabajo con herramientas en campo forestal',
        actividadAsociada: 'Inventarios, podas, control de incendios forestales',
        riesgoPotencial: 'Caída en terreno irregular, contacto con herramientas, quemaduras',
        efectosPosibles: 'Fracturas, laceraciones, quemaduras por incendio forestal',
        medidasControl: ['EPP según actividad', 'Capacitación en combate de incendios', 'Comunicación constante', 'Plan de emergencia forestal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Casco forestal', 'Botas forestales', 'Guantes', 'Ropa ignífuga para control de incendios', 'Radio de comunicación'],
    capacitacionesObligatorias: ['Seguridad forestal', 'Control de incendios forestales', 'Primeros auxilios']
  },
  {
    codigoCIIU: '0312',
    descripcionCIIU: 'Pesca de agua dulce',
    sector: 'Pesca',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Ahogamiento en ríos y lagos',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Riesgo de caída al agua en embarcaciones fluviales durante actividades de pesca',
        fuenteGeneradora: 'Embarcaciones fluviales en ríos y embalses',
        actividadAsociada: 'Pesca artesanal e industrial en agua dulce',
        riesgoPotencial: 'Ahogamiento, hipotermia',
        efectosPosibles: 'Muerte por ahogamiento',
        medidasControl: ['Chaleco salvavidas obligatorio', 'No trabajar solo en embarcación', 'Capacitación en seguridad acuática', 'Embarcaciones con capacidad adecuada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas certificado', 'Botas de caucho', 'Guantes de trabajo', 'Sombrero'],
    capacitacionesObligatorias: ['Seguridad acuática y nado', 'Manejo de embarcaciones', 'Primeros auxilios acuáticos']
  },
  {
    codigoCIIU: '0321',
    descripcionCIIU: 'Acuicultura marítima',
    sector: 'Acuicultura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'SEG-001',
        nombre: 'Trabajo en mar abierto en acuicultura',
        categoria: 'Condiciones de seguridad',
        descripcion: 'Riesgos de ahogamiento y condiciones climáticas adversas en cultivos marinos',
        fuenteGeneradora: 'Jaulas y cultivos en mar abierto',
        actividadAsociada: 'Mantenimiento de jaulas, alimentación de peces marinos',
        riesgoPotencial: 'Ahogamiento, hipotermia, accidente en embarcación',
        efectosPosibles: 'Muerte por ahogamiento, traumatismos',
        medidasControl: ['Chaleco salvavidas', 'Traje de agua fría', 'Plan de emergencia marítima', 'Formación en supervivencia marítima']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas', 'Traje impermeable', 'Botas impermeables', 'Guantes impermeables'],
    capacitacionesObligatorias: ['Seguridad marítima', 'Supervivencia en agua', 'Primeros auxilios acuáticos']
  },
  {
    codigoCIIU: '0322',
    descripcionCIIU: 'Acuicultura de agua dulce',
    sector: 'Acuicultura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'BIO-001',
        nombre: 'Patógenos acuáticos en estanques piscícolas',
        categoria: 'Biológico',
        descripcion: 'Contacto con agua y peces en estanques con posibles patógenos',
        fuenteGeneradora: 'Manejo de estanques y peces en acuicultura',
        actividadAsociada: 'Alimentación, cosecha y mantenimiento de estanques',
        riesgoPotencial: 'Leptospirosis, dermatitis por agua',
        efectosPosibles: 'Infecciones cutáneas, leptospirosis',
        medidasControl: ['Botas de caucho altas', 'Guantes impermeables', 'Higiene post-exposición al agua', 'Vacunación contra leptospirosis']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Botas de caucho altas', 'Guantes impermeables', 'Overol impermeable'],
    capacitacionesObligatorias: ['Leptospirosis y enfermedades acuáticas', 'Seguridad en estanques', 'Primeros auxilios']
  },


  // ==================== SECCIÓN C - MANUFACTURA (CÓDIGOS FALTANTES) ====================

  {
    codigoCIIU: '2029',
    descripcionCIIU: 'Fabricación de otros productos químicos n.c.p.',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a sustancias químicas diversas',
        categoria: 'Químico',
        descripcion: 'Contacto con productos químicos de diversa naturaleza durante procesos de fabricación',
        fuenteGeneradora: 'Reactivos, solventes, catalizadores y productos intermedios',
        actividadAsociada: 'Síntesis química, mezcla y envasado de productos',
        riesgoPotencial: 'Intoxicación, quemaduras químicas, sensibilización',
        efectosPosibles: 'Dermatitis, enfermedades respiratorias, daño orgánico',
        medidasControl: ['Sustitución de sustancias peligrosas', 'Sistemas de ventilación local', 'EPP químico especializado', 'Fichas de seguridad (SDS)']
      },
      {
        codigo: 'INC-001',
        nombre: 'Riesgo de incendio y explosión',
        categoria: 'Físico',
        descripcion: 'Presencia de materiales inflamables y reactivos en procesos de manufactura química',
        fuenteGeneradora: 'Solventes inflamables, gases y polvos combustibles',
        actividadAsociada: 'Almacenamiento y manejo de materias primas y productos terminados',
        riesgoPotencial: 'Incendio, explosión, quemaduras graves',
        efectosPosibles: 'Lesiones por quemadura, pérdidas materiales, fatalidad',
        medidasControl: ['Sistemas contra incendios', 'Almacenamiento seguro de inflamables', 'Control de fuentes de ignición', 'Plan de emergencia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares Mínimos del SG-SST para industria química', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único del sector trabajo', obligatorio: true }
    ],
    eppRecomendado: ['Respirador con filtros para vapores orgánicos', 'Guantes de nitrilo', 'Gafas de seguridad', 'Traje de protección química', 'Botas con punta de acero'],
    capacitacionesObligatorias: ['Manejo seguro de sustancias químicas', 'Uso correcto de EPP', 'Plan de emergencia y evacuación', 'Primeros auxilios en accidentes químicos']
  },
  {
    codigoCIIU: '2030',
    descripcionCIIU: 'Fabricación de fibras sintéticas y artificiales',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a monómeros y solventes',
        categoria: 'Químico',
        descripcion: 'Inhalación y contacto con compuestos químicos usados en síntesis de fibras',
        fuenteGeneradora: 'Monómeros, catalizadores, solventes y lubricantes de hilatura',
        actividadAsociada: 'Polimerización, hilatura, estirado y texturizado de fibras',
        riesgoPotencial: 'Intoxicación, sensibilización respiratoria y dérmica',
        efectosPosibles: 'Asma ocupacional, dermatitis, daño hepático y renal',
        medidasControl: ['Ventilación industrial en cabinas de hilatura', 'Monitoreo de COV en ambiente', 'EPP de vías respiratorias y dérmico', 'Sustitución de monómeros peligrosos']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Carga física en operación de maquinaria',
        categoria: 'Ergonómico',
        descripcion: 'Posturas forzadas y movimientos repetitivos en operación de telares y bobinadoras',
        fuenteGeneradora: 'Maquinaria de hilatura, bobinado y estirado',
        actividadAsociada: 'Operación continua de equipos de producción de fibra',
        riesgoPotencial: 'Lesiones músculo-esqueléticas',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis, dorsalgia',
        medidasControl: ['Rotación de puestos de trabajo', 'Pausas activas', 'Diseño ergonómico de puestos', 'Capacitación en higiene postural']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'GTC-45', norma: 'GTC 45:2012', descripcion: 'Guía para identificación de peligros en manufactura', obligatorio: false }
    ],
    eppRecomendado: ['Protección respiratoria para vapores', 'Guantes de nitrilo', 'Gafas de seguridad', 'Calzado de seguridad', 'Tapa oídos (ruido de maquinaria)'],
    capacitacionesObligatorias: ['Higiene industrial en manufactura textil', 'Ergonomía y prevención de lesiones', 'Uso y mantenimiento de EPP']
  },
  {
    codigoCIIU: '2211',
    descripcionCIIU: 'Fabricación de llantas y neumáticos de caucho',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a negro de humo y compuestos de azufre',
        categoria: 'Químico',
        descripcion: 'Inhalación de partículas y vapores generados en vulcanización y mezclado de caucho',
        fuenteGeneradora: 'Negro de humo, acelerantes, azufre y plastificantes',
        actividadAsociada: 'Mezclado, vulcanización y acabado de neumáticos',
        riesgoPotencial: 'Neumoconiosis, cáncer de pulmón, dermatitis',
        efectosPosibles: 'Enfermedades respiratorias crónicas, sensibilización, daño pulmonar',
        medidasControl: ['Captación en fuente de humos de vulcanización', 'Monitoreo continuo de material particulado', 'EPP respiratorio con filtros P100', 'Vigilancia epidemiológica respiratoria']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a altas temperaturas',
        categoria: 'Físico',
        descripcion: 'Calor radiante y convectivo en hornos de vulcanización',
        fuenteGeneradora: 'Prensas de vulcanización, hornos y autoclaves',
        actividadAsociada: 'Vulcanización y curado de neumáticos',
        riesgoPotencial: 'Estrés térmico, golpe de calor',
        efectosPosibles: 'Fatiga térmica, deshidratación, colapso por calor',
        medidasControl: ['Barreras térmicas y aislamiento', 'Rotación en áreas calientes', 'Hidratación adecuada', 'Monitoreo de temperatura corporal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST para manufactura de caucho', obligatorio: true },
      { codigo: 'GTC-45', norma: 'GTC 45:2012', descripcion: 'Identificación de peligros en procesos industriales', obligatorio: false }
    ],
    eppRecomendado: ['Respirador con filtros P100', 'Guantes de caucho resistente a calor', 'Gafas de seguridad', 'Mandil de cuero', 'Botas de seguridad con suela antideslizante'],
    capacitacionesObligatorias: ['Riesgos en industria del caucho', 'Control de exposición a sustancias químicas', 'Estrés térmico y medidas preventivas']
  },
  {
    codigoCIIU: '2212',
    descripcionCIIU: 'Reencauche de llantas usadas',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos mecánicos en raspado y preparación',
        categoria: 'Mecánico',
        descripcion: 'Contacto con equipos de raspado, bufado y prensas durante el proceso de reencauche',
        fuenteGeneradora: 'Raspadoras, bufadoras, prensas de reencauche',
        actividadAsociada: 'Preparación de carcasa, aplicación de caucho y vulcanización',
        riesgoPotencial: 'Atrapamiento, cortes, amputación',
        efectosPosibles: 'Lesiones graves en manos y extremidades',
        medidasControl: ['Guardas de seguridad en maquinaria', 'Procedimientos de bloqueo LOTO', 'Capacitación en operación segura', 'Mantenimiento preventivo de equipos']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a vapores de caucho y solventes',
        categoria: 'Químico',
        descripcion: 'Inhalación de vapores generados en bufado y vulcanización de caucho',
        fuenteGeneradora: 'Caucho raspado, solventes de pegamento y vulcanizadora',
        actividadAsociada: 'Bufado, cementado y vulcanización de llantas',
        riesgoPotencial: 'Intoxicación por inhalación, dermatitis',
        efectosPosibles: 'Irritación de vías respiratorias, sensibilización química',
        medidasControl: ['Ventilación localizada en áreas de bufado', 'EPP respiratorio', 'Fichas de datos de seguridad disponibles', 'Monitoreo de higiene industrial']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos del SG-SST', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único del sector trabajo', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo grueso', 'Careta de protección facial', 'Delantal de cuero', 'Botas de seguridad'],
    capacitacionesObligatorias: ['Operación segura de maquinaria de reencauche', 'Manejo de sustancias químicas', 'Bloqueo y etiquetado LOTO']
  },
  {
    codigoCIIU: '2221',
    descripcionCIIU: 'Fabricación de formas básicas de plástico',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a vapores de plásticos fundidos',
        categoria: 'Químico',
        descripcion: 'Inhalación de gases y vapores generados durante extrusión, inyección y moldeo de plásticos',
        fuenteGeneradora: 'Extrusoras, inyectoras y prensas de moldeo',
        actividadAsociada: 'Extrusión, inyección, termoformado y calandrado de plásticos',
        riesgoPotencial: 'Intoxicación por COV, sensibilización respiratoria',
        efectosPosibles: 'Irritación de vías respiratorias, náuseas, cefalea',
        medidasControl: ['Ventilación general y localizada', 'Monitoreo de COV en ambiente', 'Uso de polímeros con menor toxicidad', 'Vigilancia médica periódica']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a altas temperaturas en moldeo',
        categoria: 'Físico',
        descripcion: 'Contacto con superficies calientes y proyección de plástico fundido',
        fuenteGeneradora: 'Extrusoras, cabezales de extrusión, moldes calientes',
        actividadAsociada: 'Operación de maquinaria de transformación de plásticos',
        riesgoPotencial: 'Quemaduras por contacto o salpicadura',
        efectosPosibles: 'Quemaduras de primero y segundo grado',
        medidasControl: ['Guantes resistentes al calor', 'Pantallas de protección en máquinas', 'Señalización de superficies calientes', 'Procedimientos seguros de operación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST manufactura', obligatorio: true },
      { codigo: 'GTC-45', norma: 'GTC 45:2012', descripcion: 'Guía para identificación de peligros', obligatorio: false }
    ],
    eppRecomendado: ['Mascarilla con filtros para vapores', 'Guantes resistentes al calor', 'Gafas de seguridad', 'Mandil de protección térmica', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Riesgos en transformación de plásticos', 'Control de exposición a vapores químicos', 'Operación segura de extrusoras e inyectoras']
  },
  {
    codigoCIIU: '2229',
    descripcionCIIU: 'Fabricación de artículos de plástico n.c.p.',
    sector: 'Manufactura',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Movimientos repetitivos en producción',
        categoria: 'Ergonómico',
        descripcion: 'Tareas manuales repetitivas en ensamble, inspección y empaque de artículos plásticos',
        fuenteGeneradora: 'Líneas de producción y ensamble manual',
        actividadAsociada: 'Ensamble, rebabeo, inspección y empaque de productos plásticos',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por repetitividad',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Análisis ergonómico de puestos', 'Rotación de tareas', 'Pausas activas periódicas', 'Herramientas con diseño ergonómico']
      },
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en maquinaria de corte y moldeo',
        categoria: 'Mecánico',
        descripcion: 'Contacto con partes móviles de maquinaria de corte, troquelado y moldeo',
        fuenteGeneradora: 'Troqueladoras, cortadoras, prensas y robots industriales',
        actividadAsociada: 'Troquelado, corte y moldeo de piezas plásticas',
        riesgoPotencial: 'Cortes, atrapamientos, aplastamiento',
        efectosPosibles: 'Heridas graves en manos y extremidades',
        medidasControl: ['Guardas y resguardos en maquinaria', 'Sistema LOTO para mantenimiento', 'Señalización de riesgos mecánicos', 'Capacitación en operación segura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único del sector trabajo', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Gafas de seguridad', 'Calzado de seguridad', 'Mascarilla desechable para partículas'],
    capacitacionesObligatorias: ['Ergonomía en puestos de trabajo', 'Seguridad en operación de maquinaria', 'Prevención de lesiones músculo-esqueléticas']
  },
  {
    codigoCIIU: '2432',
    descripcionCIIU: 'Fundición de metales no ferrosos',
    sector: 'Manufactura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a humos metálicos y gases de fundición',
        categoria: 'Químico',
        descripcion: 'Inhalación de humos metálicos tóxicos generados en fusión y colada de aluminio, cobre, zinc y otros metales',
        fuenteGeneradora: 'Hornos de fusión, cubilotes, crisoles y áreas de colada',
        actividadAsociada: 'Fusión, colada, moldeo y acabado de metales no ferrosos',
        riesgoPotencial: 'Fiebre de humos metálicos, intoxicación por plomo o cadmio',
        efectosPosibles: 'Daño pulmonar, daño renal, intoxicación por metales pesados',
        medidasControl: ['Extracción localizada de humos', 'Monitoreo de metales en sangre', 'EPP respiratorio con filtros para metales', 'Ventilación forzada en áreas de colada']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a calor extremo y metal fundido',
        categoria: 'Físico',
        descripcion: 'Exposición a temperaturas superiores a 700°C y proyecciones de metal fundido',
        fuenteGeneradora: 'Hornos de fundición, crisoles y canales de colada',
        actividadAsociada: 'Colada, vaciado y desmoldeo de piezas',
        riesgoPotencial: 'Quemaduras graves, golpe de calor, estrés térmico severo',
        efectosPosibles: 'Quemaduras de tercer grado, colapso por calor',
        medidasControl: ['Ropa de protección aluminizada', 'Careta de fundidor', 'Rotación en puestos de alto calor', 'Monitoreo de temperatura corporal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST para fundición', obligatorio: true },
      { codigo: 'Res. 2400/1979', norma: 'Resolución 2400 de 1979', descripcion: 'Estatuto de Seguridad Industrial - condiciones de calor', obligatorio: true }
    ],
    eppRecomendado: ['Traje aluminizado de fundidor', 'Careta de fundidor con visor térmico', 'Guantes de horno', 'Polainas de cuero', 'Respirador con filtros para humos metálicos'],
    capacitacionesObligatorias: ['Seguridad en fundición de metales', 'Control de exposición a humos metálicos', 'Manejo de metal fundido y emergencias', 'Estrés térmico en trabajos con calor extremo']
  },
  {
    codigoCIIU: '2513',
    descripcionCIIU: 'Fabricación de generadores de vapor, excepto calderas de agua caliente',
    sector: 'Manufactura',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en soldadura y trabajo en calderería',
        categoria: 'Mecánico',
        descripcion: 'Riesgos de proyección de chispas, radiaciones y gases en trabajos de soldadura para fabricación de calderas y generadores',
        fuenteGeneradora: 'Equipos de soldadura, corte con plasma y oxicorte',
        actividadAsociada: 'Soldadura, corte, ensamble y prueba de equipos a presión',
        riesgoPotencial: 'Quemaduras, radiación UV, inhalación de humos de soldadura',
        efectosPosibles: 'Oftalmia por arco eléctrico, siderosis, lesiones por proyecciones',
        medidasControl: ['Pantallas de soldadura con filtro adecuado', 'Ventilación en área de soldadura', 'EPP completo para soldador', 'Procedimientos de soldadura certificados']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Riesgo por pruebas hidrostáticas y presión',
        categoria: 'Físico',
        descripcion: 'Peligro de ruptura durante pruebas de presión en calderas y generadores fabricados',
        fuenteGeneradora: 'Equipos sometidos a prueba hidrostática y neumática',
        actividadAsociada: 'Pruebas de presión, inspección y certificación de equipos',
        riesgoPotencial: 'Explosión, proyección de fluidos a presión',
        efectosPosibles: 'Lesiones graves, fatalidades por onda expansiva',
        medidasControl: ['Protocolos de prueba hidrostática certificados', 'Zona de exclusión durante pruebas', 'Válvulas de seguridad calibradas', 'Inspectores certificados ICONTEC']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único sector trabajo', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldador auto-oscurecente', 'Guantes de cuero para soldadura', 'Mandil de cuero', 'Respirador para humos de soldadura', 'Botas de seguridad con puntera metálica'],
    capacitacionesObligatorias: ['Soldadura segura y riesgos asociados', 'Trabajo con equipos a presión', 'Pruebas hidrostáticas - protocolos de seguridad', 'Trabajo en espacios confinados']
  },
  {
    codigoCIIU: '2520',
    descripcionCIIU: 'Fabricación de armas y municiones',
    sector: 'Manufactura',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a plomo y pólvora',
        categoria: 'Químico',
        descripcion: 'Contacto e inhalación de polvo de plomo, nitrocelulosa y compuestos explosivos en fabricación de municiones',
        fuenteGeneradora: 'Fundición de proyectiles, prensado de pólvora y cápsulas de fulminante',
        actividadAsociada: 'Fabricación de cartuchos, cápsulas, espoletas y cargas propulsoras',
        riesgoPotencial: 'Saturnismo, intoxicación por nitrocompuestos, explosión accidental',
        efectosPosibles: 'Daño neurológico por plomo, lesiones graves por explosión',
        medidasControl: ['Sistemas de captación de polvo de plomo', 'Monitoreo biológico de plombemia', 'Controles antiexplosivos certificados', 'Procedimientos de manejo de explosivos según Indumil']
      },
      {
        codigo: 'EXP-001',
        nombre: 'Riesgo de explosión en manufactura de municiones',
        categoria: 'Físico',
        descripcion: 'Posibilidad de detonación accidental durante cargue de propelentes y fulminantes',
        fuenteGeneradora: 'Áreas de cargue de pólvora, prensado de fulminantes y ensamble de munición',
        actividadAsociada: 'Ensamble final, cargue y control de calidad de municiones',
        riesgoPotencial: 'Explosión masiva, onda expansiva, fragmentación',
        efectosPosibles: 'Lesiones graves o fatalidades por explosión',
        medidasControl: ['Edificaciones a prueba de explosión (búnkeres)', 'Protocolos estrictos de manejo de explosivos', 'Límite de personas en zona de riesgo', 'Autorización del INDUMIL y Ejército Nacional']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V', obligatorio: true },
      { codigo: 'Dec. 2535/1993', norma: 'Decreto 2535 de 1993', descripcion: 'Requisitos para tenencia y porte de armas', obligatorio: true }
    ],
    eppRecomendado: ['Traje antiexplosión', 'Visor facial antifragmentación', 'Guantes especiales para explosivos', 'Respirador con filtros para plomo', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Manejo seguro de explosivos y municiones', 'Control de exposición a plomo', 'Procedimientos de emergencia en explosiones', 'Normatividad INDUMIL y Ejército Nacional']
  },
  {
    codigoCIIU: '2680',
    descripcionCIIU: 'Fabricación de medios magnéticos y ópticos para almacenamiento de datos',
    sector: 'Manufactura',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a solventes en recubrimiento de medios',
        categoria: 'Químico',
        descripcion: 'Uso de solventes orgánicos en procesos de recubrimiento magnético y óptico de discos y cintas',
        fuenteGeneradora: 'Recubridoras, bañeras de solvente y cabinas de secado',
        actividadAsociada: 'Recubrimiento magnético, metalizado y lacado de medios de almacenamiento',
        riesgoPotencial: 'Inhalación de vapores de solventes',
        efectosPosibles: 'Irritación respiratoria, cefalea, mareos',
        medidasControl: ['Ventilación en cabinas de recubrimiento', 'Uso de solventes de menor toxicidad', 'Monitoreo de COV', 'EPP respiratorio adecuado']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo en sala limpia con condiciones especiales',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo en salas limpias con restricciones de movimiento, trajes especiales y alta concentración visual',
        fuenteGeneradora: 'Salas limpias de producción de medios ópticos y magnéticos',
        actividadAsociada: 'Manufactura y control de calidad en ambientes controlados',
        riesgoPotencial: 'Fatiga visual, estrés por condiciones de trabajo restrictivas',
        efectosPosibles: 'Fatiga ocular, cefalea, tensión muscular',
        medidasControl: ['Iluminación adecuada en sala limpia', 'Rotación de personal', 'Pausas programadas', 'Evaluación ergonómica del puesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único del sector trabajo', obligatorio: true }
    ],
    eppRecomendado: ['Traje para sala limpia', 'Guantes de látex sin polvo', 'Mascarilla para sala limpia', 'Gafas de protección UV'],
    capacitacionesObligatorias: ['Procedimientos de sala limpia', 'Manejo de solventes industriales', 'Ergonomía en manufactura de precisión']
  },
  {
    codigoCIIU: '2711',
    descripcionCIIU: 'Fabricación de motores, generadores y transformadores eléctricos',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en pruebas de equipos',
        categoria: 'Eléctrico',
        descripcion: 'Exposición a voltajes elevados durante pruebas eléctricas de motores y transformadores fabricados',
        fuenteGeneradora: 'Bancos de prueba de alta tensión, generadores de prueba',
        actividadAsociada: 'Pruebas de rigidez dieléctrica, continuidad y resistencia de aislamiento',
        riesgoPotencial: 'Electrocución, arco eléctrico, quemaduras eléctricas',
        efectosPosibles: 'Paro cardíaco, quemaduras graves, lesiones por arco',
        medidasControl: ['Procedimientos de prueba eléctrica con distancias de seguridad', 'EPP dieléctrico certificado', 'Sistema de bloqueo eléctrico', 'Área de pruebas delimitada y señalizada']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a barnices y solventes de impregnación',
        categoria: 'Químico',
        descripcion: 'Inhalación y contacto con barnices de impregnación de bobinados y solventes asociados',
        fuenteGeneradora: 'Hornos de impregnación, bañeras de barniz y áreas de secado',
        actividadAsociada: 'Bobinado, impregnación y curado de motores y transformadores',
        riesgoPotencial: 'Sensibilización respiratoria y dérmica por barnices',
        efectosPosibles: 'Dermatitis de contacto, irritación respiratoria',
        medidasControl: ['Ventilación en hornos de impregnación', 'Guantes de nitrilo resistentes a solventes', 'Rotación en puestos de impregnación', 'Fichas de seguridad disponibles']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'RETIE', norma: 'Reglamento Técnico de Instalaciones Eléctricas', descripcion: 'Normas de seguridad eléctrica', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos clase apropiada', 'Careta anti-arco eléctrico', 'Ropa de trabajo retardante a la llama', 'Guantes de nitrilo para barnices', 'Calzado dieléctrico'],
    capacitacionesObligatorias: ['Seguridad eléctrica y trabajos con alta tensión', 'Manejo seguro de barnices industriales', 'Bloqueo y etiquetado eléctrico (LOTO)', 'Primeros auxilios en accidentes eléctricos']
  },
  {
    codigoCIIU: '2712',
    descripcionCIIU: 'Fabricación de aparatos de distribución y control de la energía eléctrica',
    sector: 'Manufactura',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en ensamble y prueba de tableros',
        categoria: 'Eléctrico',
        descripcion: 'Exposición a energía eléctrica durante ensamble y prueba de tableros de distribución y control',
        fuenteGeneradora: 'Tableros energizados, bancos de prueba, interruptores y contactores',
        actividadAsociada: 'Ensamble, cableado, prueba y certificación de tableros eléctricos',
        riesgoPotencial: 'Electrocución, arco eléctrico, cortocircuito',
        efectosPosibles: 'Paro cardíaco, quemaduras por arco, politraumatismos',
        medidasControl: ['Trabajo con tensión solo por personal certificado', 'EPP dieléctrico completo', 'Procedimientos de trabajo seguro en tableros', 'Mediciones previas con multímetro']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Carga física en ensamble de tableros',
        categoria: 'Ergonómico',
        descripcion: 'Posturas inadecuadas y esfuerzo físico en ensamble y cableado de tableros eléctricos de gran tamaño',
        fuenteGeneradora: 'Tableros de gran formato, trabajo sobre plataformas y escaleras',
        actividadAsociada: 'Montaje de componentes, cableado y ajuste de tableros',
        riesgoPotencial: 'Lesiones dorsolumbares, caídas desde altura',
        efectosPosibles: 'Hernias discales, esguinces, fracturas por caída',
        medidasControl: ['Equipos de elevación para tableros pesados', 'Plataformas ergonómicas de trabajo', 'Cinturón de soporte lumbar', 'Capacitación en manejo manual de cargas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'RETIE', norma: 'Reglamento Técnico de Instalaciones Eléctricas', descripcion: 'Requisitos de seguridad en fabricación eléctrica', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Careta anti-arco', 'Ropa retardante a la llama', 'Calzado dieléctrico', 'Cinturón de soporte lumbar'],
    capacitacionesObligatorias: ['Seguridad en trabajos eléctricos', 'Trabajo seguro en tableros de distribución', 'Ergonomía en ensamble industrial', 'RETIE y normatividad eléctrica colombiana']
  },

  // ==================== SECCIÓN F - CONSTRUCCIÓN (CÓDIGOS FALTANTES) ====================

  {
    codigoCIIU: '4112',
    descripcionCIIU: 'Construcción de edificios no residenciales',
    sector: 'Construcción',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en estructuras comerciales e industriales',
        categoria: 'Físico',
        descripcion: 'Labores en andamios, encofrados y estructuras de edificios no residenciales de gran altura',
        fuenteGeneradora: 'Andamios tubulares, fachadas, losas y estructuras metálicas en obra',
        actividadAsociada: 'Estructura, mampostería, instalaciones y acabados en edificios comerciales',
        riesgoPotencial: 'Caída desde altura, derrumbe de andamios',
        efectosPosibles: 'Traumatismos graves, fatalidades',
        medidasControl: ['Arnés de cuerpo completo certificado', 'Líneas de vida horizontales y verticales', 'Inspección diaria de andamios', 'Permiso de trabajo en alturas']
      },
      {
        codigo: 'MEC-001',
        nombre: 'Operación de maquinaria pesada de construcción',
        categoria: 'Mecánico',
        descripcion: 'Riesgos por operación de grúas, montacargas, excavadoras y equipos de elevación en obra',
        fuenteGeneradora: 'Grúas torre, montacargas de obra, retroexcavadoras y plumas',
        actividadAsociada: 'Izado de cargas, movimiento de materiales y excavaciones',
        riesgoPotencial: 'Volcamiento de equipos, caída de objetos, atropellamiento',
        efectosPosibles: 'Aplastamiento, lesiones graves, fatalidades',
        medidasControl: ['Operadores de grúa certificados', 'Señalero (rigger) capacitado', 'Zona de exclusión bajo cargas izadas', 'Inspección de equipos de elevación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Requisitos para trabajo seguro en alturas', obligatorio: true },
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST construcción riesgo V', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo', 'Casco de seguridad clase E', 'Botas con puntera metálica', 'Guantes de cuero', 'Gafas de protección', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas - certificación', 'Operación segura de maquinaria de construcción', 'Plan de emergencia en obra', 'Investigación de accidentes de trabajo']
  },
  {
    codigoCIIU: '4220',
    descripcionCIIU: 'Construcción de proyectos de servicio público',
    sector: 'Construcción',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'EXC-001',
        nombre: 'Excavaciones y zanjas para redes de servicios',
        categoria: 'Físico',
        descripcion: 'Trabajo en zanjas profundas para instalación de redes de acueducto, alcantarillado, gas y electricidad',
        fuenteGeneradora: 'Excavaciones a cielo abierto y trincheras para instalación de redes',
        actividadAsociada: 'Instalación de tuberías, ductos y cables de redes de servicio público',
        riesgoPotencial: 'Derrumbe de zanjas, sepultamiento, asfixia en espacios confinados',
        efectosPosibles: 'Aplastamiento, asfixia, fatalidades',
        medidasControl: ['Entibado de zanjas según profundidad', 'Monitoreo de gases en zanjas', 'Protección perimetral con cinta y barreras', 'Permiso de trabajo en espacios confinados']
      },
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico por interferencia de redes',
        categoria: 'Eléctrico',
        descripcion: 'Contacto accidental con cables eléctricos subterráneos o aéreos durante excavaciones',
        fuenteGeneradora: 'Redes eléctricas subterráneas, postes y cables aéreos',
        actividadAsociada: 'Excavación y construcción en zonas con redes de servicios existentes',
        riesgoPotencial: 'Electrocución por contacto con líneas activas',
        efectosPosibles: 'Paro cardíaco, quemaduras eléctricas, fatalidad',
        medidasControl: ['Detección de redes subterráneas antes de excavar', 'Coordinación con empresas de servicios', 'Excavación manual en zonas con redes', 'Señalización y delimitación de redes activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas y espacios confinados', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Chaleco reflectivo de alta visibilidad', 'Botas de seguridad con puntera', 'Guantes de trabajo', 'Detector de gases para espacios confinados'],
    capacitacionesObligatorias: ['Trabajo seguro en excavaciones y zanjas', 'Espacios confinados - entrada y rescate', 'Seguridad vial en obra pública', 'Identificación de redes de servicios públicos']
  },
  {
    codigoCIIU: '4290',
    descripcionCIIU: 'Construcción de otras obras de ingeniería civil',
    sector: 'Construcción',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en altura en puentes y viaductos',
        categoria: 'Físico',
        descripcion: 'Actividades sobre estructuras de puentes, viaductos, represas y obras civiles de gran envergadura',
        fuenteGeneradora: 'Tableros de puentes, pilas, viaductos y estructuras en altura',
        actividadAsociada: 'Construcción de puentes, viaductos, túneles y obras hidráulicas',
        riesgoPotencial: 'Caída desde altura, volcamiento de estructuras temporales',
        efectosPosibles: 'Traumatismos graves, fatalidades',
        medidasControl: ['Sistema de protección contra caídas certificado', 'Andamios colgantes inspeccionados', 'Permiso de trabajo en alturas', 'Plan de rescate en altura']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Factores psicosociales en obras de larga duración',
        categoria: 'Psicosocial',
        descripcion: 'Estrés y fatiga por trabajo en condiciones remotas, lejos del núcleo familiar y con jornadas extendidas',
        fuenteGeneradora: 'Campamentos de obra en zonas alejadas, turnos nocturnos y extendidos',
        actividadAsociada: 'Trabajo en proyectos de infraestructura de larga duración en zonas remotas',
        riesgoPotencial: 'Estrés crónico, agotamiento, conductas de riesgo',
        efectosPosibles: 'Burnout, accidentes por fatiga, problemas de salud mental',
        medidasControl: ['Programas de bienestar para trabajadores en campamentos', 'Rotación periódica para visita familiar', 'Atención psicológica disponible', 'Jornadas de trabajo reguladas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo', 'Casco de seguridad', 'Chaleco reflectivo', 'Botas con puntera y suela antideslizante', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas - certificación', 'Riesgos psicosociales en trabajo en zonas remotas', 'Plan de emergencia en obras de ingeniería civil', 'Primeros auxilios avanzados']
  },
  {
    codigoCIIU: '4311',
    descripcionCIIU: 'Demolición',
    sector: 'Construcción',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'DEM-001',
        nombre: 'Derrumbe y colapso de estructuras en demolición',
        categoria: 'Físico',
        descripcion: 'Riesgo de colapso parcial o total de estructuras durante trabajos de demolición controlada o selectiva',
        fuenteGeneradora: 'Estructuras en demolición, muros portantes, losas y columnas',
        actividadAsociada: 'Demolición manual, mecánica o con explosivos de edificaciones',
        riesgoPotencial: 'Aplastamiento por derrumbe, sepultamiento',
        efectosPosibles: 'Politraumatismos graves, aplastamiento, fatalidades',
        medidasControl: ['Estudio previo de estabilidad estructural', 'Secuencia de demolición técnicamente aprobada', 'Zona de exclusión amplia', 'Supervisión permanente de ingeniero estructural']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a asbesto, plomo y materiales peligrosos',
        categoria: 'Químico',
        descripcion: 'Liberación de asbesto, plomo y otros materiales peligrosos durante demolición de edificaciones antiguas',
        fuenteGeneradora: 'Techos de asbesto-cemento, pinturas con plomo, tuberías de amianto',
        actividadAsociada: 'Demolición de edificaciones con materiales de construcción históricos peligrosos',
        riesgoPotencial: 'Mesotelioma, saturnismo, intoxicación por materiales peligrosos',
        efectosPosibles: 'Enfermedades pulmonares graves, cáncer, daño neurológico',
        medidasControl: ['Identificación previa de materiales peligrosos', 'Remoción de asbesto por empresa certificada', 'EPP de máximo nivel para materiales peligrosos', 'Vigilancia médica específica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V demolición', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo', 'Casco con visera', 'Respirador media cara con filtros P100', 'Traje de protección contra partículas', 'Botas de seguridad reforzadas', 'Guantes anticorte'],
    capacitacionesObligatorias: ['Técnicas seguras de demolición', 'Identificación y manejo de materiales peligrosos en demolición', 'Trabajo seguro en alturas', 'Plan de emergencia en demolición']
  },
  {
    codigoCIIU: '4312',
    descripcionCIIU: 'Preparación del terreno',
    sector: 'Construcción',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Operación de maquinaria de movimiento de tierras',
        categoria: 'Mecánico',
        descripcion: 'Riesgos en operación de buldóceres, motoniveladoras, compactadoras y excavadoras en preparación de terrenos',
        fuenteGeneradora: 'Maquinaria pesada de movimiento de tierras en frentes de obra',
        actividadAsociada: 'Descapote, explanación, compactación y nivelación de terrenos',
        riesgoPotencial: 'Volcamiento de maquinaria, atropellamiento de trabajadores',
        efectosPosibles: 'Aplastamiento, politraumatismos, fatalidades',
        medidasControl: ['Operadores certificados para cada equipo', 'Vigías y señaleros en frentes de obra', 'Revisión pre-operacional diaria', 'Rutas de circulación definidas en obra']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Exposición a polvo en excavaciones y movimiento de tierra',
        categoria: 'Físico',
        descripcion: 'Generación de polvo con sílice en preparación de terrenos, especialmente en suelos arcillosos y arenosos',
        fuenteGeneradora: 'Movimiento de tierras, vías internas de obra sin pavimentar',
        actividadAsociada: 'Explanación, nivelación y compactación de suelos',
        riesgoPotencial: 'Silicosis por exposición crónica a polvo de sílice',
        efectosPosibles: 'Silicosis, fibrosis pulmonar, EPOC',
        medidasControl: ['Riego de vías internas de obra', 'Cabinas cerradas con filtración en maquinaria', 'Monitoreo de polvo en ambiente', 'EPP respiratorio para operadores y peones']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único sector trabajo', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Chaleco reflectivo', 'Mascarilla N95 para polvo', 'Protección auditiva', 'Botas de seguridad', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Operación segura de maquinaria pesada', 'Riesgos por exposición a polvo y sílice', 'Señalización y seguridad vial en obra', 'Investigación de accidentes']
  },
  {
    codigoCIIU: '4329',
    descripcionCIIU: 'Otras instalaciones especializadas',
    sector: 'Construcción',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en instalaciones especializadas',
        categoria: 'Eléctrico',
        descripcion: 'Trabajos eléctricos, de gas, refrigeración y otros sistemas especializados en edificaciones',
        fuenteGeneradora: 'Tableros eléctricos, redes de gas, sistemas HVAC y automatización',
        actividadAsociada: 'Instalación de sistemas eléctricos, HVAC, gas y automatización en edificios',
        riesgoPotencial: 'Electrocución, explosión de gas, caída desde altura',
        efectosPosibles: 'Paro cardíaco, quemaduras, lesiones por caída',
        medidasControl: ['Permisos de trabajo específicos por actividad', 'Coordinación de trabajos simultáneos', 'EPP específico por tipo de instalación', 'Certificación de instaladores']
      },
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas para instalaciones en edificios',
        categoria: 'Físico',
        descripcion: 'Instalación de sistemas especializados en pisos altos, techos y fachadas de edificaciones',
        fuenteGeneradora: 'Andamios, plataformas elevadoras y escaleras en instalación',
        actividadAsociada: 'Instalación de sistemas de climatización, seguridad y automatización en altura',
        riesgoPotencial: 'Caída desde altura, golpe por objetos',
        efectosPosibles: 'Traumatismos, fracturas, fatalidades',
        medidasControl: ['Arnés de cuerpo completo y línea de vida', 'Plataformas elevadoras certificadas', 'Permiso de trabajo en alturas', 'Vigía de seguridad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo', 'Casco de seguridad', 'Guantes dieléctricos', 'Calzado de seguridad', 'Gafas de protección'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas', 'Seguridad eléctrica básica', 'Instalaciones de gas - riesgos y prevención', 'Coordinación de trabajos simultáneos']
  },
  {
    codigoCIIU: '4330',
    descripcionCIIU: 'Terminación y acabado de edificios y obras de ingeniería civil',
    sector: 'Construcción',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a pinturas, solventes y pegantes',
        categoria: 'Químico',
        descripcion: 'Inhalación y contacto dérmico con pinturas, barnices, solventes y adhesivos en trabajos de acabado',
        fuenteGeneradora: 'Pinturas, barnices, solventes de limpieza y adhesivos de instalación',
        actividadAsociada: 'Pintura, barnizado, enchape, instalación de pisos y carpintería',
        riesgoPotencial: 'Intoxicación por solventes, sensibilización química',
        efectosPosibles: 'Daño neurológico, hepatotóxico, dermatitis de contacto',
        medidasControl: ['Ventilación durante trabajos de pintura', 'Uso de pinturas base agua cuando sea posible', 'EPP respiratorio y dérmico', 'Rotación de personal en tareas con alta exposición']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Posturas forzadas en trabajos de acabado',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo en posiciones de rodillas, agachado y con brazos elevados en instalación de enchapes, pisos y cielos rasos',
        fuenteGeneradora: 'Pisos, paredes y cielos rasos en edificaciones',
        actividadAsociada: 'Instalación de cerámicas, madera, estuco, pintura y elementos de acabado',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por posturas forzadas',
        efectosPosibles: 'Lesiones de rodilla, dorsalgia, tendinitis de hombro',
        medidasControl: ['Rodilleras ergonómicas', 'Herramientas con mango largo', 'Plataformas de trabajo ajustables', 'Pausas activas y rotación de tareas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'GTC-45', norma: 'GTC 45:2012', descripcion: 'Guía para identificación de peligros en construcción', obligatorio: false }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores orgánicos', 'Guantes de nitrilo', 'Rodilleras ergonómicas', 'Gafas de seguridad', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Riesgos en trabajos de acabado de construcción', 'Manejo seguro de pinturas y solventes', 'Ergonomía en trabajos de acabado', 'Uso correcto de EPP']
  },
  {
    codigoCIIU: '4390',
    descripcionCIIU: 'Otras actividades especializadas para la construcción de edificios y obras de ingeniería civil',
    sector: 'Construcción',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en actividades especializadas',
        categoria: 'Físico',
        descripcion: 'Actividades de impermeabilización, aislamiento, montaje de fachadas y trabajos en altura de alta especialización',
        fuenteGeneradora: 'Andamios colgantes, plataformas elevadoras y sistemas de acceso por cuerda',
        actividadAsociada: 'Impermeabilización de techos, montaje de fachadas, instalación de vidrios en altura',
        riesgoPotencial: 'Caída desde altura, golpe por objetos',
        efectosPosibles: 'Traumatismos graves, politraumatismos, fatalidades',
        medidasControl: ['Sistema de acceso por cuerda certificado', 'Arnés de cuerpo completo con doble cola', 'Permiso de trabajo en alturas', 'Plan de rescate en altura']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a impermeabilizantes y adhesivos especializados',
        categoria: 'Químico',
        descripcion: 'Contacto con impermeabilizantes bituminosos, resinas epóxicas y solventes en trabajos de especialidad',
        fuenteGeneradora: 'Impermeabilizantes calientes, resinas y solventes especiales',
        actividadAsociada: 'Impermeabilización, aplicación de resinas y tratamientos especiales de superficies',
        riesgoPotencial: 'Quemaduras por materiales calientes, intoxicación',
        efectosPosibles: 'Quemaduras dérmicas, irritación respiratoria crónica',
        medidasControl: ['EPP resistente a altas temperaturas para impermeabilizantes calientes', 'Ventilación en áreas de aplicación', 'Fichas de seguridad accesibles', 'Capacitación específica en materiales de especialidad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas - certificación', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo con doble cola de yoyo', 'Casco con barbiquejo', 'Guantes resistentes a calor y químicos', 'Respirador para vapores orgánicos', 'Botas de seguridad'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas - nivel avanzado', 'Manejo seguro de materiales impermeabilizantes', 'Rescate en altura', 'Primeros auxilios en obra']
  },

  // ==================== SECCIÓN H - TRANSPORTE Y ALMACENAMIENTO (CÓDIGOS FALTANTES) ====================

  {
    codigoCIIU: '4911',
    descripcionCIIU: 'Transporte férreo de pasajeros',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Riesgo de accidente ferroviario',
        categoria: 'Físico',
        descripcion: 'Colisiones, descarrilamientos y accidentes en operación de trenes y metros de pasajeros',
        fuenteGeneradora: 'Material rodante, infraestructura ferroviaria y pasos a nivel',
        actividadAsociada: 'Operación, mantenimiento y control de trenes de pasajeros',
        riesgoPotencial: 'Descarrilamiento, colisión, atropellamiento',
        efectosPosibles: 'Lesiones graves, fatalidades masivas',
        medidasControl: ['Sistema de gestión de seguridad ferroviaria', 'Mantenimiento preventivo de material rodante', 'Control automatizado de tráfico ferroviario', 'Capacitación y certificación de maquinistas']
      },
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en sistemas de tracción',
        categoria: 'Eléctrico',
        descripcion: 'Exposición a alta tensión en sistemas de catenaria, tercer carril y subestaciones eléctricas',
        fuenteGeneradora: 'Catenaria, tercer carril de alta tensión y subestaciones de tracción',
        actividadAsociada: 'Mantenimiento de infraestructura eléctrica ferroviaria',
        riesgoPotencial: 'Electrocución por contacto con sistema de catenaria',
        efectosPosibles: 'Paro cardíaco, quemaduras eléctricas, fatalidad',
        medidasControl: ['Enclavamientos eléctricos de seguridad', 'Ventanas de mantenimiento con línea desenergizada', 'EPP dieléctrico de alta tensión', 'Procedimientos de trabajo en catenaria']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST transporte férreo', obligatorio: true },
      { codigo: 'Dec. 1079/2015', norma: 'Decreto 1079 de 2015', descripcion: 'Reglamento único del sector transporte', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco reflectivo de alta visibilidad', 'Casco de seguridad', 'Guantes dieléctricos', 'Calzado de seguridad', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad ferroviaria y reglamentación de la vía', 'Trabajo seguro en zonas de alta tensión ferroviaria', 'Procedimientos de emergencia ferroviaria', 'Primeros auxilios en accidentes ferroviarios']
  },
  {
    codigoCIIU: '4912',
    descripcionCIIU: 'Transporte férreo de carga',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Accidentes en operación de trenes de carga',
        categoria: 'Físico',
        descripcion: 'Descarrilamientos, colisiones y accidentes en pasos a nivel durante transporte de carga pesada',
        fuenteGeneradora: 'Material rodante de carga, pasos a nivel y maniobras en patio',
        actividadAsociada: 'Conducción, maniobras de clasificación y mantenimiento en patio ferroviario',
        riesgoPotencial: 'Descarrilamiento, aplastamiento en patio, colisión',
        efectosPosibles: 'Lesiones graves, fatalidades, derrames de mercancías peligrosas',
        medidasControl: ['Inspección de material rodante y vía', 'Protocolos de maniobras en patio', 'Señalización ferroviaria en buen estado', 'Capacitación de operadores y señaleros']
      },
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en cargue y descargue de vagones',
        categoria: 'Mecánico',
        descripcion: 'Operación de equipos de cargue, izado y volcado de vagones de tren de carga',
        fuenteGeneradora: 'Grúas portuarias, cargadores, volcadores de vagones',
        actividadAsociada: 'Cargue y descargue de mercancías en terminales ferroviarias',
        riesgoPotencial: 'Caída de carga, aplastamiento, atrapamiento',
        efectosPosibles: 'Lesiones graves por caída de objetos o aplastamiento',
        medidasControl: ['Equipos de cargue certificados', 'Vigías durante maniobras', 'Zona de exclusión durante izado', 'Comunicación efectiva entre operadores']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Dec. 1079/2015', norma: 'Decreto 1079 de 2015', descripcion: 'Reglamento único del sector transporte', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco reflectivo', 'Casco de seguridad', 'Botas con puntera metálica', 'Guantes de trabajo', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad en operaciones ferroviarias de carga', 'Manejo de mercancías peligrosas en tren', 'Maniobras seguras en patio ferroviario', 'Procedimientos de emergencia']
  },
  {
    codigoCIIU: '4922',
    descripcionCIIU: 'Transporte mixto',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Accidentes de tránsito en transporte mixto',
        categoria: 'Físico',
        descripcion: 'Riesgo de accidente de tránsito en vehículos que transportan simultáneamente pasajeros y carga',
        fuenteGeneradora: 'Vehículos de transporte mixto en vías urbanas, intermunicipales y rurales',
        actividadAsociada: 'Conducción de vehículos mixtos, cargue y descargue en ruta',
        riesgoPotencial: 'Colisión, volcamiento, lesión de pasajeros',
        efectosPosibles: 'Lesiones en pasajeros y conductor, fatalidades',
        medidasControl: ['Revisión técnico-mecánica al día', 'Velocidades adecuadas según tipo de vía', 'Prohibición de alcohol y psicoactivos', 'Capacitación en conducción segura']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Fatiga del conductor en rutas mixtas',
        categoria: 'Ergonómico',
        descripcion: 'Cansancio y somnolencia por jornadas extensas de conducción en rutas combinadas de pasajeros y carga',
        fuenteGeneradora: 'Cabina del vehículo, jornadas largas sin descanso adecuado',
        actividadAsociada: 'Conducción prolongada en rutas intermunicipales con paradas frecuentes',
        riesgoPotencial: 'Microsueño, pérdida de control del vehículo',
        efectosPosibles: 'Accidente de tránsito grave, lesiones de pasajeros',
        medidasControl: ['Descansos obligatorios cada 4 horas de conducción', 'Control de jornada de trabajo', 'Rotación de conductores en rutas largas', 'Test de alcoholemia y sustancias psicoactivas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Res. 160/2017', norma: 'Resolución 160 de 2017', descripcion: 'Habilitación de empresas de transporte mixto', obligatorio: true }
    ],
    eppRecomendado: ['Cinturón de seguridad', 'Chaleco reflectivo para descenso del vehículo', 'Extinguidor en el vehículo', 'Kit de carretera'],
    capacitacionesObligatorias: ['Conducción segura y defensiva', 'Manejo del tiempo de descanso', 'Primeros auxilios para conductor', 'Normatividad de transporte mixto en Colombia']
  },
  {
    codigoCIIU: '4930',
    descripcionCIIU: 'Transporte por tuberías',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a hidrocarburos y gases en ductos',
        categoria: 'Químico',
        descripcion: 'Riesgo de escape de petróleo crudo, gas natural u otros fluidos durante operación, inspección y mantenimiento de ductos',
        fuenteGeneradora: 'Oleoductos, gasoductos, poliductos y estaciones de bombeo',
        actividadAsociada: 'Operación, inspección en línea y mantenimiento de redes de ductos',
        riesgoPotencial: 'Intoxicación por gas, incendio por derrame de hidrocarburo',
        efectosPosibles: 'Intoxicación, quemaduras, explosión, daño ambiental',
        medidasControl: ['Detectores de gas fijo y portátil', 'Sistemas SCADA de monitoreo continuo', 'Procedimientos de respuesta a emergencias en ductos', 'Bloqueo y purga antes de trabajos en línea']
      },
      {
        codigo: 'EXP-001',
        nombre: 'Riesgo de explosión e incendio en ductos',
        categoria: 'Físico',
        descripcion: 'Acumulación de gases explosivos en ductos y estaciones de bombeo que pueden detonar con fuentes de ignición',
        fuenteGeneradora: 'Gas natural en gasoductos, vapores de hidrocarburos en oleoductos',
        actividadAsociada: 'Mantenimiento de estaciones de compresión y bombeo, reparación de ductos',
        riesgoPotencial: 'Explosión, incendio masivo, BLEVE',
        efectosPosibles: 'Lesiones graves o fatalidades masivas, daño ambiental catastrófico',
        medidasControl: ['Clasificación de áreas peligrosas y equipos Ex', 'Control de fuentes de ignición', 'Planes de contingencia ante emergencias en ductos', 'Brigada de emergencia especializada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV transporte ductos', obligatorio: true },
      { codigo: 'Dec. 321/1999', norma: 'Decreto 321 de 1999', descripcion: 'Plan Nacional de Contingencia para hidrocarburos', obligatorio: true }
    ],
    eppRecomendado: ['Detector de gases portátil', 'Traje antiestático', 'Respirador para gases hidrocarburo', 'Calzado antiestático', 'Guantes resistentes a hidrocarburos'],
    capacitacionesObligatorias: ['Seguridad en ductos de transporte de hidrocarburos', 'Plan de contingencia para derrames', 'Trabajo en espacios confinados en ductos', 'Clasificación de áreas peligrosas (ATEX/NEC)']
  },
  {
    codigoCIIU: '5011',
    descripcionCIIU: 'Transporte de pasajeros marítimo y de cabotaje',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'MAR-001',
        nombre: 'Riesgo de naufragio y accidente marítimo',
        categoria: 'Físico',
        descripcion: 'Naufragio, colisión o encallamiento de embarcaciones de pasajeros en mar territorial colombiano',
        fuenteGeneradora: 'Embarcaciones de pasajeros en mares, bahías y rutas de cabotaje',
        actividadAsociada: 'Conducción de embarcaciones, atención de pasajeros y mantenimiento a bordo',
        riesgoPotencial: 'Hundimiento, caída al mar, ahogamiento masivo',
        efectosPosibles: 'Lesiones graves, ahogamiento, hipotermia, fatalidades masivas',
        medidasControl: ['Plan de abandono del barco', 'Chalecos salvavidas para todos los pasajeros', 'Botes salvavidas certificados', 'Tripulación entrenada en SOLAS']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Condiciones climáticas extremas en mar',
        categoria: 'Físico',
        descripcion: 'Exposición a tormentas, marejadas y condiciones climáticas adversas durante travesías marítimas',
        fuenteGeneradora: 'Condiciones meteorológicas adversas en mar Caribe y Pacífico colombiano',
        actividadAsociada: 'Operación de embarcaciones de pasajeros en condiciones de mar',
        riesgoPotencial: 'Naufragio, lesiones por golpe de mar, hipotermia',
        efectosPosibles: 'Lesiones por caídas, ahogamiento, hipotermia',
        medidasControl: ['Monitoreo meteorológico permanente', 'Suspensión de travesías con alerta de mar', 'Amarres de seguridad para tripulación', 'Equipos de comunicación de emergencia (EPIRB)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - transporte marítimo', obligatorio: true },
      { codigo: 'Dec. 804/1969', norma: 'Decreto 804 de 1969', descripcion: 'Código de Comercio Marítimo colombiano', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas individual', 'Traje de inmersión para zonas frías', 'Arnés de seguridad a bordo', 'Calzado antideslizante de cubierta', 'Radio portátil de emergencia'],
    capacitacionesObligatorias: ['Seguridad marítima STCW básico', 'Supervivencia en el mar', 'Lucha contra incendios a bordo', 'Procedimientos de abandono del barco']
  },
  {
    codigoCIIU: '5012',
    descripcionCIIU: 'Transporte de carga marítimo y de cabotaje',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en cargue y descargue de buques',
        categoria: 'Mecánico',
        descripcion: 'Operación de grúas pórtico, montacargas y equipos de estiba en puertos marítimos',
        fuenteGeneradora: 'Grúas pórtico, montacargas de muelle, contenedores y bodegas de buque',
        actividadAsociada: 'Operaciones de carga, descarga y estiba de mercancías en buques de carga',
        riesgoPotencial: 'Caída de contenedores, aplastamiento, caída al agua',
        efectosPosibles: 'Aplastamiento, ahogamiento, lesiones graves',
        medidasControl: ['Sistemas de estiba certificados', 'Grúas con certificación de carga segura', 'EPP completo en zona de operaciones portuarias', 'Procedimientos de seguridad portuaria PBIP']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Transporte de mercancías peligrosas por mar',
        categoria: 'Químico',
        descripcion: 'Riesgo de escape o derrame de sustancias peligrosas durante transporte marítimo de carga IMO',
        fuenteGeneradora: 'Contenedores con materiales peligrosos, tanqueros con productos químicos',
        actividadAsociada: 'Transporte y manejo de mercancías peligrosas en buques de carga',
        riesgoPotencial: 'Derrame, incendio, explosión de carga peligrosa',
        efectosPosibles: 'Intoxicación, quemaduras, explosión, contaminación marina',
        medidasControl: ['Declaración y segregación de mercancías peligrosas (IMDG)', 'Planes de contingencia para derrames marítimos', 'Capacitación en manejo de mercancías IMO', 'Equipos de respuesta a emergencias a bordo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Dec. 804/1969', norma: 'Decreto 804 de 1969', descripcion: 'Código de Comercio Marítimo', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas', 'Casco de seguridad', 'Calzado antideslizante de cubierta', 'Guantes de trabajo', 'Arnés de seguridad para alturas en buque'],
    capacitacionesObligatorias: ['Seguridad portuaria PBIP', 'Manejo de mercancías peligrosas marítimas IMDG', 'Supervivencia en el mar y abandono del barco', 'Operación segura de equipos portuarios']
  },
  {
    codigoCIIU: '5021',
    descripcionCIIU: 'Transporte fluvial de pasajeros',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'MAR-001',
        nombre: 'Naufragio y accidente en ríos colombianos',
        categoria: 'Físico',
        descripcion: 'Volcamiento o hundimiento de embarcaciones fluviales por sobrecarga, fallas mecánicas o condiciones climáticas',
        fuenteGeneradora: 'Embarcaciones fluviales en ríos Magdalena, Atrato, Meta y otros ríos colombianos',
        actividadAsociada: 'Conducción de chalupas, lanchas y champanes de pasajeros en ríos',
        riesgoPotencial: 'Volcamiento, ahogamiento de pasajeros',
        efectosPosibles: 'Ahogamiento, hipotermia, lesiones por impacto',
        medidasControl: ['Control de capacidad de carga de embarcaciones', 'Chalecos salvavidas para todos los ocupantes', 'Capacitación de bogas y patrones', 'Inspección periódica de embarcaciones fluviales']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Condiciones de trabajo en ríos remotos',
        categoria: 'Psicosocial',
        descripcion: 'Jornadas extensas en condiciones de aislamiento en ríos de zonas remotas de Colombia',
        fuenteGeneradora: 'Rutas fluviales en zonas de difícil acceso del Amazonas, Orinoquía y Pacífico',
        actividadAsociada: 'Operación de rutas fluviales en zonas remotas del país',
        riesgoPotencial: 'Estrés por aislamiento, fatiga, exposición a vectores de enfermedades tropicales',
        efectosPosibles: 'Burnout, enfermedades tropicales, accidentes por fatiga',
        medidasControl: ['Programas de salud para zonas tropicales', 'Vacunación para enfermedades endémicas', 'Rotación periódica de personal', 'Acceso a atención médica en ruta']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Dec. 1079/2015', norma: 'Decreto 1079 de 2015', descripcion: 'Reglamento único del sector transporte fluvial', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas', 'Protector solar de alta protección', 'Repelente de insectos', 'Impermeable', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Seguridad en transporte fluvial', 'Técnicas de rescate acuático', 'Prevención de enfermedades tropicales', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '5022',
    descripcionCIIU: 'Transporte fluvial de carga',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en operaciones de carga fluvial',
        categoria: 'Mecánico',
        descripcion: 'Cargue y descargue de mercancías en embarcaderos fluviales con equipos manuales y mecánicos',
        fuenteGeneradora: 'Embarcaderos fluviales, barcazas y planchones de carga',
        actividadAsociada: 'Cargue, descargue y estiba de mercancías en transporte fluvial',
        riesgoPotencial: 'Caída al río, aplastamiento por carga, volcamiento de barcaza',
        efectosPosibles: 'Ahogamiento, lesiones por aplastamiento, pérdida de carga',
        medidasControl: ['Chaleco salvavidas obligatorio en operaciones de carga', 'Equipos de cargue con capacidad adecuada', 'Control de peso en barcazas', 'Iluminación adecuada en operaciones nocturnas']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Transporte de productos agroquímicos y combustibles',
        categoria: 'Químico',
        descripcion: 'Riesgo de derrame de agroquímicos, combustibles y otros productos peligrosos en ríos durante transporte',
        fuenteGeneradora: 'Cisternas fluviales con combustible, carga de agroquímicos en sacos',
        actividadAsociada: 'Transporte de insumos agrícolas e industriales por vías fluviales',
        riesgoPotencial: 'Derrame con contaminación de fuentes de agua, incendio',
        efectosPosibles: 'Daño ambiental, incendio de embarcación, intoxicación',
        medidasControl: ['Manifiesto de carga peligrosa fluvial', 'Contenedores herméticos para líquidos', 'Kit de atención a derrames a bordo', 'Coordinación con Autoridad Fluvial']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Dec. 1079/2015', norma: 'Decreto 1079 de 2015', descripcion: 'Regulación transporte fluvial de carga', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas', 'Casco de seguridad', 'Botas antideslizantes de cubierta', 'Guantes de trabajo', 'Impermeable'],
    capacitacionesObligatorias: ['Seguridad en operaciones fluviales de carga', 'Manejo de mercancías peligrosas en transporte fluvial', 'Técnicas de rescate acuático', 'Plan de contingencia para derrames en ríos']
  },
  {
    codigoCIIU: '5112',
    descripcionCIIU: 'Transporte aéreo de carga',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'AER-001',
        nombre: 'Riesgos en rampa aeroportuaria',
        categoria: 'Mecánico',
        descripcion: 'Operación en zona de rampa con aeronaves en movimiento, vehículos de apoyo terrestre y carga peligrosa',
        fuenteGeneradora: 'Aeronaves, vehículos de remolque, montacargas de aeropuerto y bandas transportadoras',
        actividadAsociada: 'Cargue, descargue y manejo de carga aérea en rampa aeroportuaria',
        riesgoPotencial: 'Atropellamiento por vehículo de rampa, ingesta por motor de aeronave, caída',
        efectosPosibles: 'Lesiones graves, amputación, fatalidades',
        medidasControl: ['Procedimientos de seguridad en rampa SMS', 'Chaleco reflectivo de alta visibilidad', 'Protección auditiva obligatoria', 'Entrenamiento específico en seguridad de rampa']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Manejo de mercancías peligrosas IATA',
        categoria: 'Químico',
        descripcion: 'Aceptación, clasificación y manejo de mercancías peligrosas para transporte aéreo según regulación IATA',
        fuenteGeneradora: 'Carga peligrosa: inflamables, corrosivos, explosivos, radioactivos en bodega de aeronave',
        actividadAsociada: 'Recepción, inspección y cargue de mercancías peligrosas en aeronaves de carga',
        riesgoPotencial: 'Incendio en vuelo, derrame de sustancias peligrosas',
        efectosPosibles: 'Emergencia de vuelo, intoxicación del personal, daño a aeronave',
        medidasControl: ['Capacitación IATA en mercancías peligrosas', 'Inspección de declaraciones shipper', 'Segregación correcta en bodega', 'Procedimientos de respuesta a derrames en aeronave']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - transporte aéreo', obligatorio: true },
      { codigo: 'RAC-Part-8', norma: 'Reglamentos Aeronáuticos de Colombia - Parte 8', descripcion: 'Regulación de mercancías peligrosas por vía aérea', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco reflectivo alta visibilidad', 'Protección auditiva (>85 dB en rampa)', 'Casco de seguridad', 'Calzado de seguridad con puntera', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Seguridad operacional en rampa aeroportuaria', 'Mercancías peligrosas IATA - inicial y recurrente', 'SMS aeronáutico', 'Respuesta a emergencias aeronáuticas']
  },
  {
    codigoCIIU: '5121',
    descripcionCIIU: 'Transporte espacial',
    sector: 'Transporte',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'EXP-001',
        nombre: 'Riesgo de explosión en propelentes de cohetes',
        categoria: 'Físico',
        descripcion: 'Manejo de combustibles de cohetes altamente energéticos e hipergólicos en instalaciones de lanzamiento',
        fuenteGeneradora: 'Propelentes de cohete (hidrógeno líquido, hidrazina, LOX)',
        actividadAsociada: 'Carga de propelentes, mantenimiento y lanzamiento de vehículos espaciales',
        riesgoPotencial: 'Explosión masiva, incendio, intoxicación por propelentes tóxicos',
        efectosPosibles: 'Fatalidades masivas, destrucción de instalaciones',
        medidasControl: ['Protocolos de manejo de propelentes de agencia espacial', 'Zonas de exclusión en carga de combustible', 'Equipos de protección especializados', 'Procedimientos de emergencia de instalación de lanzamiento']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a condiciones extremas en vuelo espacial',
        categoria: 'Físico',
        descripcion: 'Exposición a radiación cósmica, microgravedad y condiciones de vacío en operaciones espaciales tripuladas',
        fuenteGeneradora: 'Ambiente espacial exterior a la atmósfera terrestre',
        actividadAsociada: 'Operación de vehículos espaciales tripulados y actividades extravehiculares (EVA)',
        riesgoPotencial: 'Daño por radiación cósmica, barotrauma, descompresión',
        efectosPosibles: 'Enfermedades por radiación, daño neurológico, fatalidad',
        medidasControl: ['Trajes espaciales certificados por agencia espacial', 'Monitoreo médico permanente de astronautas', 'Límites de exposición a radiación cósmica', 'Procedimientos de EVA con double-buddy']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V', obligatorio: true },
      { codigo: 'Dec. 1079/2015', norma: 'Decreto 1079 de 2015', descripcion: 'Marco regulatorio de transporte en Colombia', obligatorio: true }
    ],
    eppRecomendado: ['Traje espacial presurizado', 'Equipo de respiración autónomo en instalaciones de lanzamiento', 'Traje anticontaminación para propelentes', 'Dosímetro de radiación'],
    capacitacionesObligatorias: ['Manejo seguro de propelentes espaciales', 'Procedimientos de emergencia en instalaciones de lanzamiento', 'Protección radiológica en operaciones espaciales', 'Medicina aeroespacial básica']
  },
  {
    codigoCIIU: '5221',
    descripcionCIIU: 'Actividades de estaciones, vías y servicios complementarios para el transporte terrestre',
    sector: 'Transporte',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Riesgo de atropellamiento en estaciones y terminales',
        categoria: 'Físico',
        descripcion: 'Exposición al tráfico vehicular en zonas de embarque y desembarque, patios de maniobras y vías de acceso',
        fuenteGeneradora: 'Vehículos de transporte en maniobra dentro de terminales y estaciones',
        actividadAsociada: 'Control de acceso, orientación de vehículos y atención al usuario en terminales',
        riesgoPotencial: 'Atropellamiento por vehículo pesado',
        efectosPosibles: 'Traumatismos graves, fracturas, fatalidades',
        medidasControl: ['Demarcación de zonas peatonales y vehiculares', 'Chaleco reflectivo para personal de patio', 'Señalización vial interna', 'Velocidades máximas dentro del terminal']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Carga emocional en atención al usuario',
        categoria: 'Psicosocial',
        descripcion: 'Interacción con usuarios en situaciones de tensión, agresividad verbal o conflictos en terminales de transporte',
        fuenteGeneradora: 'Interacción directa con usuarios en situaciones de estrés (retrasos, cancelaciones)',
        actividadAsociada: 'Atención al cliente en terminales, despacho de vehículos y resolución de quejas',
        riesgoPotencial: 'Estrés laboral, agresiones verbales o físicas',
        efectosPosibles: 'Burnout, ansiedad, trastornos de salud mental',
        medidasControl: ['Capacitación en manejo de situaciones conflictivas', 'Protocolos de atención al cliente', 'Apoyo psicológico disponible', 'Rotación de personal en picos de atención']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco reflectivo para personal de patio', 'Calzado cómodo y de seguridad', 'Protección solar para personal exterior'],
    capacitacionesObligatorias: ['Seguridad vial en terminales de transporte', 'Manejo de riesgo psicosocial y estrés laboral', 'Atención al usuario y resolución de conflictos', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '5222',
    descripcionCIIU: 'Actividades de puertos, canales, esclusas, diques y otras instalaciones portuarias',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en operación portuaria',
        categoria: 'Mecánico',
        descripcion: 'Operación de equipos de carga, grúas pórtico, montacargas y vehículos pesados en zona portuaria',
        fuenteGeneradora: 'Grúas pórtico, RTG, reach stacker, tracto-camiones en patio de contenedores',
        actividadAsociada: 'Movimiento de contenedores, carga y descarga de buques en puertos marítimos y fluviales',
        riesgoPotencial: 'Caída de contenedores, atropellamiento, aplastamiento',
        efectosPosibles: 'Lesiones graves, aplastamiento, fatalidades',
        medidasControl: ['Certificación de operadores de equipos portuarios', 'Zonas de exclusión peatonal en patio activo', 'Sistemas de comunicación efectiva en rampa', 'Inspección preoperacional de equipos']
      },
      {
        codigo: 'MAR-001',
        nombre: 'Riesgo de caída al agua en muelles',
        categoria: 'Físico',
        descripcion: 'Caída de trabajadores al mar o río durante operaciones de atraque, maniobras con cabos y trabajos en muelle',
        fuenteGeneradora: 'Borde de muelles, pasarelas de acceso a buques y operaciones de amarre',
        actividadAsociada: 'Maniobras de atraque, desamarre y operaciones en el borde del muelle',
        riesgoPotencial: 'Ahogamiento, hipotermia, lesión por impacto',
        efectosPosibles: 'Ahogamiento, lesiones por compresión entre buque y muelle',
        medidasControl: ['Chalecos salvavidas obligatorios en borde de muelle', 'Aros salvavidas en todo el perímetro', 'Equipos de rescate acuático disponibles', 'Redes de seguridad bajo pasarelas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'Dec. 804/1969', norma: 'Decreto 804 de 1969', descripcion: 'Código de Comercio Marítimo - operaciones portuarias', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco salvavidas en borde de muelle', 'Casco de seguridad', 'Chaleco reflectivo', 'Botas de seguridad antideslizantes', 'Guantes de trabajo'],
    capacitacionesObligatorias: ['Seguridad portuaria PBIP', 'Operación segura de equipos portuarios', 'Rescate acuático en puerto', 'Manejo de mercancías peligrosas portuarias']
  },
  {
    codigoCIIU: '5223',
    descripcionCIIU: 'Actividades de aeropuertos, de servicios de navegación aérea y de las demás actividades conexas al transporte aéreo',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'AER-001',
        nombre: 'Riesgos operacionales en área de movimiento aeroportuario',
        categoria: 'Mecánico',
        descripcion: 'Trabajo en zona de pista, calles de rodaje y plataforma con aeronaves en movimiento',
        fuenteGeneradora: 'Aeronaves en pista y plataforma, vehículos de apoyo terrestre, soplos de motores',
        actividadAsociada: 'Operación de pista, servicios en tierra, mantenimiento de aeronaves y control de FOD',
        riesgoPotencial: 'Ingesta por motor, atropellamiento, colisión, caída de objetos',
        efectosPosibles: 'Lesiones graves, amputación, fatalidades',
        medidasControl: ['Habilitación aeroportuaria y SMS', 'Identificación de pase de seguridad obligatoria', 'Chaleco reflectivo de alta visibilidad', 'Entrenamiento en seguridad aeroportuaria OACI']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a combustible de aviación (Jet-A)',
        categoria: 'Químico',
        descripcion: 'Contacto e inhalación de vapores de combustible Jet-A durante abastecimiento y mantenimiento de aeronaves',
        fuenteGeneradora: 'Camiones cisternas de combustible, hidrantes de abastecimiento',
        actividadAsociada: 'Abastecimiento de combustible a aeronaves y mantenimiento de sistemas de combustible',
        riesgoPotencial: 'Intoxicación por vapores, incendio en abastecimiento',
        efectosPosibles: 'Irritación del sistema nervioso central, incendio',
        medidasControl: ['Procedimientos de abastecimiento con puesta a tierra', 'EPP para manejo de combustible', 'Prohibición de fumar en zona de abastecimiento', 'Detectores de vapores inflamables']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV aeropuertos', obligatorio: true },
      { codigo: 'RAC-14-15', norma: 'RAC Partes 14 y 15', descripcion: 'Aeropuertos y servicios de navegación aérea Colombia', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco reflectivo alta visibilidad clase 3', 'Protección auditiva', 'Casco de seguridad', 'Calzado de seguridad', 'Guantes para combustible'],
    capacitacionesObligatorias: ['Seguridad aeroportuaria - instrucción OACI', 'SMS aeroportuario', 'Manejo de combustible de aviación', 'Respuesta a emergencias aeronáuticas']
  },
  {
    codigoCIIU: '5224',
    descripcionCIIU: 'Manipulación de carga',
    sector: 'Transporte',
    nivelRiesgo: 'IV',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Sobreesfuerzo en manejo manual de carga',
        categoria: 'Ergonómico',
        descripcion: 'Levantamiento, transporte y acomodación manual de cargas pesadas en bodegas y centros de distribución',
        fuenteGeneradora: 'Paquetes, pallets, mercancías de gran peso y volumen',
        actividadAsociada: 'Cargue y descargue manual, alistamiento de pedidos y almacenamiento',
        riesgoPotencial: 'Hernias, lesiones dorsolumbares, lesiones en hombros',
        efectosPosibles: 'Hernia discal, lumbalgia crónica, síndrome de manguito rotador',
        medidasControl: ['Límite de peso manual (25 kg hombres, 12.5 kg mujeres)', 'Herramientas de asistencia: carros, transpaletas', 'Capacitación en manejo manual de cargas', 'Pausas activas y ejercicios de calentamiento']
      },
      {
        codigo: 'MEC-001',
        nombre: 'Riesgo en operación de montacargas',
        categoria: 'Mecánico',
        descripcion: 'Volcamiento de montacargas, atropellamiento de peatones y caída de carga en operación de equipos elevadores',
        fuenteGeneradora: 'Montacargas contrabalanceados, apiladores y transpaletas eléctricas',
        actividadAsociada: 'Movimiento de mercancías paletizadas en bodegas y patios de almacenamiento',
        riesgoPotencial: 'Volcamiento, atropellamiento, aplastamiento por carga',
        efectosPosibles: 'Lesiones graves, aplastamiento, fatalidades',
        medidasControl: ['Licencia de conducción para montacargas', 'Señalización de zonas peatonales y vehiculares', 'Cinturón de seguridad en montacargas', 'Inspección preoperacional diaria']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo IV', obligatorio: true },
      { codigo: 'GTC-45', norma: 'GTC 45:2012', descripcion: 'Guía para identificación de peligros biomecánicos', obligatorio: false }
    ],
    eppRecomendado: ['Faja lumbar de soporte', 'Calzado de seguridad con puntera', 'Guantes de trabajo', 'Chaleco reflectivo en bodegas con montacargas'],
    capacitacionesObligatorias: ['Manejo manual de cargas - técnica segura', 'Operación segura de montacargas', 'Ergonomía en bodegas y centros de distribución', 'Prevención de lesiones músculo-esqueléticas']
  },
  {
    codigoCIIU: '5229',
    descripcionCIIU: 'Otras actividades complementarias al transporte',
    sector: 'Transporte',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés laboral en actividades de coordinación logística',
        categoria: 'Psicosocial',
        descripcion: 'Alta demanda de coordinación, presión por tiempos de entrega y gestión de múltiples actores en logística y transporte',
        fuenteGeneradora: 'Centros de coordinación logística, agencias de aduana y transitarios',
        actividadAsociada: 'Coordinación de transporte, gestión de documentación y trámites aduaneros',
        riesgoPotencial: 'Estrés crónico, burnout, errores por fatiga mental',
        efectosPosibles: 'Ansiedad, depresión, errores que generan accidentes de carga',
        medidasControl: ['Distribución equitativa de carga laboral', 'Descansos programados', 'Apoyo psicológico disponible', 'Herramientas tecnológicas para gestión eficiente']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo prolongado en posición sedente',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo en oficina o call center de coordinación de transporte con exposición prolongada a pantallas',
        fuenteGeneradora: 'Puestos de trabajo de coordinación, monitoreo y gestión documental',
        actividadAsociada: 'Gestión documental, seguimiento de cargas y atención a clientes de transporte',
        riesgoPotencial: 'Fatiga visual, lesiones cervicales y dorsales',
        efectosPosibles: 'Síndrome visual por computador, cervicalgia, dorsalgia',
        medidasControl: ['Sillas ergonómicas ajustables', 'Monitoreo en posición correcta', 'Pausas activas cada hora', 'Iluminación adecuada del puesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Filtro de pantalla antirreflejo', 'Silla ergonómica ajustable'],
    capacitacionesObligatorias: ['Riesgo psicosocial en coordinación logística', 'Higiene postural en trabajo de oficina', 'Pausas activas y ergonomía en puesto de trabajo']
  },
  {
    codigoCIIU: '5310',
    descripcionCIIU: 'Actividades postales nacionales',
    sector: 'Transporte',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Accidente de tránsito en reparto postal',
        categoria: 'Físico',
        descripcion: 'Riesgo de accidente en motocicletas o vehículos de reparto postal en vías urbanas e intermunicipales',
        fuenteGeneradora: 'Motocicletas, furgones y bicicletas de reparto postal',
        actividadAsociada: 'Distribución y entrega de correspondencia y paquetes a domicilio',
        riesgoPotencial: 'Accidente de tránsito, caída de motocicleta',
        efectosPosibles: 'Traumatismos, fracturas, lesiones graves',
        medidasControl: ['Capacitación en conducción segura de motocicleta', 'Casco certificado obligatorio', 'Revisión técnico-mecánica periódica', 'Prohibición de uso de celular mientras conduce']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Carga física en clasificación y reparto',
        categoria: 'Ergonómico',
        descripcion: 'Manejo manual de paquetes y correspondencia en centros de clasificación y en ruta de reparto',
        fuenteGeneradora: 'Paquetes, bolsas postales y equipos de clasificación automática',
        actividadAsociada: 'Clasificación manual de correspondencia y cargue de rutas de reparto',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por manejo repetitivo de paquetes',
        efectosPosibles: 'Lumbalgia, lesiones de hombro, tendinitis',
        medidasControl: ['Carros de transporte de correspondencia', 'Capacitación en manejo de cargas', 'Rotación en tareas de clasificación', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Dec. 1079/2015', norma: 'Decreto 1079 de 2015', descripcion: 'Regulación de servicios postales', obligatorio: true }
    ],
    eppRecomendado: ['Casco certificado para motociclista', 'Chaleco reflectivo', 'Guantes para motociclista', 'Calzado de seguridad', 'Rodilleras y coderas para reparto en bicicleta'],
    capacitacionesObligatorias: ['Conducción segura de motocicleta', 'Normas de tránsito aplicadas al mensajero', 'Manejo manual de cargas postales', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '5320',
    descripcionCIIU: 'Actividades de mensajería',
    sector: 'Transporte',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Accidente de tránsito en mensajería urbana',
        categoria: 'Físico',
        descripcion: 'Alto riesgo de accidente en motocicletas de mensajería por presión de tiempo y condiciones de tráfico urbano',
        fuenteGeneradora: 'Motocicletas de mensajería en entornos urbanos congestionados',
        actividadAsociada: 'Entrega urgente de documentos y paquetes en motocicleta',
        riesgoPotencial: 'Colisión, caída, atropellamiento',
        efectosPosibles: 'Politraumatismos, fracturas, lesiones graves, fatalidad',
        medidasControl: ['Casco de alta protección obligatorio', 'Prohibición de maniobras peligrosas', 'GPS para optimizar rutas y reducir presión temporal', 'Capacitación en conducción defensiva']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Presión por tiempos de entrega en mensajería',
        categoria: 'Psicosocial',
        descripcion: 'Estrés generado por exigencia de entregas inmediatas y penalización por retrasos en servicios de mensajería',
        fuenteGeneradora: 'Plataformas de mensajería con calificación por tiempo de entrega',
        actividadAsociada: 'Gestión de rutas de mensajería con múltiples entregas bajo presión temporal',
        riesgoPotencial: 'Conducción riesgosa por presión de tiempo, estrés crónico',
        efectosPosibles: 'Accidentes por conducción imprudente, burnout',
        medidasControl: ['Tiempos de entrega realistas', 'No penalización por incidentes de tráfico', 'Apoyo psicológico para mensajeros', 'Monitoreo del bienestar laboral']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST mensajería riesgo III', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Casco certificado', 'Chaleco reflectivo', 'Guantes para motociclista', 'Chaqueta con protecciones', 'Calzado adecuado para conducción'],
    capacitacionesObligatorias: ['Conducción segura y defensiva en motocicleta', 'Gestión del riesgo psicosocial en mensajería', 'Normas de tránsito - motociclistas', 'Primeros auxilios para motoristas']
  },

  // ==================== SECCIÓN J - INFORMACIÓN Y COMUNICACIONES ====================

  {
    codigoCIIU: '5811',
    descripcionCIIU: 'Edición de libros',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo prolongado en pantallas de visualización',
        categoria: 'Ergonómico',
        descripcion: 'Exposición continua a pantallas en edición, corrección y diseño editorial de libros',
        fuenteGeneradora: 'Computadores de edición, pantallas de alta resolución para diseño',
        actividadAsociada: 'Edición de textos, diseño editorial y corrección de pruebas',
        riesgoPotencial: 'Fatiga visual, trastornos músculo-esqueléticos cervicales',
        efectosPosibles: 'Síndrome visual por computador, cervicalgia, dorsalgia',
        medidasControl: ['Regla 20-20-20 para descanso visual', 'Silla ergonómica y monitor a altura correcta', 'Pausas activas cada hora', 'Iluminación sin reflejos en pantalla']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con filtro de luz azul', 'Silla ergonómica ajustable'],
    capacitacionesObligatorias: ['Ergonomía en puesto de trabajo con pantalla', 'Higiene postural', 'Pausas activas y ejercicios visuales']
  },
  {
    codigoCIIU: '5812',
    descripcionCIIU: 'Edición de directorios y listas de correo',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario con pantalla en edición de directorios',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de oficina prolongado en captura y edición de datos para directorios',
        fuenteGeneradora: 'Puestos de trabajo de captura y edición de datos',
        actividadAsociada: 'Digitación, edición y actualización de bases de datos de directorios',
        riesgoPotencial: 'Lesiones por movimientos repetitivos y fatiga visual',
        efectosPosibles: 'Síndrome del túnel carpiano, fatiga ocular',
        medidasControl: ['Teclado y ratón ergonómicos', 'Descansos visuales periódicos', 'Ajuste ergonómico del puesto de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Reposamuñecas ergonómico', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Ergonomía en trabajo con computador', 'Prevención del síndrome del túnel carpiano']
  },
  {
    codigoCIIU: '5813',
    descripcionCIIU: 'Edición de periódicos, revistas y otras publicaciones periódicas',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por cierres de edición y presión de tiempo',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión por fechas límite de publicación, cobertura de eventos y gestión de múltiples contenidos simultáneos',
        fuenteGeneradora: 'Sala de redacción, trabajo de campo periodístico',
        actividadAsociada: 'Redacción, edición y cierre de ediciones periodísticas',
        riesgoPotencial: 'Estrés crónico, burnout en periodistas y editores',
        efectosPosibles: 'Ansiedad, agotamiento, problemas cardiovasculares',
        medidasControl: ['Gestión de cargas de trabajo equitativa', 'Apoyo psicológico disponible', 'Descansos entre cierres de edición', 'Reconocimiento del trabajo de periodistas']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en trabajo de redacción',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo prolongado en redacción con postura sedente y uso intensivo de pantallas y teclado',
        fuenteGeneradora: 'Puestos de redacción y edición periodística',
        actividadAsociada: 'Redacción de noticias, edición de contenidos y diseño de páginas',
        riesgoPotencial: 'Lesiones músculo-esqueléticas, fatiga visual',
        efectosPosibles: 'Cervicalgia, lumbalgia, síndrome visual',
        medidasControl: ['Ergonomía del puesto de redacción', 'Pausas activas', 'Iluminación adecuada en sala de redacción']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en medios de comunicación', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Filtro de pantalla antirreflejo', 'Reposamuñecas'],
    capacitacionesObligatorias: ['Riesgo psicosocial en medios de comunicación', 'Ergonomía en redacción periodística', 'Pausas activas y manejo del estrés']
  },
  {
    codigoCIIU: '5819',
    descripcionCIIU: 'Otros trabajos de edición',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo en pantalla en actividades editoriales diversas',
        categoria: 'Ergonómico',
        descripcion: 'Actividades editoriales como mapas, partituras y otros materiales con alto componente de trabajo visual y digital',
        fuenteGeneradora: 'Estaciones de trabajo de edición gráfica y digitalización',
        actividadAsociada: 'Edición de mapas, partituras, cartillas y publicaciones especializadas',
        riesgoPotencial: 'Fatiga visual y lesiones músculo-esqueléticas',
        efectosPosibles: 'Fatiga ocular, síndrome del túnel carpiano',
        medidasControl: ['Pantallas de alta resolución calibradas', 'Pausas activas', 'Análisis ergonómico del puesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con filtro de luz azul', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo editorial', 'Higiene postural y pausas activas']
  },
  {
    codigoCIIU: '5820',
    descripcionCIIU: 'Edición de programas de informática (software)',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo de desarrollo de software con alta demanda visual y cognitiva',
        categoria: 'Ergonómico',
        descripcion: 'Programación intensa con uso prolongado de múltiples monitores, teclado y ratón',
        fuenteGeneradora: 'Estaciones de desarrollo de software con múltiples pantallas',
        actividadAsociada: 'Programación, depuración de código y pruebas de software',
        riesgoPotencial: 'Síndrome del túnel carpiano, fatiga visual, cervicalgia',
        efectosPosibles: 'Lesiones por sobreuso, síndrome visual por computador',
        medidasControl: ['Configuración ergonómica multimontior', 'Regla 20-20-20 para ojos', 'Teclado y ratón ergonómicos', 'Pausas cada 45-60 minutos']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por plazos de entrega en proyectos de software',
        categoria: 'Psicosocial',
        descripcion: 'Alta carga cognitiva y presión por deadlines en proyectos de desarrollo de software',
        fuenteGeneradora: 'Proyectos de software con metodologías ágiles y sprints',
        actividadAsociada: 'Desarrollo, integración y entrega de versiones de software',
        riesgoPotencial: 'Burnout técnico, estrés crónico, errores por fatiga cognitiva',
        efectosPosibles: 'Agotamiento mental, ansiedad, rotación de personal',
        medidasControl: ['Planificación realista de sprints', 'Reuniones de bienestar del equipo', 'Flexibilidad horaria', 'Programas de desconexión digital']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con filtro de luz azul', 'Silla ergonómica con soporte lumbar', 'Reposamuñecas'],
    capacitacionesObligatorias: ['Ergonomía en desarrollo de software', 'Gestión del estrés y bienestar mental en TI', 'Pausas activas y ejercicios de movilidad']
  },
  {
    codigoCIIU: '5911',
    descripcionCIIU: 'Actividades de producción de películas cinematográficas, videos, programas, anuncios y comerciales de televisión',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en sets de grabación y producción',
        categoria: 'Eléctrico',
        descripcion: 'Instalación y operación de equipos de iluminación de alta potencia y sonido en sets de producción',
        fuenteGeneradora: 'Luces de estudio, equipos de generación eléctrica en exteriores, sistemas de audio',
        actividadAsociada: 'Montaje de sets, instalación de luminarias y grabación en exteriores',
        riesgoPotencial: 'Electrocución, incendio eléctrico, quemaduras por lámparas calientes',
        efectosPosibles: 'Paro cardíaco, quemaduras, incendio de set',
        medidasControl: ['Gaffer certificado para instalaciones eléctricas de set', 'Revisión de instalaciones antes de grabación', 'Protección contra contacto con lámparas calientes', 'Sistema de tierras en generadores']
      },
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en producción audiovisual',
        categoria: 'Físico',
        descripcion: 'Trabajo en plataformas, grúas de cámara, rigs y estructuras de iluminación a gran altura en producción',
        fuenteGeneradora: 'Grúas de cámara, plataformas de iluminación, estructuras de set en estudio y exteriores',
        actividadAsociada: 'Instalación de cámaras en altura, montaje de iluminación y efectos especiales',
        riesgoPotencial: 'Caída desde altura, caída de equipo sobre actores o crew',
        efectosPosibles: 'Traumatismos graves, politraumatismos, fatalidades',
        medidasControl: ['Arnés de seguridad para trabajo en alturas', 'Inspección de grúas y plataformas', 'Coordinación de seguridad en set (safety coordinator)', 'Zona de exclusión bajo equipos en altura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas en producción', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de seguridad para alturas en set', 'Casco de seguridad en exteriores', 'Guantes para instalación eléctrica', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Seguridad en sets de producción audiovisual', 'Trabajo seguro en alturas', 'Seguridad eléctrica en producción', 'Primeros auxilios en set']
  },
  {
    codigoCIIU: '5912',
    descripcionCIIU: 'Actividades de postproducción de películas cinematográficas, videos, programas, anuncios y comerciales de televisión',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo prolongado en edición y postproducción audiovisual',
        categoria: 'Ergonómico',
        descripcion: 'Edición de video, sonido y efectos visuales con horas extendidas frente a pantallas en salas de postproducción',
        fuenteGeneradora: 'Estaciones de trabajo de edición no lineal, salas de colorización y mezcla de sonido',
        actividadAsociada: 'Edición de video, colorización, efectos especiales y mezcla de audio',
        riesgoPotencial: 'Fatiga visual severa, lesiones cervicales y de muñeca',
        efectosPosibles: 'Síndrome visual por computador, cervicalgia, síndrome del túnel carpiano',
        medidasControl: ['Pantallas calibradas de alta calidad', 'Ergonomía específica de postproducción', 'Límite de horas de edición continua', 'Iluminación adecuada en sala de edición']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con filtro de luz azul', 'Silla ergonómica', 'Reposamuñecas para editor'],
    capacitacionesObligatorias: ['Ergonomía en postproducción audiovisual', 'Higiene visual para editores', 'Pausas activas y bienestar en trabajo creativo']
  },
  {
    codigoCIIU: '5913',
    descripcionCIIU: 'Actividades de distribución de películas cinematográficas, videos, programas, anuncios y comerciales de televisión',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en gestión de distribución de contenidos',
        categoria: 'Psicosocial',
        descripcion: 'Presión por licenciamiento, negociación y gestión de derechos de distribución audiovisual en múltiples territorios',
        fuenteGeneradora: 'Departamentos comerciales y de licenciamiento de contenidos',
        actividadAsociada: 'Negociación de contratos de distribución, gestión de derechos y ventas internacionales',
        riesgoPotencial: 'Estrés laboral, carga mental elevada',
        efectosPosibles: 'Burnout, ansiedad por cumplimiento de metas',
        medidasControl: ['Distribución equitativa de portafolios', 'Metas realistas', 'Apoyo y mentoría entre pares']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Gestión del estrés y riesgo psicosocial', 'Ergonomía en trabajo de oficina']
  },
  {
    codigoCIIU: '5914',
    descripcionCIIU: 'Actividades de exhibición de películas cinematográficas y videos',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Riesgo de incendio en salas de cine',
        categoria: 'Físico',
        descripcion: 'Riesgo de incendio por equipos de proyección, cableado eléctrico y aglomeración de personas en salas de exhibición',
        fuenteGeneradora: 'Proyectores de alta potencia, sistemas de audio y cableado eléctrico en salas',
        actividadAsociada: 'Proyección de películas, atención al público y mantenimiento de equipos',
        riesgoPotencial: 'Incendio, pánico masivo, lesiones en evacuación',
        efectosPosibles: 'Quemaduras, asfixia, aplastamiento en evacuación',
        medidasControl: ['Sistema contra incendio en sala y proyección', 'Señalización de rutas de evacuación', 'Simulacros periódicos', 'Capacidad de sala respetada']
      },
      {
        codigo: 'FIS-002',
        nombre: 'Exposición a ruido elevado en sala de proyección',
        categoria: 'Físico',
        descripcion: 'Exposición crónica a niveles elevados de presión sonora en salas de cine con sistemas Dolby Atmos y similares',
        fuenteGeneradora: 'Sistemas de sonido envolvente en salas de cine',
        actividadAsociada: 'Trabajo de operadores y acomodadores en salas de proyección',
        riesgoPotencial: 'Hipoacusia por exposición crónica a ruido',
        efectosPosibles: 'Pérdida auditiva, tinnitus',
        medidasControl: ['Medición de niveles de ruido en salas', 'Protección auditiva para operadores en sala', 'Límite de exposición continua al ruido', 'Audiometría periódica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2400/1979', norma: 'Resolución 2400 de 1979', descripcion: 'Estatuto de Seguridad Industrial - ruido y emergencias', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva para operadores', 'Calzado antideslizante para acomodadores', 'Chaleco identificador para emergencias'],
    capacitacionesObligatorias: ['Plan de evacuación de instalaciones de espectáculos', 'Control del ruido en salas de cine', 'Atención al cliente en emergencias', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '5920',
    descripcionCIIU: 'Actividades de grabación de sonido y edición de música',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a ruido elevado en grabación y producción musical',
        categoria: 'Físico',
        descripcion: 'Exposición a niveles elevados de presión sonora durante grabaciones de bandas, orquestas y producción musical',
        fuenteGeneradora: 'Estudios de grabación, cabinas de mezcla y booths de instrumentos',
        actividadAsociada: 'Grabación de instrumentos, voces y producción musical',
        riesgoPotencial: 'Hipoacusia inducida por ruido en músicos e ingenieros de sonido',
        efectosPosibles: 'Pérdida auditiva, tinnitus, hiperacusia',
        medidasControl: ['Monitoreo de niveles de presión sonora en estudio', 'In-ears con limitador de volumen para músicos', 'Descansos auditivos entre sesiones', 'Audiometría periódica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['In-ear monitors con limitador de volumen', 'Protectores auditivos de alta fidelidad para músicos'],
    capacitacionesObligatorias: ['Conservación de la audición en músicos e ingenieros de sonido', 'Ergonomía en estudios de grabación']
  },
  {
    codigoCIIU: '6010',
    descripcionCIIU: 'Actividades de radiodifusión (radio)',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en transmisores y antenas de radio',
        categoria: 'Eléctrico',
        descripcion: 'Mantenimiento de transmisores de alta potencia y antenas de radiodifusión',
        fuenteGeneradora: 'Transmisores de RF de alta potencia, torres de antenas',
        actividadAsociada: 'Mantenimiento de equipos de transmisión y trabajo en torres de antenas',
        riesgoPotencial: 'Electrocución, quemaduras por RF, caída desde torre de antena',
        efectosPosibles: 'Lesiones graves, quemaduras por radiofrecuencia',
        medidasControl: ['Desenergización antes de trabajos en transmisores', 'EPP dieléctrico', 'Arnés para trabajo en torres', 'Procedimientos de seguridad en RF']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo para trabajo en torres', 'Guantes dieléctricos', 'Calzado dieléctrico'],
    capacitacionesObligatorias: ['Seguridad en trabajo con equipos de radiofrecuencia', 'Trabajo en torres y estructuras metálicas', 'Primeros auxilios']
  },
  {
    codigoCIIU: '6020',
    descripcionCIIU: 'Programación y transmisión de televisión',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en transmisores y equipos de TV',
        categoria: 'Eléctrico',
        descripcion: 'Mantenimiento de equipos de transmisión de televisión de alta potencia, cámaras y sistemas de estudio',
        fuenteGeneradora: 'Transmisores de TV, sistemas de iluminación de estudio y equipos de control master',
        actividadAsociada: 'Mantenimiento de equipos de transmisión y operación de estudio de televisión',
        riesgoPotencial: 'Electrocución, arco eléctrico',
        efectosPosibles: 'Quemaduras eléctricas, paro cardíaco',
        medidasControl: ['Mantenimiento con equipos desenergizados', 'Procedimientos LOTO para transmisores', 'Capacitación eléctrica para técnicos de TV']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en transmisión en vivo',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión en producción y transmisión en vivo de noticieros, eventos y programas de televisión',
        fuenteGeneradora: 'Salas de control master, sets de noticias en vivo y unidades móviles',
        actividadAsociada: 'Producción y transmisión en vivo de contenido televisivo',
        riesgoPotencial: 'Estrés agudo, burnout en personal de producción',
        efectosPosibles: 'Ansiedad, agotamiento, errores en transmisión en vivo',
        medidasControl: ['Ensayos y protocolos de emergencia para fallas técnicas', 'Rotación de personal en cargos de alta tensión', 'Apoyo psicológico disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en medios', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Calzado de seguridad', 'Protección auditiva en áreas técnicas'],
    capacitacionesObligatorias: ['Seguridad eléctrica en broadcasting', 'Manejo del estrés en producción televisiva', 'Ergonomía en control master y producción']
  },
  {
    codigoCIIU: '6120',
    descripcionCIIU: 'Actividades de telecomunicaciones inalámbricas',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en torres de telecomunicaciones',
        categoria: 'Físico',
        descripcion: 'Instalación, mantenimiento y reparación de antenas en torres de telecomunicaciones a gran altura',
        fuenteGeneradora: 'Torres de telecomunicaciones de 20 a más de 100 metros de altura',
        actividadAsociada: 'Instalación de antenas, mantenimiento de equipos en torres y rooftops',
        riesgoPotencial: 'Caída desde altura, caída de objetos, exposición a radiofrecuencia',
        efectosPosibles: 'Traumatismos graves, lesiones por caída de herramientas',
        medidasControl: ['Arnés de cuerpo completo con amortiguador de impacto', 'Sistema de ascenso con self-belay', 'Permiso de trabajo en alturas', 'Medición de niveles de RF antes de trabajar']
      },
      {
        codigo: 'ELE-001',
        nombre: 'Exposición a radiofrecuencia en antenas activas',
        categoria: 'Físico',
        descripcion: 'Exposición a campos electromagnéticos de radiofrecuencia emitidos por antenas activas durante trabajos de mantenimiento',
        fuenteGeneradora: 'Antenas de base celular, microondas y sistemas de transmisión activos',
        actividadAsociada: 'Mantenimiento en proximidad de antenas activas',
        riesgoPotencial: 'Efectos térmicos por exposición a RF de alta intensidad',
        efectosPosibles: 'Quemaduras internas por absorción de energía RF',
        medidasControl: ['Apagado o reducción de potencia antes de acercarse', 'Medición de RF con dosímetro', 'Distancias de seguridad establecidas', 'Capacitación en seguridad electromagnética']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas - torres de telecomunicaciones', obligatorio: true },
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo con absorbedor de impacto', 'Casco de seguridad con barbiquejo', 'Guantes anticorte', 'Calzado de seguridad para escalada', 'Bolsa portaherramientas'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas - torres de telecomunicaciones', 'Seguridad ante campos electromagnéticos de RF', 'Rescate en alturas', 'Primeros auxilios para trabajo en torres']
  },
  {
    codigoCIIU: '6130',
    descripcionCIIU: 'Actividades de telecomunicaciones satelitales',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en estaciones terrenas satelitales',
        categoria: 'Eléctrico',
        descripcion: 'Mantenimiento de amplificadores de alta potencia (HPA) y sistemas de alimentación en estaciones satelitales',
        fuenteGeneradora: 'Amplificadores de alta potencia, sistemas UPS y equipos de seguimiento satelital',
        actividadAsociada: 'Operación y mantenimiento de estaciones terrenas de telecomunicaciones satelitales',
        riesgoPotencial: 'Electrocución por alta tensión en HPA, quemaduras por RF',
        efectosPosibles: 'Lesiones eléctricas graves, quemaduras',
        medidasControl: ['Procedimientos LOTO para HPA', 'EPP dieléctrico', 'Bloqueo de potencia RF antes de mantenimiento', 'Capacitación en seguridad eléctrica para técnicos satelitales']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos de alta tensión', 'Calzado dieléctrico', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Seguridad eléctrica en instalaciones de telecomunicaciones', 'Seguridad ante radiofrecuencia', 'Bloqueo y etiquetado LOTO']
  },
  {
    codigoCIIU: '6190',
    descripcionCIIU: 'Otras actividades de telecomunicaciones',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en instalaciones y mantenimiento de redes',
        categoria: 'Eléctrico',
        descripcion: 'Trabajos de instalación y mantenimiento de redes de telecomunicaciones con exposición a energía eléctrica',
        fuenteGeneradora: 'Equipos de red, armarios de distribución y tendido de cables',
        actividadAsociada: 'Instalación de cableado estructurado, fibra óptica y equipos de red',
        riesgoPotencial: 'Electrocución en trabajos sobre equipos activos',
        efectosPosibles: 'Lesiones eléctricas, interrupción de servicios críticos',
        medidasControl: ['Procedimientos de trabajo en redes activas', 'Identificación previa de cables activos', 'EPP dieléctrico básico', 'Coordinación con NOC para trabajos en producción']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo en espacios confinados para instalación de cableado',
        categoria: 'Físico',
        descripcion: 'Trabajo en cuartos de comunicaciones, bajo pisos técnicos y en ductería de edificios para instalación de redes',
        fuenteGeneradora: 'Cuartos de telecomunicaciones, ductos de cableado y espacios bajo piso técnico',
        actividadAsociada: 'Tendido de fibra óptica y cobre en instalaciones de edificios y data centers',
        riesgoPotencial: 'Lesiones por posturas forzadas, calor en cuartos de telecomunicaciones',
        efectosPosibles: 'Lesiones músculo-esqueléticas, estrés térmico en cuartos calientes',
        medidasControl: ['Evaluación ergonómica de trabajos en espacios reducidos', 'Control de temperatura en cuartos de comunicaciones', 'Equipos de iluminación portátil', 'Rotación en trabajos en espacios reducidos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Gafas de seguridad', 'Calzado de seguridad', 'Rodilleras para trabajo en suelos', 'Iluminación frontal'],
    capacitacionesObligatorias: ['Seguridad eléctrica básica en telecomunicaciones', 'Trabajo ergonómico en espacios confinados', 'Instalación segura de fibra óptica']
  },
  {
    codigoCIIU: '6202',
    descripcionCIIU: 'Actividades de consultoría informática y actividades de administración de instalaciones informáticas',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario prolongado en consultoría de TI',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de consultoría con largas jornadas en clientes, viajes y trabajo remoto con configuraciones no ergonómicas',
        fuenteGeneradora: 'Instalaciones de clientes con puestos de trabajo no ergonómicos, trabajo desde laptop',
        actividadAsociada: 'Consultoría in-situ, implementación de sistemas y soporte en instalaciones de clientes',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por configuración inadecuada',
        efectosPosibles: 'Cervicalgia, lumbalgia, lesiones de muñeca',
        medidasControl: ['Kit de trabajo remoto ergonómico para consultores', 'Evaluación de puesto en instalaciones de clientes', 'Laptops con teclado y ratón externos', 'Pausas activas en desplazamientos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Kit ergonómico portátil para consultores (soporte de laptop, teclado y ratón externos)'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de campo y consultoría', 'Higiene postural para trabajo remoto', 'Gestión del estrés en consultoría']
  },
  {
    codigoCIIU: '6209',
    descripcionCIIU: 'Otras actividades de tecnología de información y actividades de servicios informáticos',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en servicios informáticos',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de soporte técnico, mantenimiento de equipos y servicios informáticos con combinación de trabajo físico y en pantalla',
        fuenteGeneradora: 'Centros de soporte técnico, data centers y puestos de trabajo de usuarios',
        actividadAsociada: 'Soporte técnico, mantenimiento de hardware y servicios de TI',
        riesgoPotencial: 'Lesiones por manipulación de equipos pesados y posturas inadecuadas',
        efectosPosibles: 'Hernias, lesiones de muñeca, fatiga visual',
        medidasControl: ['Técnicas de levantamiento seguro de equipos', 'Ergonomía en puestos de soporte', 'Pausas activas para técnicos de campo', 'Herramientas adecuadas para mantenimiento']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Pulsera antiestática para mantenimiento de hardware', 'Guantes antiestáticos', 'Calzado de seguridad para data center'],
    capacitacionesObligatorias: ['Manejo seguro de equipos informáticos', 'Ergonomía en soporte técnico', 'Seguridad eléctrica básica']
  },
  {
    codigoCIIU: '6311',
    descripcionCIIU: 'Procesamiento de datos, alojamiento (hosting) y actividades relacionadas',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Estrés térmico y ruido en centros de datos',
        categoria: 'Físico',
        descripcion: 'Exposición al calor y ruido generado por servidores y sistemas de refrigeración en centros de datos',
        fuenteGeneradora: 'Racks de servidores, sistemas CRAC/CRAH y UPS en data centers',
        actividadAsociada: 'Operación y mantenimiento de infraestructura de data center',
        riesgoPotencial: 'Estrés térmico en pasillos calientes, hipoacusia por ruido continuo',
        efectosPosibles: 'Incomodidad térmica, pérdida auditiva por exposición crónica al ruido',
        medidasControl: ['Diseño de pasillo frío/caliente en data center', 'Protección auditiva en áreas de UPS y generadores', 'Monitoreo de temperatura y humedad', 'Rotación en áreas calientes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Protección auditiva para áreas de generadores y UPS', 'Calzado antiestático', 'Guantes antiestáticos'],
    capacitacionesObligatorias: ['Seguridad en centros de datos', 'Control de ruido y temperatura en data center', 'Ergonomía en operación de TI']
  },
  {
    codigoCIIU: '6312',
    descripcionCIIU: 'Portales web',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo digital intensivo en gestión de portales web',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo continuo en pantalla para desarrollo, edición y gestión de contenidos en portales digitales',
        fuenteGeneradora: 'Puestos de trabajo digital, home office y oficinas de medios digitales',
        actividadAsociada: 'Desarrollo web, gestión de contenidos, SEO y análisis de datos digitales',
        riesgoPotencial: 'Fatiga visual, lesiones por sobreuso de manos',
        efectosPosibles: 'Síndrome visual, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto digital', 'Límites de exposición a pantalla', 'Pausas activas programadas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Gafas con filtro de luz azul', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía digital', 'Higiene visual para trabajadores digitales', 'Pausas activas']
  },
  {
    codigoCIIU: '6391',
    descripcionCIIU: 'Actividades de agencias de noticias',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés traumático secundario en periodistas de agencias',
        categoria: 'Psicosocial',
        descripcion: 'Exposición constante a contenidos de alto impacto emocional (guerras, desastres, violencia) en cobertura para agencias de noticias',
        fuenteGeneradora: 'Trabajo de corresponsales en zonas de conflicto y cobertura de eventos traumáticos',
        actividadAsociada: 'Cobertura noticiosa en campo de alto riesgo y edición de contenido sensible',
        riesgoPotencial: 'Estrés traumático secundario (PTSD vicario), burnout',
        efectosPosibles: 'Trastorno de estrés postraumático, ansiedad, depresión',
        medidasControl: ['Apoyo psicológico especializado para periodistas de campo', 'Protocolos de cobertura de zonas de conflicto', 'Rotación de corresponsales', 'Capacitación en autocuidado para periodistas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en periodismo', obligatorio: true },
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco antibalas para corresponsales en zonas de conflicto', 'Kit de emergencia para periodistas de campo'],
    capacitacionesObligatorias: ['Seguridad para periodistas en zonas hostiles', 'Primeros auxilios psicológicos', 'Gestión del trauma en periodismo de guerra']
  },
  {
    codigoCIIU: '6399',
    descripcionCIIU: 'Otras actividades de servicio de información n.c.p.',
    sector: 'Información y Comunicaciones',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en servicios de información digitales',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo sedentario y en pantalla en servicios de información, recopilación de datos y análisis',
        fuenteGeneradora: 'Puestos de trabajo de análisis de información y bases de datos',
        actividadAsociada: 'Recopilación, análisis y distribución de información a través de plataformas digitales',
        riesgoPotencial: 'Fatiga visual, lesiones músculo-esqueléticas',
        efectosPosibles: 'Síndrome visual, cervicalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía de puesto de trabajo', 'Pausas activas', 'Monitoreo a altura adecuada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de oficina', 'Pausas activas y ejercicios visuales']
  },

  // ==================== SECCIÓN K - ACTIVIDADES FINANCIERAS Y DE SEGUROS ====================

  {
    codigoCIIU: '6412',
    descripcionCIIU: 'Bancos comerciales',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo de atraco y violencia en oficinas bancarias',
        categoria: 'Psicosocial',
        descripcion: 'Exposición al riesgo de atraco armado y situaciones de violencia en oficinas bancarias y cajeros automáticos',
        fuenteGeneradora: 'Oficinas bancarias, cajeros automáticos y vehículos de transporte de valores',
        actividadAsociada: 'Atención al público en ventanillas, manejo de efectivo y operaciones bancarias',
        riesgoPotencial: 'Atraco armado, estrés postraumático, agresión física',
        efectosPosibles: 'Lesiones físicas, trastorno de estrés postraumático, ansiedad',
        medidasControl: ['Sistemas de seguridad física: cámaras, puertas de retardo, detectores', 'Protocolos de atención a atracos', 'Apoyo psicológico post-incidente', 'Capacitación en seguridad bancaria']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario en oficinas bancarias',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo prolongado en ventanillas, plataforma comercial y back office con uso intensivo de computador',
        fuenteGeneradora: 'Puestos de cajero, plataforma comercial y operaciones de back office',
        actividadAsociada: 'Atención al cliente, operaciones bancarias y procesos administrativos',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por postura sedente prolongada',
        efectosPosibles: 'Lumbalgia, síndrome del túnel carpiano, síndrome visual',
        medidasControl: ['Sillas ergonómicas ajustables', 'Pantallas a altura adecuada', 'Pausas activas cada hora', 'Rotación en puestos de ventanilla']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica de ventanilla', 'Filtro de pantalla antirreflejo'],
    capacitacionesObligatorias: ['Seguridad bancaria y atención a situaciones de crisis', 'Ergonomía en puestos bancarios', 'Manejo del estrés en atención al cliente', 'Primeros auxilios psicológicos post-atraco']
  },
  {
    codigoCIIU: '6421',
    descripcionCIIU: 'Actividades de las casas de cambio',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo de atraco en casas de cambio',
        categoria: 'Psicosocial',
        descripcion: 'Alto riesgo de asalto por manejo de divisas en efectivo en puntos de cambio de moneda',
        fuenteGeneradora: 'Puntos de cambio en centros comerciales, aeropuertos y zonas turísticas',
        actividadAsociada: 'Cambio de divisas, manejo de efectivo en múltiples monedas',
        riesgoPotencial: 'Atraco armado, estrés por manejo de efectivo de alto valor',
        efectosPosibles: 'Lesiones físicas, estrés postraumático',
        medidasControl: ['Cabina de seguridad con vidrio blindado', 'Sistemas de alarma silenciosa', 'Protocolos de manejo de efectivo seguro', 'Vigilancia privada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Alarma personal', 'Puesto de trabajo protegido'],
    capacitacionesObligatorias: ['Seguridad en manejo de efectivo', 'Protocolo ante atracos', 'Primeros auxilios psicológicos']
  },
  {
    codigoCIIU: '6422',
    descripcionCIIU: 'Actividades de las corporaciones financieras',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés laboral en actividades financieras corporativas',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión por decisiones de inversión, gestión de portafolios y cumplimiento de metas financieras',
        fuenteGeneradora: 'Salas de inversión, mesas de dinero y departamentos de riesgo financiero',
        actividadAsociada: 'Gestión de inversiones, análisis financiero y toma de decisiones de alto impacto',
        riesgoPotencial: 'Estrés crónico, burnout, problemas cardiovasculares',
        efectosPosibles: 'Agotamiento mental, ansiedad, hipertensión',
        medidasControl: ['Programas de bienestar corporativo', 'Metas realistas y gestión del desempeño', 'Flexibilidad horaria', 'Apoyo psicológico profesional disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en sector financiero', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica ejecutiva'],
    capacitacionesObligatorias: ['Gestión del estrés en sector financiero', 'Bienestar mental en altas responsabilidades', 'Ergonomía en trabajo de oficina']
  },
  {
    codigoCIIU: '6423',
    descripcionCIIU: 'Actividades de las compañías de financiamiento',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo psicosocial en cobranza y financiamiento',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a conflictos con clientes morosos, presión por metas de cobranza y situaciones tensas en visitas de campo',
        fuenteGeneradora: 'Centros de contacto de cobranza, visitas domiciliarias a deudores',
        actividadAsociada: 'Gestión de cobranza, visitas a deudores y aprobación de créditos',
        riesgoPotencial: 'Agresiones verbales y físicas de clientes, estrés crónico por cobranza',
        efectosPosibles: 'Ansiedad, burnout, lesiones en visitas de campo',
        medidasControl: ['Protocolos de seguridad en visitas domiciliarias', 'Trabajo en pareja para cobranza en campo', 'Apoyo psicológico para personal de cobranza', 'Capacitación en desescalada de conflictos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Teléfono con GPS para visitas de campo'],
    capacitacionesObligatorias: ['Técnicas de cobranza segura', 'Manejo de situaciones conflictivas con clientes', 'Ergonomía en trabajo de oficina y call center']
  },
  {
    codigoCIIU: '6424',
    descripcionCIIU: 'Actividades de las cooperativas financieras',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en gestión financiera cooperativa',
        categoria: 'Psicosocial',
        descripcion: 'Presión por gestión de captaciones, colocaciones y atención a asociados en cooperativas financieras',
        fuenteGeneradora: 'Oficinas de cooperativas financieras y puntos de atención a asociados',
        actividadAsociada: 'Atención a asociados, gestión de ahorros, créditos y recaudo',
        riesgoPotencial: 'Estrés en atención al cliente, manejo de efectivo',
        efectosPosibles: 'Burnout, ansiedad en manejo de dinero',
        medidasControl: ['Programas de bienestar para empleados', 'Rotación en cajas y atención', 'Sistemas seguros de manejo de efectivo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica de ventanilla'],
    capacitacionesObligatorias: ['Seguridad en manejo de efectivo', 'Ergonomía en atención al cliente', 'Gestión del estrés laboral']
  },
  {
    codigoCIIU: '6431',
    descripcionCIIU: 'Fideicomisos, fondos (incluso los de pensiones y cesantías) y entidades financieras similares',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Carga cognitiva en gestión de fondos y fideicomisos',
        categoria: 'Psicosocial',
        descripcion: 'Alta responsabilidad en la administración de recursos de terceros en fondos de pensiones y fideicomisos',
        fuenteGeneradora: 'Departamentos de inversión, cumplimiento y gestión de carteras de fondos',
        actividadAsociada: 'Gestión de portafolios, cumplimiento regulatorio y atención a beneficiarios',
        riesgoPotencial: 'Estrés crónico por alta responsabilidad fiduciaria',
        efectosPosibles: 'Burnout, ansiedad, trastornos de salud mental',
        medidasControl: ['Distribución adecuada de responsabilidades', 'Apoyo psicológico profesional', 'Programas de bienestar corporativo', 'Balance vida-trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica ajustable'],
    capacitacionesObligatorias: ['Gestión del estrés en servicios financieros', 'Ergonomía en puesto de trabajo financiero', 'Bienestar mental en sector de pensiones']
  },
  {
    codigoCIIU: '6432',
    descripcionCIIU: 'Fondos de cesantías',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo de oficina en administración de cesantías',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo sedentario con pantallas en gestión y administración de fondos de cesantías',
        fuenteGeneradora: 'Puestos de trabajo administrativos y de atención al afiliado',
        actividadAsociada: 'Gestión de consignaciones, retiros y traslados de cesantías',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por trabajo sedentario',
        efectosPosibles: 'Lumbalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Sillas ajustables']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de oficina', 'Pausas activas']
  },
  {
    codigoCIIU: '6491',
    descripcionCIIU: 'Leasing financiero (arrendamiento financiero)',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Presión comercial en ventas de productos de leasing',
        categoria: 'Psicosocial',
        descripcion: 'Estrés por cumplimiento de metas de colocación de contratos de leasing y visitas a clientes corporativos',
        fuenteGeneradora: 'Fuerza de ventas de leasing, equipos comerciales B2B',
        actividadAsociada: 'Asesoría comercial, estructuración y cierre de operaciones de leasing',
        riesgoPotencial: 'Estrés por metas, accidentes de tránsito en visitas',
        efectosPosibles: 'Burnout comercial, accidentes en desplazamientos',
        medidasControl: ['Metas comerciales alcanzables', 'Política de seguridad vial para visitas', 'Apoyo psicológico disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Kit de seguridad vial para conductores comerciales'],
    capacitacionesObligatorias: ['Manejo defensivo para ejecutivos comerciales', 'Gestión del estrés en ventas', 'Ergonomía en trabajo de oficina y campo']
  },
  {
    codigoCIIU: '6492',
    descripcionCIIU: 'Actividades de factoring',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario en operaciones de factoring',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo prolongado en análisis de facturas y gestión de cartera en operaciones de factoring',
        fuenteGeneradora: 'Puestos de trabajo de análisis de crédito y gestión de cobro',
        actividadAsociada: 'Análisis de facturas, gestión de cobro y relación con deudores cedidos',
        riesgoPotencial: 'Lesiones músculo-esqueléticas, fatiga visual',
        efectosPosibles: 'Cervicalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Alternancia entre tareas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de oficina financiera', 'Pausas activas y bienestar en sector financiero']
  },
  {
    codigoCIIU: '6493',
    descripcionCIIU: 'Actividades de las inversiones y operaciones entre compañías del grupo empresarial',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por gestión interempresarial y cumplimiento regulatorio',
        categoria: 'Psicosocial',
        descripcion: 'Alta responsabilidad en gestión de inversiones entre empresas del mismo grupo y cumplimiento de normatividad financiera',
        fuenteGeneradora: 'Departamentos de tesorería corporativa y gestión de inversiones de grupo',
        actividadAsociada: 'Gestión de flujos intercompañía, inversiones y cumplimiento de regulación DIAN y SFC',
        riesgoPotencial: 'Estrés por complejidad regulatoria y alta responsabilidad',
        efectosPosibles: 'Burnout, ansiedad',
        medidasControl: ['Apoyo jurídico y contable disponible', 'Distribución equitativa de responsabilidades', 'Programas de bienestar']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica ejecutiva'],
    capacitacionesObligatorias: ['Gestión del estrés en alta dirección financiera', 'Ergonomía en trabajo ejecutivo']
  },
  {
    codigoCIIU: '6494',
    descripcionCIIU: 'Actividades de los profesionales de compra y venta de divisas',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en operaciones de divisas y mercado forex',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión en operaciones de trading de divisas con exposición a pérdidas y ganancias en tiempo real',
        fuenteGeneradora: 'Mesas de trading, plataformas electrónicas de divisas',
        actividadAsociada: 'Compraventa de divisas, gestión de exposiciones cambiarias y cobertura',
        riesgoPotencial: 'Estrés agudo, burnout en operadores de divisas',
        efectosPosibles: 'Trastornos de ansiedad, problemas cardiovasculares',
        medidasControl: ['Límites de posición y stop loss automatizados', 'Rotación de traders', 'Apoyo psicológico', 'Gestión ergonómica de mesas de trading']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para trader', 'Soporte para múltiples monitores'],
    capacitacionesObligatorias: ['Gestión del estrés en trading financiero', 'Ergonomía en mesas de operaciones financieras', 'Bienestar mental en alta responsabilidad']
  },
  {
    codigoCIIU: '6495',
    descripcionCIIU: 'Instituciones especiales oficiales',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por gestión de recursos públicos y cumplimiento de metas sociales',
        categoria: 'Psicosocial',
        descripcion: 'Alta responsabilidad en la administración de recursos del Estado y el impacto social de las decisiones financieras',
        fuenteGeneradora: 'Entidades como Findeter, Bancóldex, Finagro, FNG y similares',
        actividadAsociada: 'Gestión de créditos de fomento, evaluación de proyectos y supervisión de recursos públicos',
        riesgoPotencial: 'Estrés por responsabilidad fiscal, acoso por gestión de recursos públicos',
        efectosPosibles: 'Burnout, ansiedad, conflictos de interés',
        medidasControl: ['Programas de bienestar para servidores públicos', 'Apoyo jurídico y psicológico', 'Protocolos de ética y transparencia', 'Balance vida-trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1083/2015', norma: 'Decreto 1083 de 2015', descripcion: 'Reglamento único del sector de función pública', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Bienestar en el sector público financiero', 'Ergonomía en trabajo de oficina', 'Manejo del estrés laboral']
  },
  {
    codigoCIIU: '6499',
    descripcionCIIU: 'Otras actividades de servicio financiero, excepto las de seguros y pensiones n.c.p.',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en servicios financieros diversos',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo sedentario y en pantallas en servicios financieros especializados como microseguros, remesas y banca móvil',
        fuenteGeneradora: 'Oficinas de servicios financieros alternativos y plataformas digitales',
        actividadAsociada: 'Prestación de servicios financieros alternativos, análisis y atención al cliente',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por postura sedente',
        efectosPosibles: 'Cervicalgia, lumbalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Variedad de tareas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo financiero', 'Pausas activas y bienestar laboral']
  },
  {
    codigoCIIU: '6511',
    descripcionCIIU: 'Seguros generales',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por gestión de siniestros y atención a asegurados afectados',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a situaciones traumáticas durante ajuste de siniestros y atención a asegurados en situación de crisis',
        fuenteGeneradora: 'Departamentos de siniestros, visitas de campo para ajuste y peritos',
        actividadAsociada: 'Ajuste de siniestros, peritaje de daños, atención a asegurados en emergencias',
        riesgoPotencial: 'Estrés traumático secundario, burnout en ajustadores',
        efectosPosibles: 'Fatiga por compasión, trastornos de ansiedad',
        medidasControl: ['Apoyo psicológico para ajustadores de campo', 'Rotación en tipos de siniestros', 'Protocolos de autocuidado para personal de campo', 'Límite de siniestros catastróficos por ajustador']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en ajuste de siniestros', obligatorio: true }
    ],
    eppRecomendado: ['EPP según tipo de siniestro a inspeccionar (casco, guantes, gafas para siniestros industriales)'],
    capacitacionesObligatorias: ['Manejo del estrés en ajuste de siniestros', 'Ergonomía en trabajo de oficina y campo', 'Primeros auxilios psicológicos']
  },
  {
    codigoCIIU: '6512',
    descripcionCIIU: 'Seguros de vida',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés emocional en ventas y gestión de seguros de vida',
        categoria: 'Psicosocial',
        descripcion: 'Interacción con beneficiarios en situaciones de duelo y alta carga emocional en tramitación de reclamaciones de vida',
        fuenteGeneradora: 'Departamentos de reclamaciones de vida, asesores comerciales de seguros de vida',
        actividadAsociada: 'Atención a beneficiarios, tramitación de reclamaciones y venta de productos de vida',
        riesgoPotencial: 'Fatiga por compasión, estrés emocional',
        efectosPosibles: 'Trastornos de ansiedad, burnout emocional',
        medidasControl: ['Apoyo psicológico para personal de reclamaciones', 'Capacitación en comunicación empática', 'Rotación en tipos de productos', 'Programas de autocuidado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Comunicación empática y gestión de duelo', 'Autocuidado emocional en seguros de vida', 'Ergonomía en trabajo de oficina']
  },
  {
    codigoCIIU: '6513',
    descripcionCIIU: 'Reaseguros',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés cognitivo en modelación de riesgos complejos',
        categoria: 'Psicosocial',
        descripcion: 'Alta demanda cognitiva en análisis de riesgos catastróficos, modelación actuarial y negociación de contratos de reaseguro',
        fuenteGeneradora: 'Departamentos técnicos de reaseguro y áreas de suscripción especializada',
        actividadAsociada: 'Análisis de riesgos catastróficos, suscripción de reaseguro y negociación de tratados',
        riesgoPotencial: 'Sobrecarga cognitiva, estrés en análisis de catástrofes',
        efectosPosibles: 'Fatiga mental, burnout en especialistas',
        medidasControl: ['Equipos de trabajo multidisciplinarios', 'Distribución adecuada de análisis complejos', 'Descansos cognitivos programados']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para trabajo de análisis'],
    capacitacionesObligatorias: ['Ergonomía cognitiva y mental', 'Gestión del estrés en trabajo técnico especializado']
  },
  {
    codigoCIIU: '6514',
    descripcionCIIU: 'Capitalización',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario en administración de títulos de capitalización',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de oficina en gestión de contratos de capitalización, sorteos y atención al cliente',
        fuenteGeneradora: 'Puestos administrativos y de atención al cliente de capitalizadoras',
        actividadAsociada: 'Gestión de contratos, atención a titulares y organización de sorteos',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por trabajo sedentario',
        efectosPosibles: 'Lumbalgia, cervicalgia',
        medidasControl: ['Sillas ergonómicas', 'Pausas activas', 'Rotación de actividades']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de oficina', 'Pausas activas']
  },
  {
    codigoCIIU: '6521',
    descripcionCIIU: 'Servicios de seguros sociales de salud',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en gestión de autorizaciones y atención a usuarios de salud',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión por atención a usuarios con necesidades urgentes de salud y gestión de autorizaciones de servicios médicos',
        fuenteGeneradora: 'Call center de autorizaciones médicas, oficinas de atención al usuario de EPS',
        actividadAsociada: 'Gestión de autorizaciones, atención a usuarios de salud y coordinación de servicios',
        riesgoPotencial: 'Estrés por atención de emergencias sanitarias, agresión de usuarios',
        efectosPosibles: 'Burnout, agresiones verbales o físicas de usuarios',
        medidasControl: ['Protocolos de atención a usuarios en situación de urgencia', 'Capacitación en comunicación asertiva', 'Seguridad física en puntos de atención', 'Apoyo psicológico para personal de atención']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para call center'],
    capacitacionesObligatorias: ['Comunicación asertiva en servicios de salud', 'Manejo del estrés en atención al usuario de salud', 'Ergonomía en call center de salud']
  },
  {
    codigoCIIU: '6522',
    descripcionCIIU: 'Servicios de seguros sociales de riesgos laborales',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en gestión de accidentes laborales y atención a accidentados',
        categoria: 'Psicosocial',
        descripcion: 'Atención a trabajadores accidentados, gestión de pensiones de invalidez y calificación de enfermedades laborales',
        fuenteGeneradora: 'Centros de atención de ARL, áreas de calificación de pérdida de capacidad laboral',
        actividadAsociada: 'Atención médica de urgencias laborales, gestión de prestaciones y rehabilitación',
        riesgoPotencial: 'Estrés traumático secundario, carga emocional en casos graves',
        efectosPosibles: 'Fatiga por compasión, burnout en personal de ARL',
        medidasControl: ['Rotación en tipos de casos', 'Apoyo psicológico para personal', 'Supervisión clínica para equipos de rehabilitación', 'Programas de autocuidado']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1295/1994', norma: 'Decreto 1295 de 1994', descripcion: 'Sistema General de Riesgos Laborales', obligatorio: true }
    ],
    eppRecomendado: ['EPP según actividad específica (visitas a empresas, trabajo de campo)'],
    capacitacionesObligatorias: ['Sistema de Riesgos Laborales - aspectos operativos', 'Gestión del estrés en ARL', 'Comunicación empática con trabajadores accidentados']
  },
  {
    codigoCIIU: '6531',
    descripcionCIIU: 'Actividades de las administradoras de fondos de pensiones y cesantías',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en atención a afiliados sobre pensiones',
        categoria: 'Psicosocial',
        descripcion: 'Manejo de situaciones de alta tensión con afiliados que reclaman pensiones o tienen dificultades en su proceso pensional',
        fuenteGeneradora: 'Centros de atención de AFP, call centers pensionales y asesores comerciales',
        actividadAsociada: 'Atención a afiliados, gestión de pensiones y resolución de reclamaciones pensionales',
        riesgoPotencial: 'Agresión verbal de usuarios, estrés por alta demanda de atención',
        efectosPosibles: 'Burnout, ansiedad, desgaste emocional',
        medidasControl: ['Protocolos de atención a situaciones de conflicto con afiliados', 'Apoyo psicológico para personal de atención', 'Rotación en tipos de trámites', 'Capacitación en comunicación asertiva']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica de atención al cliente'],
    capacitacionesObligatorias: ['Comunicación asertiva en servicios pensionales', 'Ergonomía en atención al cliente', 'Gestión del estrés laboral']
  },
  {
    codigoCIIU: '6532',
    descripcionCIIU: 'Actividades de las administradoras de riesgos laborales',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Exposición a situaciones de riesgo durante visitas empresariales',
        categoria: 'Psicosocial',
        descripcion: 'Visitas a empresas con riesgo V, ambientes industriales peligrosos y exposición indirecta a accidentes laborales',
        fuenteGeneradora: 'Visitas técnicas a empresas afiliadas de alto riesgo, industria, construcción, minería',
        actividadAsociada: 'Asesoría SST a empresas, inspección de condiciones de trabajo y promoción de seguridad',
        riesgoPotencial: 'Accidente durante visitas a empresas de alto riesgo, estrés traumático secundario',
        efectosPosibles: 'Lesiones en visitas de campo, fatiga por compasión',
        medidasControl: ['EPP específico para visitas a empresas de cada sector', 'Protocolos de seguridad en visitas de campo', 'Inducción de seguridad antes de cada visita', 'Apoyo psicológico para asesores que atienden accidentes graves']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1295/1994', norma: 'Decreto 1295 de 1994', descripcion: 'Sistema General de Riesgos Laborales', obligatorio: true }
    ],
    eppRecomendado: ['EPP variable según sector visitado (casco, gafas, guantes, calzado de seguridad)'],
    capacitacionesObligatorias: ['Seguridad en visitas a empresas de alto riesgo', 'Sistema General de Riesgos Laborales', 'Autocuidado para asesores de ARL', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '6611',
    descripcionCIIU: 'Administración de mercados financieros',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en supervisión y administración de mercados',
        categoria: 'Psicosocial',
        descripcion: 'Alta responsabilidad en la administración, supervisión y operación de infraestructuras de mercados financieros',
        fuenteGeneradora: 'Entidades como Bolsa de Valores, Deceval, CRCC y otras IFMs',
        actividadAsociada: 'Operación de sistemas de negociación, compensación y liquidación de valores',
        riesgoPotencial: 'Estrés por alta responsabilidad sistémica en mercados financieros',
        efectosPosibles: 'Burnout, errores de alto impacto, problemas cardiovasculares',
        medidasControl: ['Sistemas de respaldo y continuidad del negocio', 'Distribución de responsabilidades críticas', 'Apoyo psicológico para operadores de sistemas críticos', 'Balance trabajo-vida']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para operadores de mercado'],
    capacitacionesObligatorias: ['Gestión del estrés en infraestructuras financieras críticas', 'Ergonomía en sala de operaciones financieras']
  },
  {
    codigoCIIU: '6612',
    descripcionCIIU: 'Corretaje de valores y de contratos de productos básicos',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en trading y corretaje de valores',
        categoria: 'Psicosocial',
        descripcion: 'Presión extrema en operaciones de compraventa de valores con pérdidas y ganancias en tiempo real y alta volatilidad',
        fuenteGeneradora: 'Mesas de operaciones de corredores de bolsa y comisionistas',
        actividadAsociada: 'Ejecución de órdenes de bolsa, manejo de portafolios y asesoría de inversión',
        riesgoPotencial: 'Estrés agudo, burnout en traders y corredores',
        efectosPosibles: 'Trastornos cardiovasculares, ansiedad, adicción al trabajo',
        medidasControl: ['Sistemas de gestión de riesgo automatizados', 'Rotación de traders', 'Programas de bienestar en mesas de dinero', 'Límites de horas de trading continuo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica de alta prestación para traders'],
    capacitacionesObligatorias: ['Gestión del estrés en trading', 'Ergonomía en mesas de operaciones financieras', 'Bienestar mental en sector bursátil']
  },
  {
    codigoCIIU: '6613',
    descripcionCIIU: 'Otras actividades relacionadas con el mercado de valores',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo de análisis bursátil prolongado con pantallas',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo intensivo en análisis técnico y fundamental de mercados de valores con múltiples pantallas',
        fuenteGeneradora: 'Puestos de análisis bursátil con múltiples monitores',
        actividadAsociada: 'Análisis de mercados, elaboración de informes bursátiles y gestión de riesgo',
        riesgoPotencial: 'Fatiga visual, lesiones por trabajo sedentario',
        efectosPosibles: 'Síndrome visual, cervicalgia',
        medidasControl: ['Configuración ergonómica de múltiples monitores', 'Pausas visuales programadas', 'Sillas ergonómicas ajustables']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Soporte para monitores ergonómico', 'Gafas con filtro de luz azul'],
    capacitacionesObligatorias: ['Ergonomía en trabajo con múltiples pantallas', 'Higiene visual para analistas financieros']
  },
  {
    codigoCIIU: '6614',
    descripcionCIIU: 'Actividades de las casas de cambio y las compañías de financiamiento especializadas en cambio de divisas',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo de seguridad física en operaciones de divisas',
        categoria: 'Psicosocial',
        descripcion: 'Manejo de altos volúmenes de efectivo en diferentes monedas con exposición a riesgo de atraco y manipulación de billetes falsos',
        fuenteGeneradora: 'Puntos de atención de cambio de divisas y oficinas de remesas',
        actividadAsociada: 'Recepción y entrega de divisas, verificación de billetes y registro de operaciones',
        riesgoPotencial: 'Atraco, estrés por manejo de efectivo de alto valor, contacto con billetes contaminados',
        efectosPosibles: 'Lesiones físicas en atraco, estrés postraumático, enfermedades infecciosas por billetes',
        medidasControl: ['Cabinas con vidrio blindado', 'Sistemas de alarma', 'Protocolos de higiene en manejo de billetes', 'Capacitación en seguridad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para manejo de billetes', 'Alarma personal'],
    capacitacionesObligatorias: ['Seguridad en manejo de efectivo y divisas', 'Protocolo anti-atraco', 'Higiene en manejo de efectivo']
  },
  {
    codigoCIIU: '6615',
    descripcionCIIU: 'Actividades de los profesionales de seguros',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Accidentes de tránsito en visitas de agentes de seguros',
        categoria: 'Físico',
        descripcion: 'Riesgo de accidentes en desplazamientos a clientes para prospección, venta y gestión de pólizas de seguros',
        fuenteGeneradora: 'Vehículos propios o de empresa en visitas a clientes',
        actividadAsociada: 'Visitas comerciales, inspecciones de riesgos y gestión de siniestros en campo',
        riesgoPotencial: 'Accidentes de tránsito en desplazamientos frecuentes',
        efectosPosibles: 'Lesiones en accidente de tránsito, fatalidad',
        medidasControl: ['Política de seguridad vial corporativa', 'Revisión técnico-mecánica de vehículos', 'Conducción defensiva', 'Limitación de horas de conducción']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Kit de seguridad vial en vehículo', 'Cinturón de seguridad'],
    capacitacionesObligatorias: ['Conducción segura y defensiva', 'Plan estratégico de seguridad vial (PESV)', 'Ergonomía en trabajo de campo']
  },
  {
    codigoCIIU: '6619',
    descripcionCIIU: 'Otras actividades auxiliares de las actividades de servicios financieros',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en servicios financieros auxiliares',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de oficina en actividades de apoyo al sector financiero: calificadoras, burós de crédito, procesadores de pagos',
        fuenteGeneradora: 'Puestos de trabajo administrativos y analíticos en servicios financieros de apoyo',
        actividadAsociada: 'Análisis de crédito, procesamiento de pagos, calificación de deuda y gestión de datos financieros',
        riesgoPotencial: 'Lesiones músculo-esqueléticas, fatiga visual',
        efectosPosibles: 'Cervicalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Evaluación ergonómica periódica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica ajustable', 'Reposamuñecas'],
    capacitacionesObligatorias: ['Ergonomía en trabajo financiero de oficina', 'Pausas activas y bienestar laboral']
  },
  {
    codigoCIIU: '6621',
    descripcionCIIU: 'Actividades de evaluación de riesgos y daños',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Exposición a riesgos de campo durante evaluación de siniestros',
        categoria: 'Psicosocial',
        descripcion: 'Peritos y tasadores expuestos a riesgos específicos del sector evaluado: construcciones en riesgo, accidentes, zonas inundadas',
        fuenteGeneradora: 'Sitios de siniestro: edificios en colapso, escenas de accidentes, zonas de inundación',
        actividadAsociada: 'Evaluación de daños en siniestros de todo tipo para compañías de seguros',
        riesgoPotencial: 'Accidentes durante inspección en zonas de riesgo, estrés traumático secundario',
        efectosPosibles: 'Lesiones en campo, fatiga por compasión',
        medidasControl: ['EPP específico según tipo de siniestro a evaluar', 'Evaluación previa de condiciones de seguridad en sitio', 'Apoyo psicológico para peritos', 'Nunca ingresar a zonas inestables sin evaluación estructural']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Gafas de protección', 'Calzado de seguridad', 'Chaleco reflectivo', 'Guantes de inspección'],
    capacitacionesObligatorias: ['Seguridad en inspecciones de campo de siniestros', 'Primeros auxilios básicos', 'Manejo del estrés en evaluación de catástrofes']
  },
  {
    codigoCIIU: '6629',
    descripcionCIIU: 'Otras actividades auxiliares de seguros y fondos de pensiones',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en actividades auxiliares de seguros',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo sedentario en actuaría, gestión de datos, cumplimiento y operaciones auxiliares del sector asegurador',
        fuenteGeneradora: 'Departamentos actuariales, compliance, gestión de datos y operaciones de aseguradoras',
        actividadAsociada: 'Análisis actuarial, gestión de bases de datos de seguros y cumplimiento normativo',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por trabajo sedentario',
        efectosPosibles: 'Lumbalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Variación de actividades']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Ergonomía en trabajo actuarial y de seguros', 'Pausas activas y bienestar laboral']
  },
  {
    codigoCIIU: '6630',
    descripcionCIIU: 'Actividades de gestión de fondos',
    sector: 'Actividades Financieras',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por gestión de activos y responsabilidad fiduciaria',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión y responsabilidad en gestión de portafolios de fondos de inversión colectiva y fondos de capital privado',
        fuenteGeneradora: 'Equipos de gestión de portafolios, comités de inversión y áreas de cumplimiento',
        actividadAsociada: 'Gestión activa de portafolios, reporte a inversionistas y cumplimiento regulatorio',
        riesgoPotencial: 'Estrés crónico por alta responsabilidad fiduciaria y volatilidad de mercados',
        efectosPosibles: 'Burnout, problemas de salud mental, errores de gestión',
        medidasControl: ['Distribución de responsabilidades en comités', 'Apoyo psicológico profesional', 'Balance vida-trabajo', 'Programas de bienestar corporativo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para gestión de portafolios'],
    capacitacionesObligatorias: ['Gestión del estrés en gestión de activos', 'Ergonomía en trabajo financiero', 'Bienestar mental en gestoras de fondos']
  },

  // ==================== SECCIÓN L - ACTIVIDADES INMOBILIARIAS ====================

  {
    codigoCIIU: '6810',
    descripcionCIIU: 'Actividades inmobiliarias realizadas con bienes propios o arrendados',
    sector: 'Actividades Inmobiliarias',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Accidente de tránsito en visitas a inmuebles',
        categoria: 'Físico',
        descripcion: 'Riesgo de accidente en desplazamientos frecuentes a propiedades para inspección, arrendamiento y venta',
        fuenteGeneradora: 'Vehículos en visitas a inmuebles urbanos y rurales',
        actividadAsociada: 'Visitas de inspección, entrega de inmuebles y gestión de contratos de arrendamiento',
        riesgoPotencial: 'Accidente de tránsito, atraco en inmuebles desocupados',
        efectosPosibles: 'Lesiones en accidente, lesiones por atraco',
        medidasControl: ['Política de seguridad vial corporativa', 'Visitas acompañadas a inmuebles en zonas de riesgo', 'Comunicación de ubicación durante visitas', 'Protocolo de seguridad en inmuebles desocupados']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario en gestión inmobiliaria de oficina',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo prolongado en pantalla para gestión de contratos, portales inmobiliarios y atención a clientes',
        fuenteGeneradora: 'Puestos de trabajo en oficinas inmobiliarias',
        actividadAsociada: 'Gestión de contratos, publicación de inmuebles y atención a propietarios e inquilinos',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por trabajo sedentario',
        efectosPosibles: 'Cervicalgia, lumbalgia, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Alternancia entre oficina y campo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Kit de seguridad vial en vehículo', 'Calzado adecuado para inspección de obra'],
    capacitacionesObligatorias: ['Conducción segura para visitas inmobiliarias', 'Seguridad en inmuebles desocupados', 'Ergonomía en trabajo de oficina y campo']
  },
  {
    codigoCIIU: '6820',
    descripcionCIIU: 'Actividades inmobiliarias realizadas a cambio de una retribución o por contrata',
    sector: 'Actividades Inmobiliarias',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en intermediación inmobiliaria y cumplimiento de metas',
        categoria: 'Psicosocial',
        descripcion: 'Presión por cierre de negocios, manejo de expectativas de clientes y trabajo por comisiones en agencias inmobiliarias',
        fuenteGeneradora: 'Agencias inmobiliarias con modelo de comisión por ventas o arrendamientos',
        actividadAsociada: 'Intermediación en compraventa y arrendamiento de inmuebles, avalúos y asesoría',
        riesgoPotencial: 'Estrés por metas de ventas, inestabilidad de ingresos variables',
        efectosPosibles: 'Ansiedad, burnout, conflictos con clientes insatisfechos',
        medidasControl: ['Metas realistas y alcanzables', 'Apoyo psicológico disponible', 'Capacitación en negociación y manejo de clientes', 'Protocolos de atención a situaciones conflictivas']
      },
      {
        codigo: 'VIA-001',
        nombre: 'Riesgo en desplazamientos para avalúos e inspecciones',
        categoria: 'Físico',
        descripcion: 'Exposición a accidentes de tránsito y situaciones de inseguridad en visitas a inmuebles para avalúos comerciales y residenciales',
        fuenteGeneradora: 'Vehículos en desplazamiento a inmuebles en toda la ciudad o municipios',
        actividadAsociada: 'Realización de avalúos comerciales, residenciales e industriales in situ',
        riesgoPotencial: 'Accidente de tránsito, situación de inseguridad en zonas de riesgo',
        efectosPosibles: 'Lesiones en accidente, agresión en zonas de inseguridad',
        medidasControl: ['Política de seguridad vial', 'Evaluación de zonas antes de visitar', 'Visitas acompañadas cuando corresponda', 'Comunicación permanente con oficina']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en intermediación', obligatorio: true }
    ],
    eppRecomendado: ['Kit vial en vehículo', 'Calzado resistente para inspección de inmuebles en construcción'],
    capacitacionesObligatorias: ['Conducción defensiva', 'Seguridad personal en visitas inmobiliarias', 'Manejo del estrés en ventas por comisión', 'Ergonomía en trabajo mixto oficina-campo']
  },

  // ==================== SECCIÓN N - ACTIVIDADES DE SERVICIOS ADMINISTRATIVOS Y DE APOYO ====================

  {
    codigoCIIU: '7710',
    descripcionCIIU: 'Alquiler y arrendamiento de vehículos automotores',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Riesgo en entrega y recibo de vehículos arrendados',
        categoria: 'Físico',
        descripcion: 'Exposición a accidentes durante pruebas de manejo, traslados de vehículos y atención en patios de renta',
        fuenteGeneradora: 'Vehículos en prueba y traslado, patio de vehículos de renta',
        actividadAsociada: 'Entrega y recibo de vehículos arrendados, traslados y revisión de daños',
        riesgoPotencial: 'Accidente de tránsito en pruebas, atropellamiento en patio',
        efectosPosibles: 'Lesiones en accidente, traumatismos',
        medidasControl: ['Política de seguridad vial para empleados', 'Señalización de patio de vehículos', 'Velocidades máximas en patio', 'Revisión previa de vehículo antes de entrega']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco reflectivo para personal de patio', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Seguridad en patio de vehículos', 'Conducción segura para traslados', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '7721',
    descripcionCIIU: 'Alquiler y arrendamiento de equipos recreativos y deportivos',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en mantenimiento de equipos deportivos y recreativos',
        categoria: 'Mecánico',
        descripcion: 'Mantenimiento y revisión de bicicletas, tablas de surf, equipos de camping y otros implementos recreativos',
        fuenteGeneradora: 'Talleres de mantenimiento de equipos recreativos',
        actividadAsociada: 'Revisión, reparación y mantenimiento de equipos de alquiler',
        riesgoPotencial: 'Cortes, golpes y atrapamientos en mantenimiento',
        efectosPosibles: 'Laceraciones, contusiones, lesiones de mano',
        medidasControl: ['Herramientas en buen estado', 'EPP para mantenimiento', 'Procedimientos de revisión documentados', 'Capacitación técnica del personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo', 'Gafas de seguridad', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Mantenimiento seguro de equipos recreativos', 'Prevención de accidentes en talleres de mantenimiento']
  },
  {
    codigoCIIU: '7722',
    descripcionCIIU: 'Alquiler de videos y discos',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo repetitivo en atención y organización de inventario',
        categoria: 'Ergonómico',
        descripcion: 'Movimientos repetitivos en clasificación, organización y búsqueda de videos y discos en estanterías',
        fuenteGeneradora: 'Estanterías de almacenamiento, mostradores de atención al cliente',
        actividadAsociada: 'Atención al cliente, organización de inventario y mantenimiento de catálogo',
        riesgoPotencial: 'Lesiones por repetitividad y posturas inadecuadas',
        efectosPosibles: 'Tendinitis, fatiga en miembros superiores',
        medidasControl: ['Rotación de actividades', 'Organización ergonómica de estanterías', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Calzado cómodo antifatiga'],
    capacitacionesObligatorias: ['Ergonomía en comercio y atención al cliente', 'Pausas activas']
  },
  {
    codigoCIIU: '7729',
    descripcionCIIU: 'Alquiler y arrendamiento de otros efectos personales y enseres domésticos',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Manejo manual de enseres en arrendamiento',
        categoria: 'Ergonómico',
        descripcion: 'Carga y descarga de muebles, electrodomésticos y enseres en operaciones de alquiler y devolución',
        fuenteGeneradora: 'Bodegas de almacenamiento y unidades de transporte de enseres',
        actividadAsociada: 'Entrega y recibo de muebles, electrodomésticos y elementos para el hogar en arrendamiento',
        riesgoPotencial: 'Lesiones dorsolumbares por manejo de cargas pesadas',
        efectosPosibles: 'Hernias, lumbalgia aguda, lesiones de hombro',
        medidasControl: ['Equipos de asistencia para carga pesada', 'Técnica correcta de levantamiento', 'Trabajo en equipo para cargas voluminosas', 'Límites de peso individual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Faja lumbar de soporte', 'Guantes de trabajo', 'Calzado de seguridad con puntera'],
    capacitacionesObligatorias: ['Manejo manual de cargas', 'Prevención de lesiones dorsolumbares', 'Ergonomía en operaciones de logística']
  },
  {
    codigoCIIU: '7730',
    descripcionCIIU: 'Alquiler y arrendamiento de maquinaria y equipo',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en mantenimiento y prueba de maquinaria arrendada',
        categoria: 'Mecánico',
        descripcion: 'Revisión, prueba y mantenimiento de maquinaria industrial y de construcción antes y después del arrendamiento',
        fuenteGeneradora: 'Maquinaria de construcción, industrial y agrícola en revisión y mantenimiento',
        actividadAsociada: 'Mantenimiento preventivo y correctivo de maquinaria de arrendamiento',
        riesgoPotencial: 'Atrapamiento, aplastamiento, cortes en mantenimiento de maquinaria',
        efectosPosibles: 'Lesiones graves, amputación, aplastamiento',
        medidasControl: ['Procedimientos LOTO para mantenimiento', 'EPP específico por tipo de maquinaria', 'Técnicos certificados para cada equipo', 'Inspección preoperacional documentada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true }
    ],
    eppRecomendado: ['Casco de seguridad', 'Guantes de trabajo', 'Calzado de seguridad', 'Gafas de protección', 'Protección auditiva'],
    capacitacionesObligatorias: ['Mantenimiento seguro de maquinaria industrial', 'Bloqueo y etiquetado LOTO', 'Seguridad en operación de equipos pesados']
  },
  {
    codigoCIIU: '7740',
    descripcionCIIU: 'Arrendamiento de propiedad intelectual y productos similares, excepto obras protegidas por derechos de autor',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario en gestión de licencias y propiedad intelectual',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de oficina en gestión de contratos de licenciamiento, negociación de regalías y administración de PI',
        fuenteGeneradora: 'Puestos de trabajo de gestión de propiedad intelectual',
        actividadAsociada: 'Negociación de contratos de licencia, gestión de regalías y registro de PI',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por trabajo sedentario',
        efectosPosibles: 'Cervicalgia, lumbalgia',
        medidasControl: ['Ergonomía del puesto de trabajo', 'Pausas activas', 'Evaluación periódica del puesto']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de oficina', 'Pausas activas y bienestar laboral']
  },
  {
    codigoCIIU: '7820',
    descripcionCIIU: 'Actividades de agencias de empleo temporal',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés laboral en gestión de personal temporal',
        categoria: 'Psicosocial',
        descripcion: 'Presión por cumplimiento de requisiciones de personal, alta rotación y manejo de quejas entre empresas usuarias y trabajadores',
        fuenteGeneradora: 'Oficinas de agencias de empleo temporal y puntos de atención',
        actividadAsociada: 'Reclutamiento, selección, contratación y administración de personal en misión',
        riesgoPotencial: 'Estrés por alta demanda, conflictos entre partes',
        efectosPosibles: 'Burnout, ansiedad',
        medidasControl: ['Distribución de cargas de requisiciones', 'Apoyo psicológico disponible', 'Capacitación en mediación laboral', 'Metas alcanzables de colocación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Gestión del estrés en recursos humanos', 'Ergonomía en trabajo de oficina', 'Marco legal del trabajo en misión']
  },
  {
    codigoCIIU: '7830',
    descripcionCIIU: 'Otras formas de suministro de recurso humano',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo psicosocial en gestión de personal subcontratado',
        categoria: 'Psicosocial',
        descripcion: 'Gestión de personal en modalidades de outsourcing, BPO y otras formas de tercerización laboral',
        fuenteGeneradora: 'Centros de coordinación de personal subcontratado',
        actividadAsociada: 'Coordinación de personal en contratos de outsourcing y gestión de nómina tercerizada',
        riesgoPotencial: 'Estrés por complejidad en gestión de múltiples contratos y personal disperso',
        efectosPosibles: 'Burnout, conflictos laborales',
        medidasControl: ['Sistemas de gestión de personal eficientes', 'Distribución adecuada de responsabilidades', 'Apoyo legal laboral disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en trabajo de oficina', 'Marco normativo del outsourcing en Colombia', 'Gestión del estrés laboral']
  },
  {
    codigoCIIU: '7911',
    descripcionCIIU: 'Actividades de las agencias de viaje',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en atención a viajeros y manejo de imprevistos',
        categoria: 'Psicosocial',
        descripcion: 'Presión por atención a situaciones de emergencia en viajes, quejas de clientes y coordinación de itinerarios complejos',
        fuenteGeneradora: 'Agencias de viaje y centros de atención telefónica de turismo',
        actividadAsociada: 'Diseño y venta de paquetes turísticos, atención a viajeros en crisis',
        riesgoPotencial: 'Estrés por manejo de emergencias de viaje, presión de ventas',
        efectosPosibles: 'Burnout, ansiedad, conflictos con clientes',
        medidasControl: ['Protocolos de atención a emergencias de viajeros', 'Apoyo psicológico disponible', 'Rotación en roles de atención', 'Capacitación en manejo de crisis']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Gestión del estrés en agencias de viaje', 'Ergonomía en trabajo de call center turístico', 'Protocolo de atención a emergencias de viajeros']
  },
  {
    codigoCIIU: '7912',
    descripcionCIIU: 'Actividades de operadores turísticos',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'VIA-001',
        nombre: 'Riesgos en operaciones turísticas de campo',
        categoria: 'Físico',
        descripcion: 'Exposición a condiciones naturales adversas en guianza turística, senderismo, rafting y ecoturismo',
        fuenteGeneradora: 'Entornos naturales: ríos, montañas, selva, zonas costeras',
        actividadAsociada: 'Guianza turística en naturaleza, operación de actividades de aventura y ecoturismo',
        riesgoPotencial: 'Accidentes en actividades de aventura, picaduras, clima adverso',
        efectosPosibles: 'Lesiones en accidente de actividad, hipotermia, picaduras de animales',
        medidasControl: ['Guías certificados por SENA o universidades turísticas', 'Kits de primeros auxilios en campo', 'Protocolos de seguridad por tipo de actividad', 'Seguros de accidentes para operadores y turistas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['EPP específico por actividad: chaleco salvavidas, casco, arnés para canopy', 'Repelente de insectos', 'Botiquín de primeros auxilios'],
    capacitacionesObligatorias: ['Seguridad en operaciones turísticas de aventura', 'Primeros auxilios en entornos naturales', 'Manejo de emergencias en turismo de naturaleza']
  },
  {
    codigoCIIU: '7990',
    descripcionCIIU: 'Otros servicios de reserva y actividades relacionadas',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo en pantalla en reservas y booking digital',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo intensivo en plataformas digitales de reservas para hoteles, vuelos y actividades turísticas',
        fuenteGeneradora: 'Centros de contacto de reservas, plataformas OTA y oficinas de booking',
        actividadAsociada: 'Gestión de reservas, atención telefónica y digital a turistas',
        riesgoPotencial: 'Fatiga visual, lesiones músculo-esqueléticas en call center de turismo',
        efectosPosibles: 'Síndrome visual, síndrome del túnel carpiano',
        medidasControl: ['Ergonomía en puestos de call center', 'Pausas auditivas y visuales', 'Rotación de actividades']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Diadema ergonómica para call center', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Ergonomía en call center turístico', 'Pausas activas y bienestar laboral']
  },
  {
    codigoCIIU: '8020',
    descripcionCIIU: 'Actividades de servicios de sistemas de seguridad',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Violencia y agresión en prestación de servicios de seguridad',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a situaciones de violencia, agresiones físicas y verbales en prestación de servicios de vigilancia y seguridad',
        fuenteGeneradora: 'Puestos de vigilancia, centros comerciales, bancos, bodegas e industrias',
        actividadAsociada: 'Vigilancia física de instalaciones, control de acceso y respuesta a emergencias de seguridad',
        riesgoPotencial: 'Agresión armada, estrés postraumático, lesiones en enfrentamientos',
        efectosPosibles: 'Heridas por agresión, PTSD, lesiones graves',
        medidasControl: ['Capacitación en técnicas de manejo de situaciones de alto riesgo', 'Armamento y equipo de protección personal según norma', 'Apoyo psicológico post-incidente', 'Comunicación permanente con central']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Trabajo nocturno y turnos prolongados en vigilancia',
        categoria: 'Físico',
        descripcion: 'Turnos de vigilancia nocturnos de 8 a 12 horas que alteran el ritmo circadiano y generan fatiga crónica',
        fuenteGeneradora: 'Puestos de vigilancia con turnos nocturnos y rotatorios',
        actividadAsociada: 'Vigilancia nocturna de instalaciones y rondas de seguridad',
        riesgoPotencial: 'Fatiga crónica, alteración del sueño, accidentes por somnolencia',
        efectosPosibles: 'Trastornos del sueño, accidentes por microsueño en ronda',
        medidasControl: ['Rotación de turnos adecuada', 'Descansos obligatorios entre turnos', 'Evaluación médica periódica de trabajadores nocturnos', 'Iluminación adecuada en puestos de vigilancia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true },
      { codigo: 'Dec. 356/1994', norma: 'Decreto 356 de 1994', descripcion: 'Estatuto de Vigilancia y Seguridad Privada', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco antibalas según amenaza', 'Uniforme de vigilancia reglamentario', 'Calzado de seguridad', 'Linterna', 'Radio de comunicación'],
    capacitacionesObligatorias: ['Vigilancia y seguridad privada - capacitación SuperVigilancia', 'Manejo de armas (si aplica)', 'Primeros auxilios', 'Manejo del estrés postraumático']
  },
  {
    codigoCIIU: '8030',
    descripcionCIIU: 'Actividades de investigación',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo a la seguridad personal en investigación privada',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a situaciones de peligro personal durante actividades de investigación, vigilancia e inteligencia privada',
        fuenteGeneradora: 'Trabajo de campo en investigaciones de fraude, infidelidad corporativa y seguimiento de personas',
        actividadAsociada: 'Investigación encubierta, seguimiento de personas y análisis de fraudes corporativos',
        riesgoPotencial: 'Agresión por personas investigadas, estrés psicológico por trabajo encubierto',
        efectosPosibles: 'Lesiones físicas, estrés crónico, PTSD en casos complejos',
        medidasControl: ['Protocolos de seguridad en trabajo de campo', 'Cobertura de identidad documentada', 'Apoyo psicológico disponible', 'Trabajo en equipo para casos de alto riesgo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true },
      { codigo: 'Dec. 356/1994', norma: 'Decreto 356 de 1994', descripcion: 'Estatuto de Vigilancia y Seguridad Privada', obligatorio: true }
    ],
    eppRecomendado: ['Dispositivo de comunicación de emergencia', 'Chaleco antibalas en casos de alto riesgo'],
    capacitacionesObligatorias: ['Seguridad personal en investigación privada', 'Marco legal de la investigación privada en Colombia', 'Manejo del estrés en trabajo de alto riesgo', 'Primeros auxilios']
  },
  {
    codigoCIIU: '8110',
    descripcionCIIU: 'Actividades combinadas de apoyo a instalaciones',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a productos de limpieza y desinfección',
        categoria: 'Químico',
        descripcion: 'Uso de productos químicos de limpieza, desinfectantes y plaguicidas en servicios de facility management',
        fuenteGeneradora: 'Productos de limpieza industrial, desinfectantes y plaguicidas para control de plagas',
        actividadAsociada: 'Limpieza general, desinfección de instalaciones y control de plagas integrado',
        riesgoPotencial: 'Irritación, quemaduras químicas, sensibilización',
        efectosPosibles: 'Dermatitis química, irritación respiratoria, asma ocupacional',
        medidasControl: ['Fichas de datos de seguridad accesibles', 'EPP químico adecuado', 'Dilución correcta de productos', 'Capacitación en manejo de productos de limpieza']
      },
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en mantenimiento de instalaciones',
        categoria: 'Físico',
        descripcion: 'Trabajos de limpieza de fachadas, mantenimiento de HVAC y reparaciones en alturas dentro de edificios y exteriores',
        fuenteGeneradora: 'Escaleras, andamios, plataformas elevadoras y rappel de fachadas',
        actividadAsociada: 'Limpieza de vidrios en altura, mantenimiento de sistemas en techos y equipos de fachada',
        riesgoPotencial: 'Caída desde altura, caída de objetos sobre personas',
        efectosPosibles: 'Traumatismos graves, politraumatismos, fatalidades',
        medidasControl: ['Sistema de protección contra caídas certificado', 'Permiso de trabajo en alturas', 'Señalización en zonas bajo trabajos en altura', 'EPP para trabajo en altura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para limpieza', 'Mascarilla para vapores de limpieza', 'Arnés de cuerpo completo para alturas', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Manejo seguro de productos de limpieza', 'Trabajo seguro en alturas', 'Ergonomía en servicios de limpieza', 'Plan de emergencia en facility management']
  },
  {
    codigoCIIU: '8121',
    descripcionCIIU: 'Limpieza general interior de edificios',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a desinfectantes y productos de limpieza',
        categoria: 'Químico',
        descripcion: 'Contacto frecuente con jabones, desinfectantes, lejías y otros productos en servicios de limpieza interior',
        fuenteGeneradora: 'Productos de limpieza domésticos e industriales en diluciones de trabajo',
        actividadAsociada: 'Limpieza de pisos, baños, mobiliario y superficies en edificios de oficinas',
        riesgoPotencial: 'Dermatitis por contacto, irritación de mucosas',
        efectosPosibles: 'Dermatitis de contacto, eccema, irritación ocular',
        medidasControl: ['Guantes de nitrilo para limpieza', 'Dilución correcta de productos', 'Rotación de tareas para reducir exposición continua', 'Cremas de barrera en manos']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Sobreesfuerzo en limpieza interior',
        categoria: 'Ergonómico',
        descripcion: 'Posturas forzadas y repetitividad en trapeado, restregado y limpieza de baños y superficies',
        fuenteGeneradora: 'Mopas, traperos, equipos de limpieza a presión',
        actividadAsociada: 'Limpieza de pisos, paredes, baños y áreas comunes',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por repetitividad y posturas forzadas',
        efectosPosibles: 'Lumbalgia, lesiones de hombro, tendinitis',
        medidasControl: ['Mopas con mango ajustable en altura', 'Carros de limpieza con buena ergonomía', 'Rotación de áreas de limpieza', 'Pausas activas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla desechable', 'Delantal impermeable', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Uso seguro de productos de limpieza', 'Ergonomía en servicios de aseo', 'Prevención de caídas en superficies mojadas', 'Pausas activas para personal de limpieza']
  },
  {
    codigoCIIU: '8129',
    descripcionCIIU: 'Otras actividades de limpieza de edificios e instalaciones industriales',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a químicos industriales en limpieza especializada',
        categoria: 'Químico',
        descripcion: 'Uso de productos agresivos para limpieza de industrias: ácidos, bases fuertes, disolventes industriales',
        fuenteGeneradora: 'Productos de limpieza industrial: ácidos, cáusticos, disolventes clorados',
        actividadAsociada: 'Limpieza de tanques, reactores, líneas de proceso y superficies industriales',
        riesgoPotencial: 'Quemaduras químicas graves, intoxicación por inhalación',
        efectosPosibles: 'Quemaduras dérmicas y oculares, daño respiratorio, intoxicación',
        medidasControl: ['EPP de máximo nivel para manejo de ácidos y cáusticos', 'Duchas y lavaojos de emergencia', 'Capacitación en manejo de químicos industriales agresivos', 'Ficha de datos de seguridad']
      },
      {
        codigo: 'CONF-001',
        nombre: 'Trabajo en espacios confinados para limpieza',
        categoria: 'Físico',
        descripcion: 'Entrada a tanques, silos, fosos y espacios confinados para limpieza industrial',
        fuenteGeneradora: 'Tanques de almacenamiento, silos, fosos y cámaras de proceso',
        actividadAsociada: 'Limpieza interior de tanques, silos y equipos de proceso',
        riesgoPotencial: 'Asfixia, intoxicación, sepultamiento en espacios confinados',
        efectosPosibles: 'Asfixia, intoxicación, fatalidades',
        medidasControl: ['Permiso de trabajo en espacios confinados', 'Monitoreo de atmósfera antes y durante entrada', 'Vigía en exterior', 'Equipo de rescate disponible', 'SCBA para entrada']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Espacios confinados y trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Traje de protección química', 'SCBA para espacios confinados', 'Guantes resistentes a ácidos', 'Gafas herméticas de protección química', 'Botas de caucho'],
    capacitacionesObligatorias: ['Manejo de químicos industriales agresivos', 'Trabajo en espacios confinados - entrada y rescate', 'Primeros auxilios en accidentes químicos']
  },
  {
    codigoCIIU: '8130',
    descripcionCIIU: 'Actividades de paisajismo y servicios de mantenimiento conexos',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a plaguicidas y fertilizantes en paisajismo',
        categoria: 'Químico',
        descripcion: 'Aplicación de herbicidas, insecticidas y fungicidas en áreas verdes urbanas e industriales',
        fuenteGeneradora: 'Productos fitosanitarios para control de plagas y malezas en jardines y zonas verdes',
        actividadAsociada: 'Fumigación, fertilización y control de plagas en áreas verdes y jardines',
        riesgoPotencial: 'Intoxicación por plaguicidas, sensibilización química',
        efectosPosibles: 'Intoxicación aguda o crónica, efectos cancerígenos en exposición prolongada',
        medidasControl: ['Uso de plaguicidas de menor toxicidad', 'EPP completo para aplicación', 'Capacitación certificada en uso de plaguicidas', 'Monitoreo biológico de colinesterasa']
      },
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en uso de equipos de paisajismo',
        categoria: 'Mecánico',
        descripcion: 'Uso de podadoras, guadañadoras, motosierras y sopladores en mantenimiento de zonas verdes',
        fuenteGeneradora: 'Podadoras de gasolina, guadañadoras, motosierras y equipos de paisajismo',
        actividadAsociada: 'Corte de césped, poda de árboles, limpieza de áreas verdes',
        riesgoPotencial: 'Proyección de objetos, cortes con motosierra, vibraciones',
        efectosPosibles: 'Lesiones graves por proyección, amputación, síndrome de vibración mano-brazo',
        medidasControl: ['Guardas de seguridad en equipos', 'EPP para uso de motosierra', 'Zona de exclusión durante corte', 'Rotación en uso de equipos vibrantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true },
      { codigo: 'Res. 2400/1979', norma: 'Resolución 2400 de 1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Polainas para motosierra', 'Casco forestal con visera y protección auditiva', 'Guantes anticorte nivel 5', 'Protección facial para guadañadora', 'Mascarilla para plaguicidas'],
    capacitacionesObligatorias: ['Uso seguro de motosierra y guadañadora', 'Manejo seguro de plaguicidas', 'Poda de árboles en altura', 'Primeros auxilios en accidentes con herramientas de corte']
  },
  {
    codigoCIIU: '8211',
    descripcionCIIU: 'Actividades combinadas de servicios administrativos de oficina',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en servicios administrativos de oficina',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo sedentario combinado de digitación, atención al cliente, archivo y gestión documental',
        fuenteGeneradora: 'Puestos administrativos multifunción, recepciones y centros de servicios compartidos',
        actividadAsociada: 'Digitación, archivo, atención telefónica, elaboración de documentos y gestión administrativa',
        riesgoPotencial: 'Lesiones músculo-esqueléticas, fatiga visual',
        efectosPosibles: 'Cervicalgia, síndrome del túnel carpiano, lumbalgia',
        medidasControl: ['Evaluación ergonómica de puestos multitarea', 'Sillas ergonómicas ajustables', 'Pausas activas programadas', 'Iluminación adecuada en áreas de trabajo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica ajustable', 'Reposamuñecas', 'Filtro de pantalla'],
    capacitacionesObligatorias: ['Ergonomía en trabajo administrativo de oficina', 'Pausas activas y bienestar laboral']
  },
  {
    codigoCIIU: '8219',
    descripcionCIIU: 'Fotocopiado, preparación de documentos y otras actividades especializadas de apoyo a oficina',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a tóner y ozono en fotocopiado',
        categoria: 'Químico',
        descripcion: 'Inhalación de partículas de tóner y ozono generado por equipos de fotocopiado e impresión láser',
        fuenteGeneradora: 'Fotocopiadoras, impresoras láser y equipos multifunción de alto volumen',
        actividadAsociada: 'Operación de equipos de fotocopiado masivo, impresión y encuadernación',
        riesgoPotencial: 'Irritación respiratoria por tóner y ozono',
        efectosPosibles: 'Irritación de vías respiratorias, dolores de cabeza',
        medidasControl: ['Ventilación adecuada en salas de fotocopiado', 'Manipulación de tóner con guantes y mascarilla', 'Mantenimiento regular de equipos', 'Pausas en zonas con menor concentración']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para cambio de tóner', 'Mascarilla desechable para mantenimiento de fotocopiadora'],
    capacitacionesObligatorias: ['Manejo seguro de tóner y consumibles de impresión', 'Ergonomía en trabajo de reprografía']
  },
  {
    codigoCIIU: '8220',
    descripcionCIIU: 'Actividades de centros de llamadas (call center)',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés laboral en call center por alta demanda emocional',
        categoria: 'Psicosocial',
        descripcion: 'Atención continua de llamadas con clientes insatisfechos, metas de productividad estrictas y monitoreo permanente',
        fuenteGeneradora: 'Plataformas de call center, supervisión en tiempo real, grabación de llamadas',
        actividadAsociada: 'Recepción y realización de llamadas de atención al cliente, ventas, cobranza y soporte',
        riesgoPotencial: 'Burnout, estrés crónico, acoso por metas de productividad',
        efectosPosibles: 'Trastornos de ansiedad, depresión, agotamiento emocional',
        medidasControl: ['Metas realistas y alcanzables', 'Apoyo psicológico disponible', 'Rotación entre tipos de llamadas', 'Supervisión constructiva no punitiva']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a ruido en call center',
        categoria: 'Físico',
        descripcion: 'Exposición continua a ruido en salas de call center con múltiples agentes y diademas',
        fuenteGeneradora: 'Salas de call center con alta densidad de agentes, diademas y equipos telefónicos',
        actividadAsociada: 'Operación de posiciones de call center durante jornadas de 8 horas',
        riesgoPotencial: 'Hipoacusia por ruido, tinnitus',
        efectosPosibles: 'Pérdida auditiva, tinnitus, fatiga auditiva',
        medidasControl: ['Limitadores de volumen en diademas (85 dB máx)', 'Medición de ruido ambiental en salas', 'Audiometría periódica', 'Zonas de silencio para descanso']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en call center', obligatorio: true }
    ],
    eppRecomendado: ['Diadema con limitador de volumen certificado', 'Silla ergonómica de call center'],
    capacitacionesObligatorias: ['Gestión del estrés y riesgo psicosocial en call center', 'Conservación auditiva para agentes telefónicos', 'Ergonomía en posición de call center', 'Técnicas de comunicación asertiva con clientes difíciles']
  },
  {
    codigoCIIU: '8230',
    descripcionCIIU: 'Organización de convenciones y eventos comerciales',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en montaje de eventos',
        categoria: 'Eléctrico',
        descripcion: 'Instalación de sistemas de iluminación, sonido y electricidad temporal en recintos de eventos',
        fuenteGeneradora: 'Instalaciones eléctricas temporales, torres de sonido, estructuras de iluminación',
        actividadAsociada: 'Montaje y desmontaje de tarimas, iluminación, sonido y decoración de eventos',
        riesgoPotencial: 'Electrocución en instalaciones temporales, caída de estructuras',
        efectosPosibles: 'Lesiones eléctricas, caída de tarimas, lesiones graves',
        medidasControl: ['Personal calificado para instalaciones eléctricas de eventos', 'Ingeniería estructural para tarimas', 'Revisión previa al evento', 'Planes de contingencia para mal tiempo']
      },
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en montaje de eventos',
        categoria: 'Físico',
        descripcion: 'Instalación de iluminación, pantallas LED y decoración en alturas durante montaje de eventos',
        fuenteGeneradora: 'Andamios, escaleras y plataformas elevadoras en recintos de eventos',
        actividadAsociada: 'Montaje de iluminación, pantallas y decoración en altura en salones y auditorios',
        riesgoPotencial: 'Caída desde altura, caída de objetos sobre asistentes',
        efectosPosibles: 'Traumatismos graves, lesiones a terceros',
        medidasControl: ['Arnés de seguridad en trabajos sobre 1.5 m', 'Señalización de zonas de montaje', 'Cronograma de montaje con anticipación al evento', 'EPP completo para equipo técnico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas en montaje', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de cuerpo completo', 'Casco de seguridad', 'Calzado de seguridad', 'Guantes de trabajo', 'Chaleco reflectivo'],
    capacitacionesObligatorias: ['Seguridad en montaje de eventos', 'Trabajo seguro en alturas', 'Instalaciones eléctricas temporales seguras', 'Plan de emergencia en eventos masivos']
  },
  {
    codigoCIIU: '8291',
    descripcionCIIU: 'Actividades de agencias de cobro y oficinas de calificación crediticia',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés emocional en gestión de cobranza',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a agresiones verbales de deudores, presión por metas de recaudo y trabajo con casos de alto conflicto',
        fuenteGeneradora: 'Call center de cobranza, visitas domiciliarias a deudores morosos',
        actividadAsociada: 'Gestión de cobranza telefónica y en campo, negociación de acuerdos de pago',
        riesgoPotencial: 'Agresión verbal y física de deudores, estrés crónico',
        efectosPosibles: 'Burnout, lesiones en visitas de campo, trastornos de ansiedad',
        medidasControl: ['Protocolos de seguridad en visitas de cobranza de campo', 'Límite de casos de alta conflictividad por asesor', 'Apoyo psicológico', 'Trabajo en pareja en cobranza de campo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial en cobranza', obligatorio: true }
    ],
    eppRecomendado: ['Diadema ergonómica para call center de cobranza', 'Silla ergonómica'],
    capacitacionesObligatorias: ['Técnicas de cobranza segura', 'Desescalada de conflictos con deudores', 'Gestión del estrés en cobranza', 'Seguridad en visitas de campo']
  },
  {
    codigoCIIU: '8292',
    descripcionCIIU: 'Actividades de envase y empaque',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Movimientos repetitivos en líneas de empaque',
        categoria: 'Ergonómico',
        descripcion: 'Alta repetitividad en operaciones de empaque, etiquetado y paletizado en líneas de producción',
        fuenteGeneradora: 'Líneas de empaque manual y semiautomático, puestos de etiquetado',
        actividadAsociada: 'Empaque, etiquetado, sellado y paletizado de productos diversos',
        riesgoPotencial: 'Lesiones músculo-esqueléticas por alta repetitividad',
        efectosPosibles: 'Síndrome del túnel carpiano, tendinitis, epicondilitis',
        medidasControl: ['Rotación de puestos de trabajo', 'Pausas activas cada hora', 'Diseño ergonómico de puestos de empaque', 'Herramientas de asistencia para paletizado']
      },
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en maquinaria de empaque',
        categoria: 'Mecánico',
        descripcion: 'Contacto con partes móviles de empacadoras, selladoras y paletizadoras automáticas',
        fuenteGeneradora: 'Empacadoras automáticas, termoselladoras, stretch wrappers y paletizadores',
        actividadAsociada: 'Operación y alimentación de maquinaria de empaque automatizada',
        riesgoPotencial: 'Atrapamiento, cortes y aplastamiento en maquinaria',
        efectosPosibles: 'Lesiones graves en manos y extremidades',
        medidasControl: ['Guardas de seguridad en todas las partes móviles', 'LOTO para mantenimiento', 'Capacitación en operación segura', 'Señalización de riesgos mecánicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'GTC-45', norma: 'GTC 45:2012', descripcion: 'Guía para identificación de peligros en empaque', obligatorio: false }
    ],
    eppRecomendado: ['Guantes anticorte para empaque', 'Calzado de seguridad', 'Protección auditiva en áreas con maquinaria ruidosa', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Ergonomía en líneas de empaque', 'Operación segura de maquinaria de empaque', 'Prevención de lesiones por movimientos repetitivos', 'Bloqueo y etiquetado LOTO']
  },
  {
    codigoCIIU: '8299',
    descripcionCIIU: 'Otras actividades de servicio de apoyo a las empresas n.c.p.',
    sector: 'Servicios Administrativos',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en servicios de apoyo empresarial diversos',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de oficina en servicios especializados de apoyo: transcripción, traducción, mensajería, lavandería industrial',
        fuenteGeneradora: 'Puestos de trabajo multifuncionales en servicios de apoyo empresarial',
        actividadAsociada: 'Transcripción, traducción, mensajería corporativa y otros servicios de apoyo',
        riesgoPotencial: 'Lesiones músculo-esqueléticas variables según actividad específica',
        efectosPosibles: 'Lesiones adaptadas al tipo de servicio prestado',
        medidasControl: ['Evaluación ergonómica por puesto específico', 'Pausas activas', 'EPP según actividad']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['EPP variable según actividad específica del servicio'],
    capacitacionesObligatorias: ['Ergonomía adaptada al puesto de trabajo', 'Pausas activas y bienestar laboral', 'Identificación de peligros en el puesto de trabajo']
  },

  // ==================== SECCIÓN O - ADMINISTRACIÓN PÚBLICA Y DEFENSA ====================

  {
    codigoCIIU: '8411',
    descripcionCIIU: 'Actividades legislativas de la administración pública',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por carga de trabajo legislativa y presión pública',
        categoria: 'Psicosocial',
        descripcion: 'Alta exposición pública, presión de grupos de interés y carga de trabajo en actividades legislativas del Congreso, Asambleas y Concejos',
        fuenteGeneradora: 'Cámaras legislativas, comisiones parlamentarias y espacios de debate público',
        actividadAsociada: 'Elaboración de leyes, debates legislativos, control político y atención ciudadana',
        riesgoPotencial: 'Estrés crónico por exposición pública, acoso y amenazas',
        efectosPosibles: 'Burnout, trastornos de ansiedad, problemas de salud mental',
        medidasControl: ['Esquemas de seguridad personal para funcionarios electos', 'Apoyo psicológico disponible', 'Gestión de cargas de trabajo legislativa', 'Protocolos de atención a amenazas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1083/2015', norma: 'Decreto 1083 de 2015', descripcion: 'Reglamento único del sector función pública', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para trabajo legislativo'],
    capacitacionesObligatorias: ['Ergonomía en trabajo legislativo', 'Gestión del estrés en cargos públicos de alta exposición', 'Bienestar mental en servidor público']
  },
  {
    codigoCIIU: '8412',
    descripcionCIIU: 'Actividades ejecutivas de la administración pública',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Carga de trabajo y estrés en administración ejecutiva pública',
        categoria: 'Psicosocial',
        descripcion: 'Alta responsabilidad en dirección de entidades públicas, gestión de recursos del Estado y rendición de cuentas',
        fuenteGeneradora: 'Ministerios, gobernaciones, alcaldías y entidades del ejecutivo',
        actividadAsociada: 'Dirección de entidades públicas, formulación de políticas, gestión de presupuesto y atención ciudadana',
        riesgoPotencial: 'Estrés por responsabilidad fiscal y política, acoso y amenazas',
        efectosPosibles: 'Burnout ejecutivo, problemas de salud mental',
        medidasControl: ['Delegación efectiva de funciones', 'Apoyo psicológico para directivos', 'Esquemas de seguridad para funcionarios expuestos', 'Gestión del equilibrio trabajo-vida']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario con alta carga cognitiva en directivos',
        categoria: 'Ergonómico',
        descripcion: 'Jornadas extensas de trabajo en oficina con alta demanda cognitiva para directivos del ejecutivo',
        fuenteGeneradora: 'Despachos y oficinas de alta dirección de entidades públicas',
        actividadAsociada: 'Reuniones, revisión de documentos, toma de decisiones y representación institucional',
        riesgoPotencial: 'Sedentarismo, fatiga cognitiva y física',
        efectosPosibles: 'Problemas cardiovasculares, cervicalgia, agotamiento',
        medidasControl: ['Silla ergonómica ejecutiva', 'Pausas activas', 'Actividad física regular', 'Exámenes médicos periódicos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1083/2015', norma: 'Decreto 1083 de 2015', descripcion: 'Reglamento único del sector función pública', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica ejecutiva', 'Soporte lumbar'],
    capacitacionesObligatorias: ['Bienestar ejecutivo en sector público', 'Ergonomía en trabajo directivo', 'Gestión del estrés en alta responsabilidad pública']
  },
  {
    codigoCIIU: '8413',
    descripcionCIIU: 'Regulación de las actividades de organismos que prestan servicios de salud, educativos, culturales y otros servicios sociales',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en funciones de inspección y vigilancia',
        categoria: 'Psicosocial',
        descripcion: 'Presión por visitas de inspección, decisiones sancionatorias y resistencia de entidades inspeccionadas en superintendencias y ministerios reguladores',
        fuenteGeneradora: 'Actividades de inspección, vigilancia y control de entidades reguladas',
        actividadAsociada: 'Inspecciones a hospitales, colegios, guarderías y entidades prestadoras de servicios sociales',
        riesgoPotencial: 'Estrés por confrontación con entidades inspeccionadas, desplazamientos frecuentes',
        efectosPosibles: 'Burnout, accidentes en desplazamientos de campo',
        medidasControl: ['Protocolos de seguridad en visitas de inspección', 'Apoyo jurídico disponible', 'Política de seguridad vial para inspectores', 'Gestión del estrés en funciones regulatorias']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1083/2015', norma: 'Decreto 1083 de 2015', descripcion: 'Reglamento único del sector función pública', obligatorio: true }
    ],
    eppRecomendado: ['Kit vial para inspectores de campo', 'EPP según tipo de entidad inspeccionada'],
    capacitacionesObligatorias: ['Seguridad en visitas de inspección y vigilancia', 'Conducción defensiva para inspectores', 'Gestión del estrés en funciones regulatorias']
  },
  {
    codigoCIIU: '8414',
    descripcionCIIU: 'Actividades reguladoras y facilitadoras de la actividad económica',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en regulación económica y atención a grupos de presión',
        categoria: 'Psicosocial',
        descripcion: 'Presión de grupos empresariales, lobby y alta responsabilidad en decisiones regulatorias que impactan sectores económicos',
        fuenteGeneradora: 'Comisiones reguladoras, superintendencias económicas y ministerios sectoriales',
        actividadAsociada: 'Formulación de regulación económica, atención a actores del sector y decisiones tarifarias',
        riesgoPotencial: 'Estrés por presión de actores económicos, responsabilidad en decisiones de impacto',
        efectosPosibles: 'Burnout, ansiedad, conflictos de interés',
        medidasControl: ['Ética pública y protocolo anti-lobby', 'Apoyo psicológico', 'Distribución colegiada de decisiones regulatorias', 'Transparencia en procesos decisorios']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica'],
    capacitacionesObligatorias: ['Ética pública y gestión del conflicto de interés', 'Bienestar en cargos regulatorios', 'Ergonomía en trabajo de oficina pública']
  },
  {
    codigoCIIU: '8415',
    descripcionCIIU: 'Actividades de los otros órganos de control',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés y amenazas en ejercicio del control público',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a amenazas, presiones indebidas y estrés en funciones de Contraloría, Procuraduría y Defensoría del Pueblo',
        fuenteGeneradora: 'Funciones disciplinarias, fiscales y de protección de derechos',
        actividadAsociada: 'Investigaciones disciplinarias, auditorías fiscales y defensa de derechos ciudadanos',
        riesgoPotencial: 'Amenazas de investigados, estrés por responsabilidad del control',
        efectosPosibles: 'Riesgo personal, burnout, trastornos de ansiedad',
        medidasControl: ['Esquemas de protección para funcionarios de control amenazados', 'Apoyo psicológico disponible', 'Trabajo en equipo para casos sensibles', 'Protocolos de denuncia de amenazas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1083/2015', norma: 'Decreto 1083 de 2015', descripcion: 'Reglamento único del sector función pública', obligatorio: true }
    ],
    eppRecomendado: ['Dispositivo de comunicación de emergencia para funcionarios en campo'],
    capacitacionesObligatorias: ['Seguridad personal para funcionarios de control', 'Gestión del estrés en funciones disciplinarias', 'Ética y bienestar en órganos de control']
  },
  {
    codigoCIIU: '8421',
    descripcionCIIU: 'Relaciones exteriores',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés por trabajo diplomático en destinos de riesgo',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a contextos de conflicto, inestabilidad política y lejanía familiar en misiones diplomáticas en el exterior',
        fuenteGeneradora: 'Embajadas y consulados colombianos en países de riesgo o conflicto',
        actividadAsociada: 'Representación diplomática, atención consular a colombianos y negociación internacional',
        riesgoPotencial: 'Riesgo personal en zonas de conflicto, estrés por aislamiento',
        efectosPosibles: 'PTSD, burnout diplomático, problemas de salud mental',
        medidasControl: ['Evaluación de destinos de riesgo', 'Apoyo psicológico para diplomáticos en destinos difíciles', 'Rotación en destinos de alta tensión', 'Protocolos de seguridad diplomática']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Kit de seguridad para destinos de riesgo'],
    capacitacionesObligatorias: ['Seguridad para diplomáticos en destinos de riesgo', 'Gestión del estrés en el exterior', 'Ergonomía en trabajo diplomático']
  },
  {
    codigoCIIU: '8422',
    descripcionCIIU: 'Actividades de defensa',
    sector: 'Administración Pública',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'VIO-001',
        nombre: 'Riesgo de combate y operaciones militares',
        categoria: 'Físico',
        descripcion: 'Exposición directa a situaciones de combate, explosivos, emboscadas y operaciones militares en zonas de conflicto',
        fuenteGeneradora: 'Zonas de operaciones militares, frentes de combate y operativos de seguridad',
        actividadAsociada: 'Operaciones militares de combate, patrullajes, operativos contra grupos armados ilegales',
        riesgoPotencial: 'Heridas de combate, explosiones, emboscadas',
        efectosPosibles: 'Heridas graves, amputaciones, fatalidades en combate',
        medidasControl: ['Equipamiento militar de protección balística', 'Doctrina de operaciones segura', 'Inteligencia previa a operaciones', 'Atención médica de emergencia en campo (MEDEVAC)']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Estrés postraumático en personal militar',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a situaciones de combate, muerte de compañeros y violencia extrema que generan PTSD en militares',
        fuenteGeneradora: 'Experiencias de combate, operativos de alta tensión y pérdida de compañeros',
        actividadAsociada: 'Personal militar activo y veteranos con exposición a combate',
        riesgoPotencial: 'Trastorno de estrés postraumático (PTSD), suicidio militar',
        efectosPosibles: 'PTSD, depresión grave, suicidio, problemas familiares',
        medidasControl: ['Programas de salud mental para militares', 'Psicólogos militares especializados en trauma', 'Protocolos de apoyo post-combate', 'Red de apoyo entre pares (peer support)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V defensa', obligatorio: true },
      { codigo: 'Dec. 1512/2000', norma: 'Decreto 1512 de 2000', descripcion: 'Sistema de salud de las Fuerzas Militares', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco balístico', 'Casco balístico', 'Protección auditiva balística', 'Kit de atención TCCC (Tactical Combat Casualty Care)'],
    capacitacionesObligatorias: ['Primeros auxilios en combate (TCCC)', 'Salud mental militar y manejo del PTSD', 'Doctrina de operaciones seguras', 'Evacuación médica en campo']
  },
  {
    codigoCIIU: '8423',
    descripcionCIIU: 'Orden público y actividades de seguridad',
    sector: 'Administración Pública',
    nivelRiesgo: 'V',
    peligrosIdentificados: [
      {
        codigo: 'VIO-001',
        nombre: 'Riesgo de agresión en actividades de orden público',
        categoria: 'Físico',
        descripcion: 'Exposición a agresiones físicas, armas de fuego, armas contundentes y dispositivos explosivos en operaciones de Policía Nacional',
        fuenteGeneradora: 'Operativos policiales, control de disturbios, capturas y operaciones contra delincuencia',
        actividadAsociada: 'Patrullaje, capturas, control de disturbios y operaciones de seguridad pública',
        riesgoPotencial: 'Heridas por arma de fuego, corte o contundente, exposición a explosivos',
        efectosPosibles: 'Heridas graves, amputaciones, fatalidades en servicio',
        medidasControl: ['Chaleco antibalas de nivel adecuado', 'Capacitación en uso de la fuerza proporcional', 'Apoyo inmediato en operativos', 'Atención médica de emergencia policial']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Estrés y PTSD en personal de orden público',
        categoria: 'Psicosocial',
        descripcion: 'Exposición crónica a situaciones de violencia, muerte y trauma en servicio policial',
        fuenteGeneradora: 'Servicio policial en zonas de alta criminalidad, atención de emergencias y combate al crimen',
        actividadAsociada: 'Patrullaje en zonas de riesgo, atención de emergencias y operativos de alto impacto',
        riesgoPotencial: 'PTSD, burnout policial, conductas de riesgo',
        efectosPosibles: 'Trastornos mentales, suicidio policial, problemas familiares',
        medidasControl: ['Psicólogos especializados en trauma policial', 'Programas de bienestar para uniformados', 'Rotación en zonas de alta criminalidad', 'Peer support entre uniformados']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo V orden público', obligatorio: true },
      { codigo: 'Dec. 1512/2000', norma: 'Decreto 1512 de 2000', descripcion: 'Sistema de salud de las Fuerzas Militares y Policía', obligatorio: true }
    ],
    eppRecomendado: ['Chaleco antibalas', 'Casco antimotines', 'Escudo balístico', 'Guantes de protección', 'Botas de seguridad reforzadas'],
    capacitacionesObligatorias: ['Uso de la fuerza proporcional', 'Salud mental policial y prevención del suicidio', 'Primeros auxilios para agentes de policía', 'Manejo del estrés operacional']
  },
  {
    codigoCIIU: '8424',
    descripcionCIIU: 'Administración de justicia',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés y amenazas en administración de justicia',
        categoria: 'Psicosocial',
        descripcion: 'Presión extrema, amenazas de partes procesales y exposición a casos de alta violencia en jueces, fiscales y magistrados',
        fuenteGeneradora: 'Juzgados, tribunales, Fiscalía y Cortes de justicia',
        actividadAsociada: 'Dirección de audiencias, investigación penal, decisiones judiciales y procesos penales',
        riesgoPotencial: 'Amenazas de partes procesales, estrés crónico por carga de casos',
        efectosPosibles: 'Riesgo personal, burnout judicial, PTSD por casos traumáticos',
        medidasControl: ['Esquemas de protección para funcionarios judiciales amenazados', 'Apoyo psicológico especializado', 'Gestión de carga de trabajo judicial', 'Protocolos de seguridad en sedes judiciales']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Esquemas de seguridad personal para jueces y fiscales amenazados'],
    capacitacionesObligatorias: ['Seguridad para funcionarios judiciales', 'Bienestar y salud mental en la judicatura', 'Manejo del estrés en altas responsabilidades judiciales']
  },
  {
    codigoCIIU: '8430',
    descripcionCIIU: 'Actividades de planes de seguridad social de afiliación obligatoria',
    sector: 'Administración Pública',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en administración de seguridad social obligatoria',
        categoria: 'Psicosocial',
        descripcion: 'Alta presión en gestión de subsidios, pensiones y prestaciones de la seguridad social obligatoria con demanda masiva de ciudadanos',
        fuenteGeneradora: 'ICBF, COLPENSIONES, SENA y entidades de seguridad social obligatoria',
        actividadAsociada: 'Atención ciudadana masiva, gestión de subsidios, beneficios y trámites de seguridad social',
        riesgoPotencial: 'Estrés por alta demanda, agresión de usuarios insatisfechos',
        efectosPosibles: 'Burnout, agresiones verbales o físicas de usuarios',
        medidasControl: ['Sistemas de gestión de turnos eficientes', 'Capacitación en atención al ciudadano', 'Seguridad física en puntos de atención', 'Apoyo psicológico para personal de atención masiva']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1083/2015', norma: 'Decreto 1083 de 2015', descripcion: 'Reglamento único del sector función pública', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica para atención al ciudadano'],
    capacitacionesObligatorias: ['Atención al ciudadano en servicios sociales', 'Manejo del estrés en atención masiva', 'Ergonomía en puestos de atención pública', 'Primeros auxilios psicológicos']
  },

  // ==================== SECCIÓN R - ARTES, ENTRETENIMIENTO Y RECREACIÓN ====================

  {
    codigoCIIU: '9001',
    descripcionCIIU: 'Creación literaria',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Trabajo sedentario prolongado en escritura',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo de escritura prolongado con uso intensivo de teclado y pantalla en oficinas o espacios de trabajo propios',
        fuenteGeneradora: 'Computadores, laptops y escritorios de escritura en hogares y oficinas',
        actividadAsociada: 'Redacción de novelas, cuentos, poesía, ensayos y obras literarias',
        riesgoPotencial: 'Lesiones músculo-esqueléticas, fatiga visual',
        efectosPosibles: 'Síndrome del túnel carpiano, cervicalgia, fatiga ocular',
        medidasControl: ['Ergonomía del puesto de escritura', 'Pausas activas cada hora', 'Variación de postura entre escritura y actividad física', 'Software con seguimiento de postura']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Silla ergonómica', 'Reposamuñecas', 'Gafas con filtro de luz azul'],
    capacitacionesObligatorias: ['Ergonomía en trabajo creativo digital', 'Higiene postural para escritores', 'Pausas activas y bienestar']
  },
  {
    codigoCIIU: '9002',
    descripcionCIIU: 'Creación musical',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a ruido en composición y producción musical',
        categoria: 'Físico',
        descripcion: 'Exposición a niveles elevados de sonido durante composición, grabación y producción de obras musicales',
        fuenteGeneradora: 'Estudios de grabación, instrumentos musicales amplificados, monitores de estudio',
        actividadAsociada: 'Composición con instrumentos, grabación y producción musical digital',
        riesgoPotencial: 'Hipoacusia inducida por ruido en músicos y productores',
        efectosPosibles: 'Pérdida auditiva, tinnitus, hiperacusia',
        medidasControl: ['Monitoreo de niveles sonoros en estudio', 'In-ears con limitador de volumen', 'Descansos auditivos periódicos', 'Audiometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Protectores auditivos de alta fidelidad para músicos', 'In-ear monitors con limitador'],
    capacitacionesObligatorias: ['Conservación auditiva para músicos', 'Ergonomía en instrumentistas', 'Pausas activas y bienestar']
  },
  {
    codigoCIIU: '9003',
    descripcionCIIU: 'Creación teatral',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ERG-001',
        nombre: 'Esfuerzo físico y lesiones en ensayos teatrales',
        categoria: 'Ergonómico',
        descripcion: 'Movimientos escénicos extremos, acrobacias, lucha coreografiada y esfuerzo vocal en ensayos y presentaciones teatrales',
        fuenteGeneradora: 'Escenarios, salas de ensayo y espacios de entrenamiento teatral',
        actividadAsociada: 'Ensayos de obras teatrales, entrenamiento físico de actores y montaje de escenas',
        riesgoPotencial: 'Lesiones musculares, caídas en escena, disfonía',
        efectosPosibles: 'Esguinces, desgarros, fracturas, nódulos vocales',
        medidasControl: ['Calentamiento previo a ensayos y funciones', 'Coreógrafo o coordinador de movimiento', 'Entrenamiento vocal con fonoaudiólogo', 'Superficie de escenario segura y antideslizante']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Calzado de escena adecuado a cada producción', 'Rodilleras para escenas de caída'],
    capacitacionesObligatorias: ['Prevención de lesiones en artes escénicas', 'Cuidado vocal para actores', 'Primeros auxilios básicos en producciones']
  },
  {
    codigoCIIU: '9004',
    descripcionCIIU: 'Creación audiovisual',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ELE-001',
        nombre: 'Riesgo eléctrico en sets de producción audiovisual',
        categoria: 'Eléctrico',
        descripcion: 'Instalación y operación de sistemas de iluminación de alta potencia en sets de producción audiovisual',
        fuenteGeneradora: 'Luminarias de estudio, generadores portátiles y cables de extensión en sets',
        actividadAsociada: 'Grabación y producción de contenido audiovisual en estudios y exteriores',
        riesgoPotencial: 'Electrocución, incendio eléctrico, quemaduras por lámparas',
        efectosPosibles: 'Lesiones eléctricas, quemaduras, incendio de set',
        medidasControl: ['Gaffer certificado en instalaciones de set', 'EPP para trabajo eléctrico en producción', 'Inspección eléctrica previa a grabación', 'Extintor en set de grabación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes para manejo de luminarias calientes', 'Calzado de seguridad en set'],
    capacitacionesObligatorias: ['Seguridad eléctrica en producción audiovisual', 'Seguridad en set de grabación', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '9005',
    descripcionCIIU: 'Artes plásticas y visuales',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a pigmentos, solventes y materiales artísticos',
        categoria: 'Químico',
        descripcion: 'Contacto con pigmentos que pueden contener metales pesados, solventes para pintura y materiales de escultura',
        fuenteGeneradora: 'Pinturas al óleo con solventes, pigmentos metálicos, resinas epóxicas y materiales de escultura',
        actividadAsociada: 'Pintura, escultura, cerámica, grabado y otras técnicas de artes plásticas',
        riesgoPotencial: 'Intoxicación por solventes, dermatitis por pigmentos',
        efectosPosibles: 'Irritación dérmica, inhalación de vapores de disolventes',
        medidasControl: ['Ventilación en talleres de artes plásticas', 'Uso de materiales de menor toxicidad', 'Guantes para manejo de pigmentos', 'Fichas de seguridad de materiales artísticos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla para vapores de solventes', 'Delantal de protección'],
    capacitacionesObligatorias: ['Uso seguro de materiales artísticos', 'Ergonomía en trabajo de taller artístico', 'Higiene en artes plásticas']
  },
  {
    codigoCIIU: '9006',
    descripcionCIIU: 'Actividades teatrales',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en infraestructura teatral',
        categoria: 'Físico',
        descripcion: 'Trabajo en tramoya, parrillas de iluminación y cámaras altas de teatros y auditorios',
        fuenteGeneradora: 'Parrillas de iluminación, escotillones y sistemas de tramoya en teatros',
        actividadAsociada: 'Operación de tramoya, iluminación y efectos especiales en producciones teatrales',
        riesgoPotencial: 'Caída desde altura, caída de equipos de iluminación sobre el escenario',
        efectosPosibles: 'Traumatismos graves, lesiones a actores o público',
        medidasControl: ['Arnés de seguridad en parrillas de iluminación', 'Inspección de fijaciones de luminarias', 'Zona de exclusión bajo trabajos en parrilla', 'Mantenimiento preventivo de tramoya']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas en espectáculos', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de seguridad para tramoya', 'Casco en áreas de tramoya', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Trabajo seguro en alturas en teatros', 'Seguridad en producción teatral', 'Plan de emergencia y evacuación de teatros']
  },
  {
    codigoCIIU: '9007',
    descripcionCIIU: 'Actividades de espectáculos musicales en vivo',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Exposición a ruido extremo en conciertos',
        categoria: 'Físico',
        descripcion: 'Exposición a niveles de presión sonora superiores a 100 dB en conciertos en vivo para músicos, técnicos y personal de producción',
        fuenteGeneradora: 'Sistemas de sonido de conciertos, monitores de escena y PA systems',
        actividadAsociada: 'Actuación en conciertos, operación de sonido y producción de eventos musicales en vivo',
        riesgoPotencial: 'Hipoacusia severa por exposición a ruido extremo',
        efectosPosibles: 'Pérdida auditiva irreversible, tinnitus crónico',
        medidasControl: ['In-ears con limitador de volumen para músicos', 'Protectores auditivos de alta fidelidad para técnicos', 'Medición de SPL en escenario', 'Descansos auditivos entre shows']
      },
      {
        codigo: 'ALT-001',
        nombre: 'Trabajo en alturas en montaje de escenarios',
        categoria: 'Físico',
        descripcion: 'Montaje de estructuras de iluminación, sonido y efectos especiales a gran altura en conciertos al aire libre y en recintos',
        fuenteGeneradora: 'Torres de sonido, estructuras de iluminación y rigging de escenario',
        actividadAsociada: 'Montaje y desmontaje de estructuras de producción de conciertos',
        riesgoPotencial: 'Caída desde altura, colapso de estructuras por viento',
        efectosPosibles: 'Traumatismos graves, fatalidades',
        medidasControl: ['Ingeniería certificada para estructuras temporales de concierto', 'Arnés de seguridad para riggers', 'Monitoreo de condiciones climáticas', 'Protocolo de evacuación ante clima extremo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas en espectáculos', obligatorio: true }
    ],
    eppRecomendado: ['Protectores auditivos de alta fidelidad', 'Arnés de seguridad para riggers', 'Casco en áreas de montaje', 'Calzado de seguridad'],
    capacitacionesObligatorias: ['Conservación auditiva para músicos y técnicos de sonido', 'Trabajo seguro en alturas - rigging de conciertos', 'Plan de emergencia para eventos masivos', 'Seguridad en estructuras temporales']
  },
  {
    codigoCIIU: '9008',
    descripcionCIIU: 'Otras actividades de espectáculos en vivo n.c.p.',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Riesgos físicos en espectáculos de variedades y circo',
        categoria: 'Físico',
        descripcion: 'Acrobacias, equilibrismo, malabares y otras actividades de alto riesgo físico en espectáculos de variedades',
        fuenteGeneradora: 'Pistas de circo, escenarios de variedades y espacios de espectáculos alternativos',
        actividadAsociada: 'Actuaciones de circo, variedades, magia y espectáculos de habilidades',
        riesgoPotencial: 'Caídas, lesiones por acrobacias, equipo fallido en altura',
        efectosPosibles: 'Fracturas, politraumatismos, lesiones de columna',
        medidasControl: ['Redes de seguridad certificadas', 'Entrenamiento progresivo y supervisado', 'Inspección diaria de equipos de circo', 'Médico disponible en ensayos y funciones']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 4272/2021', norma: 'Resolución 4272 de 2021', descripcion: 'Trabajo seguro en alturas en espectáculos', obligatorio: true }
    ],
    eppRecomendado: ['Arnés de seguridad para acrobacias en altura', 'Rodilleras y coderas para entrenamientos', 'Calzado especializado para cada disciplina'],
    capacitacionesObligatorias: ['Seguridad en artes del circo y variedades', 'Trabajo seguro en alturas para acróbatas', 'Primeros auxilios para lesiones en artes escénicas']
  },
  {
    codigoCIIU: '9101',
    descripcionCIIU: 'Actividades de bibliotecas y archivos',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'BIO-001',
        nombre: 'Exposición a polvo de archivo y biocontaminantes',
        categoria: 'Biológico',
        descripcion: 'Inhalación de polvo de materiales de archivo, esporas de hongos y ácaros en acervos documentales antiguos',
        fuenteGeneradora: 'Archivos históricos, depósitos de documentos antiguos y colecciones bibliográficas',
        actividadAsociada: 'Catalogación, restauración y gestión de archivos históricos y colecciones bibliográficas',
        riesgoPotencial: 'Alergias respiratorias, asma por exposición a esporas y ácaros',
        efectosPosibles: 'Rinitis alérgica, asma ocupacional, reacciones alérgicas',
        medidasControl: ['Mascarilla N95 en trabajo con archivos antiguos', 'Control de humedad en depósitos (45-55% HR)', 'Guantes para manejo de materiales antiguos', 'Ventilación en depósitos de archivos']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Riesgos ergonómicos en gestión de colecciones',
        categoria: 'Ergonómico',
        descripcion: 'Trabajo repetitivo en catalogación, digitalización y manipulación de libros y documentos en posiciones variadas',
        fuenteGeneradora: 'Estaciones de catalogación, escáneres de digitalización y estanterías de archivos',
        actividadAsociada: 'Catalogación, digitalización y préstamo de material bibliográfico y documental',
        riesgoPotencial: 'Lesiones por postura forzada y manejo de libros pesados',
        efectosPosibles: 'Lumbalgia, síndrome del túnel carpiano',
        medidasControl: ['Carros de transporte de libros', 'Ergonomía en estaciones de catalogación', 'Rotación de tareas entre depósito y atención']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla N95 para archivos históricos', 'Guantes de algodón para documentos antiguos', 'Delantal de trabajo'],
    capacitacionesObligatorias: ['Higiene en trabajo con archivos históricos', 'Ergonomía en bibliotecas y archivos', 'Prevención de alergias en archivística']
  },
  {
    codigoCIIU: '9102',
    descripcionCIIU: 'Actividades y funcionamiento de museos, conservación de edificios y sitios históricos',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a productos de conservación y restauración',
        categoria: 'Químico',
        descripcion: 'Uso de solventes, consolidantes y biocidas en restauración y conservación de bienes culturales y patrimoniales',
        fuenteGeneradora: 'Talleres de restauración: solventes, resinas, biocidas y materiales de consolidación',
        actividadAsociada: 'Restauración de obras de arte, conservación de documentos históricos y mantenimiento de bienes patrimoniales',
        riesgoPotencial: 'Intoxicación por solventes, sensibilización a resinas',
        efectosPosibles: 'Daño neurológico, dermatitis, sensibilización química',
        medidasControl: ['Ventilación en talleres de restauración', 'EPP para restauradores', 'Fichas de seguridad de materiales de conservación', 'Sustitución de solventes por alternativas más seguras']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para restauración', 'Mascarilla con filtros para solventes', 'Delantal de trabajo en taller'],
    capacitacionesObligatorias: ['Uso seguro de productos de restauración', 'Ergonomía en trabajo de conservación', 'Higiene en museos y centros de restauración']
  },
  {
    codigoCIIU: '9103',
    descripcionCIIU: 'Actividades de jardines botánicos, zoológicos y reservas naturales',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'BIO-001',
        nombre: 'Exposición a animales y zoonosis en zoológicos',
        categoria: 'Biológico',
        descripcion: 'Contacto con animales silvestres que pueden transmitir zoonosis, morder, arañar o provocar lesiones físicas',
        fuenteGeneradora: 'Recintos de animales silvestres, áreas de cuarentena veterinaria y jaulas de mantenimiento',
        actividadAsociada: 'Cuidado, alimentación y manejo de animales silvestres en cautiverio',
        riesgoPotencial: 'Mordeduras, zoonosis, lesiones por embestida de animales',
        efectosPosibles: 'Heridas por mordedura, enfermedades zoonóticas, fracturas',
        medidasControl: ['Protocolos de manejo seguro de animales silvestres', 'Vacunación antirráabica y otras para cuidadores', 'EPP de protección para manejo de animales', 'Procedimientos de seguridad en recintos de animales peligrosos']
      },
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a plaguicidas en jardines botánicos',
        categoria: 'Químico',
        descripcion: 'Aplicación de herbicidas, fungicidas e insecticidas en mantenimiento de colecciones botánicas y jardines',
        fuenteGeneradora: 'Productos fitosanitarios para mantenimiento de colecciones vegetales',
        actividadAsociada: 'Mantenimiento de jardines botánicos, control de plagas en colecciones vivas',
        riesgoPotencial: 'Intoxicación por plaguicidas, sensibilización',
        efectosPosibles: 'Intoxicación aguda, efectos crónicos de exposición a plaguicidas',
        medidasControl: ['EPP para aplicación de plaguicidas', 'Uso de plaguicidas de menor toxicidad', 'Rotación de aplicadores', 'Monitoreo biológico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de cuero grueso para manejo de animales', 'Mascarilla para plaguicidas', 'Botas de seguridad', 'Casco para trabajo cerca de animales grandes'],
    capacitacionesObligatorias: ['Manejo seguro de animales silvestres', 'Prevención de zoonosis', 'Manejo de plaguicidas en jardines botánicos', 'Primeros auxilios en mordeduras y ataques de animales']
  },
  {
    codigoCIIU: '9200',
    descripcionCIIU: 'Actividades de juegos de azar y apuestas',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Riesgo de agresión y atraco en establecimientos de juego',
        categoria: 'Psicosocial',
        descripcion: 'Exposición a robos, atracos y agresiones de clientes en casinos, bingos y establecimientos de apuestas con manejo de efectivo',
        fuenteGeneradora: 'Casinos, bingos, terminales de apuestas y establecimientos de juego',
        actividadAsociada: 'Operación de mesas de juego, atención en caja, vigilancia y servicio al cliente en establecimientos de juego',
        riesgoPotencial: 'Atraco armado, agresión de clientes insatisfechos, estrés por turnos nocturnos',
        efectosPosibles: 'Lesiones físicas en atraco, estrés postraumático, fatiga por turnos',
        medidasControl: ['Sistemas de seguridad electrónica y vigilancia', 'Personal de seguridad capacitado', 'Protocolos de manejo de efectivo', 'Apoyo psicológico post-incidente']
      },
      {
        codigo: 'FIS-001',
        nombre: 'Trabajo nocturno en casinos y establecimientos de apuestas',
        categoria: 'Físico',
        descripcion: 'Turnos nocturnos extendidos en ambientes con humo de cigarrillo, ruido y exposición continua en casinos',
        fuenteGeneradora: 'Casinos con operación 24/7, humo de cigarrillo y ruido constante',
        actividadAsociada: 'Operación de mesas, servicio de atención y seguridad en turnos nocturnos de casinos',
        riesgoPotencial: 'Alteración del ritmo circadiano, exposición a humo de tabaco ambiental',
        efectosPosibles: 'Trastornos del sueño, problemas respiratorios por humo',
        medidasControl: ['Zonas de no fumadores o ventilación con renovación de aire', 'Rotación de turnos adecuada', 'Descansos obligatorios entre turnos', 'Exámenes médicos periódicos para trabajadores nocturnos']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true },
      { codigo: 'Res. 2646/2008', norma: 'Resolución 2646 de 2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Calzado antifatiga para personal de pie', 'Silla ergonómica para dealers'],
    capacitacionesObligatorias: ['Seguridad en establecimientos de juego', 'Manejo del estrés en trabajo nocturno', 'Ergonomía para trabajo de pie prolongado', 'Primeros auxilios básicos']
  },
  {
    codigoCIIU: '9311',
    descripcionCIIU: 'Gestión de instalaciones deportivas',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en mantenimiento de instalaciones deportivas',
        categoria: 'Mecánico',
        descripcion: 'Mantenimiento de canchas, piscinas, gimnasios y equipos deportivos con exposición a riesgos mecánicos y químicos',
        fuenteGeneradora: 'Equipos de mantenimiento de canchas, piscinas con cloro, maquinaria de césped',
        actividadAsociada: 'Mantenimiento de canchas, piscinas, gimnasios y equipos deportivos',
        riesgoPotencial: 'Caídas, cortes, exposición a cloro en piscinas',
        efectosPosibles: 'Lesiones variadas según actividad de mantenimiento',
        medidasControl: ['EPP según tipo de mantenimiento', 'Control de químicos en piscinas', 'Procedimientos seguros de mantenimiento', 'Capacitación del personal técnico']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de protección química para manejo de cloro', 'Calzado antideslizante en áreas de piscina', 'Gafas de protección'],
    capacitacionesObligatorias: ['Manejo seguro de productos para piscinas', 'Ergonomía en mantenimiento deportivo', 'Plan de emergencia en instalaciones deportivas']
  },
  {
    codigoCIIU: '9312',
    descripcionCIIU: 'Actividades de clubes deportivos',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Lesiones deportivas en entrenamiento y competencia',
        categoria: 'Físico',
        descripcion: 'Riesgo de lesiones musculares, articulares y traumáticas en deportistas y entrenadores de clubes deportivos',
        fuenteGeneradora: 'Canchas, pistas, piscinas y espacios de entrenamiento y competencia',
        actividadAsociada: 'Entrenamiento deportivo, preparación física y competencias de clubes deportivos',
        riesgoPotencial: 'Lesiones musculares, articulares, traumatismos en competencia',
        efectosPosibles: 'Esguinces, fracturas, lesiones articulares, contusiones',
        medidasControl: ['Calentamiento y estiramiento previo', 'Supervisión médica deportiva', 'Equipamiento de protección según deporte', 'Protocolos de retorno al juego tras lesión']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Equipamiento deportivo de protección según disciplina', 'Kit de primeros auxilios en instalaciones'],
    capacitacionesObligatorias: ['Prevención de lesiones deportivas', 'Primeros auxilios en instalaciones deportivas', 'Protocolos de conmoción cerebral en deportes de contacto']
  },
  {
    codigoCIIU: '9319',
    descripcionCIIU: 'Otras actividades deportivas',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Riesgos físicos en deportes extremos y actividades al aire libre',
        categoria: 'Físico',
        descripcion: 'Lesiones en deportes de alto riesgo como escalada, parapente, motocross, deportes de combate y actividades extremas',
        fuenteGeneradora: 'Entornos naturales y artificiales de práctica de deportes extremos',
        actividadAsociada: 'Instrucción, organización y práctica de deportes no convencionales y extremos',
        riesgoPotencial: 'Caídas graves, politraumatismos, lesiones en deportes extremos',
        efectosPosibles: 'Fracturas, traumatismo craneoencefálico, lesiones graves',
        medidasControl: ['EPP específico y certificado para cada deporte extremo', 'Instrucción certificada', 'Protocolos de seguridad por deporte', 'Evaluación médica previa para participantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['EPP específico según deporte (casco, arnés, rodilleras, etc.)', 'Kit de primeros auxilios de campo'],
    capacitacionesObligatorias: ['Seguridad específica por disciplina deportiva', 'Primeros auxilios en entornos deportivos extremos', 'Evaluación de riesgos en deportes de aventura']
  },
  {
    codigoCIIU: '9321',
    descripcionCIIU: 'Actividades de parques de atracciones y parques temáticos',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'III',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos mecánicos en operación de atracciones',
        categoria: 'Mecánico',
        descripcion: 'Operación y mantenimiento de atracciones mecánicas: montañas rusas, ruedas de la fortuna, carruseles y atracciones acuáticas',
        fuenteGeneradora: 'Atracciones mecánicas y estructuras de parques de diversiones',
        actividadAsociada: 'Operación, inspección y mantenimiento de atracciones en parques temáticos',
        riesgoPotencial: 'Atrapamiento en mecanismos, caída desde estructuras de atracción',
        efectosPosibles: 'Lesiones graves, aplastamiento, caídas desde altura',
        medidasControl: ['Mantenimiento preventivo según estándares ASTM', 'Inspección diaria de atracciones', 'Operadores capacitados y certificados', 'Sistemas de seguridad redundantes en atracciones']
      },
      {
        codigo: 'PSI-001',
        nombre: 'Carga emocional en atención a público masivo',
        categoria: 'Psicosocial',
        descripcion: 'Atención a grandes volúmenes de público con situaciones de emergencia, niños perdidos, accidentes y quejas en parques temáticos',
        fuenteGeneradora: 'Operación de parques con alta afluencia de visitantes en temporadas pico',
        actividadAsociada: 'Atención al visitante, operación de atracciones y gestión de emergencias en parques',
        riesgoPotencial: 'Estrés por atención masiva, incidentes con visitantes',
        efectosPosibles: 'Burnout en temporada alta, estrés agudo por incidentes',
        medidasControl: ['Dotación adecuada de personal en temporada alta', 'Rotación de personal en atracciones de alta demanda', 'Apoyo psicológico disponible', 'Protocolos de manejo de emergencias con visitantes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo III', obligatorio: true }
    ],
    eppRecomendado: ['Calzado de seguridad para mantenimiento de atracciones', 'Guantes de trabajo', 'Casco en mantenimiento de estructuras altas'],
    capacitacionesObligatorias: ['Operación segura de atracciones mecánicas', 'Plan de emergencia en parques de atracciones', 'Primeros auxilios en eventos masivos', 'Atención al cliente en situaciones de crisis']
  },
  {
    codigoCIIU: '9329',
    descripcionCIIU: 'Otras actividades recreativas y de esparcimiento n.c.p.',
    sector: 'Artes y Entretenimiento',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Riesgos físicos en actividades recreativas diversas',
        categoria: 'Físico',
        descripcion: 'Exposición a riesgos variados en actividades de esparcimiento: paintball, karting, bolos, billar, juegos de mesa competitivos y similares',
        fuenteGeneradora: 'Instalaciones de actividades recreativas diversas',
        actividadAsociada: 'Instrucción, operación y mantenimiento de instalaciones de recreación y esparcimiento',
        riesgoPotencial: 'Lesiones moderadas según actividad específica',
        efectosPosibles: 'Contusiones, esguinces, lesiones moderadas',
        medidasControl: ['EPP según actividad recreativa (gafas en paintball, cascos en karting)', 'Instrucción de seguridad a participantes', 'Mantenimiento de equipos e instalaciones', 'Plan de primeros auxilios disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['EPP específico según actividad recreativa ofrecida', 'Kit de primeros auxilios'],
    capacitacionesObligatorias: ['Seguridad en actividades recreativas', 'Primeros auxilios para operadores recreativos', 'Atención al cliente en emergencias']
  },

  // ==================== SECCIÓN T - ACTIVIDADES DE LOS HOGARES ====================

  {
    codigoCIIU: '9700',
    descripcionCIIU: 'Actividades de los hogares individuales como empleadores de personal doméstico',
    sector: 'Hogares como Empleadores',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'QUI-001',
        nombre: 'Exposición a productos de limpieza en el hogar',
        categoria: 'Químico',
        descripcion: 'Uso frecuente de productos de limpieza, desinfectantes y plaguicidas domésticos por trabajadoras del hogar',
        fuenteGeneradora: 'Productos domésticos de limpieza: lejía, desengrasantes, limpiapisos y plaguicidas',
        actividadAsociada: 'Limpieza del hogar, lavado de ropa, preparación de alimentos y cuidado de personas',
        riesgoPotencial: 'Dermatitis por contacto, irritación respiratoria',
        efectosPosibles: 'Dermatitis de manos, eczema, asma doméstico',
        medidasControl: ['Guantes de nitrilo para limpieza', 'Dilución correcta de productos', 'Ventilación durante limpieza', 'Capacitación en uso seguro de productos domésticos']
      },
      {
        codigo: 'ERG-001',
        nombre: 'Sobreesfuerzo físico en labores domésticas',
        categoria: 'Ergonómico',
        descripcion: 'Carga física en limpieza, lavado, planchado, preparación de alimentos y cuidado de personas mayores o niños',
        fuenteGeneradora: 'Actividades domésticas: fregado, lavado, planchado, cuidado de personas',
        actividadAsociada: 'Servicios domésticos integrales en hogares particulares',
        riesgoPotencial: 'Lesiones musculoesqueléticas por sobreesfuerzo',
        efectosPosibles: 'Lumbalgia, lesiones de rodilla, tendinitis de hombro',
        medidasControl: ['Herramientas ergonómicas de limpieza', 'Técnicas de levantamiento seguro al cuidar personas', 'Descansos periódicos', 'Apoyo de familiares en labores pesadas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - empleadores domésticos', obligatorio: true },
      { codigo: 'Dec. 721/2013', norma: 'Decreto 721 de 2013', descripcion: 'Afiliación al sistema de seguridad social del trabajador doméstico', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo para limpieza', 'Delantal impermeable', 'Calzado antideslizante'],
    capacitacionesObligatorias: ['Uso seguro de productos domésticos', 'Manejo manual de cargas en cuidado de personas', 'Derechos laborales del trabajador doméstico']
  },
  {
    codigoCIIU: '9810',
    descripcionCIIU: 'Actividades no diferenciadas de los hogares individuales como productores de bienes para uso propio',
    sector: 'Hogares como Productores',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'MEC-001',
        nombre: 'Riesgos en producción artesanal y manualidades del hogar',
        categoria: 'Mecánico',
        descripcion: 'Uso de herramientas manuales y eléctricas en producción de bienes para autoconsumo en hogares',
        fuenteGeneradora: 'Herramientas del hogar para construcción, carpintería, costura y producción artesanal',
        actividadAsociada: 'Producción de bienes para uso propio: ropa, muebles, alimentos procesados, artesanías',
        riesgoPotencial: 'Cortes, quemaduras y lesiones con herramientas de uso doméstico',
        efectosPosibles: 'Laceraciones, quemaduras, traumatismos',
        medidasControl: ['Uso correcto de herramientas', 'Almacenamiento seguro de herramientas', 'EPP básico para actividades de mayor riesgo', 'Botiquín de primeros auxilios disponible']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de trabajo para manualidades', 'Gafas de protección para herramientas eléctricas'],
    capacitacionesObligatorias: ['Uso seguro de herramientas del hogar', 'Primeros auxilios domésticos']
  },
  {
    codigoCIIU: '9820',
    descripcionCIIU: 'Actividades no diferenciadas de los hogares individuales como productores de servicios para uso propio',
    sector: 'Hogares como Productores',
    nivelRiesgo: 'II',
    peligrosIdentificados: [
      {
        codigo: 'FIS-001',
        nombre: 'Riesgos en producción de servicios para autoconsumo en el hogar',
        categoria: 'Físico',
        descripcion: 'Actividades de mantenimiento del hogar, preparación de alimentos y servicios domésticos para uso propio',
        fuenteGeneradora: 'Cocina, herramientas de mantenimiento del hogar y espacios domésticos',
        actividadAsociada: 'Mantenimiento del hogar, preparación de alimentos y servicios para la familia',
        riesgoPotencial: 'Accidentes domésticos: quemaduras, cortes, caídas',
        efectosPosibles: 'Quemaduras en cocina, laceraciones, fracturas por caídas',
        medidasControl: ['Medidas de seguridad doméstica', 'Botiquín de primeros auxilios', 'Supervisión de niños en actividades de riesgo', 'Mantenimiento eléctrico por profesionales']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo II', obligatorio: true }
    ],
    eppRecomendado: ['Guantes para cocina', 'Calzado antideslizante en el hogar'],
    capacitacionesObligatorias: ['Seguridad doméstica y prevención de accidentes en el hogar', 'Primeros auxilios básicos familiares']
  },

  // ==================== SECCIÓN U - ORGANIZACIONES EXTRATERRITORIALES ====================

  {
    codigoCIIU: '9900',
    descripcionCIIU: 'Actividades de organizaciones y entidades extraterritoriales',
    sector: 'Organizaciones Extraterritoriales',
    nivelRiesgo: 'I',
    peligrosIdentificados: [
      {
        codigo: 'PSI-001',
        nombre: 'Estrés en trabajo en organizaciones internacionales',
        categoria: 'Psicosocial',
        descripcion: 'Alta responsabilidad, trabajo en entornos multiculturales complejos y lejanía familiar en organizaciones extraterritoriales como ONU, OEA, embajadas y organismos multilaterales',
        fuenteGeneradora: 'Sedes de organizaciones internacionales en Colombia y destinos de misión internacional',
        actividadAsociada: 'Trabajo en organismos internacionales, misiones diplomáticas y ONGs extraterritoriales',
        riesgoPotencial: 'Estrés intercultural, burnout por responsabilidades globales',
        efectosPosibles: 'Agotamiento, trastornos de ansiedad, problemas de adaptación',
        medidasControl: ['Apoyo psicológico para personal en misión internacional', 'Preparación cultural previa a destinos', 'Redes de apoyo entre colegas internacionales', 'Rotación programada en destinos exigentes']
      },
      {
        codigo: 'VIA-001',
        nombre: 'Riesgo en desplazamientos a zonas de operación humanitaria',
        categoria: 'Físico',
        descripcion: 'Personal de organizaciones internacionales que opera en zonas de conflicto, post-desastre o difícil acceso en Colombia',
        fuenteGeneradora: 'Zonas de conflicto, áreas post-desastre y territorios de difícil acceso',
        actividadAsociada: 'Operaciones humanitarias, misiones de paz y cooperación internacional en zonas de riesgo',
        riesgoPotencial: 'Accidentes en desplazamientos a zonas remotas, exposición a violencia',
        efectosPosibles: 'Lesiones en accidente, exposición a violencia en zonas de conflicto',
        medidasControl: ['Evaluación de seguridad previa a misiones de campo', 'Protocolos de seguridad de organizaciones internacionales (UNDSS)', 'Comunicación permanente con oficina central', 'Seguro de vida y médico internacional']
      }
    ],
    normativaEspecifica: [
      { codigo: 'Res. 0312/2019', norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos SG-SST - riesgo I', obligatorio: true },
      { codigo: 'Dec. 1072/2015', norma: 'Decreto 1072 de 2015', descripcion: 'Reglamento único del sector trabajo - aplicabilidad en Colombia', obligatorio: true }
    ],
    eppRecomendado: ['Kit de seguridad para misiones de campo en zonas de riesgo', 'Botiquín de primeros auxilios de campo'],
    capacitacionesObligatorias: ['Seguridad en misiones de campo internacionales', 'Gestión del estrés intercultural', 'Primeros auxilios avanzados para contextos humanitarios', 'Protocolos de seguridad de organizaciones internacionales']
  },

];

// ==================== FUNCIONES DE BÚSQUEDA ====================

// ==================== FUNCIONES DE BÚSQUEDA ====================

export function getPeligrosPorCIIU(codigoCIIU: string): PeligroPorCIIU | undefined {
  return peligrosPorCIIU.find(p => p.codigoCIIU === codigoCIIU);
}

export function getPeligrosPorSector(sector: string): PeligroPorCIIU[] {
  return peligrosPorCIIU.filter(p => p.sector.toLowerCase() === sector.toLowerCase());
}

export function getPeligrosPorNivelRiesgo(nivel: 'I' | 'II' | 'III' | 'IV' | 'V'): PeligroPorCIIU[] {
  return peligrosPorCIIU.filter(p => p.nivelRiesgo === nivel);
}

export function buscarCIIUSimilar(codigoCIIU: string): PeligroPorCIIU | undefined {
  const codigo2digitos = codigoCIIU.substring(0, 2);
  return peligrosPorCIIU.find(p => p.codigoCIIU.startsWith(codigo2digitos));
}

export function obtenerTodosLosSectores(): string[] {
  return Array.from(new Set(peligrosPorCIIU.map(p => p.sector)));
}

export function obtenerTodosLosCIIU(): { codigo: string; descripcion: string; sector: string; riesgo: string }[] {
  return peligrosPorCIIU.map(p => ({
    codigo: p.codigoCIIU,
    descripcion: p.descripcionCIIU,
    sector: p.sector,
    riesgo: p.nivelRiesgo
  }));
}
