// Catálogo de peligros y riesgos según GTC-45:2012
// Guía Técnica Colombiana para identificación de peligros y valoración de riesgos en seguridad y salud ocupacional

export interface PeligroGTC45 {
  codigo: string;
  clasificacion: 'biologico' | 'fisico' | 'quimico' | 'psicosocial' | 'biomecanico' | 'condiciones_seguridad' | 'fenomenos_naturales';
  peligro: string;
  descripcion: string;
  riesgoPotencial: string;
  efectosPosibles: string;
  medidasControl: string[];
}

export const peligrosGTC45Predefinidos: PeligroGTC45[] = [
  // ==================== PELIGROS BIOLÓGICOS ====================
  {
    codigo: 'BIO-001',
    clasificacion: 'biologico',
    peligro: 'Virus',
    descripcion: 'Exposición a virus (COVID-19, influenza, hepatitis, VIH, etc.)',
    riesgoPotencial: 'Infección viral, enfermedades transmisibles',
    efectosPosibles: 'Enfermedades respiratorias, hepáticas, inmunodeficiencia',
    medidasControl: [
      'Vacunación',
      'EPP (mascarillas N95, batas, guantes)',
      'Protocolo de bioseguridad',
      'Lavado frecuente de manos',
      'Distanciamiento social'
    ]
  },
  {
    codigo: 'BIO-002',
    clasificacion: 'biologico',
    peligro: 'Bacterias',
    descripcion: 'Exposición a bacterias patógenas (salmonella, E. coli, tuberculosis)',
    riesgoPotencial: 'Infección bacteriana',
    efectosPosibles: 'Infecciones gastrointestinales, respiratorias, cutáneas',
    medidasControl: [
      'Esterilización de equipos',
      'EPP (guantes, mascarillas)',
      'Higiene de manos',
      'Desinfección de superficies',
      'Manejo adecuado de residuos'
    ]
  },
  {
    codigo: 'BIO-003',
    clasificacion: 'biologico',
    peligro: 'Hongos',
    descripcion: 'Exposición a hongos y esporas',
    riesgoPotencial: 'Infección micótica',
    efectosPosibles: 'Alergias, infecciones respiratorias, micosis cutáneas',
    medidasControl: [
      'Ventilación adecuada',
      'Control de humedad',
      'EPP (mascarillas, guantes)',
      'Limpieza y desinfección regular'
    ]
  },
  {
    codigo: 'BIO-004',
    clasificacion: 'biologico',
    peligro: 'Material orgánico en descomposición',
    descripcion: 'Contacto con residuos orgánicos, basuras, aguas residuales',
    riesgoPotencial: 'Infecciones, enfermedades parasitarias',
    efectosPosibles: 'Enfermedades gastrointestinales, parasitosis, infecciones',
    medidasControl: [
      'Manejo adecuado de residuos',
      'EPP completo (guantes, botas, overol)',
      'Programa de vacunación (tétanos)',
      'Higiene personal estricta'
    ]
  },

  // ==================== PELIGROS FÍSICOS ====================
  {
    codigo: 'FIS-001',
    clasificacion: 'fisico',
    peligro: 'Ruido',
    descripcion: 'Exposición a niveles de ruido superiores a 85 dBA por 8 horas',
    riesgoPotencial: 'Pérdida auditiva inducida por ruido',
    efectosPosibles: 'Hipoacusia, estrés, fatiga auditiva, trastornos del sueño',
    medidasControl: [
      'Protección auditiva (tapones, orejeras)',
      'Mantenimiento de maquinaria',
      'Encerramiento de fuentes de ruido',
      'Audiometrías periódicas',
      'Pausas en zonas silenciosas'
    ]
  },
  {
    codigo: 'FIS-002',
    clasificacion: 'fisico',
    peligro: 'Iluminación inadecuada',
    descripcion: 'Iluminación deficiente o excesiva en el puesto de trabajo',
    riesgoPotencial: 'Fatiga visual, accidentes por baja visibilidad',
    efectosPosibles: 'Cefalea, fatiga visual, errores en tareas, caídas',
    medidasControl: [
      'Medición de luxes',
      'Mantenimiento de luminarias',
      'Iluminación localizada en puestos',
      'Pausas visuales',
      'Uso de luz natural cuando sea posible'
    ]
  },
  {
    codigo: 'FIS-003',
    clasificacion: 'fisico',
    peligro: 'Vibraciones',
    descripcion: 'Exposición a vibraciones de cuerpo entero o mano-brazo',
    riesgoPotencial: 'Trastornos musculoesqueléticos, vasculares y neurológicos',
    efectosPosibles: 'Síndrome de vibración mano-brazo, lumbalgias, hernias discales',
    medidasControl: [
      'Mantenimiento preventivo de equipos',
      'Guantes antivibración',
      'Asientos con amortiguación',
      'Rotación de tareas',
      'Pausas activas'
    ]
  },
  {
    codigo: 'FIS-004',
    clasificacion: 'fisico',
    peligro: 'Temperaturas extremas (calor)',
    descripcion: 'Exposición a temperaturas superiores a 30°C',
    riesgoPotencial: 'Estrés térmico, golpe de calor',
    efectosPosibles: 'Deshidratación, agotamiento, calambres, síncope',
    medidasControl: [
      'Hidratación constante',
      'Pausas en zonas frescas',
      'Ventilación / aire acondicionado',
      'Ropa ligera y transpirable',
      'Aclimatación progresiva'
    ]
  },
  {
    codigo: 'FIS-005',
    clasificacion: 'fisico',
    peligro: 'Radiaciones no ionizantes',
    descripcion: 'Exposición a radiación UV, infrarroja, láser',
    riesgoPotencial: 'Quemaduras, daño ocular, cáncer de piel',
    efectosPosibles: 'Conjuntivitis, cataratas, envejecimiento prematuro de la piel',
    medidasControl: [
      'Protección ocular con filtros UV',
      'Bloqueador solar FPS 50+',
      'Ropa con protección UV',
      'Señalización de áreas con láser',
      'Reducción de tiempo de exposición'
    ]
  },
  {
    codigo: 'FIS-006',
    clasificacion: 'fisico',
    peligro: 'Presión atmosférica anormal',
    descripcion: 'Trabajo en grandes alturas (>2500 msnm) o bajo el agua',
    riesgoPotencial: 'Mal de altura, enfermedad por descompresión',
    efectosPosibles: 'Hipoxia, edema pulmonar, barotrauma',
    medidasControl: [
      'Aclimatación gradual',
      'Exámenes médicos específicos',
      'Protocolos de descompresión',
      'Suministro de oxígeno suplementario',
      'Capacitación en primeros auxilios'
    ]
  },

  // ==================== PELIGROS QUÍMICOS ====================
  {
    codigo: 'QUI-001',
    clasificacion: 'quimico',
    peligro: 'Gases y vapores tóxicos',
    descripcion: 'Exposición a gases (CO, CO2, H2S, vapores de solventes)',
    riesgoPotencial: 'Intoxicación aguda o crónica',
    efectosPosibles: 'Asfixia, irritación respiratoria, daño neurológico, muerte',
    medidasControl: [
      'Ventilación mecánica',
      'Respiradores con filtro específico',
      'Monitoreo de gases',
      'Extracción localizada',
      'Capacitación en manejo de emergencias químicas'
    ]
  },
  {
    codigo: 'QUI-002',
    clasificacion: 'quimico',
    peligro: 'Material particulado (polvos)',
    descripcion: 'Exposición a polvo de sílice, asbesto, cemento, madera',
    riesgoPotencial: 'Enfermedades respiratorias ocupacionales',
    efectosPosibles: 'Silicosis, asbestosis, neumoconiosis, cáncer pulmonar',
    medidasControl: [
      'Respiradores N95 o superiores',
      'Humidificación de material',
      'Extracción localizada',
      'Espirometrías periódicas',
      'Limpieza húmeda'
    ]
  },
  {
    codigo: 'QUI-003',
    clasificacion: 'quimico',
    peligro: 'Líquidos corrosivos/cáusticos',
    descripcion: 'Manejo de ácidos (sulfúrico, clorhídrico) o bases (soda cáustica)',
    riesgoPotencial: 'Quemaduras químicas, lesiones oculares',
    efectosPosibles: 'Quemaduras de piel, ceguera, necrosis tisular',
    medidasControl: [
      'Guantes de nitrilo resistentes',
      'Gafas o careta facial',
      'Delantal químico',
      'Ducha y lavaojos de emergencia',
      'Capacitación en manejo seguro'
    ]
  },
  {
    codigo: 'QUI-004',
    clasificacion: 'quimico',
    peligro: 'Aerosoles y neblinas',
    descripcion: 'Exposición a pinturas en spray, aceites de corte, desinfectantes',
    riesgoPotencial: 'Intoxicación por inhalación, dermatitis',
    efectosPosibles: 'Irritación respiratoria, alergias, asma ocupacional',
    medidasControl: [
      'Cabinas de pintura con extracción',
      'Respiradores con filtro para vapores orgánicos',
      'Guantes de nitrilo',
      'Ventilación adecuada',
      'Rotación de personal'
    ]
  },

  // ==================== PELIGROS PSICOSOCIALES ====================
  {
    codigo: 'PSI-001',
    clasificacion: 'psicosocial',
    peligro: 'Estrés laboral',
    descripcion: 'Alta carga laboral, plazos ajustados, presión por resultados',
    riesgoPotencial: 'Síndrome de burnout, trastornos mentales',
    efectosPosibles: 'Ansiedad, depresión, enfermedades cardiovasculares, insomnio',
    medidasControl: [
      'Evaluación de factores de riesgo psicosocial',
      'Pausas activas',
      'Apoyo psicológico',
      'Redistribución de cargas',
      'Programas de bienestar'
    ]
  },
  {
    codigo: 'PSI-002',
    clasificacion: 'psicosocial',
    peligro: 'Acoso laboral (mobbing)',
    descripcion: 'Hostigamiento, maltrato verbal, exclusión sistemática',
    riesgoPotencial: 'Deterioro de la salud mental',
    efectosPosibles: 'Depresión, ansiedad, estrés postraumático, ideación suicida',
    medidasControl: [
      'Protocolo de prevención del acoso',
      'Canales de denuncia confidenciales',
      'Comité de convivencia laboral',
      'Capacitación en clima laboral',
      'Sanciones disciplinarias'
    ]
  },
  {
    codigo: 'PSI-003',
    clasificacion: 'psicosocial',
    peligro: 'Trabajo monótono y repetitivo',
    descripcion: 'Tareas repetitivas sin variedad ni autonomía',
    riesgoPotencial: 'Desmotivación, fatiga mental',
    efectosPosibles: 'Aburrimiento crónico, errores, estrés, TME',
    medidasControl: [
      'Rotación de tareas',
      'Enriquecimiento del puesto',
      'Pausas activas',
      'Participación en mejoras',
      'Reconocimiento laboral'
    ]
  },
  {
    codigo: 'PSI-004',
    clasificacion: 'psicosocial',
    peligro: 'Jornadas extendidas',
    descripcion: 'Trabajo en horarios nocturnos o turnos rotativos',
    riesgoPotencial: 'Trastornos del sueño, fatiga crónica',
    efectosPosibles: 'Insomnio, fatiga, accidentes, enfermedades crónicas',
    medidasControl: [
      'Pausas de descanso programadas',
      'Rotación de turnos',
      'Exámenes médicos periódicos',
      'Iluminación adecuada nocturna',
      'Alimentación saludable'
    ]
  },

  // ==================== PELIGROS BIOMECÁNICOS ====================
  {
    codigo: 'BIO-MEC-001',
    clasificacion: 'biomecanico',
    peligro: 'Movimientos repetitivos',
    descripcion: 'Movimientos repetidos de mano, muñeca, brazo por más de 4 horas',
    riesgoPotencial: 'Trastornos musculoesqueléticos (TME)',
    efectosPosibles: 'Síndrome del túnel carpiano, tendinitis, epicondilitis',
    medidasControl: [
      'Pausas activas cada 2 horas',
      'Rotación de tareas',
      'Rediseño ergonómico',
      'Ejercicios de estiramiento',
      'Valoración ergonómica periódica'
    ]
  },
  {
    codigo: 'BIO-MEC-002',
    clasificacion: 'biomecanico',
    peligro: 'Posturas forzadas',
    descripcion: 'Posiciones incómodas: agachado, arrodillado, brazos elevados',
    riesgoPotencial: 'Lesiones osteomusculares',
    efectosPosibles: 'Lumbalgias, cervicalgias, lesiones de hombro',
    medidasControl: [
      'Ajuste de altura de superficies',
      'Herramientas ergonómicas',
      'Apoyos/soportes',
      'Capacitación en higiene postural',
      'Ejercicios de compensación'
    ]
  },
  {
    codigo: 'BIO-MEC-003',
    clasificacion: 'biomecanico',
    peligro: 'Manipulación manual de cargas',
    descripcion: 'Levantamiento, transporte de cargas >10kg (mujeres) o >25kg (hombres)',
    riesgoPotencial: 'Lesiones de columna, hernias',
    efectosPosibles: 'Lumbalgias, hernias discales, desgarros musculares',
    medidasControl: [
      'Ayudas mecánicas (carretillas, grúas)',
      'Técnica de levantamiento seguro',
      'Trabajo en equipo para cargas pesadas',
      'Limitación de peso máximo',
      'Fortalecimiento muscular'
    ]
  },
  {
    codigo: 'BIO-MEC-004',
    clasificacion: 'biomecanico',
    peligro: 'Esfuerzo físico intenso',
    descripcion: 'Trabajo físico pesado continuo',
    riesgoPotencial: 'Fatiga muscular, lesiones',
    efectosPosibles: 'Agotamiento, lesiones musculares, enfermedades cardiovasculares',
    medidasControl: [
      'Pausas de recuperación',
      'Hidratación',
      'Rotación de tareas',
      'Acondicionamiento físico',
      'Evaluación médica periódica'
    ]
  },

  // ==================== CONDICIONES DE SEGURIDAD ====================
  {
    codigo: 'SEG-001',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Trabajo en alturas (>1.5m)',
    descripcion: 'Trabajo en escaleras, andamios, techos, plataformas elevadas',
    riesgoPotencial: 'Caídas de altura',
    efectosPosibles: 'Fracturas, traumatismos craneales, muerte',
    medidasControl: [
      'Arnés de cuerpo completo',
      'Línea de vida certificada',
      'Andamios certificados',
      'Capacitación en trabajo seguro en alturas',
      'Permiso de trabajo en alturas'
    ]
  },
  {
    codigo: 'SEG-002',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Caídas al mismo nivel',
    descripcion: 'Superficies resbalosas, obstáculos, desorden',
    riesgoPotencial: 'Caídas, tropiezos',
    efectosPosibles: 'Fracturas, esguinces, contusiones',
    medidasControl: [
      'Programa de orden y aseo',
      'Señalización de piso mojado',
      'Calzado antideslizante',
      'Iluminación adecuada',
      'Mantenimiento de pisos'
    ]
  },
  {
    codigo: 'SEG-003',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Espacios confinados',
    descripcion: 'Tanques, silos, túneles, alcantarillas con ventilación limitada',
    riesgoPotencial: 'Asfixia, intoxicación, explosión',
    efectosPosibles: 'Muerte por asfixia, intoxicación aguda, quemaduras',
    medidasControl: [
      'Permiso de entrada a espacios confinados',
      'Medición de atmósfera (O2, gases tóxicos)',
      'Ventilación forzada',
      'Equipos de respiración autónomos',
      'Vigilante externo, rescate'
    ]
  },
  {
    codigo: 'SEG-004',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Contacto eléctrico',
    descripcion: 'Exposición a energía eléctrica, equipos energizados',
    riesgoPotencial: 'Electrocución, quemaduras eléctricas',
    efectosPosibles: 'Fibrilación ventricular, quemaduras, muerte',
    medidasControl: [
      'Bloqueo y etiquetado (LOTO)',
      'Guantes dieléctricos certificados',
      'Herramientas aisladas',
      'Capacitación en seguridad eléctrica',
      'Distancias de seguridad'
    ]
  },
  {
    codigo: 'SEG-005',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Maquinaria y equipos',
    descripcion: 'Atrapamiento en partes móviles, puntos de operación',
    riesgoPotencial: 'Atrapamiento, amputaciones',
    efectosPosibles: 'Fracturas, amputaciones, muerte',
    medidasControl: [
      'Guardas de protección',
      'Sistema de paro de emergencia',
      'Procedimientos de bloqueo',
      'Capacitación en operación segura',
      'Mantenimiento preventivo'
    ]
  },
  {
    codigo: 'SEG-006',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Incendio y explosión',
    descripcion: 'Presencia de materiales combustibles, fuentes de ignición',
    riesgoPotencial: 'Incendio, explosión',
    efectosPosibles: 'Quemaduras, asfixia, muerte, daños materiales',
    medidasControl: [
      'Extintores certificados',
      'Sistema de detección y alarma',
      'Plan de evacuación',
      'Capacitación en uso de extintores',
      'Almacenamiento seguro de combustibles'
    ]
  },

  // ==================== FENÓMENOS NATURALES ====================
  {
    codigo: 'NAT-001',
    clasificacion: 'fenomenos_naturales',
    peligro: 'Sismo',
    descripcion: 'Ubicación en zona de alta actividad sísmica',
    riesgoPotencial: 'Colapso estructural, caída de objetos',
    efectosPosibles: 'Fracturas, traumatismos, sepultamiento, muerte',
    medidasControl: [
      'Plan de emergencias sísmicas',
      'Rutas de evacuación señalizadas',
      'Puntos de encuentro',
      'Simulacros periódicos',
      'Aseguramiento de estanterías'
    ]
  },
  {
    codigo: 'NAT-002',
    clasificacion: 'fenomenos_naturales',
    peligro: 'Inundación',
    descripcion: 'Ubicación en zona de riesgo de inundación',
    riesgoPotencial: 'Inundación de instalaciones',
    efectosPosibles: 'Ahogamiento, electrocución, enfermedades transmitidas por agua',
    medidasControl: [
      'Plan de emergencias por inundación',
      'Sistema de drenaje',
      'Elevación de equipos críticos',
      'Monitoreo de alertas meteorológicas',
      'Seguros contra inundación'
    ]
  },
  {
    codigo: 'NAT-003',
    clasificacion: 'fenomenos_naturales',
    peligro: 'Tormenta eléctrica',
    descripcion: 'Zona con alta incidencia de rayos',
    riesgoPotencial: 'Descargas eléctricas atmosféricas',
    efectosPosibles: 'Electrocución, quemaduras, daños a equipos',
    medidasControl: [
      'Sistema de pararrayos',
      'Protocolo de suspensión de actividades',
      'Refugio seguro',
      'Desconexión de equipos',
      'Protección contra sobretensiones'
    ]
  }
];

export function getPeligroByCodigo(codigo: string): PeligroGTC45 | undefined {
  return peligrosGTC45Predefinidos.find(p => p.codigo === codigo);
}

export const clasificacionPeligroLabels = {
  biologico: 'Peligros Biológicos',
  fisico: 'Peligros Físicos',
  quimico: 'Peligros Químicos',
  psicosocial: 'Peligros Psicosociales',
  biomecanico: 'Peligros Biomecánicos',
  condiciones_seguridad: 'Condiciones de Seguridad',
  fenomenos_naturales: 'Fenómenos Naturales'
};
