import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, CheckCircle2, FileCheck, Trash2, Car, Users, Copy, Info, ShieldCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
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

  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = isSuperAdmin;
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

  const { data: evaluaciones = [], isLoading } = useQuery<EvaluacionPesv[]>({
    queryKey: ["/api/evaluaciones-pesv"],
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
    if (!isSuperAdmin && user?.companyId && dialogOpen) {
      form.setValue("companyId", user.companyId);
      if (currentCompany?.numberOfVehicles != null) {
        const vehiculos = currentCompany.numberOfVehicles;
        const nivel = calcularNivelPesv(vehiculos);
        form.setValue("numeroVehiculos", vehiculos);
        form.setValue("numeroConductores", vehiculos);
        form.setValue("nivel", nivel);
      }
    }
  }, [isSuperAdmin, user?.companyId, dialogOpen, form, currentCompany]);

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
      const isSuperadmin = user?.role === 'superadmin';
      const payload = isSuperadmin && data.companyId 
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
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (evaluacionToDelete) {
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

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar evaluaciones por año, responsable..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvaluaciones.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay evaluaciones PESV</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No se encontraron evaluaciones que coincidan con la búsqueda"
                : "Comience creando una nueva evaluación del Plan Estratégico de Seguridad Vial"}
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
            <Card
              key={evaluacion.id}
              className="hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setLocation(`/pesv/evaluacion/${evaluacion.id}`)}
              data-testid={`card-evaluacion-${evaluacion.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      Evaluación PESV {evaluacion.anio}
                    </CardTitle>
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
                    <p className="font-semibold" data-testid={`text-puntaje-${evaluacion.id}`}>
                      {evaluacion.puntajeTotal} / {evaluacion.puntajeMaximo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cumplimiento</p>
                    <p className="font-semibold" data-testid={`text-cumplimiento-${evaluacion.id}`}>{evaluacion.porcentajeCumplimiento}%</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Flota</p>
                      <p className="font-semibold" data-testid={`text-vehiculos-${evaluacion.id}`}>
                        <Car className="h-4 w-4 inline mr-1" />{evaluacion.numeroVehiculos} veh.
                        <Users className="h-4 w-4 inline ml-2 mr-1" /><span data-testid={`text-conductores-${evaluacion.id}`}>{evaluacion.numeroConductores} cond.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleHeredarClick(e, evaluacion)}
                    disabled={heredarMutation.isPending}
                    data-testid={`button-heredar-${evaluacion.id}`}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Crear {evaluacion.anio + 1}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={(e) => handleDeleteClick(e, evaluacion)}
                    data-testid={`button-delete-${evaluacion.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evaluación PESV?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la evaluación PESV del año{" "}
              <strong>{evaluacionToDelete?.anio}</strong> y todos sus datos asociados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
