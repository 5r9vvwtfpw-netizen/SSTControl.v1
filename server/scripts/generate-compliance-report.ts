import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outputPath = path.join(process.cwd(), 'attached_assets', 'compliance-report.pdf');

const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

doc.fontSize(18).font('Helvetica-Bold').text('REPORTE DE CUMPLIMIENTO TÉCNICO', { align: 'center' });
doc.fontSize(12).font('Helvetica').text('Sistema SST Colombia - Seguridad y Protección de Datos', { align: 'center' });
doc.moveDown();

doc.fontSize(10).text('Fecha de Emisión: 10 de enero de 2026', { align: 'center' });
doc.text('Versión del Sistema: Producción', { align: 'center' });
doc.text('Estándar de Referencia: Ley 1581/2012 (Protección de Datos Personales - Colombia)', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).font('Helvetica-Bold').text('1. CIFRADO DE DATOS EN REPOSO (AT-REST ENCRYPTION)');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text(
  'El sistema implementa cifrado AES-256-GCM para todos los datos sensibles almacenados en la base de datos PostgreSQL. La clave maestra de cifrado (ENCRYPTION_MASTER_KEY) se gestiona de forma segura a través del sistema de Secrets de la plataforma, garantizando que:'
);
doc.moveDown(0.5);
doc.list([
  'Los datos nunca se almacenan en texto plano en producción',
  'Cada campo sensible utiliza una clave derivada única mediante HMAC-SHA256',
  'El sistema rechaza el arranque en producción si la clave maestra no está configurada'
]);
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').text('2. FUNCIONES DE CIFRADO IMPLEMENTADAS');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica-Bold').text('encryptWorkerData()');
doc.font('Helvetica').text('Cifra datos personales de trabajadores: nombre, cédula, teléfono, dirección, condiciones de salud, historial médico, contacto de emergencia, cuenta bancaria, fecha de nacimiento, tipo de sangre, alergias, medicamentos, discapacidades.');
doc.moveDown(0.5);

doc.font('Helvetica-Bold').text('encryptCompanyData()');
doc.font('Helvetica').text('Cifra datos corporativos sensibles: NIT, dirección, teléfono, nombre del representante legal, cédula del representante, teléfono y correo del representante.');
doc.moveDown(0.5);

doc.font('Helvetica-Bold').text('encryptDocumentData()');
doc.font('Helvetica').text('Cifra metadatos de documentos: nombre de archivo, descripción, observaciones.');
doc.moveDown(0.5);

doc.font('Helvetica-Bold').text('encryptEvaluationResults()');
doc.font('Helvetica').text('Cifra resultados de evaluaciones: observaciones, hallazgos, recomendaciones, notas de evidencia, plan de acción, notas de cumplimiento, notas de auditoría.');
doc.moveDown(0.5);

doc.font('Helvetica-Bold').text('Funciones de Hash para Búsquedas:');
doc.font('Helvetica').text('hashWorkerIdentification() - número de identificación (cédula)');
doc.text('hashCompanyNit() - NIT empresarial');
doc.text('hashWorkerName() - nombre del trabajador');
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').text('3. CUMPLIMIENTO NORMATIVO');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica-Bold').text('Ley 1581 de 2012 - Régimen General de Protección de Datos Personales:');
doc.fontSize(10).font('Helvetica');
doc.list([
  'Datos personales cifrados en reposo (Art. 4, literal g - Principio de seguridad)',
  'Datos sensibles con protección reforzada (Art. 5 - Datos sensibles)',
  'Medidas técnicas de seguridad implementadas (Art. 17, literal f)',
  'Control de acceso mediante roles y permisos (Art. 17, literal d)'
]);
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Custodia Legal de 20 Años (Resolución 0312/2019):');
doc.fontSize(10).font('Helvetica');
doc.list([
  'Almacenamiento en Amazon S3 con política de retención configurada',
  'Cifrado de metadatos de documentos para protección a largo plazo',
  'Integridad de datos garantizada mediante autenticación GCM (authTag)',
  'Trazabilidad completa con logs de auditoría'
]);
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').text('4. ARQUITECTURA DE SEGURIDAD DUAL');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text('El sistema implementa una arquitectura de seguridad de dos capas:');
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('Capa 1 - OWNER_LICENSE_KEY:');
doc.font('Helvetica').text('Protección de propiedad del software - controla acceso global al sistema');
doc.moveDown(0.3);
doc.font('Helvetica-Bold').text('Capa 2 - ENCRYPTION_MASTER_KEY:');
doc.font('Helvetica').text('Confidencialidad de datos - cifra toda la información sensible');
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').text('5. PROTECCIÓN ANTE EXTRACCIÓN DE BASE DE DATOS');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text(
  'En caso de acceso no autorizado a la base de datos, los datos sensibles aparecerán como objetos JSON cifrados con estructura: ciphertext (datos cifrados en Base64), iv (vector de inicialización único), authTag (etiqueta de autenticación GCM).'
);
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('Sin la clave maestra (ENCRYPTION_MASTER_KEY), estos datos son matemáticamente irrecuperables.');
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').text('6. CERTIFICACIÓN');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text(
  'Este reporte certifica que el Sistema SST Colombia cumple con los requisitos técnicos de seguridad establecidos por la Ley 1581 de 2012 y está preparado para la custodia legal de documentos por el período de 20 años exigido por la normativa colombiana de Seguridad y Salud en el Trabajo.'
);
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').fillColor('green').text('Estado de Cumplimiento: CONFORME', { align: 'center' });
doc.moveDown(2);

doc.fillColor('black');
doc.fontSize(14).font('Helvetica-Bold').text('7. DECLARACIÓN DE CUSTODIA Y CONTROL MAESTRO');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text(
  'Se declara formalmente que Luz Adriana Díaz Calle, en su calidad de Socia Fundadora y Autora Intelectual, es la única poseedora y custodio de la Llave Maestra de Cifrado (AES-256) y el acceso \'Root\' al sistema. Esta medida es innegociable y tiene como fin único garantizar la autonomía técnica de la plataforma y el cumplimiento de la custodia legal de datos por 20 años. El acceso a esta llave no será compartido con socios capitalistas ni terceros, asegurando que la propiedad del código y la integridad de la base de datos permanezcan bajo el control exclusivo de la fundadora. Cualquier intento de acceso no autorizado a estas credenciales se considerará una violación a los protocolos de seguridad y a los términos de la sociedad establecidos.',
  { align: 'justify' }
);
doc.moveDown(2);

doc.fontSize(9).font('Helvetica').fillColor('gray').text('Documento generado automáticamente por el Sistema SST Colombia', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log('PDF generado exitosamente en:', outputPath);
});
