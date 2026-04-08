import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Plus, CheckCircle2, XCircle, Pencil, Trash2, Shield, Beaker } from "lucide-react";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PesvAlcoholRegistro } from "@shared/schema";
import { PASOS_PESV } from "@/data/pasos-pesv";

const TIPO_PRUEBA_OPTIONS = [
  { value: "preventiva", label: "Preventiva" },
  { value: "aleatoria", label: "Aleatoria" },
  { value: "post_accidente", label: "Post-Accidente" },
  { value: "por_sospecha", label: "Por Sospecha" },
];

const SUSTANCIA_OPTIONS = [
  { value: "alcohol", label: "Alcohol" },
  { value: "sustancias_psicoactivas", label: "Sustancias Psicoactivas" },
  { value: "ambas", label: "Ambas" },
];

const RESULTADO_OPTIONS = [
  { value: "negativo", label: "Negativo" },
  { value: "positivo", label: "Positivo" },
  { value: "rehusa", label: "Rehúsa la Prueba" },
];

function getResultadoBadge(val: string | null) {
  if (val === "negativo") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" data-testid="badge-resultado-negativo">Negativo</Badge>;
  }
  if (val === "positivo") {
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" data-testid="badge-resultado-positivo">Positivo</Badge>;
  }
  if (val === "rehusa") {
    return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" data-testid="badge-resultado-rehusa">Rehúsa</Badge>;
  }
  return <Badge variant="outline">{val ?? "N/A"}</Badge>;
}

function getLabelFromOptions(options: { value: string; label: string }[], val: string | null) {
  return options.find(o => o.value === val)?.label ?? val ?? "N/A";
}

const PASO_H10 = PASOS_PESV.find(p => p.codigo === "H10");

interface AlcoholFormData {
  evaluacionId: string | null;
  conductorNombre: string;
  fechaRegistro: string;
  tipoPrueba: string;
  sustanciaControlada: string;
  resultado: string;
  medidasTomadas: string;
  responsable: string;
  observaciones: string;
}

const EMPTY_FORM: AlcoholFormData = {
  evaluacionId: null,
  conductorNombre: "",
  fechaRegistro: new Date().toISOString().slice(0, 10),
  tipoPrueba: "aleatoria",
  sustanciaControlada: "alcohol",
  resultado: "negativo",
  medidasTomadas: "",
  responsable: "",
  observaciones: "",
};

export default function PesvAlcoholSustancias() {
  const { evaluacionId } = useParams<{ evaluacionId?: string }>();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PesvAlcoholRegistro | null>(null);
  const [form, setForm] = useState<AlcoholFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const apiBase = evaluacionId
    ? `/api/pesv/evaluacion/${evaluacionId}/alcohol-registros`
    : `/api/pesv/alcohol-registros`;

  const { data: registros = [], isLoading } = useQuery<PesvAlcoholRegistro[]>({
    queryKey: [apiBase],
  });

  const { data: evaluacion } = useQuery<any>({
    queryKey: [`/api/pesv/evaluaciones/${evaluacionId}`],
    enabled: !!evaluacionId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editItem) {
        return await apiRequest("PUT", `/api/pesv/alcohol-registros/${editItem.id}`, data);
      }
      return await apiRequest("POST", apiBase, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      toast({ title: editItem ? "Registro actualizado" : "Registro creado", description: "Registro de control SAP guardado correctamente." });
      setDialogOpen(false);
      setEditItem(null);
      setForm({ ...EMPTY_FORM, evaluacionId: evaluacionId ?? null });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/pesv/alcohol-registros/${id}`),
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

  function openEdit(item: PesvAlcoholRegistro) {
    setEditItem(item);
    setForm({
      evaluacionId: item.evaluacionId ?? null,
      conductorNombre: item.conductorNombre,
      fechaRegistro: item.fechaRegistro,
      tipoPrueba: item.tipoPrueba,
      sustanciaControlada: item.sustanciaControlada,
      resultado: item.resultado,
      medidasTomadas: item.medidasTomadas ?? "",
      responsable: item.responsable ?? "",
      observaciones: item.observaciones ?? "",
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.conductorNombre.trim() || !form.fechaRegistro || !form.tipoPrueba || !form.resultado) {
      toast({ title: "Complete los campos obligatorios", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      evaluacionId: form.evaluacionId || null,
      conductorNombre: form.conductorNombre.trim(),
      fechaRegistro: form.fechaRegistro,
      tipoPrueba: form.tipoPrueba,
      sustanciaControlada: form.sustanciaControlada,
      resultado: form.resultado,
      medidasTomadas: form.medidasTomadas.trim() || null,
      responsable: form.responsable.trim() || null,
      observaciones: form.observaciones.trim() || null,
    });
  }

  const stats = {
    total: registros.length,
    negativos: registros.filter(r => r.resultado === "negativo").length,
    positivos: registros.filter(r => r.resultado === "positivo").length,
    rehusas: registros.filter(r => r.resultado === "rehusa").length,
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

      {evaluacionId && PASO_H10 && (
        <TrazabilidadPesvBanner
          paso={PASO_H10}
          evaluacionId={evaluacionId}
        />
      )}

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30">
            <Beaker className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alcohol y Sustancias Psicoactivas</h1>
            <p className="text-sm text-muted-foreground">Art. 22 — Resolución 40595/2022 · Programa de cero tolerancia y control de SAP</p>
          </div>
        </div>
        <Button onClick={openNew} data-testid="button-nuevo-registro-alcohol" className="gap-2">
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
              <p className="font-medium text-foreground mb-1">Política Cero Tolerancia</p>
              <p className="text-muted-foreground">Documento que establece la política de prohibición absoluta de alcohol y drogas para conductores.</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Pruebas Aleatorias</p>
              <p className="text-muted-foreground">Programa de pruebas de alcoholimetría y tamizaje de drogas, incluyendo antes de iniciar la jornada.</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="font-medium text-foreground mb-1">Programa de Prevención</p>
              <p className="text-muted-foreground">Capacitaciones sobre efectos del alcohol y sustancias psicoactivas en la conducción segura.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold" data-testid="stat-total-registros">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total pruebas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="stat-negativos">{stats.negativos}</p>
            <p className="text-xs text-muted-foreground">Negativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400" data-testid="stat-positivos">{stats.positivos}</p>
            <p className="text-xs text-muted-foreground">Positivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400" data-testid="stat-rehusas">{stats.rehusas}</p>
            <p className="text-xs text-muted-foreground">Rehúsan</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros de Control SAP</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Beaker className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin registros de control SAP</p>
              <p className="text-sm">Agregue el primer registro usando el botón "Nuevo Registro".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo de Prueba</TableHead>
                    <TableHead>Sustancia</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((r) => (
                    <TableRow key={r.id} data-testid={`row-alcohol-${r.id}`}>
                      <TableCell className="font-medium">{r.conductorNombre}</TableCell>
                      <TableCell>{r.fechaRegistro}</TableCell>
                      <TableCell>{getLabelFromOptions(TIPO_PRUEBA_OPTIONS, r.tipoPrueba)}</TableCell>
                      <TableCell>{getLabelFromOptions(SUSTANCIA_OPTIONS, r.sustanciaControlada)}</TableCell>
                      <TableCell>{getResultadoBadge(r.resultado)}</TableCell>
                      <TableCell>{r.responsable ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)} data-testid={`button-editar-alcohol-${r.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(r.id)} data-testid={`button-eliminar-alcohol-${r.id}`}>
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
            <DialogTitle>{editItem ? "Editar Registro" : "Nuevo Registro de Control SAP"}</DialogTitle>
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
                <Label>Tipo de Prueba <span className="text-destructive">*</span></Label>
                <Select value={form.tipoPrueba} onValueChange={v => setForm(f => ({ ...f, tipoPrueba: v }))}>
                  <SelectTrigger data-testid="select-tipo-prueba">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_PRUEBA_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sustancia Controlada</Label>
                <Select value={form.sustanciaControlada} onValueChange={v => setForm(f => ({ ...f, sustanciaControlada: v }))}>
                  <SelectTrigger data-testid="select-sustancia">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSTANCIA_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            <div className="space-y-1.5">
              <Label htmlFor="responsable">Responsable de la Prueba</Label>
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
                placeholder="Describa las acciones tomadas ante el resultado..."
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
              <Button type="submit" disabled={saveMutation.isPending} data-testid="button-guardar-alcohol">
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
          <p className="text-sm text-muted-foreground">¿Está seguro de que desea eliminar este registro de control SAP? Esta acción no se puede deshacer.</p>
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
