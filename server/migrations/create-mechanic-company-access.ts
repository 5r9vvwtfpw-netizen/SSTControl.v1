import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createMechanicCompanyAccessTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mechanic_company_access (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      mechanic_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      employer_company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      authorized_company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      scope TEXT[] NOT NULL DEFAULT ARRAY['maintenance']::text[],
      start_date DATE NOT NULL,
      end_date DATE,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'revoked', 'expired')),
      invited_at TIMESTAMP NOT NULL DEFAULT now(),
      responded_at TIMESTAMP,
      responded_by_user_id VARCHAR REFERENCES users(id),
      rejection_reason TEXT,
      granted_by_user_id VARCHAR NOT NULL REFERENCES users(id),
      revoked_by_user_id VARCHAR REFERENCES users(id),
      revoked_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT mechanic_company_access_different_companies
        CHECK (employer_company_id <> authorized_company_id),
      CONSTRAINT mechanic_company_access_dates
        CHECK (end_date IS NULL OR end_date >= start_date)
    );
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS mechanic_company_access_mechanic_idx
    ON mechanic_company_access(mechanic_user_id, is_active, start_date, end_date);
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS mechanic_company_access_company_idx
    ON mechanic_company_access(authorized_company_id, is_active);
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS mechanic_company_access_active_unique_idx
    ON mechanic_company_access(mechanic_user_id, authorized_company_id)
    WHERE is_active = TRUE;
  `);
}