import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { randomBytes } from "crypto";
import { resend } from "./services/email";
import PDFDocument from "pdfkit";
import { objectStorageService } from "./objectStorage";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getEffectiveCompanyId(req: any): string | null {
  const globalRoles = ['superadmin', 'lso', 'lso_externo'];
  if (globalRoles.includes(req.user?.role)) {
    const headerCompanyId = req.headers['x-company-id'] as string | undefined;
    const queryCompanyId = req.query?.companyId as string | undefined;
    if (headerCompanyId) return headerCompanyId;
    if (queryCompanyId) return queryCompanyId;
  }
  return req.user?.companyId || null;
}

export function registerInduccionVirtualRoutes(app: Express) {
  const pluginEnabled = process.env.ENABLE_INDUCCION_VIRTUAL_PLUGIN !== "false";
  if (!pluginEnabled) {
    console.log("[Inducción Virtual Plugin] DESHABILITADO por variable de entorno");
    // Register only public endpoints to return proper error
    app.get("/api/induccion-publica/:token", (req, res) => res.status(503).json({ error: "Módulo de inducción virtual temporalmente deshabilitado" }));
    app.post("/api/induccion-publica/:token/progreso", (req, res) => res.status(503).json({ error: "Módulo de inducción virtual temporalmente deshabilitado" }));
    app.post("/api/induccion-publica/:token/completar", (req, res) => res.status(503).json({ error: "Módulo de inducción virtual temporalmente deshabilitado" }));
    return;
  }
  console.log("[Inducción Virtual Plugin] Habilitado");
  
  // ============================================================================
  // CONTENIDOS DE INDUCCIÓN - CRUD para administradores
  // ============================================================================

  app.get("/api/contenidos-induccion", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }
      
      const contenidos = await db.select()
        .from(schema.contenidosInduccion)
        .where(eq(schema.contenidosInduccion.companyId, companyId))
        .orderBy(schema.contenidosInduccion.orden);
      
      res.json(contenidos);
    } catch (error: any) {
      console.error("Error fetching contenidos induccion:", error);
      res.status(500).send("Error al obtener contenidos de inducción");
    }
  });

  app.post("/api/contenidos-induccion", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const parsed = schema.insertContenidoInduccionSchema.parse(req.body);
      
      // Auto-assign orden: query max(orden) for this company and set orden = max + 1
      const [maxResult] = await db.select({ maxOrden: sql<number>`COALESCE(MAX(${schema.contenidosInduccion.orden}), 0)` })
        .from(schema.contenidosInduccion)
        .where(eq(schema.contenidosInduccion.companyId, companyId));
      
      const nextOrden = (maxResult?.maxOrden || 0) + 1;
      
      const [contenido] = await db.insert(schema.contenidosInduccion)
        .values({
          ...parsed,
          orden: nextOrden,
          companyId: companyId,
        })
        .returning();
      
      res.status(201).json(contenido);
    } catch (error: any) {
      console.error("Error creating contenido induccion:", error);
      res.status(500).send("Error al crear contenido de inducción");
    }
  });

  app.patch("/api/contenidos-induccion/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      // Strip orden from request body BEFORE Zod parsing to ensure it can never be changed via PATCH
      // orden should only change via dedicated /reorder endpoints
      const { orden: _ordenIgnored, ...bodyWithoutOrden } = req.body;
      const parsed = schema.insertContenidoInduccionSchema.partial().parse(bodyWithoutOrden);
      
      // updateData is now guaranteed to not contain orden
      const updateData = parsed;
      
      const [updated] = await db.update(schema.contenidosInduccion)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(
          eq(schema.contenidosInduccion.id, req.params.id),
          eq(schema.contenidosInduccion.companyId, companyId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).send("Contenido no encontrado");
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating contenido induccion:", error);
      res.status(500).send("Error al actualizar contenido de inducción");
    }
  });

  app.delete("/api/contenidos-induccion/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      await db.delete(schema.contenidosInduccion)
        .where(and(
          eq(schema.contenidosInduccion.id, req.params.id),
          eq(schema.contenidosInduccion.companyId, companyId)
        ));
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting contenido induccion:", error);
      res.status(500).send("Error al eliminar contenido de inducción");
    }
  });

  // ============================================================================
  // PREGUNTAS DE EVALUACIÓN - CRUD para administradores
  // ============================================================================

  app.get("/api/preguntas-induccion", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }
      
      const preguntas = await db.select()
        .from(schema.preguntasInduccion)
        .where(eq(schema.preguntasInduccion.companyId, companyId))
        .orderBy(schema.preguntasInduccion.orden);
      
      res.json(preguntas);
    } catch (error: any) {
      console.error("Error fetching preguntas induccion:", error);
      res.status(500).send("Error al obtener preguntas de inducción");
    }
  });

  app.post("/api/preguntas-induccion", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const parsed = schema.insertPreguntaInduccionSchema.parse(req.body);
      
      // Auto-assign orden: query max(orden) for this company and set orden = max + 1
      const [maxResult] = await db.select({ maxOrden: sql<number>`COALESCE(MAX(${schema.preguntasInduccion.orden}), 0)` })
        .from(schema.preguntasInduccion)
        .where(eq(schema.preguntasInduccion.companyId, companyId));
      
      const nextOrden = (maxResult?.maxOrden || 0) + 1;
      
      const [pregunta] = await db.insert(schema.preguntasInduccion)
        .values({
          ...parsed,
          orden: nextOrden,
          companyId: companyId,
        })
        .returning();
      
      res.status(201).json(pregunta);
    } catch (error: any) {
      console.error("Error creating pregunta induccion:", error);
      res.status(500).send("Error al crear pregunta de inducción");
    }
  });

  app.patch("/api/preguntas-induccion/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      // Strip orden from request body BEFORE Zod parsing to ensure it can never be changed via PATCH
      // orden should only change via dedicated /reorder endpoints
      const { orden: _ordenIgnored, ...bodyWithoutOrden } = req.body;
      const parsed = schema.insertPreguntaInduccionSchema.partial().parse(bodyWithoutOrden);
      
      // updateData is now guaranteed to not contain orden
      const updateData = parsed;
      
      const [updated] = await db.update(schema.preguntasInduccion)
        .set(updateData)
        .where(and(
          eq(schema.preguntasInduccion.id, req.params.id),
          eq(schema.preguntasInduccion.companyId, companyId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).send("Pregunta no encontrada");
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating pregunta induccion:", error);
      res.status(500).send("Error al actualizar pregunta de inducción");
    }
  });

  app.delete("/api/preguntas-induccion/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      await db.delete(schema.preguntasInduccion)
        .where(and(
          eq(schema.preguntasInduccion.id, req.params.id),
          eq(schema.preguntasInduccion.companyId, companyId)
        ));
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting pregunta induccion:", error);
      res.status(500).send("Error al eliminar pregunta de inducción");
    }
  });

  // POST /api/preguntas-induccion/reordenar - Reordenar preguntas (arrastrar y soltar)
  app.post("/api/preguntas-induccion/reordenar", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const { ordenPreguntaIds } = req.body;
      
      if (!Array.isArray(ordenPreguntaIds) || ordenPreguntaIds.length === 0) {
        return res.status(400).send("Se requiere un array de IDs de preguntas");
      }

      // Actualizar el orden de cada pregunta según su posición en el array
      for (let i = 0; i < ordenPreguntaIds.length; i++) {
        await db.update(schema.preguntasInduccion)
          .set({ orden: i + 1 })
          .where(and(
            eq(schema.preguntasInduccion.id, ordenPreguntaIds[i]),
            eq(schema.preguntasInduccion.companyId, companyId)
          ));
      }

      res.json({ success: true, message: "Preguntas reordenadas correctamente" });
    } catch (error: any) {
      console.error("Error reordering preguntas:", error);
      res.status(500).send("Error al reordenar preguntas");
    }
  });

  // PATCH /api/preguntas-induccion/:id/reorder - Reordenar pregunta (mover arriba/abajo)
  app.patch("/api/preguntas-induccion/:id/reorder", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const { direction } = req.body;
      
      if (direction !== 'up' && direction !== 'down') {
        return res.status(400).send("Dirección inválida. Debe ser 'up' o 'down'");
      }

      const preguntaId = req.params.id;

      // Use transaction to prevent race conditions during reorder
      await db.transaction(async (tx) => {
        // Obtener la pregunta actual
        const [currentPregunta] = await tx.select()
          .from(schema.preguntasInduccion)
          .where(and(
            eq(schema.preguntasInduccion.id, preguntaId),
            eq(schema.preguntasInduccion.companyId, companyId)
          ));

        if (!currentPregunta) {
          throw new Error("NOT_FOUND");
        }

        // Obtener todas las preguntas ordenadas
        const allPreguntas = await tx.select()
          .from(schema.preguntasInduccion)
          .where(eq(schema.preguntasInduccion.companyId, companyId))
          .orderBy(schema.preguntasInduccion.orden);

        const currentIndex = allPreguntas.findIndex(p => p.id === currentPregunta.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Verificar límites
        if (targetIndex < 0 || targetIndex >= allPreguntas.length) {
          throw new Error("INVALID_DIRECTION");
        }

        const targetPregunta = allPreguntas[targetIndex];

        // Intercambiar los valores de orden atomically within transaction
        await tx.update(schema.preguntasInduccion)
          .set({ orden: targetPregunta.orden })
          .where(eq(schema.preguntasInduccion.id, currentPregunta.id));

        await tx.update(schema.preguntasInduccion)
          .set({ orden: currentPregunta.orden })
          .where(eq(schema.preguntasInduccion.id, targetPregunta.id));
      });

      res.json({ success: true, message: "Pregunta reordenada correctamente" });
    } catch (error: any) {
      console.error("Error reordering pregunta:", error);
      if (error.message === "NOT_FOUND") {
        return res.status(404).send("Pregunta no encontrada");
      }
      if (error.message === "INVALID_DIRECTION") {
        return res.status(400).send("No se puede mover en esa dirección");
      }
      res.status(500).send("Error al reordenar pregunta");
    }
  });

  // POST /api/contenidos-induccion/reordenar - Reordenar contenidos (arrastrar y soltar)
  app.post("/api/contenidos-induccion/reordenar", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const { ordenContenidoIds } = req.body;
      
      if (!Array.isArray(ordenContenidoIds) || ordenContenidoIds.length === 0) {
        return res.status(400).send("Se requiere un array de IDs de contenidos");
      }

      // Actualizar el orden de cada contenido según su posición en el array
      for (let i = 0; i < ordenContenidoIds.length; i++) {
        await db.update(schema.contenidosInduccion)
          .set({ orden: i + 1 })
          .where(and(
            eq(schema.contenidosInduccion.id, ordenContenidoIds[i]),
            eq(schema.contenidosInduccion.companyId, companyId)
          ));
      }

      res.json({ success: true, message: "Contenidos reordenados correctamente" });
    } catch (error: any) {
      console.error("Error reordering contenidos:", error);
      res.status(500).send("Error al reordenar contenidos");
    }
  });

  // PATCH /api/contenidos-induccion/:id/reorder - Reordenar contenido (mover arriba/abajo)
  app.patch("/api/contenidos-induccion/:id/reorder", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const { direction } = req.body;
      
      if (direction !== 'up' && direction !== 'down') {
        return res.status(400).send("Dirección inválida. Debe ser 'up' o 'down'");
      }

      const contenidoId = req.params.id;

      // Use transaction to prevent race conditions during reorder
      await db.transaction(async (tx) => {
        // Obtener el contenido actual
        const [currentContenido] = await tx.select()
          .from(schema.contenidosInduccion)
          .where(and(
            eq(schema.contenidosInduccion.id, contenidoId),
            eq(schema.contenidosInduccion.companyId, companyId)
          ));

        if (!currentContenido) {
          throw new Error("NOT_FOUND");
        }

        // Obtener todos los contenidos ordenados
        const allContenidos = await tx.select()
          .from(schema.contenidosInduccion)
          .where(eq(schema.contenidosInduccion.companyId, companyId))
          .orderBy(schema.contenidosInduccion.orden);

        const currentIndex = allContenidos.findIndex(c => c.id === currentContenido.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Verificar límites
        if (targetIndex < 0 || targetIndex >= allContenidos.length) {
          throw new Error("INVALID_DIRECTION");
        }

        const targetContenido = allContenidos[targetIndex];

        // Intercambiar los valores de orden atomically within transaction
        await tx.update(schema.contenidosInduccion)
          .set({ orden: targetContenido.orden, updatedAt: new Date() })
          .where(eq(schema.contenidosInduccion.id, currentContenido.id));

        await tx.update(schema.contenidosInduccion)
          .set({ orden: currentContenido.orden, updatedAt: new Date() })
          .where(eq(schema.contenidosInduccion.id, targetContenido.id));
      });

      res.json({ success: true, message: "Contenido reordenado correctamente" });
    } catch (error: any) {
      console.error("Error reordering contenido:", error);
      if (error.message === "NOT_FOUND") {
        return res.status(404).send("Contenido no encontrado");
      }
      if (error.message === "INVALID_DIRECTION") {
        return res.status(400).send("No se puede mover en esa dirección");
      }
      res.status(500).send("Error al reordenar contenido");
    }
  });

  // ============================================================================
  // SESIONES DE INDUCCIÓN VIRTUAL - Envío y gestión
  // ============================================================================

  app.get("/api/sesiones-induccion-virtual", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }
      
      const sesiones = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(eq(schema.sesionesInduccionVirtual.companyId, companyId))
        .orderBy(desc(schema.sesionesInduccionVirtual.fechaEnvio));
      
      res.json(sesiones);
    } catch (error: any) {
      console.error("Error fetching sesiones induccion virtual:", error);
      res.status(500).send("Error al obtener sesiones de inducción virtual");
    }
  });

  app.post("/api/sesiones-induccion-virtual/enviar", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
      }
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) {
        return res.status(401).send("No autorizado");
      }

      const { workerId, tipoInduccion } = req.body;
      
      if (!workerId) {
        return res.status(400).send("workerId es requerido");
      }

      const [worker] = await db.select()
        .from(schema.workers)
        .where(and(
          eq(schema.workers.id, workerId),
          eq(schema.workers.companyId, companyId)
        ));
      
      if (!worker) {
        return res.status(404).send("Trabajador no encontrado");
      }

      if (!worker.email) {
        return res.status(400).send("El trabajador no tiene email registrado");
      }

      const token = generateToken();
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

      const [sesion] = await db.insert(schema.sesionesInduccionVirtual)
        .values({
          companyId: companyId,
          workerId,
          token,
          tipoInduccion: tipoInduccion || "induccion",
          estado: "pendiente",
          fechaExpiracion,
          contenidosVistos: "[]",
          progresoEvaluacion: "{}",
        })
        .returning();

      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyId));

      const baseUrl = process.env.REPLIT_DEPLOYMENT_URL || process.env.APP_URL || 'https://sst-colombia.com';
      const inductionUrl = `${baseUrl}/induccion-virtual/${token}`;

      // Correo de inducción deshabilitado: el trabajador accede desde su portal de empleados.
      // Solo se envían credenciales de acceso al portal (flujo separado).

      res.status(201).json({
        ...sesion,
        inductionUrl,
        workerEmail: worker.email,
      });
    } catch (error: any) {
      console.error("Error creating sesion induccion virtual:", error);
      res.status(500).send("Error al crear sesión de inducción virtual");
    }
  });

  // ============================================================================
  // ENVÍO MASIVO - Todos los trabajadores sin sesión activa
  // ============================================================================

  app.post("/api/sesiones-induccion-virtual/enviar-masivo", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const { tipoInduccion = "induccion" } = req.body;

      // 1. Todos los trabajadores activos de la empresa
      const allWorkers = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.companyId, companyId));

      // Enviar a TODOS los trabajadores sin importar si ya tienen sesión
      const pendientes = allWorkers;

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId));
      const baseUrl = process.env.REPLIT_DEPLOYMENT_URL || process.env.APP_URL || 'https://sst-colombia.com';

      let enviados = 0;
      const errores: string[] = [];

      for (const worker of pendientes) {
        try {
          const token = generateToken();
          const fechaExpiracion = new Date();
          fechaExpiracion.setDate(fechaExpiracion.getDate() + 30); // 30 días para masivo

          await db.insert(schema.sesionesInduccionVirtual).values({
            companyId,
            workerId: worker.id,
            token,
            tipoInduccion,
            estado: "pendiente",
            fechaExpiracion,
            contenidosVistos: "[]",
            progresoEvaluacion: "{}",
          });

          // Correo masivo de inducción deshabilitado: el trabajador accede desde su portal de empleados.

          enviados++;
        } catch (workerErr: any) {
          console.error(`Error creating session for worker ${worker.id}:`, workerErr);
          errores.push(worker.id);
        }
      }

      res.json({
        enviados,
        omitidos: allWorkers.length - pendientes.length,
        errores: errores.length,
        mensaje: `Se crearon ${enviados} sesión(es) de inducción. ${allWorkers.length - pendientes.length} trabajadores ya tenían sesión activa.`,
      });
    } catch (error: any) {
      console.error("Error en envío masivo:", error);
      res.status(500).send("Error al enviar inducciones masivas");
    }
  });

  // ============================================================================
  // ENDPOINT PÚBLICO - Acceso del trabajador (sin login)
  // ============================================================================

  app.get("/api/induccion-publica/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const [sesion] = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(eq(schema.sesionesInduccionVirtual.token, token));

      if (!sesion) {
        return res.status(404).json({ error: "Sesión no encontrada" });
      }

      if (sesion.estado === "completada") {
        return res.status(400).json({ error: "Esta inducción ya fue completada", completada: true });
      }

      if (new Date() > new Date(sesion.fechaExpiracion)) {
        await db.update(schema.sesionesInduccionVirtual)
          .set({ estado: "expirada" })
          .where(eq(schema.sesionesInduccionVirtual.id, sesion.id));
        return res.status(400).json({ error: "Esta sesión ha expirado" });
      }

      if (sesion.estado === "pendiente") {
        await db.update(schema.sesionesInduccionVirtual)
          .set({ 
            estado: "en_progreso",
            fechaInicio: new Date()
          })
          .where(eq(schema.sesionesInduccionVirtual.id, sesion.id));
      }

      const [worker] = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.id, sesion.workerId));

      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, sesion.companyId));

      const contenidos = await db.select()
        .from(schema.contenidosInduccion)
        .where(and(
          eq(schema.contenidosInduccion.companyId, sesion.companyId),
          eq(schema.contenidosInduccion.estado, "publicado")
        ))
        .orderBy(schema.contenidosInduccion.orden);

      const preguntas = await db.select()
        .from(schema.preguntasInduccion)
        .where(and(
          eq(schema.preguntasInduccion.companyId, sesion.companyId),
          eq(schema.preguntasInduccion.activa, 1)
        ))
        .orderBy(schema.preguntasInduccion.orden);

      const preguntasSinRespuesta = preguntas.map(p => ({
        id: p.id,
        pregunta: p.pregunta,
        opciones: JSON.parse(p.opciones),
        orden: p.orden,
      }));

      res.json({
        sesion: {
          id: sesion.id,
          tipoInduccion: sesion.tipoInduccion,
          estado: sesion.estado,
          contenidosVistos: JSON.parse(sesion.contenidosVistos),
          progresoEvaluacion: JSON.parse(sesion.progresoEvaluacion),
        },
        worker: {
          id: worker?.id,
          nombre: worker?.name,
          identificacion: worker?.identificationNumber,
          cargo: worker?.position,
        },
        company: {
          nombre: company?.name,
          logoUrl: company?.logoUrl,
        },
        contenidos,
        preguntas: preguntasSinRespuesta,
      });
    } catch (error: any) {
      console.error("Error fetching public induction:", error);
      res.status(500).send("Error al obtener datos de inducción");
    }
  });

  app.post("/api/induccion-publica/:token/progreso", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { contenidosVistos, progresoEvaluacion } = req.body;

      const [sesion] = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(eq(schema.sesionesInduccionVirtual.token, token));

      if (!sesion || sesion.estado === "completada" || sesion.estado === "expirada") {
        return res.status(400).json({ error: "Sesión no válida" });
      }

      await db.update(schema.sesionesInduccionVirtual)
        .set({
          contenidosVistos: JSON.stringify(contenidosVistos || []),
          progresoEvaluacion: JSON.stringify(progresoEvaluacion || {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.sesionesInduccionVirtual.id, sesion.id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating induction progress:", error);
      res.status(500).send("Error al guardar progreso");
    }
  });

  app.post("/api/induccion-publica/:token/completar", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { respuestas, firmaDigital } = req.body;

      const [sesion] = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(eq(schema.sesionesInduccionVirtual.token, token));

      if (!sesion) {
        return res.status(404).json({ error: "Sesión no encontrada" });
      }

      if (sesion.estado === "completada") {
        return res.status(400).json({ error: "Esta inducción ya fue completada" });
      }

      const preguntas = await db.select()
        .from(schema.preguntasInduccion)
        .where(and(
          eq(schema.preguntasInduccion.companyId, sesion.companyId),
          eq(schema.preguntasInduccion.activa, 1)
        ));

      let correctas = 0;
      const totalPreguntas = preguntas.length;

      for (const pregunta of preguntas) {
        const respuestaUsuario = respuestas?.[pregunta.id];
        if (respuestaUsuario === pregunta.respuestaCorrecta) {
          correctas++;
        }
      }

      const puntaje = totalPreguntas > 0 ? Math.round((correctas / totalPreguntas) * 100) : 100;
      const aprobado = puntaje >= 80 ? 1 : 0;

      const [worker] = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.id, sesion.workerId));

      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, sesion.companyId));

      const [registroInduccion] = await db.insert(schema.registrosInduccion)
        .values({
          companyId: sesion.companyId,
          workerId: sesion.workerId,
          tipo: sesion.tipoInduccion,
          fecha: new Date().toISOString().split('T')[0],
          horaInicio: new Date().toTimeString().split(' ')[0].slice(0, 5),
          duracionMinutos: 60,
          responsableNombre: "Inducción Virtual SST",
          eps: "",
          pension: "",
          arl: "",
          evaluacionSst: JSON.stringify({ virtual: true, puntaje }),
          evaluacionSeccion: JSON.stringify({ completado: true }),
          evaluacionMaquinas: JSON.stringify({ completado: true }),
          tieneExperiencia: 0,
          observaciones: `Inducción virtual completada. Puntaje: ${puntaje}%. ${aprobado ? 'APROBADO' : 'NO APROBADO'}`,
        })
        .returning();

      const ipFirma = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const userAgentFirma = req.headers['user-agent'] || 'unknown';

      await db.update(schema.sesionesInduccionVirtual)
        .set({
          estado: "completada",
          fechaFinalizacion: new Date(),
          progresoEvaluacion: JSON.stringify(respuestas || {}),
          puntajeEvaluacion: puntaje,
          aprobado,
          firmaDigital,
          fechaFirma: new Date(),
          ipFirma,
          userAgentFirma,
          registroInduccionId: registroInduccion.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.sesionesInduccionVirtual.id, sesion.id));

      res.json({
        success: true,
        puntaje,
        aprobado: aprobado === 1,
        mensaje: aprobado === 1 
          ? "¡Felicitaciones! Ha completado exitosamente la inducción de SST."
          : "Debe obtener mínimo 80% para aprobar. Contacte al área de SST.",
      });
    } catch (error: any) {
      console.error("Error completing induction:", error);
      res.status(500).send("Error al completar inducción");
    }
  });

  // ============================================================================
  // PDF CONSTANCIA DE INDUCCIÓN
  // ============================================================================

  app.get("/api/sesiones-induccion-virtual/:id/pdf", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const { id } = req.params;

      const [sesion] = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(and(
          eq(schema.sesionesInduccionVirtual.id, id),
          eq(schema.sesionesInduccionVirtual.companyId, companyId)
        ));

      if (!sesion) return res.status(404).send("Sesión no encontrada");

      const [worker] = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.id, sesion.workerId));

      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyId));

      const preguntas = await db.select()
        .from(schema.preguntasInduccion)
        .where(eq(schema.preguntasInduccion.companyId, companyId))
        .orderBy(schema.preguntasInduccion.orden);

      // ── Firma del LSO (misma lógica de prioridad que pdf-standardizer) ──
      let lsoName = 'Responsable SST';
      let lsoSignatureUrl: string | null = null;

      // 1. Prioridad: responsible_designations con LSO externo formal
      const [formalDesignation] = await db.select()
        .from(schema.responsibleDesignations)
        .where(and(
          eq(schema.responsibleDesignations.companyId, companyId),
          eq(schema.responsibleDesignations.isExternalLso, true)
        ))
        .limit(1);

      if (formalDesignation?.externalLsoName && formalDesignation?.licenciaSstNumero) {
        lsoName = formalDesignation.externalLsoName;
        lsoSignatureUrl = formalDesignation.lsoSignatureUrl || null;
      }

      // 2. Fallback: licensed_professional_assignments activo
      if (!lsoSignatureUrl) {
        const [assignment] = await db.select()
          .from(schema.licensedProfessionalAssignments)
          .where(and(
            eq(schema.licensedProfessionalAssignments.companyId, companyId),
            eq(schema.licensedProfessionalAssignments.isActive, true)
          ))
          .limit(1);

        if (assignment) {
          if (assignment.externalLsoId && assignment.externalLsoName) {
            lsoName = assignment.externalLsoName;
            lsoSignatureUrl = assignment.externalLsoSignatureUrl || null;
          } else if (assignment.userId) {
            const [lsoUser] = await db.select()
              .from(schema.users)
              .where(eq(schema.users.id, assignment.userId))
              .limit(1);
            if (lsoUser) {
              lsoName = lsoUser.fullName || lsoUser.username;
              lsoSignatureUrl = lsoUser.sstSignatureUrl || null;
            }
          }
        }
      }

      // Cargar buffer de firma del LSO
      const loadSigBuffer = async (url: string | null): Promise<Buffer | null> => {
        if (!url) return null;
        try {
          if (url.startsWith('/replit-objstore-')) {
            const { objectStorageClient } = await import('./replit_integrations/object_storage');
            const parts = url.split('/').filter(Boolean);
            const [data] = await objectStorageClient.bucket(parts[0]).file(parts.slice(1).join('/')).download();
            return data as Buffer;
          }
          if (url.startsWith('/objects/')) {
            return await objectStorageService.getObjectBuffer(objectStorageService.normalizeObjectEntityPath(url));
          }
          return null;
        } catch { return null; }
      };

      const lsoSigBuffer = await loadSigBuffer(lsoSignatureUrl);

      const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

      const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Constancia-Induccion-${worker?.name?.replace(/\s+/g, '-') || id.substring(0, 8)}.pdf"`);
      doc.pipe(res);

      // ── Encabezado ──────────────────────────────────────────────────────
      const GREEN = '#1a6b3a';
      const pageW = doc.page.width - 100; // margins 50 cada lado

      doc.rect(50, 50, pageW, 60).fill(GREEN);
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
        .text('CONSTANCIA DE INDUCCIÓN', 50, 65, { width: pageW, align: 'center' });
      doc.fontSize(10).font('Helvetica')
        .text('Seguridad y Salud en el Trabajo', 50, 88, { width: pageW, align: 'center' });

      doc.moveDown(2);

      // ── Datos de empresa ─────────────────────────────────────────────────
      doc.fillColor('#333').fontSize(11).font('Helvetica-Bold')
        .text(company?.name || 'Empresa', { align: 'center' });
      if (company?.nit) {
        doc.font('Helvetica').fontSize(9).fillColor('#666')
          .text(`NIT: ${company.nit}`, { align: 'center' });
      }
      doc.moveDown(1.5);

      // ── Línea separadora ─────────────────────────────────────────────────
      doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).strokeColor(GREEN).lineWidth(2).stroke();
      doc.moveDown(1);

      // ── Datos del trabajador y sesión ────────────────────────────────────
      const rows = [
        ['Trabajador:', worker?.name || '-'],
        ['Cédula:', worker?.cedula || worker?.documentNumber || '-'],
        ['Cargo:', worker?.position || worker?.cargo || '-'],
        ['Tipo de inducción:', sesion.tipoInduccion === 'reinduccion' ? 'Reinducción' : 'Inducción'],
        ['Fecha de envío:', formatDate(sesion.fechaEnvio)],
        ['Fecha de finalización:', formatDate(sesion.fechaFinalizacion)],
        ['Resultado de evaluación:', sesion.puntajeEvaluacion !== null ? `${sesion.puntajeEvaluacion}% — ${sesion.aprobado ? 'APROBADO ✓' : 'NO APROBADO'}` : 'Sin evaluación'],
      ];

      const colLabel = 180;
      rows.forEach(([label, value]) => {
        const y = doc.y;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#444').text(label, 50, y, { width: colLabel, continued: false });
        doc.font('Helvetica').fontSize(10).fillColor('#222').text(value, 50 + colLabel, y, { width: pageW - colLabel });
        doc.moveDown(0.4);
      });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).strokeColor('#ccc').lineWidth(1).stroke();
      doc.moveDown(1);

      // ── Respuestas de evaluación ─────────────────────────────────────────
      if (sesion.progresoEvaluacion && preguntas.length > 0) {
        let progreso: Record<string, string> = {};
        try { progreso = JSON.parse(sesion.progresoEvaluacion as string); } catch {}

        doc.font('Helvetica-Bold').fontSize(11).fillColor(GREEN)
          .text('DETALLE DE EVALUACIÓN', 50, doc.y);
        doc.moveDown(0.5);

        preguntas.forEach((p, idx) => {
          const respuesta = progreso[p.id] || '-';
          // Check page space
          if (doc.y > doc.page.height - 120) doc.addPage();

          doc.font('Helvetica-Bold').fontSize(9).fillColor('#333')
            .text(`${idx + 1}. ${p.pregunta}`, 50, doc.y, { width: pageW });
          doc.font('Helvetica').fontSize(9).fillColor('#555')
            .text(`Respuesta: ${respuesta}`, 60, doc.y, { width: pageW - 10 });
          doc.moveDown(0.5);
        });

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).strokeColor('#ccc').lineWidth(1).stroke();
        doc.moveDown(1);
      }

      // ── Texto legal ──────────────────────────────────────────────────────
      if (doc.y > doc.page.height - 160) doc.addPage();

      doc.font('Helvetica').fontSize(9).fillColor('#666')
        .text(
          'La presente constancia certifica que el trabajador mencionado completó satisfactoriamente el proceso de inducción virtual en Seguridad y Salud en el Trabajo, según lo establecido en el Decreto 1072 de 2015 y la Resolución 0312 de 2019.',
          50, doc.y, { width: pageW, align: 'justify' }
        );

      doc.moveDown(2);

      // ── Bloque de firmas ─────────────────────────────────────────────────
      if (doc.y > doc.page.height - 200) doc.addPage();

      const sigY = doc.y;
      const sigW = 180;
      const sigH = 60;

      // Columna izquierda — firma del trabajador
      if (sesion.firmaDigital) {
        try {
          // firmaDigital es data:image/png;base64,<datos>
          const base64Data = (sesion.firmaDigital as string).replace(/^data:image\/\w+;base64,/, '');
          const sigBuf = Buffer.from(base64Data, 'base64');
          doc.image(sigBuf, 50, sigY, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch {
          // Si falla, dejamos solo la línea
        }
      }
      doc.moveTo(50, sigY + sigH + 5).lineTo(50 + sigW, sigY + sigH + 5).strokeColor('#333').lineWidth(1).stroke();
      doc.font('Helvetica').fontSize(8).fillColor('#444')
        .text(`Firma del Trabajador\n${worker?.name || ''}`, 50, sigY + sigH + 10, { width: sigW, align: 'center' });

      // Columna derecha — firma del LSO/Responsable SST
      const rightX = 50 + pageW - sigW;
      if (lsoSigBuffer) {
        try {
          doc.image(lsoSigBuffer, rightX, sigY, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch { /* si falla, solo la línea */ }
      }
      doc.moveTo(rightX, sigY + sigH + 5).lineTo(rightX + sigW, sigY + sigH + 5).strokeColor('#333').lineWidth(1).stroke();
      doc.font('Helvetica').fontSize(8).fillColor('#444')
        .text(`${lsoName}\nResponsable SST · Generado: ${formatDate(new Date())}`, rightX, sigY + sigH + 10, { width: sigW, align: 'center' });

      doc.end();
    } catch (error: any) {
      console.error("Error generando PDF inducción:", error);
      if (!res.headersSent) res.status(500).send("Error al generar el PDF");
    }
  });

  // ============================================================================
  // PORTAL DEL EMPLEADO - Inducciones virtuales pendientes
  // ============================================================================

  app.get("/api/portal/mis-inducciones-virtuales", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !(req.user as any)?.workerId) {
        return res.status(200).json([]);
      }
      
      const user = req.user as any;
      
      const sesiones = await db.select({
        id: schema.sesionesInduccionVirtual.id,
        token: schema.sesionesInduccionVirtual.token,
        tipoInduccion: schema.sesionesInduccionVirtual.tipoInduccion,
        estado: schema.sesionesInduccionVirtual.estado,
        fechaEnvio: schema.sesionesInduccionVirtual.fechaEnvio,
        fechaExpiracion: schema.sesionesInduccionVirtual.fechaExpiracion,
        fechaInicio: schema.sesionesInduccionVirtual.fechaInicio,
        fechaFinalizacion: schema.sesionesInduccionVirtual.fechaFinalizacion,
        puntajeEvaluacion: schema.sesionesInduccionVirtual.puntajeEvaluacion,
        aprobado: schema.sesionesInduccionVirtual.aprobado,
      })
        .from(schema.sesionesInduccionVirtual)
        .where(and(
          eq(schema.sesionesInduccionVirtual.workerId, user.workerId),
          eq(schema.sesionesInduccionVirtual.companyId, user.companyId)
        ))
        .orderBy(desc(schema.sesionesInduccionVirtual.fechaEnvio));
      
      res.json(sesiones);
    } catch (error: any) {
      console.error("Error fetching worker virtual inductions:", error);
      res.status(500).json({ error: "Error al obtener inducciones virtuales" });
    }
  });
}
