import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import test from "node:test";

const enabled = process.env.RUN_PESV_PREVENTION_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";
const marker = `PRUEBA FUNCIONAL H07-H08 DEMO-PRUEBA ${new Date().toISOString().slice(0, 10)} ${randomBytes(4).toString("hex")}`;

function currentQuarter() {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const startMonth = (quarter - 1) * 3;
  const from = new Date(year, startMonth, 1).toISOString().slice(0, 10);
  const to = new Date(year, startMonth + 3, 0).toISOString().slice(0, 10);
  return { year, quarter, from, to, today: now.toISOString().slice(0, 10) };
}

async function createLabeledPdf(): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default;
  const doc = new PDFDocument({ size: "LETTER", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.fontSize(18).text("PRUEBA FUNCIONAL — SIN EFECTO COMO SOPORTE REAL", { align: "center" });
  doc.moveDown().fontSize(11).text(marker);
  doc.text("Archivo de validación creado en desarrollo para revisar el flujo H07/H08.");
  doc.end();
  return finished;
}

test("DEMO-PRUEBA: módulos H07/H08 alimentan el informe trimestral y conservan evidencia revisable", { skip: !enabled }, async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "La prueba solo puede ejecutarse en desarrollo.");
  assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se requiere el dominio de desarrollo.");

  const [{ db }, schema, { hashPassword }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
  ]);
  const { sql } = await import("drizzle-orm");
  const companyResult = await db.execute(sql`SELECT id, name, legal_rep_name, legal_rep_id, legal_rep_signature_url FROM companies WHERE id = ${companyId} LIMIT 1`);
  const company = companyResult.rows[0] as {
    id: string;
    name: string;
    legal_rep_name: string | null;
    legal_rep_id: string | null;
    legal_rep_signature_url: string | null;
  } | undefined;
  assert.equal(company?.name, "DEMO-PRUEBA", "La prueba se limita a la empresa DEMO-PRUEBA.");
  assert.ok(company.legal_rep_name && company.legal_rep_id && company.legal_rep_signature_url,
    "La empresa debe tener configurados los datos y la firma del Representante Legal.");

  const accountId = randomUUID();
  const username = `pesv-medidas-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const period = currentQuarter();
  let accountCreated = false;
  let cookie = "";

  try {
    await db.insert(schema.users).values({
      id: accountId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId,
      fullName: "Cuenta técnica de prueba H07/H08",
      email: `${username}@example.invalid`,
      emailVerifiedAt: new Date(),
    });
    accountCreated = true;

    const login = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(login.status, 200, "La cuenta técnica debe iniciar sesión.");
    cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    assert.ok(cookie);

    async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
      const headers = new Headers(init.headers);
      headers.set("Cookie", cookie);
      headers.set("X-Company-Id", companyId);
      if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
      const text = await response.text();
      assert.ok(response.ok, `${init.method || "GET"} ${path} devolvió ${response.status}: ${text}`);
      return text ? JSON.parse(text) as T : undefined as T;
    }

    const vehicles = await api<Array<{ id: string; plate: string; observations?: string | null }>>("/api/vehicles");
    const testVehicle = vehicles.find((item) => item.observations?.includes(marker))
      ?? await api<{ id: string; plate: string }>("/api/vehicles", {
        method: "POST",
        body: JSON.stringify({
          plate: `PF${randomBytes(3).toString("hex").toUpperCase()}`,
          brand: "PRUEBA FUNCIONAL",
          model: "Vehículo de validación PESV",
          year: period.year,
          type: "camioneta",
          ownership: "propio",
          status: "activo",
          observations: marker,
        }),
      });

    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([await createLabeledPdf()], { type: "application/pdf" }), `soporte-${randomBytes(4).toString("hex")}.pdf`);
    uploadForm.append("category", "evidencias");
    uploadForm.append("companyId", companyId);
    const uploaded = await api<{ objectPath: string }>("/api/upload-proxy", { method: "POST", body: uploadForm });
    assert.ok(uploaded.objectPath.startsWith(`uploads/${companyId}/evidencias/`));

    const routeName = `Ruta de validación H08 ${period.year}-T${period.quarter}`;
    const routes = await api<Array<{ id: string; routeName: string }>>("/api/safe-routes");
    const route = routes.find((item) => item.routeName === routeName)
      ?? await api<{ id: string; routeName: string }>("/api/safe-routes", {
        method: "POST",
        body: JSON.stringify({
          companyId,
          routeName,
          origin: "Punto de origen de prueba",
          destination: "Punto de destino de prueba",
          routeType: "urbana",
          riskLevel: "medio",
          criticalPoints: "Cruce de prueba con visibilidad reducida",
          speedLimits: "30 km/h en zona de validación",
          restrictions: "Verificar señalización y control",
          isActive: 1,
          observations: "Registro de validación trimestral",
          signageImplemented: 1,
          signageImplementationDate: period.from,
          signageResponsible: marker,
          signageMeasures: "Señal preventiva y demarcación de prueba",
          signageEvidenceReference: uploaded.objectPath,
          controlImplemented: 1,
          controlImplementationDate: period.from,
          controlResponsible: marker,
          controlPoints: "Puesto de control de prueba en el punto crítico",
          controlFrequency: "Diaria durante el escenario de revisión",
          controlEvidenceReference: uploaded.objectPath,
        }),
      });

    const expenses = await api<Array<{ id: string; concept: string }>>("/api/pesv/gps-expenses");
    const existingExpense = expenses.find((item) => item.concept === "Monitoreo GPS — registro de validación");
    const expense = existingExpense
      ? await api<{ id: string }>(`/api/pesv/gps-expenses/${existingExpense.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            expenseDate: period.today,
            periodStart: period.from,
            periodEnd: period.to,
            coverage: `${marker} · vehículo ${testVehicle.plate}`,
            supportReference: uploaded.objectPath,
            observations: "Muestra de validación; no corresponde a un cobro real.",
          }),
        })
      : await api<{ id: string }>("/api/pesv/gps-expenses", {
          method: "POST",
          body: JSON.stringify({
            provider: "Proveedor de validación",
            expenseType: "servicio",
            concept: "Monitoreo GPS — registro de validación",
            expenseDate: period.today,
            periodStart: period.from,
            periodEnd: period.to,
            amountCop: 126000,
            coverage: `${marker} · vehículo ${testVehicle.plate}`,
            supportReference: uploaded.objectPath,
            observations: "Muestra de validación; no corresponde a un cobro real.",
          }),
        });

    const tracking = await api<{ id: string; speedExceeded: number }>("/api/vehicle-gps-tracking", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        vehicleId: testVehicle.id,
        trackingDate: period.today,
        trackingTime: "10:15",
        speed: 67,
        maxSpeedAllowed: 50,
        speedExceeded: 1,
        observations: `Validación trimestral vinculada al vehículo ${testVehicle.plate}`,
      }),
    });
    assert.equal(tracking.speedExceeded, 1, "El registro debe identificar el exceso de velocidad.");

    const query = new URLSearchParams({ from: period.from, to: period.to }).toString();
    const state = await api<{
      companyName: string;
      routeMeasures: number;
      gpsExpenses: number;
      gpsMonitoringRecords: number;
      speedAlerts: number;
      missing: string[];
    }>(`/api/pesv/informes-trimestrales/medidas-prevencion/estado?${query}`);
    assert.equal(state.companyName, "DEMO-PRUEBA");
    assert.ok(state.routeMeasures > 0, "El informe debe tomar las medidas de H08.");
    assert.ok(state.gpsExpenses > 0, "El informe debe tomar los gastos GPS de H07.");
    assert.ok(state.gpsMonitoringRecords > 0, "El informe debe tomar los registros de monitoreo GPS.");
    assert.ok(state.speedAlerts > 0, "El exceso de velocidad debe producir una alerta que entre al informe.");

    const blockedDownload = await fetch(`${baseUrl}/api/pesv/informes-trimestrales/medidas-prevencion.pdf?${query}`, {
      headers: { Cookie: cookie, "X-Company-Id": companyId },
    });
    assert.equal(blockedDownload.status, 409, "La certificación debe exigir la confirmación expresa del Representante Legal.");

    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const browserBaseUrl = "http://127.0.0.1:5000";
      const context = await browser.newContext();
      await context.addCookies(cookie.split("; ").map((pair) => {
        const separator = pair.indexOf("=");
        return { name: pair.slice(0, separator), value: pair.slice(separator + 1), url: browserBaseUrl };
      }));
      const page = await context.newPage();
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.goto(`${browserBaseUrl}/pesv/informes-trimestrales/medidas-prevencion`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: /Certificación de medidas para prevenir/i }).waitFor({ timeout: 20_000 });
      await page.getByText("DEMO-PRUEBA", { exact: false }).waitFor({ timeout: 20_000 });
      await page.screenshot({
        path: `attached_assets/DEMO-PRUEBA_informe_medidas_T${period.quarter}_${period.year}_prueba_funcional.png`,
        fullPage: true,
      });
      assert.deepEqual(pageErrors, []);
      await browser.close();
    } catch (error) {
      await browser.close();
      throw error;
    }

    await mkdir("attached_assets", { recursive: true });
    await writeFile(`attached_assets/DEMO-PRUEBA_informe_medidas_T${period.quarter}_${period.year}_evidencia.txt`, [
      "PRUEBA FUNCIONAL H07/H08 — DEMO-PRUEBA — DESARROLLO",
      `Marcador: ${marker}`,
      `Período: ${period.from} a ${period.to}`,
      `Ruta H08: ${route.routeName}`,
      `Vehículo usado para el registro GPS: ${testVehicle.plate}`,
      `Registro de monitoreo GPS: ${tracking.id} (exceso detectado: ${tracking.speedExceeded})`,
      `Gasto GPS de validación: ${expense.id}`,
      `Alerta de velocidad: creada automáticamente a partir del registro GPS.`,
      `Estado del informe: H08=${state.routeMeasures}; gastos=${state.gpsExpenses}; monitoreo=${state.gpsMonitoringRecords}; alertas=${state.speedAlerts}.`,
      `Pendientes del informe: ${state.missing.length ? state.missing.join(" | ") : "ninguno"}`,
      `Descarga PDF: protegida con HTTP 409 hasta confirmación expresa del Representante Legal; no se emitió una certificación firmada durante esta prueba.`,
      "Los registros y archivos de validación permanecen en DEMO-PRUEBA para revisión.",
    ].join("\n"));
    console.log(`Prueba H07/H08 completada para DEMO-PRUEBA, ${period.year} T${period.quarter}. PDF no firmado: requiere confirmación expresa del Representante Legal. Evidencia en attached_assets.`);
  } finally {
    if (accountCreated) {
      await db.update(schema.users).set({
        role: "trabajador",
        workerId: null,
        emailVerifiedAt: null,
        password: await hashPassword(randomBytes(32).toString("base64url")),
      }).where(sql`id = ${accountId} AND username = ${username}`);
    }
    await db.$client.end();
  }
});
