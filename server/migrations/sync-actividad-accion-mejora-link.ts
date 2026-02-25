import { pool } from "../db";

export async function syncActividadAccionMejoraLink() {
  const client = await pool.connect();
  try {
    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'actividades_plan_trabajo' AND column_name = 'accion_mejora_id'
    `);

    if (colCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE actividades_plan_trabajo
        ADD COLUMN accion_mejora_id VARCHAR REFERENCES acciones_mejora(id) ON DELETE SET NULL
      `);
      console.log('✅ Columna accion_mejora_id agregada a actividades_plan_trabajo');
    }
  } finally {
    client.release();
  }
}
