/**
 * Plugin de Promociones y Referidos - Schema de Base de Datos
 * 
 * ARQUITECTURA SIDECAR: Este plugin es completamente independiente.
 * Si se elimina, el sistema principal sigue funcionando al 100%.
 * 
 * Principio de código seguro: Solo añadir, no modificar código existente.
 */

import { pgTable, serial, varchar, text, decimal, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== CUPONES DE DESCUENTO ====================

export const pluginPromotionCoupons = pgTable("plugin_promotion_coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // 'percentage' | 'fixed_amount'
  discountValue: decimal("discount_value", { precision: 12, scale: 2 }).notNull(),
  discountDurationMonths: integer("discount_duration_months").default(1),
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").default(0),
  minEmployees: integer("min_employees"), // Minimum employees to apply
  maxEmployees: integer("max_employees"), // Maximum employees to apply
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
});

export const insertPluginPromotionCouponSchema = createInsertSchema(pluginPromotionCoupons).omit({
  id: true,
  currentUses: true,
  createdAt: true,
});

export type InsertPluginPromotionCoupon = z.infer<typeof insertPluginPromotionCouponSchema>;
export type PluginPromotionCoupon = typeof pluginPromotionCoupons.$inferSelect;

// ==================== LEDGER DE REFERIDOS (Programa Aliados) ====================

export const pluginReferralLedger = pgTable("plugin_referral_ledger", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id", { length: 255 }).notNull(), // Company ID that referred
  refereeId: varchar("referee_id", { length: 255 }).notNull(), // New company ID
  programType: varchar("program_type", { length: 50 }).default("aliados_2026"),
  creditPoolTotal: decimal("credit_pool_total", { precision: 12, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
  activatedAt: timestamp("activated_at"), // When first invoice.paid received
  expiresAt: timestamp("expires_at"), // activated_at + 12 months (security limit)
  status: varchar("status", { length: 20 }).default("pending"), // 'pending' | 'active' | 'exhausted' | 'expired'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPluginReferralLedgerSchema = createInsertSchema(pluginReferralLedger).omit({
  id: true,
  createdAt: true,
});

export type InsertPluginReferralLedger = z.infer<typeof insertPluginReferralLedgerSchema>;
export type PluginReferralLedger = typeof pluginReferralLedger.$inferSelect;

// ==================== REGISTRO DE CONTRATOS DIGITALES (JWT Audit) ====================

export const pluginDigitalContracts = pgTable("plugin_digital_contracts", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id", { length: 255 }).notNull(),
  jwtPayload: jsonb("jwt_payload").notNull(), // Full decoded JWT for audit
  baseMonthlyPrice: decimal("base_monthly_price", { precision: 12, scale: 2 }).notNull(),
  currentPeriodPrice: decimal("current_period_price", { precision: 12, scale: 2 }).notNull(),
  discountDurationMonths: integer("discount_duration_months").default(1),
  currency: varchar("currency", { length: 10 }).default("COP"),
  couponCode: varchar("coupon_code", { length: 50 }),
  referrerId: varchar("referrer_id", { length: 255 }),
  employees: integer("employees"),
  riskLevel: varchar("risk_level", { length: 10 }),
  vehicles: integer("vehicles"),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeScheduleId: varchar("stripe_schedule_id", { length: 255 }), // For price transitions
  acceptedAt: timestamp("accepted_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
});

export const insertPluginDigitalContractSchema = createInsertSchema(pluginDigitalContracts).omit({
  id: true,
  acceptedAt: true,
});

export type InsertPluginDigitalContract = z.infer<typeof insertPluginDigitalContractSchema>;
export type PluginDigitalContract = typeof pluginDigitalContracts.$inferSelect;

// ==================== HISTORIAL DE USO DE CRÉDITOS ====================

export const pluginCreditUsageHistory = pgTable("plugin_credit_usage_history", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").notNull(), // Reference to plugin_referral_ledger
  invoiceId: varchar("invoice_id", { length: 255 }), // Stripe invoice ID
  amountUsed: decimal("amount_used", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});

export const insertPluginCreditUsageHistorySchema = createInsertSchema(pluginCreditUsageHistory).omit({
  id: true,
  usedAt: true,
});

export type InsertPluginCreditUsageHistory = z.infer<typeof insertPluginCreditUsageHistorySchema>;
export type PluginCreditUsageHistory = typeof pluginCreditUsageHistory.$inferSelect;

// ==================== JWT PAYLOAD SCHEMA (Validation) ====================

export const jwtPromotionPayloadSchema = z.object({
  sub_data: z.object({
    base_monthly_price: z.number(),
    current_period_price: z.number(),
    discount_duration_months: z.number().default(1),
    currency: z.string().default("COP"),
  }),
  metadata: z.object({
    employees: z.number(),
    risk_level: z.string(),
    vehicles: z.number().optional().default(0),
    coupon_code: z.string().optional(),
  }),
  referral: z.object({
    referrer_id: z.string().optional(),
    program_type: z.string().optional().default("aliados_2026"),
  }).optional(),
  exp: z.number(),
});

export type JwtPromotionPayload = z.infer<typeof jwtPromotionPayloadSchema>;
