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
  Plus, Search, Edit2, Trash2, Clock,
  CheckCircle2, CalendarIcon, TrendingUp, FileText, Lightbulb,
  Target, ArrowUpRight
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@shared/schema";

interface OportunidadMejora {
  id: number;
  codigo?: string | null;
  titulo?: string | null;
  descripcion?: string | null;
  categoria?: string | null;
  fuenteIdentificacion?: string | null;
  mejoraEsperada?: string | null;
  recursosRequeridos?: string | null;
  responsableId?: number | null;
  fechaIdentificacion?: string | Date | null;
  fechaFinImplementacion?: string | Date | null;
  fechaCierre?: string | Date | null;
  prioridad?: string | null;
  estado?: string | null;
  porcentajeAvance?: number | null;
  resultadosObtenidos?: string | null;
  observaciones?: string | null;
}
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const estadosMejora = [
  { value: "identificada", label: "Identificada", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  { value: "evaluada", label: "Evaluada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "aprobada", label: "Aprobada", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
  { value: "en_implementacion", label: "En Implementación", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "implementada", label: "Implementada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "cerrada", label: "Cerrada", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "rechazada", label: "Rechazada", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
];

const categoriasMejora = [
  { value: "proceso", label: "Mejora de Proceso" },
  { value: "infraestructura", label: "Infraestructura" },
  { value: "capacitacion", label: "Capacitación" },
  { value: "documentacion", label: "Documentación" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "cultura_sst", label: "Cultura SST" },
  { value: "comunicacion", label: "Comunicación" },
  { value: "otro", label: "Otro" },
];

const fuentesMejora = [
  { value: "auditoria_interna", label: "Auditoría Interna" },
  { value: "revision_direccion", label: "Revisión por la Dirección" },
  { value: "sugerencia_empleado", label: "Sugerencia de Empleado" },
  { value: "analisis_indicadores", label: "Análisis de Indicadores" },
  { value: "benchmarking", label: "Benchmarking" },
  { value: "copasst", label: "COPASST" },
  { value: "investigacion_incidente", label: "Investigación de Incidentes" },
  { value: "otro", label: "Otro" },
];

const prioridadesMejora = [
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "baja", label: "Baja", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const mejoraFormSchema = z.object({
  codigo: z.string().optional(),
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  categoria: z.string().min(1, "La categoría es requerida"),
  fuente: z.string().min(1, "La fuente es requerida"),
  mejoraEsperada: z.string().optional(),
  recursosRequeridos: z.string().optional(),
  responsableId: z.string().optional().nullable(),
  fechaIdentificacion: z.coerce.date(),
  fechaImplementacion: z.coerce.date().optional().nullable(),
  fechaCierre: z.coerce.date().optional().nullable(),
  prioridad: z.enum(["alta", "media", "baja"]),
  estado: z.enum(["identificada", "evaluada", "aprobada", "en_implementacion", "implementada", "cerrada", "rechazada"]),
  porcentajeAvance: z.number().min(0).max(100).optional(),
  resultadosObtenidos: z.string().optional(),
  observaciones: z.string().optional(),
});

type MejoraFormData = z.infer<typeof mejoraFormSchema>;

export default function MejoraContinua() {
  const { toast } = useToast();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMejora, setEditingMejora] = useState<OportunidadMejora | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const form = useForm<MejoraFormData>({
    resolver: zodResolver(mejoraFormSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      categoria: "",
      fuente: "",
      mejoraEsperada: "",
      recursosRequeridos: "",
      responsableId: null,
      fechaIdentificacion: new Date(),
      fechaImplementacion: null,
      fechaCierre: null,
      prioridad: "media",
      estado: "identificada",
      porcentajeAvance: 0,
      resultadosObtenidos: "",
      observaciones: "",
    },
  });

  const { data: oportunidades = [], isLoading } = useQuery<OportunidadMejora[]>({
    queryKey: ["/api/oportunidades-mejora"],
  });

  const { data: usuarios = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: MejoraFormData) => {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const payload = {
        codigo: data.codigo || `OM-${year}-${randomSuffix}`,
        titulo: data.titulo,
        categoria: data.categoria,
        descripcion: data.descripcion,
        mejoraEsperada: data.mejoraEsperada || null,
        fuenteIdentificacion: data.fuente,
        recursosRequeridos: data.recursosRequeridos || null,
        responsableId: data.responsableId || null,
        fechaIdentificacion: new Date(data.fechaIdentificacion).toISOString().split('T')[0],
        fechaFinImplementacion: data.fechaImplementacion ? new Date(data.fechaImplementacion).toISOString().split('T')[0] : null,
        fechaCierre: data.fechaCierre ? new Date(data.fechaCierre).toISOString().split('T')[0] : null,
        prioridad: data.prioridad,
        estado: data.estado,
        porcentajeAvance: data.porcentajeAvance || 0,
        resultadosObtenidos: data.resultadosObtenidos || null,
        observaciones: data.observaciones || null,
      };
      return apiRequest("POST", "/api/oportunidades-mejora", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oportunidades-mejora"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Oportunidad creada", description: "La oportunidad de mejora se ha registrado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear la oportunidad.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MejoraFormData> }) => {
      return apiRequest("PATCH", `/api/oportunidades-mejora/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oportunidades-mejora"] });
      setDialogOpen(false);
      setEditingMejora(null);
      form.reset();
      toast({ title: "Oportunidad actualizada", description: "La oportunidad de mejora se ha actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar la oportunidad.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/oportunidades-mejora/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oportunidades-mejora"] });
      setDeleteConfirmId(null);
      toast({ title: "Oportunidad eliminada", description: "La oportunidad de mejora se ha eliminado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la oportunidad.", variant: "destructive" });
    },
  });

  const filteredOportunidades = useMemo(() => {
    return oportunidades.filter(op => {
      const matchesSearch = 
        op.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "todos" || op.estado === filterEstado;
      const matchesTipo = filterTipo === "todos" || op.categoria === filterTipo;
      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [oportunidades, searchTerm, filterEstado, filterTipo]);

  const estadisticas = useMemo(() => {
    const total = oportunidades.length;
    const identificadas = oportunidades.filter(op => op.estado === "identificada" || op.estado === "evaluada").length;
    const enImplementacion = oportunidades.filter(op => op.estado === "en_implementacion" || op.estado === "aprobada").length;
    const implementadas = oportunidades.filter(op => op.estado === "implementada" || op.estado === "cerrada").length;
    const porcentajePromedio = oportunidades.length > 0 
      ? Math.round(oportunidades.reduce((acc, op) => acc + (op.porcentajeAvance || 0), 0) / oportunidades.length)
      : 0;
    return { total, identificadas, enImplementacion, implementadas, porcentajePromedio };
  }, [oportunidades]);

  const handleOpenDialog = (mejora?: OportunidadMejora) => {
    if (mejora) {
      setEditingMejora(mejora);
      form.reset({
        codigo: mejora.codigo || "",
        titulo: mejora.titulo || "",
        descripcion: mejora.descripcion || "",
        categoria: mejora.categoria || "",
        fuente: mejora.fuenteIdentificacion || "",
        mejoraEsperada: mejora.mejoraEsperada || "",
        recursosRequeridos: mejora.recursosRequeridos || "",
        responsableId: mejora.responsableId?.toString() || null,
        fechaIdentificacion: mejora.fechaIdentificacion ? new Date(mejora.fechaIdentificacion) : new Date(),
        fechaImplementacion: mejora.fechaFinImplementacion ? new Date(mejora.fechaFinImplementacion) : null,
        fechaCierre: mejora.fechaCierre ? new Date(mejora.fechaCierre) : null,
        prioridad: (mejora.prioridad as "alta" | "media" | "baja") || "media",
        estado: (mejora.estado as "identificada" | "evaluada" | "aprobada" | "en_implementacion" | "implementada" | "cerrada" | "rechazada") || "identificada",
        porcentajeAvance: mejora.porcentajeAvance || 0,
        resultadosObtenidos: mejora.resultadosObtenidos || "",
        observaciones: mejora.observaciones || "",
      });
    } else {
      setEditingMejora(null);
      form.reset({
        titulo: "",
        descripcion: "",
        categoria: "",
        fuente: "",
        mejoraEsperada: "",
        recursosRequeridos: "",
        responsableId: null,
        fechaIdentificacion: new Date(),
        fechaImplementacion: null,
        fechaCierre: null,
        prioridad: "media",
        estado: "identificada",
        porcentajeAvance: 0,
        resultadosObtenidos: "",
        observaciones: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: MejoraFormData) => {
    if (editingMejora) {
      updateMutation.mutate({ id: editingMejora.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = estadosMejora.find(e => e.value === estado);
    return estadoInfo ? (
      <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
    ) : (
      <Badge variant="outline">{estado}</Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const prioridadInfo = prioridadesMejora.find(p => p.value === prioridad);
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
              <TrendingUp className="h-7 w-7 text-primary" />
              Mejora Continua
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión de oportunidades de mejora según Decreto 1072/2015 Art. 2.2.4.6.34 y Resolución 0312/2019
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-nueva-mejora">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Oportunidad
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identificadas</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{estadisticas.identificadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.enImplementacion}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.implementadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avance Promedio</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.porcentajePromedio}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oportunidades de Mejora</CardTitle>
          <CardDescription>
            Registro de oportunidades de mejora continua del SG-SST
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-buscar-mejora"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]" data-testid="select-filtro-estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {estadosMejora.map(estado => (
                  <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]" data-testid="select-filtro-tipo">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las categorías</SelectItem>
                {categoriasMejora.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando oportunidades de mejora...</div>
          ) : filteredOportunidades.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay oportunidades de mejora registradas</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar primera oportunidad
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead className="max-w-[200px]">Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOportunidades.map((op) => {
                    const responsable = usuarios.find(u => u.id === String(op.responsableId));
                    return (
                      <TableRow key={op.id}>
                        <TableCell className="font-mono text-sm">
                          {op.codigo || `OM-${op.id}`}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={op.titulo || ""}>
                          {op.titulo}
                        </TableCell>
                        <TableCell className="text-sm">
                          {categoriasMejora.find(c => c.value === op.categoria)?.label || op.categoria}
                        </TableCell>
                        <TableCell className="text-sm">
                          {fuentesMejora.find(f => f.value === op.fuenteIdentificacion)?.label || op.fuenteIdentificacion}
                        </TableCell>
                        <TableCell>{getPrioridadBadge(op.prioridad || "media")}</TableCell>
                        <TableCell>{responsable?.fullName || "-"}</TableCell>
                        <TableCell>{getEstadoBadge(op.estado || "identificada")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={op.porcentajeAvance || 0} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">{op.porcentajeAvance || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(op)}
                              data-testid={`button-editar-mejora-${op.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(op.id)}
                              data-testid={`button-eliminar-mejora-${op.id}`}
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
              {editingMejora ? "Editar Oportunidad de Mejora" : "Nueva Oportunidad de Mejora"}
            </DialogTitle>
            <DialogDescription>
              Registre la oportunidad de mejora según Decreto 1072/2015 Art. 2.2.4.6.34
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Título de la oportunidad de mejora..."
                        {...field}
                        data-testid="input-titulo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-mejora">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriasMejora.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente de Identificación</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-origen-mejora">
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuentesMejora.map(fuente => (
                            <SelectItem key={fuente.value} value={fuente.value}>{fuente.label}</SelectItem>
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
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa detalladamente la oportunidad de mejora..."
                        {...field}
                        data-testid="textarea-descripcion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mejoraEsperada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mejora Esperada</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa los beneficios esperados de implementar esta mejora..."
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-beneficio"
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
                          {prioridadesMejora.map(p => (
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
                  name="fechaIdentificacion"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Identificación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                              data-testid="button-fecha-identificacion"
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
                          {estadosMejora.map(e => (
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
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones adicionales..."
                        {...field}
                        data-testid="textarea-observaciones"
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
                  data-testid="button-guardar-mejora"
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
              ¿Está seguro de que desea eliminar esta oportunidad de mejora? Esta operación no se puede deshacer.
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
