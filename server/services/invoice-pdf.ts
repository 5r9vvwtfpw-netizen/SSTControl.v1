/**
 * Invoice PDF Generation Service
 * 
 * Generates professional invoice PDFs using PDFKit for Colombian B2B billing.
 * Provider: SADGI S.A.S. (NIT 902.036.337-4)
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
  private readonly GREEN = '#166534';
  private readonly DARK = '#1a1a1a';
  private readonly GRAY = '#555555';
  private readonly LIGHT_GRAY = '#888888';
  private readonly BORDER = '#d1d5db';
  private readonly BG_LIGHT = '#f9fafb';
  private readonly WHITE = '#ffffff';

  async generateInvoicePdf(
    invoice: InvoiceData,
    company: CompanyData
  ): Promise<Buffer> {
    const { default: PDFDocument } = await import('pdfkit');
    
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'LETTER',
      info: {
        Title: `Factura ${invoice.invoiceNumber}`,
        Author: 'SST Colombia - SADGI S.A.S.',
        Subject: `Factura de suscripcion - ${company.name}`,
        CreationDate: new Date()
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const M = 50;
    const W = doc.page.width;
    const contentW = W - M * 2;
    let y = M;

    // ============================================================
    // HEADER - Logo + Invoice number box
    // ============================================================
    
    doc.fontSize(22).font('Helvetica-Bold')
       .fillColor(this.GREEN)
       .text('SST COLOMBIA', M, y);
    
    y += 26;
    doc.fontSize(9).font('Helvetica')
       .fillColor(this.GRAY)
       .text('Sistema Integral de Gestion SST', M, y);
    y += 13;
    doc.text('www.sst-colombia.com', M, y);
    y += 13;
    doc.text('NIT: 902.036.337-4', M, y);

    const boxW = 170;
    const boxX = W - M - boxW;
    const boxY = M;
    
    doc.rect(boxX, boxY, boxW, 70)
       .fillAndStroke(this.BG_LIGHT, this.BORDER);

    doc.fontSize(11).font('Helvetica-Bold')
       .fillColor(this.GREEN)
       .text('FACTURA DE VENTA', boxX, boxY + 10, { width: boxW, align: 'center' });
    
    doc.fontSize(12).font('Helvetica-Bold')
       .fillColor(this.DARK)
       .text(invoice.invoiceNumber, boxX, boxY + 28, { width: boxW, align: 'center' });

    const isPaid = invoice.status === 'paid';
    const statusColor = isPaid ? this.GREEN : '#DC2626';
    const statusText = isPaid ? 'PAGADA' : 'PENDIENTE';

    const badgeW = 80;
    const badgeX = boxX + (boxW - badgeW) / 2;
    const badgeY = boxY + 46;
    doc.roundedRect(badgeX, badgeY, badgeW, 16, 3)
       .fillAndStroke(statusColor, statusColor);
    doc.fontSize(8).font('Helvetica-Bold')
       .fillColor(this.WHITE)
       .text(statusText, badgeX, badgeY + 4, { width: badgeW, align: 'center' });

    y += 30;

    doc.moveTo(M, y).lineTo(W - M, y)
       .strokeColor(this.BORDER).lineWidth(1).stroke();
    y += 20;

    // ============================================================
    // TWO-COLUMN: Client info (left) + Dates (right)
    // ============================================================

    const colLeftX = M;
    const colLeftW = contentW * 0.5;
    const colRightX = M + contentW * 0.52;
    const colRightW = contentW * 0.48;
    const sectionStartY = y;

    doc.fontSize(9).font('Helvetica-Bold')
       .fillColor(this.GREEN)
       .text('FACTURADO A', colLeftX, y);
    y += 16;

    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor(this.DARK)
       .text(company.name, colLeftX, y, { width: colLeftW });
    y += 15;

    doc.fontSize(9).font('Helvetica')
       .fillColor(this.GRAY);

    doc.text('NIT: ' + company.nit, colLeftX, y, { width: colLeftW });
    y += 13;

    if (company.address) {
      doc.text(company.address, colLeftX, y, { width: colLeftW });
      y += 13;
    }
    if (company.city) {
      doc.text(company.city, colLeftX, y, { width: colLeftW });
      y += 13;
    }
    if (company.contactEmail) {
      doc.text(company.contactEmail, colLeftX, y, { width: colLeftW });
      y += 13;
    }
    if (company.phone) {
      doc.text('Tel: ' + company.phone, colLeftX, y, { width: colLeftW });
      y += 13;
    }

    const leftEndY = y;

    let ry = sectionStartY;

    doc.fontSize(9).font('Helvetica-Bold')
       .fillColor(this.GREEN)
       .text('DATOS DE LA FACTURA', colRightX, ry, { width: colRightW });
    ry += 16;

    const dateRows: Array<{ label: string; value: string; valueColor?: string }> = [
      { label: 'Fecha de Emision', value: this.formatDate(invoice.issuedDate) },
      { label: 'Fecha de Vencimiento', value: this.formatDate(invoice.dueDate) },
    ];

    if (invoice.paidDate) {
      dateRows.push({
        label: 'Fecha de Pago',
        value: this.formatDate(invoice.paidDate),
        valueColor: this.GREEN
      });
    }

    dateRows.push({
      label: 'Periodo de Facturacion',
      value: this.formatDate(invoice.billingPeriodStart) + ' al ' + this.formatDate(invoice.billingPeriodEnd)
    });

    for (const row of dateRows) {
      doc.fontSize(8).font('Helvetica-Bold')
         .fillColor(this.LIGHT_GRAY)
         .text(row.label, colRightX, ry, { width: colRightW });
      ry += 12;
      doc.fontSize(9).font('Helvetica')
         .fillColor(row.valueColor || this.DARK)
         .text(row.value, colRightX, ry, { width: colRightW });
      ry += 16;
    }

    y = Math.max(leftEndY, ry) + 10;

    doc.moveTo(M, y).lineTo(W - M, y)
       .strokeColor(this.BORDER).lineWidth(1).stroke();
    y += 20;

    // ============================================================
    // LINE ITEMS TABLE
    // ============================================================

    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor(this.GREEN)
       .text('DETALLE DE SERVICIOS', M, y);
    y += 18;

    const col1X = M;
    const col1W = contentW * 0.50;
    const col2X = M + contentW * 0.50;
    const col2W = contentW * 0.12;
    const col3X = M + contentW * 0.62;
    const col3W = contentW * 0.18;
    const col4X = M + contentW * 0.80;
    const col4W = contentW * 0.20;
    const rowH = 28;

    doc.rect(M, y, contentW, rowH)
       .fillAndStroke(this.GREEN, this.GREEN);

    doc.fontSize(9).font('Helvetica-Bold')
       .fillColor(this.WHITE)
       .text('Descripcion', col1X + 8, y + 9, { width: col1W - 8 })
       .text('Cant.', col2X, y + 9, { width: col2W, align: 'center' })
       .text('Precio Unit.', col3X, y + 9, { width: col3W, align: 'right' })
       .text('Total', col4X, y + 9, { width: col4W - 8, align: 'right' });

    y += rowH;

    const lineItems = invoice.lineItems || [{
      description: invoice.description || 'Suscripcion SST Colombia',
      quantity: 1,
      unitPrice: invoice.amount,
      total: invoice.amount
    }];

    lineItems.forEach((item, index) => {
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = M;
      }

      const bgColor = index % 2 === 0 ? this.BG_LIGHT : this.WHITE;
      doc.rect(M, y, contentW, rowH)
         .fillAndStroke(bgColor, this.BORDER);

      doc.fontSize(9).font('Helvetica')
         .fillColor(this.DARK)
         .text(item.description, col1X + 8, y + 9, { width: col1W - 8 })
         .text(item.quantity.toString(), col2X, y + 9, { width: col2W, align: 'center' })
         .text(this.formatCurrency(item.unitPrice), col3X, y + 9, { width: col3W, align: 'right' })
         .text(this.formatCurrency(item.total), col4X, y + 9, { width: col4W - 8, align: 'right' });

      y += rowH;
    });

    y += 5;

    // ============================================================
    // SUBTOTAL / IVA / TOTAL
    // ============================================================

    const totalsX = col3X;
    const totalsLabelW = col3W;
    const totalsValW = col4W - 8;
    const totalsValX = col4X;

    doc.fontSize(9).font('Helvetica')
       .fillColor(this.GRAY)
       .text('Subtotal:', totalsX, y, { width: totalsLabelW, align: 'right' })
       .fillColor(this.DARK)
       .text(this.formatCurrency(invoice.amount), totalsValX, y, { width: totalsValW, align: 'right' });
    y += 16;

    doc.fontSize(9).font('Helvetica')
       .fillColor(this.GRAY)
       .text('IVA (0%):', totalsX, y, { width: totalsLabelW, align: 'right' })
       .fillColor(this.DARK)
       .text('$0', totalsValX, y, { width: totalsValW, align: 'right' });
    y += 18;

    const totalBoxW = col3W + col4W;
    const totalBoxX = col3X;
    doc.rect(totalBoxX, y, totalBoxW, 32)
       .fillAndStroke(this.GREEN, this.GREEN);

    doc.fontSize(10).font('Helvetica-Bold')
       .fillColor(this.WHITE)
       .text('TOTAL A PAGAR', totalBoxX + 10, y + 5, { width: totalBoxW * 0.45 });

    doc.fontSize(14).font('Helvetica-Bold')
       .fillColor(this.WHITE)
       .text(this.formatCurrency(invoice.amount), totalBoxX + 10, y + 5, { width: totalBoxW - 20, align: 'right' });

    y += 45;

    if (invoice.paymentTransactionId) {
      doc.fontSize(8).font('Helvetica')
         .fillColor(this.LIGHT_GRAY)
         .text('ID de Transaccion: ' + invoice.paymentTransactionId, M, y, { width: contentW, align: 'right' });
      y += 18;
    }

    // ============================================================
    // PAYMENT INFO BOX
    // ============================================================

    y += 5;
    if (y < doc.page.height - 200) {
      doc.rect(M, y, contentW, 50)
         .fillAndStroke('#f0fdf4', '#bbf7d0');

      doc.fontSize(8).font('Helvetica-Bold')
         .fillColor(this.GREEN)
         .text('INFORMACION DE PAGO', M + 12, y + 8);

      doc.fontSize(8).font('Helvetica')
         .fillColor(this.GRAY)
         .text('Los pagos se procesan de forma segura a traves de Stripe.', M + 12, y + 22)
         .text('Software excluido de IVA segun Art. 476 numeral 21 del Estatuto Tributario.', M + 12, y + 34);

      y += 62;
    }

    // ============================================================
    // FOOTER
    // ============================================================

    const footerY = doc.page.height - 85;

    if (y > footerY - 10) {
      doc.addPage();
    }

    doc.moveTo(M, footerY)
       .lineTo(W - M, footerY)
       .strokeColor(this.BORDER).lineWidth(0.5).stroke();

    let fy = footerY + 10;

    doc.fontSize(8).font('Helvetica')
       .fillColor(this.GRAY)
       .text(
         'Gracias por confiar en SST Colombia para la gestion de seguridad y salud en el trabajo de su empresa.',
         M, fy, { width: contentW, align: 'center' }
       );
    fy += 13;

    doc.fontSize(7).font('Helvetica')
       .fillColor(this.LIGHT_GRAY)
       .text(
         'Soporte: soporte@sst-colombia.com  |  Facturacion: facturacion@sst-colombia.com  |  Pagos: pagos@sst-colombia.com',
         M, fy, { width: contentW, align: 'center' }
       );
    fy += 10;

    doc.text(
      'Legal: legal@sst-colombia.com  |  DPO: dpo@sst-colombia.com  |  Privacidad: privacidad@sst-colombia.com',
      M, fy, { width: contentW, align: 'center' }
    );
    fy += 12;

    doc.fontSize(6).font('Helvetica')
       .fillColor('#aaaaaa')
       .text(
         'SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S. | NIT 902.036.337-4 | DNDA 13-197-177 | CL 48 No. 38-45, Medellin',
         M, fy, { width: contentW, align: 'center' }
       );

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return day + ' de ' + month + ' de ' + year;
  }

  private formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return '$' + formatted;
  }
}

export const invoicePdfService = new InvoicePdfService();
