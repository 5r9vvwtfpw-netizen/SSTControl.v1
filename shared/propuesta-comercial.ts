import { z } from "zod";

const textField = (label: string, max: number, required = false) =>
  z.string()
    .trim()
    .max(max, `${label}: máximo ${max} caracteres.`)
    .refine((value) => !/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/.test(value), `${label}: contiene caracteres no válidos.`)
    .refine((value) => !required || value.length > 0, `${label} es obligatorio.`);

export const propuestaComercialSchema = z.object({
  empresa: textField("Empresa destinataria", 120, true),
  nit: textField("NIT del cliente", 30),
  destinatario: textField("Destinatario", 120),
  ciudad: textField("Ciudad", 100),
  fechaEmision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha de emisión válida."),
  vigenciaDias: z.number().int().min(1).max(365),
  titulo: textField("Título del servicio", 140, true),
  objeto: textField("Objeto", 1200, true),
  alcance: textField("Alcance", 6000, true),
  entregables: textField("Entregables", 3000),
  condiciones: textField("Condiciones", 3000),
  aplicaIva: z.boolean(),
  tarifaIva: z.number().min(0).max(100),
  conceptos: z.array(z.object({
    descripcion: textField("Concepto", 180, true),
    periodicidad: textField("Periodicidad", 40, true),
    cantidad: z.number().min(0.01).max(100000),
    tarifa: z.number().min(0).max(1_000_000_000_000),
  })).min(1, "Agrega al menos un concepto.").max(8, "Puedes agregar máximo 8 conceptos."),
}).superRefine((proposal, ctx) => {
  if (!proposal.aplicaIva && proposal.tarifaIva !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tarifaIva"],
      message: "La tarifa de IVA debe ser 0 cuando no se aplica IVA.",
    });
  }
});

export type PropuestaComercialInput = z.infer<typeof propuestaComercialSchema>;

export const DEFAULT_PROPOSAL_SCOPE = [
  "Administración operativa de los módulos SG-SST y PESV incluidos en la suscripción vigente de la empresa.",
  "Actualización y organización de registros con base en la información y los soportes suministrados y validados por el cliente.",
  "Seguimiento a trabajadores, estándares, plan anual de trabajo, capacitaciones, inspecciones, EPP, incidentes, comités, auditorías, acciones pendientes y registros PESV, según los módulos contratados.",
  "Organización de cuentas individuales y accesos por rol para el equipo del cliente, dentro del cupo de usuarios de su plan.",
  "Preparación y revisión de los informes disponibles para la empresa. La radicación en plataformas oficiales se realiza con autorización previa del cliente y se entrega el soporte disponible.",
].join("\n");

export const DEFAULT_PROPOSAL_OBJECT =
  "Prestar un servicio complementario de gestión operativa de la plataforma SST-Colombia para apoyar al cliente en la administración y seguimiento de sus registros SG-SST y PESV, de acuerdo con la suscripción vigente y con la información que el cliente suministre y valide.";

export const DEFAULT_PROPOSAL_DELIVERABLES = [
  "Registros del software actualizados con la información validada por el cliente.",
  "Seguimiento de actividades y pendientes de los módulos contratados.",
  "Relación de informes preparados y, cuando exista autorización, constancia de radicación disponible.",
].join("\n");

export const DEFAULT_PROPOSAL_TERMS = [
  "Este servicio es adicional e independiente de la suscripción del software. La suscripción conserva su plan y valor vigente y se factura por separado.",
  "El cliente suministra y valida oportunamente la información, los soportes y las autorizaciones necesarios.",
  "La presentación de informes depende de la información disponible, de la aprobación del cliente y del acceso a las plataformas oficiales correspondientes.",
].join("\n");
