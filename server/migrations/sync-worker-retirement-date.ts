import { db } from '../db';
import { sql } from 'drizzle-orm';

/** Do not infer historical retirement dates from contract end dates. */
export async function syncWorkerRetirementDate(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS retirement_date date
  `);
}