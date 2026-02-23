import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Worker, HealthCondition, SociodemographicDiagnosis } from "@shared/schema";
import { format, differenceInYears, parseISO } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  UserCheck, 
  Heart, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Calendar,
  Briefcase,
  GraduationCap,
  Activity,
  ClipboardList,
  Search,
  Filter,
  Lock,
  Unlock,
  PlayCircle,
  CalendarDays
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const normativaPerfilSociodemografico = [
  {
    codigo: 'RES-2346-2007',
    norma: 'Resolución 2346/2007',
    articulo: 'Completa',
    descripcion: 'Evaluaciones médicas ocupacionales y manejo de historias clínicas',
    requisitos: [
      'Caracterización sociodemográfica de trabajadores',
      'Diagnóstico de condiciones de salud',
      'Análisis epidemiológico del grupo de trabajadores',
      'Información base para vigilancia epidemiológica'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.24',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.24',
    descripcion: 'Medidas de prevención y control',
    requisitos: [
      'Conocimiento del perfil de la población trabajadora',
      'Identificación de condiciones de salud prevalentes',
      'Base para programas de vigilancia epidemiológica',
      'Seguimiento a condiciones de salud identificadas'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-3.1.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 3.1.1',
    descripcion: 'Descripción sociodemográfica y diagnóstico de condiciones de salud',
    requisitos: [
      'Documento actualizado con perfil sociodemográfico',
      'Diagnóstico de condiciones de salud de trabajadores',
      'Información mínima: género, edad, escolaridad, antigüedad',
      'Disponibilidad del documento para verificación'
    ],
    obligatorio: true
  }
];

const conditionTypeLabels: Record<string, string> = {
  cronica: "Condición Crónica",
  temporal: "Condición Temporal",
  discapacidad: "Discapacidad",
  restriccion: "Restricción Laboral"
};

const conditionStatusLabels: Record<string, string> = {
  activo: "Activo",
  en_seguimiento: "En Seguimiento",
  controlado: "Controlado",
  cerrado: "Cerrado"
};

export default function PerfilSociodemografico() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("resumen");

  const [formData, setFormData] = useState({
    workerId: "",
    conditionType: "cronica" as "cronica" | "temporal" | "discapacidad" | "restriccion",
    description: "",
    diagnosisDate: "",
    status: "activo" as "activo" | "en_seguimiento" | "controlado" | "cerrado",
    requiresFollowUp: false,
    followUpDate: "",
    observations: "",
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeObservations, setCloseObservations] = useState("");

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch('/api/reportes/perfil-sociodemografico/pdf', {
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
      a.download = `perfil-sociodemografico-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Documento descargado",
        description: "El PDF del perfil sociodemográfico se ha descargado exitosamente",
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

  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: healthConditions = [], isLoading: isLoadingConditions } = useQuery<HealthCondition[]>({
    queryKey: ["/api/health-conditions"],
  });

  const { data: currentDiagnosis } = useQuery<SociodemographicDiagnosis | null>({
    queryKey: ["/api/sociodemographic-diagnosis/current"],
  });

  const openDiagnosisMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sociodemographic-diagnosis");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sociodemographic-diagnosis/current"] });
      toast({
        title: "Diagnóstico abierto",
        description: `Se ha abierto el ciclo de diagnóstico sociodemográfico para el año ${new Date().getFullYear()}`,
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo abrir el diagnóstico",
        variant: "destructive",
      });
    }
  });

  const closeDiagnosisMutation = useMutation({
    mutationFn: async (data: { totalWorkers: number; totalConditions: number; observations?: string }) => {
      const res = await apiRequest("POST", `/api/sociodemographic-diagnosis/${currentDiagnosis?.id}/close`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sociodemographic-diagnosis/current"] });
      setCloseDialogOpen(false);
      setCloseObservations("");
      toast({
        title: "Diagnóstico cerrado",
        description: "El ciclo de diagnóstico sociodemográfico ha sido cerrado exitosamente",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cerrar el diagnóstico",
        variant: "destructive",
      });
    }
  });

  const handleCloseDiagnosis = () => {
    const activeWorkers = workers.filter(w => w.status === "activo");
    closeDiagnosisMutation.mutate({
      totalWorkers: activeWorkers.length,
      totalConditions: healthConditions.length,
      observations: closeObservations || undefined,
    });
  };

  const createConditionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/health-conditions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-conditions"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Condición registrada",
        description: "La condición de salud se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la condición",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      workerId: "",
      conditionType: "cronica",
      description: "",
      diagnosisDate: "",
      status: "activo",
      requiresFollowUp: false,
      followUpDate: "",
      observations: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    if (!formData.workerId || !formData.description || !formData.diagnosisDate) {
      console.log("Validation failed - missing required fields");
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios (Trabajador, Descripción, Fecha)",
        variant: "destructive",
      });
      return;
    }
    
    createConditionMutation.mutate({
      companyId: user?.companyId,
      workerId: formData.workerId,
      conditionType: formData.conditionType,
      description: formData.description,
      diagnosisDate: formData.diagnosisDate,
      status: formData.status,
      requiresFollowUp: formData.requiresFollowUp ? 1 : 0,
      followUpDate: formData.requiresFollowUp ? formData.followUpDate : null,
      observations: formData.observations || null,
      registeredBy: user?.id
    });
  };

  const sociodemographicStats = useMemo(() => {
    const activeWorkers = workers.filter(w => w.status === "activo");
    const total = activeWorkers.length;

    const genderDistribution = {
      masculino: 0,
      femenino: 0,
      otro: 0,
      sin_info: 0
    };

    const ageRanges = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "55+": 0
    };

    const educationLevels = {
      primaria: 0,
      secundaria: 0,
      tecnico: 0,
      tecnologo: 0,
      profesional: 0,
      posgrado: 0,
      sin_info: 0
    };

    const civilStatus = {
      soltero: 0,
      casado: 0,
      union_libre: 0,
      divorciado: 0,
      viudo: 0,
      sin_info: 0
    };

    const seniorityRanges = {
      "0-1": 0,
      "1-3": 0,
      "3-5": 0,
      "5-10": 0,
      "10+": 0
    };

    activeWorkers.forEach(worker => {
      if (worker.gender) {
        if (worker.gender === "masculino") genderDistribution.masculino++;
        else if (worker.gender === "femenino") genderDistribution.femenino++;
        else if (worker.gender === "otro" || worker.gender === "prefiero_no_decir") genderDistribution.otro++;
        else genderDistribution.sin_info++;
      } else {
        genderDistribution.sin_info++;
      }

      if (worker.birthDate) {
        const age = differenceInYears(new Date(), parseISO(worker.birthDate));
        if (age <= 25) ageRanges["18-25"]++;
        else if (age <= 35) ageRanges["26-35"]++;
        else if (age <= 45) ageRanges["36-45"]++;
        else if (age <= 55) ageRanges["46-55"]++;
        else ageRanges["55+"]++;
      }

      if (worker.educationLevel) {
        const level = worker.educationLevel;
        if (level === "primaria") educationLevels.primaria++;
        else if (level === "secundaria") educationLevels.secundaria++;
        else if (level === "tecnico") educationLevels.tecnico++;
        else if (level === "tecnologo") educationLevels.tecnologo++;
        else if (level === "profesional") educationLevels.profesional++;
        else if (["especializacion", "maestria", "doctorado"].includes(level)) educationLevels.posgrado++;
        else educationLevels.sin_info++;
      } else {
        educationLevels.sin_info++;
      }

      if (worker.civilStatus) {
        const status = worker.civilStatus;
        if (status === "soltero") civilStatus.soltero++;
        else if (status === "casado") civilStatus.casado++;
        else if (status === "union_libre") civilStatus.union_libre++;
        else if (status === "divorciado") civilStatus.divorciado++;
        else if (status === "viudo") civilStatus.viudo++;
        else civilStatus.sin_info++;
      } else {
        civilStatus.sin_info++;
      }

      if (worker.startDate) {
        const years = differenceInYears(new Date(), parseISO(worker.startDate));
        if (years < 1) seniorityRanges["0-1"]++;
        else if (years < 3) seniorityRanges["1-3"]++;
        else if (years < 5) seniorityRanges["3-5"]++;
        else if (years < 10) seniorityRanges["5-10"]++;
        else seniorityRanges["10+"]++;
      } else {
        seniorityRanges["0-1"]++;
      }
    });

    return {
      total,
      genderDistribution,
      ageRanges,
      educationLevels,
      civilStatus,
      seniorityRanges
    };
  }, [workers]);

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Sin nombre";
  };

  const filteredConditions = useMemo(() => {
    return healthConditions.filter(condition => {
      const workerName = getWorkerName(condition.workerId);
      const matchesSearch = searchTerm === "" || 
        workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = conditionFilter === "all" || condition.conditionType === conditionFilter;
      return matchesSearch && matchesFilter;
    });
  }, [healthConditions, searchTerm, conditionFilter, workers]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "activo": return "bg-red-500";
      case "en_seguimiento": return "bg-yellow-500";
      case "controlado": return "bg-green-500";
      case "cerrado": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getConditionTypeBadgeColor = (type: string) => {
    switch (type) {
      case "cronica": return "bg-purple-500";
      case "temporal": return "bg-blue-500";
      case "discapacidad": return "bg-orange-500";
      case "restriccion": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const complianceChecklist = [
    { id: 1, item: "Documento de caracterización sociodemográfica actualizado", completed: workers.length > 0 },
    { id: 2, item: "Información de género de la población trabajadora", completed: true },
    { id: 3, item: "Información de distribución por rangos de edad", completed: true },
    { id: 4, item: "Información de nivel de escolaridad", completed: true },
    { id: 5, item: "Información de estado civil", completed: true },
    { id: 6, item: "Información de antigüedad en la empresa", completed: workers.length > 0 },
    { id: 7, item: "Diagnóstico de condiciones de salud identificadas", completed: healthConditions.length > 0 },
    { id: 8, item: "Documento disponible para verificación de autoridades", completed: true },
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
            Perfil Sociodemográfico y Condiciones de Salud
          </h1>
          <p className="text-muted-foreground">
            Estándar 3.1.1 - Resolución 0312/2019
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-condition">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Condición de Salud
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Condición de Salud</DialogTitle>
              <DialogDescription>
                Registre una condición de salud identificada en un trabajador
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workerId">Trabajador *</Label>
                  <Select
                    value={formData.workerId}
                    onValueChange={(value) => setFormData({ ...formData, workerId: value })}
                  >
                    <SelectTrigger id="workerId" data-testid="select-worker">
                      <SelectValue placeholder="Seleccionar trabajador" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name} - {worker.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditionType">Tipo de Condición *</Label>
                  <Select
                    value={formData.conditionType}
                    onValueChange={(value: any) => setFormData({ ...formData, conditionType: value })}
                  >
                    <SelectTrigger id="conditionType" data-testid="select-condition-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cronica">Condición Crónica</SelectItem>
                      <SelectItem value="temporal">Condición Temporal</SelectItem>
                      <SelectItem value="discapacidad">Discapacidad</SelectItem>
                      <SelectItem value="restriccion">Restricción Laboral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción de la Condición *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describa la condición de salud identificada"
                    required
                    data-testid="input-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosisDate">Fecha de Diagnóstico *</Label>
                  <Input
                    id="diagnosisDate"
                    type="date"
                    value={formData.diagnosisDate}
                    onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                    required
                    data-testid="input-diagnosis-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="en_seguimiento">En Seguimiento</SelectItem>
                      <SelectItem value="controlado">Controlado</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresFollowUp"
                      checked={formData.requiresFollowUp}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresFollowUp: checked as boolean })}
                      data-testid="checkbox-requires-follow-up"
                    />
                    <Label htmlFor="requiresFollowUp">Requiere seguimiento</Label>
                  </div>
                </div>
                {formData.requiresFollowUp && (
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate">Próxima Fecha de Seguimiento</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      data-testid="input-follow-up-date"
                    />
                  </div>
                )}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Observaciones adicionales"
                    data-testid="input-observations"
                  />
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
                  disabled={createConditionMutation.isPending}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={!formData.workerId || !formData.description || !formData.diagnosisDate || createConditionMutation.isPending}
                  data-testid="button-submit"
                >
                  {createConditionMutation.isPending ? "Guardando..." : "Registrar Condición"}
                </Button>
              </DialogFooter>
              {(!formData.workerId || !formData.description || !formData.diagnosisDate) && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Complete los campos marcados con * para habilitar el botón
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AutomationAssistant 
        titulo="Perfil Sociodemográfico"
        estandar="3.1.1"
        descripcion="Caracterización sociodemográfica y diagnóstico de condiciones de salud de trabajadores"
        normativaAplicable={normativaPerfilSociodemografico}
        compact={true}
      />

      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {currentDiagnosis ? (
                <>
                  <Unlock className="h-5 w-5 text-green-600" />
                  Ciclo de Diagnóstico {currentDiagnosis.year}
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  Ciclo de Diagnóstico
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentDiagnosis 
                ? `Diagnóstico abierto desde ${format(new Date(currentDiagnosis.openedAt), "dd/MM/yyyy", { locale: es })}`
                : "No hay un ciclo de diagnóstico activo para este año"
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {currentDiagnosis ? (
              <>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Unlock className="h-3 w-3 mr-1" />
                  Abierto
                </Badge>
                <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-close-diagnosis">
                      <Lock className="h-4 w-4 mr-2" />
                      Cerrar Diagnóstico
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cerrar Ciclo de Diagnóstico Sociodemográfico</DialogTitle>
                      <DialogDescription>
                        Esta acción marcará el diagnóstico del año {currentDiagnosis.year} como completado.
                        Se registrará la fecha de cierre y los datos actuales.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Trabajadores Activos</Label>
                          <div className="text-2xl font-bold">{workers.filter(w => w.status === "activo").length}</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Condiciones de Salud</Label>
                          <div className="text-2xl font-bold">{healthConditions.length}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closeObservations">Observaciones del cierre (opcional)</Label>
                        <Textarea
                          id="closeObservations"
                          value={closeObservations}
                          onChange={(e) => setCloseObservations(e.target.value)}
                          placeholder="Ingrese observaciones sobre el cierre del diagnóstico..."
                          data-testid="input-close-observations"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCloseDialogOpen(false)}
                        disabled={closeDiagnosisMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCloseDiagnosis}
                        disabled={closeDiagnosisMutation.isPending}
                        data-testid="button-confirm-close-diagnosis"
                      >
                        {closeDiagnosisMutation.isPending ? "Cerrando..." : "Confirmar Cierre"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Button 
                onClick={() => openDiagnosisMutation.mutate()}
                disabled={openDiagnosisMutation.isPending}
                data-testid="button-open-diagnosis"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {openDiagnosisMutation.isPending ? "Abriendo..." : "Abrir Diagnóstico " + new Date().getFullYear()}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-workers">
              {sociodemographicStats.total}
            </div>
            <p className="text-xs text-muted-foreground">Trabajadores activos caracterizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribución Género</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-gender">
              {sociodemographicStats.genderDistribution.masculino}M / {sociodemographicStats.genderDistribution.femenino}F
            </div>
            <p className="text-xs text-muted-foreground">Masculino / Femenino</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rango de Edad Predominante</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-age-range">
              {Object.entries(sociodemographicStats.ageRanges).reduce((a, b) => a[1] > b[1] ? a : b)[0]} años
            </div>
            <p className="text-xs text-muted-foreground">Mayor concentración de trabajadores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Condiciones de Salud</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-health-conditions">
              {healthConditions.length}
            </div>
            <p className="text-xs text-muted-foreground">Condiciones identificadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen" data-testid="tab-resumen">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen Sociodemográfico
          </TabsTrigger>
          <TabsTrigger value="condiciones" data-testid="tab-condiciones">
            <Activity className="h-4 w-4 mr-2" />
            Condiciones de Salud
          </TabsTrigger>
          <TabsTrigger value="documento" data-testid="tab-documento">
            <FileText className="h-4 w-4 mr-2" />
            Documento Consolidado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Distribución por Género
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Masculino</span>
                    <span>{sociodemographicStats.genderDistribution.masculino}</span>
                  </div>
                  <Progress 
                    value={sociodemographicStats.total ? (sociodemographicStats.genderDistribution.masculino / sociodemographicStats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Femenino</span>
                    <span>{sociodemographicStats.genderDistribution.femenino}</span>
                  </div>
                  <Progress 
                    value={sociodemographicStats.total ? (sociodemographicStats.genderDistribution.femenino / sociodemographicStats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                {sociodemographicStats.genderDistribution.otro > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Otro</span>
                      <span>{sociodemographicStats.genderDistribution.otro}</span>
                    </div>
                    <Progress 
                      value={sociodemographicStats.total ? (sociodemographicStats.genderDistribution.otro / sociodemographicStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                )}
                {sociodemographicStats.genderDistribution.sin_info > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sin información</span>
                      <span className="text-muted-foreground">{sociodemographicStats.genderDistribution.sin_info}</span>
                    </div>
                    <Progress 
                      value={sociodemographicStats.total ? (sociodemographicStats.genderDistribution.sin_info / sociodemographicStats.total) * 100 : 0} 
                      className="h-2 bg-muted"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Distribución por Edad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(sociodemographicStats.ageRanges).map(([range, count]) => (
                  <div key={range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{range} años</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={sociodemographicStats.total ? (count / sociodemographicStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Nivel Educativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(sociodemographicStats.educationLevels)
                  .filter(([_, count]) => count > 0)
                  .map(([level, count]) => (
                  <div key={level} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{level.replace('_', ' ')}</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={sociodemographicStats.total ? (count / sociodemographicStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Estado Civil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(sociodemographicStats.civilStatus)
                  .filter(([_, count]) => count > 0)
                  .map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={sociodemographicStats.total ? (count / sociodemographicStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Antigüedad en la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(sociodemographicStats.seniorityRanges).map(([range, count]) => (
                  <div key={range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{range} años</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={sociodemographicStats.total ? (count / sociodemographicStats.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Condiciones por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(conditionTypeLabels).map(([type, label]) => {
                  const count = healthConditions.filter(c => c.conditionType === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        <TabsContent value="condiciones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Condiciones de Salud Identificadas</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="cronica">Condición Crónica</SelectItem>
                      <SelectItem value="temporal">Condición Temporal</SelectItem>
                      <SelectItem value="discapacidad">Discapacidad</SelectItem>
                      <SelectItem value="restriccion">Restricción Laboral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Condición</TableHead>
                    <TableHead>Fecha Diagnóstico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Seguimiento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConditions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No se encontraron condiciones de salud registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConditions.map((condition) => (
                      <TableRow key={condition.id} data-testid={`row-condition-${condition.id}`}>
                        <TableCell className="font-medium">{getWorkerName(condition.workerId)}</TableCell>
                        <TableCell>
                          <Badge className={getConditionTypeBadgeColor(condition.conditionType)}>
                            {conditionTypeLabels[condition.conditionType]}
                          </Badge>
                        </TableCell>
                        <TableCell>{condition.description}</TableCell>
                        <TableCell>
                          {format(parseISO(condition.diagnosisDate), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(condition.status)}>
                            {conditionStatusLabels[condition.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {condition.requiresFollowUp && condition.followUpDate ? (
                            <span className="text-sm">
                              {format(parseISO(condition.followUpDate), "dd/MM/yyyy", { locale: es })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documento" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Checklist de Cumplimiento - Estándar 3.1.1
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
                  Documento Consolidado
                </CardTitle>
                <CardDescription>
                  Descarga el documento requerido por el estándar 3.1.1
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Perfil Sociodemográfico y Condiciones de Salud</p>
                      <p className="text-sm text-muted-foreground">
                        Documento PDF consolidado
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Contenido del documento:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Caracterización sociodemográfica de {sociodemographicStats.total} trabajadores</li>
                      <li>Distribución por género, edad, escolaridad</li>
                      <li>Análisis de antigüedad en la empresa</li>
                      <li>Diagnóstico de {healthConditions.length} condiciones de salud</li>
                      <li>Fecha de generación: {format(new Date(), "dd/MM/yyyy", { locale: es })}</li>
                    </ul>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  data-testid="button-download-document"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading || sociodemographicStats.total === 0}
                >
                  {isDownloading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generando documento...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Documento Consolidado
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Ejecutivo</CardTitle>
              <CardDescription>
                Información consolidada para presentación ante autoridades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Población Caracterizada</h4>
                  <p className="text-3xl font-bold text-primary">{sociodemographicStats.total}</p>
                  <p className="text-sm text-muted-foreground">Trabajadores activos en el sistema</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Condiciones Identificadas</h4>
                  <p className="text-3xl font-bold text-primary">{healthConditions.length}</p>
                  <p className="text-sm text-muted-foreground">Condiciones de salud registradas</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cumplimiento Estándar</h4>
                  <p className="text-3xl font-bold text-primary">{compliancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Requisitos del estándar 3.1.1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
