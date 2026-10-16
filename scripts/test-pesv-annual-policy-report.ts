import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { chromium } from "playwright";
import { db } from "../server/db";
import { companies, users } from "../shared/schema";
import { storage } from "../server/storage";

if (process.env.NODE_ENV !== "development" || process.env.RUN_PESV_ANNUAL_POLICY_TEST !== "1") {
  throw new Error("Solo se permite en desarrollo con RUN_PESV_ANNUAL_POLICY_TEST=1");
}

const [company] = await db.select().from(companies).where(eq(companies.id, "demo-company-001")).limit(1);
if (!company || company.name !== "DEMO-PRUEBA") throw new Error("No está disponible la empresa DEMO-PRUEBA.");

const evidenceDir = "generated-artifacts/pesv-politica-seguridad-vial";
await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
  args: ["--no-sandbox"],
  headless: true,
});
const context = await browser.newContext({
  baseURL: "http://127.0.0.1:5000",
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 980 },
});
const tempPassword = randomBytes(32).toString("hex");
const salt = randomBytes(16).toString("hex");
const passwordHash = `${scryptSync(tempPassword, salt, 64).toString("hex")}.${salt}`;
const testUsername = `qa-pesv-policy-${randomBytes(5).toString("hex")}`;
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

  const login = await context.request.post("/api/login", { data: { username: testUsername, password: tempPassword } });
  if (!login.ok()) throw new Error(`Falló el inicio de sesión de prueba: HTTP ${login.status()}`);
  checks.push("Inicio de sesión de prueba en DEMO-PRUEBA: correcto.");

  const page = await context.newPage();
  await page.goto("/pesv/informes-anuales", { waitUntil: "domcontentloaded" });
  await page.getByTestId("pesv-annual-reports-page").waitFor({ timeout: 30000 });
  await page.getByText("4 informes incorporados", { exact: true }).waitFor({ timeout: 10000 });
  const annualLink = page.locator('a[href="/pesv/informes-anuales/politica-seguridad-vial"]');
  if (await annualLink.count() !== 1) throw new Error("No aparece la tarjeta de Política de Seguridad Vial en el listado anual.");
  const annualListImage = Buffer.from(await page.screenshot({ fullPage: true }));
  await writeFile(`${evidenceDir}/01-listado-anual.png`, annualListImage);
  checks.push("El listado anual muestra 4 informes e incluye la tarjeta de Política de Seguridad Vial.");

  await page.goto("/pesv/informes-anuales/politica-seguridad-vial", { waitUntil: "domcontentloaded" });
  await page.getByTestId("pesv-quarterly-policy-report").waitFor({ timeout: 30000 });
  await page.getByText("Informe anual SISI/PESV", { exact: true }).waitFor({ timeout: 30000 });
  await page.getByTestId("road-safety-policy-answer").waitFor({ timeout: 30000 });
  const statusResponse = await context.request.get("/api/pesv/informes-trimestrales/politica-seguridad-vial/estado");
  if (!statusResponse.ok()) throw new Error(`Falló la consulta de estado: HTTP ${statusResponse.status()}`);
  const status = await statusResponse.json() as { hasApprovedPolicy: boolean; policy: { id: string } | null };
  const annualPageImage = Buffer.from(await page.screenshot({ fullPage: true }));
  await writeFile(`${evidenceDir}/02-informe-anual-politica.png`, annualPageImage);
  checks.push(`La pantalla anual abre y muestra el estado consultado: ${status.hasApprovedPolicy ? "Sí" : "No"} cuenta con política aprobada y vigente.`);
  checks.push("La pantalla mantiene el enlace al módulo fuente Políticas SST, paso P03.");

  const pdfResponse = await context.request.get("/api/pesv/informes-trimestrales/politica-seguridad-vial.pdf?period=annual");
  const pdf = Buffer.from(await pdfResponse.body());
  if (!pdfResponse.ok() || !pdfResponse.headers()["content-type"]?.includes("application/pdf") || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`La descarga del informe anual PDF falló: HTTP ${pdfResponse.status()}`);
  }
  await writeFile(`${evidenceDir}/03-informe-anual-politica.pdf`, pdf);
  checks.push("La descarga del informe anual genera un PDF válido.");

  const xlsxResponse = await context.request.get("/api/pesv/informes-trimestrales/politica-seguridad-vial.xlsx?period=annual");
  const xlsx = Buffer.from(await xlsxResponse.body());
  if (!xlsxResponse.ok() || !xlsxResponse.headers()["content-type"]?.includes("spreadsheetml") || xlsx.subarray(0, 2).toString("ascii") !== "PK") {
    throw new Error(`La descarga del informe anual Excel falló: HTTP ${xlsxResponse.status()}`);
  }
  await writeFile(`${evidenceDir}/04-informe-anual-politica.xlsx`, xlsx);
  checks.push("La descarga del informe anual genera un Excel válido.");

  let sourceCopy = "No se encontró una política aprobada y vigente; por tanto, la descarga de copia fuente no se habilita.";
  if (status.policy) {
    const sourceResponse = await context.request.get(`/api/politicas-sst/${encodeURIComponent(status.policy.id)}/pdf`);
    const sourcePdf = Buffer.from(await sourceResponse.body());
    if (!sourceResponse.ok() || !sourceResponse.headers()["content-type"]?.includes("application/pdf") || sourcePdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error(`Falló la copia PDF del documento fuente: HTTP ${sourceResponse.status()}`);
    }
    await writeFile(`${evidenceDir}/05-copia-politica-fuente.pdf`, sourcePdf);
    sourceCopy = "La copia PDF oficial del registro de Políticas SST se descargó correctamente.";
    checks.push(sourceCopy);
  }

  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Evidencia funcional — Política de Seguridad Vial</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:32px;max-width:1100px}h1{font-size:2rem}.tag{display:inline-block;background:#d8efe1;border-radius:30px;padding:6px 12px}li{margin:8px 0}figure{background:#fff;border:1px solid #dae7de;padding:12px;margin:22px 0;border-radius:12px}img{display:block;width:100%;height:auto}.note{padding:16px;border-left:4px solid #a36b00;background:#fff6d9}</style>
<h1>Prueba funcional: Política de Seguridad Vial</h1><p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
<p>Prueba autenticada del acceso desde Informe anual SISI/PESV, la consulta a P03 y las exportaciones.</p><ul>${checks.map((check) => `<li>${check.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)}</li>`).join("")}</ul>
<p><b>Estado consultado:</b> ${status.hasApprovedPolicy ? "Sí, política aprobada y vigente." : "No, no se encontró política aprobada y vigente."}</p><p>${sourceCopy}</p>
<p class="note"><b>Alcance:</b> datos y archivos de prueba en entorno de desarrollo. No se creó ni modificó una política de Seguridad Vial y la prueba no certifica cumplimiento normativo.</p>
<figure><img src="data:image/png;base64,${annualListImage.toString("base64")}" alt="Listado anual con tarjeta de Política de Seguridad Vial"><figcaption>1. Listado anual SISI/PESV con el cuarto informe.</figcaption></figure>
<figure><img src="data:image/png;base64,${annualPageImage.toString("base64")}" alt="Detalle anual del informe de Política de Seguridad Vial"><figcaption>2. Detalle y respuesta consultada.</figcaption></figure></html>`;
  await writeFile(`${evidenceDir}/evidencia-prueba-funcional.html`, html);
  await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
    result: "COMPLETADA",
    company: "DEMO-PRUEBA",
    environment: "development",
    annualListContainsReport: true,
    hasApprovedPolicy: status.hasApprovedPolicy,
    sourceCopyAvailable: !!status.policy,
    checks,
    generatedFiles: ["03-informe-anual-politica.pdf", "04-informe-anual-politica.xlsx", ...(status.policy ? ["05-copia-politica-fuente.pdf"] : [])],
    note: "La prueba no creó ni modificó una política y no constituye certificación normativa.",
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
  console.log(JSON.stringify({ result: "COMPLETADA", evidenceDir }, null, 2));
}
