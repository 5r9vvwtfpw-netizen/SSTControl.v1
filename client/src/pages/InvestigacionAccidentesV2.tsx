import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { AccidentInvestigation, Accident } from "@shared/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  BarChart3,
  CalendarDays,
  RefreshCw
} from "lucide-react";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const EVENT_TYPES = [
  { value: "accidente_trabajo", label: "Accidente de Trabajo" },
  { value: "incidente", label: "Incidente" },
  { value: "enfermedad_laboral", label: "Enfermedad Laboral" },
];

const SEVERITY_OPTIONS = [
  { value: "leve", label: "Leve" },
  { value: "moderado", label: "Moderado" },
  { value: "grave", label: "Grave" },
  { value: "mortal", label: "Mortal" },
];

const INVESTIGATION_STATUS = [
  { value: "pendiente", label: "Pendiente", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "en_proceso", label: "En Proceso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "completada", label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "cerrada", label: "Cerrada", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
];

const SLA_STATUS = [
  { value: "en_tiempo", label: "En Tiempo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
  { value: "proximo_vencer", label: "Próximo a Vencer", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  { value: "vencido", label: "Vencido", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
];

const IMMEDIATE_CAUSES_OPTIONS = [
  { value: "operar_sin_autorizacion", label: "Operar sin autorización" },
  { value: "no_uso_epp", label: "No usar equipo de protección personal" },
  { value: "velocidad_inadecuada", label: "Velocidad inadecuada" },
  { value: "no_seguir_procedimiento", label: "No seguir procedimiento establecido" },
  { value: "posicion_inadecuada", label: "Posición inadecuada para la tarea" },
  { value: "levantar_peso_incorrecto", label: "Levantamiento incorrecto de cargas" },
];

const CONDITION_CAUSES_OPTIONS = [
  { value: "proteccion_inadecuada", label: "Protecciones inadecuadas o inexistentes" },
  { value: "herramienta_defectuosa", label: "Herramientas o equipos defectuosos" },
  { value: "orden_limpieza", label: "Falta de orden y limpieza" },
  { value: "iluminacion_deficiente", label: "Iluminación deficiente" },
  { value: "ventilacion_inadecuada", label: "Ventilación inadecuada" },
  { value: "mantenimiento_deficiente", label: "Mantenimiento deficiente" },
];

const BASIC_PERSONAL_CAUSES = [
  { value: "falta_conocimiento", label: "Falta de conocimiento o capacitación" },
  { value: "falta_habilidad", label: "Falta de habilidad para la tarea" },
  { value: "motivacion_inadecuada", label: "Motivación inadecuada" },
  { value: "estres_tension", label: "Estrés o tensión" },
  { value: "problemas_salud", label: "Problemas de salud física o mental" },
];

const BASIC_WORK_CAUSES = [
  { value: "supervision_inadecuada", label: "Supervisión inadecuada" },
  { value: "liderazgo_deficiente", label: "Liderazgo deficiente" },
  { value: "ingenieria_inadecuada", label: "Ingeniería inadecuada" },
  { value: "herramientas_inadecuadas", label: "Herramientas o equipos inadecuados" },
  { value: "mantenimiento_deficiente", label: "Mantenimiento deficiente" },
  { value: "comunicacion_deficiente", label: "Comunicación deficiente" },
];

function getSlaStatusInfo(slaStatus: string) {
  return SLA_STATUS.find(s => s.value === slaStatus) || SLA_STATUS[0];
}

function getStatusInfo(status: string) {
  return INVESTIGATION_STATUS.find(s => s.value === status) || INVESTIGATION_STATUS[0];
}

export default function InvestigacionAccidentesV2() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedCompany } = useCompanyContext();
  const companyId = selectedCompany?.id || user?.companyId;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvestigation, setEditingInvestigation] = useState<AccidentInvestigation | null>(null);
  
  const [formData, setFormData] = useState({
    accidentId: "",
    eventType: "accidente_trabajo",
    severity: "leve",
    eventDate: format(new Date(), "yyyy-MM-dd"),
    eventDescription: "",
    immediateActCauses: [] as string[],
    immediateConditionCauses: [] as string[],
    basicPersonalCauses: [] as string[],
    basicWorkCauses: [] as string[],
    rootCause: "",
    conclusions: "",
    lessonLearned: "",
  });

  const { data: investigations = [], isLoading: investigationsLoading, refetch: refetchInvestigations } = useQuery<AccidentInvestigation[]>({
    queryKey: ["/api/investigations-v2"],
    enabled: !!companyId,
  });

  const { data: accidents = [], isLoading: accidentsLoading } = useQuery<Accident[]>({
    queryKey: ["/api/accidents"],
    enabled: !!companyId,
  });

  const accidentsWithoutInvestigation = accidents.filter(
    acc => !investigations.some(inv => inv.accidentId === acc.id)
  );

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/investigations-v2", {
        ...data,
        companyId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Investigación creada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/investigations-v2"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error creating investigation:", error);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo crear la investigación",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/investigations-v2/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Investigación actualizada" });
      queryClient.invalidateQueries({ queryKey: ["/api/investigations-v2"] });
      setDialogOpen(false);
      setEditingInvestigation(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo actualizar",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/investigations-v2/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Investigación eliminada" });
      queryClient.invalidateQueries({ queryKey: ["/api/investigations-v2"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo eliminar",
        variant: "destructive" 
      });
    },
  });

  function resetForm() {
    setFormData({
      accidentId: "",
      eventType: "accidente_trabajo",
      severity: "leve",
      eventDate: format(new Date(), "yyyy-MM-dd"),
      eventDescription: "",
      immediateActCauses: [],
      immediateConditionCauses: [],
      basicPersonalCauses: [],
      basicWorkCauses: [],
      rootCause: "",
      conclusions: "",
      lessonLearned: "",
    });
  }

  function handleOpenDialog(investigation?: AccidentInvestigation) {
    if (investigation) {
      setEditingInvestigation(investigation);
      setFormData({
        accidentId: investigation.accidentId || "",
        eventType: investigation.eventType || "accidente_trabajo",
        severity: (investigation as any).severity || "leve",
        eventDate: investigation.eventDate || format(new Date(), "yyyy-MM-dd"),
        eventDescription: investigation.eventDescription || "",
        immediateActCauses: investigation.immediateActCauses || [],
        immediateConditionCauses: investigation.immediateConditionCauses || [],
        basicPersonalCauses: investigation.basicPersonalCauses || [],
        basicWorkCauses: investigation.basicWorkCauses || [],
        rootCause: investigation.rootCause || "",
        conclusions: investigation.conclusions || "",
        lessonLearned: investigation.lessonLearned || "",
      });
    } else {
      setEditingInvestigation(null);
      resetForm();
    }
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!formData.accidentId && !editingInvestigation) {
      toast({ title: "Error", description: "Seleccione un accidente", variant: "destructive" });
      return;
    }

    if (editingInvestigation) {
      updateMutation.mutate({ id: editingInvestigation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleCheckboxChange(field: 'immediateActCauses' | 'immediateConditionCauses' | 'basicPersonalCauses' | 'basicWorkCauses', value: string) {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  }

  const filteredInvestigations = investigations.filter(inv => {
    if (statusFilter !== "todos" && inv.status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        inv.eventDescription?.toLowerCase().includes(search) ||
        inv.eventType?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: investigations.length,
    completadas: investigations.filter(i => i.status === "completada" || i.status === "cerrada").length,
    enTiempo: investigations.filter(i => i.slaStatus === "en_tiempo").length,
    vencidas: investigations.filter(i => i.slaStatus === "vencido").length,
  };

  const slaCompliance = stats.total > 0 
    ? Math.round(((stats.total - stats.vencidas) / stats.total) * 100) 
    : 100;

  if (!companyId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Seleccione una empresa para ver las investigaciones.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToEvaluationButton />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Investigación de Accidentes</h1>
            <p className="text-sm text-muted-foreground">
              Estándar 3.2.1 - Resolución 0312/2019
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BackToCronogramaButton />
          <Button 
            onClick={() => handleOpenDialog()} 
            className="gap-2"
            data-testid="button-new-investigation"
          >
            <Plus className="h-4 w-4" />
            Nueva Investigación
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-investigations">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Investigaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-completed-investigations">{stats.completadas}</p>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-on-time-investigations">{stats.enTiempo}</p>
                <p className="text-sm text-muted-foreground">En Tiempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${slaCompliance >= 80 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <AlertTriangle className={`h-5 w-5 ${slaCompliance >= 80 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-sla-compliance">{slaCompliance}%</p>
                <p className="text-sm text-muted-foreground">Cumplimiento SLA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetchInvestigations()}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar investigación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {INVESTIGATION_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {investigationsLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : filteredInvestigations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay investigaciones</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "todos" 
                ? "No se encontraron investigaciones con los filtros aplicados."
                : "Comience creando una nueva investigación de accidente."}
            </p>
            {!searchTerm && statusFilter === "todos" && (
              <Button onClick={() => handleOpenDialog()} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Investigación
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvestigations.map((investigation) => {
            const statusInfo = getStatusInfo(investigation.status || "pendiente");
            const slaInfo = getSlaStatusInfo(investigation.slaStatus || "en_tiempo");
            const SlaIcon = slaInfo.icon;
            const accident = accidents.find(a => a.id === investigation.accidentId);
            
            return (
              <Card key={investigation.id} className="hover-elevate" data-testid={`card-investigation-${investigation.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        <Badge className={slaInfo.color} variant="outline">
                          <SlaIcon className="h-3 w-3 mr-1" />
                          {slaInfo.label} {investigation.daysRemaining !== null && `(${investigation.daysRemaining}d)`}
                        </Badge>
                        <Badge variant="secondary">
                          {EVENT_TYPES.find(t => t.value === investigation.eventType)?.label || investigation.eventType}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-1">
                        Investigación - {accident?.type || investigation.eventType}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Fecha evento: {investigation.eventDate ? format(new Date(investigation.eventDate), "dd/MM/yyyy", { locale: es }) : "N/A"}
                      </p>
                      {investigation.eventDescription && (
                        <p className="text-sm line-clamp-2">{investigation.eventDescription}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenDialog(investigation)}
                        data-testid={`button-edit-${investigation.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("¿Está seguro de eliminar esta investigación?")) {
                            deleteMutation.mutate(investigation.id);
                          }
                        }}
                        data-testid={`button-delete-${investigation.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvestigation ? "Editar Investigación" : "Nueva Investigación de Accidente"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos de la investigación según Resolución 1401/2007
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!editingInvestigation && (
              <div className="space-y-2">
                <Label htmlFor="accidentId">Accidente a Investigar *</Label>
                <Select 
                  value={formData.accidentId} 
                  onValueChange={(value) => {
                    const accident = accidents.find(a => a.id === value);
                    setFormData(prev => ({
                      ...prev,
                      accidentId: value,
                      eventDate: accident?.date || prev.eventDate,
                      eventDescription: accident?.description || prev.eventDescription,
                    }));
                  }}
                >
                  <SelectTrigger data-testid="select-accident">
                    <SelectValue placeholder="Seleccione un accidente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accidentsLoading ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : accidentsWithoutInvestigation.length === 0 ? (
                      <SelectItem value="none" disabled>No hay accidentes sin investigar</SelectItem>
                    ) : (
                      accidentsWithoutInvestigation.map(accident => (
                        <SelectItem key={accident.id} value={accident.id}>
                          Accidente {accident.type} ({format(new Date(accident.date), "dd/MM/yyyy")})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Select value={formData.eventType} onValueChange={(v) => setFormData(prev => ({ ...prev, eventType: v }))}>
                  <SelectTrigger data-testid="select-event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severidad</Label>
                <Select value={formData.severity} onValueChange={(v) => setFormData(prev => ({ ...prev, severity: v }))}>
                  <SelectTrigger data-testid="select-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map(sev => (
                      <SelectItem key={sev.value} value={sev.value}>{sev.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Fecha del Evento</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  data-testid="input-event-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDescription">Descripción del Evento</Label>
              <Textarea
                id="eventDescription"
                placeholder="Describa lo ocurrido..."
                value={formData.eventDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDescription: e.target.value }))}
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Actos Inseguros (Causas Inmediatas)</h4>
                {IMMEDIATE_CAUSES_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`act-${option.value}`}
                      checked={formData.immediateActCauses.includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange('immediateActCauses', option.value)}
                    />
                    <Label htmlFor={`act-${option.value}`} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Condiciones Inseguras (Causas Inmediatas)</h4>
                {CONDITION_CAUSES_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`cond-${option.value}`}
                      checked={formData.immediateConditionCauses.includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange('immediateConditionCauses', option.value)}
                    />
                    <Label htmlFor={`cond-${option.value}`} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Factores Personales (Causas Básicas)</h4>
                {BASIC_PERSONAL_CAUSES.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`personal-${option.value}`}
                      checked={formData.basicPersonalCauses.includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange('basicPersonalCauses', option.value)}
                    />
                    <Label htmlFor={`personal-${option.value}`} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Factores del Trabajo (Causas Básicas)</h4>
                {BASIC_WORK_CAUSES.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`work-${option.value}`}
                      checked={formData.basicWorkCauses.includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange('basicWorkCauses', option.value)}
                    />
                    <Label htmlFor={`work-${option.value}`} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="rootCause">Causa Raíz Identificada</Label>
              <Textarea
                id="rootCause"
                placeholder="Describa la causa raíz del accidente..."
                value={formData.rootCause}
                onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                rows={3}
                data-testid="textarea-root-cause"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conclusions">Conclusiones</Label>
                <Textarea
                  id="conclusions"
                  placeholder="Conclusiones de la investigación..."
                  value={formData.conclusions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conclusions: e.target.value }))}
                  rows={3}
                  data-testid="textarea-conclusions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonLearned">Lecciones Aprendidas</Label>
                <Textarea
                  id="lessonLearned"
                  placeholder="Lecciones aprendidas para prevenir futuros accidentes..."
                  value={formData.lessonLearned}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessonLearned: e.target.value }))}
                  rows={3}
                  data-testid="textarea-lessons"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingInvestigation ? "Guardar Cambios" : "Crear Investigación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
