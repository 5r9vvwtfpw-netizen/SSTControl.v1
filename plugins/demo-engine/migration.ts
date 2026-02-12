import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import logger from "../../server/lib/logger";
import { isDemoEnabled } from "./types";

export async function runDemoEngineMigration(): Promise<void> {
  if (!isDemoEnabled()) return;

  logger.info("[DemoEngine] Running migration...");

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS demo_room_bookings (
      room_id VARCHAR PRIMARY KEY,
      company_id VARCHAR NOT NULL UNIQUE,
      demo_username TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'resetting', 'error')),
      assigned_prospect_email TEXT,
      assigned_session_token TEXT,
      expires_at TIMESTAMPTZ,
      last_reset_at TIMESTAMPTZ,
      error_message TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `));

  logger.info("[DemoEngine] Migration complete");
}
