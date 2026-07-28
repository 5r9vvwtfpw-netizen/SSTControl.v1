import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Limpia acciones "Implementar: X" fantasma que quedaron en evaluaciones SST
 * cuando el sistema generó el plan automático ANTES de que se crearan las
 * acciones correctivas "Incumplimiento del Estándar X" vinculadas.
 *
 * Condición segura:
 *  - Solo borra acciones tipo_accion='preventiva', estado='pendiente',
 *    respuesta_estandar_id IS NULL, descripcion ILIKE 'Implementar: %'
 *  - Solo cuando la MISMA evaluacion ya tiene al menos una acción correctiva
 *    LINKED (respuesta_estandar_id NOT NULL) → confirma que las correctivas
 *    son el tracking real.
 */
export async function cleanupDuplicateImplementarAcciones() {
  try {
    const result = await db.execute(sql`
      DELETE FROM acciones_mejora am
      WHERE am.tipo_accion = 'preventiva'
        AND am.estado = 'pendiente'
        AND am.respuesta_estandar_id IS NULL
        AND am.descripcion_accion ILIKE 'Implementar: %'
        AND EXISTS (
          SELECT 1 FROM acciones_mejora am2
          WHERE am2.evaluacion_id = am.evaluacion_id
            AND am2.tipo_accion = 'correctiva'
            AND am2.respuesta_estandar_id IS NOT NULL
            AND am2.descripcion_accion ILIKE 'Incumplimiento del Estándar%'
        )
    `);
    const deleted = (result as any).rowCount ?? 0;
    if (deleted > 0) {
      console.log(`[Migration] ✅ Eliminadas ${deleted} acciones "Implementar:" duplicadas (ghost plan actions)`);
    } else {
      console.log('[Migration] ✅ No se encontraron acciones "Implementar:" duplicadas — nada que limpiar');
    }
  } catch (error: any) {
    console.error('[Migration] Error en cleanup de acciones duplicadas:', error.message);
  }
}
