import { db } from '../db';

/**
 * Sincroniza las columnas document_url y document_file_name en la tabla medical_exams
 * document_url almacena la URL del archivo del examen médico
 * document_file_name almacena el nombre original del archivo subido
 */
export async function syncMedicalExamsDocumentUrl() {
  console.log('[Migration] Sincronizando columna document_url en medical_exams...');
  
  try {
    // Check if document_url column exists
    const checkResult = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medical_exams' 
      AND column_name = 'document_url'
    `);
    
    if (checkResult.rows.length === 0) {
      await db.execute(`
        ALTER TABLE medical_exams 
        ADD COLUMN document_url TEXT
      `);
      console.log('[Migration] ✅ Columna document_url agregada a medical_exams');
    } else {
      console.log('[Migration] ✅ Columna document_url ya existe en medical_exams');
    }

    // Check if document_file_name column exists
    const checkFileName = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medical_exams' 
      AND column_name = 'document_file_name'
    `);
    
    if (checkFileName.rows.length === 0) {
      await db.execute(`
        ALTER TABLE medical_exams 
        ADD COLUMN document_file_name TEXT
      `);
      console.log('[Migration] ✅ Columna document_file_name agregada a medical_exams');
    } else {
      console.log('[Migration] ✅ Columna document_file_name ya existe en medical_exams');
    }
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando columnas medical_exams:', error.message);
    throw error;
  }
}
