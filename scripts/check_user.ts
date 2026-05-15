import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const pool = new Pool({
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || "5432"),
    database: process.env.AWS_RDS_DATABASE || "postgres",
    user: process.env.AWS_RDS_USER || "postgres",
    password: process.env.AWS_RDS_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  const username = process.argv[2] || "juan_calle";

  // Buscar por username exacto, parcial, y email
  const r = await pool.query(
    `SELECT id, username, email, role, company_id, is_active, created_at,
            LENGTH(password) as pw_length,
            LEFT(password, 10) as pw_prefix
     FROM users
     WHERE username ILIKE $1 OR email ILIKE $1
     ORDER BY created_at DESC`,
    [`%${username}%`]
  );

  if (r.rows.length === 0) {
    console.log(`❌ No existe ningún usuario con username/email que contenga "${username}"`);
    
    // Buscar LSOs similares
    const lsos = await pool.query(
      `SELECT id, username, email, role, is_active FROM users WHERE role IN ('lso','lso_externo') ORDER BY created_at DESC LIMIT 20`
    );
    console.log(`\n=== LSOs en el sistema (${lsos.rows.length}) ===`);
    for (const u of lsos.rows) {
      console.log(`  [${u.role}] ${u.username} | ${u.email} | activo: ${u.is_active}`);
    }
  } else {
    console.log(`=== USUARIO ENCONTRADO (${r.rows.length}) ===`);
    for (const u of r.rows) {
      console.log(`  username:   ${u.username}`);
      console.log(`  email:      ${u.email}`);
      console.log(`  role:       ${u.role}`);
      console.log(`  company_id: ${u.company_id}`);
      console.log(`  is_active:  ${u.is_active}`);
      console.log(`  created_at: ${u.created_at}`);
      console.log(`  pw_length:  ${u.pw_length} chars`);
      console.log(`  pw_prefix:  ${u.pw_prefix}...`);
      console.log("");
    }
  }

  await pool.end();
}

main().catch(console.error);
