import assert from "node:assert/strict";
import test from "node:test";
import type { Request } from "express";
import { getAuthorizedReportCompanyId } from "../server/lib/report-company-context";

function request(overrides: Record<string, unknown> = {}) {
  return {
    user: undefined,
    headers: {},
    query: {},
    ...overrides,
  } as unknown as Request;
}

test("uses the validated active company for an LSO without a personal companyId", () => {
  const req = request({
    user: { role: "lso", companyId: null },
    validatedLsoCompanyId: "assigned-company",
    query: { companyId: "assigned-company" },
  });

  assert.equal(getAuthorizedReportCompanyId(req), "assigned-company");
});

test("does not trust an LSO companyId from query or headers without validation", () => {
  const req = request({
    user: { role: "lso_externo", companyId: null },
    headers: { "x-company-id": "unverified-company" },
    query: { companyId: "unverified-company" },
  });

  assert.equal(getAuthorizedReportCompanyId(req), null);
});

test("keeps regular users bound to their own company", () => {
  const req = request({
    user: { role: "admin", companyId: "own-company" },
    query: { companyId: "other-company" },
  });

  assert.equal(getAuthorizedReportCompanyId(req), "own-company");
});

test("uses an explicitly selected company for superadmins", () => {
  const req = request({
    user: { role: "superadmin", companyId: null },
    query: { companyId: "selected-company" },
  });

  assert.equal(getAuthorizedReportCompanyId(req), "selected-company");
});
