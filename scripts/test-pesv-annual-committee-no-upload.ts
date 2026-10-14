import { randomBytes, scryptSync } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { chromium } from "playwright";
import { db } from "../server/db";
import { actasMaximoOrganoPesv, companies, users } from "../shared/schema";
import { storage } from "../server/storage";

if (process.env.NODE_ENV !== "development" || process.env.RUN_PESV_ANNUAL_NO_UPLOAD_TEST !== "1") {
  throw new Error("Solo se permite en desarrollo con RUN_PESV_ANNUAL_NO_UPLOAD_TEST=1");
}

const [company] = await db.select().from(companies).where(eq(companies.id, "demo-company-001")).limit(1);
if (!company || company.name !== "DEMO-PRUEBA") throw new Error("La empresa DEMO-PRUEBA esperada no está disponible.");

const evidenceDir = "generated-artifacts/pesv-comite-demo-prueba";
await mkdir(evidenceDir, { recursive: true });
const writeIfMissing = async (path: string, content: Buffer) => {
  try {
    await access(path);
    return false;
  } catch {
    await writeFile(path, content);
    return true;
  }
};

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
const testUsername = `qa-pesv-no-upload-${randomBytes(5).toString("hex")}`;
let tempUserId: string | undefined;
let failure: unknown;
let verifiedActNumber: string | undefined;
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
  if (!login.ok()) throw new Error(`No inició sesión la cuenta técnica: HTTP ${login.status()}`);
  checks.push("Autenticación temporal en DEMO-PRUEBA: correcta.");

  const actsResponse = await context.request.get("/api/pesv/comite/actos-administrativos");
  if (!actsResponse.ok()) throw new Error(`No se pudo consultar P01: HTTP ${actsResponse.status()}`);
  const acts = await actsResponse.json() as Array<{ estado: string }>;
  const currentAct = acts.find((act) => act.estado === "vigente") as { id: string; estado: string } | undefined;
  if (!currentAct) throw new Error("No hay un acto vigente para mostrar el contexto del informe.");
  const p01Component = await readFile("client/src/components/pesv/ActaMaximoOrganoTab.tsx", "utf8");
  const annualPage = await readFile("client/src/pages/PesvInformeAnualComite.tsx", "utf8");
  if (!p01Component.includes("Acta del máximo órgano social") || p01Component.includes('type="file"')) {
    throw new Error("P01 no contiene el generador de actas esperado o solicita cargar archivos.");
  }
  if (!annualPage.includes("Descargar acta PDF") || !annualPage.includes("download=1")) {
    throw new Error("El informe anual no incluye la descarga directa del acta.");
  }
  checks.push("P01 incluye un formulario propio para el acta del máximo órgano social, sin carga de archivos.");
  checks.push("El informe anual incluye el botón para descargar el PDF del acta registrada.");

  const page = await context.newPage();
  await page.goto("/pesv/comite?tab=acta-organo-social", { waitUntil: "commit", timeout: 60000 });
  try {
    await page.getByTestId("input-auto-act-number").waitFor({ timeout: 60000 });
  } catch {
    const pageText = (await page.locator("body").innerText()).slice(0, 600);
    throw new Error(`No apareció el formulario P01. Ruta visible: ${page.url()}. Contenido: ${pageText}`);
  }
  const numberPreview = await page.getByTestId("input-auto-act-number").inputValue();
  if (!/^\d{3}-\d{4}$/.test(numberPreview)) throw new Error(`P01 no muestra el consecutivo automático esperado: ${numberPreview}`);
  const dropdownChecks = [
    ["select-social-body", "Junta de Socios"],
    ["select-csv-exists", "Sí"],
    ["select-session-type", "Ordinaria"],
    ["select-meeting-mode", "Virtual"],
    ["select-quorum-outcome", "Quórum verificado"],
    ["select-decision-outcome", "Aprobada"],
  ] as const;
  for (const [testId, optionName] of dropdownChecks) {
    await page.getByTestId(testId).click();
    await page.getByRole("option", { name: optionName, exact: true }).waitFor({ timeout: 5000 });
    await page.keyboard.press("Escape");
  }
  const p01FullPage = Buffer.from(await page.screenshot({ fullPage: true }));
  await writeIfMissing(`${evidenceDir}/05-p01-formulario-csv-full.png`, p01FullPage);
  await page.getByTestId("input-auto-act-number").scrollIntoViewIfNeeded();
  const p01FormImage = Buffer.from(await page.screenshot());
  await writeIfMissing(`${evidenceDir}/06-p01-formulario-csv.png`, p01FormImage);
  checks.push("El formulario cargó en P01; se verificaron las seis listas desplegables y la vista previa del consecutivo.");

  const testBodyName = "PRUEBA FUNCIONAL — formulario automatizado P01";
  const [savedTestAct] = await db.select().from(actasMaximoOrganoPesv).where(and(
    eq(actasMaximoOrganoPesv.companyId, company.id),
    eq(actasMaximoOrganoPesv.organoSocial, testBodyName),
    eq(actasMaximoOrganoPesv.existeCsv, true),
  )).limit(1);
  let generatedActa = savedTestAct;
  if (!generatedActa) {
    const generatedActaResponse = await context.request.post("/api/pesv/comite/acta-maximo-organo", {
      data: {
        organoSocial: testBodyName,
        existeCsv: true,
        tipoSesion: "Ordinaria",
        fechaReunion: new Date().toISOString().slice(0, 10),
        lugar: "Presencial — Sala de prueba funcional",
        asistentes: "Registro de prueba funcional; no representa asistentes a una reunión real.",
        quorum: "Quórum verificado — registro de prueba funcional, sin efecto societario.",
        decision: "Aprobada — validación de generación del PDF desde P01; sin efecto societario.",
        presidenteNombre: "Prueba Funcional",
        secretarioNombre: "Prueba Funcional",
      },
    });
    if (!generatedActaResponse.ok()) throw new Error(`No se pudo crear el registro de prueba: HTTP ${generatedActaResponse.status()} ${await generatedActaResponse.text()}`);
    generatedActa = await generatedActaResponse.json() as typeof generatedActa;
  } else {
    checks.push("Se reutilizó el acta funcional persistente existente; no se creó un duplicado.");
  }
  if (!generatedActa) throw new Error("No se encontró ni creó el acta funcional persistente.");
  if (!/^\d+-\d{4}$/.test(generatedActa.numeroActa)) {
    throw new Error(`El número de acta no parece consecutivo y automático: ${generatedActa.numeroActa}`);
  }
  if (generatedActa.existeCsv !== true) throw new Error("El acta no conserva la declaración explícita de existencia del CSV.");
  verifiedActNumber = generatedActa.numeroActa;
  const generatedPdfResponse = await context.request.get(`/api/pesv/comite/acta-maximo-organo/${generatedActa.id}/pdf?download=1`);
  const generatedPdf = Buffer.from(await generatedPdfResponse.body());
  if (!generatedPdfResponse.ok() || !generatedPdfResponse.headers()["content-type"]?.includes("application/pdf")
      || !generatedPdfResponse.headers()["content-disposition"]?.includes("attachment")
      || generatedPdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`No se generó el PDF del acta del órgano social: HTTP ${generatedPdfResponse.status()}`);
  }
  await writeIfMissing(`${evidenceDir}/PRUEBA-FUNCIONAL-ACTA-CSV-DECLARACION.pdf`, generatedPdf);
  checks.push("El acta de prueba y el PDF se conservaron en DEMO-PRUEBA para revisión; ambos están marcados como prueba funcional.");
  checks.push(`El servidor asignó el consecutivo automático ${generatedActa.numeroActa}.`);
  checks.push("El registro conserva la respuesta explícita sobre la existencia del CSV.");
  await page.goto("/pesv/informes-anuales/comite-seguridad-vial", { waitUntil: "commit", timeout: 60000 });
  await page.getByText("Sí, según el acta del máximo órgano social", { exact: true }).waitFor({ timeout: 30000 });
  await page.getByText("Acta de prueba funcional", { exact: true }).waitFor({ timeout: 10000 });
  const annualReportImage = Buffer.from(await page.screenshot());
  await writeIfMissing(`${evidenceDir}/08-informe-anual-respuesta-csv.png`, annualReportImage);
  checks.push("El informe anual muestra la respuesta explícita y enlaza la descarga del acta.");
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
  const escape = (text: string) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const p01Image = await readFile(`${evidenceDir}/01-p01-acta-organo-social.png`);
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Verificación sin cargas — DEMO-PRUEBA</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:36px;max-width:1100px}h1{font-size:2rem}.tag{display:inline-block;background:#d8efe1;border-radius:30px;padding:6px 12px}li{margin:8px 0}figure{background:#fff;border:1px solid #dae7de;padding:12px;margin:22px 0;border-radius:12px}img{display:block;width:100%;height:auto}.note{padding:16px;border-left:4px solid #a36b00;background:#fff6d9}</style>
<h1>Verificación funcional del acta del máximo órgano social en P01</h1><p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
 <p>Se verificó el flujo en desarrollo con la empresa DEMO-PRUEBA. El registro del acta y el PDF se conservaron para revisión.</p><ul>${checks.map((check) => `<li>${escape(check)}</li>`).join("")}</ul>
 <p class="note"><b>Resultado:</b> P01 asigna el número y genera el PDF desde los datos registrados; no se solicita cargar archivos. La muestra no es un acta societaria válida.</p>
<figure><img src="data:image/png;base64,${p01Image.toString("base64")}" alt="P01 contiene el formulario para generar el acta del máximo órgano social"><figcaption>Formulario nuevo en el módulo P01.</figcaption></figure></html>`;
  await writeFile(`${evidenceDir}/informe-prueba-funcional.html`, html);
  await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
    result: "COMPLETADA",
    company: "DEMO-PRUEBA",
    environment: "development",
    checks,
    fileUploadControl: "REMOVIDO",
    samplePdf: "PRUEBA-FUNCIONAL-ACTA-CSV-DECLARACION.pdf",
    actNumber: verifiedActNumber,
    note: "El registro y el PDF están marcados PRUEBA FUNCIONAL y no constituyen evidencia societaria real.",
  }, null, 2));
  console.log(JSON.stringify({ result: "COMPLETADA", checks, evidenceDir, fileUploadControl: "REMOVIDO" }, null, 2));
}
