import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncWorkersPurchasedColumn() {
  console.log('[Migration] Sincronizando columna workers_purchased en subscriptions...');
  
  try {
    const checkColumn = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'subscriptions' AND column_name = 'workers_purchased'
    `);
    
    if (checkColumn.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS workers_purchased INTEGER DEFAULT 2
      `);
      console.log('[Migration] ✅ Columna workers_purchased agregada a subscriptions');
    } else {
      console.log('[Migration] ✅ Columna workers_purchased ya existe en subscriptions');
    }
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando workers_purchased:', error.message);
  }
}
