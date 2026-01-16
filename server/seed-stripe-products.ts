/**
 * Seed Stripe Products Script
 * Creates SST Colombia subscription plans in Stripe
 * 
 * Run with: npx tsx server/seed-stripe-products.ts
 * 
 * This script creates products and prices in Stripe matching
 * the subscription plans defined in the pricing plugin.
 */

import { getUncachableStripeClient } from './stripeClient';

interface PlanConfig {
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number; // In COP centavos
  maxWorkers: number;
  features: string[];
}

// IMPORTANTE: COP NO es zero-decimal en Stripe. Los valores deben ser en "centavos" (×100)
// Ejemplo: $60,000 COP = unit_amount 6,000,000
const plans: PlanConfig[] = [
  {
    name: 'microempresa',
    displayName: 'Microempresa',
    description: 'Plan ideal para microempresas con hasta 10 trabajadores. Cumplimiento del Capítulo I de la Resolución 0312/2019.',
    priceMonthly: 6000000, // $60,000 COP/mes (×100)
    maxWorkers: 10,
    features: [
      '7 estándares mínimos',
      'Gestión básica documentos',
      'Capacitaciones esenciales',
      'Inspecciones básicas',
      'Alertas fechas Ministerio'
    ]
  },
  {
    name: 'pequena',
    displayName: 'Pequeña Empresa',
    description: 'Plan para pequeñas empresas de 11 a 49 trabajadores. Cumplimiento del Capítulo II de la Resolución 0312/2019.',
    priceMonthly: 26400000, // $264,000 COP/mes (×100)
    maxWorkers: 49,
    features: [
      '21 estándares mínimos',
      'IPERC completo GTC-45',
      'Auditorías internas SST',
      'COPASST digital',
      'Indicadores SST'
    ]
  },
  {
    name: 'mediana',
    displayName: 'Mediana Empresa',
    description: 'Plan completo para medianas empresas de 50 a 199 trabajadores. Cumplimiento total del Capítulo III de la Resolución 0312/2019.',
    priceMonthly: 110000000, // $1,100,000 COP/mes (×100)
    maxWorkers: 199,
    features: [
      '61 estándares mínimos',
      'Módulo PESV completo',
      'Compatible ISO 45001:2018',
      'Revisión por Dirección',
      'Dashboards ejecutivos'
    ]
  },
  {
    name: 'grande',
    displayName: 'Gran Empresa',
    description: 'Plan empresarial para grandes empresas con 200+ trabajadores. Cumplimiento total de la Resolución 0312/2019 y certificación ISO 45001:2018.',
    priceMonthly: 400000000, // $4,000,000 COP/mes (×100)
    maxWorkers: -1, // Unlimited
    features: [
      '61 estándares mínimos',
      'Usuarios ilimitados',
      'Consultor SST dedicado',
      'Soporte 24/7',
      'SLA garantizado 99.9%'
    ]
  }
];

async function seedStripeProducts() {
  console.log('🚀 Iniciando creación/actualización de productos en Stripe...\n');
  
  const stripe = await getUncachableStripeClient();
  
  for (const plan of plans) {
    console.log(`📦 Procesando producto: ${plan.displayName}...`);
    
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: `name:'${plan.displayName}'`
    });
    
    let productId: string;
    
    if (existingProducts.data.length > 0) {
      productId = existingProducts.data[0].id;
      console.log(`   ℹ️  Producto existente encontrado: ${productId}`);
      
      // Update product metadata
      await stripe.products.update(productId, {
        description: plan.description,
        metadata: {
          sstPlanId: plan.name,
          plan_name: plan.name,
          max_workers: plan.maxWorkers.toString(),
          features: plan.features.slice(0, 5).join(', '),
        }
      });
      console.log(`   ✅ Metadatos del producto actualizados`);
      
      // Check if correct prices already exist
      const existingPrices = await stripe.prices.list({
        product: productId,
        active: true
      });
      
      const expectedYearlyAmount = Math.round(plan.priceMonthly * 12 * 0.8);
      const hasCorrectMonthlyPrice = existingPrices.data.some(
        p => p.recurring?.interval === 'month' && p.unit_amount === plan.priceMonthly
      );
      const hasCorrectYearlyPrice = existingPrices.data.some(
        p => p.recurring?.interval === 'year' && p.unit_amount === expectedYearlyAmount
      );
      
      if (hasCorrectMonthlyPrice && hasCorrectYearlyPrice) {
        console.log(`   ✅ Precios correctos ya existen, saltando...\n`);
        continue;
      }
      
      // Archive old prices
      for (const price of existingPrices.data) {
        if ((price.recurring?.interval === 'month' && price.unit_amount !== plan.priceMonthly) ||
            (price.recurring?.interval === 'year' && price.unit_amount !== expectedYearlyAmount)) {
          await stripe.prices.update(price.id, { active: false });
          console.log(`   🗄️  Precio antiguo archivado: ${price.id} (${price.unit_amount} COP)`);
        }
      }
    } else {
      // Create product
      const product = await stripe.products.create({
        name: plan.displayName,
        description: plan.description,
        metadata: {
          sstPlanId: plan.name,
          plan_name: plan.name,
          max_workers: plan.maxWorkers.toString(),
          features: plan.features.slice(0, 5).join(', '),
        }
      });
      productId = product.id;
      console.log(`   ✅ Producto creado: ${product.id}`);
    }
    
    // Create monthly price
    // NOTA: COP es zero-decimal, el valor es directamente en pesos
    const monthlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: plan.priceMonthly, // Valor directo en COP (zero-decimal)
      currency: 'cop',
      recurring: {
        interval: 'month'
      },
      metadata: {
        sstPlanId: plan.name,
        plan_name: plan.name,
        billing_period: 'monthly'
      }
    });
    
    console.log(`   💰 Precio mensual creado: ${monthlyPrice.id} ($${(plan.priceMonthly / 100).toLocaleString('es-CO')} COP/mes)`);
    
    // Create yearly price (20% discount)
    const yearlyAmount = Math.round(plan.priceMonthly * 12 * 0.8); // 20% descuento anual
    const yearlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: yearlyAmount,
      currency: 'cop',
      recurring: {
        interval: 'year'
      },
      metadata: {
        sstPlanId: plan.name,
        plan_name: plan.name,
        billing_period: 'yearly',
        discount: '20% descuento anual'
      }
    });
    
    console.log(`   💰 Precio anual creado: ${yearlyPrice.id} ($${(yearlyAmount / 100).toLocaleString('es-CO')} COP/año - 20% descuento)\n`);
  }
  
  console.log('✅ Productos de Stripe creados exitosamente!');
  console.log('\n📋 Resumen de planes creados:');
  console.log('   - Microempresa: $60,000 COP/mes | $576,000 COP/año');
  console.log('   - Pequeña Empresa: $264,000 COP/mes | $2,534,400 COP/año');
  console.log('   - Mediana Empresa: $1,100,000 COP/mes | $10,560,000 COP/año');
  console.log('   - Gran Empresa: $4,000,000 COP/mes | $38,400,000 COP/año');
  console.log('\n🔗 Revisa tu Dashboard de Stripe para ver los productos.');
}

// Run the script
seedStripeProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
