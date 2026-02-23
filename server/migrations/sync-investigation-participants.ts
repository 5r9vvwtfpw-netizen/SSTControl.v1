import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncInvestigationParticipants(): Promise<void> {
  console.log('[Migration] Sincronizando tabla investigation_participants...');
  
  try {
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'investigation_participants'
      ) as table_exists
    `);
    
    const tableExists = tableCheck.rows?.[0]?.table_exists;
    
    if (!tableExists) {
      await db.execute(sql`
        CREATE TABLE investigation_participants (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          investigation_id VARCHAR NOT NULL REFERENCES accident_investigations(id) ON DELETE CASCADE,
          participant_name TEXT NOT NULL,
          participant_document TEXT,
          participant_role TEXT NOT NULL,
          participant_position TEXT,
          participant_area TEXT,
          has_license INTEGER NOT NULL DEFAULT 0,
          license_number TEXT,
          license_expiry DATE,
          license_verified INTEGER NOT NULL DEFAULT 0,
          participation_date DATE,
          signature TEXT,
          observations TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('[Migration] ✅ Tabla investigation_participants creada');
      return;
    }

    const columnsToAdd = [
      { name: 'participation_date', type: 'DATE' },
      { name: 'signature', type: 'TEXT' },
      { name: 'observations', type: 'TEXT' },
    ];

    let columnsAdded = 0;
    for (const col of columnsToAdd) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE investigation_participants 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `));
        columnsAdded++;
      } catch (err: any) {
        if (!err.message?.includes('already exists')) {
          console.log(`[Migration] Columna ${col.name}: ${err.message}`);
        }
      }
    }

    if (columnsAdded === 0) {
      console.log('[Migration] ✅ Tabla investigation_participants ya está sincronizada');
    } else {
      console.log(`[Migration] ✅ ${columnsAdded} columnas sincronizadas en investigation_participants`);
    }
  } catch (error: any) {
    console.error('[Migration] Error sincronizando investigation_participants:', error.message);
  }
}
