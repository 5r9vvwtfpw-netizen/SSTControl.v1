import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Adds the minimum structure needed to prove the 6.1.3 management review:
 * a restricted Alta Dirección role and a durable link to the SST evaluation.
 * Every statement is idempotent because this runs during application startup.
 */
export async function syncManagementReviewControls() {
  try {
    await db.execute(sql.raw(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'alta_direccion'`));
    await db.execute(sql.raw(`
      ALTER TABLE revisiones_direccion
        ADD COLUMN IF NOT EXISTS evaluacion_sst_id varchar,
        ADD COLUMN IF NOT EXISTS estandar_referencia text DEFAULT '6.1.3'
    `));
    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'revisiones_direccion_evaluacion_sst_id_fkey'
        ) THEN
          ALTER TABLE revisiones_direccion
            ADD CONSTRAINT revisiones_direccion_evaluacion_sst_id_fkey
            FOREIGN KEY (evaluacion_sst_id) REFERENCES evaluaciones_sst(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `));
    await db.execute(sql.raw(`
      UPDATE revisiones_direccion
      SET estandar_referencia = '6.1.3'
      WHERE estandar_referencia IS NULL
    `));
    console.log("[Migration] ✅ Controles de revisión por dirección sincronizados");
  } catch (error: any) {
    console.log("[Migration] ℹ️ Management review controls sync:", error.message);
  }
}