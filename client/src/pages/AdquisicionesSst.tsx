import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  SolicitudAdquisicion,
  InsertSolicitudAdquisicion,
  insertSolicitudAdquisicionSchema,
  EvaluacionAdquisicion,
  InsertEvaluacionAdquisicion,
  insertEvaluacionAdquisicionSchema,
  Worker,
  ResourceAllocation
} from "@shared/schema";
import { 
  Plus, Search, Edit, Trash2, ShoppingCart, ClipboardCheck, 
  AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp,
  BarChart3, Package, FileText, Calendar, Bot, Boxes, ArrowLeft, FileDown, CalendarDays
} from "lucide-react";
import { Link } from "wouter";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { useToast } from "@/hooks/use-toast";
import { GestionAdquisiciones } from "@/components/GestionAdquisiciones";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { eppsSstPredefinidos, getEppByCodigo, categoriaEppLabels } from "@/data/epps-sst-predefinidos";
import { ADQUISICION_STATUS_CONFIGS, IMPACTO_CONFIGS, getBadgeConfig } from "@/lib/utils/badge-helpers";
import { AutomationAssistant, PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";

const plantillasAdquisiciones: PlantillaInfo[] = [
  {
    id: 'epp-proteccion-cabeza',
    nombre: 'EPP - Protección de Cabeza',
    descripcion: 'Cascos y elementos de protección craneal',
    campos: {
      tipoAdquisicion: 'epp',
      justificacion: 'Adquisición de elementos de protección para cabeza según NTC 1523. Requisitos SST: Certificación de resistencia a impacto, ajuste ergonómico, compatibilidad con otros EPP. Decreto 1072/2015 Art. 2.2.4.6.24.'
    },
    normativaBase: 'NTC-1523'
  },
  {
    id: 'epp-proteccion-respiratoria',
    nombre: 'EPP - Protección Respiratoria',
    descripcion: 'Respiradores y equipos de protección de vías respiratorias',
    campos: {
      tipoAdquisicion: 'epp',
      justificacion: 'Adquisición de protección respiratoria según NTC 1584. Requisitos SST: Factor de protección adecuado al contaminante, ajuste facial, filtros certificados, programa de protección respiratoria. Decreto 1072/2015 Art. 2.2.4.6.24.'
    },
    normativaBase: 'NTC-1584'
  },
  {
    id: 'epp-proteccion-auditiva',
    nombre: 'EPP - Protección Auditiva',
    descripcion: 'Tapones y orejeras para protección auditiva',
    campos: {
      tipoAdquisicion: 'epp',
      justificacion: 'Adquisición de protección auditiva según NTC 2272. Requisitos SST: NRR adecuado al nivel de ruido, confort para uso prolongado, compatibilidad con otros EPP. Resolución 0312/2019, Decreto 1072/2015 Art. 2.2.4.6.24.'
    },
    normativaBase: 'NTC-2272'
  },
  {
    id: 'maquinaria-industrial',
    nombre: 'Maquinaria Industrial',
    descripcion: 'Equipos y maquinaria para procesos industriales',
    campos: {
      tipoAdquisicion: 'maquinaria',
      justificacion: 'Adquisición de maquinaria industrial. Requisitos SST: Certificación de seguridad, guardas de protección, sistemas de parada de emergencia, señalización, manual de operación en español, capacitación del personal. Decreto 1072/2015 Art. 2.2.4.6.24, Resolución 2400/1979.'
    },
    normativaBase: 'DEC-1072-2.2.4.6.24'
  },
  {
    id: 'herramientas-manuales',
    nombre: 'Herramientas Manuales',
    descripcion: 'Herramientas de mano y eléctricas portátiles',
    campos: {
      tipoAdquisicion: 'herramientas',
      justificacion: 'Adquisición de herramientas manuales. Requisitos SST: Ergonomía, materiales antideslizantes, aislamiento eléctrico (si aplica), certificación de calidad, instrucciones de uso seguro. Decreto 1072/2015 Art. 2.2.4.6.24.'
    },
    normativaBase: 'DEC-1072-2.2.4.6.24'
  },
  {
    id: 'sustancias-quimicas',
    nombre: 'Sustancias Químicas',
    descripcion: 'Productos químicos para procesos industriales',
    campos: {
      tipoAdquisicion: 'sustancias_quimicas',
      justificacion: 'Adquisición de sustancias químicas. Requisitos SST: Fichas de Datos de Seguridad (FDS) en español, etiquetado SGA, compatibilidad de almacenamiento, EPP requerido, procedimientos de emergencia, capacitación en manejo seguro. Decreto 1496/2018, Decreto 1072/2015 Art. 2.2.4.6.24.'
    },
    normativaBase: 'DEC-1496-2018'
  },
  {
    id: 'equipos-emergencia',
    nombre: 'Equipos de Emergencia',
    descripcion: 'Extintores, botiquines, camillas y equipos de respuesta',
    campos: {
      tipoAdquisicion: 'equipos_emergencia',
      justificacion: 'Adquisición de equipos de emergencia. Requisitos SST: Certificación ICONTEC/UL, capacidad adecuada, fecha de vencimiento/recarga, ubicación estratégica, señalización, capacitación del personal. Decreto 1072/2015 Art. 2.2.4.6.25, Resolución 0312/2019.'
    },
    normativaBase: 'DEC-1072-2.2.4.6.25'
  },
  {
    id: 'mobiliario-ergonomico',
    nombre: 'Mobiliario Ergonómico',
    descripcion: 'Sillas, escritorios y elementos de trabajo ergonómicos',
    campos: {
      tipoAdquisicion: 'mobiliario',
      justificacion: 'Adquisición de mobiliario ergonómico. Requisitos SST: Ajustabilidad (altura, respaldo, apoyabrazos), soporte lumbar, materiales de calidad, certificación ergonómica. Prevención de DME según Resolución 0312/2019, Decreto 1072/2015.'
    },
    normativaBase: 'RES-0312-2019'
  },
  {
    id: 'software-sst',
    nombre: 'Software SST',
    descripcion: 'Sistemas de información para gestión SST',
    campos: {
      tipoAdquisicion: 'software',
      justificacion: 'Adquisición de software para gestión SST. Requisitos: Cumplimiento con normativa colombiana (Resolución 0312/2019, Decreto 1072/2015), trazabilidad de información, reportes normativos, seguridad de datos, soporte técnico.'
    },
    normativaBase: 'RES-0312-2019'
  },
  {
    id: 'servicios-sst',
    nombre: 'Servicios SST',
    descripcion: 'Servicios de consultoría, capacitación y auditoría SST',
    campos: {
      tipoAdquisicion: 'servicios',
      justificacion: 'Contratación de servicios SST. Requisitos: Proveedor con licencia SST vigente, experiencia demostrable, metodología según normativa colombiana, entregables documentados. Decreto 1072/2015 Art. 2.2.4.6.27.'
    },
    normativaBase: 'DEC-1072-2.2.4.6.27'
  }
];

type TipoAdquisicion = "epp" | "maquinaria" | "herramientas" | "sustancias_quimicas" | "equipos_emergencia" | "mobiliario" | "software" | "servicios" | "otros";

interface PlantillaData {
  tipoAdquisicion: TipoAdquisicion;
  justificacion: string;
  plantillaNombre: string;
}

interface EvaluacionAutoFillConfig {
  normasAplicables: string;
  peligrosIdentificados: string;
  especificacionesSst: string;
  controlesNecesarios: string;
  eppRequerido: string;
  recomendaciones: string;
}

type EvaluacionCategory = 'cabeza' | 'ojos' | 'respiratorio' | 'auditivo' | 'manos' | 'pies' | 'cuerpo' | 'alturas' | 'electrico' | 'equipos' | 'maquinaria' | 'herramientas' | 'sustancias_quimicas' | 'servicios' | 'mobiliario' | 'software' | 'equipos_emergencia';

const evaluacionAutoFillData: Record<EvaluacionCategory, EvaluacionAutoFillConfig> = {
  cabeza: {
    normasAplicables: "NTC 1523 - Cascos de seguridad industrial. ANSI/ISEA Z89.1 - Requisitos de rendimiento. Resolución 2400/1979 Art. 177. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Caída de objetos. Golpes contra estructuras. Contacto con elementos a tensión (si aplica Clase E). Exposición a salpicaduras.",
    especificacionesSst: "Certificación según clase (G, E, C). Sistema de suspensión de 4 puntos mínimo. Banda de sudor reemplazable. Ranuras para accesorios compatibles.",
    controlesNecesarios: "Inspección visual diaria antes de uso. Verificación de grietas, deformaciones o daños. Reemplazo tras impacto fuerte. Almacenamiento adecuado.",
    eppRequerido: "Barbuquejo si trabajo en alturas. Gafas de seguridad complementarias. Protección auditiva según ambiente.",
    recomendaciones: "Verificar compatibilidad con otros EPP. Capacitar en uso y mantenimiento. Establecer programa de reposición. Registrar entrega y devolución."
  },
  ojos: {
    normasAplicables: "NTC 1825 - Gafas de seguridad. ANSI Z87.1 - Protección ocular. Resolución 2400/1979 Art. 178. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Proyección de partículas. Salpicaduras químicas. Radiación UV/IR. Impactos de objetos volantes.",
    especificacionesSst: "Resistencia al impacto certificada. Protección lateral integrada. Antiempañante. Protección UV según ambiente.",
    controlesNecesarios: "Limpieza diaria de lentes. Verificación de armazón y protecciones. Reemplazo por rayaduras o daños. Almacenamiento en estuche.",
    eppRequerido: "Casco de seguridad según área. Protección facial completa para químicos. Careta para soldadura.",
    recomendaciones: "Seleccionar según riesgo específico (impacto, químicos, radiación). Capacitar en limpieza y cuidado. Tener lentes de repuesto disponibles."
  },
  respiratorio: {
    normasAplicables: "NTC 1584 - Equipos de protección respiratoria. NTC 4116 - Selección de respiradores. NIOSH 42 CFR Part 84. Resolución 2400/1979 Art. 179. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Exposición a polvos y partículas. Vapores orgánicos. Gases tóxicos. Atmósferas con deficiencia de oxígeno.",
    especificacionesSst: "Factor de protección asignado (FPA) adecuado. Certificación NIOSH. Filtros apropiados al contaminante. Ajuste facial verificado.",
    controlesNecesarios: "Prueba de ajuste inicial y periódica. Inspección antes de cada uso. Cambio de filtros según indicador o tiempo. Programa de protección respiratoria.",
    eppRequerido: "Gafas de seguridad. Overol o ropa de protección. Guantes según contaminante.",
    recomendaciones: "Establecer programa de protección respiratoria. Realizar pruebas de ajuste periódicas. Capacitar en uso, limitaciones y mantenimiento. Registrar exposiciones."
  },
  auditivo: {
    normasAplicables: "NTC 2272 - Protectores auditivos. ANSI S3.19 - Métodos de medición de atenuación. Resolución 2400/1979 Art. 189. Resolución 0312/2019. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Exposición a ruido continuo. Ruido de impacto. Pérdida auditiva inducida por ruido (PAIR). Fatiga auditiva.",
    especificacionesSst: "NRR (Noise Reduction Rating) adecuado al nivel de exposición. Comodidad para uso prolongado. Compatibilidad con otros EPP.",
    controlesNecesarios: "Medición de niveles de ruido en áreas. Evaluaciones audiométricas periódicas. Reemplazo de protectores desgastados. Señalización de áreas con ruido.",
    eppRequerido: "Casco de seguridad (orejeras acoplables). Gafas de seguridad. Protección combinada en ambientes ruidosos.",
    recomendaciones: "Implementar programa de conservación auditiva. Realizar audiometrías anuales. Capacitar en uso correcto e importancia. Reducir ruido en la fuente cuando sea posible."
  },
  manos: {
    normasAplicables: "NTC 2219 - Guantes de protección. EN 388 - Riesgos mecánicos. EN 374 - Riesgos químicos. ASTM D120 - Guantes dieléctricos. Resolución 2400/1979 Art. 182. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Cortes y abrasiones. Contacto con químicos. Riesgo eléctrico. Quemaduras por temperatura. Atrapamiento mecánico.",
    especificacionesSst: "Nivel de protección según EN 388/374. Material apropiado al riesgo. Tallas adecuadas. Destreza preservada para la tarea.",
    controlesNecesarios: "Inspección visual antes de cada uso. Verificación de integridad. Reemplazo por perforaciones o degradación. Almacenamiento separado por tipo.",
    eppRequerido: "Protección ocular para trabajos con químicos. Manga larga según tarea. Delantal para salpicaduras.",
    recomendaciones: "Seleccionar guante específico para cada riesgo. No reutilizar guantes de un solo uso. Capacitar en limitaciones de cada tipo. Tener inventario de diferentes guantes."
  },
  pies: {
    normasAplicables: "NTC 2396 - Calzado de seguridad. ASTM F2413 - Requisitos de rendimiento. Resolución 2400/1979 Art. 184. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Caída de objetos pesados. Perforación por objetos punzantes. Riesgo eléctrico. Resbalones. Exposición a químicos.",
    especificacionesSst: "Puntera de protección (acero/composite). Suela antideslizante. Plantilla antiperforación. Resistencia dieléctrica si aplica.",
    controlesNecesarios: "Inspección de suela y puntera. Verificación de impermeabilidad. Reemplazo por desgaste significativo. Limpieza y mantenimiento regular.",
    eppRequerido: "Polainas para soldadura. Protección de tobillo para terrenos irregulares. Botas impermeables para áreas húmedas.",
    recomendaciones: "Proporcionar calzado según riesgo específico del área. Establecer programa de renovación. Capacitar en uso y cuidado. Verificar tallas adecuadas."
  },
  cuerpo: {
    normasAplicables: "NTC 4593 - Ropa de alta visibilidad. EN 14605 - Ropa de protección química. EN 531 - Ropa contra calor. Resolución 2400/1979 Art. 180-181. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Salpicaduras químicas. Exposición a fuego o chispas. Baja visibilidad. Contacto con materiales calientes. Exposición a clima extremo.",
    especificacionesSst: "Nivel de protección según tipo de riesgo. Alta visibilidad Clase 2/3. Resistencia al fuego si aplica. Costuras selladas para químicos.",
    controlesNecesarios: "Lavado según instrucciones del fabricante. Inspección de costuras e integridad. Reemplazo por deterioro. Almacenamiento limpio y seco.",
    eppRequerido: "Protección de cabeza, manos y pies complementaria. Protección respiratoria según ambiente. Protección ocular.",
    recomendaciones: "Definir código de vestimenta SST por área. Proporcionar tallas adecuadas. Establecer procedimiento de lavado industrial. Capacitar en uso correcto."
  },
  alturas: {
    normasAplicables: "NTC 1771 - Arneses de seguridad. ANSI Z359 - Protección contra caídas. Resolución 1409/2012 - Trabajo seguro en alturas. Resolución 4272/2021. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Caída de altura. Péndulo. Suspensión inerte. Impacto contra estructuras. Falla de puntos de anclaje.",
    especificacionesSst: "Arnés de cuerpo completo certificado. Eslingas con absorbedor de impacto. Puntos de anclaje certificados mínimo 2272 kg. Líneas de vida retráctiles.",
    controlesNecesarios: "Inspección preoperacional documentada. Verificación de puntos de anclaje. Capacitación y certificación del trabajador. Plan de rescate implementado.",
    eppRequerido: "Casco con barbuquejo. Guantes de agarre. Botas con suela antideslizante. Protección auditiva si aplica.",
    recomendaciones: "Verificar certificación del trabajador (altura, reentrenamiento). Implementar análisis de trabajo seguro (ATS). Tener plan de rescate. Inspección por persona competente."
  },
  electrico: {
    normasAplicables: "NTC 2206 - Guantes dieléctricos. ASTM D120. RETIE - Reglamento Técnico de Instalaciones Eléctricas. NFPA 70E. Resolución 90708/2013. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Electrocución. Arco eléctrico. Quemaduras eléctricas. Incendio. Explosión en atmósferas explosivas.",
    especificacionesSst: "Clase de aislamiento según voltaje. Certificación dieléctrica vigente. Prueba periódica de guantes. Ropa resistente al arco (cal/cm²).",
    controlesNecesarios: "Prueba de guantes dieléctricos cada 6 meses. Verificación de herramientas aisladas. Procedimiento de bloqueo/etiquetado (LOTO). Análisis de riesgos eléctricos.",
    eppRequerido: "Guantes dieléctricos con sobreguante. Calzado dieléctrico. Casco dieléctrico Clase E. Gafas de seguridad. Ropa resistente al arco.",
    recomendaciones: "Certificar personal para trabajo eléctrico. Implementar programa LOTO. Mantener registro de pruebas de EPP. Establecer distancias de seguridad."
  },
  equipos: {
    normasAplicables: "NTC 2885 - Extintores portátiles. NTC 5067 - Camillas. Resolución 0705/2007 - Botiquines. Resolución 0312/2019. Decreto 1072/2015 Art. 2.2.4.6.25.",
    peligrosIdentificados: "Incendios. Emergencias médicas. Evacuaciones. Derrames químicos. Accidentes con lesiones.",
    especificacionesSst: "Certificación ICONTEC/UL. Capacidad adecuada. Ubicación estratégica. Señalización visible. Fecha de vencimiento vigente.",
    controlesNecesarios: "Inspección mensual de extintores. Recarga anual. Verificación de contenido de botiquines. Simulacros de emergencia.",
    eppRequerido: "Guantes de primeros auxilios. Protección ocular para respuesta a emergencias. Chaleco reflectivo para brigadistas.",
    recomendaciones: "Capacitar brigadas de emergencia. Mantener inventario actualizado. Ubicar según análisis de riesgos. Documentar inspecciones."
  },
  maquinaria: {
    normasAplicables: "Resolución 2400/1979 Título IV. NTC 5831 - Seguridad en máquinas. ISO 12100 - Diseño seguro. Decreto 1072/2015 Art. 2.2.4.6.24. Decreto 1443/2014.",
    peligrosIdentificados: "Atrapamiento mecánico. Proyección de partículas. Contacto con superficies calientes. Ruido. Vibraciones. Emisión de gases.",
    especificacionesSst: "Guardas de protección en puntos de atrapamiento. Sistemas de parada de emergencia. Señalización de seguridad. Manual en español. Declaración de conformidad.",
    controlesNecesarios: "Programa de mantenimiento preventivo. Inspección preoperacional. Bloqueo/etiquetado para mantenimiento. Verificación de guardas antes de operar.",
    eppRequerido: "Protección auditiva. Gafas de seguridad. Guantes según operación. Calzado de seguridad. No usar ropa suelta ni accesorios.",
    recomendaciones: "Capacitar operadores antes de uso. Implementar procedimientos de operación segura. Documentar mantenimientos. Realizar inspecciones periódicas por personal competente."
  },
  herramientas: {
    normasAplicables: "Resolución 2400/1979 Art. 355-367. NTC 1950 - Herramientas manuales. IEC 60745 - Herramientas eléctricas. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Golpes y contusiones. Cortes y laceraciones. Atrapamiento. Proyección de partículas. Electrocución (herramientas eléctricas).",
    especificacionesSst: "Ergonomía adecuada. Aislamiento eléctrico certificado. Materiales antideslizantes. Estado de conservación verificado.",
    controlesNecesarios: "Inspección visual antes de uso. Almacenamiento ordenado. Reemplazo de herramientas dañadas. Uso exclusivo para propósito diseñado.",
    eppRequerido: "Gafas de seguridad. Guantes según herramienta. Protección auditiva para herramientas eléctricas ruidosas.",
    recomendaciones: "Capacitar en uso correcto de cada herramienta. No modificar herramientas. Mantener programa de inspección. Proporcionar herramienta adecuada para cada tarea."
  },
  sustancias_quimicas: {
    normasAplicables: "Decreto 1496/2018 - Sistema Globalmente Armonizado (SGA). NTC 1692 - Transporte de mercancías peligrosas. Resolución 0312/2019. Decreto 1072/2015 Art. 2.2.4.6.24.",
    peligrosIdentificados: "Inhalación de vapores. Contacto con piel. Ingestión accidental. Incendio/explosión. Reacciones químicas peligrosas.",
    especificacionesSst: "Ficha de Datos de Seguridad (FDS) en español. Etiquetado SGA completo. Compatibilidad de almacenamiento. Hojas de emergencia.",
    controlesNecesarios: "Almacenamiento según matriz de compatibilidad. Ventilación adecuada. Kit de derrames disponible. Ducha de emergencia y lavaojos.",
    eppRequerido: "Respirador con filtros químicos. Guantes resistentes al químico específico. Gafas herméticas o careta facial. Overol de protección química. Delantal impermeable.",
    recomendaciones: "Mantener FDS actualizadas y accesibles. Capacitar en manejo seguro y emergencias. Minimizar inventarios. Sustituir por productos menos peligrosos cuando sea posible."
  },
  servicios: {
    normasAplicables: "Decreto 1072/2015 Art. 2.2.4.6.27 y 2.2.4.6.28 - Contratación. Resolución 0312/2019 Estándar 4.1.4. Decreto 1295/1994.",
    peligrosIdentificados: "Riesgos transferidos por terceros. Incumplimiento normativo del contratista. Accidentes de contratistas. Interferencia de trabajos.",
    especificacionesSst: "Licencia SST vigente del proveedor. Certificaciones requeridas. Afiliación a seguridad social. Pólizas de responsabilidad civil.",
    controlesNecesarios: "Verificación de documentación antes de contratar. Inducción en SST de la empresa. Supervisión durante ejecución. Evaluación de desempeño SST.",
    eppRequerido: "EPP apropiado al servicio contratado. Dotación por parte del contratista. Verificación de idoneidad del EPP.",
    recomendaciones: "Incluir cláusulas SST en contratos. Realizar auditorías a contratistas. Mantener registro de contratistas y su desempeño. Comunicar riesgos específicos del área."
  },
  mobiliario: {
    normasAplicables: "Resolución 2400/1979 Art. 8-16. NTC 5655 - Ergonomía. ISO 9241 - Requisitos ergonómicos. Resolución 0312/2019 Estándar 2.3. Decreto 1072/2015.",
    peligrosIdentificados: "Desórdenes musculoesqueléticos (DME). Posturas forzadas. Fatiga visual. Fatiga física. Caídas por inestabilidad.",
    especificacionesSst: "Ajustabilidad (altura de silla, apoyo lumbar). Soporte ergonómico. Materiales de calidad. Certificación ergonómica.",
    controlesNecesarios: "Evaluación de puestos de trabajo. Ajuste personalizado de mobiliario. Pausas activas. Programa de vigilancia epidemiológica DME.",
    eppRequerido: "No aplica EPP específico. Considerar apoyapiés, soporte lumbar, reposamuñecas según evaluación.",
    recomendaciones: "Realizar estudios de puesto de trabajo. Capacitar en higiene postural. Implementar pausas activas. Rotar tareas cuando sea posible."
  },
  software: {
    normasAplicables: "Resolución 0312/2019 - Estándares mínimos SST. Decreto 1072/2015 - SG-SST. Ley 1581/2012 - Protección de datos. ISO 45001:2018.",
    peligrosIdentificados: "Pérdida de información crítica SST. Incumplimiento por falta de seguimiento. Exposición de datos sensibles. Fallas en reportes normativos.",
    especificacionesSst: "Cumplimiento con normativa colombiana SST. Trazabilidad de información. Generación de reportes normativos. Seguridad de datos. Respaldo de información.",
    controlesNecesarios: "Verificación de funcionalidades requeridas. Capacitación a usuarios. Respaldos periódicos. Actualizaciones de seguridad.",
    eppRequerido: "No aplica EPP específico para software.",
    recomendaciones: "Validar cumplimiento normativo del software. Solicitar demostración antes de compra. Verificar soporte técnico disponible. Migrar datos existentes correctamente."
  },
  equipos_emergencia: {
    normasAplicables: "NTC 2885 - Extintores. NTC 5067 - Camillas. Resolución 0705/2007 - Botiquines. NFPA 10 - Extintores portátiles. Resolución 0312/2019. Decreto 1072/2015.",
    peligrosIdentificados: "Incendios no controlados. Retraso en atención de emergencias. Evacuación deficiente. Lesiones sin atención inmediata.",
    especificacionesSst: "Certificación ICONTEC/UL/FM. Capacidad según área y riesgo. Ubicación estratégica señalizada. Vigencia de recarga o contenido.",
    controlesNecesarios: "Inspección mensual documentada. Recarga anual de extintores. Verificación trimestral de botiquines. Mantenimiento de camillas y equipos.",
    eppRequerido: "Guantes de nitrilo para primeros auxilios. Protección ocular para brigadistas. Chaleco reflectivo de identificación.",
    recomendaciones: "Capacitar brigadas de emergencia. Realizar simulacros periódicos. Mantener plano de evacuación actualizado. Señalizar rutas y equipos de emergencia."
  }
};

function getCategoryFromSolicitud(solicitud: SolicitudAdquisicion): EvaluacionCategory | null {
  const tipo = solicitud.tipoAdquisicion;
  if (tipo === 'maquinaria') return 'maquinaria';
  if (tipo === 'herramientas') return 'herramientas';
  if (tipo === 'sustancias_quimicas') return 'sustancias_quimicas';
  if (tipo === 'servicios') return 'servicios';
  if (tipo === 'mobiliario') return 'mobiliario';
  if (tipo === 'software') return 'software';
  if (tipo === 'equipos_emergencia') return 'equipos_emergencia';
  
  if (tipo === 'epp') {
    const desc = solicitud.descripcion.toLowerCase();
    if (desc.includes('casco') || desc.includes('cabeza') || desc.includes('craneal')) return 'cabeza';
    if (desc.includes('gafa') || desc.includes('careta') || desc.includes('visual') || desc.includes('ocular') || desc.includes('ojos')) return 'ojos';
    if (desc.includes('respirador') || desc.includes('mascarilla') || desc.includes('filtro') || desc.includes('respiratori')) return 'respiratorio';
    if (desc.includes('tapón') || desc.includes('orejera') || desc.includes('auditiv') || desc.includes('protector de oído')) return 'auditivo';
    if (desc.includes('guante') || desc.includes('mano')) return 'manos';
    if (desc.includes('bota') || desc.includes('calzado') || desc.includes('zapato') || desc.includes('pie')) return 'pies';
    if (desc.includes('arnés') || desc.includes('eslinga') || desc.includes('altura') || desc.includes('línea de vida')) return 'alturas';
    if (desc.includes('dieléctric') || desc.includes('eléctric') || desc.includes('aislante') || desc.includes('voltaje')) return 'electrico';
    if (desc.includes('chaleco') || desc.includes('overol') || desc.includes('delantal') || desc.includes('traje') || desc.includes('cuerpo')) return 'cuerpo';
    return 'equipos';
  }
  
  return null;
}

export default function AdquisicionesSst() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [pendingPlantillaData, setPendingPlantillaData] = useState<PlantillaData | null>(null);
  
  const estandar291 = getEstandarByCodigo('2.9.1');
  
  const normativaAdquisiciones = estandar291?.normativaAplicable || [
    {
      codigo: 'DEC-1072-2.2.4.6.24',
      norma: 'Decreto 1072/2015',
      articulo: 'Artículo 2.2.4.6.24',
      descripcion: 'Medidas de prevención y control - Adquisiciones',
      requisitos: [
        'Establecer procedimiento para identificación y evaluación de especificaciones SST',
        'Evaluar el impacto sobre la SST de materiales, materias primas, insumos, etc.',
        'Informar a los proveedores sobre los requisitos de SST',
        'Verificar que las adquisiciones cumplan con especificaciones técnicas SST'
      ],
      obligatorio: true
    },
    ...(estandar291?.normativaAplicable || [])
  ];

  const camposSugeridos = [
    { campo: 'tipoAdquisicion', valor: 'EPP', normativaReferencia: 'Art. 2.2.4.6.24' },
    { campo: 'criteriosSST', valor: 'Fichas técnicas, Certificaciones, Cumplimiento normativo', normativaReferencia: 'Art. 2.2.4.6.27' }
  ];

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    const campos = plantilla.campos as { tipoAdquisicion?: TipoAdquisicion; justificacion?: string };
    setPendingPlantillaData({
      tipoAdquisicion: campos.tipoAdquisicion || 'otros',
      justificacion: campos.justificacion || '',
      plantillaNombre: plantilla.nombre
    });
    setActiveTab("solicitudes");
    toast({
      title: "Plantilla aplicada",
      description: `Se aplicó la plantilla "${plantilla.nombre}". Complete los datos restantes del formulario.`,
      className: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800",
    });
  };

  const handlePlantillaApplied = () => {
    setPendingPlantillaData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Adquisiciones SST</h1>
        <p className="text-muted-foreground">
          Gestión de adquisiciones con criterios de seguridad y salud en el trabajo - Decreto 1072/2015 Art. 2.2.4.6.27
        </p>
      </div>

      <AutomationAssistant
        titulo="Adquisiciones SST"
        estandar="2.9.1"
        descripcion="Identificación y evaluación de especificaciones en SST para adquisiciones"
        normativaAplicable={normativaAdquisiciones}
        compact={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="solicitudes" data-testid="tab-solicitudes">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Solicitudes
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" data-testid="tab-evaluaciones">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="inventario" data-testid="tab-inventario">
            <Boxes className="h-4 w-4 mr-2" />
            Inventario Items
          </TabsTrigger>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Panel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solicitudes">
          <SolicitudesTab 
            pendingPlantillaData={pendingPlantillaData}
            onPlantillaApplied={handlePlantillaApplied}
          />
        </TabsContent>

        <TabsContent value="evaluaciones">
          <EvaluacionesTab />
        </TabsContent>

        <TabsContent value="inventario">
          <GestionAdquisiciones embedded={true} />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== TAB 1: SOLICITUDES ====================

interface SolicitudesTabProps {
  pendingPlantillaData: PlantillaData | null;
  onPlantillaApplied: () => void;
}

function SolicitudesTab({ pendingPlantillaData, onPlantillaApplied }: SolicitudesTabProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SolicitudAdquisicion | null>(null);
  const [selectedPredefEpp, setSelectedPredefEpp] = useState("");

  const { data: solicitudes = [], isLoading } = useQuery<SolicitudAdquisicion[]>({
    queryKey: ["/api/adquisiciones-sst"],
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: recursosFinancieros = [], isLoading: isLoadingRecursos } = useQuery<(ResourceAllocation & { presupuestoDisponible: number })[]>({
    queryKey: ["/api/resource-allocations/financieros"],
  });

  const form = useForm<InsertSolicitudAdquisicion>({
    resolver: zodResolver(insertSolicitudAdquisicionSchema),
    defaultValues: {
      tipoAdquisicion: "epp",
      descripcion: "",
      justificacion: "",
      area: "",
      solicitante: "",
      departamento: "",
      fechaSolicitud: new Date(),
      presupuestoEstimado: 0,
      proveedorNombre: "",
      requiereEvaluacion: 1,
      cantidad: 1,
      nivelRiesgo: "medio",
      estado: "solicitud",
      aprobado: undefined,
      observaciones: "",
      recursoFinancieroId: undefined,
    },
  });

  const selectedRecursoFinancieroId = form.watch("recursoFinancieroId");
  const presupuestoEstimado = form.watch("presupuestoEstimado");
  
  const selectedRecursoFinanciero = recursosFinancieros.find(r => r.id === selectedRecursoFinancieroId);
  const exceedsAvailableBudget = selectedRecursoFinanciero && presupuestoEstimado && 
    presupuestoEstimado > selectedRecursoFinanciero.presupuestoDisponible;

  useEffect(() => {
    if (pendingPlantillaData) {
      form.reset({
        tipoAdquisicion: pendingPlantillaData.tipoAdquisicion,
        descripcion: "",
        justificacion: pendingPlantillaData.justificacion,
        area: "",
        solicitante: "",
        departamento: "",
        fechaSolicitud: new Date(),
        presupuestoEstimado: 0,
        proveedorNombre: "",
        requiereEvaluacion: 1,
        cantidad: 1,
        nivelRiesgo: "medio",
        estado: "solicitud",
        aprobado: undefined,
        observaciones: "",
        recursoFinancieroId: undefined,
      });
      setEditingItem(null);
      setSelectedPredefEpp("");
      setDialogOpen(true);
      onPlantillaApplied();
    }
  }, [pendingPlantillaData, form, onPlantillaApplied]);

  const createMutation = useMutation({
    mutationFn: (data: InsertSolicitudAdquisicion) =>
      apiRequest("POST", "/api/adquisiciones-sst", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adquisiciones-sst"] });
      toast({ title: "Solicitud creada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertSolicitudAdquisicion> }) =>
      apiRequest("PATCH", `/api/adquisiciones-sst/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adquisiciones-sst"] });
      toast({ title: "Solicitud actualizada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/adquisiciones-sst/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adquisiciones-sst"] });
      toast({ title: "Solicitud eliminada", className: "bg-yellow-50 border-yellow-200" });
    },
  });

  const handleSubmit = (data: InsertSolicitudAdquisicion) => {
    const payload = {
      ...data,
      fechaSolicitud: data.fechaSolicitud instanceof Date ? data.fechaSolicitud.toISOString() : data.fechaSolicitud,
      requiereEvaluacion: data.requiereEvaluacion ?? 1,
    };
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: SolicitudAdquisicion) => {
    setEditingItem(item);
    form.reset({
      ...item,
      fechaSolicitud: new Date(item.fechaSolicitud),
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta solicitud?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAutoFillFromPredefinido = (codigo: string) => {
    const epp = getEppByCodigo(codigo);
    if (epp) {
      form.setValue('tipoAdquisicion', 'epp');
      form.setValue('descripcion', `${epp.nombre} - ${epp.descripcion}`);
      form.setValue('justificacion', `Adquisición de ${epp.nombre} según norma ${epp.normaNacional || 'N/A'}. ${epp.especificaciones || ''}`);
      form.setValue('nivelRiesgo', epp.nivelRiesgo);
      toast({
        title: "Campos autocompletados",
        description: `Se han rellenado los campos con la información de: ${epp.nombre}`,
        className: "bg-blue-50 border-blue-200",
      });
    }
  };

  const filteredSolicitudes = solicitudes.filter((s) =>
    s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.numeroSolicitud?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes de Adquisición</CardTitle>
              <CardDescription>
                Gestione las solicitudes de compra de bienes y servicios con criterios SST
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingItem(null);
                setSelectedPredefEpp("");
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-nueva-solicitud">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Editar Solicitud" : "Nueva Solicitud de Adquisición"}
                  </DialogTitle>
                  <DialogDescription>
                    Complete los datos de la solicitud de adquisición con criterios SST
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {!editingItem && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione un EPP o equipo predefinido para auto-rellenar los campos</p>
                            </div>
                            <div className="flex gap-2">
                              <Select value={selectedPredefEpp} onValueChange={(value) => {
                                setSelectedPredefEpp(value);
                                handleAutoFillFromPredefinido(value);
                              }}>
                                <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-epp-predefinido">
                                  <SelectValue placeholder="Seleccione un EPP o equipo predefinido..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px]">
                                  {Object.entries(categoriaEppLabels).map(([categoria, label]) => (
                                    <div key={categoria}>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
                                      {eppsSstPredefinidos.filter(e => e.categoria === categoria).map((epp) => (
                                        <SelectItem key={epp.codigo} value={epp.codigo}>
                                          {epp.codigo} - {epp.nombre}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tipoAdquisicion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Adquisición</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-tipo-adquisicion">
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="epp">EPP</SelectItem>
                                <SelectItem value="maquinaria">Maquinaria</SelectItem>
                                <SelectItem value="herramientas">Herramientas</SelectItem>
                                <SelectItem value="sustancias_quimicas">Sustancias Químicas</SelectItem>
                                <SelectItem value="servicios">Servicios</SelectItem>
                                <SelectItem value="equipos_emergencia">Equipos de Emergencia</SelectItem>
                                <SelectItem value="mobiliario">Mobiliario</SelectItem>
                                <SelectItem value="software">Software</SelectItem>
                                <SelectItem value="otros">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nivelRiesgo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel de Riesgo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-nivel-riesgo">
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bajo">Bajo</SelectItem>
                                <SelectItem value="medio">Medio</SelectItem>
                                <SelectItem value="alto">Alto</SelectItem>
                                <SelectItem value="critico">Crítico</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Nivel de riesgo asociado a la adquisición
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} data-testid="textarea-descripcion" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área Destino</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-area-destino" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="solicitante"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solicitante</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-solicitante">
                                  <SelectValue placeholder="Seleccione solicitante" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {workers?.map((worker) => (
                                  <SelectItem key={worker.id} value={`${worker.name} - ${worker.position}`}>
                                    {worker.name} - {worker.position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="justificacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Justificación</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} data-testid="textarea-justificacion" />
                          </FormControl>
                          <FormDescription>
                            Justifique la necesidad de la adquisición
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="presupuestoEstimado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Presupuesto Estimado ($)</FormLabel>
                            <FormControl>
                              <CurrencyInput 
                                value={field.value}
                                onChange={(val) => field.onChange(val ?? 0)}
                                data-testid="input-presupuesto"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="proveedorNombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proveedor (Opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-proveedor" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="recursoFinancieroId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recurso Financiero (Opcional)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-recurso-financiero">
                                <SelectValue placeholder="Seleccione un recurso financiero..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin recurso financiero asignado</SelectItem>
                              {isLoadingRecursos ? (
                                <SelectItem value="loading" disabled>Cargando recursos...</SelectItem>
                              ) : (
                                recursosFinancieros.map((recurso) => {
                                  const nombre = recurso.nombreEquipo || recurso.objeto || "Recurso Financiero";
                                  const inversion = parseFloat(recurso.inversionEstimada || "0");
                                  const disponible = recurso.presupuestoDisponible || 0;
                                  return (
                                    <SelectItem key={recurso.id} value={recurso.id}>
                                      {nombre} - Inversión: ${inversion.toLocaleString('es-CO')} | Disponible: ${disponible.toLocaleString('es-CO')}
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Vincule esta adquisición a un recurso financiero del presupuesto SST
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {exceedsAvailableBudget && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md" data-testid="warning-budget-exceeded">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Presupuesto excedido
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            El presupuesto estimado ($${presupuestoEstimado?.toLocaleString('es-CO')}) excede el saldo disponible del recurso financiero seleccionado ($${selectedRecursoFinanciero?.presupuestoDisponible?.toLocaleString('es-CO')})
                          </p>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button type="submit" data-testid="button-submit-solicitud">
                        {editingItem ? "Actualizar" : "Crear"} Solicitud
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar solicitudes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-solicitudes"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando solicitudes...</div>
            ) : filteredSolicitudes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron solicitudes
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Solicitud</TableHead>
                    <TableHead>Elemento/Servicio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Nivel Riesgo</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Recurso Financiero</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolicitudes.map((solicitud) => {
                    const recursoVinculado = solicitud.recursoFinancieroId 
                      ? recursosFinancieros.find(r => r.id === solicitud.recursoFinancieroId)
                      : null;
                    return (
                    <TableRow key={solicitud.id} data-testid={`row-solicitud-${solicitud.id}`}>
                      <TableCell className="font-medium">
                        {solicitud.numeroSolicitud}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{solicitud.descripcion}</div>
                          <div className="text-sm text-muted-foreground">{solicitud.area}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {solicitud.tipoAdquisicion}
                        </Badge>
                      </TableCell>
                      <TableCell>{solicitud.solicitante}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeConfig(solicitud.nivelRiesgo, IMPACTO_CONFIGS).variant}>
                          {getBadgeConfig(solicitud.nivelRiesgo, IMPACTO_CONFIGS).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${solicitud.presupuestoEstimado?.toLocaleString('es-CO') || 0}
                      </TableCell>
                      <TableCell data-testid={`cell-recurso-financiero-${solicitud.id}`}>
                        {recursoVinculado ? (
                          <div className="text-sm">
                            <div className="font-medium">{recursoVinculado.nombreEquipo || recursoVinculado.objeto || "Recurso"}</div>
                            <div className="text-xs text-muted-foreground">
                              Disponible: ${recursoVinculado.presupuestoDisponible?.toLocaleString('es-CO') || 0}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeConfig(solicitud.estado, ADQUISICION_STATUS_CONFIGS).variant}>
                          {getBadgeConfig(solicitud.estado, ADQUISICION_STATUS_CONFIGS).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(solicitud)}
                            data-testid={`button-edit-${solicitud.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(solicitud.id)}
                            data-testid={`button-delete-${solicitud.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 2: EVALUACIONES PREVIAS ====================

function EvaluacionesTab() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<string>("");
  const [autoFillApplied, setAutoFillApplied] = useState(false);
  const [autoFillCategory, setAutoFillCategory] = useState<string | null>(null);
  const [editingEvaluacion, setEditingEvaluacion] = useState<EvaluacionAdquisicion | null>(null);

  const { data: solicitudes = [] } = useQuery<SolicitudAdquisicion[]>({
    queryKey: ["/api/adquisiciones-sst"],
  });

  const { data: evaluaciones = [] } = useQuery<EvaluacionAdquisicion[]>({
    queryKey: ["/api/evaluaciones-adquisicion"],
  });

  const form = useForm<InsertEvaluacionAdquisicion>({
    resolver: zodResolver(insertEvaluacionAdquisicionSchema),
    defaultValues: {
      solicitudId: "",
      evaluador: "",
      fechaEvaluacion: new Date(),
      peligrosIdentificados: "",
      nivelRiesgo: "medio",
      afectaMatrizRiesgos: 0,
      cumpleNormatividad: 1,
      normasAplicables: "",
      requiereCertificaciones: 0,
      certificacionesRequeridas: "",
      especificacionesSst: "",
      requiereFichaTecnica: 0,
      requiereHojaDatos: 0,
      requiereManualOperacion: 0,
      controlesNecesarios: "",
      eppRequerido: "",
      capacitacionRequerida: 0,
      temaCapacitacion: "",
      resultado: "aprobado",
      puntajeTotal: 100,
      recomendaciones: "",
      observaciones: "",
    },
  });

  const handleAutoFillFromSolicitud = (solicitudId: string) => {
    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) {
      setAutoFillApplied(false);
      setAutoFillCategory(null);
      return;
    }

    const category = getCategoryFromSolicitud(solicitud);
    if (category && evaluacionAutoFillData[category]) {
      const data = evaluacionAutoFillData[category];
      form.setValue('normasAplicables', data.normasAplicables);
      form.setValue('peligrosIdentificados', data.peligrosIdentificados);
      form.setValue('especificacionesSst', data.especificacionesSst);
      form.setValue('controlesNecesarios', data.controlesNecesarios);
      form.setValue('eppRequerido', data.eppRequerido);
      form.setValue('recomendaciones', data.recomendaciones);
      form.setValue('nivelRiesgo', solicitud.nivelRiesgo || 'medio');
      setAutoFillApplied(true);
      setAutoFillCategory(category);
      toast({
        title: "Campos auto-completados",
        description: `Se han rellenado los campos con información SST para: ${category}`,
        className: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
      });
    } else {
      setAutoFillApplied(false);
      setAutoFillCategory(null);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertEvaluacionAdquisicion) =>
      apiRequest("POST", "/api/evaluaciones-adquisicion", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-adquisicion"] });
      queryClient.invalidateQueries({ queryKey: ["/api/adquisiciones-sst"] });
      toast({ title: "Evaluación registrada exitosamente", className: "bg-green-50 border-green-200" });
      setDialogOpen(false);
      form.reset();
      setAutoFillApplied(false);
      setAutoFillCategory(null);
      setEditingEvaluacion(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<InsertEvaluacionAdquisicion> }) =>
      apiRequest("PATCH", `/api/evaluaciones-adquisicion/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-adquisicion"] });
      queryClient.invalidateQueries({ queryKey: ["/api/adquisiciones-sst"] });
      toast({ title: "Evaluación actualizada exitosamente", className: "bg-green-50 border-green-200" });
      setDialogOpen(false);
      form.reset();
      setAutoFillApplied(false);
      setAutoFillCategory(null);
      setEditingEvaluacion(null);
    },
  });

  const handleSubmit = (data: InsertEvaluacionAdquisicion) => {
    const payload = {
      ...data,
      fechaEvaluacion: data.fechaEvaluacion instanceof Date 
        ? data.fechaEvaluacion.toISOString() 
        : data.fechaEvaluacion,
    };
    if (editingEvaluacion) {
      updateMutation.mutate({ id: editingEvaluacion.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (evaluacion: EvaluacionAdquisicion) => {
    setEditingEvaluacion(evaluacion);
    form.reset({
      solicitudId: evaluacion.solicitudId,
      evaluador: evaluacion.evaluador,
      fechaEvaluacion: new Date(evaluacion.fechaEvaluacion),
      peligrosIdentificados: evaluacion.peligrosIdentificados || "",
      nivelRiesgo: evaluacion.nivelRiesgo as "critico" | "alto" | "medio" | "bajo",
      afectaMatrizRiesgos: evaluacion.afectaMatrizRiesgos || 0,
      cumpleNormatividad: evaluacion.cumpleNormatividad || 1,
      normasAplicables: evaluacion.normasAplicables || "",
      requiereCertificaciones: evaluacion.requiereCertificaciones || 0,
      certificacionesRequeridas: evaluacion.certificacionesRequeridas || "",
      especificacionesSst: evaluacion.especificacionesSst || "",
      requiereFichaTecnica: evaluacion.requiereFichaTecnica || 0,
      requiereHojaDatos: evaluacion.requiereHojaDatos || 0,
      requiereManualOperacion: evaluacion.requiereManualOperacion || 0,
      controlesNecesarios: evaluacion.controlesNecesarios || "",
      eppRequerido: evaluacion.eppRequerido || "",
      capacitacionRequerida: evaluacion.capacitacionRequerida || 0,
      temaCapacitacion: evaluacion.temaCapacitacion || "",
      resultado: evaluacion.resultado as "aprobado" | "rechazado" | "aprobado_condiciones" | "requiere_controles",
      puntajeTotal: evaluacion.puntajeTotal || 100,
      recomendaciones: evaluacion.recomendaciones || "",
      observaciones: evaluacion.observaciones || "",
    });
    setDialogOpen(true);
  };

  const solicitudesPendientes = solicitudes.filter(
    (s) => s.requiereEvaluacion === 1 && s.estado === "solicitud"
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Evaluaciones Previas SST</CardTitle>
              <CardDescription>
                Evaluación de criterios SST para adquisiciones ({solicitudesPendientes.length} pendientes)
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                form.reset();
                setAutoFillApplied(false);
                setAutoFillCategory(null);
                setEditingEvaluacion(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-nueva-evaluacion">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Evaluación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvaluacion ? "Editar Evaluación Previa SST" : "Nueva Evaluación Previa SST"}</DialogTitle>
                  <DialogDescription>
                    {editingEvaluacion ? "Modifique los criterios de la evaluación SST" : "Evalúe los criterios de seguridad y salud en el trabajo para la adquisición"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="solicitudId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solicitud a Evaluar</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            handleAutoFillFromSolicitud(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-solicitud">
                                <SelectValue placeholder="Seleccione una solicitud..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {solicitudesPendientes.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.numeroSolicitud} - {s.descripcion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {autoFillApplied && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4" data-testid="autofill-indicator">
                        <div className="flex items-start gap-3">
                          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Campos auto-completados
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Se han rellenado automáticamente los campos de evaluación SST basados en la categoría: <span className="font-semibold capitalize">{autoFillCategory}</span>. Puede modificar cualquier valor según sea necesario.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="evaluador"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evaluador</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-evaluador" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cumpleNormatividad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Cumple con Normas SST?</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            defaultValue={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-cumple-normas">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Sí, cumple</SelectItem>
                              <SelectItem value="0">No cumple</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="normasAplicables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Normas Aplicables</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              rows={2} 
                              data-testid="textarea-normas"
                            />
                          </FormControl>
                          <FormDescription>
                            Normas y regulaciones SST aplicables
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="peligrosIdentificados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peligros Identificados</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              rows={2} 
                              data-testid="textarea-peligros"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="especificacionesSst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especificaciones SST</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={2} 
                              data-testid="textarea-especificaciones"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="controlesNecesarios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Controles Necesarios</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              rows={2} 
                              data-testid="textarea-controles"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recomendaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recomendaciones</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              rows={2} 
                              data-testid="textarea-recomendaciones"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nivelRiesgo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Riesgo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-nivel-riesgo">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bajo">Bajo</SelectItem>
                              <SelectItem value="medio">Medio</SelectItem>
                              <SelectItem value="alto">Alto</SelectItem>
                              <SelectItem value="critico">Crítico</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resultado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decisión de Evaluación</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-resultado">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aprobado">Aprobado</SelectItem>
                              <SelectItem value="aprobado_condiciones">Aprobado con Condiciones</SelectItem>
                              <SelectItem value="rechazado">Rechazado</SelectItem>
                              <SelectItem value="requiere_revision">Requiere Revisión</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Decisión desde el punto de vista SST
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" data-testid="button-submit-evaluacion">
                        Registrar Evaluación
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {evaluaciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay evaluaciones registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitud</TableHead>
                  <TableHead>Evaluador</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cumple Normas</TableHead>
                  <TableHead>Decisión</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluaciones.map((evaluacion) => {
                  const solicitud = solicitudes.find(s => s.id === evaluacion.solicitudId);
                  return (
                    <TableRow key={evaluacion.id} data-testid={`row-evaluacion-${evaluacion.id}`}>
                      <TableCell>
                        <div className="font-medium">{solicitud?.numeroSolicitud}</div>
                        <div className="text-sm text-muted-foreground">
                          {solicitud?.descripcion}
                        </div>
                      </TableCell>
                      <TableCell>{evaluacion.evaluador}</TableCell>
                      <TableCell>
                        {format(new Date(evaluacion.fechaEvaluacion), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={evaluacion.cumpleNormatividad ? "default" : "destructive"}>
                          {evaluacion.cumpleNormatividad ? "Cumple" : "No cumple"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            evaluacion.resultado === "aprobado" ? "default" :
                            evaluacion.resultado === "aprobado_condiciones" ? "secondary" :
                            "destructive"
                          }
                        >
                          {evaluacion.resultado === "aprobado" ? "Aprobado" :
                           evaluacion.resultado === "aprobado_condiciones" ? "Aprobado con Condiciones" :
                           evaluacion.resultado === "rechazado" ? "Rechazado" :
                           "Requiere Revisión"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(evaluacion)}
                            data-testid={`button-edit-evaluacion-${evaluacion.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 3: DASHBOARD ====================

function DashboardTab() {
  const { data: dashboard } = useQuery<{
    totalSolicitudes: number;
    solicitudesPorEstado: Record<string, number>;
    solicitudesPorTipo: Record<string, number>;
    solicitudesPorNivelRiesgo: Record<string, number>;
    evaluacionesPendientes: number;
    aprobadas: number;
    rechazadas: number;
    enEvaluacion: number;
    presupuestoTotal: number;
  }>({
    queryKey: ["/api/adquisiciones-sst/dashboard"],
  });

  const kpis = [
    {
      title: "Total Solicitudes",
      value: dashboard?.totalSolicitudes || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Evaluaciones Pendientes",
      value: dashboard?.evaluacionesPendientes || 0,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Aprobadas",
      value: dashboard?.aprobadas || 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Rechazadas",
      value: dashboard?.rechazadas || 0,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Panel Adquisiciones SST</h2>
        <Button 
          onClick={() => window.open('/api/adquisiciones-sst/panel/pdf', '_blank')}
          data-testid="button-download-pdf"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Descargar Informe PDF
        </Button>
      </div>
      
      <div className="print-date" style={{ display: 'none' }}>
        Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dashboard?.solicitudesPorEstado || {}).map(([estado, count]) => (
                <div key={estado} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{estado}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dashboard?.solicitudesPorTipo || {}).map(([tipo, count]) => (
                <div key={tipo} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{tipo}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Nivel de Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dashboard?.solicitudesPorNivelRiesgo || {}).map(([nivel, count]) => (
                <div key={nivel} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{nivel}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Presupuesto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(dashboard?.presupuestoTotal || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Presupuesto estimado de todas las solicitudes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
