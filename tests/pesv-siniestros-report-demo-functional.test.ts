import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
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
  incidentDate: string;
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
      const { SINIESTROS_REPORT_HEADERS } = await import("../server/reports/pesv-siniestros-report");

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

      const allCompanyStatus = await apiJson<{
        companyName: string;
        total: number;
        ready: number;
        incomplete: Array<{ id: string; missingFields: string[] }>;
      }>("/api/pesv/informes/siniestros/estado");
      assert.equal(allCompanyStatus.companyName, "DEMO-PRUEBA");
      assert.equal(allCompanyStatus.total, 5, "Deben estar los cuatro registros previos y el siniestro funcional.");
      assert.equal(allCompanyStatus.ready, 1, "El caso funcional debe estar completo.");
      assert.ok(!allCompanyStatus.incomplete.some((record) => record.id === testIncident.id));
      const pendingFieldNames = [...new Set(allCompanyStatus.incomplete.flatMap((record) => record.missingFields))];
      const incompleteActaRecord = allCompanyStatus.incomplete.find((record) =>
        record.missingFields.includes("Acta y fecha del comité que analizó el siniestro"),
      );
      assert.ok(incompleteActaRecord, "Debe existir un registro pendiente de vínculo con el acta del comité.");

      const outcomes: string[] = [];
      for (const format of formats) {
        const response = await fetch(`${baseUrl}${format.path}`, {
          headers: { Cookie: cookie, "X-Company-Id": companyId },
        });
        if (allCompanyStatus.incomplete.length > 0) {
          assert.equal(response.status, 409, `${format.name} debe bloquearse mientras falten datos.`);
          const body = await response.json() as {
            message?: string;
            incomplete?: Array<{ id: string; missingFields: string[] }>;
          };
          assert.match(body.message || "", /Completa los datos/i);
          assert.equal(body.incomplete?.length, allCompanyStatus.incomplete.length);
          outcomes.push(`${format.name}: bloqueado por ${body.incomplete.length} registros incompletos`);
        }
      }

      for (const invalidQuery of [
        "from=2026-02-31&to=2026-10-09",
        "from=2026-10-10&to=2026-10-09",
      ]) {
        const invalidResponse = await fetch(
          `${baseUrl}/api/pesv/informes/siniestros/estado?${invalidQuery}`,
          { headers: { Cookie: cookie, "X-Company-Id": companyId } },
        );
        assert.equal(invalidResponse.status, 400, `Debe rechazar período inválido: ${invalidQuery}`);
      }

      const periodQuery = new URLSearchParams({
        from: testIncident.incidentDate,
        to: testIncident.incidentDate,
      }).toString();
      const periodStatus = await apiJson<{
        total: number;
        ready: number;
        incomplete: Array<{ id: string; missingFields: string[] }>;
        period: { from?: string; to?: string };
      }>(`/api/pesv/informes/siniestros/estado?${periodQuery}`);
      assert.equal(periodStatus.total, 1, "El período de prueba debe incluir el siniestro funcional.");
      assert.equal(periodStatus.ready, 1);
      assert.equal(periodStatus.incomplete.length, 0);
      assert.equal(periodStatus.period.from, testIncident.incidentDate);
      assert.equal(periodStatus.period.to, testIncident.incidentDate);

      for (const format of formats) {
        const response = await fetch(`${baseUrl}${format.path}?${periodQuery}`, {
          headers: { Cookie: cookie, "X-Company-Id": companyId },
        });
        assert.equal(response.status, 200, `${format.name}: ${await response.clone().text()}`);
        assert.match(response.headers.get("Content-Type") || "", new RegExp(format.contentType));
        assert.match(
          response.headers.get("Content-Disposition") || "",
          /desde_2026-10-09_hasta_2026-10-09/i,
        );
        const content = Buffer.from(await response.arrayBuffer());
        assert.deepEqual(content.subarray(0, format.signature.length), format.signature);
        if (format.name === "Excel") {
          const workbook = XLSX.read(content, { type: "buffer" });
          const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
            workbook.Sheets["Siniestros PESV"],
            { header: 1 },
          );
          assert.deepEqual(rows[4], SINIESTROS_REPORT_HEADERS);
          assert.ok(
            String(rows[2]?.[0]).includes("Período consultado: 09/10/2026 al 09/10/2026"),
            "El Excel debe indicar claramente el período incluido.",
          );
          assert.equal(rows[5][0], "09/10/2026");
          assert.equal(rows[5][1], "Choque simple: 2");
          assert.equal(rows[5][2], 0);
          assert.equal(rows[5][3], 0);
          assert.equal(rows[5][4], 0);
          assert.equal(rows[5][5], 2);
          assert.equal(rows[5][6], testVehicle.plate);
          assert.equal(rows[5][7], testDriver.name);
          assert.equal(rows[5][8], testDriver.identificationNumber);
          assert.equal(rows[5][9], testPoliceReport);
          assert.equal(rows[5][10], "Autoridad de tránsito de prueba - NO REAL");
          assert.equal(rows[5][11], testActa.numeroActa);
          assert.equal(rows[5][12], "09/10/2026");
          await writeFile("attached_assets/DEMO-PRUEBA_prueba_funcional_informe_siniestros_2026-10-09.xlsx", content);
        } else {
          const text = execFileSync("pdftotext", ["-", "-"], {
            input: content,
            encoding: "utf8",
          }).toUpperCase();
          const compact = (value: string) => value.toUpperCase().replace(/[\s-]+/g, "");
          const compactText = compact(text);
          const expectedPdfValues = [
            "DEMO-PRUEBA",
            "09/10/2026",
            "Choque simple: 2",
            testVehicle.plate,
            testDriver.name,
            testDriver.identificationNumber,
            testPoliceReport,
            "Autoridad de tránsito de prueba - NO REAL",
            String(testActa.numeroActa),
            "Período consultado: 09/10/2026 al 09/10/2026",
          ];
          for (const value of expectedPdfValues) {
            assert.ok(compactText.includes(compact(value)), `PDF falta el dato: ${value}`);
          }
          const expectedPdfLabels = [
            "Fecha del siniestro",
            "Nivel de pérdida",
            "Fatalidad (personas)",
            "Heridos graves (personas)",
            "Heridos leves (personas)",
            "Choque simple (personas implicadas)",
            "Placa del vehículo de la empresa",
            "Nombre del conductor de la empresa",
            "Identificación del conductor de la empresa",
            "Consecutivo del IPAT en RNAT/RUNT",
            "Organismo de tránsito o autoridad que elaboró el IPAT",
            "Número del acta del comité",
            "Fecha del comité donde fue analizado",
          ];
          for (const label of expectedPdfLabels) {
            assert.ok(compactText.includes(compact(label)), `PDF no contiene el campo solicitado: ${label}`);
          }
          await writeFile("attached_assets/DEMO-PRUEBA_prueba_funcional_informe_siniestros_2026-10-09.pdf", content);
        }
        outcomes.push(`${format.name}: descargado desde la ruta autenticada`);
      }

      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      try {
        const context = await browser.newContext({
          acceptDownloads: true,
          viewport: { width: 1280, height: 1000 },
        });
        await context.addCookies(
          cookie.split("; ").map((pair) => {
            const separator = pair.indexOf("=");
            return {
              name: pair.slice(0, separator),
              value: pair.slice(separator + 1),
              url: baseUrl,
            };
          }),
        );
        const page = await context.newPage();
        const pageErrors: string[] = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.goto(`${baseUrl}/pesv/informes`, { waitUntil: "domcontentloaded" });
        await page.getByTestId("input-pesv-report-from").waitFor({ state: "visible", timeout: 20_000 });
        const essentialCookiesButton = page.getByRole("button", { name: "Solo esenciales" });
        if (await essentialCookiesButton.isVisible()) {
          await essentialCookiesButton.click();
        }
        await page.waitForFunction(
          () => document.querySelector('[data-testid="text-pesv-report-total"]')?.textContent?.trim() === "5",
          undefined,
          { timeout: 20_000 },
        );
        const actaGuidance = page.getByTestId(`missing-guidance-committee-${incompleteActaRecord.id}`);
        await actaGuidance.waitFor({ state: "visible" });
        assert.match(await actaGuidance.innerText(), /Paso 1 \(P01\).*Planear/);
        assert.match(await actaGuidance.innerText(), /Comité PESV.*pestaña Actas/);
        const actaNavigationLink = page.getByTestId(`missing-guidance-link-committee-${incompleteActaRecord.id}`);
        assert.equal(await actaNavigationLink.getAttribute("href"), "/pesv/comite?tab=actas");
        await actaNavigationLink.click();
        await page.waitForURL(/\/pesv\/comite\?tab=actas$/);
        const actasTab = page.getByTestId("tab-actas");
        await actasTab.waitFor({ state: "visible" });
        assert.equal(await actasTab.getAttribute("data-state"), "active");
        await page.goto(`${baseUrl}/pesv/informes`, { waitUntil: "domcontentloaded" });
        await page.getByTestId("input-pesv-report-from").waitFor({ state: "visible", timeout: 20_000 });
        await page.waitForFunction(
          () => document.querySelector('[data-testid="text-pesv-report-total"]')?.textContent?.trim() === "5",
          undefined,
          { timeout: 20_000 },
        );
        assert.equal(await page.getByTestId("button-download-siniestros-excel").isDisabled(), true);
        assert.equal(await page.getByTestId("button-download-siniestros-pdf").isDisabled(), true);

        await page.getByTestId("input-pesv-report-from").fill(testIncident.incidentDate);
        await page.getByTestId("input-pesv-report-to").fill(testIncident.incidentDate);
        await page.getByTestId("button-apply-pesv-report-period").click();
        await page.waitForFunction(
          () => document.querySelector('[data-testid="text-pesv-report-total"]')?.textContent?.trim() === "1"
            && document.querySelector('[data-testid="text-pesv-report-ready"]')?.textContent?.trim() === "1"
            && document.querySelector('[data-testid="text-pesv-report-incomplete"]')?.textContent?.trim() === "0",
          undefined,
          { timeout: 20_000 },
        );
        assert.equal(await page.getByTestId("button-download-siniestros-excel").isEnabled(), true);
        assert.equal(await page.getByTestId("button-download-siniestros-pdf").isEnabled(), true);
        assert.match(
          await page.getByTestId("text-pesv-report-period").innerText(),
          /09\/10\/2026 al 09\/10\/2026/,
        );
        await page.screenshot({ path: "/tmp/pesv-report-ui-functional.png", fullPage: true });

        const [excelDownload] = await Promise.all([
          page.waitForEvent("download"),
          page.getByTestId("button-download-siniestros-excel").click(),
        ]);
        assert.match(excelDownload.suggestedFilename(), /desde_2026-10-09_hasta_2026-10-09\.xlsx$/i);
        await excelDownload.saveAs("attached_assets/DEMO-PRUEBA_prueba_funcional_informe_siniestros_2026-10-09.xlsx");
        const uiExcel = await readFile("attached_assets/DEMO-PRUEBA_prueba_funcional_informe_siniestros_2026-10-09.xlsx");
        const uiWorkbook = XLSX.read(uiExcel, { type: "buffer" });
        const uiRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
          uiWorkbook.Sheets["Siniestros PESV"],
          { header: 1 },
        );
        assert.equal(uiRows[5][9], testPoliceReport);

        const [pdfDownload] = await Promise.all([
          page.waitForEvent("download"),
          page.getByTestId("button-download-siniestros-pdf").click(),
        ]);
        assert.match(pdfDownload.suggestedFilename(), /desde_2026-10-09_hasta_2026-10-09\.pdf$/i);
        await pdfDownload.saveAs("attached_assets/DEMO-PRUEBA_prueba_funcional_informe_siniestros_2026-10-09.pdf");
        const uiPdf = await readFile("attached_assets/DEMO-PRUEBA_prueba_funcional_informe_siniestros_2026-10-09.pdf");
        assert.equal(uiPdf.subarray(0, 5).toString("ascii"), "%PDF-");
        const uiPdfText = execFileSync("pdftotext", ["-", "-"], { input: uiPdf, encoding: "utf8" });
        const compactPdfText = (value: string) => value.toUpperCase().replace(/[\s-]+/g, "");
        assert.ok(compactPdfText(uiPdfText).includes(compactPdfText(testPoliceReport)));
        assert.deepEqual(pageErrors, [], `La pantalla no debe generar errores: ${pageErrors.join(" | ")}`);
        outcomes.push("Excel y PDF descargados también desde los botones de la pantalla");
      } finally {
        await browser.close();
      }

      console.log(
        `DEMO-PRUEBA: caso retenido=${testPoliceReport}, placa=${testVehicle.plate}, acta=${testActa.numeroActa}; siniestros empresa=${allCompanyStatus.total}, completos=${allCompanyStatus.ready}, pendientes=${allCompanyStatus.incomplete.length}, campos pendientes=${pendingFieldNames.join(" | ") || "ninguno"}; período de prueba=${testIncident.incidentDate}, registros=${periodStatus.total}, completos=${periodStatus.ready}; ${outcomes.join("; ")}`,
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
