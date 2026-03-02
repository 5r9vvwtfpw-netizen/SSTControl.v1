/**
 * Legal Documentation PDF Generation Service
 * 
 * Generates comprehensive PDF documents for legal protections implemented in SST Colombia.
 * Includes intellectual property, data protection, security measures, and compliance documentation.
 * 
 * Copyright © 2026 SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.
 * Registro DNDA: 13-197-177
 * Protegido bajo Ley 23 de 1982 y Decisión Andina 351
 */

import { PDFDocument } from 'pdf-lib-with-encrypt';
import { addStandardHeader, addSignatureFooter, addProviderContactFooter, PdfSigners, loadCompanyLogo } from './pdf-standardizer';
import * as fs from 'fs';
import * as path from 'path';

function loadSstColombiaLogo(): Buffer | null {
  try {
    const logoPath = path.join(process.cwd(), 'server', 'assets', 'sst-colombia-logo.png');
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
    const altPath = path.join(process.cwd(), 'attached_assets', 'SST-Colombia-logo-3_1768408022586.png');
    if (fs.existsSync(altPath)) {
      return fs.readFileSync(altPath);
    }
  } catch (e) {
    console.error('[LegalDocsPdf] Error loading SST Colombia logo:', e);
  }
  return null;
}

/**
 * Apply PDF encryption to prevent copying text
 * Uses AES encryption with restricted permissions
 */
async function applyPdfEncryption(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Apply encryption with restricted permissions
    pdfDoc.encrypt({
      userPassword: '',  // Empty user password allows opening without password
      ownerPassword: 'SST-Colombia-DNDA-13-197-177-SecureDoc',  // Owner password for restrictions
      permissions: {
        printing: 'lowResolution',       // Allow low-resolution printing
        modifying: false,                // Disable editing
        copying: false,                  // Disable copy/paste
        annotating: false,               // Disable annotations
        fillingForms: false,             // Disable form filling
        contentAccessibility: false,     // Disable text extraction
        documentAssembly: false          // Disable page manipulation
      }
    });
    
    // Save the encrypted PDF
    const encryptedBytes = await pdfDoc.save();
    return Buffer.from(encryptedBytes);
  } catch (error: any) {
    console.error('[applyPdfEncryption] Error applying encryption:', error.message);
    // Return original buffer if encryption fails
    return pdfBuffer;
  }
}

interface LegalDocOptions {
  companyName?: string;
  generatedBy?: string;
  includeAllSections?: boolean;
}

interface CompanyContext {
  id: string;
  name: string;
  nit: string;
  address: string;
  logoUrl: string | null;
}

interface LegalDocWithCompanyOptions {
  company: CompanyContext;
  signers: PdfSigners;
  logoBuffer: Buffer | null;
}

/**
 * Add diagonal watermark to a PDF page
 * "Documento Informativo - Propiedad de SST Colombia"
 */
function addWatermark(doc: any, pageWidth: number, pageHeight: number) {
  doc.save();
  
  // Semi-transparent gray watermark
  doc.fillColor('#CCCCCC').opacity(0.15);
  
  // Rotate and position the watermark diagonally
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  doc.translate(centerX, centerY);
  doc.rotate(-45);
  
  doc.fontSize(28).font('Helvetica-Bold');
  doc.text('DOCUMENTO INFORMATIVO', -200, -30, { width: 400, align: 'center' });
  doc.fontSize(18).font('Helvetica');
  doc.text('Propiedad de SST Colombia', -200, 10, { width: 400, align: 'center' });
  
  doc.restore();
  doc.opacity(1); // Reset opacity for subsequent content
}

/**
 * Apply watermarks to all pages of the document
 */
function applyWatermarksToAllPages(doc: any) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  
  // Get the range of pages
  const range = doc.bufferedPageRange();
  
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    addWatermark(doc, pageWidth, pageHeight);
  }
}

export class LegalDocsPdfService {
  
  /**
   * Generate complete Legal Protections Table PDF
   */
  async generateProteccionesLegalesPdf(companyOptions: LegalDocWithCompanyOptions, options: LegalDocOptions = {}): Promise<Buffer> {
    console.log('[LegalDocsPdf] Starting generateProteccionesLegalesPdf');
    const { company, signers, logoBuffer } = companyOptions;
    console.log(`[LegalDocsPdf] Company: ${company?.name}, Logo: ${logoBuffer ? 'yes' : 'no'}`);
    const { default: PDFDocument } = await import('pdfkit');
    console.log('[LegalDocsPdf] PDFDocument imported successfully');
    
    const doc = new PDFDocument({ 
      margin: 40, 
      size: 'LETTER',
      bufferPages: true,
      info: {
        Title: 'Protecciones Legales SST Colombia - Tabla Completa',
        Author: 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.',
        Subject: 'Documentación Legal y de Cumplimiento',
        Keywords: 'DNDA 13-197-177, Ley 1581, GDPR, SST, Protección de Datos',
        CreationDate: new Date()
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const margin = 40;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - (margin * 2);
    
    // Use standardized header with SST Colombia logo
    const sstLogoForHeader = loadSstColombiaLogo();
    let currentY = await addStandardHeader({
      doc,
      company,
      documentTitle: 'PROTECCIONES LEGALES SST COLOMBIA',
      documentCode: `SST-LEG-${new Date().getFullYear()}`,
      version: '1.0',
      date: new Date(),
      logoBuffer: sstLogoForHeader || logoBuffer,
    });
    currentY += 15;

    const checkPageBreak = (neededSpace: number) => {
      if (currentY + neededSpace > doc.page.height - 60) {
        doc.addPage();
        currentY = margin + 20;
        currentY = margin + 20; // Reset Y after page break
        return true;
      }
      return false;
    };

    const addSectionTitle = (title: string, icon?: string) => {
      checkPageBreak(40);
      doc.fontSize(14).font('Helvetica-Bold')
         .fillColor('#166534')
         .text(title, margin, currentY);
      currentY += 25;
    };

    const addSubSection = (title: string) => {
      checkPageBreak(30);
      doc.fontSize(11).font('Helvetica-Bold')
         .fillColor('#333333')
         .text(title, margin, currentY);
      currentY += 18;
    };

    const addTableRow = (col1: string, col2: string, col3?: string, isHeader: boolean = false) => {
      const col1Width = col3 ? contentWidth * 0.22 : contentWidth * 0.35;
      const col2Width = col3 ? contentWidth * 0.40 : contentWidth * 0.65;
      const col3Width = col3 ? contentWidth * 0.38 : 0;

      const fontSize = 9;
      const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';
      doc.fontSize(fontSize).font(font);
      const h1 = doc.heightOfString(col1, { width: col1Width - 10 });
      const h2 = doc.heightOfString(col2, { width: col2Width - 10 });
      const h3 = col3 ? doc.heightOfString(col3, { width: col3Width - 10 }) : 0;
      const rowHeight = Math.max(h1, h2, h3) + 10;

      checkPageBreak(rowHeight + 5);

      if (isHeader) {
        doc.rect(margin, currentY - 3, contentWidth, rowHeight + 2).fillColor('#166534').fill();
        doc.fontSize(fontSize).font('Helvetica-Bold').fillColor('#FFFFFF');
      } else {
        doc.fontSize(fontSize).font('Helvetica').fillColor('#333333');
      }
      
      doc.text(col1, margin + 5, currentY, { width: col1Width - 10 });
      doc.text(col2, margin + col1Width + 5, currentY, { width: col2Width - 10 });
      if (col3) {
        doc.text(col3, margin + col1Width + col2Width + 5, currentY, { width: col3Width - 10 });
      }
      
      if (!isHeader) {
        doc.moveTo(margin, currentY + rowHeight - 5).lineTo(pageWidth - margin, currentY + rowHeight - 5).strokeColor('#EEEEEE').stroke();
      }
      currentY += rowHeight;
    };

    const addParagraph = (text: string, indent: number = 0) => {
      checkPageBreak(40);
      doc.fontSize(10).font('Helvetica')
         .fillColor('#333333')
         .text(text, margin + indent, currentY, { width: contentWidth - indent, align: 'justify' });
      currentY = doc.y + 10;
    };

    const addBullet = (text: string, indent: number = 15) => {
      checkPageBreak(20);
      doc.fontSize(9).font('Helvetica')
         .fillColor('#333333')
         .text('•', margin + indent, currentY);
      doc.text(text, margin + indent + 12, currentY, { width: contentWidth - indent - 12 });
      currentY = doc.y + 5;
    };

    // ============================================================================
    // COVER PAGE
    // ============================================================================
    
    doc.rect(0, 0, pageWidth, doc.page.height).fillColor('#166534').fill();
    
    const sstLogo = loadSstColombiaLogo();
    if (sstLogo) {
      try {
        const logoWidth = 120;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.image(sstLogo, logoX, 100, { width: logoWidth });
      } catch (e) {
        console.error('[LegalDocsPdf] Error adding SST logo to cover:', e);
      }
    }
    
    doc.fontSize(32).font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text('PROTECCIONES LEGALES', margin, 240, { width: contentWidth, align: 'center' });
    
    doc.fontSize(24).font('Helvetica')
       .text('SST COLOMBIA', margin, 290, { width: contentWidth, align: 'center' });
    
    doc.fontSize(14)
       .text('Sistema de Gestión de Seguridad y Salud en el Trabajo', margin, 330, { width: contentWidth, align: 'center' });
    
    doc.fontSize(16).font('Helvetica-Bold')
       .text('TABLA COMPLETA DE CUMPLIMIENTO', margin, 390, { width: contentWidth, align: 'center' });
    
    doc.fontSize(12).font('Helvetica')
       .text('Registro DNDA: 13-197-177', margin, 440, { width: contentWidth, align: 'center' });
    
    doc.fontSize(10)
       .text('Documento Confidencial', margin, 520, { width: contentWidth, align: 'center' });
    
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 540, { width: contentWidth, align: 'center' });
    
    doc.text('© 2026 SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. - Todos los derechos reservados', margin, doc.page.height - 60, { width: contentWidth, align: 'center' });

    // ============================================================================
    // CONTENT PAGES
    // ============================================================================
    
    doc.addPage();
    currentY = margin + 20;
    currentY = margin + 20; // Reset Y after page break

    // Section 1: Intellectual Property
    addSectionTitle('1. PROPIEDAD INTELECTUAL Y REGISTRO DNDA');
    
    addTableRow('Categoría', 'Elemento', 'Descripción', true);
    addTableRow('Registro DNDA', '13-197-177', 'Registro oficial ante la Dirección Nacional de Derecho de Autor');
    addTableRow('Copyright', '© 2026 SST Colombia', 'Aviso de derechos de autor en footers y código');
    addTableRow('Metodología protegida', 'Filtrado lógico de estándares', 'Lógica de asignación según Resolución 0312/2019');
    addTableRow('Curaduría legal', 'Base de datos de contenidos', 'Contenido curado basado en normativa SST colombiana');
    addTableRow('Licencia', 'No exclusiva, no transferible', 'Solo durante vigencia del contrato');
    
    currentY += 15;

    // Section 2: Prohibitions
    addSectionTitle('2. PROHIBICIONES EXPLÍCITAS (Términos Sección 5.5)');
    
    addTableRow('Prohibición', 'Descripción', 'Consecuencia', true);
    addTableRow('Ingeniería inversa', 'Prohibido descompilar, descifrar o extraer lógica', 'Terminación inmediata + acciones legales');
    addTableRow('Scraping', 'Prohibido usar scripts, bots o extracción masiva', 'Terminación inmediata + acciones legales');
    addTableRow('Duplicación funcional', 'Prohibido replicar estructura para competidores', 'Acciones civiles y penales (Ley 23/1982)');
    addTableRow('Obras derivadas', 'Prohibido copiar, modificar sin autorización', 'Acciones civiles y penales');
    
    currentY += 15;

    // Section 3: Liability
    addSectionTitle('3. LIMITACIÓN DE RESPONSABILIDAD');
    
    addBullet('Alcance: Herramienta digital de apoyo - NO garantiza cumplimiento legal total');
    addBullet('Veracidad de datos: Responsabilidad exclusiva del Cliente');
    addBullet('Cumplimiento de campo: Cliente responsable de inspecciones y medidas en sitio');
    addBullet('Profesional SST: Cliente debe contar con profesional con licencia vigente');
    addBullet('Sanciones MinTrabajo: SST Colombia NO responsable por multas');
    addBullet('Accidentes laborales: SST Colombia NO responsable por accidentes');
    addBullet('Daños indirectos: NO responsable por daños consecuenciales');
    addBullet('Límite monetario: Máximo 12 meses de pagos del Cliente');
    
    currentY += 15;

    // Section 4: Legal Documents
    addSectionTitle('4. DOCUMENTOS LEGALES DISPONIBLES');
    
    addTableRow('Ruta', 'Componente', 'Descripción', true);
    addTableRow('/terminos-servicio', 'TerminosServicio.tsx', 'Términos y Condiciones (14 secciones)');
    addTableRow('/politica-privacidad', 'PoliticaPrivacidad.tsx', 'Política de Privacidad (Habeas Data + GDPR)');
    addTableRow('/politica-privacidad-proveedor', 'PoliticaPrivacidadProveedor.tsx', 'Política del Proveedor SaaS');
    addTableRow('/acuerdo-procesamiento-datos', 'AcuerdoProcesamientoDatos.tsx', 'DPA - GDPR Art. 28');
    
    currentY += 15;

    // Section 5: SaaS Contract
    addSectionTitle('5. CONTRATO DE SERVICIOS SAAS - 14 CLÁUSULAS');
    
    addTableRow('Cláusula', 'Título', 'Contenido Clave', true);
    addTableRow('1', 'Objeto del Contrato', 'SaaS para SG-SST según Res. 0312/2019');
    addTableRow('2', 'Duración y Terminación', '1 mes o 1 año, renovación automática');
    addTableRow('3', 'Precio y Pago', '$26,000 COP/trabajador/mes + IVA 19%');
    addTableRow('4', 'Protección de Datos', 'Ley 1581/2012, roles Responsable/Encargado');
    addTableRow('5', 'Propiedad Intelectual', 'Licencia temporal, prohibición ingeniería inversa');
    addTableRow('6', 'Nivel de Servicio (SLA)', '99.5% disponibilidad (99.9% Gran Empresa)');
    addTableRow('7', 'Confidencialidad', '3 años post-terminación');
    addTableRow('8', 'Seguridad y Respaldos', 'SSL/TLS, backups diarios, RBAC');
    addTableRow('9', 'Soporte Técnico', 'Email, chat L-V 8-18h');
    addTableRow('10', 'Obligaciones del Cliente', 'Pago, confidencialidad, uso legal');
    addTableRow('11', 'Responsabilidad', 'Daños directos, límite 12 meses');
    addTableRow('12', 'No Contratación', 'Prohibición 24 meses post-terminación');
    addTableRow('13', 'Resolución de Controversias', 'Conciliación Bogotá D.C.');
    addTableRow('14', 'Ley Aplicable', 'Colombia: Código Comercio, Ley 1581');
    
    currentY += 15;

    // Section 6: Data Protection
    addSectionTitle('6. PROTECCIÓN DE DATOS PERSONALES');
    
    addTableRow('Marco Legal', 'Detalle', 'Cumplimiento', true);
    addTableRow('Ley 1581 de 2012', 'Habeas Data', 'Cumplimiento completo');
    addTableRow('GDPR UE 2016/679', 'Protección de datos europea', 'Cumplimiento completo');
    addTableRow('Decreto 1377/2013', 'Reglamentación tratamiento', 'Cumplimiento completo');
    addTableRow('Decreto 1074/2015', 'Retención 20 años SST', 'Cumplimiento completo');
    addTableRow('Resolución 2346/2007', 'Historia clínica ocupacional', 'Cumplimiento completo');
    
    currentY += 10;
    
    addSubSection('Roles Definidos:');
    addBullet('Cliente = Responsable del Tratamiento (Data Controller)');
    addBullet('SST Colombia = Encargado del Tratamiento (Data Processor)');
    
    currentY += 10;
    
    addSubSection('Derechos ARCO:');
    addBullet('Acceso: Conocer qué datos están siendo tratados (10 días hábiles)');
    addBullet('Rectificación: Corregir datos inexactos o incompletos (10 días hábiles)');
    addBullet('Cancelación: Solicitar eliminación de datos (10 días hábiles)');
    addBullet('Oposición: Oponerse al tratamiento por motivos legítimos (10 días hábiles)');
    
    currentY += 15;

    // Section 7: Sensitive Data
    addSectionTitle('7. DATOS SENSIBLES');
    
    addTableRow('Tipo de Dato', 'Descripción', 'Requisito', true);
    addTableRow('Datos de salud ocupacional', 'Exámenes médicos, diagnósticos, aptitud', 'Consentimiento explícito');
    addTableRow('Datos biométricos', 'Huella dactilar (si aplica)', 'Consentimiento explícito');
    addTableRow('Historial de accidentes', 'Lesiones, enfermedades, incapacidades', 'Consentimiento explícito');
    addTableRow('Datos sindicales', 'Afiliación a organizaciones', 'Consentimiento explícito');
    
    currentY += 15;

    // Section 8: Rate Limiting
    addSectionTitle('8. RATE LIMITING (Protección contra Abuso)');
    
    addTableRow('Rate Limiter', 'Límite', 'Uso', true);
    addTableRow('billingRateLimiter', '100 requests/15min', 'Endpoints de facturación');
    addTableRow('subscriptionMutationLimiter', '20 requests/15min', 'Crear/cambiar suscripción');
    addTableRow('paymentOperationLimiter', '10 requests/15min', 'Operaciones de pago');
    addTableRow('loginRateLimiter', '5 requests/15min', 'Intentos de inicio de sesión');
    addTableRow('passwordResetRateLimiter', '3 requests/1hora', 'Recuperación de contraseña');
    addTableRow('registrationRateLimiter', '3 requests/1hora', 'Registro de cuentas nuevas');
    addTableRow('webhookRateLimiter', '1000 requests/15min', 'Webhooks servidor-a-servidor');
    
    currentY += 15;

    // Section 9: Audit Logging
    addSectionTitle('9. AUDIT LOGGING (Trazabilidad Legal)');
    
    addParagraph('Sistema de registro de auditoría para cumplimiento con Ley 1581/2012, Decreto 1074/2015 y Resolución 2346/2007.');
    
    addSubSection('Campos registrados en cada operación:');
    addBullet('companyId, userId, userRole, username - Identificación de usuario');
    addBullet('entityType, entityId, action - Tipo de operación (create, update, delete, view, export)');
    addBullet('oldValues, newValues, changedFields - Valores antes/después del cambio');
    addBullet('dataSubjectId, dataSubjectName - Identificación del titular de datos');
    addBullet('ipAddress, userAgent, requestId - Contexto de la solicitud');
    
    currentY += 15;

    // Section 10: Security Measures
    addSectionTitle('10. MEDIDAS DE SEGURIDAD TÉCNICA');
    
    addTableRow('Medida', 'Especificación', 'Documentación', true);
    addTableRow('Cifrado en tránsito', 'TLS 1.3', 'Política Privacidad, Contrato');
    addTableRow('Cifrado en reposo', 'AES-256-GCM con derivación por campo', 'Política Privacidad, Contrato');
    addTableRow('Autenticación', 'scrypt + salt 16 bytes + timingSafeEqual', 'Política Privacidad');
    addTableRow('Sesiones', 'httpOnly, secure, sameSite strict, 12h', 'Política Privacidad');
    addTableRow('Control de acceso', 'RBAC con 13 roles (Decreto 1072/2015)', 'Política Privacidad');
    addTableRow('Firewall/WAF', 'DDoS, SQL injection, XSS', 'Política Privacidad');
    addTableRow('Monitoreo', '24/7 con logging estructurado JSON', 'Contrato Cláusula 6.5');
    addTableRow('Backups', 'Automáticos cifrados, 20 años', 'Contrato Cláusula 8');
    addTableRow('Disaster Recovery', 'RTO ≤4h, RPO ≤24h', 'Política Privacidad');
    
    currentY += 15;

    // Section 11: Retention Periods
    addSectionTitle('11. PERÍODOS DE RETENCIÓN');
    
    addTableRow('Tipo de Dato', 'Período', 'Base Legal', true);
    addTableRow('Datos SST', '20 años', 'Decreto 1074/2015 Art. 2.2.4.6.13');
    addTableRow('Historia clínica ocupacional', '20 años', 'Resolución 2346/2007 Art. 14');
    addTableRow('Reportes de accidentes (FURAT)', 'Indefinido', 'Evidencia legal');
    addTableRow('Audit logs', '20 años', 'Ley 1581/2012');
    addTableRow('Usuarios inactivos', '2 años', 'Política interna');
    
    currentY += 15;

    // Section 12: SLA and Compensation
    addSectionTitle('12. SLA Y COMPENSACIÓN');
    
    addTableRow('Plan', 'Disponibilidad', 'Compensación', true);
    addTableRow('Gran Empresa (200+ trabajadores)', '99.9% mensual', '10% crédito por 0.1% adicional');
    addTableRow('Demás planes', '99.5% mensual', '10% crédito por 0.1% adicional');
    addTableRow('Indisponibilidad >1%', '-', 'Extensión gratuita del servicio');
    
    addParagraph('Crédito máximo mensual: 30% de la mensualidad. Reclamación: 10 días hábiles post-período afectado.');
    
    currentY += 15;

    // Section 13: Legal Framework
    addSectionTitle('13. MARCO LEGAL REFERENCIADO');
    
    addTableRow('Normativa', 'Descripción', 'Ubicación', true);
    addTableRow('Ley 23 de 1982', 'Derechos de Autor', 'Términos 5.6, Código');
    addTableRow('Decisión Andina 351', 'PI Comunidad Andina', 'Encabezados de código');
    addTableRow('Ley 1581 de 2012', 'Habeas Data', 'Términos, Política, DPA');
    addTableRow('Decreto 1377 de 2013', 'Reglamentación Ley 1581', 'Política, Contrato');
    addTableRow('GDPR UE 2016/679', 'Protección datos europea', 'Términos, Política, DPA');
    addTableRow('Decreto 1072 de 2015', 'Sector Trabajo', 'Términos, Contrato');
    addTableRow('Decreto 1074/2015', 'Retención 20 años', 'Audit Logger, Política');
    addTableRow('Resolución 0312 de 2019', 'Estándares Mínimos', 'Términos, Contrato');
    addTableRow('Resolución 2346 de 2007', 'Historia clínica', 'Audit Logger, Política');
    addTableRow('Ley 1562 de 2012', 'Riesgos Laborales', 'Términos 4.4');
    addTableRow('Ley 527 de 1999', 'Comercio Electrónico', 'Términos, Contrato');
    addTableRow('Ley 1480 de 2011', 'Estatuto Consumidor', 'Términos, Contrato');
    addTableRow('Código de Comercio', 'Decreto 410/1971', 'Términos, Contrato');
    
    currentY += 15;

    // Section 14: Jurisdiction
    addSectionTitle('14. JURISDICCIÓN Y RESOLUCIÓN DE CONFLICTOS');
    
    addBullet('Ley aplicable: República de Colombia');
    addBullet('Jurisdicción: Tribunales competentes de Bogotá D.C.');
    addBullet('Resolución previa: Mediación/Conciliación obligatoria (30 días)');
    addBullet('Idioma prevalente: Español');
    
    currentY += 15;

    // Section 15: Contact Information
    addSectionTitle('15. INFORMACIÓN DE CONTACTO');
    
    addTableRow('Campo', 'Valor', '', true);
    addTableRow('Razón Social', 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.', '');
    addTableRow('NIT', '902.036.337-4', '');
    addTableRow('Representante Legal', 'Luz Adriana Díaz Calle', '');
    addTableRow('Domicilio', 'CL 48 No. 38-45, Medellín, Antioquia, Colombia', '');
    addTableRow('Correo Legal', 'legal@sst-colombia.com', '');
    addTableRow('Soporte Técnico', 'soporte@sst-colombia.com', '');
    addTableRow('DPO', 'dpo@sst-colombia.com', '');
    addTableRow('Correo Privacidad', 'privacidad@sst-colombia.com', '');

    // Add provider contact footer with all emails
    addProviderContactFooter(doc, { includeAllEmails: true });

    // Add standardized signature footer (no LSO required)
    await addSignatureFooter(doc, signers, false);
    
    // Apply watermarks to all pages
    applyWatermarksToAllPages(doc);

    console.log('[LegalDocsPdf] PDF content generated, ending document...');
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('error', (err: Error) => {
        console.error('[LegalDocsPdf] PDF stream error:', err);
        reject(err);
      });
      doc.on('end', async () => {
        try {
          console.log('[LegalDocsPdf] PDF stream ended, concatenating chunks...');
          const rawPdf = Buffer.concat(chunks);
          console.log(`[LegalDocsPdf] Raw PDF size: ${rawPdf.length} bytes`);
          const encryptedPdf = await applyPdfEncryption(rawPdf);
          console.log(`[LegalDocsPdf] Final PDF size: ${encryptedPdf.length} bytes`);
          resolve(encryptedPdf);
        } catch (encryptError: any) {
          console.error('[LegalDocsPdf] Error in PDF finalization:', encryptError);
          // Return raw PDF if encryption fails
          const rawPdf = Buffer.concat(chunks);
          resolve(rawPdf);
        }
      });
    });
  }

  /**
   * Generate Data Protection Summary PDF (Habeas Data + GDPR)
   */
  async generateProteccionDatosPdf(companyOptions: LegalDocWithCompanyOptions): Promise<Buffer> {
    console.log('[LegalDocsPdf] Starting generateProteccionDatosPdf');
    const { company, signers, logoBuffer } = companyOptions;
    console.log(`[LegalDocsPdf] Company: ${company?.name}, Logo: ${logoBuffer ? 'yes' : 'no'}`);
    const { default: PDFDocument } = await import('pdfkit');
    console.log('[LegalDocsPdf] PDFDocument imported successfully');
    
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'LETTER',
      info: {
        Title: 'Protección de Datos - Resumen Ejecutivo',
        Author: 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.',
        Subject: 'Cumplimiento Ley 1581/2012 y GDPR',
        CreationDate: new Date()
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const margin = 50;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - (margin * 2);
    
    // Use standardized header with SST Colombia logo
    const sstLogoForHeader2 = loadSstColombiaLogo();
    let currentY = await addStandardHeader({
      doc,
      company,
      documentTitle: 'PROTECCIÓN DE DATOS SST COLOMBIA',
      documentCode: `SST-DAT-${new Date().getFullYear()}`,
      version: '1.0',
      date: new Date(),
      logoBuffer: sstLogoForHeader2 || logoBuffer,
    });
    currentY += 20;

    // Content sections
    const sections = [
      {
        title: 'Marco Legal Aplicable',
        items: [
          'Ley 1581 de 2012 - Habeas Data (Colombia)',
          'GDPR UE 2016/679 - Protección de Datos (Europa)',
          'Decreto 1377 de 2013 - Reglamentación',
          'Decreto 1074 de 2015 - Retención 20 años',
          'Resolución 2346 de 2007 - Historia Clínica Ocupacional'
        ]
      },
      {
        title: 'Roles Definidos',
        items: [
          'Cliente = Responsable del Tratamiento (Data Controller)',
          'SST Colombia = Encargado del Tratamiento (Data Processor)',
          'Oficial de Protección de Datos (DPO): dpo@sst-colombia.com'
        ]
      },
      {
        title: 'Derechos ARCO (10 días hábiles)',
        items: [
          'Acceso: Conocer qué datos están siendo tratados',
          'Rectificación: Corregir datos inexactos o incompletos',
          'Cancelación: Solicitar eliminación de datos',
          'Oposición: Oponerse al tratamiento por motivos legítimos'
        ]
      },
      {
        title: 'Datos Sensibles Tratados',
        items: [
          'Datos de salud ocupacional (exámenes, diagnósticos)',
          'Historial de accidentes y enfermedades laborales',
          'Datos biométricos (si aplica)',
          'Afiliación sindical'
        ]
      },
      {
        title: 'Medidas de Seguridad',
        items: [
          'Cifrado TLS 1.3 (tránsito) + AES-256 (reposo)',
          'Autenticación con scrypt (no reversible)',
          'Control de acceso RBAC con 6 niveles',
          'Audit logs con retención de 20 años',
          'Backups diarios cifrados'
        ]
      },
      {
        title: 'Períodos de Retención',
        items: [
          'Datos SST: 20 años (Decreto 1074/2015)',
          'Historia clínica ocupacional: 20 años (Res. 2346/2007)',
          'Reportes de accidentes: Indefinido',
          'Usuarios inactivos: 2 años'
        ]
      }
    ];

    for (const section of sections) {
      // Calculate space needed for section header (title + spacing)
      const sectionHeaderSpace = 18 + 15;
      
      // Only add page break if section header won't fit on current page
      if (currentY + sectionHeaderSpace > doc.page.height - 60) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.fontSize(12).font('Helvetica-Bold')
         .fillColor('#166534')
         .text(section.title, margin, currentY);
      currentY += 18;
      
      for (const item of section.items) {
        // Check if item will fit on current page
        if (currentY + 15 > doc.page.height - 60) {
          doc.addPage();
          currentY = margin;
        }
        doc.fontSize(10).font('Helvetica')
           .fillColor('#333333')
           .text(`• ${item}`, margin + 15, currentY, { width: contentWidth - 15 });
        currentY = doc.y + 5;
      }
      currentY += 15;
    }

    // Footer
    // Add provider contact footer
    addProviderContactFooter(doc, { includeAllEmails: true });

    // Add standardized signature footer (no LSO required)
    await addSignatureFooter(doc, signers, false);

    // Apply watermarks to all pages
    applyWatermarksToAllPages(doc);

    console.log('[LegalDocsPdf] PDF content generated, ending document...');
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('error', (err: Error) => {
        console.error('[LegalDocsPdf] PDF stream error:', err);
        reject(err);
      });
      doc.on('end', async () => {
        try {
          console.log('[LegalDocsPdf] PDF stream ended, concatenating chunks...');
          const rawPdf = Buffer.concat(chunks);
          console.log(`[LegalDocsPdf] Raw PDF size: ${rawPdf.length} bytes`);
          const encryptedPdf = await applyPdfEncryption(rawPdf);
          console.log(`[LegalDocsPdf] Final PDF size: ${encryptedPdf.length} bytes`);
          resolve(encryptedPdf);
        } catch (encryptError: any) {
          console.error('[LegalDocsPdf] Error in PDF finalization:', encryptError);
          const rawPdf = Buffer.concat(chunks);
          resolve(rawPdf);
        }
      });
    });
  }

  /**
   * Generate Security and Audit Measures PDF
   */
  async generateMedidasSeguridadPdf(companyOptions: LegalDocWithCompanyOptions): Promise<Buffer> {
    console.log('[LegalDocsPdf] Starting generateMedidasSeguridadPdf');
    const { company, signers, logoBuffer } = companyOptions;
    console.log(`[LegalDocsPdf] Company: ${company?.name}, Logo: ${logoBuffer ? 'yes' : 'no'}`);
    const { default: PDFDocument } = await import('pdfkit');
    console.log('[LegalDocsPdf] PDFDocument imported successfully');
    
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'LETTER',
      info: {
        Title: 'Medidas de Seguridad y Auditoría - SST Colombia',
        Author: 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.',
        Subject: 'Documentación de Seguridad Técnica',
        CreationDate: new Date()
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const margin = 50;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - (margin * 2);
    
    // Use standardized header with SST Colombia logo
    const sstLogoForHeader3 = loadSstColombiaLogo();
    let currentY = await addStandardHeader({
      doc,
      company,
      documentTitle: 'MEDIDAS DE SEGURIDAD SST COLOMBIA',
      documentCode: `SST-SEG-${new Date().getFullYear()}`,
      version: '1.0',
      date: new Date(),
      logoBuffer: sstLogoForHeader3 || logoBuffer,
    });
    currentY += 20;

    // Rate Limiting Section
    // Check if section header fits on current page
    if (currentY + 25 > doc.page.height - 60) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534').text('1. RATE LIMITING', margin, currentY);
    currentY += 25;

    const rateLimits = [
      ['Rate Limiter', 'Límite', 'Ventana', 'Uso'],
      ['billingRateLimiter', '100 req/IP', '15 min', 'Endpoints facturación'],
      ['subscriptionMutationLimiter', '20 req/IP', '15 min', 'Cambios suscripción'],
      ['paymentOperationLimiter', '10 req/IP', '15 min', 'Operaciones pago'],
      ['loginRateLimiter', '5 req/IP', '15 min', 'Intentos de inicio de sesión'],
      ['passwordResetRateLimiter', '3 req/IP', '1 hora', 'Recuperación de contraseña'],
      ['registrationRateLimiter', '3 req/IP', '1 hora', 'Registro de cuentas nuevas'],
      ['webhookRateLimiter', '1000 req', '15 min', 'Webhooks S2S']
    ];

    for (let i = 0; i < rateLimits.length; i++) {
      // Check if row will fit on current page
      if (currentY + 18 > doc.page.height - 60) {
        doc.addPage();
        currentY = margin;
      }
      
      const row = rateLimits[i];
      const isHeader = i === 0;
      
      if (isHeader) {
        doc.rect(margin, currentY - 3, contentWidth, 18).fillColor('#166534').fill();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      } else {
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
      }
      
      doc.text(row[0], margin + 5, currentY, { width: contentWidth * 0.3 });
      doc.text(row[1], margin + contentWidth * 0.3, currentY, { width: contentWidth * 0.2 });
      doc.text(row[2], margin + contentWidth * 0.5, currentY, { width: contentWidth * 0.15 });
      doc.text(row[3], margin + contentWidth * 0.65, currentY, { width: contentWidth * 0.35 });
      currentY += 18;
    }
    
    currentY += 20;

    // Audit Logging Section
    // Check if section header fits on current page
    if (currentY + 25 > doc.page.height - 60) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534').text('2. AUDIT LOGGING', margin, currentY);
    currentY += 25;
    
    // Check if description fits on current page
    if (currentY + 25 > doc.page.height - 60) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.fontSize(10).font('Helvetica').fillColor('#333333')
       .text('Sistema de registro para cumplimiento Ley 1581/2012, Decreto 1074/2015 y Resolución 2346/2007.', margin, currentY, { width: contentWidth });
    currentY += 25;

    const auditFields = [
      'companyId, userId, userRole, username - Identificación',
      'entityType, entityId, action - Tipo de operación',
      'oldValues, newValues, changedFields - Valores antes/después',
      'dataSubjectId, dataSubjectName - Titular de datos',
      'ipAddress, userAgent, requestId - Contexto'
    ];

    for (const field of auditFields) {
      // Check if field will fit on current page
      if (currentY + 15 > doc.page.height - 60) {
        doc.addPage();
        currentY = margin;
      }
      doc.fontSize(9).text(`• ${field}`, margin + 15, currentY, { width: contentWidth - 15 });
      currentY += 15;
    }
    
    currentY += 20;

    // Security Measures Section
    // Check if section header fits on current page
    if (currentY + 25 > doc.page.height - 60) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534').text('3. MEDIDAS TÉCNICAS', margin, currentY);
    currentY += 25;

    doc.fillColor('#333333');

    const securityMeasures = [
      ['Cifrado en tránsito:', 'TLS 1.3'],
      ['Cifrado en reposo:', 'AES-256-GCM con derivación de llaves por campo'],
      ['Autenticación:', 'scrypt con salt aleatorio de 16 bytes (no reversible) + timingSafeEqual'],
      ['Sesiones:', 'Cookies httpOnly, secure, sameSite strict, expiración 12 horas'],
      ['Control de acceso:', 'RBAC con 13 roles diferenciados (Decreto 1072/2015)'],
      ['Roles del sistema:', 'Superadmin, Soporte, Superusuario, Admin, Responsable SST, Coordinador Salud, LSO, Coordinador SST, Coordinador RRHH, Jefe Personal, Supervisor, Vigía SST, Auditor Interno, Trabajador'],
      ['Firewall/WAF:', 'DDoS, SQL injection, XSS'],
      ['Monitoreo:', '24/7 con logging estructurado JSON'],
      ['Backups:', 'Automáticos cifrados, retención 20 años (Decreto 1074/2015)'],
      ['Disaster Recovery:', 'RTO ≤4h, RPO ≤24h']
    ];

    for (const measure of securityMeasures) {
      const fullText = measure[0] + ' ' + measure[1];
      doc.fontSize(9).font('Helvetica').fillColor('#333333');
      const textHeight = doc.heightOfString(fullText, { width: contentWidth - 15 });
      const rowHeight = Math.max(16, textHeight + 5);
      if (currentY + rowHeight > doc.page.height - 60) {
        doc.addPage();
        currentY = margin;
      }
      doc.font('Helvetica-Bold').fillColor('#333333').text(measure[0], margin + 15, currentY, { continued: true });
      doc.font('Helvetica').fillColor('#333333').text(' ' + measure[1], { width: contentWidth - 15 });
      currentY += rowHeight;
    }

    // Footer
    // Add provider contact footer
    addProviderContactFooter(doc, { includeAllEmails: true });

    // Add standardized signature footer (no LSO required)
    await addSignatureFooter(doc, signers, false);

    // Apply watermarks to all pages
    applyWatermarksToAllPages(doc);

    console.log('[LegalDocsPdf] PDF content generated, ending document...');
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('error', (err: Error) => {
        console.error('[LegalDocsPdf] PDF stream error:', err);
        reject(err);
      });
      doc.on('end', async () => {
        try {
          console.log('[LegalDocsPdf] PDF stream ended, concatenating chunks...');
          const rawPdf = Buffer.concat(chunks);
          console.log(`[LegalDocsPdf] Raw PDF size: ${rawPdf.length} bytes`);
          const encryptedPdf = await applyPdfEncryption(rawPdf);
          console.log(`[LegalDocsPdf] Final PDF size: ${encryptedPdf.length} bytes`);
          resolve(encryptedPdf);
        } catch (encryptError: any) {
          console.error('[LegalDocsPdf] Error in PDF finalization:', encryptError);
          const rawPdf = Buffer.concat(chunks);
          resolve(rawPdf);
        }
      });
    });
  }
}

export const legalDocsPdfService = new LegalDocsPdfService();
