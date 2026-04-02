import { Express, Request, Response } from 'express';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import {
  pesvCriteriosVerificacion,
  pesvEvidenciasDocumentos,
  evaluacionesPesv,
  respuestasPasosPesv,
} from '@shared/schema';
import { requireAuth as authRequireAuth, requirePermission } from '../auth';

function getEffectiveCompanyId(req: Request): string | null {
  const user = (req as any).user;
  if (!user) return null;
  const globalRoles = ['superadmin', 'support_admin', 'support_viewer', 'lso'];
  if (globalRoles.includes(user.role) && (req.query.companyId as string)) {
    return req.query.companyId as string;
  }
  return user.companyId || null;
}

function getUserDisplayName(user: any): string {
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return user.fullName || user.username || 'Usuario';
}

export function registerPesvCriteriosEvidenciasRoutes(app: Express) {
  const requireAuth = authRequireAuth;

  app.get('/api/evaluaciones-pesv/:evaluacionId/criterios',
    requireAuth,
    requirePermission('sst_management:view'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;
        const pasoId = req.query.pasoId as string | undefined;

        let conditions = eq(pesvCriteriosVerificacion.evaluacionId, evaluacionId);
        if (pasoId) {
          conditions = and(conditions, eq(pesvCriteriosVerificacion.pasoId, pasoId))!;
        }

        const criterios = await db.select()
          .from(pesvCriteriosVerificacion)
          .where(conditions)
          .orderBy(pesvCriteriosVerificacion.pasoId, pesvCriteriosVerificacion.criterioIndex);

        res.json(criterios);
      } catch (error: any) {
        console.error('[PESV Criterios] Error fetching criterios:', error.message);
        res.status(500).json({ error: 'Error al obtener criterios de verificación' });
      }
    }
  );

  app.post('/api/evaluaciones-pesv/:evaluacionId/criterios',
    requireAuth,
    requirePermission('sst_management:create'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;
        const user = (req as any).user;
        const { pasoId, criterioIndex, criterioTexto, verificado, observacion, respuestaPasoId } = req.body;

        if (!pasoId || criterioIndex === undefined || !criterioTexto) {
          return res.status(400).json({ error: 'pasoId, criterioIndex y criterioTexto son requeridos' });
        }

        const existing = await db.select()
          .from(pesvCriteriosVerificacion)
          .where(and(
            eq(pesvCriteriosVerificacion.evaluacionId, evaluacionId),
            eq(pesvCriteriosVerificacion.pasoId, pasoId),
            eq(pesvCriteriosVerificacion.criterioIndex, criterioIndex)
          ));

        if (existing.length > 0) {
          const [updated] = await db.update(pesvCriteriosVerificacion)
            .set({
              verificado: verificado ? 1 : 0,
              verificadoPor: verificado ? user.id : null,
              verificadoNombre: verificado ? getUserDisplayName(user) : null,
              fechaVerificacion: verificado ? new Date() : null,
              observacion: observacion || null,
              respuestaPasoId: respuestaPasoId || existing[0].respuestaPasoId,
              updatedAt: new Date(),
            })
            .where(eq(pesvCriteriosVerificacion.id, existing[0].id))
            .returning();
          return res.json(updated);
        }

        const [created] = await db.insert(pesvCriteriosVerificacion)
          .values({
            evaluacionId,
            respuestaPasoId: respuestaPasoId || null,
            pasoId,
            criterioIndex,
            criterioTexto,
            verificado: verificado ? 1 : 0,
            verificadoPor: verificado ? user.id : null,
            verificadoNombre: verificado ? getUserDisplayName(user) : null,
            fechaVerificacion: verificado ? new Date() : null,
            observacion: observacion || null,
          })
          .returning();

        res.json(created);
      } catch (error: any) {
        console.error('[PESV Criterios] Error saving criterio:', error.message);
        res.status(500).json({ error: 'Error al guardar criterio de verificación' });
      }
    }
  );

  app.post('/api/evaluaciones-pesv/:evaluacionId/criterios/batch',
    requireAuth,
    requirePermission('sst_management:create'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;
        const user = (req as any).user;
        const { pasoId, criterios, respuestaPasoId } = req.body;

        if (!pasoId || !Array.isArray(criterios)) {
          return res.status(400).json({ error: 'pasoId y criterios[] son requeridos' });
        }

        const results = [];
        for (const criterio of criterios) {
          const existing = await db.select()
            .from(pesvCriteriosVerificacion)
            .where(and(
              eq(pesvCriteriosVerificacion.evaluacionId, evaluacionId),
              eq(pesvCriteriosVerificacion.pasoId, pasoId),
              eq(pesvCriteriosVerificacion.criterioIndex, criterio.criterioIndex)
            ));

          if (existing.length > 0) {
            const [updated] = await db.update(pesvCriteriosVerificacion)
              .set({
                verificado: criterio.verificado ? 1 : 0,
                verificadoPor: criterio.verificado ? user.id : null,
                verificadoNombre: criterio.verificado ? getUserDisplayName(user) : null,
                fechaVerificacion: criterio.verificado ? new Date() : null,
                observacion: criterio.observacion || null,
                respuestaPasoId: respuestaPasoId || existing[0].respuestaPasoId,
                updatedAt: new Date(),
              })
              .where(eq(pesvCriteriosVerificacion.id, existing[0].id))
              .returning();
            results.push(updated);
          } else {
            const [created] = await db.insert(pesvCriteriosVerificacion)
              .values({
                evaluacionId,
                respuestaPasoId: respuestaPasoId || null,
                pasoId,
                criterioIndex: criterio.criterioIndex,
                criterioTexto: criterio.criterioTexto,
                verificado: criterio.verificado ? 1 : 0,
                verificadoPor: criterio.verificado ? user.id : null,
                verificadoNombre: criterio.verificado ? getUserDisplayName(user) : null,
                fechaVerificacion: criterio.verificado ? new Date() : null,
                observacion: criterio.observacion || null,
              })
              .returning();
            results.push(created);
          }
        }

        res.json(results);
      } catch (error: any) {
        console.error('[PESV Criterios] Error batch saving criterios:', error.message);
        res.status(500).json({ error: 'Error al guardar criterios de verificación' });
      }
    }
  );

  app.get('/api/evaluaciones-pesv/:evaluacionId/evidencias-docs',
    requireAuth,
    requirePermission('sst_management:view'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;
        const pasoId = req.query.pasoId as string | undefined;

        let conditions = eq(pesvEvidenciasDocumentos.evaluacionId, evaluacionId);
        if (pasoId) {
          conditions = and(conditions, eq(pesvEvidenciasDocumentos.pasoId, pasoId))!;
        }

        const evidencias = await db.select()
          .from(pesvEvidenciasDocumentos)
          .where(conditions)
          .orderBy(pesvEvidenciasDocumentos.pasoId, pesvEvidenciasDocumentos.evidenciaIndex);

        res.json(evidencias);
      } catch (error: any) {
        console.error('[PESV Evidencias] Error fetching evidencias:', error.message);
        res.status(500).json({ error: 'Error al obtener evidencias' });
      }
    }
  );

  app.post('/api/evaluaciones-pesv/:evaluacionId/evidencias-docs',
    requireAuth,
    requirePermission('sst_management:create'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;
        const user = (req as any).user;
        const { pasoId, evidenciaIndex, evidenciaTexto, archivoUrl, archivoNombre, archivoTipo, archivoTamanio, observacion, respuestaPasoId } = req.body;

        if (!pasoId || evidenciaIndex === undefined || !evidenciaTexto) {
          return res.status(400).json({ error: 'pasoId, evidenciaIndex y evidenciaTexto son requeridos' });
        }

        const existing = await db.select()
          .from(pesvEvidenciasDocumentos)
          .where(and(
            eq(pesvEvidenciasDocumentos.evaluacionId, evaluacionId),
            eq(pesvEvidenciasDocumentos.pasoId, pasoId),
            eq(pesvEvidenciasDocumentos.evidenciaIndex, evidenciaIndex)
          ));

        if (existing.length > 0) {
          const [updated] = await db.update(pesvEvidenciasDocumentos)
            .set({
              archivoUrl: archivoUrl || existing[0].archivoUrl,
              archivoNombre: archivoNombre || existing[0].archivoNombre,
              archivoTipo: archivoTipo || existing[0].archivoTipo,
              archivoTamanio: archivoTamanio || existing[0].archivoTamanio,
              subidoPor: archivoUrl ? user.id : existing[0].subidoPor,
              subidoNombre: archivoUrl ? getUserDisplayName(user) : existing[0].subidoNombre,
              fechaSubida: archivoUrl ? new Date() : existing[0].fechaSubida,
              observacion: observacion !== undefined ? observacion : existing[0].observacion,
              respuestaPasoId: respuestaPasoId || existing[0].respuestaPasoId,
              updatedAt: new Date(),
            })
            .where(eq(pesvEvidenciasDocumentos.id, existing[0].id))
            .returning();
          return res.json(updated);
        }

        const [created] = await db.insert(pesvEvidenciasDocumentos)
          .values({
            evaluacionId,
            respuestaPasoId: respuestaPasoId || null,
            pasoId,
            evidenciaIndex,
            evidenciaTexto,
            archivoUrl: archivoUrl || null,
            archivoNombre: archivoNombre || null,
            archivoTipo: archivoTipo || null,
            archivoTamanio: archivoTamanio || null,
            subidoPor: archivoUrl ? user.id : null,
            subidoNombre: archivoUrl ? getUserDisplayName(user) : null,
            fechaSubida: archivoUrl ? new Date() : null,
            observacion: observacion || null,
          })
          .returning();

        res.json(created);
      } catch (error: any) {
        console.error('[PESV Evidencias] Error saving evidencia:', error.message);
        res.status(500).json({ error: 'Error al guardar evidencia' });
      }
    }
  );

  app.delete('/api/evaluaciones-pesv/:evaluacionId/evidencias-docs/:evidenciaId',
    requireAuth,
    requirePermission('sst_management:delete'),
    async (req: Request, res: Response) => {
      try {
        const { evidenciaId } = req.params;

        const [deleted] = await db.update(pesvEvidenciasDocumentos)
          .set({
            archivoUrl: null,
            archivoNombre: null,
            archivoTipo: null,
            archivoTamanio: null,
            subidoPor: null,
            subidoNombre: null,
            fechaSubida: null,
            updatedAt: new Date(),
          })
          .where(eq(pesvEvidenciasDocumentos.id, evidenciaId))
          .returning();

        if (!deleted) {
          return res.status(404).json({ error: 'Evidencia no encontrada' });
        }

        res.json(deleted);
      } catch (error: any) {
        console.error('[PESV Evidencias] Error removing archivo:', error.message);
        res.status(500).json({ error: 'Error al eliminar archivo de evidencia' });
      }
    }
  );

  app.get('/api/evaluaciones-pesv/:evaluacionId/verificacion-resumen',
    requireAuth,
    requirePermission('sst_management:view'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;

        const criterios = await db.select()
          .from(pesvCriteriosVerificacion)
          .where(eq(pesvCriteriosVerificacion.evaluacionId, evaluacionId));

        const evidencias = await db.select()
          .from(pesvEvidenciasDocumentos)
          .where(eq(pesvEvidenciasDocumentos.evaluacionId, evaluacionId));

        const resumen: Record<string, {
          totalCriterios: number;
          criteriosVerificados: number;
          totalEvidencias: number;
          evidenciasConArchivo: number;
          porcentajeCriterios: number;
          porcentajeEvidencias: number;
          cumpleAutomatico: boolean;
        }> = {};

        for (const c of criterios) {
          if (!resumen[c.pasoId]) {
            resumen[c.pasoId] = {
              totalCriterios: 0,
              criteriosVerificados: 0,
              totalEvidencias: 0,
              evidenciasConArchivo: 0,
              porcentajeCriterios: 0,
              porcentajeEvidencias: 0,
              cumpleAutomatico: false,
            };
          }
          resumen[c.pasoId].totalCriterios++;
          if (c.verificado === 1) {
            resumen[c.pasoId].criteriosVerificados++;
          }
        }

        for (const e of evidencias) {
          if (!resumen[e.pasoId]) {
            resumen[e.pasoId] = {
              totalCriterios: 0,
              criteriosVerificados: 0,
              totalEvidencias: 0,
              evidenciasConArchivo: 0,
              porcentajeCriterios: 0,
              porcentajeEvidencias: 0,
              cumpleAutomatico: false,
            };
          }
          resumen[e.pasoId].totalEvidencias++;
          if (e.archivoUrl) {
            resumen[e.pasoId].evidenciasConArchivo++;
          }
        }

        for (const pasoId of Object.keys(resumen)) {
          const r = resumen[pasoId];
          r.porcentajeCriterios = r.totalCriterios > 0
            ? Math.round((r.criteriosVerificados / r.totalCriterios) * 100)
            : 0;
          r.porcentajeEvidencias = r.totalEvidencias > 0
            ? Math.round((r.evidenciasConArchivo / r.totalEvidencias) * 100)
            : 0;
          r.cumpleAutomatico = r.totalCriterios > 0 && r.criteriosVerificados === r.totalCriterios;
        }

        res.json({
          evaluacionId,
          pasos: resumen,
          totalGeneral: {
            criterios: criterios.length,
            criteriosVerificados: criterios.filter(c => c.verificado === 1).length,
            evidencias: evidencias.length,
            evidenciasConArchivo: evidencias.filter(e => e.archivoUrl).length,
          },
        });
      } catch (error: any) {
        console.error('[PESV Resumen] Error fetching resumen:', error.message);
        res.status(500).json({ error: 'Error al obtener resumen de verificación' });
      }
    }
  );

  app.post('/api/evaluaciones-pesv/:evaluacionId/inicializar-criterios',
    requireAuth,
    requirePermission('sst_management:create'),
    async (req: Request, res: Response) => {
      try {
        const { evaluacionId } = req.params;
        const { pasoId, criterios, evidencias, respuestaPasoId } = req.body;

        if (!pasoId || !Array.isArray(criterios) || !Array.isArray(evidencias)) {
          return res.status(400).json({ error: 'pasoId, criterios[] y evidencias[] son requeridos' });
        }

        const existingCriterios = await db.select()
          .from(pesvCriteriosVerificacion)
          .where(and(
            eq(pesvCriteriosVerificacion.evaluacionId, evaluacionId),
            eq(pesvCriteriosVerificacion.pasoId, pasoId)
          ));

        const existingEvidencias = await db.select()
          .from(pesvEvidenciasDocumentos)
          .where(and(
            eq(pesvEvidenciasDocumentos.evaluacionId, evaluacionId),
            eq(pesvEvidenciasDocumentos.pasoId, pasoId)
          ));

        let criteriosCreated = 0;
        let evidenciasCreated = 0;

        if (existingCriterios.length === 0) {
          for (let i = 0; i < criterios.length; i++) {
            await db.insert(pesvCriteriosVerificacion).values({
              evaluacionId,
              respuestaPasoId: respuestaPasoId || null,
              pasoId,
              criterioIndex: i,
              criterioTexto: criterios[i],
              verificado: 0,
            });
            criteriosCreated++;
          }
        }

        if (existingEvidencias.length === 0) {
          for (let i = 0; i < evidencias.length; i++) {
            await db.insert(pesvEvidenciasDocumentos).values({
              evaluacionId,
              respuestaPasoId: respuestaPasoId || null,
              pasoId,
              evidenciaIndex: i,
              evidenciaTexto: evidencias[i],
            });
            evidenciasCreated++;
          }
        }

        res.json({
          message: 'Inicialización completada',
          criteriosCreated,
          evidenciasCreated,
          criteriosExistentes: existingCriterios.length,
          evidenciasExistentes: existingEvidencias.length,
        });
      } catch (error: any) {
        console.error('[PESV Init] Error initializing:', error.message);
        res.status(500).json({ error: 'Error al inicializar criterios y evidencias' });
      }
    }
  );
}
