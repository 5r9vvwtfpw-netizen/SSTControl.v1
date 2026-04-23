/**
 * PDF Standardizer Service
 * 
 * Servicio centralizado para estandarizar todos los informes PDF del sistema SST Colombia.
 * Implementa el formato corporativo según ISO 45001:2018 y normativa colombiana.
 * 
 * Estructura del documento:
 * 1. Encabezado corporativo (logo, empresa, NIT, código/versión/fecha)
 * 2. Título del documento (centrado en verde)
 * 3. Secciones con barras verdes (#1e7e34)
 * 4. Footer con firmantes (ELABORÓ, AUTORIZÓ, APROBÓ)
 * 5. Firma LSO cuando aplique (Licenciado en Salud Ocupacional)
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { users, companies, licensedProfessionalAssignments, responsibleDesignations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { objectStorageService } from '../objectStorage';

// Colores corporativos
export const PDF_COLORS = {
  GREEN_PRIMARY: '#1e7e34',
  GREEN_DARK: '#155724',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#f8f9fa',
  GRAY_BORDER: '#dee2e6',
};

// Información de contacto del proveedor SST Colombia
export const PROVIDER_CONTACT = {
  name: 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.',
  nit: '902.036.337-4',
  website: 'www.sst-colombia.com',
  emails: {
    admin: 'admin@sst-colombia.com',
    billing: 'facturacion@sst-colombia.com',
    legal: 'legal@sst-colombia.com',
    payments: 'pagos@sst-colombia.com',
    support: 'soporte@sst-colombia.com',
    dpo: 'dpo@sst-colombia.com',
    privacy: 'privacidad@sst-colombia.com',
  },
  copyright: `© ${new Date().getFullYear()} SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. - Todos los derechos reservados`,
  dnda: 'DNDA 13-197-177',
};

// Configuración de página
export const PDF_CONFIG = {
  MARGIN: 35,
  HEADER_HEIGHT: 100,
  FOOTER_HEIGHT: 80,
  CONTENT_START_Y: 120,
  PAGE_SIZE: 'LETTER' as const,
};

// Tipos para firmantes ISO 45001:2018
export interface PdfSigners {
  elaboro: {
    name: string;
    role: string;
    signatureUrl?: string;
  };
  autorizo: {
    name: string;
    role: string;
    signatureUrl?: string;
  };
  aprobo: {
    name: string;
    role: string;
    signatureUrl?: string;
  };
  lso?: {
    name: string;
    licenseNumber: string;
    licenseIssuer?: string;
    signatureUrl?: string;
  };
}

// Opciones para el encabezado estándar
export interface StandardHeaderOptions {
  doc: typeof PDFDocument.prototype;
  company: {
    id: string;
    name: string;
    nit: string;
    address?: string | null;
    logoUrl?: string | null;
  };
  documentTitle: string;
  documentCode: string;
  version?: string;
  date?: Date;
  logoBuffer?: Buffer | null;
}

// Opciones para el footer con firmantes
export interface StandardFooterOptions {
  doc: typeof PDFDocument.prototype;
  signers: PdfSigners;
  includeLSO?: boolean;
}

/**
 * Obtiene los firmantes automáticamente de la base de datos
 * según la empresa y el tipo de documento
 */
export async function getSignersForCompany(companyId: string, requiresLSO: boolean = true): Promise<PdfSigners> {
  // Obtener empresa
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  // Obtener responsable SST de la empresa
  const [responsableSst] = await db
    .select()
    .from(users)
    .where(and(
      eq(users.companyId, companyId),
      eq(users.role, 'responsable_sst')
    ))
    .limit(1);

  // Obtener LSO asignado si se requiere
  let lsoData: PdfSigners['lso'] | undefined;
  
  if (requiresLSO) {
    // 1. Prioridad: responsible_designations (designación formal del responsable)
    const [formalDesignation] = await db
      .select()
      .from(responsibleDesignations)
      .where(and(
        eq(responsibleDesignations.companyId, companyId),
        eq(responsibleDesignations.isExternalLso, true)
      ))
      .limit(1);

    if (formalDesignation && formalDesignation.externalLsoName && formalDesignation.licenciaSstNumero) {
      lsoData = {
        name: formalDesignation.externalLsoName,
        licenseNumber: formalDesignation.licenciaSstNumero,
        licenseIssuer: formalDesignation.licenciaSstVigencia 
          ? `Vigencia: ${formatDate(formalDesignation.licenciaSstVigencia)}`
          : 'Secretaría de Salud',
      };
    }

    // 2. Fallback: licensed_professional_assignments
    if (!lsoData) {
      const [assignment] = await db
        .select()
        .from(licensedProfessionalAssignments)
        .where(and(
          eq(licensedProfessionalAssignments.companyId, companyId),
          eq(licensedProfessionalAssignments.isActive, true)
        ))
        .limit(1);

      if (assignment) {
        if (assignment.externalLsoId && assignment.externalLsoName) {
          lsoData = {
            name: assignment.externalLsoName,
            licenseNumber: assignment.externalLsoLicenseNumber || 'Pendiente',
            licenseIssuer: assignment.externalLsoLicenseIssuer || 'Secretaría de Salud',
            signatureUrl: assignment.externalLsoSignatureUrl || undefined,
          };
        } else if (assignment.userId) {
          const [lsoUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, assignment.userId))
            .limit(1);

          if (lsoUser && lsoUser.sstLicenseNumber) {
            lsoData = {
              name: lsoUser.fullName || lsoUser.username,
              licenseNumber: lsoUser.sstLicenseNumber,
              licenseIssuer: lsoUser.sstLicenseIssuer || 'Secretaría de Salud',
              signatureUrl: lsoUser.sstSignatureUrl || undefined,
            };
          }
        }
      }
    }
  }

  return {
    elaboro: (() => {
      if (responsableSst) {
        return {
          name: responsableSst.fullName || responsableSst.username,
          role: 'Responsable del SG-SST',
        };
      }
      return {
        name: 'SST Colombia',
        role: 'Software Auditado de Gestión SST',
      };
    })(),
    autorizo: {
      name: company?.legalRepName || 'Representante de la Dirección',
      role: 'Representante de la Dirección',
      signatureUrl: company?.legalRepSignatureUrl || undefined,
    },
    aprobo: {
      name: company?.legalRepName || 'Alta Dirección',
      role: 'Alta Dirección / Gerencia',
      signatureUrl: company?.legalRepSignatureUrl || undefined,
    },
    lso: lsoData,
  };
}

/**
 * Agrega el encabezado corporativo estándar ISO 45001:2018
 * Incluye: Logo | Empresa/NIT | Código/Versión/Fecha
 */
export async function addStandardHeader(options: StandardHeaderOptions): Promise<number> {
  const { doc, company, documentTitle, documentCode, version = '1.0', date = new Date() } = options;
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const headerHeight = 70;
  
  // Cargar logo si no se proporcionó
  let logoBuffer = options.logoBuffer;
  if (!logoBuffer && company.logoUrl) {
    logoBuffer = await loadCompanyLogo(company.logoUrl);
  }

  // Estructura: [Logo 70px] | [Empresa 280px] | [Código/Versión 160px]
  const logoColWidth = 70;
  const companyColWidth = 280;
  const codeColWidth = pageWidth - margin * 2 - logoColWidth - companyColWidth;
  
  const startY = margin;
  
  // Borde exterior del encabezado
  doc.rect(margin, startY, pageWidth - margin * 2, headerHeight).stroke(PDF_COLORS.GREEN_PRIMARY);
  
  // Líneas verticales divisorias
  doc.moveTo(margin + logoColWidth, startY).lineTo(margin + logoColWidth, startY + headerHeight).stroke(PDF_COLORS.GREEN_PRIMARY);
  doc.moveTo(margin + logoColWidth + companyColWidth, startY).lineTo(margin + logoColWidth + companyColWidth, startY + headerHeight).stroke(PDF_COLORS.GREEN_PRIMARY);
  
  // Columna 1: Logo
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, margin + 5, startY + 5, {
        fit: [logoColWidth - 10, headerHeight - 10],
        align: 'center',
        valign: 'center',
      });
    } catch (error) {
      console.error('[PdfStandardizer] Error rendering logo:', error);
      doc.fontSize(8).text('LOGO', margin + 5, startY + 25, { width: logoColWidth - 10, align: 'center' });
    }
  } else {
    doc.fontSize(8).fillColor(PDF_COLORS.GRAY_BORDER).text('LOGO', margin + 5, startY + 25, { width: logoColWidth - 10, align: 'center' });
    doc.fillColor(PDF_COLORS.BLACK);
  }
  
  // Columna 2: Información de la Empresa
  const companyX = margin + logoColWidth + 5;
  const companyTextWidth = companyColWidth - 10;
  
  doc.fontSize(9).font('Helvetica-Bold').fillColor(PDF_COLORS.BLACK);
  doc.text(company.name.toUpperCase(), companyX, startY + 8, { width: companyTextWidth, align: 'center' });
  
  doc.fontSize(8).font('Helvetica');
  doc.text(`NIT: ${company.nit}`, companyX, startY + 22, { width: companyTextWidth, align: 'center' });
  
  doc.fontSize(9).font('Helvetica-Bold').fillColor(PDF_COLORS.GREEN_PRIMARY);
  doc.text('SISTEMA DE GESTIÓN DE', companyX, startY + 36, { width: companyTextWidth, align: 'center' });
  doc.text('SEGURIDAD Y SALUD EN EL TRABAJO', companyX, startY + 48, { width: companyTextWidth, align: 'center' });
  doc.fillColor(PDF_COLORS.BLACK);
  
  // Columna 3: Código, Versión, Fecha (tabla 3x2)
  const codeX = margin + logoColWidth + companyColWidth;
  const cellHeight = headerHeight / 3;
  const labelWidth = codeColWidth * 0.45;
  const valueWidth = codeColWidth * 0.55;
  
  // Líneas horizontales en la columna de código
  doc.moveTo(codeX, startY + cellHeight).lineTo(pageWidth - margin, startY + cellHeight).stroke(PDF_COLORS.GREEN_PRIMARY);
  doc.moveTo(codeX, startY + cellHeight * 2).lineTo(pageWidth - margin, startY + cellHeight * 2).stroke(PDF_COLORS.GREEN_PRIMARY);
  
  // Línea vertical separadora label/value
  doc.moveTo(codeX + labelWidth, startY).lineTo(codeX + labelWidth, startY + headerHeight).stroke(PDF_COLORS.GREEN_PRIMARY);
  
  // Textos de código/versión/fecha
  doc.fontSize(7).font('Helvetica-Bold');
  doc.text('CÓDIGO:', codeX + 3, startY + 7, { width: labelWidth - 6, align: 'left' });
  doc.text('VERSIÓN:', codeX + 3, startY + cellHeight + 7, { width: labelWidth - 6, align: 'left' });
  doc.text('FECHA:', codeX + 3, startY + cellHeight * 2 + 7, { width: labelWidth - 6, align: 'left' });
  
  doc.font('Helvetica');
  doc.text(documentCode, codeX + labelWidth + 3, startY + 7, { width: valueWidth - 6, align: 'center' });
  doc.text(version, codeX + labelWidth + 3, startY + cellHeight + 7, { width: valueWidth - 6, align: 'center' });
  doc.text(formatDate(date), codeX + labelWidth + 3, startY + cellHeight * 2 + 7, { width: valueWidth - 6, align: 'center' });
  
  // Título del documento debajo del encabezado
  const titleY = startY + headerHeight + 10;
  addDocumentTitle(doc, documentTitle, titleY);
  
  return doc.y;
}

/**
 * Formatea fecha en formato colombiano DD/MM/YYYY
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Agrega una barra de sección verde con texto blanco
 */
export function addSectionBar(
  doc: typeof PDFDocument.prototype,
  title: string,
  y?: number
): number {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const barHeight = 20;
  const currentY = y ?? doc.y;

  // Verificar espacio en página
  const safeY = checkPageBreak(doc, barHeight + 20, currentY);

  // Dibujar barra verde
  doc
    .rect(margin, safeY, pageWidth - margin * 2, barHeight)
    .fill(PDF_COLORS.GREEN_PRIMARY);

  // Texto blanco centrado
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(PDF_COLORS.WHITE)
    .text(title.toUpperCase(), margin, safeY + 5, {
      width: pageWidth - margin * 2,
      align: 'center',
    });

  // Restaurar color
  doc.fillColor(PDF_COLORS.BLACK);

  return safeY + barHeight + 10;
}

/**
 * Agrega el título del documento centrado en verde
 */
export function addDocumentTitle(
  doc: typeof PDFDocument.prototype,
  title: string,
  y?: number
): number {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const currentY = y ?? doc.y;

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(PDF_COLORS.GREEN_PRIMARY)
    .text(title.toUpperCase(), margin, currentY, {
      width: pageWidth - margin * 2,
      align: 'center',
    });

  // Restaurar color
  doc.fillColor(PDF_COLORS.BLACK);

  return doc.y + 15;
}

/**
 * Agrega el footer con firmantes ISO 45001:2018
 */
export async function addSignatureFooter(
  doc: typeof PDFDocument.prototype,
  signers: PdfSigners,
  includeLSO: boolean = false
): Promise<void> {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  
  const hasLsoSignatureImage = includeLSO && !!signers.lso?.signatureUrl;
  const hasRepSignatureImage = !!(signers.autorizo.signatureUrl || signers.aprobo.signatureUrl);
  const hasAnySignatureImage = hasLsoSignatureImage || hasRepSignatureImage;
  const footerHeight = hasAnySignatureImage ? 130 : (includeLSO ? 100 : 70);

  const potentialFooterY = pageHeight - margin - footerHeight;
  let footerY: number;
  if (doc.y > potentialFooterY) {
    doc.addPage();
    footerY = pageHeight - margin - footerHeight;
  } else {
    footerY = potentialFooterY;
  }

  const numCols = includeLSO ? 4 : 3;
  const colWidth = (pageWidth - margin * 2) / numCols;
  const headerRowHeight = 18;
  const signatureImageHeight = hasAnySignatureImage ? 35 : 0;
  const nameRowHeight = 35 + signatureImageHeight;
  const totalHeight = headerRowHeight + nameRowHeight;

  // Helper para cargar buffer de firma desde cualquier fuente
  const loadSigBuffer = async (sigUrl: string): Promise<Buffer | null> => {
    try {
      if (sigUrl.startsWith('/uploads/') || sigUrl.startsWith('/objects/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', sigUrl);
        if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
      } else if (sigUrl.startsWith('http')) {
        const response = await fetch(sigUrl);
        if (response.ok) return Buffer.from(await response.arrayBuffer());
      } else {
        // /objects/logos/... o /objects/signatures/... — S3 vía objectStorageService
        return await objectStorageService.getObjectBuffer(sigUrl);
      }
    } catch (e: any) {
      console.error('[PdfStandardizer] Error loading signature buffer:', e.message);
    }
    return null;
  };

  // Pre-cargar buffers de firma del representante legal
  let autorizoSigBuffer: Buffer | null = null;
  let aproboSigBuffer: Buffer | null = null;
  if (signers.autorizo.signatureUrl) {
    autorizoSigBuffer = await loadSigBuffer(signers.autorizo.signatureUrl);
  }
  if (signers.aprobo.signatureUrl) {
    // Si AUTORIZÓ y APROBÓ usan la misma URL reutilizamos el buffer
    if (signers.aprobo.signatureUrl === signers.autorizo.signatureUrl && autorizoSigBuffer) {
      aproboSigBuffer = autorizoSigBuffer;
    } else {
      aproboSigBuffer = await loadSigBuffer(signers.aprobo.signatureUrl);
    }
  }

  // Dibujar tabla de firmas
  doc.rect(margin, footerY, pageWidth - margin * 2, totalHeight).stroke(PDF_COLORS.GREEN_PRIMARY);

  // Líneas verticales
  for (let i = 1; i < numCols; i++) {
    doc
      .moveTo(margin + colWidth * i, footerY)
      .lineTo(margin + colWidth * i, footerY + totalHeight)
      .stroke(PDF_COLORS.GREEN_PRIMARY);
  }

  // Línea horizontal separadora
  doc
    .moveTo(margin, footerY + headerRowHeight)
    .lineTo(pageWidth - margin, footerY + headerRowHeight)
    .stroke(PDF_COLORS.GREEN_PRIMARY);

  // Encabezados
  doc.fontSize(8).font('Helvetica-Bold').fillColor(PDF_COLORS.BLACK);
  doc.text('ELABORÓ', margin + 5, footerY + 4, { width: colWidth - 10, align: 'center' });
  doc.text('AUTORIZÓ', margin + colWidth + 5, footerY + 4, { width: colWidth - 10, align: 'center' });
  doc.text('APROBÓ', margin + colWidth * 2 + 5, footerY + 4, { width: colWidth - 10, align: 'center' });

  if (includeLSO) {
    doc.text('LICENCIADO SST', margin + colWidth * 3 + 5, footerY + 4, { width: colWidth - 10, align: 'center' });
  }

  // Nombres y roles
  doc.fontSize(7).font('Helvetica');
  const nameY = footerY + headerRowHeight + 4;
  const imgW = Math.min(colWidth - 16, 80);
  const imgH = signatureImageHeight - 2;

  // ELABORÓ (sin imagen de firma)
  doc.text(signers.elaboro.name, margin + 4, nameY + (hasAnySignatureImage ? signatureImageHeight : 0), { width: colWidth - 8, align: 'center' });
  doc.fontSize(6).text(signers.elaboro.role, margin + 4, nameY + (hasAnySignatureImage ? signatureImageHeight : 0) + 12, { width: colWidth - 8, align: 'center' });

  // AUTORIZÓ — con imagen de firma si existe
  const autorizoColX = margin + colWidth + 4;
  if (autorizoSigBuffer) {
    try {
      const imgX = autorizoColX + (colWidth - 8 - imgW) / 2;
      doc.image(autorizoSigBuffer, imgX, nameY, { fit: [imgW, imgH], align: 'center', valign: 'center' });
    } catch (e: any) {
      console.error('[PdfStandardizer] Error drawing AUTORIZÓ signature:', e.message);
    }
  }
  doc.fontSize(7).text(signers.autorizo.name, autorizoColX, nameY + (hasAnySignatureImage ? signatureImageHeight : 0), { width: colWidth - 8, align: 'center' });
  doc.fontSize(6).text(signers.autorizo.role, autorizoColX, nameY + (hasAnySignatureImage ? signatureImageHeight : 0) + 12, { width: colWidth - 8, align: 'center' });

  // APROBÓ — con imagen de firma si existe
  const aproboColX = margin + colWidth * 2 + 4;
  if (aproboSigBuffer) {
    try {
      const imgX = aproboColX + (colWidth - 8 - imgW) / 2;
      doc.image(aproboSigBuffer, imgX, nameY, { fit: [imgW, imgH], align: 'center', valign: 'center' });
    } catch (e: any) {
      console.error('[PdfStandardizer] Error drawing APROBÓ signature:', e.message);
    }
  }
  doc.fontSize(7).text(signers.aprobo.name, aproboColX, nameY + (hasAnySignatureImage ? signatureImageHeight : 0), { width: colWidth - 8, align: 'center' });
  doc.fontSize(6).text(signers.aprobo.role, aproboColX, nameY + (hasAnySignatureImage ? signatureImageHeight : 0) + 12, { width: colWidth - 8, align: 'center' });
  
  if (includeLSO) {
    if (signers.lso) {
      const lsoColX = margin + colWidth * 3 + 4;
      const lsoColW = colWidth - 8;
      // Alinear verticalmente con las demás columnas cuando hay imágenes de firma
      let lsoTextY = hasAnySignatureImage ? nameY + signatureImageHeight : nameY;

      if (signers.lso.signatureUrl) {
        try {
          const imgW = Math.min(lsoColW - 4, 80);
          const imgH = signatureImageHeight - 2;
          const imgX = lsoColX + (lsoColW - imgW) / 2;

          let sigBuffer: Buffer | null = null;
          const sigUrl = signers.lso.signatureUrl;

          if (sigUrl.startsWith('/uploads/')) {
            const localPath = path.join(process.cwd(), 'public', sigUrl);
            if (fs.existsSync(localPath)) {
              sigBuffer = fs.readFileSync(localPath);
            }
          } else if (sigUrl.startsWith('http')) {
            try {
              const response = await fetch(sigUrl);
              if (response.ok) {
                sigBuffer = Buffer.from(await response.arrayBuffer());
              }
            } catch (fetchErr: any) {
              console.error('[PdfStandardizer] Error fetching remote signature:', fetchErr.message);
            }
          } else if (sigUrl.includes('replit-objstore')) {
            try {
              const { objectStorageClient } = await import('../replit_integrations/object_storage/objectStorage.js');
              let objPath = sigUrl;
              if (!objPath.startsWith('/')) objPath = '/' + objPath;
              const pathParts = objPath.split('/').filter(Boolean);
              if (pathParts.length >= 2) {
                const bucketName = pathParts[0];
                const objectName = pathParts.slice(1).join('/');
                const bucket = objectStorageClient.bucket(bucketName);
                const file = bucket.file(objectName);
                const [exists] = await file.exists();
                if (exists) {
                  const [contents] = await file.download();
                  sigBuffer = contents;
                  console.log(`[PdfStandardizer] LSO signature loaded from GCS: ${objectName}`);
                }
              }
            } catch (osErr: any) {
              console.error('[PdfStandardizer] Error fetching signature from GCS:', osErr.message);
            }
          } else {
            try {
              sigBuffer = await objectStorageService.getObjectBuffer(sigUrl);
            } catch (osErr: any) {
              console.error('[PdfStandardizer] Error fetching signature from Object Storage:', osErr.message);
            }
          }

          if (sigBuffer) {
            doc.image(sigBuffer, imgX, nameY, { fit: [imgW, imgH], align: 'center', valign: 'center' });
            lsoTextY = nameY + signatureImageHeight;
          }
        } catch (sigError: any) {
          console.error('[PdfStandardizer] Error rendering LSO signature image:', sigError.message);
        }
      }

      doc.fontSize(7).text(signers.lso.name, lsoColX, lsoTextY, { width: lsoColW, align: 'center' });
      doc.fontSize(6).text(`Lic. ${signers.lso.licenseNumber}`, lsoColX, lsoTextY + 12, { width: lsoColW, align: 'center' });
      if (signers.lso.licenseIssuer) {
        doc.fontSize(5).text(signers.lso.licenseIssuer, lsoColX, lsoTextY + 20, { width: lsoColW, align: 'center' });
      }
    } else {
      doc.fontSize(7).fillColor('#999').text('(Pendiente asignación)', margin + colWidth * 3 + 4, nameY, { width: colWidth - 8, align: 'center' });
      doc.fontSize(6).text('Lic. SST requerido', margin + colWidth * 3 + 4, nameY + 12, { width: colWidth - 8, align: 'center' });
      doc.fillColor(PDF_COLORS.BLACK);
    }
  }
}

/**
 * Agrega footer con información de contacto del proveedor SST Colombia
 * Incluye: emails de contacto, copyright y registro DNDA
 * 
 * Esta función agrega el footer en la posición ACTUAL del documento,
 * no al final de la página. Debe llamarse ANTES de addSignatureFooter
 * para evitar solapamientos.
 */
export function addProviderContactFooter(
  doc: typeof PDFDocument.prototype,
  options?: {
    includeAllEmails?: boolean;
    compact?: boolean;
    atCurrentPosition?: boolean; // Si true, usa doc.y actual; si false, usa posición fija
  }
): number {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const includeAll = options?.includeAllEmails ?? true;
  const compact = options?.compact ?? false;
  const atCurrentPosition = options?.atCurrentPosition ?? true;
  
  // Calcular altura del footer de contacto (incluye DPO y Privacidad)
  const footerHeight = compact ? 20 : (includeAll ? 55 : 30);
  
  // Determinar posición Y: usar posición actual o parte inferior de la página
  let footerY: number;
  if (atCurrentPosition) {
    // Verificar si hay espacio suficiente
    const availableSpace = pageHeight - margin - doc.y;
    if (availableSpace < footerHeight + 100) { // 100 para footer de firmas
      doc.addPage();
      footerY = margin + 20;
    } else {
      footerY = doc.y + 15;
    }
  } else {
    footerY = pageHeight - margin - footerHeight - 80; // 80 para footer de firmas
  }
  
  // Línea separadora
  doc
    .moveTo(margin, footerY)
    .lineTo(pageWidth - margin, footerY)
    .strokeColor(PDF_COLORS.GRAY_BORDER)
    .stroke();
  
  const contentY = footerY + 5;
  
  if (compact) {
    // Versión compacta: una línea
    doc.fontSize(6).font('Helvetica').fillColor('#666666');
    doc.text(
      `${PROVIDER_CONTACT.name} | Soporte: ${PROVIDER_CONTACT.emails.support} | ${PROVIDER_CONTACT.copyright}`,
      margin,
      contentY,
      { width: pageWidth - margin * 2, align: 'center' }
    );
  } else if (includeAll) {
    // Versión completa con todos los emails (incluyendo DPO y Privacidad)
    doc.fontSize(7).font('Helvetica-Bold').fillColor(PDF_COLORS.GREEN_PRIMARY);
    doc.text('CONTACTO SST COLOMBIA', margin, contentY, { 
      width: pageWidth - margin * 2, 
      align: 'center' 
    });
    
    doc.fontSize(6).font('Helvetica').fillColor('#666666');
    const emailsLine1 = `Soporte: ${PROVIDER_CONTACT.emails.support} | Facturación: ${PROVIDER_CONTACT.emails.billing} | Pagos: ${PROVIDER_CONTACT.emails.payments}`;
    const emailsLine2 = `Legal: ${PROVIDER_CONTACT.emails.legal} | DPO: ${PROVIDER_CONTACT.emails.dpo} | Privacidad: ${PROVIDER_CONTACT.emails.privacy}`;
    
    doc.text(emailsLine1, margin, contentY + 10, { 
      width: pageWidth - margin * 2, 
      align: 'center' 
    });
    doc.text(emailsLine2, margin, contentY + 19, { 
      width: pageWidth - margin * 2, 
      align: 'center' 
    });
    
    doc.fontSize(5).fillColor('#999999');
    doc.text(`${PROVIDER_CONTACT.copyright} | ${PROVIDER_CONTACT.dnda}`, margin, contentY + 30, { 
      width: pageWidth - margin * 2, 
      align: 'center' 
    });
  } else {
    // Versión estándar: solo soporte y copyright
    doc.fontSize(6).font('Helvetica').fillColor('#666666');
    doc.text(
      `Soporte Técnico: ${PROVIDER_CONTACT.emails.support}`,
      margin,
      contentY,
      { width: pageWidth - margin * 2, align: 'center' }
    );
    doc.text(
      `${PROVIDER_CONTACT.copyright} | ${PROVIDER_CONTACT.dnda}`,
      margin,
      contentY + 10,
      { width: pageWidth - margin * 2, align: 'center' }
    );
  }
  
  doc.fillColor(PDF_COLORS.BLACK);
  
  // Actualizar doc.y para el siguiente elemento
  doc.y = footerY + footerHeight + 5;
  return doc.y;
}

/**
 * Verifica si hay espacio suficiente en la página actual
 * Si no hay espacio, agrega una nueva página y retorna la nueva posición Y
 */
export function checkPageBreak(
  doc: typeof PDFDocument.prototype,
  neededHeight: number,
  currentY?: number
): number {
  const y = currentY ?? doc.y;
  const pageHeight = doc.page.height;
  const margin = PDF_CONFIG.MARGIN;
  const footerMargin = 150; // Espacio reservado para el footer (130px tabla firmas + 20px buffer)
  const availableSpace = pageHeight - margin - footerMargin;

  if (y + neededHeight > availableSpace) {
    doc.addPage();
    return PDF_CONFIG.CONTENT_START_Y;
  }

  return y;
}

/**
 * Verifica si el contenido restante cabe en la página actual
 * Útil para evitar páginas en blanco al final
 */
export function hasRemainingSpace(
  doc: typeof PDFDocument.prototype,
  neededHeight: number
): boolean {
  const y = doc.y;
  const pageHeight = doc.page.height;
  const margin = PDF_CONFIG.MARGIN;
  const footerMargin = 150;
  const availableSpace = pageHeight - margin - footerMargin;

  return y + neededHeight <= availableSpace;
}

/**
 * Agrega una tabla simple con bordes
 */
export function addSimpleTable(
  doc: typeof PDFDocument.prototype,
  headers: string[],
  rows: string[][],
  options?: {
    y?: number;
    columnWidths?: number[];
    headerBgColor?: string;
    headerTextColor?: string;
  }
): number {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const tableWidth = pageWidth - margin * 2;
  const minRowHeight = 20;
  const cellPadding = 4;
  const numCols = headers.length;
  
  const colWidths = options?.columnWidths || 
    headers.map(() => tableWidth / numCols);
  
  let currentY = options?.y ?? doc.y;
  
  currentY = checkPageBreak(doc, minRowHeight * 2, currentY);

  const headerBgColor = options?.headerBgColor || PDF_COLORS.GREEN_PRIMARY;
  const headerTextColor = options?.headerTextColor || PDF_COLORS.WHITE;
  
  doc.rect(margin, currentY, tableWidth, minRowHeight).fill(headerBgColor);
  
  doc.fontSize(8).font('Helvetica-Bold').fillColor(headerTextColor);
  let xPos = margin;
  headers.forEach((header, i) => {
    doc.text(header, xPos + cellPadding, currentY + 6, { width: colWidths[i] - cellPadding * 2, align: 'center' });
    xPos += colWidths[i];
  });

  currentY += minRowHeight;

  doc.font('Helvetica').fillColor(PDF_COLORS.BLACK);
  
  for (const row of rows) {
    doc.fontSize(7);
    let maxCellHeight = minRowHeight;
    const cellHeights = row.map((cell, i) => {
      const textHeight = doc.heightOfString(cell || '', { width: colWidths[i] - cellPadding * 2 });
      return textHeight + cellPadding * 2;
    });
    maxCellHeight = Math.max(minRowHeight, ...cellHeights);

    currentY = checkPageBreak(doc, maxCellHeight, currentY);

    const cellY = currentY + cellPadding;
    xPos = margin;
    row.forEach((cell, i) => {
      doc.rect(xPos, currentY, colWidths[i], maxCellHeight).stroke(PDF_COLORS.GRAY_BORDER);
      doc.fontSize(7).fillColor(PDF_COLORS.BLACK);
      doc.y = cellY;
      doc.text(cell || '', xPos + cellPadding, cellY, {
        width: colWidths[i] - cellPadding * 2,
        align: 'left',
        lineBreak: true,
      });
      xPos += colWidths[i];
    });
    
    currentY += maxCellHeight;
  }

  doc.y = currentY + 10;
  return currentY + 10;
}

/**
 * Agrega un párrafo de texto con formato estándar
 */
export function addParagraph(
  doc: typeof PDFDocument.prototype,
  text: string,
  options?: {
    fontSize?: number;
    bold?: boolean;
    indent?: number;
    y?: number;
  }
): number {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const fontSize = options?.fontSize || 9;
  const indent = options?.indent || 0;
  
  let currentY = options?.y ?? doc.y;
  
  // Estimar altura del texto
  const lineHeight = fontSize * 1.4;
  const textWidth = pageWidth - margin * 2 - indent;
  const estimatedLines = Math.ceil((text.length * fontSize * 0.5) / textWidth);
  const estimatedHeight = estimatedLines * lineHeight;
  
  // Verificar espacio
  currentY = checkPageBreak(doc, estimatedHeight, currentY);

  doc
    .fontSize(fontSize)
    .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fillColor(PDF_COLORS.BLACK)
    .text(text, margin + indent, currentY, {
      width: textWidth,
      align: 'justify',
    });

  return doc.y + 5;
}

/**
 * Agrega un campo con etiqueta y valor
 */
export function addLabeledField(
  doc: typeof PDFDocument.prototype,
  label: string,
  value: string,
  options?: {
    y?: number;
    labelWidth?: number;
  }
): number {
  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const labelWidth = options?.labelWidth || 120;
  
  let currentY = options?.y ?? doc.y;
  currentY = checkPageBreak(doc, 20, currentY);

  // Etiqueta
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(PDF_COLORS.BLACK)
    .text(`${label}:`, margin, currentY, { width: labelWidth, continued: true });

  // Valor
  doc
    .font('Helvetica')
    .text(` ${value || 'N/A'}`, { width: pageWidth - margin * 2 - labelWidth });

  return doc.y + 3;
}

/**
 * Carga el logo de la empresa desde Object Storage
 */
export async function loadCompanyLogo(logoUrl: string | null | undefined): Promise<Buffer | null> {
  if (!logoUrl) return null;
  
  try {
    // Normalizar path (remover prefijo bucket si existe)
    let normalizedPath = logoUrl;
    if (normalizedPath.startsWith('repl-default-bucket-')) {
      const parts = normalizedPath.split('/');
      parts.shift(); // Remover nombre del bucket
      normalizedPath = parts.join('/');
    }
    
    const buffer = await objectStorageService.getObjectBuffer(normalizedPath);
    console.log("[PdfStandardizer] Logo loaded:", buffer ? `Buffer(${buffer.length} bytes)` : "null");
    return buffer;
  } catch (error) {
    console.error('[PdfStandardizer] Error loading logo:', error);
    return null;
  }
}

/**
 * Verifica si un informe requiere firma de LSO
 * Basado en Resolución 0312/2019 y normativa colombiana
 */
export function requiresLSOSignature(reportType: string): boolean {
  const reportsRequiringLSO = [
    'furat',                    // Accidente de trabajo
    'furel',                    // Enfermedad laboral
    'investigation',            // Investigación de accidentes (severos/fatales)
    'high_risk_workers',        // Trabajadores alto riesgo
    'medical_exams',            // Exámenes médicos
    'absenteeism_statistics',   // Estadísticas ausentismo
    'sociodemographic_profile', // Perfil sociodemográfico
    'sve_program',              // Programa SVE
  ];
  
  return reportsRequiringLSO.includes(reportType);
}

/**
 * Obtiene el código de documento estándar según el tipo
 */
export function getDocumentCode(reportType: string, companyNit?: string): string {
  const prefix = 'SST';
  const year = new Date().getFullYear();
  
  const typeCodes: Record<string, string> = {
    furat: 'FURAT',
    furel: 'FUREL',
    investigation: 'INV-AT',
    high_risk_workers: 'TAR',
    medical_exams: 'EMO',
    absenteeism_statistics: 'EST-AUS',
    sociodemographic_profile: 'PSD',
    sst_evaluation: 'EVA-SST',
    annual_plan: 'PAT',
    training_program: 'PCA',
    internal_audit: 'AUD-INT',
    management_review: 'REV-DIR',
    objectives_indicators: 'OBJ-IND',
    policies: 'POL-SST',
    copasst_acta: 'COPASST',
    convivencia_acta: 'CCL',
    emergency_plan: 'PLE',
    iperc: 'IPERC',
    induction: 'IND-REI',
    epp_delivery: 'ENT-EPP',
    job_profile: 'PC',
    environmental_measurement: 'MED-AMB',
    hazardous_substances: 'INV-SP',
    change_management: 'GC',
    acquisition: 'ADQ',
    supplier_evaluation: 'EVA-PROV',
  };
  
  const typeCode = typeCodes[reportType] || 'DOC';
  return `${prefix}-${typeCode}-${year}`;
}

/**
 * Maneja errores de generación de PDF de manera segura
 * No expone mensajes técnicos internos (SSL, certificados, etc.) a los usuarios
 * 
 * @param error - El error capturado
 * @param res - Response de Express
 * @param logContext - Contexto adicional para el log (ej: "training-programs PDF")
 */
export function handlePdfError(error: any, res: any, logContext: string = 'PDF'): void {
  console.error(`[${logContext}] Error generating PDF:`, error);
  
  // No enviar headers si ya fueron enviados
  if (res.headersSent) {
    return;
  }
  
  // Detectar errores internos que no deben exponerse al usuario
  const errorMessage = error?.message || '';
  const isInternalError = 
    errorMessage.includes('certificate') ||
    errorMessage.includes('certificado') ||
    errorMessage.includes('CERT') ||
    errorMessage.includes('SSL') ||
    errorMessage.includes('TLS') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ECONNRESET') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('self signed') ||
    errorMessage.includes('autofirmado') ||
    errorMessage.includes('socket hang up') ||
    errorMessage.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE');
  
  if (isInternalError) {
    res.status(500).send('Error al generar el documento. Por favor intente nuevamente o contacte soporte técnico.');
  } else {
    // Para otros errores, enviar un mensaje genérico pero informativo
    res.status(500).send('Error al generar el documento. Por favor intente nuevamente.');
  }
}
