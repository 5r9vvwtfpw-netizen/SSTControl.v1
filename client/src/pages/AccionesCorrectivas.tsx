import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus, Search, Edit2, Trash2, AlertCircle, Clock,
  CheckCircle2, Target, CalendarIcon, ArrowLeft, ClipboardCheck,
  AlertTriangle, FileText
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@shared/schema";

interface AccionCorrectiva {
  id: number;
  codigo?: string | null;
  tipo?: string | null;
  origen?: string | null;
  hallazgo?: string | null;
  causaRaiz?: string | null;
  accion?: string | null;
  responsableId?: number | null;
  fechaLimite?: string | Date | null;
  fechaCierre?: string | Date | null;
  prioridad?: string | null;
  estado?: string | null;
  porcentajeAvance?: number | null;
  evaluacionEficacia?: string | null;
  observaciones?: string | null;
}
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const estadosAccion = [
  { value: "abierta", label: "Abierta", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  { value: "en_proceso", label: "En Proceso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "implementada", label: "Implementada", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "verificada", label: "Verificada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "cerrada", label: "Cerrada", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
];

const tiposAccion = [
  { value: "correctiva", label: "Correctiva", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "preventiva", label: "Preventiva", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "mejora", label: "De Mejora", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const origenesAccion = [
  { value: "auditoria_interna", label: "Auditoría Interna" },
  { value: "revision_direccion", label: "Revisión por la Dirección" },
  { value: "inspeccion", label: "Inspección" },
  { value: "investigacion_accidente", label: "Investigación de Accidente" },
  { value: "no_conformidad", label: "No Conformidad" },
  { value: "recomendacion_arl", label: "Recomendación ARL" },
  { value: "analisis_indicadores", label: "Análisis de Indicadores" },
  { value: "queja_trabajador", label: "Queja de Trabajador" },
  { value: "otro", label: "Otro" },
];

const prioridadesAccion = [
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "baja", label: "Baja", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const accionFormSchema = z.object({
  codigo: z.string().optional(),
  tipo: z.enum(["correctiva", "preventiva", "mejora"]),
  origen: z.string().min(1, "El origen es requerido"),
  hallazgo: z.string().min(1, "El hallazgo es requerido"),
  causaRaiz: z.string().min(1, "La causa raíz es requerida"),
  accion: z.string().min(1, "La acción es requerida"),
  responsableId: z.string().optional().nullable(),
  fechaLimite: z.coerce.date().optional().nullable(),
  fechaCierre: z.coerce.date().optional().nullable(),
  prioridad: z.enum(["alta", "media", "baja"]),
  estado: z.enum(["abierta", "en_proceso", "implementada", "verificada", "cerrada", "cancelada"]),
  porcentajeAvance: z.number().min(0).max(100).optional(),
  evaluacionEficacia: z.string().optional(),
  observaciones: z.string().optional(),
});

type AccionFormData = z.infer<typeof accionFormSchema>;

export default function AccionesCorrectivas() {
  const { toast } = useToast();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccion, setEditingAccion] = useState<AccionCorrectiva | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const form = useForm<AccionFormData>({
    resolver: zodResolver(accionFormSchema),
    defaultValues: {
      tipo: "correctiva",
      origen: "",
      hallazgo: "",
      causaRaiz: "",
      accion: "",
      responsableId: null,
      fechaLimite: null,
      fechaCierre: null,
      prioridad: "media",
      estado: "abierta",
      porcentajeAvance: 0,
      evaluacionEficacia: "",
      observaciones: "",
    },
  });

  const { data: acciones = [], isLoading } = useQuery<AccionCorrectiva[]>({
    queryKey: ["/api/acciones-correctivas"],
  });

  const { data: usuarios = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AccionFormData) => {
      // Transformar campos del formulario al formato del backend
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const payload = {
        codigo: data.codigo || `AC-${year}-${randomSuffix}`,
        tipo: data.tipo,
        origen: data.origen,
        hallazgo: data.hallazgo,
        causaRaiz: data.causaRaiz || null,
        accionPropuesta: data.accion, // El backend espera "accionPropuesta"
        responsableId: data.responsableId || null,
        fechaDeteccion: new Date().toISOString().split('T')[0], // Fecha actual
        fechaLimite: data.fechaLimite ? new Date(data.fechaLimite).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fechaCierre: data.fechaCierre ? new Date(data.fechaCierre).toISOString().split('T')[0] : null,
        prioridad: data.prioridad,
        estado: data.estado,
        porcentajeAvance: data.porcentajeAvance || 0,
        observaciones: data.observaciones || null,
      };
      return apiRequest("POST", "/api/acciones-correctivas", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-correctivas"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Acción creada", description: "La acción correctiva se ha creado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear la acción.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AccionFormData> }) => {
      return apiRequest("PATCH", `/api/acciones-correctivas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-correctivas"] });
      setDialogOpen(false);
      setEditingAccion(null);
      form.reset();
      toast({ title: "Acción actualizada", description: "La acción correctiva se ha actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar la acción.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/acciones-correctivas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-correctivas"] });
      setDeleteConfirmId(null);
      toast({ title: "Acción eliminada", description: "La acción correctiva se ha eliminado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la acción.", variant: "destructive" });
    },
  });

  const filteredAcciones = useMemo(() => {
    return acciones.filter(accion => {
      const matchesSearch = 
        accion.accion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accion.hallazgo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accion.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "todos" || accion.estado === filterEstado;
      const matchesTipo = filterTipo === "todos" || accion.tipo === filterTipo;
      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [acciones, searchTerm, filterEstado, filterTipo]);

  const estadisticas = useMemo(() => {
    const total = acciones.length;
    const pendientes = acciones.filter(a => a.estado === "pendiente").length;
    const enProgreso = acciones.filter(a => a.estado === "en_progreso").length;
    const completadas = acciones.filter(a => a.estado === "completada" || a.estado === "cerrada").length;
    const vencidas = acciones.filter(a => {
      if (!a.fechaLimite || a.estado === "completada" || a.estado === "cerrada") return false;
      return new Date(a.fechaLimite) < new Date();
    }).length;
    return { total, pendientes, enProgreso, completadas, vencidas };
  }, [acciones]);

  const handleOpenDialog = (accion?: AccionCorrectiva) => {
    if (accion) {
      setEditingAccion(accion);
      form.reset({
        codigo: accion.codigo || "",
        tipo: (accion.tipo as "correctiva" | "preventiva" | "mejora") || "correctiva",
        origen: accion.origen || "",
        hallazgo: accion.hallazgo || "",
        causaRaiz: accion.causaRaiz || "",
        accion: accion.accion || "",
        responsableId: accion.responsableId?.toString() || null,
        fechaLimite: accion.fechaLimite ? new Date(accion.fechaLimite) : null,
        fechaCierre: accion.fechaCierre ? new Date(accion.fechaCierre) : null,
        prioridad: (accion.prioridad as "alta" | "media" | "baja") || "media",
        estado: (accion.estado as "abierta" | "en_proceso" | "implementada" | "verificada" | "cerrada" | "cancelada") || "abierta",
        porcentajeAvance: accion.porcentajeAvance || 0,
        evaluacionEficacia: accion.evaluacionEficacia || "",
        observaciones: accion.observaciones || "",
      });
    } else {
      setEditingAccion(null);
      form.reset({
        tipo: "correctiva",
        origen: "",
        hallazgo: "",
        causaRaiz: "",
        accion: "",
        responsableId: null,
        fechaLimite: null,
        fechaCierre: null,
        prioridad: "media",
        estado: "abierta",
        porcentajeAvance: 0,
        evaluacionEficacia: "",
        observaciones: "",
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

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = estadosAccion.find(e => e.value === estado);
    return estadoInfo ? (
      <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
    ) : (
      <Badge variant="outline">{estado}</Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoInfo = tiposAccion.find(t => t.value === tipo);
    return tipoInfo ? (
      <Badge className={tipoInfo.color}>{tipoInfo.label}</Badge>
    ) : (
      <Badge variant="outline">{tipo}</Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const prioridadInfo = prioridadesAccion.find(p => p.value === prioridad);
    return prioridadInfo ? (
      <Badge className={prioridadInfo.color}>{prioridadInfo.label}</Badge>
    ) : null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToEvaluationButton />
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-7 w-7 text-primary" />
              Acciones Correctivas y Preventivas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión de acciones según Decreto 1072/2015 Art. 2.2.4.6.33 y Resolución 0312/2019 Estándar 7.1.1
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-nueva-accion">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Acción
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{estadisticas.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.enProgreso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.completadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Acciones</CardTitle>
          <CardDescription>
            Registro de acciones correctivas, preventivas y de mejora del SG-SST
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, hallazgo o acción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-buscar-acciones"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]" data-testid="select-filtro-estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {estadosAccion.map(estado => (
                  <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]" data-testid="select-filtro-tipo">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposAccion.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando acciones...</div>
          ) : filteredAcciones.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay acciones registradas</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera acción
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead className="max-w-[200px]">Hallazgo</TableHead>
                    <TableHead className="max-w-[200px]">Acción</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAcciones.map((accion) => {
                    const responsable = usuarios.find(u => u.id === String(accion.responsableId));
                    const isVencida = accion.fechaLimite && 
                      new Date(accion.fechaLimite) < new Date() && 
                      accion.estado !== "completada" && 
                      accion.estado !== "cerrada";
                    return (
                      <TableRow key={accion.id} className={isVencida ? "bg-red-50 dark:bg-red-900/10" : ""}>
                        <TableCell className="font-mono text-sm">
                          {accion.codigo || `AC-${accion.id}`}
                        </TableCell>
                        <TableCell>{getTipoBadge(accion.tipo || "correctiva")}</TableCell>
                        <TableCell className="text-sm">
                          {origenesAccion.find(o => o.value === accion.origen)?.label || accion.origen}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={accion.hallazgo || ""}>
                          {accion.hallazgo}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={accion.accion || ""}>
                          {accion.accion}
                        </TableCell>
                        <TableCell>{responsable?.fullName || "-"}</TableCell>
                        <TableCell className={isVencida ? "text-red-600 font-medium" : ""}>
                          {accion.fechaLimite 
                            ? format(new Date(accion.fechaLimite), "dd/MM/yyyy", { locale: es }) 
                            : "-"}
                        </TableCell>
                        <TableCell>{getEstadoBadge(accion.estado || "pendiente")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={accion.porcentajeAvance || 0} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">{accion.porcentajeAvance || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(accion)}
                              data-testid={`button-editar-accion-${accion.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(accion.id)}
                              data-testid={`button-eliminar-accion-${accion.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccion ? "Editar Acción" : "Nueva Acción Correctiva/Preventiva"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos de la acción según Decreto 1072/2015 Art. 2.2.4.6.33
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Acción</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-accion">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposAccion.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="origen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origen</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-origen-accion">
                            <SelectValue placeholder="Seleccionar origen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {origenesAccion.map(origen => (
                            <SelectItem key={origen.value} value={origen.value}>{origen.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hallazgo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hallazgo / No Conformidad</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa el hallazgo o no conformidad identificada..."
                        {...field}
                        data-testid="textarea-hallazgo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="causaRaiz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Causa Raíz</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa la causa raíz identificada (análisis de causas)..."
                        {...field}
                        data-testid="textarea-causa-raiz"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acción a Implementar</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa la acción correctiva o preventiva a implementar..."
                        {...field}
                        data-testid="textarea-accion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-responsable">
                            <SelectValue placeholder="Seleccionar responsable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usuarios.map(usuario => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
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
                          {prioridadesAccion.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
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
                  name="fechaLimite"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Límite</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                              data-testid="button-fecha-limite"
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
                            selected={field.value || undefined}
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
                          {estadosAccion.map(e => (
                            <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="evaluacionEficacia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluación de Eficacia</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa cómo se evaluará la eficacia de la acción implementada..."
                        {...field}
                        data-testid="textarea-eficacia"
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
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-guardar-accion"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta acción? Esta operación no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirmar-eliminar"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
