import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, CheckCircle2, FileCheck, Trash2, Car, Users } from "lucide-react";
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
    puntajesPorFase: true,
    fechaAprobacion: true,
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
      nivelPesv: "basico",
      fechaEvaluacion: new Date(),
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

  useEffect(() => {
    if (!isSuperAdmin && user?.companyId && dialogOpen) {
      form.setValue("companyId", user.companyId);
    }
  }, [isSuperAdmin, user?.companyId, dialogOpen, form]);

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

                <FormField
                  control={form.control}
                  name="nivelPesv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel PESV</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-nivel-pesv">
                            <SelectValue placeholder="Seleccione nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(NIVELES_PESV_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Según cantidad de vehículos o conductores (Res. 40595/2022)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroVehiculos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Vehículos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-numero-vehiculos"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numeroConductores"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Conductores</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-numero-conductores"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvaluaciones.map((evaluacion) => (
            <Card
              key={evaluacion.id}
              className="cursor-pointer hover-elevate transition-all"
              onClick={() => setLocation(`/pesv/evaluacion/${evaluacion.id}`)}
              data-testid={`card-evaluacion-${evaluacion.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-xl">PESV {evaluacion.anio}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getNivelBadge(evaluacion.nivelPesv)}
                    {getEstadoBadge(evaluacion.estado)}
                  </div>
                </div>
                <CardDescription>
                  {evaluacion.responsableNombre} - {evaluacion.responsableCargo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cumplimiento</span>
                    <span className="font-medium" data-testid={`text-cumplimiento-${evaluacion.id}`}>
                      {evaluacion.porcentajeCumplimiento}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        evaluacion.porcentajeCumplimiento >= 85
                          ? "bg-green-500"
                          : evaluacion.porcentajeCumplimiento >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${evaluacion.porcentajeCumplimiento}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Puntaje</span>
                    <span className="font-medium" data-testid={`text-puntaje-${evaluacion.id}`}>
                      {evaluacion.puntajeTotal} / {evaluacion.puntajeMaximo}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <span data-testid={`text-vehiculos-${evaluacion.id}`}>{evaluacion.numeroVehiculos} vehículos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span data-testid={`text-conductores-${evaluacion.id}`}>{evaluacion.numeroConductores} conductores</span>
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, evaluacion)}
                        data-testid={`button-delete-${evaluacion.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  )}
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
