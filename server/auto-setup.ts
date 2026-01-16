#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script automático de configuración inicial
 * Ejecuta migraciones y seeds para preparar la base de datos
 */
async function autoSetup() {
  console.log('🚀 Iniciando configuración automática de SST Colombia...\n');

  try {
    // Paso 1: Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    await db.execute(sql`SELECT 1`);
    console.log('   ✅ Conexión exitosa\n');

    // Paso 2: Ejecutar migraciones
    console.log('2️⃣ Aplicando migraciones de base de datos...');
    try {
      execSync('npx drizzle-kit push --force', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('   ✅ Migraciones aplicadas exitosamente\n');
    } catch (error) {
      console.log('   ⚠️ Error al aplicar migraciones (puede ser normal si ya están aplicadas)\n');
    }

    // Paso 3: Ejecutar seed de admin
    console.log('3️⃣ Creando usuario administrador...');
    const { seedAdminUser } = await import('./seed-admin');
    await seedAdminUser();
    console.log('   ✅ Usuario admin configurado\n');

    // Paso 4: Ejecutar seed de datos SST
    console.log('4️⃣ Cargando datos maestros SST...');
    const { seedSstCatalog } = await import('./sst-seed');
    await seedSstCatalog();
    console.log('   ✅ Datos SST cargados\n');

    console.log('🎉 ¡Configuración completada exitosamente!\n');
    console.log('📝 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123\n');
    console.log('🌐 Ahora puedes iniciar la aplicación con: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error);
    console.error('\nPor favor revisa los errores arriba y vuelve a intentar.');
    process.exit(1);
  }
}

// Ejecutar setup
autoSetup();
