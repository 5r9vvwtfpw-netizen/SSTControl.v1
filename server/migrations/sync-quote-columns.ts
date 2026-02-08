import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Sincroniza las columnas de cotización (quote) en companies
 * Para el flujo JWT quote-to-checkout desde landing page
 * Usa la instancia db compartida para funcionar tanto en Neon (dev) como AWS RDS (prod)
 */
export async function syncQuoteColumns() {
  console.log('[Migration] Sincronizando columnas de cotización en companies...');

  try {
    const columns = [
      { name: 'quote_base_monthly_price', type: 'INTEGER' },
      { name: 'quote_current_period_price', type: 'INTEGER' },
      { name: 'quote_discount_duration_months', type: 'INTEGER' },
      { name: 'quote_coupon_code', type: 'TEXT' },
      { name: 'quote_referrer_id', type: 'TEXT' },
    ];

    for (const col of columns) {
      const result = await db.execute(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'companies' AND column_name = ${col.name}`
      );

      const rows = Array.isArray(result) ? result : (result as any).rows || [];
      if (rows.length > 0) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en companies`);
        continue;
      }

      await db.execute(sql.raw(`ALTER TABLE companies ADD COLUMN ${col.name} ${col.type}`));
      console.log(`[Migration] ✅ Columna ${col.name} agregada a companies`);
    }

    console.log('[Migration] ✅ Todas las columnas de cotización sincronizadas en companies');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columnas de cotización ya existen en companies');
      return;
    }
    console.error('[Migration] ⚠️ Error sincronizando columnas de cotización:', error.message);
    throw error;
  }
}
