/**
 * Seed Stripe Products Script
 * Creates Stripe products and prices matching the existing subscription plans
 * Run with: npx tsx server/scripts/seed-stripe-products.ts
 */

import { getUncachableStripeClient } from '../stripeClient';
import { db } from '../db';
import { subscriptionPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface PlanMapping {
  planId: string;
  stripeProductId: string;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}

async function seedStripeProducts() {
  console.log('🚀 Starting Stripe products seed...\n');

  const stripe = await getUncachableStripeClient();

  const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.status, 'active'));
  
  console.log(`Found ${plans.length} active plans to sync with Stripe\n`);

  const mappings: PlanMapping[] = [];

  for (const plan of plans) {
    console.log(`\n📦 Processing plan: ${plan.displayName}`);
    
    const existingProducts = await stripe.products.search({
      query: `metadata['sstPlanId']:'${plan.id}'`
    });

    let product;
    
    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`  ✓ Product already exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.displayName,
        description: plan.description || undefined,
        metadata: {
          sstPlanId: plan.id,
          sstPlanName: plan.name,
          maxWorkers: String(plan.maxWorkers),
          maxUsers: String(plan.maxUsers),
          storageGB: String(plan.storageGB)
        }
      });
      console.log(`  ✓ Product created: ${product.id}`);
    }

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true
    });

    let monthlyPrice = existingPrices.data.find(
      p => p.recurring?.interval === 'month' && p.currency === 'cop'
    );
    let yearlyPrice = existingPrices.data.find(
      p => p.recurring?.interval === 'year' && p.currency === 'cop'
    );

    if (!monthlyPrice) {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceMonthly,
        currency: 'cop',
        recurring: {
          interval: 'month'
        },
        nickname: `${plan.displayName} - Mensual`,
        metadata: {
          sstPlanId: plan.id,
          billingInterval: 'monthly'
        }
      });
      console.log(`  ✓ Monthly price created: ${monthlyPrice.id} (${plan.priceMonthly} COP)`);
    } else {
      console.log(`  ✓ Monthly price already exists: ${monthlyPrice.id}`);
    }

    if (!yearlyPrice) {
      yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceYearly,
        currency: 'cop',
        recurring: {
          interval: 'year'
        },
        nickname: `${plan.displayName} - Anual`,
        metadata: {
          sstPlanId: plan.id,
          billingInterval: 'yearly'
        }
      });
      console.log(`  ✓ Yearly price created: ${yearlyPrice.id} (${plan.priceYearly} COP)`);
    } else {
      console.log(`  ✓ Yearly price already exists: ${yearlyPrice.id}`);
    }

    mappings.push({
      planId: plan.id,
      stripeProductId: product.id,
      stripePriceIdMonthly: monthlyPrice.id,
      stripePriceIdYearly: yearlyPrice.id
    });
  }

  console.log('\n\n📋 Plan to Stripe ID Mappings:');
  console.log('================================');
  for (const mapping of mappings) {
    const plan = plans.find(p => p.id === mapping.planId);
    console.log(`\n${plan?.displayName}:`);
    console.log(`  Plan ID: ${mapping.planId}`);
    console.log(`  Stripe Product: ${mapping.stripeProductId}`);
    console.log(`  Monthly Price: ${mapping.stripePriceIdMonthly}`);
    console.log(`  Yearly Price: ${mapping.stripePriceIdYearly}`);
  }

  console.log('\n\n✅ Stripe products seed completed!');
  console.log('\nNext steps:');
  console.log('1. Add stripePriceIdMonthly and stripePriceIdYearly to subscriptionPlans table');
  console.log('2. Update frontend to use these price IDs for Stripe Checkout');
  
  return mappings;
}

seedStripeProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error seeding Stripe products:', error);
    process.exit(1);
  });
