import { db } from '../db';
import { sql } from 'drizzle-orm';
import logger from '../lib/logger';

/**
 * Corrección puntual: las facturas creadas via webhook de Stripe usaban
 * plan.priceMonthly en vez del monto real cobrado por Stripe (session.amount_total).
 * Esta migración encuentra esas facturas comparando el total de la factura con
 * el lastPaymentAmount guardado en el metadata de la suscripción, y las corrige.
 * Es idempotente: si ya están correctas no hace nada.
 */
export async function fixInvoiceStripeAmount(): Promise<void> {
  try {
    const taxRate = 0.19;

    // Buscar facturas cuyo total no coincide con el monto real pagado a Stripe
    // (el monto real está guardado en subscriptions.metadata->>'lastPaymentAmount')
    const rows = await db.execute(sql`
      SELECT
        i.id          AS invoice_id,
        i.total       AS invoice_total,
        i.subtotal    AS invoice_subtotal,
        i.tax_amount  AS invoice_tax,
        (s.metadata->>'lastPaymentAmount')::int AS stripe_amount,
        c.name        AS company_name
      FROM invoices i
      JOIN subscriptions s ON s.company_id = i.company_id
      JOIN companies c ON c.id = i.company_id
      WHERE
        i.status = 'paid'
        AND (s.metadata->>'lastPaymentAmount') IS NOT NULL
        AND (s.metadata->>'lastPaymentAmount')::int > 0
        AND (s.metadata->>'lastPaymentAmount')::int != i.total
        AND i.issue_date >= NOW() - INTERVAL '7 days'
    `);

    const invoices = rows.rows as Array<{
      invoice_id: string;
      invoice_total: number;
      invoice_subtotal: number;
      invoice_tax: number;
      stripe_amount: number;
      company_name: string;
    }>;

    if (!invoices.length) {
      logger.info('[fix-invoice-stripe-amount] No se encontraron facturas con montos incorrectos');
      return;
    }

    for (const row of invoices) {
      const correctTotal = row.stripe_amount;
      const newSubtotal = Math.round(correctTotal / (1 + taxRate));
      const newTax = correctTotal - newSubtotal;

      await db.execute(sql`
        UPDATE invoices
        SET total      = ${correctTotal},
            subtotal   = ${newSubtotal},
            tax_amount = ${newTax}
        WHERE id = ${row.invoice_id}
          AND total != ${correctTotal}
      `);

      logger.info({
        invoiceId: row.invoice_id,
        company: row.company_name,
        before: row.invoice_total,
        after: correctTotal,
      }, '[fix-invoice-stripe-amount] Factura corregida');
    }

    logger.info({ count: invoices.length }, '[fix-invoice-stripe-amount] Corrección completada');
  } catch (err: any) {
    logger.warn({ err }, '[fix-invoice-stripe-amount] Error en corrección (no crítico)');
  }
}
