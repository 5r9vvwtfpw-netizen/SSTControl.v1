import cron from 'node-cron';
import { storage } from '../storage';
import { emailService } from '../services/email';
import logger from '../lib/logger';
import { medicalExamTypeLabels } from '@shared/arl-rates';

/**
 * Medical Exam Reminders System
 * Sends email reminders for upcoming medical exams
 * 
 * Reminder schedule:
 * - 30 days before exam
 * - 15 days before exam  
 * - 7 days before exam
 */

const REMINDER_DAYS = [30, 15, 7];

/**
 * Core reminder processing logic
 */
export async function processMedicalExamReminders() {
  const context = {
    jobName: 'medical-exam-reminders',
    timestamp: new Date().toISOString()
  };

  logger.info({ ...context }, 'Starting medical exam reminders job...');

  try {
    const upcomingExams = await storage.getUpcomingMedicalExams(30);

    if (upcomingExams.length === 0) {
      logger.info({ ...context }, 'No upcoming medical exams found');
      return;
    }

    logger.info({ ...context, count: upcomingExams.length }, `Found ${upcomingExams.length} upcoming exam(s)`);

    let sentCount = 0;
    let errorCount = 0;

    for (const exam of upcomingExams) {
      const examContext = {
        ...context,
        examId: exam.id,
        workerId: exam.workerId,
        companyId: exam.companyId,
        scheduledDate: exam.scheduledDate
      };

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const examDate = new Date(exam.scheduledDate);
        examDate.setHours(0, 0, 0, 0);
        
        const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (!REMINDER_DAYS.includes(daysUntil)) {
          continue;
        }

        const worker = await storage.getWorkerById(exam.workerId);
        if (!worker) {
          logger.warn({ ...examContext }, 'Worker not found for exam - skipping');
          continue;
        }

        const company = await storage.getCompany(exam.companyId);
        if (!company) {
          logger.warn({ ...examContext }, 'Company not found for exam - skipping');
          continue;
        }

        const adminUsers = await storage.getCompanyAdminEmails(exam.companyId);
        if (adminUsers.length === 0) {
          logger.warn({ ...examContext }, 'No admin users found for company - skipping');
          continue;
        }

        const formattedDate = new Date(exam.scheduledDate).toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        });

        const examTypeLabel = medicalExamTypeLabels[exam.examType as keyof typeof medicalExamTypeLabels] || exam.examType;

        for (const adminEmail of adminUsers) {
          const result = await emailService.sendMedicalExamReminder({
            to: adminEmail,
            workerName: worker.name,
            examType: examTypeLabel,
            scheduledDate: formattedDate,
            daysUntil,
            medicalCenter: exam.medicalCenter || undefined,
            companyName: company.name
          });

          if (result.success) {
            sentCount++;
            logger.info({ ...examContext, email: adminEmail, daysUntil }, 'Reminder email sent successfully');
          } else {
            errorCount++;
            logger.error({ ...examContext, email: adminEmail, error: result.error }, 'Failed to send reminder email');
          }
        }
      } catch (error: any) {
        errorCount++;
        logger.error({ ...examContext, error: error.message }, 'Error processing exam reminder');
      }
    }

    logger.info({ ...context, sentCount, errorCount }, 'Medical exam reminders job completed');
  } catch (error: any) {
    logger.error({ ...context, error: error.message }, 'Medical exam reminders job failed');
  }
}

/**
 * Start medical exam reminders cron job
 * Runs daily at 8:00 AM Colombia time (UTC-5 = 13:00 UTC)
 */
export function startMedicalExamRemindersCron() {
  logger.info({ env: process.env.NODE_ENV }, '⚡ Running immediate medical exam reminders check on startup...');
  processMedicalExamReminders();

  cron.schedule('0 13 * * *', () => {
    processMedicalExamReminders();
  });

  logger.info({ env: process.env.NODE_ENV }, 'Medical exam reminders cron job scheduled (runs daily at 8:00 AM Colombia time)');
}
