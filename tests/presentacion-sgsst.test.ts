import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { PDFDocument } from "pdf-lib";
import { presentacionSgsstSchema, presentacionSgsstFilename } from "../shared/presentacion-sgsst";
import { generatePresentacionSgsstPdf } from "../server/services/pdf-presentacion-sgsst";
import { registerPresentacionSgsstRoutes } from "../server/routes/presentacion-sgsst";

const input = {
  empresa: "Compañía de Ejemplo S.A.S.",
  nit: "900.123.456-7",
  destinatario: "Representante legal",
  fechaEmision: "2026-10-01",
};

test("valida empresa obligatoria y rechaza campos inválidos sin inventar datos", () => {
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, empresa: "   " }).success, false);
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, empresa: "X".repeat(121) }).success, false);
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, empresa: "Empresa\nCabecera" }).success, false);
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, nit: 123 }).success, false);
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, fechaEmision: "2026-02-30" }).success, false);
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, fechaEmision: "2026-2-1" }).success, false);
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, templatePath: "/tmp/other.pdf" }).success, false);
  assert.deepEqual(presentacionSgsstSchema.parse({ empresa: "  Empresa S.A.S.  ", fechaEmision: input.fechaEmision }), {
    empresa: "Empresa S.A.S.", nit: "", destinatario: "", fechaEmision: input.fechaEmision,
  });
  assert.equal(presentacionSgsstSchema.safeParse({ ...input, fechaEmision: "2028-02-29" }).success, true);
  assert.match(presentacionSgsstFilename('Compañía/"\r\n S.A.S.'), /^Presentacion-SG-SST-[a-zA-Z0-9-]+\.pdf$/);
});

test("conserva las cuatro páginas originales y añade una sola portada personalizada", async () => {
  const templateBytes = await readFile("server/assets/presentacion-sgsst-base.pdf");
  assert.equal(createHash("sha256").update(templateBytes).digest("hex"), "fb5c602563e4317d15f66f9876fa67912acb45d6e9fd30c3511232e7df018ba3");
  const template = await PDFDocument.load(templateBytes);
  const result = await PDFDocument.load(await generatePresentacionSgsstPdf(input));
  assert.equal(result.getPageCount(), 5);
  assert.equal(result.getTitle(), `Presentación SG-SST — ${input.empresa}`);
  for (let index = 0; index < 4; index++) {
    assert.deepEqual(result.getPage(index + 1).getSize(), template.getPage(index).getSize());
  }
});

test("el texto máximo y los campos vacíos no crean páginas extra", async () => {
  for (const data of [
    { ...input, nit: "", destinatario: "" },
    { ...input, empresa: "W".repeat(120), nit: "9".repeat(30), destinatario: "W".repeat(120) },
  ]) {
    const result = await PDFDocument.load(await generatePresentacionSgsstPdf(data));
    assert.equal(result.getPageCount(), 5);
  }
});

test("API protegida: 401 anónimo, 403 otro rol, 400 inválido y PDF para superadmin", async () => {
  const app = express();
  app.use(express.json());
  // Solo esta app de prueba atribuye roles a una cabecera. La app real usa su sesión.
  app.use((req, _res, next) => {
    const role = req.get("x-test-role");
    req.isAuthenticated = (() => Boolean(role)) as typeof req.isAuthenticated;
    if (role) req.user = { role } as Express.User;
    next();
  });
  registerPresentacionSgsstRoutes(app);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/presentacion-sgsst/pdf`;
  const post = (body: unknown, role?: string) => fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(role ? { "x-test-role": role } : {}) },
    body: JSON.stringify(body),
  });
  try {
    assert.equal((await post(input)).status, 401);
    assert.equal((await post(input, "admin")).status, 403);
    assert.equal((await post({ ...input, empresa: "" }, "superadmin")).status, 400);
    const response = await post(input, "superadmin");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /^application\/pdf/);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("content-disposition"), `attachment; filename="${presentacionSgsstFilename(input.empresa)}"`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.equal((await PDFDocument.load(bytes)).getPageCount(), 5);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});