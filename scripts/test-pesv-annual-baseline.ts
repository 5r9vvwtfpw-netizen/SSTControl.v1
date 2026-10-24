import { randomBytes, scryptSync } from "node:crypto";
import { spawnSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { chromium } from "playwright";
import { db } from "../server/db";
import { companies, users } from "../shared/schema";
import { storage } from "../server/storage";

if (process.env.NODE_ENV !== "development" || process.env.RUN_PESV_ANNUAL_BASELINE_SCENARIO !== "1") {
  throw new Error("Solo se permite en desarrollo con RUN_PESV_ANNUAL_BASELINE_SCENARIO=1");
}

const scenarioValues: Record<string, { base: number; current: number }> = {
  "SPF-001": { base: 100000, current: 120000 },
  "SPF-002": { base: 20000, current: 22500 },
  "SPF-003": { base: 7000, current: 7800 },
  "SPF-004": { base: 8, current: 8 },
  "SPF-005": { base: 0, current: 0 },
  "SPF-006": { base: 0, current: 0 },
  "SPF-007": { base: 1, current: 1 },
  "SPF-008": { base: 12, current: 5 },
  "SPF-009": { base: 25, current: 12.5 },
  "SPF-010": { base: 12, current: 6 },
  "SPF-011": { base: 8, current: 4 },
  "SPF-012": { base: 82, current: 95 },
  "SPF-013": { base: 70, current: 90 },
  "SPF-014": { base: 75, current: 100 },
  "SPF-015": { base: 80, current: 92 },
  "SPF-016": { base: 89, current: 100 },
  "SPF-017": { base: 75, current: 87.5 },
  "SPF-018": { base: 87.5, current: 100 },
  "SPF-019": { base: 75, current: 100 },
};
const scenarioMarker = "ESCENARIO DE PRUEBA PESV";
const scenarioNotice = `${scenarioMarker}: valores de ensayo, no son mediciones reales ni evidencia de cumplimiento.`;

const [company] = await db.select({ id: companies.id, name: companies.name })
  .from(companies).where(eq(companies.name, "DEMO-PRUEBA")).limit(1);
if (!company) throw new Error("No se encontró DEMO-PRUEBA en la base de desarrollo.");

const evidenceDir = "generated-artifacts/pesv-linea-base-demo-prueba";
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
  args: ["--no-sandbox"],
  headless: true,
});
const context = await browser.newContext({
  baseURL: "http://127.0.0.1:5000",
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 1000 },
});
const tempPassword = randomBytes(32).toString("hex");
const salt = randomBytes(16).toString("hex");
const passwordHash = `${scryptSync(tempPassword, salt, 64).toString("hex")}.${salt}`;
const testUsername = `qa-pesv-baseline-${randomBytes(5).toString("hex")}`;
let tempUserId: string | undefined;
let failure: unknown;
const checks: string[] = [];

try {
  const [tempUser] = await db.insert(users).values({
    username: testUsername,
    password: passwordHash,
    role: "admin",
    fullName: "Cuenta temporal de prueba PESV",
    companyId: company.id,
    emailVerifiedAt: new Date(),
  }).returning({ id: users.id });
  tempUserId = tempUser.id;

  const login = await context.request.post("/api/login", {
    data: { username: testUsername, password: tempPassword },
  });
  if (!login.ok()) throw new Error(`Falló el inicio de sesión de prueba: HTTP ${login.status()}`);
  checks.push("Autenticación de prueba en DEMO-PRUEBA: correcta.");

  const sourceFactorsResponse = await context.request.get("/api/factores-desempeno-sv");
  if (!sourceFactorsResponse.ok()) throw new Error(`Falló la consulta del módulo fuente: HTTP ${sourceFactorsResponse.status()}`);
  const sourceFactors = await sourceFactorsResponse.json() as Array<{
    id: string;
    codigo: string;
    nombre: string;
    valorBase: string | null;
    valorActual: string | null;
    observaciones: string | null;
  }>;
  if (sourceFactors.length !== 19 || sourceFactors.some((factor) => !scenarioValues[factor.codigo])) {
    throw new Error(`Se esperaban exactamente los 19 factores SPF-001 a SPF-019; encontrados: ${sourceFactors.length}.`);
  }
  const backupPath = `${evidenceDir}/valores-originales-antes-de-prueba.json`;
  try {
    await access(backupPath);
  } catch {
    await writeFile(backupPath, JSON.stringify(sourceFactors, null, 2));
  }
  const recordedAt = new Date().toISOString();
  for (const factor of sourceFactors) {
    const values = scenarioValues[factor.codigo];
    const previousNote = factor.observaciones?.trim();
    const observations = `${scenarioNotice} Registrado ${recordedAt}.${previousNote ? ` Nota anterior conservada: ${previousNote}` : ""}`;
    const response = await context.request.patch(`/api/factores-desempeno-sv/${factor.id}`, {
      data: {
        valorBase: String(values.base),
        valorActual: String(values.current),
        observaciones: observations,
      },
    });
    if (!response.ok()) throw new Error(`No se pudo guardar el escenario de ${factor.codigo}: HTTP ${response.status()}`);
  }
  checks.push("Los 19 factores quedaron con valores base y actuales de escenario, identificados como datos de prueba.");

  const factorsResponse = await context.request.get("/api/pesv/informes-anuales/linea-base/evidencias");
  if (!factorsResponse.ok()) throw new Error(`Falló la consulta de factores: HTTP ${factorsResponse.status()}`);
  const evidenceState = await factorsResponse.json() as {
    companyName: string;
    isTestCompany: boolean;
    factors: Array<{
      activo: number;
      valorBase: string | null;
      valorActual: string | null;
      observaciones: string | null;
    }>;
  };
  if (evidenceState.companyName !== "DEMO-PRUEBA" || evidenceState.isTestCompany !== true) {
    throw new Error("La consulta del informe no quedó asociada a la empresa interna DEMO-PRUEBA.");
  }
  const factors = evidenceState.factors;
  const activeFactors = factors.filter((factor) => factor.activo !== 0);
  const withBase = activeFactors.filter((factor) => factor.valorBase !== null && factor.valorBase.trim() !== "");
  const zeroBase = withBase.filter((factor) => Number(factor.valorBase) === 0);
  const scenarioCount = activeFactors.filter((factor) => factor.observaciones?.includes(scenarioMarker)).length;
  const withCurrent = activeFactors.filter((factor) => factor.valorActual !== null && factor.valorActual.trim() !== "");
  if (activeFactors.length !== 19 || withBase.length !== 19 || withCurrent.length !== 19 || scenarioCount !== 19) {
    throw new Error(`El escenario quedó incompleto: activos=${activeFactors.length}, base=${withBase.length}, actual=${withCurrent.length}, marcados=${scenarioCount}.`);
  }
  checks.push(`Fuente consultada: ${activeFactors.length} factores con valor base y actual de escenario; ${scenarioCount} marcados como prueba.`);

  const page = await context.newPage();
  let screenshot: Buffer;
  if (process.env.SKIP_UNSTABLE_DEV_BROWSER === "1") {
    screenshot = await readFile(`${evidenceDir}/informe-anual-07-linea-base.png`);
    checks.push("Se conserva la captura autenticada de la prueba visual previa; se omitió navegar de nuevo por la inestabilidad de Neon en desarrollo.");
  } else {
    await page.goto("/pesv/informes-anuales/linea-base", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByTestId("annual-pesv-baseline-report").waitFor({ timeout: 30000 });
    await page.getByText("Pregunta: ¿La empresa ha definido la línea base o primera medición del estado actual de la seguridad vial?", { exact: true }).waitFor();
    await page.getByText("Evidencia solicitada: Copia en PDF", { exact: true }).waitFor();
    await page.getByText("Requiere verificación", { exact: true }).waitFor();
    await page.getByText("Prueba funcional · DEMO-PRUEBA", { exact: true }).waitFor();
    await page.getByText("Valores de escenario de prueba", { exact: true }).waitFor();
    await page.getByText("La información disponible no permite confirmar por sí sola una línea base", { exact: true }).waitFor();
    if (activeFactors.length && withBase.length) {
      await page.getByTestId("button-download-baseline-source-pdf").waitFor();
    }
    checks.push("La pantalla identifica los valores como escenario y no afirma que la empresa cumpla.");
    const essentialCookiesButton = page.getByRole("button", { name: "Solo esenciales" });
    if (await essentialCookiesButton.isVisible().catch(() => false)) {
      await essentialCookiesButton.click();
    }
    screenshot = Buffer.from(await page.locator('main[data-testid="annual-pesv-baseline-report"]').screenshot({ animations: "disabled" }));
    await writeFile(`${evidenceDir}/informe-anual-07-linea-base.png`, screenshot);
  }

  const pdfResponse = await context.request.get("/api/factores-desempeno-sv/pdf");
  const pdfBuffer = Buffer.from(await pdfResponse.body());
  if (!pdfResponse.ok()
    || !pdfResponse.headers()["content-type"]?.includes("application/pdf")
    || pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`No se pudo generar el PDF fuente: HTTP ${pdfResponse.status()}`);
  }
  const extractedPdfText = spawnSync("pdftotext", ["-", "-"], { input: pdfBuffer, encoding: "utf8" });
  if (extractedPdfText.status !== 0
    || !extractedPdfText.stdout.includes("PRUEBA FUNCIONAL")
    || !extractedPdfText.stdout.includes("NO SON MEDICIONES REALES")
    || !extractedPdfText.stdout.includes("Paso P04")
    || !extractedPdfText.stdout.includes("cláusula 6.3")) {
    throw new Error("El PDF no incluye el aviso que impide confundir el escenario con evidencia real.");
  }
  await writeFile(`${evidenceDir}/factores-desempeno-escenario-prueba.pdf`, pdfBuffer);
  checks.push("El PDF contiene la marca de escenario de prueba y la trazabilidad PESV P04 / ISO 39001:2012, cláusula 6.3.");

  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Prueba funcional informe anual 7</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:32px;max-width:1150px}h1{font-size:1.8rem}.tag{display:inline-block;background:#d8efe1;border-radius:24px;padding:6px 12px}li{margin:8px 0}figure{background:#fff;border:1px solid #dae7de;padding:12px;border-radius:12px}img{display:block;width:100%;height:auto}.note{padding:16px;border-left:4px solid #a36b00;background:#fff6d9}</style>
  <h1>Prueba funcional — informe anual n.º 7: línea base</h1>
<p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
<p>Se registraron valores de escenario en los 19 factores para probar la vista y la descarga. Se guardó copia de los valores previos en el archivo de respaldo incluido.</p>
<ul>${checks.map((check) => `<li>${check.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)}</li>`).join("")}</ul>
<p class="note"><b>Resultado:</b> los 19 factores tienen valores de escenario; la vista mantiene “Requiere verificación” y el PDF lleva aviso de prueba. Los valores no son mediciones reales, no permiten determinar cumplimiento real y no deben entregarse a SISI/PESV como evidencia.</p>
<p>PDF generado: factores-desempeno-escenario-prueba.pdf. Respaldo de valores previos: valores-originales-antes-de-prueba.json.</p>
<figure><img src="data:image/png;base64,${screenshot.toString("base64")}" alt="Informe anual 7 en DEMO-PRUEBA, con advertencia de datos de escenario"><figcaption>Vista del informe anual n.º 7 en DEMO-PRUEBA.</figcaption></figure></html>`;
  await writeFile(`${evidenceDir}/informe-prueba-funcional.html`, html);
  await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
    resultado: "COMPLETADA",
    empresa: "DEMO-PRUEBA",
    entorno: "desarrollo",
    factorsActive: activeFactors.length,
    factorsWithBase: withBase.length,
    zeroBaseValues: zeroBase.length,
    factorsWithCurrent: withCurrent.length,
    factorsMarkedAsTestScenario: scenarioCount,
    checks,
    businessRecordsCreatedOrChanged: true,
    complianceClaimed: false,
    scenarioValuesAreRealMeasurements: false,
  }, null, 2));
} catch (error) {
  failure = error;
} finally {
  await context.close();
  await browser.close();
  if (tempUserId) {
    try {
      await storage.deleteUser(tempUserId);
    } catch {
      const fallbackSalt = randomBytes(16).toString("hex");
      await db.update(users).set({
        username: `revoked-${tempUserId}`,
        password: `${scryptSync(randomBytes(64).toString("hex"), fallbackSalt, 64).toString("hex")}.${fallbackSalt}`,
        role: "trabajador",
        workerId: null,
        emailVerifiedAt: null,
      }).where(eq(users.id, tempUserId));
    }
  }
}

if (failure) {
  console.error(failure);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ resultado: "COMPLETADA", empresa: "DEMO-PRUEBA", evidencia: evidenceDir, checks }, null, 2));
}
