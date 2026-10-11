import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { sql } from "drizzle-orm";
import XLSX from "xlsx-js-style";

const enabled = process.env.RUN_PESV_LESSONS_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";
const marker = `PRUEBA FUNCIONAL PESV DEMO-PRUEBA ${new Date().toISOString().slice(0, 10)} ${randomBytes(4).toString("hex")}`;

test("DEMO-PRUEBA: investigación → comunicación → respuesta del trabajador → exportaciones trimestrales", { skip: !enabled }, async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "La prueba está restringida al entorno de desarrollo.");
  assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se requiere el dominio de desarrollo.");
  const [{ db }, schema, { hashPassword }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
  ]);
  const companyResult = await db.execute(sql`SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1`);
  const company = companyResult.rows[0] as { id: string; name: string } | undefined;
  assert.equal(company?.name, "DEMO-PRUEBA", "La evidencia se limita a DEMO-PRUEBA.");

  const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const adminId = randomUUID();
  const username = `pesv-lessons-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(24).toString("base64url");
  let accountCreated = false;
  let workerId: string | undefined;
  try {
    const adminLoginEmail = `${username}@example.invalid`;
    await db.insert(schema.users).values({
      id: adminId,
      username,
      password: await hashPassword(password),
      role: "admin",
      companyId,
      fullName: "Cuenta temporal de prueba funcional",
      email: adminLoginEmail,
      emailVerifiedAt: new Date(),
    });
    accountCreated = true;
    const login = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(login.status, 200, "Debe iniciar sesión la cuenta temporal de prueba.");
    let cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    assert.ok(cookie, "El login debe entregar cookies de sesión.");

    async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
      const headers = new Headers(init.headers);
      headers.set("Cookie", cookie);
      headers.set("X-Company-Id", companyId);
      if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
      const text = await response.text();
      assert.ok(response.ok, `${init.method || "GET"} ${path} devolvió ${response.status}: ${text}`);
      return text ? JSON.parse(text) as T : undefined as T;
    }

    const date = new Date();
    const today = date.toISOString().slice(0, 10);
    const due = new Date(date.getTime() + 15 * 86400000).toISOString().slice(0, 10);
    const year = Number(today.slice(0, 4));
    const quarter = Math.floor((Number(today.slice(5, 7)) - 1) / 3) + 1;
    const firstMonth = (quarter - 1) * 3;
    const from = new Date(Date.UTC(year, firstMonth, 1)).toISOString().slice(0, 10);
    const to = new Date(Date.UTC(year, firstMonth + 3, 0)).toISOString().slice(0, 10);

    const worker = await api<{ id: string }>("/api/workers", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        identificationNumber: `PF${Date.now()}${randomBytes(2).toString("hex")}`,
        name: "PRUEBA FUNCIONAL PESV",
        position: "Conductor de prueba",
        department: "Transporte",
        contractType: "indefinido",
        startDate: today,
      }),
    });
    workerId = worker.id;
    await db.update(schema.users).set({ workerId }).where(sql`id = ${adminId}`);
    const refreshedLogin = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    assert.equal(refreshedLogin.status, 200, "La sesión debe renovarse para probar la identidad asociada al trabajador.");
    cookie = refreshedLogin.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");

    const accident = await api<{ id: string }>("/api/accidents", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        workerId,
        type: "caida_mismo_nivel",
        description: `${marker} · registro de validación de flujo; no es un evento real`,
        severity: "leve",
        date: today,
        time: "09:15",
        location: "Registro de prueba en DEMO-PRUEBA",
        actionsTaken: marker,
      }),
    });

    const lesson = `Lección de prueba: verificar el área de tránsito antes de iniciar la jornada. ${marker}`;
    const investigation = await api<{ id: string }>("/api/investigations", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        accidentId: accident.id,
        eventType: "accidente_trabajo",
        eventDate: today,
        investigationStartDate: today,
        dueDate: due,
        severity: "leve",
        eventDescription: `${marker} · investigación de prueba`,
        lessonLearned: lesson,
        conclusions: `${marker} · registro para revisar el informe`,
        analysisMethodology: "5_porques",
      }),
    });

    const communication = await api<{ id: string; fechaEnvio: string }>("/api/comunicacion-sst/comunicaciones", {
      method: "POST",
      body: JSON.stringify({
        tipo: "informativo",
        asunto: `${marker} · Divulgación de lección aprendida`,
        contenido: lesson,
        publicoObjetivo: "trabajadores",
        mediosUtilizados: ["Portal de Empleados"],
        requiereConfirmacionLectura: 1,
        relacionadoCon: "pesv_leccion_aprendida",
        relacionadoId: investigation.id,
        trabajadoresDestinatarios: [workerId],
      }),
    });

    const portalMessages = await api<Array<{ id: string; relacionadoCon: string }>>("/api/comunicacion-sst/mis-comunicaciones");
    assert.ok(portalMessages.some((message) => message.id === communication.id && message.relacionadoCon === "pesv_leccion_aprendida"), "La comunicación debe aparecer en el Portal del trabajador destinatario.");

    const responseText = `Retroalimentación de prueba: la verificación previa ayuda a evitar caídas. ${marker}`;
    await api(`/api/comunicacion-sst/comunicaciones/${communication.id}/lectura`, {
      method: "POST",
      body: JSON.stringify({ comentarios: responseText }),
    });

    const period = new URLSearchParams({ from, to }).toString();
    const status = await api<{
      companyName: string;
      total: number;
      read: number;
      feedback: number;
      records: Array<{ asunto: string; leccionAprendida: string; trabajador: string; retroalimentacion: string; fechaLectura: string | null }>;
    }>(`/api/pesv/informes-trimestrales/lecciones-aprendidas/estado?${period}`);
    const record = status.records.find((item) => item.asunto.includes(marker));
    assert.equal(status.companyName, "DEMO-PRUEBA");
    assert.ok(record, "La divulgación debe aparecer en el informe del trimestre.");
    assert.match(record.leccionAprendida, new RegExp(marker));
    assert.equal(record.trabajador, "PRUEBA FUNCIONAL PESV");
    assert.match(record.retroalimentacion, new RegExp(marker));
    assert.ok(record.fechaLectura);

    const download = async (format: "pdf" | "xlsx") => {
      const response = await fetch(`${baseUrl}/api/pesv/informes-trimestrales/lecciones-aprendidas.${format}?${period}`, {
        headers: { Cookie: cookie, "X-Company-Id": companyId },
      });
      assert.equal(response.status, 200, `${format} debe descargarse correctamente.`);
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.ok(bytes.length > 100, `${format} no debe estar vacío.`);
      return bytes;
    };
    const [pdf, excel] = await Promise.all([download("pdf"), download("xlsx")]);
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.equal(pdf.subarray(-6).toString(), "%%EOF\n");
    const pdfText = execFileSync("pdftotext", ["-", "-"], { input: pdf, encoding: "utf8" }).replace(/\s+/g, " ");
    assert.match(pdfText, new RegExp(marker));
    const workbook = XLSX.read(excel, { type: "buffer" });
    const workbookText = workbook.SheetNames.map((name) => XLSX.utils.sheet_to_csv(workbook.Sheets[name])).join(" ");
    assert.match(workbookText, new RegExp(marker));

    await mkdir("attached_assets", { recursive: true });
    const stem = `DEMO-PRUEBA_informe_lecciones_aprendidas_${year}_T${quarter}_prueba_funcional`;
    await writeFile(`attached_assets/${stem}.pdf`, pdf);
    await writeFile(`attached_assets/${stem}.xlsx`, excel);
    await writeFile(`attached_assets/${stem}_evidencia.txt`, [
      "PRUEBA FUNCIONAL — DEMO-PRUEBA",
      `Marcador: ${marker}`,
      `Período: ${from} a ${to}`,
      `Investigación: ${investigation.id}`,
      `Comunicación: ${communication.id}`,
      "Resultado: comunicación visible en Portal, lectura confirmada, retroalimentación incluida; PDF y Excel descargados y validados.",
      "Los registros de prueba de trabajador, accidente, investigación, comunicación y respuesta se conservaron para revisión.",
    ].join("\n"));
    console.log(`Prueba funcional aprobada para ${company.name}, ${year} T${quarter}. Se conservaron el trabajador de prueba y sus registros vinculados. Archivos: attached_assets/${stem}.{pdf,xlsx}`);
  } finally {
    if (accountCreated) {
      await db.update(schema.users).set({
        role: "trabajador",
        workerId: null,
        emailVerifiedAt: null,
        password: await hashPassword(randomBytes(32).toString("base64url")),
      }).where(sql`id = ${adminId} AND username = ${username}`);
    }
    await db.$client.end();
  }
});
