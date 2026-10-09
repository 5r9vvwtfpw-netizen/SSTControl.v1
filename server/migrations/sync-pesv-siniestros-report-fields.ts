import { db } from "../db";

/**
 * Adds the fields needed to classify PESV road-incident losses and connect
 * each incident to the existing committee meeting record that analyzed it.
 * New columns stay nullable so historical incidents are not assigned invented data.
 */
export async function syncPesvSiniestrosReportFields() {
  try {
    await db.execute(`
      ALTER TABLE road_incidents
        ADD COLUMN IF NOT EXISTS severe_injuries INTEGER,
        ADD COLUMN IF NOT EXISTS minor_injuries INTEGER,
        ADD COLUMN IF NOT EXISTS simple_collision_people INTEGER,
        ADD COLUMN IF NOT EXISTS ipat_authority_name TEXT,
        ADD COLUMN IF NOT EXISTS committee_acta_id VARCHAR
    `);

    await db.execute(`
      DO $$
      BEGIN
        IF to_regclass('public.actas_comite_pesv') IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'road_incidents_committee_acta_id_fkey'
              AND conrelid = 'road_incidents'::regclass
          )
        THEN
          ALTER TABLE road_incidents
            ADD CONSTRAINT road_incidents_committee_acta_id_fkey
            FOREIGN KEY (committee_acta_id)
            REFERENCES actas_comite_pesv(id)
            ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    console.log("✅ Campos PESV para informe de siniestros sincronizados");
  } catch (error: any) {
    console.error("❌ Error sincronizando campos del informe PESV:", error.message);
    throw error;
  }
}
