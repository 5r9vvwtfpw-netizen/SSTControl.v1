import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Pencil, 
  Trash2,
  ListChecks,
  ClipboardList
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  RecomendacionArlAutoridad, 
  SeguimientoRecomendacion,
  insertRecomendacionArlAutoridadSchema, 
  insertSeguimientoRecomendacionSchema,
  Worker
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { getTodayDateString, toDateInputValue } from "@/lib/utils/formatters";

const formSchema = insertRecomendacionArlAutoridadSchema.extend({
  fechaDocumento: z.string().min(1, "Fecha requerida"),
  fechaRecepcion: z.string().min(1, "Fecha requerida"),
  fechaLimite: z.string().optional(),
  fechaImplementacion: z.string().optional(),
  fechaVerificacion: z.string().optional(),
});

const seguimientoFormSchema = insertSeguimientoRecomendacionSchema.extend({
  fechaSeguimiento: z.string().min(1, "Fecha requerida"),
});

const origenLabels: Record<string, string> = {
  arl: "ARL",
  ministerio_trabajo: "Ministerio del Trabajo",
  eps: "EPS",
  afp: "AFP",
  secretaria_salud: "Secretaría de Salud",
  otro: "Otro"
};

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  implementada: "Implementada",
  verificada: "Verificada",
  cerrada: "Cerrada",
  rechazada: "Rechazada"
};

const tipoLabels: Record<string, string> = {
  correctiva: "Correctiva",
  preventiva: "Preventiva",
  mejora: "Mejora",
  obligatoria: "Obligatoria"
};

export default function RecomendacionesArl() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [origenFilter, setOrigenFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecomendacionArlAutoridad | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [seguimientosDialogOpen, setSeguimientosDialogOpen] = useState(false);
  const [selectedRecomendacion, setSelectedRecomendacion] = useState<RecomendacionArlAutoridad | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      origen: "arl",
      nombreEntidad: "",
      numeroDocumento: "",
      fechaDocumento: "",
      fechaRecepcion: "",
      tipoRecomendacion: "correctiva",
      descripcion: "",
      fundamentoLegal: "",
      areaAfectada: "",
      fechaLimite: "",
      diasPlazo: null,
      planAccion: "",
      responsable: "",
      recursos: "",
      presupuesto: null,
      estado: "pendiente",
      porcentajeAvance: 0,
      fechaImplementacion: "",
      verificadoPor: "",
      fechaVerificacion: "",
      evidenciaCumplimiento: "",
      documentoRespuesta: "",
      observaciones: "",
      accidenteId: null,
    },
  });

  const seguimientoForm = useForm<z.infer<typeof seguimientoFormSchema>>({
    resolver: zodResolver(seguimientoFormSchema),
    defaultValues: {
      recomendacionId: "",
      fechaSeguimiento: getTodayDateString(),
      accionRealizada: "",
      avanceReportado: 0,
      observaciones: "",
    },
  });

  const { data: recomendaciones = [], isLoading } = useQuery<RecomendacionArlAutoridad[]>({
    queryKey: ["/api/recomendaciones-arl"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: seguimientos = [], isLoading: loadingSeguimientos } = useQuery<SeguimientoRecomendacion[]>({
    queryKey: ["/api/recomendaciones-arl", selectedRecomendacion?.id, "seguimientos"],
    enabled: !!selectedRecomendacion,
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/recomendaciones-arl", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recomendaciones-arl"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Recomendación creada",
        description: "La recomendación se ha registrado exitosamente",
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
    mutationFn: async (data: { id: string; values: z.infer<typeof formSchema> }) => {
      const res = await apiRequest("PATCH", `/api/recomendaciones-arl/${data.id}`, data.values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recomendaciones-arl"] });
      setDialogOpen(false);
      setEditingRecord(null);
      form.reset();
      toast({
        title: "Recomendación actualizada",
        description: "Los cambios se han guardado exitosamente",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/recomendaciones-arl/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recomendaciones-arl"] });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      toast({
        title: "Recomendación eliminada",
        description: "El registro se ha eliminado correctamente",
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

  const createSeguimientoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof seguimientoFormSchema>) => {
      const res = await apiRequest("POST", `/api/recomendaciones-arl/${data.recomendacionId}/seguimientos`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recomendaciones-arl", selectedRecomendacion?.id, "seguimientos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recomendaciones-arl"] });
      seguimientoForm.reset({
        recomendacionId: selectedRecomendacion?.id || "",
        fechaSeguimiento: getTodayDateString(),
        accionRealizada: "",
        avanceReportado: 0,
        observaciones: "",
      });
      toast({
        title: "Seguimiento registrado",
        description: "El seguimiento se ha agregado exitosamente",
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

  const handleEdit = (record: RecomendacionArlAutoridad) => {
    setEditingRecord(record);
    form.reset({
      codigo: record.codigo,
      origen: record.origen,
      nombreEntidad: record.nombreEntidad,
      numeroDocumento: record.numeroDocumento || "",
      fechaDocumento: record.fechaDocumento ? toDateInputValue(record.fechaDocumento.toString()) : "",
      fechaRecepcion: record.fechaRecepcion ? toDateInputValue(record.fechaRecepcion.toString()) : "",
      tipoRecomendacion: record.tipoRecomendacion,
      descripcion: record.descripcion,
      fundamentoLegal: record.fundamentoLegal || "",
      areaAfectada: record.areaAfectada || "",
      fechaLimite: record.fechaLimite ? toDateInputValue(record.fechaLimite.toString()) : "",
      diasPlazo: record.diasPlazo,
      planAccion: record.planAccion || "",
      responsable: record.responsable,
      recursos: record.recursos || "",
      presupuesto: record.presupuesto,
      estado: record.estado,
      porcentajeAvance: record.porcentajeAvance,
      fechaImplementacion: record.fechaImplementacion ? toDateInputValue(record.fechaImplementacion.toString()) : "",
      verificadoPor: record.verificadoPor || "",
      fechaVerificacion: record.fechaVerificacion ? toDateInputValue(record.fechaVerificacion.toString()) : "",
      evidenciaCumplimiento: record.evidenciaCumplimiento || "",
      documentoRespuesta: record.documentoRespuesta || "",
      observaciones: record.observaciones || "",
      accidenteId: record.accidenteId,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleViewSeguimientos = (record: RecomendacionArlAutoridad) => {
    setSelectedRecomendacion(record);
    seguimientoForm.reset({
      recomendacionId: record.id,
      fechaSeguimiento: getTodayDateString(),
      accionRealizada: "",
      avanceReportado: record.porcentajeAvance,
      observaciones: "",
    });
    setSeguimientosDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const onSeguimientoSubmit = (values: z.infer<typeof seguimientoFormSchema>) => {
    createSeguimientoMutation.mutate(values);
  };

  const filteredRecomendaciones = recomendaciones.filter((rec) => {
    const matchesSearch = 
      rec.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nombreEntidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigen = origenFilter === "todos" || rec.origen === origenFilter;
    const matchesStatus = statusFilter === "todos" || rec.estado === statusFilter;
    return matchesSearch && matchesOrigen && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return '$' + new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { className: string; icon: typeof Clock }> = {
      pendiente: { className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: Clock },
      en_proceso: { className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: AlertTriangle },
      implementada: { className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      verificada: { className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
      cerrada: { className: "bg-gray-500/10 text-gray-700 dark:text-gray-400", icon: FileText },
      rechazada: { className: "bg-red-500/10 text-red-700 dark:text-red-400", icon: XCircle },
    };
    const item = config[estado] || config.pendiente;
    const Icon = item.icon;
    return (
      <Badge className={item.className} data-testid={`badge-estado-${estado}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estadoLabels[estado] || estado}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const config: Record<string, string> = {
      correctiva: "bg-red-500/10 text-red-700 dark:text-red-400",
      preventiva: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      mejora: "bg-green-500/10 text-green-700 dark:text-green-400",
      obligatoria: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    };
    return (
      <Badge className={config[tipo] || "bg-gray-500/10"} data-testid={`badge-tipo-${tipo}`}>
        {tipoLabels[tipo] || tipo}
      </Badge>
    );
  };

  const getOrigenBadge = (origen: string) => {
    return (
      <Badge variant="outline" data-testid={`badge-origen-${origen}`}>
        <Building2 className="h-3 w-3 mr-1" />
        {origenLabels[origen] || origen}
      </Badge>
    );
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingRecord(null);
      form.reset();
    }
    setDialogOpen(open);
  };

  return (
    <div className="space-y-6">
 <div className="flex gap-2 flex-wrap items-center justify-end">
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Recomendaciones ARL y Autoridades</h1>
          <p className="text-muted-foreground">Estándar 7.1.4 - Resolución 0312/2019</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-recomendacion">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Recomendación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Editar Recomendación" : "Nueva Recomendación"}</DialogTitle>
              <DialogDescription>
                {editingRecord 
                  ? "Actualice la información de la recomendación"
                  : "Registre una nueva recomendación de ARL o autoridad competente"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Identificación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: ARL-2024-001" 
                              data-testid="input-codigo"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="origen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origen *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-origen">
                                <SelectValue placeholder="Seleccione origen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="arl">ARL</SelectItem>
                              <SelectItem value="ministerio_trabajo">Ministerio del Trabajo</SelectItem>
                              <SelectItem value="eps">EPS</SelectItem>
                              <SelectItem value="afp">AFP</SelectItem>
                              <SelectItem value="secretaria_salud">Secretaría de Salud</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nombreEntidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Entidad *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Colmena ARL" 
                              data-testid="input-nombre-entidad"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numeroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Documento</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Radicado, acta o referencia" 
                              data-testid="input-numero-documento"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Fechas y Plazos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fechaDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del Documento *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-fecha-documento"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaRecepcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Recepción *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-fecha-recepcion"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaLimite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Límite</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-fecha-limite"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="diasPlazo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días de Plazo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Días otorgados"
                              data-testid="input-dias-plazo"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contenido de la Recomendación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipoRecomendacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Recomendación *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tipo-recomendacion">
                                <SelectValue placeholder="Seleccione tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="correctiva">Correctiva</SelectItem>
                              <SelectItem value="preventiva">Preventiva</SelectItem>
                              <SelectItem value="mejora">Mejora</SelectItem>
                              <SelectItem value="obligatoria">Obligatoria</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="areaAfectada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área Afectada</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Producción, Bodega" 
                              data-testid="input-area-afectada"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
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
                        <FormLabel>Descripción *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa detalladamente la recomendación"
                            data-testid="input-descripcion"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fundamentoLegal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fundamento Legal</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Base normativa citada" 
                            data-testid="input-fundamento-legal"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Plan de Acción</h3>
                  <FormField
                    control={form.control}
                    name="planAccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan de Acción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el plan para dar cumplimiento"
                            data-testid="input-plan-accion"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="responsable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-responsable">
                                <SelectValue placeholder="Seleccione responsable" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={worker.id} value={worker.name}>
                                  {worker.name} - {worker.position}
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
                      name="recursos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recursos Requeridos</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Recursos necesarios" 
                              data-testid="input-recursos"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="presupuesto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Presupuesto ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Presupuesto estimado"
                              data-testid="input-presupuesto"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Seguimiento</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-estado">
                                <SelectValue placeholder="Seleccione estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_proceso">En Proceso</SelectItem>
                              <SelectItem value="implementada">Implementada</SelectItem>
                              <SelectItem value="verificada">Verificada</SelectItem>
                              <SelectItem value="cerrada">Cerrada</SelectItem>
                              <SelectItem value="rechazada">Rechazada</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="porcentajeAvance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>% Avance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              max="100"
                              placeholder="0-100"
                              data-testid="input-porcentaje-avance"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                              onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaImplementacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Implementación</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-fecha-implementacion"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Verificación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="verificadoPor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verificado Por</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre del verificador" 
                              data-testid="input-verificado-por"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaVerificacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Verificación</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-fecha-verificacion"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="evidenciaCumplimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidencia de Cumplimiento</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa las evidencias de cumplimiento"
                            data-testid="input-evidencia-cumplimiento"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="documentoRespuesta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento de Respuesta</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Radicado de respuesta a la entidad" 
                            data-testid="input-documento-respuesta"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales"
                          data-testid="input-observaciones"
                          rows={2}
                          {...field}
                          value={field.value || ""}
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
                    onClick={() => handleDialogClose(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Guardando..." 
                      : editingRecord ? "Actualizar" : "Guardar"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por código, descripción, entidad o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={origenFilter} onValueChange={setOrigenFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-origen">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los orígenes</SelectItem>
            <SelectItem value="arl">ARL</SelectItem>
            <SelectItem value="ministerio_trabajo">Ministerio del Trabajo</SelectItem>
            <SelectItem value="eps">EPS</SelectItem>
            <SelectItem value="afp">AFP</SelectItem>
            <SelectItem value="secretaria_salud">Secretaría de Salud</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-estado">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="implementada">Implementada</SelectItem>
            <SelectItem value="verificada">Verificada</SelectItem>
            <SelectItem value="cerrada">Cerrada</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando recomendaciones...</p>
        </div>
      ) : filteredRecomendaciones.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron recomendaciones</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm || origenFilter !== "todos" || statusFilter !== "todos"
              ? "Intente ajustar los filtros de búsqueda"
              : "Haga clic en \"Nueva Recomendación\" para agregar una"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecomendaciones.map((rec) => (
            <Card key={rec.id} className="hover-elevate" data-testid={`card-recomendacion-${rec.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold" data-testid={`text-codigo-${rec.id}`}>
                      {rec.codigo}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {rec.nombreEntidad}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getOrigenBadge(rec.origen)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getEstadoBadge(rec.estado)}
                  {getTipoBadge(rec.tipoRecomendacion)}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-descripcion-${rec.id}`}>
                  {rec.descripcion}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avance</span>
                    <span className="font-medium" data-testid={`text-avance-${rec.id}`}>{rec.porcentajeAvance}%</span>
                  </div>
                  <Progress value={rec.porcentajeAvance} className="h-2" data-testid={`progress-avance-${rec.id}`} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{rec.responsable}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(rec.fechaLimite)}</span>
                  </div>
                </div>

                {rec.presupuesto && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Presupuesto: </span>
                    {formatCurrency(rec.presupuesto)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewSeguimientos(rec)}
                  data-testid={`button-seguimientos-${rec.id}`}
                >
                  <ListChecks className="h-4 w-4 mr-1" />
                  Seguimientos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(rec)}
                  data-testid={`button-edit-${rec.id}`}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(rec.id)}
                  className="text-destructive hover:text-destructive"
                  data-testid={`button-delete-${rec.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={seguimientosDialogOpen} onOpenChange={setSeguimientosDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seguimientos - {selectedRecomendacion?.codigo}</DialogTitle>
            <DialogDescription>
              Historial de seguimientos y acciones realizadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Form {...seguimientoForm}>
              <form onSubmit={seguimientoForm.handleSubmit(onSeguimientoSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-sm">Agregar Nuevo Seguimiento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={seguimientoForm.control}
                    name="fechaSeguimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            data-testid="input-seguimiento-fecha"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seguimientoForm.control}
                    name="avanceReportado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% Avance Reportado *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="100"
                            data-testid="input-seguimiento-avance"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={seguimientoForm.control}
                  name="accionRealizada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acción Realizada *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa las acciones realizadas"
                          data-testid="input-seguimiento-accion"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={seguimientoForm.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales"
                          data-testid="input-seguimiento-observaciones"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={createSeguimientoMutation.isPending}
                  data-testid="button-submit-seguimiento"
                >
                  {createSeguimientoMutation.isPending ? "Guardando..." : "Agregar Seguimiento"}
                </Button>
              </form>
            </Form>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Historial de Seguimientos</h4>
              {loadingSeguimientos ? (
                <p className="text-muted-foreground text-sm">Cargando seguimientos...</p>
              ) : seguimientos.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No hay seguimientos registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {seguimientos.map((seg) => (
                    <Card key={seg.id} data-testid={`card-seguimiento-${seg.id}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {formatDate(seg.fechaSeguimiento)}
                            </span>
                          </div>
                          <Badge variant="outline" data-testid={`badge-seguimiento-avance-${seg.id}`}>
                            {seg.avanceReportado}%
                          </Badge>
                        </div>
                        <p className="text-sm" data-testid={`text-seguimiento-accion-${seg.id}`}>
                          {seg.accionRealizada}
                        </p>
                        {seg.observaciones && (
                          <p className="text-sm text-muted-foreground italic">
                            {seg.observaciones}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar esta recomendación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los seguimientos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
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
