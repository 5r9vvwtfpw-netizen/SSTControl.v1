import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncEppDeliveryGroups() {
  console.log('[Migration] Sincronizando agrupación de actas de entrega EPP...');

  try {
    await db.execute(sql`
      ALTER TABLE epp_deliveries
      ADD COLUMN IF NOT EXISTS delivery_group_id VARCHAR
    `);
    await db.execute(sql`
      UPDATE epp_deliveries
      SET delivery_group_id = id
      WHERE delivery_group_id IS NULL
    `);
    await db.execute(sql`
      ALTER TABLE epp_deliveries
      ALTER COLUMN delivery_group_id SET DEFAULT gen_random_uuid()
    `);
    await db.execute(sql`
      ALTER TABLE epp_deliveries
      ALTER COLUMN delivery_group_id SET NOT NULL
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_epp_deliveries_group
      ON epp_deliveries (delivery_group_id)
    `);
    console.log('[Migration] ✅ Actas EPP agrupadas y registros anteriores conservados');
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando actas EPP:', error.message);
    throw error;
  }
}