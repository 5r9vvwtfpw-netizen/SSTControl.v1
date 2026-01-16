import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para importar datos desde el archivo SQL a la base de datos de producción
 * ADVERTENCIA: Este proceso puede sobrescribir datos existentes
 */

async function importDataSQL() {
  console.log('🔄 Iniciando importación SQL...');
  console.log(`⚠️  Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Leer archivo SQL
  const sqlPath = path.join(__dirname, '..', 'data-export.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ No se encontró el archivo data-export.sql');
    console.error('   Por favor ejecuta primero el script de exportación:');
    console.error('   NODE_ENV=development tsx server/export-sql.ts');
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  // Extraer información del archivo
  const lines = sqlContent.split('\n');
  const dateMatch = sqlContent.match(/Fecha: (.*)/);
  const envMatch = sqlContent.match(/Entorno: (.*)/);
  
  console.log(`📅 Datos exportados el: ${dateMatch ? dateMatch[1] : 'desconocido'}`);
  console.log(`🌍 Exportados desde entorno: ${envMatch ? envMatch[1] : 'desconocido'}`);
  
  // Contar número de INSERT statements
  const insertCount = (sqlContent.match(/INSERT INTO/g) || []).length;
  console.log(`📦 Total de registros a importar: ${insertCount}`);
  
  console.log('\n⚠️  ADVERTENCIA: Se importarán los datos desde el archivo SQL');
  console.log('   Los registros duplicados serán ignorados (ON CONFLICT DO NOTHING)');
  console.log('\n   Presiona Ctrl+C en los próximos 5 segundos para cancelar...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log('\n📥 Importando datos...');
    
    // Ejecutar el archivo SQL completo
    await pool.query(sqlContent);
    
    console.log('\n✅ Importación SQL completada exitosamente!');
    console.log(`📊 ${insertCount} registros procesados`);
    
    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Verifica que los datos se importaron correctamente');
    console.log('   2. Prueba el inicio de sesión');
    console.log('   3. Revisa los módulos principales del sistema');
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error durante la importación:', error.message);
    
    if (error.code === '42P01') {
      console.error('\n💡 La tabla no existe. Posibles soluciones:');
      console.error('   1. Asegúrate de haber ejecutado las migraciones: npm run db:push');
      console.error('   2. Verifica que estás conectado a la base de datos correcta');
    } else if (error.code === '23505') {
      console.error('\n💡 Clave duplicada. Esto es normal con ON CONFLICT DO NOTHING');
      console.error('   Los registros duplicados fueron ignorados automáticamente');
    }
    
    await pool.end();
    process.exit(1);
  }
}

importDataSQL();
