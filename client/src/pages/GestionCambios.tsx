import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutomationAssistant, PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { 
  CambioSst,
  InsertCambioSst,
  insertCambioSstSchema,
  EvaluacionImpactoCambio,
  InsertEvaluacionImpactoCambio,
  insertEvaluacionImpactoCambioSchema,
  AprobacionCambio,
  InsertAprobacionCambio,
  insertAprobacionCambioSchema
} from "@shared/schema";
import { 
  Plus, Search, Edit, Trash2, FileText, TrendingUp, CheckCircle2, 
  AlertCircle, XCircle, Clock, RefreshCw, Send, GitBranch,
  BarChart3, Activity, Workflow, Users, Calendar, Download, Bot, ArrowLeft, Printer, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

interface PlantillaPrefill {
  tipo: string;
  categoria: string;
  descripcion: string;
}

const plantillasCambiosSst: PlantillaInfo[] = [
  {
    id: 'cambio-proceso',
    nombre: 'Cambio en Procesos',
    descripcion: 'Modificación de procesos operativos que pueden afectar la SST',
    campos: {
      tipo: 'interno',
      categoria: 'proceso',
      descripcion: `REQUISITOS SST PARA CAMBIO EN PROCESOS (Art. 2.2.4.6.26 Decreto 1072/2015):

• Evaluación previa de nuevos peligros y riesgos asociados al cambio
• Actualización de procedimientos de trabajo seguro
• Capacitación a trabajadores afectados sobre nuevos procedimientos
• Actualización de la matriz de peligros y evaluación de riesgos
• Notificación y consulta con el COPASST/Vigía SST
• Verificación de controles operacionales necesarios
• Documentación del cambio en el SG-SST`
    },
    normativaBase: 'Art. 2.2.4.6.26'
  },
  {
    id: 'cambio-equipo',
    nombre: 'Cambio en Equipos/Tecnología',
    descripcion: 'Adquisición o modificación de maquinaria, herramientas o tecnología',
    campos: {
      tipo: 'interno',
      categoria: 'equipo',
      descripcion: `REQUISITOS SST PARA CAMBIO EN EQUIPOS (Art. 2.2.4.6.26 Decreto 1072/2015):

• Evaluación de riesgos del nuevo equipo o tecnología
• Verificación de certificaciones y fichas técnicas de seguridad
• Capacitación específica a operadores y personal de mantenimiento
• Definición de procedimientos de operación segura
• Actualización del programa de mantenimiento preventivo
• Señalización y demarcación según aplique
• Verificación de EPP requeridos para el nuevo equipo
• Registro en inventario de activos críticos SST`
    },
    normativaBase: 'Art. 2.2.4.6.26'
  },
  {
    id: 'cambio-instalacion',
    nombre: 'Cambio en Instalaciones',
    descripcion: 'Modificaciones físicas en instalaciones o infraestructura',
    campos: {
      tipo: 'interno',
      categoria: 'instalacion',
      descripcion: `REQUISITOS SST PARA CAMBIO EN INSTALACIONES (Art. 2.2.4.6.26 Decreto 1072/2015):

• Evaluación de impacto en rutas de evacuación
• Verificación de cumplimiento de normas de construcción y seguridad
• Actualización del plan de emergencias si aplica
• Revisión de señalización y demarcación de áreas
• Evaluación de condiciones de iluminación, ventilación y ergonomía
• Verificación de sistemas contra incendio
• Comunicación a trabajadores sobre cambios en las instalaciones
• Inspección de seguridad post-modificación`
    },
    normativaBase: 'Art. 2.2.4.6.26'
  },
  {
    id: 'cambio-personal',
    nombre: 'Cambio en Personal/Organizacional',
    descripcion: 'Cambios en estructura organizacional, cargos o personal',
    campos: {
      tipo: 'interno',
      categoria: 'personal',
      descripcion: `REQUISITOS SST PARA CAMBIO ORGANIZACIONAL (Art. 2.2.4.6.26 Decreto 1072/2015):

• Evaluación de impacto en responsabilidades SST
• Actualización de matriz de responsabilidades SST
• Inducción y reinducción en SST para personal afectado
• Revisión de perfiles de cargo con componente SST
• Actualización de matriz de capacitación
• Verificación de competencias SST requeridas
• Actualización del organigrama y roles SST
• Comunicación de cambios al COPASST`
    },
    normativaBase: 'Art. 2.2.4.6.26'
  },
  {
    id: 'cambio-normativo',
    nombre: 'Cambio Normativo/Legal',
    descripcion: 'Cambios por actualización de normativa SST aplicable',
    campos: {
      tipo: 'externo',
      categoria: 'legal',
      descripcion: `REQUISITOS SST PARA CAMBIO NORMATIVO (Art. 2.2.4.6.26 Decreto 1072/2015):

• Identificación de requisitos legales aplicables
• Actualización de la matriz legal del SG-SST
• Evaluación de brechas de cumplimiento
• Definición de plan de acción para cumplimiento
• Capacitación sobre nuevos requisitos normativos
• Actualización de procedimientos afectados
• Verificación de cumplimiento con entes de control
• Documentación de cambios en el SG-SST`
    },
    normativaBase: 'Art. 2.2.4.6.26'
  },
  {
    id: 'cambio-proveedor',
    nombre: 'Cambio de Proveedor/Contratista',
    descripcion: 'Cambio de proveedores o contratistas que afectan SST',
    campos: {
      tipo: 'externo',
      categoria: 'otro',
      descripcion: `REQUISITOS SST PARA CAMBIO DE PROVEEDOR (Art. 2.2.4.6.26 Decreto 1072/2015):

• Evaluación SST del nuevo proveedor/contratista
• Verificación de documentación SST del nuevo proveedor
• Actualización de contratos con cláusulas SST
• Inducción SST para personal del nuevo proveedor
• Coordinación de actividades de alto riesgo
• Verificación de afiliaciones a seguridad social
• Monitoreo de cumplimiento SST inicial
• Inclusión en programa de auditorías a contratistas`
    },
    normativaBase: 'Art. 2.2.4.6.26'
  }
];

export default function GestionCambios() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("cambios");
  const [prefillData, setPrefillData] = useState<PlantillaPrefill | null>(null);
  
  const estandarGestionCambio = getEstandarByCodigo('2.11.1');
  
  const normativaGestionCambio = estandarGestionCambio?.normativaAplicable.map(n => ({
    codigo: n.codigo,
    norma: n.norma,
    articulo: n.articulo,
    descripcion: n.descripcion,
    requisitos: n.requisitos,
    obligatorio: n.obligatorio
  })) || [];

  const tiposCambioSst = [
    { campo: 'tipoCambio', valor: 'Cambio en procesos', normativaReferencia: 'Art. 2.2.4.6.26' },
    { campo: 'tipoCambio', valor: 'Cambio en equipos', normativaReferencia: 'Art. 2.2.4.6.26' },
    { campo: 'tipoCambio', valor: 'Cambio en instalaciones', normativaReferencia: 'Art. 2.2.4.6.26' },
    { campo: 'tipoCambio', valor: 'Cambio en materias primas', normativaReferencia: 'Art. 2.2.4.6.26' },
    { campo: 'tipoCambio', valor: 'Cambio organizacional', normativaReferencia: 'Art. 2.2.4.6.26' },
    { campo: 'tipoCambio', valor: 'Cambio en métodos de trabajo', normativaReferencia: 'Art. 2.2.4.6.26' },
    { campo: 'tipoCambio', valor: 'Cambio normativo', normativaReferencia: 'Art. 2.2.4.6.26' }
  ];

  const handleSelectPlantilla = useCallback((plantilla: PlantillaInfo) => {
    const campos = plantilla.campos as PlantillaPrefill;
    setPrefillData({
      tipo: campos.tipo || 'interno',
      categoria: campos.categoria || 'proceso',
      descripcion: campos.descripcion || ''
    });
    setActiveTab("cambios");
    toast({
      title: "Plantilla aplicada",
      description: `Se ha cargado la plantilla "${plantilla.nombre}". Complete los demás campos del formulario.`,
    });
  }, [toast]);

  const handlePrefillApplied = useCallback(() => {
    setPrefillData(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/evaluaciones-sst">
            <Button variant="ghost" size="icon" data-testid="button-back-evaluation">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Gestión de Cambios SST</h1>
        </div>
        <div className="flex items-center gap-4">
          <BackToEvaluationButton />
          <BackToCronogramaButton />
        </div>
      </div>
      <div>
        <p className="text-muted-foreground">Sistema de gestión de cambios según Decreto 1072/2015 Art. 2.2.4.6.26 - Automatización inteligente de flujos SST</p>
      </div>

      <AutomationAssistant
        titulo="Gestión del Cambio"
        estandar="2.11.1"
        descripcion="Procedimiento para evaluar el impacto en SST de los cambios internos y externos según Decreto 1072/2015"
        normativaAplicable={normativaGestionCambio}
        compact={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="cambios" data-testid="tab-cambios">
            <GitBranch className="h-4 w-4 mr-2" />
            Cambios
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" data-testid="tab-evaluaciones">
            <Activity className="h-4 w-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="aprobaciones" data-testid="tab-aprobaciones">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Aprobaciones
          </TabsTrigger>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Panel de control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cambios">
          <CambiosTab prefillData={prefillData} onPrefillApplied={handlePrefillApplied} />
        </TabsContent>

        <TabsContent value="evaluaciones">
          <EvaluacionesTab />
        </TabsContent>

        <TabsContent value="aprobaciones">
          <AprobacionesTab />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== TAB 1: CAMBIOS ====================

interface CambiosTabProps {
  prefillData: PlantillaPrefill | null;
  onPrefillApplied: () => void;
}

function CambiosTab({ prefillData, onPrefillApplied }: CambiosTabProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CambioSst | null>(null);
  const [selectedPredefinido, setSelectedPredefinido] = useState("");

  const { data: cambios = [], isLoading } = useQuery<CambioSst[]>({
    queryKey: ["/api/cambios-sst"],
  });

  // Obtener trabajadores activos para los dropdowns
  const { data: workers = [] } = useQuery<any[]>({
    queryKey: ["/api/workers"],
  });

  const form = useForm<InsertCambioSst>({
    resolver: zodResolver(insertCambioSstSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      tipo: "interno",
      categoria: "proceso",
      areaAfectada: "",
      procesoAfectado: "",
      numeroTrabajadoresAfectados: 0,
      justificacion: "",
      objetivos: "",
      fechaPropuesta: new Date(),
      fechaImplementacionPlanificada: undefined,
      solicitante: "",
      responsableImplementacion: "",
      estado: "propuesto",
      requiereActualizacionMatrizRiesgos: 0,
      requiereActualizacionPlanTrabajo: 0,
      requiereCapacitacion: 0,
      requiereAprobacionCopasst: 0,
      observaciones: "",
    },
  });

  useEffect(() => {
    if (prefillData) {
      setEditingItem(null);
      form.reset({
        ...form.getValues(),
        titulo: "",
        tipo: prefillData.tipo as "interno" | "externo",
        categoria: prefillData.categoria as "proceso" | "instalacion" | "equipo" | "personal" | "organizacional" | "tecnologico" | "legal" | "producto" | "otro",
        descripcion: prefillData.descripcion,
        areaAfectada: "",
        procesoAfectado: "",
        numeroTrabajadoresAfectados: 0,
        justificacion: "",
        objetivos: "",
        fechaPropuesta: new Date(),
        fechaImplementacionPlanificada: undefined,
        solicitante: "",
        responsableImplementacion: "",
        estado: "propuesto",
        requiereActualizacionMatrizRiesgos: 0,
        requiereActualizacionPlanTrabajo: 0,
        requiereCapacitacion: 0,
        requiereAprobacionCopasst: 0,
        observaciones: "",
      });
      setDialogOpen(true);
      onPrefillApplied();
    }
  }, [prefillData, form, onPrefillApplied]);

  const createMutation = useMutation({
    mutationFn: (data: InsertCambioSst) =>
      apiRequest("POST", "/api/cambios-sst", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cambios-sst"] });
      toast({ title: "Cambio registrado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCambioSst> }) =>
      apiRequest("PATCH", `/api/cambios-sst/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cambios-sst"] });
      toast({ title: "Cambio actualizado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/cambios-sst/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cambios-sst"] });
      toast({ title: "Cambio eliminado", className: "bg-yellow-50 border-yellow-200" });
    },
  });

  const handleSubmit = (data: InsertCambioSst) => {
    const payload = {
      ...data,
      fechaPropuesta: data.fechaPropuesta instanceof Date 
        ? data.fechaPropuesta.toISOString() 
        : data.fechaPropuesta,
      fechaImplementacionPlanificada: data.fechaImplementacionPlanificada instanceof Date 
        ? data.fechaImplementacionPlanificada.toISOString() 
        : data.fechaImplementacionPlanificada,
      requiereActualizacionMatrizRiesgos: data.requiereActualizacionMatrizRiesgos ?? 0,
      requiereActualizacionPlanTrabajo: data.requiereActualizacionPlanTrabajo ?? 0,
      requiereCapacitacion: data.requiereCapacitacion ?? 0,
      requiereAprobacionCopasst: data.requiereAprobacionCopasst ?? 0,
    };
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload as unknown as Partial<InsertCambioSst> });
    } else {
      createMutation.mutate(payload as unknown as InsertCambioSst);
    }
  };

  const handleEdit = (item: CambioSst) => {
    setEditingItem(item);
    form.reset({
      titulo: item.titulo,
      descripcion: item.descripcion,
      tipo: item.tipo,
      categoria: item.categoria,
      areaAfectada: item.areaAfectada,
      procesoAfectado: item.procesoAfectado || "",
      numeroTrabajadoresAfectados: item.numeroTrabajadoresAfectados,
      justificacion: item.justificacion,
      objetivos: item.objetivos || "",
      fechaPropuesta: new Date(item.fechaPropuesta),
      fechaImplementacionPlanificada: item.fechaImplementacionPlanificada ? new Date(item.fechaImplementacionPlanificada) : undefined,
      solicitante: item.solicitante,
      responsableImplementacion: item.responsableImplementacion || "",
      estado: item.estado,
      requiereActualizacionMatrizRiesgos: item.requiereActualizacionMatrizRiesgos,
      requiereActualizacionPlanTrabajo: item.requiereActualizacionPlanTrabajo,
      requiereCapacitacion: item.requiereCapacitacion,
      requiereAprobacionCopasst: item.requiereAprobacionCopasst,
      observaciones: item.observaciones || "",
    });
    setDialogOpen(true);
  };

  const filteredCambios = cambios.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.areaAfectada.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAutoFillFromPredefinido = (plantillaId: string) => {
    if (!plantillaId) return;
    
    const plantilla = plantillasCambiosSst.find(p => p.id === plantillaId);
    if (!plantilla) return;
    
    const campos = plantilla.campos as PlantillaPrefill;
    form.setValue('tipo', (campos.tipo as "interno" | "externo") || 'interno');
    form.setValue('categoria', (campos.categoria as "proceso" | "instalacion" | "equipo" | "personal" | "organizacional" | "tecnologico" | "legal" | "producto" | "otro") || 'proceso');
    form.setValue('descripcion', campos.descripcion || '');
    
    toast({
      title: "Plantilla aplicada",
      description: `Se ha cargado la plantilla "${plantilla.nombre}". Complete los demás campos del formulario.`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Registro de Cambios SST</CardTitle>
            <CardDescription>Gestión de cambios organizacionales con evaluación de impacto</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingItem(null); form.reset(); }} data-testid="button-create-cambio">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Cambio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Cambio" : "Registrar Nuevo Cambio SST"}</DialogTitle>
                <DialogDescription>
                  Complete los datos del cambio organizacional. Se evaluará automáticamente el impacto en SST.
                </DialogDescription>
              </DialogHeader>
              
              {!editingItem && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione un tipo de cambio predefinido para auto-rellenar los campos</p>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedPredefinido} onValueChange={(value) => {
                          setSelectedPredefinido(value);
                          handleAutoFillFromPredefinido(value);
                        }}>
                          <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-predefinido">
                            <SelectValue placeholder="Seleccione un tipo de cambio..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            {plantillasCambiosSst.map((plantilla) => (
                              <SelectItem key={plantilla.id} value={plantilla.id}>
                                {plantilla.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Título del Cambio *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Implementación nuevo sistema ERP" data-testid="input-titulo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cambio *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tipo">
                                <SelectValue placeholder="Seleccione tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="interno">Interno</SelectItem>
                              <SelectItem value="externo">Externo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-categoria">
                                <SelectValue placeholder="Seleccione categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="proceso">Proceso</SelectItem>
                              <SelectItem value="instalacion">Instalación</SelectItem>
                              <SelectItem value="equipo">Equipo/Tecnología</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="organizacional">Organizacional</SelectItem>
                              <SelectItem value="normativo">Normativo</SelectItem>
                              <SelectItem value="proveedor">Proveedor</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <FormLabel>Descripción Detallada *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Describa en detalle el cambio propuesto..." data-testid="textarea-descripcion" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="areaAfectada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área Afectada *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Producción" data-testid="input-area" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="procesoAfectado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proceso Afectado</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Ej: Ensamblaje de productos" data-testid="input-proceso" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="numeroTrabajadoresAfectados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Trabajadores Afectados *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Ingrese cantidad"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value === 0 ? "" : field.value}
                            onChange={e => {
                              const inputValue = e.target.value;
                              if (inputValue === "") {
                                field.onChange(0);
                              } else {
                                const val = parseInt(inputValue, 10);
                                field.onChange(isNaN(val) || val < 0 ? 0 : val);
                              }
                            }} 
                            data-testid="input-trabajadores" 
                          />
                        </FormControl>
                        <FormDescription>Cantidad de personas impactadas por este cambio</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="justificacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justificación del Cambio *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="¿Por qué es necesario este cambio?" data-testid="textarea-justificacion" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="objetivos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivos Esperados</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} placeholder="¿Qué se espera lograr?" data-testid="textarea-objetivos" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="solicitante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solicitante *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-solicitante">
                                <SelectValue placeholder="Seleccionar trabajador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.filter(w => w.status === 'activo').map((worker) => (
                                <SelectItem key={worker.id} value={worker.name}>
                                  {worker.name} - {worker.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsableImplementacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable de Implementación</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-responsable">
                                <SelectValue placeholder="Seleccionar trabajador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.filter(w => w.status === 'activo').map((worker) => (
                                <SelectItem key={worker.id} value={worker.name}>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fechaPropuesta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Propuesta *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const dateValue = e.target.value;
                                if (dateValue) {
                                  const parsedDate = new Date(dateValue + 'T00:00:00');
                                  if (!isNaN(parsedDate.getTime())) {
                                    field.onChange(parsedDate);
                                  }
                                }
                              }}
                              data-testid="input-fecha-propuesta"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaImplementacionPlanificada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Implementación Planificada</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const dateValue = e.target.value;
                                if (dateValue) {
                                  const parsedDate = new Date(dateValue + 'T00:00:00');
                                  if (!isNaN(parsedDate.getTime())) {
                                    field.onChange(parsedDate);
                                  }
                                } else {
                                  field.onChange(undefined);
                                }
                              }}
                              data-testid="input-fecha-implementacion"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm">Automatizaciones SST (Opcional)</h4>
                    <p className="text-xs text-muted-foreground">
                      Marque las integraciones que requiere este cambio. Las automatizaciones se ejecutarán al aprobar.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="requiereActualizacionMatrizRiesgos"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value === 1}
                                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                className="h-4 w-4"
                                data-testid="checkbox-matriz-riesgos"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Matriz de Riesgos</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiereActualizacionPlanTrabajo"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value === 1}
                                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                className="h-4 w-4"
                                data-testid="checkbox-plan-trabajo"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Plan Anual de Trabajo</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiereCapacitacion"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value === 1}
                                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                className="h-4 w-4"
                                data-testid="checkbox-capacitacion"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Capacitaciones</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiereAprobacionCopasst"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input 
                                type="checkbox" 
                                checked={field.value === 1}
                                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                className="h-4 w-4"
                                data-testid="checkbox-copasst"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Requiere Aprobación COPASST</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones Adicionales</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} placeholder="Información adicional relevante..." data-testid="textarea-observaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                      {editingItem ? "Actualizar" : "Registrar"} Cambio
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, código o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando cambios...</div>
        ) : filteredCambios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No se encontraron cambios" : "No hay cambios registrados"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Fecha Propuesta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCambios.map((cambio) => (
                  <TableRow key={cambio.id} data-testid={`row-cambio-${cambio.id}`}>
                    <TableCell className="font-mono text-sm" data-testid={`text-codigo-${cambio.id}`}>{cambio.codigo}</TableCell>
                    <TableCell className="font-medium" data-testid={`text-titulo-${cambio.id}`}>{cambio.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cambio.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cambio.categoria}</Badge>
                    </TableCell>
                    <TableCell>{cambio.areaAfectada}</TableCell>
                    <TableCell><StatusBadge status={cambio.estado} type="cambio" withIcon testId={`badge-estado-${cambio.estado}`} /></TableCell>
                    <TableCell>{cambio.solicitante}</TableCell>
                    <TableCell>{format(new Date(cambio.fechaPropuesta), "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            window.open(`/api/cambios-sst/${cambio.id}/pdf`, '_blank');
                          }}
                          title="Descargar PDF del Cambio"
                          data-testid={`button-pdf-${cambio.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cambio)}
                          data-testid={`button-edit-${cambio.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("¿Está seguro de eliminar este cambio?")) {
                              deleteMutation.mutate(cambio.id);
                            }
                          }}
                          data-testid={`button-delete-${cambio.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB 2: EVALUACIONES ====================

function EvaluacionesTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluacionImpactoCambio | null>(null);
  const [selectedCambio, setSelectedCambio] = useState<string>("");

  const { data: evaluaciones = [], isLoading } = useQuery<EvaluacionImpactoCambio[]>({
    queryKey: ["/api/evaluaciones-impacto-cambio"],
  });

  const { data: cambios = [] } = useQuery<CambioSst[]>({
    queryKey: ["/api/cambios-sst"],
  });

  // Obtener trabajadores activos para el campo evaluador
  const { data: workers = [] } = useQuery<any[]>({
    queryKey: ["/api/workers"],
  });

  const form = useForm<InsertEvaluacionImpactoCambio>({
    resolver: zodResolver(insertEvaluacionImpactoCambioSchema),
    defaultValues: {
      cambioId: "",
      fechaEvaluacion: new Date(),
      evaluador: "",
      peligrosIdentificados: "",
      numeroPeligrosNuevos: 0,
      nivelRiesgoResultante: "bajo",
      probabilidadOcurrencia: 1,
      severidadConsecuencia: 1,
      impactoTrabajadores: "",
      impactoInstalaciones: "",
      impactoOperaciones: "",
      impactoAmbiental: "",
      causasRiesgo: "",
      requiereControles: 1,
      recomendacionGeneral: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertEvaluacionImpactoCambio) =>
      apiRequest("POST", "/api/evaluaciones-impacto-cambio", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-impacto-cambio"] });
      toast({ title: "Evaluación de impacto creada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertEvaluacionImpactoCambio> }) =>
      apiRequest("PATCH", `/api/evaluaciones-impacto-cambio/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-impacto-cambio"] });
      toast({ title: "Evaluación actualizada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/evaluaciones-impacto-cambio/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-impacto-cambio"] });
      toast({ title: "Evaluación eliminada", className: "bg-yellow-50 border-yellow-200" });
    },
  });

  const handleSubmit = (data: InsertEvaluacionImpactoCambio) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: EvaluacionImpactoCambio) => {
    setEditingItem(item);
    form.reset({
      cambioId: item.cambioId,
      fechaEvaluacion: new Date(item.fechaEvaluacion),
      evaluador: item.evaluador,
      peligrosIdentificados: item.peligrosIdentificados,
      numeroPeligrosNuevos: item.numeroPeligrosNuevos,
      nivelRiesgoResultante: item.nivelRiesgoResultante,
      probabilidadOcurrencia: item.probabilidadOcurrencia,
      severidadConsecuencia: item.severidadConsecuencia,
      impactoTrabajadores: item.impactoTrabajadores || "",
      impactoInstalaciones: item.impactoInstalaciones || "",
      impactoOperaciones: item.impactoOperaciones || "",
      impactoAmbiental: item.impactoAmbiental || "",
      causasRiesgo: item.causasRiesgo || "",
      requiereControles: item.requiereControles,
      recomendacionGeneral: item.recomendacionGeneral || "",
    });
    setDialogOpen(true);
  };

  const filteredEvaluaciones = evaluaciones.filter(e => {
    const cambio = cambios.find(c => c.id === e.cambioId);
    return (
      (cambio?.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cambio?.codigo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const calcularNivelRiesgo = (probabilidad: number, severidad: number): "bajo" | "medio" | "alto" | "critico" => {
    const score = probabilidad * severidad;
    if (score <= 4) return "bajo";
    if (score <= 9) return "medio";
    if (score <= 16) return "alto";
    return "critico";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Evaluaciones de Impacto SST</CardTitle>
            <CardDescription>Análisis sistemático de impactos en seguridad y salud del trabajo</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingItem(null); form.reset(); }} data-testid="button-create-evaluacion">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Evaluación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Evaluación" : "Nueva Evaluación de Impacto SST"}</DialogTitle>
                <DialogDescription>
                  Analice el impacto del cambio en diferentes aspectos de SST
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cambioId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cambio a Evaluar *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-cambio">
                                <SelectValue placeholder="Seleccione un cambio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cambios.map((cambio) => (
                                <SelectItem key={cambio.id} value={cambio.id}>
                                  {cambio.codigo} - {cambio.titulo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaEvaluacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Evaluación *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                              data-testid="input-fecha-evaluacion"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="evaluador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evaluador (Coordinador SST) *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-evaluador">
                              <SelectValue placeholder="Seleccionar coordinador SST" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(() => {
                              const activeWorkers = workers.filter(w => w.status === 'activo');
                              const coordinadores = activeWorkers.filter(w => 
                                w.position?.toLowerCase().includes('coordinador') || 
                                w.position?.toLowerCase().includes('sst') ||
                                w.position?.toLowerCase().includes('coordinadora')
                              );
                              const workersToShow = coordinadores.length > 0 ? coordinadores : activeWorkers;
                              return workersToShow.map((worker) => (
                                <SelectItem key={worker.id} value={worker.name}>
                                  {worker.name} - {worker.position}
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="peligrosIdentificados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peligros Identificados *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Describa los peligros identificados relacionados con este cambio..." data-testid="textarea-peligros" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroPeligrosNuevos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Peligros Nuevos *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              field.onChange(isNaN(val) ? 0 : val);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            min={0}
                            placeholder="0"
                            data-testid="input-num-peligros" 
                          />
                        </FormControl>
                        <FormDescription>Cantidad de nuevos peligros introducidos por este cambio</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="probabilidadOcurrencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Probabilidad (1-5) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const safeVal = isNaN(val) ? 1 : val;
                                field.onChange(safeVal);
                                const sev = form.getValues("severidadConsecuencia");
                                form.setValue("nivelRiesgoResultante", calcularNivelRiesgo(safeVal, sev));
                              }}
                              min={1}
                              max={5}
                              data-testid="input-probabilidad" 
                            />
                          </FormControl>
                          <FormDescription>1=Muy baja, 5=Muy alta</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="severidadConsecuencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severidad (1-5) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const safeVal = isNaN(val) ? 1 : val;
                                field.onChange(safeVal);
                                const prob = form.getValues("probabilidadOcurrencia");
                                form.setValue("nivelRiesgoResultante", calcularNivelRiesgo(prob, safeVal));
                              }}
                              min={1}
                              max={5}
                              data-testid="input-severidad" 
                            />
                          </FormControl>
                          <FormDescription>1=Leve, 5=Catastrófica</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nivelRiesgoResultante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Riesgo *</FormLabel>
                          <FormControl>
                            <div className="p-3 bg-muted rounded-md h-[42px] flex items-center">
                              <StatusBadge status={field.value} type="impacto" testId={`badge-impacto-${field.value}`} />
                            </div>
                          </FormControl>
                          <FormDescription>Calculado automáticamente</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Análisis de Impactos Específicos</h4>
                    
                    <FormField
                      control={form.control}
                      name="impactoTrabajadores"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impacto en Trabajadores</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} rows={2} placeholder="Descripción del impacto en los trabajadores..." data-testid="textarea-impacto-trabajadores" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="impactoInstalaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impacto en Instalaciones</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} rows={2} placeholder="Descripción del impacto en las instalaciones..." data-testid="textarea-impacto-instalaciones" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="impactoOperaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impacto en Operaciones</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} rows={2} placeholder="Descripción del impacto en las operaciones..." data-testid="textarea-impacto-operaciones" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="impactoAmbiental"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impacto Ambiental</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} rows={2} placeholder="Descripción del impacto ambiental..." data-testid="textarea-impacto-ambiental" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="causasRiesgo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Análisis de Causas del Riesgo</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} placeholder="Causas raíz identificadas..." data-testid="textarea-causas" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiereControles"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 p-3 bg-muted/50 rounded-md">
                        <FormControl>
                          <input 
                            type="checkbox" 
                            checked={field.value === 1}
                            onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                            className="h-4 w-4"
                            data-testid="checkbox-requiere-controles"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="font-normal cursor-pointer">Requiere Controles Adicionales</FormLabel>
                          <FormDescription>Marque si este cambio requiere implementar controles SST adicionales</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recomendacionGeneral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recomendaciones Generales</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} placeholder="Recomendaciones para mitigar los riesgos identificados..." data-testid="textarea-recomendaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-evaluacion">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-evaluacion">
                      {editingItem ? "Actualizar" : "Crear"} Evaluación
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-evaluaciones"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando evaluaciones...</div>
        ) : filteredEvaluaciones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No se encontraron evaluaciones" : "No hay evaluaciones de impacto registradas"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cambio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Evaluador</TableHead>
                  <TableHead>Peligros Nuevos</TableHead>
                  <TableHead>Prob.</TableHead>
                  <TableHead>Sev.</TableHead>
                  <TableHead>Nivel Riesgo</TableHead>
                  <TableHead>Controles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluaciones.map((evaluacion) => {
                  const cambio = cambios.find(c => c.id === evaluacion.cambioId);
                  return (
                    <TableRow key={evaluacion.id} data-testid={`row-evaluacion-${evaluacion.id}`}>
                      <TableCell className="font-medium">
                        {cambio ? `${cambio.codigo} - ${cambio.titulo}` : "N/A"}
                      </TableCell>
                      <TableCell>{new Date(evaluacion.fechaEvaluacion).toLocaleDateString('es-CO')}</TableCell>
                      <TableCell>{evaluacion.evaluador}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{evaluacion.numeroPeligrosNuevos}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{evaluacion.probabilidadOcurrencia}/5</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{evaluacion.severidadConsecuencia}/5</Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={evaluacion.nivelRiesgoResultante} type="impacto" testId={`badge-impacto-${evaluacion.nivelRiesgoResultante}`} /></TableCell>
                      <TableCell>
                        {evaluacion.requiereControles === 1 ? (
                          <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Sí</Badge>
                        ) : (
                          <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              window.open(`/api/evaluaciones-impacto-cambio/${evaluacion.id}/report`, '_blank');
                            }}
                            title="Descargar PDF de Evaluación de Impacto"
                            data-testid={`button-pdf-evaluacion-${evaluacion.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(evaluacion)}
                            data-testid={`button-edit-evaluacion-${evaluacion.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("¿Está seguro de eliminar esta evaluación?")) {
                                deleteMutation.mutate(evaluacion.id);
                              }
                            }}
                            data-testid={`button-delete-evaluacion-${evaluacion.id}`}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB 3: APROBACIONES ====================

function AprobacionesTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCambio, setSelectedCambio] = useState<CambioSst | null>(null);

  const { data: cambios = [], isLoading } = useQuery<CambioSst[]>({
    queryKey: ["/api/cambios-sst"],
  });

  const { data: aprobaciones = [] } = useQuery<AprobacionCambio[]>({
    queryKey: ["/api/aprobaciones-cambios"],
  });

  const form = useForm<InsertAprobacionCambio>({
    resolver: zodResolver(insertAprobacionCambioSchema),
    defaultValues: {
      cambioId: "",
      nivelAprobacion: "coordinador_sst",
      aprobador: user?.username || "",
      estado: "aprobado",
      comentarios: "",
      fechaAprobacion: new Date(),
      orden: 1,
    },
  });

  const aprobarMutation = useMutation({
    mutationFn: ({ data, aprobacionId }: { data: InsertAprobacionCambio; aprobacionId?: string }) => {
      if (aprobacionId) {
        // Actualizar aprobación existente
        return apiRequest("PATCH", `/api/aprobaciones-cambios/${aprobacionId}`, data);
      } else {
        // Crear nueva aprobación
        return apiRequest("POST", "/api/aprobaciones-cambios", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aprobaciones-cambios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cambios-sst"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cambios-sst/dashboard"] });
      toast({ title: "Aprobación registrada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setSelectedCambio(null);
      form.reset();
    },
  });

  const handleAprobar = (cambio: CambioSst) => {
    setSelectedCambio(cambio);
    form.setValue("cambioId", cambio.id);
    setDialogOpen(true);
  };

  const handleSubmit = (data: InsertAprobacionCambio) => {
    if (!selectedCambio) {
      toast({ title: "Error: No se ha seleccionado un cambio", variant: "destructive" });
      return;
    }
    
    const ordenMap: Record<string, number> = {
      "coordinador_sst": 1,
      "alta_direccion": 2,
      "copasst": 3,
    };
    
    // Verificar si ya existe una aprobación para este nivel
    const existingAprobacion = aprobaciones.find(
      a => a.cambioId === selectedCambio.id && a.nivelAprobacion === data.nivelAprobacion
    );
    
    aprobarMutation.mutate({
      data: {
        ...data,
        cambioId: selectedCambio.id,
        orden: ordenMap[data.nivelAprobacion] || 1,
      },
      aprobacionId: existingAprobacion?.id,
    });
  };

  const getAprobacionesForCambio = (cambioId: string) => {
    return aprobaciones.filter(a => a.cambioId === cambioId);
  };

  const getNivelAprobacionActual = (cambio: CambioSst): string => {
    const aprobacionesCambio = getAprobacionesForCambio(cambio.id);
    if (aprobacionesCambio.some(a => a.nivelAprobacion === "copasst" && a.estado === "aprobado")) return "completado";
    if (aprobacionesCambio.some(a => a.nivelAprobacion === "alta_direccion" && a.estado === "aprobado")) return "copasst";
    if (aprobacionesCambio.some(a => a.nivelAprobacion === "coordinador_sst" && a.estado === "aprobado")) return "alta_direccion";
    if (cambio.estado === "propuesto" || cambio.estado === "en_evaluacion") return "coordinador_sst";
    return "pendiente";
  };

  const filteredCambios = cambios.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFlowStatus = (cambio: CambioSst) => {
    const aprobacionesCambio = getAprobacionesForCambio(cambio.id);
    const steps = [
      { nivel: "coordinador_sst", label: "Coord. SST", icon: Users },
      { nivel: "alta_direccion", label: "Alta Dir.", icon: Send },
      { nivel: "copasst", label: "COPASST", icon: CheckCircle2 },
    ];

    return (
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const aprobacion = aprobacionesCambio.find(a => a.nivelAprobacion === step.nivel);
          const Icon = step.icon;
          const isApproved = aprobacion?.estado === "aprobado";
          const isRejected = aprobacion?.estado === "rechazado";
          const isPending = !aprobacion && getNivelAprobacionActual(cambio) === step.nivel;

          return (
            <div key={step.nivel} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                isApproved ? 'bg-green-50 border border-green-200' :
                isRejected ? 'bg-red-50 border border-red-200' :
                isPending ? 'bg-yellow-50 border border-yellow-200' :
                'bg-muted border border-muted'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isApproved ? 'text-green-600' :
                  isRejected ? 'text-red-600' :
                  isPending ? 'text-yellow-600' :
                  'text-muted-foreground'
                }`} />
                <span className="text-xs font-medium">{step.label}</span>
                {isApproved && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                {isRejected && <XCircle className="h-3 w-3 text-red-600" />}
                {isPending && <Clock className="h-3 w-3 text-yellow-600" />}
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-[2px] w-8 ${isApproved ? 'bg-green-600' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Flujo de Aprobaciones SST</CardTitle>
          <CardDescription>Gestión de aprobaciones por nivel jerárquico</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cambios pendientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-aprobaciones"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando cambios...</div>
          ) : filteredCambios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No se encontraron cambios" : "No hay cambios registrados"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCambios.map((cambio) => {
                const nivelActual = getNivelAprobacionActual(cambio);
                return (
                  <Card key={cambio.id} className="p-4" data-testid={`card-cambio-${cambio.id}`}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{cambio.codigo}</h4>
                            <Badge variant="outline">{cambio.tipo?.replace(/_/g, " ") || "N/A"}</Badge>
                            <Badge 
                              variant={
                                cambio.estado === "aprobado" ? "default" :
                                cambio.estado === "rechazado" ? "destructive" :
                                cambio.estado === "implementado" ? "secondary" :
                                "outline"
                              }
                            >
                              {cambio.estado}
                            </Badge>
                          </div>
                          <p className="text-sm">{cambio.titulo}</p>
                          <p className="text-xs text-muted-foreground mt-1">{cambio.descripcion}</p>
                        </div>
                        {nivelActual !== "completado" && nivelActual !== "pendiente" && cambio.estado !== "aprobado" && (
                          <Button
                            size="sm"
                            onClick={() => handleAprobar(cambio)}
                            data-testid={`button-aprobar-${cambio.id}`}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Gestionar
                          </Button>
                        )}
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Flujo de Aprobación:</p>
                        {renderFlowStatus(cambio)}
                      </div>

                      {getAprobacionesForCambio(cambio.id).length > 0 && (
                        <div className="border-t pt-3">
                          <p className="text-xs font-medium mb-2 text-muted-foreground">Historial de Aprobaciones:</p>
                          <div className="space-y-2">
                            {getAprobacionesForCambio(cambio.id).map((apr) => (
                              <div key={apr.id} className="text-xs bg-muted/50 p-2 rounded">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{apr.aprobador}</span>
                                  <Badge variant={apr.estado === "aprobado" ? "default" : "destructive"} className="text-xs">
                                    {apr.estado}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">{apr.nivelAprobacion.replace(/_/g, " ")}</p>
                                {apr.comentarios && <p className="mt-1 italic">"{apr.comentarios}"</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gestionar Aprobación</DialogTitle>
                <DialogDescription>
                  Cambio: {selectedCambio?.codigo} - {selectedCambio?.titulo}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nivelAprobacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel de Aprobación *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-nivel">
                              <SelectValue placeholder="Seleccione nivel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="coordinador_sst">Coordinador SST</SelectItem>
                            <SelectItem value="alta_direccion">Alta Dirección</SelectItem>
                            <SelectItem value="copasst">COPASST</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decisión *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-estado">
                              <SelectValue placeholder="Seleccione decisión" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aprobado">Aprobado</SelectItem>
                            <SelectItem value="rechazado">Rechazado</SelectItem>
                            <SelectItem value="requiere_revision">Requiere Revisión</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aprobador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aprobador *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del aprobador" data-testid="input-aprobador" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comentarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comentarios</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={3} placeholder="Observaciones de la aprobación..." data-testid="textarea-comentarios" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-aprobacion">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={aprobarMutation.isPending} data-testid="button-submit-aprobacion">
                      Registrar Decisión
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== TAB 4: DASHBOARD ====================

interface DashboardStats {
  totalCambios: number;
  cambiosPorEstado: Record<string, number>;
  cambiosPorCategoria: Record<string, number>;
  cambiosPorNivelImpacto: Record<string, number>;
  tiempoPromedioEvaluacion: number;
  cambiosPendientesEvaluacion: number;
  cambiosEnImplementacion: number;
}

interface AutomatizacionLog {
  id: string;
  companyId: string;
  cambioId: string;
  moduloDestino: string;
  registroDestinoId: string | null;
  estado: string;
  mensaje: string | null;
  createdAt: string;
}

const MODULO_LABELS: Record<string, string> = {
  matriz_riesgos: "Matriz de Riesgos",
  plan_trabajo: "Plan Anual de Trabajo",
  capacitaciones: "Capacitaciones",
  copasst: "Aprobación COPASST",
  matriz_legal: "Matriz Legal",
  politicas: "Políticas SST",
  indicadores: "Indicadores SST",
  notificaciones: "Notificaciones",
};

const MODULO_DESTINOS: Record<string, string> = {
  matriz_riesgos: "Se actualiza en: Planear → IPER → Matriz de Riesgos",
  plan_trabajo: "Se agrega a: Planear → Plan Anual de Trabajo del año actual",
  capacitaciones: "Se programa en: Hacer → Programa de Capacitación",
  copasst: "Se notifica a: Verificar → COPASST → Actas pendientes de aprobación",
  matriz_legal: "Se revisa en: Planear → Matriz Legal → Requisitos aplicables",
  politicas: "Se actualiza en: Planear → Políticas SST",
  indicadores: "Se crea registro en: Verificar → Indicadores SST → Seguimiento",
  notificaciones: "Se envía al: Portal de Empleados → Notificaciones del trabajador",
};

function DashboardTab() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/cambios-sst/dashboard"],
  });

  const { data: automationLogs = [], isLoading: logsLoading } = useQuery<AutomatizacionLog[]>({
    queryKey: ["/api/automatizacion-cambio-logs"],
  });

  const aprobados = stats?.cambiosPorEstado?.['aprobado'] || 0;

  const totalAutomations = automationLogs.length;
  const successCount = automationLogs.filter(log => log.estado === 'exito').length;
  const errorCount = automationLogs.filter(log => log.estado === 'error').length;
  const pendingCount = automationLogs.filter(log => log.estado === 'pendiente').length;

  const countByModule = automationLogs.reduce((acc, log) => {
    acc[log.moduloDestino] = (acc[log.moduloDestino] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentLogs = automationLogs.slice(0, 10);

  const getModuloLabel = (modulo: string) => MODULO_LABELS[modulo] || modulo;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'exito':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Exitoso</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Panel Gestión de Cambios SST</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('/api/gestion-cambios/panel/pdf', '_blank')}
          data-testid="button-download-panel-pdf"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Panel
        </Button>
      </div>
      
      <div className="print-date" style={{ display: 'none' }}>
        Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Cambios</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total">{stats?.totalCambios || 0}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">En Evaluación</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-evaluacion">{stats?.cambiosPendientesEvaluacion || 0}</div>
            <p className="text-xs text-muted-foreground">Pendientes de análisis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-aprobados">{aprobados}</div>
            <p className="text-xs text-muted-foreground">Cambios aprobados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">En Implementación</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-implementacion">{stats?.cambiosEnImplementacion || 0}</div>
            <p className="text-xs text-muted-foreground">Actualmente en proceso</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automatizaciones Ejecutadas
          </CardTitle>
          <CardDescription>Integraciones automáticas del sistema de gestión de cambios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Ejecutadas</p>
                    <p className="text-2xl font-bold" data-testid="stat-automation-total">{totalAutomations}</p>
                  </div>
                  <Workflow className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-green-700 dark:text-green-300">Exitosas</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="stat-automation-success">{successCount}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-red-700 dark:text-red-300">Errores</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300" data-testid="stat-automation-errors">{errorCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300" data-testid="stat-automation-pending">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {Object.keys(countByModule).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Automatizaciones por Módulo <span className="text-xs text-muted-foreground">(clic para ver destino)</span></p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(countByModule).map(([modulo, count]) => (
                  <Popover key={modulo}>
                    <PopoverTrigger asChild>
                      <button type="button" className="inline-flex">
                        <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-accent">
                          {getModuloLabel(modulo)}: {count}
                        </Badge>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" className="max-w-sm p-3">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{getModuloLabel(modulo)}</p>
                        <p className="text-sm text-muted-foreground">{MODULO_DESTINOS[modulo] || "Módulo del sistema SST"}</p>
                        <p className="text-xs text-muted-foreground">Registros: {count}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>
          )}

          {logsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando logs de automatización...</div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay automatizaciones registradas aún</p>
              <p className="text-xs mt-1">Las automatizaciones se ejecutan cuando un cambio es aprobado completamente</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Registros Recientes</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Mensaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-automation-log-${log.id}`}>
                      <TableCell className="text-sm">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getModuloLabel(log.moduloDestino)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getEstadoBadge(log.estado)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.mensaje || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
