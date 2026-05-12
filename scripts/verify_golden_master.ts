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

  const GM = "demo-golden-master";
  const tables = [
    "workers", "trainings", "medical_exams", "accidents",
    "inspections", "contracts", "afiliaciones_ssss", "sst_evaluations",
    "job_profiles", "planes_trabajo_anual", "politicas_sst",
    "resource_allocations", "responsible_designations", "health_conditions",
  ];

  console.log("=== GOLDEN MASTER DATA ===");
  for (const t of tables) {
    const r = await pool.query(`SELECT COUNT(*) as c FROM ${t} WHERE company_id = $1`, [GM]);
    console.log(`  ${t}: ${r.rows[0].c}`);
  }

  const evalR = await pool.query(
    `SELECT total_score, max_total_score, compliance_percentage, status FROM sst_evaluations WHERE company_id = $1`,
    [GM]
  );
  if (evalR.rows.length > 0) {
    const ev = evalR.rows[0];
    console.log(`\n  Evaluación: ${ev.total_score}/${ev.max_total_score} = ${ev.compliance_percentage}% (${ev.status})`);
  }

  console.log("\n=== SALAS DEMO ===");
  const rooms = await pool.query(`SELECT room_id, status, last_reset_at FROM demo_room_bookings ORDER BY room_id`);
  for (const r of rooms.rows) {
    const reset = r.last_reset_at ? r.last_reset_at.toISOString().split("T")[0] : "nunca";
    console.log(`  ${r.room_id}: ${r.status} (último reset: ${reset})`);
  }

  await pool.end();
}

main().catch(console.error);
