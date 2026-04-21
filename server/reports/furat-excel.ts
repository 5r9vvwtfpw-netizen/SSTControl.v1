/**
 * Generador de FURAT (Formato Único de Reporte de Accidente de Trabajo)
 * Basado en Resolución 1570 de 2005 - Ministerio de la Protección Social
 *
 * Genera archivo Excel pre-diligenciado con los datos del accidente,
 * trabajador y empresa registrados en el sistema.
 */

import * as XLSX from "xlsx";

export interface FuratData {
  empresa: {
    razonSocial: string;
    nit: string;
    ciiuCode: string | null;
    ciudad: string | null;
    direccion: string | null;
    telefono: string | null;
    arl: string | null;
    nivelRiesgo: string;
    representanteLegal: string | null;
    representanteLegalCedula: string | null;
  };
  trabajador: {
    nombre: string;
    tipoDocumento: string;
    numeroDocumento: string;
    fechaNacimiento: string | null;
    sexo: string | null;
    cargo: string;
    tipoVinculacion: string;
    eps: string | null;
    arl: string | null;
    tiempoLaborado: string | null;
  };
  accidente: {
    fecha: string;
    hora: string;
    jornada: string | null;
    lugarAccidente: string;
    municipio: string | null;
    descripcion: string;
    parteAfectada: string | null;
    naturalezaLesion: string | null;
    agenteLesion: string | null;
    mecanismoLesion: string | null;
    clasificacion: string;
    requirioUrgencias: boolean;
    ipsAtencion: string | null;
    diagnosticoMedico: string | null;
    testigos: string | null;
    accionesTomadas: string | null;
  };
  reporte: {
    fechaReporteEmpleador: string;
    elaboradoPor: string | null;
  };
}

const LABEL_COL = 0;
const VALUE_COL = 1;
const LABEL_COL2 = 3;
const VALUE_COL2 = 4;

function cell(ws: XLSX.WorkSheet, row: number, col: number, value: string, style?: any) {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  ws[ref] = { v: value, t: "s", s: style };
}

function mergeCells(ws: XLSX.WorkSheet, r1: number, c1: number, r2: number, c2: number) {
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

function addSection(
  ws: XLSX.WorkSheet,
  row: number,
  title: string,
  colCount: number = 5
): number {
  const ref = XLSX.utils.encode_cell({ r: row, c: 0 });
  ws[ref] = {
    v: title,
    t: "s",
    s: {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill: { fgColor: { rgb: "1F4E79" } },
      alignment: { horizontal: "center", vertical: "center" },
    },
  };
  mergeCells(ws, row, 0, row, colCount - 1);
  return row + 1;
}

function addRow(
  ws: XLSX.WorkSheet,
  row: number,
  label1: string,
  value1: string,
  label2?: string,
  value2?: string
): number {
  const labelStyle = {
    font: { bold: true, sz: 10 },
    fill: { fgColor: { rgb: "D6E4F0" } },
    border: {
      top: { style: "thin", color: { rgb: "AAAAAA" } },
      bottom: { style: "thin", color: { rgb: "AAAAAA" } },
      left: { style: "thin", color: { rgb: "AAAAAA" } },
      right: { style: "thin", color: { rgb: "AAAAAA" } },
    },
    alignment: { wrapText: true, vertical: "center" },
  };
  const valueStyle = {
    font: { sz: 10 },
    border: {
      top: { style: "thin", color: { rgb: "AAAAAA" } },
      bottom: { style: "thin", color: { rgb: "AAAAAA" } },
      left: { style: "thin", color: { rgb: "AAAAAA" } },
      right: { style: "thin", color: { rgb: "AAAAAA" } },
    },
    alignment: { wrapText: true, vertical: "center" },
  };

  cell(ws, row, LABEL_COL, label1, labelStyle);
  cell(ws, row, VALUE_COL, value1, valueStyle);
  mergeCells(ws, row, VALUE_COL, row, VALUE_COL + 1);

  if (label2 !== undefined) {
    cell(ws, row, LABEL_COL2, label2, labelStyle);
    cell(ws, row, VALUE_COL2, value2 || "", valueStyle);
  }

  return row + 1;
}

function addFullRow(
  ws: XLSX.WorkSheet,
  row: number,
  label: string,
  value: string,
  tall = false
): number {
  const labelStyle = {
    font: { bold: true, sz: 10 },
    fill: { fgColor: { rgb: "D6E4F0" } },
    border: {
      top: { style: "thin", color: { rgb: "AAAAAA" } },
      bottom: { style: "thin", color: { rgb: "AAAAAA" } },
      left: { style: "thin", color: { rgb: "AAAAAA" } },
      right: { style: "thin", color: { rgb: "AAAAAA" } },
    },
    alignment: { vertical: "center" },
  };
  const valueStyle = {
    font: { sz: 10 },
    border: {
      top: { style: "thin", color: { rgb: "AAAAAA" } },
      bottom: { style: "thin", color: { rgb: "AAAAAA" } },
      left: { style: "thin", color: { rgb: "AAAAAA" } },
      right: { style: "thin", color: { rgb: "AAAAAA" } },
    },
    alignment: { wrapText: true, vertical: "center" },
  };

  cell(ws, row, LABEL_COL, label, labelStyle);
  cell(ws, row, VALUE_COL, value, valueStyle);
  mergeCells(ws, row, VALUE_COL, row, 4);

  if (tall && ws["!rows"]) {
    ws["!rows"][row] = { hpt: 48 };
  }

  return row + 1;
}

function normalizeJornada(j: string | null): string {
  if (!j) return "No especificada";
  const map: Record<string, string> = {
    ordinaria: "Ordinaria (diurna)",
    extraordinaria: "Extraordinaria (nocturna/extra)",
  };
  return map[j] || j;
}

function normalizeClasificacion(c: string | null): string {
  if (!c) return "No especificada";
  const map: Record<string, string> = {
    normal: "Normal (en el lugar de trabajo)",
    in_itinere: "In itinere (trayecto casa-trabajo)",
    en_mision: "En misión (fuera del lugar habitual)",
  };
  return map[c] || c;
}

function normalizeSeveridad(s: string): string {
  const map: Record<string, string> = {
    leve: "Leve",
    grave: "Grave",
    mortal: "Mortal",
  };
  return map[s] || s;
}

function normalizeVinculacion(v: string): string {
  const map: Record<string, string> = {
    indefinido: "Término indefinido",
    fijo: "Término fijo",
    temporal: "Temporal",
    "obra-labor": "Obra o labor",
    aprendizaje: "Contrato de aprendizaje",
  };
  return map[v] || v;
}

function normalizeSexo(s: string | null): string {
  if (!s) return "No registrado";
  const map: Record<string, string> = {
    masculino: "Masculino",
    femenino: "Femenino",
    otro: "Otro",
    prefiero_no_decir: "No especificado",
  };
  return map[s] || s;
}

export function generateFuratExcel(data: FuratData): Buffer {
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  ws["!cols"] = [
    { wch: 30 },
    { wch: 22 },
    { wch: 4 },
    { wch: 28 },
    { wch: 22 },
  ];
  ws["!rows"] = new Array(60).fill({ hpt: 20 });

  let r = 0;

  // ── ENCABEZADO PRINCIPAL ────────────────────────────────────────────────
  const titleRef = XLSX.utils.encode_cell({ r, c: 0 });
  ws[titleRef] = {
    v: "FORMATO ÚNICO DE REPORTE DE ACCIDENTE DE TRABAJO (FURAT)",
    t: "s",
    s: {
      font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0D2D5E" } },
      alignment: { horizontal: "center", vertical: "center" },
    },
  };
  mergeCells(ws, r, 0, r, 4);
  ws["!rows"][r] = { hpt: 28 };
  r++;

  const sub1Ref = XLSX.utils.encode_cell({ r, c: 0 });
  ws[sub1Ref] = {
    v: "Resolución 1570 de 2005 — Ministerio de la Protección Social de Colombia",
    t: "s",
    s: {
      font: { italic: true, sz: 9, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F4E79" } },
      alignment: { horizontal: "center", vertical: "center" },
    },
  };
  mergeCells(ws, r, 0, r, 4);
  r++;

  const sub2Ref = XLSX.utils.encode_cell({ r, c: 0 });
  const arlLabel = data.empresa.arl
    ? `ARL: ${data.empresa.arl}`
    : "ARL: No configurada — configure en Afiliaciones";
  ws[sub2Ref] = {
    v: `Generado por SST Colombia | Fecha: ${new Date().toLocaleDateString("es-CO")} | ${arlLabel}`,
    t: "s",
    s: {
      font: { sz: 9, color: { rgb: "555555" } },
      fill: { fgColor: { rgb: "EBF5FB" } },
      alignment: { horizontal: "center", vertical: "center" },
    },
  };
  mergeCells(ws, r, 0, r, 4);
  r += 2;

  // ── SECCIÓN 1: DATOS DEL EMPLEADOR ─────────────────────────────────────
  r = addSection(ws, r, "SECCIÓN 1 — DATOS DEL EMPLEADOR");
  r = addRow(ws, r, "Razón Social", data.empresa.razonSocial, "NIT", data.empresa.nit);
  r = addRow(ws, r, "Código CIIU", data.empresa.ciiuCode || "No registrado", "Nivel de Riesgo ARL", `Clase ${data.empresa.nivelRiesgo}`);
  r = addRow(ws, r, "Ciudad / Municipio", data.empresa.ciudad || "No registrado", "Dirección", data.empresa.direccion || "No registrada");
  r = addRow(ws, r, "Teléfono", data.empresa.telefono || "No registrado", "ARL del Empleador", data.empresa.arl || "No configurada");
  r = addRow(ws, r, "Representante Legal", data.empresa.representanteLegal || "No registrado", "Cédula Rep. Legal", data.empresa.representanteLegalCedula || "No registrada");
  r++;

  // ── SECCIÓN 2: DATOS DEL TRABAJADOR ────────────────────────────────────
  r = addSection(ws, r, "SECCIÓN 2 — DATOS DEL TRABAJADOR ACCIDENTADO");
  r = addRow(ws, r, "Nombre completo", data.trabajador.nombre, "Tipo de documento", data.trabajador.tipoDocumento);
  r = addRow(ws, r, "Número de documento", data.trabajador.numeroDocumento, "Fecha de nacimiento", data.trabajador.fechaNacimiento || "No registrada");
  r = addRow(ws, r, "Sexo", normalizeSexo(data.trabajador.sexo), "Cargo / Oficio", data.trabajador.cargo);
  r = addRow(ws, r, "Tipo de vinculación", normalizeVinculacion(data.trabajador.tipoVinculacion), "Tiempo laborado en empresa", data.trabajador.tiempoLaborado || "No calculado");
  r = addRow(ws, r, "EPS del trabajador", data.trabajador.eps || "No registrada", "ARL del trabajador", data.trabajador.arl || data.empresa.arl || "No registrada");
  r++;

  // ── SECCIÓN 3: DATOS DEL ACCIDENTE ─────────────────────────────────────
  r = addSection(ws, r, "SECCIÓN 3 — DATOS DEL ACCIDENTE DE TRABAJO");
  r = addRow(ws, r, "Fecha del accidente", data.accidente.fecha, "Hora del accidente", data.accidente.hora);
  r = addRow(ws, r, "Jornada", normalizeJornada(data.accidente.jornada), "Clasificación del evento", normalizeClasificacion(null));
  r = addFullRow(ws, r, "Lugar del accidente", data.accidente.lugarAccidente);
  r = addRow(ws, r, "Municipio / Ciudad", data.accidente.municipio || data.empresa.ciudad || "No especificado", "Severidad", normalizeSeveridad(data.accidente.clasificacion));
  r = addFullRow(ws, r, "Descripción detallada del accidente", data.accidente.descripcion, true);
  r = addRow(ws, r, "Parte del cuerpo afectada", data.accidente.parteAfectada || "No especificada", "Naturaleza de la lesión", data.accidente.naturalezaLesion || "No especificada");
  r = addRow(ws, r, "Agente de la lesión", data.accidente.agenteLesion || "No especificado", "Mecanismo de la lesión", data.accidente.mecanismoLesion || "No especificado");
  r = addRow(ws, r, "¿Requirió atención de urgencias?", data.accidente.requirioUrgencias ? "SÍ" : "NO", "IPS que atendió", data.accidente.ipsAtencion || "No registrada");
  r = addFullRow(ws, r, "Diagnóstico médico", data.accidente.diagnosticoMedico || "No registrado");
  r = addFullRow(ws, r, "Testigos", data.accidente.testigos || "No registrados");
  r = addFullRow(ws, r, "Acciones tomadas inmediatamente", data.accidente.accionesTomadas || "No registradas");
  r++;

  // ── SECCIÓN 4: REPORTE Y OBLIGACIONES LEGALES ──────────────────────────
  r = addSection(ws, r, "SECCIÓN 4 — REPORTE Y OBLIGACIONES LEGALES");
  r = addRow(ws, r, "Fecha de reporte al empleador", data.reporte.fechaReporteEmpleador, "Elaborado por", data.reporte.elaboradoPor || "No especificado");

  const notaRef = XLSX.utils.encode_cell({ r, c: 0 });
  ws[notaRef] = {
    v: "⚠ OBLIGACIÓN LEGAL: El empleador debe reportar el accidente a la ARL y EPS dentro de los DOS (2) días hábiles siguientes a la ocurrencia (Decreto 1295/1994 Art. 62). El incumplimiento puede generar multas de hasta 500 SMLMV.",
    t: "s",
    s: {
      font: { bold: true, sz: 9, color: { rgb: "7B1C1C" } },
      fill: { fgColor: { rgb: "FDECEA" } },
      alignment: { wrapText: true, vertical: "center", horizontal: "center" },
    },
  };
  mergeCells(ws, r, 0, r, 4);
  ws["!rows"][r] = { hpt: 40 };
  r += 2;

  // ── SECCIÓN 5: FIRMAS ───────────────────────────────────────────────────
  r = addSection(ws, r, "SECCIÓN 5 — FIRMAS");

  const firmaLabelStyle = {
    font: { bold: true, sz: 10 },
    border: {
      top: { style: "thin", color: { rgb: "AAAAAA" } },
      bottom: { style: "thin", color: { rgb: "AAAAAA" } },
      left: { style: "thin", color: { rgb: "AAAAAA" } },
      right: { style: "thin", color: { rgb: "AAAAAA" } },
    },
    alignment: { horizontal: "center", vertical: "bottom" },
  };

  // Espacio de firmas
  for (let fr = 0; fr < 4; fr++) {
    ws["!rows"][r + fr] = { hpt: 20 };
  }
  const spacerRef = XLSX.utils.encode_cell({ r, c: 0 });
  ws[spacerRef] = { v: "", t: "s" };
  mergeCells(ws, r, 0, r + 3, 1);
  const spacerRef2 = XLSX.utils.encode_cell({ r, c: 3 });
  ws[spacerRef2] = { v: "", t: "s" };
  mergeCells(ws, r, 3, r + 3, 4);
  r += 4;

  const sig1Ref = XLSX.utils.encode_cell({ r, c: 0 });
  ws[sig1Ref] = { v: "Firma del Trabajador Accidentado", t: "s", s: firmaLabelStyle };
  mergeCells(ws, r, 0, r, 1);

  const sig2Ref = XLSX.utils.encode_cell({ r, c: 3 });
  ws[sig2Ref] = { v: "Firma del Representante del Empleador", t: "s", s: firmaLabelStyle };
  mergeCells(ws, r, 3, r, 4);
  r += 2;

  const name1Ref = XLSX.utils.encode_cell({ r, c: 0 });
  ws[name1Ref] = { v: `Nombre: ${data.trabajador.nombre}`, t: "s", s: { font: { sz: 9 }, alignment: { horizontal: "center" } } };
  mergeCells(ws, r, 0, r, 1);

  const name2Ref = XLSX.utils.encode_cell({ r, c: 3 });
  ws[name2Ref] = { v: `Nombre: ${data.empresa.representanteLegal || "________________________"}`, t: "s", s: { font: { sz: 9 }, alignment: { horizontal: "center" } } };
  mergeCells(ws, r, 3, r, 4);
  r += 2;

  // ── NOTA AL PIE ─────────────────────────────────────────────────────────
  const footerRef = XLSX.utils.encode_cell({ r, c: 0 });
  ws[footerRef] = {
    v: "Documento generado por SST Colombia (SADGI S.A.S.) | Sistema de Gestión SST | sst-colombia.com.co | Para uso interno y envío a ARL/EPS",
    t: "s",
    s: {
      font: { sz: 8, italic: true, color: { rgb: "888888" } },
      alignment: { horizontal: "center" },
    },
  };
  mergeCells(ws, r, 0, r, 4);

  // Rango de la hoja
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: 4 } });

  XLSX.utils.book_append_sheet(wb, ws, "FURAT");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}
