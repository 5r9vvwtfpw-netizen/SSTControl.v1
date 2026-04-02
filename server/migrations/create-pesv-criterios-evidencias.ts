import { sql } from 'drizzle-orm';
import { db } from '../db';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `);
  return (result as any).rows?.[0]?.exists === true;
}

export async function createPesvCriteriosEvidencias(): Promise<void> {
  console.log('[PESV Criterios] Checking PESV criterios/evidencias tables...');

  try {
    const criteriosExists = await tableExists('pesv_criterios_verificacion');
    if (!criteriosExists) {
      await db.execute(sql`
        CREATE TABLE pesv_criterios_verificacion (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          evaluacion_id VARCHAR NOT NULL REFERENCES evaluaciones_pesv(id) ON DELETE CASCADE,
          respuesta_paso_id VARCHAR REFERENCES respuestas_pasos_pesv(id) ON DELETE CASCADE,
          paso_id VARCHAR NOT NULL,
          criterio_index INTEGER NOT NULL,
          criterio_texto TEXT NOT NULL,
          verificado INTEGER NOT NULL DEFAULT 0,
          verificado_por VARCHAR,
          verificado_nombre VARCHAR,
          fecha_verificacion TIMESTAMP,
          observacion TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('[PESV Criterios] Created table: pesv_criterios_verificacion');

      await db.execute(sql`
        CREATE INDEX idx_pesv_criterios_evaluacion ON pesv_criterios_verificacion(evaluacion_id)
      `);
      await db.execute(sql`
        CREATE INDEX idx_pesv_criterios_paso ON pesv_criterios_verificacion(evaluacion_id, paso_id)
      `);
      console.log('[PESV Criterios] Created indexes for pesv_criterios_verificacion');
    } else {
      console.log('[PESV Criterios] Table pesv_criterios_verificacion already exists');
    }

    const evidenciasExists = await tableExists('pesv_evidencias_documentos');
    if (!evidenciasExists) {
      await db.execute(sql`
        CREATE TABLE pesv_evidencias_documentos (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          evaluacion_id VARCHAR NOT NULL REFERENCES evaluaciones_pesv(id) ON DELETE CASCADE,
          respuesta_paso_id VARCHAR REFERENCES respuestas_pasos_pesv(id) ON DELETE CASCADE,
          paso_id VARCHAR NOT NULL,
          evidencia_index INTEGER NOT NULL,
          evidencia_texto TEXT NOT NULL,
          archivo_url TEXT,
          archivo_nombre TEXT,
          archivo_tipo VARCHAR,
          archivo_tamanio INTEGER,
          subido_por VARCHAR,
          subido_nombre VARCHAR,
          fecha_subida TIMESTAMP,
          observacion TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('[PESV Criterios] Created table: pesv_evidencias_documentos');

      await db.execute(sql`
        CREATE INDEX idx_pesv_evidencias_evaluacion ON pesv_evidencias_documentos(evaluacion_id)
      `);
      await db.execute(sql`
        CREATE INDEX idx_pesv_evidencias_paso ON pesv_evidencias_documentos(evaluacion_id, paso_id)
      `);
      console.log('[PESV Criterios] Created indexes for pesv_evidencias_documentos');
    } else {
      console.log('[PESV Criterios] Table pesv_evidencias_documentos already exists');
    }

    console.log('[PESV Criterios] Migration completed successfully');
  } catch (error: any) {
    console.error('[PESV Criterios] Migration error:', error.message);
  }
}
