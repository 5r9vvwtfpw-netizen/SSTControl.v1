import { db } from "../db";

/**
 * Adds implementation status/date fields for route signage and control posts.
 * Historical routes remain unconfirmed until an authorized user reviews them.
 */
export async function syncPesvPreventionMeasureFields() {
  await db.execute(`
    ALTER TABLE safe_routes
      ADD COLUMN IF NOT EXISTS signage_implemented INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS control_implemented INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS control_implementation_date DATE
  `);
  console.log("✅ Campos de implementación de medidas preventivas PESV sincronizados");
}
