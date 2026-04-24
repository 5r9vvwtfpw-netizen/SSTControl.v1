import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EvsProgram, EvsActivity, EvsControl, EvsIncident, EvsFollowup, Worker, ResourceAllocation } from "@shared/schema";
import { getTodayDateString, formatCurrency } from "@/lib/utils/formatters";

const formatCurrencyDisplay = (value: string): string => {
  if (!value) return "";
  const numValue = parseFloat(value.replace(/[^\d.-]/g, ""));
  if (isNaN(numValue)) return value;
  return formatCurrency(numValue);
};

const parseCurrencyInput = (value: string): string => {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned;
};
import { Link } from "wouter";
import { DollarSign, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, FileText, Users, Calendar, Activity, Cigarette, Wine, Pill, Heart, Brain, Dumbbell, ClipboardList, UserCheck, Edit, Trash2, Eye, Loader2, Printer, CalendarDays } from "lucide-react";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const CATEGORY_OPTIONS = [
  { value: "tabaquismo", label: "Tabaquismo", icon: Cigarette },
  { value: "alcoholismo", label: "Alcoholismo", icon: Wine },
  { value: "farmacodependencia", label: "Farmacodependencia", icon: Pill },
  { value: "habitos_alimenticios", label: "Hábitos Alimenticios", icon: Heart },
  { value: "actividad_fisica", label: "Actividad Física", icon: Dumbbell },
  { value: "salud_mental", label: "Salud Mental", icon: Brain },
  { value: "riesgo_cardiovascular", label: "Riesgo Cardiovascular", icon: Activity },
  { value: "otro", label: "Otro", icon: ClipboardList },
];

const CONTROL_RESULTS = [
  { value: "negativo", label: "Negativo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "positivo", label: "Positivo", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "sospechoso", label: "Sospechoso", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "no_realizado", label: "No Realizado", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "rechazado", label: "Rechazado por Trabajador", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
];

const PROGRAM_STATUS = [
  { value: "borrador", label: "Borrador", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "activo", label: "Activo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "cerrado", label: "Cerrado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "suspendido", label: "Suspendido", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

const FOLLOWUP_STATUS = [
  { value: "activo", label: "Activo", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "en_tratamiento", label: "En Tratamiento", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "recuperado", label: "Recuperado", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "abandonado", label: "Abandonado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "cerrado", label: "Cerrado", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
];

const CONTROL_TYPES = [
  { value: "aleatorio", label: "Aleatorio" },
  { value: "periodico", label: "Periódico" },
  { value: "post_incidente", label: "Post-Incidente" },
  { value: "ingreso", label: "Ingreso" },
];

const INCIDENT_TYPES = [
  { value: "consumo_trabajo", label: "Consumo en trabajo" },
  { value: "olor_aliento", label: "Olor a aliento" },
  { value: "comportamiento_alterado", label: "Comportamiento alterado" },
  { value: "accidente_consumo", label: "Accidente por consumo" },
];

const RISK_LEVELS = [
  { value: "bajo", label: "Bajo", color: "bg-green-100 text-green-800" },
  { value: "medio", label: "Medio", color: "bg-yellow-100 text-yellow-800" },
  { value: "alto", label: "Alto", color: "bg-orange-100 text-orange-800" },
  { value: "critico", label: "Crítico", color: "bg-red-100 text-red-800" },
];

const ACTIVITY_TITLES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  tabaquismo: [
    { value: "charla_libre_humo", label: "Charla: Espacios Libres de Humo" },
    { value: "taller_cesacion", label: "Taller: Técnicas de Cesación Tabáquica" },
    { value: "campana_dia_sin_tabaco", label: "Campaña: Día Mundial Sin Tabaco" },
    { value: "sensibilizacion_riesgos", label: "Sensibilización: Riesgos del Tabaquismo" },
    { value: "consejeria_grupal", label: "Consejería Grupal Anti-Tabaco" },
  ],
  alcoholismo: [
    { value: "charla_consumo_responsable", label: "Charla: Consumo Responsable de Alcohol" },
    { value: "taller_prevencion", label: "Taller: Prevención del Alcoholismo" },
    { value: "sensibilizacion_efectos", label: "Sensibilización: Efectos del Alcohol en el Trabajo" },
    { value: "consejeria_grupal_alcohol", label: "Consejería Grupal: Manejo del Consumo" },
    { value: "campana_cero_alcohol", label: "Campaña: Cero Alcohol en el Trabajo" },
  ],
  farmacodependencia: [
    { value: "charla_drogas", label: "Charla: Prevención del Uso de Drogas" },
    { value: "taller_deteccion", label: "Taller: Detección Temprana de Adicciones" },
    { value: "sensibilizacion_farmacodep", label: "Sensibilización: Farmacodependencia y Trabajo" },
    { value: "campana_vida_sana", label: "Campaña: Vida Sana Sin Drogas" },
    { value: "apoyo_rehabilitacion", label: "Sesión: Apoyo a la Rehabilitación" },
  ],
  habitos_alimenticios: [
    { value: "charla_alimentacion_saludable", label: "Charla: Alimentación Saludable" },
    { value: "taller_nutricion", label: "Taller: Nutrición Balanceada" },
    { value: "campana_frutas_verduras", label: "Campaña: Consumo de Frutas y Verduras" },
    { value: "evaluacion_imc", label: "Jornada: Evaluación de IMC" },
    { value: "feria_salud_alimentaria", label: "Feria: Salud Alimentaria" },
  ],
  actividad_fisica: [
    { value: "pausas_activas", label: "Sesión: Pausas Activas" },
    { value: "jornada_ejercicio", label: "Jornada: Actividad Física Dirigida" },
    { value: "caminata_salud", label: "Caminata por la Salud" },
    { value: "taller_ergonomia", label: "Taller: Ergonomía y Movimiento" },
    { value: "campana_moverse_mas", label: "Campaña: Moverse Más" },
  ],
  salud_mental: [
    { value: "charla_estres", label: "Charla: Manejo del Estrés Laboral" },
    { value: "taller_relajacion", label: "Taller: Técnicas de Relajación" },
    { value: "sensibilizacion_salud_mental", label: "Sensibilización: Salud Mental en el Trabajo" },
    { value: "sesion_mindfulness", label: "Sesión: Mindfulness y Bienestar" },
    { value: "apoyo_psicosocial", label: "Jornada: Apoyo Psicosocial" },
  ],
  riesgo_cardiovascular: [
    { value: "tamizaje_riesgo_cv", label: "Jornada: Tamizaje de Riesgo Cardiovascular" },
    { value: "charla_hipertension", label: "Charla: Prevención de Hipertensión" },
    { value: "control_tension_arterial", label: "Control: Toma de Tensión Arterial" },
    { value: "campana_corazon_sano", label: "Campaña: Corazón Sano" },
    { value: "sensibilizacion_factores_riesgo", label: "Sensibilización: Factores de Riesgo CV" },
  ],
  otro: [
    { value: "actividad_general", label: "Actividad General de Promoción" },
    { value: "jornada_salud", label: "Jornada de Salud Integral" },
    { value: "feria_bienestar", label: "Feria del Bienestar" },
  ],
};

const ACTIVITY_OBJECTIVES_BY_CATEGORY: Record<string, string> = {
  tabaquismo: "Promover estilos de vida libres de tabaco y fortalecer las competencias para la cesación tabáquica, conforme al Estándar 3.1.7 de la Resolución 0312 de 2019.",
  alcoholismo: "Fomentar el consumo responsable de alcohol y prevenir situaciones de riesgo en el entorno laboral, de acuerdo con el Estándar 3.1.7 de la Resolución 0312 de 2019.",
  farmacodependencia: "Prevenir el uso de sustancias psicoactivas y promover la detección temprana de casos de riesgo, según el Estándar 3.1.7 de la Resolución 0312 de 2019.",
  habitos_alimenticios: "Promover hábitos de alimentación saludable para prevenir enfermedades crónicas no transmisibles, conforme al Estándar 3.1.7 de la Resolución 0312 de 2019.",
  actividad_fisica: "Fomentar la práctica regular de actividad física para mejorar la salud y prevenir el sedentarismo, según el Estándar 3.1.7 de la Resolución 0312 de 2019.",
  salud_mental: "Promover el bienestar mental y emocional de los trabajadores, desarrollando habilidades para el manejo del estrés y factores psicosociales, conforme al Estándar 3.1.7.",
  riesgo_cardiovascular: "Identificar y controlar factores de riesgo cardiovascular mediante actividades de promoción y prevención, según el Estándar 3.1.7 de la Resolución 0312 de 2019.",
  otro: "Promover estilos de vida saludables entre los trabajadores de acuerdo con el Estándar 3.1.7 de la Resolución 0312 de 2019.",
};

const WORK_LOCATIONS = [
  { value: "sala_capacitacion", label: "Sala de Capacitación" },
  { value: "auditorio", label: "Auditorio" },
  { value: "area_produccion", label: "Área de Producción" },
  { value: "oficinas_admin", label: "Oficinas Administrativas" },
  { value: "comedor", label: "Comedor / Casino" },
  { value: "planta", label: "Planta Principal" },
  { value: "bodega", label: "Bodega" },
  { value: "exterior", label: "Área Exterior" },
  { value: "virtual", label: "Virtual (En línea)" },
  { value: "otro", label: "Otro" },
];

const IMMEDIATE_MEASURES = [
  { value: "retiro_puesto", label: "Retiro inmediato del puesto de trabajo" },
  { value: "atencion_medica", label: "Atención médica de urgencia" },
  { value: "notificacion_jefe", label: "Notificación al jefe inmediato" },
  { value: "acompanamiento_casa", label: "Acompañamiento a su domicilio" },
  { value: "llamada_familiar", label: "Contacto a familiar/acudiente" },
  { value: "prueba_confirmacion", label: "Realización de prueba de confirmación" },
  { value: "dialogo_privado", label: "Diálogo privado con el trabajador" },
  { value: "ninguna", label: "Ninguna medida requerida" },
];

const INTERVENTION_PLANS = [
  { value: "remision_eps", label: "Remisión a programa de EPS" },
  { value: "remision_arl", label: "Remisión a programa de ARL" },
  { value: "seguimiento_sst", label: "Seguimiento periódico por SST" },
  { value: "consejeria_individual", label: "Consejería individual" },
  { value: "apoyo_psicologico", label: "Apoyo psicológico externo" },
  { value: "centro_tratamiento", label: "Remisión a centro de tratamiento" },
  { value: "plan_reduccion", label: "Plan de reducción gradual" },
  { value: "grupo_apoyo", label: "Vinculación a grupo de apoyo" },
];

const WORKER_COMMITMENT_TEMPLATES = [
  { value: "asistir_seguimiento", label: "Asistir puntualmente a citas de seguimiento" },
  { value: "participar_programa", label: "Participar activamente en programa de rehabilitación" },
  { value: "abstenerse_consumo", label: "Abstenerse del consumo de sustancias" },
  { value: "reportar_dificultades", label: "Reportar cualquier dificultad en el proceso" },
  { value: "cumplir_tratamiento", label: "Cumplir con el tratamiento médico prescrito" },
  { value: "mantener_confidencialidad", label: "Mantener confidencialidad del proceso" },
];

const COMPANY_COMMITMENT_TEMPLATES = [
  { value: "apoyo_tratamiento", label: "Brindar apoyo para el tratamiento" },
  { value: "tiempo_citas", label: "Facilitar tiempo para asistir a citas" },
  { value: "reubicacion_temporal", label: "Reubicación temporal si es necesario" },
  { value: "confidencialidad", label: "Garantizar confidencialidad del caso" },
  { value: "no_discriminacion", label: "No discriminación por condición de salud" },
  { value: "seguimiento_continuo", label: "Seguimiento continuo por parte de SST" },
  { value: "apoyo_familia", label: "Comunicación con familia si es autorizado" },
];

function getCategoryLabel(value: string) {
  return CATEGORY_OPTIONS.find(c => c.value === value)?.label || value;
}

function getStatusBadge(status: string, statusList: typeof PROGRAM_STATUS) {
  const s = statusList.find(s => s.value === status);
  return s ? <Badge className={s.color}>{s.label}</Badge> : <Badge>{status}</Badge>;
}

export default function EstilosVidaSaludable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("programas");

  const { data: programs = [], isLoading: loadingPrograms } = useQuery<EvsProgram[]>({
    queryKey: ["/api/evs/programs"],
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery<EvsActivity[]>({
    queryKey: ["/api/evs/activities"],
  });

  const { data: controls = [], isLoading: loadingControls } = useQuery<EvsControl[]>({
    queryKey: ["/api/evs/controls"],
  });

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery<EvsIncident[]>({
    queryKey: ["/api/evs/incidents"],
  });

  const { data: followups = [], isLoading: loadingFollowups } = useQuery<EvsFollowup[]>({
    queryKey: ["/api/evs/followups"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: resourceAllocations = [] } = useQuery<ResourceAllocation[]>({
    queryKey: ["/api/resource-allocations"],
  });
  
  const financialResources = resourceAllocations.filter(r => r.resourceType === "financiero");

  const currentYear = new Date().getFullYear();
  const activePrograms = programs.filter(p => p.status === "activo").length;
  const executedActivities = activities.filter(a => a.status === "ejecutada").length;
  const controlsThisYear = controls.filter(c => c.controlDate?.startsWith(String(currentYear))).length;
  const activeFollowups = followups.filter(f => f.status === "activo" || f.status === "en_tratamiento").length;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Estilos de Vida Saludable</h1>
        <p className="text-muted-foreground">
          Gestión de programas de promoción de la salud, prevención de adicciones y hábitos saludables (Estándar 3.1.7)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Activos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-kpi-programs">{activePrograms}</div>
            <p className="text-xs text-muted-foreground">de {programs.length} programas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades Ejecutadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-kpi-activities">{executedActivities}</div>
            <p className="text-xs text-muted-foreground">de {activities.length} actividades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controles {currentYear}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-kpi-controls">{controlsThisYear}</div>
            <p className="text-xs text-muted-foreground">controles realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguimientos Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-kpi-followups">{activeFollowups}</div>
            <p className="text-xs text-muted-foreground">casos en seguimiento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="programas" data-testid="tab-programas">Programas</TabsTrigger>
          <TabsTrigger value="actividades" data-testid="tab-actividades">Actividades</TabsTrigger>
          <TabsTrigger value="controles" data-testid="tab-controles">Controles</TabsTrigger>
          <TabsTrigger value="incidentes" data-testid="tab-incidentes">Incidentes</TabsTrigger>
          <TabsTrigger value="seguimientos" data-testid="tab-seguimientos">Seguimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="programas">
          <ProgramasTab programs={programs} workers={workers} financialResources={financialResources} isLoading={loadingPrograms} toast={toast} />
        </TabsContent>

        <TabsContent value="actividades">
          <ActividadesTab activities={activities} programs={programs} workers={workers} isLoading={loadingActivities} toast={toast} />
        </TabsContent>

        <TabsContent value="controles">
          <ControlesTab controls={controls} workers={workers} programs={programs} isLoading={loadingControls} toast={toast} />
        </TabsContent>

        <TabsContent value="incidentes">
          <IncidentesTab incidents={incidents} workers={workers} controls={controls} isLoading={loadingIncidents} toast={toast} />
        </TabsContent>

        <TabsContent value="seguimientos">
          <SeguimientosTab followups={followups} workers={workers} controls={controls} incidents={incidents} isLoading={loadingFollowups} toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProgramasTab({ programs, workers, financialResources, isLoading, toast }: { programs: EvsProgram[]; workers: Worker[]; financialResources: ResourceAllocation[]; isLoading: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<EvsProgram | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  
  const currentYear = new Date().getFullYear();
  const getDefaultValues = () => ({
    name: `Programa EVS ${currentYear}`,
    year: currentYear,
    policy: "La empresa se compromete a promover estilos de vida saludables, previniendo el consumo de tabaco, alcohol y sustancias psicoactivas, fomentando la actividad física y el bienestar integral de todos los trabajadores.",
    objectives: "1. Reducir factores de riesgo asociados al consumo de sustancias psicoactivas\n2. Promover hábitos de vida saludable\n3. Detectar de manera temprana casos de consumo problemático\n4. Brindar apoyo y acompañamiento a trabajadores en proceso de recuperación",
    scope: "Todos los trabajadores de la empresa",
    responsibleName: "",
    responsiblePosition: "",
    responsibleEmail: "",
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    approvedBudget: "",
    executedBudget: "",
    participationTarget: "80",
    complianceTarget: "90",
    priorityAreas: "Tabaquismo, Alcoholismo, Farmacodependencia, Actividad Física, Salud Mental",
    status: "borrador" as const,
  });
  
  const [formData, setFormData] = useState(getDefaultValues());

  const resetForm = () => {
    setFormData(getDefaultValues());
    setEditingProgram(null);
    setSelectedResourceId("");
  };
  
  const handleSelectWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setFormData({
        ...formData,
        responsibleName: worker.name,
        responsiblePosition: worker.position || "",
        responsibleEmail: worker.email || "",
      });
    }
  };
  
  const handleSelectResource = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    const resource = financialResources.find(r => r.id === resourceId);
    if (resource) {
      const approvedAmount = resource.inversionEstimada ? resource.inversionEstimada.replace(/[^0-9.-]/g, '') : "";
      const executedAmount = resource.montoEjecutado ? resource.montoEjecutado.replace(/[^0-9.-]/g, '') : "";
      setFormData({
        ...formData,
        approvedBudget: approvedAmount,
        executedBudget: executedAmount,
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/evs/programs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/programs"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Programa creado", description: "El programa se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/evs/programs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/programs"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Programa actualizado", description: "El programa se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/evs/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/programs"] });
      toast({ title: "Programa eliminado", description: "El programa se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (program: EvsProgram) => {
    setEditingProgram(program);
    setFormData({
      name: program.name || "",
      year: program.year,
      policy: program.policy || "",
      objectives: program.objectives || "",
      scope: program.scope || "",
      responsibleName: program.responsibleName || "",
      responsiblePosition: program.responsiblePosition || "",
      responsibleEmail: program.responsibleEmail || "",
      startDate: program.startDate || "",
      endDate: program.endDate || "",
      approvedBudget: program.approvedBudget || "",
      executedBudget: program.executedBudget || "",
      participationTarget: program.participationTarget?.toString() || "",
      complianceTarget: program.complianceTarget?.toString() || "",
      priorityAreas: program.priorityAreas?.join(", ") || "",
      status: program.status as any,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      participationTarget: formData.participationTarget ? parseInt(formData.participationTarget) : null,
      complianceTarget: formData.complianceTarget ? parseInt(formData.complianceTarget) : null,
      priorityAreas: formData.priorityAreas ? formData.priorityAreas.split(",").map(s => s.trim()).filter(Boolean) : [],
    };

    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Programas EVS</CardTitle>
          <CardDescription>Programas anuales de promoción de estilos de vida saludables</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/evs/programs/pdf", "_blank")} data-testid="button-print-programs">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-new-program">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Programa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {programs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay programas registrados</p>
            <p className="text-sm">Cree un nuevo programa para comenzar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id} data-testid={`row-program-${program.id}`}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.year}</TableCell>
                  <TableCell>{program.responsibleName}</TableCell>
                  <TableCell>
                    {program.startDate && program.endDate
                      ? `${format(new Date(program.startDate), "dd/MM/yyyy", { locale: es })} - ${format(new Date(program.endDate), "dd/MM/yyyy", { locale: es })}`
                      : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(program.status, PROGRAM_STATUS)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(program)} data-testid={`button-edit-program-${program.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(program.id)} data-testid={`button-delete-program-${program.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Editar Programa" : "Nuevo Programa EVS"}</DialogTitle>
            <DialogDescription>Complete la información del programa de estilos de vida saludables</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del programa *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Programa EVS 2025" data-testid="input-program-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} data-testid="input-program-year" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy">Política *</Label>
              <Textarea id="policy" value={formData.policy} onChange={(e) => setFormData({ ...formData, policy: e.target.value })} placeholder="Política de la empresa sobre estilos de vida saludables" data-testid="input-program-policy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objectives">Objetivos *</Label>
              <Textarea id="objectives" value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} placeholder="Objetivos específicos del programa" data-testid="input-program-objectives" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Alcance</Label>
              <Input id="scope" value={formData.scope} onChange={(e) => setFormData({ ...formData, scope: e.target.value })} placeholder="Ej: Todos los trabajadores" data-testid="input-program-scope" />
            </div>
            <div className="space-y-2">
              <Label>Seleccionar Responsable de Trabajadores</Label>
              <Select onValueChange={handleSelectWorker}>
                <SelectTrigger data-testid="select-program-worker">
                  <SelectValue placeholder="Seleccione un trabajador..." />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} - {worker.position || "Sin cargo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Al seleccionar un trabajador, se completarán automáticamente los campos de responsable</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsibleName">Responsable *</Label>
                <Input id="responsibleName" value={formData.responsibleName} onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })} data-testid="input-program-responsible" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsiblePosition">Cargo</Label>
                <Input id="responsiblePosition" value={formData.responsiblePosition} onChange={(e) => setFormData({ ...formData, responsiblePosition: e.target.value })} data-testid="input-program-position" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsibleEmail">Email</Label>
                <Input id="responsibleEmail" type="email" value={formData.responsibleEmail} onChange={(e) => setFormData({ ...formData, responsibleEmail: e.target.value })} data-testid="input-program-email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha inicio *</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} data-testid="input-program-start" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha fin *</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} data-testid="input-program-end" />
              </div>
            </div>
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Label className="text-blue-800 dark:text-blue-200 font-medium">Vincular Presupuesto (Estándar 1.1.3)</Label>
                </div>
                <Button variant="outline" size="sm" asChild className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300">
                  <Link href="/asignacion-recursos">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ir a Recursos
                  </Link>
                </Button>
              </div>
              {financialResources.length > 0 ? (
                <>
                  <Select value={selectedResourceId} onValueChange={handleSelectResource}>
                    <SelectTrigger data-testid="select-financial-resource">
                      <SelectValue placeholder="Seleccione un recurso financiero..." />
                    </SelectTrigger>
                    <SelectContent>
                      {financialResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.objetivoGeneral || "Recurso financiero"} - {formatCurrencyDisplay(resource.inversionEstimada || "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Al seleccionar un recurso, se completarán automáticamente los campos de presupuesto</p>
                </>
              ) : (
                <p className="text-xs text-blue-600 dark:text-blue-400">No hay recursos financieros registrados. Use el botón "Ir a Recursos" para crear uno.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approvedBudget">Presupuesto aprobado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="approvedBudget" 
                    type="text" 
                    value={formData.approvedBudget ? new Intl.NumberFormat('es-CO').format(Number(formData.approvedBudget)) : ""} 
                    onChange={(e) => setFormData({ ...formData, approvedBudget: parseCurrencyInput(e.target.value) })} 
                    placeholder="0" 
                    className="pl-7"
                    data-testid="input-program-budget" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="executedBudget">Presupuesto ejecutado</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="executedBudget" 
                    type="text" 
                    value={formData.executedBudget ? new Intl.NumberFormat('es-CO').format(Number(formData.executedBudget)) : ""} 
                    onChange={(e) => setFormData({ ...formData, executedBudget: parseCurrencyInput(e.target.value) })} 
                    placeholder="0" 
                    className="pl-7"
                    data-testid="input-program-executed" 
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participationTarget">Meta participación (%)</Label>
                <Input id="participationTarget" type="number" min="0" max="100" value={formData.participationTarget} onChange={(e) => setFormData({ ...formData, participationTarget: e.target.value })} data-testid="input-program-participation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complianceTarget">Meta cumplimiento (%)</Label>
                <Input id="complianceTarget" type="number" min="0" max="100" value={formData.complianceTarget} onChange={(e) => setFormData({ ...formData, complianceTarget: e.target.value })} data-testid="input-program-compliance" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priorityAreas">Áreas prioritarias (separadas por coma)</Label>
              <Input id="priorityAreas" value={formData.priorityAreas} onChange={(e) => setFormData({ ...formData, priorityAreas: e.target.value })} placeholder="Ej: Tabaquismo, Alcoholismo, Actividad física" data-testid="input-program-areas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                <SelectTrigger data-testid="select-program-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-program">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-program">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProgram ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ActividadesTab({ activities, programs, workers, isLoading, toast }: { activities: EvsActivity[]; programs: EvsProgram[]; workers: Worker[]; isLoading: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<EvsActivity | null>(null);
  
  const todayStr = getTodayDateString();
  const getDefaultFormData = (category: string = "tabaquismo") => ({
    programId: "",
    category: category as any,
    title: "",
    description: "",
    objective: ACTIVITY_OBJECTIVES_BY_CATEGORY[category] || "",
    scheduledDate: todayStr,
    executionDate: "",
    facilitatorName: "",
    location: "",
    modality: "presencial",
    meetingLink: "",
    estimatedParticipants: "20",
    actualParticipants: "",
    status: "programada",
  });
  
  const [formData, setFormData] = useState(getDefaultFormData());

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setEditingActivity(null);
  };
  
  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category: category as any,
      objective: ACTIVITY_OBJECTIVES_BY_CATEGORY[category] || "",
      title: "",
    });
  };
  
  const handleTitleSelect = (titleValue: string) => {
    const titleOption = ACTIVITY_TITLES_BY_CATEGORY[formData.category]?.find(t => t.value === titleValue);
    if (titleOption) {
      setFormData({ ...formData, title: titleOption.label });
    }
  };
  
  const handleSelectFacilitator = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setFormData({
        ...formData,
        facilitatorName: worker.name,
      });
    }
  };
  
  const handleLocationSelect = (locationValue: string) => {
    const location = WORK_LOCATIONS.find(l => l.value === locationValue);
    if (location) {
      setFormData({ ...formData, location: location.label });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/evs/activities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/activities"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Actividad creada", description: "La actividad se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/evs/activities/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/activities"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Actividad actualizada", description: "La actividad se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/evs/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/activities"] });
      toast({ title: "Actividad eliminada", description: "La actividad se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (activity: EvsActivity) => {
    setEditingActivity(activity);
    setFormData({
      programId: activity.programId || "",
      category: activity.category as any,
      title: activity.title || "",
      description: activity.description || "",
      objective: activity.objective || "",
      scheduledDate: activity.scheduledDate || "",
      executionDate: activity.executionDate || "",
      facilitatorName: activity.facilitatorName || "",
      location: activity.location || "",
      modality: activity.modality || "presencial",
      meetingLink: (activity as any).meetingLink || "",
      estimatedParticipants: activity.estimatedParticipants?.toString() || "",
      actualParticipants: activity.actualParticipants?.toString() || "",
      status: activity.status || "programada",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.scheduledDate) {
      toast({ title: "Campo requerido", description: "La fecha programada es obligatoria.", variant: "destructive" });
      return;
    }
    const payload = {
      ...formData,
      programId: formData.programId === "__none__" ? null : (formData.programId || null),
      estimatedParticipants: formData.estimatedParticipants ? parseInt(formData.estimatedParticipants) : null,
      actualParticipants: formData.actualParticipants ? parseInt(formData.actualParticipants) : null,
      executionDate: formData.executionDate || null,
    };

    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Actividades EVS</CardTitle>
          <CardDescription>Campañas, charlas y talleres de promoción de la salud</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/evs/activities/pdf", "_blank")} data-testid="button-print-activities">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-new-activity">
            <Plus className="h-4 w-4 mr-2" /> Nueva Actividad
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividades registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha Programada</TableHead>
                <TableHead>Facilitador</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>{getCategoryLabel(activity.category)}</TableCell>
                  <TableCell>{activity.scheduledDate ? format(new Date(activity.scheduledDate), "dd/MM/yyyy", { locale: es }) : "-"}</TableCell>
                  <TableCell>{activity.facilitatorName}</TableCell>
                  <TableCell>{activity.actualParticipants || activity.estimatedParticipants || "-"}</TableCell>
                  <TableCell><Badge variant={activity.status === "ejecutada" ? "default" : "secondary"}>{activity.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(activity)} data-testid={`button-edit-activity-${activity.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(activity.id)} data-testid={`button-delete-activity-${activity.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Editar Actividad" : "Nueva Actividad EVS"}</DialogTitle>
            <DialogDescription>Complete la información de la actividad de promoción</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Programa (opcional)</Label>
                <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                  <SelectTrigger data-testid="select-activity-program">
                    <SelectValue placeholder="Seleccionar programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin programa</SelectItem>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger data-testid="select-activity-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Seleccionar Título de Actividad *</Label>
              <Select onValueChange={handleTitleSelect}>
                <SelectTrigger data-testid="select-activity-title-template">
                  <SelectValue placeholder="Seleccione una actividad predefinida..." />
                </SelectTrigger>
                <SelectContent>
                  {(ACTIVITY_TITLES_BY_CATEGORY[formData.category] || []).map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="O escriba un título personalizado"
                className="mt-2"
                data-testid="input-activity-title" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo * (autocompletado según categoría)</Label>
              <Textarea id="objective" value={formData.objective} onChange={(e) => setFormData({ ...formData, objective: e.target.value })} data-testid="input-activity-objective" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="input-activity-description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Fecha programada *</Label>
                <Input id="scheduledDate" type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} data-testid="input-activity-scheduled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="executionDate">Fecha ejecución</Label>
                <Input id="executionDate" type="date" value={formData.executionDate} onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })} data-testid="input-activity-execution" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Seleccionar Facilitador de Trabajadores</Label>
              <Select onValueChange={handleSelectFacilitator}>
                <SelectTrigger data-testid="select-activity-facilitator-worker">
                  <SelectValue placeholder="Seleccione un trabajador..." />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} - {worker.position || "Sin cargo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                id="facilitatorName" 
                value={formData.facilitatorName} 
                onChange={(e) => setFormData({ ...formData, facilitatorName: e.target.value })} 
                placeholder="O escriba el nombre del facilitador"
                className="mt-2"
                data-testid="input-activity-facilitator" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seleccionar Lugar</Label>
                <Select onValueChange={handleLocationSelect}>
                  <SelectTrigger data-testid="select-activity-location">
                    <SelectValue placeholder="Seleccione un lugar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                  placeholder="O escriba la ubicación"
                  className="mt-2"
                  data-testid="input-activity-location-text" 
                />
              </div>
              <div className="space-y-2">
                <Label>Modalidad</Label>
                <Select value={formData.modality} onValueChange={(v) => setFormData({ ...formData, modality: v })}>
                  <SelectTrigger data-testid="select-activity-modality">
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
            {(formData.modality === "virtual" || formData.modality === "mixta") && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Enlace de Reunión Virtual</Label>
                <Input 
                  id="meetingLink" 
                  value={formData.meetingLink} 
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} 
                  placeholder="https://meet.google.com/xxx o https://zoom.us/j/xxx"
                  data-testid="input-activity-meeting-link" 
                />
                <p className="text-xs text-muted-foreground">Este enlace será visible para los trabajadores en su portal de empleados</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedParticipants">Participantes estimados</Label>
                <Input id="estimatedParticipants" type="number" value={formData.estimatedParticipants} onChange={(e) => setFormData({ ...formData, estimatedParticipants: e.target.value })} data-testid="input-activity-estimated" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualParticipants">Participantes reales</Label>
                <Input id="actualParticipants" type="number" value={formData.actualParticipants} onChange={(e) => setFormData({ ...formData, actualParticipants: e.target.value })} data-testid="input-activity-actual" />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger data-testid="select-activity-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="ejecutada">Ejecutada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="reprogramada">Reprogramada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-activity">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-activity">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingActivity ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ControlesTab({ controls, workers, programs, isLoading, toast }: { controls: EvsControl[]; workers: Worker[]; programs: EvsProgram[]; isLoading: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<EvsControl | null>(null);
  
  const todayStr = getTodayDateString();
  const getDefaultFormData = () => ({
    workerId: "",
    programId: "",
    category: "alcoholismo" as const,
    controlType: "aleatorio",
    controlDate: todayStr,
    result: "negativo" as const,
    resultDetails: "",
    informedConsent: true,
    performedBy: "",
    requiresFollowup: false,
    observations: "",
  });
  
  const [formData, setFormData] = useState(getDefaultFormData());

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setEditingControl(null);
  };
  
  const handleSelectPerformer = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setFormData({
        ...formData,
        performedBy: worker.name,
      });
    }
  };
  
  const handleResultChange = (result: string) => {
    const requiresFollowup = result === "positivo" || result === "sospechoso";
    setFormData({
      ...formData,
      result: result as any,
      requiresFollowup,
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/evs/controls", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/controls"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Control registrado", description: "El control se ha registrado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/evs/controls/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/controls"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Control actualizado", description: "El control se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/evs/controls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/controls"] });
      toast({ title: "Control eliminado", description: "El control se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (control: EvsControl) => {
    setEditingControl(control);
    setFormData({
      workerId: control.workerId || "",
      programId: control.programId || "",
      category: control.category as any,
      controlType: control.controlType || "aleatorio",
      controlDate: control.controlDate || "",
      result: control.result as any,
      resultDetails: control.resultDetails || "",
      informedConsent: control.informedConsent === 1,
      performedBy: control.performedBy || "",
      requiresFollowup: control.requiresFollowup === 1,
      observations: control.observations || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      programId: formData.programId === "__none__" ? null : (formData.programId || null),
      informedConsent: formData.informedConsent ? 1 : 0,
      requiresFollowup: formData.requiresFollowup ? 1 : 0,
    };

    if (editingControl) {
      updateMutation.mutate({ id: editingControl.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getWorkerName = (workerId: string) => workers.find(w => w.id === workerId)?.name || "Desconocido";

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Controles y Tamizajes</CardTitle>
          <CardDescription>Registro de pruebas de alcohol, drogas y tamizajes de salud</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/evs/controls/pdf", "_blank")} data-testid="button-print-controls">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-new-control">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Control
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {controls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay controles registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Seguimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((control) => {
                const resultInfo = CONTROL_RESULTS.find(r => r.value === control.result);
                return (
                  <TableRow key={control.id} data-testid={`row-control-${control.id}`}>
                    <TableCell className="font-medium">{getWorkerName(control.workerId)}</TableCell>
                    <TableCell>{getCategoryLabel(control.category)}</TableCell>
                    <TableCell>{CONTROL_TYPES.find(t => t.value === control.controlType)?.label || control.controlType}</TableCell>
                    <TableCell>{control.controlDate ? format(new Date(control.controlDate), "dd/MM/yyyy", { locale: es }) : "-"}</TableCell>
                    <TableCell><Badge className={resultInfo?.color}>{resultInfo?.label || control.result}</Badge></TableCell>
                    <TableCell>{control.requiresFollowup === 1 ? <Badge variant="outline">Sí</Badge> : "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(control)} data-testid={`button-edit-control-${control.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(control.id)} data-testid={`button-delete-control-${control.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingControl ? "Editar Control" : "Nuevo Control"}</DialogTitle>
            <DialogDescription>Registre el resultado del control o tamizaje</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trabajador *</Label>
                <Select value={formData.workerId} onValueChange={(v) => setFormData({ ...formData, workerId: v })}>
                  <SelectTrigger data-testid="select-control-worker">
                    <SelectValue placeholder="Seleccionar trabajador" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} - {w.identificationNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Programa (opcional)</Label>
                <Select value={formData.programId} onValueChange={(v) => setFormData({ ...formData, programId: v })}>
                  <SelectTrigger data-testid="select-control-program">
                    <SelectValue placeholder="Seleccionar programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin programa</SelectItem>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as any })}>
                  <SelectTrigger data-testid="select-control-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de control *</Label>
                <Select value={formData.controlType} onValueChange={(v) => setFormData({ ...formData, controlType: v })}>
                  <SelectTrigger data-testid="select-control-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTROL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="controlDate">Fecha *</Label>
                <Input id="controlDate" type="date" value={formData.controlDate} onChange={(e) => setFormData({ ...formData, controlDate: e.target.value })} data-testid="input-control-date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resultado * (activa seguimiento si positivo)</Label>
                <Select value={formData.result} onValueChange={handleResultChange}>
                  <SelectTrigger data-testid="select-control-result">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTROL_RESULTS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Seleccionar Responsable del Control *</Label>
                <Select onValueChange={handleSelectPerformer}>
                  <SelectTrigger data-testid="select-control-performer-worker">
                    <SelectValue placeholder="Seleccione responsable..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} - {w.position || "Sin cargo"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="performedBy" 
                  value={formData.performedBy} 
                  onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })} 
                  placeholder="O escriba el nombre"
                  className="mt-2"
                  data-testid="input-control-performer" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resultDetails">Detalles del resultado</Label>
              <Textarea id="resultDetails" value={formData.resultDetails} onChange={(e) => setFormData({ ...formData, resultDetails: e.target.value })} data-testid="input-control-details" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea id="observations" value={formData.observations} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} data-testid="input-control-observations" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="informedConsent" checked={formData.informedConsent} onCheckedChange={(c) => setFormData({ ...formData, informedConsent: !!c })} data-testid="checkbox-control-consent" />
                <Label htmlFor="informedConsent">Consentimiento informado firmado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="requiresFollowup" checked={formData.requiresFollowup} onCheckedChange={(c) => setFormData({ ...formData, requiresFollowup: !!c })} data-testid="checkbox-control-followup" />
                <Label htmlFor="requiresFollowup">Requiere seguimiento</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-control">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-control">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingControl ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function IncidentesTab({ incidents, workers, controls, isLoading, toast }: { incidents: EvsIncident[]; workers: Worker[]; controls: EvsControl[]; isLoading: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<EvsIncident | null>(null);
  
  const now = new Date();
  const todayStr = getTodayDateString();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const getDefaultFormData = () => ({
    workerId: "",
    category: "alcoholismo" as const,
    incidentType: "comportamiento_alterado",
    incidentDate: todayStr,
    incidentTime: currentTime,
    incidentLocation: "",
    description: "",
    reportedBy: "",
    immediateMeasures: "",
    wasRemoved: false,
    medicalAssessment: false,
    status: "abierto",
  });
  
  const [formData, setFormData] = useState(getDefaultFormData());

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setEditingIncident(null);
  };
  
  const handleSelectReporter = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setFormData({
        ...formData,
        reportedBy: worker.name,
      });
    }
  };
  
  const handleLocationSelect = (locationValue: string) => {
    const location = WORK_LOCATIONS.find(l => l.value === locationValue);
    if (location) {
      setFormData({ ...formData, incidentLocation: location.label });
    }
  };
  
  const handleMeasureSelect = (measureValue: string) => {
    const measure = IMMEDIATE_MEASURES.find(m => m.value === measureValue);
    if (measure) {
      const currentMeasures = formData.immediateMeasures;
      const newMeasure = measure.label;
      setFormData({
        ...formData,
        immediateMeasures: currentMeasures ? `${currentMeasures}\n${newMeasure}` : newMeasure,
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/evs/incidents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/incidents"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Incidente registrado", description: "El incidente se ha registrado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/evs/incidents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/incidents"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Incidente actualizado", description: "El incidente se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/evs/incidents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/incidents"] });
      toast({ title: "Incidente eliminado", description: "El incidente se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (incident: EvsIncident) => {
    setEditingIncident(incident);
    setFormData({
      workerId: incident.workerId || "",
      category: incident.category as any,
      incidentType: incident.incidentType || "comportamiento_alterado",
      incidentDate: incident.incidentDate || "",
      incidentTime: incident.incidentTime || "",
      incidentLocation: incident.incidentLocation || "",
      description: incident.description || "",
      reportedBy: incident.reportedBy || "",
      immediateMeasures: incident.immediateMeasures || "",
      wasRemoved: incident.wasRemoved === 1,
      medicalAssessment: incident.medicalAssessment === 1,
      status: incident.status || "abierto",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      workerId: formData.workerId === "__confidential__" ? null : (formData.workerId || null),
      wasRemoved: formData.wasRemoved ? 1 : 0,
      medicalAssessment: formData.medicalAssessment ? 1 : 0,
    };

    if (editingIncident) {
      updateMutation.mutate({ id: editingIncident.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return "Confidencial";
    return workers.find(w => w.id === workerId)?.name || "Desconocido";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Incidentes EVS</CardTitle>
          <CardDescription>Registro de incidentes relacionados con consumo de sustancias</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/evs/incidents/pdf", "_blank")} data-testid="button-print-incidents">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-new-incident">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Incidente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay incidentes registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id} data-testid={`row-incident-${incident.id}`}>
                  <TableCell className="font-medium">{getWorkerName(incident.workerId)}</TableCell>
                  <TableCell>{getCategoryLabel(incident.category)}</TableCell>
                  <TableCell>{INCIDENT_TYPES.find(t => t.value === incident.incidentType)?.label || incident.incidentType}</TableCell>
                  <TableCell>{incident.incidentDate ? format(new Date(incident.incidentDate), "dd/MM/yyyy", { locale: es }) : "-"}</TableCell>
                  <TableCell>{incident.reportedBy}</TableCell>
                  <TableCell><Badge variant={incident.status === "cerrado" ? "secondary" : "default"}>{incident.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(incident)} data-testid={`button-edit-incident-${incident.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(incident.id)} data-testid={`button-delete-incident-${incident.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIncident ? "Editar Incidente" : "Nuevo Incidente"}</DialogTitle>
            <DialogDescription>Registre el incidente relacionado con sustancias</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trabajador (opcional para confidencialidad)</Label>
                <Select value={formData.workerId} onValueChange={(v) => setFormData({ ...formData, workerId: v })}>
                  <SelectTrigger data-testid="select-incident-worker">
                    <SelectValue placeholder="Seleccionar o dejar en blanco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__confidential__">Confidencial</SelectItem>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as any })}>
                  <SelectTrigger data-testid="select-incident-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de incidente *</Label>
                <Select value={formData.incidentType} onValueChange={(v) => setFormData({ ...formData, incidentType: v })}>
                  <SelectTrigger data-testid="select-incident-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Fecha *</Label>
                <Input id="incidentDate" type="date" value={formData.incidentDate} onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })} data-testid="input-incident-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentTime">Hora</Label>
                <Input id="incidentTime" type="time" value={formData.incidentTime} onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })} data-testid="input-incident-time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seleccionar Lugar</Label>
                <Select onValueChange={handleLocationSelect}>
                  <SelectTrigger data-testid="select-incident-location">
                    <SelectValue placeholder="Seleccione un lugar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="incidentLocation" 
                  value={formData.incidentLocation} 
                  onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })} 
                  placeholder="O escriba la ubicación"
                  className="mt-2"
                  data-testid="input-incident-location" 
                />
              </div>
              <div className="space-y-2">
                <Label>Seleccionar Quien Reporta *</Label>
                <Select onValueChange={handleSelectReporter}>
                  <SelectTrigger data-testid="select-incident-reporter-worker">
                    <SelectValue placeholder="Seleccione quien reporta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} - {w.position || "Sin cargo"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="reportedBy" 
                  value={formData.reportedBy} 
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })} 
                  placeholder="O escriba el nombre"
                  className="mt-2"
                  data-testid="input-incident-reporter" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del incidente *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} data-testid="input-incident-description" />
            </div>
            <div className="space-y-2">
              <Label>Agregar Medidas Inmediatas</Label>
              <Select onValueChange={handleMeasureSelect}>
                <SelectTrigger data-testid="select-incident-measure">
                  <SelectValue placeholder="Seleccione medidas predefinidas..." />
                </SelectTrigger>
                <SelectContent>
                  {IMMEDIATE_MEASURES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea 
                id="immediateMeasures" 
                value={formData.immediateMeasures} 
                onChange={(e) => setFormData({ ...formData, immediateMeasures: e.target.value })} 
                placeholder="Medidas seleccionadas o adicionales"
                className="mt-2"
                data-testid="input-incident-measures" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="wasRemoved" checked={formData.wasRemoved} onCheckedChange={(c) => setFormData({ ...formData, wasRemoved: !!c })} data-testid="checkbox-incident-removed" />
                <Label htmlFor="wasRemoved">Fue retirado del puesto de trabajo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="medicalAssessment" checked={formData.medicalAssessment} onCheckedChange={(c) => setFormData({ ...formData, medicalAssessment: !!c })} data-testid="checkbox-incident-medical" />
                <Label htmlFor="medicalAssessment">Valoración médica realizada</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger data-testid="select-incident-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abierto">Abierto</SelectItem>
                  <SelectItem value="en_proceso">En proceso</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-incident">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-incident">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingIncident ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SeguimientosTab({ followups, workers, controls, incidents, isLoading, toast }: { followups: EvsFollowup[]; workers: Worker[]; controls: EvsControl[]; incidents: EvsIncident[]; isLoading: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<EvsFollowup | null>(null);
  
  const todayStr = getTodayDateString();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split("T")[0];
  
  const getDefaultFormData = () => ({
    workerId: "",
    category: "alcoholismo" as const,
    openDate: todayStr,
    riskLevel: "medio",
    initialAssessment: "",
    interventionPlan: "",
    workerCommitments: "",
    companyCommitments: "",
    nextReviewDate: nextMonthStr,
    status: "activo" as const,
    responsibleProfessional: "",
  });
  
  const [formData, setFormData] = useState(getDefaultFormData());

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setEditingFollowup(null);
  };
  
  const handleSelectProfessional = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setFormData({
        ...formData,
        responsibleProfessional: worker.name,
      });
    }
  };
  
  const handleInterventionPlanSelect = (planValue: string) => {
    const plan = INTERVENTION_PLANS.find(p => p.value === planValue);
    if (plan) {
      const currentPlan = formData.interventionPlan;
      const newPlan = plan.label;
      setFormData({
        ...formData,
        interventionPlan: currentPlan ? `${currentPlan}\n${newPlan}` : newPlan,
      });
    }
  };
  
  const handleWorkerCommitmentSelect = (commitValue: string) => {
    const commit = WORKER_COMMITMENT_TEMPLATES.find(c => c.value === commitValue);
    if (commit) {
      const currentCommits = formData.workerCommitments;
      const newCommit = commit.label;
      setFormData({
        ...formData,
        workerCommitments: currentCommits ? `${currentCommits}\n${newCommit}` : newCommit,
      });
    }
  };
  
  const handleCompanyCommitmentSelect = (commitValue: string) => {
    const commit = COMPANY_COMMITMENT_TEMPLATES.find(c => c.value === commitValue);
    if (commit) {
      const currentCommits = formData.companyCommitments;
      const newCommit = commit.label;
      setFormData({
        ...formData,
        companyCommitments: currentCommits ? `${currentCommits}\n${newCommit}` : newCommit,
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/evs/followups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/followups"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Seguimiento creado", description: "El caso de seguimiento se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/evs/followups/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/followups"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Seguimiento actualizado", description: "El caso se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/evs/followups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evs/followups"] });
      toast({ title: "Seguimiento eliminado", description: "El caso se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (followup: EvsFollowup) => {
    setEditingFollowup(followup);
    setFormData({
      workerId: followup.workerId || "",
      category: followup.category as any,
      openDate: followup.openDate || "",
      riskLevel: followup.riskLevel || "medio",
      initialAssessment: followup.initialAssessment || "",
      interventionPlan: followup.interventionPlan || "",
      workerCommitments: followup.workerCommitments || "",
      companyCommitments: followup.companyCommitments || "",
      nextReviewDate: followup.nextReviewDate || "",
      status: followup.status as any,
      responsibleProfessional: followup.responsibleProfessional || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingFollowup) {
      updateMutation.mutate({ id: editingFollowup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getWorkerName = (workerId: string) => workers.find(w => w.id === workerId)?.name || "Desconocido";

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Seguimientos de Casos</CardTitle>
          <CardDescription>Gestión de casos que requieren intervención y seguimiento</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/evs/followups/pdf", "_blank")} data-testid="button-print-followups">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-new-followup">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Seguimiento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {followups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay casos de seguimiento</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha Apertura</TableHead>
                <TableHead>Nivel Riesgo</TableHead>
                <TableHead>Próxima Revisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followups.map((followup) => {
                const riskInfo = RISK_LEVELS.find(r => r.value === followup.riskLevel);
                return (
                  <TableRow key={followup.id} data-testid={`row-followup-${followup.id}`}>
                    <TableCell className="font-medium">{getWorkerName(followup.workerId)}</TableCell>
                    <TableCell>{getCategoryLabel(followup.category)}</TableCell>
                    <TableCell>{followup.openDate ? format(new Date(followup.openDate), "dd/MM/yyyy", { locale: es }) : "-"}</TableCell>
                    <TableCell><Badge className={riskInfo?.color}>{riskInfo?.label || followup.riskLevel}</Badge></TableCell>
                    <TableCell>{followup.nextReviewDate ? format(new Date(followup.nextReviewDate), "dd/MM/yyyy", { locale: es }) : "-"}</TableCell>
                    <TableCell>{getStatusBadge(followup.status, FOLLOWUP_STATUS)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => window.open(`/api/evs/followups/${followup.id}/pdf`, "_blank")} title="Ver PDF" data-testid={`button-pdf-followup-${followup.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(followup)} data-testid={`button-edit-followup-${followup.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(followup.id)} data-testid={`button-delete-followup-${followup.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFollowup ? "Editar Seguimiento" : "Nuevo Caso de Seguimiento"}</DialogTitle>
            <DialogDescription>Registre la información del caso que requiere intervención</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trabajador *</Label>
                <Select value={formData.workerId} onValueChange={(v) => setFormData({ ...formData, workerId: v })}>
                  <SelectTrigger data-testid="select-followup-worker">
                    <SelectValue placeholder="Seleccionar trabajador" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} - {w.identificationNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as any })}>
                  <SelectTrigger data-testid="select-followup-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openDate">Fecha apertura *</Label>
                <Input id="openDate" type="date" value={formData.openDate} onChange={(e) => setFormData({ ...formData, openDate: e.target.value })} data-testid="input-followup-open" />
              </div>
              <div className="space-y-2">
                <Label>Nivel de riesgo *</Label>
                <Select value={formData.riskLevel} onValueChange={(v) => setFormData({ ...formData, riskLevel: v })}>
                  <SelectTrigger data-testid="select-followup-risk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_LEVELS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextReviewDate">Próxima revisión</Label>
                <Input id="nextReviewDate" type="date" value={formData.nextReviewDate} onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })} data-testid="input-followup-next" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialAssessment">Evaluación inicial *</Label>
              <Textarea id="initialAssessment" value={formData.initialAssessment} onChange={(e) => setFormData({ ...formData, initialAssessment: e.target.value })} rows={3} data-testid="input-followup-assessment" />
            </div>
            <div className="space-y-2">
              <Label>Agregar Plan de Intervención</Label>
              <Select onValueChange={handleInterventionPlanSelect}>
                <SelectTrigger data-testid="select-followup-plan">
                  <SelectValue placeholder="Seleccione acciones predefinidas..." />
                </SelectTrigger>
                <SelectContent>
                  {INTERVENTION_PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea 
                id="interventionPlan" 
                value={formData.interventionPlan} 
                onChange={(e) => setFormData({ ...formData, interventionPlan: e.target.value })} 
                rows={3} 
                placeholder="Acciones seleccionadas o adicionales"
                className="mt-2"
                data-testid="input-followup-plan" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agregar Compromisos del Trabajador</Label>
                <Select onValueChange={handleWorkerCommitmentSelect}>
                  <SelectTrigger data-testid="select-followup-worker-commit">
                    <SelectValue placeholder="Seleccione compromisos..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKER_COMMITMENT_TEMPLATES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea 
                  id="workerCommitments" 
                  value={formData.workerCommitments} 
                  onChange={(e) => setFormData({ ...formData, workerCommitments: e.target.value })} 
                  placeholder="Compromisos seleccionados o adicionales"
                  className="mt-2"
                  data-testid="input-followup-worker-commits" 
                />
              </div>
              <div className="space-y-2">
                <Label>Agregar Compromisos de la Empresa</Label>
                <Select onValueChange={handleCompanyCommitmentSelect}>
                  <SelectTrigger data-testid="select-followup-company-commit">
                    <SelectValue placeholder="Seleccione compromisos..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_COMMITMENT_TEMPLATES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea 
                  id="companyCommitments" 
                  value={formData.companyCommitments} 
                  onChange={(e) => setFormData({ ...formData, companyCommitments: e.target.value })} 
                  placeholder="Compromisos seleccionados o adicionales"
                  className="mt-2"
                  data-testid="input-followup-company-commits" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seleccionar Profesional Responsable</Label>
                <Select onValueChange={handleSelectProfessional}>
                  <SelectTrigger data-testid="select-followup-professional-worker">
                    <SelectValue placeholder="Seleccione profesional..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} - {w.position || "Sin cargo"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  id="responsibleProfessional" 
                  value={formData.responsibleProfessional} 
                  onChange={(e) => setFormData({ ...formData, responsibleProfessional: e.target.value })} 
                  placeholder="O escriba el nombre"
                  className="mt-2"
                  data-testid="input-followup-professional" 
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                  <SelectTrigger data-testid="select-followup-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLLOWUP_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-followup">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-followup">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingFollowup ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
