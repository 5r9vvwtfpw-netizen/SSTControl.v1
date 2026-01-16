export interface PoliticaPredefinida {
  codigo: string;
  titulo: string;
  objetivo: string;
  alcance: string;
  contenido: string;
  categoria: 'general' | 'seguridad' | 'salud' | 'ambiental' | 'emergencias' | 'vehiculos';
  normativa?: string;
  obligatoria: boolean;
}

export const politicasSstPredefinidas: PoliticaPredefinida[] = [
  {
    codigo: 'POL-GEN-01',
    titulo: 'Política del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)',
    objetivo: 'Establecer el compromiso de la alta dirección con la implementación del SG-SST para la prevención de lesiones, enfermedades laborales y mejora continua de las condiciones de trabajo.',
    alcance: 'Aplica a todos los trabajadores, contratistas, visitantes y cualquier persona que realice actividades en nombre de la organización.',
    contenido: `La Dirección de [NOMBRE_EMPRESA] se compromete a:

1. PROTECCIÓN DE LA SALUD Y LA VIDA: Proveer condiciones de trabajo seguras y saludables para prevenir lesiones y enfermedades relacionadas con el trabajo.

2. CUMPLIMIENTO LEGAL: Cumplir con la normatividad colombiana vigente en materia de SST, incluyendo el Decreto 1072/2015, la Resolución 0312/2019 y demás normas aplicables.

3. MEJORA CONTINUA: Implementar el ciclo PHVA (Planear, Hacer, Verificar, Actuar) para mejorar continuamente la eficacia del SG-SST.

4. PARTICIPACIÓN: Promover la participación activa de todos los trabajadores en la identificación de peligros, evaluación de riesgos y determinación de controles.

5. RECURSOS: Asignar los recursos humanos, técnicos y financieros necesarios para el funcionamiento efectivo del SG-SST.

6. RESPONSABILIDAD: Asignar responsabilidades en SST a todos los niveles de la organización.

7. PREVENCIÓN: Identificar peligros, evaluar y valorar riesgos, estableciendo controles necesarios.

Esta política será revisada anualmente y comunicada a todos los niveles de la organización.`,
    categoria: 'general',
    normativa: 'Decreto 1072/2015 - Art. 2.2.4.6.5',
    obligatoria: true
  },
  {
    codigo: 'POL-SEG-01',
    titulo: 'Política de Prevención del Consumo de Alcohol, Tabaco y Sustancias Psicoactivas',
    objetivo: 'Prevenir el consumo de alcohol, tabaco y sustancias psicoactivas en el lugar de trabajo y promover hábitos de vida saludable.',
    alcance: 'Aplica a todos los trabajadores, contratistas y visitantes en todas las instalaciones de la empresa.',
    contenido: `[NOMBRE_EMPRESA] establece la siguiente política:

1. PROHIBICIONES:
   - Queda prohibido el consumo, porte, distribución o comercialización de alcohol y sustancias psicoactivas en las instalaciones de la empresa.
   - Se prohíbe presentarse al trabajo bajo los efectos de alcohol o sustancias psicoactivas.
   - El consumo de tabaco solo está permitido en áreas designadas y señalizadas.

2. PRUEBAS:
   - La empresa se reserva el derecho de realizar pruebas de alcoholemia y detección de sustancias cuando exista sospecha fundada o en cargos críticos para la seguridad.

3. PREVENCIÓN Y APOYO:
   - Se implementarán programas de prevención y sensibilización.
   - Se brindará apoyo y acompañamiento a trabajadores que voluntariamente soliciten ayuda.

4. CONSECUENCIAS:
   - El incumplimiento de esta política será considerado falta grave según el Reglamento Interno de Trabajo.

Esta política se aplica en cumplimiento de la Ley 1566/2012 y el Decreto 1072/2015.`,
    categoria: 'salud',
    normativa: 'Ley 1566/2012 - Decreto 1072/2015',
    obligatoria: true
  },
  {
    codigo: 'POL-SEG-02',
    titulo: 'Política de Seguridad Vial y Plan Estratégico de Seguridad Vial (PESV)',
    objetivo: 'Prevenir accidentes de tránsito y proteger la vida e integridad de conductores, pasajeros y terceros involucrados en actividades de movilidad de la empresa.',
    alcance: 'Aplica a todos los trabajadores que conduzcan vehículos propios o de la empresa por razones laborales.',
    contenido: `[NOMBRE_EMPRESA] se compromete a:

1. CULTURA DE SEGURIDAD VIAL:
   - Promover comportamientos seguros en la vía.
   - Capacitar periódicamente a los conductores.
   - Realizar campañas de sensibilización.

2. REQUISITOS PARA CONDUCTORES:
   - Licencia de conducción vigente y apropiada.
   - Evaluación médica ocupacional apta.
   - Capacitación en conducción defensiva.

3. VEHÍCULOS:
   - Mantenimiento preventivo y correctivo oportuno.
   - Revisión tecnomecánica vigente.
   - SOAT y seguros actualizados.

4. PROHIBICIONES:
   - Conducir bajo efectos de alcohol o sustancias psicoactivas.
   - Uso de dispositivos móviles mientras se conduce.
   - Exceder límites de velocidad.

5. GESTIÓN DE RIESGOS:
   - Identificación de rutas y horarios críticos.
   - Implementación de controles según nivel de riesgo.
   - Investigación de incidentes viales.

Esta política se implementa en cumplimiento de la Resolución 1565/2014 y la Ley 1503/2011.`,
    categoria: 'vehiculos',
    normativa: 'Resolución 1565/2014 - Ley 1503/2011',
    obligatoria: false
  },
  {
    codigo: 'POL-EME-01',
    titulo: 'Política de Preparación y Respuesta ante Emergencias',
    objetivo: 'Establecer lineamientos para prevenir, preparar y responder eficazmente ante situaciones de emergencia que puedan afectar a los trabajadores, instalaciones o continuidad del negocio.',
    alcance: 'Aplica a todos los trabajadores, contratistas, visitantes y actividades desarrolladas en las instalaciones de la empresa.',
    contenido: `[NOMBRE_EMPRESA] establece:

1. PREVENCIÓN:
   - Identificar amenazas y evaluar vulnerabilidades.
   - Implementar medidas de prevención y mitigación.
   - Mantenimiento de sistemas de protección.

2. PREPARACIÓN:
   - Conformar y capacitar brigada de emergencias.
   - Realizar simulacros periódicos (mínimo 1 anual).
   - Mantener actualizados planes de emergencia.

3. RESPUESTA:
   - Activar protocolos según tipo de emergencia.
   - Garantizar evacuación segura y oportuna.
   - Coordinar con organismos de socorro externos.

4. RECURSOS:
   - Disponibilidad de equipos de emergencia (extintores, botiquines, camillas).
   - Señalización clara de rutas de evacuación y puntos de encuentro.
   - Sistemas de comunicación de emergencias.

5. RESPONSABILIDADES:
   - Definir roles en la gestión de emergencias.
   - Capacitación continua de brigadistas.
   - Evaluación post-emergencia.

Esta política se desarrolla según la NSR-10 Título J y las mejores prácticas en gestión de emergencias.`,
    categoria: 'emergencias',
    normativa: 'NSR-10 Título J - Resolución 2400/1979',
    obligatoria: true
  },
  {
    codigo: 'POL-SAL-01',
    titulo: 'Política de Prevención de Acoso Laboral',
    objetivo: 'Promover un ambiente de trabajo respetuoso, digno y libre de cualquier forma de acoso laboral o maltrato.',
    alcance: 'Aplica a todos los trabajadores sin distinción de cargo, nivel jerárquico o tipo de contrato.',
    contenido: `[NOMBRE_EMPRESA] rechaza toda forma de acoso laboral y establece:

1. COMPROMISO:
   - Tolerancia cero con el acoso laboral.
   - Respeto por la dignidad humana de todos los trabajadores.
   - Ambiente de trabajo sano y respetuoso.

2. CONDUCTAS NO PERMITIDAS:
   - Agresiones físicas o verbales.
   - Descalificación humillante y persistente.
   - Amenazas, intimidación o discriminación.
   - Sobrecarga selectiva e intencional de trabajo.
   - Cambios constantes de horario sin justificación.

3. MECANISMOS DE PREVENCIÓN:
   - Comité de Convivencia Laboral activo.
   - Capacitación en resolución de conflictos.
   - Canales de comunicación abiertos.

4. PROCEDIMIENTO DE QUEJAS:
   - Quejas confidenciales ante el Comité de Convivencia.
   - Investigación imparcial y objetiva.
   - Protección contra represalias.

5. CONSECUENCIAS:
   - Sanciones según gravedad de la falta.
   - Medidas correctivas y preventivas.

Esta política se implementa según la Ley 1010/2006 y la Resolución 652/2012.`,
    categoria: 'salud',
    normativa: 'Ley 1010/2006 - Resolución 652/2012',
    obligatoria: true
  },
  {
    codigo: 'POL-SEG-03',
    titulo: 'Política de Trabajo en Alturas',
    objetivo: 'Garantizar la seguridad de los trabajadores que realizan labores en alturas mediante la implementación de medidas de prevención y protección contra caídas.',
    alcance: 'Aplica a todos los trabajadores que realicen actividades a 1.50 metros o más sobre un nivel inferior.',
    contenido: `[NOMBRE_EMPRESA] establece:

1. CAPACITACIÓN:
   - Certificación obligatoria en trabajo en alturas (nivel básico, avanzado o coordinador según corresponda).
   - Recertificación cada 2 años.
   - Entrenamiento en procedimientos y equipos.

2. REQUISITOS DE SALUD:
   - Evaluación médica ocupacional específica para trabajo en alturas.
   - Aptitud médica vigente.

3. JERARQUÍA DE CONTROLES:
   - Eliminar el trabajo en alturas (primera opción).
   - Controles de ingeniería (plataformas, andamios).
   - Equipos de protección contra caídas (arnés, línea de vida, etc.).

4. EQUIPOS:
   - Inspección diaria de elementos de protección.
   - Uso obligatorio de arnés y doble línea de vida.
   - Equipos certificados y en buen estado.

5. PERMISOS DE TRABAJO:
   - Permiso escrito para cada actividad en alturas.
   - Análisis de riesgos previo.
   - Medidas de rescate disponibles.

Esta política cumple con la Resolución 1409/2012 y la Resolución 4272/2021.`,
    categoria: 'seguridad',
    normativa: 'Resolución 1409/2012 - Resolución 4272/2021',
    obligatoria: false
  },
  {
    codigo: 'POL-SAL-02',
    titulo: 'Política de Prevención de Riesgos Ergonómicos y Desórdenes Musculoesqueléticos',
    objetivo: 'Prevenir lesiones musculoesqueléticas mediante la identificación y control de factores de riesgo ergonómico en los puestos de trabajo.',
    alcance: 'Aplica a todos los trabajadores en todas las áreas y actividades de la empresa.',
    contenido: `[NOMBRE_EMPRESA] se compromete a:

1. IDENTIFICACIÓN Y EVALUACIÓN:
   - Evaluación ergonómica de puestos de trabajo.
   - Identificación de factores de riesgo (posturas, movimientos repetitivos, cargas).
   - Monitoreo de síntomas tempranos.

2. CONTROLES:
   - Diseño y rediseño de puestos de trabajo.
   - Provisión de mobiliario ergonómico.
   - Herramientas y equipos adecuados.
   - Rotación de tareas cuando sea aplicable.

3. PAUSAS ACTIVAS:
   - Implementación de programas de pausas activas.
   - Ejercicios de estiramiento y relajación.
   - Frecuencia mínima de 2 veces por jornada.

4. CAPACITACIÓN:
   - Higiene postural.
   - Técnicas de levantamiento seguro de cargas.
   - Identificación de señales de alerta.

5. VIGILANCIA:
   - Exámenes médicos ocupacionales periódicos.
   - Seguimiento de casos reportados.
   - Análisis de tendencias y ajuste de controles.

Esta política se desarrolla según la Resolución 2400/1979 y la guía técnica del Ministerio del Trabajo.`,
    categoria: 'salud',
    normativa: 'Resolución 2400/1979 - Capítulo V',
    obligatoria: true
  },
  {
    codigo: 'POL-AMB-01',
    titulo: 'Política de Gestión Ambiental y SST',
    objetivo: 'Integrar la protección ambiental con la seguridad y salud en el trabajo para minimizar impactos negativos al medio ambiente y garantizar condiciones laborales sostenibles.',
    alcance: 'Aplica a todos los procesos, actividades y servicios de la organización.',
    contenido: `[NOMBRE_EMPRESA] integra ambiente y SST comprometiéndose a:

1. PREVENCIÓN DE LA CONTAMINACIÓN:
   - Minimizar generación de residuos peligrosos.
   - Manejo seguro de sustancias químicas.
   - Control de emisiones y vertimientos.

2. USO EFICIENTE DE RECURSOS:
   - Optimización de consumo de agua y energía.
   - Promoción de economía circular.
   - Reducción, reutilización y reciclaje.

3. PROTECCIÓN DE TRABAJADORES:
   - Exposición controlada a agentes ambientales.
   - EPP apropiado para manejo de materiales peligrosos.
   - Capacitación en respuesta a derrames.

4. CUMPLIMIENTO LEGAL:
   - Normatividad ambiental colombiana.
   - Permisos, licencias y autorizaciones vigentes.
   - Reportes a autoridades ambientales.

5. MEJORA CONTINUA:
   - Objetivos ambientales medibles.
   - Indicadores de desempeño ambiental.
   - Auditorías internas periódicas.

Esta política integra el Decreto 1072/2015 con la gestión ambiental empresarial.`,
    categoria: 'ambiental',
    normativa: 'Decreto 1072/2015 - Normatividad Ambiental',
    obligatoria: false
  }
];

export function getPoliticaByCodigo(codigo: string): PoliticaPredefinida | undefined {
  return politicasSstPredefinidas.find(pol => pol.codigo === codigo);
}

export const categoriaPoliticaLabels = {
  general: 'General SST',
  seguridad: 'Seguridad Industrial',
  salud: 'Salud Ocupacional',
  ambiental: 'Gestión Ambiental',
  emergencias: 'Emergencias',
  vehiculos: 'Seguridad Vial'
};
