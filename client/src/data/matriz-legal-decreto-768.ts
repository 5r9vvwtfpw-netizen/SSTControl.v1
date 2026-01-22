/**
 * Plantilla de Matriz Legal para Decreto 768/2022
 * Clasificación de Actividades Económicas - Sistema General de Riesgos Laborales
 * 
 * Este archivo contiene la plantilla y normativa para agregar a la Matriz Legal
 * el Decreto 768 de 2022 que derogó el Decreto 1607/2002.
 * 
 * Para integrar en MatrizLegal.tsx:
 * 1. Importar plantillaDecreto768 de este archivo
 * 2. Agregar al array plantillasMatrizLegal
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

import { MARCO_LEGAL_CLASIFICACION_RIESGOS } from "@shared/ciiu-unified-classification";

export interface PlantillaMatrizLegal {
  id: string;
  nombre: string;
  descripcion: string;
  campos: {
    categoria: string;
    obligaciones: string;
    normativa: string;
  };
  normativaBase: string;
}

/**
 * Plantilla del Decreto 768/2022 para agregar a la Matriz Legal
 */
export const plantillaDecreto768: PlantillaMatrizLegal = {
  id: "clasificacion-riesgos-arl",
  nombre: "Clasificación de Riesgos Laborales",
  descripcion: "Tabla de Clasificación de Actividades Económicas para el Sistema General de Riesgos Laborales según Decreto 768/2022",
  campos: {
    categoria: "sistema-gestion",
    obligaciones: `Cumplir con la clasificación de riesgo según el Decreto 768 de 2022:
- Identificar el código CIIU de la actividad económica principal
- Clasificar la empresa en la clase de riesgo correspondiente (I, II, III, IV o V)
- Cotizar al Sistema General de Riesgos Laborales según la tarifa de la clase de riesgo
- Empresas con múltiples centros de trabajo pueden tener diferentes clases de riesgo para cada uno
- Clase I: 0.522% | Clase II: 1.044% | Clase III: 2.436% | Clase IV: 4.350% | Clase V: 6.960%
- Vigente desde: 17 de noviembre de 2022`,
    normativa: "Decreto 768/2022, CIIU Rev. 4 A.C."
  },
  normativaBase: "DEC-768-2022"
};

/**
 * Información completa de la normativa Decreto 768/2022
 */
export const normativaDecreto768 = {
  codigo: "DEC-768-2022",
  nombre: "Decreto 768 de 2022",
  entidad: "Ministerio del Trabajo",
  fecha_expedicion: "16 de mayo de 2022",
  fecha_vigencia: "17 de noviembre de 2022",
  objeto: "Actualiza la Tabla de Clasificación de Actividades Económicas para el Sistema General de Riesgos Laborales",
  deroga: ["Decreto 1607 de 2002"],
  articulos_principales: [
    {
      articulo: "1",
      titulo: "Objeto",
      contenido: "Adoptar la Tabla de Clasificación de Actividades Económicas para el Sistema General de Riesgos Laborales"
    },
    {
      articulo: "2",
      titulo: "Campo de aplicación",
      contenido: "Afiliados al SGRL, ARL y operadores de PILA"
    },
    {
      articulo: "4",
      titulo: "Empresas con más de un centro de trabajo",
      contenido: "Pueden tener diferentes clases de riesgo para cada centro"
    },
    {
      articulo: "5",
      titulo: "Clasificación de empresa",
      contenido: "Si la actividad no está en la tabla, clasificar según actividad más afín"
    },
    {
      articulo: "9",
      titulo: "Vigencia y derogatorias",
      contenido: "Deroga el Decreto 1607 de 2002"
    }
  ],
  total_actividades: 1104,
  estructura_codigo: {
    digito_1: "Clase de riesgo (1-5)",
    digitos_2_5: "Código CIIU Rev. 4 A.C.",
    digitos_6_7: "Subactividad económica"
  },
  clases_riesgo: [
    { clase: 1, nivel: "I", tarifa: 0.00522, descripcion: "Mínimo" },
    { clase: 2, nivel: "II", tarifa: 0.01044, descripcion: "Bajo" },
    { clase: 3, nivel: "III", tarifa: 0.02436, descripcion: "Medio" },
    { clase: 4, nivel: "IV", tarifa: 0.04350, descripcion: "Alto" },
    { clase: 5, nivel: "V", tarifa: 0.06960, descripcion: "Máximo" }
  ]
};

/**
 * Resumen de cambios principales del Decreto 768/2022 vs Decreto 1607/2002
 */
export const cambiosDecreto768 = {
  resumen: "El Decreto 768/2022 actualiza la tabla de clasificación de actividades económicas para el Sistema General de Riesgos Laborales, ampliando de 604 a 1,104 actividades económicas.",
  cambios_principales: [
    "Amplía de 604 a 1,104 actividades económicas",
    "Adopta CIIU Rev. 4 adaptada para Colombia",
    "Estructura de código de 7 dígitos",
    "Permite diferentes clases de riesgo por centro de trabajo",
    "Establece procedimiento para actividades no listadas",
    "Deroga completamente el Decreto 1607/2002"
  ],
  vigencia: {
    publicacion: "16 de mayo de 2022",
    entrada_vigor: "17 de noviembre de 2022",
    transicion: "6 meses para actualización de PILA"
  }
};

export { MARCO_LEGAL_CLASIFICACION_RIESGOS };
