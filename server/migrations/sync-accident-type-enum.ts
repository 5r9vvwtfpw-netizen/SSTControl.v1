import { db } from '../db';
import { sql } from 'drizzle-orm';

const ACCIDENT_TYPES = [
  "caida_mismo_nivel",
  "caida_diferente_nivel",
  "caida_objetos",
  "caida",
  "golpe_objeto",
  "golpe_objeto_movil",
  "golpe_herramientas",
  "proyeccion_particulas",
  "golpe",
  "corte",
  "punzamiento",
  "amputacion",
  "atrapamiento",
  "aplastamiento",
  "atrapamiento_maquinaria",
  "quemadura_termica",
  "quemadura_quimica",
  "quemadura_electrica",
  "quemadura_radiacion",
  "quemadura",
  "electrocucion",
  "choque_electrico",
  "arco_electrico",
  "intoxicacion",
  "inhalacion_gases",
  "contacto_sustancias",
  "exposicion_biologica",
  "mordedura_picadura",
  "sobreesfuerzo",
  "movimiento_repetitivo",
  "manipulacion_cargas",
  "postura_forzada",
  "accidente_transito",
  "accidente_vehiculo_trabajo",
  "atropellamiento",
  "derrumbe",
  "explosion",
  "incendio",
  "asfixia",
  "inmersion",
  "ruido_vibracion",
  "exposicion_temperaturas",
  "radiacion",
  "agresion_fisica",
  "agresion_animal",
  "estres_agudo",
  "otro"
];

export async function syncAccidentTypeEnum() {
  console.log('[Migration] Sincronizando enum accident_type...');
  
  try {
    const existingValues = await db.execute(sql`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'accident_type')
    `);
    
    const existingSet = new Set(existingValues.rows.map((r: any) => r.enumlabel));
    
    for (const accidentType of ACCIDENT_TYPES) {
      if (!existingSet.has(accidentType)) {
        try {
          await db.execute(sql.raw(`ALTER TYPE accident_type ADD VALUE IF NOT EXISTS '${accidentType}'`));
          console.log(`[Migration] ✅ Agregado valor '${accidentType}' a accident_type`);
        } catch (e: any) {
          if (!e.message?.includes('already exists')) {
            console.log(`[Migration] ⚠️ No se pudo agregar '${accidentType}': ${e.message}`);
          }
        }
      }
    }
    
    console.log('[Migration] ✅ Enum accident_type sincronizado');
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando accident_type:', error.message);
  }
}
