import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Plus, Trash2, ArrowLeft, ClipboardList, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { PesvEncuestaConductor as EncuestaType } from "@shared/schema";
import { getTodayDateString } from "@/lib/utils/formatters";
import { hasGlobalAccess } from "@shared/permissions";

const ESTADO_OPTIONS = [
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
  { value: "malo", label: "Malo" },
];

const RESULTADO_OPTIONS = [
  { value: "apto", label: "Apto para conducir" },
  { value: "no_apto", label: "No apto para conducir" },
];

function getEstadoBadge(val: string | null) {
  if (val === "bueno") return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Bueno</Badge>;
  if (val === "regular") return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Regular</Badge>;
  if (val === "malo") return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Malo</Badge>;
  return <Badge variant="outline">{val ?? "N/A"}</Badge>;
}

function getResultadoBadge(val: string | null) {
  if (val === "apto") {
    return (
      <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium text-sm" data-testid="badge-resultado-apto">
        <CheckCircle2 className="w-4 h-4" /> Apto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 font-medium text-sm" data-testid="badge-resultado-no-apto">
      <XCircle className="w-4 h-4" /> No Apto
    </span>
  );
}

interface FormData {
  conductorNombre: string;
  fechaRegistro: string;
  horaRegistro: string;
  horasSueno: string;
  estadoFisico: string;
  estadoEmocional: string;
  tomaMedicamentos: boolean;
  medicamentosDetalle: string;
  consumoAlcohol: boolean;
  presentaEnfermedad: boolean;
  enfermedadDetalle: string;
  resultado: string;
  registradoPor: string;
  observaciones: string;
}

const defaultForm = (): FormData => ({
  conductorNombre: "",
  fechaRegistro: getTodayDateString(),
  horaRegistro: "",
  horasSueno: "",
  estadoFisico: "bueno",
  estadoEmocional: "bueno",
  tomaMedicamentos: false,
  medicamentosDetalle: "",
  consumoAlcohol: false,
  presentaEnfermedad: false,
  enfermedadDetalle: "",
  resultado: "apto",
  registradoPor: "",
  observaciones: "",
});

export default function PesvEncuestaConductor() {
  const { evaluacionId } = useParams<{ evaluacionId?: string }>();
  const { user } = useAuth();
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasGlobalAccess(user.role) : false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultForm());

  const apiBase = evaluacionId
    ? `/api/pesv/evaluacion/${evaluacionId}/encuestas-conductor`
    : `/api/pesv/encuestas-conductor`;

  const companyParam = isAdmin && selectedCompany ? `?companyId=${selectedCompany.id}` : "";

  const { data: encuestas = [], isLoading } = useQuery<EncuestaType[]>({
    queryKey: [apiBase, selectedCompany?.id],
    queryFn: async () => {
      const res = await fetch(`${apiBase}${companyParam}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar encuestas");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body: Record<string, unknown> = {
        ...data,
        horasSueno: parseInt(data.horasSueno) || 0,
        tomaMedicamentos: data.tomaMedicamentos ? 1 : 0,
        consumoAlcohol: data.consumoAlcohol ? 1 : 0,
        presentaEnfermedad: data.presentaEnfermedad ? 1 : 0,
        ...(evaluacionId ? { evaluacionId } : {}),
        ...(isAdmin && selectedCompany ? { companyId: selectedCompany.id } : {}),
      };
      const res = await apiRequest("POST", "/api/pesv/encuestas-conductor", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      setDialogOpen(false);
      setFormData(defaultForm());
      toast({ title: "Encuesta registrada", description: "La encuesta del conductor se registró exitosamente." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/pesv/encuestas-conductor/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      setDeleteId(null);
      toast({ title: "Registro eliminado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!formData.conductorNombre.trim()) {
      toast({ title: "Error", description: "El nombre del conductor es obligatorio.", variant: "destructive" });
      return;
    }
    if (!formData.horaRegistro) {
      toast({ title: "Error", description: "La hora de registro es obligatoria.", variant: "destructive" });
      return;
    }
    if (!formData.horasSueno || isNaN(parseInt(formData.horasSueno))) {
      toast({ title: "Error", description: "Las horas de sueño son obligatorias.", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const noAptoCount = encuestas.filter(e => e.resultado === "no_apto").length;
  const aptoPct = encuestas.length > 0
    ? Math.round((encuestas.filter(e => e.resultado === "apto").length / encuestas.length) * 100)
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      {evaluacionId ? (
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/pesv/evaluacion/${evaluacionId}`}>
            <Button variant="ghost" size="sm" data-testid="button-back-evaluacion">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Evaluación
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          <Link href="/pesv">
            <Button variant="ghost" size="sm" data-testid="button-back-pesv">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver a PESV
            </Button>
          </Link>
        </div>
      )}

      {evaluacionId && (
        <EvaluacionPesvContextHeader evaluacionId={evaluacionId} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Encuesta Diaria del Conductor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Art. 18 — Resolución 40595/2022 · Auto-reporte del estado del conductor antes de cada jornada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpVideoButton moduleKey="pesv_encuesta_conductor" />
          <Button onClick={() => { setFormData(defaultForm()); setDialogOpen(true); }} data-testid="button-nueva-encuesta">
            <Plus className="w-4 h-4 mr-1" /> Nueva Encuesta
          </Button>
        </div>
      </div>

      {evaluacionId && (
        <TrazabilidadPesvBanner evaluacionId={evaluacionId} currentStep="H06" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="stat-total">{encuestas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">% Aptos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="stat-apto-pct">{aptoPct}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" /> No Aptos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="stat-no-apto">{noAptoCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : encuestas.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin registros</p>
              <p className="text-sm mt-1">Registre la primera encuesta diaria del conductor.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Sueño (h)</TableHead>
                  <TableHead>Estado Físico</TableHead>
                  <TableHead>Estado Emocional</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encuestas.map((enc) => (
                  <TableRow key={enc.id} data-testid={`row-encuesta-${enc.id}`}>
                    <TableCell className="font-medium">{enc.conductorNombre}</TableCell>
                    <TableCell>{enc.fechaRegistro}</TableCell>
                    <TableCell>{enc.horaRegistro}</TableCell>
                    <TableCell>{enc.horasSueno}</TableCell>
                    <TableCell>{getEstadoBadge(enc.estadoFisico)}</TableCell>
                    <TableCell>{getEstadoBadge(enc.estadoEmocional)}</TableCell>
                    <TableCell>{getResultadoBadge(enc.resultado)}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(enc.id)}
                        data-testid={`button-delete-${enc.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Encuesta Diaria del Conductor</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="conductorNombre">Nombre del Conductor *</Label>
                <Input
                  id="conductorNombre"
                  placeholder="Nombre completo"
                  value={formData.conductorNombre}
                  onChange={e => setFormData(f => ({ ...f, conductorNombre: e.target.value }))}
                  data-testid="input-conductor-nombre"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fechaRegistro">Fecha *</Label>
                  <Input
                    id="fechaRegistro"
                    type="date"
                    value={formData.fechaRegistro}
                    onChange={e => setFormData(f => ({ ...f, fechaRegistro: e.target.value }))}
                    data-testid="input-fecha-registro"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horaRegistro">Hora *</Label>
                  <Input
                    id="horaRegistro"
                    type="time"
                    value={formData.horaRegistro}
                    onChange={e => setFormData(f => ({ ...f, horaRegistro: e.target.value }))}
                    data-testid="input-hora-registro"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="horasSueno">Horas de sueño la noche anterior *</Label>
                <Input
                  id="horasSueno"
                  type="number"
                  min="0"
                  max="24"
                  placeholder="Ej: 7"
                  value={formData.horasSueno}
                  onChange={e => setFormData(f => ({ ...f, horasSueno: e.target.value }))}
                  data-testid="input-horas-sueno"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Estado Físico *</Label>
                  <Select
                    value={formData.estadoFisico}
                    onValueChange={v => setFormData(f => ({ ...f, estadoFisico: v }))}
                  >
                    <SelectTrigger data-testid="select-estado-fisico">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Estado Emocional *</Label>
                  <Select
                    value={formData.estadoEmocional}
                    onValueChange={v => setFormData(f => ({ ...f, estadoEmocional: v }))}
                  >
                    <SelectTrigger data-testid="select-estado-emocional">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                <p className="text-sm font-medium">Declaraciones del conductor</p>

                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="tomaMedicamentos" className="text-sm font-normal cursor-pointer">
                    ¿Está tomando algún medicamento?
                  </Label>
                  <input
                    id="tomaMedicamentos"
                    type="checkbox"
                    checked={formData.tomaMedicamentos}
                    onChange={e => setFormData(f => ({ ...f, tomaMedicamentos: e.target.checked, medicamentosDetalle: e.target.checked ? f.medicamentosDetalle : "" }))}
                    className="w-4 h-4 accent-primary"
                    data-testid="check-toma-medicamentos"
                  />
                </div>
                {formData.tomaMedicamentos && (
                  <Input
                    placeholder="¿Cuáles medicamentos?"
                    value={formData.medicamentosDetalle}
                    onChange={e => setFormData(f => ({ ...f, medicamentosDetalle: e.target.value }))}
                    data-testid="input-medicamentos-detalle"
                  />
                )}

                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="consumoAlcohol" className="text-sm font-normal cursor-pointer">
                    ¿Consumió alcohol en las últimas 12 horas?
                  </Label>
                  <input
                    id="consumoAlcohol"
                    type="checkbox"
                    checked={formData.consumoAlcohol}
                    onChange={e => setFormData(f => ({ ...f, consumoAlcohol: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                    data-testid="check-consumo-alcohol"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="presentaEnfermedad" className="text-sm font-normal cursor-pointer">
                    ¿Presenta alguna enfermedad o molestia hoy?
                  </Label>
                  <input
                    id="presentaEnfermedad"
                    type="checkbox"
                    checked={formData.presentaEnfermedad}
                    onChange={e => setFormData(f => ({ ...f, presentaEnfermedad: e.target.checked, enfermedadDetalle: e.target.checked ? f.enfermedadDetalle : "" }))}
                    className="w-4 h-4 accent-primary"
                    data-testid="check-presenta-enfermedad"
                  />
                </div>
                {formData.presentaEnfermedad && (
                  <Input
                    placeholder="Describa la enfermedad o molestia"
                    value={formData.enfermedadDetalle}
                    onChange={e => setFormData(f => ({ ...f, enfermedadDetalle: e.target.value }))}
                    data-testid="input-enfermedad-detalle"
                  />
                )}
              </div>

              <div className="space-y-1">
                <Label>Resultado *</Label>
                <Select
                  value={formData.resultado}
                  onValueChange={v => setFormData(f => ({ ...f, resultado: v }))}
                >
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

              <div className="space-y-1">
                <Label htmlFor="registradoPor">Registrado por (supervisor SST)</Label>
                <Input
                  id="registradoPor"
                  placeholder="Nombre del supervisor"
                  value={formData.registradoPor}
                  onChange={e => setFormData(f => ({ ...f, registradoPor: e.target.value }))}
                  data-testid="input-registrado-por"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales..."
                  value={formData.observaciones}
                  onChange={e => setFormData(f => ({ ...f, observaciones: e.target.value }))}
                  rows={2}
                  data-testid="textarea-observaciones"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-dialog">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-submit-encuesta">
              {createMutation.isPending ? "Guardando..." : "Guardar Encuesta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar encuesta</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} data-testid="button-cancel-delete">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
