import { neon } from "@neondatabase/serverless";
import pg from "pg";

export async function ensureSchemaSync(): Promise<void> {
  console.log("[Schema Sync] Checking schema synchronization...");
  
  const hasAwsRds = !!(process.env.AWS_RDS_HOST && process.env.AWS_RDS_PASSWORD);
  
  let client: any;
  
  try {
    if (hasAwsRds) {
      const connectionString = `postgresql://${process.env.AWS_RDS_USER || 'postgres'}:${process.env.AWS_RDS_PASSWORD}@${process.env.AWS_RDS_HOST}:${process.env.AWS_RDS_PORT || '5432'}/${process.env.AWS_RDS_DATABASE || 'postgres'}`;
      
      const pool = new pg.Pool({ connectionString });
      client = await pool.connect();
      
      const checkColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'objetivos_sst' 
        AND column_name = 'porcentaje_avance'
      `);
      
      if (checkColumn.rows.length === 0) {
        console.log("[Schema Sync] Adding missing column 'porcentaje_avance' to objetivos_sst...");
        await client.query(`
          ALTER TABLE objetivos_sst 
          ADD COLUMN IF NOT EXISTS porcentaje_avance integer DEFAULT 0
        `);
        console.log("[Schema Sync] Column added successfully");
      } else {
        console.log("[Schema Sync] Column 'porcentaje_avance' already exists");
      }
      
      client.release();
      await pool.end();
    } else if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      
      const checkColumn = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'objetivos_sst' 
        AND column_name = 'porcentaje_avance'
      `;
      
      if (checkColumn.length === 0) {
        console.log("[Schema Sync] Adding missing column 'porcentaje_avance' to objetivos_sst...");
        await sql`
          ALTER TABLE objetivos_sst 
          ADD COLUMN IF NOT EXISTS porcentaje_avance integer DEFAULT 0
        `;
        console.log("[Schema Sync] Column added successfully");
      } else {
        console.log("[Schema Sync] Column 'porcentaje_avance' already exists");
      }
    }
    
    console.log("[Schema Sync] Schema synchronization complete");
  } catch (error) {
    console.error("[Schema Sync] Error during schema sync:", error);
  }
}
