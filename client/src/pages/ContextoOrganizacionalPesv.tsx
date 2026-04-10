import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Edit, Building, Globe, Shield, TrendingUp, Users, Settings, Scale, BarChart, Calendar, AlertTriangle, FileDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContextoOrganizacionalPesv as ContextoOrgPesvType, insertContextoOrganizacionalPesvSchema, EvaluacionPesv } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { z } from "zod";

const CATEGORIAS_INTERNAS = [
  { value: "cultura", label: "Cultura Organizacional", icon: Users },
  { value: "estructura", label: "Estructura Organizacional", icon: Building },
  { value: "recursos", label: "Recursos", icon: Scale },
  { value: "tecnologia", label: "Tecnología", icon: Settings },
  { value: "procesos", label: "Procesos", icon: BarChart },
];

const CATEGORIAS_EXTERNAS = [
  { value: "legal", label: "Legal y Normativo", icon: Scale },
  { value: "politico", label: "Político", icon: Building },
  { value: "economico", label: "Económico", icon: TrendingUp },
  { value: "social", label: "Social", icon: Users },
  { value: "tecnologico", label: "Tecnológico", icon: Settings },
  { value: "ambiental", label: "Ambiental", icon: Globe },
  { value: "competencia", label: "Competencia", icon: BarChart },
];

const NIVELES_IMPACTO = [
  { value: "alto", label: "Alto", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { value: "medio", label: "Medio", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  { value: "bajo", label: "Bajo", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
];

const formSchema = insertContextoOrganizacionalPesvSchema.extend({
  tipoFactor: z.enum(["interno", "externo"]),
  nombre: z.string().min(1, "El nombre es requerido"),
  categoria: z.string().min(1, "La categoría es requerida"),
  nivelImpacto: z.enum(["alto", "medio", "bajo"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContextoOrganizacionalPesv() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [factorToDelete, setFactorToDelete] = useState<ContextoOrgPesvType | null>(null);
  const [editingFactor, setEditingFactor] = useState<ContextoOrgPesvType | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoFactor: "interno",
      nombre: "",
      descripcion: "",
      categoria: "",
      impactoSeguridad: "",
      nivelImpacto: undefined,
      fechaIdentificacion: undefined,
      fechaRevision: undefined,
      evaluacionPesvId: undefined,
      activo: 1,
    },
  });

  const tipoFactorValue = form.watch("tipoFactor");

  const { data: factores = [], isLoading } = useQuery<ContextoOrgPesvType[]>({
    queryKey: ["/api/contexto-organizacional-pesv"],
  });

  const { data: evaluaciones = [] } = useQuery<EvaluacionPesv[]>({
    queryKey: ["/api/evaluaciones-pesv"],
  });

  const statistics = useMemo(() => {
    const total = factores.length;
    const internos = factores.filter(f => f.tipoFactor === "interno").length;
    const externos = factores.filter(f => f.tipoFactor === "externo").length;
    const altoImpacto = factores.filter(f => f.nivelImpacto === "alto").length;
    return { total, internos, externos, altoImpacto };
  }, [factores]);

  const filteredFactores = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return factores.filter((factor) => 
      factor.nombre.toLowerCase().includes(searchLower) ||
      factor.descripcion?.toLowerCase().includes(searchLower) ||
      factor.categoria?.toLowerCase().includes(searchLower)
    );
  }, [factores, searchTerm]);

  const factoresInternos = useMemo(() => 
    filteredFactores.filter(f => f.tipoFactor === "interno"),
    [filteredFactores]
  );

  const factoresExternos = useMemo(() => 
    filteredFactores.filter(f => f.tipoFactor === "externo"),
    [filteredFactores]
  );

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/contexto-organizacional-pesv", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contexto-organizacional-pesv"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Factor creado",
        description: "El factor de contexto organizacional se ha creado exitosamente",
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
      const res = await apiRequest("PATCH", `/api/contexto-organizacional-pesv/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contexto-organizacional-pesv"] });
      setDialogOpen(false);
      setEditingFactor(null);
      form.reset();
      toast({
        title: "Factor actualizado",
        description: "El factor de contexto organizacional se ha actualizado exitosamente",
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
      const res = await apiRequest("DELETE", `/api/contexto-organizacional-pesv/${factorId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contexto-organizacional-pesv"] });
      setDeleteDialogOpen(false);
      setFactorToDelete(null);
      toast({
        title: "Factor eliminado",
        description: "El factor de contexto organizacional se ha eliminado exitosamente",
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

  const handleEdit = (factor: ContextoOrgPesvType) => {
    setEditingFactor(factor);
    form.reset({
      tipoFactor: factor.tipoFactor as "interno" | "externo",
      nombre: factor.nombre,
      descripcion: factor.descripcion || "",
      categoria: factor.categoria || "",
      impactoSeguridad: factor.impactoSeguridad || "",
      nivelImpacto: (factor.nivelImpacto as "alto" | "medio" | "bajo") || undefined,
      fechaIdentificacion: factor.fechaIdentificacion || undefined,
      fechaRevision: factor.fechaRevision || undefined,
      evaluacionPesvId: factor.evaluacionPesvId || undefined,
      activo: factor.activo,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (factor: ContextoOrgPesvType) => {
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

  const getCategoriaLabel = (categoria: string | null, tipoFactor: string) => {
    if (!categoria) return "Sin categoría";
    const categorias = tipoFactor === "interno" ? CATEGORIAS_INTERNAS : CATEGORIAS_EXTERNAS;
    return categorias.find(c => c.value === categoria)?.label || categoria;
  };

  const getCategoriaIcon = (categoria: string | null, tipoFactor: string) => {
    if (!categoria) return Settings;
    const categorias = tipoFactor === "interno" ? CATEGORIAS_INTERNAS : CATEGORIAS_EXTERNAS;
    return categorias.find(c => c.value === categoria)?.icon || Settings;
  };

  const getNivelImpactoBadge = (nivel: string | null) => {
    const config = NIVELES_IMPACTO.find(n => n.value === nivel) || { label: nivel || "Sin definir", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" };
    return (
      <Badge className={config.className} data-testid={`badge-nivel-impacto-${nivel}`}>
        {config.label}
      </Badge>
    );
  };

  const renderFactorCard = (factor: ContextoOrgPesvType) => {
    const CategoriaIcon = getCategoriaIcon(factor.categoria, factor.tipoFactor);
    const isInterno = factor.tipoFactor === "interno";
    
    return (
      <Card 
        key={factor.id} 
        className="hover-elevate"
        data-testid={`card-factor-${factor.id}`}
      >
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                className={isInterno 
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" 
                  : "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                }
                data-testid={`badge-tipo-${factor.tipoFactor}`}
              >
                {isInterno ? <Building className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                {isInterno ? "Interno" : "Externo"}
              </Badge>
              <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
                <CategoriaIcon className="h-3 w-3 mr-1" />
                {getCategoriaLabel(factor.categoria, factor.tipoFactor)}
              </Badge>
              {factor.nivelImpacto && getNivelImpactoBadge(factor.nivelImpacto)}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(factor)}
                data-testid={`button-edit-factor-${factor.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(factor)}
                data-testid={`button-delete-factor-${factor.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-lg" data-testid={`text-factor-nombre-${factor.id}`}>
            {factor.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {factor.descripcion && (
            <p className="text-sm text-muted-foreground" data-testid={`text-factor-descripcion-${factor.id}`}>
              {factor.descripcion}
            </p>
          )}
          {factor.impactoSeguridad && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
              <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-muted-foreground">Impacto en Seguridad Vial:</span>
                <p className="text-sm" data-testid={`text-factor-impacto-${factor.id}`}>
                  {factor.impactoSeguridad}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {factor.fechaIdentificacion && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Identificado: {new Date(factor.fechaIdentificacion).toLocaleDateString('es-CO')}</span>
              </div>
            )}
            {factor.fechaRevision && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Revisión: {new Date(factor.fechaRevision).toLocaleDateString('es-CO')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Contexto Organizacional PESV
          </h1>
          <p className="text-muted-foreground">
            ISO 31000:2018 (Cláusula 5.4) - PESV Resolución 40595/2022
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BackToPesvEvaluationButton />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/contexto-organizacional-pesv/pdf', 'contexto-organizacional-pesv.pdf')}
            data-testid="button-download-contexto-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-agregar-factor"
                onClick={() => {
                  setEditingFactor(null);
                  form.reset({
                    tipoFactor: "interno",
                    nombre: "",
                    descripcion: "",
                    categoria: "",
                    impactoSeguridad: "",
                    nivelImpacto: undefined,
                    fechaIdentificacion: undefined,
                    fechaRevision: undefined,
                    evaluacionPesvId: undefined,
                    activo: 1,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Factor
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFactor ? "Editar Factor de Contexto" : "Nuevo Factor de Contexto"}
              </DialogTitle>
              <DialogDescription>
                {editingFactor 
                  ? "Modifique los datos del factor de contexto organizacional"
                  : "Agregue un nuevo factor de contexto organizacional según ISO 31000:2018"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipoFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Factor *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("categoria", "");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-factor">
                            <SelectValue placeholder="Seleccione tipo de factor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="interno">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Interno
                            </div>
                          </SelectItem>
                          <SelectItem value="externo">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Externo
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Factores internos (cultura, estructura) o externos (legal, económico)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Factor *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Política de seguridad vial corporativa"
                          {...field}
                          data-testid="input-nombre"
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
                          placeholder="Describa el factor de contexto..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-descripcion"
                        />
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
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-categoria">
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(tipoFactorValue === "interno" ? CATEGORIAS_INTERNAS : CATEGORIAS_EXTERNAS).map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
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
                  name="impactoSeguridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impacto en Seguridad Vial</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¿Cómo afecta este factor a la seguridad vial de la organización?"
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-impacto-seguridad"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nivelImpacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Impacto</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-nivel-impacto">
                            <SelectValue placeholder="Seleccione nivel de impacto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NIVELES_IMPACTO.map((nivel) => (
                            <SelectItem key={nivel.value} value={nivel.value}>
                              {nivel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaIdentificacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Identificación</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-fecha-identificacion"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaRevision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Próxima Revisión</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-fecha-revision"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="evaluacionPesvId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaluación PESV Relacionada</FormLabel>
                      <Select 
                        value={field.value || "none"} 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-evaluacion-pesv">
                            <SelectValue placeholder="Opcional: vincular a evaluación PESV" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin vincular</SelectItem>
                          {evaluaciones.map((evaluacion) => (
                            <SelectItem key={evaluacion.id} value={evaluacion.id}>
                              {evaluacion.anio} - {evaluacion.nivel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Vincule este factor a una evaluación PESV específica (opcional)
                      </FormDescription>
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
                    {(createMutation.isPending || updateMutation.isPending) ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Factores</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total">
              {statistics.total}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-internos">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Factores Internos</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-stat-internos">
              {statistics.internos}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-externos">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Factores Externos</CardTitle>
            <Globe className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-stat-externos">
              {statistics.externos}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-alto-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Alto Impacto</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-stat-alto-impacto">
              {statistics.altoImpacto}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar factores por nombre, descripción o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold" data-testid="text-header-internos">
              Factores Internos
            </h2>
            <Badge variant="secondary">{factoresInternos.length}</Badge>
          </div>
          {factoresInternos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No hay factores internos registrados
                </p>
                <p className="text-sm text-muted-foreground">
                  Agregue factores como cultura, estructura, recursos, tecnología o procesos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {factoresInternos.map(renderFactorCard)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold" data-testid="text-header-externos">
              Factores Externos
            </h2>
            <Badge variant="secondary">{factoresExternos.length}</Badge>
          </div>
          {factoresExternos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No hay factores externos registrados
                </p>
                <p className="text-sm text-muted-foreground">
                  Agregue factores como legal, político, económico, social, tecnológico, ambiental o competencia
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {factoresExternos.map(renderFactorCard)}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar factor de contexto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el factor 
              "{factorToDelete?.nombre}" del contexto organizacional.
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
