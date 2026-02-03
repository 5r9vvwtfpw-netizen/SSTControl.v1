import { Router } from 'express';
import { db } from '../db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/api/write-test-diagnostic', async (req, res) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    testId: `test_${Date.now()}`,
    steps: {},
    success: false
  };

  try {
    // Step 1: Get database info
    diagnostics.steps.databaseInfo = { status: 'testing' };
    try {
      const dbResult = await db.execute(sql`SELECT current_database() as db_name, inet_server_addr() as server_addr`);
      diagnostics.steps.databaseInfo = {
        status: 'success',
        result: dbResult
      };
    } catch (err: any) {
      diagnostics.steps.databaseInfo = { status: 'failed', error: err.message };
    }

    // Step 2: Count users before
    diagnostics.steps.countBefore = { status: 'testing' };
    try {
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      diagnostics.steps.countBefore = {
        status: 'success',
        count: countResult
      };
    } catch (err: any) {
      diagnostics.steps.countBefore = { status: 'failed', error: err.message };
    }

    // Step 3: Check subscription plans
    diagnostics.steps.subscriptionPlans = { status: 'testing' };
    try {
      const plans = await db.select({
        id: schema.subscriptionPlans.id,
        name: schema.subscriptionPlans.name,
        status: schema.subscriptionPlans.status
      }).from(schema.subscriptionPlans);
      diagnostics.steps.subscriptionPlans = {
        status: 'success',
        count: plans.length,
        plans: plans.map(p => ({ id: p.id, name: p.name, status: p.status }))
      };
    } catch (err: any) {
      diagnostics.steps.subscriptionPlans = { status: 'failed', error: err.message };
    }

    // Step 4: List all companies
    diagnostics.steps.allCompanies = { status: 'testing' };
    try {
      const companies = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        createdAt: schema.companies.createdAt
      }).from(schema.companies);
      diagnostics.steps.allCompanies = {
        status: 'success',
        count: companies.length,
        companies: companies.map(c => ({ id: c.id, name: c.name, createdAt: c.createdAt }))
      };
    } catch (err: any) {
      diagnostics.steps.allCompanies = { status: 'failed', error: err.message };
    }

    // Step 5: List all subscriptions
    diagnostics.steps.allSubscriptions = { status: 'testing' };
    try {
      const subs = await db.select({
        id: schema.subscriptions.id,
        companyId: schema.subscriptions.companyId,
        status: schema.subscriptions.status,
        createdAt: schema.subscriptions.createdAt
      }).from(schema.subscriptions);
      diagnostics.steps.allSubscriptions = {
        status: 'success',
        count: subs.length,
        subscriptions: subs.map(s => ({ id: s.id, companyId: s.companyId, status: s.status, createdAt: s.createdAt }))
      };
    } catch (err: any) {
      diagnostics.steps.allSubscriptions = { status: 'failed', error: err.message };
    }

    // Step 6: List recent users (last 10)
    diagnostics.steps.recentUsers = { status: 'testing' };
    try {
      const users = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        role: schema.users.role,
        companyId: schema.users.companyId,
        createdAt: schema.users.createdAt
      }).from(schema.users)
        .orderBy(schema.users.createdAt)
        .limit(20);
      diagnostics.steps.recentUsers = {
        status: 'success',
        count: users.length,
        users: users.map(u => ({ 
          id: u.id, 
          username: u.username, 
          role: u.role, 
          companyId: u.companyId,
          createdAt: u.createdAt 
        }))
      };
    } catch (err: any) {
      diagnostics.steps.recentUsers = { status: 'failed', error: err.message };
    }

    diagnostics.success = true;
    res.json(diagnostics);
  } catch (err: any) {
    diagnostics.fatalError = err.message;
    res.status(500).json(diagnostics);
  }
});

export default router;
