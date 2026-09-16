import { useState } from "react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Download, FileCheck2, FileText, Loader2, LockKeyhole, Play, Upload, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AuditoriaChecklist, AuditoriaInterna, HallazgoAuditoria, PlanAccionAuditoria } from "@shared/schema";

const statusConfig: Record<string, { label: string; className: string; icon: typeof Calendar }> = {
  programada: { label: "Programada", className: "bg-blue-500/10 text-blue-700", icon: Calendar },
  en_ejecucion: { label: "En ejecución", className: "bg-yellow-500/10 text-yellow-700", icon: Clock },
  completada: { label: "Completada", className: "bg-green-500/10 text-green-700", icon: CheckCircle2 },
  cerrada: { label: "Cerrada", className: "bg-green-600/10 text-green-800", icon: LockKeyhole },
};

const statusOrder = ["programada", "en_ejecucion", "completada", "cerrada"];

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "No registrada";
  return new Date(value).toLocaleDateString("es-CO");
}

export default function DetalleAuditoriaInterna() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeNotes, setCloseNotes] = useState("");
  const [newCriterion, setNewCriterion] = useState("");
  const [newClause, setNewClause] = useState("");
  const [newArea, setNewArea] = useState("");
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<HallazgoAuditoria | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [findingForm, setFindingForm] = useState({
    tipo: "no_conformidad_menor",
    severidad: "media",
    descripcion: "",
    requisito: "",
    clausulaReferencia: "",
    areaAfectada: "",
    evidencia: "",
    causaRaiz: "",
    responsableArea: "",
  });
  const [actionForm, setActionForm] = useState({
    tipoAccion: "correctiva",
    descripcionAccion: "",
    justificacion: "",
    responsable: "",
    fechaCompromiso: "",
  });

  const { data: auditoria, isLoading } = useQuery<AuditoriaInterna>({
    queryKey: ["/api/auditorias-internas", id],
    enabled: !!id,
  });

  const { data: checklists = [], isLoading: checklistsLoading } = useQuery<AuditoriaChecklist[]>({
    queryKey: [`/api/auditorias-internas/${id}/checklists`],
    enabled: !!id && !!auditoria,
  });

  const { data: hallazgos = [], isLoading: hallazgosLoading } = useQuery<HallazgoAuditoria[]>({
    queryKey: [`/api/auditorias-internas/${id}/hallazgos`],
    enabled: !!id && !!auditoria,
  });

  const planQueries = useQueries({
    queries: hallazgos.map((hallazgo) => ({
      queryKey: [`/api/hallazgos-auditoria/${hallazgo.id}/planes-accion`],
      enabled: !!hallazgo.id,
    })),
  });

  const transitionMutation = useMutation({
    mutationFn: async ({ estado, data }: { estado: string; data?: Record<string, string> }) => {
      const response = await apiRequest("POST", `/api/auditorias-internas/${id}/transitions`, {
        estado,
        ...data,
      });
      return response.json();
    },
    onSuccess: (updated: AuditoriaInterna) => {
      queryClient.setQueryData(["/api/auditorias-internas", id], updated);
      queryClient.invalidateQueries({ queryKey: ["/api/auditorias-internas"] });
      setCloseDialogOpen(false);
      setCloseNotes("");
      toast({
        title: "Estado actualizado",
        description: `La auditoría ahora está ${statusConfig[updated.estado]?.label?.toLowerCase() || updated.estado}.`,
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo cambiar el estado", description: error.message, variant: "destructive" });
    },
  });

  const templateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/auditorias-internas/${id}/checklists/template`, {});
      return response.json();
    },
    onSuccess: (created: AuditoriaChecklist[]) => {
      queryClient.setQueryData([`/api/auditorias-internas/${id}/checklists`], created);
      toast({
        title: "Checklist normativo creado",
        description: `Se agregaron ${created.length} criterios base para la auditoría.`,
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo crear el checklist", description: error.message, variant: "destructive" });
    },
  });

  const createCriterionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/auditorias-internas/${id}/checklists`, {
        numeroItem: checklists.length + 1,
        criterioAuditoria: newCriterion.trim(),
        clausulaReferencia: newClause.trim() || null,
        areaProcesoAuditado: newArea.trim() || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auditorias-internas/${id}/checklists`] });
      setNewCriterion("");
      setNewClause("");
      setNewArea("");
      toast({ title: "Criterio agregado", description: "El nuevo criterio quedó pendiente de evaluar." });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo agregar el criterio", description: error.message, variant: "destructive" });
    },
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ checklistId, data }: { checklistId: string; data: Record<string, unknown> }) => {
      const response = await apiRequest("PATCH", `/api/checklists/${checklistId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auditorias-internas/${id}/checklists`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auditorias-internas", id] });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo guardar el criterio", description: error.message, variant: "destructive" });
    },
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: async ({ checklistId, file }: { checklistId: string; file: File }) => {
      const requestResponse = await apiRequest("POST", `/api/auditorias-internas/${id}/checklists/${checklistId}/evidence-upload-url`, {
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      });
      const { uploadURL, objectPath } = await requestResponse.json();
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("No se pudo cargar el archivo al almacenamiento");
      }
      await apiRequest("PATCH", `/api/checklists/${checklistId}`, { archivoEvidencia: objectPath });
      return objectPath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auditorias-internas/${id}/checklists`] });
      toast({ title: "Evidencia cargada", description: "El archivo quedó relacionado con el criterio." });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo cargar la evidencia", description: error.message, variant: "destructive" });
    },
  });

  const findingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/auditorias-internas/${id}/hallazgos`, {
        ...findingForm,
        fechaDeteccion: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auditorias-internas/${id}/hallazgos`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auditorias-internas", id] });
      setFindingDialogOpen(false);
      setFindingForm({
        tipo: "no_conformidad_menor",
        severidad: "media",
        descripcion: "",
        requisito: "",
        clausulaReferencia: "",
        areaAfectada: "",
        evidencia: "",
        causaRaiz: "",
        responsableArea: "",
      });
      toast({ title: "Hallazgo registrado", description: "El hallazgo quedó asociado a esta auditoría." });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo registrar el hallazgo", description: error.message, variant: "destructive" });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFinding) throw new Error("Seleccione un hallazgo");
      const response = await apiRequest("POST", `/api/hallazgos-auditoria/${selectedFinding.id}/planes-accion`, actionForm);
      return response.json();
    },
    onSuccess: () => {
      if (selectedFinding) {
        queryClient.invalidateQueries({ queryKey: [`/api/hallazgos-auditoria/${selectedFinding.id}/planes-accion`] });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/auditorias-internas/${id}/hallazgos`] });
      setActionDialogOpen(false);
      setSelectedFinding(null);
      setActionForm({ tipoAccion: "correctiva", descripcionAccion: "", justificacion: "", responsable: "", fechaCompromiso: "" });
      toast({ title: "Plan de acción creado", description: "El hallazgo quedó en corrección." });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo crear el plan de acción", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Cargando auditoría...</div>;
  }

  if (!auditoria) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setLocation("/auditorias-internas")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a auditorías
        </Button>
        <Card><CardContent className="py-12 text-center">No se encontró la auditoría.</CardContent></Card>
      </div>
    );
  }

  const currentStatus = statusConfig[auditoria.estado] || statusConfig.programada;
  const StatusIcon = currentStatus.icon;
  const currentIndex = statusOrder.indexOf(auditoria.estado);
  const canStart = auditoria.estado === "programada";
  const canComplete = auditoria.estado === "en_ejecucion";
  const canClose = auditoria.estado === "completada";
  const canEditChecklist = auditoria.estado === "programada" || auditoria.estado === "en_ejecucion";
  const canEditFindings = auditoria.estado !== "cerrada";
  const evaluatedCount = checklists.filter((item) => item.cumple !== null && item.cumple !== undefined).length;
  const conformCount = checklists.filter((item) => item.cumple === 1).length;
  const nonConformCount = checklists.filter((item) => item.cumple === 0).length;

  const handleEvidenceSelection = (checklistId: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Archivo demasiado grande", description: "La evidencia no puede superar 10 MB.", variant: "destructive" });
      return;
    }
    uploadEvidenceMutation.mutate({ checklistId, file });
  };

  const openFindingDialog = (item?: AuditoriaChecklist) => {
    setFindingForm({
      tipo: "no_conformidad_menor",
      severidad: "media",
      descripcion: item ? `El criterio no se cumple: ${item.criterioAuditoria}` : "",
      requisito: item?.criterioAuditoria || "",
      clausulaReferencia: item?.clausulaReferencia || "",
      areaAfectada: item?.areaProcesoAuditado || "",
      evidencia: item?.evidenciasObtenidas || "",
      causaRaiz: "",
      responsableArea: auditoria.responsableAuditado || "",
    });
    setFindingDialogOpen(true);
  };

  const plansByFinding = new Map<string, PlanAccionAuditoria[]>(
    hallazgos.map((hallazgo, index) => [hallazgo.id, (planQueries[index]?.data as PlanAccionAuditoria[] | undefined) || []]),
  );

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setLocation("/auditorias-internas")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Volver a auditorías
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{auditoria.codigo}</h1>
            <Badge className={currentStatus.className}><StatusIcon className="h-3 w-3 mr-1" />{currentStatus.label}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{auditoria.titulo}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Resolución 0312/2019 — Estándar 6.1.2 · ISO 45001:2018 {auditoria.normaReferencia === "ambas" ? "· aplican ambas referencias" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canStart && (
            <Button onClick={() => transitionMutation.mutate({ estado: "en_ejecucion" })} disabled={transitionMutation.isPending}>
              <Play className="h-4 w-4 mr-2" /> Iniciar auditoría
            </Button>
          )}
          {canComplete && (
            <Button onClick={() => transitionMutation.mutate({ estado: "completada" })} disabled={transitionMutation.isPending}>
              <FileCheck2 className="h-4 w-4 mr-2" /> Marcar como completada
            </Button>
          )}
          {canClose && (
            <Button onClick={() => setCloseDialogOpen(true)} disabled={transitionMutation.isPending}>
              <LockKeyhole className="h-4 w-4 mr-2" /> Cerrar auditoría
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ciclo de la auditoría</CardTitle>
          <CardDescription>El estado debe avanzar con evidencia y trazabilidad.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {statusOrder.map((status, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const reached = index <= currentIndex;
              return (
                <div key={status} className={`rounded-lg border p-3 ${reached ? "border-primary/40 bg-primary/5" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${reached ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Resumen de planificación</CardTitle></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Objetivo</p><p className="mt-1">{auditoria.objetivo}</p></div>
            <div><p className="text-sm text-muted-foreground">Alcance</p><p className="mt-1">{auditoria.alcance}</p></div>
            <div><p className="text-sm text-muted-foreground">Auditor líder</p><p className="mt-1 flex items-center gap-2"><Users className="h-4 w-4" />{auditoria.auditoristaLider}</p></div>
            <div><p className="text-sm text-muted-foreground">Fecha programada</p><p className="mt-1 flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(auditoria.fechaProgramada)}</p></div>
            <div><p className="text-sm text-muted-foreground">Inicio</p><p className="mt-1">{formatDate(auditoria.fechaInicio)}</p></div>
            <div><p className="text-sm text-muted-foreground">Fin</p><p className="mt-1">{formatDate(auditoria.fechaFin)}</p></div>
            <div><p className="text-sm text-muted-foreground">Participación COPASST</p><p className="mt-1">{auditoria.planificadaConCopasst ? "Planificada con COPASST" : "No registrada"}</p></div>
            <div><p className="text-sm text-muted-foreground">Responsable auditado</p><p className="mt-1">{auditoria.responsableAuditado || "Pendiente de asignar"}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resultados</CardTitle><CardDescription>Se completarán durante la ejecución.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span>Hallazgos</span><strong>{auditoria.numeroHallazgos || 0}</strong></div>
            <div className="flex justify-between text-sm"><span>Conformidades</span><strong className="text-green-700">{auditoria.numeroConformidades || 0}</strong></div>
            <div className="flex justify-between text-sm"><span>NC menores</span><strong className="text-yellow-700">{auditoria.numeroNoConformidadesMenores || 0}</strong></div>
            <div className="flex justify-between text-sm"><span>NC mayores</span><strong className="text-red-700">{auditoria.numeroNoConformidadesMayores || 0}</strong></div>
            <div className="border-t pt-3 flex justify-between text-sm"><span>Cumplimiento</span><strong>{auditoria.porcentajeCumplimiento ?? "Pendiente"}{auditoria.porcentajeCumplimiento != null ? "%" : ""}</strong></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Checklist normativo y evidencias</CardTitle>
              <CardDescription>
                Evalúe cada criterio con evidencia objetiva. Los criterios pendientes impiden completar la auditoría.
              </CardDescription>
            </div>
            {checklists.length === 0 && canEditChecklist && (
              <Button onClick={() => templateMutation.mutate()} disabled={templateMutation.isPending}>
                {templateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Generar checklist normativo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklists.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <span className="text-muted-foreground">Criterios</span>
                <strong className="block text-xl">{checklists.length}</strong>
              </div>
              <div className="rounded-lg border bg-green-500/5 p-3 text-sm">
                <span className="text-muted-foreground">Conformes</span>
                <strong className="block text-xl text-green-700">{conformCount}</strong>
              </div>
              <div className="rounded-lg border bg-yellow-500/5 p-3 text-sm">
                <span className="text-muted-foreground">Pendientes / no conformes</span>
                <strong className="block text-xl text-yellow-700">{checklists.length - evaluatedCount + nonConformCount}</strong>
              </div>
            </div>
          )}

          {checklistsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Cargando checklist...
            </div>
          ) : checklists.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No hay criterios registrados. Genere la plantilla normativa base o agregue un criterio personalizado.
            </div>
          ) : (
            checklists.map((item) => (
              <Card key={`${item.id}-${item.updatedAt}`} className="bg-muted/10">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0">Ítem {item.numeroItem}</Badge>
                    <div className="min-w-0">
                      <p className="font-medium">{item.criterioAuditoria}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.clausulaReferencia || "Referencia normativa no especificada"}</p>
                      {item.areaProcesoAuditado && <p className="text-xs text-muted-foreground">Área: {item.areaProcesoAuditado}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`result-${item.id}`}>Resultado de la evaluación</Label>
                      <select
                        id={`result-${item.id}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={item.cumple === null || item.cumple === undefined ? "" : String(item.cumple)}
                        disabled={!canEditChecklist || updateChecklistMutation.isPending}
                        onChange={(event) => updateChecklistMutation.mutate({
                          checklistId: item.id,
                          data: { cumple: event.target.value === "" ? null : Number(event.target.value) },
                        })}
                      >
                        <option value="">Pendiente de evaluar</option>
                        <option value="1">Cumple</option>
                        <option value="0">No cumple</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`evidence-description-${item.id}`}>Evidencia obtenida</Label>
                      <Textarea
                        id={`evidence-description-${item.id}`}
                        key={`evidence-description-${item.id}-${item.updatedAt}`}
                        defaultValue={item.evidenciasObtenidas || ""}
                        disabled={!canEditChecklist}
                        placeholder="Describa el documento, registro, entrevista u observación verificada..."
                        onBlur={(event) => updateChecklistMutation.mutate({
                          checklistId: item.id,
                          data: { evidenciasObtenidas: event.target.value || null },
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`observations-${item.id}`}>Observaciones del auditor</Label>
                    <Textarea
                      id={`observations-${item.id}`}
                      key={`observations-${item.id}-${item.updatedAt}`}
                      defaultValue={item.observaciones || ""}
                      disabled={!canEditChecklist}
                      placeholder="Registre las observaciones, desviaciones o aspectos destacados..."
                      onBlur={(event) => updateChecklistMutation.mutate({
                        checklistId: item.id,
                        data: { observaciones: event.target.value || null },
                      })}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t pt-3">
                    <Label htmlFor={`file-${item.id}`} className="inline-flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" /> Adjuntar evidencia
                    </Label>
                    <Input
                      id={`file-${item.id}`}
                      type="file"
                      className="max-w-sm"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                      disabled={!canEditChecklist || uploadEvidenceMutation.isPending}
                      onChange={(event) => {
                        handleEvidenceSelection(item.id, event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                    {item.archivoEvidencia && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.archivoEvidencia} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" /> Ver evidencia
                        </a>
                      </Button>
                    )}
                    {item.cumple === 0 && canEditFindings && (
                      <Button variant="outline" size="sm" onClick={() => openFindingDialog(item)}>
                        Registrar hallazgo
                      </Button>
                    )}
                  </div>
                  {item.fechaEvaluacion && (
                    <p className="text-xs text-muted-foreground">Evaluado el {formatDate(item.fechaEvaluacion)}{item.evaluadoPor ? ` por ${item.evaluadoPor}` : ""}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {canEditChecklist && (
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <p className="text-sm font-medium">Agregar criterio personalizado</p>
              <div className="grid gap-3 md:grid-cols-3">
                <Input value={newCriterion} onChange={(event) => setNewCriterion(event.target.value)} placeholder="Criterio a verificar" className="md:col-span-3" />
                <Input value={newClause} onChange={(event) => setNewClause(event.target.value)} placeholder="Referencia normativa (opcional)" />
                <Input value={newArea} onChange={(event) => setNewArea(event.target.value)} placeholder="Área o proceso (opcional)" />
                <Button
                  onClick={() => createCriterionMutation.mutate()}
                  disabled={!newCriterion.trim() || createCriterionMutation.isPending}
                >
                  {createCriterionMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Agregar criterio
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Hallazgos y planes de acción</CardTitle>
              <CardDescription>
                Documente las desviaciones encontradas y conviértalas en acciones con responsable y fecha de compromiso.
              </CardDescription>
            </div>
            {canEditFindings && (
              <Button variant="outline" onClick={() => openFindingDialog()}>
                Registrar hallazgo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hallazgosLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Cargando hallazgos...
            </div>
          ) : hallazgos.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aún no hay hallazgos registrados para esta auditoría.
            </div>
          ) : (
            hallazgos.map((hallazgo) => {
              const plans = plansByFinding.get(hallazgo.id) || [];
              return (
                <Card key={hallazgo.id} className="bg-muted/10">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={hallazgo.tipo.includes("no_conformidad") ? "destructive" : "outline"}>{hallazgo.numeroHallazgo}</Badge>
                        <span className="text-sm font-medium">
                          {hallazgo.tipo === "no_conformidad_mayor" ? "No conformidad mayor" :
                            hallazgo.tipo === "no_conformidad_menor" ? "No conformidad menor" :
                              hallazgo.tipo === "observacion" ? "Observación" : "Conformidad"}
                        </span>
                        <Badge variant="secondary">Severidad {hallazgo.severidad}</Badge>
                      </div>
                      <Badge variant={hallazgo.estadoCierre === "abierto" ? "outline" : "secondary"}>
                        {hallazgo.estadoCierre === "en_correccion" ? "En corrección" : hallazgo.estadoCierre === "verificado" ? "Verificado" : hallazgo.estadoCierre === "cerrado" ? "Cerrado" : "Abierto"}
                      </Badge>
                    </div>
                    <p className="text-sm">{hallazgo.descripcion}</p>
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <div><span className="text-muted-foreground block">Requisito</span>{hallazgo.requisito}</div>
                      <div><span className="text-muted-foreground block">Área afectada</span>{hallazgo.areaAfectada}</div>
                      <div><span className="text-muted-foreground block">Evidencia objetiva</span>{hallazgo.evidencia || "No registrada"}</div>
                    </div>
                    {plans.length > 0 && (
                      <div className="rounded-md border bg-background p-3 space-y-2">
                        <p className="text-sm font-medium">Planes de acción ({plans.length})</p>
                        {plans.map((plan) => (
                          <div key={plan.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span>{plan.descripcionAccion}</span>
                            <span className="text-muted-foreground">{plan.responsable} · vence {formatDate(plan.fechaCompromiso)} · {plan.estado}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {canEditFindings && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFinding(hallazgo);
                          setActionDialogOpen(true);
                        }}
                      >
                        Crear plan de acción
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader><CardTitle className="text-base">Siguiente etapa</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Checklist y evidencias ya están operativos. La siguiente fase convertirá los criterios “No cumple” en hallazgos con clasificación, responsable, fecha de compromiso y plan de acción.
        </CardContent>
      </Card>

      <Dialog open={findingDialogOpen} onOpenChange={setFindingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar hallazgo</DialogTitle>
            <DialogDescription>Describa el hecho verificable, el requisito afectado y el área responsable.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={findingForm.tipo} onChange={(e) => setFindingForm({ ...findingForm, tipo: e.target.value })}>
                <option value="no_conformidad_menor">No conformidad menor</option>
                <option value="no_conformidad_mayor">No conformidad mayor</option>
                <option value="observacion">Observación</option>
                <option value="conformidad">Conformidad</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Severidad</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={findingForm.severidad} onChange={(e) => setFindingForm({ ...findingForm, severidad: e.target.value })}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descripción del hallazgo</Label>
              <Textarea value={findingForm.descripcion} onChange={(e) => setFindingForm({ ...findingForm, descripcion: e.target.value })} placeholder="Qué se encontró y en qué condición..." />
            </div>
            <div className="space-y-2">
              <Label>Requisito incumplido o verificado</Label>
              <Textarea value={findingForm.requisito} onChange={(e) => setFindingForm({ ...findingForm, requisito: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Área afectada</Label>
              <Input value={findingForm.areaAfectada} onChange={(e) => setFindingForm({ ...findingForm, areaAfectada: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Referencia normativa</Label>
              <Input value={findingForm.clausulaReferencia} onChange={(e) => setFindingForm({ ...findingForm, clausulaReferencia: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Responsable del área</Label>
              <Input value={findingForm.responsableArea} onChange={(e) => setFindingForm({ ...findingForm, responsableArea: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Evidencia objetiva</Label>
              <Textarea value={findingForm.evidencia} onChange={(e) => setFindingForm({ ...findingForm, evidencia: e.target.value })} placeholder="Documento, registro, entrevista u observación que sustenta el hallazgo..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Causa raíz inicial (opcional)</Label>
              <Textarea value={findingForm.causaRaiz} onChange={(e) => setFindingForm({ ...findingForm, causaRaiz: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFindingDialogOpen(false)}>Cancelar</Button>
            <Button
              disabled={!findingForm.descripcion.trim() || !findingForm.requisito.trim() || !findingForm.areaAfectada.trim() || findingMutation.isPending}
              onClick={() => findingMutation.mutate()}
            >
              {findingMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Guardar hallazgo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear plan de acción</DialogTitle>
            <DialogDescription>Defina la acción, el responsable y la fecha en que debe estar implementada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de acción</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={actionForm.tipoAccion} onChange={(e) => setActionForm({ ...actionForm, tipoAccion: e.target.value })}>
                <option value="correctiva">Correctiva</option>
                <option value="preventiva">Preventiva</option>
                <option value="mejora">Mejora</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descripción de la acción</Label>
              <Textarea value={actionForm.descripcionAccion} onChange={(e) => setActionForm({ ...actionForm, descripcionAccion: e.target.value })} placeholder="Qué se hará para eliminar la causa o cerrar la brecha..." />
            </div>
            <div className="space-y-2">
              <Label>Justificación (opcional)</Label>
              <Textarea value={actionForm.justificacion} onChange={(e) => setActionForm({ ...actionForm, justificacion: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Input value={actionForm.responsable} onChange={(e) => setActionForm({ ...actionForm, responsable: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fecha compromiso</Label>
                <Input type="date" value={actionForm.fechaCompromiso} onChange={(e) => setActionForm({ ...actionForm, fechaCompromiso: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>Cancelar</Button>
            <Button
              disabled={!actionForm.descripcionAccion.trim() || !actionForm.responsable.trim() || !actionForm.fechaCompromiso || actionMutation.isPending}
              onClick={() => actionMutation.mutate()}
            >
              {actionMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Guardar plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar auditoría</DialogTitle>
            <DialogDescription>El cierre requiere conclusiones y aprobación. Las acciones correctivas continuarán en seguimiento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="close-notes">Conclusiones de cierre</Label>
            <Textarea id="close-notes" value={closeNotes} onChange={(event) => setCloseNotes(event.target.value)} placeholder="Resuma el resultado general de la auditoría..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>Cancelar</Button>
            <Button
              disabled={!closeNotes.trim() || transitionMutation.isPending}
              onClick={() => transitionMutation.mutate({ estado: "cerrada", data: { conclusiones: closeNotes.trim(), aprobadoPor: "Usuario autorizado" } })}
            >
              Confirmar cierre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}