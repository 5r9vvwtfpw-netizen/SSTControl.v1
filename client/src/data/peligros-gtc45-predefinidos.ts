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

  // ==================== PELIGROS BIOLÓGICOS (adicionales) ====================
  {
    codigo: 'BIO-005',
    clasificacion: 'biologico',
    peligro: 'Fluidos corporales y accidente por pinchazo',
    descripcion: 'Contacto con sangre, orina, secreciones y material punzocortante contaminado (agujas, bisturís)',
    riesgoPotencial: 'Infección por VIH, Hepatitis B y C, enfermedades hemáticas',
    efectosPosibles: 'VIH/SIDA, hepatitis B crónica, hepatitis C, seroconversión',
    medidasControl: [
      'Técnica segura de manejo de agujas',
      'Nunca reencapuchar agujas',
      'Descartadores rígidos resistentes a perforación',
      'EPP (guantes dobles, gafas, bata)',
      'Protocolo de accidente biológico y reporte inmediato',
      'Vacunación contra Hepatitis B'
    ]
  },
  {
    codigo: 'BIO-006',
    clasificacion: 'biologico',
    peligro: 'Vectores (mosquitos, zancudos, garrapatas)',
    descripcion: 'Exposición a vectores transmisores de enfermedades en trabajo de campo o zonas tropicales',
    riesgoPotencial: 'Enfermedades vectoriales (dengue, malaria, zika, chikungunya, fiebre amarilla)',
    efectosPosibles: 'Dengue hemorrágico, malaria cerebral, microcefalia (Zika), muerte',
    medidasControl: [
      'Ropa de manga larga y pantalón largo',
      'Repelente con DEET aprobado',
      'Toldillos en zonas endémicas',
      'Vacunación (fiebre amarilla)',
      'Capacitación en reconocimiento de vectores'
    ]
  },
  {
    codigo: 'BIO-007',
    clasificacion: 'biologico',
    peligro: 'Zoonosis (enfermedades transmitidas por animales)',
    descripcion: 'Contacto con animales enfermos o sus productos (veterinaria, ganadería, laboratorio animal)',
    riesgoPotencial: 'Brucelosis, leptospirosis, rabia, carbunco, fiebre Q',
    efectosPosibles: 'Fiebres recurrentes, meningitis, falla orgánica, muerte',
    medidasControl: [
      'EPP completo al manipular animales',
      'Vacunación (rabia, carbunco)',
      'Capacitación en manejo seguro de animales',
      'No tocar animales muertos sin protección',
      'Exámenes médicos periódicos'
    ]
  },
  {
    codigo: 'BIO-008',
    clasificacion: 'biologico',
    peligro: 'Parásitos y ectoparásitos',
    descripcion: 'Exposición a parásitos intestinales, pulgas, piojos, acaros en trabajo de campo o con población vulnerable',
    riesgoPotencial: 'Parasitosis intestinal, escabiosis, pediculosis',
    efectosPosibles: 'Anemia, desnutrición, prurito intenso, infecciones secundarias',
    medidasControl: [
      'Higiene personal estricta',
      'Protección de ropa y calzado',
      'Exámenes coprológicos periódicos',
      'Desparasitación periódica',
      'Capacitación en higiene'
    ]
  },
  {
    codigo: 'BIO-009',
    clasificacion: 'biologico',
    peligro: 'Látex (alergia ocupacional)',
    descripcion: 'Exposición frecuente al látex de guantes y equipos médicos — especialmente en personal de salud',
    riesgoPotencial: 'Alergia al látex, choque anafiláctico',
    efectosPosibles: 'Urticaria, dermatitis de contacto, asma, anafilaxia grave',
    medidasControl: [
      'Sustitución por guantes sin látex (nitrilo o neopreno)',
      'Tamizaje de alergia al látex en ingreso',
      'Señalización de zonas libres de látex',
      'Disponibilidad de adrenalina (epipen)',
      'Seguimiento dermatológico'
    ]
  },
  {
    codigo: 'BIO-010',
    clasificacion: 'biologico',
    peligro: 'Residuos biológicos peligrosos (RESPEL hospitalarios)',
    descripcion: 'Manejo de residuos anatomopatológicos, infecciosos, cortopunzantes y biológicos',
    riesgoPotencial: 'Infección por patógenos, intoxicación',
    efectosPosibles: 'Infecciones bacterianas y virales, contaminación del personal de aseo',
    medidasControl: [
      'Código de colores (rojo=infeccioso, negro=ordinario, verde=orgánico)',
      'Doble bolsa para residuos infecciosos',
      'EPP completo para operarios de aseo hospitalario',
      'Ruta sanitaria documentada',
      'Gestor ambiental certificado'
    ]
  },
  {
    codigo: 'BIO-011',
    clasificacion: 'biologico',
    peligro: 'Priones (agentes infecciosos proteínicos)',
    descripcion: 'Exposición a tejido nervioso potencialmente contaminado con priones en cirugía o autopsia (Enfermedad de Creutzfeldt-Jakob)',
    riesgoPotencial: 'Encefalopatía espongiforme transmisible',
    efectosPosibles: 'Demencia progresiva, muerte (enfermedad incurable)',
    medidasControl: [
      'Protocolo específico de esterilización de instrumental (NaOH 1N o autoclave 134°C)',
      'EPP de barrera máxima',
      'Registro de instrumentos usados en casos sospechosos',
      'Capacitación específica',
      'Asesoría de infectología ante exposición'
    ]
  },

  // ==================== PELIGROS FÍSICOS (adicionales) ====================
  {
    codigo: 'FIS-007',
    clasificacion: 'fisico',
    peligro: 'Radiaciones ionizantes (Rayos X, gamma, beta)',
    descripcion: 'Exposición a radiaciones ionizantes en radiolología, medicina nuclear, industria nuclear o radiografía industrial',
    riesgoPotencial: 'Cáncer, daño genético, síndrome de irradiación aguda',
    efectosPosibles: 'Leucemia, cáncer de tiroides, cataratas por radiación, daño fetal',
    medidasControl: [
      'Dosímetro personal de uso obligatorio',
      'Delantal plomado y protector tiroideo',
      'Distancia, tiempo y blindaje (tres principios de radioprotección)',
      'Límites de dosis (50 mSv/año trabajadores, 1 mSv/año público)',
      'Monitoreo dosimétrico mensual y registro',
      'Prohibición de embarazadas en zonas de radiación'
    ]
  },
  {
    codigo: 'FIS-008',
    clasificacion: 'fisico',
    peligro: 'Radiación láser (Clases III y IV)',
    descripcion: 'Exposición a rayos láser de alta potencia en cirugía, industria, estética o telecomunicaciones',
    riesgoPotencial: 'Quemaduras oculares irreversibles, quemaduras cutáneas',
    efectosPosibles: 'Ceguera permanente, quemaduras de retina, quemaduras de piel',
    medidasControl: [
      'Gafas de protección certificadas para longitud de onda específica',
      'Señalización de zona de uso de láser',
      'Procedimientos escritos de uso seguro',
      'Apagado automático de seguridad',
      'Capacitación en seguridad láser'
    ]
  },
  {
    codigo: 'FIS-009',
    clasificacion: 'fisico',
    peligro: 'Temperaturas extremas (frío)',
    descripcion: 'Exposición a temperaturas por debajo de 10°C en cuartos fríos, congeladores industriales, trabajo en altura o zonas frías',
    riesgoPotencial: 'Hipotermia, congelamiento, pie de trinchera',
    efectosPosibles: 'Hipotermia, congelaciones de extremidades, fenómeno de Raynaud',
    medidasControl: [
      'Ropa térmica multicapa',
      'Límite de tiempo de exposición al frío',
      'Rotación de personal y zonas de calentamiento',
      'Monitoreo de temperatura corporal',
      'EPP térmico certificado (guantes, botas, gorros)'
    ]
  },
  {
    codigo: 'FIS-010',
    clasificacion: 'fisico',
    peligro: 'Campos electromagnéticos (CEM)',
    descripcion: 'Exposición a campos electromagnéticos de motores eléctricos, resonancia magnética, soldadura, hornos de inducción',
    riesgoPotencial: 'Efectos neurológicos, interferencia con implantes médicos',
    efectosPosibles: 'Mareos, vértigo, calentamiento de tejidos, riesgo en portadores de marcapasos',
    medidasControl: [
      'Restricción de acceso a portadores de marcapasos o implantes',
      'Distancias de seguridad documentadas',
      'Medición periódica de CEM',
      'Señalización de zonas con CEM',
      'Capacitación específica'
    ]
  },
  {
    codigo: 'FIS-011',
    clasificacion: 'fisico',
    peligro: 'Gases anestésicos residuales (trazas)',
    descripcion: 'Exposición crónica a concentraciones traza de agentes anestésicos volátiles (halotano, sevoflurano, isoflurano, óxido nitroso) en quirófanos',
    riesgoPotencial: 'Toxicidad hepática, renal y hematológica crónica',
    efectosPosibles: 'Hepatotoxicidad, nefrotoxicidad, disminución de fertilidad, aborto espontáneo',
    medidasControl: [
      'Sistemas de evacuación de gases anestésicos residuales (SEGAR)',
      'Mantenimiento de equipos de anestesia sin fugas',
      'Monitoreo ambiental de gases en quirófano',
      'Ventilación con recambios de aire de 20+ vol/h',
      'Vigilancia médica específica para personal expuesto'
    ]
  },
  {
    codigo: 'FIS-012',
    clasificacion: 'fisico',
    peligro: 'Radiación solar (trabajo en exteriores)',
    descripcion: 'Exposición prolongada a radiación ultravioleta solar en trabajo de campo, construcción, agricultura',
    riesgoPotencial: 'Cáncer de piel, golpe de calor',
    efectosPosibles: 'Melanoma, carcinoma escamocelular, fotoqueratitis, cataratas',
    medidasControl: [
      'Bloqueador solar FPS 50+ aplicación cada 2 horas',
      'Ropa con factor de protección UV',
      'Sombreros de ala ancha',
      'Evitar exposición entre 10am-4pm',
      'Capacitación en protección solar'
    ]
  },
  {
    codigo: 'FIS-013',
    clasificacion: 'fisico',
    peligro: 'Hipobaria (trabajo en grandes alturas sobre el nivel del mar)',
    descripcion: 'Trabajo a más de 2.500 msnm (minería en altiplano, trabajo en Bogotá, Medellín, obras de altura)',
    riesgoPotencial: 'Mal de montaña agudo, edema pulmonar de altura',
    efectosPosibles: 'Cefalea, náuseas, disnea, edema pulmonar, muerte en casos severos',
    medidasControl: [
      'Aclimatación gradual (ascender no más de 300m/día sobre 3000m)',
      'Exámenes médicos de aptitud específicos para altura',
      'Disponibilidad de oxígeno suplementario',
      'Protocolos de descenso de emergencia',
      'Monitoreo de síntomas del mal de altura'
    ]
  },

  // ==================== PELIGROS QUÍMICOS (adicionales) ====================
  {
    codigo: 'QUI-005',
    clasificacion: 'quimico',
    peligro: 'Solventes orgánicos',
    descripcion: 'Exposición a tolueno, xileno, acetona, benceno, éter, alcoholes en industria química, pintura, laboratorio',
    riesgoPotencial: 'Intoxicación crónica del sistema nervioso central, cáncer',
    efectosPosibles: 'Neuropatía periférica, daño hepático/renal, leucemia (benceno), síndrome orgánico de los solventes',
    medidasControl: [
      'Ventilación local exhaustora',
      'Respiradores con filtro de carbón activo para vapores orgánicos',
      'Sustitución de solventes por opciones menos tóxicas',
      'Monitoreo biológico periódico',
      'Guantes de nitrilo o neopreno (no látex)'
    ]
  },
  {
    codigo: 'QUI-006',
    clasificacion: 'quimico',
    peligro: 'Plaguicidas y pesticidas',
    descripcion: 'Exposición a organofosforados, carbamatos, piretroides, fungicidas en aplicación agropecuaria o fumigación',
    riesgoPotencial: 'Intoxicación aguda o crónica por plaguicidas',
    efectosPosibles: 'Síndrome colinérgico, neuropatía, cáncer (organoclorados), daño hepático',
    medidasControl: [
      'EPP completo (overol, guantes de nitrilo, careta, respirador)',
      'No fumigar en contra del viento',
      'Lectura de etiqueta e indicaciones del fabricante',
      'Colinesterasa sérica periódica (organofosforados)',
      'Capacitación certificada en manejo de plaguicidas'
    ]
  },
  {
    codigo: 'QUI-007',
    clasificacion: 'quimico',
    peligro: 'Metales pesados (plomo, mercurio, cadmio, cromo)',
    descripcion: 'Exposición a metales pesados en fundición, baterías, pintura, metalurgia, minería',
    riesgoPotencial: 'Intoxicación crónica por metales pesados',
    efectosPosibles: 'Saturnismo (plomo), acrودینia (mercurio), cáncer de pulmón (cromo VI), nefrotoxicidad (cadmio)',
    medidasControl: [
      'Plumbemia periódica (plomo)',
      'Respiradores P100',
      'Guantes y ropa resistente',
      'Higiene estricta antes de comer',
      'No llevar ropa de trabajo a casa'
    ]
  },
  {
    codigo: 'QUI-008',
    clasificacion: 'quimico',
    peligro: 'Agentes anestésicos volátiles',
    descripcion: 'Preparación y administración de agentes inhalatorios (sevoflurano, isoflurano, desflurano, óxido nitroso)',
    riesgoPotencial: 'Hepatotoxicidad, teratogenicidad, deterioro cognitivo',
    efectosPosibles: 'Daño hepático, aborto espontáneo, malformaciones fetales, deterioro de memoria',
    medidasControl: [
      'Sistemas de evacuación de gases anestésicos (SEGAR)',
      'Mantenimiento preventivo de equipos de anestesia',
      'Monitoreo ambiental de N2O y halogenados',
      'Restricción en embarazadas',
      'Rotación de personal expuesto'
    ]
  },
  {
    codigo: 'QUI-009',
    clasificacion: 'quimico',
    peligro: 'Formaldehído y glutaraldehído',
    descripcion: 'Exposición a formaldehído (fijación de tejidos en patología) y glutaraldehído (desinfección de alto nivel en endoscopía)',
    riesgoPotencial: 'Carcinogénesis, sensibilización respiratoria y dermatológica',
    efectosPosibles: 'Cáncer nasofaríngeo (formaldehído), dermatitis, asma ocupacional, irritación ocular severa',
    medidasControl: [
      'Cabinas con extracción local forzada',
      'Guantes de nitrilo gruesos o neopreno',
      'Gafas o careta splash',
      'Monitoreo ambiental (TLV: 0.3 ppm formaldehído)',
      'Sustitución por desinfectantes de menor riesgo cuando sea posible'
    ]
  },
  {
    codigo: 'QUI-010',
    clasificacion: 'quimico',
    peligro: 'Agentes citostáticos y quimioterapéuticos',
    descripcion: 'Preparación y administración de medicamentos oncológicos (ciclofosfamida, metotrexato, doxorrubicina, etc.)',
    riesgoPotencial: 'Carcinogénesis, mutagenicidad, teratogénesis',
    efectosPosibles: 'Leucemia secundaria, daño genético, aborto, malformaciones en hijos',
    medidasControl: [
      'Cabina de flujo laminar vertical Clase II B2',
      'Guantes de quimioterapia dobles (prueba de permeabilidad)',
      'Bata de polipropileno no reutilizable',
      'Eliminación de residuos como peligrosos (RESPEL)',
      'Capacitación en manejo seguro de citostáticos'
    ]
  },
  {
    codigo: 'QUI-011',
    clasificacion: 'quimico',
    peligro: 'Humos de soldadura y corte',
    descripcion: 'Inhalación de humos metálicos generados por soldadura MIG/TIG/SMAW, corte con plasma u oxicorte',
    riesgoPotencial: 'Fiebre de los metales, siderosis, cáncer de pulmón',
    efectosPosibles: 'Fiebre de los fundidores, siderosis pulmonar, cáncer de pulmón (Cr VI en acero inoxidable)',
    medidasControl: [
      'Extracción local en punto de generación',
      'Respirador P100 o con filtro P3 para humos metálicos',
      'Soldadura en sentido del viento',
      'Ventilación general del taller',
      'Espirometrías periódicas'
    ]
  },
  {
    codigo: 'QUI-012',
    clasificacion: 'quimico',
    peligro: 'Explosivos, pólvora y pirotecnia',
    descripcion: 'Manejo de explosivos en minería, construcción, demolición o fabricación de pirotecnia',
    riesgoPotencial: 'Explosión, intoxicación por nitrógeno',
    efectosPosibles: 'Muerte por explosión, amputaciones, quemaduras, intoxicación por NOx',
    medidasControl: [
      'Certificación ANLA para manejo de explosivos',
      'Almacenamiento en polvorín autorizado',
      'Distancias de seguridad',
      'Comunicación de radio apagada en zona de voladura',
      'Plan de emergencias para explosivos'
    ]
  },
  {
    codigo: 'QUI-013',
    clasificacion: 'quimico',
    peligro: 'Sílice cristalina respirable',
    descripcion: 'Exposición a polvo de sílice libre cristalina en minería, construcción, cerámica, fundición y arenado',
    riesgoPotencial: 'Silicosis, cáncer de pulmón, enfermedad renal crónica',
    efectosPosibles: 'Silicosis aguda o crónica, cor pulmonale, cáncer de pulmón (IARC Grupo 1)',
    medidasControl: [
      'Eliminación o sustitución del proceso generador de polvo',
      'Ventilación y aspiración en la fuente',
      'Respiradores con filtro P100',
      'Vigilancia de espirometría y Rx tórax anual',
      'Supresión con agua en corte y perforación'
    ]
  },
  {
    codigo: 'QUI-014',
    clasificacion: 'quimico',
    peligro: 'Isocianatos (TDI, MDI)',
    descripcion: 'Exposición a isocianatos en fabricación de espumas de poliuretano, pinturas de acabado y recubrimientos',
    riesgoPotencial: 'Asma ocupacional severa, sensibilización irreversible',
    efectosPosibles: 'Asma ocupacional, hipersensibilidad crónica, alveolitis alérgica extrínseca',
    medidasControl: [
      'Cabina cerrada con presión negativa',
      'Respirador con filtro combinado (partículas + vapores orgánicos)',
      'Evaluación pulmonar previa y periódica',
      'No volver a exponer trabajadores ya sensibilizados',
      'Mantenimiento preventivo de mezcladoras'
    ]
  },
  {
    codigo: 'QUI-015',
    clasificacion: 'quimico',
    peligro: 'Desinfectantes y productos de limpieza',
    descripcion: 'Uso frecuente de hipoclorito de sodio, amonio cuaternario, ácido peracético, clorhexidina en limpieza hospitalaria o industrial',
    riesgoPotencial: 'Irritación respiratoria crónica, dermatitis, asma',
    efectosPosibles: 'Dermatitis de contacto, asma por desinfectantes, irritación de mucosas',
    medidasControl: [
      'Guantes de nitrilo para manipulación',
      'Dilución correcta según ficha técnica',
      'Ventilación adecuada',
      'No mezclar productos (hipoclorito + amonio = cloraminas tóxicas)',
      'Capacitación en uso seguro'
    ]
  },

  // ==================== PELIGROS PSICOSOCIALES (adicionales) ====================
  {
    codigo: 'PSI-005',
    clasificacion: 'psicosocial',
    peligro: 'Violencia de terceros (clientes, usuarios, pacientes)',
    descripcion: 'Agresiones verbales, amenazas o agresiones físicas por parte de clientes, pacientes o público',
    riesgoPotencial: 'Trauma psicológico, lesiones físicas',
    efectosPosibles: 'TEPT, lesiones físicas, estrés postraumático, ausentismo',
    medidasControl: [
      'Protocolo de atención a pacientes/usuarios agresivos',
      'Capacitación en manejo de situaciones difíciles',
      'Acompañamiento en zonas de riesgo',
      'Sistemas de alerta y comunicación',
      'Atención psicológica post-incidente'
    ]
  },
  {
    codigo: 'PSI-006',
    clasificacion: 'psicosocial',
    peligro: 'Carga emocional (duelo, sufrimiento, muerte)',
    descripcion: 'Exposición frecuente a muerte, sufrimiento, situaciones traumáticas — especialmente en personal de salud, emergencias y trabajo social',
    riesgoPotencial: 'Síndrome de fatiga por compasión, burnout',
    efectosPosibles: 'Depresión, ansiedad, insomnio, absentismo, abandono profesional',
    medidasControl: [
      'Grupos de apoyo entre pares',
      'Atención psicológica disponible',
      'Rotación de servicios de alta demanda emocional',
      'Capacitación en duelo y manejo emocional',
      'Reconocimiento y validación del impacto emocional'
    ]
  },
  {
    codigo: 'PSI-007',
    clasificacion: 'psicosocial',
    peligro: 'Trabajo aislado o en solitario',
    descripcion: 'Trabajo en lugares remotos, solos, sin posibilidad de pedir ayuda rápida (vigilancia nocturna, domicilios, campo)',
    riesgoPotencial: 'Accidentes sin atención oportuna, violencia',
    efectosPosibles: 'Mayor gravedad de accidentes, robo, agresión, estrés por aislamiento',
    medidasControl: [
      'Sistema de check-in periódico obligatorio',
      'Radio o celular siempre activo',
      'Protocolo de "hombre muerto" (alarma por inactividad)',
      'Acompañamiento en zonas de riesgo',
      'GPS en vehículos'
    ]
  },
  {
    codigo: 'PSI-008',
    clasificacion: 'psicosocial',
    peligro: 'Alta exigencia y toma de decisiones críticas',
    descripcion: 'Responsabilidad sobre vidas humanas, decisiones con consecuencias graves sin tiempo suficiente (cirugía, pilotos, operadores de planta)',
    riesgoPotencial: 'Error humano crítico, burnout de alto desempeño',
    efectosPosibles: 'Errores de omisión, burnout, infartos, trastornos de ansiedad generalizada',
    medidasControl: [
      'Listas de chequeo (checklists) obligatorias',
      'Trabajo en equipo y segunda opinión',
      'Límites de horas de trabajo continuo',
      'Simulacros y entrenamiento en situaciones críticas',
      'Atención psicológica preventiva'
    ]
  },
  {
    codigo: 'PSI-009',
    clasificacion: 'psicosocial',
    peligro: 'Doble presencia (conflicto trabajo-familia)',
    descripcion: 'Imposibilidad de conciliar demandas laborales con responsabilidades familiares — turnos rotativos, horas extra, desplazamientos frecuentes',
    riesgoPotencial: 'Estrés crónico, deterioro de relaciones familiares',
    efectosPosibles: 'Conflicto familia-trabajo, depresión, burnout, consumo de alcohol',
    medidasControl: [
      'Políticas de conciliación trabajo-familia',
      'Flexibilidad de horarios cuando sea posible',
      'Permisos remunerados para situaciones familiares urgentes',
      'Beneficios de apoyo familiar',
      'Evaluación periódica de riesgo psicosocial (Batería MINTRA)'
    ]
  },
  {
    codigo: 'PSI-010',
    clasificacion: 'psicosocial',
    peligro: 'Falta de control sobre el trabajo (baja autonomía)',
    descripcion: 'Actividades con escaso margen de decisión, imposibilidad de modificar el ritmo o método de trabajo',
    riesgoPotencial: 'Estrés crónico, desmotivación, enfermedad cardiovascular',
    efectosPosibles: 'Hipertensión arterial, enfermedad coronaria, burnout, absentismo',
    medidasControl: [
      'Enriquecimiento del puesto',
      'Participación en decisiones del área',
      'Autonomía en organización de la tarea',
      'Evaluación de factores psicosociales',
      'Programas de reconocimiento'
    ]
  },

  // ==================== PELIGROS BIOMECÁNICOS (adicionales) ====================
  {
    codigo: 'BIO-MEC-005',
    clasificacion: 'biomecanico',
    peligro: 'Trabajo sedentario prolongado',
    descripcion: 'Permanecer sentado más de 6 horas continuas sin pausas activas (trabajo de oficina, call center, cajeros)',
    riesgoPotencial: 'Trastornos musculoesqueléticos, enfermedad cardiovascular',
    efectosPosibles: 'Lumbalgias, dorsalgias, síndrome metabólico, obesidad, enfermedad cardiovascular',
    medidasControl: [
      'Pausas activas cada 45-60 minutos',
      'Silla ergonómica regulable',
      'Monitor a altura de ojos',
      'Escritorio de pie alternado',
      'Programa de higiene postural y ejercicio'
    ]
  },
  {
    codigo: 'BIO-MEC-006',
    clasificacion: 'biomecanico',
    peligro: 'Trabajo de pie prolongado',
    descripcion: 'Bipedestación continua más de 4 horas (cajeros, cirujanos, personal de producción)',
    riesgoPotencial: 'Várices, lumbalgias, fatiga de miembros inferiores',
    efectosPosibles: 'Varices, edema de extremidades inferiores, lumbalgias, fascitis plantar',
    medidasControl: [
      'Uso de tapetes antifatiga',
      'Calzado de seguridad con soporte plantar',
      'Apoyo para un pie (reposapiés)',
      'Medias de compresión',
      'Rotación con trabajo sentado'
    ]
  },
  {
    codigo: 'BIO-MEC-007',
    clasificacion: 'biomecanico',
    peligro: 'Trabajo de precisión con esfuerzo visual (pantallas)',
    descripcion: 'Trabajo intensivo con pantallas, microscopios, instrumentos de precisión por más de 4 horas',
    riesgoPotencial: 'Síndrome visual informático, fatiga ocular',
    efectosPosibles: 'Cefalea, visión borrosa, ojo seco, fatiga ocular, miopía progresiva',
    medidasControl: [
      'Regla 20-20-20 (cada 20 min, mirar 20 pies de distancia por 20 segundos)',
      'Pantalla a 50-70 cm del ojo',
      'Sin reflejos en pantalla',
      'Examen visual anual',
      'Lágrimas artificiales para ojo seco'
    ]
  },
  {
    codigo: 'BIO-MEC-008',
    clasificacion: 'biomecanico',
    peligro: 'Movilización de pacientes (paciente handling)',
    descripcion: 'Transferencia, giro y movilización de pacientes en cama, camilla o silla de ruedas — especialmente en enfermería',
    riesgoPotencial: 'Lesiones de columna lumbar y hombros',
    efectosPosibles: 'Hernia discal lumbar, desgarro de manguito rotador, lesión de rodilla',
    medidasControl: [
      'Equipos de ayuda: grúas de transferencia, tabla de deslizamiento, cinturones de marcha',
      'Técnica de movilización segura de pacientes (MAPO)',
      'Trabajo en equipo para movilizaciones complejas',
      'Capacitación práctica en ergonomía hospitalaria',
      'Evaluación de carga laboral MAPO periódica'
    ]
  },

  // ==================== CONDICIONES DE SEGURIDAD (adicionales) ====================
  {
    codigo: 'SEG-007',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Accidente de tránsito en vía pública',
    descripcion: 'Conducción de vehículos de empresa, motocicletas o desplazamiento en vía pública como actividad laboral',
    riesgoPotencial: 'Accidentes de tránsito con lesiones o muerte',
    efectosPosibles: 'Politrauma, traumatismo craneoencefálico, fracturas, muerte',
    medidasControl: [
      'PESV (Plan Estratégico de Seguridad Vial) según Res. 40595/2022',
      'Revisión preoperacional del vehículo',
      'Prohibición del uso de celular conduciendo',
      'Capacitación en manejo defensivo certificada',
      'Exámenes médicos a conductores con énfasis visual y auditivo'
    ]
  },
  {
    codigo: 'SEG-008',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Porte y uso de armas de fuego',
    descripcion: 'Uso de armas de fuego en vigilancia privada, escolta, transporte de valores o fuerzas militares',
    riesgoPotencial: 'Lesiones por arma de fuego (propias y terceros)',
    efectosPosibles: 'Heridas por arma de fuego, muerte, trauma psicológico',
    medidasControl: [
      'Capacitación y certificación en uso y manejo de armas',
      'Psicotécnico periódico',
      'Mantenimiento y revisión del arma',
      'Protocolo de uso de la fuerza',
      'Examen psicológico de aptitud'
    ]
  },
  {
    codigo: 'SEG-009',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Trabajo en caliente (soldadura, amolado, oxicorte)',
    descripcion: 'Actividades que generan chispas, llamas, calor intenso en áreas con materiales combustibles',
    riesgoPotencial: 'Incendio, explosión, quemaduras',
    efectosPosibles: 'Quemaduras de primer a tercer grado, incendio, explosión',
    medidasControl: [
      'Permiso de trabajo en caliente',
      'Remoción de materiales combustibles en radio de 10m',
      'Extintor y manguera disponibles',
      'Ropa y guantes de soldador (cuero)',
      'Vigía de incendio post-trabajo (30 minutos mínimo)'
    ]
  },
  {
    codigo: 'SEG-010',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Proyección de partículas / fragmentos',
    descripcion: 'Desprendimiento de partículas, esquirlas o fragmentos en esmerilado, torneado, corte de madera, desbaste',
    riesgoPotencial: 'Lesiones oculares, laceraciones',
    efectosPosibles: 'Penetración ocular, ceguera, laceraciones faciales',
    medidasControl: [
      'Gafas de seguridad con protección lateral',
      'Careta facial para esmerilado',
      'Guardas de protección en máquinas',
      'Pantallas o barreras físicas',
      'Zona de trabajo delimitada'
    ]
  },
  {
    codigo: 'SEG-011',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Caída de objetos y materiales',
    descripcion: 'Caída de herramientas, cargas suspendidas, estanterías o materiales desde altura',
    riesgoPotencial: 'Traumatismos craneoencefálicos, fracturas',
    efectosPosibles: 'Traumatismo craneoencefálico, fracturas, aplastamiento',
    medidasControl: [
      'Casco de seguridad en zonas de riesgo',
      'Aseguramiento de herramientas en altura (cintas, bolsos)',
      'Señalización y delimitación de zonas de influencia',
      'Estanterías certificadas y ancladas a la pared',
      'Mallas de protección en andamios'
    ]
  },
  {
    codigo: 'SEG-012',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Herramientas cortopunzantes y cortantes',
    descripcion: 'Manejo de cuchillos, bisturís, tijeras, cinceles, motosierras, sierras circulares',
    riesgoPotencial: 'Cortes, heridas, amputaciones',
    efectosPosibles: 'Heridas corto-contundentes, laceraciones profundas, amputaciones',
    medidasControl: [
      'Guantes anticorte certificados (nivel 5)',
      'Técnica segura de manejo y traslado',
      'Herramientas en estuches cuando no se usan',
      'Capacitación en uso correcto de herramientas',
      'Mantenimiento de filo para evitar deslizamientos'
    ]
  },
  {
    codigo: 'SEG-013',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Equipos a presión y sistemas hidráulicos',
    descripcion: 'Operación de calderas, compresores, mangueras hidráulicas, cilindros de gas comprimido',
    riesgoPotencial: 'Explosión, látigo de manguera, quemaduras por vapor',
    efectosPosibles: 'Quemaduras por vapor o líquido caliente, traumatismos por látigo de manguera, explosión',
    medidasControl: [
      'Inspección y pruebas hidrostáticas periódicas',
      'Válvulas de seguridad calibradas',
      'Operadores certificados para manejo de calderas',
      'Manejo correcto de cilindros de gas (encadenados verticales)',
      'Distancias de seguridad'
    ]
  },
  {
    codigo: 'SEG-014',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Derrumbe, colapso de estructuras y taludes',
    descripcion: 'Riesgo de colapso en excavaciones sin entibado, estructuras deterioradas, taludes inestables',
    riesgoPotencial: 'Sepultamiento, aplastamiento',
    efectosPosibles: 'Aplastamiento, asfixia por sepultamiento, muerte',
    medidasControl: [
      'Entibado o tablestacado en excavaciones >1.5m',
      'Análisis geotécnico previo',
      'Inspección diaria de taludes y paredes de excavación',
      'Señalización y restricción de acceso',
      'Plan de emergencias para rescate en derrumbe'
    ]
  },
  {
    codigo: 'SEG-015',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Animales peligrosos (ofidios, abejas, arañas)',
    descripcion: 'Riesgo de picaduras o mordeduras de animales venenosos en trabajo de campo, rurales o áreas silvestres',
    riesgoPotencial: 'Envenenamiento, anafilaxia',
    efectosPosibles: 'Envenenamiento ofídico, anafilaxia por abejas, necrosis tisular',
    medidasControl: [
      'Botas de caña alta en campo',
      'No meter manos en huecos sin revisar',
      'Suero antiofídico disponible en campo',
      'Capacitación en primeros auxilios para mordeduras/picaduras',
      'Kit de emergencias médicas en campo'
    ]
  },
  {
    codigo: 'SEG-016',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Orden público y violencia (atraco, secuestro)',
    descripcion: 'Riesgo de atraco, robo o violencia por presencia en zonas de orden público comprometido o manejo de valores',
    riesgoPotencial: 'Lesiones físicas, trauma psicológico, muerte',
    efectosPosibles: 'Lesiones, TEPT, muerte, secuestro extorsivo',
    medidasControl: [
      'Evaluación de riesgo por seguridad antes de desplazamientos',
      'Protocolo de comunicación en campo',
      'No portar grandes sumas de efectivo',
      'Vehículos sin identificación corporativa en zonas de riesgo',
      'Apoyo psicológico post-incidente crítico'
    ]
  },
  {
    codigo: 'SEG-017',
    clasificacion: 'condiciones_seguridad',
    peligro: 'Electrocirugía y bisturí eléctrico',
    descripcion: 'Uso de unidades de electrocirugía (bisturí eléctrico, electrocauterio) en quirófano y procedimientos médicos',
    riesgoPotencial: 'Quemaduras eléctricas, incendio, interferencia con implantes',
    efectosPosibles: 'Quemaduras del paciente, quemaduras del operador, incendio en campo quirúrgico',
    medidasControl: [
      'Verificación de placa de retorno activa',
      'No usar en presencia de gases inflamables (O2, anestesia)',
      'Capacitación específica en uso de electrocirugía',
      'Mantenimiento periódico de unidades ESU',
      'Alertar en pacientes con marcapasos'
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
