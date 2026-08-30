import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createLoginVerificationChallenges() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS login_verification_challenges (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel TEXT NOT NULL DEFAULT 'main',
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        used_at TIMESTAMP
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_login_verification_challenges_user
      ON login_verification_challenges(user_id, created_at DESC)
    `);
    console.log("[Migration] ✅ Tabla login_verification_challenges creada/verificada");
  } catch (error: any) {
    console.error("[Migration] Error en login_verification_challenges:", error.message);
  }
}