import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, Shield, Plus, Eye, Calendar, ClipboardCheck, ExternalLink, Search, FileDown, Zap, Lightbulb } from "lucide-react";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { EvaluacionPesv, AccionMejoraPesv } from "@shared/schema";
import { PASOS_PESV } from "@/data/pasos-pesv";

interface RespuestaPesv {
  id: string;
  pasoId: string;
  cumple: number | null;
  noAplica: number | null;
  hallazgo: string | null;
  observaciones: string | null;
}

interface AutoFillSource {
  field: string;
  source: string;
  label: string;
}

function AutoFillBadge({ source, label }: { source: string; label: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    hallazgo: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    usuario: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
    auto: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
    evaluacion: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  };
  const c = config[source] || config.auto;
  return (
    <Badge className={`${c.bg} ${c.text} text-[10px] px-1.5 py-0 ml-1 no-default-active-elevate`} data-testid={`badge-autofill-${source}`}>
      <Zap className="h-2.5 w-2.5 mr-0.5" />
      {label}
    </Badge>
  );
}

const TIPO_ACCION_OPTIONS = [
  { value: "correctiva", label: "Correctiva" },
  { value: "preventiva", label: "Preventiva" },
  { value: "mejora", label: "Mejora" },
];

const PRIORIDAD_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Critica" },
];

const FUENTE_HALLAZGO_OPTIONS = [
  { value: "auditoria", label: "Auditoría" },
  { value: "indicador", label: "Indicador" },
  { value: "siniestro", label: "Siniestro" },
  { value: "inspeccion", label: "Inspección" },
  { value: "revision_direccion", label: "Revisión por la Dirección" },
];

const ESTADO_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "completada", label: "Completada" },
  { value: "verificada", label: "Verificada" },
];

function getTipoAccionBadge(tipo: string | null) {
  const config: Record<string, { label: string; className: string }> = {
    correctiva: { label: "Correctiva", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    preventiva: { label: "Preventiva", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    mejora: { label: "Mejora", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  };
  const c = config[tipo || ""] || { label: tipo || "N/A", className: "" };
  return <Badge className={c.className} data-testid={`badge-tipo-${tipo}`}>{c.label}</Badge>;
}

function getPrioridadBadge(prioridad: string | null) {
  const config: Record<string, { label: string; className: string }> = {
    baja: { label: "Baja", className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300" },
    media: { label: "Media", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    alta: { label: "Alta", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    critica: { label: "Critica", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  };
  const c = config[prioridad || ""] || { label: prioridad || "N/A", className: "" };
  return <Badge className={c.className} data-testid={`badge-prioridad-${prioridad}`}>{c.label}</Badge>;
}

function getEstadoBadge(estado: string | null) {
  const config: Record<string, { label: string; className: string }> = {
    pendiente: { label: "Pendiente", className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300" },
    en_proceso: { label: "En Proceso", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    completada: { label: "Completada", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    verificada: { label: "Verificada", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  };
  const c = config[estado || ""] || { label: estado || "N/A", className: "" };
  return <Badge className={c.className} data-testid={`badge-estado-${estado}`}>{c.label}</Badge>;
}

function getFuenteLabel(fuente: string | null) {
  const labels: Record<string, string> = {
    auditoria: "Auditoría",
    indicador: "Indicador",
    siniestro: "Siniestro",
    inspeccion: "Inspección",
    revision_direccion: "Revisión por la Dirección",
  };
  return labels[fuente || ""] || fuente || "N/A";
}

export default function PesvMejoraContinua() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAccion, setSelectedAccion] = useState<AccionMejoraPesv | null>(null);
  const [estadoUpdate, setEstadoUpdate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoFillSources, setAutoFillSources] = useState<AutoFillSource[]>([]);
  const [formData, setFormData] = useState({
    descripcion: "",
    tipoAccion: "correctiva",
    prioridad: "media",
    fuenteHallazgo: "",
    responsable: "",
    fechaLimite: "",
    observaciones: "",
  });

  const { data: evaluacion, isLoading: evaluacionLoading } = useQuery<EvaluacionPesv>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar evaluación");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const { data: acciones = [], isLoading: accionesLoading } = useQuery<AccionMejoraPesv[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "acciones"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/acciones`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar acciones de mejora");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const { data: respuestasPesv = [] } = useQuery<RespuestaPesv[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "respuestas"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/respuestas`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const hallazgosNoCumple = respuestasPesv
    .filter((r) => r.cumple === 0 && !r.noAplica)
    .map((r) => {
      const paso = PASOS_PESV.find((p) => p.codigo === r.pasoId);
      return {
        pasoId: r.pasoId,
        pasoNombre: paso?.nombre || r.pasoId,
        hallazgo: r.hallazgo || "",
        observaciones: r.observaciones || "",
        fase: paso?.fase || "planear",
      };
    });

  const getDefaultFechaLimite = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const applyAutoFill = useCallback(() => {
    const sources: AutoFillSource[] = [];
    const updates: Partial<typeof formData> = {};

    if (user) {
      const nombre = user.fullName || user.username;
      updates.responsable = nombre;
      sources.push({ field: "responsable", source: "usuario", label: "Usuario activo" });
    }

    updates.fechaLimite = getDefaultFechaLimite();
    sources.push({ field: "fechaLimite", source: "auto", label: "30 dias" });

    setFormData((prev) => ({ ...prev, ...updates }));
    setAutoFillSources(sources);
  }, [user, getDefaultFechaLimite]);

  useEffect(() => {
    if (dialogOpen) {
      applyAutoFill();
    }
  }, [dialogOpen, applyAutoFill]);

  const applyHallazgoSuggestion = (h: typeof hallazgosNoCumple[0]) => {
    const desc = h.hallazgo
      ? `[${h.pasoId}] ${h.hallazgo}`
      : `Acción correctiva para paso ${h.pasoId} - ${h.pasoNombre}`;
    const obs = h.observaciones ? `Hallazgo en ${h.pasoId} (${h.pasoNombre}): ${h.observaciones}` : "";
    
    setFormData((prev) => ({
      ...prev,
      descripcion: desc,
      tipoAccion: "correctiva",
      prioridad: "alta",
      fuenteHallazgo: "auditoria",
      observaciones: obs,
    }));
    setAutoFillSources((prev) => [
      ...prev.filter((s) => !["descripcion", "tipoAccion", "prioridad", "fuenteHallazgo", "observaciones"].includes(s.field)),
      { field: "descripcion", source: "hallazgo", label: `Hallazgo ${h.pasoId}` },
      { field: "tipoAccion", source: "evaluacion", label: "No cumple" },
      { field: "prioridad", source: "evaluacion", label: "No cumple" },
      { field: "fuenteHallazgo", source: "evaluacion", label: "Evaluacion" },
      ...(obs ? [{ field: "observaciones", source: "hallazgo", label: `Paso ${h.pasoId}` }] : []),
    ]);
  };

  const getAutoFillBadge = (field: string) => {
    const src = autoFillSources.find((s) => s.field === field);
    if (!src) return null;
    return <AutoFillBadge source={src.source} label={src.label} />;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: Record<string, unknown> = {
        descripcion: data.descripcion,
        tipoAccion: data.tipoAccion,
        prioridad: data.prioridad,
        responsable: data.responsable || null,
        observaciones: data.observaciones || null,
        fuenteHallazgo: data.fuenteHallazgo || null,
        fechaLimite: data.fechaLimite || null,
      };
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/acciones`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "acciones"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Acción registrada",
        description: "La acción de mejora se ha registrado exitosamente",
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

  const updateEstadoMutation = useMutation({
    mutationFn: async ({ accionId, estado }: { accionId: string; estado: string }) => {
      const res = await apiRequest("PATCH", `/api/evaluaciones-pesv/${evaluacionId}/acciones/${accionId}`, { estado });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "acciones"] });
      setDetailDialogOpen(false);
      setSelectedAccion(null);
      toast({
        title: "Estado actualizado",
        description: "El estado de la acción se ha actualizado exitosamente",
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

  const resetForm = () => {
    setFormData({
      descripcion: "",
      tipoAccion: "correctiva",
      prioridad: "media",
      fuenteHallazgo: "",
      responsable: "",
      fechaLimite: "",
      observaciones: "",
    });
    setAutoFillSources([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion.trim()) {
      toast({ title: "Error", description: "La descripción es requerida", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleRowClick = (accion: AccionMejoraPesv) => {
    setSelectedAccion(accion);
    setEstadoUpdate(accion.estado || "pendiente");
    setDetailDialogOpen(true);
  };

  const handleEstadoUpdate = () => {
    if (selectedAccion) {
      updateEstadoMutation.mutate({ accionId: selectedAccion.id, estado: estadoUpdate });
    }
  };

  const filteredAcciones = acciones.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.descripcion || "").toLowerCase().includes(term) ||
      (a.responsable || "").toLowerCase().includes(term) ||
      (a.tipoAccion || "").toLowerCase().includes(term) ||
      (a.estado || "").toLowerCase().includes(term)
    );
  });

  const stats = {
    total: acciones.length,
    pendientes: acciones.filter((a) => a.estado === "pendiente").length,
    enProceso: acciones.filter((a) => a.estado === "en_proceso").length,
    completadas: acciones.filter((a) => a.estado === "completada" || a.estado === "verificada").length,
  };

  const isLoading = evaluacionLoading || accionesLoading;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Mejora Continua"
        currentPhase="actuar"
        isLoading={evaluacionLoading}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <HelpVideoButton customRoute="/pesv/mejora-continua" testId="button-help-video-pesv-mejora" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPdf(`/api/evaluaciones-pesv/${evaluacionId}/acciones-mejora/pdf`, 'acciones-mejora-pesv.pdf')}
          data-testid="button-download-acciones-mejora-pdf"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
        <BackToPesvEvaluationButton />
      </div>

      <TrazabilidadPesvBanner codigoPaso="A01" compacto />

      <Card className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium">Trazabilidad SST</p>
                <p className="text-xs text-muted-foreground">
                  Decreto 1072/2015 Art. 2.2.4.6.33 - Acciones preventivas y correctivas del SG-SST
                </p>
              </div>
            </div>
            <Link href="/plan-mejoramiento-contexto">
              <Button variant="outline" size="sm" data-testid="button-link-plan-mejoramiento">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Plan de Mejoramiento SST
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card data-testid="card-stat-total">
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Acciones</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="text-stat-total">{stats.total}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-pendientes">
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-muted-foreground">Pendientes</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="text-stat-pendientes">{stats.pendientes}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-en-proceso">
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">En Proceso</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="text-stat-en-proceso">{stats.enProceso}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-completadas">
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Completadas</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="text-stat-completadas">{stats.completadas}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <CardTitle>Acciones de Mejora Continua</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar acciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-60"
                    data-testid="input-search-acciones"
                  />
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-accion">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Acción
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        Registrar Acción de Mejora
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px] no-default-active-elevate" data-testid="badge-smart-form">
                          <Zap className="h-2.5 w-2.5 mr-0.5" />
                          Smart Form
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        Formulario inteligente con auto-llenado y trazabilidad PESV
                      </DialogDescription>
                    </DialogHeader>

                    {hallazgosNoCumple.length > 0 && (
                      <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-2" data-testid="section-hallazgos-sugeridos">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium">Sugerencias desde evaluación ({hallazgosNoCumple.length} hallazgos)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {hallazgosNoCumple.map((h) => (
                            <Button
                              key={h.pasoId}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => applyHallazgoSuggestion(h)}
                              className="text-xs"
                              data-testid={`button-sugerencia-${h.pasoId}`}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                              {h.pasoId} - {h.pasoNombre.length > 25 ? h.pasoNombre.substring(0, 25) + "..." : h.pasoNombre}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center flex-wrap gap-1">
                          <Label htmlFor="descripcion">Descripción *</Label>
                          {getAutoFillBadge("descripcion")}
                        </div>
                        <Textarea
                          id="descripcion"
                          value={formData.descripcion}
                          onChange={(e) => {
                            setFormData({ ...formData, descripcion: e.target.value });
                            setAutoFillSources((prev) => prev.filter((s) => s.field !== "descripcion"));
                          }}
                          placeholder="Describa la acción de mejora..."
                          required
                          data-testid="textarea-descripcion"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center flex-wrap gap-1">
                            <Label htmlFor="tipoAccion">Tipo de Acción</Label>
                            {getAutoFillBadge("tipoAccion")}
                          </div>
                          <Select
                            value={formData.tipoAccion}
                            onValueChange={(value) => {
                              setFormData({ ...formData, tipoAccion: value });
                              setAutoFillSources((prev) => prev.filter((s) => s.field !== "tipoAccion"));
                            }}
                          >
                            <SelectTrigger data-testid="select-tipo-accion">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPO_ACCION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center flex-wrap gap-1">
                            <Label htmlFor="prioridad">Prioridad</Label>
                            {getAutoFillBadge("prioridad")}
                          </div>
                          <Select
                            value={formData.prioridad}
                            onValueChange={(value) => {
                              setFormData({ ...formData, prioridad: value });
                              setAutoFillSources((prev) => prev.filter((s) => s.field !== "prioridad"));
                            }}
                          >
                            <SelectTrigger data-testid="select-prioridad">
                              <SelectValue placeholder="Seleccione prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORIDAD_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center flex-wrap gap-1">
                          <Label htmlFor="fuenteHallazgo">Fuente del Hallazgo</Label>
                          {getAutoFillBadge("fuenteHallazgo")}
                        </div>
                        <Select
                          value={formData.fuenteHallazgo}
                          onValueChange={(value) => {
                            setFormData({ ...formData, fuenteHallazgo: value });
                            setAutoFillSources((prev) => prev.filter((s) => s.field !== "fuenteHallazgo"));
                          }}
                        >
                          <SelectTrigger data-testid="select-fuente-hallazgo">
                            <SelectValue placeholder="Seleccione fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            {FUENTE_HALLAZGO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center flex-wrap gap-1">
                            <Label htmlFor="responsable">Responsable</Label>
                            {getAutoFillBadge("responsable")}
                          </div>
                          <Input
                            id="responsable"
                            value={formData.responsable}
                            onChange={(e) => {
                              setFormData({ ...formData, responsable: e.target.value });
                              setAutoFillSources((prev) => prev.filter((s) => s.field !== "responsable"));
                            }}
                            placeholder="Nombre del responsable"
                            data-testid="input-responsable"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center flex-wrap gap-1">
                            <Label htmlFor="fechaLimite">Fecha Limite</Label>
                            {getAutoFillBadge("fechaLimite")}
                          </div>
                          <Input
                            id="fechaLimite"
                            type="date"
                            value={formData.fechaLimite}
                            onChange={(e) => {
                              setFormData({ ...formData, fechaLimite: e.target.value });
                              setAutoFillSources((prev) => prev.filter((s) => s.field !== "fechaLimite"));
                            }}
                            data-testid="input-fecha-limite"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center flex-wrap gap-1">
                          <Label htmlFor="observaciones">Observaciones</Label>
                          {getAutoFillBadge("observaciones")}
                        </div>
                        <Textarea
                          id="observaciones"
                          value={formData.observaciones}
                          onChange={(e) => {
                            setFormData({ ...formData, observaciones: e.target.value });
                            setAutoFillSources((prev) => prev.filter((s) => s.field !== "observaciones"));
                          }}
                          placeholder="Observaciones adicionales (opcional)"
                          data-testid="textarea-observaciones"
                        />
                      </div>

                      {autoFillSources.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1" data-testid="text-autofill-info">
                          <Zap className="h-3 w-3" />
                          <span>Campos auto-completados con trazabilidad. Puede modificarlos manualmente.</span>
                        </div>
                      )}

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          data-testid="button-cancel-create"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          data-testid="button-submit-accion"
                        >
                          {createMutation.isPending ? "Guardando..." : "Registrar Acción"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAcciones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-state">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No hay acciones de mejora registradas</p>
                  <p className="text-sm mt-1">Registre la primera acción de mejora continua</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Fuente</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead>Fecha Limite</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAcciones.map((accion) => (
                        <TableRow
                          key={accion.id}
                          className="cursor-pointer"
                          onClick={() => handleRowClick(accion)}
                          data-testid={`row-accion-${accion.id}`}
                        >
                          <TableCell className="max-w-xs truncate" data-testid={`text-descripcion-${accion.id}`}>
                            {accion.descripcion}
                          </TableCell>
                          <TableCell>{getTipoAccionBadge(accion.tipoAccion)}</TableCell>
                          <TableCell>{getPrioridadBadge(accion.prioridad)}</TableCell>
                          <TableCell className="text-sm">{getFuenteLabel(accion.fuenteHallazgo)}</TableCell>
                          <TableCell className="text-sm" data-testid={`text-responsable-${accion.id}`}>
                            {accion.responsable || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {accion.fechaLimite ? new Date(accion.fechaLimite).toLocaleDateString("es-CO") : "Sin fecha"}
                          </TableCell>
                          <TableCell>{getEstadoBadge(accion.estado)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(accion);
                              }}
                              data-testid={`button-view-accion-${accion.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Acción de Mejora</DialogTitle>
            <DialogDescription>
              Revise y actualice el estado de la acción
            </DialogDescription>
          </DialogHeader>
          {selectedAccion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Descripción</Label>
                <p className="text-sm" data-testid="text-detail-descripcion">{selectedAccion.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Tipo de Acción</Label>
                  <div>{getTipoAccionBadge(selectedAccion.tipoAccion)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Prioridad</Label>
                  <div>{getPrioridadBadge(selectedAccion.prioridad)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Fuente del Hallazgo</Label>
                  <p className="text-sm">{getFuenteLabel(selectedAccion.fuenteHallazgo)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Responsable</Label>
                  <p className="text-sm">{selectedAccion.responsable || "Sin asignar"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Fecha Limite</Label>
                  <p className="text-sm">
                    {selectedAccion.fechaLimite
                      ? new Date(selectedAccion.fechaLimite).toLocaleDateString("es-CO")
                      : "Sin fecha"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Estado Actual</Label>
                  <div>{getEstadoBadge(selectedAccion.estado)}</div>
                </div>
              </div>

              {selectedAccion.observaciones && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Observaciones</Label>
                  <p className="text-sm">{selectedAccion.observaciones}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="estadoUpdate">Actualizar Estado</Label>
                <Select
                  value={estadoUpdate}
                  onValueChange={setEstadoUpdate}
                >
                  <SelectTrigger data-testid="select-update-estado">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDetailDialogOpen(false)}
                  data-testid="button-close-detail"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={handleEstadoUpdate}
                  disabled={updateEstadoMutation.isPending || estadoUpdate === selectedAccion.estado}
                  data-testid="button-update-estado"
                >
                  {updateEstadoMutation.isPending ? "Actualizando..." : "Actualizar Estado"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
