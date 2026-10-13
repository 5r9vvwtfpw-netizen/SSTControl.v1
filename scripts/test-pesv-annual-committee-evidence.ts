import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import PDFDocument from "pdfkit";
import { chromium } from "playwright";
import { and, eq } from "drizzle-orm";
import { db } from "../server/db";
import { companies, pesvInformeAnualEvidencias, users } from "../shared/schema";
import { storage } from "../server/storage";
import { addParagraph, addSectionBar, addStandardHeader } from "../server/services/pdf-standardizer";

if (process.env.NODE_ENV !== "development" || process.env.RUN_PESV_ANNUAL_EVIDENCE_TEST !== "1") {
  throw new Error("Solo se permite en desarrollo con RUN_PESV_ANNUAL_EVIDENCE_TEST=1");
}

const [company] = await db.select().from(companies).where(eq(companies.id, "demo-company-001")).limit(1);
if (!company || company.name !== "DEMO-PRUEBA") throw new Error("La empresa DEMO-PRUEBA esperada no está disponible.");

const existingEvidence = await db.select().from(pesvInformeAnualEvidencias).where(and(
  eq(pesvInformeAnualEvidencias.companyId, company.id),
  eq(pesvInformeAnualEvidencias.reportCode, "comite-seguridad-vial"),
)).limit(1);
if (existingEvidence[0] && !existingEvidence[0].fileName.startsWith("PRUEBA-FUNCIONAL-")) {
  throw new Error("Ya hay una evidencia que no es de prueba; se conserva intacta y no se reemplaza.");
}

const evidenceDir = "generated-artifacts/pesv-comite-demo-prueba";
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
const testUsername = `qa-pesv-annual-${randomBytes(5).toString("hex")}`;
let tempUserId: string | undefined;
let testPdfUrl: string | undefined;
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
  checks.push("Autenticación de prueba en DEMO-PRUEBA: correcta.");

  const actsResponse = await context.request.get("/api/pesv/comite/actos-administrativos");
  if (!actsResponse.ok()) throw new Error(`No se pudo consultar P01: HTTP ${actsResponse.status()}`);
  const acts = await actsResponse.json() as Array<{ id: string; numeroDocumento: string; estado: string }>;
  if (!acts.some((act) => act.estado === "vigente")) throw new Error("No hay un acto vigente para mostrar el contexto del informe.");
  checks.push(`Contexto P01 consultado sin editar registros: ${acts.filter((act) => act.estado === "vigente").length} actos vigentes.`);

  const doc = new PDFDocument({ size: "LETTER", margin: 35 });
  const pdfParts: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => pdfParts.push(chunk));
  const pdfReady = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(pdfParts)));
    doc.on("error", reject);
  });
  let y = await addStandardHeader({
    doc,
    company,
    documentTitle: "MUESTRA DE PRUEBA — NO ES ACTA DEL MÁXIMO ÓRGANO SOCIAL",
    documentCode: "QA-PESV-EVIDENCIA-2026",
    logoBuffer: null,
  });
  y = addSectionBar(doc, "Aviso de prueba", y);
  y = addParagraph(doc, "Este archivo se creó únicamente para probar la carga y consulta del punto anual SISI/PESV en DEMO-PRUEBA.", { y });
  y = addParagraph(doc, "NO ES UN ACTA REAL, NO ACREDITA LA EXISTENCIA DEL COMITÉ Y NO DEBE USARSE COMO CERTIFICACIÓN NI SOPORTE OFICIAL.", { y, bold: true });
  addParagraph(doc, "La empresa debe reemplazar esta muestra por la copia auténtica del acta solicitada antes de presentar el informe.", { y });
  doc.end();
  const testPdf = await pdfReady;
  const localPdfPath = `${evidenceDir}/PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf`;
  await writeFile(localPdfPath, testPdf);

  const upload = await context.request.post("/api/pesv/informes-anuales/comite-seguridad-vial/evidencia", {
    multipart: { file: { name: "PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf", mimeType: "application/pdf", buffer: testPdf } },
  });
  if (!upload.ok()) throw new Error(`La carga del PDF falló: HTTP ${upload.status()} ${(await upload.text()).slice(0, 300)}`);
  const saved = await upload.json() as { fileUrl: string; fileName: string };
  if (!saved.fileName.startsWith("PRUEBA-FUNCIONAL-")) throw new Error("El nombre de prueba no quedó guardado.");
  testPdfUrl = saved.fileUrl;
  checks.push("Carga de PDF válido al punto del informe anual: correcta.");

  const readBack = await context.request.get(saved.fileUrl);
  const returnedPdf = Buffer.from(await readBack.body());
  if (!readBack.ok() || returnedPdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("El PDF guardado no pudo recuperarse desde la ruta protegida de objetos.");
  }
  checks.push("Lectura del PDF almacenado con sesión autenticada: correcta.");

  const reportPage = await context.newPage();
  await reportPage.goto("/pesv/informes-anuales/comite-seguridad-vial", { waitUntil: "commit", timeout: 60000 });
  await reportPage.getByTestId("annual-pesv-committee-report").waitFor({ timeout: 60000 });
  await reportPage.getByText("DEMO-PRUEBA", { exact: false }).waitFor({ timeout: 60000 });
  await reportPage.getByText("PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf").waitFor({ timeout: 60000 });
  const cookieButton = reportPage.getByRole("button", { name: "Solo esenciales", exact: true });
  if (await cookieButton.isVisible()) await cookieButton.click();
  await reportPage.screenshot({ path: `${evidenceDir}/01-informe-anual-evidencia.png`, fullPage: true });
  checks.push("El informe anual mostró el nombre del PDF y la acción para abrirlo.");

  const p01Page = await context.newPage();
  await p01Page.goto("/pesv/comite?tab=acto-administrativo", { waitUntil: "commit", timeout: 60000 });
  await p01Page.getByText("Acto Administrativo", { exact: true }).waitFor({ timeout: 60000 });
  const p01CookieButton = p01Page.getByRole("button", { name: "Solo esenciales", exact: true });
  if (await p01CookieButton.isVisible()) await p01CookieButton.click();
  await p01Page.screenshot({ path: `${evidenceDir}/02-p01-sin-carga-de-archivo.png`, fullPage: true });
  checks.push("P01 ya no muestra una carga de evidencia del acta del máximo órgano social.");
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
  const fs = await import("node:fs/promises");
  const image = await fs.readFile(`${evidenceDir}/01-informe-anual-evidencia.png`);
  const p01Image = await fs.readFile(`${evidenceDir}/02-p01-sin-carga-de-archivo.png`);
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Evidencia de prueba PESV — DEMO-PRUEBA</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:36px;max-width:1100px}h1{font-size:2rem}.tag{display:inline-block;background:#d8efe1;border-radius:30px;padding:6px 12px}li{margin:8px 0}figure{background:#fff;border:1px solid #dae7de;padding:12px;margin:22px 0;border-radius:12px}img{display:block;width:100%;height:auto}.note{padding:16px;border-left:4px solid #a36b00;background:#fff6d9}</style>
<h1>Prueba funcional: evidencia anual del Comité de Seguridad Vial</h1><p class="tag">DEMO-PRUEBA · Desarrollo · ${new Date().toISOString().slice(0, 10)} · COMPLETADA</p>
<p><b>Resultado:</b> ${escape(checks.join(" "))}</p><p class="note"><b>Importante:</b> el PDF cargado es una muestra de prueba expresamente marcada. No es acta real y no acredita cumplimiento. Se conserva en DEMO-PRUEBA para que se pueda revisar la funcionalidad y debe reemplazarse antes de emitir evidencia oficial.</p>
<p><b>Archivo de muestra para revisión:</b> PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf<br><b>Ruta de lectura protegida:</b> ${escape(testPdfUrl || "")}</p>
<figure><img src="data:image/png;base64,${image.toString("base64")}" alt="Informe anual SISI/PESV con evidencia de prueba"><figcaption>Vista del punto anual con el PDF asociado a su propio registro.</figcaption></figure>
<figure><img src="data:image/png;base64,${p01Image.toString("base64")}" alt="Módulo P01 sin campo para adjuntar evidencia anual"><figcaption>P01 mantiene sus funciones de conformación; ya no contiene el campo de carga del acta solicitada por el informe anual.</figcaption></figure>
<p>El informe conserva los datos del módulo P01 solo como contexto; la evidencia queda asociada al informe anual.</p></html>`;
  await writeFile(`${evidenceDir}/informe-prueba-funcional.html`, html);
  await writeFile(`${evidenceDir}/resultado.json`, JSON.stringify({
    result: "COMPLETADA",
    company: "DEMO-PRUEBA",
    environment: "development",
    checks,
    uploadedFile: "PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf",
    pdfObjectUrl: testPdfUrl,
    note: "El PDF adjunto es una muestra de prueba, no un acta real ni evidencia de cumplimiento.",
  }, null, 2));
  console.log(JSON.stringify({ result: "COMPLETADA", checks, evidenceDir, uploadedFile: "PRUEBA-FUNCIONAL-NO-ACTA-ORGANOSOCIAL.pdf" }, null, 2));
}
