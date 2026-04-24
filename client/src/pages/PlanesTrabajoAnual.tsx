import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar, CheckCircle2, Clock, FileText, TrendingUp, Sparkles, Wand2, MoreVertical, Pencil, Trash2, CalendarDays, ArrowLeft, Monitor, Shield, UserCheck, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toDateInputValue } from "@/lib/utils/formatters";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlanTrabajoAnual, Company, Worker, insertPlanTrabajoAnualSchema, EvaluacionSst } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useLocation } from "wouter";
import { z } from "zod";
import { AutomationAssistant, PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { hasGlobalAccess } from "@shared/permissions";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const formSchema = insertPlanTrabajoAnualSchema.omit({
  totalActividades: true,
  actividadesCompletadas: true,
  porcentajeCumplimiento: true,
  presupuestoEjecutado: true,
}).extend({
  companyId: z.string().optional(),
  elaboradoPorId: z.string().optional(),
  autorizadoPorId: z.string().optional(),
  aprobadoPorId: z.string().optional(),
});

export default function PlanesTrabajoAnual() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedCompany: contextCompany } = useCompanyContext();
  const [, setLocation] = useLocation();

  const { data: userCompany } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !!user && !!user.companyId,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [lastAutoFilledCompanyId, setLastAutoFilledCompanyId] = useState<string | null>(null);
  const [showOtroCargoElaborador, setShowOtroCargoElaborador] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanTrabajoAnual | null>(null);
  const hasGlobalAccessFlag = user?.role ? hasGlobalAccess(user.role) : false;

  // Lista de cargos SST comunes según Resolución 0312/2019
  const cargosSstComunes = [
    "Responsable SG-SST",
    "Coordinador SST",
    "Profesional SST",
    "Técnico SST",
    "Gerente General",
    "Representante Legal",
    "Director de Recursos Humanos",
    "Jefe de Talento Humano",
    "Administrador",
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      anio: new Date().getFullYear(),
      fechaElaboracion: new Date(),
      responsableElaboracion: user?.fullName || user?.username || "",
      cargoResponsable: "Responsable SG-SST",
      aprobadoPor: "",
      cargoAprobador: "",
      objetivoGeneral: "",
      alcance: "Aplica a todos los trabajadores, contratistas y visitantes de la empresa",
      presupuestoTotal: 0,
      estado: "borrador",
      elaboradoPorId: "",
      autorizadoPorId: "",
      aprobadoPorId: "",
    },
  });

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    setDialogOpen(true);
    
    if (plantilla.campos.objetivoGeneral) {
      form.setValue("objetivoGeneral", plantilla.campos.objetivoGeneral);
    }
    if (plantilla.campos.alcance) {
      form.setValue("alcance", plantilla.campos.alcance);
    }
    if (plantilla.campos.cargoResponsable) {
      form.setValue("cargoResponsable", plantilla.campos.cargoResponsable);
    }
    if (plantilla.campos.cargoAprobador) {
      form.setValue("cargoAprobador", plantilla.campos.cargoAprobador);
    }
    toast({
      title: "Plantilla aplicada",
      description: `Se ha aplicado la plantilla "${plantilla.nombre}". Revise y complete los campos restantes.`,
      className: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
    });
  };

  const { data: planes = [], isLoading } = useQuery<PlanTrabajoAnual[]>({
    queryKey: ["/api/planes-trabajo-anual"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: hasGlobalAccessFlag,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  // Query para obtener la evaluación SST activa (del año actual)
  const { data: evaluaciones = [] } = useQuery<EvaluacionSst[]>({
    queryKey: ["/api/evaluaciones-sst"],
  });

  const { data: lsoAssignment } = useQuery<any>({
    queryKey: ["/api/lso-directory-jwt/current-assignment"],
  });

  // Encontrar la evaluación del año actual o la más reciente
  const currentYear = new Date().getFullYear();
  const evaluacionActiva = evaluaciones.find(e => e.anio === currentYear) || evaluaciones[0];

  // Objetivo general estándar para empresas colombianas según Decreto 1072/2015
  const objetivoGeneralEstandar = "Planificar, implementar, evaluar y mejorar continuamente las actividades del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), orientadas a prevenir accidentes de trabajo y enfermedades laborales, promoviendo ambientes de trabajo seguros y saludables en cumplimiento de la normatividad legal vigente (Decreto 1072/2015, Resolución 0312/2019).";

  // Auto-llenado cuando se selecciona una empresa (admin) o al abrir el diálogo (usuarios normales)
  const selectedCompanyId = form.watch("companyId");

  // Filtrar trabajadores por empresa seleccionada (para dropdowns de personas)
  const currentCompanyId = hasGlobalAccessFlag ? selectedCompanyId : contextCompany?.id;
  const filteredWorkers = workers.filter(w => 
    w.companyId === currentCompanyId && w.status === 'activo'
  );

  const currentCompany = hasGlobalAccessFlag 
    ? companies.find(c => c.id === selectedCompanyId)
    : (userCompany || contextCompany);

  // Crear opciones para los dropdowns de personas (incluye representante legal si existe)
  const personOptions = [
    // Usuario actual siempre disponible
    { id: "current-user", name: user?.fullName || user?.username || "Usuario actual", position: "Responsable SG-SST" },
    // Representante legal si existe
    ...(currentCompany?.legalRepName ? [{
      id: "legal-rep",
      name: currentCompany.legalRepName,
      position: currentCompany.legalRepPosition || "Representante Legal"
    }] : []),
    // Trabajadores de la empresa
    ...filteredWorkers.map(w => ({
      id: w.id,
      name: w.name,
      position: w.position || "Sin cargo asignado"
    }))
  ];
  
  // Función para auto-llenar campos basándose en datos de la empresa
  const autoFillFromCompany = (company: Company, forceRefresh: boolean = false) => {
    // Si ya se auto-llenó para esta empresa y no es un refresh forzado, no hacer nada
    if (lastAutoFilledCompanyId === company.id && !forceRefresh) return;
    
    const fieldsToAutoFill: string[] = [];
    
    // Auto-llenar objetivo general con texto estándar
    form.setValue("objetivoGeneral", objetivoGeneralEstandar);
    fieldsToAutoFill.push("objetivoGeneral");
    
    if (fieldsToAutoFill.length > 0) {
      setAutoFilledFields(fieldsToAutoFill);
      setLastAutoFilledCompanyId(company.id);
      toast({
        title: "Campos auto-completados",
        description: `Se han llenado ${fieldsToAutoFill.length} campos automáticamente con los datos de ${company.name}.`,
        className: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
      });
    }
  };
  
  // Auto-llenar cuando un admin selecciona una empresa
  useEffect(() => {
    if (!selectedCompanyId || !companies.length) return;
    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
    if (selectedCompany) {
      autoFillFromCompany(selectedCompany);
    }
  }, [selectedCompanyId, companies]);
  
  // Auto-seleccionar empresa si solo hay una disponible
  useEffect(() => {
    if (dialogOpen && hasGlobalAccessFlag && companies.length === 1 && !form.getValues("companyId")) {
      form.setValue("companyId", companies[0].id);
      autoFillFromCompany(companies[0]);
    }
  }, [dialogOpen, hasGlobalAccessFlag, companies]);

  // Auto-llenar para usuarios no-admin cuando abren el diálogo
  useEffect(() => {
    if (dialogOpen && !hasGlobalAccessFlag && contextCompany && lastAutoFilledCompanyId !== contextCompany.id) {
      autoFillFromCompany(contextCompany);
    }
  }, [dialogOpen, hasGlobalAccessFlag, contextCompany, lastAutoFilledCompanyId]);
  
  // Resetear estado de auto-llenado cuando se cierra el diálogo
  useEffect(() => {
    if (!dialogOpen) {
      setLastAutoFilledCompanyId(null);
      setAutoFilledFields([]);
    }
  }, [dialogOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const company = hasGlobalAccessFlag 
        ? companies.find(c => c.id === data.companyId)
        : (userCompany || contextCompany);
      const payload = {
        ...data,
        aprobadoPor: company?.legalRepName || null,
        cargoAprobador: company?.legalRepPosition || "Representante Legal",
        elaboradoPorId: data.elaboradoPorId || null,
        autorizadoPorId: data.autorizadoPorId || null,
        aprobadoPorId: data.aprobadoPorId || null,
        companyId: hasGlobalAccessFlag && data.companyId ? data.companyId : undefined,
      };
      const res = await apiRequest("POST", "/api/planes-trabajo-anual", payload);
      return res.json();
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Plan de trabajo creado",
        description: "El plan anual de trabajo se ha creado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      setLocation(`/planes-trabajo-anual/${newPlan.id}`);
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

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest("DELETE", `/api/planes-trabajo-anual/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual"] });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
      toast({
        title: "Plan eliminado",
        description: "El plan de trabajo se ha eliminado correctamente",
        className: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, plan: PlanTrabajoAnual) => {
    e.stopPropagation();
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    setLocation(`/planes-trabajo-anual/${planId}`);
  };

  const filteredPlanes = planes.filter((plan) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      plan.anio.toString().includes(searchLower) ||
      plan.responsableElaboracion.toLowerCase().includes(searchLower) ||
      (plan.objetivoGeneral?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      "borrador": { label: "Borrador", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400", icon: FileText },
      "aprobado": { label: "Aprobado", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "en-ejecucion": { label: "En Ejecución", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Clock },
      "finalizado": { label: "Finalizado", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: CheckCircle2 },
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

  const getCumplimientoBadge = (porcentaje: number | null) => {
    if (porcentaje === null || porcentaje === 0) {
      return <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">Sin progreso</Badge>;
    }
    
    if (porcentaje < 50) {
      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">{porcentaje}%</Badge>;
    } else if (porcentaje < 80) {
      return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">{porcentaje}%</Badge>;
    } else {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">{porcentaje}%</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Plan Anual de Trabajo SST</h1>
          <p className="text-muted-foreground">Planificación y seguimiento de actividades del Sistema de Gestión SST</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-plan">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan Anual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Plan Anual de Trabajo SST</DialogTitle>
              <DialogDescription>
                Cree el plan de trabajo anual que guiará las actividades del SG-SST durante el año
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {hasGlobalAccessFlag && (
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="anio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año del Plan</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-anio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaElaboracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Elaboración</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? toDateInputValue(field.value) : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-fecha-elaboracion"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="objetivoGeneral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Objetivo General del Plan
                        {autoFilledFields.includes("objetivoGeneral") && (
                          <Badge variant="secondary" className="text-xs py-0 px-1.5 font-normal">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Ej: Planificar, implementar y evaluar las actividades del SG-SST para garantizar ambientes de trabajo seguros y saludables..."
                          rows={3}
                          data-testid="input-objetivo-general"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alcance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcance</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          data-testid="input-alcance"
                        />
                      </FormControl>
                      <FormDescription>
                        A quiénes aplica este plan (trabajadores, contratistas, visitantes, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="responsableElaboracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elaborado Por</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(val) => {
                            field.onChange(val);
                            // Auto-completar cargo si la persona tiene uno
                            const person = personOptions.find(p => p.name === val);
                            if (person && person.position && !showOtroCargoElaborador) {
                              form.setValue("cargoResponsable", person.position);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-elaborado-por">
                              <SelectValue placeholder="Seleccione trabajador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {personOptions.map((person) => (
                              <SelectItem key={person.id} value={person.name}>
                                {person.name}
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
                    name="cargoResponsable"
                    render={({ field }) => {
                      const isCustomValue = field.value && !cargosSstComunes.includes(field.value);
                      const showTextInput = showOtroCargoElaborador || isCustomValue;
                      return (
                        <FormItem>
                          <FormLabel>Cargo Elaborador</FormLabel>
                          {showTextInput ? (
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Escriba el cargo" 
                                  data-testid="input-cargo-elaborador-otro" 
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setShowOtroCargoElaborador(false);
                                  field.onChange("Responsable SG-SST");
                                }}
                              >
                                Lista
                              </Button>
                            </div>
                          ) : (
                            <Select 
                              value={field.value || ""} 
                              onValueChange={(val) => {
                                if (val === "__otro__") {
                                  setShowOtroCargoElaborador(true);
                                  field.onChange("");
                                } else {
                                  field.onChange(val);
                                }
                              }}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-cargo-elaborador">
                                  <SelectValue placeholder="Seleccione cargo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cargosSstComunes.map((cargo) => (
                                  <SelectItem key={cargo} value={cargo}>
                                    {cargo}
                                  </SelectItem>
                                ))}
                                <SelectItem value="__otro__">Otro...</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="borrador">Borrador</SelectItem>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="en-ejecucion">En Ejecución</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Firmas de Aprobación — mismo patrón que Evaluación SST */}
                <div className="space-y-3 border-t pt-3">
                  <h3 className="font-semibold text-sm">Firmas de Aprobación (Opcional)</h3>
                  <p className="text-xs text-muted-foreground">
                    Elaborado automáticamente por el sistema. Autorizado por el LSO asignado. Aprobado por el Representante Legal.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Elaborado por</FormLabel>
                      <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-muted/50 border" data-testid="text-elaborado-por">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">SADGI S.A.S. — Sistema Automatizado</span>
                      </div>
                    </div>

                    <div>
                      <FormLabel className="text-sm font-medium">Autorizado por (LSO)</FormLabel>
                      {lsoAssignment?.data ? (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-muted/50 border" data-testid="text-autorizado-por">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{lsoAssignment.data.name} — Licenciado SST</span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" data-testid="text-autorizado-por-pendiente">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-400">Pendiente — Se asignará cuando se vincule un LSO a la empresa</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel className="text-sm font-medium">Aprobado por (Gerente/Representante Legal)</FormLabel>
                      {currentCompany?.legalRepName ? (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-muted/50 border" data-testid="text-aprobado-por">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            {currentCompany.legalRepName} — {currentCompany.legalRepPosition || 'Representante Legal'}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" data-testid="text-aprobado-por-pendiente">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-400">Pendiente — Registre el Representante Legal en los datos de la empresa</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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
                    {createMutation.isPending ? "Creando..." : "Crear Plan"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <AutomationAssistant
        titulo="Plan Anual de Trabajo SST"
        estandar="2.4.1"
        descripcion="Normativa y plantillas para la planificación anual del SG-SST según Decreto 1072/2015"
        normativaAplicable={[
          {
            codigo: 'DEC-1072-2.2.4.6.17',
            norma: 'Decreto 1072/2015',
            articulo: 'Art. 2.2.4.6.17',
            descripcion: 'Planificación del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST',
            requisitos: [
              'Definir metas, responsabilidades, recursos y cronograma',
              'Debe ser firmado por el empleador y el responsable del SG-SST',
              'Debe ser coherente con la evaluación inicial y objetivos del sistema',
              'Identificar prioridades en materia de seguridad y salud en el trabajo',
              'Alcanzable según el tamaño y naturaleza de la empresa'
            ],
            obligatorio: true
          },
          {
            codigo: 'RES-0312-2019-2.4.1',
            norma: 'Resolución 0312/2019',
            articulo: 'Estándar 2.4.1',
            descripcion: 'Estándares Mínimos - Plan de trabajo anual del SG-SST',
            requisitos: [
              'El plan de trabajo anual debe abarcar todas las actividades del SG-SST',
              'Debe incluir actividades de capacitación, inspecciones, exámenes médicos',
              'Incluir cronograma con fechas de ejecución y responsables',
              'Presupuesto asignado para las actividades del plan'
            ],
            obligatorio: true
          }
        ]}
        compact={true}
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por año, responsable o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando planes de trabajo...</p>
        </div>
      ) : filteredPlanes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchTerm ? "No se encontraron planes que coincidan con tu búsqueda" : "No hay planes de trabajo creados"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                onClick={() => setDialogOpen(true)}
                data-testid="button-create-first-plan"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer plan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlanes.map((plan) => (
            <Card
              key={plan.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setLocation(`/planes-trabajo-anual/${plan.id}`)}
              data-testid={`card-plan-${plan.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-xl flex-1">
                    Plan de Trabajo {plan.anio}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getEstadoBadge(plan.estado)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-menu-${plan.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEditClick(e, plan.id)} data-testid={`button-edit-${plan.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteClick(e, plan)}
                          className="text-red-600 focus:text-red-600"
                          data-testid={`button-delete-${plan.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {plan.objetivoGeneral || "Sin objetivo definido"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso:</span>
                  {getCumplimientoBadge(plan.porcentajeCumplimiento)}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Actividades:</span>
                  <span className="font-medium">
                    {plan.actividadesCompletadas} / {plan.totalActividades}
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Elaborado por: {plan.responsableElaboracion}
                  </p>
                  {plan.aprobadoPor && (
                    <p className="text-xs text-muted-foreground">
                      Aprobado por: {plan.aprobadoPor}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plan de trabajo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el plan de trabajo 
              {planToDelete && ` del año ${planToDelete.anio}`} junto con todas sus actividades asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => planToDelete && deleteMutation.mutate(planToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
