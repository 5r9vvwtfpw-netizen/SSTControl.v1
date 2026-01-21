import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateInformePreciosEjecutivo(res: Response) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Informe-Ejecutivo-Precios-SST-Colombia.pdf');
  doc.pipe(res);

  const primaryColor = '#1e40af';
  const accentColor = '#059669';
  const textColor = '#1f2937';
  const lightGray = '#f3f4f6';

  // Header
  doc.fillColor(primaryColor)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('INFORME EJECUTIVO', { align: 'center' });
  
  doc.moveDown(0.3);
  doc.fontSize(16)
     .fillColor(textColor)
     .text('Propuesta Comercial SST-Colombia', { align: 'center' });
  
  doc.moveDown(0.3);
  doc.fontSize(12)
     .fillColor('#6b7280')
     .text('Sistema Integral de Gestión SST con Modelo de Precios Diferenciado', { align: 'center' });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor(primaryColor).lineWidth(2).stroke();
  doc.moveDown(1);

  // 1. Resumen Ejecutivo
  addSection(doc, '1. RESUMEN EJECUTIVO', primaryColor);
  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica')
     .text('SST-Colombia presenta un modelo de precios innovador basado en la complejidad real del cumplimiento normativo, combinado con una propuesta de valor única en el mercado colombiano: ', { continued: true })
     .font('Helvetica-Bold')
     .text('dos portales especializados incluidos sin costo adicional.');
  
  doc.moveDown(1.5);

  // 2. Propuesta de Valor Única
  addSection(doc, '2. PROPUESTA DE VALOR ÚNICA', primaryColor);
  
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(accentColor)
     .text('DIFERENCIADORES COMPETITIVOS (INCLUIDOS SIN COSTO)');
  doc.moveDown(0.5);

  // Portal del Trabajador
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(primaryColor)
     .text('Portal del Trabajador - INCLUIDO');
  doc.font('Helvetica')
     .fillColor(textColor)
     .fontSize(10);
  const portalTrabajador = [
    '• Acceso 24/7 desde cualquier dispositivo',
    '• Consulta de certificados y capacitaciones',
    '• Reporte de condiciones inseguras',
    '• Firma electrónica de documentos',
    '• Cumplimiento Habeas Data (Ley 1581/2012)',
    '• Trazabilidad individual para auditorías'
  ];
  portalTrabajador.forEach(item => doc.text(item));
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#6b7280').text('Valor de mercado: $3,000 - $5,000/usuario/mes');
  
  doc.moveDown(1);

  // Portal del Licenciado
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(primaryColor)
     .text('Portal del Licenciado SST - INCLUIDO');
  doc.font('Helvetica')
     .fillColor(textColor)
     .fontSize(10);
  const portalLicenciado = [
    '• Gestión de múltiples empresas desde un solo dashboard',
    '• Generación de informes consolidados',
    '• Herramientas profesionales de productividad',
    '• Acceso a todas las funcionalidades del sistema',
    '• Ideal para consultores independientes y firmas SST'
  ];
  portalLicenciado.forEach(item => doc.text(item));
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#6b7280').text('Valor de mercado: $150,000 - $300,000/mes');

  doc.moveDown(1.5);

  // 3. Modelo de Precios
  addSection(doc, '3. MODELO DE PRECIOS', primaryColor);
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('Fórmula de Cálculo:');
  doc.moveDown(0.3);
  doc.font('Helvetica')
     .fontSize(10)
     .fillColor(primaryColor)
     .text('PRECIO MENSUAL = (Trabajadores × Tarifa/Trabajador) + (Estándares × $8,000)', { align: 'center' });
  
  doc.moveDown(1);

  // Tabla Tarifa por Trabajador
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('3.1 Tarifa por Trabajador');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Capítulo', 'Empleados', 'Tarifa/Trabajador'],
    ['I', '1-10', '$26,000'],
    ['II', '11-50', '$24,000'],
    ['III', '51-200', '$22,000'],
    ['III+', '201+', '$20,000']
  ], [100, 150, 150]);

  doc.moveDown(1);

  // Tabla Tarifa por Estándar
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('3.2 Tarifa por Estándar Normativo');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Nivel de Riesgo', 'Estándares', 'Costo Mensual'],
    ['Riesgo I - II', '7 estándares', '$56,000'],
    ['Riesgo III', '21 estándares', '$168,000'],
    ['Riesgo IV - V', '61 estándares', '$488,000']
  ], [150, 120, 130]);

  doc.moveDown(0.5);
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor(accentColor)
     .text('Tarifa unitaria: $8,000 COP/estándar/mes');

  // Nueva página
  doc.addPage();

  // 4. Tabla de Precios por Segmento
  addSection(doc, '4. TABLA DE PRECIOS POR SEGMENTO', primaryColor);

  // Capítulo I
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('Capítulo I (1-10 trabajadores)');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Empleados', 'Riesgo I-II', 'Riesgo III', 'Riesgo IV-V'],
    ['1', '$82,000', '$194,000', '$514,000'],
    ['5', '$186,000', '$298,000', '$618,000'],
    ['10', '$316,000', '$428,000', '$748,000']
  ], [100, 110, 110, 110]);

  doc.moveDown(1);

  // Capítulo II
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('Capítulo II (11-50 trabajadores)');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Empleados', 'Riesgo I-II', 'Riesgo III', 'Riesgo IV-V'],
    ['15', '$416,000', '$528,000', '$848,000'],
    ['30', '$776,000', '$888,000', '$1,208,000'],
    ['50', '$1,256,000', '$1,368,000', '$1,688,000']
  ], [100, 110, 110, 110]);

  doc.moveDown(1);

  // Capítulo III
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('Capítulo III (51-200 trabajadores)');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Empleados', 'Riesgo I-II', 'Riesgo III', 'Riesgo IV-V'],
    ['75', '$1,706,000', '$1,818,000', '$2,138,000'],
    ['100', '$2,256,000', '$2,368,000', '$2,688,000'],
    ['150', '$3,356,000', '$3,468,000', '$3,788,000']
  ], [100, 110, 110, 110]);

  doc.moveDown(1.5);

  // 5. Comparativo con Competencia
  addSection(doc, '5. COMPARATIVO CON LA COMPETENCIA', primaryColor);

  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('Precios de Mercado');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Competidor', 'Segmento', 'Precio/mes', 'Portales'],
    ['Cuidamos.co', '3-5 emp', '$249,000', 'No'],
    ['Cuidamos.co', '6-10 emp', '$299,000', 'No'],
    ['Cuidamos.co', '11-15 emp', '$450,000', 'No'],
    ['Fasem', 'Base', '$328,000', 'No'],
    ['SST-Colombia', 'Variable', '$82,000 - $3,788,000', 'SÍ (2)']
  ], [120, 80, 130, 80]);

  doc.moveDown(1);

  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor(textColor)
     .text('Análisis Comparativo');
  doc.moveDown(0.5);
  
  drawTable(doc, [
    ['Escenario', 'SST-Colombia', 'Competencia', 'Ventaja'],
    ['5 emp, Riesgo I', '$186,000', '$249,000', '25% más económico'],
    ['10 emp, Riesgo I', '$316,000', '$299,000', 'Similar + 2 portales'],
    ['15 emp, Riesgo II', '$416,000', '$450,000', '7% más económico']
  ], [110, 90, 90, 130]);

  // Nueva página
  doc.addPage();

  // 6. Valor vs Consultor
  addSection(doc, '6. VALOR VS. CONSULTOR TRADICIONAL', primaryColor);
  
  drawTable(doc, [
    ['Servicio', 'Consultor Humano', 'SST-Colombia', 'Ahorro'],
    ['Gestión 61 estándares', '$2,400,000/mes', '$488,000/mes', '80%'],
    ['Costo por estándar', '$39,344', '$8,000', '80%'],
    ['Portal trabajadores', '+$150,000/mes', 'INCLUIDO', '100%'],
    ['Portal licenciado', '+$200,000/mes', 'INCLUIDO', '100%']
  ], [130, 110, 100, 70]);

  doc.moveDown(1.5);

  // 7. Lo que incluye
  addSection(doc, '7. LO QUE INCLUYE SST-COLOMBIA', primaryColor);
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(textColor);
  
  const modulos = [
    '• Cumplimiento Resolución 0312/2019 - Gestión automática de estándares según riesgo',
    '• ISO 45001:2018 - Auditorías internas y revisión por la dirección',
    '• Informes Ministerio de Trabajo - PDFs automáticos listos para auditoría',
    '• Estadísticas AT/EL - Indicadores de accidentalidad y enfermedad laboral',
    '• Ciclo PHVA automatizado - Plan-Do-Check-Act con seguimiento',
    '• Módulo PESV - Plan Estratégico de Seguridad Vial',
    '• COPASST/Vigía - Gestión de comités paritarios',
    '• Capacitaciones - Programación y seguimiento de formación',
    '• Alertas automáticas - Vencimientos, exámenes médicos, renovaciones',
    '• Trazabilidad 20 años - Cumplimiento normativo de retención documental'
  ];
  modulos.forEach(item => {
    doc.text(item);
    doc.moveDown(0.2);
  });

  doc.moveDown(1);

  // 8. Resumen
  addSection(doc, '8. RESUMEN DE LA PROPUESTA', primaryColor);
  
  drawTable(doc, [
    ['Concepto', 'Detalle'],
    ['Modelo de cobro', 'Por trabajador + Por estándar'],
    ['Tarifa trabajador', '$20,000 - $26,000 según volumen'],
    ['Tarifa estándar', '$8,000/estándar/mes'],
    ['Portal Trabajador', 'INCLUIDO SIN COSTO'],
    ['Portal Licenciado SST', 'INCLUIDO SIN COSTO'],
    ['Diferenciación', 'Único en Colombia con precio por riesgo'],
    ['Ventaja competitiva', '2 portales gratis + precio justo']
  ], [180, 280]);

  doc.moveDown(1.5);

  // 9. Recomendación
  addSection(doc, '9. RECOMENDACIÓN', primaryColor);
  
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(accentColor)
     .text('APROBAR el modelo de precios propuesto que:');
  doc.moveDown(0.5);
  
  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(textColor);
  const recomendaciones = [
    '✓ Mantiene tarifas por trabajador actuales',
    '✓ Agrega componente por estándares ($8,000/estándar)',
    '✓ Incluye Portal del Trabajador sin costo adicional',
    '✓ Incluye Portal del Licenciado SST sin costo adicional',
    '✓ Posiciona a SST-Colombia como líder en valor agregado'
  ];
  recomendaciones.forEach(item => {
    doc.text(item);
    doc.moveDown(0.2);
  });

  // Footer
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#d1d5db').lineWidth(1).stroke();
  doc.moveDown(0.5);
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('Elaborado por: Equipo SST-Colombia', { align: 'center' });
  doc.text('Fecha: Enero 2026 | Versión: 2.0', { align: 'center' });

  doc.end();
}

function addSection(doc: PDFKit.PDFDocument, title: string, color: string) {
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor(color)
     .text(title);
  doc.moveDown(0.5);
}

function drawTable(doc: PDFKit.PDFDocument, data: string[][], colWidths: number[]) {
  const startX = 50;
  let currentY = doc.y;
  const rowHeight = 20;
  const padding = 5;
  const headerBg = '#1e40af';
  const evenRowBg = '#f9fafb';

  data.forEach((row, rowIndex) => {
    let currentX = startX;
    
    // Draw row background
    if (rowIndex === 0) {
      doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fill(headerBg);
    } else if (rowIndex % 2 === 0) {
      doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fill(evenRowBg);
    }

    // Draw cells
    row.forEach((cell, colIndex) => {
      doc.fontSize(9)
         .font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .fillColor(rowIndex === 0 ? '#ffffff' : '#1f2937')
         .text(cell, currentX + padding, currentY + padding, {
           width: colWidths[colIndex] - padding * 2,
           height: rowHeight - padding * 2,
           align: 'left'
         });
      currentX += colWidths[colIndex];
    });

    currentY += rowHeight;
  });

  // Draw border
  doc.rect(startX, doc.y - (data.length * rowHeight), colWidths.reduce((a, b) => a + b, 0), data.length * rowHeight)
     .strokeColor('#d1d5db')
     .lineWidth(0.5)
     .stroke();

  doc.y = currentY + 5;
}
