import { Router, Request, Response } from "express";
import { db } from "../server/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { 
  pricingConfig, 
  pricingPluginSubscriptions, 
  pricingPluginInvoices,
  type PricingConfig
} from "./schema";
import { calculatePricing, type PricingParams } from "./calculate";
import { requireRole } from "../server/auth";
import { 
  createPricingCheckoutSession, 
  handlePricingWebhook, 
  createBillingPortalSession,
  getPublishableKey
} from "./stripe-integration";
import { companies } from "../shared/schema";

const router = Router();

function configToParams(config: PricingConfig): PricingParams {
  return {
    basePrice: parseFloat(config.minFeeSmall),
    additionalWorkerPrice: parseFloat(config.price1To10),
    currency: config.currency,
  };
}

async function getActiveConfig(): Promise<PricingConfig | null> {
  const [config] = await db
    .select()
    .from(pricingConfig)
    .where(eq(pricingConfig.isActive, true))
    .orderBy(desc(pricingConfig.createdAt))
    .limit(1);
  return config || null;
}

router.post("/calculate", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employees: z.number().int().min(1, "Employees must be at least 1"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid employees value" });
    }

    const config = await getActiveConfig();
    if (!config) {
      return res.status(500).json({ error: "Pricing configuration not set" });
    }

    const result = calculatePricing(parsed.data.employees, configToParams(config));
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/admin/pricing", requireRole(["admin"]), async (_req: Request, res: Response) => {
  try {
    const config = await getActiveConfig();
    if (!config) {
      return res.json({
        minFeeSmall: 0,
        price1To10: 0,
        price11To49: 0,
        price50To199: 0,
        price200Plus: 0,
        currency: "COP",
      });
    }

    return res.json({
      minFeeSmall: parseFloat(config.minFeeSmall),
      price1To10: parseFloat(config.price1To10),
      price11To49: parseFloat(config.price11To49),
      price50To199: parseFloat(config.price50To199),
      price200Plus: parseFloat(config.price200Plus),
      currency: config.currency,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/admin/pricing", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      minFeeSmall: z.number().min(0).optional(),
      min_fee_small: z.number().min(0).optional(),
      price1To10: z.number().min(0).optional(),
      price_1_10: z.number().min(0).optional(),
      price11To49: z.number().min(0).optional(),
      price_11_49: z.number().min(0).optional(),
      price50To199: z.number().min(0).optional(),
      price_50_199: z.number().min(0).optional(),
      price200Plus: z.number().min(0).optional(),
      price_200_plus: z.number().min(0).optional(),
      currency: z.string().default("COP"),
    }).transform((data) => ({
      minFeeSmall: data.minFeeSmall ?? data.min_fee_small ?? 0,
      price1To10: data.price1To10 ?? data.price_1_10 ?? 0,
      price11To49: data.price11To49 ?? data.price_11_49 ?? 0,
      price50To199: data.price50To199 ?? data.price_50_199 ?? 0,
      price200Plus: data.price200Plus ?? data.price_200_plus ?? 0,
      currency: data.currency,
    }));

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid pricing values", details: parsed.error.errors });
    }

    await db
      .update(pricingConfig)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pricingConfig.isActive, true));

    const [newConfig] = await db.insert(pricingConfig).values({
      minFeeSmall: parsed.data.minFeeSmall.toString(),
      price1To10: parsed.data.price1To10.toString(),
      price11To49: parsed.data.price11To49.toString(),
      price50To199: parsed.data.price50To199.toString(),
      price200Plus: parsed.data.price200Plus.toString(),
      currency: parsed.data.currency,
      isActive: true,
    }).returning();

    return res.json({ success: true, pricing_config_id: newConfig.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/subscriptions", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      customer_id: z.string().uuid(),
      employees: z.number().int().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request data", details: parsed.error.errors });
    }

    const config = await getActiveConfig();
    if (!config) {
      return res.status(500).json({ error: "Pricing configuration not set" });
    }

    const pricing = calculatePricing(parsed.data.employees, configToParams(config));

    const existingSubs = await db
      .select()
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.customerId, parsed.data.customer_id))
      .limit(1);

    let subscription;
    if (existingSubs.length > 0) {
      [subscription] = await db
        .update(pricingPluginSubscriptions)
        .set({
          employeeCount: pricing.employeeCount,
          pricingConfigId: config.id,
          tier: pricing.tier,
          monthlyСost: pricing.monthlyCost.toString(),
          pricePerLicense: pricing.pricePerLicense.toString(),
          minimumFee: pricing.minimumFee.toString(),
          updatedAt: new Date(),
        })
        .where(eq(pricingPluginSubscriptions.customerId, parsed.data.customer_id))
        .returning();
    } else {
      [subscription] = await db.insert(pricingPluginSubscriptions).values({
        customerId: parsed.data.customer_id,
        employeeCount: pricing.employeeCount,
        pricingConfigId: config.id,
        tier: pricing.tier,
        monthlyСost: pricing.monthlyCost.toString(),
        pricePerLicense: pricing.pricePerLicense.toString(),
        minimumFee: pricing.minimumFee.toString(),
        status: "active",
      }).returning();
    }

    return res.json({
      subscription_id: subscription.id,
      customer_id: subscription.customerId,
      employee_count: subscription.employeeCount,
      tier: subscription.tier,
      price_per_license: parseFloat(subscription.pricePerLicense),
      minimum_fee: parseFloat(subscription.minimumFee),
      monthly_cost: parseFloat(subscription.monthlyСost),
      currency: config.currency,
      status: subscription.status,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/admin/subscriptions", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.page_size as string) || 20;
    const customerId = req.query.customer_id as string;

    let query = db.select().from(pricingPluginSubscriptions);
    
    if (customerId) {
      query = query.where(eq(pricingPluginSubscriptions.customerId, customerId)) as any;
    }

    const subscriptions = await query
      .orderBy(desc(pricingPluginSubscriptions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return res.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        customer_id: sub.customerId,
        employee_count: sub.employeeCount,
        tier: sub.tier,
        monthly_cost: parseFloat(sub.monthlyСost),
        price_per_license: parseFloat(sub.pricePerLicense),
        minimum_fee: parseFloat(sub.minimumFee),
        status: sub.status,
        created_at: sub.createdAt,
        updated_at: sub.updatedAt,
      })),
      page,
      page_size: pageSize,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/admin/subscriptions/:subscription_id/generate-invoice", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const { subscription_id } = req.params;

    const [subscription] = await db
      .select()
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.id, subscription_id))
      .limit(1);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const existingInvoice = await db
      .select()
      .from(pricingPluginInvoices)
      .where(
        and(
          eq(pricingPluginInvoices.subscriptionId, subscription_id),
          eq(pricingPluginInvoices.periodStart, periodStart)
        )
      )
      .limit(1);

    if (existingInvoice.length > 0) {
      return res.status(400).json({ error: "Invoice already exists for this period" });
    }

    const [invoice] = await db.insert(pricingPluginInvoices).values({
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      periodStart,
      periodEnd,
      employeeCountBilled: subscription.employeeCount,
      tier: subscription.tier,
      monthlyCost: subscription.monthlyСost,
      pricePerLicense: subscription.pricePerLicense,
      minimumFee: subscription.minimumFee,
      paymentStatus: "pending",
    }).returning();

    return res.json({
      id: invoice.id,
      subscription_id: invoice.subscriptionId,
      customer_id: invoice.customerId,
      period_start: invoice.periodStart,
      period_end: invoice.periodEnd,
      employee_count_billed: invoice.employeeCountBilled,
      tier: invoice.tier,
      monthly_cost: parseFloat(invoice.monthlyCost),
      price_per_license: parseFloat(invoice.pricePerLicense),
      minimum_fee: parseFloat(invoice.minimumFee),
      payment_status: invoice.paymentStatus,
      created_at: invoice.createdAt,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/admin/invoices", requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.page_size as string) || 20;

    const invoices = await db
      .select()
      .from(pricingPluginInvoices)
      .orderBy(desc(pricingPluginInvoices.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return res.json({
      invoices: invoices.map(inv => ({
        id: inv.id,
        subscription_id: inv.subscriptionId,
        customer_id: inv.customerId,
        period_start: inv.periodStart,
        period_end: inv.periodEnd,
        employee_count_billed: inv.employeeCountBilled,
        tier: inv.tier,
        monthly_cost: parseFloat(inv.monthlyCost),
        price_per_license: parseFloat(inv.pricePerLicense),
        minimum_fee: parseFloat(inv.minimumFee),
        payment_status: inv.paymentStatus,
        payment_reference: inv.paymentReference,
        created_at: inv.createdAt,
      })),
      page,
      page_size: pageSize,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/stripe/publishable-key", async (_req: Request, res: Response) => {
  try {
    const publishableKey = await getPublishableKey();
    return res.json({ publishableKey });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const schema = z.object({
      customerId: z.string().uuid(),
      employeeCount: z.number().int().min(1),
      successUrl: z.string().url().optional(),
      cancelUrl: z.string().url().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request data", details: parsed.error.errors });
    }

    if (user.companyId !== parsed.data.customerId && user.role !== 'admin') {
      return res.status(403).json({ error: "You can only create checkout for your own company" });
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parsed.data.customerId))
      .limit(1);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const successUrl = parsed.data.successUrl || `${baseUrl}/planes-suscripcion?success=true`;
    const cancelUrl = parsed.data.cancelUrl || `${baseUrl}/planes-suscripcion?canceled=true`;

    const result = await createPricingCheckoutSession({
      customerId: parsed.data.customerId,
      employeeCount: parsed.data.employeeCount,
      customerEmail: company.contactEmail || `company-${company.id}@example.com`,
      customerName: company.name,
      successUrl,
      cancelUrl,
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/billing-portal", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.companyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const returnUrl = `${req.protocol}://${req.get('host')}/planes-suscripcion`;
    const portalUrl = await createBillingPortalSession(user.companyId, returnUrl);

    return res.json({ url: portalUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    await handlePricingWebhook(req.body);
    return res.json({ received: true });
  } catch (error: any) {
    console.error("Pricing plugin webhook error:", error);
    return res.status(400).json({ error: error.message });
  }
});

router.get("/my-subscription", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.companyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const config = await getActiveConfig();
    const [subscription] = await db
      .select()
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.customerId, user.companyId))
      .limit(1);

    if (!subscription) {
      return res.json({ 
        hasSubscription: false,
        subscription: null,
        currency: config?.currency || "COP",
      });
    }

    return res.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        employeeCount: subscription.employeeCount,
        tier: subscription.tier,
        monthlyCost: parseFloat(subscription.monthlyСost),
        pricePerLicense: parseFloat(subscription.pricePerLicense),
        minimumFee: parseFloat(subscription.minimumFee),
        status: subscription.status,
        hasStripeSubscription: !!subscription.stripeSubscriptionId,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
      currency: config?.currency || "COP",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
