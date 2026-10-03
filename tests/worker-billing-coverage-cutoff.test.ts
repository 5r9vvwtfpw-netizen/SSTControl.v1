import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { calculateWorkerPricingCharge } from "../server/services/company-worker-pricing";

const source = ts.createSourceFile(
  "worker-billing-quote.ts",
  readFileSync("server/services/worker-billing-quote.ts", "utf8"),
  ts.ScriptTarget.Latest, true,
);
const isolated = source.statements
  .filter(node => !ts.isImportDeclaration(node))
  .map(node => node.getText(source)).join("\n");
const compiled = ts.transpileModule(isolated, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

function harness(counts = [8, 8]) {
  const queries: string[] = [];
  let employees: number | undefined;
  const exports: Record<string, any> = {};
  const dialect = new PgDialect();
  vm.runInNewContext(compiled, {
    exports, sql, AbortController, setTimeout, clearTimeout,
    process: { env: {} },
    db: {
      execute: async (query: any) => {
        queries.push(dialect.sqlToQuery(query).sql);
        return queries.length === 1
          ? { rows: [{ next_cycle_start: "2026-10-01", billing_cutoff: "2026-10-01" }] }
          : { rows: [{ employee_count: counts.shift() }] };
      },
    },
    getCompanyWorkerPricing: async () => ({ mode: "fixed", unitPriceCop: 8000, discountPercent: null }),
    calculateWorkerPricingCharge,
    fetch: async (_url: string, options: { body: string }) => {
      employees = JSON.parse(options.body).employees;
      return { ok: true, json: async () => ({ token: "test-only" }) };
    },
    verifyRecalculateToken: () => ({
      valid: true,
      data: { employees, baseMonthlyPrice: 80000, currentPeriodPrice: 80000, discountDurationMonths: 0, couponCode: null },
    }),
  });
  return { queries, getQuote: exports.getVerifiedWorkerBillingQuote };
}

test("reopened manual coverage quotes 8 workers at COP 8000, without changing public tariff", async () => {
  const { getQuote, queries } = harness();
  const quote = await getQuote({ id: "company-a", name: "Empresa de prueba" }, "subscription-a");
  assert.equal(quote.employeeCount, 8);
  assert.equal(quote.paymentAmount, 64000);
  assert.equal(quote.baseMonthlyPrice, 80000);
  assert.match(queries[0], /NULLIF\(s\.metadata->>'workerBillingCoverageCutoff', ''\)::timestamp/);
  assert.ok(queries[0].indexOf("status = 'APPROVED'") < queries[0].indexOf("workerBillingCoverageCutoff"));
  assert.match(queries[0], /WHEN s\.status = 'active' THEN s\.current_period_end/);
  assert.match(queries[0], /ELSE s\.current_period_start/);
  for (const query of queries.slice(1)) {
    assert.match(query, /retirement_date >=/);
    assert.match(query, /OR created_at >=/);
  }
});

test("new registrations during quote verification still require a refresh", async () => {
  const { getQuote } = harness([8, 9]);
  await assert.rejects(
    getQuote({ id: "company-a", name: "Empresa de prueba" }, "subscription-a"),
    /cantidad de trabajadores cambió/,
  );
});