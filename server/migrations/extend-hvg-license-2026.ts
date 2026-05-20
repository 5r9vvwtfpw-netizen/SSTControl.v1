import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Extiende la suscripción de HVG Seguridad Laboral (NIT: 166803278)
 * al 31 de diciembre de 2026, sin costo, como licencia gratuita.
 * Idempotente: solo actúa si el current_period_end es anterior a esa fecha.
 */
export async function extendHvgLicense2026() {
  try {
    const result = await db.execute(sql`
      UPDATE subscriptions s
      SET
        status            = 'active',
        current_period_end = '2026-12-31 23:59:59'::timestamp,
        next_payment_date  = '2026-12-31 23:59:59'::timestamp,
        cancel_at_period_end = 0,
        updated_at        = now()
      FROM companies c
      WHERE s.company_id = c.id
        AND (c.nit LIKE '%166803278%' OR c.name ILIKE '%hvg seguridad laboral%')
        AND s.current_period_end < '2026-12-31 23:59:59'::timestamp
    `);

    const count = (result as any).rowCount ?? 0;
    if (count > 0) {
      console.log('[Migration] ✅ Suscripción de HVG Seguridad Laboral extendida hasta el 31/12/2026');
    } else {
      console.log('[Migration] ✅ HVG Seguridad Laboral: suscripción ya estaba al día (sin cambios)');
    }
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error al extender licencia HVG:', error.message);
  }
}
