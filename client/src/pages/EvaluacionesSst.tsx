import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, AlertTriangle, CheckCircle2, FileCheck, Download, Lock, Trash2, AlertCircle, Wrench, RefreshCw, Monitor, Shield, UserCheck, Building2, ChevronRight, ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluacionSst, insertEvaluacionSstSchema, Worker, ResponsibleDesignation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { AutomationAssistant, PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { TrialVerificationBannerAuto } from "@/components/TrialGate";

// Función para calcular tipo de empresa según Resolución 0312/2019
// IMPORTANTE: Se basa EXCLUSIVAMENTE en numberOfWorkers y riskLevel de la empresa
// NO en el plan de suscripción (el plan solo afecta facturación)
// 
// Artículo 9: ≤10 trabajadores AND riesgo I/II/III → Capítulo I (7 estándares)
// Artículo 10: 11-50 trabajadores AND riesgo I/II/III → Capítulo II (21 estándares)
// Artículo 11: >50 trabajadores OR riesgo IV/V → Capítulo III (62 estándares)
function calculateTipoEmpresa(numberOfWorkers: number, riskLevel: string): "tipo1" | "tipo2" | "tipo3" {
  const isHighRisk = riskLevel === "IV" || riskLevel === "V";
  
  // Capítulo III: >50 trabajadores OR cualquier cantidad con riesgo IV/V
  if (numberOfWorkers > 50 || isHighRisk) {
    return "tipo3";
  }
  
  // Capítulo II: 11-50 trabajadores con riesgo I/II/III
  if (numberOfWorkers >= 11 && numberOfWorkers <= 50) {
    return "tipo2";
  }
  
  // Capítulo I: ≤10 trabajadores con riesgo I/II/III
  return "tipo1";
}

// Etiquetas de tipo de empresa según Resolución 0312/2019
const tipoEmpresaLabels: Record<string, string> = {
  tipo1: "7 estándares (≤10 trabajadores, riesgo I-III)",
  tipo2: "21 estándares (11-50 trabajadores, riesgo I-III)",
  tipo3: "61 estándares (>50 trabajadores ó riesgo IV-V)",
};

// Form schema - companyId is determined by logged-in user or selected by admin
// For admin users, companyId is required; for non-admin, it's automatically set
const createFormSchema = (isAdmin: boolean) => {
  const baseSchema = insertEvaluacionSstSchema.omit({ 
    puntajeTotal: true,
    porcentajeCumplimiento: true,
    nivelCumplimiento: true,
    puntajesPorComponente: true
  }).extend({
    elaboradoPorId: z.string().optional(),
    autorizadoPorId: z.string().optional(),
    aprobadoPorId: z.string().optional(),
  });
  
  if (isAdmin) {
    return baseSchema.extend({
      companyId: z.string().min(1, "Debe seleccionar una empresa"),
    });
  } else {
    return baseSchema.extend({
      companyId: z.string().optional(),
    });
  }
};

export default function EvaluacionesSst() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluacionToDelete, setEvaluacionToDelete] = useState<EvaluacionSst | null>(null);
  const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState("");
  const [deleteConfirmAnio, setDeleteConfirmAnio] = useState("");
  const [importarAnterior, setImportarAnterior] = useState(false);
  const [selectedVaultCompanyId, setSelectedVaultCompanyId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("todos");

  const isSuperAdmin = user?.role === "superadmin";
  const isLso = user?.role === "lso";

  // Leer empresa preseleccionada desde URL (cuando LSO entra desde su portal)
  const lsoPreselectedCompanyId = useMemo(() => {
    if (!isLso) return null;
    return new URLSearchParams(window.location.search).get("empresa");
  }, [isLso]);

  // Auto-seleccionar empresa en vault cuando LSO entra desde el portal
  useEffect(() => {
    if (isLso && lsoPreselectedCompanyId) {
      setSelectedVaultCompanyId(lsoPreselectedCompanyId);
    }
  }, [isLso, lsoPreselectedCompanyId]);

  // Estado para panel de diagnóstico de estándares (solo superadmin)
  const [diagnosticoOpen, setDiagnosticoOpen] = useState(false);
  const [diagnosticoData, setDiagnosticoData] = useState<any>(null);
  const [corrigiendo, setCorrigiendo] = useState(false);
  // SECURITY: Solo superadmin tiene acceso global para seleccionar empresas
  // LSO también puede gestionar evaluaciones de sus empresas asignadas
  const isAdmin = isSuperAdmin || isLso;
  const isVaultMode = isSuperAdmin || isLso;
  const formSchema = createFormSchema(isAdmin);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anio: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      tipoEmpresa: "tipo1",
      fechaEvaluacion: new Date(),
      responsableNombre: user?.fullName || user?.username || "",
      responsableCargo: "Responsable SG-SST",
      observaciones: "",
      estado: "en-progreso",
      elaboradoPorId: "",
      autorizadoPorId: "",
      aprobadoPorId: "",
    },
  });

  const evaluacionesQueryUrl = isLso && lsoPreselectedCompanyId
    ? `/api/evaluaciones-sst?companyId=${lsoPreselectedCompanyId}`
    : "/api/evaluaciones-sst";

  const { data: evaluaciones = [], isLoading } = useQuery<EvaluacionSst[]>({
    queryKey: [evaluacionesQueryUrl],
  });

  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery<any[]>({
    queryKey: ["/api/companies"],
    enabled: !!user,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: designations = [] } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
  });

  const { data: lsoAssignment } = useQuery<any>({
    queryKey: ["/api/lso-directory-jwt/current-assignment"],
  });

  // Obtener la empresa para calcular tipo de empresa automáticamente
  // Para admin: empresa seleccionada en el formulario
  // Para no-admin: empresa del usuario actual
  const selectedCompanyId = form.watch("companyId");
  
  const targetCompany = useMemo(() => {
    if (!companies.length) return null;
    
    // Para admin (superadmin/LSO), usar la empresa seleccionada en el formulario
    if (isAdmin && selectedCompanyId) {
      return companies.find((c: any) => c.id === selectedCompanyId);
    }
    
    // Para LSO con empresa preseleccionada desde el portal
    if (isLso && selectedVaultCompanyId) {
      return companies.find((c: any) => c.id === selectedVaultCompanyId);
    }
    
    // Para no-admin, usar la empresa del usuario
    if (!isAdmin && user?.companyId) {
      return companies.find((c: any) => c.id === user.companyId);
    }
    
    return null;
  }, [companies, isAdmin, isLso, selectedCompanyId, selectedVaultCompanyId, user?.companyId]);

  // Calcular el tipo de empresa basado EXCLUSIVAMENTE en numberOfWorkers y riskLevel
  // IMPORTANTE: El plan de suscripción NO afecta el capítulo - solo afecta facturación
  // Según Resolución 0312/2019, el capítulo se determina por cantidad de trabajadores y nivel de riesgo
  const calculatedTipoEmpresa = useMemo(() => {
    if (!targetCompany) return "tipo1";
    
    return calculateTipoEmpresa(
      targetCompany.numberOfWorkers || 1,
      targetCompany.riskLevel || "I"
    );
  }, [targetCompany]);

  // Actualizar el campo tipoEmpresa automáticamente cuando la empresa o suscripción cambien
  useEffect(() => {
    if (targetCompany) {
      form.setValue("tipoEmpresa", calculatedTipoEmpresa);
    }
  }, [targetCompany, calculatedTipoEmpresa, form]);


  // Para usuarios no-superadmin, establecer automáticamente su companyId
  useEffect(() => {
    if (!isSuperAdmin && !isLso && user?.companyId && dialogOpen) {
      form.setValue("companyId", user.companyId);
    }
    // Para LSO, usar la empresa del vault preseleccionada
    if (isLso && selectedVaultCompanyId && dialogOpen) {
      form.setValue("companyId", selectedVaultCompanyId);
    }
  }, [isSuperAdmin, isLso, user?.companyId, selectedVaultCompanyId, dialogOpen, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // SECURITY: Superadmin y LSO pueden crear evaluaciones en empresas asignadas
      const canSelectCompany = user?.role === 'superadmin' || user?.role === 'lso';
      const payload = canSelectCompany && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/evaluaciones-sst", payload);
      return res.json();
    },
    onSuccess: async (newEvaluacion) => {
      // Intentar importar datos del año anterior si está habilitado
      if (importarAnterior && newEvaluacion.id) {
        try {
          await apiRequest("POST", `/api/evaluaciones-sst/${newEvaluacion.id}/importar-anterior`);
          toast({
            title: "Datos importados",
            description: "Se importaron los estándares persistentes del año anterior para su revisión",
            className: "bg-yellow-50 border-yellow-200",
          });
        } catch (err) {
          console.error("Error importing previous data:", err);
          // No bloquear - la evaluación ya se creó
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst"] });
      if (isLso && lsoPreselectedCompanyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/evaluaciones-sst?companyId=${lsoPreselectedCompanyId}`] });
      }
      setDialogOpen(false);
      form.reset();
      setImportarAnterior(true);
      toast({
        title: "Evaluación creada",
        description: "La evaluación inicial del SG-SST se ha creado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      setLocation(`/evaluaciones-sst/${newEvaluacion.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  // Mutation para eliminar evaluaciones (solo superadmin)
  const deleteMutation = useMutation({
    mutationFn: async (evaluacionId: string) => {
      const res = await apiRequest("DELETE", `/api/evaluaciones-sst/${evaluacionId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst"] });
      setDeleteDialogOpen(false);
      setEvaluacionToDelete(null);
      setDeleteConfirmPhrase("");
      setDeleteConfirmAnio("");
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const handleDeleteClick = (e: React.MouseEvent, evaluacion: EvaluacionSst) => {
    e.stopPropagation();
    setEvaluacionToDelete(evaluacion);
    setDeleteConfirmPhrase("");
    setDeleteConfirmAnio("");
    setDeleteDialogOpen(true);
  };

  const canConfirmDelete =
    deleteConfirmPhrase === "ELIMINAR-EVALUACION-SST" &&
    deleteConfirmAnio === String(evaluacionToDelete?.anio ?? "");

  const confirmDelete = () => {
    if (evaluacionToDelete && canConfirmDelete) {
      deleteMutation.mutate(evaluacionToDelete.id);
    }
  };

  const canDelete = isSuperAdmin || user?.role === 'admin' || user?.role === 'superusuario';

  const companyMap = useMemo(() => {
    const map: Record<string, { id: string; name: string }> = {};
    for (const c of companies) {
      map[c.id] = { id: c.id, name: c.name || c.id };
    }
    return map;
  }, [companies]);

  const companyVaults = useMemo(() => {
    if (!isSuperAdmin && !isLso) return [];
    const grouped: Record<string, { companyId: string; companyName: string; evaluaciones: EvaluacionSst[]; latestScore: number; latestStatus: string; years: number[] }> = {};
    for (const ev of evaluaciones) {
      const cId = ev.companyId;
      if (!grouped[cId]) {
        grouped[cId] = {
          companyId: cId,
          companyName: companyMap[cId]?.name || cId,
          evaluaciones: [],
          latestScore: 0,
          latestStatus: "",
          years: [],
        };
      }
      grouped[cId].evaluaciones.push(ev);
      if (!grouped[cId].years.includes(ev.anio)) {
        grouped[cId].years.push(ev.anio);
      }
    }
    for (const key of Object.keys(grouped)) {
      const evs = grouped[key].evaluaciones;
      evs.sort((a, b) => b.anio - a.anio || b.mes - a.mes);
      grouped[key].latestScore = evs[0]?.porcentajeCumplimiento ?? 0;
      grouped[key].latestStatus = evs[0]?.estado || "";
      grouped[key].years.sort((a, b) => b - a);
    }
    return Object.values(grouped);
  }, [evaluaciones, companyMap, isSuperAdmin]);

  const filteredVaults = useMemo(() => {
    if (!searchTerm) return companyVaults;
    const lower = searchTerm.toLowerCase();
    return companyVaults.filter(v =>
      v.companyName.toLowerCase().includes(lower) ||
      v.evaluaciones.some(e => e.responsableNombre.toLowerCase().includes(lower))
    );
  }, [companyVaults, searchTerm]);

  const selectedVault = useMemo(() => {
    if (!selectedVaultCompanyId) return null;
    const found = companyVaults.find(v => v.companyId === selectedVaultCompanyId);
    if (found) return found;
    const name = companyMap[selectedVaultCompanyId]?.name || selectedVaultCompanyId;
    return { companyId: selectedVaultCompanyId, companyName: name, evaluaciones: [], latestScore: 0, latestStatus: "", years: [] };
  }, [companyVaults, selectedVaultCompanyId, companyMap]);

  const vaultEvaluaciones = useMemo(() => {
    if (!selectedVault) return [];
    let evs = selectedVault.evaluaciones;
    if (yearFilter !== "todos") {
      evs = evs.filter(e => e.anio === parseInt(yearFilter));
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      evs = evs.filter(e =>
        e.anio.toString().includes(lower) ||
        e.responsableNombre.toLowerCase().includes(lower) ||
        (e.observaciones?.toLowerCase().includes(lower) ?? false)
      );
    }
    return evs;
  }, [selectedVault, yearFilter, searchTerm]);

  const filteredEvaluaciones = evaluaciones.filter((evaluacion) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      evaluacion.anio.toString().includes(searchLower) ||
      evaluacion.responsableNombre.toLowerCase().includes(searchLower) ||
      (evaluacion.observaciones?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      "en-progreso": { label: "En Proceso", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: FileText },
      "completada": { label: "Completada", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "enviada": { label: "Enviada", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: FileCheck },
    };
    const item = config[estado as keyof typeof config] || config["en-progreso"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  const getNivelBadge = (nivel: string | null, porcentaje: number | null) => {
    if (!nivel || porcentaje === null) {
      return <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">Pendiente</Badge>;
    }

    const config = {
      "critico": { label: "Crítico", className: "bg-red-500/10 text-red-700 dark:text-red-400", icon: AlertTriangle },
      "moderadamente-aceptable": { label: "Moderado", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: AlertTriangle },
      "aceptable": { label: "Aceptable", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
    };
    const item = config[nivel as keyof typeof config] || config["critico"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label} ({porcentaje}%)
      </Badge>
    );
  };

  const handleDownloadPDF = async (evaluacionId: string, anio: number) => {
    try {
      const response = await fetch(`/api/evaluaciones-sst/${evaluacionId}/pdf`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error al descargar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluacion-sst-${anio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF descargado",
        description: "El reporte de evaluación se ha descargado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    const aspectosEvaluacion = Object.entries(plantilla.campos)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');
    
    const observacionesTexto = `Plantilla aplicada: ${plantilla.nombre}\n\nAspectos a evaluar según ${plantilla.normativaBase}:\n${aspectosEvaluacion}\n\nDescripción: ${plantilla.descripcion}`;
    
    form.setValue('observaciones', observacionesTexto);
    setDialogOpen(true);
    
    toast({
      title: "Plantilla aplicada",
      description: `Se ha aplicado la plantilla "${plantilla.nombre}" al formulario`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const estandarEvaluacionInicial = getEstandarByCodigo('2.3.1');

  return (
    <div className="space-y-6">
      <TrialVerificationBannerAuto />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Evaluación Inicial del SG-SST</h1>
          <p className="text-muted-foreground">Resolución 0312 de 2019 - Estándares Mínimos</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button 
              variant="outline" 
              onClick={async () => {
                setDiagnosticoOpen(true);
                try {
                  const res = await fetch('/api/diagnostico/estandares', { credentials: 'include' });
                  const data = await res.json();
                  setDiagnosticoData(data);
                } catch (err) {
                  console.error('Error fetching diagnostico:', err);
                }
              }}
              data-testid="button-diagnostico"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Diagnóstico
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-evaluation">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Evaluación
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>Nueva Evaluación Inicial SG-SST</DialogTitle>
              <DialogDescription>
                Cree una nueva evaluación anual de estándares mínimos según Resolución 0312/2019
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-x-auto">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="anio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-anio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mes</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-mes">
                              <SelectValue placeholder="Seleccionar mes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {new Date(2024, month - 1).toLocaleDateString('es-CO', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Switch para importar datos del año anterior */}
                {form.watch("anio") > new Date().getFullYear() - 5 && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label>Importar datos del año anterior</Label>
                      <p className="text-sm text-muted-foreground">
                        Copia automáticamente las respuestas de estándares persistentes (designación de responsable, políticas, etc.) para su revisión
                      </p>
                    </div>
                    <Switch
                      checked={importarAnterior}
                      onCheckedChange={setImportarAnterior}
                      data-testid="switch-importar-anterior"
                    />
                  </div>
                )}
                
                {isSuperAdmin ? (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Seleccione empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Seleccione la empresa para la cual se creará la evaluación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="rounded-md border px-3 py-2 bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Empresa</p>
                    <p className="font-medium">
                      {companies.find(c => c.id === user?.companyId)?.name || "No asignada"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Las evaluaciones se crean automáticamente para su empresa
                    </p>
                  </div>
                )}

                {/* Tipo de Empresa - Determinado según Resolución 0312/2019 */}
                <div className="rounded-md border px-3 py-2 bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-muted-foreground">Tipo de Empresa</p>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="font-medium" data-testid="text-tipo-empresa">
                    {!targetCompany 
                      ? (isAdmin ? "Seleccione una empresa primero" : "Cargando datos de empresa...")
                      : tipoEmpresaLabels[calculatedTipoEmpresa] || calculatedTipoEmpresa
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Determinado automáticamente según el número de trabajadores y nivel de riesgo (Res. 0312/2019)
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="responsableNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable de la Evaluación</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-responsable" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsableCargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-cargo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Firmas de Aprobación */}
                <div className="space-y-3 border-t pt-3">
                  <h3 className="font-semibold text-sm">Firmas de Aprobación (Opcional)</h3>
                  <p className="text-xs text-muted-foreground">
                    Elaborado automáticamente por el sistema. Autorizado por el LSO asignado. Aprobado por el Representante Legal.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Elaborado por</FormLabel>
                      <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-muted/50 border" data-testid="text-elaborado-por">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">SADGI S.A.S. — Sistema Automatizado</span>
                      </div>
                    </div>

                    <div>
                      <FormLabel className="text-sm font-medium">Autorizado por (LSO)</FormLabel>
                      {lsoAssignment?.data ? (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-muted/50 border" data-testid="text-autorizado-por">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{lsoAssignment.data.name} — Licenciado SST</span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" data-testid="text-autorizado-por-pendiente">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-400">Pendiente — Se asignará cuando se vincule un LSO a la empresa</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel className="text-sm font-medium">Aprobado por (Gerente/Representante Legal)</FormLabel>
                      {targetCompany?.legalRepName ? (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-muted/50 border" data-testid="text-aprobado-por">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            {targetCompany.legalRepName} — {targetCompany.legalRepPosition || 'Representante Legal'}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" data-testid="text-aprobado-por-pendiente">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-400">Pendiente — Registre el Representante Legal en los datos de la empresa</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-evaluation"
                  >
                    {createMutation.isPending ? "Creando..." : "Crear Evaluación"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {estandarEvaluacionInicial && (
        <AutomationAssistant
          titulo="Evaluación Inicial del SG-SST"
          estandar="2.3.1"
          descripcion="Herramienta de asistencia para la evaluación inicial del Sistema de Gestión de Seguridad y Salud en el Trabajo según el Decreto 1072/2015, Artículo 2.2.4.6.16"
          normativaAplicable={estandarEvaluacionInicial.normativaAplicable}
          compact={true}
        />
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={isVaultMode && !selectedVaultCompanyId ? "Buscar empresa..." : "Buscar por año, responsable..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        {isVaultMode && selectedVaultCompanyId && selectedVault && (
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-year-filter">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los años</SelectItem>
              {selectedVault.years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando evaluaciones...</p>
        </div>
      ) : isSuperAdmin && !selectedVaultCompanyId && !lsoPreselectedCompanyId ? (
        <>
          {filteredVaults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No hay evaluaciones registradas</p>
                <p className="text-muted-foreground text-center mb-4">
                  Aún no hay empresas con evaluaciones del SG-SST
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground" data-testid="text-vault-count">
                  {filteredVaults.length} empresa{filteredVaults.length !== 1 ? 's' : ''} con evaluaciones
                </p>
                <Badge className="bg-muted text-muted-foreground" data-testid="badge-total-evaluations">
                  {evaluaciones.length} evaluaciones en total
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVaults.map((vault) => {
                  const scoreColor = vault.latestScore >= 86 ? "text-green-600" : vault.latestScore >= 60 ? "text-yellow-600" : "text-red-600";
                  const scoreBg = vault.latestScore >= 86 ? "bg-green-50 dark:bg-green-950/30" : vault.latestScore >= 60 ? "bg-yellow-50 dark:bg-yellow-950/30" : "bg-red-50 dark:bg-red-950/30";
                  return (
                    <Card
                      key={vault.companyId}
                      className="hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => {
                        setSelectedVaultCompanyId(vault.companyId);
                        setSearchTerm("");
                        setYearFilter("todos");
                      }}
                      data-testid={`card-vault-${vault.companyId}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-10 w-10 rounded-xl ${scoreBg} flex items-center justify-center shrink-0`}>
                              <Building2 className={`h-5 w-5 ${scoreColor}`} />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base truncate" data-testid={`text-vault-name-${vault.companyId}`}>
                                {vault.companyName}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {vault.evaluaciones.length} evaluaci{vault.evaluaciones.length !== 1 ? 'ones' : 'ón'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Último cumplimiento</p>
                            <p className={`text-lg font-bold ${scoreColor}`} data-testid={`text-vault-score-${vault.companyId}`}>{vault.latestScore}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Años</p>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {vault.years.slice(0, 3).map(y => (
                                <Badge key={y} variant="outline" className="text-xs">{y}</Badge>
                              ))}
                              {vault.years.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{vault.years.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : isVaultMode && selectedVaultCompanyId && selectedVault ? (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isLso && lsoPreselectedCompanyId) {
                  setLocation("/portal-licenciado");
                } else {
                  setSelectedVaultCompanyId(null);
                  setSearchTerm("");
                  setYearFilter("todos");
                }
              }}
              data-testid="button-back-to-vaults"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isLso && lsoPreselectedCompanyId ? "Volver al Portal" : "Volver"}
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold" data-testid="text-vault-company-name">{selectedVault.companyName}</h2>
            </div>
            <Badge variant="outline" data-testid="badge-vault-evaluation-count">
              {selectedVault.evaluaciones.length} evaluaci{selectedVault.evaluaciones.length !== 1 ? 'ones' : 'ón'}
            </Badge>
          </div>

          {vaultEvaluaciones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No hay evaluaciones para este filtro</p>
                <p className="text-muted-foreground text-center mb-4">
                  Ajuste el filtro de año para ver más evaluaciones
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vaultEvaluaciones.map((evaluacion) => (
                <Card
                  key={evaluacion.id}
                  className="hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setLocation(`/evaluaciones-sst/${evaluacion.id}`)}
                  data-testid={`card-evaluation-${evaluacion.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          Evaluación {evaluacion.anio} - {new Date(2024, evaluacion.mes - 1).toLocaleDateString('es-CO', { month: 'long' })}
                        </CardTitle>
                        <CardDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Responsable: {evaluacion.responsableNombre}</p>
                            <p>Cargo: {evaluacion.responsableCargo}</p>
                            <p>Fecha evaluación: {new Date(evaluacion.fechaEvaluacion).toLocaleDateString('es-CO')}</p>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getEstadoBadge(evaluacion.estado)}
                        {getNivelBadge(evaluacion.nivelCumplimiento, evaluacion.porcentajeCumplimiento)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Empresa</p>
                        <p className="font-semibold">Tipo {evaluacion.tipoEmpresa.slice(-1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Puntaje</p>
                        <p className="font-semibold">
                          {evaluacion.puntajeTotal ?? 0} / {evaluacion.puntajeMaximo ?? 100}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cumplimiento</p>
                        <p className="font-semibold">{evaluacion.porcentajeCumplimiento ?? 0}%</p>
                      </div>
                      {evaluacion.fechaEnvio && (
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha Envío</p>
                          <p className="font-semibold">{new Date(evaluacion.fechaEnvio).toLocaleDateString('es-CO')}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {evaluacion.estado === 'completada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(evaluacion.id, evaluacion.anio);
                          }}
                          data-testid={`button-download-pdf-${evaluacion.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Reporte PDF
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={(e) => handleDeleteClick(e, evaluacion)}
                          data-testid={`button-delete-evaluation-${evaluacion.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : filteredEvaluaciones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No hay evaluaciones registradas</p>
            <p className="text-muted-foreground text-center mb-4">
              Cree su primera evaluación inicial del SG-SST según Resolución 0312/2019
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvaluaciones.map((evaluacion) => (
            <Card
              key={evaluacion.id}
              className="hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setLocation(`/evaluaciones-sst/${evaluacion.id}`)}
              data-testid={`card-evaluation-${evaluacion.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      Evaluación {evaluacion.anio} - {new Date(2024, evaluacion.mes - 1).toLocaleDateString('es-CO', { month: 'long' })}
                    </CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Responsable: {evaluacion.responsableNombre}</p>
                        <p>Cargo: {evaluacion.responsableCargo}</p>
                        <p>Fecha evaluación: {new Date(evaluacion.fechaEvaluacion).toLocaleDateString('es-CO')}</p>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getEstadoBadge(evaluacion.estado)}
                    {getNivelBadge(evaluacion.nivelCumplimiento, evaluacion.porcentajeCumplimiento)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Empresa</p>
                    <p className="font-semibold">Tipo {evaluacion.tipoEmpresa.slice(-1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Puntaje</p>
                    <p className="font-semibold">
                      {evaluacion.puntajeTotal ?? 0} / {evaluacion.puntajeMaximo ?? 100}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cumplimiento</p>
                    <p className="font-semibold">{evaluacion.porcentajeCumplimiento ?? 0}%</p>
                  </div>
                  {evaluacion.fechaEnvio && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha Envío</p>
                      <p className="font-semibold">{new Date(evaluacion.fechaEnvio).toLocaleDateString('es-CO')}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {evaluacion.estado === 'completada' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(evaluacion.id, evaluacion.anio);
                      }}
                      data-testid={`button-download-pdf-${evaluacion.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Reporte PDF
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={(e) => handleDeleteClick(e, evaluacion)}
                      data-testid={`button-delete-evaluation-${evaluacion.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Diagnóstico de Estándares (solo superadmin) */}
      {isSuperAdmin && (
        <Dialog open={diagnosticoOpen} onOpenChange={setDiagnosticoOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Diagnóstico de Estándares SST
              </DialogTitle>
              <DialogDescription>
                Verificar y corregir la configuración de estándares según Resolución 0312/2019
              </DialogDescription>
            </DialogHeader>
            
            {diagnosticoData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Tipo 1 (Microempresa)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span>Estándares:</span>
                        <Badge variant={diagnosticoData.tipo1 === 7 ? "default" : "destructive"}>
                          {diagnosticoData.tipo1} / 7
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Puntaje máx:</span>
                        <Badge variant={diagnosticoData.puntajeMaximoTipo1 === 95 ? "default" : "destructive"}>
                          {diagnosticoData.puntajeMaximoTipo1} / 95
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Tipo 2 (Pequeña)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span>Estándares:</span>
                        <Badge variant={diagnosticoData.tipo2 === 21 ? "default" : "destructive"}>
                          {diagnosticoData.tipo2} / 21
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Tipo 3/4 (Mediana/Grande)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span>Estándares:</span>
                        <Badge variant={diagnosticoData.tipo3 === 61 ? "default" : "destructive"}>
                          {diagnosticoData.tipo3} / 61
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {diagnosticoData.tipo1 !== 7 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Configuración incorrecta detectada</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tipo 1 debería tener 7 estándares pero tiene {diagnosticoData.tipo1}. 
                          Haga clic en "Corregir Estándares" para arreglar esto.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {diagnosticoData.estandaresTipo1 && (
                  <div>
                    <h4 className="font-medium mb-2">Estándares configurados para Tipo 1:</h4>
                    <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                      {diagnosticoData.estandaresTipo1.map((e: any, i: number) => (
                        <div key={i} className="flex justify-between py-1 border-b">
                          <span>{e.numero} - {e.nombre?.substring(0, 40)}...</span>
                          <Badge variant="outline">{e.puntaje} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Cargando diagnóstico...
              </div>
            )}
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDiagnosticoOpen(false)}>
                Cerrar
              </Button>
              <Button 
                variant="destructive"
                disabled={corrigiendo || !diagnosticoData || diagnosticoData.tipo1 === 7}
                onClick={async () => {
                  setCorrigiendo(true);
                  try {
                    const res = await fetch('/api/diagnostico/corregir-estandares', { 
                      method: 'POST',
                      credentials: 'include' 
                    });
                    const data = await res.json();
                    toast({
                      title: "Corrección completada",
                      description: data.mensaje || "Estándares corregidos exitosamente",
                    });
                    const diagRes = await fetch('/api/diagnostico/estandares', { credentials: 'include' });
                    const diagData = await diagRes.json();
                    setDiagnosticoData(diagData);
                  } catch (err: any) {
                    toast({
                      title: "Error",
                      description: err.message || "No se pudo corregir los estándares",
                      variant: "destructive",
                    });
                  } finally {
                    setCorrigiendo(false);
                  }
                }}
              >
                {corrigiendo ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Corrigiendo...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 mr-2" />
                    Corregir Estándares
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) { setEvaluacionToDelete(null); setDeleteConfirmPhrase(""); setDeleteConfirmAnio(""); }
      }}>
        <AlertDialogContent className="max-w-md" data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive flex-shrink-0" />
              <AlertDialogTitle className="text-destructive text-base">
                ¡ADVERTENCIA! Acción irreversible
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <p className="text-amber-800 dark:text-amber-300 font-medium">
                    ¡ATENCIÓN! Esta acción NO se puede deshacer. La evaluación SST{" "}
                    {evaluacionToDelete?.anio} y todos sus datos se perderán permanentemente.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  Para confirmar, escriba exactamente los siguientes campos:
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">
                      Escriba exactamente: <span className="font-mono">ELIMINAR-EVALUACION-SST</span>
                    </p>
                    <Input
                      value={deleteConfirmPhrase}
                      onChange={(e) => setDeleteConfirmPhrase(e.target.value)}
                      placeholder="ELIMINAR-EVALUACION-SST"
                      className={deleteConfirmPhrase === "ELIMINAR-EVALUACION-SST" ? "border-green-500" : ""}
                      data-testid="input-delete-confirm-phrase"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">
                      Escriba el año de la evaluación: <span className="font-mono">{evaluacionToDelete?.anio}</span>
                    </p>
                    <Input
                      value={deleteConfirmAnio}
                      onChange={(e) => setDeleteConfirmAnio(e.target.value)}
                      placeholder={String(evaluacionToDelete?.anio ?? "")}
                      className={deleteConfirmAnio === String(evaluacionToDelete?.anio ?? "") ? "border-green-500" : ""}
                      data-testid="input-delete-confirm-anio"
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!canConfirmDelete || deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? "Eliminando..." : `Eliminar evaluación ${evaluacionToDelete?.anio}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
