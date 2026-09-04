import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncMechanicInvitations() {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS identification_number TEXT`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_identification_number_unique_idx
    ON users(identification_number) WHERE identification_number IS NOT NULL`);

  await db.execute(sql`ALTER TABLE mechanic_company_access ADD COLUMN IF NOT EXISTS status TEXT`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ADD COLUMN IF NOT EXISTS responded_by_user_id VARCHAR REFERENCES users(id)`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ADD COLUMN IF NOT EXISTS rejection_reason TEXT`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ALTER COLUMN is_active SET DEFAULT FALSE`);
  await db.execute(sql`UPDATE mechanic_company_access
    SET status = CASE WHEN is_active THEN 'accepted' ELSE 'revoked' END
    WHERE status IS NULL`);
  await db.execute(sql`UPDATE mechanic_company_access SET invited_at = created_at WHERE invited_at IS NULL`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ALTER COLUMN status SET DEFAULT 'pending'`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ALTER COLUMN status SET NOT NULL`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ALTER COLUMN invited_at SET DEFAULT now()`);
  await db.execute(sql`ALTER TABLE mechanic_company_access ALTER COLUMN invited_at SET NOT NULL`);
  await db.execute(sql`DO $$ BEGIN
    ALTER TABLE mechanic_company_access ADD CONSTRAINT mechanic_company_access_status_check
    CHECK (status IN ('pending', 'accepted', 'rejected', 'revoked', 'expired'));
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
}