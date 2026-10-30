import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { generateFuratExcel, type FuratData } from "../../server/reports/furat-excel";

test("FURAT generator produces a valid XLSX workbook without SheetJS", async () => {
  const data: FuratData = {
    empresa: { razonSocial: "Empresa QA", nit: "900000000-1", ciiuCode: "7020", ciudad: "Bogotá", direccion: "Calle 1", telefono: "3000000000", arl: "ARL QA", nivelRiesgo: "I", representanteLegal: "Representante QA", representanteLegalCedula: "1000000000" },
    trabajador: { nombre: "Trabajador QA", tipoDocumento: "CC", numeroDocumento: "1000000001", fechaNacimiento: "1990-01-01", sexo: "masculino", cargo: "Conductor", tipoVinculacion: "indefinido", eps: "EPS QA", arl: "ARL QA", tiempoLaborado: "1 año", salarioBase: "1.000.000" },
    accidente: { fecha: "2026-10-30", hora: "08:00", jornada: "ordinaria", tipoAccidente: "normal", lugarAccidente: "Sede QA", municipio: "Bogotá", descripcion: "Evento de prueba", parteAfectada: "Mano", naturalezaLesion: "Golpe", agenteLesion: "Herramienta", mecanismoLesion: "Contacto", severidad: "leve", requirioUrgencias: false, ipsAtencion: null, diagnosticoMedico: null, codigoCIE10: null, testigos: null, accionesTomadas: "Primeros auxilios" },
    reporte: { fechaReporteEmpleador: "2026-10-30", elaboradoPor: "Responsable QA" },
  };

  const buffer = await generateFuratExcel(data);
  assert.ok(buffer.length > 1_000);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  assert.equal(workbook.worksheets[0]?.name, "FURAT");
  assert.match(String(workbook.worksheets[0]?.getCell("A1").value), /FURAT/);
});

