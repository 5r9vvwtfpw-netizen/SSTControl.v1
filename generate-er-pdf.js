const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
const output = fs.createWriteStream('docs/ENTIDAD_RELACION.pdf');
doc.pipe(output);

// Title
doc.fontSize(20).font('Helvetica-Bold').fillColor('#006633')
   .text('Diagrama Entidad-Relación', { align: 'center' });
doc.fontSize(14).font('Helvetica').fillColor('#333')
   .text('SST Colombia', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(10).fillColor('#666')
   .text('Sistema de Gestión de Seguridad y Salud en el Trabajo', { align: 'center' });
doc.moveDown(2);

// Summary
doc.fontSize(12).font('Helvetica-Bold').fillColor('#006633').text('Resumen General');
doc.fontSize(10).font('Helvetica').fillColor('#333');
doc.text('• Total de Tablas: 161');
doc.text('• Base de Datos: PostgreSQL (Neon)');
doc.text('• ORM: Drizzle ORM');
doc.moveDown(1.5);

// Modules
const modules = [
  { name: '1. NÚCLEO DEL SISTEMA', tables: ['companies', 'users', 'workers', 'subscription_plans', 'subscriptions'] },
  { name: '2. SEGURIDAD Y SALUD', tables: ['accidents', 'occupational_diseases', 'indicadores_sst'] },
  { name: '3. CAPACITACIÓN', tables: ['trainings', 'training_attendees', 'training_programs', 'registros_induccion', 'contenidos_induccion'] },
  { name: '4. INSPECCIONES', tables: ['inspections', 'preventive_measures', 'inspecciones_peligros_vinculados'] },
  { name: '5. IPERC', tables: ['matrices_iperc', 'peligros_iperc'] },
  { name: '6. EVALUACIÓN SST (Res. 0312/2019)', tables: ['componentes_sst', 'estandares_sst', 'evaluaciones_sst', 'respuestas_estandares'] },
  { name: '7. COPASST', tables: ['copasst_periodos', 'copasst_miembros', 'copasst_elecciones', 'copasst_candidatos', 'copasst_cursos'] },
  { name: '8. PESV', tables: ['vehicles', 'drivers', 'vehicle_inspections', 'road_incidents'] },
  { name: '9. EMERGENCIAS', tables: ['planes_emergencia', 'brigadas_emergencia', 'simulacros'] },
  { name: '10. AUDITORÍAS', tables: ['auditorias_internas', 'hallazgos_auditoria', 'revisiones_gerencia'] },
  { name: '11. DOCUMENTOS', tables: ['documentos_sst', 'versiones_documento'] },
  { name: '12. SOPORTE', tables: ['support_tickets', 'ticket_responses', 'internal_messages'] },
  { name: '13. PRIVACIDAD', tables: ['consent_records', 'arco_requests'] },
];

modules.forEach(m => {
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#006633').text(m.name);
  doc.fontSize(9).font('Helvetica').fillColor('#444');
  m.tables.forEach(t => doc.text('    • ' + t));
  doc.moveDown(0.8);
});

// New page for relationships
doc.addPage();
doc.fontSize(16).font('Helvetica-Bold').fillColor('#006633')
   .text('Relaciones Principales', { align: 'center' });
doc.moveDown(1);

doc.fontSize(11).font('Helvetica-Bold').fillColor('#333').text('Empresa → Entidades');
doc.fontSize(9).font('Helvetica').fillColor('#444');
['companies 1:N users', 'companies 1:N workers', 'companies 1:N accidents', 
 'companies 1:N trainings', 'companies 1:N inspections', 'companies 1:N evaluaciones_sst',
 'companies 1:N copasst_periodos', 'companies 1:N support_tickets'].forEach(r => doc.text('    • ' + r));
doc.moveDown(1);

doc.fontSize(11).font('Helvetica-Bold').fillColor('#333').text('Trabajador → Entidades');
doc.fontSize(9).font('Helvetica').fillColor('#444');
['workers 1:N accidents', 'workers 1:N training_attendees', 'workers 1:N medical_exams',
 'workers 1:N contracts', 'workers 1:N copasst_candidatos', 'workers 1:1 users (portal)'].forEach(r => doc.text('    • ' + r));
doc.moveDown(1);

doc.fontSize(11).font('Helvetica-Bold').fillColor('#333').text('Usuario → Entidades');
doc.fontSize(9).font('Helvetica').fillColor('#444');
['users 1:N support_tickets', 'users 1:N internal_messages', 'users 1:N copasst_progreso',
 'users 1:N consent_records'].forEach(r => doc.text('    • ' + r));
doc.moveDown(2);

// Notes
doc.fontSize(11).font('Helvetica-Bold').fillColor('#006633').text('Notas Técnicas');
doc.fontSize(9).font('Helvetica').fillColor('#444');
doc.text('• Todas las tablas usan UUID como clave primaria');
doc.text('• Campos de auditoría: created_at, updated_at');
doc.text('• Soft delete mediante campo status/estado');
doc.text('• Columnas JSON para attachments, options, features');
doc.moveDown(2);

// Footer
doc.fontSize(8).fillColor('#999')
   .text('Documento generado automáticamente - SST Colombia - Diciembre 2025', { align: 'center' });

doc.end();
output.on('finish', () => console.log('PDF generado: docs/ENTIDAD_RELACION.pdf'));
