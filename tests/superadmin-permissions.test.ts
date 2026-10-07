import assert from "node:assert/strict";
import test from "node:test";
import {
  getRolePermissions,
  hasPermission,
  rolePermissions,
} from "../shared/permissions";
import { canAccessRoute, routePermissions } from "../shared/route-permissions";

test("superadmin receives every permission granted to any app role", () => {
  const allCurrentPermissions = [
    ...new Set(Object.values(rolePermissions).flat()),
  ];
  const superadminPermissions = getRolePermissions("superadmin");

  assert.deepEqual(new Set(superadminPermissions), new Set(allCurrentPermissions));
  for (const permission of allCurrentPermissions) {
    assert.equal(hasPermission("superadmin", permission), true, permission);
  }
});

test("superadmin can open every registered permission-protected route", () => {
  const superadminPermissions = getRolePermissions("superadmin");

  for (const [path, requiredPermissions] of Object.entries(routePermissions)) {
    if (requiredPermissions.length === 0) continue;
    assert.equal(
      canAccessRoute(superadminPermissions, path),
      true,
      `Superadmin was denied route ${path}`,
    );
  }
});
