import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Edit, TrendingUp, TrendingDown, Minus, Target, Activity, Shield, AlertTriangle, FileDown, Sparkles, Loader2, Wand2, ArrowLeft } from "lucide-react";
import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FactorDesempenoSV, insertFactorDesempenoSVSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
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

interface FactorPredefinido {
  nombre: string;
  descripcion: string;
  categoria: "exposicion_riesgo" | "resultado_final" | "resultado_intermedio" | "intervencion";
  elementoRelacionado: string;
  unidadMedida: string;
  metaAnual: string;
  valorBase: string;
}

const FACTORES_PREDEFINIDOS: FactorPredefinido[] = [
  {
    nombre: "Kilómetros recorridos por la flota",
    descripcion: "Total de kilómetros recorridos por todos los vehículos de la empresa en el período. Factor clave de exposición según ISO 39001:2012 Cláusula 6.3.",
    categoria: "exposicion_riesgo",
    elementoRelacionado: "Vehículo",
    unidadMedida: "km",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Horas de conducción acumuladas",
    descripcion: "Total de horas de conducción de todos los conductores en el período. Mide la exposición temporal al riesgo vial.",
    categoria: "exposicion_riesgo",
    elementoRelacionado: "Conductor",
    unidadMedida: "horas",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Número de viajes realizados",
    descripcion: "Cantidad total de desplazamientos realizados por la flota vehicular en el período de medición.",
    categoria: "exposicion_riesgo",
    elementoRelacionado: "Vehículo",
    unidadMedida: "viajes",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Número de conductores activos",
    descripcion: "Cantidad de conductores que realizan desplazamientos laborales de forma activa en el período.",
    categoria: "exposicion_riesgo",
    elementoRelacionado: "Conductor",
    unidadMedida: "personas",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Tasa de mortalidad vial",
    descripcion: "Número de fallecidos en siniestros viales por cada 100 millones de kilómetros recorridos. Indicador principal de resultado final ISO 39001.",
    categoria: "resultado_final",
    elementoRelacionado: "Conductor",
    unidadMedida: "por 100M km",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Número de siniestros viales con víctimas fatales",
    descripcion: "Cantidad de siniestros viales que resultaron en al menos una persona fallecida durante el período.",
    categoria: "resultado_final",
    elementoRelacionado: "Vehículo",
    unidadMedida: "siniestros",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Número de lesiones graves por siniestro vial",
    descripcion: "Cantidad de personas con lesiones graves (incapacidad > 30 días) resultantes de siniestros viales laborales.",
    categoria: "resultado_final",
    elementoRelacionado: "Conductor",
    unidadMedida: "lesiones",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Tasa de siniestralidad vial",
    descripcion: "Número total de siniestros viales por cada millón de kilómetros recorridos por la flota.",
    categoria: "resultado_intermedio",
    elementoRelacionado: "Vehículo",
    unidadMedida: "por 1M km",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Índice de infracciones de tránsito",
    descripcion: "Número de infracciones de tránsito por cada 100 conductores activos en el período.",
    categoria: "resultado_intermedio",
    elementoRelacionado: "Conductor",
    unidadMedida: "por 100 conductores",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Porcentaje de excesos de velocidad detectados",
    descripcion: "Proporción de viajes o tramos en los que se detectaron excesos de velocidad respecto al total monitoreado.",
    categoria: "resultado_intermedio",
    elementoRelacionado: "Conductor",
    unidadMedida: "%",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Tasa de siniestros con daños materiales",
    descripcion: "Número de siniestros viales con solo daños materiales (sin lesiones personales) por millón de kilómetros.",
    categoria: "resultado_intermedio",
    elementoRelacionado: "Vehículo",
    unidadMedida: "por 1M km",
    metaAnual: "0",
    valorBase: "0",
  },
  {
    nombre: "Porcentaje de uso de cinturón de seguridad",
    descripcion: "Proporción de conductores y pasajeros que utilizan correctamente el cinturón de seguridad durante los desplazamientos.",
    categoria: "intervencion",
    elementoRelacionado: "Conductor",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
  {
    nombre: "Cumplimiento del plan de mantenimiento vehicular",
    descripcion: "Porcentaje de mantenimientos preventivos realizados según el cronograma establecido para toda la flota.",
    categoria: "intervencion",
    elementoRelacionado: "Vehículo",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
  {
    nombre: "Cobertura de capacitación en seguridad vial",
    descripcion: "Porcentaje de conductores que completaron el programa de formación en seguridad vial en el período.",
    categoria: "intervencion",
    elementoRelacionado: "Conductor",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
  {
    nombre: "Cumplimiento de inspecciones preoperacionales",
    descripcion: "Porcentaje de inspecciones preoperacionales realizadas respecto al total programado para la flota.",
    categoria: "intervencion",
    elementoRelacionado: "Vehículo",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
  {
    nombre: "Porcentaje de vehículos con documentación vigente",
    descripcion: "Proporción de vehículos con SOAT, revisión técnico-mecánica y demás documentos al día.",
    categoria: "intervencion",
    elementoRelacionado: "Vehículo",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
  {
    nombre: "Cobertura de exámenes médicos ocupacionales para conductores",
    descripcion: "Porcentaje de conductores con exámenes médicos ocupacionales vigentes (aptitud para conducir).",
    categoria: "intervencion",
    elementoRelacionado: "Conductor",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
  {
    nombre: "Porcentaje de conductores con licencia vigente y categoría apropiada",
    descripcion: "Proporción de conductores que poseen licencia de conducción vigente y acorde al tipo de vehículo que operan.",
    categoria: "intervencion",
    elementoRelacionado: "Conductor",
    unidadMedida: "%",
    metaAnual: "100",
    valorBase: "0",
  },
];

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
  const [generatingAll, setGeneratingAll] = useState(false);
  const [confirmGenerateDialogOpen, setConfirmGenerateDialogOpen] = useState(false);

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

  const filteredFactoresEarly = factores.filter((factor) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      factor.codigo.toLowerCase().includes(searchLower) ||
      factor.nombre.toLowerCase().includes(searchLower) ||
      (factor.descripcion?.toLowerCase().includes(searchLower) ?? false) ||
      (factor.elementoRelacionado?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const estadisticas: SPFStatistics = {
    total: filteredFactoresEarly.length,
    porCategoria: filteredFactoresEarly.reduce((acc, f) => {
      acc[f.categoria] = (acc[f.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    porTendencia: filteredFactoresEarly.reduce((acc, f) => {
      if (f.tendencia) {
        acc[f.tendencia] = (acc[f.tendencia] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  const generateNextCode = (existingCodesOverride?: string[]) => {
    const existingCodes = existingCodesOverride || factores.map(f => f.codigo);
    let nextNumber = 1;
    while (existingCodes.includes(`SPF-${String(nextNumber).padStart(3, '0')}`)) {
      nextNumber++;
    }
    return `SPF-${String(nextNumber).padStart(3, '0')}`;
  };

  const getAvailablePredefinidos = useCallback(() => {
    const existingNames = new Set(factores.map(f => f.nombre.toLowerCase()));
    return FACTORES_PREDEFINIDOS.filter(fp => !existingNames.has(fp.nombre.toLowerCase()));
  }, [factores]);

  const handleSelectPredefinido = (nombreFactor: string) => {
    const factor = FACTORES_PREDEFINIDOS.find(fp => fp.nombre === nombreFactor);
    if (!factor) return;
    form.setValue("nombre", factor.nombre);
    form.setValue("descripcion", factor.descripcion);
    form.setValue("categoria", factor.categoria);
    form.setValue("elementoRelacionado", factor.elementoRelacionado);
    form.setValue("unidadMedida", factor.unidadMedida);
    form.setValue("metaAnual", factor.metaAnual);
    form.setValue("valorBase", factor.valorBase);
    form.setValue("valorActual", "0");
    form.setValue("tendencia", "estable");
  };

  const handleGenerateAllFactors = async () => {
    setConfirmGenerateDialogOpen(false);
    const available = getAvailablePredefinidos();
    if (available.length === 0) {
      toast({
        title: "Factores ya registrados",
        description: "Todos los factores estándar ISO 39001 ya están registrados.",
      });
      return;
    }
    setGeneratingAll(true);
    let created = 0;
    let errors = 0;
    try {
      const existingCodes = factores.map(f => f.codigo);
      for (const factor of available) {
        try {
          const code = generateNextCode(existingCodes);
          existingCodes.push(code);
          await apiRequest("POST", "/api/factores-desempeno-sv", {
            codigo: code,
            nombre: factor.nombre,
            descripcion: factor.descripcion,
            categoria: factor.categoria,
            elementoRelacionado: factor.elementoRelacionado,
            unidadMedida: factor.unidadMedida,
            metaAnual: factor.metaAnual,
            valorBase: factor.valorBase,
            valorActual: "0",
            tendencia: "estable",
            observaciones: "",
          });
          created++;
        } catch {
          errors++;
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/factores-desempeno-sv"] });
      if (errors === 0) {
        toast({
          title: "Factores generados",
          description: `Se crearon ${created} factores estándar ISO 39001 exitosamente.`,
          className: "bg-green-50 border-green-200",
        });
      } else {
        toast({
          title: "Generación parcial",
          description: `Se crearon ${created} factores. ${errors} no se pudieron crear.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      queryClient.invalidateQueries({ queryKey: ["/api/factores-desempeno-sv"] });
      toast({
        title: "Error al generar factores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingAll(false);
    }
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

  const filteredFactores = filteredFactoresEarly;

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

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex flex-wrap gap-2">
          <HelpVideoButton customRoute="/pesv/factores-desempeno" testId="button-help-video-pesv-factores" />
          <Link href="/pesv">
            <Button variant="outline" size="sm" data-testid="button-back-pesv-panel">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel PESV
            </Button>
          </Link>
          <BackToPesvEvaluationButton />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/factores-desempeno-sv/pdf', 'factores-desempeno-sv.pdf')}
            data-testid="button-download-factores-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmGenerateDialogOpen(true)}
            disabled={generatingAll || getAvailablePredefinidos().length === 0}
            data-testid="button-generar-todos-factores"
          >
            {generatingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {generatingAll 
              ? "Generando..." 
              : getAvailablePredefinidos().length === 0 
                ? "Todos generados" 
                : `Generar ${getAvailablePredefinidos().length} Factores ISO`
            }
          </Button>
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
                {!editingFactor && getAvailablePredefinidos().length > 0 && (
                  <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Auto-completar desde catálogo ISO 39001</span>
                    </div>
                    <Select onValueChange={handleSelectPredefinido}>
                      <SelectTrigger data-testid="select-factor-predefinido">
                        <SelectValue placeholder="Seleccionar factor predefinido para auto-completar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePredefinidos().map((fp) => (
                          <SelectItem key={fp.nombre} value={fp.nombre}>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                [{CATEGORIA_CONFIG[fp.categoria]?.label}]
                              </span>
                              {fp.nombre}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                          <Input placeholder="SPF-001" {...field} readOnly className="bg-muted" data-testid="input-codigo" />
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
        {searchTerm && (
          <p className="text-sm text-muted-foreground" data-testid="text-search-results">
            Mostrando <span className="font-semibold text-foreground">{filteredFactores.length}</span> de{" "}
            <span className="font-semibold text-foreground">{factores.length}</span> factores
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {searchTerm ? "Encontrados" : "Total Factores"}
            </CardTitle>
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

      <AlertDialog open={confirmGenerateDialogOpen} onOpenChange={setConfirmGenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generar factores estándar ISO 39001</AlertDialogTitle>
            <AlertDialogDescription>
              Se crearán automáticamente <strong>{getAvailablePredefinidos().length} factores de desempeño</strong> basados en el estándar ISO 39001:2012 (Cláusula 6.3). Incluye factores de exposición al riesgo, resultados finales, resultados intermedios e intervenciones. Los valores base se inicializarán en 0 y podrá editarlos después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-generate">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerateAllFactors}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-generate"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generar factores
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
