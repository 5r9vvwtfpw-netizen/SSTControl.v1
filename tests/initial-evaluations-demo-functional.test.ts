import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import test from "node:test";
import { and, desc, eq, like } from "drizzle-orm";

const enabled = process.env.RUN_INITIAL_EVALUATIONS_DEMO_FUNCTIONAL === "1";
const baseUrl = "http://127.0.0.1:5000";
const evidenceDir = "attached_assets/DEMO-PRUEBA-evaluaciones-iniciales-prueba-funcional";
const marker = "PRUEBA FUNCIONAL DEMO-PRUEBA — no acredita cumplimiento real";

test("DEMO-PRUEBA: evaluación inicial SST y PESV al 100%, vía API autenticada", { skip: !enabled }, async () => {
  assert.equal(process.env.NODE_ENV, "development", "Solo se permite en desarrollo.");
  const [{ db }, schema, { hashPassword }, { chromium }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
    import("playwright"),
  ]);
  const [company] = await db.select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies).where(eq(schema.companies.name, "DEMO-PRUEBA")).limit(1);
  assert.equal(company?.name, "DEMO-PRUEBA", "Empresa de prueba requerida.");

  const userId = randomUUID();
  const username = `qa-eval-inicial-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  let accountCreated = false;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  const outputs: string[] = [];

  try {
    await db.insert(schema.users).values({
      id: userId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId: company.id,
      fullName: "Responsable de validación funcional",
      email: `${username}@example.invalid`,
      emailVerifiedAt: new Date(),
    });
    accountCreated = true;
    browser = await chromium.launch({
      executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
      args: ["--no-sandbox"],
      headless: true,
    });
    const context = await browser.newContext({ baseURL: baseUrl });
    const login = await context.request.post("/api/login", { data: { username, password } });
    assert.equal(login.status(), 200, "La cuenta temporal debe autenticarse.");

    async function requestJson<T>(path: string, init?: Parameters<typeof context.request.fetch>[1]): Promise<T> {
      const response = await context.request.fetch(path, init);
      const text = await response.text();
      assert.ok(response.ok(), `${init?.method ?? "GET"} ${path} respondió ${response.status()}: ${text.slice(0, 500)}`);
      return JSON.parse(text) as T;
    }

    const companyProfile = await requestJson<any>("/api/company/current");
    assert.equal(companyProfile.id, company.id);
    const standardData = await requestJson<any>("/api/estandares-sst/mi-empresa");
    const scoreField = `puntaje${standardData.tipoEmpresa[0].toUpperCase()}${standardData.tipoEmpresa.slice(1)}`;
    const standards = (standardData.estandares as any[]).filter((item) => item[scoreField] !== null && item[scoreField] !== undefined);
    assert.ok(standards.length > 0, "La empresa debe tener estándares SST aplicables.");

    const date = new Date().toISOString().slice(0, 10);
    const year = Number(date.slice(0, 4));
    const [existingSst] = await db.select({ id: schema.evaluacionesSst.id })
      .from(schema.evaluacionesSst)
      .where(and(
        eq(schema.evaluacionesSst.companyId, company.id),
        like(schema.evaluacionesSst.observaciones, `${marker}%`),
      ))
      .orderBy(desc(schema.evaluacionesSst.createdAt))
      .limit(1);
    const sst = existingSst
      ? await requestJson<any>(`/api/evaluaciones-sst/${existingSst.id}`)
      : await requestJson<any>("/api/evaluaciones-sst", {
          method: "POST",
          data: {
            anio: year,
            mes: Number(date.slice(5, 7)),
            tipoEmpresa: standardData.tipoEmpresa,
            estado: "en-progreso",
            responsableNombre: "Responsable de validación funcional",
            responsableCargo: "Responsable de prueba",
            fechaEvaluacion: date,
            observaciones: `${marker}. Evaluación inicial creada solo para verificar el flujo y el cálculo.`,
          },
        });
    const existingSstAnswers = await requestJson<any[]>(`/api/evaluaciones-sst/${sst.id}/respuestas`);
    const answeredStandardIds = new Set(existingSstAnswers.map((answer) => answer.estandarId));
    for (const standard of standards) {
      if (answeredStandardIds.has(standard.id)) continue;
      const score = Number(standard[scoreField]);
      await requestJson(`/api/evaluaciones-sst/${sst.id}/respuestas`, {
        method: "POST",
        data: {
          estandarId: standard.id,
          cumple: 1,
          noAplica: 0,
          puntajeObtenido: score,
          puntajeMaximo: score,
          evidencias: `${marker}. Registro de prueba, no es soporte real.`,
          modoVerificacion: "Validación funcional del formulario y cálculo.",
          observaciones: marker,
        },
      });
    }
    const sstFinal = await requestJson<any>(`/api/evaluaciones-sst/${sst.id}`);
    const sstAnswers = await requestJson<any[]>(`/api/evaluaciones-sst/${sst.id}/respuestas`);
    assert.equal(Number(sstFinal.porcentajeCumplimiento), 100);
    assert.equal(sstAnswers.length, standards.length);
    outputs.push(`SST: evaluación ${sst.id}; ${sstAnswers.length} estándares respondidos; ${sstFinal.puntajeTotal}/${sstFinal.puntajeMaximo}; 100%.`);

    const [existingPesv] = await db.select({ id: schema.evaluacionesPesv.id })
      .from(schema.evaluacionesPesv)
      .where(and(
        eq(schema.evaluacionesPesv.companyId, company.id),
        like(schema.evaluacionesPesv.observaciones, `${marker}%`),
      ))
      .orderBy(desc(schema.evaluacionesPesv.createdAt))
      .limit(1);
    const pesv = existingPesv
      ? await requestJson<any>(`/api/evaluaciones-pesv/${existingPesv.id}`)
      : await requestJson<any>("/api/evaluaciones-pesv", {
          method: "POST",
          data: {
            anio: year,
            mes: Number(date.slice(5, 7)),
            nivel: "basico",
            numeroVehiculos: companyProfile.numberOfVehicles ?? 0,
            observaciones: `${marker}. Evaluación inicial creada solo para verificar el flujo y el cálculo.`,
          },
        });
    const steps = await requestJson<any[]>(`/api/pasos-pesv?nivel=${encodeURIComponent(pesv.nivel)}`);
    assert.ok(steps.length > 0, "Debe haber pasos PESV aplicables.");
    const existingPesvAnswers = await requestJson<any[]>(`/api/evaluaciones-pesv/${pesv.id}/respuestas`);
    const answeredStepIds = new Set(existingPesvAnswers.map((answer) => answer.pasoId));
    for (const step of steps) {
      if (answeredStepIds.has(step.codigo)) continue;
      await requestJson(`/api/evaluaciones-pesv/${pesv.id}/respuestas`, {
        method: "POST",
        data: {
          pasoId: step.codigo,
          cumple: 1,
          noAplica: 0,
          evidencias: `${marker}. Registro de prueba, no es soporte real.`,
          modoVerificacion: "Validación funcional del formulario y cálculo.",
          observaciones: marker,
        },
      });
    }
    const pesvFinal = await requestJson<any>(`/api/evaluaciones-pesv/${pesv.id}`);
    const pesvAnswers = await requestJson<any[]>(`/api/evaluaciones-pesv/${pesv.id}/respuestas`);
    assert.equal(Number(pesvFinal.porcentajeCumplimiento), 100);
    assert.equal(pesvAnswers.length, steps.length);
    outputs.push(`PESV: evaluación ${pesv.id}; ${pesvAnswers.length} pasos respondidos; ${pesvFinal.puntajeTotal}/${pesvFinal.puntajeMaximo}; 100%.`);

    await mkdir(evidenceDir, { recursive: true });
    const { PDFDocument, StandardFonts, degrees, rgb } = await import("pdf-lib");
    for (const [name, path] of [
      ["evaluacion-inicial-sst.pdf", `/api/evaluaciones-sst/${sst.id}/pdf`],
      ["evaluacion-inicial-pesv.pdf", `/api/evaluaciones-pesv/${pesv.id}/pdf`],
    ]) {
      const response = await context.request.get(path);
      const content = Buffer.from(await response.body());
      assert.equal(response.status(), 200, `No se pudo generar ${name}.`);
      assert.equal(content.subarray(0, 5).toString("ascii"), "%PDF-");
      const sample = await PDFDocument.load(content);
      const font = await sample.embedFont(StandardFonts.HelveticaBold);
      for (const page of sample.getPages()) {
        page.drawText("PRUEBA FUNCIONAL - NO ES EVIDENCIA REAL", {
          x: 24,
          y: page.getHeight() / 2,
          size: 18,
          font,
          color: rgb(0.78, 0.08, 0.08),
          opacity: 0.35,
          rotate: degrees(32),
        });
      }
      await writeFile(`${evidenceDir}/${name}`, await sample.save());
    }
    await writeFile(`${evidenceDir}/resultado.txt`, [
      "PRUEBA FUNCIONAL — DEMO-PRUEBA — DESARROLLO",
      marker,
      ...outputs,
      "Las evaluaciones marcadas como prueba se conservan; al repetir el test se completan sin duplicar respuestas.",
      "El 100% corresponde a respuestas de prueba asignadas para validar el cálculo; no acredita cumplimiento real ni debe radicarse.",
      "Los PDFs descargables tienen una marca de prueba en todas sus páginas.",
    ].join("\n"));
    console.log(JSON.stringify({ company: company.name, outputs, evidenceDir }, null, 2));
    await context.close();
  } finally {
    await browser?.close().catch(() => undefined);
    if (accountCreated) {
      await db.update(schema.users).set({
        username: `revoked-${userId}`,
        password: await hashPassword(randomBytes(32).toString("base64url")),
        role: "trabajador",
        workerId: null,
        companyId: null,
        emailVerifiedAt: null,
      }).where(eq(schema.users.id, userId));
    }
    await db.$client.end();
  }
});
