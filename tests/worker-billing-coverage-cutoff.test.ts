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

interface HarnessWorker {
  companyId: string;
  status: string;
  createdAt: string;
  retirementDate: string | null;
}

interface HarnessOptions {
  counts?: number[];
  workers?: HarnessWorker[];
  nextCycleStart?: string;
  billingCutoff?: string;
}

function harness({
  counts = [8, 8],
  workers,
  nextCycleStart = "2026-10-01",
  billingCutoff = "2026-10-01",
}: HarnessOptions = {}) {
  const queries: string[] = [];
  let employees: number | undefined;
  const exports: Record<string, any> = {};
  const dialect = new PgDialect();
  vm.runInNewContext(compiled, {
    exports, sql, AbortController, setTimeout, clearTimeout,
    process: { env: {} },
    db: {
      execute: async (query: any) => {
        const compiledQuery = dialect.sqlToQuery(query);
        queries.push(compiledQuery.sql);
        if (queries.length === 1) {
          return { rows: [{ next_cycle_start: nextCycleStart, billing_cutoff: billingCutoff }] };
        }
        if (!workers) return { rows: [{ employee_count: counts.shift() }] };

        const toTimestamp = (value: unknown) => value instanceof Date
          ? value.getTime()
          : Date.parse(String(value));
        const [companyId, cycleBoundary, coverageCutoff] = compiledQuery.params;
        const employeeCount = workers.filter(worker =>
          worker.companyId === companyId && (
            worker.status === "activo" ||
            worker.status === "inactivo" ||
            (
              worker.status === "retirado" &&
              (
                (worker.retirementDate !== null &&
                  toTimestamp(worker.retirementDate) >= toTimestamp(cycleBoundary)) ||
                toTimestamp(worker.createdAt) >= toTimestamp(coverageCutoff)
              )
            )
          )
        ).length;
        return { rows: [{ employee_count: employeeCount }] };
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
  assert.match(
    queries[0],
    /ELSE COALESCE\(\s*NULLIF\(s\.metadata->>'workerBillingCoverageCutoff', ''\)::timestamp,\s*s\.current_period_start\s*\)/,
  );
  for (const query of queries.slice(1)) {
    assert.match(query, /retirement_date >=/);
    assert.match(query, /OR created_at >=/);
  }
});

test("first PSE quote bills a worker registered and retired eight hours later in the active cycle", async () => {
  const { getQuote, queries } = harness({
    nextCycleStart: "2026-11-01T00:00:00.000Z",
    billingCutoff: "2026-10-01T12:00:00.000Z",
    workers: [
      {
        companyId: "company-a",
        status: "retirado",
        createdAt: "2026-10-05T08:00:00.000Z",
        retirementDate: "2026-10-05",
      },
      {
        companyId: "company-a",
        status: "retirado",
        createdAt: "2026-09-25T08:00:00.000Z",
        retirementDate: "2026-10-05",
      },
      {
        companyId: "another-company",
        status: "retirado",
        createdAt: "2026-10-05T08:00:00.000Z",
        retirementDate: "2026-10-05",
      },
    ],
  });

  const quote = await getQuote({ id: "company-a", name: "Empresa de prueba" }, "subscription-a");

  assert.equal(quote.employeeCount, 1);
  assert.equal(quote.paymentAmount, 8000);
  assert.match(queries[0], /s\.current_period_start/);
  assert.match(queries[1], /retirement_date >=/);
  assert.match(queries[1], /OR created_at >=/);
  assert.match(queries[2], /retirement_date >=/);
  assert.match(queries[2], /OR created_at >=/);
});

test("new registrations during quote verification still require a refresh", async () => {
  const { getQuote } = harness({ counts: [8, 9] });
  await assert.rejects(
    getQuote({ id: "company-a", name: "Empresa de prueba" }, "subscription-a"),
    /cantidad de trabajadores cambió/,
  );
});