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
import { AlertCircle, Plus, Moon, Clock, CheckCircle2, XCircle, Pencil, Trash2, FileDown, Shield } from "lucide-react";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PesvFatigaRegistro } from "@shared/schema";
import { PASOS_PESV } from "@/data/pasos-pesv";

const TIPO_CONTROL_OPTIONS = [
  { value: "sensibilizacion", label: "Sensibilización" },
  { value: "verificacion_jornada", label: "Verificación de Jornada" },
  { value: "prueba_fisica", label: "Prueba Física/Ocular" },
  { value: "capacitacion", label: "Capacitación" },
];

const RESULTADO_OPTIONS = [
  { value: "sin_novedad", label: "Sin Novedad" },
  { value: "fatiga_detectada", label: "Fatiga Detectada" },
  { value: "somnolencia_detectada", label: "Somnolencia Detectada" },
];

function getTipoControlLabel(val: string | null) {
  return TIPO_CONTROL_OPTIONS.find(o => o.value === val)?.label ?? val ?? "N/A";
}

function getResultadoBadge(val: string | null) {
  if (val === "sin_novedad") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" data-testid="badge-resultado-sin-novedad">Sin Novedad</Badge>;
  }
  if (val === "fatiga_detectada") {
    return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" data-testid="badge-resultado-fatiga">Fatiga Detectada</Badge>;
  }
  if (val === "somnolencia_detectada") {
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" data-testid="badge-resultado-somnolencia">Somnolencia Detectada</Badge>;
  }
  return <Badge variant="outline">{val ?? "N/A"}</Badge>;
}

const PASO_H09 = PASOS_PESV.find(p => p.codigo === "H09");

interface FatigaFormData {
  evaluacionId: string | null;
  conductorNombre: string;
  fechaRegistro: string;
  tipoControl: string;
  resultado: string;
  horasConduccion: string;
  descansoCumplido: string;
  medidasTomadas: string;
  responsable: string;
  observaciones: string;
}

const EMPTY_FORM: FatigaFormData = {
  evaluacionId: null,
  conductorNombre: "",
  fechaRegistro: new Date().toISOString().slice(0, 10),
  tipoControl: "verificacion_jornada",
  resultado: "sin_novedad",
  horasConduccion: "",
  descansoCumplido: "1",
  medidasTomadas: "",
  responsable: "",
  observaciones: "",
};

export default function PesvFatigaSomnolencia() {
  const { evaluacionId } = useParams<{ evaluacionId?: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PesvFatigaRegistro | null>(null);
  const [form, setForm] = useState<FatigaFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const apiBase = evaluacionId
    ? `/api/pesv/evaluacion/${evaluacionId}/fatiga-registros`
    : `/api/pesv/fatiga-registros`;

  const { data: registros = [], isLoading } = useQuery<PesvFatigaRegistro[]>({
    queryKey: [apiBase],
  });

  const { data: evaluacion } = useQuery<any>({
    queryKey: [`/api/pesv/evaluaciones/${evaluacionId}`],
    enabled: !!evaluacionId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editItem) {
        return await apiRequest("PUT", `/api/pesv/fatiga-registros/${editItem.id}`, data);
      }
      return await apiRequest("POST", apiBase, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      toast({ title: editItem ? "Registro actualizado" : "Registro creado", description: "Control de fatiga guardado correctamente." });
      setDialogOpen(false);
      setEditItem(null);
      setForm({ ...EMPTY_FORM, evaluacionId: evaluacionId ?? null });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/pesv/fatiga-registros/${id}`),
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

  function openEdit(item: PesvFatigaRegistro) {
    setEditItem(item);
    setForm({
      evaluacionId: item.evaluacionId ?? null,
      conductorNombre: item.conductorNombre,
      fechaRegistro: item.fechaRegistro,
      tipoControl: item.tipoControl,
      resultado: item.resultado,
      horasConduccion: item.horasConduccion?.toString() ?? "",
      descansoCumplido: item.descansoCumplido?.toString() ?? "1",
      medidasTomadas: item.medidasTomadas ?? "",
      responsable: item.responsable ?? "",
      observaciones: item.observaciones ?? "",
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.conductorNombre.trim() || !form.fechaRegistro || !form.tipoControl || !form.resultado) {
      toast({ title: "Complete los campos obligatorios", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      evaluacionId: form.evaluacionId || null,
      conductorNombre: form.conductorNombre.trim(),
      fechaRegistro: form.fechaRegistro,
      tipoControl: form.tipoControl,
      resultado: form.resultado,
      horasConduccion: form.horasConduccion ? parseInt(form.horasConduccion) : null,
      descansoCumplido: parseInt(form.descansoCumplido),
      medidasTomadas: form.medidasTomadas.trim() || null,
      responsable: form.responsable.trim() || null,
      observaciones: form.observaciones.trim() || null,
    });
  }

  const stats = {
    total: registros.length,
    sinNovedad: registros.filter(r => r.resultado === "sin_novedad").length,
    conNovedad: registros.filter(r => r.resultado !== "sin_novedad").length,
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

      {evaluacionId && PASO_H09 && (
        <TrazabilidadPesvBanner
          paso={PASO_H09}
          evaluacionId={evaluacionId}
        />
      )}

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/30">
            <Moon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fatiga y Somnolencia</h1>
            <p className="text-sm text-muted-foreground">Art. 21 — Resolución 40595/2022 · Controles de jornada, descanso y vigilancia del conductor</p>
          </div>
        </div>
        <Button onClick={openNew} data-testid="button-nuevo-registro-fatiga" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      {/* Contexto normativo */}
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
              <p className="font-medium text-foreground mb-1">Política de Jornadas</p>
              <p className="text-muted-foreground">Documentar política de control de horas de conducción y tiempos de descanso obligatorio.</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Control de Horas</p>
              <p className="text-muted-foreground">Registrar horas efectivas de conducción por conductor. Máximo 8 horas/día según normativa.</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Programa Preventivo</p>
              <p className="text-muted-foreground">Capacitaciones, pausas activas y evaluaciones físicas periódicas para detectar fatiga.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total-registros">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="stat-sin-novedad">{stats.sinNovedad}</p>
                <p className="text-xs text-muted-foreground">Sin novedad</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400" data-testid="stat-con-novedad">{stats.conNovedad}</p>
                <p className="text-xs text-muted-foreground">Con novedad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros de Control</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Moon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin registros de control de fatiga</p>
              <p className="text-sm">Agregue el primer registro usando el botón "Nuevo Registro".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo de Control</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Horas Conducción</TableHead>
                    <TableHead>Descanso Cumplido</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((r) => (
                    <TableRow key={r.id} data-testid={`row-fatiga-${r.id}`}>
                      <TableCell className="font-medium">{r.conductorNombre}</TableCell>
                      <TableCell>{r.fechaRegistro}</TableCell>
                      <TableCell>{getTipoControlLabel(r.tipoControl)}</TableCell>
                      <TableCell>{getResultadoBadge(r.resultado)}</TableCell>
                      <TableCell>{r.horasConduccion ? `${r.horasConduccion}h` : "—"}</TableCell>
                      <TableCell>
                        {r.descansoCumplido === 1
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                      </TableCell>
                      <TableCell>{r.responsable ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)} data-testid={`button-editar-fatiga-${r.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(r.id)} data-testid={`button-eliminar-fatiga-${r.id}`}>
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
            <DialogTitle>{editItem ? "Editar Registro" : "Nuevo Registro de Fatiga"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="conductorNombre">Conductor <span className="text-destructive">*</span></Label>
                <Input
                  id="conductorNombre"
                  value={form.conductorNombre}
                  onChange={e => setForm(f => ({ ...f, conductorNombre: e.target.value }))}
                  placeholder="Nombre del conductor"
                  data-testid="input-conductor-nombre"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fechaRegistro">Fecha <span className="text-destructive">*</span></Label>
                <Input
                  id="fechaRegistro"
                  type="date"
                  value={form.fechaRegistro}
                  onChange={e => setForm(f => ({ ...f, fechaRegistro: e.target.value }))}
                  data-testid="input-fecha-registro"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de Control <span className="text-destructive">*</span></Label>
                <Select value={form.tipoControl} onValueChange={v => setForm(f => ({ ...f, tipoControl: v }))}>
                  <SelectTrigger data-testid="select-tipo-control">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_CONTROL_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Resultado <span className="text-destructive">*</span></Label>
                <Select value={form.resultado} onValueChange={v => setForm(f => ({ ...f, resultado: v }))}>
                  <SelectTrigger data-testid="select-resultado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULTADO_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="horasConduccion">Horas de Conducción</Label>
                <Input
                  id="horasConduccion"
                  type="number"
                  min="0"
                  max="24"
                  value={form.horasConduccion}
                  onChange={e => setForm(f => ({ ...f, horasConduccion: e.target.value }))}
                  placeholder="Ej: 6"
                  data-testid="input-horas-conduccion"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descanso Cumplido</Label>
                <Select value={form.descansoCumplido} onValueChange={v => setForm(f => ({ ...f, descansoCumplido: v }))}>
                  <SelectTrigger data-testid="select-descanso-cumplido">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sí</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="responsable">Responsable del Control</Label>
              <Input
                id="responsable"
                value={form.responsable}
                onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
                placeholder="Nombre del responsable"
                data-testid="input-responsable"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="medidasTomadas">Medidas Tomadas</Label>
              <Textarea
                id="medidasTomadas"
                value={form.medidasTomadas}
                onChange={e => setForm(f => ({ ...f, medidasTomadas: e.target.value }))}
                placeholder="Describa las medidas aplicadas..."
                rows={2}
                data-testid="textarea-medidas-tomadas"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={form.observaciones}
                onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales..."
                rows={2}
                data-testid="textarea-observaciones"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancelar">
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} data-testid="button-guardar-fatiga">
                {saveMutation.isPending ? "Guardando..." : (editItem ? "Actualizar" : "Guardar")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => { if (!v) setDeleteConfirm(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">¿Está seguro de que desea eliminar este registro de control de fatiga? Esta acción no se puede deshacer.</p>
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
