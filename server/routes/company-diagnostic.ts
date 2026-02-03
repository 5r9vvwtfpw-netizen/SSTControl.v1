import type { Express } from "express";
import { db } from "../db";
import { storage } from "../storage";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerCompanyDiagnosticRoutes(app: Express) {
  app.get("/api/company-diagnostic", async (req, res) => {
    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        checks: {},
        recommendations: []
      };

      // 1. Check subscription plans availability
      const allPlans = await storage.getSubscriptionPlans();
      const activePlans = allPlans.filter(p => p.status === 'active');
      results.checks.subscriptionPlans = {
        total: allPlans.length,
        active: activePlans.length,
        plans: activePlans.map(p => ({ id: p.id, name: p.name, status: p.status }))
      };

      if (activePlans.length === 0) {
        results.recommendations.push("CRITICAL: No hay planes de suscripción activos. Crear/activar planes.");
      }

      // 2. Check for recent company creation attempts (orphan users)
      const orphanUsers = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        role: schema.users.role,
        companyId: schema.users.companyId,
        createdAt: schema.users.createdAt
      })
      .from(schema.users)
      .where(eq(schema.users.role, 'superusuario'))
      .orderBy(schema.users.createdAt);

      const orphanSuperusuarios = orphanUsers.filter(u => !u.companyId);
      results.checks.orphanSuperusuarios = {
        count: orphanSuperusuarios.length,
        users: orphanSuperusuarios.map(u => ({
          username: u.username,
          createdAt: u.createdAt,
          hasCompany: !!u.companyId
        }))
      };

      if (orphanSuperusuarios.length > 0) {
        results.recommendations.push(`WARNING: ${orphanSuperusuarios.length} superusuarios sin empresa asignada (creación de empresa falló)`);
      }

      // 3. Check total companies vs subscriptions
      const companies = await db.select().from(schema.companies);
      const subscriptions = await db.select().from(schema.subscriptions);
      
      results.checks.companiesVsSubscriptions = {
        totalCompanies: companies.length,
        totalSubscriptions: subscriptions.length,
        companiesWithoutSubscription: companies.filter(c => 
          !subscriptions.some(s => s.companyId === c.id)
        ).map(c => c.name)
      };

      // 4. Check database connectivity
      results.checks.databaseConnectivity = {
        canRead: true,
        canWrite: "not tested"
      };

      // 5. Summary
      results.healthy = 
        activePlans.length > 0 && 
        orphanSuperusuarios.length === 0;

      res.json(results);
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Test subscription creation (dry run)
  app.post("/api/company-diagnostic/test-subscription", async (req, res) => {
    try {
      const { planId, companyId } = req.body;
      
      // Just verify the plan exists
      const plan = await storage.getSubscriptionPlan(planId || 'microempresa');
      
      if (!plan) {
        return res.status(400).json({
          success: false,
          error: `Plan '${planId}' not found`,
          availablePlans: (await storage.getSubscriptionPlans()).map(p => p.id)
        });
      }

      // Check if company already has a subscription
      if (companyId) {
        const existing = await db.select()
          .from(schema.subscriptions)
          .where(eq(schema.subscriptions.companyId, companyId))
          .limit(1);
        
        if (existing.length > 0) {
          return res.json({
            success: false,
            error: "Company already has a subscription",
            existingSubscription: existing[0]
          });
        }
      }

      res.json({
        success: true,
        message: "Subscription creation would succeed",
        plan: { id: plan.id, name: plan.name, status: plan.status }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}
