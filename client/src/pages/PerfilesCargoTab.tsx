import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JobProfile } from "@shared/schema";
import { insertJobProfileSchema } from "@shared/schema";
import { getArlRate, examFrequencyByRisk } from "@shared/arl-rates";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, Shield, Clock, AlertCircle } from "lucide-react";
import { ArrayInput } from "@/components/shared/ArrayInput";

// Perfiles de cargo predefinidos según normativa colombiana
export type PredefProfile = {
  name: string;
  department: string;
  description: string;
  riskClass: "I" | "II" | "III" | "IV" | "V";
  riskFactors: string[];
  physicalDemands: string;
  mentalDemands: string;
  requiredPpe: string[];
  requiredExams: string[];
  requiredTrainings: string[];
};

export const PREDEFINED_PROFILES: Record<string, PredefProfile> = {
  "Gerente General": {
    name: "Gerente General",
    department: "Administrativo",
    description: "Planificar, dirigir y controlar las actividades de la empresa. Tomar decisiones estratégicas, definir objetivos organizacionales, representar legalmente la empresa, gestionar recursos humanos y financieros.",
    riskClass: "I",
    riskFactors: ["Estrés laboral", "Sedentarismo", "Exposición prolongada a pantallas"],
    physicalDemands: "Mínima actividad física, trabajo sedentario en oficina",
    mentalDemands: "Alta capacidad de toma de decisiones estratégicas, liderazgo, análisis de información compleja, manejo de múltiples tareas",
    requiredPpe: [],
    requiredExams: ["Examen médico ocupacional general", "Evaluación visual"],
    requiredTrainings: ["Liderazgo y gestión", "Sistema de Gestión SST", "Toma de decisiones estratégicas"],
  },
  "Contador": {
    name: "Contador",
    department: "Contabilidad",
    description: "Llevar la contabilidad de la empresa, preparar estados financieros, gestionar obligaciones tributarias, realizar análisis financiero, asegurar cumplimiento normativo contable y fiscal.",
    riskClass: "I",
    riskFactors: ["Estrés laboral", "Exposición prolongada a pantallas", "Sedentarismo"],
    physicalDemands: "Trabajo sedentario en oficina, uso constante de computador",
    mentalDemands: "Alta concentración, análisis numérico detallado, precisión, cumplimiento de plazos estrictos",
    requiredPpe: [],
    requiredExams: ["Examen médico ocupacional general", "Evaluación visual", "Valoración osteomuscular"],
    requiredTrainings: ["Normatividad contable y tributaria", "Software contable", "Prevención de riesgos psicosociales"],
  },
  "Asistente Administrativo": {
    name: "Asistente Administrativo",
    department: "Administrativo",
    description: "Apoyar gestión administrativa, atender correspondencia, archivar documentos, coordinar agendas, atender clientes y proveedores, gestionar suministros de oficina.",
    riskClass: "I",
    riskFactors: ["Movimientos repetitivos", "Postura sedentaria prolongada", "Exposición a pantallas"],
    physicalDemands: "Trabajo sedentario, digitación prolongada, organización de archivos",
    mentalDemands: "Atención al detalle, multitarea, organización, comunicación efectiva",
    requiredPpe: [],
    requiredExams: ["Examen médico ocupacional general", "Evaluación visual", "Valoración osteomuscular"],
    requiredTrainings: ["Manejo de herramientas ofimáticas", "Servicio al cliente", "Gestión documental"],
  },
  "Coordinador de SST": {
    name: "Coordinador de SST",
    department: "Seguridad y Salud en el Trabajo",
    description: "Implementar y coordinar el Sistema de Gestión de Seguridad y Salud en el Trabajo, realizar inspecciones de seguridad, investigar accidentes, capacitar trabajadores en SST, gestionar documentación del sistema.",
    riskClass: "II",
    riskFactors: ["Recorridos por áreas operativas", "Exposición eventual a riesgos industriales", "Estrés laboral"],
    physicalDemands: "Desplazamientos frecuentes por la planta, inspecciones de campo, actividad física moderada",
    mentalDemands: "Análisis de riesgos, planificación, atención al detalle, resolución de problemas, comunicación asertiva",
    requiredPpe: ["Casco de seguridad", "Calzado de seguridad", "Chaleco reflectivo"],
    requiredExams: ["Examen médico ocupacional general", "Audiometría", "Visiometría"],
    requiredTrainings: ["Sistema de Gestión SST", "Investigación de accidentes", "Identificación de peligros", "Normatividad SST vigente"],
  },
  "Vendedor": {
    name: "Vendedor",
    department: "Comercial",
    description: "Atender clientes, asesorar sobre productos y servicios, realizar ventas, gestionar cartera de clientes, hacer seguimiento postventa, cumplir metas comerciales.",
    riskClass: "I",
    riskFactors: ["Estrés por metas", "Desplazamientos frecuentes", "Exposición a condiciones climáticas variables"],
    physicalDemands: "Desplazamientos frecuentes, estar de pie prolongadamente, carga leve",
    mentalDemands: "Habilidades de comunicación, persuasión, manejo de objeciones, orientación a resultados",
    requiredPpe: [],
    requiredExams: ["Examen médico ocupacional general"],
    requiredTrainings: ["Técnicas de ventas", "Servicio al cliente", "Manejo de CRM", "Seguridad vial"],
  },
  "Operario de Producción": {
    name: "Operario de Producción",
    department: "Producción",
    description: "Operar maquinaria y equipos de producción, realizar ensamble de productos, controlar calidad en línea de producción, cumplir procedimientos operativos estándar, mantener orden y limpieza en área de trabajo.",
    riskClass: "IV",
    riskFactors: ["Exposición a ruido industrial", "Manejo de maquinaria", "Movimientos repetitivos", "Levantamiento de cargas", "Trabajo con herramientas"],
    physicalDemands: "Estar de pie prolongadamente, levantamiento de cargas moderadas, movimientos repetitivos, destreza manual",
    mentalDemands: "Atención sostenida, seguimiento de instrucciones, rapidez de respuesta, coordinación motora",
    requiredPpe: ["Casco de seguridad", "Botas con puntera de acero", "Gafas de seguridad", "Guantes industriales", "Protección auditiva", "Overol"],
    requiredExams: ["Examen médico ocupacional general", "Audiometría", "Visiometría", "Espirometría"],
    requiredTrainings: ["Uso seguro de maquinaria", "Manejo de EPP", "Procedimientos operativos", "Prevención de accidentes"],
  },
  "Conductor": {
    name: "Conductor",
    department: "Logística",
    description: "Transportar personal, mercancías o productos, realizar mantenimiento preventivo básico del vehículo, cumplir normativa vial, diligenciar documentación de transporte, reportar novedades del servicio.",
    riskClass: "III",
    riskFactors: ["Accidentes de tránsito", "Exposición a vibración", "Sedentarismo", "Estrés por tráfico", "Posturas prolongadas"],
    physicalDemands: "Estar sentado prolongadamente, carga y descarga ocasional, coordinación visomotora",
    mentalDemands: "Atención sostenida, toma de decisiones rápidas, orientación espacial, manejo de estrés",
    requiredPpe: ["Chaleco reflectivo", "Calzado cerrado antideslizante"],
    requiredExams: ["Examen médico ocupacional para conducción", "Visiometría", "Audiometría", "Valoración osteomuscular"],
    requiredTrainings: ["Conducción defensiva", "Manejo de carga", "Primeros auxilios", "PESV (Plan Estratégico de Seguridad Vial)"],
  },
  "Electricista": {
    name: "Electricista",
    department: "Mantenimiento",
    description: "Instalar, mantener y reparar sistemas eléctricos, realizar mediciones eléctricas, interpretar planos eléctricos, cumplir normativa eléctrica vigente (RETIE), gestionar residuos eléctricos.",
    riskClass: "V",
    riskFactors: ["Riesgo eléctrico", "Trabajo en alturas", "Exposición a arco eléctrico", "Quemaduras", "Electrocución"],
    physicalDemands: "Trabajo en diferentes posiciones, levantamiento de cargas, trabajo en alturas, destreza manual fina",
    mentalDemands: "Lectura de planos, análisis de fallas, toma de decisiones críticas, concentración absoluta",
    requiredPpe: ["Casco dieléctrico clase E", "Botas dieléctricas", "Guantes dieléctricos", "Gafas de seguridad", "Arnés anticaída", "Ropa ignífuga"],
    requiredExams: ["Examen médico ocupacional general", "Examen de alturas", "Visiometría", "Electrocardiograma"],
    requiredTrainings: ["Trabajo seguro en electricidad", "Trabajo en alturas", "RETIE", "Primeros auxilios", "Arco eléctrico"],
  },
  "Soldador": {
    name: "Soldador",
    department: "Producción",
    description: "Realizar uniones de piezas metálicas mediante soldadura, interpretar planos de soldadura, preparar superficies, controlar calidad de soldaduras, aplicar técnicas SMAW, GMAW, TIG.",
    riskClass: "V",
    riskFactors: ["Exposición a humos metálicos", "Radiación no ionizante", "Quemaduras", "Proyección de partículas", "Posturas forzadas"],
    physicalDemands: "Posturas forzadas, levantamiento de cargas, destreza manual, resistencia física",
    mentalDemands: "Precisión, lectura de planos, coordinación ojo-mano, atención al detalle",
    requiredPpe: ["Casco de soldador con careta", "Guantes de carnaza", "Peto de carnaza", "Polainas", "Botas de seguridad", "Respirador para humos"],
    requiredExams: ["Examen médico ocupacional general", "Espirometría", "Visiometría", "Radiografía de tórax"],
    requiredTrainings: ["Técnicas de soldadura", "Lectura de planos", "Prevención de incendios", "Manejo de EPP"],
  },
  "Mecánico": {
    name: "Mecánico",
    department: "Mantenimiento",
    description: "Diagnosticar fallas mecánicas, realizar mantenimiento preventivo y correctivo de maquinaria y equipos, interpretar manuales técnicos, gestionar repuestos, documentar intervenciones.",
    riskClass: "IV",
    riskFactors: ["Atrapamiento en maquinaria", "Exposición a aceites y grasas", "Ruido", "Proyección de partículas", "Posturas forzadas"],
    physicalDemands: "Levantamiento de cargas, posturas forzadas, destreza manual, fuerza física moderada",
    mentalDemands: "Diagnóstico de fallas, lectura de manuales técnicos, resolución de problemas, planeación",
    requiredPpe: ["Casco de seguridad", "Botas con puntera de acero", "Gafas de seguridad", "Guantes mecánicos", "Overol"],
    requiredExams: ["Examen médico ocupacional general", "Audiometría", "Visiometría", "Valoración osteomuscular"],
    requiredTrainings: ["Mantenimiento de maquinaria", "Bloqueo y etiquetado (LOTO)", "Lectura de planos mecánicos", "Prevención de riesgos mecánicos"],
  },
  "Almacenista": {
    name: "Almacenista",
    department: "Logística",
    description: "Recibir, almacenar y despachar mercancías, controlar inventarios, organizar bodega, operar montacargas, verificar calidad y cantidad de productos, gestionar documentación logística.",
    riskClass: "III",
    riskFactors: ["Levantamiento de cargas", "Atropellamiento por montacargas", "Caída de objetos", "Movimientos repetitivos"],
    physicalDemands: "Levantamiento y transporte de cargas, estar de pie prolongadamente, caminar largas distancias",
    mentalDemands: "Organización, atención al detalle, manejo de inventarios, coordinación",
    requiredPpe: ["Casco de seguridad", "Botas con puntera de acero", "Guantes", "Chaleco reflectivo"],
    requiredExams: ["Examen médico ocupacional general", "Valoración osteomuscular", "Visiometría"],
    requiredTrainings: ["Manejo de cargas", "Operación de montacargas", "Gestión de inventarios", "Orden y limpieza"],
  },
  "Supervisor de Producción": {
    name: "Supervisor de Producción",
    department: "Producción",
    description: "Coordinar y supervisar procesos productivos, gestionar personal de producción, controlar cumplimiento de metas, asegurar calidad del producto, implementar mejoras continuas.",
    riskClass: "III",
    riskFactors: ["Recorridos por planta", "Exposición a ruido", "Estrés por cumplimiento de metas", "Exposición ocasional a procesos industriales"],
    physicalDemands: "Desplazamientos frecuentes por planta, inspecciones de campo, actividad física moderada",
    mentalDemands: "Liderazgo, toma de decisiones, resolución de conflictos, planificación, análisis de indicadores",
    requiredPpe: ["Casco de seguridad", "Botas de seguridad", "Gafas de seguridad", "Protección auditiva"],
    requiredExams: ["Examen médico ocupacional general", "Audiometría", "Visiometría"],
    requiredTrainings: ["Liderazgo y gestión de equipos", "Sistemas de producción", "Gestión de calidad", "SST en producción"],
  },
  "Auxiliar de Enfermería": {
    name: "Auxiliar de Enfermería",
    department: "Salud Ocupacional",
    description: "Asistir en atención de pacientes, tomar signos vitales, administrar medicamentos bajo supervisión, realizar curaciones, apoyar procedimientos médicos, mantener registros clínicos.",
    riskClass: "II",
    riskFactors: ["Riesgo biológico", "Punciones accidentales", "Contacto con fluidos corporales", "Estrés laboral", "Posturas forzadas"],
    physicalDemands: "Estar de pie prolongadamente, movilización de pacientes, destreza manual fina",
    mentalDemands: "Atención al detalle, empatía, manejo de estrés, trabajo bajo presión, comunicación asertiva",
    requiredPpe: ["Guantes de látex", "Tapabocas", "Bata desechable", "Gafas de protección", "Calzado cerrado antideslizante"],
    requiredExams: ["Examen médico ocupacional general", "Tamizaje de Hepatitis B", "Esquema de vacunación completo", "Valoración osteomuscular"],
    requiredTrainings: ["Bioseguridad", "Manejo de residuos hospitalarios", "Prevención de accidentes biológicos", "Primeros auxilios"],
  },
  "Recepcionista": {
    name: "Recepcionista",
    department: "Administrativo",
    description: "Atender visitantes y llamadas telefónicas, gestionar correspondencia, coordinar agendas, brindar información general, mantener área de recepción organizada.",
    riskClass: "I",
    riskFactors: ["Movimientos repetitivos", "Exposición a pantallas", "Sedentarismo", "Atención al público"],
    physicalDemands: "Trabajo sedentario, uso prolongado de computador y teléfono",
    mentalDemands: "Multitarea, comunicación efectiva, atención simultánea, manejo de información",
    requiredPpe: [],
    requiredExams: ["Examen médico ocupacional general", "Evaluación visual", "Valoración osteomuscular"],
    requiredTrainings: ["Servicio al cliente", "Manejo de centralita telefónica", "Herramientas ofimáticas", "Protocolo empresarial"],
  },
  "Ingeniero de Mantenimiento": {
    name: "Ingeniero de Mantenimiento",
    department: "Mantenimiento",
    description: "Planificar y ejecutar programas de mantenimiento, diagnosticar fallas técnicas, diseñar mejoras en equipos, supervisar técnicos, gestionar repuestos, optimizar procesos de mantenimiento.",
    riskClass: "III",
    riskFactors: ["Exposición a maquinaria", "Ruido industrial", "Trabajo en alturas eventual", "Estrés por paradas no programadas"],
    physicalDemands: "Desplazamientos por planta, inspecciones técnicas, actividad física moderada",
    mentalDemands: "Análisis técnico, planificación, toma de decisiones, resolución de problemas complejos, liderazgo técnico",
    requiredPpe: ["Casco de seguridad", "Botas de seguridad", "Gafas de seguridad", "Protección auditiva"],
    requiredExams: ["Examen médico ocupacional general", "Audiometría", "Visiometría"],
    requiredTrainings: ["Gestión de mantenimiento", "Análisis de fallas", "Normatividad técnica", "Liderazgo técnico"],
  },
  "Auxiliar de Servicios Generales": {
    name: "Auxiliar de Servicios Generales",
    department: "Servicios Generales",
    description: "Realizar limpieza y aseo de instalaciones, mantener orden en áreas comunes, gestionar residuos, apoyar en labores de cafetería, reportar novedades de infraestructura.",
    riskClass: "II",
    riskFactors: ["Exposición a productos químicos de limpieza", "Posturas forzadas", "Movimientos repetitivos", "Caídas al mismo nivel"],
    physicalDemands: "Estar de pie prolongadamente, agacharse frecuentemente, levantamiento de cargas leves, movimientos repetitivos",
    mentalDemands: "Organización, atención al detalle, autonomía en el trabajo",
    requiredPpe: ["Guantes de látex", "Delantal impermeable", "Calzado antideslizante", "Tapabocas (cuando se requiera)"],
    requiredExams: ["Examen médico ocupacional general", "Valoración osteomuscular", "Pruebas de sensibilización alérgica"],
    requiredTrainings: ["Manejo seguro de productos químicos", "Segregación de residuos", "Prevención de caídas", "Uso de EPP"],
  },
  "Vigilante de Seguridad": {
    name: "Vigilante de Seguridad",
    department: "Seguridad",
    description: "Controlar acceso a instalaciones, realizar rondas de seguridad, monitorear sistemas de alarma y cámaras, reportar novedades, atender emergencias, custodiar bienes de la empresa.",
    riskClass: "III",
    riskFactors: ["Turnos nocturnos", "Exposición a intemperie", "Riesgo de agresión", "Estrés por vigilancia constante", "Sedentarismo durante guardia"],
    physicalDemands: "Recorridos frecuentes, estar de pie prolongadamente, atención visual constante",
    mentalDemands: "Atención sostenida, vigilancia constante, toma de decisiones rápidas, manejo de situaciones de riesgo",
    requiredPpe: ["Chaleco reflectivo", "Linterna", "Radio de comunicación", "Calzado cerrado"],
    requiredExams: ["Examen médico ocupacional general", "Visiometría", "Audiometría", "Valoración psicológica"],
    requiredTrainings: ["Técnicas de vigilancia", "Manejo de situaciones de riesgo", "Primeros auxilios", "Plan de emergencias"],
  },
  "Ingeniero Industrial": {
    name: "Ingeniero Industrial",
    department: "Ingeniería",
    description: "Optimizar procesos productivos, analizar tiempos y métodos, implementar mejoras de productividad, diseñar layouts de planta, gestionar proyectos de mejora continua.",
    riskClass: "I",
    riskFactors: ["Estrés laboral", "Sedentarismo", "Exposición a pantallas", "Desplazamientos ocasionales a planta"],
    physicalDemands: "Trabajo en oficina con desplazamientos ocasionales a planta, actividad física leve",
    mentalDemands: "Análisis de datos, pensamiento sistémico, innovación, gestión de proyectos, toma de decisiones basada en datos",
    requiredPpe: ["Casco de seguridad (para visitas a planta)", "Botas de seguridad (para visitas a planta)"],
    requiredExams: ["Examen médico ocupacional general", "Evaluación visual"],
    requiredTrainings: ["Lean Manufacturing", "Six Sigma", "Gestión de proyectos", "Análisis de procesos"],
  },
  "Técnico de Calidad": {
    name: "Técnico de Calidad",
    department: "Calidad",
    description: "Realizar inspecciones de calidad, tomar muestras, ejecutar pruebas de laboratorio, documentar no conformidades, calibrar equipos de medición, asegurar cumplimiento de especificaciones.",
    riskClass: "II",
    riskFactors: ["Exposición a productos químicos", "Movimientos repetitivos", "Exposición a maquinaria", "Precisión extrema requerida"],
    physicalDemands: "Estar de pie frecuentemente, destreza manual fina, coordinación ojo-mano",
    mentalDemands: "Atención extrema al detalle, precisión, análisis de resultados, documentación rigurosa",
    requiredPpe: ["Bata de laboratorio", "Gafas de seguridad", "Guantes", "Calzado cerrado"],
    requiredExams: ["Examen médico ocupacional general", "Visiometría", "Valoración osteomuscular"],
    requiredTrainings: ["Control de calidad", "Metrología", "Buenas prácticas de laboratorio", "ISO 9001"],
  },
  "Operador de Montacargas": {
    name: "Operador de Montacargas",
    department: "Logística",
    description: "Operar montacargas para carga y descarga, transportar materiales dentro de bodega, apilar mercancías, realizar mantenimiento preventivo básico, cumplir normativa de seguridad en operación.",
    riskClass: "IV",
    riskFactors: ["Atropellamiento", "Volcamiento de carga", "Atrapamiento", "Caída de objetos", "Vibración", "Ruido"],
    physicalDemands: "Coordinación visomotora, estar sentado prolongadamente en montacargas, movimientos repetitivos",
    mentalDemands: "Atención sostenida, percepción espacial, toma de decisiones rápidas, coordinación",
    requiredPpe: ["Casco de seguridad", "Botas con puntera de acero", "Chaleco reflectivo", "Guantes"],
    requiredExams: ["Examen médico ocupacional para operación de montacargas", "Visiometría", "Audiometría", "Valoración osteomuscular"],
    requiredTrainings: ["Operación segura de montacargas (certificación)", "Manejo de cargas", "Señalización de tránsito interno", "Prevención de riesgos en bodega"],
  },
};

export default function PerfilesCargo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<JobProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    riskClass: "I" as "I" | "II" | "III" | "IV" | "V",
    riskFactors: [] as string[],
    physicalDemands: "",
    mentalDemands: "",
    requiredPpe: [] as string[],
    requiredExams: [] as string[],
    examFrequencyMonths: 24,
    requiredTrainings: [] as string[],
    isActive: 1,
  });

  const { data: profiles = [], isLoading } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertJobProfileSchema>) => {
      const res = await apiRequest("POST", "/api/job-profiles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Perfil creado",
        description: "El perfil de cargo se ha creado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertJobProfileSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/job-profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      setDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      toast({
        title: "Perfil actualizado",
        description: "El perfil de cargo se ha actualizado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/job-profiles/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.details) {
          throw new Error(data.details);
        }
        throw new Error(data?.message || "Error al eliminar el perfil");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      toast({
        title: "Perfil eliminado",
        description: "El perfil de cargo se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "No se puede eliminar el perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      riskClass: "I",
      riskFactors: [],
      physicalDemands: "",
      mentalDemands: "",
      requiredPpe: [],
      requiredExams: [],
      examFrequencyMonths: 24,
      requiredTrainings: [],
      isActive: 1,
    });
  };

  const handleEdit = (profile: JobProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description,
      riskClass: profile.riskClass,
      riskFactors: profile.riskFactors || [],
      physicalDemands: profile.physicalDemands || "",
      mentalDemands: profile.mentalDemands || "",
      requiredPpe: profile.requiredPpe || [],
      requiredExams: profile.requiredExams || [],
      examFrequencyMonths: profile.examFrequencyMonths || 24,
      requiredTrainings: profile.requiredTrainings || [],
      isActive: profile.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, data: formData });
    } else {
      createProfileMutation.mutate(formData);
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (riskClass: string) => {
    const colors = {
      "I": "bg-green-500",
      "II": "bg-blue-500",
      "III": "bg-yellow-500",
      "IV": "bg-orange-500",
      "V": "bg-red-500"
    };
    return colors[riskClass as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Perfiles de Cargo</h1>
          <p className="text-muted-foreground">Gestión de perfiles de cargo con clasificación de riesgo ARL</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingProfile(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-profile">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProfile ? "Editar Perfil" : "Nuevo Perfil de Cargo"}</DialogTitle>
              <DialogDescription>
                Complete la información del perfil según Resolución 1843/2025
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nombre del Cargo *</Label>
                  <Select
                    value={formData.name in PREDEFINED_PROFILES ? formData.name : "__custom__"}
                    onValueChange={(value) => {
                      if (value === "__custom__") {
                        // No hacer nada, el usuario ingresará el nombre manualmente
                        setFormData({ ...formData, name: "" });
                      } else {
                        // Auto-llenar todos los campos según el cargo seleccionado
                        const profile = PREDEFINED_PROFILES[value];
                        if (profile && !editingProfile) {
                          setFormData({
                            ...formData,
                            name: profile.name,
                            description: profile.description,
                            riskClass: profile.riskClass,
                            riskFactors: profile.riskFactors,
                            physicalDemands: profile.physicalDemands,
                            mentalDemands: profile.mentalDemands,
                            requiredPpe: profile.requiredPpe,
                            requiredExams: profile.requiredExams,
                            examFrequencyMonths: examFrequencyByRisk[profile.riskClass],
                            requiredTrainings: profile.requiredTrainings,
                          });
                        } else {
                          setFormData({ ...formData, name: value });
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="name-select" data-testid="select-profile-name">
                      <SelectValue placeholder="Seleccione un cargo predefinido o personalizado" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="__custom__">
                        ✏️ Cargo Personalizado (ingrese manualmente)
                      </SelectItem>
                      {Object.keys(PREDEFINED_PROFILES).sort().map((profileName) => (
                        <SelectItem key={profileName} value={profileName}>
                          {profileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(formData.name === "" || !(formData.name in PREDEFINED_PROFILES)) && (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ingrese el nombre del cargo personalizado"
                      required
                      data-testid="input-custom-profile-name"
                      className="mt-2"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Seleccione un cargo predefinido para auto-llenar todos los campos, o cree uno personalizado ingresando el nombre manualmente.
                  </p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción de Funciones *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción detallada de las funciones y responsabilidades"
                    required
                    rows={3}
                    data-testid="input-profile-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskClass">Clase de Riesgo ARL *</Label>
                  <Select
                    value={formData.riskClass}
                    onValueChange={(value: any) => {
                      setFormData({ 
                        ...formData, 
                        riskClass: value,
                        examFrequencyMonths: examFrequencyByRisk[value as keyof typeof examFrequencyByRisk]
                      });
                    }}
                  >
                    <SelectTrigger id="riskClass" data-testid="select-risk-class">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Clase I - Riesgo Mínimo ({getArlRate("I").initialRate}%)</SelectItem>
                      <SelectItem value="II">Clase II - Riesgo Bajo ({getArlRate("II").initialRate}%)</SelectItem>
                      <SelectItem value="III">Clase III - Riesgo Medio ({getArlRate("III").initialRate}%)</SelectItem>
                      <SelectItem value="IV">Clase IV - Riesgo Alto ({getArlRate("IV").initialRate}%)</SelectItem>
                      <SelectItem value="V">Clase V - Riesgo Máximo ({getArlRate("V").initialRate}%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getArlRate(formData.riskClass).description}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examFrequency">Frecuencia Exámenes (meses)</Label>
                  <Input
                    id="examFrequency"
                    type="number"
                    value={formData.examFrequencyMonths}
                    onChange={(e) => setFormData({ ...formData, examFrequencyMonths: parseInt(e.target.value) })}
                    min={1}
                    data-testid="input-exam-frequency"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physicalDemands">Demandas Físicas</Label>
                  <Textarea
                    id="physicalDemands"
                    value={formData.physicalDemands}
                    onChange={(e) => setFormData({ ...formData, physicalDemands: e.target.value })}
                    placeholder="Ej: Levantamiento de carga, trabajo de pie prolongado"
                    rows={2}
                    data-testid="input-physical-demands"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentalDemands">Demandas Mentales/Cognitivas</Label>
                  <Textarea
                    id="mentalDemands"
                    value={formData.mentalDemands}
                    onChange={(e) => setFormData({ ...formData, mentalDemands: e.target.value })}
                    placeholder="Ej: Atención sostenida, toma de decisiones rápidas"
                    rows={2}
                    data-testid="input-mental-demands"
                  />
                </div>
              </div>

              <ArrayInput
                label="Factores de Riesgo Específicos"
                placeholder="Ej: Exposición a ruido, trabajo en altura"
                value={formData.riskFactors}
                onChange={(values) => setFormData(prev => ({ ...prev, riskFactors: values }))}
                testId="risk-factor"
              />

              <ArrayInput
                label="Elementos de Protección Personal (EPP)"
                placeholder="Ej: Casco, guantes, gafas de seguridad"
                value={formData.requiredPpe}
                onChange={(values) => setFormData(prev => ({ ...prev, requiredPpe: values }))}
                testId="ppe"
              />

              <ArrayInput
                label="Exámenes Médicos Requeridos"
                placeholder="Ej: Audiometría, espirometría, optometría"
                value={formData.requiredExams}
                onChange={(values) => setFormData(prev => ({ ...prev, requiredExams: values }))}
                testId="exam"
              />

              <ArrayInput
                label="Capacitaciones Obligatorias"
                placeholder="Ej: Trabajo en altura, manejo de químicos"
                value={formData.requiredTrainings}
                onChange={(values) => setFormData(prev => ({ ...prev, requiredTrainings: values }))}
                testId="training"
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingProfile(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save">
                  {editingProfile ? "Actualizar" : "Crear"} Perfil
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar perfil..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          data-testid="input-search"
        />
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No hay perfiles de cargo registrados
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover-elevate" data-testid={`card-profile-${profile.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <CardTitle className="text-base">{profile.name}</CardTitle>
                  </div>
                  <Badge className={`${getRiskColor(profile.riskClass)} text-white flex-shrink-0`}>
                    Clase {profile.riskClass}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{profile.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Tasa ARL:</span>
                  <span className="font-semibold">{getArlRate(profile.riskClass).initialRate}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Exámenes cada:</span>
                  <span className="font-semibold">{profile.examFrequencyMonths} meses</span>
                </div>
                {profile.riskFactors && profile.riskFactors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Factores de riesgo:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.riskFactors.slice(0, 3).map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                      {profile.riskFactors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.riskFactors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(profile)}
                    data-testid={`button-edit-${profile.id}`}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      let message = "¿Está seguro de eliminar este perfil?";
                      message += "\n\nNota: Si el perfil tiene trabajadores, exámenes médicos o designaciones de alto riesgo asociadas, el sistema no permitirá la eliminación hasta que sean desasociados.";
                      
                      if (confirm(message)) {
                        deleteProfileMutation.mutate(profile.id);
                      }
                    }}
                    data-testid={`button-delete-${profile.id}`}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
