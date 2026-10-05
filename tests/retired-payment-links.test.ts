import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { rejectSharedPaymentLinks } from "../server/middleware/retired-payment-links";

test("shared-link initiation stops with 410 and directs to Mi Cuenta", () => {
  let status: number | undefined;
  let body: any;
  const res = {
    status(code: number) { status = code; return this; },
    json(value: unknown) { body = value; return this; },
  };
  rejectSharedPaymentLinks({} as any, res as any);
  assert.equal(status, 410);
  assert.match(body.error, /Mi Cuenta → Pagar Ahora/);
});

test("both shared initiation routes reject before auth, pricing or gateway work", () => {
  const source = readFileSync("server/routes/epayco.ts", "utf8");
  for (const path of ["enviar", "iniciar"]) {
    assert.ok(source.includes(`app.post("/api/epayco/pse/enlace/${path}", paymentOperationLimiter, rejectSharedPaymentLinks,`));
  }
  assert.match(source, /if \(!link\.used_at\) return rejectSharedPaymentLinks\(req, res\)/);
  assert.ok(source.includes('app.get("/api/epayco/pse/enlace/estado", paymentLinkReadLimiter, async'));
  assert.ok(source.includes('app.post("/api/epayco/pse/iniciar"'));
});

test("payment UI removes sharing, while previously started payments retain status view", () => {
  const direct = readFileSync("client/src/pages/PagoPSE.tsx", "utf8");
  assert.doesNotMatch(direct, /sendPaymentLink|Enviar enlace de pago|enlace\/enviar/);
  assert.match(direct, /Continuar al banco por PSE/);
  const legacy = readFileSync("client/src/pages/PagoPSEEnlace.tsx", "utf8");
  assert.match(legacy, /Boolean\(linkQuery\.data\?\.used\)/);
  assert.match(legacy, /\/api\/epayco\/pse\/enlace\/estado/);
});
