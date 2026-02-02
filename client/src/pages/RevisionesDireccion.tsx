import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Search, ClipboardCheck, Calendar, Clock, CheckCircle2, Shield, PlayCircle, Building2, CalendarDays, Sparkles, Wand2, Eye, ChevronDown, ChevronRight, FileText, AlertCircle, Loader2, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RevisionDireccion, Company, DecisionRevision, AccionRevision, insertRevisionDireccionSchema, insertDecisionRevisionSchema, insertAccionRevisionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaRevisionesDireccion = [
  {
    codigo: 'ISO-45001-9.3',
    norma: 'ISO 45001:2018',
    articulo: 'Capítulo 9.3',
    descripcion: 'Revisión por la dirección',
    requisitos: [
      'Revisión a intervalos planificados',
      'Entradas de revisión definidas',
      'Salidas con decisiones y acciones',
      'Información documentada de resultados'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.31',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.31',
    descripcion: 'Revisión por la alta dirección',
    requisitos: [
      'Revisión mínimo una vez al año',
      'Evaluación de cumplimiento de política y objetivos',
      'Resultados de auditorías',
      'Acciones de mejora continua'
    ],
    obligatorio: true
  }
];

const formSchema = insertRevisionDireccionSchema.extend({
  companyId: z.string().optional(),
});

const decisionFormSchema = insertDecisionRevisionSchema.omit({ revisionId: true });
const accionFormSchema = insertAccionRevisionSchema.omit({ decisionId: true });

const tipoDecisionLabels: Record<string, string> = {
  mejora_continua: "Mejora Continua",
  cambio_politica: "Cambio de Política",
  asignacion_recursos: "Asignación de Recursos",
  cambio_objetivos: "Cambio de Objetivos",
  nueva_accion: "Nueva Acción",
  mantener: "Mantener",
  otro: "Otro",
};

const prioridadLabels: Record<string, { label: string; className: string }> = {
  baja: { label: "Baja", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
  media: { label: "Media", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  alta: { label: "Alta", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  critica: { label: "Crítica", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

const estadoAccionLabels: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  "en-proceso": { label: "En Proceso", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  completada: { label: "Completada", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  vencida: { label: "Vencida", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

function DecisionItem({ decision, revisionId }: { decision: DecisionRevision; revisionId: string }) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAccionForm, setShowAccionForm] = useState(false);

  const { data: acciones = [], isLoading: accionesLoading } = useQuery<AccionRevision[]>({
    queryKey: ["/api/decisiones-revision", decision.id, "acciones"],
    queryFn: async () => {
      const res = await fetch(`/api/decisiones-revision/${decision.id}/acciones`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar acciones");
      return res.json();
    },
    enabled: isExpanded,
  });

  const accionForm = useForm<z.infer<typeof accionFormSchema>>({
    resolver: zodResolver(accionFormSchema),
    defaultValues: {
      descripcion: "",
      responsableNombre: "",
      fechaCompromiso: new Date(),
      prioridad: "media",
      estado: "pendiente",
    },
  });

  const createAccionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accionFormSchema>) => {
      const res = await apiRequest("POST", `/api/decisiones-revision/${decision.id}/acciones`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/decisiones-revision", decision.id, "acciones"] });
      setShowAccionForm(false);
      accionForm.reset();
      toast({
        title: "Acción creada",
        description: "La acción se ha agregado exitosamente",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="border rounded-md p-3">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer hover-elevate rounded-md p-2 -m-2">
          <div className="flex items-center gap-2 flex-1">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Badge variant="outline" className="text-xs">{tipoDecisionLabels[decision.tipo] || decision.tipo}</Badge>
            <span className="text-sm font-medium line-clamp-1">{decision.descripcion}</span>
          </div>
          {decision.requiereAccion === 1 && (
            <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs">Requiere Acción</Badge>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 space-y-3">
        {decision.justificacion && (
          <div className="text-sm"><span className="text-muted-foreground">Justificación:</span> {decision.justificacion}</div>
        )}
        {decision.alcance && (
          <div className="text-sm"><span className="text-muted-foreground">Alcance:</span> {decision.alcance}</div>
        )}
        
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-semibold">Acciones</h5>
            <Button size="sm" variant="outline" onClick={() => setShowAccionForm(!showAccionForm)} data-testid={`button-new-accion-${decision.id}`}>
              <Plus className="h-3 w-3 mr-1" />Nueva Acción
            </Button>
          </div>

          {showAccionForm && (
            <Form {...accionForm}>
              <form onSubmit={accionForm.handleSubmit((v) => createAccionMutation.mutate(v))} className="space-y-3 p-3 bg-muted/50 rounded-md mb-3">
                <FormField control={accionForm.control} name="descripcion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea {...field} rows={2} placeholder="Descripción de la acción..." data-testid="textarea-accion-descripcion" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={accionForm.control} name="responsableNombre" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <FormControl><Input {...field} placeholder="Nombre del responsable" data-testid="input-accion-responsable" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={accionForm.control} name="fechaCompromiso" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Compromiso</FormLabel>
                      <FormControl>
                        <Input type="date" value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))} data-testid="input-accion-fecha" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={accionForm.control} name="prioridad" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger data-testid="select-accion-prioridad"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={accionForm.control} name="estado" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger data-testid="select-accion-estado"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en-proceso">En Proceso</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAccionForm(false)}>Cancelar</Button>
                  <Button type="submit" size="sm" disabled={createAccionMutation.isPending} data-testid="button-submit-accion">
                    {createAccionMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Guardar
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {accionesLoading ? (
            <div className="text-sm text-muted-foreground">Cargando acciones...</div>
          ) : acciones.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">No hay acciones registradas</div>
          ) : (
            <div className="space-y-2">
              {acciones.map((accion) => (
                <div key={accion.id} className="p-2 bg-muted/30 rounded-md text-sm space-y-1" data-testid={`accion-item-${accion.id}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium">{accion.descripcion}</span>
                    <div className="flex gap-1">
                      <Badge className={prioridadLabels[accion.prioridad]?.className || ""}>{prioridadLabels[accion.prioridad]?.label || accion.prioridad}</Badge>
                      <Badge className={estadoAccionLabels[accion.estado]?.className || ""}>{estadoAccionLabels[accion.estado]?.label || accion.estado}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Responsable: {accion.responsableNombre}</span>
                    <span>Fecha: {format(new Date(accion.fechaCompromiso), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function RevisionesDireccion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [selectedRevision, setSelectedRevision] = useState<RevisionDireccion | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      titulo: "",
      periodicidad: "semestral",
      fechaRevision: new Date(),
      estado: "programada",
      lugar: "",
      duracion: undefined,
      antecedentes: "",
      resumenEjecutivo: "",
      conclusiones: "",
    },
  });

  const generateSmartCode = (existingRevisiones: RevisionDireccion[], periodicidad: string) => {
    const year = new Date().getFullYear();
    const prefix = "RD";
    const existingCodesThisYear = existingRevisiones.filter(r => 
      r.codigo.startsWith(`${prefix}-${year}`)
    );
    const nextNumber = existingCodesThisYear.length + 1;
    return `${prefix}-${year}-${String(nextNumber).padStart(2, '0')}`;
  };

  const generateSmartTitle = (periodicidad: string) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const periodicidadLabels: Record<string, string> = {
      mensual: `Revisión Mensual SG-SST - ${new Date().toLocaleDateString('es-CO', { month: 'long' })} ${year}`,
      trimestral: `Revisión Trimestral SG-SST - Q${Math.floor(month / 3) + 1} ${year}`,
      semestral: `Revisión Semestral SG-SST - ${month < 6 ? 'Primer' : 'Segundo'} Semestre ${year}`,
      anual: `Revisión Anual SG-SST - ${year}`,
    };
    return periodicidadLabels[periodicidad] || `Revisión del SG-SST - ${year}`;
  };

  const getSmartDuration = (periodicidad: string) => {
    const durations: Record<string, number> = {
      mensual: 60,
      trimestral: 90,
      semestral: 120,
      anual: 180,
    };
    return durations[periodicidad] || 120;
  };

  const getSmartAntecedentes = (periodicidad: string) => {
    const year = new Date().getFullYear();
    const templates: Record<string, string> = {
      mensual: `Revisión mensual del Sistema de Gestión de Seguridad y Salud en el Trabajo conforme a ISO 45001:2018 y Decreto 1072/2015.`,
      trimestral: `Revisión trimestral del SG-SST para evaluación del avance en objetivos, cumplimiento normativo y oportunidades de mejora del periodo.`,
      semestral: `Revisión semestral integral del SG-SST conforme a ISO 45001:2018 (Numeral 9.3) y Decreto 1072/2015 (Art. 2.2.4.6.31). Se evalúa el cumplimiento de la política, objetivos, resultados de auditorías y acciones de mejora.`,
      anual: `Revisión anual integral del Sistema de Gestión de Seguridad y Salud en el Trabajo correspondiente al año ${year}, en cumplimiento de ISO 45001:2018 y la normativa colombiana aplicable (Resolución 0312/2019, Decreto 1072/2015).`,
    };
    return templates[periodicidad] || templates.semestral;
  };

  const { data: revisiones = [], isLoading } = useQuery<RevisionDireccion[]>({
    queryKey: ["/api/revisiones-direccion"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const { data: decisiones = [], isLoading: decisionesLoading } = useQuery<DecisionRevision[]>({
    queryKey: ["/api/revisiones-direccion", selectedRevision?.id, "decisiones"],
    queryFn: async () => {
      const res = await fetch(`/api/revisiones-direccion/${selectedRevision?.id}/decisiones`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar decisiones");
      return res.json();
    },
    enabled: !!selectedRevision?.id && detailDialogOpen,
  });

  const decisionForm = useForm<z.infer<typeof decisionFormSchema>>({
    resolver: zodResolver(decisionFormSchema),
    defaultValues: {
      tipo: "mejora_continua",
      descripcion: "",
      justificacion: "",
      alcance: "",
      requiereAccion: 1,
    },
  });

  const createDecisionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof decisionFormSchema>) => {
      const res = await apiRequest("POST", `/api/revisiones-direccion/${selectedRevision?.id}/decisiones`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revisiones-direccion", selectedRevision?.id, "decisiones"] });
      setShowDecisionForm(false);
      decisionForm.reset();
      toast({
        title: "Decisión creada",
        description: "La decisión se ha agregado exitosamente",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenDetailDialog = (revision: RevisionDireccion) => {
    setSelectedRevision(revision);
    setDetailDialogOpen(true);
    setShowDecisionForm(false);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedRevision(null);
    setShowDecisionForm(false);
  };

  const applySmartDefaults = () => {
    const periodicidad = form.getValues("periodicidad") || "semestral";
    const newAutoFilled = new Set<string>();
    
    if (!form.getValues("codigo")) {
      form.setValue("codigo", generateSmartCode(revisiones, periodicidad));
      newAutoFilled.add("codigo");
    }
    if (!form.getValues("titulo")) {
      form.setValue("titulo", generateSmartTitle(periodicidad));
      newAutoFilled.add("titulo");
    }
    if (!form.getValues("duracion")) {
      form.setValue("duracion", getSmartDuration(periodicidad));
      newAutoFilled.add("duracion");
    }
    if (!form.getValues("lugar")) {
      form.setValue("lugar", "Sala de Reuniones Virtual");
      newAutoFilled.add("lugar");
    }
    if (!form.getValues("antecedentes")) {
      form.setValue("antecedentes", getSmartAntecedentes(periodicidad));
      newAutoFilled.add("antecedentes");
    }
    
    setAutoFilledFields(newAutoFilled);
  };

  useEffect(() => {
    if (dialogOpen) {
      form.reset();
      setTimeout(() => applySmartDefaults(), 50);
    } else {
      setAutoFilledFields(new Set());
    }
  }, [dialogOpen]);

  const watchPeriodicidad = form.watch("periodicidad");
  
  useEffect(() => {
    if (dialogOpen && watchPeriodicidad) {
      const currentCodigo = form.getValues("codigo");
      const currentTitulo = form.getValues("titulo");
      const currentDuracion = form.getValues("duracion");
      const currentAntecedentes = form.getValues("antecedentes");
      
      if (autoFilledFields.has("codigo") || !currentCodigo) {
        form.setValue("codigo", generateSmartCode(revisiones, watchPeriodicidad));
      }
      if (autoFilledFields.has("titulo") || !currentTitulo) {
        form.setValue("titulo", generateSmartTitle(watchPeriodicidad));
      }
      if (autoFilledFields.has("duracion") || !currentDuracion) {
        form.setValue("duracion", getSmartDuration(watchPeriodicidad));
      }
      if (autoFilledFields.has("antecedentes") || !currentAntecedentes) {
        form.setValue("antecedentes", getSmartAntecedentes(watchPeriodicidad));
      }
    }
  }, [watchPeriodicidad]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = isSuperadmin && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/revisiones-direccion", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revisiones-direccion"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Revisión creada",
        description: "La Revisión por Dirección se ha creado exitosamente",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  const filteredRevisiones = revisiones.filter((revision) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      revision.codigo.toLowerCase().includes(searchLower) ||
      revision.titulo.toLowerCase().includes(searchLower) ||
      (revision.lugar?.toLowerCase().includes(searchLower) ?? false) ||
      (revision.resumenEjecutivo?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      "programada": { label: "Programada", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Calendar },
      "en_ejecucion": { label: "En Ejecución", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: Clock },
      "completada": { label: "Completada", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "aprobada": { label: "Aprobada", className: "bg-green-600/10 text-green-800 dark:text-green-300", icon: Shield },
      "seguimiento": { label: "Seguimiento", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: PlayCircle },
    };
    const item = config[estado as keyof typeof config] || config["programada"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  const getPeriodicidadBadge = (periodicidad: string) => {
    const config = {
      "mensual": { label: "Mensual", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      "trimestral": { label: "Trimestral", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      "semestral": { label: "Semestral", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" },
      "anual": { label: "Anual", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    };
    const item = config[periodicidad.toLowerCase() as keyof typeof config];
    return item ? <Badge className={item.className}>{item.label}</Badge> : null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Revisión por Dirección
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de revisiones gerenciales del Sistema de Gestión SST (ISO 45001:2018 / Resolución 0312)
          </p>
        </div>
        <AutomationAssistant
          titulo="Revisión por la Alta Dirección"
          estandar="3.2.1"
          descripcion="Revisiones gerenciales del SG-SST conforme a ISO 45001 y Decreto 1072"
          normativaAplicable={normativaRevisionesDireccion}
          compact={true}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-revision" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Revisión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Nueva Revisión por Dirección
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>Formulario inteligente con auto-llenado</span>
                <Badge variant="secondary" className="text-xs">
                  <Wand2 className="h-3 w-3 mr-1" />
                  Smart Form
                </Badge>
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isSuperadmin && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Seleccione una empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Código
                          {autoFilledFields.has("codigo") && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Auto-generado secuencialmente</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej: RD-2025-01"
                            data-testid="input-codigo"
                            readOnly
                            className="border-primary/50 bg-muted cursor-not-allowed"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Código generado automáticamente (no editable)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="periodicidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidad</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-periodicidad">
                              <SelectValue placeholder="Seleccione periodicidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mensual">Mensual</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Título
                        {autoFilledFields.has("titulo") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Generado según periodicidad</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Título descriptivo de la revisión"
                          data-testid="input-titulo"
                          className={autoFilledFields.has("titulo") ? "border-primary/50 bg-primary/5" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaRevision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Revisión</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-fecha-revision"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Lugar
                          {autoFilledFields.has("lugar") && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Valor sugerido por defecto</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Sala de juntas, virtual..."
                            data-testid="input-lugar"
                            className={autoFilledFields.has("lugar") ? "border-primary/50 bg-primary/5" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Duración (minutos)
                          {autoFilledFields.has("duracion") && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Duración típica según periodicidad</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="120"
                            data-testid="input-duracion"
                            className={autoFilledFields.has("duracion") ? "border-primary/50 bg-primary/5" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="programada">Programada</SelectItem>
                          <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="aprobada">Aprobada</SelectItem>
                          <SelectItem value="seguimiento">Seguimiento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="antecedentes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Antecedentes
                        {autoFilledFields.has("antecedentes") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Texto base según normativa y periodicidad</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Contexto y antecedentes de la revisión..."
                          rows={3}
                          data-testid="textarea-antecedentes"
                          className={autoFilledFields.has("antecedentes") ? "border-primary/50 bg-primary/5" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumenEjecutivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumen Ejecutivo</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Resumen de los puntos clave discutidos..."
                          rows={3}
                          data-testid="textarea-resumen"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conclusiones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conclusiones</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Conclusiones y acuerdos generales..."
                          rows={3}
                          data-testid="textarea-conclusiones"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? "Creando..." : "Crear Revisión"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar revisiones por código, título, lugar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRevisiones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay revisiones registradas</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchTerm
                ? "No se encontraron revisiones que coincidan con tu búsqueda"
                : "Comienza creando tu primera Revisión por Dirección"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Revisión
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRevisiones.map((revision) => (
            <Card
              key={revision.id}
              className="hover-elevate cursor-pointer"
              data-testid={`card-revision-${revision.id}`}
              onClick={() => handleOpenDetailDialog(revision)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg line-clamp-1">
                    {revision.codigo}
                  </CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    {getEstadoBadge(revision.estado)}
                    {getPeriodicidadBadge(revision.periodicidad)}
                  </div>
                </div>
                <CardDescription className="line-clamp-1">
                  {revision.titulo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">{format(new Date(revision.fechaRevision), 'dd/MM/yyyy')}</span>
                </div>

                {revision.lugar && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Lugar:</span>
                    <span className="font-medium line-clamp-1">{revision.lugar}</span>
                  </div>
                )}

                {revision.duracion && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{revision.duracion} min</span>
                  </div>
                )}

                {revision.resumenEjecutivo && (
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
                    {revision.resumenEjecutivo}
                  </div>
                )}

                <div className="pt-2 border-t flex justify-end">
                  <Button variant="ghost" size="sm" className="text-primary" data-testid={`button-detail-${revision.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={detailDialogOpen} onOpenChange={(open) => !open && handleCloseDetailDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  {selectedRevision?.codigo}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedRevision?.titulo}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                {selectedRevision && getEstadoBadge(selectedRevision.estado)}
                {selectedRevision && getPeriodicidadBadge(selectedRevision.periodicidad)}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="informacion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informacion" data-testid="tab-informacion">
                <FileText className="h-4 w-4 mr-1" />
                Información
              </TabsTrigger>
              <TabsTrigger value="decisiones" data-testid="tab-decisiones">
                <AlertCircle className="h-4 w-4 mr-1" />
                Decisiones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Fecha de Revisión</span>
                  <p className="font-medium">{selectedRevision?.fechaRevision ? format(new Date(selectedRevision.fechaRevision), 'dd/MM/yyyy') : '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Lugar</span>
                  <p className="font-medium">{selectedRevision?.lugar || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <p className="font-medium">{selectedRevision?.duracion ? `${selectedRevision.duracion} minutos` : '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Periodicidad</span>
                  <p className="font-medium capitalize">{selectedRevision?.periodicidad || '-'}</p>
                </div>
              </div>

              {selectedRevision?.antecedentes && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Antecedentes</span>
                  <p className="text-sm">{selectedRevision.antecedentes}</p>
                </div>
              )}

              {selectedRevision?.resumenEjecutivo && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Resumen Ejecutivo</span>
                  <p className="text-sm">{selectedRevision.resumenEjecutivo}</p>
                </div>
              )}

              {selectedRevision?.conclusiones && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Conclusiones</span>
                  <p className="text-sm">{selectedRevision.conclusiones}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="decisiones" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Decisiones de la Revisión</h4>
                <Button size="sm" onClick={() => setShowDecisionForm(!showDecisionForm)} data-testid="button-new-decision">
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Decisión
                </Button>
              </div>

              {showDecisionForm && (
                <Form {...decisionForm}>
                  <form onSubmit={decisionForm.handleSubmit((v) => createDecisionMutation.mutate(v))} className="space-y-4 p-4 border rounded-md bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={decisionForm.control} name="tipo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Decisión</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-decision-tipo"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="mejora_continua">Mejora Continua</SelectItem>
                              <SelectItem value="cambio_politica">Cambio de Política</SelectItem>
                              <SelectItem value="asignacion_recursos">Asignación de Recursos</SelectItem>
                              <SelectItem value="cambio_objetivos">Cambio de Objetivos</SelectItem>
                              <SelectItem value="nueva_accion">Nueva Acción</SelectItem>
                              <SelectItem value="mantener">Mantener</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={decisionForm.control} name="requiereAccion" render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Requiere Acción?</FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                            <FormControl><SelectTrigger data-testid="select-decision-requiere"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="1">Sí</SelectItem>
                              <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={decisionForm.control} name="descripcion" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl><Textarea {...field} rows={2} placeholder="Descripción de la decisión..." data-testid="textarea-decision-descripcion" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={decisionForm.control} name="justificacion" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justificación (opcional)</FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} rows={2} placeholder="Por qué se tomó esta decisión..." data-testid="textarea-decision-justificacion" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={decisionForm.control} name="alcance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alcance (opcional)</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="Áreas/procesos afectados..." data-testid="input-decision-alcance" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowDecisionForm(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createDecisionMutation.isPending} data-testid="button-submit-decision">
                        {createDecisionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Guardar Decisión
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {decisionesLoading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando decisiones...
                </div>
              ) : decisiones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay decisiones registradas para esta revisión</p>
                  <p className="text-sm">Haz clic en "Nueva Decisión" para agregar una</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {decisiones.map((decision) => (
                    <DecisionItem key={decision.id} decision={decision} revisionId={selectedRevision?.id || ""} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCloseDetailDialog} data-testid="button-close-detail">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
