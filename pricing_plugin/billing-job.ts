import { db } from "../server/db";
import { eq, and, desc } from "drizzle-orm";
import { pricingPluginSubscriptions, pricingPluginInvoices } from "./schema";
import logger from "../server/lib/logger";
import { chargeSubscriptionWithStripe } from "./stripe-integration";

async function chargeCustomer(
  invoice: typeof pricingPluginInvoices.$inferSelect,
  subscription: typeof pricingPluginSubscriptions.$inferSelect
): Promise<boolean> {
  if (subscription.stripeSubscriptionId) {
    return await chargeSubscriptionWithStripe(subscription);
  }
  
  logger.info({ invoiceId: invoice.id }, "No Stripe subscription - manual payment required");
  return false;
}

export async function runPricingPluginBillingJob(): Promise<void> {
  const ENABLE_PRICING_PLUGIN = process.env.ENABLE_PRICING_PLUGIN === "true";
  
  if (!ENABLE_PRICING_PLUGIN) {
    logger.info("Pricing plugin is disabled, skipping billing job");
    return;
  }

  logger.info("Starting pricing plugin billing job...");

  try {
    const activeSubscriptions = await db
      .select()
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.status, "active"));

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let invoicesGenerated = 0;
    let invoicesSkipped = 0;

    for (const subscription of activeSubscriptions) {
      const existingInvoice = await db
        .select()
        .from(pricingPluginInvoices)
        .where(
          and(
            eq(pricingPluginInvoices.subscriptionId, subscription.id),
            eq(pricingPluginInvoices.periodStart, periodStart)
          )
        )
        .limit(1);

      if (existingInvoice.length > 0) {
        invoicesSkipped++;
        continue;
      }

      if (subscription.stripeSubscriptionId) {
        const charged = await chargeCustomer(null as any, subscription);
        if (charged) {
          invoicesGenerated++;
          logger.info({ 
            subscriptionId: subscription.id, 
            customerId: subscription.customerId,
            amount: subscription.monthlyСost,
            stripeManaged: true,
          }, "Stripe-managed subscription verified active");
        }
        continue;
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

      const charged = await chargeCustomer(invoice, subscription);
      
      if (charged) {
        await db
          .update(pricingPluginInvoices)
          .set({ paymentStatus: "paid" })
          .where(eq(pricingPluginInvoices.id, invoice.id));
      }

      invoicesGenerated++;
      logger.info({ 
        invoiceId: invoice.id, 
        customerId: subscription.customerId,
        amount: subscription.monthlyСost 
      }, "Invoice generated for subscription");
    }

    logger.info({ 
      totalSubscriptions: activeSubscriptions.length,
      invoicesGenerated,
      invoicesSkipped 
    }, "Pricing plugin billing job completed");

  } catch (error) {
    logger.error({ err: error }, "Error running pricing plugin billing job");
    throw error;
  }
}

export function startPricingPluginBillingJob(): void {
  const ENABLE_PRICING_PLUGIN = process.env.ENABLE_PRICING_PLUGIN === "true";
  
  if (!ENABLE_PRICING_PLUGIN) {
    logger.info("Pricing plugin is disabled, not starting billing cron");
    return;
  }

  logger.info("Pricing plugin billing job registered (runs with main billing job)");
}
