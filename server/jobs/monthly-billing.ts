import cron from 'node-cron';
import { storage } from '../storage';
import { emailService } from '../services/email';
import { invoicePdfService } from '../services/invoice-pdf';
import { accountingService } from '../services/accounting-integration';
import logger from '../lib/logger';

/**
 * Monthly Billing System (Bloque 4 - Tarea 17)
 * 
 * Automatically generates and sends invoices for active subscriptions
 * - Runs daily at 3 AM UTC to process subscriptions due for billing
 * - Generates invoice records in database
 * - Creates professional PDF invoices
 * - Sends email with PDF attachment to company admins
 * - Updates subscription next billing date
 */

/**
 * Core monthly billing logic (extracted for reusability)
 */
export async function processMonthlyBilling() {
  const context = {
    jobName: 'monthly-billing',
    timestamp: new Date().toISOString()
  };

  logger.info({ ...context }, 'Starting monthly billing job...');

  try {
    // Get all subscriptions due for billing (nextBillingDate <= today)
    const subscriptionsDue = await storage.getSubscriptionsDueForBilling();
    
    if (subscriptionsDue.length === 0) {
      logger.info({ ...context }, 'No subscriptions due for billing');
      return;
    }

    logger.info({ ...context, count: subscriptionsDue.length }, `Found ${subscriptionsDue.length} subscription(s) due for billing`);

    for (const subscription of subscriptionsDue) {
      const subscriptionContext = {
        ...context,
        subscriptionId: subscription.id,
        companyId: subscription.companyId,
        planId: subscription.planId,
        companyName: subscription.companyName
      };

      try {
        // Calculate billing period (currentPeriodStart to currentPeriodEnd)
        const billingPeriodStart = subscription.currentPeriodStart;
        const billingPeriodEnd = subscription.currentPeriodEnd;

        // Evitar facturas duplicadas: si ya se generó una factura para este
        // mismo período (p.ej. por un reinicio previo del servidor), no
        // generar otra ni reenviar el correo.
        const existingInvoice = await storage.getInvoiceForSubscriptionPeriod(
          subscription.id,
          billingPeriodEnd
        );
        if (existingInvoice) {
          logger.info(
            { ...subscriptionContext, invoiceId: existingInvoice.id, invoiceStatus: existingInvoice.status },
            'Ya existe una factura para este período - se omite generación duplicada. La suscripción permanece activa hasta que el pago sea confirmado (Wompi) o hasta que venza el período de gracia.'
          );
          continue;
        }

        // Generate invoice record (returns invoice number as string)
        logger.info(subscriptionContext, 'Generating invoice record...');
        
        const invoiceNumber = await storage.generateInvoice({
          subscriptionId: subscription.id,
          companyId: subscription.companyId,
          amount: subscription.planPrice,
          periodStart: billingPeriodStart,
          periodEnd: billingPeriodEnd,
          description: `Suscripción mensual - ${subscription.planName}`
        });

        // Get the full invoice object
        const invoice = await storage.getInvoiceByNumber(invoiceNumber);
        
        if (!invoice) {
          throw new Error('Failed to retrieve generated invoice');
        }

        logger.info({ ...subscriptionContext, invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber }, 'Invoice record created');

        if (accountingService.isEnabled()) {
          let parsedLineItems: any[] = [];
          try {
            parsedLineItems = typeof invoice.lineItems === 'string'
              ? JSON.parse(invoice.lineItems)
              : (invoice.lineItems || []);
          } catch { parsedLineItems = []; }
          accountingService.sendInvoiceToAccounting({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            companyId: subscription.companyId,
            customerName: subscription.companyName || '',
            customerNit: subscription.companyNit || 'N/A',
            customerEmail: subscription.companyEmail || '',
            customerAddress: subscription.companyAddress || '',
            customerPhone: subscription.companyPhone || '',
            customerCity: subscription.companyCity || '',
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
            lineItems: parsedLineItems || [],
            snapshotCiiuCode: invoice.snapshotCiiuCode,
            snapshotNumberOfWorkers: invoice.snapshotNumberOfWorkers,
            snapshotNumberOfVehicles: invoice.snapshotNumberOfVehicles,
          }).then(async (result) => {
            if (result.success && result.dianCufe) {
              await storage.updateInvoice(invoice.id, {
                dianCufe: result.dianCufe,
                dianXmlUrl: result.dianXmlUrl || null,
                dianPdfUrl: result.dianPdfUrl || null,
              });
              logger.info({ invoiceId: invoice.id, dianCufe: result.dianCufe }, '[Accounting] DIAN data updated on invoice');
            }
          }).catch((err) => {
            logger.error({ err, invoiceId: invoice.id }, '[Accounting] Non-critical error in monthly billing');
          });
        }

        // Generate PDF
        let pdfBuffer: Buffer | undefined;
        try {
          // Parse line items from JSON string
          const lineItems = typeof invoice.lineItems === 'string' 
            ? JSON.parse(invoice.lineItems) 
            : invoice.lineItems;

          pdfBuffer = await invoicePdfService.generateInvoicePdf(
            {
              invoiceNumber: invoice.invoiceNumber,
              issuedDate: invoice.issueDate, // Correct field name
              dueDate: invoice.dueDate,
              status: invoice.status,
              amount: invoice.total,
              currency: invoice.currency,
              billingPeriodStart: invoice.periodStart,
              billingPeriodEnd: invoice.periodEnd,
              lineItems: lineItems || [{
                description: `Suscripción ${subscription.planName}`,
                quantity: 1,
                unitPrice: subscription.planPrice,
                total: subscription.planPrice
              }]
            },
            {
              name: subscription.companyName,
              nit: subscription.companyNit,
              address: subscription.companyAddress,
              city: subscription.companyCity,
              contactEmail: subscription.companyEmail,
              phone: subscription.companyPhone
            }
          );
          logger.info({ ...subscriptionContext, invoiceId: invoice.id }, 'PDF generated successfully');
        } catch (pdfError: any) {
          logger.error({ ...subscriptionContext, error: pdfError.message }, 'PDF generation failed - will send email without attachment');
        }

        // Get admin recipients
        const adminRecipients = await storage.getCompanyAdminRecipients(subscription.companyId);
        
        if (adminRecipients.length === 0) {
          logger.warn({ ...subscriptionContext }, 'No admin recipients found for company - skipping email');
        } else {
          // Send invoice email to all admins
          for (const recipient of adminRecipients) {
            try {
              await emailService.sendInvoiceEmail({
                to: recipient,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
                currency: invoice.currency,
                issuedDate: invoice.issueDate, // Correct field name
                dueDate: invoice.dueDate,
                companyName: subscription.companyName,
                billingPeriodStart: invoice.periodStart,
                billingPeriodEnd: invoice.periodEnd,
                pdfBuffer
              });
              
              logger.info({ ...subscriptionContext, recipient, invoiceId: invoice.id }, 'Invoice email sent successfully');
            } catch (emailError: any) {
              logger.error({ ...subscriptionContext, recipient, error: emailError.message }, 'Failed to send invoice email');
            }
          }
        }

        // IMPORTANTE: NO se extiende currentPeriodEnd/nextPaymentDate aquí.
        // Antes este job avanzaba el período de facturación +30 días con solo
        // generar la factura, sin verificar pago real. Esto hacía que la
        // suscripción se "renovara" sola cada vez que el servidor reiniciaba
        // (incluyendo cada despliegue), ocultando indefinidamente el
        // vencimiento y el bloqueo por falta de pago.
        // El período solo debe avanzar cuando el pago se confirma realmente:
        // - Pago con Wompi/PSE -> ver activateSubscriptionAfterPse en
        //   server/routes/wompi.ts
        // - Transferencia bancaria confirmada manualmente por un admin.
        // Mientras tanto, la factura queda pendiente y
        // getSubscriptionStatus (server/middleware/subscription-check.ts)
        // se encarga de bloquear el acceso una vez vencido el período de
        // gracia (SUBSCRIPTION_GRACE_PERIOD_DAYS).
        logger.info(
          { ...subscriptionContext, invoiceId: invoice.id },
          'Factura generada y enviada. El período de facturación no se extiende automáticamente; se actualizará solo cuando se confirme el pago.'
        );

      } catch (error: any) {
        logger.error({ ...subscriptionContext, error: error.message }, 'Error processing subscription billing');
      }
    }

    logger.info({ ...context }, 'Monthly billing job completed');
  } catch (error: any) {
    logger.error({ ...context, error: error.message }, 'Monthly billing job failed');
  }
}

/**
 * Start monthly billing cron job + immediate execution
 * Runs daily at 3 AM UTC to process subscriptions
 */
export function startMonthlyBillingJob() {
  // Immediate execution on startup (for testing/validation)
  logger.info('⚡ Running immediate monthly billing check on startup...');
  processMonthlyBilling().catch(error => {
    logger.error({ err: error }, 'Failed to run initial monthly billing');
  });

  // Schedule daily at 3 AM UTC
  cron.schedule('0 3 * * *', async () => {
    await processMonthlyBilling();
  });

  logger.info('Monthly billing cron job scheduled (runs daily at 3:00 AM UTC)');
}
