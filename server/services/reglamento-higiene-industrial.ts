import type { Company, InsertPoliticaSst } from "@shared/schema";

export const REGLAMENTO_HIGIENE_CODIGO = "RHSI-AUTO-001";

type ReglamentoSigner = {
  name: string;
  licenseNumber?: string;
};

function companyValue(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export function buildReglamentoHigieneIndustrial(
  company: Company,
  responsableSst: ReglamentoSigner,
  fechaEmision: Date,
): InsertPoliticaSst {
  const nextReview = new Date(fechaEmision);
  nextReview.setFullYear(nextReview.getFullYear() + 1);

  const empresa = companyValue(company.name, "Empresa no configurada");
  const nit = companyValue(company.nit, "No configurado");
  const direccion = companyValue(company.address, "No configurada");
  const ciudad = companyValue(company.city, "No configurada");
  const ciiu = companyValue(company.ciiuCode, "No configurado");
  const representante = companyValue(company.legalRepName, "Representante legal no configurado");
  const identificacionRepresentante = companyValue(company.legalRepId, "No configurada");
  const cargoRepresentante = companyValue(company.legalRepPosition, "Representante Legal");
  const telefono = companyValue(company.contactPhone, "No configurado");
  const correo = companyValue(company.contactEmail, "No configurado");
  const numeroTrabajadores = company.numberOfWorkers ?? 0;
  const nivelRiesgo = company.riskLevel || "No configurado";
  const alcanceObligacion = numeroTrabajadores >= 10
    ? `La empresa registra ${numeroTrabajadores} trabajadores y se encuentra dentro del supuesto del artículo 349 del Código Sustantivo del Trabajo para elaborar este reglamento.`
    : `La empresa registra ${numeroTrabajadores} trabajadores. Aunque el artículo 349 del Código Sustantivo del Trabajo establece la obligación para empleadores con diez (10) o más trabajadores permanentes, la empresa adopta este reglamento como instrumento preventivo del SG-SST.`;

  return {
    codigo: REGLAMENTO_HIGIENE_CODIGO,
    nombre: "Reglamento de Higiene y Seguridad Industrial",
    version: "1.0",
    fechaEmision,
    fechaProximaRevision: nextReview,
    estado: "vigente",
    declaracionCompromiso: `IDENTIFICACIÓN DEL EMPLEADOR

Razón social: ${empresa}
NIT: ${nit}
Dirección principal: ${direccion}
Ciudad: ${ciudad}
Teléfono: ${telefono}
Correo electrónico: ${correo}
Actividad económica principal (CIIU): ${ciiu}
Nivel de riesgo registrado: ${nivelRiesgo}
Número de trabajadores registrado: ${numeroTrabajadores}
Representante legal: ${representante}
Cargo: ${cargoRepresentante}

${empresa} adopta el presente Reglamento de Higiene y Seguridad Industrial para establecer las disposiciones de prevención, higiene y seguridad aplicables en sus centros y lugares de trabajo. El reglamento se integra al Sistema de Gestión de Seguridad y Salud en el Trabajo y se fundamenta en los artículos 348, 349 y 350 del Código Sustantivo del Trabajo, la Ley 962 de 2005, la Resolución 2400 de 1979, el Decreto 1072 de 2015 y las demás normas aplicables según la actividad económica y los peligros identificados.

${alcanceObligacion}

La eliminación del trámite de aprobación previa ante el Ministerio del Trabajo no exonera al empleador de elaborar, adoptar, divulgar y mantener disponible este reglamento cuando exista obligación legal o cuando se adopte voluntariamente.`,
    objetivos: JSON.stringify([
      "Cumplir las instrucciones, procedimientos y controles del SG-SST definidos para cada labor, área y nivel de riesgo.",
      "Mantener los lugares de trabajo en condiciones adecuadas de orden, aseo, iluminación, ventilación, higiene y seguridad.",
      "Usar, cuidar y conservar correctamente los elementos y equipos de protección personal suministrados.",
      "Informar inmediatamente incidentes, accidentes de trabajo, enfermedades, actos inseguros y condiciones peligrosas.",
      "Participar en inducciones, reinducciones, capacitaciones, simulacros, inspecciones y actividades de prevención.",
      "Operar máquinas, equipos, herramientas, vehículos y sustancias únicamente con autorización, competencia y controles definidos.",
      "Cumplir la señalización, demarcación, permisos de trabajo y procedimientos para tareas de alto riesgo.",
      "Aplicar las medidas de prevención de incendios, evacuación, primeros auxilios y respuesta ante emergencias.",
      "Proteger la salud propia y la de compañeros, contratistas, visitantes y demás personas presentes en los lugares de trabajo.",
    ]),
    alcance: `El presente reglamento aplica a todos los trabajadores, aprendices, practicantes, contratistas, subcontratistas, proveedores y visitantes de ${empresa}, en la sede principal ubicada en ${direccion}, ${ciudad}, y en los demás lugares donde se desarrollen actividades por cuenta o en representación de la empresa. Sus disposiciones se complementan con la matriz de peligros, los procedimientos de trabajo seguro, el plan de emergencias y los demás documentos vigentes del SG-SST.`,
    responsabilidades: JSON.stringify({
      altaDireccion: `${representante}, en calidad de ${cargoRepresentante}, debe adoptar y divulgar el reglamento, proporcionar condiciones de trabajo seguras y saludables, asignar recursos, implementar controles, suministrar elementos de protección personal y garantizar el funcionamiento y la mejora del SG-SST.`,
      responsableSst: `${responsableSst.name} debe coordinar la implementación, divulgación y actualización del reglamento; verificar su cumplimiento; orientar a trabajadores y contratistas; investigar incidentes y accidentes; y proponer controles acordes con los peligros de la empresa y su nivel de riesgo ${nivelRiesgo}.`,
      trabajadores: "Los trabajadores y demás personas cubiertas deben procurar el cuidado integral de su salud, suministrar información veraz sobre su estado de salud, cumplir normas y procedimientos, usar los elementos de protección personal, reportar peligros e incidentes y participar en las actividades del SG-SST.",
    }),
    compromisos: JSON.stringify([
      "Se prohíbe retirar, modificar, inutilizar o evadir guardas, dispositivos de seguridad, señalización o controles instalados.",
      "Se prohíbe operar equipos, máquinas, herramientas, vehículos o ejecutar tareas críticas sin autorización, formación o aptitud requerida.",
      "Se prohíbe presentarse o permanecer en el trabajo bajo efectos de alcohol o sustancias psicoactivas, conforme a la ley y a las políticas internas aplicables.",
      "Se prohíben juegos, riñas, bromas peligrosas y cualquier conducta que ponga en riesgo la integridad de las personas o las instalaciones.",
      "Es obligatorio reportar de inmediato todo incidente, accidente, emergencia, daño, fuga, derrame, condición insegura o síntoma relacionado con el trabajo.",
      "Es obligatorio usar los elementos de protección personal definidos para la tarea y devolverlos o solicitar su reposición cuando estén deteriorados.",
      "Es obligatorio respetar las rutas de evacuación, puntos de encuentro, equipos de emergencia y las instrucciones de brigadistas y responsables.",
      "Los contratistas y visitantes deben cumplir los controles de ingreso, inducción, acompañamiento y seguridad establecidos por la empresa.",
      "El incumplimiento será gestionado mediante el Reglamento Interno de Trabajo, los contratos aplicables y el debido proceso, sin crear sanciones no previstas en la ley.",
    ]),
    recursos: `${empresa} mantendrá los recursos humanos, físicos, técnicos y financieros necesarios para prevenir y controlar los riesgos. Esto incluye personal competente, elementos de protección personal, mantenimiento de instalaciones y equipos, señalización, botiquines, extintores, medios de comunicación, capacitación y preparación para emergencias. Ante una emergencia se deberán suspender las labores cuando sea necesario, activar los procedimientos establecidos, informar por los canales definidos y seguir las instrucciones de evacuación, atención y reporte.`,
    revisionComunicacion: `El reglamento entra en vigencia a partir de su firma y publicación. Debe permanecer disponible para trabajadores y partes interesadas, divulgarse durante la inducción y reinducción y publicarse en lugares visibles o medios internos accesibles. Se revisará como mínimo una vez al año y cuando cambien la actividad económica, las sedes, los procesos, la normativa, los peligros, el número de trabajadores o las condiciones de trabajo. Su actualización se realiza automáticamente desde la información vigente registrada en el sistema y genera una nueva fecha de emisión.`,
    representanteLegal: representante,
    cedulaRepresentante: identificacionRepresentante,
    responsableSst: responsableSst.name,
    licenciaSst: responsableSst.licenseNumber?.trim() || null,
    fechaFirma: fechaEmision,
    comunicada: 0,
    fechaComunicacion: null,
    observaciones: "Documento generado automáticamente con la información vigente de la empresa. No admite edición manual; debe regenerarse después de actualizar la configuración empresarial.",
    elaboradoPorId: null,
    autorizadoPorId: null,
    aprobadoPorId: null,
  };
}