import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { and, eq } from "drizzle-orm";
import { db } from "../server/db";
import { storage } from "../server/storage";
import { companies, internalMessages, trainingAttendees, trainings, users, workers } from "../shared/schema";

if (process.env.NODE_ENV !== "development" || process.env.RUN_DEMO_TRAINING_TEST !== "1") {
  throw new Error("Esta prueba solo se ejecuta en desarrollo con RUN_DEMO_TRAINING_TEST=1");
}

const companyRows = await db.select({ id: companies.id, name: companies.name })
  .from(companies).where(eq(companies.name, "DEMO-PRUEBA"));
if (companyRows.length !== 1 || companyRows[0].id !== "demo-company-001") {
  throw new Error("No se encontró la empresa de prueba esperada");
}
const company = companyRows[0];
const demoWorkers = await db.select().from(workers).where(eq(workers.companyId, company.id));
const demoUsers = await db.select({ workerId: users.workerId }).from(users)
  .where(eq(users.companyId, company.id));
const linkedIds = new Set(demoUsers.map((user) => user.workerId));
const worker = demoWorkers.find((candidate) =>
  candidate.status === "activo" && !candidate.retirementDate && !linkedIds.has(candidate.id)
);
if (!worker) throw new Error("No hay un trabajador activo sin cuenta para probar el portal");

const suffix = randomUUID().slice(0, 8);
const resumeId = process.env.RESUME_TRAINING_ID;
const resumedRows = resumeId
  ? await db.select().from(trainings).where(eq(trainings.id, resumeId))
  : [];
if (resumeId && (resumedRows.length !== 1 || resumedRows[0].companyId !== company.id ||
  !resumedRows[0].title.startsWith("PRUEBA FUNCIONAL - Invitación al Portal de Empleados - "))) {
  throw new Error("La capacitación a retomar no pertenece a la prueba DEMO-PRUEBA");
}
const title = resumedRows[0]?.title ?? `PRUEBA FUNCIONAL - Invitación al Portal de Empleados - ${suffix}`;
const outputDir = "evidencia/capacitacion-demo-2026-09-29";
await mkdir(outputDir, { recursive: true });
const baseURL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : "http://127.0.0.1:5000";
const browser = await chromium.launch({
  executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
  args: ["--no-sandbox"],
  headless: true,
});
const adminContext = await browser.newContext({
  baseURL, ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 },
});
const workerContext = await browser.newContext({
  baseURL, ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 },
});
const summary: Record<string, unknown> = {
  company: company.name,
  environment: "desarrollo",
  trainingTitle: title,
  trainingDate: "2026-10-06",
  stages: {},
  screenshots: [] as string[],
};
const stages = summary.stages as Record<string, unknown>;
const screenshots = summary.screenshots as string[];
if (resumeId) {
  const previous = JSON.parse(await readFile(`${outputDir}/resultado.json`, "utf8"));
  Object.assign(stages, previous.stages);
  screenshots.push("01-administrador-agregar.png");
  summary.resumed = true;
}
const tempUserIds: string[] = [];
let failed: Error | null = null;

function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${scryptSync(password, salt, 64).toString("hex")}.${salt}`;
}

async function assertResponse(response: { ok(): boolean; status(): number; text(): Promise<string> }, label: string) {
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`${label}: HTTP ${response.status()} ${body.slice(0, 300)}`);
  }
}

async function capture(page: import("playwright").Page, filename: string) {
  await page.screenshot({ path: `${outputDir}/${filename}`, animations: "disabled" });
  screenshots.push(filename);
}

try {
  const adminPassword = randomBytes(32).toString("hex");
  const workerPassword = randomBytes(32).toString("hex");
  const adminUsername = `qa-demo-cap-admin-${suffix}`;
  const workerUsername = `qa-demo-cap-worker-${suffix}`;
  const [adminUser] = await db.insert(users).values({
    username: adminUsername,
    password: passwordHash(adminPassword),
    role: "admin",
    fullName: "Prueba Funcional SST",
    companyId: company.id,
    emailVerifiedAt: new Date(),
  }).returning({ id: users.id });
  tempUserIds.push(adminUser.id);
  const [workerUser] = await db.insert(users).values({
    username: workerUsername,
    password: passwordHash(workerPassword),
    role: "trabajador",
    fullName: "Cuenta temporal de prueba del portal",
    companyId: company.id,
    workerId: worker.id,
    emailVerifiedAt: new Date(),
  }).returning({ id: users.id });
  tempUserIds.push(workerUser.id);

  await assertResponse(await adminContext.request.post("/api/login", {
    data: { username: adminUsername, password: adminPassword },
  }), "Acceso administrativo");
  await assertResponse(await workerContext.request.post("/api/login", {
    data: { username: workerUsername, password: workerPassword },
  }), "Acceso del trabajador");
  stages.authentication = "Dos cuentas temporales iniciaron sesión, una como administrador y otra como trabajador.";

  let training: { id: string };
  if (resumeId) {
    training = { id: resumeId };
  } else {
    const before = await workerContext.request.get("/api/portal/mis-capacitaciones");
    await assertResponse(before, "Portal antes de la invitación");
    if ((await before.json()).some((cap: { tituloCurso: string }) => cap.tituloCurso === title)) {
      throw new Error("La capacitación ya aparecía en el portal antes de asignarla");
    }
    stages.before = "La capacitación no figuraba en el portal antes de asignar al trabajador.";
    const createResponse = await adminContext.request.post("/api/trainings", {
      data: {
        companyId: company.id,
        title,
        description: "Registro de prueba funcional de invitación y confirmación en el Portal de Empleados.",
        instructor: "Equipo de prueba SST",
        date: "2026-10-06",
        startTime: "10:00",
        endTime: "11:00",
        location: "Sesión de prueba",
        totalWorkers: 1,
        status: "programada",
        contentType: "presencial",
      },
    });
    await assertResponse(createResponse, "Crear capacitación");
    training = await createResponse.json() as { id: string };
  }
  summary.trainingId = training.id;
  stages.created = "Capacitación programada creada en DEMO-PRUEBA.";

  const adminPage = await adminContext.newPage();
  await adminPage.goto("/capacitaciones", { waitUntil: "domcontentloaded" });
  await adminPage.getByTestId("input-search-trainings").waitFor({ timeout: 60000 });
  await adminPage.getByTestId("input-search-trainings").fill(title);
  const trainingCard = adminPage.getByTestId(`card-training-${training.id}`);
  await trainingCard.waitFor({ timeout: 60000 });
  await trainingCard.getByTestId(`button-manage-attendees-${training.id}`).click();
  if (!resumeId) {
    await adminPage.getByTestId("select-worker-attendee").click();
    await adminPage.getByRole("option").filter({ hasText: worker.identificationNumber }).click();
    await adminPage.getByTestId("button-add-attendee").click();
    await adminPage.getByText("Trabajador agregado", { exact: true }).waitFor({ timeout: 30000 });
    await adminPage.getByText("Trabajadores Inscritos (1)").waitFor({ timeout: 30000 });
    stages.adminConfirmation = "La interfaz mostró «Trabajador agregado» y «Trabajadores Inscritos (1)» al pulsar Agregar.";
    await adminPage.locator('[data-testid^="text-attendee-name-"], [data-testid^="text-attendee-document-"]')
      .evaluateAll((elements) => elements.forEach((element) => (element as HTMLElement).style.filter = "blur(9px)"));
    await capture(adminPage, "01-administrador-agregar.png");
  } else {
    await adminPage.getByText("Trabajadores Inscritos (1)").waitFor({ timeout: 30000 });
  }

  const attendeesResponse = await adminContext.request.get(`/api/trainings/${training.id}/attendees`);
  await assertResponse(attendeesResponse, "Consultar asistentes");
  const attendees = await attendeesResponse.json() as Array<{ id: string; workerId: string; confirmed: number }>;
  const attendee = attendees.find((item) => item.workerId === worker.id);
  if (!attendee || attendees.length !== 1) throw new Error("La inscripción no quedó registrada correctamente");
  summary.attendeeId = attendee.id;
  stages.enrollment = "La API guardó exactamente un asistente en la capacitación.";

  if (!resumeId) {
    const invitations = await db.select({
      id: internalMessages.id,
      receiverId: internalMessages.receiverId,
      subject: internalMessages.subject,
      status: internalMessages.status,
    }).from(internalMessages).where(and(
      eq(internalMessages.relatedEntity, "training"),
      eq(internalMessages.relatedEntityId, training.id),
      eq(internalMessages.receiverId, workerUser.id),
    ));
    if (invitations.length !== 1) throw new Error("No se creó el aviso interno al trabajador");
    stages.internalNotice = "Se creó un aviso interno no leído para la cuenta de trabajador vinculada (no equivale a acuse de entrega externo).";
    summary.noticeId = invitations[0].id;
  } else {
    stages.internalNotice = "El aviso interno se verificó durante el primer intento; se retiró junto con las cuentas técnicas de esa sesión.";
  }

  await adminPage.getByTestId("button-close-attendees-dialog").click();
  const countText = (await trainingCard.innerText()).match(/\d+\/\d+ asistentes/)?.[0] ?? "sin contador";
  stages.onClose = `Cerrar solo cerró la ventana; no apareció confirmación adicional de envío. El contador de la tarjeta mostraba «${countText}» al tomar la captura, aunque la ventana y la API registraban un inscrito.`;
  await capture(adminPage, "02-administrador-tarjeta-cerrada.png");

  const portalResponse = await workerContext.request.get("/api/portal/mis-capacitaciones");
  await assertResponse(portalResponse, "Consultar capacitaciones del portal");
  const portalTrainings = await portalResponse.json() as Array<{
    id: string; asistenciaId: string; tituloCurso: string; estado: string; source: string
  }>;
  const portalTraining = portalTrainings.find((item) => item.id === training.id);
  if (!portalTraining || portalTraining.estado !== "invitado" || portalTraining.asistenciaId !== attendee.id) {
    throw new Error("La invitación no aparece en el portal del trabajador con estado Invitado");
  }
  stages.portalArrival = "La API del trabajador recibió la misma capacitación en estado «invitado».";

  const workerPage = await workerContext.newPage();
  await workerPage.goto("/portal-empleados?section=capacitaciones", { waitUntil: "domcontentloaded" });
  const portalCard = workerPage.getByTestId(`card-capacitacion-${attendee.id}`);
  await portalCard.waitFor({ timeout: 60000 });
  await portalCard.getByTestId(`badge-estado-${attendee.id}`).getByText("Invitado").waitFor();
  await portalCard.scrollIntoViewIfNeeded();
  stages.portalView = "El portal renderizó la capacitación y la etiqueta «Invitado» para el trabajador.";
  await capture(workerPage, "03-portal-trabajador-invitado.png");

  await portalCard.getByTestId(`button-confirmar-header-${attendee.id}`).click();
  await portalCard.getByTestId(`badge-estado-${attendee.id}`).getByText("Confirmado").waitFor({ timeout: 30000 });
  await portalCard.scrollIntoViewIfNeeded();
  stages.workerConfirmation = "El trabajador pulsó Confirmar; el portal mostró «Confirmado» y el mensaje de asistencia confirmada.";
  await capture(workerPage, "04-portal-trabajador-confirmado.png");

  const [confirmed] = await db.select({ confirmed: trainingAttendees.confirmed })
    .from(trainingAttendees).where(eq(trainingAttendees.id, attendee.id));
  if (confirmed?.confirmed !== 1) throw new Error("El estado de confirmación no se guardó");
  await adminPage.reload({ waitUntil: "domcontentloaded" });
  await adminPage.getByTestId("input-search-trainings").fill(title);
  await adminPage.getByTestId(`button-manage-attendees-${training.id}`).click();
  await adminPage.getByTestId(`text-attendee-confirmed-${attendee.id}`).getByText("Sí").waitFor({ timeout: 30000 });
  await adminPage.locator('[data-testid^="text-attendee-name-"], [data-testid^="text-attendee-document-"]')
    .evaluateAll((elements) => elements.forEach((element) => (element as HTMLElement).style.filter = "blur(9px)"));
  stages.adminConfirmed = "Al volver a abrir asistentes, el administrador vio «Sí» en la columna Confirmó.";
  await capture(adminPage, "05-administrador-confirmado.png");
} catch (error) {
  failed = error instanceof Error ? error : new Error(String(error));
  summary.error = failed.message;
  console.error("Prueba incompleta:", failed.message);
} finally {
  await adminContext.close();
  await workerContext.close();
  await browser.close();
  for (const id of tempUserIds.reverse()) {
    try {
      await storage.deleteUser(id);
    } catch (error) {
      summary.cleanupError = `No se pudo retirar una cuenta temporal: ${String(error)}`;
      console.error(summary.cleanupError);
    }
  }
  summary.technicalAccountsRemoved = !summary.cleanupError;
  summary.result = failed ? "INCOMPLETA" : "COMPLETADA";
  const imageHtml = (await Promise.all(screenshots.map(async (name, index) => {
    const image = await readFile(`${outputDir}/${name}`);
    return `<figure><img src="data:image/png;base64,${image.toString("base64")}" alt="Paso ${index + 1}: ${name}"><figcaption>${name}</figcaption></figure>`;
  }))).join("\n");
  const escape = (value: unknown) => String(value).replace(/[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
  const checks = Object.entries(stages).map(([key, value]) =>
    `<li><strong>${escape(key)}</strong>: ${escape(value)}</li>`).join("");
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Evidencia de capacitación DEMO-PRUEBA</title>
<style>body{font:16px/1.55 system-ui,sans-serif;color:#183127;background:#f4f8f5;margin:0 auto;padding:36px;max-width:1180px}h1{font-size:2rem}h2{margin-top:34px}.tag{display:inline-block;background:#d8efe1;border-radius:30px;padding:6px 12px}li{margin:8px 0}figure{background:#fff;border:1px solid #dae7de;padding:12px;margin:22px 0;border-radius:12px}img{display:block;width:100%;height:auto}figcaption{padding:8px;color:#52685d}.note{padding:16px;border-left:4px solid #1b7650;background:#e7f5eb}</style>
<h1>Prueba funcional: invitación a capacitación</h1><p class="tag">DEMO-PRUEBA · Desarrollo · 29/09/2026 · ${escape(summary.result)}</p>
<p><b>Capacitación:</b> ${escape(title)}<br><b>ID:</b> ${escape(summary.trainingId ?? "no creada")}<br><b>Fecha programada:</b> 06/10/2026</p>
<h2>Comprobaciones</h2><ol>${checks}</ol>
${failed ? `<p class="note">Prueba incompleta: ${escape(failed.message)}</p>` : ""}
<p class="note"><b>Alcance de «enviado»:</b> la pantalla confirma inscripción, no entrega de correo, push ni lectura del aviso. Se comprobó un aviso interno creado y la recepción de la capacitación en una sesión real del Portal de Empleados. Cerrar la tarjeta no genera otro comprobante.</p>
<p>La capacitación y la inscripción permanecen en DEMO-PRUEBA para revisión. Se retiraron las cuentas técnicas temporales tras tomar las capturas; por ello, sus avisos asociados pueden dejar de existir. Los datos personales en las capturas del administrador están difuminados.</p>
<h2>Capturas del flujo</h2>${imageHtml}</html>`;
  await writeFile(`${outputDir}/informe.html`, html);
  await writeFile(`${outputDir}/resultado.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ result: summary.result, trainingId: summary.trainingId, stages: Object.keys(stages),
    screenshots, technicalAccountsRemoved: summary.technicalAccountsRemoved, error: summary.error ?? null }, null, 2));
}
if (failed) process.exitCode = 1;
process.exit();