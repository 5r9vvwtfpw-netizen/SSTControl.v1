import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Search, Globe, Building2, Shield, TrendingUp, TrendingDown,
  Landmark, DollarSign, Users, Cpu, Leaf, Scale, Edit2, Trash2,
  Eye, FileText, CheckCircle2, Clock, AlertTriangle, Info, ListPlus, ArrowLeft, Bot
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  AnalisisContexto as AnalisisContextoType, insertAnalisisContextoSchema, 
  FactorContexto, insertFactorContextoSchema,
  Company, AccionMejoraContexto, insertAccionMejoraContextoSchema, User
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";

const normativaContexto = [
  {
    codigo: 'ISO-45001-4.1',
    norma: 'ISO 45001:2018',
    articulo: 'Cláusula 4.1',
    descripcion: 'Comprensión de la organización y de su contexto',
    requisitos: [
      'Determinar cuestiones externas e internas pertinentes',
      'Identificar factores que afectan el logro de resultados del SG-SST',
      'Considerar factores ambientales, sociales, económicos, políticos y tecnológicos',
      'Hacer seguimiento y revisión periódica del contexto'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.4',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.4',
    descripcion: 'Sistema de Gestión de la Seguridad y Salud en el Trabajo',
    requisitos: [
      'El SG-SST debe adaptarse al tamaño de la empresa',
      'Considerar características específicas de la empresa',
      'Considerar los peligros identificados',
      'Considerar los riesgos valorados'
    ],
    obligatorio: true
  }
];

const tiposFactorPESTEL = [
  { value: "politico", label: "Político", icon: Landmark, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "economico", label: "Económico", icon: DollarSign, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "social", label: "Social", icon: Users, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "tecnologico", label: "Tecnológico", icon: Cpu, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
  { value: "ambiental", label: "Ambiental", icon: Leaf, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { value: "legal", label: "Legal", icon: Scale, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
];

const estadosAnalisis = [
  { value: "borrador", label: "Borrador", icon: FileText },
  { value: "aprobado", label: "Aprobado", icon: CheckCircle2 },
  { value: "vigente", label: "Vigente", icon: Shield },
];

const estadosFactor = [
  { value: "identificado", label: "Identificado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "en_tratamiento", label: "En Tratamiento", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "controlado", label: "Controlado", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const nivelesImpacto = [
  { value: "alto", label: "Alto", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "medio", label: "Medio", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "bajo", label: "Bajo", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
];

const plantillasAnalisisContexto = [
  {
    id: "externo-general",
    titulo: "Análisis de Contexto Externo [YEAR]",
    descripcion: "Factores económicos, legales, tecnológicos y de mercado",
    tipoAnalisis: "externo",
  },
  {
    id: "interno-general",
    titulo: "Análisis de Contexto Interno [YEAR]",
    descripcion: "Recursos, procesos, cultura y capacidades organizacionales",
    tipoAnalisis: "interno",
  },
  {
    id: "pestel",
    titulo: "Análisis PESTEL [YEAR]",
    descripcion: "Factores Políticos, Económicos, Sociales, Tecnológicos, Ambientales y Legales",
    tipoAnalisis: "externo",
  },
  {
    id: "partes-interesadas",
    titulo: "Análisis de Partes Interesadas [YEAR]",
    descripcion: "Identificación y análisis de necesidades de grupos de interés",
    tipoAnalisis: "externo",
  },
  {
    id: "riesgos-oportunidades",
    titulo: "Análisis de Riesgos y Oportunidades [YEAR]",
    descripcion: "Identificación y evaluación de riesgos y oportunidades del negocio",
    tipoAnalisis: "interno",
  },
];

const analisisFormSchema = insertAnalisisContextoSchema.extend({
  companyId: z.string().optional(),
});

const factorFormSchema = insertFactorContextoSchema.extend({
  accionesRequeridas: z.string().optional(),
});

const accionMejoraFormSchema = insertAccionMejoraContextoSchema.extend({
  accion: z.string().min(1, "La acción es requerida"),
  descripcion: z.string().optional(),
  tipoFoda: z.enum(["fortaleza", "debilidad", "oportunidad", "amenaza"]),
  responsableId: z.string().optional().nullable(),
  fechaLimite: z.coerce.date().optional().nullable(),
  prioridad: z.enum(["alta", "media", "baja"]),
});

export default function AnalisisContexto() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  const [activeTab, setActiveTab] = useState("externo");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnalisis, setEditingAnalisis] = useState<AnalisisContextoType | null>(null);
  const [selectedAnalisisId, setSelectedAnalisisId] = useState<string | null>(null);
  const [factorDialogOpen, setFactorDialogOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<FactorContexto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [accionMejoraDialogOpen, setAccionMejoraDialogOpen] = useState(false);
  const [selectedFactorForAction, setSelectedFactorForAction] = useState<FactorContexto | null>(null);
  const [selectedAnalisisTemplate, setSelectedAnalisisTemplate] = useState<string>("");

  const form = useForm<z.infer<typeof analisisFormSchema>>({
    resolver: zodResolver(analisisFormSchema),
    defaultValues: {
      companyId: "",
      titulo: "",
      periodo: new Date().getFullYear().toString(),
      tipoAnalisis: "externo",
      fechaElaboracion: new Date(),
      fechaRevision: null,
      observaciones: "",
      estado: "borrador",
    },
  });

  const factorForm = useForm<z.infer<typeof factorFormSchema>>({
    resolver: zodResolver(factorFormSchema),
    defaultValues: {
      analisisContextoId: "",
      tipoFactor: "politico",
      descripcion: "",
      esFortaleza: 0,
      esDebilidad: 0,
      esOportunidad: 0,
      esAmenaza: 0,
      impactoSst: "",
      nivelImpacto: "medio",
      accionesRequeridas: "",
      estado: "identificado",
    },
  });

  const accionMejoraForm = useForm<z.infer<typeof accionMejoraFormSchema>>({
    resolver: zodResolver(accionMejoraFormSchema),
    defaultValues: {
      accion: "",
      descripcion: "",
      tipoFoda: "debilidad",
      responsableId: null,
      fechaLimite: null,
      prioridad: "media",
      hallazgoDescripcion: "",
      factorContextoId: null,
    },
  });

  const { data: analisis = [], isLoading } = useQuery<AnalisisContextoType[]>({
    queryKey: ["/api/analisis-contexto"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isAdmin,
  });

  const { data: currentCompany } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !isAdmin,
  });

  const { data: factores = [], isLoading: isLoadingFactores } = useQuery<FactorContexto[]>({
    queryKey: [`/api/analisis-contexto/${selectedAnalisisId}/factores`],
    enabled: !!selectedAnalisisId,
  });

  const { data: accionesMejora = [] } = useQuery<AccionMejoraContexto[]>({
    queryKey: ["/api/acciones-mejora-contexto"],
  });

  const { data: usuarios = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (dialogOpen && !editingAnalisis) {
      if (isAdmin && companies.length === 1) {
        form.setValue("companyId", companies[0].id);
      }
      if (!isAdmin && currentCompany) {
        form.setValue("companyId", currentCompany.id);
      }
    }
  }, [dialogOpen, editingAnalisis, isAdmin, companies, currentCompany, form]);

  useEffect(() => {
    if (selectedAnalisisTemplate && !editingAnalisis) {
      const plantilla = plantillasAnalisisContexto.find(p => p.id === selectedAnalisisTemplate);
      if (plantilla) {
        const periodo = form.getValues("periodo");
        const tituloConAnio = plantilla.titulo.replace("[YEAR]", periodo || new Date().getFullYear().toString());
        form.setValue("titulo", tituloConAnio);
        form.setValue("tipoAnalisis", plantilla.tipoAnalisis as "externo" | "interno");
      }
    }
  }, [selectedAnalisisTemplate, editingAnalisis, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof analisisFormSchema>) => {
      return apiRequest("POST", "/api/analisis-contexto", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analisis-contexto"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Análisis creado", description: "El análisis de contexto se ha creado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear el análisis.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof analisisFormSchema> }) => {
      return apiRequest("PATCH", `/api/analisis-contexto/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analisis-contexto"] });
      setDialogOpen(false);
      setEditingAnalisis(null);
      form.reset();
      toast({ title: "Análisis actualizado", description: "El análisis se ha actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar el análisis.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/analisis-contexto/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analisis-contexto"] });
      toast({ title: "Análisis eliminado", description: "El análisis se ha eliminado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar el análisis.", variant: "destructive" });
    },
  });

  const createFactorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof factorFormSchema>) => {
      const payload = {
        ...data,
        accionesRequeridas: data.accionesRequeridas 
          ? data.accionesRequeridas.split("\n").filter(Boolean) 
          : [],
      };
      return apiRequest("POST", `/api/analisis-contexto/${selectedAnalisisId}/factores`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/analisis-contexto/${selectedAnalisisId}/factores`] });
      setFactorDialogOpen(false);
      factorForm.reset();
      toast({ title: "Factor agregado", description: "El factor de contexto se ha agregado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo agregar el factor.", variant: "destructive" });
    },
  });

  const updateFactorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof factorFormSchema> }) => {
      const payload = {
        ...data,
        accionesRequeridas: data.accionesRequeridas 
          ? data.accionesRequeridas.split("\n").filter(Boolean) 
          : [],
      };
      return apiRequest("PATCH", `/api/factores-contexto/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/analisis-contexto/${selectedAnalisisId}/factores`] });
      setFactorDialogOpen(false);
      setEditingFactor(null);
      factorForm.reset();
      toast({ title: "Factor actualizado", description: "El factor se ha actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo actualizar el factor.", variant: "destructive" });
    },
  });

  const deleteFactorMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/factores-contexto/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/analisis-contexto/${selectedAnalisisId}/factores`] });
      toast({ title: "Factor eliminado", description: "El factor se ha eliminado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo eliminar el factor.", variant: "destructive" });
    },
  });

  const createAccionMejoraMutation = useMutation({
    mutationFn: async (data: z.infer<typeof accionMejoraFormSchema>) => {
      return apiRequest("POST", "/api/acciones-mejora-contexto", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-mejora-contexto"] });
      setAccionMejoraDialogOpen(false);
      setSelectedFactorForAction(null);
      accionMejoraForm.reset();
      toast({ title: "Acción creada", description: "La acción de mejora se ha creado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "No se pudo crear la acción de mejora.", variant: "destructive" });
    },
  });

  const filteredAnalisis = useMemo(() => {
    const tipoFiltro = activeTab as "externo" | "interno";
    return analisis
      .filter(a => a.tipoAnalisis === tipoFiltro)
      .filter(a => 
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.periodo.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [analisis, activeTab, searchTerm]);

  const selectedAnalisis = useMemo(() => {
    return analisis.find(a => a.id === selectedAnalisisId);
  }, [analisis, selectedAnalisisId]);

  const factoresPorTipo = useMemo(() => {
    const grouped: Record<string, FactorContexto[]> = {};
    tiposFactorPESTEL.forEach(t => grouped[t.value] = []);
    factores.forEach(f => {
      if (grouped[f.tipoFactor]) {
        grouped[f.tipoFactor].push(f);
      }
    });
    return grouped;
  }, [factores]);

  const matrizFODA = useMemo(() => {
    return {
      fortalezas: factores.filter(f => f.esFortaleza === 1),
      oportunidades: factores.filter(f => f.esOportunidad === 1),
      debilidades: factores.filter(f => f.esDebilidad === 1),
      amenazas: factores.filter(f => f.esAmenaza === 1),
    };
  }, [factores]);

  const getAccionesCountByFactor = (factorId: string) => {
    return accionesMejora.filter(a => a.factorContextoId === factorId).length;
  };

  const openAccionMejoraDialog = (factor: FactorContexto) => {
    setSelectedFactorForAction(factor);
    const tipoFoda = factor.esDebilidad === 1 ? "debilidad" : 
                     factor.esAmenaza === 1 ? "amenaza" : 
                     factor.esFortaleza === 1 ? "fortaleza" : "oportunidad";
    accionMejoraForm.reset({
      accion: "",
      descripcion: "",
      tipoFoda,
      responsableId: null,
      fechaLimite: null,
      prioridad: "media",
      hallazgoDescripcion: factor.descripcion,
      factorContextoId: factor.id,
    });
    setAccionMejoraDialogOpen(true);
  };

  const handleAccionMejoraSubmit = (data: z.infer<typeof accionMejoraFormSchema>) => {
    createAccionMejoraMutation.mutate(data);
  };

  const handleSubmit = (data: z.infer<typeof analisisFormSchema>) => {
    if (editingAnalisis) {
      updateMutation.mutate({ id: editingAnalisis.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFactorSubmit = (data: z.infer<typeof factorFormSchema>) => {
    const payload = {
      ...data,
      analisisContextoId: selectedAnalisisId!,
    };
    if (editingFactor) {
      updateFactorMutation.mutate({ id: editingFactor.id, data: payload });
    } else {
      createFactorMutation.mutate(payload);
    }
  };

  const openEditDialog = (item: AnalisisContextoType) => {
    setEditingAnalisis(item);
    form.reset({
      titulo: item.titulo,
      periodo: item.periodo,
      tipoAnalisis: item.tipoAnalisis as "externo" | "interno",
      fechaElaboracion: new Date(item.fechaElaboracion),
      fechaRevision: item.fechaRevision ? new Date(item.fechaRevision) : null,
      observaciones: item.observaciones || "",
      estado: item.estado,
    });
    setDialogOpen(true);
  };

  const openEditFactorDialog = (factor: FactorContexto) => {
    setEditingFactor(factor);
    factorForm.reset({
      analisisContextoId: factor.analisisContextoId,
      tipoFactor: factor.tipoFactor as any,
      descripcion: factor.descripcion,
      esFortaleza: factor.esFortaleza,
      esDebilidad: factor.esDebilidad,
      esOportunidad: factor.esOportunidad,
      esAmenaza: factor.esAmenaza,
      impactoSst: factor.impactoSst || "",
      nivelImpacto: factor.nivelImpacto,
      accionesRequeridas: factor.accionesRequeridas?.join("\n") || "",
      estado: factor.estado,
    });
    setFactorDialogOpen(true);
  };

  const openDetailView = (analisisId: string) => {
    setSelectedAnalisisId(analisisId);
    setDetailOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const estadoConfig = estadosAnalisis.find(e => e.value === estado);
    const Icon = estadoConfig?.icon || FileText;
    return (
      <Badge variant="outline" className="gap-1" data-testid={`badge-estado-${estado}`}>
        <Icon className="h-3 w-3" />
        {estadoConfig?.label || estado}
      </Badge>
    );
  };

  const getFactorEstadoBadge = (estado: string) => {
    const estadoConfig = estadosFactor.find(e => e.value === estado);
    return (
      <Badge className={estadoConfig?.color || ""} data-testid={`badge-factor-estado-${estado}`}>
        {estadoConfig?.label || estado}
      </Badge>
    );
  };

  const getImpactoBadge = (nivel: string) => {
    const nivelConfig = nivelesImpacto.find(n => n.value === nivel);
    return (
      <Badge className={nivelConfig?.color || ""} data-testid={`badge-impacto-${nivel}`}>
        {nivelConfig?.label || nivel}
      </Badge>
    );
  };

  const getTipoFactorConfig = (tipo: string) => {
    return tiposFactorPESTEL.find(t => t.value === tipo);
  };

  const searchString = useSearch();
  const fromEvaluation = searchString.includes("from=evaluation");

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-analisis-contexto">
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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Análisis de Contexto</h1>
          <p className="text-muted-foreground">
            ISO 45001:2018 - Cláusula 4.1: Comprensión de la organización y su contexto
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAnalisis(null);
            setSelectedAnalisisTemplate("");
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-nuevo-analisis">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Análisis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnalisis ? "Editar Análisis" : "Nuevo Análisis de Contexto"}</DialogTitle>
              <DialogDescription>
                {editingAnalisis 
                  ? "Modifica los datos del análisis de contexto."
                  : "Complete los datos para crear un nuevo análisis de contexto organizacional."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {isAdmin && companies.length > 1 && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Seleccione empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!editingAnalisis && (
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 mb-4">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <CardTitle className="text-base text-green-900 dark:text-green-100">Asistente de Análisis de Contexto</CardTitle>
                          <CardDescription className="text-green-700 dark:text-green-300">
                            Seleccione una plantilla predefinida para auto-completar el título del análisis
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedAnalisisTemplate} onValueChange={setSelectedAnalisisTemplate}>
                        <SelectTrigger className="bg-white dark:bg-gray-950" data-testid="select-analisis-template">
                          <SelectValue placeholder="Seleccione una plantilla predefinida..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {plantillasAnalisisContexto.map((plantilla) => (
                            <SelectItem key={plantilla.id} value={plantilla.id} data-testid={`template-option-${plantilla.id}`}>
                              <div className="flex flex-col">
                                <span>{plantilla.titulo.replace("[YEAR]", new Date().getFullYear().toString())}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Análisis</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Análisis de Contexto Externo 2025" 
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
                    name="periodo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: 2025 o 2025-2026" 
                            {...field} 
                            data-testid="input-periodo"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipoAnalisis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Análisis</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tipo-analisis">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="externo">
                              <span className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Externo
                              </span>
                            </SelectItem>
                            <SelectItem value="interno">
                              <span className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Interno
                              </span>
                            </SelectItem>
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
                    name="fechaElaboracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Elaboración</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-fecha-elaboracion"
                          />
                        </FormControl>
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
                              <SelectValue placeholder="Seleccione estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estadosAnalisis.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                <span className="flex items-center gap-2">
                                  <estado.icon className="h-4 w-4" />
                                  {estado.label}
                                </span>
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
                          placeholder="Observaciones adicionales sobre el análisis..." 
                          {...field} 
                          value={field.value || ""}
                          data-testid="textarea-observaciones"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancelar">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-guardar"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card data-testid="card-normativa">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Normativa Aplicable
          </CardTitle>
          <CardDescription>
            Requisitos normativos para el análisis de contexto organizacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {normativaContexto.map((norma) => (
              <Card key={norma.codigo} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="outline">{norma.codigo}</Badge>
                    {norma.obligatorio && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{norma.norma} - {norma.articulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{norma.descripcion}</p>
                  <ul className="text-sm space-y-1">
                    {norma.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar análisis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="externo" className="gap-2" data-testid="tab-externo">
            <Globe className="h-4 w-4" />
            Análisis Externo
          </TabsTrigger>
          <TabsTrigger value="interno" className="gap-2" data-testid="tab-interno">
            <Building2 className="h-4 w-4" />
            Análisis Interno
          </TabsTrigger>
        </TabsList>

        <TabsContent value="externo" className="mt-4">
          <AnalisisListCard
            analisis={filteredAnalisis}
            isLoading={isLoading}
            onView={openDetailView}
            onEdit={openEditDialog}
            onDelete={(id) => deleteMutation.mutate(id)}
            getEstadoBadge={getEstadoBadge}
            tipoLabel="Externo"
          />
        </TabsContent>

        <TabsContent value="interno" className="mt-4">
          <AnalisisListCard
            analisis={filteredAnalisis}
            isLoading={isLoading}
            onView={openDetailView}
            onEdit={openEditDialog}
            onDelete={(id) => deleteMutation.mutate(id)}
            getEstadoBadge={getEstadoBadge}
            tipoLabel="Interno"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) {
          setSelectedAnalisisId(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnalisis?.tipoAnalisis === "externo" ? (
                <Globe className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
              {selectedAnalisis?.titulo}
            </DialogTitle>
            <DialogDescription>
              Período: {selectedAnalisis?.periodo} | {getEstadoBadge(selectedAnalisis?.estado || "borrador")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Factores PESTEL</h3>
              <Button onClick={() => {
                factorForm.reset({
                  analisisContextoId: selectedAnalisisId!,
                  tipoFactor: "politico",
                  descripcion: "",
                  esFortaleza: 0,
                  esDebilidad: 0,
                  esOportunidad: 0,
                  esAmenaza: 0,
                  impactoSst: "",
                  nivelImpacto: "medio",
                  accionesRequeridas: "",
                  estado: "identificado",
                });
                setFactorDialogOpen(true);
              }} data-testid="button-agregar-factor">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Factor
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tiposFactorPESTEL.map((tipo) => {
                const Icon = tipo.icon;
                const factoresTipo = factoresPorTipo[tipo.value] || [];
                return (
                  <Card key={tipo.value} data-testid={`card-pestel-${tipo.value}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className={`p-1.5 rounded ${tipo.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {tipo.label}
                        <Badge variant="secondary" className="ml-auto">
                          {factoresTipo.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {factoresTipo.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Sin factores identificados</p>
                      ) : (
                        <div className="space-y-2">
                          {factoresTipo.map((factor) => (
                            <div 
                              key={factor.id} 
                              className="p-2 rounded-md border hover-elevate cursor-pointer"
                              onClick={() => openEditFactorDialog(factor)}
                              data-testid={`factor-item-${factor.id}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm flex-1">{factor.descripcion}</p>
                                {getImpactoBadge(factor.nivelImpacto)}
                              </div>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {factor.esFortaleza === 1 && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">F</Badge>
                                )}
                                {factor.esOportunidad === 1 && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">O</Badge>
                                )}
                                {factor.esDebilidad === 1 && (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs">D</Badge>
                                )}
                                {factor.esAmenaza === 1 && (
                                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">A</Badge>
                                )}
                                <span className="ml-auto">{getFactorEstadoBadge(factor.estado)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card data-testid="card-matriz-foda">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Matriz FODA
                </CardTitle>
                <CardDescription>
                  Clasificación de factores según Fortalezas, Oportunidades, Debilidades y Amenazas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FODAQuadrant
                    title="Fortalezas"
                    items={matrizFODA.fortalezas}
                    icon={TrendingUp}
                    bgColor="bg-green-50 dark:bg-green-950/20"
                    borderColor="border-green-500"
                    textColor="text-green-700 dark:text-green-300"
                    onEdit={openEditFactorDialog}
                    getAccionesCount={getAccionesCountByFactor}
                  />
                  <FODAQuadrant
                    title="Oportunidades"
                    items={matrizFODA.oportunidades}
                    icon={TrendingUp}
                    bgColor="bg-blue-50 dark:bg-blue-950/20"
                    borderColor="border-blue-500"
                    textColor="text-blue-700 dark:text-blue-300"
                    onEdit={openEditFactorDialog}
                    getAccionesCount={getAccionesCountByFactor}
                  />
                  <FODAQuadrant
                    title="Debilidades"
                    items={matrizFODA.debilidades}
                    icon={TrendingDown}
                    bgColor="bg-yellow-50 dark:bg-yellow-950/20"
                    borderColor="border-yellow-500"
                    textColor="text-yellow-700 dark:text-yellow-300"
                    onEdit={openEditFactorDialog}
                    showActionButton={true}
                    onCreateAction={openAccionMejoraDialog}
                    getAccionesCount={getAccionesCountByFactor}
                  />
                  <FODAQuadrant
                    title="Amenazas"
                    items={matrizFODA.amenazas}
                    icon={AlertTriangle}
                    bgColor="bg-red-50 dark:bg-red-950/20"
                    borderColor="border-red-500"
                    textColor="text-red-700 dark:text-red-300"
                    onEdit={openEditFactorDialog}
                    showActionButton={true}
                    onCreateAction={openAccionMejoraDialog}
                    getAccionesCount={getAccionesCountByFactor}
                  />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-indicadores-impacto">
              <CardHeader>
                <CardTitle>Indicadores de Impacto en SST</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {factores.filter(f => f.nivelImpacto === "alto").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Impacto Alto</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {factores.filter(f => f.nivelImpacto === "medio").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Impacto Medio</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {factores.filter(f => f.nivelImpacto === "bajo").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Impacto Bajo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={factorDialogOpen} onOpenChange={(open) => {
        setFactorDialogOpen(open);
        if (!open) {
          setEditingFactor(null);
          factorForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFactor ? "Editar Factor" : "Agregar Factor de Contexto"}</DialogTitle>
            <DialogDescription>
              {editingFactor 
                ? "Modifique los datos del factor de contexto."
                : "Complete los datos del factor identificado en el análisis PESTEL."
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...factorForm}>
            <form onSubmit={factorForm.handleSubmit(handleFactorSubmit)} className="space-y-4">
              <FormField
                control={factorForm.control}
                name="tipoFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Factor (PESTEL)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-factor">
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposFactorPESTEL.map((tipo) => {
                          const Icon = tipo.icon;
                          return (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              <span className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {tipo.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={factorForm.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Factor</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa el factor identificado..." 
                        {...field}
                        data-testid="textarea-descripcion-factor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Clasificación FODA</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={factorForm.control}
                    name="esFortaleza"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="checkbox-fortaleza"
                          />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">F</Badge>
                          Fortaleza
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={factorForm.control}
                    name="esOportunidad"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="checkbox-oportunidad"
                          />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">O</Badge>
                          Oportunidad
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={factorForm.control}
                    name="esDebilidad"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="checkbox-debilidad"
                          />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">D</Badge>
                          Debilidad
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={factorForm.control}
                    name="esAmenaza"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="checkbox-amenaza"
                          />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">A</Badge>
                          Amenaza
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={factorForm.control}
                name="impactoSst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto en SST</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa cómo este factor afecta al Sistema de Gestión de SST..." 
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-impacto-sst"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={factorForm.control}
                  name="nivelImpacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Impacto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-nivel-impacto">
                            <SelectValue placeholder="Seleccione nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nivelesImpacto.map((nivel) => (
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

                <FormField
                  control={factorForm.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado-factor">
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosFactor.map((estado) => (
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

              <FormField
                control={factorForm.control}
                name="accionesRequeridas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acciones Requeridas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Una acción por línea..." 
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-acciones"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                {editingFactor && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => {
                      deleteFactorMutation.mutate(editingFactor.id);
                      setFactorDialogOpen(false);
                    }}
                    data-testid="button-eliminar-factor"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setFactorDialogOpen(false)} data-testid="button-cancelar-factor">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFactorMutation.isPending || updateFactorMutation.isPending}
                  data-testid="button-guardar-factor"
                >
                  {createFactorMutation.isPending || updateFactorMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear acción de mejora desde factor FODA */}
      <Dialog open={accionMejoraDialogOpen} onOpenChange={setAccionMejoraDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListPlus className="h-5 w-5" />
              Nueva Acción de Mejora
            </DialogTitle>
            <DialogDescription>
              Crear una acción de mejora vinculada al factor identificado en el análisis FODA.
            </DialogDescription>
          </DialogHeader>
          <Form {...accionMejoraForm}>
            <form onSubmit={accionMejoraForm.handleSubmit(handleAccionMejoraSubmit)} className="space-y-4">
              {selectedFactorForAction && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="font-medium text-muted-foreground mb-1">Factor origen:</div>
                  <div>{selectedFactorForAction.descripcion}</div>
                </div>
              )}

              <FormField
                control={accionMejoraForm.control}
                name="accion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acción de Mejora *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa la acción a implementar..." 
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-accion-mejora"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accionMejoraForm.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción adicional</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalles adicionales..." 
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-descripcion-accion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={accionMejoraForm.control}
                  name="prioridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "media"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-prioridad-accion">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accionMejoraForm.control}
                  name="responsableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-responsable-accion">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usuarios?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName || user.username}
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
                control={accionMejoraForm.control}
                name="fechaLimite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Límite</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        data-testid="input-fecha-limite-accion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setAccionMejoraDialogOpen(false)} data-testid="button-cancelar-accion">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAccionMejoraMutation.isPending}
                  data-testid="button-guardar-accion"
                >
                  {createAccionMejoraMutation.isPending ? "Guardando..." : "Crear Acción"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AnalisisListCardProps {
  analisis: AnalisisContextoType[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (item: AnalisisContextoType) => void;
  onDelete: (id: string) => void;
  getEstadoBadge: (estado: string) => JSX.Element;
  tipoLabel: string;
}

function AnalisisListCard({ analisis, isLoading, onView, onEdit, onDelete, getEstadoBadge, tipoLabel }: AnalisisListCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Cargando análisis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analisis.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No hay análisis de contexto {tipoLabel.toLowerCase()} registrados.</p>
            <p className="text-sm mt-2">Haga clic en "Nuevo Análisis" para comenzar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Fecha Elaboración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analisis.map((item) => (
              <TableRow key={item.id} data-testid={`row-analisis-${item.id}`}>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>{item.periodo}</TableCell>
                <TableCell>
                  {new Date(item.fechaElaboracion).toLocaleDateString('es-CO')}
                </TableCell>
                <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onView(item.id)}
                      data-testid={`button-ver-${item.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onEdit(item)}
                      data-testid={`button-editar-${item.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDelete(item.id)}
                      data-testid={`button-eliminar-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface FODAQuadrantProps {
  title: string;
  items: FactorContexto[];
  icon: any;
  bgColor: string;
  borderColor: string;
  textColor: string;
  onEdit: (factor: FactorContexto) => void;
  showActionButton?: boolean;
  onCreateAction?: (factor: FactorContexto) => void;
  getAccionesCount?: (factorId: string) => number;
}

function FODAQuadrant({ title, items, icon: Icon, bgColor, borderColor, textColor, onEdit, showActionButton = false, onCreateAction, getAccionesCount }: FODAQuadrantProps) {
  return (
    <div className={`p-4 rounded-lg border-2 ${bgColor} ${borderColor}`} data-testid={`quadrant-${title.toLowerCase()}`}>
      <h4 className={`font-semibold flex items-center gap-2 mb-3 ${textColor}`}>
        <Icon className="h-4 w-4" />
        {title}
        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Sin elementos</p>
      ) : (
        <ul className="space-y-2">
          {items.map((factor) => {
            const accionesCount = getAccionesCount?.(factor.id) || 0;
            return (
              <li 
                key={factor.id} 
                className="text-sm p-2 bg-background/50 rounded"
                data-testid={`foda-item-${factor.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span 
                    className="flex-1 cursor-pointer hover:underline"
                    onClick={() => onEdit(factor)}
                  >
                    {factor.descripcion}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {accionesCount > 0 && (
                      <Badge variant="outline" className="text-xs" data-testid={`badge-acciones-${factor.id}`}>
                        {accionesCount} {accionesCount === 1 ? "acción" : "acciones"}
                      </Badge>
                    )}
                    {showActionButton && onCreateAction && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateAction(factor);
                            }}
                            data-testid={`button-crear-accion-${factor.id}`}
                          >
                            <ListPlus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Crear acción de mejora</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
