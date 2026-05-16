import type { Express } from "express";
import { requireAuth, requirePermission, requireAnyPermission, requireSuperadmin } from "../auth";
import { storage } from "../storage";
import { emailService } from "../services/email";
import { invoicePdfService } from "../services/invoice-pdf";
import { getAuditContext, logAuditEvent } from "../lib/audit-logger";
import { z } from "zod";
import * as schema from "@shared/schema";
import {
  billingRateLimiter,
  subscriptionMutationLimiter,
  paymentOperationLimiter,
  webhookRateLimiter
} from "../middleware/rate-limit";
import { accountingService } from "../services/accounting-integration";
import { getCompanyFeatures } from "../middleware/subscription-limits";
import { getUncachableStripeClient } from "../stripeClient";
import { billingHealthCheck } from "../lib/billing-validator";
import { getSubscriptionStatus } from "../middleware/subscription-check";

/**
 * Billing & Subscriptions Routes (Bloque 4 - Sistema de Facturación Stripe)
 * 
 * Endpoints para gestión de suscripciones, métodos de pago, transacciones e invoices
 * Integración con pasarela Stripe para pagos
 */
export function registerBillingRoutes(app: Express) {
  
  // ============================================================================
  // BILLING SYSTEM HEALTH CHECK - Verificación de salud del sistema
  // ============================================================================
  
  /**
   * GET /api/billing/health-check
   * Verifica que el sistema de facturación esté funcionando correctamente
   * Solo accesible por superadmin
   */
  app.get("/api/billing/health-check", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const healthResult = await billingHealthCheck();
      
      if (healthResult.success) {
        res.json({
          status: 'healthy',
          message: healthResult.message,
          details: healthResult.details,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: 'unhealthy',
          message: healthResult.message,
          details: healthResult.details,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('[BILLING-HEALTH-CHECK] Error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/billing/accounting-integration/status", requireAuth, requireSuperadmin, async (req, res) => {
    res.json({
      ...accountingService.getStatus(),
      timestamp: new Date().toISOString()
    });
  });

  
  // ============================================================================
  // SUBSCRIPTION PLANS - Planes de Suscripción
  // ============================================================================

  /**
   * GET /api/billing/plans
   * Lista todos los planes de suscripción disponibles
   * Permisos: admin, coordinador_sst (read-only)
   */
  app.get("/api/billing/plans", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ error: "Error al obtener planes de suscripción" });
    }
  });

  /**
   * GET /api/billing/plans/:id
   * Obtiene detalles de un plan específico
   */
  app.get("/api/billing/plans/:id", requireAuth, async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlan(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan no encontrado" });
      }

      res.json(plan);
    } catch (error: any) {
      console.error('Error fetching subscription plan:', error);
      res.status(500).json({ error: "Error al obtener plan" });
    }
  });

  // ============================================================================
  // SUBSCRIPTIONS - Suscripciones
  // ============================================================================

  /**
   * GET /api/billing/subscription
   * Obtiene la suscripción actual de la empresa
   * Permisos: superadmin (todas las empresas con ?companyId), otros (solo su empresa)
   * SECURITY: Solo superadmin tiene acceso global. Admin es rol de empresa.
   */
  app.get("/api/billing/subscription", requireAuth, async (req, res) => {
    try {
      const isSuperadmin = req.user!.role === 'superadmin';
      let companyId: string;

      if (isSuperadmin && req.query.companyId) {
        companyId = req.query.companyId as string;
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).json({ error: "Usuario no asociado a una empresa" });
        }
      }

      const subscription = await storage.getSubscriptionByCompany(companyId);
      
      // Architect feedback: Return 200 with null instead of 404 when no subscription exists
      // This allows frontend to properly detect absence of subscriptions
      if (!subscription) {
        return res.status(200).json(null);
      }

      // Enriquecer con datos del plan
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      const paymentSources = await storage.getPaymentSourcesByCompany(companyId);
      const defaultPaymentSource = paymentSources.find(ps => ps.isDefault === 1);

      res.json({
        ...subscription,
        plan,
        paymentSources,
        defaultPaymentSource
      });
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: "Error al obtener suscripción" });
    }
  });

  /**
   * POST /api/billing/subscription
   * Crea una nueva suscripción para una empresa
   * Permisos: Solo admin
   */
  app.post("/api/billing/subscription", subscriptionMutationLimiter, requirePermission("companies:create"), async (req, res) => {
    try {
      const validatedData = schema.insertSubscriptionSchema.parse(req.body);
      
      // Verificar que la empresa no tenga ya una suscripción activa
      const existing = await storage.getSubscriptionByCompany(validatedData.companyId);
      if (existing && existing.status === 'active') {
        return res.status(400).json({ 
          error: "La empresa ya tiene una suscripción activa" 
        });
      }

      // Verificar que el plan existe
      const plan = await storage.getSubscriptionPlan(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan no encontrado" });
      }

      const subscription = await storage.createSubscription(validatedData);
      
      res.status(201).json(subscription);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: "Error al crear suscripción" });
    }
  });

  /**
   * PATCH /api/billing/subscription/:id
   * Actualiza una suscripción existente
   * Permisos: Solo admin
   */
  app.patch("/api/billing/subscription/:id", subscriptionMutationLimiter, requirePermission("companies:create"), async (req, res) => {
    try {
      const partialSchema = schema.insertSubscriptionSchema.partial();
      const validatedData = partialSchema.parse(req.body);

      const updated = await storage.updateSubscription(req.params.id, validatedData);
      
      if (!updated) {
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: "Error al actualizar suscripción" });
    }
  });

  /**
   * POST /api/billing/trial
   * Crea una suscripción de prueba gratuita (14 o 30 días)
   * Bloque 4 - Tarea 6: Sistema de Trials
   * Permisos: Authenticated users (own company only)
   * Architect feedback: Added Zod validation for request hardening
   */
  app.post("/api/billing/trial", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const trialRequestSchema = z.object({
        trialDays: z.number().refine(
          (val) => [7, 14, 30].includes(val),
          "Trial debe ser de 7, 14 o 30 días"
        ).default(7)
      });

      const validatedData = trialRequestSchema.parse(req.body || {});

      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const { DYNAMIC_PLAN_ID } = await import("../seed-subscription-plans");
      const dynamicPlanId = DYNAMIC_PLAN_ID;

      const plan = await storage.getSubscriptionPlan(dynamicPlanId);
      if (!plan) {
        return res.status(500).json({ error: "Plan dinámico no configurado. Contacte soporte." });
      }

      const trialSubscription = await storage.createTrialSubscription(
        companyId,
        dynamicPlanId,
        validatedData.trialDays
      );

      res.status(201).json({
        message: `¡Prueba gratuita de ${validatedData.trialDays} días activada!`,
        subscription: trialSubscription,
        plan
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating trial subscription:', error);
      res.status(500).json({ error: error.message || "Error al crear prueba gratuita" });
    }
  });

  /**
   * POST /api/billing/admin/assign-trial
   * ADMIN: Asignar suscripción trial a empresa sin plan (para empresas huérfanas)
   * Permisos: Solo superadmin
   */
  app.post("/api/billing/admin/assign-trial", subscriptionMutationLimiter, requireSuperadmin, async (req, res) => {
    try {
      const assignTrialSchema = z.object({
        companyId: z.string().uuid("Company ID inv\u00e1lido"),
        planId: z.string().min(1, "Plan ID inv\u00e1lido"),
        trialDays: z.number().refine(
          (val) => [7, 14, 30].includes(val),
          "Trial debe ser de 7, 14 o 30 d\u00edas"
        ).default(7)
      });

      const validatedData = assignTrialSchema.parse(req.body);

      // Verificar que la empresa existe
      const company = await storage.getCompany(validatedData.companyId);
      if (!company) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      // Verificar que la empresa NO tiene suscripción
      const existingSub = await storage.getSubscriptionByCompany(validatedData.companyId);
      if (existingSub) {
        return res.status(400).json({ 
          error: `La empresa ya tiene una suscripción (${existingSub.status}). Use el endpoint de cambio de plan.`
        });
      }

      // Verificar que el plan existe
      const plan = await storage.getSubscriptionPlan(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan no encontrado" });
      }

      // Crear suscripción trial
      const subscription = await storage.createTrialSubscription(
        validatedData.companyId,
        validatedData.planId,
        validatedData.trialDays
      );

      console.log(`✅ Admin asignó trial a empresa ${company.name}: Plan ${plan.displayName} (${validatedData.trialDays} días)`);

      // Log audit event
      const auditContext = getAuditContext(req);
      await logAuditEvent({
        userId: req.user!.id,
        action: 'create',
        resource: 'subscription',
        resourceId: subscription.id,
        oldValue: null,
        newValue: { companyId: company.id, planId: plan.id, trialDays: validatedData.trialDays },
        ...auditContext
      });

      res.status(201).json({
        message: `Trial de ${validatedData.trialDays} días asignado exitosamente a ${company.name}`,
        subscription,
        plan,
        company: { id: company.id, name: company.name }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error assigning trial subscription:', error);
      res.status(500).json({ error: error.message || "Error al asignar trial" });
    }
  });

  /**
   * GET /api/billing/admin/companies-without-subscription
   * ADMIN: Lista empresas sin suscripción activa
   * Permisos: Solo superadmin
   */
  app.get("/api/billing/admin/companies-without-subscription", billingRateLimiter, requireSuperadmin, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      
      // Obtener todas las suscripciones
      const companiesWithoutSub = [];
      for (const company of companies) {
        const subscription = await storage.getSubscriptionByCompany(company.id);
        if (!subscription) {
          companiesWithoutSub.push({
            id: company.id,
            name: company.name,
            nit: company.nit,
            createdAt: company.createdAt
          });
        }
      }

      res.json({
        count: companiesWithoutSub.length,
        companies: companiesWithoutSub
      });
    } catch (error: any) {
      console.error('Error fetching companies without subscription:', error);
      res.status(500).json({ error: "Error al obtener empresas sin suscripción" });
    }
  });

  /**
   * GET /api/billing/subscription/:id/change-plan/quote
   * DEPRECATED: El sistema usa precio dinamico desde la landing page (Token>Calculo)
   * No hay cambio de plan - solo existe sst_dinamico con precio del JWT
   */
  app.get("/api/billing/subscription/:id/change-plan/quote", billingRateLimiter, requireAuth, async (_req, res) => {
    res.status(410).json({ 
      error: "Funcionalidad eliminada. El sistema usa precio dinamico calculado por la landing page (sst-colombia.com.co). Para actualizar tu precio, modifica los datos de tu empresa." 
    });
  });

  /**
   * POST /api/billing/subscription/:id/change-plan
   * DEPRECATED: El sistema usa precio dinamico desde la landing page (Token>Calculo)
   */
  app.post("/api/billing/subscription/:id/change-plan", subscriptionMutationLimiter, requireAuth, async (_req, res) => {
    res.status(410).json({ 
      error: "Funcionalidad eliminada. El sistema usa precio dinamico calculado por la landing page (sst-colombia.com.co). Para actualizar tu precio, modifica los datos de tu empresa." 
    });
  });

  // ============================================================================
  // ACTIVATE SUBSCRIPTION - Activar suscripción con pago inmediato
  // ============================================================================

  /**
   * POST /api/billing/subscription/:id/activate
   * Permite a un usuario en período de prueba (o activo) pagar inmediatamente
   * Crea una sesión de Stripe Checkout para el primer mes del plan actual
   * Permisos: admin (todas), otros (solo su empresa)
   */
  app.post("/api/billing/subscription/:id/activate", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      console.log('[Billing] Starting subscription activation for:', req.params.id);
      const subscriptionId = req.params.id;
      const { quoteToken } = req.body || {};

      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        console.log('[Billing] Subscription not found:', subscriptionId);
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }
      console.log('[Billing] Found subscription:', subscription.id, 'planId:', subscription.planId, 'status:', subscription.status);

      if (subscription.status === 'active') {
        console.log('[Billing] Subscription already active, skipping activation:', subscription.id);
        return res.status(200).json({
          success: true,
          alreadyActive: true,
          message: 'La suscripción ya está activa',
        });
      }

      // GUARD: Check if there's already a recent successful Stripe session for this company
      // This prevents duplicate payments when the user clicks "Pagar" again before the webhook updates the subscription
      try {
        const stripe = await getUncachableStripeClient();
        const recentSessions = await stripe.checkout.sessions.list({
          limit: 5,
          created: {
            gte: Math.floor((Date.now() - 30 * 60 * 1000) / 1000), // Last 30 minutes
          },
        });
        
        const duplicateSession = recentSessions.data.find(s => 
          s.metadata?.companyId === subscription.companyId &&
          s.metadata?.type === 'subscription_activation' &&
          (s.payment_status === 'paid' || s.status === 'complete')
        );
        
        if (duplicateSession) {
          console.log('[Billing] Recent paid session found, preventing duplicate:', duplicateSession.id);
          
          // Force-update subscription to active since payment was confirmed
          const now = new Date();
          const nextBillingDate = new Date(now);
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          
          await storage.updateSubscription(subscription.id, {
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: nextBillingDate,
            trialEnd: null,
            lastPaymentDate: now,
            nextPaymentDate: nextBillingDate,
          });
          
          return res.status(200).json({
            success: true,
            alreadyActive: true,
            message: 'Tu pago ya fue procesado exitosamente. Tu suscripción está activa.',
          });
        }
        
        // Expire any open/unpaid sessions for this company so a fresh one is created
        // with the latest price (user may have changed employees/vehicles/CIIU)
        const pendingSessions = recentSessions.data.filter(s =>
          s.metadata?.companyId === subscription.companyId &&
          s.metadata?.type === 'subscription_activation' &&
          s.status === 'open' &&
          s.payment_status === 'unpaid'
        );
        
        for (const oldSession of pendingSessions) {
          try {
            await stripe.checkout.sessions.expire(oldSession.id);
            console.log('[Billing] Expired stale checkout session:', oldSession.id);
          } catch (expireErr: any) {
            console.warn('[Billing] Could not expire session', oldSession.id, expireErr.message);
          }
        }
      } catch (checkError: any) {
        console.warn('[Billing] Error checking recent sessions (continuing):', checkError.message);
      }

      // Trial users CAN activate (convert trial → paid). Do NOT block them.
      // The TrialAlert button "Activar suscripción" appears for trial users
      // wanting to convert to paid before their trial expires.
      if (subscription.status === 'trial') {
        console.log('[Billing] Trial subscription - proceeding with activation (trial → paid conversion):', subscription.id);
      }

      const isAdmin = req.user!.role === 'admin';
      const isOwner = req.user!.companyId === subscription.companyId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "No tiene permisos para activar esta suscripción" });
      }

      const plan = await storage.getSubscriptionPlan(subscription.planId);
      if (!plan) {
        console.log('[Billing] Plan not found:', subscription.planId);
        return res.status(404).json({ error: "Plan de suscripción no encontrado" });
      }
      console.log('[Billing] Found plan:', plan.name, 'price:', plan.priceMonthly);

      const company = await storage.getCompany(subscription.companyId);
      console.log('[Billing] Company:', company?.name);
      
      console.log('[Billing] Getting Stripe client...');
      const stripeClient = await getUncachableStripeClient();
      console.log('[Billing] Stripe client obtained');
      
      const baseUrl = process.env.APP_URL || (process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : process.env.REPLIT_DOMAINS 
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : 'http://localhost:5000');
      
      let amountInCOP: number;
      let productDescription = `Plan ${plan.displayName || plan.name} - Primer mes`;
      let quoteSource = 'none';

      let isFullDiscount = false;
      let couponCode: string | undefined;

      // PRINCIPIO: El precio SIEMPRE viene del token/quote guardado en companies.
      // NUNCA se recalcula durante registro ni checkout.
      // Solo se recalcula si la empresa cambia datos después (empleados, vehículos, CIIU).
      
      // Fuente de verdad: companies table (donde se guardó el precio del JWT al registrar)
      let companyQuoteBase = company ? (company as any).quoteBaseMonthlyPrice : null;
      let companyQuoteCurrent = company ? (company as any).quoteCurrentPeriodPrice : null;
      let companyCouponCode = company ? (company as any).quoteCouponCode : null;

      // Si no hay cotización guardada, intentar obtener una automáticamente de la landing page
      if (!companyQuoteBase || companyQuoteBase <= 0) {
        console.log('[Billing] No quote found. Attempting auto-quote from landing page for company:', company?.id);
        
        // Try to recover quote data from user's stored quote token (registered via landing page)
        if (req.user) {
          try {
            const userRecord = await storage.getUser(req.user.id);
            if (userRecord?.selectedPlan) {
              const parsed = JSON.parse(userRecord.selectedPlan);
              if (parsed.quoteToken) {
                const { verifyQuote: verifyQuoteFn } = await import("../../plugins/landing-page-integration");
                const verification = verifyQuoteFn(parsed.quoteToken);
                if (verification.valid && verification.data) {
                  companyQuoteBase = verification.data.baseMonthlyPrice;
                  companyQuoteCurrent = verification.data.currentPeriodPrice;
                  companyCouponCode = verification.data.couponCode;
                  console.log('[Billing] Recovered quote from user token:', {
                    base: companyQuoteBase, current: companyQuoteCurrent, coupon: companyCouponCode,
                  });
                  
                  const { db: dbInstance } = await import("../db");
                  const { eq: eqOp } = await import("drizzle-orm");
                  const schemaModule = await import("@shared/schema");
                  await dbInstance.update(schemaModule.companies)
                    .set({
                      quoteBaseMonthlyPrice: companyQuoteBase,
                      quoteCurrentPeriodPrice: companyQuoteCurrent,
                      quoteDiscountDurationMonths: verification.data.discountDurationMonths,
                      quoteCouponCode: companyCouponCode,
                    })
                    .where(eqOp(schemaModule.companies.id, company!.id));
                  console.log('[Billing] Saved recovered quote to company record');
                } else {
                  console.warn('[Billing] User quote token verification failed:', verification.error);
                  if (!companyCouponCode) {
                    const parts = parsed.quoteToken.split('.');
                    if (parts.length === 3) {
                      try {
                        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
                        if (payload.metadata?.coupon_code) {
                          companyCouponCode = payload.metadata.coupon_code;
                          console.log('[Billing] Recovered coupon from expired token for recalculation:', companyCouponCode);
                        }
                      } catch { /* ignore decode errors */ }
                    }
                  }
                }
              }
            }
          } catch {
            // selectedPlan is not JSON or doesn't have quoteToken - ignore
          }
        }

        const LANDING_PAGE_BASE_URL = process.env.LANDING_PAGE_BASE_URL || 'https://sst-colombia.com.co';
        
        if (company) {
          try {
            const requestData = {
              company_name: company.name,
              employees: company.numberOfWorkers ?? 1,
              vehicles: (company as any).numberOfVehicles ?? 0,
              risk_level: company.riskLevel ?? "I",
              coupon_code: companyCouponCode || undefined,
            };

            console.log('[Billing] Auto-quote request:', requestData);

            const quoteResponse = await fetch(`${LANDING_PAGE_BASE_URL}/api/recalculate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
            });

            if (quoteResponse.ok) {
              const quoteResponseData = await quoteResponse.json();
              
              if (quoteResponseData.token) {
                const { verifyRecalculateToken } = await import("../../plugins/landing-page-integration");
                const verification = verifyRecalculateToken(quoteResponseData.token);
                
                if (verification.valid && verification.data) {
                  const quoteData = verification.data;
                  
                  const { db } = await import("../db");
                  const { eq } = await import("drizzle-orm");
                  const schemaModule = await import("@shared/schema");
                  
                  await db.update(schemaModule.companies)
                    .set({
                      quoteBaseMonthlyPrice: quoteData.baseMonthlyPrice,
                      quoteCurrentPeriodPrice: quoteData.currentPeriodPrice,
                      quoteDiscountDurationMonths: quoteData.discountDurationMonths,
                      quoteCouponCode: quoteData.couponCode,
                    })
                    .where(eq(schemaModule.companies.id, company.id));
                  
                  companyQuoteBase = quoteData.baseMonthlyPrice;
                  companyQuoteCurrent = quoteData.currentPeriodPrice;
                  companyCouponCode = quoteData.couponCode;
                  
                  console.log(`[Billing] Auto-quote successful: base=${companyQuoteBase}, current=${companyQuoteCurrent}`);
                } else {
                  console.warn('[Billing] Auto-quote JWT verification failed:', verification.error);
                }
              }
            } else {
              console.warn('[Billing] Auto-quote landing page error:', quoteResponse.status);
            }
          } catch (autoQuoteError: any) {
            console.warn('[Billing] Auto-quote failed (non-blocking):', autoQuoteError.message);
          }
        }
      }

      if (companyQuoteBase && companyQuoteBase > 0) {
        couponCode = companyCouponCode || undefined;
        isFullDiscount = companyQuoteCurrent === 0 && companyQuoteBase > 0;
        amountInCOP = isFullDiscount ? companyQuoteBase : (companyQuoteCurrent != null && companyQuoteCurrent > 0 && companyQuoteCurrent < companyQuoteBase ? companyQuoteCurrent : companyQuoteBase);
        quoteSource = 'company_quote';
        
        console.log('[Billing] Using agreed quote price from companies table:', { base: companyQuoteBase, current: companyQuoteCurrent, coupon: couponCode, amount: amountInCOP });
        
        if (couponCode && companyQuoteCurrent != null && companyQuoteCurrent < companyQuoteBase) {
          productDescription = `Plan ${plan.displayName || plan.name} - Primer mes (Cupón ${couponCode})`;
        }
      } else {
        console.warn('[Billing] No quote price found and auto-quote failed. Company must get a quote from the landing page.');
        return res.status(400).json({ 
          error: 'No se pudo obtener una cotización de precio. Verifique la conexión con la página de inicio (sst-colombia.com.co) o intente nuevamente.',
          needsQuote: true
        });
      }

      const STRIPE_MIN_COP = 2000;
      
      if (!isFullDiscount && amountInCOP > 0 && amountInCOP < STRIPE_MIN_COP) {
        console.warn('[Billing] Price below Stripe minimum, converting to 30-day trial. Amount:', amountInCOP, 'COP');
        isFullDiscount = true;
      }
      
      if (isFullDiscount) {
        console.log('[Billing] 100% discount detected - activating as 30-day trial');
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);
        
        await storage.updateSubscription(subscription.id, {
          status: 'trial',
          trialEnd: trialEnd,
        });
        
        const updatedSub = await storage.getSubscription(subscription.id);
        if (updatedSub) {
          await (storage as any).ensurePricingPluginSync(updatedSub.companyId, 'trial', trialEnd);
        }
        
        return res.status(200).json({
          success: true,
          trial: true,
          trialDays: 30,
          trialEnd: trialEnd.toISOString(),
          message: couponCode 
            ? `Cupón "${couponCode}" aplicado: 30 días de prueba gratis` 
            : '30 días de prueba gratis activados',
          amount: 0,
        });
      }
      
      if (amountInCOP <= 0) {
        console.error('[Billing] Invalid amount after all calculations:', amountInCOP);
        return res.status(400).json({ 
          error: 'No se pudo determinar un precio válido para la suscripción' 
        });
      }
      
      const COP_STRIPE_MULTIPLIER = 100;
      const stripeUnitAmount = Math.round(amountInCOP * COP_STRIPE_MULTIPLIER);
      console.log('[Billing] Creating Stripe session. Source:', quoteSource, 'Amount:', amountInCOP, 'COP, stripeUnit:', stripeUnitAmount, '(x100 for Stripe), baseUrl:', baseUrl);
      
      try {
        const session = await stripeClient.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'cop',
                product_data: {
                  name: `Suscripción ${plan.displayName || plan.name}`,
                  description: productDescription,
                },
                unit_amount: stripeUnitAmount,
              },
              quantity: 1,
            },
          ],
          metadata: {
            type: 'subscription_activation',
            subscriptionId: subscriptionId,
            planId: plan.id,
            companyId: subscription.companyId,
            companyName: company?.name || 'Unknown',
            userId: req.user!.id,
            amountChargedCOP: amountInCOP.toString(),
            priceSource: quoteSource,
          },
          success_url: `${baseUrl}/mi-cuenta?activation=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/mi-cuenta?activation=cancelled`,
          customer_email: req.user!.email || undefined,
        });
        
        console.log('[Billing] Stripe session created successfully:', session.id, 'URL:', session.url, 'Amount:', amountInCOP, 'COP');
        
        return res.status(200).json({
          success: true,
          paymentUrl: session.url,
          sessionId: session.id,
          amount: amountInCOP,
          currency: 'COP',
          planName: plan.displayName || plan.name,
          message: 'Redirigiendo a pasarela de pago...',
        });
      } catch (stripeError: any) {
        console.error('[Billing] Stripe session creation failed:', stripeError.message, stripeError.type, stripeError.code);
        return res.status(500).json({ error: `Error de Stripe: ${stripeError.message}` });
      }
    } catch (error: any) {
      console.error('[Billing] Error activating subscription:', error.message, error.stack);
      res.status(500).json({ error: error.message || "Error al activar suscripción" });
    }
  });

  // ============================================================================
  // PAYMENT SOURCES - Métodos de Pago
  // ============================================================================

  /**
   * GET /api/billing/payment-sources
   * Lista los métodos de pago de la empresa
   * Permisos: admin (todas), otros (solo su empresa)
   */
  app.get("/api/billing/payment-sources", requireAuth, async (req, res) => {
    try {
      const isAdmin = req.user!.role === 'admin';
      let companyId: string;

      if (isAdmin && req.query.companyId) {
        companyId = req.query.companyId as string;
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).json({ error: "Usuario no asociado a una empresa" });
        }
      }

      const paymentSources = await storage.getPaymentSourcesByCompany(companyId);
      res.json(paymentSources);
    } catch (error: any) {
      console.error('Error fetching payment sources:', error);
      res.status(500).json({ error: "Error al obtener métodos de pago" });
    }
  });

  /**
   * POST /api/billing/payment-sources
   * Agrega un nuevo método de pago (integración con Stripe)
   * Permisos: admin (todas), otros (solo su empresa)
   * TODO: Implement Stripe payment method creation
   */
  app.post("/api/billing/payment-sources", paymentOperationLimiter, requireAuth, async (req, res) => {
    try {
      const isAdmin = req.user!.role === 'admin';
      let companyId: string;

      if (isAdmin && req.body.companyId) {
        companyId = req.body.companyId;
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).json({ error: "Usuario no asociado a una empresa" });
        }
      }

      // Validar entrada
      const paymentSourceSchema = schema.insertPaymentSourceSchema;

      const validatedData = paymentSourceSchema.parse({
        ...req.body,
        companyId
      });

      // Obtener suscripción de la empresa
      const subscription = await storage.getSubscriptionByCompany(companyId);
      if (!subscription) {
        return res.status(404).json({ 
          error: "No hay suscripción activa. Cree una suscripción primero." 
        });
      }

      // TODO: Integrate with Stripe for payment method creation
      // For now, just save to database with the provided data
      const paymentSource = await storage.createPaymentSource({
        ...validatedData,
        companyId,
        subscriptionId: subscription.id
      });

      // Si es el primer método de pago o está marcado como default, hacerlo default
      const existingSources = await storage.getPaymentSourcesByCompany(companyId);
      if (existingSources.length === 1 || validatedData.isDefault === 1) {
        await storage.setDefaultPaymentSource(companyId, paymentSource.id);
      }

      res.status(201).json(paymentSource);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating payment source:', error);
      res.status(500).json({ error: "Error al crear método de pago" });
    }
  });

  /**
   * DELETE /api/billing/payment-sources/:id
   * Elimina un método de pago
   * Permisos: admin (todas), otros (solo su empresa)
   */
  app.delete("/api/billing/payment-sources/:id", paymentOperationLimiter, requireAuth, async (req, res) => {
    try {
      const paymentSource = await storage.getPaymentSource(req.params.id);
      
      if (!paymentSource) {
        return res.status(404).json({ error: "Método de pago no encontrado" });
      }

      // Verificar permisos
      const isAdmin = req.user!.role === 'admin';
      if (!isAdmin && paymentSource.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No autorizado" });
      }

      // No permitir eliminar el método de pago por defecto si hay otros
      if (paymentSource.isDefault === 1) {
        const allSources = await storage.getPaymentSourcesByCompany(paymentSource.companyId);
        if (allSources.length > 1) {
          return res.status(400).json({ 
            error: "No puede eliminar el método de pago por defecto. Establezca otro como predeterminado primero." 
          });
        }
      }

      await storage.deletePaymentSource(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      console.error('Error deleting payment source:', error);
      res.status(500).json({ error: "Error al eliminar método de pago" });
    }
  });

  /**
   * PATCH /api/billing/payment-sources/:id/set-default
   * Establece un método de pago como predeterminado
   */
  app.patch("/api/billing/payment-sources/:id/set-default", paymentOperationLimiter, requireAuth, async (req, res) => {
    try {
      const paymentSource = await storage.getPaymentSource(req.params.id);
      
      if (!paymentSource) {
        return res.status(404).json({ error: "Método de pago no encontrado" });
      }

      // Verificar permisos
      const isAdmin = req.user!.role === 'admin';
      if (!isAdmin && paymentSource.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await storage.setDefaultPaymentSource(paymentSource.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error setting default payment source:', error);
      res.status(500).json({ error: "Error al establecer método de pago predeterminado" });
    }
  });

  // ============================================================================
  // PAYMENT TRANSACTIONS - Transacciones
  // ============================================================================

  /**
   * GET /api/billing/transactions
   * Lista el historial de transacciones de la empresa
   * Permisos: admin (todas), coordinador_sst (solo su empresa - read)
   */
  app.get("/api/billing/transactions", requireAuth, async (req, res) => {
    try {
      const isAdmin = req.user!.role === 'admin';
      let companyId: string;

      if (isAdmin && req.query.companyId) {
        companyId = req.query.companyId as string;
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).json({ error: "Usuario no asociado a una empresa" });
        }
      }

      const transactions = await storage.getTransactionsByCompany(companyId);
      res.json(transactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: "Error al obtener transacciones" });
    }
  });

  // ============================================================================
  // ADMIN ANALYTICS & METRICS - Dashboard Administrativo (Bloque 4 - Tarea 7)
  // ============================================================================

  /**
   * GET /api/billing/admin/metrics
   * Obtiene métricas de facturación agregadas para el dashboard admin
   * Retorna: MRR, ARR, active subscriptions, trials, churn rate, total revenue
   * Permisos: Solo superadmin (proveedor SaaS)
   */
  app.get("/api/billing/admin/metrics", requireSuperadmin, async (req, res) => {
    try {
      const metrics = await storage.getBillingMetrics();
      res.json(metrics);
    } catch (error: any) {
      console.error('Error fetching billing metrics:', error);
      res.status(500).json({ error: "Error al obtener métricas de facturación" });
    }
  });

  /**
   * GET /api/billing/admin/subscriptions
   * Lista todas las suscripciones con detalles de empresa y plan
   * Usado para tabla de administración con filtros y acciones
   * Permisos: Solo superadmin (proveedor SaaS)
   */
  app.get("/api/billing/admin/subscriptions", requireSuperadmin, async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptionsWithDetails();
      res.json(subscriptions);
    } catch (error: any) {
      console.error('Error fetching admin subscriptions:', error);
      res.status(500).json({ error: "Error al obtener suscripciones" });
    }
  });

  /**
   * GET /api/billing/admin/revenue-chart
   * Obtiene datos de ingresos agrupados por mes para gráficos
   * Query params: ?months=6 (default: 6 meses)
   * Permisos: Solo superadmin (proveedor SaaS)
   */
  app.get("/api/billing/admin/revenue-chart", requireSuperadmin, async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const data = await storage.getRevenueTimeSeries(months);
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching revenue chart data:', error);
      res.status(500).json({ error: "Error al obtener datos de gráfico" });
    }
  });

  /**
   * PATCH /api/billing/admin/subscriptions/:id/status
   * Cambia el estado de una suscripción (suspender, reactivar, cancelar)
   * Body: { status: 'active' | 'suspended' | 'canceled', reason?: string }
   * Permisos: Solo superadmin (proveedor SaaS)
   * 
   * Audit: Registra todas las transiciones de estado en audit_log para trazabilidad
   */
  app.patch("/api/billing/admin/subscriptions/:id/status", requireSuperadmin, async (req, res) => {
    try {
      const { status, reason } = req.body;
      const subscriptionId = req.params.id;
      
      if (!['active', 'suspended', 'canceled'].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      // Get subscription before update for audit trail
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }

      const metadata: any = {};
      if (status === 'suspended') {
        metadata.suspendedAt = new Date();
      }
      if (status === 'canceled') {
        metadata.canceledAt = new Date();
      }

      const updated = await storage.transitionSubscriptionStatus(subscriptionId, status, metadata);
      
      if (!updated) {
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }

      // Audit log for admin subscription status changes (Bloque 2 - Audit System)
      const auditContext = getAuditContext(req);
      
      await logAuditEvent({
        companyId: subscription.companyId,
        userId: req.user!.id,
        userRole: req.user!.role,
        username: req.user!.username,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'update',
        oldValues: { status: subscription.status },
        newValues: { status, ...(reason && { reason }) },
        description: `Admin changed subscription status from ${subscription.status} to ${status}`,
        context: {
          ipAddress: auditContext.ipAddress,
          userAgent: auditContext.userAgent,
          requestId: auditContext.requestId
        }
      });

      res.json({ 
        success: true, 
        subscription: updated,
        message: `Suscripción ${status === 'suspended' ? 'suspendida' : status === 'canceled' ? 'cancelada' : 'reactivada'} exitosamente`
      });
    } catch (error: any) {
      console.error('Error updating subscription status:', error);
      res.status(500).json({ error: "Error al actualizar estado de suscripción" });
    }
  });

  // ============================================================================
  // WEBHOOKS - Stripe Payment Notifications
  // ============================================================================
  // NOTE: Stripe webhooks are handled in server/routes/stripe.ts
  // This section is kept as a placeholder for future webhook integrations
  // The Stripe webhook at /api/stripe/webhook handles payment events

  // ============================================================================
  // CUSTOMER PORTAL - Portal del Cliente (Bloque 4 - Tarea 21)
  // ============================================================================

  /**
   * GET /api/billing/my-subscription
   * Obtiene la suscripción actual del usuario autenticado
   * Incluye: plan actual, próxima fecha de facturación, historial de cambios
   */
  app.get("/api/billing/my-subscription", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const subscription = await storage.getSubscriptionByCompany(companyId);
      if (!subscription) {
        return res.status(404).json({ error: "No se encontró suscripción activa" });
      }

      // Enrich with real status from pricing_plugin_subscriptions (source of truth for blocking)
      const pricingStatus = await getSubscriptionStatus(companyId);
      const enrichedSubscription = {
        ...subscription,
        status: pricingStatus.subscriptionStatus || subscription.status,
      };

      // Get plan details
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      
      // Get plan change history
      const changeHistory = await storage.getPlanChangeHistory(subscription.id);

      res.json({
        subscription: enrichedSubscription,
        plan,
        changeHistory
      });
    } catch (error: any) {
      console.error('Error fetching customer subscription:', error);
      res.status(500).json({ error: "Error al obtener información de suscripción" });
    }
  });

  /**
   * GET /api/billing/my-invoices
   * Lista todas las facturas de la empresa del usuario autenticado
   */
  app.get("/api/billing/my-invoices", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const invoices = await storage.getInvoicesByCompany(companyId);
      
      res.json(invoices);
    } catch (error: any) {
      console.error('Error fetching customer invoices:', error);
      res.status(500).json({ error: "Error al obtener facturas" });
    }
  });

  /**
   * GET /api/billing/invoice/:id/download
   * Descarga el PDF de una factura (re-generación on-demand)
   */
  app.get("/api/billing/invoice/:id/download", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const companyId = req.user!.companyId;
      
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      // Get invoice with tenant check
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice || invoice.companyId !== companyId) {
        return res.status(404).json({ error: "Factura no encontrada" });
      }

      // Get related data
      const company = await storage.getCompany(invoice.companyId);
      const subscription = invoice.subscriptionId ? await storage.getSubscription(invoice.subscriptionId) : null;
      const plan = subscription ? await storage.getSubscriptionPlan(subscription.planId) : null;

      if (!company) {
        return res.status(500).json({ error: "Datos de empresa no encontrados" });
      }

      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber || '',
        issuedDate: invoice.issueDate ? new Date(invoice.issueDate) : new Date(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        paidDate: invoice.paidDate ? new Date(invoice.paidDate) : undefined,
        status: invoice.status || 'pending',
        amount: invoice.total || 0,
        currency: invoice.currency || 'COP',
        billingPeriodStart: invoice.periodStart ? new Date(invoice.periodStart) : new Date(),
        billingPeriodEnd: invoice.periodEnd ? new Date(invoice.periodEnd) : new Date(),
        description: invoice.notes || 'Suscripción SST Colombia',
        lineItems: (() => { try { return invoice.lineItems ? (typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems) : invoice.lineItems) : undefined; } catch { return undefined; } })(),
        paymentTransactionId: invoice.transactionId || undefined,
      };

      const companyData = {
        name: company.name || '',
        nit: company.nit || '',
        address: company.address || undefined,
        city: company.city || undefined,
        contactEmail: company.contactEmail || undefined,
        phone: company.contactPhone || undefined,
      };

      const pdfBuffer = await invoicePdfService.generateInvoicePdf(
        invoiceData,
        companyData
      );

      // Send PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Comprobante-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      res.status(500).json({ error: "Error al descargar factura" });
    }
  });

  /**
   * GET /api/billing/my-features
   * Obtiene las features disponibles según el plan de suscripción actual
   */
  app.get("/api/billing/my-features", requireAuth, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const features = await getCompanyFeatures(companyId);
      res.json(features);
    } catch (error: any) {
      console.error('Error fetching company features:', error);
      res.status(500).json({ error: "Error al obtener features" });
    }
  });

  /**
   * GET /api/billing/admin/list-invoices-by-company
   * TEMPORAL: Lista facturas de una empresa por nombre (para encontrar IDs en producción)
   * Solo superadmin. Eliminar después de usar.
   */
  app.get("/api/billing/admin/list-invoices-by-company", requireSuperadmin, async (req, res) => {
    try {
      const companyName = (req.query.name as string) || '';
      if (!companyName) {
        return res.status(400).json({ error: "Parámetro 'name' requerido" });
      }
      const { companies, invoices: invoicesTable } = await import('@shared/schema');
      const { ilike, eq } = await import('drizzle-orm');
      const db = (await import('../db')).db;

      const matchingCompanies = await db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(ilike(companies.name, `%${companyName}%`))
        .limit(5);

      if (!matchingCompanies.length) {
        return res.json({ companies: [], invoices: [] });
      }

      const results = [];
      for (const co of matchingCompanies) {
        const invs = await storage.getInvoicesByCompany(co.id);
        results.push({ company: co, invoices: invs.map(i => ({ id: i.id, invoiceNumber: i.invoiceNumber, total: i.total, status: i.status, issueDate: i.issueDate })) });
      }
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PATCH /api/billing/admin/fix-invoice-amount
   * TEMPORAL: Corrige el monto de una factura (para facturas con precio incorrecto del plan base)
   * Solo superadmin. Eliminar después de usar.
   */

  /**
   * POST /api/billing/admin/test-worker-email
   * TEMPORAL: Envía un correo de prueba del template de bienvenida al trabajador.
   */
  app.post("/api/billing/admin/test-worker-email", requireSuperadmin, async (req, res) => {
    try {
      const { to } = req.body;
      if (!to) return res.status(400).json({ error: "Requiere campo 'to' (email destino)" });
      const { sendPortalAccessEmail } = await import('../email');
      const result = await sendPortalAccessEmail(to, {
        workerName: 'Laurent',
        username: 'laurent',
        temporaryPassword: 'jZfWDkfXR3dLFhDP',
        companyName: 'Mi Comida S.A.S.',
        loginUrl: 'https://sst.sagisas.co/login',
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/billing/admin/fix-invoice-amount", requireSuperadmin, async (req, res) => {
    try {
      const { invoiceId, correctAmountCOP } = req.body;
      if (!invoiceId || !correctAmountCOP || typeof correctAmountCOP !== 'number') {
        return res.status(400).json({ error: "Requiere invoiceId y correctAmountCOP (número)" });
      }

      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Factura no encontrada" });
      }

      const taxRate = 0.19;
      const newSubtotal = Math.round(correctAmountCOP / (1 + taxRate));
      const newTaxAmount = correctAmountCOP - newSubtotal;

      await storage.updateInvoice(invoiceId, {
        total: correctAmountCOP,
        subtotal: newSubtotal,
        taxAmount: newTaxAmount,
      });

      return res.json({
        ok: true,
        invoiceId,
        before: { total: invoice.total, subtotal: invoice.subtotal, taxAmount: invoice.taxAmount },
        after: { total: correctAmountCOP, subtotal: newSubtotal, taxAmount: newTaxAmount },
      });
    } catch (error: any) {
      console.error('Error fixing invoice amount:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
