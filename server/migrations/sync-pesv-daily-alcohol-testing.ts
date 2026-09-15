import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncPesvDailyAlcoholTesting() {
  await db.execute(sql`
    ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS daily_alcohol_testing_enabled INTEGER NOT NULL DEFAULT 0
  `);

  await db.execute(sql`
    ALTER TABLE pesv_encuestas_conductor
    ADD COLUMN IF NOT EXISTS resultado_alcoholimetria TEXT,
    ADD COLUMN IF NOT EXISTS declaracion_no_alcohol_confirmada INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS declaracion_no_alcohol_confirmada_at TIMESTAMP
  `);

  console.log('✅ Configuración y registro diario de alcoholimetría sincronizados');
}