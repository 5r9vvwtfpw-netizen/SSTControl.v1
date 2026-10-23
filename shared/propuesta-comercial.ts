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
  "Alcance del Servicio Integral (SG-SST y PESV)",
  "Administración de plataforma: Operación continua de los módulos SG-SST y PESV incluidos en la suscripción tecnológica vigente de la empresa.",
  "Gestión documental: Actualización y organización de registros en el sistema, trabajando exclusivamente con la información y los soportes suministrados y validados por el cliente.",
  "Seguimiento operativo: Monitoreo y control de la información de trabajadores, evaluación de estándares, plan anual de trabajo, capacitaciones, inspecciones, incidentes, comités, auditorías y acciones de mejora pendientes.",
  "Gestión de accesos: Configuración, organización y administración de cuentas individuales y permisos por rol para el equipo designado por el cliente.",
  "Radicaciones oficiales: Preparación y radicación oportuna de los informes reglamentarios ante las plataformas institucionales (ARL, Ministerio de Trabajo, SISI/PESV). Este proceso garantiza el cumplimiento en las fechas específicas y se ejecuta única y exclusivamente con la revisión y autorización previa del cliente.",
].join("\n");

export const DEFAULT_PROPOSAL_OBJECT =
  "Ejecutar la gestión operativa y documental dentro de la plataforma SST-Colombia como servicio complementario a la suscripción tecnológica vigente. El objetivo es administrar y realizar el seguimiento continuo de los registros correspondientes al SG-SST y el PESV, operando de manera exclusiva con la información, evidencias y parámetros que el cliente suministre y valide previamente.";

export const DEFAULT_PROPOSAL_DELIVERABLES = [
  "Credenciales:",
  "1.Gerencia: para las auditorias.",
  "2.Mecánicos: para el mantenimiento de vehículos y maquinaria.",
  "3. Inspecciones: para los vigias/brigadistas",
  "4. Actas: del SST y PESV.",
  "5. EPP: para entrega de dotaciones",
].join("\n");

export const DEFAULT_PROPOSAL_TERMS = [
  "Condiciones del Servicio",
  "Independencia: Este servicio operativo es adicional e independiente; la suscripción del software conserva su plan y valor tarifario vigente.",
  "Responsabilidad de la información: La ejecución efectiva del servicio requiere que el cliente suministre y valide de manera oportuna todos los datos, soportes y autorizaciones.",
  "Radicación de informes: La presentación ante entidades oficiales está estrictamente sujeta a la información suministrada, la disponibilidad de acceso a las plataformas institucionales y la aprobación expresa de la alta gerencia del cliente.",
].join("\n");
