import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { desc, eq } from "drizzle-orm";

const enabled = process.env.RUN_PESV_ANNUAL_DIAGNOSIS_DEMO_FUNCTIONAL === "1";
const evidenceDir = "generated-artifacts/pesv-diagnostico-demo-prueba";
const baseUrl = "http://127.0.0.1:5000";

test("DEMO-PRUEBA: fuentes y recorrido funcional del diagnóstico anual P03", { skip: !enabled }, async () => {
  assert.equal(process.env.NODE_ENV, "development", "La prueba solo se permite en desarrollo.");
  const [{ db }, schema, { hashPassword }, { chromium }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
    import("playwright"),
  ]);

  const [company] = await db.select({
    id: schema.companies.id,
    name: schema.companies.name,
    ciiuCode: schema.companies.ciiuCode,
  }).from(schema.companies).where(eq(schema.companies.name, "DEMO-PRUEBA")).limit(1);
  assert.equal(company?.name, "DEMO-PRUEBA", "Solo se permite consultar la empresa de prueba.");

  await mkdir(evidenceDir, { recursive: true });
  const userId = randomUUID();
  const username = `qa-pesv-diagnostico-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  let accountCreated = false;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  const checks: string[] = [];
  let screenshot: Buffer | undefined;
  let reportState: {
    companyName: string;
    companyNit: string | null;
    hasCiiu: boolean;
    isTestCompany: boolean;
    evaluation: { id: string; anio: number; mes: number | null } | null;
    p03Response: { cumple: number | null; noAplica: number | null; evidencias: string | null; observaciones: string | null } | null;
    contextFactorCount: number;
    vehicleCount: number;
    activeVehicleCount: number;
    driverCount: number;
    activeDriverCount: number;
    activeRouteCount: number;
    activeRoutesWithCriticalPoints: number;
  } | undefined;

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
    const context = await browser.newContext({
      baseURL: baseUrl,
      viewport: { width: 1440, height: 1100 },
    });

    const login = await context.request.post("/api/login", { data: { username, password } });
    assert.equal(login.status(), 200, "La cuenta técnica debe autenticarse.");
    checks.push("Inicio de sesión temporal y alcance restringido a DEMO-PRUEBA: correcto.");

    async function apiJson<T>(path: string): Promise<T> {
      const response = await context.request.get(path);
      const text = await response.text();
      assert.ok(response.ok(), `GET ${path} respondió ${response.status()}: ${text.slice(0, 400)}`);
      return JSON.parse(text) as T;
    }

    const companyProfile = await apiJson<{ id: string; name: string; ciiuCode: string | null }>("/api/company/current");
    assert.equal(companyProfile.id, company.id);
    assert.equal(companyProfile.name, "DEMO-PRUEBA");
    checks.push(`Perfil de empresa: responde y actividad económica ${companyProfile.ciiuCode ? "registrada" : "pendiente"}.`);

    const [contextFactors, vehicles, drivers, routes] = await Promise.all([
      apiJson<Array<{ activo: number }>>("/api/contexto-organizacional-pesv"),
      apiJson<Array<{ status: string }>>("/api/vehicles"),
      apiJson<Array<{ status: string }>>("/api/drivers"),
      apiJson<Array<{ isActive: number; criticalPoints: string | null }>>("/api/safe-routes"),
    ]);
    const [evaluation] = await db.select({ id: schema.evaluacionesPesv.id })
      .from(schema.evaluacionesPesv)
      .where(eq(schema.evaluacionesPesv.companyId, company.id))
      .orderBy(desc(schema.evaluacionesPesv.createdAt))
      .limit(1);
    assert.ok(evaluation, "Debe existir una evaluación PESV para probar P03.");

    const [evaluationDetail] = await db.select({
      id: schema.evaluacionesPesv.id,
      anio: schema.evaluacionesPesv.anio,
      mes: schema.evaluacionesPesv.mes,
    }).from(schema.evaluacionesPesv)
      .where(eq(schema.evaluacionesPesv.id, evaluation.id))
      .limit(1);
    assert.ok(evaluationDetail);

    const sourceResponses = await apiJson<Array<{ pasoId: string; cumple: number | null; evidencias: string | null }>>(
      `/api/evaluaciones-pesv/${evaluation.id}/respuestas`,
    );
    const p03 = sourceResponses.find((response) => response.pasoId === "P03") ?? null;

    reportState = await apiJson<typeof reportState & {}>(
      "/api/pesv/informes-anuales/diagnostico-organizacion/evidencias",
    );
    assert.equal(reportState.companyName, "DEMO-PRUEBA");
    assert.equal(reportState.isTestCompany, true);
    assert.equal(reportState.hasCiiu, Boolean(companyProfile.ciiuCode?.trim()));
    assert.equal(reportState.contextFactorCount, contextFactors.filter((factor) => factor.activo === 1).length);
    assert.equal(reportState.vehicleCount, vehicles.length);
    assert.equal(reportState.activeVehicleCount, vehicles.filter((vehicle) => vehicle.status === "activo").length);
    assert.equal(reportState.driverCount, drivers.length);
    assert.equal(reportState.activeDriverCount, drivers.filter((driver) => driver.status === "activo").length);
    assert.equal(reportState.activeRouteCount, routes.filter((route) => route.isActive === 1).length);
    assert.equal(reportState.evaluation?.id, evaluation.id);
    assert.equal(reportState.p03Response?.cumple, p03?.cumple ?? null);
    assert.equal(reportState.p03Response?.evidencias, p03?.evidencias ?? null);
    checks.push(
      `Agregación del informe: ${reportState.contextFactorCount} factores, ${reportState.vehicleCount} vehículos, ${reportState.driverCount} conductores y ${reportState.activeRouteCount} rutas activas; conteos coinciden con sus módulos.`,
    );
    checks.push(`Evaluación PESV ${evaluationDetail.anio} y respuesta P03: enlazadas correctamente.`);

    const pdfs = [
      { name: "contexto organizacional", path: "/api/contexto-organizacional-pesv/pdf" },
      { name: "inventario de vehículos", path: "/api/pesv/vehiculos/pdf" },
      { name: "base de conductores", path: "/api/pesv/conductores/pdf" },
      { name: "rutas seguras", path: "/api/pesv/rutas-seguras/pdf" },
      { name: "evaluación PESV", path: `/api/evaluaciones-pesv/${evaluation.id}/pdf` },
    ];
    for (const pdf of pdfs) {
      const response = await context.request.get(pdf.path);
      const bytes = Buffer.from(await response.body());
      assert.equal(response.status(), 200, `El PDF de ${pdf.name} debe responder 200.`);
      assert.match(response.headers()["content-type"] || "", /application\/pdf/);
      assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-", `El PDF de ${pdf.name} debe tener cabecera válida.`);
      const extracted = execFileSync("pdftotext", ["-", "-"], { input: bytes, encoding: "utf8" });
      assert.ok(extracted.trim().length > 30, `El PDF de ${pdf.name} debe contener texto.`);
      checks.push(`PDF fuente de ${pdf.name}: generado y legible.`);
    }

    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/pesv/informes-anuales/diagnostico-organizacion", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByTestId("annual-pesv-organization-diagnosis").waitFor({ state: "visible", timeout: 30000 });
    await page.getByText("Diagnóstico del estado actual de la seguridad vial", { exact: true }).waitFor();
    await page.getByText("Requiere verificación", { exact: true }).waitFor();
    await page.getByText("Prueba funcional · DEMO-PRUEBA", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Abrir perfil de la empresa" }).waitFor();
    await page.getByRole("link", { name: "Abrir Contexto Organizacional" }).waitFor();
    await page.getByRole("link", { name: "Abrir inventario de vehículos" }).waitFor();
    await page.getByRole("link", { name: "Abrir base de conductores" }).waitFor();
    await page.getByRole("link", { name: "Abrir rutas seguras" }).waitFor();
    await page.getByText("No hay un PDF único del diagnóstico completo", { exact: true }).waitFor();
    assert.deepEqual(pageErrors, [], "La interfaz no debe producir errores de JavaScript.");
    screenshot = Buffer.from(await page.locator("main[data-testid='annual-pesv-organization-diagnosis']").screenshot({ animations: "disabled" }));
    await writeFile(`${evidenceDir}/informe-anual-08-pantalla.png`, screenshot);
    checks.push("Pantalla autenticada: identifica DEMO-PRUEBA, mantiene la advertencia y enlaza los seis módulos fuente.");

    const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Prueba funcional P03 — DEMO-PRUEBA</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:32px;max-width:1150px}h1{font-size:1.8rem}.tag{display:inline-block;background:#d8efe1;border-radius:24px;padding:6px 12px}li{margin:8px 0}.note{padding:16px;border-left:4px solid #a36b00;background:#fff6d9}figure{background:#fff;border:1px solid #dae7de;padding:12px;border-radius:12px}img{display:block;width:100%;height:auto}</style>
<h1>Prueba funcional — informe anual n.º 8: diagnóstico P03</h1>
<p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
<p>Se consultaron el perfil de empresa, P03, contexto organizacional, vehículos, conductores y rutas. Los documentos fuente PDF se generaron correctamente.</p>
<ul>${checks.map((check) => `<li>${check.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!)}</li>`).join("")}</ul>
<p class="note"><b>Resultado:</b> se verificó el flujo y la trazabilidad de módulos. El informe conserva “Requiere verificación”; el test no certifica que exista un documento consolidado ni que el diagnóstico sea real o completo.</p>
<figure><img src="data:image/png;base64,${screenshot!.toString("base64")}" alt="Informe P03 autenticado en DEMO-PRUEBA"><figcaption>Vista autenticada del informe anual n.º 8.</figcaption></figure></html>`;
    await writeFile(`${evidenceDir}/evidencia-prueba-funcional.html`, html);
    await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
      resultado: "COMPLETADA",
      empresa: company.name,
      entorno: "desarrollo",
      conteos: {
        factoresContextoActivos: reportState.contextFactorCount,
        vehiculos: reportState.vehicleCount,
        vehiculosActivos: reportState.activeVehicleCount,
        conductores: reportState.driverCount,
        conductoresActivos: reportState.activeDriverCount,
        rutasActivas: reportState.activeRouteCount,
        rutasActivasConPuntosCriticos: reportState.activeRoutesWithCriticalPoints,
      },
      evaluacionP03: reportState.evaluation,
      checks,
      fuentesDeNegocioModificadas: false,
      afirmacionDeCumplimiento: false,
      evidencia: ["informe-anual-08-pantalla.png", "evidencia-prueba-funcional.html"],
    }, null, 2));
    console.log(JSON.stringify({ resultado: "COMPLETADA", empresa: company.name, checks, evidenciaDir }, null, 2));
    await context.close();
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
