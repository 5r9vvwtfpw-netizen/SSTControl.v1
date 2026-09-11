import { db } from "../db";
import { sql } from "drizzle-orm";

/** Runtime-safe migration for databases which predate immutable LSO archives. */
export async function createLsoManagementReportArchives() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lso_management_report_archives (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id VARCHAR NOT NULL REFERENCES licensed_professional_assignments(id),
      company_id VARCHAR NOT NULL REFERENCES companies(id),
      lso_user_id VARCHAR REFERENCES users(id),
      lso_name TEXT NOT NULL,
      lso_license TEXT NOT NULL,
      lso_license_issuer TEXT NOT NULL,
      lso_email TEXT,
      assigned_at TIMESTAMP NOT NULL,
      terminated_at TIMESTAMP NOT NULL,
      year INTEGER NOT NULL,
      generated_at TIMESTAMP NOT NULL DEFAULT now(),
      object_path TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'application/pdf',
      sha256 VARCHAR(64) NOT NULL,
      byte_size INTEGER NOT NULL,
      document_code VARCHAR NOT NULL DEFAULT 'LSO-GEST-01',
      version VARCHAR NOT NULL DEFAULT '1.0',
      status TEXT NOT NULL DEFAULT 'stored' CHECK (status IN ('stored', 'failed')),
      failure_reason TEXT,
      created_by VARCHAR REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT lso_management_report_archives_assignment_lifecycle_year_version_key
        UNIQUE (assignment_id, assigned_at, year, version)
    );
    CREATE INDEX IF NOT EXISTS lso_management_report_archives_company_idx
      ON lso_management_report_archives(company_id);
    CREATE INDEX IF NOT EXISTS lso_management_report_archives_assignment_idx
      ON lso_management_report_archives(assignment_id);
    ALTER TABLE lso_management_report_archives
      ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;
    UPDATE lso_management_report_archives a
      SET assigned_at = l.assigned_at
      FROM licensed_professional_assignments l
      WHERE a.assignment_id = l.id AND a.assigned_at IS NULL;
    ALTER TABLE lso_management_report_archives
      ALTER COLUMN assigned_at SET NOT NULL;
    ALTER TABLE lso_management_report_archives
      DROP CONSTRAINT IF EXISTS lso_management_report_archives_assignment_year_version_key;
    ALTER TABLE lso_management_report_archives
      DROP CONSTRAINT IF EXISTS lso_management_report_archives_assignment_lifecycle_year_version_key;
    ALTER TABLE lso_management_report_archives
      ADD CONSTRAINT lso_management_report_archives_assignment_lifecycle_year_version_key
      UNIQUE (assignment_id, assigned_at, year, version);
    CREATE OR REPLACE FUNCTION prevent_lso_archive_mutation()
    RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF OLD.status = 'stored' THEN
        RAISE EXCEPTION 'Stored LSO archives are immutable';
      END IF;
      IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
      RETURN NEW;
    END $$;
    DROP TRIGGER IF EXISTS lso_management_report_archives_immutable ON lso_management_report_archives;
    CREATE TRIGGER lso_management_report_archives_immutable
      BEFORE UPDATE OR DELETE ON lso_management_report_archives
      FOR EACH ROW EXECUTE FUNCTION prevent_lso_archive_mutation();
  `);
}