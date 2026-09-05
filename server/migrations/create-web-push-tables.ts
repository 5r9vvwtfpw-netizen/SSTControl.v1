import { db } from "../db";
import { sql } from "drizzle-orm";

/** Idempotent because production starts accepting health checks before migrations finish. */
export async function createWebPushTables(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_config (
      key VARCHAR PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
    ON push_subscriptions(user_id)
  `);
  console.log("[Migration] Web Push tables verified");
}