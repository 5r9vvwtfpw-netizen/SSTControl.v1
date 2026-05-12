import { db } from "../server/db";
import { companies, subscriptions, subscriptionPlans } from "../shared/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
  // Ver planes disponibles
  const plans = await db.select({ id: subscriptionPlans.id, name: subscriptionPlans.name })
    .from(subscriptionPlans);
  console.log("Planes disponibles:", JSON.stringify(plans, null, 2));

  const company = await db.select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(ilike(companies.name, "%SISTEMA AUTOMATIZADO%"))
    .limit(1);

  if (!company[0]) { console.log("❌ Empresa no encontrada"); process.exit(1); }
  console.log(`\nEmpresa: ${company[0].name} | ID: ${company[0].id}`);

  const subs = await db.select().from(subscriptions)
    .where(eq(subscriptions.companyId, company[0].id));
  console.log("Suscripción actual:", JSON.stringify(subs[0] || "ninguna", null, 2));

  // Usar el plan de mayor nivel disponible
  const topPlan = plans[plans.length - 1];
  console.log(`\nUsando plan: ${topPlan.id} (${topPlan.name})`);

  const lifetime = {
    status: "active" as const,
    planId: topPlan.id,
    trialEndsAt: null,
    currentPeriodEnd: new Date("2099-12-31T23:59:59Z"),
    cancelAtPeriodEnd: 0,
  };

  if (subs.length > 0) {
    await db.update(subscriptions).set(lifetime).where(eq(subscriptions.companyId, company[0].id));
    console.log("✅ Suscripción actualizada a LIFETIME");
  } else {
    await db.insert(subscriptions).values({
      ...lifetime,
      companyId: company[0].id,
      stripeSubscriptionId: `lifetime-sadgi-${company[0].id}`,
      stripeCustomerId: null,
    });
    console.log("✅ Suscripción LIFETIME creada");
  }

  const final = await db.select({
    status: subscriptions.status,
    planId: subscriptions.planId,
    currentPeriodEnd: subscriptions.currentPeriodEnd,
  }).from(subscriptions).where(eq(subscriptions.companyId, company[0].id));

  console.log("\nEstado final:", JSON.stringify(final[0], null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
