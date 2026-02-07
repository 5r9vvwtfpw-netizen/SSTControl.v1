import { getUncachableStripeClient, getStripePublishableKey } from "../server/stripeClient";
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import { pricingPluginSubscriptions, pricingPluginInvoices, pricingConfig, type PricingPluginSubscription } from "./schema";
import { calculatePricing, type PricingParams } from "./calculate";
import { companies } from "../shared/schema";
import logger from "../server/lib/logger";

export interface CreatePricingCheckoutParams {
  customerId: string;
  employeeCount: number;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PricingCheckoutResult {
  sessionUrl: string;
  sessionId: string;
  pricing: {
    tier: string;
    employeeCount: number;
    monthlyCost: number;
    pricePerLicense: number;
    minimumFee: number;
    currency: string;
  };
}

async function getActiveConfig() {
  const [config] = await db
    .select()
    .from(pricingConfig)
    .where(eq(pricingConfig.isActive, true))
    .limit(1);
  return config;
}

function configToParams(config: typeof pricingConfig.$inferSelect): PricingParams {
  return {
    minFeeSmall: parseFloat(config.minFeeSmall),
    price1To10: parseFloat(config.price1To10),
    price11To49: parseFloat(config.price11To49),
    price50To199: parseFloat(config.price50To199),
    price200Plus: parseFloat(config.price200Plus),
    currency: config.currency,
  };
}

export async function createPricingCheckoutSession(params: CreatePricingCheckoutParams): Promise<PricingCheckoutResult> {
  const config = await getActiveConfig();
  if (!config) {
    throw new Error("Pricing configuration not set");
  }

  const pricing = calculatePricing(params.employeeCount, configToParams(config));
  const stripe = await getUncachableStripeClient();

  let stripeCustomerId: string | undefined;
  const [existingSubscription] = await db
    .select()
    .from(pricingPluginSubscriptions)
    .where(eq(pricingPluginSubscriptions.customerId, params.customerId))
    .limit(1);

  if (existingSubscription?.stripeCustomerId) {
    stripeCustomerId = existingSubscription.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: params.customerEmail,
      name: params.customerName,
      metadata: {
        pricing_plugin_customer_id: params.customerId,
        employee_count: params.employeeCount.toString(),
        tier: pricing.tier,
      },
    });
    stripeCustomerId = customer.id;

    if (existingSubscription) {
      await db
        .update(pricingPluginSubscriptions)
        .set({ stripeCustomerId, updatedAt: new Date() })
        .where(eq(pricingPluginSubscriptions.id, existingSubscription.id));
    }
  }

  const unitAmount = Math.round(pricing.monthlyCost * 100);

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: pricing.currency.toLowerCase(),
          product_data: {
            name: `SST Colombia - Licencia ${pricing.tier} empleados`,
            description: `Suscripción mensual para ${params.employeeCount} empleados (${pricing.tier})`,
            metadata: {
              tier: pricing.tier,
              employee_count: params.employeeCount.toString(),
              price_per_license: pricing.pricePerLicense.toString(),
              minimum_fee: pricing.minimumFee.toString(),
            },
          },
          unit_amount: unitAmount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      pricing_plugin: 'true',
      customer_id: params.customerId,
      employee_count: params.employeeCount.toString(),
      tier: pricing.tier,
      monthly_cost: pricing.monthlyCost.toString(),
      pricing_config_id: config.id,
    },
  });

  return {
    sessionUrl: session.url!,
    sessionId: session.id,
    pricing: {
      tier: pricing.tier,
      employeeCount: pricing.employeeCount,
      monthlyCost: pricing.monthlyCost,
      pricePerLicense: pricing.pricePerLicense,
      minimumFee: pricing.minimumFee,
      currency: pricing.currency,
    },
  };
}

export async function handlePricingWebhook(event: any): Promise<void> {
  const stripe = await getUncachableStripeClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      if (session.metadata?.pricing_plugin !== 'true') {
        return;
      }

      const customerId = session.metadata.customer_id;
      const employeeCount = parseInt(session.metadata.employee_count);
      const tier = session.metadata.tier;
      const monthlyCost = parseFloat(session.metadata.monthly_cost);
      const pricingConfigId = session.metadata.pricing_config_id;

      const config = await getActiveConfig();
      const pricing = calculatePricing(employeeCount, configToParams(config!));

      const [existingSub] = await db
        .select()
        .from(pricingPluginSubscriptions)
        .where(eq(pricingPluginSubscriptions.customerId, customerId))
        .limit(1);

      if (existingSub) {
        await db
          .update(pricingPluginSubscriptions)
          .set({
            employeeCount,
            tier,
            monthlyСost: monthlyCost.toString(),
            pricePerLicense: pricing.pricePerLicense.toString(),
            minimumFee: pricing.minimumFee.toString(),
            pricingConfigId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            status: 'active',
            updatedAt: new Date(),
          })
          .where(eq(pricingPluginSubscriptions.id, existingSub.id));
      } else {
        await db.insert(pricingPluginSubscriptions).values({
          customerId,
          employeeCount,
          pricingConfigId,
          tier,
          monthlyСost: monthlyCost.toString(),
          pricePerLicense: pricing.pricePerLicense.toString(),
          minimumFee: pricing.minimumFee.toString(),
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: 'active',
        });
      }

      logger.info({
        customerId,
        employeeCount,
        tier,
        monthlyCost,
        stripeSubscriptionId: session.subscription,
      }, 'Pricing plugin subscription created via Stripe checkout');
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (!subscriptionId) return;

      const [subscription] = await db
        .select()
        .from(pricingPluginSubscriptions)
        .where(eq(pricingPluginSubscriptions.stripeSubscriptionId, subscriptionId))
        .limit(1);

      if (!subscription) return;

      const now = new Date();
      const periodStart = new Date(invoice.period_start * 1000);
      const periodEnd = new Date(invoice.period_end * 1000);

      await db.insert(pricingPluginInvoices).values({
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        periodStart,
        periodEnd,
        employeeCountBilled: subscription.employeeCount,
        tier: subscription.tier,
        monthlyCost: subscription.monthlyСost,
        pricePerLicense: subscription.pricePerLicense,
        minimumFee: subscription.minimumFee,
        paymentStatus: 'paid',
        paymentReference: invoice.id,
      });

      logger.info({
        invoiceId: invoice.id,
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        amount: invoice.amount_paid,
      }, 'Pricing plugin invoice recorded from Stripe');
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (!subscriptionId) return;

      const [subscription] = await db
        .select()
        .from(pricingPluginSubscriptions)
        .where(eq(pricingPluginSubscriptions.stripeSubscriptionId, subscriptionId))
        .limit(1);

      if (!subscription) return;

      const periodStart = new Date(invoice.period_start * 1000);
      const periodEnd = new Date(invoice.period_end * 1000);

      await db.insert(pricingPluginInvoices).values({
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        periodStart,
        periodEnd,
        employeeCountBilled: subscription.employeeCount,
        tier: subscription.tier,
        monthlyCost: subscription.monthlyСost,
        pricePerLicense: subscription.pricePerLicense,
        minimumFee: subscription.minimumFee,
        paymentStatus: 'failed',
        paymentReference: invoice.id,
      });

      logger.warn({
        invoiceId: invoice.id,
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
      }, 'Pricing plugin invoice payment failed');
      break;
    }

    case 'customer.subscription.deleted': {
      const stripeSubscription = event.data.object;

      const [subscription] = await db
        .select()
        .from(pricingPluginSubscriptions)
        .where(eq(pricingPluginSubscriptions.stripeSubscriptionId, stripeSubscription.id))
        .limit(1);

      if (subscription) {
        await db
          .update(pricingPluginSubscriptions)
          .set({ status: 'cancelled', updatedAt: new Date() })
          .where(eq(pricingPluginSubscriptions.id, subscription.id));

        logger.info({
          subscriptionId: subscription.id,
          customerId: subscription.customerId,
        }, 'Pricing plugin subscription cancelled');
      }
      break;
    }
  }
}

export async function chargeSubscriptionWithStripe(subscription: PricingPluginSubscription): Promise<boolean> {
  if (!subscription.stripeSubscriptionId) {
    logger.warn({ subscriptionId: subscription.id }, 'No Stripe subscription ID, cannot charge');
    return false;
  }

  try {
    const stripe = await getUncachableStripeClient();
    
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    const isActive = stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing';
    
    if (isActive) {
      logger.info({
        subscriptionId: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        status: stripeSubscription.status,
      }, 'Stripe subscription is active, billing handled by Stripe');
    }

    return isActive;
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error checking Stripe subscription');
    return false;
  }
}

export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const [subscription] = await db
    .select()
    .from(pricingPluginSubscriptions)
    .where(eq(pricingPluginSubscriptions.customerId, customerId))
    .limit(1);

  if (!subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer found for this company');
  }

  const stripe = await getUncachableStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function getPublishableKey(): Promise<string> {
  return await getStripePublishableKey();
}
