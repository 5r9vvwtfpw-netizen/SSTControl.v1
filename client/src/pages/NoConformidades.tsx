import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus, Search, Edit2, Trash2, AlertCircle, Clock,
  CheckCircle2, CalendarIcon, AlertTriangle, FileText, XCircle
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@shared/schema";

interface NoConformidad {
  id: number;
  codigo?: string | null;
  tipo?: string | null;
  origen?: string | null;
  requisito?: string | null;
  descripcion?: string | null;
  evidencia?: string | null;
  fechaDeteccion?: string | Date | null;
  fechaCierre?: string | Date | null;
  responsableId?: number | null;
  estado?: string | null;
  observaciones?: string | null;
}
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const estadosNC = [
  { value: "abierta", label: "Abierta", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "en_analisis", label: "En Análisis", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "accion_definida", label: "Acción Definida", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "en_implementacion", label: "En Implementación", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "verificacion_pendiente", label: "Verificación Pendiente", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "cerrada", label: "Cerrada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "cancelada", label: "Cancelada", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
];

const tiposNC = [
  { value: "mayor", label: "Mayor", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "menor", label: "Menor", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "observacion", label: "Observación", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
];

const origenesNC = [
  { value: "auditoria_interna", label: "Auditoría Interna" },
  { value: "auditoria_externa", label: "Auditoría Externa" },
  { value: "inspeccion", label: "Inspección" },
  { value: "revision_direccion", label: "Revisión por la Dirección" },
  { value: "investigacion_incidente", label: "Investigación de Incidente" },
  { value: "queja_cliente", label: "Queja de Cliente" },
  { value: "queja_trabajador", label: "Queja de Trabajador" },
  { value: "requisito_legal", label: "Requisito Legal" },
  { value: "otro", label: "Otro" },
];

const ncFormSchema = z.object({
  codigo: z.string().optional(),
  tipo: z.enum(["mayor", "menor", "observacion"]),
  origen: z.string().min(1, "El origen es requerido"),
  requisito: z.string().min(1, "El requisito incumplido es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  evidencia: z.string().optional(),
  fechaDeteccion: z.coerce.date(),
  fechaCierre: z.coerce.date().optional().nullable(),
  responsableId: z.string().optional().nullable(),
  estado: z.enum(["abierta", "en_analisis", "accion_definida", "en_implementacion", "verificacion_pendiente", "cerrada", "cancelada"]),
  observaciones: z.string().optional(),
});

type NCFormData = z.infer<typeof ncFormSchema>;

export default function NoConformidades() {
  const { toast } = useToast();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNC, setEditingNC] = useState<NoConformidad | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const form = useForm<NCFormData>({
    resolver: zodResolver(ncFormSchema),
    defaultValues: {
      tipo: "menor",
      origen: "",
      requisito: "",
      descripcion: "",
      evidencia: "",
      fechaDeteccion: new Date(),
      fechaCierre: null,
      responsableId: null,
      estado: "abierta",
      observaciones: "",
    },
  });

  const { data: noConformidades = [], isLoading } = useQuery<NoConformidad[]>({
    queryKey: ["/api/no-conformidades"],
  });

  const { data: usuarios = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: NCFormData) => {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const payload = {
        codigo: data.codigo || `NC-${year}-${randomSuffix}`,
        tipo: data.tipo,
        origen: data.origen,
        requisitoIncumplido: data.requisito,
        descripcion: data.descripcion,
        evidenciaObjetiva: data.evidencia || null,
        fechaDeteccion: new Date(data.fechaDeteccion).toISOString().split('T')[0],
        fechaCierre: data.fechaCierre ? new Date(data.fechaCierre).toISOString().split('T')[0] : null,
        responsableAreaId: data.responsableId || null,
        estado: data.estado,
        observaciones: data.observaciones || null,
      };
      return apiRequest("POST", "/api/no-conformidades", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/no-conformidades"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "No conformidad creada", description: "La no conformidad se ha registrado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear la no conformidad.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NCFormData> }) => {
      return apiRequest("PATCH", `/api/no-conformidades/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/no-conformidades"] });
      setDialogOpen(false);
      setEditingNC(null);
      form.reset();
      toast({ title: "No conformidad actualizada", description: "La no conformidad se ha actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar la no conformidad.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/no-conformidades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/no-conformidades"] });
      setDeleteConfirmId(null);
      toast({ title: "No conformidad eliminada", description: "La no conformidad se ha eliminado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la no conformidad.", variant: "destructive" });
    },
  });

  const filteredNCs = useMemo(() => {
    return noConformidades.filter(nc => {
      const matchesSearch = 
        nc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.requisito?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === "todos" || nc.estado === filterEstado;
      const matchesTipo = filterTipo === "todos" || nc.tipo === filterTipo;
      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [noConformidades, searchTerm, filterEstado, filterTipo]);

  const estadisticas = useMemo(() => {
    const total = noConformidades.length;
    const abiertas = noConformidades.filter(nc => nc.estado === "abierta").length;
    const enProceso = noConformidades.filter(nc => nc.estado && ["en_analisis", "accion_definida", "en_implementacion", "verificacion_pendiente"].includes(nc.estado)).length;
    const cerradas = noConformidades.filter(nc => nc.estado === "cerrada").length;
    const mayores = noConformidades.filter(nc => nc.tipo === "mayor" && nc.estado !== "cerrada").length;
    return { total, abiertas, enProceso, cerradas, mayores };
  }, [noConformidades]);

  const handleOpenDialog = (nc?: NoConformidad) => {
    if (nc) {
      setEditingNC(nc);
      form.reset({
        codigo: nc.codigo || "",
        tipo: (nc.tipo as "mayor" | "menor" | "observacion") || "menor",
        origen: nc.origen || "",
        requisito: nc.requisito || "",
        descripcion: nc.descripcion || "",
        evidencia: nc.evidencia || "",
        fechaDeteccion: nc.fechaDeteccion ? new Date(nc.fechaDeteccion) : new Date(),
        fechaCierre: nc.fechaCierre ? new Date(nc.fechaCierre) : null,
        responsableId: nc.responsableId?.toString() || null,
        estado: (nc.estado as "abierta" | "en_analisis" | "accion_definida" | "en_implementacion" | "verificacion_pendiente" | "cerrada" | "cancelada") || "abierta",
        observaciones: nc.observaciones || "",
      });
    } else {
      setEditingNC(null);
      form.reset({
        tipo: "menor",
        origen: "",
        requisito: "",
        descripcion: "",
        evidencia: "",
        fechaDeteccion: new Date(),
        fechaCierre: null,
        responsableId: null,
        estado: "abierta",
        observaciones: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: NCFormData) => {
    if (editingNC) {
      updateMutation.mutate({ id: editingNC.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = estadosNC.find(e => e.value === estado);
    return estadoInfo ? (
      <Badge className={estadoInfo.color}>{estadoInfo.label}</Badge>
    ) : (
      <Badge variant="outline">{estado}</Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoInfo = tiposNC.find(t => t.value === tipo);
    return tipoInfo ? (
      <Badge className={tipoInfo.color}>{tipoInfo.label}</Badge>
    ) : (
      <Badge variant="outline">{tipo}</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToEvaluationButton />
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <XCircle className="h-7 w-7 text-destructive" />
              No Conformidades
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión de no conformidades según ISO 45001:2018 Numeral 10.2 y Resolución 0312/2019
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-nueva-nc">
          <Plus className="h-4 w-4 mr-2" />
          Nueva No Conformidad
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.abiertas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Tratamiento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.enProceso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.cerradas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NC Mayores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.mayores}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de No Conformidades</CardTitle>
          <CardDescription>
            Control de no conformidades detectadas en auditorías, inspecciones y otros procesos del SG-SST
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, requisito o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-buscar-nc"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]" data-testid="select-filtro-estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {estadosNC.map(estado => (
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
                {tiposNC.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando no conformidades...</div>
          ) : filteredNCs.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay no conformidades registradas</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar primera no conformidad
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
                    <TableHead>Requisito</TableHead>
                    <TableHead className="max-w-[200px]">Descripción</TableHead>
                    <TableHead>Fecha Detección</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNCs.map((nc) => (
                    <TableRow key={nc.id}>
                      <TableCell className="font-mono text-sm">
                        {nc.codigo || `NC-${nc.id}`}
                      </TableCell>
                      <TableCell>{getTipoBadge(nc.tipo || "menor")}</TableCell>
                      <TableCell className="text-sm">
                        {origenesNC.find(o => o.value === nc.origen)?.label || nc.origen}
                      </TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate" title={nc.requisito || ""}>
                        {nc.requisito}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={nc.descripcion || ""}>
                        {nc.descripcion}
                      </TableCell>
                      <TableCell>
                        {nc.fechaDeteccion 
                          ? format(new Date(nc.fechaDeteccion), "dd/MM/yyyy", { locale: es }) 
                          : "-"}
                      </TableCell>
                      <TableCell>{getEstadoBadge(nc.estado || "abierta")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(nc)}
                            data-testid={`button-editar-nc-${nc.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(nc.id)}
                            data-testid={`button-eliminar-nc-${nc.id}`}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNC ? "Editar No Conformidad" : "Nueva No Conformidad"}
            </DialogTitle>
            <DialogDescription>
              Registre la no conformidad según ISO 45001:2018 Numeral 10.2
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
                      <FormLabel>Tipo de NC</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-nc">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposNC.map(tipo => (
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
                          <SelectTrigger data-testid="select-origen-nc">
                            <SelectValue placeholder="Seleccionar origen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {origenesNC.map(origen => (
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
                name="requisito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requisito Incumplido</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Decreto 1072/2015 Art. 2.2.4.6.12, ISO 45001:2018 Numeral 6.1..."
                        {...field}
                        data-testid="input-requisito"
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
                    <FormLabel>Descripción de la No Conformidad</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa detalladamente la no conformidad detectada..."
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
                name="evidencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidencia Objetiva</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa la evidencia objetiva que sustenta la no conformidad..."
                        {...field}
                        data-testid="textarea-evidencia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fechaDeteccion"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Detección</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                              data-testid="button-fecha-deteccion"
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
                          {estadosNC.map(e => (
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
                name="responsableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable del Tratamiento</FormLabel>
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
                  data-testid="button-guardar-nc"
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
              ¿Está seguro de que desea eliminar esta no conformidad? Esta operación no se puede deshacer.
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
