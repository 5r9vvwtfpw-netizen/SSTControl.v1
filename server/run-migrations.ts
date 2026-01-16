/**
 * Ejecuta migraciones de base de datos automáticamente
 * NOTA: En Replit, las migraciones se deben ejecutar manualmente desde el panel Database
 * Esta función está deshabilitada para evitar problemas en producción
 */
export async function runMigrations() {
  // Las migraciones automáticas pueden causar problemas en producción
  // En su lugar, el schema se debe sincronizar manualmente usando:
  // npm run db:push
  console.log('ℹ️ Verificación de migraciones: las tablas deben existir previamente');
  return;
}
