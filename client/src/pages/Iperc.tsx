import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, AlertTriangle, CheckCircle2, Clock, FileText, Shield, X, Bot, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MatrizIperc, Company, insertMatrizIpercSchema, PeligroIperc, Worker, ResponsibleDesignation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { peligrosGTC45Predefinidos, getPeligroByCodigo, clasificacionPeligroLabels } from "@/data/peligros-gtc45-predefinidos";
import { PeligroDialog } from "@/components/PeligroDialog";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { useSearch } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { 
  AREAS_TRABAJO, 
  PROCESOS_TRABAJO, 
  CARGOS_RESPONSABLES_SST, 
  ALCANCES_IPERC,
  METODOLOGIAS_EVALUACION,
  ESTADOS_MATRIZ,
  generarCodigoMatriz,
  generarNombreMatriz,
  getProcesosPorArea
} from "@/data/iperc-automatizacion";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { OrigenPesvBanner } from "@/components/OrigenPesvBanner";

const normativaIperc = [
  {
    codigo: 'GTC-45-2012',
    norma: 'GTC-45',
    articulo: 'Guía Técnica Colombiana',
    descripcion: 'Guía para la identificación de peligros y valoración de riesgos en SST',
    requisitos: [
      'Identificación sistemática de peligros',
      'Evaluación de riesgos por probabilidad y consecuencia',
      'Controles según jerarquía de controles',
      'Priorización de intervenciones'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.15',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.15',
    descripcion: 'Identificación de peligros, evaluación y valoración de riesgos',
    requisitos: [
      'Identificación anual de peligros y evaluación de riesgos',
      'Incluir todos los procesos y actividades',
      'Participación de trabajadores',
      'Actualización ante cambios en procesos'
    ],
    obligatorio: true
  }
];

const formSchema = insertMatrizIpercSchema.omit({
  version: true,
}).extend({
  companyId: z.string().optional(),
});

export default function Iperc() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatrizId, setSelectedMatrizId] = useState<string | null>(null);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [selectedPredefPeligro, setSelectedPredefPeligro] = useState("");
  const [peligroDialogOpen, setPeligroDialogOpen] = useState(false);
  const [selectedPeligro, setSelectedPeligro] = useState<PeligroIperc | null>(null);
  const [editingMatriz, setEditingMatriz] = useState<MatrizIperc | null>(null);
  const [substanceDialogOpen, setSubstanceDialogOpen] = useState(false);
  const [substanceData, setSubstanceData] = useState<{
    commercialName: string;
    chemicalName: string;
    hazardClass: string[];
    controlMeasures: string;
    storageLocation: string;
  } | null>(null);
  const [substanceProcessed, setSubstanceProcessed] = useState(false);
  const [peligroPrefillValues, setPeligroPrefillValues] = useState<Record<string, any> | null>(null);
  const isAdmin = user?.role ? hasGlobalAccess(user.role) : false;

  // Leer parámetros de URL si viene desde Sustancias Químicas
  useEffect(() => {
    if (substanceProcessed) return;
    
    const params = new URLSearchParams(searchParams);
    if (params.get("fromSubstance") === "true") {
      const data = {
        commercialName: params.get("commercialName") || "",
        chemicalName: params.get("chemicalName") || "",
        hazardClass: params.get("hazardClass")?.split(",").filter(Boolean) || [],
        controlMeasures: decodeURIComponent(params.get("controlMeasures") || ""),
        storageLocation: params.get("storageLocation") || "",
      };
      setSubstanceData(data);
      setSubstanceDialogOpen(true);
      setSubstanceProcessed(true);
      // Limpiar la URL sin recargar
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, substanceProcessed]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      nombre: "",
      codigo: "",
      area: "",
      proceso: "",
      responsableEvaluacion: user?.fullName || user?.username || "",
      cargoResponsable: "Responsable SG-SST",
      fechaEvaluacion: new Date(),
      estado: "borrador",
      metodologia: "GTC-45",
      alcance: "Aplica a todos los procesos y actividades de la empresa",
    },
  });

  const { data: matrices = [], isLoading } = useQuery<MatrizIperc[]>({
    queryKey: ["/api/matrices-iperc"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isAdmin,
  });

  // Obtener la empresa actual del usuario (para usuarios no admin)
  const { data: currentCompany } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !isAdmin,
  });

  // Auto-seleccionar empresa cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen && !editingMatriz) {
      // Si es admin y solo hay una empresa, seleccionarla
      if (isAdmin && companies.length === 1) {
        form.setValue("companyId", companies[0].id);
      }
      // Si no es admin, usar la empresa actual
      if (!isAdmin && currentCompany) {
        form.setValue("companyId", currentCompany.id);
      }
    }
  }, [dialogOpen, editingMatriz, isAdmin, companies, currentCompany, form]);

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  // Obtener designaciones de responsable SST para auto-llenar el formulario
  const { data: responsibleDesignations = [] } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
  });

  // Obtener el responsable SST activo (el más reciente con status activo)
  const activeResponsible = useMemo(() => {
    const activos = responsibleDesignations.filter((d) => d.status === "activo");
    if (activos.length === 0 || !workers) return null;
    // Ordenar por fecha de designación descendente para obtener el más reciente
    activos.sort((a, b) => new Date(b.designationDate).getTime() - new Date(a.designationDate).getTime());
    const designacion = activos[0];
    const worker = workers.find((w) => w.id === designacion.workerId);
    if (!worker) return null;
    return {
      workerId: worker.id,
      name: worker.name,
      position: worker.position || "Responsable SG-SST",
    };
  }, [responsibleDesignations, workers]);

  // Auto-llenar responsable y cargo con el responsable SST activo cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen && !editingMatriz && activeResponsible) {
      // Solo auto-llenar si los campos están vacíos o tienen valores por defecto
      const currentResponsable = form.getValues("responsableEvaluacion");
      const currentCargo = form.getValues("cargoResponsable");
      
      if (!currentResponsable || currentResponsable === "" || currentResponsable === user?.fullName || currentResponsable === user?.username) {
        form.setValue("responsableEvaluacion", activeResponsible.name);
      }
      if (!currentCargo || currentCargo === "Responsable SG-SST" || currentCargo === "") {
        form.setValue("cargoResponsable", activeResponsible.position);
      }
    }
  }, [dialogOpen, editingMatriz, activeResponsible, form, user]);

  // Filtrar trabajadores con contratos activos para selección de responsable
  const workersConContrato = useMemo(() => {
    if (!workers || !contracts) return [];
    const workerIdsConContrato = new Set(
      contracts
        .filter((c: any) => c.status === "activo")
        .map((c: any) => c.workerId)
    );
    return workers.filter((w) => workerIdsConContrato.has(w.id));
  }, [workers, contracts]);

  // Auto-llenar cargo del responsable cuando cambia la selección
  const responsableActual = form.watch("responsableEvaluacion");
  useEffect(() => {
    if (responsableActual && workersConContrato.length > 0 && dialogOpen) {
      const selectedWorker = workersConContrato.find(w => w.name === responsableActual);
      if (selectedWorker?.position) {
        const cargoActual = form.getValues("cargoResponsable");
        // Solo auto-llenar si el cargo está vacío, es el default, o no existe
        if (!cargoActual || cargoActual === "Responsable SG-SST" || cargoActual === "") {
          form.setValue("cargoResponsable", selectedWorker.position);
        }
      }
    }
  }, [responsableActual, workersConContrato, dialogOpen, form]);

  // Estado para área seleccionada (para filtrar procesos)
  const [selectedArea, setSelectedArea] = useState("");

  // Procesos filtrados por área seleccionada
  const procesosFiltrados = useMemo(() => {
    if (!selectedArea) return PROCESOS_TRABAJO;
    const areaObj = AREAS_TRABAJO.find(a => a.nombre === selectedArea);
    if (!areaObj) return PROCESOS_TRABAJO;
    return PROCESOS_TRABAJO.filter(p => p.area === areaObj.codigo);
  }, [selectedArea]);

  const { data: peligros = [], isLoading: isLoadingPeligros } = useQuery<PeligroIperc[]>({
    queryKey: [`/api/matrices-iperc/${selectedMatrizId}/peligros`],
    enabled: !!selectedMatrizId && heatmapOpen,
  });

  // Auto-generar código y auto-seleccionar proceso cuando cambia el área (solo para nuevas matrices, no al editar)
  useEffect(() => {
    if (selectedArea && dialogOpen && !editingMatriz) {
      const areaObj = AREAS_TRABAJO.find(a => a.nombre === selectedArea);
      if (areaObj) {
        const consecutivo = matrices.length + 1;
        const nuevoCodigo = generarCodigoMatriz(selectedArea, consecutivo);
        
        // Auto-seleccionar el primer proceso del área solo si el campo está vacío
        const procesosDelArea = PROCESOS_TRABAJO.filter(p => p.area === areaObj.codigo);
        const primerProceso = procesosDelArea.length > 0 ? procesosDelArea[0].nombre : '';
        const procesoActual = form.getValues('proceso');
        
        // Solo establecer el proceso si está vacío o si el proceso actual no pertenece al área seleccionada
        const procesoActualEnArea = procesosDelArea.some(p => p.nombre === procesoActual);
        if (!procesoActual || !procesoActualEnArea) {
          if (primerProceso) {
            form.setValue('proceso', primerProceso, { shouldDirty: false });
          }
        }
        
        // Usar el proceso vigente (ya sea el auto-seleccionado o el existente)
        const procesoParaNombre = !procesoActual || !procesoActualEnArea ? primerProceso : procesoActual;
        const nuevoNombre = generarNombreMatriz(selectedArea, procesoParaNombre || undefined);
        form.setValue('codigo', nuevoCodigo);
        form.setValue('nombre', nuevoNombre);
      }
    }
  }, [selectedArea, dialogOpen, matrices.length, editingMatriz]);

  const selectedMatriz = matrices.find(m => m.id === selectedMatrizId);

  const openHeatmap = (matrizId: string) => {
    setSelectedMatrizId(matrizId);
    setHeatmapOpen(true);
  };

  const openPeligroDialog = (peligro?: PeligroIperc) => {
    setSelectedPeligro(peligro || null);
    setPeligroDialogOpen(true);
  };

  const deletePeligroMutation = useMutation({
    mutationFn: async (peligroId: string) => {
      await apiRequest("DELETE", `/api/peligros-iperc/${peligroId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matrices-iperc/${selectedMatrizId}/peligros`] });
      toast({
        title: "Peligro eliminado",
        description: "El peligro se ha eliminado exitosamente",
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

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = isAdmin && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/matrices-iperc", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matrices-iperc"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Matriz IPERC creada",
        description: "La matriz de identificación de peligros y evaluación de riesgos se ha creado exitosamente",
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

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema> & { id: string }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/matrices-iperc/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matrices-iperc"] });
      setDialogOpen(false);
      setEditingMatriz(null);
      form.reset();
      toast({
        title: "Matriz IPERC actualizada",
        description: "La matriz se ha actualizado exitosamente",
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

  const openEditDialog = (matriz: MatrizIperc, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingMatriz(matriz);
    setSelectedArea(matriz.area);
    form.reset({
      companyId: matriz.companyId || "",
      nombre: matriz.nombre,
      codigo: matriz.codigo || "",
      area: matriz.area,
      proceso: matriz.proceso || "",
      responsableEvaluacion: matriz.responsableEvaluacion,
      cargoResponsable: matriz.cargoResponsable || "Responsable SG-SST",
      fechaEvaluacion: new Date(matriz.fechaEvaluacion),
      estado: matriz.estado,
      metodologia: matriz.metodologia || "GTC-45",
      alcance: matriz.alcance || "",
    });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingMatriz(null);
      setSelectedArea("");
      form.reset({
        companyId: "",
        nombre: "",
        codigo: "",
        area: "",
        proceso: "",
        responsableEvaluacion: user?.fullName || user?.username || "",
        cargoResponsable: "Responsable SG-SST",
        fechaEvaluacion: new Date(),
        estado: "borrador",
        metodologia: "GTC-45",
        alcance: "Aplica a todos los procesos y actividades de la empresa",
      });
    }
  };

  const openNewDialog = () => {
    setEditingMatriz(null);
    setSelectedArea("");
    form.reset({
      companyId: "",
      nombre: "",
      codigo: "",
      area: "",
      proceso: "",
      responsableEvaluacion: user?.fullName || user?.username || "",
      cargoResponsable: "Responsable SG-SST",
      fechaEvaluacion: new Date(),
      estado: "borrador",
      metodologia: "GTC-45",
      alcance: "Aplica a todos los procesos y actividades de la empresa",
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingMatriz) {
      updateMutation.mutate({ ...values, id: editingMatriz.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const filteredMatrices = matrices.filter((matriz) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      matriz.nombre.toLowerCase().includes(searchLower) ||
      matriz.area.toLowerCase().includes(searchLower) ||
      (matriz.codigo?.toLowerCase().includes(searchLower) ?? false) ||
      (matriz.proceso?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      "borrador": { label: "Borrador", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400", icon: FileText },
      "revision": { label: "En Revisión", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Clock },
      "aprobada": { label: "Aprobada", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "vigente": { label: "Vigente", className: "bg-green-600/10 text-green-800 dark:text-green-300", icon: Shield },
      "obsoleta": { label: "Obsoleta", className: "bg-red-500/10 text-red-700 dark:text-red-400", icon: AlertTriangle },
    };
    const item = config[estado as keyof typeof config] || config["borrador"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">IPERC - Identificación de Peligros y Evaluación de Riesgos</h1>
          <p className="text-muted-foreground">Metodología GTC-45 | Resolución 0312/2019 Estándar 1.1.2</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <Button data-testid="button-create-matriz" onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Matriz IPERC
          </Button>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMatriz ? "Editar Matriz IPERC" : "Nueva Matriz IPERC"}</DialogTitle>
              <DialogDescription>
                {editingMatriz 
                  ? "Modifique los datos de la matriz IPERC. Puede cambiar el estado para avanzar en el ciclo de aprobación."
                  : "Cree una nueva matriz para identificar peligros y evaluar riesgos en su empresa"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Solo mostrar selector de empresa si es admin y hay más de una empresa */}
                {isAdmin && companies.length > 1 && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Seleccione empresa" />
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

                {/* Área - Lista desplegable según GTC-45 */}
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Área *
                        <Badge variant="outline" className="text-xs font-normal">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Auto-genera código
                        </Badge>
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedArea(value);
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-area" className="w-full truncate">
                            <SelectValue placeholder="Seleccione área de trabajo" className="truncate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] max-w-[400px]">
                          {AREAS_TRABAJO.map((area) => (
                            <SelectItem key={area.codigo} value={area.nombre}>
                              <div className="flex flex-col max-w-[350px]">
                                <span className="truncate">{area.nombre}</span>
                                <span className="text-xs text-muted-foreground truncate">{area.descripcion}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre - Auto-generado pero editable */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Nombre de la Matriz *
                        <Badge variant="outline" className="text-xs font-normal text-green-600">Auto-generado</Badge>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-nombre" placeholder="Se genera automáticamente al seleccionar área" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Código - Auto-generado */}
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Código
                          <Badge variant="outline" className="text-xs font-normal text-green-600">Auto</Badge>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-codigo" readOnly className="bg-muted" />
                        </FormControl>
                        <FormDescription className="text-xs">Formato: IPERC-[ÁREA]-[AÑO]-[###]</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Proceso - Lista desplegable filtrada por área */}
                  <FormField
                    control={form.control}
                    name="proceso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proceso</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger data-testid="select-proceso" className="truncate">
                              <SelectValue placeholder="Seleccione proceso" className="truncate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px] max-w-[400px]">
                            {procesosFiltrados.map((proceso) => (
                              <SelectItem key={proceso.codigo} value={proceso.nombre}>
                                <div className="flex flex-col max-w-[350px]">
                                  <span className="truncate">{proceso.nombre}</span>
                                  <span className="text-xs text-muted-foreground truncate">{proceso.actividades.slice(0, 2).join(', ')}</span>
                                </div>
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
                  {/* Responsable - Lista de trabajadores con contrato activo */}
                  <FormField
                    control={form.control}
                    name="responsableEvaluacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Auto-llenar cargo del trabajador seleccionado
                            const selectedWorker = workersConContrato.find(w => w.name === value);
                            if (selectedWorker?.position) {
                              form.setValue("cargoResponsable", selectedWorker.position);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-responsable" className="truncate">
                              <SelectValue placeholder="Seleccione responsable" className="truncate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px] max-w-[400px]">
                            {workersConContrato.length > 0 ? (
                              workersConContrato.map((worker) => (
                                <SelectItem key={worker.id} value={worker.name}>
                                  <div className="flex flex-col max-w-[350px]">
                                    <span className="truncate">{worker.name}</span>
                                    <span className="text-xs text-muted-foreground truncate">{worker.position}</span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value={user?.fullName || user?.username || ''} disabled>
                                No hay trabajadores con contrato activo
                              </SelectItem>
                            )}
                            {/* También permitir el usuario actual si no hay trabajadores */}
                            {workersConContrato.length === 0 && user && (
                              <SelectItem value={user.fullName || user.username || ''}>
                                {user.fullName || user.username} (Usuario actual)
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">Solo trabajadores con contrato activo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cargo - Auto-llenado desde trabajador o lista predefinida */}
                  <FormField
                    control={form.control}
                    name="cargoResponsable"
                    render={({ field }) => {
                      // Obtener el cargo del trabajador seleccionado
                      const responsableActual = form.watch("responsableEvaluacion");
                      const workerSeleccionado = workersConContrato.find(w => w.name === responsableActual);
                      const cargoDelTrabajador = workerSeleccionado?.position;
                      // Verificar si el cargo está en la lista predefinida
                      const cargoEnLista = CARGOS_RESPONSABLES_SST.some(c => c.cargo === cargoDelTrabajador);
                      
                      return (
                        <FormItem>
                          <FormLabel>Cargo Responsable</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger data-testid="select-cargo" className="truncate">
                                <SelectValue placeholder="Seleccione cargo" className="truncate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] max-w-[400px]">
                              {/* Mostrar el cargo del trabajador primero si no está en la lista */}
                              {cargoDelTrabajador && !cargoEnLista && (
                                <SelectItem key="cargo-trabajador" value={cargoDelTrabajador}>
                                  <div className="flex flex-col max-w-[350px]">
                                    <span className="truncate">{cargoDelTrabajador}</span>
                                    <span className="text-xs text-muted-foreground truncate">Cargo del trabajador seleccionado</span>
                                  </div>
                                </SelectItem>
                              )}
                              {CARGOS_RESPONSABLES_SST.map((cargo, idx) => (
                                <SelectItem key={idx} value={cargo.cargo}>
                                  <div className="flex flex-col max-w-[350px]">
                                    <span className="truncate">{cargo.cargo}</span>
                                    <span className="text-xs text-muted-foreground truncate">{cargo.normativa}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Alcance - Lista predefinida */}
                <FormField
                  control={form.control}
                  name="alcance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcance</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-alcance" className="truncate">
                            <SelectValue placeholder="Seleccione alcance de la matriz" className="truncate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] max-w-[400px]">
                          {ALCANCES_IPERC.map((alcance) => (
                            <SelectItem key={alcance.codigo} value={alcance.descripcion}>
                              <div className="flex flex-col max-w-[350px]">
                                <span className="font-medium truncate">{alcance.aplicaA}</span>
                                <span className="text-xs text-muted-foreground truncate">{alcance.descripcion.substring(0, 80)}...</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">Define el alcance según metodología GTC-45</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Metodología - Lista según normativa */}
                  <FormField
                    control={form.control}
                    name="metodologia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metodología</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'GTC-45'}>
                          <FormControl>
                            <SelectTrigger data-testid="select-metodologia" className="truncate">
                              <SelectValue placeholder="Seleccione metodología" className="truncate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-w-[400px]">
                            {METODOLOGIAS_EVALUACION.map((met) => (
                              <SelectItem key={met.codigo} value={met.codigo}>
                                <div className="flex flex-col max-w-[350px]">
                                  <span className="truncate">{met.nombre}</span>
                                  <span className="text-xs text-muted-foreground truncate">{met.normativaBase}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estado - Lista con iconos */}
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-estado" className="truncate">
                              <SelectValue className="truncate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-w-[400px]">
                            {ESTADOS_MATRIZ.map((estado) => (
                              <SelectItem key={estado.valor} value={estado.valor}>
                                <div className="flex items-center gap-2 max-w-[350px]">
                                  <div className={`w-2 h-2 rounded-full bg-${estado.color}-500 flex-shrink-0`} />
                                  <span className="truncate">{estado.etiqueta}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending} 
                    data-testid="button-submit-matriz"
                  >
                    {editingMatriz 
                      ? (updateMutation.isPending ? "Guardando..." : "Guardar Cambios")
                      : (createMutation.isPending ? "Creando..." : "Crear Matriz")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <AutomationAssistant
        titulo="IPERC - Identificación de Peligros"
        estandar="2.1.1"
        descripcion="Identificación de peligros y evaluación de riesgos según metodología GTC-45"
        normativaAplicable={normativaIperc}
        compact={true}
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, área, código o proceso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            data-testid="input-search"
          />
        </div>
      </div>

      <OrigenPesvBanner compacto={true} />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando matrices IPERC...</p>
        </div>
      ) : filteredMatrices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay matrices IPERC</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No se encontraron matrices que coincidan con la búsqueda" : "Comience creando su primera matriz de identificación de peligros"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Matriz IPERC
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatrices.map((matriz) => (
            <Card 
              key={matriz.id} 
              className="hover-elevate active-elevate-2 cursor-pointer" 
              data-testid={`card-matriz-${matriz.id}`}
              onClick={() => openHeatmap(matriz.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{matriz.nombre}</CardTitle>
                    <CardDescription className="truncate">{matriz.area}</CardDescription>
                  </div>
                  {getEstadoBadge(matriz.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {matriz.codigo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-medium">{matriz.codigo}</span>
                    </div>
                  )}
                  {matriz.proceso && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Proceso:</span>
                      <span className="font-medium truncate ml-2">{matriz.proceso}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versión:</span>
                    <span className="font-medium">v{matriz.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">{new Date(matriz.fechaEvaluacion).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsable:</span>
                    <span className="font-medium truncate ml-2">{matriz.responsableEvaluacion}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => openEditDialog(matriz, e)}
                    data-testid={`button-edit-matriz-${matriz.id}`}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sheet para mostrar mapa de calor de riesgos */}
      <Sheet open={heatmapOpen} onOpenChange={setHeatmapOpen}>
        <SheetContent side="right" className="w-full sm:max-w-7xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl">Mapa de Calor de Riesgos</SheetTitle>
                <SheetDescription>
                  {selectedMatriz?.nombre} - {selectedMatriz?.area}
                </SheetDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setHeatmapOpen(false);
                  setSelectedMatrizId(null);
                  setSelectedPredefPeligro("");
                }}
                data-testid="button-close-heatmap"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Asistente Inteligente - Informativo sobre peligros GTC-45 */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <CardTitle className="text-base text-blue-900 dark:text-blue-100">Asistente Inteligente GTC-45</CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        Seleccione un peligro predefinido según la metodología GTC-45:2012 para obtener información detallada
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPredefPeligro} onValueChange={setSelectedPredefPeligro}>
                    <SelectTrigger className="bg-white dark:bg-gray-950" data-testid="select-peligro-gtc45">
                      <SelectValue placeholder="Seleccione un peligro predefinido GTC-45..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {Object.entries(clasificacionPeligroLabels).map(([clasificacion, label]) => (
                        <div key={clasificacion}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
                          {peligrosGTC45Predefinidos.filter(p => p.clasificacion === clasificacion).map((peligro) => (
                            <SelectItem key={peligro.codigo} value={peligro.codigo}>
                              {peligro.codigo} - {peligro.peligro}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPredefPeligro && (() => {
                    const peligro = getPeligroByCodigo(selectedPredefPeligro);
                    return peligro ? (
                      <div className="mt-4 p-4 bg-white dark:bg-gray-950 rounded-md space-y-3 text-sm">
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">{peligro.peligro}</p>
                          <p className="text-muted-foreground">{peligro.descripcion}</p>
                        </div>
                        <div>
                          <p className="font-medium">Riesgo Potencial:</p>
                          <p className="text-muted-foreground">{peligro.riesgoPotencial}</p>
                        </div>
                        <div>
                          <p className="font-medium">Efectos Posibles:</p>
                          <p className="text-muted-foreground">{peligro.efectosPosibles}</p>
                        </div>
                        <div>
                          <p className="font-medium">Medidas de Control:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {peligro.medidasControl.map((medida, idx) => (
                              <li key={idx}>{medida}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>

            {/* Botón para agregar peligro + Lista de peligros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Peligros Identificados</h3>
                <Button onClick={() => openPeligroDialog()} data-testid="button-add-peligro">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Peligro
                </Button>
              </div>

              {isLoadingPeligros ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando peligros...</p>
                </div>
              ) : peligros.length > 0 && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clasificación</TableHead>
                          <TableHead>Peligro</TableHead>
                          <TableHead>Actividad</TableHead>
                          <TableHead className="text-center">Probabilidad</TableHead>
                          <TableHead className="text-center">Severidad</TableHead>
                          <TableHead>Nivel de Riesgo</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {peligros.map((peligro) => (
                          <TableRow key={peligro.id}>
                            <TableCell className="capitalize">{peligro.clasificacion.replace('_', ' ')}</TableCell>
                            <TableCell className="max-w-xs truncate">{peligro.descripcionPeligro}</TableCell>
                            <TableCell className="max-w-xs truncate">{peligro.actividadProceso}</TableCell>
                            <TableCell className="text-center capitalize">{peligro.nivelProbabilidad.replace('_', ' ')}</TableCell>
                            <TableCell className="text-center capitalize">{peligro.nivelSeveridad.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Badge className={
                                peligro.nivelRiesgo === 'trivial' ? 'bg-green-500/10 text-green-700' :
                                peligro.nivelRiesgo === 'tolerable' ? 'bg-yellow-500/10 text-yellow-700' :
                                peligro.nivelRiesgo === 'moderado' ? 'bg-orange-500/10 text-orange-700' :
                                peligro.nivelRiesgo === 'importante' ? 'bg-red-500/10 text-red-700' :
                                'bg-red-700/10 text-red-900'
                              }>
                                {peligro.nivelRiesgo.charAt(0).toUpperCase() + peligro.nivelRiesgo.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openPeligroDialog(peligro)}
                                  data-testid={`button-edit-peligro-${peligro.id}`}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm('¿Está seguro de eliminar este peligro?')) {
                                      deletePeligroMutation.mutate(peligro.id);
                                    }
                                  }}
                                  data-testid={`button-delete-peligro-${peligro.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Mapa de calor */}
            {isLoadingPeligros ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando mapa de riesgos...</p>
              </div>
            ) : peligros.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay peligros registrados</h3>
                    <p className="text-muted-foreground">
                      Agregue peligros a esta matriz para visualizar el mapa de calor de riesgos. Use el asistente inteligente GTC-45 para información detallada sobre los peligros.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RiskHeatmap 
                riesgos={peligros.map(p => {
                  // Convertir enums a valores numéricos para el heatmap
                  const probabilidadMap = { "baja": 1, "media": 2, "alta": 3, "muy_alta": 4 };
                  const severidadMap = { "ligeramente_danino": 1, "danino": 2, "muy_danino": 3, "extremadamente_danino": 4 };
                  
                  return {
                    probabilidad: probabilidadMap[p.nivelProbabilidad as keyof typeof probabilidadMap] || 1,
                    severidad: severidadMap[p.nivelSeveridad as keyof typeof severidadMap] || 1,
                    nivelRiesgo: p.nivelRiesgo,
                    descripcionPeligro: p.descripcionPeligro,
                    actividadProceso: p.actividadProceso,
                  };
                })}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog para agregar/editar peligros */}
      {selectedMatrizId && (
        <PeligroDialog
          open={peligroDialogOpen}
          onOpenChange={(open) => {
            setPeligroDialogOpen(open);
            if (!open) {
              setPeligroPrefillValues(null); // Limpiar prefill al cerrar
            }
          }}
          matrizId={selectedMatrizId}
          peligro={selectedPeligro}
          prefillValues={peligroPrefillValues || undefined}
        />
      )}

      {/* Dialog para integrar sustancia química en IPERC */}
      <Dialog open={substanceDialogOpen} onOpenChange={setSubstanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Integración desde Sustancias Químicas
            </DialogTitle>
            <DialogDescription>
              Agregue el peligro químico "{substanceData?.commercialName}" a una matriz IPERC existente o cree una nueva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Datos de la sustancia */}
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Datos de la sustancia a integrar:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Nombre comercial:</span>
                    <p className="font-medium">{substanceData?.commercialName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nombre químico:</span>
                    <p className="font-medium">{substanceData?.chemicalName || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Clasificaciones de peligro:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {substanceData?.hazardClass.map((hc) => (
                      <Badge key={hc} variant="destructive" className="text-xs">
                        {hc}
                      </Badge>
                    ))}
                  </div>
                </div>
                {substanceData?.controlMeasures && (
                  <div>
                    <span className="text-muted-foreground">Medidas de control:</span>
                    <p className="text-xs mt-1">{substanceData.controlMeasures}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selección de matriz */}
            {matrices.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">Seleccione una matriz existente:</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {matrices.map((matriz) => (
                    <Card
                      key={matriz.id}
                      className="cursor-pointer hover-elevate transition-all"
                      onClick={() => {
                        setSelectedMatrizId(matriz.id);
                        setSubstanceDialogOpen(false);
                        // Pre-llenar el formulario de peligro con datos de la sustancia
                        setSelectedPeligro(null);
                        setPeligroPrefillValues({
                          clasificacion: "quimico",
                          descripcionPeligro: `Exposición a ${substanceData?.commercialName} (${substanceData?.chemicalName || "sustancia química"})`,
                          fuenteGeneradora: substanceData?.storageLocation || "Almacenamiento/uso de sustancia química",
                          actividadProceso: "Manipulación, almacenamiento o uso de sustancia química",
                          efectosPosibles: `Efectos adversos a la salud: ${substanceData?.hazardClass.join(", ")}`,
                          controlesExistentes: substanceData?.controlMeasures || "",
                          controlesPropuestos: substanceData?.controlMeasures || "",
                          nivelProbabilidad: "media",
                          nivelSeveridad: "danino",
                          tipoControlPrincipal: "controles_ingenieria",
                        });
                        setPeligroDialogOpen(true);
                        toast({
                          title: "Datos pre-cargados",
                          description: "Los datos de la sustancia química se han pre-llenado en el formulario.",
                        });
                      }}
                      data-testid={`card-select-matriz-${matriz.id}`}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{matriz.nombre}</p>
                          <p className="text-xs text-muted-foreground">{matriz.codigo} - {matriz.area}</p>
                        </div>
                        <Badge variant="outline">{matriz.estado}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay matrices IPERC creadas. Cree una nueva para agregar el peligro.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSubstanceDialogOpen(false)}
              data-testid="button-cancel-substance"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setSubstanceDialogOpen(false);
                setDialogOpen(true);
              }}
              data-testid="button-create-new-matriz"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear nueva matriz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
