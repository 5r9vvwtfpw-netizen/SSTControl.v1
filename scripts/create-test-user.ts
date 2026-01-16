import { db } from "../server/db";
import { users, companies } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestUser() {
  try {
    // Get first company
    const [company] = await db.select().from(companies).limit(1);
    
    if (!company) {
      console.error("No company found. Please create a company first.");
      process.exit(1);
    }

    // Check if test user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, "test@sst.co")).limit(1);
    
    if (existingUser.length > 0) {
      console.log("Test user already exists");
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await hashPassword("test123");
    
    await db.insert(users).values({
      username: "testuser",
      email: "test@sst.co",
      password: hashedPassword,
      role: "coordinador_sst",
      fullName: "Usuario de Prueba",
      companyId: company.id,
      department: "SST",
    });

    console.log("Test user created successfully!");
    console.log("Email: test@sst.co");
    console.log("Password: test123");
    console.log("Role: coordinador_sst");
    console.log("Company:", company.razonSocial);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
