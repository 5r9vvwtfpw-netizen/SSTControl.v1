import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Check, X, MinusCircle, RefreshCcw, FileText, Car, ClipboardList, Hammer, CheckSquare, AlertCircle, ClipboardCheck, AlertTriangle, GraduationCap, ExternalLink, Users, Stethoscope, Wrench, Settings, BarChart3, Activity, Siren, AlertOctagon, LucideIcon, Sparkles, BookOpen, Wand2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluacionPesv, PasoPesv, RespuestaPasoPesv, insertRespuestaPasoPesvSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NIVELES_PESV_LABELS, FASES_PESV_LABELS, FASES_PESV_COLORS, PASOS_PESV, PasoPesvData, ModuloSstUrl } from "@/data/pasos-pesv";
import { usePesvSmartPrefill } from "@/hooks/usePesvSmartPrefill";

type FasePHVA = "planear" | "hacer" | "verificar" | "actuar";

// ADD-ONLY: Helper para mapear nombres de iconos a componentes Lucide
const ICONO_MAP: Record<string, LucideIcon> = {
  Users,
  Stethoscope,
  Wrench,
  ClipboardCheck,
  Settings,
  BarChart3,
  AlertTriangle,
  Activity,
  Siren,
  AlertOctagon,
};

export default function DetalleEvaluacionPesv() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedFase, setSelectedFase] = useState<FasePHVA>("planear");
  const [selectedPaso, setSelectedPaso] = useState<PasoPesvData | null>(null);
  const [respuestaDialogOpen, setRespuestaDialogOpen] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Record<string, boolean>>({});

  const { operationalStats, isLoading: isLoadingSmartData } = usePesvSmartPrefill();

  const { data: evaluacion, isLoading: loadingEvaluacion } = useQuery<EvaluacionPesv>({
    queryKey: ["/api/evaluaciones-pesv", id],
    enabled: !!id,
  });

  const { data: respuestas = [] } = useQuery<RespuestaPasoPesv[]>({
    queryKey: ["/api/evaluaciones-pesv", id, "respuestas"],
    enabled: !!id,
  });

  const { data: pasosDb = [] } = useQuery<PasoPesv[]>({
    queryKey: ["/api/pasos-pesv", evaluacion?.nivel],
    queryFn: async () => {
      if (!evaluacion?.nivel) return [];
      const res = await fetch(`/api/pasos-pesv?nivel=${evaluacion.nivel}`);
      if (!res.ok) throw new Error("Error al cargar pasos");
      return res.json();
    },
    enabled: !!evaluacion?.nivel,
  });

  const getPasosParaNivel = (): PasoPesvData[] => {
    if (!evaluacion?.nivel) return [];
    const nivel = evaluacion.nivel;
    return PASOS_PESV.filter(paso => {
      if (nivel === 'basico') return paso.aplicaBasico;
      if (nivel === 'estandar') return paso.aplicaEstandar;
      return paso.aplicaAvanzado;
    });
  };

  const pasos = getPasosParaNivel();
  const pasosFiltrados = pasos.filter(paso => paso.fase === selectedFase);

  const respuestaForm = useForm<z.infer<typeof insertRespuestaPasoPesvSchema>>({
    resolver: zodResolver(insertRespuestaPasoPesvSchema),
    defaultValues: {
      evaluacionId: id || "",
      pasoId: "",
      cumple: 0,
      noAplica: 0,
      observaciones: "",
      evidencias: "",
      modoVerificacion: "",
      hallazgo: "",
      accidenteSstId: "",
      capacitacionSstId: "",
      inspeccionSstId: "",
    },
  });

  const saveRespuestaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRespuestaPasoPesvSchema>) => {
      const pasoDb = pasosDb.find(p => p.codigo === selectedPaso?.codigo);
      const dataWithPasoId = { ...data, pasoId: pasoDb?.id || data.pasoId };
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${id}/respuestas`, dataWithPasoId);
      return res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", id, "respuestas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", id] });
      setRespuestaDialogOpen(false);
      toast({
        title: "Respuesta guardada",
        description: "La respuesta del paso PESV se ha guardado exitosamente",
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

  const recalcularMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${id}/recalcular`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", id, "respuestas"] });
      toast({
        title: "Puntajes recalculados",
        description: "Los puntajes de la evaluación PESV se han actualizado correctamente",
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

  const handlePasoClick = (paso: PasoPesvData) => {
    if (evaluacion?.estado === "finalizada" || evaluacion?.estado === "aprobada") {
      toast({
        title: "Evaluación bloqueada",
        description: "Esta evaluación está finalizada y no permite ediciones.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPaso(paso);
    const pasoDb = pasosDb.find(p => p.codigo === paso.codigo);
    const existing = respuestas.find(r => r.pasoId === pasoDb?.id);
    
    if (existing) {
      respuestaForm.reset({
        evaluacionId: id || "",
        pasoId: pasoDb?.id || "",
        cumple: existing.cumple,
        noAplica: existing.noAplica,
        observaciones: existing.observaciones || "",
        evidencias: existing.evidencias || "",
        modoVerificacion: existing.modoVerificacion || "",
        hallazgo: existing.hallazgo || "",
        accidenteSstId: existing.accidenteSstId || "",
        capacitacionSstId: existing.capacitacionSstId || "",
        inspeccionSstId: existing.inspeccionSstId || "",
      });
    } else {
      const newAutoFilled: Record<string, boolean> = {};
      const autoModo = paso.modoVerificacionSugerido?.length
        ? paso.modoVerificacionSugerido.join("; ")
        : "";
      const autoEvidencias = paso.evidenciasRequeridas?.length
        ? paso.evidenciasRequeridas.join("; ")
        : "";
      if (autoModo) newAutoFilled.modoVerificacion = true;
      if (autoEvidencias) newAutoFilled.evidencias = true;
      respuestaForm.reset({
        evaluacionId: id || "",
        pasoId: pasoDb?.id || "",
        cumple: 0,
        noAplica: 0,
        observaciones: "",
        evidencias: autoEvidencias,
        modoVerificacion: autoModo,
        hallazgo: "",
        accidenteSstId: "",
        capacitacionSstId: "",
        inspeccionSstId: "",
      });
      setAutoFilledFields(newAutoFilled);
      setRespuestaDialogOpen(true);
      return;
    }
    setAutoFilledFields({});
    setRespuestaDialogOpen(true);
  };

  const onSubmitRespuesta = (values: z.infer<typeof insertRespuestaPasoPesvSchema>) => {
    if (!selectedPaso) return;
    const normalized = {
      ...values,
      accidenteSstId: values.accidenteSstId === "none" ? "" : (values.accidenteSstId || ""),
      capacitacionSstId: values.capacitacionSstId === "none" ? "" : (values.capacitacionSstId || ""),
      inspeccionSstId: values.inspeccionSstId === "none" ? "" : (values.inspeccionSstId || ""),
    };
    saveRespuestaMutation.mutate(normalized);
  };

  const getRespuestaForPaso = (paso: PasoPesvData): RespuestaPasoPesv | undefined => {
    const pasoDb = pasosDb.find(p => p.codigo === paso.codigo);
    if (!pasoDb) return undefined;
    return respuestas.find(r => r.pasoId === pasoDb.id);
  };

  const getEstadoBadge = (paso: PasoPesvData) => {
    const respuesta = getRespuestaForPaso(paso);
    if (!respuesta) {
      return <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>;
    }
    if (respuesta.noAplica === 1) {
      return <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">N/A</Badge>;
    }
    if (respuesta.cumple === 1) {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Cumple</Badge>;
    }
    return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">No Cumple</Badge>;
  };

  const calcularProgresoPorFase = (fase: FasePHVA): { puntaje: number; maximo: number; porcentaje: number } => {
    const pasosFase = pasos.filter(p => p.fase === fase);
    let puntajeTotal = 0;
    let puntajeMaximo = 0;
    
    pasosFase.forEach(paso => {
      const respuesta = getRespuestaForPaso(paso);
      if (respuesta) {
        if (respuesta.noAplica !== 1) {
          puntajeMaximo += paso.puntajeMaximo;
          if (respuesta.cumple === 1) {
            puntajeTotal += paso.puntajeMaximo;
          }
        }
      } else {
        puntajeMaximo += paso.puntajeMaximo;
      }
    });
    
    const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    return { puntaje: puntajeTotal, maximo: puntajeMaximo, porcentaje };
  };

  const calcularProgresoTotal = (): { puntaje: number; maximo: number; porcentaje: number } => {
    let puntajeTotal = 0;
    let puntajeMaximo = 0;
    
    pasos.forEach(paso => {
      const respuesta = getRespuestaForPaso(paso);
      if (respuesta) {
        if (respuesta.noAplica !== 1) {
          puntajeMaximo += paso.puntajeMaximo;
          if (respuesta.cumple === 1) {
            puntajeTotal += paso.puntajeMaximo;
          }
        }
      } else {
        puntajeMaximo += paso.puntajeMaximo;
      }
    });
    
    const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    return { puntaje: puntajeTotal, maximo: puntajeMaximo, porcentaje };
  };

  const progresoTotal = calcularProgresoTotal();

  const getFaseIcon = (fase: FasePHVA) => {
    const icons = {
      planear: ClipboardList,
      hacer: Hammer,
      verificar: CheckSquare,
      actuar: RefreshCcw,
    };
    return icons[fase];
  };

  if (loadingEvaluacion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No se encontró la evaluación PESV</p>
        <Button variant="outline" onClick={() => setLocation("/pesv/auditorias")} data-testid="button-volver-lista">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/pesv/auditorias">
            <Button variant="outline" size="icon" data-testid="button-volver">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Car className="h-6 w-6" />
              Evaluación PESV {evaluacion.anio}
            </h1>
            <p className="text-muted-foreground">
              {NIVELES_PESV_LABELS[evaluacion.nivel] || evaluacion.nivel} • {evaluacion.responsableNombre}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => recalcularMutation.mutate()}
            disabled={recalcularMutation.isPending}
            data-testid="button-recalcular"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${recalcularMutation.isPending ? 'animate-spin' : ''}`} />
            Recalcular Puntajes
          </Button>
          <Button 
            variant="outline" 
            disabled
            data-testid="button-generar-pdf"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generar PDF
          </Button>
        </div>
      </div>

      <Card data-testid="card-resumen-evaluacion">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resumen de Cumplimiento</CardTitle>
          <CardDescription>
            {evaluacion.numeroVehiculos} vehículos • {evaluacion.numeroConductores} conductores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cumplimiento Total</span>
            <span className="text-2xl font-bold" data-testid="text-porcentaje-total">
              {evaluacion.porcentajeCumplimiento || progresoTotal.porcentaje}%
            </span>
          </div>
          <Progress 
            value={Number(evaluacion.porcentajeCumplimiento) || progresoTotal.porcentaje} 
            className="h-3" 
            data-testid="progress-total"
          />
          
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
                {([
                  { key: 'planear' as FasePHVA, nombre: 'Planear', bgColor: '#2196F3', icon: 'P' },
                  { key: 'hacer' as FasePHVA, nombre: 'Hacer', bgColor: '#4CAF50', icon: 'H' },
                  { key: 'verificar' as FasePHVA, nombre: 'Verificar', bgColor: '#FFEB3B', textColor: '#333', icon: 'V' },
                  { key: 'actuar' as FasePHVA, nombre: 'Actuar', bgColor: '#D32F2F', icon: 'A' },
                ]).map((ciclo) => {
                  const progreso = calcularProgresoPorFase(ciclo.key);
                  const porcentaje = progreso.porcentaje;
                  const porcentajeColor = porcentaje >= 85 ? '#4CAF50' : porcentaje >= 60 ? '#FF9800' : '#D32F2F';
                  return (
                    <div 
                      key={ciclo.key} 
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover-elevate"
                      onClick={() => setSelectedFase(ciclo.key)}
                      data-testid={`card-fase-${ciclo.key}`}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                        style={{ backgroundColor: ciclo.bgColor, color: ciclo.textColor || 'white' }}
                      >
                        {ciclo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{ciclo.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {progreso.puntaje} / {progreso.maximo} pts
                        </div>
                        <div className="text-xs font-medium" style={{ color: porcentajeColor }}>
                          {porcentaje}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Tabs value={selectedFase} onValueChange={(v) => setSelectedFase(v as FasePHVA)}>
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-fases">
          {([
            { key: 'planear' as FasePHVA, nombre: 'Planear', bgColor: '#2196F3', icon: 'P' },
            { key: 'hacer' as FasePHVA, nombre: 'Hacer', bgColor: '#4CAF50', icon: 'H' },
            { key: 'verificar' as FasePHVA, nombre: 'Verificar', bgColor: '#FFEB3B', textColor: '#333', icon: 'V' },
            { key: 'actuar' as FasePHVA, nombre: 'Actuar', bgColor: '#D32F2F', icon: 'A' },
          ]).map((ciclo) => {
            const progreso = calcularProgresoPorFase(ciclo.key);
            return (
              <TabsTrigger 
                key={ciclo.key} 
                value={ciclo.key} 
                className="flex items-center gap-2"
                data-testid={`tab-${ciclo.key}`}
              >
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ backgroundColor: ciclo.bgColor, color: ciclo.textColor || 'white' }}
                >
                  {ciclo.icon}
                </div>
                <span className="hidden sm:inline">{ciclo.nombre}</span>
                <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                  {progreso.porcentaje}%
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {([
          { key: 'planear' as FasePHVA, nombre: 'Planear', bgColor: '#2196F3', icon: 'P' },
          { key: 'hacer' as FasePHVA, nombre: 'Hacer', bgColor: '#4CAF50', icon: 'H' },
          { key: 'verificar' as FasePHVA, nombre: 'Verificar', bgColor: '#FFEB3B', textColor: '#333', icon: 'V' },
          { key: 'actuar' as FasePHVA, nombre: 'Actuar', bgColor: '#D32F2F', icon: 'A' },
        ]).map((ciclo) => {
          const pasosFase = pasos.filter(p => p.fase === ciclo.key);
          return (
            <TabsContent key={ciclo.key} value={ciclo.key} className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: ciclo.bgColor, color: ciclo.textColor || 'white' }}
                >
                  {ciclo.icon}
                </div>
                {ciclo.nombre}
              </h2>
              <Badge style={{ backgroundColor: ciclo.bgColor, color: ciclo.textColor || 'white' }}>
                {pasosFase.length} pasos
              </Badge>
            </div>

            <div className="grid gap-4">
              {pasosFase.map((paso) => {
                const respuesta = getRespuestaForPaso(paso);
                return (
                  <Card 
                    key={paso.codigo}
                    className="hover-elevate cursor-pointer transition-all"
                    onClick={() => handlePasoClick(paso)}
                    data-testid={`card-paso-${paso.codigo}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {paso.codigo}
                            </Badge>
                            <CardTitle className="text-base">{paso.nombre}</CardTitle>
                          </div>
                          <CardDescription className="mt-1">
                            {paso.descripcion}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getEstadoBadge(paso)}
                          <Badge variant="secondary" className="font-mono">
                            {respuesta?.cumple === 1 ? paso.puntajeMaximo : 0}/{paso.puntajeMaximo}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {respuesta?.observaciones && (
                      <CardContent className="pt-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          <span className="font-medium">Observaciones:</span> {respuesta.observaciones}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={respuestaDialogOpen} onOpenChange={setRespuestaDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">{selectedPaso?.codigo}</Badge>
              {selectedPaso?.nombre}
            </DialogTitle>
            <DialogDescription>
              {selectedPaso?.descripcion}
            </DialogDescription>
          </DialogHeader>

          {selectedPaso?.fundamentoNormativo && (
            <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30" data-testid="alert-fundamento-normativo">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                {selectedPaso.fundamentoNormativo}
              </AlertDescription>
            </Alert>
          )}

          <Form {...respuestaForm}>
            <form onSubmit={respuestaForm.handleSubmit(onSubmitRespuesta)} className="space-y-4">
              <FormField
                control={respuestaForm.control}
                name="cumple"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valoración</FormLabel>
                    <Select 
                      value={
                        respuestaForm.watch("noAplica") === 1 
                          ? "no_aplica" 
                          : field.value === 1 
                            ? "cumple" 
                            : "no_cumple"
                      }
                      onValueChange={(value) => {
                        const newAutoFilled: Record<string, boolean> = {};
                        const canReplace = (fieldName: string) => {
                          const currentVal = respuestaForm.getValues(fieldName as any);
                          return !currentVal || autoFilledFields[fieldName];
                        };
                        if (value === "no_aplica") {
                          respuestaForm.setValue("noAplica", 1);
                          respuestaForm.setValue("cumple", 0);
                          if (canReplace("justificacionNa") && selectedPaso?.justificacionNaSugerida) {
                            respuestaForm.setValue("justificacionNa", selectedPaso.justificacionNaSugerida);
                            newAutoFilled.justificacionNa = true;
                          }
                          if (autoFilledFields.observaciones) respuestaForm.setValue("observaciones", "");
                          if (autoFilledFields.hallazgo) respuestaForm.setValue("hallazgo", "");
                        } else if (value === "cumple") {
                          respuestaForm.setValue("noAplica", 0);
                          respuestaForm.setValue("cumple", 1);
                          if (canReplace("observaciones") && selectedPaso?.observacionesCumple) {
                            respuestaForm.setValue("observaciones", selectedPaso.observacionesCumple);
                            newAutoFilled.observaciones = true;
                          }
                          if (canReplace("modoVerificacion") && selectedPaso?.modoVerificacionSugerido?.length) {
                            respuestaForm.setValue("modoVerificacion", selectedPaso.modoVerificacionSugerido.join("; "));
                            newAutoFilled.modoVerificacion = true;
                          }
                          if (autoFilledFields.hallazgo) respuestaForm.setValue("hallazgo", "");
                        } else {
                          respuestaForm.setValue("noAplica", 0);
                          respuestaForm.setValue("cumple", 0);
                          if (canReplace("observaciones") && selectedPaso?.observacionesNoCumple) {
                            respuestaForm.setValue("observaciones", selectedPaso.observacionesNoCumple);
                            newAutoFilled.observaciones = true;
                          }
                          if (canReplace("hallazgo") && selectedPaso?.hallazgoSugeridoNoCumple) {
                            respuestaForm.setValue("hallazgo", selectedPaso.hallazgoSugeridoNoCumple);
                            newAutoFilled.hallazgo = true;
                          }
                          if (canReplace("modoVerificacion") && selectedPaso?.modoVerificacionSugerido?.length) {
                            respuestaForm.setValue("modoVerificacion", selectedPaso.modoVerificacionSugerido.join("; "));
                            newAutoFilled.modoVerificacion = true;
                          }
                        }
                        setAutoFilledFields(newAutoFilled);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-valoracion">
                          <SelectValue placeholder="Seleccione valoración" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cumple">
                          <span className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Cumple (100%)
                          </span>
                        </SelectItem>
                        <SelectItem value="no_cumple">
                          <span className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-600" />
                            No Cumple (0%)
                          </span>
                        </SelectItem>
                        <SelectItem value="no_aplica">
                          <span className="flex items-center gap-2">
                            <MinusCircle className="h-4 w-4 text-gray-500" />
                            No Aplica (N/A)
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {respuestaForm.watch("noAplica") === 1 && (
                <FormField
                  control={respuestaForm.control}
                  name="justificacionNa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Justificación "No Aplica"
                        {autoFilledFields.justificacionNa && (
                          <Badge variant="secondary" className="text-xs font-normal gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            Auto-completado
                          </Badge>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Justifique por qué este paso no aplica..."
                          className="min-h-[60px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-justificacion-no-aplica"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={respuestaForm.control}
                name="modoVerificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Modo de Verificación
                      {autoFilledFields.modoVerificacion && (
                        <Badge variant="secondary" className="text-xs font-normal gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Auto-completado
                        </Badge>
                      )}
                    </FormLabel>
                    {selectedPaso?.modoVerificacionSugerido && selectedPaso.modoVerificacionSugerido.length > 0 ? (
                      <Select
                        value={field.value || ""}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setAutoFilledFields(prev => ({ ...prev, modoVerificacion: false }));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-modo-verificacion">
                            <SelectValue placeholder="Seleccione modo de verificación..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.value && !selectedPaso.modoVerificacionSugerido.includes(field.value) && field.value !== selectedPaso.modoVerificacionSugerido.join("; ") && (
                            <SelectItem value={field.value}>
                              {field.value}
                            </SelectItem>
                          )}
                          {selectedPaso.modoVerificacionSugerido.map((modo, idx) => (
                            <SelectItem key={idx} value={modo}>
                              {modo}
                            </SelectItem>
                          ))}
                          {selectedPaso.modoVerificacionSugerido.length > 1 && (
                            <SelectItem value={selectedPaso.modoVerificacionSugerido.join("; ")}>
                              Todos los modos de verificaci\u00f3n
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input 
                          placeholder="Ej: Revisión documental, Entrevista, Inspección visual..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-modo-verificacion"
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={respuestaForm.control}
                name="evidencias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Evidencias
                      {selectedPaso?.evidenciasRequeridas && selectedPaso.evidenciasRequeridas.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs text-amber-600 dark:text-amber-400"
                          onClick={() => {
                            if (!field.value) {
                              field.onChange(selectedPaso.evidenciasRequeridas.join("; "));
                              setAutoFilledFields(prev => ({ ...prev, evidencias: true }));
                            }
                          }}
                          data-testid="button-autocompletar-evidencias"
                        >
                          <Wand2 className="h-3 w-3" />
                          Auto-completar
                        </Button>
                      )}
                      {autoFilledFields.evidencias && (
                        <Badge variant="secondary" className="text-xs font-normal gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Auto-completado
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="URL o descripción de las evidencias..."
                        {...field}
                        value={field.value || ""}
                        data-testid="input-evidencias"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={respuestaForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Observaciones
                      {autoFilledFields.observaciones && (
                        <Badge variant="secondary" className="text-xs font-normal gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Auto-completado
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ingrese observaciones adicionales..."
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-observaciones"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {respuestaForm.watch("cumple") === 0 && respuestaForm.watch("noAplica") === 0 && (
                <FormField
                  control={respuestaForm.control}
                  name="hallazgo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Hallazgo / No Conformidad
                        {autoFilledFields.hallazgo && (
                          <Badge variant="secondary" className="text-xs font-normal gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            Auto-completado
                          </Badge>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa el hallazgo o no conformidad..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-hallazgo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                  Trazabilidad SST (opcional)
                  {(operationalStats.incidents.total > 0 || operationalStats.trainings.total > 0 || operationalStats.inspections.total > 0) && (
                    <Badge variant="secondary" className="text-xs font-normal gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Seleccione registros existentes
                    </Badge>
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={respuestaForm.control}
                    name="accidenteSstId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Siniestro Vial</FormLabel>
                        {operationalStats.incidents.items.length > 0 ? (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-accidente-sst-id">
                                <SelectValue placeholder="Seleccionar siniestro..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin vincular</SelectItem>
                              {operationalStats.incidents.items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input 
                              placeholder="Sin siniestros registrados"
                              {...field}
                              value={field.value || ""}
                              disabled={isLoadingSmartData}
                              data-testid="input-accidente-sst-id"
                            />
                          </FormControl>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={respuestaForm.control}
                    name="capacitacionSstId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Capacitación Vial</FormLabel>
                        {operationalStats.trainings.items.length > 0 ? (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-capacitacion-sst-id">
                                <SelectValue placeholder="Seleccionar capacitación..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin vincular</SelectItem>
                              {operationalStats.trainings.items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input 
                              placeholder="Sin capacitaciones registradas"
                              {...field}
                              value={field.value || ""}
                              disabled={isLoadingSmartData}
                              data-testid="input-capacitacion-sst-id"
                            />
                          </FormControl>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={respuestaForm.control}
                    name="inspeccionSstId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Inspección Vehicular</FormLabel>
                        {operationalStats.inspections.items.length > 0 ? (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-inspeccion-sst-id">
                                <SelectValue placeholder="Seleccionar inspección..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin vincular</SelectItem>
                              {operationalStats.inspections.items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input 
                              placeholder="Sin inspecciones registradas"
                              {...field}
                              value={field.value || ""}
                              disabled={isLoadingSmartData}
                              data-testid="input-inspeccion-sst-id"
                            />
                          </FormControl>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {selectedPaso && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Criterios de Verificación</p>
                  <ul className="text-sm space-y-1">
                    {selectedPaso.criteriosVerificacion.map((criterio, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        {criterio}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPaso && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Evidencias Requeridas</p>
                  <ul className="text-sm space-y-1">
                    {selectedPaso.evidenciasRequeridas.map((evidencia, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        {evidencia}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ADD-ONLY: Botón para ir al módulo PESV relacionado */}
              {selectedPaso?.moduloPesvUrl && (
                <div className="border-t pt-4">
                  <Link href={selectedPaso.moduloPesvUrl.includes(':evaluacionId') ? selectedPaso.moduloPesvUrl.replace(':evaluacionId', id!) : `/pesv/evaluacion/${id}${selectedPaso.moduloPesvUrl.replace('/pesv', '')}`}>
                    <Button 
                      type="button" 
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                      data-testid={`button-ir-modulo-${selectedPaso.codigo.toLowerCase()}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ir a {selectedPaso.moduloPesvNombre}
                    </Button>
                  </Link>
                </div>
              )}

              {/* ADD-ONLY: Botones para ir a módulos SST relacionados */}
              {selectedPaso?.modulosSstUrls && selectedPaso.modulosSstUrls.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Trazabilidad con SST (Decreto 1072/2015)
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedPaso.modulosSstUrls.map((modulo: ModuloSstUrl) => {
                      const IconComponent = modulo.icono ? ICONO_MAP[modulo.icono] : ExternalLink;
                      return (
                        <Link key={modulo.url} href={modulo.url}>
                          <Button 
                            type="button" 
                            variant="outline"
                            className="w-full gap-2 border-blue-300 text-blue-700 font-medium"
                            data-testid={`button-ir-sst-${modulo.url.replace('/', '')}`}
                          >
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            Ir a {modulo.nombre}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRespuestaDialogOpen(false)}
                  data-testid="button-cancelar-respuesta"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveRespuestaMutation.isPending}
                  data-testid="button-guardar-respuesta"
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
