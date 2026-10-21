import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { sql } from "drizzle-orm";

const enabled = process.env.RUN_PROGRAM_TRAINING_WORKFLOW_DEMO === "1";
const companyId = "demo-company-001";

test("DEMO-PRUEBA: flujo autenticado de programación, estimación, IA y asistencia individual", { skip: !enabled }, async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "Esta prueba solo se permite en desarrollo.");
  assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se requiere el dominio de desarrollo.");
  const [{ db }, schema, { hashPassword }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
  ]);
  const companyResult = await db.execute(sql`SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1`);
  assert.equal((companyResult.rows[0] as { name?: string } | undefined)?.name, "DEMO-PRUEBA");

  const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const userId = randomUUID();
  const username = `program-training-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(24).toString("base64url");
  const marker = `VALIDACIÓN INTERNA ${new Date().toISOString()} ${randomBytes(4).toString("hex")}`;
  let accountPrepared = false;
  let cookie = "";
  let programId = "";

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
      id: userId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId,
      fullName: "Cuenta técnica temporal de validación",
      email: `${username}@example.invalid`,
      emailVerifiedAt: new Date(),
    });
    accountPrepared = true;
    const login = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(login.status, 200, "La cuenta técnica debe iniciar sesión.");
    cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    assert.ok(cookie, "El login debe devolver cookies de sesión.");

    const program = await api<{ id: string }>("/api/training-programs", {
      method: "POST",
      body: JSON.stringify({
        year: new Date().getFullYear(),
        title: `${marker} · Programa`,
        generalObjective: marker,
        specificObjectives: JSON.stringify([marker]),
        scope: marker,
        targetPopulation: "Todos los trabajadores",
        responsible: "Cuenta técnica temporal de validación",
      }),
    });
    programId = program.id;

    const estimate = await api<{ available: boolean; count: number; source: string }>(
      `/api/program-trainings/${programId}/attendee-estimate?targetAudience=${encodeURIComponent("Todos los trabajadores")}`,
    );
    assert.equal(estimate.available, true);
    assert.ok(estimate.count >= 0);
    assert.match(estimate.source, /Trabajadores activos/);

    const today = new Date().toISOString().slice(0, 10);
    const training = await api<{ id: string; actualAttendees: number | null }>("/api/program-trainings", {
      method: "POST",
      body: JSON.stringify({
        programId,
        topic: `${marker} · Actividad`,
        trainingCategory: "Capacitación",
        scheduledDate: today,
        duration: 1,
        frequency: "unica",
        instructor: "Cuenta técnica temporal de validación",
        targetAudience: "Todos los trabajadores",
        estimatedAttendees: estimate.count,
        actualAttendees: null,
      }),
    });
    assert.equal(training.actualAttendees, null, "Una actividad no ejecutada debe quedar pendiente.");

    const subgroupEstimate = await api<{ available: boolean; message: string }>(
      `/api/program-trainings/${programId}/attendee-estimate?targetAudience=${encodeURIComponent("Personal administrativo")}`,
    );
    assert.equal(subgroupEstimate.available, false, "No debe calcularse un subgrupo con datos insuficientes.");
    assert.match(subgroupEstimate.message, /manualmente/i);

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
      page.on("pageerror", error => pageErrors.push(error.message));
      await page.goto(`${browserBaseUrl}/programa-capacitacion-anual/${programId}/cronograma`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { name: `${marker} · Programa` }).waitFor({ state: "visible", timeout: 20_000 });
      await page.getByText(`${marker} · Actividad`, { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
      const renderedText = await page.locator("body").innerText();
      assert.match(renderedText, /Pendiente/i, `El cronograma debe mostrar la ejecución como pendiente. Texto visible: ${renderedText}`);
      await page.getByRole("button", { name: /Registrar ejecución/ }).click();
      await page.getByText("Asistencia por trabajador", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
      assert.deepEqual(pageErrors, [], "La pantalla del cronograma no debe producir errores JavaScript.");
      await context.close();
    } finally {
      await browser.close();
    }

    const roster = await api<Array<{ id: string; active: boolean }>>(`/api/program-training-attendance/${training.id}/roster`);
    const attendee = roster.find(worker => worker.active);
    assert.ok(attendee, "DEMO-PRUEBA debe tener al menos una persona activa para validar asistencia individual.");
    const savedRoster = await api<{ total: number }>(`/api/program-training-attendance/${training.id}/roster`, {
      method: "PUT",
      body: JSON.stringify([{ workerId: attendee.id, attended: 1 }]),
    });
    assert.equal(savedRoster.total, 1);

    const execution = await api<{ status: string; actualAttendees: number }>(`/api/program-trainings/${training.id}`, {
      method: "PATCH",
      body: JSON.stringify({ actualDate: today, actualAttendees: savedRoster.total, status: "completada" }),
    });
    assert.equal(execution.status, "completada");
    assert.equal(execution.actualAttendees, savedRoster.total);

    const edited = await api<{ actualDate: string; actualAttendees: number; status: string }>(`/api/program-trainings/${training.id}`, {
      method: "PATCH",
      body: JSON.stringify({ responsible: "Responsable actualizado en validación" }),
    });
    assert.equal(edited.actualDate.slice(0, 10), today, "Editar la programación debe conservar la fecha real.");
    assert.equal(edited.actualAttendees, savedRoster.total, "Editar la programación debe conservar la asistencia.");
    assert.equal(edited.status, "completada", "Editar la programación debe conservar el estado de ejecución.");

    const pdfResponse = await fetch(`${baseUrl}/api/training-programs/${programId}/cronograma-pdf`, {
      headers: { Cookie: cookie, "X-Company-Id": companyId },
    });
    assert.equal(pdfResponse.status, 200, "El cronograma debe permitir generar su PDF.");
    assert.match(pdfResponse.headers.get("content-type") ?? "", /application\/pdf/i);
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    assert.equal(pdfBuffer.subarray(0, 4).toString(), "%PDF", "La descarga debe ser un PDF válido.");
    const { execFileSync } = await import("node:child_process");
    const pdfText = execFileSync("pdftotext", ["-", "-"], { input: pdfBuffer, encoding: "utf8" }).replace(/\s+/g, " ");
    assert.ok(pdfText.includes(marker), "El PDF debe contener la actividad guardada en el cronograma.");

    const otherCompanyWorker = await db.execute(sql`SELECT id FROM workers WHERE company_id <> ${companyId} LIMIT 1`);
    const invalidWorkerId = (otherCompanyWorker.rows[0] as { id?: string } | undefined)?.id ?? randomUUID();
    const invalidWorker = await fetch(`${baseUrl}/api/program-training-attendance/${training.id}/roster`, {
      method: "PUT",
      headers: { Cookie: cookie, "X-Company-Id": companyId, "Content-Type": "application/json" },
      body: JSON.stringify([{ workerId: invalidWorkerId, attended: 1 }]),
    });
    assert.equal(invalidWorker.status, 400, "Debe rechazarse un trabajador de otra empresa o inexistente.");

    const suggestion = await api<{ topic: string; trainingCategory: string; targetAudience: string }>("/api/program-trainings/assistant-suggest", {
      method: "POST",
      body: JSON.stringify({ description: "Charla breve de pausas activas para personal administrativo." }),
    });
    assert.ok(suggestion.topic);
    assert.ok(suggestion.targetAudience);
    assert.ok(["Inducción", "Reinducción", "Capacitación", "Entrenamiento", "Simulacro", "Promoción y prevención", "COPASST", "Brigada", "Otra"].includes(suggestion.trainingCategory));
  } finally {
    if (programId) await db.execute(sql`DELETE FROM training_programs WHERE id = ${programId}`);
    if (accountPrepared) {
      await db.update(schema.users).set({
        role: "trabajador",
        workerId: null,
        companyId: null,
        emailVerifiedAt: null,
        password: await hashPassword(randomBytes(32).toString("base64url")),
      }).where(sql`id = ${userId}`);
    }
    await db.$client.end();
  }
});
