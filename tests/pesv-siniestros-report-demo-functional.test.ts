import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { and, eq, sql } from "drizzle-orm";
import * as XLSX from "xlsx";

const enabled = process.env.RUN_PESV_SINIESTROS_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";
const testMarker = "PRUEBA FUNCIONAL INFORME PESV DEMO-PRUEBA - NO REAL";
const testPoliceReport = "PRUEBA-IPAT-NO-REAL-PESV-DEMO-001";

type TestVehicle = {
  id: string;
  plate: string;
  observations: string | null;
  brand: string;
  model: string;
};

type TestDriver = {
  id: string;
  name: string;
  identificationNumber: string;
  observations: string | null;
};

type TestActa = {
  id: string;
  numeroActa: number;
  fechaReunion: string;
  temasOrdenDia: string;
  observaciones: string | null;
};

type TestIncident = {
  id: string;
  vehicleId: string;
  driverId: string;
  policeReport: string | null;
  description: string;
  fatalities: number;
  severeInjuries: number | null;
  minorInjuries: number | null;
  simpleCollisionPeople: number | null;
  committeeActaId: string | null;
};

test(
  "DEMO-PRUEBA: estado autenticado y descargas del informe PESV",
  { skip: !enabled },
  async () => {
    assert.notEqual(process.env.NODE_ENV, "production", "No ejecutar esta prueba en producción.");
    assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se necesita el dominio de desarrollo.");

    const [{ db }, schema, { hashPassword }] = await Promise.all([
      import("../server/db"),
      import("../shared/schema"),
      import("../server/auth"),
    ]);

    const companyResult = await db.execute(sql`
      SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1
    `);
    const company = companyResult.rows[0] as { id: string; name: string } | undefined;
    assert.equal(company?.name, "DEMO-PRUEBA", "La prueba solo puede ejecutarse en la empresa DEMO-PRUEBA.");

    const accountId = randomUUID();
    const username = `pesv-report-test-${randomBytes(6).toString("hex")}`;
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
        fullName: "Prueba funcional informe PESV DEMO-PRUEBA",
        email: `${username}@example.invalid`,
        emailVerifiedAt: new Date(),
      });
      accountCreated = true;

      const login = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      assert.equal(login.status, 200, "La cuenta temporal debe iniciar sesión en desarrollo.");
      const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
      assert.ok(cookie, "El inicio de sesión debe establecer cookies.");

      async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
        const headers = new Headers(options.headers);
        headers.set("Cookie", cookie);
        headers.set("X-Company-Id", companyId);
        if (options.body && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
        const text = await response.text();
        assert.ok(response.ok, `${options.method || "GET"} ${path} respondió ${response.status}: ${text}`);
        return text ? JSON.parse(text) as T : undefined as T;
      }

      const vehicles = await apiJson<TestVehicle[]>("/api/vehicles");
      let testVehicle = vehicles.find(
        (vehicle) => vehicle.observations?.includes(testMarker),
      );
      if (!testVehicle) {
        const occupiedPlates = new Set(vehicles.map((vehicle) => vehicle.plate));
        const plate = Array.from({ length: 99 }, (_, index) => `TST${String(index + 1).padStart(3, "0")}`)
          .find((candidate) => !occupiedPlates.has(candidate));
        assert.ok(plate, "No se encontró una placa de prueba disponible.");
        testVehicle = await apiJson<TestVehicle>("/api/vehicles", {
          method: "POST",
          body: JSON.stringify({
            plate,
            brand: "PRUEBA FUNCIONAL",
            model: "VEHÍCULO VIAL DE PRUEBA - NO REAL",
            year: 2026,
            type: "camioneta",
            ownership: "propio",
            status: "activo",
            observations: testMarker,
          }),
        });
      }

      const drivers = await apiJson<TestDriver[]>("/api/drivers");
      let testDriver = drivers.find((driver) => driver.observations?.includes(testMarker));
      if (!testDriver) {
        const suffix = randomBytes(5).toString("hex").toUpperCase();
        testDriver = await apiJson<TestDriver>("/api/drivers", {
          method: "POST",
          body: JSON.stringify({
            name: "CONDUCTOR DE PRUEBA - NO REAL",
            identificationNumber: `PRUEBA-PESV-${suffix}`,
            licenseNumber: `PRUEBA-LIC-PESV-${suffix}`,
            licenseType: "B1",
            licenseExpiry: "2030-12-31",
            status: "activo",
            observations: testMarker,
          }),
        });
      }

      const actas = await apiJson<TestActa[]>("/api/pesv/comite/actas");
      let testActa = actas.find((acta) => acta.observaciones?.includes(testMarker));
      if (!testActa) {
        const numeroActa = Math.max(0, ...actas.map((acta) => acta.numeroActa)) + 1;
        testActa = await apiJson<TestActa>("/api/pesv/comite/actas", {
          method: "POST",
          body: JSON.stringify({
            numeroActa,
            fechaReunion: new Date().toISOString().slice(0, 10),
            horaInicio: "09:00",
            horaFin: "09:15",
            lugar: "DEMO-PRUEBA - escenario ficticio",
            modalidad: "virtual",
            temasOrdenDia: `${testMarker}: validación del informe; no corresponde a una reunión real.`,
            desarrolloReunion: `${testMarker}: revisión simulada de un registro siniestro.`,
            compromisos: "Ninguno real; registro creado únicamente para comprobar el informe.",
            asistentesIds: [],
            estado: "borrador",
            observaciones: testMarker,
          }),
        });
      }

      const assignments = await apiJson<Array<{ driverId: string; isActive: number }>>(
        `/api/vehicles/${testVehicle.id}/driver-assignments`,
      );
      if (!assignments.some((assignment) => assignment.driverId === testDriver.id && assignment.isActive === 1)) {
        await apiJson(`/api/drivers/${testDriver.id}/vehicle-assignments`, {
          method: "POST",
          body: JSON.stringify({
            vehicleId: testVehicle.id,
            startDate: new Date().toISOString().slice(0, 10),
            observations: testMarker,
          }),
        });
      }

      const incidents = await apiJson<TestIncident[]>("/api/road-incidents");
      let testIncident = incidents.find((incident) => incident.policeReport === testPoliceReport);
      if (!testIncident) {
        testIncident = await apiJson<TestIncident>("/api/road-incidents", {
          method: "POST",
          body: JSON.stringify({
            vehicleId: testVehicle.id,
            driverId: testDriver.id,
            incidentDate: new Date().toISOString().slice(0, 10),
            incidentTime: "09:05",
            location: "Vía ficticia de prueba - DEMO-PRUEBA",
            type: "colision",
            severity: "solo-danos",
            description: `${testMarker}. Evento ficticio, no ocurrió en la realidad.`,
            weatherConditions: "No aplica - simulación",
            roadConditions: "No aplica - simulación",
            witnesses: "",
            authoritiesNotified: 0,
            policeReport: testPoliceReport,
            injuries: 0,
            fatalities: 0,
            severeInjuries: 0,
            minorInjuries: 0,
            simpleCollisionPeople: 2,
            ipatAuthorityName: "Autoridad de tránsito de prueba - NO REAL",
            committeeActaId: testActa.id,
            estimatedCost: 0,
            rootCause: "Escenario ficticio para probar el informe.",
            correctiveActions: "No aplica - prueba funcional.",
            preventiveActions: "No aplica - prueba funcional.",
          }),
        });
      }

      assert.ok(testIncident.description.includes(testMarker));
      assert.equal(testIncident.vehicleId, testVehicle.id);
      assert.equal(testIncident.driverId, testDriver.id);
      assert.equal(testIncident.committeeActaId, testActa.id);
      assert.equal(testIncident.fatalities, 0);
      assert.equal(testIncident.severeInjuries, 0);
      assert.equal(testIncident.minorInjuries, 0);
      assert.equal(testIncident.simpleCollisionPeople, 2);

      const formats = [
        {
          name: "Excel",
          path: "/api/pesv/informes/siniestros.xlsx",
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          signature: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        },
        {
          name: "PDF",
          path: "/api/pesv/informes/siniestros.pdf",
          contentType: "application/pdf",
          signature: Buffer.from("%PDF-"),
        },
      ] as const;

      const statusResponse = await apiJson<{
        companyName: string;
        total: number;
        ready: number;
        incomplete: Array<{ id: string; missingFields: string[] }>;
      }>("/api/pesv/informes/siniestros/estado");
      assert.equal(statusResponse.companyName, "DEMO-PRUEBA");
      assert.ok(statusResponse.total > 0, "La prueba debe encontrar siniestros en DEMO-PRUEBA.");
      assert.ok(statusResponse.ready > 0, "El caso marcado como prueba debe quedar completo.");
      assert.ok(!statusResponse.incomplete.some((record) => record.id === testIncident.id));
      const pendingFieldNames = [...new Set(statusResponse.incomplete.flatMap((record) => record.missingFields))];

      const outcomes: string[] = [];
      for (const format of formats) {
        const response = await fetch(`${baseUrl}${format.path}`, {
          headers: { Cookie: cookie, "X-Company-Id": companyId },
        });
        if (statusResponse.incomplete.length > 0) {
          assert.equal(response.status, 409, `${format.name} debe bloquearse mientras falten datos.`);
          const body = await response.json() as {
            message?: string;
            incomplete?: Array<{ id: string; missingFields: string[] }>;
          };
          assert.match(body.message || "", /Completa los datos/i);
          assert.equal(body.incomplete?.length, statusResponse.incomplete.length);
          outcomes.push(`${format.name}: bloqueado por ${body.incomplete.length} registros incompletos`);
        } else {
          assert.equal(response.status, 200, `${format.name}: ${await response.clone().text()}`);
          assert.match(response.headers.get("Content-Type") || "", new RegExp(format.contentType));
          const content = Buffer.from(await response.arrayBuffer());
          assert.deepEqual(content.subarray(0, format.signature.length), format.signature);
          if (format.name === "Excel") {
            const workbook = XLSX.read(content, { type: "buffer" });
            const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
              workbook.Sheets["Siniestros PESV"],
              { header: 1 },
            );
            assert.ok(rows.some((row) => row.includes(testPoliceReport)));
            assert.ok(rows.some((row) => row.includes(testVehicle!.plate)));
            assert.ok(rows.some((row) => row.includes(testDriver!.name)));
          } else {
            const text = execFileSync("pdftotext", ["-", "-"], {
              input: content,
              encoding: "utf8",
            }).replace(/\s+/g, " ");
            assert.ok(text.includes(testPoliceReport));
            assert.ok(text.includes(testVehicle.plate));
            assert.ok(text.includes(testDriver.name));
          }
          outcomes.push(`${format.name}: descargado`);
        }
      }

      console.log(
        `DEMO-PRUEBA: caso retenido=${testPoliceReport}, placa=${testVehicle.plate}, acta=${testActa.numeroActa}; siniestros=${statusResponse.total}, completos=${statusResponse.ready}, pendientes=${statusResponse.incomplete.length}, campos pendientes=${pendingFieldNames.join(" | ") || "ninguno"}; ${outcomes.join("; ")}`,
      );
    } finally {
      try {
        if (accountCreated) {
          await db.delete(schema.users).where(
            and(eq(schema.users.id, accountId), eq(schema.users.username, username)),
          );
        }
      } finally {
        await db.$client.end();
      }
    }
  },
);
