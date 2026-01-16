import { db } from './db.js';
import * as schema from '../shared/schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para exportar todos los datos de la base de datos de desarrollo
 * Los datos se exportan a un archivo JSON que puede ser importado en producción
 */

async function exportData() {
  console.log('🔄 Iniciando exportación de datos...');
  
  const exportData: any = {
    exportDate: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    tables: {}
  };

  try {
    // Exportar en orden correcto para respetar foreign keys
    
    // 1. Tablas base sin dependencias externas
    console.log('📦 Exportando componentes y estándares SST...');
    exportData.tables.componentesSst = await db.select().from(schema.componentesSst);
    exportData.tables.estandaresSst = await db.select().from(schema.estandaresSst);
    
    // 2. Empresas
    console.log('🏢 Exportando empresas...');
    exportData.tables.companies = await db.select().from(schema.companies);
    
    // 3. Usuarios
    console.log('👤 Exportando usuarios...');
    exportData.tables.users = await db.select().from(schema.users);
    
    // 4. Trabajadores
    console.log('👷 Exportando trabajadores...');
    exportData.tables.workers = await db.select().from(schema.workers);
    
    // 5. Perfiles de cargo
    console.log('📋 Exportando perfiles de cargo...');
    exportData.tables.jobProfiles = await db.select().from(schema.jobProfiles);
    
    // 6. Contratos laborales
    console.log('📄 Exportando contratos laborales...');
    exportData.tables.laborContracts = await db.select().from(schema.laborContracts);
    
    // 7. Exámenes médicos
    console.log('🏥 Exportando exámenes médicos...');
    exportData.tables.medicalExams = await db.select().from(schema.medicalExams);
    
    // 8. Designaciones de responsabilidad
    console.log('👔 Exportando designaciones de responsabilidad...');
    exportData.tables.responsibleDesignations = await db.select().from(schema.responsibleDesignations);
    
    // 9. Asignación de recursos
    console.log('💰 Exportando asignación de recursos...');
    exportData.tables.resourceAllocations = await db.select().from(schema.resourceAllocations);
    
    // 10. Afiliaciones SSSS
    console.log('🏛️ Exportando afiliaciones SSSS...');
    exportData.tables.afiliacionesSSSS = await db.select().from(schema.afiliacionesSSSS);
    
    // 11. Trabajadores de alto riesgo
    console.log('⚠️ Exportando trabajadores de alto riesgo...');
    exportData.tables.trabajadoresAltoRiesgo = await db.select().from(schema.trabajadoresAltoRiesgo);
    
    // 12. Accidentes
    console.log('🚑 Exportando accidentes...');
    exportData.tables.accidents = await db.select().from(schema.accidents);
    
    // 13. Capacitaciones
    console.log('📚 Exportando capacitaciones...');
    exportData.tables.trainings = await db.select().from(schema.trainings);
    
    // 14. Inspecciones de seguridad
    console.log('🔍 Exportando inspecciones de seguridad...');
    exportData.tables.safetyInspections = await db.select().from(schema.safetyInspections);
    
    // 15. PESV
    console.log('🚗 Exportando datos PESV...');
    exportData.tables.pesvDrivers = await db.select().from(schema.pesvDrivers);
    exportData.tables.pesvVehicles = await db.select().from(schema.pesvVehicles);
    exportData.tables.pesvTrips = await db.select().from(schema.pesvTrips);
    exportData.tables.pesvIncidents = await db.select().from(schema.pesvIncidents);
    
    // 16. Actas COPASST
    console.log('📝 Exportando actas COPASST...');
    exportData.tables.copasstActas = await db.select().from(schema.copasstActas);
    
    // 17. Actas Comité de Convivencia
    console.log('🤝 Exportando actas comité de convivencia...');
    exportData.tables.comiteConvivenciaActas = await db.select().from(schema.comiteConvivenciaActas);
    
    // 18. Programas de capacitación
    console.log('📖 Exportando programas de capacitación...');
    exportData.tables.programasCapacitacion = await db.select().from(schema.programasCapacitacion);
    exportData.tables.programasCapacitacionAnual = await db.select().from(schema.programasCapacitacionAnual);
    
    // 19. Curso 50 horas
    console.log('🎓 Exportando certificados curso 50 horas...');
    exportData.tables.curso50Horas = await db.select().from(schema.curso50Horas);
    
    // 20. Registros de inducción
    console.log('📋 Exportando registros de inducción...');
    exportData.tables.registrosInduccion = await db.select().from(schema.registrosInduccion);
    
    // 21. Mediciones ambientales
    console.log('🌡️ Exportando mediciones ambientales...');
    exportData.tables.environmentalMeasurements = await db.select().from(schema.environmentalMeasurements);
    
    // 22. Sustancias químicas peligrosas
    console.log('⚗️ Exportando sustancias químicas...');
    exportData.tables.hazardousChemicals = await db.select().from(schema.hazardousChemicals);
    
    // 23. SVE
    console.log('🔬 Exportando datos SVE...');
    exportData.tables.svePrograms = await db.select().from(schema.svePrograms);
    exportData.tables.sveCases = await db.select().from(schema.sveCases);
    
    // 24. Políticas SST
    console.log('📜 Exportando políticas SST...');
    exportData.tables.politicasSst = await db.select().from(schema.politicasSst);
    
    // 25. Evaluaciones iniciales SST
    console.log('✅ Exportando evaluaciones iniciales...');
    exportData.tables.sstEvaluations = await db.select().from(schema.sstEvaluations);
    exportData.tables.sstEvaluationItems = await db.select().from(schema.sstEvaluationItems);
    exportData.tables.sstEvidence = await db.select().from(schema.sstEvidence);
    
    // 26. Plan anual de trabajo
    console.log('📅 Exportando planes anuales de trabajo...');
    exportData.tables.planesAnualesTrabajo = await db.select().from(schema.planesAnualesTrabajo);
    exportData.tables.actividadesPlanAnual = await db.select().from(schema.actividadesPlanAnual);
    
    // 27. Matriz legal
    console.log('⚖️ Exportando matriz legal...');
    exportData.tables.matrizLegal = await db.select().from(schema.matrizLegal);
    
    // 28. Objetivos e indicadores
    console.log('🎯 Exportando objetivos e indicadores...');
    exportData.tables.objetivosSst = await db.select().from(schema.objetivosSst);
    exportData.tables.indicadoresSst = await db.select().from(schema.indicadoresSst);
    exportData.tables.medicionesIndicadores = await db.select().from(schema.medicionesIndicadores);
    exportData.tables.datosCalculoIndicadores = await db.select().from(schema.datosCalculoIndicadores);
    
    // Guardar a archivo
    const outputPath = path.join(__dirname, '..', 'data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log('\n✅ Exportación completada exitosamente!');
    console.log(`📁 Archivo guardado en: ${outputPath}`);
    console.log('\n📊 Resumen de datos exportados:');
    
    Object.entries(exportData.tables).forEach(([tableName, records]: [string, any]) => {
      console.log(`   - ${tableName}: ${records.length} registros`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    process.exit(1);
  }
}

exportData();
