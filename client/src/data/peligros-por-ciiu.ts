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
