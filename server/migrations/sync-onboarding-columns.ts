import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncOnboardingColumns() {
  console.log('[Migration] Sincronizando columnas de onboarding en companies...');

  try {
    // Agregar onboarding_completed si no existe
    const checkCompleted = await db.execute(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'companies' AND column_name = 'onboarding_completed'
    `);

    if (checkCompleted.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed INTEGER NOT NULL DEFAULT 0
      `);
      // Las empresas existentes en producción ya usaban el sistema — marcarlas como liberadas
      await db.execute(sql`
        UPDATE companies SET onboarding_completed = 1 WHERE onboarding_completed = 0
      `);
      console.log('[Migration] ✅ Columna onboarding_completed agregada y empresas existentes liberadas');
    } else {
      console.log('[Migration] ✅ Columna onboarding_completed ya existe en companies');
    }

    // Agregar onboarding_completed_at si no existe
    const checkAt = await db.execute(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'companies' AND column_name = 'onboarding_completed_at'
    `);

    if (checkAt.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP
      `);
      console.log('[Migration] ✅ Columna onboarding_completed_at agregada a companies');
    } else {
      console.log('[Migration] ✅ Columna onboarding_completed_at ya existe en companies');
    }

    await db.execute(sql`
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS welcome_dismissed_at TIMESTAMP
    `);
    console.log('[Migration] ✅ Columna welcome_dismissed_at verificada en companies');

    // Un desbloqueo realizado antes de desplegar este cambio también debe
    // ocultar el aviso, sin alterar el estado real de inducción de la empresa.
    await db.execute(sql`
      UPDATE companies AS c
      SET welcome_dismissed_at = unlocks.last_unlocked_at
      FROM (
        SELECT company_id, MAX(timestamp) AS last_unlocked_at
        FROM audit_logs
        WHERE entity_type = 'subscription'
          AND user_role = 'superadmin'
          AND description LIKE 'Admin changed subscription status from % to active'
        GROUP BY company_id
      ) AS unlocks
      WHERE c.id = unlocks.company_id
        AND c.welcome_dismissed_at IS NULL
        AND c.onboarding_completed = 0
    `);
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando columnas de onboarding:', error.message);
  }
}
