import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Check if admin already exists
  const existingAdmin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, "admin"),
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    await pool.end();
    return;
  }

  // Create admin user
  const hashedPassword = await hashPassword("admin123");
  await db.insert(schema.users).values({
    username: "admin",
    password: hashedPassword,
    role: "admin",
    workerId: null,
  });

  console.log("✅ Admin user created successfully");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("⚠️  IMPORTANTE: Cambiar la contraseña después del primer login");

  await pool.end();
}

main().catch((error) => {
  console.error("Error creating admin user:", error);
  process.exit(1);
});
