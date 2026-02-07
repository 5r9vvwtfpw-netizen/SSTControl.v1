import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Edit, User, Car, Building, Cloud, AlertTriangle, ShieldPlus, Link2, FileDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiesgoVial, Worker, insertRiesgoVialSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { VinculacionRiesgosSstPesvBanner } from "@/components/pesv/VinculacionRiesgosSstPesvBanner";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { z } from "zod";

const PROBABILIDAD_VALUES = {
  muy_baja: { label: "Muy Baja", value: 1 },
  baja: { label: "Baja", value: 2 },
  media: { label: "Media", value: 3 },
  alta: { label: "Alta", value: 4 },
  muy_alta: { label: "Muy Alta", value: 5 },
};

const IMPACTO_VALUES = {
  insignificante: { label: "Insignificante", value: 1 },
  menor: { label: "Menor", value: 2 },
  moderado: { label: "Moderado", value: 3 },
  mayor: { label: "Mayor", value: 4 },
  catastrofico: { label: "Catastrófico", value: 5 },
};

const CATEGORIA_CONFIG = {
  conductor: { label: "Conductor", icon: User, className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  vehiculo: { label: "Vehículo", icon: Car, className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  via: { label: "Vía", icon: AlertTriangle, className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  entorno: { label: "Entorno", icon: Cloud, className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  organizacional: { label: "Organizacional", icon: Building, className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
};

const ESTADO_CONFIG = {
  identificado: { label: "Identificado", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
  en_evaluacion: { label: "En Evaluación", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  en_tratamiento: { label: "En Tratamiento", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  controlado: { label: "Controlado", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  cerrado: { label: "Cerrado", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
};

const NIVEL_RIESGO_CONFIG = {
  bajo: { label: "Bajo", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  medio: { label: "Medio", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  alto: { label: "Alto", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  muy_alto: { label: "Muy Alto", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
  critico: { label: "Crítico", className: "bg-red-800/20 text-red-800 dark:text-red-300" },
};

const getRiskLevel = (valorRiesgo: number): string => {
  if (valorRiesgo <= 4) return "bajo";
  if (valorRiesgo <= 9) return "medio";
  if (valorRiesgo <= 14) return "alto";
  if (valorRiesgo <= 19) return "muy_alto";
  return "critico";
};

const getMatrixCellColor = (valorRiesgo: number): string => {
  if (valorRiesgo <= 4) return "bg-green-500";
  if (valorRiesgo <= 9) return "bg-yellow-500";
  if (valorRiesgo <= 14) return "bg-orange-500";
  if (valorRiesgo <= 19) return "bg-red-500";
  return "bg-red-800";
};

const formSchema = insertRiesgoVialSchema.extend({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  categoria: z.enum(["conductor", "vehiculo", "via", "entorno", "organizacional"]),
  probabilidad: z.enum(["muy_baja", "baja", "media", "alta", "muy_alta"]),
  impacto: z.enum(["insignificante", "menor", "moderado", "mayor", "catastrofico"]),
});

type FormValues = z.infer<typeof formSchema>;

interface RiskStatistics {
  total: number;
  porCategoria: Record<string, number>;
  porNivel: Record<string, number>;
  porEstado: Record<string, number>;
}

export default function MatrizRiesgosViales() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riesgoToDelete, setRiesgoToDelete] = useState<RiesgoVial | null>(null);
  const [editingRiesgo, setEditingRiesgo] = useState<RiesgoVial | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "conductor",
      fuenteRiesgo: "",
      causasRaiz: "",
      consecuencias: "",
      probabilidad: "media",
      impacto: "moderado",
      controlesExistentes: "",
      responsableId: undefined,
      pasoPesvRelacionado: "",
      estado: "identificado",
      observaciones: "",
    },
  });

  const { data: riesgos = [], isLoading } = useQuery<RiesgoVial[]>({
    queryKey: ["/api/riesgos-viales"],
  });

  const { data: estadisticas } = useQuery<RiskStatistics>({
    queryKey: ["/api/riesgos-viales/estadisticas"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const matrixData = useMemo(() => {
    const matrix: Record<string, Record<string, RiesgoVial[]>> = {};
    const probKeys = Object.keys(PROBABILIDAD_VALUES);
    const impKeys = Object.keys(IMPACTO_VALUES);
    
    probKeys.forEach(prob => {
      matrix[prob] = {};
      impKeys.forEach(imp => {
        matrix[prob][imp] = [];
      });
    });

    riesgos.forEach(riesgo => {
      if (riesgo.probabilidad && riesgo.impacto && matrix[riesgo.probabilidad]) {
        matrix[riesgo.probabilidad][riesgo.impacto]?.push(riesgo);
      }
    });

    return matrix;
  }, [riesgos]);

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/riesgos-viales", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales/estadisticas"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Riesgo vial creado",
        description: "El riesgo vial se ha registrado exitosamente",
        className: "bg-green-50 border-green-200",
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
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      const res = await apiRequest("PATCH", `/api/riesgos-viales/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales/estadisticas"] });
      setDialogOpen(false);
      setEditingRiesgo(null);
      form.reset();
      toast({
        title: "Riesgo actualizado",
        description: "El riesgo vial se ha actualizado exitosamente",
        className: "bg-green-50 border-green-200",
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
    mutationFn: async (riesgoId: string) => {
      await apiRequest("DELETE", `/api/riesgos-viales/${riesgoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales/estadisticas"] });
      setDeleteDialogOpen(false);
      setRiesgoToDelete(null);
      toast({
        title: "Riesgo eliminado",
        description: "El riesgo vial se ha eliminado exitosamente",
        className: "bg-green-50 border-green-200",
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

  const syncToSstMutation = useMutation({
    mutationFn: async (riesgoId: string) => {
      const res = await apiRequest("POST", "/api/riesgos-vinculacion/sincronizar-pesv-a-sst", {
        riesgoVialId: riesgoId,
        matrizIpercId: "default",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["riesgo-vinculacion"] });
      toast({
        title: "Éxito",
        description: "Riesgo sincronizado a matriz SST",
        className: "bg-green-50 border-green-200",
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

  const onSubmit = (values: FormValues) => {
    if (editingRiesgo) {
      updateMutation.mutate({ id: editingRiesgo.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEditClick = (riesgo: RiesgoVial) => {
    setEditingRiesgo(riesgo);
    form.reset({
      codigo: riesgo.codigo,
      nombre: riesgo.nombre,
      descripcion: riesgo.descripcion,
      categoria: riesgo.categoria,
      fuenteRiesgo: riesgo.fuenteRiesgo || "",
      causasRaiz: riesgo.causasRaiz || "",
      consecuencias: riesgo.consecuencias || "",
      probabilidad: riesgo.probabilidad,
      impacto: riesgo.impacto,
      controlesExistentes: riesgo.controlesExistentes || "",
      responsableId: riesgo.responsableId || undefined,
      pasoPesvRelacionado: riesgo.pasoPesvRelacionado || "",
      estado: riesgo.estado,
      observaciones: riesgo.observaciones || "",
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, riesgo: RiesgoVial) => {
    e.stopPropagation();
    setRiesgoToDelete(riesgo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (riesgoToDelete) {
      deleteMutation.mutate(riesgoToDelete.id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingRiesgo(null);
      form.reset();
    }
    setDialogOpen(open);
  };

  const filteredRiesgos = riesgos.filter((riesgo) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      riesgo.codigo.toLowerCase().includes(searchLower) ||
      riesgo.nombre.toLowerCase().includes(searchLower) ||
      riesgo.descripcion.toLowerCase().includes(searchLower) ||
      (riesgo.fuenteRiesgo?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getCategoriaBadge = (categoria: string) => {
    const config = CATEGORIA_CONFIG[categoria as keyof typeof CATEGORIA_CONFIG];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge className={config.className} data-testid={`badge-categoria-${categoria}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const config = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG];
    if (!config) return null;
    return (
      <Badge className={config.className} data-testid={`badge-estado-${estado}`}>
        {config.label}
      </Badge>
    );
  };

  const getNivelRiesgoBadge = (nivelRiesgo: string | null, valorRiesgo: number | null) => {
    const nivel = nivelRiesgo || (valorRiesgo ? getRiskLevel(valorRiesgo) : "bajo");
    const config = NIVEL_RIESGO_CONFIG[nivel as keyof typeof NIVEL_RIESGO_CONFIG] || NIVEL_RIESGO_CONFIG.bajo;
    return (
      <Badge className={config.className} data-testid={`badge-nivel-${nivel}`}>
        {config.label}
      </Badge>
    );
  };

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const probKeys = ["muy_alta", "alta", "media", "baja", "muy_baja"];
  const impKeys = ["insignificante", "menor", "moderado", "mayor", "catastrofico"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Matriz de Riesgos Viales</h1>
          <p className="text-muted-foreground">
            ISO 31000:2018 - PESV Resolución 40595/2022
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BackToPesvEvaluationButton />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/riesgos-viales/pdf', 'riesgos-viales-pesv.pdf')}
            data-testid="button-download-riesgos-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-agregar-riesgo">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Riesgo
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>{editingRiesgo ? "Editar Riesgo Vial" : "Nuevo Riesgo Vial"}</DialogTitle>
              <DialogDescription>
                {editingRiesgo 
                  ? "Modifique los datos del riesgo vial según ISO 31000:2018"
                  : "Registre un nuevo riesgo vial identificado según ISO 31000:2018"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                          <Input placeholder="RV-001" {...field} data-testid="input-codigo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-categoria">
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CATEGORIA_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
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
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Riesgo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre descriptivo del riesgo" {...field} data-testid="input-nombre" />
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
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción detallada del riesgo identificado" 
                          {...field} 
                          data-testid="input-descripcion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuenteRiesgo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente del Riesgo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Origen del riesgo" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-fuente-riesgo" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="causasRaiz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Causas Raíz</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Análisis de causas del riesgo" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-causas-raiz"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consecuencias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consecuencias</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Posibles consecuencias del riesgo" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-consecuencias"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="probabilidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probabilidad *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-probabilidad">
                              <SelectValue placeholder="Seleccionar probabilidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PROBABILIDAD_VALUES).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label} ({config.value})
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
                    name="impacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impacto *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-impacto">
                              <SelectValue placeholder="Seleccionar impacto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(IMPACTO_VALUES).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label} ({config.value})
                              </SelectItem>
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
                  name="controlesExistentes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Controles Existentes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa los controles existentes para este riesgo" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-controles-existentes"
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
                        <Select onValueChange={(val) => field.onChange(val === "none" ? null : val)} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-responsable">
                              <SelectValue placeholder="Seleccionar responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {workers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.name}
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
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ESTADO_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
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
                  name="pasoPesvRelacionado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paso PESV Relacionado</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: P01, H05, V02, A01" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-paso-pesv"
                        />
                      </FormControl>
                      <FormDescription>Código del paso PESV relacionado (opcional)</FormDescription>
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
                          placeholder="Observaciones adicionales" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-observaciones"
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
                    data-testid="button-cancelar"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-guardar"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Guardando..." 
                      : editingRiesgo ? "Actualizar" : "Guardar"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar riesgos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">Matriz de Riesgos 5x5</CardTitle>
          <CardDescription>Probabilidad × Impacto según ISO 31000:2018</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" data-testid="table-matriz">
              <thead>
                <tr>
                  <th className="p-2 border bg-muted font-medium text-sm">Probabilidad / Impacto</th>
                  {impKeys.map((imp) => (
                    <th key={imp} className="p-2 border bg-muted font-medium text-sm text-center">
                      {IMPACTO_VALUES[imp as keyof typeof IMPACTO_VALUES].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {probKeys.map((prob) => (
                  <tr key={prob}>
                    <td className="p-2 border bg-muted font-medium text-sm">
                      {PROBABILIDAD_VALUES[prob as keyof typeof PROBABILIDAD_VALUES].label}
                    </td>
                    {impKeys.map((imp) => {
                      const probValue = PROBABILIDAD_VALUES[prob as keyof typeof PROBABILIDAD_VALUES].value;
                      const impValue = IMPACTO_VALUES[imp as keyof typeof IMPACTO_VALUES].value;
                      const valorRiesgo = probValue * impValue;
                      const cellRisks = matrixData[prob]?.[imp] || [];
                      const cellColor = getMatrixCellColor(valorRiesgo);
                      
                      return (
                        <td 
                          key={`${prob}-${imp}`} 
                          className={`p-2 border text-center ${cellColor} text-white font-bold`}
                          data-testid={`cell-${prob}-${imp}`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{valorRiesgo}</span>
                            {cellRisks.length > 0 && (
                              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                                {cellRisks.length} riesgo{cellRisks.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">Bajo (1-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm">Medio (5-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span className="text-sm">Alto (10-14)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm">Muy Alto (15-19)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-800 rounded" />
              <span className="text-sm">Crítico (20-25)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Riesgos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" data-testid="text-total-riesgos">{estadisticas.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600" data-testid="text-riesgos-criticos">
                {(estadisticas.porNivel?.critico || 0) + (estadisticas.porNivel?.muy_alto || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Tratamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600" data-testid="text-en-tratamiento">
                {estadisticas.porEstado?.en_tratamiento || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Controlados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600" data-testid="text-controlados">
                {estadisticas.porEstado?.controlado || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold" data-testid="text-lista-riesgos">Lista de Riesgos Identificados</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : filteredRiesgos.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-riesgos">
              {searchTerm ? "No se encontraron riesgos con ese criterio de búsqueda" : "No hay riesgos viales registrados"}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setDialogOpen(true)}
                data-testid="button-crear-primer-riesgo"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer riesgo
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRiesgos.map((riesgo) => (
              <Card key={riesgo.id} className="hover-elevate" data-testid={`card-riesgo-${riesgo.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1">
                      {getCategoriaBadge(riesgo.categoria)}
                      {getNivelRiesgoBadge(riesgo.nivelRiesgo, riesgo.valorRiesgo)}
                      {getEstadoBadge(riesgo.estado)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClick(riesgo)}
                        data-testid={`button-edit-${riesgo.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(e, riesgo)}
                        data-testid={`button-delete-${riesgo.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    <span className="text-muted-foreground font-mono text-sm">{riesgo.codigo}</span>{" "}
                    {riesgo.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{riesgo.descripcion}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">P:</span>
                      <span className="font-medium">
                        {PROBABILIDAD_VALUES[riesgo.probabilidad as keyof typeof PROBABILIDAD_VALUES]?.label || riesgo.probabilidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">I:</span>
                      <span className="font-medium">
                        {IMPACTO_VALUES[riesgo.impacto as keyof typeof IMPACTO_VALUES]?.label || riesgo.impacto}
                      </span>
                    </div>
                    {riesgo.valorRiesgo && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-bold">{riesgo.valorRiesgo}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      data-testid={`button-tratamiento-${riesgo.id}`}
                    >
                      <ShieldPlus className="h-4 w-4 mr-1" />
                      Tratamiento
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => syncToSstMutation.mutate(riesgo.id)}
                      disabled={syncToSstMutation.isPending}
                      data-testid={`button-sync-sst-${riesgo.id}`}
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      Sincronizar SST
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar riesgo vial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el riesgo{" "}
              <strong>{riesgoToDelete?.codigo} - {riesgoToDelete?.nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
