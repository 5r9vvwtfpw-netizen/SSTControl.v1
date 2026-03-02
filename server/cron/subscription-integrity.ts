import { db } from "../db";
import { sql } from "drizzle-orm";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const STATUS_MAP: Record<string, string> = {
  'active': 'active',
  'trial': 'trial',
  'past_due': 'past_due',
  'suspended': 'blocked',
  'canceled': 'blocked',
  'expired': 'blocked',
};

const BLOCKED_REASON_MAP: Record<string, string> = {
  'suspended': 'Suscripcion suspendida',
  'canceled': 'Suscripcion cancelada',
  'expired': 'Suscripcion expirada',
};

async function runIntegrityCheck() {
  try {
    console.log('[SUB-SYNC] Starting subscription integrity check...');

    const tableCheck = await db.execute(
      sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pricing_plugin_subscriptions') as exists`
    );
    if (!tableCheck.rows?.[0]?.exists) {
      console.log('[SUB-SYNC] Table pricing_plugin_subscriptions does not exist, skipping integrity check');
      return;
    }

    const colCheck = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pricing_plugin_subscriptions' AND column_name = 'vehiculos'
    `);
    const hasVehiculos = colCheck.rows && colCheck.rows.length > 0;

    const allSubs = await db.execute(sql`
      SELECT id, company_id, status, trial_end
      FROM subscriptions
    `);

    if (!allSubs.rows || allSubs.rows.length === 0) {
      console.log('[SUB-SYNC] No subscriptions found, nothing to check');
      return;
    }

    let checked = 0;
    let created = 0;
    let updated = 0;
    let fieldsUpdated = 0;

    for (const row of allSubs.rows) {
      const sub = row as any;
      const companyId = sub.company_id;
      const subStatus = sub.status;
      const trialEnd = sub.trial_end ? new Date(sub.trial_end) : null;
      const mappedStatus = STATUS_MAP[subStatus] || 'blocked';
      const isBlocked = mappedStatus === 'blocked';
      const blockedReason = isBlocked ? (BLOCKED_REASON_MAP[subStatus] || 'Suscripcion inactiva') : null;

      checked++;

      try {
        const existing = await db.execute(
          sql`SELECT id, subscription_status FROM pricing_plugin_subscriptions WHERE customer_id = ${companyId} LIMIT 1`
        );

        const companyData = await db.execute(
          sql`SELECT number_of_workers, number_of_vehicles FROM companies WHERE id = ${companyId}`
        );
        const workers = (companyData.rows?.[0] as any)?.number_of_workers || 2;
        const vehicles = (companyData.rows?.[0] as any)?.number_of_vehicles || 0;

        if (!existing.rows || existing.rows.length === 0) {
          if (hasVehiculos) {
            await db.execute(sql`
              INSERT INTO pricing_plugin_subscriptions (
                customer_id, employee_count, tier, monthly_cost, price_per_license,
                minimum_fee, status, subscription_status, trial_ends_at,
                blocked_at, blocked_reason, vehiculos, updated_at
              ) VALUES (
                ${companyId}, ${workers}, 'sst_dinamico', 0, 0, 0,
                'active', ${mappedStatus}, ${trialEnd},
                ${isBlocked ? sql`NOW()` : sql`NULL`}, ${blockedReason}, ${vehicles}, NOW()
              )
            `);
          } else {
            await db.execute(sql`
              INSERT INTO pricing_plugin_subscriptions (
                customer_id, employee_count, tier, monthly_cost, price_per_license,
                minimum_fee, status, subscription_status, trial_ends_at,
                blocked_at, blocked_reason, updated_at
              ) VALUES (
                ${companyId}, ${workers}, 'sst_dinamico', 0, 0, 0,
                'active', ${mappedStatus}, ${trialEnd},
                ${isBlocked ? sql`NOW()` : sql`NULL`}, ${blockedReason}, NOW()
              )
            `);
          }
          created++;
        } else {
          const currentStatus = (existing.rows[0] as any)?.subscription_status;
          if (hasVehiculos) {
            await db.execute(sql`
              UPDATE pricing_plugin_subscriptions
              SET subscription_status = ${mappedStatus},
                  trial_ends_at = ${trialEnd},
                  employee_count = ${workers},
                  vehiculos = ${vehicles},
                  blocked_at = ${isBlocked ? sql`NOW()` : sql`NULL`},
                  blocked_reason = ${blockedReason},
                  updated_at = NOW()
              WHERE customer_id = ${companyId}
            `);
          } else {
            await db.execute(sql`
              UPDATE pricing_plugin_subscriptions
              SET subscription_status = ${mappedStatus},
                  trial_ends_at = ${trialEnd},
                  employee_count = ${workers},
                  blocked_at = ${isBlocked ? sql`NOW()` : sql`NULL`},
                  blocked_reason = ${blockedReason},
                  updated_at = NOW()
              WHERE customer_id = ${companyId}
            `);
          }
          if (currentStatus !== mappedStatus) {
            updated++;
          }
          fieldsUpdated++;
        }
      } catch (rowError: any) {
        console.error(`[SUB-SYNC] Error processing subscription for company ${companyId}:`, rowError.message);
      }
    }

    console.log(`[SUB-SYNC] Integrity check complete: ${checked} checked, ${created} created, ${updated} updated, ${fieldsUpdated} fields_updated`);
  } catch (error: any) {
    console.error('[SUB-SYNC] Error running subscription integrity check:', error.message);
  }
}

export function startSubscriptionIntegrityCheck() {
  console.log('[SUB-SYNC] Subscription integrity check scheduled (every 6 hours)');
  setTimeout(() => runIntegrityCheck(), 30000);
  setInterval(() => runIntegrityCheck(), SIX_HOURS_MS);
}
