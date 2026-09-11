import test from "node:test";
import assert from "node:assert/strict";
import { createLsoArchiveLifecycleService, createLsoAssignmentActivationService, type ArchiveRepository, type LsoArchiveLifecycleDeps } from "../server/services/lso-management-report-archive";
import { createLsoArchiveCleanupService } from "../server/services/lso-archive-cleanup";
import { archiveListScope, canAccessLsoArchive, hasExactActiveAssignment, interpretGpsAggregate, isLsoAttributable, shouldRenderPesvOperationalSections } from "../server/services/lso-management-report-policy";

type Assignment = any;
type Archive = any;
function harness(assignments: Assignment[], opts: { report?: () => Promise<Buffer | null>; insertFail?: boolean; uploadFail?: boolean; deactivateFail?: boolean; deleteFail?: boolean; enqueueCleanup?: (path: string, reason: string) => Promise<void>; uploaded?: string[] } = {}) {
  const state = { assignments: assignments.map((x) => ({ ...x })), archives: [] as Archive[], uploads: [] as string[], deletes: [] as string[], commits: 0 };
  let serial = Promise.resolve();
  const deps: LsoArchiveLifecycleDeps = {
    transaction: async (fn) => {
      let release!: () => void;
      const prior = serial;
      serial = new Promise<void>((resolve) => { release = resolve; });
      await prior;
      const snapshot = structuredClone(state);
      try {
        const result = await fn(repo);
        state.commits++;
        release();
        return result;
      } catch (error) {
        state.assignments = snapshot.assignments;
        state.archives = snapshot.archives;
        state.uploads = snapshot.uploads;
        release();
        throw error;
      }
    },
    reportGenerator: opts.report || (async () => Buffer.from("pdf")),
    upload: async (path) => { if (opts.uploadFail) throw new Error("upload"); state.uploads.push(path); opts.uploaded?.push(path); return path; },
    deleteObject: async (path) => { state.deletes.push(path); if (opts.deleteFail) throw new Error("delete"); return true; },
    hash: (value) => typeof value === "string" ? value : "hash",
    now: () => new Date("2025-03-01T00:00:00Z"),
    enqueueCleanup: opts.enqueueCleanup,
  };
  const repo: ArchiveRepository = {
    lockCompany: async () => {},
    findAssignment: async (id, companyId) => state.assignments.find((a) => a.id === id && (!companyId || a.companyId === companyId)),
    findActiveAssignments: async (companyId) => state.assignments.filter((a) => a.companyId === companyId && a.isActive),
    findArchive: async ({ assignmentId, assignedAt, year }) => state.archives.find((a) => a.assignmentId === assignmentId && (!assignedAt || +new Date(a.assignedAt) === +new Date(assignedAt)) && (year === undefined || a.year === year)),
    getUser: async () => ({ fullName: "LSO", sstLicenseNumber: "L-1", sstLicenseIssuer: "SS" }),
    insertArchive: async (value) => { if (opts.insertFail) throw new Error("insert"); const archive = { id: `archive-${state.archives.length + 1}`, ...value }; state.archives.push(archive); return archive; },
    deactivate: async (id, at) => { if (opts.deactivateFail) return false; const row = state.assignments.find((a) => a.id === id && a.isActive); if (!row) return false; row.isActive = false; row.unassignedAt = at; return true; },
    insertAssignment: async (value) => { const row = { id: `new-${state.assignments.length + 1}`, ...value }; state.assignments.push(row); return row; },
  };
  return { state, service: createLsoArchiveLifecycleService(deps), repo };
}
const assignment = (id = "a1", assignedAt = "2025-01-01T00:00:00Z") => ({ id, userId: "u1", companyId: "c1", isActive: true, assignedAt: new Date(assignedAt), externalLsoName: "LSO" });

test("idempotent retry does not regenerate/reupload and deactivates active row", async () => {
  let generated = 0; const h = harness([assignment()], { report: async () => { generated++; return Buffer.from("x"); } });
  await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-02-01") }]);
  h.state.assignments[0].isActive = true;
  await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-02-01") }]);
  assert.equal(generated, 1); assert.equal(h.state.uploads.length, 1); assert.equal(h.state.assignments[0].isActive, false);
});
test("inactive retry after two completed lifecycles returns current assignedAt/year/version archive", async () => {
  const h = harness([assignment()]);
  await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-01-15") }]);
  h.state.assignments[0].isActive = true; h.state.assignments[0].assignedAt = new Date("2025-02-01");
  await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-02-15") }]);
  const result = await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-02-15") }]);
  assert.equal(result[0].assignedAt.getTime(), new Date("2025-02-01").getTime());
  assert.equal(result[0].year, 2025); assert.equal(result[0].version, "1.0");
  const crossYear = await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2026-01-01") }]);
  assert.equal(crossYear[0].year, 2025); assert.equal(crossYear[0].assignedAt.getTime(), new Date("2025-02-01").getTime());
});
test("reactivation with a new assignedAt creates a distinct archive", async () => {
  const h = harness([assignment()]);
  await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-02-01") }]);
  h.state.assignments[0].isActive = true; h.state.assignments[0].assignedAt = new Date("2025-02-02");
  await h.service.terminate([{ assignmentId: "a1", terminatedAt: new Date("2025-02-03") }]);
  assert.equal(h.state.archives.length, 2); assert.equal(h.state.uploads.length, 2);
});
test("generation failure performs no insert or deactivation", async () => {
  const h = harness([assignment()], { report: async () => null });
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }])); assert.equal(h.state.archives.length, 0); assert.equal(h.state.assignments[0].isActive, true);
});
test("upload then insert failure compensates object and rolls back", async () => {
  const h = harness([assignment()], { insertFail: true });
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }])); assert.equal(h.state.deletes.length, 1); assert.equal(h.state.assignments[0].isActive, true);
});
test("upload then deactivation failure compensates object and rolls back", async () => {
  const h = harness([assignment()], { deactivateFail: true });
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }]));
  assert.equal(h.state.deletes.length, 1); assert.equal(h.state.assignments[0].isActive, true);
});
test("concurrent termination calls serialize to one upload/archive", async () => {
  const h = harness([assignment()]);
  await Promise.all([h.service.terminate([{ assignmentId: "a1" }]), h.service.terminate([{ assignmentId: "a1" }])]);
  assert.equal(h.state.uploads.length, 1); assert.equal(h.state.archives.length, 1); assert.equal(h.state.commits, 2);
});
test("replacement success archives old and inserts new; failure leaves old active", async () => {
  const h = harness([assignment()]);
  await h.service.replace("c1", [{ assignmentId: "a1" }], { userId: "u2", companyId: "c1", isActive: true });
  assert.equal(h.state.assignments[0].isActive, false); assert.equal(h.state.assignments.length, 2);
  const failed = harness([assignment()], { report: async () => null });
  await assert.rejects(failed.service.replace("c1", [{ assignmentId: "a1" }], { userId: "u2", companyId: "c1", isActive: true }));
  assert.equal(failed.state.assignments[0].isActive, true); assert.equal(failed.state.assignments.length, 1);
  const insertFailed = harness([assignment()], { insertFail: true });
  await assert.rejects(insertFailed.service.replace("c1", [{ assignmentId: "a1" }], { userId: "u2", companyId: "c1", isActive: true }));
  assert.equal(insertFailed.state.deletes.length, 1);
});
test("bulk termination is all-or-nothing", async () => {
  const h = harness([assignment("a1"), assignment("a2")], { report: async (_c, _y, _u, id) => id === "a2" ? null : Buffer.from("x") });
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }, { assignmentId: "a2" }])); assert.equal(h.state.archives.length, 0); assert.ok(h.state.assignments.every((a) => a.isActive));
});
test("authorization and exact LSO list scope", () => {
  const a = { lsoUserId: "u1", companyId: "c1" };
  assert.equal(canAccessLsoArchive({ id: "u1", role: "lso" }, a), true);
  assert.equal(canAccessLsoArchive({ id: "u2", role: "lso" }, a), false);
  assert.equal(canAccessLsoArchive({ id: "a", role: "admin", companyId: "c1" }, a, true), true);
  assert.equal(canAccessLsoArchive({ id: "a", role: "admin", companyId: "c2" }, a, true), false);
  assert.equal(canAccessLsoArchive({ id: "root", role: "superadmin" }, a), true);
  assert.deepEqual(archiveListScope({ id: "u1", role: "lso" }), { lsoUserId: "u1" });
  assert.deepEqual(archiveListScope({ id: "u1", role: "lso", companyId: "c1" }), { lsoUserId: "u1" });
});
test("strict attribution and exact assignment binding", () => {
  assert.equal(hasExactActiveAssignment({ id: "a", userId: "u", companyId: "c", isActive: true }, { assignmentId: "a", userId: "u", companyId: "c" }), true);
  assert.equal(hasExactActiveAssignment({ id: "a", userId: "u", companyId: "c", isActive: false }, { assignmentId: "a", userId: "u", companyId: "c" }), false);
  const context = { name: "Ana", license: "L1", assignedAt: "2025-01-01", unassignedAt: "2025-02-01" };
  assert.equal(isLsoAttributable({ name: "Ana", license: "L1", signedAt: "2025-01-15" }, context), true);
  assert.equal(isLsoAttributable({ name: "Ana", license: "", signedAt: "2025-01-15" }, context), false);
  assert.equal(isLsoAttributable({ name: "Ana", license: "L1", signedAt: "2025-03-01" }, context), false);
});
test("operational report decision and GPS aggregate interpretation are executable", () => {
  assert.equal(shouldRenderPesvOperationalSections(false), true);
  assert.deepEqual(interpretGpsAggregate({ total: "1000000", exceeded: "12" }), { total: 1000000, exceeded: 12 });
  assert.deepEqual(interpretGpsAggregate(undefined), { total: 0, exceeded: 0 });
});
test("failed compensation is durably queued without returning the object path", async () => {
  const jobs: any[] = []; const h = harness([assignment()], { insertFail: true, deleteFail: true, enqueueCleanup: async (path, reason) => { jobs.push({ objectPath: path, reason }); } });
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }]));
  assert.equal(jobs.length, 1);
  assert.equal(JSON.stringify({ queued: true }).includes(jobs[0].objectPath), false);
});
test("immediate compensation cannot delete a later retry object key", async () => {
  const uploaded: string[] = [];
  const options = { insertFail: true, uploaded };
  const h = harness([assignment()], options);
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }]));
  options.insertFail = false;
  await h.service.terminate([{ assignmentId: "a1" }]);
  assert.equal(uploaded.length, 2);
  assert.notEqual(uploaded[0], uploaded[1]);
  assert.deepEqual(h.state.deletes, [uploaded[0]]);
});
test("queued compensation is scoped to failed key and cannot delete committed retry key", async () => {
  const uploaded: string[] = []; const queued: string[] = [];
  const options = {
    insertFail: true, deleteFail: true, uploaded,
    enqueueCleanup: async (path: string) => { queued.push(path); },
  };
  const h = harness([assignment()], options);
  await assert.rejects(h.service.terminate([{ assignmentId: "a1" }]));
  options.insertFail = false; options.deleteFail = false;
  await h.service.terminate([{ assignmentId: "a1" }]);
  assert.equal(uploaded.length, 2); assert.equal(queued.length, 1);
  assert.equal(queued[0], uploaded[0]); assert.notEqual(queued[0], uploaded[1]);
});
test("cleanup reconciler completes referenced objects without deleting them", async () => {
  let removed = 0; let completed = 0;
  const cleanup = createLsoArchiveCleanupService({
    enqueue: async () => {}, listDue: async () => [{ id: "stored", objectPath: "private/stored.pdf", attempts: 0, status: "pending" }],
    remove: async () => { removed++; }, isReferenced: async () => true,
    complete: async () => { completed++; }, retry: async () => {}, now: () => new Date(),
  });
  await cleanup.reconcile();
  assert.equal(removed, 0); assert.equal(completed, 1);
});
test("cleanup reconciler retries, completes, and applies bounded exponential backoff", async () => {
  const jobs = [{ id: "j1", objectPath: "private/x", attempts: 0, status: "pending" }];
  let failures = 1; let completed = false; let retryAt: Date | undefined;
  const cleanup = createLsoArchiveCleanupService({
    enqueue: async () => {}, listDue: async () => jobs.filter((j) => !completed), isReferenced: async () => false,
    remove: async () => { if (failures--) throw new Error("temporary"); },
    complete: async () => { completed = true; }, retry: async (_id, attempts, next) => { jobs[0].attempts = attempts; retryAt = next; },
    now: () => new Date("2025-01-01T00:00:00Z"),
  });
  await cleanup.reconcile(); assert.equal(jobs[0].attempts, 1); assert.equal(retryAt?.getTime(), new Date("2025-01-01T00:01:00Z").getTime());
  await cleanup.reconcile(); assert.equal(completed, true);
});
test("company lock serializes activation and replacement while keeping multiple active rows", async () => {
  const h = harness([assignment("a1"), assignment("a2")]); const activation = createLsoAssignmentActivationService({ transaction: async (fn: any) => fn((h as any).repo), now: () => new Date("2025-03-01") });
  await h.service.replace("c1", [{ assignmentId: "a1" }], { userId: "u3", companyId: "c1", isActive: true });
  assert.equal(h.state.assignments.find((a) => a.id === "a1").isActive, false);
  assert.equal(h.state.assignments.find((a) => a.id === "a2").isActive, true);
  // Activation is a separate locked operation and does not deactivate other active assignments.
  await activation({ userId: "u4", companyId: "c1", isActive: true } as any);
  assert.equal(h.state.assignments.filter((a) => a.isActive).length, 3);
});