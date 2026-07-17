import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Check, X, MinusCircle, RefreshCcw, FileText, Car, ClipboardList, Hammer, CheckSquare, AlertCircle, ClipboardCheck, AlertTriangle, GraduationCap, ExternalLink, Users, Stethoscope, Wrench, Settings, BarChart3, Activity, Siren, AlertOctagon, LucideIcon, Sparkles, BookOpen, Wand2, CheckCircle2, FileCheck, Lock, Upload, Trash2, Loader2, Paperclip, CheckCircle, Circle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { useState, useEffect, useCallback, useMemo, useRef, memo, Component, type ErrorInfo, type ReactNode } from "react";
import { FormProvider } from "react-hook-form";
import { setPesvEvaluacionContext } from "@/components/BackToPesvEvaluationButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvaluacionPesv, PasoPesv, RespuestaPasoPesv, PesvCriterioVerificacion, PesvEvidenciaDocumento, insertRespuestaPasoPesvSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanyContext } from "@/hooks/use-company-context";
import { PasoPesvData, ModuloSstUrl, NIVELES_PESV_LABELS, FASES_PESV_LABELS, FASES_PESV_COLORS, PASOS_PESV } from "@/data/pasos-pesv";
import { isModuleAllowedForChapter, type ChapterType } from "@shared/chapter-modules";

function IsolatedFormProvider({ form, children }: { form: any; children: React.ReactNode }) {
  return <FormProvider {...form}>{children}</FormProvider>;
}

// Componente aislado para mostrar la auto-verificación P01.
// Debe estar FUERA del IsolatedFormProvider para evitar re-renders infinitos.
const P01AutoVerifPanel = memo(({ data }: {
  data: {
    criterios: { nombre: string; cumple: boolean; detalle: string }[];
    porcentaje: number;
    cumplimientoTotal: number;
    totalCriterios: number;
  } | null;
}) => {
  if (!data) return null;
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 p-4 space-y-3 mb-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Verificación automática del Comité PESV
          </span>
        </div>
        <Badge variant={data.porcentaje >= 100 ? "default" : "secondary"} className="shrink-0">
          {data.cumplimientoTotal}/{data.totalCriterios} — {data.porcentaje}%
        </Badge>
      </div>
      <div className="space-y-1.5">
        {data.criterios.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            {c.cumple ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <span className={c.cumple ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-muted-foreground"}>
                {c.nombre}
              </span>
              {c.detalle && (
                <p className="text-muted-foreground mt-0.5">{c.detalle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
P01AutoVerifPanel.displayName = "P01AutoVerifPanel";

interface RespuestaDialogProps {
  open: boolean;
  onClose: () => void;
  paso: PasoPesvData | null;
  evaluacionId: string;
  evaluacion: EvaluacionPesv | undefined;
  respuestas: RespuestaPasoPesv[];
  companyChapter: string;
  onSaved: (fase: string) => void;
  toast: (opts: any) => void;
}

function RespuestaDialog({ open, onClose, paso, evaluacionId, evaluacion, respuestas, companyChapter, onSaved, toast }: RespuestaDialogProps) {
  const [formNoAplica, setFormNoAplica] = useState(0);
  const [formCumple, setFormCumple] = useState(0);
  const [autoFilledFields, setAutoFilledFields] = useState<Record<string, boolean>>({});
  const [uploadingEvidencia, setUploadingEvidencia] = useState<number | null>(null);
  const [criteriosOverrides, setCriteriosOverrides] = useState<Record<number, boolean>>({});
  const [activePasoId, setActivePasoId] = useState<string | null>(null);
  const initializedPasoRef = useRef<string | null>(null);

  const [autoVerifP01, setAutoVerifP01] = useState<{
    criterios: { nombre: string; cumple: boolean; detalle: string }[];
    porcentaje: number;
    cumplimientoTotal: number;
    totalCriterios: number;
  } | null>(null);

  useEffect(() => {
    if (!open || paso?.codigo !== "P01") {
      setAutoVerifP01(null);
      return;
    }
    let cancelled = false;
    fetch("/api/pesv/comite/verificacion-p01", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (!cancelled && data) setAutoVerifP01(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [open, paso?.codigo]);

  const respuestaForm = useForm<z.infer<typeof insertRespuestaPasoPesvSchema>>({
    resolver: zodResolver(insertRespuestaPasoPesvSchema),
    defaultValues: {
      evaluacionId: evaluacionId || "",
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

  const { data: criteriosDb = [], refetch: refetchCriterios } = useQuery<PesvCriterioVerificacion[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "criterios", activePasoId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/criterios?pasoId=${activePasoId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!evaluacionId && !!activePasoId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { data: evidenciasDb = [], refetch: refetchEvidencias } = useQuery<PesvEvidenciaDocumento[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "evidencias-docs", activePasoId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/evidencias-docs?pasoId=${activePasoId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!evaluacionId && !!activePasoId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const criteriosFromDb = useMemo(() => {
    const estado: Record<number, boolean> = {};
    criteriosDb.forEach((c: PesvCriterioVerificacion) => { estado[c.criterioIndex] = c.verificado === 1; });
    return estado;
  }, [criteriosDb]);

  const criteriosLocales = useMemo(() => {
    return { ...criteriosFromDb, ...criteriosOverrides };
  }, [criteriosFromDb, criteriosOverrides]);

  const criteriosVerificados = Object.values(criteriosLocales).filter(Boolean).length;
  const totalCriteriosPaso = paso?.criteriosVerificacion.length || 0;
  const porcentajeCriterios = totalCriteriosPaso > 0 ? Math.round((criteriosVerificados / totalCriteriosPaso) * 100) : 0;
  const evidenciasAdjuntas = evidenciasDb.filter(e => e.archivoUrl).length;
  const totalEvidenciasPaso = paso?.evidenciasRequeridas.length || 0;

  const refetchCriteriosYEvidencias = useCallback(() => {
    setCriteriosOverrides({});
    refetchCriterios();
    refetchEvidencias();
  }, [refetchCriterios, refetchEvidencias]);

  const inicializarYCargar = useCallback(async (p: PasoPesvData, evId: string) => {
    try {
      await apiRequest("POST", `/api/evaluaciones-pesv/${evId}/inicializar-criterios`, {
        pasoId: p.codigo,
        criterios: p.criteriosVerificacion,
        evidencias: p.evidenciasRequeridas,
      });
    } catch {}
    setActivePasoId(p.codigo);
  }, []);

  const handleToggleCriterio = async (idx: number, criterioTexto: string) => {
    const nuevoEstado = !criteriosLocales[idx];
    setCriteriosOverrides(prev => ({ ...prev, [idx]: nuevoEstado }));
    try {
      await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/criterios`, {
        pasoId: paso?.codigo,
        criterioIndex: idx,
        criterioTexto,
        verificado: nuevoEstado,
      });
      refetchCriteriosYEvidencias();
    } catch {
      setCriteriosOverrides(prev => ({ ...prev, [idx]: !nuevoEstado }));
    }
  };

  const handleFileUpload = async (evidenciaIndex: number, evidenciaTexto: string, file: File) => {
    setUploadingEvidencia(evidenciaIndex);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!uploadRes.ok) throw new Error("Error al subir archivo");
      const { url } = await uploadRes.json();
      await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/evidencias-docs`, {
        pasoId: paso?.codigo,
        evidenciaIndex,
        evidenciaTexto,
        archivoUrl: url,
        archivoNombre: file.name,
        archivoTipo: file.type,
        archivoTamanio: file.size,
      });
      refetchCriteriosYEvidencias();
      setUploadingEvidencia(null);
      toast({ title: "Archivo adjuntado", description: "La evidencia se ha adjuntado correctamente", className: "bg-green-50 border-green-200" });
    } catch {
      setUploadingEvidencia(null);
      toast({ title: "Error", description: "No se pudo subir el archivo", variant: "destructive" });
    }
  };

  const handleRemoveEvidencia = async (evidenciaId: string) => {
    try {
      await apiRequest("DELETE", `/api/evaluaciones-pesv/${evaluacionId}/evidencias-docs/${evidenciaId}`);
      refetchCriteriosYEvidencias();
      toast({ title: "Archivo eliminado", description: "El archivo de evidencia ha sido removido", className: "bg-green-50 border-green-200" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el archivo", variant: "destructive" });
    }
  };

  const saveRespuestaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRespuestaPasoPesvSchema>) => {
      const dataWithPasoId = { ...data, pasoId: paso?.codigo || data.pasoId };
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/respuestas`, dataWithPasoId);
      return res.json();
    },
    onSuccess: async () => {
      if (paso?.fase) {
        onSaved(paso.fase);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "respuestas"] });
      onClose();
      toast({
        title: "Respuesta guardada",
        description: "La respuesta del paso PESV se ha guardado exitosamente",
        className: "bg-green-50 border-green-200",
      });
      try {
        await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/recalcular`, {});
        queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId] });
      } catch (e) {
        console.warn("Error recalculando puntajes PESV:", e);
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

  const onSubmitRespuesta = (values: z.infer<typeof insertRespuestaPasoPesvSchema>) => {
    if (!paso) return;
    saveRespuestaMutation.mutate(values);
  };

  useEffect(() => {
    if (!paso || !open) {
      initializedPasoRef.current = null;
      setActivePasoId(null);
      return;
    }
    if (initializedPasoRef.current === paso.codigo) return;
    initializedPasoRef.current = paso.codigo;

    setCriteriosOverrides({});
    setActivePasoId(null);

    const existing = respuestas.find(r => r.pasoId === paso.codigo);

    if (existing) {
      setFormCumple(existing.cumple);
      setFormNoAplica(existing.noAplica);
      respuestaForm.reset({
        evaluacionId: evaluacionId || "",
        pasoId: paso.codigo,
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
      setAutoFilledFields({});
    } else {
      const newAutoFilled: Record<string, boolean> = {};
      const autoModo = paso.modoVerificacionSugerido?.length
        ? paso.modoVerificacionSugerido.join("; ")
        : "";
      const autoEvidencias = paso.evidenciasRequeridas?.length
        ? paso.evidenciasRequeridas.join("; ")
        : "";
      const autoObservaciones = paso.observacionesNoCumple || "";
      const autoHallazgo = paso.hallazgoSugeridoNoCumple || "";
      if (autoModo) newAutoFilled.modoVerificacion = true;
      if (autoEvidencias) newAutoFilled.evidencias = true;
      if (autoObservaciones) newAutoFilled.observaciones = true;
      if (autoHallazgo) newAutoFilled.hallazgo = true;
      setFormCumple(0);
      setFormNoAplica(0);
      respuestaForm.reset({
        evaluacionId: evaluacionId || "",
        pasoId: paso.codigo,
        cumple: 0,
        noAplica: 0,
        observaciones: autoObservaciones,
        evidencias: autoEvidencias,
        modoVerificacion: autoModo,
        hallazgo: autoHallazgo,
        accidenteSstId: "",
        capacitacionSstId: "",
        inspeccionSstId: "",
      });
      setAutoFilledFields(newAutoFilled);
    }

    if (evaluacionId) {
      inicializarYCargar(paso, evaluacionId);
    }
  }, [paso?.codigo, open]);

  if (!paso) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">{paso.codigo}</Badge>
            {paso.nombre}
          </DialogTitle>
          <DialogDescription>
            {paso.descripcion}
          </DialogDescription>
        </DialogHeader>

        {paso.fundamentoNormativo && (
          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30" data-testid="alert-fundamento-normativo">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              {paso.fundamentoNormativo}
            </AlertDescription>
          </Alert>
        )}

        {!respuestas.find(r => r.pasoId === paso.codigo) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-300">Todos los campos han sido auto-completados. Revise y ajuste si es necesario, luego guarde.</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto gap-1 text-amber-600 dark:text-amber-400 flex-shrink-0"
              onClick={() => {
                const currentCumple = respuestaForm.getValues("cumple");
                const currentNoAplica = respuestaForm.getValues("noAplica");
                const newAutoFilled: Record<string, boolean> = {};
                if (paso.modoVerificacionSugerido?.length) {
                  respuestaForm.setValue("modoVerificacion", paso.modoVerificacionSugerido.join("; "));
                  newAutoFilled.modoVerificacion = true;
                }
                if (paso.evidenciasRequeridas?.length) {
                  respuestaForm.setValue("evidencias", paso.evidenciasRequeridas.join("; "));
                  newAutoFilled.evidencias = true;
                }
                if (currentNoAplica === 1) {
                  if (paso.justificacionNaSugerida) {
                    respuestaForm.setValue("justificacionNa", paso.justificacionNaSugerida);
                    newAutoFilled.justificacionNa = true;
                  }
                } else if (currentCumple === 1) {
                  if (paso.observacionesCumple) {
                    respuestaForm.setValue("observaciones", paso.observacionesCumple);
                    newAutoFilled.observaciones = true;
                  }
                } else {
                  if (paso.observacionesNoCumple) {
                    respuestaForm.setValue("observaciones", paso.observacionesNoCumple);
                    newAutoFilled.observaciones = true;
                  }
                  if (paso.hallazgoSugeridoNoCumple) {
                    respuestaForm.setValue("hallazgo", paso.hallazgoSugeridoNoCumple);
                    newAutoFilled.hallazgo = true;
                  }
                }
                setAutoFilledFields(newAutoFilled);
              }}
              data-testid="button-autocompletar-todo"
            >
              <RefreshCcw className="h-3 w-3" />
              Re-llenar
            </Button>
          </div>
        )}

        {/* Panel de verificación automática P01 - FUERA del FormProvider para evitar re-renders infinitos */}
        {paso.codigo === "P01" && (
          <P01AutoVerifPanel data={autoVerifP01} />
        )}

        <IsolatedFormProvider form={respuestaForm}>
          <form onSubmit={respuestaForm.handleSubmit(onSubmitRespuesta)} className="space-y-4">
            <FormField
              control={respuestaForm.control}
              name="cumple"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valoración</FormLabel>
                  <Select 
                    value={
                      formNoAplica === 1 
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
                        setFormNoAplica(1);
                        setFormCumple(0);
                        respuestaForm.setValue("noAplica", 1);
                        respuestaForm.setValue("cumple", 0);
                        if (canReplace("justificacionNa") && paso.justificacionNaSugerida) {
                          respuestaForm.setValue("justificacionNa", paso.justificacionNaSugerida);
                          newAutoFilled.justificacionNa = true;
                        }
                        if (autoFilledFields.observaciones) respuestaForm.setValue("observaciones", "");
                        if (autoFilledFields.hallazgo) respuestaForm.setValue("hallazgo", "");
                      } else if (value === "cumple") {
                        setFormNoAplica(0);
                        setFormCumple(1);
                        respuestaForm.setValue("noAplica", 0);
                        respuestaForm.setValue("cumple", 1);
                        if (canReplace("observaciones") && paso.observacionesCumple) {
                          respuestaForm.setValue("observaciones", paso.observacionesCumple);
                          newAutoFilled.observaciones = true;
                        }
                        if (canReplace("modoVerificacion") && paso.modoVerificacionSugerido?.length) {
                          respuestaForm.setValue("modoVerificacion", paso.modoVerificacionSugerido.join("; "));
                          newAutoFilled.modoVerificacion = true;
                        }
                        if (autoFilledFields.hallazgo) respuestaForm.setValue("hallazgo", "");
                      } else {
                        setFormNoAplica(0);
                        setFormCumple(0);
                        respuestaForm.setValue("noAplica", 0);
                        respuestaForm.setValue("cumple", 0);
                        if (canReplace("observaciones") && paso.observacionesNoCumple) {
                          respuestaForm.setValue("observaciones", paso.observacionesNoCumple);
                          newAutoFilled.observaciones = true;
                        }
                        if (canReplace("hallazgo") && paso.hallazgoSugeridoNoCumple) {
                          respuestaForm.setValue("hallazgo", paso.hallazgoSugeridoNoCumple);
                          newAutoFilled.hallazgo = true;
                        }
                        if (canReplace("modoVerificacion") && paso.modoVerificacionSugerido?.length) {
                          respuestaForm.setValue("modoVerificacion", paso.modoVerificacionSugerido.join("; "));
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

            {formNoAplica === 1 && (
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
                  {paso.modoVerificacionSugerido && paso.modoVerificacionSugerido.length > 0 ? (
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
                        {field.value && !paso.modoVerificacionSugerido.includes(field.value) && field.value !== paso.modoVerificacionSugerido.join("; ") && (
                          <SelectItem value={field.value}>
                            {field.value}
                          </SelectItem>
                        )}
                        {paso.modoVerificacionSugerido.map((modo, idx) => (
                          <SelectItem key={idx} value={modo}>
                            {modo}
                          </SelectItem>
                        ))}
                        {paso.modoVerificacionSugerido.length > 1 && (
                          <SelectItem value={paso.modoVerificacionSugerido.join("; ")}>
                            Todos los modos de verificación
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
                    {paso.evidenciasRequeridas && paso.evidenciasRequeridas.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-amber-600 dark:text-amber-400"
                        onClick={() => {
                          if (!field.value) {
                            field.onChange(paso.evidenciasRequeridas.join("; "));
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

            {formCumple === 0 && formNoAplica === 0 && (
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


            {paso.moduloPesvUrl && (
              <div className="border-t pt-4 flex flex-col gap-2">
                <Link href={paso.moduloPesvUrl.includes(':evaluacionId') ? paso.moduloPesvUrl.replace(':evaluacionId', evaluacionId!) : `/pesv/evaluacion/${evaluacionId}${paso.moduloPesvUrl.replace('/pesv', '')}`}>
                  <Button 
                    type="button" 
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                    data-testid={`button-ir-modulo-${paso.codigo.toLowerCase()}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ir a {paso.moduloPesvNombre}
                  </Button>
                </Link>
                {paso.modulosPesvSecundarios?.map((mod) => (
                  <Link key={mod.url} href={`/pesv/evaluacion/${evaluacionId}${mod.url.replace('/pesv', '')}`}>
                    <Button
                      type="button"
                      className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md"
                      data-testid={`button-ir-modulo-secundario-${mod.url.replace(/\//g, '-')}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ir a {mod.nombre}
                    </Button>
                  </Link>
                ))}
              </div>
            )}

            {paso.modulosSstUrls && paso.modulosSstUrls.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Trazabilidad con SST (Decreto 1072/2015)
                </p>
                <div className="flex flex-col gap-2">
                  {paso.modulosSstUrls.map((modulo: ModuloSstUrl) => {
                    const IconComponent = modulo.icono ? ICONO_MAP[modulo.icono] : ExternalLink;
                    const moduleAllowed = !companyChapter || isModuleAllowedForChapter(modulo.url, companyChapter as ChapterType);
                    if (!moduleAllowed) {
                      return null;
                    }
                    return (
                      <Link key={modulo.url} href={modulo.url}>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="w-full gap-2 border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400 font-medium"
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
                onClick={onClose}
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
        </IsolatedFormProvider>
      </DialogContent>
    </Dialog>
  );
}

class PesvErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[PESV-ERROR-BOUNDARY] Caught error:", error.message);
    console.error("[PESV-ERROR-BOUNDARY] Component stack:", errorInfo.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center" data-testid="pesv-error-boundary">
          <h2 className="text-lg font-semibold text-red-600">Error en evaluación PESV</h2>
          <p className="text-sm text-muted-foreground mt-2">{this.state.error?.message}</p>
          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded" onClick={() => this.setState({ hasError: false, error: null })}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

type FasePHVA = "planear" | "hacer" | "verificar" | "actuar" | "resumen";

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

function DetalleEvaluacionPesvInner() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { companyChapter } = useCompanyContext();
  const initialFase = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fase = params.get('fase');
      if (fase && ['planear', 'hacer', 'verificar', 'actuar', 'resumen'].includes(fase)) {
        return fase as FasePHVA;
      }
    }
    return 'planear' as FasePHVA;
  })();
  const [selectedFase, setSelectedFase] = useState<FasePHVA>(initialFase);
  const [selectedPaso, setSelectedPaso] = useState<PasoPesvData | null>(null);
  const [respuestaDialogOpen, setRespuestaDialogOpen] = useState(false);
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setPesvEvaluacionContext(id, selectedFase);
    }
  }, [id, selectedFase]);

  const { data: evaluacion, isLoading: loadingEvaluacion } = useQuery<EvaluacionPesv>({
    queryKey: ["/api/evaluaciones-pesv", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (evaluacion?.companyId && (user?.role === 'superadmin' || user?.role === 'lso' || user?.role === 'lso_externo')) {
      localStorage.setItem('superadmin_vault_company', evaluacion.companyId);
    }
  }, [evaluacion?.companyId, user?.role]);

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

  interface VerificacionResumen {
    evaluacionId: string;
    pasos: Record<string, {
      totalCriterios: number;
      criteriosVerificados: number;
      totalEvidencias: number;
      evidenciasConArchivo: number;
      porcentajeCriterios: number;
      porcentajeEvidencias: number;
      cumpleAutomatico: boolean;
    }>;
    totalGeneral: {
      criterios: number;
      criteriosVerificados: number;
      evidencias: number;
      evidenciasConArchivo: number;
    };
  }

  const { data: resumenVerificacion = null, isLoading: resumenLoading } = useQuery<VerificacionResumen>({
    queryKey: ["/api/evaluaciones-pesv", id, "verificacion-resumen"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${id}/verificacion-resumen`, { credentials: "include" });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!id && selectedFase === 'resumen',
    staleTime: 30000,
    refetchOnWindowFocus: false,
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

  const handleDownloadIso39001Report = async () => {
    try {
      const response = await fetch(`/api/evaluaciones-pesv/${id}/pdf-iso39001`, {
        credentials: 'include'
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al generar reporte ISO 39001');
        }
        throw new Error('Error al generar reporte ISO 39001');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte-ISO39001-PESV-${evaluacion?.anio || new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Reporte ISO 39001:2012 generado",
        description: "El reporte de cumplimiento Road Traffic Safety está listo para compartir con clientes internacionales.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const generarPlanPesvMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${id}/generar-plan`, {});
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones-mejora-contexto"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plan-mejoramiento-consolidado"] });
      if (result.created === 0) {
        toast({
          title: "Sin acciones nuevas",
          description: `Todos los pasos aplicables ya tienen acciones registradas (${result.skipped} omitidas por duplicado).`,
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        toast({
          title: "Plan generado",
          description: `Se crearon ${result.created} acciones de mejora en el Plan de Mejoramiento.${result.skipped > 0 ? ` (${result.skipped} ya existían)` : ""}`,
          className: "bg-green-50 border-green-200",
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const finalizarEvaluacionMutation = useMutation({
    mutationFn: async (nuevoEstado: string) => {
      const res = await apiRequest("PATCH", `/api/evaluaciones-pesv/${id}`, { estado: nuevoEstado });
      return res.json();
    },
    onSuccess: (_, nuevoEstado) => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv"] });
      setFinalizarDialogOpen(false);

      const mensajes: Record<string, { titulo: string; descripcion: string }> = {
        "completada": {
          titulo: "Evaluación finalizada",
          descripcion: "La evaluación PESV ha sido finalizada exitosamente. Ya puede generar el reporte para Supertransporte."
        },
        "enviada": {
          titulo: "Evaluación enviada",
          descripcion: "La evaluación ha sido marcada como enviada a Supertransporte/RUNT."
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

  const getRespuestaForPaso = (paso: PasoPesvData): RespuestaPasoPesv | undefined => {
    return respuestas.find(r => r.pasoId === paso.codigo);
  };

  const pasosEvaluados = pasos.filter(p => getRespuestaForPaso(p)).length;
  const totalPasos = pasos.length;
  const progresoPasos = totalPasos > 0 ? Math.round((pasosEvaluados / totalPasos) * 100) : 0;

  const handlePasoClick = (paso: PasoPesvData) => {
    if (evaluacion?.estado === "completada" || evaluacion?.estado === "enviada") {
      toast({
        title: "Evaluación bloqueada",
        description: "Esta evaluación está finalizada y no permite ediciones.",
        variant: "destructive",
      });
      return;
    }
    setSelectedPaso(paso);
    setRespuestaDialogOpen(true);
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => setLocation('/pesv/evaluaciones')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Salir de la evaluación
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              Evaluación PESV {evaluacion.anio}
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
                Enviada a Supertransporte
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {NIVELES_PESV_LABELS[evaluacion.nivel] || evaluacion.nivel} • Responsable: {evaluacion.responsableNombre}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => generarPlanPesvMutation.mutate()}
            disabled={generarPlanPesvMutation.isPending}
            data-testid="button-generar-plan-pesv"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {generarPlanPesvMutation.isPending ? "Generando..." : "Generar Plan Automático"}
          </Button>
          <Button
            onClick={handleDownloadIso39001Report}
            data-testid="button-export-iso39001"
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white border-0"
          >
            <Shield className="h-4 w-4 mr-2" />
            PDF ISO 39001:2012
          </Button>
          <Button 
            variant="default" 
            onClick={() => {
              window.open(`/api/evaluaciones-pesv/${id}/pdf?tipo=supertransporte`, '_blank');
            }}
            data-testid="button-export-supertransporte"
            className="bg-green-600"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar Reporte Supertransporte
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
            <Button 
              variant="outline"
              onClick={() => finalizarEvaluacionMutation.mutate("en-progreso")}
              disabled={finalizarEvaluacionMutation.isPending}
              data-testid="button-reabrir-evaluacion-enviada"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reabrir
            </Button>
          )}
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

      <Tabs value={selectedFase} onValueChange={(v) => {
        const newFase = v as FasePHVA;
        setSelectedFase(newFase);
        const url = new URL(window.location.href);
        url.searchParams.set('fase', newFase);
        window.history.replaceState({}, '', url.toString());
      }}>
        <TabsList className="grid w-full grid-cols-5" data-testid="tabs-fases">
          {([
            { key: 'planear' as FasePHVA, nombre: 'Planear', bgColor: '#2196F3', icon: 'P' },
            { key: 'hacer' as FasePHVA, nombre: 'Hacer', bgColor: '#4CAF50', icon: 'H' },
            { key: 'verificar' as FasePHVA, nombre: 'Verificar', bgColor: '#FFEB3B', textColor: '#333', icon: 'V' },
            { key: 'actuar' as FasePHVA, nombre: 'Actuar', bgColor: '#D32F2F', icon: 'A' },
            { key: 'resumen' as FasePHVA, nombre: 'Resumen', bgColor: '#7B1FA2', icon: 'R' },
          ]).map((ciclo) => {
            const progreso = ciclo.key !== 'resumen' ? calcularProgresoPorFase(ciclo.key as Exclude<FasePHVA, 'resumen'>) : null;
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
                {progreso && (
                  <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                    {progreso.porcentaje}%
                  </Badge>
                )}
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
                    className={`hover-elevate cursor-pointer transition-all${paso.codigo === 'H06' ? ' border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}
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

            {ciclo.key === 'hacer' && (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 px-1">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Registros Operativos del Conductor
                </p>
                <Link href={`/pesv/evaluacion/${id}/encuesta-conductor`}>
                  <Card
                    className="hover-elevate cursor-pointer border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
                    data-testid="card-encuesta-conductor"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-emerald-700 border-emerald-400 dark:text-emerald-400 dark:border-emerald-700">
                              H06+
                            </Badge>
                            <CardTitle className="text-base">Encuesta Diaria del Conductor</CardTitle>
                          </div>
                          <CardDescription className="mt-1">
                            Auto-reporte del estado físico y mental del conductor antes de cada jornada · Art. 18, Res. 40595/2022
                          </CardDescription>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            )}
          </TabsContent>
          );
        })}

        <TabsContent value="resumen" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Resumen General - 24 Pasos PESV
              </CardTitle>
              <CardDescription>
                Vista consolidada del estado de todos los pasos de la evaluación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resumenLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {resumenVerificacion?.totalGeneral && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold text-green-600">{resumenVerificacion.totalGeneral.criteriosVerificados}</p>
                          <p className="text-xs text-muted-foreground">Criterios Verificados</p>
                          <p className="text-xs text-muted-foreground">de {resumenVerificacion.totalGeneral.criterios}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold text-blue-600">{resumenVerificacion.totalGeneral.evidenciasConArchivo}</p>
                          <p className="text-xs text-muted-foreground">Evidencias Adjuntas</p>
                          <p className="text-xs text-muted-foreground">de {resumenVerificacion.totalGeneral.evidencias}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold">{pasosEvaluados}</p>
                          <p className="text-xs text-muted-foreground">Pasos Evaluados</p>
                          <p className="text-xs text-muted-foreground">de {totalPasos}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold" style={{ color: (evaluacion?.porcentajeCumplimiento || 0) >= 80 ? '#28a745' : (evaluacion?.porcentajeCumplimiento || 0) >= 60 ? '#FF9800' : '#D32F2F' }}>
                            {evaluacion?.porcentajeCumplimiento || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Cumplimiento</p>
                          <p className="text-xs text-muted-foreground">{evaluacion?.puntajeTotal || 0}/{evaluacion?.puntajeMaximo || 0} pts</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {(['planear', 'hacer', 'verificar', 'actuar'] as const).map(fase => {
                    const faseConfig = {
                      planear: { nombre: 'PLANEAR', color: '#2196F3', icon: 'P' },
                      hacer: { nombre: 'HACER', color: '#4CAF50', icon: 'H' },
                      verificar: { nombre: 'VERIFICAR', color: '#FFEB3B', textColor: '#333', icon: 'V' },
                      actuar: { nombre: 'ACTUAR', color: '#D32F2F', icon: 'A' },
                    }[fase];
                    const pasosFase = pasos.filter(p => p.fase === fase);
                    return (
                      <div key={fase} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            style={{ backgroundColor: faseConfig.color, color: faseConfig.textColor || 'white' }}
                          >
                            {faseConfig.icon}
                          </div>
                          <h3 className="font-semibold text-sm">{faseConfig.nombre} ({pasosFase.length} pasos)</h3>
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left p-2 font-medium w-16">Código</th>
                                <th className="text-left p-2 font-medium">Paso</th>
                                <th className="text-center p-2 font-medium w-20">Estado</th>
                                <th className="text-center p-2 font-medium w-20">Puntaje</th>
                                <th className="text-center p-2 font-medium w-24">Criterios</th>
                                <th className="text-center p-2 font-medium w-24">Evidencias</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pasosFase.map((paso, idx) => {
                                const respuesta = respuestas.find(r => r.pasoId === paso.codigo);
                                const resumenPaso = resumenVerificacion?.pasos?.[paso.codigo];
                                const critVerif = resumenPaso?.criteriosVerificados || 0;
                                const critTotal = resumenPaso?.totalCriterios || 0;
                                const evidAdj = resumenPaso?.evidenciasConArchivo || 0;
                                const evidTotal = resumenPaso?.totalEvidencias || 0;
                                return (
                                  <tr
                                    key={paso.codigo}
                                    className={`border-t cursor-pointer hover-elevate ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                                    onClick={() => {
                                      handlePasoClick(paso);
                                    }}
                                    data-testid={`resumen-row-${paso.codigo}`}
                                  >
                                    <td className="p-2 font-mono text-xs font-medium">{paso.codigo}</td>
                                    <td className="p-2 text-xs">{paso.nombre}</td>
                                    <td className="p-2 text-center">{getEstadoBadge(paso)}</td>
                                    <td className="p-2 text-center text-xs font-mono">
                                      {respuesta?.cumple === 1 ? paso.puntajeMaximo : 0}/{paso.puntajeMaximo}
                                    </td>
                                    <td className="p-2 text-center">
                                      {critTotal > 0 ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className={`text-xs font-medium ${critVerif === critTotal ? 'text-green-600' : ''}`}>
                                            {critVerif}/{critTotal}
                                          </span>
                                          <Progress value={critTotal > 0 ? (critVerif / critTotal) * 100 : 0} className="h-1 w-14" />
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {evidTotal > 0 ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className={`text-xs font-medium ${evidAdj === evidTotal ? 'text-green-600' : ''}`}>
                                            {evidAdj}/{evidTotal}
                                          </span>
                                          <Progress value={evidTotal > 0 ? (evidAdj / evidTotal) * 100 : 0} className="h-1 w-14" />
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RespuestaDialog
        open={respuestaDialogOpen}
        onClose={() => setRespuestaDialogOpen(false)}
        paso={selectedPaso}
        evaluacionId={id || ""}
        evaluacion={evaluacion}
        respuestas={respuestas}
        companyChapter={companyChapter || ""}
        onSaved={setSelectedFase}
        toast={toast}
      />

      <AlertDialog open={finalizarDialogOpen} onOpenChange={setFinalizarDialogOpen}>
        <AlertDialogContent data-testid="dialog-finalizar-evaluacion">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Finalizar Evaluación PESV
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {progresoPasos < 100 ? (
                <>
                  <span className="font-semibold text-amber-600">Atención:</span> Solo ha evaluado {progresoPasos}% de los pasos ({pasosEvaluados} de {totalPasos}).
                  <br /><br />
                  ¿Está seguro de que desea finalizar la evaluación con pasos pendientes? Los pasos no evaluados contarán como "No Cumple" (0 puntos).
                </>
              ) : (
                <>
                  Ha completado la evaluación de todos los pasos. Al finalizar:
                  <br /><br />
                  <ul className="list-disc pl-5 space-y-1">
                    <li>La evaluación quedará bloqueada para edición</li>
                    <li>Podrá generar el reporte para Supertransporte/RUNT</li>
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
    </div>
  );
}

export default function DetalleEvaluacionPesv() {
  return (
    <PesvErrorBoundary>
      <DetalleEvaluacionPesvInner />
    </PesvErrorBoundary>
  );
}
