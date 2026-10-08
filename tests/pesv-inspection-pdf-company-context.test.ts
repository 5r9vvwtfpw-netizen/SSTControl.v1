import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("client/src/pages/PesvInspeccionesEvaluacion.tsx", "utf8");
const pdfRoutes = readFileSync("server/routes/pesv-pdf-routes.ts", "utf8");

test("individual pre-operational inspection PDF opens with its company context", () => {
  assert.match(page, /withCompanyContext\(`\/api\/pesv\/inspecciones\/\$\{inspection\.id\}\/pdf`, inspection\.companyId\)/);
  assert.match(page, /"noopener,noreferrer"/);
});

test("individual inspection PDF only includes records owned by the selected company", () => {
  assert.match(
    pdfRoutes,
    /\.where\(and\(\s*eq\(schema\.vehicleInspections\.id, id\),\s*eq\(schema\.vehicleInspections\.companyId, companyId\),?\s*\)\)\.limit\(1\)/,
  );
});
