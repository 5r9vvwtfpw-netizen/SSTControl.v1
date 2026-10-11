import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import XLSX from "xlsx-js-style";
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
    { from: "2026-10-08", to: "2026-10-09" },
  );
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets["Siniestros PESV"];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, { header: 1 });

  assert.deepEqual(SINIESTROS_REPORT_HEADERS, requestedColumns);
  assert.ok(String(rows[2]?.[0]).includes("Período consultado: 08/10/2026 al 09/10/2026"));
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

test("Excel y PDF generan un resumen explícito en cero sin inventar filas de siniestros", async () => {
  const period = { from: "2026-09-01", to: "2026-09-30" };
  const excelBuffer = buildSiniestrosExcelBuffer(
    { name: "Empresa de prueba", nit: "900123456" },
    [],
    new Date("2026-10-01T12:00:00.000Z"),
    period,
    true,
  );
  const workbook = XLSX.read(excelBuffer, { type: "buffer", cellStyles: true });
  assert.ok(workbook.SheetNames.includes("Resumen sin siniestros"));
  const incidentRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
    workbook.Sheets["Siniestros PESV"],
    { header: 1 },
  );
  assert.deepEqual(incidentRows[5], requestedColumns);
  assert.equal(incidentRows.length, 6, "La hoja oficial no debe agregar filas de accidentes.");
  const declarationCell = workbook.Sheets["Siniestros PESV"]["A4"];
  assert.match(String(declarationCell.v), /DECLARACIÓN DE LA EMPRESA/);
  assert.equal(declarationCell.s.patternType, "solid");
  assert.equal(declarationCell.s.fgColor.rgb, "246B45");
  const zeroSummaryRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
    workbook.Sheets["Resumen sin siniestros"],
    { header: 1 },
  );
  assert.match(String(workbook.Sheets["Resumen sin siniestros"]["A2"].v), /DECLARACIÓN DE LA EMPRESA/);
  assert.equal(workbook.Sheets["Resumen sin siniestros"]["A2"].s.fgColor.rgb, "E5F2EA");
  const tempDir = mkdtempSync(join(tmpdir(), "pesv-zero-report-"));
  try {
    const workbookPath = join(tempDir, "report.xlsx");
    writeFileSync(workbookPath, excelBuffer);
    const stylesXml = execFileSync("unzip", ["-p", workbookPath, "xl/styles.xml"], { encoding: "utf8" });
    assert.match(stylesXml, /<font>.*?<b\/>.*?<sz val="15"/s);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
  assert.ok(zeroSummaryRows.some((row) => row[0] === "Siniestros viales" && row[1] === 0));
  assert.ok(zeroSummaryRows.some((row) => row[0] === "Fatalidades" && row[1] === 0));
  assert.ok(zeroSummaryRows.some((row) => row[0] === "Heridos graves" && row[1] === 0));
  assert.ok(zeroSummaryRows.some((row) => row[0] === "Heridos leves" && row[1] === 0));
  assert.ok(zeroSummaryRows.some((row) => row[0] === "Personas implicadas en choque simple" && row[1] === 0));
  assert.ok(zeroSummaryRows.some((row) => row[0] === "Total personas afectadas" && row[1] === 0));

  const pdfBuffer = await buildSiniestrosPdfBuffer(
    {
      id: "empresa-1",
      name: "Empresa de prueba",
      nit: "900123456",
      address: null,
      logoUrl: null,
    },
    [],
    false,
    period,
    true,
  );
  const pdfText = execFileSync("pdftotext", ["-", "-"], {
    input: pdfBuffer,
    encoding: "utf8",
  }).replace(/\s+/g, " ");
  for (const value of [
    "DECLARACIÓN DE LA EMPRESA: SIN SINIESTROS VIALES",
    "01/09/2026 al 30/09/2026",
    "La empresa declara que no se presentaron siniestros viales",
  ]) {
    assert.ok(pdfText.includes(value), `El PDF en cero debe incluir: ${value}`);
  }
  assert.match(pdfText, /Fatalidades:?\s+0/);
  assert.match(pdfText, /Heridos graves:?\s+0/);
  assert.match(pdfText, /Heridos leves:?\s+0/);
  assert.match(pdfText, /Total personas afectadas:?\s+0/);
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
    { from: "2026-10-08", to: "2026-10-09" },
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
    "Período consultado: 08/10/2026 al 09/10/2026",
  ]) {
    assert.ok(text.includes(value), `El PDF debe incluir el valor de prueba: ${value}`);
  }
});
