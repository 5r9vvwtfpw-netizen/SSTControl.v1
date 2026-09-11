/**
 * Pure authorization and attribution rules for LSO management evidence.
 *
 * Keeping these rules independent of Drizzle/Express makes it possible to
 * regression-test the security boundary without connecting to a database.
 */
export type AssignmentBinding = {
  id: string;
  userId: string;
  companyId: string;
  isActive: boolean;
};

export function hasExactActiveAssignment(
  assignment: AssignmentBinding | null | undefined,
  expected: { assignmentId: string; userId: string; companyId: string },
): boolean {
  return !!assignment &&
    assignment.isActive === true &&
    assignment.id === expected.assignmentId &&
    assignment.userId === expected.userId &&
    assignment.companyId === expected.companyId;
}

export type AttributionRecord = {
  name?: string | null;
  license?: string | null;
  signedAt?: Date | string | null;
  userId?: string | null;
};

const normalized = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export function isLsoAttributable(
  record: AttributionRecord,
  expected: {
    name?: string | null;
    license?: string | null;
    userId?: string | null;
    assignedAt: Date | string;
    unassignedAt?: Date | string | null;
    now?: Date;
  },
): boolean {
  const name = normalized(record.name);
  const license = normalized(record.license);
  const expectedName = normalized(expected.name);
  const expectedLicense = normalized(expected.license);
  if (!name || !license || !expectedName || !expectedLicense ||
      name !== expectedName || license !== expectedLicense) return false;
  const signedAt = record.signedAt ? new Date(record.signedAt).getTime() : NaN;
  const starts = new Date(expected.assignedAt).getTime();
  const ends = new Date(expected.unassignedAt ?? expected.now ?? new Date()).getTime();
  return Number.isFinite(signedAt) && Number.isFinite(starts) && Number.isFinite(ends) &&
    signedAt >= starts && signedAt <= ends &&
    (!record.userId || !expected.userId || record.userId === expected.userId);
}

export type ArchivePrincipal = {
  id: string;
  role: string;
  companyId?: string | null;
};

export type ArchiveOwner = { lsoUserId?: string | null; companyId: string };

/** Archive access is deliberately narrower than general administrator access. */
export function canAccessLsoArchive(principal: ArchivePrincipal, archive: ArchiveOwner, canViewLicensedProfessionals = false): boolean {
  if (principal.role === "superadmin") return true;
  if (principal.role === "lso" || principal.role === "lso_externo") {
    return principal.id === archive.lsoUserId;
  }
  if (canViewLicensedProfessionals) {
    return !!principal.companyId && principal.companyId === archive.companyId;
  }
  return false;
}

export function archiveListScope(principal: ArchivePrincipal, canViewLicensedProfessionals = false):
  { lsoUserId?: string; companyId?: string } | null {
  if (principal.role === "superadmin") return principal.companyId ? { companyId: principal.companyId } : {};
  if (principal.role === "lso" || principal.role === "lso_externo") return { lsoUserId: principal.id };
  if (canViewLicensedProfessionals && principal.companyId) return { companyId: principal.companyId };
  return null;
}

/** Operational PESV domains are useful even when the annual score is absent. */
export const shouldRenderPesvOperationalSections = (_hasAnnualEvaluation: boolean) => true;

export function interpretGpsAggregate(row: { total?: unknown; exceeded?: unknown } | undefined) {
  return { total: Number(row?.total ?? 0), exceeded: Number(row?.exceeded ?? 0) };
}