import { db } from '../db';
import { sql } from 'drizzle-orm';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

async function enumExists(enumName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT typname FROM pg_type WHERE typname = ${enumName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function createSstSpeedAlerts() {
  console.log('[Migration] Creando tabla sst_speed_alerts...');

  try {
    if (!await enumExists('speed_alert_severity')) {
      await db.execute(sql`CREATE TYPE speed_alert_severity AS ENUM ('leve', 'moderada', 'grave', 'critica')`);
      console.log('[Migration] Enum speed_alert_severity creado');
    }

    if (!await enumExists('speed_alert_status')) {
      await db.execute(sql`CREATE TYPE speed_alert_status AS ENUM ('abierta', 'en_revision', 'cerrada', 'accion_correctiva')`);
      console.log('[Migration] Enum speed_alert_status creado');
    }

    if (!await tableExists('sst_speed_alerts')) {
      await db.execute(sql`
        CREATE TABLE sst_speed_alerts (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id),
          vehicle_id VARCHAR NOT NULL REFERENCES vehicles(id),
          driver_id VARCHAR REFERENCES drivers(id),
          gps_tracking_id VARCHAR REFERENCES vehicle_gps_tracking(id),
          alert_date DATE NOT NULL,
          alert_time TEXT,
          registered_speed INTEGER NOT NULL,
          max_allowed_speed INTEGER NOT NULL,
          speed_difference INTEGER NOT NULL,
          latitude TEXT,
          longitude TEXT,
          severity speed_alert_severity NOT NULL,
          status speed_alert_status NOT NULL DEFAULT 'abierta',
          source TEXT NOT NULL DEFAULT 'manual',
          corrective_action TEXT,
          responsible_person TEXT,
          closed_at TIMESTAMP,
          closed_by VARCHAR,
          observations TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
      console.log('[Migration] Tabla sst_speed_alerts creada exitosamente');
    } else {
      console.log('[Migration] Tabla sst_speed_alerts ya existe');
    }

  } catch (error) {
    console.error('[Migration] Error creando sst_speed_alerts:', error);
  }
}
