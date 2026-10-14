import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { and, eq, like } from "drizzle-orm";
import { chromium } from "playwright";
import { db } from "../server/db";
import { actasMaximoOrganoPesv, companies, pesvInformeAnualEvidencias, users } from "../shared/schema";
import { storage } from "../server/storage";
import { objectStorageService } from "../server/objectStorage";

if (process.env.NODE_ENV !== "development" || process.env.RUN_PESV_ANNUAL_NO_UPLOAD_TEST !== "1") {
  throw new Error("Solo se permite en desarrollo con RUN_PESV_ANNUAL_NO_UPLOAD_TEST=1");
}

const [company] = await db.select().from(companies).where(eq(companies.id, "demo-company-001")).limit(1);
if (!company || company.name !== "DEMO-PRUEBA") throw new Error("La empresa DEMO-PRUEBA esperada no está disponible.");

const evidenceDir = "generated-artifacts/pesv-comite-demo-prueba";
await mkdir(evidenceDir, { recursive: true });

// Remove only the clearly named sample created by the earlier upload-flow test.
const oldSamples = await db.select().from(pesvInformeAnualEvidencias).where(and(
  eq(pesvInformeAnualEvidencias.companyId, company.id),
  eq(pesvInformeAnualEvidencias.reportCode, "comite-seguridad-vial"),
  like(pesvInformeAnualEvidencias.fileName, "PRUEBA-FUNCIONAL-%"),
));
for (const sample of oldSamples) {
  await objectStorageService.deleteObjectByUrl(sample.fileUrl).catch(() => false);
  await db.delete(pesvInformeAnualEvidencias).where(eq(pesvInformeAnualEvidencias.id, sample.id));
}
await unlink(`${evidenceDir}/PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf`).catch(() => undefined);
await unlink(`${evidenceDir}/PRUEBA-FUNCIONAL-ACTA-MAXIMO-ORGANO.pdf`).catch(() => undefined);

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
  const p01Page = await context.newPage();
  await p01Page.goto("/pesv/comite?tab=acta-organo-social", { waitUntil: "commit", timeout: 60000 });
  await p01Page.getByText("Acta del máximo órgano social", { exact: true }).waitFor({ timeout: 60000 });
  if (await p01Page.locator('input[type="file"]').count() !== 0) {
    throw new Error("P01 no debe solicitar archivos para generar esta evidencia.");
  }
  await p01Page.screenshot({ path: `${evidenceDir}/01-p01-acta-organo-social.png`, fullPage: true });
  checks.push("P01 incluye un formulario propio para el acta del máximo órgano social, sin carga de archivos.");

  const generatedActaResponse = await context.request.post("/api/pesv/comite/acta-maximo-organo", {
    data: {
      numeroActa: `PRUEBA-FUNCIONAL-${new Date().toISOString().slice(0, 10)}`,
      organoSocial: "PRUEBA FUNCIONAL — no usar como acta societaria",
      tipoSesion: "Ordinaria",
      fechaReunion: new Date().toISOString().slice(0, 10),
      lugar: "Prueba de funcionamiento",
      asistentes: "Registro temporal para validar la generación del documento.",
      quorum: "Dato de prueba; no representa una reunión real.",
      decision: "Validación funcional de la creación del PDF desde P01.",
      presidenteNombre: "Prueba Funcional",
      secretarioNombre: "Prueba Funcional",
    },
  });
  if (!generatedActaResponse.ok()) throw new Error(`No se pudo crear el registro de prueba: HTTP ${generatedActaResponse.status()} ${await generatedActaResponse.text()}`);
  const generatedActa = await generatedActaResponse.json() as { id: string };
  try {
    const generatedPdfResponse = await context.request.get(`/api/pesv/comite/acta-maximo-organo/${generatedActa.id}/pdf?download=1`);
    const generatedPdf = Buffer.from(await generatedPdfResponse.body());
    if (!generatedPdfResponse.ok() || !generatedPdfResponse.headers()["content-type"]?.includes("application/pdf")
        || !generatedPdfResponse.headers()["content-disposition"]?.includes("attachment")
        || generatedPdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error(`No se generó el PDF del acta del órgano social: HTTP ${generatedPdfResponse.status()}`);
    }
    await writeFile(`${evidenceDir}/PRUEBA-FUNCIONAL-ACTA-MAXIMO-ORGANO.pdf`, generatedPdf);
  } finally {
    await db.delete(actasMaximoOrganoPesv).where(eq(actasMaximoOrganoPesv.id, generatedActa.id));
  }
  checks.push("El sistema creó el acta de prueba y generó un PDF estandarizado; el registro de prueba se eliminó y el PDF quedó marcado PRUEBA FUNCIONAL.");
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
<p>Se verificó el flujo en desarrollo con la empresa DEMO-PRUEBA. La muestra PDF se conserva claramente marcada como prueba funcional; el registro de prueba fue eliminado.</p><ul>${checks.map((check) => `<li>${escape(check)}</li>`).join("")}</ul>
<p class="note"><b>Resultado:</b> P01 genera el PDF desde los datos registrados; no se solicita cargar archivos. La muestra no es un acta societaria válida.</p>
<figure><img src="data:image/png;base64,${p01Image.toString("base64")}" alt="P01 contiene el formulario para generar el acta del máximo órgano social"><figcaption>Formulario nuevo en el módulo P01.</figcaption></figure></html>`;
  await writeFile(`${evidenceDir}/informe-prueba-funcional.html`, html);
  await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
    result: "COMPLETADA",
    company: "DEMO-PRUEBA",
    environment: "development",
    checks,
    fileUploadControl: "REMOVIDO",
    samplePdf: "PRUEBA-FUNCIONAL-ACTA-MAXIMO-ORGANO.pdf",
    note: "La muestra PDF es únicamente una prueba funcional; no constituye acta societaria real.",
  }, null, 2));
  console.log(JSON.stringify({ result: "COMPLETADA", checks, evidenceDir, fileUploadControl: "REMOVIDO" }, null, 2));
}
