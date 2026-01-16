export interface EppPredefinido {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: 'cabeza' | 'ojos' | 'respiratorio' | 'auditivo' | 'manos' | 'pies' | 'cuerpo' | 'alturas' | 'electrico' | 'equipos';
  nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  normaNacional?: string;
  especificaciones?: string;
  vidaUtilMeses?: number;
}

export const eppsSstPredefinidos: EppPredefinido[] = [
  // PROTECCIÓN DE CABEZA
  {
    codigo: 'EPP-CAB-01',
    nombre: 'Casco de Seguridad Industrial Clase G',
    descripcion: 'Casco de seguridad para protección contra impactos y golpes, con sistema de suspensión ajustable',
    categoria: 'cabeza',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 1523',
    especificaciones: 'Clase G (General): Protección contra impactos. Materiales: Polietileno de alta densidad o ABS',
    vidaUtilMeses: 36
  },
  {
    codigo: 'EPP-CAB-02',
    nombre: 'Casco Dieléctrico Clase E',
    descripcion: 'Casco de seguridad con aislamiento eléctrico para trabajos con tensión hasta 20,000 voltios',
    categoria: 'cabeza',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 1523',
    especificaciones: 'Clase E (Eléctrico): Aislamiento hasta 20kV. Certificación dieléctrica obligatoria',
    vidaUtilMeses: 36
  },

  // PROTECCIÓN VISUAL
  {
    codigo: 'EPP-OJO-01',
    nombre: 'Gafas de Seguridad Antiimpacto',
    descripcion: 'Gafas de policarbonato transparente con protección lateral, resistentes a impactos',
    categoria: 'ojos',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 1825 / ANSI Z87.1',
    especificaciones: 'Lentes de policarbonato, protección UV, antiempañante opcional',
    vidaUtilMeses: 12
  },
  {
    codigo: 'EPP-OJO-02',
    nombre: 'Careta Facial Completa',
    descripcion: 'Protector facial de policarbonato que cubre toda la cara, protección contra salpicaduras químicas',
    categoria: 'ojos',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 1825',
    especificaciones: 'Visor de policarbonato resistente a químicos, ajuste a casco o cabeza',
    vidaUtilMeses: 24
  },
  {
    codigo: 'EPP-OJO-03',
    nombre: 'Gafas para Soldadura Tono 5-14',
    descripcion: 'Gafas especializadas con filtros para protección contra radiación ultravioleta e infrarroja en soldadura',
    categoria: 'ojos',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 1825 / ANSI Z87.1',
    especificaciones: 'Filtros de sombra variables, protección contra radiación, ventilación indirecta',
    vidaUtilMeses: 18
  },

  // PROTECCIÓN RESPIRATORIA
  {
    codigo: 'EPP-RES-01',
    nombre: 'Respirador N95',
    descripcion: 'Mascarilla desechable con filtración del 95% de partículas en suspensión',
    categoria: 'respiratorio',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 4116 / NIOSH N95',
    especificaciones: 'Eficiencia de filtración ≥95%, válvula de exhalación opcional, uso único o limitado',
    vidaUtilMeses: 1
  },
  {
    codigo: 'EPP-RES-02',
    nombre: 'Respirador de Media Cara con Filtros',
    descripcion: 'Respirador reutilizable de silicona con filtros intercambiables para vapores orgánicos y partículas',
    categoria: 'respiratorio',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 4116',
    especificaciones: 'Cuerpo de silicona, filtros combinados (vapor orgánico + partículas), certificación NIOSH',
    vidaUtilMeses: 24
  },
  {
    codigo: 'EPP-RES-03',
    nombre: 'Equipo de Respiración Autónomo (SCBA)',
    descripcion: 'Sistema de respiración autónomo para ambientes IDLH (Inmediatamente Peligrosos para la Vida)',
    categoria: 'respiratorio',
    nivelRiesgo: 'critico',
    normaNacional: 'NFPA 1981',
    especificaciones: 'Cilindro de aire comprimido, máscara facial completa, presión positiva, autonomía 30-60 min',
    vidaUtilMeses: 120
  },

  // PROTECCIÓN AUDITIVA
  {
    codigo: 'EPP-AUD-01',
    nombre: 'Protectores Auditivos Tipo Tapón',
    descripcion: 'Tapones auditivos desechables de espuma de alta densidad, NRR 32dB',
    categoria: 'auditivo',
    nivelRiesgo: 'bajo',
    normaNacional: 'NTC 2272',
    especificaciones: 'NRR (Noise Reduction Rating) 32dB, espuma de PVC, desechable',
    vidaUtilMeses: 1
  },
  {
    codigo: 'EPP-AUD-02',
    nombre: 'Protectores Auditivos Tipo Copa',
    descripcion: 'Orejeras con atenuación de ruido de 27dB, copa acolchada ajustable',
    categoria: 'auditivo',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 2272',
    especificaciones: 'NRR 27dB, diadema ajustable, copas reemplazables, uso prolongado',
    vidaUtilMeses: 24
  },

  // PROTECCIÓN DE MANOS
  {
    codigo: 'EPP-MAN-01',
    nombre: 'Guantes de Nitrilo Resistentes a Químicos',
    descripcion: 'Guantes de nitrilo para manipulación de sustancias químicas, aceites y grasas',
    categoria: 'manos',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 2219',
    especificaciones: 'Nitrilo industrial, resistencia química, calibre 15 mil, palma texturizada',
    vidaUtilMeses: 3
  },
  {
    codigo: 'EPP-MAN-02',
    nombre: 'Guantes Dieléctricos Clase 00',
    descripcion: 'Guantes de caucho natural para trabajos eléctricos hasta 500V AC',
    categoria: 'manos',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 2206 / ASTM D120',
    especificaciones: 'Clase 00: Máximo 500V AC, prueba dieléctrica obligatoria cada 6 meses',
    vidaUtilMeses: 12
  },
  {
    codigo: 'EPP-MAN-03',
    nombre: 'Guantes Anticorte Nivel 5',
    descripcion: 'Guantes de fibra de alta resistencia con protección contra cortes y abrasión',
    categoria: 'manos',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 2219 / EN 388',
    especificaciones: 'Nivel 5 EN 388, HPPE (Polietileno de Alto Rendimiento), palma recubierta PU',
    vidaUtilMeses: 6
  },
  {
    codigo: 'EPP-MAN-04',
    nombre: 'Guantes de Cuero para Soldadura',
    descripcion: 'Guantes de cuero vacuno reforzado, resistentes a alta temperatura y chispas',
    categoria: 'manos',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 2219',
    especificaciones: 'Cuero vacuno tipo A, refuerzo en palma y dedos, costura kevlar',
    vidaUtilMeses: 6
  },

  // PROTECCIÓN DE PIES
  {
    codigo: 'EPP-PIE-01',
    nombre: 'Botas de Seguridad con Puntera de Acero',
    descripcion: 'Calzado de seguridad industrial con puntera metálica, suela antideslizante',
    categoria: 'pies',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 2396',
    especificaciones: 'Puntera de acero 200 joules, suela PU bidensidad, plantilla antiperforación',
    vidaUtilMeses: 12
  },
  {
    codigo: 'EPP-PIE-02',
    nombre: 'Botas Dieléctricas Clase 1',
    descripcion: 'Calzado dieléctrico certificado para trabajos eléctricos hasta 14,000 voltios',
    categoria: 'pies',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 2396 / ASTM F2413',
    especificaciones: 'Clase 1 (14kV), suela de caucho dieléctrico, certificación obligatoria',
    vidaUtilMeses: 18
  },
  {
    codigo: 'EPP-PIE-03',
    nombre: 'Botas de Caucho Impermeables',
    descripcion: 'Botas de PVC para ambientes húmedos, resistentes a químicos y agua',
    categoria: 'pies',
    nivelRiesgo: 'bajo',
    normaNacional: 'NTC 2396',
    especificaciones: 'PVC 100%, caña alta, suela antideslizante, resistencia química',
    vidaUtilMeses: 12
  },

  // PROTECCIÓN CORPORAL
  {
    codigo: 'EPP-CUE-01',
    nombre: 'Chaleco Reflectivo Alta Visibilidad',
    descripcion: 'Chaleco con bandas reflectivas para visibilidad en condiciones de baja luz',
    categoria: 'cuerpo',
    nivelRiesgo: 'bajo',
    normaNacional: 'NTC 4593 / ANSI 107',
    especificaciones: 'Clase 2 ANSI, material fluorescente, cintas reflectivas 3M o similar',
    vidaUtilMeses: 12
  },
  {
    codigo: 'EPP-CUE-02',
    nombre: 'Overol Resistente a Químicos Tipo 3',
    descripcion: 'Traje de protección química con costuras selladas para líquidos presurizados',
    categoria: 'cuerpo',
    nivelRiesgo: 'alto',
    normaNacional: 'NTC 3610 / EN 14605',
    especificaciones: 'Tipo 3 (protección contra líquidos), material laminado, costuras termoselladas',
    vidaUtilMeses: 6
  },
  {
    codigo: 'EPP-CUE-03',
    nombre: 'Delantal de Cuero para Soldadura',
    descripcion: 'Delantal de cuero vacuno resistente a chispas y salpicaduras de metal fundido',
    categoria: 'cuerpo',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 2653',
    especificaciones: 'Cuero vacuno tipo A, 90cm longitud, ajuste de cuello y cintura',
    vidaUtilMeses: 18
  },

  // PROTECCIÓN CONTRA CAÍDAS
  {
    codigo: 'EPP-ALT-01',
    nombre: 'Arnés de Cuerpo Completo',
    descripcion: 'Arnés de seguridad para trabajo en alturas con punto de anclaje dorsal',
    categoria: 'alturas',
    nivelRiesgo: 'critico',
    normaNacional: 'NTC 1771 / ANSI Z359.11',
    especificaciones: 'Punto de anclaje dorsal, argollas laterales, capacidad 140kg, inspección semestral',
    vidaUtilMeses: 60
  },
  {
    codigo: 'EPP-ALT-02',
    nombre: 'Eslinga de Posicionamiento con Absorbedor',
    descripcion: 'Eslinga Y con absorbedor de impacto para detención de caídas',
    categoria: 'alturas',
    nivelRiesgo: 'critico',
    normaNacional: 'NTC 1771 / ANSI Z359.13',
    especificaciones: 'Longitud 1.8m, absorbedor de impacto, ganchos de doble seguro, carga 2270kg',
    vidaUtilMeses: 60
  },
  {
    codigo: 'EPP-ALT-03',
    nombre: 'Línea de Vida Retráctil 20m',
    descripcion: 'Sistema retráctil de detención de caídas con cable de acero galvanizado',
    categoria: 'alturas',
    nivelRiesgo: 'critico',
    normaNacional: 'NTC 1771 / ANSI Z359.14',
    especificaciones: 'Cable 5mm galvanizado, freno automático, indicador de caída, capacidad 140kg',
    vidaUtilMeses: 60
  },

  // EQUIPOS Y HERRAMIENTAS
  {
    codigo: 'EQU-EXT-01',
    nombre: 'Extintor PQS 20 libras ABC',
    descripcion: 'Extintor multipropósito de polvo químico seco para fuegos clase A, B y C',
    categoria: 'equipos',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 2885',
    especificaciones: 'Agente extintor: Fosfato monoamónico, presión 195 PSI, recarga anual',
    vidaUtilMeses: 12
  },
  {
    codigo: 'EQU-BOT-01',
    nombre: 'Botiquín Portátil Tipo A',
    descripcion: 'Botiquín de primeros auxilios para 25 personas con elementos básicos',
    categoria: 'equipos',
    nivelRiesgo: 'bajo',
    normaNacional: 'Resolución 0705/2007',
    especificaciones: 'Tipo A (1-25 personas): Gasas, vendas, antisépticos, tijeras, guantes, manual primeros auxilios',
    vidaUtilMeses: 12
  },
  {
    codigo: 'EQU-CAM-01',
    nombre: 'Camilla Rígida de Rescate',
    descripcion: 'Camilla tipo canasta para evacuación y rescate en alturas o espacios confinados',
    categoria: 'equipos',
    nivelRiesgo: 'medio',
    normaNacional: 'NTC 5067',
    especificaciones: 'Material polietileno, capacidad 150kg, arneses de sujeción incluidos, flotante',
    vidaUtilMeses: 120
  },
  {
    codigo: 'EQU-SEN-01',
    nombre: 'Señalización de Seguridad Kit Básico',
    descripcion: 'Kit de señales de seguridad: prohibición, obligación, advertencia, evacuación',
    categoria: 'equipos',
    nivelRiesgo: 'bajo',
    normaNacional: 'NTC 1461',
    especificaciones: '20 señales: salida emergencia, extintor, prohibido fumar, uso EPP, etc. Fotoluminiscentes',
    vidaUtilMeses: 60
  }
];

export function getEppByCodigo(codigo: string): EppPredefinido | undefined {
  return eppsSstPredefinidos.find(epp => epp.codigo === codigo);
}

export const categoriaEppLabels = {
  cabeza: 'Protección de Cabeza',
  ojos: 'Protección Visual',
  respiratorio: 'Protección Respiratoria',
  auditivo: 'Protección Auditiva',
  manos: 'Protección de Manos',
  pies: 'Protección de Pies',
  cuerpo: 'Protección Corporal',
  alturas: 'Protección contra Caídas',
  electrico: 'Protección Eléctrica',
  equipos: 'Equipos y Señalización'
};
