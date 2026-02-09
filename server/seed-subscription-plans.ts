import { db } from "./db";
import { subscriptionPlans } from "@shared/schema";
import { eq } from "drizzle-orm";
import logger from "./lib/logger";

export const DYNAMIC_PLAN_ID = "sst_dinamico";

const SUBSCRIPTION_PLANS = [
  {
    id: DYNAMIC_PLAN_ID,
    name: "sst_dinamico",
    displayName: "SST Colombia - Precio Dinámico",
    description: "Plan único con precio calculado dinámicamente según código CIIU, nivel de riesgo ARL, número de trabajadores y vehículos. Incluye todas las funcionalidades SST y PESV.",
    tagline: "Precio personalizado según tu empresa",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "COP",
    maxWorkers: -1,
    maxUsers: -1,
    maxCompanies: 1,
    maxSedes: -1,
    storageGB: 50,
    features: [
      "Gestión completa de trabajadores",
      "Registro de accidentes e incidentes",
      "Capacitaciones SST",
      "Inspecciones y auditorías",
      "IPERC completo con GTC-45",
      "Módulo PESV completo",
      "Matriz legal",
      "Objetivos e indicadores SST",
      "Portal del Trabajador incluido",
      "Portal del Licenciado SST incluido",
      "Documentos y PDFs normativos",
      "Compatible ISO 45001:2018"
    ],
    hasIPERCCompleto: 1,
    hasAuditorias: 1,
    hasPESV: 1,
    hasRevisionDireccion: 1,
    hasGestionCambios: 1,
    hasMatrizLegal: 1,
    hasObjetivosIndicadores: 1,
    hasEvaluacionProveedores: 1,
    hasComunicacionSST: 1,
    hasAdquisicionesSST: 1,
    hasDashboardsEjecutivos: 1,
    hasPDFsNormativos: 1,
    hasExamenesMedicos: 1,
    hasMedicionesAmbientales: 1,
    hasSustanciasQuimicas: 1,
    hasCOPASST: 1,
    hasComiteConvivencia: 1,
    hasAPI: 1,
    hasExportacionMasiva: 1,
    hasWhiteLabel: 0,
    hasSLA: 0,
    hasGerenteCuenta: 0,
    hasConsultoriaSST: 0,
    horasConsultoriaMes: 0,
    supportLevel: "chat_email",
    supportResponseTime: "24h",
    capacitacionesAnuales: 0,
    horasPorCapacitacion: 0,
    trialDays: 7,
    status: "active" as const,
    isRecommended: 1,
    sortOrder: 0,
  },
];

const DEPRECATED_PLAN_IDS = ["microempresa", "pequena", "mediana", "grande"];

export async function seedSubscriptionPlans(): Promise<void> {
  try {
    logger.info("Verificando planes de suscripcion en la base de datos...");
    
    for (const plan of SUBSCRIPTION_PLANS) {
      const existing = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, plan.id))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(subscriptionPlans).values(plan);
        logger.info(`Plan de suscripcion creado: ${plan.displayName} (${plan.id})`);
      } else {
        await db.update(subscriptionPlans)
          .set({ status: "active" })
          .where(eq(subscriptionPlans.id, plan.id));
        logger.info(`Plan de suscripcion verificado: ${plan.displayName} (${plan.id})`);
      }
    }
    
    for (const deprecatedId of DEPRECATED_PLAN_IDS) {
      const existing = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, deprecatedId))
        .limit(1);
      
      if (existing.length > 0 && existing[0].status === "active") {
        await db.update(subscriptionPlans)
          .set({ status: "archived" })
          .where(eq(subscriptionPlans.id, deprecatedId));
        logger.info(`Plan deprecado archivado: ${deprecatedId} (modelo Token>Calculo - precios vienen del JWT de la landing page)`);
      }
    }
    
    const activePlans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.status, "active"));
    logger.info(`Total planes activos en BD: ${activePlans.length}`);
    
  } catch (error) {
    logger.error({ err: error }, "Error al gestionar planes de suscripcion");
    throw error;
  }
}
