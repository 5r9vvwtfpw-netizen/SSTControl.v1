/**
 * Propuesta Comercial PDF — SST Colombia
 *
 * Genera un brochure profesional de una página para enviar a empresas potenciales.
 * Acepta parámetros editables desde el frontend.
 */

import PDFDocument from 'pdfkit';

const C = {
  GREEN_DARK:    '#1a3d2b',
  GREEN_MID:     '#1e7e34',
  GREEN_LIGHT:   '#d4edda',
  GREEN_ACCENT:  '#28a745',
  GOLD:          '#c9a84c',
  WHITE:         '#ffffff',
  GRAY_LIGHT:    '#f4f6f4',
  GRAY_TEXT:     '#444444',
  GRAY_SOFT:     '#888888',
  BLACK:         '#111111',
};

export interface PropuestaParams {
  web?: string;
  email?: string;
  whatsapp?: string;
  tagline?: string;
  empresa?: string;
  nit?: string;
  ciudad?: string;
  nombreProveedor?: string;
  nitProveedor?: string;
}

export async function generatePropuestaComercialPdf(params: PropuestaParams = {}): Promise<Buffer> {
  const web            = params.web            || 'www.sst-colombia.com.co';
  const email          = params.email          || 'contacto@sst-colombia.com.co';
  const whatsapp       = params.whatsapp       || '+57 300 000 0000';
  const tagline        = params.tagline        || 'Sin papeles, sin carpetas, sin hojas de cálculo. Todo automatizado y con trazabilidad completa.';
  const empresa        = params.empresa        || '';
  const nit            = params.nit            || '';
  const ciudad         = params.ciudad         || 'Bogotá D.C., Colombia';
  const nombreProveedor = params.nombreProveedor || 'SADGI S.A.S.';
  const nitProveedor   = params.nitProveedor   || '902.036.337-4';

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    bufferPages: true,
    info: {
      Title: 'Propuesta Comercial — SST Colombia',
      Author: nombreProveedor,
      Subject: 'Sistema Inteligente de Gestión SG-SST',
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));

  const W = doc.page.width;
  const H = doc.page.height;
  const M = 40;

  // ── 1. FONDO ─────────────────────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill(C.WHITE);

  // ── 2. FRANJA SUPERIOR ───────────────────────────────────────────────────────
  const headerH = empresa ? 185 : 170;
  doc.rect(0, 0, W, headerH).fill(C.GREEN_DARK);
  doc.rect(0, headerH - 4, W, 4).fill(C.GOLD);

  // Badge con bandera de Colombia dibujada
  const badgeW = 200;
  const badgeX = (W - badgeW) / 2;
  doc.roundedRect(badgeX, 18, badgeW, 22, 11).fill('rgba(255,255,255,0.12)');

  // Bandera Colombia: franjas horizontales (amarillo 50%, azul 25%, rojo 25%)
  const flagX = badgeX + 14;
  const flagY = 23;
  const flagW = 20;
  const flagH = 12;
  doc.rect(flagX, flagY, flagW, flagH * 0.5).fill('#FCD116');          // Amarillo
  doc.rect(flagX, flagY + flagH * 0.5, flagW, flagH * 0.25).fill('#003087'); // Azul
  doc.rect(flagX, flagY + flagH * 0.75, flagW, flagH * 0.25).fill('#CE1126'); // Rojo

  doc.fontSize(8).font('Helvetica').fillColor(C.WHITE)
     .text('Sistema Inteligente SST', badgeX + 38, 24, { width: badgeW - 42 });

  // Título
  doc.fontSize(28).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('Sistema de Gestión', M, 50, { width: W - M * 2, align: 'center' });
  doc.fontSize(28).font('Helvetica-Bold').fillColor(C.GOLD)
     .text('SG-SST Automatizado', M, 82, { width: W - M * 2, align: 'center' });

  doc.fontSize(9.5).font('Helvetica').fillColor('#b8d4c0')
     .text('Plataforma de cumplimiento normativo en Seguridad y Salud en el Trabajo', M, 118, {
       width: W - M * 2, align: 'center',
     });

  doc.fontSize(7.5).fillColor('#89a898')
     .text('Uso autorizado de símbolos patrios · Decreto 1967/1991, Art. 13', M, 138, {
       width: W - M * 2, align: 'center',
     });

  // Empresa destinataria (si se especificó)
  if (empresa) {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.GOLD)
       .text(`Propuesta para: ${empresa}${nit ? `  ·  NIT ${nit}` : ''}`, M, 155, {
         width: W - M * 2, align: 'center',
       });
  }

  // ── 3. BADGES NORMATIVOS ─────────────────────────────────────────────────────
  const badgeRowY = headerH + 12;
  const normas = ['Res. 0312/2019', 'Decreto 1072/2015', 'Res. 40595/2022 PESV', 'ISO 45001:2018', 'Ley 1581/2012'];
  const bW = 96, bH = 20;
  const totalBW = normas.length * bW + (normas.length - 1) * 6;
  let bx = (W - totalBW) / 2;
  for (const b of normas) {
    doc.roundedRect(bx, badgeRowY, bW, bH, 5).fill(C.GREEN_LIGHT);
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
       .text(b, bx, badgeRowY + 6, { width: bW, align: 'center' });
    bx += bW + 6;
  }

  // ── 4. TRES COLUMNAS ─────────────────────────────────────────────────────────
  const colY = badgeRowY + bH + 20;
  const colW = (W - M * 2 - 24) / 3;
  const cols = [
    {
      icon: '📋',
      title: 'Informe Ministerio\nde Trabajo',
      body: 'Autoevaluación SG-SST según Res. 0312/2019 con puntaje PHVA, valoración crítico/aceptable y detalle de los 62 estándares mínimos. Generado en PDF listo para presentar.',
      color: C.GREEN_DARK,
    },
    {
      icon: '🚗',
      title: 'Informe\nSupertransporte PESV',
      body: 'Plan Estratégico de Seguridad Vial (Res. 40595/2022) con 24 pasos P-H-V-A, cumplimiento por fase y trazabilidad bidireccional. PDF oficial para la Superintendencia.',
      color: C.GREEN_MID,
    },
    {
      icon: '👥',
      title: 'Portal del\nEmpleado',
      body: 'Los trabajadores consultan sus exámenes médicos, EPP, capacitaciones y reportan incidentes desde cualquier dispositivo, sin necesidad de instalar nada.',
      color: C.GOLD,
    },
  ];

  let cx = M;
  for (const col of cols) {
    const cardH = 148;
    doc.roundedRect(cx, colY, colW, cardH, 7).fill(C.GRAY_LIGHT);
    doc.rect(cx, colY, colW, 5).fill(col.color);
    doc.fontSize(20).fillColor(col.color)
       .text(col.icon, cx + 10, colY + 14, { width: colW - 20, align: 'center', lineBreak: false });
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.BLACK)
       .text(col.title, cx + 8, colY + 38, { width: colW - 16, align: 'center' });
    const textY = doc.y + 6;
    doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_TEXT)
       .text(col.body, cx + 10, textY, { width: colW - 20, align: 'justify' });
    cx += colW + 12;
  }

  // ── 5. TODO EN UN SOLO LUGAR ─────────────────────────────────────────────────
  const featY = colY + 165;
  doc.rect(0, featY, W, 195).fill(C.GREEN_DARK);
  doc.rect(0, featY, W, 3).fill(C.GOLD);

  doc.fontSize(14).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('Todo el SG-SST en un solo lugar', M, featY + 18, { width: W - M * 2, align: 'center' });
  doc.fontSize(8.5).font('Helvetica').fillColor('#b8d4c0')
     .text(tagline, M, featY + 38, { width: W - M * 2, align: 'center' });

  const features = [
    { icon: '✅', label: 'Ciclo PHVA completo' },
    { icon: '✅', label: 'Matriz de peligros e inspecciones' },
    { icon: '✅', label: 'Accidentalidad e incidentes' },
    { icon: '✅', label: 'Exámenes médicos ocupacionales' },
    { icon: '✅', label: 'Capacitaciones y cronograma anual' },
    { icon: '✅', label: 'COPASST y Comité de Convivencia' },
    { icon: '✅', label: 'Brigadas de emergencia' },
    { icon: '✅', label: 'Licenciado SST con firma digital' },
    { icon: '✅', label: 'Informes automáticos en PDF' },
    { icon: '✅', label: 'Multi-empresa y multi-sede' },
    { icon: '✅', label: 'Control de mantenimiento vehicular' },
    { icon: '✅', label: 'Objetivos e indicadores SST' },
  ];

  const fColW = (W - M * 2) / 3;
  let fi = 0;
  const fStartY = featY + 62;
  for (const f of features) {
    const row = Math.floor(fi / 3);
    const col2 = fi % 3;
    const fy = fStartY + row * 22;
    const fx = M + col2 * fColW;
    doc.fontSize(8).font('Helvetica').fillColor(C.GREEN_ACCENT)
       .text(f.icon, fx, fy, { width: 14, lineBreak: false });
    doc.fillColor(C.WHITE)
       .text(f.label, fx + 16, fy, { width: fColW - 20, lineBreak: false });
    fi++;
  }

  // ── 6. MÉTRICAS ───────────────────────────────────────────────────────────────
  const metricsY = featY + 195;
  const metrics = [
    { value: '100%', label: 'Cumplimiento\nRes. 0312/2019' },
    { value: 'ISO', label: '45001 · 31000\n39001' },
    { value: '24/7', label: 'Acceso desde\ncualquier dispositivo' },
    { value: '< 5 min', label: 'Generación de\ninformes PDF' },
  ];
  const mW = (W - M * 2) / metrics.length;
  doc.rect(0, metricsY, W, 70).fill(C.GRAY_LIGHT);
  doc.rect(0, metricsY, W, 2).fill(C.GOLD);
  for (let i = 0; i < metrics.length; i++) {
    const mx = M + i * mW;
    doc.fontSize(18).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
       .text(metrics[i].value, mx, metricsY + 10, { width: mW, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').fillColor(C.GRAY_TEXT)
       .text(metrics[i].label, mx, metricsY + 34, { width: mW, align: 'center' });
    if (i < metrics.length - 1) {
      doc.moveTo(M + (i + 1) * mW, metricsY + 10)
         .lineTo(M + (i + 1) * mW, metricsY + 58)
         .strokeColor('#cccccc').lineWidth(1).stroke();
    }
  }

  // ── 7. PIE ────────────────────────────────────────────────────────────────────
  const footerY = metricsY + 70;
  doc.rect(0, footerY, W, H - footerY).fill(C.GREEN_DARK);
  doc.rect(0, footerY, W, 3).fill(C.GOLD);

  doc.fontSize(13).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('¿Listo para cumplir y proteger a sus trabajadores?', M, footerY + 14, {
       width: W - M * 2, align: 'center',
     });
  doc.fontSize(9).font('Helvetica').fillColor('#b8d4c0')
     .text('Solicite una demostración gratuita o cotización personalizada', M, footerY + 34, {
       width: W - M * 2, align: 'center',
     });

  const contactY = footerY + 56;
  const contacts = [
    { label: 'Web', value: web },
    { label: 'Email', value: email },
    { label: 'WhatsApp', value: whatsapp },
  ];
  const cSpacing = (W - M * 2) / contacts.length;
  for (let i = 0; i < contacts.length; i++) {
    const cx2 = M + i * cSpacing;
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.GOLD)
       .text(contacts[i].label, cx2, contactY, { width: cSpacing, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(C.WHITE)
       .text(contacts[i].value, cx2, contactY + 12, { width: cSpacing, align: 'center' });
  }

  doc.fontSize(7).fillColor('#566d5d')
     .text(`${nombreProveedor} · NIT ${nitProveedor} · ${ciudad}`, M, footerY + 95, {
       width: W - M * 2, align: 'center',
     });

  doc.flushPages();
  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
