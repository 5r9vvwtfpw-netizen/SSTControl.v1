import type { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function registerAdminPortalsRoutes(app: Express) {

  // ============================================================================
  // LSO PORTAL ADMIN ENDPOINTS
  // ============================================================================

  app.get("/api/admin/portal-lso/users", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const lsoUsers = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        fullName: schema.users.fullName,
        email: schema.users.email,
        sstLicenseNumber: schema.users.sstLicenseNumber,
        sstLicenseIssuer: schema.users.sstLicenseIssuer,
        sstLicenseIssuedAt: schema.users.sstLicenseIssuedAt,
        sstLicenseExpiresAt: schema.users.sstLicenseExpiresAt,
        sstLicenseStatus: schema.users.sstLicenseStatus,
        sstProfessionType: schema.users.sstProfessionType,
        sstSignatureUrl: schema.users.sstSignatureUrl,
        sstCourse50Hours: schema.users.sstCourse50Hours,
        sstCourse50HoursDate: schema.users.sstCourse50HoursDate,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.role, 'lso'));

      const usersWithCounts = await Promise.all(
        lsoUsers.map(async (user) => {
          const [countResult] = await db.select({
            count: sql<number>`count(*)`,
          })
          .from(schema.licensedProfessionalAssignments)
          .where(and(
            eq(schema.licensedProfessionalAssignments.userId, user.id),
            eq(schema.licensedProfessionalAssignments.isActive, true)
          ));
          return {
            ...user,
            activeAssignmentsCount: Number(countResult?.count || 0),
          };
        })
      );

      res.json(usersWithCounts);
    } catch (error: any) {
      console.error('[GET /api/admin/portal-lso/users] Error:', error.message);
      res.status(500).json({ error: "Error al obtener usuarios LSO" });
    }
  });

  app.get("/api/admin/portal-lso/users/:id", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [user] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));

      if (!user) {
        return res.status(404).json({ error: "Usuario LSO no encontrado" });
      }

      const assignments = await db.select({
        id: schema.licensedProfessionalAssignments.id,
        companyId: schema.licensedProfessionalAssignments.companyId,
        companyName: schema.companies.name,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
        isActive: schema.licensedProfessionalAssignments.isActive,
        unassignedAt: schema.licensedProfessionalAssignments.unassignedAt,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
      .where(eq(schema.licensedProfessionalAssignments.userId, id));

      const { password, ...userWithoutPassword } = user;

      res.json({
        ...userWithoutPassword,
        assignments,
      });
    } catch (error: any) {
      console.error('[GET /api/admin/portal-lso/users/:id] Error:', error.message);
      res.status(500).json({ error: "Error al obtener detalle del usuario LSO" });
    }
  });

  app.patch("/api/admin/portal-lso/users/:id", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));

      if (!existing) {
        return res.status(404).json({ error: "Usuario LSO no encontrado" });
      }

      const allowedFields = [
        'fullName', 'email', 'sstLicenseNumber', 'sstLicenseIssuer',
        'sstProfessionType', 'sstLicenseIssuedAt', 'sstLicenseExpiresAt'
      ];

      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
      }

      const [updated] = await db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();

      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('[PATCH /api/admin/portal-lso/users/:id] Error:', error.message);
      res.status(500).json({ error: "Error al actualizar usuario LSO" });
    }
  });

  app.delete("/api/admin/portal-lso/users/:id/signature", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));

      if (!existing) {
        return res.status(404).json({ error: "Usuario LSO no encontrado" });
      }

      await db.update(schema.users)
        .set({ sstSignatureUrl: null })
        .where(eq(schema.users.id, id));

      res.json({ success: true, message: "Firma eliminada exitosamente" });
    } catch (error: any) {
      console.error('[DELETE /api/admin/portal-lso/users/:id/signature] Error:', error.message);
      res.status(500).json({ error: "Error al eliminar firma" });
    }
  });

  app.post("/api/admin/portal-lso/users/:id/reset-password", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'lso')
        ));

      if (!existing) {
        return res.status(404).json({ error: "Usuario LSO no encontrado" });
      }

      const temporaryPassword = generateRandomPassword();
      const hashedPassword = await hashPassword(temporaryPassword);

      await db.update(schema.users)
        .set({ password: hashedPassword })
        .where(eq(schema.users.id, id));

      res.json({
        success: true,
        temporaryPassword,
        message: "Contraseña restablecida exitosamente",
      });
    } catch (error: any) {
      console.error('[POST /api/admin/portal-lso/users/:id/reset-password] Error:', error.message);
      res.status(500).json({ error: "Error al restablecer contraseña" });
    }
  });

  app.get("/api/admin/portal-lso/assignments", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { isActive } = req.query;

      let conditions = [];
      if (isActive !== undefined) {
        conditions.push(eq(schema.licensedProfessionalAssignments.isActive, isActive === 'true'));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const assignments = await db.select({
        id: schema.licensedProfessionalAssignments.id,
        userId: schema.licensedProfessionalAssignments.userId,
        companyId: schema.licensedProfessionalAssignments.companyId,
        companyName: schema.companies.name,
        lsoFullName: schema.users.fullName,
        lsoUsername: schema.users.username,
        assignedAt: schema.licensedProfessionalAssignments.assignedAt,
        isActive: schema.licensedProfessionalAssignments.isActive,
        unassignedAt: schema.licensedProfessionalAssignments.unassignedAt,
      })
      .from(schema.licensedProfessionalAssignments)
      .innerJoin(schema.companies, eq(schema.licensedProfessionalAssignments.companyId, schema.companies.id))
      .innerJoin(schema.users, eq(schema.licensedProfessionalAssignments.userId, schema.users.id))
      .where(whereClause);

      res.json(assignments);
    } catch (error: any) {
      console.error('[GET /api/admin/portal-lso/assignments] Error:', error.message);
      res.status(500).json({ error: "Error al obtener asignaciones" });
    }
  });

  app.delete("/api/admin/portal-lso/assignments/:id", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.licensedProfessionalAssignments)
        .where(eq(schema.licensedProfessionalAssignments.id, id));

      if (!existing) {
        return res.status(404).json({ error: "Asignación no encontrada" });
      }

      await db.update(schema.licensedProfessionalAssignments)
        .set({ isActive: false, unassignedAt: new Date() })
        .where(eq(schema.licensedProfessionalAssignments.id, id));

      res.json({ success: true, message: "Asignación desactivada exitosamente" });
    } catch (error: any) {
      console.error('[DELETE /api/admin/portal-lso/assignments/:id] Error:', error.message);
      res.status(500).json({ error: "Error al desactivar asignación" });
    }
  });

  // ============================================================================
  // WORKER PORTAL ADMIN ENDPOINTS
  // ============================================================================

  app.get("/api/admin/portal-empleados/users", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const workerUsers = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        fullName: schema.users.fullName,
        email: schema.users.email,
        companyId: schema.users.companyId,
        workerId: schema.users.workerId,
        createdAt: schema.users.createdAt,
        companyName: schema.companies.name,
      })
      .from(schema.users)
      .leftJoin(schema.companies, eq(schema.users.companyId, schema.companies.id))
      .where(eq(schema.users.role, 'trabajador'));

      res.json(workerUsers);
    } catch (error: any) {
      console.error('[GET /api/admin/portal-empleados/users] Error:', error.message);
      res.status(500).json({ error: "Error al obtener usuarios trabajadores" });
    }
  });

  app.post("/api/admin/portal-empleados/users/:id/reset-password", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'trabajador')
        ));

      if (!existing) {
        return res.status(404).json({ error: "Usuario trabajador no encontrado" });
      }

      const temporaryPassword = generateRandomPassword();
      const hashedPassword = await hashPassword(temporaryPassword);

      await db.update(schema.users)
        .set({ password: hashedPassword })
        .where(eq(schema.users.id, id));

      res.json({
        success: true,
        temporaryPassword,
        message: "Contraseña restablecida exitosamente",
      });
    } catch (error: any) {
      console.error('[POST /api/admin/portal-empleados/users/:id/reset-password] Error:', error.message);
      res.status(500).json({ error: "Error al restablecer contraseña" });
    }
  });

  app.patch("/api/admin/portal-empleados/users/:id/deactivate", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, id),
          eq(schema.users.role, 'trabajador')
        ));

      if (!existing) {
        return res.status(404).json({ error: "Usuario trabajador no encontrado" });
      }

      await db.update(schema.users)
        .set({ 
          password: await hashPassword(randomBytes(32).toString("hex")),
        })
        .where(eq(schema.users.id, id));

      res.json({ success: true, message: "Acceso del trabajador desactivado exitosamente (contraseña invalidada)" });
    } catch (error: any) {
      console.error('[PATCH /api/admin/portal-empleados/users/:id/deactivate] Error:', error.message);
      res.status(500).json({ error: "Error al desactivar usuario trabajador" });
    }
  });

  app.get("/api/admin/portal-empleados/access-logs", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { companyId } = req.query;

      let conditions = [];
      if (companyId && typeof companyId === 'string') {
        conditions.push(eq(schema.workerPortalAccessLogs.companyId, companyId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const logs = await db.select()
        .from(schema.workerPortalAccessLogs)
        .where(whereClause)
        .orderBy(desc(schema.workerPortalAccessLogs.accessTime))
        .limit(100);

      res.json(logs);
    } catch (error: any) {
      console.error('[GET /api/admin/portal-empleados/access-logs] Error:', error.message);
      res.status(500).json({ error: "Error al obtener registros de acceso" });
    }
  });

  app.get("/api/admin/portal-empleados/reports", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { companyId, estado } = req.query;

      let conditions = [];
      if (companyId && typeof companyId === 'string') {
        conditions.push(eq(schema.reportesTrabajadores.companyId, companyId));
      }
      if (estado && typeof estado === 'string') {
        conditions.push(eq(schema.reportesTrabajadores.estado, estado as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const reports = await db.select()
        .from(schema.reportesTrabajadores)
        .where(whereClause)
        .orderBy(desc(schema.reportesTrabajadores.createdAt));

      res.json(reports);
    } catch (error: any) {
      console.error('[GET /api/admin/portal-empleados/reports] Error:', error.message);
      res.status(500).json({ error: "Error al obtener reportes de trabajadores" });
    }
  });

  app.delete("/api/admin/portal-empleados/reports/:id", requireAuth, requireSuperadmin, async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(schema.reportesTrabajadores)
        .where(eq(schema.reportesTrabajadores.id, id));

      if (!existing) {
        return res.status(404).json({ error: "Reporte no encontrado" });
      }

      await db.delete(schema.reportesTrabajadores)
        .where(eq(schema.reportesTrabajadores.id, id));

      res.json({ success: true, message: "Reporte eliminado exitosamente" });
    } catch (error: any) {
      console.error('[DELETE /api/admin/portal-empleados/reports/:id] Error:', error.message);
      res.status(500).json({ error: "Error al eliminar reporte" });
    }
  });
}
