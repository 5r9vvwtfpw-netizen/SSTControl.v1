import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Crea el usuario superadmin del proveedor SaaS si no existe
 * El superadmin NO tiene companyId (acceso global cross-tenant)
 */
async function seedSuperadminUser() {
  try {
    console.log("🔐 Verificando usuario superadmin (proveedor SaaS)...");

    // Verificar si ya existe el usuario superadmin
    const existingSuperadmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "superadmin"))
      .limit(1);

    if (existingSuperadmin.length > 0) {
      console.log("✅ Usuario superadmin ya existe");
      return;
    }

    console.log("👤 Creando usuario superadmin del proveedor SaaS...");

    const hashedPassword = await hashPassword("superadmin123");
    
    await db
      .insert(schema.users)
      .values({
        username: "superadmin",
        password: hashedPassword,
        email: "superadmin@sstcolombia.com",
        fullName: "Administrador Proveedor SaaS",
        role: "superadmin",
        companyId: null, // Superadmin NO pertenece a ninguna empresa (acceso global)
      });

    console.log("✅ Usuario superadmin creado exitosamente");
    console.log("   Usuario: superadmin");
    console.log("   Contraseña: superadmin123");
    console.log("   Rol: Superadministrador (proveedor SaaS - acceso global)");
  } catch (error) {
    console.error("⚠️ Error al crear usuario superadmin:", error);
  }
}

/**
 * Crea el usuario admin si no existe y lo asigna a la empresa DEMO-PRUEBA
 * Mantiene strict tenant isolation (Ley 1581/2012 compliance)
 */
export async function seedAdminUser() {
  try {
    console.log("🔐 Verificando usuario admin...");

    // Verificar si las tablas existen
    try {
      const tableCheck = await db.execute(sql`SELECT to_regclass('public.users')`);
      if (!tableCheck.rows[0]?.to_regclass) {
        console.log("⚠️ Tabla 'users' no existe. Ejecuta 'npm run db:push' primero.");
        return;
      }
    } catch (e) {
      console.log("⚠️ No se pudo verificar la tabla users. Base de datos podría no estar lista.");
      return;
    }

    // Buscar empresa DEMO-PRUEBA para asignar al admin
    const demoCompany = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.name, "DEMO-PRUEBA"))
      .limit(1);

    if (demoCompany.length === 0) {
      console.log("⚠️ Empresa DEMO-PRUEBA no existe. El admin no puede ser creado sin empresa asignada.");
      return;
    }

    const demoCompanyId = demoCompany[0].id;

    // Verificar si ya existe el usuario admin
    const existingAdmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "admin"))
      .limit(1);

    if (existingAdmin.length > 0) {
      // Actualizar admin existente si no tiene companyId
      if (!existingAdmin[0].companyId) {
        await db
          .update(schema.users)
          .set({ companyId: demoCompanyId })
          .where(eq(schema.users.username, "admin"));
        console.log("✅ Usuario admin actualizado con empresa DEMO-PRUEBA");
      } else {
        console.log("✅ Usuario admin ya existe");
      }
      // Siempre verificar/crear superadmin, LSO y soporte antes de salir
      await seedSuperadminUser();
      await seedLsoUser();
      await seedSoporteUser();
      return;
    }

    console.log("👤 Creando usuario admin...");

    // Crear usuario admin asignado a DEMO-PRUEBA
    const hashedPassword = await hashPassword("admin123");
    
    await db
      .insert(schema.users)
      .values({
        username: "admin",
        password: hashedPassword,
        email: "admin@sstcolombia.com",
        fullName: "Administrador del Sistema",
        role: "admin",
        companyId: demoCompanyId, // Admin asignado a DEMO-PRUEBA (strict tenant isolation)
      });

    console.log("✅ Usuario admin creado exitosamente");
    console.log("   Usuario: admin");
    console.log("   Contraseña: admin123");
    console.log("   Rol: Administrador (empresa: DEMO-PRUEBA)");
  } catch (error) {
    console.error("⚠️ Error al crear usuario admin:", error);
    console.log("   Esto es normal si la base de datos no está configurada aún.");
    console.log("   Ejecuta 'npm run db:push' en el panel Database primero.");
    // No hacer throw - permitir que la app continúe
  }

  // También crear el superadmin del proveedor SaaS
  await seedSuperadminUser();
  
  // Crear usuario LSO de ejemplo si no existe ninguno
  await seedLsoUser();
  
  // Crear usuario de soporte si no existe ninguno
  await seedSoporteUser();
}

/**
 * Crea un usuario LSO (Licenciado en Salud Ocupacional) de ejemplo si no existe ninguno
 * Esto asegura que el directorio de profesionales licenciados muestre al menos un registro
 */
async function seedLsoUser() {
  try {
    console.log("🔐 Verificando usuarios LSO...");

    // Verificar si existe algún usuario con rol 'lso'
    const existingLso = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, "lso"))
      .limit(1);

    if (existingLso.length > 0) {
      console.log("✅ Ya existe al menos un usuario LSO");
      return;
    }

    console.log("👤 Creando usuario LSO de ejemplo...");

    const hashedPassword = await hashPassword("lso123");
    
    await db
      .insert(schema.users)
      .values({
        username: "lsoejemplo",
        password: hashedPassword,
        email: "lso@sstcolombia.com",
        fullName: "Dr. Carlos Rodríguez García",
        role: "lso",
        companyId: null,
        department: "Salud Ocupacional",
        sstProfessionType: "profesional_sst",
        sstLicenseNumber: "LSO-2024-001",
        sstLicenseIssuer: "Ministerio de Trabajo Colombia",
        sstLicenseIssuedAt: new Date("2024-01-15"),
        sstLicenseExpiresAt: new Date("2029-01-15"),
        sstLicenseStatus: "vigente",
      });

    console.log("✅ Usuario LSO de ejemplo creado exitosamente");
    console.log("   Usuario: lsoejemplo");
    console.log("   Contraseña: lso123");
    console.log("   Licencia: LSO-2024-001 (vigente)");
  } catch (error) {
    console.error("⚠️ Error al crear usuario LSO:", error);
  }
}

/**
 * Crea un usuario de soporte por defecto si no existe ninguno
 * Esto asegura que siempre haya al menos un usuario con rol 'soporte'
 * para gestionar tickets desde el portal de soporte
 */
async function seedSoporteUser() {
  try {
    console.log("🔐 Verificando usuarios de soporte...");

    const existingSoporte = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, "soporte"))
      .limit(1);

    if (existingSoporte.length > 0) {
      console.log("✅ Ya existe al menos un usuario de soporte");
      return;
    }

    console.log("👤 Creando usuario de soporte por defecto...");

    const hashedPassword = await hashPassword("soporte2026");
    
    await db
      .insert(schema.users)
      .values({
        username: "soporte",
        password: hashedPassword,
        email: "soporte@sstcolombia.com",
        fullName: "Agente de Soporte",
        role: "soporte",
        companyId: null,
      });

    console.log("✅ Usuario de soporte creado exitosamente");
    console.log("   Usuario: soporte");
    console.log("   Contraseña: soporte2026");
    console.log("   Rol: Soporte (gestión de tickets)");
  } catch (error) {
    console.error("⚠️ Error al crear usuario de soporte:", error);
  }
}
