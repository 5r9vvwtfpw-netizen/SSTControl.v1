import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function resetBetaPassword() {
  try {
    console.log("🔐 Reseteando contraseña del usuario beta...");
    
    const newPassword = "Beta2025!";
    const hashedPassword = await hashPassword(newPassword);
    
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, "beta"))
      .returning();
    
    if (result.length > 0) {
      console.log("✅ Contraseña actualizada exitosamente");
      console.log("📧 Username: beta");
      console.log("👤 Role:", result[0].role);
    } else {
      console.log("⚠️ Usuario 'beta' no encontrado");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al resetear contraseña:", error);
    process.exit(1);
  }
}

resetBetaPassword();
