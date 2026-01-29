/**
 * LSO Directory JWT Routes
 * 
 * Endpoints para integración con el Directorio Externo de LSO usando autenticación JWT
 * 
 * Sigue el principio de "solo agregar" - archivo nuevo sin modificar rutas existentes
 * Estos endpoints reemplazan funcionalmente a los de lso-directory-external.ts
 */

import { Router, Request, Response } from "express";
import { lsoDirectoryJwtClient } from "../services/lso-directory-jwt-client";
import logger from "../lib/logger";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

/**
 * Obtiene el companyId efectivo considerando usuarios globales
 */
function getEffectiveCompanyId(req: Request): string | null {
  const user = req.user as any;
  const headerCompanyId = req.headers['x-company-id'] as string | undefined;
  const isGlobalUser = ['superadmin', 'admin', 'asesor'].includes(user?.role);
  
  if (isGlobalUser && headerCompanyId) {
    return headerCompanyId;
  }
  return user?.companyId || null;
}

/**
 * Middleware para verificar autenticación
 */
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: "No autorizado" });
  }
  next();
}

/**
 * GET /api/lso-directory-jwt/search
 * Busca profesionales LSO en el directorio externo
 */
router.get("/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const { q, specialty, limit, offset } = req.query;

    const result = await lsoDirectoryJwtClient.searchLso({
      query: q as string,
      specialty: specialty as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    return res.json(result);
  } catch (error) {
    logger.error({ error }, "[LSO-JWT-Routes] Error en búsqueda");
    return res.status(500).json({ 
      ok: false, 
      error: "Error al buscar profesionales LSO" 
    });
  }
});

/**
 * GET /api/lso-directory-jwt/lso/:id
 * Obtiene un profesional LSO específico por ID
 */
router.get("/lso/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const externalId = parseInt(req.params.id);
    
    if (isNaN(externalId)) {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }

    const lso = await lsoDirectoryJwtClient.getLsoById(externalId);
    
    if (!lso) {
      return res.status(404).json({ ok: false, error: "Profesional LSO no encontrado" });
    }

    return res.json({ ok: true, data: lso });
  } catch (error) {
    logger.error({ error }, "[LSO-JWT-Routes] Error obteniendo LSO");
    return res.status(500).json({ 
      ok: false, 
      error: "Error al obtener profesional LSO" 
    });
  }
});

/**
 * POST /api/lso-directory-jwt/assign
 * Asigna un profesional LSO externo a una empresa
 * Valida con el directorio externo antes de asignar
 */
router.post("/assign", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const companyId = getEffectiveCompanyId(req);

    if (!companyId) {
      return res.status(400).json({ 
        ok: false, 
        error: "No se pudo determinar la empresa" 
      });
    }

    const { externalLsoId } = req.body;

    if (!externalLsoId) {
      return res.status(400).json({ 
        ok: false, 
        error: "externalLsoId es requerido" 
      });
    }

    // Validar que el LSO existe y está activo en el directorio externo
    const validation = await lsoDirectoryJwtClient.validateLsoForAssignment(
      parseInt(externalLsoId.toString())
    );
    
    if (!validation.valid) {
      logger.warn({ externalLsoId, error: validation.error }, "[LSO-JWT-Routes] Validación fallida");
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const lso = validation.lso!;

    // Verificar que la empresa existe
    const [company] = await db.select()
      .from(schema.companies)
      .where(eq(schema.companies.id, companyId));

    if (!company) {
      return res.status(404).json({ ok: false, error: "Empresa no encontrada" });
    }

    // Desactivar asignaciones existentes
    const existingAssignments = await db.select()
      .from(schema.licensedProfessionalAssignments)
      .where(and(
        eq(schema.licensedProfessionalAssignments.companyId, companyId),
        eq(schema.licensedProfessionalAssignments.isActive, true)
      ));

    for (const existing of existingAssignments) {
      await db.update(schema.licensedProfessionalAssignments)
        .set({ isActive: false })
        .where(eq(schema.licensedProfessionalAssignments.id, existing.id));
    }

    // Crear nueva asignación con datos del LSO externo
    const [assignment] = await db.insert(schema.licensedProfessionalAssignments)
      .values({
        companyId,
        userId: user.id,
        assignedBy: user.id,
        isActive: true,
        externalLsoId: externalLsoId.toString(),
        externalLsoName: lso.fullName || null,
        externalLsoEmail: lso.email || null,
        externalLsoPhone: lso.phone || null,
        externalLsoCity: lso.city || null,
        externalLsoLicenseNumber: lso.licenseNumber || null,
        externalLsoLicenseIssuer: lso.licenseIssuer || null,
        externalLsoLicenseExpiry: lso.licenseExpiry ? new Date(lso.licenseExpiry) : null,
        externalLsoSignatureUrl: lso.signatureUrl || null,
      })
      .returning();

    logger.info({ companyId, externalLsoId, lsoName: lso.fullName }, "[LSO-JWT-Routes] LSO externo asignado exitosamente");

    return res.status(201).json({ 
      ok: true, 
      message: "Profesional LSO asignado exitosamente",
      data: assignment
    });
  } catch (error) {
    logger.error({ error }, "[LSO-JWT-Routes] Error asignando LSO");
    return res.status(500).json({ 
      ok: false, 
      error: "Error al asignar profesional LSO" 
    });
  }
});

/**
 * DELETE /api/lso-directory-jwt/unassign
 * Desasigna el profesional LSO externo de la empresa actual
 */
router.delete("/unassign", requireAuth, async (req: Request, res: Response) => {
  try {
    const companyId = getEffectiveCompanyId(req);

    if (!companyId) {
      return res.status(400).json({ ok: false, error: "No se pudo determinar la empresa" });
    }

    // Desactivar todas las asignaciones activas
    await db.update(schema.licensedProfessionalAssignments)
      .set({ isActive: false })
      .where(and(
        eq(schema.licensedProfessionalAssignments.companyId, companyId),
        eq(schema.licensedProfessionalAssignments.isActive, true)
      ));

    logger.info({ companyId }, "[LSO-JWT-Routes] LSO externo desasignado");

    return res.json({ 
      ok: true, 
      message: "Profesional LSO desasignado exitosamente" 
    });
  } catch (error) {
    logger.error({ error }, "[LSO-JWT-Routes] Error desasignando LSO");
    return res.status(500).json({ 
      ok: false, 
      error: "Error al desasignar profesional LSO" 
    });
  }
});

/**
 * GET /api/lso-directory-jwt/current-assignment
 * Obtiene la asignación actual de LSO para la empresa
 */
router.get("/current-assignment", requireAuth, async (req: Request, res: Response) => {
  try {
    const companyId = getEffectiveCompanyId(req);

    if (!companyId) {
      return res.status(400).json({ ok: false, error: "No se pudo determinar la empresa" });
    }

    const [assignment] = await db.select()
      .from(schema.licensedProfessionalAssignments)
      .where(and(
        eq(schema.licensedProfessionalAssignments.companyId, companyId),
        eq(schema.licensedProfessionalAssignments.isActive, true)
      ));

    if (!assignment) {
      return res.json({
        ok: true,
        data: null,
        message: "No hay LSO asignado a esta empresa"
      });
    }

    // Si es asignación externa, devolver datos externos
    if (assignment.externalLsoId) {
      return res.json({
        ok: true,
        data: {
          type: 'external',
          assignmentId: assignment.id,
          externalLsoId: assignment.externalLsoId,
          name: assignment.externalLsoName,
          email: assignment.externalLsoEmail,
          phone: assignment.externalLsoPhone,
          city: assignment.externalLsoCity,
          licenseNumber: assignment.externalLsoLicenseNumber,
          licenseIssuer: assignment.externalLsoLicenseIssuer,
          licenseExpiry: assignment.externalLsoLicenseExpiry,
          signatureUrl: assignment.externalLsoSignatureUrl,
          assignedAt: assignment.assignedAt,
        }
      });
    }

    // Asignación interna - obtener datos del usuario
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, assignment.userId));

    return res.json({
      ok: true,
      data: {
        type: 'internal',
        assignmentId: assignment.id,
        userId: assignment.userId,
        name: user?.fullName,
        email: user?.email,
        assignedAt: assignment.assignedAt,
      }
    });
  } catch (error) {
    logger.error({ error }, "[LSO-JWT-Routes] Error obteniendo asignación actual");
    return res.status(500).json({ ok: false, error: "Error al obtener asignación" });
  }
});

/**
 * GET /api/lso-directory-jwt/status
 * Verifica el estado de la integración con el directorio externo
 */
router.get("/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const isConfigured = lsoDirectoryJwtClient.isConfigured();
    
    if (!isConfigured) {
      return res.json({ 
        ok: true, 
        configured: false,
        message: "Integración no configurada. Se requiere LANDING_PAGE_API_KEY."
      });
    }

    // Intentar una búsqueda simple para verificar conexión
    try {
      await lsoDirectoryJwtClient.searchLso({ limit: 1 });
      return res.json({ 
        ok: true, 
        configured: true,
        connected: true,
        message: "Integración configurada y funcionando correctamente"
      });
    } catch (error) {
      return res.json({ 
        ok: true, 
        configured: true,
        connected: false,
        message: "Integración configurada pero no se pudo conectar al directorio externo"
      });
    }
  } catch (error) {
    logger.error({ error }, "[LSO-JWT-Routes] Error verificando estado");
    return res.status(500).json({ ok: false, error: "Error al verificar estado" });
  }
});

export default router;
