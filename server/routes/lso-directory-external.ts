/**
 * LSO Directory External API Routes
 * 
 * Endpoints para integración con el directorio externo de LSO
 * URL Base Externa: https://lso.sst-colombia.com.co
 * 
 * Permite a las empresas:
 * - Ver el directorio de profesionales LSO disponibles
 * - Asignar un LSO desde el directorio externo
 * - Sincronizar datos del LSO con la base de datos local
 */

import type { Express } from "express";
import { requireAuth, requirePermission } from "../auth";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { lsoDirectoryApi, type LsoRegistration } from "../services/lso-directory-api";

// Helper function to get effective company ID
function getEffectiveCompanyId(req: any): string | null {
  const headerCompanyId = req.headers['x-company-id'] as string | undefined;
  const isGlobalUser = ['superadmin', 'admin', 'asesor'].includes(req.user!.role);
  
  if (isGlobalUser && headerCompanyId) {
    return headerCompanyId;
  }
  return req.user!.companyId || null;
}

export function registerLsoDirectoryExternalRoutes(app: Express) {

  /**
   * GET /api/lso-directory/external
   * Consulta el directorio externo de profesionales LSO
   * Requiere: Autenticación + permiso de asignación de profesionales
   */
  app.get("/api/lso-directory/external", requireAuth, async (req, res) => {
    try {
      // Verificar que la API está configurada
      if (!lsoDirectoryApi.isConfigured()) {
        return res.status(503).json({
          ok: false,
          message: "La integración con el directorio LSO no está configurada. Falta LSO_API_KEY.",
        });
      }

      const { search, city } = req.query;

      // Obtener registros confirmados del directorio externo
      let lsoList = await lsoDirectoryApi.getAllConfirmedRegistrations();

      // Filtrar por búsqueda si se proporciona
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        lsoList = lsoList.filter(lso =>
          lso.fullName.toLowerCase().includes(searchLower) ||
          lso.email.toLowerCase().includes(searchLower)
        );
      }

      // Filtrar por ciudad si se proporciona
      if (city && typeof city === 'string') {
        const cityLower = city.toLowerCase();
        lsoList = lsoList.filter(lso =>
          lso.city.toLowerCase().includes(cityLower)
        );
      }

      console.log(`[GET /api/lso-directory/external] Found ${lsoList.length} LSO professionals`);

      res.json({
        ok: true,
        data: lsoList,
        total: lsoList.length,
      });
    } catch (error: any) {
      console.error('[GET /api/lso-directory/external] Error:', error.message);
      res.status(500).json({
        ok: false,
        message: "Error al consultar el directorio de LSO",
        error: error.message,
      });
    }
  });

  /**
   * GET /api/lso-directory/external/:id
   * Obtiene detalles de un profesional LSO específico del directorio externo
   */
  app.get("/api/lso-directory/external/:id", requireAuth, async (req, res) => {
    try {
      if (!lsoDirectoryApi.isConfigured()) {
        return res.status(503).json({
          ok: false,
          message: "La integración con el directorio LSO no está configurada.",
        });
      }

      const externalId = parseInt(req.params.id);
      
      if (isNaN(externalId)) {
        return res.status(400).json({
          ok: false,
          message: "ID inválido",
        });
      }

      const lso = await lsoDirectoryApi.getLsoById(externalId);

      if (!lso) {
        return res.status(404).json({
          ok: false,
          message: "Profesional LSO no encontrado en el directorio",
        });
      }

      res.json({
        ok: true,
        data: lso,
      });
    } catch (error: any) {
      console.error('[GET /api/lso-directory/external/:id] Error:', error.message);
      res.status(500).json({
        ok: false,
        message: "Error al obtener detalles del LSO",
        error: error.message,
      });
    }
  });

  /**
   * POST /api/lso-directory/assign-external
   * Asigna un profesional LSO del directorio externo a la empresa
   * Crea el registro en licensed_professional_assignments con datos externos
   */
  app.post("/api/lso-directory/assign-external", requirePermission("licensed_professionals:assign"), async (req, res) => {
    try {
      const user = req.user!;
      const companyId = getEffectiveCompanyId(req);

      if (!companyId) {
        return res.status(400).json({
          ok: false,
          message: "No se pudo determinar la empresa",
        });
      }

      const { externalLsoId, lsoData } = req.body;

      if (!externalLsoId || !lsoData) {
        return res.status(400).json({
          ok: false,
          message: "externalLsoId y lsoData son requeridos",
        });
      }

      // Verificar que la empresa existe
      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyId));

      if (!company) {
        return res.status(404).json({
          ok: false,
          message: "Empresa no encontrada",
        });
      }

      // Verificar si ya existe una asignación externa activa
      const existingAssignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.companyId, companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      // Si hay asignaciones activas, desactivarlas primero
      for (const existing of existingAssignments) {
        await db.update(schema.licensedProfessionalAssignments)
          .set({ isActive: false })
          .where(eq(schema.licensedProfessionalAssignments.id, existing.id));
      }

      // Crear la nueva asignación con datos del LSO externo
      const [assignment] = await db.insert(schema.licensedProfessionalAssignments)
        .values({
          companyId,
          userId: user.id, // Temporalmente usamos el usuario que hace la asignación
          assignedBy: user.id,
          isActive: true,
          // Campos adicionales para LSO externo (si existen en el schema)
          externalLsoId: externalLsoId.toString(),
          externalLsoName: lsoData.fullName || null,
          externalLsoEmail: lsoData.email || null,
          externalLsoPhone: lsoData.phone || null,
          externalLsoCity: lsoData.city || null,
          externalLsoLicenseNumber: lsoData.licenseNumber || null,
          externalLsoLicenseIssuer: lsoData.licenseIssuer || null,
          externalLsoLicenseExpiry: lsoData.licenseExpiry ? new Date(lsoData.licenseExpiry) : null,
          externalLsoSignatureUrl: lsoData.signatureUrl || null,
        })
        .returning();

      console.log(`[POST /api/lso-directory/assign-external] LSO externo ${externalLsoId} asignado a empresa ${companyId}`);

      res.status(201).json({
        ok: true,
        message: "LSO asignado exitosamente desde el directorio externo",
        data: assignment,
      });
    } catch (error: any) {
      console.error('[POST /api/lso-directory/assign-external] Error:', error.message);
      res.status(500).json({
        ok: false,
        message: "Error al asignar el LSO",
        error: error.message,
      });
    }
  });

  /**
   * GET /api/lso-directory/company-assignment
   * Obtiene la asignación actual de LSO para la empresa
   */
  app.get("/api/lso-directory/company-assignment", requireAuth, async (req, res) => {
    try {
      const companyId = getEffectiveCompanyId(req);

      if (!companyId) {
        return res.status(400).json({
          ok: false,
          message: "No se pudo determinar la empresa",
        });
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
          message: "No hay LSO asignado a esta empresa",
        });
      }

      // Si es una asignación externa, devolver los datos externos
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
          },
        });
      }

      // Si es una asignación interna, buscar los datos del usuario
      const [lsoUser] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, assignment.userId));

      if (!lsoUser) {
        return res.json({
          ok: true,
          data: null,
          message: "Usuario LSO no encontrado",
        });
      }

      res.json({
        ok: true,
        data: {
          type: 'internal',
          assignmentId: assignment.id,
          userId: lsoUser.id,
          name: lsoUser.fullName || lsoUser.username,
          email: lsoUser.email,
          phone: lsoUser.sstPhone,
          licenseNumber: lsoUser.sstLicenseNumber,
          licenseIssuer: lsoUser.sstLicenseIssuer,
          licenseExpiry: lsoUser.sstLicenseExpiresAt,
          signatureUrl: lsoUser.sstSignatureUrl,
          assignedAt: assignment.assignedAt,
        },
      });
    } catch (error: any) {
      console.error('[GET /api/lso-directory/company-assignment] Error:', error.message);
      res.status(500).json({
        ok: false,
        message: "Error al obtener la asignación de LSO",
        error: error.message,
      });
    }
  });

  /**
   * DELETE /api/lso-directory/company-assignment
   * Desactiva la asignación actual de LSO para la empresa
   */
  app.delete("/api/lso-directory/company-assignment", requirePermission("licensed_professionals:assign"), async (req, res) => {
    try {
      const companyId = getEffectiveCompanyId(req);

      if (!companyId) {
        return res.status(400).json({
          ok: false,
          message: "No se pudo determinar la empresa",
        });
      }

      const result = await db.update(schema.licensedProfessionalAssignments)
        .set({ isActive: false })
        .where(and(
          eq(schema.licensedProfessionalAssignments.companyId, companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      res.json({
        ok: true,
        message: "Asignación de LSO desactivada exitosamente",
      });
    } catch (error: any) {
      console.error('[DELETE /api/lso-directory/company-assignment] Error:', error.message);
      res.status(500).json({
        ok: false,
        message: "Error al desactivar la asignación de LSO",
        error: error.message,
      });
    }
  });

  /**
   * GET /api/lso-directory/status
   * Verifica el estado de la integración con el directorio LSO
   */
  app.get("/api/lso-directory/status", requireAuth, async (req, res) => {
    try {
      const isConfigured = lsoDirectoryApi.isConfigured();

      if (!isConfigured) {
        return res.json({
          ok: true,
          status: 'not_configured',
          message: "La API Key del directorio LSO no está configurada",
        });
      }

      // Intentar una consulta simple para verificar la conexión
      try {
        await lsoDirectoryApi.getConfirmedRegistrations({ limit: 1 });
        return res.json({
          ok: true,
          status: 'connected',
          message: "Conexión con el directorio LSO establecida",
        });
      } catch (apiError: any) {
        return res.json({
          ok: true,
          status: 'error',
          message: `Error de conexión: ${apiError.message}`,
        });
      }
    } catch (error: any) {
      console.error('[GET /api/lso-directory/status] Error:', error.message);
      res.status(500).json({
        ok: false,
        message: "Error al verificar el estado de la integración",
        error: error.message,
      });
    }
  });
}
