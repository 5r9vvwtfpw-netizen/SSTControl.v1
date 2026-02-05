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

/**
 * Notifica a la landing page (sst-colombia.com.co) cuando un cupón es redimido
 * Implementa: SST-COLOMBIA-AGENT-INSTRUCTIONS2 - Sección 3
 */
async function notifyCouponRedeemed(couponCode: string, companyId: string): Promise<void> {
  const webhookUrl = process.env.LANDING_PAGE_WEBHOOK_URL || 'https://sst-colombia.com.co/api/webhooks/coupon-redeemed';
  const webhookSecret = process.env.LANDING_PAGE_API_KEY;
  
  if (!webhookSecret) {
    logger.warn({ couponCode, companyId }, '[Coupon-Webhook] No LANDING_PAGE_API_KEY configured, skipping notification');
    return;
  }
  
  try {
    const response = await fetch(webhookUrl, {
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
    
    if (response.ok) {
      logger.info({ couponCode, companyId }, '[Coupon-Webhook] Landing page notified of coupon redemption');
    } else {
      logger.warn({ 
        couponCode, 
        companyId, 
        status: response.status,
        statusText: response.statusText 
      }, '[Coupon-Webhook] Failed to notify landing page');
    }
  } catch (error: any) {
    // No bloquear el flujo principal si falla la notificación
    logger.error({ err: error, couponCode, companyId }, '[Coupon-Webhook] Error notifying landing page');
  }
}

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

      // Use APP_URL for production, fallback to REPLIT_DOMAINS for development
      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = process.env.APP_URL || (replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000');

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
   * SEGURIDAD: Verifica el JWT server-side antes de usar los precios
   * Implementa: COP como moneda (Problema 2), cupones/descuentos (Problema 3)
   */
  app.post("/api/stripe/create-quote-checkout", subscriptionMutationLimiter, requireAuth, async (req, res) => {
    try {
      const quoteCheckoutSchema = z.object({
        // JWT token de la landing page (REQUERIDO para verificación server-side)
        quoteToken: z.string().min(1, "Token de cotización requerido"),
        // URLs opcionales
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

      // ========================================
      // VERIFICAR JWT SERVER-SIDE (Seguridad)
      // Usa el plugin landing-page-integration para verificación
      // ========================================
      let quoteData: import('../../plugins/landing-page-integration').QuotePayload;
      try {
        const { getRawQuotePayload } = await import('../../plugins/landing-page-integration');
        quoteData = getRawQuotePayload(validatedData.quoteToken);
      } catch (jwtError: any) {
        logger.warn({ 
          companyId, 
          reason: jwtError.message 
        }, 'Invalid or expired quote token for checkout');
        return res.status(400).json({ 
          error: "Cotización inválida o expirada", 
          details: jwtError.message 
        });
      }

      // Extraer datos del JWT verificado (NO confiar en datos del cliente)
      // El JWT tiene estructura: { sub_data, metadata, referral }
      let baseMonthlyPrice = quoteData.sub_data.base_monthly_price || 0;
      let currentPeriodPrice = quoteData.sub_data.current_period_price || 0;
      const discountDurationMonths = quoteData.sub_data.discount_duration_months || 0;
      const couponCode = quoteData.metadata.coupon_code;
      const referrerId = quoteData.referral?.referrer_id || null;
      const employees = quoteData.metadata.employees;

      // LOGGING: Ver qué valores llegan del JWT para debug
      logger.info({
        companyId,
        baseMonthlyPrice,
        currentPeriodPrice,
        discountDurationMonths,
        couponCode,
        employees
      }, '[Quote-Checkout] JWT prices received');

      // VALIDACIÓN: Los precios en COP deben ser razonables
      // Precio mínimo de suscripción SST es ~116,000 COP
      // Si el precio es < 50,000, probablemente vino dividido por 1000 (landing page bug)
      // Si el precio está entre 50,000 y 116,000, probablemente vino dividido por 10
      const MIN_VALID_PRICE_COP = 100000; // $100,000 COP - umbral para detectar formato incorrecto
      const MIN_SUBSCRIPTION_PRICE = 116000; // $116,000 COP (base mínimo del sistema)
      
      // Detectar si el precio vino en formato incorrecto (dividido por 1000)
      // Ejemplo: 1160 en lugar de 1,160,000
      if (baseMonthlyPrice > 0 && baseMonthlyPrice < MIN_VALID_PRICE_COP) {
        logger.warn({
          companyId,
          receivedPrice: baseMonthlyPrice,
          correctedPrice: baseMonthlyPrice * 1000
        }, '[Quote-Checkout] Price suspiciously low (< 100k COP), likely divided by 1000. Correcting...');
        
        // Multiplicar por 1000 para corregir el formato
        baseMonthlyPrice = baseMonthlyPrice * 1000;
        if (currentPeriodPrice > 0) {
          currentPeriodPrice = currentPeriodPrice * 1000;
        }
      }

      // Validación secundaria: si después de corregir sigue bajo el mínimo, forzar mínimo
      if (baseMonthlyPrice > 0 && baseMonthlyPrice < MIN_SUBSCRIPTION_PRICE) {
        logger.warn({
          companyId,
          receivedPrice: baseMonthlyPrice,
          enforcedMinimum: MIN_SUBSCRIPTION_PRICE
        }, '[Quote-Checkout] Price below system minimum, enforcing minimum');
        
        baseMonthlyPrice = MIN_SUBSCRIPTION_PRICE;
      }

      logger.info({
        companyId,
        finalBasePrice: baseMonthlyPrice,
        finalCurrentPrice: currentPeriodPrice
      }, '[Quote-Checkout] Final prices after validation');

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }
      
      // Obtener o crear cliente Stripe
      const customer = await stripeService.findOrCreateCustomer({
        email: user.email || '',
        name: company.name || user.fullName || user.username,
        companyId
      });

      // Use APP_URL for production, fallback to REPLIT_DOMAINS for development
      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = process.env.APP_URL || (replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000');

      // Metadata para auditoría
      const metadata: Record<string, string> = {
        companyId,
        userId: user.id.toString(),
        source: 'landing_page_jwt_verified',
        baseMonthlyPriceCOP: baseMonthlyPrice.toString(),
        agreedPriceCOP: currentPeriodPrice.toString(),
        discountMonths: discountDurationMonths.toString(),
        couponCode: couponCode || 'none',
        referrerId: referrerId || 'none',
        jwtVerified: 'true'
      };

      if (validatedData.contractAccepted) {
        metadata.contractAccepted = 'true';
        metadata.contractAcceptedAt = validatedData.contractAcceptedAt || new Date().toISOString();
      }

      // ========================================
      // LÓGICA DE DESCUENTO (Problema 3)
      // ========================================
      const isFullDiscount = currentPeriodPrice === 0;
      const hasPartialDiscount = currentPeriodPrice > 0 && currentPeriodPrice < baseMonthlyPrice;

      // NOTA: COP es moneda de cero decimales en Stripe, NO multiplicar por 100
      let priceToCharge = hasPartialDiscount ? currentPeriodPrice : baseMonthlyPrice;
      
      // VALIDACIÓN: El precio a cobrar debe cumplir con el mínimo de Stripe
      // Stripe requiere ~€0.50 mínimo, que en COP es aproximadamente 2,500 COP
      // Usamos 5,000 COP como mínimo de seguridad (margen para fluctuaciones de cambio)
      const STRIPE_MIN_CHARGE_COP = 5000; // $5,000 COP mínimo para Stripe (~€1.15)
      
      // Si el precio con descuento es muy bajo pero mayor que 0, tenemos opciones:
      // 1. Si es menos del 10% del mínimo del sistema, convertir a trial (gratis primer mes)
      // 2. Si está entre 10% y 100% del mínimo, aplicar el mínimo de Stripe
      if (hasPartialDiscount && priceToCharge > 0 && priceToCharge < STRIPE_MIN_CHARGE_COP) {
        // El descuento resulta en un precio muy bajo - convertir a trial
        logger.warn({
          companyId,
          originalPrice: priceToCharge,
          threshold: STRIPE_MIN_CHARGE_COP,
          action: 'converting_to_trial'
        }, '[Quote-Checkout] Discounted price too low for Stripe, converting to 30-day trial');
        
        // Convertir a descuento del 100% (trial)
        priceToCharge = 0;
      }
      const productName = `SST Colombia - ${company.name} (${employees || 'N/A'} empleados)`;

      // Preparar metadata de suscripción
      const subscriptionMetadata: Record<string, string> = {
        coupon_code: couponCode || 'none',
        original_price_cop: baseMonthlyPrice.toString(),
        source: 'landing_jwt_verified'
      };

      if (hasPartialDiscount) {
        subscriptionMetadata.discounted_price_cop = currentPeriodPrice.toString();
        subscriptionMetadata.discount_ends_after_months = discountDurationMonths.toString();
      }

      let session;
      
      // Determinar si es efectivamente gratis (100% descuento o precio muy bajo convertido a trial)
      const effectivelyFree = priceToCharge === 0;
      
      // Opción A: 100% descuento (o convertido a trial) = Trial period (30 días gratis)
      if (effectivelyFree) {
        logger.info({ 
          companyId, 
          couponCode,
          trialDays: 30,
          originallyFree: isFullDiscount,
          convertedToTrial: !isFullDiscount && priceToCharge === 0,
          jwtVerified: true
        }, 'Creating checkout with 100% discount (trial period)');

        session = await stripeService.createDynamicCheckoutSession({
          customerId: customer.id,
          currency: 'cop',
          productName,
          productDescription: 'Suscripción mensual SST Colombia - Primer mes gratis',
          unitAmount: baseMonthlyPrice,
          successUrl: validatedData.successUrl || `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: validatedData.cancelUrl || `${baseUrl}/mi-suscripcion?payment=cancelled`,
          metadata,
          subscriptionMetadata,
          trialPeriodDays: 30
        });
      }
      // Opción B: Descuento parcial o sin descuento
      else {
        logger.info({ 
          companyId, 
          couponCode,
          priceApplied: priceToCharge,
          hasDiscount: hasPartialDiscount,
          jwtVerified: true
        }, 'Creating checkout with JWT-verified price');

        session = await stripeService.createDynamicCheckoutSession({
          customerId: customer.id,
          currency: 'cop',
          productName,
          productDescription: hasPartialDiscount 
            ? `Suscripción mensual SST Colombia - Precio promocional por ${discountDurationMonths} mes(es)`
            : 'Suscripción mensual SST Colombia',
          unitAmount: priceToCharge,
          successUrl: validatedData.successUrl || `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: validatedData.cancelUrl || `${baseUrl}/mi-suscripcion?payment=cancelled`,
          metadata,
          subscriptionMetadata
        });
      }

      logger.info({ 
        sessionId: session.sessionId, 
        companyId,
        customerId: customer.id,
        currency: 'COP',
        appliedDiscount: isFullDiscount ? '100%' : hasPartialDiscount ? 'partial' : 'none',
        jwtVerified: true
      }, 'Quote-based Stripe checkout session created (JWT verified)');

      res.json({
        sessionId: session.sessionId,
        url: session.url,
        currency: 'COP',
        priceApplied: isFullDiscount ? 0 : priceToCharge,
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

      // Use APP_URL for production, fallback to REPLIT_DOMAINS for development
      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = process.env.APP_URL || (replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000');

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

      // Use APP_URL for production, fallback to REPLIT_DOMAINS for development
      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = process.env.APP_URL || (replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : 'http://localhost:5000');

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
