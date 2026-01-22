/**
 * Clasificación CIIU → Nivel de Riesgo según Decreto 768 de 2022
 * (Deroga Decreto 1607/2002)
 * 
 * Este archivo COMPLEMENTA el archivo ciiu-risk-classification.ts
 * Contiene códigos CIIU adicionales que no están en el archivo principal.
 * 
 * Estructura del código de 7 dígitos del Decreto 768:
 * - Dígito 1: Clase de riesgo (1-5)
 * - Dígitos 2-5: Código CIIU Rev. 4 A.C.
 * - Dígitos 6-7: Subactividad económica
 * 
 * Vigente desde: 17 de noviembre de 2022
 * 
 * Referencias normativas:
 * - Decreto 768 de 2022 - Ministerio del Trabajo
 * - CIIU Rev. 4 A.C. - Resolución DANE 066 de 2012
 * - Convenio OIT 160 sobre estadísticas del trabajo
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

export type RiskLevel = "I" | "II" | "III" | "IV" | "V";

export interface CiiuDecreto768 {
  ciiu: string;
  description: string;
  riskLevel: RiskLevel;
  riskClass: 1 | 2 | 3 | 4 | 5;
  cotizacion: number;
  division: string;
  codigo7Digitos?: string;
}

export const TASAS_COTIZACION = {
  1: 0.00522, // Clase I - 0.522%
  2: 0.01044, // Clase II - 1.044%
  3: 0.02436, // Clase III - 2.436%
  4: 0.04350, // Clase IV - 4.350%
  5: 0.06960, // Clase V - 6.960%
} as const;

const riskClassFromLevel = (level: RiskLevel): 1 | 2 | 3 | 4 | 5 => {
  const map: Record<RiskLevel, 1 | 2 | 3 | 4 | 5> = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5
  };
  return map[level];
};

const cotizacionFromLevel = (level: RiskLevel): number => {
  return TASAS_COTIZACION[riskClassFromLevel(level)];
};

/**
 * Códigos CIIU adicionales del Decreto 768/2022
 * Estos códigos complementan los del archivo ciiu-risk-classification.ts
 * 
 * Incluye:
 * - Subactividades específicas (códigos de 7 dígitos)
 * - Códigos nuevos agregados por el Decreto 768/2022
 * - Actividades que no estaban en el Decreto 1607/2002
 */
export const CIIU_DECRETO_768: Record<string, CiiuDecreto768> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 01: AGRICULTURA - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Cultivos especializados
  "0116": { ciiu: "0116", description: "Cultivo de plantas para la obtención de fibras", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "01" },
  "0117": { ciiu: "0117", description: "Cultivo de plantas vivas, incluida la producción de esquejes", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "01" },
  "0131": { ciiu: "0131", description: "Producción de semillas de plantas agrícolas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "01" },
  "0132": { ciiu: "0132", description: "Producción de esquejes y bulbos de plantas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "01" },
  "0146": { ciiu: "0146", description: "Cría de conejos y otros pequeños mamíferos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "01" },
  "0147": { ciiu: "0147", description: "Apicultura y producción de miel", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "01" },
  "0148": { ciiu: "0148", description: "Cría de animales domésticos y mascotas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "01" },
  "0151": { ciiu: "0151", description: "Producción agrícola combinada con cría de animales de granja", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "01" },
  "0152": { ciiu: "0152", description: "Explotación mixta de cultivos y ganadería menor", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "01" },
  "0165": { ciiu: "0165", description: "Actividades de apoyo a la floricultura", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "01" },
  "0166": { ciiu: "0166", description: "Actividades de fumigación aérea agrícola", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "01" },
  "0167": { ciiu: "0167", description: "Actividades de riego y drenaje agrícola", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "01" },
  "0168": { ciiu: "0168", description: "Actividades de servicios fitosanitarios", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "01" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 02: SILVICULTURA - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "0211": { ciiu: "0211", description: "Silvicultura en bosques plantados", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "02" },
  "0212": { ciiu: "0212", description: "Silvicultura en bosques naturales", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "02" },
  "0221": { ciiu: "0221", description: "Extracción de madera en bosques plantados", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "02" },
  "0222": { ciiu: "0222", description: "Extracción de madera en bosques naturales", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "02" },
  "0231": { ciiu: "0231", description: "Recolección de productos forestales no maderables", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "02" },
  "0241": { ciiu: "0241", description: "Servicios de plantación forestal", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "02" },
  "0242": { ciiu: "0242", description: "Servicios de mantenimiento forestal", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "02" },
  "0243": { ciiu: "0243", description: "Servicios de prevención de incendios forestales", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "02" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 03: PESCA Y ACUICULTURA - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "0313": { ciiu: "0313", description: "Pesca artesanal marítima", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "03" },
  "0314": { ciiu: "0314", description: "Pesca industrial marítima", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "03" },
  "0315": { ciiu: "0315", description: "Pesca artesanal de agua dulce", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "03" },
  "0323": { ciiu: "0323", description: "Cultivo de camarón en estanques", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "03" },
  "0324": { ciiu: "0324", description: "Cultivo de tilapia y otras especies de agua dulce", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "03" },
  "0325": { ciiu: "0325", description: "Producción de alevines y semilla de peces", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "03" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 05-09: MINERÍA - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "0511": { ciiu: "0511", description: "Extracción de hulla subterránea", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "05" },
  "0512": { ciiu: "0512", description: "Extracción de hulla a cielo abierto", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "05" },
  "0521": { ciiu: "0521", description: "Extracción de lignito subterráneo", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "05" },
  "0522": { ciiu: "0522", description: "Extracción de lignito a cielo abierto", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "05" },
  "0611": { ciiu: "0611", description: "Extracción de petróleo crudo en tierra", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "06" },
  "0612": { ciiu: "0612", description: "Extracción de petróleo crudo costa afuera", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "06" },
  "0621": { ciiu: "0621", description: "Extracción de gas natural en tierra", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "06" },
  "0622": { ciiu: "0622", description: "Extracción de gas natural costa afuera", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "06" },
  "0724": { ciiu: "0724", description: "Extracción de cobre", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "07" },
  "0725": { ciiu: "0725", description: "Extracción de bauxita", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "07" },
  "0813": { ciiu: "0813", description: "Extracción de piedras ornamentales y de construcción", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "08" },
  "0814": { ciiu: "0814", description: "Extracción de arenas y gravas", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "08" },
  "0893": { ciiu: "0893", description: "Extracción de azufre", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "08" },
  "0894": { ciiu: "0894", description: "Extracción de asfaltita y asfalto natural", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "08" },
  "0911": { ciiu: "0911", description: "Actividades de perforación de pozos petroleros", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "09" },
  "0912": { ciiu: "0912", description: "Servicios de cementación y estimulación de pozos", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "09" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 10: ALIMENTOS - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "1013": { ciiu: "1013", description: "Procesamiento y conservación de carnes de aves de corral", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  "1014": { ciiu: "1014", description: "Producción de embutidos y productos similares de carne", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  "1021": { ciiu: "1021", description: "Procesamiento de frutas frescas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1022": { ciiu: "1022", description: "Procesamiento de legumbres frescas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1031": { ciiu: "1031", description: "Elaboración de aceites vegetales crudos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  "1032": { ciiu: "1032", description: "Elaboración de aceites vegetales refinados", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  "1041": { ciiu: "1041", description: "Elaboración de leche pasteurizada y ultrapasteurizada", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1042": { ciiu: "1042", description: "Elaboración de quesos y derivados lácteos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1043": { ciiu: "1043", description: "Elaboración de helados y postres lácteos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1053": { ciiu: "1053", description: "Elaboración de harinas integrales y mezclas", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  "1064": { ciiu: "1064", description: "Elaboración de café instantáneo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1073": { ciiu: "1073", description: "Elaboración de melaza", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  "1085": { ciiu: "1085", description: "Elaboración de salsas y aderezos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1086": { ciiu: "1086", description: "Elaboración de alimentos para bebés", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1091": { ciiu: "1091", description: "Elaboración de alimentos para mascotas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "10" },
  "1092": { ciiu: "1092", description: "Elaboración de alimentos concentrados para animales de granja", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "10" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 11-12: BEBIDAS Y TABACO - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "1105": { ciiu: "1105", description: "Elaboración de jugos de frutas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "11" },
  "1106": { ciiu: "1106", description: "Elaboración de bebidas energizantes", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "11" },
  "1107": { ciiu: "1107", description: "Embotellado de agua purificada", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "11" },
  "1201": { ciiu: "1201", description: "Procesamiento de tabaco en rama", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "12" },
  "1202": { ciiu: "1202", description: "Fabricación de cigarrillos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "12" },
  "1203": { ciiu: "1203", description: "Fabricación de cigarros y puros", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "12" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 13-15: TEXTILES, CONFECCIONES Y CUERO - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "1314": { ciiu: "1314", description: "Preparación y teñido de pieles", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "13" },
  "1395": { ciiu: "1395", description: "Fabricación de telas no tejidas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "13" },
  "1396": { ciiu: "1396", description: "Fabricación de textiles técnicos e industriales", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "13" },
  "1411": { ciiu: "1411", description: "Confección de ropa exterior para hombres y niños", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "14" },
  "1412": { ciiu: "1412", description: "Confección de ropa exterior para mujeres y niñas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "14" },
  "1413": { ciiu: "1413", description: "Confección de ropa interior y de dormir", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "14" },
  "1414": { ciiu: "1414", description: "Confección de ropa de trabajo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "14" },
  "1415": { ciiu: "1415", description: "Confección de ropa deportiva", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "14" },
  "1421": { ciiu: "1421", description: "Confección de artículos de piel natural", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "14" },
  "1514": { ciiu: "1514", description: "Fabricación de guarnicionería y talabartería", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "15" },
  "1524": { ciiu: "1524", description: "Fabricación de calzado de material sintético", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "15" },
  "1525": { ciiu: "1525", description: "Fabricación de calzado deportivo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "15" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 16-18: MADERA, PAPEL E IMPRESIÓN - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "1621": { ciiu: "1621", description: "Fabricación de tableros de partículas y fibra", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "16" },
  "1622": { ciiu: "1622", description: "Fabricación de tableros contrachapados", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "16" },
  "1631": { ciiu: "1631", description: "Fabricación de puertas y ventanas de madera", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "16" },
  "1632": { ciiu: "1632", description: "Fabricación de estructuras de madera", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "16" },
  "1641": { ciiu: "1641", description: "Fabricación de embalajes de madera", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "16" },
  "1691": { ciiu: "1691", description: "Fabricación de artículos de corcho", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "16" },
  "1692": { ciiu: "1692", description: "Fabricación de artículos de cestería y espartería", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "16" },
  "1703": { ciiu: "1703", description: "Fabricación de papel higiénico y productos sanitarios", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "17" },
  "1704": { ciiu: "1704", description: "Fabricación de productos de papel para oficina", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "17" },
  "1813": { ciiu: "1813", description: "Actividades de preimpresión", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "18" },
  "1814": { ciiu: "1814", description: "Encuadernación y actividades conexas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "18" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 19-21: PETRÓLEO, QUÍMICOS Y FARMACÉUTICOS - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "1923": { ciiu: "1923", description: "Fabricación de asfaltos y sus mezclas para construcción", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "19" },
  "1924": { ciiu: "1924", description: "Fabricación de lubricantes", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "19" },
  "2015": { ciiu: "2015", description: "Fabricación de gases industriales", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "20" },
  "2016": { ciiu: "2016", description: "Fabricación de colorantes y pigmentos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "20" },
  "2024": { ciiu: "2024", description: "Fabricación de productos de limpieza industrial", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "20" },
  "2025": { ciiu: "2025", description: "Fabricación de cosméticos y productos de tocador", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "20" },
  "2026": { ciiu: "2026", description: "Fabricación de perfumes y fragancias", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "20" },
  "2031": { ciiu: "2031", description: "Fabricación de fibras sintéticas de poliéster", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "20" },
  "2032": { ciiu: "2032", description: "Fabricación de fibras sintéticas de nylon", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "20" },
  "2101": { ciiu: "2101", description: "Fabricación de productos farmacéuticos básicos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "21" },
  "2102": { ciiu: "2102", description: "Fabricación de preparados farmacéuticos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "21" },
  "2103": { ciiu: "2103", description: "Fabricación de productos biológicos y vacunas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "21" },
  "2104": { ciiu: "2104", description: "Fabricación de productos naturales y homeopáticos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "21" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 22-24: CAUCHO, PLÁSTICO Y METALES - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "2213": { ciiu: "2213", description: "Fabricación de bandas y correas de caucho", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "22" },
  "2214": { ciiu: "2214", description: "Fabricación de productos de caucho para uso industrial", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "22" },
  "2222": { ciiu: "2222", description: "Fabricación de envases plásticos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "22" },
  "2223": { ciiu: "2223", description: "Fabricación de materiales plásticos para construcción", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "22" },
  "2320": { ciiu: "2320", description: "Fabricación de productos cerámicos refractarios", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "23" },
  "2331": { ciiu: "2331", description: "Fabricación de baldosas y azulejos de cerámica", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "23" },
  "2411": { ciiu: "2411", description: "Fabricación de productos de hierro primario", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "24" },
  "2412": { ciiu: "2412", description: "Fabricación de productos de acero primario", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "24" },
  "2413": { ciiu: "2413", description: "Fabricación de tubos y perfiles de acero", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "24" },
  "2422": { ciiu: "2422", description: "Fundición y refinación de plata", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "24" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 25-27: PRODUCTOS METÁLICOS Y ELÉCTRICOS - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "2514": { ciiu: "2514", description: "Fabricación de calderas de agua caliente", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "25" },
  "2521": { ciiu: "2521", description: "Fabricación de armas cortas", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "25" },
  "2522": { ciiu: "2522", description: "Fabricación de municiones y explosivos", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "25" },
  "2594": { ciiu: "2594", description: "Fabricación de pernos, tuercas y productos similares", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "25" },
  "2595": { ciiu: "2595", description: "Fabricación de muelles y resortes de metal", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "25" },
  "2596": { ciiu: "2596", description: "Fabricación de cables y cadenas de metal", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "25" },
  "2611": { ciiu: "2611", description: "Fabricación de circuitos integrados", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "26" },
  "2612": { ciiu: "2612", description: "Fabricación de semiconductores", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "26" },
  "2621": { ciiu: "2621", description: "Fabricación de computadores de escritorio", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "26" },
  "2622": { ciiu: "2622", description: "Fabricación de computadores portátiles", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "26" },
  "2631": { ciiu: "2631", description: "Fabricación de equipos de telefonía fija", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "26" },
  "2632": { ciiu: "2632", description: "Fabricación de equipos de telefonía móvil", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "26" },
  "2713": { ciiu: "2713", description: "Fabricación de interruptores y contactos eléctricos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "27" },
  "2721": { ciiu: "2721", description: "Fabricación de baterías secas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "27" },
  "2722": { ciiu: "2722", description: "Fabricación de acumuladores eléctricos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "27" },
  "2741": { ciiu: "2741", description: "Fabricación de lámparas y bombillas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "27" },
  "2742": { ciiu: "2742", description: "Fabricación de luminarias y aparatos de iluminación", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "27" },
  "2751": { ciiu: "2751", description: "Fabricación de electrodomésticos de cocina", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "27" },
  "2752": { ciiu: "2752", description: "Fabricación de electrodomésticos de limpieza", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "27" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 28-30: MAQUINARIA Y EQUIPOS DE TRANSPORTE - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "2831": { ciiu: "2831", description: "Fabricación de tractores agrícolas", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "28" },
  "2832": { ciiu: "2832", description: "Fabricación de implementos agrícolas", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "28" },
  "2841": { ciiu: "2841", description: "Fabricación de máquinas herramienta para metales", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "28" },
  "2842": { ciiu: "2842", description: "Fabricación de máquinas herramienta para madera", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "28" },
  "2891": { ciiu: "2891", description: "Fabricación de maquinaria para minería", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "28" },
  "2892": { ciiu: "2892", description: "Fabricación de maquinaria para construcción", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "28" },
  "2911": { ciiu: "2911", description: "Fabricación de vehículos automotores para pasajeros", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "29" },
  "2912": { ciiu: "2912", description: "Fabricación de vehículos automotores de carga", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "29" },
  "2921": { ciiu: "2921", description: "Fabricación de carrocerías para buses", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "29" },
  "2922": { ciiu: "2922", description: "Fabricación de carrocerías para camiones", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "29" },
  "2931": { ciiu: "2931", description: "Fabricación de partes eléctricas para vehículos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "29" },
  "2932": { ciiu: "2932", description: "Fabricación de partes mecánicas para vehículos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "29" },
  "3013": { ciiu: "3013", description: "Construcción de plataformas flotantes", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "30" },
  "3021": { ciiu: "3021", description: "Fabricación de vagones de pasajeros", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "30" },
  "3022": { ciiu: "3022", description: "Fabricación de vagones de carga", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "30" },
  "3031": { ciiu: "3031", description: "Fabricación de aviones comerciales", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "30" },
  "3032": { ciiu: "3032", description: "Fabricación de helicópteros", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "30" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 31-33: MUEBLES Y OTRAS MANUFACTURAS - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "3111": { ciiu: "3111", description: "Fabricación de muebles de madera para el hogar", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "31" },
  "3112": { ciiu: "3112", description: "Fabricación de muebles de madera para oficina", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "31" },
  "3113": { ciiu: "3113", description: "Fabricación de muebles metálicos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "31" },
  "3114": { ciiu: "3114", description: "Fabricación de muebles plásticos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "31" },
  "3121": { ciiu: "3121", description: "Fabricación de colchones de resortes", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "31" },
  "3122": { ciiu: "3122", description: "Fabricación de colchones de espuma", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "31" },
  "3211": { ciiu: "3211", description: "Fabricación de joyas de oro y plata", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "32" },
  "3212": { ciiu: "3212", description: "Fabricación de bisutería", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "32" },
  "3251": { ciiu: "3251", description: "Fabricación de instrumentos médicos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "32" },
  "3252": { ciiu: "3252", description: "Fabricación de prótesis y aparatos ortopédicos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "32" },
  "3253": { ciiu: "3253", description: "Fabricación de equipos dentales", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "32" },
  "3291": { ciiu: "3291", description: "Fabricación de escobas y cepillos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "32" },
  "3292": { ciiu: "3292", description: "Fabricación de ataúdes y urnas funerarias", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "32" },
  "3316": { ciiu: "3316", description: "Mantenimiento y reparación de aeronaves", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "33" },
  "3317": { ciiu: "3317", description: "Mantenimiento y reparación de embarcaciones", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "33" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 35-39: SERVICIOS PÚBLICOS Y AMBIENTALES - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "3515": { ciiu: "3515", description: "Generación de energía eléctrica de origen térmico", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "35" },
  "3516": { ciiu: "3516", description: "Generación de energía eléctrica de origen hidráulico", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "35" },
  "3517": { ciiu: "3517", description: "Generación de energía eléctrica de origen solar", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "35" },
  "3518": { ciiu: "3518", description: "Generación de energía eléctrica de origen eólico", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "35" },
  "3521": { ciiu: "3521", description: "Producción de gas por gasificación de carbón", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "35" },
  "3522": { ciiu: "3522", description: "Distribución de gas natural por redes", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "35" },
  "3601": { ciiu: "3601", description: "Captación de agua superficial", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "36" },
  "3602": { ciiu: "3602", description: "Captación de agua subterránea", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "36" },
  "3603": { ciiu: "3603", description: "Tratamiento y potabilización de agua", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "36" },
  "3701": { ciiu: "3701", description: "Alcantarillado y evacuación de aguas servidas", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "37" },
  "3702": { ciiu: "3702", description: "Tratamiento de aguas residuales industriales", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "37" },
  "3813": { ciiu: "3813", description: "Recolección de residuos sólidos urbanos", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "38" },
  "3814": { ciiu: "3814", description: "Recolección de escombros", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "38" },
  "3823": { ciiu: "3823", description: "Disposición final de residuos en rellenos sanitarios", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "38" },
  "3831": { ciiu: "3831", description: "Recuperación de materiales metálicos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "38" },
  "3832": { ciiu: "3832", description: "Recuperación de papel y cartón", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "38" },
  "3833": { ciiu: "3833", description: "Recuperación de plásticos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "38" },
  "3901": { ciiu: "3901", description: "Remediación de suelos contaminados", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "39" },
  "3902": { ciiu: "3902", description: "Remediación de cuerpos de agua", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "39" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 41-43: CONSTRUCCIÓN - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "4113": { ciiu: "4113", description: "Construcción de edificaciones mixtas", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "41" },
  "4114": { ciiu: "4114", description: "Remodelación de edificaciones", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "41" },
  "4211": { ciiu: "4211", description: "Construcción de autopistas y carreteras", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4212": { ciiu: "4212", description: "Construcción de vías férreas", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4213": { ciiu: "4213", description: "Construcción de puentes y túneles", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4221": { ciiu: "4221", description: "Construcción de redes de acueducto", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4222": { ciiu: "4222", description: "Construcción de redes de alcantarillado", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4223": { ciiu: "4223", description: "Construcción de líneas de transmisión eléctrica", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4224": { ciiu: "4224", description: "Construcción de redes de telecomunicaciones", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "42" },
  "4291": { ciiu: "4291", description: "Construcción de obras marítimas y fluviales", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4292": { ciiu: "4292", description: "Construcción de instalaciones deportivas", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "42" },
  "4313": { ciiu: "4313", description: "Perforación y sondeo de suelos", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "43" },
  "4314": { ciiu: "4314", description: "Movimiento de tierras", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "43" },
  "4323": { ciiu: "4323", description: "Instalación de ascensores y escaleras eléctricas", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "43" },
  "4324": { ciiu: "4324", description: "Instalación de sistemas contra incendio", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "43" },
  "4331": { ciiu: "4331", description: "Trabajos de pintura y acabados de paredes", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "43" },
  "4332": { ciiu: "4332", description: "Instalación de vidrios y espejos", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "43" },
  "4333": { ciiu: "4333", description: "Instalación de pisos y revestimientos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "43" },
  "4391": { ciiu: "4391", description: "Trabajos de montaje de estructuras metálicas", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "43" },
  "4392": { ciiu: "4392", description: "Trabajos de impermeabilización", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "43" },
  "4393": { ciiu: "4393", description: "Trabajos de aislamiento térmico y acústico", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "43" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 45-47: COMERCIO - Subactividades Decreto 768/2022
  // ═══════════════════════════════════════════════════════════════════════════
  
  "4513": { ciiu: "4513", description: "Comercio de vehículos eléctricos e híbridos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "45" },
  "4521": { ciiu: "4521", description: "Mantenimiento mecánico de vehículos automotores", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "45" },
  "4522": { ciiu: "4522", description: "Servicio de latonería y pintura de vehículos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "45" },
  "4523": { ciiu: "4523", description: "Servicio de electricidad automotriz", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "45" },
  "4531": { ciiu: "4531", description: "Comercio al por mayor de repuestos nuevos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "45" },
  "4532": { ciiu: "4532", description: "Comercio al por menor de repuestos usados", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "45" },
  "4621": { ciiu: "4621", description: "Comercio al por mayor de granos y cereales", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "46" },
  "4622": { ciiu: "4622", description: "Comercio al por mayor de flores y plantas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "46" },
  "4633": { ciiu: "4633", description: "Comercio al por mayor de productos cárnicos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "46" },
  "4634": { ciiu: "4634", description: "Comercio al por mayor de productos del mar", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "46" },
  "4646": { ciiu: "4646", description: "Comercio al por mayor de artículos de papelería", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "46" },
  "4654": { ciiu: "4654", description: "Comercio al por mayor de equipos médicos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "46" },
  "4655": { ciiu: "4655", description: "Comercio al por mayor de mobiliario", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "46" },
  "4666": { ciiu: "4666", description: "Comercio al por mayor de equipo de transporte", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "46" },
  "4725": { ciiu: "4725", description: "Comercio al por menor de frutas y verduras", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4726": { ciiu: "4726", description: "Comercio al por menor de productos de panadería", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4733": { ciiu: "4733", description: "Comercio al por menor de GLP para vehículos", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "47" },
  "4743": { ciiu: "4743", description: "Comercio al por menor de software empaquetado", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4756": { ciiu: "4756", description: "Comercio al por menor de materiales de construcción", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "47" },
  "4763": { ciiu: "4763", description: "Comercio al por menor de instrumentos musicales", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4764": { ciiu: "4764", description: "Comercio al por menor de juguetes", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4776": { ciiu: "4776", description: "Comercio al por menor de flores y plantas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4777": { ciiu: "4777", description: "Comercio al por menor de joyas y relojes", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  "4778": { ciiu: "4778", description: "Comercio al por menor de artículos ópticos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "47" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 49-53: TRANSPORTE Y ALMACENAMIENTO - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "4913": { ciiu: "4913", description: "Transporte de pasajeros por metro", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4914": { ciiu: "4914", description: "Transporte de pasajeros por tranvía", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4924": { ciiu: "4924", description: "Transporte escolar", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4925": { ciiu: "4925", description: "Transporte especial de pasajeros", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4926": { ciiu: "4926", description: "Servicio de taxi", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4927": { ciiu: "4927", description: "Servicio de transporte por aplicaciones móviles", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4931": { ciiu: "4931", description: "Transporte de carga pesada por carretera", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "49" },
  "4932": { ciiu: "4932", description: "Transporte de carga liviana por carretera", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4933": { ciiu: "4933", description: "Servicio de mudanzas", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "49" },
  "4941": { ciiu: "4941", description: "Transporte de petróleo y derivados por tubería", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "49" },
  "4942": { ciiu: "4942", description: "Transporte de gas natural por tubería", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "49" },
  "5013": { ciiu: "5013", description: "Transporte de carga en buques tanque", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "50" },
  "5014": { ciiu: "5014", description: "Transporte de carga en buques portacontenedores", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "50" },
  "5113": { ciiu: "5113", description: "Transporte aéreo de pasajeros en vuelos chárter", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "51" },
  "5114": { ciiu: "5114", description: "Servicio de ambulancia aérea", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "51" },
  "5211": { ciiu: "5211", description: "Almacenamiento de productos agrícolas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "52" },
  "5212": { ciiu: "5212", description: "Almacenamiento frigorífico", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "52" },
  "5213": { ciiu: "5213", description: "Almacenamiento de productos peligrosos", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "52" },
  "5225": { ciiu: "5225", description: "Operación de parqueaderos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "52" },
  "5226": { ciiu: "5226", description: "Servicios de grúas y remolque", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "52" },
  "5311": { ciiu: "5311", description: "Servicios postales de correspondencia", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "53" },
  "5312": { ciiu: "5312", description: "Servicios postales de paquetería", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "53" },
  "5321": { ciiu: "5321", description: "Servicios de mensajería urbana", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "53" },
  "5322": { ciiu: "5322", description: "Servicios de mensajería intermunicipal", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "53" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 55-56: ALOJAMIENTO Y SERVICIOS DE COMIDA - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "5515": { ciiu: "5515", description: "Alojamiento en hostales", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "55" },
  "5516": { ciiu: "5516", description: "Alojamiento en albergues", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "55" },
  "5521": { ciiu: "5521", description: "Campamentos turísticos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "55" },
  "5591": { ciiu: "5591", description: "Alojamiento en residencias estudiantiles", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "55" },
  "5614": { ciiu: "5614", description: "Expendio de comidas rápidas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "56" },
  "5615": { ciiu: "5615", description: "Expendio de comidas por medios móviles (food trucks)", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "56" },
  "5622": { ciiu: "5622", description: "Catering industrial", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "56" },
  "5623": { ciiu: "5623", description: "Servicios de comidas para colegios", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "56" },
  "5631": { ciiu: "5631", description: "Expendio de bebidas en bares", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "56" },
  "5632": { ciiu: "5632", description: "Expendio de bebidas en discotecas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "56" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 58-63: INFORMACIÓN Y COMUNICACIONES - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "5821": { ciiu: "5821", description: "Edición de software de sistemas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "58" },
  "5822": { ciiu: "5822", description: "Edición de software de aplicaciones", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "58" },
  "5823": { ciiu: "5823", description: "Edición de videojuegos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "58" },
  "5915": { ciiu: "5915", description: "Producción de contenido digital audiovisual", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "59" },
  "5921": { ciiu: "5921", description: "Producción de música", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "59" },
  "5922": { ciiu: "5922", description: "Producción de podcasts", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "59" },
  "6011": { ciiu: "6011", description: "Emisoras de radio comerciales", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "60" },
  "6012": { ciiu: "6012", description: "Emisoras de radio comunitarias", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "60" },
  "6021": { ciiu: "6021", description: "Canales de televisión abierta", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "60" },
  "6022": { ciiu: "6022", description: "Canales de televisión por suscripción", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "60" },
  "6111": { ciiu: "6111", description: "Servicios de telefonía fija", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "61" },
  "6112": { ciiu: "6112", description: "Servicios de internet fijo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "61" },
  "6121": { ciiu: "6121", description: "Servicios de telefonía móvil", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "61" },
  "6122": { ciiu: "6122", description: "Servicios de internet móvil", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "61" },
  "6203": { ciiu: "6203", description: "Gestión de centros de datos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "62" },
  "6204": { ciiu: "6204", description: "Servicios de seguridad informática", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "62" },
  "6313": { ciiu: "6313", description: "Servicios de computación en la nube", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "63" },
  "6314": { ciiu: "6314", description: "Servicios de análisis de datos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "63" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 64-66: ACTIVIDADES FINANCIERAS - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "6413": { ciiu: "6413", description: "Actividades de bancos digitales", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "64" },
  "6425": { ciiu: "6425", description: "Actividades de cooperativas de ahorro y crédito", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "64" },
  "6433": { ciiu: "6433", description: "Fondos de pensiones voluntarias", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "64" },
  "6496": { ciiu: "6496", description: "Actividades de microcrédito", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "64" },
  "6497": { ciiu: "6497", description: "Servicios de pago electrónico", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "64" },
  "6515": { ciiu: "6515", description: "Seguros de accidentes personales", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "65" },
  "6516": { ciiu: "6516", description: "Seguros de vehículos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "65" },
  "6523": { ciiu: "6523", description: "Administración del régimen subsidiado en salud", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "65" },
  "6616": { ciiu: "6616", description: "Corresponsales bancarios", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "66" },
  "6622": { ciiu: "6622", description: "Actividades de ajustadores de seguros", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "66" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 68-75: INMOBILIARIAS Y PROFESIONALES - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "6811": { ciiu: "6811", description: "Compra y venta de inmuebles propios", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "68" },
  "6812": { ciiu: "6812", description: "Alquiler de inmuebles propios", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "68" },
  "6821": { ciiu: "6821", description: "Administración de propiedad horizontal", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "68" },
  "6822": { ciiu: "6822", description: "Corretaje de bienes raíces", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "68" },
  "6911": { ciiu: "6911", description: "Servicios de abogados", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "69" },
  "6912": { ciiu: "6912", description: "Servicios de notarías", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "69" },
  "6921": { ciiu: "6921", description: "Servicios de contaduría pública", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "69" },
  "6922": { ciiu: "6922", description: "Servicios de revisoría fiscal", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "69" },
  "7011": { ciiu: "7011", description: "Actividades de sedes administrativas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "70" },
  "7021": { ciiu: "7021", description: "Consultoría en gestión financiera", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "70" },
  "7022": { ciiu: "7022", description: "Consultoría en gestión de recursos humanos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "70" },
  "7111": { ciiu: "7111", description: "Servicios de arquitectura", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "71" },
  "7112": { ciiu: "7112", description: "Servicios de ingeniería civil", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "71" },
  "7113": { ciiu: "7113", description: "Servicios de ingeniería eléctrica", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "71" },
  "7114": { ciiu: "7114", description: "Servicios de ingeniería ambiental", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "71" },
  "7121": { ciiu: "7121", description: "Ensayos de materiales de construcción", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "71" },
  "7122": { ciiu: "7122", description: "Ensayos de productos alimenticios", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "71" },
  "7211": { ciiu: "7211", description: "Investigación en ciencias biológicas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "72" },
  "7212": { ciiu: "7212", description: "Investigación en ciencias físicas y químicas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "72" },
  "7311": { ciiu: "7311", description: "Agencias de publicidad", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "73" },
  "7312": { ciiu: "7312", description: "Servicios de publicidad exterior", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "73" },
  "7321": { ciiu: "7321", description: "Estudios de mercado cuantitativos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "73" },
  "7411": { ciiu: "7411", description: "Diseño gráfico", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "74" },
  "7412": { ciiu: "7412", description: "Diseño de interiores", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "74" },
  "7413": { ciiu: "7413", description: "Diseño industrial y de productos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "74" },
  "7421": { ciiu: "7421", description: "Fotografía comercial y publicitaria", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "74" },
  "7422": { ciiu: "7422", description: "Fotografía de eventos sociales", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "74" },
  "7491": { ciiu: "7491", description: "Servicios de traducción e interpretación", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "74" },
  "7501": { ciiu: "7501", description: "Servicios veterinarios para animales de compañía", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "75" },
  "7502": { ciiu: "7502", description: "Servicios veterinarios para animales de producción", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "75" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 77-82: SERVICIOS ADMINISTRATIVOS - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "7711": { ciiu: "7711", description: "Alquiler de automóviles sin conductor", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "77" },
  "7712": { ciiu: "7712", description: "Alquiler de camiones sin conductor", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "77" },
  "7723": { ciiu: "7723", description: "Alquiler de libros y revistas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "77" },
  "7731": { ciiu: "7731", description: "Alquiler de maquinaria agrícola", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "77" },
  "7732": { ciiu: "7732", description: "Alquiler de maquinaria para construcción", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "77" },
  "7733": { ciiu: "7733", description: "Alquiler de equipos de oficina", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "77" },
  "7811": { ciiu: "7811", description: "Agencias de empleo para ejecutivos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "78" },
  "7821": { ciiu: "7821", description: "Suministro de personal temporal administrativo", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "78" },
  "7822": { ciiu: "7822", description: "Suministro de personal temporal operativo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "78" },
  "7913": { ciiu: "7913", description: "Actividades de agencias de viajes corporativas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "79" },
  "7991": { ciiu: "7991", description: "Servicios de guías turísticos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "79" },
  "8011": { ciiu: "8011", description: "Servicios de vigilancia armada", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "80" },
  "8012": { ciiu: "8012", description: "Servicios de vigilancia sin armas", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "80" },
  "8013": { ciiu: "8013", description: "Escoltas y protección personal", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "80" },
  "8021": { ciiu: "8021", description: "Monitoreo de alarmas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "80" },
  "8022": { ciiu: "8022", description: "Instalación de sistemas de seguridad", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "80" },
  "8111": { ciiu: "8111", description: "Servicios de recepción y conserjería", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "81" },
  "8122": { ciiu: "8122", description: "Servicios de limpieza de fachadas", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "81" },
  "8123": { ciiu: "8123", description: "Servicios de desinfección y fumigación", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "81" },
  "8131": { ciiu: "8131", description: "Servicios de jardinería ornamental", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "81" },
  "8132": { ciiu: "8132", description: "Servicios de poda de árboles", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "81" },
  "8212": { ciiu: "8212", description: "Servicios de digitalización de documentos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "82" },
  "8221": { ciiu: "8221", description: "Centros de atención telefónica inbound", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "82" },
  "8222": { ciiu: "8222", description: "Centros de atención telefónica outbound", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "82" },
  "8231": { ciiu: "8231", description: "Organización de ferias y exposiciones", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "82" },
  "8293": { ciiu: "8293", description: "Servicios de cobranza judicial", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "82" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 84: ADMINISTRACIÓN PÚBLICA - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "8416": { ciiu: "8416", description: "Administración de recursos tributarios", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "84" },
  "8417": { ciiu: "8417", description: "Administración de registros públicos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "84" },
  "8425": { ciiu: "8425", description: "Actividades de bomberos", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "84" },
  "8426": { ciiu: "8426", description: "Defensa civil", riskLevel: "V", riskClass: 5, cotizacion: 0.06960, division: "84" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 85: EDUCACIÓN - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "8514": { ciiu: "8514", description: "Educación especial para niños con discapacidad", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "85" },
  "8524": { ciiu: "8524", description: "Educación media técnica en artes", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "85" },
  "8531": { ciiu: "8531", description: "Educación combinada primaria y secundaria", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "85" },
  "8545": { ciiu: "8545", description: "Educación de posgrado", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "85" },
  "8554": { ciiu: "8554", description: "Enseñanza de idiomas", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "85" },
  "8555": { ciiu: "8555", description: "Enseñanza de informática", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "85" },
  "8556": { ciiu: "8556", description: "Enseñanza de conducción", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "85" },
  "8561": { ciiu: "8561", description: "Capacitación empresarial", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "85" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 86-88: SALUD Y ASISTENCIA SOCIAL - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "8611": { ciiu: "8611", description: "Actividades de hospitales generales", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "86" },
  "8612": { ciiu: "8612", description: "Actividades de clínicas especializadas", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "86" },
  "8613": { ciiu: "8613", description: "Actividades de hospitales psiquiátricos", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "86" },
  "8623": { ciiu: "8623", description: "Consulta externa médica general", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "86" },
  "8624": { ciiu: "8624", description: "Consulta externa médica especializada", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "86" },
  "8693": { ciiu: "8693", description: "Servicios de ambulancia terrestre", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "86" },
  "8694": { ciiu: "8694", description: "Servicios de atención domiciliaria", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "86" },
  "8695": { ciiu: "8695", description: "Servicios de optometría", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "86" },
  "8696": { ciiu: "8696", description: "Servicios de medicina alternativa", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "86" },
  "8711": { ciiu: "8711", description: "Hogares geriátricos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "87" },
  "8721": { ciiu: "8721", description: "Centros de rehabilitación para drogadicción", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "87" },
  "8731": { ciiu: "8731", description: "Hogares para personas con discapacidad física", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "87" },
  "8811": { ciiu: "8811", description: "Servicios de cuidado diurno para ancianos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "88" },
  "8891": { ciiu: "8891", description: "Guarderías y jardines infantiles", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "88" },
  "8892": { ciiu: "8892", description: "Hogares de paso y albergues", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "88" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 90-93: ENTRETENIMIENTO Y RECREACIÓN - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9009": { ciiu: "9009", description: "Producción de eventos culturales", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "90" },
  "9104": { ciiu: "9104", description: "Actividades de parques naturales", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "91" },
  "9105": { ciiu: "9105", description: "Actividades de acuarios", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "91" },
  "9201": { ciiu: "9201", description: "Operación de casinos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "92" },
  "9202": { ciiu: "9202", description: "Operación de bingos", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "92" },
  "9203": { ciiu: "9203", description: "Apuestas en eventos deportivos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "92" },
  "9204": { ciiu: "9204", description: "Loterías y juegos de suerte", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "92" },
  "9313": { ciiu: "9313", description: "Gimnasios y centros de acondicionamiento físico", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "93" },
  "9314": { ciiu: "9314", description: "Escuelas deportivas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "93" },
  "9322": { ciiu: "9322", description: "Operación de juegos mecánicos", riskLevel: "IV", riskClass: 4, cotizacion: 0.04350, division: "93" },
  "9323": { ciiu: "9323", description: "Salas de videojuegos", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "93" },
  "9324": { ciiu: "9324", description: "Boleras y billares", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "93" },
  "9325": { ciiu: "9325", description: "Balnearios y piscinas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "93" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 94-96: OTRAS ACTIVIDADES DE SERVICIOS - Subactividades Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9413": { ciiu: "9413", description: "Actividades de cámaras de comercio", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "94" },
  "9493": { ciiu: "9493", description: "Actividades de fundaciones y ONG", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "94" },
  "9494": { ciiu: "9494", description: "Actividades de juntas de acción comunal", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "94" },
  "9513": { ciiu: "9513", description: "Reparación de electrodomésticos menores", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "95" },
  "9525": { ciiu: "9525", description: "Reparación de cerrajería", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "95" },
  "9526": { ciiu: "9526", description: "Reparación de bicicletas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "95" },
  "9604": { ciiu: "9604", description: "Servicios de spa y tratamientos de bienestar", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "96" },
  "9605": { ciiu: "9605", description: "Servicios de tatuaje y piercing", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "96" },
  "9606": { ciiu: "9606", description: "Servicios de cuidado de mascotas", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "96" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISIÓN 97-99: HOGARES Y ORGANIZACIONES EXTRATERRITORIALES - Decreto 768
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9701": { ciiu: "9701", description: "Empleadores de personal de servicio doméstico", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "97" },
  "9702": { ciiu: "9702", description: "Empleadores de niñeras y cuidadores", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "97" },
  "9703": { ciiu: "9703", description: "Empleadores de personal de jardinería doméstica", riskLevel: "III", riskClass: 3, cotizacion: 0.02436, division: "97" },
  "9811": { ciiu: "9811", description: "Actividades de agricultura doméstica para autoconsumo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "98" },
  "9821": { ciiu: "9821", description: "Actividades de servicios domésticos para autoconsumo", riskLevel: "II", riskClass: 2, cotizacion: 0.01044, division: "98" },
  "9901": { ciiu: "9901", description: "Actividades de embajadas y consulados", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "99" },
  "9902": { ciiu: "9902", description: "Actividades de organismos internacionales", riskLevel: "I", riskClass: 1, cotizacion: 0.00522, division: "99" },
};

/**
 * Función auxiliar para obtener información completa del CIIU Decreto 768
 */
export function getCiiuDecreto768Info(ciiuCode: string): CiiuDecreto768 | null {
  const normalizedCode = ciiuCode.replace(/[\s.\-]/g, "").trim();
  return CIIU_DECRETO_768[normalizedCode] || null;
}

/**
 * Función para obtener la tasa de cotización por clase de riesgo
 */
export function getTasaCotizacion(riskClass: 1 | 2 | 3 | 4 | 5): number {
  return TASAS_COTIZACION[riskClass];
}

/**
 * Función para convertir nivel de riesgo romano a numérico
 */
export function riskLevelToClass(level: RiskLevel): 1 | 2 | 3 | 4 | 5 {
  const map: Record<RiskLevel, 1 | 2 | 3 | 4 | 5> = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5
  };
  return map[level];
}

/**
 * Función para convertir clase de riesgo numérica a nivel romano
 */
export function riskClassToLevel(riskClass: 1 | 2 | 3 | 4 | 5): RiskLevel {
  const map: Record<1 | 2 | 3 | 4 | 5, RiskLevel> = {
    1: "I", 2: "II", 3: "III", 4: "IV", 5: "V"
  };
  return map[riskClass];
}

/**
 * Estadísticas del archivo Decreto 768/2022
 */
export const DECRETO_768_STATS = {
  totalCodigos: Object.keys(CIIU_DECRETO_768).length,
  fechaVigencia: "2022-11-17",
  decretoDerogado: "Decreto 1607 de 2002",
  totalActividadesDecreto: 1104, // Según el decreto
  referenciasCIIU: "CIIU Rev. 4 A.C. (Resolución DANE 066 de 2012)"
};
