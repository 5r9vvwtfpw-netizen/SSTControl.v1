import assert from "node:assert/strict";
import test from "node:test";
import { withActiveCompanyContext, withCompanyContext } from "../client/src/lib/company-context-url";

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

test("adds active company context to direct module PDF links", () => {
  assert.equal(
    withActiveCompanyContext("/api/pesv/alcohol-registros/pdf", "company-1"),
    "/api/pesv/alcohol-registros/pdf?companyId=company-1",
  );
  assert.equal(
    withActiveCompanyContext("/api/planes-emergencia/plan-1/pdf", "company-1"),
    "/api/planes-emergencia/plan-1/pdf?companyId=company-1",
  );
});

test("keeps company-owned document links unchanged when the user is company-scoped", () => {
  assert.equal(
    withActiveCompanyContext("/api/evaluaciones-sst/evaluation-1/pdf", null),
    "/api/evaluaciones-sst/evaluation-1/pdf",
  );
});

test("does not append tenant context to external file URLs", () => {
  const externalUrl = "https://storage.example.com/report.pdf?signature=stored";
  assert.equal(withActiveCompanyContext(externalUrl, "company-1"), externalUrl);
});

test("uses the active superadmin access session for direct document links", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) =>
        key === "superadmin_access_session"
          ? JSON.stringify({ companyId: "active-company" })
          : null,
    },
  });

  try {
    assert.equal(
      withActiveCompanyContext("/api/pesv/inspecciones/inspection-1/pdf"),
      "/api/pesv/inspecciones/inspection-1/pdf?companyId=active-company",
    );
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, "localStorage", descriptor);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: unknown }).localStorage;
    }
  }
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