/**
 * Plugin de Promociones y Referidos - Servicio Principal
 * 
 * ARQUITECTURA SIDECAR: Este plugin es completamente independiente.
 * Comunicación con sistema principal solo a través de Base de Datos.
 */

import { db } from "../../server/db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import {
  pluginPromotionCoupons,
  pluginReferralLedger,
  pluginDigitalContracts,
  pluginCreditUsageHistory,
  type InsertPluginPromotionCoupon,
  type InsertPluginReferralLedger,
  type InsertPluginDigitalContract,
  type PluginPromotionCoupon,
  type PluginReferralLedger,
  type PluginDigitalContract,
  type JwtPromotionPayload,
  jwtPromotionPayloadSchema,
} from "./schema";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

const JWT_SECRET = process.env.LANDING_PAGE_API_KEY || process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === "production";

if (!JWT_SECRET) {
  const message = "[PromotionsPlugin] CRITICAL: JWT_SECRET or LANDING_PAGE_API_KEY not configured. JWT validation will fail.";
  if (isProduction) {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}

// Initialize Stripe if available (use same API version as main system)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any })
  : null;

// ==================== JWT VALIDATION (LOBBY DIGITAL) ====================

export async function validatePromotionJwt(token: string): Promise<{ valid: boolean; payload?: JwtPromotionPayload; error?: string }> {
  if (!JWT_SECRET) {
    return { valid: false, error: "JWT secret not configured - contact administrator" };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const parsed = jwtPromotionPayloadSchema.safeParse(decoded);
    
    if (!parsed.success) {
      return { valid: false, error: "Invalid JWT payload structure" };
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (parsed.data.exp < now) {
      return { valid: false, error: "JWT has expired" };
    }
    
    return { valid: true, payload: parsed.data };
  } catch (error: any) {
    return { valid: false, error: error.message || "JWT validation failed" };
  }
}

export function generatePromotionJwt(payload: Omit<JwtPromotionPayload, 'exp'>, expiresInMinutes: number = 30): string {
  if (!JWT_SECRET) {
    throw new Error("JWT secret not configured - cannot generate token");
  }
  const exp = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
  return jwt.sign({ ...payload, exp }, JWT_SECRET);
}

// ==================== CUPONES ====================

export async function createCoupon(data: InsertPluginPromotionCoupon): Promise<PluginPromotionCoupon> {
  const [coupon] = await db.insert(pluginPromotionCoupons).values(data).returning();
  return coupon;
}

export async function getCouponByCode(code: string): Promise<PluginPromotionCoupon | null> {
  const [coupon] = await db
    .select()
    .from(pluginPromotionCoupons)
    .where(eq(pluginPromotionCoupons.code, code.toUpperCase()))
    .limit(1);
  return coupon || null;
}

export async function validateCoupon(code: string, employees?: number): Promise<{ valid: boolean; coupon?: PluginPromotionCoupon; error?: string }> {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, error: "Cupón no encontrado" };
  }
  
  if (!coupon.isActive) {
    return { valid: false, error: "Cupón inactivo" };
  }
  
  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, error: "Cupón aún no válido" };
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    return { valid: false, error: "Cupón expirado" };
  }
  
  if (coupon.maxUses && coupon.currentUses && coupon.currentUses >= coupon.maxUses) {
    return { valid: false, error: "Cupón agotado" };
  }
  
  if (employees) {
    if (coupon.minEmployees && employees < coupon.minEmployees) {
      return { valid: false, error: `Mínimo ${coupon.minEmployees} empleados requeridos` };
    }
    if (coupon.maxEmployees && employees > coupon.maxEmployees) {
      return { valid: false, error: `Máximo ${coupon.maxEmployees} empleados permitidos` };
    }
  }
  
  return { valid: true, coupon };
}

export async function useCoupon(code: string): Promise<void> {
  await db
    .update(pluginPromotionCoupons)
    .set({ currentUses: sql`${pluginPromotionCoupons.currentUses} + 1` })
    .where(eq(pluginPromotionCoupons.code, code.toUpperCase()));
}

export async function getAllCoupons(): Promise<PluginPromotionCoupon[]> {
  return await db.select().from(pluginPromotionCoupons).orderBy(desc(pluginPromotionCoupons.createdAt));
}

export async function deleteCoupon(id: number): Promise<void> {
  await db.delete(pluginPromotionCoupons).where(eq(pluginPromotionCoupons.id, id));
}

export async function toggleCouponActive(id: number, isActive: boolean): Promise<void> {
  await db
    .update(pluginPromotionCoupons)
    .set({ isActive })
    .where(eq(pluginPromotionCoupons.id, id));
}

// ==================== CONTRATOS DIGITALES (JWT AUDIT) ====================

export async function registerDigitalContract(
  companyId: string,
  payload: JwtPromotionPayload,
  ipAddress?: string,
  userAgent?: string
): Promise<PluginDigitalContract> {
  const [contract] = await db.insert(pluginDigitalContracts).values({
    companyId,
    jwtPayload: payload as any,
    baseMonthlyPrice: payload.sub_data.base_monthly_price.toString(),
    currentPeriodPrice: payload.sub_data.current_period_price.toString(),
    discountDurationMonths: payload.sub_data.discount_duration_months,
    currency: payload.sub_data.currency,
    couponCode: payload.metadata.coupon_code,
    referrerId: payload.referral?.referrer_id,
    employees: payload.metadata.employees,
    riskLevel: payload.metadata.risk_level,
    vehicles: payload.metadata.vehicles,
    ipAddress,
    userAgent,
  }).returning();
  
  return contract;
}

export async function getDigitalContractByCompany(companyId: string): Promise<PluginDigitalContract | null> {
  const [contract] = await db
    .select()
    .from(pluginDigitalContracts)
    .where(eq(pluginDigitalContracts.companyId, companyId))
    .orderBy(desc(pluginDigitalContracts.acceptedAt))
    .limit(1);
  return contract || null;
}

export async function getAllDigitalContracts(): Promise<PluginDigitalContract[]> {
  return await db.select().from(pluginDigitalContracts).orderBy(desc(pluginDigitalContracts.acceptedAt));
}

// ==================== PROGRAMA DE ALIADOS (REFERIDOS) ====================

export async function createReferralEntry(
  referrerId: string,
  refereeId: string,
  creditAmount: number,
  programType: string = "aliados_2026"
): Promise<PluginReferralLedger> {
  const [entry] = await db.insert(pluginReferralLedger).values({
    referrerId,
    refereeId,
    programType,
    creditPoolTotal: creditAmount.toString(),
    remainingBalance: creditAmount.toString(),
    status: "pending",
  }).returning();
  
  return entry;
}

export async function activateReferralCredit(ledgerId: number): Promise<PluginReferralLedger | null> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 12); // 12 month security limit
  
  const [updated] = await db
    .update(pluginReferralLedger)
    .set({
      status: "active",
      activatedAt: now,
      expiresAt,
    })
    .where(eq(pluginReferralLedger.id, ledgerId))
    .returning();
  
  return updated || null;
}

export async function getReferrerCredits(referrerId: string): Promise<PluginReferralLedger[]> {
  return await db
    .select()
    .from(pluginReferralLedger)
    .where(
      and(
        eq(pluginReferralLedger.referrerId, referrerId),
        eq(pluginReferralLedger.status, "active")
      )
    )
    .orderBy(pluginReferralLedger.activatedAt);
}

export async function getTotalRemainingCredit(referrerId: string): Promise<number> {
  const credits = await getReferrerCredits(referrerId);
  return credits.reduce((sum, c) => sum + parseFloat(c.remainingBalance || "0"), 0);
}

export async function useCredit(
  ledgerId: number,
  amount: number,
  invoiceId?: string
): Promise<{ used: number; remaining: number }> {
  const [entry] = await db
    .select()
    .from(pluginReferralLedger)
    .where(eq(pluginReferralLedger.id, ledgerId))
    .limit(1);
  
  if (!entry || entry.status !== "active") {
    return { used: 0, remaining: 0 };
  }
  
  const currentBalance = parseFloat(entry.remainingBalance || "0");
  const amountToUse = Math.min(amount, currentBalance);
  const newBalance = currentBalance - amountToUse;
  const newStatus = newBalance <= 0 ? "exhausted" : "active";
  
  // Update ledger
  await db
    .update(pluginReferralLedger)
    .set({
      remainingBalance: newBalance.toString(),
      status: newStatus,
    })
    .where(eq(pluginReferralLedger.id, ledgerId));
  
  // Record usage history
  await db.insert(pluginCreditUsageHistory).values({
    ledgerId,
    invoiceId,
    amountUsed: amountToUse.toString(),
    balanceBefore: currentBalance.toString(),
    balanceAfter: newBalance.toString(),
  });
  
  return { used: amountToUse, remaining: newBalance };
}

export async function getAllReferralLedger(): Promise<PluginReferralLedger[]> {
  return await db.select().from(pluginReferralLedger).orderBy(desc(pluginReferralLedger.createdAt));
}

// ==================== STRIPE INTEGRATION ====================

export async function createPromotionalCheckout(
  companyId: string,
  payload: JwtPromotionPayload,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string; sessionId: string } | { error: string }> {
  if (!stripe) {
    return { error: "Stripe not configured" };
  }
  
  try {
    const { sub_data, metadata, referral } = payload;
    
    // Create price for initial discounted period
    const initialPrice = await stripe.prices.create({
      unit_amount: Math.round(sub_data.current_period_price * 100), // COP needs x100
      currency: sub_data.currency.toLowerCase(),
      recurring: { interval: "month" },
      product_data: {
        name: `SST Colombia - ${metadata.employees} trabajadores (Promoción)`,
      },
    });
    
    // Create checkout session with subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: initialPrice.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        companyId,
        promotionType: "digital_contract",
        baseMonthlyPrice: sub_data.base_monthly_price.toString(),
        currentPeriodPrice: sub_data.current_period_price.toString(),
        discountDurationMonths: sub_data.discount_duration_months.toString(),
        employees: metadata.employees.toString(),
        riskLevel: metadata.risk_level,
        vehicles: (metadata.vehicles || 0).toString(),
        couponCode: metadata.coupon_code || "",
        referrerId: referral?.referrer_id || "",
      },
      subscription_data: {
        metadata: {
          companyId,
          promotionType: "digital_contract",
          requiresPriceTransition: "true",
          baseMonthlyPrice: sub_data.base_monthly_price.toString(),
          transitionAfterMonths: sub_data.discount_duration_months.toString(),
        },
      },
    });
    
    return { url: session.url!, sessionId: session.id };
  } catch (error: any) {
    return { error: error.message || "Error creating checkout session" };
  }
}

export async function handleInvoicePaid(
  invoiceId: string,
  subscriptionId: string,
  customerId: string
): Promise<void> {
  if (!stripe) return;
  
  try {
    // Get subscription metadata
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const meta = subscription.metadata;
    
    if (meta.promotionType !== "digital_contract") return;
    
    const companyId = meta.companyId;
    const referrerId = meta.referrerId;
    
    // Check if this is the first invoice (Month 1 trigger for referrals)
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 5,
    });
    
    const isFirstInvoice = invoices.data.length === 1;
    
    if (isFirstInvoice && referrerId) {
      // Activate referral benefits (Net-Zero Risk)
      const contract = await getDigitalContractByCompany(companyId);
      if (contract) {
        // Credit to referrer = 1 month of new user's plan
        const creditAmount = parseFloat(contract.baseMonthlyPrice);
        
        // Find or create referral entry
        const [existingEntry] = await db
          .select()
          .from(pluginReferralLedger)
          .where(
            and(
              eq(pluginReferralLedger.referrerId, referrerId),
              eq(pluginReferralLedger.refereeId, companyId)
            )
          )
          .limit(1);
        
        if (existingEntry && existingEntry.status === "pending") {
          await activateReferralCredit(existingEntry.id);
        } else if (!existingEntry) {
          const newEntry = await createReferralEntry(referrerId, companyId, creditAmount);
          await activateReferralCredit(newEntry.id);
        }
      }
    }
    
    // Handle price transition after discount period
    if (meta.requiresPriceTransition === "true") {
      const transitionAfterMonths = parseInt(meta.transitionAfterMonths || "1");
      const paidInvoicesCount = invoices.data.filter(inv => inv.status === "paid").length;
      
      if (paidInvoicesCount >= transitionAfterMonths) {
        // Transition to base price
        const basePrice = parseFloat(meta.baseMonthlyPrice);
        
        // Create new price at base rate
        const newPrice = await stripe.prices.create({
          unit_amount: Math.round(basePrice * 100),
          currency: "cop",
          recurring: { interval: "month" },
          product_data: {
            name: `SST Colombia - Plan Regular`,
          },
        });
        
        // Update subscription to new price
        const subItems = subscription.items.data;
        if (subItems.length > 0) {
          await stripe.subscriptions.update(subscriptionId, {
            items: [
              {
                id: subItems[0].id,
                price: newPrice.id,
              },
            ],
            metadata: {
              ...subscription.metadata,
              requiresPriceTransition: "false",
              priceTransitionComplete: "true",
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("[PromotionsPlugin] Error handling invoice.paid:", error);
  }
}

// ==================== STATISTICS ====================

export async function getPromotionStats(): Promise<{
  totalCoupons: number;
  activeCoupons: number;
  totalContracts: number;
  totalReferrals: number;
  activeReferrals: number;
  totalCreditsIssued: number;
  totalCreditsUsed: number;
}> {
  const coupons = await getAllCoupons();
  const contracts = await getAllDigitalContracts();
  const referrals = await getAllReferralLedger();
  
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const activeReferrals = referrals.filter(r => r.status === "active").length;
  const totalCreditsIssued = referrals.reduce((sum, r) => sum + parseFloat(r.creditPoolTotal || "0"), 0);
  const totalCreditsUsed = referrals.reduce((sum, r) => {
    const total = parseFloat(r.creditPoolTotal || "0");
    const remaining = parseFloat(r.remainingBalance || "0");
    return sum + (total - remaining);
  }, 0);
  
  return {
    totalCoupons: coupons.length,
    activeCoupons,
    totalContracts: contracts.length,
    totalReferrals: referrals.length,
    activeReferrals,
    totalCreditsIssued,
    totalCreditsUsed,
  };
}
