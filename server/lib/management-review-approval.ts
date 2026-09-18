export interface ManagementReviewEvidenceCounts {
  participants: number;
  topics: number;
  decisions: number;
}

export type ManagementReviewApprovalValidation =
  | { valid: true }
  | { valid: false; error: string };

/**
 * A management review cannot be approved until its minimum evidence exists.
 * Keep this policy independent from HTTP and storage so it can be tested
 * without connecting to a database.
 */
export function validateManagementReviewApproval(
  evidence: ManagementReviewEvidenceCounts,
): ManagementReviewApprovalValidation {
  if (evidence.participants === 0) {
    return {
      valid: false,
      error: "La revisión debe tener al menos un participante antes de aprobarse",
    };
  }

  if (evidence.topics === 0) {
    return {
      valid: false,
      error: "La revisión debe tener al menos una entrada o tema documentado antes de aprobarse",
    };
  }

  if (evidence.decisions === 0) {
    return {
      valid: false,
      error: "La revisión debe tener al menos una decisión documentada antes de aprobarse",
    };
  }

  return { valid: true };
}