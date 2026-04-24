import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getTodayDateString, formatDateShort } from "@/lib/utils/formatters";
import { 
  insertAfiliacionSsssSchema, 
  type AfiliacionSsss, 
  type Worker, 
  type Company,
  type VerificacionMuestreoSgss,
  type DetalleVerificacionSgss,
  insertVerificacionMuestreoSgssSchema,
  type HighRiskWorker,
  insertHighRiskWorkerSchema
} from "@shared/schema";
import { Pencil, Trash2, FileText, Search, CheckCircle2, Building2, Copy, Sparkles, Settings, Users, Zap, ClipboardCheck, Calendar, AlertCircle, Eye, Plus, RefreshCw, UserCheck, Download, AlertTriangle, FileDown, Upload, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { EPS_COLOMBIA, ARL_COLOMBIA, AFP_COLOMBIA, CCF_COLOMBIA, AGREMIACIONES_AUTORIZADAS_MINSALUD, ACTIVIDADES_ALTO_RIESGO_DEC_2090, getActividadAltoRiesgoByValue } from "@/data/catalogos-sst";
import { compressImage } from "@/lib/imageCompression";

const formSchema = insertAfiliacionSsssSchema.extend({
  workerId: z.string().min(1, "Debe seleccionar un trabajador"),
  fecha: z.string().min(1, "Fecha es requerida"),
});

type FormValues = z.infer<typeof formSchema>;

type ProviderType = 'eps' | 'arl' | 'afp' | 'ccf';

interface ProviderInfo {
  codigo: string;
  nombre: string;
  nit: string;
}

const verificacionFormSchema = z.object({
  fecha: z.string().min(1, "La fecha de verificación es obligatoria"),
  periodoVerificado: z.string().min(1, "El período verificado es obligatorio"),
  pilaFileUrl: z.string().optional(),
  observaciones: z.string().optional(),
});

type VerificacionFormValues = z.infer<typeof verificacionFormSchema>;

const highRiskFormSchema = insertHighRiskWorkerSchema.omit({ companyId: true }).extend({
  workerId: z.string().min(1, "Debe seleccionar un trabajador"),
  actividadRiesgo: z.string().min(1, "Debe seleccionar una actividad de alto riesgo"),
  porcentajeCotizacionEspecial: z.string().optional(),
  ultimoMesPagado: z.string().optional(),
  cumpleCotizacion: z.boolean().optional(),
  soportePilaUrl: z.string().optional(),
  observaciones: z.string().optional(),
});

type HighRiskFormValues = z.infer<typeof highRiskFormSchema>;

function calcularMuestraRequerida(totalTrabajadores: number): number {
  if (totalTrabajadores <= 50) return totalTrabajadores;
  if (totalTrabajadores <= 200) return Math.ceil(totalTrabajadores * 0.10);
  return 30;
}

function getEstadoBadge(estado: string | null) {
  switch (estado) {
    case 'completada':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Completada</Badge>;
    case 'en_proceso':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">En Proceso</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pendiente</Badge>;
  }
}

function getLast4Months(): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({ value, label: monthName.charAt(0).toUpperCase() + monthName.slice(1) });
  }
  return months;
}

export default function AfiliacionesSsss() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchCedula, setSearchCedula] = useState("");
  const [searchName, setSearchName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [selectedPlantillaType, setSelectedPlantillaType] = useState<ProviderType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(null);
  const [isNormatividadOpen, setIsNormatividadOpen] = useState(false);
  const [isNormatividadVerificacionOpen, setIsNormatividadVerificacionOpen] = useState(false);
  const [isNormatividadAltoRiesgoOpen, setIsNormatividadAltoRiesgoOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isMassDialogOpen, setIsMassDialogOpen] = useState(false);
  const [selectedWorkersForMass, setSelectedWorkersForMass] = useState<string[]>([]);
  const [editingConfigSection, setEditingConfigSection] = useState<'eps' | 'arl' | 'afp' | 'ccf' | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteConfirmCode, setBulkDeleteConfirmCode] = useState("");
  const [bulkDeleteCompanyName, setBulkDeleteCompanyName] = useState("");
  const [bulkDeleteResults, setBulkDeleteResults] = useState<{ deleted: number; total: number; errors: string[]; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState("afiliaciones");
  const [viewingAfiliacion, setViewingAfiliacion] = useState<AfiliacionSsss | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Leer parámetro tab de la URL para redirección desde otros módulos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["afiliaciones", "alto-riesgo", "verificacion"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const [isVerificacionDialogOpen, setIsVerificacionDialogOpen] = useState(false);
  const [isDetalleDialogOpen, setIsDetalleDialogOpen] = useState(false);
  const [selectedVerificacion, setSelectedVerificacion] = useState<VerificacionMuestreoSgss | null>(null);
  const [selectedWorkersForMuestra, setSelectedWorkersForMuestra] = useState<string[]>([]);
  const [detallesVerificacion, setDetallesVerificacion] = useState<DetalleVerificacionSgss[]>([]);
  const [isHighRiskDialogOpen, setIsHighRiskDialogOpen] = useState(false);
  const [editingHighRiskId, setEditingHighRiskId] = useState<string | null>(null);
  const [soportePilaFile, setSoportePilaFile] = useState<File | null>(null);
  const [isUploadingSoportePila, setIsUploadingSoportePila] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: "",
      fecha: getTodayDateString(),
      epsNombre: "",
      arlNombre: "",
      afpNombre: "",
      ccfNombre: "",
    },
  });

  const { data: afiliaciones = [], isLoading: isLoadingAfiliaciones } = useQuery<AfiliacionSsss[]>({
    queryKey: ["/api/afiliaciones-ssss"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/company/current"],
  });

  const { data: verificaciones = [], isLoading: isLoadingVerificaciones } = useQuery<VerificacionMuestreoSgss[]>({
    queryKey: ["/api/verificaciones-muestreo-sgss"],
  });

  const { data: highRiskWorkers = [], isLoading: isLoadingHighRiskWorkers } = useQuery<HighRiskWorker[]>({
    queryKey: ["/api/high-risk-workers"],
  });

  const highRiskForm = useForm<HighRiskFormValues>({
    resolver: zodResolver(highRiskFormSchema),
    defaultValues: {
      workerId: "",
      actividadRiesgo: "",
      porcentajeCotizacionEspecial: "10",
      ultimoMesPagado: "",
      cumpleCotizacion: false,
      soportePilaUrl: "",
      observaciones: "",
    },
  });

  const verificacionForm = useForm<VerificacionFormValues>({
    resolver: zodResolver(verificacionFormSchema),
    defaultValues: {
      fecha: getTodayDateString(),
      periodoVerificado: getLast4Months()[0]?.value || "",
      pilaFileUrl: "",
      observaciones: "",
    },
  });

  const companyEps = (company as any)?.epsNombreEmpresa || "";
  const companyArl = (company as any)?.arlNombreEmpresa || "";
  const companyAfp = (company as any)?.afpNombreEmpresa || "";
  const companyCcf = (company as any)?.ccfNombreEmpresa || "";

  const updateCompanyConfigMutation = useMutation({
    mutationFn: async (data: { 
      epsNombreEmpresa?: string; 
      arlNombreEmpresa?: string; 
      afpNombreEmpresa?: string; 
      ccfNombreEmpresa?: string; 
    }) => {
      if (!company?.id) throw new Error("Empresa no encontrada");
      const res = await apiRequest("PATCH", `/api/companies/${company.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      toast({
        title: "Configuración guardada",
        description: "Los valores por defecto han sido actualizados",
        className: "bg-green-50 border-green-200",
      });
      // No cerrar el diálogo para permitir seleccionar múltiples opciones
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const massAfiliacionMutation = useMutation({
    mutationFn: async (workerIds: string[]) => {
      const results = [];
      for (const workerId of workerIds) {
        const res = await apiRequest("POST", "/api/afiliaciones-ssss", {
          workerId,
          fecha: getTodayDateString(),
          epsNombre: companyEps,
          arlNombre: companyArl,
          afpNombre: companyAfp,
          ccfNombre: companyCcf,
        });
        results.push(await res.json());
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/afiliaciones-ssss"] });
      toast({
        title: "Afiliación masiva completada",
        description: `Se crearon ${results.length} afiliaciones con los valores por defecto de la empresa`,
        className: "bg-green-50 border-green-200",
      });
      setIsMassDialogOpen(false);
      setSelectedWorkersForMass([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createVerificacionMutation = useMutation({
    mutationFn: async (data: { 
      fecha: string; 
      periodoVerificado: string; 
      totalTrabajadores: number;
      muestraRequerida: number;
      pilaFileUrl?: string;
      observaciones?: string;
      workerIds: string[];
    }) => {
      const res = await apiRequest("POST", "/api/verificaciones-muestreo-sgss", {
        fecha: data.fecha,
        periodoVerificado: data.periodoVerificado,
        totalTrabajadores: data.totalTrabajadores,
        totalContratistas: 0,
        muestraRequerida: data.muestraRequerida,
        pilaFileUrl: data.pilaFileUrl,
        observaciones: data.observaciones,
        workerIds: data.workerIds,
        estado: "en_proceso",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verificaciones-muestreo-sgss"] });
      toast({
        title: "Verificación creada",
        description: "Se ha iniciado el proceso de verificación de muestreo",
        className: "bg-green-50 border-green-200",
      });
      setIsVerificacionDialogOpen(false);
      setSelectedWorkersForMuestra([]);
      verificacionForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDetalleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DetalleVerificacionSgss> }) => {
      return await apiRequest("PUT", `/api/detalles-verificacion-sgss/${id}`, data);
    },
    onSuccess: () => {
      if (selectedVerificacion) {
        fetchDetallesVerificacion(selectedVerificacion.id);
      }
      toast({
        title: "Detalle actualizado",
        description: "El estado de verificación ha sido guardado",
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

  const completarVerificacionMutation = useMutation({
    mutationFn: async (id: string) => {
      const verificados = detallesVerificacion.filter(d => d.cumple).length;
      const porcentaje = detallesVerificacion.length > 0 
        ? Math.round((verificados / detallesVerificacion.length) * 100) 
        : 0;
      return await apiRequest("PUT", `/api/verificaciones-muestreo-sgss/${id}`, {
        estado: "completada",
        muestraVerificada: verificados,
        porcentajeCumplimiento: porcentaje,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verificaciones-muestreo-sgss"] });
      toast({
        title: "Verificación completada",
        description: "El proceso de verificación ha sido marcado como completado",
        className: "bg-green-50 border-green-200",
      });
      setIsDetalleDialogOpen(false);
      setSelectedVerificacion(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVerificacionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/verificaciones-muestreo-sgss/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verificaciones-muestreo-sgss"] });
      toast({
        title: "Verificación eliminada",
        description: "El registro de verificación ha sido eliminado",
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

  const createHighRiskWorkerMutation = useMutation({
    mutationFn: async (data: HighRiskFormValues) => {
      const res = await apiRequest("POST", "/api/high-risk-workers", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/high-risk-workers"] });
      toast({
        title: "Trabajador de alto riesgo registrado",
        description: "El registro ha sido creado exitosamente",
        className: "bg-green-50 border-green-200",
      });
      setIsHighRiskDialogOpen(false);
      highRiskForm.reset();
      setSoportePilaFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateHighRiskWorkerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HighRiskFormValues }) => {
      const res = await apiRequest("PATCH", `/api/high-risk-workers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/high-risk-workers"] });
      toast({
        title: "Registro actualizado",
        description: "El trabajador de alto riesgo ha sido actualizado",
        className: "bg-green-50 border-green-200",
      });
      setIsHighRiskDialogOpen(false);
      setEditingHighRiskId(null);
      highRiskForm.reset();
      setSoportePilaFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteHighRiskWorkerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/high-risk-workers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/high-risk-workers"] });
      toast({
        title: "Registro eliminado",
        description: "El trabajador de alto riesgo ha sido eliminado",
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

  const handleHighRiskSubmit = async (data: HighRiskFormValues) => {
    let finalData = { ...data };
    
    // Si hay un archivo seleccionado, subirlo primero
    if (soportePilaFile) {
      setIsUploadingSoportePila(true);
      try {
        // Compress image files before upload
        let fileToUpload = soportePilaFile;
        if (soportePilaFile.type.startsWith('image/')) {
          fileToUpload = await compressImage(soportePilaFile);
        }
        
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("category", "soporte-pila");
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (res.ok) {
          const result = await res.json();
          finalData.soportePilaUrl = result.url;
          toast({
            title: "Archivo subido",
            description: "El soporte PILA se ha subido correctamente.",
          });
        } else {
          toast({
            title: "Error al subir archivo",
            description: "No se pudo subir el soporte PILA. Intente nuevamente.",
            variant: "destructive",
          });
          setIsUploadingSoportePila(false);
          return;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al subir el archivo.",
          variant: "destructive",
        });
        setIsUploadingSoportePila(false);
        return;
      }
      setIsUploadingSoportePila(false);
    }
    
    if (editingHighRiskId) {
      updateHighRiskWorkerMutation.mutate({ id: editingHighRiskId, data: finalData });
    } else {
      createHighRiskWorkerMutation.mutate(finalData);
    }
    setSoportePilaFile(null);
  };

  const handleEditHighRisk = (hrw: HighRiskWorker) => {
    setEditingHighRiskId(hrw.id);
    highRiskForm.reset({
      workerId: hrw.workerId,
      actividadRiesgo: hrw.actividadRiesgo || "",
      porcentajeCotizacionEspecial: hrw.porcentajeCotizacionEspecial || "10",
      ultimoMesPagado: hrw.ultimoMesPagado || "",
      cumpleCotizacion: hrw.cumpleCotizacion || false,
      soportePilaUrl: hrw.soportePilaUrl || "",
      observaciones: hrw.observaciones || "",
    });
    setIsHighRiskDialogOpen(true);
  };

  const workersNotHighRisk = workers.filter(
    (w) => !highRiskWorkers.some((hr) => hr.workerId === w.id)
  );

  const highRiskWorkersWithCotizacion = highRiskWorkers.filter((hr) => hr.cumpleCotizacion);
  const porcentajeCotizacionAlDia = highRiskWorkers.length > 0
    ? Math.round((highRiskWorkersWithCotizacion.length / highRiskWorkers.length) * 100)
    : 0;

  const fetchDetallesVerificacion = async (verificacionId: string) => {
    try {
      const res = await fetch(`/api/verificaciones-muestreo-sgss/${verificacionId}/detalles`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDetallesVerificacion(data);
      }
    } catch (error) {
      console.error("Error fetching detalles:", error);
    }
  };

  const handleVerDetalles = async (verificacion: VerificacionMuestreoSgss) => {
    setSelectedVerificacion(verificacion);
    await fetchDetallesVerificacion(verificacion.id);
    setIsDetalleDialogOpen(true);
  };

  const handleSelectRandomWorkers = () => {
    const totalTrabajadores = workers.length;
    const muestraRequerida = calcularMuestraRequerida(totalTrabajadores);
    const shuffled = [...workers].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, muestraRequerida).map(w => w.id);
    setSelectedWorkersForMuestra(selected);
    const seleccionTotal = muestraRequerida >= totalTrabajadores;
    toast({
      title: seleccionTotal ? "Todos seleccionados" : "Muestra seleccionada",
      description: seleccionTotal
        ? `Se han seleccionado los ${selected.length} trabajadores (verificación al 100% según Res. 0312/2019 para empresas de 1-50 trabajadores)`
        : `Se han seleccionado aleatoriamente ${selected.length} trabajadores de un total de ${totalTrabajadores}`,
      className: "bg-blue-50 border-blue-200",
    });
  };

  const handleCreateVerificacion = (data: VerificacionFormValues) => {
    const totalTrabajadores = workers.length;
    const muestraRequerida = calcularMuestraRequerida(totalTrabajadores);
    createVerificacionMutation.mutate({
      fecha: data.fecha,
      periodoVerificado: data.periodoVerificado,
      pilaFileUrl: data.pilaFileUrl,
      observaciones: data.observaciones,
      totalTrabajadores,
      muestraRequerida,
      workerIds: selectedWorkersForMuestra,
    });
  };

  const handleToggleDetalle = (detalle: DetalleVerificacionSgss, field: 'verificadoEps' | 'verificadoArl' | 'verificadoAfp' | 'verificadoCcf') => {
    const newValue = !detalle[field];
    const updatedDetalle = { ...detalle, [field]: newValue };
    const cumple = updatedDetalle.verificadoEps && updatedDetalle.verificadoArl && updatedDetalle.verificadoAfp && updatedDetalle.verificadoCcf;
    updateDetalleMutation.mutate({
      id: detalle.id,
      data: { [field]: newValue, cumple },
    });
  };

  const isAgremiacionAutorizada = (nombreAgremiacion: string | null): boolean => {
    if (!nombreAgremiacion) return false;
    return AGREMIACIONES_AUTORIZADAS_MINSALUD.some(
      a => a.nombre.toLowerCase().includes(nombreAgremiacion.toLowerCase()) ||
           nombreAgremiacion.toLowerCase().includes(a.nombre.toLowerCase())
    );
  };

  const workersWithoutAfiliacion = workers.filter(
    (w) => !afiliaciones.some((a) => a.workerId === w.id)
  );

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/afiliaciones-ssss", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afiliaciones-ssss"] });
      toast({
        title: "Afiliación creada",
        description: "La afiliación ha sido registrada exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      handleCancel();
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormValues> }) => {
      return await apiRequest("PUT", `/api/afiliaciones-ssss/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afiliaciones-ssss"] });
      toast({
        title: "Afiliación actualizada",
        description: "Los cambios han sido guardados exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      handleCancel();
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
      return await apiRequest("DELETE", `/api/afiliaciones-ssss/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afiliaciones-ssss"] });
      toast({
        title: "Afiliación eliminada",
        description: "El registro ha sido eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const bulkDeleteAfiliacionesMutation = useMutation({
    mutationFn: async (companyId: string) => {
      await apiRequest("DELETE", `/api/afiliaciones-ssss/bulk/${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afiliaciones-ssss"] });
      setBulkDeleteResults({
        deleted: 0,
        total: 0,
        errors: [],
        message: "Todas las afiliaciones han sido eliminadas exitosamente"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error en eliminación masiva",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ id, file, type }: { id: string; file: File; type: 'eps' | 'arl' | 'pension' }) => {
      // Compress image files before upload
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file);
      }
      
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const res = await fetch(`/api/afiliaciones-ssss/${id}/upload-${type}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afiliaciones-ssss"] });
      toast({
        title: "Archivo adjuntado",
        description: "El archivo ha sido subido exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWorkerSelect = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    setSelectedWorker(worker || null);
    
    // Auto-fill con las afiliaciones anteriores del trabajador si existen
    if (worker && !editingId) {
      const workerAfiliaciones = afiliaciones.filter(a => a.workerId === workerId);
      if (workerAfiliaciones.length > 0) {
        // Obtener la afiliación más reciente
        const latestAfiliacion = workerAfiliaciones.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )[0];
        
        // Auto-fill con los datos de la última afiliación
        if (latestAfiliacion.epsNombre) form.setValue("epsNombre", latestAfiliacion.epsNombre);
        if (latestAfiliacion.arlNombre) form.setValue("arlNombre", latestAfiliacion.arlNombre);
        if (latestAfiliacion.afpNombre) form.setValue("afpNombre", latestAfiliacion.afpNombre);
        if (latestAfiliacion.ccfNombre) form.setValue("ccfNombre", latestAfiliacion.ccfNombre);
        
        toast({
          title: "Datos cargados automáticamente",
          description: "Se han cargado las afiliaciones anteriores del trabajador. Puede modificarlas si es necesario.",
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        // No hay afiliación previa - usar valores por defecto de la empresa
        if (companyArl) {
          form.setValue("arlNombre", companyArl);
        }
        if (companyCcf) {
          form.setValue("ccfNombre", companyCcf);
        }
        
        if (companyArl || companyCcf) {
          toast({
            title: "Valores de empresa aplicados",
            description: "Se han cargado automáticamente la ARL y CCF configurados para su empresa.",
            className: "bg-green-50 border-green-200",
          });
        }
      }
    }
  };


  const getProvidersForType = (type: ProviderType): ProviderInfo[] => {
    switch (type) {
      case 'eps':
        return EPS_COLOMBIA;
      case 'arl':
        return ARL_COLOMBIA;
      case 'afp':
        return AFP_COLOMBIA;
      case 'ccf':
        return CCF_COLOMBIA;
      default:
        return [];
    }
  };

  const getProviderTypeName = (type: ProviderType): string => {
    switch (type) {
      case 'eps':
        return 'EPS (Entidad Promotora de Salud)';
      case 'arl':
        return 'ARL (Administradora de Riesgos Laborales)';
      case 'afp':
        return 'AFP (Administradora de Fondos de Pensiones)';
      case 'ccf':
        return 'CCF (Caja de Compensación Familiar)';
      default:
        return '';
    }
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    let providerType: ProviderType | null = null;
    
    if (plantilla.id === 'eps-colombia') {
      providerType = 'eps';
    } else if (plantilla.id === 'arl-colombia') {
      providerType = 'arl';
    } else if (plantilla.id === 'afp-colombia') {
      providerType = 'afp';
    } else if (plantilla.id === 'ccf-colombia') {
      providerType = 'ccf';
    }
    
    if (providerType) {
      setSelectedPlantillaType(providerType);
      setSelectedProvider(null);
      setIsProviderDialogOpen(true);
      
      toast({
        title: "Plantilla seleccionada",
        description: `Catálogo de ${plantilla.nombre} cargado. Seleccione un proveedor.`,
        className: "bg-yellow-50 border-yellow-200",
      });
    }
  };

  const handleSelectProvider = (provider: ProviderInfo) => {
    setSelectedProvider(provider);
    
    toast({
      title: "Proveedor seleccionado",
      description: `${provider.nombre} (NIT: ${provider.nit}) ha sido seleccionado.`,
      className: "bg-green-50 border-green-200",
    });
  };

  const handleApplyProvider = () => {
    if (selectedProvider && selectedPlantillaType) {
      toast({
        title: "Plantilla aplicada",
        description: `Información de ${selectedProvider.nombre} lista para usar en la afiliación.`,
        className: "bg-green-50 border-green-200",
      });
      setIsProviderDialogOpen(false);
    }
  };

  const handleCopyProviderInfo = (provider: ProviderInfo) => {
    const text = `${provider.nombre} - NIT: ${provider.nit}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado al portapapeles",
      description: text,
      className: "bg-blue-50 border-blue-200",
    });
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (afiliacion: AfiliacionSsss) => {
    setEditingId(afiliacion.id);
    const worker = workers.find(w => w.id === afiliacion.workerId);
    setSelectedWorker(worker || null);
    
    form.reset({
      workerId: afiliacion.workerId,
      fecha: afiliacion.fecha,
      epsNombre: afiliacion.epsNombre || "",
      arlNombre: afiliacion.arlNombre || companyArl || "",
      afpNombre: afiliacion.afpNombre || "",
      ccfNombre: afiliacion.ccfNombre || companyCcf || "",
    });
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedWorker(null);
    form.reset({
      workerId: "",
      fecha: getTodayDateString(),
      epsNombre: "",
      arlNombre: "",
      afpNombre: "",
      ccfNombre: "",
    });
    setIsDialogOpen(false);
  };

  const filteredAfiliaciones = afiliaciones.filter((afiliacion) => {
    const worker = workers.find(w => w.id === afiliacion.workerId);
    if (!worker) return false;

    const matchesCedula = !searchCedula || worker.identificationNumber?.includes(searchCedula);
    const matchesName = !searchName || worker.name.toLowerCase().includes(searchName.toLowerCase());

    return matchesCedula && matchesName;
  });

  const estandar114 = getEstandarByCodigo('1.1.4');
  
  const normativaAfiliaciones = [
    {
      codigo: 'LEY-100-1993',
      norma: 'Ley 100 de 1993',
      descripcion: 'Sistema de Seguridad Social Integral',
      requisitos: [
        'Afiliación obligatoria a EPS (Salud)',
        'Afiliación obligatoria a ARL (Riesgos Laborales)',
        'Afiliación obligatoria a AFP (Pensiones)',
        'Afiliación a Caja de Compensación Familiar'
      ],
      obligatorio: true
    },
    {
      codigo: 'DEC-1295-1994',
      norma: 'Decreto Ley 1295 de 1994',
      descripcion: 'Sistema General de Riesgos Profesionales',
      requisitos: [
        'Afiliación de todos los trabajadores dependientes',
        'Pago oportuno de aportes',
        'Reportes de novedades de afiliación',
        'Clasificación de riesgo según actividad económica'
      ],
      obligatorio: true
    }
  ];

  const normativaVerificacion = [
    {
      codigo: 'RES-0312-2019',
      norma: 'Resolución 0312 de 2019 - Estándar 1.1.4',
      descripcion: 'Verificación de afiliación al Sistema General de Seguridad Social mediante muestreo',
      requisitos: [
        'Verificar afiliación a EPS, ARL, AFP y CCF',
        'Realizar muestreo aleatorio mensual de trabajadores',
        'Conservar soportes de verificación (PILA)',
        'Documentar hallazgos y acciones correctivas'
      ],
      obligatorio: true
    },
    {
      codigo: 'DEC-780-2016',
      norma: 'Decreto 780 de 2016',
      descripcion: 'Decreto Único Reglamentario del Sector Salud y Protección Social',
      requisitos: [
        'Verificación de aportes a través de la Planilla PILA',
        'Confirmación de pagos oportunos',
        'Validación de afiliación activa de cada trabajador'
      ],
      obligatorio: true
    },
    {
      codigo: 'DEC-1072-2015',
      norma: 'Decreto 1072 de 2015 - Art. 2.2.4.6.8',
      descripcion: 'Obligaciones del empleador respecto a la afiliación al Sistema de Seguridad Social',
      requisitos: [
        'Garantizar afiliación de todos los trabajadores',
        'Realizar aportes oportunamente',
        'Verificar cobertura efectiva del sistema'
      ],
      obligatorio: true
    }
  ];

  const normativaAltoRiesgo = [
    {
      codigo: 'DEC-2090-2003',
      norma: 'Decreto 2090 de 2003',
      descripcion: 'Actividades de Alto Riesgo para la salud del trabajador',
      requisitos: [
        'Identificar trabajadores en actividades de alto riesgo',
        'Cotizar al fondo de pensiones con tarifa especial (10% adicional)',
        'Garantizar condiciones especiales de jubilación',
        'Registrar actividad de alto riesgo específica'
      ],
      obligatorio: true
    },
    {
      codigo: 'LEY-860-2003',
      norma: 'Ley 860 de 2003',
      descripcion: 'Régimen de pensiones especiales para trabajadores de alto riesgo',
      requisitos: [
        'Cumplir requisitos de edad y tiempo de cotización especiales',
        'Documentar exposición a condiciones de alto riesgo',
        'Mantener certificaciones de ARL sobre actividad de alto riesgo'
      ],
      obligatorio: true
    },
    {
      codigo: 'RES-0312-2019',
      norma: 'Resolución 0312 de 2019 - Estándares Mínimos',
      descripcion: 'Obligación de identificar y proteger trabajadores en actividades de alto riesgo',
      requisitos: [
        'Incluir trabajadores de alto riesgo en el SG-SST',
        'Implementar controles específicos para actividades peligrosas',
        'Realizar exámenes médicos ocupacionales periódicos',
        'Mantener registro actualizado de actividades de alto riesgo'
      ],
      obligatorio: true
    }
  ];

  const plantillasAfiliaciones = [
    {
      id: 'eps-colombia',
      nombre: 'EPS en Colombia',
      descripcion: `Lista de ${EPS_COLOMBIA.length} EPS autorizadas en Colombia`,
      campos: {
        entidades: EPS_COLOMBIA.map(eps => `${eps.nombre} (NIT: ${eps.nit})`),
        totalEntidades: EPS_COLOMBIA.length
      },
      normativaBase: 'LEY-100-1993'
    },
    {
      id: 'arl-colombia',
      nombre: 'ARL en Colombia',
      descripcion: `Lista de ${ARL_COLOMBIA.length} ARL autorizadas en Colombia`,
      campos: {
        entidades: ARL_COLOMBIA.map(arl => `${arl.nombre} (NIT: ${arl.nit})`),
        totalEntidades: ARL_COLOMBIA.length
      },
      normativaBase: 'DEC-1295-1994'
    },
    {
      id: 'afp-colombia',
      nombre: 'AFP en Colombia',
      descripcion: `Lista de ${AFP_COLOMBIA.length} fondos de pensiones en Colombia`,
      campos: {
        entidades: AFP_COLOMBIA.map(afp => `${afp.nombre} (NIT: ${afp.nit})`),
        totalEntidades: AFP_COLOMBIA.length
      },
      normativaBase: 'LEY-100-1993'
    },
    {
      id: 'ccf-colombia',
      nombre: 'Cajas de Compensación Familiar',
      descripcion: `Lista de ${CCF_COLOMBIA.length} cajas de compensación en Colombia`,
      campos: {
        entidades: CCF_COLOMBIA.map(ccf => `${ccf.nombre} (NIT: ${ccf.nit})`),
        totalEntidades: CCF_COLOMBIA.length
      },
      normativaBase: 'LEY-100-1993'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="afiliaciones" data-testid="tab-afiliaciones">
            <Users className="h-4 w-4 mr-2" />
            Afiliaciones
          </TabsTrigger>
          <TabsTrigger value="verificacion" data-testid="tab-verificacion">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Verificación de Muestreo
          </TabsTrigger>
          <TabsTrigger value="alto-riesgo" data-testid="tab-alto-riesgo">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alto Riesgo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="afiliaciones" className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-bold text-primary">
                Afiliaciones SSSS
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNormatividadOpen(true)}
                data-testid="button-normatividad"
                className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                Normatividad
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfigDialogOpen(true)}
                data-testid="button-config-empresa"
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Configurar Empresa
              </Button>
              {workersWithoutAfiliacion.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMassDialogOpen(true)}
                  data-testid="button-afiliacion-masiva"
                  className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Users className="h-4 w-4" />
                  Afiliación Masiva ({workersWithoutAfiliacion.length})
                </Button>
              )}
              <Button 
                onClick={() => setIsDialogOpen(true)}
                data-testid="button-new-afiliacion"
              >
                Nueva Afiliación
              </Button>
              {afiliaciones.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setBulkDeleteDialogOpen(true);
                    setBulkDeleteConfirmCode("");
                    setBulkDeleteCompanyName("");
                    setBulkDeleteResults(null);
                  }}
                  data-testid="button-bulk-delete-afiliaciones"
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <AlertTriangle className="h-4 w-4" />
                  Eliminar Todos
                </Button>
              )}
            </div>
          </div>
          
          {(companyEps || companyArl || companyAfp || companyCcf) && (
            <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <Zap className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Automatización activa</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {companyEps && `EPS: ${companyEps}`}
                  {companyEps && (companyArl || companyAfp || companyCcf) && " • "}
                  {companyArl && `ARL: ${companyArl}`}
                  {companyArl && (companyAfp || companyCcf) && " • "}
                  {companyAfp && `AFP: ${companyAfp}`}
                  {companyAfp && companyCcf && " • "}
                  {companyCcf && `CCF: ${companyCcf}`}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            </div>
          )}
          
          {!companyEps && !companyArl && !companyAfp && !companyCcf && (
            <div className="flex items-center gap-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Settings className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Configure la automatización</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Use el botón "Configurar Empresa" para definir la EPS, ARL, AFP y CCF que se aplicarán automáticamente a todos los trabajadores
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-cedula">Buscar por Cédula</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-cedula"
                  data-testid="input-search-cedula"
                  placeholder="Número de cédula..."
                  value={searchCedula}
                  onChange={(e) => setSearchCedula(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="search-name">Buscar por Nombre</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-name"
                  data-testid="input-search-name"
                  placeholder="Nombre del trabajador..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {isLoadingAfiliaciones ? (
            <div className="text-center py-8 text-muted-foreground">Cargando afiliaciones...</div>
          ) : filteredAfiliaciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No se encontraron afiliaciones</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>EPS</TableHead>
                    <TableHead>ARL</TableHead>
                    <TableHead>AFP</TableHead>
                    <TableHead>CCF</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAfiliaciones.map((afiliacion) => {
                    const worker = workers.find(w => w.id === afiliacion.workerId);
                    return (
                      <TableRow key={afiliacion.id} data-testid={`row-afiliacion-${afiliacion.id}`}>
                        <TableCell>{formatDateShort(afiliacion.fecha)}</TableCell>
                        <TableCell>{worker?.identificationNumber || 'N/A'}</TableCell>
                        <TableCell>{worker?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {afiliacion.epsNombre ? (
                            <span className="flex items-center gap-1 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {afiliacion.epsNombre}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin registrar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {afiliacion.arlNombre ? (
                            <span className="flex items-center gap-1 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {afiliacion.arlNombre}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin registrar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {afiliacion.afpNombre ? (
                            <span className="flex items-center gap-1 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {afiliacion.afpNombre}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin registrar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {afiliacion.ccfNombre ? (
                            <span className="flex items-center gap-1 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {afiliacion.ccfNombre}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin registrar</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setViewingAfiliacion(afiliacion);
                                setIsViewDialogOpen(true);
                              }}
                              data-testid={`button-view-${afiliacion.id}`}
                              className="hover-elevate"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(afiliacion)}
                              data-testid={`button-edit-${afiliacion.id}`}
                              className="hover-elevate"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("¿Está seguro de eliminar esta afiliación?")) {
                                  deleteMutation.mutate(afiliacion.id);
                                }
                              }}
                              data-testid={`button-delete-${afiliacion.id}`}
                              className="hover-elevate text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modificar Afiliación" : "Nueva Afiliación"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>*Fecha</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-fecha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>*Trabajador</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleWorkerSelect(value);
                        }}
                        disabled={!!editingId}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-worker">
                            <SelectValue placeholder="Seleccionar trabajador..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.identificationNumber} - {worker.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedWorker && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Cédula</Label>
                    <p className="text-sm font-medium" data-testid="text-selected-cedula">
                      {selectedWorker.identificationNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Nombre Completo</Label>
                    <p className="text-sm font-medium" data-testid="text-selected-name">
                      {selectedWorker.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Entidades de Seguridad Social
                </h3>
                <p className="text-sm text-muted-foreground">Haga clic para seleccionar las entidades donde está afiliado el trabajador (Ley 100/1993)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="epsNombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          EPS (Entidad Promotora de Salud)
                        </FormLabel>
                        <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-muted/30">
                          <div className="space-y-1">
                            {EPS_COLOMBIA.map((eps) => (
                              <div
                                key={eps.codigo}
                                onClick={() => field.onChange(eps.nombre)}
                                className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                                  field.value === eps.nombre
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                                data-testid={`option-eps-${eps.codigo}`}
                              >
                                {eps.nombre}
                              </div>
                            ))}
                          </div>
                        </div>
                        {field.value && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Seleccionado: {field.value}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arlNombre"
                    render={({ field }) => {
                      const sortedArl = [...ARL_COLOMBIA].sort((a, b) => {
                        if (a.nombre === field.value) return -1;
                        if (b.nombre === field.value) return 1;
                        return 0;
                      });
                      return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          ARL (Aseguradora de Riesgos Laborales)
                        </FormLabel>
                        <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-muted/30">
                          <div className="space-y-1">
                            {sortedArl.map((arl) => (
                              <div
                                key={arl.codigo}
                                onClick={() => field.onChange(arl.nombre)}
                                className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                                  field.value === arl.nombre
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                                data-testid={`option-arl-${arl.codigo}`}
                              >
                                {arl.nombre}
                              </div>
                            ))}
                          </div>
                        </div>
                        {field.value && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Seleccionado: {field.value}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );}}
                  />

                  <FormField
                    control={form.control}
                    name="afpNombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          AFP (Fondo de Pensiones)
                        </FormLabel>
                        <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-muted/30">
                          <div className="space-y-1">
                            {AFP_COLOMBIA.map((afp) => (
                              <div
                                key={afp.codigo}
                                onClick={() => field.onChange(afp.nombre)}
                                className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                                  field.value === afp.nombre
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                                data-testid={`option-afp-${afp.codigo}`}
                              >
                                {afp.nombre}
                              </div>
                            ))}
                          </div>
                        </div>
                        {field.value && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Seleccionado: {field.value}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ccfNombre"
                    render={({ field }) => {
                      const sortedCcf = [...CCF_COLOMBIA].sort((a, b) => {
                        if (a.nombre === field.value) return -1;
                        if (b.nombre === field.value) return 1;
                        return 0;
                      });
                      return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Caja de Compensación Familiar
                        </FormLabel>
                        <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-muted/30">
                          <div className="space-y-1">
                            {sortedCcf.map((ccf) => (
                              <div
                                key={ccf.codigo}
                                onClick={() => field.onChange(ccf.nombre)}
                                className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                                  field.value === ccf.nombre
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                                data-testid={`option-ccf-${ccf.codigo}`}
                              >
                                {ccf.nombre}
                              </div>
                            ))}
                          </div>
                        </div>
                        {field.value && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Seleccionado: {field.value}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );}}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  {editingId ? "Modificar" : "Guardar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedPlantillaType && getProviderTypeName(selectedPlantillaType)}
            </DialogTitle>
            <DialogDescription>
              Seleccione un proveedor de la lista para ver su información o copiar los datos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Proveedor</Label>
              <Select
                value={selectedProvider?.codigo || ""}
                onValueChange={(value) => {
                  const providers = selectedPlantillaType ? getProvidersForType(selectedPlantillaType) : [];
                  const provider = providers.find(p => p.codigo === value);
                  if (provider) {
                    handleSelectProvider(provider);
                  }
                }}
              >
                <SelectTrigger data-testid="select-provider">
                  <SelectValue placeholder="Seleccione un proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedPlantillaType && getProvidersForType(selectedPlantillaType).map((provider) => (
                    <SelectItem key={provider.codigo} value={provider.codigo}>
                      {provider.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && (
              <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Proveedor Seleccionado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Nombre</Label>
                      <p className="font-medium" data-testid="text-provider-name">{selectedProvider.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">NIT</Label>
                      <p className="font-medium" data-testid="text-provider-nit">{selectedProvider.nit}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyProviderInfo(selectedProvider)}
                    className="w-full"
                    data-testid="button-copy-provider"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Información
                  </Button>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-[200px] border rounded-lg p-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Lista completa de proveedores ({selectedPlantillaType && getProvidersForType(selectedPlantillaType).length}):
                </p>
                {selectedPlantillaType && getProvidersForType(selectedPlantillaType).map((provider) => (
                  <div
                    key={provider.codigo}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedProvider?.codigo === provider.codigo 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSelectProvider(provider)}
                    data-testid={`provider-item-${provider.codigo}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{provider.nombre}</p>
                      <p className="text-xs text-muted-foreground">NIT: {provider.nit}</p>
                    </div>
                    {selectedProvider?.codigo === provider.codigo && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Seleccionado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsProviderDialogOpen(false)}
              data-testid="button-close-provider-dialog"
            >
              Cerrar
            </Button>
            {selectedProvider && (
              <Button 
                onClick={handleApplyProvider}
                data-testid="button-apply-provider"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Aplicar Selección
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNormatividadOpen} onOpenChange={setIsNormatividadOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Normatividad Aplicable - Afiliaciones SSSS
            </DialogTitle>
            <DialogDescription>
              Estándar 1.1.4 - {estandar114?.nombre || "Afiliación al Sistema de Seguridad Social Integral"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {normativaAfiliaciones.map((norma, index) => (
              <Card key={index} className={norma.obligatorio ? "border-primary/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{norma.codigo}</CardTitle>
                    {norma.obligatorio && (
                      <Badge variant="default" className="text-xs">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{norma.norma}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{norma.descripcion}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Requisitos:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {norma.requisitos.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNormatividadOpen(false)}
              data-testid="button-close-normatividad"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configuración de Empresa */}
      <Dialog open={isConfigDialogOpen} onOpenChange={(open) => {
        setIsConfigDialogOpen(open);
        if (!open) setEditingConfigSection(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configuración de Afiliaciones
            </DialogTitle>
            <DialogDescription>
              Entidades configuradas para su empresa. Se aplican automáticamente a nuevos trabajadores.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {/* EPS */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">EPS:</span>
                  {companyEps ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {companyEps}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin configurar</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingConfigSection(editingConfigSection === 'eps' ? null : 'eps')}
                  data-testid="button-edit-eps"
                >
                  {editingConfigSection === 'eps' ? 'Cerrar' : 'Cambiar'}
                </Button>
              </div>
              {editingConfigSection === 'eps' && (
                <div className="mt-3 border-t pt-3 max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {EPS_COLOMBIA.map((eps) => (
                      <div
                        key={eps.codigo}
                        onClick={() => {
                          updateCompanyConfigMutation.mutate({ epsNombreEmpresa: eps.nombre });
                          setEditingConfigSection(null);
                        }}
                        className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                          companyEps === eps.nombre ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        data-testid={`config-eps-${eps.codigo}`}
                      >
                        {eps.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ARL */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">ARL:</span>
                  {companyArl ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {companyArl}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin configurar</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingConfigSection(editingConfigSection === 'arl' ? null : 'arl')}
                  data-testid="button-edit-arl"
                >
                  {editingConfigSection === 'arl' ? 'Cerrar' : 'Cambiar'}
                </Button>
              </div>
              {editingConfigSection === 'arl' && (
                <div className="mt-3 border-t pt-3 max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {ARL_COLOMBIA.map((arl) => (
                      <div
                        key={arl.codigo}
                        onClick={() => {
                          updateCompanyConfigMutation.mutate({ arlNombreEmpresa: arl.nombre });
                          setEditingConfigSection(null);
                        }}
                        className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                          companyArl === arl.nombre ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        data-testid={`config-arl-${arl.codigo}`}
                      >
                        {arl.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AFP */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">AFP:</span>
                  {companyAfp ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {companyAfp}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin configurar</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingConfigSection(editingConfigSection === 'afp' ? null : 'afp')}
                  data-testid="button-edit-afp"
                >
                  {editingConfigSection === 'afp' ? 'Cerrar' : 'Cambiar'}
                </Button>
              </div>
              {editingConfigSection === 'afp' && (
                <div className="mt-3 border-t pt-3 max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {AFP_COLOMBIA.map((afp) => (
                      <div
                        key={afp.codigo}
                        onClick={() => {
                          updateCompanyConfigMutation.mutate({ afpNombreEmpresa: afp.nombre });
                          setEditingConfigSection(null);
                        }}
                        className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                          companyAfp === afp.nombre ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        data-testid={`config-afp-${afp.codigo}`}
                      >
                        {afp.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CCF */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">CCF:</span>
                  {companyCcf ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {companyCcf}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin configurar</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingConfigSection(editingConfigSection === 'ccf' ? null : 'ccf')}
                  data-testid="button-edit-ccf"
                >
                  {editingConfigSection === 'ccf' ? 'Cerrar' : 'Cambiar'}
                </Button>
              </div>
              {editingConfigSection === 'ccf' && (
                <div className="mt-3 border-t pt-3 max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {CCF_COLOMBIA.map((ccf) => (
                      <div
                        key={ccf.codigo}
                        onClick={() => {
                          updateCompanyConfigMutation.mutate({ ccfNombreEmpresa: ccf.nombre });
                          setEditingConfigSection(null);
                        }}
                        className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${
                          companyCcf === ccf.nombre ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        data-testid={`config-ccf-${ccf.codigo}`}
                      >
                        {ccf.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfigDialogOpen(false)}
              data-testid="button-close-config"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Afiliación Masiva */}
      <Dialog open={isMassDialogOpen} onOpenChange={setIsMassDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Afiliación Masiva de Trabajadores
            </DialogTitle>
            <DialogDescription>
              Seleccione los trabajadores que desea afiliar automáticamente con los valores por defecto de la empresa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {(!companyEps && !companyArl && !companyAfp && !companyCcf) ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Configure primero los valores por defecto
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Debe configurar al menos una entidad (EPS, ARL, AFP o CCF) de la empresa antes de usar la afiliación masiva.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setIsMassDialogOpen(false);
                    setIsConfigDialogOpen(true);
                  }}
                >
                  Configurar ahora
                </Button>
              </div>
            ) : (
              <>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    Valores que se aplicarán:
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-1">
                    {companyEps && <p>• EPS: {companyEps}</p>}
                    {companyArl && <p>• ARL: {companyArl}</p>}
                    {companyAfp && <p>• AFP: {companyAfp}</p>}
                    {companyCcf && <p>• CCF: {companyCcf}</p>}
                    {(!companyEps || !companyArl || !companyAfp || !companyCcf) && (
                      <p className="italic">Las entidades no configuradas quedarán pendientes</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Trabajadores sin afiliación ({workersWithoutAfiliacion.length})
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkersForMass(workersWithoutAfiliacion.map(w => w.id))}
                      data-testid="button-select-all"
                    >
                      Seleccionar todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkersForMass([])}
                      data-testid="button-deselect-all"
                    >
                      Limpiar selección
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[250px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {workersWithoutAfiliacion.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Todos los trabajadores ya tienen afiliación registrada
                      </p>
                    ) : (
                      workersWithoutAfiliacion.map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedWorkersForMass(prev => 
                              prev.includes(worker.id)
                                ? prev.filter(id => id !== worker.id)
                                : [...prev, worker.id]
                            );
                          }}
                          data-testid={`mass-worker-${worker.id}`}
                        >
                          <Checkbox
                            checked={selectedWorkersForMass.includes(worker.id)}
                            onCheckedChange={(checked) => {
                              setSelectedWorkersForMass(prev => 
                                checked
                                  ? [...prev, worker.id]
                                  : prev.filter(id => id !== worker.id)
                              );
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{worker.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {worker.identificationNumber} • {worker.position}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {selectedWorkersForMass.length > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedWorkersForMass.length} trabajador(es) seleccionado(s)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsMassDialogOpen(false);
                setSelectedWorkersForMass([]);
              }}
              data-testid="button-close-mass"
            >
              Cancelar
            </Button>
            {(companyEps || companyArl || companyAfp || companyCcf) && selectedWorkersForMass.length > 0 && (
              <Button 
                onClick={() => massAfiliacionMutation.mutate(selectedWorkersForMass)}
                disabled={massAfiliacionMutation.isPending}
                data-testid="button-execute-mass"
                className="bg-green-600 hover:bg-green-700"
              >
                {massAfiliacionMutation.isPending ? (
                  <>Procesando...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Afiliar {selectedWorkersForMass.length} Trabajador(es)
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </TabsContent>

      <TabsContent value="verificacion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trabajadores</p>
                    <p className="text-2xl font-bold" data-testid="text-total-trabajadores">{workers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Muestra Requerida</p>
                    <p className="text-2xl font-bold" data-testid="text-muestra-requerida">{calcularMuestraRequerida(workers.length)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verificaciones</p>
                    <p className="text-2xl font-bold" data-testid="text-total-verificaciones">{verificaciones.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Res. 0312/2019</p>
                    <p className="text-xs text-muted-foreground">
                      {workers.length <= 50 ? "100% (1-50 trab.)" : 
                       workers.length <= 200 ? "10% (51-200 trab.)" : 
                       "30 fijos (>200 trab.)"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle className="text-lg">Verificaciones de Muestreo SGSS</CardTitle>
                <CardDescription>
                  Verificación de afiliación a seguridad social según Estándar 1.1.4 y Resolución 0312/2019
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNormatividadVerificacionOpen(true)}
                  data-testid="button-normatividad-verificacion"
                  className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4" />
                  Normatividad
                </Button>
                <Button
                  onClick={() => {
                    setSelectedWorkersForMuestra([]);
                    verificacionForm.reset({
                      fecha: getTodayDateString(),
                      periodoVerificado: getLast4Months()[0]?.value || "",
                      pilaFileUrl: "",
                      observaciones: "",
                    });
                    setIsVerificacionDialogOpen(true);
                  }}
                  data-testid="button-nueva-verificacion"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Nueva Verificación
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingVerificaciones ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando verificaciones...</p>
                </div>
              ) : verificaciones.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No hay verificaciones registradas</p>
                  <p className="text-sm text-muted-foreground">
                    Inicie una nueva verificación de muestreo para cumplir con el Estándar 1.1.4
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Fecha</th>
                        <th className="text-left py-3 px-2">Período</th>
                        <th className="text-center py-3 px-2">Trabajadores</th>
                        <th className="text-center py-3 px-2">Muestra</th>
                        <th className="text-center py-3 px-2">Verificados</th>
                        <th className="text-center py-3 px-2">Cumplimiento</th>
                        <th className="text-center py-3 px-2">Estado</th>
                        <th className="text-right py-3 px-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificaciones.map((verificacion) => (
                        <tr key={verificacion.id} className="border-b hover:bg-muted/50" data-testid={`row-verificacion-${verificacion.id}`}>
                          <td className="py-3 px-2">
                            {formatDateShort(verificacion.fecha)}
                          </td>
                          <td className="py-3 px-2">{verificacion.periodoVerificado}</td>
                          <td className="text-center py-3 px-2">{verificacion.totalTrabajadores}</td>
                          <td className="text-center py-3 px-2">{verificacion.muestraRequerida}</td>
                          <td className="text-center py-3 px-2">{verificacion.muestraVerificada || 0}</td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={
                              (verificacion.porcentajeCumplimiento || 0) >= 80 ? "default" :
                              (verificacion.porcentajeCumplimiento || 0) >= 50 ? "secondary" : "destructive"
                            }>
                              {verificacion.porcentajeCumplimiento || 0}%
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2">
                            {getEstadoBadge(verificacion.estado)}
                          </td>
                          <td className="text-right py-3 px-2 flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVerDetalles(verificacion)}
                              data-testid={`button-ver-detalle-${verificacion.id}`}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                window.open(`/api/verificaciones-muestreo-sgss/${verificacion.id}/evidencia-pdf`, '_blank');
                              }}
                              data-testid={`button-descargar-pdf-${verificacion.id}`}
                              title="Descargar PDF de evidencia"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("¿Está seguro de eliminar esta verificación? Esta acción no se puede deshacer.")) {
                                  deleteVerificacionMutation.mutate(verificacion.id);
                                }
                              }}
                              data-testid={`button-eliminar-verificacion-${verificacion.id}`}
                              title="Eliminar verificación"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alto-riesgo" className="space-y-6">
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Decreto 2090 de 2003 - Actividades de Alto Riesgo
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      Las actividades de alto riesgo son aquellas que implican un deterioro de las condiciones 
                      de salud del trabajador por exposición a factores nocivos durante su vida laboral. 
                      Los empleadores deben identificar a estos trabajadores y garantizar el pago de una 
                      cotización especial adicional al fondo de pensiones.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total trabajadores de alto riesgo</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-total-alto-riesgo">
                        {highRiskWorkers.length}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Con cotización al día</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="text-porcentaje-cotizacion">
                        {porcentajeCotizacionAlDia}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold">
                Registro de Trabajadores de Alto Riesgo
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNormatividadAltoRiesgoOpen(true)}
                  data-testid="button-normatividad-alto-riesgo"
                  className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4" />
                  Normatividad
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/high-risk-workers/evidencia-pdf', '_blank')}
                  disabled={highRiskWorkers.length === 0}
                  data-testid="button-descargar-evidencia-alto-riesgo"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Descargar Evidencia PDF
                </Button>
                <Button 
                  onClick={() => {
                    setEditingHighRiskId(null);
                    highRiskForm.reset();
                    setIsHighRiskDialogOpen(true);
                  }}
                  data-testid="button-registrar-alto-riesgo"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Trabajador de Alto Riesgo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHighRiskWorkers ? (
                <div className="text-center py-8 text-muted-foreground">Cargando trabajadores de alto riesgo...</div>
              ) : highRiskWorkers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay trabajadores de alto riesgo registrados
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trabajador</TableHead>
                        <TableHead>Actividad de Riesgo</TableHead>
                        <TableHead>% Cotización</TableHead>
                        <TableHead>Último Mes Pagado</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highRiskWorkers.map((hrw) => {
                        const worker = workers.find(w => w.id === hrw.workerId);
                        const actividad = getActividadAltoRiesgoByValue(hrw.actividadRiesgo || "");
                        return (
                          <TableRow key={hrw.id} data-testid={`row-alto-riesgo-${hrw.id}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{worker?.name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{worker?.identificationNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {actividad ? actividad.label : hrw.actividadRiesgo || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {hrw.porcentajeCotizacionEspecial || '10'}%
                            </TableCell>
                            <TableCell>
                              {hrw.ultimoMesPagado || 'Sin registrar'}
                            </TableCell>
                            <TableCell>
                              {hrw.cumpleCotizacion ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Cumple
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  No Cumple
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditHighRisk(hrw)}
                                  data-testid={`button-editar-alto-riesgo-${hrw.id}`}
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm("¿Está seguro de eliminar este registro?")) {
                                      deleteHighRiskWorkerMutation.mutate(hrw.id);
                                    }
                                  }}
                                  data-testid={`button-eliminar-alto-riesgo-${hrw.id}`}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Normatividad - Verificación de Muestreo */}
      <Dialog open={isNormatividadVerificacionOpen} onOpenChange={setIsNormatividadVerificacionOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Normatividad Aplicable - Verificación de Muestreo
            </DialogTitle>
            <DialogDescription>
              Estándar 1.1.4 - Verificación de afiliación al Sistema General de Seguridad Social
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {normativaVerificacion.map((norma, index) => (
              <Card key={index} className={norma.obligatorio ? "border-primary/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{norma.codigo}</CardTitle>
                    {norma.obligatorio && (
                      <Badge variant="default" className="text-xs">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{norma.norma}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{norma.descripcion}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Requisitos:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {norma.requisitos.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNormatividadVerificacionOpen(false)}
              data-testid="button-close-normatividad-verificacion"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Normatividad - Alto Riesgo */}
      <Dialog open={isNormatividadAltoRiesgoOpen} onOpenChange={setIsNormatividadAltoRiesgoOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Normatividad Aplicable - Trabajadores de Alto Riesgo
            </DialogTitle>
            <DialogDescription>
              Marco normativo para la gestión de trabajadores en actividades de alto riesgo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {normativaAltoRiesgo.map((norma, index) => (
              <Card key={index} className={norma.obligatorio ? "border-primary/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{norma.codigo}</CardTitle>
                    {norma.obligatorio && (
                      <Badge variant="default" className="text-xs">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{norma.norma}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{norma.descripcion}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Requisitos:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {norma.requisitos.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNormatividadAltoRiesgoOpen(false)}
              data-testid="button-close-normatividad-alto-riesgo"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHighRiskDialogOpen} onOpenChange={setIsHighRiskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHighRiskId ? "Editar Trabajador de Alto Riesgo" : "Registrar Trabajador de Alto Riesgo"}
            </DialogTitle>
            <DialogDescription>
              Registre trabajadores con actividades de alto riesgo según Decreto 2090 de 2003
            </DialogDescription>
          </DialogHeader>

          <Form {...highRiskForm}>
            <form onSubmit={highRiskForm.handleSubmit(handleHighRiskSubmit)} className="space-y-4">
              <FormField
                control={highRiskForm.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!!editingHighRiskId}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-trabajador-alto-riesgo">
                          <SelectValue placeholder="Seleccione un trabajador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(editingHighRiskId ? workers : workersNotHighRisk).map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.identificationNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={highRiskForm.control}
                name="actividadRiesgo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actividad de Alto Riesgo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-actividad-riesgo">
                          <SelectValue placeholder="Seleccione la actividad de alto riesgo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVIDADES_ALTO_RIESGO_DEC_2090.map((actividad) => (
                          <SelectItem key={actividad.value} value={actividad.value}>
                            {actividad.label}
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
                  control={highRiskForm.control}
                  name="porcentajeCotizacionEspecial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Cotización Especial</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="10" 
                          {...field} 
                          data-testid="input-porcentaje-cotizacion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={highRiskForm.control}
                  name="ultimoMesPagado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Último Mes Pagado</FormLabel>
                      <FormControl>
                        <Input 
                          type="month" 
                          {...field} 
                          data-testid="input-ultimo-mes-pagado"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={highRiskForm.control}
                name="cumpleCotizacion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-cumple-cotizacion"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Cumple cotización especial
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marque si el trabajador tiene al día el pago de cotización especial AFP
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={highRiskForm.control}
                name="soportePilaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soporte PILA</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("soporte-pila-file")?.click()}
                          data-testid="button-upload-soporte-pila"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {soportePilaFile ? "Cambiar archivo" : "Subir evidencia"}
                        </Button>
                        {soportePilaFile && (
                          <span className="text-sm text-green-600 truncate max-w-xs">
                            {soportePilaFile.name}
                          </span>
                        )}
                        {!soportePilaFile && field.value && (
                          <a
                            href={field.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                            data-testid="link-soporte-pila-url"
                          >
                            Ver archivo actual
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <input
                        id="soporte-pila-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setSoportePilaFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={highRiskForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones adicionales..."
                        {...field}
                        data-testid="textarea-observaciones-alto-riesgo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsHighRiskDialogOpen(false);
                    setEditingHighRiskId(null);
                    highRiskForm.reset();
                    setSoportePilaFile(null);
                  }}
                  data-testid="button-cancelar-alto-riesgo"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createHighRiskWorkerMutation.isPending || updateHighRiskWorkerMutation.isPending || isUploadingSoportePila}
                  data-testid="button-guardar-alto-riesgo"
                >
                  {isUploadingSoportePila 
                    ? "Subiendo archivo..." 
                    : createHighRiskWorkerMutation.isPending || updateHighRiskWorkerMutation.isPending 
                      ? "Guardando..." 
                      : editingHighRiskId ? "Actualizar" : "Registrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isVerificacionDialogOpen} onOpenChange={setIsVerificacionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Verificación de Muestreo SGSS</DialogTitle>
            <DialogDescription>
              Configure los parámetros de verificación según Resolución 0312/2019
            </DialogDescription>
          </DialogHeader>

          <Form {...verificacionForm}>
            <form onSubmit={verificacionForm.handleSubmit(handleCreateVerificacion)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={verificacionForm.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Verificación</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-verificacion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={verificacionForm.control}
                  name="periodoVerificado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período Verificado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-periodo">
                            <SelectValue placeholder="Seleccione el período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getLast4Months().map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Cálculo automático de muestra (Res. 0312/2019)
                      </p>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p>Total trabajadores: <strong>{workers.length}</strong></p>
                        <p>Muestra requerida: <strong>{calcularMuestraRequerida(workers.length)}</strong></p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {workers.length <= 50 
                            ? "Empresas de 1-50 trabajadores: verificar el 100%" 
                            : workers.length <= 200 
                            ? "Empresas de 51-200 trabajadores: verificar el 10%" 
                            : "Empresas de más de 200 trabajadores: verificar 30 trabajadores"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Trabajadores para verificar</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectRandomWorkers}
                    data-testid="button-seleccion-aleatoria"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {calcularMuestraRequerida(workers.length) >= workers.length
                      ? "Seleccionar Todos"
                      : "Selección Aleatoria"}
                  </Button>
                </div>
                
                {selectedWorkersForMuestra.length > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <UserCheck className="h-4 w-4 inline mr-2" />
                      {selectedWorkersForMuestra.length} trabajadores seleccionados para verificación
                    </p>
                  </div>
                )}

                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-3 space-y-2">
                    {workers.map((worker) => (
                      <div key={worker.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded" data-testid={`worker-muestra-${worker.id}`}>
                        <Checkbox
                          checked={selectedWorkersForMuestra.includes(worker.id)}
                          onCheckedChange={(checked) => {
                            setSelectedWorkersForMuestra(prev =>
                              checked
                                ? [...prev, worker.id]
                                : prev.filter(id => id !== worker.id)
                            );
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{worker.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {worker.identificationNumber} • {worker.position} • {worker.contractType || 'empleado'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <FormField
                control={verificacionForm.control}
                name="pilaFileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Planilla PILA (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} data-testid="input-pila-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={verificacionForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones adicionales sobre la verificación..."
                        {...field}
                        data-testid="textarea-observaciones"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsVerificacionDialogOpen(false);
                    setSelectedWorkersForMuestra([]);
                  }}
                  data-testid="button-cancelar-verificacion"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={selectedWorkersForMuestra.length === 0 || createVerificacionMutation.isPending}
                  data-testid="button-crear-verificacion"
                >
                  {createVerificacionMutation.isPending ? "Creando..." : "Iniciar Verificación"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetalleDialogOpen} onOpenChange={setIsDetalleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Verificación</DialogTitle>
            {selectedVerificacion && (
              <DialogDescription>
                Período: {selectedVerificacion.periodoVerificado} • 
                Fecha: {formatDateShort(selectedVerificacion.fecha)}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {detallesVerificacion.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay detalles de verificación</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Trabajador</th>
                      <th className="text-center py-3 px-2">Tipo</th>
                      <th className="text-center py-3 px-2">EPS</th>
                      <th className="text-center py-3 px-2">ARL</th>
                      <th className="text-center py-3 px-2">AFP</th>
                      <th className="text-center py-3 px-2">CCF</th>
                      <th className="text-center py-3 px-2">Cumple</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesVerificacion.map((detalle) => {
                      const isIndependiente = detalle.tipoTrabajador === 'independiente';
                      const workerName = (detalle as any).workerName;
                      const workerIdNumber = (detalle as any).workerIdentificationNumber;
                      return (
                        <tr key={detalle.id} className="border-b hover:bg-muted/50" data-testid={`row-detalle-${detalle.id}`}>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{workerName || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{workerIdNumber}</p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={isIndependiente ? "secondary" : "default"}>
                              {isIndependiente ? "Independiente" : "Empleado"}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2">
                            <div className="flex flex-col items-center gap-1">
                              <Checkbox
                                checked={detalle.verificadoEps || false}
                                onCheckedChange={() => handleToggleDetalle(detalle, 'verificadoEps')}
                                disabled={selectedVerificacion?.estado === 'completada'}
                                data-testid={`checkbox-eps-${detalle.id}`}
                              />
                              <span className="text-xs text-muted-foreground truncate max-w-20" title={(detalle as any).epsNombre || 'N/A'}>
                                {(detalle as any).epsNombre || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <div className="flex flex-col items-center gap-1">
                              <Checkbox
                                checked={detalle.verificadoArl || false}
                                onCheckedChange={() => handleToggleDetalle(detalle, 'verificadoArl')}
                                disabled={selectedVerificacion?.estado === 'completada'}
                                data-testid={`checkbox-arl-${detalle.id}`}
                              />
                              <span className="text-xs text-muted-foreground truncate max-w-20" title={(detalle as any).arlNombre || 'N/A'}>
                                {(detalle as any).arlNombre || 'N/A'}
                              </span>
                              {isIndependiente && detalle.agremiacionNombre && (
                                <span className={`text-xs ${isAgremiacionAutorizada(detalle.agremiacionNombre) ? 'text-green-600' : 'text-red-600'}`}>
                                  {isAgremiacionAutorizada(detalle.agremiacionNombre) ? 'Autorizada' : 'No autorizada'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <div className="flex flex-col items-center gap-1">
                              <Checkbox
                                checked={detalle.verificadoAfp || false}
                                onCheckedChange={() => handleToggleDetalle(detalle, 'verificadoAfp')}
                                disabled={selectedVerificacion?.estado === 'completada'}
                                data-testid={`checkbox-afp-${detalle.id}`}
                              />
                              <span className="text-xs text-muted-foreground truncate max-w-20" title={(detalle as any).afpNombre || 'N/A'}>
                                {(detalle as any).afpNombre || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <div className="flex flex-col items-center gap-1">
                              <Checkbox
                                checked={detalle.verificadoCcf || false}
                                onCheckedChange={() => handleToggleDetalle(detalle, 'verificadoCcf')}
                                disabled={selectedVerificacion?.estado === 'completada'}
                                data-testid={`checkbox-ccf-${detalle.id}`}
                              />
                              <span className="text-xs text-muted-foreground truncate max-w-20" title={(detalle as any).ccfNombre || 'N/A'}>
                                {(detalle as any).ccfNombre || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            {detalle.cumple ? (
                              <Badge className="bg-green-100 text-green-800">Sí</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">No</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDetalleDialogOpen(false);
                setSelectedVerificacion(null);
                setDetallesVerificacion([]);
              }}
              data-testid="button-cerrar-detalle"
            >
              Cerrar
            </Button>
            {selectedVerificacion?.estado !== 'completada' && (
              <Button
                onClick={() => selectedVerificacion && completarVerificacionMutation.mutate(selectedVerificacion.id)}
                disabled={completarVerificacionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-completar-verificacion"
              >
                {completarVerificacionMutation.isPending ? "Completando..." : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Completada
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminación masiva - Estilo idéntico al de Trabajadores */}
      <Dialog 
        open={bulkDeleteDialogOpen} 
        onOpenChange={(open) => {
          setBulkDeleteDialogOpen(open);
          if (!open) {
            setBulkDeleteConfirmCode("");
            setBulkDeleteCompanyName("");
            setBulkDeleteResults(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header con fondo rojo de alerta */}
          <div className="bg-red-600 -m-6 mb-4 p-6 rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 text-xl">
                <AlertTriangle className="h-6 w-6" />
                ¡ADVERTENCIA! ACCIÓN IRREVERSIBLE
              </DialogTitle>
              <DialogDescription className="text-red-100">
                Esta operación eliminará PERMANENTEMENTE todas las afiliaciones SSSS de esta empresa
              </DialogDescription>
            </DialogHeader>
          </div>

          {bulkDeleteResults ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${bulkDeleteResults.errors.length > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-bold text-lg">{bulkDeleteResults.message}</p>
                    <p>Afiliaciones eliminadas: <span className="font-bold">{bulkDeleteResults.deleted}</span> de {bulkDeleteResults.total}</p>
                    {bulkDeleteResults.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-yellow-700 font-medium">Errores encontrados:</p>
                        <ul className="text-sm text-yellow-600 list-disc pl-4 max-h-24 overflow-y-auto">
                          {bulkDeleteResults.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setBulkDeleteDialogOpen(false);
                    setBulkDeleteResults(null);
                  }}
                  data-testid="button-cerrar-bulk-delete"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alertas visuales */}
              <div className="space-y-3">
                <div className="border-red-500 bg-red-50 dark:bg-red-950 border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-red-800 dark:text-red-200">
                      <strong>¡ATENCIÓN!</strong> Esta acción NO se puede deshacer. Todos los registros de afiliaciones al Sistema de Seguridad Social (EPS, ARL, AFP, CCF) se perderán permanentemente.
                    </p>
                  </div>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Empresa seleccionada:</p>
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{company?.name || "No seleccionada"}</p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        Se eliminarán <span className="font-bold text-red-600 text-xl">{afiliaciones.length}</span> afiliaciones
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Campos de confirmación */}
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm text-muted-foreground font-medium">
                  Para confirmar esta operación, complete los siguientes campos exactamente:
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="bulkDeleteCode" className="text-red-700 dark:text-red-400 font-semibold">
                    Escriba exactamente: ELIMINAR-TODAS-LAS-AFILIACIONES
                  </Label>
                  <Input
                    id="bulkDeleteCode"
                    value={bulkDeleteConfirmCode}
                    onChange={(e) => setBulkDeleteConfirmCode(e.target.value.toUpperCase())}
                    placeholder="ELIMINAR-TODAS-LAS-AFILIACIONES"
                    className={bulkDeleteConfirmCode === "ELIMINAR-TODAS-LAS-AFILIACIONES" ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-300"}
                    data-testid="input-bulk-delete-code"
                  />
                  {bulkDeleteConfirmCode && bulkDeleteConfirmCode !== "ELIMINAR-TODAS-LAS-AFILIACIONES" && (
                    <p className="text-xs text-red-500">El código no coincide</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bulkDeleteCompanyName" className="text-red-700 dark:text-red-400 font-semibold">
                    Escriba el nombre exacto de la empresa: {company?.name}
                  </Label>
                  <Input
                    id="bulkDeleteCompanyName"
                    value={bulkDeleteCompanyName}
                    onChange={(e) => setBulkDeleteCompanyName(e.target.value)}
                    placeholder={company?.name || "Nombre de la empresa"}
                    className={bulkDeleteCompanyName === company?.name ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-300"}
                    data-testid="input-bulk-delete-company-name"
                  />
                  {bulkDeleteCompanyName && bulkDeleteCompanyName !== company?.name && (
                    <p className="text-xs text-red-500">El nombre de la empresa no coincide</p>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBulkDeleteDialogOpen(false)}
                  data-testid="button-cancelar-bulk-delete"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={
                    bulkDeleteConfirmCode !== "ELIMINAR-TODAS-LAS-AFILIACIONES" ||
                    bulkDeleteCompanyName !== company?.name ||
                    bulkDeleteAfiliacionesMutation.isPending
                  }
                  onClick={() => {
                    if (company?.id) {
                      bulkDeleteAfiliacionesMutation.mutate(company.id);
                    }
                  }}
                  data-testid="button-confirmar-bulk-delete"
                >
                  {bulkDeleteAfiliacionesMutation.isPending ? (
                    "Eliminando..."
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Permanentemente {afiliaciones.length} Afiliaciones
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Vista de Afiliación */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Detalle de Afiliación SSSS
            </DialogTitle>
          </DialogHeader>
          
          {viewingAfiliacion && (() => {
            const worker = workers.find(w => w.id === viewingAfiliacion.workerId);
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                    <p className="font-medium">{formatDateShort(viewingAfiliacion.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trabajador</p>
                    <p className="font-medium">{worker?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{worker?.identificationNumber || ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">EPS - Salud</span>
                    </div>
                    {viewingAfiliacion.epsNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{viewingAfiliacion.epsNombre}</span>
                      </div>
                    ) : worker?.epsNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>{worker.epsNombre}</span>
                        <Badge variant="outline" className="text-xs">Trabajador</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin registrar</span>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-sm">ARL - Riesgos Laborales</span>
                    </div>
                    {viewingAfiliacion.arlNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{viewingAfiliacion.arlNombre}</span>
                      </div>
                    ) : worker?.arlNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>{worker.arlNombre}</span>
                        <Badge variant="outline" className="text-xs">Trabajador</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin registrar</span>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">AFP - Pensiones</span>
                    </div>
                    {viewingAfiliacion.afpNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{viewingAfiliacion.afpNombre}</span>
                      </div>
                    ) : worker?.afpNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>{worker.afpNombre}</span>
                        <Badge variant="outline" className="text-xs">Trabajador</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin registrar</span>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">CCF - Caja de Compensación</span>
                    </div>
                    {viewingAfiliacion.ccfNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{viewingAfiliacion.ccfNombre}</span>
                      </div>
                    ) : worker?.ccfNombre ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>{worker.ccfNombre}</span>
                        <Badge variant="outline" className="text-xs">Trabajador</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin registrar</span>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    data-testid="button-close-view-dialog"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEdit(viewingAfiliacion);
                    }}
                    data-testid="button-edit-from-view"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
