import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Migration: Add evaluation-centric columns to PESV tables
 * 
 * Supports the PESV restructuring where all modules are managed within annual evaluations:
 * - parentEvaluacionId: Enables evaluation inheritance (2025 → 2026)
 * - evaluacionPesvId: Links inspections, incidents, and trainings to annual evaluations
 * 
 * All columns are nullable to preserve existing data
 */
export async function syncPesvEvaluationColumns(): Promise<void> {
  console.log('[Migration] Sincronizando columnas de evaluación PESV...');
  
  try {
    console.log('[Migration] Ejecutando ALTER TABLE para parent_evaluacion_id en evaluaciones_pesv...');
    await db.execute(sql`
      ALTER TABLE evaluaciones_pesv 
      ADD COLUMN IF NOT EXISTS parent_evaluacion_id VARCHAR
    `);
    console.log('[Migration] ✅ Columna parent_evaluacion_id verificada/agregada en evaluaciones_pesv');

    console.log('[Migration] Ejecutando ALTER TABLE para evaluacion_pesv_id en vehicle_inspections...');
    await db.execute(sql`
      ALTER TABLE vehicle_inspections 
      ADD COLUMN IF NOT EXISTS evaluacion_pesv_id VARCHAR
    `);
    console.log('[Migration] ✅ Columna evaluacion_pesv_id verificada/agregada en vehicle_inspections');

    console.log('[Migration] Ejecutando ALTER TABLE para evaluacion_pesv_id en road_incidents...');
    await db.execute(sql`
      ALTER TABLE road_incidents 
      ADD COLUMN IF NOT EXISTS evaluacion_pesv_id VARCHAR
    `);
    console.log('[Migration] ✅ Columna evaluacion_pesv_id verificada/agregada en road_incidents');

    console.log('[Migration] Ejecutando ALTER TABLE para evaluacion_pesv_id en road_safety_trainings...');
    await db.execute(sql`
      ALTER TABLE road_safety_trainings 
      ADD COLUMN IF NOT EXISTS evaluacion_pesv_id VARCHAR
    `);
    console.log('[Migration] ✅ Columna evaluacion_pesv_id verificada/agregada en road_safety_trainings');

    console.log('[Migration] Creando índices para consultas filtradas por evaluación...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_evaluacion_pesv 
      ON vehicle_inspections(evaluacion_pesv_id) 
      WHERE evaluacion_pesv_id IS NOT NULL
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_road_incidents_evaluacion_pesv 
      ON road_incidents(evaluacion_pesv_id) 
      WHERE evaluacion_pesv_id IS NOT NULL
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_road_safety_trainings_evaluacion_pesv 
      ON road_safety_trainings(evaluacion_pesv_id) 
      WHERE evaluacion_pesv_id IS NOT NULL
    `);
    console.log('[Migration] ✅ Índices de evaluación PESV creados/verificados');

    console.log('[Migration] ✅ Todas las columnas de evaluación PESV sincronizadas correctamente');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas PESV:', error.message);
    console.error('[Migration] Stack:', error.stack);
  }
}
