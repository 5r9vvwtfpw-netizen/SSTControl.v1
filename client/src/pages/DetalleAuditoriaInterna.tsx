import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileCheck2, LockKeyhole, Play, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AuditoriaInterna } from "@shared/schema";

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

  const { data: auditoria, isLoading } = useQuery<AuditoriaInterna>({
    queryKey: ["/api/auditorias-internas", id],
    enabled: !!id,
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

      <Card className="border-dashed">
        <CardHeader><CardTitle className="text-base">Siguiente etapa de implementación</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Esta primera entrega ya controla la planificación y el avance del estado. La siguiente etapa incorporará el equipo auditor, el checklist normativo, las evidencias, los hallazgos y los planes de acción dentro de esta misma pantalla.
        </CardContent>
      </Card>

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