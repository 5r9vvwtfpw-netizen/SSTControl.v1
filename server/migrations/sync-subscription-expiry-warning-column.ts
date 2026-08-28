import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncSubscriptionExpiryWarningColumn() {
  console.log('[Migration] Sincronizando columna de aviso de vencimiento en subscriptions...');

  try {
    await db.execute(sql`
      ALTER TABLE subscriptions
      ADD COLUMN IF NOT EXISTS last_expiry_warning_period_end TIMESTAMP
    `);
    console.log('[Migration] ✅ Columna last_expiry_warning_period_end verificada/agregada');
  } catch (error: any) {
    console.error(
      '[Migration] ⚠️ Error sincronizando last_expiry_warning_period_end:',
      error.message,
    );
    throw error;
  }
}