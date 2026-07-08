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
function getEffectiveCompanyId(req: any): string | null {
  const globalRoles = ['superadmin', 'lso', 'lso_externo'];
  if (globalRoles.includes(req.user?.role)) {
    const headerCompanyId = req.headers['x-company-id'] as string | undefined;
    const queryCompanyId = req.query?.companyId as string | undefined;
    if (headerCompanyId) return headerCompanyId;
    if (queryCompanyId) return queryCompanyId;
  }
  return req.user?.companyId || null;
}

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

      // CONFIAMOS EN EL JWT: La landing page calcula el precio exacto
      // Solo validamos que no sea un valor absurdamente bajo (posible error)
      const STRIPE_MIN_COP = 2000; // ~$0.50 USD - mínimo técnico de Stripe
      
      if (baseMonthlyPrice > 0 && baseMonthlyPrice < STRIPE_MIN_COP) {
        logger.error({
          companyId,
          receivedPrice: baseMonthlyPrice,
          minimumRequired: STRIPE_MIN_COP
        }, '[Quote-Checkout] Price too low for Stripe minimum');
        
        return res.status(400).json({ 
          error: "El precio de la cotización es demasiado bajo para procesar",
          details: `Mínimo requerido: ${STRIPE_MIN_COP} COP`
        });
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
          unitAmount: Math.round(baseMonthlyPrice * 100),
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
          unitAmount: Math.round(priceToCharge * 100),
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
      const companyId = getEffectiveCompanyId(req);

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

      const companyId = getEffectiveCompanyId(req);

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
      const companyId = getEffectiveCompanyId(req);

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
      const companyId = getEffectiveCompanyId(req);
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
