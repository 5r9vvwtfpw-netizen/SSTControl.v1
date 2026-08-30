import { pool } from "../db";

export async function syncConvivenciaActasAttachmentColumns(): Promise<void> {
  try {
    await pool.query(`
      ALTER TABLE convivencia_actas
      ADD COLUMN IF NOT EXISTS archivo_adjunto_url TEXT,
      ADD COLUMN IF NOT EXISTS archivo_adjunto_nombre TEXT
    `);
    console.log("[Migration] Columnas de adjuntos COCOLAB sincronizadas");
  } catch (error: any) {
    console.error("[Migration] Error sincronizando adjuntos COCOLAB:", error.message);
    throw error;
  }
}