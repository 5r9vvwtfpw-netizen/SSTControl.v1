import { sql } from "drizzle-orm";
import { db } from "../db";

/**
 * Adds per-company negotiated worker pricing while preserving existing quote
 * totals and every previously created payment/invoice.
 */
export async function syncCompanyWorkerPricing(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS worker_pricing_mode varchar NOT NULL DEFAULT 'standard',
      ADD COLUMN IF NOT EXISTS worker_unit_price_cop integer,
      ADD COLUMN IF NOT EXISTS worker_discount_percent integer,
      ADD COLUMN IF NOT EXISTS worker_pricing_updated_at timestamp,
      ADD COLUMN IF NOT EXISTS worker_pricing_updated_by text
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS company_worker_pricing_history (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL,
      previous_mode varchar NOT NULL,
      previous_unit_price_cop integer,
      previous_discount_percent integer,
      mode varchar NOT NULL,
      unit_price_cop integer,
      discount_percent integer,
      changed_by_user_id text NOT NULL,
      changed_by_name text NOT NULL,
      changed_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS company_worker_pricing_history_company_changed_idx
    ON company_worker_pricing_history (company_id, changed_at DESC)
  `);

  const epaycoTable = await db.execute(sql`
    SELECT to_regclass('public.epayco_pse_transactions') IS NOT NULL AS exists
  `);
  if (epaycoTable.rows[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE epayco_pse_transactions
        ADD COLUMN IF NOT EXISTS worker_pricing_mode varchar,
        ADD COLUMN IF NOT EXISTS worker_pricing_base_amount integer,
        ADD COLUMN IF NOT EXISTS billed_unit_price_cop numeric(14, 2),
        ADD COLUMN IF NOT EXISTS worker_discount_percent integer
    `);
  }

  const epaycoLinksTable = await db.execute(sql`
    SELECT to_regclass('public.epayco_pse_payment_links') IS NOT NULL AS exists
  `);
  if (epaycoLinksTable.rows[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE epayco_pse_payment_links
        ADD COLUMN IF NOT EXISTS worker_pricing_mode varchar,
        ADD COLUMN IF NOT EXISTS worker_pricing_base_amount integer,
        ADD COLUMN IF NOT EXISTS billed_unit_price_cop numeric(14, 2),
        ADD COLUMN IF NOT EXISTS worker_discount_percent integer
    `);
  }
}