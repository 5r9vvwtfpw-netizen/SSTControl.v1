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
  contactName?: string;
  precioPorTrabajador?: string;
  // Paquete personalizado
  numTrabajadores?: string;
  nombreProfesional?: string;
  tarifaGestion?: string;
  tarifaAuditoria?: string;
  visitasMes?: string;
  horasPorVisita?: string;
  diasPrueba?: string;
}

export async function generatePropuestaComercialPdf(params: PropuestaParams = {}): Promise<Buffer> {
  const web            = params.web            || 'sst.sagisas.co';
  const email          = params.email          || 'legal@sst-colombia.com';
  const whatsapp       = params.whatsapp       || '+57 300 522 0679';
  const tagline        = params.tagline        || 'Ciclo PHVA completo con los 61 estandares de la Res. 0312/2019, PESV Supertransporte (Res. 40595/2022 — 24 pasos), examenes medicos ocupacionales, capacitaciones y cronograma anual, COPASST y Comite de Convivencia, brigadas de emergencia, accidentalidad e incidentes, matriz de peligros, inspecciones, matriz de riesgo automatica segun codigo CIIU, plan anual de trabajo automatizado, mantenimiento vehicular, objetivos e indicadores SST, y Licenciado SST con firma digital. Mas Portal del Empleado GRATIS, Asistente Virtual IA, soporte 24h y actualizaciones normativas automaticas — sin costo adicional.';
  const empresa        = params.empresa        || '';
  const nit            = params.nit            || '';
  const ciudad         = params.ciudad         || 'Medellín, Antioquia';
  const nombreProveedor    = params.nombreProveedor    || 'SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S';
  const nitProveedor       = params.nitProveedor       || '902.036.337-4';
  const contactName        = params.contactName        || 'Adriana Diaz';
  const precioPorTrabajador = params.precioPorTrabajador || '$10.000';

  // ── Datos del paquete personalizado ─────────────────────────────────────────
  const numTrabajadores   = parseInt(params.numTrabajadores   || '0', 10);
  const precioUnit        = parseInt(params.precioPorTrabajador || '0', 10) || 10000;
  const tarifaGestion     = parseInt(params.tarifaGestion     || '0', 10);
  const tarifaAuditoria   = parseInt(params.tarifaAuditoria   || '0', 10);
  const visitasMes        = parseInt(params.visitasMes        || '2', 10);
  const horasPorVisita    = params.horasPorVisita              || '3';
  const nombreProfesional = params.nombreProfesional           || '';
  const diasPrueba        = parseInt(params.diasPrueba         || '7', 10);
  const tienePersonalizada = !!(numTrabajadores > 0 || tarifaGestion > 0 || tarifaAuditoria > 0);

  const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });

  // Si hay propuesta personalizada, arranca en LETTER y pone la propuesta de primero.
  // El brochure genérico se agrega después como material de apoyo.
  const doc = new PDFDocument({
    size: tienePersonalizada ? 'LETTER' : 'A4',
    margin: 0,
    bufferPages: true,
    info: {
      Title: empresa ? `Propuesta Comercial — ${empresa}` : 'Propuesta Comercial — SST Colombia',
      Author: nombreProveedor,
      Subject: 'Sistema Inteligente de Gestión SG-SST',
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));

  // ── PROPUESTA PERSONALIZADA (Página 1 cuando hay empresa) ────────────────────
  if (tienePersonalizada) {
    const Q = { w: doc.page.width, h: doc.page.height, m: 44 };

    const licencia         = numTrabajadores * precioUnit;
    const totalProfesional = tarifaGestion + tarifaAuditoria;
    const totalMensual     = licencia + totalProfesional;

    // Hero verde
    const heroH = 150;
    doc.rect(0, 0, Q.w, heroH).fill(C.GREEN_DARK);
    doc.rect(0, heroH - 4, Q.w, 4).fill(C.GOLD);

    doc.fontSize(8).font('Helvetica').fillColor('#b8d4c0')
       .text('PROPUESTA COMERCIAL · SG-SST AUTOMATIZADO', 0, 18, { width: Q.w, align: 'center' });
    if (empresa) {
      doc.fontSize(10).font('Helvetica').fillColor(C.WHITE)
         .text('Presentada a:', 0, 36, { width: Q.w, align: 'center' });
      doc.fontSize(26).font('Helvetica-Bold').fillColor(C.GOLD)
         .text(empresa, Q.m, 52, { width: Q.w - Q.m * 2, align: 'center' });
      if (nit) {
        doc.fontSize(9).font('Helvetica').fillColor('#89a898')
           .text(`NIT ${nit}`, 0, 90, { width: Q.w, align: 'center' });
      }
    } else {
      doc.fontSize(22).font('Helvetica-Bold').fillColor(C.GOLD)
         .text('Propuesta Comercial', 0, 46, { width: Q.w, align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#b8d4c0')
         .text('Sistema de Gestión SG-SST Automatizado', 0, 80, { width: Q.w, align: 'center' });
    }
    const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fontSize(8).font('Helvetica').fillColor('#89a898')
       .text(`Fecha: ${dateStr}`, 0, heroH - 24, { width: Q.w, align: 'center' });

    // Mensaje principal
    let qy = heroH + 16;
    const mensajePrincipal = `Esta cotizacion incluye un periodo de prueba gratuito de ${diasPrueba} dias y garantiza el cumplimiento normativo segun lo expuesto en la reunion virtual. La propuesta comprende dos componentes independientes: la plataforma SaaS (Sadgi SAS) y el servicio de auditoria y gestion por parte del profesional en SST. Los pagos de ambos servicios se realizaran de manera independiente. Operamos bajo un modelo de colaboracion sin exclusividad.`;
    const msgH = 46;
    doc.rect(Q.m, qy, Q.w - Q.m * 2, msgH).fill('#f0f7f2');
    doc.rect(Q.m, qy, 4, msgH).fill(C.GOLD);
    doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_TEXT)
       .text(mensajePrincipal, Q.m + 14, qy + 8, { width: Q.w - Q.m * 2 - 22, lineGap: 1.5 });
    qy += msgH + 16;

    // Resumen de inversión
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
       .text('RESUMEN DE INVERSIÓN MENSUAL', Q.m, qy);
    doc.moveTo(Q.m, qy + 16).lineTo(Q.w - Q.m, qy + 16)
       .strokeColor(C.GREEN_DARK).lineWidth(1.5).stroke();
    qy += 26;

    const tableRows: { concepto: string; detalle: string; valor: number; color?: string }[] = [];
    if (licencia > 0) {
      tableRows.push({
        concepto: 'Licencia de Software SG-SST',
        detalle:  `${numTrabajadores} trabajadores × ${fmt(precioUnit)}/trabajador`,
        valor:    licencia,
        color:    C.GREEN_DARK,
      });
    }
    if (tarifaGestion > 0) {
      tableRows.push({
        concepto: 'Gestión y Administración SST',
        detalle:  nombreProfesional ? `Prof. aliado: ${nombreProfesional}` : 'Gestión mensual',
        valor:    tarifaGestion,
        color:    C.GREEN_MID,
      });
    }
    if (tarifaAuditoria > 0) {
      tableRows.push({
        concepto: 'Auditorías Presenciales',
        detalle:  `${visitasMes} visita${visitasMes !== 1 ? 's' : ''}/mes · ${horasPorVisita} h c/u${nombreProfesional ? ' · ' + nombreProfesional : ''}`,
        valor:    tarifaAuditoria,
        color:    C.GOLD,
      });
    }

    const rowH       = 40;
    const colCW      = 192;
    const colDW      = Q.w - Q.m * 2 - colCW - 100;
    const colVW      = 100;
    const colCX      = Q.m;
    const colDX      = Q.m + colCW;
    const colVX      = Q.w - Q.m - colVW;

    doc.rect(Q.m, qy, Q.w - Q.m * 2, 22).fill(C.GREEN_DARK);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.WHITE)
       .text('Concepto', colCX + 6, qy + 7, { width: colCW });
    doc.text('Detalle', colDX + 6, qy + 7, { width: colDW });
    doc.text('Valor Mensual', colVX, qy + 7, { width: colVW, align: 'right' });
    qy += 22;

    for (let i = 0; i < tableRows.length; i++) {
      const r = tableRows[i];
      doc.rect(Q.m, qy, Q.w - Q.m * 2, rowH).fill(i % 2 === 0 ? '#f8fdf9' : C.WHITE);
      doc.rect(Q.m, qy, 5, rowH).fill(r.color || C.GREEN_DARK);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(C.BLACK)
         .text(r.concepto, colCX + 12, qy + 7, { width: colCW - 14 });
      doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_TEXT)
         .text(r.detalle, colDX + 6, qy + 12, { width: colDW - 8 });
      doc.fontSize(12).font('Helvetica-Bold').fillColor(r.color || C.GREEN_DARK)
         .text(fmt(r.valor), colVX, qy + 10, { width: colVW, align: 'right' });
      doc.moveTo(Q.m, qy + rowH).lineTo(Q.w - Q.m, qy + rowH)
         .strokeColor('#e0e0e0').lineWidth(0.5).stroke();
      qy += rowH;
    }

    // Fila total
    doc.rect(Q.m, qy, Q.w - Q.m * 2, 36).fill(C.GREEN_DARK);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.WHITE)
       .text('TOTAL MENSUAL', colCX + 12, qy + 11, { width: colCW + colDW });
    doc.fontSize(18).font('Helvetica-Bold').fillColor(C.GOLD)
       .text(fmt(totalMensual) + ' COP', colVX - 40, qy + 8, { width: colVW + 40, align: 'right' });
    qy += 36;

    // Estructura de pago
    if (licencia > 0 && totalProfesional > 0) {
      qy += 18;
      const halfCW = (Q.w - Q.m * 2 - 12) / 2;
      const phaseCards = [
        {
          title: `FASE 1 — ${fmt(licencia)} COP`,
          sub:   `Pago a ${nombreProveedor.split(' ').slice(0, 2).join(' ')}`,
          items: [`Licencia software: ${numTrabajadores} trabajadores`, 'Portal empleados incluido', 'Soporte técnico 24/7'],
          color: C.GREEN_DARK,
        },
        {
          title: `FASE 2 — ${fmt(totalProfesional)} COP`,
          sub:   nombreProfesional ? `Pago a ${nombreProfesional}` : 'Pago al profesional SST',
          items: [
            tarifaGestion   > 0 ? `Gestión mensual: ${fmt(tarifaGestion)}`                         : null,
            tarifaAuditoria > 0 ? `Auditorías (${visitasMes}/mes · ${horasPorVisita}h): ${fmt(tarifaAuditoria)}` : null,
          ].filter(Boolean) as string[],
          color: C.GREEN_MID,
        },
      ];

      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
         .text('ESTRUCTURA DE PAGO', Q.m, qy);
      doc.moveTo(Q.m, qy + 14).lineTo(Q.w - Q.m, qy + 14)
         .strokeColor(C.GREEN_DARK).lineWidth(1).stroke();
      qy += 22;

      for (let pi = 0; pi < phaseCards.length; pi++) {
        const card  = phaseCards[pi];
        const cardX = Q.m + pi * (halfCW + 12);
        const cardH = 84;
        doc.rect(cardX, qy, halfCW, cardH).fill('#f0f7f2');
        doc.rect(cardX, qy, halfCW, 3).fill(card.color);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(card.color)
           .text(card.title, cardX + 10, qy + 12, { width: halfCW - 20 });
        doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_SOFT)
           .text(card.sub, cardX + 10, qy + 28, { width: halfCW - 20 });
        let iy = qy + 44;
        for (const item of card.items) {
          doc.circle(cardX + 14, iy + 4, 2.5).fill(card.color);
          doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_TEXT)
             .text(item, cardX + 22, iy, { width: halfCW - 30 });
          iy += 14;
        }
      }
      qy += 96;
    }

    // Prueba gratuita
    if (diasPrueba > 0) {
      doc.rect(Q.m, qy, Q.w - Q.m * 2, 38).fill('#f0f7f2');
      doc.rect(Q.m, qy, Q.w - Q.m * 2, 3).fill(C.GREEN_ACCENT);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
         .text(`✓  ${diasPrueba} días de prueba gratuita — sin tarjeta, sin compromiso, acceso completo`, Q.m + 16, qy + 13, { width: Q.w - Q.m * 2 - 32 });
      qy += 50;
    }

    // Footer página 1
    doc.rect(0, Q.h - 28, Q.w, 28).fill(C.GREEN_DARK);
    doc.rect(0, Q.h - 28, Q.w, 3).fill(C.GOLD);
    doc.fontSize(7.5).font('Helvetica').fillColor(C.GOLD)
       .text(`${nombreProveedor} · NIT ${nitProveedor} · ${web} · ${whatsapp}`, 0, Q.h - 17, { width: Q.w, align: 'center' });

  }

  // ── BROCHURE GENÉRICO (solo cuando NO hay propuesta personalizada) ─────────────
  if (!tienePersonalizada) {
  // Tamaño A4 ya está configurado desde el inicio cuando no hay personalizada
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
      label: 'MIN',
      title: 'Informe Ministerio\nde Trabajo',
      body: 'Autoevaluacion SG-SST segun Res. 0312/2019 con puntaje PHVA, valoracion critico/aceptable y detalle de los 61 estandares minimos. Generado en PDF listo para presentar.',
      color: C.GREEN_DARK,
    },
    {
      label: 'PESV',
      title: 'Informe\nSupertransporte PESV',
      body: 'Plan Estrategico de Seguridad Vial (Res. 40595/2022) con 24 pasos P-H-V-A, cumplimiento por fase y trazabilidad bidireccional. PDF oficial para la Superintendencia.',
      color: C.GREEN_MID,
    },
    {
      label: 'EMP',
      title: 'Portal del\nEmpleado',
      body: 'Los trabajadores consultan sus examenes medicos, EPP, capacitaciones y reportan incidentes desde cualquier dispositivo, sin necesidad de instalar nada.',
      color: C.GOLD,
    },
  ];

  let cx = M;
  for (const col of cols) {
    const cardH = 148;
    doc.roundedRect(cx, colY, colW, cardH, 7).fill(C.GRAY_LIGHT);
    doc.rect(cx, colY, colW, 5).fill(col.color);

    // Icono circular con iniciales
    const circR = 16;
    const circX = cx + colW / 2;
    const circY = colY + 22;
    doc.circle(circX, circY, circR).fill(col.color);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.WHITE)
       .text(col.label, circX - circR, circY - 5, { width: circR * 2, align: 'center' });

    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.BLACK)
       .text(col.title, cx + 8, colY + 44, { width: colW - 16, align: 'center' });
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
    'Ciclo PHVA completo',
    'Matriz de peligros e inspecciones',
    'Accidentalidad e incidentes',
    'Examenes medicos ocupacionales',
    'Capacitaciones y cronograma anual',
    'COPASST y Comite de Convivencia',
    'Brigadas de emergencia',
    'Licenciado SST con firma digital',
    'Informes automaticos en PDF',
    'Plan anual de trabajo automatizado',
    'Control de mantenimiento vehicular',
    'Objetivos e indicadores SST',
  ];

  const fColW = (W - M * 2) / 3;
  let fi = 0;
  const fStartY = featY + 62;
  for (const f of features) {
    const row = Math.floor(fi / 3);
    const col2 = fi % 3;
    const fy = fStartY + row * 22;
    const fx = M + col2 * fColW;
    // Punto verde como marcador
    doc.circle(fx + 4, fy + 4, 3).fill(C.GREEN_ACCENT);
    doc.fontSize(8).font('Helvetica').fillColor(C.WHITE)
       .text(f, fx + 12, fy, { width: fColW - 16, lineBreak: false });
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

  // ── PÁGINA 2: MUESTRA EVALUACIÓN INICIAL 0312/2019 ─────────────────────────
  doc.addPage({ size: 'LETTER', margin: 0 });
  const P = { w: doc.page.width, h: doc.page.height, m: 40 };

  doc.rect(0, 0, P.w, 55).fill(C.GREEN_DARK);
  doc.rect(0, 52, P.w, 3).fill(C.GOLD);
  doc.fontSize(8).font('Helvetica').fillColor(C.GOLD)
     .text('MUESTRA - DOCUMENTO DE EJEMPLO', P.m, 10, { width: P.w - P.m * 2, align: 'center' });
  doc.fontSize(14).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('Informe Evaluacion Inicial - Res. 0312/2019', P.m, 24, { width: P.w - P.m * 2, align: 'center' });

  let py = 68;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('EMPRESA:', P.m, py);
  doc.font('Helvetica').fillColor(C.GRAY_TEXT).text('Empresa Ejemplo S.A.S. · NIT 900.123.456-7 · Bogota D.C.', P.m + 68, py);
  py += 14;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('ACTIVIDAD:', P.m, py);
  doc.font('Helvetica').fillColor(C.GRAY_TEXT).text('Manufactura · CIIU 1011 · ARL Riesgo II', P.m + 68, py);
  py += 14;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('FECHA:', P.m, py);
  doc.font('Helvetica').fillColor(C.GRAY_TEXT).text('17 de Junio de 2026 · Codigo: EV-0312-2026-001', P.m + 68, py);

  py += 24;
  doc.rect(P.m, py, P.w - P.m * 2, 52).fill('#f0f7f2');
  doc.rect(P.m, py, 4, 52).fill(C.GREEN_ACCENT);
  doc.fontSize(34).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('78.5', P.m + 18, py + 7, { lineBreak: false });
  doc.fontSize(13).font('Helvetica').fillColor(C.GRAY_TEXT).text('/ 100 puntos', P.m + 80, py + 20, { lineBreak: false });
  doc.roundedRect(P.m + 196, py + 13, 88, 24, 5).fill(C.GREEN_ACCENT);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.WHITE).text('ACEPTABLE', P.m + 196, py + 19, { width: 88, align: 'center' });
  doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT)
     .text('Puntaje global segun Res. 0312/2019\n61 estandares minimos evaluados', P.m + 300, py + 12, { width: P.w - P.m - 308 });

  py += 66;
  const p2ColXs = [P.m, P.m + 110, P.m + 175, P.m + 245, P.m + 315, P.m + 385];
  const p2ColWs = [108, 63, 68, 68, 68, 80];
  const phvaRows = [
    { ciclo: 'PLANEAR', items: 6,  obtenido: 23.0, maximo: 25.0, color: '#1a5276' },
    { ciclo: 'HACER',   items: 40, obtenido: 35.0, maximo: 60.0, color: C.GREEN_MID },
    { ciclo: 'VERIFICAR', items: 10, obtenido: 12.5, maximo: 15.0, color: C.GOLD },
    { ciclo: 'ACTUAR',  items: 6,  obtenido: 8.0,  maximo: 10.0, color: '#e74c3c' },
  ];
  const p2Hdrs = ['Ciclo PHVA', 'Estandares', 'Obtenido', 'Maximo', 'Porcentaje', 'Valoracion'];
  doc.rect(P.m, py, P.w - P.m * 2, 20).fill(C.GREEN_DARK);
  p2Hdrs.forEach((h, i) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.WHITE).text(h, p2ColXs[i] + 4, py + 6, { width: p2ColWs[i] - 8 });
  });
  py += 20;
  for (const row of phvaRows) {
    const pct = Math.round((row.obtenido / row.maximo) * 100);
    const val = pct >= 86 ? 'Aceptable' : pct >= 61 ? 'Moderado' : 'Critico';
    const bg  = pct >= 86 ? '#d4edda' : pct >= 61 ? '#fff3cd' : '#f8d7da';
    doc.rect(P.m, py, P.w - P.m * 2, 22).fill(bg);
    doc.rect(P.m, py, 4, 22).fill(row.color);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.BLACK).text(row.ciclo, p2ColXs[0] + 8, py + 7);
    doc.font('Helvetica').fillColor(C.GRAY_TEXT);
    doc.text(String(row.items),              p2ColXs[1] + 4, py + 7, { width: p2ColWs[1] - 8 });
    doc.text(row.obtenido.toFixed(1),        p2ColXs[2] + 4, py + 7, { width: p2ColWs[2] - 8 });
    doc.text(row.maximo.toFixed(1),          p2ColXs[3] + 4, py + 7, { width: p2ColWs[3] - 8 });
    doc.text(`${pct}%`,                      p2ColXs[4] + 4, py + 7, { width: p2ColWs[4] - 8 });
    doc.font('Helvetica-Bold').fillColor(pct >= 86 ? '#1a5276' : pct >= 61 ? '#856404' : '#721c24')
       .text(val, p2ColXs[5] + 4, py + 7, { width: p2ColWs[5] - 8 });
    py += 22;
  }

  py += 16;
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('Detalle de Estandares (Muestra)', P.m, py);
  py += 14;

  const stds = [
    { cod: '1.1.1', desc: 'Responsable del SG-SST',            ciclo: 'P', obt: 0.5, max: 0.5, est: 'Cumple' },
    { cod: '1.1.2', desc: 'Responsabilidades en el SGSST',     ciclo: 'P', obt: 0.5, max: 0.5, est: 'Cumple' },
    { cod: '1.2.1', desc: 'Programa de Capacitacion',          ciclo: 'P', obt: 2.0, max: 2.0, est: 'Cumple' },
    { cod: '2.1.1', desc: 'Politica del SGSST firmada',        ciclo: 'P', obt: 1.0, max: 1.0, est: 'Cumple' },
    { cod: '3.1.1', desc: 'Evaluacion Medica Ocupacional',     ciclo: 'H', obt: 0.0, max: 1.0, est: 'No Cumple' },
    { cod: '4.1.1', desc: 'Indicadores de estructura',         ciclo: 'V', obt: 1.25, max: 1.25, est: 'Cumple' },
    { cod: '4.2.1', desc: 'Indicadores de proceso',            ciclo: 'V', obt: 1.0, max: 1.25, est: 'Parcial' },
    { cod: '5.1.1', desc: 'Acciones preventivas/correctivas',  ciclo: 'A', obt: 2.5, max: 2.5, est: 'Cumple' },
  ];
  const sColXs = [P.m, P.m + 50, P.m + 250, P.m + 300, P.m + 355, P.m + 410];
  const sColWs = [48, 198, 48, 53, 53, 75];
  const sHdrs = ['Codigo', 'Estandar Minimo', 'Ciclo', 'Obtenido', 'Maximo', 'Estado'];
  doc.rect(P.m, py, P.w - P.m * 2, 18).fill(C.GREEN_DARK);
  sHdrs.forEach((h, i) => {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.WHITE).text(h, sColXs[i] + 3, py + 5, { width: sColWs[i] - 6 });
  });
  py += 18;
  for (let i = 0; i < stds.length; i++) {
    const s = stds[i];
    doc.rect(P.m, py, P.w - P.m * 2, 18).fill(i % 2 === 0 ? '#f9f9f9' : '#ffffff');
    doc.fontSize(7.5).font('Helvetica').fillColor(C.GRAY_TEXT);
    doc.text(s.cod, sColXs[0] + 3, py + 5);
    doc.text(s.desc, sColXs[1] + 3, py + 5, { width: sColWs[1] - 6 });
    doc.text(s.ciclo, sColXs[2] + 3, py + 5, { width: sColWs[2] - 6, align: 'center' });
    doc.text(s.obt.toFixed(2), sColXs[3] + 3, py + 5, { width: sColWs[3] - 6, align: 'center' });
    doc.text(s.max.toFixed(2), sColXs[4] + 3, py + 5, { width: sColWs[4] - 6, align: 'center' });
    const ec = s.est === 'Cumple' ? '#28a745' : s.est === 'Parcial' ? '#fd7e14' : '#dc3545';
    doc.roundedRect(sColXs[5] + 3, py + 3, sColWs[5] - 6, 12, 3).fill(ec);
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.WHITE).text(s.est, sColXs[5] + 3, py + 5, { width: sColWs[5] - 6, align: 'center' });
    py += 18;
  }

  py += 10;
  doc.fontSize(7.5).font('Helvetica').fillColor('#888888')
     .text('* Documento de muestra. El informe real incluye los 61 estandares minimos completos con valoracion critico/aceptable, trazabilidad al ciclo PHVA y firma digital del Licenciado SST.', P.m, py, { width: P.w - P.m * 2 });
  doc.rect(0, P.h - 28, P.w, 28).fill(C.GREEN_DARK);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.GOLD)
     .text('MUESTRA · SG-SST Automatizado · https://sst.sagisas.co/', 0, P.h - 17, { width: P.w, align: 'center' });

  // ── PÁGINA 3: MUESTRA AUTOEVALUACIÓN PESV ───────────────────────────────────
  doc.addPage({ size: 'LETTER', margin: 0 });

  doc.rect(0, 0, P.w, 55).fill(C.GREEN_DARK);
  doc.rect(0, 52, P.w, 3).fill(C.GOLD);
  doc.fontSize(8).font('Helvetica').fillColor(C.GOLD)
     .text('MUESTRA - DOCUMENTO DE EJEMPLO', P.m, 10, { width: P.w - P.m * 2, align: 'center' });
  doc.fontSize(14).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('Autoevaluacion PESV - Res. 40595/2022', P.m, 24, { width: P.w - P.m * 2, align: 'center' });

  py = 68;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('EMPRESA:', P.m, py);
  doc.font('Helvetica').fillColor(C.GRAY_TEXT).text('Empresa Ejemplo S.A.S. · NIT 900.123.456-7', P.m + 68, py);
  py += 14;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('NIVEL:', P.m, py);
  doc.font('Helvetica').fillColor(C.GRAY_TEXT).text('Basico (hasta 10 vehiculos) · Ano 2026', P.m + 68, py);
  py += 14;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('CODIGO:', P.m, py);
  doc.font('Helvetica').fillColor(C.GRAY_TEXT).text('PESV-EVAL-2026-001 · Superintendencia de Transporte', P.m + 68, py);

  py += 24;
  doc.rect(P.m, py, P.w - P.m * 2, 52).fill('#f0f7f2');
  doc.rect(P.m, py, 4, 52).fill(C.GOLD);
  doc.fontSize(34).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('68%', P.m + 18, py + 7, { lineBreak: false });
  doc.fontSize(13).font('Helvetica').fillColor(C.GRAY_TEXT).text('Cumplimiento Global PESV', P.m + 85, py + 10, { lineBreak: false });
  doc.roundedRect(P.m + 85, py + 28, 148, 16, 4).fill('#fff3cd');
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#856404')
     .text('EN PROCESO DE IMPLEMENTACION', P.m + 85, py + 31, { width: 148, align: 'center' });
  doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT)
     .text('24 pasos evaluados\nP01-P08, H01-H11, V01-V03, A01-A02', P.m + 255, py + 10, { width: P.w - P.m - 263 });

  py += 64;
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('Avance por Fase PHVA', P.m, py);
  py += 16;

  const phases = [
    { name: 'PLANEAR (P01-P08)',    pct: 85, color: C.GREEN_DARK, count: '7/8 criterios' },
    { name: 'HACER   (H01-H11)',    pct: 55, color: C.GREEN_MID,  count: '6/11 criterios' },
    { name: 'VERIFICAR (V01-V03)',  pct: 67, color: C.GOLD,       count: '2/3 criterios' },
    { name: 'ACTUAR  (A01-A02)',    pct: 50, color: '#e67e22',    count: '1/2 criterios' },
  ];
  const barW = P.w - P.m * 2 - 188;
  for (const ph of phases) {
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.BLACK).text(ph.name, P.m, py + 3, { width: 162 });
    doc.rect(P.m + 166, py, barW, 16).fill('#e0e0e0');
    const filled = Math.floor(barW * ph.pct / 100);
    doc.rect(P.m + 166, py, filled, 16).fill(ph.color);
    if (filled > 30) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor(C.WHITE)
         .text(`${ph.pct}%`, P.m + 166 + filled - 30, py + 4, { width: 28, align: 'center' });
    }
    doc.fontSize(7.5).font('Helvetica').fillColor(C.GRAY_TEXT).text(ph.count, P.m + 166 + barW + 8, py + 4);
    py += 26;
  }

  py += 10;
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text('Detalle de Criterios PESV (Muestra)', P.m, py);
  py += 14;

  const criterios = [
    { paso: 'P01', desc: 'Conformacion del Comite de Seguridad Vial', fase: 'Planear',    est: 'Cumple',     obs: 'Acta vigente' },
    { paso: 'P02', desc: 'Diagnostico inicial de seguridad vial',      fase: 'Planear',    est: 'Cumple',     obs: 'Informe diagnostico 2026' },
    { paso: 'P03', desc: 'Politica de Seguridad Vial firmada',         fase: 'Planear',    est: 'Cumple',     obs: 'Publicada en carteleras' },
    { paso: 'H01', desc: 'Comportamiento humano - inducciones',        fase: 'Hacer',      est: 'En proceso', obs: '60% de conductores capacitados' },
    { paso: 'H05', desc: 'Mantenimiento preventivo vehicular',         fase: 'Hacer',      est: 'No cumple',  obs: 'Falta cronograma 2026' },
    { paso: 'H09', desc: 'Control de velocidades y distancias',        fase: 'Hacer',      est: 'Cumple',     obs: 'Registros GPS activos' },
    { paso: 'V01', desc: 'Indicadores de gestion vial',                fase: 'Verificar',  est: 'Cumple',     obs: 'Dashboard actualizado' },
    { paso: 'A01', desc: 'Plan de mejora y acciones correctivas',      fase: 'Actuar',     est: 'En proceso', obs: 'Acciones pendientes Q3-2026' },
  ];
  const cColXs3 = [P.m, P.m + 42, P.m + 232, P.m + 300, P.m + 370, P.m + 440]; // removed last col
  const cColWs3 = [40, 188, 66, 68, 68, P.w - P.m - 440];
  const cHdrs3  = ['Paso', 'Criterio PESV', 'Fase', 'Estado', 'Observacion'];
  doc.rect(P.m, py, P.w - P.m * 2, 18).fill(C.GREEN_DARK);
  ['Paso', 'Criterio PESV', 'Fase', 'Estado', 'Observacion'].forEach((h, i) => {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.WHITE)
       .text(h, cColXs3[i] + 3, py + 5, { width: cColWs3[i] - 6 });
  });
  py += 18;
  for (let i = 0; i < criterios.length; i++) {
    const c = criterios[i];
    const rowH = 22;
    doc.rect(P.m, py, P.w - P.m * 2, rowH).fill(i % 2 === 0 ? '#f9f9f9' : '#ffffff');
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.GREEN_DARK).text(c.paso, cColXs3[0] + 3, py + 7, { width: cColWs3[0] - 6 });
    doc.font('Helvetica').fillColor(C.GRAY_TEXT);
    doc.text(c.desc, cColXs3[1] + 3, py + 7, { width: cColWs3[1] - 6 });
    doc.text(c.fase, cColXs3[2] + 3, py + 7, { width: cColWs3[2] - 6 });
    const ec = c.est === 'Cumple' ? '#28a745' : c.est === 'En proceso' ? '#fd7e14' : '#dc3545';
    doc.roundedRect(cColXs3[3] + 3, py + 5, cColWs3[3] - 6, 13, 3).fill(ec);
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.WHITE).text(c.est, cColXs3[3] + 3, py + 7, { width: cColWs3[3] - 6, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').fillColor(C.GRAY_TEXT).text(c.obs, cColXs3[4] + 3, py + 7, { width: cColWs3[4] - 6 });
    py += rowH;
  }

  py += 10;
  doc.fontSize(7.5).font('Helvetica').fillColor('#888888')
     .text('* Documento de muestra. El informe real incluye los 24 pasos completos del PESV con trazabilidad bidireccional, carga de evidencias, nivel de complejidad automatico y PDF oficial para la Superintendencia de Transporte.', P.m, py, { width: P.w - P.m * 2 });
  doc.rect(0, P.h - 28, P.w, 28).fill(C.GREEN_DARK);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.GOLD)
     .text('MUESTRA · SG-SST Automatizado · https://sst.sagisas.co/', 0, P.h - 17, { width: P.w, align: 'center' });

  // ── PÁGINA 4: PRECIO DE SUSCRIPCIÓN ─────────────────────────────────────────
  doc.addPage({ size: 'LETTER', margin: 0 });

  // Bloque hero de precio
  const priceHeroH = 210;
  doc.rect(0, 0, P.w, priceHeroH).fill(C.GREEN_DARK);
  doc.rect(0, priceHeroH - 4, P.w, 4).fill(C.GOLD);

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#b8d4c0')
     .text('PRECIO DE SUSCRIPCION', 0, 28, { width: P.w, align: 'center' });
  doc.fontSize(64).font('Helvetica-Bold').fillColor(C.WHITE)
     .text(precioPorTrabajador, 0, 48, { width: P.w, align: 'center', lineBreak: false });
  doc.fontSize(22).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('COP por trabajador / mes', 0, 124, { width: P.w, align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#b8d4c0')
     .text('El precio se ajusta automaticamente al numero real de trabajadores activos registrados en el sistema', P.m, 158, { width: P.w - P.m * 2, align: 'center' });

  // Barra "TODO INCLUIDO"
  const barY = priceHeroH;
  doc.rect(0, barY, P.w, 28).fill(C.GREEN_MID);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('TODO INCLUIDO EN UN SOLO PRECIO POR TRABAJADOR', P.m, barY + 9, { width: P.w - P.m * 2 });

  // Columnas de beneficios
  const benefY = barY + 42;
  const halfW  = (P.w - P.m * 2) / 2 - 10;
  const leftX  = P.m;
  const rightX = P.m + halfW + 20;

  const leftBenef = [
    'Acceso completo a todos los modulos SST (PHVA + 61 estandares Res. 0312/2019)',
    'Portal del empleado GRATIS e ilimitado para todos los trabajadores',
    'Actualizaciones normativas automaticas ante cambios de regulacion',
    'Soporte tecnico dedicado con chat en tiempo real',
  ];
  const rightBenef = [
    'Modulo PESV completo (Res. 40595/2022) con gestion vehicular y GPS',
    'Portal del Profesional SST/LSO incluido sin costo adicional',
    'Almacenamiento ilimitado de documentos en la nube (AWS S3)',
    'Infraestructura AWS | Cifrado AES-256 | Respaldos automaticos | Alta disponibilidad',
  ];

  let bly = benefY;
  for (const b of leftBenef) {
    doc.circle(leftX + 5, bly + 5, 3).fill(C.GREEN_ACCENT);
    const before = doc.y;
    doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT)
       .text(b, leftX + 14, bly, { width: halfW - 16 });
    bly = doc.y + 6;
  }

  let bry = benefY;
  for (const b of rightBenef) {
    doc.circle(rightX + 5, bry + 5, 3).fill(C.GREEN_ACCENT);
    doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT)
       .text(b, rightX + 14, bry, { width: halfW - 16 });
    bry = doc.y + 6;
  }

  // Dos tarjetas inferiores
  const cardTopY = Math.max(bly, bry) + 20;
  const cardW    = (P.w - P.m * 2 - 16) / 2;
  const cardH    = 110;

  // Tarjeta izquierda: Prueba gratuita
  doc.rect(leftX, cardTopY, cardW, cardH).fill('#f0f7f2');
  doc.rect(leftX, cardTopY, cardW, 3).fill(C.GREEN_ACCENT);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
     .text('PRUEBA GRATUITA 7 DIAS', leftX, cardTopY + 14, { width: cardW, align: 'center' });
  const trialItems = ['Sin tarjeta de credito', 'Sin compromiso de permanencia', 'Acceso completo a todos los modulos'];
  let ty = cardTopY + 32;
  for (const t of trialItems) {
    doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT).text(t, leftX, ty, { width: cardW, align: 'center' });
    ty += 14;
  }
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.GREEN_MID)
     .text(web, leftX, ty + 4, { width: cardW, align: 'center' });

  // Tarjeta derecha: Contáctenos
  const rightCardX = leftX + cardW + 16;
  doc.rect(rightCardX, cardTopY, cardW, cardH).fill('#f0f7f2');
  doc.rect(rightCardX, cardTopY, cardW, 3).fill(C.GOLD);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
     .text('CONTACTENOS HOY', rightCardX, cardTopY + 14, { width: cardW, align: 'center' });
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.BLACK)
     .text(contactName, rightCardX, cardTopY + 32, { width: cardW, align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor(C.GRAY_TEXT)
     .text(`Tel. ${whatsapp}`, rightCardX, cardTopY + 50, { width: cardW, align: 'center' });
  doc.text(email, rightCardX, cardTopY + 66, { width: cardW, align: 'center' });

  // Footer
  doc.rect(0, P.h - 28, P.w, 28).fill(C.GREEN_DARK);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.GOLD)
     .text(`${nombreProveedor} · NIT ${nitProveedor} · ${ciudad}`, 0, P.h - 17, { width: P.w, align: 'center' });

  // ── PÁGINA 5: TARIFA PROFESIONAL SST ────────────────────────────────────────
  doc.addPage({ size: 'LETTER', margin: 0 });

  // Franja superior verde oscuro
  const tarifaHeroH = 130;
  doc.rect(0, 0, P.w, tarifaHeroH).fill(C.GREEN_DARK);
  doc.rect(0, tarifaHeroH - 4, P.w, 4).fill(C.GOLD);

  doc.fontSize(10).font('Helvetica').fillColor('#b8d4c0')
     .text('ESTRUCTURA DE PRECIOS · SG-SST AUTOMATIZADO', 0, 22, { width: P.w, align: 'center' });

  doc.fontSize(34).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('Tarifa Profesional SST', 0, 44, { width: P.w, align: 'center' });

  doc.fontSize(10).font('Helvetica').fillColor('#b8d4c0')
     .text('Basada en el Nivel de Riesgo ARL · Clasificacion segun actividad economica CIIU', P.m, 92, {
       width: P.w - P.m * 2, align: 'center',
     });

  // Tabla de tarifas por nivel ARL
  const tarifaRows = [
    { nivel: 'Nivel I — Bajo',       sectores: 'Oficinas, comercio, servicios financieros',            tarifa: '$150.000', color: '#28a745' },
    { nivel: 'Nivel II — Medio',     sectores: 'Manufactura ligera, salud, educacion',                 tarifa: '$250.000', color: '#5dade2' },
    { nivel: 'Nivel III — Medio-Alto', sectores: 'Industria, transporte, construccion menor',          tarifa: '$350.000', color: C.GOLD },
    { nivel: 'Nivel IV — Alto',      sectores: 'Construccion, mineria superficial, quimicos',          tarifa: '$450.000', color: '#e67e22' },
    { nivel: 'Nivel V — Muy Alto',   sectores: 'Mineria subterranea, explosivos, alturas',             tarifa: '$550.000', color: '#e74c3c' },
  ];

  const tStartY = tarifaHeroH + 28;
  const tColX0 = P.m;        // Nivel de Riesgo
  const tColX1 = P.m + 178;  // Sectores
  const tColX2 = P.w - P.m - 108; // Tarifa Mensual
  const tColW0 = 174;
  const tColW1 = tColX2 - tColX1 - 8;
  const tColW2 = 108;
  const tRowH = 44;

  // Cabecera de la tabla
  doc.rect(tColX0, tStartY, P.w - P.m * 2, 26).fill(C.GREEN_DARK);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.WHITE)
     .text('Nivel de Riesgo ARL', tColX0 + 8, tStartY + 8, { width: tColW0 });
  doc.text('Sectores Representativos', tColX1 + 8, tStartY + 8, { width: tColW1 });
  doc.text('Tarifa Mensual', tColX2, tStartY + 8, { width: tColW2, align: 'right' });

  let ty2 = tStartY + 26;
  for (let i = 0; i < tarifaRows.length; i++) {
    const r = tarifaRows[i];
    const bg = i % 2 === 0 ? '#f8fdf9' : C.WHITE;
    doc.rect(tColX0, ty2, P.w - P.m * 2, tRowH).fill(bg);
    // Franja de color izquierda según nivel
    doc.rect(tColX0, ty2, 5, tRowH).fill(r.color);
    // Texto nivel
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.BLACK)
       .text(r.nivel, tColX0 + 14, ty2 + 14, { width: tColW0 - 16 });
    // Sectores
    doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT)
       .text(r.sectores, tColX1 + 8, ty2 + 14, { width: tColW1 });
    // Tarifa
    doc.fontSize(14).font('Helvetica-Bold').fillColor(r.color)
       .text(`${r.tarifa} COP`, tColX2, ty2 + 12, { width: tColW2, align: 'right' });
    // Separador
    doc.moveTo(tColX0, ty2 + tRowH).lineTo(P.w - P.m, ty2 + tRowH)
       .strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    ty2 += tRowH;
  }

  // Nota informativa
  const notaY = ty2 + 20;
  doc.rect(P.m, notaY, P.w - P.m * 2, 52).fill('#f0f7f2');
  doc.rect(P.m, notaY, P.w - P.m * 2, 3).fill(C.GREEN_ACCENT);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
     .text('Tarifa mensual fija por empresa · Sin cobro por trabajador adicional', P.m + 16, notaY + 10, { width: P.w - P.m * 2 - 32 });
  doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_TEXT)
     .text('El nivel de riesgo ARL se determina automaticamente por el sistema segun el codigo CIIU registrado. La tarifa aplica para acceso completo a todos los modulos: SST, PESV, Portal del Empleado, Monitoreo GPS y Licenciado SST.',
       P.m + 16, notaY + 24, { width: P.w - P.m * 2 - 32 });

  // Dos columnas de cierre: Prueba + Contacto
  const closeCardY = notaY + 72;
  const closeCardW = (P.w - P.m * 2 - 16) / 2;
  const closeCardH = 96;

  doc.rect(P.m, closeCardY, closeCardW, closeCardH).fill('#f0f7f2');
  doc.rect(P.m, closeCardY, closeCardW, 3).fill(C.GREEN_ACCENT);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
     .text('PRUEBA GRATUITA 7 DIAS', P.m, closeCardY + 12, { width: closeCardW, align: 'center' });
  doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_TEXT)
     .text('Sin tarjeta de credito\nSin compromiso de permanencia\nAcceso completo a todos los modulos', P.m, closeCardY + 30, { width: closeCardW, align: 'center' });
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.GREEN_MID)
     .text(web, P.m, closeCardY + 74, { width: closeCardW, align: 'center' });

  const closeCardX2 = P.m + closeCardW + 16;
  doc.rect(closeCardX2, closeCardY, closeCardW, closeCardH).fill('#f0f7f2');
  doc.rect(closeCardX2, closeCardY, closeCardW, 3).fill(C.GOLD);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.GREEN_DARK)
     .text('CONTACTENOS HOY', closeCardX2, closeCardY + 12, { width: closeCardW, align: 'center' });
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.BLACK)
     .text(contactName, closeCardX2, closeCardY + 30, { width: closeCardW, align: 'center' });
  doc.fontSize(8.5).font('Helvetica').fillColor(C.GRAY_TEXT)
     .text(`WhatsApp: ${whatsapp}`, closeCardX2, closeCardY + 48, { width: closeCardW, align: 'center' });
  doc.text(email, closeCardX2, closeCardY + 62, { width: closeCardW, align: 'center' });

  // Footer
  doc.rect(0, P.h - 28, P.w, 28).fill(C.GREEN_DARK);
  doc.fontSize(7.5).font('Helvetica').fillColor(C.GOLD)
     .text(`${nombreProveedor} · NIT ${nitProveedor} · ${ciudad}`, 0, P.h - 17, { width: P.w, align: 'center' });

  } // fin if (!tienePersonalizada)

  doc.flushPages();
  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
