import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createNgoOnboardedCompanies() {
  console.log('[Migration] Sincronizando tabla ngo_onboarded_companies...');

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ngo_onboarded_companies (
        id SERIAL PRIMARY KEY,
        sidecar_company_id VARCHAR(100) NOT NULL,
        sidecar_invite_id VARCHAR(100) NOT NULL UNIQUE,
        ngo_id VARCHAR(100) NOT NULL,
        project_id VARCHAR(100) NOT NULL,
        project_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_email VARCHAR(255) NOT NULL,
        ciio TEXT,
        city TEXT,
        region TEXT,
        employees_count INTEGER,
        risk_level VARCHAR(10),
        consultant_name TEXT NOT NULL,
        consultant_email VARCHAR(255) NOT NULL,
        consultant_sidecar_id VARCHAR(100) NOT NULL,
        lso_email VARCHAR(255),
        lso_name TEXT,
        lso_mode VARCHAR(20),
        lso_sidecar_id VARCHAR(100),
        lso_local_record_id INTEGER,
        coupon_code TEXT,
        onboarded_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ngo_company_email ON ngo_onboarded_companies(company_email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ngo_company_project ON ngo_onboarded_companies(project_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ngo_company_invite ON ngo_onboarded_companies(sidecar_invite_id)`);

    console.log('[Migration] ✅ Tabla ngo_onboarded_companies sincronizada');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Tabla ngo_onboarded_companies ya existe');
    } else {
      throw error;
    }
  }
}
