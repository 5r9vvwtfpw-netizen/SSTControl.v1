/**
 * Finding Payload Adapter
 * 
 * Transforms the form data from FindingDialogSmart.tsx to ensure compatibility
 * with the backend API. The investigation_findings table has both 'description'
 * and 'finding_description' columns, so we need to populate both fields.
 */

interface FindingFormData {
  findingType: string;
  description: string;
  correctiveAction: string;
  responsibleName: string;
  responsibleArea?: string;
  dueDate: string;
}

interface AdaptedFindingPayload {
  findingType: string;
  finding_description: string; // Legacy field - must be populated
  description: string; // Current field - must be populated
  correctiveAction: string;
  responsibleName: string;
  responsibleArea?: string;
  dueDate: string;
}

/**
 * Adapts the finding form data to include both description fields
 * @param formData - The form data from FindingDialogSmart.tsx
 * @returns Adapted payload with both 'description' and 'finding_description' fields
 */
export function adaptFindingPayload(formData: FindingFormData): AdaptedFindingPayload {
  // Ensure description is not empty
  const description = (formData.description || "").trim();
  if (!description) {
    throw new Error("La descripción del hallazgo no puede estar vacía");
  }

  return {
    ...formData,
    finding_description: description, // Map to legacy field
    description: description, // Ensure current field is also populated
  };
}

/**
 * Validates that all required fields are present and not empty
 * @param payload - The adapted payload to validate
 * @returns true if valid, throws error if invalid
 */
export function validateFindingPayload(payload: AdaptedFindingPayload): boolean {
  const requiredFields: (keyof AdaptedFindingPayload)[] = [
    "findingType",
    "description",
    "finding_description",
    "correctiveAction",
    "responsibleName",
    "dueDate",
  ];

  for (const field of requiredFields) {
    const value = payload[field];
    if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
      throw new Error(`El campo ${field} es requerido y no puede estar vacío`);
    }
  }

  return true;
}
