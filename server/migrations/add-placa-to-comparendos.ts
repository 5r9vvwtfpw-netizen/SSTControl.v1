import { db } from "../db";
import { sql } from "drizzle-orm";

export async function addPlacaToComparendos() {
  console.log("[Migration] Sincronizando columna placa_vehiculo en driver_comparendos...");
  try {
    await db.execute(sql`
      ALTER TABLE driver_comparendos
      ADD COLUMN IF NOT EXISTS placa_vehiculo TEXT;
    `);
    console.log("[Migration] ✅ Columna placa_vehiculo sincronizada en driver_comparendos");
  } catch (error: any) {
    console.error("[Migration] Error placa_vehiculo:", error.message);
    throw error;
  }
}
