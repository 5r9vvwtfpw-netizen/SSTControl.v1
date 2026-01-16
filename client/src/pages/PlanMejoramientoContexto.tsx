import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus, Search, FileText, Edit2, Trash2, AlertCircle, Clock,
  CheckCircle2, Target, TrendingUp, Filter, Download, CalendarIcon, ArrowLeft
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccionMejoraContexto, insertAccionMejoraContextoSchema, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const estadosAccion = [
  { value: "pendiente", label: "Pendiente", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  { value: "en_progreso", label: "En Progreso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "completada", label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const prioridadesAccion = [
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "baja", label: "Baja", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const tiposFoda = [
  { value: "fortaleza", label: "Fortaleza", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "debilidad", label: "Debilidad", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "oportunidad", label: "Oportunidad", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "amenaza", label: "Amenaza", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
];

const accionFormSchema = insertAccionMejoraContextoSchema.extend({
  accion: z.string().min(1, "La acción es requerida"),
  descripcion: z.string().optional(),
  tipoFoda: z.enum(["fortaleza", "debilidad", "oportunidad", "amenaza"]),
  responsableId: z.string().optional().nullable(),
  fechaLimite: z.coerce.date().optional().nullable(),
  fechaCierre: z.coerce.date().optional().nullable(),
  prioridad: z.enum(["alta", "media", "baja"]),
  estado: z.enum(["pendiente", "en_progreso", "completada"]),
  porcentajeAvance: z.number().min(0).max(100).optional(),
});

type AccionFormData = z.infer<typeof accionFormSchema>;

interface PlanConsolidadoResponse {
  accionesContexto: AccionMejoraContexto[];
  totalAccionesContexto: number;
  estadisticas: {
    pendientes: number;
    enProgreso: number;
    completadas: number;
  };
}

export default function PlanMejoramientoContexto() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterPrioridad, setFilterPrioridad] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccion, setEditingAccion] = useState<AccionMejoraContexto | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const form = useForm<AccionFormData>({
    resolver: zodResolver(accionFormSchema),
    defaultValues: {
      accion: "",
      descripcion: "",
      tipoFoda: "debilidad",
      responsableId: null,
      fechaLimite: null,
      fechaCierre: null,
      prioridad: "media",
      estado: "pendiente",
      porcentajeAvance: 0,
      origenHallazgo: "analisis_contexto",
      hallazgoDescripcion: "",
    },
  });

  const { data: planConsolidado, isLoading: isLoadingPlan } = useQuery<PlanConsolidadoResponse>({
    queryKey: ["/api/plan-mejoramiento-consolidado"],
  });

  const { data: acciones = [], isLoading: isLoadingAcciones } = useQuery<AccionMejoraContexto[]>({
    queryKey: ["/api/acciones-mejora-contexto"],
  });

  const { data: usuarios = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AccionFormData) => {
      return apiRequest("POST", "/api/acciones-mejora-contexto", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-mejora-contexto"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plan-mejoramiento-consolidado"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Acción creada", description: "La acción de mejora se ha creado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear la acción.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccionFormData> }) => {
      return apiRequest("PATCH", `/api/acciones-mejora-contexto/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-mejora-contexto"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plan-mejoramiento-consolidado"] });
      setDialogOpen(false);
      setEditingAccion(null);
      form.reset();
      toast({ title: "Acción actualizada", description: "La acción de mejora se ha actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar la acción.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/acciones-mejora-contexto/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-mejora-contexto"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plan-mejoramiento-consolidado"] });
      setDeleteConfirmId(null);
      toast({ title: "Acción eliminada", description: "La acción de mejora se ha eliminado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la acción.", variant: "destructive" });
    },
  });

  const filteredAcciones = useMemo(() => {
    return acciones.filter(accion => {
      const matchesSearch = accion.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (accion.descripcion && accion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesEstado = filterEstado === "todos" || accion.estado === filterEstado;
      const matchesPrioridad = filterPrioridad === "todas" || accion.prioridad === filterPrioridad;
      return matchesSearch && matchesEstado && matchesPrioridad;
    });
  }, [acciones, searchTerm, filterEstado, filterPrioridad]);

  const handleOpenDialog = (accion?: AccionMejoraContexto) => {
    if (accion) {
      setEditingAccion(accion);
      form.reset({
        accion: accion.accion,
        descripcion: accion.descripcion || "",
        tipoFoda: accion.tipoFoda as "fortaleza" | "debilidad" | "oportunidad" | "amenaza" || "debilidad",
        responsableId: accion.responsableId || null,
        fechaLimite: accion.fechaLimite ? new Date(accion.fechaLimite) : null,
        fechaCierre: accion.fechaCierre ? new Date(accion.fechaCierre) : null,
        prioridad: accion.prioridad as "alta" | "media" | "baja",
        estado: accion.estado as "pendiente" | "en_progreso" | "completada",
        porcentajeAvance: accion.porcentajeAvance || 0,
        origenHallazgo: accion.origenHallazgo || "analisis_contexto",
        hallazgoDescripcion: accion.hallazgoDescripcion || "",
      });
    } else {
      setEditingAccion(null);
      form.reset({
        accion: "",
        descripcion: "",
        tipoFoda: "debilidad",
        responsableId: null,
        fechaLimite: null,
        fechaCierre: null,
        prioridad: "media",
        estado: "pendiente",
        porcentajeAvance: 0,
        origenHallazgo: "analisis_contexto",
        hallazgoDescripcion: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: AccionFormData) => {
    if (editingAccion) {
      updateMutation.mutate({ id: editingAccion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getResponsableName = (responsableId: string | null) => {
    if (!responsableId) return "-";
    const usuario = usuarios.find(u => u.id === responsableId);
    return usuario?.fullName || usuario?.username || "-";
  };

  const estadisticas = planConsolidado?.estadisticas || { pendientes: 0, enProgreso: 0, completadas: 0 };
  const totalAcciones = acciones.length;

  const handleExportPdf = () => {
    toast({
      title: "Exportar PDF",
      description: "Esta funcionalidad estará disponible próximamente.",
    });
  };

  const searchString = useSearch();
  const fromEvaluation = searchString.includes("from=evaluation");

  return (
    <div className="p-6 space-y-6">
      {fromEvaluation && (
        <Link href="/evaluaciones-sst" data-testid="link-back-evaluation">
          <Button variant="ghost" size="sm" className="gap-2 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Evaluación SST
          </Button>
        </Link>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Target className="h-6 w-6 text-primary" />
            Plan de Mejoramiento - Análisis de Contexto
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de acciones de mejora derivadas del análisis FODA
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportPdf} data-testid="button-export-pdf">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => handleOpenDialog()} data-testid="button-new-action">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Acción
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total">{totalAcciones}</div>
            <p className="text-xs text-muted-foreground">Acciones registradas</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-pending">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="text-stat-pending">{estadisticas.pendientes}</div>
            <p className="text-xs text-muted-foreground">Por iniciar</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-progress">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-stat-progress">{estadisticas.enProgreso}</div>
            <p className="text-xs text-muted-foreground">En ejecución</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-completed">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-stat-completed">{estadisticas.completadas}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Acciones de Mejora
            </CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar acciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full md:w-64"
                  data-testid="input-search"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-estado">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-prioridad">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAcciones ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAcciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No hay acciones de mejora</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterEstado !== "todos" || filterPrioridad !== "todas"
                  ? "No se encontraron acciones con los filtros aplicados."
                  : "Comienza agregando una nueva acción de mejora."}
              </p>
              {!searchTerm && filterEstado === "todos" && filterPrioridad === "todas" && (
                <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-action">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Acción
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acción</TableHead>
                    <TableHead>Origen (FODA)</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAcciones.map((accion) => (
                    <TableRow key={accion.id} data-testid={`row-action-${accion.id}`}>
                      <TableCell className="font-medium max-w-[250px]">
                        <div className="truncate" title={accion.accion}>
                          {accion.accion}
                        </div>
                        {accion.descripcion && (
                          <div className="text-xs text-muted-foreground truncate" title={accion.descripcion}>
                            {accion.descripcion}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {accion.tipoFoda ? (
                          <Badge className={tiposFoda.find(t => t.value === accion.tipoFoda)?.color || ""}>
                            {tiposFoda.find(t => t.value === accion.tipoFoda)?.label || accion.tipoFoda}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={prioridadesAccion.find(p => p.value === accion.prioridad)?.color || ""}>
                          {prioridadesAccion.find(p => p.value === accion.prioridad)?.label || accion.prioridad}
                        </Badge>
                      </TableCell>
                      <TableCell>{getResponsableName(accion.responsableId)}</TableCell>
                      <TableCell>
                        {accion.fechaLimite
                          ? format(new Date(accion.fechaLimite), "dd/MM/yyyy", { locale: es })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={estadosAccion.find(e => e.value === accion.estado)?.color || ""}>
                          {estadosAccion.find(e => e.value === accion.estado)?.label || accion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={accion.porcentajeAvance || 0} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">{accion.porcentajeAvance || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog(accion)}
                            data-testid={`button-edit-${accion.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(accion.id)}
                            data-testid={`button-delete-${accion.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccion ? "Editar Acción de Mejora" : "Nueva Acción de Mejora"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acción *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Describa la acción de mejora" 
                        {...field} 
                        data-testid="input-accion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada de la acción"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-descripcion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoFoda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo FODA</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-foda">
                            <SelectValue placeholder="Seleccione el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposFoda.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
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
                  name="prioridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-prioridad">
                            <SelectValue placeholder="Seleccione la prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prioridadesAccion.map(prioridad => (
                            <SelectItem key={prioridad.value} value={prioridad.value}>
                              {prioridad.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val === "__unassigned__" ? null : val)} 
                        value={field.value || "__unassigned__"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-responsable">
                            <SelectValue placeholder="Seleccione responsable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__unassigned__">Sin asignar</SelectItem>
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

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue placeholder="Seleccione el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosAccion.map(estado => (
                            <SelectItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fechaLimite"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Límite</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              data-testid="button-fecha-limite"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), "dd/MM/yyyy", { locale: es })
                                : "Seleccionar fecha"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaCierre"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Cierre</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              data-testid="button-fecha-cierre"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), "dd/MM/yyyy", { locale: es })
                                : "Seleccionar fecha"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="porcentajeAvance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje de Avance: {field.value || 0}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value || 0]}
                        onValueChange={([value]) => field.onChange(value)}
                        className="py-4"
                        data-testid="slider-porcentaje"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hallazgoDescripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Hallazgo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el hallazgo que originó esta acción"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-hallazgo"
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Guardando..." : editingAccion ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ¿Está seguro que desea eliminar esta acción de mejora? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmId(null)}
              data-testid="button-cancel-delete"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
