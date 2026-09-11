import { and, eq, lte } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import { ObjectStorageService } from "../objectStorage";

export type CleanupJob = { id: string; objectPath: string; attempts: number; status: string; nextAttemptAt?: Date };
export type CleanupDeps = {
  enqueue: (objectPath: string, reason: string) => Promise<void>;
  listDue: () => Promise<CleanupJob[]>;
  remove: (objectPath: string) => Promise<void>;
  isReferenced: (objectPath: string) => Promise<boolean>;
  complete: (id: string) => Promise<void>;
  retry: (id: string, attempts: number, nextAttemptAt: Date, error: string) => Promise<void>;
  now: () => Date;
};

export function createLsoArchiveCleanupService(deps: CleanupDeps) {
  return {
    enqueue: deps.enqueue,
    async reconcile() {
      for (const job of await deps.listDue()) {
        try {
          if (await deps.isReferenced(job.objectPath)) {
            await deps.complete(job.id);
            continue;
          }
          await deps.remove(job.objectPath);
          await deps.complete(job.id);
        } catch (error: any) {
          const attempts = job.attempts + 1;
          const delayMs = Math.min(24 * 60 * 60 * 1000, 30_000 * (2 ** Math.min(attempts, 10)));
          await deps.retry(job.id, attempts, new Date(deps.now().getTime() + delayMs), error?.message || "delete failed");
        }
      }
    },
  };
}

export async function enqueueLsoArchiveCleanup(objectPath: string, reason: string) {
  try {
    await db.insert(schema.lsoArchiveObjectCleanupJobs).values({ objectPath, reason })
      .onConflictDoNothing({ target: schema.lsoArchiveObjectCleanupJobs.objectPath });
  } catch (error) {
    console.error("[LSO archive cleanup] Could not persist cleanup job", error);
  }
}

export async function reconcileLsoArchiveCleanupJobs() {
  const storage = new ObjectStorageService();
  const service = createLsoArchiveCleanupService({
    enqueue: enqueueLsoArchiveCleanup,
    listDue: async () => db.select().from(schema.lsoArchiveObjectCleanupJobs)
      .where(and(eq(schema.lsoArchiveObjectCleanupJobs.status, "pending"), lte(schema.lsoArchiveObjectCleanupJobs.nextAttemptAt, new Date()))).limit(25),
    remove: (path) => storage.deleteObject(path),
    isReferenced: async (path) => (await db.select({ id: schema.lsoManagementReportArchives.id })
      .from(schema.lsoManagementReportArchives)
      .where(eq(schema.lsoManagementReportArchives.objectPath, path)).limit(1)).length > 0,
    complete: async (id) => { await db.update(schema.lsoArchiveObjectCleanupJobs).set({ status: "completed", updatedAt: new Date(), lastError: null }).where(eq(schema.lsoArchiveObjectCleanupJobs.id, id)); },
    retry: async (id, attempts, nextAttemptAt, error) => { await db.update(schema.lsoArchiveObjectCleanupJobs).set({ attempts, lastError: error, nextAttemptAt, updatedAt: new Date() }).where(eq(schema.lsoArchiveObjectCleanupJobs.id, id)); },
    now: () => new Date(),
  });
  await service.reconcile();
}

export function startLsoArchiveCleanupReconciler() {
  const run = () => reconcileLsoArchiveCleanupJobs().catch((error) => console.error("[LSO archive cleanup] reconciler failed", error));
  run();
  const timer = setInterval(run, 5 * 60 * 1000);
  timer.unref();
}