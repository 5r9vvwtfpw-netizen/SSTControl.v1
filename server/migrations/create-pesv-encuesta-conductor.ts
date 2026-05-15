import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function createPesvEncuestaConductorTable() {
  try {
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pesv_encuestas_conductor'
      )
    `);

    if (tableExists.rows[0]?.exists) {
      console.log('✅ Tabla pesv_encuestas_conductor ya existe');
      return;
    }

    await db.execute(sql`
      CREATE TABLE pesv_encuestas_conductor (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        evaluacion_id VARCHAR REFERENCES evaluaciones_pesv(id) ON DELETE SET NULL,
        conductor_nombre VARCHAR NOT NULL,
        fecha_registro DATE NOT NULL,
        hora_registro VARCHAR NOT NULL,
        horas_sueno INTEGER NOT NULL,
        estado_fisico VARCHAR NOT NULL,
        estado_emocional VARCHAR NOT NULL,
        toma_medicamentos INTEGER NOT NULL DEFAULT 0,
        medicamentos_detalle TEXT,
        consumo_alcohol INTEGER NOT NULL DEFAULT 0,
        presenta_enfermedad INTEGER NOT NULL DEFAULT 0,
        enfermedad_detalle TEXT,
        resultado VARCHAR NOT NULL,
        registrado_por VARCHAR,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE INDEX idx_pesv_encuestas_conductor_company
      ON pesv_encuestas_conductor(company_id)
    `);

    await db.execute(sql`
      CREATE INDEX idx_pesv_encuestas_conductor_evaluacion
      ON pesv_encuestas_conductor(evaluacion_id)
    `);

    await db.execute(sql`
      CREATE INDEX idx_pesv_encuestas_conductor_fecha
      ON pesv_encuestas_conductor(fecha_registro DESC)
    `);

    console.log('✅ Tabla pesv_encuestas_conductor creada exitosamente');
  } catch (error: any) {
    console.error('❌ Error creando tabla pesv_encuestas_conductor:', error.message);
    throw error;
  }
}
