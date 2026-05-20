import { db } from "../db";
import { companies, subscriptions, subscriptionPlans } from "../../shared/schema";
import { eq, ilike } from "drizzle-orm";

const HVG_NIT = "166803278";
const EXPIRY_DATE = new Date("2026-12-31T23:59:59-05:00"); // Colombia timezone

export async function setHvgLicenseExpiry(): Promise<void> {
  try {
    const company = await db
      .select({ id: companies.id, name: companies.name, nit: companies.nit })
      .from(companies)
      .where(eq(companies.nit, HVG_NIT))
      .limit(1);

    if (!company[0]) {
      console.log(`[setHvgLicenseExpiry] Empresa con NIT ${HVG_NIT} no encontrada — omitiendo migración`);
      return;
    }

    console.log(`[setHvgLicenseExpiry] Empresa encontrada: ${company[0].name} (ID: ${company[0].id})`);

    const existingSubs = await db
      .select({ id: subscriptions.id, status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.companyId, company[0].id))
      .limit(1);

    const plans = await db
      .select({ id: subscriptionPlans.id, name: subscriptionPlans.name })
      .from(subscriptionPlans)
      .limit(1);

    const planId = plans[0]?.id;

    if (existingSubs.length > 0) {
      await db
        .update(subscriptions)
        .set({
          status: "active",
          currentPeriodEnd: EXPIRY_DATE,
          cancelAtPeriodEnd: 0,
        })
        .where(eq(subscriptions.companyId, company[0].id));

      console.log(`[setHvgLicenseExpiry] ✅ Suscripción actualizada: status=active, vence 2026-12-31`);
    } else {
      if (!planId) {
        console.log("[setHvgLicenseExpiry] No se encontró ningún plan — omitiendo creación");
        return;
      }

      await db.insert(subscriptions).values({
        companyId: company[0].id,
        planId: planId,
        status: "active",
        currentPeriodEnd: EXPIRY_DATE,
        stripeSubscriptionId: `manual-hvg-${company[0].id}`,
        stripeCustomerId: null,
        cancelAtPeriodEnd: 0,
      });

      console.log(`[setHvgLicenseExpiry] ✅ Suscripción creada: status=active, vence 2026-12-31`);
    }
  } catch (error: any) {
    console.error(`[setHvgLicenseExpiry] Error:`, error.message);
  }
}
