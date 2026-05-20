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
    codigoCIIU: '4759',
    descripcionCIIU: 'Comercio al por menor de otros artículos domésticos en establecimientos especializados',
    nivelRiesgo: 'I',
    sector: 'Comercio',
    peligrosPrioritarios: ['BIO-MEC-001', 'BIO-MEC-002', 'SEG-002', 'PSI-001', 'FIS-002'],
    peligrosEspecificos: [
      {
        codigo: 'DOMRET-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Bipedestación prolongada y manejo de artículos del hogar',
        descripcion: 'Atención al cliente de pie y organización de artículos domésticos de diferente tamaño y peso',
        riesgoPotencial: 'Fatiga musculoesquelética',
        efectosPosibles: 'Dolor de espalda, pies y extremidades inferiores',
        medidasControl: ['Tapetes antifatiga', 'Calzado ergonómico', 'Pausas activas', 'Rotación de funciones']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-0312-2019', norma: 'Resolución 0312/2019', descripcion: 'Estándares Mínimos SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Calzado ergonómico', 'Tapete antifatiga'],
    capacitacionesObligatorias: ['Pausas activas', 'Higiene postural', 'Primeros auxilios']
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
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'BIO-003', 'QUI-001', 'FIS-005', 'PSI-001', 'PSI-002'],
    peligrosEspecificos: [
      {
        codigo: 'MED-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a agentes biológicos en consulta médica ambulatoria',
        descripcion: 'Contacto con pacientes con enfermedades infectocontagiosas en consultorio externo',
        riesgoPotencial: 'Infecciones nosocomiales y comunitarias',
        efectosPosibles: 'COVID-19, tuberculosis, influenza, hepatitis, infecciones diversas',
        medidasControl: ['EPP según nivel de precaución (Standard/Aislamiento)', 'Lavado de manos antes y después de cada paciente', 'Vacunación del personal de salud', 'Ventilación adecuada del consultorio']
      },
      {
        codigo: 'MED-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Exposición a radiaciones ionizantes en consultorios con equipos de imagen',
        descripcion: 'Uso de equipos de rayos X portátiles o fijos en consultorio médico',
        riesgoPotencial: 'Daño por radiación ionizante',
        efectosPosibles: 'Daño celular acumulativo, leucemia, cáncer en exposición crónica',
        medidasControl: ['Dosímetro personal obligatorio', 'Delantal plomado y protector tiroideo', 'Distancia de seguridad', 'Inspección del equipo por SNC']
      },
      {
        codigo: 'MED-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga asistencial y presión por número de consultas',
        descripcion: 'Sistemas de salud con alta presión de pacientes por hora, escasa autonomía y alta responsabilidad',
        riesgoPotencial: 'Burnout médico',
        efectosPosibles: 'Agotamiento emocional, errores clínicos, despersonalización',
        medidasControl: ['Número de consultas por hora razonable', 'Apoyo psicológico al personal de salud', 'Programa de bienestar laboral', 'Autonomía clínica']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Adopción del Manual de Buenas Prácticas en Radiología', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Gestión de residuos biológico-infecciosos', obligatorio: true }
    ],
    eppRecomendado: ['Bata de laboratorio o uniforme clínico', 'Guantes de nitrilo', 'Mascarilla FFP2 o N95', 'Gafas de protección', 'Delantal plomado en rayos X', 'Dosímetro personal'],
    capacitacionesObligatorias: ['Bioseguridad en atención médica', 'Precauciones estándar y de aislamiento', 'Manejo de residuos biológicos', 'Prevención riesgo psicosocial en salud', 'Primeros auxilios - RCP']
  },

  {
    codigoCIIU: '8691',
    descripcionCIIU: 'Actividades de apoyo diagnóstico',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'QUI-001', 'QUI-003', 'FIS-005', 'SEG-004'],
    peligrosEspecificos: [
      {
        codigo: 'DIAG-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Manejo de muestras biológicas (sangre, orina, tejidos)',
        descripcion: 'Procesamiento de muestras clínicas en laboratorio con alto riesgo de exposición a agentes infecciosos',
        riesgoPotencial: 'Infección por accidente biológico',
        efectosPosibles: 'VIH, hepatitis B y C, tuberculosis, otras infecciones según muestra',
        medidasControl: ['Nivel BSL-2 o superior', 'Doble guante en muestras de alto riesgo', 'Nunca pipetear con boca', 'Centrifugación en cabina cerrada', 'Protocolo post-exposición']
      },
      {
        codigo: 'DIAG-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Reactivos de laboratorio clínico (ácidos, bases, solventes)',
        descripcion: 'Uso de reactivos para tinción, análisis bioquímico y procesamiento de muestras',
        riesgoPotencial: 'Quemaduras químicas e irritación',
        efectosPosibles: 'Quemaduras oculares y cutáneas, intoxicación crónica',
        medidasControl: ['Cabina de extracción', 'Gafas de seguridad', 'Guantes de nitrilo', 'Ducha lavaojos en laboratorio', 'SDS actualizadas']
      },
      {
        codigo: 'DIAG-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Radiaciones ionizantes en diagnóstico por imagen (RX, TAC)',
        descripcion: 'Operación de equipos de rayos X, tomografía y fluoroscopía en servicios de imagen diagnóstica',
        riesgoPotencial: 'Daño por radiación ionizante crónica',
        efectosPosibles: 'Leucemia, cáncer, daño óseo y ocular',
        medidasControl: ['Dosímetro personal obligatorio', 'Delantal plomado', 'Distancia y tiempo mínimos de exposición', 'Inspección periódica de equipos por INVIMA/SNC']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2183-2004', norma: 'Resolución 2183/2004', descripcion: 'Buenas Prácticas en Radiología', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos biológico-infecciosos', obligatorio: true },
      { codigo: 'RES-1995-1999', norma: 'Resolución 1995/1999', descripcion: 'Historias clínicas y registros - laboratorio', obligatorio: true }
    ],
    eppRecomendado: ['Bata de laboratorio', 'Dobles guantes de nitrilo', 'Gafas de seguridad', 'Mascarilla N95', 'Calzado cerrado', 'Dosímetro personal', 'Delantal plomado'],
    capacitacionesObligatorias: ['Bioseguridad en laboratorio clínico', 'Manejo de accidente biológico', 'Radiaciones ionizantes y protección', 'Gestión de residuos peligrosos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8692',
    descripcionCIIU: 'Actividades de apoyo terapéutico',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-MEC-001', 'BIO-MEC-002', 'PSI-001', 'QUI-001'],
    peligrosEspecificos: [
      {
        codigo: 'TERAP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de pacientes en terapia física',
        descripcion: 'Traslado, posicionamiento y asistencia en ejercicios de pacientes con limitaciones físicas',
        riesgoPotencial: 'Lesiones musculoesqueléticas en terapeuta',
        efectosPosibles: 'Lumbalgia, lesiones de hombro, hernias discales',
        medidasControl: ['Técnicas de transferencia de pacientes', 'Equipos de apoyo (grúas, deslizadores)', 'Capacitación en movilización segura', 'Evaluación ergonómica de camillas']
      },
      {
        codigo: 'TERAP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Alta carga emocional en terapia con pacientes complejos',
        descripcion: 'Trabajo con pacientes con dolor crónico, discapacidad o enfermedades degenerativas que generan carga emocional en el terapeuta',
        riesgoPotencial: 'Fatiga compasión y burnout terapéutico',
        efectosPosibles: 'Agotamiento emocional, despersonalización',
        medidasControl: ['Supervisión clínica', 'Distribución de casos complejos', 'Acceso a apoyo psicológico para el profesional']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Calzado antideslizante de trabajo', 'Faja lumbar para movilización de pacientes'],
    capacitacionesObligatorias: ['Movilización segura de pacientes', 'Prevención de riesgo psicosocial en salud', 'Bioseguridad', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8699',
    descripcionCIIU: 'Otras actividades de atención de la salud humana',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-001', 'BIO-002', 'PSI-001', 'QUI-001', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'SALUDNCP-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Exposición a fluidos y agentes biológicos en atención de salud',
        descripcion: 'Contacto con pacientes y sus fluidos en actividades de atención de salud no hospitalaria',
        riesgoPotencial: 'Infección por agentes biológicos',
        efectosPosibles: 'Enfermedades infecciosas diversas',
        medidasControl: ['Precauciones estándar siempre', 'Guantes y mascarilla en atención', 'Lavado de manos', 'Vacunación del personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos biológico-infecciosos', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Bata de trabajo', 'Calzado cerrado'],
    capacitacionesObligatorias: ['Bioseguridad en salud', 'Manejo de residuos', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8720',
    descripcionCIIU: 'Actividades de atención residencial para el cuidado de personas con discapacidad intelectual',
    nivelRiesgo: 'III',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-MEC-004', 'PSI-001', 'PSI-002', 'BIO-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'DISCAP-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de personas con discapacidad',
        descripcion: 'Transferencia, posicionamiento y traslado de usuarios con dependencia funcional total o parcial',
        riesgoPotencial: 'Lesiones musculoesqueléticas en cuidador',
        efectosPosibles: 'Lumbalgia crónica, hernias discales, lesiones de hombro',
        medidasControl: ['Equipos de transferencia (grúas, cojines deslizantes)', 'Técnicas ergonómicas de movilización', 'Trabajo en equipo para cargas pesadas', 'Evaluación médica periódica']
      },
      {
        codigo: 'DISCAP-PSI-001',
        clasificacion: 'psicosocial',
        peligro: 'Agresión por parte de usuarios con conductas desafiantes',
        descripcion: 'Cuidado de personas con discapacidad intelectual que pueden presentar conductas agresivas (mordiscos, golpes, arañazos)',
        riesgoPotencial: 'Violencia laboral y trauma psicológico',
        efectosPosibles: 'Lesiones físicas, trauma, burnout del cuidador',
        medidasControl: ['Capacitación en manejo de conducta', 'Protocolos de contención segura', 'Rotación de cuidadores', 'Apoyo psicológico al personal', 'Registro de incidentes']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true },
      { codigo: 'LEY-1618-2013', norma: 'Ley 1618/2013', descripcion: 'Derechos de personas con discapacidad', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Calzado antideslizante', 'Mascarilla', 'Protecciones para conductas agresivas según protocolo'],
    capacitacionesObligatorias: ['Movilización segura de personas', 'Manejo de conductas desafiantes', 'Bioseguridad', 'Prevención riesgo psicosocial', 'Primeros auxilios']
  },

  {
    codigoCIIU: '8730',
    descripcionCIIU: 'Actividades de atención en instituciones para el cuidado de personas mayores y discapacitadas',
    nivelRiesgo: 'II',
    sector: 'Salud',
    peligrosPrioritarios: ['BIO-MEC-003', 'BIO-001', 'PSI-001', 'BIO-MEC-002', 'FIS-004'],
    peligrosEspecificos: [
      {
        codigo: 'MAYOR-BIO-MEC-001',
        clasificacion: 'biomecanico',
        peligro: 'Movilización de adultos mayores con dependencia',
        descripcion: 'Traslados, baño, cambio de pañal y posicionamiento de adultos mayores con limitación funcional',
        riesgoPotencial: 'Lesiones musculoesqueléticas crónicas',
        efectosPosibles: 'Lumbalgia, hernias discales, lesiones de hombro y rodilla',
        medidasControl: ['Grúas de transferencia', 'Camas regulables en altura', 'Técnicas correctas de movilización', 'Formación continua al personal de cuidado']
      },
      {
        codigo: 'MAYOR-BIO-001',
        clasificacion: 'biologico',
        peligro: 'Riesgo biológico en cuidado de adultos mayores hospitalizados',
        descripcion: 'Manejo de heridas, sondas, catéteres y secreciones en adultos mayores con mayor susceptibilidad a infecciones',
        riesgoPotencial: 'Infecciones nosocomiales',
        efectosPosibles: 'Infecciones variadas, gastroenteritis, infecciones respiratorias',
        medidasControl: ['Guantes para todo contacto con fluidos', 'Lavado de manos', 'Precauciones estándar', 'Vacunación del personal']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2646-2008', norma: 'Resolución 2646/2008', descripcion: 'Factores de riesgo psicosocial', obligatorio: true }
    ],
    eppRecomendado: ['Guantes de nitrilo', 'Mascarilla', 'Delantal impermeable', 'Calzado antideslizante', 'Faja lumbar para movilizaciones'],
    capacitacionesObligatorias: ['Movilización segura de adultos mayores', 'Bioseguridad en geriatría', 'Prevención riesgo psicosocial en cuidado', 'Primeros auxilios']
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
    codigoCIIU: '1311',
    descripcionCIIU: 'Preparación e hilatura de fibras textiles (ver grupo textil)',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Textiles',
    peligrosPrioritarios: ['QUI-002', 'FIS-001', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'HILAR2-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Polvo de fibras en hilatura',
        descripcion: 'Inhalación de polvo en procesos de apertura, cardado e hilatura de fibras',
        riesgoPotencial: 'Neumoconiosis textil',
        efectosPosibles: 'Bisinosis, asma',
        medidasControl: ['Extracción de polvo', 'Mascarilla FFP2', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla FFP2', 'Protección auditiva'],
    capacitacionesObligatorias: ['Vigilancia respiratoria textil', 'Primeros auxilios']
  },

  {
    codigoCIIU: '2710',
    descripcionCIIU: 'Fabricación de motores, generadores y transformadores eléctricos, y de aparatos de distribución y control de la energía eléctrica',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Eléctrica',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'FIS-005', 'BIO-MEC-001', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'ELECFAB-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en pruebas de equipos de alta tensión',
        descripcion: 'Pruebas de alta tensión a transformadores y generadores durante fabricación y control de calidad',
        riesgoPotencial: 'Arco eléctrico y electrocución',
        efectosPosibles: 'Quemaduras por arco eléctrico, paro cardiorrespiratorio, ceguera',
        medidasControl: ['Análisis de arco eléctrico (NFPA 70E)', 'EPP para arco eléctrico (traje Nomex/arco)', 'Barrera y señalización en pruebas de alta tensión', 'Procedimientos escritos de pruebas eléctricas']
      },
      {
        codigo: 'ELECFAB-QUI-001',
        clasificacion: 'quimico',
        peligro: 'PCBs en transformadores viejos y solventes en bobinado',
        descripcion: 'Riesgo de PCBs en transformadores antiguos y solventes orgánicos en barnizado de bobinas',
        riesgoPotencial: 'Intoxicación crónica por PCBs',
        efectosPosibles: 'Cáncer (PCBs), daño hepático, dermatitis por cloro',
        medidasControl: ['Identificación de transformadores con PCBs', 'EPP completo en manejo de PCBs', 'Gestión de residuos de PCBs como peligrosos', 'Preferir barnices de base acuosa']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-180508-2010', norma: 'Resolución 180508/2010', descripcion: 'RETIE - Reglamento técnico de instalaciones eléctricas', obligatorio: true }
    ],
    eppRecomendado: ['Traje de protección ante arco eléctrico (Nomex)', 'Guantes dieléctricos', 'Careta de arco', 'Calzado dieléctrico', 'Mascarilla para vapores'],
    capacitacionesObligatorias: ['Seguridad eléctrica - arco eléctrico', 'Manejo de PCBs', 'LOTO', 'Primeros auxilios']
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
    codigoCIIU: '2410',
    descripcionCIIU: 'Industrias básicas de hierro y de acero',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metalurgia',
    peligrosPrioritarios: ['FIS-004', 'QUI-001', 'QUI-002', 'SEG-005', 'FIS-001', 'FIS-005'],
    peligrosEspecificos: [
      {
        codigo: 'ACERO-FIS-001',
        clasificacion: 'fisico',
        peligro: 'Calor extremo en acería y laminación',
        descripcion: 'Trabajo en alto horno, convertidores y laminadores con metal líquido a 1500°C',
        riesgoPotencial: 'Estrés térmico grave y quemaduras por metal fundido',
        efectosPosibles: 'Golpe de calor, catarata (infrarrojo), quemaduras por salpicadura',
        medidasControl: ['Ropa aluminizada reflectante', 'Careta de protección infrarroja', 'Rotación de personal estricta', 'WBGT monitoreo', 'Hidratación programada']
      },
      {
        codigo: 'ACERO-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos metálicos en fusión de hierro y acero',
        descripcion: 'Inhalación de humos de hierro, manganeso, cromo y níquel en operaciones de fusión',
        riesgoPotencial: 'Fiebre de los metales y manganismo',
        efectosPosibles: 'Fiebre del metal (humos de zinc), manganismo (Parkinson laboral), siderosis',
        medidasControl: ['Ventilación por extracción en alto horno y convertidores', 'Respirador P100 en fusión', 'Monitoreo de manganeso en sangre', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Ropa aluminizada', 'Careta infrarroja + visera', 'Respirador P100', 'Guantes de horno', 'Botas de acero refractario', 'Protección auditiva'],
    capacitacionesObligatorias: ['Seguridad en acerías', 'Prevención de estrés térmico extremo', 'Humos metálicos', 'Primeros auxilios - quemaduras graves']
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
    codigoCIIU: '2511',
    descripcionCIIU: 'Fabricación de productos metálicos para uso estructural',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['QUI-001', 'FIS-005', 'SEG-005', 'FIS-001', 'BIO-MEC-001', 'SEG-001'],
    peligrosEspecificos: [
      {
        codigo: 'ESTMET-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de soldadura en fabricación de estructuras metálicas',
        descripcion: 'Inhalación de humos de manganeso, cromo hexavalente y partículas metálicas en soldadura masiva',
        riesgoPotencial: 'Siderosis, manganismo, cáncer por Cr VI',
        efectosPosibles: 'Siderosis pulmonar, manganismo, cáncer en soldadores con acero inoxidable',
        medidasControl: ['Extracción localizada en puesto de soldadura', 'Mascarilla P100 para humos de soldadura', 'Monitoreo de humos de soldadura', 'Espirometría semestral en soldadores']
      },
      {
        codigo: 'ESTMET-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Trabajo en alturas en montaje de estructuras',
        descripcion: 'Instalación de estructuras metálicas en obra con trabajo en alturas',
        riesgoPotencial: 'Caída en altura',
        efectosPosibles: 'Traumatismos graves, muerte',
        medidasControl: ['Certificación trabajo en alturas (Res. 4272/2021)', 'Arnés y línea de vida', 'Redes de seguridad', 'Análisis de riesgo previo']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-4272-2021', norma: 'Resolución 4272/2021', descripcion: 'Trabajo seguro en alturas', obligatorio: true }
    ],
    eppRecomendado: ['Careta de soldadura auto-oscurecente', 'Mascarilla P100', 'Protección auditiva', 'Arnés de seguridad en alturas', 'Guantes de soldador', 'Calzado con puntera'],
    capacitacionesObligatorias: ['Seguridad en soldadura', 'Trabajo en alturas', 'LOTO', 'Primeros auxilios']
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
    codigoCIIU: '2521',
    descripcionCIIU: 'Fabricación de generadores de vapor, excepto calderas de agua caliente para calefacción central',
    nivelRiesgo: 'IV',
    sector: 'Manufactura - Metal',
    peligrosPrioritarios: ['SEG-005', 'SEG-004', 'QUI-001', 'FIS-004', 'SEG-003'],
    peligrosEspecificos: [
      {
        codigo: 'CALD-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Explosión de recipientes a presión en prueba hidrostática y neumática',
        descripcion: 'Pruebas hidrostáticas y neumáticas de calderas y generadores de vapor fabricados',
        riesgoPotencial: 'Explosión de recipiente a presión',
        efectosPosibles: 'Traumatismos graves, muerte, destrucción de instalaciones',
        medidasControl: ['Zona de exclusión durante pruebas', 'Procedimientos certificados de prueba a presión', 'Equipo de inspección certificado', 'Revisión de diseño por persona competente']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-2106-1983', norma: 'Decreto 2106/1983', descripcion: 'Recipientes sujetos a presión', obligatorio: true }
    ],
    eppRecomendado: ['Careta facial', 'Casco', 'Protección auditiva', 'Ropa resistente al calor'],
    capacitacionesObligatorias: ['Seguridad en recipientes a presión', 'Seguridad en soldadura', 'Primeros auxilios']
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
    codigoCIIU: '2690',
    descripcionCIIU: 'Fabricación de otros equipos y aparatos eléctricos n.c.p.',
    nivelRiesgo: 'II',
    sector: 'Manufactura - Electrónica',
    peligrosPrioritarios: ['SEG-004', 'QUI-001', 'BIO-MEC-001', 'FIS-001'],
    peligrosEspecificos: [
      {
        codigo: 'OTRELEC-SEG-001',
        clasificacion: 'condiciones_seguridad',
        peligro: 'Riesgo eléctrico en fabricación y prueba de equipos',
        descripcion: 'Pruebas de equipos eléctricos en línea de fabricación',
        riesgoPotencial: 'Contacto eléctrico',
        efectosPosibles: 'Quemaduras, electrocución',
        medidasControl: ['Procedimientos de prueba seguros', 'Herramientas aisladas', 'LOTO']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Guantes dieléctricos', 'Gafas de seguridad', 'Calzado antiestático'],
    capacitacionesObligatorias: ['Riesgo eléctrico', 'LOTO', 'Primeros auxilios']
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
    codigoCIIU: '2090',
    descripcionCIIU: 'Fabricación de otros productos químicos n.c.p.',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Química',
    peligrosPrioritarios: ['QUI-001', 'QUI-003', 'QUI-004', 'SEG-006', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'QUIMNCP-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Sustancias químicas diversas en fabricación',
        descripcion: 'Producción de adhesivos, ceras, lubricantes, aditivos u otros químicos con riesgos variables',
        riesgoPotencial: 'Intoxicación, quemaduras o incendio según producto',
        efectosPosibles: 'Variable según química del producto',
        medidasControl: ['SDS actualizada para cada materia prima y producto', 'EPP específico por proceso', 'Ventilación adecuada', 'Plan de emergencias químicas']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'DEC-4741-2005', norma: 'Decreto 4741/2005', descripcion: 'Residuos peligrosos', obligatorio: true }
    ],
    eppRecomendado: ['EPP específico según proceso - consultar SDS'],
    capacitacionesObligatorias: ['SDS y etiquetado de químicos', 'Manejo de derrame químico', 'Primeros auxilios']
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
    codigoCIIU: '2210',
    descripcionCIIU: 'Fabricación de llantas y neumáticos de caucho',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Caucho y Plásticos',
    peligrosPrioritarios: ['QUI-001', 'QUI-002', 'FIS-001', 'FIS-004', 'SEG-005'],
    peligrosEspecificos: [
      {
        codigo: 'LLANTA-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Humos de vulcanización y negro de humo',
        descripcion: 'Inhalación de humos de vulcanización de caucho y negro de humo en fabricación de llantas',
        riesgoPotencial: 'Cáncer y afecciones respiratorias crónicas',
        efectosPosibles: 'Cáncer de vejiga (negro de humo, IARC grupo 2B), bronquitis crónica',
        medidasControl: ['Extracción en prensas de vulcanización', 'Mascarilla P100', 'Monitoreo ambiental de negro de humo', 'Espirometría anual']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true },
      { codigo: 'RES-2400-1979', norma: 'Resolución 2400/1979', descripcion: 'Estatuto de Seguridad Industrial', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla P100', 'Protección auditiva', 'Guantes de cuero', 'Calzado con puntera', 'Ropa de algodón'],
    capacitacionesObligatorias: ['Vigilancia de cáncer en industria del caucho', 'Control de humos de vulcanización', 'Primeros auxilios']
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
    codigoCIIU: '2220',
    descripcionCIIU: 'Fabricación de productos de plástico',
    nivelRiesgo: 'III',
    sector: 'Manufactura - Caucho y Plásticos',
    peligrosPrioritarios: ['QUI-001', 'FIS-004', 'FIS-001', 'SEG-005', 'BIO-MEC-001'],
    peligrosEspecificos: [
      {
        codigo: 'PLPROD-QUI-001',
        clasificacion: 'quimico',
        peligro: 'Vapores de plásticos en extrusión, inyección y termoformado',
        descripcion: 'Degradación térmica de PVC, ABS, polietileno y otros plásticos con emisión de vapores y partículas',
        riesgoPotencial: 'Intoxicación por vapores de degradación de plásticos',
        efectosPosibles: 'Fiebre del plástico, irritación respiratoria, daño neurológico crónico',
        medidasControl: ['Extracción localizada en boquillas de extrusoras e inyectoras', 'Mascarilla con filtro para vapores orgánicos', 'Monitoreo de COV en planta', 'Temperatura de proceso optimizada para minimizar degradación']
      }
    ],
    normativaEspecifica: [
      { codigo: 'DEC-1072-2015', norma: 'Decreto 1072/2015', descripcion: 'SG-SST', obligatorio: true }
    ],
    eppRecomendado: ['Mascarilla con filtro para vapores', 'Guantes térmicos para purgas', 'Protección auditiva', 'Gafas de seguridad'],
    capacitacionesObligatorias: ['Control de vapores en plásticos', 'Seguridad en maquinaria de plásticos', 'Primeros auxilios']
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
