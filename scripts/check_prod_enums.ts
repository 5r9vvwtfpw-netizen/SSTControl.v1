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

  const enums = [
    "estado_plan_trabajo", "evaluation_status", "politica_sst_estado",
    "inspection_status", "risk_class", "standard_type", "designation_status",
    "health_condition_status", "contract_status_v2", "medical_exam_status",
    "training_status", "worker_status"
  ];

  for (const e of enums) {
    const r = await pool.query(
      `SELECT enumlabel FROM pg_enum WHERE enumtypid=(SELECT oid FROM pg_type WHERE typname='${e}') ORDER BY enumsortorder`
    );
    const vals = r.rows.map((x: any) => x.enumlabel);
    console.log(`${e}: [${vals.join(", ")}]`);
  }
  await pool.end();
}

main().catch(console.error);
