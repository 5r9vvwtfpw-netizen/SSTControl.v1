import assert from "node:assert/strict";
import test from "node:test";
import { validateManagementReviewApproval } from "../server/lib/management-review-approval";
import { canWrite, hasPermission } from "../shared/permissions";

test("management review approval requires a participant", () => {
  const result = validateManagementReviewApproval({
    participants: 0,
    topics: 1,
    decisions: 1,
  });

  assert.deepEqual(result, {
    valid: false,
    error: "La revisión debe tener al menos un participante antes de aprobarse",
  });
});

test("management review approval requires a documented input", () => {
  const result = validateManagementReviewApproval({
    participants: 1,
    topics: 0,
    decisions: 1,
  });

  assert.deepEqual(result, {
    valid: false,
    error: "La revisión debe tener al menos una entrada o tema documentado antes de aprobarse",
  });
});

test("management review approval requires a decision", () => {
  const result = validateManagementReviewApproval({
    participants: 1,
    topics: 1,
    decisions: 0,
  });

  assert.deepEqual(result, {
    valid: false,
    error: "La revisión debe tener al menos una decisión documentada antes de aprobarse",
  });
});

test("management review approval succeeds only with all minimum evidence", () => {
  assert.deepEqual(
    validateManagementReviewApproval({
      participants: 1,
      topics: 1,
      decisions: 1,
    }),
    { valid: true },
  );
});

test("alta direccion can view and approve but cannot write management data", () => {
  assert.equal(hasPermission("alta_direccion", "management_review:view"), true);
  assert.equal(hasPermission("alta_direccion", "management_review:approve"), true);
  assert.equal(hasPermission("alta_direccion", "sst_management:create"), false);
  assert.equal(hasPermission("alta_direccion", "sst_management:edit"), false);
  assert.equal(hasPermission("alta_direccion", "sst_management:delete"), false);
  assert.equal(canWrite("alta_direccion", "sst_management"), false);
});