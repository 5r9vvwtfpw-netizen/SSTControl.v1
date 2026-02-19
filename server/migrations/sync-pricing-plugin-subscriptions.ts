import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncPricingPluginSubscriptions() {
  try {
    const tableCheck = await db.execute(
      sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pricing_plugin_subscriptions') as exists`
    );
    if (!tableCheck.rows?.[0]?.exists) {
      console.log('⏭️  Tabla pricing_plugin_subscriptions no existe, saltando sincronización');
      return;
    }

    const missing = await db.execute(sql`
      SELECT s.id, s.company_id, s.status, s.plan_id, s.trial_end, s.current_period_end, s.last_payment_date
      FROM subscriptions s
      LEFT JOIN pricing_plugin_subscriptions p ON p.customer_id = s.company_id
      WHERE p.id IS NULL
    `);

    if (!missing.rows || missing.rows.length === 0) {
      console.log('✅ Todos los registros de subscriptions tienen su correspondiente pricing_plugin_subscriptions');
      return;
    }

    console.log(`🔄 Sincronizando ${missing.rows.length} registros faltantes en pricing_plugin_subscriptions...`);

    for (const sub of missing.rows) {
      const companyId = (sub as any).company_id;
      const subStatus = (sub as any).status;
      const planId = (sub as any).plan_id;
      const trialEndRaw = (sub as any).trial_end;
      const periodEndRaw = (sub as any).current_period_end;

      const now = new Date();
      const periodEnd = periodEndRaw ? new Date(periodEndRaw) : null;
      const trialEnd = trialEndRaw ? new Date(trialEndRaw) : null;

      let subscriptionStatus = 'trial';
      if (subStatus === 'active') {
        subscriptionStatus = (periodEnd && periodEnd < now) ? 'blocked' : 'active';
      } else if (subStatus === 'trial') {
        subscriptionStatus = (trialEnd && trialEnd < now) ? 'blocked' : 'trial';
      } else if (subStatus === 'canceled' || subStatus === 'past_due') {
        subscriptionStatus = 'blocked';
      }

      const blockedReason = subscriptionStatus === 'blocked'
        ? (subStatus === 'canceled' ? 'Suscripción cancelada' : 'Período de suscripción vencido')
        : null;

      const companyData = await db.execute(
        sql`SELECT number_of_workers, number_of_vehicles FROM companies WHERE id = ${companyId}`
      );
      const workers = (companyData.rows?.[0] as any)?.number_of_workers || 2;
      const vehicles = (companyData.rows?.[0] as any)?.number_of_vehicles || 0;

      const existsCheck = await db.execute(
        sql`SELECT id FROM pricing_plugin_subscriptions WHERE customer_id = ${companyId} LIMIT 1`
      );
      if (existsCheck.rows && existsCheck.rows.length > 0) {
        console.log(`  ⏭️  Registro ya existe para empresa ${companyId}`);
        continue;
      }

      if (subscriptionStatus === 'blocked') {
        await db.execute(sql`
          INSERT INTO pricing_plugin_subscriptions (
            customer_id, employee_count, tier, monthly_cost, price_per_license, 
            minimum_fee, status, subscription_status, trial_ends_at, 
            blocked_at, blocked_reason, vehiculos
          ) VALUES (
            ${companyId}, ${workers}, ${planId || 'microempresa'}, 0, 0, 0, 
            'active', ${subscriptionStatus}, ${trialEnd}, 
            ${now}, ${blockedReason}, ${vehicles}
          )
        `);
      } else {
        await db.execute(sql`
          INSERT INTO pricing_plugin_subscriptions (
            customer_id, employee_count, tier, monthly_cost, price_per_license, 
            minimum_fee, status, subscription_status, trial_ends_at, 
            vehiculos
          ) VALUES (
            ${companyId}, ${workers}, ${planId || 'microempresa'}, 0, 0, 0, 
            'active', ${subscriptionStatus}, ${trialEnd}, 
            ${vehicles}
          )
        `);
      }

      console.log(`  ✅ Creado registro pricing_plugin para empresa ${companyId} (status: ${subscriptionStatus})`);
    }

    console.log(`✅ Sincronización de pricing_plugin_subscriptions completada`);
  } catch (error: any) {
    console.error('⚠️ Error sincronizando pricing_plugin_subscriptions:', error.message);
  }
}
