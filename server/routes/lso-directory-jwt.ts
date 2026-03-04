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
import { hashPassword } from "../auth";
import { sendLsoPortalAccessEmail, sendLsoRemovalNotificationEmail, sendLsoNewAssignmentEmail } from "../email";
import { randomBytes } from "crypto";
import { storage } from "../storage";
import { notifyNewMessage } from "../websocket";

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
 * Acepta datos completos del LSO del frontend (ya validados por la búsqueda)
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

    const { externalLsoId, lsoData } = req.body;

    if (!externalLsoId) {
      return res.status(400).json({ 
        ok: false, 
        error: "externalLsoId es requerido" 
      });
    }

    // Usar datos del LSO enviados por el frontend (ya provienen de la búsqueda del directorio)
    // Esto evita una llamada adicional al directorio externo que puede fallar
    let lso: any;
    
    if (lsoData && lsoData.fullName && lsoData.email) {
      // Si tenemos datos completos del frontend, usarlos directamente
      lso = {
        id: parseInt(externalLsoId.toString()),
        fullName: lsoData.fullName,
        email: lsoData.email,
        phone: lsoData.phone,
        city: lsoData.city,
        status: lsoData.status || 'confirmed',
        licenseNumber: lsoData.licenseNumber,
        licenseIssuer: lsoData.licenseIssuer,
        licenseExpiry: lsoData.licenseExpiry,
        professionType: lsoData.professionType,
        signatureUrl: lsoData.signatureUrl,
      };
      
      // Validar que el status sea 'confirmed' si está disponible
      if (lsoData.status && lsoData.status !== 'confirmed') {
        return res.status(400).json({ 
          ok: false, 
          error: "El profesional LSO no está confirmado en el directorio" 
        });
      }

      // Validar que la licencia no esté expirada
      if (lsoData.licenseExpiry) {
        const expiryDate = new Date(lsoData.licenseExpiry);
        if (expiryDate < new Date()) {
          return res.status(400).json({ 
            ok: false, 
            error: "La licencia del profesional LSO ha expirado" 
          });
        }
      }

      logger.info({ externalLsoId, fullName: lso.fullName }, "[LSO-JWT-Routes] Usando datos del LSO del frontend");
    } else {
      // Fallback: intentar validar con el directorio externo
      const validation = await lsoDirectoryJwtClient.validateLsoForAssignment(
        parseInt(externalLsoId.toString())
      );
      
      if (!validation.valid) {
        logger.warn({ externalLsoId, error: validation.error }, "[LSO-JWT-Routes] Validación fallida");
        return res.status(400).json({ ok: false, error: validation.error });
      }
      
      lso = validation.lso!;
    }

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
        .set({ isActive: false, unassignedAt: new Date() })
        .where(eq(schema.licensedProfessionalAssignments.id, existing.id));

      try {
        const [prevLso] = await db.select().from(schema.users).where(eq(schema.users.id, existing.userId));
        if (prevLso) {
          const removalDateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
          const jwtRemovalMsg = await storage.createInternalMessage({
            companyId, senderId: prevLso.id, senderName: 'Sistema SST Colombia', senderRole: 'superadmin',
            receiverId: prevLso.id, receiverName: `${prevLso.firstName || ''} ${prevLso.lastName || ''}`.trim() || prevLso.username,
            receiverRole: prevLso.role, subject: `Finalización de asignación - ${company.name}`,
            content: `Le informamos que la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) ha finalizado su asignación como profesional licenciado responsable del SG-SST a partir del ${removalDateStr}. Un nuevo profesional ha sido asignado en su lugar. Los documentos que usted firmó durante su gestión permanecen válidos.`,
            priority: 'urgent', status: 'unread', relatedEntity: 'lso_assignment', relatedEntityId: existing.id,
          });
          try { notifyNewMessage(prevLso.id, prevLso.id, jwtRemovalMsg.id); } catch (e) { /* ignore */ }
          if (prevLso.email) {
            await sendLsoRemovalNotificationEmail(prevLso.email, {
              lsoName: `${prevLso.firstName || ''} ${prevLso.lastName || ''}`.trim() || prevLso.username,
              companyName: company.name, companyNit: company.nit || 'N/A', removalDate: removalDateStr,
            });
          }
        }
      } catch (notifErr) { logger.error({ notifErr }, "[LSO-JWT-Routes] Error notifying previous LSO"); }
    }

    // Auto-provisionar usuario LSO si no existe
    let lsoUserId: string = user.id;
    let autoCreatedUser = false;
    let autoUsername = '';

    if (!lso.email) {
      return res.status(400).json({ ok: false, error: "El profesional LSO debe tener un email registrado para crear la asignación" });
    }

    const existingUser = await storage.getUserByEmail(lso.email);

    if (existingUser) {
      if (existingUser.role === 'lso') {
        lsoUserId = existingUser.id;
        logger.info({ email: lso.email, userId: existingUser.id }, "[LSO-AUTO] Usuario LSO existente encontrado, no se generan nuevas credenciales");

        const baseUrl = process.env.VITE_APP_URL || 'https://sst-colombia.com';

        try {
          await sendLsoNewAssignmentEmail(lso.email, {
            lsoName: existingUser.fullName || lso.fullName || 'Profesional LSO',
            companyName: company.name || 'Empresa',
            companyNit: company.nit || undefined,
            loginUrl: `${baseUrl}/portal-licenciado`,
            companyEmail: company.contactEmail || undefined,
          });
          logger.info({ email: lso.email }, "[LSO-AUTO] Notificación de nueva asignación enviada (sin credenciales)");
        } catch (emailError: any) {
          logger.error({ error: emailError.message }, "[LSO-AUTO] Error enviando email de nueva asignación");
        }
      } else {
        logger.info({ email: lso.email, existingRole: existingUser.role }, "[LSO-AUTO] Email ya existe con otro rol, asignación procede sin cuenta de portal");
      }
    } else {
        const nameParts = (lso.fullName || 'lso').toLowerCase()
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
        let temporaryPassword = '';
        for (let i = 0; i < 16; i++) {
          temporaryPassword += chars[bytes[i] % chars.length];
        }

        const hashedPassword = await hashPassword(temporaryPassword);

        const [newLsoUser] = await db.insert(schema.users).values({
          username,
          password: hashedPassword,
          role: "lso",
          fullName: lso.fullName,
          email: lso.email,
          companyId: companyId,
          sstLicenseNumber: lso.licenseNumber || null,
          sstLicenseIssuer: lso.licenseIssuer || null,
          sstLicenseExpiresAt: lso.licenseExpiry ? new Date(lso.licenseExpiry) : null,
          sstSignatureUrl: lso.signatureUrl || null,
          sstPhone: lso.phone || null,
        }).returning();

        lsoUserId = newLsoUser.id;
        autoCreatedUser = true;
        autoUsername = username;

        logger.info({ username, userId: newLsoUser.id, companyId }, "[LSO-AUTO] Usuario LSO auto-creado");

        const baseUrl = process.env.VITE_APP_URL || 'https://sst-colombia.com';

        try {
          await sendLsoPortalAccessEmail(lso.email, {
            lsoName: lso.fullName || 'Profesional LSO',
            username,
            temporaryPassword,
            companyName: company.name || 'Empresa',
            loginUrl: `${baseUrl}/portal-licenciado`,
            companyEmail: company.contactEmail || undefined,
          });
          logger.info({ email: lso.email }, "[LSO-AUTO] Credenciales enviadas por email");
        } catch (emailError: any) {
          logger.error({ error: emailError.message }, "[LSO-AUTO] Error enviando email de credenciales");
        }
    }

    // Crear nueva asignación con datos del LSO externo
    const [assignment] = await db.insert(schema.licensedProfessionalAssignments)
      .values({
        companyId,
        userId: lsoUserId,
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

    try {
      const [lsoUser] = await db.select().from(schema.users).where(eq(schema.users.id, lsoUserId));
      if (lsoUser) {
        const assignDateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        const jwtAssignMsg = await storage.createInternalMessage({
          companyId,
          senderId: user.id,
          senderName: 'Sistema SST Colombia',
          senderRole: 'superadmin',
          receiverId: lsoUser.id,
          receiverName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
          receiverRole: lsoUser.role,
          subject: `Nueva asignación - ${company.name}`,
          content: `Le informamos que ha sido asignado como profesional licenciado responsable del SG-SST para la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) a partir del ${assignDateStr}. Puede gestionar esta empresa desde la pestaña Empresas de su portal.`,
          priority: 'normal',
          status: 'unread',
          relatedEntity: 'lso_assignment',
          relatedEntityId: assignment.id,
        });
        try { notifyNewMessage(lsoUser.id, user.id, jwtAssignMsg.id); } catch (e) { /* ignore */ }
      }
    } catch (notifErr) {
      logger.error({ notifErr }, '[LSO-JWT-Routes] Error creating assignment notification');
    }

    logger.info({ companyId, externalLsoId, lsoName: lso.fullName, autoCreatedUser }, "[LSO-JWT-Routes] LSO externo asignado exitosamente");

    return res.status(201).json({ 
      ok: true, 
      message: autoCreatedUser
        ? `Profesional LSO asignado exitosamente. Se creó el usuario "${autoUsername}" y se enviaron credenciales a ${lso.email}.`
        : `Profesional LSO asignado exitosamente. Se envió notificación de nueva asignación a ${lso.email}.`,
      data: assignment,
      userAutoCreated: autoCreatedUser,
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
          const jwtDelMsg = await storage.createInternalMessage({
            companyId, senderId: lsoUser.id, senderName: 'Sistema SST Colombia', senderRole: 'superadmin',
            receiverId: lsoUser.id, receiverName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
            receiverRole: lsoUser.role, subject: `Finalización de asignación - ${company.name}`,
            content: `Le informamos que la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) ha finalizado su asignación como profesional licenciado responsable del SG-SST a partir del ${removalDateStr}. Los documentos que usted firmó durante su gestión permanecen válidos. Puede consultar el historial de sus empresas anteriores en la pestaña Empresas de su portal.`,
            priority: 'urgent', status: 'unread', relatedEntity: 'lso_assignment', relatedEntityId: assignment.id,
          });
          try { notifyNewMessage(lsoUser.id, lsoUser.id, jwtDelMsg.id); } catch (e) { /* ignore */ }
          if (lsoUser.email) {
            await sendLsoRemovalNotificationEmail(lsoUser.email, {
              lsoName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
              companyName: company.name, companyNit: company.nit || 'N/A', removalDate: removalDateStr,
            });
          }
        }
      } catch (notifErr) { logger.error({ notifErr }, "[LSO-JWT-Routes] Error notifying LSO removal"); }
    }

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

    // Si es asignación externa, devolver datos externos + estado del usuario LSO
    if (assignment.externalLsoId) {
      let portalAccess: { hasAccount: boolean; username?: string; userId?: string } = { hasAccount: false };
      let professionType: string | null = null;
      let identificationNumber: string | null = null;
      let course50Hours: boolean = false;
      let course50HoursDate: string | null = null;
      let userLicenseNumber = assignment.externalLsoLicenseNumber;
      let userLicenseIssuer = assignment.externalLsoLicenseIssuer;
      let userLicenseExpiry = assignment.externalLsoLicenseExpiry;
      let userSignatureUrl = assignment.externalLsoSignatureUrl;

      if (assignment.externalLsoEmail) {
        const lsoUser = await storage.getUserByEmail(assignment.externalLsoEmail);
        if (lsoUser && lsoUser.role === 'lso') {
          portalAccess = { hasAccount: true, username: lsoUser.username, userId: lsoUser.id };
          professionType = lsoUser.sstProfessionType || null;
          course50Hours = lsoUser.sstCourse50Hours || false;
          course50HoursDate = lsoUser.sstCourse50HoursDate || null;
          if (!userLicenseNumber && lsoUser.sstLicenseNumber) userLicenseNumber = lsoUser.sstLicenseNumber;
          if (!userLicenseIssuer && lsoUser.sstLicenseIssuer) userLicenseIssuer = lsoUser.sstLicenseIssuer;
          if (!userLicenseExpiry && lsoUser.sstLicenseExpiresAt) userLicenseExpiry = lsoUser.sstLicenseExpiresAt;
          if (!userSignatureUrl && lsoUser.sstSignatureUrl) userSignatureUrl = lsoUser.sstSignatureUrl;
          if (lsoUser.sstIdentificationNumber) {
            identificationNumber = lsoUser.sstIdentificationNumber;
          } else if (lsoUser.workerId) {
            const [worker] = await db.select({ identificationNumber: schema.workers.identificationNumber })
              .from(schema.workers)
              .where(eq(schema.workers.id, lsoUser.workerId));
            if (worker) identificationNumber = worker.identificationNumber;
          }
        }
      }

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
          licenseNumber: userLicenseNumber,
          licenseIssuer: userLicenseIssuer,
          licenseExpiry: userLicenseExpiry,
          signatureUrl: userSignatureUrl,
          professionType,
          identificationNumber,
          course50Hours,
          course50HoursDate,
          assignedAt: assignment.assignedAt,
          portalAccess,
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
