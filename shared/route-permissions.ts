import type { Permission } from "./permissions";

/**
 * Mapeo de rutas a permisos requeridos
 * Una ruta es accesible si el usuario tiene AL MENOS UNO de los permisos listados
 * 
 * IMPORTANTE: Rutas con parámetros dinámicos (:id) se definen con el prefijo base
 * La función getRoutePermissions manejará el matching de rutas dinámicas
 * 
 * SEGURIDAD: Cualquier ruta NO listada aquí será DENEGADA por defecto
 */
export const routePermissions: Record<string, Permission[]> = {
  // Configuración
  "/": ["dashboard:view"],
  "/crear-empresa": [], // Accesible para usuarios autenticados que necesitan crear su empresa
  "/empresas": ["companies:view"],
  "/usuarios": ["users:view"],
  "/portal-empleados": ["portal_empleados:access"],
  "/portal-licenciado": ["portal_licenciado:access"],
  
  // Configuración - Administración
  "/dashboard-facturacion": ["billing:global_view"], // Solo superadmin (proveedor SaaS)
  "/mi-cuenta": [], // Accesible para todos los usuarios autenticados
  "/planes-suscripcion": [], // Accesible para todos los usuarios autenticados
  "/checkout": [], // Accesible para todos los usuarios autenticados
  "/tickets-soporte": [], // Accesible para todos los usuarios autenticados
  "/accesos-soporte": ["users:view"], // Solo administradores de empresa (superusuario, admin)
  "/admin-tickets": ["billing:global_view"], // Solo superadmin (proveedor SaaS)
  "/admin-usuarios-soporte": ["billing:global_view"], // Solo superadmin (proveedor SaaS)
  "/profesionales-licenciados": ["licensed_professionals:view"], // Gestión de profesionales licenciados en salud ocupacional
  "/directorio-profesionales": [], // Directorio informativo de profesionales SST (accesible para todos)
  "/documentos-legales": ["users:edit"], // Solo superadmin y admin (documentos legales PDF)
  "/mensajes-internos": [], // Accesible para todos los usuarios autenticados (comunicación LSO ↔ Responsable SST)
  
  // Pricing Plugin
  "/pricing-plugin/calculator": [], // Calculadora pública
  "/pricing-plugin/admin/pricing": ["companies:view"], // Solo administradores

  // Planear - Personal
  "/trabajadores": ["workers:view", "workers:view_self"],
  "/perfiles-cargo": ["job_profiles:view", "job_profiles:view_self"],
  "/afiliaciones-ssss": ["workers:view"],
  "/trabajadores-alto-riesgo": ["workers:view"],
  "/solicitudes-arco": ["workers:view"],

  // Planear - Gestión Integral
  "/evaluaciones-sst": ["sst_evaluations:view"],
  "/evaluacion-inicial": ["sst_evaluations:view"],
  "/planes-trabajo-anual": ["sst_management:view"],
  "/objetivos-sst": ["sst_management:view"],
  "/matriz-legal": ["sst_management:view"],
  "/conservacion-documentos": ["documents:view"],
  "/evaluacion-proveedores": ["sst_management:view"],
  "/gestion-cambios": ["sst_management:view"],
  "/adquisiciones-sst": ["sst_management:view"],
  "/comunicacion-sst": ["comunicaciones_sst:view"],
  "/analisis-contexto": ["sst_management:view"],
  "/plan-mejoramiento-contexto": ["sst_management:view"],
  "/partes-interesadas": ["sst_management:view"],

  // Planear - Recursos
  "/politicas-sst": ["sst_management:view"],
  "/asignacion-recursos": ["sst_management:view"],
  "/designacion-responsable": ["sst_management:view"],
  "/responsable-sst": ["sst_management:view"],
  "/programa-capacitacion-anual": ["trainings:view", "trainings:view_self"],
  "/programa-capacitacion": ["trainings:view", "trainings:view_self"],
  "/curso-50-horas": ["trainings:view", "trainings:view_self"],
  "/registros-induccion": ["trainings:view", "trainings:view_self"],
  "/configuracion-induccion": ["trainings:view", "trainings:view_self"],
  "/capacitaciones": ["trainings:view", "trainings:view_self"],
  "/copasst": ["sst_management:view"],
  "/copasst-actas": ["sst_management:view"],
  "/copasst-gestion": ["sst_management:view"],
  "/capacitacion-copasst": ["trainings:view", "trainings:view_self"],
  "/copasst-cms": ["sst_management:view"],
  "/copasst-evaluaciones": ["sst_management:view"],
  "/comite-convivencia-actas": ["sst_management:view"],

  // Hacer - Operaciones SST
  "/examenes-medicos": ["medical_exams:view", "medical_exams:view_self"],
  "/inspecciones": ["inspections:view", "inspections:view_self"],
  "/mediciones-ambientales": ["sst_management:view"],
  "/conservacion-auditiva": ["sst_management:view"],
  "/sustancias-quimicas": ["sst_management:view"],
  "/vigilancia-epidemiologica": ["diseases:view"],
  "/perfil-sociodemografico": ["sst_management:view"],
  "/actividades-promocion-prevencion": ["sst_management:view"],
  "/estilos-vida-saludable": ["sst_management:view"],

  // Hacer - Gestión de Amenazas (Plan de Emergencias)
  "/plan-emergencias": ["emergency_plans:view", "sst_management:view"],

  // Hacer - PESV (base y sub-rutas)
  "/pesv": ["vehicles:view", "drivers:view"],
  "/pesv/vehiculos": ["vehicles:view"],
  "/pesv/conductores": ["drivers:view"],
  "/pesv/inspecciones": ["vehicle_inspections:view"],
  "/pesv/siniestros": ["road_incidents:view"],
  "/pesv/capacitaciones": ["road_trainings:view", "road_safety_trainings:view"],
  "/pesv/auditorias": ["pesv_audits:view"],

  // Verificar
  "/accidentes": ["accidents:view", "accidents:view_self"],
  "/investigacion-accidentes": ["accidents:view", "sst_management:view"],
  "/arbol-causas": ["accidents:view", "sst_management:view"],  // Árbol de causas según Resolución 1401/2007
  "/ausentismo-laboral": ["accidents:view", "sst_management:view"],
  "/entrega-epp": ["accidents:view", "sst_management:view"],
  "/indicadores-accidentalidad": ["accidents:view", "sst_management:view"],
  "/indicador-frecuencia-severidad": ["accidents:view", "sst_management:view"],
  "/indicador-ili-incidentes": ["accidents:view", "sst_management:view"],
  "/indicador-mortalidad": ["accidents:view", "sst_management:view"],
  "/indicador-prevalencia": ["accidents:view", "sst_management:view"],
  "/indicador-incidencia": ["accidents:view", "sst_management:view"],
  "/estandares-sst": ["sst_standards:view"],
  "/iperc": ["sst_management:view"],
  "/auditorias-internas": ["sst_management:view"],
  "/revisiones-direccion": ["sst_management:view"],
  "/dashboard-verificar": ["sst_management:view"],
  "/reportes/evaluaciones-sst-consolidado": ["sst_management:view"],
  "/reportes/auditorias-internas-consolidado": ["sst_management:view"],
  "/reportes/revisiones-direccion-consolidado": ["sst_management:view"],
  "/reportes/objetivos-indicadores-consolidado": ["sst_management:view"],
  "/informes": ["reports:view"],

  // Actuar
  "/dashboard-actuar": ["sst_management:view"],
  "/medidas": ["measures:view"],
  "/salud": ["diseases:view"],
  "/recomendaciones-arl": ["sst_management:view"],

  // Dashboards Ejecutivos
  "/dashboard-hacer": ["sst_management:view"],
};

// Cache de rutas ordenadas para optimizar rendimiento
let _sortedRoutesCache: string[] | null = null;

/**
 * Obtiene las rutas ordenadas de más específica a menos específica (más larga a más corta)
 * Resultado cacheado para evitar sorting repetido
 */
function getSortedRoutes(): string[] {
  if (!_sortedRoutesCache) {
    _sortedRoutesCache = Object.keys(routePermissions).sort((a, b) => b.length - a.length);
  }
  return _sortedRoutesCache;
}

/**
 * Verifica si un segmento de ruta parece ser un parámetro dinámico (ID)
 */
function isDynamicSegment(segment: string): boolean {
  // UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }
  // Número
  if (/^\d+$/.test(segment)) {
    return true;
  }
  return false;
}

/**
 * Normaliza una ruta reemplazando segmentos dinámicos por su ruta base
 * Ejemplos:
 *   "/empresas/abc-123-def" -> "/empresas"
 *   "/pesv/vehiculos/456" -> "/pesv/vehiculos"
 *   "/empresas/123/historial/456" -> "/empresas"
 * 
 * @param path Ruta a normalizar
 * @returns Todas las rutas base posibles (de más específica a menos específica)
 */
function getPathVariants(path: string): string[] {
  const segments = path.split('/').filter(s => s);
  const variants: string[] = [];
  
  // Agregar la ruta exacta primero
  variants.push(path);
  
  // Generar variantes eliminando segmentos dinámicos de derecha a izquierda
  for (let i = segments.length - 1; i >= 0; i--) {
    if (isDynamicSegment(segments[i])) {
      const variant = '/' + segments.slice(0, i).join('/');
      if (variant !== '/' && variant) {
        variants.push(variant);
      }
    }
  }
  
  return variants;
}

/**
 * Verifica si una ruta requiere permisos específicos
 * Maneja rutas exactas, sub-rutas y parámetros dinámicos múltiples
 * 
 * Algoritmo:
 * 1. Genera variantes de la ruta eliminando segmentos dinámicos
 * 2. Busca coincidencia exacta en las variantes
 * 3. Busca coincidencia por prefijo con rutas mapeadas
 * 
 * @param path Ruta a verificar (ej: "/empresas/123", "/pesv/vehiculos/456/historial")
 * @returns Array de permisos requeridos, o undefined si la ruta no está mapeada
 */
export function getRoutePermissions(path: string): Permission[] | undefined {
  // 1. Coincidencia exacta directa
  if (routePermissions[path]) {
    return routePermissions[path];
  }

  // 2. Generar variantes de la ruta (sin segmentos dinámicos)
  const variants = getPathVariants(path);
  
  for (const variant of variants) {
    if (routePermissions[variant]) {
      return routePermissions[variant];
    }
  }

  // 3. Matching por prefijo con rutas mapeadas (ordenadas de más específica a menos)
  const sortedRoutes = getSortedRoutes();
  
  for (const route of sortedRoutes) {
    if (path === route || path.startsWith(route + "/")) {
      return routePermissions[route];
    }
  }

  return undefined;
}

/**
 * Verifica si el usuario tiene permisos para acceder a una ruta
 * 
 * SEGURIDAD: Por defecto DENIEGA acceso a rutas no mapeadas
 * Solo las rutas explícitamente definidas en routePermissions son accesibles
 * 
 * @param userPermissions Array de permisos del usuario
 * @param path Ruta a verificar
 * @returns true si el usuario puede acceder, false en caso contrario
 */
export function canAccessRoute(userPermissions: Permission[], path: string): boolean {
  // Rutas públicas que no requieren autenticación (solo /auth)
  const publicRoutes = ["/auth"];
  if (publicRoutes.includes(path)) {
    return true;
  }

  const requiredPermissions = getRoutePermissions(path);
  
  // SEGURIDAD: Si la ruta no está mapeada, DENEGAR acceso por defecto
  // Esto evita que rutas no documentadas sean accesibles
  if (!requiredPermissions) {
    // Excepción: Dashboard (/) siempre accesible para usuarios autenticados
    if (path === "/") {
      return true;
    }
    return false;
  }

  // Si la ruta está mapeada pero sin permisos requeridos, permitir acceso
  if (requiredPermissions.length === 0) {
    return true;
  }

  // El usuario necesita AL MENOS UNO de los permisos requeridos
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}
