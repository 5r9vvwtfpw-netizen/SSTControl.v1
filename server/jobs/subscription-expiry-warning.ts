import cron from 'node-cron';
import { storage } from '../storage';
import { sendSubscriptionExpiringEmail } from '../email';
import logger from '../lib/logger';

/**
 * Subscription Expiry Warning Job
 *
 * Envía un correo de aviso a los administradores de las empresas cuya
 * suscripción de pago (no trial) vence en ~2 días, para que puedan
 * realizar el pago a tiempo y evitar el bloqueo.
 *
 * Aplica a todas las empresas con suscripción activa (tarjeta/Stripe o
 * transferencia bancaria por igual).
 *
 * Runs daily at 9 AM UTC (4 AM Colombia / 9 AM España).
 * Also runs immediately on startup.
 */

const JOB_NAME = 'subscription-expiry-warning';
const DAYS_AHEAD = 2;

export async function processSubscriptionExpiryWarnings(): Promise<void> {
  const context = { jobName: JOB_NAME, timestamp: new Date().toISOString() };
  logger.info(context, 'Starting subscription expiry warning job...');

  try {
    const upcoming = await storage.getSubscriptionsExpiringSoon(DAYS_AHEAD);

    if (upcoming.length === 0) {
      logger.info(context, `No hay suscripciones venciendo en ~${DAYS_AHEAD} días`);
      return;
    }

    logger.info({ ...context, count: upcoming.length }, `Found ${upcoming.length} subscription(s) to evaluate`);

    for (const sub of upcoming) {
      const subCtx = { ...context, subscriptionId: sub.id, companyId: sub.companyId };

      try {
        if (!sub.currentPeriodEnd) {
          logger.warn(subCtx, 'Subscription has no currentPeriodEnd — skipping');
          continue;
        }

        const periodEnd = new Date(sub.currentPeriodEnd);

        // Evita duplicar el aviso si ya se envió para este mismo período
        // (por ejemplo, si el servidor se reinicia varias veces el mismo día).
        if (
          sub.lastExpiryWarningPeriodEnd &&
          new Date(sub.lastExpiryWarningPeriodEnd).getTime() === periodEnd.getTime()
        ) {
          logger.info(subCtx, 'Warning already sent for this period — skipping');
          continue;
        }

        const company = await storage.getCompany(sub.companyId);
        if (!company) {
          logger.warn(subCtx, 'Company not found — skipping');
          continue;
        }

        const admins = await storage.getUsersByRole(['company_admin', 'admin'], sub.companyId);
        const adminWithEmail = admins.find(u => u.email);
        if (!adminWithEmail?.email) {
          logger.warn(subCtx, 'No admin email found for company — skipping');
          continue;
        }

        const result = await sendSubscriptionExpiringEmail({
          to: adminWithEmail.email,
          companyName: company.name,
          periodEndDate: periodEnd,
        });

        if (result.success) {
          await storage.markSubscriptionExpiryWarningSent(sub.id, periodEnd);
          logger.info({ ...subCtx, to: adminWithEmail.email }, 'Subscription expiry warning email sent');
        } else {
          logger.error({ ...subCtx, error: result.error }, 'Failed to send subscription expiry warning email');
        }
      } catch (err: any) {
        logger.error({ ...subCtx, error: err.message }, 'Error processing subscription expiry warning');
      }
    }

    logger.info(context, 'Subscription expiry warning job completed');
  } catch (err: any) {
    logger.error({ ...context, error: err.message }, 'Subscription expiry warning job failed');
  }
}

export function startSubscriptionExpiryWarningJob(): void {
  // Run immediately on startup
  logger.info('⚡ Running immediate subscription expiry warning check on startup...');
  processSubscriptionExpiryWarnings().catch(err => {
    logger.error({ err }, 'Failed to run initial subscription expiry warning');
  });

  // Schedule daily at 9 AM UTC (4 AM Colombia)
  cron.schedule('0 9 * * *', async () => {
    await processSubscriptionExpiryWarnings();
  });

  logger.info('Subscription expiry warning cron job scheduled (runs daily at 9:00 AM UTC)');
}
