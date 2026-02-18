import { db } from '../db';
import { sql } from 'drizzle-orm';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function createCertificacionesProfesionales() {
  console.log('[Migration] Sincronizando tabla certificaciones_profesionales...');

  try {
    if (!await tableExists('certificaciones_profesionales')) {
      await db.execute(sql`
        CREATE TABLE certificaciones_profesionales (
          id SERIAL PRIMARY KEY,
          titulo TEXT NOT NULL,
          descripcion TEXT,
          profesional_nombre TEXT NOT NULL,
          profesional_credenciales TEXT NOT NULL,
          profesional_licencia TEXT,
          archivo_url TEXT NOT NULL,
          archivo_nombre TEXT NOT NULL,
          fecha_emision DATE,
          uploaded_by VARCHAR REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
      console.log('[Migration] ✅ Tabla certificaciones_profesionales creada');
    } else {
      console.log('[Migration] ✅ Tabla certificaciones_profesionales ya existe');
    }
  } catch (error: any) {
    console.error('[Migration] Error creando certificaciones_profesionales:', error.message);
  }
}
