import cron from 'node-cron';
import { storage } from '../storage';
import { accountingService } from '../services/accounting-integration';
import logger from '../lib/logger';

/**
 * Accounting Sync Retry Job
 *
 * Cloud Books (el sistema contable externo) puede estar caído o fallar
 * temporalmente en el momento exacto del pago. En vez de dar por perdida
 * la sincronización, cada factura pagada que no logró sincronizarse queda
 * marcada como pendiente y este job la reintenta automáticamente con
 * backoff exponencial, sin intervención manual.
 *
 * Corre cada 5 minutos. Backoff: 5min, 10min, 20min... hasta un máximo de
 * 6 horas entre intentos, con un tope de 20 intentos por factura (~ varios días).
 */
const MAX_ATTEMPTS = 20;
const MAX_BACKOFF_MINUTES = 360;

function computeNextRetryDelayMinutes(attempts: number): number {
  const delay = 5 * Math.pow(2, attempts - 1);
  return Math.min(delay, MAX_BACKOFF_MINUTES);
}

export async function processAccountingRetries() {
  const context = { jobName: 'accounting-retry', timestamp: new Date().toISOString() };

  if (!accountingService.isEnabled()) {
    return;
  }

  try {
    const pendingInvoices = await storage.getInvoicesPendingAccountingSync();

    if (pendingInvoices.length === 0) {
      return;
    }

    logger.info({ ...context, count: pendingInvoices.length }, `[Accounting Retry] ${pendingInvoices.length} factura(s) pendiente(s) de sincronizar`);

    for (const invoice of pendingInvoices) {
      const invoiceContext = { ...context, invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber };

      try {
        const company = await storage.getCompany(invoice.companyId);
        if (!company) {
          logger.error(invoiceContext, '[Accounting Retry] Empresa no encontrada, se omite');
          continue;
        }

        let parsedLineItems: any[] = [];
        try {
          parsedLineItems = typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems) : (invoice.lineItems || []);
        } catch {
          parsedLineItems = [];
        }

        const result = await accountingService.sendInvoiceToAccounting({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          companyId: invoice.companyId,
          customerName: invoice.customerName,
          customerNit: invoice.customerNit,
          customerEmail: invoice.customerEmail,
          customerAddress: invoice.customerAddress || '',
          customerPhone: company.contactPhone || '',
          customerCity: company.city || '',
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          currency: invoice.currency,
          periodStart: invoice.periodStart,
          periodEnd: invoice.periodEnd,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          paidDate: invoice.paidDate,
          status: invoice.status,
          lineItems: parsedLineItems,
          snapshotCiiuCode: invoice.snapshotCiiuCode,
          snapshotNumberOfWorkers: invoice.snapshotNumberOfWorkers,
          snapshotNumberOfVehicles: invoice.snapshotNumberOfVehicles,
        });

        if (result.success) {
          await storage.updateInvoice(invoice.id, {
            dianCufe: result.dianCufe || null,
            dianXmlUrl: result.dianXmlUrl || null,
            dianPdfUrl: result.dianPdfUrl || null,
            accountingSyncStatus: 'synced',
            accountingLastError: null,
            nextAccountingRetryAt: null,
          });
          logger.info({ ...invoiceContext, dianCufe: result.dianCufe }, '[Accounting Retry] Sincronización exitosa');
        } else {
          const attempts = (invoice.accountingSyncAttempts || 0) + 1;
          const delayMinutes = computeNextRetryDelayMinutes(attempts);
          const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'failed';
          await storage.updateInvoice(invoice.id, {
            accountingSyncStatus: status,
            accountingSyncAttempts: attempts,
            accountingLastError: (result.message || 'unknown error').substring(0, 500),
            nextAccountingRetryAt: attempts >= MAX_ATTEMPTS ? null : new Date(Date.now() + delayMinutes * 60 * 1000),
          });

          if (attempts >= MAX_ATTEMPTS) {
            logger.error({ ...invoiceContext, attempts, message: result.message }, '[Accounting Retry] Máximo de reintentos alcanzado - requiere revisión manual');
          } else {
            logger.warn({ ...invoiceContext, attempts, nextRetryInMinutes: delayMinutes, message: result.message }, '[Accounting Retry] Reintento fallido, reprogramado');
          }
        }
      } catch (err: any) {
        logger.error({ ...invoiceContext, err: err.message }, '[Accounting Retry] Error inesperado procesando factura');
      }
    }
  } catch (error) {
    logger.error({ ...context, err: error }, '[Accounting Retry] Error en el job de reintentos');
  }
}

export function startAccountingRetryJob() {
  cron.schedule('*/5 * * * *', async () => {
    await processAccountingRetries();
  });

  logger.info('Accounting retry cron job scheduled (runs every 5 minutes)');
}
