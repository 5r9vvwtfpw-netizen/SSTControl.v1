/**
 * Clasificación CIIU → Nivel de Riesgo según Decreto 1607/2002 y actualizaciones
 * 
 * Este archivo implementa la tabla de clasificación de actividades económicas
 * según el Sistema de Riesgos Laborales en Colombia.
 * 
 * Referencias normativas:
 * - Decreto 1607 de 2002: Tabla de Clasificación de Actividades Económicas
 * - Decreto 768 de 2022: Actualizaciones a la tabla de clasificación
 * - Resolución 0312 de 2019: Estándares Mínimos del SG-SST
 * 
 * Principio: Solo agregar código - Este archivo es independiente y no modifica
 * ningún archivo existente del sistema.
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

export type RiskLevel = "I" | "II" | "III" | "IV" | "V";

export interface CiiuClassification {
  code: string;
  description: string;
  riskLevel: RiskLevel;
  division: string;
}

/**
 * Tabla de Clasificación CIIU Rev.4 → Nivel de Riesgo ARL
 * 
 * Organizada por divisiones CIIU según estructura:
 * - División 01-03: Agricultura, ganadería, caza, silvicultura y pesca
 * - División 05-09: Explotación de minas y canteras
 * - División 10-33: Industrias manufactureras
 * - División 35-39: Suministro de electricidad, gas, vapor, agua
 * - División 41-43: Construcción
 * - División 45-47: Comercio al por mayor y menor
 * - División 49-53: Transporte y almacenamiento
 * - División 55-56: Alojamiento y servicios de comida
 * - División 58-63: Información y comunicaciones
 * - División 64-66: Actividades financieras y de seguros
 * - División 68: Actividades inmobiliarias
 * - División 69-75: Actividades profesionales, científicas y técnicas
 * - División 77-82: Actividades de servicios administrativos
 * - División 84: Administración pública y defensa
 * - División 85: Educación
 * - División 86-88: Actividades de atención de la salud humana
 * - División 90-93: Actividades artísticas, entretenimiento y recreación
 * - División 94-96: Otras actividades de servicios
 * - División 97-99: Actividades de los hogares y organizaciones extraterritoriales
 */
export const CIIU_RISK_CLASSIFICATION: Record<string, CiiuClassification> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN A: AGRICULTURA, GANADERÍA, CAZA, SILVICULTURA Y PESCA (01-03)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // División 01: Agricultura, ganadería, caza y actividades de servicios conexas
  "0111": { code: "0111", description: "Cultivo de cereales (excepto arroz), legumbres y semillas oleaginosas", riskLevel: "IV", division: "01" },
  "0112": { code: "0112", description: "Cultivo de arroz", riskLevel: "IV", division: "01" },
  "0113": { code: "0113", description: "Cultivo de hortalizas, raíces y tubérculos", riskLevel: "III", division: "01" },
  "0114": { code: "0114", description: "Cultivo de tabaco", riskLevel: "IV", division: "01" },
  "0115": { code: "0115", description: "Cultivo de plantas textiles", riskLevel: "IV", division: "01" },
  "0119": { code: "0119", description: "Otros cultivos transitorios n.c.p.", riskLevel: "III", division: "01" },
  "0121": { code: "0121", description: "Cultivo de frutas tropicales y subtropicales", riskLevel: "III", division: "01" },
  "0122": { code: "0122", description: "Cultivo de plátano y banano", riskLevel: "III", division: "01" },
  "0123": { code: "0123", description: "Cultivo de café", riskLevel: "III", division: "01" },
  "0124": { code: "0124", description: "Cultivo de caña de azúcar", riskLevel: "IV", division: "01" },
  "0125": { code: "0125", description: "Cultivo de flor de corte", riskLevel: "III", division: "01" },
  "0126": { code: "0126", description: "Cultivo de palma para aceite (palma africana) y otros frutos oleaginosos", riskLevel: "IV", division: "01" },
  "0127": { code: "0127", description: "Cultivo de plantas con las que se preparan bebidas", riskLevel: "III", division: "01" },
  "0128": { code: "0128", description: "Cultivo de especias y de plantas aromáticas y medicinales", riskLevel: "III", division: "01" },
  "0129": { code: "0129", description: "Otros cultivos permanentes n.c.p.", riskLevel: "III", division: "01" },
  "0130": { code: "0130", description: "Propagación de plantas (actividades de los viveros)", riskLevel: "II", division: "01" },
  "0141": { code: "0141", description: "Cría de ganado bovino y bufalino", riskLevel: "IV", division: "01" },
  "0142": { code: "0142", description: "Cría de caballos y otros equinos", riskLevel: "IV", division: "01" },
  "0143": { code: "0143", description: "Cría de ovejas y cabras", riskLevel: "III", division: "01" },
  "0144": { code: "0144", description: "Cría de ganado porcino", riskLevel: "III", division: "01" },
  "0145": { code: "0145", description: "Cría de aves de corral", riskLevel: "III", division: "01" },
  "0149": { code: "0149", description: "Cría de otros animales n.c.p.", riskLevel: "III", division: "01" },
  "0150": { code: "0150", description: "Explotación mixta (agrícola y pecuaria)", riskLevel: "IV", division: "01" },
  "0161": { code: "0161", description: "Actividades de apoyo a la agricultura", riskLevel: "III", division: "01" },
  "0162": { code: "0162", description: "Actividades de apoyo a la ganadería", riskLevel: "III", division: "01" },
  "0163": { code: "0163", description: "Actividades posteriores a la cosecha", riskLevel: "III", division: "01" },
  "0164": { code: "0164", description: "Tratamiento de semillas para propagación", riskLevel: "II", division: "01" },
  "0170": { code: "0170", description: "Caza ordinaria y mediante trampas y actividades de servicios conexas", riskLevel: "IV", division: "01" },
  
  // División 02: Silvicultura y extracción de madera
  "0210": { code: "0210", description: "Silvicultura y otras actividades forestales", riskLevel: "IV", division: "02" },
  "0220": { code: "0220", description: "Extracción de madera", riskLevel: "V", division: "02" },
  "0230": { code: "0230", description: "Recolección de productos forestales diferentes a la madera", riskLevel: "IV", division: "02" },
  "0240": { code: "0240", description: "Servicios de apoyo a la silvicultura", riskLevel: "IV", division: "02" },
  
  // División 03: Pesca y acuicultura
  "0311": { code: "0311", description: "Pesca marítima", riskLevel: "V", division: "03" },
  "0312": { code: "0312", description: "Pesca de agua dulce", riskLevel: "IV", division: "03" },
  "0321": { code: "0321", description: "Acuicultura marítima", riskLevel: "IV", division: "03" },
  "0322": { code: "0322", description: "Acuicultura de agua dulce", riskLevel: "III", division: "03" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN B: EXPLOTACIÓN DE MINAS Y CANTERAS (05-09)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // División 05: Extracción de carbón de piedra y lignito
  "0510": { code: "0510", description: "Extracción de hulla (carbón de piedra)", riskLevel: "V", division: "05" },
  "0520": { code: "0520", description: "Extracción de carbón lignito", riskLevel: "V", division: "05" },
  
  // División 06: Extracción de petróleo crudo y gas natural
  "0610": { code: "0610", description: "Extracción de petróleo crudo", riskLevel: "V", division: "06" },
  "0620": { code: "0620", description: "Extracción de gas natural", riskLevel: "V", division: "06" },
  
  // División 07: Extracción de minerales metalíferos
  "0710": { code: "0710", description: "Extracción de minerales de hierro", riskLevel: "V", division: "07" },
  "0721": { code: "0721", description: "Extracción de minerales de uranio y de torio", riskLevel: "V", division: "07" },
  "0722": { code: "0722", description: "Extracción de oro y otros metales preciosos", riskLevel: "V", division: "07" },
  "0723": { code: "0723", description: "Extracción de minerales de níquel", riskLevel: "V", division: "07" },
  "0729": { code: "0729", description: "Extracción de otros minerales metalíferos no ferrosos n.c.p.", riskLevel: "V", division: "07" },
  
  // División 08: Extracción de otras minas y canteras
  "0811": { code: "0811", description: "Extracción de piedra, arena, arcillas comunes, yeso y anhidrita", riskLevel: "V", division: "08" },
  "0812": { code: "0812", description: "Extracción de arcillas de uso industrial, caliza, caolín y bentonitas", riskLevel: "V", division: "08" },
  "0820": { code: "0820", description: "Extracción de esmeraldas, piedras preciosas y semipreciosas", riskLevel: "V", division: "08" },
  "0891": { code: "0891", description: "Extracción de minerales para la fabricación de abonos y productos químicos", riskLevel: "V", division: "08" },
  "0892": { code: "0892", description: "Extracción de halita (sal)", riskLevel: "IV", division: "08" },
  "0899": { code: "0899", description: "Extracción de otros minerales no metálicos n.c.p.", riskLevel: "V", division: "08" },
  
  // División 09: Actividades de servicios de apoyo para la explotación de minas y canteras
  "0910": { code: "0910", description: "Actividades de apoyo para la extracción de petróleo y de gas natural", riskLevel: "V", division: "09" },
  "0990": { code: "0990", description: "Actividades de apoyo para otras actividades de explotación de minas y canteras", riskLevel: "V", division: "09" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN C: INDUSTRIAS MANUFACTURERAS (10-33)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // División 10: Elaboración de productos alimenticios
  "1011": { code: "1011", description: "Procesamiento y conservación de carne y productos cárnicos", riskLevel: "III", division: "10" },
  "1012": { code: "1012", description: "Procesamiento y conservación de pescados, crustáceos y moluscos", riskLevel: "III", division: "10" },
  "1020": { code: "1020", description: "Procesamiento y conservación de frutas, legumbres, hortalizas y tubérculos", riskLevel: "III", division: "10" },
  "1030": { code: "1030", description: "Elaboración de aceites y grasas de origen vegetal y animal", riskLevel: "III", division: "10" },
  "1040": { code: "1040", description: "Elaboración de productos lácteos", riskLevel: "III", division: "10" },
  "1051": { code: "1051", description: "Elaboración de productos de molinería", riskLevel: "III", division: "10" },
  "1052": { code: "1052", description: "Elaboración de almidones y productos derivados del almidón", riskLevel: "III", division: "10" },
  "1061": { code: "1061", description: "Trilla de café", riskLevel: "III", division: "10" },
  "1062": { code: "1062", description: "Descafeinado, tostión y molienda del café", riskLevel: "III", division: "10" },
  "1063": { code: "1063", description: "Otros derivados del café", riskLevel: "II", division: "10" },
  "1071": { code: "1071", description: "Elaboración y refinación de azúcar", riskLevel: "IV", division: "10" },
  "1072": { code: "1072", description: "Elaboración de panela", riskLevel: "IV", division: "10" },
  "1081": { code: "1081", description: "Elaboración de productos de panadería", riskLevel: "II", division: "10" },
  "1082": { code: "1082", description: "Elaboración de cacao, chocolate y productos de confitería", riskLevel: "II", division: "10" },
  "1083": { code: "1083", description: "Elaboración de macarrones, fideos, alcuzcuz y productos farináceos similares", riskLevel: "II", division: "10" },
  "1084": { code: "1084", description: "Elaboración de comidas y platos preparados", riskLevel: "II", division: "10" },
  "1089": { code: "1089", description: "Elaboración de otros productos alimenticios n.c.p.", riskLevel: "II", division: "10" },
  "1090": { code: "1090", description: "Elaboración de alimentos preparados para animales", riskLevel: "III", division: "10" },
  
  // División 11: Elaboración de bebidas
  "1101": { code: "1101", description: "Destilación, rectificación y mezcla de bebidas alcohólicas", riskLevel: "III", division: "11" },
  "1102": { code: "1102", description: "Elaboración de bebidas fermentadas no destiladas", riskLevel: "III", division: "11" },
  "1103": { code: "1103", description: "Producción de malta, elaboración de cervezas y otras bebidas malteadas", riskLevel: "III", division: "11" },
  "1104": { code: "1104", description: "Elaboración de bebidas no alcohólicas, producción de aguas minerales", riskLevel: "II", division: "11" },
  
  // División 12: Elaboración de productos de tabaco
  "1200": { code: "1200", description: "Elaboración de productos de tabaco", riskLevel: "III", division: "12" },
  
  // División 13: Fabricación de productos textiles
  "1311": { code: "1311", description: "Preparación e hilatura de fibras textiles", riskLevel: "III", division: "13" },
  "1312": { code: "1312", description: "Tejeduría de productos textiles", riskLevel: "III", division: "13" },
  "1313": { code: "1313", description: "Acabado de productos textiles", riskLevel: "III", division: "13" },
  "1391": { code: "1391", description: "Fabricación de tejidos de punto y ganchillo", riskLevel: "II", division: "13" },
  "1392": { code: "1392", description: "Confección de artículos con materiales textiles, excepto prendas de vestir", riskLevel: "II", division: "13" },
  "1393": { code: "1393", description: "Fabricación de tapetes y alfombras para pisos", riskLevel: "II", division: "13" },
  "1394": { code: "1394", description: "Fabricación de cuerdas, cordeles, cables, bramantes y redes", riskLevel: "III", division: "13" },
  "1399": { code: "1399", description: "Fabricación de otros artículos textiles n.c.p.", riskLevel: "II", division: "13" },
  
  // División 14: Confección de prendas de vestir
  "1410": { code: "1410", description: "Confección de prendas de vestir, excepto prendas de piel", riskLevel: "II", division: "14" },
  "1420": { code: "1420", description: "Fabricación de artículos de piel", riskLevel: "II", division: "14" },
  "1430": { code: "1430", description: "Fabricación de artículos de punto y ganchillo", riskLevel: "II", division: "14" },
  
  // División 15: Curtido y recurtido de cueros
  "1511": { code: "1511", description: "Curtido y recurtido de cueros; recurtido y teñido de pieles", riskLevel: "IV", division: "15" },
  "1512": { code: "1512", description: "Fabricación de artículos de viaje, bolsos de mano y artículos similares", riskLevel: "II", division: "15" },
  "1513": { code: "1513", description: "Fabricación de artículos de viaje, bolsos de mano y artículos similares", riskLevel: "II", division: "15" },
  "1521": { code: "1521", description: "Fabricación de calzado de cuero y piel, con cualquier tipo de suela", riskLevel: "II", division: "15" },
  "1522": { code: "1522", description: "Fabricación de otros tipos de calzado, excepto calzado de cuero y piel", riskLevel: "II", division: "15" },
  "1523": { code: "1523", description: "Fabricación de partes del calzado", riskLevel: "II", division: "15" },
  
  // División 16: Transformación de la madera
  "1610": { code: "1610", description: "Aserrado, acepillado e impregnación de la madera", riskLevel: "IV", division: "16" },
  "1620": { code: "1620", description: "Fabricación de hojas de madera para enchapado", riskLevel: "IV", division: "16" },
  "1630": { code: "1630", description: "Fabricación de partes y piezas de madera para construcción", riskLevel: "IV", division: "16" },
  "1640": { code: "1640", description: "Fabricación de recipientes de madera", riskLevel: "III", division: "16" },
  "1690": { code: "1690", description: "Fabricación de otros productos de madera n.c.p.", riskLevel: "III", division: "16" },
  
  // División 17: Fabricación de papel y productos de papel
  "1701": { code: "1701", description: "Fabricación de pulpas (pastas) celulósicas; papel y cartón", riskLevel: "III", division: "17" },
  "1702": { code: "1702", description: "Fabricación de papel y cartón ondulado (corrugado)", riskLevel: "III", division: "17" },
  "1709": { code: "1709", description: "Fabricación de otros artículos de papel y cartón", riskLevel: "II", division: "17" },
  
  // División 18: Actividades de impresión
  "1811": { code: "1811", description: "Actividades de impresión", riskLevel: "II", division: "18" },
  "1812": { code: "1812", description: "Actividades de servicios relacionados con la impresión", riskLevel: "II", division: "18" },
  "1820": { code: "1820", description: "Producción de copias a partir de grabaciones originales", riskLevel: "I", division: "18" },
  
  // División 19: Coquización, fabricación de productos de la refinación del petróleo
  "1910": { code: "1910", description: "Fabricación de productos de hornos de coque", riskLevel: "V", division: "19" },
  "1921": { code: "1921", description: "Fabricación de productos de la refinación del petróleo", riskLevel: "V", division: "19" },
  "1922": { code: "1922", description: "Actividad de mezcla de combustibles", riskLevel: "IV", division: "19" },
  
  // División 20: Fabricación de sustancias y productos químicos
  "2011": { code: "2011", description: "Fabricación de sustancias y productos químicos básicos", riskLevel: "IV", division: "20" },
  "2012": { code: "2012", description: "Fabricación de abonos y compuestos inorgánicos nitrogenados", riskLevel: "IV", division: "20" },
  "2013": { code: "2013", description: "Fabricación de plásticos en formas primarias", riskLevel: "III", division: "20" },
  "2014": { code: "2014", description: "Fabricación de caucho sintético en formas primarias", riskLevel: "III", division: "20" },
  "2021": { code: "2021", description: "Fabricación de plaguicidas y otros productos químicos de uso agropecuario", riskLevel: "IV", division: "20" },
  "2022": { code: "2022", description: "Fabricación de pinturas, barnices y revestimientos similares", riskLevel: "III", division: "20" },
  "2023": { code: "2023", description: "Fabricación de jabones y detergentes, preparados para limpiar y pulir", riskLevel: "III", division: "20" },
  "2029": { code: "2029", description: "Fabricación de otros productos químicos n.c.p.", riskLevel: "III", division: "20" },
  "2030": { code: "2030", description: "Fabricación de fibras sintéticas y artificiales", riskLevel: "III", division: "20" },
  
  // División 21: Fabricación de productos farmacéuticos
  "2100": { code: "2100", description: "Fabricación de productos farmacéuticos, sustancias químicas medicinales", riskLevel: "II", division: "21" },
  
  // División 22: Fabricación de productos de caucho y de plástico
  "2211": { code: "2211", description: "Fabricación de llantas y neumáticos de caucho", riskLevel: "III", division: "22" },
  "2212": { code: "2212", description: "Reencauche de llantas usadas", riskLevel: "III", division: "22" },
  "2219": { code: "2219", description: "Fabricación de formas básicas de caucho y otros productos de caucho n.c.p.", riskLevel: "III", division: "22" },
  "2221": { code: "2221", description: "Fabricación de formas básicas de plástico", riskLevel: "III", division: "22" },
  "2229": { code: "2229", description: "Fabricación de artículos de plástico n.c.p.", riskLevel: "II", division: "22" },
  
  // División 23: Fabricación de otros productos minerales no metálicos
  "2310": { code: "2310", description: "Fabricación de vidrio y productos de vidrio", riskLevel: "IV", division: "23" },
  "2391": { code: "2391", description: "Fabricación de productos refractarios", riskLevel: "IV", division: "23" },
  "2392": { code: "2392", description: "Fabricación de materiales de arcilla para la construcción", riskLevel: "IV", division: "23" },
  "2393": { code: "2393", description: "Fabricación de otros productos de cerámica y porcelana", riskLevel: "III", division: "23" },
  "2394": { code: "2394", description: "Fabricación de cemite, cal y yeso", riskLevel: "IV", division: "23" },
  "2395": { code: "2395", description: "Fabricación de artículos de hormigón, cemento y yeso", riskLevel: "IV", division: "23" },
  "2396": { code: "2396", description: "Corte, tallado y acabado de la piedra", riskLevel: "IV", division: "23" },
  "2399": { code: "2399", description: "Fabricación de otros productos minerales no metálicos n.c.p.", riskLevel: "IV", division: "23" },
  
  // División 24: Fabricación de productos metalúrgicos básicos
  "2410": { code: "2410", description: "Industrias básicas de hierro y de acero", riskLevel: "IV", division: "24" },
  "2421": { code: "2421", description: "Industrias básicas de metales preciosos", riskLevel: "IV", division: "24" },
  "2429": { code: "2429", description: "Industrias básicas de otros metales no ferrosos", riskLevel: "IV", division: "24" },
  "2431": { code: "2431", description: "Fundición de hierro y de acero", riskLevel: "IV", division: "24" },
  "2432": { code: "2432", description: "Fundición de metales no ferrosos", riskLevel: "IV", division: "24" },
  
  // División 25: Fabricación de productos elaborados de metal
  "2511": { code: "2511", description: "Fabricación de productos metálicos para uso estructural", riskLevel: "IV", division: "25" },
  "2512": { code: "2512", description: "Fabricación de tanques, depósitos y recipientes de metal", riskLevel: "IV", division: "25" },
  "2513": { code: "2513", description: "Fabricación de generadores de vapor, excepto calderas de agua caliente", riskLevel: "IV", division: "25" },
  "2520": { code: "2520", description: "Fabricación de armas y municiones", riskLevel: "V", division: "25" },
  "2591": { code: "2591", description: "Forja, prensado, estampado y laminado de metal; pulvimetalurgia", riskLevel: "IV", division: "25" },
  "2592": { code: "2592", description: "Tratamiento y revestimiento de metales; mecanizado", riskLevel: "III", division: "25" },
  "2593": { code: "2593", description: "Fabricación de artículos de cuchillería, herramientas de mano", riskLevel: "III", division: "25" },
  "2599": { code: "2599", description: "Fabricación de otros productos elaborados de metal n.c.p.", riskLevel: "III", division: "25" },
  
  // División 26: Fabricación de productos informáticos, electrónicos y ópticos
  "2610": { code: "2610", description: "Fabricación de componentes y tableros electrónicos", riskLevel: "II", division: "26" },
  "2620": { code: "2620", description: "Fabricación de computadoras y de equipo periférico", riskLevel: "II", division: "26" },
  "2630": { code: "2630", description: "Fabricación de equipos de comunicación", riskLevel: "II", division: "26" },
  "2640": { code: "2640", description: "Fabricación de aparatos electrónicos de consumo", riskLevel: "II", division: "26" },
  "2651": { code: "2651", description: "Fabricación de equipo de medición, prueba, navegación y control", riskLevel: "II", division: "26" },
  "2652": { code: "2652", description: "Fabricación de relojes", riskLevel: "II", division: "26" },
  "2660": { code: "2660", description: "Fabricación de equipo de irradiación y equipo electrónico de uso médico", riskLevel: "II", division: "26" },
  "2670": { code: "2670", description: "Fabricación de instrumentos ópticos y equipo fotográfico", riskLevel: "II", division: "26" },
  "2680": { code: "2680", description: "Fabricación de medios magnéticos y ópticos para almacenamiento de datos", riskLevel: "I", division: "26" },
  
  // División 27: Fabricación de equipo eléctrico
  "2711": { code: "2711", description: "Fabricación de motores, generadores y transformadores eléctricos", riskLevel: "III", division: "27" },
  "2712": { code: "2712", description: "Fabricación de aparatos de distribución y control de la energía eléctrica", riskLevel: "III", division: "27" },
  "2720": { code: "2720", description: "Fabricación de pilas, baterías y acumuladores eléctricos", riskLevel: "III", division: "27" },
  "2731": { code: "2731", description: "Fabricación de hilos y cables eléctricos y de fibra óptica", riskLevel: "III", division: "27" },
  "2732": { code: "2732", description: "Fabricación de dispositivos de cableado", riskLevel: "II", division: "27" },
  "2740": { code: "2740", description: "Fabricación de equipos eléctricos de iluminación", riskLevel: "II", division: "27" },
  "2750": { code: "2750", description: "Fabricación de aparatos de uso doméstico", riskLevel: "II", division: "27" },
  "2790": { code: "2790", description: "Fabricación de otros tipos de equipo eléctrico n.c.p.", riskLevel: "II", division: "27" },
  
  // División 28: Fabricación de maquinaria y equipo n.c.p.
  "2811": { code: "2811", description: "Fabricación de motores, turbinas, y partes para motores de combustión interna", riskLevel: "III", division: "28" },
  "2812": { code: "2812", description: "Fabricación de equipos de potencia hidráulica y neumática", riskLevel: "III", division: "28" },
  "2813": { code: "2813", description: "Fabricación de otras bombas, compresores, grifos y válvulas", riskLevel: "III", division: "28" },
  "2814": { code: "2814", description: "Fabricación de cojinetes, engranajes, trenes de engranajes y piezas de transmisión", riskLevel: "III", division: "28" },
  "2815": { code: "2815", description: "Fabricación de hornos, hogares y quemadores industriales", riskLevel: "III", division: "28" },
  "2816": { code: "2816", description: "Fabricación de equipo de elevación y manipulación", riskLevel: "IV", division: "28" },
  "2817": { code: "2817", description: "Fabricación de maquinaria y equipo de oficina (excepto computadoras)", riskLevel: "II", division: "28" },
  "2818": { code: "2818", description: "Fabricación de herramientas manuales con motor", riskLevel: "III", division: "28" },
  "2819": { code: "2819", description: "Fabricación de otros tipos de maquinaria y equipo de uso general n.c.p.", riskLevel: "III", division: "28" },
  "2821": { code: "2821", description: "Fabricación de maquinaria agropecuaria y forestal", riskLevel: "III", division: "28" },
  "2822": { code: "2822", description: "Fabricación de máquinas formadoras de metal y de máquinas herramienta", riskLevel: "III", division: "28" },
  "2823": { code: "2823", description: "Fabricación de maquinaria para la metalurgia", riskLevel: "III", division: "28" },
  "2824": { code: "2824", description: "Fabricación de maquinaria para explotación de minas y canteras y para obras de construcción", riskLevel: "IV", division: "28" },
  "2825": { code: "2825", description: "Fabricación de maquinaria para la elaboración de alimentos, bebidas y tabaco", riskLevel: "III", division: "28" },
  "2826": { code: "2826", description: "Fabricación de maquinaria para la elaboración de productos textiles, prendas de vestir y cueros", riskLevel: "III", division: "28" },
  "2829": { code: "2829", description: "Fabricación de otros tipos de maquinaria y equipo de uso especial n.c.p.", riskLevel: "III", division: "28" },
  
  // División 29: Fabricación de vehículos automotores, remolques y semirremolques
  "2910": { code: "2910", description: "Fabricación de vehículos automotores y sus motores", riskLevel: "III", division: "29" },
  "2920": { code: "2920", description: "Fabricación de carrocerías para vehículos automotores; fabricación de remolques y semirremolques", riskLevel: "III", division: "29" },
  "2930": { code: "2930", description: "Fabricación de partes, piezas (autopartes) y accesorios (lujos) para vehículos automotores", riskLevel: "III", division: "29" },
  
  // División 30: Fabricación de otros tipos de equipo de transporte
  "3011": { code: "3011", description: "Construcción de barcos y de estructuras flotantes", riskLevel: "IV", division: "30" },
  "3012": { code: "3012", description: "Construcción de embarcaciones de recreo y deporte", riskLevel: "III", division: "30" },
  "3020": { code: "3020", description: "Fabricación de locomotoras y de material rodante para ferrocarriles", riskLevel: "IV", division: "30" },
  "3030": { code: "3030", description: "Fabricación de aeronaves, naves espaciales y de maquinaria conexa", riskLevel: "IV", division: "30" },
  "3040": { code: "3040", description: "Fabricación de vehículos militares de combate", riskLevel: "IV", division: "30" },
  "3091": { code: "3091", description: "Fabricación de motocicletas", riskLevel: "III", division: "30" },
  "3092": { code: "3092", description: "Fabricación de bicicletas y de sillas de ruedas para personas con discapacidad", riskLevel: "II", division: "30" },
  "3099": { code: "3099", description: "Fabricación de otros tipos de equipo de transporte n.c.p.", riskLevel: "III", division: "30" },
  
  // División 31: Fabricación de muebles, colchones y somieres
  "3110": { code: "3110", description: "Fabricación de muebles", riskLevel: "III", division: "31" },
  "3120": { code: "3120", description: "Fabricación de colchones y somieres", riskLevel: "II", division: "31" },
  
  // División 32: Otras industrias manufactureras
  "3210": { code: "3210", description: "Fabricación de joyas, bisutería y artículos conexos", riskLevel: "II", division: "32" },
  "3220": { code: "3220", description: "Fabricación de instrumentos musicales", riskLevel: "II", division: "32" },
  "3230": { code: "3230", description: "Fabricación de artículos y equipo para la práctica del deporte", riskLevel: "II", division: "32" },
  "3240": { code: "3240", description: "Fabricación de juegos, juguetes y rompecabezas", riskLevel: "II", division: "32" },
  "3250": { code: "3250", description: "Fabricación de instrumentos, aparatos y materiales médicos y odontológicos", riskLevel: "II", division: "32" },
  "3290": { code: "3290", description: "Otras industrias manufactureras n.c.p.", riskLevel: "II", division: "32" },
  
  // División 33: Instalación, mantenimiento y reparación especializado de maquinaria y equipo
  "3311": { code: "3311", description: "Mantenimiento y reparación especializado de productos elaborados en metal", riskLevel: "III", division: "33" },
  "3312": { code: "3312", description: "Mantenimiento y reparación especializado de maquinaria y equipo", riskLevel: "III", division: "33" },
  "3313": { code: "3313", description: "Mantenimiento y reparación especializado de equipo electrónico y óptico", riskLevel: "II", division: "33" },
  "3314": { code: "3314", description: "Mantenimiento y reparación especializado de equipo eléctrico", riskLevel: "III", division: "33" },
  "3315": { code: "3315", description: "Mantenimiento y reparación especializado de equipo de transporte, excepto vehículos automotores", riskLevel: "III", division: "33" },
  "3319": { code: "3319", description: "Mantenimiento y reparación de otros tipos de equipos y sus componentes n.c.p.", riskLevel: "III", division: "33" },
  "3320": { code: "3320", description: "Instalación especializada de maquinaria y equipo industrial", riskLevel: "III", division: "33" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN D: SUMINISTRO DE ELECTRICIDAD, GAS, VAPOR Y AIRE ACONDICIONADO (35)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "3511": { code: "3511", description: "Generación de energía eléctrica", riskLevel: "IV", division: "35" },
  "3512": { code: "3512", description: "Transmisión de energía eléctrica", riskLevel: "IV", division: "35" },
  "3513": { code: "3513", description: "Distribución de energía eléctrica", riskLevel: "IV", division: "35" },
  "3514": { code: "3514", description: "Comercialización de energía eléctrica", riskLevel: "II", division: "35" },
  "3520": { code: "3520", description: "Producción de gas; distribución de combustibles gaseosos por tuberías", riskLevel: "IV", division: "35" },
  "3530": { code: "3530", description: "Suministro de vapor y aire acondicionado", riskLevel: "III", division: "35" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN E: DISTRIBUCIÓN DE AGUA; EVACUACIÓN Y TRATAMIENTO DE AGUAS RESIDUALES (36-39)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "3600": { code: "3600", description: "Captación, tratamiento y distribución de agua", riskLevel: "III", division: "36" },
  "3700": { code: "3700", description: "Evacuación y tratamiento de aguas residuales", riskLevel: "IV", division: "37" },
  "3811": { code: "3811", description: "Recolección de desechos no peligrosos", riskLevel: "IV", division: "38" },
  "3812": { code: "3812", description: "Recolección de desechos peligrosos", riskLevel: "V", division: "38" },
  "3821": { code: "3821", description: "Tratamiento y disposición de desechos no peligrosos", riskLevel: "IV", division: "38" },
  "3822": { code: "3822", description: "Tratamiento y disposición de desechos peligrosos", riskLevel: "V", division: "38" },
  "3830": { code: "3830", description: "Recuperación de materiales", riskLevel: "III", division: "38" },
  "3900": { code: "3900", description: "Actividades de saneamiento ambiental y otros servicios de gestión de desechos", riskLevel: "III", division: "39" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN F: CONSTRUCCIÓN (41-43)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "4111": { code: "4111", description: "Construcción de edificios residenciales", riskLevel: "V", division: "41" },
  "4112": { code: "4112", description: "Construcción de edificios no residenciales", riskLevel: "V", division: "41" },
  "4210": { code: "4210", description: "Construcción de carreteras y vías de ferrocarril", riskLevel: "V", division: "42" },
  "4220": { code: "4220", description: "Construcción de proyectos de servicio público", riskLevel: "V", division: "42" },
  "4290": { code: "4290", description: "Construcción de otras obras de ingeniería civil", riskLevel: "V", division: "42" },
  "4311": { code: "4311", description: "Demolición", riskLevel: "V", division: "43" },
  "4312": { code: "4312", description: "Preparación del terreno", riskLevel: "V", division: "43" },
  "4321": { code: "4321", description: "Instalaciones eléctricas", riskLevel: "IV", division: "43" },
  "4322": { code: "4322", description: "Instalaciones de fontanería, calefacción y aire acondicionado", riskLevel: "IV", division: "43" },
  "4329": { code: "4329", description: "Otras instalaciones especializadas", riskLevel: "IV", division: "43" },
  "4330": { code: "4330", description: "Terminación y acabado de edificios y obras de ingeniería civil", riskLevel: "IV", division: "43" },
  "4390": { code: "4390", description: "Otras actividades especializadas para la construcción de edificios y obras de ingeniería civil", riskLevel: "V", division: "43" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN G: COMERCIO AL POR MAYOR Y AL POR MENOR (45-47)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // División 45: Comercio de vehículos automotores
  "4511": { code: "4511", description: "Comercio de vehículos automotores nuevos", riskLevel: "I", division: "45" },
  "4512": { code: "4512", description: "Comercio de vehículos automotores usados", riskLevel: "I", division: "45" },
  "4520": { code: "4520", description: "Mantenimiento y reparación de vehículos automotores", riskLevel: "III", division: "45" },
  "4530": { code: "4530", description: "Comercio de partes, piezas (autopartes) y accesorios (lujos) para vehículos automotores", riskLevel: "II", division: "45" },
  "4541": { code: "4541", description: "Comercio de motocicletas y de sus partes, piezas y accesorios", riskLevel: "I", division: "45" },
  "4542": { code: "4542", description: "Mantenimiento y reparación de motocicletas y de sus partes y piezas", riskLevel: "III", division: "45" },
  
  // División 46: Comercio al por mayor
  "4610": { code: "4610", description: "Comercio al por mayor a cambio de una retribución o por contrata", riskLevel: "I", division: "46" },
  "4620": { code: "4620", description: "Comercio al por mayor de materias primas agropecuarias; animales vivos", riskLevel: "II", division: "46" },
  "4631": { code: "4631", description: "Comercio al por mayor de productos alimenticios", riskLevel: "II", division: "46" },
  "4632": { code: "4632", description: "Comercio al por mayor de bebidas y tabaco", riskLevel: "II", division: "46" },
  "4641": { code: "4641", description: "Comercio al por mayor de productos textiles, productos confeccionados para uso doméstico", riskLevel: "I", division: "46" },
  "4642": { code: "4642", description: "Comercio al por mayor de prendas de vestir", riskLevel: "I", division: "46" },
  "4643": { code: "4643", description: "Comercio al por mayor de calzado", riskLevel: "I", division: "46" },
  "4644": { code: "4644", description: "Comercio al por mayor de aparatos y equipo de uso doméstico", riskLevel: "I", division: "46" },
  "4645": { code: "4645", description: "Comercio al por mayor de productos farmacéuticos, medicinales, cosméticos y de tocador", riskLevel: "I", division: "46" },
  "4649": { code: "4649", description: "Comercio al por mayor de otros utensilios domésticos n.c.p.", riskLevel: "I", division: "46" },
  "4651": { code: "4651", description: "Comercio al por mayor de computadores, equipo periférico y programas de informática", riskLevel: "I", division: "46" },
  "4652": { code: "4652", description: "Comercio al por mayor de equipo, partes y piezas electrónicos y de telecomunicaciones", riskLevel: "I", division: "46" },
  "4653": { code: "4653", description: "Comercio al por mayor de maquinaria y equipo agropecuarios", riskLevel: "II", division: "46" },
  "4659": { code: "4659", description: "Comercio al por mayor de otros tipos de maquinaria y equipo n.c.p.", riskLevel: "II", division: "46" },
  "4661": { code: "4661", description: "Comercio al por mayor de combustibles sólidos, líquidos, gaseosos y productos conexos", riskLevel: "III", division: "46" },
  "4662": { code: "4662", description: "Comercio al por mayor de metales y productos metalíferos", riskLevel: "II", division: "46" },
  "4663": { code: "4663", description: "Comercio al por mayor de materiales de construcción, artículos de ferretería", riskLevel: "II", division: "46" },
  "4664": { code: "4664", description: "Comercio al por mayor de productos químicos básicos, cauchos y plásticos en formas primarias", riskLevel: "II", division: "46" },
  "4665": { code: "4665", description: "Comercio al por mayor de desperdicios, desechos y chatarra", riskLevel: "III", division: "46" },
  "4669": { code: "4669", description: "Comercio al por mayor de otros productos n.c.p.", riskLevel: "II", division: "46" },
  "4690": { code: "4690", description: "Comercio al por mayor no especializado", riskLevel: "II", division: "46" },
  
  // División 47: Comercio al por menor
  "4711": { code: "4711", description: "Comercio al por menor en establecimientos no especializados con surtido compuesto principalmente por alimentos", riskLevel: "I", division: "47" },
  "4719": { code: "4719", description: "Comercio al por menor en establecimientos no especializados, con surtido compuesto principalmente por productos diferentes de alimentos", riskLevel: "I", division: "47" },
  "4721": { code: "4721", description: "Comercio al por menor de productos agrícolas para el consumo en establecimientos especializados", riskLevel: "I", division: "47" },
  "4722": { code: "4722", description: "Comercio al por menor de leche, productos lácteos y huevos", riskLevel: "I", division: "47" },
  "4723": { code: "4723", description: "Comercio al por menor de carnes (incluye aves de corral), productos cárnicos, pescados", riskLevel: "II", division: "47" },
  "4724": { code: "4724", description: "Comercio al por menor de bebidas y productos del tabaco", riskLevel: "I", division: "47" },
  "4729": { code: "4729", description: "Comercio al por menor de otros productos alimenticios n.c.p.", riskLevel: "I", division: "47" },
  "4731": { code: "4731", description: "Comercio al por menor de combustible para automotores", riskLevel: "III", division: "47" },
  "4732": { code: "4732", description: "Comercio al por menor de lubricantes, aditivos y productos de limpieza para vehículos automotores", riskLevel: "II", division: "47" },
  "4741": { code: "4741", description: "Comercio al por menor de computadores, equipos periféricos, programas de informática y equipos de telecomunicaciones", riskLevel: "I", division: "47" },
  "4742": { code: "4742", description: "Comercio al por menor de equipos y aparatos de sonido y de video", riskLevel: "I", division: "47" },
  "4751": { code: "4751", description: "Comercio al por menor de productos textiles en establecimientos especializados", riskLevel: "I", division: "47" },
  "4752": { code: "4752", description: "Comercio al por menor de artículos de ferretería, pinturas y productos de vidrio", riskLevel: "II", division: "47" },
  "4753": { code: "4753", description: "Comercio al por menor de tapices, alfombras y cubrimientos para paredes y pisos", riskLevel: "I", division: "47" },
  "4754": { code: "4754", description: "Comercio al por menor de electrodomésticos y gasodomésticos de uso doméstico, muebles y equipos de iluminación", riskLevel: "I", division: "47" },
  "4755": { code: "4755", description: "Comercio al por menor de artículos y utensilios de uso doméstico", riskLevel: "I", division: "47" },
  "4761": { code: "4761", description: "Comercio al por menor de libros, periódicos, materiales y artículos de papelería y escritorio", riskLevel: "I", division: "47" },
  "4762": { code: "4762", description: "Comercio al por menor de artículos deportivos", riskLevel: "I", division: "47" },
  "4769": { code: "4769", description: "Comercio al por menor de otros artículos culturales y de entretenimiento n.c.p.", riskLevel: "I", division: "47" },
  "4771": { code: "4771", description: "Comercio al por menor de prendas de vestir y sus accesorios", riskLevel: "I", division: "47" },
  "4772": { code: "4772", description: "Comercio al por menor de todo tipo de calzado y artículos de cuero", riskLevel: "I", division: "47" },
  "4773": { code: "4773", description: "Comercio al por menor de productos farmacéuticos y medicinales, cosméticos y artículos de tocador", riskLevel: "I", division: "47" },
  "4774": { code: "4774", description: "Comercio al por menor de otros productos nuevos en establecimientos especializados", riskLevel: "I", division: "47" },
  "4775": { code: "4775", description: "Comercio al por menor de artículos de segunda mano", riskLevel: "I", division: "47" },
  "4781": { code: "4781", description: "Comercio al por menor de alimentos, bebidas y tabaco, en puestos de venta móviles", riskLevel: "II", division: "47" },
  "4782": { code: "4782", description: "Comercio al por menor de productos textiles, prendas de vestir y calzado, en puestos de venta móviles", riskLevel: "I", division: "47" },
  "4789": { code: "4789", description: "Comercio al por menor de otros productos en puestos de venta móviles", riskLevel: "I", division: "47" },
  "4791": { code: "4791", description: "Comercio al por menor realizado a través de internet", riskLevel: "I", division: "47" },
  "4792": { code: "4792", description: "Comercio al por menor realizado a través de casas de venta o por correo", riskLevel: "I", division: "47" },
  "4799": { code: "4799", description: "Otros tipos de comercio al por menor no realizado en establecimientos, puestos de venta o mercados", riskLevel: "I", division: "47" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN H: TRANSPORTE Y ALMACENAMIENTO (49-53)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "4911": { code: "4911", description: "Transporte férreo de pasajeros", riskLevel: "IV", division: "49" },
  "4912": { code: "4912", description: "Transporte férreo de carga", riskLevel: "IV", division: "49" },
  "4921": { code: "4921", description: "Transporte de pasajeros", riskLevel: "IV", division: "49" },
  "4922": { code: "4922", description: "Transporte mixto", riskLevel: "IV", division: "49" },
  "4923": { code: "4923", description: "Transporte de carga por carretera", riskLevel: "IV", division: "49" },
  "4930": { code: "4930", description: "Transporte por tuberías", riskLevel: "IV", division: "49" },
  "5011": { code: "5011", description: "Transporte de pasajeros marítimo y de cabotaje", riskLevel: "IV", division: "50" },
  "5012": { code: "5012", description: "Transporte de carga marítimo y de cabotaje", riskLevel: "IV", division: "50" },
  "5021": { code: "5021", description: "Transporte fluvial de pasajeros", riskLevel: "IV", division: "50" },
  "5022": { code: "5022", description: "Transporte fluvial de carga", riskLevel: "IV", division: "50" },
  "5111": { code: "5111", description: "Transporte aéreo de pasajeros", riskLevel: "IV", division: "51" },
  "5112": { code: "5112", description: "Transporte aéreo de carga", riskLevel: "IV", division: "51" },
  "5121": { code: "5121", description: "Transporte espacial", riskLevel: "V", division: "51" },
  "5210": { code: "5210", description: "Almacenamiento y depósito", riskLevel: "III", division: "52" },
  "5221": { code: "5221", description: "Actividades de estaciones, vías y servicios complementarios para el transporte terrestre", riskLevel: "III", division: "52" },
  "5222": { code: "5222", description: "Actividades de puertos y servicios complementarios para el transporte acuático", riskLevel: "IV", division: "52" },
  "5223": { code: "5223", description: "Actividades de aeropuertos, servicios de navegación aérea y demás actividades conexas al transporte aéreo", riskLevel: "IV", division: "52" },
  "5224": { code: "5224", description: "Manipulación de carga", riskLevel: "IV", division: "52" },
  "5229": { code: "5229", description: "Otras actividades complementarias al transporte", riskLevel: "II", division: "52" },
  "5310": { code: "5310", description: "Actividades postales nacionales", riskLevel: "II", division: "53" },
  "5320": { code: "5320", description: "Actividades de mensajería", riskLevel: "II", division: "53" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN I: ALOJAMIENTO Y SERVICIOS DE COMIDA (55-56)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "5511": { code: "5511", description: "Alojamiento en hoteles", riskLevel: "II", division: "55" },
  "5512": { code: "5512", description: "Alojamiento en aparta hoteles", riskLevel: "II", division: "55" },
  "5513": { code: "5513", description: "Alojamiento en centros vacacionales", riskLevel: "II", division: "55" },
  "5514": { code: "5514", description: "Alojamiento rural", riskLevel: "II", division: "55" },
  "5519": { code: "5519", description: "Otros tipos de alojamiento para visitantes", riskLevel: "II", division: "55" },
  "5520": { code: "5520", description: "Actividades de zonas de camping y parques para vehículos recreacionales", riskLevel: "II", division: "55" },
  "5530": { code: "5530", description: "Servicio por horas", riskLevel: "II", division: "55" },
  "5590": { code: "5590", description: "Otros tipos de alojamiento n.c.p.", riskLevel: "II", division: "55" },
  "5611": { code: "5611", description: "Expendio a la mesa de comidas preparadas", riskLevel: "II", division: "56" },
  "5612": { code: "5612", description: "Expendio por autoservicio de comidas preparadas", riskLevel: "II", division: "56" },
  "5613": { code: "5613", description: "Expendio de comidas preparadas en cafeterías", riskLevel: "II", division: "56" },
  "5619": { code: "5619", description: "Otros tipos de expendio de comidas preparadas n.c.p.", riskLevel: "II", division: "56" },
  "5621": { code: "5621", description: "Catering para eventos", riskLevel: "II", division: "56" },
  "5629": { code: "5629", description: "Actividades de otros servicios de comidas", riskLevel: "II", division: "56" },
  "5630": { code: "5630", description: "Expendio de bebidas alcohólicas para el consumo dentro del establecimiento", riskLevel: "II", division: "56" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN J: INFORMACIÓN Y COMUNICACIONES (58-63)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "5811": { code: "5811", description: "Edición de libros", riskLevel: "I", division: "58" },
  "5812": { code: "5812", description: "Edición de directorios y listas de correo", riskLevel: "I", division: "58" },
  "5813": { code: "5813", description: "Edición de periódicos, revistas y otras publicaciones periódicas", riskLevel: "I", division: "58" },
  "5819": { code: "5819", description: "Otros trabajos de edición", riskLevel: "I", division: "58" },
  "5820": { code: "5820", description: "Edición de programas de informática (software)", riskLevel: "I", division: "58" },
  "5911": { code: "5911", description: "Actividades de producción de películas cinematográficas, videos, programas, anuncios y comerciales de televisión", riskLevel: "II", division: "59" },
  "5912": { code: "5912", description: "Actividades de posproducción de películas cinematográficas, videos, programas, anuncios y comerciales de televisión", riskLevel: "I", division: "59" },
  "5913": { code: "5913", description: "Actividades de distribución de películas cinematográficas, videos, programas, anuncios y comerciales de televisión", riskLevel: "I", division: "59" },
  "5914": { code: "5914", description: "Actividades de exhibición de películas cinematográficas y videos", riskLevel: "I", division: "59" },
  "5920": { code: "5920", description: "Actividades de grabación de sonido y edición de música", riskLevel: "I", division: "59" },
  "6010": { code: "6010", description: "Actividades de programación y transmisión en el servicio de radiodifusión sonora", riskLevel: "I", division: "60" },
  "6020": { code: "6020", description: "Actividades de programación y transmisión de televisión", riskLevel: "I", division: "60" },
  "6110": { code: "6110", description: "Actividades de telecomunicaciones alámbricas", riskLevel: "II", division: "61" },
  "6120": { code: "6120", description: "Actividades de telecomunicaciones inalámbricas", riskLevel: "II", division: "61" },
  "6130": { code: "6130", description: "Actividades de telecomunicación satelital", riskLevel: "II", division: "61" },
  "6190": { code: "6190", description: "Otras actividades de telecomunicaciones", riskLevel: "II", division: "61" },
  "6201": { code: "6201", description: "Actividades de desarrollo de sistemas informáticos (planificación, análisis, diseño, programación, pruebas)", riskLevel: "I", division: "62" },
  "6202": { code: "6202", description: "Actividades de consultoría informática y actividades de administración de instalaciones informáticas", riskLevel: "I", division: "62" },
  "6209": { code: "6209", description: "Otras actividades de tecnologías de información y actividades de servicios informáticos", riskLevel: "I", division: "62" },
  "6311": { code: "6311", description: "Procesamiento de datos, alojamiento (hosting) y actividades relacionadas", riskLevel: "I", division: "63" },
  "6312": { code: "6312", description: "Portales web", riskLevel: "I", division: "63" },
  "6391": { code: "6391", description: "Actividades de agencias de noticias", riskLevel: "I", division: "63" },
  "6399": { code: "6399", description: "Otras actividades de servicio de información n.c.p.", riskLevel: "I", division: "63" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN K: ACTIVIDADES FINANCIERAS Y DE SEGUROS (64-66)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "6411": { code: "6411", description: "Banco Central", riskLevel: "I", division: "64" },
  "6412": { code: "6412", description: "Bancos comerciales", riskLevel: "I", division: "64" },
  "6421": { code: "6421", description: "Actividades de las corporaciones financieras", riskLevel: "I", division: "64" },
  "6422": { code: "6422", description: "Actividades de las compañías de financiamiento", riskLevel: "I", division: "64" },
  "6423": { code: "6423", description: "Banca de segundo piso", riskLevel: "I", division: "64" },
  "6424": { code: "6424", description: "Actividades de las cooperativas financieras", riskLevel: "I", division: "64" },
  "6431": { code: "6431", description: "Fideicomisos, fondos y entidades financieras similares", riskLevel: "I", division: "64" },
  "6432": { code: "6432", description: "Fondos de cesantías", riskLevel: "I", division: "64" },
  "6491": { code: "6491", description: "Leasing financiero (arrendamiento financiero)", riskLevel: "I", division: "64" },
  "6492": { code: "6492", description: "Actividades financieras de fondos de empleados y otras formas asociativas del sector solidario", riskLevel: "I", division: "64" },
  "6493": { code: "6493", description: "Actividades de compra de cartera o factoring", riskLevel: "I", division: "64" },
  "6494": { code: "6494", description: "Otras actividades de distribución de fondos", riskLevel: "I", division: "64" },
  "6495": { code: "6495", description: "Instituciones especiales oficiales", riskLevel: "I", division: "64" },
  "6499": { code: "6499", description: "Otras actividades de servicio financiero, excepto las de seguros y pensiones n.c.p.", riskLevel: "I", division: "64" },
  "6511": { code: "6511", description: "Seguros generales", riskLevel: "I", division: "65" },
  "6512": { code: "6512", description: "Seguros de vida", riskLevel: "I", division: "65" },
  "6513": { code: "6513", description: "Reaseguros", riskLevel: "I", division: "65" },
  "6514": { code: "6514", description: "Capitalización", riskLevel: "I", division: "65" },
  "6521": { code: "6521", description: "Servicios de seguros sociales de salud", riskLevel: "I", division: "65" },
  "6522": { code: "6522", description: "Servicios de seguros sociales de riesgos profesionales", riskLevel: "I", division: "65" },
  "6531": { code: "6531", description: "Régimen de prima media con prestación definida (RPM)", riskLevel: "I", division: "65" },
  "6532": { code: "6532", description: "Régimen de ahorro individual (RAI)", riskLevel: "I", division: "65" },
  "6611": { code: "6611", description: "Administración de mercados financieros", riskLevel: "I", division: "66" },
  "6612": { code: "6612", description: "Corretaje de valores y de contratos de productos básicos", riskLevel: "I", division: "66" },
  "6613": { code: "6613", description: "Otras actividades relacionadas con el mercado de valores", riskLevel: "I", division: "66" },
  "6614": { code: "6614", description: "Actividades de las casas de cambio", riskLevel: "I", division: "66" },
  "6615": { code: "6615", description: "Actividades de los profesionales de compra y venta de divisas", riskLevel: "I", division: "66" },
  "6619": { code: "6619", description: "Otras actividades auxiliares de las actividades de servicios financieros n.c.p.", riskLevel: "I", division: "66" },
  "6621": { code: "6621", description: "Actividades de agentes y corredores de seguros", riskLevel: "I", division: "66" },
  "6629": { code: "6629", description: "Evaluación de riesgos y daños, y otras actividades de servicios auxiliares", riskLevel: "I", division: "66" },
  "6630": { code: "6630", description: "Actividades de administración de fondos", riskLevel: "I", division: "66" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN L: ACTIVIDADES INMOBILIARIAS (68)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "6810": { code: "6810", description: "Actividades inmobiliarias realizadas con bienes propios o arrendados", riskLevel: "I", division: "68" },
  "6820": { code: "6820", description: "Actividades inmobiliarias realizadas a cambio de una retribución o por contrata", riskLevel: "I", division: "68" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN M: ACTIVIDADES PROFESIONALES, CIENTÍFICAS Y TÉCNICAS (69-75)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "6910": { code: "6910", description: "Actividades jurídicas", riskLevel: "I", division: "69" },
  "6920": { code: "6920", description: "Actividades de contabilidad, teneduría de libros, auditoría financiera y asesoría tributaria", riskLevel: "I", division: "69" },
  "7010": { code: "7010", description: "Actividades de administración empresarial", riskLevel: "I", division: "70" },
  "7020": { code: "7020", description: "Actividades de consultoría de gestión", riskLevel: "I", division: "70" },
  "7110": { code: "7110", description: "Actividades de arquitectura e ingeniería y otras actividades conexas de consultoría técnica", riskLevel: "I", division: "71" },
  "7120": { code: "7120", description: "Ensayos y análisis técnicos", riskLevel: "II", division: "71" },
  "7210": { code: "7210", description: "Investigaciones y desarrollo experimental en el campo de las ciencias naturales y la ingeniería", riskLevel: "II", division: "72" },
  "7220": { code: "7220", description: "Investigaciones y desarrollo experimental en el campo de las ciencias sociales y las humanidades", riskLevel: "I", division: "72" },
  "7310": { code: "7310", description: "Publicidad", riskLevel: "I", division: "73" },
  "7320": { code: "7320", description: "Estudios de mercado y realización de encuestas de opinión pública", riskLevel: "I", division: "73" },
  "7410": { code: "7410", description: "Actividades especializadas de diseño", riskLevel: "I", division: "74" },
  "7420": { code: "7420", description: "Actividades de fotografía", riskLevel: "I", division: "74" },
  "7490": { code: "7490", description: "Otras actividades profesionales, científicas y técnicas n.c.p.", riskLevel: "I", division: "74" },
  "7500": { code: "7500", description: "Actividades veterinarias", riskLevel: "II", division: "75" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN N: ACTIVIDADES DE SERVICIOS ADMINISTRATIVOS Y DE APOYO (77-82)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "7710": { code: "7710", description: "Alquiler y arrendamiento de vehículos automotores", riskLevel: "II", division: "77" },
  "7721": { code: "7721", description: "Alquiler y arrendamiento de equipo recreativo y deportivo", riskLevel: "II", division: "77" },
  "7722": { code: "7722", description: "Alquiler de videos y discos", riskLevel: "I", division: "77" },
  "7729": { code: "7729", description: "Alquiler y arrendamiento de otros efectos personales y enseres domésticos n.c.p.", riskLevel: "I", division: "77" },
  "7730": { code: "7730", description: "Alquiler y arrendamiento de otros tipos de maquinaria, equipo y bienes tangibles n.c.p.", riskLevel: "II", division: "77" },
  "7740": { code: "7740", description: "Arrendamiento de propiedad intelectual y productos similares, excepto obras protegidas por derechos de autor", riskLevel: "I", division: "77" },
  "7810": { code: "7810", description: "Actividades de agencias de empleo", riskLevel: "I", division: "78" },
  "7820": { code: "7820", description: "Actividades de agencias de empleo temporal", riskLevel: "II", division: "78" },
  "7830": { code: "7830", description: "Otras actividades de suministro de recurso humano", riskLevel: "II", division: "78" },
  "7911": { code: "7911", description: "Actividades de las agencias de viaje", riskLevel: "I", division: "79" },
  "7912": { code: "7912", description: "Actividades de operadores turísticos", riskLevel: "I", division: "79" },
  "7990": { code: "7990", description: "Otros servicios de reserva y actividades relacionadas", riskLevel: "I", division: "79" },
  "8010": { code: "8010", description: "Actividades de seguridad privada", riskLevel: "IV", division: "80" },
  "8020": { code: "8020", description: "Actividades de servicios de sistemas de seguridad", riskLevel: "II", division: "80" },
  "8030": { code: "8030", description: "Actividades de detectives e investigadores privados", riskLevel: "II", division: "80" },
  "8110": { code: "8110", description: "Actividades combinadas de apoyo a instalaciones", riskLevel: "II", division: "81" },
  "8121": { code: "8121", description: "Limpieza general interior de edificios", riskLevel: "II", division: "81" },
  "8129": { code: "8129", description: "Otras actividades de limpieza de edificios e instalaciones industriales", riskLevel: "III", division: "81" },
  "8130": { code: "8130", description: "Actividades de paisajismo y servicios de mantenimiento conexos", riskLevel: "III", division: "81" },
  "8211": { code: "8211", description: "Actividades combinadas de servicios administrativos de oficina", riskLevel: "I", division: "82" },
  "8219": { code: "8219", description: "Fotocopiado, preparación de documentos y otras actividades especializadas de apoyo a oficina", riskLevel: "I", division: "82" },
  "8220": { code: "8220", description: "Actividades de centros de llamadas (call center)", riskLevel: "I", division: "82" },
  "8230": { code: "8230", description: "Organización de convenciones y eventos comerciales", riskLevel: "I", division: "82" },
  "8291": { code: "8291", description: "Actividades de agencias de cobranza y oficinas de calificación crediticia", riskLevel: "I", division: "82" },
  "8292": { code: "8292", description: "Actividades de envase y empaque", riskLevel: "II", division: "82" },
  "8299": { code: "8299", description: "Otras actividades de servicio de apoyo a las empresas n.c.p.", riskLevel: "II", division: "82" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN O: ADMINISTRACIÓN PÚBLICA Y DEFENSA (84)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "8411": { code: "8411", description: "Actividades legislativas de la administración pública", riskLevel: "I", division: "84" },
  "8412": { code: "8412", description: "Actividades ejecutivas de la administración pública", riskLevel: "I", division: "84" },
  "8413": { code: "8413", description: "Regulación de las actividades de organismos que prestan servicios de salud, educativos, culturales y otros servicios sociales", riskLevel: "I", division: "84" },
  "8414": { code: "8414", description: "Actividades reguladoras y facilitadoras de la actividad económica", riskLevel: "I", division: "84" },
  "8415": { code: "8415", description: "Actividades de los otros órganos de control", riskLevel: "I", division: "84" },
  "8421": { code: "8421", description: "Relaciones exteriores", riskLevel: "I", division: "84" },
  "8422": { code: "8422", description: "Actividades de defensa", riskLevel: "V", division: "84" },
  "8423": { code: "8423", description: "Orden público y actividades de seguridad", riskLevel: "V", division: "84" },
  "8424": { code: "8424", description: "Administración de justicia", riskLevel: "I", division: "84" },
  "8430": { code: "8430", description: "Actividades de planes de seguridad social de afiliación obligatoria", riskLevel: "I", division: "84" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN P: EDUCACIÓN (85)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "8511": { code: "8511", description: "Educación de la primera infancia", riskLevel: "II", division: "85" },
  "8512": { code: "8512", description: "Educación preescolar", riskLevel: "II", division: "85" },
  "8513": { code: "8513", description: "Educación básica primaria", riskLevel: "II", division: "85" },
  "8521": { code: "8521", description: "Educación básica secundaria", riskLevel: "II", division: "85" },
  "8522": { code: "8522", description: "Educación media académica", riskLevel: "II", division: "85" },
  "8523": { code: "8523", description: "Educación media técnica y de formación laboral", riskLevel: "II", division: "85" },
  "8530": { code: "8530", description: "Establecimientos que combinan diferentes niveles de educación", riskLevel: "II", division: "85" },
  "8541": { code: "8541", description: "Educación técnica profesional", riskLevel: "II", division: "85" },
  "8542": { code: "8542", description: "Educación tecnológica", riskLevel: "II", division: "85" },
  "8543": { code: "8543", description: "Educación de instituciones universitarias o de escuelas tecnológicas", riskLevel: "II", division: "85" },
  "8544": { code: "8544", description: "Educación de universidades", riskLevel: "II", division: "85" },
  "8551": { code: "8551", description: "Formación para el trabajo", riskLevel: "II", division: "85" },
  "8552": { code: "8552", description: "Enseñanza deportiva y recreativa", riskLevel: "II", division: "85" },
  "8553": { code: "8553", description: "Enseñanza cultural", riskLevel: "I", division: "85" },
  "8559": { code: "8559", description: "Otros tipos de educación n.c.p.", riskLevel: "I", division: "85" },
  "8560": { code: "8560", description: "Actividades de apoyo a la educación", riskLevel: "I", division: "85" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN Q: ACTIVIDADES DE ATENCIÓN DE LA SALUD HUMANA Y DE ASISTENCIA SOCIAL (86-88)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "8610": { code: "8610", description: "Actividades de hospitales y clínicas, con internación", riskLevel: "III", division: "86" },
  "8621": { code: "8621", description: "Actividades de la práctica médica, sin internación", riskLevel: "II", division: "86" },
  "8622": { code: "8622", description: "Actividades de la práctica odontológica", riskLevel: "II", division: "86" },
  "8691": { code: "8691", description: "Actividades de apoyo diagnóstico", riskLevel: "III", division: "86" },
  "8692": { code: "8692", description: "Actividades de apoyo terapéutico", riskLevel: "II", division: "86" },
  "8699": { code: "8699", description: "Otras actividades de atención de la salud humana", riskLevel: "II", division: "86" },
  "8710": { code: "8710", description: "Actividades de atención residencial medicalizada de tipo general", riskLevel: "III", division: "87" },
  "8720": { code: "8720", description: "Actividades de atención residencial, para el cuidado de pacientes con retardo mental, enfermedad mental y consumo de sustancias psicoactivas", riskLevel: "III", division: "87" },
  "8730": { code: "8730", description: "Actividades de atención en instituciones para el cuidado de personas mayores y/o discapacitadas", riskLevel: "II", division: "87" },
  "8790": { code: "8790", description: "Otras actividades de atención en instituciones con alojamiento", riskLevel: "II", division: "87" },
  "8810": { code: "8810", description: "Actividades de asistencia social sin alojamiento para personas mayores y discapacitadas", riskLevel: "II", division: "88" },
  "8890": { code: "8890", description: "Otras actividades de asistencia social sin alojamiento", riskLevel: "II", division: "88" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN R: ACTIVIDADES ARTÍSTICAS, DE ENTRETENIMIENTO Y RECREACIÓN (90-93)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9001": { code: "9001", description: "Creación literaria", riskLevel: "I", division: "90" },
  "9002": { code: "9002", description: "Creación musical", riskLevel: "I", division: "90" },
  "9003": { code: "9003", description: "Creación teatral", riskLevel: "II", division: "90" },
  "9004": { code: "9004", description: "Creación audiovisual", riskLevel: "II", division: "90" },
  "9005": { code: "9005", description: "Artes plásticas y visuales", riskLevel: "I", division: "90" },
  "9006": { code: "9006", description: "Actividades teatrales", riskLevel: "II", division: "90" },
  "9007": { code: "9007", description: "Actividades de espectáculos musicales en vivo", riskLevel: "II", division: "90" },
  "9008": { code: "9008", description: "Otras actividades de espectáculos en vivo n.c.p.", riskLevel: "II", division: "90" },
  "9101": { code: "9101", description: "Actividades de bibliotecas y archivos", riskLevel: "I", division: "91" },
  "9102": { code: "9102", description: "Actividades y funcionamiento de museos, conservación de edificios y sitios históricos", riskLevel: "I", division: "91" },
  "9103": { code: "9103", description: "Actividades de jardines botánicos, zoológicos y reservas naturales", riskLevel: "II", division: "91" },
  "9200": { code: "9200", description: "Actividades de juegos de azar y apuestas", riskLevel: "II", division: "92" },
  "9311": { code: "9311", description: "Gestión de instalaciones deportivas", riskLevel: "II", division: "93" },
  "9312": { code: "9312", description: "Actividades de clubes deportivos", riskLevel: "II", division: "93" },
  "9319": { code: "9319", description: "Otras actividades deportivas", riskLevel: "II", division: "93" },
  "9321": { code: "9321", description: "Actividades de parques de atracciones y parques temáticos", riskLevel: "III", division: "93" },
  "9329": { code: "9329", description: "Otras actividades recreativas y de esparcimiento n.c.p.", riskLevel: "II", division: "93" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN S: OTRAS ACTIVIDADES DE SERVICIOS (94-96)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9411": { code: "9411", description: "Actividades de asociaciones empresariales y de empleadores", riskLevel: "I", division: "94" },
  "9412": { code: "9412", description: "Actividades de asociaciones profesionales", riskLevel: "I", division: "94" },
  "9420": { code: "9420", description: "Actividades de sindicatos de empleados", riskLevel: "I", division: "94" },
  "9491": { code: "9491", description: "Actividades de asociaciones religiosas", riskLevel: "I", division: "94" },
  "9492": { code: "9492", description: "Actividades de asociaciones políticas", riskLevel: "I", division: "94" },
  "9499": { code: "9499", description: "Actividades de otras asociaciones n.c.p.", riskLevel: "I", division: "94" },
  "9511": { code: "9511", description: "Mantenimiento y reparación de computadores y de equipo periférico", riskLevel: "II", division: "95" },
  "9512": { code: "9512", description: "Mantenimiento y reparación de equipos de comunicación", riskLevel: "II", division: "95" },
  "9521": { code: "9521", description: "Mantenimiento y reparación de aparatos electrónicos de consumo", riskLevel: "II", division: "95" },
  "9522": { code: "9522", description: "Mantenimiento y reparación de aparatos y equipos domésticos y de jardinería", riskLevel: "II", division: "95" },
  "9523": { code: "9523", description: "Reparación de calzado y artículos de cuero", riskLevel: "I", division: "95" },
  "9524": { code: "9524", description: "Reparación de muebles y accesorios para el hogar", riskLevel: "II", division: "95" },
  "9529": { code: "9529", description: "Mantenimiento y reparación de otros efectos personales y enseres domésticos", riskLevel: "II", division: "95" },
  "9601": { code: "9601", description: "Lavado y limpieza, incluso la limpieza en seco, de productos textiles y de piel", riskLevel: "II", division: "96" },
  "9602": { code: "9602", description: "Peluquería y otros tratamientos de belleza", riskLevel: "I", division: "96" },
  "9603": { code: "9603", description: "Pompas fúnebres y actividades relacionadas", riskLevel: "III", division: "96" },
  "9609": { code: "9609", description: "Otras actividades de servicios personales n.c.p.", riskLevel: "II", division: "96" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN T: ACTIVIDADES DE LOS HOGARES COMO EMPLEADORES (97-98)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9700": { code: "9700", description: "Actividades de los hogares individuales como empleadores de personal doméstico", riskLevel: "II", division: "97" },
  "9810": { code: "9810", description: "Actividades no diferenciadas de los hogares individuales como productores de bienes para uso propio", riskLevel: "II", division: "98" },
  "9820": { code: "9820", description: "Actividades no diferenciadas de los hogares individuales como productores de servicios para uso propio", riskLevel: "II", division: "98" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN U: ACTIVIDADES DE ORGANIZACIONES Y ENTIDADES EXTRATERRITORIALES (99)
  // ═══════════════════════════════════════════════════════════════════════════
  
  "9900": { code: "9900", description: "Actividades de organizaciones y entidades extraterritoriales", riskLevel: "I", division: "99" },
};

/**
 * Clasificación por división CIIU para fallback
 * Cuando no se encuentra el código exacto, se usa el nivel de riesgo más común de la división
 */
export const DIVISION_DEFAULT_RISK: Record<string, RiskLevel> = {
  "01": "III",  // Agricultura, ganadería - riesgo medio-alto
  "02": "IV",   // Silvicultura - riesgo alto
  "03": "IV",   // Pesca - riesgo alto
  "05": "V",    // Extracción de carbón - riesgo máximo
  "06": "V",    // Extracción de petróleo - riesgo máximo
  "07": "V",    // Extracción de minerales - riesgo máximo
  "08": "V",    // Otras minas y canteras - riesgo máximo
  "09": "V",    // Servicios de apoyo minería - riesgo máximo
  "10": "III",  // Productos alimenticios - riesgo medio
  "11": "III",  // Bebidas - riesgo medio
  "12": "III",  // Tabaco - riesgo medio
  "13": "II",   // Textiles - riesgo bajo-medio
  "14": "II",   // Confección - riesgo bajo-medio
  "15": "II",   // Cuero y calzado - riesgo bajo-medio
  "16": "IV",   // Madera - riesgo alto
  "17": "III",  // Papel - riesgo medio
  "18": "II",   // Impresión - riesgo bajo-medio
  "19": "V",    // Refinación petróleo - riesgo máximo
  "20": "III",  // Productos químicos - riesgo medio-alto
  "21": "II",   // Farmacéuticos - riesgo bajo-medio
  "22": "III",  // Caucho y plástico - riesgo medio
  "23": "IV",   // Minerales no metálicos - riesgo alto
  "24": "IV",   // Metalúrgicos básicos - riesgo alto
  "25": "III",  // Productos de metal - riesgo medio-alto
  "26": "II",   // Electrónicos - riesgo bajo-medio
  "27": "III",  // Equipo eléctrico - riesgo medio
  "28": "III",  // Maquinaria y equipo - riesgo medio
  "29": "III",  // Vehículos automotores - riesgo medio
  "30": "III",  // Otros equipos transporte - riesgo medio-alto
  "31": "III",  // Muebles - riesgo medio
  "32": "II",   // Otras industrias - riesgo bajo-medio
  "33": "III",  // Instalación y reparación maquinaria - riesgo medio
  "35": "III",  // Electricidad, gas, vapor - riesgo medio-alto
  "36": "III",  // Distribución de agua - riesgo medio
  "37": "IV",   // Tratamiento aguas residuales - riesgo alto
  "38": "IV",   // Gestión de desechos - riesgo alto
  "39": "III",  // Saneamiento ambiental - riesgo medio
  "41": "V",    // Construcción edificios - riesgo máximo
  "42": "V",    // Obras de ingeniería civil - riesgo máximo
  "43": "IV",   // Actividades especializadas construcción - riesgo alto
  "45": "II",   // Comercio vehículos - riesgo bajo-medio
  "46": "II",   // Comercio al por mayor - riesgo bajo-medio
  "47": "I",    // Comercio al por menor - riesgo bajo
  "49": "IV",   // Transporte terrestre - riesgo alto
  "50": "IV",   // Transporte acuático - riesgo alto
  "51": "IV",   // Transporte aéreo - riesgo alto
  "52": "III",  // Almacenamiento - riesgo medio
  "53": "II",   // Correo y mensajería - riesgo bajo-medio
  "55": "II",   // Alojamiento - riesgo bajo-medio
  "56": "II",   // Servicios de comida - riesgo bajo-medio
  "58": "I",    // Edición - riesgo bajo
  "59": "I",    // Producción audiovisual - riesgo bajo
  "60": "I",    // Radio y televisión - riesgo bajo
  "61": "II",   // Telecomunicaciones - riesgo bajo-medio
  "62": "I",    // Desarrollo de software - riesgo bajo
  "63": "I",    // Servicios de información - riesgo bajo
  "64": "I",    // Servicios financieros - riesgo bajo
  "65": "I",    // Seguros - riesgo bajo
  "66": "I",    // Servicios auxiliares financieros - riesgo bajo
  "68": "I",    // Actividades inmobiliarias - riesgo bajo
  "69": "I",    // Jurídicas y contables - riesgo bajo
  "70": "I",    // Consultoría de gestión - riesgo bajo
  "71": "I",    // Arquitectura e ingeniería - riesgo bajo
  "72": "I",    // Investigación y desarrollo - riesgo bajo
  "73": "I",    // Publicidad - riesgo bajo
  "74": "I",    // Otras profesionales - riesgo bajo
  "75": "II",   // Veterinaria - riesgo bajo-medio
  "77": "I",    // Alquiler y arrendamiento - riesgo bajo
  "78": "II",   // Agencias de empleo - riesgo bajo-medio
  "79": "I",    // Agencias de viaje - riesgo bajo
  "80": "III",  // Seguridad privada - riesgo medio-alto
  "81": "II",   // Servicios a edificios - riesgo bajo-medio
  "82": "I",    // Servicios de apoyo empresas - riesgo bajo
  "84": "I",    // Administración pública - riesgo bajo (excepto defensa)
  "85": "II",   // Educación - riesgo bajo-medio
  "86": "II",   // Atención de la salud - riesgo bajo-medio
  "87": "II",   // Atención residencial - riesgo bajo-medio
  "88": "II",   // Asistencia social - riesgo bajo-medio
  "90": "I",    // Actividades artísticas - riesgo bajo
  "91": "I",    // Bibliotecas y museos - riesgo bajo
  "92": "II",   // Juegos de azar - riesgo bajo-medio
  "93": "II",   // Actividades deportivas - riesgo bajo-medio
  "94": "I",    // Asociaciones - riesgo bajo
  "95": "II",   // Reparación de bienes - riesgo bajo-medio
  "96": "II",   // Otros servicios personales - riesgo bajo-medio
  "97": "II",   // Hogares como empleadores - riesgo bajo-medio
  "98": "II",   // Hogares productores - riesgo bajo-medio
  "99": "I",    // Organizaciones extraterritoriales - riesgo bajo
};

/**
 * Opciones para la función getRiskLevelFromCiiu
 */
export interface CiiuLookupOptions {
  /**
   * Si es true, usa el nivel de riesgo por defecto de la división cuando
   * el código exacto no se encuentra. Por defecto es false (modo estricto).
   * 
   * ADVERTENCIA: Usar fallback puede asignar niveles de riesgo incorrectos
   * para códigos no mapeados. Solo usar cuando se necesita una sugerencia
   * y el usuario debe confirmar manualmente.
   */
  useDivisionFallback?: boolean;
}

/**
 * Resultado de la búsqueda CIIU con información de fuente
 */
export interface CiiuLookupResult {
  riskLevel: RiskLevel;
  source: 'exact' | 'division_fallback';
  requiresManualConfirmation: boolean;
  message?: string;
}

/**
 * Obtiene el nivel de riesgo ARL a partir del código CIIU (MODO ESTRICTO)
 * 
 * Por defecto opera en modo estricto:
 * - Solo retorna nivel de riesgo si el código CIIU existe exactamente en la tabla
 * - Retorna null para códigos no encontrados (requieren asignación manual)
 * 
 * Opcionalmente se puede usar fallback por división:
 * - Si se activa useDivisionFallback, usa el riesgo típico de la división
 * - ADVERTENCIA: El fallback es solo una sugerencia, requiere confirmación manual
 * 
 * @param ciiuCode - Código CIIU de 4 dígitos (ej: "0111", "4390", "6201")
 * @param options - Opciones de búsqueda (por defecto: modo estricto)
 * @returns Nivel de riesgo (I, II, III, IV, V) o null si no se encuentra
 * 
 * @example
 * // Modo estricto (por defecto) - solo códigos exactos
 * getRiskLevelFromCiiu("0111") // => "IV" (Cultivo de cereales)
 * getRiskLevelFromCiiu("4390") // => "V" (Construcción especializada)
 * getRiskLevelFromCiiu("9999") // => null (Código no encontrado - requiere manual)
 * 
 * @example
 * // Con fallback de división (solo para sugerencias)
 * getRiskLevelFromCiiu("9999", { useDivisionFallback: true }) // => "I" (Sugerencia de división 99)
 */
export function getRiskLevelFromCiiu(
  ciiuCode: string | null | undefined,
  options: CiiuLookupOptions = {}
): RiskLevel | null {
  if (!ciiuCode) {
    return null;
  }
  
  const { useDivisionFallback = false } = options;
  
  // Normalizar código (eliminar espacios, puntos, guiones)
  const normalizedCode = ciiuCode.replace(/[\s.\-]/g, "").trim();
  
  // Validar formato (debe ser numérico de 4 dígitos para búsqueda exacta)
  if (!/^\d{4}$/.test(normalizedCode)) {
    return null;
  }
  
  // Búsqueda exacta por código de 4 dígitos
  const classification = CIIU_RISK_CLASSIFICATION[normalizedCode];
  if (classification) {
    return classification.riskLevel;
  }
  
  // Código no encontrado - modo estricto retorna null
  if (!useDivisionFallback) {
    return null;
  }
  
  // Fallback (solo si se solicita explícitamente): buscar por división
  const division = normalizedCode.substring(0, 2);
  const defaultRisk = DIVISION_DEFAULT_RISK[division];
  
  return defaultRisk || null;
}

/**
 * Obtiene el nivel de riesgo con información detallada de la fuente
 * 
 * Esta función es útil cuando se necesita mostrar al usuario si el resultado
 * proviene de una coincidencia exacta o de un fallback que requiere confirmación.
 * 
 * @param ciiuCode - Código CIIU de 4 dígitos
 * @returns Objeto con nivel de riesgo, fuente y si requiere confirmación, o null
 */
export function getRiskLevelFromCiiuDetailed(
  ciiuCode: string | null | undefined
): CiiuLookupResult | null {
  if (!ciiuCode) {
    return null;
  }
  
  const normalizedCode = ciiuCode.replace(/[\s.\-]/g, "").trim();
  
  if (!/^\d{4}$/.test(normalizedCode)) {
    return null;
  }
  
  // Búsqueda exacta
  const classification = CIIU_RISK_CLASSIFICATION[normalizedCode];
  if (classification) {
    return {
      riskLevel: classification.riskLevel,
      source: 'exact',
      requiresManualConfirmation: false,
    };
  }
  
  // Fallback por división (siempre incluido pero marcado como sugerencia)
  const division = normalizedCode.substring(0, 2);
  const defaultRisk = DIVISION_DEFAULT_RISK[division];
  
  if (defaultRisk) {
    return {
      riskLevel: defaultRisk,
      source: 'division_fallback',
      requiresManualConfirmation: true,
      message: `Código CIIU ${normalizedCode} no encontrado en tabla. Nivel sugerido basado en división ${division}. Requiere confirmación manual según Decreto 1607/2002.`,
    };
  }
  
  return null;
}

/**
 * Obtiene la clasificación completa CIIU (código, descripción, riesgo, división)
 * 
 * @param ciiuCode - Código CIIU de 4 dígitos
 * @returns Objeto CiiuClassification o null si no se encuentra
 */
export function getCiiuClassification(ciiuCode: string | null | undefined): CiiuClassification | null {
  if (!ciiuCode) {
    return null;
  }
  
  const normalizedCode = ciiuCode.replace(/[\s.\-]/g, "").trim();
  
  if (!/^\d{4}$/.test(normalizedCode)) {
    return null;
  }
  
  return CIIU_RISK_CLASSIFICATION[normalizedCode] || null;
}

/**
 * Verifica si un código CIIU es válido y está en la tabla de clasificación
 * 
 * @param ciiuCode - Código CIIU a validar
 * @returns true si el código existe en la tabla, false en caso contrario
 */
export function isValidCiiuCode(ciiuCode: string | null | undefined): boolean {
  if (!ciiuCode) {
    return false;
  }
  
  const normalizedCode = ciiuCode.replace(/[\s.\-]/g, "").trim();
  
  // Validar formato
  if (!/^\d{4}$/.test(normalizedCode)) {
    return false;
  }
  
  return normalizedCode in CIIU_RISK_CLASSIFICATION;
}

/**
 * Obtiene todos los códigos CIIU de una división específica
 * 
 * @param division - Código de división (2 dígitos, ej: "01", "43", "62")
 * @returns Array de clasificaciones CIIU de esa división
 */
export function getCiiuByDivision(division: string): CiiuClassification[] {
  if (!/^\d{2}$/.test(division)) {
    return [];
  }
  
  return Object.values(CIIU_RISK_CLASSIFICATION).filter(c => c.division === division);
}

/**
 * Obtiene todos los códigos CIIU de un nivel de riesgo específico
 * 
 * @param riskLevel - Nivel de riesgo (I, II, III, IV, V)
 * @returns Array de clasificaciones CIIU con ese nivel de riesgo
 */
export function getCiiuByRiskLevel(riskLevel: RiskLevel): CiiuClassification[] {
  return Object.values(CIIU_RISK_CLASSIFICATION).filter(c => c.riskLevel === riskLevel);
}

/**
 * Estadísticas de la tabla de clasificación CIIU
 */
export function getCiiuStatistics(): {
  totalCodes: number;
  byRiskLevel: Record<RiskLevel, number>;
  byDivision: Record<string, number>;
} {
  const codes = Object.values(CIIU_RISK_CLASSIFICATION);
  
  const byRiskLevel: Record<RiskLevel, number> = {
    "I": 0,
    "II": 0,
    "III": 0,
    "IV": 0,
    "V": 0,
  };
  
  const byDivision: Record<string, number> = {};
  
  for (const code of codes) {
    byRiskLevel[code.riskLevel]++;
    byDivision[code.division] = (byDivision[code.division] || 0) + 1;
  }
  
  return {
    totalCodes: codes.length,
    byRiskLevel,
    byDivision,
  };
}
