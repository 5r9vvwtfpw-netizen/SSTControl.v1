import { db } from '../db';
import { sql } from 'drizzle-orm';

const PARTICIPANT_ROLES = [
  "investigador_lider",
  "copasst",
  "profesional_sst",
  "testigo",
  "jefe_inmediato",
  "trabajador_afectado",
  "brigadista",
  "otro"
];

async function syncParticipantRoleEnum(): Promise<void> {
  try {
    const enumCheck = await db.execute(sql`
      SELECT 1 FROM pg_type WHERE typname = 'investigation_participant_role'
    `);
    
    if (!enumCheck.rows?.length) {
      await db.execute(sql.raw(
        `CREATE TYPE investigation_participant_role AS ENUM (${PARTICIPANT_ROLES.map(r => `'${r}'`).join(', ')})`
      ));
      console.log('[Migration] ✅ Enum investigation_participant_role creado');
    } else {
      const existingValues = await db.execute(sql`
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'investigation_participant_role')
      `);
      const existingSet = new Set(existingValues.rows.map((r: any) => r.enumlabel));
      
      for (const role of PARTICIPANT_ROLES) {
        if (!existingSet.has(role)) {
          try {
            await db.execute(sql.raw(`ALTER TYPE investigation_participant_role ADD VALUE IF NOT EXISTS '${role}'`));
            console.log(`[Migration] ✅ Agregado valor '${role}' a investigation_participant_role`);
          } catch (e: any) {
            if (!e.message?.includes('already exists')) {
              console.log(`[Migration] ⚠️ No se pudo agregar '${role}': ${e.message}`);
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error('[Migration] Error sincronizando enum investigation_participant_role:', error.message);
  }
}

export async function syncInvestigationParticipants(): Promise<void> {
  console.log('[Migration] Sincronizando tabla investigation_participants...');
  
  try {
    await syncParticipantRoleEnum();

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
          participant_role investigation_participant_role NOT NULL,
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

    try {
      const colTypeCheck = await db.execute(sql`
        SELECT data_type, udt_name FROM information_schema.columns 
        WHERE table_name = 'investigation_participants' AND column_name = 'participant_role'
      `);
      const colType = colTypeCheck.rows?.[0];
      if (colType && colType.udt_name !== 'investigation_participant_role') {
        console.log(`[Migration] Convirtiendo participant_role de ${colType.udt_name} a enum...`);
        await db.execute(sql`
          ALTER TABLE investigation_participants 
          ALTER COLUMN participant_role TYPE investigation_participant_role 
          USING participant_role::investigation_participant_role
        `);
        console.log('[Migration] ✅ Columna participant_role convertida a enum');
      }
    } catch (convErr: any) {
      console.log(`[Migration] ⚠️ No se pudo convertir participant_role a enum: ${convErr.message}`);
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
