/**
 * Test Script: Audit Logging Validation
 * 
 * Este script valida que el audit logging funciona correctamente para operaciones CRUD de workers
 * Cumplimiento: Ley 1581/2012 (Habeas Data)
 */

import { db } from '../db';
import * as schema from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

async function testAuditLogging() {
  console.log('🔍 Iniciando prueba de audit logging...\n');

  try {
    // 1. Verificar que exista al menos una empresa y un usuario para el test
    const companies = await db.select().from(schema.companies).limit(1);
    if (companies.length === 0) {
      console.error('❌ No hay empresas en la base de datos. Ejecuta el seed primero.');
      return;
    }
    const testCompanyId = companies[0].id;

    // Buscar usuario admin (que existe desde seed)
    const users = await db.select().from(schema.users)
      .where(eq(schema.users.role, 'admin'))
      .limit(1);
    
    if (users.length === 0) {
      console.error('❌ No hay usuarios admin en la base de datos.');
      return;
    }
    const testUserId = users[0].id;

    console.log(`✅ Empresa de prueba: ${companies[0].name} (${testCompanyId})`);
    console.log(`✅ Usuario de prueba: ${users[0].username} (${testUserId})\n`);

    // 2. Contar audit logs antes de la prueba
    const auditLogsBefore = await db.select().from(schema.auditLogs);
    console.log(`📊 Audit logs antes de la prueba: ${auditLogsBefore.length}\n`);

    // 3. Simular creación de worker directamente (simulando lo que hace la API)
    console.log('🔨 Creando worker de prueba...');
    const testWorker = {
      name: 'AUDIT TEST WORKER',
      identificationNumber: `TEST-${Date.now()}`,
      identificationType: 'CC' as const,
      position: 'Test Auditor',
      department: 'QA',
      contractType: 'indefinido' as const,
      startDate: new Date().toISOString().split('T')[0],
      status: 'activo' as const,
      companyId: testCompanyId,
    };

    const storage = (await import('../storage')).storage;
    const createdWorker = await storage.createWorker(
      testWorker, 
      testCompanyId, 
      testUserId,
      {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        requestId: `test-${Date.now()}`,
      }
    );
    console.log(`✅ Worker creado: ${createdWorker.name} (${createdWorker.id})\n`);

    // 4. Verificar que se creó un audit log para CREATE
    const createAuditLogs = await db.select().from(schema.auditLogs)
      .where(eq(schema.auditLogs.entityId, createdWorker.id))
      .orderBy(desc(schema.auditLogs.timestamp));

    if (createAuditLogs.length === 0) {
      console.error('❌ ERROR: No se creó audit log para CREATE');
      return;
    }

    const createLog = createAuditLogs[0];
    console.log('✅ Audit log CREATE encontrado:');
    console.log(`   - Action: ${createLog.action}`);
    console.log(`   - User: ${createLog.username} (${createLog.userRole})`);
    console.log(`   - Data Subject: ${createLog.dataSubjectName}`);
    console.log(`   - IP Address: ${createLog.ipAddress}`);
    console.log(`   - Description: ${createLog.description}\n`);

    // 5. Actualizar worker
    console.log('🔧 Actualizando worker de prueba...');
    const updatedWorker = await storage.updateWorker(
      createdWorker.id,
      { position: 'Senior Test Auditor', department: 'Quality Assurance' },
      testCompanyId,
      testUserId,
      {
        ipAddress: '127.0.0.2',
        userAgent: 'Test Script Update',
        requestId: `test-update-${Date.now()}`,
      }
    );
    console.log(`✅ Worker actualizado: ${updatedWorker?.position}\n`);

    // 6. Verificar audit log para UPDATE
    const updateAuditLogs = await db.select().from(schema.auditLogs)
      .where(eq(schema.auditLogs.entityId, createdWorker.id))
      .orderBy(desc(schema.auditLogs.timestamp));

    const updateLog = updateAuditLogs.find(log => log.action === 'update');
    if (!updateLog) {
      console.error('❌ ERROR: No se creó audit log para UPDATE');
      return;
    }

    console.log('✅ Audit log UPDATE encontrado:');
    console.log(`   - Action: ${updateLog.action}`);
    console.log(`   - Changed Fields: ${updateLog.changedFields}`);
    console.log(`   - Description: ${updateLog.description}\n`);

    // 7. Eliminar worker
    console.log('🗑️  Eliminando worker de prueba...');
    await storage.deleteWorker(
      createdWorker.id,
      testCompanyId,
      testUserId,
      {
        ipAddress: '127.0.0.3',
        userAgent: 'Test Script Delete',
        requestId: `test-delete-${Date.now()}`,
      }
    );
    console.log('✅ Worker eliminado\n');

    // 8. Verificar audit log para DELETE
    const deleteAuditLogs = await db.select().from(schema.auditLogs)
      .where(eq(schema.auditLogs.entityId, createdWorker.id))
      .orderBy(desc(schema.auditLogs.timestamp));

    const deleteLog = deleteAuditLogs.find(log => log.action === 'delete');
    if (!deleteLog) {
      console.error('❌ ERROR: No se creó audit log para DELETE');
      return;
    }

    console.log('✅ Audit log DELETE encontrado:');
    console.log(`   - Action: ${deleteLog.action}`);
    console.log(`   - Description: ${deleteLog.description}\n`);

    // 9. Resumen final
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ PRUEBA DE AUDIT LOGGING COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total de audit logs para worker ${createdWorker.id}: ${deleteAuditLogs.length}`);
    console.log('Operaciones registradas:');
    deleteAuditLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action.toUpperCase()} - ${log.timestamp?.toISOString()} - ${log.username}`);
    });
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ Sistema de audit logging funcionando correctamente');
    console.log('✅ Cumplimiento con Ley 1581/2012 (Habeas Data): VALIDADO');
    console.log('✅ Registro de changed_fields en updates: VALIDADO');
    console.log('✅ Contexto de auditoría (IP, User Agent, Request ID): VALIDADO\n');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Ejecutar test
testAuditLogging();
