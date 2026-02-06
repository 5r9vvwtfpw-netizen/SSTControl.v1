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
async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `);
  return (result as any).rows?.[0]?.exists === true;
}

export async function syncPesvEvaluationColumns(): Promise<void> {
  console.log('[Migration] Sincronizando columnas de evaluación PESV...');
  
  try {
    const evalTableExists = await tableExists('evaluaciones_pesv');
    if (evalTableExists) {
      console.log('[Migration] Ejecutando ALTER TABLE para parent_evaluacion_id en evaluaciones_pesv...');
      await db.execute(sql`
        ALTER TABLE evaluaciones_pesv 
        ADD COLUMN IF NOT EXISTS parent_evaluacion_id VARCHAR
      `);
      console.log('[Migration] ✅ Columna parent_evaluacion_id verificada/agregada en evaluaciones_pesv');
    } else {
      console.log('[Migration] ⏭️ Tabla evaluaciones_pesv no existe aún, se creará con db:push. Saltando ALTER.');
    }

    const viTableExists = await tableExists('vehicle_inspections');
    if (viTableExists) {
      console.log('[Migration] Ejecutando ALTER TABLE para evaluacion_pesv_id en vehicle_inspections...');
      await db.execute(sql`
        ALTER TABLE vehicle_inspections 
        ADD COLUMN IF NOT EXISTS evaluacion_pesv_id VARCHAR
      `);
      console.log('[Migration] ✅ Columna evaluacion_pesv_id verificada/agregada en vehicle_inspections');
    } else {
      console.log('[Migration] ⏭️ Tabla vehicle_inspections no existe aún, saltando ALTER.');
    }

    const riTableExists = await tableExists('road_incidents');
    if (riTableExists) {
      console.log('[Migration] Ejecutando ALTER TABLE para evaluacion_pesv_id en road_incidents...');
      await db.execute(sql`
        ALTER TABLE road_incidents 
        ADD COLUMN IF NOT EXISTS evaluacion_pesv_id VARCHAR
      `);
      console.log('[Migration] ✅ Columna evaluacion_pesv_id verificada/agregada en road_incidents');
    } else {
      console.log('[Migration] ⏭️ Tabla road_incidents no existe aún, saltando ALTER.');
    }

    const rstTableExists = await tableExists('road_safety_trainings');
    if (rstTableExists) {
      console.log('[Migration] Ejecutando ALTER TABLE para evaluacion_pesv_id en road_safety_trainings...');
      await db.execute(sql`
        ALTER TABLE road_safety_trainings 
        ADD COLUMN IF NOT EXISTS evaluacion_pesv_id VARCHAR
      `);
      console.log('[Migration] ✅ Columna evaluacion_pesv_id verificada/agregada en road_safety_trainings');
    } else {
      console.log('[Migration] ⏭️ Tabla road_safety_trainings no existe aún, saltando ALTER.');
    }

    console.log('[Migration] Creando índices para consultas filtradas por evaluación...');
    if (viTableExists) {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_evaluacion_pesv 
        ON vehicle_inspections(evaluacion_pesv_id) 
        WHERE evaluacion_pesv_id IS NOT NULL
      `);
    }
    if (riTableExists) {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_road_incidents_evaluacion_pesv 
        ON road_incidents(evaluacion_pesv_id) 
        WHERE evaluacion_pesv_id IS NOT NULL
      `);
    }
    if (rstTableExists) {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_road_safety_trainings_evaluacion_pesv 
        ON road_safety_trainings(evaluacion_pesv_id) 
        WHERE evaluacion_pesv_id IS NOT NULL
      `);
    }
    console.log('[Migration] ✅ Índices de evaluación PESV creados/verificados');

    console.log('[Migration] ✅ Todas las columnas de evaluación PESV sincronizadas correctamente');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas PESV:', error.message);
    console.error('[Migration] Stack:', error.stack);
  }
}
