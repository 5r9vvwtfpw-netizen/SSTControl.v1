import { createHash, randomUUID } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import { ObjectStorageService } from "../objectStorage";
import { generateLsoManagementReport } from "./lso-management-report";
import { enqueueLsoArchiveCleanup } from "./lso-archive-cleanup";

const CONTENT_TYPE = "application/pdf";
const DOCUMENT_CODE = "LSO-GEST-01";
const VERSION = "1.0";

export type ArchiveRequest = { assignmentId: string; createdBy?: string | null; terminatedAt?: Date };
export type ArchiveRepository = {
  lockCompany(companyId: string): Promise<void>;
  findAssignment(id: string, companyId?: string, lock?: boolean): Promise<any | undefined>;
  findActiveAssignments(companyId: string): Promise<any[]>;
  findArchive(input: { assignmentId: string; assignedAt?: Date; year?: number; version?: string; includeFailed?: boolean }): Promise<any | undefined>;
  getUser(id: string): Promise<any | undefined>;
  insertArchive(values: any): Promise<any | undefined>;
  deactivate(id: string, terminatedAt: Date): Promise<boolean>;
  insertAssignment(values: schema.InsertLicensedProfessionalAssignment): Promise<any | undefined>;
};
export type LsoArchiveLifecycleDeps = {
  transaction<T>(fn: (repo: ArchiveRepository) => Promise<T>): Promise<T>;
  reportGenerator: (companyId: string, year: number, userId: string, assignmentId: string) => Promise<Buffer | null>;
  upload: (path: string, body: Buffer, contentType: string) => Promise<string>;
  deleteObject: (path: string) => Promise<unknown>;
  hash: (body: Buffer | string) => string;
  now: () => Date;
  enqueueCleanup?: (path: string, reason: string) => Promise<void>;
};

function productionDeps(): LsoArchiveLifecycleDeps {
  const storage = new ObjectStorageService();
  return {
    transaction: (fn) => db.transaction(async (tx) => fn({
      lockCompany: async (companyId) => { await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${companyId}))`); },
      findAssignment: async (id, companyId, lock = true) => {
        const conditions = [eq(schema.licensedProfessionalAssignments.id, id)];
        if (companyId) conditions.push(eq(schema.licensedProfessionalAssignments.companyId, companyId));
        const query = tx.select().from(schema.licensedProfessionalAssignments).where(and(...conditions));
        return (await (lock ? query.for("update") : query).limit(1))[0];
      },
      findActiveAssignments: async (companyId) => tx.select().from(schema.licensedProfessionalAssignments)
        .where(and(eq(schema.licensedProfessionalAssignments.companyId, companyId), eq(schema.licensedProfessionalAssignments.isActive, true)))
        .for("update"),
      findArchive: async ({ assignmentId, assignedAt, year, version, includeFailed }) => {
        const conditions = [eq(schema.lsoManagementReportArchives.assignmentId, assignmentId)];
        if (assignedAt) conditions.push(eq(schema.lsoManagementReportArchives.assignedAt, assignedAt));
        if (year !== undefined) conditions.push(eq(schema.lsoManagementReportArchives.year, year));
        if (version) conditions.push(eq(schema.lsoManagementReportArchives.version, version));
        if (!includeFailed) conditions.push(eq(schema.lsoManagementReportArchives.status, "stored"));
        return (await tx.select().from(schema.lsoManagementReportArchives).where(and(...conditions)).limit(1))[0];
      },
      getUser: async (id) => (await tx.select().from(schema.users).where(eq(schema.users.id, id)).limit(1))[0],
      insertArchive: async (values) => (await tx.insert(schema.lsoManagementReportArchives).values(values).returning())[0],
      deactivate: async (id, terminatedAt) => (await tx.update(schema.licensedProfessionalAssignments)
        .set({ isActive: false, unassignedAt: terminatedAt })
        .where(and(eq(schema.licensedProfessionalAssignments.id, id), eq(schema.licensedProfessionalAssignments.isActive, true)))
        .returning({ id: schema.licensedProfessionalAssignments.id })).length === 1,
      insertAssignment: async (values) => (await tx.insert(schema.licensedProfessionalAssignments).values(values).returning())[0],
    })),
    reportGenerator: generateLsoManagementReport,
    upload: (path, body, type) => storage.uploadObject(path, body, type),
    deleteObject: (path) => storage.deleteObject(path),
    hash: (value) => createHash("sha256").update(value).digest("hex"),
    now: () => new Date(),
  };
}

function objectKey(deps: LsoArchiveLifecycleDeps, assignment: any, year: number) {
  // Every upload attempt gets its own immutable key. Lifecycle identity remains
  // in the prefix, while the attempt UUID prevents compensation from touching
  // a later retry's successful object.
  return `lso-management-archives/${assignment.companyId}/${assignment.id}/${deps.hash(`${assignment.assignedAt.toISOString()}:${year}:${VERSION}`)}/${randomUUID()}.pdf`;
}

export function createLsoArchiveLifecycleService(deps: LsoArchiveLifecycleDeps) {
  async function terminate(requests: ArchiveRequest[]) {
    if (!requests.length) return [];
    const uploaded: string[] = [];
    try {
      return await deps.transaction(async (repo) => {
        const first = await repo.findAssignment(requests[0].assignmentId, undefined, false);
        if (!first) throw new Error("Asignación LSO no encontrada.");
        await repo.lockCompany(first.companyId);
        const results: any[] = [];
        for (const request of requests) {
          const assignment = await repo.findAssignment(request.assignmentId, first.companyId);
          const terminatedAt = request.terminatedAt || deps.now();
          const year = (!assignment?.isActive && assignment.unassignedAt)
            ? new Date(assignment.unassignedAt).getFullYear()
            : terminatedAt.getFullYear();
          if (!assignment || !assignment.isActive) {
            if (!assignment) throw new Error("Asignación LSO no encontrada.");
            const existing = await repo.findArchive({ assignmentId: request.assignmentId, assignedAt: assignment?.assignedAt, year, version: VERSION });
            if (existing) { results.push(existing); continue; }
            throw new Error("No se puede terminar la asignación LSO: no está activa.");
          }
          const existing = await repo.findArchive({ assignmentId: assignment.id, assignedAt: assignment.assignedAt, year, version: VERSION });
          if (existing) {
            if (!await repo.deactivate(assignment.id, terminatedAt)) throw new Error("La asignación LSO cambió durante el cierre; no se desactivó.");
            results.push(existing);
            continue;
          }
          const report = await deps.reportGenerator(assignment.companyId, year, assignment.userId, assignment.id);
          if (!report) throw new Error("No fue posible generar el informe de cierre LSO.");
          const sha256 = deps.hash(report);
          const path = objectKey(deps, assignment, year);
          const storedPath = await deps.upload(path, report, CONTENT_TYPE);
          uploaded.push(storedPath);
          const lso = await repo.getUser(assignment.userId);
          const archive = await repo.insertArchive({
            assignmentId: assignment.id, companyId: assignment.companyId, lsoUserId: assignment.userId,
            lsoName: lso?.fullName || assignment.externalLsoName || lso?.username || "LSO",
            lsoLicense: lso?.sstLicenseNumber || assignment.externalLsoLicenseNumber || "No registrada",
            lsoLicenseIssuer: lso?.sstLicenseIssuer || assignment.externalLsoLicenseIssuer || "No registrada",
            lsoEmail: lso?.email || assignment.externalLsoEmail || null, assignedAt: assignment.assignedAt,
            terminatedAt, year, objectPath: storedPath, contentType: CONTENT_TYPE, sha256,
            byteSize: report.byteLength, documentCode: DOCUMENT_CODE, version: VERSION,
            status: "stored", createdBy: request.createdBy || null,
          });
          if (!archive) throw new Error("No se pudo registrar el archivo de cierre LSO.");
          if (!await repo.deactivate(assignment.id, terminatedAt)) throw new Error("La asignación LSO cambió durante el cierre; no se desactivó.");
          results.push(archive);
        }
        return results;
      });
    } catch (error: any) {
      await Promise.all(uploaded.map(async (path) => {
        try { if (!(await deps.deleteObject(path))) await (deps.enqueueCleanup || enqueueLsoArchiveCleanup)(path, "transaction compensation delete failed"); }
        catch { await (deps.enqueueCleanup || enqueueLsoArchiveCleanup)(path, "transaction compensation delete failed"); }
      }));
      throw new Error(`No se puede terminar la asignación: ${error?.message || "falló el archivo LSO"}`);
    }
  }
  async function replace(companyId: string, requests: ArchiveRequest[], replacement: schema.InsertLicensedProfessionalAssignment) {
    if (replacement.companyId !== companyId) throw new Error("La nueva asignación no pertenece a la empresa seleccionada.");
    const uploaded: string[] = [];
    try {
      return await deps.transaction(async (repo) => {
        await repo.lockCompany(companyId);
        // Replacement is intentionally scoped to the explicit target IDs:
        // concurrent activation of another LSO must survive this switch.
        const lockedRequests = requests;
        const archives: any[] = [];
        for (const request of lockedRequests) {
          const assignment = await repo.findAssignment(request.assignmentId, companyId);
          if (!assignment?.isActive) throw new Error("La asignación anterior ya no está activa.");
          const terminatedAt = request.terminatedAt || deps.now();
          const year = terminatedAt.getFullYear();
          let archive = await repo.findArchive({ assignmentId: assignment.id, assignedAt: assignment.assignedAt, year, version: VERSION });
          if (!archive) {
            const report = await deps.reportGenerator(companyId, year, assignment.userId, assignment.id);
            if (!report) throw new Error("No fue posible generar el informe de cierre LSO.");
            const path = objectKey(deps, assignment, year);
            const storedPath = await deps.upload(path, report, CONTENT_TYPE);
            uploaded.push(storedPath);
            const lso = await repo.getUser(assignment.userId);
            archive = await repo.insertArchive({ assignmentId: assignment.id, companyId, lsoUserId: assignment.userId, lsoName: lso?.fullName || assignment.externalLsoName || "LSO", lsoLicense: lso?.sstLicenseNumber || assignment.externalLsoLicenseNumber || "No registrada", lsoLicenseIssuer: lso?.sstLicenseIssuer || assignment.externalLsoLicenseIssuer || "No registrada", lsoEmail: lso?.email || null, assignedAt: assignment.assignedAt, terminatedAt, year, objectPath: storedPath, contentType: CONTENT_TYPE, sha256: deps.hash(report), byteSize: report.byteLength, documentCode: DOCUMENT_CODE, version: VERSION, status: "stored", createdBy: request.createdBy || null });
            if (!archive) throw new Error("No se pudo registrar el archivo de cierre LSO.");
          }
          if (!await repo.deactivate(assignment.id, terminatedAt)) throw new Error("No se pudo cerrar exactamente la asignación anterior.");
          archives.push(archive);
        }
        const created = await repo.insertAssignment(replacement);
        if (!created) throw new Error("No se pudo activar la nueva asignación LSO.");
        return { archives, assignment: created };
      });
    } catch (error) {
      await Promise.all(uploaded.map(async (path) => {
        try { if (!(await deps.deleteObject(path))) await (deps.enqueueCleanup || enqueueLsoArchiveCleanup)(path, "replacement compensation delete failed"); }
        catch { await (deps.enqueueCleanup || enqueueLsoArchiveCleanup)(path, "replacement compensation delete failed"); }
      }));
      throw error;
    }
  }
  return { terminate, replace };
}

export function createLsoAssignmentActivationService(deps: Pick<LsoArchiveLifecycleDeps, "transaction" | "now">) {
  return async (values: schema.InsertLicensedProfessionalAssignment, existingId?: string) =>
    deps.transaction(async (repo) => {
      await repo.lockCompany(values.companyId);
      if (existingId) {
        const existing = await repo.findAssignment(existingId, values.companyId);
        if (existing) return repo.insertAssignment({ ...values, id: existing.id, isActive: true, assignedAt: deps.now(), unassignedAt: null } as any);
      }
      return repo.insertAssignment(values);
    });
}

const lifecycle = createLsoArchiveLifecycleService(productionDeps());
export const terminateLsoAssignment = (id: string, createdBy: string | null | undefined, terminatedAt = new Date()) =>
  lifecycle.terminate([{ assignmentId: id, createdBy, terminatedAt }]);
export const terminateLsoAssignments = (requests: ArchiveRequest[]) => lifecycle.terminate(requests);
export const replaceLsoAssignmentsAtomically = (companyId: string, requests: ArchiveRequest[], replacement: schema.InsertLicensedProfessionalAssignment) =>
  lifecycle.replace(companyId, requests, replacement);

export async function activateLsoAssignment(values: schema.InsertLicensedProfessionalAssignment, existingId?: string) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${values.companyId}))`);
    const existing = await tx.select().from(schema.licensedProfessionalAssignments)
      .where(and(eq(schema.licensedProfessionalAssignments.id, existingId || ""), eq(schema.licensedProfessionalAssignments.companyId, values.companyId))).limit(1);
    if (existing[0]) {
      const [reactivated] = await tx.update(schema.licensedProfessionalAssignments)
        .set({ ...values, isActive: true, assignedAt: new Date(), unassignedAt: null }).where(eq(schema.licensedProfessionalAssignments.id, existing[0].id)).returning();
      return reactivated;
    }
    const [created] = await tx.insert(schema.licensedProfessionalAssignments).values(values).returning();
    return created;
  });
}