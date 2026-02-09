import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Download, CheckCircle, Plus, Edit, Trash2, Calendar, TrendingUp, BarChart3, Bot, Sparkles, ListChecks, Clock, AlertTriangle, HelpCircle, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertActividadPlanTrabajoSchema } from "@shared/schema";
import type { PlanTrabajoAnual, ActividadPlanTrabajo } from "@shared/schema";
import { PROGRAMAS_SST_LABELS, CICLOS_PHVA_LABELS, MESES_LABELS } from "@/lib/actividades-plan-trabajo-predefinidas";
import { CronogramaMensual } from "@/components/CronogramaMensual";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const PROGRAMAS_SST = [
  { id: "identificacion-peligros", nombre: "Identificación de Peligros" },
  { id: "medicina-preventiva", nombre: "Medicina Preventiva" },
  { id: "higiene-seguridad", nombre: "Higiene y Seguridad" },
  { id: "riesgo-psicosocial", nombre: "Riesgo Psicosocial" },
  { id: "seguridad-vial", nombre: "Seguridad Vial (PESV)" },
  { id: "emergencias", nombre: "Emergencias" },
  { id: "vigilancia-epidemiologica", nombre: "Vigilancia Epidemiológica" },
  { id: "capacitacion", nombre: "Capacitación" },
  { id: "inspeccion", nombre: "Inspecciones" },
  { id: "epp", nombre: "EPP" },
  { id: "otro", nombre: "Gestión General" },
];

const MESES = [
  { id: "enero", nombre: "Enero", numero: 1 },
  { id: "febrero", nombre: "Febrero", numero: 2 },
  { id: "marzo", nombre: "Marzo", numero: 3 },
  { id: "abril", nombre: "Abril", numero: 4 },
  { id: "mayo", nombre: "Mayo", numero: 5 },
  { id: "junio", nombre: "Junio", numero: 6 },
  { id: "julio", nombre: "Julio", numero: 7 },
  { id: "agosto", nombre: "Agosto", numero: 8 },
  { id: "septiembre", nombre: "Septiembre", numero: 9 },
  { id: "octubre", nombre: "Octubre", numero: 10 },
  { id: "noviembre", nombre: "Noviembre", numero: 11 },
  { id: "diciembre", nombre: "Diciembre", numero: 12 },
];

const calcularTrimestre = (mesId: string): number => {
  const mesInfo = MESES.find(m => m.id === mesId);
  if (!mesInfo) return 1;
  return Math.ceil(mesInfo.numero / 3);
};

interface PlanInsights {
  resumen: {
    total: number;
    completadas: number;
    enProceso: number;
    pendientes: number;
    reprogramadas: number;
    canceladas: number;
    porcentajeCumplimiento: number;
  };
  byPrograma: Record<string, { total: number; completadas: number; pendientes: number }>;
  byMes: Array<{ mes: string; total: number; completadas: number; pendientes: number; enProceso: number }>;
  byCiclo: Record<string, { total: number; completadas: number }>;
  metaCumplimiento: number;
}

interface AgendaData {
  anio: number;
  agenda: Record<string, ActividadPlanTrabajo[]>;
  byTrimestre: Array<{ numero: number; nombre: string; meses: string[]; actividades: ActividadPlanTrabajo[]; total: number; completadas: number }>;
  totalActividades: number;
}

export default function DetallePlanTrabajo() {
  const { id } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Leer el query param 'tab' para activar la pestaña correcta
  const getInitialTab = () => {
    const params = new URLSearchParams(searchString);
    const tabParam = params.get("tab");
    if (tabParam === "mensual" || tabParam === "cronograma") {
      return "mensual";
    }
    return "dashboard";
  };
  
  // Leer el query param 'mes' para restaurar el mes del cronograma
  const getMesFromUrl = () => {
    const params = new URLSearchParams(searchString);
    return params.get("mes") || undefined;
  };
  
  const [mainTab, setMainTab] = useState(getInitialTab);
  const [selectedPrograma, setSelectedPrograma] = useState<string>(PROGRAMAS_SST[0].id);
  
  // Actualizar tab si cambia el query param (por navegación)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tabParam = params.get("tab");
    if (tabParam === "mensual" || tabParam === "cronograma") {
      setMainTab("mensual");
    }
  }, [searchString]);
  
  // Guardar el ID del plan en localStorage para BackToCronogramaButton
  useEffect(() => {
    if (id) {
      localStorage.setItem("lastPlanTrabajoId", id);
    }
  }, [id]);
  const [actividadDialogOpen, setActividadDialogOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState<ActividadPlanTrabajo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState<string | null>(null);
  const [selectedMes, setSelectedMes] = useState<string | null>(null);

  const { data: plan, isLoading: loadingPlan } = useQuery<PlanTrabajoAnual>({
    queryKey: ["/api/planes-trabajo-anual", id],
    enabled: !!id,
  });

  const { data: actividades = [], isLoading: loadingActividades } = useQuery<ActividadPlanTrabajo[]>({
    queryKey: ["/api/planes-trabajo-anual", id, "actividades"],
    enabled: !!id,
  });

  const { data: insights } = useQuery<PlanInsights>({
    queryKey: ["/api/planes-trabajo-anual", id, "insights"],
    enabled: !!id,
  });

  const { data: agenda } = useQuery<AgendaData>({
    queryKey: ["/api/planes-trabajo-anual", id, "agenda"],
    enabled: !!id,
  });

  const actividadForm = useForm<z.infer<typeof insertActividadPlanTrabajoSchema>>({
    resolver: zodResolver(insertActividadPlanTrabajoSchema),
    defaultValues: {
      planTrabajoId: id || "",
      programa: "medicina-preventiva" as any,
      actividad: "",
      objetivo: "",
      meta: "",
      responsable: "",
      cargo: "",
      mes: "enero" as any,
      trimestre: 1,
      recursosFinancieros: 0,
      estado: "pendiente" as any,
      observaciones: "",
    },
  });

  const generateCalendarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/planes-trabajo-anual/${id}/generate`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "actividades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "agenda"] });
      toast({
        title: "Calendario generado",
        description: `Se han creado ${data.totalActividades} actividades automáticamente basadas en el Decreto 1072/2015`,
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

  const syncCalendarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/planes-trabajo-anual/${id}/generate?force=true`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "actividades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "agenda"] });
      toast({
        title: "Calendario sincronizado",
        description: `Se han regenerado ${data.totalActividades} actividades con la plantilla actualizada`,
        className: "bg-blue-50 border-blue-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al sincronizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createActividadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertActividadPlanTrabajoSchema>) => {
      const res = await apiRequest("POST", "/api/actividades-plan-trabajo", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "actividades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "agenda"] });
      setActividadDialogOpen(false);
      actividadForm.reset();
      toast({
        title: "Actividad creada",
        description: "La actividad se ha agregado exitosamente al plan",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateActividadMutation = useMutation({
    mutationFn: async ({ id: actId, ...data }: Partial<ActividadPlanTrabajo> & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/actividades-plan-trabajo/${actId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "actividades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "agenda"] });
      setActividadDialogOpen(false);
      setEditingActividad(null);
      actividadForm.reset();
      toast({
        title: "Actividad actualizada",
        description: "Los cambios se han guardado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteActividadMutation = useMutation({
    mutationFn: async (actId: string) => {
      const res = await apiRequest("DELETE", `/api/actividades-plan-trabajo/${actId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "actividades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id, "agenda"] });
      setDeleteDialogOpen(false);
      setActividadToDelete(null);
      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado del plan",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const aprobarPlanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/planes-trabajo-anual/${id}`, {
        estado: "aprobado",
        fechaAprobacion: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", id] });
      toast({
        title: "Plan aprobado",
        description: "El plan de trabajo ha sido aprobado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/planes-trabajo-anual/${id}/pdf`, { credentials: "include" });
      if (!response.ok) throw new Error("Error al generar el PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan-trabajo-anual-${plan?.anio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "PDF generado", description: "El documento se ha descargado correctamente", className: "bg-yellow-50 border-yellow-200" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Error al generar el PDF", variant: "destructive" });
    }
  };

  const onSubmitActividad = (values: z.infer<typeof insertActividadPlanTrabajoSchema>) => {
    const trimestre = calcularTrimestre(values.mes);
    const dataToSubmit = { ...values, trimestre, planTrabajoId: id || "" };
    if (editingActividad) {
      updateActividadMutation.mutate({ 
        id: editingActividad.id,
        programa: dataToSubmit.programa,
        actividad: dataToSubmit.actividad,
        objetivo: dataToSubmit.objetivo,
        meta: dataToSubmit.meta,
        responsable: dataToSubmit.responsable,
        cargo: dataToSubmit.cargo,
        mes: dataToSubmit.mes,
        trimestre: dataToSubmit.trimestre,
        recursosFinancieros: dataToSubmit.recursosFinancieros,
        estado: dataToSubmit.estado,
        observaciones: dataToSubmit.observaciones,
      });
    } else {
      createActividadMutation.mutate(dataToSubmit);
    }
  };

  const handleEditActividad = (actividad: ActividadPlanTrabajo) => {
    setEditingActividad(actividad);
    actividadForm.reset({
      planTrabajoId: actividad.planTrabajoId,
      programa: actividad.programa,
      actividad: actividad.actividad,
      objetivo: actividad.objetivo,
      meta: actividad.meta,
      responsable: actividad.responsable,
      cargo: actividad.cargo,
      mes: actividad.mes,
      trimestre: actividad.trimestre,
      recursosFinancieros: actividad.recursosFinancieros || 0,
      estado: actividad.estado,
      observaciones: actividad.observaciones || "",
    });
    setActividadDialogOpen(true);
  };

  const handleDeleteActividad = (actId: string) => {
    setActividadToDelete(actId);
    setDeleteDialogOpen(true);
  };

  const handleNewActividad = () => {
    setEditingActividad(null);
    actividadForm.reset({
      planTrabajoId: id || "",
      programa: selectedPrograma as any,
      actividad: "",
      objetivo: "",
      meta: "",
      responsable: "",
      cargo: "",
      mes: "enero" as any,
      trimestre: 1,
      recursosFinancieros: 0,
      estado: "pendiente" as any,
      observaciones: "",
    });
    setActividadDialogOpen(true);
  };

  if (loadingPlan || loadingActividades) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando plan de trabajo...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Plan de trabajo no encontrado</p>
      </div>
    );
  }

  const actividadesPorPrograma = actividades.filter((a) => a.programa === selectedPrograma);

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { label: string; className: string }> = {
      borrador: { label: "Borrador", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      aprobado: { label: "Aprobado", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      "en-ejecucion": { label: "En Ejecución", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      finalizado: { label: "Finalizado", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    };
    const { label, className } = config[estado] || config.borrador;
    return <Badge className={className} data-testid={`badge-estado-${estado}`}>{label}</Badge>;
  };

  const getEstadoActividadBadge = (estado: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pendiente: { label: "Pendiente", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      "en-proceso": { label: "En Progreso", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      completada: { label: "Completada", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      cancelada: { label: "Cancelada", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
      reprogramada: { label: "Reprogramada", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
    };
    const { label, className } = config[estado] || config.pendiente;
    return <Badge className={className}>{label}</Badge>;
  };

  const getCicloColor = (ciclo: string) => {
    const colors: Record<string, string> = {
      planear: "bg-blue-500",
      hacer: "bg-green-500",
      verificar: "bg-yellow-500",
      actuar: "bg-red-500",
    };
    return colors[ciclo] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setLocation("/planes-trabajo-anual")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Plan Anual de Trabajo {plan.anio}</h1>
          <p className="text-muted-foreground">Elaborado por: {plan.responsableElaboracion}</p>
        </div>
        <div className="flex items-center gap-2">
          {getEstadoBadge(plan.estado)}
          {plan.estado === "borrador" && (
            <Button variant="default" onClick={() => aprobarPlanMutation.mutate()} disabled={aprobarPlanMutation.isPending} data-testid="button-approve">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar Plan
            </Button>
          )}
          <Button variant="outline" onClick={handleDownloadPDF} data-testid="button-download-pdf">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Panel
          </TabsTrigger>
          <TabsTrigger value="mensual" data-testid="tab-mensual">
            <Calendar className="h-4 w-4 mr-2" />
            Cronograma
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  Total Actividades
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        <strong>Ocurrencias:</strong> Suma de todas las ejecuciones programadas durante el año (una actividad puede ejecutarse varios meses).
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Actividades únicas:</strong> Cantidad de actividades diferentes definidas en el plan.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights?.resumen?.total || actividades.length}</div>
                <p className="text-xs text-muted-foreground mt-1">ocurrencias en el año</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  {actividades.length} actividades únicas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{insights?.resumen?.porcentajeCumplimiento || 0}%</div>
                <Progress value={insights?.resumen?.porcentajeCumplimiento || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Meta: {insights?.metaCumplimiento || 90}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{insights?.resumen?.enProceso || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{insights?.resumen?.pendientes || 0} pendientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{insights?.resumen?.completadas || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">de {actividades.length} actividades</p>
              </CardContent>
            </Card>
          </div>

          {actividades.length === 0 && (
            <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Asistente Inteligente de Plan de Trabajo</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Genere automáticamente un calendario completo de actividades SST basado en el Decreto 1072/2015, 
                      Resolución 0312/2019 y GTC-45. Incluye 55 actividades organizadas por ciclo PHVA.
                    </p>
                    <Button
                      onClick={() => generateCalendarMutation.mutate()}
                      disabled={generateCalendarMutation.isPending}
                      variant="default"
                      data-testid="button-generate-calendar"
                    >
                      {generateCalendarMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Crear Calendario Automático
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {insights?.byCiclo && (
            <Card>
              <CardHeader>
                <CardTitle>Cumplimiento por Ciclo PHVA</CardTitle>
                <CardDescription>Distribución de actividades según el ciclo de mejora continua</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(insights.byCiclo).map(([ciclo, data]) => (
                    <div key={ciclo} className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getCicloColor(ciclo)}`} />
                      <p className="font-semibold uppercase text-sm">{ciclo}</p>
                      <p className="text-2xl font-bold">{data.total}</p>
                      <p className="text-xs text-muted-foreground">{data.completadas} completadas</p>
                      <Progress value={data.total > 0 ? (data.completadas / data.total) * 100 : 0} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights?.byPrograma && Object.keys(insights.byPrograma).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actividades por Programa SST</CardTitle>
                <CardDescription>Avance por cada programa del Sistema de Gestión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(insights.byPrograma).map(([programa, data]) => (
                    <div key={programa} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{PROGRAMAS_SST_LABELS[programa as keyof typeof PROGRAMAS_SST_LABELS] || programa}</span>
                        <span className="text-muted-foreground">{data.completadas}/{data.total}</span>
                      </div>
                      <Progress value={data.total > 0 ? (data.completadas / data.total) * 100 : 0} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mensual" className="space-y-6">
          {actividades.length === 0 ? (
            <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Sin actividades programadas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Genere el calendario automáticamente para ver la vista mensual.
                </p>
                <Button onClick={() => generateCalendarMutation.mutate()} disabled={generateCalendarMutation.isPending} data-testid="button-generate-calendar-mensual">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Crear Calendario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("¿Está seguro de sincronizar? Esto eliminará las actividades actuales y las regenerará con la plantilla actualizada.")) {
                          syncCalendarMutation.mutate();
                        }
                      }}
                      disabled={syncCalendarMutation.isPending}
                      data-testid="button-sync-calendar"
                    >
                      {syncCalendarMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar con Plantilla
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenera las actividades con la plantilla actualizada (elimina las existentes)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CronogramaMensual 
                actividades={actividades} 
                planId={id!} 
                anio={plan.anio}
                mesInicial={getMesFromUrl()}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={actividadDialogOpen} onOpenChange={setActividadDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActividad ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
            <DialogDescription>Complete la información de la actividad del plan de trabajo</DialogDescription>
          </DialogHeader>
          <Form {...actividadForm}>
            <form onSubmit={actividadForm.handleSubmit(onSubmitActividad)} className="space-y-4">
              <FormField
                control={actividadForm.control}
                name="programa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programa SST</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-programa">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROGRAMAS_SST.map((programa) => (
                          <SelectItem key={programa.id} value={programa.id}>{programa.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actividadForm.control}
                name="actividad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Actividad</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-actividad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actividadForm.control}
                name="objetivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-objetivo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actividadForm.control}
                name="meta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta (Medible y Cuantificable)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Capacitar al 100% de trabajadores" data-testid="input-meta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={actividadForm.control}
                  name="responsable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-responsable" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={actividadForm.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-cargo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={actividadForm.control}
                  name="mes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes de Ejecución</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-mes">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MESES.map((mes) => (
                            <SelectItem key={mes.id} value={mes.id}>{mes.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={actividadForm.control}
                  name="recursosFinancieros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presupuesto ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          data-testid="input-presupuesto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={actividadForm.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en-proceso">En Progreso</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                          <SelectItem value="reprogramada">Reprogramada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={actividadForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-observaciones" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setActividadDialogOpen(false); setEditingActividad(null); actividadForm.reset(); }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createActividadMutation.isPending || updateActividadMutation.isPending} data-testid="button-save-activity">
                  {editingActividad ? "Actualizar" : "Crear"} Actividad
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>¿Está seguro de que desea eliminar esta actividad? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setActividadToDelete(null); }} data-testid="button-cancel-delete">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => actividadToDelete && deleteActividadMutation.mutate(actividadToDelete)} disabled={deleteActividadMutation.isPending} data-testid="button-confirm-delete">
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
