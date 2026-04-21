/**
 * PDF Organigrama SG-SST
 *
 * Genera el PDF del organigrama del Sistema de Gestión de Seguridad y Salud en el Trabajo.
 * Sigue el formato corporativo estandarizado (ISO 45001:2018 / Resolución 0312/2019).
 *
 * Código de documento: ORG-SST-001
 * Base legal: Decreto 1072/2015 Art. 2.2.4.6.8
 *
 * Secciones:
 * 1. Alta Dirección — Representante Legal
 * 2. Responsable / Coordinador SST
 * 3. COPASST o Vigía SST (con miembros)
 * 4. Comité de Convivencia Laboral
 * 5. Brigadas de Emergencia
 * 6. Trabajadores
 * 7. Marco normativo aplicable
 */

import PDFDocument from 'pdfkit';
import { db } from '../db';
import {
  companies,
  users,
  copasstPeriodos,
  copasstMiembros,
  brigadasEmergencia,
  responsibleDesignations,
  workers,
} from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';
import {
  PDF_COLORS,
  PDF_CONFIG,
  addStandardHeader,
  addSectionBar,
  addSimpleTable,
  addSignatureFooter,
  addProviderContactFooter,
  checkPageBreak,
  formatDate,
  getSignersForCompany,
  loadCompanyLogo,
} from './pdf-standardizer';

export interface GenerateOrganigramaPdfOptions {
  companyId: string;
}

/**
 * Genera el PDF del Organigrama SG-SST
 */
export async function generateOrganigramaPdf(
  options: GenerateOrganigramaPdfOptions,
): Promise<Buffer> {
  const { companyId } = options;

  // ── 1. Obtener empresa ────────────────────────────────────────────────────
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) throw new Error('Empresa no encontrada');

  // ── 2. Obtener datos en paralelo ──────────────────────────────────────────
  const [
    responsableSstUser,
    formalDesignation,
    periodoActivo,
    brigadasList,
    totalWorkers,
  ] = await Promise.all([
    // Responsable SST interno
    db
      .select()
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.role, 'responsable_sst')))
      .limit(1)
      .then((r) => r[0] ?? null),

    // Designación formal (puede ser LSO externo)
    db
      .select()
      .from(responsibleDesignations)
      .where(eq(responsibleDesignations.companyId, companyId))
      .orderBy(responsibleDesignations.createdAt)
      .limit(1)
      .then((r) => r[0] ?? null),

    // Período activo COPASST
    db
      .select()
      .from(copasstPeriodos)
      .where(and(eq(copasstPeriodos.companyId, companyId), eq(copasstPeriodos.estado, 'activo')))
      .limit(1)
      .then((r) => r[0] ?? null),

    // Brigadas de emergencia
    db.select().from(brigadasEmergencia).where(eq(brigadasEmergencia.companyId, companyId)),

    // Total trabajadores
    db
      .select({ value: count() })
      .from(workers)
      .where(eq(workers.companyId, companyId))
      .then((r) => r[0]?.value ?? 0),
  ]);

  // Miembros COPASST del período activo — join con workers para obtener nombres
  let miembrosConNombre: Array<{
    id: string;
    tipoRepresentante: string;
    rolMiembro: string;
    cargo: string | null;
    nombreTrabajador: string;
  }> = [];

  if (periodoActivo) {
    const rawMiembros = await db
      .select()
      .from(copasstMiembros)
      .where(eq(copasstMiembros.periodoId, periodoActivo.id));

    if (rawMiembros.length > 0) {
      const { inArray: inArrayFn } = await import('drizzle-orm');
      const workerIds = rawMiembros.map((m) => m.workerId);
      const workersList = await db
        .select({ id: workers.id, name: workers.name })
        .from(workers)
        .where(inArrayFn(workers.id, workerIds));
      const workerMap = new Map(workersList.map((w) => [w.id, w.name ?? 'N/A']));

      miembrosConNombre = rawMiembros.map((m) => ({
        id: m.id,
        tipoRepresentante: m.tipoRepresentante,
        rolMiembro: m.rolMiembro,
        cargo: m.cargo ?? null,
        nombreTrabajador: workerMap.get(m.workerId) ?? 'N/A',
      }));
    }
  }

  const numWorkers = Number(totalWorkers);
  const tieneVigia = periodoActivo?.tipoComite === 'vigia' || (numWorkers > 0 && numWorkers < 10);

  // Nombre del responsable SST
  const responsableSstName =
    formalDesignation?.externalLsoName ||
    formalDesignation?.licenciaSstTitular ||
    responsableSstUser?.fullName ||
    responsableSstUser?.username ||
    null;

  // Logo de la empresa
  const logoBuffer = await loadCompanyLogo(company.logoUrl ?? null);

  // Firmantes
  const signers = await getSignersForCompany(companyId, true);

  // ── 3. Crear documento PDF ────────────────────────────────────────────────
  const doc = new PDFDocument({ margin: PDF_CONFIG.MARGIN, size: PDF_CONFIG.PAGE_SIZE });
  const buffers: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => buffers.push(chunk));

  // Encabezado estándar
  await addStandardHeader({
    doc,
    company: {
      id: company.id,
      name: company.name,
      nit: company.nit,
      address: company.address ?? null,
      logoUrl: company.logoUrl ?? null,
    },
    documentTitle: 'ORGANIGRAMA DEL SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO',
    documentCode: 'ORG-SST-001',
    version: '1.0',
    date: new Date(),
    logoBuffer,
  });

  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;

  // ── Sección 1: Alta Dirección ─────────────────────────────────────────────
  let y = addSectionBar(doc, '1. ALTA DIRECCIÓN — REPRESENTANTE LEGAL');

  doc.fontSize(9).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  y = addInfoRow(doc, 'Empresa', company.name, margin, y, contentWidth);
  y = addInfoRow(doc, 'NIT', company.nit, margin, y, contentWidth);
  y = addInfoRow(
    doc,
    'Representante Legal',
    company.legalRepName ?? 'No registrado',
    margin,
    y,
    contentWidth,
  );
  if (company.address) {
    y = addInfoRow(doc, 'Dirección', company.address, margin, y, contentWidth);
  }
  y = addInfoRow(
    doc,
    'Base legal',
    'Decreto 1072/2015 Art. 2.2.4.6.8 — Obligaciones del empleador en el SG-SST',
    margin,
    y,
    contentWidth,
  );
  doc.y = y + 8;

  // ── Sección 2: Responsable SST ────────────────────────────────────────────
  y = addSectionBar(doc, '2. RESPONSABLE / COORDINADOR SST');

  doc.fontSize(9).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  y = addInfoRow(
    doc,
    'Responsable asignado',
    responsableSstName ?? 'Sin asignar — pendiente de designación',
    margin,
    y,
    contentWidth,
  );
  if (formalDesignation) {
    if (formalDesignation.designationDate) {
      y = addInfoRow(
        doc,
        'Fecha de designación',
        formatDate(formalDesignation.designationDate),
        margin,
        y,
        contentWidth,
      );
    }
    if (formalDesignation.position) {
      y = addInfoRow(doc, 'Cargo / Rol', formalDesignation.position, margin, y, contentWidth);
    }
    if (formalDesignation.licenciaSstNumero) {
      y = addInfoRow(
        doc,
        'Licencia SST No.',
        formalDesignation.licenciaSstNumero,
        margin,
        y,
        contentWidth,
      );
    }
    if (formalDesignation.nivelFormacion) {
      y = addInfoRow(
        doc,
        'Nivel de formación',
        formalDesignation.nivelFormacion,
        margin,
        y,
        contentWidth,
      );
    }
  }
  y = addInfoRow(
    doc,
    'Base legal',
    'Resolución 0312/2019 Estándar 1.1.1 — Responsable del SG-SST con licencia vigente',
    margin,
    y,
    contentWidth,
  );
  doc.y = y + 8;

  // ── Sección 3: COPASST / Vigía SST ───────────────────────────────────────
  const copasstTitle = tieneVigia ? '3. VIGÍA SST' : '3. COPASST — COMITÉ PARITARIO DE SEGURIDAD Y SALUD EN EL TRABAJO';
  y = addSectionBar(doc, copasstTitle);

  doc.fontSize(9).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  if (tieneVigia) {
    y = addInfoRow(
      doc,
      'Tipo',
      'Vigía SST (empresa con menos de 10 trabajadores)',
      margin,
      y,
      contentWidth,
    );
    y = addInfoRow(doc, 'Trabajadores', `${numWorkers}`, margin, y, contentWidth);
    y = addInfoRow(
      doc,
      'Base legal',
      'Decreto 1295/1994 Art. 35 — Vigía Ocupacional obligatorio para empresas < 10 trabajadores',
      margin,
      y,
      contentWidth,
    );
  } else if (periodoActivo) {
    const periodoAnio = new Date(periodoActivo.fechaInicio).getFullYear();
    y = addInfoRow(doc, 'Año del período', `${periodoAnio}`, margin, y, contentWidth);
    y = addInfoRow(doc, 'Estado del período', periodoActivo.estado, margin, y, contentWidth);
    y = addInfoRow(
      doc,
      'Período',
      `${formatDate(periodoActivo.fechaInicio)} — ${formatDate(periodoActivo.fechaFin)}`,
      margin,
      y,
      contentWidth,
    );
    y = addInfoRow(
      doc,
      'Total miembros',
      `${miembrosConNombre.length}`,
      margin,
      y,
      contentWidth,
    );
    y = addInfoRow(
      doc,
      'Base legal',
      'Resolución 0312/2019 Estándar 1.1.6 — Conformación y funcionamiento del COPASST',
      margin,
      y,
      contentWidth,
    );

    if (miembrosConNombre.length > 0) {
      doc.y = y + 6;
      y = checkPageBreak(doc, miembrosConNombre.length * 15 + 40);

      const miembrosEmpleador = miembrosConNombre.filter((m) => m.tipoRepresentante === 'empleador');
      const miembrosTrabajadores = miembrosConNombre.filter((m) => m.tipoRepresentante === 'trabajador');

      if (miembrosEmpleador.length > 0) {
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(PDF_COLORS.GREEN_PRIMARY)
          .text('Representantes del Empleador:', margin, doc.y);
        doc.fillColor(PDF_COLORS.BLACK);

        addSimpleTable(
          doc,
          ['Nombre', 'Rol', 'Cargo'],
          miembrosEmpleador.map((m) => [m.nombreTrabajador, m.rolMiembro, m.cargo ?? '']),
          {
            y: doc.y + 4,
            columnWidths: [contentWidth * 0.45, contentWidth * 0.25, contentWidth * 0.30],
          },
        );
        doc.y += 8;
      }

      if (miembrosTrabajadores.length > 0) {
        y = checkPageBreak(doc, miembrosTrabajadores.length * 15 + 40);
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(PDF_COLORS.GREEN_PRIMARY)
          .text('Representantes de los Trabajadores:', margin, doc.y);
        doc.fillColor(PDF_COLORS.BLACK);

        addSimpleTable(
          doc,
          ['Nombre', 'Rol', 'Cargo'],
          miembrosTrabajadores.map((m) => [m.nombreTrabajador, m.rolMiembro, m.cargo ?? '']),
          {
            y: doc.y + 4,
            columnWidths: [contentWidth * 0.45, contentWidth * 0.25, contentWidth * 0.30],
          },
        );
      }
    }
  } else {
    y = addInfoRow(
      doc,
      'Estado',
      'Sin período activo — pendiente de constitución del COPASST',
      margin,
      y,
      contentWidth,
    );
    y = addInfoRow(
      doc,
      'Base legal',
      'Resolución 0312/2019 Estándar 1.1.6 — Conformación del COPASST obligatoria',
      margin,
      y,
      contentWidth,
    );
  }

  doc.y = doc.y + 8;

  // ── Sección 4: Comité de Convivencia ─────────────────────────────────────
  y = addSectionBar(doc, '4. COMITÉ DE CONVIVENCIA LABORAL');

  doc.fontSize(9).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  y = addInfoRow(
    doc,
    'Función',
    'Prevención y gestión del riesgo psicosocial en el trabajo',
    margin,
    doc.y,
    contentWidth,
  );
  y = addInfoRow(
    doc,
    'Periodicidad de reuniones',
    'Trimestral (mínimo)',
    margin,
    doc.y,
    contentWidth,
  );
  y = addInfoRow(
    doc,
    'Base legal',
    'Resolución 2646/2008 / Resolución 652/2012 / Resolución 1356/2012 — Ley 1010/2006',
    margin,
    doc.y,
    contentWidth,
  );
  doc.y = doc.y + 8;

  // ── Sección 5: Brigadas de Emergencia ────────────────────────────────────
  y = addSectionBar(doc, '5. BRIGADAS DE EMERGENCIA');

  doc.fontSize(9).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  if (brigadasList.length > 0) {
    y = addInfoRow(
      doc,
      'Total brigadas',
      `${brigadasList.length}`,
      margin,
      doc.y,
      contentWidth,
    );
    doc.y = doc.y + 4;

    y = checkPageBreak(doc, brigadasList.length * 15 + 30);
    addSimpleTable(
      doc,
      ['Nombre de la Brigada', 'Tipo', 'Descripción'],
      brigadasList.map((b) => [
        b.nombre ?? 'N/A',
        b.tipo ?? '',
        b.descripcion ?? 'Sin descripción',
      ]),
      {
        y: doc.y + 2,
        columnWidths: [
          contentWidth * 0.35,
          contentWidth * 0.25,
          contentWidth * 0.40,
        ],
      },
    );
  } else {
    y = addInfoRow(
      doc,
      'Estado',
      'Sin brigadas registradas — pendiente de conformación',
      margin,
      doc.y,
      contentWidth,
    );
  }
  y = addInfoRow(
    doc,
    'Base legal',
    'Decreto 1072/2015 Art. 2.2.4.6.25 / Estándar 4.2.2 Res. 0312/2019 (Capítulo 2+)',
    margin,
    doc.y + 4,
    contentWidth,
  );
  doc.y = doc.y + 8;

  // ── Sección 6: Trabajadores ───────────────────────────────────────────────
  y = addSectionBar(doc, '6. TRABAJADORES');

  doc.fontSize(9).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  y = addInfoRow(doc, 'Total trabajadores', `${numWorkers}`, margin, doc.y, contentWidth);
  y = addInfoRow(
    doc,
    'Estructura organizacional',
    tieneVigia
      ? 'Empresa pequeña (< 10 trabajadores) — requiere Vigía SST'
      : numWorkers <= 50
        ? 'Empresa mediana (11-50 trabajadores) — requiere COPASST'
        : 'Empresa grande (> 50 trabajadores o Riesgo IV/V) — 61 estándares aplicables',
    margin,
    doc.y,
    contentWidth,
  );
  doc.y = doc.y + 8;

  // ── Sección 7: Marco normativo ────────────────────────────────────────────
  y = checkPageBreak(doc, 80);
  y = addSectionBar(doc, '7. MARCO NORMATIVO APLICABLE');

  const normas = [
    ['Decreto 1072/2015 Art. 2.2.4.6.8', 'Obligaciones del empleador — estructura organizativa del SG-SST'],
    ['Resolución 0312/2019', 'Estándares Mínimos del Sistema de Gestión SST'],
    ['Ley 1562/2012', 'Sistema General de Riesgos Laborales'],
    ['Resolución 2646/2008', 'Riesgo psicosocial — Comité de Convivencia'],
    ['Decreto 1295/1994 Art. 35', 'Vigía SST para empresas con menos de 10 trabajadores'],
    ['ISO 45001:2018 Cláusula 5.3', 'Roles, responsabilidades y autoridades en SST'],
  ];

  doc.y = checkPageBreak(doc, normas.length * 15 + 20);
  addSimpleTable(doc, ['Norma', 'Contenido relevante'], normas, {
    y: doc.y,
    columnWidths: [contentWidth * 0.38, contentWidth * 0.62],
  });

  doc.y = doc.y + 15;

  // ── Footer de contacto del proveedor ─────────────────────────────────────
  addProviderContactFooter(doc, { compact: true });

  // ── Footer de firmantes ───────────────────────────────────────────────────
  await addSignatureFooter(doc, signers, true);

  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
  });
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Fila de información con etiqueta y valor
 */
function addInfoRow(
  doc: typeof PDFDocument.prototype,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): number {
  const labelWidth = width * 0.32;
  const valueWidth = width * 0.68;
  const rowY = checkPageBreak(doc, 18, y);

  doc.fontSize(8).font('Helvetica-Bold').fillColor(PDF_COLORS.BLACK);
  doc.text(`${label}:`, x, rowY, { width: labelWidth, continued: false });

  doc.fontSize(8).font('Helvetica').fillColor(PDF_COLORS.BLACK);
  doc.text(value, x + labelWidth, rowY, { width: valueWidth });

  const nextY = Math.max(doc.y, rowY + 14);
  doc.y = nextY;
  return nextY;
}
