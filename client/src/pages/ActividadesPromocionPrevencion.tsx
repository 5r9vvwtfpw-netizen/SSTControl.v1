import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PromotionPreventionActivity, SveProgram } from "@shared/schema";
import { getTodayDateString } from "@/lib/utils/formatters";
import { insertPromotionPreventionActivitySchema, insertSveProgramSchema } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Users, 
  Activity, 
  Heart, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Calendar,
  Stethoscope,
  ClipboardList,
  Search,
  Filter,
  Edit,
  Trash2,
  Link2,
  Target,
  TrendingUp,
  Clock,
  CalendarDays
} from "lucide-react";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const normativaPromocionPrevencion = [
  {
    codigo: 'DEC-1072-2.2.4.6.24',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.24',
    descripcion: 'Medidas de prevención y control',
    requisitos: [
      'Implementar medidas de prevención y promoción de la salud',
      'Actividades acordes con riesgos identificados',
      'Cobertura a todos los trabajadores expuestos',
      'Seguimiento a efectividad de las actividades'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-3.1.2',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 3.1.2',
    descripcion: 'Actividades de promoción y prevención en salud',
    requisitos: [
      'Programa de medicina del trabajo documentado',
      'Actividades de promoción de la salud',
      'Actividades de prevención de enfermedades',
      'Vinculación con riesgos prioritarios del IPERC'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-2346-2007',
    norma: 'Resolución 2346/2007',
    articulo: 'Completa',
    descripcion: 'Evaluaciones médicas ocupacionales',
    requisitos: [
      'Exámenes médicos de ingreso, periódicos y de retiro',
      'Seguimiento a condiciones de salud',
      'Programas de vigilancia epidemiológica',
      'Integración con actividades preventivas'
    ],
    obligatorio: true
  }
];

const activityTypeLabels: Record<string, string> = {
  medicina_trabajo: "Medicina del Trabajo",
  promocion_prevencion: "Promoción y Prevención",
  campana_especial: "Campaña Especial",
  examen_ocupacional: "Examen Ocupacional",
  capacitacion_salud: "Capacitación en Salud"
};

const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  mixta: "Mixta"
};

const frequencyLabels: Record<string, string> = {
  unica: "Única",
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual"
};

const statusLabels: Record<string, string> = {
  programada: "Programada",
  en_ejecucion: "En Ejecución",
  completada: "Completada",
  cancelada: "Cancelada"
};

const riskTypeLabels: Record<string, string> = {
  biomecanico: "Biomecánico",
  psicosocial: "Psicosocial",
  auditivo: "Auditivo",
  quimico: "Químico",
  biologico: "Biológico",
  visual: "Visual",
  cardiovascular: "Cardiovascular",
  respiratorio: "Respiratorio"
};

type ActivityTemplate = {
  id: string;
  title: string;
  activityType: "medicina_trabajo" | "promocion_prevencion" | "campana_especial" | "examen_ocupacional" | "capacitacion_salud";
  objective: string;
  description: string;
  targetPopulation: string;
  frequency: "unica" | "diaria" | "semanal" | "quincenal" | "mensual" | "trimestral" | "semestral" | "anual";
  modality: "presencial" | "virtual" | "mixta";
  priorityRiskType: string;
  responsiblePosition: string;
};

const activityTemplates: ActivityTemplate[] = [
  {
    id: "vacunacion_influenza",
    title: "Jornada de Vacunación contra la Influenza",
    activityType: "promocion_prevencion",
    objective: "Prevenir enfermedades respiratorias mediante la aplicación de vacuna contra la influenza a toda la población trabajadora",
    description: "Campaña anual de vacunación con vacuna tetravalente en coordinación con IPS autorizada. Incluye consentimiento informado y registro de dosis.",
    targetPopulation: "Todos los trabajadores",
    frequency: "anual",
    modality: "presencial",
    priorityRiskType: "biologico",
    responsiblePosition: "Médico Ocupacional"
  },
  {
    id: "pausas_activas",
    title: "Programa de Pausas Activas",
    activityType: "promocion_prevencion",
    objective: "Prevenir desórdenes musculoesqueléticos mediante ejercicios de estiramiento y movilidad articular durante la jornada laboral",
    description: "Sesiones de 10-15 minutos de ejercicios guiados enfocados en grupos musculares según exposición al riesgo biomecánico.",
    targetPopulation: "Trabajadores con exposición a riesgo biomecánico",
    frequency: "diaria",
    modality: "presencial",
    priorityRiskType: "biomecanico",
    responsiblePosition: "Fisioterapeuta"
  },
  {
    id: "examenes_periodicos",
    title: "Exámenes Médicos Ocupacionales Periódicos",
    activityType: "examen_ocupacional",
    objective: "Evaluar el estado de salud de los trabajadores y detectar tempranamente alteraciones relacionadas con la exposición ocupacional",
    description: "Evaluación médica según profesiograma y matriz de riesgos. Incluye paraclínicos según exposición (audiometría, espirometría, optometría, etc.)",
    targetPopulation: "Trabajadores según cronograma de exámenes periódicos",
    frequency: "anual",
    modality: "presencial",
    priorityRiskType: "none",
    responsiblePosition: "Médico Ocupacional con licencia SST"
  },
  {
    id: "riesgo_psicosocial",
    title: "Intervención de Riesgo Psicosocial",
    activityType: "promocion_prevencion",
    objective: "Promover la salud mental y prevenir el estrés laboral mediante estrategias de intervención según diagnóstico de riesgo psicosocial",
    description: "Talleres de manejo del estrés, comunicación asertiva, resolución de conflictos y equilibrio vida-trabajo según Res. 2646/2008 y Res. 2404/2019.",
    targetPopulation: "Trabajadores con exposición a riesgo psicosocial medio o alto",
    frequency: "trimestral",
    modality: "presencial",
    priorityRiskType: "psicosocial",
    responsiblePosition: "Psicólogo con licencia SST"
  },
  {
    id: "conservacion_auditiva",
    title: "Programa de Conservación Auditiva",
    activityType: "medicina_trabajo",
    objective: "Prevenir la hipoacusia neurosensorial inducida por ruido mediante control de exposición y seguimiento audiométrico",
    description: "Incluye audiometrías de control, capacitación en uso de EPP auditivo, señalización de áreas y mediciones de ruido ocupacional.",
    targetPopulation: "Trabajadores expuestos a niveles de ruido superiores a 80 dB(A)",
    frequency: "semestral",
    modality: "presencial",
    priorityRiskType: "auditivo",
    responsiblePosition: "Médico Ocupacional / Fonoaudiólogo"
  },
  {
    id: "salud_visual",
    title: "Jornada de Salud Visual",
    activityType: "campana_especial",
    objective: "Evaluar la salud visual de los trabajadores y detectar alteraciones que requieran corrección óptica o tratamiento",
    description: "Tamizaje visual, optometría y asesoría para usuarios de PVD. Incluye recomendaciones ergonómicas para puestos de trabajo.",
    targetPopulation: "Trabajadores administrativos y usuarios de pantallas de visualización",
    frequency: "anual",
    modality: "presencial",
    priorityRiskType: "visual",
    responsiblePosition: "Optómetra"
  },
  {
    id: "riesgo_cardiovascular",
    title: "Programa de Riesgo Cardiovascular",
    activityType: "medicina_trabajo",
    objective: "Identificar y controlar factores de riesgo cardiovascular en la población trabajadora para prevenir eventos coronarios",
    description: "Evaluación de factores de riesgo (HTA, diabetes, dislipidemia, tabaquismo, sedentarismo), estratificación de riesgo y plan de intervención individualizado.",
    targetPopulation: "Trabajadores mayores de 40 años o con factores de riesgo identificados",
    frequency: "anual",
    modality: "presencial",
    priorityRiskType: "cardiovascular",
    responsiblePosition: "Médico Ocupacional"
  },
  {
    id: "capacitacion_epp",
    title: "Capacitación en Uso y Mantenimiento de EPP",
    activityType: "capacitacion_salud",
    objective: "Garantizar el uso correcto de los elementos de protección personal según los riesgos identificados en el puesto de trabajo",
    description: "Formación teórico-práctica sobre selección, uso, mantenimiento y almacenamiento de EPP. Evaluación de competencias y registro de entrega.",
    targetPopulation: "Trabajadores operativos y de mantenimiento",
    frequency: "semestral",
    modality: "presencial",
    priorityRiskType: "none",
    responsiblePosition: "Profesional SST"
  },
  {
    id: "prevencion_sustancias",
    title: "Programa de Prevención de Consumo de Sustancias Psicoactivas",
    activityType: "promocion_prevencion",
    objective: "Prevenir el consumo de alcohol, tabaco y sustancias psicoactivas y promover estilos de vida saludables",
    description: "Campaña de sensibilización, talleres informativos, apoyo para cesación tabáquica y detección temprana según Res. 1075/1992.",
    targetPopulation: "Todos los trabajadores",
    frequency: "trimestral",
    modality: "mixta",
    priorityRiskType: "psicosocial",
    responsiblePosition: "Psicólogo / Médico Ocupacional"
  },
  {
    id: "ergonomia_puestos",
    title: "Evaluación Ergonómica de Puestos de Trabajo",
    activityType: "medicina_trabajo",
    objective: "Identificar y corregir factores de riesgo ergonómico en los puestos de trabajo para prevenir desórdenes musculoesqueléticos",
    description: "Análisis de puestos mediante métodos RULA, REBA, OCRA según corresponda. Recomendaciones de ajuste y seguimiento a implementación.",
    targetPopulation: "Trabajadores con sintomatología osteomuscular o puestos críticos",
    frequency: "semestral",
    modality: "presencial",
    priorityRiskType: "biomecanico",
    responsiblePosition: "Fisioterapeuta / Ergónomo"
  },
  {
    id: "primeros_auxilios",
    title: "Capacitación en Primeros Auxilios",
    activityType: "capacitacion_salud",
    objective: "Formar brigadistas y personal clave en técnicas de primeros auxilios para respuesta ante emergencias médicas",
    description: "Curso teórico-práctico de 16 horas incluyendo RCP, manejo de hemorragias, fracturas, quemaduras y evacuación de lesionados.",
    targetPopulation: "Brigadistas de emergencias y personal designado",
    frequency: "anual",
    modality: "presencial",
    priorityRiskType: "none",
    responsiblePosition: "Instructor certificado en primeros auxilios"
  },
  {
    id: "higiene_postural",
    title: "Taller de Higiene Postural",
    activityType: "capacitacion_salud",
    objective: "Educar a los trabajadores sobre posturas correctas durante la jornada laboral para prevenir lesiones de columna",
    description: "Taller teórico-práctico sobre mecánica corporal, posturas correctas, técnicas de levantamiento de cargas y ejercicios preventivos.",
    targetPopulation: "Personal operativo y administrativo",
    frequency: "trimestral",
    modality: "presencial",
    priorityRiskType: "biomecanico",
    responsiblePosition: "Fisioterapeuta"
  }
];

type ActivityFormData = {
  title: string;
  activityType: "medicina_trabajo" | "promocion_prevencion" | "campana_especial" | "examen_ocupacional" | "capacitacion_salud";
  objective: string;
  scope: string;
  description: string;
  modality: "presencial" | "virtual" | "mixta";
  frequency: "unica" | "diaria" | "semanal" | "quincenal" | "mensual" | "trimestral" | "semestral" | "anual";
  startDate: string;
  endDate: string;
  responsibleName: string;
  responsiblePosition: string;
  targetPopulation: string;
  estimatedParticipants: number;
  sveProgramId: string;
  priorityRiskType: string;
  status: "programada" | "en_ejecucion" | "completada" | "cancelada";
};

const initialFormData: ActivityFormData = {
  title: "",
  activityType: "promocion_prevencion",
  objective: "",
  scope: "",
  description: "",
  modality: "presencial",
  frequency: "unica",
  startDate: "",
  endDate: "",
  responsibleName: "",
  responsiblePosition: "",
  targetPopulation: "",
  estimatedParticipants: 0,
  sveProgramId: "none",
  priorityRiskType: "none",
  status: "programada",
};

export default function ActividadesPromocionPrevencion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PromotionPreventionActivity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("resumen");
  const [formData, setFormData] = useState<ActivityFormData>(initialFormData);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [isDownloading, setIsDownloading] = useState(false);
  const [sveDialogOpen, setSveDialogOpen] = useState(false);
  const [sveFormData, setSveFormData] = useState({
    name: "",
    riskType: "" as "" | "biomecanico" | "psicosocial" | "auditivo" | "quimico" | "biologico" | "visual" | "cardiovascular" | "respiratorio",
    objective: "",
    targetPopulation: "",
    protocol: "",
    responsibleName: "",
    responsiblePosition: "",
    startDate: "",
    reviewDate: "",
    status: "activo" as "activo" | "inactivo" | "en_revision"
  });

  const { data: activities = [], isLoading } = useQuery<PromotionPreventionActivity[]>({
    queryKey: ["/api/promotion-prevention/activities"],
  });

  const { data: svePrograms = [] } = useQuery<SveProgram[]>({
    queryKey: ["/api/sve-programs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/promotion-prevention/activities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotion-prevention/activities"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Actividad creada",
        description: "La actividad de promoción y prevención se ha creado exitosamente",
        className: "bg-green-50 border-green-200",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/promotion-prevention/activities/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotion-prevention/activities"] });
      setDialogOpen(false);
      setEditingActivity(null);
      resetForm();
      toast({
        title: "Actividad actualizada",
        description: "La actividad se ha actualizado exitosamente",
        className: "bg-green-50 border-green-200",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/promotion-prevention/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotion-prevention/activities"] });
      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado exitosamente",
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

  const createSveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/sve-programs", data);
      return res.json();
    },
    onSuccess: (newProgram: SveProgram) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-programs"] });
      setSveDialogOpen(false);
      setFormData({ ...formData, sveProgramId: newProgram.id });
      setSveFormData({
        name: "",
        riskType: "biomecanico",
        objective: "",
        targetPopulation: "",
        protocol: "",
        responsibleName: "",
        responsiblePosition: "",
        startDate: "",
        reviewDate: "",
        status: "activo"
      });
      toast({
        title: "Programa SVE creado",
        description: "El programa de vigilancia epidemiológica se ha creado y vinculado exitosamente",
        className: "bg-green-50 border-green-200",
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

  const handleCreateSve = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: Record<string, unknown> = {
      ...sveFormData,
      startDate: sveFormData.startDate || getTodayDateString(),
      reviewDate: sveFormData.reviewDate || null,
    };
    createSveMutation.mutate(submitData);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingActivity(null);
    setSelectedTemplate("none");
  };

  const handleEdit = (activity: PromotionPreventionActivity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      activityType: activity.activityType as ActivityFormData["activityType"],
      objective: activity.objective,
      scope: activity.scope || "",
      description: activity.description || "",
      modality: activity.modality as ActivityFormData["modality"],
      frequency: activity.frequency as ActivityFormData["frequency"],
      startDate: activity.startDate,
      endDate: activity.endDate || "",
      responsibleName: activity.responsibleName,
      responsiblePosition: activity.responsiblePosition || "",
      targetPopulation: activity.targetPopulation,
      estimatedParticipants: activity.estimatedParticipants || 0,
      sveProgramId: activity.sveProgramId || "none",
      priorityRiskType: activity.priorityRiskType || "none",
      status: activity.status as ActivityFormData["status"],
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Record<string, unknown> = {
      ...formData,
      sveProgramId: formData.sveProgramId && formData.sveProgramId !== "none" ? formData.sveProgramId : null,
      priorityRiskType: formData.priorityRiskType && formData.priorityRiskType !== "none" ? formData.priorityRiskType : null,
      endDate: formData.endDate || null,
      estimatedParticipants: formData.estimatedParticipants || null,
    };

    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta actividad?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch('/api/reportes/promocion-prevencion/pdf', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al descargar el documento');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promocion-prevencion-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Documento descargado",
        description: "El PDF de actividades de promoción y prevención se ha descargado exitosamente",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      toast({
        title: "Error al descargar",
        description: error.message || "No se pudo generar el documento PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const stats = useMemo(() => {
    const total = activities.length;
    const programadas = activities.filter(a => a.status === "programada").length;
    const enEjecucion = activities.filter(a => a.status === "en_ejecucion").length;
    const completadas = activities.filter(a => a.status === "completada").length;
    const canceladas = activities.filter(a => a.status === "cancelada").length;
    
    const totalEstimatedParticipants = activities.reduce((sum, a) => sum + (a.estimatedParticipants || 0), 0);
    const totalActualParticipants = activities.reduce((sum, a) => sum + (a.actualParticipants || 0), 0);
    const coveragePercent = totalEstimatedParticipants > 0 
      ? Math.round((totalActualParticipants / totalEstimatedParticipants) * 100) 
      : 0;
    
    const activitiesWithSve = activities.filter(a => a.sveProgramId).length;
    const sveVinculationPercent = total > 0 ? Math.round((activitiesWithSve / total) * 100) : 0;

    const medicinaTrabajo = activities.filter(a => a.activityType === "medicina_trabajo");
    const promocionPrevencion = activities.filter(a => 
      a.activityType === "promocion_prevencion" || 
      a.activityType === "campana_especial" ||
      a.activityType === "capacitacion_salud"
    );

    return {
      total,
      programadas,
      enEjecucion,
      completadas,
      canceladas,
      coveragePercent,
      sveVinculationPercent,
      medicinaTrabajo,
      promocionPrevencion,
      activitiesWithSve
    };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = searchTerm === "" || 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.objective.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
      const matchesType = typeFilter === "all" || activity.activityType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [activities, searchTerm, statusFilter, typeFilter]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "programada": return "bg-blue-500";
      case "en_ejecucion": return "bg-yellow-500";
      case "completada": return "bg-green-500";
      case "cancelada": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getActivityTypeBadgeColor = (type: string) => {
    switch (type) {
      case "medicina_trabajo": return "bg-purple-500";
      case "promocion_prevencion": return "bg-green-500";
      case "campana_especial": return "bg-orange-500";
      case "examen_ocupacional": return "bg-blue-500";
      case "capacitacion_salud": return "bg-teal-500";
      default: return "bg-gray-500";
    }
  };

  const complianceChecklist = [
    { id: 1, item: "Programa de medicina del trabajo documentado", completed: stats.medicinaTrabajo.length > 0 },
    { id: 2, item: "Actividades de promoción de la salud programadas", completed: stats.promocionPrevencion.length > 0 },
    { id: 3, item: "Vinculación con riesgos prioritarios del IPERC", completed: activities.some(a => a.priorityRiskType) },
    { id: 4, item: "Integración con programas de vigilancia epidemiológica", completed: stats.activitiesWithSve > 0 },
    { id: 5, item: "Cobertura de población trabajadora definida", completed: activities.every(a => a.targetPopulation) },
    { id: 6, item: "Responsables asignados a las actividades", completed: activities.every(a => a.responsibleName) },
    { id: 7, item: "Cronograma de actividades establecido", completed: activities.length > 0 && activities.some(a => a.startDate) },
    { id: 8, item: "Seguimiento a ejecución de actividades", completed: stats.enEjecucion > 0 || stats.completadas > 0 },
  ];

  const completedItems = complianceChecklist.filter(item => item.completed).length;
  const compliancePercentage = Math.round((completedItems / complianceChecklist.length) * 100);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Actividades de Promoción y Prevención en Salud
          </h1>
          <p className="text-muted-foreground">
            Estándar 3.1.2 - Resolución 0312/2019
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            data-testid="button-download-pdf"
          >
            {isDownloading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </>
            )}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-activity">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Actividad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingActivity ? "Editar Actividad" : "Nueva Actividad de Promoción y Prevención"}</DialogTitle>
                <DialogDescription>
                  {editingActivity 
                    ? "Modifique los datos de la actividad conforme a Res. 0312/2019 Art. 16"
                    : "Registre una actividad alineada con el estándar 3.1.2 - Res. 0312/2019"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Normativa aplicable:</strong> Dec. 1072/2015 Art. 2.2.4.6.24 - Las actividades deben responder al perfil epidemiológico y riesgos prioritarios identificados en la matriz de peligros.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Información General</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="activityTemplate">Seleccionar Actividad (Catálogo SST)</Label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={(templateId) => {
                          setSelectedTemplate(templateId);
                          if (templateId !== "none") {
                            const template = activityTemplates.find(t => t.id === templateId);
                            if (template) {
                              const matchingSveProgram = svePrograms.find(
                                (p) => p.riskType?.toLowerCase() === template.priorityRiskType?.toLowerCase()
                              );
                              setFormData({
                                ...formData,
                                title: template.title,
                                activityType: template.activityType,
                                objective: template.objective,
                                description: template.description,
                                targetPopulation: template.targetPopulation,
                                frequency: template.frequency,
                                modality: template.modality,
                                priorityRiskType: template.priorityRiskType,
                                responsiblePosition: template.responsiblePosition,
                                sveProgramId: matchingSveProgram ? matchingSveProgram.id : "none"
                              });
                            }
                          }
                        }}
                      >
                        <SelectTrigger id="activityTemplate" data-testid="select-activity-template">
                          <SelectValue placeholder="Seleccione una actividad predefinida para autorrellenar..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="none">-- Ingresar actividad personalizada --</SelectItem>
                          <SelectItem value="vacunacion_influenza">Jornada de Vacunación contra la Influenza</SelectItem>
                          <SelectItem value="pausas_activas">Programa de Pausas Activas</SelectItem>
                          <SelectItem value="examenes_periodicos">Exámenes Médicos Ocupacionales Periódicos</SelectItem>
                          <SelectItem value="riesgo_psicosocial">Intervención de Riesgo Psicosocial</SelectItem>
                          <SelectItem value="conservacion_auditiva">Programa de Conservación Auditiva</SelectItem>
                          <SelectItem value="salud_visual">Jornada de Salud Visual</SelectItem>
                          <SelectItem value="riesgo_cardiovascular">Programa de Riesgo Cardiovascular</SelectItem>
                          <SelectItem value="capacitacion_epp">Capacitación en Uso y Mantenimiento de EPP</SelectItem>
                          <SelectItem value="prevencion_sustancias">Programa de Prevención de Consumo de Sustancias Psicoactivas</SelectItem>
                          <SelectItem value="ergonomia_puestos">Evaluación Ergonómica de Puestos de Trabajo</SelectItem>
                          <SelectItem value="primeros_auxilios">Capacitación en Primeros Auxilios</SelectItem>
                          <SelectItem value="higiene_postural">Taller de Higiene Postural</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Seleccione una actividad del catálogo para autorrellenar el formulario, o elija "personalizada" para ingresar manualmente</p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="title">Título de la Actividad *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Jornada de vacunación contra la influenza"
                        required
                        data-testid="input-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activityType">Tipo de Actividad *</Label>
                      <Select
                        value={formData.activityType}
                        onValueChange={(value: ActivityFormData["activityType"]) => 
                          setFormData({ ...formData, activityType: value })
                        }
                      >
                        <SelectTrigger id="activityType" data-testid="select-activity-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medicina_trabajo">Medicina del Trabajo</SelectItem>
                          <SelectItem value="promocion_prevencion">Promoción y Prevención</SelectItem>
                          <SelectItem value="campana_especial">Campaña Especial</SelectItem>
                          <SelectItem value="examen_ocupacional">Examen Ocupacional</SelectItem>
                          <SelectItem value="capacitacion_salud">Capacitación en Salud</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Según clasificación Res. 2346/2007</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: ActivityFormData["status"]) => 
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger id="status" data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programada">Programada</SelectItem>
                          <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="objective">Objetivo de la Actividad *</Label>
                      <Textarea
                        id="objective"
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        placeholder="Describa el objetivo específico alineado con el perfil epidemiológico de la empresa"
                        required
                        data-testid="input-objective"
                      />
                      <p className="text-xs text-muted-foreground">Debe estar alineado con los riesgos identificados en la matriz IPERC</p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Descripción / Metodología</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describa la metodología y actividades específicas a desarrollar"
                        data-testid="input-description"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Población y Alcance</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetPopulation">Población Objetivo *</Label>
                      <Input
                        id="targetPopulation"
                        value={formData.targetPopulation}
                        onChange={(e) => setFormData({ ...formData, targetPopulation: e.target.value })}
                        placeholder="Ej: Trabajadores expuestos a riesgo biomecánico"
                        required
                        data-testid="input-target-population"
                      />
                      <p className="text-xs text-muted-foreground">Según perfil sociodemográfico y exposición a riesgos</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scope">Alcance</Label>
                      <Select
                        value={formData.scope || "toda_empresa"}
                        onValueChange={(value) => setFormData({ ...formData, scope: value })}
                      >
                        <SelectTrigger id="scope" data-testid="select-scope">
                          <SelectValue placeholder="Seleccione alcance..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toda_empresa">Toda la empresa</SelectItem>
                          <SelectItem value="sede_principal">Sede principal</SelectItem>
                          <SelectItem value="sede_secundaria">Sede secundaria</SelectItem>
                          <SelectItem value="todas_sedes">Todas las sedes</SelectItem>
                          <SelectItem value="area_administrativa">Área administrativa</SelectItem>
                          <SelectItem value="area_operativa">Área operativa</SelectItem>
                          <SelectItem value="area_produccion">Área de producción</SelectItem>
                          <SelectItem value="area_comercial">Área comercial</SelectItem>
                          <SelectItem value="area_logistica">Área de logística</SelectItem>
                          <SelectItem value="personal_campo">Personal de campo</SelectItem>
                          <SelectItem value="teletrabajo">Personal en teletrabajo</SelectItem>
                          <SelectItem value="contratistas">Contratistas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedParticipants">Participantes Estimados</Label>
                      <Input
                        id="estimatedParticipants"
                        type="number"
                        min="0"
                        value={formData.estimatedParticipants || ''}
                        onChange={(e) => setFormData({ ...formData, estimatedParticipants: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0 })}
                        placeholder="Número de trabajadores"
                        data-testid="input-estimated-participants"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modality">Modalidad *</Label>
                      <Select
                        value={formData.modality}
                        onValueChange={(value: ActivityFormData["modality"]) => 
                          setFormData({ ...formData, modality: value })
                        }
                      >
                        <SelectTrigger id="modality" data-testid="select-modality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="mixta">Mixta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Link2 className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Vinculación con SST (Res. 0312/2019)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priorityRiskType">Riesgo Prioritario Asociado</Label>
                      <Select
                        value={formData.priorityRiskType}
                        onValueChange={(value) => setFormData({ ...formData, priorityRiskType: value })}
                      >
                        <SelectTrigger id="priorityRiskType" data-testid="select-priority-risk">
                          <SelectValue placeholder="Vincular con riesgo de la matriz IPERC" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin vinculación específica</SelectItem>
                          <SelectItem value="biomecanico">Biomecánico (DME)</SelectItem>
                          <SelectItem value="psicosocial">Psicosocial (Estrés laboral)</SelectItem>
                          <SelectItem value="auditivo">Auditivo (Hipoacusia)</SelectItem>
                          <SelectItem value="quimico">Químico (Intoxicaciones)</SelectItem>
                          <SelectItem value="biologico">Biológico (Enfermedades infecciosas)</SelectItem>
                          <SelectItem value="visual">Visual (Fatiga visual)</SelectItem>
                          <SelectItem value="cardiovascular">Cardiovascular (ECV)</SelectItem>
                          <SelectItem value="respiratorio">Respiratorio (Neumoconiosis)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Vincule con riesgos identificados en IPERC</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sveProgramId">Programa SVE Vinculado</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.sveProgramId}
                          onValueChange={(value) => setFormData({ ...formData, sveProgramId: value })}
                        >
                          <SelectTrigger id="sveProgramId" data-testid="select-sve-program" className="flex-1">
                            <SelectValue placeholder="Vincular con programa de vigilancia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin vinculación a SVE</SelectItem>
                            {svePrograms.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setSveDialogOpen(true)}
                          title="Crear nuevo programa SVE"
                          data-testid="button-create-sve"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Según Dec. 1072/2015 Art. 2.2.4.6.24</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Programación y Responsables</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha de Inicio *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        data-testid="input-start-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fecha de Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        data-testid="input-end-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frecuencia *</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value: ActivityFormData["frequency"]) => 
                          setFormData({ ...formData, frequency: value })
                        }
                      >
                        <SelectTrigger id="frequency" data-testid="select-frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unica">Única</SelectItem>
                          <SelectItem value="diaria">Diaria</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="quincenal">Quincenal</SelectItem>
                          <SelectItem value="mensual">Mensual</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="semestral">Semestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsiblePosition">Cargo del Responsable</Label>
                      <Input
                        id="responsiblePosition"
                        value={formData.responsiblePosition}
                        onChange={(e) => setFormData({ ...formData, responsiblePosition: e.target.value })}
                        placeholder="Ej: Médico Ocupacional, Fisioterapeuta"
                        data-testid="input-responsible-position"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="responsibleName">Nombre del Responsable *</Label>
                      <Select
                        value={formData.responsibleName || "none"}
                        onValueChange={(value) => {
                          if (value === "none") {
                            setFormData({ ...formData, responsibleName: "" });
                          } else if (value === "custom") {
                            setFormData({ ...formData, responsibleName: "" });
                          } else {
                            setFormData({ ...formData, responsibleName: value });
                          }
                        }}
                      >
                        <SelectTrigger id="responsibleName" data-testid="select-responsible-name">
                          <SelectValue placeholder="Seleccione o ingrese el responsable..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Seleccione un responsable --</SelectItem>
                          <SelectItem value="Médico Ocupacional">Médico Ocupacional</SelectItem>
                          <SelectItem value="Fisioterapeuta SST">Fisioterapeuta SST</SelectItem>
                          <SelectItem value="Psicólogo SST">Psicólogo SST</SelectItem>
                          <SelectItem value="Profesional SST">Profesional SST</SelectItem>
                          <SelectItem value="Coordinador SST">Coordinador SST</SelectItem>
                          <SelectItem value="Fonoaudiólogo">Fonoaudiólogo</SelectItem>
                          <SelectItem value="Optómetra">Optómetra</SelectItem>
                          <SelectItem value="Enfermera Ocupacional">Enfermera Ocupacional</SelectItem>
                          <SelectItem value="Higienista Industrial">Higienista Industrial</SelectItem>
                          <SelectItem value="Ergónomo">Ergónomo</SelectItem>
                          <SelectItem value="Instructor Brigadas">Instructor de Brigadas</SelectItem>
                          <SelectItem value="IPS Contratada">IPS Contratada</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Profesional con licencia vigente en salud ocupacional</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Evidencias requeridas (Res. 0312/2019):</strong> Registro de asistencia, evaluación de la actividad, material utilizado, fotografías y resultados de indicadores de cumplimiento.
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!formData.title || !formData.objective || !formData.startDate || !formData.responsibleName || !formData.targetPopulation || createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Guardando..." : editingActivity ? "Actualizar" : "Crear Actividad"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={sveDialogOpen} onOpenChange={setSveDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Programa SVE</DialogTitle>
                <DialogDescription>
                  Cree un nuevo Sistema de Vigilancia Epidemiológica según Dec. 1072/2015 Art. 2.2.4.6.24
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSve} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="sveName">Nombre del Programa SVE *</Label>
                    <Select
                      value={sveFormData.riskType || undefined}
                      onValueChange={(value: "biomecanico" | "psicosocial" | "auditivo" | "quimico" | "biologico" | "visual" | "cardiovascular" | "respiratorio") => {
                        const sveNames: Record<string, string> = {
                          biomecanico: "SVE Riesgo Biomecánico (DME)",
                          psicosocial: "SVE Riesgo Psicosocial",
                          auditivo: "SVE Conservación Auditiva",
                          quimico: "SVE Riesgo Químico",
                          biologico: "SVE Riesgo Biológico",
                          visual: "SVE Conservación Visual",
                          cardiovascular: "SVE Riesgo Cardiovascular",
                          respiratorio: "SVE Riesgo Respiratorio"
                        };
                        const sveObjectives: Record<string, string> = {
                          biomecanico: "Prevenir, identificar y controlar los Desórdenes Músculo Esqueléticos (DME) en trabajadores expuestos a factores de riesgo biomecánico mediante vigilancia activa y medidas de intervención",
                          psicosocial: "Identificar, evaluar, prevenir e intervenir los factores de riesgo psicosocial intralaborales, extralaborales y condiciones individuales que afecten la salud mental de los trabajadores",
                          auditivo: "Prevenir y detectar tempranamente la pérdida auditiva inducida por ruido (PAIR) en trabajadores expuestos a niveles de ruido ocupacional superiores a 80 dB(A)",
                          quimico: "Prevenir y controlar los efectos adversos en la salud de los trabajadores expuestos a sustancias químicas mediante monitoreo biológico y ambiental",
                          biologico: "Prevenir y controlar las infecciones y enfermedades derivadas de la exposición ocupacional a agentes biológicos (virus, bacterias, hongos, parásitos)",
                          visual: "Detectar, prevenir y controlar las alteraciones visuales en trabajadores expuestos a fatiga visual, radiaciones y pantallas de visualización de datos (PVD)",
                          cardiovascular: "Identificar y controlar los factores de riesgo cardiovascular en la población trabajadora mediante promoción de estilos de vida saludables y seguimiento médico",
                          respiratorio: "Prevenir y detectar tempranamente las enfermedades respiratorias ocupacionales mediante vigilancia médica y control de exposición a material particulado y aerosoles"
                        };
                        const svePopulations: Record<string, string> = {
                          biomecanico: "Trabajadores con exposición a posturas prolongadas, movimientos repetitivos y manipulación manual de cargas",
                          psicosocial: "Todos los trabajadores de la organización según perfil de exposición a factores psicosociales",
                          auditivo: "Trabajadores expuestos a niveles de ruido ocupacional ≥80 dB(A) TWA",
                          quimico: "Trabajadores que manipulan, almacenan o están expuestos a sustancias químicas",
                          biologico: "Personal de salud y trabajadores con exposición a fluidos corporales o agentes biológicos",
                          visual: "Trabajadores usuarios de PVD (pantallas), operadores de microscopios y expuestos a radiaciones",
                          cardiovascular: "Trabajadores mayores de 40 años o con factores de riesgo cardiovascular identificados",
                          respiratorio: "Trabajadores expuestos a material particulado, humos, vapores y aerosoles"
                        };
                        const sveResponsibles: Record<string, string> = {
                          biomecanico: "Fisioterapeuta SST",
                          psicosocial: "Psicólogo SST",
                          auditivo: "Fonoaudiólogo",
                          quimico: "Médico Ocupacional",
                          biologico: "Médico Ocupacional",
                          visual: "Optómetra",
                          cardiovascular: "Médico Ocupacional",
                          respiratorio: "Médico Ocupacional"
                        };
                        const today = getTodayDateString();
                        const nextYear = new Date();
                        nextYear.setFullYear(nextYear.getFullYear() + 1);
                        const reviewDate = nextYear.toISOString().split('T')[0];
                        
                        setSveFormData({ 
                          ...sveFormData, 
                          name: sveNames[value] || "",
                          riskType: value,
                          objective: sveObjectives[value] || "",
                          targetPopulation: svePopulations[value] || "",
                          responsibleName: sveResponsibles[value] || "",
                          startDate: today,
                          reviewDate: reviewDate
                        });
                      }}
                    >
                      <SelectTrigger data-testid="select-sve-name">
                        <SelectValue placeholder="Seleccione el tipo de programa SVE..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="biomecanico">SVE Riesgo Biomecánico (DME)</SelectItem>
                        <SelectItem value="psicosocial">SVE Riesgo Psicosocial</SelectItem>
                        <SelectItem value="auditivo">SVE Conservación Auditiva</SelectItem>
                        <SelectItem value="quimico">SVE Riesgo Químico</SelectItem>
                        <SelectItem value="biologico">SVE Riesgo Biológico</SelectItem>
                        <SelectItem value="visual">SVE Conservación Visual</SelectItem>
                        <SelectItem value="cardiovascular">SVE Riesgo Cardiovascular</SelectItem>
                        <SelectItem value="respiratorio">SVE Riesgo Respiratorio</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Al seleccionar, todos los campos se autocompletarán automáticamente</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sveRiskType">Tipo de Riesgo</Label>
                    <Input 
                      value={riskTypeLabels[sveFormData.riskType] || ""} 
                      disabled 
                      className="bg-muted"
                      data-testid="input-sve-risk-type"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sveStatus">Estado</Label>
                    <Input 
                      value="Activo" 
                      disabled 
                      className="bg-muted"
                      data-testid="input-sve-status"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="sveObjective">Objetivo del Programa</Label>
                    <Textarea
                      value={sveFormData.objective}
                      disabled
                      className="bg-muted min-h-[80px]"
                      data-testid="input-sve-objective"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sveTargetPopulation">Población Objetivo</Label>
                    <Input
                      value={sveFormData.targetPopulation}
                      disabled
                      className="bg-muted"
                      data-testid="input-sve-target-population"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sveResponsibleName">Responsable</Label>
                    <Input
                      value={sveFormData.responsibleName}
                      disabled
                      className="bg-muted"
                      data-testid="input-sve-responsible"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sveStartDate">Fecha de Inicio</Label>
                    <Input
                      type="date"
                      value={sveFormData.startDate}
                      disabled
                      className="bg-muted"
                      data-testid="input-sve-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sveReviewDate">Próxima Revisión</Label>
                    <Input
                      type="date"
                      value={sveFormData.reviewDate}
                      disabled
                      className="bg-muted"
                      data-testid="input-sve-review-date"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSveDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!sveFormData.name || createSveMutation.isPending}
                  >
                    {createSveMutation.isPending ? "Creando..." : "Crear SVE y Vincular"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AutomationAssistant 
        titulo="Promoción y Prevención en Salud"
        estandar="3.1.2"
        descripcion="Actividades de medicina del trabajo, promoción y prevención de la salud según riesgos identificados"
        normativaAplicable={normativaPromocionPrevencion}
        compact={true}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actividades</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-activities">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.programadas} programadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Ejecución</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-in-progress">
              {stats.enEjecucion}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completadas} completadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-coverage">
              {stats.coveragePercent}%
            </div>
            <p className="text-xs text-muted-foreground">Participación real vs estimada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vinculación SVE</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-sve-link">
              {stats.sveVinculationPercent}%
            </div>
            <p className="text-xs text-muted-foreground">{stats.activitiesWithSve} vinculadas a SVE</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen" data-testid="tab-resumen">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="medicina-trabajo" data-testid="tab-medicina-trabajo">
            <Stethoscope className="h-4 w-4 mr-2" />
            Medicina Trabajo
          </TabsTrigger>
          <TabsTrigger value="promocion" data-testid="tab-promocion">
            <Heart className="h-4 w-4 mr-2" />
            Promoción
          </TabsTrigger>
          <TabsTrigger value="seguimiento" data-testid="tab-seguimiento">
            <FileText className="h-4 w-4 mr-2" />
            Seguimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Estado de Actividades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Programadas</span>
                    <span>{stats.programadas}</span>
                  </div>
                  <Progress 
                    value={stats.total ? (stats.programadas / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>En Ejecución</span>
                    <span>{stats.enEjecucion}</span>
                  </div>
                  <Progress 
                    value={stats.total ? (stats.enEjecucion / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completadas</span>
                    <span>{stats.completadas}</span>
                  </div>
                  <Progress 
                    value={stats.total ? (stats.completadas / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Canceladas</span>
                    <span>{stats.canceladas}</span>
                  </div>
                  <Progress 
                    value={stats.total ? (stats.canceladas / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Por Tipo de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(activityTypeLabels).map(([type, label]) => {
                  const count = activities.filter(a => a.activityType === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Próximas Actividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities
                    .filter(a => a.status === "programada" && a.startDate >= getTodayDateString())
                    .slice(0, 5)
                    .map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[150px]">{activity.title}</span>
                        <span className="text-muted-foreground">
                          {format(parseISO(activity.startDate), "dd/MM", { locale: es })}
                        </span>
                      </div>
                    ))}
                  {activities.filter(a => a.status === "programada").length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay actividades programadas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Checklist de Cumplimiento - Estándar 3.1.2
                </CardTitle>
                <CardDescription>
                  Verificación de requisitos según Resolución 0312/2019
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cumplimiento del estándar</span>
                    <span className="font-medium">{compliancePercentage}%</span>
                  </div>
                  <Progress value={compliancePercentage} className="h-3" />
                </div>
                <div className="space-y-3 pt-4">
                  {complianceChecklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${item.completed ? '' : 'text-muted-foreground'}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Normativa Aplicable
                </CardTitle>
                <CardDescription>
                  Referencias legales del estándar 3.1.2
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {normativaPromocionPrevencion.map((norma) => (
                  <div key={norma.codigo} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{norma.norma}</span>
                      {norma.obligatorio && (
                        <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{norma.articulo}</p>
                    <p className="text-sm">{norma.descripcion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medicina-trabajo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Actividades de Medicina del Trabajo</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                      data-testid="input-search-medicina"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.filter(a => a.activityType === "medicina_trabajo" || a.activityType === "examen_ocupacional").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay actividades de medicina del trabajo registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities
                      .filter(a => a.activityType === "medicina_trabajo" || a.activityType === "examen_ocupacional")
                      .filter(a => searchTerm === "" || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((activity) => (
                        <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                          <TableCell className="font-medium">
                            <div>
                              {activity.title}
                              <Badge className={`ml-2 ${getActivityTypeBadgeColor(activity.activityType)}`}>
                                {activityTypeLabels[activity.activityType]}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{activity.objective}</TableCell>
                          <TableCell>
                            {format(parseISO(activity.startDate), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>{activity.responsibleName}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(activity.status)}>
                              {statusLabels[activity.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(activity)}
                                data-testid={`button-edit-${activity.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(activity.id)}
                                data-testid={`button-delete-${activity.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promocion" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Actividades de Promoción y Prevención</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                      data-testid="input-search-promocion"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Población</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.filter(a => 
                    a.activityType === "promocion_prevencion" || 
                    a.activityType === "campana_especial" ||
                    a.activityType === "capacitacion_salud"
                  ).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay actividades de promoción y prevención registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities
                      .filter(a => 
                        a.activityType === "promocion_prevencion" || 
                        a.activityType === "campana_especial" ||
                        a.activityType === "capacitacion_salud"
                      )
                      .filter(a => searchTerm === "" || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((activity) => (
                        <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                          <TableCell className="font-medium">{activity.title}</TableCell>
                          <TableCell>
                            <Badge className={getActivityTypeBadgeColor(activity.activityType)}>
                              {activityTypeLabels[activity.activityType]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(activity.startDate), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>{activity.targetPopulation}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(activity.status)}>
                              {statusLabels[activity.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(activity)}
                                data-testid={`button-edit-${activity.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(activity.id)}
                                data-testid={`button-delete-${activity.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguimiento" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Seguimiento y Evidencias</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                      data-testid="input-search-seguimiento"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="medicina_trabajo">Medicina del Trabajo</SelectItem>
                      <SelectItem value="promocion_prevencion">Promoción y Prevención</SelectItem>
                      <SelectItem value="campana_especial">Campaña Especial</SelectItem>
                      <SelectItem value="examen_ocupacional">Examen Ocupacional</SelectItem>
                      <SelectItem value="capacitacion_salud">Capacitación en Salud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Vinculación SVE</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No se encontraron actividades
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => (
                      <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>
                          <Badge className={getActivityTypeBadgeColor(activity.activityType)}>
                            {activityTypeLabels[activity.activityType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(activity.startDate), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {activity.endDate 
                            ? format(parseISO(activity.endDate), "dd/MM/yyyy", { locale: es })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {activity.actualParticipants || 0} / {activity.estimatedParticipants || 0}
                        </TableCell>
                        <TableCell>
                          {activity.sveProgramId ? (
                            <Badge variant="secondary">
                              <Link2 className="h-3 w-3 mr-1" />
                              Vinculado
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(activity.status)}>
                            {statusLabels[activity.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(activity)}
                              data-testid={`button-edit-${activity.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(activity.id)}
                              data-testid={`button-delete-${activity.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Ejecutivo</CardTitle>
              <CardDescription>
                Información consolidada para presentación ante autoridades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Total Actividades</h4>
                  <p className="text-3xl font-bold text-primary">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Actividades registradas</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Tasa de Ejecución</h4>
                  <p className="text-3xl font-bold text-primary">
                    {stats.total > 0 ? Math.round(((stats.completadas + stats.enEjecucion) / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">En ejecución o completadas</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cobertura</h4>
                  <p className="text-3xl font-bold text-primary">{stats.coveragePercent}%</p>
                  <p className="text-sm text-muted-foreground">Participación vs estimado</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cumplimiento Estándar</h4>
                  <p className="text-3xl font-bold text-primary">{compliancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Requisitos del estándar 3.1.2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
