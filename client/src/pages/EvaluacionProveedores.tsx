import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ProveedorContratista, 
  InsertProveedorContratista, 
  insertProveedorContratistaSchema,
  EvaluacionProveedor,
  InsertEvaluacionProveedor,
  insertEvaluacionProveedorSchema,
  CriterioEvaluacion,
  InsertCriterioEvaluacion,
  SeguimientoProveedor,
  InsertSeguimientoProveedor,
  insertSeguimientoProveedorSchema,
  RespuestaCriterio
} from "@shared/schema";
import { Plus, Search, Edit, Trash2, FileText, TrendingUp, Users, CheckCircle2, AlertCircle, XCircle, Clock, Download, BarChart3, PieChart, Bot, ClipboardCheck, ClipboardList, AlertTriangle, MinusCircle, ThumbsUp, Wrench, Save, Printer, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { AutomationAssistant, PlantillaInfo } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { getEstandarByCodigo } from "@/data/planear-normativa";

export default function EvaluacionProveedores() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("proveedores");
  const [selectedPlantillaData, setSelectedPlantillaData] = useState<PlantillaInfo | null>(null);
  const [openEvaluacionDialog, setOpenEvaluacionDialog] = useState(false);
  
  const estandarProveedores = getEstandarByCodigo('2.10.1');
  
  const normativaProveedores = estandarProveedores?.normativaAplicable || [
    {
      codigo: 'DEC-1072-2.2.4.6.28',
      norma: 'Decreto 1072/2015',
      articulo: 'Artículo 2.2.4.6.28',
      descripcion: 'Contratación',
      requisitos: [
        'Procedimiento para contratación de personal',
        'Incluir criterios de SST en selección',
        'Verificar afiliación y pagos de seguridad social',
        'Verificar competencias SST de contratistas'
      ],
      obligatorio: true
    }
  ];

  const criteriosEvaluacion = [
    { campo: 'afiliacionSeguridad', valor: 'Afiliación a seguridad social (EPS, ARL, AFP)', normativaReferencia: 'Decreto 1072/2015, Art. 2.2.4.6.28' },
    { campo: 'certificadoAptitud', valor: 'Certificado de aptitud médica ocupacional', normativaReferencia: 'Resolución 2346/2007' },
    { campo: 'capacitacionSST', valor: 'Capacitación en SST básica y específica', normativaReferencia: 'Decreto 1072/2015, Art. 2.2.4.6.11' },
    { campo: 'dotacionEPP', valor: 'Dotación y EPP apropiados para la labor', normativaReferencia: 'Resolución 2400/1979' },
    { campo: 'procedimientos', valor: 'Procedimientos de trabajo seguro documentados', normativaReferencia: 'Decreto 1072/2015, Art. 2.2.4.6.12' },
    { campo: 'certificaciones', valor: 'Certificaciones específicas (trabajo en alturas, etc.)', normativaReferencia: 'Resolución 4272/2021' }
  ];

  const plantillasEvaluacion: PlantillaInfo[] = [
    {
      id: 'evaluacion-inicial-contratista',
      nombre: 'Evaluación Inicial de Contratista',
      descripcion: 'Plantilla para primera evaluación SST de contratistas según Decreto 1072/2015',
      campos: {
        tipoEvaluacion: 'inicial',
        observaciones: 'Evaluación inicial según Art. 2.2.4.6.28 del Decreto 1072/2015. Verificar:\n- Afiliación vigente a ARL, EPS y AFP\n- Certificado de aptitud médica ocupacional\n- Capacitación básica en SST (50 horas)\n- Dotación y EPP apropiados para la labor\n- Procedimientos de trabajo seguro documentados',
        recomendaciones: 'Se recomienda realizar seguimiento trimestral del cumplimiento de requisitos SST y verificar vigencia de documentos.',
        planMejora: 'Implementar lista de verificación documental antes del inicio de labores. Programar inducción en SST específica para la labor a realizar.',
      },
      normativaBase: 'DEC-1072-2.2.4.6.28'
    },
    {
      id: 'evaluacion-riesgo-alto',
      nombre: 'Evaluación Proveedor Riesgo Alto',
      descripcion: 'Plantilla para evaluación de proveedores de servicios de alto riesgo (trabajo en alturas, espacios confinados)',
      campos: {
        tipoEvaluacion: 'inicial',
        observaciones: 'Evaluación de proveedor con actividades de alto riesgo. Verificación obligatoria según Res. 4272/2021 y Res. 0491/2020:\n- Certificación vigente en trabajo en alturas\n- Plan de rescate documentado\n- Equipos certificados y con inspección vigente\n- Permiso de trabajo específico\n- ATS (Análisis de Trabajo Seguro) firmado',
        recomendaciones: 'Verificar que todo el personal cuente con certificación vigente. Realizar inspección de equipos antes de cada jornada. Supervisión permanente durante actividades de alto riesgo.',
        planMejora: 'Establecer procedimiento de verificación diaria de permisos y certificaciones. Implementar check-list de equipos de protección contra caídas.',
      },
      normativaBase: 'RES-4272-2021'
    },
    {
      id: 'reevaluacion-periodica',
      nombre: 'Reevaluación Periódica SST',
      descripcion: 'Plantilla para reevaluación anual de proveedores activos',
      campos: {
        tipoEvaluacion: 'reevaluacion',
        observaciones: 'Reevaluación periódica según estándares mínimos Resolución 0312/2019. Verificar:\n- Cumplimiento del plan de trabajo SST del contratista\n- Indicadores de accidentalidad del último período\n- Vigencia de afiliaciones y certificaciones\n- Cumplimiento de acciones correctivas previas\n- Estado de capacitaciones programadas',
        recomendaciones: 'Mantener actualizado el archivo documental del proveedor. Verificar mensualmente el pago de aportes a seguridad social.',
        planMejora: 'Actualizar matriz de requisitos legales aplicables. Programar auditoría de campo para verificar condiciones de trabajo.',
      },
      normativaBase: 'RES-0312-2019'
    },
    {
      id: 'seguimiento-acciones',
      nombre: 'Seguimiento de Acciones Correctivas',
      descripcion: 'Plantilla para seguimiento de hallazgos y no conformidades detectadas',
      campos: {
        tipoEvaluacion: 'seguimiento',
        observaciones: 'Seguimiento de cumplimiento de acciones correctivas según Art. 2.2.4.6.33 del Decreto 1072/2015:\n- Verificar cierre de no conformidades identificadas\n- Evaluar eficacia de acciones implementadas\n- Revisar evidencias documentales aportadas\n- Validar mejoras en condiciones de SST',
        recomendaciones: 'Documentar evidencia fotográfica de las mejoras implementadas. Realizar entrevista al personal para validar cambios.',
        planMejora: 'Establecer indicadores de seguimiento para verificar sostenibilidad de las mejoras. Programar nueva inspección en 30 días.',
      },
      normativaBase: 'DEC-1072-2.2.4.6.33'
    }
  ];

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    setSelectedPlantillaData(plantilla);
    setActiveTab("evaluaciones");
    setOpenEvaluacionDialog(true);
    
    toast({
      title: "Plantilla aplicada",
      description: `Se ha cargado la plantilla "${plantilla.nombre}" con criterios de ${plantilla.normativaBase}`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const handleClearPlantilla = () => {
    setSelectedPlantillaData(null);
    setOpenEvaluacionDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Evaluación de Proveedores y Contratistas SST</h1>
        <p className="text-muted-foreground">Gestión y evaluación de proveedores según Decreto 1072/2015 y Resolución 0312/2019</p>
      </div>

      <AutomationAssistant
        titulo="Evaluación de Proveedores y Contratistas"
        estandar="2.10.1"
        descripcion="Evaluación del impacto SST de proveedores y contratistas según Decreto 1072/2015, Art. 2.2.4.6.28"
        normativaAplicable={normativaProveedores}
        compact={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="proveedores" data-testid="tab-proveedores">
            <Users className="h-4 w-4 mr-2" />
            Proveedores
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" data-testid="tab-evaluaciones">
            <FileText className="h-4 w-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="seguimiento" data-testid="tab-seguimiento">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Seguimiento
          </TabsTrigger>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Panel de control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proveedores">
          <ProveedoresTab />
        </TabsContent>

        <TabsContent value="evaluaciones">
          <EvaluacionesTab 
            selectedPlantilla={selectedPlantillaData}
            externalDialogOpen={openEvaluacionDialog}
            onClearPlantilla={handleClearPlantilla}
          />
        </TabsContent>

        <TabsContent value="seguimiento">
          <SeguimientoTab />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardTab onNavigateToEvaluaciones={() => setActiveTab("evaluaciones")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== TAB 1: PROVEEDORES ====================

function ProveedoresTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProveedorContratista | null>(null);

  const { data: proveedores = [], isLoading } = useQuery<ProveedorContratista[]>({
    queryKey: ["/api/proveedores"],
  });

  const form = useForm<InsertProveedorContratista>({
    resolver: zodResolver(insertProveedorContratistaSchema),
    defaultValues: {
      razonSocial: "",
      nit: "",
      tipoProveedor: "proveedor",
      tipoServicio: "",
      nivelRiesgoServicio: "medio",
      representanteLegal: "",
      direccion: "",
      telefono: "",
      email: "",
      ciudad: "",
      nombreArl: "",
      numeroTrabajadores: 1,
      nivelRiesgoEmpresa: "I",
      estado: "evaluacion",
      observaciones: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProveedorContratista) =>
      apiRequest("POST", "/api/proveedores", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proveedores"] });
      toast({ title: "Proveedor creado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProveedorContratista> }) =>
      apiRequest("PATCH", `/api/proveedores/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proveedores"] });
      toast({ title: "Proveedor actualizado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/proveedores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proveedores"] });
      toast({ title: "Proveedor eliminado", className: "bg-yellow-50 border-yellow-200" });
    },
  });

  const handleSubmit = (data: InsertProveedorContratista) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: ProveedorContratista) => {
    setEditingItem(item);
    form.reset({
      razonSocial: item.razonSocial,
      nit: item.nit,
      tipoProveedor: item.tipoProveedor,
      tipoServicio: item.tipoServicio,
      nivelRiesgoServicio: item.nivelRiesgoServicio,
      representanteLegal: item.representanteLegal || "",
      direccion: item.direccion || "",
      telefono: item.telefono || "",
      email: item.email || "",
      ciudad: item.ciudad || "",
      nombreArl: item.nombreArl || "",
      numeroTrabajadores: item.numeroTrabajadores,
      nivelRiesgoEmpresa: item.nivelRiesgoEmpresa || "I",
      estado: item.estado,
      observaciones: item.observaciones || "",
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset();
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este proveedor?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredData = proveedores.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.razonSocial.toLowerCase().includes(searchLower) ||
      item.nit.toLowerCase().includes(searchLower) ||
      item.tipoServicio.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando proveedores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-proveedores"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-add-proveedor">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
              <DialogDescription>
                Complete la información del proveedor o contratista
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="razonSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón Social *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-razon-social" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIT *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-nit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipoProveedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Proveedor *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tipo-proveedor">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="proveedor">Proveedor</SelectItem>
                            <SelectItem value="contratista">Contratista</SelectItem>
                            <SelectItem value="subcontratista">Subcontratista</SelectItem>
                            <SelectItem value="temporal">Temporal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoServicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Servicio *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-tipo-servicio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nivelRiesgoServicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel Riesgo Servicio *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-nivel-riesgo-servicio">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critico">Crítico</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                            <SelectItem value="medio">Medio</SelectItem>
                            <SelectItem value="bajo">Bajo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="representanteLegal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Representante Legal</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-representante-legal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-direccion" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-ciudad" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-telefono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ""} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nombreArl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre ARL</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-nombre-arl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numeroTrabajadores"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número Trabajadores *</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^\d+$/.test(val)) {
                                field.onChange(val === "" ? 0 : parseInt(val, 10));
                              }
                            }}
                            onBlur={() => {
                              if (!field.value || field.value < 1) {
                                field.onChange(1);
                              }
                            }}
                            data-testid="input-numero-trabajadores" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nivelRiesgoEmpresa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel Riesgo Empresa</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "I"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-nivel-riesgo-empresa">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="I">I</SelectItem>
                            <SelectItem value="II">II</SelectItem>
                            <SelectItem value="III">III</SelectItem>
                            <SelectItem value="IV">IV</SelectItem>
                            <SelectItem value="V">V</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={3} data-testid="textarea-observaciones" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                    Cancelar
                  </Button>
                  <Button type="submit" data-testid="button-submit-proveedor">
                    {editingItem ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores y Contratistas</CardTitle>
          <CardDescription>Listado de proveedores registrados y su estado de evaluación</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razón Social</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Calificación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay proveedores registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium" data-testid={`text-razon-social-${item.id}`}>
                      {item.razonSocial}
                    </TableCell>
                    <TableCell data-testid={`text-nit-${item.id}`}>{item.nit}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.tipoProveedor}</Badge>
                    </TableCell>
                    <TableCell data-testid={`badge-estado-${item.id}`}><StatusBadge status={item.estado} type="proveedor" /></TableCell>
                    <TableCell data-testid={`text-calificacion-${item.id}`}>
                      {item.ultimaCalificacion ? `${item.ultimaCalificacion}%` : "Sin evaluar"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}

// ==================== TAB 2: EVALUACIONES ====================

interface EvaluacionesTabProps {
  selectedPlantilla?: PlantillaInfo | null;
  externalDialogOpen?: boolean;
  onClearPlantilla?: () => void;
}

// Tipo para las respuestas de criterios
interface RespuestaCriterioLocal {
  criterioId: string;
  cumplimiento: 'cumple' | 'parcial' | 'no_cumple' | null;
  puntaje: number;
  observacion: string;
}

function EvaluacionesTab({ selectedPlantilla, externalDialogOpen, onClearPlantilla }: EvaluacionesTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedProveedor, setSelectedProveedor] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvaluacionProveedor | null>(null);
  const [respuestasCriterios, setRespuestasCriterios] = useState<RespuestaCriterioLocal[]>([]);

  const { data: proveedores = [] } = useQuery<ProveedorContratista[]>({
    queryKey: ["/api/proveedores"],
  });

  const { data: evaluaciones = [] } = useQuery<EvaluacionProveedor[]>({
    queryKey: ["/api/evaluaciones-proveedores"],
  });

  const { data: criterios = [] } = useQuery<CriterioEvaluacion[]>({
    queryKey: ["/api/criterios-evaluacion"],
  });

  const evaluacionFormSchema = z.object({
    proveedorId: z.string().min(1, "Debe seleccionar un proveedor"),
    fechaEvaluacion: z.coerce.date(),
    tipoEvaluacion: z.string().min(1, "Debe seleccionar un tipo"),
    evaluador: z.string().min(1, "El evaluador es requerido"),
    puntajeTotal: z.number().default(0),
    puntajeMaximo: z.number().default(100),
    porcentajeCumplimiento: z.number().default(0),
    estado: z.string().default("pendiente"),
    aprobado: z.number().optional().nullable(),
    observaciones: z.string().optional(),
    recomendaciones: z.string().optional(),
    planMejora: z.string().optional(),
    clasificacion: z.string().optional().nullable(),
    fechaProximaEvaluacion: z.coerce.date().optional().nullable(),
  });

  const form = useForm<z.infer<typeof evaluacionFormSchema>>({
    resolver: zodResolver(evaluacionFormSchema),
    defaultValues: {
      proveedorId: "",
      fechaEvaluacion: new Date(),
      tipoEvaluacion: "inicial",
      evaluador: user?.fullName || user?.username || "",
      puntajeTotal: 0,
      puntajeMaximo: 100,
      porcentajeCumplimiento: 0,
      estado: "pendiente",
      aprobado: null,
      observaciones: "",
      recomendaciones: "",
      planMejora: "",
      clasificacion: null,
      fechaProximaEvaluacion: null,
    },
  });

  // Inicializar respuestas de criterios cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen && criterios.length > 0 && respuestasCriterios.length === 0) {
      const initialRespuestas: RespuestaCriterioLocal[] = criterios.map(c => ({
        criterioId: c.id,
        cumplimiento: null,
        puntaje: 0,
        observacion: ""
      }));
      setRespuestasCriterios(initialRespuestas);
    }
  }, [dialogOpen, criterios, respuestasCriterios.length]);

  // Calcular puntaje total cuando cambian las respuestas
  useEffect(() => {
    if (respuestasCriterios.length > 0) {
      const puntajeTotal = respuestasCriterios.reduce((sum, r) => sum + r.puntaje, 0);
      const puntajeMaximo = criterios.reduce((sum, c) => sum + c.puntajeMaximo, 0);
      const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
      
      form.setValue('puntajeTotal', puntajeTotal);
      form.setValue('puntajeMaximo', puntajeMaximo);
      form.setValue('porcentajeCumplimiento', porcentaje);
      
      // Clasificación automática
      let clasificacion = 'no_apto';
      if (porcentaje >= 90) clasificacion = 'excelente';
      else if (porcentaje >= 75) clasificacion = 'bueno';
      else if (porcentaje >= 60) clasificacion = 'aceptable';
      else if (porcentaje >= 40) clasificacion = 'deficiente';
      
      form.setValue('clasificacion', clasificacion);
      
      // Aprobación automática basada en porcentaje
      if (porcentaje >= 60) {
        form.setValue('aprobado', 1);
      } else if (porcentaje > 0) {
        form.setValue('aprobado', 0);
      }
    }
  }, [respuestasCriterios, criterios, form]);

  // Función para manejar cambio de cumplimiento
  const handleCumplimientoChange = (criterioId: string, cumplimiento: 'cumple' | 'parcial' | 'no_cumple') => {
    const criterio = criterios.find(c => c.id === criterioId);
    if (!criterio) return;

    let puntaje = 0;
    if (cumplimiento === 'cumple') puntaje = criterio.puntajeMaximo;
    else if (cumplimiento === 'parcial') puntaje = Math.round(criterio.puntajeMaximo * 0.5);
    else puntaje = 0;

    setRespuestasCriterios(prev => prev.map(r => 
      r.criterioId === criterioId 
        ? { ...r, cumplimiento, puntaje }
        : r
    ));
  };

  // Función para manejar observación por criterio
  const handleObservacionChange = (criterioId: string, observacion: string) => {
    setRespuestasCriterios(prev => prev.map(r => 
      r.criterioId === criterioId 
        ? { ...r, observacion }
        : r
    ));
  };

  useEffect(() => {
    if (externalDialogOpen && selectedPlantilla) {
      const campos = selectedPlantilla.campos;
      
      if (campos.tipoEvaluacion) {
        form.setValue('tipoEvaluacion', campos.tipoEvaluacion);
      }
      if (campos.observaciones) {
        form.setValue('observaciones', campos.observaciones);
      }
      if (campos.recomendaciones) {
        form.setValue('recomendaciones', campos.recomendaciones);
      }
      if (campos.planMejora) {
        form.setValue('planMejora', campos.planMejora);
      }
      
      setDialogOpen(true);
    }
  }, [externalDialogOpen, selectedPlantilla, form]);

  const initializeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/criterios-evaluacion/initialize"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/criterios-evaluacion"] });
      toast({
        title: "Criterios Base Inicializados",
        description: "Se han cargado los criterios de evaluación. Ahora puede crear evaluaciones de proveedores.",
        className: "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al inicializar criterios",
        description: error.message || "No se pudieron cargar los criterios base",
        variant: "destructive"
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof evaluacionFormSchema>) =>
      apiRequest("POST", "/api/evaluaciones-proveedores", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-proveedores"] });
      toast({ title: "Evaluación creada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof evaluacionFormSchema> }) =>
      apiRequest("PATCH", `/api/evaluaciones-proveedores/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-proveedores"] });
      toast({ title: "Evaluación actualizada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const handleEdit = (item: EvaluacionProveedor) => {
    setEditingItem(item);
    form.reset({
      proveedorId: item.proveedorId,
      fechaEvaluacion: new Date(item.fechaEvaluacion),
      tipoEvaluacion: item.tipoEvaluacion,
      evaluador: item.evaluador,
      puntajeTotal: item.puntajeTotal,
      puntajeMaximo: item.puntajeMaximo,
      porcentajeCumplimiento: item.porcentajeCumplimiento,
      estado: item.estado,
      aprobado: item.aprobado,
      observaciones: item.observaciones || "",
      recomendaciones: item.recomendaciones || "",
      planMejora: item.planMejora || "",
      clasificacion: item.clasificacion,
      fechaProximaEvaluacion: item.fechaProximaEvaluacion ? new Date(item.fechaProximaEvaluacion) : null,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset({
      proveedorId: "",
      fechaEvaluacion: new Date(),
      tipoEvaluacion: "inicial",
      evaluador: user?.fullName || user?.username || "",
      puntajeTotal: 0,
      puntajeMaximo: 100,
      porcentajeCumplimiento: 0,
      estado: "pendiente",
      aprobado: null,
      observaciones: "",
      recomendaciones: "",
      planMejora: "",
      clasificacion: null,
      fechaProximaEvaluacion: null,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Limpiar respuestas de criterios al cerrar
      setRespuestasCriterios([]);
      setEditingItem(null);
      form.reset();
      if (onClearPlantilla) {
        onClearPlantilla();
      }
    }
  };

  const handleSubmit = (data: z.infer<typeof evaluacionFormSchema>) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredEvaluaciones = (selectedProveedor && selectedProveedor !== "all")
    ? evaluaciones.filter((e) => e.proveedorId === selectedProveedor)
    : evaluaciones;

  const proveedoresActivos = proveedores.filter(p => p.estado === "evaluacion" || p.estado === "aprobado");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
          <SelectTrigger className="w-80" data-testid="select-filter-proveedor">
            <SelectValue placeholder="Todos los proveedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proveedores</SelectItem>
            {proveedores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.razonSocial}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {criterios.length === 0 && (
            <Button
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              variant="outline"
              data-testid="button-initialize-criterios"
            >
              <Download className="w-4 h-4 mr-2" />
              Inicializar Criterios Base
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} data-testid="button-add-evaluacion">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Evaluación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem 
                    ? "Editar Evaluación de Proveedor" 
                    : selectedPlantilla 
                      ? `Nueva Evaluación - ${selectedPlantilla.nombre}` 
                      : "Nueva Evaluación de Proveedor"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Modifique el estado, resultado u otros datos de la evaluación"
                    : selectedPlantilla 
                      ? `Formulario pre-llenado con plantilla basada en ${selectedPlantilla.normativaBase}`
                      : "Complete los datos de la evaluación y califique cada criterio"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Requisitos Normativos SST</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                  <strong>Decreto 1072/2015 Art. 2.2.4.6.8.1.6:</strong> Los proveedores deben cumplir con documentación obligatoria (certificado ARL, matriz de riesgos, política SST).
                  <br />
                  <strong>Resolución 0312/2019 Standard 1.1.5:</strong> Aprobación formal requiere verificación documental y seguimiento periódico.
                </AlertDescription>
              </Alert>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="proveedorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-proveedor-evaluacion">
                                <SelectValue placeholder="Seleccione proveedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {proveedoresActivos.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.razonSocial}
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
                          <FormLabel>Fecha Evaluación *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value}
                              data-testid="input-fecha-evaluacion" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipoEvaluacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Evaluación *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tipo-evaluacion">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="inicial">Inicial</SelectItem>
                              <SelectItem value="seguimiento">Seguimiento</SelectItem>
                              <SelectItem value="reevaluacion">Reevaluación</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="evaluador"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evaluador *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-evaluador" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {criterios.length > 0 && (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Criterios de Evaluación</h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-sm">
                            {respuestasCriterios.filter(r => r.cumplimiento).length}/{criterios.length} evaluados
                          </Badge>
                          <Badge 
                            className={`text-sm ${
                              form.watch('porcentajeCumplimiento') >= 60 
                                ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                                : form.watch('porcentajeCumplimiento') > 0 
                                  ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                                  : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {form.watch('puntajeTotal')}/{form.watch('puntajeMaximo')} pts ({form.watch('porcentajeCumplimiento')}%)
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {criterios.map((criterio, index) => {
                          const respuesta = respuestasCriterios.find(r => r.criterioId === criterio.id);
                          return (
                            <div 
                              key={criterio.id} 
                              className={`p-4 rounded-lg border transition-all ${
                                respuesta?.cumplimiento === 'cumple' 
                                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
                                  : respuesta?.cumplimiento === 'parcial'
                                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
                                    : respuesta?.cumplimiento === 'no_cumple'
                                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      #{index + 1}
                                    </span>
                                    <span className="font-medium">{criterio.nombre}</span>
                                    <span className="text-xs text-muted-foreground">
                                      (máx. {criterio.puntajeMaximo} pts)
                                    </span>
                                  </div>
                                  {criterio.descripcion && (
                                    <p className="text-sm text-muted-foreground mb-3">{criterio.descripcion}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={respuesta?.cumplimiento === 'cumple' ? 'default' : 'outline'}
                                      className={respuesta?.cumplimiento === 'cumple' ? 'bg-green-600 hover:bg-green-700' : ''}
                                      onClick={() => handleCumplimientoChange(criterio.id, 'cumple')}
                                      data-testid={`btn-cumple-${criterio.id}`}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Cumple ({criterio.puntajeMaximo} pts)
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={respuesta?.cumplimiento === 'parcial' ? 'default' : 'outline'}
                                      className={respuesta?.cumplimiento === 'parcial' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                      onClick={() => handleCumplimientoChange(criterio.id, 'parcial')}
                                      data-testid={`btn-parcial-${criterio.id}`}
                                    >
                                      <Clock className="h-4 w-4 mr-1" />
                                      Parcial ({Math.round(criterio.puntajeMaximo * 0.5)} pts)
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={respuesta?.cumplimiento === 'no_cumple' ? 'default' : 'outline'}
                                      className={respuesta?.cumplimiento === 'no_cumple' ? 'bg-red-600 hover:bg-red-700' : ''}
                                      onClick={() => handleCumplimientoChange(criterio.id, 'no_cumple')}
                                      data-testid={`btn-no-cumple-${criterio.id}`}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      No Cumple (0 pts)
                                    </Button>
                                  </div>
                                  
                                  <Input
                                    placeholder="Observación opcional..."
                                    value={respuesta?.observacion || ''}
                                    onChange={(e) => handleObservacionChange(criterio.id, e.target.value)}
                                    className="text-sm"
                                    data-testid={`input-obs-${criterio.id}`}
                                  />
                                </div>
                                
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${
                                    respuesta?.cumplimiento === 'cumple' ? 'text-green-600' :
                                    respuesta?.cumplimiento === 'parcial' ? 'text-yellow-600' :
                                    respuesta?.cumplimiento === 'no_cumple' ? 'text-red-600' :
                                    'text-gray-400'
                                  }`}>
                                    {respuesta?.puntaje || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">puntos</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Resumen de clasificación */}
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Clasificación del Proveedor:</span>
                          <Badge className={`text-sm ${
                            form.watch('clasificacion') === 'excelente' ? 'bg-green-600' :
                            form.watch('clasificacion') === 'bueno' ? 'bg-blue-600' :
                            form.watch('clasificacion') === 'aceptable' ? 'bg-yellow-600' :
                            form.watch('clasificacion') === 'deficiente' ? 'bg-orange-600' :
                            'bg-red-600'
                          }`}>
                            {form.watch('clasificacion') === 'excelente' ? 'EXCELENTE (≥90%)' :
                             form.watch('clasificacion') === 'bueno' ? 'BUENO (75-89%)' :
                             form.watch('clasificacion') === 'aceptable' ? 'ACEPTABLE (60-74%)' :
                             form.watch('clasificacion') === 'deficiente' ? 'DEFICIENTE (40-59%)' :
                             'NO APTO (<40%)'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones Generales</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={3} data-testid="textarea-observaciones-eval" />
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
                          <Textarea {...field} value={field.value || ""} rows={2} data-testid="textarea-recomendaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="planMejora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan de Mejora</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} data-testid="textarea-plan-mejora" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado de la Evaluación</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-estado-evaluacion">
                                <SelectValue placeholder="Seleccione estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_proceso">En Proceso</SelectItem>
                              <SelectItem value="completada">Completada</SelectItem>
                              <SelectItem value="vencida">Vencida</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Estado actual del proceso de evaluación
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aprobado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resultado de Aprobación</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                              value={field.value === null ? "null" : String(field.value)}
                              className="flex flex-col gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id="aprobado" data-testid="radio-aprobado" />
                                <label htmlFor="aprobado">Aprobado</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0" id="rechazado" data-testid="radio-rechazado" />
                                <label htmlFor="rechazado">Rechazado</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="null" id="pendiente" data-testid="radio-pendiente" />
                                <label htmlFor="pendiente">Pendiente</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} data-testid="button-cancel-eval">
                      Cancelar
                    </Button>
                    <Button type="submit" data-testid="button-submit-evaluacion" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingItem ? "Guardar Cambios" : "Crear Evaluación"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones de Proveedores</CardTitle>
          <CardDescription>Historial de evaluaciones realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Evaluador</TableHead>
                <TableHead>Puntaje</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Aprobación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No hay evaluaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvaluaciones.map((item) => {
                  const proveedor = proveedores.find(p => p.id === item.proveedorId);
                  const getAprobacionBadge = (aprobado: number | null | undefined) => {
                    if (aprobado === 1) {
                      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 gap-1"><CheckCircle2 className="h-3 w-3" />Aprobado</Badge>;
                    } else if (aprobado === 0) {
                      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 gap-1"><XCircle className="h-3 w-3" />Rechazado</Badge>;
                    } else {
                      return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>;
                    }
                  };
                  return (
                    <TableRow key={item.id}>
                      <TableCell data-testid={`text-fecha-${item.id}`}>
                        {format(new Date(item.fechaEvaluacion), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell data-testid={`text-proveedor-${item.id}`}>
                        {proveedor?.razonSocial || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.tipoEvaluacion}</Badge>
                      </TableCell>
                      <TableCell>{item.evaluador}</TableCell>
                      <TableCell data-testid={`text-puntaje-${item.id}`}>
                        {item.puntajeTotal}/{item.puntajeMaximo} ({item.porcentajeCumplimiento}%)
                      </TableCell>
                      <TableCell>{item.clasificacion || "N/A"}</TableCell>
                      <TableCell data-testid={`badge-estado-eval-${item.id}`}>
                        <StatusBadge status={item.estado} type="evaluacion-proveedor" />
                      </TableCell>
                      <TableCell data-testid={`badge-aprobacion-${item.id}`}>
                        {getAprobacionBadge(item.aprobado)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-evaluacion-${item.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 3: SEGUIMIENTO ====================

// Ítems de verificación por tipo de seguimiento
const ITEMS_VERIFICACION = {
  inspeccion: [
    { id: "epp", nombre: "Uso correcto de EPP", descripcion: "El personal utiliza los elementos de protección personal adecuados" },
    { id: "senalizacion", nombre: "Señalización de seguridad", descripcion: "Existe señalización visible y adecuada" },
    { id: "orden_aseo", nombre: "Orden y aseo", descripcion: "El área de trabajo está ordenada y limpia" },
    { id: "equipos", nombre: "Estado de equipos", descripcion: "Los equipos y herramientas están en buen estado" },
    { id: "emergencias", nombre: "Rutas de emergencia", descripcion: "Las rutas de evacuación están despejadas y señalizadas" },
    { id: "extintores", nombre: "Extintores disponibles", descripcion: "Los extintores están vigentes y accesibles" },
  ],
  auditoria: [
    { id: "sgsst", nombre: "Documentación SG-SST", descripcion: "El proveedor cuenta con sistema de gestión documentado" },
    { id: "politica", nombre: "Política SST", descripcion: "Existe política de seguridad firmada y divulgada" },
    { id: "copasst", nombre: "COPASST conformado", descripcion: "El comité paritario está conformado y activo" },
    { id: "matriz_peligros", nombre: "Matriz de peligros", descripcion: "Cuenta con identificación de peligros actualizada" },
    { id: "plan_emergencias", nombre: "Plan de emergencias", descripcion: "Existe plan de emergencias documentado" },
    { id: "capacitaciones", nombre: "Programa de capacitación", descripcion: "Tiene programa de capacitación en SST" },
    { id: "examenes", nombre: "Exámenes médicos", descripcion: "Personal cuenta con exámenes médicos ocupacionales" },
    { id: "investigacion_at", nombre: "Investigación de AT", descripcion: "Procedimiento de investigación de accidentes implementado" },
  ],
  verificacion_documental: [
    { id: "afiliacion_ss", nombre: "Afiliación seguridad social", descripcion: "Certificados de afiliación a EPS, ARL y pensión vigentes" },
    { id: "pago_ss", nombre: "Pago seguridad social", descripcion: "Planilla de pago de seguridad social al día" },
    { id: "contrato", nombre: "Contrato vigente", descripcion: "El contrato de prestación de servicios está vigente" },
    { id: "certificados_epp", nombre: "Certificados de EPP", descripcion: "Los EPP cuentan con certificación de calidad" },
    { id: "licencias", nombre: "Licencias y permisos", descripcion: "Licencias de operación y permisos vigentes" },
    { id: "polizas", nombre: "Pólizas de seguro", descripcion: "Pólizas de responsabilidad civil vigentes" },
  ],
  reunion: [
    { id: "compromisos_ant", nombre: "Compromisos anteriores", descripcion: "Seguimiento a compromisos de reuniones anteriores" },
    { id: "novedades", nombre: "Novedades reportadas", descripcion: "Se reportaron novedades o incidentes" },
    { id: "mejoras", nombre: "Propuestas de mejora", descripcion: "Se presentaron propuestas de mejora" },
    { id: "proximos_pasos", nombre: "Próximos pasos", descripcion: "Se definieron actividades a seguir" },
  ],
};

// Hallazgos comunes predefinidos
const HALLAZGOS_PREDEFINIDOS = [
  { id: "epp_faltante", texto: "EPP incompleto o inadecuado", tipo: "no_conformidad" },
  { id: "documentacion_vencida", texto: "Documentación vencida o incompleta", tipo: "no_conformidad" },
  { id: "capacitacion_faltante", texto: "Falta de capacitación en SST", tipo: "no_conformidad" },
  { id: "senalizacion_deficiente", texto: "Señalización deficiente", tipo: "hallazgo" },
  { id: "orden_aseo", texto: "Problemas de orden y aseo", tipo: "hallazgo" },
  { id: "riesgo_identificado", texto: "Riesgo no controlado identificado", tipo: "no_conformidad" },
  { id: "incumplimiento_procedimiento", texto: "Incumplimiento de procedimientos", tipo: "no_conformidad" },
  { id: "buenas_practicas", texto: "Se identifican buenas prácticas", tipo: "positivo" },
  { id: "mejora_continua", texto: "Evidencia de mejora continua", tipo: "positivo" },
];

// Acciones correctivas sugeridas
const ACCIONES_SUGERIDAS = [
  { id: "capacitar", texto: "Realizar capacitación específica" },
  { id: "actualizar_doc", texto: "Actualizar documentación faltante" },
  { id: "adquirir_epp", texto: "Adquirir/reemplazar EPP" },
  { id: "implementar_control", texto: "Implementar control de riesgo" },
  { id: "seguimiento_30", texto: "Programar seguimiento en 30 días" },
  { id: "notificar_arl", texto: "Notificar a ARL para acompañamiento" },
  { id: "revision_matriz", texto: "Revisar y actualizar matriz de peligros" },
  { id: "reforzar_procedimiento", texto: "Reforzar procedimiento operativo" },
];

// Tipos para seguimiento inteligente
interface ItemVerificacionRespuesta {
  itemId: string;
  cumple: "si" | "no" | "na" | null;
  observacion?: string;
}

function SeguimientoTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedProveedor, setSelectedProveedor] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Estados para el formulario inteligente
  const [respuestasVerificacion, setRespuestasVerificacion] = useState<ItemVerificacionRespuesta[]>([]);
  const [hallazgosSeleccionados, setHallazgosSeleccionados] = useState<string[]>([]);
  const [accionesSeleccionadas, setAccionesSeleccionadas] = useState<string[]>([]);

  const { data: proveedores = [] } = useQuery<ProveedorContratista[]>({
    queryKey: ["/api/proveedores"],
  });

  const { data: seguimientos = [] } = useQuery<SeguimientoProveedor[]>({
    queryKey: ["/api/seguimientos-proveedores"],
  });

  const form = useForm<InsertSeguimientoProveedor>({
    resolver: zodResolver(insertSeguimientoProveedorSchema),
    defaultValues: {
      proveedorId: "",
      fechaSeguimiento: new Date(),
      tipoSeguimiento: "inspeccion",
      responsable: user?.fullName || user?.username || "",
      cumpleRequisitos: null,
      hallazgos: "",
      noConformidades: "",
      accionesCorrectivas: "",
      estadoAcciones: "pendiente",
      observaciones: "",
    },
  });

  const tipoSeguimiento = form.watch("tipoSeguimiento") as keyof typeof ITEMS_VERIFICACION;

  // Obtener ítems de verificación según el tipo de seguimiento
  const itemsVerificacion = ITEMS_VERIFICACION[tipoSeguimiento] || [];

  // Inicializar respuestas cuando cambia el tipo de seguimiento
  useEffect(() => {
    if (dialogOpen && itemsVerificacion.length > 0) {
      const nuevasRespuestas = itemsVerificacion.map(item => ({
        itemId: item.id,
        cumple: null as "si" | "no" | "na" | null,
        observacion: "",
      }));
      setRespuestasVerificacion(nuevasRespuestas);
    }
  }, [tipoSeguimiento, dialogOpen]);

  // Calcular estadísticas de verificación
  const calcularEstadisticas = () => {
    const respondidos = respuestasVerificacion.filter(r => r.cumple !== null);
    const cumplen = respuestasVerificacion.filter(r => r.cumple === "si").length;
    const noCumplen = respuestasVerificacion.filter(r => r.cumple === "no").length;
    const noAplica = respuestasVerificacion.filter(r => r.cumple === "na").length;
    const aplicables = itemsVerificacion.length - noAplica;
    const porcentaje = aplicables > 0 ? Math.round((cumplen / aplicables) * 100) : 0;
    
    return { respondidos: respondidos.length, cumplen, noCumplen, noAplica, porcentaje, total: itemsVerificacion.length };
  };

  const estadisticas = calcularEstadisticas();

  // Actualizar cumpleRequisitos automáticamente basado en las respuestas
  useEffect(() => {
    if (estadisticas.respondidos === estadisticas.total && estadisticas.total > 0) {
      if (estadisticas.porcentaje >= 80) {
        form.setValue("cumpleRequisitos", 1);
      } else if (estadisticas.porcentaje >= 50) {
        form.setValue("cumpleRequisitos", null); // Parcial
      } else {
        form.setValue("cumpleRequisitos", 0);
      }
    }
  }, [estadisticas]);

  // Manejar cambio de respuesta en ítem de verificación
  const handleVerificacionChange = (itemId: string, cumple: "si" | "no" | "na") => {
    setRespuestasVerificacion(prev => 
      prev.map(r => r.itemId === itemId ? { ...r, cumple } : r)
    );
  };

  // Manejar selección de hallazgo
  const toggleHallazgo = (hallazgoId: string) => {
    setHallazgosSeleccionados(prev => 
      prev.includes(hallazgoId) 
        ? prev.filter(h => h !== hallazgoId)
        : [...prev, hallazgoId]
    );
  };

  // Manejar selección de acción
  const toggleAccion = (accionId: string) => {
    setAccionesSeleccionadas(prev => 
      prev.includes(accionId) 
        ? prev.filter(a => a !== accionId)
        : [...prev, accionId]
    );
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertSeguimientoProveedor) =>
      apiRequest("POST", "/api/seguimientos-proveedores", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seguimientos-proveedores"] });
      toast({ title: "Seguimiento creado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      form.reset();
      setRespuestasVerificacion([]);
      setHallazgosSeleccionados([]);
      setAccionesSeleccionadas([]);
    },
  });

  const handleSubmit = (data: InsertSeguimientoProveedor) => {
    // Combinar hallazgos y no conformidades seleccionados
    const hallazgosTexto = HALLAZGOS_PREDEFINIDOS
      .filter(h => hallazgosSeleccionados.includes(h.id) && h.tipo !== "no_conformidad")
      .map(h => h.texto);
    const noConformidadesTexto = HALLAZGOS_PREDEFINIDOS
      .filter(h => hallazgosSeleccionados.includes(h.id) && h.tipo === "no_conformidad")
      .map(h => h.texto);
    const accionesTexto = ACCIONES_SUGERIDAS
      .filter(a => accionesSeleccionadas.includes(a.id))
      .map(a => a.texto);
    
    // Agregar ítems que no cumplen a los hallazgos
    const itemsNoCumplen = respuestasVerificacion
      .filter(r => r.cumple === "no")
      .map(r => {
        const item = itemsVerificacion.find(i => i.id === r.itemId);
        return item ? `${item.nombre}: No cumple` + (r.observacion ? ` - ${r.observacion}` : "") : "";
      })
      .filter(Boolean);

    const hallazgosFinal = [...hallazgosTexto, ...itemsNoCumplen].join(". ");
    const noConformidadesFinal = noConformidadesTexto.join(". ");
    const accionesFinal = accionesTexto.join(". ");

    createMutation.mutate({
      ...data,
      hallazgos: hallazgosFinal || data.hallazgos || "",
      noConformidades: noConformidadesFinal || data.noConformidades || "",
      accionesCorrectivas: accionesFinal || data.accionesCorrectivas || "",
    });
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setRespuestasVerificacion([]);
      setHallazgosSeleccionados([]);
      setAccionesSeleccionadas([]);
      form.reset();
    }
  };

  const filteredSeguimientos = (selectedProveedor && selectedProveedor !== "all")
    ? seguimientos.filter((s) => s.proveedorId === selectedProveedor)
    : seguimientos;

  const getCumpleRequisitosText = (cumple: number | null) => {
    if (cumple === null) return "Parcial";
    return cumple === 1 ? "Sí" : "No";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
          <SelectTrigger className="w-80" data-testid="select-filter-proveedor-seg">
            <SelectValue placeholder="Todos los proveedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proveedores</SelectItem>
            {proveedores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.razonSocial}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-seguimiento">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Seguimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Nuevo Seguimiento Inteligente
              </DialogTitle>
              <DialogDescription>
                Complete la verificación seleccionando las opciones para cada ítem
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Información básica */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="proveedorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proveedor *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-proveedor-seguimiento">
                                  <SelectValue placeholder="Seleccione proveedor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {proveedores.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.razonSocial}
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
                        name="fechaSeguimiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha Seguimiento *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value}
                                data-testid="input-fecha-seguimiento" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tipoSeguimiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo Seguimiento *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-tipo-seguimiento">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="inspeccion">Inspección</SelectItem>
                                <SelectItem value="auditoria">Auditoría</SelectItem>
                                <SelectItem value="verificacion_documental">Verificación Documental</SelectItem>
                                <SelectItem value="reunion">Reunión</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="responsable"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsable *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-responsable-seg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Resumen de verificación */}
                {estadisticas.total > 0 && (
                  <Card className={cn(
                    "border-2",
                    estadisticas.porcentaje >= 80 ? "border-green-500 bg-green-50" :
                    estadisticas.porcentaje >= 50 ? "border-yellow-500 bg-yellow-50" :
                    estadisticas.respondidos > 0 ? "border-red-500 bg-red-50" : "border-muted"
                  )}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{estadisticas.respondidos}/{estadisticas.total}</div>
                            <div className="text-xs text-muted-foreground">Verificados</div>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div className="flex gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{estadisticas.cumplen}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="font-medium">{estadisticas.noCumplen}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MinusCircle className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{estadisticas.noAplica}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "text-3xl font-bold",
                            estadisticas.porcentaje >= 80 ? "text-green-600" :
                            estadisticas.porcentaje >= 50 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {estadisticas.porcentaje}%
                          </div>
                          <Badge variant={
                            estadisticas.porcentaje >= 80 ? "default" :
                            estadisticas.porcentaje >= 50 ? "secondary" : "destructive"
                          }>
                            {estadisticas.porcentaje >= 80 ? "Cumple" :
                             estadisticas.porcentaje >= 50 ? "Parcial" : "No Cumple"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de verificación */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Lista de Verificación - {tipoSeguimiento === "inspeccion" ? "Inspección" : 
                        tipoSeguimiento === "auditoria" ? "Auditoría" : 
                        tipoSeguimiento === "verificacion_documental" ? "Verificación Documental" : "Reunión"}
                    </CardTitle>
                    <CardDescription>Haga clic en los botones para verificar cada ítem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {itemsVerificacion.map((item, index) => {
                        const respuesta = respuestasVerificacion.find(r => r.itemId === item.id);
                        return (
                          <Card key={item.id} className={cn(
                            "border transition-all",
                            respuesta?.cumple === "si" ? "border-green-400 bg-green-50/50" :
                            respuesta?.cumple === "no" ? "border-red-400 bg-red-50/50" :
                            respuesta?.cumple === "na" ? "border-gray-300 bg-gray-50" : "border-muted"
                          )}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{index + 1}. {item.nombre}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">{item.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={respuesta?.cumple === "si" ? "default" : "outline"}
                                    className={cn(
                                      "h-8 px-3",
                                      respuesta?.cumple === "si" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-100 hover:text-green-700 hover:border-green-400"
                                    )}
                                    onClick={() => handleVerificacionChange(item.id, "si")}
                                    data-testid={`button-verificacion-si-${item.id}`}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Sí
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={respuesta?.cumple === "no" ? "default" : "outline"}
                                    className={cn(
                                      "h-8 px-3",
                                      respuesta?.cumple === "no" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-100 hover:text-red-700 hover:border-red-400"
                                    )}
                                    onClick={() => handleVerificacionChange(item.id, "no")}
                                    data-testid={`button-verificacion-no-${item.id}`}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    No
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={respuesta?.cumple === "na" ? "default" : "outline"}
                                    className={cn(
                                      "h-8 px-3",
                                      respuesta?.cumple === "na" ? "bg-gray-500 hover:bg-gray-600" : "hover:bg-gray-100"
                                    )}
                                    onClick={() => handleVerificacionChange(item.id, "na")}
                                    data-testid={`button-verificacion-na-${item.id}`}
                                  >
                                    <MinusCircle className="w-4 h-4 mr-1" />
                                    N/A
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Hallazgos predefinidos */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Hallazgos y No Conformidades
                    </CardTitle>
                    <CardDescription>Seleccione los hallazgos identificados (opcional)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {HALLAZGOS_PREDEFINIDOS.map((hallazgo) => {
                        const isSelected = hallazgosSeleccionados.includes(hallazgo.id);
                        return (
                          <Button
                            key={hallazgo.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-auto py-1.5 px-3",
                              isSelected && hallazgo.tipo === "no_conformidad" ? "bg-red-600 hover:bg-red-700" :
                              isSelected && hallazgo.tipo === "positivo" ? "bg-green-600 hover:bg-green-700" :
                              isSelected ? "bg-yellow-600 hover:bg-yellow-700" :
                              hallazgo.tipo === "no_conformidad" ? "border-red-300 text-red-700 hover:bg-red-50" :
                              hallazgo.tipo === "positivo" ? "border-green-300 text-green-700 hover:bg-green-50" :
                              "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            )}
                            onClick={() => toggleHallazgo(hallazgo.id)}
                            data-testid={`button-hallazgo-${hallazgo.id}`}
                          >
                            {hallazgo.tipo === "positivo" && <ThumbsUp className="w-3 h-3 mr-1.5" />}
                            {hallazgo.tipo === "no_conformidad" && <XCircle className="w-3 h-3 mr-1.5" />}
                            {hallazgo.tipo === "hallazgo" && <AlertTriangle className="w-3 h-3 mr-1.5" />}
                            {hallazgo.texto}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Acciones correctivas sugeridas */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      Acciones Correctivas
                    </CardTitle>
                    <CardDescription>Seleccione las acciones a implementar (opcional)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {ACCIONES_SUGERIDAS.map((accion) => {
                        const isSelected = accionesSeleccionadas.includes(accion.id);
                        return (
                          <Button
                            key={accion.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-auto py-1.5 px-3",
                              isSelected ? "bg-blue-600 hover:bg-blue-700" : "border-blue-300 text-blue-700 hover:bg-blue-50"
                            )}
                            onClick={() => toggleAccion(accion.id)}
                            data-testid={`button-accion-${accion.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                            {accion.texto}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Plazo y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plazoImplementacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plazo Implementación</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value || ""}
                            data-testid="input-plazo-implementacion" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estadoAcciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Acciones</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "pendiente"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-estado-acciones">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_proceso">En Proceso</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Observaciones adicionales */}
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones Adicionales</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={2} placeholder="Notas adicionales..." data-testid="textarea-observaciones-seg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} data-testid="button-cancel-seg">
                    Cancelar
                  </Button>
                  <Button type="submit" data-testid="button-submit-seguimiento">
                    <Save className="w-4 h-4 mr-2" />
                    Crear Seguimiento
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seguimientos a Proveedores</CardTitle>
          <CardDescription>Historial de inspecciones y seguimientos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Cumple Requisitos</TableHead>
                <TableHead>Estado Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSeguimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay seguimientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredSeguimientos.map((item) => {
                  const proveedor = proveedores.find(p => p.id === item.proveedorId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell data-testid={`text-fecha-seg-${item.id}`}>
                        {format(new Date(item.fechaSeguimiento), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell data-testid={`text-proveedor-seg-${item.id}`}>
                        {proveedor?.razonSocial || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.tipoSeguimiento}</Badge>
                      </TableCell>
                      <TableCell>{item.responsable}</TableCell>
                      <TableCell data-testid={`text-cumple-${item.id}`}>
                        {getCumpleRequisitosText(item.cumpleRequisitos)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.estadoAcciones || "pendiente"}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 4: DASHBOARD ====================

interface DashboardTabProps {
  onNavigateToEvaluaciones: () => void;
}

function DashboardTab({ onNavigateToEvaluaciones }: DashboardTabProps) {
  const { data: proveedores = [] } = useQuery<ProveedorContratista[]>({
    queryKey: ["/api/proveedores"],
  });

  const { data: evaluaciones = [] } = useQuery<EvaluacionProveedor[]>({
    queryKey: ["/api/evaluaciones-proveedores"],
  });

  const { data: seguimientos = [] } = useQuery<SeguimientoProveedor[]>({
    queryKey: ["/api/seguimientos-proveedores"],
  });

  const totalProveedores = proveedores.length;
  const proveedoresAprobados = proveedores.filter(p => p.estado === "aprobado").length;
  const evaluacionesPendientes = evaluaciones.filter(e => e.estado === "pendiente").length;
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const seguimientosDelMes = seguimientos.filter(s => {
    const fecha = new Date(s.fechaSeguimiento);
    return fecha >= firstDayOfMonth;
  }).length;

  const distribucionEstado = proveedores.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const calificacionesPorTipo = proveedores.reduce((acc, p) => {
    if (p.ultimaCalificacion !== null && p.ultimaCalificacion !== undefined) {
      if (!acc[p.tipoProveedor]) {
        acc[p.tipoProveedor] = { total: 0, count: 0 };
      }
      acc[p.tipoProveedor].total += p.ultimaCalificacion;
      acc[p.tipoProveedor].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const topProveedores = proveedores
    .filter(p => p.ultimaCalificacion !== null && p.ultimaCalificacion !== undefined)
    .sort((a, b) => (b.ultimaCalificacion || 0) - (a.ultimaCalificacion || 0))
    .slice(0, 5);

  // Proveedores rechazados o con calificación baja (< 60%)
  const proveedoresRechazados = proveedores
    .filter(p => p.estado === "rechazado" || (p.ultimaCalificacion !== null && p.ultimaCalificacion !== undefined && p.ultimaCalificacion < 60))
    .sort((a, b) => (a.ultimaCalificacion || 0) - (b.ultimaCalificacion || 0));

  // Proveedores sin evaluar (sin calificación)
  const proveedoresSinEvaluar = proveedores
    .filter(p => p.ultimaCalificacion === null || p.ultimaCalificacion === undefined);

  // Contadores adicionales
  const proveedoresRechazadosCount = proveedores.filter(p => p.estado === "rechazado").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Panel Evaluación de Proveedores</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('/api/evaluacion-proveedores/panel/pdf', '_blank')}
          data-testid="button-download-panel-pdf"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Panel
        </Button>
      </div>
      
      <div className="print-date" style={{ display: 'none' }}>
        Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-proveedores">{totalProveedores}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-proveedores-aprobados">{proveedoresAprobados}</div>
            <p className="text-xs text-muted-foreground">
              {totalProveedores > 0 ? Math.round((proveedoresAprobados / totalProveedores) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-proveedores-rechazados">{proveedoresRechazadosCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalProveedores > 0 ? Math.round((proveedoresRechazadosCount / totalProveedores) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Sin Evaluar</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-sin-evaluar">{proveedoresSinEvaluar.length}</div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-evaluaciones-pendientes">{evaluacionesPendientes}</div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Seguimientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-seguimientos-mes">{seguimientosDelMes}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(distribucionEstado).map(([estado, count]) => (
                <div key={estado} className="flex items-center justify-between">
                  <span className="capitalize">{estado}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${totalProveedores > 0 ? (count / totalProveedores) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Calificaciones Promedio por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(calificacionesPorTipo).map(([tipo, data]) => {
                const promedio = Math.round(data.total / data.count);
                return (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="capitalize">{tipo}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600" 
                          style={{ width: `${promedio}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{promedio}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Proveedores Mejor Calificados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Razón Social</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProveedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay proveedores calificados
                  </TableCell>
                </TableRow>
              ) : (
                topProveedores.map((proveedor, index) => (
                  <TableRow key={proveedor.id}>
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell className="font-medium" data-testid={`text-top-razon-social-${index}`}>
                      {proveedor.razonSocial}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{proveedor.tipoProveedor}</Badge>
                    </TableCell>
                    <TableCell data-testid={`text-top-calificacion-${index}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-600" 
                            style={{ width: `${proveedor.ultimaCalificacion}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{proveedor.ultimaCalificacion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                        {proveedor.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sección de Control: Rechazados y Sin Evaluar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proveedores Rechazados o con Calificación Baja */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Proveedores Rechazados / Calificación Baja
            </CardTitle>
            <p className="text-sm text-muted-foreground">Proveedores con estado rechazado o calificación menor a 60%</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedoresRechazados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      No hay proveedores rechazados
                    </TableCell>
                  </TableRow>
                ) : (
                  proveedoresRechazados.map((proveedor) => (
                    <TableRow key={proveedor.id}>
                      <TableCell className="font-medium" data-testid={`text-rechazado-razon-${proveedor.id}`}>
                        {proveedor.razonSocial}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{proveedor.tipoProveedor}</Badge>
                      </TableCell>
                      <TableCell data-testid={`text-rechazado-calificacion-${proveedor.id}`}>
                        {proveedor.ultimaCalificacion !== null && proveedor.ultimaCalificacion !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full",
                                  proveedor.ultimaCalificacion < 60 ? "bg-red-600" : "bg-yellow-600"
                                )}
                                style={{ width: `${proveedor.ultimaCalificacion}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{proveedor.ultimaCalificacion}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
                          {proveedor.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Proveedores Sin Evaluar */}
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Proveedores Sin Evaluar
            </CardTitle>
            <p className="text-sm text-muted-foreground">Proveedores que aún no tienen evaluación registrada</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedoresSinEvaluar.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      Todos los proveedores están evaluados
                    </TableCell>
                  </TableRow>
                ) : (
                  proveedoresSinEvaluar.map((proveedor) => (
                    <TableRow key={proveedor.id}>
                      <TableCell className="font-medium" data-testid={`text-sin-evaluar-razon-${proveedor.id}`}>
                        {proveedor.razonSocial}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{proveedor.tipoProveedor}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                          {proveedor.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={onNavigateToEvaluaciones}
                          data-testid={`button-evaluar-${proveedor.id}`}
                        >
                          <ClipboardList className="h-4 w-4 mr-1" />
                          Evaluar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
