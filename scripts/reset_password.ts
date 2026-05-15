/**
 * Reset password for a user in production.
 * Uso: NODE_ENV=production npx tsx scripts/reset_password.ts <username> <nueva_contraseña>
 */
import { Pool } from "pg";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as dotenv from "dotenv";
dotenv.config();

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error("Uso: NODE_ENV=production npx tsx scripts/reset_password.ts <username> <nueva_contraseña>");
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || "5432"),
    database: process.env.AWS_RDS_DATABASE || "postgres",
    user: process.env.AWS_RDS_USER || "postgres",
    password: process.env.AWS_RDS_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  // Verificar que el usuario existe
  const check = await pool.query(
    `SELECT id, username, email, role FROM users WHERE username = $1`,
    [username]
  );

  if (check.rows.length === 0) {
    console.error(`❌ Usuario "${username}" no encontrado en producción.`);
    await pool.end();
    process.exit(1);
  }

  const user = check.rows[0];
  console.log(`Usuario encontrado: ${user.username} | ${user.email} | rol: ${user.role}`);

  // Generar nuevo hash
  const hashed = await hashPassword(newPassword);

  // Actualizar en BD
  await pool.query(
    `UPDATE users SET password = $1 WHERE username = $2`,
    [hashed, username]
  );

  console.log(`✅ Contraseña de "${username}" actualizada exitosamente.`);
  console.log(`   Nueva contraseña: ${newPassword}`);

  await pool.end();
}

main().catch(console.error);
