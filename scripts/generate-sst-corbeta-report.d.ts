export interface InformeEjecutivoRecipient {
  name: string;
  nit?: string;
}

export interface InformeEjecutivoPdfInput {
  recipients: InformeEjecutivoRecipient[];
  professionalName?: string;
}

export function generateInformeEjecutivoPdf(input: InformeEjecutivoPdfInput): Promise<Buffer>;