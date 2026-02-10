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
import { ensureSchemaSync } from "./migrations/ensure-schema-sync";
import { seedAdminUser } from "./seed-admin";
import { seedSubscriptionPlans } from "./seed-subscription-plans";
import logger from "./lib/logger";
import { db } from "./db";
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
import { featureGateMiddleware } from "./middleware/feature-gate";
import { initializeMasterKey } from "./lib/crypto";
import fs from "fs";
import path from "path";

// Plugin imports (Arquitectura Sidecar - Solo añadir, no modificar código existente)
import { promotionsRouter } from "../plugins/promotions";
import { handlePromotionsWebhook } from "../plugins/promotions/webhook-handler";
import { landingPageRouter } from "../plugins/landing-page-integration";

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
          logger.info({ sessionId: session.id, metadata: session.metadata, paymentStatus: session.payment_status }, 'Checkout session completed');
          
          // Get companyId from metadata
          const companyId = session.metadata?.companyId;
          const purchaseType = session.metadata?.purchaseType;
          
          // Handle extra_seat purchase (usuarios adicionales de pago)
          if (purchaseType === 'extra_seat' && companyId && session.payment_status === 'paid') {
            const role = session.metadata?.role;
            if (role) {
              try {
                const extraSeat = await storage.incrementCompanyExtraSeat(companyId, role);
                logger.info({ 
                  companyId, 
                  role, 
                  extraSeats: extraSeat.extraSeats,
                  stripeSessionId: session.id 
                }, 'Extra seat purchased successfully');
              } catch (extraSeatError) {
                logger.error({ err: extraSeatError, companyId, role }, 'Error processing extra seat purchase');
              }
            } else {
              logger.warn({ companyId, sessionId: session.id }, 'Extra seat purchase missing role metadata');
            }
            break;
          }
          
          if (companyId && session.payment_status === 'paid') {
            // Retry logic: subscription might not exist immediately after checkout
            const maxRetries = 5;
            const retryDelay = 2000; // 2 seconds
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                const subscription = await storage.getSubscriptionByCompany(companyId);
                if (subscription) {
                  // Calculate next billing date (1 month from now)
                  const now = new Date();
                  const nextBillingDate = new Date(now);
                  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                  
                  // Build update object
                  const existingMetadata = subscription.metadata || {};
                  const updateData: any = {
                    status: 'active',
                    currentPeriodStart: now,
                    currentPeriodEnd: nextBillingDate,
                    trialEnd: null, // Clear trial
                    lastPaymentDate: now,
                    nextPaymentDate: nextBillingDate,
                    metadata: {
                      ...existingMetadata,
                      stripeCustomerId: session.customer as string,
                      stripeSessionId: session.id,
                      lastPaymentAmount: session.amount_total || 0
                    }
                  };
                  
                  // Process contract acceptance data if present (Ley 527/1999)
                  if (session.metadata?.contractAccepted === 'true') {
                    let parsedContractData = null;
                    try {
                      if (session.metadata.contractData) {
                        const parsed = JSON.parse(session.metadata.contractData);
                        parsedContractData = {
                          acceptedTerms: Boolean(parsed.acceptedTerms),
                          acceptedDataTreatment: Boolean(parsed.acceptedDataTreatment),
                          acceptedAutoRenewal: Boolean(parsed.acceptedAutoRenewal),
                          planName: String(parsed.planName || '')
                        };
                      }
                    } catch (parseError) {
                      logger.error({ err: parseError }, 'Error parsing contract data JSON');
                    }
                    
                    updateData.contractAcceptedAt = session.metadata.contractAcceptedAt ? new Date(session.metadata.contractAcceptedAt) : now;
                    updateData.contractTermsVersion = session.metadata.contractTermsVersion || '1.0';
                    updateData.contractData = parsedContractData;
                  }
                  
                  // Process workersPurchased - limita cuántos trabajadores puede registrar
                  if (session.metadata?.workersPurchased) {
                    const workersPurchased = parseInt(session.metadata.workersPurchased, 10);
                    if (!isNaN(workersPurchased) && workersPurchased > 0) {
                      updateData.workersPurchased = workersPurchased;
                      logger.info({ companyId, workersPurchased }, 'Workers purchased limit set from checkout');
                    }
                  }
                  
                  await storage.updateSubscription(subscription.id, updateData);
                  
                  const plan = await storage.getSubscriptionPlan(subscription.planId);
                  const amountPaid = session.amount_total || 0;
                  
                  logger.info({ 
                    subscriptionId: subscription.id, 
                    companyId,
                    planName: plan?.name,
                    status: 'active',
                    amountPaid,
                    currency: 'COP',
                    stripeSessionId: session.id,
                    stripeCustomerId: session.customer,
                    attempt 
                  }, 'Subscription activated after successful payment');
                  
                  // Notificar a landing page sobre cupón redimido (SST-COLOMBIA-AGENT-INSTRUCTIONS2 Sección 3)
                  const couponCode = session.metadata?.couponCode || session.metadata?.coupon_code;
                  if (couponCode && couponCode !== 'none') {
                    try {
                      const webhookUrl = process.env.LANDING_PAGE_WEBHOOK_URL || 'https://sst-colombia.com.co/api/webhooks/coupon-redeemed';
                      const webhookSecret = process.env.LANDING_PAGE_API_KEY;
                      
                      if (webhookSecret) {
                        const webhookResponse = await fetch(webhookUrl, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Webhook-Secret': webhookSecret
                          },
                          body: JSON.stringify({
                            coupon_code: couponCode,
                            company_id: companyId,
                            status: 'success',
                            redeemed_at: new Date().toISOString()
                          })
                        });
                        
                        if (webhookResponse.ok) {
                          logger.info({ couponCode, companyId }, '[Coupon-Webhook] Landing page notified of coupon redemption');
                        } else {
                          logger.warn({ couponCode, companyId, status: webhookResponse.status }, '[Coupon-Webhook] Failed to notify landing page');
                        }
                      } else {
                        logger.warn({ couponCode, companyId }, '[Coupon-Webhook] No LANDING_PAGE_API_KEY configured, skipping notification');
                      }
                    } catch (couponWebhookError) {
                      logger.error({ err: couponWebhookError, couponCode, companyId }, '[Coupon-Webhook] Error notifying landing page (non-critical)');
                    }
                  }
                  
                  // Update pricing_plugin_subscriptions to active status
                  try {
                    const { pricingPluginSubscriptions } = await import('../pricing_plugin/schema');
                    const { eq } = await import('drizzle-orm');
                    
                    await db
                      .update(pricingPluginSubscriptions)
                      .set({
                        subscriptionStatus: 'active',
                        trialEndsAt: null,
                        blockedAt: null,
                        blockedReason: null,
                        stripeSubscriptionId: session.subscription as string || null,
                        stripeCustomerId: session.customer as string || null,
                        updatedAt: now,
                      })
                      .where(eq(pricingPluginSubscriptions.customerId, companyId));
                    
                    logger.info({ companyId }, 'Pricing subscription activated after successful payment');
                  } catch (pricingError) {
                    logger.error({ err: pricingError, companyId }, 'Error updating pricing subscription (non-critical)');
                  }
                  
                  // Create invoice for this payment
                  try {
                    const company = await storage.getCompany(companyId);
                    if (company && plan) {
                      const invoiceNumber = await storage.getNextInvoiceNumber();
                      const priceInPesos = plan.priceMonthly;
                      const taxRate = 0.19; // 19% IVA Colombia
                      const subtotal = Math.round(priceInPesos / (1 + taxRate));
                      const taxAmount = priceInPesos - subtotal;
                      
                      const lineItems = JSON.stringify([{
                        description: `Suscripción ${plan.displayName || plan.name} - Mensual`,
                        quantity: 1,
                        unitPrice: priceInPesos,
                        total: priceInPesos
                      }]);
                      
                      const invoice = await storage.createInvoice({
                        companyId,
                        subscriptionId: subscription.id,
                        invoiceNumber,
                        status: 'paid',
                        subtotal,
                        taxAmount,
                        total: priceInPesos,
                        currency: 'COP',
                        periodStart: now,
                        periodEnd: nextBillingDate,
                        issueDate: now,
                        dueDate: now,
                        paidDate: now,
                        customerName: company.name,
                        customerNit: company.nit || 'N/A',
                        customerEmail: company.contactEmail || '',
                        customerAddress: company.address || '',
                        lineItems,
                        snapshotCiiuCode: company.ciiuCode || null,
                        snapshotNumberOfWorkers: company.numberOfWorkers ?? null,
                        snapshotNumberOfVehicles: company.numberOfVehicles ?? null,
                      });
                      
                      logger.info({ 
                        invoiceId: invoice.id, 
                        invoiceNumber,
                        companyId,
                        total: priceInPesos
                      }, 'Invoice created for payment');
                    }
                  } catch (invoiceError) {
                    logger.error({ err: invoiceError, companyId }, 'Error creating invoice (non-critical)');
                  }
                  
                  break;
                } else if (attempt < maxRetries) {
                  logger.info({ companyId, attempt, maxRetries }, 'Subscription not found, retrying...');
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                  // FIX: Si no existe suscripción pero hay pago, crear suscripción
                  logger.warn({ companyId }, 'Subscription not found after max retries - attempting recovery');
                  
                  try {
                    // Verificar si la empresa existe
                    const company = await storage.getCompany(companyId);
                    if (company) {
                      // Obtener el plan por defecto
                      const defaultPlan = await storage.getSubscriptionPlanByName('microempresa');
                      if (defaultPlan) {
                        const now = new Date();
                        const periodEnd = new Date(now);
                        periodEnd.setMonth(periodEnd.getMonth() + 1);
                        
                        // Crear suscripción activa (ya pagada)
                        const newSubscription = await storage.createSubscription({
                          companyId,
                          planId: defaultPlan.id,
                          status: 'active',
                          currentPeriodStart: now,
                          currentPeriodEnd: periodEnd,
                          lastPaymentDate: now,
                          nextPaymentDate: periodEnd,
                          metadata: {
                            stripeCustomerId: session.customer as string,
                            stripeSessionId: session.id,
                            recoveredFromWebhook: true,
                            lastPaymentAmount: session.amount_total || 0
                          }
                        });
                        
                        logger.info({ 
                          subscriptionId: newSubscription.id, 
                          companyId,
                          planName: defaultPlan.name,
                          recoveredFromWebhook: true
                        }, 'RECOVERY: Created subscription from webhook after payment');
                      } else {
                        logger.error({ companyId }, 'RECOVERY FAILED: No default subscription plan found');
                      }
                    } else {
                      logger.error({ companyId }, 'RECOVERY FAILED: Company does not exist');
                    }
                  } catch (recoveryError) {
                    logger.error({ err: recoveryError, companyId }, 'RECOVERY FAILED: Error creating subscription');
                  }
                }
              } catch (updateError) {
                logger.error({ err: updateError, companyId, attempt }, 'Error activating subscription');
                if (attempt === maxRetries) break;
              }
            }
          } else {
            logger.info({ companyId, paymentStatus: session.payment_status }, 'Checkout completed but payment not confirmed or missing companyId');
          }
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const stripeSubscription = event.data.object;
          logger.info({ 
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            trialEnd: stripeSubscription.trial_end 
          }, 'Subscription updated');
          
          // Update pricing_plugin_subscriptions with trial info
          try {
            const { pricingPluginSubscriptions } = await import('../pricing_plugin/schema');
            const { eq } = await import('drizzle-orm');
            
            // Find subscription by Stripe subscription ID
            const [existingPricingSub] = await db
              .select()
              .from(pricingPluginSubscriptions)
              .where(eq(pricingPluginSubscriptions.stripeSubscriptionId, stripeSubscription.id))
              .limit(1);
            
            if (existingPricingSub) {
              const now = new Date();
              let subscriptionStatus = 'active';
              let trialEndsAt = null;
              let blockedAt = null;
              let blockedReason = null;
              
              // Map Stripe status to our status
              if (stripeSubscription.status === 'trialing') {
                subscriptionStatus = 'trial';
                if (stripeSubscription.trial_end) {
                  trialEndsAt = new Date(stripeSubscription.trial_end * 1000);
                }
              } else if (stripeSubscription.status === 'active') {
                subscriptionStatus = 'active';
              } else if (stripeSubscription.status === 'past_due') {
                subscriptionStatus = 'past_due';
                blockedAt = now;
                blockedReason = 'Pago pendiente - Por favor actualice su método de pago';
              } else if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
                subscriptionStatus = 'blocked';
                blockedAt = now;
                blockedReason = 'Suscripción cancelada por falta de pago';
              }
              
              await db
                .update(pricingPluginSubscriptions)
                .set({
                  subscriptionStatus,
                  trialEndsAt,
                  blockedAt,
                  blockedReason,
                  updatedAt: now,
                })
                .where(eq(pricingPluginSubscriptions.id, existingPricingSub.id));
              
              logger.info({ 
                subscriptionId: existingPricingSub.id,
                subscriptionStatus,
                trialEndsAt
              }, 'Pricing subscription status updated');
            }
          } catch (subError) {
            logger.error({ err: subError }, 'Error updating pricing subscription status');
          }

          // Sync subscription status with local subscriptions table
          try {
            const stripeCustomerIdForSync = typeof stripeSubscription.customer === 'string'
              ? stripeSubscription.customer
              : stripeSubscription.customer?.id;
            
            if (stripeCustomerIdForSync) {
              const { subscriptions: subsTable } = await import('@shared/schema');
              const { sql: sqlOp } = await import('drizzle-orm');
              const [localSub] = await db
                .select()
                .from(subsTable)
                .where(sqlOp`${subsTable.metadata}->>'stripeCustomerId' = ${stripeCustomerIdForSync}`)
                .limit(1);

              if (localSub) {
                const statusMap: Record<string, string> = {
                  'active': 'active',
                  'trialing': 'trial',
                  'past_due': 'past_due',
                  'canceled': 'canceled',
                  'unpaid': 'canceled',
                  'incomplete': 'pending',
                  'incomplete_expired': 'canceled'
                };
                const newStatus = statusMap[stripeSubscription.status] || localSub.status;
                
                const updatePayload: any = { status: newStatus };
                if (stripeSubscription.current_period_start) {
                  updatePayload.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
                }
                if (stripeSubscription.current_period_end) {
                  updatePayload.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
                  updatePayload.nextPaymentDate = new Date(stripeSubscription.current_period_end * 1000);
                }
                if (stripeSubscription.cancel_at_period_end !== undefined) {
                  updatePayload.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end ? 1 : 0;
                }
                
                await storage.updateSubscription(localSub.id, updatePayload);
                logger.info({
                  localSubId: localSub.id,
                  stripeSubId: stripeSubscription.id,
                  newStatus
                }, 'Local subscription synced with Stripe subscription update');
              }
            }
          } catch (syncError) {
            logger.error({ err: syncError }, 'Error syncing local subscription with Stripe update (non-critical)');
          }
          break;
        case 'customer.subscription.deleted':
          const deletedSub = event.data.object;
          logger.info({ subscriptionId: deletedSub.id }, 'Subscription cancelled');
          
          // Block subscription access
          try {
            const { pricingPluginSubscriptions: pricingSubs } = await import('../pricing_plugin/schema');
            const { eq: eqOp } = await import('drizzle-orm');
            
            await db
              .update(pricingSubs)
              .set({
                subscriptionStatus: 'cancelled',
                blockedAt: new Date(),
                blockedReason: 'Suscripción cancelada',
                updatedAt: new Date(),
              })
              .where(eqOp(pricingSubs.stripeSubscriptionId, deletedSub.id));
            
            logger.info({ subscriptionId: deletedSub.id }, 'Subscription blocked after cancellation');
          } catch (cancelError) {
            logger.error({ err: cancelError }, 'Error blocking cancelled subscription');
          }
          break;
        case 'invoice.created':
          const draftInvoice = event.data.object;
          logger.info({
            invoiceId: draftInvoice.id,
            subscriptionId: draftInvoice.subscription,
            customerId: draftInvoice.customer,
            amountDue: draftInvoice.amount_due,
            currency: draftInvoice.currency,
            status: draftInvoice.status,
          }, 'Invoice created (draft) - verifying amount before finalization');

          if (draftInvoice.subscription && draftInvoice.status === 'draft') {
            try {
              const stripeClientForInvoice = await getUncachableStripeClient();
              const draftCustomerId = typeof draftInvoice.customer === 'string'
                ? draftInvoice.customer
                : (draftInvoice.customer as any)?.id;

              if (draftCustomerId) {
                const { subscriptions: subsTableInv } = await import('@shared/schema');
                const { sql: sqlInv } = await import('drizzle-orm');
                const [matchingSub] = await db
                  .select()
                  .from(subsTableInv)
                  .where(sqlInv`${subsTableInv.metadata}->>'stripeCustomerId' = ${draftCustomerId}`)
                  .limit(1);

                if (matchingSub) {
                  const invoiceCompany = await storage.getCompany(matchingSub.companyId);

                  if (invoiceCompany) {
                    const expectedPrice = Math.round(
                      invoiceCompany.quoteCurrentPeriodPrice ??
                      invoiceCompany.quoteBaseMonthlyPrice ??
                      0
                    );

                    if (expectedPrice > 0 && draftInvoice.amount_due !== expectedPrice) {
                      logger.warn({
                        invoiceId: draftInvoice.id,
                        companyId: matchingSub.companyId,
                        stripeAmountDue: draftInvoice.amount_due,
                        expectedAmountCOP: expectedPrice,
                        difference: draftInvoice.amount_due - expectedPrice,
                      }, 'Invoice amount mismatch detected - adjusting before finalization');

                      const currentLineItems = draftInvoice.lines?.data || [];
                      const currentTotal = currentLineItems.reduce(
                        (sum: number, item: any) => sum + (item.amount || 0), 0
                      );
                      const adjustment = expectedPrice - currentTotal;

                      if (adjustment !== 0) {
                        await stripeClientForInvoice.invoiceItems.create({
                          customer: draftCustomerId,
                          invoice: draftInvoice.id,
                          amount: adjustment,
                          currency: 'cop',
                          description: adjustment > 0
                            ? 'Ajuste de precio por actualización de parámetros de empresa'
                            : 'Crédito por ajuste de precio de empresa',
                        });

                        logger.info({
                          invoiceId: draftInvoice.id,
                          companyId: matchingSub.companyId,
                          adjustment,
                          newExpectedTotal: expectedPrice,
                        }, 'Invoice adjusted with corrective invoice item');
                      }
                    } else if (expectedPrice > 0) {
                      logger.info({
                        invoiceId: draftInvoice.id,
                        companyId: matchingSub.companyId,
                        amountDue: draftInvoice.amount_due,
                        expectedPrice,
                      }, 'Invoice amount matches expected price - no adjustment needed');
                    }
                  }
                }
              }
            } catch (invoiceAdjustError) {
              logger.error({ err: invoiceAdjustError, invoiceId: draftInvoice.id },
                'Error verifying/adjusting draft invoice amount (non-critical)');
            }
          }
          break;
        
        case 'invoice.paid':
          const paidInvoice = event.data.object;
          logger.info({ 
            invoiceId: paidInvoice.id,
            subscriptionId: paidInvoice.subscription,
            customerId: paidInvoice.customer
          }, 'Invoice paid - reactivating subscription');
          
          // Reactivate subscription after successful payment (for past_due recovery)
          if (paidInvoice.subscription) {
            try {
              const { pricingPluginSubscriptions: pricingSubsPaid } = await import('../pricing_plugin/schema');
              const { eq: eqPaid } = await import('drizzle-orm');
              
              await db
                .update(pricingSubsPaid)
                .set({
                  subscriptionStatus: 'active',
                  blockedAt: null,
                  blockedReason: null,
                  updatedAt: new Date(),
                })
                .where(eqPaid(pricingSubsPaid.stripeSubscriptionId, paidInvoice.subscription as string));
              
              logger.info({ subscriptionId: paidInvoice.subscription }, 'Subscription reactivated after payment recovery');
            } catch (reactivateError) {
              logger.error({ err: reactivateError }, 'Error reactivating subscription after payment');
            }
          }
          break;
          
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          const attemptCount = failedInvoice.attempt_count || 1;
          
          logger.warn({ 
            invoiceId: failedInvoice.id,
            subscriptionId: failedInvoice.subscription,
            attemptCount,
            nextPaymentAttempt: failedInvoice.next_payment_attempt
          }, 'Invoice payment failed');
          
          // Block subscription after payment failure
          if (failedInvoice.subscription) {
            try {
              const { pricingPluginSubscriptions: pricingSubsFailed } = await import('../pricing_plugin/schema');
              const { eq: eqFailed } = await import('drizzle-orm');
              
              const now = new Date();
              let subscriptionStatus = 'past_due';
              let blockedReason = `Pago fallido (intento ${attemptCount}). Por favor actualice su método de pago.`;
              
              // After 3 failed attempts, mark as blocked completely
              if (attemptCount >= 3) {
                subscriptionStatus = 'blocked';
                blockedReason = 'Suscripción bloqueada por múltiples pagos fallidos. Contacte a soporte.';
              }
              
              await db
                .update(pricingSubsFailed)
                .set({
                  subscriptionStatus,
                  blockedAt: now,
                  blockedReason,
                  updatedAt: now,
                })
                .where(eqFailed(pricingSubsFailed.stripeSubscriptionId, failedInvoice.subscription as string));
              
              logger.info({ 
                subscriptionId: failedInvoice.subscription,
                attemptCount,
                subscriptionStatus 
              }, 'Subscription marked as past_due/blocked after payment failure');
            } catch (failError) {
              logger.error({ err: failError }, 'Error blocking subscription after payment failure');
            }
          }
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

// Plugin Promotions Webhook - Also needs raw body for signature verification
// CRITICAL: Must be BEFORE express.json()
app.post(
  '/api/plugins/promotions/webhook',
  express.raw({ type: 'application/json' }),
  handlePromotionsWebhook
);

// Now apply JSON middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('public/uploads'));

// Serve documentation files
app.use('/docs', express.static('docs'));

// Serve public JSON files (CIIU classification for external pricing pages)
app.use(express.static('public'));

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
  
  // Ejecutar migraciones automáticas (sincroniza columnas faltantes)
  try {
    await runMigrations();
  } catch (error) {
    logger.error({ err: error }, "⚠️ Migraciones fallaron");
  }

  // Sincronizar esquema con base de datos (AWS RDS en producción)
  try {
    await ensureSchemaSync();
  } catch (error) {
    logger.error({ err: error }, "⚠️ Sincronización de esquema falló");
  }

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
  
  // Feature Gate: Control de acceso por suscripción a módulos premium
  // Se registra ANTES de registerRoutes para interceptar requests a rutas protegidas
  app.use(featureGateMiddleware());
  logger.info("✅ Feature Gate middleware registrado (control de acceso por suscripción)");

  const server = await registerRoutes(app);

  // Mount plugin routes (Arquitectura Sidecar - Independiente del sistema principal)
  try {
    app.use("/api/plugins/promotions", promotionsRouter);
    logger.info("✅ Plugin de Promociones montado en /api/plugins/promotions");
  } catch (error) {
    logger.warn({ err: error }, "⚠️ Plugin de Promociones no disponible (no crítico)");
  }
  
  try {
    app.use("/api/plugins/landing-page", landingPageRouter);
    logger.info("✅ Plugin Landing Page Integration montado en /api/plugins/landing-page");
  } catch (error) {
    logger.warn({ err: error }, "⚠️ Plugin Landing Page no disponible (no crítico)");
  }

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

    // PROTECCIÓN AUTOMÁTICA PARA ENDPOINTS PDF
    // Detecta si es una ruta PDF y sanitiza errores técnicos (SSL, certificados, etc.)
    const isPdfRoute = req.path.toLowerCase().includes('pdf');
    const isInternalError = 
      message.includes('certificate') ||
      message.includes('certificado') ||
      message.includes('CERT') ||
      message.includes('SSL') ||
      message.includes('TLS') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ECONNRESET') ||
      message.includes('ETIMEDOUT') ||
      message.includes('self signed') ||
      message.includes('autofirmado') ||
      message.includes('socket hang up') ||
      message.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE');

    if (isPdfRoute && isInternalError) {
      return res.status(500).send('Error al generar el documento. Por favor intente nuevamente o contacte soporte técnico.');
    }

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
