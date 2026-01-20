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
  { codigo: 'CON', nombre: 'Consulta Externa', descripcion: 'Atención ambulatoria', sectoresAplicables: ['salud'] },
  
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
  {
    codigo: 'ALC-01',
    descripcion: 'Aplica a todos los procesos, actividades rutinarias y no rutinarias, áreas de trabajo y trabajadores (directos, contratistas, visitantes) de la empresa.',
    aplicaA: 'General - Toda la organización'
  },
  {
    codigo: 'ALC-02',
    descripcion: 'Aplica a todas las actividades y procesos del área de producción, incluyendo operación de maquinaria, manejo de materiales y control de calidad.',
    aplicaA: 'Área de Producción'
  },
  {
    codigo: 'ALC-03',
    descripcion: 'Aplica a todas las actividades administrativas, incluyendo trabajo en oficinas, uso de equipos de cómputo y gestión documental.',
    aplicaA: 'Áreas Administrativas'
  },
  {
    codigo: 'ALC-04',
    descripcion: 'Aplica a todas las actividades de almacenamiento, recepción, despacho y manejo de materiales en bodega.',
    aplicaA: 'Almacén y Logística'
  },
  {
    codigo: 'ALC-05',
    descripcion: 'Aplica a todas las actividades de mantenimiento preventivo y correctivo de equipos, maquinaria e instalaciones.',
    aplicaA: 'Mantenimiento'
  },
  {
    codigo: 'ALC-06',
    descripcion: 'Aplica a todas las actividades de construcción, obras civiles y trabajos en campo incluyendo trabajo en alturas y espacios confinados.',
    aplicaA: 'Construcción y Obras'
  },
  {
    codigo: 'ALC-07',
    descripcion: 'Aplica a todas las actividades de laboratorio, manejo de sustancias químicas, reactivos y muestras.',
    aplicaA: 'Laboratorio'
  },
  {
    codigo: 'ALC-08',
    descripcion: 'Aplica a las actividades de transporte, conducción de vehículos y distribución de mercancías.',
    aplicaA: 'Transporte y Distribución'
  },
  {
    codigo: 'ALC-09',
    descripcion: 'Aplica a todas las actividades de atención al público, servicio al cliente y gestión comercial.',
    aplicaA: 'Atención al Cliente'
  },
  {
    codigo: 'ALC-10',
    descripcion: 'Aplica a las actividades del proyecto específico durante su fase de ejecución.',
    aplicaA: 'Proyecto Específico'
  },
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
