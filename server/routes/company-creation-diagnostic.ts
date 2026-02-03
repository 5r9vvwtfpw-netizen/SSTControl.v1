import { Router } from 'express';
import { db } from '../db';
import * as schema from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.get('/api/company-creation-diagnostic', async (req, res) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    recommendations: []
  };

  try {
    // 0. Database Environment Info
    const isProduction = process.env.NODE_ENV === 'production';
    const hasAwsRds = !!(process.env.AWS_RDS_HOST && process.env.AWS_RDS_PASSWORD);
    
    diagnostics.checks.databaseEnvironment = {
      nodeEnv: process.env.NODE_ENV || 'not set',
      isProduction,
      hasAwsRds,
      awsRdsHost: process.env.AWS_RDS_HOST ? process.env.AWS_RDS_HOST.substring(0, 20) + '...' : 'not set',
      expectedDatabase: isProduction && hasAwsRds ? 'AWS RDS' : 'Neon',
      databaseUrlSet: !!process.env.DATABASE_URL
    };

    // 1. Test database connection and get actual database info
    diagnostics.checks.databaseConnection = { status: 'testing' };
    try {
      // Get database version and connection info
      const versionResult = await db.execute(sql`SELECT version() as db_version`);
      const dbNameResult = await db.execute(sql`SELECT current_database() as db_name`);
      const hostResult = await db.execute(sql`SELECT inet_server_addr() as host`);
      
      diagnostics.checks.databaseConnection = { 
        status: 'success', 
        message: 'Database connection working',
        databaseVersion: (versionResult as any).rows?.[0]?.db_version || 'unknown',
        currentDatabase: (dbNameResult as any).rows?.[0]?.db_name || 'unknown',
        serverHost: (hostResult as any).rows?.[0]?.host || 'unknown'
      };
    } catch (err: any) {
      diagnostics.checks.databaseConnection = { 
        status: 'failed', 
        error: err.message 
      };
      diagnostics.errors.push('Database connection failed');
    }
    
    // 1.5 List ALL companies in current database
    try {
      const allCompanies = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        nit: schema.companies.nit,
        createdAt: schema.companies.createdAt
      }).from(schema.companies).orderBy(schema.companies.createdAt);
      
      diagnostics.checks.allCompanies = {
        count: allCompanies.length,
        companies: allCompanies.map(c => ({
          id: c.id?.substring(0, 8) + '...',
          name: c.name,
          nit: c.nit,
          createdAt: c.createdAt
        }))
      };
    } catch (err: any) {
      diagnostics.checks.allCompanies = { error: err.message };
    }

    // 2. Check subscription_plans table
    diagnostics.checks.subscriptionPlans = { status: 'testing' };
    try {
      const plans = await db.select().from(schema.subscriptionPlans);
      const activePlans = plans.filter(p => p.status === 'active');
      diagnostics.checks.subscriptionPlans = {
        status: activePlans.length > 0 ? 'success' : 'failed',
        totalPlans: plans.length,
        activePlans: activePlans.length,
        planDetails: plans.map(p => ({ 
          id: p.id, 
          name: p.name, 
          displayName: p.displayName, 
          planStatus: p.status 
        }))
      };
      if (activePlans.length === 0) {
        diagnostics.errors.push('No active subscription plans found');
        diagnostics.recommendations.push('Run seed to create subscription plans');
      }
    } catch (err: any) {
      diagnostics.checks.subscriptionPlans = { 
        status: 'failed', 
        error: err.message 
      };
      diagnostics.errors.push(`Subscription plans query failed: ${err.message}`);
    }

    // 3. Check companies table structure
    diagnostics.checks.companiesTable = { status: 'testing' };
    try {
      const companyCount = await db.select().from(schema.companies).limit(1);
      diagnostics.checks.companiesTable = {
        status: 'success',
        message: 'Companies table accessible'
      };
    } catch (err: any) {
      diagnostics.checks.companiesTable = { 
        status: 'failed', 
        error: err.message 
      };
      diagnostics.errors.push(`Companies table error: ${err.message}`);
    }

    // 4. Check subscriptions table structure
    diagnostics.checks.subscriptionsTable = { status: 'testing' };
    try {
      const subCount = await db.select().from(schema.subscriptions).limit(1);
      diagnostics.checks.subscriptionsTable = {
        status: 'success',
        message: 'Subscriptions table accessible'
      };
    } catch (err: any) {
      diagnostics.checks.subscriptionsTable = { 
        status: 'failed', 
        error: err.message 
      };
      diagnostics.errors.push(`Subscriptions table error: ${err.message}`);
    }

    // 5. Check users table structure
    diagnostics.checks.usersTable = { status: 'testing' };
    try {
      const userCount = await db.select().from(schema.users).limit(1);
      diagnostics.checks.usersTable = {
        status: 'success',
        message: 'Users table accessible'
      };
    } catch (err: any) {
      diagnostics.checks.usersTable = { 
        status: 'failed', 
        error: err.message 
      };
      diagnostics.errors.push(`Users table error: ${err.message}`);
    }

    // 6. Check for orphaned superusuarios (users without companies)
    diagnostics.checks.orphanedUsers = { status: 'testing' };
    try {
      const orphanedUsers = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        role: schema.users.role,
        createdAt: schema.users.createdAt
      }).from(schema.users)
        .where(eq(schema.users.role, 'superusuario'))
        .limit(20);
      
      const orphaned = orphanedUsers.filter(u => true); // All superusuarios without company
      
      diagnostics.checks.orphanedUsers = {
        status: 'info',
        message: `Found ${orphaned.length} superusuario accounts`,
        users: orphaned.map(u => ({
          username: u.username,
          createdAt: u.createdAt
        }))
      };
    } catch (err: any) {
      diagnostics.checks.orphanedUsers = { 
        status: 'failed', 
        error: err.message 
      };
    }

    // 7. Test trial subscription creation (dry run)
    diagnostics.checks.trialCreationTest = { status: 'testing' };
    try {
      const microempresaPlan = await db.select()
        .from(schema.subscriptionPlans)
        .where(eq(schema.subscriptionPlans.id, 'microempresa'))
        .limit(1);
      
      if (microempresaPlan.length > 0) {
        diagnostics.checks.trialCreationTest = {
          status: 'success',
          message: 'Microempresa plan found - trial creation should work',
          plan: {
            id: microempresaPlan[0].id,
            name: microempresaPlan[0].name,
            planStatus: microempresaPlan[0].status
          }
        };
      } else {
        diagnostics.checks.trialCreationTest = {
          status: 'failed',
          message: 'Microempresa plan NOT FOUND'
        };
        diagnostics.errors.push('Microempresa plan missing - trial creation will fail');
      }
    } catch (err: any) {
      diagnostics.checks.trialCreationTest = { 
        status: 'failed', 
        error: err.message 
      };
    }

    // 8. Check recent company creation attempts (last 30 days)
    diagnostics.checks.recentCompanies = { status: 'testing' };
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCompanies = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        createdAt: schema.companies.createdAt
      }).from(schema.companies)
        .orderBy(schema.companies.createdAt)
        .limit(10);
      
      diagnostics.checks.recentCompanies = {
        status: 'info',
        totalRecent: recentCompanies.length,
        companies: recentCompanies.map(c => ({
          name: c.name,
          createdAt: c.createdAt
        }))
      };
    } catch (err: any) {
      diagnostics.checks.recentCompanies = { 
        status: 'failed', 
        error: err.message 
      };
    }

    // Summary
    diagnostics.summary = {
      totalChecks: Object.keys(diagnostics.checks).length,
      passed: Object.values(diagnostics.checks).filter((c: any) => c.status === 'success').length,
      failed: Object.values(diagnostics.checks).filter((c: any) => c.status === 'failed').length,
      errors: diagnostics.errors.length
    };

    diagnostics.canCreateCompanies = diagnostics.errors.length === 0;

    res.json(diagnostics);
  } catch (err: any) {
    diagnostics.fatalError = err.message;
    res.status(500).json(diagnostics);
  }
});

export default router;
