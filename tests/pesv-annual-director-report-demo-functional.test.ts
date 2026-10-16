import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { eq } from "drizzle-orm";

const enabled = process.env.RUN_PESV_ANNUAL_DIRECTOR_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";
const marker = "PRUEBA FUNCIONAL INFORME ANUAL SISI/PESV A02 DEMO-PRUEBA — NO ES REUNIÓN REAL";
const evidenceDir = "generated-artifacts/pesv-a02-demo-prueba";
const baseUrl = "http://127.0.0.1:5000";

test("DEMO-PRUEBA: informe anual A02 muestra y abre el acta aprobada", { skip: !enabled }, async () => {
  assert.equal(process.env.NODE_ENV, "development", "La prueba solo se ejecuta en desarrollo.");
  const [{ db }, schema, { hashPassword }, { chromium }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
    import("playwright"),
  ]);
  const companyResult = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
  const company = companyResult[0];
  assert.equal(company?.name, "DEMO-PRUEBA", "La evidencia se limita a DEMO-PRUEBA.");

  const accountId = randomUUID();
  const username = `pesv-a02-test-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  const code = `PRUEBA-A02-${randomBytes(4).toString("hex").toUpperCase()}`;
  let accountCreated = false;
  let revisionId: string | undefined;
  let evaluationId: string | undefined;
  let accountApprovedRecord = false;
  const checks: string[] = [];
  const browser = await chromium.launch({ executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium", args: ["--no-sandbox"], headless: true });

  try {
    await mkdir(evidenceDir, { recursive: true });
    await db.insert(schema.users).values({
      id: accountId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId,
      fullName: "Cuenta técnica de prueba A02 DEMO-PRUEBA",
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
    const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    assert.ok(cookie, "El inicio de sesión debe entregar cookies.");
    checks.push("Autenticación de prueba en DEMO-PRUEBA: correcta.");

    async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
      const headers = new Headers(init.headers);
      headers.set("Cookie", cookie);
      if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
      const text = await response.text();
      assert.ok(response.ok, `${init.method || "GET"} ${path} respondió ${response.status}: ${text}`);
      return text ? JSON.parse(text) as T : undefined as T;
    }

    let [evaluation] = await db.select().from(schema.evaluacionesPesv)
      .where(eq(schema.evaluacionesPesv.companyId, companyId))
      .limit(1);
    if (!evaluation) {
      [evaluation] = await db.insert(schema.evaluacionesPesv).values({
        companyId,
        anio: new Date().getFullYear(),
        mes: 12,
        nivel: "basico",
        estado: "en-progreso",
        observaciones: marker,
      }).returning();
    }
    evaluationId = evaluation.id;

    const fechaRevision = new Date().toISOString().slice(0, 10);
    const draft = await api<{ id: string; codigo: string; estado: string; aprobadoPor: string | null; fechaAprobacion: string | null }>(
      `/api/evaluaciones-pesv/${evaluationId}/revisiones-direccion`,
      {
        method: "POST",
        body: JSON.stringify({
          codigo: code,
          fechaRevision,
          presididaPor: "Alta Dirección — registro de prueba funcional, no corresponde a persona real",
          participantes: marker,
          revisionIndicadores: 0,
          revisionAuditorias: 0,
          revisionSiniestros: 0,
          revisionAccionesMejora: 0,
          revisionCumplimientoLegal: 0,
          revisionRecursos: 0,
          revisionCapacitaciones: 0,
          revisionInspecciones: 0,
          analisisGeneral: `${marker}. Contenido sintético para verificar la visualización y el PDF.`,
          decisiones: `${marker}. Sin decisión empresarial real.`,
          compromisos: `${marker}. Sin compromiso empresarial real.`,
          estado: "aprobada",
          aprobadoPor: accountId,
          fechaAprobacion: new Date().toISOString(),
        }),
      },
    );
    revisionId = draft.id;
    assert.equal(draft.estado, "borrador", "La creación no debe aceptar la aprobación enviada en el cuerpo.");
    assert.equal(draft.aprobadoPor, null);
    assert.equal(draft.fechaAprobacion, null);
    checks.push("El servidor ignoró el estado de aprobación enviado al crear: la revisión quedó en borrador.");

    const approved = await api<{ estado: string; aprobadoPor: string | null; fechaAprobacion: string | null }>(
      `/api/evaluaciones-pesv/${evaluationId}/revisiones-direccion/${revisionId}/aprobar`,
      { method: "POST", body: JSON.stringify({}) },
    );
    assert.equal(approved.estado, "aprobada");
    assert.equal(approved.aprobadoPor, accountId);
    assert.ok(approved.fechaAprobacion);
    accountApprovedRecord = true;
    checks.push("La aprobación explícita registró usuario y fecha.");

    const listed = await api<Array<{ id: string; codigo: string; evaluacionPesvId: string; presididaPor: string; fechaAprobacion: string }>>(
      "/api/pesv/informes-anuales/seguimiento-direccion/evidencias",
    );
    const evidence = listed.find((item) => item.id === revisionId);
    assert.ok(evidence, "El informe debe listar la revisión aprobada.");
    assert.equal(evidence.codigo, code);
    assert.equal(evidence.evaluacionPesvId, evaluationId);
    checks.push("La API del informe incluye la evidencia aprobada de la empresa y mantiene la relación con la evaluación.");

    const pdfResponse = await fetch(`${baseUrl}/api/evaluaciones-pesv/${evaluationId}/revisiones-direccion/${revisionId}/pdf`, {
      headers: { Cookie: cookie },
    });
    assert.equal(pdfResponse.status, 200, `El PDF fuente respondió ${pdfResponse.status}.`);
    assert.match(pdfResponse.headers.get("content-type") || "", /application\/pdf/);
    const pdf = Buffer.from(await pdfResponse.arrayBuffer());
    assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
    const pdfText = execFileSync("pdftotext", ["-", "-"], { input: pdf, encoding: "utf8" }).replace(/\s+/g, " ");
    const normalizedPdfText = pdfText.replace(/[^a-z0-9]/gi, "").toUpperCase();
    const normalizedCode = code.replace(/[^a-z0-9]/gi, "").toUpperCase();
    assert.ok(normalizedPdfText.includes(normalizedCode), "El PDF debe contener el código de revisión aunque el extractor omita guiones.");
    assert.match(pdfText, /Aprobada por/i);
    assert.match(pdfText, /Fecha de aprobación/i);
    assert.match(pdfText, /Sin registro de revisión/);
    await writeFile(`${evidenceDir}/acta-a02-prueba-funcional.pdf`, pdf);
    checks.push("El botón/enlace fuente entrega un PDF válido con código de prueba, aprobación y campos no registrados identificados.");

    const context = await browser.newContext({ baseURL: baseUrl, viewport: { width: 1440, height: 1100 } });
    await context.addCookies(cookie.split("; ").map((pair) => {
      const separator = pair.indexOf("=");
      return { name: pair.slice(0, separator), value: pair.slice(separator + 1), url: baseUrl };
    }));
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/pesv/informes-anuales/seguimiento-direccion", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByTestId("pesv-annual-director-follow-up").waitFor({ state: "visible", timeout: 30000 });
    await page.getByText(code, { exact: true }).waitFor({ state: "visible", timeout: 30000 });
    await page.getByText(/^\d+ acta\(s\) aprobada\(s\)$/).waitFor({ state: "visible", timeout: 30000 });
    const screenshot = Buffer.from(await page.screenshot({ fullPage: true }));
    await writeFile(`${evidenceDir}/informe-anual-a02-en-pantalla.png`, screenshot);
    checks.push("La interfaz autenticada muestra la empresa, el estado, el código de acta aprobada, fechas y el botón Abrir PDF.");

    const [popup] = await Promise.all([
      page.waitForEvent("popup", { timeout: 15000 }),
      page.getByTestId(`download-approved-acta-${revisionId}`).click(),
    ]);
    await popup.waitForLoadState("domcontentloaded", { timeout: 20000 }).catch(() => undefined);
    assert.match(popup.url(), new RegExp(`/api/evaluaciones-pesv/${evaluationId}/revisiones-direccion/${revisionId}/pdf`));
    assert.deepEqual(pageErrors, [], "La página no debe producir errores de JavaScript.");
    checks.push("Al pulsar Abrir PDF desde el informe, el navegador abre el endpoint del acta fuente.");
    await context.close();

    const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
    const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Prueba funcional informe anual A02 — DEMO-PRUEBA</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#173225;background:#f3f7f4;margin:0 auto;padding:32px;max-width:1100px}h1{font-size:2rem}.tag{display:inline-block;background:#d8efe1;border-radius:24px;padding:6px 12px}.warn{padding:14px;border-left:4px solid #a36b00;background:#fff5d7}li{margin:8px 0}figure{background:white;padding:12px;border:1px solid #d9e3dc;border-radius:10px}img{width:100%;height:auto}a{color:#075e3a}</style>
<h1>Prueba funcional — Informe anual SISI/PESV A02</h1><p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
<p>El registro se creó desde el flujo de aplicación, se aprobó explícitamente, apareció en el informe anual y su PDF se abrió desde la interfaz.</p>
<ul>${checks.map((check) => `<li>${escape(check)}</li>`).join("")}</ul>
<p class="warn"><b>Importante:</b> el acta incluida es evidencia sintética de prueba, no corresponde a una reunión ni decisión real y no debe presentarse a SISI/PESV.</p>
<p>Código conservado: <b>${escape(code)}</b>. Revisión aprobada conservada en DEMO-PRUEBA para inspección. Archivo PDF adjunto por separado.</p>
<figure><img src="data:image/png;base64,${screenshot.toString("base64")}" alt="Pantalla autenticada del informe anual A02 en DEMO-PRUEBA"><figcaption>Vista real del informe después de la aprobación y antes de abrir el PDF.</figcaption></figure></html>`;
    await writeFile(`${evidenceDir}/evidencia-prueba-funcional.html`, html);
    await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
      result: "COMPLETADA",
      company: company.name,
      environment: "development",
      marker,
      revisionCode: code,
      revisionId,
      evaluationId,
      checks,
      evidence: {
        screenshot: "informe-anual-a02-en-pantalla.png",
        pdf: "acta-a02-prueba-funcional.pdf",
        report: "evidencia-prueba-funcional.html",
      },
      note: "Todos los datos de la revisión son de prueba; no representan hechos reales ni evidencia para radicar.",
    }, null, 2));
    console.log(JSON.stringify({ result: "COMPLETADA", company: company.name, code, checks, evidenceDir }, null, 2));
    await browser.close();
  } finally {
    if (accountCreated) {
      if (accountApprovedRecord) {
        await db.update(schema.users).set({
          username: `revoked-${accountId}`,
          password: await hashPassword(randomBytes(32).toString("base64url")),
          role: "trabajador",
          workerId: null,
          emailVerifiedAt: null,
        }).where(eq(schema.users.id, accountId));
      } else {
        await db.delete(schema.users).where(eq(schema.users.id, accountId));
      }
    }
    await browser.close().catch(() => undefined);
    await db.$client.end();
  }
});
