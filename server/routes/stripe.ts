import type { Express } from "express";
import { requireAuth, requirePermission } from "../auth";
import { storage } from "../storage";
import { stripeService } from "../services/stripe";
import { emailService } from "../services/email";
import { getStripePublishableKey } from "../stripeClient";
import { z } from "zod";
import logger from "../lib/logger";
import {
  billingRateLimiter,
  subscriptionMutationLimiter
} from "../middleware/rate-limit";

export function registerStripeRoutes(app: Express) {
  
  app.get("/api/stripe/products", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const products = await stripeService.listProducts();
      const prices = await stripeService.listPrices();
      
      const productsWithPrices = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        prices: prices
          .filter(price => 
            (typeof price.product === 'string' ? price.product : price.product.id) === product.id
          )
          .map(price => ({
            id: price.id,
            unitAmount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval,
            nickname: price.nickname
          }))
      }));

      res.json(productsWithPrices);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching Stripe products');
      res.status(500).json({ error: "Error al obtener productos" });
    }
  });

  app.get("/api/stripe/plans-mapping", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      const products = await stripeService.listProducts();
      const prices = await stripeService.listPrices();

      const plansWithStripe = plans.map(plan => {
        const stripeProduct = products.find(p => 
          p.metadata?.sstPlanId === plan.id || 
          p.metadata?.plan_name === plan.name
        );
        
        if (!stripeProduct) {
          return {
            ...plan,
            stripeProductId: null,
            stripePriceIdMonthly: null,
            stripePriceIdYearly: null
          };
        }

        const productPrices = prices.filter(price => {
          const productId = typeof price.product === 'string' ? price.product : price.product.id;
          return productId === stripeProduct.id;
        });

        const monthlyPrice = productPrices.find(p => p.recurring?.interval === 'month');
        const yearlyPrice = productPrices.find(p => p.recurring?.interval === 'year');

        return {
          ...plan,
          stripeProductId: stripeProduct.id,
          stripePriceIdMonthly: monthlyPrice?.id || null,
          stripePriceIdYearly: yearlyPrice?.id || null
        };
      });

      res.json(plansWithStripe);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching plans mapping');
      res.status(500).json({ error: "Error al obtener mapeo de planes" });
    }
  });

  app.post("/api/stripe/create-checkout-session", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const checkoutSchema = z.object({
        priceId: z.string().min(1, "Price ID es requerido"),
        successUrl: z.string().url().optional(),
        cancelUrl: z.string().url().optional(),
        trialDays: z.number().min(0).max(90).optional(),
        // Número de trabajadores que el cliente está comprando (mínimo 2 para Microempresa)
        workersPurchased: z.number().min(1).max(1000).optional(),
        // Contract acceptance data (Ley 527/1999)
        contractAccepted: z.boolean().optional(),
        contractAcceptedAt: z.string().nullable().optional(),
        contractData: z.object({
          acceptedTerms: z.boolean(),
          acceptedDataTreatment: z.boolean(),
          acceptedAutoRenewal: z.boolean(),
          planName: z.string()
        }).nullable().optional()
      });

      const validatedData = checkoutSchema.parse(req.body);

      const user = req.user!;
      const companyId = user.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      // Validar que workersPurchased no sea menor que los trabajadores activos actuales
      if (validatedData.workersPurchased) {
        const currentWorkers = await storage.getWorkers(companyId);
        const activeWorkers = currentWorkers.filter((w: any) => 
          w.status === 'activo' || w.status === 'inactivo'
        );
        
        if (validatedData.workersPurchased < activeWorkers.length) {
          return res.status(400).json({ 
            error: "Cantidad insuficiente de licencias",
            message: `Tu empresa ya tiene ${activeWorkers.length} trabajadores registrados. Debes comprar al menos ${activeWorkers.length} licencias para continuar.`,
            currentWorkers: activeWorkers.length,
            requested: validatedData.workersPurchased
          });
        }
      }

      const customer = await stripeService.findOrCreateCustomer({
        email: user.email || '',
        name: company.name || user.fullName || user.username,
        companyId
      });

      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000';

      // Build metadata with contract data if present
      const metadata: Record<string, string> = {
        companyId,
        userId: user.id.toString()
      };
      
      // Include workersPurchased in metadata for worker limit enforcement
      if (validatedData.workersPurchased) {
        metadata.workersPurchased = validatedData.workersPurchased.toString();
      }
      
      // Include contract data in metadata to be processed by webhook (Ley 527/1999)
      if (validatedData.contractAccepted) {
        metadata.contractAccepted = 'true';
        metadata.contractAcceptedAt = validatedData.contractAcceptedAt || new Date().toISOString();
        metadata.contractTermsVersion = '1.0';
        metadata.contractData = JSON.stringify(validatedData.contractData);
      }

      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        priceId: validatedData.priceId,
        successUrl: validatedData.successUrl || `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: validatedData.cancelUrl || `${baseUrl}/billing?canceled=true`,
        trialPeriodDays: validatedData.trialDays,
        metadata
      });

      logger.info({ 
        sessionId: session.sessionId, 
        companyId,
        customerId: customer.id,
        contractAccepted: validatedData.contractAccepted 
      }, 'Stripe checkout session created');

      res.json({
        sessionId: session.sessionId,
        url: session.url
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      logger.error({ err: error }, 'Error creating Stripe checkout session');
      res.status(500).json({ error: "Error al crear sesión de checkout" });
    }
  });

  app.post("/api/stripe/create-portal-session", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const portalSchema = z.object({
        returnUrl: z.string().url().optional()
      });

      const validatedData = portalSchema.parse(req.body);

      const user = req.user!;
      const companyId = user.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const customer = await stripeService.findOrCreateCustomer({
        email: user.email || '',
        companyId
      });

      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000';

      const url = await stripeService.createBillingPortalSession({
        customerId: customer.id,
        returnUrl: validatedData.returnUrl || `${baseUrl}/billing`
      });

      res.json({ url });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      logger.error({ err: error }, 'Error creating Stripe portal session');
      res.status(500).json({ error: "Error al crear sesión del portal" });
    }
  });

  app.get("/api/stripe/subscription", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const companyId = req.user!.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const subscription = await storage.getSubscriptionByCompany(companyId);
      
      if (!subscription) {
        return res.status(200).json(null);
      }

      const metadata = subscription.metadata as Record<string, any> | null;
      const stripeSubscriptionId = metadata?.stripeSubscriptionId;

      if (stripeSubscriptionId) {
        const stripeSubscription = await stripeService.getSubscription(stripeSubscriptionId);
        
        return res.json({
          ...subscription,
          stripeDetails: stripeSubscription
        });
      }

      res.json(subscription);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching Stripe subscription');
      res.status(500).json({ error: "Error al obtener suscripción" });
    }
  });

  app.post("/api/stripe/cancel-subscription", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const cancelSchema = z.object({
        immediately: z.boolean().optional().default(false)
      });

      const validatedData = cancelSchema.parse(req.body);

      const companyId = req.user!.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const subscription = await storage.getSubscriptionByCompany(companyId);
      
      if (!subscription) {
        return res.status(404).json({ error: "No hay suscripción activa" });
      }

      const metadata = subscription.metadata as Record<string, any> | null;
      const stripeSubscriptionId = metadata?.stripeSubscriptionId;

      if (!stripeSubscriptionId) {
        return res.status(400).json({ error: "La suscripción no tiene ID de Stripe" });
      }

      const canceledSubscription = await stripeService.cancelSubscription(
        stripeSubscriptionId,
        validatedData.immediately
      );

      await storage.updateSubscription(subscription.id, {
        status: validatedData.immediately ? 'canceled' : 'active',
        cancelAtPeriodEnd: validatedData.immediately ? 0 : 1,
        canceledAt: new Date()
      });

      logger.info({ 
        subscriptionId: subscription.id, 
        stripeSubscriptionId,
        immediately: validatedData.immediately 
      }, 'Subscription cancelled');

      res.json({
        message: validatedData.immediately 
          ? "Suscripción cancelada inmediatamente"
          : "Suscripción se cancelará al final del período",
        subscription: canceledSubscription
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      logger.error({ err: error }, 'Error canceling subscription');
      res.status(500).json({ error: "Error al cancelar suscripción" });
    }
  });

  app.get("/api/stripe/invoices", billingRateLimiter, requireAuth, async (req, res) => {
    try {
      const companyId = req.user!.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const customer = await stripeService.findOrCreateCustomer({
        email: req.user!.email || '',
        companyId
      });

      const invoices = await stripeService.listInvoices(customer.id);

      res.json(invoices);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching invoices');
      res.status(500).json({ error: "Error al obtener facturas" });
    }
  });

  app.get("/api/stripe/config", requireAuth, async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      logger.warn({ err: error }, 'Stripe config not available');
      res.json({ publishableKey: '' });
    }
  });
}
