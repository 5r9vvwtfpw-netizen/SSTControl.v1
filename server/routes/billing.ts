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
import { getCompanyFeatures } from "../middleware/subscription-limits";
import { getUncachableStripeClient } from "../stripeClient";
import { billingHealthCheck } from "../lib/billing-validator";

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
      // Zod validation (Architect feedback)
      const trialRequestSchema = z.object({
        planId: z.string().min(1, "Plan ID es requerido"),
        trialDays: z.number().refine(
          (val) => [7, 14, 30].includes(val),
          "Trial debe ser de 7, 14 o 30 días"
        )
      });

      const validatedData = trialRequestSchema.parse(req.body);

      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      // Verificar que el plan existe
      const plan = await storage.getSubscriptionPlan(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan no encontrado" });
      }

      // Anti-abuse validation now handled at storage layer (checks ANY subscription)
      const trialSubscription = await storage.createTrialSubscription(
        companyId,
        validatedData.planId,
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
        companyId: z.string().uuid("Company ID inválido"),
        planId: z.string().uuid("Plan ID inválido"),
        trialDays: z.number().refine(
          (val) => [7, 14, 30].includes(val),
          "Trial debe ser de 7, 14 o 30 días"
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
        action: 'admin_assign_trial',
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
   * Obtener cotización de cambio de plan sin ejecutarlo
   */
  app.get("/api/billing/subscription/:id/change-plan/quote", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const subscriptionId = req.params.id;
      const newPlanId = req.query.newPlanId as string;
      const companyId = req.user!.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      if (!newPlanId) {
        return res.status(400).json({ error: "newPlanId es requerido" });
      }

      // Verify subscription ownership
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription || subscription.companyId !== companyId) {
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }

      // Get quote without executing the change
      const quote = await storage.quotePlanChange({
        subscriptionId,
        newPlanId,
        isAdminOverride: false
      });

      // Return quote details
      res.json({
        changeType: quote.changeType,
        requiresPayment: quote.requiresPayment,
        amountToCharge: quote.amountToCharge,
        creditFromOldPlan: quote.creditFromOldPlan || 0,
        chargeForNewPlan: quote.chargeForNewPlan || 0,
        currentPlan: {
          id: quote.oldPlan.id,
          name: quote.oldPlan.displayName,
          priceMonthly: quote.oldPlan.priceMonthly
        },
        newPlan: {
          id: quote.newPlan.id,
          name: quote.newPlan.displayName,
          priceMonthly: quote.newPlan.priceMonthly
        },
        validationErrors: quote.validationErrors,
        validationWarnings: quote.validationWarnings
      });
    } catch (error: any) {
      console.error('Error getting plan change quote:', error);
      res.status(500).json({ error: error.message || "Error al obtener cotización" });
    }
  });

  /**
   * POST /api/billing/subscription/:id/change-plan
   * Cambia el plan de una suscripción (upgrade/downgrade)
   * Bloque 4 - Tarea 8: Sistema de Upgrade/Downgrade con Proration
   * Permisos: admin (todas), coordinador_sst (su empresa)
   */
  app.post("/api/billing/subscription/:id/change-plan", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const subscriptionId = req.params.id;
      
      // Zod validation
      const planChangeRequestSchema = z.object({
        newPlanId: z.string().min(1, "Plan ID es requerido"),
        isAdminOverride: z.boolean().optional().default(false)
      });

      const validatedData = planChangeRequestSchema.parse(req.body);

      // Get subscription to verify ownership
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }

      // Check permissions: admin or owner company
      const isAdmin = req.user!.role === 'admin';
      const isOwner = req.user!.companyId === subscription.companyId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "No tiene permisos para modificar esta suscripción" });
      }

      // Admin override only allowed for actual admins
      if (validatedData.isAdminOverride && !isAdmin) {
        return res.status(403).json({ error: "Solo administradores pueden usar override" });
      }

      // Step 1: Quote plan change (validates + calculates WITHOUT mutating state)
      const quote = await storage.quotePlanChange({
        subscriptionId,
        newPlanId: validatedData.newPlanId,
        isAdminOverride: validatedData.isAdminOverride
      });

      // Block on validation errors
      if (quote.validationErrors.length > 0) {
        return res.status(400).json({ 
          error: quote.validationErrors.join('; '),
          warnings: quote.validationWarnings 
        });
      }

      // Step 2: If requires payment, create Stripe Checkout session
      if (quote.requiresPayment) {
        try {
          const stripe = await getUncachableStripeClient();
          
          // Get company info for metadata
          const company = await storage.getCompany(subscription.companyId);
          
          // Build Stripe Checkout session - use APP_URL for production
          const baseUrl = process.env.APP_URL || (process.env.REPLIT_DEV_DOMAIN 
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : process.env.REPLIT_DOMAINS 
              ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
              : 'http://localhost:5000');
          
          // Convert COP to USD cents
          const COP_TO_USD_RATE = 4000;
          const amountInUSDCents = Math.max(50, Math.round((quote.amountToCharge / COP_TO_USD_RATE) * 100));
          
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `Upgrade a ${quote.newPlan.displayName}`,
                    description: `Cambio de plan: ${quote.oldPlan.displayName} → ${quote.newPlan.displayName}`,
                  },
                  unit_amount: amountInUSDCents,
                },
                quantity: 1,
              },
            ],
            metadata: {
              type: 'plan_upgrade',
              subscriptionId: subscriptionId,
              oldPlanId: quote.oldPlan.id,
              newPlanId: quote.newPlan.id,
              companyId: subscription.companyId,
              companyName: company?.name || 'Unknown',
              userId: req.user!.id,
              amountToChargeCOP: quote.amountToCharge.toString(),
              amountToChargeUSD: amountInUSDCents.toString(),
              proratedCredit: quote.proratedCredit.toString(),
            },
            success_url: `${baseUrl}/mi-cuenta?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/mi-cuenta?upgrade=cancelled`,
            customer_email: req.user!.email || undefined,
          });
          
          return res.status(200).json({
            success: true,
            requiresPayment: true,
            changeType: quote.changeType,
            amountToCharge: quote.amountToCharge,
            paymentUrl: session.url,
            sessionId: session.id,
            message: 'Redirigiendo a pasarela de pago...',
            warnings: quote.validationWarnings
          });
        } catch (stripeError: any) {
          console.error('Stripe checkout session creation failed:', stripeError);
          return res.status(500).json({
            error: 'Error al crear sesión de pago: ' + (stripeError.message || 'Error desconocido'),
            requiresPayment: true,
            changeType: quote.changeType,
            amountToCharge: quote.amountToCharge,
          });
        }
      }

      // Step 3: Apply plan change for free changes (downgrades)
      const auditContext = getAuditContext(req);
      const result = await storage.applyPlanChange({
        subscriptionId,
        newPlanId: validatedData.newPlanId,
        requestedBy: req.user!.id,
        requestedByRole: req.user!.role,
        isAdminOverride: validatedData.isAdminOverride,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent
      });

      // Downgrade or free upgrade - applied immediately
      res.status(200).json({
        success: true,
        requiresPayment: false,
        changeType: quote.changeType,
        planChangeId: result.planChangeId,
        message: quote.changeType === 'downgrade' 
          ? 'Plan cambiado exitosamente. El crédito se aplicará en su próxima factura.'
          : 'Plan cambiado exitosamente.',
        warnings: quote.validationWarnings
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error changing subscription plan:', error);
      res.status(500).json({ error: error.message || "Error al cambiar plan" });
    }
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

      // Get subscription to verify ownership
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        console.log('[Billing] Subscription not found:', subscriptionId);
        return res.status(404).json({ error: "Suscripción no encontrada" });
      }
      console.log('[Billing] Found subscription:', subscription.id, 'planId:', subscription.planId);

      // Check permissions: admin or owner company
      const isAdmin = req.user!.role === 'admin';
      const isOwner = req.user!.companyId === subscription.companyId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "No tiene permisos para activar esta suscripción" });
      }

      // Get the current plan
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      if (!plan) {
        console.log('[Billing] Plan not found:', subscription.planId);
        return res.status(404).json({ error: "Plan de suscripción no encontrado" });
      }
      console.log('[Billing] Found plan:', plan.name, 'price:', plan.priceMonthly);

      // Get company info
      const company = await storage.getCompany(subscription.companyId);
      console.log('[Billing] Company:', company?.name);
      
      // Get Stripe client
      console.log('[Billing] Getting Stripe client...');
      const stripe = await getUncachableStripeClient();
      console.log('[Billing] Stripe client obtained');
      
      // Build Stripe Checkout session - use APP_URL for production
      const baseUrl = process.env.APP_URL || (process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : process.env.REPLIT_DOMAINS 
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : 'http://localhost:5000');
      
      // Calculate the amount - convert COP to USD cents
      // Rate: 1 USD ≈ 4000 COP (approximate)
      const COP_TO_USD_RATE = 4000;
      const amountInCOP = plan.priceMonthly;
      const amountInUSDCents = Math.max(50, Math.round((amountInCOP / COP_TO_USD_RATE) * 100)); // Minimum 50 cents
      
      console.log('[Billing] Creating Stripe session. Amount:', amountInUSDCents, 'cents USD, baseUrl:', baseUrl);
      
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Suscripción ${plan.displayName || plan.name}`,
                  description: `Plan ${plan.displayName || plan.name} - Primer mes`,
                },
                unit_amount: amountInUSDCents,
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
            amountChargedUSD: amountInUSDCents.toString(),
          },
          success_url: `${baseUrl}/mi-cuenta?activation=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/mi-cuenta?activation=cancelled`,
          customer_email: req.user!.email || undefined,
        });
        
        console.log('[Billing] Stripe session created successfully:', session.id, 'URL:', session.url);
        
        return res.status(200).json({
          success: true,
          paymentUrl: session.url,
          sessionId: session.id,
          amount: amountInUSDCents,
          amountCOP: amountInCOP,
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

      // Get plan details
      const plan = await storage.getSubscriptionPlan(subscription.planId);
      
      // Get plan change history
      const changeHistory = await storage.getPlanChangeHistory(subscription.id);

      res.json({
        subscription,
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
      const invoiceId = parseInt(req.params.id);
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

      if (!company || !subscription || !plan) {
        return res.status(500).json({ error: "Datos incompletos para generar factura" });
      }

      // Re-generate PDF
      const pdfBuffer = await invoicePdfService.generateInvoicePdf({
        invoice,
        company,
        subscription,
        plan
      });

      // Send PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Factura-${invoice.invoiceNumber}.pdf"`);
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
}
