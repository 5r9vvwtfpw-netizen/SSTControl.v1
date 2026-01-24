import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, FileText, Download, ArrowLeft, Save, Sparkles, X, Check, MinusCircle, Plus, Pencil, ExternalLink, UserCheck, Users, DollarSign, ShieldCheck, Shield, AlertCircle, GraduationCap, BookOpen, Target, ClipboardList, ClipboardCheck, BarChart3, Scale, MessageSquare, ShoppingCart, RefreshCcw, HeartPulse, Activity, FileCheck, FolderLock, UserCog, Camera, Trash2, FolderOpen, Search, UserMinus, FlaskConical, History, Calendar, HardHat, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluacionSst, ComponenteSst, EstandarSst, RespuestaEstandar, insertRespuestaEstandarSchema, AccionMejora, insertAccionMejoraSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinisterioFechasCard } from "@/components/MinisterioFechasCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCompanyContext } from "@/hooks/use-company-context";
import { Estandar423VerificacionProcedimientos } from "@/components/Estandar423VerificacionProcedimientos";
import { Estandar424VerificacionInspecciones } from "@/components/Estandar424VerificacionInspecciones";
import { Estandar425VerificacionMantenimiento } from "@/components/Estandar425VerificacionMantenimiento";
import { Estandar426VerificacionEPP } from "@/components/Estandar426VerificacionEPP";
import { Estandar511VerificacionEmergencias } from "@/components/Estandar511VerificacionEmergencias";

export default function DetalleEvaluacionSst() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { companyChapter } = useCompanyContext();
  const [, setLocation] = useLocation();
  const [selectedComponente, setSelectedComponente] = useState<string | null>(null);
  const [selectedEstandar, setSelectedEstandar] = useState<EstandarSst | null>(null);
  const [respuestaDialogOpen, setRespuestaDialogOpen] = useState(false);
  const [accionDialogOpen, setAccionDialogOpen] = useState(false);
  const [tipoEmpresaDialogOpen, setTipoEmpresaDialogOpen] = useState(false);
  const [selectedTipoEmpresa, setSelectedTipoEmpresa] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenciadoDialogOpen, setLicenciadoDialogOpen] = useState(false);
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);

  // Verificar si el usuario es superadmin para permitir edición del tipo de empresa (solo superadmin)
  const isSuperAdmin = user?.role === "superadmin";

  // Labels para tipos de empresa
  const tipoEmpresaLabels: Record<string, string> = {
    tipo1: "Tipo 1 (≤10 trabajadores, riesgo I-III)",
    tipo2: "Tipo 2 (11-50 trabajadores o riesgo IV-V)",
    tipo3: "Tipo 3 (más de 50 trabajadores, riesgo I-III)",
    tipo4: "Tipo 4 (más de 50 trabajadores, riesgo IV-V)",
  };

  const { data: evaluacion, isLoading: loadingEvaluacion } = useQuery<EvaluacionSst>({
    queryKey: ["/api/evaluaciones-sst", id],
    enabled: !!id,
  });

  const { data: componentes = [] } = useQuery<ComponenteSst[]>({
    queryKey: ["/api/componentes-sst"],
  });

  const { data: estandares = [] } = useQuery<EstandarSst[]>({
    queryKey: ["/api/estandares-sst", evaluacion?.tipoEmpresa],
    enabled: !!evaluacion,
  });

  const { data: respuestas = [] } = useQuery<RespuestaEstandar[]>({
    queryKey: ["/api/evaluaciones-sst", id, "respuestas"],
    enabled: !!id,
  });

  const { data: acciones = [] } = useQuery<AccionMejora[]>({
    queryKey: ["/api/evaluaciones-sst", id, "acciones"],
    enabled: !!id,
  });

  // Query para verificar si es la primera evaluación de la empresa
  const { data: allEvaluaciones = [] } = useQuery<EvaluacionSst[]>({
    queryKey: ["/api/evaluaciones-sst"],
    enabled: !!evaluacion,
  });

  // Detectar si es la primera evaluación (línea base) de la empresa
  const isFirstEvaluation = evaluacion 
    ? allEvaluaciones.filter(e => e.companyId === evaluacion.companyId).length <= 1
    : false;

  // Obtener el nombre del responsable SST para pre-llenar acciones de mejora
  const getResponsibleName = () => {
    // Usar el responsable de la evaluación o el usuario actual
    if (evaluacion?.responsableNombre) {
      return evaluacion.responsableNombre;
    }
    return user?.username || "Responsable SST";
  };

  const respuestaForm = useForm<z.infer<typeof insertRespuestaEstandarSchema>>({
    resolver: zodResolver(insertRespuestaEstandarSchema),
    defaultValues: {
      evaluacionId: id || "",
      estandarId: "",
      cumple: 0,
      noAplica: 0,
      puntajeObtenido: 0,
      puntajeMaximo: 0,
      observaciones: "",
      evidencias: "",
    },
  });

  const accionForm = useForm<z.infer<typeof insertAccionMejoraSchema>>({
    resolver: zodResolver(insertAccionMejoraSchema),
    defaultValues: {
      evaluacionId: id || "",
      descripcionAccion: "",
      objetivo: "",
      tipoAccion: "correctiva",
      prioridad: "media",
      responsable: user?.username || "",
      areaResponsable: "SST",
      recursosNecesarios: "",
      fechaInicio: new Date(),
      fechaCompromiso: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      estado: "pendiente",
      porcentajeAvance: 0,
      indicadorEficacia: "",
      resultadoEsperado: "",
    },
  });

  const saveRespuestaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRespuestaEstandarSchema>) => {
      const existing = respuestas.find(r => r.estandarId === data.estandarId);
      if (existing) {
        const res = await apiRequest("PATCH", `/api/respuestas-estandares/${existing.id}`, data);
        return { response: await res.json(), isNew: false };
      } else {
        const res = await apiRequest("POST", `/api/evaluaciones-sst/${id}/respuestas`, data);
        return { response: await res.json(), isNew: true };
      }
    },
    onSuccess: async (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "respuestas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id] });
      
      // Cerrar diálogo y mostrar mensaje según el estándar
      setRespuestaDialogOpen(false);
      
      // Estándares que requieren evidencia en Gestión Documental
      const standardsWithEvidence = ["3.1.8", "3.1.9", "3.2.1", "3.2.2", "3.2.3"];
      const currentStandard = selectedEstandar?.numeroEstandar || "";
      
      if (standardsWithEvidence.includes(currentStandard)) {
        toast({
          title: "Respuesta guardada",
          description: `La respuesta del estándar ${currentStandard} se ha guardado. Recuerde subir la evidencia documental al módulo de Gestión Documental.`,
          className: "bg-yellow-50 border-yellow-200",
        });
      } else {
        toast({
          title: "Respuesta guardada",
          description: "La respuesta del estándar se ha guardado exitosamente",
          className: "bg-green-50 border-green-200",
        });
      }

      // Crear automáticamente Acción de Mejora cuando el estándar es "No cumple"
      const isNoCumple = variables.cumple === 0 && variables.noAplica === 0;
      const isCumple = variables.cumple === 1;
      
      if (isNoCumple && selectedEstandar) {
        // Verificar que no exista ya una acción para este estándar
        const existingAccion = acciones.find(a => a.respuestaEstandarId === result.response.id);
        if (!existingAccion) {
          // Determinar prioridad basada en el peso del estándar
          const puntajeMaximo = getPuntajeMaximoEstandar(selectedEstandar);
          const prioridad = puntajeMaximo >= 4 ? "alta" : puntajeMaximo >= 2 ? "media" : "baja";
          
          // Crear la acción de mejora automáticamente
          const accionData = {
            evaluacionId: id || "",
            respuestaEstandarId: result.response.id,
            descripcionAccion: `Incumplimiento del Estándar ${selectedEstandar.numeroEstandar} - ${selectedEstandar.nombre}`,
            objetivo: `Lograr el cumplimiento del estándar ${selectedEstandar.numeroEstandar} según los requisitos de la Resolución 0312/2019`,
            tipoAccion: "correctiva" as const,
            prioridad: prioridad as "alta" | "media" | "baja",
            responsable: getResponsibleName(),
            areaResponsable: "SST",
            recursosNecesarios: "",
            fechaInicio: new Date(),
            fechaCompromiso: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
            estado: "pendiente" as const,
            porcentajeAvance: 0,
            indicadorEficacia: "Cumplimiento del estándar en próxima evaluación",
            resultadoEsperado: "Estándar cumplido al 100%",
          };
          
          createAutoAccionMutation.mutate(accionData);
        }
      }
      
      // Completar automáticamente la acción cuando el estándar cambia a "Cumple"
      if (isCumple) {
        const accionAsociada = acciones.find(a => a.respuestaEstandarId === result.response.id);
        if (accionAsociada && accionAsociada.estado !== 'completada' && accionAsociada.estado !== 'verificada') {
          // Completar la acción automáticamente
          apiRequest("PATCH", `/api/acciones-mejora/${accionAsociada.id}`, {
            estado: 'completada',
            porcentajeAvance: 100,
            fechaCierre: new Date(),
            resultadoObtenido: 'Estándar cumplido - verificado en evaluación SST'
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "acciones"] });
            toast({
              title: "Acción completada automáticamente",
              description: "La acción de mejora se ha marcado como completada al cumplir el estándar",
              className: "bg-green-50 border-green-200",
            });
          }).catch(err => {
            console.error('Error al completar acción:', err);
          });
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para crear acción de mejora (usada manualmente desde el diálogo)
  const createAccionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAccionMejoraSchema>) => {
      const res = await apiRequest("POST", `/api/evaluaciones-sst/${id}/acciones`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "acciones"] });
      setAccionDialogOpen(false);
      accionForm.reset();
      toast({
        title: "Acción creada",
        description: "La acción de mejora se ha creado exitosamente",
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

  // Mutación separada para crear acciones automáticamente (sin afectar el diálogo)
  const createAutoAccionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAccionMejoraSchema>) => {
      const res = await apiRequest("POST", `/api/evaluaciones-sst/${id}/acciones`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "acciones"] });
      toast({
        title: "Acción de mejora creada automáticamente",
        description: "Se ha generado una acción correctiva para el estándar no cumplido",
        className: "bg-blue-50 border-blue-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear acción automática",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para confirmar respuesta heredada del año anterior
  const confirmarRespuestaHeredadaMutation = useMutation({
    mutationFn: async (respuestaId: string) => {
      const res = await apiRequest("PATCH", `/api/evaluaciones-sst/respuestas/${respuestaId}`, { 
        requiresRefresh: 0 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "respuestas"] });
      toast({
        title: "Respuesta verificada",
        description: "La respuesta heredada ha sido confirmada como vigente para este año",
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

  const confirmarRespuestaHeredada = (respuestaId: string) => {
    confirmarRespuestaHeredadaMutation.mutate(respuestaId);
  };

  // Mutación para verificar eficacia de acción de mejora
  const verificarEficaciaMutation = useMutation({
    mutationFn: async ({ accionId, eficaz }: { accionId: string; eficaz: number }) => {
      const res = await apiRequest("PATCH", `/api/acciones-mejora/${accionId}`, { eficaz });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "acciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-actuar"] });
      toast({
        title: "Eficacia verificada",
        description: "La verificación de eficacia se ha registrado correctamente",
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

  const generarPlanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/evaluaciones-sst/${id}/generar-plan`, {});
      return res.json();
    },
    onSuccess: (acciones) => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "acciones"] });
      if (acciones.length === 0) {
        toast({
          title: "Sin acciones nuevas",
          description: "No hay estándares no cumplidos pendientes de acción. Evalúa más estándares o verifica que no existan acciones previas.",
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        toast({
          title: "Plan generado",
          description: `Se han generado ${acciones.length} acciones de mejora automáticamente`,
          className: "bg-yellow-50 border-yellow-200",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para actualizar el tipo de empresa (solo superadmin)
  const updateTipoEmpresaMutation = useMutation({
    mutationFn: async (tipoEmpresa: string) => {
      const res = await apiRequest("PATCH", `/api/evaluaciones-sst/${id}`, { tipoEmpresa });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id, "respuestas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estandares-sst"] });
      setTipoEmpresaDialogOpen(false);
      toast({
        title: "Tipo de empresa actualizado",
        description: "El tipo de empresa de la evaluación se ha actualizado exitosamente",
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

  // Mutation para eliminar la evaluación
  const deleteEvaluacionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/evaluaciones-sst/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst"] });
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación ha sido eliminada exitosamente",
        className: "bg-green-50 border-green-200",
      });
      setLocation('/evaluaciones-sst');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para finalizar la evaluación
  const finalizarEvaluacionMutation = useMutation({
    mutationFn: async (nuevoEstado: string) => {
      const res = await apiRequest("PATCH", `/api/evaluaciones-sst/${id}`, { estado: nuevoEstado });
      return res.json();
    },
    onSuccess: (_, nuevoEstado) => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-sst"] });
      setFinalizarDialogOpen(false);
      
      const mensajes: Record<string, { titulo: string; descripcion: string }> = {
        "completada": {
          titulo: "Evaluación finalizada",
          descripcion: "La evaluación ha sido finalizada exitosamente. Ya puede generar el reporte para el Ministerio."
        },
        "enviada": {
          titulo: "Evaluación enviada",
          descripcion: "La evaluación ha sido marcada como enviada al Ministerio de Trabajo."
        },
        "en-progreso": {
          titulo: "Evaluación reabierta",
          descripcion: "La evaluación ha sido reabierta para continuar con la edición."
        }
      };
      
      const mensaje = mensajes[nuevoEstado] || { titulo: "Estado actualizado", descripcion: "El estado de la evaluación ha sido actualizado." };
      
      toast({
        title: mensaje.titulo,
        description: mensaje.descripcion,
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

  // Inicializar selectedTipoEmpresa cuando se carga la evaluación
  useEffect(() => {
    if (evaluacion?.tipoEmpresa) {
      setSelectedTipoEmpresa(evaluacion.tipoEmpresa);
    }
  }, [evaluacion?.tipoEmpresa]);

  const handleUpdateTipoEmpresa = () => {
    if (selectedTipoEmpresa) {
      updateTipoEmpresaMutation.mutate(selectedTipoEmpresa);
    }
  };

  const handleEstandarClick = (estandar: EstandarSst) => {
    // Bloquear edición si la evaluación está completada o enviada
    if (evaluacion?.estado === "completada" || evaluacion?.estado === "enviada") {
      toast({
        title: "Evaluación bloqueada",
        description: "Esta evaluación está finalizada y no permite ediciones. Para modificarla, primero reabra la evaluación.",
        variant: "destructive",
      });
      return;
    }
    setSelectedEstandar(estandar);
    const existing = respuestas.find(r => r.estandarId === estandar.id);
    
    const puntajeMaximo = getPuntajeMaximoEstandar(estandar);
    
    // Pre-llenar URL de evidencia para estándares con módulo relacionado
    const getEvidenciaUrl = () => {
      if (estandar.numeroEstandar === "1.1.1") {
        return `${window.location.origin}/designacion-responsable`;
      }
      if (estandar.numeroEstandar === "1.1.2") {
        return `${window.location.origin}/designacion-responsable`;
      }
      if (estandar.numeroEstandar === "1.1.3") {
        return `${window.location.origin}/asignacion-recursos`;
      }
      if (estandar.numeroEstandar === "1.1.6") {
        return `${window.location.origin}/copasst-gestion`;
      }
      if (estandar.numeroEstandar === "1.1.7") {
        return `${window.location.origin}/capacitacion-copasst`;
      }
      if (estandar.numeroEstandar === "1.1.8") {
        return `${window.location.origin}/comite-convivencia-actas`;
      }
      if (estandar.numeroEstandar === "1.2.1") {
        return `${window.location.origin}/programa-capacitacion-anual`;
      }
      if (estandar.numeroEstandar === "2.5.1") {
        return `${window.location.origin}/conservacion-documentos`;
      }
      return "";
    };
    
    if (existing) {
      // Si ya hay respuesta pero sin evidencia, sugerir la URL del módulo
      const evidenciaValue = existing.evidencias || getEvidenciaUrl();
      
      respuestaForm.reset({
        evaluacionId: id || "",
        estandarId: estandar.id,
        cumple: existing.cumple,
        noAplica: existing.noAplica,
        puntajeObtenido: existing.puntajeObtenido,
        puntajeMaximo: existing.puntajeMaximo,
        observaciones: existing.observaciones || "",
        evidencias: evidenciaValue,
      });
    } else {
      respuestaForm.reset({
        evaluacionId: id || "",
        estandarId: estandar.id,
        cumple: 0,
        noAplica: 0,
        puntajeObtenido: 0,
        puntajeMaximo,
        observaciones: "",
        evidencias: getEvidenciaUrl(),
      });
    }
    setRespuestaDialogOpen(true);
  };

  const getPuntajeMaximoEstandar = (estandar: EstandarSst) => {
    if (!evaluacion) return 0;
    const tipo = evaluacion.tipoEmpresa;
    const key = `puntaje${tipo.charAt(0).toUpperCase()}${tipo.slice(1)}` as keyof EstandarSst;
    return (estandar[key] as number) || 0;
  };

  const onSubmitRespuesta = (values: z.infer<typeof insertRespuestaEstandarSchema>) => {
    // Lógica según Resolución 0312/2019:
    // - CUMPLE: Se otorga el puntaje total definido en el maestro
    // - NO CUMPLE: No suma puntos (0)
    // - NO APLICA: Si se justifica, el puntaje se mantiene (ej: estándar 3.2.2 sin enfermedades que reportar)
    const puntaje = values.noAplica 
      ? values.puntajeMaximo  // NO APLICA mantiene el puntaje según la norma
      : (values.cumple ? values.puntajeMaximo : 0);  // CUMPLE = máximo, NO CUMPLE = 0
    saveRespuestaMutation.mutate({
      ...values,
      puntajeObtenido: puntaje,
    });
  };

  const onSubmitAccion = (values: z.infer<typeof insertAccionMejoraSchema>) => {
    createAccionMutation.mutate(values);
  };

  const getEstadoEstandar = (estandarId: string) => {
    const respuesta = respuestas.find(r => r.estandarId === estandarId);
    if (!respuesta) return { icon: MinusCircle, color: "text-gray-400", label: "Sin evaluar" };
    if (respuesta.noAplica) return { icon: X, color: "text-gray-500", label: "No aplica" };
    if (respuesta.cumple) return { icon: Check, color: "text-green-600", label: "Cumple" };
    return { icon: X, color: "text-red-600", label: "No cumple" };
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

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/evaluaciones-sst/${id}/pdf`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error al descargar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluacion-sst-${evaluacion?.anio}.pdf`;
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

  const handleDownloadMinisterioReport = () => {
    setLicenciadoDialogOpen(true);
  };

  const confirmDownloadMinisterioReport = async () => {
    try {
      const response = await fetch(`/api/evaluaciones-sst/${id}/pdf-ministerio`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Intentar leer el mensaje de error del backend
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al generar reporte para el Ministerio');
        }
        throw new Error('Error al generar reporte para el Ministerio');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte-Ministerio-SST-${evaluacion?.anio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Reporte generado",
        description: "Reporte oficial para el Ministerio del Trabajo generado exitosamente. Recuerde enviarlo también a su ARL.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      const isLicensedProfessionalError = error.message?.includes('Profesional Licenciado') || error.message?.includes('licencia vigente');
      toast({
        title: isLicensedProfessionalError ? "Requisito pendiente" : "Error",
        description: error.message,
        variant: isLicensedProfessionalError ? "default" : "destructive",
        className: isLicensedProfessionalError ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" : undefined,
        duration: isLicensedProfessionalError ? 15000 : 5000,
      });
    } finally {
      setLicenciadoDialogOpen(false);
    }
  };

  if (loadingEvaluacion) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando evaluación...</p>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-semibold mb-2">Evaluación no encontrada</p>
        <Button onClick={() => setLocation('/evaluaciones-sst')}>Volver a evaluaciones</Button>
      </div>
    );
  }

  const estandaresPorComponente = componentes.map(comp => ({
    componente: comp,
    estandares: estandares.filter(e => e.componenteId === comp.id),
  }));

  // Filtrar solo componentes que tienen estándares aplicables para el tipo de empresa
  const componentesConEstandares = estandaresPorComponente.filter(
    ({ estandares: estComp }) => estComp.length > 0
  );

  const totalEstandares = estandares.length;
  const estandaresEvaluados = respuestas.length;
  const progreso = totalEstandares > 0 ? Math.round((estandaresEvaluados / totalEstandares) * 100) : 0;
  
  // Detectar si es evaluación inicial (todos los estándares en "No Cumple" = puntaje 0)
  const esEvaluacionInicial = respuestas.length > 0 && 
    respuestas.every(r => r.cumple === 0 && r.noAplica === 0) &&
    (evaluacion?.puntajeTotal ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => setLocation('/evaluaciones-sst')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              Evaluación {evaluacion.anio} - {new Date(2024, evaluacion.mes - 1).toLocaleDateString('es-CO', { month: 'long' })}
            </h1>
            {evaluacion.estado === "en-progreso" && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400" data-testid="badge-estado-en-progreso">
                En Progreso
              </Badge>
            )}
            {evaluacion.estado === "completada" && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-estado-completada">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Finalizada
              </Badge>
            )}
            {evaluacion.estado === "enviada" && (
              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400" data-testid="badge-estado-enviada">
                <FileCheck className="h-3 w-3 mr-1" />
                Enviada al Ministerio
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Responsable: {evaluacion.responsableNombre}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {getNivelBadge(evaluacion.nivelCumplimiento, evaluacion.porcentajeCumplimiento)}
          <Button 
            variant="default" 
            onClick={handleDownloadMinisterioReport} 
            data-testid="button-export-ministerio"
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar Reporte Ministerio
          </Button>
          {evaluacion.estado === "en-progreso" && (
            <Button 
              variant="default"
              onClick={() => setFinalizarDialogOpen(true)}
              data-testid="button-finalizar-evaluacion"
              className="bg-primary"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar Evaluación
            </Button>
          )}
          {evaluacion.estado === "completada" && (
            <>
              <Button 
                variant="outline"
                onClick={() => finalizarEvaluacionMutation.mutate("en-progreso")}
                disabled={finalizarEvaluacionMutation.isPending}
                data-testid="button-reabrir-evaluacion"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reabrir
              </Button>
              <Button 
                variant="default"
                onClick={() => finalizarEvaluacionMutation.mutate("enviada")}
                disabled={finalizarEvaluacionMutation.isPending}
                data-testid="button-marcar-enviada"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Marcar como Enviada
              </Button>
            </>
          )}
          {evaluacion.estado === "enviada" && (
            <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1">
              <FileCheck className="h-3 w-3 mr-1" />
              Enviada al Ministerio
            </Badge>
          )}
          {isSuperAdmin && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  data-testid="button-delete-evaluation"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Eliminar evaluación?</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán todos los datos de la evaluación, 
                    incluyendo respuestas y acciones de mejora asociadas.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteEvaluacionMutation.mutate()}
                    disabled={deleteEvaluacionMutation.isPending}
                    data-testid="button-confirm-delete"
                  >
                    {deleteEvaluacionMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card data-testid="card-tipo-empresa">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-1">
              <CardTitle className="text-sm font-medium">Tipo de Empresa</CardTitle>
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setTipoEmpresaDialogOpen(true)}
                  data-testid="button-edit-tipo-empresa"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold" data-testid="text-tipo-empresa-value">
              Tipo {evaluacion.tipoEmpresa?.slice(-1) || "1"}
            </div>
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-tipo-empresa-description">
              {tipoEmpresaLabels[evaluacion.tipoEmpresa || "tipo1"]?.split(" (")[1]?.replace(")", "") || "Res. 0312/2019"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progreso}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {estandaresEvaluados} de {totalEstandares} estándares
            </p>
            <Progress value={progreso} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Puntaje Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluacion.puntajeTotal ?? 0} / {evaluacion.puntajeMaximo ?? 100}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Puntos obtenidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluacion.porcentajeCumplimiento ?? 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Nivel de cumplimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Acciones Mejora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acciones.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {acciones.filter(a => a.estado === 'pendiente').length} pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Puntajes por Ciclo PHVA */}
      {(() => {
        let phvaData: Record<string, { obtenido: number; maximo: number }> | null = null;
        try {
          if (evaluacion.puntajesPorCicloPhva && typeof evaluacion.puntajesPorCicloPhva === 'string' && evaluacion.puntajesPorCicloPhva.trim()) {
            phvaData = JSON.parse(evaluacion.puntajesPorCicloPhva);
          }
        } catch (e) {
          phvaData = null;
        }
        
        if (!phvaData) return null;
        
        const ciclos = [
          { key: 'planear', nombre: 'Planear', bgColor: '#2196F3', icon: 'P' },
          { key: 'hacer', nombre: 'Hacer', bgColor: '#4CAF50', icon: 'H' },
          { key: 'verificar', nombre: 'Verificar', bgColor: '#FFEB3B', textColor: '#333', icon: 'V' },
          { key: 'actuar', nombre: 'Actuar', bgColor: '#D32F2F', icon: 'A' },
        ];
        
        return (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Trazabilidad Ciclo PHVA
              </CardTitle>
              <CardDescription>Puntajes agrupados según el ciclo de mejora continua</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ciclos.map(ciclo => {
                  const data = phvaData![ciclo.key] || { obtenido: 0, maximo: 0 };
                  const porcentaje = data.maximo > 0 ? Math.round((data.obtenido / data.maximo) * 100) : 0;
                  return (
                    <div key={ciclo.key} className="flex items-center gap-3 p-3 rounded-lg border" data-testid={`phva-${ciclo.key}`}>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                        style={{ backgroundColor: ciclo.bgColor, color: ciclo.textColor || 'white' }}
                      >
                        {ciclo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{ciclo.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.obtenido} / {data.maximo} pts
                        </div>
                        <div className="text-xs font-medium" style={{ color: porcentaje >= 85 ? '#4CAF50' : porcentaje >= 60 ? '#FF9800' : '#D32F2F' }}>
                          {porcentaje}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Calendario del Ministerio de Trabajo */}
      <MinisterioFechasCard compact />

      {/* Diálogo de advertencia sobre licenciado de salud ocupacional */}
      <AlertDialog open={licenciadoDialogOpen} onOpenChange={setLicenciadoDialogOpen}>
        <AlertDialogContent data-testid="dialog-licenciado-warning">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Aviso Importante
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              El reporte para el Ministerio del Trabajo debe estar firmado por un profesional en seguridad y salud en el trabajo con licencia vigente, según la Resolución 0312 de 2019.
              <br /><br />
              Este reporte se genera para ser subido a: <span className="font-medium">https://sgrl.mintrabajo.gov.co</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-ministerio">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDownloadMinisterioReport}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-ministerio"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para finalizar evaluación */}
      <AlertDialog open={finalizarDialogOpen} onOpenChange={setFinalizarDialogOpen}>
        <AlertDialogContent data-testid="dialog-finalizar-evaluacion">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Finalizar Evaluación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {progreso < 100 ? (
                <>
                  <span className="font-semibold text-amber-600">Atención:</span> Solo ha evaluado {progreso}% de los estándares ({estandaresEvaluados} de {totalEstandares}).
                  <br /><br />
                  ¿Está seguro de que desea finalizar la evaluación con estándares pendientes? Los estándares no evaluados contarán como "No Cumple" (0 puntos).
                </>
              ) : (
                <>
                  Ha completado la evaluación de todos los estándares. Al finalizar:
                  <br /><br />
                  <ul className="list-disc pl-5 space-y-1">
                    <li>La evaluación quedará bloqueada para edición</li>
                    <li>Podrá generar el reporte oficial para el Ministerio</li>
                    <li>Las acciones de mejora quedarán registradas</li>
                  </ul>
                  <br />
                  Si necesita hacer cambios después, puede reabrir la evaluación.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-finalizar">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => finalizarEvaluacionMutation.mutate("completada")}
              className="bg-primary"
              data-testid="button-confirm-finalizar"
              disabled={finalizarEvaluacionMutation.isPending}
            >
              {finalizarEvaluacionMutation.isPending ? "Finalizando..." : "Sí, Finalizar Evaluación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para editar tipo de empresa (solo superadmin) */}
      <Dialog open={tipoEmpresaDialogOpen} onOpenChange={(open) => {
        setTipoEmpresaDialogOpen(open);
        if (!open && evaluacion?.tipoEmpresa) {
          setSelectedTipoEmpresa(evaluacion.tipoEmpresa);
        }
      }}>
        <DialogContent data-testid="dialog-tipo-empresa">
          <DialogHeader>
            <DialogTitle>Cambiar Tipo de Empresa</DialogTitle>
            <DialogDescription>
              Modifique el tipo de empresa según Resolución 0312/2019. 
              Esto afectará los estándares aplicables a esta evaluación.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedTipoEmpresa} onValueChange={setSelectedTipoEmpresa}>
              <SelectTrigger data-testid="select-tipo-empresa-edit">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tipo1">Tipo 1 (≤10 trabajadores, riesgo I-III)</SelectItem>
                <SelectItem value="tipo2">Tipo 2 (11-50 trabajadores o riesgo IV-V)</SelectItem>
                <SelectItem value="tipo3">Tipo 3 (más de 50 trabajadores, riesgo I-III)</SelectItem>
                <SelectItem value="tipo4">Tipo 4 (más de 50 trabajadores, riesgo IV-V)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTipoEmpresaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateTipoEmpresa} 
              disabled={updateTipoEmpresaMutation.isPending}
              data-testid="button-save-tipo-empresa"
            >
              {updateTipoEmpresaMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner de guía para evaluación inicial */}
      {esEvaluacionInicial && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                ¡Comience por su Plan de Trabajo Anual!
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Según la Resolución 0312/2019, el Plan de Trabajo Anual es el eje central para organizar todas sus actividades SST.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setLocation('/planes-trabajo-anual')}
                  data-testid="button-ir-plan-anual"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Ir al Plan de Trabajo Anual
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs value={selectedComponente || componentes[0]?.id} onValueChange={setSelectedComponente}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full">
            {componentes.map((comp) => {
              const shortNames: Record<number, string> = {
                1: "Recursos",
                2: "Gestión Integral",
                3: "Salud",
                4: "Peligros y Riesgos",
                5: "Amenazas",
                6: "Verificación",
                7: "Mejoramiento"
              };
              return (
                <TabsTrigger key={comp.id} value={comp.id} className="flex-1 min-w-[120px] text-xs" data-testid={`tab-component-${comp.numero}`}>
                  {comp.numero}. {shortNames[comp.numero] || comp.nombre}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {estandaresPorComponente.map(({ componente, estandares: estComp }) => (
          <TabsContent key={componente.id} value={componente.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {componente.numero}. {componente.nombre}
                </CardTitle>
                <CardDescription>
                  Peso total: {componente.pesoTotal}% - {estComp.length} estándares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {estComp.length === 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Componente no aplicable</p>
                        <p className="text-xs text-muted-foreground">
                          Según la Resolución 0312/2019, este componente no tiene estándares obligatorios para empresas {
                            evaluacion?.tipoEmpresa === 'tipo1' ? 'de 10 o menos trabajadores con riesgo I-III (Tipo 1)' :
                            evaluacion?.tipoEmpresa === 'tipo2' ? 'de 11-50 trabajadores con riesgo I-III (Tipo 2)' :
                            evaluacion?.tipoEmpresa === 'tipo3' ? 'de hasta 50 trabajadores con riesgo IV-V (Tipo 3)' :
                            'de más de 50 trabajadores o riesgo IV-V (Tipo 4)'
                          }.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {estComp.map((estandar) => {
                  const estado = getEstadoEstandar(estandar.id);
                  const Icon = estado.icon;
                  const respuesta = respuestas.find(r => r.estandarId === estandar.id);
                  return (
                    <div
                      key={estandar.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => handleEstandarClick(estandar)}
                      data-testid={`item-estandar-${estandar.numeroEstandar}`}
                    >
                      <Icon className={`h-5 w-5 mt-0.5 ${estado.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">
                                Estándar {estandar.numeroEstandar}
                              </p>
                              {respuesta?.isInherited === 1 && (
                                <Badge 
                                  variant={respuesta.requiresRefresh === 1 ? "outline" : "secondary"}
                                  className={respuesta.requiresRefresh === 1 ? "border-orange-400 text-orange-600 dark:text-orange-400" : ""}
                                  data-testid={`badge-heredado-${estandar.numeroEstandar}`}
                                >
                                  <History className="h-3 w-3 mr-1" />
                                  {respuesta.requiresRefresh === 1 ? "Heredado - Revisar" : "Heredado - Verificado"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{estandar.nombre}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {respuesta?.isInherited === 1 && respuesta.requiresRefresh === 1 && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmarRespuestaHeredada(respuesta.id);
                                }}
                                disabled={confirmarRespuestaHeredadaMutation.isPending}
                                data-testid={`button-confirmar-heredado-${respuesta.id}`}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            <Badge variant="outline">
                              {getPuntajeMaximoEstandar(estandar)} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan de Mejora</CardTitle>
              <CardDescription>
                Acciones correctivas y preventivas basadas en hallazgos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => generarPlanMutation.mutate()}
                disabled={generarPlanMutation.isPending || respuestas.length === 0}
                data-testid="button-generate-plan"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Plan Automático
              </Button>
              <Dialog open={accionDialogOpen} onOpenChange={setAccionDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-action">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Acción
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Nueva Acción de Mejora</DialogTitle>
                    <DialogDescription>
                      Registre una acción correctiva o preventiva
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...accionForm}>
                    <form onSubmit={accionForm.handleSubmit(onSubmitAccion)} className="space-y-4">
                      <FormField
                        control={accionForm.control}
                        name="descripcionAccion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción de la Acción</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} data-testid="input-accion-descripcion" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accionForm.control}
                          name="tipoAccion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-tipo-accion">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="correctiva">Correctiva</SelectItem>
                                  <SelectItem value="preventiva">Preventiva</SelectItem>
                                  <SelectItem value="mejora">Mejora</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={accionForm.control}
                          name="prioridad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridad</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-prioridad">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="baja">Baja</SelectItem>
                                  <SelectItem value="media">Media</SelectItem>
                                  <SelectItem value="alta">Alta</SelectItem>
                                  <SelectItem value="critica">Crítica</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={accionForm.control}
                        name="responsable"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsable</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-responsable" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={createAccionMutation.isPending}
                          data-testid="button-submit-action"
                        >
                          {createAccionMutation.isPending ? "Guardando..." : "Guardar Acción"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mostrar TODAS las acciones de mejora con priorización visual */}
          {(() => {
            // Función para determinar el estado de vencimiento
            const getEstadoVencimiento = (accion: AccionMejora) => {
              if (accion.estado === 'completada' || accion.estado === 'verificada') {
                return { tipo: 'completada', clase: 'border-green-500 bg-green-50 dark:bg-green-950/20', icono: '✓' };
              }
              const hoy = new Date();
              const fechaCompromiso = new Date(accion.fechaCompromiso);
              const diasRestantes = Math.ceil((fechaCompromiso.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diasRestantes < 0) {
                return { tipo: 'vencida', clase: 'border-red-500 border-2 bg-red-50 dark:bg-red-950/20', icono: '⚠️', texto: `Vencida hace ${Math.abs(diasRestantes)} días` };
              } else if (diasRestantes <= 7) {
                return { tipo: 'proxima', clase: 'border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-950/20', icono: '⏰', texto: `Vence en ${diasRestantes} días` };
              } else {
                return { tipo: 'enTiempo', clase: 'border-gray-200 dark:border-gray-700', icono: '', texto: '' };
              }
            };
            
            // Ordenar acciones: primero vencidas, luego próximas a vencer, luego en tiempo
            const accionesOrdenadas = [...acciones].sort((a, b) => {
              const hoy = new Date();
              const diasA = Math.ceil((new Date(a.fechaCompromiso).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              const diasB = Math.ceil((new Date(b.fechaCompromiso).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              // Ordenar: completadas al final, luego por días restantes (menor primero)
              if (a.estado === 'completada' || a.estado === 'verificada') return 1;
              if (b.estado === 'completada' || b.estado === 'verificada') return -1;
              return diasA - diasB;
            });
            
            return acciones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay acciones de mejora registradas.</p>
                <p className="text-sm mt-2">Use "Generar Plan Automático" para crear acciones basadas en estándares no cumplidos, o cree una acción manual.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accionesOrdenadas.map((accion) => {
                  const estadoVenc = getEstadoVencimiento(accion);
                  const esAutoGenerada = !!accion.respuestaEstandarId;
                  return (
                    <div
                      key={accion.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${estadoVenc.clase}`}
                      data-testid={`item-action-${accion.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {estadoVenc.icono && <span>{estadoVenc.icono}</span>}
                            <p className="font-medium">{accion.descripcionAccion}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {esAutoGenerada && (
                              <Badge variant="secondary" className="text-xs">Auto</Badge>
                            )}
                            <Badge variant="outline" className={
                              accion.prioridad === 'critica' ? 'border-red-500 text-red-700 dark:text-red-400' :
                              accion.prioridad === 'alta' ? 'border-orange-500 text-orange-700 dark:text-orange-400' :
                              accion.prioridad === 'media' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                              'border-green-500 text-green-700 dark:text-green-400'
                            }>{accion.prioridad}</Badge>
                            <Badge variant="outline">{accion.estado}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{accion.objetivo}</p>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span>Responsable: {accion.responsable}</span>
                          <span className={estadoVenc.tipo === 'vencida' ? 'text-red-600 font-medium' : estadoVenc.tipo === 'proxima' ? 'text-yellow-600 font-medium' : ''}>
                            Compromiso: {new Date(accion.fechaCompromiso).toLocaleDateString('es-CO')}
                            {estadoVenc.texto && ` (${estadoVenc.texto})`}
                          </span>
                          <span>Avance: {accion.porcentajeAvance}%</span>
                        </div>
                        
                        {/* Sección de verificación de eficacia para acciones completadas */}
                        {accion.estado === 'completada' && (
                          <div className="mt-3 pt-3 border-t border-dashed">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm font-medium text-muted-foreground">Verificar eficacia:</span>
                              {accion.eficaz === null ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                                    onClick={() => verificarEficaciaMutation.mutate({ accionId: accion.id, eficaz: 1 })}
                                    disabled={verificarEficaciaMutation.isPending || evaluacion?.estado === "completada" || evaluacion?.estado === "enviada"}
                                    data-testid={`button-eficaz-${accion.id}`}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Eficaz
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    onClick={() => verificarEficaciaMutation.mutate({ accionId: accion.id, eficaz: 0 })}
                                    disabled={verificarEficaciaMutation.isPending || evaluacion?.estado === "completada" || evaluacion?.estado === "enviada"}
                                    data-testid={`button-no-eficaz-${accion.id}`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    No Eficaz
                                  </Button>
                                </>
                              ) : (
                                <Badge 
                                  variant="outline" 
                                  className={accion.eficaz === 1 
                                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                                    : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                  }
                                  data-testid={`badge-eficacia-${accion.id}`}
                                >
                                  {accion.eficaz === 1 ? (
                                    <><Check className="h-3 w-3 mr-1" /> Verificada como Eficaz</>
                                  ) : (
                                    <><X className="h-3 w-3 mr-1" /> Verificada como No Eficaz</>
                                  )}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Dialog open={respuestaDialogOpen} onOpenChange={setRespuestaDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Evaluar Estándar {selectedEstandar?.numeroEstandar}
            </DialogTitle>
            <DialogDescription>
              {selectedEstandar?.nombre}
            </DialogDescription>
          </DialogHeader>
          
          {/* Enlace al módulo relacionado para el Estándar 1.1.1 */}
          {selectedEstandar?.numeroEstandar === "1.1.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el documento en el que consta la asignación, con la respectiva determinación de responsabilidades y constatar la hoja de vida con soportes, de la persona asignada.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8</strong> - Obligaciones de los empleadores</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.1</li>
                      <li>Designación documentada del responsable del SG-SST</li>
                      <li>Perfil del cargo y competencias del responsable</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Acta de Designación del Responsable del SG-SST firmada, hoja de vida con soportes académicos y laborales
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-designacion-responsable"
                      asChild
                    >
                      <Link href={`/designacion-responsable?from=evaluation&evaluationId=${id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir a Designación de Responsables
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enlace al módulo relacionado para el Estándar 1.1.2 */}
          {selectedEstandar?.numeroEstandar === "1.1.2" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.2
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el soporte que contenga la asignación de las responsabilidades en SST para todos los niveles de la organización.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8</strong> - Obligaciones de los empleadores, numeral 2</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.2</li>
                      <li>Responsabilidades documentadas en todos los niveles jerárquicos</li>
                      <li>Manual de funciones con responsabilidades SST por cargo</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Perfiles de cargo con responsabilidades SST documentadas, manual de funciones, matriz de responsabilidades SST
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-designacion-responsabilidades"
                      asChild
                    >
                      <Link href={`/designacion-responsable?from=evaluation&evaluationId=${id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir a Designación de Responsabilidades
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enlace al módulo relacionado para el Estándar 1.1.3 */}
          {selectedEstandar?.numeroEstandar === "1.1.3" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.3
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Constatar la existencia de evidencias físicas que demuestren la definición y asignación del talento humano, los recursos financieros, técnicos y de otra índole para la implementación, mantenimiento y continuidad del SG-SST, evidenciando la asignación de recursos con base en el plan de trabajo anual.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8 numeral 4</strong> - Asignación de recursos para el SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.3</li>
                      <li>Talento humano, recursos financieros y técnicos documentados</li>
                      <li>Presupuesto asignado para actividades de SST</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Documento de asignación de recursos SST, presupuesto anual para SST, plan de trabajo con recursos asignados
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-asignacion-recursos"
                      asChild
                    >
                      <Link href={`/asignacion-recursos?from=evaluation&evaluationId=${id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir a Asignación de Recursos
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.1.4 */}
          {selectedEstandar?.numeroEstandar === "1.1.4" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.4
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar lista de trabajadores vinculados laboralmente y comparar con la planilla de pago de aportes a la seguridad social de los cuatro (4) meses anteriores a la fecha de verificación.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Ley 100/1993</strong> - Sistema General de Seguridad Social Integral</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8 numeral 8</strong> - Afiliación al SGSS</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.4</li>
                      <li>Afiliación obligatoria a EPS, ARL, AFP y CCF</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                      Criterio de muestreo:
                    </p>
                    <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>Entre 51-200 trabajadores: verificar el 10%</li>
                      <li>Mayores a 201 trabajadores: verificar 30 trabajadores</li>
                      <li>En contratistas/independientes verificar agremiación conforme al listado del MinSalud</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Planillas de aportes PILA de los últimos 4 meses, certificados de afiliación a EPS, ARL, AFP y CCF
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-afiliaciones-ssss"
                      asChild
                    >
                      <Link href={`/afiliaciones-ssss?from=evaluation&evaluationId=${id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir a Afiliaciones SSSS
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.1.5 */}
          {selectedEstandar?.numeroEstandar === "1.1.5" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.5
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    En los casos de que aplique, verificar si se tienen identificados los trabajadores que se dedican en forma permanente al ejercicio de las actividades de alto riesgo de que trata el Decreto número 2090 de 2003 y si se ha realizado el pago de la cotización especial señalado en dicha norma.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 2090/2003</strong> - Actividades de alto riesgo para pensión especial</li>
                      <li><strong>Ley 860/2003</strong> - Modificaciones al sistema pensional</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.5</li>
                      <li>Cotización adicional del 10% para trabajadores de alto riesgo</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Registro de trabajadores de alto riesgo, soporte de pago de cotización especial AFP, clasificación de actividades de alto riesgo
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-alto-riesgo"
                      onClick={() => setLocation(`/afiliaciones-ssss?tab=alto-riesgo&from=evaluation&evaluationId=${id}`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ir a Trabajadores de Alto Riesgo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.1.6 */}
          {selectedEstandar?.numeroEstandar === "1.1.6" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.6
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Conformar y garantizar el funcionamiento del Comité Paritario de Seguridad y Salud en el Trabajo (COPASST). Para empresas con menos de 10 trabajadores, se debe designar un Vigía de SST. Verificar actas de conformación, reuniones mensuales y cumplimiento de funciones.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.12</strong> - COPASST y Vigía de SST</li>
                      <li><strong>Resolución 2013/1986</strong> - Organización y funcionamiento COPASST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.6</li>
                      <li>Reuniones mensuales obligatorias del comité</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Acta de conformación del COPASST/Vigía, actas de reuniones mensuales, registro de integrantes y suplentes
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-copasst"
                      asChild
                    >
                      <Link href={`/copasst-gestion?from=evaluation&evaluationId=${id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Ir a Gestión COPASST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.1.7 */}
          {selectedEstandar?.numeroEstandar === "1.1.7" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.7
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Capacitar a los integrantes del COPASST o Vigía de SST en los aspectos relativos a la Seguridad y Salud en el Trabajo. La capacitación debe incluir temas sobre funciones, responsabilidades, metodología de investigación de accidentes y normatividad aplicable.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.11</strong> - Capacitación en SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.1.7</li>
                      <li>Formación en funciones y responsabilidades del COPASST</li>
                      <li>Metodología de investigación de accidentes de trabajo</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Registros de asistencia a capacitaciones, certificados de formación, contenido de las capacitaciones impartidas
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
                      data-testid="button-ir-cms-capacitaciones"
                      asChild
                    >
                      <Link href={`/copasst-cms?from=evaluation&evaluationId=${id}`}>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Gestionar Cursos (Admin)
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50"
                      data-testid="button-ir-gamificacion"
                      asChild
                    >
                      <Link href={`/capacitacion-copasst?from=evaluation&evaluationId=${id}`}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Capacitación Gamificada
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.1.8 - Comité de Convivencia Laboral */}
          {selectedEstandar?.numeroEstandar === "1.1.8" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.1.8
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el documento de conformación del Comité de Convivencia Laboral y verificar que esté integrado de acuerdo a la normativa y que se encuentra vigente. Solicitar las actas de las reuniones (como mínimo una reunión cada tres (3) meses) y los Informes de Gestión del Comité de Convivencia Laboral, verificando el desarrollo de sus funciones.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 3461 de 2025</strong> - Nueva normativa integral (deroga Res. 652 y 1356 de 2012)</li>
                      <li><strong>Ley 1010 de 2006</strong> - Prevención y sanción del acoso laboral</li>
                      <li><strong>Ley 2209 de 2022</strong> - Caducidad de 3 años para acciones por acoso laboral</li>
                      <li><strong>Convenio 190 OIT</strong> - Trabajo libre de violencia y acoso</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Acta de conformación del Comité, actas de reuniones trimestrales, informes de gestión, constancias de capacitación de integrantes
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-comite-convivencia"
                      asChild
                    >
                      <Link href={`/comite-convivencia-actas?from=evaluation&evaluationId=${id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Gestión Comité Convivencia
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.2.1 - Programa de Capacitación Anual */}
          {selectedEstandar?.numeroEstandar === "1.2.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.2.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el programa de capacitación anual y la matriz de identificación de peligros y verificar que el mismo esté dirigido a los peligros ya identificados y esté acorde con la evaluación y control de los riesgos y/o necesidades en Seguridad y Salud en el Trabajo. Solicitar los documentos que evidencien el cumplimiento del programa de capacitación.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.11</strong> - Capacitación en SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándares mínimos del SG-SST</li>
                      <li>El programa debe estar alineado con la matriz de peligros (IPERC)</li>
                      <li>Incluir inducción, reinducción y capacitación continua</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Programa de capacitación anual documentado, registros de asistencia a capacitaciones, evaluaciones de eficacia, certificados de capacitación
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-programa-capacitacion"
                      asChild
                    >
                      <Link href={`/programa-capacitacion-anual?from=evaluation&evaluationId=${id}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Programa de Capacitación Anual
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-iperc"
                      asChild
                    >
                      <Link href={`/iperc?from=evaluation&evaluationId=${id}`}>
                        <Target className="h-4 w-4 mr-2" />
                        Matriz IPERC (Peligros)
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-capacitaciones"
                      asChild
                    >
                      <Link href={`/capacitaciones?from=evaluation&evaluationId=${id}`}>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Registros de Capacitaciones
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.2.2 - Inducción y Reinducción en SST */}
          {selectedEstandar?.numeroEstandar === "1.2.2" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.2.2
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar la lista de trabajadores, participantes independientemente de su forma de vinculación y/o contratación, y verificar los soportes documentales que den cuenta de la inducción y reinducción de conformidad con el criterio. La referencia es el programa de capacitación y su cumplimiento.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.11</strong> - Capacitación en SST, Parágrafo 2</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.2.2</li>
                      <li>Inducción previa al inicio de labores para todo trabajador nuevo</li>
                      <li>Reinducción mínimo anual (puede ser más frecuente)</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                      Criterio de muestreo para verificación:
                    </p>
                    <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>Empresas de <strong>51 a 200 trabajadores</strong>: verificar el <strong>10%</strong> de soportes</li>
                      <li>Empresas de <strong>201+ trabajadores</strong>: verificar soportes de <strong>30 trabajadores</strong></li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Formatos de inducción/reinducción firmados, listados de asistencia, evaluaciones de comprensión, certificados de inducción
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-registros-induccion"
                      asChild
                    >
                      <Link href={`/registros-induccion?from=evaluation&evaluationId=${id}`}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Registros de Inducción
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 1.2.3 - Curso de 50 Horas SST del Responsable */}
          {selectedEstandar?.numeroEstandar === "1.2.3" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 1.2.3
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el certificado de aprobación del curso de capacitación virtual de cincuenta (50) horas en SST definido por el Ministerio del Trabajo, expedido a nombre del responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 4927/2016</strong> - Curso virtual de 50 horas en SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 1.2.3</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.35</strong> - Capacitación obligatoria para responsables del SG-SST</li>
                      <li>El certificado debe ser expedido por entidad autorizada por el Ministerio del Trabajo</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                      Requisitos del certificado:
                    </p>
                    <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>Expedido a nombre del <strong>responsable del SG-SST</strong> designado</li>
                      <li>Emitido por plataforma virtual autorizada por el <strong>Ministerio del Trabajo</strong></li>
                      <li>Debe indicar aprobación del curso de <strong>50 horas</strong></li>
                      <li>Vigencia: El certificado no tiene fecha de vencimiento</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                    Evidencia esperada: Certificado de aprobación del curso virtual de 50 horas en SST, acta de designación del responsable del SG-SST
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-responsable-sst"
                      asChild
                    >
                      <Link href={`/designacion-responsable?from=evaluation&evaluationId=${id}`}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Responsable del SG-SST
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-documentos-123"
                      asChild
                    >
                      <Link href={`/curso-50-horas?from=evaluation&evaluationId=${id}`}>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Curso 50 Horas SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.1.1 - Política del SG-SST */}
          {selectedEstandar?.numeroEstandar === "2.1.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.1.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar la política del Sistema de Gestión de SST de la empresa y confirmar que cumpla con los aspectos contenidos en el criterio. Validar para la revisión anual de la política como mínimo: fecha de emisión, firmada por el representante legal actual, que estén incluidos los requisitos normativos actuales. Entrevistar a los miembros del COPASST para indagar el conocimiento de la política.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.5</strong> - Política de SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.1.1</li>
                      <li>Debe ser específica, apropiada y documentada</li>
                      <li>Incluir compromisos de prevención, protección y cumplimiento legal</li>
                      <li>Comunicada a todos los trabajadores y partes interesadas</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                      Elementos obligatorios de la política:
                    </p>
                    <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>Nombre de la empresa y actividad económica</li>
                      <li>Fecha de emisión y última revisión</li>
                      <li>Firma del representante legal</li>
                      <li>Objetivos y alcance del SG-SST</li>
                      <li>Compromiso con la normatividad vigente</li>
                      <li>Revisión anual como mínimo</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Política de SST firmada por el representante legal, con fecha de emisión y revisión anual documentada
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      data-testid="button-ir-politicas-sst"
                      asChild
                    >
                      <Link href={`/politicas-sst?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ir a Políticas de SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.2.1 - Objetivos del SG-SST */}
          {selectedEstandar?.numeroEstandar === "2.2.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.2.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Revisar si los objetivos se encuentran definidos, cumplen con las condiciones mencionadas en el criterio y si existen evidencias del proceso de difusión. Verificar que sean claros, medibles, cuantificables y con metas definidas para su cumplimiento.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.18</strong> - Objetivos del SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.2.1</li>
                      <li>Los objetivos deben ser claros, medibles, cuantificables</li>
                      <li>Coherentes con el plan de trabajo anual</li>
                      <li>Compatibles con la normatividad vigente</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                      Características de los objetivos SST:
                    </p>
                    <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>Específicos: claros y concretos</li>
                      <li>Medibles: con indicadores cuantificables</li>
                      <li>Alcanzables: realistas y factibles</li>
                      <li>Relevantes: alineados con la política SST</li>
                      <li>Temporales: con plazos definidos</li>
                      <li>Comunicados a todos los trabajadores</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Documento con objetivos SST definidos, indicadores de cumplimiento, metas establecidas y evidencia de comunicación al personal
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      data-testid="button-ir-objetivos-sst"
                      asChild
                    >
                      <Link href={`/objetivos-sst?from=evaluation&evaluationId=${id}`}>
                        <Target className="h-4 w-4 mr-2" />
                        Ir a Objetivos SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manejo especial para Estándar 2.3.1 - Evaluación Inicial del SG-SST */}
          {selectedEstandar?.numeroEstandar === "2.3.1" && (
            <div className={`border rounded-lg p-4 ${isFirstEvaluation 
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" 
              : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"}`}>
              <div className="flex items-start gap-3">
                <ClipboardList className={`h-5 w-5 mt-0.5 ${isFirstEvaluation 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-blue-600 dark:text-blue-400"}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isFirstEvaluation 
                    ? "text-amber-800 dark:text-amber-200" 
                    : "text-blue-800 dark:text-blue-200"}`}>
                    {isFirstEvaluation 
                      ? "Evaluación Inicial (Línea Base)" 
                      : "Modo Verificación - Estándar 2.3.1"}
                  </p>
                  
                  {isFirstEvaluation ? (
                    <>
                      <div className="mt-2 p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Esta es la primera evaluación del SG-SST para esta empresa
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          El estándar 2.3.1 solicita verificar la evaluación inicial del SG-SST. Como esta ES la evaluación inicial (línea base), 
                          tiene dos opciones:
                        </p>
                        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside mt-2">
                          <li><strong>Opción A:</strong> Marcar como "Cumple" - Esta evaluación ES la evidencia de la evaluación inicial</li>
                          <li><strong>Opción B:</strong> Marcar como "No Aplica" - No puede verificarse algo que se está generando ahora</li>
                        </ul>
                      </div>
                      <div className="mt-3 p-3 bg-green-100/50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">
                          Recomendación:
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Marque como <strong>"Cumple"</strong> y en observaciones escriba: "Esta evaluación corresponde a la evaluación inicial 
                          (línea base) del SG-SST. Los documentos generados durante este proceso servirán como evidencia para futuras verificaciones."
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Solicitar la evaluación inicial del Sistema de Gestión de SST mediante la matriz legal, matriz de peligros y 
                        evaluación de riesgos, verificación de controles, lista de asistencia a capacitaciones, análisis de puestos de trabajo, 
                        exámenes médicos de ingreso y periódicos y seguimiento de indicadores.
                      </p>
                      <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                          Evidencias a verificar:
                        </p>
                        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                          <li>Evaluación inicial documentada del SG-SST</li>
                          <li>Matriz legal actualizada</li>
                          <li>Matriz de peligros (IPERC)</li>
                          <li>Listas de asistencia a capacitaciones</li>
                          <li>Análisis de puestos de trabajo</li>
                          <li>Exámenes médicos ocupacionales</li>
                          <li>Seguimiento de indicadores SST</li>
                        </ul>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    {isFirstEvaluation 
                      ? "Nota: En evaluaciones futuras, deberá presentar esta evaluación inicial como evidencia."
                      : "Evidencia esperada: Documento de evaluación inicial del SG-SST con fecha, firma del responsable y los soportes mencionados."}
                  </p>

                  {/* Botón de Verificación Inteligente del Sistema */}
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                    <Button
                      type="button"
                      variant="default"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        window.open(`/api/evaluaciones-sst/${id}/informe-verificacion-sistema`, '_blank');
                      }}
                      data-testid="button-generar-informe-verificacion"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Generar Informe de Verificación del Sistema
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Genera un informe PDF profesional analizando todos los módulos del sistema
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modo Verificación para Estándar 2.4.1 - Plan de Trabajo Anual */}
          {selectedEstandar?.numeroEstandar === "2.4.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.4.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el plan de trabajo anual. Verificar el cumplimiento del mismo. 
                    En el caso de que se hayan presentado incumplimientos al plan, solicitar los planes de mejora respectivos.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Evidencias a verificar:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li>Plan de trabajo anual del SG-SST documentado</li>
                      <li>Seguimiento del cumplimiento de actividades</li>
                      <li>Planes de mejora para incumplimientos identificados</li>
                      <li>Cronograma de actividades con porcentaje de avance</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Plan de trabajo anual firmado por el responsable del SG-SST y representante legal, con cronograma de actividades y seguimiento de cumplimiento
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      data-testid="button-ir-planes-trabajo-anual"
                      asChild
                    >
                      <Link href={`/planes-trabajo-anual?from=evaluation&evaluationId=${id}`}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Ir a Planes de Trabajo Anual
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enlace al módulo relacionado para el Estándar 2.5.1 */}
          {selectedEstandar?.numeroEstandar === "2.5.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.5.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Constatar la existencia de un sistema de archivo y retención documental, para los registros y documentos que soportan el Sistema de Gestión de SST. Verificar mediante muestreo que los registros y documentos sean legibles (entendible para el lector objeto), fácilmente identificables y accesibles (para todos los que estén vinculados con cada documento en particular), protegidos contra daño y pérdida.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Legibilidad:</strong> Los documentos deben ser entendibles para el lector objeto</li>
                      <li><strong>Identificación:</strong> Los documentos deben ser fácilmente identificables</li>
                      <li><strong>Accesibilidad:</strong> Accesibles para todos los vinculados con cada documento</li>
                      <li><strong>Protección:</strong> Protegidos contra daño y pérdida</li>
                      <li><strong>Retención:</strong> Sistema de archivo y retención documental definido</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.12</strong> - Documentación del SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.5.1</li>
                      <li>Tiempo de retención mínimo de 20 años según normativa SST</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Listado maestro de documentos, procedimiento de control de documentos, tabla de retención documental, evidencia de respaldo de información digital
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      data-testid="button-ir-conservacion-documentos"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ir a Gestión Documental
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enlace al módulo relacionado para el Estándar 2.6.1 */}
          {selectedEstandar?.numeroEstandar === "2.6.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.6.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar los registros documentales que evidencien la rendición de cuentas anual, al interior de la empresa. Solicitar a la empresa los mecanismos de rendición de cuentas que haya definido y verificar que se haga y se cumplan con los criterios del requisito. La rendición de cuentas debe incluir todos los niveles de la empresa ya que en cada uno de ellos hay responsabilidades sobre la Seguridad y Salud en el Trabajo.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Periodicidad:</strong> La rendición de cuentas debe ser anual</li>
                      <li><strong>Alcance:</strong> Debe incluir todos los niveles de la empresa</li>
                      <li><strong>Responsabilidades:</strong> Verificar que cada nivel cumpla sus responsabilidades SST</li>
                      <li><strong>Mecanismos:</strong> Verificar los mecanismos definidos por la empresa</li>
                      <li><strong>Documentación:</strong> Evidencia documental de la rendición de cuentas</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8 numeral 3</strong> - Rendición de cuentas al interior de la empresa</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.6.1</li>
                      <li>Rendición anual documentada con participación de todos los niveles</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Actas de rendición de cuentas, informes de gestión SST por área, registros de participación de todos los niveles, indicadores de cumplimiento de responsabilidades
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-documentos-rendicion"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Actas de Rendición
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-informes"
                      asChild
                    >
                      <Link href={`/informes?from=evaluation&evaluationId=${id}`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Informes y Métricas
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.7.1 - Matriz Legal */}
          {selectedEstandar?.numeroEstandar === "2.7.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.7.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar la matriz legal. Verificar que contenga: Normas vigentes en riesgos laborales, aplicables a la empresa. Normas técnicas de cumplimiento de acuerdo con los peligros / riesgos identificados en la empresa. Normas vigentes de diferentes entidades que le apliquen, relacionadas con riesgos laborales.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Normas vigentes en riesgos laborales:</strong> Verificar inclusión de normatividad actual aplicable a la empresa</li>
                      <li><strong>Normas técnicas:</strong> Verificar cumplimiento según peligros/riesgos identificados en la matriz IPERC</li>
                      <li><strong>Entidades reguladoras:</strong> Verificar inclusión de normas de MinTrabajo, MinSalud, ARL y otras entidades aplicables</li>
                      <li><strong>Actualización:</strong> Verificar que la matriz esté actualizada con la normatividad vigente</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8 numeral 5</strong> - Cumplimiento de requisitos legales aplicables</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.7.1</li>
                      <li>Identificación de requisitos legales y de otra índole en materia de SST</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Matriz legal actualizada, listado de normas aplicables por área/proceso, evidencias de cumplimiento normativo, actas de actualización de la matriz
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-matriz-legal"
                      asChild
                    >
                      <Link href={`/matriz-legal?from=evaluation&evaluationId=${id}`}>
                        <Scale className="h-4 w-4 mr-2" />
                        Ver Matriz Legal
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-iperc-desde-2.7.1"
                      asChild
                    >
                      <Link href={`/iperc?from=evaluation&evaluationId=${id}`}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Ver Matriz IPERC
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.8.1 - Mecanismos de Comunicación */}
          {selectedEstandar?.numeroEstandar === "2.8.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.8.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Constatar la existencia de mecanismos eficaces de comunicación interna y externa que tiene la empresa en materia de Seguridad y Salud en el Trabajo.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Comunicación interna:</strong> Verificar canales para informar a trabajadores sobre SST (carteleras, reuniones, correos, intranet)</li>
                      <li><strong>Comunicación externa:</strong> Verificar mecanismos para comunicar con contratistas, proveedores, visitantes y autoridades</li>
                      <li><strong>Eficacia:</strong> Verificar que los mecanismos sean efectivos y lleguen a todos los destinatarios</li>
                      <li><strong>Documentación:</strong> Verificar registros de las comunicaciones realizadas</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.14</strong> - Comunicación en el SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.8.1</li>
                      <li>Comunicación efectiva con trabajadores, contratistas y partes interesadas</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Procedimiento de comunicación SST, registros de comunicaciones internas/externas, actas de reuniones, carteleras informativas, correos enviados
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-comunicacion-sst"
                      asChild
                    >
                      <Link href={`/comunicacion-sst?from=evaluation&evaluationId=${id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver Comunicación SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.9.1 - Adquisiciones de Productos */}
          {selectedEstandar?.numeroEstandar === "2.9.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.9.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Verificar la existencia de un procedimiento para la identificación y evaluación de las especificaciones en SST de las compras o adquisición de productos y servicios, y constatar su cumplimiento.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación (Productos y Bienes):
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Procedimiento de compras:</strong> Verificar existencia de procedimiento documentado para adquisición de productos con criterios SST</li>
                      <li><strong>EPP y dotación:</strong> Verificar especificaciones técnicas de seguridad para elementos de protección personal (cascos, guantes, botas, etc.)</li>
                      <li><strong>Equipos y maquinaria:</strong> Verificar criterios de seguridad en compra de equipos, herramientas y maquinaria (protecciones, certificaciones)</li>
                      <li><strong>Mobiliario ergonómico:</strong> Verificar especificaciones ergonómicas en compra de escritorios, sillas, estaciones de trabajo</li>
                      <li><strong>Sustancias químicas:</strong> Verificar solicitud de Hojas de Seguridad (MSDS/FDS) y fichas técnicas antes de la compra</li>
                      <li><strong>Materiales y suministros:</strong> Verificar que materiales de construcción, mantenimiento y operación cumplan normas de seguridad</li>
                      <li><strong>Equipos de emergencia:</strong> Verificar especificaciones de extintores, botiquines, camillas y señalización</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                      Ejemplos de productos a verificar:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <div>
                        <p className="font-medium">Oficina y equipos:</p>
                        <ul className="list-disc list-inside ml-2">
                          <li>Computadores, monitores</li>
                          <li>Escritorios, sillas ergonómicas</li>
                          <li>Iluminación, ventilación</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Seguridad industrial:</p>
                        <ul className="list-disc list-inside ml-2">
                          <li>EPP (cascos, guantes, gafas)</li>
                          <li>Herramientas manuales/eléctricas</li>
                          <li>Extintores, señalización</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.27</strong> - Adquisiciones en el SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.9.1</li>
                      <li><strong>Resolución 2400/1979</strong> - Disposiciones sobre vivienda, higiene y seguridad</li>
                      <li><strong>NTC-ISO 45001:2018</strong> - Requisitos de adquisiciones (numeral 8.1.4)</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Procedimiento de compras con criterios SST, órdenes de compra con especificaciones de seguridad, fichas técnicas de productos, hojas de seguridad MSDS, certificados de calidad de EPP, registros de verificación de cumplimiento en recepción
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-green-100/50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <HardHat className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                              Módulo de EPP (Entregas)
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Registro de entregas de EPP a trabajadores con fichas técnicas
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/entrega-epp?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-epp-291">
                          Ir a EPP
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                              Adquisiciones SST
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Solicitudes, evaluaciones e inventario de items adquiridos
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/adquisiciones-sst?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-adquisiciones-291">
                          Ir a Adquisiciones
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                              Recursos Financieros (1.1.3)
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Presupuesto asignado para adquisiciones SST
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/asignacion-recursos?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-recursos-291">
                          Ir a Recursos
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
                      data-testid="button-ir-documentos-2-9-1"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Documentos SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.10.1 - Contratación (Proveedores) */}
          {selectedEstandar?.numeroEstandar === "2.10.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.10.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el documento que señale los criterios relacionados con SST para la evaluación y selección de proveedores, cuando la empresa los haya establecido.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Documento de criterios:</strong> Verificar existencia de documento con criterios SST para evaluación y selección de proveedores y contratistas</li>
                      <li><strong>Afiliación seguridad social:</strong> Verificar que se exija afiliación a EPS, ARL y AFP de contratistas</li>
                      <li><strong>Capacitación SST:</strong> Verificar que se solicite evidencia de capacitación en SST a contratistas</li>
                      <li><strong>Certificaciones específicas:</strong> Verificar requisitos de certificaciones (trabajo en alturas, espacios confinados, etc.)</li>
                      <li><strong>Evaluación periódica:</strong> Verificar que exista reevaluación de proveedores con criterios SST</li>
                      <li><strong>Registros de evaluación:</strong> Constatar registros documentales de las evaluaciones realizadas</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.28</strong> - Contratación en el SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.10.1</li>
                      <li><strong>Resolución 4272/2021</strong> - Requisitos para trabajo en alturas (cuando aplique)</li>
                      <li>Verificación de criterios SST en selección de proveedores y contratistas</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Procedimiento de contratación con criterios SST, matriz de evaluación de proveedores/contratistas, registros de verificación de afiliaciones, copias de certificaciones, actas de evaluación, seguimientos realizados
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-evaluacion-proveedores-2-10-1"
                      asChild
                    >
                      <Link href={`/evaluacion-proveedores?from=evaluation&evaluationId=${id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Ver Evaluación de Proveedores
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
                      data-testid="button-ir-documentos-2-10-1"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Documentos SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 2.11.1 - Gestión del Cambio */}
          {selectedEstandar?.numeroEstandar === "2.11.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <RefreshCcw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 2.11.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Solicitar el documento que contenga el procedimiento.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Procedimiento documentado:</strong> Verificar existencia de procedimiento escrito para gestión del cambio</li>
                      <li><strong>Identificación de cambios:</strong> Constatar que el procedimiento describe cómo identificar cambios internos y externos</li>
                      <li><strong>Evaluación de impacto:</strong> Verificar que se evalúe el impacto de los cambios antes de implementarlos</li>
                      <li><strong>Control de riesgos:</strong> Verificar que se identifiquen y controlen peligros derivados de los cambios</li>
                      <li><strong>Comunicación:</strong> Constatar que los cambios se comuniquen a los trabajadores afectados</li>
                      <li><strong>Registros:</strong> Verificar existencia de registros de los cambios realizados y sus evaluaciones</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.26</strong> - Gestión del cambio en el SG-SST</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 2.11.1</li>
                      <li><strong>ISO 45001:2018</strong> - Requisitos de gestión de cambios</li>
                      <li>Evaluación del impacto de cambios en procesos, equipos, instalaciones y personal</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Procedimiento de gestión del cambio, formato de evaluación de impacto, registros de cambios realizados, actas de comunicación a trabajadores, seguimiento de implementación de controles
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-gestion-cambios-2-11-1"
                      asChild
                    >
                      <Link href={`/gestion-cambios?from=evaluation&evaluationId=${id}`}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Ver Gestión de Cambios
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
                      data-testid="button-ir-documentos-2-11-1"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Documentos SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enlace al módulo relacionado para el Estándar 3.1.1 - Perfil Sociodemográfico y Condiciones de Salud */}
          {selectedEstandar?.numeroEstandar === "3.1.1" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HeartPulse className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 3.1.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Realizar las evaluaciones médicas ocupacionales de acuerdo con la normatividad y los peligros/riesgos a los cuales se encuentre expuesto el trabajador.
                  </p>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>Perfil sociodemográfico:</strong> Verificar que existe descripción sociodemográfica actualizada de los trabajadores</li>
                      <li><strong>Diagnóstico de condiciones de salud:</strong> Constatar que existe diagnóstico de las condiciones de salud de los trabajadores</li>
                      <li><strong>Evaluaciones médicas ocupacionales:</strong> Verificar que se realizan evaluaciones médicas de ingreso, periódicas y de retiro</li>
                      <li><strong>Custodia de historias clínicas:</strong> Verificar que las historias clínicas están bajo custodia del médico o IPS</li>
                      <li><strong>Análisis estadístico:</strong> Verificar análisis de morbilidad y seguimiento a condiciones de salud</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 2346/2007</strong> - Evaluaciones médicas ocupacionales</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.1</li>
                      <li>Perfil sociodemográfico y diagnóstico de condiciones de salud de los trabajadores</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Perfil sociodemográfico actualizado, diagnóstico de condiciones de salud, certificados de aptitud médica, programas de vigilancia epidemiológica
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-perfil-sociodemografico-3-1-1"
                      asChild
                    >
                      <Link href={`/perfil-sociodemografico?from=evaluation&evaluationId=${id}`}>
                        <HeartPulse className="h-4 w-4 mr-2" />
                        Ir a Perfil Sociodemográfico
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50"
                      data-testid="button-ir-examenes-medicos-3-1-1"
                      asChild
                    >
                      <Link href={`/examenes-medicos?from=evaluation&evaluationId=${id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Ver Exámenes Médicos
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
                      data-testid="button-ir-documentos-3-1-1"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Documentos SST
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.2" && (
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <HeartPulse className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Modo Verificación - Estándar 3.1.2
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Actividades de promoción y prevención en salud con base en el perfil epidemiológico de la población trabajadora.
                  </p>
                  <div className="mt-3 p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1 list-disc list-inside">
                      <li><strong>Programa de actividades:</strong> Verificar que existe programa de actividades de promoción y prevención</li>
                      <li><strong>Perfil epidemiológico:</strong> Verificar que las actividades responden al perfil epidemiológico</li>
                      <li><strong>Riesgos prioritarios:</strong> Constatar que se abordan los peligros y riesgos identificados</li>
                      <li><strong>Cobertura:</strong> Verificar que las actividades cubren a la población trabajadora expuesta</li>
                      <li><strong>Evidencias:</strong> Verificar registros de asistencia y evaluación de actividades</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.2</li>
                      <li><strong>Resolución 2346/2007</strong> - Evaluaciones médicas ocupacionales</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Cronograma de actividades, registros de asistencia, evaluaciones de impacto, vinculación con programas SVE
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
                      data-testid="button-ir-actividades-promocion-3-1-2"
                      asChild
                    >
                      <Link href={`/actividades-promocion-prevencion?from=evaluation&evaluationId=${id}`}>
                        <HeartPulse className="h-4 w-4 mr-2" />
                        Ir a Actividades de Promoción
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      data-testid="button-ir-perfil-sociodemografico-3-1-2"
                      asChild
                    >
                      <Link href={`/perfil-sociodemografico?from=evaluation&evaluationId=${id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Ver Perfil Sociodemográfico
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.3" && (
            <div className="mb-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                    Modo Verificación - Estándar 3.1.3
                  </p>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">
                    Verificar que se le remitieron al médico que realiza las evaluaciones ocupacionales, los soportes documentales respecto de los perfiles de cargos, descripción de las tareas y el medio en el cual desarrollarán la labor los trabajadores.
                  </p>
                  <div className="mt-3 p-3 bg-cyan-100/50 dark:bg-cyan-900/30 rounded-md border border-cyan-200 dark:border-cyan-800">
                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-cyan-600 dark:text-cyan-400 space-y-1 list-disc list-inside">
                      <li><strong>Perfil de cargo:</strong> Verificar que existe el perfil de cargo con descripción detallada de tareas</li>
                      <li><strong>Factores de riesgo:</strong> Verificar que se documentan los factores de riesgo asociados al cargo</li>
                      <li><strong>Envío al médico:</strong> Verificar que hay evidencia de envío de documentación al médico evaluador</li>
                      <li><strong>Medio ambiente laboral:</strong> Verificar que el médico recibió información sobre el medio ambiente laboral</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 2346/2007</strong> - Evaluaciones médicas ocupacionales</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.3</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Perfiles de cargo documentados, matriz de peligros y riesgos por cargo, acuse de recibo del médico ocupacional, comunicaciones con la IPS que realiza exámenes ocupacionales
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
                      data-testid="button-ir-perfiles-cargo-3-1-3"
                      asChild
                    >
                      <Link href={`/perfiles-cargo?from=evaluation&evaluationId=${id}`}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Ir a Perfiles de Cargo
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50"
                      data-testid="button-ir-examenes-medicos-3-1-3"
                      asChild
                    >
                      <Link href={`/examenes-medicos?from=evaluation&evaluationId=${id}`}>
                        <HeartPulse className="h-4 w-4 mr-2" />
                        Ver Exámenes Médicos
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.4" && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <div className="flex items-start gap-3">
                <FileCheck className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
                    Modo Verificación - Estándar 3.1.4
                  </p>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    Solicitar los conceptos de aptitud que demuestren la realización de las evaluaciones médicas. Solicitar el documento o registro que evidencie la definición de la frecuencia de las evaluaciones médicas periódicas. Solicitar el documento que evidencie la comunicación por escrito al trabajador de los resultados de las evaluaciones médicas ocupacionales.
                  </p>
                  <div className="mt-3 p-3 bg-rose-100/50 dark:bg-rose-900/30 rounded-md border border-rose-200 dark:border-rose-800">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1 list-disc list-inside">
                      <li><strong>Conceptos de aptitud:</strong> Verificar existencia de conceptos de aptitud médica (apto, apto con restricciones, no apto)</li>
                      <li><strong>Frecuencia de evaluaciones:</strong> Verificar definición de frecuencia de evaluaciones médicas periódicas según riesgo del cargo</li>
                      <li><strong>Comunicación de resultados:</strong> Verificar evidencia de comunicación escrita de resultados al trabajador</li>
                      <li><strong>Firma del médico:</strong> Verificar que los conceptos están firmados por médico con licencia vigente en salud ocupacional</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 2346/2007 Arts. 8 y 9</strong> - Evaluaciones médicas ocupacionales y conceptos de aptitud</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.4</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Conceptos de aptitud firmados por médico con licencia, cronograma de exámenes periódicos, acuses de recibo de comunicación de resultados al trabajador
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-900/50"
                      data-testid="button-ir-examenes-medicos-3-1-4"
                      asChild
                    >
                      <Link href={`/examenes-medicos?from=evaluation&evaluationId=${id}`}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Ir a Exámenes Médicos
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.5" && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <FolderLock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Modo Verificación - Estándar 3.1.5
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    Evidenciar los soportes que demuestren que la custodia de las historias clínicas esté a cargo de una institución prestadora de servicios en SST o del médico que practica las evaluaciones médicas ocupacionales.
                  </p>
                  <div className="mt-3 p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Contrato de custodia:</strong> Verificar contrato o convenio con IPS o médico para custodia de historias clínicas</li>
                      <li><strong>Acta de custodia:</strong> Verificar que existe acta de custodia firmada por el responsable</li>
                      <li><strong>Almacenamiento seguro:</strong> Verificar condiciones de almacenamiento seguro y confidencial</li>
                      <li><strong>Procedimiento de acceso:</strong> Verificar procedimiento documentado para acceso a historias clínicas</li>
                      <li><strong>Tiempos de retención:</strong> Verificar cumplimiento de tiempos de retención según normativa (mínimo 20 años)</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 2346/2007 Art. 14</strong> - Custodia y manejo de historias clínicas ocupacionales</li>
                      <li><strong>Resolución 1995/1999</strong> - Normas para manejo de historia clínica</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.13</strong> - Conservación de documentos</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.5</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Contrato o convenio de custodia con IPS o médico ocupacional, acta de entrega y custodia firmada, certificación de condiciones de almacenamiento, procedimiento de acceso y confidencialidad
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
                      data-testid="button-ir-examenes-medicos-3-1-5"
                      asChild
                    >
                      <Link href={`/examenes-medicos?from=evaluation&evaluationId=${id}`}>
                        <FolderLock className="h-4 w-4 mr-2" />
                        Ir a Exámenes Médicos
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.6" && (
            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <UserCog className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                    Modo Verificación - Estándar 3.1.6
                  </p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                    Solicitar documento de recomendaciones y restricciones médico laborales a trabajadores y constatar las evidencias de que la empresa las ha acatado ha realizado las acciones que se requieran en materia de reubicación o readaptación. Solicitar soporte de recibido por parte de quienes califican en primera oportunidad y/o a las Juntas de Calificación de Invalidez, de los documentos que corresponde remitir al empleador para efectos del proceso de calificación de origen y pérdida de capacidad laboral.
                  </p>
                  <div className="mt-3 p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-md border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 list-disc list-inside">
                      <li><strong>Documentos de recomendaciones:</strong> Verificar existencia de documentos con recomendaciones y restricciones médico laborales</li>
                      <li><strong>Acatamiento de recomendaciones:</strong> Verificar que la empresa ha acatado las recomendaciones médicas</li>
                      <li><strong>Acciones de reubicación:</strong> Verificar evidencia de acciones de reubicación o readaptación cuando aplique</li>
                      <li><strong>Soportes a calificadores:</strong> Verificar soportes de envío a calificadores de primera oportunidad (EPS, ARL)</li>
                      <li><strong>Juntas de Calificación:</strong> Verificar soportes de envío a Juntas de Calificación de Invalidez cuando corresponda</li>
                      <li><strong>Proceso de calificación:</strong> Verificar documentos para proceso de calificación de origen y pérdida de capacidad laboral</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.12</strong> - Documentación del SG-SST</li>
                      <li><strong>Ley 776/2002</strong> - Organización, administración y prestaciones del SGRP</li>
                      <li><strong>Decreto 1507/2014</strong> - Manual único de calificación de invalidez</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.6</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Documentos de recomendaciones médico laborales, actas de reubicación o readaptación, comunicaciones enviadas a EPS/ARL, soportes de radicación ante Juntas de Calificación
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                      data-testid="button-ir-examenes-medicos-3-1-6"
                      asChild
                    >
                      <Link href={`/examenes-medicos?from=evaluation&evaluationId=${id}`}>
                        <HeartPulse className="h-4 w-4 mr-2" />
                        Ir a Exámenes Médicos
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/50"
                      data-testid="button-ir-trabajadores-3-1-6"
                      asChild
                    >
                      <Link href={`/trabajadores?from=evaluation&evaluationId=${id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Ver Trabajadores
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.7" && (
            <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                    Modo Verificación - Estándar 3.1.7
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                    Solicitar el programa respectivo y los documentos y registros que evidencien el cumplimiento del mismo. Verificar la implementación del programa de estilos de vida saludable y las actividades de promoción y prevención en salud.
                  </p>
                  <div className="mt-3 p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1 list-disc list-inside">
                      <li><strong>Programa de estilos de vida saludable:</strong> Verificar existencia del programa de estilos de vida saludable documentado</li>
                      <li><strong>Cronograma de actividades:</strong> Verificar cronograma de actividades del programa con fechas y responsables</li>
                      <li><strong>Registros de asistencia:</strong> Verificar registros de asistencia a actividades de promoción y prevención</li>
                      <li><strong>Indicadores de cumplimiento:</strong> Verificar indicadores de cumplimiento y efectividad del programa</li>
                      <li><strong>Evidencias documentales:</strong> Verificar evidencias fotográficas o documentales de las actividades realizadas</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li><strong>Resolución 1016/1989</strong> - Programas de Salud Ocupacional</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.7</li>
                    </ul>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-3 font-medium">
                    Evidencia esperada: Documento del programa de estilos de vida saludable, cronograma anual de actividades, listados de asistencia, fotos de actividades realizadas, indicadores de gestión del programa
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/50"
                      data-testid="button-ir-evs-3-1-7"
                      asChild
                    >
                      <Link href={`/estilos-vida-saludable?from=evaluation&evaluationId=${id}`}>
                        <Activity className="h-4 w-4 mr-2" />
                        Ir a Estilos de Vida Saludable
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/50"
                      data-testid="button-ir-gestion-documental-317"
                      asChild
                    >
                      <Link href={`/conservacion-documentos?from=evaluation&evaluationId=${id}`}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Ir a Documentos
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-md border border-primary/30">
                    <p className="text-xs text-muted-foreground">
                      Utilice el módulo de <strong>Estilos de Vida Saludable</strong> para gestionar programas, actividades, controles y seguimientos de tabaquismo, alcoholismo, farmacodependencia y hábitos saludables. Para evidencias documentales adicionales, use el módulo de Gestión Documental.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.8" && (
            <div className="mb-4 p-4 bg-lime-50 dark:bg-lime-900/20 rounded-lg border border-lime-200 dark:border-lime-800">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-lime-600 dark:text-lime-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-lime-800 dark:text-lime-200">
                    Modo Verificación - Estándar 3.1.8
                  </p>
                  <p className="text-sm text-lime-600 dark:text-lime-400 mt-1">
                    Verificar mediante observación directa si se cumple lo exigido en el criterio: contar con un suministro permanente de agua potable, servicios sanitarios y mecanismos para disponer excretas y basuras, dejando soporte fílmico o fotográfico al respecto.
                  </p>
                  <div className="mt-3 p-3 bg-lime-100/50 dark:bg-lime-900/30 rounded-md border border-lime-200 dark:border-lime-800">
                    <p className="text-xs font-semibold text-lime-700 dark:text-lime-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-lime-600 dark:text-lime-400 space-y-1 list-disc list-inside">
                      <li><strong>Suministro permanente de agua potable:</strong> Verificar existencia y funcionamiento de fuentes de agua potable</li>
                      <li><strong>Servicios sanitarios:</strong> Verificar existencia, cantidad adecuada y estado de limpieza de baños</li>
                      <li><strong>Disposición de excretas:</strong> Verificar sistemas de disposición de excretas en condiciones sanitarias</li>
                      <li><strong>Disposición de basuras:</strong> Verificar mecanismos para recolección y disposición de residuos sólidos</li>
                      <li><strong>Registro fotográfico:</strong> Dejar evidencia fotográfica de las instalaciones verificadas</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 2400/1979 Art. 17-28</strong> - Servicios de higiene</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.8</li>
                    </ul>
                  </div>
                  <p className="text-xs text-lime-600 dark:text-lime-400 mt-3 font-medium">
                    Evidencia esperada: Fotografías de instalaciones sanitarias, puntos de agua potable, sistema de recolección de basuras, registro de mantenimiento de instalaciones
                  </p>
                  <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-md border border-primary/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold text-primary">
                          Gestión Documental - Evidencia Fotográfica/Fílmica
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setRespuestaDialogOpen(false);
                          setLocation(`/conservacion-documentos?from=evaluation&evaluationId=${id}`);
                        }}
                        data-testid="button-ir-gestion-documental-318"
                      >
                        Ir a Documentos
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Para cumplir con la norma, suba las fotografías de instalaciones sanitarias, puntos de agua potable y sistema de recolección de basuras al módulo de Gestión Documental, clasificándolas bajo el estándar 3.1.8.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.1.9" && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Modo Verificación - Estándar 3.1.9
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Constatar mediante observación directa, las evidencias donde se dé cuenta de los procesos de eliminación de residuos conforme al criterio. Solicitar contrato de empresa que elimina y dispone de los residuos peligrosos cuando se requiera dicha disposición.
                  </p>
                  <div className="mt-3 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-md border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1 list-disc list-inside">
                      <li><strong>Clasificación de residuos:</strong> Verificar sistema de clasificación y separación de residuos (ordinarios, reciclables, peligrosos)</li>
                      <li><strong>Puntos de recolección:</strong> Verificar existencia y señalización de puntos de recolección de residuos</li>
                      <li><strong>Almacenamiento temporal:</strong> Verificar área de almacenamiento temporal de residuos con condiciones adecuadas</li>
                      <li><strong>Residuos peligrosos (RESPEL):</strong> Verificar contrato vigente con empresa autorizada para disposición de residuos peligrosos</li>
                      <li><strong>Registro de disposición:</strong> Verificar manifiestos de disposición final de residuos peligrosos</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 4741/2005</strong> - Gestión integral de residuos peligrosos</li>
                      <li><strong>Resolución 1164/2002</strong> - Manual de gestión integral de residuos hospitalarios</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.1.9</li>
                    </ul>
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-3 font-medium">
                    Evidencia esperada: Fotografías de puntos de recolección, área de almacenamiento de residuos, contrato con empresa gestora de RESPEL, manifiestos de disposición final, registros de capacitación en manejo de residuos
                  </p>
                  <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-md border border-primary/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold text-primary">
                          Gestión Documental - Evidencia RESPEL
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setRespuestaDialogOpen(false);
                          setLocation(`/conservacion-documentos?from=evaluation&evaluationId=${id}`);
                        }}
                        data-testid="button-ir-gestion-documental-319"
                      >
                        Ir a Documentos
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Suba las fotografías de puntos de recolección, contratos RESPEL y manifiestos de disposición al módulo de Gestión Documental, clasificándolas bajo el estándar 3.1.9.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.2.1" && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
                    Modo Verificación - Estándar 3.2.1
                  </p>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    Verificar por medio de un muestreo si se investigan los incidentes, accidentes de trabajo y las enfermedades laborales con la participación del COPASST, y si se definen acciones para otros trabajadores potencialmente expuestos. Constatar que las investigaciones se hayan realizado dentro de los quince (15) días siguientes a su ocurrencia a través del equipo investigador y evidenciar que se hayan remitido los informes de las investigaciones de accidente de trabajo grave o mortal o de enfermedad laboral mortal. En caso de accidente grave o se produzca la muerte, verificar la participación de un profesional con licencia en Seguridad y Salud en el Trabajo en la investigación (propio o contratado), así como del Comité Paritario de SST.
                  </p>
                  
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-md border border-amber-300 dark:border-amber-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        IMPORTANTE - Casos Graves o Mortales:
                      </p>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      En accidentes graves o mortales, se requiere obligatoriamente la participación de un profesional con licencia vigente en SST y del COPASST/Vigía en la investigación.
                    </p>
                  </div>

                  <div className="mt-3 p-3 bg-rose-100/50 dark:bg-rose-900/30 rounded-md border border-rose-200 dark:border-rose-800">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1 list-disc list-inside">
                      <li><strong>Investigación de eventos:</strong> Verificar que se investigan incidentes, accidentes de trabajo y enfermedades laborales</li>
                      <li><strong>Participación del COPASST:</strong> Evidenciar participación del Comité Paritario o Vigía en las investigaciones</li>
                      <li><strong>Plazo de 15 días:</strong> Constatar que las investigaciones se realizan dentro de los 15 días siguientes al evento</li>
                      <li><strong>Acciones correctivas:</strong> Verificar definición de acciones para trabajadores potencialmente expuestos</li>
                      <li><strong>Profesional SST con licencia:</strong> En casos graves/mortales, verificar participación de profesional con licencia vigente</li>
                      <li><strong>Remisión de informes:</strong> Verificar envío de informes al Ministerio de Trabajo en casos graves o mortales</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 1401/2007</strong> - Investigación de incidentes y accidentes de trabajo</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.32</strong> - Investigación de incidentes, accidentes y enfermedades</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.1.6</strong> - Reporte de accidentes graves y mortales</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.2.1</li>
                    </ul>
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-3 font-medium">
                    Evidencia esperada: Formatos de investigación de AT/EL, actas de participación del COPASST, FURAT reportados, informes remitidos al Ministerio, licencia SST del profesional investigador (cuando aplique)
                  </p>
                  <div className="mt-4 flex justify-end gap-2 flex-wrap">
                    <Button
                      variant="default"
                      onClick={() => {
                        setRespuestaDialogOpen(false);
                        setLocation(`/accidentes?from=evaluation&evaluationId=${id}`);
                      }}
                      data-testid="button-ir-registro-accidentes"
                    >
                      Registrar Accidentes
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        setRespuestaDialogOpen(false);
                        setLocation(`/investigacion-accidentes?from=evaluation&evaluationId=${id}`);
                      }}
                      data-testid="button-ir-investigacion-accidentes"
                    >
                      Ir a Investigación de Accidentes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.2.2" && (
            <div className="mb-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                    Modo Verificación - Estándar 3.2.2
                  </p>
                  <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
                    Solicitar el registro estadístico actualizado de lo corrido del año y el año inmediatamente anterior al de la visita, así como la evidencia que contiene el análisis y las conclusiones derivadas del estudio que son usadas para el mejoramiento del Sistema de Gestión de SST.
                  </p>
                  <div className="mt-3 p-3 bg-violet-100/50 dark:bg-violet-900/30 rounded-md border border-violet-200 dark:border-violet-800">
                    <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-violet-600 dark:text-violet-400 space-y-1 list-disc list-inside">
                      <li><strong>Registro estadístico año actual:</strong> Verificar estadísticas de AT, EL e incidentes del año en curso</li>
                      <li><strong>Registro estadístico año anterior:</strong> Solicitar estadísticas del año inmediatamente anterior</li>
                      <li><strong>Indicadores de accidentalidad:</strong> Verificar cálculo de IF, IS, ILI y tasa de accidentalidad</li>
                      <li><strong>Análisis de tendencias:</strong> Evidenciar análisis comparativo entre períodos</li>
                      <li><strong>Conclusiones del estudio:</strong> Verificar conclusiones derivadas del análisis estadístico</li>
                      <li><strong>Acciones de mejora:</strong> Evidenciar que las conclusiones generan acciones para el SG-SST</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.2.2</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.21</strong> - Indicadores del SG-SST</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.22</strong> - Indicadores de estructura, proceso y resultado</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Indicadores típicos a verificar:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li><strong>IF (Índice de Frecuencia):</strong> Número de AT por cada 200.000 HHT</li>
                      <li><strong>IS (Índice de Severidad):</strong> Días perdidos por cada 200.000 HHT</li>
                      <li><strong>ILI (Índice de Lesión Incapacitante):</strong> IF x IS / 1000</li>
                      <li><strong>Tasa de accidentalidad:</strong> Número de AT / Número de trabajadores x 100</li>
                      <li><strong>Tasa de ausentismo:</strong> Días de ausencia / Días trabajados programados x 100</li>
                    </ul>
                  </div>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-3 font-medium">
                    Evidencia esperada: Informes estadísticos de accidentalidad, cálculo de indicadores, análisis de tendencias, actas de revisión con conclusiones y planes de mejora
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="default"
                      onClick={() => {
                        setRespuestaDialogOpen(false);
                        setLocation(`/indicadores-accidentalidad?from=evaluation&evaluationId=${id}`);
                      }}
                      data-testid="button-ir-indicadores-accidentalidad"
                    >
                      Ir a Indicadores de Accidentalidad
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.2.3" && (
            <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-3">
                <UserMinus className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                    Modo Verificación - Estándar 3.2.3
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                    Solicitar el programa y/o las medidas de control de ausentismo laboral implementadas por la empresa, donde se evidencie el registro, seguimiento y análisis de las ausencias por causa médica (AT, EL y enfermedad común).
                  </p>
                  <div className="mt-3 p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
                      Criterios de verificación:
                    </p>
                    <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1 list-disc list-inside">
                      <li><strong>Registro de ausencias:</strong> Verificar que la empresa registra todas las ausencias por causa médica</li>
                      <li><strong>Clasificación por tipo:</strong> AT (accidente de trabajo), EL (enfermedad laboral) y enfermedad común</li>
                      <li><strong>Tasa de ausentismo:</strong> Días perdidos / Días programados × 100</li>
                      <li><strong>Frecuencia de ausencia:</strong> Número de ausencias / Número de trabajadores expuestos</li>
                      <li><strong>Análisis de causas:</strong> Evidenciar análisis de las principales causas de ausentismo</li>
                      <li><strong>Medidas de control:</strong> Verificar implementación de acciones para reducir el ausentismo</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 3.2.3</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.21</strong> - Indicadores del SG-SST</li>
                      <li><strong>Ley 776/2002</strong> - Reconocimiento y pago de incapacidades</li>
                    </ul>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-3 font-medium">
                    Evidencia esperada: Registro de ausencias, estadísticas de ausentismo, análisis de causas, plan de control de ausentismo, informes de seguimiento
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="default"
                      onClick={() => {
                        setRespuestaDialogOpen(false);
                        setLocation(`/ausentismo-laboral?from=evaluation&evaluationId=${id}`);
                      }}
                      data-testid="button-ir-ausentismo-laboral-323"
                    >
                      Ir a Ausentismo Laboral
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.3.1" && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Modo Verificación - Estándar 3.3.1
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Medir la frecuencia y severidad de los accidentes de trabajo como mínimo una vez al año y realizar la clasificación del origen del peligro/riesgo.
                  </p>
                  <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Módulo Índices IF y Severidad
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/indicador-frecuencia-severidad?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-if-severidad-331">
                        Ir a Indicadores
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.3.2" && (
            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                    Modo Verificación - Estándar 3.3.2
                  </p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                    Medir la frecuencia de incidentes, accidentes de trabajo y enfermedad laboral como mínimo una vez al año. Calcular el Índice de Lesión Incapacitante (ILI).
                  </p>
                  <div className="mt-4 p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-md border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          Módulo ILI e Incidentes
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/indicador-ili-incidentes?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-ili-332">
                        Ir a Indicadores
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.3.3" && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Modo Verificación - Estándar 3.3.3
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Medir la mortalidad por accidentes de trabajo y enfermedad laboral como mínimo una vez al año. Tasa de Mortalidad = (Accidentes Mortales / Trabajadores) × 100,000
                  </p>
                  <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                          Módulo Mortalidad AT/EL
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/indicador-mortalidad?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-mortalidad-333">
                        Ir a Indicadores
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.3.4" && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Modo Verificación - Estándar 3.3.4
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Medir la prevalencia de la enfermedad laboral como mínimo una vez al año. Prevalencia = (Casos totales EL / Trabajadores) × 100,000
                  </p>
                  <div className="mt-4 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-md border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                          Módulo Prevalencia EL
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/indicador-prevalencia?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-prevalencia-334">
                        Ir a Indicadores
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.3.5" && (
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Modo Verificación - Estándar 3.3.5
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Medir la incidencia de accidentes de trabajo y enfermedad laboral como mínimo una vez al año. Incidencia = (Casos nuevos / Trabajadores) × 100,000
                  </p>
                  <div className="mt-4 p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                          Módulo Incidencia AT/EL
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/indicador-incidencia?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-incidencia-335">
                        Ir a Indicadores
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "3.3.6" && (
            <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-3">
                <UserMinus className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                    Modo Verificación - Estándar 3.3.6
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                    Medir el ausentismo por incidentes, accidentes de trabajo y enfermedad laboral como mínimo una vez al año.
                  </p>
                  <div className="mt-4 p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <UserMinus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                          Módulo Ausentismo Laboral
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/ausentismo-laboral?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-ausentismo-336">
                        Ir a Ausentismo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "4.1.1" && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Modo Verificación - Estándar 4.1.1
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Solicitar el documento que contiene la metodología. Verificar que se realiza la identificación de peligros, evaluación y valoración de los riesgos conforme a la metodología definida de acuerdo con el criterio y con la participación de los trabajadores, seleccionando de manera aleatoria algunas de las actividades identificadas. Confrontar mediante observación directa durante el recorrido a las instalaciones de la empresa la identificación de peligros.
                  </p>
                  <div className="mt-3 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-md border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.15</strong> - Identificación de peligros, evaluación y valoración de riesgos</li>
                      <li><strong>GTC 45</strong> - Guía para la identificación de peligros y valoración de riesgos</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.1.1</li>
                    </ul>
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-3 font-medium">
                    Evidencia esperada: Matriz IPERC actualizada, documento metodológico (GTC 45 u otra), registros de participación de trabajadores
                  </p>
                  <div className="mt-4 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-md border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                          Módulo IPERC (Matriz de Peligros)
                        </p>
                      </div>
                      <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/iperc?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-iperc-411">
                        Ir a IPERC
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "4.1.2" && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Modo Verificación - Estándar 4.1.2
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    Realizar la identificación de peligros y evaluación y valoración de los riesgos con participación de los trabajadores de todos los niveles de la empresa y actualizarla como mínimo una (1) vez al año y cada vez que ocurra un accidente de trabajo mortal o un evento catastrófico en la empresa o cuando se presenten cambios en los procesos, en las instalaciones, o maquinaria o equipos.
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Solicitar las evidencias que den cuenta de la participación de los trabajadores en la identificación de peligros, evaluación y valoración de los riesgos, así como de la realización de dicha identificación con la periodicidad señalada en el criterio. Solicitar información acerca de si ha habido eventos mortales o catastróficos y validar que el peligro asociado al evento esté identificado, evaluado y valorado. En los casos de que se encuentren valoraciones de riesgo no tolerable, verificar la implementación inmediata de las acciones de intervención y control.
                  </p>
                  <div className="mt-3 p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.15 Parágrafo 1</strong> - Participación de trabajadores en identificación de peligros</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.1.2</li>
                    </ul>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-medium">
                    Evidencia esperada: Registros de participación de trabajadores, actas de reuniones COPASST, listas de asistencia a capacitaciones, actualizaciones anuales de la matriz IPERC
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              Actas COPASST
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Participación documentada en reuniones y recorridos
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/copasst-gestion?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-copasst-412">
                          Ir a COPASST
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              Capacitaciones SST
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Formación en identificación de peligros con asistencia
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/capacitaciones?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-capacitaciones-412">
                          Ir a Capacitaciones
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              Matriz IPERC
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Actualización anual con participación de trabajadores
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/iperc?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-iperc-412">
                          Ir a IPERC
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "4.1.3" && (
            <div className="mb-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="flex items-start gap-3">
                <FlaskConical className="h-5 w-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-pink-800 dark:text-pink-200">
                    Modo Verificación - Estándar 4.1.3
                  </p>
                  <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">
                    Revisar la lista de materias primas e insumos, productos intermedios o finales, subproductos y desechos y verificar si estas son o están compuestas por agentes o sustancias catalogadas como carcinógenas en el grupo 1 de la clasificación de la Agencia Internacional de Investigación sobre el Cáncer (International Agency for Research on Cancer, IARC) y con toxicidad aguda según los criterios del Sistema Globalmente Armonizado (categorías I y II).
                  </p>
                  <p className="text-sm text-pink-600 dark:text-pink-400 mt-2">
                    Se debe verificar que los riesgos asociados a estas sustancias o agentes carcinógenos o con toxicidad aguda son priorizados y se realizan acciones de prevención e intervención. Así mismo se debe verificar la existencia de áreas destinadas para el almacenamiento de las materias primas e insumos y sustancias catalogadas como carcinógenas y con toxicidad aguda.
                  </p>
                  <div className="mt-3 p-3 bg-pink-100/50 dark:bg-pink-900/30 rounded-md border border-pink-200 dark:border-pink-800">
                    <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-pink-600 dark:text-pink-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1496/2018</strong> - Sistema Globalmente Armonizado (SGA) de Clasificación y Etiquetado de Productos Químicos</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.15</strong> - Identificación de peligros y valoración de riesgos</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.1.3</li>
                      <li><strong>IARC</strong> - Clasificación de agentes carcinógenos Grupo 1</li>
                    </ul>
                  </div>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-3 font-medium">
                    Evidencia esperada: Inventario de sustancias químicas con clasificación SGA, Fichas de Datos de Seguridad (FDS), registro de áreas de almacenamiento, controles implementados en matriz IPERC
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-pink-100/50 dark:bg-pink-900/30 rounded-md border border-pink-200 dark:border-pink-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                          <div>
                            <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                              Inventario Sustancias Químicas
                            </p>
                            <p className="text-xs text-pink-600 dark:text-pink-400">
                              Clasificación SGA/GHS, carcinógenas y toxicidad aguda
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/sustancias-quimicas?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-sustancias-413">
                          Ir a Sustancias
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-pink-100/50 dark:bg-pink-900/30 rounded-md border border-pink-200 dark:border-pink-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                          <div>
                            <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                              Matriz IPERC
                            </p>
                            <p className="text-xs text-pink-600 dark:text-pink-400">
                              Riesgos químicos priorizados con controles
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/iperc?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-iperc-413">
                          Ir a IPERC
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "4.1.4" && (
            <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                    Modo Verificación - Estándar 4.1.4
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                    Verificar los soportes documentales de las mediciones ambientales realizadas y la remisión de estos resultados al Comité Paritario de Seguridad y Salud en el Trabajo.
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mt-2">
                    Se debe evidenciar: informes técnicos de mediciones de factores de riesgo higiénicos (ruido, iluminación, material particulado, vapores, gases, temperaturas extremas, vibraciones, etc.), estudios de higiene industrial realizados por personal competente, y constancia de socialización de resultados con el COPASST o Vigía SST.
                  </p>
                  <div className="mt-3 p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.15</strong> - Identificación de peligros y valoración de riesgos</li>
                      <li><strong>Resolución 2400/1979</strong> - Disposiciones sobre higiene y seguridad industrial</li>
                      <li><strong>Resolución 8321/1983</strong> - Protección y conservación de la audición (ruido ocupacional)</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.1.4</li>
                      <li><strong>GTC 45</strong> - Guía para identificación de peligros y valoración de riesgos</li>
                    </ul>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-3 font-medium">
                    Evidencia esperada: Informes de mediciones de higiene industrial (ruido, iluminación, material particulado, vapores, gases, temperaturas), constancia de socialización con COPASST/Vigía SST
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <div>
                            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                              COPASST / Vigía SST
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400">
                              Actas de socialización de resultados de mediciones
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/copasst-gestion?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-copasst-414">
                          Ir a COPASST
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <div>
                            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                              Gestión Documental
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400">
                              Informes de mediciones ambientales e higiene industrial
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/conservacion-documentos?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-documentos-414">
                          Ir a Documentos
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Mediciones Ambientales
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Ruido, iluminación, temperatura, gases y vapores
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/mediciones-ambientales?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-mediciones-414">
                          Ir a Mediciones
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <div>
                            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                              Matriz IPERC
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400">
                              Riesgos higiénicos identificados y priorizados
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/iperc?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-iperc-414">
                          Ir a IPERC
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-cyan-100/50 dark:bg-cyan-900/30 rounded-md border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          <div>
                            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                              Programa de Conservación Auditiva (PCA)
                            </p>
                            <p className="text-xs text-cyan-600 dark:text-cyan-400">
                              Audiometrías, perfiles de exposición a ruido y controles (Res. 8321/1983)
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/conservacion-auditiva?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-pca-414">
                          Ir a PCA
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <strong>Relación con Estándar 1.1.6:</strong> Los resultados de las mediciones deben socializarse con el COPASST/Vigía SST conformado según el estándar 1.1.6.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedEstandar?.numeroEstandar === "4.2.1" && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Modo Verificación - Estándar 4.2.1
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Solicitar evidencias de la ejecución de las medidas de prevención y control, de acuerdo con el esquema de jerarquización y la identificación de los peligros, la evaluación y valoración de los riesgos realizada.
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                    Constatar que estas medidas se encuentran programadas en el plan anual de trabajo. Verificar que efectivamente se dio prioridad a las medidas de prevención y control frente a los peligros/riesgos identificados como prioritarios.
                  </p>
                  <div className="mt-3 p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.1</li>
                      <li>Jerarquía de controles: eliminación, sustitución, controles de ingeniería, controles administrativos, EPP</li>
                      <li>Priorización según matriz IPERC</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Registros de implementación de controles según jerarquía, evidencias de seguimiento a la efectividad de controles, Plan de Trabajo Anual con medidas programadas
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Matriz IPERC
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Controles definidos para peligros/riesgos priorizados
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/iperc?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-iperc-421">
                          Ir a IPERC
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Plan de Trabajo Anual
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Medidas de prevención y control programadas
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/planes-trabajo-anual?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-plan-421">
                          Ir a Plan Anual
                        </Button>
                      </div>
                    </div>
                    {companyChapter !== 1 && (
                      <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                Gestión Documental
                              </p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                Registros de implementación y seguimiento de controles
                              </p>
                            </div>
                          </div>
                          <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/conservacion-documentos?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-documentos-421">
                            Ir a Documentos
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Entrega de EPP
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Registros de entrega de elementos de protección personal
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/entrega-epp?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-epp-421">
                          Ir a EPP
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedEstandar?.numeroEstandar === "4.2.2" && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Modo Verificación - Estándar 4.2.2
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Solicitar los soportes documentales implementados por la empresa donde se verifica el cumplimiento de las responsabilidades de los trabajadores frente a la aplicación de las medidas de prevención y control de los peligros/riesgos (físicos, ergonómicos, biológicos, químicos, de seguridad, públicos, psicosociales, entre otros).
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                    Realizar visita a las instalaciones para verificar el cumplimiento de las medidas de prevención y control por parte de los trabajadores.
                  </p>
                  <div className="mt-3 p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1 list-disc list-inside">
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.10</strong> - Responsabilidades de los trabajadores</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.2</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
                      <li>Verificación de uso correcto de EPP por parte de los trabajadores</li>
                      <li>Cumplimiento de procedimientos de trabajo seguro</li>
                    </ul>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
                    Evidencia esperada: Registros de observación de comportamiento seguro, inspecciones de uso de EPP, actas de llamados de atención por incumplimientos, registros de capacitación en autocuidado, formatos de verificación en campo
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Entrega de EPP
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Registros de entrega y verificación de uso de EPP
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/entrega-epp?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-epp-422">
                          Ir a EPP
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Inspecciones de Seguridad
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Verificación de cumplimiento de medidas por trabajadores
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/inspecciones?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-inspecciones-422">
                          Ir a Inspecciones
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Capacitaciones
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Formación en autocuidado y uso de medidas de control
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/capacitaciones?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-capacitaciones-422">
                          Ir a Capacitaciones
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Matriz IPERC
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Controles asignados a trabajadores por cargo/área
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/iperc?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-iperc-422">
                          Ir a IPERC
                        </Button>
                      </div>
                    </div>
                    {companyChapter !== 1 && (
                      <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                Gestión Documental
                              </p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                Actas de observación, llamados de atención, registros de campo
                              </p>
                            </div>
                          </div>
                          <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/conservacion-documentos?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-documentos-422">
                            Ir a Documentos
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estándar 4.2.3 - Procedimientos, instructivos, fichas técnicas y protocolos SST */}
          {selectedEstandar?.numeroEstandar === "4.2.3" && (
            <div className="mb-4">
              <Estandar423VerificacionProcedimientos 
                isVisible={true}
                evaluationId={id}
              />
            </div>
          )}

          {/* Estándar 4.2.4 - Inspecciones a instalaciones, maquinaria o equipos */}
          {selectedEstandar?.numeroEstandar === "4.2.4" && (
            <div className="mb-4">
              <Estandar424VerificacionInspecciones 
                isVisible={true}
                evaluationId={id}
              />
            </div>
          )}

          {/* Estándar 4.2.5 - Mantenimiento periódico de instalaciones, equipos, máquinas, herramientas */}
          {selectedEstandar?.numeroEstandar === "4.2.5" && (
            <div className="mb-4">
              <Estandar425VerificacionMantenimiento 
                isVisible={true}
                evaluationId={id}
              />
            </div>
          )}

          {/* Estándar 4.2.6 - Entrega de EPP y capacitación en uso adecuado */}
          {selectedEstandar?.numeroEstandar === "4.2.6" && (
            <div className="mb-4">
              <Estandar426VerificacionEPP 
                isVisible={true}
                evaluationId={id}
              />
            </div>
          )}

          {/* Estándar 5.1.1 - Plan de prevención, preparación y respuesta ante emergencias */}
          {selectedEstandar?.numeroEstandar === "5.1.1" && (
            <div className="mb-4">
              <Estandar511VerificacionEmergencias 
                isVisible={true}
                evaluationId={id}
              />
            </div>
          )}
          
          {selectedEstandar?.numeroEstandar === "7.1.4" && (
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Modo Verificación - Estándar 7.1.4
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Verificar la implementación de acciones de mejora derivadas del análisis de contexto de la organización (análisis FODA), con evidencias de seguimiento y cierre efectivo.
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    Confirmar que las debilidades y amenazas identificadas en el contexto organizacional han sido abordadas mediante planes de acción específicos con responsables, fechas y verificación de cumplimiento.
                  </p>
                  <div className="mt-3 p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Normativa aplicable:
                    </p>
                    <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1 list-disc list-inside">
                      <li><strong>ISO 45001:2018 Cláusula 4.1</strong> - Comprensión de la organización y su contexto</li>
                      <li><strong>ISO 45001:2018 Cláusula 10.3</strong> - Mejora continua</li>
                      <li><strong>Decreto 1072/2015 Art. 2.2.4.6.31</strong> - Acciones preventivas y correctivas</li>
                      <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 7.1.4</li>
                    </ul>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium">
                    Evidencia esperada: Plan de mejoramiento con acciones derivadas del análisis FODA, registros de seguimiento, evidencias de cierre de acciones
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Fuentes de evidencia con trazabilidad:
                    </p>
                    <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                              Análisis de Contexto (FODA)
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Identificación de factores internos y externos del SG-SST
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/analisis-contexto?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-contexto-714">
                          Ir a Análisis
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                              Plan de Mejoramiento del Contexto
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Acciones de mejora vinculadas a debilidades y amenazas FODA
                            </p>
                          </div>
                        </div>
                        <Button variant="default" size="sm" onClick={() => { setRespuestaDialogOpen(false); setLocation(`/plan-mejoramiento-contexto?from=evaluation&evaluationId=${id}`); }} data-testid="button-ir-plan-mejora-714">
                          Ir a Plan Mejora
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Form {...respuestaForm}>
            <form onSubmit={respuestaForm.handleSubmit(onSubmitRespuesta)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={respuestaForm.control}
                  name="cumple"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => {
                          const cumple = parseInt(value);
                          field.onChange(cumple);
                          if (cumple === 1) {
                            respuestaForm.setValue('noAplica', 0);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-cumple">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Cumple</SelectItem>
                          <SelectItem value="0">No cumple</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={respuestaForm.control}
                  name="noAplica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿No Aplica?</FormLabel>
                      <Select
                        value={(field.value ?? 0).toString()}
                        onValueChange={(value) => {
                          const noAplica = parseInt(value);
                          field.onChange(noAplica);
                          if (noAplica === 1) {
                            respuestaForm.setValue('cumple', 0);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-no-aplica">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Puntaje Máximo</FormLabel>
                  <Input
                    value={selectedEstandar ? getPuntajeMaximoEstandar(selectedEstandar) : 0}
                    disabled
                    data-testid="input-puntaje-maximo"
                  />
                </FormItem>
              </div>

              <FormField
                control={respuestaForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={3} data-testid="input-observaciones" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={saveRespuestaMutation.isPending || evaluacion?.estado === "completada" || evaluacion?.estado === "enviada"}
                  data-testid="button-submit-respuesta"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveRespuestaMutation.isPending ? "Guardando..." : "Guardar Respuesta"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
