import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import * as XLSX from "xlsx";
import {
  buildSiniestrosExcelBuffer,
  buildSiniestrosPdfBuffer,
  describeSiniestroLossLevel,
  getMissingSiniestroReportFields,
  SINIESTROS_REPORT_HEADERS,
  type SiniestroReportRecord,
} from "../server/reports/pesv-siniestros-report";

const completeRecord: SiniestroReportRecord = {
  id: "siniestro-1",
  incidentDate: "2026-10-08",
  fatalities: 0,
  severeInjuries: 1,
  minorInjuries: 2,
  simpleCollisionPeople: 0,
  vehiclePlate: "ABC123",
  driverName: "CONDUCTOR DE PRUEBA",
  driverIdentification: "100000001",
  policeReport: "IPAT-2026-001",
  ipatAuthorityName: "Secretaría de Movilidad",
  committeeActaId: "acta-1",
  committeeActaNumber: 8,
  committeeAnalysisDate: "2026-10-09",
};

const requestedColumns = [
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

test("el informe marca como completas solo las filas con todos los datos requeridos", () => {
  assert.deepEqual(getMissingSiniestroReportFields(completeRecord), []);

  const historicalRecord = {
    ...completeRecord,
    severeInjuries: null,
    vehiclePlate: null,
    committeeAnalysisDate: null,
  };
  const missing = getMissingSiniestroReportFields(historicalRecord);
  assert.ok(missing.includes("Cantidad de heridos graves"));
  assert.ok(missing.includes("Placa del vehículo"));
  assert.ok(missing.includes("Acta y fecha del comité que analizó el siniestro"));
});

test("el nivel de pérdida refleja las cantidades registradas por categoría", () => {
  assert.equal(
    describeSiniestroLossLevel(completeRecord),
    "Heridos graves: 1; Heridos leves: 2",
  );
  assert.equal(
    describeSiniestroLossLevel({
      fatalities: 1,
      severeInjuries: 0,
      minorInjuries: 0,
      simpleCollisionPeople: 3,
    }),
    "Fatalidad: 1; Choque simple: 3",
  );
});

test("el Excel conserva los encabezados oficiales y los datos enlazados", () => {
  const buffer = buildSiniestrosExcelBuffer(
    { name: "Empresa de prueba", nit: "900123456" },
    [completeRecord],
    new Date("2026-10-09T12:00:00.000Z"),
  );
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets["Siniestros PESV"];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, { header: 1 });

  assert.deepEqual(SINIESTROS_REPORT_HEADERS, requestedColumns);
  assert.deepEqual(rows[4], requestedColumns);
  assert.equal(rows[5][0], "08/10/2026");
  assert.equal(rows[5][1], "Heridos graves: 1; Heridos leves: 2");
  assert.equal(rows[5][2], 0);
  assert.equal(rows[5][3], 1);
  assert.equal(rows[5][4], 2);
  assert.equal(rows[5][5], 0);
  assert.equal(rows[5][6], "ABC123");
  assert.equal(rows[5][7], "CONDUCTOR DE PRUEBA");
  assert.equal(rows[5][8], "100000001");
  assert.equal(rows[5][9], "IPAT-2026-001");
  assert.equal(rows[5][10], "Secretaría de Movilidad");
  assert.equal(rows[5][11], 8);
  assert.equal(rows[5][12], "09/10/2026");
});

test("el PDF muestra los mismos campos y datos que solicita la evidencia", async () => {
  const buffer = await buildSiniestrosPdfBuffer(
    {
      id: "empresa-1",
      name: "Empresa de prueba",
      nit: "900123456",
      address: null,
      logoUrl: null,
    },
    [completeRecord],
    false,
  );

  assert.equal(buffer.subarray(0, 5).toString("ascii"), "%PDF-");
  const text = execFileSync("pdftotext", ["-", "-"], {
    input: buffer,
    encoding: "utf8",
  }).replace(/\s+/g, " ");

  for (const field of requestedColumns) {
    assert.ok(text.includes(field), `El PDF debe incluir el campo: ${field}`);
  }
  for (const value of [
    "08/10/2026",
    "Heridos graves: 1; Heridos leves: 2",
    "ABC123",
    "CONDUCTOR DE PRUEBA",
    "100000001",
    "IPAT-2026-001",
    "Secretaría de Movilidad",
    "8",
    "09/10/2026",
  ]) {
    assert.ok(text.includes(value), `El PDF debe incluir el valor de prueba: ${value}`);
  }
});
