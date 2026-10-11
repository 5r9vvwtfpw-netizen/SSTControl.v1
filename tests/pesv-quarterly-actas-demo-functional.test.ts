import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { sql } from "drizzle-orm";
import * as XLSX from "xlsx";

const enabled = process.env.RUN_PESV_QUARTERLY_ACTAS_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";
const marker = "PRUEBA FUNCIONAL INFORME TRIMESTRAL PESV DEMO-PRUEBA - NO CORRESPONDE A REUNIÓN REAL";

type Acta = { id: string; numeroActa: number; fechaReunion: string; observaciones: string | null };
type Meeting = { id: string; fechaProgramada: string; actaId: string | null; observaciones: string | null };

function quarterPeriod(year: number, quarter: number) {
  const month = (quarter - 1) * 3;
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return {
    from: iso(new Date(Date.UTC(year, month, 1))),
    to: iso(new Date(Date.UTC(year, month + 3, 0))),
  };
}

test(
  "DEMO-PRUEBA: una descarga PDF trimestral consolida actas vinculadas al cronograma",
  { skip: !enabled },
  async () => {
    assert.notEqual(process.env.NODE_ENV, "production", "La prueba no se ejecuta en producción.");
    assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se requiere el dominio de desarrollo.");
    const [{ db }, schema, { hashPassword }] = await Promise.all([
      import("../server/db"),
      import("../shared/schema"),
      import("../server/auth"),
    ]);
    const companyResult = await db.execute(sql`SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1`);
    const company = companyResult.rows[0] as { id: string; name: string } | undefined;
    assert.equal(company?.name, "DEMO-PRUEBA", "La prueba está limitada a DEMO-PRUEBA.");

    const accountId = randomUUID();
    const username = `pesv-quarterly-test-${randomBytes(6).toString("hex")}`;
    const password = randomBytes(32).toString("base64url");
    const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    let accountCreated = false;
    try {
      await db.insert(schema.users).values({
        id: accountId,
        username,
        password: await hashPassword(password),
        role: "admin",
        companyId,
        fullName: "Prueba funcional informe trimestral PESV DEMO-PRUEBA",
        email: `${username}@example.invalid`,
        emailVerifiedAt: new Date(),
      });
      accountCreated = true;
      const login = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      assert.equal(login.status, 200, "La cuenta técnica de prueba debe autenticarse.");
      const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
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

      const actas = await api<Acta[]>("/api/pesv/comite/actas");
      let testActa = actas.find((acta) => acta.observaciones?.includes(marker));
      let testMeeting: Meeting | undefined;
      let period: ReturnType<typeof quarterPeriod> | undefined;
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year <= currentYear + 6 && !period; year += 1) {
        const meetings = await api<Meeting[]>(`/api/pesv/comite/cronograma?anio=${year}`);
        for (let quarter = 1; quarter <= 4; quarter += 1) {
          const candidate = quarterPeriod(year, quarter);
          const existing = meetings.filter((meeting) =>
            meeting.fechaProgramada >= candidate.from && meeting.fechaProgramada <= candidate.to,
          );
          const marked = existing.find((meeting) => meeting.observaciones?.includes(marker));
          if (marked) {
            testMeeting = marked;
            period = candidate;
            if (!testActa && marked.actaId) testActa = actas.find((acta) => acta.id === marked.actaId);
            break;
          }
          if (existing.length === 0) {
            period = candidate;
            break;
          }
        }
      }
      assert.ok(period, "No se encontró un trimestre vacío o una reunión anterior marcada para la prueba.");

      if (!testActa) {
        const number = Math.max(0, ...actas.map((acta) => acta.numeroActa)) + 1;
        const actualDate = new Date(`${period.from}T12:00:00Z`);
        actualDate.setUTCDate(actualDate.getUTCDate() + 3);
        testActa = await api<Acta>("/api/pesv/comite/actas", {
          method: "POST",
          body: JSON.stringify({
            numeroActa: number,
            fechaReunion: actualDate.toISOString().slice(0, 10),
            horaInicio: "09:00",
            horaFin: "09:30",
            lugar: "DEMO-PRUEBA · escenario de validación",
            modalidad: "virtual",
            temasOrdenDia: `${marker}: revisión de la trazabilidad del informe trimestral.`,
            desarrolloReunion: `${marker}: análisis interno de siniestros viales consignado para la prueba.`,
            compromisos: `${marker}: verificar la inclusión de compromisos en PDF y Excel.`,
            asistentesIds: [],
            estado: "aprobada",
            observaciones: marker,
          }),
        });
      }

      if (!testMeeting) {
        const scheduledDate = new Date(`${period.from}T12:00:00Z`);
        scheduledDate.setUTCDate(scheduledDate.getUTCDate() + 10);
        testMeeting = await api<Meeting>("/api/pesv/comite/cronograma", {
          method: "POST",
          body: JSON.stringify({
            anio: Number(period.from.slice(0, 4)),
            frecuencia: "trimestral",
            fechaProgramada: scheduledDate.toISOString().slice(0, 10),
            temaPrincipal: marker,
            estado: "programada",
            observaciones: marker,
          }),
        });
      }
      const scheduledDate = testMeeting.fechaProgramada;
      await api(`/api/pesv/comite/cronograma/${testMeeting.id}`, {
        method: "PATCH",
        body: JSON.stringify({ estado: "realizada", actaId: testActa.id, observaciones: marker }),
      });

      const query = new URLSearchParams(period).toString();
      const status = await api<{
        companyName: string;
        total: number;
        ready: number;
        incomplete: Array<{ meetingId: string; missing: string[] }>;
        records: Array<{ meetingId: string; scheduledDate: string; numeroActa: number; desarrolloReunion: string }>;
      }>(`/api/pesv/informes-trimestrales/actas-siniestros/estado?${query}`);
      assert.equal(status.companyName, "DEMO-PRUEBA");
      assert.equal(status.total, 1, "El período de prueba debe incluir solo la reunión que se acaba de crear.");
      assert.equal(status.ready, 1);
      assert.deepEqual(status.incomplete, []);
      assert.equal(status.records[0].meetingId, testMeeting.id);
      assert.equal(status.records[0].scheduledDate, scheduledDate);
      assert.equal(status.records[0].numeroActa, testActa.numeroActa);
      assert.match(status.records[0].desarrolloReunion, new RegExp(marker));

      const formats = [
        { ext: "xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", signature: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
        { ext: "pdf", type: "application/pdf", signature: Buffer.from("%PDF-") },
      ] as const;
      await mkdir("attached_assets", { recursive: true });
      for (const format of formats) {
        const response = await fetch(`${baseUrl}/api/pesv/informes-trimestrales/actas-siniestros.${format.ext}?${query}`, {
          headers: { Cookie: cookie, "X-Company-Id": companyId },
        });
        assert.equal(response.status, 200, `${format.ext}: ${await response.clone().text()}`);
        assert.match(response.headers.get("Content-Type") || "", new RegExp(format.type));
        assert.match(response.headers.get("Content-Disposition") || "", new RegExp(`\\.${format.ext}`));
        const content = Buffer.from(await response.arrayBuffer());
        assert.deepEqual(content.subarray(0, format.signature.length), format.signature);
        const filename = `attached_assets/DEMO-PRUEBA_informe_trimestral_actas_PESV_prueba_${period.from.slice(0, 4)}_T${Math.floor((Number(period.from.slice(5, 7)) - 1) / 3) + 1}.${format.ext}`;
        await writeFile(filename, content);
        if (format.ext === "xlsx") {
          const workbook = XLSX.read(content, { type: "buffer" });
          const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
          const allCells = rows.flat().join(" ");
          assert.match(allCells, new RegExp(marker));
          assert.ok(rows.some((row) => row.includes(testActa!.numeroActa)));
        } else {
          const text = execFileSync("pdftotext", ["-", "-"], { input: content, encoding: "utf8" });
          assert.match(text, new RegExp(marker));
          assert.match(text, /COPIA DEL ACTA DE INVESTIGACIÓN INTERNA/i);
          assert.ok(text.includes(String(testActa.numeroActa)));
          assert.ok(text.includes(scheduledDate.split("-").reverse().join("/")));
        }
      }
      console.log(`DEMO-PRUEBA: acta ${testActa.numeroActa} y reunión ${scheduledDate} conservadas; el PDF único y el Excel del trimestre descargaron y contienen el marcador de prueba.`);
    } finally {
      if (accountCreated) {
        await db.delete(schema.users).where(sql`id = ${accountId} AND username = ${username}`);
      }
      await db.$client.end();
    }
  },
);
