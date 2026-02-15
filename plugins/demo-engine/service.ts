import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import { demoRoomBookings } from "./schema";
import {
  GOLDEN_MASTER_COMPANY_ID,
  DEMO_ROOM_IDS,
  DEMO_COMPANY_IDS,
  assertSafeDemoRoomCompanyId,
  isDemoEnabled,
} from "./types";
import type { CheckInResponse } from "./types";
import { hashPassword } from "../../server/auth";
import { randomBytes, createHash } from "crypto";
import logger from "../../server/lib/logger";

function extractRows(result: any): any[] {
  return (result as any).rows || result;
}

function deterministicUuid(originalId: string, targetCompanyId: string): string {
  const hash = createHash("md5").update(`${originalId}-${targetCompanyId}`).digest("hex");
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

function randomUuid(): string {
  return randomBytes(16).toString("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

function extractRoomNumber(targetCompanyId: string): string {
  const match = targetCompanyId.match(/room-(\d+)$/);
  return match ? match[1] : "000";
}

interface Phase1Table {
  table: string;
  idMode: "random" | "deterministic";
  extraOverrides?: string[];
}

interface Phase2Table {
  table: string;
  workerIdNullable: boolean;
}

interface Phase3Table {
  table: string;
  parentKey: string;
  parentTable: string;
  hasWorkerIdFK: boolean;
}

const PHASE1_TABLES: Phase1Table[] = [
  {
    table: "workers",
    idMode: "deterministic",
    extraOverrides: ["identification_number", "email", "contract_number"],
  },
  { table: "job_profiles", idMode: "random" },
  { table: "afiliaciones_ssss", idMode: "random" },
  { table: "planes_trabajo_anual", idMode: "random" },
  { table: "politicas_sst", idMode: "random" },
  { table: "resource_allocations", idMode: "random" },
  { table: "sst_evaluations", idMode: "deterministic" },
  { table: "trainings", idMode: "deterministic" },
];

const PHASE2_TABLES: Phase2Table[] = [
  { table: "contracts", workerIdNullable: false },
  { table: "medical_exams", workerIdNullable: false },
  { table: "health_conditions", workerIdNullable: false },
  { table: "responsible_designations", workerIdNullable: true },
];

const PHASE3_TABLES: Phase3Table[] = [
  { table: "sst_evaluation_items", parentKey: "evaluation_id", parentTable: "sst_evaluations", hasWorkerIdFK: false },
  { table: "training_attendees", parentKey: "training_id", parentTable: "trainings", hasWorkerIdFK: true },
];

const TABLES_WITH_COMPANY_ID_TO_WIPE = [
  "sst_evaluations",
  "planes_trabajo_anual",
  "medical_exams",
  "health_conditions",
  "accidents",
  "trainings",
  "inspections",
  "preventive_measures",
  "occupational_diseases",
  "contracts",
  "afiliaciones_ssss",
  "resource_allocations",
  "responsible_designations",
  "job_profiles",
  "politicas_sst",
  "workers",
];

const CHILD_TABLES_TO_WIPE = [
  { table: "sst_evidence", parentTable: "sst_evaluation_items", parentKey: "evaluation_item_id", grandParentTable: "sst_evaluations", grandParentKey: "evaluation_id" },
  { table: "sst_evaluation_items", parentTable: "sst_evaluations", parentKey: "evaluation_id" },
  { table: "training_attendees", parentTable: "trainings", parentKey: "training_id" },
];

function getNextExpiry(): Date {
  const now = new Date();
  const bogotaOffset = -5 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const bogotaNow = new Date(utcMs + bogotaOffset * 60000);

  const expiry = new Date(bogotaNow);
  expiry.setHours(2, 0, 0, 0);
  if (expiry <= bogotaNow) {
    expiry.setDate(expiry.getDate() + 1);
  }

  const expiryUtc = new Date(expiry.getTime() - bogotaOffset * 60000);
  return expiryUtc;
}

export async function initializeDemoRooms(): Promise<void> {
  if (!isDemoEnabled()) return;

  logger.info("[DemoEngine] Initializing demo rooms...");

  try {
    const values = DEMO_ROOM_IDS.map((roomId, i) => ({
      roomId,
      companyId: DEMO_COMPANY_IDS[i],
      demoUsername: `demo${i + 1}`,
      status: "available" as const,
    }));

    await db.insert(demoRoomBookings).values(values).onConflictDoNothing();
  } catch (ormError: any) {
    logger.warn({ err: ormError.message }, "[DemoEngine] ORM insert failed, using raw SQL fallback");

    for (let i = 0; i < DEMO_ROOM_IDS.length; i++) {
      const roomId = DEMO_ROOM_IDS[i];
      const companyId = DEMO_COMPANY_IDS[i];
      const username = `demo${i + 1}`;
      await db.execute(sql`
        INSERT INTO demo_room_bookings (room_id, company_id, demo_username, status, updated_at)
        VALUES (${roomId}, ${companyId}, ${username}, 'available', now())
        ON CONFLICT (room_id) DO NOTHING
      `);
    }
  }

  const countResult = await db.execute(sql`SELECT count(*) as cnt FROM demo_room_bookings`);
  const countRows = extractRows(countResult);
  logger.info({ roomCount: countRows[0]?.cnt || countRows[0]?.count || 0 }, "[DemoEngine] All demo rooms ready");
}

async function readGoldenMasterData(): Promise<{
  company: Record<string, any> | null;
  phase1Data: Map<string, { columns: string[]; rows: Record<string, any>[] }>;
  phase2Data: Map<string, { columns: string[]; rows: Record<string, any>[] }>;
  phase3Data: Map<string, { columns: string[]; rows: Record<string, any>[] }>;
}> {
  const gmId = GOLDEN_MASTER_COMPANY_ID;

  const companyResult = extractRows(await db.execute(sql`SELECT * FROM companies WHERE id = ${gmId}`));
  const company = companyResult[0] || null;

  const phase1Data = new Map<string, { columns: string[]; rows: Record<string, any>[] }>();
  for (const p1 of PHASE1_TABLES) {
    const colResult = extractRows(await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${p1.table} AND table_schema = 'public' ORDER BY ordinal_position`));
    const columns = colResult.map((r: any) => r.column_name);
    const dataResult = extractRows(await db.execute(sql`SELECT * FROM ${sql.identifier(p1.table)} WHERE company_id = ${gmId}`));
    phase1Data.set(p1.table, { columns, rows: dataResult });
    logger.info(`[DemoEngine] Read ${dataResult.length} rows from Golden Master "${p1.table}"`);
  }

  const phase2Data = new Map<string, { columns: string[]; rows: Record<string, any>[] }>();
  for (const p2 of PHASE2_TABLES) {
    const colResult = extractRows(await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${p2.table} AND table_schema = 'public' ORDER BY ordinal_position`));
    const columns = colResult.map((r: any) => r.column_name);
    const dataResult = extractRows(await db.execute(sql`SELECT * FROM ${sql.identifier(p2.table)} WHERE company_id = ${gmId}`));
    phase2Data.set(p2.table, { columns, rows: dataResult });
    logger.info(`[DemoEngine] Read ${dataResult.length} rows from Golden Master "${p2.table}"`);
  }

  const phase3Data = new Map<string, { columns: string[]; rows: Record<string, any>[] }>();
  for (const p3 of PHASE3_TABLES) {
    const colResult = extractRows(await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${p3.table} AND table_schema = 'public' ORDER BY ordinal_position`));
    const columns = colResult.map((r: any) => r.column_name);

    const parentIds = extractRows(await db.execute(sql`SELECT id FROM ${sql.identifier(p3.parentTable)} WHERE company_id = ${gmId}`));
    const parentIdList = parentIds.map((r: any) => r.id);

    let rows: Record<string, any>[] = [];
    if (parentIdList.length > 0) {
      const idChunks = sql.join(parentIdList.map((id: string) => sql`${id}`), sql`, `);
      const dataResult = extractRows(await db.execute(sql`SELECT * FROM ${sql.identifier(p3.table)} WHERE ${sql.identifier(p3.parentKey)} IN (${idChunks})`));
      rows = dataResult;
    }
    phase3Data.set(p3.table, { columns, rows });
    logger.info(`[DemoEngine] Read ${rows.length} rows from Golden Master "${p3.table}"`);
  }

  return { company, phase1Data, phase2Data, phase3Data };
}

function transformRow(
  row: Record<string, any>,
  targetCompanyId: string,
  overrides: Record<string, (val: any) => any>
): Record<string, any> {
  const transformed = { ...row };
  for (const [key, fn] of Object.entries(overrides)) {
    transformed[key] = fn(row[key]);
  }
  return transformed;
}

function buildInsertSQL(tableName: string, columns: string[], rows: Record<string, any>[]): { text: string; values: any[] } {
  if (rows.length === 0) return { text: "", values: [] };

  const colList = columns.map(c => `"${c}"`).join(", ");
  const allValues: any[] = [];
  const rowPlaceholders: string[] = [];

  for (const row of rows) {
    const placeholders: string[] = [];
    for (const col of columns) {
      allValues.push(row[col] !== undefined ? row[col] : null);
      placeholders.push(`$${allValues.length}`);
    }
    rowPlaceholders.push(`(${placeholders.join(", ")})`);
  }

  return {
    text: `INSERT INTO "${tableName}" (${colList}) VALUES ${rowPlaceholders.join(", ")}`,
    values: allValues,
  };
}

export async function resetCompanyData(targetCompanyId: string): Promise<void> {
  assertSafeDemoRoomCompanyId(targetCompanyId);

  logger.info(`[DemoEngine] Resetting company ${targetCompanyId} from Golden Master ${GOLDEN_MASTER_COMPANY_ID}`);

  const gmData = await readGoldenMasterData();

  if (!gmData.company) {
    logger.warn(`[DemoEngine] Golden Master ${GOLDEN_MASTER_COMPANY_ID} not found in production DB, using fallback`);
  }

  const masterCompany = gmData.company || {
    name: "Empresa Demo SST",
    nit: "900000000-0",
    city: "Bogota",
    ciiu_code: "4711",
    address: "Calle Demo 123",
    number_of_workers: 8,
    risk_level: "I",
    calculated_chapter: "1",
  };

  await db.transaction(async (tx) => {
    for (const child of CHILD_TABLES_TO_WIPE) {
      if ('grandParentTable' in child && child.grandParentTable) {
        await tx.execute(sql`DELETE FROM ${sql.identifier(child.table)} WHERE ${sql.identifier(child.parentKey)} IN (
            SELECT id FROM ${sql.identifier(child.parentTable)} WHERE ${sql.identifier((child as any).grandParentKey)} IN (
              SELECT id FROM ${sql.identifier(child.grandParentTable)} WHERE company_id = ${targetCompanyId}
            )
          )`);
      } else {
        await tx.execute(sql`DELETE FROM ${sql.identifier(child.table)} WHERE ${sql.identifier(child.parentKey)} IN (
            SELECT id FROM ${sql.identifier(child.parentTable)} WHERE company_id = ${targetCompanyId}
          )`);
      }
    }

    for (const table of TABLES_WITH_COMPANY_ID_TO_WIPE) {
      await tx.execute(sql`DELETE FROM ${sql.identifier(table)} WHERE company_id = ${targetCompanyId}`);
    }

    await tx.execute(sql`DELETE FROM users WHERE company_id = ${targetCompanyId} AND role != 'superadmin'`);

    const demoName = `${masterCompany.name} (Demo)`;
    const demoNit = `${targetCompanyId}-NIT`;

    await tx.execute(sql`
      INSERT INTO companies (id, name, nit, city, ciiu_code, address, number_of_workers, number_of_vehicles, risk_level, calculated_chapter)
      VALUES (
        ${targetCompanyId},
        ${demoName},
        ${demoNit},
        ${masterCompany.city || "Bogotá"},
        ${masterCompany.ciiu_code || "4711"},
        ${masterCompany.address || "Calle Demo 123"},
        ${masterCompany.number_of_workers || 8},
        0,
        ${masterCompany.risk_level || "I"},
        ${masterCompany.calculated_chapter || "1"}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        nit = EXCLUDED.nit,
        city = EXCLUDED.city,
        ciiu_code = EXCLUDED.ciiu_code,
        address = EXCLUDED.address,
        number_of_workers = EXCLUDED.number_of_workers,
        number_of_vehicles = EXCLUDED.number_of_vehicles,
        risk_level = EXCLUDED.risk_level,
        calculated_chapter = EXCLUDED.calculated_chapter
    `);

    for (const p1 of PHASE1_TABLES) {
      const tableData = gmData.phase1Data.get(p1.table);
      if (!tableData || tableData.rows.length === 0) {
        logger.info(`[DemoEngine] Phase 1 - "${p1.table}": 0 rows to clone`);
        continue;
      }

      const transformedRows = tableData.rows.map(row => {
        const overrides: Record<string, (val: any) => any> = {
          company_id: () => targetCompanyId,
        };

        if (p1.idMode === "deterministic") {
          overrides.id = (origId: string) => deterministicUuid(origId, targetCompanyId);
        } else {
          overrides.id = () => randomUuid();
        }

        if (p1.extraOverrides?.includes("identification_number")) {
          const roomNum = extractRoomNumber(targetCompanyId);
          overrides.identification_number = (orig: string | null) => {
            if (!orig) return null;
            const clean = orig.replace(/^GM-/, "");
            return `${clean}-R${roomNum}`;
          };
        }
        if (p1.extraOverrides?.includes("email")) {
          const roomNum = extractRoomNumber(targetCompanyId);
          overrides.email = (orig: string | null) => {
            if (!orig) return null;
            const clean = orig.replace(".gm@", "@").replace(".gm.", ".");
            const [local, domain] = clean.split("@");
            return `${local}.r${roomNum}@${domain || "demo.sst.co"}`;
          };
        }
        if (p1.extraOverrides?.includes("contract_number")) {
          const roomNum = extractRoomNumber(targetCompanyId);
          let contractSeq = 0;
          overrides.contract_number = (orig: string | null) => {
            if (!orig) return null;
            contractSeq++;
            return `CONT-R${roomNum}-${new Date().getFullYear()}-${String(contractSeq).padStart(4, "0")}`;
          };
        }

        return transformRow(row, targetCompanyId, overrides);
      });

      const insertQuery = buildInsertSQL(p1.table, tableData.columns, transformedRows);
      if (insertQuery.text) {
        await tx.execute(sql.raw(insertQuery.text.replace(/\$(\d+)/g, (_, n) => {
          const val = insertQuery.values[parseInt(n) - 1];
          if (val === null || val === undefined) return "NULL";
          if (typeof val === "number") return String(val);
          if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (Array.isArray(val)) return `'{${val.map((v: any) => `"${String(v).replace(/"/g, '\\"')}"`).join(",")}}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        })));
      }

      logger.info(`[DemoEngine] Phase 1 - Cloned ${transformedRows.length} rows into "${p1.table}"`);
    }

    for (const p2 of PHASE2_TABLES) {
      const tableData = gmData.phase2Data.get(p2.table);
      if (!tableData || tableData.rows.length === 0) {
        logger.info(`[DemoEngine] Phase 2 - "${p2.table}": 0 rows to clone`);
        continue;
      }

      const transformedRows = tableData.rows.map(row => {
        const newId = randomUuid();
        const overrides: Record<string, (val: any) => any> = {
          id: () => newId,
          company_id: () => targetCompanyId,
        };

        if (p2.workerIdNullable) {
          overrides.worker_id = (wid: string | null) => wid ? deterministicUuid(wid, targetCompanyId) : null;
        } else {
          overrides.worker_id = (wid: string) => deterministicUuid(wid, targetCompanyId);
        }

        if (p2.table === "contracts") {
          overrides.contract_number = () => `CONT-DEMO-${newId.substring(0, 8)}`;
          overrides.identification_number = (origId: string | null) => origId ? `DEMO-${origId}-${randomBytes(3).toString("hex")}` : null;
        }

        return transformRow(row, targetCompanyId, overrides);
      });

      const insertQuery = buildInsertSQL(p2.table, tableData.columns, transformedRows);
      if (insertQuery.text) {
        await tx.execute(sql.raw(insertQuery.text.replace(/\$(\d+)/g, (_, n) => {
          const val = insertQuery.values[parseInt(n) - 1];
          if (val === null || val === undefined) return "NULL";
          if (typeof val === "number") return String(val);
          if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (Array.isArray(val)) return `'{${val.map((v: any) => `"${String(v).replace(/"/g, '\\"')}"`).join(",")}}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        })));
      }

      logger.info(`[DemoEngine] Phase 2 - Cloned ${transformedRows.length} rows into "${p2.table}"`);
    }

    for (const p3 of PHASE3_TABLES) {
      const tableData = gmData.phase3Data.get(p3.table);
      if (!tableData || tableData.rows.length === 0) {
        logger.info(`[DemoEngine] Phase 3 - "${p3.table}": 0 rows to clone`);
        continue;
      }

      const transformedRows = tableData.rows.map(row => {
        const overrides: Record<string, (val: any) => any> = {
          id: () => randomUuid(),
          [p3.parentKey]: (origParentId: string) => deterministicUuid(origParentId, targetCompanyId),
        };

        if (p3.hasWorkerIdFK) {
          overrides.worker_id = (wid: string) => deterministicUuid(wid, targetCompanyId);
        }

        return transformRow(row, targetCompanyId, overrides);
      });

      const insertQuery = buildInsertSQL(p3.table, tableData.columns, transformedRows);
      if (insertQuery.text) {
        await tx.execute(sql.raw(insertQuery.text.replace(/\$(\d+)/g, (_, n) => {
          const val = insertQuery.values[parseInt(n) - 1];
          if (val === null || val === undefined) return "NULL";
          if (typeof val === "number") return String(val);
          if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (Array.isArray(val)) return `'{${val.map((v: any) => `"${String(v).replace(/"/g, '\\"')}"`).join(",")}}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        })));
      }

      logger.info(`[DemoEngine] Phase 3 - Cloned ${transformedRows.length} rows into "${p3.table}"`);
    }
  });

  logger.info(`[DemoEngine] Company ${targetCompanyId} reset complete`);
}

export async function checkIn(prospectEmail?: string): Promise<CheckInResponse> {
  if (!isDemoEnabled()) {
    throw new Error("Demo mode is not enabled");
  }

  const password = randomBytes(4).toString("hex");
  const hashedPw = await hashPassword(password);
  const expiresAt = getNextExpiry();

  const result = await db.transaction(async (tx) => {
    const rooms = await tx.execute(sql`
      SELECT * FROM demo_room_bookings 
      WHERE status = 'available' 
      ORDER BY room_id 
      FOR UPDATE SKIP LOCKED 
      LIMIT 1
    `);

    const roomRows = extractRows(rooms);
    const room = roomRows[0];
    if (!room) {
      return null;
    }

    const roomId = room.room_id;
    const companyId = room.company_id;
    const demoUsername = room.demo_username;
    const sessionToken = randomBytes(48).toString("base64url");

    await tx.execute(sql`
      UPDATE demo_room_bookings 
      SET status = 'resetting',
          assigned_prospect_email = ${prospectEmail || null},
          assigned_session_token = ${sessionToken},
          expires_at = ${expiresAt.toISOString()},
          updated_at = now()
      WHERE room_id = ${roomId}
    `);

    return { roomId, companyId, demoUsername, sessionToken };
  });

  if (!result) {
    throw new Error("NO_ROOMS_AVAILABLE");
  }

  try {
    await resetCompanyData(result.companyId);

    await db.execute(sql`DELETE FROM users WHERE company_id = ${result.companyId}`);

    await db.execute(sql`
      INSERT INTO users (id, username, password, role, full_name, email, company_id)
      VALUES (
        gen_random_uuid(),
        ${result.demoUsername},
        ${hashedPw},
        'admin',
        'Usuario Demo',
        ${result.demoUsername + '@demo.sst.co'},
        ${result.companyId}
      )
    `);

    await db.execute(sql`
      UPDATE demo_room_bookings 
      SET status = 'occupied',
          last_reset_at = now(),
          error_message = NULL,
          updated_at = now()
      WHERE room_id = ${result.roomId}
    `);

    const subscriptionCheck = await db.execute(sql`
      SELECT id FROM pricing_plugin_subscriptions WHERE customer_id = ${result.companyId} LIMIT 1
    `);
    const subRows = extractRows(subscriptionCheck);

    if (subRows.length === 0) {
      await db.execute(sql`
        INSERT INTO pricing_plugin_subscriptions 
          (id, customer_id, employee_count, tier, monthly_cost, price_per_license, minimum_fee, status, subscription_status, trial_ends_at)
        VALUES (
          gen_random_uuid(),
          ${result.companyId},
          8,
          'microempresa',
          '0',
          '0',
          '0',
          'active',
          'active',
          '2099-12-31 23:59:59'
        )
      `);
    } else {
      await db.execute(sql`
        UPDATE pricing_plugin_subscriptions 
        SET subscription_status = 'active',
            blocked_at = NULL,
            blocked_reason = NULL,
            trial_ends_at = '2099-12-31 23:59:59',
            updated_at = now()
        WHERE customer_id = ${result.companyId}
      `);
    }

    return {
      success: true,
      roomId: result.roomId,
      companyId: result.companyId,
      username: result.demoUsername,
      password,
      expiresAt: expiresAt.toISOString(),
      message: `Demo lista. Ingrese con usuario "${result.demoUsername}" y contraseña "${password}". Expira a las 2:00 AM hora Colombia.`,
      verifyUrl: `/api/demo/verify-redirect?token=${result.sessionToken}`,
    };
  } catch (error: any) {
    logger.error({ err: error, roomId: result.roomId }, "[DemoEngine] Check-in reset failed");

    await db.execute(sql`
      UPDATE demo_room_bookings 
      SET status = 'error',
          error_message = ${(error.message || "Unknown error").substring(0, 500)},
          updated_at = now()
      WHERE room_id = ${result.roomId}
    `);

    throw error;
  }
}

export async function runHousekeeping(): Promise<{ resetCount: number; errorCount: number }> {
  if (!isDemoEnabled()) {
    return { resetCount: 0, errorCount: 0 };
  }

  logger.info("[DemoEngine] Running housekeeping...");

  const expiredRooms = await db.execute(sql`
    SELECT * FROM demo_room_bookings 
    WHERE status = 'occupied' AND expires_at < now()
    ORDER BY room_id
  `);

  const errorRooms = await db.execute(sql`
    SELECT * FROM demo_room_bookings 
    WHERE status = 'error'
    ORDER BY room_id
  `);

  const expiredRows = extractRows(expiredRooms);
  const errorRows = extractRows(errorRooms);
  const roomsToReset = [...expiredRows, ...errorRows];
  let resetCount = 0;
  let errorCount = 0;

  for (const room of roomsToReset) {
    try {
      await db.execute(sql`
        UPDATE demo_room_bookings 
        SET status = 'resetting', updated_at = now()
        WHERE room_id = ${room.room_id}
      `);

      await resetCompanyData(room.company_id);

      await db.execute(sql`DELETE FROM users WHERE company_id = ${room.company_id}`);

      await db.execute(sql`
        UPDATE demo_room_bookings 
        SET status = 'available',
            assigned_prospect_email = NULL,
            assigned_session_token = NULL,
            expires_at = NULL,
            error_message = NULL,
            last_reset_at = now(),
            updated_at = now()
        WHERE room_id = ${room.room_id}
      `);

      resetCount++;
      logger.info(`[DemoEngine] Room ${room.room_id} reset successfully`);
    } catch (error: any) {
      errorCount++;
      logger.error({ err: error, roomId: room.room_id }, "[DemoEngine] Housekeeping reset failed");

      await db.execute(sql`
        UPDATE demo_room_bookings 
        SET status = 'error',
            error_message = ${(error.message || "Unknown error").substring(0, 500)},
            updated_at = now()
        WHERE room_id = ${room.room_id}
      `);
    }
  }

  logger.info(`[DemoEngine] Housekeeping complete: ${resetCount} reset, ${errorCount} errors`);
  return { resetCount, errorCount };
}

export async function getDemoRoomStatus(): Promise<any[]> {
  const rooms = await db.execute(sql`
    SELECT room_id, company_id, demo_username, status, assigned_prospect_email, expires_at, last_reset_at, error_message, updated_at
     FROM demo_room_bookings ORDER BY room_id
  `);
  return extractRows(rooms);
}

export async function getDemoHealthDiagnostics(): Promise<Record<string, any>> {
  const gmId = GOLDEN_MASTER_COMPANY_ID;
  const gmPreview = gmId.length > 8 ? `${gmId.substring(0, 8)}...${gmId.substring(gmId.length - 4)}` : gmId;

  let gmFound = false;
  let gmName: string | null = null;
  let workerCount = 0;
  let gmSource = "none";

  try {
    const companyResult = extractRows(await db.execute(sql`SELECT id, name FROM companies WHERE id = ${gmId}`));
    gmFound = companyResult.length > 0;
    gmName = gmFound ? companyResult[0].name : null;
    gmSource = "local_database";

    if (gmFound) {
      const wResult = extractRows(await db.execute(sql`SELECT count(*) as cnt FROM workers WHERE company_id = ${gmId}`));
      workerCount = parseInt(wResult[0]?.cnt || "0", 10);
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, "[DemoEngine] Could not query Golden Master for health check");
    gmSource = "error: " + err.message;
  }

  const roomResult = await db.execute(sql`SELECT room_id, status FROM demo_room_bookings ORDER BY room_id`);
  const rooms = extractRows(roomResult);

  return {
    enabled: true,
    database: "Neon (local)",
    goldenMasterSource: gmSource,
    roomCount: rooms.length,
    rooms: rooms.map((r: any) => ({ id: r.room_id, status: r.status })),
    goldenMaster: {
      idPreview: gmPreview,
      idLength: gmId.length,
      foundInDatabase: gmFound,
      companyName: gmName,
      workerCount,
    },
  };
}
