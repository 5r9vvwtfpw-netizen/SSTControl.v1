import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createBetaUser() {
  try {
    console.log("🔐 Creando usuario beta...\n");

    // Verificar si ya existe
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "beta@sstcolombia.com"),
    });

    if (existing) {
      console.log("⚠️  Usuario beta ya existe. Actualizando contraseña...");
      const hashedPassword = await hashPassword("Beta2025!");
      
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where((u) => u.email.eq("beta@sstcolombia.com"))
        .execute();
      
      console.log("✅ Contraseña actualizada");
    } else {
      console.log("➕ Creando nuevo usuario beta...");
      const hashedPassword = await hashPassword("Beta2025!");
      
      // Obtener company_id del admin
      const admin = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, "admin@sstcolombia.com"),
      });

      if (!admin) {
        throw new Error("Usuario admin no encontrado");
      }

      await db.insert(users).values({
        username: "beta",
        email: "beta@sstcolombia.com",
        password: hashedPassword,
        role: "coordinador_sst",
        company_id: admin.company_id,
      });

      console.log("✅ Usuario beta creado exitosamente");
    }

    console.log("\n📋 Credenciales del usuario beta:");
    console.log("   Email: beta@sstcolombia.com");
    console.log("   Password: Beta2025!");
    console.log("   Rol: coordinador_sst (Coordinador SST - Acceso completo SST)\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createBetaUser();
