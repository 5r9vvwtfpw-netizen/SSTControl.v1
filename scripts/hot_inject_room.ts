/**
 * Hot-inject: copia datos del golden master a una sala sin interrumpir la sesión activa.
 * El usuario demo1 sigue logueado, solo aparecen los datos.
 * Uso: NODE_ENV=production npx tsx scripts/hot_inject_room.ts demo-company-room-001
 */
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { createHash, randomBytes } from "crypto";
dotenv.config();

const TARGET = process.argv[2] || "demo-company-room-001";
const GM = "demo-golden-master";

const SAFE_ROOM_IDS = [
  "demo-company-room-001","demo-company-room-002","demo-company-room-003",
  "demo-company-room-004","demo-company-room-005","demo-company-room-006",
  "demo-company-room-007","demo-company-room-008","demo-company-room-009",
  "demo-company-room-010",
];

if (!SAFE_ROOM_IDS.includes(TARGET)) {
  console.error(`❌ Safety check: "${TARGET}" no es una sala demo válida. Abortando.`);
  process.exit(1);
}

function deterministicUuid(originalId: string, targetCompanyId: string): string {
  const hash = createHash("md5").update(`${originalId}-${targetCompanyId}`).digest("hex");
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
}

function randomUuid(): string {
  return randomBytes(16).toString("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

const ROOM_NUMBER = TARGET.match(/room-(\d+)$/)?.[1] || "000";

async function main() {
  const pool = new Pool({
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || "5432"),
    database: process.env.AWS_RDS_DATABASE || "postgres",
    user: process.env.AWS_RDS_USER || "postgres",
    password: process.env.AWS_RDS_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    // 1. Verificar que el GM tiene datos
    const gmCheck = await client.query(`SELECT COUNT(*) as c FROM workers WHERE company_id = $1`, [GM]);
    const gmCount = parseInt(gmCheck.rows[0].c);
    if (gmCount === 0) {
      console.error(`❌ Golden Master no tiene trabajadores. Ejecuta seed_golden_master.ts primero.`);
      process.exit(1);
    }
    console.log(`✅ Golden Master tiene ${gmCount} trabajadores. Procediendo...`);

    await client.query("BEGIN");

    // 2. Wipe data tables (sin tocar users ni demo_room_bookings)
    const CHILD_WIPES = [
      { child: "sst_evidence", via: "sst_evaluation_items", viaKey: "evaluation_item_id", parentKey: "evaluation_id", parent: "sst_evaluations" },
      { child: "sst_evaluation_items", parentKey: "evaluation_id", parent: "sst_evaluations" },
      { child: "training_attendees", parentKey: "training_id", parent: "trainings" },
      { child: "respuestas_estandares", parentKey: "evaluacion_id", parent: "evaluaciones_sst" },
    ];

    for (const w of CHILD_WIPES) {
      if ((w as any).via) {
        await client.query(`
          DELETE FROM ${(w as any).child}
          WHERE ${(w as any).viaKey} IN (
            SELECT id FROM ${(w as any).via}
            WHERE ${(w as any).parentKey} IN (
              SELECT id FROM ${(w as any).parent} WHERE company_id = $1
            )
          )`, [TARGET]);
      } else {
        await client.query(`
          DELETE FROM ${(w as any).child}
          WHERE ${(w as any).parentKey} IN (
            SELECT id FROM ${(w as any).parent} WHERE company_id = $1
          )`, [TARGET]);
      }
    }

    const MAIN_TABLES = [
      "sst_evaluations","evaluaciones_sst","planes_trabajo_anual","medical_exams",
      "health_conditions","accidents","trainings","inspections","preventive_measures",
      "occupational_diseases","contracts","afiliaciones_ssss","resource_allocations",
      "responsible_designations","job_profiles","politicas_sst","workers",
    ];
    for (const t of MAIN_TABLES) {
      await client.query(`DELETE FROM ${t} WHERE company_id = $1`, [TARGET]);
    }
    console.log("🧹 Datos anteriores limpiados.");

    // 3. PHASE 1: tablas con company_id directo
    const PHASE1 = [
      { table: "workers", idMode: "deterministic", overrides: ["identification_number","email","contract_number"] },
      { table: "job_profiles", idMode: "random" },
      { table: "afiliaciones_ssss", idMode: "random" },
      { table: "planes_trabajo_anual", idMode: "random" },
      { table: "politicas_sst", idMode: "random" },
      { table: "resource_allocations", idMode: "random" },
      { table: "sst_evaluations", idMode: "deterministic" },
      { table: "trainings", idMode: "deterministic" },
    ];

    const idMap = new Map<string, string>(); // originalId -> newId

    for (const p of PHASE1) {
      const colsRes = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND table_schema='public' ORDER BY ordinal_position`,
        [p.table]
      );
      const columns: string[] = colsRes.rows.map((r: any) => r.column_name);
      const rows = (await client.query(`SELECT * FROM ${p.table} WHERE company_id = $1`, [GM])).rows;

      for (const row of rows) {
        const newId = p.idMode === "deterministic"
          ? deterministicUuid(row.id, TARGET)
          : randomUuid();
        idMap.set(row.id, newId);

        const transformed: Record<string, any> = { ...row };
        transformed.id = newId;
        transformed.company_id = TARGET;

        // Override unique fields
        if (p.overrides?.includes("identification_number"))
          transformed.identification_number = `DEMO${ROOM_NUMBER}-${row.identification_number}`;
        if (p.overrides?.includes("email") && row.email)
          transformed.email = row.email.replace("@", `+room${ROOM_NUMBER}@`);
        if (p.overrides?.includes("contract_number") && row.contract_number)
          transformed.contract_number = `R${ROOM_NUMBER}-${row.contract_number}`;

        const colList = columns.map((c: string) => `"${c}"`).join(", ");
        const placeholders = columns.map((_: any, i: number) => `$${i+1}`).join(", ");
        const vals = columns.map((c: string) => transformed[c] !== undefined ? transformed[c] : null);
        await client.query(
          `INSERT INTO "${p.table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          vals
        );
      }
      console.log(`  ✅ ${p.table}: ${rows.length} filas copiadas`);
    }

    // 4. PHASE 2: tablas con worker_id FK
    const PHASE2 = [
      { table: "contracts", workerIdNullable: false },
      { table: "medical_exams", workerIdNullable: false },
      { table: "health_conditions", workerIdNullable: false },
      { table: "responsible_designations", workerIdNullable: true },
    ];

    for (const p of PHASE2) {
      const colsRes = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND table_schema='public' ORDER BY ordinal_position`,
        [p.table]
      );
      const columns: string[] = colsRes.rows.map((r: any) => r.column_name);
      const rows = (await client.query(`SELECT * FROM ${p.table} WHERE company_id = $1`, [GM])).rows;

      for (const row of rows) {
        const newId = randomUuid();
        const newWorkerId = row.worker_id ? idMap.get(row.worker_id) : null;
        if (!newWorkerId && !p.workerIdNullable) continue;

        const transformed: Record<string, any> = { ...row };
        transformed.id = newId;
        transformed.company_id = TARGET;
        if (row.worker_id) transformed.worker_id = newWorkerId || null;

        const colList = columns.map((c: string) => `"${c}"`).join(", ");
        const placeholders = columns.map((_: any, i: number) => `$${i+1}`).join(", ");
        const vals = columns.map((c: string) => transformed[c] !== undefined ? transformed[c] : null);
        await client.query(
          `INSERT INTO "${p.table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          vals
        );
      }
      console.log(`  ✅ ${p.table}: ${rows.length} filas copiadas`);
    }

    // 5. PHASE 3: hijos de tablas Phase1
    const PHASE3 = [
      { table: "sst_evaluation_items", parentKey: "evaluation_id", parentTable: "sst_evaluations" },
      { table: "training_attendees", parentKey: "training_id", parentTable: "trainings", hasWorkerIdFK: true },
    ];

    for (const p of PHASE3) {
      const colsRes = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND table_schema='public' ORDER BY ordinal_position`,
        [p.table]
      );
      const columns: string[] = colsRes.rows.map((r: any) => r.column_name);

      const parentIds = (await client.query(`SELECT id FROM ${p.parentTable} WHERE company_id = $1`, [GM])).rows.map((r: any) => r.id);
      if (parentIds.length === 0) continue;

      const rows = (await client.query(
        `SELECT * FROM ${p.table} WHERE ${p.parentKey} = ANY($1)`,
        [parentIds]
      )).rows;

      for (const row of rows) {
        const newParentId = idMap.get(row[p.parentKey]);
        if (!newParentId) continue;

        const transformed: Record<string, any> = { ...row };
        transformed.id = randomUuid();
        transformed[p.parentKey] = newParentId;
        if ((p as any).hasWorkerIdFK && row.worker_id) {
          transformed.worker_id = idMap.get(row.worker_id) || null;
        }

        const colList = columns.map((c: string) => `"${c}"`).join(", ");
        const placeholders = columns.map((_: any, i: number) => `$${i+1}`).join(", ");
        const vals = columns.map((c: string) => transformed[c] !== undefined ? transformed[c] : null);
        await client.query(
          `INSERT INTO "${p.table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          vals
        );
      }
      console.log(`  ✅ ${p.table}: ${rows.length} filas copiadas`);
    }

    // 6. Accidents e inspections (company_id directo, id aleatorio)
    for (const t of ["accidents", "inspections"]) {
      const colsRes = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND table_schema='public' ORDER BY ordinal_position`,
        [t]
      );
      const columns: string[] = colsRes.rows.map((r: any) => r.column_name);
      const rows = (await client.query(`SELECT * FROM ${t} WHERE company_id = $1`, [GM])).rows;

      for (const row of rows) {
        const transformed = { ...row, id: randomUuid(), company_id: TARGET };
        const colList = columns.map((c: string) => `"${c}"`).join(", ");
        const placeholders = columns.map((_: any, i: number) => `$${i+1}`).join(", ");
        const vals = columns.map((c: string) => transformed[c] !== undefined ? transformed[c] : null);
        await client.query(
          `INSERT INTO "${t}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          vals
        );
      }
      console.log(`  ✅ ${t}: ${rows.length} filas copiadas`);
    }

    await client.query("COMMIT");

    // Verificación final
    const wCheck = await client.query(`SELECT COUNT(*) as c FROM workers WHERE company_id = $1`, [TARGET]);
    console.log(`\n✅ Hot-inject completado en ${TARGET}`);
    console.log(`   Trabajadores ahora en sala: ${wCheck.rows[0].c}`);
    console.log(`   El usuario demo1 puede recargar la página y verá los datos.`);

  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("❌ Error durante hot-inject:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
