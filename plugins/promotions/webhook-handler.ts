/**
 * Plugin de Promociones - Webhook Handler
 * 
 * ARQUITECTURA SIDECAR: Handler de webhook independiente que recibe raw body
 * para validación correcta de firma de Stripe.
 * 
 * Este archivo es importado ANTES de express.json() en server/index.ts
 * para garantizar que req.body sea un Buffer, no JSON parseado.
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { handleInvoicePaid, applySecondMonthFree } from "./service";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any })
  : null;

const WEBHOOK_SECRET = process.env.STRIPE_PROMOTIONS_WEBHOOK_SECRET;

/**
 * Handler para el webhook dedicado del plugin de promociones
 * Recibe eventos de Stripe y procesa invoice.paid para activar referidos
 */
export async function handlePromotionsWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers["stripe-signature"] as string;
  
  if (!stripe) {
    console.error("[PromotionsPlugin] Stripe not configured");
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }
  
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!WEBHOOK_SECRET && isProduction) {
    console.error("[PromotionsPlugin] STRIPE_PROMOTIONS_WEBHOOK_SECRET not configured in production - rejecting webhook");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  } else if (!WEBHOOK_SECRET) {
    console.warn("[PromotionsPlugin] STRIPE_PROMOTIONS_WEBHOOK_SECRET not configured (development mode)");
  }
  
  let event: Stripe.Event;
  
  try {
    // Validate webhook signature with raw Buffer body
    if (!Buffer.isBuffer(req.body)) {
      console.error("[PromotionsPlugin] Webhook: req.body is not a Buffer");
      res.status(500).json({ error: "Webhook processing error - invalid body format" });
      return;
    }
    
    if (WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } else {
      // Development mode without signature verification
      event = JSON.parse(req.body.toString());
      console.warn("[PromotionsPlugin] Webhook: No signature verification (development mode)");
    }
  } catch (err: any) {
    console.error("[PromotionsPlugin] Webhook signature verification failed:", err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }
  
  console.log(`[PromotionsPlugin] Received webhook event: ${event.type}`);
  
  try {
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" 
          ? invoice.subscription 
          : invoice.subscription?.id;
        
        if (subscriptionId) {
          // Get subscription to check metadata
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const meta = subscription.metadata;
          
          // Check if this is a referral subscription
          if (meta.referrerId && meta.promotionType === "digital_contract") {
            // Get invoice count to determine if this is the first payment
            const invoices = await stripe.invoices.list({
              subscription: subscriptionId,
              limit: 5,
            });
            
            const paidInvoices = invoices.data.filter(inv => inv.status === "paid");
            const isFirstPayment = paidInvoices.length === 1;
            
            if (isFirstPayment) {
              console.log(`[PromotionsPlugin] First payment detected for referral subscription ${subscriptionId}`);
              
              // 1. Activate referrer credit
              await handleInvoicePaid(
                invoice.id,
                subscriptionId,
                typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || ""
              );
              
              // 2. Apply second month free to the new customer (Mes 2 gratis)
              await applySecondMonthFree(subscriptionId);
            }
          } else {
            // Regular promotion handling (non-referral)
            await handleInvoicePaid(
              invoice.id,
              subscriptionId,
              typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || ""
            );
          }
        }
        break;
      }
      
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[PromotionsPlugin] New subscription created: ${subscription.id}`);
        break;
      }
      
      default:
        console.log(`[PromotionsPlugin] Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error(`[PromotionsPlugin] Error processing webhook:`, error);
    res.status(500).json({ error: error.message });
  }
}
