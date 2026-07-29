/**
 * AUTOMATIZACIÓN MATRIZ IPERC
 * Catálogos predefinidos según normatividad colombiana:
 * - GTC-45:2012 (Guía Técnica Colombiana)
 * - Resolución 0312/2019 (Estándares Mínimos)
 * - Decreto 1072/2015 (Reglamento Único del Sector Trabajo)
 * - Resolución 2400/1979 (Estatuto de Higiene y Seguridad Industrial)
 */

// =====================================================
// ÁREAS DE TRABAJO según clasificación GTC-45
// =====================================================
export const AREAS_TRABAJO: { codigo: string; nombre: string; descripcion: string; sectoresAplicables: string[] }[] = [
  // Áreas Administrativas
  { codigo: 'ADM', nombre: 'Administración', descripcion: 'Oficinas administrativas y gestión general', sectoresAplicables: ['todos'] },
  { codigo: 'GRH', nombre: 'Gestión Humana', descripcion: 'Recursos humanos, nómina, bienestar', sectoresAplicables: ['todos'] },
  { codigo: 'FIN', nombre: 'Finanzas y Contabilidad', descripcion: 'Contabilidad, tesorería, costos', sectoresAplicables: ['todos'] },
  { codigo: 'COM', nombre: 'Comercial', descripcion: 'Ventas, mercadeo, servicio al cliente', sectoresAplicables: ['todos'] },
  { codigo: 'JUR', nombre: 'Jurídica', descripcion: 'Área legal y jurídica', sectoresAplicables: ['todos'] },
  
  // Áreas Operativas/Producción
  { codigo: 'PRD', nombre: 'Producción', descripcion: 'Manufactura y procesos productivos', sectoresAplicables: ['manufactura', 'industrial'] },
  { codigo: 'ALM', nombre: 'Almacén/Bodega', descripcion: 'Recepción, almacenamiento y despacho de materiales', sectoresAplicables: ['todos'] },
  { codigo: 'LOG', nombre: 'Logística', descripcion: 'Transporte, distribución, cadena de suministro', sectoresAplicables: ['todos'] },
  { codigo: 'MNT', nombre: 'Mantenimiento', descripcion: 'Mantenimiento de equipos e instalaciones', sectoresAplicables: ['todos'] },
  { codigo: 'CAL', nombre: 'Calidad', descripcion: 'Control de calidad y aseguramiento', sectoresAplicables: ['todos'] },
  
  // Áreas Técnicas/Especializadas
  { codigo: 'TEC', nombre: 'Tecnología/Sistemas', descripcion: 'TI, desarrollo, soporte técnico', sectoresAplicables: ['todos'] },
  { codigo: 'ING', nombre: 'Ingeniería', descripcion: 'Diseño, desarrollo de proyectos', sectoresAplicables: ['construccion', 'industrial', 'manufactura'] },
  { codigo: 'LAB', nombre: 'Laboratorio', descripcion: 'Análisis, ensayos, investigación', sectoresAplicables: ['quimico', 'farmaceutico', 'alimentos'] },
  { codigo: 'SST', nombre: 'Seguridad y Salud en el Trabajo', descripcion: 'Gestión de SST', sectoresAplicables: ['todos'] },
  { codigo: 'AMB', nombre: 'Gestión Ambiental', descripcion: 'Medio ambiente y sostenibilidad', sectoresAplicables: ['todos'] },
  
  // Áreas Construcción
  { codigo: 'OBR', nombre: 'Obra/Construcción', descripcion: 'Ejecución de obras civiles', sectoresAplicables: ['construccion'] },
  { codigo: 'EXC', nombre: 'Excavaciones', descripcion: 'Movimiento de tierra, excavaciones', sectoresAplicables: ['construccion', 'mineria'] },
  { codigo: 'ALT', nombre: 'Trabajos en Alturas', descripcion: 'Labores sobre 1.5m del nivel inferior', sectoresAplicables: ['construccion', 'industrial', 'mantenimiento'] },
  { codigo: 'CON', nombre: 'Espacios Confinados', descripcion: 'Tanques, silos, pozos, túneles', sectoresAplicables: ['industrial', 'construccion', 'petroquimico'] },
  
  // Áreas Servicios
  { codigo: 'ATE', nombre: 'Atención al Público', descripcion: 'Recepción, atención ciudadana', sectoresAplicables: ['servicios', 'comercio', 'salud'] },
  { codigo: 'ASE', nombre: 'Servicios Generales', descripcion: 'Aseo, cafetería, mensajería', sectoresAplicables: ['todos'] },
  { codigo: 'VIG', nombre: 'Vigilancia y Seguridad', descripcion: 'Seguridad física, vigilancia', sectoresAplicables: ['todos'] },
  
  // Áreas Salud
  { codigo: 'URG', nombre: 'Urgencias', descripcion: 'Atención de urgencias médicas', sectoresAplicables: ['salud'] },
  { codigo: 'HOS', nombre: 'Hospitalización', descripcion: 'Servicio de hospitalización', sectoresAplicables: ['salud'] },
  { codigo: 'QRX', nombre: 'Quirúrgica/Quirófano', descripcion: 'Salas de cirugía', sectoresAplicables: ['salud'] },
  { codigo: 'CXT', nombre: 'Consulta Externa', descripcion: 'Atención ambulatoria', sectoresAplicables: ['salud'] },
  { codigo: 'LAB-CLI', nombre: 'Laboratorio Clínico', descripcion: 'Toma de muestras, análisis clínicos', sectoresAplicables: ['salud'] },
  { codigo: 'IMG', nombre: 'Imágenes Diagnósticas', descripcion: 'Radiología, ecografía, resonancia magnética', sectoresAplicables: ['salud'] },
  { codigo: 'FAR-HOS', nombre: 'Farmacia Hospitalaria', descripcion: 'Dispensación de medicamentos hospitalarios', sectoresAplicables: ['salud'] },
  { codigo: 'UTI', nombre: 'UCI / Cuidados Intensivos', descripcion: 'Unidad de cuidados intensivos', sectoresAplicables: ['salud'] },
  { codigo: 'NEO', nombre: 'Neonatología', descripcion: 'Cuidado de recién nacidos', sectoresAplicables: ['salud'] },
  { codigo: 'PED', nombre: 'Pediatría', descripcion: 'Atención médica pediátrica', sectoresAplicables: ['salud'] },
  { codigo: 'GIN', nombre: 'Ginecología y Obstetricia', descripcion: 'Atención obstétrica y ginecológica', sectoresAplicables: ['salud'] },
  { codigo: 'CEN-MED', nombre: 'Centro Médico/IPS Ambulatoria', descripcion: 'IPS de atención ambulatoria multidisciplinaria', sectoresAplicables: ['salud'] },
  { codigo: 'SAL-OCU', nombre: 'Salud Ocupacional', descripcion: 'Exámenes médicos ocupacionales, medicina laboral', sectoresAplicables: ['salud'] },
  
  // Áreas Agroindustria
  { codigo: 'AGR', nombre: 'Campo/Agrícola', descripcion: 'Cultivos, siembra, cosecha', sectoresAplicables: ['agroindustria'] },
  { codigo: 'PEC', nombre: 'Pecuaria', descripcion: 'Ganadería, avicultura, porcicultura', sectoresAplicables: ['agroindustria'] },
  { codigo: 'BEN', nombre: 'Beneficio/Procesamiento', descripcion: 'Procesamiento de productos agrícolas', sectoresAplicables: ['agroindustria', 'alimentos'] },
  
  // =====================================================
  // SECTOR MINERO - Resolución 1886/2015 y Decreto 1886/2015
  // =====================================================
  { codigo: 'MIN-EXT', nombre: 'Extracción Minera', descripcion: 'Explotación de minas a cielo abierto y subterránea', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-PER', nombre: 'Perforación y Voladura', descripcion: 'Perforación de rocas, preparación y detonación de explosivos', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-TRA', nombre: 'Transporte Minero', descripcion: 'Transporte de material en minas, bandas transportadoras', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-BEN', nombre: 'Beneficio de Minerales', descripcion: 'Trituración, molienda, concentración y procesamiento', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-VEN', nombre: 'Ventilación Minera', descripcion: 'Sistemas de ventilación en minas subterráneas', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-SOS', nombre: 'Sostenimiento Minero', descripcion: 'Fortificación, apuntalamiento y estabilización de túneles', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-DRE', nombre: 'Drenaje Minero', descripcion: 'Bombeo y manejo de aguas en operaciones mineras', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-CAR', nombre: 'Carbón', descripcion: 'Extracción y procesamiento de carbón mineral', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-ORO', nombre: 'Oro y Metales Preciosos', descripcion: 'Extracción de oro, plata y metales preciosos', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-MAT', nombre: 'Materiales de Construcción', descripcion: 'Canteras, agregados, arena, grava', sectoresAplicables: ['mineria', 'construccion'] },
  { codigo: 'MIN-EME', nombre: 'Esmeraldas', descripcion: 'Extracción de esmeraldas y piedras preciosas', sectoresAplicables: ['mineria'] },
  { codigo: 'MIN-SAL', nombre: 'Sal', descripcion: 'Extracción y procesamiento de sal', sectoresAplicables: ['mineria'] },
  
  // =====================================================
  // SECTOR PETROLERO/HIDROCARBUROS - Decreto 1073/2015
  // =====================================================
  { codigo: 'PET-EXP', nombre: 'Exploración Petrolera', descripcion: 'Sísmica, perforación exploratoria, geología', sectoresAplicables: ['hidrocarburos'] },
  { codigo: 'PET-PRO', nombre: 'Producción Petrolera', descripcion: 'Extracción, separación, tratamiento de crudo', sectoresAplicables: ['hidrocarburos'] },
  { codigo: 'PET-REF', nombre: 'Refinación', descripcion: 'Refinación de petróleo y derivados', sectoresAplicables: ['hidrocarburos'] },
  { codigo: 'PET-TRA', nombre: 'Transporte de Hidrocarburos', descripcion: 'Oleoductos, gasoductos, carrotanques', sectoresAplicables: ['hidrocarburos'] },
  { codigo: 'PET-GAS', nombre: 'Gas Natural', descripcion: 'Extracción, tratamiento y distribución de gas', sectoresAplicables: ['hidrocarburos'] },
  { codigo: 'PET-GLP', nombre: 'GLP', descripcion: 'Almacenamiento y distribución de gas licuado', sectoresAplicables: ['hidrocarburos'] },
  { codigo: 'PET-EST', nombre: 'Estaciones de Servicio', descripcion: 'Expendio de combustibles al público', sectoresAplicables: ['hidrocarburos', 'comercio'] },
  
  // =====================================================
  // SECTOR EDUCACIÓN
  // =====================================================
  { codigo: 'EDU-DOC', nombre: 'Docencia', descripcion: 'Enseñanza en aulas, talleres y laboratorios', sectoresAplicables: ['educacion'] },
  { codigo: 'EDU-ADM', nombre: 'Administración Educativa', descripcion: 'Gestión de instituciones educativas', sectoresAplicables: ['educacion'] },
  { codigo: 'EDU-LAB', nombre: 'Laboratorios Educativos', descripcion: 'Laboratorios de química, física, biología', sectoresAplicables: ['educacion'] },
  { codigo: 'EDU-DEP', nombre: 'Deportes y Recreación', descripcion: 'Educación física, actividades deportivas', sectoresAplicables: ['educacion'] },
  { codigo: 'EDU-BIB', nombre: 'Biblioteca', descripcion: 'Servicios bibliotecarios y archivísticos', sectoresAplicables: ['educacion', 'servicios'] },
  
  // =====================================================
  // SECTOR TRANSPORTE - Res. 1565/2014 PESV
  // =====================================================
  { codigo: 'TRN-CAR', nombre: 'Transporte de Carga', descripcion: 'Transporte terrestre de mercancías', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-PAS', nombre: 'Transporte de Pasajeros', descripcion: 'Transporte público urbano e intermunicipal', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-ESP', nombre: 'Transporte Especial', descripcion: 'Transporte escolar, empresarial, turístico', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-FER', nombre: 'Ferrocarriles', descripcion: 'Transporte férreo de carga y pasajeros', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-FLU', nombre: 'Transporte Fluvial', descripcion: 'Navegación en ríos y canales', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-MAR', nombre: 'Transporte Marítimo', descripcion: 'Navegación marítima y portuaria', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-AER', nombre: 'Transporte Aéreo', descripcion: 'Aviación comercial y operaciones aeroportuarias', sectoresAplicables: ['transporte'] },
  { codigo: 'TRN-MOT', nombre: 'Motocicletas/Mensajería', descripcion: 'Mensajería y domicilios en moto', sectoresAplicables: ['transporte', 'servicios'] },
  
  // =====================================================
  // SECTOR HOTELERO/TURISMO
  // =====================================================
  { codigo: 'HOT-REC', nombre: 'Recepción Hotelera', descripcion: 'Atención de huéspedes, reservas, check-in/out', sectoresAplicables: ['turismo'] },
  { codigo: 'HOT-HAB', nombre: 'Habitaciones/Housekeeping', descripcion: 'Limpieza y arreglo de habitaciones', sectoresAplicables: ['turismo'] },
  { codigo: 'HOT-COC', nombre: 'Cocina/Gastronomía', descripcion: 'Preparación de alimentos, restaurantes', sectoresAplicables: ['turismo', 'alimentos'] },
  { codigo: 'HOT-EVE', nombre: 'Eventos y Convenciones', descripcion: 'Organización de eventos, salones', sectoresAplicables: ['turismo'] },
  { codigo: 'HOT-TUR', nombre: 'Operación Turística', descripcion: 'Guianza, tours, actividades recreativas', sectoresAplicables: ['turismo'] },
  { codigo: 'HOT-BAL', nombre: 'Balnearios/Piscinas', descripcion: 'Operación de piscinas y zonas húmedas', sectoresAplicables: ['turismo'] },
  
  // =====================================================
  // SECTOR ENERGÍA ELÉCTRICA - RETIE
  // =====================================================
  { codigo: 'ENE-GEN', nombre: 'Generación Eléctrica', descripcion: 'Centrales hidroeléctricas, térmicas, solares, eólicas', sectoresAplicables: ['energia'] },
  { codigo: 'ENE-TRA', nombre: 'Transmisión Eléctrica', descripcion: 'Líneas de alta tensión, subestaciones', sectoresAplicables: ['energia'] },
  { codigo: 'ENE-DIS', nombre: 'Distribución Eléctrica', descripcion: 'Redes de media y baja tensión', sectoresAplicables: ['energia'] },
  { codigo: 'ENE-COM', nombre: 'Comercialización Energía', descripcion: 'Gestión comercial de energía', sectoresAplicables: ['energia'] },
  { codigo: 'ENE-REN', nombre: 'Energías Renovables', descripcion: 'Solar fotovoltaica, eólica, biomasa', sectoresAplicables: ['energia'] },
  
  // =====================================================
  // SECTOR TELECOMUNICACIONES
  // =====================================================
  { codigo: 'TEL-RED', nombre: 'Redes y Telecomunicaciones', descripcion: 'Instalación y mantenimiento de redes', sectoresAplicables: ['telecomunicaciones'] },
  { codigo: 'TEL-TOR', nombre: 'Torres y Antenas', descripcion: 'Instalación y mantenimiento de torres de comunicación', sectoresAplicables: ['telecomunicaciones'] },
  { codigo: 'TEL-FIB', nombre: 'Fibra Óptica', descripcion: 'Tendido e instalación de fibra óptica', sectoresAplicables: ['telecomunicaciones'] },
  { codigo: 'TEL-CAL', nombre: 'Call Center', descripcion: 'Atención telefónica al cliente', sectoresAplicables: ['telecomunicaciones', 'servicios'] },
  
  // =====================================================
  // SECTOR COMERCIO/RETAIL
  // =====================================================
  { codigo: 'RET-VEN', nombre: 'Ventas Retail', descripcion: 'Atención en punto de venta, cajas', sectoresAplicables: ['comercio'] },
  { codigo: 'RET-BOD', nombre: 'Bodega Comercial', descripcion: 'Almacenamiento en grandes superficies', sectoresAplicables: ['comercio'] },
  { codigo: 'RET-IMP', nombre: 'Impulso/Mercaderismo', descripcion: 'Promoción de productos en punto de venta', sectoresAplicables: ['comercio'] },
  { codigo: 'RET-DOM', nombre: 'Domicilios', descripcion: 'Entrega de pedidos a domicilio', sectoresAplicables: ['comercio', 'servicios'] },
  
  // =====================================================
  // SECTOR FINANCIERO
  // =====================================================
  { codigo: 'FIN-BAN', nombre: 'Banca', descripcion: 'Servicios bancarios, cajas, atención al cliente', sectoresAplicables: ['financiero'] },
  { codigo: 'FIN-SEG', nombre: 'Seguros', descripcion: 'Comercialización de seguros, ajustadores', sectoresAplicables: ['financiero'] },
  { codigo: 'FIN-COB', nombre: 'Cobranzas', descripcion: 'Gestión de cobro y cartera', sectoresAplicables: ['financiero'] },
  { codigo: 'FIN-VAL', nombre: 'Transporte de Valores', descripcion: 'Custodia y transporte de dinero', sectoresAplicables: ['financiero', 'seguridad'] },
  
  // =====================================================
  // SECTOR FARMACÉUTICO
  // =====================================================
  { codigo: 'FAR-PRO', nombre: 'Producción Farmacéutica', descripcion: 'Manufactura de medicamentos', sectoresAplicables: ['farmaceutico'] },
  { codigo: 'FAR-CAL', nombre: 'Control Calidad Farmacéutico', descripcion: 'Análisis de calidad de medicamentos', sectoresAplicables: ['farmaceutico'] },
  { codigo: 'FAR-DIS', nombre: 'Distribución Farmacéutica', descripcion: 'Almacenamiento y distribución de medicamentos', sectoresAplicables: ['farmaceutico'] },
  { codigo: 'FAR-DRO', nombre: 'Droguerías/Farmacias', descripcion: 'Expendio de medicamentos al público', sectoresAplicables: ['farmaceutico', 'comercio'] },
  
  // =====================================================
  // SECTOR TEXTIL Y CONFECCIONES
  // =====================================================
  { codigo: 'TEX-HIL', nombre: 'Hilatura', descripcion: 'Producción de hilos y fibras', sectoresAplicables: ['textil'] },
  { codigo: 'TEX-TEJ', nombre: 'Tejeduría', descripcion: 'Producción de telas tejidas', sectoresAplicables: ['textil'] },
  { codigo: 'TEX-TIN', nombre: 'Tintorería y Acabados', descripcion: 'Teñido y acabado de textiles', sectoresAplicables: ['textil'] },
  { codigo: 'TEX-CON', nombre: 'Confección', descripcion: 'Corte y confección de prendas', sectoresAplicables: ['textil'] },
  
  // =====================================================
  // SECTOR ALIMENTOS Y BEBIDAS
  // =====================================================
  { codigo: 'ALI-CAR', nombre: 'Carnes y Frigoríficos', descripcion: 'Sacrificio, desposte, procesamiento de carnes', sectoresAplicables: ['alimentos'] },
  { codigo: 'ALI-LAC', nombre: 'Lácteos', descripcion: 'Procesamiento de leche y derivados', sectoresAplicables: ['alimentos'] },
  { codigo: 'ALI-PAN', nombre: 'Panadería y Pastelería', descripcion: 'Producción de pan y productos de pastelería', sectoresAplicables: ['alimentos'] },
  { codigo: 'ALI-BEB', nombre: 'Bebidas', descripcion: 'Producción de bebidas gaseosas, jugos, agua', sectoresAplicables: ['alimentos'] },
  { codigo: 'ALI-LIC', nombre: 'Licores', descripcion: 'Producción de bebidas alcohólicas', sectoresAplicables: ['alimentos'] },
  { codigo: 'ALI-ENL', nombre: 'Enlatados y Conservas', descripcion: 'Procesamiento y envasado de alimentos', sectoresAplicables: ['alimentos'] },
  
  // =====================================================
  // SECTOR METALMECÁNICO
  // =====================================================
  { codigo: 'MET-FUN', nombre: 'Fundición', descripcion: 'Fundición de metales ferrosos y no ferrosos', sectoresAplicables: ['metalmecanico'] },
  { codigo: 'MET-MEQ', nombre: 'Mecanizado', descripcion: 'Tornería, fresado, rectificado', sectoresAplicables: ['metalmecanico'] },
  { codigo: 'MET-SOL', nombre: 'Soldadura', descripcion: 'Procesos de soldadura y corte térmico', sectoresAplicables: ['metalmecanico', 'construccion'] },
  { codigo: 'MET-ENS', nombre: 'Ensamble Metalmecánico', descripcion: 'Ensamble de estructuras y equipos', sectoresAplicables: ['metalmecanico'] },
  { codigo: 'MET-TRA', nombre: 'Tratamientos Térmicos', descripcion: 'Temple, revenido, cementación', sectoresAplicables: ['metalmecanico'] },
  { codigo: 'MET-PIN', nombre: 'Pintura Industrial', descripcion: 'Pintura electrostática, líquida, anticorrosiva', sectoresAplicables: ['metalmecanico', 'industrial'] },
  
  // =====================================================
  // SECTOR QUÍMICO
  // =====================================================
  { codigo: 'QUI-PRO', nombre: 'Producción Química', descripcion: 'Manufactura de productos químicos', sectoresAplicables: ['quimico'] },
  { codigo: 'QUI-AGR', nombre: 'Agroquímicos', descripcion: 'Producción de fertilizantes y plaguicidas', sectoresAplicables: ['quimico', 'agroindustria'] },
  { codigo: 'QUI-COS', nombre: 'Cosméticos', descripcion: 'Producción de cosméticos y productos de aseo', sectoresAplicables: ['quimico'] },
  { codigo: 'QUI-PLA', nombre: 'Plásticos', descripcion: 'Inyección, extrusión, soplado de plásticos', sectoresAplicables: ['quimico'] },
  { codigo: 'QUI-CAU', nombre: 'Caucho', descripcion: 'Procesamiento de caucho y neumáticos', sectoresAplicables: ['quimico'] },
  
  // =====================================================
  // SECTOR CONSTRUCCIÓN (adicionales)
  // =====================================================
  { codigo: 'CNS-ELE', nombre: 'Instalaciones Eléctricas', descripcion: 'Instalaciones eléctricas en obra', sectoresAplicables: ['construccion'] },
  { codigo: 'CNS-HID', nombre: 'Instalaciones Hidráulicas', descripcion: 'Redes de agua potable y sanitarias', sectoresAplicables: ['construccion'] },
  { codigo: 'CNS-GAS', nombre: 'Instalaciones de Gas', descripcion: 'Redes de gas domiciliario e industrial', sectoresAplicables: ['construccion'] },
  { codigo: 'CNS-PIS', nombre: 'Pisos y Enchapes', descripcion: 'Instalación de pisos, cerámicos, acabados', sectoresAplicables: ['construccion'] },
  { codigo: 'CNS-CUB', nombre: 'Cubiertas y Techos', descripcion: 'Instalación de cubiertas y tejados', sectoresAplicables: ['construccion'] },
  { codigo: 'CNS-DEM', nombre: 'Demolición', descripcion: 'Demolición de estructuras', sectoresAplicables: ['construccion'] },
  
  // =====================================================
  // SECTOR PESCA Y ACUICULTURA
  // =====================================================
  { codigo: 'PES-ART', nombre: 'Pesca Artesanal', descripcion: 'Pesca tradicional en embarcaciones menores', sectoresAplicables: ['pesca'] },
  { codigo: 'PES-IND', nombre: 'Pesca Industrial', descripcion: 'Pesca en embarcaciones mayores', sectoresAplicables: ['pesca'] },
  { codigo: 'PES-ACU', nombre: 'Acuicultura', descripcion: 'Cultivo de peces, camarones, truchas', sectoresAplicables: ['pesca'] },
  { codigo: 'PES-PRO', nombre: 'Procesamiento Pesquero', descripcion: 'Procesamiento y empaque de productos del mar', sectoresAplicables: ['pesca', 'alimentos'] },
  
  // =====================================================
  // SECTOR FORESTAL Y MADERA
  // =====================================================
  { codigo: 'FOR-TAL', nombre: 'Tala y Aprovechamiento', descripcion: 'Corte y extracción de madera', sectoresAplicables: ['forestal'] },
  { codigo: 'FOR-ASE', nombre: 'Aserradero', descripcion: 'Procesamiento primario de madera', sectoresAplicables: ['forestal'] },
  { codigo: 'FOR-CAR', nombre: 'Carpintería', descripcion: 'Fabricación de muebles y productos de madera', sectoresAplicables: ['forestal'] },
  { codigo: 'FOR-REF', nombre: 'Reforestación', descripcion: 'Siembra y mantenimiento de plantaciones', sectoresAplicables: ['forestal', 'agroindustria'] },
  
  // =====================================================
  // SECTOR ENTRETENIMIENTO
  // =====================================================
  { codigo: 'ENT-ESC', nombre: 'Escenarios y Eventos', descripcion: 'Montaje de escenarios, conciertos, eventos', sectoresAplicables: ['entretenimiento'] },
  { codigo: 'ENT-CIN', nombre: 'Cine y Televisión', descripcion: 'Producción audiovisual', sectoresAplicables: ['entretenimiento'] },
  { codigo: 'ENT-PAR', nombre: 'Parques de Diversiones', descripcion: 'Operación de atracciones mecánicas', sectoresAplicables: ['entretenimiento'] },
  { codigo: 'ENT-DEP', nombre: 'Instalaciones Deportivas', descripcion: 'Operación de gimnasios, canchas, estadios', sectoresAplicables: ['entretenimiento'] },
];

// =====================================================
// PROCESOS TÍPICOS según sector económico CIIU
// =====================================================
export const PROCESOS_TRABAJO: { codigo: string; nombre: string; area: string; actividades: string[] }[] = [
  // Procesos Administrativos
  { codigo: 'PA-01', nombre: 'Gestión Administrativa', area: 'ADM', actividades: ['Archivo de documentos', 'Gestión de correspondencia', 'Reuniones', 'Uso de equipos de oficina'] },
  { codigo: 'PA-02', nombre: 'Gestión de Talento Humano', area: 'GRH', actividades: ['Selección y contratación', 'Nómina', 'Bienestar', 'Capacitación'] },
  { codigo: 'PA-03', nombre: 'Gestión Financiera', area: 'FIN', actividades: ['Procesamiento contable', 'Facturación', 'Pagos', 'Reportes financieros'] },
  { codigo: 'PA-04', nombre: 'Gestión Comercial', area: 'COM', actividades: ['Ventas', 'Atención al cliente', 'Visitas comerciales', 'Mercadeo'] },
  
  // Procesos Operativos/Producción
  { codigo: 'PO-01', nombre: 'Recepción de Materiales', area: 'ALM', actividades: ['Descargue', 'Verificación', 'Almacenamiento', 'Registro en sistema'] },
  { codigo: 'PO-02', nombre: 'Almacenamiento', area: 'ALM', actividades: ['Ubicación en estantes', 'Control de inventario', 'Picking', 'Embalaje'] },
  { codigo: 'PO-03', nombre: 'Despacho y Distribución', area: 'LOG', actividades: ['Alistamiento', 'Cargue', 'Transporte', 'Entrega'] },
  { codigo: 'PO-04', nombre: 'Manufactura/Producción', area: 'PRD', actividades: ['Operación de maquinaria', 'Ensamble', 'Empaque', 'Control de calidad'] },
  { codigo: 'PO-05', nombre: 'Mantenimiento Preventivo', area: 'MNT', actividades: ['Lubricación', 'Limpieza', 'Ajustes', 'Revisión de componentes'] },
  { codigo: 'PO-06', nombre: 'Mantenimiento Correctivo', area: 'MNT', actividades: ['Diagnóstico de fallas', 'Reparación', 'Cambio de piezas', 'Pruebas'] },
  
  // Procesos Construcción
  { codigo: 'PC-01', nombre: 'Movimiento de Tierras', area: 'EXC', actividades: ['Excavación', 'Relleno', 'Compactación', 'Nivelación'] },
  { codigo: 'PC-02', nombre: 'Estructura y Cimentación', area: 'OBR', actividades: ['Armado de hierro', 'Encofrado', 'Fundición de concreto', 'Curado'] },
  { codigo: 'PC-03', nombre: 'Trabajos en Alturas', area: 'ALT', actividades: ['Montaje de andamios', 'Trabajo en fachadas', 'Instalaciones elevadas', 'Izaje de cargas'] },
  { codigo: 'PC-04', nombre: 'Acabados', area: 'OBR', actividades: ['Mampostería', 'Pintura', 'Instalaciones eléctricas', 'Carpintería'] },
  
  // Procesos Químicos/Laboratorio
  { codigo: 'PQ-01', nombre: 'Análisis de Laboratorio', area: 'LAB', actividades: ['Toma de muestras', 'Preparación de reactivos', 'Análisis', 'Registro de resultados'] },
  { codigo: 'PQ-02', nombre: 'Manejo de Sustancias Químicas', area: 'LAB', actividades: ['Recepción', 'Almacenamiento', 'Dosificación', 'Disposición de residuos'] },
  
  // Procesos Servicios Generales
  { codigo: 'PS-01', nombre: 'Aseo y Limpieza', area: 'ASE', actividades: ['Barrido', 'Trapeado', 'Desinfección', 'Recolección de residuos'] },
  { codigo: 'PS-02', nombre: 'Servicios de Alimentación', area: 'ASE', actividades: ['Preparación de alimentos', 'Servido', 'Limpieza de cocina'] },
  { codigo: 'PS-03', nombre: 'Vigilancia', area: 'VIG', actividades: ['Rondas de seguridad', 'Control de acceso', 'Monitoreo CCTV', 'Reporte de novedades'] },
  
  // Procesos Tecnología
  { codigo: 'PT-01', nombre: 'Soporte Técnico', area: 'TEC', actividades: ['Atención de tickets', 'Mantenimiento de equipos', 'Instalación de software', 'Cableado'] },
  { codigo: 'PT-02', nombre: 'Desarrollo de Software', area: 'TEC', actividades: ['Codificación', 'Pruebas', 'Documentación', 'Despliegue'] },
  
  // Procesos Agroindustriales
  { codigo: 'AG-01', nombre: 'Siembra y Cultivo', area: 'AGR', actividades: ['Preparación de suelo', 'Siembra', 'Fumigación', 'Fertilización'] },
  { codigo: 'AG-02', nombre: 'Cosecha', area: 'AGR', actividades: ['Recolección', 'Clasificación', 'Empaque', 'Transporte a centro de acopio'] },
  { codigo: 'AG-03', nombre: 'Procesamiento Agrícola', area: 'BEN', actividades: ['Lavado', 'Selección', 'Transformación', 'Empaque final'] },
  
  // Procesos Gestión Ambiental
  { codigo: 'GA-01', nombre: 'Gestión de Residuos', area: 'AMB', actividades: ['Clasificación de residuos', 'Almacenamiento temporal', 'Entrega a gestor autorizado', 'Registro y seguimiento'] },
  { codigo: 'GA-02', nombre: 'Monitoreo Ambiental', area: 'AMB', actividades: ['Medición de emisiones', 'Muestreo de aguas', 'Control de ruido', 'Informes ambientales'] },
  { codigo: 'GA-03', nombre: 'Gestión de Vertimientos', area: 'AMB', actividades: ['Tratamiento de aguas residuales', 'Monitoreo de descargas', 'Mantenimiento de PTAR', 'Cumplimiento de permisos'] },
  { codigo: 'GA-04', nombre: 'Gestión de Emisiones', area: 'AMB', actividades: ['Control de fuentes fijas', 'Monitoreo de calidad del aire', 'Mantenimiento de filtros', 'Reportes a autoridad ambiental'] },
  
  // Procesos SST
  { codigo: 'SST-01', nombre: 'Gestión de Seguridad y Salud', area: 'SST', actividades: ['Inspecciones de seguridad', 'Investigación de accidentes', 'Capacitación SST', 'Auditorías internas'] },
  { codigo: 'SST-02', nombre: 'Vigilancia Epidemiológica', area: 'SST', actividades: ['Exámenes médicos ocupacionales', 'Seguimiento de condiciones de salud', 'Programas de prevención', 'Estadísticas de salud'] },
  { codigo: 'SST-03', nombre: 'Gestión de Emergencias', area: 'SST', actividades: ['Planificación de emergencias', 'Simulacros', 'Mantenimiento de equipos', 'Capacitación de brigadas'] },
  
  // Procesos Jurídicos
  { codigo: 'JU-01', nombre: 'Gestión Legal', area: 'JUR', actividades: ['Revisión de contratos', 'Asesoría legal', 'Gestión de litigios', 'Cumplimiento normativo'] },
  
  // Procesos Calidad
  { codigo: 'QA-01', nombre: 'Control de Calidad', area: 'CAL', actividades: ['Inspección de productos', 'Pruebas de laboratorio', 'Control estadístico', 'Gestión de no conformidades'] },
  { codigo: 'QA-02', nombre: 'Aseguramiento de Calidad', area: 'CAL', actividades: ['Auditorías de calidad', 'Gestión documental', 'Mejora continua', 'Certificaciones'] },
  
  // Procesos Ingeniería
  { codigo: 'IN-01', nombre: 'Diseño y Desarrollo', area: 'ING', actividades: ['Diseño de proyectos', 'Cálculos técnicos', 'Elaboración de planos', 'Especificaciones técnicas'] },
  { codigo: 'IN-02', nombre: 'Gestión de Proyectos', area: 'ING', actividades: ['Planificación', 'Seguimiento de obras', 'Control presupuestal', 'Gestión de contratistas'] },
  
  // Procesos Espacios Confinados
  { codigo: 'EC-01', nombre: 'Trabajo en Espacios Confinados', area: 'CON', actividades: ['Evaluación de atmósfera', 'Permisos de trabajo', 'Rescate en espacios confinados', 'Ventilación y monitoreo'] },
  
  // Procesos Atención al Público
  { codigo: 'AP-01', nombre: 'Atención al Cliente', area: 'ATE', actividades: ['Recepción de usuarios', 'Orientación e información', 'Gestión de PQRS', 'Servicio al ciudadano'] },

  // =====================================================
  // PROCESOS SECTOR SALUD
  // =====================================================
  { codigo: 'SAL-01', nombre: 'Triage y Clasificación', area: 'URG', actividades: ['Valoración inicial del paciente', 'Clasificación por prioridad', 'Registro de ingreso', 'Activación de protocolos de emergencia'] },
  { codigo: 'SAL-02', nombre: 'Atención de Urgencias', area: 'URG', actividades: ['Reanimación cardiopulmonar', 'Estabilización hemodinámica', 'Curación de heridas', 'Administración de medicamentos de emergencia'] },
  { codigo: 'SAL-03', nombre: 'Transporte Asistencial', area: 'URG', actividades: ['Movilización de pacientes en camilla', 'Transporte en ambulancia', 'Traslado intrahospitalario', 'Manejo de pacientes en estado crítico'] },
  { codigo: 'SAL-04', nombre: 'Cuidado y Asistencia al Paciente Hospitalizado', area: 'HOS', actividades: ['Administración de medicamentos', 'Toma de signos vitales', 'Curaciones y procedimientos de enfermería', 'Baño y movilización de pacientes'] },
  { codigo: 'SAL-05', nombre: 'Gestión de Residuos Hospitalarios', area: 'HOS', actividades: ['Clasificación de residuos RESPEL', 'Almacenamiento en cuarto de residuos', 'Gestión de residuos anatomopatológicos', 'Entrega a gestor autorizado'] },
  { codigo: 'SAL-06', nombre: 'Control de Infecciones', area: 'HOS', actividades: ['Limpieza y desinfección de superficies', 'Precauciones de aislamiento', 'Higiene de manos', 'Manejo de ropa hospitalaria'] },
  { codigo: 'SAL-07', nombre: 'Preparación Quirúrgica', area: 'QRX', actividades: ['Preparación del campo quirúrgico', 'Esterilización de instrumental', 'Verificación de lista de chequeo quirúrgico', 'Posicionamiento del paciente'] },
  { codigo: 'SAL-08', nombre: 'Procedimientos Quirúrgicos', area: 'QRX', actividades: ['Cirugías electivas y de urgencia', 'Anestesia general y regional', 'Control de sangrado intraoperatorio', 'Cierre de heridas'] },
  { codigo: 'SAL-09', nombre: 'Esterilización y CEYE', area: 'QRX', actividades: ['Lavado y desinfección de instrumental', 'Esterilización en autoclave', 'Empaque y almacenamiento estéril', 'Control de indicadores de esterilización'] },
  { codigo: 'SAL-10', nombre: 'Consulta Médica Ambulatoria', area: 'CXT', actividades: ['Anamnesis y valoración clínica', 'Examen físico', 'Formulación médica', 'Remisiones y autorizaciones'] },
  { codigo: 'SAL-11', nombre: 'Procedimientos Ambulatorios', area: 'CXT', actividades: ['Inyectología', 'Nebulizaciones', 'Curaciones ambulatorias', 'Toma de electrocardiograma'] },
  { codigo: 'SAL-12', nombre: 'Toma de Muestras Clínicas', area: 'LAB-CLI', actividades: ['Flebotomía y toma de muestras de sangre', 'Toma de muestras de orina y heces', 'Muestras microbiológicas', 'Transporte de muestras biológicas'] },
  { codigo: 'SAL-13', nombre: 'Análisis Clínicos', area: 'LAB-CLI', actividades: ['Análisis de hemograma', 'Análisis microbiológico', 'Pruebas de coagulación', 'Bioquímica sérica'] },
  { codigo: 'SAL-14', nombre: 'Radiología e Imágenes', area: 'IMG', actividades: ['Toma de radiografías', 'Ecografías y ecografías Doppler', 'Resonancia magnética', 'Tomografía computarizada'] },
  { codigo: 'SAL-15', nombre: 'Dispensación de Medicamentos', area: 'FAR-HOS', actividades: ['Recepción de órdenes médicas', 'Preparación de dosis unitarias', 'Entrega a enfermería', 'Control de medicamentos de control especial'] },
  { codigo: 'SAL-16', nombre: 'Atención UCI', area: 'UTI', actividades: ['Monitoreo hemodinámico continuo', 'Manejo de ventilación mecánica', 'Administración de medicamentos vasoactivos', 'Procedimientos invasivos'] },
  { codigo: 'SAL-17', nombre: 'Salud Ocupacional / Medicina Laboral', area: 'SAL-OCU', actividades: ['Exámenes médicos de ingreso', 'Exámenes periódicos ocupacionales', 'Exámenes de egreso', 'Calificación de origen de enfermedad laboral'] },

  // =====================================================
  // PROCESOS SECTOR TRANSPORTE
  // =====================================================
  { codigo: 'TRP-01', nombre: 'Conducción Urbana de Pasajeros', area: 'TRN-PAS', actividades: ['Conducción en rutas urbanas', 'Abordaje y descenso de pasajeros', 'Control de velocidad y semáforos', 'Manejo defensivo en ciudad'] },
  { codigo: 'TRP-02', nombre: 'Conducción Intermunicipal', area: 'TRN-PAS', actividades: ['Conducción en carreteras nacionales', 'Control de fatiga y descansos', 'Revisión preoperacional del vehículo', 'Manejo en condiciones adversas'] },
  { codigo: 'TRP-03', nombre: 'Cargue y Descargue', area: 'TRN-CAR', actividades: ['Cargue manual de mercancía', 'Operación de montacargas', 'Aseguramiento de carga', 'Distribución del peso en el vehículo'] },
  { codigo: 'TRP-04', nombre: 'Conducción de Carga', area: 'TRN-CAR', actividades: ['Conducción de tractocamiones', 'Conducción de camiones medianos', 'Revisión de carga en tránsito', 'Pernocte en ruta'] },
  { codigo: 'TRP-05', nombre: 'Transporte Escolar', area: 'TRN-ESP', actividades: ['Conducción de rutas escolares', 'Supervisión de niños en vehículo', 'Inspección preoperacional', 'Manejo de emergencias con menores'] },
  { codigo: 'TRP-06', nombre: 'Mensajería en Motocicleta', area: 'TRN-MOT', actividades: ['Conducción urbana en moto', 'Entrega de paquetes', 'Uso de implementos de protección', 'Control de velocidad'] },
  { codigo: 'TRP-07', nombre: 'Inspección y Mantenimiento de Flota', area: 'TRN-CAR', actividades: ['Inspección preoperacional', 'Mantenimiento preventivo', 'Control de llantas y frenos', 'Documentación vehicular'] },

  // =====================================================
  // PROCESOS SECTOR EDUCACIÓN
  // =====================================================
  { codigo: 'EDU-01', nombre: 'Docencia Presencial', area: 'EDU-DOC', actividades: ['Clases magistrales', 'Trabajo en grupos', 'Evaluaciones', 'Tutoría de estudiantes'] },
  { codigo: 'EDU-02', nombre: 'Docencia Virtual', area: 'EDU-DOC', actividades: ['Desarrollo de contenidos digitales', 'Videoconferencias', 'Gestión de plataformas LMS', 'Acompañamiento virtual'] },
  { codigo: 'EDU-03', nombre: 'Prácticas en Laboratorio Educativo', area: 'EDU-LAB', actividades: ['Experimentos de química', 'Prácticas de física', 'Biología y anatomía', 'Disposición de residuos de laboratorio'] },
  { codigo: 'EDU-04', nombre: 'Educación Física y Deportes', area: 'EDU-DEP', actividades: ['Clases de educación física', 'Entrenamientos deportivos', 'Competencias', 'Primeros auxilios deportivos'] },
  { codigo: 'EDU-05', nombre: 'Gestión Administrativa Educativa', area: 'EDU-ADM', actividades: ['Matrícula y secretaría', 'Gestión curricular', 'Coordinación académica', 'Atención de padres de familia'] },

  // =====================================================
  // PROCESOS SECTOR MINERO
  // =====================================================
  { codigo: 'MIN-01', nombre: 'Extracción a Cielo Abierto', area: 'MIN-EXT', actividades: ['Excavación con maquinaria pesada', 'Cargue de material', 'Transporte interno', 'Control de taludes'] },
  { codigo: 'MIN-02', nombre: 'Extracción Subterránea', area: 'MIN-EXT', actividades: ['Avance de túneles', 'Sostenimiento de labores', 'Ventilación subterránea', 'Drenaje de aguas'] },
  { codigo: 'MIN-03', nombre: 'Perforación y Voladura', area: 'MIN-PER', actividades: ['Perforación de rocas', 'Preparación de explosivos', 'Detonación controlada', 'Revisión post-voladura'] },
  { codigo: 'MIN-04', nombre: 'Beneficio de Minerales', area: 'MIN-BEN', actividades: ['Trituración primaria', 'Molienda', 'Concentración', 'Disposición de relaves'] },
  { codigo: 'MIN-05', nombre: 'Transporte Minero Interno', area: 'MIN-TRA', actividades: ['Operación de bandas transportadoras', 'Volquetas de mina', 'Mantenimiento de vías internas', 'Señalización minera'] },

  // =====================================================
  // PROCESOS SECTOR PETROLERO
  // =====================================================
  { codigo: 'PET-01', nombre: 'Perforación Exploratoria', area: 'PET-EXP', actividades: ['Montaje de torre de perforación', 'Perforación del pozo', 'Control de presión', 'Manejo de fluidos de perforación'] },
  { codigo: 'PET-02', nombre: 'Producción y Extracción', area: 'PET-PRO', actividades: ['Operación de cabezales de pozo', 'Separación de gas y crudo', 'Tratamiento de agua de producción', 'Monitoreo de instalaciones'] },
  { codigo: 'PET-03', nombre: 'Transporte por Oleoducto/Gasoducto', area: 'PET-TRA', actividades: ['Operación de estaciones de bombeo', 'Monitoreo de presión', 'Reparaciones en línea', 'Control de derrames'] },
  { codigo: 'PET-04', nombre: 'Operación de Estación de Servicio', area: 'PET-EST', actividades: ['Expendio de combustibles', 'Control de vapores', 'Recepción de cisterna', 'Atención al cliente'] },

  // =====================================================
  // PROCESOS SECTOR HOTELERO / TURISMO
  // =====================================================
  { codigo: 'HOT-01', nombre: 'Recepción y Reservas', area: 'HOT-REC', actividades: ['Check-in y check-out de huéspedes', 'Gestión de reservas', 'Manejo de efectivo y medios de pago', 'Atención de quejas'] },
  { codigo: 'HOT-02', nombre: 'Housekeeping y Limpieza', area: 'HOT-HAB', actividades: ['Tendido de camas', 'Limpieza de baños con productos químicos', 'Lavandería', 'Transporte de carros de lencería'] },
  { codigo: 'HOT-03', nombre: 'Cocina y Gastronomía', area: 'HOT-COC', actividades: ['Preparación de alimentos', 'Operación de equipos de cocina industrial', 'Control de temperaturas', 'Manipulación de alimentos'] },
  { codigo: 'HOT-04', nombre: 'Organización de Eventos', area: 'HOT-EVE', actividades: ['Montaje de salones', 'Coordinación de eventos', 'Servicio de banquetes', 'Operación audiovisual'] },

  // =====================================================
  // PROCESOS SECTOR ENERGÍA ELÉCTRICA
  // =====================================================
  { codigo: 'ENE-01', nombre: 'Trabajos Eléctricos en Alta Tensión', area: 'ENE-TRA', actividades: ['Maniobras en subestaciones', 'Mantenimiento de líneas energizadas', 'Puesta a tierra', 'Pruebas de equipos'] },
  { codigo: 'ENE-02', nombre: 'Instalaciones Eléctricas Domiciliarias', area: 'ENE-DIS', actividades: ['Instalación de medidores', 'Reparación de redes de distribución', 'Poda de árboles en redes', 'Reconexiones'] },
  { codigo: 'ENE-03', nombre: 'Operación de Central Eléctrica', area: 'ENE-GEN', actividades: ['Operación de turbinas', 'Control de presas y compuertas', 'Mantenimiento de generadores', 'Monitoreo de parámetros eléctricos'] },
  { codigo: 'ENE-04', nombre: 'Instalación Solar/Eólica', area: 'ENE-REN', actividades: ['Montaje de paneles solares', 'Instalación de aerogeneradores', 'Conexión a red', 'Mantenimiento de equipos renovables'] },

  // =====================================================
  // PROCESOS SECTOR TELECOMUNICACIONES
  // =====================================================
  { codigo: 'TEL-01', nombre: 'Instalación de Antenas y Torres', area: 'TEL-TOR', actividades: ['Montaje en alturas de torres', 'Instalación de antenas', 'Cableado estructurado', 'Pruebas de señal'] },
  { codigo: 'TEL-02', nombre: 'Tendido de Fibra Óptica', area: 'TEL-FIB', actividades: ['Excavación y ductos', 'Tendido de cable', 'Fusión de fibra', 'Pruebas de continuidad'] },
  { codigo: 'TEL-03', nombre: 'Atención en Call Center', area: 'TEL-CAL', actividades: ['Atención telefónica', 'Uso de headsets y computadores', 'Gestión de información sensible', 'Pausas activas'] },

  // =====================================================
  // PROCESOS SECTOR COMERCIO / RETAIL
  // =====================================================
  { codigo: 'COM-01', nombre: 'Ventas en Punto de Venta', area: 'RET-VEN', actividades: ['Atención al cliente', 'Operación de caja registradora', 'Manejo de inventario en piso', 'Exhibición de mercancía'] },
  { codigo: 'COM-02', nombre: 'Bodega y Almacenamiento Comercial', area: 'RET-BOD', actividades: ['Recepción de proveedores', 'Ubicación con montacargas', 'Inventarios físicos', 'Despacho de pedidos'] },
  { codigo: 'COM-03', nombre: 'Domicilios y Mensajería', area: 'RET-DOM', actividades: ['Alistamiento de pedidos', 'Entrega en moto o vehículo', 'Manejo de dinero en efectivo', 'Gestión de novedades'] },

  // =====================================================
  // PROCESOS SECTOR FINANCIERO
  // =====================================================
  { codigo: 'FIN-01', nombre: 'Servicios Bancarios y Cajero', area: 'FIN-BAN', actividades: ['Manejo de efectivo en caja', 'Atención de clientes', 'Operaciones financieras', 'Control de bóvedas'] },
  { codigo: 'FIN-02', nombre: 'Transporte de Valores', area: 'FIN-VAL', actividades: ['Cargue y descargue de ATMs', 'Transporte blindado', 'Custodia de valores', 'Coordinación con centros de efectivo'] },

  // =====================================================
  // PROCESOS SECTOR FARMACÉUTICO
  // =====================================================
  { codigo: 'FAR-01', nombre: 'Manufactura de Medicamentos', area: 'FAR-PRO', actividades: ['Pesaje de materias primas', 'Mezcla y granulación', 'Tableteado y capsulado', 'Empaque estéril'] },
  { codigo: 'FAR-02', nombre: 'Control Analítico', area: 'FAR-CAL', actividades: ['Muestreo de producto terminado', 'Análisis fisicoquímico', 'Análisis microbiológico', 'Liberación de lotes'] },
  { codigo: 'FAR-03', nombre: 'Dispensación en Droguería', area: 'FAR-DRO', actividades: ['Venta de medicamentos con y sin fórmula', 'Asesoría farmacéutica', 'Control de cadena de frío', 'Manejo de RESPEL farmacéuticos'] },

  // =====================================================
  // PROCESOS SECTOR METALMECÁNICO
  // =====================================================
  { codigo: 'MEC-01', nombre: 'Soldadura y Corte Térmico', area: 'MET-SOL', actividades: ['Soldadura SMAW/MIG/TIG', 'Corte con oxicorte o plasma', 'Esmerilado', 'Inspección de soldadura'] },
  { codigo: 'MEC-02', nombre: 'Mecanizado en Taller', area: 'MET-MEQ', actividades: ['Operación de tornos', 'Fresado y taladrado', 'Rectificado', 'Medición y control dimensional'] },
  { codigo: 'MEC-03', nombre: 'Fundición de Metales', area: 'MET-FUN', actividades: ['Operación de hornos de fundición', 'Colada y moldeo', 'Desmoldeo', 'Acabado de piezas fundidas'] },
  { codigo: 'MEC-04', nombre: 'Pintura Industrial', area: 'MET-PIN', actividades: ['Preparación de superficies (sandblasting)', 'Aplicación de primarios y esmaltes', 'Pintura en cabina', 'Control de espesores de película'] },

  // =====================================================
  // PROCESOS SECTOR ALIMENTOS Y BEBIDAS
  // =====================================================
  { codigo: 'ALI-01', nombre: 'Procesamiento de Carnes', area: 'ALI-CAR', actividades: ['Desposte manual', 'Operación de sierra eléctrica', 'Empaque al vacío', 'Control de temperatura en cuartos fríos'] },
  { codigo: 'ALI-02', nombre: 'Producción de Lácteos', area: 'ALI-LAC', actividades: ['Recepción y pasteurización', 'Elaboración de quesos y yogures', 'CIP (limpieza en sitio)', 'Envasado aséptico'] },
  { codigo: 'ALI-03', nombre: 'Producción de Panadería', area: 'ALI-PAN', actividades: ['Amasado y fermentación', 'Horneado', 'Decoración y empaque', 'Operación de hornos industriales'] },
  { codigo: 'ALI-04', nombre: 'Embotellado y Envasado', area: 'ALI-BEB', actividades: ['Lavado y esterilización de envases', 'Llenado y tapado', 'Etiquetado', 'Paletizado'] },

  // =====================================================
  // PROCESOS SECTOR QUÍMICO
  // =====================================================
  { codigo: 'QUI-01', nombre: 'Producción Química Industrial', area: 'QUI-PRO', actividades: ['Operación de reactores', 'Control de temperatura y presión', 'Manejo de sustancias peligrosas', 'Limpieza de equipos'] },
  { codigo: 'QUI-02', nombre: 'Aplicación de Agroquímicos', area: 'QUI-AGR', actividades: ['Preparación de mezclas de plaguicidas', 'Aplicación aérea o terrestre', 'Manejo de equipos de aspersión', 'Disposición de envases'] },

  // =====================================================
  // PROCESOS SECTOR AGROINDUSTRIAL
  // =====================================================
  { codigo: 'AGR-01', nombre: 'Ganadería y Pecuario', area: 'PEC', actividades: ['Manejo de bovinos', 'Ordeño mecánico y manual', 'Vacunación y medicina veterinaria', 'Transporte de animales'] },

  // =====================================================
  // PROCESOS CONSTRUCCIÓN ESPECIALIZADA
  // =====================================================
  { codigo: 'CSP-01', nombre: 'Instalaciones Eléctricas en Obra', area: 'CNS-ELE', actividades: ['Canalización y entubado', 'Tendido de conductores', 'Instalación de tableros', 'Pruebas eléctricas'] },
  { codigo: 'CSP-02', nombre: 'Instalaciones Hidrosanitarias', area: 'CNS-HID', actividades: ['Tubería de suministro', 'Red sanitaria y pluvial', 'Instalación de aparatos sanitarios', 'Pruebas hidrostáticas'] },
  { codigo: 'CSP-03', nombre: 'Demolición', area: 'CNS-DEM', actividades: ['Demolición manual', 'Demolición con maquinaria', 'Apilado y retiro de escombros', 'Control de polvo y vibraciones'] },

  // =====================================================
  // PROCESOS SECTOR PESCA
  // =====================================================
  { codigo: 'PES-01', nombre: 'Faena de Pesca', area: 'PES-ART', actividades: ['Navegación en embarcación', 'Lanzado y halado de redes', 'Clasificación de captura', 'Conservación con hielo'] },
  { codigo: 'PES-02', nombre: 'Procesamiento de Pescado', area: 'PES-PRO', actividades: ['Eviscerado y fileteado', 'Empaque y etiquetado', 'Refrigeración y congelación', 'Control de calidad sanitaria'] },

  // =====================================================
  // PROCESOS SECTOR FORESTAL
  // =====================================================
  { codigo: 'FOR-01', nombre: 'Tala y Aprovechamiento Forestal', area: 'FOR-TAL', actividades: ['Operación de motosierras', 'Tala dirigida', 'Desramado', 'Extracción con maquinaria'] },
  { codigo: 'FOR-02', nombre: 'Carpintería y Ebanistería', area: 'FOR-CAR', actividades: ['Operación de sierras circulares', 'Cepillado y lijado', 'Ensamble de muebles', 'Aplicación de lacas y barnices'] },
];

// =====================================================
// CARGOS RESPONSABLES según Res. 0312/2019
// =====================================================
export const CARGOS_RESPONSABLES_SST: { cargo: string; descripcion: string; requisitos: string[]; normativa: string }[] = [
  {
    cargo: 'Responsable del SG-SST',
    descripcion: 'Persona designada para coordinar el Sistema de Gestión de SST',
    requisitos: [
      'Curso de 50 horas en SST (Res. 4927/2016)',
      'Designación por la alta dirección',
      'Conocimiento del SG-SST'
    ],
    normativa: 'Decreto 1072/2015 Art. 2.2.4.6.8'
  },
  {
    cargo: 'Licenciado en Salud Ocupacional',
    descripcion: 'Profesional con licencia vigente en SST',
    requisitos: [
      'Título profesional o tecnólogo en SST',
      'Licencia vigente expedida por Secretaría de Salud',
      'Curso de 50 horas en SST'
    ],
    normativa: 'Resolución 4502/2012'
  },
  {
    cargo: 'Coordinador SST',
    descripcion: 'Coordinador del Sistema de Gestión de SST',
    requisitos: [
      'Formación técnica, tecnológica o profesional en SST',
      'Experiencia en implementación de SG-SST',
      'Curso de 50 horas en SST'
    ],
    normativa: 'Resolución 0312/2019'
  },
  {
    cargo: 'Profesional SST',
    descripcion: 'Profesional especializado en SST',
    requisitos: [
      'Título profesional en carreras afines',
      'Especialización en SST o afines',
      'Licencia en SST vigente'
    ],
    normativa: 'Resolución 0312/2019 Estándar 1.1.1'
  },
  {
    cargo: 'Vigía SST',
    descripcion: 'Vigía de seguridad para empresas menores a 10 trabajadores',
    requisitos: [
      'Capacitación de 20 horas en SST',
      'Designación por el empleador',
      'Registro en acta'
    ],
    normativa: 'Resolución 0312/2019 Art. 5'
  },
  {
    cargo: 'Presidente COPASST',
    descripcion: 'Presidente del Comité Paritario de SST',
    requisitos: [
      'Representante del empleador',
      'Capacitación de 20 horas en SST',
      'Elección por el comité'
    ],
    normativa: 'Resolución 2013/1986'
  },
  {
    cargo: 'Gerente General',
    descripcion: 'Representante legal con responsabilidad en SST',
    requisitos: [
      'Representante legal de la empresa',
      'Responsabilidad patronal en SST',
      'Puede delegar funciones operativas'
    ],
    normativa: 'Decreto 1072/2015 Art. 2.2.4.6.8'
  },
  {
    cargo: 'Jefe de Área',
    descripcion: 'Líder de área con responsabilidades SST',
    requisitos: [
      'Conocimiento del área a cargo',
      'Capacitación en identificación de peligros',
      'Autoridad para implementar controles'
    ],
    normativa: 'Decreto 1072/2015'
  },
  {
    cargo: 'Supervisor de Producción',
    descripcion: 'Supervisor con responsabilidades de seguridad en el área productiva',
    requisitos: [
      'Conocimiento de procesos productivos',
      'Capacitación en SST del área',
      'Autoridad sobre el personal a cargo'
    ],
    normativa: 'Decreto 1072/2015'
  },
];

// =====================================================
// ALCANCES PREDEFINIDOS según metodología GTC-45
// =====================================================
export const ALCANCES_IPERC: { codigo: string; descripcion: string; aplicaA: string }[] = [
  // ---- GENERALES ----
  { codigo: 'ALC-01', aplicaA: 'General - Toda la organización', descripcion: 'Aplica a todos los procesos, actividades rutinarias y no rutinarias, áreas de trabajo y trabajadores (directos, contratistas, visitantes) de la empresa.' },
  { codigo: 'ALC-02', aplicaA: 'Área de Producción / Manufactura', descripcion: 'Aplica a todas las actividades y procesos del área de producción, incluyendo operación de maquinaria, manejo de materiales y control de calidad.' },
  { codigo: 'ALC-03', aplicaA: 'Áreas Administrativas y de Oficina', descripcion: 'Aplica a todas las actividades administrativas, incluyendo trabajo en oficinas, uso de equipos de cómputo, gestión documental y atención a usuarios.' },
  { codigo: 'ALC-04', aplicaA: 'Almacén, Bodega y Logística', descripcion: 'Aplica a todas las actividades de almacenamiento, recepción, despacho, manejo de materiales y operación de equipos de carga (montacargas, estibadores).' },
  { codigo: 'ALC-05', aplicaA: 'Mantenimiento de Equipos e Instalaciones', descripcion: 'Aplica a todas las actividades de mantenimiento preventivo, predictivo y correctivo de equipos, maquinaria, instalaciones eléctricas, hidráulicas y civiles.' },
  { codigo: 'ALC-06', aplicaA: 'Construcción, Obras Civiles y Trabajos en Campo', descripcion: 'Aplica a todas las actividades de construcción de obras civiles, trabajos en alturas, espacios confinados, excavaciones y operación de maquinaria pesada.' },
  { codigo: 'ALC-07', aplicaA: 'Laboratorio (Clínico, Químico o de Control de Calidad)', descripcion: 'Aplica a todas las actividades de laboratorio, incluyendo toma de muestras, manejo de sustancias químicas y biológicas, reactivos y residuos peligrosos.' },
  { codigo: 'ALC-08', aplicaA: 'Transporte y Distribución de Mercancías', descripcion: 'Aplica a las actividades de transporte terrestre de carga, conducción de vehículos de carga, cargue y descargue, y distribución en ruta.' },
  { codigo: 'ALC-09', aplicaA: 'Atención al Cliente y Servicio Comercial', descripcion: 'Aplica a todas las actividades de atención al público, servicio al cliente, gestión comercial y ventas en punto de venta.' },
  { codigo: 'ALC-10', aplicaA: 'Proyecto Específico', descripcion: 'Aplica a las actividades del proyecto específico durante su fase de planeación, ejecución y cierre.' },

  // ---- SECTOR SALUD ----
  { codigo: 'ALC-11', aplicaA: 'Urgencias y Emergencias Médicas', descripcion: 'Aplica a todas las actividades del servicio de urgencias, incluyendo triage, atención de pacientes en estado crítico, procedimientos de reanimación y transporte asistencial.' },
  { codigo: 'ALC-12', aplicaA: 'Hospitalización y Cuidado de Pacientes', descripcion: 'Aplica a todas las actividades de atención a pacientes hospitalizados, incluyendo enfermería, administración de medicamentos, procedimientos invasivos y gestión de residuos hospitalarios.' },
  { codigo: 'ALC-13', aplicaA: 'Cirugía y Procedimientos Quirúrgicos', descripcion: 'Aplica a todas las actividades en salas de cirugía, incluyendo preparación quirúrgica, procedimientos anestésicos, manejo de instrumental estéril y recuperación postoperatoria.' },
  { codigo: 'ALC-14', aplicaA: 'Consulta Externa y Atención Ambulatoria', descripcion: 'Aplica a las actividades de consulta médica ambulatoria, procedimientos ambulatorios, inyectología, terapias y atención en IPS de primer y segundo nivel.' },
  { codigo: 'ALC-15', aplicaA: 'Laboratorio Clínico y Banco de Sangre', descripcion: 'Aplica a las actividades de toma de muestras biológicas, análisis clínicos, manejo de muestras infecciosas, reactivos y disposición de residuos biológicos peligrosos.' },
  { codigo: 'ALC-16', aplicaA: 'Imágenes Diagnósticas y Radioterapia', descripcion: 'Aplica a las actividades de radiología convencional, ecografía, tomografía, resonancia magnética y radioterapia, con especial énfasis en exposición a radiaciones ionizantes y no ionizantes.' },
  { codigo: 'ALC-17', aplicaA: 'UCI / Cuidados Intensivos e Intermedios', descripcion: 'Aplica a las actividades en unidades de cuidados intensivos, incluyendo monitoreo hemodinámico, ventilación mecánica, procedimientos invasivos y prevención de infecciones asociadas a la atención en salud (IAAS).' },
  { codigo: 'ALC-18', aplicaA: 'IPS Ambulatoria y Centro Médico Multidisciplinario', descripcion: 'Aplica a todas las actividades de una IPS de atención ambulatoria que presta servicios de múltiples especialidades, incluyendo personal médico, de enfermería y administrativo.' },
  { codigo: 'ALC-19', aplicaA: 'Salud Ocupacional y Medicina Laboral', descripcion: 'Aplica a las actividades de realización de exámenes médicos ocupacionales, valoraciones de ingreso, periódicas y de egreso, y calificación de origen de enfermedades y accidentes laborales.' },

  // ---- SECTOR TRANSPORTE ----
  { codigo: 'ALC-20', aplicaA: 'Transporte de Pasajeros (Urbano e Intermunicipal)', descripcion: 'Aplica a las actividades de transporte público de pasajeros, conducción en rutas urbanas e intermunicipales, abordaje y descenso de pasajeros, y cumplimiento del PESV según Resolución 40595/2022.' },
  { codigo: 'ALC-21', aplicaA: 'Transporte de Carga Terrestre', descripcion: 'Aplica a las actividades de transporte terrestre de carga, conducción de vehículos de carga pesada, cargue y descargue de mercancías, y manejo de documentos de transporte.' },
  { codigo: 'ALC-22', aplicaA: 'Transporte Especial (Escolar, Empresarial, Turístico)', descripcion: 'Aplica a las actividades de transporte especial, incluyendo rutas escolares, transporte empresarial, turístico y de pasajeros en condición de discapacidad.' },
  { codigo: 'ALC-23', aplicaA: 'Mensajería y Domicilios en Motocicleta', descripcion: 'Aplica a las actividades de mensajería urbana y entrega de domicilios en motocicleta, incluyendo conducción, manejo de paquetes, uso de implementos de protección y gestión de incidentes viales.' },

  // ---- SECTOR MINERO ----
  { codigo: 'ALC-24', aplicaA: 'Minería a Cielo Abierto', descripcion: 'Aplica a todas las actividades de extracción minera a cielo abierto, incluyendo perforación, voladura, cargue y transporte de mineral, operación de maquinaria pesada y control geotécnico.' },
  { codigo: 'ALC-25', aplicaA: 'Minería Subterránea', descripcion: 'Aplica a todas las actividades de minería subterránea, incluyendo avance de frentes, sostenimiento de labores, ventilación, drenaje, transporte minero y prevención de explosiones e inundaciones.' },

  // ---- SECTOR PETROLERO / HIDROCARBUROS ----
  { codigo: 'ALC-26', aplicaA: 'Exploración y Producción de Hidrocarburos (E&P)', descripcion: 'Aplica a las actividades de exploración sísmica, perforación de pozos, producción y tratamiento de crudo y gas, gestión de residuos de producción y atención de emergencias en pozos.' },
  { codigo: 'ALC-27', aplicaA: 'Transporte y Distribución de Combustibles', descripcion: 'Aplica a las actividades de transporte de combustibles por oleoducto, gasoducto o carrotanque, operación de estaciones de servicio y plantas de almacenamiento, y prevención de derrames.' },

  // ---- SECTOR EDUCACIÓN ----
  { codigo: 'ALC-28', aplicaA: 'Instituciones Educativas (Colegios y Universidades)', descripcion: 'Aplica a todas las actividades educativas presenciales y virtuales, incluyendo docencia, prácticas en laboratorio, educación física, gestión administrativa y mantenimiento de instalaciones.' },

  // ---- SECTOR AGROPECUARIO ----
  { codigo: 'ALC-29', aplicaA: 'Actividades Agropecuarias y Agroindustriales', descripcion: 'Aplica a las actividades de cultivo, cosecha, ganadería, avicultura, porcicultura, y procesamiento de productos agropecuarios, incluyendo manejo de maquinaria agrícola y agroquímicos.' },

  // ---- SECTOR ENERGÍA ----
  { codigo: 'ALC-30', aplicaA: 'Generación, Transmisión y Distribución de Energía Eléctrica', descripcion: 'Aplica a las actividades en centrales eléctricas, líneas de transmisión de alta tensión, subestaciones y redes de distribución, con especial énfasis en riesgo eléctrico y trabajo en alturas.' },
  { codigo: 'ALC-31', aplicaA: 'Instalación y Mantenimiento de Energías Renovables', descripcion: 'Aplica a las actividades de instalación y mantenimiento de sistemas fotovoltaicos solares, aerogeneradores eólicos y otras fuentes de energía renovable.' },

  // ---- SECTOR TELECOMUNICACIONES ----
  { codigo: 'ALC-32', aplicaA: 'Telecomunicaciones y Redes (Torres, Fibra Óptica)', descripcion: 'Aplica a las actividades de instalación y mantenimiento de infraestructura de telecomunicaciones, incluyendo trabajo en torres de comunicación, tendido de fibra óptica y operación de call centers.' },

  // ---- SECTOR METALMECÁNICO / INDUSTRIAL ----
  { codigo: 'ALC-33', aplicaA: 'Industria Metalmecánica y Manufactura Pesada', descripcion: 'Aplica a las actividades de soldadura, mecanizado, fundición, tratamientos térmicos y pintura industrial, incluyendo el manejo de maquinaria de alto riesgo, sustancias químicas y exposición a ruido y temperaturas extremas.' },

  // ---- SECTOR ALIMENTOS ----
  { codigo: 'ALC-34', aplicaA: 'Industria de Alimentos y Bebidas', descripcion: 'Aplica a las actividades de procesamiento de alimentos y bebidas, incluyendo operación de equipos industriales, manipulación de alimentos, control de temperaturas, CIP y gestión de residuos orgánicos.' },

  // ---- TRABAJOS DE ALTO RIESGO ----
  { codigo: 'ALC-35', aplicaA: 'Trabajos de Alto Riesgo (Alturas, Espacios Confinados, Caliente)', descripcion: 'Aplica específicamente a las actividades clasificadas como trabajos de alto riesgo: trabajo en alturas (Res. 4272/2021), espacios confinados, trabajos en caliente, bloqueo/etiquetado (LOTO) y manejo de explosivos.' },

  // ---- SECTOR PÚBLICO ----
  { codigo: 'ALC-36', aplicaA: 'Entidades Públicas y Servicios del Estado', descripcion: 'Aplica a todas las actividades de entidades del Estado colombiano, incluyendo atención al ciudadano, trabajo de campo de inspectores y funcionarios, mantenimiento de infraestructura pública y gestión documental.' },

  // ---- SECTOR HOTELERO / TURISMO ----
  { codigo: 'ALC-37', aplicaA: 'Hotelería, Restaurantes y Turismo', descripcion: 'Aplica a las actividades de recepción hotelera, housekeeping, cocina y gastronomía, organización de eventos y guianza turística, incluyendo riesgos ergonómicos, químicos (productos de limpieza) y de seguridad pública.' },

  // ---- SECTOR FARMACÉUTICO ----
  { codigo: 'ALC-38', aplicaA: 'Industria Farmacéutica y Droguerías', descripcion: 'Aplica a las actividades de manufactura de medicamentos, control analítico, almacenamiento en condiciones controladas y dispensación de medicamentos al público, incluyendo el manejo de sustancias de control especial.' },

  // ---- SECTOR VIGILANCIA PRIVADA ----
  { codigo: 'ALC-39', aplicaA: 'Vigilancia y Seguridad Privada', descripcion: 'Aplica a las actividades de vigilancia fija y móvil, escoltas, transporte de valores y operación de salas de monitoreo CCTV, incluyendo los riesgos asociados al porte de armas y la interacción con el público.' },

  // ---- SECTOR FINANCIERO ----
  { codigo: 'ALC-40', aplicaA: 'Sector Financiero, Bancario y de Seguros', descripcion: 'Aplica a las actividades de servicios financieros, manejo de efectivo en caja, transporte de valores, cobranzas externas, asesoría comercial y trabajo en contact centers de entidades financieras.' },
];

// =====================================================
// SECTORES ECONÓMICOS CIIU Colombia
// =====================================================
export const SECTORES_ECONOMICOS: { codigo: string; nombre: string; clasesRiesgo: number[]; actividadesTipicas: string[] }[] = [
  {
    codigo: 'SEC-01',
    nombre: 'Agricultura, ganadería, caza y silvicultura',
    clasesRiesgo: [3, 4, 5],
    actividadesTipicas: ['Cultivos', 'Ganadería', 'Silvicultura', 'Actividades de apoyo']
  },
  {
    codigo: 'SEC-02',
    nombre: 'Industria manufacturera',
    clasesRiesgo: [2, 3, 4, 5],
    actividadesTipicas: ['Fabricación de productos', 'Procesamiento', 'Ensamble', 'Empaque']
  },
  {
    codigo: 'SEC-03',
    nombre: 'Construcción',
    clasesRiesgo: [4, 5],
    actividadesTipicas: ['Obras civiles', 'Edificaciones', 'Instalaciones', 'Acabados']
  },
  {
    codigo: 'SEC-04',
    nombre: 'Comercio y servicios',
    clasesRiesgo: [1, 2],
    actividadesTipicas: ['Comercio al por mayor', 'Comercio al por menor', 'Servicios varios']
  },
  {
    codigo: 'SEC-05',
    nombre: 'Transporte y almacenamiento',
    clasesRiesgo: [3, 4, 5],
    actividadesTipicas: ['Transporte terrestre', 'Almacenamiento', 'Logística', 'Mensajería']
  },
  {
    codigo: 'SEC-06',
    nombre: 'Actividades financieras y de seguros',
    clasesRiesgo: [1],
    actividadesTipicas: ['Servicios financieros', 'Seguros', 'Intermediación']
  },
  {
    codigo: 'SEC-07',
    nombre: 'Servicios de salud',
    clasesRiesgo: [2, 3, 4],
    actividadesTipicas: ['Atención médica', 'Hospitalización', 'Laboratorio clínico', 'Urgencias']
  },
  {
    codigo: 'SEC-08',
    nombre: 'Minería e hidrocarburos',
    clasesRiesgo: [5],
    actividadesTipicas: ['Extracción', 'Procesamiento', 'Perforación', 'Transporte de hidrocarburos']
  },
  {
    codigo: 'SEC-09',
    nombre: 'Educación',
    clasesRiesgo: [1, 2],
    actividadesTipicas: ['Enseñanza', 'Investigación', 'Servicios educativos']
  },
  {
    codigo: 'SEC-10',
    nombre: 'Tecnología e información',
    clasesRiesgo: [1],
    actividadesTipicas: ['Desarrollo de software', 'Soporte técnico', 'Consultoría TI']
  },
];

// =====================================================
// METODOLOGÍAS DE EVALUACIÓN reconocidas
// =====================================================
export const METODOLOGIAS_EVALUACION: { codigo: string; nombre: string; descripcion: string; normativaBase: string }[] = [
  {
    codigo: 'GTC-45',
    nombre: 'GTC-45:2012',
    descripcion: 'Guía Técnica Colombiana para identificación de peligros y valoración de riesgos en SST',
    normativaBase: 'GTC-45:2012 ICONTEC'
  },
  {
    codigo: 'FINE',
    nombre: 'Método Fine',
    descripcion: 'Método de evaluación matemática de riesgos (Consecuencia x Exposición x Probabilidad)',
    normativaBase: 'William T. Fine'
  },
  {
    codigo: 'BINARIO',
    nombre: 'Método Binario',
    descripcion: 'Evaluación simplificada de probabilidad x consecuencia',
    normativaBase: 'Estándar internacional'
  },
  {
    codigo: 'HAZOP',
    nombre: 'HAZOP',
    descripcion: 'Estudio de peligros y operabilidad para procesos industriales',
    normativaBase: 'IEC 61882'
  },
  {
    codigo: 'WHAT-IF',
    nombre: 'What If',
    descripcion: 'Análisis de escenarios "¿Qué pasaría si...?"',
    normativaBase: 'Metodología de análisis de riesgos'
  },
];

// =====================================================
// ESTADOS DE LA MATRIZ según ciclo PHVA
// =====================================================
export const ESTADOS_MATRIZ: { valor: string; etiqueta: string; descripcion: string; color: string; iconoEstado: string }[] = [
  {
    valor: 'borrador',
    etiqueta: 'Borrador',
    descripcion: 'Matriz en elaboración inicial',
    color: 'gray',
    iconoEstado: 'draft'
  },
  {
    valor: 'revision',
    etiqueta: 'En Revisión',
    descripcion: 'En proceso de revisión técnica o por COPASST',
    color: 'blue',
    iconoEstado: 'review'
  },
  {
    valor: 'aprobada',
    etiqueta: 'Aprobada',
    descripcion: 'Aprobada por el responsable de SST o alta dirección',
    color: 'green',
    iconoEstado: 'approved'
  },
  {
    valor: 'vigente',
    etiqueta: 'Vigente',
    descripcion: 'Matriz activa y en uso',
    color: 'emerald',
    iconoEstado: 'active'
  },
  {
    valor: 'obsoleta',
    etiqueta: 'Obsoleta',
    descripcion: 'Matriz reemplazada por una versión más reciente',
    color: 'red',
    iconoEstado: 'obsolete'
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Genera código automático para matriz IPERC
 * Formato: IPERC-[ÁREA]-[AÑO]-[CONSECUTIVO]
 */
export function generarCodigoMatriz(area: string, consecutivo: number): string {
  const areaCode = AREAS_TRABAJO.find(a => a.nombre === area)?.codigo || 'GEN';
  const year = new Date().getFullYear();
  const seq = consecutivo.toString().padStart(3, '0');
  return `IPERC-${areaCode}-${year}-${seq}`;
}

/**
 * Genera nombre sugerido para la matriz
 */
export function generarNombreMatriz(area: string, proceso?: string): string {
  const year = new Date().getFullYear();
  if (proceso) {
    return `Matriz IPERC ${year} - ${area} - ${proceso}`;
  }
  return `Matriz IPERC ${year} - ${area}`;
}

/**
 * Obtiene procesos por área
 */
export function getProcesosPorArea(areaCodigo: string): typeof PROCESOS_TRABAJO {
  return PROCESOS_TRABAJO.filter(p => p.area === areaCodigo);
}

/**
 * Obtiene áreas por sector económico
 */
export function getAreasPorSector(sector: string): typeof AREAS_TRABAJO {
  return AREAS_TRABAJO.filter(a => 
    a.sectoresAplicables.includes('todos') || 
    a.sectoresAplicables.includes(sector.toLowerCase())
  );
}
