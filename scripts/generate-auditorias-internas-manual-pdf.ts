import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const outputPath = path.resolve("documents/manual-prueba-auditorias-internas-sst.pdf");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margin: 48,
  bufferPages: true,
  info: {
    Title: "Manual de prueba funcional — Auditorías Internas SST",
    Author: "SG-SST Colombia",
    Subject: "Guía de prueba del ciclo completo de Auditorías Internas SST",
  },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const colors = {
  navy: "#12304a",
  blue: "#2563eb",
  text: "#202b35",
  muted: "#5b6875",
  border: "#d9e2ea",
  soft: "#f4f7fa",
  green: "#146c43",
  amber: "#8a5a00",
};

function ensureSpace(height = 70) {
  if (doc.y + height > doc.page.height - 70) doc.addPage();
}

function title(text: string, subtitle?: string) {
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(22).text(text, { align: "center" });
  if (subtitle) {
    doc.moveDown(0.35);
    doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text(subtitle, { align: "center" });
  }
  doc.moveDown(1.2);
}

function heading(text: string, level: 1 | 2 = 1) {
  ensureSpace(level === 1 ? 70 : 48);
  doc.moveDown(level === 1 ? 0.8 : 0.45);
  doc.fillColor(level === 1 ? colors.navy : colors.blue)
    .font("Helvetica-Bold")
    .fontSize(level === 1 ? 15 : 11)
    .text(text);
  doc.moveDown(0.25);
}

function paragraph(text: string, options: { bold?: boolean; color?: string } = {}) {
  ensureSpace(45);
  doc.fillColor(options.color || colors.text)
    .font(options.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(9.5)
    .text(text, { lineGap: 2, paragraphGap: 5 });
}

function bullet(text: string, indent = 14) {
  ensureSpace(30);
  doc.fillColor(colors.text).font("Helvetica").fontSize(9.5)
    .text("•", { continued: true, indent: 0 })
    .text(`  ${text}`, { indent, lineGap: 2, paragraphGap: 3 });
}

function numbered(number: number, text: string) {
  ensureSpace(30);
  doc.fillColor(colors.text).font("Helvetica").fontSize(9.5)
    .text(`${number}.`, { continued: true })
    .text(`  ${text}`, { indent: 17, lineGap: 2, paragraphGap: 3 });
}

function field(label: string, value: string) {
  ensureSpace(25);
  doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(9.5).text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value, { lineGap: 2, paragraphGap: 3 });
}

function callout(label: string, text: string, color = colors.soft) {
  ensureSpace(75);
  const startY = doc.y;
  doc.roundedRect(doc.page.margins.left, startY, doc.page.width - doc.page.margins.left - doc.page.margins.right, 48, 5)
    .fillAndStroke(color, colors.border);
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(9.5)
    .text(label, doc.page.margins.left + 12, startY + 9);
  doc.fillColor(colors.text).font("Helvetica").fontSize(9)
    .text(text, doc.page.margins.left + 12, startY + 23, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 24,
      lineGap: 1,
    });
  doc.y = startY + 60;
}

function statusRow(element: string, status: string, expected: string) {
  ensureSpace(30);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.y;
  doc.rect(x, y, width, 22).fillAndStroke(colors.soft, colors.border);
  doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(8.5).text(element, x + 7, y + 6, { width: width * 0.31 });
  doc.fillColor(colors.green).font("Helvetica-Bold").text(status, x + width * 0.34, y + 6, { width: width * 0.21 });
  doc.fillColor(colors.text).font("Helvetica").text(expected, x + width * 0.57, y + 6, { width: width * 0.4 });
  doc.y = y + 28;
}

title(
  "Manual de prueba funcional",
  "Auditorías Internas SST — ciclo completo del SG-SST",
);
paragraph("Guía práctica para comprobar desde la interfaz la planificación, ejecución, checklist normativo, hallazgos, planes de acción, cierre, eficacia e informe de una auditoría interna.");
doc.moveDown(0.6);
callout("Importante", "Para repetir la prueba cree una auditoría nueva. La auditoría de evidencia ya está cerrada y sus cambios estructurales están bloqueados.", "#fff8e6");
field("Módulo", "Auditorías Internas SST");
field("Ruta de acceso", "SST → Auditorías Internas SST");
field("Empresa sugerida", "DEMO-PRUEBA");
field("Permisos necesarios", "Ver, crear y editar auditorías internas; además de gestionar checklist, hallazgos y planes.");
field("Resultado esperado", "Auditoría cerrada, hallazgo cerrado, plan verificado al 100% e informe PDF descargable.");

heading("1. Preparación de la prueba");
paragraph("Use un usuario con permisos de auditorías internas. Si no aparecen los botones Nueva Auditoría, Generar checklist o Registrar hallazgo, solicite los permisos correspondientes al administrador.");
paragraph("Prepare una evidencia de prueba, por ejemplo un PDF o una imagen. El archivo es opcional para completar el flujo, pero sirve para comprobar el cargue de evidencias.");
heading("Datos recomendados para la prueba", 2);
field("Código", "AUD-INT-MANUAL-001");
field("Título", "Prueba funcional auditoría interna SST");
field("Tipo", "Interna");
field("Norma de referencia", "Ambas normas");
field("Objetivo", "Verificar la conformidad del Sistema de Gestión de SST.");
field("Alcance", "Procesos administrativos y operativos de la empresa.");
field("Fase PHVA", "Verificar");
field("Proceso PHVA", "Verificación y mejora del SG-SST");
field("Estándar relacionado", "Resolución 0312 de 2019 — Estándar 6.1.2");

heading("2. Crear la auditoría");
numbered(1, "Entre a SST → Auditorías Internas SST.");
numbered(2, "Pulse Nueva Auditoría.");
numbered(3, "Complete Código, Fecha Programada, Título, Tipo, Norma de Referencia, Objetivo, Alcance y Auditor Líder.");
numbered(4, "Si aparece el asistente Smart Form, puede aplicarlo o completar los campos manualmente.");
numbered(5, "Pulse Crear auditoría y abra el registro creado.");
callout("Debe ocurrir", "La auditoría aparece con estado Programada y se muestra la tarjeta Ciclo de la auditoría.", "#edf6ff");

heading("3. Guardar trazabilidad PHVA");
numbered(1, "En la tarjeta Trazabilidad PHVA seleccione la fase Verificar.");
numbered(2, "Escriba el proceso y el estándar relacionado.");
numbered(3, "Pulse Guardar trazabilidad PHVA.");
paragraph("La trazabilidad relaciona la auditoría con el ciclo PHVA y se incluirá en el informe individual.");

heading("4. Iniciar la auditoría y generar el checklist");
numbered(1, "Pulse Iniciar auditoría.");
numbered(2, "Confirme que el estado cambió de Programada a En ejecución.");
numbered(3, "En Checklist normativo y evidencias pulse Generar checklist normativo.");
numbered(4, "Compruebe que aparecen los criterios y que cada uno muestra Resultado de la evaluación.");
callout("Regla de negocio", "La auditoría no puede completarse mientras exista un criterio con estado Pendiente de evaluar.", "#fff8e6");

heading("5. Evaluar criterios y registrar evidencias");
paragraph("Para cada criterio use el selector Resultado de la evaluación. Después complete la fuente de evidencia, Evidencia obtenida y Observaciones del auditor. Los textos se guardan al salir del campo.");
paragraph("Para reproducir la prueba de referencia:", { bold: true });
bullet("En el primer criterio seleccione No cumple.");
bullet("En los demás criterios seleccione Cumple.");
bullet("En Fuente de evidencia seleccione Registro interno del sistema si el soporte ya existe en otro módulo.");
bullet("Para un registro interno, indique el Módulo o proceso de origen, la Referencia de la fuente y la Fecha de la evidencia.");
bullet("En el primer criterio escriba una evidencia y observación que expliquen la desviación.");
bullet("Use Archivo o documento externo únicamente cuando el soporte venga de fuera del sistema.");
bullet("Use Observación o entrevista para recorridos, entrevistas u observaciones directas.");
bullet("Adjuntar archivo externo es opcional y acepta archivos de hasta 10 MB.");
callout("Resultado esperado", "Todos los criterios deben quedar evaluados. Con 12 criterios, 11 Cumple y 1 No cumple, el resultado será 92% de cumplimiento.", "#edf8f1");

heading("5.1. Cómo documentar un registro interno", 2);
paragraph("No vuelva a cargar un informe que ya existe en el sistema. Seleccione Registro interno del sistema y complete los campos de trazabilidad.");
field("Módulo o proceso de origen", "Capacitaciones, Inspecciones, EPP, Matriz legal u otro módulo.");
field("Referencia de la fuente", "Nombre del informe, número, ID o referencia interna.");
field("Fecha de la evidencia", "Fecha del registro o del informe consultado.");
field("Evidencia obtenida", "Qué se revisó y cuál fue el resultado.");
callout("Ejemplo", "Módulo: Capacitaciones · Referencia: Informe de capacitaciones SST de junio de 2026 · Fecha: 30/06/2026. Se verificaron 12 asistentes y sus evaluaciones.", "#edf8f1");

heading("6. Registrar un hallazgo");
paragraph("En el criterio marcado como No cumple pulse Registrar hallazgo. También puede usar el botón Registrar hallazgo de la sección Hallazgos y planes de acción.");
field("Tipo", "No conformidad menor");
field("Severidad", "Media");
field("Descripción", "La política SST no presenta evidencia de comunicación a las partes interesadas.");
field("Requisito", "La política de SST debe estar definida, firmada, comunicada y disponible.");
field("Área afectada", "Dirección / SG-SST");
field("Referencia normativa", "Decreto 1072 de 2015, art. 2.2.4.6.5");
field("Evidencia objetiva", "No se encontró evidencia de comunicación formal de la política SST.");
numbered(1, "Pulse Guardar hallazgo.");
numbered(2, "Compruebe que el hallazgo aparece con estado Abierto.");

heading("7. Crear un plan de acción");
numbered(1, "En la tarjeta del hallazgo pulse Crear plan de acción.");
numbered(2, "Seleccione Correctiva en Tipo de acción.");
numbered(3, "Describa la acción que cerrará la brecha.");
numbered(4, "Indique el Responsable y la Fecha compromiso.");
numbered(5, "Pulse Guardar plan.");
paragraph("El plan debe aparecer inicialmente con estado Abierto y avance de 0%.");

heading("8. Completar la auditoría");
numbered(1, "Verifique nuevamente que no existan criterios pendientes.");
numbered(2, "Pulse Marcar como completada.");
numbered(3, "Compruebe el estado Completada y los resultados calculados.");
callout("Debe ocurrir", "El sistema calcula el número de conformidades y el porcentaje de cumplimiento a partir del checklist guardado.", "#edf8f1");

heading("9. Cerrar y aprobar la auditoría");
numbered(1, "Con la auditoría en estado Completada pulse Cerrar auditoría.");
numbered(2, "Escriba las Conclusiones de cierre.");
numbered(3, "Escriba Recomendaciones si aplica.");
numbered(4, "Pulse Confirmar cierre.");
paragraph("El responsable de aprobación se registra automáticamente con el usuario autenticado. El estado final de la auditoría debe ser Cerrada.");

heading("10. Actualizar el plan después del cierre");
paragraph("El cierre de la auditoría no elimina el seguimiento de las acciones correctivas.");
numbered(1, "En el plan pulse Actualizar seguimiento.");
numbered(2, "Registre Porcentaje de avance: 100.");
numbered(3, "Registre la Fecha de implementación y las Observaciones de avance.");
numbered(4, "En Verificación de eficacia seleccione Eficaz.");
numbered(5, "Registre la Fecha de verificación y el Resultado y evidencia de eficacia.");
numbered(6, "Pulse Guardar seguimiento.");
callout("Regla de negocio", "Un plan solo puede quedar Verificado o Cerrado cuando tiene 100% de avance y eficacia confirmada.", "#fff8e6");

heading("11. Verificar y cerrar el hallazgo");
numbered(1, "Cuando el plan sea eficaz, el hallazgo debe pasar a Verificado.");
numbered(2, "Si aparece Verificar eficacia, pulse el botón y registre las observaciones solicitadas.");
numbered(3, "Cuando el hallazgo esté Verificado, pulse Cerrar hallazgo.");
numbered(4, "Escriba las observaciones de cierre y pulse Confirmar.");
paragraph("El estado final del hallazgo debe ser Cerrado.");

heading("12. Descargar y revisar el informe");
numbered(1, "En la tarjeta Informe individual pulse Descargar informe PDF.");
numbered(2, "Abra el archivo y confirme que contiene planificación, trazabilidad PHVA, checklist, cumplimiento, hallazgos, planes, conclusiones y aprobación.");

heading("13. Validaciones de protección");
paragraph("Con la auditoría cerrada, intente realizar estas acciones:");
bullet("Editar un criterio del checklist.");
bullet("Agregar o cambiar un criterio.");
bullet("Cambiar la descripción de un hallazgo.");
bullet("Cambiar la trazabilidad PHVA.");
paragraph("Estas ediciones estructurales deben estar bloqueadas. En cambio, Actualizar seguimiento del plan debe continuar disponible.");

heading("14. Estados finales esperados");
statusRow("Auditoría", "Cerrada", "El ciclo terminó con aprobación.");
statusRow("Checklist", "Evaluado", "No quedan criterios pendientes.");
statusRow("Hallazgo", "Cerrado", "La eficacia fue verificada.");
statusRow("Plan de acción", "Verificado", "100% de avance y eficaz.");
statusRow("Informe", "Disponible", "PDF descargable desde la auditoría.");

heading("15. Problemas frecuentes");
heading("No aparece Nueva Auditoría", 2);
paragraph("El usuario no tiene permiso de creación o la empresa seleccionada no está disponible. Revise el rol y la empresa activa.");
heading("No se puede completar la auditoría", 2);
paragraph("Revise cada criterio del checklist. Todos deben tener Cumple o No cumple; un criterio pendiente bloquea la transición.");
heading("No se puede verificar el plan", 2);
paragraph("Confirme que el avance es 100%, que existe fecha de implementación, que seleccionó Eficaz y que escribió el resultado de verificación.");
heading("No se puede cerrar el hallazgo", 2);
paragraph("Primero debe verificarse el hallazgo. Para llegar a Verificado, todos sus planes deben estar al 100% y ser eficaces.");
heading("La auditoría cerrada parece bloqueada", 2);
paragraph("Es el comportamiento esperado para cambios estructurales. El seguimiento de planes sí debe permanecer disponible.");

heading("Referencia de una prueba ya realizada");
field("Empresa", "DEMO-PRUEBA");
field("Código", "AUD-INT-E2E-20260916-1615");
field("Resultado", "Cerrada · 12/12 criterios evaluados · 11 conformes · 92%");
field("Hallazgo", "NC-MEN-001-E2E — Cerrado");
field("Plan", "ACC-001-E2E — Verificado · 100% · eficaz");
paragraph("Esta auditoría se conserva como evidencia y puede consultarse desde la lista de Auditorías Internas SST.");

const range = doc.bufferedPageRange();
for (let page = range.start; page < range.start + range.count; page += 1) {
  doc.switchToPage(page);
  doc.strokeColor(colors.border).moveTo(48, 744).lineTo(564, 744).stroke();
  doc.fillColor(colors.muted).font("Helvetica").fontSize(8)
    .text("Manual de prueba funcional — Auditorías Internas SST", 48, 752);
  doc.text(`Página ${page + 1} de ${range.count}`, 465, 752, { width: 99, align: "right" });
}

doc.end();

stream.on("finish", () => {
  console.log(`Manual PDF generado: ${outputPath}`);
});