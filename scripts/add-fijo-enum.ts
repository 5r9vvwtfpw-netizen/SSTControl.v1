import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

// Este script agrega el valor 'fijo' al enum contract_type en la base de datos
async function addFijoToEnum() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurada");
  }

  console.log("🔧 Conectando a la base de datos...");
  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlClient);

  try {
    console.log("📝 Agregando 'fijo' al enum contract_type...");
    
    // Intentar agregar el valor 'fijo' al enum
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'fijo' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'contract_type')
        ) THEN
          ALTER TYPE contract_type ADD VALUE 'fijo';
        END IF;
      END$$;
    `);
    
    console.log("✅ Enum actualizado exitosamente");
    
    // Verificar los valores del enum
    console.log("\n📋 Valores actuales del enum contract_type:");
    const result = await db.execute(sql`
      SELECT unnest(enum_range(NULL::contract_type)) as value;
    `);
    
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.value}`);
    });
    
    console.log("\n🎉 ¡Script completado exitosamente!");
    
  } catch (error: any) {
    console.error("❌ Error al actualizar el enum:", error.message);
    throw error;
  }
}

addFijoToEnum()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
