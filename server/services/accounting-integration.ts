import logger from '../lib/logger';

const ACCOUNTING_API_URL = process.env.ACCOUNTING_API_URL || '';
const ACCOUNTING_API_KEY = process.env.ACCOUNTING_API_KEY || '';
const ACCOUNTING_ENABLED = process.env.ACCOUNTING_INTEGRATION_ENABLED === 'true';

const IVA_RATE = 19; // Colombia: 19% IVA

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
  invoiceNumber?: string;
  dianCufe?: string;
  dianXmlUrl?: string;
  dianPdfUrl?: string;
  accountingInvoiceId?: string;
  dian?: { success: boolean; trackId?: string };
  message?: string;
}

/**
 * Parses a Colombian NIT which may be stored as "900123456-1" or "900123456".
 * Returns the base number and the verification digit separately.
 */
function parseNit(nit: string): { numero: string; digito: string } {
  const clean = (nit || '').trim().replace(/\s/g, '');
  const dashIdx = clean.lastIndexOf('-');
  if (dashIdx !== -1) {
    return {
      numero: clean.substring(0, dashIdx),
      digito: clean.substring(dashIdx + 1),
    };
  }
  return { numero: clean, digito: '0' };
}

/**
 * Builds a human-readable period description for the invoice observations.
 * e.g. "Suscripción mensual Software SST Colombia - Mayo 2026"
 */
function buildObservaciones(periodStart: Date, invoiceNumber: string): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const month = months[periodStart.getMonth()];
  const year = periodStart.getFullYear();
  return `Suscripción mensual Software SST Colombia - ${month} ${year} | Ref: ${invoiceNumber}`;
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
      url: this.baseUrl ? `${this.baseUrl.substring(0, 40)}...` : '(no configurada)',
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

    const { numero: nitNumero, digito: nitDigito } = parseNit(data.customerNit);

    // granTotal is what Stripe actually charged (IVA-inclusive).
    // subtotal and taxAmount were already computed by the caller as:
    //   subtotal = Math.round(granTotal / 1.19)
    //   taxAmount = granTotal - subtotal
    const granTotal = data.total;
    const subtotal = data.subtotal;
    const totalIva = data.taxAmount;

    // Build Cloud Books payload following their exact spec
    const payload = {
      cliente: {
        tipoDocumento: 'NIT',
        numeroDocumento: nitNumero,
        digitoVerificacion: nitDigito,
        razonSocial: data.customerName,
        tipoPersona: 'Juridica',
        regimen: 'Responsable de IVA',
        email: data.customerEmail || '',
        direccion: data.customerAddress || '',
        departamento: data.customerCity || '',   // best approximation we have
        municipio: data.customerCity || '',
        codigoMunicipio: '',                      // not stored; Cloud Books should handle blank
        telefono: data.customerPhone || '',
      },
      factura: {
        subtotal,
        tarifaIva: IVA_RATE,
        totalIva,
        totalRetefuente: 0,
        granTotal,
        formaPago: 'Contado',
        medioPago: 'Tarjeta de Crédito',
        observaciones: buildObservaciones(data.periodStart, data.invoiceNumber),
        items: data.lineItems.length > 0
          ? data.lineItems.map(item => ({
              descripcion: item.description,
              cantidad: item.quantity,
              precioUnitario: item.unitPrice,
              tarifaIva: IVA_RATE,
            }))
          : [{
              descripcion: `Suscripción mensual Software SST Colombia`,
              cantidad: 1,
              precioUnitario: subtotal,
              tarifaIva: IVA_RATE,
            }],
      },
      enviarDian: true,
      // Reference fields so Cloud Books can trace back to SST Colombia
      referencia: {
        origen: 'sst-colombia',
        facturaOrigenId: data.invoiceId,
        facturaOrigenNumero: data.invoiceNumber,
        empresaId: data.companyId,
        stripePagoId: data.stripePaymentId || null,
      },
    };

    try {
      logger.info(
        {
          invoiceNumber: data.invoiceNumber,
          nit: nitNumero,
          granTotal,
          url: `${this.baseUrl}/api/integration/sst-invoice`,
        },
        '[Accounting] Sending invoice to Cloud Books'
      );

      const response = await fetch(`${this.baseUrl}/api/integration/sst-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });

      const responseText = await response.text().catch(() => '');

      if (!response.ok) {
        logger.error(
          {
            invoiceNumber: data.invoiceNumber,
            httpStatus: response.status,
            body: responseText.substring(0, 500),
          },
          '[Accounting] Cloud Books rejected the invoice'
        );
        return { success: false, message: `HTTP ${response.status}: ${responseText}` };
      }

      let result: AccountingResponse;
      try {
        result = JSON.parse(responseText);
      } catch {
        logger.error({ invoiceNumber: data.invoiceNumber, responseText }, '[Accounting] Invalid JSON from Cloud Books');
        return { success: false, message: 'Invalid JSON response from Cloud Books' };
      }

      logger.info(
        {
          invoiceNumber: data.invoiceNumber,
          cloudBooksInvoice: result.invoiceNumber,
          dianCufe: result.dianCufe || '(pending)',
          dianSuccess: result.dian?.success,
        },
        '[Accounting] Invoice accepted by Cloud Books'
      );

      return result;
    } catch (error: any) {
      logger.error(
        { invoiceNumber: data.invoiceNumber, error: error.message },
        '[Accounting] Network error sending to Cloud Books - non-critical, manual review required'
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
            'x-api-key': this.apiKey,
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
