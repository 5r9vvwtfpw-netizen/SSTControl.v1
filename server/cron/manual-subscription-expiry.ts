/**
 * Cron: Manual Subscription Expiry
 *
 * Bloquea automáticamente empresas con suscripción activa cuyo período
 * de facturación ha vencido (currentPeriodEnd < NOW()).
 *
 * Aplica principalmente a clientes de transferencia bancaria, ya que los
 * clientes de Stripe quedan bloqueados vía webhook antes de llegar aquí.
 *
 * Período de gracia: ver SUBSCRIPTION_GRACE_PERIOD_DAYS en
 * server/middleware/subscription-check.ts (fuente única de este valor).
 * Se ejecuta: diariamente (cada 24 horas).
 */

import { db } from "../db";
import { sql } from "drizzle-orm";
import logger from "../lib/logger";
import { SUBSCRIPTION_GRACE_PERIOD_DAYS } from "../middleware/subscription-check";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
// Nota: el bloqueo real ocurre en vivo dentro de getSubscriptionStatus
// (server/middleware/subscription-check.ts), que ahora es la fuente de
// verdad porque este cron no está garantizado a ejecutarse en despliegues
// Autoscale (la instancia puede escalar a cero entre solicitudes). Este job
// solo sincroniza el estado persistido en las tablas para reportes/consultas.
const GRACE_PERIOD_DAYS = SUBSCRIPTION_GRACE_PERIOD_DAYS;

async function runManualSubscriptionExpiry() {
  try {
    logger.info("[SUB-EXPIRY] Iniciando verificación de suscripciones vencidas...");

    // Buscar empresas activas cuyo período venció hace más de GRACE_PERIOD_DAYS días
    const expired = await db.execute(sql`
      SELECT s.id, s.company_id, s.current_period_end, c.name as company_name
      FROM subscriptions s
      JOIN companies c ON c.id = s.company_id
      WHERE s.status = 'active'
        AND s.current_period_end < NOW() - INTERVAL '${sql.raw(String(GRACE_PERIOD_DAYS))} days'
    `);

    if (!expired.rows || expired.rows.length === 0) {
      logger.info("[SUB-EXPIRY] No hay suscripciones vencidas. Todo en orden.");
      return;
    }

    logger.info(`[SUB-EXPIRY] ${expired.rows.length} suscripción(es) vencida(s) encontrada(s).`);

    let blocked = 0;
    let errors = 0;

    for (const row of expired.rows) {
      const sub = row as any;
      const companyId: string = sub.company_id;
      const companyName: string = sub.company_name;
      const periodEnd: string = sub.current_period_end;

      try {
        // 1. Actualizar tabla principal de suscripciones
        await db.execute(sql`
          UPDATE subscriptions
          SET status = 'past_due', updated_at = NOW()
          WHERE company_id = ${companyId}
        `);

        // 2. Bloquear en pricing_plugin_subscriptions (fuente de verdad del middleware)
        const tableCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'pricing_plugin_subscriptions'
          ) as exists
        `);
        const tableExists = (tableCheck.rows?.[0] as any)?.exists;

        if (tableExists) {
          await db.execute(sql`
            UPDATE pricing_plugin_subscriptions
            SET subscription_status = 'past_due',
                blocked_at = NOW(),
                blocked_reason = 'Suscripción vencida. Por favor renueve su plan para continuar.',
                updated_at = NOW()
            WHERE customer_id = ${companyId}
          `);
        }

        blocked++;
        logger.warn(
          { companyId, companyName, periodEnd },
          `[SUB-EXPIRY] Empresa bloqueada por vencimiento: ${companyName} (venció: ${periodEnd})`
        );
      } catch (rowError: any) {
        errors++;
        logger.error(
          { companyId, companyName, error: rowError.message },
          `[SUB-EXPIRY] Error bloqueando empresa ${companyName}`
        );
      }
    }

    logger.info(
      `[SUB-EXPIRY] Completado: ${blocked} bloqueada(s), ${errors} error(es).`
    );
  } catch (error: any) {
    logger.error({ error: error.message }, "[SUB-EXPIRY] Error en verificación de suscripciones vencidas");
  }
}

export function startManualSubscriptionExpiryJob() {
  logger.info(`[SUB-EXPIRY] Cron de vencimiento de suscripciones registrado (gracia: ${GRACE_PERIOD_DAYS} días, cada 24h)`);
  // Primera ejecución 2 minutos después del arranque
  setTimeout(() => runManualSubscriptionExpiry(), 2 * 60 * 1000);
  setInterval(() => runManualSubscriptionExpiry(), TWENTY_FOUR_HOURS_MS);
}

export async function runManualSubscriptionExpiryNow() {
  return runManualSubscriptionExpiry();
}
