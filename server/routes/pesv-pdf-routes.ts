import { Express, Request, Response } from 'express';
import { db } from '../db';
import { eq, desc, and, inArray } from 'drizzle-orm';
import * as schema from '@shared/schema';
import {
  addStandardHeader, addSectionBar, addSignatureFooter, addSimpleTable,
  addParagraph, addLabeledField, checkPageBreak, formatDate,
  getSignersForCompany, loadCompanyLogo, handlePdfError, PDF_COLORS, PDF_CONFIG
} from '../services/pdf-standardizer';
import { setupTrialWatermarkOnAllPages } from '../services/pdf-watermark';
import { getTrialStatus } from '@shared/utils';
import { requireAuth as authRequireAuth, requirePermission } from '../auth';
import { storage } from '../storage';

function getEffectiveCompanyId(req: Request): string | null {
  const user = (req as any).user;
  if (!user) return null;

  const globalRoles = ['superadmin', 'support_admin', 'support_viewer', 'lso'];
  if (globalRoles.includes(user.role) && (req.query.companyId as string)) {
    return req.query.companyId as string;
  }
  return user.companyId || null;
}

export function registerPesvPdfRoutes(app: Express) {
  const requireAuth = authRequireAuth;
  const viewPermission = requirePermission('sst_management:view');

  // 1. GET /api/pesv/comite/actas/:id/pdf
  app.get('/api/pesv/comite/actas/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [acta] = await db.select().from(schema.actasComitePesv).where(and(eq(schema.actasComitePesv.id, id), eq(schema.actasComitePesv.companyId, companyId)));
      if (!acta) return res.status(404).send('Acta no encontrada');

      const integrantes = await db.select().from(schema.comiteIntegrantesPesv).where(eq(schema.comiteIntegrantesPesv.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="acta-comite-pesv-${acta.numeroActa}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'ACTA DE REUNIÓN - COMITÉ DE SEGURIDAD VIAL',
        documentCode: `PESV-ACTA-CSV-${acta.numeroActa}`, logoBuffer
      });

      y = addSectionBar(doc, 'Información del Acta', y);
      y = addLabeledField(doc, 'Acta No.', String(acta.numeroActa), { y });
      y = addLabeledField(doc, 'Fecha', formatDate(acta.fechaReunion), { y });
      y = addLabeledField(doc, 'Hora Inicio', acta.horaInicio || 'N/A', { y });
      y = addLabeledField(doc, 'Hora Fin', acta.horaFin || 'N/A', { y });
      y = addLabeledField(doc, 'Lugar', acta.lugar || 'N/A', { y });
      y = addLabeledField(doc, 'Modalidad', acta.modalidad || 'N/A', { y });
      y = addLabeledField(doc, 'Estado', acta.estado || 'N/A', { y });

      y = addSectionBar(doc, 'Asistentes', y);
      const asistentesIds = acta.asistentesIds || [];
      const asistentes = integrantes.filter(i => asistentesIds.includes(i.id));
      if (asistentes.length > 0) {
        const asistentesRows = asistentes.map(a => [a.nombre, a.cargo, a.rol]);
        y = addSimpleTable(doc, ['Nombre', 'Cargo', 'Rol'], asistentesRows, { y });
      } else {
        y = addParagraph(doc, 'No se registraron asistentes.', { y });
      }
      if (acta.invitados) {
        y = addLabeledField(doc, 'Invitados', acta.invitados, { y });
      }

      y = addSectionBar(doc, 'Orden del Día', y);
      y = addParagraph(doc, acta.temasOrdenDia || 'N/A', { y });

      y = addSectionBar(doc, 'Desarrollo', y);
      y = addParagraph(doc, acta.desarrolloReunion || 'N/A', { y });

      y = addSectionBar(doc, 'Compromisos', y);
      y = addParagraph(doc, acta.compromisos || 'Sin compromisos registrados.', { y });

      y = addSectionBar(doc, 'Observaciones', y);
      y = addParagraph(doc, acta.observaciones || 'Sin observaciones.', { y });

      if (acta.proximaReunion) {
        y = addLabeledField(doc, 'Próxima Reunión', formatDate(acta.proximaReunion), { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-acta-comite');
    }
  });

  // 1b. GET /api/pesv/comite/actos-administrativos/:id/pdf
  app.get('/api/pesv/comite/actos-administrativos/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [acto] = await db.select().from(schema.actosAdministrativosPesv).where(and(eq(schema.actosAdministrativosPesv.id, id), eq(schema.actosAdministrativosPesv.companyId, companyId)));
      if (!acto) return res.status(404).send('Acto administrativo no encontrado');

      const integrantes = await db.select().from(schema.comiteIntegrantesPesv).where(eq(schema.comiteIntegrantesPesv.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="acto-administrativo-pesv-${acto.numeroDocumento}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company,
        documentTitle: `ACTO ADMINISTRATIVO DE CONFORMACIÓN DEL EQUIPO PESV`,
        documentCode: `PESV-AA-${acto.numeroDocumento}`,
        logoBuffer
      });

      y = addSectionBar(doc, 'Información del Documento', y);
      y = addLabeledField(doc, 'Tipo de Documento', acto.tipoDocumento, { y });
      y = addLabeledField(doc, 'Número', acto.numeroDocumento, { y });
      y = addLabeledField(doc, 'Fecha de Expedición', formatDate(acto.fechaExpedicion), { y });
      if (acto.fechaVigencia) y = addLabeledField(doc, 'Fecha de Vigencia', formatDate(acto.fechaVigencia), { y });
      y = addLabeledField(doc, 'Firmado por', `${acto.firmadoPor} — ${acto.cargoFirmante}`, { y });
      y = addLabeledField(doc, 'Estado', acto.estado.charAt(0).toUpperCase() + acto.estado.slice(1), { y });

      y = addSectionBar(doc, 'Objeto', y);
      y = addParagraph(doc, acto.objetoConformacion, { y });

      if (acto.considerandos) {
        y = addSectionBar(doc, 'Considerandos', y);
        y = addParagraph(doc, acto.considerandos, { y });
      }

      if (acto.articulado) {
        y = addSectionBar(doc, 'Articulado', y);
        y = addParagraph(doc, acto.articulado, { y });
      }

      if (acto.observaciones) {
        y = addSectionBar(doc, 'Observaciones', y);
        y = addParagraph(doc, acto.observaciones, { y });
      }

      const integrantesActivos = integrantes.filter(i => i.estado === 'activo');
      if (integrantesActivos.length > 0) {
        y = addSectionBar(doc, 'Equipo de Trabajo PESV Conformado', y);
        const rows = integrantesActivos.map(i => [i.nombre, i.cargo, i.rol]);
        y = addSimpleTable(doc, ['Nombre', 'Cargo', 'Rol'], rows, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-acto-administrativo');
    }
  });

  // 2. GET /api/pesv/comite/integrantes/pdf
  app.get('/api/pesv/comite/integrantes/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const integrantes = await db.select().from(schema.comiteIntegrantesPesv).where(eq(schema.comiteIntegrantesPesv.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="integrantes-comite-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'LISTADO DE INTEGRANTES - COMITÉ DE SEGURIDAD VIAL',
        documentCode: 'PESV-COM-INT', logoBuffer
      });

      const rows = integrantes.map(i => [
        i.nombre, i.cargo, i.rol, i.email || 'N/A', i.estado
      ]);
      y = addSimpleTable(doc, ['Nombre', 'Cargo', 'Rol', 'Email', 'Estado'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-comite-integrantes');
    }
  });

  // 3. GET /api/auditorias-pesv/:id/pdf
  app.get('/api/auditorias-pesv/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [auditoria] = await db.select().from(schema.auditoriasPesv).where(and(eq(schema.auditoriasPesv.id, id), eq(schema.auditoriasPesv.companyId, companyId)));
      if (!auditoria) return res.status(404).send('Auditoría no encontrada');

      const hallazgos = await db.select().from(schema.hallazgosAuditoriaPesv).where(eq(schema.hallazgosAuditoriaPesv.auditoriaId, id));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="auditoria-pesv-${auditoria.codigo}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'INFORME DE AUDITORÍA - PLAN ESTRATÉGICO DE SEGURIDAD VIAL',
        documentCode: `PESV-AUD-${auditoria.codigo}`, logoBuffer
      });

      y = addSectionBar(doc, 'Información General', y);
      y = addLabeledField(doc, 'Código', auditoria.codigo, { y });
      y = addLabeledField(doc, 'Título', auditoria.titulo, { y });
      y = addLabeledField(doc, 'Tipo', auditoria.tipo || 'N/A', { y });
      y = addLabeledField(doc, 'Fecha Programada', formatDate(auditoria.fechaProgramada), { y });
      y = addLabeledField(doc, 'Fecha Ejecución', formatDate(auditoria.fechaEjecucion), { y });
      y = addLabeledField(doc, 'Estado', auditoria.estado || 'N/A', { y });
      y = addLabeledField(doc, 'Equipo Auditor', auditoria.equipoAuditor || 'N/A', { y });

      y = addSectionBar(doc, 'Alcance y Criterios', y);
      y = addLabeledField(doc, 'Alcance', auditoria.alcance || 'N/A', { y });
      y = addLabeledField(doc, 'Criterios', auditoria.criterios || 'N/A', { y });

      y = addSectionBar(doc, 'Resultados', y);
      y = addLabeledField(doc, 'Conformidades', String(auditoria.hallazgosConformidades || 0), { y });
      y = addLabeledField(doc, 'No Conformidades Menores', String(auditoria.hallazgosNoConformidadesMenores || 0), { y });
      y = addLabeledField(doc, 'No Conformidades Mayores', String(auditoria.hallazgosNoConformidadesMayores || 0), { y });
      y = addLabeledField(doc, 'Observaciones', String(auditoria.hallazgosObservaciones || 0), { y });
      y = addLabeledField(doc, 'Oportunidades de Mejora', String(auditoria.hallazgosOportunidadesMejora || 0), { y });

      if (hallazgos.length > 0) {
        y = addSectionBar(doc, 'Hallazgos Detalle', y);
        const hallazgosRows = hallazgos.map(h => [
          h.codigo, h.tipo, h.descripcion, h.clausulaReferencia || 'N/A', h.estado
        ]);
        y = addSimpleTable(doc, ['Código', 'Tipo', 'Descripción', 'Cláusula', 'Estado'], hallazgosRows, { y });
      }

      y = addSectionBar(doc, 'Conclusiones', y);
      y = addParagraph(doc, auditoria.conclusiones || 'Sin conclusiones registradas.', { y });

      y = addSectionBar(doc, 'Recomendaciones', y);
      y = addParagraph(doc, auditoria.recomendaciones || 'Sin recomendaciones registradas.', { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-auditoria');
    }
  });

  // 4. GET /api/evaluaciones-pesv/:evaluacionId/acciones-mejora/pdf
  app.get('/api/evaluaciones-pesv/:evaluacionId/acciones-mejora/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { evaluacionId } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const acciones = await db.select().from(schema.accionesMejoraPesv).where(eq(schema.accionesMejoraPesv.evaluacionId, evaluacionId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="acciones-mejora-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'PLAN DE MEJORA CONTINUA - PESV',
        documentCode: 'PESV-MC-ACC', logoBuffer
      });

      const rows = acciones.map(a => [
        a.descripcion || 'N/A',
        a.tipoAccion || 'N/A',
        a.prioridad || 'N/A',
        a.responsable || 'N/A',
        a.estado || 'N/A',
        formatDate(a.fechaLimite)
      ]);
      y = addSimpleTable(doc, ['Descripción', 'Tipo', 'Prioridad', 'Responsable', 'Estado', 'Fecha Límite'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-acciones-mejora');
    }
  });

  // 5. GET /api/evaluaciones-pesv/:evaluacionId/revisiones-direccion/:id/pdf
  app.get('/api/evaluaciones-pesv/:evaluacionId/revisiones-direccion/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [revision] = await db.select().from(schema.revisionesDireccionPesv).where(and(eq(schema.revisionesDireccionPesv.id, id), eq(schema.revisionesDireccionPesv.companyId, companyId)));
      if (!revision) return res.status(404).send('Revisión no encontrada');

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="revision-direccion-pesv-${revision.codigo}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'REVISIÓN POR LA DIRECCIÓN - PESV',
        documentCode: `PESV-RD-${revision.codigo}`, logoBuffer
      });

      y = addSectionBar(doc, 'Información General', y);
      y = addLabeledField(doc, 'Código', revision.codigo, { y });
      y = addLabeledField(doc, 'Fecha Revisión', formatDate(revision.fechaRevision), { y });
      y = addLabeledField(doc, 'Presidida Por', revision.presididaPor, { y });
      y = addLabeledField(doc, 'Participantes', revision.participantes || 'N/A', { y });
      y = addLabeledField(doc, 'Estado', revision.estado || 'N/A', { y });

      y = addSectionBar(doc, 'Temas Revisados', y);
      y = addLabeledField(doc, 'Indicadores', revision.revisionIndicadores ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Auditorías', revision.revisionAuditorias ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Siniestros', revision.revisionSiniestros ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Acciones de Mejora', revision.revisionAccionesMejora ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Cumplimiento Legal', revision.revisionCumplimientoLegal ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Recursos', revision.revisionRecursos ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Capacitaciones', revision.revisionCapacitaciones ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Inspecciones', revision.revisionInspecciones ? 'Sí' : 'No', { y });

      y = addSectionBar(doc, 'Análisis', y);
      if (revision.resumenIndicadores) y = addLabeledField(doc, 'Indicadores', revision.resumenIndicadores, { y });
      if (revision.resumenAuditorias) y = addLabeledField(doc, 'Auditorías', revision.resumenAuditorias, { y });
      if (revision.resumenSiniestros) y = addLabeledField(doc, 'Siniestros', revision.resumenSiniestros, { y });
      if (revision.resumenAccionesMejora) y = addLabeledField(doc, 'Acciones de Mejora', revision.resumenAccionesMejora, { y });
      y = addParagraph(doc, revision.analisisGeneral || 'Sin análisis general registrado.', { y });

      y = addSectionBar(doc, 'Decisiones', y);
      y = addParagraph(doc, revision.decisiones || 'Sin decisiones registradas.', { y });

      y = addSectionBar(doc, 'Compromisos', y);
      y = addParagraph(doc, revision.compromisos || 'Sin compromisos registrados.', { y });

      if (revision.fechaProximaRevision) {
        y = addLabeledField(doc, 'Próxima Revisión', formatDate(revision.fechaProximaRevision), { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-revision-direccion');
    }
  });

  // 6. GET /api/contexto-organizacional-pesv/pdf
  app.get('/api/contexto-organizacional-pesv/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const factores = await db.select().from(schema.contextoOrganizacionalPesv).where(eq(schema.contextoOrganizacionalPesv.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="contexto-organizacional-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'ANÁLISIS DE CONTEXTO ORGANIZACIONAL - PESV',
        documentCode: 'PESV-CO', logoBuffer
      });

      const internos = factores.filter(f => f.tipoFactor === 'interno');
      const externos = factores.filter(f => f.tipoFactor === 'externo');

      if (internos.length > 0) {
        y = addSectionBar(doc, 'Factores Internos', y);
        const internosRows = internos.map(f => [
          f.nombre, f.categoria || 'N/A', f.impactoSeguridad || 'N/A', f.nivelImpacto || 'N/A'
        ]);
        y = addSimpleTable(doc, ['Nombre', 'Categoría', 'Impacto', 'Nivel'], internosRows, { y });
      }

      if (externos.length > 0) {
        y = addSectionBar(doc, 'Factores Externos', y);
        const externosRows = externos.map(f => [
          f.nombre, f.categoria || 'N/A', f.impactoSeguridad || 'N/A', f.nivelImpacto || 'N/A'
        ]);
        y = addSimpleTable(doc, ['Nombre', 'Categoría', 'Impacto', 'Nivel'], externosRows, { y });
      }

      if (factores.length === 0) {
        y = addParagraph(doc, 'No se han registrado factores de contexto organizacional.', { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-contexto-organizacional');
    }
  });

  // 7. GET /api/riesgos-viales/pdf
  app.get('/api/riesgos-viales/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const riesgos = await db.select().from(schema.riesgosViales).where(eq(schema.riesgosViales.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="matriz-riesgos-viales.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'MATRIZ DE RIESGOS VIALES - ISO 31000',
        documentCode: 'PESV-MRV', logoBuffer
      });

      const rows = riesgos.map(r => [
        r.codigo, r.nombre, r.categoria || 'N/A', r.probabilidad || 'N/A',
        r.impacto || 'N/A', r.nivelRiesgo || 'N/A', r.estado || 'N/A'
      ]);
      y = addSimpleTable(doc, ['Código', 'Nombre', 'Categoría', 'Probabilidad', 'Impacto', 'Nivel Riesgo', 'Estado'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-riesgos-viales');
    }
  });

  // 8. GET /api/factores-desempeno-sv/pdf
  app.get('/api/factores-desempeno-sv/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const factores = await db.select().from(schema.factoresDesempenoSV).where(eq(schema.factoresDesempenoSV.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="factores-desempeno-sv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'FACTORES DE DESEMPEÑO DE SEGURIDAD VIAL - ISO 39001',
        documentCode: 'PESV-SPF', logoBuffer
      });

      const rows = factores.map(f => [
        f.codigo, f.nombre, f.categoria || 'N/A',
        f.valorBase || 'N/A', f.metaAnual || 'N/A', f.valorActual || 'N/A'
      ]);
      y = addSimpleTable(doc, ['Código', 'Nombre', 'Categoría', 'Valor Base', 'Meta', 'Valor Actual'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-factores-desempeno');
    }
  });

  // 9. GET /api/indicadores-sv/pdf
  app.get('/api/indicadores-sv/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const indicadores = await db.select().from(schema.indicadoresSV).where(eq(schema.indicadoresSV.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="indicadores-sv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'INDICADORES DE SEGURIDAD VIAL - ISO 39001',
        documentCode: 'PESV-SPI', logoBuffer
      });

      const rows = indicadores.map(i => [
        i.codigo, i.nombre, i.unidadMedida || 'N/A',
        i.valorMeta || 'N/A', i.valorActual || 'N/A', i.frecuenciaMedicion || 'N/A'
      ]);
      y = addSimpleTable(doc, ['Código', 'Nombre', 'Unidad', 'Meta', 'Actual', 'Frecuencia'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-indicadores-sv');
    }
  });

  // 10. GET /api/pesv/conductores/pdf
  app.get('/api/pesv/conductores/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const conductores = await db.select().from(schema.drivers)
        .where(eq(schema.drivers.companyId, companyId))
        .orderBy(schema.drivers.name);

      // Cargar todos los comparendos de la empresa en una sola consulta
      const driverIds = conductores.map(c => c.id);
      const todosComparendos = driverIds.length > 0
        ? await db.select().from(schema.driverComparendos)
            .where(inArray(schema.driverComparendos.driverId, driverIds))
            .orderBy(desc(schema.driverComparendos.fechaComparendo))
        : [];

      // Agrupar comparendos por conductor
      const comparendosPorConductor = new Map<string, typeof todosComparendos>();
      for (const comp of todosComparendos) {
        if (!comparendosPorConductor.has(comp.driverId)) {
          comparendosPorConductor.set(comp.driverId, []);
        }
        comparendosPorConductor.get(comp.driverId)!.push(comp);
      }

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="conductores-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'REGISTRO DE CONDUCTORES - PESV',
        documentCode: 'PESV-COND', logoBuffer
      });

      y = addParagraph(doc, 'Resolución 40595/2022 — Gestión de conductores y licencias de conducción.', { y, fontSize: 8 });
      y += 6;

      if (conductores.length === 0) {
        y = addParagraph(doc, 'No se han registrado conductores para esta empresa.', { y });
      } else {
        // ── Tabla resumen ────────────────────────────────────────────────────
        y = addSectionBar(doc, 'Resumen de Conductores', y);
        const resumenRows = conductores.map(c => [
          c.name,
          c.identificationNumber,
          c.licenseNumber,
          c.licenseType,
          formatDate(c.licenseExpiry),
          c.status === 'activo' ? 'Activo' : c.status === 'inactivo' ? 'Inactivo' : (c.status || 'N/A'),
        ]);
        y = addSimpleTable(doc, ['Nombre', 'Cédula', 'No. Licencia', 'Categoría', 'Vencimiento', 'Estado'], resumenRows, {
          y,
          columnWidths: [135, 80, 95, 60, 80, 65],
        });

        // ── Ficha detallada por conductor ────────────────────────────────────
        for (const c of conductores) {
          y = checkPageBreak(doc, 180, y);
          y += 10;

          // Encabezado del conductor con fondo diferenciado
          const margin = PDF_CONFIG.MARGIN;
          const pageWidth = doc.page.width - margin * 2;
          const headerH = 26;
          const safeY = checkPageBreak(doc, headerH + 4, y);
          doc.rect(margin, safeY, pageWidth, headerH).fill(PDF_COLORS.PRIMARY || '#1a6b3c');
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF')
            .text(`CONDUCTOR: ${c.name.toUpperCase()}`, margin + 8, safeY + 8, { width: pageWidth - 16 });
          doc.fillColor(PDF_COLORS.BLACK || '#000000');
          y = safeY + headerH + 8;

          // Datos del conductor
          y = addLabeledField(doc, 'Cédula', c.identificationNumber, { y });
          y = addLabeledField(doc, 'No. Licencia', c.licenseNumber, { y });
          y = addLabeledField(doc, 'Categoría Licencia', c.licenseType, { y });
          y = addLabeledField(doc, 'Vencimiento Licencia', formatDate(c.licenseExpiry), { y });
          if (c.bloodType) y = addLabeledField(doc, 'Grupo Sanguíneo', c.bloodType, { y });
          if (c.medicalExamExpiry) y = addLabeledField(doc, 'Venc. Examen Médico', formatDate(c.medicalExamExpiry), { y });
          if (c.emergencyContact) y = addLabeledField(doc, 'Contacto de Emergencia', c.emergencyContact, { y });
          if (c.emergencyPhone) y = addLabeledField(doc, 'Teléfono Emergencia', c.emergencyPhone, { y });
          y = addLabeledField(doc, 'Estado', c.status === 'activo' ? 'Activo' : c.status === 'inactivo' ? 'Inactivo' : (c.status || 'N/A'), { y });
          if (c.observations) y = addLabeledField(doc, 'Observaciones', c.observations, { y });

          // Historial de comparendos
          const comparendos = comparendosPorConductor.get(c.id) || [];
          y += 6;
          y = addSectionBar(doc, `Historial de Comparendos (${comparendos.length})`, y);

          if (comparendos.length === 0) {
            y = addParagraph(doc, 'Sin comparendos registrados.', { y, fontSize: 9 });
          } else {
            const estadoLabel = (e: string) =>
              e === 'pendiente' ? 'Pendiente' :
              e === 'pagado' ? 'Pagado' :
              e === 'recurrido' ? 'Recurrido' :
              e === 'prescrito' ? 'Prescrito' : (e || 'N/A');

            const compRows = comparendos.map(comp => [
              formatDate(comp.fechaComparendo),
              comp.numeroComparendo || '—',
              comp.tipoInfraccion,
              comp.placaVehiculo || '—',
              comp.valorComparendo ? `$${comp.valorComparendo.toLocaleString('es-CO')}` : '—',
              estadoLabel(comp.estado),
            ]);
            y = addSimpleTable(
              doc,
              ['Fecha', 'No. Comparendo', 'Infracción', 'Placa', 'Valor', 'Estado'],
              compRows,
              { y, columnWidths: [65, 90, 150, 55, 65, 65] }
            );

            // Descripción y observaciones (si las hay)
            for (const comp of comparendos) {
              if (comp.descripcion || comp.observaciones) {
                y = addParagraph(doc,
                  `• ${comp.tipoInfraccion}${comp.descripcion ? ': ' + comp.descripcion : ''}${comp.observaciones ? ' — Obs: ' + comp.observaciones : ''}`,
                  { y, fontSize: 8 }
                );
              }
            }
          }
        }
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-conductores');
    }
  });

  // 10b. GET /api/pesv/conductores/:id/pdf — PDF individual de un conductor
  app.get('/api/pesv/conductores/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [conductor] = await db.select().from(schema.drivers)
        .where(and(eq(schema.drivers.id, id), eq(schema.drivers.companyId, companyId)))
        .limit(1);
      if (!conductor) return res.status(404).send('Conductor no encontrado');

      const comparendos = await db.select().from(schema.driverComparendos)
        .where(eq(schema.driverComparendos.driverId, id))
        .orderBy(desc(schema.driverComparendos.fechaComparendo));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: PDF_CONFIG.MARGIN, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      const safeName = conductor.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="conductor-${safeName}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company,
        documentTitle: 'FICHA DEL CONDUCTOR - PESV',
        documentCode: 'PESV-COND-IND',
        logoBuffer,
      });

      y = addParagraph(doc, 'Resolución 40595/2022 — Gestión de conductores y licencias de conducción.', { y, fontSize: 8 });
      y += 6;

      // ── Datos personales ─────────────────────────────────────────────────
      y = addSectionBar(doc, '1. Datos del Conductor', y);
      y = addLabeledField(doc, 'Nombre completo', conductor.name, { y });
      y = addLabeledField(doc, 'Número de Cédula', conductor.identificationNumber, { y });
      y = addLabeledField(doc, 'Empresa', company.name, { y });
      y = addLabeledField(doc, 'Estado', conductor.status === 'activo' ? 'Activo' : conductor.status === 'inactivo' ? 'Inactivo' : conductor.status === 'suspendido' ? 'Suspendido' : 'Retirado', { y });

      // ── Licencia ─────────────────────────────────────────────────────────
      y = addSectionBar(doc, '2. Información de Licencia', y);
      y = addLabeledField(doc, 'Número de Licencia', conductor.licenseNumber, { y });
      y = addLabeledField(doc, 'Categoría', conductor.licenseType, { y });
      y = addLabeledField(doc, 'Vencimiento', formatDate(conductor.licenseExpiry), { y });

      // ── Datos médicos y emergencia ────────────────────────────────────────
      y = addSectionBar(doc, '3. Datos Médicos y Contacto de Emergencia', y);
      y = addLabeledField(doc, 'Grupo Sanguíneo', conductor.bloodType || 'No registrado', { y });
      y = addLabeledField(doc, 'Venc. Examen Médico', conductor.medicalExamExpiry ? formatDate(conductor.medicalExamExpiry) : 'No registrado', { y });
      y = addLabeledField(doc, 'Contacto de Emergencia', conductor.emergencyContact || 'No registrado', { y });
      y = addLabeledField(doc, 'Teléfono Emergencia', conductor.emergencyPhone || 'No registrado', { y });

      if (conductor.observations) {
        y = addSectionBar(doc, '4. Observaciones', y);
        y = addParagraph(doc, conductor.observations, { y });
      }

      // ── Historial de comparendos ──────────────────────────────────────────
      const secNum = conductor.observations ? '5' : '4';
      y += 4;
      y = addSectionBar(doc, `${secNum}. Historial de Comparendos (${comparendos.length})`, y);

      if (comparendos.length === 0) {
        y = addParagraph(doc, 'Sin comparendos registrados para este conductor.', { y });
      } else {
        const estadoLabel = (e: string) =>
          e === 'pendiente' ? 'Pendiente' :
          e === 'pagado' ? 'Pagado' :
          e === 'recurrido' ? 'Recurrido' :
          e === 'prescrito' ? 'Prescrito' : (e || 'N/A');

        const compRows = comparendos.map(comp => [
          formatDate(comp.fechaComparendo),
          comp.numeroComparendo || '—',
          comp.tipoInfraccion,
          comp.placaVehiculo || '—',
          comp.valorComparendo ? `$${comp.valorComparendo.toLocaleString('es-CO')}` : '—',
          estadoLabel(comp.estado),
        ]);
        y = addSimpleTable(
          doc,
          ['Fecha', 'No. Comparendo', 'Infracción', 'Placa', 'Valor', 'Estado'],
          compRows,
          { y, columnWidths: [65, 90, 150, 55, 65, 65] }
        );

        for (const comp of comparendos) {
          if (comp.descripcion || comp.observaciones) {
            y = addParagraph(doc,
              `• ${comp.tipoInfraccion}${comp.descripcion ? ': ' + comp.descripcion : ''}${comp.observaciones ? ' — Obs: ' + comp.observaciones : ''}`,
              { y, fontSize: 8 }
            );
          }
        }
      }

      await addSignatureFooter(doc, signers, true, { startY: y + 24 });
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-conductor-individual');
    }
  });

  // 11. GET /api/pesv/vehiculos/pdf
  app.get('/api/pesv/vehiculos/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const vehiculos = await db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="vehiculos-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'PARQUE AUTOMOTOR - PESV',
        documentCode: 'PESV-VEH', logoBuffer
      });

      const rows = vehiculos.map(v => [
        v.plate, v.type, v.brand, v.model, String(v.year), v.status
      ]);
      y = addSimpleTable(doc, ['Placa', 'Tipo', 'Marca', 'Modelo', 'Año', 'Estado'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-vehiculos');
    }
  });

  // 11b. GET /api/pesv/vehiculos/:id/pdf - Ficha individual del vehículo
  app.get('/api/pesv/vehiculos/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [vehicle] = await db.select().from(schema.vehicles)
        .where(and(eq(schema.vehicles.id, req.params.id), eq(schema.vehicles.companyId, companyId)))
        .limit(1);
      if (!vehicle) return res.status(404).send('Vehículo no encontrado');

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="vehiculo-${vehicle.plate}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: `FICHA DE VEHÍCULO - ${vehicle.plate}`,
        documentCode: 'PESV-VEH-IND', logoBuffer
      });

      y = addSectionBar(doc, 'Datos del Vehículo', y);
      y = addLabeledField(doc, 'Placa', vehicle.plate, { y });
      y = addLabeledField(doc, 'Marca', vehicle.brand, { y });
      y = addLabeledField(doc, 'Modelo', vehicle.model, { y });
      y = addLabeledField(doc, 'Año', String(vehicle.year), { y });
      y = addLabeledField(doc, 'Tipo', vehicle.type, { y });
      y = addLabeledField(doc, 'Propiedad', vehicle.ownership, { y });
      y = addLabeledField(doc, 'Estado', vehicle.status, { y });
      y = addLabeledField(doc, 'Capacidad', vehicle.capacity ? String(vehicle.capacity) : '—', { y });
      y = addLabeledField(doc, 'Kilometraje', vehicle.mileage ? String(vehicle.mileage) : '—', { y });
      y = addLabeledField(doc, 'Color', vehicle.color || '—', { y });
      y = addLabeledField(doc, 'VIN', vehicle.vin || '—', { y });

      y = addSectionBar(doc, 'Documentación y Vigencias', y);
      y = addLabeledField(doc, 'Póliza de Seguro', vehicle.insurancePolicy || '—', { y });
      y = addLabeledField(doc, 'Vencimiento Seguro', formatDate(vehicle.insuranceExpiry), { y });
      y = addLabeledField(doc, 'Vencimiento SOAT', formatDate(vehicle.soatExpiry), { y });
      y = addLabeledField(doc, 'Vencimiento Revisión Técnico-Mecánica', formatDate(vehicle.technicalReviewExpiry), { y });

      if (vehicle.observations) {
        y = addSectionBar(doc, 'Observaciones', y);
        y = addParagraph(doc, vehicle.observations, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-vehiculo-individual');
    }
  });

  // 12. GET /api/pesv/mantenimientos/pdf
  app.get('/api/pesv/mantenimientos/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const mantenimientos = await db.select().from(schema.vehicleMaintenances).where(eq(schema.vehicleMaintenances.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="mantenimientos-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'REGISTRO DE MANTENIMIENTO VEHICULAR - PESV',
        documentCode: 'PESV-MNT', logoBuffer
      });

      const rows = mantenimientos.map(m => [
        m.vehicleId, m.maintenanceType, formatDate(m.maintenanceDate),
        m.description || 'N/A', m.cost ? String(m.cost) : 'N/A', 'Registrado'
      ]);
      y = addSimpleTable(doc, ['Vehículo', 'Tipo', 'Fecha', 'Descripción', 'Costo', 'Estado'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-mantenimientos');
    }
  });

  // 12b. GET /api/pesv/mantenimientos/:id/pdf - Ficha individual del mantenimiento
  app.get('/api/pesv/mantenimientos/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [maintenance] = await db.select().from(schema.vehicleMaintenances)
        .where(and(eq(schema.vehicleMaintenances.id, req.params.id), eq(schema.vehicleMaintenances.companyId, companyId)))
        .limit(1);
      if (!maintenance) return res.status(404).send('Registro de mantenimiento no encontrado');

      const [vehicle] = await db.select().from(schema.vehicles).where(eq(schema.vehicles.id, maintenance.vehicleId)).limit(1);

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="mantenimiento-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'FICHA DE MANTENIMIENTO VEHICULAR - PESV',
        documentCode: 'PESV-MNT-IND', logoBuffer
      });

      y = addSectionBar(doc, 'Datos del Mantenimiento', y);
      y = addLabeledField(doc, 'Vehículo', vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : maintenance.vehicleId, { y });
      y = addLabeledField(doc, 'Tipo de Mantenimiento', maintenance.maintenanceType, { y });
      y = addLabeledField(doc, 'Fecha de Mantenimiento', formatDate(maintenance.maintenanceDate), { y });
      y = addLabeledField(doc, 'Descripción', maintenance.description, { y });
      y = addLabeledField(doc, 'Kilometraje al Mantenimiento', maintenance.mileageAtMaintenance ? String(maintenance.mileageAtMaintenance) : '—', { y });
      y = addLabeledField(doc, 'Próximo Mantenimiento (Fecha)', formatDate(maintenance.nextMaintenanceDate), { y });
      y = addLabeledField(doc, 'Próximo Mantenimiento (Km)', maintenance.nextMaintenanceMileage ? String(maintenance.nextMaintenanceMileage) : '—', { y });
      y = addLabeledField(doc, 'Costo', maintenance.cost ? `$${maintenance.cost.toLocaleString('es-CO')}` : '—', { y });
      y = addLabeledField(doc, 'Proveedor', maintenance.provider || '—', { y });
      y = addLabeledField(doc, 'Número de Factura', maintenance.invoiceNumber || '—', { y });
      y = addLabeledField(doc, 'Repuestos Reemplazados', maintenance.partsReplaced || '—', { y });

      if (maintenance.observations) {
        y = addSectionBar(doc, 'Observaciones', y);
        y = addParagraph(doc, maintenance.observations, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-mantenimiento-individual');
    }
  });

  // 13. GET /api/pesv/capacitaciones/pdf
  app.get('/api/pesv/capacitaciones/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const capacitaciones = await db.select().from(schema.roadSafetyTrainings).where(eq(schema.roadSafetyTrainings.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="capacitaciones-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'PROGRAMA DE CAPACITACIÓN EN SEGURIDAD VIAL',
        documentCode: 'PESV-CAP', logoBuffer
      });

      const duration = (c: any) => {
        if (c.startTime && c.endTime) return `${c.startTime} - ${c.endTime}`;
        return 'N/A';
      };
      const rows = capacitaciones.map(c => [
        c.title, formatDate(c.trainingDate), c.instructor || 'N/A',
        String(c.totalAttendees || 0), duration(c)
      ]);
      y = addSimpleTable(doc, ['Tema', 'Fecha', 'Instructor', 'Asistentes', 'Duración'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-capacitaciones');
    }
  });

  // 13b. GET /api/pesv/capacitaciones/:id/lista-asistencia/pdf — Lista de asistencia individual con firmas
  app.get('/api/pesv/capacitaciones/:id/lista-asistencia/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [training] = await db.select().from(schema.roadSafetyTrainings)
        .where(and(eq(schema.roadSafetyTrainings.id, id), eq(schema.roadSafetyTrainings.companyId, companyId)))
        .limit(1);
      if (!training) return res.status(404).send('Capacitación no encontrada');

      // Trabajadores invitados (roadSafetyWorkerAttendees)
      const workerRows = await db.select({
        name: schema.workers.name,
        identificationNumber: schema.workers.identificationNumber,
        position: schema.workers.position,
      })
        .from(schema.roadSafetyWorkerAttendees)
        .innerJoin(schema.workers, eq(schema.roadSafetyWorkerAttendees.workerId, schema.workers.id))
        .where(eq(schema.roadSafetyWorkerAttendees.trainingId, id));

      // Conductores (roadSafetyAttendees)
      const driverRows = await db.select({
        name: schema.drivers.name,
        identificationNumber: schema.drivers.identificationNumber,
      })
        .from(schema.roadSafetyAttendees)
        .innerJoin(schema.drivers, eq(schema.roadSafetyAttendees.driverId, schema.drivers.id))
        .where(eq(schema.roadSafetyAttendees.trainingId, id));

      const allAttendees: { name: string; identificationNumber: string; position: string }[] = [
        ...workerRows.map(w => ({ name: w.name, identificationNumber: w.identificationNumber, position: w.position })),
        ...driverRows.map(d => ({ name: d.name, identificationNumber: d.identificationNumber, position: 'Conductor' })),
      ];

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      const safeName = (training.title || 'capacitacion').replace(/[^a-z0-9]/gi, '-').toLowerCase();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="lista-asistencia-pesv-${safeName}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company,
        documentTitle: 'LISTA DE ASISTENCIA A CAPACITACIÓN PESV',
        documentCode: 'PESV-H02-LISTA',
        logoBuffer,
      });

      // ── Datos de la capacitación ──
      const margin = 35;
      const pageWidth = doc.page.width;
      const colW = (pageWidth - 2 * margin) / 2;

      doc.y = y + 8;
      addSectionBar(doc, 'DATOS DE LA CAPACITACIÓN', y + 8);
      y = doc.y + 6;

      const field = (label: string, value: string, x: number, yw: number, w: number) => {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333').text(label + ': ', x, yw, { continued: true, width: w });
        doc.font('Helvetica').text(value || 'N/A', { width: w });
      };

      field('Tema', training.title, margin, y, colW - 10);
      field('Fecha', training.trainingDate ? formatDate(training.trainingDate) : 'N/A', margin + colW, y, colW - 10);
      y = doc.y + 2;
      field('Instructor', training.instructor || 'N/A', margin, y, colW - 10);
      field('Lugar', training.location || 'N/A', margin + colW, y, colW - 10);
      y = doc.y + 2;
      const horario = training.startTime && training.endTime ? `${training.startTime} - ${training.endTime}` : 'N/A';
      field('Horario', horario, margin, y, colW - 10);
      field('Normativa', 'Resolución 40595/2022', margin + colW, y, colW - 10);
      y = doc.y + 10;

      // ── Tabla de asistentes ──
      addSectionBar(doc, 'PARTICIPANTES', y);
      y = doc.y + 8;

      const tableWidth = pageWidth - 2 * margin;
      const colNum = 22;
      const colFirma = 110;
      const colDoc = 80;
      const colCargo = 90;
      const colName = tableWidth - colNum - colFirma - colDoc - colCargo;
      const rowH = 22;
      const headerH = 18;

      // Encabezado de tabla
      doc.rect(margin, y, tableWidth, headerH).fill('#1a5c2e');
      doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
      let tx = margin;
      doc.text('N°', tx + 3, y + 5, { width: colNum - 4, lineBreak: false, align: 'center' }); tx += colNum;
      doc.text('Nombre Completo', tx + 3, y + 5, { width: colName - 4, lineBreak: false }); tx += colName;
      doc.text('Documento', tx + 3, y + 5, { width: colDoc - 4, lineBreak: false }); tx += colDoc;
      doc.text('Cargo', tx + 3, y + 5, { width: colCargo - 4, lineBreak: false }); tx += colCargo;
      doc.text('Firma', tx + 3, y + 5, { width: colFirma - 4, lineBreak: false });
      y += headerH;

      const totalRows = allAttendees.length > 0 ? allAttendees.length : Math.max(training.totalAttendees || 10, 5);
      const emptyRows = allAttendees.length === 0;

      for (let i = 0; i < totalRows; i++) {
        if (y + rowH > doc.page.height - 100) {
          doc.addPage();
          y = 35;
        }
        const att = emptyRows ? null : allAttendees[i];
        const bg = i % 2 === 0 ? '#f5f7fa' : '#ffffff';
        doc.rect(margin, y, tableWidth, rowH).fill(bg).stroke('#d0d7de');
        doc.fillColor('#222222').font('Helvetica').fontSize(7.5);

        tx = margin;
        doc.text(String(i + 1), tx + 2, y + 7, { width: colNum - 4, lineBreak: false, align: 'center' }); tx += colNum;
        doc.moveTo(tx, y).lineTo(tx, y + rowH).stroke('#d0d7de');
        doc.text(att?.name || '', tx + 3, y + 7, { width: colName - 6, lineBreak: false }); tx += colName;
        doc.moveTo(tx, y).lineTo(tx, y + rowH).stroke('#d0d7de');
        doc.text(att?.identificationNumber || '', tx + 3, y + 7, { width: colDoc - 6, lineBreak: false }); tx += colDoc;
        doc.moveTo(tx, y).lineTo(tx, y + rowH).stroke('#d0d7de');
        doc.text(att?.position || '', tx + 3, y + 7, { width: colCargo - 6, lineBreak: false }); tx += colCargo;
        doc.moveTo(tx, y).lineTo(tx, y + rowH).stroke('#d0d7de');
        y += rowH;
      }

      doc.y = y + 14;
      doc.fontSize(7).fillColor('#666666').font('Helvetica-Oblique')
        .text('Al firmar esta lista, el participante certifica su asistencia y comprensión del tema impartido.', margin, doc.y);
      doc.y += 4;

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-lista-asistencia');
    }
  });

  // 14. GET /api/pesv/inspecciones/pdf
  app.get('/api/pesv/inspecciones/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const inspecciones = await db.select().from(schema.vehicleInspections).where(eq(schema.vehicleInspections.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="inspecciones-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'REGISTRO DE INSPECCIONES VEHICULARES',
        documentCode: 'PESV-INS', logoBuffer
      });

      const rows = inspecciones.map(i => [
        i.vehicleId, formatDate(i.inspectionDate), i.driverId,
        i.result, i.observations ? 'Con obs.' : 'Sin obs.'
      ]);
      y = addSimpleTable(doc, ['Vehículo', 'Fecha', 'Inspector', 'Resultado', 'Estado'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-inspecciones');
    }
  });

  // 15b. GET /api/pesv/inspecciones/:id/pdf — PDF individual de una inspección preoperacional
  app.get('/api/pesv/inspecciones/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [ins] = await db.select().from(schema.vehicleInspections)
        .where(eq(schema.vehicleInspections.id, id)).limit(1);
      if (!ins) return res.status(404).send('Inspección no encontrada');

      const [vehicle] = await db.select().from(schema.vehicles)
        .where(eq(schema.vehicles.id, ins.vehicleId)).limit(1);
      const [driver] = await db.select().from(schema.drivers)
        .where(eq(schema.drivers.id, ins.driverId)).limit(1);

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: PDF_CONFIG.MARGIN, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      const plate = vehicle?.plate || ins.vehicleId;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="inspeccion-${plate}-${ins.inspectionDate}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company,
        documentTitle: 'INSPECCIÓN PREOPERACIONAL DE VEHÍCULO',
        documentCode: 'PESV-H08-INS',
        logoBuffer,
      });

      y = addParagraph(doc, 'Resolución 40595/2022 — Art. 14 · Plan Estratégico de Seguridad Vial (PESV)', { y, fontSize: 8 });
      y += 6;

      // ─── SECCIÓN 1: Datos del registro ───────────────────────────────────
      y = addSectionBar(doc, '1. Datos del Registro', y);
      y = addLabeledField(doc, 'Vehículo (Placa)', vehicle ? `${vehicle.plate} — ${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ins.vehicleId, { y });
      y = addLabeledField(doc, 'Conductor', driver?.name || ins.driverId, { y });
      y = addLabeledField(doc, 'Fecha', formatDate(ins.inspectionDate), { y });
      y = addLabeledField(doc, 'Hora', ins.inspectionTime || 'N/A', { y });

      const bienFalla = (val: number) => val === 1 ? 'BIEN' : 'FALLA';

      // ─── SECCIÓN 2: Verificación Exterior ────────────────────────────────
      y = addSectionBar(doc, '2. Verificación Exterior', y);
      const extRows = [
        ['Llantas', bienFalla(ins.tires)],
        ['Luces', bienFalla(ins.lights)],
        ['Espejos', bienFalla(ins.mirrors)],
        ['Carrocería', bienFalla(ins.bodywork)],
      ];
      y = addSimpleTable(doc, ['Ítem', 'Estado'], extRows, { y, columnWidths: [400, 131] });

      // ─── SECCIÓN 3: Verificación Interior ────────────────────────────────
      y = addSectionBar(doc, '3. Verificación Interior', y);
      const intRows = [
        ['Cinturones de Seguridad', bienFalla(ins.seatbelts)],
        ['Pito / Bocina', bienFalla(ins.horn)],
        ['Parabrisas', bienFalla(ins.windshield)],
        ['Instrumentos del Panel', bienFalla(ins.instruments)],
      ];
      y = addSimpleTable(doc, ['Ítem', 'Estado'], intRows, { y, columnWidths: [400, 131] });

      // ─── SECCIÓN 4: Verificación Mecánica ────────────────────────────────
      y = addSectionBar(doc, '4. Verificación Mecánica', y);
      const mecRows = [
        ['Frenos', bienFalla(ins.brakes)],
        ['Dirección', bienFalla(ins.steering)],
        ['Suspensión', bienFalla(ins.suspension)],
        ['Fluidos (aceite, agua, refrigerante)', bienFalla(ins.fluids)],
      ];
      y = addSimpleTable(doc, ['Ítem', 'Estado'], mecRows, { y, columnWidths: [400, 131] });

      // ─── SECCIÓN 5: Equipos de Seguridad ─────────────────────────────────
      y = addSectionBar(doc, '5. Equipos de Seguridad', y);
      const segRows = [
        ['Extintor', bienFalla(ins.fireExtinguisher)],
        ['Botiquín de Primeros Auxilios', bienFalla(ins.firstAidKit)],
        ['Triángulos Reflectivos', bienFalla(ins.reflectiveTriangles)],
        ['Chaleco Reflectivo', bienFalla(ins.safetyVest)],
      ];
      y = addSimpleTable(doc, ['Ítem', 'Estado'], segRows, { y, columnWidths: [400, 131] });

      // ─── SECCIÓN 6: Resultado ─────────────────────────────────────────────
      y = addSectionBar(doc, '6. Resultado de la Inspección', y);
      const esApto = ins.result === 'apto';
      const resultText = esApto ? 'APTO PARA CIRCULAR' : 'NO APTO — REQUIERE CORRECCIONES';
      const resultBg = esApto ? '#dcfce7' : '#fee2e2';
      const resultColor = esApto ? '#166534' : '#991b1b';
      const margin = PDF_CONFIG.MARGIN;
      const tableWidth = doc.page.width - margin * 2;
      const resultBoxHeight = 44;
      const safeY = checkPageBreak(doc, resultBoxHeight + 10, y);
      doc.rect(margin, safeY, tableWidth, resultBoxHeight).fill(resultBg);
      doc.fontSize(16).font('Helvetica-Bold').fillColor(resultColor)
        .text(resultText, margin, safeY + 13, { width: tableWidth, align: 'center' });
      doc.fillColor(PDF_COLORS.BLACK);
      doc.y = safeY + resultBoxHeight + 8;
      y = doc.y;

      // ─── SECCIÓN 7: Observaciones y acciones ─────────────────────────────
      if (ins.observations) {
        y = addSectionBar(doc, '7. Observaciones', y);
        y = addParagraph(doc, ins.observations, { y });
      }
      if (ins.correctiveActions) {
        y = addSectionBar(doc, '8. Acciones Correctivas', y);
        y = addParagraph(doc, ins.correctiveActions, { y });
      }

      await addSignatureFooter(doc, signers, true, { startY: y + 24 });
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-inspeccion-individual');
    }
  });

  // 16. GET /api/pesv/encuestas-conductor/:id/pdf — PDF individual de una encuesta diaria
  app.get('/api/pesv/encuestas-conductor/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { id } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [enc] = await db.select().from(schema.pesvEncuestasConductor)
        .where(eq(schema.pesvEncuestasConductor.id, id)).limit(1);
      if (!enc) return res.status(404).send('Encuesta no encontrada');

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: PDF_CONFIG.MARGIN, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      const safeName = (enc.conductorNombre || 'conductor').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="encuesta-${safeName}-${enc.fechaRegistro}.pdf"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company,
        documentTitle: 'ENCUESTA DIARIA DEL CONDUCTOR',
        documentCode: 'PESV-H06-ENC',
        logoBuffer,
      });

      // Referencia normativa
      y = addParagraph(doc, 'Resolución 40595/2022 — Art. 18 · Plan Estratégico de Seguridad Vial (PESV)', { y, fontSize: 8 });
      y += 6;

      // ─── SECCIÓN 1: Datos del registro ───────────────────────────────────
      y = addSectionBar(doc, '1. Datos del Registro', y);
      y = addLabeledField(doc, 'Conductor', enc.conductorNombre || 'N/A', { y });
      y = addLabeledField(doc, 'Empresa', company.name, { y });
      y = addLabeledField(doc, 'Fecha', enc.fechaRegistro ? formatDate(enc.fechaRegistro) : 'N/A', { y });
      y = addLabeledField(doc, 'Hora', enc.horaRegistro || 'N/A', { y });
      y = addLabeledField(doc, 'Horas de Sueño', `${enc.horasSueno} hora(s)`, { y });
      if (enc.registradoPor) {
        y = addLabeledField(doc, 'Registrado Por', enc.registradoPor, { y });
      }

      // ─── SECCIÓN 2: Estado del conductor ─────────────────────────────────
      y = addSectionBar(doc, '2. Estado del Conductor', y);
      const estadoLabel = (val: string) =>
        val === 'bueno' ? 'BUENO' : val === 'regular' ? 'REGULAR' : val === 'malo' ? 'MALO' : (val || 'N/A').toUpperCase();
      y = addLabeledField(doc, 'Estado Físico', estadoLabel(enc.estadoFisico), { y });
      y = addLabeledField(doc, 'Estado Emocional', estadoLabel(enc.estadoEmocional), { y });

      // ─── SECCIÓN 3: Declaraciones ─────────────────────────────────────────
      y = addSectionBar(doc, '3. Declaraciones del Conductor', y);
      const siNo = (val: number | boolean) => (val ? 'SÍ' : 'NO');
      y = addLabeledField(doc, '¿Toma medicamentos que afecten conducción?', siNo(enc.tomaMedicamentos), { y });
      if (enc.tomaMedicamentos && enc.medicamentosDetalle) {
        y = addLabeledField(doc, '  Detalle medicamentos', enc.medicamentosDetalle, { y });
      }
      y = addLabeledField(doc, '¿Consumió alcohol en las últimas 12 horas?', siNo(enc.consumoAlcohol), { y });
      y = addLabeledField(doc, '¿Presenta enfermedad o molestia hoy?', siNo(enc.presentaEnfermedad), { y });
      if (enc.presentaEnfermedad && enc.enfermedadDetalle) {
        y = addLabeledField(doc, '  Detalle enfermedad', enc.enfermedadDetalle, { y });
      }

      // ─── SECCIÓN 4: Resultado ─────────────────────────────────────────────
      y = addSectionBar(doc, '4. Resultado de la Evaluación', y);
      const esApto = enc.resultado === 'apto';
      const resultText = esApto ? 'APTO PARA CONDUCIR' : 'NO APTO PARA CONDUCIR';
      const resultBg = esApto ? '#dcfce7' : '#fee2e2';
      const resultColor = esApto ? '#166534' : '#991b1b';
      const margin = PDF_CONFIG.MARGIN;
      const tableWidth = doc.page.width - margin * 2;
      const resultBoxHeight = 44;

      const safeY = checkPageBreak(doc, resultBoxHeight + 10, y);
      doc.rect(margin, safeY, tableWidth, resultBoxHeight).fill(resultBg);
      doc.fontSize(16).font('Helvetica-Bold').fillColor(resultColor)
        .text(resultText, margin, safeY + 13, { width: tableWidth, align: 'center' });
      doc.fillColor(PDF_COLORS.BLACK);
      doc.y = safeY + resultBoxHeight + 8;
      y = doc.y;

      // ─── SECCIÓN 5: Observaciones (si las hay) ───────────────────────────
      if (enc.observaciones) {
        y = addSectionBar(doc, '5. Observaciones', y);
        y = addParagraph(doc, enc.observaciones, { y });
      }

      await addSignatureFooter(doc, signers, true, { startY: y + 24 });
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-encuesta-conductor');
    }
  });

  // 17. GET /api/pesv/encuestas-conductor/pdf — PDF lista completa de encuestas
  app.get('/api/pesv/encuestas-conductor/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const encuestas = await db.select().from(schema.pesvEncuestasConductor)
        .where(eq(schema.pesvEncuestasConductor.companyId, companyId))
        .orderBy(desc(schema.pesvEncuestasConductor.fechaRegistro));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="encuestas-diarias-conductores.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'ENCUESTAS DIARIAS DE CONDUCTORES',
        documentCode: 'PESV-H06-ENC', logoBuffer
      });

      const estadoLabel = (val: string) =>
        val === 'bueno' ? 'Bueno' : val === 'regular' ? 'Regular' : val === 'malo' ? 'Malo' : val || '—';

      const rows = encuestas.map(e => [
        e.conductorNombre,
        e.fechaRegistro ? formatDate(e.fechaRegistro) : '—',
        e.horaRegistro || '—',
        `${e.horasSueno}h`,
        estadoLabel(e.estadoFisico),
        estadoLabel(e.estadoEmocional),
        e.resultado === 'apto' ? 'APTO' : 'NO APTO',
      ]);

      y = addSimpleTable(
        doc,
        ['Conductor', 'Fecha', 'Hora', 'Sueño', 'F. Físico', 'F. Emocional', 'Resultado'],
        rows,
        { y }
      );

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-encuestas-lista');
    }
  });

  // 15. GET /api/pesv/siniestros/pdf
  app.get('/api/pesv/siniestros/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const siniestros = await db.select().from(schema.roadIncidents).where(eq(schema.roadIncidents.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="siniestros-pesv.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'REGISTRO DE SINIESTROS VIALES',
        documentCode: 'PESV-SIN', logoBuffer
      });

      const rows = siniestros.map(s => [
        formatDate(s.incidentDate), s.type, s.location,
        s.vehicleId, s.driverId, s.severity
      ]);
      y = addSimpleTable(doc, ['Fecha', 'Tipo', 'Ubicación', 'Vehículo', 'Conductor', 'Gravedad'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-siniestros');
    }
  });

  // 15. GET /api/pesv/h07/pdf — H07 Gestión de la Velocidad: Reporte consolidado (todos los vehículos)
  app.get('/api/pesv/h07/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const vehicles = await db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId));
      const allGps = await db.select().from(schema.vehicleGpsTracking)
        .where(eq(schema.vehicleGpsTracking.companyId, companyId))
        .orderBy(desc(schema.vehicleGpsTracking.createdAt));
      const allAlerts = await db.select().from(schema.sstSpeedAlerts)
        .where(eq(schema.sstSpeedAlerts.companyId, companyId))
        .orderBy(desc(schema.sstSpeedAlerts.createdAt));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="h07-gestion-velocidad-consolidado.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'H07 — REPORTE DE GESTIÓN DE LA VELOCIDAD',
        documentCode: 'PESV-H07', logoBuffer
      });

      y = addParagraph(doc,
        'Resolución 40595/2022, Art. 19 — Controles para la gestión de la velocidad. ' +
        'Aplica a niveles Estándar (11–50 vehículos) y Avanzado (+50 vehículos).',
        { y }
      );

      if (vehicles.length === 0) {
        y = addParagraph(doc, 'No hay vehículos registrados en el parque automotor.', { y });
      } else {
        for (const vehicle of vehicles) {
          y = checkPageBreak(doc, 80, y);
          y = addSectionBar(doc, `Vehiculo: ${vehicle.plate} - ${vehicle.brand} ${vehicle.model} (${vehicle.year})`, y);

          y = addLabeledField(doc, 'Tipo', vehicle.type, { y });
          y = addLabeledField(doc, 'Estado', vehicle.status, { y });
          if (vehicle.defaultMaxSpeed) {
            y = addLabeledField(doc, 'Vel. max. permitida', `${vehicle.defaultMaxSpeed} km/h`, { y });
          }
          y += 6;

          const gpsRows = allGps.filter(g => g.vehicleId === vehicle.id);
          if (gpsRows.length > 0) {
            y = checkPageBreak(doc, 40, y);
            doc.fontSize(9).fillColor(PDF_COLORS.GREEN_DARK).text('Registros GPS / Velocidad', PDF_CONFIG.MARGIN, y);
            y += 14;
            const gpsTableRows = gpsRows.slice(0, 30).map(g => [
              formatDate(g.trackingDate),
              g.trackingTime || '-',
              g.speed != null ? `${g.speed} km/h` : '-',
              g.maxSpeedAllowed != null ? `${g.maxSpeedAllowed} km/h` : '-',
              g.speedExceeded ? 'Si' : 'No',
              g.engineStatus || '-',
              g.alertType || '-',
            ]);
            y = addSimpleTable(doc,
              ['Fecha', 'Hora', 'Velocidad', 'Limite', 'Exceso', 'Motor', 'Alerta'],
              gpsTableRows, { y }
            );
          } else {
            doc.fontSize(9).fillColor(PDF_COLORS.BLACK).text('Sin registros GPS para este vehiculo.', PDF_CONFIG.MARGIN, y);
            y += 14;
          }

          const alertRows = allAlerts.filter(a => a.vehicleId === vehicle.id);
          if (alertRows.length > 0) {
            y = checkPageBreak(doc, 40, y);
            doc.fontSize(9).fillColor(PDF_COLORS.GREEN_DARK).text('Alertas de Velocidad', PDF_CONFIG.MARGIN, y);
            y += 14;
            const alertTableRows = alertRows.slice(0, 20).map(a => [
              formatDate(a.alertDate),
              a.alertTime || '-',
              `${a.registeredSpeed} km/h`,
              `${a.maxAllowedSpeed} km/h`,
              `+${a.speedDifference} km/h`,
              a.severity === 'critica' ? 'Critica' : a.severity === 'grave' ? 'Grave' : a.severity === 'moderada' ? 'Moderada' : 'Leve',
              a.status === 'accion_correctiva' ? 'Accion Correctiva' : a.status === 'en_revision' ? 'En Revision' : a.status === 'cerrada' ? 'Cerrada' : 'Abierta',
              a.responsiblePerson || '-',
            ]);
            y = addSimpleTable(doc,
              ['Fecha', 'Hora', 'Velocidad', 'Limite', 'Diferencia', 'Severidad', 'Estado', 'Responsable'],
              alertTableRows, { y }
            );
          } else {
            doc.fontSize(9).fillColor(PDF_COLORS.BLACK).text('Sin alertas de velocidad para este vehiculo.', PDF_CONFIG.MARGIN, y);
            y += 14;
          }
          y += 8;
        }
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-h07-consolidado');
    }
  });

  // 16. GET /api/pesv/h07/vehiculo/:vehiculoId/pdf — H07: Reporte individual por vehículo
  app.get('/api/pesv/h07/vehiculo/:vehiculoId/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');
      const { vehiculoId } = req.params;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [vehicle] = await db.select().from(schema.vehicles)
        .where(and(eq(schema.vehicles.id, vehiculoId), eq(schema.vehicles.companyId, companyId)))
        .limit(1);
      if (!vehicle) return res.status(404).send('Vehiculo no encontrado o no pertenece a esta empresa');

      const gpsRows = await db.select().from(schema.vehicleGpsTracking)
        .where(and(
          eq(schema.vehicleGpsTracking.vehicleId, vehiculoId),
          eq(schema.vehicleGpsTracking.companyId, companyId)
        ))
        .orderBy(desc(schema.vehicleGpsTracking.createdAt));

      const alertRows = await db.select().from(schema.sstSpeedAlerts)
        .where(and(
          eq(schema.sstSpeedAlerts.vehicleId, vehiculoId),
          eq(schema.sstSpeedAlerts.companyId, companyId)
        ))
        .orderBy(desc(schema.sstSpeedAlerts.createdAt));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      const filename = `h07-velocidad-${vehicle.plate.replace(/\s/g, '-')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company,
        documentTitle: `H07 - GESTION DE LA VELOCIDAD: ${vehicle.plate}`,
        documentCode: 'PESV-H07-V', logoBuffer
      });

      y = addSectionBar(doc, 'Datos del Vehiculo', y);
      y = addLabeledField(doc, 'Placa', vehicle.plate, { y });
      y = addLabeledField(doc, 'Marca', vehicle.brand, { y });
      y = addLabeledField(doc, 'Modelo', vehicle.model, { y });
      y = addLabeledField(doc, 'Anio', String(vehicle.year), { y });
      y = addLabeledField(doc, 'Tipo', vehicle.type, { y });
      y = addLabeledField(doc, 'Estado', vehicle.status, { y });
      if (vehicle.defaultMaxSpeed) {
        y = addLabeledField(doc, 'Vel. max. permitida', `${vehicle.defaultMaxSpeed} km/h`, { y });
      }
      if (vehicle.soatExpiry) {
        y = addLabeledField(doc, 'Venc. SOAT', formatDate(vehicle.soatExpiry), { y });
      }
      if (vehicle.technicalReviewExpiry) {
        y = addLabeledField(doc, 'Venc. Revision Tecnica', formatDate(vehicle.technicalReviewExpiry), { y });
      }
      y += 10;

      y = addSectionBar(doc, `Registros GPS / Velocidad (${gpsRows.length} registros)`, y);
      if (gpsRows.length === 0) {
        doc.fontSize(9).fillColor(PDF_COLORS.BLACK).text('Sin registros GPS para este vehiculo.', PDF_CONFIG.MARGIN, y);
        y += 16;
      } else {
        const gpsTableRows = gpsRows.map(g => [
          formatDate(g.trackingDate),
          g.trackingTime || '-',
          g.speed != null ? `${g.speed} km/h` : '-',
          g.maxSpeedAllowed != null ? `${g.maxSpeedAllowed} km/h` : '-',
          g.speedExceeded ? 'SI' : 'No',
          g.engineStatus || '-',
          g.alertType || '-',
          (g.observations || '').slice(0, 30) || '-',
        ]);
        y = addSimpleTable(doc,
          ['Fecha', 'Hora', 'Velocidad', 'Limite', 'Exceso', 'Motor', 'Alerta', 'Observaciones'],
          gpsTableRows, { y }
        );
      }

      y = checkPageBreak(doc, 60, y);
      y = addSectionBar(doc, `Alertas de Velocidad (${alertRows.length} alertas)`, y);
      if (alertRows.length === 0) {
        doc.fontSize(9).fillColor(PDF_COLORS.BLACK).text('Sin alertas de velocidad para este vehiculo.', PDF_CONFIG.MARGIN, y);
        y += 16;
      } else {
        const alertTableRows = alertRows.map(a => [
          formatDate(a.alertDate),
          a.alertTime || '-',
          `${a.registeredSpeed} km/h`,
          `${a.maxAllowedSpeed} km/h`,
          `+${a.speedDifference} km/h`,
          a.severity === 'critica' ? 'Critica' : a.severity === 'grave' ? 'Grave' : a.severity === 'moderada' ? 'Moderada' : 'Leve',
          a.status === 'accion_correctiva' ? 'Accion Correctiva' : a.status === 'en_revision' ? 'En Revision' : a.status === 'cerrada' ? 'Cerrada' : 'Abierta',
          a.responsiblePerson || '-',
          (a.correctiveAction || '').slice(0, 40) || '-',
        ]);
        y = addSimpleTable(doc,
          ['Fecha', 'Hora', 'Vel. Reg.', 'Limite', 'Diferencia', 'Severidad', 'Estado', 'Responsable', 'Accion Correctiva'],
          alertTableRows, { y }
        );

        const open = alertRows.filter(a => a.status === 'abierta').length;
        const closed = alertRows.filter(a => a.status === 'cerrada').length;
        const inReview = alertRows.filter(a => a.status === 'en_revision').length;
        const corrective = alertRows.filter(a => a.status === 'accion_correctiva').length;
        const critical = alertRows.filter(a => a.severity === 'critica').length;
        const grave = alertRows.filter(a => a.severity === 'grave').length;

        y = checkPageBreak(doc, 50, y);
        y += 6;
        doc.fontSize(9).fillColor(PDF_COLORS.GREEN_DARK).text('Resumen de alertas:', PDF_CONFIG.MARGIN, y);
        y += 14;
        y = addSimpleTable(doc,
          ['Total', 'Abiertas', 'En Revision', 'Accion Correctiva', 'Cerradas', 'Criticas', 'Graves'],
          [[
            String(alertRows.length), String(open), String(inReview),
            String(corrective), String(closed), String(critical), String(grave)
          ]],
          { y }
        );
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-h07-vehiculo');
    }
  });

  // GET /api/pesv/alcohol-registros/pdf - Informe general de control de alcohol y SAP
  app.get('/api/pesv/alcohol-registros/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const registros = await db.select().from(schema.pesvAlcoholRegistros).where(eq(schema.pesvAlcoholRegistros.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="informe-alcohol-sap.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'INFORME GENERAL - CONTROL DE ALCOHOL Y SUSTANCIAS PSICOACTIVAS',
        documentCode: 'PESV-SAP-GEN', logoBuffer
      });

      y = addSectionBar(doc, `Registros de Control SAP (${registros.length})`, y);
      if (registros.length === 0) {
        y = addParagraph(doc, 'No hay registros de control de alcohol y sustancias psicoactivas.', { y });
      } else {
        const rows = registros.map(r => [
          r.conductorNombre, formatDate(r.fechaRegistro), r.tipoPrueba, r.sustanciaControlada, r.resultado, r.responsable || '—'
        ]);
        y = addSimpleTable(doc, ['Conductor', 'Fecha', 'Tipo de Prueba', 'Sustancia', 'Resultado', 'Responsable'], rows, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-alcohol-registros-general');
    }
  });

  // GET /api/pesv/alcohol-registros/:id/pdf - Ficha individual del registro de control SAP
  app.get('/api/pesv/alcohol-registros/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [registro] = await db.select().from(schema.pesvAlcoholRegistros)
        .where(and(eq(schema.pesvAlcoholRegistros.id, req.params.id), eq(schema.pesvAlcoholRegistros.companyId, companyId)))
        .limit(1);
      if (!registro) return res.status(404).send('Registro no encontrado');

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="registro-alcohol-sap.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'FICHA DE CONTROL DE ALCOHOL Y SUSTANCIAS PSICOACTIVAS',
        documentCode: 'PESV-SAP-IND', logoBuffer
      });

      y = addSectionBar(doc, 'Datos del Registro', y);
      y = addLabeledField(doc, 'Conductor', registro.conductorNombre, { y });
      y = addLabeledField(doc, 'Fecha de Registro', formatDate(registro.fechaRegistro), { y });
      y = addLabeledField(doc, 'Tipo de Prueba', registro.tipoPrueba, { y });
      y = addLabeledField(doc, 'Sustancia Controlada', registro.sustanciaControlada, { y });
      y = addLabeledField(doc, 'Resultado', registro.resultado, { y });
      y = addLabeledField(doc, 'Responsable', registro.responsable || '—', { y });
      y = addLabeledField(doc, 'Medidas Tomadas', registro.medidasTomadas || '—', { y });

      if (registro.observaciones) {
        y = addSectionBar(doc, 'Observaciones', y);
        y = addParagraph(doc, registro.observaciones, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-alcohol-registro-individual');
    }
  });

  // GET /api/pesv/fatiga-registros/pdf - Informe general de control de fatiga y somnolencia
  app.get('/api/pesv/fatiga-registros/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const registros = await db.select().from(schema.pesvFatigaRegistros).where(eq(schema.pesvFatigaRegistros.companyId, companyId));

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="informe-fatiga-somnolencia.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'INFORME GENERAL - CONTROL DE FATIGA Y SOMNOLENCIA',
        documentCode: 'PESV-FATIGA-GEN', logoBuffer
      });

      y = addSectionBar(doc, `Registros de Control de Fatiga (${registros.length})`, y);
      if (registros.length === 0) {
        y = addParagraph(doc, 'No hay registros de control de fatiga y somnolencia.', { y });
      } else {
        const rows = registros.map(r => [
          r.conductorNombre, formatDate(r.fechaRegistro), r.tipoControl, r.resultado,
          r.horasConduccion != null ? `${r.horasConduccion}h` : '—',
          r.descansoCumplido === 1 ? 'Sí' : 'No', r.responsable || '—'
        ]);
        y = addSimpleTable(doc, ['Conductor', 'Fecha', 'Tipo Control', 'Resultado', 'Horas Cond.', 'Descanso', 'Responsable'], rows, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-fatiga-registros-general');
    }
  });

  // GET /api/pesv/fatiga-registros/:id/pdf - Ficha individual del registro de control de fatiga
  app.get('/api/pesv/fatiga-registros/:id/pdf', requireAuth, viewPermission, async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(403).send('Empresa no identificada');

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).send('Empresa no encontrada');

      const [registro] = await db.select().from(schema.pesvFatigaRegistros)
        .where(and(eq(schema.pesvFatigaRegistros.id, req.params.id), eq(schema.pesvFatigaRegistros.companyId, companyId)))
        .limit(1);
      if (!registro) return res.status(404).send('Registro no encontrado');

      const { default: PDFDocument } = await import('pdfkit');
      const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

      const subscription = await storage.getSubscriptionByCompany(companyId);
      const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
      setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="registro-fatiga-somnolencia.pdf"');
      doc.pipe(res);

      const logoBuffer = await loadCompanyLogo(company.logoUrl);
      const signers = await getSignersForCompany(companyId, true);

      let y = await addStandardHeader({
        doc, company, documentTitle: 'FICHA DE CONTROL DE FATIGA Y SOMNOLENCIA',
        documentCode: 'PESV-FATIGA-IND', logoBuffer
      });

      y = addSectionBar(doc, 'Datos del Registro', y);
      y = addLabeledField(doc, 'Conductor', registro.conductorNombre, { y });
      y = addLabeledField(doc, 'Fecha de Registro', formatDate(registro.fechaRegistro), { y });
      y = addLabeledField(doc, 'Tipo de Control', registro.tipoControl, { y });
      y = addLabeledField(doc, 'Resultado', registro.resultado, { y });
      y = addLabeledField(doc, 'Horas de Conducción', registro.horasConduccion != null ? `${registro.horasConduccion}h` : '—', { y });
      y = addLabeledField(doc, 'Descanso Cumplido', registro.descansoCumplido === 1 ? 'Sí' : 'No', { y });
      y = addLabeledField(doc, 'Responsable', registro.responsable || '—', { y });
      y = addLabeledField(doc, 'Medidas Tomadas', registro.medidasTomadas || '—', { y });

      if (registro.observaciones) {
        y = addSectionBar(doc, 'Observaciones', y);
        y = addParagraph(doc, registro.observaciones, { y });
      }

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-fatiga-registro-individual');
    }
  });
}

export default registerPesvPdfRoutes;
