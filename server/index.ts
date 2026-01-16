/**
 * SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
 * 
 * Build: 2026-01-06T08:45:00Z - Force redeploy #2 with evaluation recalculation
 * 
 * Copyright (c) 2024-2026. Todos los derechos reservados.
 * 
 * Este software es propiedad confidencial y está protegido por las leyes de
 * propiedad intelectual de Colombia (Ley 23 de 1982, Decisión Andina 351).
 * 
 * Queda estrictamente prohibida su reproducción, distribución, modificación
 * o ingeniería inversa sin autorización expresa por escrito del propietario.
 * 
 * CONFIDENCIAL - NO DISTRIBUIR
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedSstCatalog } from "./sst-seed";
import { runMigrations } from "./run-migrations";
import { seedAdminUser } from "./seed-admin";
import { seedSubscriptionPlans } from "./seed-subscription-plans";
import logger from "./lib/logger";
import { requestLoggerMiddleware } from "./lib/request-logger-middleware";
import { startTrialConversionJob } from "./jobs/trial-conversion";
import { startMonthlyBillingJob } from "./jobs/monthly-billing";
import { startMedicalExamRemindersCron } from "./jobs/medical-exam-reminders";
import { startIndicadoresSchedulerCron } from "./jobs/indicadores-scheduler";
import { startNotificationsCron } from "./jobs/notifications";
import { scheduleWeeklyBackup } from "./jobs/weekly-backup";
import { getUncachableStripeClient, getStripeSecretKey } from "./stripeClient";
import { storage } from "./storage";
import { initializeLicense, requireValidLicense } from "./middleware/license";
import { initializeMasterKey } from "./lib/crypto";
import fs from "fs";
import path from "path";

const app = express();

// CRITICAL: Register Stripe webhook route BEFORE express.json()
// Webhooks need raw Buffer, not parsed JSON
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        logger.error('Stripe webhook: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      // Construct event with signature verification (if secret is configured)
      let event;
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        // In development, parse event without signature verification
        event = JSON.parse(req.body.toString());
        logger.warn('Stripe webhook: No endpoint secret configured, skipping signature verification');
      }

      logger.info({ eventType: event.type, eventId: event.id }, 'Stripe webhook received');

      // Handle specific events
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          logger.info({ sessionId: session.id, metadata: session.metadata }, 'Checkout session completed');
          
          // Process contract acceptance data if present (Ley 527/1999)
          if (session.metadata?.contractAccepted === 'true' && session.metadata?.companyId) {
            const companyId = session.metadata.companyId;
            
            // Parse and validate contract data
            let parsedContractData = null;
            try {
              if (session.metadata.contractData) {
                const parsed = JSON.parse(session.metadata.contractData);
                // Validate required boolean fields
                parsedContractData = {
                  acceptedTerms: Boolean(parsed.acceptedTerms),
                  acceptedDataTreatment: Boolean(parsed.acceptedDataTreatment),
                  acceptedAutoRenewal: Boolean(parsed.acceptedAutoRenewal),
                  planName: String(parsed.planName || '')
                };
              }
            } catch (parseError) {
              logger.error({ err: parseError, raw: session.metadata.contractData }, 'Error parsing contract data JSON');
            }
            
            const contractUpdate = {
              contractAcceptedAt: session.metadata.contractAcceptedAt ? new Date(session.metadata.contractAcceptedAt) : new Date(),
              contractTermsVersion: session.metadata.contractTermsVersion || '1.0',
              contractData: parsedContractData
            };
            
            // Retry logic: subscription might not exist immediately after checkout
            const maxRetries = 3;
            const retryDelay = 2000; // 2 seconds
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                const subscription = await storage.getSubscriptionByCompany(companyId);
                if (subscription) {
                  await storage.updateSubscription(subscription.id, contractUpdate);
                  logger.info({ 
                    subscriptionId: subscription.id, 
                    companyId,
                    attempt 
                  }, 'Contract acceptance stored in subscription');
                  break;
                } else if (attempt < maxRetries) {
                  logger.info({ companyId, attempt, maxRetries }, 'Subscription not found, retrying...');
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                  logger.warn({ companyId }, 'Subscription not found after max retries - contract data may need manual update');
                }
              } catch (contractError) {
                logger.error({ err: contractError, companyId, attempt }, 'Error storing contract acceptance data');
                if (attempt === maxRetries) break;
              }
            }
          }
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          logger.info({ subscriptionId: event.data.object.id }, 'Subscription updated');
          break;
        case 'customer.subscription.deleted':
          logger.info({ subscriptionId: event.data.object.id }, 'Subscription cancelled');
          break;
        case 'invoice.paid':
          logger.info({ invoiceId: event.data.object.id }, 'Invoice paid');
          break;
        case 'invoice.payment_failed':
          logger.warn({ invoiceId: event.data.object.id }, 'Invoice payment failed');
          break;
        default:
          logger.info({ eventType: event.type }, 'Unhandled Stripe event type');
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error({ err: error }, 'Stripe webhook error');
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// Now apply JSON middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('public/uploads'));

// Serve documentation files
app.use('/docs', express.static('docs'));

// Request logging middleware with Pino (Bloque 2: Infrastructure)
app.use(requestLoggerMiddleware);

// License validation middleware - blocks writes if license invalid
app.use(requireValidLicense);

(async () => {
  // Esperar un poco para que la base de datos esté lista en producción
  if (process.env.NODE_ENV === 'production') {
    logger.info('⏳ Esperando a que la base de datos de producción esté lista...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Crear carpetas necesarias para uploads
  const uploadDirs = [
    'public/uploads/logos',
    'public/uploads/afiliaciones',
    'public/uploads/documentos'
  ];
  
  uploadDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info({ dir }, `📁 Carpeta creada: ${dir}`);
    }
  });
  
  // Crear usuario admin si no existe (crítico para primer acceso)
  try {
    await seedAdminUser();
  } catch (error) {
    logger.error({ err: error }, "⚠️ Seed admin falló");
  }
  
  // CRÍTICO: Crear planes de suscripción si no existen (necesario para registro de empresas)
  try {
    await seedSubscriptionPlans();
  } catch (error) {
    logger.error({ err: error }, "⚠️ Seed planes de suscripción falló");
  }
  
  // Seed datos maestros SST al inicio (idempotente y no crítico)
  try {
    await seedSstCatalog();
  } catch (error) {
    logger.error({ err: error }, "⚠️ Seed SST falló");
  }
  
  // AUTOSCALE OPTIMIZATION: Don't initialize Stripe or cron jobs at startup
  // For Autoscale deployments, these should run lazily or on Reserved VM
  const isAutoscale = process.env.REPL_DEPLOYMENT_TYPE === 'autoscale' || 
                      (process.env.NODE_ENV === 'production' && !process.env.ENABLE_CRON_JOBS);
  
  if (!isAutoscale) {
    // Verify Stripe connection only in development or Reserved VM
    try {
      const stripe = await getUncachableStripeClient();
      const balance = await stripe.balance.retrieve();
      logger.info({ available: balance.available.length > 0 }, '✅ Stripe connection verified');
    } catch (error) {
      logger.warn({ err: error }, "⚠️ Stripe connection not available (non-critical)");
    }
    
    // Initialize cron jobs only in development or Reserved VM (not Autoscale)
    logger.info('⚡ Starting cron jobs (development/Reserved VM mode)...');
    
    // Initialize trial conversion cron job (Bloque 4 - Tarea 6)
    try {
      startTrialConversionJob();
    } catch (error) {
      logger.error({ err: error }, "⚠️ Trial conversion job initialization failed");
    }
    
    // Initialize monthly billing cron job (Bloque 4 - Tarea 17)
    try {
      startMonthlyBillingJob();
    } catch (error) {
      logger.error({ err: error }, "⚠️ Monthly billing job initialization failed");
    }
    
    // Initialize medical exam reminders cron job
    try {
      startMedicalExamRemindersCron();
    } catch (error) {
      logger.error({ err: error }, "⚠️ Medical exam reminders job initialization failed");
    }

    try {
      startIndicadoresSchedulerCron();
    } catch (error) {
      logger.error({ err: error }, "⚠️ Indicadores SST scheduler job initialization failed");
    }

    try {
      startNotificationsCron();
    } catch (error) {
      logger.error({ err: error }, "⚠️ Notifications cron job initialization failed");
    }

    try {
      scheduleWeeklyBackup();
    } catch (error) {
      logger.error({ err: error }, "⚠️ Weekly backup scheduler initialization failed");
    }
  } else {
    logger.info('⏭️ Skipping Stripe verification and cron jobs (Autoscale mode)');
    logger.info('💡 To enable cron jobs, use Reserved VM deployment or set ENABLE_CRON_JOBS=true');
  }
  
  // Initialize license verification system
  try {
    await initializeLicense();
  } catch (error) {
    logger.error({ err: error }, "⚠️ License initialization failed - Read-Only Mode active");
  }
  
  // Initialize AES-256 encryption system
  try {
    const encryptionEnabled = initializeMasterKey();
    if (!encryptionEnabled) {
      logger.warn("⚠️ Cifrado AES-256 no disponible - ENCRYPTION_MASTER_KEY no configurada");
    }
  } catch (error) {
    logger.error({ err: error }, "⚠️ Encryption initialization failed");
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error with context
    const reqLogger = (req as any).log || logger;
    reqLogger.error({
      err,
      requestId: (req as any).requestId,
      method: req.method,
      url: req.path,
      statusCode: status,
    }, `Unhandled error: ${message}`);

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
