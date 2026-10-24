import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { desc, eq } from "drizzle-orm";

const enabled = process.env.RUN_PESV_ANNUAL_RISK_CONTROL_DEMO_FUNCTIONAL === "1";
const evidenceDir = "generated-artifacts/pesv-riesgos-anual-demo-prueba";
const baseUrl = "http://127.0.0.1:5000";

test("DEMO-PRUEBA: fuentes y PDF consolidado del informe anual P04", { skip: !enabled }, async () => {
  assert.equal(process.env.NODE_ENV, "development", "La prueba solo se permite en desarrollo.");
  const [{ db }, schema, { hashPassword }, { chromium }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
    import("playwright"),
  ]);
  const [company] = await db.select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies).where(eq(schema.companies.name, "DEMO-PRUEBA")).limit(1);
  assert.equal(company?.name, "DEMO-PRUEBA", "Solo se permite consultar la empresa de prueba.");

  await mkdir(evidenceDir, { recursive: true });
  const userId = randomUUID();
  const username = `qa-pesv-riesgos-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  let accountCreated = false;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let screenshot: Buffer | undefined;
  const checks: string[] = [];

  try {
    await db.insert(schema.users).values({
      id: userId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId: company.id,
      fullName: "Cuenta técnica de prueba PESV",
      email: `${username}@example.invalid`,
      emailVerifiedAt: new Date(),
    });
    accountCreated = true;

    browser = await chromium.launch({
      executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
      args: ["--no-sandbox"],
      headless: true,
    });
    const context = await browser.newContext({ baseURL: baseUrl, viewport: { width: 1440, height: 1100 } });
    const login = await context.request.post("/api/login", { data: { username, password } });
    assert.equal(login.status(), 200, "La cuenta técnica debe autenticarse.");

    const reportResponse = await context.request.get("/api/pesv/informes-anuales/riesgos-seguridad-vial/evidencias");
    const reportBody = await reportResponse.text();
    assert.equal(reportResponse.status(), 200, reportBody);
    const report = await reportResponse.json() as {
      companyName: string;
      isTestCompany: boolean;
      evaluation: { id: string } | null;
      risks: Array<{ id: string; activo: number }>;
      treatments: Array<{ riesgoVialId: string }>;
      criteria: Array<{ pasoId: string }>;
      documents: Array<{ pasoId: string }>;
    };
    assert.equal(report.companyName, "DEMO-PRUEBA");
    assert.equal(report.isTestCompany, true);
    assert.ok(report.evaluation, "Debe existir una evaluación PESV en DEMO-PRUEBA.");
    assert.ok(report.criteria.every((item) => item.pasoId === "P04"));
    assert.ok(report.documents.every((item) => item.pasoId === "P04"));
    const sourceRisks = await db.select({ id: schema.riesgosViales.id, activo: schema.riesgosViales.activo })
      .from(schema.riesgosViales).where(eq(schema.riesgosViales.companyId, company.id));
    const sourceTreatments = await db.select({ riesgoVialId: schema.tratamientosRiesgoVial.riesgoVialId })
      .from(schema.tratamientosRiesgoVial).where(eq(schema.tratamientosRiesgoVial.companyId, company.id));
    assert.deepEqual(
      report.risks.map(({ id, activo }) => ({ id, activo })).sort((a, b) => a.id.localeCompare(b.id)),
      sourceRisks.sort((a, b) => a.id.localeCompare(b.id)),
    );
    assert.deepEqual(
      report.treatments.map(({ riesgoVialId }) => riesgoVialId).sort(),
      sourceTreatments.map(({ riesgoVialId }) => riesgoVialId).sort(),
    );
    checks.push(`La consulta del informe coincide con los datos de origen: ${report.risks.length} riesgos y ${report.treatments.length} tratamientos; evaluación, criterios y adjuntos restringidos a P04.`);

    const pdfResponse = await context.request.get("/api/pesv/informes-anuales/riesgos-seguridad-vial.pdf");
    assert.equal(pdfResponse.status(), 200, "El PDF consolidado debe responder 200.");
    assert.match(pdfResponse.headers()["content-type"] || "", /application\/pdf/);
    const pdf = Buffer.from(await pdfResponse.body());
    assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
    const pdfText = execFileSync("pdftotext", ["-", "-"], { input: pdf, encoding: "utf8" });
    const normalized = pdfText.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]/gi, "").toUpperCase();
    for (const phrase of [
      "EVALUACION Y CONTROL DE RIESGOS EN SEGURIDAD VIAL",
      "PREGUNTA SISI/PESV",
      "RIESGOS VIALES ACTIVOS",
      "TRATAMIENTOS Y SEGUIMIENTO",
      "VERIFICACION DEL PASO P04",
      "SOPORTES DOCUMENTALES ASOCIADOS A P04",
      "DATOS DE PRUEBA",
      "AUTORIZO",
      "APROBO",
      "LICENCIADO SST",
    ]) {
      assert.ok(normalized.includes(phrase.replace(/[^a-z0-9]/gi, "").toUpperCase()), `El PDF debe incluir "${phrase}".`);
    }
    assert.ok(pdfText.includes("DEMO-PRUEBA"));
    await writeFile(`${evidenceDir}/riesgos-p04-consolidado-prueba.pdf`, pdf);
    checks.push("PDF único generado con datos de prueba claramente marcados, secciones P04 y firmantes estándar.");

    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") pageErrors.push(message.text());
    });
    await page.goto("/pesv/informes-anuales/riesgos-seguridad-vial", { waitUntil: "commit", timeout: 30000 });
    const reportMain = page.locator("main").first();
    await reportMain.waitFor({ state: "visible", timeout: 10000 }).catch(async () => {
      throw new Error(`La página no se mostró. URL=${page.url()} BODY=${(await page.locator("body").innerText()).slice(0, 1200)} ERRORES=${pageErrors.join(" | ")}`);
    });
    const mainText = await reportMain.innerText();
    assert.ok(mainText.includes("Evaluación y control de riesgos en seguridad vial"), "La pantalla debe mostrar el título del informe.");
    await page.getByText("Evaluación y control de riesgos en seguridad vial", { exact: true }).waitFor();
    await page.getByText("Prueba funcional · DEMO-PRUEBA", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Abrir Matriz de Riesgos Viales" }).waitFor();
    await page.getByTestId("button-download-pesv-annual-risk-control").waitFor();
    assert.deepEqual(pageErrors, [], "La interfaz no debe producir errores de JavaScript.");
    screenshot = Buffer.from(await reportMain.screenshot({ animations: "disabled" }));
    await writeFile(`${evidenceDir}/informe-anual-09-pantalla.png`, screenshot);
    checks.push("Pantalla autenticada: pregunta, empresa, estado, resumen, fuentes y acción única de descarga visibles.");
    await context.close();

    await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
      resultado: "COMPLETADA",
      empresa: company.name,
      entorno: "desarrollo",
      riesgos: report.risks.length,
      tratamientos: report.treatments.length,
      criteriosP04: report.criteria.length,
      soportesP04: report.documents.length,
      checks,
      fuentesDeNegocioModificadas: false,
      afirmacionDeCumplimiento: false,
    }, null, 2));
    console.log(JSON.stringify({ resultado: "COMPLETADA", empresa: company.name, checks, evidencia: evidenceDir }, null, 2));
  } finally {
    await browser?.close().catch(() => undefined);
    if (accountCreated) {
      try {
        await db.delete(schema.users).where(eq(schema.users.id, userId));
      } catch {
        await db.update(schema.users).set({
          username: `revoked-${userId}`,
          password: await hashPassword(randomBytes(32).toString("base64url")),
          role: "trabajador",
          workerId: null,
          emailVerifiedAt: null,
        }).where(eq(schema.users.id, userId));
      }
    }
    await db.$client.end();
  }
});
