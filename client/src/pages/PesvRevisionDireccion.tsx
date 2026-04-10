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
import { Users, Calendar, CheckCircle2, FileText, Plus, Eye, ArrowLeft, ClipboardCheck, ExternalLink, Building2, Shield, FileDown } from "lucide-react";
import { Link } from "wouter";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EvaluacionPesv, RevisionDireccionPesv, insertRevisionDireccionPesvSchema } from "@shared/schema";

const TEMAS_REVISADOS = [
  { key: "revisionIndicadores", label: "Indicadores de desempeño" },
  { key: "revisionAuditorias", label: "Resultados de auditorías" },
  { key: "revisionSiniestros", label: "Investigación de siniestros" },
  { key: "revisionAccionesMejora", label: "Acciones de mejora" },
  { key: "revisionCumplimientoLegal", label: "Cumplimiento legal" },
  { key: "revisionRecursos", label: "Recursos asignados" },
  { key: "revisionCapacitaciones", label: "Capacitaciones realizadas" },
  { key: "revisionInspecciones", label: "Inspecciones de seguridad vial" },
] as const;

type TemaKey = typeof TEMAS_REVISADOS[number]["key"];

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
  analisisGeneral: string;
  decisiones: string;
  compromisos: string;
  estado: string;
  fechaProximaRevision: string;
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
  analisisGeneral: "",
  decisiones: "",
  compromisos: "",
  estado: "borrador",
  fechaProximaRevision: "",
};

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "aprobada":
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400" data-testid="badge-estado-aprobada">Aprobada</Badge>;
    case "cerrada":
      return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400" data-testid="badge-estado-cerrada">Cerrada</Badge>;
    default:
      return <Badge variant="secondary" data-testid="badge-estado-borrador">Borrador</Badge>;
  }
}

export default function PesvRevisionDireccion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionDireccionPesv | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { data: evaluacion, isLoading: evaluacionLoading } = useQuery<EvaluacionPesv>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar evaluación");
      return res.json();
    },
    enabled: !!evaluacionId,
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

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        evaluacionPesvId: evaluacionId,
        fechaRevision: data.fechaRevision || undefined,
        fechaProximaRevision: data.fechaProximaRevision || undefined,
      };
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/revisiones-direccion`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "revisiones-direccion"] });
      setDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Revisión registrada",
        description: "La revisión por la alta dirección se ha registrado exitosamente",
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
    mutationFn: async ({ revisionId, estado }: { revisionId: string; estado: string }) => {
      const res = await apiRequest("PATCH", `/api/evaluaciones-pesv/${evaluacionId}/revisiones-direccion/${revisionId}`, { estado });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "revisiones-direccion"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la revisión se ha actualizado exitosamente",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fechaRevision || !formData.presididaPor) {
      toast({
        title: "Campos requeridos",
        description: "Debe completar la fecha de revisión y quién preside",
        variant: "destructive",
      });
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
    });
    setDialogOpen(true);
  };

  const handleCheckboxChange = (key: TemaKey, checked: boolean) => {
    setFormData(prev => ({ ...prev, [key]: checked ? 1 : 0 }));
  };

  const temasRevisadosCount = (rev: RevisionDireccionPesv) => {
    return TEMAS_REVISADOS.filter(t => (rev as any)[t.key] === 1).length;
  };

  const isLoading = evaluacionLoading || revisionesLoading;

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
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Revisión por la Dirección"
        currentPhase="actuar"
        isLoading={evaluacionLoading}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDownloadPdf(`/api/evaluaciones-pesv/${evaluacionId}/pdf`, `evaluacion-pesv-${evaluacionId}.pdf`)}
          data-testid="button-download-evaluation-pdf"
        >
          <FileDown className="h-4 w-4" />
        </Button>
        <BackToPesvEvaluationButton />
      </div>

      <TrazabilidadPesvBanner codigoPaso="A02" />

      <Card className="mt-4 mb-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium">Trazabilidad con SST - Revisiones por la Dirección</p>
                <p className="text-xs text-muted-foreground">
                  Según Decreto 1072/2015 Art. 2.2.4.6.31, la revisión por la alta dirección del PESV debe integrarse con la revisión del SG-SST.
                  Consulte las revisiones del SST para garantizar trazabilidad bidireccional.
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

      <Card className="mb-4 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Marco Normativo Aplicable</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><Badge variant="secondary" className="text-xs mr-1">Res. 40595/2022</Badge>Paso A02 - Revisión por la Alta Dirección del PESV</p>
                <p><Badge variant="secondary" className="text-xs mr-1">ISO 39001:2012</Badge>Cláusula 9.3 - Revisión por la dirección del sistema de gestión de seguridad vial</p>
                <p><Badge variant="secondary" className="text-xs mr-1">Dec. 1072/2015</Badge>Art. 2.2.4.6.31 - Revisión por la alta dirección del SG-SST</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  Registre una nueva revisión por la alta dirección conforme a ISO 39001:2012 Cláusula 9.3
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
                      placeholder="REV-PESV-2026-001"
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

                <div className="space-y-2">
                  <Label>Temas Revisados</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEMAS_REVISADOS.map(tema => (
                      <div key={tema.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={tema.key}
                          checked={formData[tema.key] === 1}
                          onCheckedChange={(checked) => handleCheckboxChange(tema.key, !!checked)}
                          data-testid={`checkbox-${tema.key}`}
                        />
                        <Label htmlFor={tema.key} className="text-sm cursor-pointer">
                          {tema.label}
                        </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="decisiones">Decisiones</Label>
                  <Textarea
                    id="decisiones"
                    value={formData.decisiones}
                    onChange={e => setFormData(prev => ({ ...prev, decisiones: e.target.value }))}
                    placeholder="Decisiones tomadas durante la revisión"
                    data-testid="input-decisiones"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compromisos">Compromisos</Label>
                  <Textarea
                    id="compromisos"
                    value={formData.compromisos}
                    onChange={e => setFormData(prev => ({ ...prev, compromisos: e.target.value }))}
                    placeholder="Compromisos adquiridos en la revisión"
                    data-testid="input-compromisos"
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
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-create">
                    Cancelar
                  </Button>
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
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : revisiones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay revisiones registradas</p>
              <p className="text-sm">Registre la primera revisión por la alta dirección para esta evaluación PESV</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisiones.map((revision) => (
                <Card key={revision.id} className="border" data-testid={`card-revision-${revision.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold" data-testid={`text-codigo-${revision.id}`}>
                          {revision.codigo}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{revision.fechaRevision}</span>
                        </div>
                        {getEstadoBadge(revision.estado)}
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
                          onClick={() => {
                            setSelectedRevision(revision);
                            setDetailDialogOpen(true);
                          }}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRevision && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Revisión {selectedRevision.codigo}
                </DialogTitle>
                <DialogDescription>
                  Detalle de la revisión por la alta dirección
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {getEstadoBadge(selectedRevision.estado)}
                  <span className="text-sm text-muted-foreground">
                    {selectedRevision.fechaRevision}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Presidida por</p>
                    <p className="text-sm text-muted-foreground">{selectedRevision.presididaPor}</p>
                  </div>
                  {selectedRevision.participantes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Participantes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRevision.participantes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Temas Revisados</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TEMAS_REVISADOS.map(tema => {
                      const checked = (selectedRevision as any)[tema.key] === 1;
                      return (
                        <div key={tema.key} className="flex items-center gap-2 text-sm">
                          {checked ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                          )}
                          <span className={checked ? "" : "text-muted-foreground"}>{tema.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedRevision.analisisGeneral && (
                  <div>
                    <p className="text-sm font-medium mb-1">Análisis General</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRevision.analisisGeneral}</p>
                  </div>
                )}

                {selectedRevision.decisiones && (
                  <div>
                    <p className="text-sm font-medium mb-1">Decisiones</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRevision.decisiones}</p>
                  </div>
                )}

                {selectedRevision.compromisos && (
                  <div>
                    <p className="text-sm font-medium mb-1">Compromisos</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRevision.compromisos}</p>
                  </div>
                )}

                {selectedRevision.fechaProximaRevision && (
                  <div>
                    <p className="text-sm font-medium mb-1">Fecha Próxima Revisión</p>
                    <p className="text-sm text-muted-foreground">{selectedRevision.fechaProximaRevision}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Cambiar Estado</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Select
                      value={selectedRevision.estado}
                      onValueChange={(val) => {
                        updateEstadoMutation.mutate({ revisionId: selectedRevision.id, estado: val });
                        setSelectedRevision({ ...selectedRevision, estado: val });
                      }}
                    >
                      <SelectTrigger className="w-48" data-testid="select-detail-estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="cerrada">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                    {updateEstadoMutation.isPending && (
                      <span className="text-sm text-muted-foreground">Actualizando...</span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)} data-testid="button-close-detail">
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
