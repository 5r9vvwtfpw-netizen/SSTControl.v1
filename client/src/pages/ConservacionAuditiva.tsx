import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Ear,
  Plus,
  Pencil,
  Trash2,
  Volume2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Activity,
  FileText,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { NoiseExposureProfile, AudiometryRecord, PcaControlAction, EnvironmentalMeasurement, Worker, Company, WorkerExposureAssignment } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const normativaPCA = [
  {
    codigo: 'RES-8321-1983',
    norma: 'Resolución 8321/1983',
    articulo: 'Art. 49-53',
    descripcion: 'Normas sobre protección y conservación de la audición',
    requisitos: [
      'Límite permisible de 85 dB(A) para 8 horas de exposición',
      'Audiometrías de ingreso, periódicas y de retiro',
      'Programa de conservación auditiva obligatorio',
      'Controles de ingeniería, administrativos y EPP'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.24',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.24',
    descripcion: 'Medidas de prevención y control - Vigilancia epidemiológica auditiva',
    requisitos: [
      'Vigilancia de la salud de trabajadores expuestos',
      'Seguimiento a trabajadores con pérdida auditiva',
      'Mediciones de ruido periódicas',
      'Implementación de jerarquía de controles'
    ],
    obligatorio: true
  }
];

const audiometryTypeLabels: Record<string, string> = {
  "ingreso": "Ingreso",
  "inicial_90_dias": "Inicial 90 días",
  "periodica": "Periódica",
  "seguimiento": "Seguimiento",
  "retiro": "Retiro"
};

const audiometryStatusColors: Record<string, string> = {
  "programada": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "realizada": "bg-green-500/10 text-green-700 dark:text-green-300",
  "vencida": "bg-red-500/10 text-red-700 dark:text-red-300",
  "cancelada": "bg-gray-500/10 text-gray-700 dark:text-gray-300"
};

const audiometryResultColors: Record<string, string> = {
  "normal": "bg-green-500/10 text-green-700 dark:text-green-300",
  "trauma_leve": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "trauma_moderado": "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "trauma_severo": "bg-red-500/10 text-red-700 dark:text-red-300",
  "pendiente": "bg-gray-500/10 text-gray-700 dark:text-gray-300"
};

const audiometryResultLabels: Record<string, string> = {
  "normal": "Normal",
  "trauma_leve": "Trauma Leve",
  "trauma_moderado": "Trauma Moderado",
  "trauma_severo": "Trauma Severo",
  "pendiente": "Pendiente"
};

const controlTypeColors: Record<string, string> = {
  "fuente": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "medio": "bg-green-500/10 text-green-700 dark:text-green-300",
  "epp": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "administrativo": "bg-purple-500/10 text-purple-700 dark:text-purple-300"
};

const controlTypeLabels: Record<string, string> = {
  "fuente": "Fuente",
  "medio": "Medio",
  "epp": "EPP",
  "administrativo": "Administrativo"
};

const actionStatusColors: Record<string, string> = {
  "planificada": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "en_progreso": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "implementada": "bg-green-500/10 text-green-700 dark:text-green-300",
  "verificada": "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  "cancelada": "bg-gray-500/10 text-gray-700 dark:text-gray-300"
};

const actionStatusLabels: Record<string, string> = {
  "planificada": "Planificada",
  "en_progreso": "En Progreso",
  "implementada": "Implementada",
  "verificada": "Verificada",
  "cancelada": "Cancelada"
};

// Predefined control action suggestions by type
const controlActionSuggestions: Record<string, { description: string; objective: string }[]> = {
  fuente: [
    { description: "Instalación de silenciadores en equipos de compresión", objective: "Reducir el nivel de ruido en la fuente a menos de 80 dB(A)" },
    { description: "Reemplazo de equipos ruidosos por modelos de baja emisión sonora", objective: "Eliminar la fuente de ruido excesivo" },
    { description: "Mantenimiento preventivo de maquinaria para reducir vibraciones", objective: "Reducir emisión de ruido por desgaste mecánico" },
    { description: "Instalación de amortiguadores antivibratorios en bases de equipos", objective: "Reducir transmisión de ruido estructural" },
    { description: "Lubricación y ajuste de componentes móviles", objective: "Minimizar ruido por fricción mecánica" },
  ],
  medio: [
    { description: "Instalación de cabinas acústicas insonorizadas", objective: "Aislar las fuentes de ruido del ambiente general" },
    { description: "Colocación de paneles absorbentes acústicos en paredes y techos", objective: "Reducir reverberación y nivel de ruido ambiental" },
    { description: "Construcción de barreras acústicas entre áreas de trabajo", objective: "Reducir propagación de ruido entre zonas" },
    { description: "Instalación de cerramientos parciales en maquinaria", objective: "Contener el ruido en la zona de emisión" },
    { description: "Tratamiento acústico de ductos de ventilación", objective: "Reducir transmisión de ruido por sistemas HVAC" },
  ],
  epp: [
    { description: "Dotación de protectores auditivos tipo copa NRR 25-30 dB", objective: "Proteger la audición de trabajadores expuestos" },
    { description: "Entrega de tapones auditivos moldeables NRR 20-25 dB", objective: "Proporcionar protección auditiva cómoda para uso prolongado" },
    { description: "Suministro de protectores auditivos con comunicación integrada", objective: "Mantener comunicación segura en ambientes ruidosos" },
    { description: "Capacitación en uso y cuidado correcto de protección auditiva", objective: "Asegurar efectividad del EPP auditivo" },
    { description: "Verificación de ajuste personalizado de protectores auditivos", objective: "Garantizar atenuación efectiva del ruido" },
  ],
  administrativo: [
    { description: "Rotación de personal en puestos de alta exposición a ruido", objective: "Limitar tiempo de exposición individual a menos de 8 horas/día" },
    { description: "Programación de pausas activas en ambientes ruidosos", objective: "Reducir dosis de exposición acumulada" },
    { description: "Señalización de zonas de riesgo auditivo obligatorio", objective: "Alertar sobre uso obligatorio de EPP auditivo" },
    { description: "Restricción de acceso a áreas de alto ruido", objective: "Minimizar personal expuesto a ruido excesivo" },
    { description: "Capacitación sobre riesgos de exposición al ruido", objective: "Concientizar sobre prevención de pérdida auditiva" },
  ],
};

export default function ConservacionAuditiva() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  
  const [activeTab, setActiveTab] = useState("panorama");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Profile dialog state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<NoiseExposureProfile | null>(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [workersDialogOpen, setWorkersDialogOpen] = useState(false);
  const [viewingProfileWorkers, setViewingProfileWorkers] = useState<NoiseExposureProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    companyId: "",
    selectedWorkerId: "",
    name: "",
    area: "",
    jobPosition: "",
    environmentalMeasurementId: "",
    noiseLevel: "",
    exposureHoursDay: "",
    audiometryFrequencyMonths: "24",
  });
  
  // Audiometry dialog state
  const [audiometryDialogOpen, setAudiometryDialogOpen] = useState(false);
  const [editingAudiometry, setEditingAudiometry] = useState<AudiometryRecord | null>(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [audiometryForResults, setAudiometryForResults] = useState<AudiometryRecord | null>(null);
  const [audiometryForm, setAudiometryForm] = useState({
    workerId: "",
    audiometryType: "periodica" as const,
    scheduledDate: "",
  });
  const [resultsForm, setResultsForm] = useState<{
    examDate: string;
    performedBy: string;
    clinicName: string;
    rightEar500Hz: string;
    rightEar1000Hz: string;
    rightEar2000Hz: string;
    rightEar3000Hz: string;
    rightEar4000Hz: string;
    rightEar6000Hz: string;
    leftEar500Hz: string;
    leftEar1000Hz: string;
    leftEar2000Hz: string;
    leftEar3000Hz: string;
    leftEar4000Hz: string;
    leftEar6000Hz: string;
    overallResult: "normal" | "trauma_leve" | "trauma_moderado" | "trauma_severo" | "pendiente";
    observations: string;
    recommendations: string;
    nextAudiometryDate: string;
  }>({
    examDate: "",
    performedBy: "",
    clinicName: "",
    rightEar500Hz: "",
    rightEar1000Hz: "",
    rightEar2000Hz: "",
    rightEar3000Hz: "",
    rightEar4000Hz: "",
    rightEar6000Hz: "",
    leftEar500Hz: "",
    leftEar1000Hz: "",
    leftEar2000Hz: "",
    leftEar3000Hz: "",
    leftEar4000Hz: "",
    leftEar6000Hz: "",
    overallResult: "pendiente",
    observations: "",
    recommendations: "",
    nextAudiometryDate: "",
  });
  
  // Control action dialog state
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<PcaControlAction | null>(null);
  const [controlForm, setControlForm] = useState<{
    exposureProfileId: string;
    controlType: "fuente" | "medio" | "epp" | "administrativo";
    description: string;
    objective: string;
    plannedDate: string;
    implementationDate: string;
    responsible: string;
    preImplementationLevel: string;
    postImplementationLevel: string;
    status: "planificada" | "en_progreso" | "implementada" | "verificada" | "cancelada";
    observations: string;
  }>({
    exposureProfileId: "",
    controlType: "fuente",
    description: "",
    objective: "",
    plannedDate: "",
    implementationDate: "",
    responsible: "",
    preImplementationLevel: "",
    postImplementationLevel: "",
    status: "planificada",
    observations: "",
  });

  // Queries
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<NoiseExposureProfile[]>({
    queryKey: ["/api/noise-exposure-profiles"],
  });

  const { data: audiometryRecords = [], isLoading: audiometryLoading } = useQuery<AudiometryRecord[]>({
    queryKey: ["/api/audiometry-records"],
  });

  const { data: controlActions = [], isLoading: controlsLoading } = useQuery<PcaControlAction[]>({
    queryKey: ["/api/pca-control-actions"],
  });

  const { data: measurements = [] } = useQuery<EnvironmentalMeasurement[]>({
    queryKey: ["/api/environmental-measurements"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const { data: workerAssignments = [] } = useQuery<WorkerExposureAssignment[]>({
    queryKey: ["/api/worker-exposure-assignments"],
  });

  // Filter noise measurements only
  const noiseMeasurements = measurements.filter(m => m.measurementType === "ruido");

  // Mutations for Noise Exposure Profiles
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/noise-exposure-profiles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/noise-exposure-profiles"] });
      setProfileDialogOpen(false);
      resetProfileForm();
      toast({
        title: "Perfil de exposición creado",
        description: "El perfil se ha registrado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/noise-exposure-profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/noise-exposure-profiles"] });
      setProfileDialogOpen(false);
      setEditingProfile(null);
      resetProfileForm();
      toast({
        title: "Perfil actualizado",
        description: "El perfil se ha actualizado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/noise-exposure-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/noise-exposure-profiles"] });
      toast({
        title: "Perfil eliminado",
        description: "El perfil se ha eliminado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutations for Audiometry Records
  const createAudiometryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/audiometry-records", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audiometry-records"] });
      setAudiometryDialogOpen(false);
      resetAudiometryForm();
      toast({
        title: "Audiometría programada",
        description: "La audiometría se ha programado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAudiometryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/audiometry-records/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audiometry-records"] });
      setResultsDialogOpen(false);
      setAudiometryForResults(null);
      resetResultsForm();
      toast({
        title: "Resultados registrados",
        description: "Los resultados de la audiometría se han guardado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAudiometryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/audiometry-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audiometry-records"] });
      toast({
        title: "Audiometría eliminada",
        description: "El registro se ha eliminado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutations for Control Actions
  const createControlMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pca-control-actions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pca-control-actions"] });
      setControlDialogOpen(false);
      resetControlForm();
      toast({
        title: "Acción de control creada",
        description: "La acción se ha registrado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateControlMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/pca-control-actions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pca-control-actions"] });
      setControlDialogOpen(false);
      setEditingControl(null);
      resetControlForm();
      toast({
        title: "Acción actualizada",
        description: "La acción de control se ha actualizado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteControlMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/pca-control-actions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pca-control-actions"] });
      toast({
        title: "Acción eliminada",
        description: "La acción de control se ha eliminado exitosamente",
        className: "bg-teal-50 border-teal-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutation for creating worker exposure assignments
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: { workerId: string; exposureProfileId: string; assignmentDate: string; companyId: string }) => {
      const res = await apiRequest("POST", "/api/worker-exposure-assignments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/worker-exposure-assignments"] });
    },
    onError: (error: Error) => {
      console.error("Error creating worker assignment:", error);
    },
  });

  // Mutation for deleting worker exposure assignments
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/worker-exposure-assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/worker-exposure-assignments"] });
    },
    onError: (error: Error) => {
      console.error("Error deleting worker assignment:", error);
    },
  });

  // Reset functions
  const resetProfileForm = () => {
    setProfileForm({
      companyId: "",
      selectedWorkerId: "",
      name: "",
      area: "",
      jobPosition: "",
      environmentalMeasurementId: "",
      noiseLevel: "",
      exposureHoursDay: "",
      audiometryFrequencyMonths: "24",
    });
    setSelectedWorkerIds([]);
  };

  const resetAudiometryForm = () => {
    setAudiometryForm({
      workerId: "",
      audiometryType: "periodica",
      scheduledDate: "",
    });
  };

  const resetResultsForm = () => {
    setResultsForm({
      examDate: "",
      performedBy: "",
      clinicName: "",
      rightEar500Hz: "",
      rightEar1000Hz: "",
      rightEar2000Hz: "",
      rightEar3000Hz: "",
      rightEar4000Hz: "",
      rightEar6000Hz: "",
      leftEar500Hz: "",
      leftEar1000Hz: "",
      leftEar2000Hz: "",
      leftEar3000Hz: "",
      leftEar4000Hz: "",
      leftEar6000Hz: "",
      overallResult: "pendiente",
      observations: "",
      recommendations: "",
      nextAudiometryDate: "",
    });
  };

  const resetControlForm = () => {
    setControlForm({
      exposureProfileId: "",
      controlType: "fuente",
      description: "",
      objective: "",
      plannedDate: "",
      implementationDate: "",
      responsible: "",
      preImplementationLevel: "",
      postImplementationLevel: "",
      status: "planificada",
      observations: "",
    });
  };

  // Get workers assigned to a specific profile
  const getProfileAssignments = (profileId: string) => {
    return workerAssignments.filter(a => a.exposureProfileId === profileId && a.isActive);
  };

  // Get workers with active exposure assignments (for audiometry filtering)
  const exposedWorkerIds = workerAssignments
    .filter(a => a.isActive)
    .map(a => a.workerId);
  const exposedWorkers = workers.filter(w => exposedWorkerIds.includes(w.id));

  // Handlers
  const handleEditProfile = (profile: NoiseExposureProfile) => {
    setEditingProfile(profile);
    // Load existing worker assignments for this profile
    const existingAssignments = getProfileAssignments(profile.id);
    setSelectedWorkerIds(existingAssignments.map(a => a.workerId));
    setProfileForm({
      companyId: profile.companyId || "",
      selectedWorkerId: "",
      name: profile.name,
      area: profile.area,
      jobPosition: profile.jobPosition || "",
      environmentalMeasurementId: profile.environmentalMeasurementId || "",
      noiseLevel: String(profile.noiseLevel),
      exposureHoursDay: String(profile.exposureHoursDay),
      audiometryFrequencyMonths: String(profile.audiometryFrequencyMonths || "24"),
    });
    setProfileDialogOpen(true);
  };

  const handleViewProfileWorkers = (profile: NoiseExposureProfile) => {
    setViewingProfileWorkers(profile);
    setWorkersDialogOpen(true);
  };

  const handleOpenResultsDialog = (audiometry: AudiometryRecord) => {
    setAudiometryForResults(audiometry);
    setResultsForm({
      examDate: audiometry.examDate || "",
      performedBy: audiometry.performedBy || "",
      clinicName: audiometry.clinicName || "",
      rightEar500Hz: String(audiometry.rightEar500Hz || ""),
      rightEar1000Hz: String(audiometry.rightEar1000Hz || ""),
      rightEar2000Hz: String(audiometry.rightEar2000Hz || ""),
      rightEar3000Hz: String(audiometry.rightEar3000Hz || ""),
      rightEar4000Hz: String(audiometry.rightEar4000Hz || ""),
      rightEar6000Hz: String(audiometry.rightEar6000Hz || ""),
      leftEar500Hz: String(audiometry.leftEar500Hz || ""),
      leftEar1000Hz: String(audiometry.leftEar1000Hz || ""),
      leftEar2000Hz: String(audiometry.leftEar2000Hz || ""),
      leftEar3000Hz: String(audiometry.leftEar3000Hz || ""),
      leftEar4000Hz: String(audiometry.leftEar4000Hz || ""),
      leftEar6000Hz: String(audiometry.leftEar6000Hz || ""),
      overallResult: audiometry.overallResult || "pendiente",
      observations: audiometry.observations || "",
      recommendations: audiometry.recommendations || "",
      nextAudiometryDate: audiometry.nextAudiometryDate || "",
    });
    setResultsDialogOpen(true);
  };

  const handleEditControl = (control: PcaControlAction) => {
    setEditingControl(control);
    setControlForm({
      exposureProfileId: control.exposureProfileId || "",
      controlType: control.controlType,
      description: control.description,
      objective: control.objective || "",
      plannedDate: control.plannedDate,
      implementationDate: control.implementationDate || "",
      responsible: control.responsible,
      preImplementationLevel: String(control.preImplementationLevel || ""),
      postImplementationLevel: String(control.postImplementationLevel || ""),
      status: control.status,
      observations: control.observations || "",
    });
    setControlDialogOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSuperadmin && !profileForm.companyId) {
      toast({ title: "Error", description: "Debe seleccionar una empresa", variant: "destructive" });
      return;
    }

    const data = {
      ...profileForm,
      companyId: isSuperadmin ? profileForm.companyId : undefined,
      noiseLevel: parseInt(profileForm.noiseLevel),
      exposureHoursDay: profileForm.exposureHoursDay,
      exposedWorkersCount: selectedWorkerIds.length,
      audiometryFrequencyMonths: parseInt(profileForm.audiometryFrequencyMonths),
      exceedsLimit: parseInt(profileForm.noiseLevel) > 85 ? 1 : 0,
      environmentalMeasurementId: profileForm.environmentalMeasurementId || undefined,
      jobPosition: profileForm.jobPosition || undefined,
    };

    const today = new Date().toISOString().split('T')[0];

    if (editingProfile) {
      // Update profile
      updateProfileMutation.mutate({ id: editingProfile.id, data }, {
        onSuccess: async () => {
          // Handle worker assignments - remove old ones, add new ones
          const existingAssignments = getProfileAssignments(editingProfile.id);
          const existingWorkerIds = existingAssignments.map(a => a.workerId);
          
          // Workers to remove (in old but not in new)
          const workersToRemove = existingAssignments.filter(a => !selectedWorkerIds.includes(a.workerId));
          // Workers to add (in new but not in old)
          const workersToAdd = selectedWorkerIds.filter(wId => !existingWorkerIds.includes(wId));
          
          // Delete removed assignments
          for (const assignment of workersToRemove) {
            await deleteAssignmentMutation.mutateAsync(assignment.id);
          }
          
          // Create new assignments
          const companyId = editingProfile.companyId || user?.companyId || "";
          for (const workerId of workersToAdd) {
            await createAssignmentMutation.mutateAsync({
              workerId,
              exposureProfileId: editingProfile.id,
              assignmentDate: today,
              companyId,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ["/api/worker-exposure-assignments"] });
        }
      });
    } else {
      // Create new profile and then create worker assignments
      createProfileMutation.mutate(data, {
        onSuccess: async (newProfile: NoiseExposureProfile) => {
          // Create worker assignments for the new profile
          const companyId = newProfile.companyId || user?.companyId || "";
          for (const workerId of selectedWorkerIds) {
            await createAssignmentMutation.mutateAsync({
              workerId,
              exposureProfileId: newProfile.id,
              assignmentDate: today,
              companyId,
            });
          }
          queryClient.invalidateQueries({ queryKey: ["/api/worker-exposure-assignments"] });
        }
      });
    }
  };

  const handleAudiometrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAudiometryMutation.mutate({
      ...audiometryForm,
      status: "programada",
    });
  };

  const handleResultsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audiometryForResults) return;

    const data = {
      examDate: resultsForm.examDate || undefined,
      performedBy: resultsForm.performedBy || undefined,
      clinicName: resultsForm.clinicName || undefined,
      rightEar500Hz: resultsForm.rightEar500Hz ? parseInt(resultsForm.rightEar500Hz) : undefined,
      rightEar1000Hz: resultsForm.rightEar1000Hz ? parseInt(resultsForm.rightEar1000Hz) : undefined,
      rightEar2000Hz: resultsForm.rightEar2000Hz ? parseInt(resultsForm.rightEar2000Hz) : undefined,
      rightEar3000Hz: resultsForm.rightEar3000Hz ? parseInt(resultsForm.rightEar3000Hz) : undefined,
      rightEar4000Hz: resultsForm.rightEar4000Hz ? parseInt(resultsForm.rightEar4000Hz) : undefined,
      rightEar6000Hz: resultsForm.rightEar6000Hz ? parseInt(resultsForm.rightEar6000Hz) : undefined,
      leftEar500Hz: resultsForm.leftEar500Hz ? parseInt(resultsForm.leftEar500Hz) : undefined,
      leftEar1000Hz: resultsForm.leftEar1000Hz ? parseInt(resultsForm.leftEar1000Hz) : undefined,
      leftEar2000Hz: resultsForm.leftEar2000Hz ? parseInt(resultsForm.leftEar2000Hz) : undefined,
      leftEar3000Hz: resultsForm.leftEar3000Hz ? parseInt(resultsForm.leftEar3000Hz) : undefined,
      leftEar4000Hz: resultsForm.leftEar4000Hz ? parseInt(resultsForm.leftEar4000Hz) : undefined,
      leftEar6000Hz: resultsForm.leftEar6000Hz ? parseInt(resultsForm.leftEar6000Hz) : undefined,
      overallResult: resultsForm.overallResult,
      observations: resultsForm.observations || undefined,
      recommendations: resultsForm.recommendations || undefined,
      nextAudiometryDate: resultsForm.nextAudiometryDate || undefined,
      status: "realizada",
    };

    updateAudiometryMutation.mutate({ id: audiometryForResults.id, data });
  };

  const handleControlSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...controlForm,
      exposureProfileId: controlForm.exposureProfileId || undefined,
      objective: controlForm.objective || undefined,
      implementationDate: controlForm.implementationDate || undefined,
      preImplementationLevel: controlForm.preImplementationLevel ? parseInt(controlForm.preImplementationLevel) : undefined,
      postImplementationLevel: controlForm.postImplementationLevel ? parseInt(controlForm.postImplementationLevel) : undefined,
      observations: controlForm.observations || undefined,
    };

    if (editingControl) {
      updateControlMutation.mutate({ id: editingControl.id, data });
    } else {
      createControlMutation.mutate(data);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  const getProfileName = (profileId: string | null | undefined) => {
    if (!profileId) return "-";
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || "-";
  };

  // Filter data based on search
  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAudiometries = audiometryRecords.filter(a => {
    const worker = workers.find(w => w.id === a.workerId);
    return worker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  });

  const filteredControls = controlActions.filter(c =>
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.responsible.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300" data-testid="text-page-title">
            Programa de Conservación Auditiva (PCA)
          </h1>
          <p className="text-muted-foreground">Resolución 8321/1983 - Art. 49-53</p>
        </div>
      </div>

      <AutomationAssistant
        titulo="Conservación Auditiva"
        estandar="2.2.1"
        descripcion="Programa de vigilancia epidemiológica para prevención de pérdida auditiva ocupacional"
        normativaAplicable={normativaPCA}
        compact={true}
      />

      <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
              <Ear className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-teal-800 dark:text-teal-200">Marco Legal</CardTitle>
              <CardDescription className="text-teal-600 dark:text-teal-400">
                Requisitos obligatorios para trabajadores expuestos a ruido ocupacional
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-teal-700 dark:text-teal-300 space-y-2">
          <p><strong>Límite permisible:</strong> 85 dB(A) para 8 horas de exposición continua</p>
          <p><strong>Audiometrías obligatorias:</strong> Ingreso, periódicas (cada 1-2 años según exposición) y retiro</p>
          <p><strong>Controles:</strong> Jerarquía de eliminación, sustitución, controles de ingeniería, administrativos y EPP</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-pca"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-teal-100 dark:bg-teal-900">
          <TabsTrigger 
            value="panorama" 
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            data-testid="tab-panorama"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Panorama de Exposición
          </TabsTrigger>
          <TabsTrigger 
            value="audiometrias"
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            data-testid="tab-audiometrias"
          >
            <Ear className="h-4 w-4 mr-2" />
            Audiometrías
          </TabsTrigger>
          <TabsTrigger 
            value="control"
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
            data-testid="tab-control"
          >
            <Shield className="h-4 w-4 mr-2" />
            Plan de Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="panorama" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={() => { resetProfileForm(); setEditingProfile(null); setProfileDialogOpen(true); }}
              className="bg-teal-600 hover:bg-teal-700"
              data-testid="button-add-profile"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Perfil de Exposición
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {profilesLoading ? (
              <div className="col-span-full text-center text-muted-foreground">Cargando perfiles...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground" data-testid="text-no-profiles">
                No se encontraron perfiles de exposición a ruido
              </div>
            ) : (
              filteredProfiles.map((profile) => (
                <Card key={profile.id} data-testid={`card-profile-${profile.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          profile.exceedsLimit ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" : "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
                        }`}>
                          <Volume2 className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{profile.name}</CardTitle>
                          <CardDescription className="text-xs">{profile.area}</CardDescription>
                        </div>
                      </div>
                      {profile.exceedsLimit ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Supera límite
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Conforme
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nivel de ruido:</span>
                      <span className={`font-bold text-lg ${profile.exceedsLimit ? "text-red-600" : "text-teal-600"}`}>
                        {profile.noiseLevel} dB(A)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exposición diaria:</span>
                      <span>{profile.exposureHoursDay} horas</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trabajadores asignados:</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {getProfileAssignments(profile.id).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frecuencia audiometría:</span>
                      <span>{profile.audiometryFrequencyMonths || 24} meses</span>
                    </div>
                    {profile.jobPosition && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cargo:</span>
                        <span className="text-xs">{profile.jobPosition}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewProfileWorkers(profile)}
                        data-testid={`button-view-workers-${profile.id}`}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Ver trabajadores ({getProfileAssignments(profile.id).length})
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditProfile(profile)}
                          data-testid={`button-edit-profile-${profile.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => deleteProfileMutation.mutate(profile.id)}
                          disabled={deleteProfileMutation.isPending}
                          data-testid={`button-delete-profile-${profile.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="audiometrias" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={() => { resetAudiometryForm(); setAudiometryDialogOpen(true); }}
              className="bg-teal-600 hover:bg-teal-700"
              data-testid="button-add-audiometry"
            >
              <Plus className="h-4 w-4 mr-2" />
              Programar Audiometría
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Programada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Próxima Audiometría</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audiometryLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Cargando audiometrías...
                      </TableCell>
                    </TableRow>
                  ) : filteredAudiometries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground" data-testid="text-no-audiometries">
                        No se encontraron registros de audiometrías
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAudiometries.map((audiometry) => (
                      <TableRow key={audiometry.id} data-testid={`row-audiometry-${audiometry.id}`}>
                        <TableCell className="font-medium">{getWorkerName(audiometry.workerId)}</TableCell>
                        <TableCell>{audiometryTypeLabels[audiometry.audiometryType] || audiometry.audiometryType}</TableCell>
                        <TableCell>{formatDate(audiometry.scheduledDate)}</TableCell>
                        <TableCell>
                          <Badge className={audiometryStatusColors[audiometry.status]}>
                            {audiometry.status === "programada" && <Clock className="h-3 w-3 mr-1" />}
                            {audiometry.status === "realizada" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {audiometry.status === "vencida" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {audiometry.status.charAt(0).toUpperCase() + audiometry.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={audiometryResultColors[audiometry.overallResult || "pendiente"]}>
                            {audiometryResultLabels[audiometry.overallResult || "pendiente"]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(audiometry.nextAudiometryDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {audiometry.status === "programada" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenResultsDialog(audiometry)}
                                data-testid={`button-results-${audiometry.id}`}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Registrar Resultados
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAudiometryMutation.mutate(audiometry.id)}
                              disabled={deleteAudiometryMutation.isPending}
                              data-testid={`button-delete-audiometry-${audiometry.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

        <TabsContent value="control" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={() => { resetControlForm(); setEditingControl(null); setControlDialogOpen(true); }}
              className="bg-teal-600 hover:bg-teal-700"
              data-testid="button-add-control"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Acción de Control
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {controlsLoading ? (
              <div className="col-span-full text-center text-muted-foreground">Cargando acciones de control...</div>
            ) : filteredControls.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground" data-testid="text-no-controls">
                No se encontraron acciones de control
              </div>
            ) : (
              filteredControls.map((control) => (
                <Card key={control.id} data-testid={`card-control-${control.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={controlTypeColors[control.controlType]}>
                          {controlTypeLabels[control.controlType]}
                        </Badge>
                        <Badge className={actionStatusColors[control.status]}>
                          {actionStatusLabels[control.status]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium">{control.description}</p>
                    {control.objective && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Objetivo:</strong> {control.objective}
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fecha planificada:</span>
                      <span>{formatDate(control.plannedDate)}</span>
                    </div>
                    {control.implementationDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fecha implementación:</span>
                        <span>{formatDate(control.implementationDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Responsable:</span>
                      <span className="text-xs">{control.responsible}</span>
                    </div>
                    {control.exposureProfileId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Perfil asociado:</span>
                        <span className="text-xs">{getProfileName(control.exposureProfileId)}</span>
                      </div>
                    )}
                    {control.status === "verificada" && control.effectivenessPercentage != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Efectividad:</span>
                        <span className={`font-bold ${control.effectivenessPercentage >= 50 ? "text-green-600" : "text-orange-600"}`}>
                          {control.effectivenessPercentage}%
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditControl(control)}
                        data-testid={`button-edit-control-${control.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => deleteControlMutation.mutate(control.id)}
                        disabled={deleteControlMutation.isPending}
                        data-testid={`button-delete-control-${control.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfile ? "Editar Perfil de Exposición" : "Nuevo Perfil de Exposición"}</DialogTitle>
            <DialogDescription>Configure el perfil de exposición a ruido ocupacional</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {isSuperadmin && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="companyId">Empresa *</Label>
                  <Select
                    value={profileForm.companyId}
                    onValueChange={(value) => setProfileForm({ ...profileForm, companyId: value })}
                  >
                    <SelectTrigger id="companyId" data-testid="select-profile-company">
                      <SelectValue placeholder="Seleccione empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="selectedWorkerId">Trabajador *</Label>
                <Select
                  value={profileForm.selectedWorkerId || "none"}
                  onValueChange={(value) => {
                    const workerId = value === "none" ? "" : value;
                    const selectedWorker = workers.find(w => w.id === workerId);
                    if (selectedWorker) {
                      setProfileForm({
                        ...profileForm,
                        selectedWorkerId: workerId,
                        name: selectedWorker.name,
                        area: selectedWorker.department || profileForm.area,
                        jobPosition: selectedWorker.position || profileForm.jobPosition
                      });
                      if (!selectedWorkerIds.includes(workerId)) {
                        setSelectedWorkerIds([...selectedWorkerIds, workerId]);
                      }
                    } else {
                      setProfileForm({ ...profileForm, selectedWorkerId: "" });
                    }
                  }}
                >
                  <SelectTrigger id="selectedWorkerId" data-testid="select-profile-worker">
                    <SelectValue placeholder="Seleccione un trabajador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seleccione un trabajador</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} - {worker.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área *</Label>
                <Input
                  id="area"
                  value={profileForm.area}
                  onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                  required
                  placeholder="Se llena al seleccionar trabajador"
                  data-testid="input-profile-area"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobPosition">Cargo *</Label>
                <Input
                  id="jobPosition"
                  value={profileForm.jobPosition}
                  onChange={(e) => setProfileForm({ ...profileForm, jobPosition: e.target.value })}
                  required
                  placeholder="Se llena al seleccionar trabajador"
                  data-testid="input-profile-job"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="environmentalMeasurementId">Medición Ambiental *</Label>
                <Select
                  value={profileForm.environmentalMeasurementId || "none"}
                  onValueChange={(value) => {
                    const measurementId = value === "none" ? "" : value;
                    const selectedMeasurement = noiseMeasurements.find(m => m.id === measurementId);
                    setProfileForm({ 
                      ...profileForm, 
                      environmentalMeasurementId: measurementId,
                      noiseLevel: selectedMeasurement?.valueNumeric?.toString() || profileForm.noiseLevel,
                      area: selectedMeasurement?.area || profileForm.area
                    });
                  }}
                  required
                >
                  <SelectTrigger id="environmentalMeasurementId" data-testid="select-profile-measurement">
                    <SelectValue placeholder="Seleccione una medición" />
                  </SelectTrigger>
                  <SelectContent>
                    {noiseMeasurements.length === 0 ? (
                      <SelectItem value="none" disabled>No hay mediciones de ruido registradas</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="none">Seleccione una medición</SelectItem>
                        {noiseMeasurements.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.area} - {m.valueNumeric} {m.unit} ({formatDate(m.measurementDate)})
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {noiseMeasurements.length === 0 && (
                  <div className="text-xs text-amber-600 space-y-1">
                    <p>Debe registrar mediciones ambientales de ruido antes de crear perfiles de exposición.</p>
                    <Link href="/mediciones-ambientales" className="text-teal-600 hover:underline font-medium">
                      → Ir a Mediciones Ambientales para registrar
                    </Link>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="noiseLevel">Nivel de Ruido dB(A) *</Label>
                <Input
                  id="noiseLevel"
                  type="number"
                  value={profileForm.noiseLevel}
                  onChange={(e) => setProfileForm({ ...profileForm, noiseLevel: e.target.value })}
                  required
                  placeholder="85"
                  data-testid="input-profile-noise-level"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exposureHoursDay">Horas Exposición/Día *</Label>
                <Input
                  id="exposureHoursDay"
                  type="number"
                  step="0.5"
                  value={profileForm.exposureHoursDay}
                  onChange={(e) => setProfileForm({ ...profileForm, exposureHoursDay: e.target.value })}
                  required
                  placeholder="8"
                  data-testid="input-profile-hours"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Trabajadores Expuestos ({selectedWorkerIds.length} seleccionados)</Label>
                <Card className="border">
                  <ScrollArea className="h-48">
                    <div className="p-3 space-y-2">
                      {workers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay trabajadores registrados
                        </p>
                      ) : (
                        workers.map((worker) => (
                          <div 
                            key={worker.id} 
                            className="flex items-center space-x-3 p-2 rounded-md hover-elevate"
                          >
                            <Checkbox
                              id={`worker-${worker.id}`}
                              checked={selectedWorkerIds.includes(worker.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedWorkerIds([...selectedWorkerIds, worker.id]);
                                } else {
                                  setSelectedWorkerIds(selectedWorkerIds.filter(id => id !== worker.id));
                                }
                              }}
                              data-testid={`checkbox-worker-${worker.id}`}
                            />
                            <label
                              htmlFor={`worker-${worker.id}`}
                              className="flex-1 text-sm cursor-pointer"
                            >
                              <span className="font-medium">{worker.name}</span>
                              {worker.position && (
                                <span className="text-muted-foreground ml-2">- {worker.position}</span>
                              )}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
                <p className="text-xs text-muted-foreground">
                  Seleccione los trabajadores expuestos a ruido en este perfil. Esta asignación es obligatoria según la Resolución 8321/1983 para garantizar la trazabilidad.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audiometryFrequencyMonths">Frecuencia Audiometría (meses)</Label>
                <Select
                  value={profileForm.audiometryFrequencyMonths}
                  onValueChange={(value) => setProfileForm({ ...profileForm, audiometryFrequencyMonths: value })}
                >
                  <SelectTrigger id="audiometryFrequencyMonths" data-testid="select-profile-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProfileDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
                data-testid="button-submit-profile"
              >
                {createProfileMutation.isPending || updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={audiometryDialogOpen} onOpenChange={setAudiometryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Programar Audiometría</DialogTitle>
            <DialogDescription>Programe una nueva audiometría ocupacional</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAudiometrySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workerId">Trabajador Expuesto *</Label>
              <Select
                value={audiometryForm.workerId}
                onValueChange={(value) => setAudiometryForm({ ...audiometryForm, workerId: value })}
              >
                <SelectTrigger id="workerId" data-testid="select-audiometry-worker">
                  <SelectValue placeholder="Seleccione trabajador expuesto" />
                </SelectTrigger>
                <SelectContent>
                  {exposedWorkers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay trabajadores con exposición asignada
                    </div>
                  ) : (
                    exposedWorkers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} {worker.position ? `- ${worker.position}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Solo se muestran trabajadores con perfiles de exposición asignados.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audiometryType">Tipo de Audiometría *</Label>
              <Select
                value={audiometryForm.audiometryType}
                onValueChange={(value: any) => setAudiometryForm({ ...audiometryForm, audiometryType: value })}
              >
                <SelectTrigger id="audiometryType" data-testid="select-audiometry-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="inicial_90_dias">Inicial 90 días</SelectItem>
                  <SelectItem value="periodica">Periódica</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="retiro">Retiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Fecha Programada *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={audiometryForm.scheduledDate}
                onChange={(e) => setAudiometryForm({ ...audiometryForm, scheduledDate: e.target.value })}
                required
                data-testid="input-audiometry-date"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAudiometryDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createAudiometryMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
                data-testid="button-submit-audiometry"
              >
                {createAudiometryMutation.isPending ? "Programando..." : "Programar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Resultados de Audiometría</DialogTitle>
            <DialogDescription>
              Ingrese los resultados de la evaluación audiométrica para {audiometryForResults ? getWorkerName(audiometryForResults.workerId) : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResultsSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examDate">Fecha del Examen *</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={resultsForm.examDate}
                  onChange={(e) => setResultsForm({ ...resultsForm, examDate: e.target.value })}
                  required
                  data-testid="input-results-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performedBy">Profesional</Label>
                <Input
                  id="performedBy"
                  value={resultsForm.performedBy}
                  onChange={(e) => setResultsForm({ ...resultsForm, performedBy: e.target.value })}
                  placeholder="Nombre del audiólogo"
                  data-testid="input-results-performed-by"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicName">Centro Médico</Label>
                <Input
                  id="clinicName"
                  value={resultsForm.clinicName}
                  onChange={(e) => setResultsForm({ ...resultsForm, clinicName: e.target.value })}
                  placeholder="IPS o Centro"
                  data-testid="input-results-clinic"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Oído Derecho (dB)</h4>
              <div className="grid grid-cols-6 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">500 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.rightEar500Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, rightEar500Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-right-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">1000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.rightEar1000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, rightEar1000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-right-1000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">2000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.rightEar2000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, rightEar2000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-right-2000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">3000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.rightEar3000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, rightEar3000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-right-3000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">4000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.rightEar4000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, rightEar4000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-right-4000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">6000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.rightEar6000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, rightEar6000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-right-6000"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Oído Izquierdo (dB)</h4>
              <div className="grid grid-cols-6 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">500 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.leftEar500Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, leftEar500Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-left-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">1000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.leftEar1000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, leftEar1000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-left-1000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">2000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.leftEar2000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, leftEar2000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-left-2000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">3000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.leftEar3000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, leftEar3000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-left-3000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">4000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.leftEar4000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, leftEar4000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-left-4000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">6000 Hz</Label>
                  <Input
                    type="number"
                    value={resultsForm.leftEar6000Hz}
                    onChange={(e) => setResultsForm({ ...resultsForm, leftEar6000Hz: e.target.value })}
                    placeholder="0"
                    data-testid="input-left-6000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overallResult">Resultado General *</Label>
                <Select
                  value={resultsForm.overallResult}
                  onValueChange={(value: any) => setResultsForm({ ...resultsForm, overallResult: value })}
                >
                  <SelectTrigger id="overallResult" data-testid="select-results-overall">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="trauma_leve">Trauma Leve</SelectItem>
                    <SelectItem value="trauma_moderado">Trauma Moderado</SelectItem>
                    <SelectItem value="trauma_severo">Trauma Severo</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextAudiometryDate">Próxima Audiometría</Label>
                <Input
                  id="nextAudiometryDate"
                  type="date"
                  value={resultsForm.nextAudiometryDate}
                  onChange={(e) => setResultsForm({ ...resultsForm, nextAudiometryDate: e.target.value })}
                  data-testid="input-results-next-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={resultsForm.observations}
                onChange={(e) => setResultsForm({ ...resultsForm, observations: e.target.value })}
                placeholder="Observaciones del examen..."
                data-testid="input-results-observations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendaciones</Label>
              <Textarea
                id="recommendations"
                value={resultsForm.recommendations}
                onChange={(e) => setResultsForm({ ...resultsForm, recommendations: e.target.value })}
                placeholder="Recomendaciones médicas..."
                data-testid="input-results-recommendations"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResultsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateAudiometryMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
                data-testid="button-submit-results"
              >
                {updateAudiometryMutation.isPending ? "Guardando..." : "Guardar Resultados"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingControl ? "Editar Acción de Control" : "Nueva Acción de Control"}</DialogTitle>
            <DialogDescription>Configure una acción del plan de control de ruido</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleControlSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="controlType">Tipo de Control *</Label>
                <Select
                  value={controlForm.controlType}
                  onValueChange={(value: any) => setControlForm({ ...controlForm, controlType: value, description: "", objective: "" })}
                >
                  <SelectTrigger id="controlType" data-testid="select-control-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuente">Fuente (eliminación/reducción en origen)</SelectItem>
                    <SelectItem value="medio">Medio (barreras, aislamientos)</SelectItem>
                    <SelectItem value="epp">EPP (protección auditiva)</SelectItem>
                    <SelectItem value="administrativo">Administrativo (rotación, pausas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exposureProfileId">Perfil de Exposición (opcional)</Label>
                <Select
                  value={controlForm.exposureProfileId || "none"}
                  onValueChange={(value) => {
                    const profileId = value === "none" ? "" : value;
                    const selectedProfile = profiles.find(p => p.id === profileId);
                    setControlForm({ 
                      ...controlForm, 
                      exposureProfileId: profileId,
                      preImplementationLevel: selectedProfile?.noiseLevel?.toString() || controlForm.preImplementationLevel
                    });
                  }}
                >
                  <SelectTrigger id="exposureProfileId" data-testid="select-control-profile">
                    <SelectValue placeholder="Sin asociar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asociar</SelectItem>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - {p.area} ({p.noiseLevel} dB)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="suggestedAction">Acción Sugerida (seleccione o escriba manualmente)</Label>
                <Select
                  value="custom"
                  onValueChange={(value) => {
                    if (value !== "custom") {
                      const idx = parseInt(value);
                      const suggestions = controlActionSuggestions[controlForm.controlType] || [];
                      if (suggestions[idx]) {
                        setControlForm({
                          ...controlForm,
                          description: suggestions[idx].description,
                          objective: suggestions[idx].objective
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger id="suggestedAction" data-testid="select-suggested-action">
                    <SelectValue placeholder="Seleccione una acción predefinida..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">-- Escribir manualmente --</SelectItem>
                    {(controlActionSuggestions[controlForm.controlType] || []).map((suggestion, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {suggestion.description.substring(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción de la Acción *</Label>
                <Textarea
                  id="description"
                  value={controlForm.description}
                  onChange={(e) => setControlForm({ ...controlForm, description: e.target.value })}
                  required
                  placeholder="Describa la acción de control a implementar..."
                  data-testid="input-control-description"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Input
                  id="objective"
                  value={controlForm.objective}
                  onChange={(e) => setControlForm({ ...controlForm, objective: e.target.value })}
                  placeholder="Ej: Reducir el nivel de ruido a 80 dB(A)"
                  data-testid="input-control-objective"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedDate">Fecha Planificada *</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={controlForm.plannedDate}
                  onChange={(e) => setControlForm({ ...controlForm, plannedDate: e.target.value })}
                  required
                  data-testid="input-control-planned-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementationDate">Fecha Implementación</Label>
                <Input
                  id="implementationDate"
                  type="date"
                  value={controlForm.implementationDate}
                  onChange={(e) => setControlForm({ ...controlForm, implementationDate: e.target.value })}
                  data-testid="input-control-implementation-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsable *</Label>
                <Select
                  value={controlForm.responsible || "custom"}
                  onValueChange={(value) => setControlForm({ ...controlForm, responsible: value === "custom" ? "" : value })}
                >
                  <SelectTrigger id="responsible" data-testid="select-control-responsible">
                    <SelectValue placeholder="Seleccione responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">-- Escribir nombre --</SelectItem>
                    {workers.filter(w => 
                      w.position?.toLowerCase().includes("sst") || 
                      w.position?.toLowerCase().includes("salud") || 
                      w.position?.toLowerCase().includes("seguridad") ||
                      w.position?.toLowerCase().includes("copasst") ||
                      w.position?.toLowerCase().includes("vigía")
                    ).map((w) => (
                      <SelectItem key={w.id} value={w.name}>
                        {w.name} - {w.position || "SST"}
                      </SelectItem>
                    ))}
                    {workers.filter(w => 
                      !w.position?.toLowerCase().includes("sst") && 
                      !w.position?.toLowerCase().includes("salud") &&
                      !w.position?.toLowerCase().includes("seguridad")
                    ).slice(0, 15).map((w) => (
                      <SelectItem key={w.id} value={w.name}>
                        {w.name} - {w.position || "Trabajador"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {controlForm.responsible === "" && (
                  <Input
                    className="mt-2"
                    value=""
                    onChange={(e) => setControlForm({ ...controlForm, responsible: e.target.value })}
                    placeholder="Nombre del responsable"
                    data-testid="input-control-responsible-manual"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={controlForm.status}
                  onValueChange={(value: any) => setControlForm({ ...controlForm, status: value })}
                >
                  <SelectTrigger id="status" data-testid="select-control-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificada">Planificada</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="implementada">Implementada</SelectItem>
                    <SelectItem value="verificada">Verificada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preImplementationLevel">Nivel Pre-implementación (dB)</Label>
                <Input
                  id="preImplementationLevel"
                  type="number"
                  value={controlForm.preImplementationLevel}
                  onChange={(e) => setControlForm({ ...controlForm, preImplementationLevel: e.target.value })}
                  placeholder="90"
                  data-testid="input-control-pre-level"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postImplementationLevel">Nivel Post-implementación (dB)</Label>
                <Input
                  id="postImplementationLevel"
                  type="number"
                  value={controlForm.postImplementationLevel}
                  onChange={(e) => setControlForm({ ...controlForm, postImplementationLevel: e.target.value })}
                  placeholder="80"
                  data-testid="input-control-post-level"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={controlForm.observations}
                  onChange={(e) => setControlForm({ ...controlForm, observations: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  data-testid="input-control-observations"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setControlDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createControlMutation.isPending || updateControlMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
                data-testid="button-submit-control"
              >
                {createControlMutation.isPending || updateControlMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={workersDialogOpen} onOpenChange={setWorkersDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trabajadores Asignados</DialogTitle>
            <DialogDescription>
              {viewingProfileWorkers && (
                <>Trabajadores expuestos en el perfil "{viewingProfileWorkers.name}" - {viewingProfileWorkers.area}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingProfileWorkers && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  <span>Nivel de ruido: {viewingProfileWorkers.noiseLevel} dB(A)</span>
                  <span className="mx-2">|</span>
                  <span>Exposición: {viewingProfileWorkers.exposureHoursDay} hrs/día</span>
                </div>
                <Card className="border">
                  <ScrollArea className="h-64">
                    <div className="p-3">
                      {getProfileAssignments(viewingProfileWorkers.id).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No hay trabajadores asignados a este perfil de exposición.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Cargo</TableHead>
                              <TableHead>Fecha Asignación</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getProfileAssignments(viewingProfileWorkers.id).map((assignment) => {
                              const worker = workers.find(w => w.id === assignment.workerId);
                              return (
                                <TableRow key={assignment.id}>
                                  <TableCell className="font-medium">
                                    {worker?.name || "Trabajador no encontrado"}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {worker?.position || "-"}
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(assignment.assignmentDate)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
                <p className="text-xs text-muted-foreground">
                  Según la Resolución 8321/1983, estos trabajadores deben tener audiometrías de ingreso, periódicas y retiro.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setWorkersDialogOpen(false)}
              data-testid="button-close-workers-dialog"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
