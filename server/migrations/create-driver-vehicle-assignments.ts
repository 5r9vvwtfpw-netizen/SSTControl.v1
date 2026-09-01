import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createDriverVehicleAssignmentsTable() {
  console.log("[Migration] Verificando tabla driver_vehicle_assignments...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS driver_vehicle_assignments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        driver_id VARCHAR NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
        vehicle_id VARCHAR NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE,
        is_active INTEGER NOT NULL DEFAULT 1,
        observations TEXT,
        assigned_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT driver_vehicle_assignments_active_check CHECK (is_active IN (0, 1)),
        CONSTRAINT driver_vehicle_assignments_date_check CHECK (end_date IS NULL OR end_date >= start_date)
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS driver_vehicle_assignments_driver_active_idx
      ON driver_vehicle_assignments(company_id, driver_id, is_active);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS driver_vehicle_assignments_vehicle_active_idx
      ON driver_vehicle_assignments(company_id, vehicle_id, is_active);
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS driver_vehicle_assignments_unique_active_idx
      ON driver_vehicle_assignments(company_id, driver_id, vehicle_id)
      WHERE is_active = 1;
    `);

    console.log("[Migration] ✅ Tabla driver_vehicle_assignments verificada/creada");
  } catch (error: any) {
    console.error("[Migration] Error en driver_vehicle_assignments:", error.message);
    throw error;
  }
}