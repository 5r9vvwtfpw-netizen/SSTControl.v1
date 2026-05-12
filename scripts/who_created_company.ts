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

  const name = "Soluciones Integrales Demo SAS";

  // 1. Find the company
  const compR = await pool.query(
    `SELECT id, name, nit, created_at FROM companies WHERE name ILIKE $1`,
    [`%${name}%`]
  );
  if (compR.rows.length === 0) {
    console.log("Empresa no encontrada con ese nombre.");
    await pool.end();
    return;
  }
  const company = compR.rows[0];
  console.log(`\n=== EMPRESA ===`);
  console.log(`ID:         ${company.id}`);
  console.log(`Nombre:     ${company.name}`);
  console.log(`NIT:        ${company.nit}`);
  console.log(`Creada:     ${company.created_at}`);

  // 2. Users linked to this company
  const usersR = await pool.query(
    `SELECT id, username, email, role, created_at FROM users WHERE company_id = $1 ORDER BY created_at`,
    [company.id]
  );
  console.log(`\n=== USUARIOS VINCULADOS (${usersR.rows.length}) ===`);
  for (const u of usersR.rows) {
    console.log(`  ${u.role.padEnd(16)} | ${u.email || u.username} | creado: ${u.created_at}`);
  }

  // 3. Audit logs for this company
  const auditR = await pool.query(
    `SELECT action, resource, resource_id, user_id, created_at, new_value
     FROM audit_logs
     WHERE (resource_id = $1 OR new_value::text ILIKE $2)
       AND resource = 'company'
     ORDER BY created_at
     LIMIT 10`,
    [company.id, `%${company.id}%`]
  ).catch(() => ({ rows: [] as any[] }));

  if (auditR.rows.length > 0) {
    console.log(`\n=== AUDIT LOGS (resource=company) ===`);
    for (const a of auditR.rows) {
      console.log(`  [${a.created_at}] action=${a.action} user_id=${a.user_id}`);
    }
  } else {
    console.log(`\n=== AUDIT LOGS: ninguno encontrado para esta empresa ===`);
  }

  // 4. Check audit_logs for any 'create' action around the company creation time
  if (company.created_at) {
    const window = new Date(company.created_at);
    const from = new Date(window.getTime() - 60000); // -1 min
    const to   = new Date(window.getTime() + 60000); // +1 min
    const nearR = await pool.query(
      `SELECT action, resource, resource_id, user_id, created_at
       FROM audit_logs
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at`,
      [from.toISOString(), to.toISOString()]
    ).catch(() => ({ rows: [] as any[] }));

    if (nearR.rows.length > 0) {
      console.log(`\n=== AUDIT LOGS en ventana ±1 min de creación ===`);
      for (const a of nearR.rows) {
        console.log(`  [${a.created_at}] ${a.action} ${a.resource} ${a.resource_id} user=${a.user_id}`);
      }
    } else {
      console.log(`\n=== No hay audit logs en ventana de creación ===`);
    }
  }

  // 5. Any superadmin/soporte users in system (to cross-reference)
  const adminsR = await pool.query(
    `SELECT id, username, email, role FROM users WHERE role IN ('superadmin','soporte') ORDER BY created_at`
  );
  console.log(`\n=== ADMINS/SOPORTE EN SISTEMA ===`);
  for (const a of adminsR.rows) {
    console.log(`  [${a.id}] ${a.role.padEnd(12)} ${a.email || a.username}`);
  }

  await pool.end();
}

main().catch(console.error);
