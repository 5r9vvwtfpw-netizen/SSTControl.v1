import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Trash2, Edit, User, Car, Building, Cloud, AlertTriangle, ShieldPlus, Link2, FileDown, CheckCircle2, Clock, CalendarDays, X, ArrowLeft, Database, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiesgoVial, Worker, insertRiesgoVialSchema, TratamientoRiesgoVial, PeligroIperc } from "@shared/schema";
import { apiRequest, queryClient, buildHeaders } from "@/lib/queryClient";
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

const TIPO_TRATAMIENTO_CONFIG = {
  evitar: { label: "Evitar", desc: "Eliminar la actividad que genera el riesgo" },
  reducir: { label: "Reducir", desc: "Disminuir probabilidad o impacto" },
  compartir: { label: "Compartir", desc: "Transferir a terceros o seguros" },
  aceptar: { label: "Aceptar", desc: "Asumir el riesgo con monitoreo" },
};

const ESTADO_TRATAMIENTO_CONFIG: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
  en_progreso: { label: "En Progreso", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  implementado: { label: "Implementado", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  cancelado: { label: "Cancelado", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

const tratamientoFormSchema = z.object({
  riesgoVialId: z.string().min(1),
  tipoTratamiento: z.enum(["evitar", "reducir", "compartir", "aceptar"]),
  descripcion: z.string().min(1, "La descripción es requerida"),
  justificacion: z.string().optional().nullable(),
  accionesRequeridas: z.string().optional().nullable(),
  recursosNecesarios: z.string().optional().nullable(),
  responsableId: z.string().optional().nullable(),
  fechaInicio: z.string().optional().nullable(),
  fechaLimite: z.string().optional().nullable(),
  estado: z.string().default("pendiente"),
  porcentajeAvance: z.coerce.number().min(0).max(100).default(0),
  observaciones: z.string().optional().nullable(),
});

type TratamientoFormValues = z.infer<typeof tratamientoFormSchema>;

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
  const [tratamientoDialogOpen, setTratamientoDialogOpen] = useState(false);
  const [selectedRiesgoForTratamiento, setSelectedRiesgoForTratamiento] = useState<RiesgoVial | null>(null);
  const [editingTratamiento, setEditingTratamiento] = useState<TratamientoRiesgoVial | null>(null);
  const [tratamientoFormOpen, setTratamientoFormOpen] = useState(false);
  const [showIpercPanel, setShowIpercPanel] = useState(false);
  const [ipercSearch, setIpercSearch] = useState("");
  const [importedFromIperc, setImportedFromIperc] = useState(false);

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

  const { data: ipercPeligros = [], isLoading: ipercLoading } = useQuery<PeligroIperc[]>({
    queryKey: ["/api/peligros-iperc"],
  });

  const filteredIpercPeligros = useMemo(() => {
    if (!ipercSearch.trim()) return ipercPeligros;
    const s = ipercSearch.toLowerCase();
    return ipercPeligros.filter(p =>
      (p.descripcionPeligro?.toLowerCase().includes(s)) ||
      (p.fuenteGeneradora?.toLowerCase().includes(s)) ||
      (p.clasificacion?.toLowerCase().includes(s)) ||
      (p.actividadProceso?.toLowerCase().includes(s))
    );
  }, [ipercPeligros, ipercSearch]);

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

  const tratamientoForm = useForm<TratamientoFormValues>({
    resolver: zodResolver(tratamientoFormSchema),
    defaultValues: {
      riesgoVialId: "",
      tipoTratamiento: "reducir",
      descripcion: "",
      justificacion: "",
      accionesRequeridas: "",
      recursosNecesarios: "",
      responsableId: null,
      fechaInicio: "",
      fechaLimite: "",
      estado: "pendiente",
      porcentajeAvance: 0,
      observaciones: "",
    },
  });

  const { data: tratamientos = [], isLoading: loadingTratamientos } = useQuery<TratamientoRiesgoVial[]>({
    queryKey: ["/api/tratamientos-riesgo-vial", selectedRiesgoForTratamiento?.id],
    queryFn: async () => {
      if (!selectedRiesgoForTratamiento) return [];
      const res = await fetch(`/api/tratamientos-riesgo-vial?riesgoVialId=${selectedRiesgoForTratamiento.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar tratamientos");
      return res.json();
    },
    enabled: !!selectedRiesgoForTratamiento,
  });

  const createTratamientoMutation = useMutation({
    mutationFn: async (data: TratamientoFormValues) => {
      const res = await apiRequest("POST", "/api/tratamientos-riesgo-vial", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tratamientos-riesgo-vial", selectedRiesgoForTratamiento?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales/estadisticas"] });
      setTratamientoFormOpen(false);
      setEditingTratamiento(null);
      tratamientoForm.reset();
      toast({ title: "Tratamiento creado", description: "El tratamiento se ha registrado exitosamente", className: "bg-green-50 border-green-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTratamientoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TratamientoFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/tratamientos-riesgo-vial/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tratamientos-riesgo-vial", selectedRiesgoForTratamiento?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales/estadisticas"] });
      setTratamientoFormOpen(false);
      setEditingTratamiento(null);
      tratamientoForm.reset();
      toast({ title: "Tratamiento actualizado", description: "El tratamiento se ha actualizado exitosamente", className: "bg-green-50 border-green-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTratamientoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tratamientos-riesgo-vial/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tratamientos-riesgo-vial", selectedRiesgoForTratamiento?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/riesgos-viales/estadisticas"] });
      toast({ title: "Tratamiento eliminado", description: "El tratamiento se ha eliminado", className: "bg-green-50 border-green-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleTratamientoClick = (riesgo: RiesgoVial) => {
    setSelectedRiesgoForTratamiento(riesgo);
    setTratamientoDialogOpen(true);
    setTratamientoFormOpen(false);
    setEditingTratamiento(null);
  };

  const handleNewTratamiento = () => {
    setEditingTratamiento(null);
    tratamientoForm.reset({
      riesgoVialId: selectedRiesgoForTratamiento?.id || "",
      tipoTratamiento: "reducir",
      descripcion: "",
      justificacion: "",
      accionesRequeridas: "",
      recursosNecesarios: "",
      responsableId: null,
      fechaInicio: "",
      fechaLimite: "",
      estado: "pendiente",
      porcentajeAvance: 0,
      observaciones: "",
    });
    setTratamientoFormOpen(true);
  };

  const handleEditTratamiento = (tratamiento: TratamientoRiesgoVial) => {
    setEditingTratamiento(tratamiento);
    tratamientoForm.reset({
      riesgoVialId: tratamiento.riesgoVialId,
      tipoTratamiento: tratamiento.tipoTratamiento as "evitar" | "reducir" | "compartir" | "aceptar",
      descripcion: tratamiento.descripcion,
      justificacion: tratamiento.justificacion || "",
      accionesRequeridas: tratamiento.accionesRequeridas || "",
      recursosNecesarios: tratamiento.recursosNecesarios || "",
      responsableId: tratamiento.responsableId || null,
      fechaInicio: tratamiento.fechaInicio || "",
      fechaLimite: tratamiento.fechaLimite || "",
      estado: tratamiento.estado,
      porcentajeAvance: tratamiento.porcentajeAvance || 0,
      observaciones: tratamiento.observaciones || "",
    });
    setTratamientoFormOpen(true);
  };

  const onSubmitTratamiento = (values: TratamientoFormValues) => {
    const cleanedValues = {
      ...values,
      fechaInicio: values.fechaInicio || null,
      fechaLimite: values.fechaLimite || null,
      justificacion: values.justificacion || null,
      accionesRequeridas: values.accionesRequeridas || null,
      recursosNecesarios: values.recursosNecesarios || null,
      responsableId: values.responsableId || null,
      observaciones: values.observaciones || null,
    };
    if (editingTratamiento) {
      updateTratamientoMutation.mutate({ id: editingTratamiento.id, data: cleanedValues });
    } else {
      createTratamientoMutation.mutate(cleanedValues);
    }
  };

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

  const getNextCodigo = () => {
    const nums = riesgos
      .map(r => { const m = r.codigo.match(/^RV-(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
      .filter(n => n > 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `RV-${String(next).padStart(3, "0")}`;
  };

  const resetIpercPanel = () => {
    setShowIpercPanel(false);
    setIpercSearch("");
    setImportedFromIperc(false);
  };

  const handleOpenNew = () => {
    setEditingRiesgo(null);
    resetIpercPanel();
    form.reset({
      codigo: getNextCodigo(),
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
    });
  };

  const handleImportFromIperc = (peligro: PeligroIperc) => {
    const causas = peligro.subclasificacion
      ? `${peligro.clasificacion}: ${peligro.subclasificacion}`
      : peligro.clasificacion;
    // Controles: cascada → existentes → propuestos → construir desde tipo de control
    const tipoControlLabels: Record<string, string> = {
      eliminacion: "Eliminación del peligro",
      sustitucion: "Sustitución por agente menos peligroso",
      ingenieria: "Controles de ingeniería",
      administrativo: "Controles administrativos (procedimientos, capacitación, señalización)",
      epp: "Equipos de Protección Personal (EPP)",
    };
    const buildControlesDesideTipo = () => {
      const partes: string[] = [];
      if (peligro.tipoControlPrincipal) partes.push(tipoControlLabels[peligro.tipoControlPrincipal] ?? peligro.tipoControlPrincipal);
      if (peligro.tipoControlSecundario) partes.push(tipoControlLabels[peligro.tipoControlSecundario] ?? peligro.tipoControlSecundario);
      return partes.length > 0 ? partes.join(". ") : "";
    };
    const controles = peligro.controlesExistentes?.trim()
      ? peligro.controlesExistentes
      : peligro.controlesPropuestos?.trim()
        ? peligro.controlesPropuestos
        : buildControlesDesideTipo();
    form.setValue("nombre", peligro.descripcionPeligro, { shouldValidate: true });
    form.setValue("descripcion", `${peligro.actividadProceso}: ${peligro.efectosPosibles}`, { shouldValidate: true });
    form.setValue("fuenteRiesgo", peligro.fuenteGeneradora, { shouldValidate: true });
    form.setValue("causasRaiz", causas, { shouldValidate: true });
    form.setValue("consecuencias", peligro.efectosPosibles, { shouldValidate: true });
    form.setValue("controlesExistentes", controles, { shouldValidate: true });
    // Paso PESV relacionado: P04 es el paso de Evaluación de Riesgos Viales
    form.setValue("pasoPesvRelacionado", "P04", { shouldValidate: true });
    setShowIpercPanel(false);
    setIpercSearch("");
    setImportedFromIperc(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingRiesgo(null);
      form.reset();
      resetIpercPanel();
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

  const handleDownloadPdf = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { credentials: 'include', headers: buildHeaders() });
      if (!res.ok) throw new Error('Error generando PDF');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Error descargando PDF:', e);
    }
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
          <HelpVideoButton customRoute="/pesv/matriz-riesgos" testId="button-help-video-pesv-matriz" />
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
              <Button
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-agregar-riesgo"
                onClick={handleOpenNew}
              >
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

                {/* Importar desde IPERC — sólo visible al crear un nuevo riesgo */}
                {!editingRiesgo && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="button-importar-iperc"
                        onClick={() => {
                          setShowIpercPanel(v => !v);
                          setImportedFromIperc(false);
                        }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {showIpercPanel ? "Cerrar panel IPERC" : "Importar desde IPERC"}
                      </Button>
                      <Link href="/iperc">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <ExternalLink className="h-3 w-3" />
                          Matriz IPERC · SG-SST
                        </span>
                      </Link>
                    </div>

                    {importedFromIperc && !showIpercPanel && (
                      <div className="flex items-center gap-2 p-2 rounded-md border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>
                          Datos importados desde la{" "}
                          <Link href="/iperc" className="underline font-medium hover:opacity-80">
                            Matriz IPERC del SG-SST
                          </Link>
                          . Revisa y ajusta los campos según sea necesario.
                        </span>
                        <button
                          type="button"
                          className="ml-auto shrink-0"
                          onClick={() => setImportedFromIperc(false)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {showIpercPanel && (
                      <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            Seleccionar peligro de la Matriz IPERC
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowIpercPanel(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Input
                          placeholder="Buscar por peligro, fuente, proceso..."
                          value={ipercSearch}
                          onChange={e => setIpercSearch(e.target.value)}
                          data-testid="input-iperc-search"
                        />

                        {ipercLoading ? (
                          <p className="text-sm text-muted-foreground py-2">Cargando peligros IPERC...</p>
                        ) : ipercPeligros.length === 0 ? (
                          <div className="text-center py-6 space-y-3">
                            <p className="text-sm text-muted-foreground">No hay peligros registrados en la Matriz IPERC.</p>
                            <Link href="/iperc">
                              <Button type="button" variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ir a Matriz IPERC
                              </Button>
                            </Link>
                          </div>
                        ) : filteredIpercPeligros.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">No se encontraron peligros con ese término de búsqueda.</p>
                        ) : (
                          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                            {filteredIpercPeligros.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                data-testid={`button-iperc-peligro-${p.id}`}
                                className="w-full text-left p-3 rounded-md border bg-background hover-elevate active-elevate-2 space-y-0.5"
                                onClick={() => handleImportFromIperc(p)}
                              >
                                <div className="text-sm font-medium leading-snug">{p.descripcionPeligro}</div>
                                <div className="text-xs text-muted-foreground">
                                  {p.fuenteGeneradora} · {p.clasificacion}{p.subclasificacion ? `: ${p.subclasificacion}` : ""}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Código *
                          {!editingRiesgo && (
                            <span className="text-xs font-normal text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                              Auto-generado
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="RV-001"
                            {...field}
                            data-testid="input-codigo"
                            readOnly={!editingRiesgo}
                            className={!editingRiesgo ? "bg-muted cursor-default select-none" : ""}
                          />
                        </FormControl>
                        {!editingRiesgo && (
                          <p className="text-xs text-muted-foreground">El código se asigna automáticamente en orden consecutivo.</p>
                        )}
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

                {(() => {
                  const prob = form.watch("probabilidad");
                  const imp = form.watch("impacto");
                  if (!prob || !imp) return null;
                  const valorRiesgo = PROBABILIDAD_VALUES[prob as keyof typeof PROBABILIDAD_VALUES].value * IMPACTO_VALUES[imp as keyof typeof IMPACTO_VALUES].value;
                  const nivel = getRiskLevel(valorRiesgo);
                  const config = NIVEL_RIESGO_CONFIG[nivel as keyof typeof NIVEL_RIESGO_CONFIG] || NIVEL_RIESGO_CONFIG.bajo;
                  return (
                    <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/40">
                      <span className="text-sm text-muted-foreground font-medium">Nivel de riesgo calculado:</span>
                      <Badge className={config.className} data-testid="badge-nivel-riesgo-calculado">
                        {config.label} — Valor: {valorRiesgo}
                      </Badge>
                    </div>
                  );
                })()}

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
                onClick={() => { handleOpenNew(); setDialogOpen(true); }}
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
                      onClick={() => handleTratamientoClick(riesgo)}
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

      <Dialog open={tratamientoDialogOpen} onOpenChange={(open) => {
        setTratamientoDialogOpen(open);
        if (!open) {
          setTratamientoFormOpen(false);
          setEditingTratamiento(null);
          setSelectedRiesgoForTratamiento(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldPlus className="h-5 w-5" />
              Tratamiento del Riesgo
            </DialogTitle>
            {selectedRiesgoForTratamiento && (
              <DialogDescription>
                <span className="font-mono">{selectedRiesgoForTratamiento.codigo}</span> - {selectedRiesgoForTratamiento.nombre}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedRiesgoForTratamiento && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {getNivelRiesgoBadge(selectedRiesgoForTratamiento.nivelRiesgo, selectedRiesgoForTratamiento.valorRiesgo)}
                  {getEstadoBadge(selectedRiesgoForTratamiento.estado)}
                  <Badge variant="secondary" className="text-xs" data-testid="badge-tratamientos-count">
                    {tratamientos.length} tratamiento{tratamientos.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {!tratamientoFormOpen && (
                  <Button size="sm" onClick={handleNewTratamiento} data-testid="button-new-tratamiento">
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo Tratamiento
                  </Button>
                )}
              </div>

              {tratamientoFormOpen && (
                <Card data-testid="card-tratamiento-form">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {editingTratamiento ? "Editar Tratamiento" : "Nuevo Tratamiento"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...tratamientoForm}>
                      <form onSubmit={tratamientoForm.handleSubmit(onSubmitTratamiento)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={tratamientoForm.control}
                            name="tipoTratamiento"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Tratamiento (ISO 31000)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-tipo-tratamiento">
                                      <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(TIPO_TRATAMIENTO_CONFIG).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>
                                        {config.label} - {config.desc}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tratamientoForm.control}
                            name="estado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-estado-tratamiento">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(ESTADO_TRATAMIENTO_CONFIG).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={tratamientoForm.control}
                          name="descripcion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripcion del Tratamiento *</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Describa las medidas de control o tratamiento a implementar..." data-testid="input-descripcion-tratamiento" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={tratamientoForm.control}
                          name="justificacion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Justificacion</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Por que se eligio este tipo de tratamiento..." data-testid="input-justificacion-tratamiento" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={tratamientoForm.control}
                          name="accionesRequeridas"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Acciones Requeridas</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Liste las acciones necesarias para implementar el tratamiento..." data-testid="input-acciones-tratamiento" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={tratamientoForm.control}
                          name="recursosNecesarios"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recursos Necesarios</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Recursos humanos, tecnicos, financieros necesarios..." data-testid="input-recursos-tratamiento" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={tratamientoForm.control}
                            name="responsableId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Responsable</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-responsable-tratamiento">
                                      <SelectValue placeholder="Seleccionar responsable" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {workers.map((w) => (
                                      <SelectItem key={w.id} value={String(w.id)}>
                                        {w.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tratamientoForm.control}
                            name="porcentajeAvance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Avance (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" min={0} max={100} {...field} data-testid="input-avance-tratamiento" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={tratamientoForm.control}
                            name="fechaInicio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha de Inicio</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ""} data-testid="input-fecha-inicio-tratamiento" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tratamientoForm.control}
                            name="fechaLimite"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha Limite</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ""} data-testid="input-fecha-limite-tratamiento" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={tratamientoForm.control}
                          name="observaciones"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observaciones</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value || ""} placeholder="Observaciones adicionales..." data-testid="input-observaciones-tratamiento" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => { setTratamientoFormOpen(false); setEditingTratamiento(null); }} data-testid="button-cancel-tratamiento">
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={createTratamientoMutation.isPending || updateTratamientoMutation.isPending}
                            data-testid="button-save-tratamiento"
                          >
                            {(createTratamientoMutation.isPending || updateTratamientoMutation.isPending) ? "Guardando..." : editingTratamiento ? "Actualizar" : "Crear Tratamiento"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {loadingTratamientos ? (
                <p className="text-sm text-muted-foreground text-center py-4">Cargando tratamientos...</p>
              ) : tratamientos.length === 0 && !tratamientoFormOpen ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <ShieldPlus className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No hay tratamientos definidos para este riesgo.</p>
                    <p className="text-sm text-muted-foreground mt-1">Agregue medidas de control para reducir o eliminar el riesgo.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {tratamientos.map((t) => {
                    const tipoConfig = TIPO_TRATAMIENTO_CONFIG[t.tipoTratamiento as keyof typeof TIPO_TRATAMIENTO_CONFIG];
                    const estadoConfig = ESTADO_TRATAMIENTO_CONFIG[t.estado] || ESTADO_TRATAMIENTO_CONFIG.pendiente;
                    const responsable = workers.find(w => String(w.id) === t.responsableId);
                    return (
                      <Card key={t.id} data-testid={`card-tratamiento-${t.id}`}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline">{tipoConfig?.label || t.tipoTratamiento}</Badge>
                              <Badge className={estadoConfig.className}>{estadoConfig.label}</Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEditTratamiento(t)} data-testid={`button-edit-tratamiento-${t.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteTratamientoMutation.mutate(t.id)} data-testid={`button-delete-tratamiento-${t.id}`}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm">{t.descripcion}</p>
                          {t.accionesRequeridas && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Acciones requeridas:</p>
                              <p className="text-sm text-muted-foreground">{t.accionesRequeridas}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            {responsable && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {responsable.name}
                              </span>
                            )}
                            {t.fechaInicio && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                Inicio: {t.fechaInicio}
                              </span>
                            )}
                            {t.fechaLimite && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Limite: {t.fechaLimite}
                              </span>
                            )}
                          </div>
                          {(t.porcentajeAvance !== null && t.porcentajeAvance !== undefined) && (
                            <div className="flex items-center gap-2">
                              <Progress value={t.porcentajeAvance} className="flex-1 h-2" />
                              <span className="text-xs font-medium text-muted-foreground">{t.porcentajeAvance}%</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
