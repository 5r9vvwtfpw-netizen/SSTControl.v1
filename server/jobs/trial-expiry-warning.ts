import cron from 'node-cron';
import { storage } from '../storage';
import { sendTrialExpiringEmail } from '../email';
import logger from '../lib/logger';

/**
 * Trial Expiry Warning Job
 *
 * Sends a warning email ~24 hours before a trial expires.
 * Weekend rule: if the trial expires on Saturday or Sunday,
 * the warning is sent on the Friday before (at the same daily check time).
 *
 * Runs daily at 9 AM UTC (4 AM Colombia / 9 AM España).
 * Also runs immediately on startup.
 */

const JOB_NAME = 'trial-expiry-warning';

/**
 * Returns true if the warning email should be sent TODAY for a trial
 * ending on `trialEndDate`.
 *
 * Rules:
 *  - Normal case: trial ends within the next 24–48 h window (i.e. tomorrow).
 *  - Weekend rule: if trial ends on Saturday (day=6) or Sunday (day=0),
 *    we send on the Friday before.
 */
function shouldSendWarningToday(trialEndDate: Date): boolean {
  const now = new Date();

  // All comparisons in Colombia timezone (UTC-5)
  const colombiaOffset = -5 * 60;
  const toColombiaDate = (d: Date) => {
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + colombiaOffset * 60000);
  };

  const todayCO = toColombiaDate(now);
  const trialCO = toColombiaDate(trialEndDate);

  const todayDay = todayCO.getDay(); // 0=Sun 1=Mon ... 5=Fri 6=Sat
  const trialDay = trialCO.getDay();

  // Difference in calendar days
  const msPerDay = 24 * 60 * 60 * 1000;
  const todayMidnight = new Date(todayCO);
  todayMidnight.setHours(0, 0, 0, 0);
  const trialMidnight = new Date(trialCO);
  trialMidnight.setHours(0, 0, 0, 0);
  const diffDays = Math.round((trialMidnight.getTime() - todayMidnight.getTime()) / msPerDay);

  // Normal 24h case: trial ends tomorrow (diffDays === 1)
  if (diffDays === 1) return true;

  // Weekend rule:
  // Trial ends Saturday (day 6) → warn on Friday (diffDays === 1 from Fri, but
  //   if today IS Friday, diffDays could be 1 already handled above, or could be
  //   that trial is Saturday after next — handled by diffDays===1).
  // Trial ends Sunday (day 0) → warn on Friday (2 days before).
  if (trialDay === 6 && todayDay === 5 && diffDays === 1) return true; // Fri→Sat (already covered)
  if (trialDay === 0 && todayDay === 5 && diffDays === 2) return true; // Fri→Sun
  // Trial ends Saturday and today is Friday with diffDays===1 already covered.
  // Edge: trial ends Saturday, today is Thursday? No — we only send 1 warning.

  return false;
}

export async function processTrialExpiryWarnings(): Promise<void> {
  const context = { jobName: JOB_NAME, timestamp: new Date().toISOString() };
  logger.info(context, 'Starting trial expiry warning job...');

  try {
    // Fetch trials expiring in the next 48 hours (covers the weekend lookahead)
    const upcomingTrials = await storage.getTrialsExpiringSoon(48);

    if (upcomingTrials.length === 0) {
      logger.info(context, 'No trials expiring within 48h');
      return;
    }

    logger.info({ ...context, count: upcomingTrials.length }, `Found ${upcomingTrials.length} trial(s) to evaluate`);

    for (const trial of upcomingTrials) {
      const trialCtx = { ...context, subscriptionId: trial.id, companyId: trial.companyId };

      try {
        if (!trial.trialEnd) {
          logger.warn(trialCtx, 'Trial has no trialEnd date — skipping');
          continue;
        }

        const trialEndDate = new Date(trial.trialEnd);

        if (!shouldSendWarningToday(trialEndDate)) {
          logger.info(trialCtx, 'Warning not due today — skipping');
          continue;
        }

        // Get company info and admin email
        const company = await storage.getCompany(trial.companyId);
        if (!company) {
          logger.warn(trialCtx, 'Company not found — skipping');
          continue;
        }

        const admins = await storage.getUsersByRole(['company_admin', 'admin'], trial.companyId);
        const adminWithEmail = admins.find(u => u.email);
        if (!adminWithEmail?.email) {
          logger.warn(trialCtx, 'No admin email found for company — skipping');
          continue;
        }

        const result = await sendTrialExpiringEmail({
          to: adminWithEmail.email,
          companyName: company.name,
          trialEndDate,
        });

        if (result.success) {
          logger.info({ ...trialCtx, to: adminWithEmail.email }, 'Trial expiry warning email sent');
        } else {
          logger.error({ ...trialCtx, error: result.error }, 'Failed to send trial expiry warning email');
        }
      } catch (err: any) {
        logger.error({ ...trialCtx, error: err.message }, 'Error processing trial expiry warning');
      }
    }

    logger.info(context, 'Trial expiry warning job completed');
  } catch (err: any) {
    logger.error({ ...context, error: err.message }, 'Trial expiry warning job failed');
  }
}

export function startTrialExpiryWarningJob(): void {
  // Run immediately on startup
  logger.info('⚡ Running immediate trial expiry warning check on startup...');
  processTrialExpiryWarnings().catch(err => {
    logger.error({ err }, 'Failed to run initial trial expiry warning');
  });

  // Schedule daily at 9 AM UTC (4 AM Colombia)
  cron.schedule('0 9 * * *', async () => {
    await processTrialExpiryWarnings();
  });

  logger.info('Trial expiry warning cron job scheduled (runs daily at 9:00 AM UTC)');
}
