import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const host = process.env.AWS_RDS_HOST;
const password = process.env.AWS_RDS_PASSWORD;
const user = process.env.AWS_RDS_USER || 'postgres';
const port = parseInt(process.env.AWS_RDS_PORT || '5432');
const database = process.env.AWS_RDS_DATABASE || 'postgres';

if (!host || !password) {
  console.error("AWS_RDS_HOST and AWS_RDS_PASSWORD are required");
  process.exit(1);
}

async function main() {
  console.log("Connecting to AWS RDS...");
  
  const pool = new pg.Pool({
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const db = drizzle(pool);
  
  try {
    // Test connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Connected to AWS RDS successfully");
    
    // 1. Add porcentaje_avance column to objetivos_sst
    console.log("\n[1] Checking column 'porcentaje_avance' in objetivos_sst...");
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'objetivos_sst' 
      AND column_name = 'porcentaje_avance'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log("   Adding column 'porcentaje_avance'...");
      await db.execute(sql`
        ALTER TABLE objetivos_sst 
        ADD COLUMN IF NOT EXISTS porcentaje_avance integer DEFAULT 0
      `);
      console.log("   ✅ Column 'porcentaje_avance' added");
    } else {
      console.log("   ✅ Column 'porcentaje_avance' already exists");
    }
    
    // 2. Create objetivos_estandares_vinculacion table
    console.log("\n[2] Checking table 'objetivos_estandares_vinculacion'...");
    const checkTable = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'objetivos_estandares_vinculacion'
    `);
    
    if (checkTable.rows.length === 0) {
      console.log("   Creating table 'objetivos_estandares_vinculacion'...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS objetivos_estandares_vinculacion (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          company_id VARCHAR(255) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          objetivo_id VARCHAR(255) NOT NULL REFERENCES objetivos_sst(id) ON DELETE CASCADE,
          estandar_id VARCHAR(255) NOT NULL REFERENCES sst_standards(id) ON DELETE CASCADE,
          peso INTEGER DEFAULT 100,
          notas TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(objetivo_id, estandar_id)
        )
      `);
      console.log("   ✅ Table 'objetivos_estandares_vinculacion' created");
      
      // Create indexes
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vinculacion_company 
        ON objetivos_estandares_vinculacion(company_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vinculacion_objetivo 
        ON objetivos_estandares_vinculacion(objetivo_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vinculacion_estandar 
        ON objetivos_estandares_vinculacion(estandar_id)
      `);
      console.log("   ✅ Indexes created");
    } else {
      console.log("   ✅ Table 'objetivos_estandares_vinculacion' already exists");
    }
    
    console.log("\n🎉 Schema synchronization complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
