import { db } from "./db";
import { sstStandards, sstItems, type SstStandard } from "../shared/schema";

/**
 * ISO 45001:2018 - Sistema de Gestión de Seguridad y Salud en el Trabajo
 * 10 Cláusulas organizadas según ciclo PHVA
 */

export const iso45001Standards = [
  {
    standardType: "ISO_45001" as const,
    name: "Contexto de la Organización",
    description: "Comprensión de la organización y su contexto, necesidades y expectativas de las partes interesadas, alcance del sistema de gestión SST",
    phvaCycle: "planear" as const,
    clauseNumber: "4",
    maxScore: 10,
    order: 1,
  },
  {
    standardType: "ISO_45001" as const,
    name: "Liderazgo y Participación de los Trabajadores",
    description: "Liderazgo y compromiso de la alta dirección, política de SST, roles y responsabilidades, consulta y participación de los trabajadores",
    phvaCycle: "planear" as const,
    clauseNumber: "5",
    maxScore: 15,
    order: 2,
  },
  {
    standardType: "ISO_45001" as const,
    name: "Planificación",
    description: "Acciones para abordar riesgos y oportunidades, identificación de peligros y evaluación de riesgos, requisitos legales, objetivos SST y planificación",
    phvaCycle: "planear" as const,
    clauseNumber: "6",
    maxScore: 20,
    order: 3,
  },
  {
    standardType: "ISO_45001" as const,
    name: "Apoyo",
    description: "Recursos, competencia, toma de conciencia, comunicación, información documentada",
    phvaCycle: "hacer" as const,
    clauseNumber: "7",
    maxScore: 10,
    order: 4,
  },
  {
    standardType: "ISO_45001" as const,
    name: "Operación",
    description: "Planificación y control operacional, jerarquía de controles, gestión del cambio, contratación externa, preparación y respuesta ante emergencias",
    phvaCycle: "hacer" as const,
    clauseNumber: "8",
    maxScore: 20,
    order: 5,
  },
  {
    standardType: "ISO_45001" as const,
    name: "Evaluación del Desempeño",
    description: "Seguimiento, medición, análisis y evaluación del desempeño, evaluación del cumplimiento, auditoría interna, revisión por la dirección",
    phvaCycle: "verificar" as const,
    clauseNumber: "9",
    maxScore: 15,
    order: 6,
  },
  {
    standardType: "ISO_45001" as const,
    name: "Mejora",
    description: "Generalidades de mejora, incidentes, no conformidades, acciones correctivas, mejora continua",
    phvaCycle: "actuar" as const,
    clauseNumber: "10",
    maxScore: 10,
    order: 7,
  },
];

export const iso45001Items = [
  // Cláusula 4: Contexto de la Organización
  {
    itemNumber: "4.1",
    description: "Comprensión de la organización y de su contexto",
    evaluationCriteria: "La organización ha determinado las cuestiones externas e internas pertinentes al propósito y que afectan su capacidad para lograr los resultados previstos del SG-SST",
    maxScore: 3,
    order: 1,
  },
  {
    itemNumber: "4.2",
    description: "Comprensión de las necesidades y expectativas de los trabajadores",
    evaluationCriteria: "La organización ha determinado las partes interesadas relevantes al SG-SST y sus requisitos",
    maxScore: 3,
    order: 2,
  },
  {
    itemNumber: "4.3",
    description: "Determinación del alcance del sistema de gestión SST",
    evaluationCriteria: "Se ha establecido y documentado el alcance del SG-SST considerando cuestiones internas/externas y requisitos de partes interesadas",
    maxScore: 2,
    order: 3,
  },
  {
    itemNumber: "4.4",
    description: "Sistema de gestión de la SST",
    evaluationCriteria: "La organización ha establecido, implementado, mantenido y mejorado continuamente un SG-SST con los procesos necesarios",
    maxScore: 2,
    order: 4,
  },

  // Cláusula 5: Liderazgo y Participación
  {
    itemNumber: "5.1",
    description: "Liderazgo y compromiso",
    evaluationCriteria: "La alta dirección demuestra liderazgo y compromiso asumiendo responsabilidad por la prevención de lesiones y deterioro de la salud relacionados con el trabajo",
    maxScore: 4,
    order: 5,
  },
  {
    itemNumber: "5.2",
    description: "Política de la SST",
    evaluationCriteria: "La alta dirección ha establecido, implementado y mantenido una política de SST que incluye compromisos de mejora continua, cumplimiento legal y consulta a trabajadores",
    maxScore: 3,
    order: 6,
  },
  {
    itemNumber: "5.3",
    description: "Roles, responsabilidades y autoridades",
    evaluationCriteria: "La alta dirección ha asignado y comunicado responsabilidades y autoridades para roles pertinentes al SG-SST",
    maxScore: 3,
    order: 7,
  },
  {
    itemNumber: "5.4",
    description: "Consulta y participación de los trabajadores",
    evaluationCriteria: "La organización ha establecido procesos para la consulta y participación de los trabajadores en el desarrollo, planificación, implementación y mejora del SG-SST",
    maxScore: 5,
    order: 8,
  },

  // Cláusula 6: Planificación
  {
    itemNumber: "6.1.1",
    description: "Acciones para abordar riesgos y oportunidades - Generalidades",
    evaluationCriteria: "La organización ha planificado acciones para abordar riesgos y oportunidades del SG-SST",
    maxScore: 3,
    order: 9,
  },
  {
    itemNumber: "6.1.2",
    description: "Identificación de peligros y evaluación de riesgos",
    evaluationCriteria: "La organización ha establecido, implementado y mantenido procesos para identificación continua de peligros, evaluación de riesgos SST y determinación de controles",
    maxScore: 5,
    order: 10,
  },
  {
    itemNumber: "6.1.3",
    description: "Determinación de los requisitos legales",
    evaluationCriteria: "La organización ha determinado y tiene acceso a requisitos legales y otros requisitos actualizados aplicables",
    maxScore: 4,
    order: 11,
  },
  {
    itemNumber: "6.1.4",
    description: "Planificación de acciones",
    evaluationCriteria: "La organización ha planificado cómo integrar las acciones en sus procesos del SG-SST y evaluar la eficacia de estas acciones",
    maxScore: 3,
    order: 12,
  },
  {
    itemNumber: "6.2",
    description: "Objetivos de la SST y planificación para lograrlos",
    evaluationCriteria: "La organización ha establecido objetivos SST medibles, coherentes con la política, y planificado cómo alcanzarlos",
    maxScore: 5,
    order: 13,
  },

  // Cláusula 7: Apoyo
  {
    itemNumber: "7.1",
    description: "Recursos",
    evaluationCriteria: "La organización ha determinado y proporcionado los recursos necesarios para el establecimiento, implementación, mantenimiento y mejora continua del SG-SST",
    maxScore: 2,
    order: 14,
  },
  {
    itemNumber: "7.2",
    description: "Competencia",
    evaluationCriteria: "La organización ha determinado la competencia necesaria de trabajadores, asegurado que son competentes y conservado información documentada",
    maxScore: 2,
    order: 15,
  },
  {
    itemNumber: "7.3",
    description: "Toma de conciencia",
    evaluationCriteria: "Los trabajadores son conscientes de la política SST, su contribución a la eficacia del SG-SST y las implicaciones de no cumplir los requisitos",
    maxScore: 2,
    order: 16,
  },
  {
    itemNumber: "7.4",
    description: "Comunicación",
    evaluationCriteria: "La organización ha establecido procesos de comunicación interna y externa pertinentes al SG-SST",
    maxScore: 2,
    order: 17,
  },
  {
    itemNumber: "7.5",
    description: "Información documentada",
    evaluationCriteria: "El SG-SST incluye la información documentada requerida por la norma y la determinada como necesaria para la eficacia del sistema",
    maxScore: 2,
    order: 18,
  },

  // Cláusula 8: Operación
  {
    itemNumber: "8.1",
    description: "Planificación y control operacional",
    evaluationCriteria: "La organización ha planificado, implementado y controlado procesos para cumplir requisitos del SG-SST e implementar acciones aplicando jerarquía de controles",
    maxScore: 6,
    order: 19,
  },
  {
    itemNumber: "8.1.2",
    description: "Eliminar peligros y reducir riesgos para la SST",
    evaluationCriteria: "La organización ha establecido procesos para eliminar peligros y reducir riesgos SST mediante jerarquía de controles (eliminación > sustitución > controles ingeniería > controles administrativos > EPP)",
    maxScore: 5,
    order: 20,
  },
  {
    itemNumber: "8.1.3",
    description: "Gestión del cambio",
    evaluationCriteria: "La organización ha establecido procesos para la implementación y control de cambios temporales y permanentes que impactan el desempeño SST",
    maxScore: 3,
    order: 21,
  },
  {
    itemNumber: "8.1.4",
    description: "Compras y contratación externa",
    evaluationCriteria: "La organización ha establecido procesos para controlar compras y contratistas para asegurar conformidad con el SG-SST",
    maxScore: 3,
    order: 22,
  },
  {
    itemNumber: "8.2",
    description: "Preparación y respuesta ante emergencias",
    evaluationCriteria: "La organización ha establecido, implementado y mantenido procesos para prepararse y responder ante emergencias potenciales",
    maxScore: 3,
    order: 23,
  },

  // Cláusula 9: Evaluación del Desempeño
  {
    itemNumber: "9.1",
    description: "Seguimiento, medición, análisis y evaluación del desempeño",
    evaluationCriteria: "La organización ha establecido procesos para el seguimiento, medición, análisis y evaluación del desempeño SST con métodos y criterios definidos",
    maxScore: 5,
    order: 24,
  },
  {
    itemNumber: "9.1.2",
    description: "Evaluación del cumplimiento",
    evaluationCriteria: "La organización ha establecido, implementado y mantenido procesos para evaluar el cumplimiento de requisitos legales y otros requisitos",
    maxScore: 3,
    order: 25,
  },
  {
    itemNumber: "9.2",
    description: "Auditoría interna",
    evaluationCriteria: "La organización ha establecido, implementado y mantenido programas de auditoría interna a intervalos planificados",
    maxScore: 4,
    order: 26,
  },
  {
    itemNumber: "9.3",
    description: "Revisión por la dirección",
    evaluationCriteria: "La alta dirección revisa el SG-SST a intervalos planificados para asegurar su conveniencia, adecuación y eficacia continuas",
    maxScore: 3,
    order: 27,
  },

  // Cláusula 10: Mejora
  {
    itemNumber: "10.1",
    description: "Generalidades - Mejora continua",
    evaluationCriteria: "La organización ha determinado oportunidades de mejora e implementado acciones necesarias para alcanzar los resultados previstos del SG-SST",
    maxScore: 2,
    order: 28,
  },
  {
    itemNumber: "10.2",
    description: "Incidentes, no conformidades y acciones correctivas",
    evaluationCriteria: "La organización ha establecido, implementado y mantenido procesos para gestionar incidentes y no conformidades, incluyendo reporte, investigación, acciones correctivas",
    maxScore: 5,
    order: 29,
  },
  {
    itemNumber: "10.3",
    description: "Mejora continua del SG-SST",
    evaluationCriteria: "La organización mejora continuamente la conveniencia, adecuación y eficacia del SG-SST, promoviendo cultura de seguridad y participación",
    maxScore: 3,
    order: 30,
  },
];

export async function seedISO45001Standards() {
  console.log("🌱 Sembrando estándares ISO 45001:2018...");

  try {
    // Insert standards
    const insertedStandards = await db.insert(sstStandards).values(iso45001Standards).returning();
    console.log(`✅ ${insertedStandards.length} estándares ISO 45001 insertados`);

    // Prepare items with standard IDs
    const itemsWithStandardIds = iso45001Items.map((item, index) => {
      // Determine which standard this item belongs to based on clause number
      const clauseNumber = item.itemNumber.split('.')[0];
      const standard = insertedStandards.find((s: SstStandard) => s.clauseNumber === clauseNumber);
      
      if (!standard) {
        throw new Error(`No se encontró estándar para cláusula ${clauseNumber}`);
      }

      return {
        ...item,
        standardId: standard.id,
      };
    });

    // Insert items
    const insertedItems = await db.insert(sstItems).values(itemsWithStandardIds).returning();
    console.log(`✅ ${insertedItems.length} ítems ISO 45001 insertados`);

    console.log("✨ Población de ISO 45001 completada exitosamente");
    
    return {
      standards: insertedStandards,
      items: insertedItems,
    };
  } catch (error) {
    console.error("❌ Error poblando ISO 45001:", error);
    throw error;
  }
}
