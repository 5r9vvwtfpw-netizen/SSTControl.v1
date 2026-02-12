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
  { table: "actividad_plan_trabajo", parentTable: "planes_trabajo_anual", parentKey: "plan_trabajo_id" },
];

const ALL_DEMO_TABLES_TO_WIPE = [
  "sst_evidence",
  "sst_evaluation_items",
  "sst_evaluations",
  "actividad_plan_trabajo",
  "planes_trabajo_anual",
  "medical_exams",
  "health_conditions",
  "accidents",
  "trainings",
  "training_attendees",
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

  for (let i = 0; i < DEMO_ROOM_IDS.length; i++) {
    const roomId = DEMO_ROOM_IDS[i];
    const companyId = DEMO_COMPANY_IDS[i];
    const demoUsername = `demo${i + 1}`;

    const [existing] = await db
      .select()
      .from(demoRoomBookings)
      .where(eq(demoRoomBookings.roomId, roomId))
      .limit(1);

    if (!existing) {
      await db.insert(demoRoomBookings).values({
        roomId,
        companyId,
        demoUsername,
        status: "available",
      });
      logger.info(`[DemoEngine] Room ${roomId} initialized`);
    }
  }

  logger.info("[DemoEngine] All demo rooms ready");
}

export async function resetCompanyData(targetCompanyId: string): Promise<void> {
  assertSafeDemoRoomCompanyId(targetCompanyId);

  logger.info(`[DemoEngine] Resetting company ${targetCompanyId} from Golden Master ${GOLDEN_MASTER_COMPANY_ID}`);

  await db.transaction(async (tx) => {
    for (const table of ALL_DEMO_TABLES_TO_WIPE) {
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
    const masterCompany = (masterResult as any)[0];

    if (!masterCompany) {
      throw new Error(`[DemoEngine] Golden Master company ${GOLDEN_MASTER_COMPANY_ID} not found`);
    }

    const existingResult = await tx.execute(sql.raw(
      `SELECT id FROM companies WHERE id = '${targetCompanyId}'`
    ));
    const existingTarget = (existingResult as any)[0];

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

    for (const table of TABLES_TO_CLONE) {
      const hasIdColumn = true;
      await tx.execute(sql.raw(`
        INSERT INTO "${table}" 
        SELECT gen_random_uuid() as id, '${targetCompanyId}' as company_id, ${getColumnsExceptIdAndCompany(table)}
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

      if ((parentIdMap as any).length > 0) {
        const oldParentId = (parentIdMap as any)[0].old_id;
        const newParentId = (parentIdMap as any)[0].new_id;

        await tx.execute(sql.raw(`
          INSERT INTO "${child.table}"
          SELECT gen_random_uuid() as id, 
                 '${newParentId}' as ${child.parentKey},
                 ${getChildColumnsExcept(child.table, child.parentKey)}
          FROM "${child.table}"
          WHERE ${child.parentKey} = '${oldParentId}'
        `));
      }
    }
  });

  logger.info(`[DemoEngine] Company ${targetCompanyId} reset complete`);
}

function getColumnsExceptIdAndCompany(table: string): string {
  const columnMaps: Record<string, string[]> = {
    workers: [
      "gen_random_uuid()||'-'||substring(md5(random()::text),1,6) as identification_number",
      "name", "gen_random_uuid()||'@demo.sst.co' as email", "position", "department",
      "contract_type", "gen_random_uuid()||'-C' as contract_number",
      "start_date", "end_date", "status", "job_profile_id",
      "gender", "birth_date", "education_level", "civil_status",
      "eps_nombre", "arl_nombre", "afp_nombre", "ccf_nombre",
      "photo_url", "created_at",
    ],
    job_profiles: [
      "name", "description", "risk_level", "physical_requirements",
      "mental_requirements", "required_ppe", "required_exams",
      "created_at",
    ],
    responsible_designations: [
      "worker_id", "designation_type", "designation_date", "document_url",
      "observations", "status", "is_external_lso", "external_lso_name",
      "external_lso_identification_number", "licencia_sst_titular",
      "licencia_sst_numero", "licencia_sst_vigencia", "curso_50_horas",
      "curso_50_horas_fecha", "created_at",
    ],
    resource_allocations: [
      "period_year", "resource_type", "description", "planned_budget",
      "executed_budget", "status", "evidence_url", "observations", "created_at",
    ],
    sst_evaluations: [
      "standard_type", "title", "description", "evaluation_date",
      "evaluator", "total_score", "max_total_score", "compliance_percentage",
      "status", "observations", "elaborado_por_id", "autorizado_por_id",
      "aprobado_por_id", "created_at",
    ],
    politicas_sst: [
      "titulo", "contenido", "fecha_aprobacion", "fecha_revision",
      "version", "estado", "aprobado_por", "revisado_por",
      "documento_url", "firma_representante_legal", "firma_responsable_sst",
      "created_at",
    ],
    planes_trabajo_anual: [
      "year", "title", "description", "status", "porcentaje_avance",
      "created_at",
    ],
    afiliaciones_ssss: [
      "worker_id", "tipo_afiliacion", "entidad_nombre", "numero_afiliacion",
      "fecha_afiliacion", "fecha_vencimiento", "estado", "documento_url",
      "observations", "created_at",
    ],
  };

  const cols = columnMaps[table];
  if (!cols) {
    return "*";
  }
  return cols.join(", ");
}

function getChildColumnsExcept(table: string, parentKey: string): string {
  const columnMaps: Record<string, string[]> = {
    sst_evaluation_items: [
      "item_id", "score", "observations", "evidence_url", "created_at",
    ],
    actividad_plan_trabajo: [
      "estandar_id", "nombre_actividad", "descripcion", "responsable",
      "fecha_inicio", "fecha_fin", "mes_programado", "estado",
      "porcentaje_avance", "evidencia_url", "observaciones", "created_at",
    ],
  };

  const cols = columnMaps[table];
  if (!cols) return "*";
  return cols.join(", ");
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

    const room = (rooms as any)[0];
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

    if ((subscriptionCheck as any).length === 0) {
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

  const roomsToReset = [...(expiredRooms as any), ...(errorRooms as any)];
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
  return rooms as any;
}
