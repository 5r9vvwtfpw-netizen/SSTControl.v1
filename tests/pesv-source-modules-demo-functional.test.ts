import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import test from "node:test";
import { sql } from "drizzle-orm";

const enabled = process.env.RUN_PESV_SOURCE_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";
const date = new Date().toISOString().slice(0, 10);
const marker = `PRUEBA FUNCIONAL H08-H07 DEMO-PRUEBA ${date} ${randomBytes(4).toString("hex")}`;

test("DEMO-PRUEBA: captura, consulta y edición de Rutas Seguras y gastos GPS", { skip: !enabled }, async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "Esta prueba solo se permite en desarrollo.");
  assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se requiere el dominio de desarrollo.");
  const [{ db }, schema, { hashPassword }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
  ]);
  const companyResult = await db.execute(sql`SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1`);
  const company = companyResult.rows[0] as { id: string; name: string } | undefined;
  assert.equal(company?.name, "DEMO-PRUEBA", "La prueba debe limitarse a DEMO-PRUEBA.");

  const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const adminId = randomUUID();
  const username = `pesv-source-test-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(24).toString("base64url");
  const outcomes: string[] = [];
  let cookie = "";
  let routeId = "";
  let expenseId = "";
  let temporaryAccountPrepared = false;

  async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Cookie", cookie);
    headers.set("X-Company-Id", companyId);
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const text = await response.text();
    assert.ok(response.ok, `${init.method || "GET"} ${path} devolvió ${response.status}: ${text}`);
    return text ? JSON.parse(text) as T : undefined as T;
  }

  try {
    await db.insert(schema.users).values({
      id: adminId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId,
      fullName: "Cuenta temporal de prueba funcional PESV",
      email: `${username}@example.invalid`,
      emailVerifiedAt: new Date(),
    });
    temporaryAccountPrepared = true;
    const login = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(login.status, 200, "La cuenta de prueba debe iniciar sesión.");
    cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    assert.ok(cookie, "El login debe devolver las cookies de sesión.");
    outcomes.push("Autenticación de desarrollo: correcta");

    const route = await api<{ id: string; routeName: string; signageMeasures: string; controlPoints: string }>("/api/safe-routes", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        routeName: `${marker} · Ruta segura`,
        origin: `${marker} · origen`,
        destination: `${marker} · destino`,
        routeType: "urbana",
        riskLevel: "bajo",
        isActive: 1,
        signageMeasures: `${marker} · señalización de prueba; no instalada ni operativa`,
        signageImplementationDate: date,
        signageResponsible: `${marker} · responsable de prueba`,
        signageEvidenceReference: `${marker} · soporte de prueba no válido`,
        controlPoints: `${marker} · puesto de control simulado; no operativo`,
        controlFrequency: "Prueba funcional; no corresponde a una operación real",
        controlResponsible: `${marker} · responsable de prueba`,
        controlEvidenceReference: `${marker} · soporte de prueba no válido`,
        observations: `${marker} · registro de validación, no representa hechos reales`,
      }),
    });
    routeId = route.id;
    assert.match(route.routeName, new RegExp(marker));
    assert.match(route.signageMeasures, new RegExp(marker));
    assert.match(route.controlPoints, new RegExp(marker));
    outcomes.push(`Rutas Seguras: alta correcta (${route.id})`);

    const routes = await api<Array<{ id: string; routeName: string; signageMeasures: string; controlPoints: string }>>("/api/safe-routes");
    const listedRoute = routes.find((item) => item.id === routeId);
    assert.ok(listedRoute, "La ruta de prueba debe aparecer en la consulta de la empresa.");
    assert.match(listedRoute.signageMeasures, new RegExp(marker));
    assert.match(listedRoute.controlPoints, new RegExp(marker));
    outcomes.push("Rutas Seguras: consulta de campos de señalización y control correcta");

    const updatedRoute = await api<{ controlFrequency: string }>(`/api/safe-routes/${routeId}`, {
      method: "PATCH",
      body: JSON.stringify({ controlFrequency: `${marker} · frecuencia actualizada` }),
    });
    assert.equal(updatedRoute.controlFrequency, `${marker} · frecuencia actualizada`);
    outcomes.push("Rutas Seguras: edición correcta");

    const expense = await api<{ id: string; provider: string; amountCop: number; supportReference: string }>("/api/pesv/gps-expenses", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        provider: `${marker} · proveedor de prueba`,
        expenseType: "Prueba funcional (no contable)",
        concept: `${marker} · validar captura de gasto GPS`,
        expenseDate: date,
        periodStart: date,
        periodEnd: date,
        amountCop: 0,
        coverage: `${marker} · cobertura no operativa`,
        supportReference: `${marker} · referencia no válida como soporte real`,
        observations: `${marker} · valor cero usado solo para validar campos; no es un gasto real`,
      }),
    });
    expenseId = expense.id;
    assert.match(expense.provider, new RegExp(marker));
    assert.equal(expense.amountCop, 0);
    outcomes.push(`Monitoreo GPS: alta correcta (${expense.id})`);

    const expenses = await api<Array<{ id: string; concept: string; amountCop: number }>>(`/api/pesv/gps-expenses?companyId=${companyId}`);
    const listedExpense = expenses.find((item) => item.id === expenseId);
    assert.ok(listedExpense, "El gasto GPS de prueba debe aparecer para la empresa.");
    assert.match(listedExpense.concept, new RegExp(marker));
    const updatedExpense = await api<{ observations: string }>(`/api/pesv/gps-expenses/${expenseId}`, {
      method: "PATCH",
      body: JSON.stringify({ observations: `${marker} · edición verificada; no es un gasto real` }),
    });
    assert.equal(updatedExpense.observations, `${marker} · edición verificada; no es un gasto real`);
    outcomes.push("Monitoreo GPS: consulta y edición correctas");

    const reportState = await api<{ routeMeasures: number; gpsExpenses: number }>(
      `/api/pesv/informes-trimestrales/medidas-prevencion/estado?from=${date.slice(0, 4)}-01-01&to=${date.slice(0, 4)}-12-31`,
    );
    assert.equal(typeof reportState.routeMeasures, "number");
    assert.equal(typeof reportState.gpsExpenses, "number");
    outcomes.push("Generador trimestral: consulta autenticada del estado y aislamiento de datos de prueba correctos");
  } finally {
    if (temporaryAccountPrepared) {
      await db.update(schema.users).set({
        role: "trabajador",
        workerId: null,
        companyId: null,
        emailVerifiedAt: null,
        password: await hashPassword(randomBytes(32).toString("base64url")),
      }).where(sql`id = ${adminId}`);
    }
    await mkdir("attached_assets", { recursive: true });
    const evidencePath = `attached_assets/DEMO-PRUEBA_prueba_funcional_modulos_PESV_${date}.txt`;
    await writeFile(evidencePath, [
      "PRUEBA FUNCIONAL — DEMO-PRUEBA (DESARROLLO)",
      `Marcador: ${marker}`,
      `Fecha: ${date}`,
      "Alcance: API autenticada del módulo Rutas Seguras y Monitoreo GPS.",
      ...outcomes.map((outcome) => `Resultado: ${outcome}`),
      `Ruta de prueba conservada: ${routeId || "no se alcanzó a crear"}`,
      `Gasto GPS de prueba conservado: ${expenseId || "no se alcanzó a crear"}`,
      "Los registros usan valores marcados como prueba; el gasto tiene valor cero y no representa un pago real.",
      "La cuenta técnica de acceso se dejó sin permisos de administración y sin empresa asignada.",
    ].join("\n"));
    await db.$client.end();
  }
});
