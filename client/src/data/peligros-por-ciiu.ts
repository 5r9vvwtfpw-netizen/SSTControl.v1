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
    descripcionCIIU: 'Actividades de hospitales y clínicas',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-003', 'QUI-001', 'QUI-003', 'PSI-001', 'BIO-MEC-003', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'SAL-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a patógenos sanguíneos',
        descripcion: 'Contacto con sangre y fluidos corporales infectados (VIH, VHB, VHC)',
        riesgoPotencial: 'Infección por transmisión sanguínea',
        efectosPosibles: 'Hepatitis B/C, VIH, sepsis',
        medidasControl: ['Precauciones universales', 'EPP completo', 'Contenedores para cortopunzantes', 'Vacunación VHB', 'Profilaxis post-exposición']
      },
      {
        codigo: 'SAL-002',
        clasificacion: 'biologico',
        peligro: 'Accidente con cortopunzantes',
        descripcion: 'Pinchazos con agujas, bisturís u objetos contaminados',
        riesgoPotencial: 'Inoculación de patógenos',
        efectosPosibles: 'Infección VIH, hepatitis, infecciones bacterianas',
        medidasControl: ['Agujas de seguridad', 'No reencapuchar', 'Contenedores rígidos', 'Doble guante en procedimientos', 'Reporte inmediato']
      },
      {
        codigo: 'SAL-003',
        clasificacion: 'quimico',
        peligro: 'Exposición a gases anestésicos',
        descripcion: 'Inhalación de óxido nitroso, sevoflurano en quirófanos',
        riesgoPotencial: 'Efectos neurotóxicos, reproductivos',
        efectosPosibles: 'Cefalea, náuseas, abortos espontáneos, daño hepático',
        medidasControl: ['Extracción de gases residuales', 'Sistemas cerrados de anestesia', 'Monitoreo ambiental', 'Rotación de personal']
      },
      {
        codigo: 'SAL-004',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes',
        descripcion: 'Exposición a rayos X, tomografía, medicina nuclear',
        riesgoPotencial: 'Daño celular, cáncer',
        efectosPosibles: 'Cataratas, cáncer, alteraciones genéticas, esterilidad',
        medidasControl: ['Dosímetro personal', 'Blindaje de plomo', 'Distancia y tiempo mínimo', 'Delantales plomados', 'Monitoreo de dosis']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true },
      { codigo: 'DEC-351-2014', norma: 'Decreto 351/2014', descripcion: 'Gestión de residuos hospitalarios', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de látex/nitrilo', 'Mascarilla N95', 'Bata desechable', 'Gafas de protección', 'Careta facial', 'Gorro quirúrgico', 'Calzado cerrado'],
    capacitacionesObligatorias: ['Bioseguridad hospitalaria', 'Manejo de residuos hospitalarios', 'Protocolo post-exposición', 'RCP y primeros auxilios', 'Riesgo psicosocial']
  },

  {
    codigoCIIU: '8622',
    descripcionCIIU: 'Actividades de consultorios odontológicos',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-004', 'FIS-001', 'FIS-005', 'BIO-MEC-001', 'BIO-MEC-002'],
    peligrosEspecificos: [
      {
        codigo: 'ODONT-001',
        clasificacion: 'biologico',
        peligro: 'Aerosoles biológicos',
        descripcion: 'Generación de aerosoles con sangre, saliva durante procedimientos',
        riesgoPotencial: 'Infecciones respiratorias y sistémicas',
        efectosPosibles: 'COVID-19, tuberculosis, hepatitis, herpes',
        medidasControl: ['Mascarilla N95', 'Careta facial', 'Succión de alta potencia', 'Ventilación HEPA', 'Enjuague antiséptico previo']
      },
      {
        codigo: 'ODONT-002',
        clasificacion: 'fisico',
        peligro: 'Ruido de turbinas dentales',
        descripcion: 'Exposición continua a ruido de alta frecuencia (>85 dBA)',
        riesgoPotencial: 'Pérdida auditiva ocupacional',
        efectosPosibles: 'Hipoacusia, tinnitus, estrés',
        medidasControl: ['Protección auditiva', 'Turbinas silenciosas', 'Audiometrías periódicas', 'Pausas en silencio']
      },
      {
        codigo: 'ODONT-003',
        clasificacion: 'quimico',
        peligro: 'Mercurio de amalgamas',
        descripcion: 'Exposición a vapores de mercurio durante preparación y remoción',
        riesgoPotencial: 'Intoxicación por mercurio',
        efectosPosibles: 'Daño neurológico, renal, temblores',
        medidasControl: ['Ventilación con extracción', 'Separador de amalgama', 'EPP durante remoción', 'Uso de alternativas (resinas)']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2003-2014', norma: 'Resolución 2003/2014', descripcion: 'Habilitación de servicios de salud', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Manual de bioseguridad odontología', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de látex/nitrilo', 'Mascarilla N95', 'Careta facial', 'Gafas de protección', 'Bata manga larga', 'Gorro', 'Protección auditiva'],
    capacitacionesObligatorias: ['Bioseguridad odontológica', 'Esterilización de instrumental', 'Manejo de residuos', 'Ergonomía en odontología']
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

  {
    codigoCIIU: '6419',
    descripcionCIIU: 'Otros tipos de intermediación monetaria (bancos comerciales)',
    nivelRiesgo: 'II',
    sector: 'Finanzas',
    peligrosPrioritarios: ['PSI-001', 'PSI-002', 'BIO-MEC-001', 'SEG-002'],
    peligrosEspecificos: [
      {
        codigo: 'BANC-002',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo de atraco a sucursales',
        descripcion: 'Asalto a instalaciones bancarias',
        riesgoPotencial: 'Lesiones, trauma psicológico',
        efectosPosibles: 'Heridas, estrés postraumático, ansiedad',
        medidasControl: ['Sistemas de seguridad', 'Capacitación en atracos', 'Apoyo psicológico post-evento', 'Protocolos de emergencia']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Mobiliario ergonómico'],
    capacitacionesObligatorias: ['Protocolo de atracos', 'Manejo del estrés', 'Ergonomía', 'Primeros auxilios psicológicos']
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

  {
    codigoCIIU: '7111',
    descripcionCIIU: 'Actividades de arquitectura e ingeniería',
    nivelRiesgo: 'II',
    sector: 'Servicios profesionales',
    peligrosPrioritarios: ['PSI-001', 'BIO-MEC-001', 'BIO-MEC-002', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'ING-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Visitas a obras de construcción',
        descripcion: 'Inspección de obras con riesgos de construcción',
        riesgoPotencial: 'Caídas, golpes',
        efectosPosibles: 'Fracturas, contusiones, caída de objetos',
        medidasControl: ['EPP en obra', 'Capacitación en obra segura', 'Acompañamiento del residente']
      }
    ],
    normativaEspecifica: [
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Casco', 'Chaleco reflectivo', 'Botas de seguridad', 'Gafas'],
    capacitacionesObligatorias: ['Seguridad en obras', 'Trabajo en alturas básico', 'Ergonomía de oficina']
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
  }
];

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
