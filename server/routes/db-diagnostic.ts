import type { Express } from "express";
import { db } from "../db";
import { companies } from "@shared/schema";
import { sql } from "drizzle-orm";

export function registerDbDiagnosticRoutes(app: Express) {
  app.get("/api/db-diagnostic", async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasAwsRdsHost = !!process.env.AWS_RDS_HOST;
    const hasAwsRdsPassword = !!process.env.AWS_RDS_PASSWORD;
    const hasAwsRds = hasAwsRdsHost && hasAwsRdsPassword;
    const usingAwsRds = isProduction && hasAwsRds;
    
    // Query real data from the database
    let companyCount = 0;
    let recentCompanies: any[] = [];
    let subscriptionPlans: any[] = [];
    try {
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM companies`);
      companyCount = Number(countResult.rows?.[0]?.count || 0);
      
      const recentResult = await db.execute(sql`SELECT id, name, nit, created_at FROM companies ORDER BY created_at DESC LIMIT 5`);
      recentCompanies = recentResult.rows || [];
      
      // Get subscription plans with prices
      const plansResult = await db.execute(sql`SELECT id, name, display_name, price_monthly FROM subscription_plans ORDER BY price_monthly`);
      subscriptionPlans = plansResult.rows || [];
    } catch (error: any) {
      console.error('[DB-Diagnostic] Error querying:', error.message);
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        isProduction,
      },
      database: {
        hasAwsRdsHost,
        hasAwsRdsPassword,
        hasAwsRds,
        usingDatabase: usingAwsRds ? 'AWS RDS' : 'Neon (DATABASE_URL)',
        awsRdsHost: process.env.AWS_RDS_HOST ? `${process.env.AWS_RDS_HOST.substring(0, 15)}...` : 'not set',
        databaseUrlSet: !!process.env.DATABASE_URL,
      },
      realData: {
        companyCount,
        recentCompanies,
        subscriptionPlans,
      },
      decision: usingAwsRds 
        ? 'Production mode with AWS RDS credentials → Using AWS RDS' 
        : isProduction 
          ? 'Production mode but missing AWS RDS credentials → Falling back to Neon'
          : 'Development mode → Using Neon',
    });
  });
}
