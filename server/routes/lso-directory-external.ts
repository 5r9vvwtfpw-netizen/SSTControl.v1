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
import { requireAuth, requirePermission, hashPassword } from "../auth";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { lsoDirectoryApi, type LsoRegistration } from "../services/lso-directory-api";
import { sendLsoPortalAccessEmail, sendLsoRemovalNotificationEmail, sendLsoNewAssignmentEmail } from "../email";
import { randomBytes } from "crypto";
import { storage } from "../storage";

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

      const { externalLsoId } = req.body;

      if (!externalLsoId) {
        return res.status(400).json({
          ok: false,
          message: "externalLsoId es requerido",
        });
      }

      // VALIDACIÓN SERVER-SIDE: Obtener datos directamente de la API externa
      if (!lsoDirectoryApi.isConfigured()) {
        return res.status(503).json({
          ok: false,
          message: "La integración con el directorio LSO no está configurada",
        });
      }

      const externalLso = await lsoDirectoryApi.getLsoById(parseInt(externalLsoId.toString()));

      if (!externalLso) {
        return res.status(404).json({
          ok: false,
          message: "Profesional LSO no encontrado en el directorio externo",
        });
      }

      if (externalLso.status !== 'confirmed') {
        return res.status(400).json({
          ok: false,
          message: "El profesional LSO no está confirmado en el directorio",
        });
      }

      // Usar datos de la API, no datos del cliente (integridad de datos)
      const lsoData = {
        fullName: externalLso.fullName,
        email: externalLso.email,
        phone: externalLso.phone,
        city: externalLso.city,
        licenseNumber: externalLso.licenseNumber,
        licenseIssuer: externalLso.licenseIssuer,
        licenseExpiry: externalLso.licenseExpiry,
        signatureUrl: externalLso.signatureUrl,
      };

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

      for (const existing of existingAssignments) {
        await db.update(schema.licensedProfessionalAssignments)
          .set({ isActive: false, unassignedAt: new Date() })
          .where(eq(schema.licensedProfessionalAssignments.id, existing.id));

        try {
          const [prevLso] = await db.select().from(schema.users).where(eq(schema.users.id, existing.userId));
          if (prevLso) {
            const removalDateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            await storage.createInternalMessage({
              companyId, senderId: prevLso.id, senderName: 'Sistema SST Colombia', senderRole: 'superadmin',
              receiverId: prevLso.id, receiverName: `${prevLso.firstName || ''} ${prevLso.lastName || ''}`.trim() || prevLso.username,
              receiverRole: prevLso.role, subject: `Finalización de asignación - ${company.name}`,
              content: `Le informamos que la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) ha finalizado su asignación como profesional licenciado responsable del SG-SST a partir del ${removalDateStr}. Un nuevo profesional ha sido asignado en su lugar. Los documentos que usted firmó durante su gestión permanecen válidos.`,
              priority: 'high', status: 'unread', relatedEntity: 'lso_assignment', relatedEntityId: existing.id,
            });
            if (prevLso.email) {
              await sendLsoRemovalNotificationEmail(prevLso.email, {
                lsoName: `${prevLso.firstName || ''} ${prevLso.lastName || ''}`.trim() || prevLso.username,
                companyName: company.name, companyNit: company.nit || 'N/A', removalDate: removalDateStr,
              });
            }
          }
        } catch (notifErr) { console.error('[LSO-External] Error notifying previous LSO:', notifErr); }
      }

      // Auto-provisionar usuario LSO si no existe
      let lsoUserId: string = user.id; // fallback al usuario que asigna
      let autoCreatedUser = false;
      let temporaryPassword = '';

      if (!lsoData.email) {
        return res.status(400).json({
          ok: false,
          message: "El profesional LSO debe tener un email registrado para crear la asignación",
        });
      }

      {
        const existingUser = await storage.getUserByEmail(lsoData.email);

        if (existingUser) {
          if (existingUser.role === 'lso') {
            lsoUserId = existingUser.id;
            console.log(`[LSO-AUTO] Usuario LSO existente encontrado para ${lsoData.email}: ${existingUser.id}, no se generan nuevas credenciales`);

            const baseUrl = process.env.REPLIT_DOMAINS
              ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
              : 'https://sst-colombia.com.co';

            try {
              await sendLsoNewAssignmentEmail(lsoData.email, {
                lsoName: existingUser.fullName || lsoData.fullName || 'Profesional LSO',
                companyName: company.name || 'Empresa',
                companyNit: company.nit || undefined,
                loginUrl: `${baseUrl}/portal-licenciado`,
              });
              console.log(`[LSO-AUTO] Notificación de nueva asignación enviada a ${lsoData.email} (sin credenciales)`);
            } catch (emailError: any) {
              console.error(`[LSO-AUTO] Error enviando email de nueva asignación:`, emailError.message);
            }
          } else {
            console.log(`[LSO-AUTO] Email ${lsoData.email} ya existe con rol "${existingUser.role}", asignación procede sin cuenta de portal`);
          }
        } else {
          const nameParts = (lsoData.fullName || 'lso').toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, "")
            .split(" ").filter((p: string) => p.length > 0);

          let baseUsername = nameParts.length >= 2
            ? `${nameParts[0]}_${nameParts[nameParts.length - 1]}`
            : nameParts[0] || "lso";

          let username = baseUsername;
          let counter = 1;
          while (await storage.getUserByUsername(username)) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
          const bytes = randomBytes(16);
          temporaryPassword = '';
          for (let i = 0; i < 16; i++) {
            temporaryPassword += chars[bytes[i] % chars.length];
          }

          const hashedPassword = await hashPassword(temporaryPassword);

          const [newLsoUser] = await db.insert(schema.users).values({
            username,
            password: hashedPassword,
            role: "lso",
            fullName: lsoData.fullName,
            email: lsoData.email,
            companyId: companyId,
            sstLicenseNumber: lsoData.licenseNumber || null,
            sstLicenseIssuer: lsoData.licenseIssuer || null,
            sstLicenseExpiresAt: lsoData.licenseExpiry ? new Date(lsoData.licenseExpiry) : null,
            sstSignatureUrl: lsoData.signatureUrl || null,
            sstPhone: lsoData.phone || null,
          }).returning();

          lsoUserId = newLsoUser.id;
          autoCreatedUser = true;
          console.log(`[LSO-AUTO] Usuario LSO auto-creado: ${username} (${newLsoUser.id}) para empresa ${companyId}`);
        }
      }

      // Crear la nueva asignación con datos del LSO externo
      const [assignment] = await db.insert(schema.licensedProfessionalAssignments)
        .values({
          companyId,
          userId: lsoUserId,
          assignedBy: user.id,
          isActive: true,
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

      // Enviar credenciales por email al LSO si se auto-creó
      if (autoCreatedUser && lsoData.email && temporaryPassword) {
        const baseUrl = process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : 'https://sst-colombia.com.co';

        try {
          await sendLsoPortalAccessEmail(lsoData.email, {
            lsoName: lsoData.fullName || 'Profesional LSO',
            username: (await db.select({ username: schema.users.username }).from(schema.users).where(eq(schema.users.id, lsoUserId)))[0]?.username || '',
            temporaryPassword,
            companyName: company.name || 'Empresa',
            loginUrl: `${baseUrl}/portal-licenciado`,
            companyEmail: company.contactEmail || undefined,
          });
          console.log(`[LSO-AUTO] Credenciales enviadas por email a ${lsoData.email}`);
        } catch (emailError: any) {
          console.error(`[LSO-AUTO] Error enviando email de credenciales:`, emailError.message);
        }
      }

      console.log(`[POST /api/lso-directory/assign-external] LSO externo ${externalLsoId} asignado a empresa ${companyId} (usuario: ${lsoUserId}, auto-creado: ${autoCreatedUser})`);

      res.status(201).json({
        ok: true,
        message: autoCreatedUser
          ? "LSO asignado exitosamente. Se creó el usuario automáticamente y se enviaron las credenciales por email."
          : `LSO asignado exitosamente. Se envió notificación de nueva asignación a ${lsoData.email}.`,
        data: assignment,
        userAutoCreated: autoCreatedUser,
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

      const activeAssignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.companyId, companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      await db.update(schema.licensedProfessionalAssignments)
        .set({ isActive: false, unassignedAt: new Date() })
        .where(and(
          eq(schema.licensedProfessionalAssignments.companyId, companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      for (const assignment of activeAssignments) {
        try {
          const [lsoUser] = await db.select().from(schema.users).where(eq(schema.users.id, assignment.userId));
          const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId));
          if (lsoUser && company) {
            const removalDateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            await storage.createInternalMessage({
              companyId, senderId: lsoUser.id, senderName: 'Sistema SST Colombia', senderRole: 'superadmin',
              receiverId: lsoUser.id, receiverName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
              receiverRole: lsoUser.role, subject: `Finalización de asignación - ${company.name}`,
              content: `Le informamos que la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) ha finalizado su asignación como profesional licenciado responsable del SG-SST a partir del ${removalDateStr}. Los documentos que usted firmó durante su gestión permanecen válidos. Puede consultar el historial de sus empresas anteriores en la pestaña Empresas de su portal.`,
              priority: 'high', status: 'unread', relatedEntity: 'lso_assignment', relatedEntityId: assignment.id,
            });
            if (lsoUser.email) {
              await sendLsoRemovalNotificationEmail(lsoUser.email, {
                lsoName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
                companyName: company.name, companyNit: company.nit || 'N/A', removalDate: removalDateStr,
              });
            }
          }
        } catch (notifErr) { console.error('[LSO-External] Error notifying LSO removal:', notifErr); }
      }

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
