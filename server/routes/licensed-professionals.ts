import type { Express } from "express";
import { requireAuth, requirePermission } from "../auth";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { hasPermission, hasGlobalAccess } from "@shared/permissions";
import type { Request } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "../storage";
import { sendLsoRemovalNotificationEmail } from "../email";
import { objectStorageClient, ObjectStorageService } from "../replit_integrations/object_storage";
import { notifyNewMessage } from "../websocket";

async function shouldIncludeFallbackCompany(userId: string, companyId: string): Promise<boolean> {
  const [wasUnassigned] = await db.select({ id: schema.licensedProfessionalAssignments.id })
    .from(schema.licensedProfessionalAssignments)
    .where(and(
      eq(schema.licensedProfessionalAssignments.userId, userId),
      eq(schema.licensedProfessionalAssignments.companyId, companyId),
      eq(schema.licensedProfessionalAssignments.isActive, false)
    ))
    .limit(1);
  return !wasUnassigned;
}

async function notifyLsoRemoval(assignment: any, companyId: string) {
  try {
    const lsoUserId = assignment.userId || assignment.externalLsoId;
    if (!lsoUserId && !assignment.userId) return;

    const [lsoUser] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, assignment.userId));

    const [company] = await db.select()
      .from(schema.companies)
      .where(eq(schema.companies.id, companyId));

    if (!lsoUser || !company) return;

    const now = new Date();
    const removalDateStr = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    const msg = await storage.createInternalMessage({
      companyId: companyId,
      senderId: lsoUser.id,
      senderName: 'Sistema SST Colombia',
      senderRole: 'superadmin',
      receiverId: lsoUser.id,
      receiverName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
      receiverRole: lsoUser.role,
      subject: `Finalización de asignación - ${company.name}`,
      content: `Le informamos que la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) ha finalizado su asignación como profesional licenciado responsable del SG-SST a partir del ${removalDateStr}. Los documentos que usted firmó durante su gestión permanecen válidos. Puede consultar el historial de sus empresas anteriores en la pestaña Empresas de su portal.`,
      priority: 'urgent',
      status: 'unread',
      relatedEntity: 'lso_assignment',
      relatedEntityId: assignment.id,
    });
    try { notifyNewMessage(lsoUser.id, lsoUser.id, msg.id); } catch (e) { /* ignore ws error */ }

    if (lsoUser.email) {
      await sendLsoRemovalNotificationEmail(lsoUser.email, {
        lsoName: `${lsoUser.firstName || ''} ${lsoUser.lastName || ''}`.trim() || lsoUser.username,
        companyName: company.name,
        companyNit: company.nit || 'N/A',
        removalDate: removalDateStr,
      });
    }
  } catch (err) {
    console.error('[notifyLsoRemoval] Error sending removal notification:', err);
  }
}

const uploadLsoSignature = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (PNG, JPG)'));
    }
  }
});

function getObjectStorageBucketName(): string {
  return process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || 
    process.env.OBJECT_STORAGE_BUCKET_ID || 
    `replit-objstore-${process.env.REPL_ID || 'default'}`;
}

async function uploadSignatureToObjectStorage(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalName) || '.png';
  const privateDir = (process.env.PRIVATE_OBJECT_DIR || '/sst-evidences').replace(/^\//, '');
  const objectName = `${privateDir}/lso-signatures/lso-signature-${uniqueSuffix}${ext}`;

  const bucketName = getObjectStorageBucketName();
  console.log(`[Signature Upload] Uploading to bucket: ${bucketName}, object: ${objectName}`);
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  await file.save(fileBuffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  return `/${bucketName}/${objectName}`;
}

async function isSignatureAccessible(signatureUrl: string): Promise<boolean> {
  if (!signatureUrl) return false;

  if (signatureUrl.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'public', signatureUrl);
    return fs.existsSync(localPath);
  }

  try {
    const { bucketName, objectName } = parseObjectPathHelper(signatureUrl);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    const [exists] = await file.exists();
    return exists;
  } catch {
    return false;
  }
}

async function getSignatureBuffer(signatureUrl: string): Promise<Buffer | null> {
  if (!signatureUrl) return null;

  if (signatureUrl.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'public', signatureUrl);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
    return null;
  }

  try {
    const { bucketName, objectName } = parseObjectPathHelper(signatureUrl);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [contents] = await file.download();
    return contents;
  } catch {
    return null;
  }
}

function parseObjectPathHelper(objPath: string): { bucketName: string; objectName: string } {
  if (!objPath.startsWith('/')) objPath = '/' + objPath;
  const parts = objPath.split('/');
  if (parts.length < 3) throw new Error('Invalid object path');
  return { bucketName: parts[1], objectName: parts.slice(2).join('/') };
}

// Helper function to get effective company ID (same as in routes.ts)
function getEffectiveCompanyId(req: Request): string | null {
  const headerCompanyId = req.headers['x-company-id'] as string | undefined;
  const isGlobalUser = hasGlobalAccess(req.user!.role);
  
  if (isGlobalUser && headerCompanyId) {
    return headerCompanyId;
  }
  return req.user!.companyId || null;
}

export function registerLicensedProfessionalsRoutes(app: Express) {

  // GET /api/licensed-professionals - List all licensed professionals (users with role='lso')
  app.get("/api/licensed-professionals", requirePermission("licensed_professionals:view"), async (req, res) => {
    try {
      const { companyId } = req.query;
      
      let professionals = await db.select().from(schema.users).where(eq(schema.users.role, 'lso'));
      
      console.log('[GET /api/licensed-professionals] Found', professionals.length, 'LSO users');
      
      if (companyId && typeof companyId === 'string') {
        const assignments = await db.select()
          .from(schema.licensedProfessionalAssignments)
          .where(and(
            eq(schema.licensedProfessionalAssignments.companyId, companyId),
            eq(schema.licensedProfessionalAssignments.isActive, true)
          ));
        
        const assignedUserIds = new Set(assignments.map(a => a.userId));
        professionals = professionals.filter(p => assignedUserIds.has(p.id));
      }
      
      const professionalsWithAssignments = await Promise.all(
        professionals.map(async (prof) => {
          const assignments = await db.select({
            id: schema.licensedProfessionalAssignments.id,
            companyId: schema.licensedProfessionalAssignments.companyId,
            companyName: schema.companies.name,
            companyNit: schema.companies.nit,
            assignedAt: schema.licensedProfessionalAssignments.assignedAt,
            isActive: schema.licensedProfessionalAssignments.isActive,
          })
          .from(schema.licensedProfessionalAssignments)
          .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
          .where(eq(schema.licensedProfessionalAssignments.userId, prof.id));
          
          const { password, ...profWithoutPassword } = prof;
          return {
            ...profWithoutPassword,
            assignments
          };
        })
      );
      
      res.json(professionalsWithAssignments);
    } catch (error: any) {
      console.error('[GET /api/licensed-professionals] Error:', error.message);
      res.status(500).json({ message: "Error fetching licensed professionals", error: error.message });
    }
  });

  // GET /api/licensed-professionals/:id - Get single licensed professional details
  app.get("/api/licensed-professionals/:id", requirePermission("licensed_professionals:view"), async (req, res) => {
    try {
      const { id } = req.params;
      
      const [professional] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));
      
      if (!professional) {
        return res.status(404).json({ message: "Licensed professional not found" });
      }
      
      const assignments = await db.select({
        id: schema.licensedProfessionalAssignments.id,
        companyId: schema.licensedProfessionalAssignments.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
        assignedBy: schema.licensedProfessionalAssignments.assignedBy,
        isActive: schema.licensedProfessionalAssignments.isActive,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
      .where(eq(schema.licensedProfessionalAssignments.userId, id));
      
      const { password, ...profWithoutPassword } = professional;
      
      res.json({
        ...profWithoutPassword,
        assignments
      });
    } catch (error: any) {
      console.error('[GET /api/licensed-professionals/:id] Error:', error.message);
      res.status(500).json({ message: "Error fetching licensed professional", error: error.message });
    }
  });

  // PATCH /api/licensed-professionals/:id - Update licensed professional's SST data
  app.patch("/api/licensed-professionals/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      
      const canEdit = hasPermission(user.role, "licensed_professionals:edit");
      const canEditSelf = hasPermission(user.role, "licensed_professionals:edit_self") && user.id === id;
      
      if (!canEdit && !canEditSelf) {
        return res.status(403).json({ message: "You don't have permission to edit this professional" });
      }
      
      const [professional] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));
      
      if (!professional) {
        return res.status(404).json({ message: "Licensed professional not found" });
      }
      
      const allowedFields = [
        'sstProfessionType', 'sstLicenseNumber', 'sstLicenseIssuer', 
        'sstLicenseIssuedAt', 'sstLicenseExpiresAt', 'sstLicenseStatus',
        'sstSignatureUrl', 'sstPhone', 'fullName', 'email'
      ];
      
      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const [updatedProfessional] = await db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();
      
      const { password, ...profWithoutPassword } = updatedProfessional;
      
      res.json(profWithoutPassword);
    } catch (error: any) {
      console.error('[PATCH /api/licensed-professionals/:id] Error:', error.message);
      res.status(500).json({ message: "Error updating licensed professional", error: error.message });
    }
  });

  // POST /api/licensed-professionals/:id/assignments - Assign licensed professional to a company
  app.post("/api/licensed-professionals/:id/assignments", requirePermission("licensed_professionals:assign"), async (req, res) => {
    try {
      const { id } = req.params;
      const { companyId } = req.body;
      const user = req.user!;
      
      if (!companyId) {
        return res.status(400).json({ message: "companyId is required" });
      }
      
      const [professional] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));
      
      if (!professional) {
        return res.status(404).json({ message: "Licensed professional not found" });
      }
      
      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyId));
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const [existingAssignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, id),
          eq(schema.licensedProfessionalAssignments.companyId, companyId)
        ));
      
      if (existingAssignment) {
        if (!existingAssignment.isActive) {
          const [reactivated] = await db.update(schema.licensedProfessionalAssignments)
            .set({ isActive: true, assignedAt: new Date(), assignedBy: user.id, unassignedAt: null })
            .where(eq(schema.licensedProfessionalAssignments.id, existingAssignment.id))
            .returning();

          try {
            const assignDateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            const msg = await storage.createInternalMessage({
              companyId,
              senderId: user.id,
              senderName: 'Sistema SST Colombia',
              senderRole: 'superadmin',
              receiverId: professional.id,
              receiverName: `${professional.firstName || ''} ${professional.lastName || ''}`.trim() || professional.username,
              receiverRole: professional.role,
              subject: `Nueva asignación - ${company.name}`,
              content: `Le informamos que ha sido asignado nuevamente como profesional licenciado responsable del SG-SST para la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) a partir del ${assignDateStr}. Puede gestionar esta empresa desde la pestaña Empresas de su portal.`,
              priority: 'normal',
              status: 'unread',
              relatedEntity: 'lso_assignment',
              relatedEntityId: reactivated.id,
            });
            try { notifyNewMessage(professional.id, user.id, msg.id); } catch (e) { /* ignore ws error */ }
          } catch (notifErr) {
            console.error('[LSO-Reactivation] Error creating notification:', notifErr);
          }

          return res.json(reactivated);
        }
        return res.status(400).json({ message: "Professional is already assigned to this company" });
      }
      
      const [assignment] = await db.insert(schema.licensedProfessionalAssignments)
        .values({
          userId: id,
          companyId,
          assignedBy: user.id,
        })
        .returning();

      try {
        const assignDateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        const msg = await storage.createInternalMessage({
          companyId,
          senderId: user.id,
          senderName: 'Sistema SST Colombia',
          senderRole: 'superadmin',
          receiverId: professional.id,
          receiverName: `${professional.firstName || ''} ${professional.lastName || ''}`.trim() || professional.username,
          receiverRole: professional.role,
          subject: `Nueva asignación - ${company.name}`,
          content: `Le informamos que ha sido asignado como profesional licenciado responsable del SG-SST para la empresa "${company.name}" (NIT: ${company.nit || 'N/A'}) a partir del ${assignDateStr}. Puede gestionar esta empresa desde la pestaña Empresas de su portal.`,
          priority: 'normal',
          status: 'unread',
          relatedEntity: 'lso_assignment',
          relatedEntityId: assignment.id,
        });
        try { notifyNewMessage(professional.id, user.id, msg.id); } catch (e) { /* ignore ws error */ }
      } catch (notifErr) {
        console.error('[LSO-Assignment] Error creating assignment notification:', notifErr);
      }

      res.status(201).json(assignment);
    } catch (error: any) {
      console.error('[POST /api/licensed-professionals/:id/assignments] Error:', error.message);
      res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
  });

  // DELETE /api/licensed-professionals/:id/assignments/:companyId - Remove assignment
  app.delete("/api/licensed-professionals/:id/assignments/:companyId", requirePermission("licensed_professionals:assign"), async (req, res) => {
    try {
      const { id, companyId } = req.params;
      
      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, id),
          eq(schema.licensedProfessionalAssignments.companyId, companyId)
        ));
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      await db.update(schema.licensedProfessionalAssignments)
        .set({ isActive: false, unassignedAt: new Date() })
        .where(eq(schema.licensedProfessionalAssignments.id, assignment.id));

      await notifyLsoRemoval(assignment, companyId);
      
      res.json({ success: true, message: "Assignment removed successfully" });
    } catch (error: any) {
      console.error('[DELETE /api/licensed-professionals/:id/assignments/:companyId] Error:', error.message);
      res.status(500).json({ message: "Error removing assignment", error: error.message });
    }
  });

  // ==================== PORTAL LICENCIADO ROUTES ====================

  // GET /api/portal-licenciado/dashboard - Dashboard stats for the LSO
  app.get("/api/portal-licenciado/dashboard", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      
      // Get all active assignments for this LSO
      const assignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      const companyIds = assignments.map(a => a.companyId);
      if (companyIds.length === 0 && user.companyId) {
        if (await shouldIncludeFallbackCompany(user.id, user.companyId)) {
          companyIds.push(user.companyId);
        }
      }
      
      let pendingDocuments = 0;
      let signedDocuments = 0;
      
      if (companyIds.length > 0) {
        // Get pending investigations count (need signature)
        const pendingResult = await db.select({ count: sql<number>`count(*)` })
          .from(schema.accidentInvestigations)
          .where(and(
            sql`${schema.accidentInvestigations.companyId} IN ${companyIds}`,
            eq(schema.accidentInvestigations.requiresLicensedProfessional, 1),
            sql`${schema.accidentInvestigations.status} IN ('pendiente', 'en_proceso')`,
            sql`(${schema.accidentInvestigations.licensedProfessionalName} IS NULL OR ${schema.accidentInvestigations.licensedProfessionalName} = '')`
          ));
        
        pendingDocuments = Number(pendingResult[0]?.count || 0);
        
        // Get signed investigations count
        const signedResult = await db.select({ count: sql<number>`count(*)` })
          .from(schema.accidentInvestigations)
          .where(and(
            sql`${schema.accidentInvestigations.companyId} IN ${companyIds}`,
            eq(schema.accidentInvestigations.requiresLicensedProfessional, 1),
            sql`${schema.accidentInvestigations.licensedProfessionalName} IS NOT NULL`,
            sql`${schema.accidentInvestigations.licensedProfessionalName} != ''`
          ));
        
        signedDocuments = Number(signedResult[0]?.count || 0);
      }
      
      // Calculate license status
      let licenseStatus = 'sin_licencia';
      let daysUntilExpiry: number | null = null;
      
      if (user.sstLicenseExpiresAt) {
        const expiryDate = new Date(user.sstLicenseExpiresAt);
        const today = new Date();
        daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 0) {
          licenseStatus = 'vencida';
        } else if (daysUntilExpiry <= 30) {
          licenseStatus = 'por_vencer';
        } else {
          licenseStatus = 'vigente';
        }
      }
      
      res.json({
        totalAssignedCompanies: companyIds.length,
        pendingDocuments,
        signedDocuments,
        licenseStatus,
        daysUntilExpiry,
        licenseExpiresAt: user.sstLicenseExpiresAt,
      });
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/dashboard] Error:', error.message);
      res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
  });

  // GET /api/portal-licenciado/empresas - Companies assigned to the LSO (enriched)
  app.get("/api/portal-licenciado/empresas", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      
      let empresas = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        nit: schema.companies.nit,
        city: schema.companies.city,
        riskLevel: schema.companies.riskLevel,
        numberOfWorkers: schema.companies.numberOfWorkers,
        numberOfVehicles: schema.companies.numberOfVehicles,
        assignmentId: schema.licensedProfessionalAssignments.id,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
      .where(and(
        eq(schema.licensedProfessionalAssignments.userId, user.id),
        eq(schema.licensedProfessionalAssignments.isActive, true)
      ));

      if (empresas.length === 0 && user.companyId) {
        const [wasUnassigned] = await db.select({ id: schema.licensedProfessionalAssignments.id })
          .from(schema.licensedProfessionalAssignments)
          .where(and(
            eq(schema.licensedProfessionalAssignments.userId, user.id),
            eq(schema.licensedProfessionalAssignments.companyId, user.companyId),
            eq(schema.licensedProfessionalAssignments.isActive, false)
          ))
          .limit(1);

        if (!wasUnassigned) {
          const [fallbackCompany] = await db.select({
            id: schema.companies.id,
            name: schema.companies.name,
            nit: schema.companies.nit,
            city: schema.companies.city,
            riskLevel: schema.companies.riskLevel,
            numberOfWorkers: schema.companies.numberOfWorkers,
            numberOfVehicles: schema.companies.numberOfVehicles,
          })
          .from(schema.companies)
          .where(eq(schema.companies.id, user.companyId));

          if (fallbackCompany) {
            empresas = [{
              ...fallbackCompany,
              assignmentId: 'direct-' + user.id,
              assignedAt: new Date(),
            }];
          }
        }
      }

      const enriched = await Promise.all(empresas.map(async (empresa) => {
        let porcentajeSst: number | null = null;
        let nivelCumplimiento: string | null = null;
        let subscriptionBlocked = false;
        let lastActivity: string | null = null;

        try {
          const [lastEval] = await db.select({
            porcentaje: schema.evaluacionesSst.porcentajeCumplimiento,
            nivel: schema.evaluacionesSst.nivelCumplimiento,
          })
          .from(schema.evaluacionesSst)
          .where(eq(schema.evaluacionesSst.companyId, empresa.id))
          .orderBy(desc(schema.evaluacionesSst.createdAt))
          .limit(1);
          if (lastEval) {
            porcentajeSst = lastEval.porcentaje;
            nivelCumplimiento = lastEval.nivel;
          }
        } catch {}

        try {
          const [sub] = await db.select({
            status: schema.pricingPluginSubscriptions.subscriptionStatus,
            blockedAt: schema.pricingPluginSubscriptions.blockedAt,
          })
          .from(schema.pricingPluginSubscriptions)
          .where(eq(schema.pricingPluginSubscriptions.companyId, empresa.id))
          .limit(1);
          if (sub && (sub.status === 'blocked' || sub.status === 'past_due') && sub.blockedAt) {
            subscriptionBlocked = true;
          }
        } catch {}

        try {
          const [lastAuditRow] = await db.select({
            lastSeen: sql<string>`MAX(${schema.auditLogs.timestamp})`,
          })
          .from(schema.auditLogs)
          .where(eq(schema.auditLogs.companyId, empresa.id));
          
          if (lastAuditRow?.lastSeen) {
            lastActivity = lastAuditRow.lastSeen;
          }
        } catch {}

        let adminUserId: string | null = null;
        let adminFullName: string | null = null;

        try {
          const adminRoles = ['admin', 'responsable_sst', 'superusuario'] as const;
          for (const role of adminRoles) {
            const [adminUser] = await db.select({
              id: schema.users.id,
              fullName: schema.users.fullName,
            })
            .from(schema.users)
            .where(and(
              eq(schema.users.companyId, empresa.id),
              eq(schema.users.role, role)
            ))
            .limit(1);
            if (adminUser) {
              adminUserId = adminUser.id;
              adminFullName = adminUser.fullName;
              break;
            }
          }
        } catch {}

        return {
          ...empresa,
          porcentajeSst,
          nivelCumplimiento,
          subscriptionBlocked,
          lastActivity,
          adminUserId,
          adminFullName,
        };
      }));
      
      res.json(enriched);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/empresas] Error:', error.message);
      res.status(500).json({ message: "Error fetching assigned companies", error: error.message });
    }
  });

  app.get("/api/portal-licenciado/empresas-historial", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;

      const historial = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        nit: schema.companies.nit,
        city: schema.companies.city,
        riskLevel: schema.companies.riskLevel,
        assignmentId: schema.licensedProfessionalAssignments.id,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
        unassignedAt: schema.licensedProfessionalAssignments.unassignedAt,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
      .where(and(
        eq(schema.licensedProfessionalAssignments.userId, user.id),
        eq(schema.licensedProfessionalAssignments.isActive, false)
      ))
      .orderBy(desc(schema.licensedProfessionalAssignments.unassignedAt));

      res.json(historial);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/empresas-historial] Error:', error.message);
      res.status(500).json({ message: "Error fetching company history", error: error.message });
    }
  });

  // GET /api/portal-licenciado/documentos-pendientes - Pending documents needing signature
  app.get("/api/portal-licenciado/documentos-pendientes", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      
      // Get all active assignments for this LSO
      const assignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      const companyIds = assignments.map(a => a.companyId);
      if (companyIds.length === 0 && user.companyId) {
        if (await shouldIncludeFallbackCompany(user.id, user.companyId)) {
          companyIds.push(user.companyId);
        }
      }
      
      if (companyIds.length === 0) {
        return res.json([]);
      }
      
      // Get pending investigations
      const pendingInvestigations = await db.select({
        id: schema.accidentInvestigations.id,
        companyId: schema.accidentInvestigations.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        accidentId: schema.accidentInvestigations.accidentId,
        eventType: schema.accidentInvestigations.eventType,
        eventDate: schema.accidentInvestigations.eventDate,
        eventDescription: schema.accidentInvestigations.eventDescription,
        dueDate: schema.accidentInvestigations.dueDate,
        slaStatus: schema.accidentInvestigations.slaStatus,
        daysRemaining: schema.accidentInvestigations.daysRemaining,
        isSevere: schema.accidentInvestigations.isSevere,
        isFatal: schema.accidentInvestigations.isFatal,
        status: schema.accidentInvestigations.status,
        createdAt: schema.accidentInvestigations.createdAt,
      })
      .from(schema.accidentInvestigations)
      .innerJoin(schema.companies, eq(schema.accidentInvestigations.companyId, schema.companies.id))
      .where(and(
        sql`${schema.accidentInvestigations.companyId} IN ${companyIds}`,
        eq(schema.accidentInvestigations.requiresLicensedProfessional, 1),
        sql`${schema.accidentInvestigations.status} IN ('pendiente', 'en_proceso')`,
        sql`(${schema.accidentInvestigations.licensedProfessionalName} IS NULL OR ${schema.accidentInvestigations.licensedProfessionalName} = '')`
      ))
      .orderBy(desc(schema.accidentInvestigations.eventDate));
      
      res.json(pendingInvestigations);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/documentos-pendientes] Error:', error.message);
      res.status(500).json({ message: "Error fetching pending documents", error: error.message });
    }
  });

  // GET /api/portal-licenciado/investigacion/:id - Get specific investigation details for LSO review
  app.get("/api/portal-licenciado/investigacion/:id", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      
      // Get the investigation with company details
      const [investigation] = await db.select({
        id: schema.accidentInvestigations.id,
        companyId: schema.accidentInvestigations.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        companyCity: schema.companies.city,
        companyRiskLevel: schema.companies.riskLevel,
        accidentId: schema.accidentInvestigations.accidentId,
        eventType: schema.accidentInvestigations.eventType,
        eventDate: schema.accidentInvestigations.eventDate,
        eventDescription: schema.accidentInvestigations.eventDescription,
        investigationStartDate: schema.accidentInvestigations.investigationStartDate,
        investigationEndDate: schema.accidentInvestigations.investigationEndDate,
        dueDate: schema.accidentInvestigations.dueDate,
        slaStatus: schema.accidentInvestigations.slaStatus,
        daysRemaining: schema.accidentInvestigations.daysRemaining,
        isSevere: schema.accidentInvestigations.isSevere,
        isFatal: schema.accidentInvestigations.isFatal,
        requiresLicensedProfessional: schema.accidentInvestigations.requiresLicensedProfessional,
        status: schema.accidentInvestigations.status,
        immediateActCauses: schema.accidentInvestigations.immediateActCauses,
        immediateConditionCauses: schema.accidentInvestigations.immediateConditionCauses,
        rootCause: schema.accidentInvestigations.rootCause,
        correctiveActions: schema.accidentInvestigations.correctiveActions,
        preventiveActions: schema.accidentInvestigations.preventiveActions,
        conclusions: schema.accidentInvestigations.conclusions,
        licensedProfessionalName: schema.accidentInvestigations.licensedProfessionalName,
        licensedProfessionalDocument: schema.accidentInvestigations.licensedProfessionalDocument,
        licensedProfessionalLicense: schema.accidentInvestigations.licensedProfessionalLicense,
        copasstParticipation: schema.accidentInvestigations.copasstParticipation,
        copasstMemberName: schema.accidentInvestigations.copasstMemberName,
        createdAt: schema.accidentInvestigations.createdAt,
        updatedAt: schema.accidentInvestigations.updatedAt,
      })
      .from(schema.accidentInvestigations)
      .innerJoin(schema.companies, eq(schema.accidentInvestigations.companyId, schema.companies.id))
      .where(eq(schema.accidentInvestigations.id, id));
      
      if (!investigation) {
        return res.status(404).json({ message: "Investigación no encontrada" });
      }
      
      // Verify the LSO has access to this company
      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, investigation.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      const hasDirectAccess = user.companyId === investigation.companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene acceso a esta investigación" });
      }
      
      // Get the related accident (full record)
      const [accident] = await db.select()
        .from(schema.accidents)
        .where(eq(schema.accidents.id, investigation.accidentId));
      
      // Get participants
      const participants = await db.select()
        .from(schema.investigationParticipants)
        .where(eq(schema.investigationParticipants.investigationId, id));
      
      // Get findings
      const findings = await db.select()
        .from(schema.investigationFindings)
        .where(eq(schema.investigationFindings.investigationId, id));
      
      let adminUserId: string | null = null;
      let adminFullName: string | null = null;
      try {
        const adminRoles = ['admin', 'responsable_sst', 'superusuario'] as const;
        for (const role of adminRoles) {
          const [adminUser] = await db.select({
            id: schema.users.id,
            fullName: schema.users.fullName,
          })
          .from(schema.users)
          .where(and(
            eq(schema.users.companyId, investigation.companyId),
            eq(schema.users.role, role)
          ))
          .limit(1);
          if (adminUser) {
            adminUserId = adminUser.id;
            adminFullName = adminUser.fullName;
            break;
          }
        }
      } catch {}

      res.json({
        ...investigation,
        accident,
        participants,
        findings,
        adminUserId,
        adminFullName,
      });
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/investigacion/:id] Error:', error.message);
      res.status(500).json({ message: "Error fetching investigation details", error: error.message });
    }
  });

  // PATCH /api/portal-licenciado/investigacion/:id/firmar - LSO signs the investigation
  app.patch("/api/portal-licenciado/investigacion/:id/firmar", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      
      // Get the investigation
      const [investigation] = await db.select()
        .from(schema.accidentInvestigations)
        .where(eq(schema.accidentInvestigations.id, id));
      
      if (!investigation) {
        return res.status(404).json({ message: "Investigación no encontrada" });
      }
      
      // Verify the LSO has access to this company
      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, investigation.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      const hasDirectAccess = user.companyId === investigation.companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene acceso a firmar esta investigación" });
      }
      
      const signatureUrl = user.sstSignatureUrl || assignment?.externalLsoSignatureUrl || null;

      if (!signatureUrl) {
        return res.status(400).json({ message: "Debe cargar su firma digital antes de poder firmar documentos. Vaya a 'Mi Licencia' para configurarla." });
      }

      const sigAccessible = await isSignatureAccessible(signatureUrl);
      if (!sigAccessible) {
        console.log(`[FIRMA] LSO ${user.id} signature not accessible during signing (URL preserved): ${signatureUrl}`);
        return res.status(400).json({ message: "Su imagen de firma no se encontró en el servidor. Por favor suba una nueva firma desde 'Mi Licencia'." });
      }

      const [updated] = await db.update(schema.accidentInvestigations)
        .set({
          licensedProfessionalName: user.fullName || user.username,
          licensedProfessionalDocument: user.sstLicenseNumber || '',
          licensedProfessionalLicense: user.sstLicenseNumber || '',
          licensedProfessionalLicenseExpiry: user.sstLicenseExpiresAt,
          licensedProfessionalSignatureUrl: signatureUrl,
          status: 'completada',
          investigationEndDate: new Date().toISOString().split('T')[0],
          updatedAt: new Date(),
        })
        .where(eq(schema.accidentInvestigations.id, id))
        .returning();
      
      console.log(`[LSO-FIRMA] Investigation ${id} signed by ${user.username}`);
      
      res.json({ message: "Investigación firmada exitosamente", investigation: updated });
    } catch (error: any) {
      console.error('[PATCH /api/portal-licenciado/investigacion/:id/firmar] Error:', error.message);
      res.status(500).json({ message: "Error signing investigation", error: error.message });
    }
  });

  // GET /api/portal-licenciado/designaciones-pendientes - Pending designation acts needing LSO signature
  app.get("/api/portal-licenciado/designaciones-pendientes", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const assignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      const companyIds = assignments.map(a => a.companyId);
      if (companyIds.length === 0 && user.companyId) {
        if (await shouldIncludeFallbackCompany(user.id, user.companyId)) {
          companyIds.push(user.companyId);
        }
      }
      if (companyIds.length === 0) return res.json([]);

      const designations = await db.select({
        id: schema.responsibleDesignations.id,
        companyId: schema.responsibleDesignations.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        designationDate: schema.responsibleDesignations.designationDate,
        position: schema.responsibleDesignations.position,
        externalLsoName: schema.responsibleDesignations.externalLsoName,
        licenciaSstNumero: schema.responsibleDesignations.licenciaSstNumero,
        status: schema.responsibleDesignations.status,
        lsoSignedAt: schema.responsibleDesignations.lsoSignedAt,
        lsoSignatureName: schema.responsibleDesignations.lsoSignatureName,
        createdAt: schema.responsibleDesignations.createdAt,
      })
      .from(schema.responsibleDesignations)
      .innerJoin(schema.companies, eq(schema.responsibleDesignations.companyId, schema.companies.id))
      .where(and(
        sql`${schema.responsibleDesignations.companyId} IN ${companyIds}`,
        eq(schema.responsibleDesignations.status, 'activo'),
      ))
      .orderBy(desc(schema.responsibleDesignations.createdAt));

      const result = designations.map(d => ({
        ...d,
        isSigned: !!d.lsoSignedAt,
        type: 'designacion',
      }));

      res.json(result);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/designaciones-pendientes] Error:', error.message);
      res.status(500).json({ message: "Error fetching pending designations", error: error.message });
    }
  });

  // PATCH /api/portal-licenciado/designacion/:id/firmar - LSO signs the designation act
  app.patch("/api/portal-licenciado/designacion/:id/firmar", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [designation] = await db.select()
        .from(schema.responsibleDesignations)
        .where(eq(schema.responsibleDesignations.id, id));

      if (!designation) {
        return res.status(404).json({ message: "Designación no encontrada" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, designation.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      const hasDirectAccess = user.companyId === designation.companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene acceso a firmar esta designación" });
      }

      const signatureUrl = user.sstSignatureUrl || assignment?.externalLsoSignatureUrl || null;
      if (!signatureUrl) {
        return res.status(400).json({ message: "Debe cargar su firma digital antes de poder firmar documentos. Vaya a 'Mi Licencia' para configurarla." });
      }

      const sigAccessible = await isSignatureAccessible(signatureUrl);
      if (!sigAccessible) {
        return res.status(400).json({ message: "Su imagen de firma no se encontró en el servidor. Por favor suba una nueva firma desde 'Mi Licencia'." });
      }

      if (designation.lsoSignedAt) {
        return res.status(400).json({ message: "Esta designación ya fue firmada" });
      }

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName || user.username;

      const [updated] = await db.update(schema.responsibleDesignations)
        .set({
          lsoSignatureName: fullName,
          lsoSignatureLicense: user.sstLicenseNumber || '',
          lsoSignatureUrl: signatureUrl,
          lsoSignedAt: new Date(),
        })
        .where(eq(schema.responsibleDesignations.id, id))
        .returning();

      console.log(`[LSO-FIRMA] Designation ${id} signed by ${user.username}`);
      res.json({ message: "Acta de designación firmada exitosamente", designation: updated });
    } catch (error: any) {
      console.error('[PATCH /api/portal-licenciado/designacion/:id/firmar] Error:', error.message);
      res.status(500).json({ message: "Error signing designation", error: error.message });
    }
  });

  // GET /api/companies/:companyId/licensed-professionals - Get licensed professionals assigned to a company
  app.get("/api/companies/:companyId/licensed-professionals", requireAuth, async (req, res) => {
    try {
      const { companyId } = req.params;
      const user = req.user!;
      
      if (user.role !== 'superadmin' && user.companyId !== companyId) {
        return res.status(403).json({ message: "You can only view licensed professionals for your own company" });
      }
      
      const professionals = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        fullName: schema.users.fullName,
        email: schema.users.email,
        sstProfessionType: schema.users.sstProfessionType,
        sstLicenseNumber: schema.users.sstLicenseNumber,
        sstLicenseIssuer: schema.users.sstLicenseIssuer,
        sstLicenseIssuedAt: schema.users.sstLicenseIssuedAt,
        sstLicenseExpiresAt: schema.users.sstLicenseExpiresAt,
        sstLicenseStatus: schema.users.sstLicenseStatus,
        sstSignatureUrl: schema.users.sstSignatureUrl,
        sstPhone: schema.users.sstPhone,
        assignmentId: schema.licensedProfessionalAssignments.id,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.users, eq(schema.licensedProfessionalAssignments.userId, schema.users.id))
      .where(and(
        eq(schema.licensedProfessionalAssignments.companyId, companyId),
        eq(schema.licensedProfessionalAssignments.isActive, true),
        eq(schema.users.role, 'lso'),
        eq(schema.users.sstLicenseStatus, 'vigente')
      ));
      
      res.json(professionals);
    } catch (error: any) {
      console.error('[GET /api/companies/:companyId/licensed-professionals] Error:', error.message);
      res.status(500).json({ message: "Error fetching company licensed professionals", error: error.message });
    }
  });

  // GET /api/directory/licensed-professionals - Public directory of available licensed professionals
  // For clients (admins) to view and invite LSOs to their company
  app.get("/api/directory/licensed-professionals", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      console.log('[GET /api/directory/licensed-professionals] User:', user.username, 'Role:', user.role, 'CompanyId:', user.companyId);
      
      // Only admins or superadmins can access this directory
      if (!['admin', 'superadmin'].includes(user.role)) {
        return res.status(403).json({ message: "Solo administradores pueden acceder al directorio de profesionales" });
      }
      
      // Admins must have a company associated
      if (user.role === 'admin' && !user.companyId) {
        return res.status(403).json({ message: "Debes estar asociado a una empresa para ver el directorio" });
      }

      // Get all LSOs with valid license status (vigente)
      console.log('[GET /api/directory/licensed-professionals] Fetching LSOs with vigente license...');
      const professionals = await db.select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        sstProfessionType: schema.users.sstProfessionType,
        sstLicenseNumber: schema.users.sstLicenseNumber,
        sstLicenseIssuer: schema.users.sstLicenseIssuer,
        sstLicenseStatus: schema.users.sstLicenseStatus,
        sstPhone: schema.users.sstPhone,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(and(
        eq(schema.users.role, 'lso'),
        eq(schema.users.sstLicenseStatus, 'vigente')
      ));

      console.log('[GET /api/directory/licensed-professionals] Found', professionals.length, 'LSOs with vigente license');

      // If user has a company, check which LSOs are already assigned
      let assignedLsoIds: string[] = [];
      if (user.companyId) {
        const assignments = await db.select({
          userId: schema.licensedProfessionalAssignments.userId,
        })
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.companyId, user.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
        assignedLsoIds = assignments.map(a => a.userId);
      }

      // Add flag indicating if already assigned to user's company
      const professionalsWithStatus = professionals.map(prof => ({
        ...prof,
        alreadyAssigned: assignedLsoIds.includes(prof.id),
      }));

      res.json(professionalsWithStatus);
    } catch (error: any) {
      console.error('[GET /api/directory/licensed-professionals] Error:', error.message, error.stack);
      res.status(500).json({ message: "Error al cargar directorio de profesionales. Por favor intente más tarde." });
    }
  });

  // POST /api/directory/licensed-professionals/:lsoId/request - Request invitation to an LSO
  app.post("/api/directory/licensed-professionals/:lsoId/request", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { lsoId } = req.params;
      const { message } = req.body;

      // Only admins with a company can request
      if (!['admin', 'superadmin'].includes(user.role)) {
        return res.status(403).json({ message: "Solo administradores pueden solicitar profesionales" });
      }
      
      if (!user.companyId) {
        return res.status(403).json({ message: "Debes estar asociado a una empresa para solicitar un profesional" });
      }

      // Verify LSO exists, has lso role, and has valid license
      const [lso] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, lsoId),
          eq(schema.users.role, 'lso'),
          eq(schema.users.sstLicenseStatus, 'vigente')
        ));

      if (!lso) {
        return res.status(404).json({ message: "Profesional no encontrado o sin licencia vigente" });
      }

      // Check if already assigned
      const [existingAssignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, lsoId),
          eq(schema.licensedProfessionalAssignments.companyId, user.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      if (existingAssignment) {
        return res.status(400).json({ message: "Este profesional ya está asignado a tu empresa" });
      }

      // Get company info
      const [company] = await db.select()
        .from(schema.companies)
        .where(eq(schema.companies.id, user.companyId));

      // Create internal message to the LSO
      await db.insert(schema.internalMessages).values({
        companyId: user.companyId,
        senderId: user.id,
        senderName: user.fullName || user.username,
        senderRole: user.role,
        receiverId: lsoId,
        receiverName: lso.fullName || lso.username,
        receiverRole: 'lso',
        subject: `Solicitud de servicios SST - ${company?.name || 'Empresa'}`,
        content: message || `La empresa ${company?.name || ''} (NIT: ${company?.nit || ''}) está interesada en sus servicios como Profesional Licenciado en SST. Por favor contacte al administrador para más información.`,
        status: 'unread',
        priority: 'normal',
      });

      res.json({ 
        success: true, 
        message: "Solicitud enviada exitosamente. El profesional recibirá tu mensaje y podrá contactarte."
      });
    } catch (error: any) {
      console.error('[POST /api/directory/licensed-professionals/:lsoId/request] Error:', error.message);
      res.status(500).json({ message: "Error al enviar solicitud", error: error.message });
    }
  });

  // GET /api/company/assigned-sst-professionals - Get SST professionals assigned to current user's company
  // This endpoint only requires authentication, no special permissions
  // Used by accident investigation form and other modules that need to select an assigned professional
  app.get("/api/company/assigned-sst-professionals", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      // Use getEffectiveCompanyId for superadmin company context
      const companyId = getEffectiveCompanyId(req);
      
      if (!companyId) {
        return res.json([]);
      }
      
      // Get active assignments for this company
      const assignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.companyId, companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      if (assignments.length === 0) {
        return res.json([]);
      }
      
      const assignedUserIds = assignments.map(a => a.userId);
      
      // Get the professionals (LSOs) assigned to this company
      const professionals = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.role, 'lso'),
          sql`${schema.users.id} IN (${sql.join(assignedUserIds.map(id => sql`${id}`), sql`, `)})`
        ));
      
      // Map to include assignment info and exclude password
      const professionalsWithInfo = professionals.map(prof => {
        const assignment = assignments.find(a => a.userId === prof.id);
        const { password, ...profWithoutPassword } = prof;
        return {
          ...profWithoutPassword,
          assignedAt: assignment?.assignedAt,
          isActive: assignment?.isActive
        };
      });
      
      res.json(professionalsWithInfo);
    } catch (error: any) {
      console.error('[GET /api/company/assigned-sst-professionals] Error:', error.message);
      res.status(500).json({ message: "Error fetching assigned SST professionals", error: error.message });
    }
  });

  // PATCH /api/portal-licenciado/license - Update LSO license data
  app.patch("/api/portal-licenciado/license", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'lso') {
        return res.status(403).json({ message: "Solo los profesionales licenciados pueden actualizar su licencia" });
      }
      
      const { 
        fullName,
        sstProfessionType,
        sstLicenseNumber,
        sstLicenseIssuer,
        sstLicenseIssuedAt,
        sstLicenseExpiresAt,
        sstPhone,
        sstIdentificationNumber,
        sstCourse50Hours,
        sstCourse50HoursDate
      } = req.body;
      
      const updateData: any = {};
      
      if (fullName !== undefined) updateData.fullName = fullName;
      if (sstProfessionType !== undefined) updateData.sstProfessionType = sstProfessionType;
      if (sstLicenseNumber !== undefined) updateData.sstLicenseNumber = sstLicenseNumber;
      if (sstLicenseIssuer !== undefined) updateData.sstLicenseIssuer = sstLicenseIssuer;
      if (sstLicenseIssuedAt !== undefined) updateData.sstLicenseIssuedAt = sstLicenseIssuedAt ? new Date(sstLicenseIssuedAt) : null;
      if (sstLicenseExpiresAt !== undefined) updateData.sstLicenseExpiresAt = sstLicenseExpiresAt ? new Date(sstLicenseExpiresAt) : null;
      if (sstPhone !== undefined) updateData.sstPhone = sstPhone;
      if (sstIdentificationNumber !== undefined) updateData.sstIdentificationNumber = sstIdentificationNumber;
      if (sstCourse50Hours !== undefined) updateData.sstCourse50Hours = sstCourse50Hours;
      if (sstCourse50HoursDate !== undefined) updateData.sstCourse50HoursDate = sstCourse50HoursDate ? new Date(sstCourse50HoursDate) : null;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No hay datos para actualizar" });
      }

      const effectiveLicenseNumber = updateData.sstLicenseNumber ?? user.sstLicenseNumber;
      const effectiveExpiresAt = updateData.sstLicenseExpiresAt ?? (user.sstLicenseExpiresAt ? new Date(user.sstLicenseExpiresAt) : null);

      if (effectiveLicenseNumber && effectiveExpiresAt) {
        const expiryDate = new Date(effectiveExpiresAt);
        const now = new Date();
        if (expiryDate < now) {
          updateData.sstLicenseStatus = 'vencida';
        } else {
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          updateData.sstLicenseStatus = daysUntilExpiry <= 90 ? 'pendiente_verificacion' : 'vigente';
        }
      }
      
      await db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, user.id));
      
      console.log(`[PATCH /api/portal-licenciado/license] LSO ${user.id} updated license data, status: ${updateData.sstLicenseStatus || 'unchanged'}`);
      
      res.json({ message: "Datos de licencia actualizados exitosamente" });
    } catch (error: any) {
      console.error('[PATCH /api/portal-licenciado/license] Error:', error.message);
      res.status(500).json({ message: "Error al actualizar datos de licencia", error: error.message });
    }
  });

  // GET /api/portal-licenciado/pesv/evaluaciones - PESV evaluations for all assigned companies
  app.get("/api/portal-licenciado/pesv/evaluaciones", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      
      const assignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      const companyIds = assignments.map(a => a.companyId);
      if (companyIds.length === 0 && user.companyId) {
        if (await shouldIncludeFallbackCompany(user.id, user.companyId)) {
          companyIds.push(user.companyId);
        }
      }
      if (companyIds.length === 0) {
        return res.json([]);
      }
      
      const evaluaciones = await db.select({
        id: schema.evaluacionesPesv.id,
        companyId: schema.evaluacionesPesv.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        anio: schema.evaluacionesPesv.anio,
        nivel: schema.evaluacionesPesv.nivel,
        estado: schema.evaluacionesPesv.estado,
        puntajePlanear: schema.evaluacionesPesv.puntajePlanear,
        puntajeHacer: schema.evaluacionesPesv.puntajeHacer,
        puntajeVerificar: schema.evaluacionesPesv.puntajeVerificar,
        puntajeActuar: schema.evaluacionesPesv.puntajeActuar,
        puntajeTotal: schema.evaluacionesPesv.puntajeTotal,
        puntajeMaximo: schema.evaluacionesPesv.puntajeMaximo,
        porcentajeCumplimiento: schema.evaluacionesPesv.porcentajeCumplimiento,
        numeroVehiculos: schema.evaluacionesPesv.numeroVehiculos,
        numeroConductores: schema.evaluacionesPesv.numeroConductores,
        responsableNombre: schema.evaluacionesPesv.responsableNombre,
        responsableCargo: schema.evaluacionesPesv.responsableCargo,
        observaciones: schema.evaluacionesPesv.observaciones,
        createdAt: schema.evaluacionesPesv.createdAt,
        updatedAt: schema.evaluacionesPesv.updatedAt,
      })
      .from(schema.evaluacionesPesv)
      .innerJoin(schema.companies, eq(schema.evaluacionesPesv.companyId, schema.companies.id))
      .where(inArray(schema.evaluacionesPesv.companyId, companyIds))
      .orderBy(desc(schema.evaluacionesPesv.anio), desc(schema.evaluacionesPesv.createdAt));
      
      res.json(evaluaciones);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/pesv/evaluaciones] Error:', error.message);
      res.status(500).json({ message: "Error al obtener evaluaciones PESV", error: error.message });
    }
  });

  // GET /api/portal-licenciado/pesv/evaluaciones/:id/respuestas - PESV step responses for a specific evaluation
  app.get("/api/portal-licenciado/pesv/evaluaciones/:id/respuestas", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const evaluacionId = req.params.id;
      
      const [evaluacion] = await db.select()
        .from(schema.evaluacionesPesv)
        .where(eq(schema.evaluacionesPesv.id, evaluacionId));
      
      if (!evaluacion) {
        return res.status(404).json({ message: "Evaluación PESV no encontrada" });
      }
      
      const hasAccess = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, evaluacion.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));
      
      if (hasAccess.length === 0) {
        return res.status(403).json({ message: "No tiene acceso a esta evaluación" });
      }
      
      const respuestas = await db.select()
        .from(schema.respuestasPasosPesv)
        .where(eq(schema.respuestasPasosPesv.evaluacionId, evaluacionId));
      
      res.json(respuestas);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/pesv/evaluaciones/:id/respuestas] Error:', error.message);
      res.status(500).json({ message: "Error al obtener respuestas PESV", error: error.message });
    }
  });

  // POST /api/portal-licenciado/firma - Upload LSO signature to Object Storage
  app.post("/api/portal-licenciado/firma", requireAuth, uploadLsoSignature.single('signature'), async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'lso') {
        return res.status(403).json({ message: "Solo los profesionales licenciados pueden cargar su firma" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún archivo" });
      }
      
      const signatureUrl = await uploadSignatureToObjectStorage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      await db.update(schema.users)
        .set({ 
          sstSignatureUrl: signatureUrl
        })
        .where(eq(schema.users.id, user.id));
      
      console.log(`[POST /api/portal-licenciado/firma] LSO ${user.id} uploaded signature to Object Storage: ${signatureUrl}`);
      
      res.json({ 
        message: "Firma cargada exitosamente",
        signatureUrl 
      });
    } catch (error: any) {
      console.error('[POST /api/portal-licenciado/firma] Error:', error.message);
      res.status(500).json({ message: "Error al cargar la firma", error: error.message });
    }
  });

  // GET /api/portal-licenciado/firma/imagen - Serve signature image from Object Storage
  app.get("/api/portal-licenciado/firma/imagen", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const signatureUrl = user.sstSignatureUrl;

      if (!signatureUrl) {
        return res.status(404).json({ message: "No tiene firma digital" });
      }

      const buffer = await getSignatureBuffer(signatureUrl);
      if (!buffer) {
        return res.status(404).json({ message: "La imagen de firma no se encontró. Por favor suba una nueva." });
      }

      const ext = path.extname(signatureUrl).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'private, max-age=3600');
      res.send(buffer);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/firma/imagen] Error:', error.message);
      res.status(500).json({ message: "Error al obtener la imagen de firma" });
    }
  });

  // GET /api/portal-licenciado/firma/estado - Check if signature is valid and accessible
  app.get("/api/portal-licenciado/firma/estado", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const signatureUrl = user.sstSignatureUrl;

      if (!signatureUrl) {
        return res.json({ hasSignature: false, isAccessible: false });
      }

      const accessible = await isSignatureAccessible(signatureUrl);

      if (!accessible) {
        console.log(`[FIRMA-ESTADO] LSO ${user.id} signature not accessible (URL preserved): ${signatureUrl}`);
        return res.json({ hasSignature: true, isAccessible: false, signatureUrl });
      }

      return res.json({ hasSignature: true, isAccessible: true, signatureUrl });
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/firma/estado] Error:', error.message);
      res.status(500).json({ message: "Error al verificar estado de firma" });
    }
  });

  // GET /api/portal-licenciado/documentos-todos - All documents needing LSO signature (all types)
  app.get("/api/portal-licenciado/documentos-todos", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;

      const assignments = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      const companyIds = assignments.map(a => a.companyId);
      if (companyIds.length === 0 && user.companyId) {
        const [wasUnassigned] = await db.select({ id: schema.licensedProfessionalAssignments.id })
          .from(schema.licensedProfessionalAssignments)
          .where(and(
            eq(schema.licensedProfessionalAssignments.userId, user.id),
            eq(schema.licensedProfessionalAssignments.companyId, user.companyId),
            eq(schema.licensedProfessionalAssignments.isActive, false)
          ))
          .limit(1);
        if (!wasUnassigned) {
          companyIds.push(user.companyId);
        }
      }
      if (companyIds.length === 0) {
        return res.json({ investigaciones: [], evaluaciones: [], planesTrabajoAnual: [], matricesIperc: [], designaciones: [] });
      }

      const pendingInvestigations = await db.select({
        id: schema.accidentInvestigations.id,
        companyId: schema.accidentInvestigations.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        eventType: schema.accidentInvestigations.eventType,
        eventDate: schema.accidentInvestigations.eventDate,
        eventDescription: schema.accidentInvestigations.eventDescription,
        status: schema.accidentInvestigations.status,
        isSevere: schema.accidentInvestigations.isSevere,
        isFatal: schema.accidentInvestigations.isFatal,
        createdAt: schema.accidentInvestigations.createdAt,
        licensedProfessionalName: schema.accidentInvestigations.licensedProfessionalName,
        licensedProfessionalSignatureUrl: schema.accidentInvestigations.licensedProfessionalSignatureUrl,
      })
      .from(schema.accidentInvestigations)
      .innerJoin(schema.companies, eq(schema.accidentInvestigations.companyId, schema.companies.id))
      .where(and(
        sql`${schema.accidentInvestigations.companyId} IN ${companyIds}`,
        eq(schema.accidentInvestigations.requiresLicensedProfessional, 1),
      ))
      .orderBy(desc(schema.accidentInvestigations.createdAt));

      const pendingEvaluaciones = await db.select({
        id: schema.evaluacionesSst.id,
        companyId: schema.evaluacionesSst.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        anio: schema.evaluacionesSst.anio,
        mes: schema.evaluacionesSst.mes,
        estado: schema.evaluacionesSst.estado,
        porcentajeCumplimiento: schema.evaluacionesSst.porcentajeCumplimiento,
        nivelCumplimiento: schema.evaluacionesSst.nivelCumplimiento,
        fechaEvaluacion: schema.evaluacionesSst.fechaEvaluacion,
        responsableNombre: schema.evaluacionesSst.responsableNombre,
        lsoSignatureName: schema.evaluacionesSst.lsoSignatureName,
        lsoSignatureUrl: schema.evaluacionesSst.lsoSignatureUrl,
        lsoSignedAt: schema.evaluacionesSst.lsoSignedAt,
        createdAt: schema.evaluacionesSst.createdAt,
      })
      .from(schema.evaluacionesSst)
      .innerJoin(schema.companies, eq(schema.evaluacionesSst.companyId, schema.companies.id))
      .where(sql`${schema.evaluacionesSst.companyId} IN ${companyIds}`)
      .orderBy(desc(schema.evaluacionesSst.createdAt));

      const pendingPlanes = await db.select({
        id: schema.planesTrabajoAnual.id,
        companyId: schema.planesTrabajoAnual.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        anio: schema.planesTrabajoAnual.anio,
        estado: schema.planesTrabajoAnual.estado,
        fechaElaboracion: schema.planesTrabajoAnual.fechaElaboracion,
        responsableElaboracion: schema.planesTrabajoAnual.responsableElaboracion,
        porcentajeCumplimiento: schema.planesTrabajoAnual.porcentajeCumplimiento,
        lsoSignatureName: schema.planesTrabajoAnual.lsoSignatureName,
        lsoSignatureUrl: schema.planesTrabajoAnual.lsoSignatureUrl,
        lsoSignedAt: schema.planesTrabajoAnual.lsoSignedAt,
        createdAt: schema.planesTrabajoAnual.createdAt,
      })
      .from(schema.planesTrabajoAnual)
      .innerJoin(schema.companies, eq(schema.planesTrabajoAnual.companyId, schema.companies.id))
      .where(sql`${schema.planesTrabajoAnual.companyId} IN ${companyIds}`)
      .orderBy(desc(schema.planesTrabajoAnual.createdAt));

      const pendingMatrices = await db.select({
        id: schema.matricesIperc.id,
        companyId: schema.matricesIperc.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        nombre: schema.matricesIperc.nombre,
        area: schema.matricesIperc.area,
        estado: schema.matricesIperc.estado,
        fechaEvaluacion: schema.matricesIperc.fechaEvaluacion,
        metodologia: schema.matricesIperc.metodologia,
        version: schema.matricesIperc.version,
        lsoSignatureName: schema.matricesIperc.lsoSignatureName,
        lsoSignatureUrl: schema.matricesIperc.lsoSignatureUrl,
        lsoSignedAt: schema.matricesIperc.lsoSignedAt,
        createdAt: schema.matricesIperc.createdAt,
      })
      .from(schema.matricesIperc)
      .innerJoin(schema.companies, eq(schema.matricesIperc.companyId, schema.companies.id))
      .where(sql`${schema.matricesIperc.companyId} IN ${companyIds}`)
      .orderBy(desc(schema.matricesIperc.createdAt));

      const pendingDesignaciones = await db.select({
        id: schema.responsibleDesignations.id,
        companyId: schema.responsibleDesignations.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        designationDate: schema.responsibleDesignations.designationDate,
        position: schema.responsibleDesignations.position,
        externalLsoName: schema.responsibleDesignations.externalLsoName,
        licenciaSstNumero: schema.responsibleDesignations.licenciaSstNumero,
        status: schema.responsibleDesignations.status,
        lsoSignedAt: schema.responsibleDesignations.lsoSignedAt,
        lsoSignatureName: schema.responsibleDesignations.lsoSignatureName,
        createdAt: schema.responsibleDesignations.createdAt,
      })
      .from(schema.responsibleDesignations)
      .innerJoin(schema.companies, eq(schema.responsibleDesignations.companyId, schema.companies.id))
      .where(and(
        sql`${schema.responsibleDesignations.companyId} IN ${companyIds}`,
        eq(schema.responsibleDesignations.status, 'activo'),
      ))
      .orderBy(desc(schema.responsibleDesignations.createdAt));

      res.json({
        investigaciones: pendingInvestigations,
        evaluaciones: pendingEvaluaciones,
        planesTrabajoAnual: pendingPlanes,
        matricesIperc: pendingMatrices,
        designaciones: pendingDesignaciones,
      });
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/documentos-todos] Error:', error.message);
      res.status(500).json({ message: "Error fetching all documents", error: error.message });
    }
  });

  // PATCH /api/portal-licenciado/evaluacion-sst/:id/firmar - Sign evaluation
  app.patch("/api/portal-licenciado/evaluacion-sst/:id/firmar", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [evaluacion] = await db.select()
        .from(schema.evaluacionesSst)
        .where(eq(schema.evaluacionesSst.id, id));

      if (!evaluacion) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, evaluacion.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      const hasDirectAccess = user.companyId === evaluacion.companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene acceso a firmar esta evaluación" });
      }

      const signatureUrl = user.sstSignatureUrl || assignment?.externalLsoSignatureUrl || null;

      if (!signatureUrl) {
        return res.status(400).json({ message: "Debe cargar su firma digital antes de poder firmar documentos. Vaya a 'Mi Licencia' para configurarla." });
      }

      const sigAccessible = await isSignatureAccessible(signatureUrl);
      if (!sigAccessible) {
        console.log(`[FIRMA] LSO ${user.id} signature not accessible during signing (URL preserved): ${signatureUrl}`);
        return res.status(400).json({ message: "Su imagen de firma no se encontró en el servidor. Por favor suba una nueva firma desde 'Mi Licencia'." });
      }

      const [updated] = await db.update(schema.evaluacionesSst)
        .set({
          lsoSignatureName: user.fullName || user.username,
          lsoSignatureLicense: user.sstLicenseNumber || '',
          lsoSignatureUrl: signatureUrl,
          lsoSignedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.evaluacionesSst.id, id))
        .returning();

      console.log(`[LSO-FIRMA] Evaluación SST ${id} signed by ${user.username}`);
      res.json({ message: "Evaluación firmada exitosamente", evaluacion: updated });
    } catch (error: any) {
      console.error('[PATCH /api/portal-licenciado/evaluacion-sst/:id/firmar] Error:', error.message);
      res.status(500).json({ message: "Error signing evaluation", error: error.message });
    }
  });

  // PATCH /api/portal-licenciado/plan-trabajo/:id/firmar - Sign work plan
  app.patch("/api/portal-licenciado/plan-trabajo/:id/firmar", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [plan] = await db.select()
        .from(schema.planesTrabajoAnual)
        .where(eq(schema.planesTrabajoAnual.id, id));

      if (!plan) {
        return res.status(404).json({ message: "Plan de trabajo no encontrado" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, plan.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      const hasDirectAccess = user.companyId === plan.companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene acceso a firmar este plan" });
      }

      const signatureUrl = user.sstSignatureUrl || assignment?.externalLsoSignatureUrl || null;

      if (!signatureUrl) {
        return res.status(400).json({ message: "Debe cargar su firma digital antes de poder firmar documentos. Vaya a 'Mi Licencia' para configurarla." });
      }

      const sigAccessible = await isSignatureAccessible(signatureUrl);
      if (!sigAccessible) {
        console.log(`[FIRMA] LSO ${user.id} signature not accessible during signing (URL preserved): ${signatureUrl}`);
        return res.status(400).json({ message: "Su imagen de firma no se encontró en el servidor. Por favor suba una nueva firma desde 'Mi Licencia'." });
      }

      const [updated] = await db.update(schema.planesTrabajoAnual)
        .set({
          lsoSignatureName: user.fullName || user.username,
          lsoSignatureLicense: user.sstLicenseNumber || '',
          lsoSignatureUrl: signatureUrl,
          lsoSignedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.planesTrabajoAnual.id, id))
        .returning();

      console.log(`[LSO-FIRMA] Plan trabajo ${id} signed by ${user.username}`);
      res.json({ message: "Plan de trabajo firmado exitosamente", plan: updated });
    } catch (error: any) {
      console.error('[PATCH /api/portal-licenciado/plan-trabajo/:id/firmar] Error:', error.message);
      res.status(500).json({ message: "Error signing work plan", error: error.message });
    }
  });

  // PATCH /api/portal-licenciado/matriz-iperc/:id/firmar - Sign risk matrix
  app.patch("/api/portal-licenciado/matriz-iperc/:id/firmar", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [matriz] = await db.select()
        .from(schema.matricesIperc)
        .where(eq(schema.matricesIperc.id, id));

      if (!matriz) {
        return res.status(404).json({ message: "Matriz IPERC no encontrada" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, matriz.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      const hasDirectAccess = user.companyId === matriz.companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene acceso a firmar esta matriz" });
      }

      const signatureUrl = user.sstSignatureUrl || assignment?.externalLsoSignatureUrl || null;

      if (!signatureUrl) {
        return res.status(400).json({ message: "Debe cargar su firma digital antes de poder firmar documentos. Vaya a 'Mi Licencia' para configurarla." });
      }

      const sigAccessible = await isSignatureAccessible(signatureUrl);
      if (!sigAccessible) {
        console.log(`[FIRMA] LSO ${user.id} signature not accessible during signing (URL preserved): ${signatureUrl}`);
        return res.status(400).json({ message: "Su imagen de firma no se encontró en el servidor. Por favor suba una nueva firma desde 'Mi Licencia'." });
      }

      const [updated] = await db.update(schema.matricesIperc)
        .set({
          lsoSignatureName: user.fullName || user.username,
          lsoSignatureLicense: user.sstLicenseNumber || '',
          lsoSignatureUrl: signatureUrl,
          lsoSignedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.matricesIperc.id, id))
        .returning();

      console.log(`[LSO-FIRMA] Matriz IPERC ${id} signed by ${user.username}`);
      res.json({ message: "Matriz IPERC firmada exitosamente", matriz: updated });
    } catch (error: any) {
      console.error('[PATCH /api/portal-licenciado/matriz-iperc/:id/firmar] Error:', error.message);
      res.status(500).json({ message: "Error signing risk matrix", error: error.message });
    }
  });

  // GET /api/portal-licenciado/evaluacion-sst/:id - Get evaluation details for LSO review
  app.get("/api/portal-licenciado/evaluacion-sst/:id", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [evaluacion] = await db.select({
        id: schema.evaluacionesSst.id,
        companyId: schema.evaluacionesSst.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        anio: schema.evaluacionesSst.anio,
        mes: schema.evaluacionesSst.mes,
        tipoEmpresa: schema.evaluacionesSst.tipoEmpresa,
        estado: schema.evaluacionesSst.estado,
        responsableNombre: schema.evaluacionesSst.responsableNombre,
        responsableCargo: schema.evaluacionesSst.responsableCargo,
        responsableLicencia: schema.evaluacionesSst.responsableLicencia,
        puntajeTotal: schema.evaluacionesSst.puntajeTotal,
        puntajeMaximo: schema.evaluacionesSst.puntajeMaximo,
        porcentajeCumplimiento: schema.evaluacionesSst.porcentajeCumplimiento,
        nivelCumplimiento: schema.evaluacionesSst.nivelCumplimiento,
        fechaEvaluacion: schema.evaluacionesSst.fechaEvaluacion,
        observaciones: schema.evaluacionesSst.observaciones,
        lsoSignatureName: schema.evaluacionesSst.lsoSignatureName,
        lsoSignatureLicense: schema.evaluacionesSst.lsoSignatureLicense,
        lsoSignatureUrl: schema.evaluacionesSst.lsoSignatureUrl,
        lsoSignedAt: schema.evaluacionesSst.lsoSignedAt,
        createdAt: schema.evaluacionesSst.createdAt,
      })
      .from(schema.evaluacionesSst)
      .innerJoin(schema.companies, eq(schema.evaluacionesSst.companyId, schema.companies.id))
      .where(eq(schema.evaluacionesSst.id, id));

      if (!evaluacion) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, evaluacion.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      if (!assignment) {
        return res.status(403).json({ message: "No tiene acceso a esta evaluación" });
      }

      res.json(evaluacion);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/evaluacion-sst/:id] Error:', error.message);
      res.status(500).json({ message: "Error fetching evaluation", error: error.message });
    }
  });

  // GET /api/portal-licenciado/plan-trabajo/:id - Get work plan details for LSO review
  app.get("/api/portal-licenciado/plan-trabajo/:id", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [plan] = await db.select({
        id: schema.planesTrabajoAnual.id,
        companyId: schema.planesTrabajoAnual.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        anio: schema.planesTrabajoAnual.anio,
        estado: schema.planesTrabajoAnual.estado,
        fechaElaboracion: schema.planesTrabajoAnual.fechaElaboracion,
        objetivoGeneral: schema.planesTrabajoAnual.objetivoGeneral,
        alcance: schema.planesTrabajoAnual.alcance,
        presupuestoTotal: schema.planesTrabajoAnual.presupuestoTotal,
        presupuestoEjecutado: schema.planesTrabajoAnual.presupuestoEjecutado,
        responsableElaboracion: schema.planesTrabajoAnual.responsableElaboracion,
        cargoResponsable: schema.planesTrabajoAnual.cargoResponsable,
        totalActividades: schema.planesTrabajoAnual.totalActividades,
        actividadesCompletadas: schema.planesTrabajoAnual.actividadesCompletadas,
        porcentajeCumplimiento: schema.planesTrabajoAnual.porcentajeCumplimiento,
        observaciones: schema.planesTrabajoAnual.observaciones,
        lsoSignatureName: schema.planesTrabajoAnual.lsoSignatureName,
        lsoSignatureLicense: schema.planesTrabajoAnual.lsoSignatureLicense,
        lsoSignatureUrl: schema.planesTrabajoAnual.lsoSignatureUrl,
        lsoSignedAt: schema.planesTrabajoAnual.lsoSignedAt,
        createdAt: schema.planesTrabajoAnual.createdAt,
      })
      .from(schema.planesTrabajoAnual)
      .innerJoin(schema.companies, eq(schema.planesTrabajoAnual.companyId, schema.companies.id))
      .where(eq(schema.planesTrabajoAnual.id, id));

      if (!plan) {
        return res.status(404).json({ message: "Plan de trabajo no encontrado" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, plan.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      if (!assignment) {
        return res.status(403).json({ message: "No tiene acceso a este plan" });
      }

      res.json(plan);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/plan-trabajo/:id] Error:', error.message);
      res.status(500).json({ message: "Error fetching work plan", error: error.message });
    }
  });

  // GET /api/portal-licenciado/matriz-iperc/:id - Get risk matrix details for LSO review
  app.get("/api/portal-licenciado/matriz-iperc/:id", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const [matriz] = await db.select({
        id: schema.matricesIperc.id,
        companyId: schema.matricesIperc.companyId,
        companyName: schema.companies.name,
        companyNit: schema.companies.nit,
        nombre: schema.matricesIperc.nombre,
        codigo: schema.matricesIperc.codigo,
        area: schema.matricesIperc.area,
        proceso: schema.matricesIperc.proceso,
        responsableEvaluacion: schema.matricesIperc.responsableEvaluacion,
        fechaEvaluacion: schema.matricesIperc.fechaEvaluacion,
        estado: schema.matricesIperc.estado,
        version: schema.matricesIperc.version,
        metodologia: schema.matricesIperc.metodologia,
        alcance: schema.matricesIperc.alcance,
        observaciones: schema.matricesIperc.observaciones,
        lsoSignatureName: schema.matricesIperc.lsoSignatureName,
        lsoSignatureLicense: schema.matricesIperc.lsoSignatureLicense,
        lsoSignatureUrl: schema.matricesIperc.lsoSignatureUrl,
        lsoSignedAt: schema.matricesIperc.lsoSignedAt,
        createdAt: schema.matricesIperc.createdAt,
      })
      .from(schema.matricesIperc)
      .innerJoin(schema.companies, eq(schema.matricesIperc.companyId, schema.companies.id))
      .where(eq(schema.matricesIperc.id, id));

      if (!matriz) {
        return res.status(404).json({ message: "Matriz IPERC no encontrada" });
      }

      const [assignment] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, matriz.companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      if (!assignment) {
        return res.status(403).json({ message: "No tiene acceso a esta matriz" });
      }

      res.json(matriz);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/matriz-iperc/:id] Error:', error.message);
      res.status(500).json({ message: "Error fetching risk matrix", error: error.message });
    }
  });

  app.get("/api/portal-licenciado/empresa/:companyId/dashboard-phva", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      const { companyId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      const [assignment] = await db.select({ id: schema.licensedProfessionalAssignments.id })
        .from(schema.licensedProfessionalAssignments)
        .where(and(
          eq(schema.licensedProfessionalAssignments.userId, user.id),
          eq(schema.licensedProfessionalAssignments.companyId, companyId),
          eq(schema.licensedProfessionalAssignments.isActive, true)
        ));

      const hasDirectAccess = user.companyId === companyId;
      if (!assignment && !hasDirectAccess) {
        return res.status(403).json({ message: "No tiene asignación activa para esta empresa" });
      }

      const [company] = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        nit: schema.companies.nit,
        numberOfWorkers: schema.companies.numberOfWorkers,
        riskLevel: schema.companies.riskLevel,
      })
      .from(schema.companies)
      .where(eq(schema.companies.id, companyId));

      const [hacer, verificar, actuar] = await Promise.all([
        storage.getDashboardHacer(companyId, year),
        storage.getDashboardVerificar(companyId, year),
        storage.getDashboardActuar(companyId, year),
      ]);

      res.json({
        company,
        year,
        hacer,
        verificar,
        actuar,
      });
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/empresa/:companyId/dashboard-phva] Error:', error.message);
      res.status(500).json({ message: "Error al obtener dashboard PHVA", error: error.message });
    }
  });
}
