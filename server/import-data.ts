import { db } from './db.js';
import * as schema from '../shared/schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para importar datos desde el archivo de exportación a la base de datos de producción
 * ADVERTENCIA: Este script eliminará todos los datos existentes antes de importar
 */

async function importData() {
  console.log('🔄 Iniciando importación de datos...');
  console.log(`⚠️  Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Leer archivo de datos
  const dataPath = path.join(__dirname, '..', 'data-export.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ No se encontró el archivo data-export.json');
    console.error('   Por favor ejecuta primero: npm run export-data');
    process.exit(1);
  }
  
  const exportData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  console.log(`📅 Datos exportados el: ${exportData.exportDate}`);
  console.log(`🌍 Exportados desde entorno: ${exportData.environment}`);
  console.log('\n⚠️  ADVERTENCIA: Se eliminarán todos los datos existentes');
  console.log('   Presiona Ctrl+C en los próximos 5 segundos para cancelar...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log('\n🗑️  Limpiando base de datos...');
    
    // Eliminar en orden inverso para respetar foreign keys
    await db.delete(schema.datosCalculoIndicadores);
    await db.delete(schema.medicionesIndicadores);
    await db.delete(schema.indicadoresSst);
    await db.delete(schema.objetivosSst);
    await db.delete(schema.matrizLegal);
    await db.delete(schema.actividadesPlanAnual);
    await db.delete(schema.planesAnualesTrabajo);
    await db.delete(schema.sstEvidence);
    await db.delete(schema.sstEvaluationItems);
    await db.delete(schema.sstEvaluations);
    await db.delete(schema.politicasSst);
    await db.delete(schema.sveCases);
    await db.delete(schema.svePrograms);
    await db.delete(schema.hazardousChemicals);
    await db.delete(schema.environmentalMeasurements);
    await db.delete(schema.registrosInduccion);
    await db.delete(schema.curso50Horas);
    await db.delete(schema.programasCapacitacionAnual);
    await db.delete(schema.programasCapacitacion);
    await db.delete(schema.comiteConvivenciaActas);
    await db.delete(schema.copasstActas);
    await db.delete(schema.pesvIncidents);
    await db.delete(schema.pesvTrips);
    await db.delete(schema.pesvVehicles);
    await db.delete(schema.pesvDrivers);
    await db.delete(schema.safetyInspections);
    await db.delete(schema.trainings);
    await db.delete(schema.accidents);
    await db.delete(schema.trabajadoresAltoRiesgo);
    await db.delete(schema.afiliacionesSSSS);
    await db.delete(schema.resourceAllocations);
    await db.delete(schema.responsibleDesignations);
    await db.delete(schema.medicalExams);
    await db.delete(schema.laborContracts);
    await db.delete(schema.jobProfiles);
    await db.delete(schema.workers);
    await db.delete(schema.users);
    await db.delete(schema.companies);
    // No eliminamos sstComponents ni sstStandards porque son datos maestros
    
    console.log('✅ Base de datos limpiada');
    
    console.log('\n📥 Importando datos...');
    
    // Importar en orden correcto para respetar foreign keys
    
    // 1. Componentes y estándares SST (si no existen)
    if (exportData.tables.sstComponents?.length > 0) {
      console.log('📦 Importando componentes SST...');
      for (const item of exportData.tables.sstComponents) {
        await db.insert(schema.sstComponents).values(item).onConflictDoNothing();
      }
    }
    
    if (exportData.tables.sstStandards?.length > 0) {
      console.log('📦 Importando estándares SST...');
      for (const item of exportData.tables.sstStandards) {
        await db.insert(schema.sstStandards).values(item).onConflictDoNothing();
      }
    }
    
    // 2. Empresas
    if (exportData.tables.companies?.length > 0) {
      console.log('🏢 Importando empresas...');
      await db.insert(schema.companies).values(exportData.tables.companies);
    }
    
    // 3. Usuarios
    if (exportData.tables.users?.length > 0) {
      console.log('👤 Importando usuarios...');
      await db.insert(schema.users).values(exportData.tables.users);
    }
    
    // 4. Trabajadores
    if (exportData.tables.workers?.length > 0) {
      console.log('👷 Importando trabajadores...');
      await db.insert(schema.workers).values(exportData.tables.workers);
    }
    
    // 5. Perfiles de cargo
    if (exportData.tables.jobProfiles?.length > 0) {
      console.log('📋 Importando perfiles de cargo...');
      await db.insert(schema.jobProfiles).values(exportData.tables.jobProfiles);
    }
    
    // 6. Contratos laborales
    if (exportData.tables.laborContracts?.length > 0) {
      console.log('📄 Importando contratos laborales...');
      await db.insert(schema.laborContracts).values(exportData.tables.laborContracts);
    }
    
    // 7. Exámenes médicos
    if (exportData.tables.medicalExams?.length > 0) {
      console.log('🏥 Importando exámenes médicos...');
      await db.insert(schema.medicalExams).values(exportData.tables.medicalExams);
    }
    
    // 8. Designaciones de responsabilidad
    if (exportData.tables.responsibleDesignations?.length > 0) {
      console.log('👔 Importando designaciones de responsabilidad...');
      await db.insert(schema.responsibleDesignations).values(exportData.tables.responsibleDesignations);
    }
    
    // 9. Asignación de recursos
    if (exportData.tables.resourceAllocations?.length > 0) {
      console.log('💰 Importando asignación de recursos...');
      await db.insert(schema.resourceAllocations).values(exportData.tables.resourceAllocations);
    }
    
    // 10. Afiliaciones SSSS
    if (exportData.tables.afiliacionesSSSS?.length > 0) {
      console.log('🏛️ Importando afiliaciones SSSS...');
      await db.insert(schema.afiliacionesSSSS).values(exportData.tables.afiliacionesSSSS);
    }
    
    // 11. Trabajadores de alto riesgo
    if (exportData.tables.trabajadoresAltoRiesgo?.length > 0) {
      console.log('⚠️ Importando trabajadores de alto riesgo...');
      await db.insert(schema.trabajadoresAltoRiesgo).values(exportData.tables.trabajadoresAltoRiesgo);
    }
    
    // 12. Accidentes
    if (exportData.tables.accidents?.length > 0) {
      console.log('🚑 Importando accidentes...');
      await db.insert(schema.accidents).values(exportData.tables.accidents);
    }
    
    // 13. Capacitaciones
    if (exportData.tables.trainings?.length > 0) {
      console.log('📚 Importando capacitaciones...');
      await db.insert(schema.trainings).values(exportData.tables.trainings);
    }
    
    // 14. Inspecciones de seguridad
    if (exportData.tables.safetyInspections?.length > 0) {
      console.log('🔍 Importando inspecciones de seguridad...');
      await db.insert(schema.safetyInspections).values(exportData.tables.safetyInspections);
    }
    
    // 15. PESV
    if (exportData.tables.pesvDrivers?.length > 0) {
      console.log('🚗 Importando conductores PESV...');
      await db.insert(schema.pesvDrivers).values(exportData.tables.pesvDrivers);
    }
    if (exportData.tables.pesvVehicles?.length > 0) {
      console.log('🚙 Importando vehículos PESV...');
      await db.insert(schema.pesvVehicles).values(exportData.tables.pesvVehicles);
    }
    if (exportData.tables.pesvTrips?.length > 0) {
      console.log('🛣️ Importando viajes PESV...');
      await db.insert(schema.pesvTrips).values(exportData.tables.pesvTrips);
    }
    if (exportData.tables.pesvIncidents?.length > 0) {
      console.log('⚠️ Importando incidentes PESV...');
      await db.insert(schema.pesvIncidents).values(exportData.tables.pesvIncidents);
    }
    
    // 16. Actas COPASST
    if (exportData.tables.copasstActas?.length > 0) {
      console.log('📝 Importando actas COPASST...');
      await db.insert(schema.copasstActas).values(exportData.tables.copasstActas);
    }
    
    // 17. Actas Comité de Convivencia
    if (exportData.tables.comiteConvivenciaActas?.length > 0) {
      console.log('🤝 Importando actas comité de convivencia...');
      await db.insert(schema.comiteConvivenciaActas).values(exportData.tables.comiteConvivenciaActas);
    }
    
    // 18. Programas de capacitación
    if (exportData.tables.programasCapacitacion?.length > 0) {
      console.log('📖 Importando programas de capacitación...');
      await db.insert(schema.programasCapacitacion).values(exportData.tables.programasCapacitacion);
    }
    if (exportData.tables.programasCapacitacionAnual?.length > 0) {
      console.log('📅 Importando programas de capacitación anual...');
      await db.insert(schema.programasCapacitacionAnual).values(exportData.tables.programasCapacitacionAnual);
    }
    
    // 19. Curso 50 horas
    if (exportData.tables.curso50Horas?.length > 0) {
      console.log('🎓 Importando certificados curso 50 horas...');
      await db.insert(schema.curso50Horas).values(exportData.tables.curso50Horas);
    }
    
    // 20. Registros de inducción
    if (exportData.tables.registrosInduccion?.length > 0) {
      console.log('📋 Importando registros de inducción...');
      await db.insert(schema.registrosInduccion).values(exportData.tables.registrosInduccion);
    }
    
    // 21. Mediciones ambientales
    if (exportData.tables.environmentalMeasurements?.length > 0) {
      console.log('🌡️ Importando mediciones ambientales...');
      await db.insert(schema.environmentalMeasurements).values(exportData.tables.environmentalMeasurements);
    }
    
    // 22. Sustancias químicas peligrosas
    if (exportData.tables.hazardousChemicals?.length > 0) {
      console.log('⚗️ Importando sustancias químicas...');
      await db.insert(schema.hazardousChemicals).values(exportData.tables.hazardousChemicals);
    }
    
    // 23. SVE
    if (exportData.tables.svePrograms?.length > 0) {
      console.log('🔬 Importando programas SVE...');
      await db.insert(schema.svePrograms).values(exportData.tables.svePrograms);
    }
    if (exportData.tables.sveCases?.length > 0) {
      console.log('📊 Importando casos SVE...');
      await db.insert(schema.sveCases).values(exportData.tables.sveCases);
    }
    
    // 24. Políticas SST
    if (exportData.tables.politicasSst?.length > 0) {
      console.log('📜 Importando políticas SST...');
      await db.insert(schema.politicasSst).values(exportData.tables.politicasSst);
    }
    
    // 25. Evaluaciones iniciales SST
    if (exportData.tables.sstEvaluations?.length > 0) {
      console.log('✅ Importando evaluaciones iniciales...');
      await db.insert(schema.sstEvaluations).values(exportData.tables.sstEvaluations);
    }
    if (exportData.tables.sstEvaluationItems?.length > 0) {
      console.log('📋 Importando items de evaluación...');
      await db.insert(schema.sstEvaluationItems).values(exportData.tables.sstEvaluationItems);
    }
    if (exportData.tables.sstEvidence?.length > 0) {
      console.log('📎 Importando evidencias...');
      await db.insert(schema.sstEvidence).values(exportData.tables.sstEvidence);
    }
    
    // 26. Plan anual de trabajo
    if (exportData.tables.planesAnualesTrabajo?.length > 0) {
      console.log('📅 Importando planes anuales de trabajo...');
      await db.insert(schema.planesAnualesTrabajo).values(exportData.tables.planesAnualesTrabajo);
    }
    if (exportData.tables.actividadesPlanAnual?.length > 0) {
      console.log('✔️ Importando actividades del plan anual...');
      await db.insert(schema.actividadesPlanAnual).values(exportData.tables.actividadesPlanAnual);
    }
    
    // 27. Matriz legal
    if (exportData.tables.matrizLegal?.length > 0) {
      console.log('⚖️ Importando matriz legal...');
      await db.insert(schema.matrizLegal).values(exportData.tables.matrizLegal);
    }
    
    // 28. Objetivos e indicadores
    if (exportData.tables.objetivosSst?.length > 0) {
      console.log('🎯 Importando objetivos SST...');
      await db.insert(schema.objetivosSst).values(exportData.tables.objetivosSst);
    }
    if (exportData.tables.indicadoresSst?.length > 0) {
      console.log('📈 Importando indicadores SST...');
      await db.insert(schema.indicadoresSst).values(exportData.tables.indicadoresSst);
    }
    if (exportData.tables.medicionesIndicadores?.length > 0) {
      console.log('📊 Importando mediciones de indicadores...');
      await db.insert(schema.medicionesIndicadores).values(exportData.tables.medicionesIndicadores);
    }
    if (exportData.tables.datosCalculoIndicadores?.length > 0) {
      console.log('🧮 Importando datos de cálculo...');
      await db.insert(schema.datosCalculoIndicadores).values(exportData.tables.datosCalculoIndicadores);
    }
    
    console.log('\n✅ Importación completada exitosamente!');
    console.log('\n📊 Resumen de datos importados:');
    
    Object.entries(exportData.tables).forEach(([tableName, records]: [string, any]) => {
      if (records?.length > 0) {
        console.log(`   - ${tableName}: ${records.length} registros`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  }
}

importData();
