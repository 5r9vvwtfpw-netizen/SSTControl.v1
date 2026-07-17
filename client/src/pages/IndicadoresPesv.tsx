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
import { Plus, Search, Trash2, Edit, TrendingUp, Target, BarChart3, Activity, Calendar, ChevronDown, ChevronUp, FileDown, Zap, CheckCircle2, ArrowLeft, Calculator, Loader2, Info } from "lucide-react";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { useState, useMemo } from "react";
import { getTodayDateString } from "@/lib/utils/formatters";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IndicadorSV, insertIndicadorSVSchema, MedicionIndicadorSV, FactorDesempenoSV, Worker } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { z } from "zod";

const FRECUENCIA_CONFIG = {
  diaria: { label: "Diaria", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  semanal: { label: "Semanal", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  quincenal: { label: "Quincenal", className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  mensual: { label: "Mensual", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  trimestral: { label: "Trimestral", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  semestral: { label: "Semestral", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  anual: { label: "Anual", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

interface PlantillaIndicador {
  nombre: string;
  descripcion: string;
  formula: string;
  unidadMedida: string;
  frecuenciaMedicion: "mensual" | "trimestral" | "semestral" | "anual";
  fuenteDatos: string;
}

const PLANTILLAS_SPI: PlantillaIndicador[] = [
  {
    nombre: "Tasa de siniestros viales",
    descripcion: "Mide la cantidad de siniestros viales por cada 100 vehículos de la flota en un periodo determinado",
    formula: "(Número de siniestros viales / Número total de vehículos) x 100",
    unidadMedida: "Tasa por 100 vehículos",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Registro de siniestros viales y flota vehicular",
  },
  {
    nombre: "Índice de severidad de siniestros",
    descripcion: "Evalúa la gravedad promedio de los siniestros viales ocurridos, midiendo días perdidos por siniestro",
    formula: "(Días perdidos por siniestros viales / Número de siniestros viales)",
    unidadMedida: "Días/siniestro",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Registro de siniestros y ausentismo laboral",
  },
  {
    nombre: "Tasa de mortalidad vial",
    descripcion: "Mide la cantidad de víctimas mortales en siniestros viales respecto al total de trabajadores expuestos",
    formula: "(Número de víctimas mortales / Total de trabajadores expuestos) x 100.000",
    unidadMedida: "Tasa por 100.000",
    frecuenciaMedicion: "anual",
    fuenteDatos: "Registro de siniestros viales y nómina",
  },
  {
    nombre: "Cumplimiento de inspecciones vehiculares",
    descripcion: "Porcentaje de inspecciones preoperacionales realizadas respecto a las programadas",
    formula: "(Inspecciones realizadas / Inspecciones programadas) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Registro de inspecciones vehiculares",
  },
  {
    nombre: "Cumplimiento del plan de capacitación vial",
    descripcion: "Porcentaje de actividades de capacitación en seguridad vial ejecutadas respecto a las planeadas",
    formula: "(Capacitaciones ejecutadas / Capacitaciones planeadas) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteDatos: "Plan de capacitación y registros de asistencia",
  },
  {
    nombre: "Tasa de infracciones de tránsito",
    descripcion: "Mide el número de infracciones de tránsito cometidas por conductores de la organización",
    formula: "(Número de infracciones / Número de conductores) x 100",
    unidadMedida: "Tasa por 100 conductores",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "SIMIT y registros internos de conductores",
  },
  {
    nombre: "Porcentaje de conductores con licencia vigente",
    descripcion: "Proporción de conductores que cuentan con licencia de conducción vigente y adecuada para su categoría",
    formula: "(Conductores con licencia vigente / Total de conductores) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Base de datos de conductores y RUNT",
  },
  {
    nombre: "Cumplimiento de mantenimiento preventivo",
    descripcion: "Porcentaje de mantenimientos preventivos ejecutados respecto a los programados para la flota",
    formula: "(Mantenimientos ejecutados / Mantenimientos programados) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Plan de mantenimiento vehicular",
  },
  {
    nombre: "Índice de frecuencia de siniestros viales",
    descripcion: "Número de siniestros viales por cada millón de kilómetros recorridos por la flota",
    formula: "(Número de siniestros / Kilómetros totales recorridos) x 1.000.000",
    unidadMedida: "Siniestros por millón de km",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Registros de siniestros y control de kilometraje/GPS",
  },
  {
    nombre: "Cobertura de exámenes médicos para conductores",
    descripcion: "Porcentaje de conductores con exámenes médicos ocupacionales vigentes que incluyen evaluación de aptitud para conducir",
    formula: "(Conductores con examen vigente / Total de conductores) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "semestral",
    fuenteDatos: "Registros de salud ocupacional",
  },
  {
    nombre: "Porcentaje de vehículos con documentación vigente",
    descripcion: "Proporción de vehículos que cuentan con SOAT, revisión técnico-mecánica y seguros al día",
    formula: "(Vehículos con documentación completa / Total de vehículos) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "mensual",
    fuenteDatos: "Registro de documentación vehicular",
  },
  {
    nombre: "Eficacia de acciones correctivas viales",
    descripcion: "Porcentaje de acciones correctivas implementadas que eliminaron la causa raíz del siniestro o incidente vial",
    formula: "(Acciones correctivas eficaces / Total de acciones implementadas) x 100",
    unidadMedida: "%",
    frecuenciaMedicion: "trimestral",
    fuenteDatos: "Seguimiento de investigaciones de siniestros",
  },
];

const formSchema = insertIndicadorSVSchema.extend({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  unidadMedida: z.string().min(1, "La unidad de medida es requerida"),
  frecuenciaMedicion: z.enum(["diaria", "semanal", "quincenal", "mensual", "trimestral", "semestral", "anual"]),
});

type FormValues = z.infer<typeof formSchema>;

const medicionFormSchema = z.object({
  fechaMedicion: z.string().min(1, "La fecha de medición es requerida"),
  valor: z.string().min(1, "El valor es requerido"),
  observaciones: z.string().optional(),
});

type MedicionFormValues = z.infer<typeof medicionFormSchema>;

interface IndicadorStatistics {
  total: number;
  cumplenMeta: number;
  noCumplenMeta: number;
  sinMedicion: number;
}

export default function IndicadoresPesv() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indicadorToDelete, setIndicadorToDelete] = useState<IndicadorSV | null>(null);
  const [editingIndicador, setEditingIndicador] = useState<IndicadorSV | null>(null);
  const [expandedIndicador, setExpandedIndicador] = useState<string | null>(null);
  const [medicionDialogOpen, setMedicionDialogOpen] = useState(false);
  const [indicadorForMedicion, setIndicadorForMedicion] = useState<IndicadorSV | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);
  const [autoCalcInfo, setAutoCalcInfo] = useState<{ observaciones: string; fuente: string; calculable: boolean } | null>(null);
  const [selectedPlantillas, setSelectedPlantillas] = useState<number[]>([]);
  const [selectedPlantillaIdx, setSelectedPlantillaIdx] = useState<string>("none");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      factorDesempenoId: undefined,
      formula: "",
      unidadMedida: "",
      frecuenciaMedicion: "mensual",
      fuenteDatos: "",
      valorMeta: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined,
      valorActual: undefined,
      responsableId: undefined,
      activo: 1,
    },
  });

  const medicionForm = useForm<MedicionFormValues>({
    resolver: zodResolver(medicionFormSchema),
    defaultValues: {
      fechaMedicion: getTodayDateString(),
      valor: "",
      observaciones: "",
    },
  });

  const { data: indicadores = [], isLoading } = useQuery<IndicadorSV[]>({
    queryKey: ["/api/indicadores-sv"],
  });

  const { data: factores = [] } = useQuery<FactorDesempenoSV[]>({
    queryKey: ["/api/factores-desempeno-sv"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: mediciones = [], refetch: refetchMediciones } = useQuery<MedicionIndicadorSV[]>({
    queryKey: ["/api/indicadores-sv", expandedIndicador, "mediciones"],
    enabled: !!expandedIndicador,
  });

  const estadisticas = useMemo<IndicadorStatistics>(() => {
    const total = indicadores.length;
    let cumplenMeta = 0;
    let noCumplenMeta = 0;
    let sinMedicion = 0;

    indicadores.forEach((ind) => {
      if (!ind.valorActual) {
        sinMedicion++;
      } else if (ind.valorMeta) {
        const actual = parseFloat(ind.valorActual);
        const meta = parseFloat(ind.valorMeta);
        if (actual >= meta) {
          cumplenMeta++;
        } else {
          noCumplenMeta++;
        }
      } else {
        sinMedicion++;
      }
    });

    return { total, cumplenMeta, noCumplenMeta, sinMedicion };
  }, [indicadores]);

  const generateNextCode = () => {
    const existingCodes = indicadores.map((i) => i.codigo);
    let counter = 1;
    let newCode = `SPI-${String(counter).padStart(3, "0")}`;
    while (existingCodes.includes(newCode)) {
      counter++;
      newCode = `SPI-${String(counter).padStart(3, "0")}`;
    }
    return newCode;
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/indicadores-sv", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv"] });
      setDialogOpen(false);
      setSelectedPlantillaIdx("none");
      form.reset();
      toast({
        title: "Indicador creado",
        description: "El indicador SPI se ha registrado exitosamente",
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
      const res = await apiRequest("PATCH", `/api/indicadores-sv/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv"] });
      setDialogOpen(false);
      setEditingIndicador(null);
      form.reset();
      toast({
        title: "Indicador actualizado",
        description: "El indicador SPI se ha actualizado exitosamente",
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
    mutationFn: async (indicadorId: string) => {
      await apiRequest("DELETE", `/api/indicadores-sv/${indicadorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv"] });
      setDeleteDialogOpen(false);
      setIndicadorToDelete(null);
      toast({
        title: "Indicador eliminado",
        description: "El indicador SPI se ha eliminado exitosamente",
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

  const createMedicionMutation = useMutation({
    mutationFn: async ({ indicadorId, data }: { indicadorId: string; data: MedicionFormValues }) => {
      const res = await apiRequest("POST", `/api/indicadores-sv/${indicadorId}/mediciones`, {
        ...data,
        valor: data.valor,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv"] });
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv", expandedIndicador, "mediciones"] });
      setMedicionDialogOpen(false);
      setIndicadorForMedicion(null);
      medicionForm.reset({
        fechaMedicion: getTodayDateString(),
        valor: "",
        observaciones: "",
      });
      toast({
        title: "Medición registrada",
        description: "La medición del indicador se ha registrado exitosamente",
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

  const bulkCreateMutation = useMutation({
    mutationFn: async (plantillas: PlantillaIndicador[]) => {
      const existingCodes = indicadores.map((i) => i.codigo);
      let counter = 1;
      const results = [];
      for (const plantilla of plantillas) {
        let code = `SPI-${String(counter).padStart(3, "0")}`;
        while (existingCodes.includes(code)) {
          counter++;
          code = `SPI-${String(counter).padStart(3, "0")}`;
        }
        existingCodes.push(code);
        const data = {
          codigo: code,
          nombre: plantilla.nombre,
          descripcion: plantilla.descripcion,
          formula: plantilla.formula,
          unidadMedida: plantilla.unidadMedida,
          frecuenciaMedicion: plantilla.frecuenciaMedicion,
          fuenteDatos: plantilla.fuenteDatos,
          activo: 1,
        };
        const res = await apiRequest("POST", "/api/indicadores-sv", data);
        results.push(await res.json());
        counter++;
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv"] });
      setBulkDialogOpen(false);
      setSelectedPlantillas([]);
      toast({
        title: `${results.length} indicadores creados`,
        description: "Los indicadores SPI se han registrado exitosamente desde las plantillas ISO 39001",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sv"] });
      toast({
        title: "Error al crear indicadores",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editingIndicador) {
      updateMutation.mutate({ id: editingIndicador.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const onSubmitMedicion = (values: MedicionFormValues) => {
    if (indicadorForMedicion) {
      createMedicionMutation.mutate({ indicadorId: indicadorForMedicion.id, data: values });
    }
  };

  const handleAutoCalculate = async () => {
    if (!indicadorForMedicion) return;
    setIsAutoCalculating(true);
    setAutoCalcInfo(null);
    try {
      const params = new URLSearchParams({ nombre: indicadorForMedicion.nombre });
      const res = await fetch(`/api/indicadores-sv/auto-calculate?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error en el servidor");
      const data = await res.json();
      if (data.calculable && data.valor !== null) {
        medicionForm.setValue("valor", String(data.valor));
        medicionForm.setValue("observaciones", data.observaciones || "");
      }
      setAutoCalcInfo({
        observaciones: data.calculable
          ? data.observaciones
          : (data.observaciones || "Este indicador no tiene cálculo automático disponible."),
        fuente: data.fuente || "",
        calculable: data.calculable,
      });
      if (!data.calculable) {
        toast({
          title: "Cálculo no disponible",
          description: data.observaciones || "Ingrese el valor manualmente.",
          variant: "default",
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo calcular el indicador automáticamente.", variant: "destructive" });
    } finally {
      setIsAutoCalculating(false);
    }
  };

  const handleEditClick = (indicador: IndicadorSV) => {
    setEditingIndicador(indicador);
    form.reset({
      codigo: indicador.codigo,
      nombre: indicador.nombre,
      descripcion: indicador.descripcion || "",
      factorDesempenoId: indicador.factorDesempenoId || undefined,
      formula: indicador.formula || "",
      unidadMedida: indicador.unidadMedida,
      frecuenciaMedicion: indicador.frecuenciaMedicion,
      fuenteDatos: indicador.fuenteDatos || "",
      valorMeta: indicador.valorMeta || undefined,
      valorMinimo: indicador.valorMinimo || undefined,
      valorMaximo: indicador.valorMaximo || undefined,
      valorActual: indicador.valorActual || undefined,
      responsableId: indicador.responsableId || undefined,
      activo: indicador.activo,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, indicador: IndicadorSV) => {
    e.stopPropagation();
    setIndicadorToDelete(indicador);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (indicadorToDelete) {
      deleteMutation.mutate(indicadorToDelete.id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingIndicador(null);
      setSelectedPlantillaIdx("none");
      form.reset();
    }
    setDialogOpen(open);
  };

  const handleAddIndicador = () => {
    form.reset({
      codigo: generateNextCode(),
      nombre: "",
      descripcion: "",
      factorDesempenoId: undefined,
      formula: "",
      unidadMedida: "",
      frecuenciaMedicion: "mensual",
      fuenteDatos: "",
      valorMeta: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined,
      valorActual: undefined,
      responsableId: undefined,
      activo: 1,
    });
    setDialogOpen(true);
  };

  const handleOpenBulkDialog = () => {
    const existingNames = indicadores.map((i) => i.nombre.toLowerCase());
    const availableIndices = PLANTILLAS_SPI
      .map((_, idx) => idx)
      .filter((idx) => !existingNames.includes(PLANTILLAS_SPI[idx].nombre.toLowerCase()));
    setSelectedPlantillas(availableIndices);
    setBulkDialogOpen(true);
  };

  const togglePlantilla = (idx: number) => {
    setSelectedPlantillas((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleBulkCreate = () => {
    const plantillasToCreate = selectedPlantillas.map((idx) => PLANTILLAS_SPI[idx]);
    if (plantillasToCreate.length > 0) {
      bulkCreateMutation.mutate(plantillasToCreate);
    }
  };

  const plantillasDisponibles = useMemo(() => {
    const existingNames = indicadores.map((i) => i.nombre.toLowerCase());
    return PLANTILLAS_SPI.map((p, idx) => ({
      ...p,
      idx,
      yaExiste: existingNames.includes(p.nombre.toLowerCase()),
    }));
  }, [indicadores]);

  const handleSelectPlantillaForForm = (plantilla: PlantillaIndicador) => {
    form.reset({
      codigo: generateNextCode(),
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion,
      formula: plantilla.formula,
      unidadMedida: plantilla.unidadMedida,
      frecuenciaMedicion: plantilla.frecuenciaMedicion,
      fuenteDatos: plantilla.fuenteDatos,
      factorDesempenoId: undefined,
      valorMeta: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined,
      valorActual: undefined,
      responsableId: undefined,
      activo: 1,
    });
  };

  const handleAddMedicion = (indicador: IndicadorSV) => {
    setIndicadorForMedicion(indicador);
    medicionForm.reset({
      fechaMedicion: getTodayDateString(),
      valor: "",
      observaciones: "",
    });
    setMedicionDialogOpen(true);
  };

  const handleExpandIndicador = (indicadorId: string) => {
    if (expandedIndicador === indicadorId) {
      setExpandedIndicador(null);
    } else {
      setExpandedIndicador(indicadorId);
    }
  };

  const filteredIndicadores = indicadores.filter((indicador) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      indicador.codigo.toLowerCase().includes(searchLower) ||
      indicador.nombre.toLowerCase().includes(searchLower) ||
      (indicador.descripcion?.toLowerCase().includes(searchLower) ?? false) ||
      (indicador.fuenteDatos?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getFrecuenciaBadge = (frecuencia: string) => {
    const config = FRECUENCIA_CONFIG[frecuencia as keyof typeof FRECUENCIA_CONFIG];
    if (!config) return null;
    return (
      <Badge className={config.className} data-testid={`badge-frecuencia-${frecuencia}`}>
        {config.label}
      </Badge>
    );
  };

  const getProgressPercentage = (indicador: IndicadorSV): number => {
    if (!indicador.valorActual || !indicador.valorMeta) return 0;
    const actual = parseFloat(indicador.valorActual);
    const meta = parseFloat(indicador.valorMeta);
    if (meta === 0) return 0;
    return Math.min(100, Math.round((actual / meta) * 100));
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusBadge = (indicador: IndicadorSV) => {
    if (!indicador.valorActual) {
      return (
        <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400" data-testid="badge-sin-medicion">
          Sin medición
        </Badge>
      );
    }
    if (!indicador.valorMeta) {
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400" data-testid="badge-sin-meta">
          Sin meta
        </Badge>
      );
    }
    const actual = parseFloat(indicador.valorActual);
    const meta = parseFloat(indicador.valorMeta);
    if (actual >= meta) {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-cumple-meta">
          Cumple meta
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400" data-testid="badge-no-cumple-meta">
        No cumple
      </Badge>
    );
  };

  const getFactorName = (factorId: string | null) => {
    if (!factorId) return null;
    const factor = factores.find((f) => f.id === factorId);
    return factor ? factor.nombre : null;
  };

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return null;
    const worker = workers.find((w) => w.id === workerId);
    return worker ? worker.name : null;
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Indicadores de Seguridad Vial (SPI)</h1>
          <p className="text-muted-foreground">
            ISO 39001:2012 - Cláusula 9.1 Seguimiento, medición, análisis y evaluación
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <HelpVideoButton customRoute="/pesv/indicadores" testId="button-help-video-pesv-indicadores" />
          <BackToPesvEvaluationButton />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/indicadores-sv/pdf', 'indicadores-sv.pdf')}
            data-testid="button-download-indicadores-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={handleOpenBulkDialog} data-testid="button-crear-desde-plantilla">
            <Zap className="h-4 w-4 mr-2" />
            Crear desde Plantillas ISO
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddIndicador} data-testid="button-agregar-indicador">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Manual
          </Button>
        </div>
      </div>

      <TrazabilidadPesvBanner codigoPaso="V01" compacto />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar indicadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-indicadores">{estadisticas.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Cumplen Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600" data-testid="text-cumplen-meta">{estadisticas.cumplenMeta}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              No Cumplen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600" data-testid="text-no-cumplen">{estadisticas.noCumplenMeta}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              Sin Medición
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600" data-testid="text-sin-medicion">{estadisticas.sinMedicion}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold" data-testid="text-lista-indicadores">Lista de Indicadores SPI</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : filteredIndicadores.length === 0 ? (
          <Card className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground" data-testid="text-no-indicadores">
              {searchTerm ? "No se encontraron indicadores con ese criterio de búsqueda" : "No hay indicadores de seguridad vial registrados"}
            </p>
            {!searchTerm && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleOpenBulkDialog}
                  data-testid="button-crear-desde-plantilla-empty"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Crear desde Plantillas ISO
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddIndicador}
                  data-testid="button-crear-primer-indicador"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear manualmente
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIndicadores.map((indicador) => {
              const progressPercentage = getProgressPercentage(indicador);
              const isExpanded = expandedIndicador === indicador.id;

              return (
                <Card key={indicador.id} className="hover-elevate" data-testid={`card-indicador-${indicador.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {getFrecuenciaBadge(indicador.frecuenciaMedicion)}
                        {getStatusBadge(indicador)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(indicador)}
                          data-testid={`button-edit-${indicador.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDeleteClick(e, indicador)}
                          data-testid={`button-delete-${indicador.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      <span className="text-muted-foreground font-mono text-sm">{indicador.codigo}</span>{" "}
                      {indicador.nombre}
                    </CardTitle>
                    {indicador.descripcion && (
                      <CardDescription className="line-clamp-2">{indicador.descripcion}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Meta:</span>
                        <span className="ml-2 font-medium">
                          {indicador.valorMeta ? `${indicador.valorMeta} ${indicador.unidadMedida}` : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="ml-2 font-medium">
                          {indicador.valorActual ? `${indicador.valorActual} ${indicador.unidadMedida}` : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mín:</span>
                        <span className="ml-2 font-medium">
                          {indicador.valorMinimo ? `${indicador.valorMinimo}` : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Máx:</span>
                        <span className="ml-2 font-medium">
                          {indicador.valorMaximo ? `${indicador.valorMaximo}` : "-"}
                        </span>
                      </div>
                    </div>

                    {indicador.valorMeta && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progreso hacia la meta</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(progressPercentage)} transition-all duration-300`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {indicador.formula && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Fórmula:</span>
                        <span className="ml-2 font-mono bg-muted px-2 py-1 rounded text-xs">{indicador.formula}</span>
                      </div>
                    )}

                    {getFactorName(indicador.factorDesempenoId) && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Factor SPF:</span>
                        <span className="ml-2">{getFactorName(indicador.factorDesempenoId)}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddMedicion(indicador)}
                        data-testid={`button-agregar-medicion-${indicador.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Medición
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExpandIndicador(indicador.id)}
                        data-testid={`button-ver-mediciones-${indicador.id}`}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Ver Mediciones
                        {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-3" data-testid="text-historial-mediciones">Historial de Mediciones</h4>
                        {mediciones.length === 0 ? (
                          <p className="text-sm text-muted-foreground" data-testid="text-no-mediciones">
                            No hay mediciones registradas para este indicador
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {mediciones.map((medicion) => (
                              <div
                                key={medicion.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                                data-testid={`medicion-${medicion.id}`}
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium">
                                    {new Date(medicion.fechaMedicion).toLocaleDateString("es-CO")}
                                  </span>
                                  <span className="text-lg font-bold">
                                    {medicion.valor} {indicador.unidadMedida}
                                  </span>
                                  {medicion.cumpleMeta === 1 ? (
                                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Cumple</Badge>
                                  ) : medicion.cumpleMeta === 0 ? (
                                    <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">No Cumple</Badge>
                                  ) : null}
                                </div>
                                {medicion.observaciones && (
                                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {medicion.observaciones}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle>{editingIndicador ? "Editar Indicador SPI" : "Nuevo Indicador SPI"}</DialogTitle>
            <DialogDescription>
              {editingIndicador
                ? "Modifique los datos del indicador de seguridad vial según ISO 39001"
                : "Registre un nuevo indicador de desempeño de seguridad vial según ISO 39001"
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!editingIndicador && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargar desde plantilla ISO 39001</label>
                  <Select
                    onValueChange={(val) => {
                      setSelectedPlantillaIdx(val);
                      if (val !== "none") {
                        const idx = parseInt(val);
                        handleSelectPlantillaForForm(PLANTILLAS_SPI[idx]);
                      }
                    }}
                    value={selectedPlantillaIdx}
                  >
                    <SelectTrigger data-testid="select-plantilla">
                      <SelectValue placeholder="Seleccionar plantilla para auto-llenar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Seleccionar plantilla...</SelectItem>
                      {PLANTILLAS_SPI.map((p, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Seleccione una plantilla para auto-llenar todos los campos. Puede modificar los datos después.
                  </p>
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
                        <Input placeholder="SPI-001" {...field} data-testid="input-codigo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frecuenciaMedicion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia de Medición *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-frecuencia">
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(FRECUENCIA_CONFIG).map(([key, config]) => (
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
                    <FormLabel>Nombre del Indicador *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre descriptivo del indicador" {...field} data-testid="input-nombre" />
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
                        placeholder="Descripción detallada del indicador"
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
                name="factorDesempenoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor de Desempeño (SPF)</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "none" ? null : val)} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-factor-desempeno">
                          <SelectValue placeholder="Seleccionar factor SPF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {factores.map((factor) => (
                          <SelectItem key={factor.id} value={factor.id}>
                            {factor.codigo} - {factor.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Vincule este indicador a un factor de desempeño SPF</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fórmula de Cálculo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: (Número de incidentes / Total de viajes) x 100"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-formula"
                      />
                    </FormControl>
                    <FormDescription>Describa cómo se calcula el indicador</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unidadMedida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de Medida *</FormLabel>
                      <FormControl>
                        <Input placeholder="%, número, tasa, etc." {...field} data-testid="input-unidad-medida" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuenteDatos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente de Datos</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="De dónde se obtienen los datos"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-fuente-datos"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="valorMeta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Meta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          data-testid="input-valor-meta"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorMinimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          data-testid="input-valor-minimo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorMaximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Máximo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          data-testid="input-valor-maximo"
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
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                          data-testid="input-valor-actual"
                        />
                      </FormControl>
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
                    : editingIndicador ? "Actualizar" : "Guardar"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={medicionDialogOpen} onOpenChange={(open) => { setMedicionDialogOpen(open); if (!open) setAutoCalcInfo(null); }}>
        <DialogContent className="w-[95vw] max-w-[520px] mx-auto">
          <DialogHeader>
            <DialogTitle>Nueva Medición</DialogTitle>
            <DialogDescription>
              Registre una nueva medición para el indicador{" "}
              <strong>{indicadorForMedicion?.codigo} - {indicadorForMedicion?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 px-4 py-3 flex items-start gap-3">
            <Calculator className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground leading-snug">
                Calcule el valor automáticamente a partir de los datos reales del sistema (flota, conductores, siniestros, capacitaciones).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoCalculate}
              disabled={isAutoCalculating}
              data-testid="button-auto-calcular"
              className="shrink-0"
            >
              {isAutoCalculating ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Calculando...</>
              ) : (
                <><Calculator className="h-4 w-4 mr-1" /> Auto-calcular</>
              )}
            </Button>
          </div>

          {autoCalcInfo && (
            <div className={`rounded-md border px-4 py-3 text-sm space-y-1 ${autoCalcInfo.calculable ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800"}`}>
              <div className="flex items-center gap-2 font-medium">
                <Info className="h-4 w-4 shrink-0" />
                {autoCalcInfo.calculable ? "Valor calculado automáticamente" : "Cálculo no disponible"}
              </div>
              <p className="text-muted-foreground">{autoCalcInfo.observaciones}</p>
              {autoCalcInfo.fuente && (
                <p className="text-muted-foreground text-xs">Fuente: {autoCalcInfo.fuente}</p>
              )}
            </div>
          )}

          <Form {...medicionForm}>
            <form onSubmit={medicionForm.handleSubmit(onSubmitMedicion)} className="space-y-4">
              <FormField
                control={medicionForm.control}
                name="fechaMedicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Medición *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-medicion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={medicionForm.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Valor en ${indicadorForMedicion?.unidadMedida || "unidades"}`}
                        {...field}
                        data-testid="input-valor-medicion"
                      />
                    </FormControl>
                    <FormDescription>
                      Unidad: {indicadorForMedicion?.unidadMedida || "No especificada"}
                      {indicadorForMedicion?.valorMeta && ` | Meta: ${indicadorForMedicion.valorMeta}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={medicionForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones sobre esta medición"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-observaciones-medicion"
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
                  onClick={() => { setMedicionDialogOpen(false); setAutoCalcInfo(null); }}
                  data-testid="button-cancelar-medicion"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createMedicionMutation.isPending}
                  data-testid="button-guardar-medicion"
                >
                  {createMedicionMutation.isPending ? "Guardando..." : "Registrar Medición"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar indicador SPI?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el indicador{" "}
              <strong>{indicadorToDelete?.codigo} - {indicadorToDelete?.nombre}</strong> y todas sus mediciones asociadas.
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

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle>Crear Indicadores desde Plantillas ISO 39001</DialogTitle>
            <DialogDescription>
              Seleccione los indicadores SPI predefinidos que desea crear. Se generarán automáticamente con todos los campos completados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <span className="text-sm text-muted-foreground">
                {selectedPlantillas.length} de {PLANTILLAS_SPI.length} seleccionados
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const available = plantillasDisponibles.filter((p) => !p.yaExiste).map((p) => p.idx);
                    setSelectedPlantillas(available);
                  }}
                  data-testid="button-seleccionar-todos"
                >
                  Seleccionar todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlantillas([])}
                  data-testid="button-deseleccionar-todos"
                >
                  Deseleccionar todos
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {plantillasDisponibles.map((plantilla) => (
                <div
                  key={plantilla.idx}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    plantilla.yaExiste
                      ? "opacity-50 cursor-not-allowed border-muted"
                      : selectedPlantillas.includes(plantilla.idx)
                        ? "border-green-500 bg-green-500/5"
                        : "hover-elevate"
                  }`}
                  onClick={() => !plantilla.yaExiste && togglePlantilla(plantilla.idx)}
                  data-testid={`plantilla-item-${plantilla.idx}`}
                >
                  <div className="mt-0.5">
                    {plantilla.yaExiste ? (
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    ) : selectedPlantillas.includes(plantilla.idx) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{plantilla.nombre}</span>
                      {plantilla.yaExiste && (
                        <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">Ya existe</Badge>
                      )}
                      <Badge className={FRECUENCIA_CONFIG[plantilla.frecuenciaMedicion]?.className || ""}>
                        {FRECUENCIA_CONFIG[plantilla.frecuenciaMedicion]?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plantilla.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unidad: {plantilla.unidadMedida} | Fuente: {plantilla.fuenteDatos}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDialogOpen(false)}
              data-testid="button-cancelar-bulk"
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleBulkCreate}
              disabled={selectedPlantillas.length === 0 || bulkCreateMutation.isPending}
              data-testid="button-crear-seleccionados"
            >
              {bulkCreateMutation.isPending
                ? "Creando..."
                : `Crear ${selectedPlantillas.length} indicador${selectedPlantillas.length !== 1 ? "es" : ""}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
