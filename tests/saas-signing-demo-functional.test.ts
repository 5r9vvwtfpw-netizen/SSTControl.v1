import assert from "node:assert/strict";
import { createServer } from "node:http";
import { inflateSync } from "node:zlib";
import express from "express";
import type { RequestHandler } from "express";
import test from "node:test";
import sharp from "sharp";

const enabled = process.env.RUN_SAAS_SIGNING_DEMO_FUNCTIONAL === "1";

test("flujo de firma aislado de prueba en DEMO-PRUEBA", { skip: !enabled }, async (t) => {
  assert.notEqual(process.env.NODE_ENV, "production", "El harness de DEMO no se ejecuta en producción.");
  const [{ db }, { sql }, { registerSaasSigningRoutes }] = await Promise.all([
    import("../server/db"),
    import("drizzle-orm"),
    import("../server/routes/saas-signing"),
  ]);
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

  let emailCalls = 0;
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
        emailCalls++;
        return { success: true };
      },
      async sendCode() {
        emailCalls++;
        return { success: true };
      },
    },
  });

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const call = (path: string, init: RequestInit = {}) => fetch(`${baseUrl}${path}`, init);

  assert.ok(company.legal_rep_name && company.legal_rep_id, "DEMO-PRUEBA necesita datos de representante legal.");
  const retiredResponse = await call("/api/saas-signing/company", {
    method: "POST",
    headers: { "x-test-actor": "companyAdmin", "content-type": "application/json" },
    body: JSON.stringify({ capacity: "attorney" }),
  });
  assert.equal(retiredResponse.status, 410, "Ya no se generan invitaciones.");

  const image = await sharp({
    create: { width: 180, height: 60, channels: 4, background: "#ffffff" },
  }).png().toBuffer();
  const incompleteForm = new FormData();
  incompleteForm.set("signature", new Blob([image], { type: "image/png" }), "firma-prueba.png");
  const incompleteResponse = await call("/api/saas-signing/company/sign", {
    method: "POST", headers: { "x-test-actor": "companyAdmin" }, body: incompleteForm,
  });
  assert.equal(incompleteResponse.status, 400, "Debe declararse la autorización y aceptación del contrato.");
  const unauthorizedForm = new FormData();
  unauthorizedForm.set("accepted", "true");
  unauthorizedForm.set("signature", new Blob([image], { type: "image/png" }), "firma-prueba.png");
  const unauthorizedResponse = await call("/api/saas-signing/company/sign", {
    method: "POST", body: unauthorizedForm,
  });
  assert.equal(unauthorizedResponse.status, 401);

  const form = new FormData();
  form.set("accepted", "true");
  form.set("signature", new Blob([image], { type: "image/png" }), "firma-contrato-prueba.png");
  const signedResponse = await call("/api/saas-signing/company/sign", {
    method: "POST", headers: { "x-test-actor": "companyAdmin" }, body: form,
  });
  assert.equal(signedResponse.status, 201, await signedResponse.clone().text());
  const signedBody = await signedResponse.json() as any;
  assert.equal(signedBody.signed, true);
  assert.equal(signedBody.status, "test_signed");
  const requestId = signedBody.requestId as string;
  const frozenCompanyResult = await db.execute(sql`
    SELECT company_name, company_nit, signer_name, signer_id, signer_email, status, test_only
    FROM saas_contract_signing_requests WHERE id = ${requestId}
  `);
  const frozenCompany = (frozenCompanyResult as any).rows[0];
  assert.equal(frozenCompany.company_name, company.name);
  assert.equal(frozenCompany.company_nit, company.nit || "");
  assert.equal(frozenCompany.signer_name, company.legal_rep_name);
  assert.equal(frozenCompany.signer_id, company.legal_rep_id);
  assert.equal(frozenCompany.signer_email, "", "La firma directa no requiere correo.");
  assert.equal(frozenCompany.status, "test_signed");
  assert.equal(frozenCompany.test_only, true);

  const selfApprovalResponse = await call(`/api/saas-signing/review/${requestId}/approve`, {
    method: "POST",
    headers: { "x-test-actor": "companyAdmin" },
  });
  assert.equal(selfApprovalResponse.status, 403, "Un administrador de empresa no puede autoaprobar la facultad de firma.");

  const reviewResponse = await call("/api/saas-signing/review", {
    headers: { "x-test-actor": "superadmin" },
  });
  assert.equal(reviewResponse.status, 410, "No queda ninguna cola manual de aprobación.");

  const inviteResponse = await call(`/api/saas-signing/invite/${requestId}`);
  assert.equal(inviteResponse.status, 410, "No existe un enlace público para firmar.");

  const sendCodeResponse = await call(`/api/saas-signing/invite/${requestId}/code`, {
    method: "POST",
  });
  assert.equal(sendCodeResponse.status, 410);
  assert.equal(emailCalls, 0, "La firma directa no envía invitaciones ni códigos.");
  const imageResult = await db.execute(sql`
    SELECT signature_image_sha256, signature_image_object_path, signing_method, challenge_id,
           signed_by_user_id, authorization_declared
    FROM saas_contract_signatures WHERE request_id = ${requestId}
  `);
  const normalizedImage = await sharp(image).rotate().png().toBuffer();
  assert.equal((imageResult as any).rows[0]?.signature_image_sha256, (await import("../server/services/saas-contract-artifacts")).sha256(normalizedImage));
  assert.ok((imageResult as any).rows[0]?.signature_image_object_path);
  assert.equal((imageResult as any).rows[0]?.signing_method, "admin_upload");
  assert.equal((imageResult as any).rows[0]?.signed_by_user_id, requester.id);
  assert.equal((imageResult as any).rows[0]?.authorization_declared, true);
  assert.equal((imageResult as any).rows[0]?.challenge_id, null);

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

  // Do not delete request, signature image, or artifacts. They are test-only,
  // visibly watermarked and kept in the company's reviewable evidence history.
});