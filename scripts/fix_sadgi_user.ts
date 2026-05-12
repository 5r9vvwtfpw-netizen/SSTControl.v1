import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq, or, sql } from "drizzle-orm";

async function main() {
  console.log("Buscando usuarios con email ladic2023@icloud.com o username SADGI-1...");
  
  const found = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    role: users.role,
    companyId: users.companyId,
    emailVerifiedAt: users.emailVerifiedAt,
    createdAt: users.createdAt,
  }).from(users).where(
    or(
      eq(users.email, 'ladic2023@icloud.com'),
      sql`lower(${users.username}) = 'sadgi-1'`,
      eq(users.username, 'admin_sadgi'),
    )
  );

  console.log(`Encontrados: ${found.length}`);
  found.forEach(u => {
    console.log(JSON.stringify(u, null, 2));
    console.log("---");
  });

  // Delete unverified users (emailVerifiedAt is null and no companyId)
  const unverifiedWithoutCompany = found.filter(u => !u.emailVerifiedAt && !u.companyId);
  
  if (unverifiedWithoutCompany.length > 0) {
    console.log(`\nEliminando ${unverifiedWithoutCompany.length} usuario(s) sin verificar y sin empresa...`);
    for (const u of unverifiedWithoutCompany) {
      await db.delete(users).where(eq(users.id, u.id));
      console.log(`  ✅ Eliminado: ${u.username} (${u.email})`);
    }
    console.log("Listo. El usuario puede registrarse de nuevo.");
  } else {
    console.log("\nNo hay usuarios sin verificar sin empresa. Verificar manualmente.");
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
