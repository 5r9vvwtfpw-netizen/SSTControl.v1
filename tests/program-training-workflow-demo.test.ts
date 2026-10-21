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

    const roster = await api<Array<{ id: string; active: boolean }>>(`/api/program-training-attendance/${training.id}/roster`);
    const attendee = roster.find(worker => worker.active);
    const savedRoster = await api<{ total: number }>(`/api/program-training-attendance/${training.id}/roster`, {
      method: "PUT",
      body: JSON.stringify(attendee ? [{ workerId: attendee.id, attended: 1 }] : []),
    });
    assert.equal(savedRoster.total, attendee ? 1 : 0);

    const execution = await api<{ status: string; actualAttendees: number }>(`/api/program-trainings/${training.id}`, {
      method: "PATCH",
      body: JSON.stringify({ actualDate: today, actualAttendees: savedRoster.total, status: "completada" }),
    });
    assert.equal(execution.status, "completada");
    assert.equal(execution.actualAttendees, savedRoster.total);

    const invalidWorker = await fetch(`${baseUrl}/api/program-training-attendance/${training.id}/roster`, {
      method: "PUT",
      headers: { Cookie: cookie, "X-Company-Id": companyId, "Content-Type": "application/json" },
      body: JSON.stringify([{ workerId: randomUUID(), attended: 1 }]),
    });
    assert.equal(invalidWorker.status, 400, "Debe rechazarse un trabajador ajeno o inexistente.");

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
