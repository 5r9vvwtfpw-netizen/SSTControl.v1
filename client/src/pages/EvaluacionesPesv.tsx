import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, CheckCircle2, FileCheck, Trash2, Car, Users, Copy, Info, ShieldCheck, Building2, ChevronRight, ArrowLeft, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluacionPesv, insertEvaluacionPesvSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { NIVELES_PESV_LABELS } from "@/data/pasos-pesv";

const createFormSchema = (isAdmin: boolean) => {
  const baseSchema = insertEvaluacionPesvSchema.omit({ 
    puntajeTotal: true,
    puntajeMaximo: true,
    porcentajeCumplimiento: true,
    puntajePlanear: true,
    puntajeHacer: true,
    puntajeVerificar: true,
    puntajeActuar: true,
    evaluacionSstId: true,
  });
  
  if (isAdmin) {
    return baseSchema.extend({
      companyId: z.string().min(1, "Debe seleccionar una empresa"),
    });
  } else {
    return baseSchema.extend({
      companyId: z.string().optional(),
    });
  }
};

export default function EvaluacionesPesv() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluacionToDelete, setEvaluacionToDelete] = useState<EvaluacionPesv | null>(null);
  const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState("");
  const [deleteConfirmAnio, setDeleteConfirmAnio] = useState("");
  const [selectedVaultCompanyId, setSelectedVaultCompanyId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("todos");

  const isSuperAdmin = user?.role === "superadmin";
  const isLso = user?.role === "lso" || user?.role === "lso_externo";

  // Leer empresa preseleccionada desde URL (cuando LSO entra desde su portal)
  const lsoPreselectedCompanyId = useMemo(() => {
    if (!isLso) return null;
    return new URLSearchParams(window.location.search).get("empresa");
  }, [isLso]);

  useEffect(() => {
    if (isLso && lsoPreselectedCompanyId) {
      setSelectedVaultCompanyId(lsoPreselectedCompanyId);
    }
  }, [isLso, lsoPreselectedCompanyId]);

  const isAdmin = isSuperAdmin || isLso;
  const isVaultMode = isSuperAdmin || isLso;
  const formSchema = createFormSchema(isAdmin);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anio: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      nivel: "basico",
      responsableNombre: user?.fullName || user?.username || "",
      responsableCargo: "Responsable PESV",
      numeroVehiculos: 0,
      numeroConductores: 0,
      observaciones: "",
      estado: "en-progreso",
    },
  });

  const evaluacionesPesvQueryUrl = isLso && lsoPreselectedCompanyId
    ? `/api/evaluaciones-pesv?companyId=${lsoPreselectedCompanyId}`
    : "/api/evaluaciones-pesv";

  const evaluacionesPesvQueryKey = isLso && lsoPreselectedCompanyId
    ? ["/api/evaluaciones-pesv", lsoPreselectedCompanyId]
    : ["/api/evaluaciones-pesv"];

  const { data: evaluaciones = [], isLoading } = useQuery<EvaluacionPesv[]>({
    queryKey: evaluacionesPesvQueryKey,
    queryFn: () => fetch(evaluacionesPesvQueryUrl, { credentials: "include" }).then(r => {
      if (!r.ok) throw new Error("Error cargando evaluaciones PESV");
      return r.json();
    }),
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
    enabled: !!user,
  });

  const { data: currentCompany } = useQuery<any>({
    queryKey: ["/api/company/current"],
    enabled: !!user && !isSuperAdmin,
  });

  const calcularNivelPesv = (numVehiculos: number): "basico" | "estandar" | "avanzado" => {
    if (numVehiculos > 50) return "avanzado";
    if (numVehiculos >= 11) return "estandar";
    return "basico";
  };

  useEffect(() => {
    if (!isSuperAdmin && !isLso && user?.companyId && dialogOpen) {
      form.setValue("companyId", user.companyId);
      if (currentCompany?.numberOfVehicles != null) {
        const vehiculos = currentCompany.numberOfVehicles;
        const nivel = calcularNivelPesv(vehiculos);
        form.setValue("numeroVehiculos", vehiculos);
        form.setValue("numeroConductores", vehiculos);
        form.setValue("nivel", nivel);
      }
    }
    // Para LSO, usar la empresa del vault preseleccionada
    if (isLso && selectedVaultCompanyId && dialogOpen) {
      form.setValue("companyId", selectedVaultCompanyId);
      const company = companies.find((c: any) => c.id === selectedVaultCompanyId);
      if (company?.numberOfVehicles != null) {
        const vehiculos = company.numberOfVehicles;
        const nivel = calcularNivelPesv(vehiculos);
        form.setValue("numeroVehiculos", vehiculos);
        form.setValue("numeroConductores", vehiculos);
        form.setValue("nivel", nivel);
      }
    }
  }, [isSuperAdmin, isLso, user?.companyId, selectedVaultCompanyId, dialogOpen, form, currentCompany, companies]);

  useEffect(() => {
    if (isSuperAdmin && dialogOpen) {
      const selectedCompanyId = form.getValues("companyId");
      if (selectedCompanyId) {
        const selectedCompany = companies.find((c: any) => c.id === selectedCompanyId);
        if (selectedCompany?.numberOfVehicles != null) {
          const vehiculos = selectedCompany.numberOfVehicles;
          const nivel = calcularNivelPesv(vehiculos);
          form.setValue("numeroVehiculos", vehiculos);
          form.setValue("numeroConductores", vehiculos);
          form.setValue("nivel", nivel);
        }
      }
    }
  }, [isSuperAdmin, dialogOpen, form, companies, form.watch?.("companyId")]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const canSelectCompany = user?.role === 'superadmin' || user?.role === 'lso';
      const payload = canSelectCompany && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/evaluaciones-pesv", payload);
      return res.json();
    },
    onSuccess: (newEvaluacion) => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Evaluación PESV creada",
        description: "La evaluación del Plan Estratégico de Seguridad Vial se ha creado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      setLocation(`/pesv/evaluacion/${newEvaluacion.id}`);
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
    mutationFn: async (evaluacionId: string) => {
      const res = await apiRequest("DELETE", `/api/evaluaciones-pesv/${evaluacionId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv"] });
      setDeleteDialogOpen(false);
      setEvaluacionToDelete(null);
      setDeleteConfirmPhrase("");
      setDeleteConfirmAnio("");
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación PESV se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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


  const heredarMutation = useMutation({
    mutationFn: async (evaluacionId: string) => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/heredar`, {
        heredarRespuestas: true
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv"] });
      toast({
        title: "Evaluación creada",
        description: data.mensaje || `Nueva evaluación creada exitosamente`,
        className: "bg-green-50 border-green-200",
      });
      setLocation(`/pesv/evaluacion/${data.evaluacion.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear evaluación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleHeredarClick = (e: React.MouseEvent, evaluacion: EvaluacionPesv) => {
    e.stopPropagation();
    if (confirm(`¿Crear nueva evaluación ${evaluacion.anio + 1} basada en ${evaluacion.anio}?`)) {
      heredarMutation.mutate(evaluacion.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, evaluacion: EvaluacionPesv) => {
    e.stopPropagation();
    setEvaluacionToDelete(evaluacion);
    setDeleteConfirmPhrase("");
    setDeleteConfirmAnio("");
    setDeleteDialogOpen(true);
  };

  const canConfirmDelete =
    deleteConfirmPhrase === "ELIMINAR-EVALUACION-PESV" &&
    deleteConfirmAnio === String(evaluacionToDelete?.anio ?? "");

  const confirmDelete = () => {
    if (evaluacionToDelete && canConfirmDelete) {
      deleteMutation.mutate(evaluacionToDelete.id);
    }
  };

  const filteredEvaluaciones = evaluaciones.filter((evaluacion) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      evaluacion.anio.toString().includes(searchLower) ||
      evaluacion.responsableNombre.toLowerCase().includes(searchLower) ||
      (evaluacion.observaciones?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Vault pattern: agrupar evaluaciones por empresa (solo superadmin)
  const companyMap = useMemo(() => {
    const map: Record<string, { id: string; name: string }> = {};
    for (const c of companies) {
      map[c.id] = { id: c.id, name: c.name || c.id };
    }
    return map;
  }, [companies]);

  const companyVaults = useMemo(() => {
    if (!isSuperAdmin && !isLso) return [];
    const grouped: Record<string, {
      companyId: string;
      companyName: string;
      evaluaciones: EvaluacionPesv[];
      latestScore: number;
      latestNivel: string;
      years: number[];
    }> = {};
    for (const ev of evaluaciones) {
      const cId = ev.companyId;
      if (!grouped[cId]) {
        grouped[cId] = {
          companyId: cId,
          companyName: companyMap[cId]?.name || cId,
          evaluaciones: [],
          latestScore: 0,
          latestNivel: "basico",
          years: [],
        };
      }
      grouped[cId].evaluaciones.push(ev);
      if (!grouped[cId].years.includes(ev.anio)) {
        grouped[cId].years.push(ev.anio);
      }
    }
    for (const key of Object.keys(grouped)) {
      const evs = grouped[key].evaluaciones;
      evs.sort((a, b) => b.anio - a.anio || b.mes - a.mes);
      grouped[key].latestScore = evs[0]?.porcentajeCumplimiento ?? 0;
      grouped[key].latestNivel = evs[0]?.nivel || "basico";
      grouped[key].years.sort((a, b) => b - a);
    }
    return Object.values(grouped);
  }, [evaluaciones, companyMap, isSuperAdmin, isLso]);

  const filteredVaults = useMemo(() => {
    if (!searchTerm) return companyVaults;
    const lower = searchTerm.toLowerCase();
    return companyVaults.filter(v =>
      v.companyName.toLowerCase().includes(lower) ||
      v.evaluaciones.some(e => e.responsableNombre.toLowerCase().includes(lower))
    );
  }, [companyVaults, searchTerm]);

  const selectedVault = useMemo(() => {
    if (!selectedVaultCompanyId) return null;
    const found = companyVaults.find(v => v.companyId === selectedVaultCompanyId);
    if (found) return found;
    const name = companyMap[selectedVaultCompanyId]?.name || selectedVaultCompanyId;
    return { companyId: selectedVaultCompanyId, companyName: name, evaluaciones: [], latestScore: 0, latestNivel: "basico", years: [] };
  }, [companyVaults, selectedVaultCompanyId, companyMap]);

  const vaultEvaluaciones = useMemo(() => {
    if (!selectedVault) return [];
    let evs = selectedVault.evaluaciones;
    if (yearFilter !== "todos") {
      evs = evs.filter(e => e.anio === parseInt(yearFilter));
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      evs = evs.filter(e =>
        e.anio.toString().includes(lower) ||
        e.responsableNombre.toLowerCase().includes(lower) ||
        (e.observaciones?.toLowerCase().includes(lower) ?? false)
      );
    }
    return evs;
  }, [selectedVault, yearFilter, searchTerm]);

  const getEstadoBadge = (estado: string) => {
    const config = {
      "en-progreso": { label: "En Proceso", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: FileText },
      "finalizada": { label: "Finalizada", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "aprobada": { label: "Aprobada", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: FileCheck },
      "rechazada": { label: "Rechazada", className: "bg-red-500/10 text-red-700 dark:text-red-400", icon: FileText },
    };
    const item = config[estado as keyof typeof config] || config["en-progreso"];
    const Icon = item.icon;
    return (
      <Badge className={item.className} data-testid={`badge-estado-${estado}`}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  const getNivelBadge = (nivel: string) => {
    const config = {
      "basico": { label: "Básico", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      "estandar": { label: "Estándar", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      "avanzado": { label: "Avanzado", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    };
    const item = config[nivel as keyof typeof config] || config["basico"];
    return (
      <Badge className={item.className} data-testid={`badge-nivel-${nivel}`}>
        {item.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Evaluaciones PESV</h1>
          <p className="text-muted-foreground">Plan Estratégico de Seguridad Vial - Resolución 40595 de 2022</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-evaluation">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>Nueva Evaluación PESV</DialogTitle>
              <DialogDescription>
                Cree una nueva evaluación del Plan Estratégico de Seguridad Vial según Resolución 40595/2022
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-x-auto">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="anio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
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
                    name="mes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mes</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-mes">
                              <SelectValue placeholder="Seleccionar mes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {new Date(2024, month - 1).toLocaleDateString('es-CO', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isSuperAdmin && (
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
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Seleccione la empresa para la cual se creará la evaluación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Panel informativo: nivel y flota desde la suscripción */}
                <FormField
                  control={form.control}
                  name="nivel"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numeroVehiculos"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="rounded-md border bg-muted/40 p-4 space-y-3" data-testid="panel-nivel-suscripcion">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Configuración determinada por su suscripción</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Nivel PESV:</span>
                      <Badge
                        data-testid="badge-nivel-pesv-display"
                        className={
                          form.watch("nivel") === "avanzado"
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                            : form.watch("nivel") === "estandar"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        }
                      >
                        {NIVELES_PESV_LABELS[form.watch("nivel") as keyof typeof NIVELES_PESV_LABELS] || "Básico"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Vehículos:</span>
                      <span className="text-sm font-semibold" data-testid="text-vehiculos-display">
                        {form.watch("numeroVehiculos") ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Conductores:</span>
                      <span className="text-sm font-semibold" data-testid="text-conductores-display">
                        {form.watch("numeroConductores") ?? 0}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Determinado automáticamente según su flota activa (Res. 40595/2022).
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="numeroConductores"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsableNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable de la Evaluación</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-responsable" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsableCargo"
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

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-observaciones" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-submit-evaluation"
                  >
                    {createMutation.isPending ? "Creando..." : "Crear Evaluación"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={isVaultMode && !selectedVaultCompanyId ? "Buscar empresa..." : "Buscar por año, responsable..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        {isVaultMode && selectedVaultCompanyId && selectedVault && (
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-year-filter">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los años</SelectItem>
              {selectedVault.years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent><div className="h-4 w-full bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : isSuperAdmin && !selectedVaultCompanyId && !lsoPreselectedCompanyId ? (
        <>
          {filteredVaults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No hay evaluaciones PESV registradas</p>
                <p className="text-muted-foreground text-center mb-4">
                  Aún no hay empresas con evaluaciones del Plan Estratégico de Seguridad Vial
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground" data-testid="text-vault-count">
                  {filteredVaults.length} empresa{filteredVaults.length !== 1 ? 's' : ''} con evaluaciones PESV
                </p>
                <Badge className="bg-muted text-muted-foreground" data-testid="badge-total-evaluations">
                  {evaluaciones.length} evaluaciones en total
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVaults.map((vault) => {
                  const scoreColor = vault.latestScore >= 80 ? "text-green-600" : vault.latestScore >= 50 ? "text-yellow-600" : "text-red-600";
                  const scoreBg = vault.latestScore >= 80 ? "bg-green-50 dark:bg-green-950/30" : vault.latestScore >= 50 ? "bg-yellow-50 dark:bg-yellow-950/30" : "bg-red-50 dark:bg-red-950/30";
                  return (
                    <Card
                      key={vault.companyId}
                      className="hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => { setSelectedVaultCompanyId(vault.companyId); setSearchTerm(""); setYearFilter("todos"); localStorage.setItem('superadmin_vault_company', vault.companyId); }}
                      data-testid={`card-vault-${vault.companyId}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-10 w-10 rounded-xl ${scoreBg} flex items-center justify-center shrink-0`}>
                              <Building2 className={`h-5 w-5 ${scoreColor}`} />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base truncate" data-testid={`text-vault-name-${vault.companyId}`}>
                                {vault.companyName}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {vault.evaluaciones.length} evaluaci{vault.evaluaciones.length !== 1 ? 'ones' : 'ón'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Último cumplimiento</p>
                            <p className={`text-lg font-bold ${scoreColor}`} data-testid={`text-vault-score-${vault.companyId}`}>{vault.latestScore}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Años</p>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {vault.years.slice(0, 3).map(y => (
                                <Badge key={y} variant="outline" className="text-xs">{y}</Badge>
                              ))}
                              {vault.years.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{vault.years.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          {getNivelBadge(vault.latestNivel)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : isVaultMode && selectedVaultCompanyId && selectedVault ? (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isLso && lsoPreselectedCompanyId) {
                  setLocation("/portal-licenciado");
                } else {
                  setSelectedVaultCompanyId(null);
                  setSearchTerm("");
                  setYearFilter("todos");
                }
              }}
              data-testid="button-back-to-vaults"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isLso && lsoPreselectedCompanyId ? "Volver al Portal" : "Volver"}
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold" data-testid="text-vault-company-name">{selectedVault.companyName}</h2>
            </div>
            <Badge variant="outline" data-testid="badge-vault-evaluation-count">
              {selectedVault.evaluaciones.length} evaluaci{selectedVault.evaluaciones.length !== 1 ? 'ones' : 'ón'}
            </Badge>
          </div>

          {vaultEvaluaciones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No hay evaluaciones para este filtro</p>
                <p className="text-muted-foreground text-center">Ajuste el filtro de año para ver más evaluaciones</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vaultEvaluaciones.map((evaluacion) => (
                <Card
                  key={evaluacion.id}
                  className="hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setLocation(`/pesv/evaluacion/${evaluacion.id}`)}
                  data-testid={`card-evaluacion-${evaluacion.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">Evaluación PESV {evaluacion.anio}</CardTitle>
                        <CardDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Responsable: {evaluacion.responsableNombre}</p>
                            <p>Cargo: {evaluacion.responsableCargo}</p>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getEstadoBadge(evaluacion.estado)}
                        {getNivelBadge(evaluacion.nivel)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nivel</p>
                        <p className="font-semibold">{NIVELES_PESV_LABELS[evaluacion.nivel] || evaluacion.nivel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Puntaje</p>
                        <p className="font-semibold" data-testid={`text-puntaje-${evaluacion.id}`}>{evaluacion.puntajeTotal} / {evaluacion.puntajeMaximo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cumplimiento</p>
                        <p className="font-semibold" data-testid={`text-cumplimiento-${evaluacion.id}`}>{evaluacion.porcentajeCumplimiento}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Flota</p>
                        <p className="font-semibold" data-testid={`text-vehiculos-${evaluacion.id}`}>
                          <Car className="h-4 w-4 inline mr-1" />{evaluacion.numeroVehiculos} veh.
                          <Users className="h-4 w-4 inline ml-2 mr-1" />{evaluacion.numeroConductores} cond.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={(e) => handleHeredarClick(e, evaluacion)} disabled={heredarMutation.isPending} data-testid={`button-heredar-${evaluacion.id}`}>
                        <Copy className="h-4 w-4 mr-2" />
                        Crear {evaluacion.anio + 1}
                      </Button>
                      {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'superusuario') && (
                        <Button variant="outline" size="sm" className="text-destructive" onClick={(e) => handleDeleteClick(e, evaluacion)} data-testid={`button-delete-${evaluacion.id}`}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : filteredEvaluaciones.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay evaluaciones PESV</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No se encontraron evaluaciones que coincidan con la búsqueda" : "Comience creando una nueva evaluación del Plan Estratégico de Seguridad Vial"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-evaluation">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Evaluación
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvaluaciones.map((evaluacion) => (
            <Card key={evaluacion.id} className="hover-elevate active-elevate-2 cursor-pointer" onClick={() => setLocation(`/pesv/evaluacion/${evaluacion.id}`)} data-testid={`card-evaluacion-${evaluacion.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Evaluación PESV {evaluacion.anio}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Responsable: {evaluacion.responsableNombre}</p>
                        <p>Cargo: {evaluacion.responsableCargo}</p>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getEstadoBadge(evaluacion.estado)}
                    {getNivelBadge(evaluacion.nivel)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nivel</p>
                    <p className="font-semibold">{NIVELES_PESV_LABELS[evaluacion.nivel] || evaluacion.nivel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Puntaje</p>
                    <p className="font-semibold" data-testid={`text-puntaje-${evaluacion.id}`}>{evaluacion.puntajeTotal} / {evaluacion.puntajeMaximo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cumplimiento</p>
                    <p className="font-semibold" data-testid={`text-cumplimiento-${evaluacion.id}`}>{evaluacion.porcentajeCumplimiento}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Flota</p>
                    <p className="font-semibold" data-testid={`text-vehiculos-${evaluacion.id}`}>
                      <Car className="h-4 w-4 inline mr-1" />{evaluacion.numeroVehiculos} veh.
                      <Users className="h-4 w-4 inline ml-2 mr-1" />{evaluacion.numeroConductores} cond.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={(e) => handleHeredarClick(e, evaluacion)} disabled={heredarMutation.isPending} data-testid={`button-heredar-${evaluacion.id}`}>
                    <Copy className="h-4 w-4 mr-2" />
                    Crear {evaluacion.anio + 1}
                  </Button>
                  {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'superusuario') && (
                    <Button variant="outline" size="sm" className="text-destructive" onClick={(e) => handleDeleteClick(e, evaluacion)} data-testid={`button-delete-${evaluacion.id}`}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) { setDeleteConfirmPhrase(""); setDeleteConfirmAnio(""); }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive flex-shrink-0" />
              <AlertDialogTitle className="text-destructive text-base">
                ¡ADVERTENCIA! Acción irreversible
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <p className="text-amber-800 dark:text-amber-300 font-medium">
                    ¡ATENCIÓN! Esta acción NO se puede deshacer. Todos los datos de la evaluación PESV {evaluacionToDelete?.anio} se perderán permanentemente.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  Para confirmar, escriba exactamente los siguientes campos:
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">
                      Escriba exactamente: <span className="font-mono">ELIMINAR-EVALUACION-PESV</span>
                    </p>
                    <Input
                      value={deleteConfirmPhrase}
                      onChange={(e) => setDeleteConfirmPhrase(e.target.value)}
                      placeholder="ELIMINAR-EVALUACION-PESV"
                      className={deleteConfirmPhrase === "ELIMINAR-EVALUACION-PESV" ? "border-green-500" : ""}
                      data-testid="input-delete-confirm-phrase"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">
                      Escriba el año de la evaluación: <span className="font-mono">{evaluacionToDelete?.anio}</span>
                    </p>
                    <Input
                      value={deleteConfirmAnio}
                      onChange={(e) => setDeleteConfirmAnio(e.target.value)}
                      placeholder={String(evaluacionToDelete?.anio ?? "")}
                      className={deleteConfirmAnio === String(evaluacionToDelete?.anio ?? "") ? "border-green-500" : ""}
                      data-testid="input-delete-confirm-anio"
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!canConfirmDelete || deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? "Eliminando..." : `Eliminar evaluación ${evaluacionToDelete?.anio}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
