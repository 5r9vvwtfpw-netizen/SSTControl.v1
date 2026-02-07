/**
 * Feature Gate Middleware - Control de acceso por suscripción basado en rutas
 * 
 * Este middleware intercepta requests a rutas de módulos premium ANTES de que
 * lleguen a los handlers existentes en routes.ts, verificando que la empresa
 * tenga acceso a la funcionalidad según su plan de suscripción.
 * 
 * Principio de Código Seguro: Solo agrega nuevo código, no modifica rutas existentes.
 * Se registra como app.use() ANTES de registerRoutes() en server/index.ts.
 * 
 * Flujo:
 * 1. Verifica si la ruta coincide con un módulo premium
 * 2. Si no coincide, pasa al siguiente middleware (next())
 * 3. Si coincide, verifica autenticación (req.user)
 * 4. Consulta los features del plan de la empresa
 * 5. Si tiene acceso, continúa; si no, retorna 403 con mensaje de upgrade
 */

import type { Request, Response, NextFunction } from "express";
import type { SubscriptionLimits } from "./subscription-limits";

type FeatureKey = keyof Pick<SubscriptionLimits,
  'hasIPERCCompleto' | 'hasAuditorias' | 'hasPESV' | 'hasRevisionDireccion' |
  'hasGestionCambios' | 'hasMatrizLegal' | 'hasObjetivosIndicadores' |
  'hasEvaluacionProveedores' | 'hasComunicacionSST' | 'hasAdquisicionesSST' |
  'hasDashboardsEjecutivos' | 'hasPDFsNormativos' | 'hasExamenesMedicos' |
  'hasMedicionesAmbientales' | 'hasSustanciasQuimicas' | 'hasCOPASST' |
  'hasComiteConvivencia'
>;

interface FeatureGateRule {
  pathPrefix: string;
  featureKey: FeatureKey;
  featureName: string;
  requiredPlan: string;
}

const FEATURE_GATE_RULES: FeatureGateRule[] = [
  { pathPrefix: "/api/vehicles", featureKey: "hasPESV", featureName: "Módulo PESV - Vehículos", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/drivers", featureKey: "hasPESV", featureName: "Módulo PESV - Conductores", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/vehicle-inspections", featureKey: "hasPESV", featureName: "Módulo PESV - Inspecciones Vehiculares", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/road-incidents", featureKey: "hasPESV", featureName: "Módulo PESV - Siniestros Viales", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/road-safety-trainings", featureKey: "hasPESV", featureName: "Módulo PESV - Capacitaciones Viales", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/evaluaciones-pesv", featureKey: "hasPESV", featureName: "Módulo PESV - Evaluaciones", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/pesv-audits", featureKey: "hasPESV", featureName: "Módulo PESV - Auditorías PESV", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/riesgos-viales", featureKey: "hasPESV", featureName: "Módulo PESV - Riesgos Viales", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/riesgos-vinculacion", featureKey: "hasPESV", featureName: "Módulo PESV - Vinculación Riesgos", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/pesv-indicadores", featureKey: "hasPESV", featureName: "Módulo PESV - Indicadores", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/pesv-comite", featureKey: "hasPESV", featureName: "Módulo PESV - Comité", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/pesv-factores", featureKey: "hasPESV", featureName: "Módulo PESV - Factores Desempeño", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/acciones-mejora-pesv", featureKey: "hasPESV", featureName: "Módulo PESV - Mejora Continua", requiredPlan: "Pequeña Empresa" },
  { pathPrefix: "/api/revisiones-direccion-pesv", featureKey: "hasPESV", featureName: "Módulo PESV - Revisión Dirección", requiredPlan: "Pequeña Empresa" },

  { pathPrefix: "/api/auditorias-internas", featureKey: "hasAuditorias", featureName: "Auditorías Internas SST", requiredPlan: "Pequeña Empresa" },

  { pathPrefix: "/api/revisiones-direccion", featureKey: "hasRevisionDireccion", featureName: "Revisión por la Dirección", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/matriz-legal", featureKey: "hasMatrizLegal", featureName: "Matriz Legal", requiredPlan: "Pequeña Empresa" },

  { pathPrefix: "/api/objetivos-sst", featureKey: "hasObjetivosIndicadores", featureName: "Objetivos e Indicadores SST", requiredPlan: "Pequeña Empresa" },

  { pathPrefix: "/api/comunicacion-sst", featureKey: "hasComunicacionSST", featureName: "Comunicación SST", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/adquisiciones-sst", featureKey: "hasAdquisicionesSST", featureName: "Adquisiciones SST", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/gestion-cambios", featureKey: "hasGestionCambios", featureName: "Gestión de Cambios", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/examenes-medicos", featureKey: "hasExamenesMedicos", featureName: "Exámenes Médicos Ocupacionales", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/evaluacion-proveedores", featureKey: "hasEvaluacionProveedores", featureName: "Evaluación de Proveedores", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/mediciones-ambientales", featureKey: "hasMedicionesAmbientales", featureName: "Mediciones Ambientales", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/sustancias-quimicas", featureKey: "hasSustanciasQuimicas", featureName: "Sustancias Químicas", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/comunicaciones-sst", featureKey: "hasComunicacionSST", featureName: "Comunicaciones SST", requiredPlan: "Mediana Empresa" },
  { pathPrefix: "/api/plan-comunicacion-sst", featureKey: "hasComunicacionSST", featureName: "Plan de Comunicación SST", requiredPlan: "Mediana Empresa" },
  { pathPrefix: "/api/lecturas-comunicacion", featureKey: "hasComunicacionSST", featureName: "Lecturas de Comunicación SST", requiredPlan: "Mediana Empresa" },

  { pathPrefix: "/api/examenes-medicos-ocu", featureKey: "hasExamenesMedicos", featureName: "Exámenes Médicos Ocupacionales", requiredPlan: "Mediana Empresa" },
];

const GLOBAL_ACCESS_ROLES = ["superadmin", "admin", "soporte"];

export function featureGateMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestPath = req.path;

    if (!requestPath.startsWith("/api/")) {
      return next();
    }

    const matchedRule = FEATURE_GATE_RULES.find(rule =>
      requestPath === rule.pathPrefix || requestPath.startsWith(rule.pathPrefix + "/")
    );

    if (!matchedRule) {
      return next();
    }

    if (!req.user) {
      return next();
    }

    const userRole = (req.user as any).role;
    if (GLOBAL_ACCESS_ROLES.includes(userRole)) {
      return next();
    }

    const companyId = (req.user as any).companyId || (req.user as any).adminCompanyId;
    if (!companyId) {
      return next();
    }

    try {
      const { getCompanyFeatures } = await import("./subscription-limits");
      const features = await getCompanyFeatures(companyId);

      if (!features[matchedRule.featureKey]) {
        return res.status(403).json({
          error: "Feature not available",
          message: `${matchedRule.featureName}: Esta funcionalidad requiere el plan ${matchedRule.requiredPlan} o superior. Por favor actualice su plan para acceder.`,
          feature: matchedRule.featureKey,
          requiredPlan: matchedRule.requiredPlan,
          upgradeRequired: true,
        });
      }

      return next();
    } catch (error) {
      console.error(`[FeatureGate] Error checking ${matchedRule.featureKey} for company ${companyId}:`, error);
      return next();
    }
  };
}
