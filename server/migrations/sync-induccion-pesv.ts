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
    // 1. Agregar 'pesv' al enum.
    // ALTER TYPE ADD VALUE no puede correr dentro de un bloque DO/transacción en PostgreSQL;
    // se usa la sintaxis directa con IF NOT EXISTS (disponible desde PG 12).
    await db.execute(sql`ALTER TYPE induction_type ADD VALUE IF NOT EXISTS 'pesv'`);
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
