import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { chromium } from "playwright";
import { db } from "../server/db";
import { companies, users } from "../shared/schema";
import { storage } from "../server/storage";

if (process.env.NODE_ENV !== "development" || process.env.RUN_PESV_ANNUAL_BASELINE_TEST !== "1") {
  throw new Error("Solo se permite en desarrollo con RUN_PESV_ANNUAL_BASELINE_TEST=1");
}

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

  const factorsResponse = await context.request.get("/api/pesv/informes-anuales/linea-base/evidencias");
  if (!factorsResponse.ok()) throw new Error(`Falló la consulta de factores: HTTP ${factorsResponse.status()}`);
  const evidenceState = await factorsResponse.json() as {
    companyName: string;
    isTestCompany: boolean;
    factors: Array<{
      activo: number;
      valorBase: string | null;
    }>;
  };
  if (evidenceState.companyName !== "DEMO-PRUEBA" || evidenceState.isTestCompany !== true) {
    throw new Error("La consulta del informe no quedó asociada a la empresa interna DEMO-PRUEBA.");
  }
  const factors = evidenceState.factors;
  const activeFactors = factors.filter((factor) => factor.activo !== 0);
  const withBase = activeFactors.filter((factor) => factor.valorBase !== null && factor.valorBase.trim() !== "");
  const zeroBase = withBase.filter((factor) => Number(factor.valorBase) === 0);
  checks.push(`Fuente consultada: ${activeFactors.length} factor(es) activo(s), ${withBase.length} con valor base y ${zeroBase.length} valores base en cero.`);

  const page = await context.newPage();
  await page.goto("/pesv/informes-anuales/linea-base", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByTestId("annual-pesv-baseline-report").waitFor({ timeout: 30000 });
  await page.getByText("Pregunta: ¿La empresa ha definido la línea base o primera medición del estado actual de la seguridad vial?", { exact: true }).waitFor();
  await page.getByText("Evidencia solicitada: Copia en PDF", { exact: true }).waitFor();
  await page.getByText("Requiere verificación", { exact: true }).waitFor();
  await page.getByText("Prueba funcional · DEMO-PRUEBA", { exact: true }).waitFor();
  await page.getByText("La información disponible no permite confirmar por sí sola una línea base", { exact: true }).waitFor();
  if (activeFactors.length && withBase.length) {
    await page.getByTestId("button-download-baseline-source-pdf").waitFor();
  }
  checks.push("La pantalla muestra la pregunta y evidencia solicitadas, pero no declara cumplimiento sin verificación.");
  checks.push("La pantalla advierte que los valores cero no se interpretan automáticamente como una medición.");

  const pdfResponse = await context.request.get("/api/factores-desempeno-sv/pdf");
  const pdfBuffer = Buffer.from(await pdfResponse.body());
  if (!pdfResponse.ok()
    || !pdfResponse.headers()["content-type"]?.includes("application/pdf")
    || pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`No se pudo generar el PDF fuente: HTTP ${pdfResponse.status()}`);
  }
  checks.push("El botón de copia PDF apunta a un endpoint que responde un PDF válido.");

  const essentialCookiesButton = page.getByRole("button", { name: "Solo esenciales" });
  if (await essentialCookiesButton.isVisible().catch(() => false)) {
    await essentialCookiesButton.click();
  }
  const screenshot = Buffer.from(await page.screenshot({ fullPage: true, animations: "disabled" }));
  await writeFile(`${evidenceDir}/informe-anual-07-linea-base.png`, screenshot);
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Prueba funcional informe anual 7</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:32px;max-width:1150px}h1{font-size:1.8rem}.tag{display:inline-block;background:#d8efe1;border-radius:24px;padding:6px 12px}li{margin:8px 0}figure{background:#fff;border:1px solid #dae7de;padding:12px;border-radius:12px}img{display:block;width:100%;height:auto}.note{padding:16px;border-left:4px solid #a36b00;background:#fff6d9}</style>
<h1>Prueba funcional — informe anual n.º 7: línea base</h1>
<p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
<p>Se probó el informe contra los registros existentes de DEMO-PRUEBA. No se crearon ni modificaron factores de negocio.</p>
<ul>${checks.map((check) => `<li>${check.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)}</li>`).join("")}</ul>
<p class="note"><b>Resultado:</b> la pantalla consulta los datos y entrega acceso al PDF fuente, pero mantiene el estado “Requiere verificación”. Esta prueba del sistema no certifica cumplimiento. No se guarda una copia del PDF fuente aquí para evitar confundir datos de muestra con evidencia real.</p>
<figure><img src="data:image/png;base64,${screenshot.toString("base64")}" alt="Informe anual 7 en DEMO-PRUEBA, con revisión requerida"><figcaption>Vista del informe anual n.º 7 en DEMO-PRUEBA.</figcaption></figure></html>`;
  await writeFile(`${evidenceDir}/informe-prueba-funcional.html`, html);
  await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
    resultado: "COMPLETADA",
    empresa: "DEMO-PRUEBA",
    entorno: "desarrollo",
    factorsActive: activeFactors.length,
    factorsWithBase: withBase.length,
    zeroBaseValues: zeroBase.length,
    checks,
    businessRecordsCreatedOrChanged: false,
    complianceClaimed: false,
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
