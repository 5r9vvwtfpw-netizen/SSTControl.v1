import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, HeartHandshake, Shield } from "lucide-react";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PesvVictimasRegistro } from "@shared/schema";
import { PASOS_PESV } from "@/data/pasos-pesv";

const TIPO_VICTIMA_OPTIONS = [
  { value: "conductor", label: "Conductor" },
  { value: "peaton", label: "Peatón" },
  { value: "ciclista", label: "Ciclista" },
  { value: "pasajero", label: "Pasajero" },
  { value: "otro", label: "Otro" },
];

const ESTADO_SEGUIMIENTO_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "cerrado", label: "Cerrado" },
];

function getEstadoBadge(val: string | null) {
  if (val === "cerrado") {
    return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" data-testid="badge-estado-cerrado">Cerrado</Badge>;
  }
  if (val === "en_proceso") {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" data-testid="badge-estado-en-proceso">En Proceso</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" data-testid="badge-estado-activo">Activo</Badge>;
}

function getLabelFromOptions(options: { value: string; label: string }[], val: string | null) {
  return options.find(o => o.value === val)?.label ?? val ?? "N/A";
}

const PASO_H11 = PASOS_PESV.find(p => p.codigo === "H11");

interface VictimaFormData {
  evaluacionId: string | null;
  fechaSiniestro: string;
  tipoVictima: string;
  nombreVictima: string;
  descripcionSiniestro: string;
  atencionInmediata: string;
  remisionIps: number;
  nombreIps: string;
  estadoSeguimiento: string;
  programaAcompanamiento: number;
  responsable: string;
  observaciones: string;
}

const EMPTY_FORM: VictimaFormData = {
  evaluacionId: null,
  fechaSiniestro: new Date().toISOString().slice(0, 10),
  tipoVictima: "conductor",
  nombreVictima: "",
  descripcionSiniestro: "",
  atencionInmediata: "",
  remisionIps: 0,
  nombreIps: "",
  estadoSeguimiento: "activo",
  programaAcompanamiento: 0,
  responsable: "",
  observaciones: "",
};

export default function PesvAtencionVictimas() {
  const { evaluacionId } = useParams<{ evaluacionId?: string }>();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PesvVictimasRegistro | null>(null);
  const [form, setForm] = useState<VictimaFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const apiBase = evaluacionId
    ? `/api/pesv/evaluacion/${evaluacionId}/victimas-registros`
    : `/api/pesv/victimas-registros`;

  const { data: registros = [], isLoading } = useQuery<PesvVictimasRegistro[]>({
    queryKey: [apiBase],
  });

  const { data: evaluacion } = useQuery<any>({
    queryKey: [`/api/pesv/evaluaciones/${evaluacionId}`],
    enabled: !!evaluacionId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editItem) {
        return await apiRequest("PUT", `/api/pesv/victimas-registros/${editItem.id}`, data);
      }
      return await apiRequest("POST", apiBase, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      toast({ title: editItem ? "Registro actualizado" : "Registro creado", description: "Registro de atención a víctima guardado correctamente." });
      setDialogOpen(false);
      setEditItem(null);
      setForm({ ...EMPTY_FORM, evaluacionId: evaluacionId ?? null });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/pesv/victimas-registros/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      toast({ title: "Registro eliminado" });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast({ title: "Error al eliminar", variant: "destructive" });
    },
  });

  function openNew() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, evaluacionId: evaluacionId ?? null });
    setDialogOpen(true);
  }

  function openEdit(item: PesvVictimasRegistro) {
    setEditItem(item);
    setForm({
      evaluacionId: item.evaluacionId ?? null,
      fechaSiniestro: item.fechaSiniestro,
      tipoVictima: item.tipoVictima,
      nombreVictima: item.nombreVictima ?? "",
      descripcionSiniestro: item.descripcionSiniestro,
      atencionInmediata: item.atencionInmediata ?? "",
      remisionIps: item.remisionIps ?? 0,
      nombreIps: item.nombreIps ?? "",
      estadoSeguimiento: item.estadoSeguimiento ?? "activo",
      programaAcompanamiento: item.programaAcompanamiento ?? 0,
      responsable: item.responsable ?? "",
      observaciones: item.observaciones ?? "",
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fechaSiniestro || !form.tipoVictima || !form.descripcionSiniestro.trim()) {
      toast({ title: "Complete los campos obligatorios", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      evaluacionId: form.evaluacionId || null,
      fechaSiniestro: form.fechaSiniestro,
      tipoVictima: form.tipoVictima,
      nombreVictima: form.nombreVictima.trim() || null,
      descripcionSiniestro: form.descripcionSiniestro.trim(),
      atencionInmediata: form.atencionInmediata.trim() || null,
      remisionIps: form.remisionIps,
      nombreIps: form.nombreIps.trim() || null,
      estadoSeguimiento: form.estadoSeguimiento,
      programaAcompanamiento: form.programaAcompanamiento,
      responsable: form.responsable.trim() || null,
      observaciones: form.observaciones.trim() || null,
    });
  }

  const stats = {
    total: registros.length,
    activos: registros.filter(r => r.estadoSeguimiento === "activo").length,
    enProceso: registros.filter(r => r.estadoSeguimiento === "en_proceso").length,
    cerrados: registros.filter(r => r.estadoSeguimiento === "cerrado").length,
  };

  return (
    <div className="space-y-6 p-6">
      {evaluacionId && (
        <div className="flex items-center gap-3 mb-2">
          <BackToPesvEvaluationButton evaluacionId={evaluacionId} />
        </div>
      )}

      {evaluacionId && (
        <EvaluacionPesvContextHeader evaluacionId={evaluacionId} />
      )}

      {evaluacionId && PASO_H11 && (
        <TrazabilidadPesvBanner
          paso={PASO_H11}
          evaluacionId={evaluacionId}
        />
      )}

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-rose-100 dark:bg-rose-900/30">
            <HeartHandshake className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atención a Víctimas de Siniestros Viales</h1>
            <p className="text-sm text-muted-foreground">Art. 23 — Resolución 40595/2022 · Protocolo de atención y acompañamiento</p>
          </div>
        </div>
        <Button onClick={openNew} data-testid="button-nuevo-registro-victima" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      {/* Marco normativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-blue-600" />
            Marco Normativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Protocolo de Atención</p>
              <p className="text-muted-foreground">Documento que establece el procedimiento de atención inmediata a víctimas de siniestros viales con líneas de emergencia.</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Remisión a IPS</p>
              <p className="text-muted-foreground">Convenios con Instituciones Prestadoras de Salud para garantizar atención médica oportuna y especializada.</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Programa de Acompañamiento</p>
              <p className="text-muted-foreground">Seguimiento psicosocial y acompañamiento a la víctima y su familia durante el proceso de recuperación.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold" data-testid="stat-total-victimas">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400" data-testid="stat-activos">{stats.activos}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400" data-testid="stat-en-proceso">{stats.enProceso}</p>
            <p className="text-xs text-muted-foreground">En Proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400" data-testid="stat-cerrados">{stats.cerrados}</p>
            <p className="text-xs text-muted-foreground">Cerrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros de Atención a Víctimas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <HeartHandshake className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin registros de atención a víctimas</p>
              <p className="text-sm">Agregue el primer registro usando el botón "Nuevo Registro".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo de Víctima</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Remisión IPS</TableHead>
                    <TableHead>Acompañamiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((r) => (
                    <TableRow key={r.id} data-testid={`row-victima-${r.id}`}>
                      <TableCell>{r.fechaSiniestro}</TableCell>
                      <TableCell>{getLabelFromOptions(TIPO_VICTIMA_OPTIONS, r.tipoVictima)}</TableCell>
                      <TableCell className="font-medium">{r.nombreVictima ?? "—"}</TableCell>
                      <TableCell>
                        {r.remisionIps === 1
                          ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Sí</Badge>
                          : <Badge variant="outline">No</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {r.programaAcompanamiento === 1
                          ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Sí</Badge>
                          : <Badge variant="outline">No</Badge>
                        }
                      </TableCell>
                      <TableCell>{getEstadoBadge(r.estadoSeguimiento)}</TableCell>
                      <TableCell>{r.responsable ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)} data-testid={`button-editar-victima-${r.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(r.id)} data-testid={`button-eliminar-victima-${r.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Formulario */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditItem(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Registro" : "Nuevo Registro de Atención a Víctima"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fechaSiniestro">Fecha del Siniestro <span className="text-destructive">*</span></Label>
                <Input
                  id="fechaSiniestro"
                  type="date"
                  value={form.fechaSiniestro}
                  onChange={e => setForm(f => ({ ...f, fechaSiniestro: e.target.value }))}
                  data-testid="input-fecha-siniestro"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Víctima <span className="text-destructive">*</span></Label>
                <Select value={form.tipoVictima} onValueChange={v => setForm(f => ({ ...f, tipoVictima: v }))}>
                  <SelectTrigger data-testid="select-tipo-victima">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_VICTIMA_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombreVictima">Nombre de la Víctima</Label>
              <Input
                id="nombreVictima"
                value={form.nombreVictima}
                onChange={e => setForm(f => ({ ...f, nombreVictima: e.target.value }))}
                placeholder="Nombre completo (opcional)"
                data-testid="input-nombre-victima"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcionSiniestro">Descripción del Siniestro <span className="text-destructive">*</span></Label>
              <Textarea
                id="descripcionSiniestro"
                value={form.descripcionSiniestro}
                onChange={e => setForm(f => ({ ...f, descripcionSiniestro: e.target.value }))}
                placeholder="Describa las circunstancias del siniestro vial..."
                rows={3}
                data-testid="textarea-descripcion-siniestro"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="atencionInmediata">Atención Inmediata Prestada</Label>
              <Textarea
                id="atencionInmediata"
                value={form.atencionInmediata}
                onChange={e => setForm(f => ({ ...f, atencionInmediata: e.target.value }))}
                placeholder="Primeros auxilios, llamada de emergencia, etc."
                rows={2}
                data-testid="textarea-atencion-inmediata"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Remisión a IPS</Label>
                <Select value={String(form.remisionIps)} onValueChange={v => setForm(f => ({ ...f, remisionIps: Number(v) }))}>
                  <SelectTrigger data-testid="select-remision-ips">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.remisionIps === 1 && (
                <div className="space-y-1.5">
                  <Label htmlFor="nombreIps">Nombre de la IPS</Label>
                  <Input
                    id="nombreIps"
                    value={form.nombreIps}
                    onChange={e => setForm(f => ({ ...f, nombreIps: e.target.value }))}
                    placeholder="Nombre de la institución"
                    data-testid="input-nombre-ips"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Programa de Acompañamiento</Label>
                <Select value={String(form.programaAcompanamiento)} onValueChange={v => setForm(f => ({ ...f, programaAcompanamiento: Number(v) }))}>
                  <SelectTrigger data-testid="select-programa-acompanamiento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado de Seguimiento</Label>
                <Select value={form.estadoSeguimiento} onValueChange={v => setForm(f => ({ ...f, estadoSeguimiento: v }))}>
                  <SelectTrigger data-testid="select-estado-seguimiento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_SEGUIMIENTO_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={form.responsable}
                onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
                placeholder="Nombre del responsable del seguimiento"
                data-testid="input-responsable"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={form.observaciones}
                onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales sobre el caso..."
                rows={2}
                data-testid="textarea-observaciones"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancelar">
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} data-testid="button-guardar-victima">
                {saveMutation.isPending ? "Guardando..." : (editItem ? "Actualizar" : "Guardar")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo confirmación eliminación */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => { if (!v) setDeleteConfirm(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">¿Está seguro de que desea eliminar este registro de atención a víctima? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} data-testid="button-cancelar-eliminar">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending} data-testid="button-confirmar-eliminar">
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
