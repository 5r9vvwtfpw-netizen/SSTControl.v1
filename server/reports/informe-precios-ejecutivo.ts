import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateInformePreciosEjecutivo(res: Response) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 60, bottom: 60, left: 60, right: 60 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Informe-Ejecutivo-Precios-SST-Colombia.pdf');
  doc.pipe(res);

  const primaryColor = '#1e3a5f';
  const accentColor = '#2d8659';
  const textColor = '#333333';
  const headerBg = '#1e3a5f';
  const lightBg = '#f5f5f5';
  const pageWidth = 612 - 120;

  // ===== PORTADA =====
  doc.rect(0, 0, 612, 792).fill('#1e3a5f');
  
  doc.fontSize(32)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text('INFORME EJECUTIVO', 60, 280, { align: 'center', width: pageWidth });
  
  doc.moveDown(0.5);
  doc.fontSize(18)
     .font('Helvetica')
     .text('Propuesta Comercial', { align: 'center', width: pageWidth });
  
  doc.moveDown(0.3);
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('SST-COLOMBIA', { align: 'center', width: pageWidth });
  
  doc.moveDown(2);
  doc.fontSize(14)
     .font('Helvetica')
     .text('Sistema Integral de Gestión de', { align: 'center', width: pageWidth });
  doc.text('Seguridad y Salud en el Trabajo', { align: 'center', width: pageWidth });
  
  doc.fontSize(12)
     .text('Enero 2026 | Versión 2.0', 60, 680, { align: 'center', width: pageWidth });

  // ===== PÁGINA 2: RESUMEN =====
  doc.addPage();
  addHeader(doc, 'RESUMEN EJECUTIVO', primaryColor);
  
  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica')
     .text('SST-Colombia presenta un modelo de precios innovador basado en la complejidad real del cumplimiento normativo, combinado con una propuesta de valor única en el mercado colombiano:', 60, doc.y + 10, { width: pageWidth });
  
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold')
     .fillColor(accentColor)
     .fontSize(12)
     .text('DOS PORTALES ESPECIALIZADOS INCLUIDOS SIN COSTO ADICIONAL', { align: 'center', width: pageWidth });

  doc.moveDown(1.5);
  addSectionTitle(doc, 'PROPUESTA DE VALOR ÚNICA', primaryColor);
  
  // Portal del Trabajador
  doc.moveDown(0.5);
  drawHighlightBox(doc, 60, doc.y, pageWidth, 120, accentColor, 'PORTAL DEL TRABAJADOR - INCLUIDO');
  doc.y += 25;
  doc.fontSize(10).fillColor(textColor).font('Helvetica');
  const items1 = [
    'Acceso 24/7 desde cualquier dispositivo',
    'Consulta de certificados y capacitaciones',
    'Reporte de condiciones inseguras',
    'Firma electrónica de documentos',
    'Cumplimiento Habeas Data (Ley 1581/2012)'
  ];
  items1.forEach(item => {
    doc.text('• ' + item, 75, doc.y, { width: pageWidth - 30 });
    doc.moveDown(0.3);
  });
  doc.fontSize(9).fillColor('#666666').text('Valor de mercado: $3,000 - $5,000/usuario/mes', 75);
  
  doc.y += 20;
  
  // Portal del Licenciado
  drawHighlightBox(doc, 60, doc.y, pageWidth, 110, accentColor, 'PORTAL DEL LICENCIADO SST - INCLUIDO');
  doc.y += 25;
  doc.fontSize(10).fillColor(textColor).font('Helvetica');
  const items2 = [
    'Gestión de múltiples empresas desde un solo dashboard',
    'Generación de informes consolidados',
    'Herramientas profesionales de productividad',
    'Acceso completo a todas las funcionalidades'
  ];
  items2.forEach(item => {
    doc.text('• ' + item, 75, doc.y, { width: pageWidth - 30 });
    doc.moveDown(0.3);
  });
  doc.fontSize(9).fillColor('#666666').text('Valor de mercado: $150,000 - $300,000/mes', 75);

  // ===== PÁGINA 3: MODELO DE PRECIOS =====
  doc.addPage();
  addHeader(doc, 'MODELO DE PRECIOS', primaryColor);
  
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor(textColor).font('Helvetica-Bold')
     .text('Fórmula de Cálculo:', 60, doc.y + 10);
  
  doc.moveDown(0.5);
  drawFormulaBox(doc, 60, doc.y, pageWidth);
  
  doc.y += 50;
  addSectionTitle(doc, 'Tarifa por Trabajador', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Capítulo', 'Empleados', 'Tarifa/Trabajador'],
    ['I', '1 - 10', '$26,000'],
    ['II', '11 - 50', '$24,000'],
    ['III', '51 - 200', '$22,000'],
    ['III+', '201+', '$20,000']
  ], [120, 150, 150], headerBg);

  doc.y += 20;
  addSectionTitle(doc, 'Tarifa por Estándar Normativo', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Nivel de Riesgo', 'Estándares', 'Costo Mensual'],
    ['Riesgo I - II', '7 estándares', '$56,000'],
    ['Riesgo III', '21 estándares', '$168,000'],
    ['Riesgo IV - V', '61 estándares', '$488,000']
  ], [150, 130, 140], headerBg);

  doc.y += 15;
  doc.fontSize(11).font('Helvetica-Bold').fillColor(accentColor)
     .text('Tarifa unitaria: $8,000 COP por estándar/mes', 60, doc.y, { align: 'center', width: pageWidth });

  // ===== PÁGINA 4: TABLAS DE PRECIOS =====
  doc.addPage();
  addHeader(doc, 'TABLA DE PRECIOS POR SEGMENTO', primaryColor);
  
  doc.moveDown(0.3);
  addSectionTitle(doc, 'Capítulo I (1-10 trabajadores)', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Empleados', 'Riesgo I-II', 'Riesgo III', 'Riesgo IV-V'],
    ['1', '$82,000', '$194,000', '$514,000'],
    ['5', '$186,000', '$298,000', '$618,000'],
    ['10', '$316,000', '$428,000', '$748,000']
  ], [110, 110, 110, 110], headerBg);

  doc.y += 15;
  addSectionTitle(doc, 'Capítulo II (11-50 trabajadores)', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Empleados', 'Riesgo I-II', 'Riesgo III', 'Riesgo IV-V'],
    ['15', '$416,000', '$528,000', '$848,000'],
    ['30', '$776,000', '$888,000', '$1,208,000'],
    ['50', '$1,256,000', '$1,368,000', '$1,688,000']
  ], [110, 110, 110, 110], headerBg);

  doc.y += 15;
  addSectionTitle(doc, 'Capítulo III (51-200 trabajadores)', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Empleados', 'Riesgo I-II', 'Riesgo III', 'Riesgo IV-V'],
    ['75', '$1,706,000', '$1,818,000', '$2,138,000'],
    ['100', '$2,256,000', '$2,368,000', '$2,688,000'],
    ['150', '$3,356,000', '$3,468,000', '$3,788,000']
  ], [110, 110, 110, 110], headerBg);

  // ===== PÁGINA 5: COMPARATIVO =====
  doc.addPage();
  addHeader(doc, 'ANÁLISIS COMPARATIVO', primaryColor);
  
  doc.moveDown(0.3);
  addSectionTitle(doc, 'Precios del Mercado Colombiano', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Competidor', 'Segmento', 'Precio/mes', 'Portales'],
    ['Cuidamos.co', '3-5 emp', '$249,000', 'No incluye'],
    ['Cuidamos.co', '6-10 emp', '$299,000', 'No incluye'],
    ['Cuidamos.co', '11-15 emp', '$450,000', 'No incluye'],
    ['Fasem', 'Base', '$328,000', 'No incluye'],
    ['SST-Colombia', 'Variable', '$82K - $3.7M', 'SÍ (2 gratis)']
  ], [120, 100, 110, 110], headerBg);

  doc.y += 15;
  addSectionTitle(doc, 'Ventaja Competitiva', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Escenario', 'SST-Colombia', 'Competencia', 'Ventaja'],
    ['5 emp, Riesgo I', '$186,000', '$249,000', '25% más económico'],
    ['10 emp, Riesgo I', '$316,000', '$299,000', 'Similar + 2 portales'],
    ['15 emp, Riesgo II', '$416,000', '$450,000', '7% más económico']
  ], [110, 100, 100, 130], headerBg);

  doc.y += 15;
  addSectionTitle(doc, 'Valor vs. Consultor Tradicional', primaryColor);
  doc.moveDown(0.3);
  
  drawSimpleTable(doc, 60, doc.y, [
    ['Servicio', 'Consultor', 'SST-Colombia', 'Ahorro'],
    ['Gestión 61 estándares', '$2,400,000/mes', '$488,000/mes', '80%'],
    ['Costo por estándar', '$39,344', '$8,000', '80%'],
    ['Portal trabajadores', '+$150,000/mes', 'INCLUIDO', '100%'],
    ['Portal licenciado', '+$200,000/mes', 'INCLUIDO', '100%']
  ], [130, 110, 100, 80], headerBg);

  // ===== PÁGINA 6: RESUMEN Y RECOMENDACIÓN =====
  doc.addPage();
  addHeader(doc, 'RESUMEN DE LA PROPUESTA', primaryColor);
  
  doc.moveDown(0.3);
  drawSimpleTable(doc, 60, doc.y, [
    ['Concepto', 'Detalle'],
    ['Modelo de cobro', 'Por trabajador + Por estándar'],
    ['Tarifa trabajador', '$20,000 - $26,000 según volumen'],
    ['Tarifa estándar', '$8,000/estándar/mes'],
    ['Portal Trabajador', 'INCLUIDO SIN COSTO'],
    ['Portal Licenciado SST', 'INCLUIDO SIN COSTO'],
    ['Diferenciación', 'Único en Colombia con precio por riesgo real'],
    ['Ventaja competitiva', '2 portales gratis + precio justo por complejidad']
  ], [200, 240], headerBg);

  doc.y += 30;
  addSectionTitle(doc, 'RECOMENDACIÓN', primaryColor);
  
  doc.moveDown(0.5);
  doc.rect(60, doc.y, pageWidth, 130).fill('#e8f5e9').stroke('#2d8659');
  
  doc.y += 15;
  doc.fontSize(14).font('Helvetica-Bold').fillColor(accentColor)
     .text('APROBAR el modelo de precios propuesto', 75, doc.y, { width: pageWidth - 30 });
  
  doc.moveDown(0.8);
  doc.fontSize(11).font('Helvetica').fillColor(textColor);
  const recomendaciones = [
    'Mantiene tarifas por trabajador actuales (innegociables)',
    'Agrega componente por estándares ($8,000/estándar)',
    'Incluye Portal del Trabajador sin costo adicional',
    'Incluye Portal del Licenciado SST sin costo adicional',
    'Posiciona a SST-Colombia como líder en valor agregado'
  ];
  recomendaciones.forEach(item => {
    doc.text('✓ ' + item, 75, doc.y, { width: pageWidth - 30 });
    doc.moveDown(0.4);
  });

  // Footer
  doc.y = 720;
  doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor('#cccccc').lineWidth(1).stroke();
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('#666666').font('Helvetica')
     .text('SST-Colombia | Informe Ejecutivo | Enero 2026 | Versión 2.0', 60, doc.y, { align: 'center', width: pageWidth });

  doc.end();
}

function addHeader(doc: PDFKit.PDFDocument, title: string, color: string) {
  const pageWidth = 612 - 120;
  doc.rect(0, 0, 612, 80).fill(color);
  doc.fontSize(20)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text(title, 60, 30, { width: pageWidth });
  doc.y = 100;
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string, color: string) {
  doc.fontSize(13)
     .font('Helvetica-Bold')
     .fillColor(color)
     .text(title, 60);
}

function drawHighlightBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, color: string, title: string) {
  doc.rect(x, y, width, height).fill('#f0f9f4').stroke(color);
  doc.rect(x, y, width, 20).fill(color);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff')
     .text(title, x + 10, y + 5, { width: width - 20 });
}

function drawFormulaBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number) {
  doc.rect(x, y, width, 35).fill('#e3f2fd').stroke('#1e3a5f');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a5f')
     .text('PRECIO = (Trabajadores × Tarifa) + (Estándares × $8,000)', x + 20, y + 10, { width: width - 40, align: 'center' });
}

function drawSimpleTable(doc: PDFKit.PDFDocument, x: number, y: number, data: string[][], colWidths: number[], headerColor: string) {
  const rowHeight = 22;
  const padding = 8;
  let currentY = y;

  data.forEach((row, rowIndex) => {
    let currentX = x;
    
    if (rowIndex === 0) {
      doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(headerColor);
    } else if (rowIndex % 2 === 0) {
      doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#f5f5f5');
    } else {
      doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#ffffff');
    }

    row.forEach((cell, colIndex) => {
      doc.fontSize(9)
         .font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .fillColor(rowIndex === 0 ? '#ffffff' : '#333333')
         .text(cell, currentX + padding, currentY + 6, {
           width: colWidths[colIndex] - padding * 2,
           height: rowHeight - 4,
           align: colIndex === 0 ? 'left' : 'center'
         });
      currentX += colWidths[colIndex];
    });

    currentY += rowHeight;
  });

  doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), data.length * rowHeight)
     .strokeColor('#cccccc').lineWidth(0.5).stroke();

  doc.y = currentY + 5;
}
