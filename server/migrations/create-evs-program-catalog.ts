import { db } from "../db";
import { sql } from "drizzle-orm";

const EVS_PROGRAM_CATALOG = [
  {
    code: "PREVENCION_TABAQUISMO",
    name: "Prevención del consumo de tabaco",
    description: "Prevención del consumo de tabaco, promoción de espacios libres de humo y apoyo a la cesación.",
    normativeBasis: "Resolución 0312 de 2019, Estándar 3.1.7; Ley 1335 de 2009.",
    isRequired: true,
    isOther: false,
    sortOrder: 10,
  },
  {
    code: "PREVENCION_ALCOHOL",
    name: "Prevención del consumo de alcohol",
    description: "Prevención del consumo problemático de alcohol y de sus efectos en la seguridad y salud en el trabajo.",
    normativeBasis: "Resolución 0312 de 2019, Estándar 3.1.7; Decreto 1072 de 2015, SG-SST.",
    isRequired: true,
    isOther: false,
    sortOrder: 20,
  },
  {
    code: "PREVENCION_SPA",
    name: "Prevención del consumo de sustancias psicoactivas",
    description: "Prevención, detección temprana, orientación y remisión frente al consumo de sustancias psicoactivas.",
    normativeBasis: "Resolución 0312 de 2019, Estándar 3.1.7; Ley 1566 de 2012.",
    isRequired: true,
    isOther: false,
    sortOrder: 30,
  },
  {
    code: "ACTIVIDAD_FISICA_PAUSAS_ACTIVAS",
    name: "Promoción de la actividad física y pausas activas",
    description: "Actividad física en el entorno laboral, pausas activas, movilidad y prevención del sedentarismo.",
    normativeBasis: "Decreto 1072 de 2015, SG-SST; Resolución 0312 de 2019; lineamientos MinSalud sobre actividad física y pausas activas.",
    isRequired: false,
    isOther: false,
    sortOrder: 40,
  },
  {
    code: "ALIMENTACION_RIESGO_CARDIOMETABOLICO",
    name: "Alimentación saludable y prevención del riesgo cardiovascular y metabólico",
    description: "Promoción de hábitos alimentarios saludables y prevención de factores de riesgo cardiovascular, obesidad y enfermedades crónicas.",
    normativeBasis: "Ley 1355 de 2009; Decreto 1072 de 2015, SG-SST; Resolución 0312 de 2019.",
    isRequired: false,
    isOther: false,
    sortOrder: 50,
  },
  {
    code: "SALUD_MENTAL_ESTRES",
    name: "Promoción de la salud mental y prevención del estrés laboral",
    description: "Promoción del bienestar mental, prevención e intervención de factores de riesgo psicosocial y manejo del estrés.",
    normativeBasis: "Resolución 2646 de 2008; Resolución 2404 de 2019; Resolución 0312 de 2019.",
    isRequired: false,
    isOther: false,
    sortOrder: 60,
  },
  {
    code: "SUENO_FATIGA",
    name: "Higiene del sueño y prevención de la fatiga",
    description: "Educación en higiene del sueño, recuperación y prevención de la fatiga asociada al trabajo.",
    normativeBasis: "Decreto 1072 de 2015, gestión de peligros y promoción de la salud; lineamientos de prevención de fatiga laboral.",
    isRequired: false,
    isOther: false,
    sortOrder: 70,
  },
  {
    code: "CONSERVACION_VISUAL_AUDITIVA",
    name: "Conservación visual y auditiva",
    description: "Promoción del cuidado visual y auditivo y prevención de alteraciones relacionadas con las condiciones de trabajo.",
    normativeBasis: "Decreto 1072 de 2015, identificación y control de peligros; Resolución 0312 de 2019.",
    isRequired: false,
    isOther: false,
    sortOrder: 80,
  },
  {
    code: "OTRO",
    name: "Otro",
    description: "Programa específico definido por la empresa que no está incluido en el catálogo estándar.",
    normativeBasis: "Definido por la empresa según su diagnóstico de condiciones de salud y riesgos prioritarios.",
    isRequired: false,
    isOther: true,
    sortOrder: 999,
  },
];

export async function createEvsProgramCatalog() {
  console.log("[Migration] Creando y cargando catálogo maestro de programas EVS...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS evs_program_catalog (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(80) NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        normative_basis TEXT NOT NULL,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        is_other BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    for (const item of EVS_PROGRAM_CATALOG) {
      await db.execute(sql`
        INSERT INTO evs_program_catalog (
          code, name, description, normative_basis,
          is_required, is_other, sort_order, is_active, updated_at
        ) VALUES (
          ${item.code}, ${item.name}, ${item.description}, ${item.normativeBasis},
          ${item.isRequired}, ${item.isOther}, ${item.sortOrder}, TRUE, NOW()
        )
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          normative_basis = EXCLUDED.normative_basis,
          is_required = EXCLUDED.is_required,
          is_other = EXCLUDED.is_other,
          sort_order = EXCLUDED.sort_order,
          is_active = TRUE,
          updated_at = NOW()
      `);
    }

    console.log(`[Migration] ✅ Catálogo EVS listo (${EVS_PROGRAM_CATALOG.length} opciones).`);
  } catch (error: any) {
    console.error("[Migration] Error cargando catálogo EVS:", error.message);
    throw error;
  }
}