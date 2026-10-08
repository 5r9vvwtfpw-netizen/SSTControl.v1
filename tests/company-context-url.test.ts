import assert from "node:assert/strict";
import test from "node:test";
import { withCompanyContext } from "../client/src/lib/company-context-url";

test("adds company context to a document URL", () => {
  assert.equal(
    withCompanyContext("/api/evaluaciones-sst/evaluation-1/pdf", "company-1"),
    "/api/evaluaciones-sst/evaluation-1/pdf?companyId=company-1",
  );
});

test("adds the selected company to an individual PESV inspection PDF", () => {
  assert.equal(
    withCompanyContext("/api/pesv/inspecciones/inspection-1/pdf", "company-1"),
    "/api/pesv/inspecciones/inspection-1/pdf?companyId=company-1",
  );
});

test("preserves existing document parameters", () => {
  assert.equal(
    withCompanyContext(
      "/api/evaluaciones-sst/evaluation-1/pdf-ministerio?destinatario=ministerio",
      "company-1",
    ),
    "/api/evaluaciones-sst/evaluation-1/pdf-ministerio?destinatario=ministerio&companyId=company-1",
  );
});

test("replaces a contradictory company context", () => {
  assert.equal(
    withCompanyContext(
      "/api/matrices-iperc/matrix-1/pdf?companyId=other-company",
      "assigned-company",
    ),
    "/api/matrices-iperc/matrix-1/pdf?companyId=assigned-company",
  );
});

test("preserves URL fragments and rejects an empty company", () => {
  assert.equal(
    withCompanyContext("/api/document.pdf#page=2", "company-1"),
    "/api/document.pdf?companyId=company-1#page=2",
  );
  assert.throws(
    () => withCompanyContext("/api/document.pdf", ""),
    /companyId es requerido/,
  );
});