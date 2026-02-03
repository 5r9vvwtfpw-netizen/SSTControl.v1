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

  /**
   * POST /api/stripe/create-quote-checkout
   * Crea un checkout dinámico usando datos del JWT quote de la landing page
   * Implementa: COP como moneda (Problema 2), cupones/descuentos (Problema 3)
   * 
   * REGLA CRÍTICA: Confiar en current_period_price como "Precio Acordado"
   * NO recalcular precios - los datos vienen firmados del JWT
   */
  app.post("/api/stripe/create-quote-checkout", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const quoteCheckoutSchema = z.object({
        // Datos de facturación del JWT
        baseMonthlyPrice: z.number().min(0),
        currentPeriodPrice: z.number().min(0),
        discountDurationMonths: z.number().min(0).max(24).default(0),
        currency: z.string().default("COP"),
        couponCode: z.string().nullable().optional(),
        referrerId: z.string().nullable().optional(),
        // Datos adicionales
        employees: z.number().min(1).optional(),
        successUrl: z.string().url().optional(),
        cancelUrl: z.string().url().optional(),
        // Contract acceptance
        contractAccepted: z.boolean().optional(),
        contractAcceptedAt: z.string().nullable().optional()
      });

      const validatedData = quoteCheckoutSchema.parse(req.body);
      const user = req.user!;
      const companyId = user.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      const stripe = await stripeService['getClient']();
      
      // Obtener o crear cliente
      const customer = await stripeService.findOrCreateCustomer({
        email: user.email || '',
        name: company.name || user.fullName || user.username,
        companyId
      });

      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000';

      // Metadata para auditoría
      const metadata: Record<string, string> = {
        companyId,
        userId: user.id.toString(),
        source: 'landing_page_jwt',
        baseMonthlyPriceCOP: validatedData.baseMonthlyPrice.toString(),
        agreedPriceCOP: validatedData.currentPeriodPrice.toString(),
        discountMonths: validatedData.discountDurationMonths.toString(),
        couponCode: validatedData.couponCode || 'none',
        referrerId: validatedData.referrerId || 'none'
      };

      if (validatedData.contractAccepted) {
        metadata.contractAccepted = 'true';
        metadata.contractAcceptedAt = validatedData.contractAcceptedAt || new Date().toISOString();
      }

      // ========================================
      // LÓGICA DE DESCUENTO (Problema 3)
      // ========================================
      const isFullDiscount = validatedData.currentPeriodPrice === 0;
      const hasPartialDiscount = validatedData.currentPeriodPrice > 0 && 
                                  validatedData.currentPeriodPrice < validatedData.baseMonthlyPrice;

      // Determinar precio a usar
      // NOTA: COP es moneda de cero decimales en Stripe, NO multiplicar por 100
      const priceInCOP = validatedData.baseMonthlyPrice;

      // Crear producto dinámico para esta suscripción
      const productName = `SST Colombia - ${company.name} (${validatedData.employees || 'N/A'} empleados)`;
      
      let sessionParams: any = {
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        success_url: validatedData.successUrl || `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: validatedData.cancelUrl || `${baseUrl}/mi-suscripcion?payment=cancelled`,
        metadata,
        locale: 'es'
      };

      // Opción A: 100% descuento = Trial period (primer mes gratis)
      if (isFullDiscount) {
        logger.info({ 
          companyId, 
          couponCode: validatedData.couponCode,
          trialDays: 30 
        }, 'Creating checkout with 100% discount (trial period)');

        sessionParams.line_items = [{
          price_data: {
            currency: 'cop',
            product_data: {
              name: productName,
              description: `Suscripción mensual SST Colombia - Nivel de riesgo incluido`
            },
            unit_amount: priceInCOP, // COP sin decimales
            recurring: { interval: 'month' }
          },
          quantity: 1
        }];
        sessionParams.subscription_data = {
          trial_period_days: 30,
          metadata: {
            coupon_code: validatedData.couponCode || 'TRIAL_100_OFF',
            original_price_cop: validatedData.baseMonthlyPrice.toString(),
            source: 'landing_jwt'
          }
        };
      }
      // Opción B: Descuento parcial - usar precio acordado
      else if (hasPartialDiscount) {
        logger.info({ 
          companyId, 
          couponCode: validatedData.couponCode,
          discountedPrice: validatedData.currentPeriodPrice,
          regularPrice: validatedData.baseMonthlyPrice,
          discountMonths: validatedData.discountDurationMonths
        }, 'Creating checkout with partial discount');

        // Para descuentos parciales, usamos el precio con descuento directamente
        // El webhook debe manejar la transición al precio regular después de N meses
        sessionParams.line_items = [{
          price_data: {
            currency: 'cop',
            product_data: {
              name: productName,
              description: `Suscripción mensual SST Colombia - Precio promocional por ${validatedData.discountDurationMonths} mes(es)`
            },
            unit_amount: validatedData.currentPeriodPrice, // Precio acordado con descuento
            recurring: { interval: 'month' }
          },
          quantity: 1
        }];
        sessionParams.subscription_data = {
          metadata: {
            coupon_code: validatedData.couponCode || 'PARTIAL_DISCOUNT',
            original_price_cop: validatedData.baseMonthlyPrice.toString(),
            discounted_price_cop: validatedData.currentPeriodPrice.toString(),
            discount_ends_after_months: validatedData.discountDurationMonths.toString(),
            source: 'landing_jwt'
          }
        };
      }
      // Sin descuento - precio completo
      else {
        logger.info({ 
          companyId, 
          price: validatedData.baseMonthlyPrice 
        }, 'Creating checkout with full price');

        sessionParams.line_items = [{
          price_data: {
            currency: 'cop',
            product_data: {
              name: productName,
              description: `Suscripción mensual SST Colombia`
            },
            unit_amount: priceInCOP,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      logger.info({ 
        sessionId: session.id, 
        companyId,
        customerId: customer.id,
        currency: 'COP',
        appliedDiscount: isFullDiscount ? '100%' : hasPartialDiscount ? 'partial' : 'none'
      }, 'Quote-based Stripe checkout session created');

      res.json({
        sessionId: session.id,
        url: session.url,
        currency: 'COP',
        priceApplied: isFullDiscount ? 0 : (hasPartialDiscount ? validatedData.currentPeriodPrice : validatedData.baseMonthlyPrice),
        discountApplied: isFullDiscount || hasPartialDiscount
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      logger.error({ err: error }, 'Error creating quote-based Stripe checkout session');
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

  // ==========================================
  // USUARIO ADICIONAL - Checkout para asientos extra por rol
  // ==========================================
  // Precio fijo: $10,000 COP/mes por usuario adicional del mismo rol
  const EXTRA_SEAT_PRICE_COP = 10000;
  
  app.post("/api/stripe/create-extra-seat-checkout", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const extraSeatSchema = z.object({
        role: z.string().min(1, "Rol es requerido"),
        successUrl: z.string().url().optional(),
        cancelUrl: z.string().url().optional()
      });

      const validatedData = extraSeatSchema.parse(req.body);
      const user = req.user!;
      const companyId = user.companyId;

      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      // Verificar que la empresa tenga suscripción activa
      const subscription = await storage.getSubscriptionByCompany(companyId);
      if (!subscription || !['active', 'trial'].includes(subscription.status)) {
        return res.status(403).json({ 
          error: "Se requiere suscripción activa",
          message: "Debes tener una suscripción activa para agregar usuarios adicionales."
        });
      }

      // Obtener o crear cliente de Stripe
      const customer = await stripeService.findOrCreateCustomer({
        email: user.email || '',
        name: company.name || user.fullName || user.username,
        companyId
      });

      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000';

      // Metadata para procesar en webhook
      const metadata: Record<string, string> = {
        companyId,
        userId: user.id.toString(),
        purchaseType: 'extra_seat',
        role: validatedData.role,
        pricePerSeatCop: EXTRA_SEAT_PRICE_COP.toString()
      };

      // Crear sesión de checkout usando el método de precio dinámico
      const session = await stripeService.createExtraSeatCheckoutSession({
        customerId: customer.id,
        role: validatedData.role,
        priceAmountCop: EXTRA_SEAT_PRICE_COP,
        successUrl: validatedData.successUrl || `${baseUrl}/usuarios?extra_seat_success=true&role=${validatedData.role}`,
        cancelUrl: validatedData.cancelUrl || `${baseUrl}/usuarios?extra_seat_canceled=true`,
        metadata
      });

      logger.info({ 
        sessionId: session.sessionId, 
        companyId,
        role: validatedData.role,
        pricePerSeatCop: EXTRA_SEAT_PRICE_COP
      }, 'Extra seat checkout session created');

      res.json({
        sessionId: session.sessionId,
        url: session.url,
        role: validatedData.role,
        pricePerSeatCop: EXTRA_SEAT_PRICE_COP
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      logger.error({ err: error }, 'Error creating extra seat checkout session');
      res.status(500).json({ error: "Error al crear sesión de pago para usuario adicional" });
    }
  });

  // Endpoint para obtener asientos extra por empresa
  app.get("/api/company-extra-seats", requireAuth, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }

      const extraSeats = await storage.getCompanyExtraSeats(companyId);
      res.json(extraSeats);
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching company extra seats');
      res.status(500).json({ error: "Error al obtener asientos adicionales" });
    }
  });
}
