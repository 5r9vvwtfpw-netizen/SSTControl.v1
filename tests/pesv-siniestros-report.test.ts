import assert from "node:assert/strict";
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

  assert.deepEqual(rows[4], SINIESTROS_REPORT_HEADERS);
  assert.equal(rows[5][0], "08/10/2026");
  assert.equal(rows[5][1], "Heridos graves: 1; Heridos leves: 2");
  assert.equal(rows[5][6], "ABC123");
  assert.equal(rows[5][9], "IPAT-2026-001");
  assert.equal(rows[5][11], 8);
});

test("el PDF generado tiene una firma de archivo PDF válida", async () => {
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
});
