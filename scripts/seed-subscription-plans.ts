import { db } from "../server/db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Seed de los 4 planes de suscripción competitivos basados en investigación de mercado SST Colombia 2025
 * - Esencial: $199K COP/mes (micro 1-10)
 * - Profesional: $499K COP/mes (pequeñas 11-50) ⭐ MÁS POPULAR
 * - Empresarial: $999K COP/mes (medianas 51-200)
 * - Corporativo: $1.99M COP/mes (grandes 200+)
 */
export async function seedSubscriptionPlans() {
  try {
    console.log("📦 Verificando planes de suscripción...");

    // Verificar si la tabla existe
    try {
      const tableCheck = await db.execute(sql`SELECT to_regclass('public.subscription_plans')`);
      if (!tableCheck.rows[0]?.to_regclass) {
        console.log("⚠️ Tabla 'subscription_plans' no existe. Ejecuta 'npm run db:push' primero.");
        return;
      }
    } catch (e) {
      console.log("⚠️ No se pudo verificar la tabla subscription_plans. Base de datos podría no estar lista.");
      return;
    }

    // Definir los 4 planes competitivos
    const plans = [
      // PLAN 1: ESENCIAL
      {
        name: "esencial",
        displayName: "Plan Esencial",
        tagline: "Ideal para microempresas (1-10 trabajadores)",
        description: "Plan básico con módulos esenciales para cumplimiento SST. Perfecto para microempresas que inician su gestión de seguridad laboral.",
        priceMonthly: 19900000, // $199,000 COP (en centavos)
        priceYearly: 199000000, // $1,990,000 COP (equivalente a 10 meses, 2 gratis)
        currency: "COP",
        maxWorkers: 10,
        maxUsers: 3,
        maxCompanies: 1,
        maxSedes: 1,
        storageGB: 5,
        features: [
          "Gestión de trabajadores y contratos",
          "Capacitaciones con asistente inteligente (50+ temas)",
          "Inspecciones con checklist predefinidos (20+ tipos)",
          "Registro de accidentes e incidentes",
          "Matriz IPERC simplificada (GTC-45)",
          "Políticas SST con generación automatizada",
          "Reportes básicos para Ministerio de Trabajo",
          "Portal de empleados",
          "Soporte por email (48h respuesta)",
        ],
        hasIPERCCompleto: 0,
        hasAuditorias: 0,
        hasPESV: 0,
        hasRevisionDireccion: 0,
        hasGestionCambios: 0,
        hasMatrizLegal: 0,
        hasObjetivosIndicadores: 0,
        hasEvaluacionProveedores: 0,
        hasComunicacionSST: 0,
        hasAdquisicionesSST: 0,
        hasDashboardsEjecutivos: 0,
        hasPDFsNormativos: 0,
        hasExamenesMedicos: 0,
        hasMedicionesAmbientales: 0,
        hasSustanciasQuimicas: 0,
        hasCOPASST: 0,
        hasComiteConvivencia: 0,
        hasAPI: 0,
        hasExportacionMasiva: 0,
        hasWhiteLabel: 0,
        hasSLA: 0,
        hasGerenteCuenta: 0,
        hasConsultoriaSST: 0,
        horasConsultoriaMes: 0,
        supportLevel: "email",
        supportResponseTime: "48h",
        capacitacionesAnuales: 0,
        horasPorCapacitacion: 0,
        trialDays: 30,
        status: "active" as const,
        isPopular: 0,
        isRecommended: 0,
        sortOrder: 1,
      },

      // PLAN 2: PROFESIONAL (⭐ MÁS POPULAR)
      {
        name: "profesional",
        displayName: "Plan Profesional",
        tagline: "Ideal para pequeñas empresas (11-50 trabajadores)",
        description: "Plan completo con automatización inteligente y dashboards ejecutivos. Reemplaza un consultor SST full-time por 90% menos costo.",
        priceMonthly: 49900000, // $499,000 COP
        priceYearly: 499000000, // $4,990,000 COP (equivalente a 10 meses)
        currency: "COP",
        maxWorkers: 50,
        maxUsers: 10,
        maxCompanies: 1,
        maxSedes: 3,
        storageGB: 20,
        features: [
          "✅ TODO de Plan Esencial +",
          "IPERC completo con asistente GTC-45 (60+ peligros)",
          "Auditorías Internas SST con templates",
          "Gestión de Cambios automatizada",
          "Matriz Legal actualizada automáticamente",
          "Objetivos e Indicadores SST (cálculo automático)",
          "Evaluación de Proveedores y Contratistas",
          "Comunicación SST (tableros, carteleras)",
          "Adquisiciones SST",
          "Dashboards ejecutivos PHVA (HACER, VERIFICAR, ACTUAR)",
          "Generación automática de PDFs normativos",
          "Soporte prioritario (chat + email, 24h respuesta)",
        ],
        hasIPERCCompleto: 1,
        hasAuditorias: 1,
        hasPESV: 0,
        hasRevisionDireccion: 0,
        hasGestionCambios: 1,
        hasMatrizLegal: 1,
        hasObjetivosIndicadores: 1,
        hasEvaluacionProveedores: 1,
        hasComunicacionSST: 1,
        hasAdquisicionesSST: 1,
        hasDashboardsEjecutivos: 1,
        hasPDFsNormativos: 1,
        hasExamenesMedicos: 0,
        hasMedicionesAmbientales: 0,
        hasSustanciasQuimicas: 0,
        hasCOPASST: 0,
        hasComiteConvivencia: 0,
        hasAPI: 0,
        hasExportacionMasiva: 0,
        hasWhiteLabel: 0,
        hasSLA: 0,
        hasGerenteCuenta: 0,
        hasConsultoriaSST: 0,
        horasConsultoriaMes: 0,
        supportLevel: "chat_email",
        supportResponseTime: "24h",
        capacitacionesAnuales: 0,
        horasPorCapacitacion: 0,
        trialDays: 45,
        status: "active" as const,
        isPopular: 1, // ⭐ PLAN MÁS POPULAR
        isRecommended: 1,
        sortOrder: 2,
      },

      // PLAN 3: EMPRESARIAL
      {
        name: "empresarial",
        displayName: "Plan Empresarial",
        tagline: "Ideal para medianas empresas (51-200 trabajadores)",
        description: "Plan avanzado con PESV completo, múltiples sedes y capacitación incluida. 60% más económico que ISOTools con funcionalidades superiores.",
        priceMonthly: 99900000, // $999,000 COP
        priceYearly: 999000000, // $9,990,000 COP (equivalente a 10 meses)
        currency: "COP",
        maxWorkers: 200,
        maxUsers: 25,
        maxCompanies: 1,
        maxSedes: 5,
        storageGB: 100,
        features: [
          "✅ TODO de Plan Profesional +",
          "PESV completo (vehículos, conductores, inspecciones, siniestros)",
          "Revisión por Dirección (ISO 45001:2018)",
          "Exámenes médicos y vigilancia epidemiológica",
          "Mediciones ambientales (ruido, iluminación, temperatura)",
          "Gestión de sustancias químicas",
          "COPASST (actas, elecciones, reuniones)",
          "Comité de Convivencia (actas, casos)",
          "Múltiples sedes (hasta 5)",
          "API REST para integraciones",
          "Exportación masiva de datos (Excel, CSV)",
          "Soporte telefónico dedicado (12h respuesta)",
          "Capacitación virtual incluida (2 sesiones/año, 4h c/u)",
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
        supportLevel: "phone",
        supportResponseTime: "12h",
        capacitacionesAnuales: 2,
        horasPorCapacitacion: 4,
        trialDays: 60,
        status: "active" as const,
        isPopular: 0,
        isRecommended: 0,
        sortOrder: 3,
      },

      // PLAN 4: CORPORATIVO
      {
        name: "corporativo",
        displayName: "Plan Corporativo",
        tagline: "Ideal para grandes empresas (+200 trabajadores)",
        description: "Plan premium con trabajadores ilimitados, white-label, SLA 99.9% y consultoría SST incluida. 70% más económico que soluciones internacionales.",
        priceMonthly: 199900000, // $1,999,000 COP
        priceYearly: 1999000000, // $19,990,000 COP (equivalente a 10 meses)
        currency: "COP",
        maxWorkers: -1, // Ilimitado
        maxUsers: -1, // Ilimitado
        maxCompanies: 1,
        maxSedes: -1, // Ilimitado
        storageGB: 500,
        features: [
          "✅ TODO de Plan Empresarial +",
          "Trabajadores ilimitados",
          "Sedes ilimitadas",
          "Usuarios administradores ilimitados",
          "Personalización de módulos y campos",
          "White-label (marca propia, logo, colores)",
          "SLA garantizado 99.9% (uptime)",
          "Backups diarios automáticos (retención 90 días)",
          "Disaster Recovery Plan",
          "Gerente de cuenta dedicado",
          "Capacitación presencial (4 sesiones/año, 8h c/u)",
          "Consultoría SST incluida (4 horas/mes con profesional licenciado)",
          "Integración con ERPs corporativos (SAP, Oracle, Dynamics)",
          "Single Sign-On (SSO) SAML/OAuth",
          "Auditoría de logs completa",
          "Soporte 24/7 (teléfono, chat, email)",
          "Prioridad en roadmap de producto",
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
        hasWhiteLabel: 1,
        hasSLA: 1,
        hasGerenteCuenta: 1,
        hasConsultoriaSST: 1,
        horasConsultoriaMes: 4,
        supportLevel: "24_7",
        supportResponseTime: "2h",
        capacitacionesAnuales: 4,
        horasPorCapacitacion: 8,
        trialDays: 90,
        status: "active" as const,
        isPopular: 0,
        isRecommended: 0,
        sortOrder: 4,
      },
    ];

    // Insertar o actualizar cada plan
    for (const plan of plans) {
      // Verificar si el plan ya existe
      const existingPlan = await db
        .select()
        .from(schema.subscriptionPlans)
        .where(eq(schema.subscriptionPlans.name, plan.name))
        .limit(1);

      if (existingPlan.length > 0) {
        // Actualizar plan existente
        await db
          .update(schema.subscriptionPlans)
          .set({
            ...plan,
            updatedAt: new Date(),
          })
          .where(eq(schema.subscriptionPlans.name, plan.name));
        console.log(`✅ Plan "${plan.displayName}" actualizado`);
      } else {
        // Insertar nuevo plan
        await db.insert(schema.subscriptionPlans).values(plan);
        console.log(`✅ Plan "${plan.displayName}" creado`);
      }
    }

    console.log("\n🎉 Planes de suscripción seedeados exitosamente:");
    console.log("   1. Esencial: $199K/mes (1-10 trabajadores) - Trial 30 días");
    console.log("   2. Profesional: $499K/mes (11-50 trabajadores) - Trial 45 días ⭐");
    console.log("   3. Empresarial: $999K/mes (51-200 trabajadores) - Trial 60 días");
    console.log("   4. Corporativo: $1.99M/mes (200+ trabajadores) - Trial 90 días");
    console.log("\n💰 Ventaja competitiva: 70% más económico que competencia tradicional");
  } catch (error) {
    console.error("⚠️ Error al seedear planes de suscripción:", error);
    console.log("   Ejecuta 'npm run db:push' si la tabla no existe.");
  }
}

// Ejecutar seed si se llama directamente
seedSubscriptionPlans()
  .then(() => {
    console.log("✅ Seed completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  });
