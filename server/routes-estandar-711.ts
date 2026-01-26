import { Express, Request, Response } from "express";
import { db } from "./db";
import { 
  accionesCorrectivas, 
  noConformidades, 
  oportunidadesMejora,
  insertAccionCorrectivaSchema,
  insertNoConformidadSchema,
  insertOportunidadMejoraSchema
} from "@shared/schema";
import { eq, and, desc, count } from "drizzle-orm";
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

export function registerEstandar711Routes(app: Express) {
  
  // ==========================================
  // ACCIONES CORRECTIVAS CRUD
  // ==========================================
  
  app.get('/api/acciones-correctivas', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const acciones = await db
        .select()
        .from(accionesCorrectivas)
        .where(eq(accionesCorrectivas.companyId, companyId))
        .orderBy(desc(accionesCorrectivas.createdAt));
      
      res.json(acciones);
    } catch (error: any) {
      console.error('[API] Error fetching acciones correctivas:', error);
      res.status(500).json({ error: "Error al obtener acciones correctivas", message: error.message });
    }
  });
  
  app.get('/api/acciones-correctivas/:id', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [accion] = await db
        .select()
        .from(accionesCorrectivas)
        .where(and(
          eq(accionesCorrectivas.id, id),
          eq(accionesCorrectivas.companyId, companyId)
        ));
      
      if (!accion) {
        return res.status(404).json({ error: "Acción correctiva no encontrada" });
      }
      
      res.json(accion);
    } catch (error: any) {
      console.error('[API] Error fetching accion correctiva:', error);
      res.status(500).json({ error: "Error al obtener acción correctiva", message: error.message });
    }
  });
  
  app.post('/api/acciones-correctivas', requireAuth, requirePermission('sst_management:create'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const validatedData = insertAccionCorrectivaSchema.parse(req.body);
      
      const [newAccion] = await db
        .insert(accionesCorrectivas)
        .values({
          ...validatedData,
          companyId,
          createdById: (req as any).user?.id,
          fechaDeteccion: formatDateForDb(validatedData.fechaDeteccion) as string,
          fechaLimite: formatDateForDb(validatedData.fechaLimite) as string,
          fechaImplementacion: formatDateForDb(validatedData.fechaImplementacion),
          fechaVerificacion: formatDateForDb(validatedData.fechaVerificacion),
          fechaCierre: formatDateForDb(validatedData.fechaCierre)
        })
        .returning();
      
      res.status(201).json(newAccion);
    } catch (error: any) {
      console.error('[API] Error creating accion correctiva:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear acción correctiva", message: error.message });
    }
  });
  
  app.patch('/api/acciones-correctivas/:id', requireAuth, requirePermission('sst_management:edit'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(accionesCorrectivas)
        .where(and(
          eq(accionesCorrectivas.id, id),
          eq(accionesCorrectivas.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Acción correctiva no encontrada" });
      }
      
      const [updated] = await db
        .update(accionesCorrectivas)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(accionesCorrectivas.id, id))
        .returning();
      
      res.json(updated);
    } catch (error: any) {
      console.error('[API] Error updating accion correctiva:', error);
      res.status(500).json({ error: "Error al actualizar acción correctiva", message: error.message });
    }
  });
  
  app.delete('/api/acciones-correctivas/:id', requireAuth, requirePermission('sst_management:delete'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(accionesCorrectivas)
        .where(and(
          eq(accionesCorrectivas.id, id),
          eq(accionesCorrectivas.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Acción correctiva no encontrada" });
      }
      
      await db.delete(accionesCorrectivas).where(eq(accionesCorrectivas.id, id));
      
      res.json({ success: true, message: "Acción correctiva eliminada" });
    } catch (error: any) {
      console.error('[API] Error deleting accion correctiva:', error);
      res.status(500).json({ error: "Error al eliminar acción correctiva", message: error.message });
    }
  });
  
  // ==========================================
  // NO CONFORMIDADES CRUD
  // ==========================================
  
  app.get('/api/no-conformidades', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const ncs = await db
        .select()
        .from(noConformidades)
        .where(eq(noConformidades.companyId, companyId))
        .orderBy(desc(noConformidades.createdAt));
      
      res.json(ncs);
    } catch (error: any) {
      console.error('[API] Error fetching no conformidades:', error);
      res.status(500).json({ error: "Error al obtener no conformidades", message: error.message });
    }
  });
  
  app.get('/api/no-conformidades/:id', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [nc] = await db
        .select()
        .from(noConformidades)
        .where(and(
          eq(noConformidades.id, id),
          eq(noConformidades.companyId, companyId)
        ));
      
      if (!nc) {
        return res.status(404).json({ error: "No conformidad no encontrada" });
      }
      
      res.json(nc);
    } catch (error: any) {
      console.error('[API] Error fetching no conformidad:', error);
      res.status(500).json({ error: "Error al obtener no conformidad", message: error.message });
    }
  });
  
  app.post('/api/no-conformidades', requireAuth, requirePermission('sst_management:create'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const validatedData = insertNoConformidadSchema.parse(req.body);
      
      const [newNc] = await db
        .insert(noConformidades)
        .values({
          ...validatedData,
          companyId,
          createdById: (req as any).user?.id,
          fechaDeteccion: formatDateForDb(validatedData.fechaDeteccion) as string,
          fechaLimiteAnalisis: formatDateForDb(validatedData.fechaLimiteAnalisis),
          fechaCierre: formatDateForDb(validatedData.fechaCierre),
          fechaCorreccion: formatDateForDb(validatedData.fechaCorreccion)
        })
        .returning();
      
      res.status(201).json(newNc);
    } catch (error: any) {
      console.error('[API] Error creating no conformidad:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear no conformidad", message: error.message });
    }
  });
  
  app.patch('/api/no-conformidades/:id', requireAuth, requirePermission('sst_management:edit'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(noConformidades)
        .where(and(
          eq(noConformidades.id, id),
          eq(noConformidades.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "No conformidad no encontrada" });
      }
      
      const [updated] = await db
        .update(noConformidades)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(noConformidades.id, id))
        .returning();
      
      res.json(updated);
    } catch (error: any) {
      console.error('[API] Error updating no conformidad:', error);
      res.status(500).json({ error: "Error al actualizar no conformidad", message: error.message });
    }
  });
  
  app.delete('/api/no-conformidades/:id', requireAuth, requirePermission('sst_management:delete'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(noConformidades)
        .where(and(
          eq(noConformidades.id, id),
          eq(noConformidades.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "No conformidad no encontrada" });
      }
      
      await db.delete(noConformidades).where(eq(noConformidades.id, id));
      
      res.json({ success: true, message: "No conformidad eliminada" });
    } catch (error: any) {
      console.error('[API] Error deleting no conformidad:', error);
      res.status(500).json({ error: "Error al eliminar no conformidad", message: error.message });
    }
  });
  
  // ==========================================
  // OPORTUNIDADES DE MEJORA CRUD
  // ==========================================
  
  app.get('/api/oportunidades-mejora', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const oportunidades = await db
        .select()
        .from(oportunidadesMejora)
        .where(eq(oportunidadesMejora.companyId, companyId))
        .orderBy(desc(oportunidadesMejora.createdAt));
      
      res.json(oportunidades);
    } catch (error: any) {
      console.error('[API] Error fetching oportunidades mejora:', error);
      res.status(500).json({ error: "Error al obtener oportunidades de mejora", message: error.message });
    }
  });
  
  app.get('/api/oportunidades-mejora/:id', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [oportunidad] = await db
        .select()
        .from(oportunidadesMejora)
        .where(and(
          eq(oportunidadesMejora.id, id),
          eq(oportunidadesMejora.companyId, companyId)
        ));
      
      if (!oportunidad) {
        return res.status(404).json({ error: "Oportunidad de mejora no encontrada" });
      }
      
      res.json(oportunidad);
    } catch (error: any) {
      console.error('[API] Error fetching oportunidad mejora:', error);
      res.status(500).json({ error: "Error al obtener oportunidad de mejora", message: error.message });
    }
  });
  
  app.post('/api/oportunidades-mejora', requireAuth, requirePermission('sst_management:create'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const validatedData = insertOportunidadMejoraSchema.parse(req.body);
      
      const [newOportunidad] = await db
        .insert(oportunidadesMejora)
        .values({
          ...validatedData,
          companyId,
          createdById: (req as any).user?.id,
          fechaIdentificacion: formatDateForDb(validatedData.fechaIdentificacion) as string,
          fechaEvaluacion: formatDateForDb(validatedData.fechaEvaluacion),
          fechaAprobacion: formatDateForDb(validatedData.fechaAprobacion),
          fechaInicioImplementacion: formatDateForDb(validatedData.fechaInicioImplementacion),
          fechaFinImplementacion: formatDateForDb(validatedData.fechaFinImplementacion),
          fechaCierre: formatDateForDb(validatedData.fechaCierre)
        })
        .returning();
      
      res.status(201).json(newOportunidad);
    } catch (error: any) {
      console.error('[API] Error creating oportunidad mejora:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear oportunidad de mejora", message: error.message });
    }
  });
  
  app.patch('/api/oportunidades-mejora/:id', requireAuth, requirePermission('sst_management:edit'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(oportunidadesMejora)
        .where(and(
          eq(oportunidadesMejora.id, id),
          eq(oportunidadesMejora.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Oportunidad de mejora no encontrada" });
      }
      
      const [updated] = await db
        .update(oportunidadesMejora)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(oportunidadesMejora.id, id))
        .returning();
      
      res.json(updated);
    } catch (error: any) {
      console.error('[API] Error updating oportunidad mejora:', error);
      res.status(500).json({ error: "Error al actualizar oportunidad de mejora", message: error.message });
    }
  });
  
  app.delete('/api/oportunidades-mejora/:id', requireAuth, requirePermission('sst_management:delete'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [existing] = await db
        .select()
        .from(oportunidadesMejora)
        .where(and(
          eq(oportunidadesMejora.id, id),
          eq(oportunidadesMejora.companyId, companyId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Oportunidad de mejora no encontrada" });
      }
      
      await db.delete(oportunidadesMejora).where(eq(oportunidadesMejora.id, id));
      
      res.json({ success: true, message: "Oportunidad de mejora eliminada" });
    } catch (error: any) {
      console.error('[API] Error deleting oportunidad mejora:', error);
      res.status(500).json({ error: "Error al eliminar oportunidad de mejora", message: error.message });
    }
  });
  
  // ==========================================
  // ESTADÍSTICAS CONSOLIDADAS (Estándar 7.1.1)
  // ==========================================
  
  app.get('/api/estandar-711/estadisticas', requireAuth, requirePermission('sst_management:view'), async (req: Request, res: Response) => {
    try {
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(400).json({ error: "No se pudo determinar la empresa" });
      }
      
      const [accionesStats] = await db
        .select({ count: count() })
        .from(accionesCorrectivas)
        .where(eq(accionesCorrectivas.companyId, companyId));
      
      const [ncStats] = await db
        .select({ count: count() })
        .from(noConformidades)
        .where(eq(noConformidades.companyId, companyId));
      
      const [omStats] = await db
        .select({ count: count() })
        .from(oportunidadesMejora)
        .where(eq(oportunidadesMejora.companyId, companyId));
      
      res.json({
        accionesCorrectivas: accionesStats?.count || 0,
        noConformidades: ncStats?.count || 0,
        oportunidadesMejora: omStats?.count || 0,
        total: (accionesStats?.count || 0) + (ncStats?.count || 0) + (omStats?.count || 0)
      });
    } catch (error: any) {
      console.error('[API] Error fetching estandar 711 stats:', error);
      res.status(500).json({ error: "Error al obtener estadísticas", message: error.message });
    }
  });
  
  console.log('✅ Estándar 7.1.1 routes registered');
}
