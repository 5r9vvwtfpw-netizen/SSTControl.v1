import { db } from '../db';
import { sql } from 'drizzle-orm';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = ${tableName}
    ) as exists
  `);
  return (result.rows[0] as any).exists;
}

export async function createPesvFatigaAlcoholTables() {
  try {
    console.log('[PESV H09/H10] Checking fatiga/alcohol tables...');

    const fatigaExists = await tableExists('pesv_fatiga_registros');
    if (!fatigaExists) {
      await db.execute(sql`
        CREATE TABLE pesv_fatiga_registros (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          evaluacion_id VARCHAR REFERENCES evaluaciones_pesv(id) ON DELETE SET NULL,
          conductor_nombre VARCHAR NOT NULL,
          fecha_registro DATE NOT NULL,
          tipo_control VARCHAR NOT NULL,
          resultado VARCHAR NOT NULL,
          horas_conduccion INTEGER,
          descanso_cumplido INTEGER DEFAULT 0,
          medidas_tomadas TEXT,
          responsable VARCHAR,
          observaciones TEXT,
          created_at TIMESTAMP DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX idx_pesv_fatiga_company ON pesv_fatiga_registros(company_id)
      `);
      await db.execute(sql`
        CREATE INDEX idx_pesv_fatiga_evaluacion ON pesv_fatiga_registros(evaluacion_id)
      `);
      console.log('[PESV H09/H10] Created table: pesv_fatiga_registros');
    } else {
      console.log('[PESV H09/H10] Table pesv_fatiga_registros already exists');
    }

    const alcoholExists = await tableExists('pesv_alcohol_registros');
    if (!alcoholExists) {
      await db.execute(sql`
        CREATE TABLE pesv_alcohol_registros (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          evaluacion_id VARCHAR REFERENCES evaluaciones_pesv(id) ON DELETE SET NULL,
          conductor_nombre VARCHAR NOT NULL,
          fecha_registro DATE NOT NULL,
          tipo_prueba VARCHAR NOT NULL,
          sustancia_controlada VARCHAR NOT NULL,
          resultado VARCHAR NOT NULL,
          medidas_tomadas TEXT,
          responsable VARCHAR,
          observaciones TEXT,
          created_at TIMESTAMP DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE INDEX idx_pesv_alcohol_company ON pesv_alcohol_registros(company_id)
      `);
      await db.execute(sql`
        CREATE INDEX idx_pesv_alcohol_evaluacion ON pesv_alcohol_registros(evaluacion_id)
      `);
      console.log('[PESV H09/H10] Created table: pesv_alcohol_registros');
    } else {
      console.log('[PESV H09/H10] Table pesv_alcohol_registros already exists');
    }

    console.log('[PESV H09/H10] Migration completed successfully');
  } catch (error: any) {
    console.error('[PESV H09/H10] Migration error:', error.message);
  }
}
