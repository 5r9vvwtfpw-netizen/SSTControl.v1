import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Plus, Search, Pencil, Trash2, User, Printer, Bot, DollarSign, Users, Wrench, FileText, TrendingUp, CalendarDays, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo, ESTANDARES_RECURSOS } from "@/data/planear-normativa";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDateShort, getTodayDateString } from "@/lib/utils/formatters";
import type { ResourceAllocation, Worker, AdquisicionItem } from "@shared/schema";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const formSchema = z.object({
  date: z.string().min(1, "Fecha requerida"),
  resourceType: z.enum(["humano", "fisico", "financiero"], {
    required_error: "Tipo de recurso requerido",
  }),
  // Campos recursos humanos
  workerId: z.string().optional(), // ID del trabajador seleccionado
  cargo: z.string().optional(),
  cedula: z.string().optional(),
  nombreCompleto: z.string().optional(),
  // Campos recursos físicos
  nombreEquipo: z.string().optional(),
  objeto: z.string().optional(),
  numUnidades: z.coerce.number().optional(),
  serial: z.string().optional(),
  implementosNivel: z.enum(["basico", "intervencion"]).optional(),
  // Campos financieros
  inversionEstimada: z.string().optional(),
  fechaDesembolso: z.string().optional(),
  // Campos generales
  objetivoGeneral: z.string().optional(),
  // Campos de aprobación
  elaboradoPorId: z.string().optional(),
  autorizadoPorId: z.string().optional(),
  aprobadoPorId: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validación condicional para recursos humanos
  if (data.resourceType === "humano") {
    if (!data.workerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar un trabajador para recursos humanos",
        path: ["workerId"],
      });
    }
    if (!data.cargo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cargo es requerido para recursos humanos",
        path: ["cargo"],
      });
    }
    if (!data.cedula) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cédula es requerida para recursos humanos",
        path: ["cedula"],
      });
    }
    if (!data.nombreCompleto) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nombre completo es requerido para recursos humanos",
        path: ["nombreCompleto"],
      });
    }
  }
  
  // Validación condicional para recursos físicos
  if (data.resourceType === "fisico") {
    if (!data.nombreEquipo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nombre del equipo es requerido para recursos físicos",
        path: ["nombreEquipo"],
      });
    }
    if (!data.numUnidades) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número de unidades es requerido para recursos físicos",
        path: ["numUnidades"],
      });
    }
  }
  
  // Validación condicional para recursos financieros
  if (data.resourceType === "financiero") {
    if (!data.objetivoGeneral) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El concepto/objetivo es requerido para recursos financieros",
        path: ["objetivoGeneral"],
      });
    }
    if (!data.inversionEstimada) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inversión estimada es requerida para recursos financieros",
        path: ["inversionEstimada"],
      });
    }
    if (!data.fechaDesembolso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fecha de desembolso es requerida para recursos financieros",
        path: ["fechaDesembolso"],
      });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

const predefinedResources = [
  { id: 'humano', nombre: 'Recurso Humano - Personal SST', tipo: 'humano', objetivo: 'Asignación de recurso humano capacitado para el desarrollo, implementación y mantenimiento del Sistema de Gestión de SST según Decreto 1072/2015, Art. 2.2.4.6.8' },
  { id: 'financiero', nombre: 'Recurso Financiero - Presupuesto SST', tipo: 'financiero', objetivo: 'Asignación de presupuesto para el desarrollo de actividades del SG-SST: capacitación, EPP, señalización, exámenes médicos, equipos de emergencia y auditorías según Decreto 1072/2015, Art. 2.2.4.6.8' },
  { id: 'tecnico', nombre: 'Recurso Técnico - Equipos y Herramientas', tipo: 'fisico', objetivo: 'Asignación de equipos y herramientas técnicas para el desarrollo del SG-SST: equipos de medición, software SST, equipos de emergencia, señalización y EPP según Decreto 1072/2015, Art. 2.2.4.6.8' },
];

export default function ResourceAllocation() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<ResourceAllocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPredefinido, setSelectedPredefinido] = useState("");


  const { data: allocations = [], isLoading } = useQuery<ResourceAllocation[]>({
    queryKey: ["/api/resource-allocations"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: adquisicionItems = [] } = useQuery<AdquisicionItem[]>({
    queryKey: ["/api/adquisicion-items"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: getTodayDateString(),
      resourceType: "humano",
      workerId: "",
      cargo: "",
      cedula: "",
      nombreCompleto: "",
      nombreEquipo: "",
      objeto: "",
      serial: "",
      inversionEstimada: "",
      fechaDesembolso: "",
      objetivoGeneral: "",
      elaboradoPorId: "",
      autorizadoPorId: "",
      aprobadoPorId: "",
    },
  });

  const watchResourceType = form.watch("resourceType");

  const handleWorkerSelect = (workerId: string) => {
    const selectedWorker = workers.find(w => w.id === workerId);
    if (selectedWorker) {
      form.setValue("workerId", workerId);
      form.setValue("nombreCompleto", selectedWorker.name);
      form.setValue("cargo", selectedWorker.position);
      form.setValue("cedula", selectedWorker.identificationNumber || "");
      
      if (!selectedWorker.identificationNumber) {
        toast({
          title: "Atención",
          description: "Este trabajador no tiene cédula registrada. Por favor complétela manualmente.",
          variant: "default",
        });
      }
    }
  };

  const positions = [
    // Cargos Directivos y Administrativos
    "Gerente General",
    "Director Administrativo",
    "Director de Operaciones",
    "Director Comercial",
    "Director Financiero",
    "Director de Recursos Humanos",
    "Subgerente",
    "Jefe de Personal",
    "Jefe de Compras",
    "Jefe de Ventas",
    "Contador",
    "Auxiliar Contable",
    "Asistente Administrativo",
    "Asistente de Gerencia",
    "Recepcionista",
    "Secretaria Ejecutiva",
    "Mensajero",
    // Cargos de SST y Calidad
    "Coordinador de SST",
    "Responsable de SST",
    "Profesional en SST",
    "Técnico en SST",
    "Licenciado en Salud Ocupacional",
    "Médico Ocupacional",
    "Enfermero(a) Ocupacional",
    "Auxiliar de Enfermería",
    "Supervisor de Calidad",
    "Técnico de Calidad",
    "Analista de Calidad",
    "Inspector de Calidad",
    // Cargos de Producción y Operaciones
    "Jefe de Producción",
    "Supervisor de Producción",
    "Operario de Producción",
    "Operador de Máquina",
    "Auxiliar de Producción",
    "Jefe de Mantenimiento",
    "Ingeniero de Mantenimiento",
    "Técnico de Mantenimiento",
    "Mecánico Industrial",
    "Mecánico",
    "Electricista",
    "Soldador",
    "Tornero",
    "Fresador",
    // Cargos de Logística y Almacén
    "Jefe de Logística",
    "Coordinador de Logística",
    "Almacenista",
    "Auxiliar de Almacén",
    "Despachador",
    "Empacador",
    "Conductor",
    "Conductor de Carga",
    "Montacarguista",
    // Cargos Comerciales
    "Vendedor",
    "Asesor Comercial",
    "Ejecutivo de Cuenta",
    "Representante de Ventas",
    // Cargos de Servicios Generales
    "Auxiliar de Servicios Generales",
    "Vigilante de Seguridad",
    "Portero",
    "Jardinero",
    // Cargos de Ingeniería
    "Ingeniero Industrial",
    "Ingeniero Civil",
    "Ingeniero Mecánico",
    "Ingeniero Eléctrico",
    "Ingeniero Ambiental",
    "Ingeniero de Sistemas",
    "Arquitecto",
    "Diseñador Industrial",
    // Cargos de Construcción
    "Maestro de Obra",
    "Oficial de Construcción",
    "Ayudante de Construcción",
    "Carpintero",
    "Pintor",
    "Plomero",
    "Albañil",
    // Otros cargos comunes
    "Analista",
    "Coordinador",
    "Supervisor",
    "Técnico",
    "Auxiliar",
    "Practicante",
    "Aprendiz SENA",
  ];

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/resource-allocations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-allocations"] });
      toast({
        title: "✓ Acta registrada",
        description: "La asignación de recursos se guardó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setIsDialogOpen(false);
      form.reset({
        date: getTodayDateString(),
        resourceType: "humano",
        workerId: "",
        cargo: "",
        cedula: "",
        nombreCompleto: "",
        nombreEquipo: "",
        objeto: "",
        serial: "",
        inversionEstimada: "",
        fechaDesembolso: "",
        objetivoGeneral: "",
        elaboradoPorId: "",
        autorizadoPorId: "",
        aprobadoPorId: "",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la asignación",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      return await apiRequest("PATCH", `/api/resource-allocations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-allocations"] });
      toast({
        title: "✓ Acta actualizada",
        description: "Los cambios se guardaron exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setIsDialogOpen(false);
      setEditingAllocation(null);
      form.reset({
        date: getTodayDateString(),
        resourceType: "humano",
        workerId: "",
        cargo: "",
        cedula: "",
        nombreCompleto: "",
        nombreEquipo: "",
        objeto: "",
        serial: "",
        inversionEstimada: "",
        fechaDesembolso: "",
        objetivoGeneral: "",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la asignación",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/resource-allocations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resource-allocations"] });
      toast({
        title: "✓ Acta eliminada",
        description: "La asignación se eliminó correctamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la asignación",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Limpiar campos vacíos antes de enviar (convertir "" a undefined para evitar errores de FK)
    const cleanedData = {
      ...data,
      workerId: data.workerId || undefined,
      cargo: data.cargo || undefined,
      cedula: data.cedula || undefined,
      nombreCompleto: data.nombreCompleto || undefined,
      nombreEquipo: data.nombreEquipo || undefined,
      objeto: data.objeto || undefined,
      serial: data.serial || undefined,
      inversionEstimada: data.inversionEstimada || undefined,
      fechaDesembolso: data.fechaDesembolso || undefined,
      objetivoGeneral: data.objetivoGeneral || undefined,
      // Campos de aprobación - convertir "" a undefined para evitar error FK
      elaboradoPorId: data.elaboradoPorId || undefined,
      autorizadoPorId: data.autorizadoPorId || undefined,
      aprobadoPorId: data.aprobadoPorId || undefined,
    };

    if (editingAllocation) {
      updateMutation.mutate({ id: editingAllocation.id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const handleEdit = (allocation: ResourceAllocation) => {
    setEditingAllocation(allocation);
    form.reset({
      date: allocation.date,
      resourceType: allocation.resourceType,
      workerId: allocation.workerId || "",
      cargo: allocation.cargo || "",
      cedula: allocation.cedula || "",
      nombreCompleto: allocation.nombreCompleto || "",
      nombreEquipo: allocation.nombreEquipo || "",
      objeto: allocation.objeto || "",
      numUnidades: allocation.numUnidades || undefined,
      serial: allocation.serial || "",
      implementosNivel: allocation.implementosNivel || undefined,
      inversionEstimada: allocation.inversionEstimada || "",
      fechaDesembolso: allocation.fechaDesembolso || "",
      objetivoGeneral: allocation.objetivoGeneral || "",
      elaboradoPorId: allocation.elaboradoPorId || "",
      autorizadoPorId: allocation.autorizadoPorId || "",
      aprobadoPorId: allocation.aprobadoPorId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta asignación de recursos?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredAllocations = allocations.filter((alloc) => {
    // Si no hay término de búsqueda, mostrar todas las asignaciones
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      alloc.nombreCompleto?.toLowerCase().includes(searchLower) ||
      alloc.nombreEquipo?.toLowerCase().includes(searchLower) ||
      alloc.cedula?.toLowerCase().includes(searchLower) ||
      alloc.objeto?.toLowerCase().includes(searchLower) ||
      alloc.objetivoGeneral?.toLowerCase().includes(searchLower) ||
      alloc.resourceType?.toLowerCase().includes(searchLower) ||
      alloc.cargo?.toLowerCase().includes(searchLower)
    );
  });

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      humano: "Humano",
      fisico: "Físico",
      financiero: "Financiero",
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Function to download ISO-formatted PDF
  const handlePrintActa = async (allocationId: string) => {
    try {
      const response = await fetch(`/api/resource-allocations/${allocationId}/acta`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el acta');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Acta-Recurso-${allocationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Acta generada",
        description: "El documento PDF se ha descargado correctamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el acta",
        variant: "destructive",
      });
    }
  };

  const estandarRecursos = getEstandarByCodigo('1.1.3');

  // Calcular resumen de inversiones por tipo de recurso
  const resumenInversiones = {
    humano: allocations
      .filter(a => a.resourceType === 'humano')
      .reduce((sum, a) => sum + (parseFloat(a.inversionEstimada?.replace(/[^0-9.-]+/g, '') || '0') || 0), 0),
    fisico: allocations
      .filter(a => a.resourceType === 'fisico')
      .reduce((sum, a) => sum + (parseFloat(a.inversionEstimada?.replace(/[^0-9.-]+/g, '') || '0') || 0), 0),
    financiero: allocations
      .filter(a => a.resourceType === 'financiero')
      .reduce((sum, a) => sum + (parseFloat(a.inversionEstimada?.replace(/[^0-9.-]+/g, '') || '0') || 0), 0),
    total: allocations
      .filter(a => a.resourceType === 'financiero')
      .reduce((sum, a) => sum + (parseFloat(a.inversionEstimada?.replace(/[^0-9.-]+/g, '') || '0') || 0), 0),
    cantidadHumano: allocations.filter(a => a.resourceType === 'humano').length,
    cantidadFisico: allocations.filter(a => a.resourceType === 'fisico').length,
    cantidadFinanciero: allocations.filter(a => a.resourceType === 'financiero').length,
    totalUnidadesFisicas: allocations
      .filter(a => a.resourceType === 'fisico')
      .reduce((sum, a) => sum + (a.numUnidades || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseCurrencyValue = (value: string | null | undefined): number => {
    if (!value) return 0;
    const digits = value.replace(/[^\d]/g, '');
    return parseInt(digits, 10) || 0;
  };

  const financialAllocations = allocations.filter(a => a.resourceType === 'financiero');
  
  // Calcular monto ejecutado sumando los items de adquisición vinculados a cada recurso
  const calcularMontoEjecutadoPorRecurso = (resourceId: string): number => {
    return adquisicionItems
      .filter(item => item.resourceAllocationId === resourceId)
      .reduce((sum, item) => sum + (item.precioTotal || 0), 0);
  };

  const totalEjecutadoDesdeItems = financialAllocations.reduce((sum, a) => {
    return sum + calcularMontoEjecutadoPorRecurso(a.id);
  }, 0);

  const resumenEjecucionFinanciera = {
    totalAsignado: financialAllocations.reduce((sum, a) => sum + parseCurrencyValue(a.inversionEstimada), 0),
    totalEjecutado: totalEjecutadoDesdeItems,
  };
  
  const saldoDisponible = resumenEjecucionFinanciera.totalAsignado - resumenEjecucionFinanciera.totalEjecutado;
  const porcentajeEjecutado = resumenEjecucionFinanciera.totalAsignado > 0 
    ? (resumenEjecucionFinanciera.totalEjecutado / resumenEjecucionFinanciera.totalAsignado) * 100 
    : 0;

  const getBudgetStatusColor = (percentage: number): string => {
    if (percentage > 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBudgetProgressColor = (percentage: number): string => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleDownloadResumenPdf = () => {
    window.open('/api/resource-allocations/resumen-pdf', '_blank');
  };

  const handleAutoFillFromPredefinido = (resourceId: string) => {
    if (!resourceId) return;
    
    const resource = predefinedResources.find(r => r.id === resourceId);
    if (!resource) return;
    
    form.setValue('resourceType', resource.tipo as "humano" | "fisico" | "financiero");
    form.setValue('objetivoGeneral', resource.objetivo);
    
    toast({
      title: "Tipo de recurso aplicado",
      description: `Se ha pre-cargado la información de "${resource.nombre}"`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <BackToEvaluationButton />
        <div className="flex items-center gap-2">
          <Link href="/pesv/evaluaciones">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md" data-testid="button-ir-evaluacion-pesv">
              <Target className="h-4 w-4 mr-2" />
              Ir a Evaluación PESV
            </Button>
          </Link>
          <BackToCronogramaButton />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Asignación de Recursos</h1>
          <p className="text-muted-foreground mt-1">
            Gestione las actas de designación de recursos para el SG-SST
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="default"
                onClick={() => {
                  setEditingAllocation(null);
                  form.reset({
                    date: getTodayDateString(),
                    resourceType: "humano",
                    workerId: "",
                    cargo: "",
                    cedula: "",
                    nombreCompleto: "",
                    nombreEquipo: "",
                    objeto: "",
                    serial: "",
                    inversionEstimada: "",
                    fechaDesembolso: "",
                    objetivoGeneral: "",
                    elaboradoPorId: "",
                    autorizadoPorId: "",
                    aprobadoPorId: "",
                  });
                }}
                data-testid="button-new-allocation"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Acta
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {estandarRecursos && (
        <AutomationAssistant
          titulo="Asignación de Recursos para el SG-SST"
          estandar={estandarRecursos.codigo}
          descripcion="Recursos financieros, técnicos y humanos para el SG-SST según Decreto 1072/2015"
          normativaAplicable={estandarRecursos.normativaAplicable}
          compact={true}
        />
      )}

      {/* Panel de Resumen Presupuestal para Auditorías */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-lg text-green-800 dark:text-green-200">Resumen Presupuestal SST</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadResumenPdf}
              className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300"
              data-testid="button-download-resumen-pdf"
            >
              <FileText className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
          <CardDescription className="text-green-600 dark:text-green-400">
            Evidencia de asignación de recursos para el Estándar 1.1.3 - Resolución 0312/2019
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Recurso Humano</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{resumenInversiones.cantidadHumano} {resumenInversiones.cantidadHumano === 1 ? 'persona' : 'personas'}</p>
              <p className="text-xs text-muted-foreground">Personal asignado al SG-SST</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">Recurso Físico</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{resumenInversiones.totalUnidadesFisicas} {resumenInversiones.totalUnidadesFisicas === 1 ? 'unidad' : 'unidades'}</p>
              <p className="text-xs text-muted-foreground">{resumenInversiones.cantidadFisico} equipos/herramientas</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Recurso Financiero</span>
              </div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(resumenInversiones.financiero)}</p>
              <p className="text-xs text-muted-foreground">{resumenInversiones.cantidadFinanciero} asignaciones</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 border border-green-300 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-700 dark:text-green-300" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Inversión SST</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(resumenInversiones.total)}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{allocations.length} asignaciones totales</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Ejecución Presupuestal - Recursos Financieros */}
      {financialAllocations.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-budget-execution">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Ejecución Presupuestal - Recursos Financieros</CardTitle>
            </div>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Estado de ejecución del presupuesto asignado para recursos financieros SST
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800" data-testid="budget-total-asignado">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">Inversión Estimada</span>
                </div>
                <p className="text-xl font-bold text-blue-600" data-testid="text-inversion-estimada">
                  {formatCurrency(resumenEjecucionFinanciera.totalAsignado)}
                </p>
                <p className="text-xs text-muted-foreground">Presupuesto total asignado</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800" data-testid="budget-total-ejecutado">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">Monto Ejecutado</span>
                </div>
                <p className={`text-xl font-bold ${getBudgetStatusColor(porcentajeEjecutado)}`} data-testid="text-monto-ejecutado">
                  {formatCurrency(resumenEjecucionFinanciera.totalEjecutado)}
                </p>
                <p className="text-xs text-muted-foreground">{porcentajeEjecutado.toFixed(1)}% del presupuesto</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800" data-testid="budget-saldo-disponible">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-muted-foreground">Saldo Disponible</span>
                </div>
                <p className={`text-xl font-bold ${saldoDisponible < 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} data-testid="text-saldo-disponible">
                  {formatCurrency(saldoDisponible)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {saldoDisponible < 0 ? 'Sobrepasado' : 'Disponible para ejecutar'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2" data-testid="budget-progress-container">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso de ejecución</span>
                <span className={`font-medium ${getBudgetStatusColor(porcentajeEjecutado)}`} data-testid="text-porcentaje-ejecutado">
                  {porcentajeEjecutado.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className={`h-full transition-all ${getBudgetProgressColor(porcentajeEjecutado)}`}
                  style={{ width: `${Math.min(porcentajeEjecutado, 100)}%` }}
                  data-testid="progress-budget-execution"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className={porcentajeEjecutado >= 80 && porcentajeEjecutado <= 100 ? 'font-bold text-yellow-600' : ''}>80%</span>
                <span className={porcentajeEjecutado > 100 ? 'font-bold text-red-600' : ''}>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAllocation ? "Editar" : "Nueva"} Asignación de Recursos
              </DialogTitle>
              <DialogDescription>
                Complete los campos según el tipo de recurso que desea asignar
              </DialogDescription>
            </DialogHeader>

            {!editingAllocation && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione un tipo de recurso predefinido para auto-rellenar los campos</p>
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedPredefinido} onValueChange={(value) => {
                        setSelectedPredefinido(value);
                        handleAutoFillFromPredefinido(value);
                      }}>
                        <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-predefinido">
                          <SelectValue placeholder="Seleccione un tipo de recurso..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {predefinedResources.map((resource) => (
                            <SelectItem key={resource.id} value={resource.id}>
                              {resource.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Hoy *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Recurso *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-resource-type">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="humano">Humano</SelectItem>
                            <SelectItem value="fisico">Físico</SelectItem>
                            <SelectItem value="financiero">Financiero</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campos para Recursos Humanos */}
                {watchResourceType === "humano" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg">Datos del Personal</h3>
                    
                    {/* Selector de Trabajador */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-medium">Seleccionar Trabajador Existente</Label>
                      </div>
                      <FormField
                        control={form.control}
                        name="workerId"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleWorkerSelect(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-worker" className="bg-background">
                                  <SelectValue placeholder="Busque y seleccione un trabajador..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {workers.map((worker) => (
                                  <SelectItem key={worker.id} value={worker.id}>
                                    {worker.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Al seleccionar un trabajador, se autocompletará nombre, cargo y cédula
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Campos editables después de selección */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cargo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cargo del trabajador"
                                {...field}
                                data-testid="input-cargo"
                                readOnly
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Este campo se autocompleta al seleccionar un trabajador
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cedula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cédula *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cédula del trabajador"
                                {...field}
                                data-testid="input-cedula"
                                readOnly
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nombreCompleto"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nombre Completo *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nombre completo del personal"
                                {...field}
                                data-testid="input-nombre-completo"
                                readOnly
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Este campo se autocompleta al seleccionar un trabajador
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Campos para Recursos Físicos */}
                {watchResourceType === "fisico" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg">Datos del Equipo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombreEquipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Equipo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nombre del equipo"
                                {...field}
                                data-testid="input-nombre-equipo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="implementosNivel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Implementos del Nivel</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-implementos-nivel">
                                  <SelectValue placeholder="Seleccione nivel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="basico">Básico</SelectItem>
                                <SelectItem value="intervencion">Intervención</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numUnidades"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° Unidades</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Número de unidades"
                                {...field}
                                data-testid="input-num-unidades"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="serial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serial</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Número de serial"
                                {...field}
                                data-testid="input-serial"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="objeto"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Objeto</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Descripción del objeto"
                                {...field}
                                data-testid="input-objeto"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Campos para Recursos Financieros */}
                {watchResourceType === "financiero" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg">Datos Financieros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="objetivoGeneral"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Concepto / Objetivo del Recurso *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-objetivo-financiero">
                                  <SelectValue placeholder="Seleccione el concepto del recurso" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Programa EVS - Estilos de Vida Saludable">Programa EVS - Estilos de Vida Saludable</SelectItem>
                                <SelectItem value="Programa EVS - Prevención Tabaquismo">Programa EVS - Prevención Tabaquismo</SelectItem>
                                <SelectItem value="Programa EVS - Prevención Alcoholismo">Programa EVS - Prevención Alcoholismo</SelectItem>
                                <SelectItem value="Programa EVS - Prevención Drogas">Programa EVS - Prevención Drogas</SelectItem>
                                <SelectItem value="Programa EVS - Salud Mental">Programa EVS - Salud Mental</SelectItem>
                                <SelectItem value="Programa EVS - Actividad Física">Programa EVS - Actividad Física</SelectItem>
                                <SelectItem value="Capacitaciones SST">Capacitaciones SST</SelectItem>
                                <SelectItem value="Equipos de Protección Personal (EPP)">Equipos de Protección Personal (EPP)</SelectItem>
                                <SelectItem value="Exámenes Médicos Ocupacionales">Exámenes Médicos Ocupacionales</SelectItem>
                                <SelectItem value="Señalización y Demarcación">Señalización y Demarcación</SelectItem>
                                <SelectItem value="Equipos de Emergencia">Equipos de Emergencia</SelectItem>
                                <SelectItem value="Botiquines y Primeros Auxilios">Botiquines y Primeros Auxilios</SelectItem>
                                <SelectItem value="Auditorías SST">Auditorías SST</SelectItem>
                                <SelectItem value="Mediciones Higiénicas">Mediciones Higiénicas</SelectItem>
                                <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
                                <SelectItem value="Software y Licencias SST">Software y Licencias SST</SelectItem>
                                <SelectItem value="Investigación de Incidentes">Investigación de Incidentes</SelectItem>
                                <SelectItem value="Plan de Emergencias">Plan de Emergencias</SelectItem>
                                <SelectItem value="COPASST - Comité Paritario">COPASST - Comité Paritario</SelectItem>
                                <SelectItem value="Otros - General SST">Otros - General SST</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Seleccione el programa o actividad SST al que se destina este recurso
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="inversionEstimada"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inversión Estimada (COP) *</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                value={field.value ? parseInt(field.value.replace(/\D/g, ''), 10) : undefined}
                                onChange={(val) => field.onChange(val !== undefined ? val.toString() : '')}
                                data-testid="input-inversion-estimada"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Ingrese el monto en pesos colombianos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fechaDesembolso"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Desembolso *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                data-testid="input-fecha-desembolso"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Firmas de Aprobación */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Firmas de Aprobación (Opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="elaboradoPorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Elaborado por</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-elaborado-por">
                                <SelectValue placeholder="Seleccione trabajador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={`elaborado-${worker.id}`} value={worker.id}>
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
                      name="autorizadoPorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Autorizado por</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-autorizado-por">
                                <SelectValue placeholder="Seleccione trabajador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={`autorizado-${worker.id}`} value={worker.id}>
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
                      name="aprobadoPorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aprobado por</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-aprobado-por">
                                <SelectValue placeholder="Seleccione trabajador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={`aprobado-${worker.id}`} value={worker.id}>
                                  {worker.name} - {worker.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Objetivo General - visible para todos los tipos */}
                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="objetivoGeneral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo General</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el objetivo general de esta asignación de recursos..."
                            className="resize-none"
                            rows={4}
                            {...field}
                            data-testid="input-objetivo-general"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingAllocation(null);
                      form.reset({
                        date: getTodayDateString(),
                        resourceType: "humano",
                        workerId: "",
                        cargo: "",
                        cedula: "",
                        nombreCompleto: "",
                        nombreEquipo: "",
                        objeto: "",
                        serial: "",
                        inversionEstimada: "",
                        fechaDesembolso: "",
                        objetivoGeneral: "",
                        elaboradoPorId: "",
                        autorizadoPorId: "",
                        aprobadoPorId: "",
                      });
                    }}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  {editingAllocation && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePrintActa(editingAllocation.id)}
                      data-testid="button-print-modal"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Descargar Acta PDF
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Guardando..."
                      : editingAllocation
                      ? "Actualizar"
                      : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
      </Dialog>

      {/* Search bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Asignaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, cédula, equipo, objeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            data-testid="input-search"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Asignaciones</CardTitle>
          <CardDescription>
            {filteredAllocations.length} asignación(es) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : filteredAllocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron asignaciones
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.map((allocation) => (
                  <TableRow key={allocation.id} data-testid={`row-allocation-${allocation.id}`}>
                    <TableCell>
                      {formatDateShort(allocation.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getResourceTypeLabel(allocation.resourceType)}</Badge>
                    </TableCell>
                    <TableCell>
                      {allocation.resourceType === "humano" && (
                        <div>
                          <div className="font-medium">{allocation.nombreCompleto}</div>
                          <div className="text-sm text-muted-foreground">
                            {allocation.cargo} - CC: {allocation.cedula}
                          </div>
                        </div>
                      )}
                      {allocation.resourceType === "fisico" && (
                        <div>
                          <div className="font-medium">{allocation.nombreEquipo}</div>
                          <div className="text-sm text-muted-foreground">
                            {allocation.numUnidades} unidad(es) - {allocation.objeto}
                          </div>
                        </div>
                      )}
                      {allocation.resourceType === "financiero" && (() => {
                        const asignado = parseCurrencyValue(allocation.inversionEstimada);
                        const ejecutado = calcularMontoEjecutadoPorRecurso(allocation.id);
                        const itemPercent = asignado > 0 ? (ejecutado / asignado) * 100 : 0;
                        return (
                          <div className="space-y-2" data-testid={`financial-info-${allocation.id}`}>
                            <div className="font-medium" data-testid={`text-ejecutado-asignado-${allocation.id}`}>
                              {formatCurrency(ejecutado)} / {formatCurrency(asignado)}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden" data-testid={`progress-allocation-${allocation.id}`}>
                                <div 
                                  className={`h-full transition-all ${getBudgetProgressColor(itemPercent)}`}
                                  style={{ width: `${Math.min(itemPercent, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium min-w-[45px] text-right ${getBudgetStatusColor(itemPercent)}`} data-testid={`text-percent-${allocation.id}`}>
                                {itemPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Desembolso: {allocation.fechaDesembolso ? formatDateShort(allocation.fechaDesembolso) : "N/A"}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {allocation.objetivoGeneral || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintActa(allocation.id)}
                          data-testid={`button-print-${allocation.id}`}
                        >
                          <Printer className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(allocation)}
                          data-testid={`button-edit-${allocation.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(allocation.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${allocation.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
