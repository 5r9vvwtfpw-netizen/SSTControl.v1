import { z } from "zod";

const textField = (maxLength: number) =>
  z.string()
    .refine(value => !/[\u0000-\u001f\u007f-\u009f]/.test(value), "El campo contiene caracteres no permitidos.")
    .transform(value => value.trim())
    .pipe(z.string().max(maxLength, `El campo admite hasta ${maxLength} caracteres.`));

export const presentacionSgsstSchema = z.object({
  empresa: textField(120).pipe(z.string().min(1, "Ingresa la empresa destinataria.")),
  nit: textField(30).optional().default(""),
  destinatario: textField(120).optional().default(""),
  fechaEmision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha válida.")
    .refine(value => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Ingresa una fecha válida."),
}).strict();

export type PresentacionSgsstInput = z.infer<typeof presentacionSgsstSchema>;

export function presentacionSgsstFilename(empresa: string): string {
  const slug = empresa.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `Presentacion-SG-SST-${slug || "Empresa"}.pdf`;
}