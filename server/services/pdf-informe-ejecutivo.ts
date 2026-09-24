// The JavaScript generator is shared with the standalone document-generation CLI.
import {
  generateInformeEjecutivoPdf,
  type InformeEjecutivoPdfInput,
} from "../../scripts/generate-sst-corbeta-report.js";

export async function generateInformeEjecutivoPdfForRecipients(
  input: InformeEjecutivoPdfInput,
): Promise<Buffer> {
  return generateInformeEjecutivoPdf(input);
}