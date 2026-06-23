import type { Express, Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { 
  riesgosSstPesvVinculacion, 
  riesgosViales, 
  peligrosIperc,
  matricesIperc
} from "@shared/schema";

function getEffectiveCompanyId(req: any): string | null {
  const user = req.user;
  if (!user) return null;
  const lsoRoles = ['lso', 'lso_externo'];
  if (lsoRoles.includes(user.role) && req.query.companyId) {
    return req.query.companyId as string;
  }
  return user.adminCompanyId || user.companyId || null;
}

export function registerRiesgosVinculacionRoutes(app: Express, requireAuth: any) {
  
  // GET /api/riesgos-vinculacion - Get all SST-PESV risk linkages for company
  app.get("/api/riesgos-vinculacion", requireAuth, async (req: any, res: Response) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const vinculaciones = await db
        .select()
        .from(riesgosSstPesvVinculacion)
        .where(and(
          eq(riesgosSstPesvVinculacion.companyId, effectiveCompanyId),
          eq(riesgosSstPesvVinculacion.activo, 1)
        ))
        .orderBy(desc(riesgosSstPesvVinculacion.createdAt));
      
      res.json(vinculaciones);
    } catch (error: any) {
      console.error("Error fetching riesgos vinculaciones:", error);
      res.status(500).json({ error: "Error al obtener las vinculaciones" });
    }
  });
  
  // GET /api/riesgos-vinculacion/por-riesgo-vial/:riesgoVialId - Get linkage by PESV risk ID
  app.get("/api/riesgos-vinculacion/por-riesgo-vial/:riesgoVialId", requireAuth, async (req: any, res: Response) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const [vinculacion] = await db
        .select()
        .from(riesgosSstPesvVinculacion)
        .where(and(
          eq(riesgosSstPesvVinculacion.riesgoVialId, req.params.riesgoVialId),
          eq(riesgosSstPesvVinculacion.companyId, effectiveCompanyId),
          eq(riesgosSstPesvVinculacion.activo, 1)
        ));
      
      if (vinculacion) {
        if (vinculacion.peligroIpercId) {
          const [peligroIperc] = await db
            .select()
            .from(peligrosIperc)
            .where(eq(peligrosIperc.id, vinculacion.peligroIpercId));
          res.json({ vinculacion, peligroIperc });
        } else {
          res.json({ vinculacion, peligroIperc: null });
        }
      } else {
        res.json({ vinculacion: null, peligroIperc: null });
      }
    } catch (error: any) {
      console.error("Error fetching vinculacion por riesgo vial:", error);
      res.status(500).json({ error: "Error al obtener la vinculación" });
    }
  });
  
  // GET /api/riesgos-vinculacion/por-peligro-iperc/:peligroIpercId - Get linkage by SST peligro ID
  app.get("/api/riesgos-vinculacion/por-peligro-iperc/:peligroIpercId", requireAuth, async (req: any, res: Response) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const [vinculacion] = await db
        .select()
        .from(riesgosSstPesvVinculacion)
        .where(and(
          eq(riesgosSstPesvVinculacion.peligroIpercId, req.params.peligroIpercId),
          eq(riesgosSstPesvVinculacion.companyId, effectiveCompanyId),
          eq(riesgosSstPesvVinculacion.activo, 1)
        ));
      
      if (vinculacion) {
        if (vinculacion.riesgoVialId) {
          const [riesgoVial] = await db
            .select()
            .from(riesgosViales)
            .where(eq(riesgosViales.id, vinculacion.riesgoVialId));
          res.json({ vinculacion, riesgoVial });
        } else {
          res.json({ vinculacion, riesgoVial: null });
        }
      } else {
        res.json({ vinculacion: null, riesgoVial: null });
      }
    } catch (error: any) {
      console.error("Error fetching vinculacion por peligro IPERC:", error);
      res.status(500).json({ error: "Error al obtener la vinculación" });
    }
  });
  
  // POST /api/riesgos-vinculacion - Create new SST-PESV linkage
  app.post("/api/riesgos-vinculacion", requireAuth, async (req: any, res: Response) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const { riesgoVialId, peligroIpercId, origen, justificacionVinculacion, nivelRiesgoPesv, nivelRiesgoSst } = req.body;
      
      if (!riesgoVialId && !peligroIpercId) {
        return res.status(400).json({ error: "Debe proporcionar al menos un ID de riesgo (PESV o SST)" });
      }
      
      const [result] = await db.insert(riesgosSstPesvVinculacion)
        .values({
          companyId: effectiveCompanyId,
          riesgoVialId,
          peligroIpercId,
          origen: origen || "manual",
          estadoSincronizacion: "sincronizado",
          nivelRiesgoPesv,
          nivelRiesgoSst,
          justificacionVinculacion,
          vinculadoPor: req.user?.id,
        })
        .returning();
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating riesgo vinculacion:", error);
      res.status(500).json({ error: "Error al crear la vinculación" });
    }
  });
  
  // POST /api/riesgos-vinculacion/sincronizar-pesv-a-sst - Sync PESV risk to SST matrix
  app.post("/api/riesgos-vinculacion/sincronizar-pesv-a-sst", requireAuth, async (req: any, res: Response) => {
    console.log("[SYNC-PESV-SST] Starting sync request:", JSON.stringify(req.body));
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      console.log("[SYNC-PESV-SST] Company ID:", effectiveCompanyId);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const { riesgoVialId, matrizIpercId: rawMatrizIpercId } = req.body;
      console.log("[SYNC-PESV-SST] riesgoVialId:", riesgoVialId, "rawMatrizIpercId:", rawMatrizIpercId);
      
      if (!riesgoVialId) {
        return res.status(400).json({ error: "Debe proporcionar riesgoVialId" });
      }
      
      const [existingVinculacion] = await db
        .select()
        .from(riesgosSstPesvVinculacion)
        .where(and(
          eq(riesgosSstPesvVinculacion.riesgoVialId, riesgoVialId),
          eq(riesgosSstPesvVinculacion.companyId, effectiveCompanyId),
          eq(riesgosSstPesvVinculacion.activo, 1)
        ));
      
      if (existingVinculacion) {
        return res.status(200).json({
          message: "Este riesgo PESV ya está sincronizado en la matriz SST",
          peligroIperc: existingVinculacion.peligroIpercId ? 
            (await db.select().from(peligrosIperc).where(eq(peligrosIperc.id, existingVinculacion.peligroIpercId)))[0] : null,
          vinculacion: existingVinculacion,
          alreadyExists: true
        });
      }
      
      // Handle "default" matrizIpercId - find or create a matriz for the company
      let matrizIpercId = rawMatrizIpercId;
      if (!matrizIpercId || matrizIpercId === "default") {
        // Try to find an existing matriz for this company
        const [existingMatriz] = await db
          .select()
          .from(matricesIperc)
          .where(eq(matricesIperc.companyId, effectiveCompanyId))
          .orderBy(desc(matricesIperc.createdAt))
          .limit(1);
        
        if (existingMatriz) {
          matrizIpercId = existingMatriz.id;
        } else {
          // Create a default matriz for PESV sync
          const [nuevaMatriz] = await db.insert(matricesIperc)
            .values({
              companyId: effectiveCompanyId,
              codigo: "IPERC-PESV-001",
              nombre: "Matriz IPERC - Riesgos PESV Sincronizados",
              estado: "activa",
              version: 1,
              fechaElaboracion: new Date().toISOString().split("T")[0],
              alcance: "Riesgos viales sincronizados desde módulo PESV",
              responsableSstId: req.user?.id,
            })
            .returning();
          matrizIpercId = nuevaMatriz.id;
        }
      }
      
      console.log("[SYNC-PESV-SST] Using matrizIpercId:", matrizIpercId);
      
      // Get the PESV risk
      const [riesgoVial] = await db
        .select()
        .from(riesgosViales)
        .where(and(
          eq(riesgosViales.id, riesgoVialId),
          eq(riesgosViales.companyId, effectiveCompanyId)
        ));
      
      console.log("[SYNC-PESV-SST] Found riesgoVial:", riesgoVial?.id, riesgoVial?.nombre);
      
      if (!riesgoVial) {
        return res.status(404).json({ error: "Riesgo vial no encontrado" });
      }
      
      // Map ISO 31000 (5x5) to GTC-45 probability: baja, media, alta, muy_alta
      const mapProbabilidad = (prob: string | null): any => {
        const map: Record<string, string> = {
          "muy_baja": "baja",
          "baja": "baja",
          "media": "media",
          "alta": "alta",
          "muy_alta": "muy_alta"
        };
        return map[prob || "media"] || "media";
      };
      
      // Map ISO 31000 (5x5) to GTC-45 severity: ligeramente_danino, danino, extremadamente_danino
      const mapSeveridad = (imp: string | null): any => {
        const map: Record<string, string> = {
          "insignificante": "ligeramente_danino",
          "menor": "ligeramente_danino",
          "moderado": "danino",
          "mayor": "extremadamente_danino",
          "catastrofico": "extremadamente_danino"
        };
        return map[imp || "moderado"] || "danino";
      };
      
      // Map ISO 31000 nivel to GTC-45 nivel: trivial, tolerable, moderado, importante, intolerable
      const mapNivelRiesgo = (nivel: string | null): any => {
        const map: Record<string, string> = {
          "bajo": "tolerable",
          "medio": "moderado",
          "alto": "importante",
          "muy_alto": "intolerable",
          "critico": "intolerable"
        };
        return map[nivel || "medio"] || "moderado";
      };
      
      // Create IPERC peligro from PESV risk
      const [nuevoPeligro] = await db.insert(peligrosIperc)
        .values({
          companyId: effectiveCompanyId,
          matrizId: matrizIpercId,
          clasificacion: "condiciones_seguridad",
          subclasificacion: `Seguridad Vial - ${riesgoVial.categoria}`,
          tipoRegistro: "riesgo",
          descripcionPeligro: `[PESV] ${riesgoVial.nombre}: ${riesgoVial.descripcion}`,
          fuenteGeneradora: riesgoVial.fuenteRiesgo || "Operaciones de transporte/desplazamiento",
          actividadProceso: "Desplazamientos laborales y misiones",
          ubicacion: "Vías públicas y privadas",
          numeroPersonasExpuestas: 1,
          tipoExposicion: "ocasional",
          efectosPosibles: riesgoVial.consecuencias || "Lesiones, muerte, daños materiales",
          parteCuerpoAfectada: "Todo el cuerpo",
          nivelProbabilidad: mapProbabilidad(riesgoVial.probabilidad),
          nivelSeveridad: mapSeveridad(riesgoVial.impacto),
          valorRiesgo: Math.min(16, riesgoVial.valorRiesgo || 6),
          nivelRiesgo: mapNivelRiesgo(riesgoVial.nivelRiesgo),
          controlesExistentes: riesgoVial.controlesExistentes,
          efectividadControlesExistentes: riesgoVial.eficaciaControles,
          requiereControles: 1,
          requiereSeguimiento: 1,
          observaciones: `Sincronizado desde PESV - Riesgo ${riesgoVial.codigo}. Fundamento: Decreto 1072/2015 Art. 2.2.4.6.15`,
        })
        .returning();
      
      // Create linkage
      const [vinculacion] = await db.insert(riesgosSstPesvVinculacion)
        .values({
          companyId: effectiveCompanyId,
          riesgoVialId: riesgoVial.id,
          peligroIpercId: nuevoPeligro.id,
          origen: "pesv",
          estadoSincronizacion: "sincronizado",
          nivelRiesgoPesv: riesgoVial.nivelRiesgo,
          nivelRiesgoSst: nuevoPeligro.nivelRiesgo,
          justificacionVinculacion: "Sincronización automática PESV→SST según Decreto 1072/2015",
          vinculadoPor: req.user?.id,
        })
        .returning();
      
      res.status(201).json({
        message: "Riesgo PESV sincronizado exitosamente a matriz SST",
        peligroIperc: nuevoPeligro,
        vinculacion
      });
    } catch (error: any) {
      console.error("[SYNC-PESV-SST] Error syncing PESV to SST:", error);
      console.error("[SYNC-PESV-SST] Error message:", error.message);
      console.error("[SYNC-PESV-SST] Error stack:", error.stack);
      res.status(500).json({ error: "Error al sincronizar riesgo PESV a SST", details: error.message });
    }
  });
  
  // GET /api/peligros-iperc/origen-pesv - Get IPERC peligros that originated from PESV
  app.get("/api/peligros-iperc/origen-pesv", requireAuth, async (req: any, res: Response) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const vinculaciones = await db
        .select({
          vinculacion: riesgosSstPesvVinculacion,
          peligroIperc: peligrosIperc,
          riesgoVial: riesgosViales
        })
        .from(riesgosSstPesvVinculacion)
        .leftJoin(peligrosIperc, eq(riesgosSstPesvVinculacion.peligroIpercId, peligrosIperc.id))
        .leftJoin(riesgosViales, eq(riesgosSstPesvVinculacion.riesgoVialId, riesgosViales.id))
        .where(and(
          eq(riesgosSstPesvVinculacion.companyId, effectiveCompanyId),
          eq(riesgosSstPesvVinculacion.origen, "pesv"),
          eq(riesgosSstPesvVinculacion.activo, 1)
        ));
      
      const seen = new Set<string>();
      const deduped = vinculaciones.filter(v => {
        const key = v.vinculacion.riesgoVialId;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      res.json(deduped);
    } catch (error: any) {
      console.error("Error fetching IPERC peligros from PESV:", error);
      res.status(500).json({ error: "Error al obtener peligros IPERC de origen PESV" });
    }
  });
  
  // DELETE /api/riesgos-vinculacion/:id - Deactivate linkage (soft delete)
  app.delete("/api/riesgos-vinculacion/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId(req);
      if (!effectiveCompanyId) {
        return res.status(403).json({ error: "Usuario no asociado a una empresa" });
      }
      
      const [result] = await db.update(riesgosSstPesvVinculacion)
        .set({ 
          activo: 0, 
          estadoSincronizacion: "desvinculado",
          updatedAt: new Date()
        })
        .where(and(
          eq(riesgosSstPesvVinculacion.id, req.params.id),
          eq(riesgosSstPesvVinculacion.companyId, effectiveCompanyId)
        ))
        .returning();
      
      if (!result) {
        return res.status(404).json({ error: "Vinculación no encontrada" });
      }
      
      res.json({ message: "Vinculación desactivada", vinculacion: result });
    } catch (error: any) {
      console.error("Error deleting riesgo vinculacion:", error);
      res.status(500).json({ error: "Error al eliminar la vinculación" });
    }
  });
  
  console.log("✅ Rutas de Vinculación Riesgos SST-PESV registradas");
}
