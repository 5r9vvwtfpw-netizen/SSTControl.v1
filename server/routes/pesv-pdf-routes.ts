import { Express, Request, Response } from 'express';
import { db } from '../db';
import { eq, desc, and } from 'drizzle-orm';
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

      const conductores = await db.select().from(schema.drivers).where(eq(schema.drivers.companyId, companyId));

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
        doc, company, documentTitle: 'LISTADO DE CONDUCTORES - PESV',
        documentCode: 'PESV-COND', logoBuffer
      });

      const rows = conductores.map(c => [
        c.name, c.identificationNumber, c.licenseType, formatDate(c.licenseExpiry), c.status
      ]);
      y = addSimpleTable(doc, ['Nombre', 'Documento', 'Categoría Licencia', 'Vencimiento', 'Estado'], rows, { y });

      await addSignatureFooter(doc, signers, true);
      doc.end();
    } catch (error) {
      handlePdfError(error, res, 'pesv-conductores');
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
}

export default registerPesvPdfRoutes;
