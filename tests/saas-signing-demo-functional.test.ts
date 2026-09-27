import assert from "node:assert/strict";
import { createServer } from "node:http";
import { inflateSync } from "node:zlib";
import express from "express";
import type { RequestHandler } from "express";
import test from "node:test";

const enabled = process.env.RUN_SAAS_SIGNING_DEMO_FUNCTIONAL === "1";

test("flujo de firma aislado de prueba en DEMO-PRUEBA", { skip: !enabled }, async (t) => {
  assert.notEqual(process.env.NODE_ENV, "production", "El harness de DEMO no se ejecuta en producción.");
  const [{ db }, { sql }, { registerSaasSigningRoutes }] = await Promise.all([
    import("../server/db"),
    import("drizzle-orm"),
    import("../server/routes/saas-signing"),
  ]);
  const priorAppUrl = process.env.APP_URL;
  const priorSessionSecret = process.env.SESSION_SECRET;
  process.env.APP_URL = "http://127.0.0.1";
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    process.env.SESSION_SECRET = "local-saas-signing-functional-test-secret-only";
  }

  const companyResult = await db.execute(sql`
    SELECT id, name, nit, legal_rep_name, legal_rep_id
    FROM companies WHERE id = 'demo-company-001' LIMIT 1
  `);
  const company = (companyResult as any).rows[0];
  assert.ok(company, "No existe DEMO-PRUEBA (demo-company-001) en esta base de datos.");

  const requesterResult = await db.execute(sql`
    SELECT id, role, company_id FROM users
    WHERE company_id = ${company.id} AND role IN ('admin', 'superusuario')
    ORDER BY CASE role WHEN 'superusuario' THEN 0 ELSE 1 END, created_at
    LIMIT 1
  `);
  const requester = (requesterResult as any).rows[0];
  assert.ok(requester, "DEMO-PRUEBA necesita una cuenta administradora para ejecutar el harness.");

  const reviewerResult = await db.execute(sql`
    SELECT id, role, company_id FROM users
    WHERE role = 'superadmin' AND id <> ${requester.id}
    ORDER BY created_at LIMIT 1
  `);
  const reviewer = (reviewerResult as any).rows[0];
  assert.ok(reviewer, "Se necesita un superadmin distinto del solicitante para revisar la representación.");

  const otherCompanyResult = await db.execute(sql`
    SELECT id FROM companies WHERE id <> ${company.id} ORDER BY id LIMIT 1
  `);
  const otherCompanyId = (otherCompanyResult as any).rows[0]?.id || "cross-tenant-company";

  const activeResult = await db.execute(sql`
    SELECT id FROM saas_contract_signing_requests
    WHERE company_id = ${company.id} AND status IN ('pending_review', 'approved') AND test_only = true
    LIMIT 1
  `);
  assert.equal(
    (activeResult as any).rows.length,
    0,
    "DEMO-PRUEBA ya tiene una solicitud pendiente. El harness no la modifica ni la reemplaza.",
  );

  let issuedCode = "";
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  const actors: Record<string, any> = {
    companyAdmin: {
      ...requester,
      companyId: requester.company_id,
    },
    superadmin: reviewer,
    otherCompanyAdmin: { id: "cross-tenant-test-user", role: "admin", companyId: otherCompanyId },
  };
  const testAuth: RequestHandler = (req, res, next) => {
    const actor = actors[req.get("x-test-actor") || ""];
    if (!actor) return res.status(401).json({ error: "Actor de harness requerido." });
    (req as any).user = actor;
    next();
  };
  const testSuperadmin: RequestHandler = (req, res, next) => {
    if ((req.user as any)?.role !== "superadmin") return res.status(403).json({ error: "Solo superadmin." });
    next();
  };
  registerSaasSigningRoutes(app, {
    testMiddlewares: { requireAuth: testAuth, requireSuperadmin: testSuperadmin },
    mailer: {
      async sendInvitation() {
        return { success: true };
      },
      async sendCode(params) {
        // The code stays inside this test process and is never returned by an API response or logged.
        issuedCode = params.code;
        return { success: true };
      },
    },
  });

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (priorAppUrl === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = priorAppUrl;
    if (priorSessionSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = priorSessionSecret;
  });

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const call = (path: string, init: RequestInit = {}) => fetch(`${baseUrl}${path}`, init);

  const signerName = company.legal_rep_name || "Representante de prueba DEMO-PRUEBA";
  const signerId = company.legal_rep_id || "TEST-DEMO-PRUEBA";
  const form = new FormData();
  form.set("signerName", signerName);
  form.set("signerEmail", "firma-demo-prueba@example.invalid");
  form.set("signerId", signerId);
  form.set("capacity", "legal_representative");
  form.set(
    "proof",
    new Blob([Buffer.from("%PDF-1.7\n% PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL\n")], { type: "application/pdf" }),
    "soporte-prueba.pdf",
  );

  const createdResponse = await call("/api/saas-signing/company", {
    method: "POST",
    headers: { "x-test-actor": "companyAdmin" },
    body: form,
  });
  assert.equal(createdResponse.status, 201, await createdResponse.clone().text());
  const created = await createdResponse.json() as any;
  const requestId = created.request.id as string;
  assert.equal(created.request.status, "pending_review");
  assert.equal(created.request.testOnly, true);
  const frozenCompanyResult = await db.execute(sql`
    SELECT company_name, company_nit FROM saas_contract_signing_requests WHERE id = ${requestId}
  `);
  const frozenCompany = (frozenCompanyResult as any).rows[0];
  assert.equal(frozenCompany.company_name, company.name);
  assert.equal(frozenCompany.company_nit, company.nit || "");

  const selfApprovalResponse = await call(`/api/saas-signing/review/${requestId}/approve`, {
    method: "POST",
    headers: { "x-test-actor": "companyAdmin" },
  });
  assert.equal(selfApprovalResponse.status, 403, "Un administrador de empresa no puede autoaprobar la facultad de firma.");

  const reviewResponse = await call("/api/saas-signing/review", {
    headers: { "x-test-actor": "superadmin" },
  });
  assert.equal(reviewResponse.status, 200);
  const review = await reviewResponse.json() as any;
  assert.ok(review.requests.some((request: any) => request.id === requestId));

  const approvalResponse = await call(`/api/saas-signing/review/${requestId}/approve`, {
    method: "POST",
    headers: { "x-test-actor": "superadmin" },
  });
  assert.equal(approvalResponse.status, 200, await approvalResponse.clone().text());

  const inviteResponse = await call(`/api/saas-signing/invite/${requestId}`);
  assert.equal(inviteResponse.status, 200);
  const invite = await inviteResponse.json() as any;
  assert.equal(invite.signerName, signerName);
  assert.equal(invite.company.name, frozenCompany.company_name);
  assert.ok(invite.contractHtml.includes("1. Partes del Contrato"));
  assert.ok(invite.contractHtml.includes("17. Contacto"));
  assert.equal("signerEmail" in invite, false);
  assert.equal("signerId" in invite, false);

  const sendCodeResponse = await call(`/api/saas-signing/invite/${requestId}/code`, {
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.99, 198.51.100.9" },
  });
  assert.equal(sendCodeResponse.status, 200);
  assert.match(issuedCode, /^\d{6}$/);
  const sendCodeBody = await sendCodeResponse.json() as any;
  assert.equal("code" in sendCodeBody, false, "El API público nunca debe devolver el OTP.");

  const signCall = () => call(`/api/saas-signing/invite/${requestId}/sign`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: issuedCode, accepted: true }),
  });
  const signatureResponses = await Promise.all([signCall(), signCall()]);
  assert.equal(signatureResponses.filter((response) => response.status === 200).length, 1);
  assert.ok(signatureResponses.every((response) => response.status === 200 || response.status === 404));
  const signedResponse = signatureResponses.find((response) => response.status === 200)!;
  const signedBody = await signedResponse.json() as any;
  assert.equal(signedBody.signed, true);
  assert.equal(signedBody.status, "test_signed");

  const companyRequestsResponse = await call("/api/saas-signing/company", {
    headers: { "x-test-actor": "companyAdmin" },
  });
  assert.equal(companyRequestsResponse.status, 200);
  const companyRequests = await companyRequestsResponse.json() as any;
  assert.equal(companyRequests.requests.find((request: any) => request.id === requestId)?.status, "test_signed");
  assert.equal(companyRequests.requests.find((request: any) => request.id === requestId)?.testOnly, true);
  const currentRealRequestIndex = companyRequests.requests.findIndex((request: any) => request.status === "signed");
  const testHistoryIndex = companyRequests.requests.findIndex((request: any) => request.id === requestId);
  if (currentRealRequestIndex >= 0) assert.ok(currentRealRequestIndex < testHistoryIndex);

  const otherHistoryResponse = await call("/api/saas-signing/company", {
    headers: { "x-test-actor": "otherCompanyAdmin" },
  });
  if ((otherCompanyResult as any).rows.length > 0) {
    assert.equal(otherHistoryResponse.status, 200);
    const otherHistory = await otherHistoryResponse.json() as any;
    assert.equal(otherHistory.requests.some((request: any) => request.id === requestId), false);
  } else {
    assert.equal(otherHistoryResponse.status, 404);
  }

  const crossTenantPdfResponse = await call(`/api/saas-signing/company/${requestId}/pdf`, {
    headers: { "x-test-actor": "otherCompanyAdmin" },
  });
  assert.equal(crossTenantPdfResponse.status, 404);

  const pdfResponse = await call(`/api/saas-signing/company/${requestId}/pdf`, {
    headers: { "x-test-actor": "companyAdmin" },
  });
  assert.equal(pdfResponse.status, 200);
  assert.equal(pdfResponse.headers.get("content-type"), "application/pdf");
  const pdf = Buffer.from(await pdfResponse.arrayBuffer());
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  const pdfBody = pdf.toString("latin1");
  const decodedStreams = [...pdfBody.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
    .map((match) => Buffer.from(match[1], "latin1"))
    .flatMap((stream) => {
      try { return [inflateSync(stream).toString("latin1")]; }
      catch { return [stream.toString("latin1")]; }
    })
    .join("\n");
  const decodedPdfText = [...decodedStreams.matchAll(/<([a-f0-9]+)>/gi)]
    .map((match) => Buffer.from(match[1], "hex").toString("latin1"))
    .join("")
    .toUpperCase()
    .replace(/\s/g, "");
  assert.ok(decodedPdfText.includes("PRUEBAFUNCIONAL"));

  // Do not delete request, supporting document, or artifacts. They are test-only,
  // visibly watermarked and kept in the company's reviewable evidence history.
});