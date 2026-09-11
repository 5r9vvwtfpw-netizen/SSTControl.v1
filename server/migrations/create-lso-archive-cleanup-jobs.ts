import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createLsoArchiveCleanupJobs() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lso_archive_object_cleanup_jobs (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      object_path TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
      next_attempt_at TIMESTAMP NOT NULL DEFAULT now(),
      last_error TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS reason TEXT;
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMP NOT NULL DEFAULT now();
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS last_error TEXT;
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now();
    ALTER TABLE lso_archive_object_cleanup_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT now();
    CREATE UNIQUE INDEX IF NOT EXISTS lso_archive_cleanup_object_path_idx ON lso_archive_object_cleanup_jobs(object_path);
  `);
}