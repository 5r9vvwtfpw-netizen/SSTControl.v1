import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCopasstPeriodStatus } from "../shared/copasst-period-status";

test("COPASST periods default empty status to active", () => {
  assert.equal(normalizeCopasstPeriodStatus(""), "activo");
  assert.equal(normalizeCopasstPeriodStatus("   "), "activo");
  assert.equal(normalizeCopasstPeriodStatus(undefined), "activo");
});

test("COPASST periods preserve an explicit status after trimming", () => {
  assert.equal(normalizeCopasstPeriodStatus(" vencido "), "vencido");
});
