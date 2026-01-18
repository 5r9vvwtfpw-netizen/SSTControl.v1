import type { Express } from "express";
import { requireAuth, requirePermission } from "../auth";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { hasPermission } from "@shared/permissions";

export function registerLicensedProfessionalsRoutes(app: Express) {

  // GET /api/licensed-professionals - List all licensed professionals (users with role='lso')
  app.get("/api/licensed-professionals", requirePermission("licensed_professionals:view"), async (req, res) => {
    try {
      const { companyId } = req.query;
      
      let professionals = await db.select().from(schema.users).where(eq(schema.users.role, 'lso'));
      
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
            .set({ isActive: true, assignedAt: new Date(), assignedBy: user.id })
            .where(eq(schema.licensedProfessionalAssignments.id, existingAssignment.id))
            .returning();
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
        .set({ isActive: false })
        .where(eq(schema.licensedProfessionalAssignments.id, assignment.id));
      
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

  // GET /api/portal-licenciado/empresas - Companies assigned to the LSO
  app.get("/api/portal-licenciado/empresas", requirePermission("portal_licenciado:access"), async (req, res) => {
    try {
      const user = req.user!;
      
      const empresas = await db.select({
        id: schema.companies.id,
        name: schema.companies.name,
        nit: schema.companies.nit,
        city: schema.companies.city,
        riskLevel: schema.companies.riskLevel,
        numberOfWorkers: schema.companies.numberOfWorkers,
        assignmentId: schema.licensedProfessionalAssignments.id,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
      .where(and(
        eq(schema.licensedProfessionalAssignments.userId, user.id),
        eq(schema.licensedProfessionalAssignments.isActive, true)
      ));
      
      res.json(empresas);
    } catch (error: any) {
      console.error('[GET /api/portal-licenciado/empresas] Error:', error.message);
      res.status(500).json({ message: "Error fetching assigned companies", error: error.message });
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
      
      // Only admins or superadmins can access this directory
      if (!['admin', 'superadmin'].includes(user.role)) {
        return res.status(403).json({ message: "Solo administradores pueden acceder al directorio de profesionales" });
      }
      
      // Admins must have a company associated
      if (user.role === 'admin' && !user.companyId) {
        return res.status(403).json({ message: "Debes estar asociado a una empresa para ver el directorio" });
      }

      // Get all LSOs with valid license status (vigente)
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
      console.error('[GET /api/directory/licensed-professionals] Error:', error.message);
      res.status(500).json({ message: "Error fetching directory", error: error.message });
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
}
