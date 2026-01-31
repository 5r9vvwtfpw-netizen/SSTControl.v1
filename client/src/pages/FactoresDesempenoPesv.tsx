import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Edit, TrendingUp, TrendingDown, Minus, Target, Activity, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FactorDesempenoSV, insertFactorDesempenoSVSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const CATEGORIA_CONFIG = {
  exposicion_riesgo: { label: "Exposición al Riesgo", icon: AlertTriangle, className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  resultado_final: { label: "Resultado Final", icon: Target, className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  resultado_intermedio: { label: "Resultado Intermedio", icon: Activity, className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  intervencion: { label: "Intervención", icon: Shield, className: "bg-green-500/10 text-green-700 dark:text-green-400" },
};

const TENDENCIA_CONFIG = {
  mejorando: { label: "Mejorando", icon: TrendingUp, className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  estable: { label: "Estable", icon: Minus, className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  empeorando: { label: "Empeorando", icon: TrendingDown, className: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

const ELEMENTOS_SUGERIDOS = ["Vehículo", "Conductor", "Vía", "Peatón", "Ciclista", "Entorno", "Organización"];

const formSchema = insertFactorDesempenoSVSchema.extend({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  categoria: z.enum(["exposicion_riesgo", "resultado_final", "resultado_intermedio", "intervencion"]),
  descripcion: z.string().optional().nullable(),
  elementoRelacionado: z.string().optional().nullable(),
  valorBase: z.string().optional().nullable(),
  valorActual: z.string().optional().nullable(),
  metaAnual: z.string().optional().nullable(),
  unidadMedida: z.string().optional().nullable(),
  tendencia: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface SPFStatistics {
  total: number;
  porCategoria: Record<string, number>;
  porTendencia: Record<string, number>;
}

export default function FactoresDesempenoPesv() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [factorToDelete, setFactorToDelete] = useState<FactorDesempenoSV | null>(null);
  const [editingFactor, setEditingFactor] = useState<FactorDesempenoSV | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "exposicion_riesgo",
      elementoRelacionado: "",
      valorBase: "",
      valorActual: "",
      metaAnual: "",
      unidadMedida: "",
      tendencia: "",
      observaciones: "",
    },
  });

  const { data: factores = [], isLoading } = useQuery<FactorDesempenoSV[]>({
    queryKey: ["/api/factores-desempeno-sv"],
  });

  const estadisticas: SPFStatistics = {
    total: factores.length,
    porCategoria: factores.reduce((acc, f) => {
      acc[f.categoria] = (acc[f.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    porTendencia: factores.reduce((acc, f) => {
      if (f.tendencia) {
        acc[f.tendencia] = (acc[f.tendencia] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  const generateNextCode = () => {
    const existingCodes = factores.map(f => f.codigo);
    let nextNumber = 1;
    while (existingCodes.includes(`SPF-${String(nextNumber).padStart(3, '0')}`)) {
      nextNumber++;
    }
    return `SPF-${String(nextNumber).padStart(3, '0')}`;
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/factores-desempeno-sv", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factores-desempeno-sv"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Factor de desempeño creado",
        description: "El factor SPF se ha registrado exitosamente",
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
      const res = await apiRequest("PATCH", `/api/factores-desempeno-sv/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factores-desempeno-sv"] });
      setDialogOpen(false);
      setEditingFactor(null);
      form.reset();
      toast({
        title: "Factor actualizado",
        description: "El factor SPF se ha actualizado exitosamente",
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
    mutationFn: async (factorId: string) => {
      await apiRequest("DELETE", `/api/factores-desempeno-sv/${factorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factores-desempeno-sv"] });
      setDeleteDialogOpen(false);
      setFactorToDelete(null);
      toast({
        title: "Factor eliminado",
        description: "El factor SPF se ha eliminado exitosamente",
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

  const onSubmit = (values: FormValues) => {
    if (editingFactor) {
      updateMutation.mutate({ id: editingFactor.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEditClick = (factor: FactorDesempenoSV) => {
    setEditingFactor(factor);
    form.reset({
      codigo: factor.codigo,
      nombre: factor.nombre,
      descripcion: factor.descripcion || "",
      categoria: factor.categoria,
      elementoRelacionado: factor.elementoRelacionado || "",
      valorBase: factor.valorBase || "",
      valorActual: factor.valorActual || "",
      metaAnual: factor.metaAnual || "",
      unidadMedida: factor.unidadMedida || "",
      tendencia: factor.tendencia || "",
      observaciones: factor.observaciones || "",
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, factor: FactorDesempenoSV) => {
    e.stopPropagation();
    setFactorToDelete(factor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (factorToDelete) {
      deleteMutation.mutate(factorToDelete.id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingFactor(null);
      form.reset();
    }
    setDialogOpen(open);
  };

  const handleOpenNewDialog = () => {
    form.reset({
      codigo: generateNextCode(),
      nombre: "",
      descripcion: "",
      categoria: "exposicion_riesgo",
      elementoRelacionado: "",
      valorBase: "",
      valorActual: "",
      metaAnual: "",
      unidadMedida: "",
      tendencia: "",
      observaciones: "",
    });
    setDialogOpen(true);
  };

  const filteredFactores = factores.filter((factor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      factor.codigo.toLowerCase().includes(searchLower) ||
      factor.nombre.toLowerCase().includes(searchLower) ||
      (factor.descripcion?.toLowerCase().includes(searchLower) ?? false) ||
      (factor.elementoRelacionado?.toLowerCase().includes(searchLower) ?? false)
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

  const getTendenciaBadge = (tendencia: string | null) => {
    if (!tendencia) return null;
    const config = TENDENCIA_CONFIG[tendencia as keyof typeof TENDENCIA_CONFIG];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge className={config.className} data-testid={`badge-tendencia-${tendencia}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Factores de Desempeño de Seguridad Vial</h1>
          <p className="text-muted-foreground">
            ISO 39001:2012 - Factores SPF (Safety Performance Factors)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleOpenNewDialog} data-testid="button-agregar-factor">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Factor
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>{editingFactor ? "Editar Factor SPF" : "Nuevo Factor SPF"}</DialogTitle>
              <DialogDescription>
                {editingFactor 
                  ? "Modifique los datos del factor de desempeño según ISO 39001"
                  : "Registre un nuevo factor de desempeño de seguridad vial según ISO 39001"
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
                          <Input placeholder="SPF-001" {...field} data-testid="input-codigo" />
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
                      <FormLabel>Nombre del Factor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre descriptivo del factor" {...field} data-testid="input-nombre" />
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
                          placeholder="Descripción detallada del factor de desempeño" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-descripcion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="elementoRelacionado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Elemento Relacionado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-elemento-relacionado">
                            <SelectValue placeholder="Seleccionar elemento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sin_especificar">Sin especificar</SelectItem>
                          {ELEMENTOS_SUGERIDOS.map((elemento) => (
                            <SelectItem key={elemento} value={elemento}>
                              {elemento}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="valorBase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Base</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="0.00" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-valor-base" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valorActual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Actual</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="0.00" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-valor-actual" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="metaAnual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Anual</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="0.00" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-meta-anual" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unidadMedida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad de Medida</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="%, número, tasa, etc." 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-unidad-medida" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tendencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tendencia</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tendencia">
                              <SelectValue placeholder="Seleccionar tendencia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sin_especificar">Sin especificar</SelectItem>
                            {Object.entries(TENDENCIA_CONFIG).map(([key, config]) => (
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
                      : editingFactor ? "Actualizar" : "Guardar"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar factores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Factores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-factores">{estadisticas.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Exposición</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600" data-testid="text-exposicion">
              {estadisticas.porCategoria?.exposicion_riesgo || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultado Final</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600" data-testid="text-resultado-final">
              {estadisticas.porCategoria?.resultado_final || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultado Intermedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600" data-testid="text-resultado-intermedio">
              {estadisticas.porCategoria?.resultado_intermedio || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Intervención</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600" data-testid="text-intervencion">
              {estadisticas.porCategoria?.intervencion || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold" data-testid="text-lista-factores">Factores de Desempeño Registrados</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : filteredFactores.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-factores">
              {searchTerm ? "No se encontraron factores con ese criterio de búsqueda" : "No hay factores de desempeño registrados"}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={handleOpenNewDialog}
                data-testid="button-crear-primer-factor"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer factor
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFactores.map((factor) => (
              <Card key={factor.id} className="hover-elevate" data-testid={`card-factor-${factor.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1">
                      {getCategoriaBadge(factor.categoria)}
                      {getTendenciaBadge(factor.tendencia)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClick(factor)}
                        data-testid={`button-edit-${factor.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(e, factor)}
                        data-testid={`button-delete-${factor.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    <span className="text-muted-foreground font-mono text-sm">{factor.codigo}</span>{" "}
                    {factor.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {factor.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{factor.descripcion}</p>
                  )}
                  
                  {factor.elementoRelacionado && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Elemento: </span>
                      <span className="font-medium">{factor.elementoRelacionado}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm pt-2 border-t">
                    {factor.valorBase && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Base:</span>
                        <span className="font-medium">{factor.valorBase}</span>
                      </div>
                    )}
                    {factor.valorActual && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-bold">{factor.valorActual}</span>
                      </div>
                    )}
                    {factor.metaAnual && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Meta:</span>
                        <span className="font-medium text-green-600">{factor.metaAnual}</span>
                      </div>
                    )}
                    {factor.unidadMedida && (
                      <Badge variant="outline" className="text-xs">
                        {factor.unidadMedida}
                      </Badge>
                    )}
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
            <AlertDialogTitle>¿Eliminar factor de desempeño?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el factor{" "}
              <strong>{factorToDelete?.codigo} - {factorToDelete?.nombre}</strong>.
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
