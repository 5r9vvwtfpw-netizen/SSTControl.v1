import cron from 'node-cron';
import { storage } from '../storage';
import { sendTrialPastDueEmail, sendTrialSuspendedEmail } from '../email';
import logger from '../lib/logger';

/**
 * Trial Conversion System (Bloque 4 - Tarea 6)
 *
 * Architect feedback: Execute conversion logic immediately on startup + daily cron
 * - Ensures deterministic processing of expired trials
 * - Runs at startup and then daily at 2 AM UTC
 */

const GRACE_PERIOD_DAYS = 0;

/**
 * Core trial conversion logic (extracted for reusability)
 * Architect feedback: Can be called on-demand (startup) and scheduled (cron)
 */
export async function processExpiredTrials() {
  const context = {
    jobName: 'trial-conversion',
    timestamp: new Date().toISOString()
  };

  logger.info({ ...context }, 'Starting trial conversion job...');

  try {
    const expiredTrials = await storage.getExpiredTrials();

    if (expiredTrials.length === 0) {
      logger.info({ ...context }, 'No expired trials found');
      return;
    }

    logger.info({ ...context, count: expiredTrials.length }, `Found ${expiredTrials.length} expired trial(s)`);

    for (const trial of expiredTrials) {
      const trialContext = {
        ...context,
        subscriptionId: trial.id,
        companyId: trial.companyId,
        planId: trial.planId
      };

      try {
        const company = await storage.getCompany(trial.companyId);
        const admins = await storage.getUsersByRole(['company_admin', 'admin'], trial.companyId);
        const adminWithEmail = admins.find(u => u.email);

        const hasPayment = await storage.hasDefaultPaymentSource(trial.companyId);

        if (hasPayment) {
          // TODO: Implement Stripe automatic billing for trial conversions
          // For now, move to past_due and await manual payment through Stripe
          logger.info(trialContext, 'Company has payment source - awaiting Stripe billing implementation');

          const plan = await storage.getSubscriptionPlan(trial.planId);
          if (!plan) {
            throw new Error('Plan not found');
          }

          await storage.transitionSubscriptionStatus(trial.id, 'past_due');
          logger.info(trialContext, 'Trial moved to past_due - awaiting Stripe payment');

          // Send past_due email
          if (adminWithEmail?.email && company) {
            const emailResult = await sendTrialPastDueEmail({
              to: adminWithEmail.email,
              companyName: company.name,
              trialEndDate: trial.trialEnd ? new Date(trial.trialEnd) : new Date(),
              gracePeriodDays: GRACE_PERIOD_DAYS,
            });
            if (emailResult.success) {
              logger.info(trialContext, 'Trial past_due email sent (has payment source)');
            } else {
              logger.error({ ...trialContext, error: emailResult.error }, 'Failed to send trial past_due email');
            }
          }
        } else {
          // No payment source - check grace period
          const trialEndDate = trial.trialEnd;
          if (!trialEndDate) {
            logger.error(trialContext, 'Trial has no end date - skipping');
            continue;
          }

          const now = new Date();
          const daysSinceExpiry = Math.floor((now.getTime() - new Date(trialEndDate).getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceExpiry >= GRACE_PERIOD_DAYS) {
            // Grace period expired - suspend
            await storage.transitionSubscriptionStatus(trial.id, 'suspended', {
              suspendedAt: new Date()
            });

            logger.warn(trialContext, `Trial suspended after ${GRACE_PERIOD_DAYS}-day grace period`);

            // Send suspension email
            if (adminWithEmail?.email && company) {
              const emailResult = await sendTrialSuspendedEmail({
                to: adminWithEmail.email,
                companyName: company.name,
              });
              if (emailResult.success) {
                logger.info(trialContext, 'Trial suspended email sent');
              } else {
                logger.error({ ...trialContext, error: emailResult.error }, 'Failed to send trial suspended email');
              }
            }
          } else {
            // Still in grace period - move to past_due
            await storage.transitionSubscriptionStatus(trial.id, 'past_due');

            logger.info(trialContext, `Trial moved to past_due - ${GRACE_PERIOD_DAYS - daysSinceExpiry} days remaining in grace period`);

            // Send past_due email
            if (adminWithEmail?.email && company) {
              const emailResult = await sendTrialPastDueEmail({
                to: adminWithEmail.email,
                companyName: company.name,
                trialEndDate: new Date(trialEndDate),
                gracePeriodDays: GRACE_PERIOD_DAYS,
              });
              if (emailResult.success) {
                logger.info(trialContext, 'Trial past_due email sent (no payment source)');
              } else {
                logger.error({ ...trialContext, error: emailResult.error }, 'Failed to send trial past_due email');
              }
            }
          }
        }
      } catch (error: any) {
        logger.error({ ...trialContext, error: error.message }, 'Error processing expired trial');
      }
    }

    logger.info({ ...context }, 'Trial conversion job completed');
  } catch (error: any) {
    logger.error({ ...context, error: error.message }, 'Trial conversion job failed');
  }
}

/**
 * Start trial conversion cron job + immediate execution
 * Architect feedback: Run conversion immediately on startup to ensure deterministic processing
 */
export function startTrialConversionJob() {
  // Immediate execution on startup (Architect feedback)
  logger.info('⚡ Running immediate trial conversion on startup...');
  processExpiredTrials().catch(error => {
    logger.error({ err: error }, 'Failed to run initial trial conversion');
  });

  // Schedule daily at 2 AM UTC
  cron.schedule('0 2 * * *', async () => {
    await processExpiredTrials();
  });

  logger.info('Trial conversion cron job scheduled (runs daily at 2:00 AM UTC)');
}
