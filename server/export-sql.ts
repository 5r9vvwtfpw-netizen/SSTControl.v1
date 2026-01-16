import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para exportar todos los datos de la base de datos como SQL
 * Genera un archivo SQL que puede ejecutarse en producción
 */

// Lista de tablas en orden correcto para respetar foreign keys
const TABLES = [
  // Tablas base
  'componentes_sst',
  'estandares_sst',
  'companies',
  'users',
  
  // Trabajadores y relacionados
  'workers',
  'job_profiles',
  'contracts',
  'medical_exams',
  'responsible_designations',
  'resource_allocations',
  'afiliaciones_ssss',
  'trabajadores_alto_riesgo',
  
  // SST básico
  'accidents',
  'trainings',
  'training_attendees',
  'inspections',
  'preventive_measures',
  'occupational_diseases',
  
  // PESV
  'vehicles',
  'drivers',
  'vehicle_inspections',
  'road_incidents',
  'road_safety_trainings',
  'road_safety_attendees',
  'pesv_audits',
  
  // Actas y programas
  'copasst_actas',
  'comite_convivencia_actas',
  'programas_capacitacion',
  'curso_50_horas',
  'registros_induccion',
  
  // Ambiental
  'environmental_measurements',
  'hazardous_substances',
  
  // SVE
  'sve_programs',
  'sve_cases',
  
  // Políticas y evaluaciones
  'politicas_sst',
  'evaluaciones_sst',
  'respuestas_estandares',
  'acciones_mejora',
  'sst_evaluations',
  'sst_evaluation_items',
  'sst_evidence',
  
  // Plan de trabajo
  'planes_trabajo_anual',
  'actividades_plan_trabajo',
  
  // Matriz legal
  'matriz_legal',
  
  // Objetivos e indicadores - Comentados porque no existen en DB
  // 'objetivos_sst',
  // 'indicadores_sst',
  // 'mediciones_indicadores',
  // 'datos_calculo_indicadores',
  
  // Notificaciones
  'email_notifications',
  
  // Training programs
  'training_programs',
  'program_trainings',
  'program_training_attendance'
];

async function exportSQL() {
  console.log('🔄 Iniciando exportación SQL...');
  
  let sqlContent = `-- Exportación de datos SST Colombia
-- Fecha: ${new Date().toISOString()}
-- Entorno: ${process.env.NODE_ENV || 'development'}

SET session_replication_role = 'replica';

`;

  try {
    for (const tableName of TABLES) {
      console.log(`📦 Exportando ${tableName}...`);
      
      const result = await pool.query(`SELECT * FROM ${tableName}`);
      
      if (result.rows.length === 0) {
        console.log(`   ⚠️  Sin datos en ${tableName}`);
        continue;
      }
      
      console.log(`   ✅ ${result.rows.length} registros`);
      
      sqlContent += `\n-- Tabla: ${tableName} (${result.rows.length} registros)\n`;
      
      for (const row of result.rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'boolean') return val ? 'true' : 'false';
          if (typeof val === 'number') return val.toString();
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'string') {
            // Escapar comillas simples
            const escaped = val.replace(/'/g, "''");
            return `'${escaped}'`;
          }
          if (Array.isArray(val)) {
            const arrayContent = val.map(v => `"${v.replace(/"/g, '\\"')}"`).join(',');
            return `'{${arrayContent}}'`;
          }
          return `'${val}'`;
        });
        
        sqlContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
      }
    }
    
    sqlContent += `\nSET session_replication_role = 'origin';\n`;
    
    const outputPath = path.join(__dirname, '..', 'data-export.sql');
    fs.writeFileSync(outputPath, sqlContent);
    
    console.log('\n✅ Exportación SQL completada exitosamente!');
    console.log(`📁 Archivo guardado en: ${outputPath}`);
    console.log('\n💡 Para importar en producción, ejecuta:');
    console.log('   psql $DATABASE_URL < data-export.sql');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    await pool.end();
    process.exit(1);
  }
}

exportSQL();
