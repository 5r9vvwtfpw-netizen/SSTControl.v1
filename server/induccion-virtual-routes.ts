import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, and, desc, sql, inArray, lte } from "drizzle-orm";
import * as schema from "@shared/schema";
import { randomBytes } from "crypto";
import { resend } from "./services/email";
import PDFDocument from "pdfkit";
import { objectStorageService } from "./objectStorage";
import { getPlantillaPesv } from "../client/src/data/induccion-plantillas-pesv";
import { getPlantillasPorNivel } from "../client/src/data/induccion-plantillas-arl";
import { sendWorkerPortalPush } from "./services/web-push";

const VALID_INDUCTION_TYPES = ["induccion", "reinduccion", "pesv"] as const;
type InductionType = typeof VALID_INDUCTION_TYPES[number];

function isNotTrainingModuleContent() {
  const inductionUrl = sql`TRIM(
    COALESCE(
      NULLIF(${schema.contenidosInduccion.urlVideo}, ''),
      NULLIF(${schema.contenidosInduccion.urlDocumento}, ''),
      ''
    )
  )`;

  return sql`
    NOT EXISTS (
      SELECT 1
      FROM trainings training
      WHERE training.company_id = ${schema.contenidosInduccion.companyId}
        AND NULLIF(TRIM(training.content_url), '') IS NOT NULL
        AND TRIM(training.content_url) = ${inductionUrl}
    )
    AND NOT EXISTS (
      SELECT 1
      FROM road_safety_trainings training
      WHERE training.company_id = ${schema.contenidosInduccion.companyId}
        AND NULLIF(TRIM(training.content_url), '') IS NOT NULL
        AND TRIM(training.content_url) = ${inductionUrl}
    )
  `;
}

function isRenderableInductionContent() {
  return sql`(
    (${schema.contenidosInduccion.tipoContenido} = 'video'
      AND NULLIF(TRIM(${schema.contenidosInduccion.urlVideo}), '') IS NOT NULL)
    OR (${schema.contenidosInduccion.tipoContenido} = 'documento'
      AND NULLIF(TRIM(${schema.contenidosInduccion.urlDocumento}), '') IS NOT NULL)
    OR (${schema.contenidosInduccion.tipoContenido} IN ('texto', 'presentacion')
      AND NULLIF(TRIM(${schema.contenidosInduccion.contenidoTexto}), '') IS NOT NULL)
  )`;
}

function parseInductionType(value: unknown, fallback?: InductionType): InductionType | null {
  if (value === undefined || value === null || value === "") {
    return fallback || null;
  }
  return typeof value === "string" && VALID_INDUCTION_TYPES.includes(value as InductionType)
    ? value as InductionType
    : null;
}

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

interface InductionSessionSnapshot {
  snapshotVersion: 1;
  contenidoIds: string[];
  preguntaIds: string[];
}

const ESTABLISHED_PESV_QUESTIONS = getPlantillaPesv().preguntas.map((pregunta, index) => ({
  id: `pesv-established-${index + 1}`,
  ...pregunta,
  orden: index + 1,
}));

async function getEstablishedQuestions(companyId: string, tipoInduccion: InductionType) {
  if (tipoInduccion === "pesv") {
    return ESTABLISHED_PESV_QUESTIONS;
  }

  const [company] = await db.select({ riskLevel: schema.companies.riskLevel })
    .from(schema.companies)
    .where(eq(schema.companies.id, companyId))
    .limit(1);
  const riskLevel = company?.riskLevel || "I";

  return getPlantillasPorNivel(riskLevel).preguntas.map((pregunta, index) => ({
    id: `sst-established-${riskLevel}-${index + 1}`,
    ...pregunta,
    orden: index + 1,
    tipoInduccion,
  }));
}

async function getEstablishedSessionQuestions(sesion: schema.SesionInduccionVirtual) {
  const preguntas = await getEstablishedQuestions(
    sesion.companyId,
    sesion.tipoInduccion as InductionType,
  );

  return preguntas.map(pregunta => ({
    id: pregunta.id,
    companyId: sesion.companyId,
    contenidoId: null,
    pregunta: pregunta.pregunta,
    opciones: JSON.stringify(pregunta.opciones),
    respuestaCorrecta: pregunta.respuestaCorrecta,
    explicacion: pregunta.explicacion,
    orden: pregunta.orden,
    activa: 1,
    tipoInduccion: sesion.tipoInduccion,
    createdAt: sesion.fechaEnvio,
  }));
}

function parseSessionSnapshot(raw: string | null): InductionSessionSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.snapshotVersion === 1 &&
      Array.isArray(parsed.contenidoIds) &&
      parsed.contenidoIds.every((id: unknown) => typeof id === "string") &&
      Array.isArray(parsed.preguntaIds) &&
      parsed.preguntaIds.every((id: unknown) => typeof id === "string")
    ) {
      return parsed as InductionSessionSnapshot;
    }
  } catch {
    return null;
  }
  return null;
}

async function buildSessionSnapshot(companyId: string, tipoInduccion: InductionType): Promise<InductionSessionSnapshot> {
  const [contenidos, preguntas] = await Promise.all([
    db.select({ id: schema.contenidosInduccion.id })
      .from(schema.contenidosInduccion)
      .where(and(
        eq(schema.contenidosInduccion.companyId, companyId),
        eq(schema.contenidosInduccion.estado, "publicado"),
        eq(schema.contenidosInduccion.tipoInduccion, tipoInduccion),
        isNotTrainingModuleContent(),
        isRenderableInductionContent()
      ))
      .orderBy(schema.contenidosInduccion.orden),
    getEstablishedQuestions(companyId, tipoInduccion),
  ]);

  return {
    snapshotVersion: 1,
    contenidoIds: contenidos.map(contenido => contenido.id),
    preguntaIds: preguntas.map(pregunta => pregunta.id),
  };
}

async function getSessionContents(sesion: schema.SesionInduccionVirtual) {
  const snapshot = parseSessionSnapshot(sesion.datosAdicionales);
  if (snapshot) {
    if (snapshot.contenidoIds.length === 0) return [];
    const contenidos = await db.select()
      .from(schema.contenidosInduccion)
      .where(and(
        eq(schema.contenidosInduccion.companyId, sesion.companyId),
        eq(schema.contenidosInduccion.estado, "publicado"),
        eq(schema.contenidosInduccion.tipoInduccion, sesion.tipoInduccion),
        inArray(schema.contenidosInduccion.id, snapshot.contenidoIds),
        isNotTrainingModuleContent(),
        isRenderableInductionContent()
      ));
    const order = new Map(snapshot.contenidoIds.map((id, index) => [id, index]));
    return contenidos.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  // Legacy sessions did not store a snapshot. Never attach content published
  // after the session was sent.
  return db.select()
    .from(schema.contenidosInduccion)
    .where(and(
      eq(schema.contenidosInduccion.companyId, sesion.companyId),
      eq(schema.contenidosInduccion.estado, "publicado"),
      eq(schema.contenidosInduccion.tipoInduccion, sesion.tipoInduccion),
      lte(schema.contenidosInduccion.createdAt, sesion.fechaEnvio),
      isNotTrainingModuleContent(),
      isRenderableInductionContent()
    ))
    .orderBy(schema.contenidosInduccion.orden);
}

async function getSessionQuestions(sesion: schema.SesionInduccionVirtual) {
  // Las evaluaciones virtuales SST, reinducción y PESV están prediseñadas
  // en el sistema. Las sesiones antiguas también deben recibir estas preguntas,
  // aunque su instantánea se haya creado vacía o con IDs configurables obsoletos.
  return getEstablishedSessionQuestions(sesion);
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
      
      const tipoInduccion = parseInductionType(req.query.tipo, "induccion");
      if (!tipoInduccion) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }

      const contenidos = await db.select()
        .from(schema.contenidosInduccion)
        .where(and(
          eq(schema.contenidosInduccion.companyId, companyId),
          eq(schema.contenidosInduccion.tipoInduccion, tipoInduccion)
        ))
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
      const tipoInduccion = parseInductionType(req.body.tipoInduccion, "induccion");
      if (!tipoInduccion) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }

      // Auto-assign orden: query max(orden) for this company and tipo
      const [maxResult] = await db.select({ maxOrden: sql<number>`COALESCE(MAX(${schema.contenidosInduccion.orden}), 0)` })
        .from(schema.contenidosInduccion)
        .where(and(
          eq(schema.contenidosInduccion.companyId, companyId),
          eq(schema.contenidosInduccion.tipoInduccion, tipoInduccion)
        ));
      
      const nextOrden = (maxResult?.maxOrden || 0) + 1;
      
      const [contenido] = await db.insert(schema.contenidosInduccion)
        .values({
          ...parsed,
          orden: nextOrden,
          companyId: companyId,
          tipoInduccion,
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
      if (
        bodyWithoutOrden.tipoInduccion !== undefined &&
        !parseInductionType(bodyWithoutOrden.tipoInduccion)
      ) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }
      
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
      
      const tipoInduccion = parseInductionType(req.query.tipo, "induccion");
      if (!tipoInduccion) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }

      const preguntas = await db.select()
        .from(schema.preguntasInduccion)
        .where(and(
          eq(schema.preguntasInduccion.companyId, companyId),
          eq(schema.preguntasInduccion.tipoInduccion, tipoInduccion)
        ))
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
      const tipoInduccion = parseInductionType(req.body.tipoInduccion, "induccion");
      if (!tipoInduccion) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }

      // Auto-assign orden: query max(orden) for this company and tipo
      const [maxResult] = await db.select({ maxOrden: sql<number>`COALESCE(MAX(${schema.preguntasInduccion.orden}), 0)` })
        .from(schema.preguntasInduccion)
        .where(and(
          eq(schema.preguntasInduccion.companyId, companyId),
          eq(schema.preguntasInduccion.tipoInduccion, tipoInduccion)
        ));
      
      const nextOrden = (maxResult?.maxOrden || 0) + 1;
      
      const [pregunta] = await db.insert(schema.preguntasInduccion)
        .values({
          ...parsed,
          orden: nextOrden,
          companyId: companyId,
          tipoInduccion,
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
      if (
        bodyWithoutOrden.tipoInduccion !== undefined &&
        !parseInductionType(bodyWithoutOrden.tipoInduccion)
      ) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }
      
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
      const uniquePreguntaIds = [...new Set(ordenPreguntaIds.filter((id): id is string => typeof id === "string"))];
      const preguntasToReorder = await db.select({
        id: schema.preguntasInduccion.id,
        tipoInduccion: schema.preguntasInduccion.tipoInduccion,
      })
        .from(schema.preguntasInduccion)
        .where(and(
          eq(schema.preguntasInduccion.companyId, companyId),
          inArray(schema.preguntasInduccion.id, uniquePreguntaIds)
        ));
      if (
        preguntasToReorder.length !== uniquePreguntaIds.length ||
        new Set(preguntasToReorder.map(pregunta => pregunta.tipoInduccion)).size !== 1
      ) {
        return res.status(400).json({ error: "Las preguntas deben pertenecer a la misma empresa y tipo de inducción" });
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

        // Reorder only within the current induction type.
        const allPreguntas = await tx.select()
          .from(schema.preguntasInduccion)
          .where(and(
            eq(schema.preguntasInduccion.companyId, companyId),
            eq(schema.preguntasInduccion.tipoInduccion, currentPregunta.tipoInduccion)
          ))
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
      const uniqueContenidoIds = [...new Set(ordenContenidoIds.filter((id): id is string => typeof id === "string"))];
      const contenidosToReorder = await db.select({
        id: schema.contenidosInduccion.id,
        tipoInduccion: schema.contenidosInduccion.tipoInduccion,
      })
        .from(schema.contenidosInduccion)
        .where(and(
          eq(schema.contenidosInduccion.companyId, companyId),
          inArray(schema.contenidosInduccion.id, uniqueContenidoIds)
        ));
      if (
        contenidosToReorder.length !== uniqueContenidoIds.length ||
        new Set(contenidosToReorder.map(contenido => contenido.tipoInduccion)).size !== 1
      ) {
        return res.status(400).json({ error: "Los contenidos deben pertenecer a la misma empresa y tipo de inducción" });
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

        // Reorder only within the current induction type.
        const allContenidos = await tx.select()
          .from(schema.contenidosInduccion)
          .where(and(
            eq(schema.contenidosInduccion.companyId, companyId),
            eq(schema.contenidosInduccion.tipoInduccion, currentContenido.tipoInduccion)
          ))
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

      const { workerId } = req.body;
      const tipoInduccion = parseInductionType(req.body.tipoInduccion, "induccion");
      
      if (!workerId) {
        return res.status(400).send("workerId es requerido");
      }
      if (!tipoInduccion) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
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
      const sessionSnapshot = await buildSessionSnapshot(companyId, tipoInduccion);
      if (sessionSnapshot.contenidoIds.length === 0) {
        return res.status(400).json({
          error: "No hay contenido de inducción publicado y válido para este tipo. Configure el contenido antes de asignarla.",
        });
      }

      const [sesion] = await db.insert(schema.sesionesInduccionVirtual)
        .values({
          companyId: companyId,
          workerId,
          token,
          tipoInduccion,
          estado: "pendiente",
          fechaExpiracion,
          contenidosVistos: "[]",
          progresoEvaluacion: "{}",
          datosAdicionales: JSON.stringify(sessionSnapshot),
        })
        .returning();

      void sendWorkerPortalPush(workerId, companyId, {
        title: tipoInduccion === "reinduccion" ? "Nueva reinducción SST" : "Nueva inducción SST",
        body: "Tienes una inducción pendiente en el Portal de Empleados.",
        url: "/portal-empleados",
        tag: `induction-${sesion.id}`,
      }).catch(() => console.error("[WebPush] No fue posible notificar la inducción"));

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
  // ENVÍO MASIVO - Crea una sesión nueva por trabajador en cada solicitud
  // ============================================================================

  app.post("/api/sesiones-induccion-virtual/enviar-masivo", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const tipoInduccion = parseInductionType(req.body.tipoInduccion, "induccion");
      if (!tipoInduccion) {
        return res.status(400).json({ error: "Tipo de inducción inválido" });
      }

      // 1. Todos los trabajadores activos de la empresa
      const allWorkers = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.companyId, companyId));

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId));
      const baseUrl = process.env.REPLIT_DEPLOYMENT_URL || process.env.APP_URL || 'https://sst-colombia.com';
      const sessionSnapshot = await buildSessionSnapshot(companyId, tipoInduccion);
      if (sessionSnapshot.contenidoIds.length === 0) {
        return res.status(400).json({
          error: "No hay contenido de inducción publicado y válido para este tipo. Configure el contenido antes del envío masivo.",
        });
      }

      let enviados = 0;
      const errores: string[] = [];

      for (const worker of allWorkers) {
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
            datosAdicionales: JSON.stringify(sessionSnapshot),
          });
          void sendWorkerPortalPush(worker.id, companyId, {
            title: tipoInduccion === "reinduccion" ? "Nueva reinducción SST" : "Nueva inducción SST",
            body: "Tienes una inducción pendiente en el Portal de Empleados.",
            url: "/portal-empleados",
            tag: `induction-${token}`,
          }).catch(() => console.error("[WebPush] No fue posible notificar la inducción masiva"));

          // Correo masivo de inducción deshabilitado: el trabajador accede desde su portal de empleados.

          enviados++;
        } catch (workerErr: any) {
          console.error(`Error creating session for worker ${worker.id}:`, workerErr);
          errores.push(worker.id);
        }
      }

      res.json({
        enviados,
        omitidos: 0,
        errores: errores.length,
        mensaje: `Se crearon ${enviados} sesión(es) nuevas de inducción${errores.length > 0 ? `; ${errores.length} no pudieron crearse` : ""}.`,
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

      const [contenidos, preguntas] = await Promise.all([
        getSessionContents(sesion),
        getSessionQuestions(sesion),
      ]);

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

      if (new Date(sesion.fechaExpiracion).getTime() <= Date.now()) {
        await db.update(schema.sesionesInduccionVirtual)
          .set({ estado: "expirada", updatedAt: new Date() })
          .where(eq(schema.sesionesInduccionVirtual.id, sesion.id));
        return res.status(410).json({ error: "La sesión de inducción ha expirado" });
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
      const { respuestas, lecturaConfirmada } = req.body;

      const [sesion] = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(eq(schema.sesionesInduccionVirtual.token, token));

      if (!sesion) {
        return res.status(404).json({ error: "Sesión no encontrada" });
      }

      if (sesion.estado === "completada") {
        return res.status(400).json({ error: "Esta inducción ya fue completada" });
      }

      if (sesion.estado === "expirada" || new Date(sesion.fechaExpiracion).getTime() <= Date.now()) {
        await db.update(schema.sesionesInduccionVirtual)
          .set({ estado: "expirada", updatedAt: new Date() })
          .where(eq(schema.sesionesInduccionVirtual.id, sesion.id));
        return res.status(410).json({ error: "La sesión de inducción ha expirado" });
      }

      const preguntas = await getSessionQuestions(sesion);
      if (preguntas.length === 0) {
        return res.status(409).json({
          error: "La evaluación no tiene preguntas configuradas. Solicite al responsable PESV o SST que configure las preguntas y vuelva a asignar la sesión.",
        });
      }

      if (lecturaConfirmada !== true) {
        return res.status(400).json({ error: "Debe confirmar la revisión del contenido para completar la inducción" });
      }

      let correctas = 0;
      const totalPreguntas = preguntas.length;

      const faltantes = preguntas.filter(
        (pregunta) => !respuestas || !Object.prototype.hasOwnProperty.call(respuestas, pregunta.id)
      );
      if (faltantes.length > 0) {
        return res.status(400).json({ error: "Debe responder todas las preguntas de la evaluación" });
      }

      for (const pregunta of preguntas) {
        const respuestaUsuario = respuestas?.[pregunta.id];
        if (respuestaUsuario === pregunta.respuestaCorrecta) {
          correctas++;
        }
      }

      const puntaje = Math.round((correctas / totalPreguntas) * 100);
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

      const preguntas = await getSessionQuestions(sesion);

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
        ['Cédula:', worker?.identificationNumber || '-'],
        ['Cargo:', worker?.position || '-'],
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

      // Columna izquierda — firma histórica o confirmación digital
      if (sesion.firmaDigital) {
        try {
          // firmaDigital es data:image/png;base64,<datos>
          const base64Data = (sesion.firmaDigital as string).replace(/^data:image\/\w+;base64,/, '');
          const sigBuf = Buffer.from(base64Data, 'base64');
          doc.image(sigBuf, 50, sigY, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch {
          // Si falla, dejamos solo la línea
        }
        doc.moveTo(50, sigY + sigH + 5).lineTo(50 + sigW, sigY + sigH + 5).strokeColor('#333').lineWidth(1).stroke();
        doc.font('Helvetica').fontSize(8).fillColor('#444')
          .text(`Firma histórica del trabajador\n${worker?.name || ''}`, 50, sigY + sigH + 10, { width: sigW, align: 'center' });
      } else {
        doc.roundedRect(50, sigY, sigW, sigH + 5, 4).fillAndStroke('#F0FDF4', '#86EFAC');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#166534')
          .text('CONFIRMACIÓN DIGITAL', 58, sigY + 15, { width: sigW - 16, align: 'center' });
        doc.font('Helvetica').fontSize(8).fillColor('#444')
          .text('Contenido revisado y evaluación completada', 58, sigY + 32, { width: sigW - 16, align: 'center' });
        doc.font('Helvetica').fontSize(8).fillColor('#444')
          .text(worker?.name || '', 50, sigY + sigH + 10, { width: sigW, align: 'center' });
      }

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
      if (!req.isAuthenticated()) {
        return res.status(200).json([]);
      }
      
      const user = req.user as any;
      if (!user.companyId) {
        return res.status(200).json([]);
      }

      let workerId = user.workerId as string | undefined;
      if (!workerId && user.email) {
        const [worker] = await db.select({ id: schema.workers.id })
          .from(schema.workers)
          .where(and(
            eq(schema.workers.email, user.email),
            eq(schema.workers.companyId, user.companyId)
          ))
          .limit(1);
        workerId = worker?.id;
      }

      if (!workerId) {
        return res.status(200).json([]);
      }
      
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
          eq(schema.sesionesInduccionVirtual.workerId, workerId),
          eq(schema.sesionesInduccionVirtual.companyId, user.companyId),
          sql`${schema.sesionesInduccionVirtual.tipoInduccion} IN ('induccion', 'reinduccion')`
        ))
        .orderBy(desc(schema.sesionesInduccionVirtual.fechaEnvio));
      
      res.json(sesiones);
    } catch (error: any) {
      console.error("Error fetching worker virtual inductions:", error);
      res.status(500).json({ error: "Error al obtener inducciones virtuales" });
    }
  });

  // ============================================================================
  // PORTAL DEL EMPLEADO - Inducciones PESV pendientes
  // ============================================================================

  app.get("/api/portal/mis-inducciones-pesv", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(200).json([]);
      }
      
      const user = req.user as any;
      if (!user.companyId) {
        return res.status(200).json([]);
      }

      let workerId = user.workerId as string | undefined;
      if (!workerId && user.email) {
        const [worker] = await db.select({ id: schema.workers.id })
          .from(schema.workers)
          .where(and(
            eq(schema.workers.email, user.email),
            eq(schema.workers.companyId, user.companyId)
          ))
          .limit(1);
        workerId = worker?.id;
      }

      if (!workerId) {
        return res.status(200).json([]);
      }
      
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
          eq(schema.sesionesInduccionVirtual.workerId, workerId),
          eq(schema.sesionesInduccionVirtual.companyId, user.companyId),
          eq(schema.sesionesInduccionVirtual.tipoInduccion, "pesv")
        ))
        .orderBy(desc(schema.sesionesInduccionVirtual.fechaEnvio));
      
      res.json(sesiones);
    } catch (error: any) {
      console.error("Error fetching worker PESV inductions:", error);
      res.status(500).json({ error: "Error al obtener inducciones PESV" });
    }
  });

  // ============================================================================
  // SESIONES PESV - Envío a trabajadores
  // ============================================================================

  // Endpoint unificado: asigna sesiones PESV a uno, varios por cargo, o todos.
  // Body: { workerIds?: string[] }  |  { cargo?: string }  |  {} (todos)
  app.post("/api/sesiones-induccion-pesv/enviar", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const { workerIds, cargo } = req.body as { workerIds?: string[]; cargo?: string };

      // Obtener trabajadores objetivo
      let targetWorkers = await db.select().from(schema.workers)
        .where(eq(schema.workers.companyId, companyId));

      if (workerIds && workerIds.length > 0) {
        targetWorkers = targetWorkers.filter(w => workerIds.includes(w.id));
      } else if (cargo) {
        targetWorkers = targetWorkers.filter(w =>
          w.position && w.position.toLowerCase() === cargo.toLowerCase()
        );
      }

      if (targetWorkers.length === 0) {
        return res.status(404).json({ enviados: 0, omitidos: 0, mensaje: "No se encontraron trabajadores" });
      }

      const sessionSnapshot = await buildSessionSnapshot(companyId, "pesv");
      if (sessionSnapshot.contenidoIds.length === 0) {
        return res.status(400).json({
          error: "No hay contenido de inducción PESV publicado y válido. Configure el contenido antes de asignarla.",
        });
      }

      let enviados = 0;
      let errores = 0;

      for (const worker of targetWorkers) {
        try {
          const token = generateToken();
          const fechaExpiracion = new Date();
          fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);
          await db.insert(schema.sesionesInduccionVirtual).values({
            companyId, workerId: worker.id, token, tipoInduccion: "pesv",
            estado: "pendiente", fechaExpiracion, contenidosVistos: "[]", progresoEvaluacion: "{}",
            datosAdicionales: JSON.stringify(sessionSnapshot),
          });
          void sendWorkerPortalPush(worker.id, companyId, {
            title: "Nueva inducción PESV",
            body: "Tienes una inducción de seguridad vial pendiente en el Portal de Empleados.",
            url: "/portal-empleados",
            tag: `pesv-induction-${token}`,
          }).catch(() => console.error("[WebPush] No fue posible notificar la inducción PESV"));
          enviados++;
        } catch (err: any) {
          console.error(`Error creating PESV session for worker ${worker.id}:`, err);
          errores++;
        }
      }

      res.status(201).json({
        enviados,
        omitidos: 0,
        errores,
        mensaje: `${enviados} inducción(es) PESV nueva(s) asignada(s)${errores > 0 ? `; ${errores} no pudieron crearse` : ""}.`,
      });
    } catch (error: any) {
      console.error("Error creating PESV session:", error);
      res.status(500).send("Error al crear sesión(es) de inducción PESV");
    }
  });

  // Mantener alias /enviar-masivo por compatibilidad (delega al endpoint unificado)
  app.post("/api/sesiones-induccion-pesv/enviar-masivo", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const allWorkers = await db.select().from(schema.workers)
        .where(eq(schema.workers.companyId, companyId));
      const sessionSnapshot = await buildSessionSnapshot(companyId, "pesv");

      let enviados = 0; let errores = 0;
      for (const worker of allWorkers) {
        try {
          const token = generateToken();
          const fechaExpiracion = new Date();
          fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);
          await db.insert(schema.sesionesInduccionVirtual).values({
            companyId, workerId: worker.id, token, tipoInduccion: "pesv",
            estado: "pendiente", fechaExpiracion, contenidosVistos: "[]", progresoEvaluacion: "{}",
            datosAdicionales: JSON.stringify(sessionSnapshot),
          });
          void sendWorkerPortalPush(worker.id, companyId, {
            title: "Nueva inducción PESV",
            body: "Tienes una inducción de seguridad vial pendiente en el Portal de Empleados.",
            url: "/portal-empleados",
            tag: `pesv-induction-${token}`,
          }).catch(() => console.error("[WebPush] No fue posible notificar la inducción PESV masiva"));
          enviados++;
        } catch (err: any) {
          console.error(`Error creating mass PESV session for worker ${worker.id}:`, err);
          errores++;
        }
      }
      res.json({
        enviados,
        omitidos: 0,
        errores,
        mensaje: `${enviados} inducción(es) PESV nueva(s) asignada(s)${errores > 0 ? `; ${errores} no pudieron crearse` : ""}.`,
      });
    } catch (error: any) {
      res.status(500).send("Error al enviar inducciones PESV masivas");
    }
  });

  // Lista sesiones PESV para administrador
  app.get("/api/sesiones-induccion-pesv", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const sesiones = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(and(
          eq(schema.sesionesInduccionVirtual.companyId, companyId),
          eq(schema.sesionesInduccionVirtual.tipoInduccion, "pesv")
        ))
        .orderBy(desc(schema.sesionesInduccionVirtual.fechaEnvio));

      res.json(sesiones);
    } catch (error: any) {
      console.error("Error fetching PESV sessions:", error);
      res.status(500).send("Error al obtener sesiones PESV");
    }
  });

  // ============================================================================
  // SESIONES PESV - Generar PDF de constancia
  // ============================================================================

  app.get("/api/sesiones-induccion-pesv/:id/pdf", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).send("No autorizado");
      const companyId = getEffectiveCompanyId(req);
      if (!companyId) return res.status(401).send("No autorizado");

      const { id } = req.params;

      const [sesion] = await db.select()
        .from(schema.sesionesInduccionVirtual)
        .where(and(
          eq(schema.sesionesInduccionVirtual.id, id),
          eq(schema.sesionesInduccionVirtual.companyId, companyId),
          eq(schema.sesionesInduccionVirtual.tipoInduccion, "pesv")
        ));

      if (!sesion) return res.status(404).send("Sesión no encontrada");

      const [worker] = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.id, sesion.workerId));

      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyId));

      const preguntas = await getSessionQuestions(sesion);

      // ── Firma del responsable PESV (misma lógica de prioridad que SST) ──
      let lsoName = 'Responsable PESV';
      let lsoSignatureUrl: string | null = null;

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
      res.setHeader('Content-Disposition', `inline; filename="Constancia-Induccion-PESV-${worker?.name?.replace(/\s+/g, '-') || id.substring(0, 8)}.pdf"`);
      doc.pipe(res);

      // ── Encabezado PESV (verde corporativo estándar #1e7e34) ────────────
      const GREEN = '#1e7e34';
      const pageW = doc.page.width - 100;

      doc.rect(50, 50, pageW, 60).fill(GREEN);
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
        .text('CONSTANCIA DE INDUCCIÓN PESV', 50, 60, { width: pageW, align: 'center' });
      doc.fontSize(10).font('Helvetica')
        .text('Plan Estratégico de Seguridad Vial — Resolución 40595/2022', 50, 84, { width: pageW, align: 'center' });

      doc.moveDown(2);

      // ── Datos de empresa ─────────────────────────────────────────────────
      doc.fillColor('#333').fontSize(11).font('Helvetica-Bold')
        .text(company?.name || 'Empresa', { align: 'center' });
      if (company?.nit) {
        doc.font('Helvetica').fontSize(9).fillColor('#666')
          .text(`NIT: ${company.nit}`, { align: 'center' });
      }
      doc.moveDown(1.5);

      doc.moveTo(50, doc.y).lineTo(50 + pageW, doc.y).strokeColor(GREEN).lineWidth(2).stroke();
      doc.moveDown(1);

      // ── Datos del trabajador y sesión ────────────────────────────────────
      const rows = [
        ['Trabajador:', worker?.name || '-'],
        ['Cédula:', worker?.identificationNumber || '-'],
        ['Cargo:', worker?.position || '-'],
        ['Tipo de inducción:', 'Inducción PESV'],
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
          'La presente constancia certifica que el trabajador mencionado completó el proceso de inducción virtual en materia de Seguridad Vial, conforme a lo establecido en la Resolución 40595 de 2022 del Ministerio de Transporte y el artículo 12 de la Ley 1503 de 2011.',
          50, doc.y, { width: pageW, align: 'justify' }
        );

      doc.moveDown(2);

      // ── Bloque de firmas ─────────────────────────────────────────────────
      if (doc.y > doc.page.height - 200) doc.addPage();

      const sigY = doc.y;
      const sigW = 180;
      const sigH = 60;

      // Columna izquierda — firma histórica o confirmación digital
      if (sesion.firmaDigital) {
        try {
          const base64Data = (sesion.firmaDigital as string).replace(/^data:image\/\w+;base64,/, '');
          const sigBuf = Buffer.from(base64Data, 'base64');
          doc.image(sigBuf, 50, sigY, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch {}
        doc.moveTo(50, sigY + sigH + 5).lineTo(50 + sigW, sigY + sigH + 5).strokeColor('#333').lineWidth(1).stroke();
        doc.font('Helvetica').fontSize(8).fillColor('#444')
          .text(`Firma histórica del trabajador\n${worker?.name || ''}`, 50, sigY + sigH + 10, { width: sigW, align: 'center' });
      } else {
        doc.roundedRect(50, sigY, sigW, sigH + 5, 4).fillAndStroke('#F0FDF4', '#86EFAC');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#166534')
          .text('CONFIRMACIÓN DIGITAL', 58, sigY + 15, { width: sigW - 16, align: 'center' });
        doc.font('Helvetica').fontSize(8).fillColor('#444')
          .text('Contenido revisado y evaluación completada', 58, sigY + 32, { width: sigW - 16, align: 'center' });
        doc.font('Helvetica').fontSize(8).fillColor('#444')
          .text(worker?.name || '', 50, sigY + sigH + 10, { width: sigW, align: 'center' });
      }

      // Columna derecha — firma del responsable PESV
      const rightX = 50 + pageW - sigW;
      if (lsoSigBuffer) {
        try {
          doc.image(lsoSigBuffer, rightX, sigY, { width: sigW, height: sigH, fit: [sigW, sigH] });
        } catch {}
      }
      doc.moveTo(rightX, sigY + sigH + 5).lineTo(rightX + sigW, sigY + sigH + 5).strokeColor('#333').lineWidth(1).stroke();
      doc.font('Helvetica').fontSize(8).fillColor('#444')
        .text(`${lsoName}\nResponsable PESV · Generado: ${formatDate(new Date())}`, rightX, sigY + sigH + 10, { width: sigW, align: 'center' });

      doc.end();
    } catch (error: any) {
      console.error("Error generando PDF inducción PESV:", error);
      if (!res.headersSent) res.status(500).send("Error al generar el PDF");
    }
  });
}
