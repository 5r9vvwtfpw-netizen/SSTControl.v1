import { db } from "./db";
import * as schema from "@shared/schema";
import { sql, eq, desc } from "drizzle-orm";
import { pricingConfig } from "../pricing_plugin/schema";

// Datos maestros de componentes SST según Resolución 0312/2019
const componentesSst = [
  {
    id: "comp-sst-1",
    numero: 1,
    nombre: "Recursos",
    descripcion: "Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST)",
    pesoTotal: 10, // 10% del total
    orden: 1,
  },
  {
    id: "comp-sst-2",
    numero: 2,
    nombre: "Gestión Integral del Sistema de Gestión de la Seguridad y Salud en el Trabajo",
    descripcion: "Política, objetivos, evaluación inicial, plan de trabajo anual y conservación de documentos",
    pesoTotal: 15, // 15% del total
    orden: 2,
  },
  {
    id: "comp-sst-3",
    numero: 3,
    nombre: "Gestión de la Salud",
    descripcion: "Condiciones de salud en el trabajo, registro y reporte de condiciones de trabajo y de salud, mecanismos de vigilancia de las condiciones de salud de los trabajadores",
    pesoTotal: 20, // 20% del total
    orden: 3,
  },
  {
    id: "comp-sst-4",
    numero: 4,
    nombre: "Gestión de Peligros y Riesgos",
    descripcion: "Identificación de peligros, evaluación y valoración de riesgos, medidas de prevención y control",
    pesoTotal: 30, // 30% del total
    orden: 4,
  },
  {
    id: "comp-sst-5",
    numero: 5,
    nombre: "Gestión de Amenazas",
    descripcion: "Plan de prevención, preparación y respuesta ante emergencias",
    pesoTotal: 10, // 10% del total
    orden: 5,
  },
  {
    id: "comp-sst-6",
    numero: 6,
    nombre: "Verificación del SG-SST",
    descripcion: "Gestión y resultados del SG-SST (auditoría y revisión por la alta dirección)",
    pesoTotal: 5, // 5% del total
    orden: 6,
  },
  {
    id: "comp-sst-7",
    numero: 7,
    nombre: "Mejoramiento",
    descripcion: "Acciones preventivas y correctivas con base en los resultados del SG-SST",
    pesoTotal: 10, // 10% del total
    orden: 7,
  },
];

// Estándares mínimos SST según Resolución 0312/2019 - Artículo 16
// 61 estándares mínimos organizados en 7 componentes
// Puntajes multiplicados por 10 (0.5% = 5 puntos, 1% = 10 puntos, etc.)
// null = no aplica para ese tipo de empresa
const estandaresSst = [
  // ============================================================================
  // COMPONENTE 1: RECURSOS (10%)
  // ============================================================================
  {
    id: "std-1.1.1",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.1",
    nombre: "Asignación del responsable del SG SST",
    descripcion: "Asignar una persona que cumpla con el siguiente perfil: El diseño e implementación del Sistema de Gestión de SST podrá ser realizado por profesionales en SST, profesionales con posgrado en SST que cuenten con licencia en Seguridad y Salud en el Trabajo vigente y que acrediten la aprobación del curso de capacitación virtual de cincuenta (50) horas.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 1; Resolución 4927 de 2016",
    puntajeTipo1: 5,
    puntajeTipo2: 1,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Documento soporte de la asignación y target de horas y funciones; Certificado de aprobación del curso de cincuenta (50) horas en SST",
    orden: 1,
  },
  {
    id: "std-1.1.2",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.2",
    nombre: "Asignación de responsabilidades en SST",
    descripcion: "Asignar y documentar las responsabilidades específicas en el Sistema de Gestión SST a todos los niveles de la organización, incluida la alta dirección.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 2",
    puntajeTipo1: null,
    puntajeTipo2: 1,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Soportes de la asignación de las responsabilidades en SST",
    orden: 2,
  },
  {
    id: "std-1.1.3",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.3",
    nombre: "Asignación de recursos para SG-SST",
    descripcion: "Asignar recursos económicos, técnicos y el personal necesario para el diseño, implementación, revisión evaluación y mejora de las medidas de prevención y control, para la gestión eficaz de los peligros y riesgos en el lugar de trabajo.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 4",
    puntajeTipo1: null,
    puntajeTipo2: 1,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Documento soporte con la asignación y disponibilidad de recursos",
    orden: 3,
  },
  {
    id: "std-1.1.4",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.4",
    nombre: "Afiliación al Sistema de Seguridad Social Integral",
    descripcion: "Garantizar que todos los trabajadores, independientemente de su forma de vinculación o contratación están afiliados al Sistema General de Riesgos Laborales.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.2.2.6; Ley 1562 de 2012",
    puntajeTipo1: 5,
    puntajeTipo2: 1,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Soportes de afiliación a la ARL de todos los trabajadores",
    orden: 4,
  },
  {
    id: "std-1.1.5",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.5",
    nombre: "Identificación de trabajadores que se dediquen en forma permanente a actividades de alto riesgo y cotización de pensión especial",
    descripcion: "Identificar los trabajadores que se dediquen en forma permanente al ejercicio de las actividades de alto riesgo establecidas en el Decreto 2090 de 2003 o de las normas que lo adicionen, modifiquen o complementen y cotizar el monto establecido en la norma.",
    marcoLegal: "Decreto 2090 de 2003; Decreto 1072 de 2015",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Soportes del pago de aportes al Sistema General de Pensiones por actividades de alto riesgo",
    orden: 5,
  },
  {
    id: "std-1.1.6",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.6",
    nombre: "Conformación COPASST / Vigía",
    descripcion: "Conformar y garantizar el funcionamiento del Comité Paritario de Seguridad y Salud en el Trabajo – COPASST (empresas con 10 o más trabajadores) o el Vigía en Seguridad y Salud en el Trabajo (empresas con menos de 10 trabajadores).",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 9; Resolución 2013 de 1986",
    puntajeTipo1: null,
    puntajeTipo2: 2,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Acta de conformación del COPASST o documento de designación del Vigía SST; Actas de reuniones del COPASST o soportes de gestión del Vigía",
    orden: 6,
  },
  {
    id: "std-1.1.7",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.7",
    nombre: "Capacitación COPASST / Vigía",
    descripcion: "Garantizar que todos los integrantes del COPASST o el Vigía de SST reciban una capacitación de mínimo veinte (20) horas en Seguridad y Salud en el Trabajo.",
    marcoLegal: "Decreto 1072 de 2015; Resolución 2013 de 1986",
    puntajeTipo1: null,
    puntajeTipo2: 2,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Certificados de capacitación de mínimo 20 horas en SST para los integrantes del COPASST o Vigía",
    orden: 7,
  },
  {
    id: "std-1.1.8",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.1.8",
    nombre: "Conformación Comité de Convivencia Laboral",
    descripcion: "Conformar y garantizar el funcionamiento del Comité de Convivencia Laboral de acuerdo con la normatividad vigente.",
    marcoLegal: "Resolución 652 de 2012; Resolución 1356 de 2012",
    puntajeTipo1: null,
    puntajeTipo2: 2,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Acta de conformación del Comité de Convivencia Laboral; Actas de reuniones trimestrales del Comité",
    orden: 8,
  },
  {
    id: "std-1.2.1",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.2.1",
    nombre: "Programa de capacitación anual",
    descripcion: "Elaborar y ejecutar el programa de capacitación anual en promoción y prevención, que incluya lo referente a los peligros/riesgos prioritarios y las medidas de prevención y control, extensivo a todos los niveles de la organización.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.11",
    puntajeTipo1: 15,
    puntajeTipo2: 2,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Programa de capacitación anual y ejecutoria del mismo; Registro de asistencia de los trabajadores",
    orden: 9,
  },
  {
    id: "std-1.2.2",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.2.2",
    nombre: "Inducción y reinducción en SST",
    descripcion: "Realizar la inducción y reinducción en los aspectos generales y específicos de las actividades por realizar que incluya entre otros, la identificación de peligros y control de los riesgos en su trabajo, y la prevención de accidentes de trabajo y enfermedades laborales.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.11",
    puntajeTipo1: 2,
    puntajeTipo2: 2,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Registros de inducción y reinducción en SST; Contenido de la inducción y reinducción",
    orden: 10,
  },
  {
    id: "std-1.2.3",
    activo: 1,
    componenteId: "comp-sst-1",
    numeroEstandar: "1.2.3",
    nombre: "Curso Virtual de capacitación de cincuenta (50) horas en SST",
    descripcion: "El responsable del SG-SST debe realizar un curso de capacitación virtual de cincuenta (50) horas sobre el Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.",
    marcoLegal: "Resolución 4927 de 2016; Decreto 1072 de 2015",
    puntajeTipo1: null,
    puntajeTipo2: 2,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Solicitar el certificado de aprobación del curso de capacitación virtual de cincuenta (50) horas en SST definido por el Ministerio del Trabajo, expedido a nombre del responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo.",
    orden: 11,
  },

  // ============================================================================
  // COMPONENTE 2: GESTIÓN INTEGRAL DEL SG-SST (15%)
  // ============================================================================
  {
    id: "std-2.1.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.1.1",
    nombre: "Política de Seguridad y Salud en el Trabajo",
    descripcion: "Establecer por escrito la Política de Seguridad y Salud en el Trabajo y comunicarla al Comité Paritario de Seguridad y Salud en el Trabajo - COPASST o al Vigía de Seguridad y Salud en el Trabajo.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.5 y 2.2.4.6.6",
    puntajeTipo1: null,
    puntajeTipo2: 3,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Solicitar la política del Sistema de Gestión de SST de la empresa y confirmar que cumpla con los aspectos contenidos en el criterio. Validar para la revisión anual de la política como mínimo: fecha de emisión, firmada por el representante legal actual, que estén incluidos los requisitos normativos actuales. Entrevistar a los miembros del COPASST para indagar el conocimiento de la política en SST.",
    orden: 12,
  },
  {
    id: "std-2.2.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.2.1",
    nombre: "Objetivos de SST",
    descripcion: "Definir los objetivos del SG-SST de conformidad con la política de SST, los cuales deben ser claros, medibles, cuantificables y tener metas, coherentes con el plan de trabajo anual, compatibles con la normatividad vigente.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.7 y 2.2.4.6.18",
    puntajeTipo1: null,
    puntajeTipo2: 3,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Objetivos del SG-SST documentados; Indicadores de cumplimiento de los objetivos",
    orden: 13,
  },
  {
    id: "std-2.3.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.3.1",
    nombre: "Evaluación Inicial del Sistema de Gestión",
    descripcion: "Realizar la evaluación inicial del Sistema de Gestión de SST, identificando las prioridades para establecer el plan de trabajo anual o para la actualización del existente.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.16",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Evaluación inicial del SG-SST; Identificación de prioridades en SST; Autoevaluación de estándares mínimos",
    orden: 14,
  },
  {
    id: "std-2.4.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.4.1",
    nombre: "Plan Anual de Trabajo",
    descripcion: "Diseñar y definir un plan de trabajo anual para alcanzar cada uno de los objetivos, en el que se especifiquen metas, actividades claras para su desarrollo, responsables, cronograma y recursos necesarios.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 7 y 2.2.4.6.17",
    puntajeTipo1: 10,
    puntajeTipo2: 3,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Plan de trabajo anual firmado por el empleador; Cronograma de actividades; Asignación de recursos y responsables",
    orden: 15,
  },
  {
    id: "std-2.5.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.5.1",
    nombre: "Archivo y retención documental del Sistema de Gestión de SST",
    descripcion: "Mantener disponibles y debidamente actualizados todos los documentos que soportan el SG-SST y garantizar la conservación de los mismos de conformidad con la normatividad vigente.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.13",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Sistema de archivo y retención documental del SG-SST; Procedimiento de control de documentos",
    orden: 16,
  },
  {
    id: "std-2.6.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.6.1",
    nombre: "Rendición de cuentas",
    descripcion: "Realizar anualmente la rendición de cuentas del desarrollo del SG-SST, que incluya a todos los niveles de la empresa.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 3",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Documento de rendición de cuentas anual; Evidencia de participación de los diferentes niveles",
    orden: 17,
  },
  {
    id: "std-2.7.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.7.1",
    nombre: "Matriz legal",
    descripcion: "Identificar la normatividad vigente en materia de SST, el Sistema General de Riesgos Laborales y mantenerla actualizada.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 5",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Matriz legal actualizada; Procedimiento de identificación y actualización de requisitos legales",
    orden: 18,
  },
  {
    id: "std-2.8.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.8.1",
    nombre: "Mecanismos de comunicación",
    descripcion: "Establecer mecanismos eficaces para recibir y dar respuesta a las comunicaciones internas y externas relativas a la SST, así como para disponer de canales que permitan recolectar inquietudes, ideas y aportes de los trabajadores.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.14",
    puntajeTipo1: 1,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Mecanismos de comunicación implementados; Registros de comunicaciones internas y externas en SST",
    orden: 19,
  },
  {
    id: "std-2.9.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.9.1",
    nombre: "Identificación y evaluación para la adquisición de bienes y servicios",
    descripcion: "Establecer un procedimiento para la identificación y evaluación de las especificaciones en SST de las compras o adquisición de productos y servicios de proveedores y contratistas.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.27",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 0,
    puntajeTipo4: 0,
    criteriosVerificacion: "Procedimiento de adquisiciones con criterios de SST; Especificaciones técnicas de SST en compras",
    orden: 20,
  },
  {
    id: "std-2.10.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.10.1",
    nombre: "Evaluación y selección de proveedores y contratistas",
    descripcion: "Establecer los aspectos de SST que podrá tener en cuenta la empresa en la evaluación y selección de proveedores y contratistas.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.28",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Procedimiento de evaluación y selección de proveedores y contratistas con criterios de SST; Registros de evaluación",
    orden: 21,
  },
  {
    id: "std-2.11.1",
    activo: 1,
    componenteId: "comp-sst-2",
    numeroEstandar: "2.11.1",
    nombre: "Gestión del cambio",
    descripcion: "Disponer de un procedimiento para evaluar el impacto sobre la SST que puedan generar los cambios internos o externos.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.26",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 0,
    puntajeTipo4: 0,
    criteriosVerificacion: "Procedimiento de gestión del cambio; Registros de análisis de cambios y su impacto en SST",
    orden: 22,
  },

  // ============================================================================
  // COMPONENTE 3: GESTIÓN DE LA SALUD (20%)
  // ============================================================================
  {
    id: "std-3.1.1",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.1",
    nombre: "Descripción sociodemográfica y Diagnóstico de las condiciones de salud de los trabajadores",
    descripcion: "Realizar las evaluaciones médicas ocupacionales de acuerdo con la normatividad y los peligros/riesgos a los cuales se encuentre expuesto el trabajador.",
    marcoLegal: "Resolución 2346 de 2007; Decreto 1072 de 2015, artículo 2.2.4.6.24",
    puntajeTipo1: null,
    puntajeTipo2: 5,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Conceptos de aptitud de evaluaciones médicas ocupacionales; Profesiogramas actualizados",
    orden: 23,
  },
  {
    id: "std-3.1.2",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.2",
    nombre: "Actividades de medicina del trabajo y de prevención y promoción de la Salud",
    descripcion: "Desarrollar actividades de promoción de la salud y prevención de accidentes de trabajo y enfermedades laborales.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 8",
    puntajeTipo1: null,
    puntajeTipo2: 5,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Programa de promoción y prevención; Registros de actividades desarrolladas",
    orden: 24,
  },
  {
    id: "std-3.1.3",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.3",
    nombre: "Perfiles de cargos",
    descripcion: "Informar al médico que realiza las evaluaciones ocupacionales los perfiles de cargo con una descripción de las tareas y el medio en el cual se desarrollará la labor respectiva.",
    marcoLegal: "Resolución 2346 de 2007; Decreto 1072 de 2015",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Perfiles de cargo con descripción de tareas y riesgos; Comunicación al médico de los perfiles",
    orden: 25,
  },
  {
    id: "std-3.1.4",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.4",
    nombre: "Evaluaciones médicas ocupacionales, pre ingreso, periodicos",
    descripcion: "Realizar los exámenes médicos ocupacionales de ingreso, periódicos conforme a lo establecido en la normatividad y los riesgos a los que están expuestos los trabajadores.",
    marcoLegal: "Resolución 2346 de 2007; Resolución 1918 de 2009",
    puntajeTipo1: 15,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Registros de exámenes médicos de ingreso y periódicos; Cronograma de exámenes periódicos",
    orden: 26,
  },
  {
    id: "std-3.1.5",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.5",
    nombre: "Custodia de Historias Clínicas",
    descripcion: "Tener la custodia de las historias clínicas a cargo de una institución prestadora de servicios en SST o del médico que practica los exámenes laborales.",
    marcoLegal: "Resolución 2346 de 2007; Resolución 1918 de 2009",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Certificado de custodia de historias clínicas; Contrato con IPS para custodia de historias",
    orden: 27,
  },
  {
    id: "std-3.1.6",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.6",
    nombre: "Restricciones y recomendaciones médico laborales",
    descripcion: "Acatar las restricciones y recomendaciones médico laborales realizadas por parte de la Entidad Promotora de Salud (EPS) o Administradora de Riesgos Laborales (ARL).",
    marcoLegal: "Decreto 1072 de 2015; Ley 776 de 2002",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Registros de restricciones y recomendaciones médicas; Soportes de seguimiento a recomendaciones",
    orden: 28,
  },
  {
    id: "std-3.1.7",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.7",
    nombre: "Estilos de vida y entornos saludables (controles tabaquismo, alcoholismo, farmacodependencia y otros)",
    descripcion: "Elaborar y ejecutar un programa para promover entre los trabajadores estilos de vida saludables.",
    marcoLegal: "Decreto 1072 de 2015; Resolución 1075 de 1992; Ley 1335 de 2009",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Programa de estilos de vida saludables; Política de prevención de consumo de sustancias psicoactivas",
    orden: 29,
  },
  {
    id: "std-3.1.8",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.8",
    nombre: "Servicios de higiene agua potable, servicios sanitarios y disposición de basuras",
    descripcion: "Contar con un suministro permanente de agua potable, servicios sanitarios y mecanismos para disposición de excretas y de basuras en las instalaciones de la empresa.",
    marcoLegal: "Resolución 2400 de 1979; Decreto 1072 de 2015",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Certificado de potabilidad del agua; Verificación de servicios sanitarios; Plan de gestión de residuos",
    orden: 30,
  },
  {
    id: "std-3.1.9",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.1.9",
    nombre: "Manejo de residuos Eliminación adecuada de residuos sólidos, líquidos o gaseosos",
    descripcion: "Eliminar de forma segura los residuos sólidos, líquidos o gaseosos que se originen en los lugares de trabajo, de acuerdo con la normatividad vigente.",
    marcoLegal: "Decreto 4741 de 2005; Resolución 1164 de 2002; Decreto 1076 de 2015",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Plan de gestión integral de residuos; Registros de disposición de residuos peligrosos",
    orden: 31,
  },
  {
    id: "std-3.2.1",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.2.1",
    nombre: "Reporte de los accidentes de trabajo y enfermedad laboral a la ARL, EPS y Dirección Territorial del Ministerio de Trabajo",
    descripcion: "Reportar a la Administradora de Riesgos Laborales (ARL), Entidad Promotora de Salud (EPS) y la Dirección Territorial del Ministerio del Trabajo los accidentes de trabajo y enfermedades laborales.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.1.6; Resolución 156 de 2005",
    puntajeTipo1: null,
    puntajeTipo2: 5,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "FURAT diligenciados y radicados; Registros de reporte de enfermedades laborales",
    orden: 32,
  },
  {
    id: "std-3.2.2",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.2.2",
    nombre: "Investigación de Accidentes, Incidentes y Enfermedad Laboral",
    descripcion: "Investigar los accidentes de trabajo y enfermedades laborales, determinando las causas básicas e inmediatas y la posibilidad que se presenten nuevos casos.",
    marcoLegal: "Resolución 1401 de 2007; Decreto 1072 de 2015, artículo 2.2.4.6.32",
    puntajeTipo1: null,
    puntajeTipo2: 5,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Informes de investigación de accidentes e incidentes; Análisis de causalidad; Planes de acción",
    orden: 33,
  },
  {
    id: "std-3.2.3",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.2.3",
    nombre: "Registro y análisis estadístico de Incidentes, Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Llevar registro estadístico de los accidentes de trabajo, enfermedades laborales e incidentes que ocurren, y analizar este registro para identificar tendencias, causas o patrones.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Base de datos de accidentalidad; Análisis estadístico de accidentes; Informes de tendencias",
    orden: 34,
  },
  {
    id: "std-3.3.1",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.3.1",
    nombre: "Frecuencia de accidentalidad ,Medición de la severidad de los Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Medir la severidad de los accidentes de trabajo como mínimo una vez al año y realizar la clasificación del origen del peligro/riesgo que los generó.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Cálculo del índice de severidad; Análisis de severidad por tipo de lesión",
    orden: 35,
  },
  {
    id: "std-3.3.2",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.3.2",
    nombre: "Severidad de accidentalidad, Medición de la frecuencia de los Incidentes, Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Medir la frecuencia de los incidentes, accidentes de trabajo y enfermedad laboral como mínimo una vez al año.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Cálculo del índice de frecuencia; Análisis de frecuencia por área y proceso",
    orden: 36,
  },
  {
    id: "std-3.3.3",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.3.3",
    nombre: "Medición de la mortalidad de Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Medir la mortalidad por accidentes de trabajo y enfermedades laborales como mínimo una vez al año.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Cálculo del índice de mortalidad; Análisis de eventos mortales",
    orden: 37,
  },
  {
    id: "std-3.3.4",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.3.4",
    nombre: "Medición de la prevalencia de incidentes, Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Medir la prevalencia de la enfermedad laboral como mínimo una vez al año.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Cálculo de la prevalencia de enfermedad laboral; Análisis por tipo de enfermedad",
    orden: 38,
  },
  {
    id: "std-3.3.5",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.3.5",
    nombre: "Medición de la incidencia de Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Medir la incidencia de la enfermedad laboral como mínimo una vez al año.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Cálculo de la incidencia de enfermedad laboral; Análisis de nuevos casos",
    orden: 39,
  },
  {
    id: "std-3.3.6",
    activo: 1,
    componenteId: "comp-sst-3",
    numeroEstandar: "3.3.6",
    nombre: "Medición del ausentismo por incidentes, Accidentes de Trabajo y Enfermedad Laboral",
    descripcion: "Medir el ausentismo por incidentes, accidentes de trabajo y enfermedad laboral como mínimo una vez al año.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Cálculo del índice de ausentismo laboral; Análisis de días perdidos por causa",
    orden: 40,
  },

  // ============================================================================
  // COMPONENTE 4: GESTIÓN DE PELIGROS Y RIESGOS (30%)
  // ============================================================================
  {
    id: "std-4.1.1",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.1.1",
    nombre: "Metodología para identificación de peligros, evaluación y valoración de riesgos",
    descripcion: "Definir y aplicar una metodología para la identificación de peligros y evaluación y valoración de los riesgos de origen físico, ergonómico o biomecánico, biológico, químico, de seguridad, público, psicosocial, entre otros.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.15; GTC 45",
    puntajeTipo1: 30,
    puntajeTipo2: 15,
    puntajeTipo3: 4,
    puntajeTipo4: 4,
    criteriosVerificacion: "Matriz de identificación de peligros, evaluación y valoración de riesgos actualizada; Metodología utilizada (GTC 45 u otra)",
    modoVerificacion: "Solicitar el documento que contiene la metodología. Verificar que se realiza la identificación de peligros, evaluación y valoración de los riesgos conforme a la metodología definida de acuerdo con el criterio y con la participación de los trabajadores, seleccionando de manera aleatoria algunas de las actividades identificadas. Confrontar mediante observación directa durante el recorrido a las instalaciones de la empresa la identificación de peligros.",
    orden: 41,
  },
  {
    id: "std-4.1.2",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.1.2",
    nombre: "Identificación de peligros con participación de todos los niveles de la empresa",
    descripcion: "Realizar la identificación de peligros y evaluación y valoración de los riesgos con participación de los trabajadores de todos los niveles de la empresa.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.15, parágrafo 1",
    puntajeTipo1: null,
    puntajeTipo2: 15,
    puntajeTipo3: 4,
    puntajeTipo4: 4,
    criteriosVerificacion: "Registros de participación de trabajadores en identificación de peligros; Actas de reuniones con trabajadores",
    modoVerificacion: "Realizar la identificación de peligros y evaluación y valoración de los riesgos con participación de los trabajadores de todos los niveles de la empresa y actualizarla como mínimo una (1) vez al año y cada vez que ocurra un accidente de trabajo mortal o un evento catastrófico en la empresa o cuando se presenten cambios en los procesos, en las instalaciones, o maquinaria o equipos.",
    orden: 42,
  },
  {
    id: "std-4.1.3",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.1.3",
    nombre: "Identificación de sustancias catalogadas como carcinógenas o con toxicidad aguda.",
    descripcion: "Identificar la naturaleza de los peligros, priorizando los cancerígenos, tóxicos para la reproducción, neurotóxicos, inmunológicos, dermatotóxicos, sensibilizantes, genotóxicos, entre otros.",
    marcoLegal: "Decreto 1072 de 2015; Resolución 0312 de 2019; Ley 55 de 1993",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Matriz de sustancias químicas con clasificación de peligrosidad; Priorización de sustancias cancerígenas",
    orden: 43,
  },
  {
    id: "std-4.1.4",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.1.4",
    nombre: "Mediciones ambientales, químicos, físicos y biológicos",
    descripcion: "Realizar mediciones ambientales cuando se requiera según la priorización de los riesgos, para dar cumplimiento a la identificación de peligros y valoración de riesgos.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.15; Resolución 2400 de 1979",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 4,
    puntajeTipo4: 4,
    criteriosVerificacion: "Informes de mediciones ambientales (ruido, iluminación, material particulado, etc.); Estudios higiénicos",
    modoVerificacion: "Verificar los soportes documentales de las mediciones ambientales realizadas y la remisión de estos resultados al Comité Paritario de Seguridad y Salud en el Trabajo. Se debe evidenciar: informes técnicos de mediciones de factores de riesgo higiénicos (ruido, iluminación, material particulado, vapores, gases, temperaturas extremas, vibraciones, etc.), estudios de higiene industrial realizados por personal competente, y constancia de socialización de resultados con el COPASST o Vigía SST. Este estándar está relacionado con el estándar 1.1.6 (Conformación COPASST/Vigía).",
    orden: 44,
  },
  {
    id: "std-4.2.1",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.2.1",
    nombre: "Medidas de prevención y control frente a peligros/riesgos identificados",
    descripcion: "Ejecutar las medidas de prevención y control según la jerarquía de controles (eliminación, sustitución, controles de ingeniería, controles administrativos, equipos y elementos de protección personal y colectivo).",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.24",
    puntajeTipo1: 20,
    puntajeTipo2: null,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Evidencia de implementación de controles; Seguimiento a la efectividad de controles",
    modoVerificacion: "Solicitar evidencias de la ejecución de las medidas de prevención y control, de acuerdo con el esquema de jerarquización y la identificación de los peligros, la evaluación y valoración de los riesgos realizada. Constatar que estas medidas se encuentran programadas en el plan anual de trabajo. Verificar que efectivamente se dio prioridad a las medidas de prevención y control frente a los peligros/riesgos identificados como prioritarios.",
    orden: 45,
  },
  {
    id: "std-4.2.2",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.2.2",
    nombre: "Aplicación de medidas de prevención y control por parte de los trabajadores",
    descripcion: "Verificar la aplicación por parte de la empresa de las medidas de prevención y control.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.24",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Registros de verificación de controles implementados; Listas de chequeo de control operacional",
    orden: 46,
  },
  {
    id: "std-4.2.3",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.2.3",
    nombre: "Procedimientos e instructivos internos de seguridad y salud en el trabajo instructivos, fichas, protocolos",
    descripcion: "Elaborar procedimientos, instructivos y fichas técnicas de seguridad para las tareas de alto riesgo y de actividades rutinarias.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.24",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Procedimientos de trabajo seguro; Instructivos operacionales; Fichas de seguridad de productos químicos",
    orden: 47,
  },
  {
    id: "std-4.2.4",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.2.4",
    nombre: "Inspecciones a instalaciones, maquinaria o equipos",
    descripcion: "Realizar inspecciones sistemáticas a las instalaciones, maquinaria o equipos con la participación del COPASST o Vigía de SST.",
    marcoLegal: "Decreto 1072 de 2015; Resolución 2013 de 1986",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Actas de inspección con participación del COPASST o Vigía; Cronograma de inspecciones",
    orden: 48,
  },
  {
    id: "std-4.2.5",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.2.5",
    nombre: "Mantenimiento periódico de instalaciones, equipos, máquinas, herramientas",
    descripcion: "Realizar el mantenimiento periódico de instalaciones, equipos, máquinas y herramientas, de acuerdo con los manuales de uso y los informes de las inspecciones realizadas.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.24; Resolución 2400 de 1979",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Programa de mantenimiento preventivo y correctivo; Registros de mantenimiento de equipos críticos",
    orden: 49,
  },
  {
    id: "std-4.2.6",
    activo: 1,
    componenteId: "comp-sst-4",
    numeroEstandar: "4.2.6",
    nombre: "Entrega de Elementos de Protección Personal EPP y capacitacion en uso adecuado, se verifica con contratistas y subcontratistas",
    descripcion: "Suministrar a los trabajadores los elementos de protección personal que se requieran y verificar que sean utilizados, incluyendo los trabajadores en misión y contratistas.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.24; Resolución 2400 de 1979",
    puntajeTipo1: null,
    puntajeTipo2: 10,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Matriz de EPP por cargo; Registros de entrega de EPP; Verificación de uso de EPP por contratistas",
    orden: 50,
  },

  // ============================================================================
  // COMPONENTE 5: GESTIÓN DE AMENAZAS (10%)
  // ============================================================================
  {
    id: "std-5.1.1",
    activo: 1,
    componenteId: "comp-sst-5",
    numeroEstandar: "5.1.1",
    nombre: "Plan de prevención, preparación y respuesta ante emergencias",
    descripcion: "Elaborar un plan de prevención, preparación y respuesta ante emergencias que identifique las amenazas, evalúe y analice la vulnerabilidad.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.25",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 4,
    puntajeTipo4: 4,
    criteriosVerificacion: "Plan de emergencias documentado; Análisis de vulnerabilidad; Procedimientos operativos normalizados",
    orden: 51,
  },
  {
    id: "std-5.1.2",
    activo: 1,
    componenteId: "comp-sst-5",
    numeroEstandar: "5.1.2",
    nombre: "Brigada de prevención, preparación y respuesta ante emergencias",
    descripcion: "Conformar, capacitar y dotar la brigada de emergencias, primeros auxilios, contra incendios, evacuación, etc., según las necesidades y el tamaño de la empresa.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.25; Ley 1523 de 2012",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Acta de conformación de brigada; Certificados de capacitación de brigadistas; Inventario de dotación de brigada",
    orden: 52,
  },
  {
    id: "std-5.1.3",
    activo: 1,
    componenteId: "comp-sst-5",
    numeroEstandar: "5.1.3",
    nombre: "Simulacros de emergencias",
    descripcion: "Realizar simulacros como mínimo una (1) vez al año con la participación de todos los trabajadores, y evaluar su efectividad para mejorar el plan de emergencias.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.25; Ley 1523 de 2012; Resolución 0312 de 2019",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Registros de simulacros realizados; Informe de evaluación del simulacro; Plan de mejora del plan de emergencias basado en resultados del simulacro",
    orden: 53,
  },

  // ============================================================================
  // COMPONENTE 6: VERIFICACIÓN DEL SG-SST (5%)
  // ============================================================================
  {
    id: "std-6.1.1",
    activo: 1,
    componenteId: "comp-sst-6",
    numeroEstandar: "6.1.1",
    nombre: "Definición de indicadores del Sistema de Gestión de Seguridad y Salud en el Trabajo",
    descripcion: "Definir indicadores (cualitativos o cuantitativos según corresponda) que permitan evaluar la estructura, el proceso y los resultados del SG-SST.",
    marcoLegal: "Decreto 1072 de 2015, artículos 2.2.4.6.19, 2.2.4.6.20, 2.2.4.6.21 y 2.2.4.6.22",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Ficha técnica de indicadores de estructura, proceso y resultado; Análisis de tendencias de indicadores",
    orden: 54,
  },
  {
    id: "std-6.1.2",
    activo: 1,
    componenteId: "comp-sst-6",
    numeroEstandar: "6.1.2",
    nombre: "Auditoría anual",
    descripcion: "Realizar una auditoría anual, que sea planificada con la participación del COPASST o Vigía de SST.",
    marcoLegal: "Decreto 1072 de 2015, artículos 2.2.4.6.29 y 2.2.4.6.30",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Programa de auditoría; Informe de auditoría anual del SG-SST; Plan de acción de hallazgos",
    orden: 55,
  },
  {
    id: "std-6.1.3",
    activo: 1,
    componenteId: "comp-sst-6",
    numeroEstandar: "6.1.3",
    nombre: "Revisión por la alta dirección. Alcance de la auditoría del Sistema de Gestión",
    descripcion: "Revisar como mínimo una vez al año, por parte de la alta dirección los resultados del SG-SST.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.31",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Acta de revisión por la alta dirección; Informe de revisión gerencial del SG-SST",
    orden: 56,
  },
  {
    id: "std-6.1.4",
    activo: 1,
    componenteId: "comp-sst-6",
    numeroEstandar: "6.1.4",
    nombre: "Planificar auditoría con el COPASST",
    descripcion: "Planificar la auditoría anual del cumplimiento del SG-SST con la participación del COPASST o Vigía.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.29",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 1,
    puntajeTipo4: 1,
    criteriosVerificacion: "Programa de auditoría con participación del COPASST; Acta de planificación de auditoría",
    orden: 57,
  },

  // ============================================================================
  // COMPONENTE 7: MEJORAMIENTO (10%)
  // ============================================================================
  {
    id: "std-7.1.1",
    activo: 1,
    componenteId: "comp-sst-7",
    numeroEstandar: "7.1.1",
    nombre: "Acciones preventivas y correctivas",
    descripcion: "Definir e implementar las acciones preventivas y/o correctivas necesarias con base en los resultados de la supervisión, inspecciones, medición de los indicadores del SG-SST entre otros.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.33",
    puntajeTipo1: null,
    puntajeTipo2: 15,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Registro de acciones preventivas y correctivas; Seguimiento a la implementación de acciones",
    orden: 58,
  },
  {
    id: "std-7.1.2",
    activo: 1,
    componenteId: "comp-sst-7",
    numeroEstandar: "7.1.2",
    nombre: "Acciones de mejora conforme a revisión de la Alta Dirección",
    descripcion: "Cuando después de la revisión por la Alta Dirección del SG-SST se evidencie que las medidas de prevención y protección relativas a los peligros y riesgos son inadecuadas o pueden dejar de ser eficaces, tomar las medidas correctivas.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.34",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 3,
    puntajeTipo4: 3,
    criteriosVerificacion: "Acta de revisión por dirección con decisiones de mejora; Plan de mejoramiento continuo",
    orden: 59,
  },
  {
    id: "std-7.1.3",
    activo: 1,
    componenteId: "comp-sst-7",
    numeroEstandar: "7.1.3",
    nombre: "Acciones de mejora con base en investigaciones de accidentes de trabajo y enfermedades",
    descripcion: "Definir e implementar acciones preventivas y/o correctivas producto de las investigaciones de los incidentes, accidentes de trabajo y enfermedades laborales.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.32; Resolución 1401 de 2007",
    puntajeTipo1: null,
    puntajeTipo2: null,
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Plan de acción de investigaciones; Seguimiento a implementación de medidas de investigaciones",
    orden: 60,
  },
  {
    id: "std-7.1.4",
    activo: 1,
    componenteId: "comp-sst-7",
    numeroEstandar: "7.1.4",
    nombre: "Plan de mejoramiento",
    descripcion: "Implementar las medidas y acciones correctivas producto de requerimientos o recomendaciones de autoridades administrativas y de la Administradora de Riesgos Laborales.",
    marcoLegal: "Decreto 1072 de 2015, artículo 2.2.4.6.34",
    puntajeTipo1: 2, // Valor agregado SST Colombia - disponible para todas las empresas
    puntajeTipo2: 2, // Valor agregado SST Colombia - disponible para todas las empresas
    puntajeTipo3: 2,
    puntajeTipo4: 2,
    criteriosVerificacion: "Registro de requerimientos de autoridades y ARL; Plan de acción de cumplimiento; Evidencia de implementación",
    orden: 61,
  },
];

// Catálogo maestro de EPP - Elementos de Protección Personal según normativa colombiana
// Decreto 1072/2015, Resolución 2400/1979, NTC aplicables
// Nota: Usar valores de enum existente: proteccion_cabeza, proteccion_visual, proteccion_auditiva, 
//       proteccion_respiratoria, proteccion_manos, proteccion_pies, proteccion_corporal, 
//       proteccion_caidas, proteccion_facial, otro
const catalogoEppMaestro = [
  // =============== PROTECCIÓN DE CABEZA ===============
  { id: "epp-cabeza-001", category: "proteccion_cabeza", name: "Casco de seguridad industrial", description: "Casco de protección clase A, B o C según NTC 1523", normaAplicable: "NTC 1523, ANSI Z89.1", nivelProteccion: "Clase A/B/C", material: "Polietileno de alta densidad", vidaUtil: "5 años", frecuenciaCambio: "Cambio por impacto o daño visible", riesgosProtegidos: ["Impacto", "Caída de objetos", "Riesgo eléctrico"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-cabeza-002", category: "proteccion_cabeza", name: "Cofia desechable", description: "Cofia protectora para industria alimentaria y farmacéutica", normaAplicable: "NTC 5374", material: "Polipropileno no tejido", vidaUtil: "1 uso", frecuenciaCambio: "Por turno o según procedimiento", riesgosProtegidos: ["Contaminación", "Partículas en cabello"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-cabeza-003", category: "proteccion_cabeza", name: "Gorra de trabajo", description: "Gorra de algodón para protección solar y partículas", material: "Algodón", vidaUtil: "6 meses", frecuenciaCambio: "Según desgaste", riesgosProtegidos: ["Radiación solar", "Partículas"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN VISUAL ===============
  { id: "epp-ojos-001", category: "proteccion_visual", name: "Gafas de seguridad transparentes", description: "Gafas de protección contra impactos y partículas", normaAplicable: "NTC 1834, ANSI Z87.1", nivelProteccion: "Alta resistencia al impacto", material: "Policarbonato", vidaUtil: "1 año", frecuenciaCambio: "Según desgaste o rayones", riesgosProtegidos: ["Impacto", "Partículas", "Salpicaduras"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-ojos-002", category: "proteccion_visual", name: "Gafas de seguridad oscuras", description: "Gafas de protección con filtro UV para trabajo exterior", normaAplicable: "NTC 1834, ANSI Z87.1", nivelProteccion: "Filtro UV 400", material: "Policarbonato", vidaUtil: "1 año", frecuenciaCambio: "Según desgaste", riesgosProtegidos: ["Radiación UV", "Deslumbramiento", "Partículas"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-ojos-003", category: "proteccion_facial", name: "Careta de soldador", description: "Careta para soldadura con filtro oscuro intercambiable", normaAplicable: "NTC 1771, ANSI Z87.1", nivelProteccion: "Filtro DIN 9-13", material: "Termoplástico", vidaUtil: "2 años", frecuenciaCambio: "Según daño o rotura", riesgosProtegidos: ["Radiación óptica", "Chispas", "Partículas calientes"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-ojos-004", category: "proteccion_facial", name: "Visor facial transparente", description: "Protector facial completo contra salpicaduras y partículas", normaAplicable: "NTC 3610, ANSI Z87.1", material: "Policarbonato", vidaUtil: "1 año", frecuenciaCambio: "Según rayones o impactos", riesgosProtegidos: ["Salpicaduras químicas", "Partículas", "Impactos menores"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-ojos-005", category: "proteccion_visual", name: "Monogafas herméticas", description: "Gafas herméticas para protección contra gases y vapores", normaAplicable: "NTC 1834, ANSI Z87.1", material: "PVC flexible con lente policarbonato", vidaUtil: "1 año", frecuenciaCambio: "Según deterioro del sello", riesgosProtegidos: ["Gases", "Vapores", "Salpicaduras", "Partículas finas"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN AUDITIVA ===============
  { id: "epp-auditiva-001", category: "proteccion_auditiva", name: "Tapones auditivos de espuma", description: "Tapones desechables de espuma para reducción de ruido", normaAplicable: "NTC 2272, ANSI S3.19", nivelProteccion: "NRR 29-33 dB", material: "Espuma de poliuretano", vidaUtil: "1 uso", frecuenciaCambio: "Por turno", riesgosProtegidos: ["Ruido ocupacional"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-auditiva-002", category: "proteccion_auditiva", name: "Tapones auditivos reutilizables", description: "Tapones de silicona con cordón para uso múltiple", normaAplicable: "NTC 2272, ANSI S3.19", nivelProteccion: "NRR 22-27 dB", material: "Silicona", vidaUtil: "3 meses", frecuenciaCambio: "Según higiene y elasticidad", riesgosProtegidos: ["Ruido ocupacional"], tallasDisponibles: ["S", "M", "L"], activo: true, esPersonalizado: false },
  { id: "epp-auditiva-003", category: "proteccion_auditiva", name: "Orejeras de copa", description: "Protectores auditivos tipo copa para alto nivel de ruido", normaAplicable: "NTC 2272, ANSI S12.6", nivelProteccion: "NRR 25-31 dB", material: "ABS con almohadillas PVC", vidaUtil: "2 años", frecuenciaCambio: "Según estado de almohadillas", riesgosProtegidos: ["Ruido ocupacional alto"], tallasDisponibles: ["Unitalla ajustable"], activo: true, esPersonalizado: false },
  { id: "epp-auditiva-004", category: "proteccion_auditiva", name: "Orejeras acoplables a casco", description: "Protectores auditivos adaptables a casco de seguridad", normaAplicable: "NTC 2272, ANSI S12.6", nivelProteccion: "NRR 23-28 dB", material: "ABS con almohadillas espuma", vidaUtil: "2 años", frecuenciaCambio: "Según estado de almohadillas", riesgosProtegidos: ["Ruido ocupacional", "Impacto en cabeza"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN RESPIRATORIA ===============
  { id: "epp-respiratoria-001", category: "proteccion_respiratoria", name: "Mascarilla N95", description: "Respirador desechable para partículas sin aceite", normaAplicable: "NIOSH N95, NTC 3382", nivelProteccion: "95% partículas ≥0.3 micras", material: "Polipropileno multicapa", vidaUtil: "8 horas de uso continuo", frecuenciaCambio: "Por turno o según saturación", riesgosProtegidos: ["Partículas", "Polvo", "Humos"], tallasDisponibles: ["S", "M", "L"], activo: true, esPersonalizado: false },
  { id: "epp-respiratoria-002", category: "proteccion_respiratoria", name: "Respirador media cara reutilizable", description: "Respirador de media cara con cartuchos intercambiables", normaAplicable: "NIOSH 42 CFR 84, NTC 1584", material: "Silicona o elastómero termoplástico", vidaUtil: "5 años (pieza facial)", frecuenciaCambio: "Cartuchos según fabricante", riesgosProtegidos: ["Vapores orgánicos", "Gases", "Partículas"], tallasDisponibles: ["S", "M", "L"], activo: true, esPersonalizado: false },
  { id: "epp-respiratoria-003", category: "proteccion_respiratoria", name: "Cartucho para vapores orgánicos", description: "Filtro para respirador contra vapores orgánicos", normaAplicable: "NIOSH OV", nivelProteccion: "Vapores orgánicos clase 1", material: "Carbón activado", vidaUtil: "40 horas o 30 días abierto", frecuenciaCambio: "Según olor o saturación", riesgosProtegidos: ["Vapores orgánicos", "Solventes"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-respiratoria-004", category: "proteccion_respiratoria", name: "Mascarilla quirúrgica", description: "Mascarilla de protección básica contra aerosoles", normaAplicable: "ASTM F2100", nivelProteccion: "BFE ≥95%", material: "Polipropileno tricapa", vidaUtil: "4 horas", frecuenciaCambio: "Por turno o si se humedece", riesgosProtegidos: ["Aerosoles", "Salpicaduras"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-respiratoria-005", category: "proteccion_respiratoria", name: "Respirador cara completa", description: "Respirador de cara completa con visor integrado", normaAplicable: "NIOSH 42 CFR 84, NTC 1584", material: "Silicona con visor policarbonato", vidaUtil: "10 años (pieza facial)", frecuenciaCambio: "Según condición del sello y visor", riesgosProtegidos: ["Gases", "Vapores", "Partículas", "Protección ocular"], tallasDisponibles: ["S", "M", "L"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN DE MANOS ===============
  { id: "epp-manos-001", category: "proteccion_manos", name: "Guantes de nitrilo desechables", description: "Guantes desechables para protección contra químicos y biológicos", normaAplicable: "EN 374, NTC 2219", nivelProteccion: "Nivel 2-4 químico", material: "Nitrilo", vidaUtil: "1 uso", frecuenciaCambio: "Por procedimiento", riesgosProtegidos: ["Químicos", "Biológicos", "Salpicaduras"], tallasDisponibles: ["XS", "S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-manos-002", category: "proteccion_manos", name: "Guantes de látex desechables", description: "Guantes desechables de látex natural", normaAplicable: "EN 374, NTC 2219", material: "Látex natural", vidaUtil: "1 uso", frecuenciaCambio: "Por procedimiento", riesgosProtegidos: ["Biológicos", "Salpicaduras menores"], tallasDisponibles: ["XS", "S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-manos-003", category: "proteccion_manos", name: "Guantes de cuero para soldadura", description: "Guantes de cuero carnaza para trabajos de soldadura", normaAplicable: "EN 407, NTC 2190", nivelProteccion: "Resistencia al calor nivel 3-4", material: "Cuero carnaza", vidaUtil: "3-6 meses", frecuenciaCambio: "Según desgaste o perforaciones", riesgosProtegidos: ["Calor", "Chispas", "Cortes"], tallasDisponibles: ["M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-manos-004", category: "proteccion_manos", name: "Guantes anticorte nivel 5", description: "Guantes de alta resistencia al corte con recubrimiento", normaAplicable: "EN 388, ANSI A5", nivelProteccion: "Corte nivel 5 / A5", material: "HPPE con recubrimiento poliuretano", vidaUtil: "1-3 meses", frecuenciaCambio: "Según desgaste del recubrimiento", riesgosProtegidos: ["Cortes", "Abrasión"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-manos-005", category: "proteccion_manos", name: "Guantes dieléctricos clase 00", description: "Guantes aislantes para trabajos eléctricos baja tensión", normaAplicable: "ASTM D120, IEC 60903", nivelProteccion: "Hasta 500V AC / 750V DC", material: "Caucho natural", vidaUtil: "6 meses (prueba dieléctrica)", frecuenciaCambio: "Prueba cada 6 meses", riesgosProtegidos: ["Riesgo eléctrico baja tensión"], tallasDisponibles: ["8", "9", "10", "11", "12"], activo: true, esPersonalizado: false },
  { id: "epp-manos-006", category: "proteccion_manos", name: "Guantes multiusos recubiertos", description: "Guantes de nylon con recubrimiento de nitrilo para trabajo general", normaAplicable: "EN 388", nivelProteccion: "Abrasión 3, Corte 1", material: "Nylon con palma de nitrilo", vidaUtil: "1-2 meses", frecuenciaCambio: "Según desgaste", riesgosProtegidos: ["Abrasión", "Agarre", "Suciedad"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-manos-007", category: "proteccion_manos", name: "Guantes de neopreno químico", description: "Guantes largos para manipulación de químicos", normaAplicable: "EN 374", nivelProteccion: "Permeación nivel 3-6", material: "Neopreno", vidaUtil: "6-12 meses", frecuenciaCambio: "Según exposición química", riesgosProtegidos: ["Químicos", "Ácidos", "Solventes"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN DE PIES ===============
  { id: "epp-pies-001", category: "proteccion_pies", name: "Botas de seguridad con puntera de acero", description: "Botas de trabajo con puntera y plantilla de acero", normaAplicable: "NTC 2257, ASTM F2413", nivelProteccion: "I/75 C/75", material: "Cuero con suela de caucho", vidaUtil: "12 meses", frecuenciaCambio: "Según desgaste de suela", riesgosProtegidos: ["Impacto en pie", "Objetos punzantes", "Resbalones"], tallasDisponibles: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"], activo: true, esPersonalizado: false },
  { id: "epp-pies-002", category: "proteccion_pies", name: "Botas dieléctricas", description: "Botas aislantes para trabajo con riesgo eléctrico", normaAplicable: "ASTM F2413 EH, NTC 2257", nivelProteccion: "18000V", material: "Caucho con suela aislante", vidaUtil: "12 meses", frecuenciaCambio: "Según inspección visual", riesgosProtegidos: ["Riesgo eléctrico", "Impacto"], tallasDisponibles: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"], activo: true, esPersonalizado: false },
  { id: "epp-pies-003", category: "proteccion_pies", name: "Botas de caucho para agua", description: "Botas impermeables para trabajo en ambientes húmedos", normaAplicable: "NTC 2257", material: "PVC o caucho", vidaUtil: "12 meses", frecuenciaCambio: "Según grietas o perforaciones", riesgosProtegidos: ["Agua", "Humedad", "Químicos diluidos"], tallasDisponibles: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"], activo: true, esPersonalizado: false },
  { id: "epp-pies-004", category: "proteccion_pies", name: "Zapatos de seguridad con puntera composite", description: "Calzado de seguridad liviano con puntera no metálica", normaAplicable: "NTC 2257, ASTM F2413", nivelProteccion: "I/75 C/75", material: "Cuero/textil con puntera composite", vidaUtil: "12 meses", frecuenciaCambio: "Según desgaste", riesgosProtegidos: ["Impacto en pie", "Confort prolongado"], tallasDisponibles: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"], activo: true, esPersonalizado: false },
  { id: "epp-pies-005", category: "proteccion_pies", name: "Polainas de cuero", description: "Protector de piernas y pies para soldadura", normaAplicable: "EN 407", material: "Cuero carnaza", vidaUtil: "6 meses", frecuenciaCambio: "Según quemaduras o perforaciones", riesgosProtegidos: ["Chispas", "Salpicaduras metálicas", "Calor"], tallasDisponibles: ["Unitalla ajustable"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN CORPORAL ===============
  { id: "epp-cuerpo-001", category: "proteccion_corporal", name: "Overol de trabajo", description: "Overol de algodón para trabajo industrial", material: "Algodón 100% o mezcla", vidaUtil: "6-12 meses", frecuenciaCambio: "Según desgaste o rotura", riesgosProtegidos: ["Suciedad", "Enganche en máquinas"], tallasDisponibles: ["S", "M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-cuerpo-002", category: "proteccion_corporal", name: "Delantal de cuero", description: "Delantal de cuero carnaza para soldadura", normaAplicable: "EN 407", material: "Cuero carnaza", vidaUtil: "12 meses", frecuenciaCambio: "Según quemaduras o perforaciones", riesgosProtegidos: ["Chispas", "Calor radiante", "Salpicaduras"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-cuerpo-003", category: "proteccion_corporal", name: "Chaleco reflectivo", description: "Chaleco de alta visibilidad clase 2 o 3", normaAplicable: "ANSI/ISEA 107, NTC 5665", nivelProteccion: "Clase 2/3", material: "Poliéster con cintas reflectivas", vidaUtil: "12 meses", frecuenciaCambio: "Según estado de reflectivos", riesgosProtegidos: ["Baja visibilidad", "Atropello"], tallasDisponibles: ["S", "M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-cuerpo-004", category: "proteccion_corporal", name: "Bata de laboratorio", description: "Bata blanca para laboratorio y áreas limpias", material: "Algodón o poliéster", vidaUtil: "12 meses", frecuenciaCambio: "Según manchas permanentes", riesgosProtegidos: ["Salpicaduras", "Contaminación cruzada"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-cuerpo-005", category: "proteccion_corporal", name: "Traje Tyvek desechable", description: "Overol desechable contra partículas y salpicaduras leves", normaAplicable: "EN 13034 Tipo 6", material: "Tyvek", vidaUtil: "1 uso", frecuenciaCambio: "Por procedimiento", riesgosProtegidos: ["Partículas", "Salpicaduras ligeras", "Contaminación"], tallasDisponibles: ["M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-cuerpo-006", category: "proteccion_corporal", name: "Delantal impermeable PVC", description: "Delantal largo impermeable para trabajo húmedo", material: "PVC", vidaUtil: "12 meses", frecuenciaCambio: "Según grietas o perforaciones", riesgosProtegidos: ["Agua", "Salpicaduras químicas", "Grasa"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  
  // =============== PROTECCIÓN CONTRA CAÍDAS ===============
  { id: "epp-caidas-001", category: "proteccion_caidas", name: "Arnés de cuerpo completo", description: "Arnés anticaídas con puntos de anclaje dorsal y frontal", normaAplicable: "ANSI Z359.11, NTC 2037", nivelProteccion: "Fuerza de frenado máx 8kN", material: "Poliéster con herrajes de acero", vidaUtil: "5 años (sin uso)", frecuenciaCambio: "Inspección semestral, cambio tras caída", riesgosProtegidos: ["Caída de altura"], tallasDisponibles: ["S/M", "L/XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-caidas-002", category: "proteccion_caidas", name: "Línea de vida con absorbedor", description: "Eslinga con absorbedor de impacto integrado", normaAplicable: "ANSI Z359.13, NTC 2037", nivelProteccion: "Fuerza de frenado máx 6kN", material: "Poliéster con absorbedor deformable", vidaUtil: "5 años (sin uso)", frecuenciaCambio: "Cambio tras activación o daño visible", riesgosProtegidos: ["Caída de altura", "Impacto"], tallasDisponibles: ["1.8m", "2.0m"], activo: true, esPersonalizado: false },
  { id: "epp-caidas-003", category: "proteccion_caidas", name: "Conector doble cola", description: "Línea de vida doble con ganchos de seguridad", normaAplicable: "ANSI Z359.13", material: "Poliéster con ganchos de acero", vidaUtil: "5 años", frecuenciaCambio: "Inspección semestral", riesgosProtegidos: ["Caída durante desplazamiento"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-caidas-004", category: "proteccion_caidas", name: "Freno de pecho", description: "Dispositivo anticaídas deslizante para cuerda", normaAplicable: "ANSI Z359.15", material: "Aluminio con mecanismo de bloqueo", vidaUtil: "5 años", frecuenciaCambio: "Según desgaste del mecanismo", riesgosProtegidos: ["Caída en línea vertical"], tallasDisponibles: ["Para cuerda 12-14mm"], activo: true, esPersonalizado: false },
  { id: "epp-caidas-005", category: "proteccion_caidas", name: "Cuerda de seguridad", description: "Cuerda estática certificada para trabajos en altura", normaAplicable: "EN 1891 Tipo A", nivelProteccion: "Resistencia mínima 22kN", material: "Poliamida trenzada", vidaUtil: "5 años (sin uso)", frecuenciaCambio: "Inspección mensual, cambio por daño", riesgosProtegidos: ["Caída en trabajos verticales"], tallasDisponibles: ["10m", "20m", "30m", "50m"], activo: true, esPersonalizado: false },
  
  // =============== OTROS EPP ===============
  { id: "epp-otros-001", category: "otro", name: "Rodilleras de protección", description: "Protectores de rodilla para trabajo en pisos", material: "Espuma EVA con carcasa PVC", vidaUtil: "6-12 meses", frecuenciaCambio: "Según compresión de espuma", riesgosProtegidos: ["Lesiones en rodilla", "Fatiga"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-otros-002", category: "otro", name: "Faja lumbar ergonómica", description: "Soporte lumbar para levantamiento de cargas", material: "Neopreno con varillas de soporte", vidaUtil: "12 meses", frecuenciaCambio: "Según pérdida de elasticidad", riesgosProtegidos: ["Lesiones de espalda", "Lumbago"], tallasDisponibles: ["S", "M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-otros-003", category: "otro", name: "Mangas protectoras para soldadura", description: "Mangas de cuero carnaza para soldador", normaAplicable: "EN 407", material: "Cuero carnaza", vidaUtil: "6 meses", frecuenciaCambio: "Según quemaduras", riesgosProtegidos: ["Chispas", "Calor radiante"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-otros-004", category: "otro", name: "Protector solar industrial SPF50+", description: "Bloqueador solar para trabajo exterior", nivelProteccion: "SPF 50+", material: "Crema", vidaUtil: "Según fecha de vencimiento", frecuenciaCambio: "Aplicación cada 2-3 horas", riesgosProtegidos: ["Radiación UV", "Quemaduras solares"], tallasDisponibles: ["100ml", "1L"], activo: true, esPersonalizado: false },
  
  // =============== SECTOR PETROLERO/HIDROCARBUROS ===============
  { id: "epp-petro-001", category: "proteccion_corporal", name: "Overol antiflama FR", description: "Overol resistente al fuego para industria petrolera", normaAplicable: "NFPA 2112, ASTM F1506", nivelProteccion: "HRC 2 (8 cal/cm²)", material: "Nomex/Kevlar o algodón tratado FR", vidaUtil: "12-24 meses", frecuenciaCambio: "Según desgaste del tratamiento FR", riesgosProtegidos: ["Flash fire", "Arco eléctrico", "Calor radiante"], tallasDisponibles: ["S", "M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-petro-002", category: "proteccion_cabeza", name: "Casco con visor integrado antiflama", description: "Casco de seguridad con protección facial para ambientes con riesgo de flash fire", normaAplicable: "ANSI Z89.1, NFPA 2112", material: "Fibra de vidrio con visor policarbonato", vidaUtil: "5 años", frecuenciaCambio: "Cambio por impacto o daño", riesgosProtegidos: ["Impacto", "Flash fire", "Partículas calientes"], tallasDisponibles: ["Unitalla ajustable"], activo: true, esPersonalizado: false },
  { id: "epp-petro-003", category: "proteccion_respiratoria", name: "Equipo SCBA autónomo", description: "Equipo de respiración autónoma para atmósferas IDLH", normaAplicable: "NIOSH 42 CFR 84, NFPA 1981", nivelProteccion: "Presión positiva, aire grado D", material: "Cilindro composite, máscara silicona", vidaUtil: "15 años (cilindro)", frecuenciaCambio: "Inspección mensual, recarga según uso", riesgosProtegidos: ["Atmósferas IDLH", "H2S", "Deficiencia de oxígeno"], tallasDisponibles: ["30min", "45min", "60min"], activo: true, esPersonalizado: false },
  { id: "epp-petro-004", category: "proteccion_respiratoria", name: "Detector personal de gases 4 en 1", description: "Detector portátil de H2S, CO, O2 y LEL para trabajo en campo petrolero", normaAplicable: "ATEX, IECEx", nivelProteccion: "Alarma visual, auditiva y vibratoria", material: "ABS antiestático", vidaUtil: "3-5 años", frecuenciaCambio: "Calibración mensual", riesgosProtegidos: ["H2S", "Monóxido de carbono", "Deficiencia O2", "Gases explosivos"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-petro-005", category: "proteccion_pies", name: "Botas antideslizantes offshore", description: "Botas de seguridad para plataformas petroleras con suela antideslizante", normaAplicable: "ASTM F2413, EN ISO 20345 S3 SRC", nivelProteccion: "Puntera composite, resistente hidrocarburos", material: "Cuero hidrofugado, suela caucho nitrilo", vidaUtil: "12 meses", frecuenciaCambio: "Según desgaste de suela", riesgosProtegidos: ["Resbalones", "Hidrocarburos", "Impacto"], tallasDisponibles: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"], activo: true, esPersonalizado: false },
  { id: "epp-petro-006", category: "proteccion_manos", name: "Guantes resistentes a hidrocarburos", description: "Guantes con palma de nitrilo para manipulación de crudo y derivados", normaAplicable: "EN 388, EN 374", nivelProteccion: "Permeación hidrocarburos >480min", material: "Nitrilo reforzado", vidaUtil: "1-3 meses", frecuenciaCambio: "Según contacto con químicos", riesgosProtegidos: ["Hidrocarburos", "Grasas", "Cortes"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  
  // =============== SECTOR AGRÍCOLA ===============
  { id: "epp-agro-001", category: "proteccion_respiratoria", name: "Respirador para agroquímicos", description: "Mascarilla con filtros para aplicación de plaguicidas y herbicidas", normaAplicable: "NIOSH OV/P100, NTC 1584", nivelProteccion: "Vapores orgánicos + partículas", material: "Silicona con filtros combinados", vidaUtil: "Pieza facial 5 años, filtros según uso", frecuenciaCambio: "Filtros cada 40 horas de uso", riesgosProtegidos: ["Plaguicidas", "Herbicidas", "Fungicidas"], tallasDisponibles: ["S", "M", "L"], activo: true, esPersonalizado: false },
  { id: "epp-agro-002", category: "proteccion_corporal", name: "Traje impermeable para fumigación", description: "Traje completo resistente a químicos para aplicación de agroquímicos", normaAplicable: "EN 13034 Tipo 6, EN 14605 Tipo 4", material: "Polietileno laminado", vidaUtil: "Desechable o 20 lavados", frecuenciaCambio: "Por jornada de fumigación intensa", riesgosProtegidos: ["Plaguicidas", "Herbicidas", "Salpicaduras químicas"], tallasDisponibles: ["M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-agro-003", category: "proteccion_manos", name: "Guantes para manipulación de agroquímicos", description: "Guantes largos impermeables para aplicación de pesticidas", normaAplicable: "EN 374, EPA Worker Protection Standard", nivelProteccion: "Permeación química >8 horas", material: "Nitrilo grueso o neopreno", vidaUtil: "3-6 meses", frecuenciaCambio: "Según exposición química", riesgosProtegidos: ["Plaguicidas", "Herbicidas", "Fertilizantes"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-agro-004", category: "proteccion_pies", name: "Botas de caucho para campo", description: "Botas impermeables resistentes a químicos agrícolas", normaAplicable: "EN ISO 20345 S5", material: "PVC con puntera de seguridad", vidaUtil: "12-18 meses", frecuenciaCambio: "Según deterioro", riesgosProtegidos: ["Humedad", "Químicos agrícolas", "Mordeduras animales"], tallasDisponibles: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"], activo: true, esPersonalizado: false },
  { id: "epp-agro-005", category: "proteccion_cabeza", name: "Sombrero de ala ancha con protector de nuca", description: "Protección solar para trabajo en campo abierto", normaAplicable: "UPF 50+", material: "Poliéster con tratamiento UV", vidaUtil: "12 meses", frecuenciaCambio: "Según deterioro del material", riesgosProtegidos: ["Radiación solar", "Insolación", "Quemaduras"], tallasDisponibles: ["Unitalla ajustable"], activo: true, esPersonalizado: false },
  { id: "epp-agro-006", category: "proteccion_visual", name: "Gafas antiempañantes para fumigación", description: "Gafas herméticas con válvulas antiempañamiento", normaAplicable: "ANSI Z87.1, EN 166", material: "Policarbonato con sello de silicona", vidaUtil: "12 meses", frecuenciaCambio: "Según deterioro del sello", riesgosProtegidos: ["Salpicaduras químicas", "Deriva de plaguicidas"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  
  // =============== SECTOR SALUD ===============
  { id: "epp-salud-001", category: "proteccion_corporal", name: "Bata quirúrgica desechable", description: "Bata estéril para procedimientos quirúrgicos", normaAplicable: "AAMI PB70 Nivel 2-4, EN 13795", nivelProteccion: "Barrera microbiana, impermeable", material: "SMS o polietileno laminado", vidaUtil: "1 uso", frecuenciaCambio: "Por procedimiento", riesgosProtegidos: ["Fluidos corporales", "Sangre", "Contaminación cruzada"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-salud-002", category: "proteccion_facial", name: "Careta facial con pantalla antifluidos", description: "Protector facial completo contra salpicaduras de fluidos biológicos", normaAplicable: "ANSI Z87.1, EN 166", material: "PET óptico transparente", vidaUtil: "Desechable o 30 días reutilizable", frecuenciaCambio: "Por turno o según protocolo", riesgosProtegidos: ["Salpicaduras", "Aerosoles", "Fluidos corporales"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-salud-003", category: "proteccion_manos", name: "Guantes estériles de látex", description: "Guantes quirúrgicos estériles empacados individualmente", normaAplicable: "EN 455, ASTM D3577", nivelProteccion: "AQL 1.5", material: "Látex natural", vidaUtil: "1 uso", frecuenciaCambio: "Por procedimiento", riesgosProtegidos: ["Contaminación", "Patógenos", "Fluidos corporales"], tallasDisponibles: ["6", "6.5", "7", "7.5", "8", "8.5", "9"], activo: true, esPersonalizado: false },
  { id: "epp-salud-004", category: "proteccion_respiratoria", name: "Respirador N95 para partículas biológicas", description: "Mascarilla N95 aprobada para uso en salud", normaAplicable: "NIOSH N95, FDA 510(k)", nivelProteccion: "≥95% partículas ≥0.3μm", material: "Polipropileno multicapa", vidaUtil: "8 horas o según saturación", frecuenciaCambio: "Por turno o paciente de alto riesgo", riesgosProtegidos: ["Tuberculosis", "COVID-19", "Aerosoles infecciosos"], tallasDisponibles: ["S", "M", "L"], activo: true, esPersonalizado: false },
  { id: "epp-salud-005", category: "proteccion_pies", name: "Cubrebotas desechables", description: "Protectores de calzado para áreas estériles", normaAplicable: "EN 13795", material: "Polipropileno no tejido", vidaUtil: "1 uso", frecuenciaCambio: "Al salir de área estéril", riesgosProtegidos: ["Contaminación cruzada", "Fluidos en piso"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-salud-006", category: "otro", name: "Gafas de protección radiológica", description: "Gafas plomadas para protección contra radiación ionizante", normaAplicable: "ICRP, FDA 21 CFR", nivelProteccion: "0.5-0.75mm Pb equivalente", material: "Cristal plomado con montura protectora", vidaUtil: "5 años", frecuenciaCambio: "Según integridad del plomado", riesgosProtegidos: ["Rayos X", "Radiación dispersa"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  
  // =============== SECTOR MINERO ===============
  { id: "epp-minero-001", category: "proteccion_cabeza", name: "Casco minero con lámpara", description: "Casco de seguridad con portador de lámpara y cable integrado", normaAplicable: "NTC 1523, MSHA", nivelProteccion: "Clase E (eléctrico)", material: "ABS reforzado", vidaUtil: "5 años", frecuenciaCambio: "Cambio por impacto o grietas", riesgosProtegidos: ["Impacto", "Caída de rocas", "Oscuridad"], tallasDisponibles: ["Unitalla ajustable"], activo: true, esPersonalizado: false },
  { id: "epp-minero-002", category: "proteccion_respiratoria", name: "Autorescatador minero", description: "Equipo de escape para emergencias en minas subterráneas", normaAplicable: "MSHA 30 CFR Part 75", nivelProteccion: "60 minutos de oxígeno", material: "Carcasa metálica, generador químico O2", vidaUtil: "10 años sellado", frecuenciaCambio: "Inspección mensual, cambio tras uso", riesgosProtegidos: ["Incendio en mina", "Explosión", "Gases tóxicos"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-minero-003", category: "proteccion_auditiva", name: "Tapones moldeados personalizados", description: "Protectores auditivos moldeados al canal auditivo del trabajador", normaAplicable: "NTC 2272, ANSI S3.19", nivelProteccion: "NRR 25-30 dB", material: "Silicona médica", vidaUtil: "3-5 años", frecuenciaCambio: "Según ajuste y limpieza", riesgosProtegidos: ["Ruido de maquinaria pesada", "Voladuras"], tallasDisponibles: ["Moldeado individual"], activo: true, esPersonalizado: false },
  { id: "epp-minero-004", category: "proteccion_corporal", name: "Chaleco refrigerante", description: "Chaleco con sistema de enfriamiento para minas profundas", material: "Nylon con bolsillos para hielo o gel", vidaUtil: "24 meses", frecuenciaCambio: "Según desgaste del material", riesgosProtegidos: ["Estrés térmico", "Golpe de calor"], tallasDisponibles: ["S", "M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-minero-005", category: "proteccion_pies", name: "Botas mineras metatarsales", description: "Botas con protección metatarsal para operaciones mineras", normaAplicable: "ASTM F2413 Mt/75, MSHA", nivelProteccion: "Puntera + metatarsal", material: "Cuero con protector externo", vidaUtil: "6-12 meses", frecuenciaCambio: "Según desgaste en ambiente minero", riesgosProtegidos: ["Caída de rocas", "Aplastamiento", "Perforación"], tallasDisponibles: ["38", "39", "40", "41", "42", "43", "44", "45", "46"], activo: true, esPersonalizado: false },
  
  // =============== SECTOR ELÉCTRICO (ADICIONALES) ===============
  { id: "epp-electrico-001", category: "proteccion_manos", name: "Guantes dieléctricos clase 2", description: "Guantes aislantes para trabajos en media tensión", normaAplicable: "ASTM D120, IEC 60903", nivelProteccion: "Hasta 17,000V AC", material: "Caucho natural", vidaUtil: "6 meses (con prueba)", frecuenciaCambio: "Prueba dieléctrica cada 6 meses", riesgosProtegidos: ["Riesgo eléctrico media tensión"], tallasDisponibles: ["8", "9", "10", "11", "12"], activo: true, esPersonalizado: false },
  { id: "epp-electrico-002", category: "proteccion_manos", name: "Guantes dieléctricos clase 4", description: "Guantes aislantes para trabajos en alta tensión", normaAplicable: "ASTM D120, IEC 60903", nivelProteccion: "Hasta 36,000V AC", material: "Caucho natural", vidaUtil: "6 meses (con prueba)", frecuenciaCambio: "Prueba dieléctrica cada 6 meses", riesgosProtegidos: ["Riesgo eléctrico alta tensión"], tallasDisponibles: ["9", "10", "11", "12"], activo: true, esPersonalizado: false },
  { id: "epp-electrico-003", category: "proteccion_corporal", name: "Traje arco eléctrico 40 cal/cm²", description: "Conjunto de chaqueta y pantalón para protección contra arco eléctrico", normaAplicable: "NFPA 70E, ASTM F1959", nivelProteccion: "HRC 4 - 40 cal/cm²", material: "Múltiples capas FR", vidaUtil: "5 años", frecuenciaCambio: "Según exposición a arco o desgaste", riesgosProtegidos: ["Arco eléctrico severo", "Flash térmico"], tallasDisponibles: ["M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-electrico-004", category: "proteccion_facial", name: "Careta para arco eléctrico", description: "Protector facial con visor certificado para arco eléctrico", normaAplicable: "NFPA 70E, ASTM F2178", nivelProteccion: "8-40 cal/cm²", material: "Policarbonato con tratamiento antiarco", vidaUtil: "5 años", frecuenciaCambio: "Cambio tras exposición a arco", riesgosProtegidos: ["Arco eléctrico", "Radiación UV/IR del arco"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-electrico-005", category: "otro", name: "Pértiga aislada telescópica", description: "Pértiga para maniobras en líneas energizadas", normaAplicable: "ASTM F711, IEC 60855", nivelProteccion: "Hasta 500kV", material: "Fibra de vidrio con resina epoxi", vidaUtil: "10 años", frecuenciaCambio: "Prueba anual, cambio por daño", riesgosProtegidos: ["Contacto con líneas energizadas"], tallasDisponibles: ["1.5m", "2m", "3m", "4m", "6m"], activo: true, esPersonalizado: false },
  
  // =============== SECTOR QUÍMICO ===============
  { id: "epp-quimico-001", category: "proteccion_corporal", name: "Traje encapsulado Nivel A", description: "Traje hermético para atmósferas con químicos altamente peligrosos", normaAplicable: "OSHA 1910.120, NFPA 1991", nivelProteccion: "Vapor-tight, presión positiva", material: "Butilo o Viton multicapa", vidaUtil: "10 años (almacenado)", frecuenciaCambio: "Prueba de hermeticidad anual", riesgosProtegidos: ["Gases tóxicos", "Vapores corrosivos", "IDLH"], tallasDisponibles: ["M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-quimico-002", category: "proteccion_corporal", name: "Traje Nivel B splash-resistant", description: "Traje químico con SCBA externo para salpicaduras", normaAplicable: "OSHA 1910.120, NFPA 1992", nivelProteccion: "Splash-resistant, no hermético a vapor", material: "Tychem o similar", vidaUtil: "5 años (almacenado)", frecuenciaCambio: "Inspección antes de cada uso", riesgosProtegidos: ["Salpicaduras químicas", "Líquidos corrosivos"], tallasDisponibles: ["M", "L", "XL", "XXL"], activo: true, esPersonalizado: false },
  { id: "epp-quimico-003", category: "proteccion_manos", name: "Guantes de butilo para químicos", description: "Guantes de alta resistencia a gases y vapores químicos", normaAplicable: "EN 374, ASTM F739", nivelProteccion: "Permeación >8 horas múltiples químicos", material: "Butilo", vidaUtil: "12-24 meses", frecuenciaCambio: "Según exposición y deterioro", riesgosProtegidos: ["Gases", "Vapores", "Cetonas", "Ésteres"], tallasDisponibles: ["S", "M", "L", "XL"], activo: true, esPersonalizado: false },
  { id: "epp-quimico-004", category: "proteccion_visual", name: "Gafas químicas con ventilación indirecta", description: "Goggles herméticos para manipulación de químicos corrosivos", normaAplicable: "ANSI Z87.1, EN 166", nivelProteccion: "Química D3, impacto D4", material: "PVC con lente policarbonato", vidaUtil: "2 años", frecuenciaCambio: "Según deterioro del sello", riesgosProtegidos: ["Salpicaduras ácidas", "Vapores corrosivos", "Bases"], tallasDisponibles: ["Unitalla"], activo: true, esPersonalizado: false },
  { id: "epp-quimico-005", category: "proteccion_respiratoria", name: "Cartucho multigas ABEK", description: "Filtro combinado para múltiples gases y vapores", normaAplicable: "EN 14387, NIOSH", nivelProteccion: "A2B2E2K2 + P3", material: "Carbón activado multicapa", vidaUtil: "6 meses abierto o 100 horas uso", frecuenciaCambio: "Según olor penetrante o saturación", riesgosProtegidos: ["Vapores orgánicos", "Gases ácidos", "Amoniaco", "Partículas"], tallasDisponibles: ["Rosca universal"], activo: true, esPersonalizado: false },
];

// Función para poblar catálogo maestro de EPP
async function seedEppCatalog() {
  try {
    // Verificar si la tabla existe
    try {
      await db.execute(sql`SELECT 1 FROM epp_catalog LIMIT 1`);
    } catch (error) {
      console.log("⚠️ Tabla epp_catalog no existe aún. Saltando seed de EPP.");
      return;
    }
    
    // Verificar si ya hay datos
    const existingCount = await db.select({ count: sql`count(*)` }).from(schema.eppCatalog);
    if (existingCount[0]?.count && Number(existingCount[0].count) > 0) {
      console.log(`✅ Catálogo EPP ya existe con ${existingCount[0].count} elementos`);
      return;
    }
    
    // Insertar catálogo de EPP
    for (const epp of catalogoEppMaestro) {
      await db.insert(schema.eppCatalog).values(epp).onConflictDoNothing();
    }
    
    console.log(`✅ ${catalogoEppMaestro.length} elementos de EPP insertados en catálogo maestro`);
  } catch (error) {
    console.error("⚠️ Error al crear catálogo EPP (no crítico):", error);
  }
}

// Función idempotente para poblar datos maestros SST
export async function seedSstCatalog() {
  try {
    console.log("🌱 Iniciando seed de datos maestros SST...");
    
    // Verificar que las tablas existen antes de intentar seed
    try {
      await db.execute(sql`SELECT 1 FROM componentes_sst LIMIT 1`);
    } catch (error) {
      console.log("⚠️ Tablas SST no existen aún. Saltando seed. Se ejecutará después de las migraciones.");
      return;
    }
    
    // Insertar componentes (upsert para evitar duplicados)
    for (const componente of componentesSst) {
      await db.insert(schema.componentesSst)
        .values(componente)
        .onConflictDoNothing();
    }
    console.log(`✅ ${componentesSst.length} componentes SST insertados/verificados`);
    
    // Insertar estándares (upsert para evitar duplicados)
    for (const estandar of estandaresSst) {
      await db.insert(schema.estandaresSst)
        .values(estandar)
        .onConflictDoNothing();
    }
    console.log(`✅ ${estandaresSst.length} estándares SST insertados/verificados`);
    
    // Actualizar puntajeTipo1 explícitamente para todos los estándares que aplican a tipo1
    // Necesario porque onConflictDoNothing impide actualizar estándares ya existentes en prod
    const tipo1Updates: { numeroEstandar: string; puntajeTipo1: number }[] = [
      { numeroEstandar: "1.1.1", puntajeTipo1: 5 },
      { numeroEstandar: "1.1.4", puntajeTipo1: 5 },
      { numeroEstandar: "1.2.1", puntajeTipo1: 15 },
      { numeroEstandar: "1.2.2", puntajeTipo1: 2 },
      { numeroEstandar: "2.4.1", puntajeTipo1: 10 },
      { numeroEstandar: "2.8.1", puntajeTipo1: 1 },
      { numeroEstandar: "3.1.4", puntajeTipo1: 15 },
      { numeroEstandar: "4.1.1", puntajeTipo1: 30 },
      { numeroEstandar: "4.2.1", puntajeTipo1: 20 },
      { numeroEstandar: "7.1.4", puntajeTipo1: 2 },
    ];
    for (const { numeroEstandar, puntajeTipo1 } of tipo1Updates) {
      await db.update(schema.estandaresSst)
        .set({ puntajeTipo1 })
        .where(eq(schema.estandaresSst.numeroEstandar, numeroEstandar));
    }
    console.log(`✅ ${tipo1Updates.length} estándares tipo1 sincronizados con puntajes correctos`);
    
    console.log("🎉 Seed de datos maestros SST completado exitosamente");
    
    // Recalcular evaluaciones existentes que no tengan puntajes por ciclo PHVA
    await recalcularEvaluacionesSinPhva();
    
    // Seed de catálogo maestro de EPP
    await seedEppCatalog();
    
    // Seed de configuración de precios para el pricing plugin
    await seedPricingConfig();
    
  } catch (error) {
    console.error("⚠️ Error al ejecutar seed de datos maestros SST (no crítico):", error);
    // NO hacer throw - permitir que la aplicación continúe
  }
}

// Configuración de precios por defecto según el proyecto
// Tier 1-10: $26,000 COP + $60,000 mínimo
// Tier 11-49: $24,000 COP
// Tier 50-199: $22,000 COP
// Tier 200+: $20,000 COP
async function seedPricingConfig() {
  try {
    // Verificar si la tabla pricing_config existe
    try {
      await db.execute(sql`SELECT 1 FROM pricing_config LIMIT 1`);
    } catch (error) {
      console.log("⚠️ Tabla pricing_config no existe aún. Saltando seed de precios.");
      return;
    }
    
    // Verificar si ya existe una configuración activa
    const [existingConfig] = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.isActive, true))
      .orderBy(desc(pricingConfig.createdAt))
      .limit(1);
    
    if (existingConfig) {
      console.log("✅ Configuración de precios ya existe (activa)");
      return;
    }
    
    // Crear configuración de precios por defecto
    // Fórmula: $20,000 base (1-2 trabajadores) + $10,000 por trabajador adicional
    await db.insert(pricingConfig).values({
      minFeeSmall: "20000.00",
      price1To10: "10000.00",
      price11To49: "10000.00",
      price50To199: "10000.00",
      price200Plus: "10000.00",
      currency: "COP",
      isActive: true,
    });
    
    console.log("✅ Configuración de precios creada con valores por defecto");
  } catch (error) {
    console.error("⚠️ Error al crear configuración de precios (no crítico):", error);
  }
}

// Función para recalcular evaluaciones SST existentes que no tengan puntajes por ciclo PHVA
async function recalcularEvaluacionesSinPhva() {
  try {
    // Obtener evaluaciones sin puntajes por ciclo PHVA
    const evaluacionesSinPhva = await db
      .select({ id: schema.evaluacionesSst.id, companyId: schema.evaluacionesSst.companyId })
      .from(schema.evaluacionesSst)
      .where(sql`puntajes_por_ciclo_phva IS NULL OR puntajes_por_ciclo_phva = ''`);
    
    if (evaluacionesSinPhva.length === 0) {
      return;
    }
    
    console.log(`🔄 Recalculando ${evaluacionesSinPhva.length} evaluaciones SST con puntajes PHVA...`);
    
    // Obtener componentes para mapear ciclos PHVA
    const componentes = await db.select().from(schema.componentesSst);
    const componenteMap = new Map(componentes.map(c => [c.id, c]));
    
    for (const evaluacion of evaluacionesSinPhva) {
      // Obtener respuestas de la evaluación
      const respuestas = await db
        .select()
        .from(schema.respuestasEstandares)
        .where(eq(schema.respuestasEstandares.evaluacionId, evaluacion.id));
      
      // Obtener estándares
      const estandares = await db.select().from(schema.estandaresSst);
      const estandarMap = new Map(estandares.map(e => [e.id, e]));
      
      // Calcular puntajes por ciclo PHVA
      const puntajesPorCicloPhva: Record<string, { obtenido: number; maximo: number }> = {
        planear: { obtenido: 0, maximo: 0 },
        hacer: { obtenido: 0, maximo: 0 },
        verificar: { obtenido: 0, maximo: 0 },
        actuar: { obtenido: 0, maximo: 0 },
      };
      
      for (const respuesta of respuestas) {
        const estandar = estandarMap.get(respuesta.estandarId);
        if (!estandar) continue;
        
        const componente = componenteMap.get(estandar.componenteId);
        if (!componente || !componente.cicloPhva) continue;
        
        const ciclo = componente.cicloPhva;
        if (puntajesPorCicloPhva[ciclo]) {
          puntajesPorCicloPhva[ciclo].obtenido += respuesta.puntajeObtenido;
          puntajesPorCicloPhva[ciclo].maximo += respuesta.puntajeMaximo;
        }
      }
      
      // Actualizar evaluación con puntajes PHVA
      await db
        .update(schema.evaluacionesSst)
        .set({ puntajesPorCicloPhva: JSON.stringify(puntajesPorCicloPhva) })
        .where(eq(schema.evaluacionesSst.id, evaluacion.id));
    }
    
    console.log(`✅ ${evaluacionesSinPhva.length} evaluaciones SST actualizadas con puntajes PHVA`);
  } catch (error) {
    console.error("⚠️ Error al recalcular puntajes PHVA (no crítico):", error);
  }
}
