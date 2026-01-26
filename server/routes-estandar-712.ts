import { Express, Request, Response } from "express";
import { db } from "./db";
import { 
  accionesRevision, 
  decisionesRevision,
  revisionesDireccion,
  users,
  insertAccionRevisionSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, requirePermission } from "./auth";

function formatDateForDb(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
}

function getEffectiveCompanyId(req: Request): string | null {
  const user = (req as any).user;
  if (!user) return null;
  
  if (user.role === 'superadmin') {
    const headerCompanyId = req.headers['x-company-id'];
    if (headerCompanyId && typeof headerCompanyId === 'string') {
      return headerCompanyId;
    }
    return user.companyId || null;
  }
  
  return user.companyId || null;
}

export function registerEstandar712Routes(app: Express) {
  
  // ==========================================
  // ACCIONES DE MEJORA POR REVISIÓN DE DIRECCIÓN - CRUD
  // Estándar 7.1.2 - Decreto 1072/2015 Art. 2.2.4.6.31
  // ==========================================
  
  app.get('/api/acciones-mejora-direccion', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const acciones = await db
        .select({
          id: accionesRevision.id,
          decisionId: accionesRevision.decisionId,
          companyId: accionesRevision.companyId,
          descripcion: accionesRevision.descripcion,
          responsable: accionesRevision.responsable,
          responsableNombre: accionesRevision.responsableNombre,
          fechaCompromiso: accionesRevision.fechaCompromiso,
          fechaImplementacion: accionesRevision.fechaImplementacion,
          prioridad: accionesRevision.prioridad,
          estado: accionesRevision.estado,
          avanceDescripcion: accionesRevision.avanceDescripcion,
          porcentajeAvance: accionesRevision.porcentajeAvance,
          evidenciaUrl: accionesRevision.evidenciaUrl,
          verificadoPor: accionesRevision.verificadoPor,
          fechaVerificacion: accionesRevision.fechaVerificacion,
          eficaz: accionesRevision.eficaz,
          observacionesVerificacion: accionesRevision.observacionesVerificacion,
          createdAt: accionesRevision.createdAt,
          updatedAt: accionesRevision.updatedAt,
          decisionDescripcion: decisionesRevision.descripcion,
          decisionTipo: decisionesRevision.tipo,
          revisionCodigo: revisionesDireccion.codigo,
          revisionTitulo: revisionesDireccion.titulo,
          revisionFecha: revisionesDireccion.fechaRevision
        })
        .from(accionesRevision)
        .leftJoin(decisionesRevision, eq(accionesRevision.decisionId, decisionesRevision.id))
        .leftJoin(revisionesDireccion, eq(decisionesRevision.revisionId, revisionesDireccion.id))
        .where(eq(accionesRevision.companyId, companyId))
        .orderBy(desc(accionesRevision.createdAt));
      
      res.json(acciones);
    } catch (error: any) {
      console.error('[API] Error fetching acciones mejora dirección:', error);
      res.status(500).json({ error: "Error al obtener acciones de mejora", message: error.message });
    }
  });
  
  app.get('/api/acciones-mejora-direccion/:id', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [accion] = await db
        .select({
          id: accionesRevision.id,
          decisionId: accionesRevision.decisionId,
          companyId: accionesRevision.companyId,
          descripcion: accionesRevision.descripcion,
          responsable: accionesRevision.responsable,
          responsableNombre: accionesRevision.responsableNombre,
          fechaCompromiso: accionesRevision.fechaCompromiso,
          fechaImplementacion: accionesRevision.fechaImplementacion,
          prioridad: accionesRevision.prioridad,
          estado: accionesRevision.estado,
          avanceDescripcion: accionesRevision.avanceDescripcion,
          porcentajeAvance: accionesRevision.porcentajeAvance,
          evidenciaUrl: accionesRevision.evidenciaUrl,
          verificadoPor: accionesRevision.verificadoPor,
          fechaVerificacion: accionesRevision.fechaVerificacion,
          eficaz: accionesRevision.eficaz,
          observacionesVerificacion: accionesRevision.observacionesVerificacion,
          createdAt: accionesRevision.createdAt,
          updatedAt: accionesRevision.updatedAt,
          decisionDescripcion: decisionesRevision.descripcion,
          decisionTipo: decisionesRevision.tipo,
          revisionCodigo: revisionesDireccion.codigo,
          revisionTitulo: revisionesDireccion.titulo,
          revisionFecha: revisionesDireccion.fechaRevision
        })
        .from(accionesRevision)
        .leftJoin(decisionesRevision, eq(accionesRevision.decisionId, decisionesRevision.id))
        .leftJoin(revisionesDireccion, eq(decisionesRevision.revisionId, revisionesDireccion.id))
        .where(and(
          eq(accionesRevision.id, id),
          eq(accionesRevision.companyId, companyId)
        ));
      
      if (!accion) {
        return res.status(404).json({ error: "Acción de mejora no encontrada" });
      }
      
      res.json(accion);
    } catch (error: any) {
      console.error('[API] Error fetching acción mejora dirección:', error);
      res.status(500).json({ error: "Error al obtener acción de mejora", message: error.message });
    }
  });
  
  app.post('/api/acciones-mejora-direccion', requireAuth, requirePermission('sst_management:create'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const validatedData = insertAccionRevisionSchema.parse(req.body);
      
      const fechaCompromisoStr = formatDateForDb(validatedData.fechaCompromiso);
      if (!fechaCompromisoStr) {
        return res.status(400).json({ error: "La fecha de compromiso es requerida" });
      }
      
      const [newAccion] = await db
        .insert(accionesRevision)
        .values({
          decisionId: validatedData.decisionId,
          descripcion: validatedData.descripcion,
          responsableNombre: validatedData.responsableNombre,
          responsable: validatedData.responsable || null,
          companyId,
          fechaCompromiso: fechaCompromisoStr,
          fechaImplementacion: formatDateForDb(validatedData.fechaImplementacion) || null,
          fechaVerificacion: formatDateForDb(validatedData.fechaVerificacion) || null,
          prioridad: validatedData.prioridad ?? 'media',
          estado: validatedData.estado ?? 'pendiente',
          porcentajeAvance: validatedData.porcentajeAvance ?? 0,
          avanceDescripcion: validatedData.avanceDescripcion || null,
          evidenciaUrl: validatedData.evidenciaUrl || null,
          verificadoPor: validatedData.verificadoPor || null,
          eficaz: validatedData.eficaz ?? null,
          observacionesVerificacion: validatedData.observacionesVerificacion || null,
        })
        .returning();
      
      console.log('[API] Nueva acción mejora dirección creada:', newAccion.id);
      res.status(201).json(newAccion);
    } catch (error: any) {
      console.error('[API] Error creating acción mejora dirección:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear acción de mejora", message: error.message });
    }
  });
  
  app.patch('/api/acciones-mejora-direccion/:id', requireAuth, requirePermission('sst_management:edit'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(accionesRevision)
        .where(and(
          eq(accionesRevision.id, id),
          eq(accionesRevision.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Acción de mejora no encontrada" });
      }
      
      const updateData = { ...req.body };
      if (updateData.fechaCompromiso) updateData.fechaCompromiso = formatDateForDb(updateData.fechaCompromiso);
      if (updateData.fechaImplementacion) updateData.fechaImplementacion = formatDateForDb(updateData.fechaImplementacion);
      if (updateData.fechaVerificacion) updateData.fechaVerificacion = formatDateForDb(updateData.fechaVerificacion);
      updateData.updatedAt = new Date();
      
      const [updated] = await db
        .update(accionesRevision)
        .set(updateData)
        .where(eq(accionesRevision.id, id))
        .returning();
      
      console.log('[API] Acción mejora dirección actualizada:', id);
      res.json(updated);
    } catch (error: any) {
      console.error('[API] Error updating acción mejora dirección:', error);
      res.status(500).json({ error: "Error al actualizar acción de mejora", message: error.message });
    }
  });
  
  app.delete('/api/acciones-mejora-direccion/:id', requireAuth, requirePermission('sst_management:delete'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(accionesRevision)
        .where(and(
          eq(accionesRevision.id, id),
          eq(accionesRevision.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Acción de mejora no encontrada" });
      }
      
      await db
        .delete(accionesRevision)
        .where(eq(accionesRevision.id, id));
      
      console.log('[API] Acción mejora dirección eliminada:', id);
      res.status(204).send();
    } catch (error: any) {
      console.error('[API] Error deleting acción mejora dirección:', error);
      res.status(500).json({ error: "Error al eliminar acción de mejora", message: error.message });
    }
  });
  
  // ==========================================
  // ESTADÍSTICAS PARA DASHBOARD 7.1.2
  // ==========================================
  
  app.get('/api/acciones-mejora-direccion/stats/resumen', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const acciones = await db
        .select()
        .from(accionesRevision)
        .where(eq(accionesRevision.companyId, companyId));
      
      const total = acciones.length;
      const pendientes = acciones.filter(a => a.estado === 'pendiente').length;
      const enProceso = acciones.filter(a => a.estado === 'en-proceso').length;
      const completadas = acciones.filter(a => a.estado === 'completada').length;
      const vencidas = acciones.filter(a => {
        if (a.estado === 'completada') return false;
        const fechaCompromiso = new Date(a.fechaCompromiso);
        return fechaCompromiso < new Date();
      }).length;
      const eficaces = acciones.filter(a => a.eficaz === 1).length;
      const noEficaces = acciones.filter(a => a.eficaz === 0).length;
      
      const tasaCumplimiento = total > 0 ? Math.round((completadas / total) * 100) : 0;
      const tasaEficacia = (completadas > 0) ? Math.round((eficaces / completadas) * 100) : 0;
      
      res.json({
        total,
        pendientes,
        enProceso,
        completadas,
        vencidas,
        eficaces,
        noEficaces,
        tasaCumplimiento,
        tasaEficacia
      });
    } catch (error: any) {
      console.error('[API] Error fetching stats acciones mejora dirección:', error);
      res.status(500).json({ error: "Error al obtener estadísticas", message: error.message });
    }
  });
  
  // ==========================================
  // DECISIONES DE REVISIÓN - Para selector
  // ==========================================
  
  app.get('/api/decisiones-revision', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const decisiones = await db
        .select({
          id: decisionesRevision.id,
          revisionId: decisionesRevision.revisionId,
          companyId: decisionesRevision.companyId,
          tipo: decisionesRevision.tipo,
          descripcion: decisionesRevision.descripcion,
          justificacion: decisionesRevision.justificacion,
          alcance: decisionesRevision.alcance,
          recursoNecesario: decisionesRevision.recursoNecesario,
          requiereAccion: decisionesRevision.requiereAccion,
          createdAt: decisionesRevision.createdAt,
          revisionCodigo: revisionesDireccion.codigo,
          revisionTitulo: revisionesDireccion.titulo,
          revisionFecha: revisionesDireccion.fechaRevision
        })
        .from(decisionesRevision)
        .leftJoin(revisionesDireccion, eq(decisionesRevision.revisionId, revisionesDireccion.id))
        .where(and(
          eq(decisionesRevision.companyId, companyId),
          eq(decisionesRevision.requiereAccion, 1)
        ))
        .orderBy(desc(decisionesRevision.createdAt));
      
      res.json(decisiones);
    } catch (error: any) {
      console.error('[API] Error fetching decisiones revisión:', error);
      res.status(500).json({ error: "Error al obtener decisiones", message: error.message });
    }
  });
  
  // ==========================================
  // USUARIOS - Para selector de responsables
  // ==========================================
  
  app.get('/api/usuarios-responsables', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const usuarios = await db
        .select({
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          role: users.role
        })
        .from(users)
        .where(eq(users.companyId, companyId));
      
      res.json(usuarios);
    } catch (error: any) {
      console.error('[API] Error fetching usuarios responsables:', error);
      res.status(500).json({ error: "Error al obtener usuarios", message: error.message });
    }
  });
}
