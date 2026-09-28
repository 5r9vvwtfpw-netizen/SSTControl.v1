import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { and, eq, sql } from "drizzle-orm";

const enabled = process.env.RUN_WORKER_PRICING_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";

test("DEMO-PRUEBA: tarifa acordada, cotización real e historial", { skip: !enabled }, async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "No ejecutar esta prueba en producción.");
  assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se necesita el dominio de desarrollo.");

  const [{ db }, schema, { hashPassword }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
  ]);
  const before = await db.execute(sql`
    SELECT name, worker_pricing_mode, worker_unit_price_cop, worker_discount_percent
    FROM companies WHERE id = ${companyId}
  `);
  assert.equal(before.rows[0]?.name, "DEMO-PRUEBA");
  assert.equal(before.rows[0]?.worker_pricing_mode, "standard", "No reemplazar un acuerdo existente.");

  const accountId = randomUUID();
  const username = `pricing-demo-test-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  let cookie = "";
  let completed = false;

  async function request(path: string, method = "GET", body?: unknown) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
        "X-Company-Id": companyId,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json() as Record<string, any>;
    return { response, data };
  }

  const pricingPath = `/api/admin/companies/${companyId}/worker-pricing`;
  try {
    await db.insert(schema.users).values({
      id: accountId,
      username,
      password: await hashPassword(password),
      role: "superadmin",
      fullName: "Prueba funcional tarifa DEMO-PRUEBA",
      companyId,
      emailVerifiedAt: new Date(),
    });

    const login = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(login.status, 200, "La cuenta temporal debe poder iniciar sesión.");
    cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    assert.ok(cookie, "El login debe devolver la sesión.");

    const initial = await request(pricingPath);
    assert.equal(initial.response.status, 200);
    assert.equal(initial.data.mode, "standard");

    const percentage = await request(pricingPath, "PUT", { mode: "percentage", discountPercent: 20 });
    assert.equal(percentage.response.status, 200);
    const percentQuote = await request("/api/epayco/pse/cotizacion");
    assert.equal(percentQuote.response.status, 200, `Cotización porcentual: ${percentQuote.data.error || ""}`);
    assert.equal(percentQuote.data.pricingMode, "percentage");
    assert.equal(percentQuote.data.paymentAmount, Math.round(percentQuote.data.publicBaseMonthlyPrice * 0.8));
    assert.equal(percentQuote.data.couponCode, null);
    assert.ok(percentQuote.data.employeeCount > 0);

    const fixed = await request(pricingPath, "PUT", { mode: "fixed", unitPriceCop: 8000 });
    assert.equal(fixed.response.status, 200);
    const fixedQuote = await request("/api/epayco/pse/cotizacion");
    assert.equal(fixedQuote.response.status, 200, `Cotización fija: ${fixedQuote.data.error || ""}`);
    assert.equal(fixedQuote.data.pricingMode, "fixed");
    assert.equal(fixedQuote.data.effectiveUnitPriceCop, 8000);
    assert.equal(fixedQuote.data.paymentAmount, fixedQuote.data.employeeCount * 8000);
    assert.equal(fixedQuote.data.couponCode, null);

    const history = await request(`${pricingPath}/history`);
    assert.equal(history.response.status, 200);
    assert.equal(history.data.history[0].mode, "fixed");
    assert.equal(history.data.history[0].unit_price_cop, 8000);
    assert.equal(history.data.history[1].mode, "percentage");
    assert.equal(history.data.history[1].discount_percent, 20);

    const stored = await db.execute(sql`
      SELECT worker_pricing_mode, worker_unit_price_cop
      FROM companies WHERE id = ${companyId}
    `);
    assert.equal(stored.rows[0]?.worker_pricing_mode, "fixed");
    assert.equal(stored.rows[0]?.worker_unit_price_cop, 8000);
    completed = true;
    console.log(JSON.stringify({
      company: "DEMO-PRUEBA",
      billedWorkers: fixedQuote.data.employeeCount,
      publicBaseCop: fixedQuote.data.publicBaseMonthlyPrice,
      percentage20TotalCop: percentQuote.data.paymentAmount,
      fixedUnitCop: 8000,
      fixedTotalCop: fixedQuote.data.paymentAmount,
      historyEntriesVerified: 2,
      paymentInitiated: false,
    }));
  } finally {
    if (!completed && cookie) {
      const restore = await request(pricingPath, "PUT", { mode: "standard" }).catch(() => null);
      if (restore?.response.status !== 200) {
        console.error("No se pudo restablecer la tarifa general tras el fallo; revisar DEMO-PRUEBA.");
      }
    }
    await db.delete(schema.users).where(and(eq(schema.users.id, accountId), eq(schema.users.username, username)));
  }
});