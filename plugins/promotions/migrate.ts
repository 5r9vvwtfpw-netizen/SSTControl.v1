/**
 * Plugin de Promociones - Script de Migración
 * 
 * ARQUITECTURA SIDECAR: Crea tablas independientes del plugin
 * Ejecutar: npx tsx plugins/promotions/migrate.ts
 */

import { sql } from "drizzle-orm";
import { db } from "../../server/db";

async function migrate() {
  console.log("[PromotionsPlugin] Starting migration...");
  
  try {
    // Create plugin_promotion_coupons table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS plugin_promotion_coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(12,2) NOT NULL,
        discount_duration_months INTEGER DEFAULT 1,
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0,
        min_employees INTEGER,
        max_employees INTEGER,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255)
      )
    `);
    console.log("[PromotionsPlugin] Created plugin_promotion_coupons table");
    
    // Create plugin_referral_ledger table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS plugin_referral_ledger (
        id SERIAL PRIMARY KEY,
        referrer_id VARCHAR(255) NOT NULL,
        referee_id VARCHAR(255) NOT NULL,
        program_type VARCHAR(50) DEFAULT 'aliados_2026',
        credit_pool_total DECIMAL(12,2) NOT NULL,
        remaining_balance DECIMAL(12,2) NOT NULL,
        activated_at TIMESTAMP,
        expires_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("[PromotionsPlugin] Created plugin_referral_ledger table");
    
    // Create plugin_digital_contracts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS plugin_digital_contracts (
        id SERIAL PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        jwt_payload JSONB NOT NULL,
        base_monthly_price DECIMAL(12,2) NOT NULL,
        current_period_price DECIMAL(12,2) NOT NULL,
        discount_duration_months INTEGER DEFAULT 1,
        currency VARCHAR(10) DEFAULT 'COP',
        coupon_code VARCHAR(50),
        referrer_id VARCHAR(255),
        employees INTEGER,
        risk_level VARCHAR(10),
        vehicles INTEGER,
        stripe_subscription_id VARCHAR(255),
        stripe_schedule_id VARCHAR(255),
        accepted_at TIMESTAMP DEFAULT NOW(),
        ip_address VARCHAR(50),
        user_agent TEXT
      )
    `);
    console.log("[PromotionsPlugin] Created plugin_digital_contracts table");
    
    // Create plugin_credit_usage_history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS plugin_credit_usage_history (
        id SERIAL PRIMARY KEY,
        ledger_id INTEGER NOT NULL,
        invoice_id VARCHAR(255),
        amount_used DECIMAL(12,2) NOT NULL,
        balance_before DECIMAL(12,2) NOT NULL,
        balance_after DECIMAL(12,2) NOT NULL,
        used_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("[PromotionsPlugin] Created plugin_credit_usage_history table");
    
    console.log("[PromotionsPlugin] Migration completed successfully!");
  } catch (error) {
    console.error("[PromotionsPlugin] Migration error:", error);
    throw error;
  }
}

// Run migration if executed directly
migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
