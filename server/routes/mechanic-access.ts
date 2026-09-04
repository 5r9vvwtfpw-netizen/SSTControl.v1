import type { Express, Request } from "express";
import { and, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import { db } from "../db";
import { requireAuth, requirePermission } from "../auth";
import * as schema from "@shared/schema";
import { z } from "zod";

const scopeValues = ["maintenance", "vehicles", "inspections"] as const;
const accessInputSchema = z.object({
  mechanicUserId: z.string().min(1),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional().nullable(),
  scope: z.array(z.enum(scopeValues)).min(1).default(["maintenance"]),
}).refine((value) => !value.endDate || value.endDate >= value.startDate, {
  message: "La fecha de finalización no puede ser anterior a la fecha de inicio",
});

const rejectionSchema = z.object({ reason: z.string().max(500).optional() });

function normalizeIdentification(value: string): string {
  return value.replace(/[\s.-]/g, "");
}

function isCompanyAdministrator(req: Request): boolean {
  return (req.user?.role === "superusuario" || req.user?.role === "admin") && !!req.user.companyId;
}

function currentCompanyId(req: Request): string | null {
  return req.user?.companyId || null;
}

export function registerMechanicAccessRoutes(app: Express) {
  // Solo devuelve autorizaciones de la empresa del administrador autenticado.
  app.get("/api/mechanic-access", requirePermission("mechanic_access:manage"), async (req, res) => {
    if (!isCompanyAdministrator(req)) return res.status(403).json({ error: "Solo el administrador de la empresa puede gestionar autorizaciones" });
    const companyId = currentCompanyId(req)!;
    const rows = await db
      .select({
        id: schema.mechanicCompanyAccess.id,
        mechanicUserId: schema.mechanicCompanyAccess.mechanicUserId,
        mechanicUsername: schema.users.username,
        mechanicName: schema.users.fullName,
        mechanicEmail: schema.users.email,
        employerCompanyId: schema.mechanicCompanyAccess.employerCompanyId,
        employerCompanyName: schema.companies.name,
        authorizedCompanyId: schema.mechanicCompanyAccess.authorizedCompanyId,
        authorizedCompanyName: sql<string>`(
          SELECT name
          FROM companies
          WHERE id = ${schema.mechanicCompanyAccess.authorizedCompanyId}
        )`,
        scope: schema.mechanicCompanyAccess.scope,
        startDate: schema.mechanicCompanyAccess.startDate,
        endDate: schema.mechanicCompanyAccess.endDate,
        isActive: schema.mechanicCompanyAccess.isActive,
        status: schema.mechanicCompanyAccess.status,
        invitedAt: schema.mechanicCompanyAccess.invitedAt,
        respondedAt: schema.mechanicCompanyAccess.respondedAt,
        createdAt: schema.mechanicCompanyAccess.createdAt,
      })
      .from(schema.mechanicCompanyAccess)
      .innerJoin(schema.users, eq(schema.mechanicCompanyAccess.mechanicUserId, schema.users.id))
      .innerJoin(schema.companies, eq(schema.mechanicCompanyAccess.employerCompanyId, schema.companies.id))
      .where(eq(schema.mechanicCompanyAccess.authorizedCompanyId, companyId))
      .orderBy(desc(schema.mechanicCompanyAccess.createdAt));
    res.json(rows);
  });

  // Búsqueda acotada: nunca expone el directorio completo de clientes.
  app.get("/api/mechanic-access/search", requirePermission("mechanic_access:manage"), async (req, res) => {
    if (!isCompanyAdministrator(req)) return res.status(403).json({ error: "Solo el administrador de la empresa puede buscar técnicos" });
    const cedula = normalizeIdentification(String(req.query.cedula || ""));
    if (!cedula) return res.json([]);
    const rows = await db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        employerCompanyName: schema.companies.name,
      })
      .from(schema.users)
      .leftJoin(schema.companies, eq(schema.users.companyId, schema.companies.id))
      .where(and(
        eq(schema.users.role, "tecnico_mecanico"),
        sql`regexp_replace(coalesce(${schema.users.identificationNumber}, ''), '[[:space:].-]', '', 'g') = ${cedula}`,
        sql`${schema.users.companyId} <> ${currentCompanyId(req)!}`
      ))
      .limit(1);
    res.json(rows);
  });

  app.post("/api/mechanic-access", requirePermission("mechanic_access:manage"), async (req, res) => {
    if (!isCompanyAdministrator(req)) return res.status(403).json({ error: "Solo el administrador de la empresa puede autorizar técnicos" });
    const authorizedCompanyId = currentCompanyId(req)!;
    try {
      const input = accessInputSchema.parse(req.body);
      const [mechanic] = await db.select({
        id: schema.users.id,
        role: schema.users.role,
        companyId: schema.users.companyId,
      }).from(schema.users).where(eq(schema.users.id, input.mechanicUserId));
      if (!mechanic || mechanic.role !== "tecnico_mecanico") {
        return res.status(400).json({ error: "El usuario seleccionado no es un Técnico Mecánico" });
      }
      if (!mechanic.companyId || mechanic.companyId === authorizedCompanyId) {
        return res.status(400).json({ error: "El técnico debe pertenecer a otra empresa empleadora" });
      }
      const [existing] = await db.select({ id: schema.mechanicCompanyAccess.id })
        .from(schema.mechanicCompanyAccess)
        .where(and(
          eq(schema.mechanicCompanyAccess.mechanicUserId, mechanic.id),
          eq(schema.mechanicCompanyAccess.authorizedCompanyId, authorizedCompanyId),
          or(
            eq(schema.mechanicCompanyAccess.status, "pending"),
            eq(schema.mechanicCompanyAccess.status, "accepted")
          )
        ));
      if (existing) return res.status(409).json({ error: "Ya existe una invitación pendiente o aceptada para este técnico" });

      const [created] = await db.insert(schema.mechanicCompanyAccess).values({
        mechanicUserId: mechanic.id,
        employerCompanyId: mechanic.companyId,
        authorizedCompanyId,
        scope: input.scope,
        startDate: input.startDate,
        endDate: input.endDate || null,
        grantedByUserId: req.user!.id,
        status: "pending",
        isActive: false,
      }).returning();
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ error: error?.message || "No se pudo crear la autorización" });
    }
  });

  app.patch("/api/mechanic-access/:id/revoke", requirePermission("mechanic_access:manage"), async (req, res) => {
    if (!isCompanyAdministrator(req)) return res.status(403).json({ error: "Solo el administrador de la empresa puede revocar autorizaciones" });
    const companyId = currentCompanyId(req)!;
    const [updated] = await db.update(schema.mechanicCompanyAccess)
      .set({ isActive: false, status: "revoked", revokedAt: new Date(), revokedByUserId: req.user!.id })
      .where(and(
        eq(schema.mechanicCompanyAccess.id, req.params.id),
        eq(schema.mechanicCompanyAccess.authorizedCompanyId, companyId),
        or(eq(schema.mechanicCompanyAccess.status, "pending"), eq(schema.mechanicCompanyAccess.status, "accepted"))
      ))
      .returning();
    if (!updated) return res.status(404).json({ error: "Autorización activa no encontrada" });
    res.json(updated);
  });

  app.get("/api/mechanic-access/invitations", requireAuth, async (req, res) => {
    if (req.user?.role !== "tecnico_mecanico") return res.status(403).json({ error: "Ruta exclusiva para Técnicos Mecánicos" });
    const rows = await db.select({
      id: schema.mechanicCompanyAccess.id,
      companyName: schema.companies.name,
      scope: schema.mechanicCompanyAccess.scope,
      startDate: schema.mechanicCompanyAccess.startDate,
      endDate: schema.mechanicCompanyAccess.endDate,
      invitedAt: schema.mechanicCompanyAccess.invitedAt,
    }).from(schema.mechanicCompanyAccess)
      .innerJoin(schema.companies, eq(schema.mechanicCompanyAccess.authorizedCompanyId, schema.companies.id))
      .where(and(eq(schema.mechanicCompanyAccess.mechanicUserId, req.user.id), eq(schema.mechanicCompanyAccess.status, "pending")))
      .orderBy(desc(schema.mechanicCompanyAccess.invitedAt));
    res.json(rows);
  });

  app.post("/api/mechanic-access/:id/accept", requireAuth, async (req, res) => {
    if (req.user?.role !== "tecnico_mecanico") return res.status(403).json({ error: "Ruta exclusiva para Técnicos Mecánicos" });
    const [updated] = await db.update(schema.mechanicCompanyAccess)
      .set({ status: "accepted", isActive: true, respondedAt: new Date(), respondedByUserId: req.user.id })
      .where(and(eq(schema.mechanicCompanyAccess.id, req.params.id), eq(schema.mechanicCompanyAccess.mechanicUserId, req.user.id),
        eq(schema.mechanicCompanyAccess.status, "pending"),
        or(isNull(schema.mechanicCompanyAccess.endDate), gte(schema.mechanicCompanyAccess.endDate, sql`CURRENT_DATE`))))
      .returning();
    if (!updated) return res.status(409).json({ error: "La invitación no está pendiente o ya no está vigente" });
    res.json(updated);
  });

  app.post("/api/mechanic-access/:id/reject", requireAuth, async (req, res) => {
    if (req.user?.role !== "tecnico_mecanico") return res.status(403).json({ error: "Ruta exclusiva para Técnicos Mecánicos" });
    try {
      const input = rejectionSchema.parse(req.body || {});
      const [updated] = await db.update(schema.mechanicCompanyAccess)
        .set({ status: "rejected", isActive: false, respondedAt: new Date(), respondedByUserId: req.user.id, rejectionReason: input.reason || null })
        .where(and(eq(schema.mechanicCompanyAccess.id, req.params.id), eq(schema.mechanicCompanyAccess.mechanicUserId, req.user.id), eq(schema.mechanicCompanyAccess.status, "pending")))
        .returning();
      if (!updated) return res.status(409).json({ error: "La invitación ya fue respondida" });
      res.json(updated);
    } catch (error: any) { res.status(400).json({ error: error.message }); }
  });

  // El técnico obtiene únicamente su empresa empleadora y sus autorizaciones activas.
  app.get("/api/mechanic-access/companies", requireAuth, async (req, res) => {
    if (req.user?.role !== "tecnico_mecanico") return res.status(403).json({ error: "Ruta exclusiva para Técnicos Mecánicos" });
    const today = sql`CURRENT_DATE`;
    const grants = await db
      .select({
        id: schema.mechanicCompanyAccess.id,
        companyId: schema.mechanicCompanyAccess.authorizedCompanyId,
        companyName: schema.companies.name,
        scope: schema.mechanicCompanyAccess.scope,
        startDate: schema.mechanicCompanyAccess.startDate,
        endDate: schema.mechanicCompanyAccess.endDate,
      })
      .from(schema.mechanicCompanyAccess)
      .innerJoin(schema.companies, eq(schema.mechanicCompanyAccess.authorizedCompanyId, schema.companies.id))
      .where(and(
        eq(schema.mechanicCompanyAccess.mechanicUserId, req.user.id),
        eq(schema.mechanicCompanyAccess.isActive, true),
        eq(schema.mechanicCompanyAccess.status, "accepted"),
        sql`${schema.mechanicCompanyAccess.startDate} <= ${today}`,
        or(isNull(schema.mechanicCompanyAccess.endDate), gte(schema.mechanicCompanyAccess.endDate, today))
      ));
    const employer = req.user.companyId
      ? await db.select({ id: schema.companies.id, name: schema.companies.name, nit: schema.companies.nit })
        .from(schema.companies).where(eq(schema.companies.id, req.user.companyId))
      : [];
    res.json({
      employer: employer[0] ? { ...employer[0], isEmployer: true, scope: ["maintenance", "vehicles", "inspections"] } : null,
      authorized: grants.map((grant) => ({ ...grant, isEmployer: false })),
    });
  });

  // Consulta mínima para que el técnico pueda registrar inspecciones en una
  // empresa autorizada sin abrirle el módulo completo de conductores.
  app.get("/api/mechanic-access/inspection-drivers", requireAuth, async (req, res) => {
    if (req.user?.role !== "tecnico_mecanico") {
      return res.status(403).json({ error: "Ruta exclusiva para Técnicos Mecánicos" });
    }
    const companyId = req.mechanicEffectiveCompanyId || req.user.companyId;
    if (!companyId) return res.status(403).json({ error: "Usuario no asociado a una empresa" });
    const rows = await db
      .select({
        id: schema.drivers.id,
        name: schema.drivers.name,
        status: schema.drivers.status,
      })
      .from(schema.drivers)
      .where(eq(schema.drivers.companyId, companyId));
    res.json(rows);
  });
}