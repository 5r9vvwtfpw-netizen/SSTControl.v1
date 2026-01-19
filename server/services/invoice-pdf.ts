/**
 * Invoice PDF Generation Service (Bloque 4 - Tarea 15)
 * 
 * Generates professional invoice PDFs using PDFKit for Colombian B2B billing compliance.
 * Follows existing FURAT PDF patterns from server/routes.ts
 */

interface InvoiceData {
  invoiceNumber: string;
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: string;
  amount: number;
  currency: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  description?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentTransactionId?: string;
}

interface CompanyData {
  name: string;
  nit: string;
  address?: string;
  city?: string;
  contactEmail?: string;
  phone?: string;
}

export class InvoicePdfService {
  /**
   * Generate invoice PDF buffer
   * Returns Buffer that can be attached to email or saved to disk
   */
  async generateInvoicePdf(
    invoice: InvoiceData,
    company: CompanyData
  ): Promise<Buffer> {
    // Dynamic import following existing pattern
    const { default: PDFDocument } = await import('pdfkit');
    
    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'LETTER',
      info: {
        Title: `Factura ${invoice.invoiceNumber}`,
        Author: 'SST Colombia',
        Subject: `Factura de suscripción - ${company.name}`,
        CreationDate: new Date()
      }
    });

    // Collect PDF chunks into buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const margin = 50;
    const pageWidth = doc.page.width;
    let currentY = margin;

    // ============================================================================
    // HEADER SECTION
    // ============================================================================
    
    // Logo area (placeholder for future logo support)
    doc.fontSize(20).font('Helvetica-Bold')
       .fillColor('#166534')
       .text('SST COLOMBIA', margin, currentY);
    
    currentY += 25;
    doc.fontSize(10).font('Helvetica')
       .fillColor('#333333')
       .text('Sistema Integral de Gestión SST', margin, currentY);
    
    currentY += 12;
    doc.text('www.sst-colombia.com', margin, currentY);
    
    // Invoice number and status (right aligned)
    const invoiceHeaderY = margin;
    doc.fontSize(14).font('Helvetica-Bold')
       .fillColor('#166534')
       .text(`FACTURA`, pageWidth - 200, invoiceHeaderY, { width: 150, align: 'right' });
    
    doc.fontSize(12).font('Helvetica')
       .fillColor('#333333')
       .text(invoice.invoiceNumber, pageWidth - 200, invoiceHeaderY + 20, { width: 150, align: 'right' });
    
    // Status badge
    const statusColor = invoice.status === 'paid' ? '#166534' : '#DC2626';
    const statusText = invoice.status === 'paid' ? '✓ PAGADA' : 'PENDIENTE';
    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor(statusColor)
       .text(statusText, pageWidth - 200, invoiceHeaderY + 38, { width: 150, align: 'right' });
    
    currentY += 40;
    
    // Divider line
    doc.moveTo(margin, currentY)
       .lineTo(pageWidth - margin, currentY)
       .strokeColor('#CCCCCC')
       .stroke();
    
    currentY += 20;

    // ============================================================================
    // BILLING INFORMATION
    // ============================================================================
    
    doc.fontSize(12).font('Helvetica-Bold')
       .fillColor('#166534')
       .text('INFORMACIÓN DE FACTURACIÓN', margin, currentY);
    
    currentY += 20;
    
    // Company information
    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor('#333333')
       .text('FACTURADO A:', margin, currentY);
    
    currentY += 15;
    
    doc.font('Helvetica').text(company.name, margin, currentY);
    currentY += 12;
    
    doc.text(`NIT: ${company.nit}`, margin, currentY);
    currentY += 12;
    
    if (company.address) {
      doc.text(`Dirección: ${company.address}`, margin, currentY);
      currentY += 12;
    }
    
    if (company.city) {
      doc.text(`Ciudad: ${company.city}`, margin, currentY);
      currentY += 12;
    }
    
    if (company.contactEmail) {
      doc.text(`Email: ${company.contactEmail}`, margin, currentY);
      currentY += 12;
    }
    
    currentY += 15;
    
    // Invoice dates (right column)
    const dateColumnX = pageWidth - 250;
    let dateY = currentY - 100;
    
    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor('#666666')
       .text('Fecha de Emisión:', dateColumnX, dateY);
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(this.formatDate(invoice.issuedDate), dateColumnX + 110, dateY);
    
    dateY += 15;
    
    doc.font('Helvetica-Bold')
       .fillColor('#666666')
       .text('Fecha de Vencimiento:', dateColumnX, dateY);
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(this.formatDate(invoice.dueDate), dateColumnX + 110, dateY);
    
    if (invoice.paidDate) {
      dateY += 15;
      doc.font('Helvetica-Bold')
         .fillColor('#666666')
         .text('Fecha de Pago:', dateColumnX, dateY);
      
      doc.font('Helvetica')
         .fillColor('#166534')
         .text(this.formatDate(invoice.paidDate), dateColumnX + 110, dateY);
    }
    
    dateY += 15;
    
    doc.font('Helvetica-Bold')
       .fillColor('#666666')
       .text('Período de Facturación:', dateColumnX, dateY);
    
    dateY += 12;
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(
         `${this.formatDate(invoice.billingPeriodStart)} - ${this.formatDate(invoice.billingPeriodEnd)}`,
         dateColumnX,
         dateY
       );
    
    currentY += 10;
    
    // Divider line
    doc.moveTo(margin, currentY)
       .lineTo(pageWidth - margin, currentY)
       .strokeColor('#CCCCCC')
       .stroke();
    
    currentY += 20;

    // ============================================================================
    // LINE ITEMS TABLE
    // ============================================================================
    
    doc.fontSize(12).font('Helvetica-Bold')
       .fillColor('#166534')
       .text('DETALLE DE SERVICIOS', margin, currentY);
    
    currentY += 20;
    
    // Table header
    const tableHeaderY = currentY;
    doc.rect(margin, tableHeaderY, pageWidth - (margin * 2), 25)
       .fillAndStroke('#F3F4F6', '#CCCCCC');
    
    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Descripción', margin + 10, tableHeaderY + 8, { width: 300 })
       .text('Cantidad', margin + 320, tableHeaderY + 8, { width: 60, align: 'center' })
       .text('Precio Unitario', margin + 390, tableHeaderY + 8, { width: 90, align: 'right' })
       .text('Total', margin + 490, tableHeaderY + 8, { width: 72, align: 'right' });
    
    currentY = tableHeaderY + 30;
    
    // Line items
    const lineItems = invoice.lineItems || [{
      description: invoice.description || 'Suscripción SST Colombia',
      quantity: 1,
      unitPrice: invoice.amount,
      total: invoice.amount
    }];
    
    lineItems.forEach((item, index) => {
      if (currentY > doc.page.height - 150) {
        doc.addPage();
        currentY = margin;
      }
      
      const rowY = currentY;
      const rowHeight = 30;
      
      // Alternating row background
      if (index % 2 === 0) {
        doc.rect(margin, rowY, pageWidth - (margin * 2), rowHeight)
           .fillAndStroke('#FAFAFA', '#E5E5E5');
      } else {
        doc.rect(margin, rowY, pageWidth - (margin * 2), rowHeight)
           .stroke('#E5E5E5');
      }
      
      doc.fontSize(10).font('Helvetica')
         .fillColor('#333333')
         .text(item.description, margin + 10, rowY + 8, { width: 290 })
         .text(item.quantity.toString(), margin + 320, rowY + 8, { width: 60, align: 'center' })
         .text(this.formatCurrency(item.unitPrice, invoice.currency), margin + 390, rowY + 8, { width: 90, align: 'right' })
         .text(this.formatCurrency(item.total, invoice.currency), margin + 490, rowY + 8, { width: 72, align: 'right' });
      
      currentY += rowHeight;
    });
    
    currentY += 10;

    // ============================================================================
    // TOTALS SECTION
    // ============================================================================
    
    // Total box
    const totalBoxX = pageWidth - 250;
    const totalBoxWidth = 200;
    
    doc.rect(totalBoxX, currentY, totalBoxWidth, 40)
       .fillAndStroke('#166534', '#166534');
    
    doc.fontSize(12).font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text('TOTAL A PAGAR:', totalBoxX + 10, currentY + 8)
       .fontSize(16)
       .text(
         this.formatCurrency(invoice.amount, invoice.currency),
         totalBoxX + 10,
         currentY + 22
       );
    
    currentY += 60;
    
    // Payment transaction ID (if paid)
    if (invoice.paymentTransactionId) {
      doc.fontSize(9).font('Helvetica')
         .fillColor('#666666')
         .text(
           `ID de Transacción: ${invoice.paymentTransactionId}`,
           margin,
           currentY,
           { align: 'right' }
         );
      
      currentY += 20;
    }

    // ============================================================================
    // FOOTER SECTION
    // ============================================================================
    
    if (currentY > doc.page.height - 120) {
      doc.addPage();
      currentY = margin;
    }
    
    currentY = doc.page.height - 100;
    
    // Divider line
    doc.moveTo(margin, currentY)
       .lineTo(pageWidth - margin, currentY)
       .strokeColor('#CCCCCC')
       .stroke();
    
    currentY += 15;
    
    // Footer text
    doc.fontSize(9).font('Helvetica')
       .fillColor('#666666')
       .text(
         'Gracias por confiar en SST Colombia para la gestión de seguridad y salud en el trabajo de su empresa.',
         margin,
         currentY,
         { align: 'center' }
       );
    
    currentY += 15;
    
    doc.fontSize(8)
       .fillColor('#999999')
       .text(
         'Este documento constituye una factura válida por servicios de suscripción al Sistema SST Colombia.',
         margin,
         currentY,
         { align: 'center' }
       );
    
    currentY += 12;
    
    doc.text(
      'Para consultas o soporte, contacte a soporte@sst-colombia.com',
      margin,
      currentY,
      { align: 'center' }
    );
    
    // Provider contact information - All 7 emails
    currentY += 10;
    
    doc.fontSize(7)
       .fillColor('#888888')
       .text(
         'Soporte: soporte@sst-colombia.com | Facturación: facturacion@sst-colombia.com | Pagos: pagos@sst-colombia.com',
         margin,
         currentY,
         { align: 'center' }
       );
    
    currentY += 9;
    
    doc.text(
      'Legal: legal@sst-colombia.com | DPO: dpo@sst-colombia.com | Privacidad: privacidad@sst-colombia.com',
      margin,
      currentY,
      { align: 'center' }
    );
    
    currentY += 10;
    
    doc.fontSize(6)
       .fillColor('#AAAAAA')
       .text(
         `© ${new Date().getFullYear()} SST Colombia S.A.S. - DNDA 13-197-177 - Todos los derechos reservados`,
         margin,
         currentY,
         { align: 'center' }
       );
    
    // Finalize PDF
    doc.end();

    // Wait for PDF to finish and return buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      
      doc.on('error', reject);
    });
  }

  /**
   * Format date in Colombian locale (DD de MMMM de YYYY)
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format currency in Colombian Pesos (COP)
   */
  private formatCurrency(amount: number, currency: string): string {
    if (currency === 'COP') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

export const invoicePdfService = new InvoicePdfService();
