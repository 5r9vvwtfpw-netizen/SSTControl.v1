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

  // 1. Estado de todas las salas
  console.log("=== ESTADO SALAS ===");
  const rooms = await pool.query(
    `SELECT room_id, company_id, demo_username, status, expires_at, last_reset_at, updated_at, error_message
     FROM demo_room_bookings ORDER BY room_id`
  );
  for (const r of rooms.rows) {
    const exp = r.expires_at ? new Date(r.expires_at).toISOString() : "null";
    const reset = r.last_reset_at ? new Date(r.last_reset_at).toISOString() : "nunca";
    console.log(`  ${r.room_id} | ${r.status.padEnd(10)} | expira: ${exp} | último reset: ${reset}`);
    if (r.error_message) console.log(`    ⚠️  error: ${r.error_message}`);
  }

  // 2. Datos en demo-company-room-001 (el que usa demo1)
  const roomCompanyId = "demo-company-room-001";
  console.log(`\n=== DATOS EN ${roomCompanyId} ===`);
  const tables = ["workers", "trainings", "contracts", "medical_exams", "accidents", "inspections"];
  for (const t of tables) {
    const r = await pool.query(`SELECT COUNT(*) as c FROM ${t} WHERE company_id = $1`, [roomCompanyId]);
    console.log(`  ${t}: ${r.rows[0].c}`);
  }

  // 3. Datos en golden master
  const GM = "demo-golden-master";
  console.log(`\n=== DATOS EN GOLDEN MASTER (${GM}) ===`);
  for (const t of tables) {
    const r = await pool.query(`SELECT COUNT(*) as c FROM ${t} WHERE company_id = $1`, [GM]);
    console.log(`  ${t}: ${r.rows[0].c}`);
  }

  // 4. Usuario demo1
  console.log("\n=== USUARIO DEMO1 ===");
  const user = await pool.query(
    `SELECT id, username, role, company_id, created_at FROM users WHERE username = 'demo1'`
  );
  if (user.rows.length > 0) {
    const u = user.rows[0];
    console.log(`  username: ${u.username}, role: ${u.role}, company_id: ${u.company_id}`);
  } else {
    console.log("  No existe usuario demo1");
  }

  await pool.end();
}

main().catch(console.error);
