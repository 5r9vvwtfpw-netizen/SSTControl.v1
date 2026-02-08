/**
 * Middleware de restricciones por plan de suscripción
 * 
 * Valida que las operaciones cumplan con los límites del plan contratado:
 * - Basic ($99k): 50 trabajadores, 3 usuarios, 1 empresa
 * - Pro ($249k): 200 trabajadores, 10 usuarios, 5 empresas
 * - Enterprise ($499k): Ilimitado
 * 
 * Bloque 4: Sistema de Facturación Wompi
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { Worker } from "@shared/schema";

export interface SubscriptionLimits {
  maxWorkers: number | null; // null = ilimitado
  maxUsers: number | null;
  maxCompanies: number | null;
  maxSedes: number | null; // Máximo número de sedes
  
  // Feature flags
  hasIPERCCompleto: boolean;
  hasAuditorias: boolean;
  hasPESV: boolean;
  hasRevisionDireccion: boolean;
  hasGestionCambios: boolean;
  hasMatrizLegal: boolean;
  hasObjetivosIndicadores: boolean;
  hasEvaluacionProveedores: boolean;
  hasComunicacionSST: boolean;
  hasAdquisicionesSST: boolean;
  hasDashboardsEjecutivos: boolean;
  hasPDFsNormativos: boolean;
  hasExamenesMedicos: boolean;
  hasMedicionesAmbientales: boolean;
  hasSustanciasQuimicas: boolean;
  hasCOPASST: boolean;
  hasComiteConvivencia: boolean;
  hasAPI: boolean;
  hasExportacionMasiva: boolean;
  hasWhiteLabel: boolean;
  hasSLA: boolean;
  hasGerenteCuenta: boolean;
  hasConsultoriaSST: boolean;
}

/**
 * Límites por defecto del Plan Esencial (fallback para empresas sin suscripción configurada)
 * Estos límites permiten usar el sistema básico mientras se configura la suscripción
 */
const DEFAULT_ESENCIAL_LIMITS: SubscriptionLimits = {
  maxWorkers: 10,
  maxUsers: 3,  // Plan Esencial permite 3 usuarios (NO 1 como FREE)
  maxCompanies: 1,
  maxSedes: 1,
  hasIPERCCompleto: false,
  hasAuditorias: false,
  hasPESV: false,
  hasRevisionDireccion: false,
  hasGestionCambios: false,
  hasMatrizLegal: false,
  hasObjetivosIndicadores: false,
  hasEvaluacionProveedores: false,
  hasComunicacionSST: false,
  hasAdquisicionesSST: false,
  hasDashboardsEjecutivos: false,
  hasPDFsNormativos: false,
  hasExamenesMedicos: false,
  hasMedicionesAmbientales: false,
  hasSustanciasQuimicas: false,
  hasCOPASST: false,
  hasComiteConvivencia: false,
  hasAPI: false,
  hasExportacionMasiva: false,
  hasWhiteLabel: false,
  hasSLA: false,
  hasGerenteCuenta: false,
  hasConsultoriaSST: false,
};

/**
 * Obtiene los límites del plan de suscripción de una empresa
 * 
 * IMPORTANTE: Las empresas en período de prueba (trialing) reciben los límites
 * completos del plan que están probando, permitiéndoles evaluar todas las funcionalidades.
 * 
 * FALLBACK: Empresas sin suscripción configurada reciben límites del Plan Esencial
 * (3 usuarios, 10 trabajadores) en lugar de límites FREE restrictivos.
 */
async function getCompanyLimits(companyId: string): Promise<SubscriptionLimits> {
  try {
    // 1. Obtener suscripción activa o en trial de la empresa
    const subscription = await storage.getSubscriptionByCompany(companyId);

    // Las suscripciones 'active' o 'trial' tienen acceso a los límites del plan
    const hasValidSubscription = subscription && 
      (subscription.status === 'active' || subscription.status === 'trial');

    if (!hasValidSubscription) {
      console.log(`[SubscriptionLimits] Company ${companyId} has no valid subscription, using Esencial defaults`);
      return DEFAULT_ESENCIAL_LIMITS;
    }

    // 2. Trial: desbloquear TODAS las features para que el usuario explore el sistema completo
    if (subscription.status === 'trial') {
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      return {
        maxWorkers: plan ? (plan.maxWorkers === -1 ? null : plan.maxWorkers) : 50,
        maxUsers: plan ? (plan.maxUsers === -1 ? null : plan.maxUsers) : 5,
        maxCompanies: 1,
        maxSedes: plan ? (plan.maxSedes === -1 ? null : plan.maxSedes) : 3,
        hasIPERCCompleto: true,
        hasAuditorias: true,
        hasPESV: true,
        hasRevisionDireccion: true,
        hasGestionCambios: true,
        hasMatrizLegal: true,
        hasObjetivosIndicadores: true,
        hasEvaluacionProveedores: true,
        hasComunicacionSST: true,
        hasAdquisicionesSST: true,
        hasDashboardsEjecutivos: true,
        hasPDFsNormativos: true,
        hasExamenesMedicos: true,
        hasMedicionesAmbientales: true,
        hasSustanciasQuimicas: true,
        hasCOPASST: true,
        hasComiteConvivencia: true,
        hasAPI: false,
        hasExportacionMasiva: false,
        hasWhiteLabel: false,
        hasSLA: false,
        hasGerenteCuenta: false,
        hasConsultoriaSST: false,
      };
    }

    // 3. Suscripción activa: obtener detalles del plan
    const plan = await storage.getSubscriptionPlan(subscription.planId);

    if (!plan) {
      console.warn(`[SubscriptionLimits] Plan ${subscription.planId} not found for company ${companyId}, using Esencial defaults`);
      return DEFAULT_ESENCIAL_LIMITS;
    }

    // 4. Retornar límites del plan (convertir integers a booleans para feature flags)
    return {
      maxWorkers: plan.maxWorkers === -1 ? null : plan.maxWorkers,
      maxUsers: plan.maxUsers === -1 ? null : plan.maxUsers,
      maxCompanies: plan.maxCompanies === -1 ? null : plan.maxCompanies,
      maxSedes: plan.maxSedes === -1 ? null : plan.maxSedes,
      
      hasIPERCCompleto: plan.hasIPERCCompleto === 1,
      hasAuditorias: plan.hasAuditorias === 1,
      hasPESV: plan.hasPESV === 1,
      hasRevisionDireccion: plan.hasRevisionDireccion === 1,
      hasGestionCambios: plan.hasGestionCambios === 1,
      hasMatrizLegal: plan.hasMatrizLegal === 1,
      hasObjetivosIndicadores: plan.hasObjetivosIndicadores === 1,
      hasEvaluacionProveedores: plan.hasEvaluacionProveedores === 1,
      hasComunicacionSST: plan.hasComunicacionSST === 1,
      hasAdquisicionesSST: plan.hasAdquisicionesSST === 1,
      hasDashboardsEjecutivos: plan.hasDashboardsEjecutivos === 1,
      hasPDFsNormativos: plan.hasPDFsNormativos === 1,
      hasExamenesMedicos: plan.hasExamenesMedicos === 1,
      hasMedicionesAmbientales: plan.hasMedicionesAmbientales === 1,
      hasSustanciasQuimicas: plan.hasSustanciasQuimicas === 1,
      hasCOPASST: plan.hasCOPASST === 1,
      hasComiteConvivencia: plan.hasComiteConvivencia === 1,
      hasAPI: plan.hasAPI === 1,
      hasExportacionMasiva: plan.hasExportacionMasiva === 1,
      hasWhiteLabel: plan.hasWhiteLabel === 1,
      hasSLA: plan.hasSLA === 1,
      hasGerenteCuenta: plan.hasGerenteCuenta === 1,
      hasConsultoriaSST: plan.hasConsultoriaSST === 1,
    };
  } catch (error) {
    console.error('[SubscriptionLimits] Error getting company limits:', error);
    // En caso de error, aplicar límites del Plan Esencial como fallback seguro
    return DEFAULT_ESENCIAL_LIMITS;
  }
}

/**
 * Middleware que verifica si la operación excede el límite de trabajadores
 * Usar ANTES de crear un nuevo trabajador
 * 
 * IMPORTANTE: Valida contra workersPurchased (cantidad que el cliente pagó)
 * NO contra plan.maxWorkers (límite máximo teórico del plan)
 * 
 * Ejemplo: Plan Microempresa permite hasta 10, pero si el cliente pagó por 2,
 * solo puede registrar 2 trabajadores.
 */
export function checkWorkerLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Determinar el companyId objetivo:
      // 1. Para admins: usar companyId del payload (req.body.companyId)
      // 2. Para otros usuarios: usar su propio companyId (req.user.companyId)
      const userRole = req.user?.role;
      const isAdmin = userRole === 'admin';
      
      let targetCompanyId: string;
      
      if (isAdmin) {
        // Admin puede crear workers para cualquier empresa
        const bodyCompanyId = req.body?.companyId;
        if (typeof bodyCompanyId !== 'string' || bodyCompanyId === '') {
          // Si admin no especificó empresa, continuar (será validado por la ruta)
          return next();
        }
        targetCompanyId = bodyCompanyId;
      } else {
        // Usuario normal solo puede crear workers para su propia empresa
        const userCompanyId = req.user?.companyId;
        if (!userCompanyId) {
          return res.status(401).json({ 
            error: "Authentication required" 
          });
        }
        targetCompanyId = userCompanyId;
      }

      // Obtener suscripción activa de la empresa para verificar workersPurchased
      const subscription = await storage.getSubscriptionByCompany(targetCompanyId);
      
      // Determinar el límite real de trabajadores:
      // 1. PRIORIDAD: subscription.workersPurchased (cantidad que el cliente PAGÓ)
      // 2. FALLBACK: plan.maxWorkers (para suscripciones antiguas sin workersPurchased)
      let workerLimit: number | null = null;
      
      if (subscription && (subscription.status === 'active' || subscription.status === 'trial')) {
        // Si tiene workersPurchased definido, usar ese límite
        if (subscription.workersPurchased && subscription.workersPurchased > 0) {
          workerLimit = subscription.workersPurchased;
        } else {
          // Fallback: obtener límite del plan (para suscripciones sin workersPurchased)
          const plan = await storage.getSubscriptionPlan(subscription.planId);
          if (plan) {
            workerLimit = plan.maxWorkers === -1 ? null : plan.maxWorkers;
          }
        }
      } else {
        // Sin suscripción válida: usar límites por defecto del Plan Esencial
        workerLimit = DEFAULT_ESENCIAL_LIMITS.maxWorkers;
      }

      // Si el plan permite trabajadores ilimitados, continuar
      if (workerLimit === null) {
        return next();
      }

      // Contar trabajadores actuales de la empresa objetivo (solo activos e inactivos)
      const currentWorkers = await storage.getWorkers(targetCompanyId);
      const activeWorkers = currentWorkers.filter((w: Worker) => 
        w.status === 'activo' || w.status === 'inactivo'
      );

      // Verificar si se excedería el límite al agregar un nuevo trabajador
      if (activeWorkers.length >= workerLimit) {
        return res.status(403).json({
          error: "Límite de trabajadores alcanzado",
          message: `Tu suscripción permite hasta ${workerLimit} ${workerLimit === 1 ? 'trabajador' : 'trabajadores'}. Para registrar más trabajadores, actualiza tu plan o aumenta la cantidad de licencias.`,
          currentCount: activeWorkers.length,
          limit: workerLimit,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking worker limit:', error);
      res.status(500).json({ error: "Failed to verify worker limit" });
    }
  };
}

/**
 * Roles que tienen acceso ilimitado (no cuentan contra el límite por rol)
 * El rol 'trabajador' solo accede al Portal de Empleados (lectura)
 */
const UNLIMITED_ROLES = ['trabajador', 'worker'];

/**
 * Roles con acceso global que no están asociados a una empresa específica
 * Estos roles no tienen límite por empresa ya que operan a nivel de plataforma
 */
const GLOBAL_ACCESS_ROLES = ['superadmin', 'admin', 'soporte'];

/**
 * Roles administrativos por empresa que tienen límite de 1 por rol incluido en el plan
 * Si la empresa necesita más usuarios del mismo rol, debe contactar soporte (costo adicional)
 */
const ADMIN_ROLES_WITH_LIMIT = [
  'superusuario',
  'responsable_sst',
  'coordinador_sst',
  'coordinador_rrhh',
  'coordinador_salud',
  'jefe_personal',
  'supervisor',
  'vigia_sst',
  'auditor_interno'
];

/**
 * Middleware que verifica si la operación excede el límite de usuarios por rol
 * 
 * MODELO DE NEGOCIO:
 * - Roles con acceso global (superadmin, admin, soporte): SIN LÍMITE (operan a nivel plataforma)
 * - Rol 'trabajador': ILIMITADO (accede solo al Portal de Empleados)
 * - Roles administrativos por empresa: 1 usuario por rol INCLUIDO en el plan
 * - Si necesitan más usuarios del mismo rol, deben contactar soporte (costo adicional)
 * 
 * Usar ANTES de crear un nuevo usuario
 */
export function checkUserLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtener el rol del nuevo usuario que se intenta crear
      const newUserRole = req.body?.role;
      
      if (!newUserRole) {
        // Si no hay rol especificado, permitir que la validación de la ruta lo maneje
        return next();
      }

      // Roles con acceso global no tienen límite (operan a nivel de plataforma)
      if (GLOBAL_ACCESS_ROLES.includes(newUserRole)) {
        return next();
      }

      // Si el rol es ilimitado (trabajador), permitir siempre
      if (UNLIMITED_ROLES.includes(newUserRole)) {
        return next();
      }

      // Para roles con límite, necesitamos un companyId
      const userRole = req.user?.role;
      const isAdmin = userRole === 'admin' || userRole === 'superadmin';
      
      let targetCompanyId: string | null = null;
      
      if (isAdmin) {
        // Admin/Superadmin puede crear usuarios para cualquier empresa
        const bodyCompanyId = req.body?.companyId;
        if (typeof bodyCompanyId === 'string' && bodyCompanyId !== '') {
          targetCompanyId = bodyCompanyId;
        }
      } else {
        // Usuario normal solo puede crear usuarios para su propia empresa
        targetCompanyId = req.user?.companyId || null;
      }

      // Solo aplicar límite a roles que explícitamente tienen límite por empresa
      if (!ADMIN_ROLES_WITH_LIMIT.includes(newUserRole)) {
        // Rol no está en la lista de limitados (ej: rol desconocido), permitir
        return next();
      }

      // Si no hay companyId y el rol requiere límite, verificar si es rol externo permitido
      // Solo LSO puede crearse sin companyId (profesionales externos)
      const EXTERNAL_ROLES_ALLOWED = ['lso'];
      
      if (!targetCompanyId) {
        if (EXTERNAL_ROLES_ALLOWED.includes(newUserRole)) {
          // LSO externo puede crearse sin empresa
          return next();
        }
        // Otros roles limitados REQUIEREN una empresa
        return res.status(400).json({
          error: "Empresa requerida",
          message: "Este rol requiere estar asociado a una empresa.",
          role: newUserRole
        });
      }

      // Contar usuarios actuales de la empresa con el MISMO ROL
      const currentUsers = await storage.getUsersByCompany(targetCompanyId);
      const usersWithSameRole = currentUsers.filter(u => u.role === newUserRole);

      // Límite base: 1 usuario por rol incluido en el plan
      const baseLimit = 1;
      
      // Obtener asientos extra pagados para este rol
      let extraSeats = 0;
      try {
        const extraSeatData = await storage.getCompanyExtraSeatsByRole(targetCompanyId, newUserRole);
        if (extraSeatData) {
          extraSeats = extraSeatData.extraSeats;
        }
      } catch (e) {
        // Si falla, continuar sin asientos extra
        console.error('Error fetching extra seats:', e);
      }
      
      // Límite total = base + asientos extra pagados
      const totalLimit = baseLimit + extraSeats;

      // Verificar si ya existe un usuario con este rol que excede el límite
      if (usersWithSameRole.length >= totalLimit) {
        // Obtener nombre amigable del rol para el mensaje
        const roleNames: Record<string, string> = {
          'superusuario': 'Super Usuario',
          'responsable_sst': 'Responsable SST',
          'coordinador_sst': 'Coordinador SST',
          'coordinador_rrhh': 'Coordinador RRHH',
          'coordinador_salud': 'Coordinador de Salud Ocupacional',
          'jefe_personal': 'Jefe de Personal',
          'supervisor': 'Supervisor',
          'vigia_sst': 'Vigía SST',
          'auditor_interno': 'Auditor Interno SG-SST'
        };
        
        const roleName = roleNames[newUserRole] || newUserRole;
        const pricePerSeatCop = 10000; // $10,000 COP/mes por asiento
        
        return res.status(403).json({
          error: "Límite de usuarios por rol alcanzado",
          message: extraSeats > 0 
            ? `Ya tienes ${totalLimit} usuarios "${roleName}" (1 incluido + ${extraSeats} adicionales). Puedes comprar más asientos a $${pricePerSeatCop.toLocaleString('es-CO')} COP/mes.`
            : `Tu plan incluye 1 usuario "${roleName}" sin costo adicional. Puedes comprar asientos adicionales a $${pricePerSeatCop.toLocaleString('es-CO')} COP/mes.`,
          currentCount: usersWithSameRole.length,
          limit: totalLimit,
          baseLimit: baseLimit,
          extraSeats: extraSeats,
          role: newUserRole,
          roleName: roleName,
          pricePerSeatCop: pricePerSeatCop,
          upgradeRequired: true,
          canPurchase: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking user limit:', error);
      res.status(500).json({ error: "Failed to verify user limit" });
    }
  };
}

/**
 * Middleware que verifica si la operación excede el límite de empresas
 * 
 * NOTA: Este middleware NO está implementado funcionalmente porque la aplicación
 * actualmente no soporta multi-company por usuario. Cada usuario pertenece a UNA empresa.
 * 
 * Este middleware está aquí como placeholder para futuras implementaciones de:
 * - Multi-tenant organizations (un usuario admin gestiona múltiples empresas)
 * - Resellers/Partners que manejan múltiples clientes
 * 
 * Para implementar correctamente, se necesitaría:
 * 1. Una tabla "organizations" o similar que agrupe múltiples companies
 * 2. Relación many-to-many entre users y companies (o companies y organizations)
 * 3. Lógica para contar cuántas companies reales tiene un usuario/organización
 * 
 * Por ahora, este middleware simplemente retorna next() para permitir la operación.
 */
export function checkCompanyLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implementar cuando se agregue soporte multi-company
    // Por ahora, permitir todas las operaciones
    next();
  };
}

/**
 * Helper para verificar límites antes de operaciones masivas
 * Retorna true si la operación está permitida, false si excede límites
 */
export async function canAddWorkers(companyId: string, count: number): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number | null;
  remaining: number | null;
}> {
  const limits = await getCompanyLimits(companyId);
  const currentWorkers = await storage.getWorkers(companyId);
  const activeWorkers = currentWorkers.filter((w: Worker) => 
    w.status === 'activo' || w.status === 'inactivo'
  );

  // Si el plan permite trabajadores ilimitados
  if (limits.maxWorkers === null) {
    return {
      allowed: true,
      currentCount: activeWorkers.length,
      limit: null,
      remaining: null
    };
  }

  const remaining = limits.maxWorkers - activeWorkers.length;
  const allowed = count <= remaining;

  return {
    allowed,
    currentCount: activeWorkers.length,
    limit: limits.maxWorkers,
    remaining: Math.max(0, remaining)
  };
}

/**
 * Middleware genérico para verificar acceso a una feature específica del plan
 * 
 * @param featureKey - Clave de la feature a verificar (ej: 'hasPESV', 'hasAuditorias')
 * @param featureName - Nombre amigable de la feature para mensajes de error
 * @param requiredPlan - Plan mínimo requerido para acceder (opcional, para mensaje)
 */
export function checkFeatureAccess(
  featureKey: keyof Pick<SubscriptionLimits, 
    'hasIPERCCompleto' | 'hasAuditorias' | 'hasPESV' | 'hasRevisionDireccion' | 
    'hasGestionCambios' | 'hasMatrizLegal' | 'hasObjetivosIndicadores' | 
    'hasEvaluacionProveedores' | 'hasComunicacionSST' | 'hasAdquisicionesSST' | 
    'hasDashboardsEjecutivos' | 'hasPDFsNormativos' | 'hasExamenesMedicos' | 
    'hasMedicionesAmbientales' | 'hasSustanciasQuimicas' | 'hasCOPASST' | 
    'hasComiteConvivencia' | 'hasAPI' | 'hasExportacionMasiva' | 'hasWhiteLabel' | 
    'hasSLA' | 'hasGerenteCuenta' | 'hasConsultoriaSST'
  >,
  featureName: string,
  requiredPlan?: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(401).json({ 
          error: "Authentication required" 
        });
      }

      // Obtener límites/features del plan
      const limits = await getCompanyLimits(companyId);
      
      // Verificar si el plan tiene acceso a la feature
      if (!limits[featureKey]) {
        const upgradeMessage = requiredPlan 
          ? `Esta funcionalidad requiere el plan ${requiredPlan} o superior.`
          : `Esta funcionalidad no está disponible en su plan actual.`;
        
        return res.status(403).json({
          error: "Feature not available",
          message: `${featureName}: ${upgradeMessage} Por favor actualice su plan para acceder.`,
          feature: featureKey,
          requiredPlan,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error(`Error checking ${featureKey} access:`, error);
      res.status(500).json({ error: "Failed to verify feature access" });
    }
  };
}

// Middlewares específicos para features comunes (shortcuts)
export const checkPESVAccess = () => 
  checkFeatureAccess('hasPESV', 'Módulo PESV', 'Empresarial');

export const checkAuditoriasAccess = () => 
  checkFeatureAccess('hasAuditorias', 'Auditorías Internas SST', 'Profesional');

export const checkIPERCCompletoAccess = () => 
  checkFeatureAccess('hasIPERCCompleto', 'IPERC Completo con GTC-45', 'Profesional');

export const checkRevisionDireccionAccess = () => 
  checkFeatureAccess('hasRevisionDireccion', 'Revisión por Dirección', 'Empresarial');

export const checkExamenesMedicosAccess = () => 
  checkFeatureAccess('hasExamenesMedicos', 'Exámenes Médicos', 'Empresarial');

export const checkAPIAccess = () => 
  checkFeatureAccess('hasAPI', 'Acceso API REST', 'Empresarial');

export const checkWhiteLabelAccess = () => 
  checkFeatureAccess('hasWhiteLabel', 'White Label', 'Corporativo');

/**
 * Helper para obtener todas las features del plan de una empresa
 * Útil para mostrar en UI qué features están disponibles/bloqueadas
 */
export async function getCompanyFeatures(companyId: string): Promise<SubscriptionLimits> {
  return getCompanyLimits(companyId);
}
