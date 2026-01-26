/**
 * SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
 * 
 * Copyright (c) 2024-2026. Todos los derechos reservados.
 * 
 * Este software es propiedad confidencial y está protegido por las leyes de
 * propiedad intelectual de Colombia (Ley 23 de 1982, Decisión Andina 351).
 * 
 * Queda estrictamente prohibida su reproducción, distribución, modificación
 * o ingeniería inversa sin autorización expresa por escrito del propietario.
 * 
 * CONFIDENCIAL - NO DISTRIBUIR
 */


/**
 * Mapeo de módulos permitidos por capítulo según Resolución 0312/2019
 * 
 * La restricción se basa en el PLAN DE SUSCRIPCIÓN, no en el número de trabajadores.
 * 
 * Capítulo 1 (7 estándares): Plan Microempresa (≤10 trabajadores, riesgo I/II/III)
 * Capítulo 2 (21 estándares): Plan Pequeña Empresa (11-50 trabajadores, riesgo I/II/III)
 * Capítulo 3 (61 estándares): Plan Mediana o Gran Empresa (>50 trabajadores o riesgo IV/V)
 */

export type ChapterType = 1 | 2 | 3;

/**
 * Mapeo de plan de suscripción a capítulo
 * Los slugs corresponden a subscription_plans.name
 */
export const PLAN_TO_CHAPTER: Record<string, ChapterType> = {
  microempresa: 1,
  pequena: 2,
  mediana: 3,
  grande: 3,
};

/**
 * Obtiene el capítulo basándose en el slug del plan de suscripción
 */
export function getChapterForPlan(planSlug: string | null | undefined): ChapterType | null {
  if (!planSlug) return null;
  return PLAN_TO_CHAPTER[planSlug] ?? null;
}

// Módulos básicos disponibles para TODOS los capítulos
const CHAPTER_1_MODULES = [
  // Configuración - siempre disponible
  "/",
  "/dashboard",
  "/empresas",
  "/crear-empresa",
  "/usuarios",
  "/portal-empleados",
  "/dashboard-facturacion",
  "/mi-cuenta",
  "/tickets-soporte",
  "/accesos-soporte",
  "/admin-tickets",
  "/admin-usuarios-soporte",
  "/mensajes-internos",
  
  // Suscripciones y facturación (siempre disponible)
  "/mi-suscripcion",
  "/planes-suscripcion",
  "/checkout",
  "/pricing",
  "/pricing-plugin",
  
  // Legal y cumplimiento (siempre disponible)
  "/solicitudes-arco",
  "/registro-accesos-proveedor",
  "/terminos-servicio",
  "/politica-privacidad",
  "/politica-privacidad-proveedor",
  "/acuerdo-procesamiento-datos",
  "/documentos-legales",
  "/directorio-profesionales",  // Directorio de profesionales SST - disponible para todos
  
  // Auth (siempre disponible)
  "/auth",
  "/login",
  "/soporte",
  "/recuperar-contrasena",
  "/restablecer-contrasena",
  
  // Personal básico
  "/trabajadores",
  "/afiliaciones-ssss",
  
  // Recursos básicos (estándares 1.1.1 - 1.1.8)
  "/designacion-responsable",
  "/asignacion-recursos",  // Estándar 1.1.3 - Recursos financieros para el SG-SST
  "/capacitaciones",
  "/registros-induccion",
  "/configuracion-induccion",
  "/copasst",
  "/copasst-actas",
  "/copasst-gestion",
  "/capacitacion-copasst",
  "/copasst-cms",
  "/copasst-evaluaciones",
  "/comite-convivencia-actas",  // Estándar 1.1.8 - Obligatorio para todas las empresas (Ley 1010/2006)
  
  // Evaluación básica
  "/evaluaciones-sst",
  
  // Accidentes (obligatorio para todos)
  "/accidentes",
  "/investigacion-accidentes",  // Estándar 3.2.1 - Investigación de incidentes, AT y EL
  "/ausentismo-laboral",  // Estándar 3.2.3 - Control de ausentismo laboral
  
  // EPP - Entrega de Elementos de Protección Personal (obligatorio para todos, Decreto 1072/2015)
  "/entrega-epp",
  
  // Perfil sociodemográfico (estándar 3.1.1 - obligatorio para todos)
  "/perfil-sociodemografico",
  
  // Perfiles de Cargo - Ahora disponible para todos los capítulos
  "/perfiles-cargo",
  
  // Estándares SST (visualización)
  "/estandares-sst",
  "/cumplimiento-0312",  // Módulo de Cumplimiento Resolución 0312/2019 - disponible para todos
  
  // Dashboards básicos
  "/dashboard-verificar",
  "/dashboard-actuar",
  
  // Medidas básicas
  "/medidas",
  "/recomendaciones-arl",
  
  // Análisis de Contexto y Plan de Mejoramiento (ISO 45001:2018 - disponible para todos)
  "/analisis-contexto",
  "/plan-mejoramiento-contexto",
  "/partes-interesadas",
  
  // Política SST (Estándar 1.1.1 - obligatorio para TODAS las empresas, Decreto 1072/2015 Art. 2.2.4.6.5)
  "/politicas-sst",
  
  // Módulos necesarios para cumplir 7 estándares obligatorios (Capítulo I)
  // Estándar 1.2.1 - Capacitación del responsable del SG-SST (obligatorio para todos)
  "/programa-capacitacion-anual",
  "/programa-capacitacion",
  "/curso-50-horas",
  // Estándar 2.4.1 - Plan Anual de Trabajo
  "/planes-trabajo-anual",
  // Estándar 3.1.4 - Evaluaciones médicas ocupacionales
  "/examenes-medicos",
  // Estándar 4.1.1 - IPERC
  "/iperc",
  // Dashboard Hacer (necesario para acceder a los módulos anteriores)
  "/dashboard-hacer",
];

// Módulos adicionales para Capítulo 2 (21 estándares)
// Nota: planes-trabajo-anual, iperc, examenes-medicos y dashboard-hacer ya están en Capítulo 1
const CHAPTER_2_ADDITIONAL_MODULES = [
  // Personal adicional
  "/trabajadores-alto-riesgo",
  
  // Gestión Integral (adicionales)
  "/objetivos-sst",
  "/matriz-legal",
  "/conservacion-documentos",
  "/comunicacion-sst",
  "/indicadores-sst",
  "/indicadores-accidentalidad",  // Estándar 3.2.2 - Registro estadístico de AT, EL e incidentes
  "/indicador-frecuencia-severidad",  // Estándar 3.3.1 - Índices IF y Severidad
  "/indicador-ili-incidentes",  // Estándar 3.3.2 - Índice de Lesión Incapacitante (ILI)
  "/indicador-mortalidad",  // Estándar 3.3.3 - Tasa de Mortalidad
  "/indicador-ausentismo",  // Estándar 3.3.3 - Tasa de Ausentismo
  "/indicador-prevalencia",  // Estándar 3.3.4 - Tasa de Prevalencia
  "/indicador-incidencia",  // Estándar 3.3.5 - Tasa de Incidencia
  
  // Recursos adicionales
  "/asignacion-recursos",
  
  // Operaciones SST (adicionales)
  "/inspecciones",
  "/mediciones-ambientales",
  "/conservacion-auditiva",  // Estándar 4.1.4 - Programa de Conservación Auditiva (Res. 8321/1983)
  "/plan-emergencias",
  "/actividades-promocion-prevencion",  // Estándar 3.1.2 - Actividades de Promoción y Prevención en Salud
  "/estilos-vida-saludable",  // Estándar 3.1.7 - Estilos de Vida Saludable
  
  // Verificar adicional
  "/informes",
  
  // Actuar adicional
  "/salud",
];

// Módulos adicionales para Capítulo 3 (61 estándares) - TODOS los módulos
const CHAPTER_3_ADDITIONAL_MODULES = [
  // Gestión avanzada
  "/evaluacion-proveedores",
  "/gestion-cambios",
  "/adquisiciones-sst",
  
  // Operaciones avanzadas
  "/sustancias-quimicas",
  "/vigilancia-epidemiologica",
  
  // PESV completo (solo empresas grandes)
  "/pesv",
  "/pesv/vehiculos",
  "/pesv/conductores",
  "/pesv/inspecciones",
  "/pesv/siniestros",
  "/pesv/capacitaciones",
  "/pesv/auditorias",
  
  // Verificar avanzado
  "/auditorias-internas",
  "/revisiones-direccion",
];

// Construir los módulos por capítulo
export const MODULES_BY_CHAPTER: Record<ChapterType, string[]> = {
  1: [...CHAPTER_1_MODULES],
  2: [...CHAPTER_1_MODULES, ...CHAPTER_2_ADDITIONAL_MODULES],
  3: [...CHAPTER_1_MODULES, ...CHAPTER_2_ADDITIONAL_MODULES, ...CHAPTER_3_ADDITIONAL_MODULES],
};

/**
 * Verifica si una ruta está permitida para un capítulo específico
 */
export function isModuleAllowedForChapter(path: string, chapter: ChapterType): boolean {
  const allowedModules = MODULES_BY_CHAPTER[chapter];
  
  // Verificar coincidencia exacta
  if (allowedModules.includes(path)) {
    return true;
  }
  
  // Verificar rutas con parámetros dinámicos (ej: /evaluaciones-sst/:id, /planes-trabajo-anual/nuevo)
  // También manejar rutas tipo /pesv/vehiculos/123
  for (const module of allowedModules) {
    // Si la ruta actual comienza con un módulo permitido seguido de /
    if (path.startsWith(module + "/")) {
      return true;
    }
  }
  
  // Verificar si es una subruta de un módulo permitido
  // Por ejemplo: /planes-trabajo-anual/nuevo debería ser permitido si /planes-trabajo-anual está permitido
  const pathParts = path.split("/").filter(Boolean);
  for (let i = pathParts.length - 1; i >= 1; i--) {
    const parentPath = "/" + pathParts.slice(0, i).join("/");
    if (allowedModules.includes(parentPath)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Obtiene la lista de módulos permitidos para un capítulo
 */
export function getModulesForChapter(chapter: ChapterType): string[] {
  return MODULES_BY_CHAPTER[chapter];
}

/**
 * Filtra items de menú según el capítulo de la empresa
 */
export function filterMenuItemsByChapter<T extends { path: string }>(
  items: T[],
  chapter: ChapterType | null
): T[] {
  // Si no hay capítulo definido (admin sin empresa), mostrar todo
  if (chapter === null) {
    return items;
  }
  
  return items.filter(item => isModuleAllowedForChapter(item.path, chapter));
}

/**
 * Descripción amigable basada en trabajadores y nivel de riesgo (sin usar "Capítulo")
 */
export const CHAPTER_DESCRIPTIONS: Record<ChapterType, { name: string; description: string; standards: number }> = {
  1: {
    name: "Estándares Mínimos",
    description: "1-10 trabajadores, Riesgo I/II/III",
    standards: 7,
  },
  2: {
    name: "Estándares Intermedios",
    description: "11-50 trabajadores, Riesgo I/II/III",
    standards: 21,
  },
  3: {
    name: "Estándares Completos",
    description: ">50 trabajadores o Riesgo IV/V",
    standards: 61,
  },
};
