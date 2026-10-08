import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const card = readFileSync("client/src/components/pesv/MachineryPreoperationalInspectionsCard.tsx", "utf8");
const pdfRoutes = readFileSync("server/routes/pesv-pdf-routes.ts", "utf8");
const checklist = readFileSync("shared/pesv-maquinaria-checklist.ts", "utf8");
const apiRoutes = readFileSync("server/routes.ts", "utf8");

test("machinery inspection rows provide quick view and company-scoped PDF actions", () => {
  assert.match(card, /<Eye className="h-4 w-4"/);
  assert.match(card, /<FileDown className="h-4 w-4 text-blue-600"/);
  assert.match(card, /button-view-machinery-inspection-\$\{inspection\.id\}/);
  assert.match(card, /button-pdf-machinery-inspection-\$\{inspection\.id\}/);
  assert.match(card, /openCompanyDocument\([\s\S]*\/api\/portal\/admin\/inspecciones-maquinaria\/\$\{inspection\.id\}\/pdf/);
  assert.match(card, /selectedInspection\.answers/);
});

test("machinery PDF route validates company access and scopes the inspection query", () => {
  assert.match(
    pdfRoutes,
    /app\.get\('\/api\/portal\/admin\/inspecciones-maquinaria\/:id\/pdf', requireAuth, machineryInspectionViewPermission/,
  );
  assert.match(pdfRoutes, /const companyId = getAuthorizedReportCompanyId\(req\)/);
  assert.match(
    pdfRoutes,
    /WHERE mi\.id = \$\{req\.params\.id\} AND mi\.company_id = \$\{companyId\}/,
  );
  assert.match(pdfRoutes, /requirePermission\('vehicle_inspections:view'\)/);
});

test("maquinaria PDF uses the standardized report helpers and the shared H06 checklist", () => {
  assert.match(pdfRoutes, /documentTitle: 'INSPECCIÓN PREOPERACIONAL DE MAQUINARIA AMARILLA'/);
  assert.match(pdfRoutes, /addSimpleTable\(doc, \['Ítem', 'Resultado', 'Comentario'\]/);
  assert.match(pdfRoutes, /await addSignatureFooter\(doc, signers, true\)/);
  assert.match(pdfRoutes, /MAQUINARIA_CHECKLIST\.map/);
  assert.match(apiRoutes, /import \{ MAQUINARIA_CHECKLIST \} from "@shared\/pesv-maquinaria-checklist"/);
  assert.equal((checklist.match(/^\s+\["/gm) || []).length, 12);
});
