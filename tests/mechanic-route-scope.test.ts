import test from "node:test";
import assert from "node:assert/strict";
import {
  getMechanicScopeForRoute,
  isMechanicRouteAllowed,
} from "../client/src/lib/mechanic-route-scope";

test("a mechanic can open only the PESV modules granted by the active company", () => {
  assert.equal(isMechanicRouteAllowed("/pesv/mantenimiento", ["maintenance"]), true);
  assert.equal(isMechanicRouteAllowed("/pesv/vehiculos", ["vehicles"]), true);
  assert.equal(isMechanicRouteAllowed("/pesv/inspecciones", ["inspections"]), true);

  assert.equal(isMechanicRouteAllowed("/pesv/mantenimiento", ["vehicles"]), false);
  assert.equal(isMechanicRouteAllowed("/pesv/auditorias", ["maintenance", "vehicles", "inspections"]), false);
  assert.equal(isMechanicRouteAllowed("/dashboard", ["maintenance"]), false);
});

test("mechanic scope checks support PESV evaluation paths and nested URLs", () => {
  assert.equal(
    getMechanicScopeForRoute("/pesv/evaluacion/evaluation-123/mantenimiento?tab=history"),
    "maintenance",
  );
  assert.equal(
    isMechanicRouteAllowed("/pesv/evaluacion/evaluation-123/inspecciones/registro-1", ["inspections"]),
    true,
  );
  assert.equal(getMechanicScopeForRoute("/pesv/evaluacion/evaluation-123/auditorias"), null);
});

test("mechanic invitations remain reachable without an active company grant", () => {
  assert.equal(isMechanicRouteAllowed("/invitaciones-mecanico", []), true);
  assert.equal(isMechanicRouteAllowed("/invitaciones-mecanico/1", []), false);
});
