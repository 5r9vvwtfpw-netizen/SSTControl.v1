import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Migración: Soporte de inducción virtual para PESV
 * - Agrega valor 'pesv' al enum induction_type
 * - Agrega columna tipo_induccion a contenidos_induccion
 * - Agrega columna tipo_induccion a preguntas_induccion
 */
export async function syncInduccionPesv() {
  try {
    // 1. Agregar 'pesv' al enum (IF NOT EXISTS no disponible en ALTER TYPE,
    //    usamos un bloque DO para ignorar si ya existe)
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'pesv'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'induction_type')
        ) THEN
          ALTER TYPE induction_type ADD VALUE 'pesv';
        END IF;
      END;
      $$;
    `);
    console.log('[Migration] ✅ Valor "pesv" en enum induction_type listo');

    // 2. Columna tipo_induccion en contenidos_induccion
    await db.execute(sql`
      ALTER TABLE contenidos_induccion
        ADD COLUMN IF NOT EXISTS tipo_induccion varchar NOT NULL DEFAULT 'induccion';
    `);
    console.log('[Migration] ✅ Columna tipo_induccion en contenidos_induccion lista');

    // 3. Columna tipo_induccion en preguntas_induccion
    await db.execute(sql`
      ALTER TABLE preguntas_induccion
        ADD COLUMN IF NOT EXISTS tipo_induccion varchar NOT NULL DEFAULT 'induccion';
    `);
    console.log('[Migration] ✅ Columna tipo_induccion en preguntas_induccion lista');

  } catch (error: any) {
    console.error('[Migration] Error en sync-induccion-pesv:', error.message);
  }
}
