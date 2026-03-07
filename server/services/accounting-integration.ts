import logger from '../lib/logger';

const ACCOUNTING_API_URL = process.env.ACCOUNTING_API_URL || '';
const ACCOUNTING_API_KEY = process.env.ACCOUNTING_API_KEY || '';
const ACCOUNTING_ENABLED = process.env.ACCOUNTING_INTEGRATION_ENABLED === 'true';

interface AccountingInvoiceData {
  invoiceId: string;
  invoiceNumber: string;
  companyId: string;
  customerName: string;
  customerNit: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone?: string;
  customerCity?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  issueDate: Date;
  dueDate: Date;
  paidDate: Date | null;
  status: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  snapshotCiiuCode?: string | null;
  snapshotNumberOfWorkers?: number | null;
  snapshotNumberOfVehicles?: number | null;
  stripePaymentId?: string;
}

interface AccountingResponse {
  success: boolean;
  dianCufe?: string;
  dianXmlUrl?: string;
  dianPdfUrl?: string;
  accountingInvoiceId?: string;
  message?: string;
}

class AccountingIntegrationService {
  private baseUrl: string;
  private apiKey: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = ACCOUNTING_API_URL.replace(/\/$/, '');
    this.apiKey = ACCOUNTING_API_KEY;
    this.enabled = ACCOUNTING_ENABLED;
  }

  isEnabled(): boolean {
    return this.enabled && !!this.baseUrl && !!this.apiKey;
  }

  getStatus(): { enabled: boolean; configured: boolean; url: string } {
    return {
      enabled: this.enabled,
      configured: !!this.baseUrl && !!this.apiKey,
      url: this.baseUrl ? `${this.baseUrl.substring(0, 30)}...` : '(no configurada)',
    };
  }

  async sendInvoiceToAccounting(data: AccountingInvoiceData): Promise<AccountingResponse> {
    if (!this.isEnabled()) {
      logger.info(
        { invoiceId: data.invoiceId, invoiceNumber: data.invoiceNumber },
        '[Accounting] Integration disabled - skipping'
      );
      return { success: false, message: 'Integration disabled' };
    }

    const payload = {
      origen: 'sst-colombia',
      facturaOrigenId: data.invoiceId,
      facturaOrigenNumero: data.invoiceNumber,
      enviarDian: true,
      cliente: {
        razonSocial: data.customerName,
        numeroDocumento: data.customerNit,
        nombre: data.customerName,
        nit: data.customerNit,
        email: data.customerEmail,
        direccion: data.customerAddress,
        telefono: data.customerPhone || '',
        ciudad: data.customerCity || '',
      },
      factura: {
        subtotal: data.subtotal,
        impuesto: data.taxAmount,
        totalIva: data.taxAmount,
        total: data.total,
        granTotal: data.total,
        moneda: data.currency,
        periodoInicio: data.periodStart.toISOString(),
        periodoFin: data.periodEnd.toISOString(),
        fechaEmision: data.issueDate.toISOString(),
        fechaVencimiento: data.dueDate.toISOString(),
        fechaPago: data.paidDate?.toISOString() || null,
        estado: data.status,
        items: data.lineItems.map(item => ({
          descripcion: item.description,
          cantidad: item.quantity,
          precioUnitario: item.unitPrice,
          total: item.total,
        })),
      },
      metadata: {
        empresaId: data.companyId,
        codigoCiiu: data.snapshotCiiuCode || null,
        numeroTrabajadores: data.snapshotNumberOfWorkers || null,
        numeroVehiculos: data.snapshotNumberOfVehicles || null,
        stripePagoId: data.stripePaymentId || null,
      },
    };

    try {
      logger.info(
        { invoiceNumber: data.invoiceNumber, url: `${this.baseUrl}/api/integration/sst-invoice` },
        '[Accounting] Sending invoice to accounting system'
      );

      const response = await fetch(`${this.baseUrl}/api/integration/sst-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Source': 'sst-colombia',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.error(
          { invoiceNumber: data.invoiceNumber, status: response.status, error: errorText },
          '[Accounting] Failed to send invoice'
        );
        return { success: false, message: `HTTP ${response.status}: ${errorText}` };
      }

      const result: AccountingResponse = await response.json();

      logger.info(
        {
          invoiceNumber: data.invoiceNumber,
          dianCufe: result.dianCufe || '(pending)',
          accountingId: result.accountingInvoiceId,
        },
        '[Accounting] Invoice sent successfully'
      );

      return result;
    } catch (error: any) {
      logger.error(
        { invoiceNumber: data.invoiceNumber, error: error.message },
        '[Accounting] Error sending invoice - non-critical, manual review required'
      );
      return { success: false, message: error.message };
    }
  }

  async checkInvoiceStatus(invoiceNumber: string): Promise<AccountingResponse> {
    if (!this.isEnabled()) {
      return { success: false, message: 'Integration disabled' };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/integration/sst-invoice/${encodeURIComponent(invoiceNumber)}/status`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'X-Source': 'sst-colombia',
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        return { success: false, message: `HTTP ${response.status}` };
      }

      return await response.json();
    } catch (error: any) {
      logger.error(
        { invoiceNumber, error: error.message },
        '[Accounting] Error checking invoice status'
      );
      return { success: false, message: error.message };
    }
  }
}

export const accountingService = new AccountingIntegrationService();
