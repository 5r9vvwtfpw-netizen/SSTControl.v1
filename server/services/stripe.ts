import Stripe from 'stripe';
import { getUncachableStripeClient } from '../stripeClient';
import { retryWithBackoff } from '../utils/retry';
import logger from '../lib/logger';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  customerId: string;
}

export interface StripeInvoice {
  id: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

export class StripeService {
  private stripe: Stripe | null = null;

  private async getClient(): Promise<Stripe> {
    if (!this.stripe) {
      this.stripe = await getUncachableStripeClient();
    }
    return this.stripe;
  }

  async createCustomer(data: {
    email: string;
    name?: string;
    companyId: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    return await retryWithBackoff(async () => {
      const stripe = await this.getClient();
      
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: {
          companyId: data.companyId,
          ...data.metadata
        }
      });

      return {
        id: customer.id,
        email: customer.email || data.email,
        name: customer.name || undefined,
        metadata: customer.metadata as Record<string, string>
      };
    }, {
      maxAttempts: 3,
      initialDelayMs: 1000
    }, {
      operation: 'createCustomer'
    });
  }

  async findOrCreateCustomer(data: {
    email: string;
    name?: string;
    companyId: string;
  }): Promise<StripeCustomer> {
    const stripe = await this.getClient();
    
    const existingCustomers = await stripe.customers.list({
      email: data.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      return {
        id: customer.id,
        email: customer.email || data.email,
        name: customer.name || undefined,
        metadata: customer.metadata as Record<string, string>
      };
    }

    return this.createCustomer(data);
  }

  /**
   * Crea un checkout con precio dinámico (price_data) en COP
   * Usado para checkouts desde landing page con precios del JWT
   */
  async createDynamicCheckoutSession(data: {
    customerId: string;
    currency: string;
    productName: string;
    productDescription?: string;
    unitAmount: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    subscriptionMetadata?: Record<string, string>;
    trialPeriodDays?: number;
  }): Promise<StripeCheckoutSession> {
    return await retryWithBackoff(async () => {
      const stripe = await this.getClient();

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: data.customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: data.productName,
              description: data.productDescription || undefined
            },
            unit_amount: data.unitAmount,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: data.metadata,
        locale: 'es'
      };

      if (data.trialPeriodDays || data.subscriptionMetadata) {
        sessionParams.subscription_data = {
          ...(data.trialPeriodDays && { trial_period_days: data.trialPeriodDays }),
          ...(data.subscriptionMetadata && { metadata: data.subscriptionMetadata })
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      logger.info({ 
        sessionId: session.id, 
        currency: data.currency,
        unitAmount: data.unitAmount 
      }, 'Dynamic Stripe checkout session created');

      return {
        sessionId: session.id,
        url: session.url!
      };
    }, {
      maxAttempts: 3,
      initialDelayMs: 1000
    }, {
      operation: 'createDynamicCheckoutSession'
    });
  }

  async createBillingPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }): Promise<string> {
    return await retryWithBackoff(async () => {
      const stripe = await this.getClient();

      const session = await stripe.billingPortal.sessions.create({
        customer: data.customerId,
        return_url: data.returnUrl
      });

      return session.url;
    }, {
      maxAttempts: 3,
      initialDelayMs: 1000
    }, {
      operation: 'createBillingPortalSession'
    });
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    try {
      const stripe = await this.getClient();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription;

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: typeof subscription.items.data[0]?.price === 'object' 
          ? subscription.items.data[0].price.id 
          : '',
        customerId: typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id
      };
    } catch (error: any) {
      if (error.type === 'StripeInvalidRequestError') {
        return null;
      }
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<StripeSubscription> {
    const stripe = await this.getClient();

    if (immediately) {
      const subscription = await stripe.subscriptions.cancel(subscriptionId) as unknown as Stripe.Subscription;
      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: typeof subscription.items.data[0]?.price === 'object' 
          ? subscription.items.data[0].price.id 
          : '',
        customerId: typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id
      };
    } else {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      }) as unknown as Stripe.Subscription;
      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: typeof subscription.items.data[0]?.price === 'object' 
          ? subscription.items.data[0].price.id 
          : '',
        customerId: typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id
      };
    }
  }

  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    const stripe = await this.getClient();
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription;
    const itemId = subscription.items.data[0].id;

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: itemId,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations'
    }) as unknown as Stripe.Subscription;

    return {
      id: updated.id,
      status: updated.status,
      currentPeriodStart: new Date((updated as any).current_period_start * 1000),
      currentPeriodEnd: new Date((updated as any).current_period_end * 1000),
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      priceId: typeof updated.items.data[0]?.price === 'object' 
        ? updated.items.data[0].price.id 
        : '',
      customerId: typeof updated.customer === 'string'
        ? updated.customer
        : updated.customer.id
    };
  }

  async getInvoice(invoiceId: string): Promise<StripeInvoice | null> {
    try {
      const stripe = await this.getClient();
      const invoice = await stripe.invoices.retrieve(invoiceId);

      return {
        id: invoice.id,
        status: invoice.status || 'draft',
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
        invoicePdf: invoice.invoice_pdf || undefined
      };
    } catch (error: any) {
      if (error.type === 'StripeInvalidRequestError') {
        return null;
      }
      throw error;
    }
  }

  async listInvoices(customerId: string, limit: number = 10): Promise<StripeInvoice[]> {
    const stripe = await this.getClient();
    
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      status: invoice.status || 'draft',
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
      invoicePdf: invoice.invoice_pdf || undefined
    }));
  }

  verifyWebhookSignature(payload: Buffer, signature: string, endpointSecret: string): Stripe.Event {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  }

  // ==========================================
  // USUARIO ADICIONAL - Checkout para asientos extra por rol
  // ==========================================
  async createExtraSeatCheckoutSession(data: {
    customerId: string;
    role: string;
    priceAmountCop: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCheckoutSession> {
    return await retryWithBackoff(async () => {
      const stripe = await this.getClient();

      // Crear sesión de checkout con precio dinámico usando price_data
      const session = await stripe.checkout.sessions.create({
        customer: data.customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cop',
              product_data: {
                name: `Usuario Adicional - ${data.role}`,
                description: `Asiento adicional para el rol ${data.role} (facturación mensual)`
              },
              unit_amount: Math.round(data.priceAmountCop),
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: data.metadata
      });

      return {
        sessionId: session.id,
        url: session.url || ''
      };
    }, {
      maxAttempts: 3,
      initialDelayMs: 1000
    }, {
      operation: 'createExtraSeatCheckoutSession'
    });
  }
}

export const stripeService = new StripeService();
