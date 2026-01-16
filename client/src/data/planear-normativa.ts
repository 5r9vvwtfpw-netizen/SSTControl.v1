/**
 * BASE DE CONOCIMIENTO NORMATIVO SST COLOMBIA
 * Resolución 0312/2019 - Estándares Mínimos del SG-SST
 * Decreto 1072/2015 - Decreto Único Reglamentario del Sector Trabajo
 * ISO 45001:2018 - Sistema de Gestión de Seguridad y Salud en el Trabajo
 */

// =====================================================
// ESTRUCTURA BASE DE NORMATIVAS
// =====================================================

export interface NormativaBase {
  codigo: string;
  norma: string;
  articulo?: string;
  descripcion: string;
  requisitos: string[];
  obligatorio: boolean;
}

export interface EstandarSst {
  codigo: string;
  nombre: string;
  ciclo: 'planear' | 'hacer' | 'verificar' | 'actuar';
  categoria: string;
  normativaAplicable: NormativaBase[];
  camposSugeridos: CampoSugerido[];
  plantillas?: PlantillaPredefinida[];
  puntaje?: number;
}

export interface CampoSugerido {
  campo: string;
  tipo: 'texto' | 'fecha' | 'select' | 'textarea' | 'numero';
  valorSugerido?: string;
  opciones?: string[];
  normativaReferencia?: string;
}

export interface PlantillaPredefinida {
  id: string;
  nombre: string;
  descripcion: string;
  campos: Record<string, any>;
  normativaBase: string;
}

// =====================================================
// NORMATIVAS PRINCIPALES
// =====================================================

export const NORMATIVAS_PRINCIPALES: NormativaBase[] = [
  {
    codigo: 'RES-0312-2019',
    norma: 'Resolución 0312 de 2019',
    descripcion: 'Estándares Mínimos del Sistema de Gestión de Seguridad y Salud en el Trabajo',
    requisitos: [
      'Aplicable a empleadores públicos y privados',
      'Trabajadores dependientes e independientes',
      'Contratantes de personal bajo modalidad de contrato civil',
      'Organizaciones de economía solidaria y sector cooperativo'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2015',
    norma: 'Decreto 1072 de 2015',
    articulo: 'Libro 2, Parte 2, Título 4, Capítulo 6',
    descripcion: 'Decreto Único Reglamentario del Sector Trabajo - Sistema de Gestión de SST',
    requisitos: [
      'Política de SST con objetivos medibles',
      'Asignación de responsabilidades',
      'Identificación de peligros y valoración de riesgos',
      'Plan de trabajo anual',
      'Capacitación en SST',
      'Manejo de emergencias',
      'Investigación de incidentes y accidentes'
    ],
    obligatorio: true
  },
  {
    codigo: 'ISO-45001-2018',
    norma: 'ISO 45001:2018',
    descripcion: 'Sistema de Gestión de la Seguridad y Salud en el Trabajo - Requisitos',
    requisitos: [
      'Contexto de la organización',
      'Liderazgo y participación de trabajadores',
      'Planificación',
      'Apoyo',
      'Operación',
      'Evaluación del desempeño',
      'Mejora'
    ],
    obligatorio: false
  }
];

// =====================================================
// ESTÁNDARES CAPÍTULO 1: RECURSOS
// =====================================================

export const ESTANDARES_RECURSOS: EstandarSst[] = [
  // 1.1.1 - Responsable del SG-SST
  {
    codigo: '1.1.1',
    nombre: 'Asignación de una persona que diseña el SG-SST',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'RES-0312-ART-3',
        norma: 'Resolución 0312/2019',
        articulo: 'Artículo 3',
        descripcion: 'Estándares mínimos para empresas de menos de 10 trabajadores',
        requisitos: [
          'Designar persona responsable del SG-SST',
          'Capacitación mínima de 50 horas en SST',
          'Curso certificado por el SENA o institución autorizada'
        ],
        obligatorio: true
      },
      {
        codigo: 'DEC-1072-2.2.4.6.8',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.8',
        descripcion: 'Obligaciones de los empleadores',
        requisitos: [
          'Definir y asignar responsabilidades en SST',
          'Asignar recursos financieros, técnicos y humanos',
          'Garantizar disponibilidad del personal responsable'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'cargoResponsable', tipo: 'select', opciones: ['Gerente', 'Coordinador SST', 'Jefe de Talento Humano', 'Responsable SST', 'Profesional SST'] },
      { campo: 'nivelFormacion', tipo: 'select', opciones: ['Técnico', 'Tecnólogo', 'Profesional', 'Especialista', 'Curso 50 horas'] },
      { campo: 'licenciaSst', tipo: 'texto', valorSugerido: 'Licencia vigente en Seguridad y Salud en el Trabajo' },
      { campo: 'horasCapacitacion', tipo: 'numero', valorSugerido: '50' }
    ],
    plantillas: [
      {
        id: 'responsable-pyme',
        nombre: 'Responsable SST - PYME (< 10 trabajadores)',
        descripcion: 'Designación para empresas pequeñas según Art. 3 Res. 0312/2019',
        campos: {
          tipoEmpresa: 'Menos de 10 trabajadores',
          requisitosMinimos: 'Curso de 50 horas en SST',
          dedicacion: 'Parcial, compatible con otras funciones',
          normativaBase: 'Resolución 0312/2019, Art. 3'
        },
        normativaBase: 'RES-0312-ART-3'
      },
      {
        id: 'responsable-mediana',
        nombre: 'Responsable SST - Empresa Mediana (11-50 trabajadores)',
        descripcion: 'Designación para empresas medianas según Art. 9 Res. 0312/2019',
        campos: {
          tipoEmpresa: 'Entre 11 y 50 trabajadores',
          requisitosMinimos: 'Técnico o Tecnólogo en SST con curso 50 horas',
          dedicacion: 'Dedicación exclusiva o compartida según nivel de riesgo',
          normativaBase: 'Resolución 0312/2019, Art. 9'
        },
        normativaBase: 'RES-0312-ART-9'
      },
      {
        id: 'responsable-grande',
        nombre: 'Responsable SST - Empresa Grande (> 50 trabajadores)',
        descripcion: 'Designación para empresas grandes según Art. 16 Res. 0312/2019',
        campos: {
          tipoEmpresa: 'Más de 50 trabajadores',
          requisitosMinimos: 'Profesional con licencia vigente en SST',
          dedicacion: 'Dedicación exclusiva según nivel de riesgo',
          normativaBase: 'Resolución 0312/2019, Art. 16'
        },
        normativaBase: 'RES-0312-ART-16'
      }
    ]
  },
  // 1.1.2 - Asignación de responsabilidades
  {
    codigo: '1.1.2',
    nombre: 'Asignación de responsabilidades en SST',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.8',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.8',
        descripcion: 'Obligaciones de los empleadores',
        requisitos: [
          'Definir responsabilidades en todos los niveles',
          'Comunicar las responsabilidades a todo el personal',
          'Documentar las responsabilidades asignadas'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'nivel', tipo: 'select', opciones: ['Alta Dirección', 'Mandos Medios', 'Trabajadores'] },
      { campo: 'responsabilidades', tipo: 'textarea' }
    ]
  },
  // 1.1.3 - Asignación de recursos
  {
    codigo: '1.1.3',
    nombre: 'Asignación de recursos para el SG-SST',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.8-4',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.8, numeral 4',
        descripcion: 'Definición de recursos',
        requisitos: [
          'Recursos financieros para SST',
          'Recursos técnicos (equipos, herramientas)',
          'Recursos humanos capacitados',
          'Recursos físicos (instalaciones)'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoRecurso', tipo: 'select', opciones: ['Humano', 'Financiero', 'Técnico', 'Físico'] },
      { campo: 'descripcion', tipo: 'textarea' },
      { campo: 'presupuesto', tipo: 'numero' }
    ],
    plantillas: [
      {
        id: 'recurso-humano',
        nombre: 'Asignación de Recurso Humano SST',
        descripcion: 'Personal designado para SST',
        campos: {
          tipo: 'Humano',
          categorias: ['Responsable SST', 'Brigadistas', 'COPASST', 'Vigía SST', 'Comité Convivencia'],
          requisitos: 'Personal capacitado con funciones específicas en SST'
        },
        normativaBase: 'DEC-1072-2.2.4.6.8'
      },
      {
        id: 'recurso-financiero',
        nombre: 'Asignación de Recurso Financiero SST',
        descripcion: 'Presupuesto para SST',
        campos: {
          tipo: 'Financiero',
          rubros: ['Capacitación', 'EPP', 'Señalización', 'Exámenes médicos', 'Equipos de emergencia', 'Auditorías', 'Mantenimiento'],
          requisitos: 'Presupuesto anual definido y aprobado por la alta dirección'
        },
        normativaBase: 'DEC-1072-2.2.4.6.8'
      },
      {
        id: 'recurso-tecnico',
        nombre: 'Asignación de Recurso Técnico SST',
        descripcion: 'Equipos y herramientas para SST',
        campos: {
          tipo: 'Técnico',
          categorias: ['Equipos de medición', 'Software SST', 'Equipos de emergencia', 'Señalización', 'EPP'],
          requisitos: 'Equipos certificados y calibrados según normativa aplicable'
        },
        normativaBase: 'DEC-1072-2.2.4.6.8'
      }
    ]
  },
  // 1.1.4 - Afiliación al Sistema de Seguridad Social
  {
    codigo: '1.1.4',
    nombre: 'Afiliación al Sistema de Seguridad Social Integral',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'LEY-100-1993',
        norma: 'Ley 100 de 1993',
        descripcion: 'Sistema de Seguridad Social Integral',
        requisitos: [
          'Afiliación a EPS (Salud)',
          'Afiliación a ARL (Riesgos Laborales)',
          'Afiliación a AFP (Pensiones)',
          'Afiliación a Caja de Compensación Familiar'
        ],
        obligatorio: true
      },
      {
        codigo: 'DEC-1295-1994',
        norma: 'Decreto Ley 1295 de 1994',
        descripcion: 'Sistema General de Riesgos Profesionales',
        requisitos: [
          'Afiliación de todos los trabajadores dependientes',
          'Pago oportuno de aportes',
          'Reportes de novedades'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'eps', tipo: 'select', opciones: ['Sura', 'Sanitas', 'Nueva EPS', 'Compensar', 'Famisanar', 'Coomeva', 'Salud Total', 'Medimás', 'Otra'] },
      { campo: 'arl', tipo: 'select', opciones: ['Sura', 'Positiva', 'Colmena', 'Bolívar', 'Liberty', 'Equidad', 'Mapfre', 'Otra'] },
      { campo: 'afp', tipo: 'select', opciones: ['Porvenir', 'Protección', 'Colfondos', 'Old Mutual', 'Colpensiones'] },
      { campo: 'ccf', tipo: 'select', opciones: ['Compensar', 'Cafam', 'Colsubsidio', 'Comfama', 'Comfandi', 'Otra'] },
      { campo: 'claseRiesgo', tipo: 'select', opciones: ['Clase I (0.522%)', 'Clase II (1.044%)', 'Clase III (2.436%)', 'Clase IV (4.350%)', 'Clase V (6.960%)'] }
    ]
  },
  // 1.1.5 - Identificación de trabajadores de alto riesgo y pensión especial
  {
    codigo: '1.1.5',
    nombre: 'Identificación de trabajadores que se dediquen en forma permanente a actividades de alto riesgo y cotización de pensión especial',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'DEC-2090-2003',
        norma: 'Decreto 2090 de 2003',
        descripcion: 'Actividades de alto riesgo para pensión especial',
        requisitos: [
          'Identificar actividades de alto riesgo según decreto',
          'Pensión especial por alto riesgo',
          'Controles específicos para estas actividades'
        ],
        obligatorio: true
      },
      {
        codigo: 'DEC-1072-2.2.4.6.15',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.15',
        descripcion: 'Identificación de peligros y valoración de riesgos',
        requisitos: [
          'Identificar peligros en todas las actividades',
          'Evaluar riesgos asociados',
          'Priorizar controles según nivel de riesgo'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'actividadAltoRiesgo', tipo: 'select', opciones: [
        'Minería subterránea',
        'Trabajo en alturas',
        'Trabajo con radiaciones ionizantes',
        'Exposición a altas temperaturas',
        'Exposición a sustancias comprobadamente cancerígenas',
        'Trabajo en espacios confinados',
        'Vigilancia y seguridad privada',
        'Actividades de bomberos'
      ]},
      { campo: 'medidasControl', tipo: 'textarea' },
      { campo: 'vigilanciaEpidemiologica', tipo: 'texto' }
    ]
  },
  // 1.1.6 - Conformación COPASST / Vigía
  {
    codigo: '1.1.6',
    nombre: 'Conformación y funcionamiento del COPASST/Vigía',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'RES-2013-1986',
        norma: 'Resolución 2013 de 1986',
        descripcion: 'Organización y funcionamiento de los Comités de Medicina, Higiene y Seguridad Industrial',
        requisitos: [
          'Conformación paritaria (igual número de representantes)',
          'Elección de representantes de trabajadores',
          'Reuniones mensuales mínimo',
          'Actas de reuniones'
        ],
        obligatorio: true
      },
      {
        codigo: 'DEC-1072-2.2.4.6.8-9',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.8, numeral 9',
        descripcion: 'Garantizar participación de trabajadores',
        requisitos: [
          'Funcionamiento del COPASST',
          'Vigía de SST para empresas menores a 10 trabajadores'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoComite', tipo: 'select', opciones: ['COPASST (≥10 trabajadores)', 'Vigía SST (<10 trabajadores)'] },
      { campo: 'periodoVigencia', tipo: 'select', opciones: ['2 años'] },
      { campo: 'representantesEmpleador', tipo: 'numero' },
      { campo: 'representantesTrabajadores', tipo: 'numero' }
    ],
    plantillas: [
      {
        id: 'acta-constitucion-copasst',
        nombre: 'Acta de Constitución COPASST',
        descripcion: 'Modelo de acta para conformación del COPASST',
        campos: {
          titulo: 'ACTA DE CONSTITUCIÓN DEL COMITÉ PARITARIO DE SEGURIDAD Y SALUD EN EL TRABAJO',
          contenido: `En las instalaciones de [NOMBRE_EMPRESA], ubicada en [CIUDAD], a los [DÍA] días del mes de [MES] de [AÑO], siendo las [HORA], se reunieron los trabajadores con el fin de elegir los representantes al Comité Paritario de Seguridad y Salud en el Trabajo (COPASST), de conformidad con lo establecido en la Resolución 2013 de 1986 y el Decreto 1072 de 2015.

RESULTADOS DE LA ELECCIÓN:

REPRESENTANTES DEL EMPLEADOR:
Principal: [NOMBRE] - [CARGO]
Suplente: [NOMBRE] - [CARGO]

REPRESENTANTES DE LOS TRABAJADORES:
Principal: [NOMBRE] - [CARGO] (Votos: X)
Suplente: [NOMBRE] - [CARGO] (Votos: X)

Se designa como Presidente del Comité a: [NOMBRE]
Se designa como Secretario del Comité a: [NOMBRE]

El período de vigencia del comité será de DOS (2) años, a partir de la fecha de constitución.

COMPROMISOS:
1. Reunirse mínimo una vez al mes
2. Llevar libro de actas de las reuniones
3. Participar activamente en actividades de prevención
4. Promover el cumplimiento del SG-SST`
        },
        normativaBase: 'RES-2013-1986'
      },
      {
        id: 'acta-reunion-copasst',
        nombre: 'Acta de Reunión Mensual COPASST',
        descripcion: 'Modelo de acta para reuniones ordinarias',
        campos: {
          titulo: 'ACTA DE REUNIÓN ORDINARIA COPASST',
          ordenDia: [
            '1. Verificación de quórum',
            '2. Lectura y aprobación del acta anterior',
            '3. Revisión de compromisos pendientes',
            '4. Análisis de accidentes e incidentes del período',
            '5. Revisión de inspecciones realizadas',
            '6. Análisis de condiciones y actos inseguros reportados',
            '7. Revisión del avance del Plan de Trabajo SST',
            '8. Nuevos compromisos y próxima reunión'
          ]
        },
        normativaBase: 'RES-2013-1986'
      }
    ]
  },
  // 1.1.7 - Capacitación COPASST/Vigía
  {
    codigo: '1.1.7',
    nombre: 'Capacitación de integrantes del COPASST/Vigía',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'RES-0312-ART-16-1.1.7',
        norma: 'Resolución 0312/2019',
        articulo: 'Estándar 1.1.7',
        descripcion: 'Capacitación del COPASST o Vigía SST',
        requisitos: [
          'Capacitación de 20 horas mínimo para integrantes',
          'Temas: identificación de peligros, investigación de accidentes, inspecciones',
          'Formación antes de iniciar funciones'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'horasCapacitacion', tipo: 'numero', valorSugerido: '20' },
      { campo: 'tematicas', tipo: 'textarea', valorSugerido: 'Identificación de peligros y riesgos, Investigación de accidentes, Inspecciones de seguridad, Normatividad SST' }
    ]
  },
  // 1.1.8 - Comité de Convivencia Laboral
  {
    codigo: '1.1.8',
    nombre: 'Conformación y funcionamiento del Comité de Convivencia Laboral',
    ciclo: 'planear',
    categoria: 'recursos',
    puntaje: 0.5,
    normativaAplicable: [
      {
        codigo: 'RES-3461-2025',
        norma: 'Resolución 3461 de 2025',
        descripcion: 'Nueva normativa integral para Comités de Convivencia Laboral (deroga Res. 652 y 1356 de 2012)',
        requisitos: [
          'Conformación según tamaño: <5 trab: 1+1 sin suplentes; 5-19 trab: 1+1 con suplentes; 20+ trab: 2+2 con suplentes',
          'Reuniones trimestrales mínimo con informes de gestión',
          'Período de vigencia de 2 años (reelección posible por una sola vez)',
          'Plazo máximo de resolución de quejas: 65 días calendario',
          'Paridad de género en la conformación',
          'Capacitación obligatoria de integrantes',
          'Exclusión de casos de acoso sexual (tratamiento especializado Ley 2365/2024)'
        ],
        obligatorio: true
      },
      {
        codigo: 'LEY-1010-2006',
        norma: 'Ley 1010 de 2006',
        descripcion: 'Ley de Prevención y Sanción del Acoso Laboral',
        requisitos: [
          'Prevención del acoso laboral',
          'Mecanismos de protección al trabajador',
          'Procedimientos internos de conciliación'
        ],
        obligatorio: true
      },
      {
        codigo: 'LEY-2209-2022',
        norma: 'Ley 2209 de 2022',
        descripcion: 'Ampliación del término de caducidad de las acciones derivadas del acoso laboral',
        requisitos: [
          'Caducidad de 3 años para acciones por acoso laboral',
          'Protección extendida para víctimas'
        ],
        obligatorio: true
      },
      {
        codigo: 'CONVENIO-190-OIT',
        norma: 'Convenio 190 OIT (2019)',
        descripcion: 'Convenio sobre la violencia y el acoso en el mundo del trabajo',
        requisitos: [
          'Derecho a un mundo del trabajo libre de violencia y acoso',
          'Ámbito ampliado: incluye trabajadores, contratistas, aprendices, voluntarios'
        ],
        obligatorio: false
      }
    ],
    camposSugeridos: [
      { campo: 'periodoVigencia', tipo: 'select', opciones: ['2 años'] },
      { campo: 'integrantes', tipo: 'numero', valorSugerido: '4' },
      { campo: 'frecuenciaReuniones', tipo: 'select', opciones: ['Trimestral', 'Según necesidad'] }
    ],
    plantillas: [
      {
        id: 'acta-constitucion-ccl',
        nombre: 'Acta de Constitución Comité de Convivencia',
        descripcion: 'Modelo de acta para conformación del Comité de Convivencia Laboral según Resolución 3461/2025',
        campos: {
          titulo: 'ACTA DE CONSTITUCIÓN DEL COMITÉ DE CONVIVENCIA LABORAL',
          contenido: `En cumplimiento de la Resolución 3461 de 2025 del Ministerio del Trabajo, y en desarrollo de la Ley 1010 de 2006 sobre Acoso Laboral, se procede a conformar el Comité de Convivencia Laboral de [NOMBRE_EMPRESA].

CONFORMACIÓN SEGÚN TAMAÑO DE EMPRESA:
- Menos de 5 trabajadores: 1 representante empleador + 1 trabajador (sin suplentes)
- De 5 a 19 trabajadores: 1 representante empleador + 1 trabajador (con suplentes)
- 20 o más trabajadores: 2 representantes empleador + 2 trabajadores (con suplentes)

REPRESENTANTES DEL EMPLEADOR:
Principal: [NOMBRE] - [CARGO]
Suplente: [NOMBRE] - [CARGO]

REPRESENTANTES DE LOS TRABAJADORES (elegidos por voto secreto):
Principal: [NOMBRE] - [CARGO]
Suplente: [NOMBRE] - [CARGO]

FUNCIONES DEL COMITÉ (Art. Res. 3461/2025):
1. Recibir y tramitar quejas de acoso laboral con pruebas
2. Examinar casos de manera confidencial
3. Escuchar a las partes involucradas individualmente
4. Promover espacios de diálogo y mediación
5. Formular planes de mejora concertados (5-10 días calendario)
6. Hacer seguimiento mensual a compromisos
7. Comunicar casos sin acuerdo a alta dirección
8. Elaborar informes trimestrales y anuales con estadísticas

EXCLUSIONES: El Comité NO es competente para casos de acoso sexual o violencia de género (Ley 2365/2024).

Período de vigencia: 2 años (reelección posible por una sola vez)
Plazo máximo de resolución: 65 días calendario desde recepción de queja`
        },
        normativaBase: 'RES-3461-2025'
      }
    ]
  },
  // 1.2.1 - Programa de capacitación anual
  {
    codigo: '1.2.1',
    nombre: 'Programa de capacitación anual en SST',
    ciclo: 'planear',
    categoria: 'capacitacion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.11',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.11',
        descripcion: 'Capacitación en SST',
        requisitos: [
          'Definir requisitos de conocimiento en SST',
          'Programa de capacitación y entrenamiento',
          'Incluir inducción y reinducción',
          'Documentar y mantener registros'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tema', tipo: 'select', opciones: [
        'Política y objetivos del SG-SST',
        'Identificación de peligros y control de riesgos',
        'Prevención de accidentes de trabajo',
        'Prevención de enfermedades laborales',
        'Uso de elementos de protección personal',
        'Primeros auxilios',
        'Prevención y control de incendios',
        'Evacuación y emergencias',
        'Trabajo seguro en alturas',
        'Riesgo eléctrico',
        'Manejo seguro de sustancias químicas',
        'Ergonomía y pausas activas',
        'Riesgo psicosocial',
        'Prevención del acoso laboral'
      ]},
      { campo: 'duracion', tipo: 'numero' },
      { campo: 'modalidad', tipo: 'select', opciones: ['Presencial', 'Virtual', 'Mixta'] },
      { campo: 'dirigidoA', tipo: 'select', opciones: ['Todos los trabajadores', 'Personal operativo', 'Personal administrativo', 'Brigadistas', 'COPASST', 'Alta dirección'] }
    ]
  },
  // 1.2.2 - Inducción y reinducción
  {
    codigo: '1.2.2',
    nombre: 'Inducción y reinducción en SST',
    ciclo: 'planear',
    categoria: 'capacitacion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.11',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.11, Parágrafo 2',
        descripcion: 'Capacitación en SST - Inducción y Reinducción',
        requisitos: [
          'Inducción previa al inicio de labores para todo trabajador nuevo',
          'Aplica a trabajadores dependientes, cooperados, en misión, contratistas y proveedores',
          'Reinducción mínimo anual (puede ser más frecuente)',
          'Contenido: identificación de peligros, control de riesgos, prevención de AT y EL',
          'Incluir aspectos generales y específicos de las actividades a realizar'
        ],
        obligatorio: true
      },
      {
        codigo: 'RES-0312-2019-ART16',
        norma: 'Resolución 0312/2019',
        articulo: 'Artículo 16, numeral 1.2.2',
        descripcion: 'Estándar mínimo de inducción y reinducción',
        requisitos: [
          'Verificación documental de la inducción y reinducción',
          'Muestreo: 51-200 trabajadores = verificar 10%',
          'Muestreo: 201+ trabajadores = verificar 30 soportes',
          'Referencia al programa de capacitación y su cumplimiento'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoInduccion', tipo: 'select', opciones: ['Inducción inicial', 'Reinducción anual', 'Reinducción por cambio de cargo', 'Reinducción por cambio de proceso'] },
      { campo: 'temasObligatorios', tipo: 'textarea', valorSugerido: `1. Generalidades de la empresa
2. Política de SST
3. Objetivos del SG-SST
4. Peligros y riesgos del cargo
5. Medidas de prevención y control
6. Uso de EPP
7. Reporte de condiciones y actos inseguros
8. Procedimiento de emergencias
9. Derechos y deberes en SST` }
    ]
  },
  // 1.2.3 - Curso virtual 50 horas
  {
    codigo: '1.2.3',
    nombre: 'Curso virtual de capacitación de 50 horas en SST',
    ciclo: 'planear',
    categoria: 'capacitacion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'RES-4927-2016',
        norma: 'Resolución 4927 de 2016',
        descripcion: 'Parámetros y requisitos del curso de capacitación virtual de 50 horas',
        requisitos: [
          'Obligatorio para responsables del SG-SST',
          'Curso certificado por el SENA o instituciones autorizadas',
          'Contenido según plan de estudios establecido',
          'Evaluación final aprobada'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'institucion', tipo: 'select', opciones: ['SENA', 'ARL (programa propio)', 'Institución autorizada'] },
      { campo: 'fechaCertificacion', tipo: 'fecha' },
      { campo: 'numeroCertificado', tipo: 'texto' }
    ],
    plantillas: [
      {
        id: 'curso-50h-temario',
        nombre: 'Temario Curso 50 Horas SST',
        descripcion: 'Contenido oficial del curso según Resolución 4927/2016',
        campos: {
          modulos: [
            'Módulo 1: Normatividad del SG-SST (10 horas)',
            'Módulo 2: Marco conceptual del SG-SST (8 horas)',
            'Módulo 3: Planificación del SG-SST (10 horas)',
            'Módulo 4: Aplicación del SG-SST (10 horas)',
            'Módulo 5: Verificación del SG-SST (6 horas)',
            'Módulo 6: Mejora del SG-SST (6 horas)'
          ],
          duracionTotal: '50 horas'
        },
        normativaBase: 'RES-4927-2016'
      }
    ]
  }
];

// =====================================================
// ESTÁNDARES CAPÍTULO 2: GESTIÓN INTEGRAL
// =====================================================

export const ESTANDARES_GESTION: EstandarSst[] = [
  // 2.1.1 - Política de SST
  {
    codigo: '2.1.1',
    nombre: 'Política del SG-SST firmada, fechada y comunicada',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 1,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.5',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.5',
        descripcion: 'Política de SST',
        requisitos: [
          'Escrita y firmada por el empleador',
          'Específica y apropiada para la empresa',
          'Compromiso con mejora continua',
          'Cumplimiento de requisitos legales',
          'Comunicada a todos los trabajadores'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'declaracionCompromiso', tipo: 'textarea' },
      { campo: 'objetivosPolitica', tipo: 'textarea' },
      { campo: 'alcance', tipo: 'textarea' },
      { campo: 'responsabilidades', tipo: 'textarea' }
    ]
  },
  // 2.2.1 - Objetivos del SG-SST
  {
    codigo: '2.2.1',
    nombre: 'Objetivos del SG-SST medibles y cuantificables',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 1,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.18',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.18',
        descripcion: 'Objetivos del SG-SST',
        requisitos: [
          'Claros, medibles, cuantificables',
          'Con metas definidas',
          'Documentados y comunicados',
          'Revisados periódicamente'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'objetivo', tipo: 'textarea' },
      { campo: 'indicador', tipo: 'texto' },
      { campo: 'meta', tipo: 'texto' },
      { campo: 'responsable', tipo: 'texto' },
      { campo: 'fechaCumplimiento', tipo: 'fecha' }
    ]
  },
  // 2.3.1 - Evaluación inicial del SG-SST
  {
    codigo: '2.3.1',
    nombre: 'Evaluación inicial del SG-SST',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 1,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.16',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.16',
        descripcion: 'Evaluación inicial del SG-SST',
        requisitos: [
          'Estado actual del SG-SST',
          'Identificación de normatividad aplicable',
          'Verificación de identificación de peligros',
          'Amenazas y evaluación de vulnerabilidad',
          'Evaluación de indicadores'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'aspectoEvaluado', tipo: 'select', opciones: [
        'Normatividad vigente aplicable',
        'Identificación de peligros y valoración de riesgos',
        'Amenazas y vulnerabilidad',
        'Eficacia de medidas de control',
        'Accidentalidad y enfermedad laboral',
        'Programas de vigilancia epidemiológica',
        'Auditorías internas'
      ]},
      { campo: 'calificacion', tipo: 'select', opciones: ['Cumple', 'Cumple parcialmente', 'No cumple', 'No aplica'] },
      { campo: 'hallazgo', tipo: 'textarea' },
      { campo: 'planMejora', tipo: 'textarea' }
    ],
    plantillas: [
      {
        id: 'evaluacion-inicial-sgsst',
        nombre: 'Evaluación Inicial del SG-SST',
        descripcion: 'Plantilla para evaluación inicial según Decreto 1072/2015, Art. 2.2.4.6.16',
        campos: {
          titulo: 'EVALUACIÓN INICIAL DEL SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO',
          baseNormativa: 'Decreto 1072 de 2015, Artículo 2.2.4.6.16',
          aspectosAEvaluar: [
            '1. La identificación de la normatividad vigente en materia de riesgos laborales',
            '2. La verificación de la identificación de peligros, evaluación y valoración de los riesgos',
            '3. La identificación de las amenazas y evaluación de la vulnerabilidad',
            '4. La evaluación de la efectividad de las medidas implementadas',
            '5. El cumplimiento del programa de capacitación anual',
            '6. La evaluación de los puestos de trabajo',
            '7. La descripción sociodemográfica de los trabajadores',
            '8. El análisis de accidentalidad y enfermedad laboral'
          ],
          contenido: `EVALUACIÓN INICIAL DEL SG-SST

Según el Artículo 2.2.4.6.16 del Decreto 1072 de 2015, la evaluación inicial debe incluir:

ASPECTOS A EVALUAR:

1. NORMATIVIDAD VIGENTE
   - Identificación de requisitos legales aplicables
   - Matriz de requisitos legales actualizada
   - Cumplimiento de normas SST

2. IDENTIFICACIÓN DE PELIGROS Y VALORACIÓN DE RIESGOS
   - Matriz de identificación de peligros
   - Evaluación y valoración de riesgos
   - Medidas de control implementadas

3. AMENAZAS Y VULNERABILIDAD
   - Identificación de amenazas internas y externas
   - Análisis de vulnerabilidad
   - Plan de preparación y respuesta ante emergencias

4. MEDIDAS DE CONTROL
   - Evaluación de la efectividad de controles
   - Jerarquía de controles aplicada
   - Seguimiento a medidas implementadas

5. PROGRAMA DE CAPACITACIÓN
   - Cumplimiento del programa anual
   - Registros de capacitación
   - Evaluación de efectividad

6. PUESTOS DE TRABAJO
   - Evaluación de condiciones de trabajo
   - Análisis ergonómico
   - Condiciones ambientales

7. PERFIL SOCIODEMOGRÁFICO
   - Descripción de la población trabajadora
   - Caracterización por edad, género, cargo
   - Condiciones de salud

8. ACCIDENTALIDAD Y ENFERMEDAD LABORAL
   - Estadísticas de accidentes de trabajo
   - Enfermedades laborales identificadas
   - Indicadores de gestión SST`,
          requisitosMinimos: 'Debe realizarse al menos una vez al año y cuando se presenten cambios significativos en la organización'
        },
        normativaBase: 'DEC-1072-2.2.4.6.16'
      }
    ]
  },
  // 2.4.1 - Plan de trabajo anual
  {
    codigo: '2.4.1',
    nombre: 'Plan de trabajo anual del SG-SST',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.17',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.17',
        descripcion: 'Planificación del SG-SST',
        requisitos: [
          'Metas, responsabilidades, recursos y cronograma',
          'Firmado por empleador y responsable del SG-SST',
          'Alcanzable según tamaño y naturaleza de la empresa'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'actividad', tipo: 'textarea' },
      { campo: 'objetivo', tipo: 'textarea' },
      { campo: 'responsable', tipo: 'texto' },
      { campo: 'recursos', tipo: 'textarea' },
      { campo: 'fechaInicio', tipo: 'fecha' },
      { campo: 'fechaFin', tipo: 'fecha' },
      { campo: 'indicadorCumplimiento', tipo: 'texto' }
    ]
  },
  // 2.5.1 - Conservación de documentos
  {
    codigo: '2.5.1',
    nombre: 'Archivo y conservación de documentos',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.13',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.13',
        descripcion: 'Conservación de documentos',
        requisitos: [
          'Mantener documentos legibles, protegidos y accesibles',
          'Conservación mínima de 20 años',
          'Historiales médicos con confidencialidad',
          'Control de documentos obsoletos'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoDocumento', tipo: 'select', opciones: [
        'Política SST',
        'Matriz de peligros y riesgos',
        'Plan de trabajo anual',
        'Programa de capacitación',
        'Procedimientos',
        'Registros de inspecciones',
        'Investigaciones de accidentes',
        'Historiales médicos ocupacionales',
        'Actas COPASST',
        'Actas Comité Convivencia'
      ]},
      { campo: 'tiempoConservacion', tipo: 'select', opciones: ['20 años', '30 años', 'Permanente'] },
      { campo: 'ubicacion', tipo: 'texto' },
      { campo: 'responsableCustodia', tipo: 'texto' }
    ]
  },
  // 2.7.1 - Matriz legal
  {
    codigo: '2.7.1',
    nombre: 'Matriz legal actualizada',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.8-6',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.8, numeral 6',
        descripcion: 'Cumplimiento de requisitos legales',
        requisitos: [
          'Identificar normatividad aplicable',
          'Mantener actualizada la matriz',
          'Verificar cumplimiento de requisitos',
          'Comunicar cambios normativos'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoNorma', tipo: 'select', opciones: ['Ley', 'Decreto', 'Resolución', 'Circular', 'Norma técnica'] },
      { campo: 'numeroNorma', tipo: 'texto' },
      { campo: 'año', tipo: 'numero' },
      { campo: 'entidadEmisora', tipo: 'select', opciones: ['Congreso de la República', 'Ministerio del Trabajo', 'Ministerio de Salud', 'ICONTEC', 'Presidencia de la República'] },
      { campo: 'tema', tipo: 'textarea' },
      { campo: 'aplicabilidad', tipo: 'textarea' },
      { campo: 'cumplimiento', tipo: 'select', opciones: ['Cumple', 'En proceso', 'No cumple', 'No aplica'] }
    ]
  },
  // 2.8.1 - Comunicación en SST
  {
    codigo: '2.8.1',
    nombre: 'Mecanismos de comunicación interna y externa',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 1,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.14',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.14',
        descripcion: 'Comunicación en SST',
        requisitos: [
          'Recibir, documentar y responder comunicaciones',
          'Comunicación interna entre niveles',
          'Comunicación externa con partes interesadas',
          'Canales efectivos de comunicación'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoComunicacion', tipo: 'select', opciones: ['Interna', 'Externa'] },
      { campo: 'canal', tipo: 'select', opciones: ['Carteleras', 'Correo electrónico', 'Reuniones', 'Capacitaciones', 'Intranet', 'Boletines', 'Folletos', 'Señalización'] },
      { campo: 'destinatarios', tipo: 'select', opciones: ['Todos los trabajadores', 'Alta dirección', 'COPASST', 'Contratistas', 'Visitantes', 'ARL', 'Entes de control'] }
    ]
  },
  // 2.9.1 - Adquisiciones
  {
    codigo: '2.9.1',
    nombre: 'Procedimiento de adquisiciones con criterios SST',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 1,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.27',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.27',
        descripcion: 'Adquisiciones',
        requisitos: [
          'Procedimiento para adquisición de bienes y servicios',
          'Inclusión de requisitos de SST',
          'Verificación de cumplimiento de especificaciones',
          'Identificar aspectos de SST en productos y servicios'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoAdquisicion', tipo: 'select', opciones: ['Equipos de protección personal', 'Maquinaria y equipos', 'Sustancias químicas', 'Servicios', 'Materiales'] },
      { campo: 'criteriosSST', tipo: 'textarea', valorSugerido: `1. Fichas técnicas y hojas de seguridad
2. Certificaciones de calidad
3. Cumplimiento normativo
4. Capacitación en uso seguro
5. Mantenimiento y garantías` }
    ]
  },
  // 2.10.1 - Contratación (Evaluación de proveedores)
  {
    codigo: '2.10.1',
    nombre: 'Evaluación y selección de proveedores y contratistas',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 2,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.28',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.28',
        descripcion: 'Contratación',
        requisitos: [
          'Procedimiento para contratación de personal',
          'Incluir criterios de SST en selección',
          'Verificar afiliación y pagos de seguridad social',
          'Verificar competencias SST de contratistas'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoContratista', tipo: 'select', opciones: ['Servicios generales', 'Mantenimiento', 'Obra civil', 'Transporte', 'Servicios especializados', 'Consultores'] },
      { campo: 'criteriosEvaluacion', tipo: 'textarea', valorSugerido: `1. Afiliación a seguridad social (EPS, ARL, AFP)
2. Certificado de aptitud médica ocupacional
3. Capacitación en SST
4. Dotación y EPP apropiados
5. Procedimientos de trabajo seguro
6. Certificaciones específicas (trabajo en alturas, etc.)` },
      { campo: 'calificacion', tipo: 'select', opciones: ['Excelente', 'Bueno', 'Regular', 'Deficiente'] }
    ]
  },
  // 2.11.1 - Gestión del cambio
  {
    codigo: '2.11.1',
    nombre: 'Gestión del cambio',
    ciclo: 'planear',
    categoria: 'gestion',
    puntaje: 1,
    normativaAplicable: [
      {
        codigo: 'DEC-1072-2.2.4.6.26',
        norma: 'Decreto 1072/2015',
        articulo: 'Artículo 2.2.4.6.26',
        descripcion: 'Gestión del cambio',
        requisitos: [
          'Procedimiento para evaluar impacto de cambios',
          'Identificar peligros asociados a cambios',
          'Implementar controles antes de introducir cambios',
          'Documentar y comunicar los cambios'
        ],
        obligatorio: true
      }
    ],
    camposSugeridos: [
      { campo: 'tipoCambio', tipo: 'select', opciones: [
        'Cambio en procesos',
        'Cambio en equipos',
        'Cambio en instalaciones',
        'Cambio en materias primas',
        'Cambio organizacional',
        'Cambio en métodos de trabajo',
        'Cambio normativo'
      ]},
      { campo: 'descripcionCambio', tipo: 'textarea' },
      { campo: 'riesgosIdentificados', tipo: 'textarea' },
      { campo: 'controlesNecesarios', tipo: 'textarea' },
      { campo: 'responsable', tipo: 'texto' },
      { campo: 'fechaImplementacion', tipo: 'fecha' }
    ]
  }
];

// =====================================================
// ACTIVIDADES OBLIGATORIAS PLAN DE TRABAJO ANUAL
// =====================================================

export const ACTIVIDADES_PLAN_ANUAL: {
  mes: number;
  actividad: string;
  estandar: string;
  frecuencia: string;
  responsable: string;
}[] = [
  // Actividades mensuales
  { mes: 0, actividad: 'Reunión ordinaria COPASST/Vigía SST', estandar: '1.1.6', frecuencia: 'Mensual', responsable: 'COPASST/Vigía' },
  { mes: 0, actividad: 'Inspecciones de seguridad', estandar: '3.1.3', frecuencia: 'Mensual', responsable: 'Responsable SST' },
  { mes: 0, actividad: 'Reporte de accidentes e incidentes', estandar: '3.2.1', frecuencia: 'Mensual', responsable: 'Responsable SST' },
  // Actividades trimestrales
  { mes: 1, actividad: 'Reunión Comité de Convivencia Laboral', estandar: '1.1.8', frecuencia: 'Trimestral', responsable: 'Comité Convivencia' },
  { mes: 1, actividad: 'Seguimiento a indicadores SST', estandar: '2.2.1', frecuencia: 'Trimestral', responsable: 'Responsable SST' },
  // Actividades semestrales
  { mes: 1, actividad: 'Capacitación en prevención de riesgos', estandar: '1.2.1', frecuencia: 'Semestral', responsable: 'Responsable SST' },
  { mes: 7, actividad: 'Simulacro de evacuación', estandar: '3.1.6', frecuencia: 'Semestral', responsable: 'Brigada de Emergencias' },
  // Actividades anuales
  { mes: 1, actividad: 'Evaluación de estándares mínimos (autoevaluación)', estandar: '4.1.1', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 2, actividad: 'Actualización matriz de peligros y riesgos (IPERC)', estandar: '3.1.1', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 2, actividad: 'Exámenes médicos ocupacionales periódicos', estandar: '3.1.7', frecuencia: 'Anual', responsable: 'Medicina del Trabajo' },
  { mes: 3, actividad: 'Reinducción en SST', estandar: '1.2.2', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 4, actividad: 'Actualización plan de emergencias', estandar: '3.1.6', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 5, actividad: 'Auditoría interna del SG-SST', estandar: '4.1.3', frecuencia: 'Anual', responsable: 'Auditor Interno' },
  { mes: 6, actividad: 'Semana de la Salud Ocupacional', estandar: '1.2.1', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 8, actividad: 'Actualización matriz legal', estandar: '2.7.1', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 9, actividad: 'Rendición de cuentas SST', estandar: '2.6.1', frecuencia: 'Anual', responsable: 'Alta Dirección' },
  { mes: 10, actividad: 'Elaboración plan de trabajo año siguiente', estandar: '2.4.1', frecuencia: 'Anual', responsable: 'Responsable SST' },
  { mes: 11, actividad: 'Revisión por la alta dirección', estandar: '4.2.1', frecuencia: 'Anual', responsable: 'Alta Dirección' }
];

// =====================================================
// RESPONSABILIDADES POR NIVEL ORGANIZACIONAL
// =====================================================

export const RESPONSABILIDADES_SST: Record<string, string[]> = {
  'Alta Dirección': [
    'Definir, firmar y divulgar la política de SST a través de documento escrito.',
    'Asignar, documentar y comunicar las responsabilidades específicas en SST a todos los niveles de la organización.',
    'Rendir cuentas al interior de la empresa del desempeño del SG-SST.',
    'Definir y asignar los recursos financieros, técnicos y el personal necesario para el diseño, implementación, revisión, evaluación y mejora del SG-SST.',
    'Garantizar la consulta y participación de los trabajadores en la identificación de peligros y control de riesgos.',
    'Garantizar que opera bajo el cumplimiento de la normatividad nacional vigente aplicable en materia de SST.',
    'Garantizar la supervisión de la seguridad y salud en el trabajo.',
    'Integrar los aspectos de SST al conjunto de sistemas de gestión, procesos, procedimientos y decisiones de la empresa.',
    'Revisar periódicamente el SG-SST para garantizar su efectividad y mejora continua.'
  ],
  'Responsable SST': [
    'Planificar, organizar, dirigir, desarrollar y aplicar el SG-SST y como mínimo una vez al año realizar su evaluación.',
    'Informar a la alta dirección sobre el funcionamiento y los resultados del SG-SST.',
    'Promover la participación de todos los miembros de la empresa en la implementación del SG-SST.',
    'Coordinar con los jefes de áreas, la elaboración y actualización de la matriz de peligros y valoración de riesgos.',
    'Validar o construir con los jefes de áreas, los planes de acción y hacer seguimiento a su cumplimiento.',
    'Promover la comprensión de la política en todos los niveles de la organización.',
    'Gestionar los recursos para cumplir con el plan de SST y hacer seguimiento a los indicadores.',
    'Coordinar las necesidades de capacitación en SST y hacer seguimiento a la misma.',
    'Apoyar la investigación de los accidentes e incidentes de trabajo.',
    'Participar de las reuniones del COPASST dando soporte.',
    'Implementar y hacer seguimiento a los sistemas de vigilancia epidemiológica, incluido el plan de salud ocupacional.'
  ],
  'Mandos Medios': [
    'Participar en la construcción y ejecución del plan de acción de su área.',
    'Participar en la investigación de accidentes e incidentes de trabajo ocurridos en su área.',
    'Participar en la construcción y actualización de la matriz de peligros y valoración de riesgos de su área.',
    'Garantizar que todos los trabajadores de su área conocen y cumplen las normas y procedimientos de trabajo seguro.',
    'Facilitar la asistencia de los trabajadores a las capacitaciones programadas.',
    'Reportar actos y condiciones inseguras detectadas en su área.',
    'Facilitar la inspección de los puestos de trabajo.',
    'Verificar que el personal a su cargo use los elementos de protección personal.',
    'Permitir la participación del personal en las actividades de SST.'
  ],
  'Trabajadores': [
    'Conocer y tener clara la política de SST.',
    'Procurar el cuidado integral de su salud.',
    'Suministrar información clara, completa y veraz sobre su estado de salud.',
    'Cumplir las normas de SST de la empresa.',
    'Informar oportunamente acerca de peligros y riesgos latentes en su sitio de trabajo.',
    'Participar en las actividades de capacitación en SST.',
    'Participar y contribuir al cumplimiento de los objetivos del SG-SST.',
    'Usar adecuadamente los elementos de protección personal y reportar su estado.',
    'Reportar inmediatamente todo accidente e incidente de trabajo.'
  ],
  'COPASST': [
    'Proponer actividades de capacitación en SST dirigidos a trabajadores, supervisores y directivos.',
    'Vigilar el desarrollo de las actividades que en SST debe realizar la empresa.',
    'Colaborar en el análisis de las causas de los accidentes de trabajo y enfermedades profesionales.',
    'Visitar periódicamente los lugares de trabajo e inspeccionar los ambientes, máquinas, equipos y las operaciones realizadas.',
    'Proponer la adopción de medidas y el desarrollo de actividades para controlar los riesgos.',
    'Estudiar y considerar las sugerencias presentadas por los trabajadores en materia de SST.',
    'Servir como organismo de coordinación entre empleador y trabajadores en la solución de problemas de SST.',
    'Elegir al secretario del Comité.'
  ],
  'Comité de Convivencia': [
    'Recibir y dar trámite a las quejas de acoso laboral presentadas.',
    'Examinar confidencial y reservadamente los casos de acoso laboral.',
    'Escuchar a las partes involucradas de manera individual sobre los hechos.',
    'Adelantar reuniones con el fin de crear un espacio de diálogo entre las partes.',
    'Formular un plan de mejora concertado entre las partes.',
    'Hacer seguimiento a los compromisos adquiridos por las partes.',
    'Presentar a la alta dirección las recomendaciones para el desarrollo efectivo de las medidas preventivas.',
    'Elaborar informes trimestrales sobre la gestión del Comité.'
  ]
};

// =====================================================
// NORMAS PARA MATRIZ LEGAL
// =====================================================

export const MATRIZ_LEGAL_NORMATIVA: {
  tipo: string;
  numero: string;
  año: number;
  entidad: string;
  tema: string;
  aplicabilidad: string;
}[] = [
  // Decretos
  { tipo: 'Decreto', numero: '1072', año: 2015, entidad: 'Ministerio del Trabajo', tema: 'Decreto Único Reglamentario del Sector Trabajo - Sistema de Gestión de SST', aplicabilidad: 'Todo el SG-SST' },
  { tipo: 'Decreto', numero: '1295', año: 1994, entidad: 'Ministerio del Trabajo', tema: 'Sistema General de Riesgos Profesionales', aplicabilidad: 'Afiliación, cotización, prestaciones' },
  { tipo: 'Decreto', numero: '2090', año: 2003, entidad: 'Ministerio de la Protección Social', tema: 'Actividades de alto riesgo para pensión especial', aplicabilidad: 'Trabajadores de alto riesgo' },
  // Resoluciones
  { tipo: 'Resolución', numero: '0312', año: 2019, entidad: 'Ministerio del Trabajo', tema: 'Estándares Mínimos del SG-SST', aplicabilidad: 'Todos los empleadores' },
  { tipo: 'Resolución', numero: '2400', año: 1979, entidad: 'Ministerio del Trabajo', tema: 'Disposiciones sobre vivienda, higiene y seguridad industrial', aplicabilidad: 'Condiciones de trabajo' },
  { tipo: 'Resolución', numero: '2013', año: 1986, entidad: 'Ministerio del Trabajo', tema: 'Organización y funcionamiento de los COPASST', aplicabilidad: 'COPASST' },
  { tipo: 'Resolución', numero: '1016', año: 1989, entidad: 'Ministerio del Trabajo', tema: 'Programas de Salud Ocupacional', aplicabilidad: 'Programa de SST' },
  { tipo: 'Resolución', numero: '2346', año: 2007, entidad: 'Ministerio de la Protección Social', tema: 'Evaluaciones médicas ocupacionales', aplicabilidad: 'Exámenes médicos' },
  { tipo: 'Resolución', numero: '1401', año: 2007, entidad: 'Ministerio de la Protección Social', tema: 'Investigación de accidentes e incidentes de trabajo', aplicabilidad: 'Investigación AT' },
  { tipo: 'Resolución', numero: '2646', año: 2008, entidad: 'Ministerio de la Protección Social', tema: 'Factores de riesgo psicosocial en el trabajo', aplicabilidad: 'Riesgo psicosocial' },
  { tipo: 'Resolución', numero: '652', año: 2012, entidad: 'Ministerio del Trabajo', tema: 'Comité de Convivencia Laboral', aplicabilidad: 'Comité Convivencia' },
  { tipo: 'Resolución', numero: '1356', año: 2012, entidad: 'Ministerio del Trabajo', tema: 'Modificación Resolución 652 de 2012', aplicabilidad: 'Comité Convivencia' },
  { tipo: 'Resolución', numero: '1409', año: 2012, entidad: 'Ministerio del Trabajo', tema: 'Reglamento de Seguridad para protección contra caídas en trabajo en alturas', aplicabilidad: 'Trabajo en alturas' },
  { tipo: 'Resolución', numero: '1565', año: 2014, entidad: 'Ministerio de Transporte', tema: 'Guía metodológica Plan Estratégico de Seguridad Vial', aplicabilidad: 'PESV' },
  { tipo: 'Resolución', numero: '4927', año: 2016, entidad: 'Ministerio del Trabajo', tema: 'Curso de capacitación virtual de 50 horas en SST', aplicabilidad: 'Capacitación responsables SST' },
  { tipo: 'Resolución', numero: '4272', año: 2021, entidad: 'Ministerio del Trabajo', tema: 'Requisitos mínimos de seguridad para trabajo en alturas', aplicabilidad: 'Trabajo en alturas' },
  // Leyes
  { tipo: 'Ley', numero: '100', año: 1993, entidad: 'Congreso de la República', tema: 'Sistema de Seguridad Social Integral', aplicabilidad: 'Seguridad social' },
  { tipo: 'Ley', numero: '1010', año: 2006, entidad: 'Congreso de la República', tema: 'Medidas para prevenir, corregir y sancionar el acoso laboral', aplicabilidad: 'Acoso laboral' },
  { tipo: 'Ley', numero: '1503', año: 2011, entidad: 'Congreso de la República', tema: 'Formación de hábitos, comportamientos y conductas seguras en la vía', aplicabilidad: 'Seguridad vial' },
  { tipo: 'Ley', numero: '1562', año: 2012, entidad: 'Congreso de la República', tema: 'Sistema General de Riesgos Laborales', aplicabilidad: 'Sistema de riesgos laborales' },
  { tipo: 'Ley', numero: '1566', año: 2012, entidad: 'Congreso de la República', tema: 'Atención del consumo de sustancias psicoactivas', aplicabilidad: 'Política de drogas y alcohol' }
];

// =====================================================
// HELPERS Y FUNCIONES DE UTILIDAD
// =====================================================

export function getEstandarByCodigo(codigo: string): EstandarSst | undefined {
  return [...ESTANDARES_RECURSOS, ...ESTANDARES_GESTION].find(e => e.codigo === codigo);
}

export function getEstandaresByCiclo(ciclo: 'planear' | 'hacer' | 'verificar' | 'actuar'): EstandarSst[] {
  return [...ESTANDARES_RECURSOS, ...ESTANDARES_GESTION].filter(e => e.ciclo === ciclo);
}

export function getNormativaAplicable(estandarCodigo: string): NormativaBase[] {
  const estandar = getEstandarByCodigo(estandarCodigo);
  return estandar?.normativaAplicable || [];
}

export function getPlantillasDisponibles(estandarCodigo: string): PlantillaPredefinida[] {
  const estandar = getEstandarByCodigo(estandarCodigo);
  return estandar?.plantillas || [];
}

export function getResponsabilidadesByNivel(nivel: string): string[] {
  return RESPONSABILIDADES_SST[nivel] || [];
}

export function getActividadesPlanAnualByMes(mes: number): typeof ACTIVIDADES_PLAN_ANUAL {
  return ACTIVIDADES_PLAN_ANUAL.filter(a => a.mes === mes || a.mes === 0);
}

export function getTodasActividadesPlanAnual(): typeof ACTIVIDADES_PLAN_ANUAL {
  return ACTIVIDADES_PLAN_ANUAL;
}

export function getNormasMatrizLegal(): typeof MATRIZ_LEGAL_NORMATIVA {
  return MATRIZ_LEGAL_NORMATIVA;
}
