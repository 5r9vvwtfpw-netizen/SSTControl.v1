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
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando columnas de onboarding:', error.message);
  }
}
