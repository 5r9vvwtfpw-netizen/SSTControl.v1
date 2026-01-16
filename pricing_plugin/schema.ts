import { pgTable, text, varchar, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { companies } from "../shared/schema";

export const pricingConfig = pgTable("pricing_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minFeeSmall: decimal("min_fee_small", { precision: 10, scale: 2 }).notNull(),
  price1To10: decimal("price_1_10", { precision: 10, scale: 2 }).notNull(),
  price11To49: decimal("price_11_49", { precision: 10, scale: 2 }).notNull(),
  price50To199: decimal("price_50_199", { precision: 10, scale: 2 }).notNull(),
  price200Plus: decimal("price_200_plus", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("COP"),
  isActive: boolean("is_active").notNull().default(true),
  validFrom: timestamp("valid_from"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const pricingPluginSubscriptions = pgTable("pricing_plugin_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => companies.id),
  employeeCount: integer("employee_count").notNull(),
  pricingConfigId: varchar("pricing_config_id").references(() => pricingConfig.id),
  tier: text("tier").notNull(),
  monthlyСost: decimal("monthly_cost", { precision: 10, scale: 2 }).notNull(),
  pricePerLicense: decimal("price_per_license", { precision: 10, scale: 2 }).notNull(),
  minimumFee: decimal("minimum_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const pricingPluginInvoices = pgTable("pricing_plugin_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => pricingPluginSubscriptions.id),
  customerId: varchar("customer_id").notNull().references(() => companies.id),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  employeeCountBilled: integer("employee_count_billed").notNull(),
  tier: text("tier").notNull(),
  monthlyCost: decimal("monthly_cost", { precision: 10, scale: 2 }).notNull(),
  pricePerLicense: decimal("price_per_license", { precision: 10, scale: 2 }).notNull(),
  minimumFee: decimal("minimum_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentReference: text("payment_reference"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPricingConfigSchema = createInsertSchema(pricingConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingPluginSubscriptionSchema = createInsertSchema(pricingPluginSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingPluginInvoiceSchema = createInsertSchema(pricingPluginInvoices).omit({
  id: true,
  createdAt: true,
});

export type PricingConfig = typeof pricingConfig.$inferSelect;
export type InsertPricingConfig = z.infer<typeof insertPricingConfigSchema>;

export type PricingPluginSubscription = typeof pricingPluginSubscriptions.$inferSelect;
export type InsertPricingPluginSubscription = z.infer<typeof insertPricingPluginSubscriptionSchema>;

export type PricingPluginInvoice = typeof pricingPluginInvoices.$inferSelect;
export type InsertPricingPluginInvoice = z.infer<typeof insertPricingPluginInvoiceSchema>;
