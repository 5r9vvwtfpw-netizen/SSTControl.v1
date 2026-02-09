/**
 * Rutas API para Checkout Dinámico - Stripe
 * 
 * El precio SIEMPRE viene de la cotización de la landing page (JWT),
 * almacenado en la tabla companies (quoteBaseMonthlyPrice, quoteCurrentPeriodPrice).
 * NO se recalcula en el sistema.
 * 
 * Endpoints:
 * - POST /api/pricing-v2/create-checkout-v2 - Crear sesión de checkout con precio de la cotización
 */

import { Router, Request, Response } from "express";
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { companies } from "../shared/schema";
import { getUncachableStripeClient } from "../server/stripeClient";
import { pricingPluginSubscriptions } from "./schema";
import logger from "../server/lib/logger";

const router = Router();

router.post("/create-checkout-v2", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      companyId: z.string().min(1),
      customerEmail: z.string().email(),
      customerName: z.string().min(2),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { companyId, customerEmail, customerName, successUrl, cancelUrl } = parsed.data;

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const quoteBase = (company as any).quoteBaseMonthlyPrice as number | null;
    const quoteCurrent = (company as any).quoteCurrentPeriodPrice as number | null;
    const quoteCoupon = (company as any).quoteCouponCode as string | null;

    if (!quoteBase || quoteBase <= 0) {
      return res.status(400).json({ 
        error: "Esta empresa no tiene una cotización de precio. Debe obtener una cotización desde la página de inicio (sst-colombia.com.co) antes de proceder al pago."
      });
    }

    const monthlyPrice = quoteCurrent != null && quoteCurrent > 0 ? quoteCurrent : quoteBase;

    logger.info({
      companyId,
      quoteBase,
      quoteCurrent,
      quoteCoupon,
      monthlyPrice,
    }, 'Checkout using landing page quote price');

    const stripe = await getUncachableStripeClient();

    let stripeCustomerId: string | undefined;
    const [existingSubscription] = await db
      .select()
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.customerId, companyId))
      .limit(1);

    if (existingSubscription?.stripeCustomerId) {
      stripeCustomerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        address: { country: 'CO' },
        metadata: {
          company_id: companyId,
          trabajadores: (company.numberOfWorkers || 1).toString(),
          clase_riesgo: company.riskLevel || 'I',
          vehiculos: (company.numberOfVehicles || 0).toString(),
        },
      });
      stripeCustomerId = customer.id;
    }

    const COP_MULTIPLIER = 100;

    let productDescription = `SST Colombia - ${company.name}`;
    if (quoteCoupon && quoteCurrent != null && quoteCurrent < quoteBase) {
      productDescription = `SST Colombia - ${company.name} (Cupón ${quoteCoupon} - Primer período)`;
    }

    const lineItems = [
      {
        price_data: {
          currency: 'cop',
          product_data: {
            name: 'SST Colombia - Suscripción Mensual',
            description: productDescription,
          },
          unit_amount: Math.round(monthlyPrice * COP_MULTIPLIER),
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      locale: 'es-419',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        description: 'SST Colombia - Prueba gratis de 7 días',
      },
      metadata: {
        pricing_v2: 'true',
        company_id: companyId,
        pricing_mode: 'landing_page_quote',
        quote_base: quoteBase.toString(),
        quote_current: monthlyPrice.toString(),
        quote_coupon: quoteCoupon || '',
        trabajadores: (company.numberOfWorkers || 1).toString(),
        clase_riesgo: company.riskLevel || 'I',
        vehiculos: (company.numberOfVehicles || 0).toString(),
      },
    });

    logger.info({
      companyId,
      monthlyPrice,
      sessionId: session.id,
    }, 'Stripe checkout session created with landing page quote');

    return res.json({
      sessionUrl: session.url,
      sessionId: session.id,
      pricing: {
        costoMensualTotal: monthlyPrice,
        costoAnualTotal: monthlyPrice * 12,
        quoteBase,
        quoteCurrent: monthlyPrice,
        quoteCoupon,
        currency: 'COP',
        source: 'landing_page_quote',
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Error creating Stripe checkout session');
    return res.status(500).json({ error: error.message });
  }
});

export default router;
