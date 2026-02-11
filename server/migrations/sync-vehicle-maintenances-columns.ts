import { db } from '../db';
import { sql } from 'drizzle-orm';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName} AND column_name = ${columnName}`
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

export async function syncVehicleMaintenancesColumns() {
  console.log('[Migration] Sincronizando columnas en vehicle_maintenances...');

  try {
    const columns = [
      { name: 'parts_replaced', type: 'TEXT' },
      { name: 'observations', type: 'TEXT' },
      { name: 'document_url', type: 'TEXT' },
      { name: 'evaluacion_pesv_id', type: 'VARCHAR' },
    ];

    for (const col of columns) {
      if (await columnExists('vehicle_maintenances', col.name)) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en vehicle_maintenances`);
        continue;
      }

      await db.execute(sql.raw(`ALTER TABLE vehicle_maintenances ADD COLUMN ${col.name} ${col.type}`));
      console.log(`[Migration] ✅ Columna ${col.name} agregada a vehicle_maintenances`);
    }

    console.log('[Migration] ✅ Todas las columnas sincronizadas en vehicle_maintenances');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columnas ya existen en vehicle_maintenances');
      return;
    }
    console.error('[Migration] Error sincronizando columnas en vehicle_maintenances:', error.message);
    throw error;
  }

  try {
    if (!await enumExists('engine_status')) {
      await db.execute(sql`CREATE TYPE engine_status AS ENUM ('encendido', 'apagado', 'ralenti')`);
      console.log('[Migration] ✅ Enum engine_status creado');
    } else {
      console.log('[Migration] ✅ Enum engine_status ya existe');
    }

    if (!await tableExists('vehicle_gps_tracking')) {
      await db.execute(sql`
        CREATE TABLE vehicle_gps_tracking (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          company_id VARCHAR NOT NULL REFERENCES companies(id),
          vehicle_id VARCHAR NOT NULL REFERENCES vehicles(id),
          driver_id VARCHAR REFERENCES drivers(id),
          tracking_date DATE NOT NULL,
          tracking_time TEXT,
          latitude TEXT,
          longitude TEXT,
          speed INTEGER,
          max_speed_allowed INTEGER,
          speed_exceeded INTEGER NOT NULL DEFAULT 0,
          engine_status engine_status,
          geofence_alert INTEGER NOT NULL DEFAULT 0,
          alert_type TEXT,
          observations TEXT,
          evaluacion_pesv_id VARCHAR,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vehicle_gps_tracking_company ON vehicle_gps_tracking(company_id)`);
      console.log('[Migration] ✅ Tabla vehicle_gps_tracking creada');
    } else {
      console.log('[Migration] ✅ Tabla vehicle_gps_tracking ya existe');
    }

    if (!await enumExists('route_type')) {
      await db.execute(sql`CREATE TYPE route_type AS ENUM ('urbana', 'rural', 'mixta', 'autopista')`);
      console.log('[Migration] ✅ Enum route_type creado');
    }
    if (!await enumExists('safe_route_risk_level')) {
      await db.execute(sql`CREATE TYPE safe_route_risk_level AS ENUM ('bajo', 'medio', 'alto', 'muy_alto')`);
      console.log('[Migration] ✅ Enum safe_route_risk_level creado');
    }

    if (!await tableExists('safe_routes')) {
      await db.execute(sql`
        CREATE TABLE safe_routes (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          company_id VARCHAR NOT NULL REFERENCES companies(id),
          route_name TEXT NOT NULL,
          origin TEXT NOT NULL,
          destination TEXT NOT NULL,
          distance INTEGER,
          estimated_time INTEGER,
          route_type route_type NOT NULL,
          risk_level safe_route_risk_level NOT NULL DEFAULT 'medio',
          critical_points TEXT,
          speed_limits TEXT,
          rest_stops TEXT,
          emergency_contacts TEXT,
          restrictions TEXT,
          map_url TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          observations TEXT,
          evaluacion_pesv_id VARCHAR,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_safe_routes_company ON safe_routes(company_id)`);
      console.log('[Migration] ✅ Tabla safe_routes creada');
    } else {
      console.log('[Migration] ✅ Tabla safe_routes ya existe');
    }
  } catch (error: any) {
    console.error('[Migration] Error creando tablas PESV adicionales:', error.message);
  }
}
