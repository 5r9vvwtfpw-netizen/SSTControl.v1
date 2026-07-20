import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Calendar, CheckCircle2, Plus, Eye, ClipboardCheck, ExternalLink, Building2, Shield, FileDown, ChevronDown, ChevronRight, Link2, ArrowRight, AlertTriangle, Loader2, Trash2, TrendingUp, BookOpen, Activity, GraduationCap, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EvaluacionPesv, RevisionDireccionPesv, RevisionDireccion, DecisionRevisionPesv } from "@shared/schema";

interface ResumenRevision {
  indicadores: { cumplimientoPct: number | null; pasosCumplen: number; totalRespondidos: number };
  accionesMejora: { pendiente: number; en_proceso: number; completada: number; total: number };
  auditorias: { total: number; cerradas: number; promedioCompliancePct: number | null; hallazgosCriticos: number; hallazgosMenores: number };
  capacitaciones: { realizadas: number; programadas: number; canceladas: number; total: number };
  riesgosViales: { total: number };
  anio: number;
}

const TEMAS_REVISADOS = [
  { key: "revisionIndicadores", label: "Indicadores de desempeño", resumenKey: "resumenIndicadores" },
  { key: "revisionAuditorias", label: "Resultados de auditorías", resumenKey: "resumenAuditorias" },
  { key: "revisionSiniestros", label: "Investigación de siniestros", resumenKey: "resumenSiniestros" },
  { key: "revisionAccionesMejora", label: "Acciones de mejora", resumenKey: "resumenAccionesMejora" },
  { key: "revisionCumplimientoLegal", label: "Cumplimiento legal", resumenKey: null },
  { key: "revisionRecursos", label: "Recursos asignados", resumenKey: null },
  { key: "revisionCapacitaciones", label: "Capacitaciones realizadas", resumenKey: null },
  { key: "revisionInspecciones", label: "Inspecciones de seguridad vial", resumenKey: null },
] as const;

type TemaKey = typeof TEMAS_REVISADOS[number]["key"];

const TIPO_DECISION_OPTIONS = [
  { value: "accion_correctiva", label: "Acción Correctiva" },
  { value: "accion_preventiva", label: "Acción Preventiva" },
  { value: "mejora", label: "Mejora" },
  { value: "recurso", label: "Asignación de Recurso" },
  { value: "cambio_politica", label: "Cambio de Política" },
  { value: "otro", label: "Otro" },
];

const PRIORIDAD_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const ESTADO_DECISION_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "completada", label: "Completada" },
];

interface FormData {
  codigo: string;
  fechaRevision: string;
  presididaPor: string;
  participantes: string;
  revisionIndicadores: number;
  revisionAuditorias: number;
  revisionSiniestros: number;
  revisionAccionesMejora: number;
  revisionCumplimientoLegal: number;
  revisionRecursos: number;
  revisionCapacitaciones: number;
  revisionInspecciones: number;
  resumenIndicadores: string;
  resumenAuditorias: string;
  resumenSiniestros: string;
  resumenAccionesMejora: string;
  analisisGeneral: string;
  estado: string;
  fechaProximaRevision: string;
  vinculacionRevisionSstId: string;
}

interface DecisionFormData {
  tipo: string;
  descripcion: string;
  responsable: string;
  fechaLimite: string;
  prioridad: string;
  estado: string;
  generaAccionA01: number;
}

const initialFormData: FormData = {
  codigo: "",
  fechaRevision: "",
  presididaPor: "",
  participantes: "",
  revisionIndicadores: 0,
  revisionAuditorias: 0,
  revisionSiniestros: 0,
  revisionAccionesMejora: 0,
  revisionCumplimientoLegal: 0,
  revisionRecursos: 0,
  revisionCapacitaciones: 0,
  revisionInspecciones: 0,
  resumenIndicadores: "",
  resumenAuditorias: "",
  resumenSiniestros: "",
  resumenAccionesMejora: "",
  analisisGeneral: "",
  estado: "borrador",
  fechaProximaRevision: "",
  vinculacionRevisionSstId: "",
};

const initialDecisionForm: DecisionFormData = {
  tipo: "mejora",
  descripcion: "",
  responsable: "",
  fechaLimite: "",
  prioridad: "media",
  estado: "pendiente",
  generaAccionA01: 0,
};

function getEstadoBadge(estado: string) {
  if (estado === "aprobada") return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Aprobada</Badge>;
  if (estado === "cerrada") return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Cerrada</Badge>;
  return <Badge variant="secondary">Borrador</Badge>;
}

function getTipoBadge(tipo: string) {
  const map: Record<string, { label: string; cls: string }> = {
    accion_correctiva: { label: "Correctiva", cls: "bg-red-500/10 text-red-700 dark:text-red-400" },
    accion_preventiva: { label: "Preventiva", cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    mejora: { label: "Mejora", cls: "bg-green-500/10 text-green-700 dark:text-green-400" },
    recurso: { label: "Recurso", cls: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    cambio_politica: { label: "Cambio Política", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    otro: { label: "Otro", cls: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
  };
  const c = map[tipo] || map.otro;
  return <Badge className={c.cls}>{c.label}</Badge>;
}

function getPrioridadBadge(prioridad: string) {
  const map: Record<string, string> = {
    baja: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    media: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    alta: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    critica: "bg-red-500/10 text-red-700 dark:text-red-400",
  };
  return <Badge className={map[prioridad] || ""}>{prioridad}</Badge>;
}

function getEstadoDecisionBadge(estado: string) {
  const map: Record<string, string> = {
    pendiente: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    en_proceso: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    completada: "bg-green-500/10 text-green-700 dark:text-green-400",
  };
  const labels: Record<string, string> = { pendiente: "Pendiente", en_proceso: "En Proceso", completada: "Completada" };
  return <Badge className={map[estado] || ""}>{labels[estado] || estado}</Badge>;
}

function DecisionItem({
  decision,
  revisionId,
  evaluacionId,
}: {
  decision: DecisionRevisionPesv;
  revisionId: string;
  evaluacionId: string;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editEstado, setEditEstado] = useState(decision.estado || "pendiente");

  const updateMutation = useMutation({
    mutationFn: async (estado: string) => {
      const res = await apiRequest("PATCH", `/api/pesv/revisiones-direccion/${revisionId}/decisiones/${decision.id}`, { estado });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/revisiones-direccion", revisionId, "decisiones"] });
      toast({ title: "Estado actualizado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/pesv/revisiones-direccion/${revisionId}/decisiones/${decision.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/revisiones-direccion", revisionId, "decisiones"] });
      toast({ title: "Decisión eliminada" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md p-3">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer hover-elevate rounded-md p-1 -m-1">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
            {getTipoBadge(decision.tipo || "otro")}
            <span className="text-sm font-medium line-clamp-1">{decision.descripcion}</span>
          </div>
          <div className="flex items-center gap-2">
            {decision.accionMejoraId && (
              <Badge className="bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs gap-1">
                <Link2 className="h-3 w-3" />A01
              </Badge>
            )}
            {getEstadoDecisionBadge(decision.estado || "pendiente")}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Responsable:</span> {decision.responsable || "—"}</div>
          <div><span className="text-muted-foreground">Fecha límite:</span> {decision.fechaLimite || "—"}</div>
          <div><span className="text-muted-foreground">Prioridad:</span> {getPrioridadBadge(decision.prioridad || "media")}</div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Genera A01:</span>
            {decision.accionMejoraId
              ? <Badge className="bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Acción creada</Badge>
              : <Badge variant="outline" className="text-xs">No</Badge>
            }
          </div>
        </div>
        <div className="flex items-end gap-2 pt-1 border-t">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Actualizar estado</Label>
            <Select value={editEstado} onValueChange={setEditEstado}>
              <SelectTrigger className="h-8 text-xs" data-testid={`select-estado-decision-${decision.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_DECISION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            disabled={updateMutation.isPending || editEstado === decision.estado}
            onClick={() => updateMutation.mutate(editEstado)}
            data-testid={`button-save-estado-decision-${decision.id}`}
          >
            {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Guardar"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            data-testid={`button-delete-decision-${decision.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function PesvRevisionDireccion() {
  const params = useParams<{ evaluacionId: string }>();
  // Cuando se navega desde el flujo PESV normal (/pesv/revision-direccion),
  // no hay :evaluacionId en la URL — se lee del sessionStorage igual que otros módulos PESV.
  const evaluacionId: string | undefined =
    params.evaluacionId ||
    (() => { try { return sessionStorage.getItem("active_pesv_evaluacion_id") || undefined; } catch { return undefined; } })();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionDireccionPesv | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [decisionForm, setDecisionForm] = useState<DecisionFormData>(initialDecisionForm);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [destinatarioPesvOpen, setDestinatarioPesvOpen] = useState(false);
  const [selectedDestinatarioPesv, setSelectedDestinatarioPesv] = useState<'ansv' | 'arl' | 'supertransporte' | 'mintransporte' | 'interno' | 'custom'>('ansv');
  const [customDestinatarioPesv, setCustomDestinatarioPesv] = useState('');

  const { data: evaluacion, isLoading: evaluacionLoading } = useQuery<EvaluacionPesv>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar evaluación");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  // Resumen de datos reales para mostrar contexto en el formulario
  const { data: resumenDatos } = useQuery<ResumenRevision>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "resumen-revision"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/resumen-revision`, { credentials: "include" });
      if (!res.ok) return null as any;
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const { data: company } = useQuery<{ legalRepName?: string; legalRepPosition?: string }>({
    queryKey: ["/api/companies", evaluacion?.companyId],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${evaluacion!.companyId}`, { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !!evaluacion?.companyId,
  });

  const { data: revisiones = [], isLoading: revisionesLoading } = useQuery<RevisionDireccionPesv[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "revisiones-direccion"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/revisiones-direccion`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar revisiones");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  // Revisiones SST para vinculación
  const { data: revisionesSst = [] } = useQuery<RevisionDireccion[]>({
    queryKey: ["/api/revisiones-direccion"],
    queryFn: async () => {
      const res = await fetch(`/api/revisiones-direccion`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Decisiones de la revisión seleccionada
  const { data: decisiones = [], isLoading: decisionesLoading } = useQuery<DecisionRevisionPesv[]>({
    queryKey: ["/api/pesv/revisiones-direccion", selectedRevision?.id, "decisiones"],
    queryFn: async () => {
      const res = await fetch(`/api/pesv/revisiones-direccion/${selectedRevision!.id}/decisiones`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar decisiones");
      return res.json();
    },
    enabled: !!selectedRevision?.id && detailDialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        evaluacionPesvId: evaluacionId,
        fechaRevision: data.fechaRevision || undefined,
        fechaProximaRevision: data.fechaProximaRevision || undefined,
        vinculacionRevisionSstId: data.vinculacionRevisionSstId || null,
      };
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/revisiones-direccion`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "revisiones-direccion"] });
      setDialogOpen(false);
      setFormData(initialFormData);
      toast({ title: "Revisión registrada", description: "La revisión por la alta dirección se registró exitosamente" });
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const createDecisionMutation = useMutation({
    mutationFn: async (data: DecisionFormData) => {
      const res = await apiRequest("POST", `/api/pesv/revisiones-direccion/${selectedRevision!.id}/decisiones`, {
        ...data,
        fechaLimite: data.fechaLimite || null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/revisiones-direccion", selectedRevision?.id, "decisiones"] });
      if (data.accionMejoraId) {
        queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "acciones"] });
        toast({ title: "Decisión creada", description: "Se generó automáticamente una acción en A01 - Mejora Continua" });
      } else {
        toast({ title: "Decisión creada" });
      }
      setShowDecisionForm(false);
      setDecisionForm(initialDecisionForm);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fechaRevision || !formData.presididaPor) {
      toast({ title: "Campos requeridos", description: "Debe completar la fecha de revisión y quién preside", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleOpenCreate = () => {
    const year = new Date().getFullYear();
    const nextNum = String(revisiones.length + 1).padStart(3, "0");
    setFormData({
      ...initialFormData,
      codigo: `REV-PESV-${year}-${nextNum}`,
      presididaPor: company?.legalRepName || "",
    });
    setDialogOpen(true);
  };

  const handleCheckboxChange = (key: TemaKey, checked: boolean) => {
    setFormData(prev => ({ ...prev, [key]: checked ? 1 : 0 }));
  };

  const temasRevisadosCount = (rev: RevisionDireccionPesv) =>
    TEMAS_REVISADOS.filter(t => (rev as any)[t.key] === 1).length;

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = evaluacionLoading || revisionesLoading;

  const getSstRevisionLabel = (id: string) => {
    const r = revisionesSst.find(r => r.id === id);
    return r ? `${r.codigo} — ${r.titulo}` : id;
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Revisión por la Dirección"
        currentPhase="actuar"
        isLoading={evaluacionLoading}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <HelpVideoButton customRoute="/pesv/revision-direccion" testId="button-help-video-pesv-revision" />
        <Button
          variant="outline"
          onClick={() => { setSelectedDestinatarioPesv('ansv'); setCustomDestinatarioPesv(''); setDestinatarioPesvOpen(true); }}
          data-testid="button-download-evaluation-pdf"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Descargar PDF Evaluación PESV
        </Button>
      </div>

      <TrazabilidadPesvBanner codigoPaso="A02" />

      {/* Trazabilidad SST */}
      <Card className="mt-4 mb-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium">Trazabilidad con SST — Revisiones por la Dirección</p>
                <p className="text-xs text-muted-foreground">
                  Decreto 1072/2015 Art. 2.2.4.6.31 — La revisión PESV se integra con la revisión del SG-SST.
                  Las decisiones de A02 pueden generar acciones automáticas en A01.
                </p>
              </div>
            </div>
            <Link href="/revisiones-direccion">
              <Button variant="outline" size="sm" className="gap-1" data-testid="link-sst-revisiones-direccion">
                <ExternalLink className="h-4 w-4" />
                SST Revisiones por la Dirección
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Marco normativo */}
      <Card className="mb-4 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Marco Normativo Aplicable</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><Badge variant="secondary" className="text-xs mr-1">Res. 40595/2022</Badge>Paso A02 — Revisión por la Alta Dirección del PESV</p>
                <p><Badge variant="secondary" className="text-xs mr-1">ISO 39001:2012</Badge>Cláusula 9.3 — Revisión por la dirección del sistema de gestión de seguridad vial</p>
                <p><Badge variant="secondary" className="text-xs mr-1">Dec. 1072/2015</Badge>Art. 2.2.4.6.31 — Revisión por la alta dirección del SG-SST</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2" data-testid="text-page-title">
            <ClipboardCheck className="h-5 w-5" />
            Revisiones por la Alta Dirección
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} data-testid="button-create-revision">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Revisión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Revisión por la Dirección</DialogTitle>
                <DialogDescription>
                  Conforme a ISO 39001:2012 Cláusula 9.3 y Res. 40595/2022 Paso A02
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={e => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                      data-testid="input-codigo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaRevision">Fecha de Revisión *</Label>
                    <Input
                      id="fechaRevision"
                      type="date"
                      value={formData.fechaRevision}
                      onChange={e => setFormData(prev => ({ ...prev, fechaRevision: e.target.value }))}
                      required
                      data-testid="input-fecha-revision"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presididaPor">Presidida por *</Label>
                  <Input
                    id="presididaPor"
                    value={formData.presididaPor}
                    onChange={e => setFormData(prev => ({ ...prev, presididaPor: e.target.value }))}
                    placeholder="Nombre del directivo que preside la revisión"
                    required
                    data-testid="input-presidida-por"
                  />
                  {company?.legalRepName && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Auto-completado con el representante legal registrado. Puede editarlo si preside otra persona.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participantes">Participantes</Label>
                  <Textarea
                    id="participantes"
                    value={formData.participantes}
                    onChange={e => setFormData(prev => ({ ...prev, participantes: e.target.value }))}
                    placeholder="Liste los participantes de la revisión"
                    data-testid="input-participantes"
                  />
                </div>

                {/* Vinculación con revisión SST */}
                <div className="space-y-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <Label className="font-medium">Vincular con Revisión SST</Label>
                    <Badge variant="outline" className="text-xs">Trazabilidad</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecciona la revisión del SG-SST que corresponde a esta revisión PESV para mantener trazabilidad bidireccional.
                  </p>
                  <Select
                    value={formData.vinculacionRevisionSstId || "__none__"}
                    onValueChange={val => setFormData(prev => ({ ...prev, vinculacionRevisionSstId: val === "__none__" ? "" : val }))}
                  >
                    <SelectTrigger data-testid="select-vinculacion-sst">
                      <SelectValue placeholder="Sin vinculación (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sin vinculación (opcional)</SelectItem>
                      {revisionesSst.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.codigo} — {r.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temas revisados con datos contextuales */}
                <div className="space-y-3">
                  <Label className="font-medium">Temas Revisados</Label>
                  <p className="text-xs text-muted-foreground -mt-1">Al marcar un tema, verá los datos actuales del sistema para ayudarle a redactar el resumen.</p>
                  <div className="space-y-3">
                    {TEMAS_REVISADOS.map(tema => (
                      <div key={tema.key} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={tema.key}
                            checked={formData[tema.key] === 1}
                            onCheckedChange={checked => handleCheckboxChange(tema.key, !!checked)}
                            data-testid={`checkbox-${tema.key}`}
                          />
                          <Label htmlFor={tema.key} className="text-sm cursor-pointer font-normal">{tema.label}</Label>
                        </div>
                        {formData[tema.key] === 1 && (
                          <div className="ml-6 space-y-2">
                            {/* Panel de datos reales del sistema */}
                            {resumenDatos && tema.key === "revisionIndicadores" && (
                              <div className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 px-3 py-2 text-xs space-y-1">
                                <p className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Datos actuales del sistema ({resumenDatos.anio})</p>
                                {resumenDatos.indicadores.cumplimientoPct !== null ? (
                                  <div className="flex flex-wrap gap-3">
                                    <span className="text-muted-foreground">Cumplimiento PESV: <strong className="text-foreground">{resumenDatos.indicadores.cumplimientoPct}%</strong></span>
                                    <span className="text-muted-foreground">Pasos cumplidos: <strong className="text-foreground">{resumenDatos.indicadores.pasosCumplen} / {resumenDatos.indicadores.totalRespondidos}</strong></span>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">Sin respuestas registradas aún en esta evaluación.</p>
                                )}
                              </div>
                            )}
                            {resumenDatos && tema.key === "revisionAuditorias" && (
                              <div className="rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 px-3 py-2 text-xs space-y-1">
                                <p className="font-medium text-purple-800 dark:text-purple-300 flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />Auditorías internas {resumenDatos.anio}</p>
                                {resumenDatos.auditorias.total > 0 ? (
                                  <div className="flex flex-wrap gap-3">
                                    <span className="text-muted-foreground">Total: <strong className="text-foreground">{resumenDatos.auditorias.total}</strong></span>
                                    <span className="text-muted-foreground">Cerradas: <strong className="text-foreground">{resumenDatos.auditorias.cerradas}</strong></span>
                                    {resumenDatos.auditorias.promedioCompliancePct !== null && (
                                      <span className="text-muted-foreground">Cumplimiento promedio: <strong className="text-foreground">{resumenDatos.auditorias.promedioCompliancePct}%</strong></span>
                                    )}
                                    {resumenDatos.auditorias.hallazgosCriticos > 0 && (
                                      <span className="text-orange-700 dark:text-orange-400">NC mayores: <strong>{resumenDatos.auditorias.hallazgosCriticos}</strong></span>
                                    )}
                                    {resumenDatos.auditorias.hallazgosMenores > 0 && (
                                      <span className="text-muted-foreground">NC menores: <strong className="text-foreground">{resumenDatos.auditorias.hallazgosMenores}</strong></span>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">No hay auditorías registradas en este período.</p>
                                )}
                              </div>
                            )}
                            {resumenDatos && tema.key === "revisionSiniestros" && (
                              <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 px-3 py-2 text-xs space-y-1">
                                <p className="font-medium text-red-800 dark:text-red-300 flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" />Siniestros e investigaciones</p>
                                <p className="text-muted-foreground italic">Consulte los registros en H09 - Siniestros Viales y H11 - Atención a Víctimas del módulo PESV para redactar este resumen.</p>
                              </div>
                            )}
                            {resumenDatos && tema.key === "revisionAccionesMejora" && (
                              <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 px-3 py-2 text-xs space-y-1">
                                <p className="font-medium text-green-800 dark:text-green-300 flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Acciones de mejora A01 ({resumenDatos.anio})</p>
                                {resumenDatos.accionesMejora.total > 0 ? (
                                  <div className="flex flex-wrap gap-3">
                                    <span className="text-muted-foreground">Total: <strong className="text-foreground">{resumenDatos.accionesMejora.total}</strong></span>
                                    <span className="text-yellow-700 dark:text-yellow-400">Pendientes: <strong>{resumenDatos.accionesMejora.pendiente}</strong></span>
                                    <span className="text-blue-700 dark:text-blue-400">En proceso: <strong>{resumenDatos.accionesMejora.en_proceso}</strong></span>
                                    <span className="text-green-700 dark:text-green-400">Completadas: <strong>{resumenDatos.accionesMejora.completada}</strong></span>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">No hay acciones de mejora registradas en esta evaluación.</p>
                                )}
                              </div>
                            )}
                            {resumenDatos && tema.key === "revisionCapacitaciones" && (
                              <div className="rounded-md border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 px-3 py-2 text-xs space-y-1">
                                <p className="font-medium text-teal-800 dark:text-teal-300 flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Capacitaciones en seguridad vial ({resumenDatos.anio})</p>
                                {resumenDatos.capacitaciones.total > 0 ? (
                                  <div className="flex flex-wrap gap-3">
                                    <span className="text-muted-foreground">Realizadas: <strong className="text-foreground">{resumenDatos.capacitaciones.realizadas}</strong></span>
                                    <span className="text-muted-foreground">Programadas: <strong className="text-foreground">{resumenDatos.capacitaciones.programadas}</strong></span>
                                    {resumenDatos.capacitaciones.canceladas > 0 && (
                                      <span className="text-red-700 dark:text-red-400">Canceladas: <strong>{resumenDatos.capacitaciones.canceladas}</strong></span>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">No hay capacitaciones registradas en este período.</p>
                                )}
                              </div>
                            )}
                            {/* Textarea para escribir el resumen del tema */}
                            {tema.resumenKey && (
                              <Textarea
                                value={(formData as any)[tema.resumenKey]}
                                onChange={e => setFormData(prev => ({ ...prev, [tema.resumenKey!]: e.target.value }))}
                                placeholder={`Con base en los datos anteriores, describa el análisis de ${tema.label.toLowerCase()}...`}
                                className="text-sm min-h-[60px]"
                                data-testid={`textarea-${tema.resumenKey}`}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analisisGeneral">Análisis General</Label>
                  <Textarea
                    id="analisisGeneral"
                    value={formData.analisisGeneral}
                    onChange={e => setFormData(prev => ({ ...prev, analisisGeneral: e.target.value }))}
                    placeholder="Resumen del análisis general de la revisión"
                    data-testid="input-analisis-general"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={val => setFormData(prev => ({ ...prev, estado: val }))}
                    >
                      <SelectTrigger data-testid="select-estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="cerrada">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaProximaRevision">Fecha Próxima Revisión</Label>
                    <Input
                      id="fechaProximaRevision"
                      type="date"
                      value={formData.fechaProximaRevision}
                      onChange={e => setFormData(prev => ({ ...prev, fechaProximaRevision: e.target.value }))}
                      data-testid="input-fecha-proxima-revision"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-create">Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-revision">
                    {createMutation.isPending ? "Guardando..." : "Registrar Revisión"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : revisiones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay revisiones registradas</p>
              <p className="text-sm">Registre la primera revisión por la alta dirección para esta evaluación PESV</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisiones.map(revision => (
                <Card key={revision.id} className="border" data-testid={`card-revision-${revision.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold" data-testid={`text-codigo-${revision.id}`}>{revision.codigo}</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{revision.fechaRevision}</span>
                        </div>
                        {getEstadoBadge(revision.estado)}
                        {revision.vinculacionRevisionSstId && (
                          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs gap-1">
                            <Link2 className="h-3 w-3" />SST vinculada
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(`/api/evaluaciones-pesv/${evaluacionId}/revisiones-direccion/${revision.id}/pdf`, `revision-direccion-pesv-${revision.codigo}.pdf`)}
                          data-testid={`button-download-revision-pdf-${revision.id}`}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedRevision(revision); setDetailDialogOpen(true); setShowDecisionForm(false); }}
                          data-testid={`button-view-revision-${revision.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Presidida por</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{revision.presididaPor}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Temas revisados</p>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{temasRevisadosCount(revision)} de {TEMAS_REVISADOS.length}</span>
                        </div>
                      </div>
                      {revision.fechaProximaRevision && (
                        <div>
                          <p className="text-muted-foreground mb-1">Próxima revisión</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{revision.fechaProximaRevision}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {revision.vinculacionRevisionSstId && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Link2 className="h-3 w-3 text-amber-600" />
                        Vinculada con SST: {getSstRevisionLabel(revision.vinculacionRevisionSstId)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de detalle con decisiones estructuradas */}
      <Dialog open={detailDialogOpen} onOpenChange={open => { setDetailDialogOpen(open); if (!open) { setSelectedRevision(null); setShowDecisionForm(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {selectedRevision?.codigo}
            </DialogTitle>
            <DialogDescription>
              Detalle y decisiones estructuradas — {selectedRevision?.fechaRevision}
            </DialogDescription>
          </DialogHeader>

          {selectedRevision && (
            <div className="space-y-4">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Presidida por:</span> {selectedRevision.presididaPor}</div>
                <div className="flex items-center gap-1"><span className="text-muted-foreground">Estado:</span> {getEstadoBadge(selectedRevision.estado)}</div>
                {selectedRevision.fechaProximaRevision && (
                  <div><span className="text-muted-foreground">Próxima revisión:</span> {selectedRevision.fechaProximaRevision}</div>
                )}
                {selectedRevision.vinculacionRevisionSstId && (
                  <div className="col-span-2 flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <Link2 className="h-3.5 w-3.5" />
                    <span className="text-xs">SST vinculada: {getSstRevisionLabel(selectedRevision.vinculacionRevisionSstId)}</span>
                  </div>
                )}
              </div>

              {/* Temas revisados */}
              <div>
                <p className="text-sm font-medium mb-2">Temas Revisados ({temasRevisadosCount(selectedRevision)}/{TEMAS_REVISADOS.length})</p>
                <div className="grid grid-cols-2 gap-1">
                  {TEMAS_REVISADOS.map(t => {
                    const checked = (selectedRevision as any)[t.key] === 1;
                    const resumen = t.resumenKey ? (selectedRevision as any)[t.resumenKey] : null;
                    return (
                      <div key={t.key} className={`flex items-start gap-1.5 text-xs p-1.5 rounded ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                        {checked
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                          : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 mt-0.5 shrink-0" />
                        }
                        <div>
                          <span>{t.label}</span>
                          {checked && resumen && <p className="text-muted-foreground mt-0.5 line-clamp-2">{resumen}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedRevision.analisisGeneral && (
                <div>
                  <p className="text-sm font-medium mb-1">Análisis General</p>
                  <p className="text-sm text-muted-foreground">{selectedRevision.analisisGeneral}</p>
                </div>
              )}

              {/* Decisiones estructuradas — NUEVO */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      Decisiones
                      <Badge variant="outline" className="text-xs">{decisiones.length}</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Las decisiones marcadas con "Genera A01" crean acciones automáticamente en Mejora Continua</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowDecisionForm(!showDecisionForm)} data-testid="button-new-decision">
                    <Plus className="h-3.5 w-3.5 mr-1" />Nueva
                  </Button>
                </div>

                {/* Formulario nueva decisión */}
                {showDecisionForm && (
                  <div className="rounded-md border p-3 space-y-3 mb-3 bg-muted/30">
                    <p className="text-sm font-medium">Nueva Decisión</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Tipo *</Label>
                        <Select value={decisionForm.tipo} onValueChange={v => setDecisionForm(p => ({ ...p, tipo: v }))}>
                          <SelectTrigger className="h-8 text-xs" data-testid="select-decision-tipo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPO_DECISION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Prioridad</Label>
                        <Select value={decisionForm.prioridad} onValueChange={v => setDecisionForm(p => ({ ...p, prioridad: v }))}>
                          <SelectTrigger className="h-8 text-xs" data-testid="select-decision-prioridad">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORIDAD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Descripción *</Label>
                      <Textarea
                        value={decisionForm.descripcion}
                        onChange={e => setDecisionForm(p => ({ ...p, descripcion: e.target.value }))}
                        placeholder="Describa la decisión tomada..."
                        className="min-h-[60px] text-sm"
                        data-testid="textarea-decision-descripcion"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Responsable</Label>
                        <Input
                          value={decisionForm.responsable}
                          onChange={e => setDecisionForm(p => ({ ...p, responsable: e.target.value }))}
                          placeholder="Nombre del responsable"
                          className="h-8 text-xs"
                          data-testid="input-decision-responsable"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fecha Límite</Label>
                        <Input
                          type="date"
                          value={decisionForm.fechaLimite}
                          onChange={e => setDecisionForm(p => ({ ...p, fechaLimite: e.target.value }))}
                          className="h-8 text-xs"
                          data-testid="input-decision-fecha"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <div>
                          <p className="text-xs font-medium">Generar acción en A01 - Mejora Continua</p>
                          <p className="text-xs text-muted-foreground">Se crea automáticamente una acción de mejora vinculada</p>
                        </div>
                      </div>
                      <Switch
                        checked={decisionForm.generaAccionA01 === 1}
                        onCheckedChange={checked => setDecisionForm(p => ({ ...p, generaAccionA01: checked ? 1 : 0 }))}
                        data-testid="switch-genera-accion-a01"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => { setShowDecisionForm(false); setDecisionForm(initialDecisionForm); }}>Cancelar</Button>
                      <Button
                        size="sm"
                        disabled={createDecisionMutation.isPending || !decisionForm.descripcion.trim()}
                        onClick={() => createDecisionMutation.mutate(decisionForm)}
                        data-testid="button-submit-decision"
                      >
                        {createDecisionMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        {decisionForm.generaAccionA01 === 1 ? "Guardar y Generar A01" : "Guardar Decisión"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de decisiones */}
                {decisionesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : decisiones.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border rounded-md">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No hay decisiones registradas</p>
                    <p className="text-xs">Agregue decisiones para generar trazabilidad con A01</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {decisiones.map(d => (
                      <DecisionItem key={d.id} decision={d} revisionId={selectedRevision.id} evaluacionId={evaluacionId!} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo destinatario PDF */}
      <Dialog open={destinatarioPesvOpen} onOpenChange={setDestinatarioPesvOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Descargar PDF Evaluación PESV</DialogTitle>
            <DialogDescription>Seleccione el destinatario del reporte</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(['ansv', 'arl', 'supertransporte', 'mintransporte', 'interno'] as const).map(dest => (
              <div
                key={dest}
                className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer hover-elevate ${selectedDestinatarioPesv === dest ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedDestinatarioPesv(dest)}
                data-testid={`option-destinatario-${dest}`}
              >
                <div className={`h-3.5 w-3.5 rounded-full border-2 ${selectedDestinatarioPesv === dest ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                <span className="text-sm capitalize">{dest === 'ansv' ? 'ANSV' : dest === 'arl' ? 'ARL' : dest === 'supertransporte' ? 'Supertransporte' : dest === 'mintransporte' ? 'Mintransporte' : 'Uso interno'}</span>
              </div>
            ))}
            <div className="space-y-2">
              <div
                className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer hover-elevate ${selectedDestinatarioPesv === 'custom' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedDestinatarioPesv('custom')}
                data-testid="option-destinatario-custom"
              >
                <div className={`h-3.5 w-3.5 rounded-full border-2 ${selectedDestinatarioPesv === 'custom' ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                <span className="text-sm">Otro destinatario...</span>
              </div>
              {selectedDestinatarioPesv === 'custom' && (
                <Input
                  placeholder="Nombre del destinatario"
                  value={customDestinatarioPesv}
                  onChange={e => setCustomDestinatarioPesv(e.target.value)}
                  className="text-sm"
                  data-testid="input-destinatario-custom"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDestinatarioPesvOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                const dest = selectedDestinatarioPesv === 'custom' ? customDestinatarioPesv : selectedDestinatarioPesv;
                handleDownloadPdf(`/api/evaluaciones-pesv/${evaluacionId}/pdf?destinatario=${encodeURIComponent(dest)}`, `evaluacion-pesv-${dest}.pdf`);
                setDestinatarioPesvOpen(false);
              }}
              data-testid="button-confirm-download-pdf"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
