import { neon } from '@neondatabase/serverless';

/**
 * Sincroniza las columnas de cotización (quote) en companies
 * Para el flujo JWT quote-to-checkout desde landing page
 */
export async function syncQuoteColumns() {
  console.log('[Migration] Sincronizando columnas de cotización en companies...');

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const columns = [
      { name: 'quote_base_monthly_price', ddl: 'ALTER TABLE companies ADD COLUMN quote_base_monthly_price INTEGER' },
      { name: 'quote_current_period_price', ddl: 'ALTER TABLE companies ADD COLUMN quote_current_period_price INTEGER' },
      { name: 'quote_discount_duration_months', ddl: 'ALTER TABLE companies ADD COLUMN quote_discount_duration_months INTEGER' },
      { name: 'quote_coupon_code', ddl: 'ALTER TABLE companies ADD COLUMN quote_coupon_code TEXT' },
      { name: 'quote_referrer_id', ddl: 'ALTER TABLE companies ADD COLUMN quote_referrer_id TEXT' },
    ];

    for (const col of columns) {
      const exists = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = ${col.name}
      `;

      if (exists.length > 0) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en companies`);
        continue;
      }

      await sql(col.ddl);
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
