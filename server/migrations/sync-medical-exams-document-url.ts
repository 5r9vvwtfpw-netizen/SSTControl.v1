import { db } from '../db';

/**
 * Sincroniza la columna document_url en la tabla medical_exams
 * Esta columna almacena la URL del archivo del examen médico
 */
export async function syncMedicalExamsDocumentUrl() {
  console.log('[Migration] Sincronizando columna document_url en medical_exams...');
  
  try {
    // Check if column exists
    const checkResult = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medical_exams' 
      AND column_name = 'document_url'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the column
      await db.execute(`
        ALTER TABLE medical_exams 
        ADD COLUMN document_url TEXT
      `);
      console.log('[Migration] ✅ Columna document_url agregada a medical_exams');
    } else {
      console.log('[Migration] ✅ Columna document_url ya existe en medical_exams');
    }
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando document_url:', error.message);
    throw error;
  }
}
