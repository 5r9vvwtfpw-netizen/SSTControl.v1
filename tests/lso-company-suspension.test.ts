import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routes = readFileSync("server/routes.ts", "utf8");
const portal = readFileSync("server/routes/licensed-professionals.ts", "utf8");
const guard = readFileSync("server/middleware/lso-company-suspension.ts", "utf8");
const ui = readFileSync("client/src/pages/PortalLicenciado.tsx", "utf8");
const boundary = readFileSync("client/src/components/LsoCompanyAccessBoundary.tsx", "utf8");

test("manual suspension is per company and excludes non-LSO roles", () => {
  assert.match(guard, /eq\(subscriptions.status, "suspended"\)/);
  assert.doesNotMatch(guard, /"past_due"|"expired"|"trial"/);
  assert.match(guard, /role !== "lso" && role !== "lso_externo"/);
  assert.match(guard, /code: LSO_COMPANY_SUSPENDED/);
  assert.match(guard, /status\(403\)/);
  assert.doesNotMatch(guard, /\.update\(|\.delete\(/);
});

test("validated operational context and resource owner both enforce suspension", () => {
  assert.match(routes, /assertLsoAssignedToCompany\(user.id, selectedCompanyId, false\)/);
  assert.match(routes, /denySuspendedLsoCompany\(user.role, selectedCompanyId, res\)/);
  assert.match(routes, /getSuspendedCompanyIds\(\[companyId\]\)/);
  assert.match(routes, /denySuspendedLsoCompany\(req.user.role, req.params.id, res\)/);
  assert.match(routes, /denySuspendedLsoCompany\(user.role, receiver.companyId, res\)/);
});

test("portal document reads, signatures, reports and archived downloads resolve actual ownership", () => {
  for (const [segment, table] of [
    ["investigacion", "accidentInvestigations"],
    ["designacion", "responsibleDesignations"],
    ["evaluacion-sst", "evaluacionesSst"],
    ["plan-trabajo", "planesTrabajoAnual"],
    ["matriz-iperc", "matricesIperc"],
    ["programa-capacitacion", "programasCapacitacion"],
    ["objetivo-sst", "objetivosSst"],
  ]) {
    assert.ok(portal.includes(`${segment}: schema.${table}`) ||
      portal.includes(`"${segment}": schema.${table}`), segment);
  }
  assert.match(portal, /table = schema.evaluacionesPesv/);
  assert.match(portal, /table = schema.lsoManagementReportArchives/);
  assert.match(portal, /parts\[0\] === "empresa" \|\| parts\[0\] === "matrices-iperc-empresa"/);
  assert.match(portal, /denySuspendedLsoCompany\(user.role, companyId, res\)/);
});

test("cross-company portal lists filter suspended companies without losing assignments", () => {
  assert.equal((portal.match(/excludeSuspendedCompanies\(assignments.map/g) || []).length, 5);
  assert.equal((portal.match(/if \(assignments.length === 0 && user.companyId\)/g) || []).length, 5);
  assert.match(portal, /archives.filter\(archive => !suspended.has\(archive.companyId\)\)/);
  assert.match(portal, /suspendedCompanyIds.has\(empresa.id\)/);
  assert.match(portal, /companySuspended: true/);
  assert.match(portal, /companySuspended: false/);
  assert.match(portal, /totalAssignedCompanies: assignments.length/);
});

test("suspended company list entries hide company identity and business details", () => {
  const suspendedEntry = portal.match(
    /if \(suspendedCompanyIds\.has\(empresa\.id\)\) \{([\s\S]*?)\n        \}/,
  )?.[1];
  assert.ok(suspendedEntry);
  assert.match(suspendedEntry, /name: "Acceso suspendido"/);
  assert.match(suspendedEntry, /nit: ""/);
  assert.match(suspendedEntry, /city: null/);
  assert.match(suspendedEntry, /riskLevel: ""/);
  assert.match(suspendedEntry, /numberOfWorkers: 0/);
  assert.match(suspendedEntry, /numberOfVehicles: null/);
  assert.doesNotMatch(suspendedEntry, /\.\.\.empresa/);
});

test("suspended company actions are disabled and other companies stay available", () => {
  assert.match(ui, /<fieldset\s+disabled=\{empresa.companySuspended\}/);
  assert.match(ui, /empresa.companySuspended \? "Empresa suspendida"/);
  assert.match(ui, /empresa\.companySuspended \? "—" : empresa\.nit/);
  const actionGroup = ui.slice(ui.indexOf("<fieldset"), ui.indexOf("</fieldset>"));
  for (const action of ["button-sst-", "button-pesv-", "InformeConsolidadoButton", "button-message-"]) {
    assert.ok(actionGroup.includes(action), action);
  }
});

test("already-open modules recheck status while the portal itself stays accessible", () => {
  assert.match(boundary, /refetchInterval: 15_000/);
  assert.match(boundary, /refetchOnWindowFocus: "always"/);
  assert.match(boundary, /if \(portalHome\) return/);
  assert.match(boundary, /if \(suspended \|\| isError\)/);
  assert.match(boundary, /Volver a mis empresas/);
  assert.match(boundary, /queryClient.resetQueries/);
});
