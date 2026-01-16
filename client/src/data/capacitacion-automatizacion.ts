export interface InstructorPredefinido {
  id: string;
  nombre: string;
  especialidad: string;
  tipo: 'interno' | 'externo' | 'arl';
}

export interface LugarPredefinido {
  id: string;
  nombre: string;
  tipo: 'presencial' | 'virtual' | 'campo';
  capacidad?: number;
}

export interface HorarioPredefinido {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'jornada_completa' | 'media_jornada' | 'personalizado';
}

export interface DuracionSugerida {
  horas: number;
  horaInicio: string;
  horaFin: string;
  jornadas: number;
}

export const INSTRUCTORES_PREDEFINIDOS: InstructorPredefinido[] = [
  { id: 'interno-sst', nombre: 'Responsable SG-SST de la Empresa', especialidad: 'SST General', tipo: 'interno' },
  { id: 'interno-copasst', nombre: 'Representante COPASST', especialidad: 'SST/Comité', tipo: 'interno' },
  { id: 'interno-brigada', nombre: 'Líder de Brigada de Emergencias', especialidad: 'Emergencias', tipo: 'interno' },
  { id: 'arl-general', nombre: 'Profesional de la ARL', especialidad: 'SST General', tipo: 'arl' },
  { id: 'arl-alturas', nombre: 'Instructor Certificado ARL - Trabajo en Alturas', especialidad: 'Trabajo en Alturas', tipo: 'arl' },
  { id: 'arl-psicosocial', nombre: 'Psicólogo ARL - Riesgo Psicosocial', especialidad: 'Riesgo Psicosocial', tipo: 'arl' },
  { id: 'externo-alturas', nombre: 'Centro de Entrenamiento Certificado - Alturas', especialidad: 'Trabajo en Alturas', tipo: 'externo' },
  { id: 'externo-bomberos', nombre: 'Bomberos Voluntarios/Oficiales', especialidad: 'Emergencias/Incendios', tipo: 'externo' },
  { id: 'externo-cruz-roja', nombre: 'Cruz Roja Colombiana', especialidad: 'Primeros Auxilios', tipo: 'externo' },
  { id: 'externo-defensa-civil', nombre: 'Defensa Civil Colombiana', especialidad: 'Emergencias', tipo: 'externo' },
  { id: 'externo-ergonomia', nombre: 'Fisioterapeuta Especialista', especialidad: 'Ergonomía', tipo: 'externo' },
  { id: 'externo-quimico', nombre: 'Ingeniero Químico Certificado', especialidad: 'Sustancias Químicas', tipo: 'externo' },
];

export const LUGARES_PREDEFINIDOS: LugarPredefinido[] = [
  { id: 'sala-principal', nombre: 'Sala de Reuniones Principal', tipo: 'presencial', capacidad: 30 },
  { id: 'sala-capacitacion', nombre: 'Sala de Capacitación', tipo: 'presencial', capacidad: 20 },
  { id: 'auditorio', nombre: 'Auditorio de la Empresa', tipo: 'presencial', capacidad: 100 },
  { id: 'oficina-sst', nombre: 'Oficina de SST', tipo: 'presencial', capacidad: 10 },
  { id: 'area-produccion', nombre: 'Área de Producción', tipo: 'campo' },
  { id: 'area-bodega', nombre: 'Bodega/Almacén', tipo: 'campo' },
  { id: 'area-externa', nombre: 'Zona de Trabajo en Campo', tipo: 'campo' },
  { id: 'virtual-teams', nombre: 'Microsoft Teams', tipo: 'virtual' },
  { id: 'virtual-meet', nombre: 'Google Meet', tipo: 'virtual' },
  { id: 'virtual-zoom', nombre: 'Zoom', tipo: 'virtual' },
  { id: 'sede-arl', nombre: 'Sede de la ARL', tipo: 'presencial', capacidad: 50 },
  { id: 'centro-entrenamiento', nombre: 'Centro de Entrenamiento Externo', tipo: 'presencial', capacidad: 20 },
];

export const HORARIOS_PREDEFINIDOS: HorarioPredefinido[] = [
  { id: 'manana-completa', nombre: 'Jornada Mañana Completa', horaInicio: '08:00', horaFin: '12:00', tipo: 'media_jornada' },
  { id: 'tarde-completa', nombre: 'Jornada Tarde Completa', horaInicio: '14:00', horaFin: '18:00', tipo: 'media_jornada' },
  { id: 'dia-completo', nombre: 'Jornada Completa', horaInicio: '08:00', horaFin: '17:00', tipo: 'jornada_completa' },
  { id: 'manana-corta', nombre: 'Mañana Corta (2 horas)', horaInicio: '08:00', horaFin: '10:00', tipo: 'personalizado' },
  { id: 'tarde-corta', nombre: 'Tarde Corta (2 horas)', horaInicio: '14:00', horaFin: '16:00', tipo: 'personalizado' },
  { id: 'almuerzo', nombre: 'Horario de Almuerzo', horaInicio: '12:00', horaFin: '14:00', tipo: 'personalizado' },
  { id: 'noche', nombre: 'Jornada Nocturna', horaInicio: '18:00', horaFin: '21:00', tipo: 'personalizado' },
];

export const AUDIENCIAS_PREDEFINIDAS = [
  { id: 'todos', nombre: 'Todos los Trabajadores', descripcion: 'Incluye personal administrativo y operativo' },
  { id: 'administrativos', nombre: 'Personal Administrativo', descripcion: 'Oficinas y áreas administrativas' },
  { id: 'operativos', nombre: 'Personal Operativo', descripcion: 'Producción, mantenimiento, bodega' },
  { id: 'nuevos', nombre: 'Nuevos Ingresos', descripcion: 'Trabajadores recién contratados' },
  { id: 'copasst', nombre: 'Miembros COPASST', descripcion: 'Integrantes del comité paritario' },
  { id: 'brigada', nombre: 'Brigada de Emergencias', descripcion: 'Brigadistas de la empresa' },
  { id: 'alturas', nombre: 'Trabajadores en Alturas', descripcion: 'Personal que realiza trabajo en alturas' },
  { id: 'conductores', nombre: 'Conductores', descripcion: 'Personal de conducción de vehículos' },
  { id: 'supervisores', nombre: 'Supervisores y Jefes', descripcion: 'Personal con funciones de supervisión' },
  { id: 'contratistas', nombre: 'Contratistas', descripcion: 'Personal de empresas contratistas' },
];

export function calcularDuracionSugerida(duracionHoras: number): DuracionSugerida {
  if (duracionHoras <= 2) {
    return { horas: duracionHoras, horaInicio: '08:00', horaFin: `${8 + duracionHoras}:00`.padStart(5, '0'), jornadas: 1 };
  } else if (duracionHoras <= 4) {
    return { horas: duracionHoras, horaInicio: '08:00', horaFin: '12:00', jornadas: 1 };
  } else if (duracionHoras <= 8) {
    return { horas: duracionHoras, horaInicio: '08:00', horaFin: '17:00', jornadas: 1 };
  } else {
    const jornadas = Math.ceil(duracionHoras / 8);
    return { horas: duracionHoras, horaInicio: '08:00', horaFin: '17:00', jornadas };
  }
}

export function getInstructorSugerido(categoria: string): InstructorPredefinido | undefined {
  const mapeoCategoria: Record<string, string> = {
    'seguridad': 'arl-general',
    'salud': 'arl-general',
    'emergencias': 'externo-bomberos',
    'normatividad': 'interno-sst',
    'especializadas': 'arl-general',
    'trabajo_alturas': 'arl-alturas',
    'primeros_auxilios': 'externo-cruz-roja',
    'riesgo_psicosocial': 'arl-psicosocial',
    'ergonomia': 'externo-ergonomia',
    'sustancias_quimicas': 'externo-quimico',
  };
  const instructorId = mapeoCategoria[categoria];
  return INSTRUCTORES_PREDEFINIDOS.find(i => i.id === instructorId);
}

export function getLugarSugerido(tipo: 'teorico' | 'practico' | 'mixto', capacidad?: number): LugarPredefinido {
  if (tipo === 'practico') {
    return LUGARES_PREDEFINIDOS.find(l => l.id === 'area-produccion')!;
  }
  if (capacidad && capacidad > 50) {
    return LUGARES_PREDEFINIDOS.find(l => l.id === 'auditorio')!;
  }
  return LUGARES_PREDEFINIDOS.find(l => l.id === 'sala-capacitacion')!;
}
