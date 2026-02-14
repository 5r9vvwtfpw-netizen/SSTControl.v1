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
import { randomBytes } from "crypto";
import logger from "../../server/lib/logger";

function extractRows(result: any): any[] {
  return (result as any).rows || result;
}

const TABLES_TO_CLONE = [
  "workers",
  "job_profiles",
  "responsible_designations",
  "resource_allocations",
  "sst_evaluations",
  "politicas_sst",
  "planes_trabajo_anual",
  "afiliaciones_ssss",
];

const CHILD_TABLES_TO_CLONE = [
  { table: "sst_evaluation_items", parentTable: "sst_evaluations", parentKey: "evaluation_id" },
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

export async function resetCompanyData(targetCompanyId: string): Promise<void> {
  assertSafeDemoRoomCompanyId(targetCompanyId);

  logger.info(`[DemoEngine] Resetting company ${targetCompanyId} from Golden Master ${GOLDEN_MASTER_COMPANY_ID}`);

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

    const masterResult = await tx.execute(sql`SELECT * FROM companies WHERE id = ${GOLDEN_MASTER_COMPANY_ID}`);
    const masterRows = extractRows(masterResult);
    let masterCompany = masterRows[0];

    logger.info(`[DemoEngine] Golden Master query result: ${masterRows.length} rows found for ID "${GOLDEN_MASTER_COMPANY_ID}"`);

    if (!masterCompany) {
      logger.warn(`[DemoEngine] Golden Master ${GOLDEN_MASTER_COMPANY_ID} not found, using fallback defaults`);
      masterCompany = {
        name: "Empresa Demo SST",
        nit: "900000000-0",
        city: "Bogota",
        ciiu_code: "4711",
        address: "Calle Demo 123",
        number_of_workers: 8,
        risk_level: "I",
        calculated_chapter: "1",
      };
    }

    const demoName = `${(masterCompany as any).name} (Demo)`;
    const demoNit = `${targetCompanyId}-NIT`;
    const demoCity = (masterCompany as any).city || "Bogotá";
    const demoCiiu = (masterCompany as any).ciiu_code || "4711";
    const demoAddress = (masterCompany as any).address || "Calle Demo 123";
    const demoWorkers = (masterCompany as any).number_of_workers || 8;
    const demoRiskLevel = (masterCompany as any).risk_level || "I";
    const demoChapter = (masterCompany as any).calculated_chapter || "1";

    await tx.execute(sql`
      INSERT INTO companies (id, name, nit, city, ciiu_code, address, number_of_workers, number_of_vehicles, risk_level, calculated_chapter)
      VALUES (
        ${targetCompanyId},
        ${demoName},
        ${demoNit},
        ${demoCity},
        ${demoCiiu},
        ${demoAddress},
        ${demoWorkers},
        0,
        ${demoRiskLevel},
        ${demoChapter}
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

    const workerOverrides: Record<string, string> = {
      id: "gen_random_uuid() as id",
      company_id: `'${targetCompanyId}' as company_id`,
      identification_number: "gen_random_uuid()||'-'||substring(md5(random()::text),1,6) as identification_number",
      email: "gen_random_uuid()||'@demo.sst.co' as email",
      contract_number: "gen_random_uuid()||'-C' as contract_number",
    };

    const defaultOverrides: Record<string, string> = {
      id: "gen_random_uuid() as id",
      company_id: `'${targetCompanyId}' as company_id`,
    };

    for (const table of TABLES_TO_CLONE) {
      const columns = await getTableColumns(tx, table);
      const overrides = table === "workers" ? workerOverrides : defaultOverrides;
      const selectCols = buildCloneSelect(columns, [], overrides);
      
      const countResult = await tx.execute(sql.raw(`SELECT count(*) as cnt FROM "${table}" WHERE company_id = '${GOLDEN_MASTER_COMPANY_ID}'`));
      const countRows = extractRows(countResult);
      const sourceCount = countRows[0]?.cnt || 0;
      logger.info(`[DemoEngine] Cloning table "${table}": ${sourceCount} source rows from Golden Master`);

      await tx.execute(sql.raw(`
        INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(", ")})
        SELECT ${selectCols}
        FROM "${table}" 
        WHERE company_id = '${GOLDEN_MASTER_COMPANY_ID}'
      `));
    }

    for (const child of CHILD_TABLES_TO_CLONE) {
      const parentIdMap = await tx.execute(sql`
        SELECT gm.id as old_id, target.id as new_id
        FROM ${sql.identifier(child.parentTable)} gm
        JOIN ${sql.identifier(child.parentTable)} target 
          ON target.company_id = ${targetCompanyId}
          AND gm.company_id = ${GOLDEN_MASTER_COMPANY_ID}
        WHERE gm.company_id = ${GOLDEN_MASTER_COMPANY_ID}
      `);

      const parentIdRows = extractRows(parentIdMap);
      
      for (const mapping of parentIdRows) {
        const oldParentId = mapping.old_id;
        const newParentId = mapping.new_id;

        const childColumns = await getTableColumns(tx, child.table);
        const childOverrides: Record<string, string> = {
          id: "gen_random_uuid() as id",
          [child.parentKey]: `'${newParentId}' as "${child.parentKey}"`,
        };
        const childSelectCols = buildCloneSelect(childColumns, [], childOverrides);

        await tx.execute(sql.raw(`
          INSERT INTO "${child.table}" (${childColumns.map(c => `"${c}"`).join(", ")})
          SELECT ${childSelectCols}
          FROM "${child.table}"
          WHERE "${child.parentKey}" = '${oldParentId}'
        `));
      }
    }
  });

  logger.info(`[DemoEngine] Company ${targetCompanyId} reset complete`);
}

async function getTableColumns(tx: any, tableName: string): Promise<string[]> {
  const result = await tx.execute(sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = ${tableName} AND table_schema = 'public'
    ORDER BY ordinal_position
  `);
  const rows = extractRows(result);
  return rows.map((r: any) => r.column_name);
}

function buildCloneSelect(columns: string[], excludeCols: string[], overrides: Record<string, string>): string {
  return columns
    .filter(c => !excludeCols.includes(c))
    .map(c => overrides[c] || `"${c}"`)
    .join(", ");
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
      verifyUrl: `/demo/verify?token=${result.sessionToken}`,
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

  const companyResult = await db.execute(sql`SELECT id, name FROM companies WHERE id = ${gmId}`);
  const companyRows = extractRows(companyResult);
  const gmFound = companyRows.length > 0;
  const gmName = gmFound ? (companyRows[0] as any).name : null;

  let workerCount = 0;
  if (gmFound) {
    const wResult = await db.execute(sql`SELECT count(*) as cnt FROM workers WHERE company_id = ${gmId}`);
    workerCount = parseInt(extractRows(wResult)[0]?.cnt || "0", 10);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const dbType = isProduction && process.env.AWS_RDS_HOST ? "AWS_RDS" : "Neon";

  return {
    enabled: true,
    database: dbType,
    goldenMaster: {
      idPreview: gmPreview,
      idLength: gmId.length,
      foundInDatabase: gmFound,
      companyName: gmName,
      workerCount,
    },
  };
}
