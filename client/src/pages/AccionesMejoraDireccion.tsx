import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Search, ClipboardCheck, Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, TrendingUp, Target, Users, FileText, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AccionMejoraDireccion {
  id: string;
  decisionId: string;
  companyId: string;
  descripcion: string;
  responsable: string | null;
  responsableNombre: string;
  fechaCompromiso: string;
  fechaImplementacion: string | null;
  prioridad: string;
  estado: string;
  avanceDescripcion: string | null;
  porcentajeAvance: number;
  evidenciaUrl: string | null;
  verificadoPor: string | null;
  fechaVerificacion: string | null;
  eficaz: number | null;
  observacionesVerificacion: string | null;
  createdAt: string;
  updatedAt: string;
  decisionDescripcion: string | null;
  decisionTipo: string | null;
  revisionCodigo: string | null;
  revisionTitulo: string | null;
  revisionFecha: string | null;
}

interface DecisionRevision {
  id: string;
  revisionId: string;
  tipo: string;
  descripcion: string;
  revisionCodigo: string;
  revisionTitulo: string;
  revisionFecha: string;
}

interface Usuario {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
}

const prioridades = [
  { value: "baja", label: "Baja", color: "bg-gray-500" },
  { value: "media", label: "Media", color: "bg-yellow-500" },
  { value: "alta", label: "Alta", color: "bg-orange-500" },
  { value: "critica", label: "Crítica", color: "bg-red-500" },
];

const estados = [
  { value: "pendiente", label: "Pendiente", color: "bg-gray-500" },
  { value: "en-proceso", label: "En Proceso", color: "bg-blue-500" },
  { value: "completada", label: "Completada", color: "bg-green-500" },
  { value: "vencida", label: "Vencida", color: "bg-red-500" },
];

const formSchema = z.object({
  decisionId: z.string().min(1, "Debe seleccionar una decisión de revisión"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  responsableNombre: z.string().min(2, "El nombre del responsable es requerido"),
  responsable: z.string().optional().nullable(),
  fechaCompromiso: z.date({ required_error: "La fecha de compromiso es requerida" }),
  prioridad: z.enum(["baja", "media", "alta", "critica"]).default("media"),
  estado: z.enum(["pendiente", "en-proceso", "completada", "vencida"]).default("pendiente"),
  porcentajeAvance: z.number().min(0).max(100).default(0),
  avanceDescripcion: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccionesMejoraDireccion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterPrioridad, setFilterPrioridad] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const fromEvaluation = searchParams.get("from") === "evaluation";
  const evaluationId = searchParams.get("evaluationId");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decisionId: "",
      descripcion: "",
      responsableNombre: "",
      responsable: null,
      fechaCompromiso: new Date(),
      prioridad: "media",
      estado: "pendiente",
      porcentajeAvance: 0,
      avanceDescripcion: "",
    },
  });

  const { data: acciones = [], isLoading } = useQuery<AccionMejoraDireccion[]>({
    queryKey: ["/api/acciones-mejora-direccion"],
  });

  const { data: decisiones = [] } = useQuery<DecisionRevision[]>({
    queryKey: ["/api/decisiones-revision"],
  });

  const { data: usuarios = [] } = useQuery<Usuario[]>({
    queryKey: ["/api/usuarios-responsables"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        fechaCompromiso: data.fechaCompromiso.toISOString().split('T')[0],
      };
      return apiRequest("POST", "/api/acciones-mejora-direccion", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-mejora-direccion"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Acción creada",
        description: "La acción de mejora se ha registrado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la acción de mejora",
        variant: "destructive",
      });
    },
  });

  const filteredAcciones = useMemo(() => {
    return acciones.filter((accion) => {
      const matchesSearch = 
        accion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accion.responsableNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accion.revisionCodigo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "todos" || accion.estado === filterEstado;
      const matchesPrioridad = filterPrioridad === "todos" || accion.prioridad === filterPrioridad;
      return matchesSearch && matchesEstado && matchesPrioridad;
    });
  }, [acciones, searchTerm, filterEstado, filterPrioridad]);

  const estadisticas = useMemo(() => {
    const total = acciones.length;
    const pendientes = acciones.filter(a => a.estado === "pendiente").length;
    const enProceso = acciones.filter(a => a.estado === "en-proceso").length;
    const completadas = acciones.filter(a => a.estado === "completada").length;
    const vencidas = acciones.filter(a => {
      if (a.estado === "completada") return false;
      const fechaCompromiso = new Date(a.fechaCompromiso);
      return fechaCompromiso < new Date();
    }).length;
    const tasaCumplimiento = total > 0 ? Math.round((completadas / total) * 100) : 0;
    
    return { total, pendientes, enProceso, completadas, vencidas, tasaCumplimiento };
  }, [acciones]);

  function onSubmit(data: FormValues) {
    createMutation.mutate(data);
  }

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = estados.find(e => e.value === estado);
    return (
      <Badge className={cn("text-white", estadoInfo?.color || "bg-gray-500")}>
        {estadoInfo?.label || estado}
      </Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const prioridadInfo = prioridades.find(p => p.value === prioridad);
    return (
      <Badge variant="outline" className={cn("border-2", 
        prioridad === "critica" && "border-red-500 text-red-500",
        prioridad === "alta" && "border-orange-500 text-orange-500",
        prioridad === "media" && "border-yellow-500 text-yellow-600",
        prioridad === "baja" && "border-gray-400 text-gray-500"
      )}>
        {prioridadInfo?.label || prioridad}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {fromEvaluation && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation(evaluationId ? `/evaluacion-sst/${evaluationId}` : "/evaluaciones-sst")}
            data-testid="button-back-evaluation"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Evaluación
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Acciones de Mejora - Revisión por Dirección
          </h1>
          <p className="text-muted-foreground mt-1">
            Estándar 7.1.2 - Decreto 1072/2015 Art. 2.2.4.6.31 | ISO 45001:2018 Numeral 10.3
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-nueva-accion">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Acción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Acción de Mejora</DialogTitle>
              <DialogDescription>
                Registre una acción de mejora derivada de la revisión por la Alta Dirección
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="decisionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decisión de Revisión *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-decision">
                            <SelectValue placeholder="Seleccionar decisión de revisión..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {decisiones.map(decision => (
                            <SelectItem key={decision.id} value={decision.id}>
                              [{decision.revisionCodigo}] {decision.descripcion?.substring(0, 50)}...
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
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la Acción *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa la acción de mejora a implementar..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-descripcion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="responsableNombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nombre del responsable"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-responsable"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario del Sistema (opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-usuario">
                              <SelectValue placeholder="Vincular a usuario..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usuarios.map(usuario => (
                              <SelectItem key={usuario.id} value={usuario.id}>
                                {usuario.fullName || usuario.username}
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
                    name="prioridad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-prioridad">
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {prioridades.map(p => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
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
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-estado">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estados.map(e => (
                              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
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
                    name="fechaCompromiso"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Compromiso *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                                data-testid="button-fecha-compromiso"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span className="text-muted-foreground">Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="porcentajeAvance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentaje de Avance</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            {...field}
                            value={field.value || 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-porcentaje"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="avanceDescripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Avance</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa el avance de la acción..."
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-avance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-guardar">
                    {createMutation.isPending ? "Guardando..." : "Guardar Acción"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-gray-600">{estadisticas.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.enProceso}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.completadas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cumplimiento</p>
                <p className="text-2xl font-bold text-primary">{estadisticas.tasaCumplimiento}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones de Mejora Derivadas de Revisión por Dirección</CardTitle>
          <CardDescription>
            Seguimiento de acciones preventivas, correctivas y de mejora continua según ISO 45001:2018
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, responsable o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]" data-testid="filter-estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {estados.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger className="w-[180px]" data-testid="filter-prioridad">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las prioridades</SelectItem>
                {prioridades.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando acciones...</p>
            </div>
          ) : filteredAcciones.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {acciones.length === 0 
                  ? "No hay acciones de mejora registradas. Cree una nueva acción derivada de la revisión por dirección."
                  : "No se encontraron acciones con los filtros aplicados."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAcciones.map((accion) => (
                <Card key={accion.id} className="hover-elevate" data-testid={`card-accion-${accion.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {accion.revisionCodigo && (
                            <Badge variant="secondary" className="text-xs">
                              {accion.revisionCodigo}
                            </Badge>
                          )}
                          {getPrioridadBadge(accion.prioridad)}
                          {getEstadoBadge(accion.estado)}
                        </div>
                        <p className="font-medium mb-1">{accion.descripcion}</p>
                        {accion.decisionDescripcion && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Decisión:</span> {accion.decisionDescripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {accion.responsableNombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            Compromiso: {format(new Date(accion.fechaCompromiso), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Avance: {accion.porcentajeAvance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
