import { neon } from '@neondatabase/serverless';

/**
 * Sincroniza la columna number_of_vehicles en companies
 * Para PESV (Plan Estratégico de Seguridad Vial) - Resolución 40595/2022
 */
export async function syncCompanyVehiclesColumn() {
  console.log('[Migration] Sincronizando columna number_of_vehicles en companies...');

  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Verificar si la columna ya existe
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name = 'number_of_vehicles'
    `;

    if (checkColumn.length > 0) {
      console.log('[Migration] ✅ Columna number_of_vehicles ya existe en companies');
      return;
    }

    // Agregar la columna
    await sql`
      ALTER TABLE companies 
      ADD COLUMN number_of_vehicles INTEGER DEFAULT 0
    `;

    console.log('[Migration] ✅ Columna number_of_vehicles agregada a companies');
  } catch (error: any) {
    // Si ya existe, ignorar el error
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columna number_of_vehicles ya existe en companies');
      return;
    }
    console.error('[Migration] ⚠️ Error sincronizando number_of_vehicles:', error.message);
    throw error;
  }
}
