import { db } from "../../server/db";
import { sql, eq } from "drizzle-orm";
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

  let initialized = 0;
  let existing = 0;

  for (let i = 0; i < DEMO_ROOM_IDS.length; i++) {
    const roomId = DEMO_ROOM_IDS[i];
    const companyId = DEMO_COMPANY_IDS[i];
    const demoUsername = `demo${i + 1}`;

    try {
      const [existingRoom] = await db
        .select()
        .from(demoRoomBookings)
        .where(eq(demoRoomBookings.roomId, roomId))
        .limit(1);

      if (!existingRoom) {
        await db.insert(demoRoomBookings).values({
          roomId,
          companyId,
          demoUsername,
          status: "available",
        });
        initialized++;
        logger.info(`[DemoEngine] Room ${roomId} initialized`);
      } else {
        existing++;
      }
    } catch (err: any) {
      logger.error(`[DemoEngine] Failed to initialize room ${roomId}: ${err.message}`);
    }
  }

  logger.info(`[DemoEngine] All demo rooms ready (${initialized} new, ${existing} existing)`);
}

export async function resetCompanyData(targetCompanyId: string): Promise<void> {
  assertSafeDemoRoomCompanyId(targetCompanyId);

  logger.info(`[DemoEngine] Resetting company ${targetCompanyId} from Golden Master ${GOLDEN_MASTER_COMPANY_ID}`);

  await db.transaction(async (tx) => {
    for (const child of CHILD_TABLES_TO_WIPE) {
      if ('grandParentTable' in child && child.grandParentTable) {
        await tx.execute(sql.raw(
          `DELETE FROM "${child.table}" WHERE "${child.parentKey}" IN (
            SELECT id FROM "${child.parentTable}" WHERE "${(child as any).grandParentKey}" IN (
              SELECT id FROM "${child.grandParentTable}" WHERE company_id = '${targetCompanyId}'
            )
          )`
        ));
      } else {
        await tx.execute(sql.raw(
          `DELETE FROM "${child.table}" WHERE "${child.parentKey}" IN (
            SELECT id FROM "${child.parentTable}" WHERE company_id = '${targetCompanyId}'
          )`
        ));
      }
    }

    for (const table of TABLES_WITH_COMPANY_ID_TO_WIPE) {
      await tx.execute(sql.raw(
        `DELETE FROM "${table}" WHERE company_id = '${targetCompanyId}'`
      ));
    }

    await tx.execute(sql.raw(
      `DELETE FROM users WHERE company_id = '${targetCompanyId}' AND role != 'superadmin'`
    ));

    const masterResult = await tx.execute(sql.raw(
      `SELECT * FROM companies WHERE id = '${GOLDEN_MASTER_COMPANY_ID}'`
    ));
    const masterRows = (masterResult as any).rows || masterResult;
    let masterCompany = masterRows[0];

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

    const existingResult = await tx.execute(sql.raw(
      `SELECT id FROM companies WHERE id = '${targetCompanyId}'`
    ));
    const existingRows = (existingResult as any).rows || existingResult;
    const existingTarget = existingRows[0];

    if (existingTarget) {
      await tx.execute(sql.raw(`
        UPDATE companies SET 
          name = '${(masterCompany as any).name} (Demo)',
          nit = '${targetCompanyId}-NIT',
          city = '${(masterCompany as any).city || "Bogotá"}',
          ciiu_code = '${(masterCompany as any).ciiu_code || "4711"}',
          address = '${(masterCompany as any).address || "Calle Demo 123"}',
          number_of_workers = ${(masterCompany as any).number_of_workers || 8},
          number_of_vehicles = 0,
          risk_level = '${(masterCompany as any).risk_level || "I"}',
          calculated_chapter = '${(masterCompany as any).calculated_chapter || "1"}'
        WHERE id = '${targetCompanyId}'
      `));
    } else {
      await tx.execute(sql.raw(`
        INSERT INTO companies (id, name, nit, city, ciiu_code, address, number_of_workers, number_of_vehicles, risk_level, calculated_chapter)
        VALUES (
          '${targetCompanyId}',
          '${(masterCompany as any).name} (Demo)',
          '${targetCompanyId}-NIT',
          '${(masterCompany as any).city || "Bogotá"}',
          '${(masterCompany as any).ciiu_code || "4711"}',
          '${(masterCompany as any).address || "Calle Demo 123"}',
          ${(masterCompany as any).number_of_workers || 8},
          0,
          '${(masterCompany as any).risk_level || "I"}',
          '${(masterCompany as any).calculated_chapter || "1"}'
        )
      `));
    }

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
      
      await tx.execute(sql.raw(`
        INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(", ")})
        SELECT ${selectCols}
        FROM "${table}" 
        WHERE company_id = '${GOLDEN_MASTER_COMPANY_ID}'
      `));
    }

    for (const child of CHILD_TABLES_TO_CLONE) {
      const parentIdMap = await tx.execute(sql.raw(`
        SELECT gm.id as old_id, target.id as new_id
        FROM "${child.parentTable}" gm
        JOIN "${child.parentTable}" target 
          ON target.company_id = '${targetCompanyId}'
        WHERE gm.company_id = '${GOLDEN_MASTER_COMPANY_ID}'
        LIMIT 1
      `));

      const parentIdRows = (parentIdMap as any).rows || parentIdMap;
      if (parentIdRows.length > 0) {
        const oldParentId = parentIdRows[0].old_id;
        const newParentId = parentIdRows[0].new_id;

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
  const result = await tx.execute(sql.raw(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = '${tableName}' AND table_schema = 'public'
    ORDER BY ordinal_position
  `));
  const rows = (result as any).rows || result;
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
    const rooms = await tx.execute(sql.raw(`
      SELECT * FROM demo_room_bookings 
      WHERE status = 'available' 
      ORDER BY room_id 
      FOR UPDATE SKIP LOCKED 
      LIMIT 1
    `));

    const roomRows = (rooms as any).rows || rooms;
    const room = roomRows[0];
    if (!room) {
      return null;
    }

    const roomId = room.room_id;
    const companyId = room.company_id;
    const demoUsername = room.demo_username;
    const sessionToken = randomBytes(16).toString("hex");

    await tx.execute(sql.raw(`
      UPDATE demo_room_bookings 
      SET status = 'resetting',
          assigned_prospect_email = ${prospectEmail ? `'${prospectEmail.replace(/'/g, "''")}'` : "NULL"},
          assigned_session_token = '${sessionToken}',
          expires_at = '${expiresAt.toISOString()}',
          updated_at = now()
      WHERE room_id = '${roomId}'
    `));

    return { roomId, companyId, demoUsername, sessionToken };
  });

  if (!result) {
    throw new Error("NO_ROOMS_AVAILABLE");
  }

  try {
    await resetCompanyData(result.companyId);

    await db.execute(sql.raw(
      `DELETE FROM users WHERE company_id = '${result.companyId}'`
    ));

    await db.execute(sql.raw(`
      INSERT INTO users (id, username, password, role, full_name, email, company_id)
      VALUES (
        gen_random_uuid(),
        '${result.demoUsername}',
        '${hashedPw}',
        'admin',
        'Usuario Demo',
        '${result.demoUsername}@demo.sst.co',
        '${result.companyId}'
      )
    `));

    await db.execute(sql.raw(`
      UPDATE demo_room_bookings 
      SET status = 'occupied',
          last_reset_at = now(),
          error_message = NULL,
          updated_at = now()
      WHERE room_id = '${result.roomId}'
    `));

    const subscriptionCheck = await db.execute(sql.raw(
      `SELECT id FROM pricing_plugin_subscriptions WHERE customer_id = '${result.companyId}' LIMIT 1`
    ));
    const subRows = (subscriptionCheck as any).rows || subscriptionCheck;

    if (subRows.length === 0) {
      await db.execute(sql.raw(`
        INSERT INTO pricing_plugin_subscriptions 
          (id, customer_id, employee_count, tier, monthly_cost, price_per_license, minimum_fee, status, subscription_status, trial_ends_at)
        VALUES (
          gen_random_uuid(),
          '${result.companyId}',
          8,
          'microempresa',
          '0',
          '0',
          '0',
          'active',
          'active',
          '2099-12-31 23:59:59'
        )
      `));
    } else {
      await db.execute(sql.raw(`
        UPDATE pricing_plugin_subscriptions 
        SET subscription_status = 'active',
            blocked_at = NULL,
            blocked_reason = NULL,
            trial_ends_at = '2099-12-31 23:59:59',
            updated_at = now()
        WHERE customer_id = '${result.companyId}'
      `));
    }

    return {
      success: true,
      roomId: result.roomId,
      companyId: result.companyId,
      username: result.demoUsername,
      password,
      expiresAt: expiresAt.toISOString(),
      message: `Demo lista. Ingrese con usuario "${result.demoUsername}" y contraseña "${password}". Expira a las 2:00 AM hora Colombia.`,
    };
  } catch (error: any) {
    logger.error({ err: error, roomId: result.roomId }, "[DemoEngine] Check-in reset failed");

    await db.execute(sql.raw(`
      UPDATE demo_room_bookings 
      SET status = 'error',
          error_message = '${(error.message || "Unknown error").replace(/'/g, "''")}',
          updated_at = now()
      WHERE room_id = '${result.roomId}'
    `));

    throw error;
  }
}

export async function runHousekeeping(): Promise<{ resetCount: number; errorCount: number }> {
  if (!isDemoEnabled()) {
    return { resetCount: 0, errorCount: 0 };
  }

  logger.info("[DemoEngine] Running housekeeping...");

  const expiredRooms = await db.execute(sql.raw(`
    SELECT * FROM demo_room_bookings 
    WHERE status = 'occupied' AND expires_at < now()
    ORDER BY room_id
  `));

  const errorRooms = await db.execute(sql.raw(`
    SELECT * FROM demo_room_bookings 
    WHERE status = 'error'
    ORDER BY room_id
  `));

  const expiredRows = (expiredRooms as any).rows || expiredRooms;
  const errorRows = (errorRooms as any).rows || errorRooms;
  const roomsToReset = [...expiredRows, ...errorRows];
  let resetCount = 0;
  let errorCount = 0;

  for (const room of roomsToReset) {
    try {
      await db.execute(sql.raw(`
        UPDATE demo_room_bookings 
        SET status = 'resetting', updated_at = now()
        WHERE room_id = '${room.room_id}'
      `));

      await resetCompanyData(room.company_id);

      await db.execute(sql.raw(
        `DELETE FROM users WHERE company_id = '${room.company_id}'`
      ));

      await db.execute(sql.raw(`
        UPDATE demo_room_bookings 
        SET status = 'available',
            assigned_prospect_email = NULL,
            assigned_session_token = NULL,
            expires_at = NULL,
            error_message = NULL,
            last_reset_at = now(),
            updated_at = now()
        WHERE room_id = '${room.room_id}'
      `));

      resetCount++;
      logger.info(`[DemoEngine] Room ${room.room_id} reset successfully`);
    } catch (error: any) {
      errorCount++;
      logger.error({ err: error, roomId: room.room_id }, "[DemoEngine] Housekeeping reset failed");

      await db.execute(sql.raw(`
        UPDATE demo_room_bookings 
        SET status = 'error',
            error_message = '${(error.message || "Unknown error").replace(/'/g, "''")}',
            updated_at = now()
        WHERE room_id = '${room.room_id}'
      `));
    }
  }

  logger.info(`[DemoEngine] Housekeeping complete: ${resetCount} reset, ${errorCount} errors`);
  return { resetCount, errorCount };
}

export async function getDemoRoomStatus(): Promise<any[]> {
  const rooms = await db.execute(sql.raw(
    `SELECT room_id, company_id, demo_username, status, assigned_prospect_email, expires_at, last_reset_at, error_message, updated_at
     FROM demo_room_bookings ORDER BY room_id`
  ));
  return (rooms as any).rows || rooms;
}
