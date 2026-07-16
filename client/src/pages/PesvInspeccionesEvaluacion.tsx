import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowLeft, Eye, ClipboardCheck, ClipboardList, Calendar, Car, User, CheckCircle2, XCircle, AlertCircle, FileDown, ExternalLink, CheckSquare, XSquare, AlertTriangle } from "lucide-react";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EvaluacionPesv, VehicleInspection, Vehicle, Driver } from "@shared/schema";

const ITEMS_INSPECCION = [
  {
    grupo: "Exterior",
    items: [
      { key: "tires" as const, label: "Llantas / Neumáticos", critical: true },
      { key: "lights" as const, label: "Luces" },
      { key: "mirrors" as const, label: "Espejos" },
      { key: "bodywork" as const, label: "Carrocería" },
    ],
  },
  {
    grupo: "Interior",
    items: [
      { key: "seatbelts" as const, label: "Cinturones de seguridad" },
      { key: "horn" as const, label: "Bocina / Pito" },
      { key: "windshield" as const, label: "Parabrisas / Limpiabrisas" },
      { key: "instruments" as const, label: "Instrumentos / Tablero" },
    ],
  },
  {
    grupo: "Mecánica",
    items: [
      { key: "brakes" as const, label: "Frenos", critical: true },
      { key: "steering" as const, label: "Dirección" },
      { key: "suspension" as const, label: "Suspensión" },
      { key: "fluids" as const, label: "Fluidos (aceite, refrigerante)" },
    ],
  },
  {
    grupo: "Equipos de seguridad",
    items: [
      { key: "fireExtinguisher" as const, label: "Extintor", critical: true },
      { key: "firstAidKit" as const, label: "Botiquín de primeros auxilios" },
      { key: "reflectiveTriangles" as const, label: "Triángulos reflectivos" },
      { key: "safetyVest" as const, label: "Chaleco reflectivo" },
    ],
  },
];

type ItemKey = "tires" | "lights" | "mirrors" | "bodywork" | "seatbelts" | "horn" | "windshield" | "instruments" | "brakes" | "steering" | "suspension" | "fluids" | "fireExtinguisher" | "firstAidKit" | "reflectiveTriangles" | "safetyVest";

const ALL_KEYS: ItemKey[] = ["tires","lights","mirrors","bodywork","seatbelts","horn","windshield","instruments","brakes","steering","suspension","fluids","fireExtinguisher","firstAidKit","reflectiveTriangles","safetyVest"];
const CRITICAL_KEYS: ItemKey[] = ["tires","brakes","fireExtinguisher"];

function computeResult(data: Record<ItemKey, number>): "apto" | "apto-con-observaciones" | "no-apto" {
  if (CRITICAL_KEYS.some(k => data[k] === 0)) return "no-apto";
  if (ALL_KEYS.some(k => data[k] === 0)) return "apto-con-observaciones";
  return "apto";
}

export default function PesvInspeccionesEvaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspection | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    inspectionDate: "",
    inspectionTime: "",
    tires: 0,
    lights: 0,
    mirrors: 0,
    bodywork: 0,
    seatbelts: 0,
    horn: 0,
    windshield: 0,
    instruments: 0,
    brakes: 0,
    steering: 0,
    suspension: 0,
    fluids: 0,
    fireExtinguisher: 0,
    firstAidKit: 0,
    reflectiveTriangles: 0,
    safetyVest: 0,
    result: "apto" as "apto" | "apto-con-observaciones" | "no-apto",
    observations: "",
    correctiveActions: "",
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

  useEffect(() => {
    if (evaluacion?.companyId && (user?.role === 'superadmin' || user?.role === 'lso' || user?.role === 'lso_externo')) {
      localStorage.setItem('superadmin_vault_company', evaluacion.companyId);
    }
  }, [evaluacion?.companyId, user?.role]);

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery<VehicleInspection[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "inspecciones"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/inspecciones`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar inspecciones");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/inspecciones`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "inspecciones"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Inspección registrada",
        description: "La inspección preoperacional se ha registrado exitosamente",
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
      vehicleId: "",
      driverId: "",
      inspectionDate: "",
      inspectionTime: "",
      tires: 0,
      lights: 0,
      mirrors: 0,
      bodywork: 0,
      seatbelts: 0,
      horn: 0,
      windshield: 0,
      instruments: 0,
      brakes: 0,
      steering: 0,
      suspension: 0,
      fluids: 0,
      fireExtinguisher: 0,
      firstAidKit: 0,
      reflectiveTriangles: 0,
      safetyVest: 0,
      result: "apto",
      observations: "",
      correctiveActions: "",
    });
  };

  const toggleItem = (key: ItemKey) => {
    setFormData(prev => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const autoResult = computeResult(formData as Record<ItemKey, number>);
    createInspectionMutation.mutate({
      ...formData,
      result: autoResult,
      observations: formData.observations || undefined,
      correctiveActions: formData.correctiveActions || undefined,
    });
  };

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.plate || "N/A";
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || "N/A";
  };

  const getResultBadge = (result: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      apto: "default",
      "apto-con-observaciones": "secondary",
      "no-apto": "destructive",
    };
    const labels: Record<string, string> = {
      apto: "Apto",
      "apto-con-observaciones": "Con Observaciones",
      "no-apto": "No Apto",
    };
    return <Badge variant={variants[result] || "secondary"}>{labels[result] || result}</Badge>;
  };

  const isLoading = evaluacionLoading || inspectionsLoading;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Inspecciones Preoperacionales"
        currentPhase="hacer"
        isLoading={evaluacionLoading}
      />

      {evaluacionId && (
        <Link href={`/pesv/evaluacion/${evaluacionId}/encuesta-conductor?from=evaluation`}>
          <Card
            className="hover-elevate cursor-pointer mb-4 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
            data-testid="card-link-encuesta-conductor"
          >
            <CardHeader className="py-3 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs text-emerald-700 border-emerald-400 dark:text-emerald-400 dark:border-emerald-700">
                      H06+
                    </Badge>
                    <CardTitle className="text-sm font-medium">Encuesta Diaria del Conductor</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Auto-reporte de aptitud del conductor · Art. 18, Res. 40595/2022
                  </CardDescription>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <CardTitle>Inspecciones Preoperacionales</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-inspection">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Inspección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Inspección Preoperacional</DialogTitle>
                <DialogDescription>
                  Marque cada ítem como Bien (✓) o Falla (✗). Ítems críticos en rojo generan resultado NO APTO automáticamente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehículo *</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    >
                      <SelectTrigger data-testid="select-vehicle">
                        <SelectValue placeholder="Seleccione vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.filter(v => v.status === "activo").map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Conductor *</Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                    >
                      <SelectTrigger data-testid="select-driver">
                        <SelectValue placeholder="Seleccione conductor" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.filter(d => d.status === "activo").map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionDate">Fecha *</Label>
                    <Input
                      id="inspectionDate"
                      type="date"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      required
                      data-testid="input-inspection-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionTime">Hora *</Label>
                    <Input
                      id="inspectionTime"
                      type="time"
                      value={formData.inspectionTime}
                      onChange={(e) => setFormData({ ...formData, inspectionTime: e.target.value })}
                      required
                      data-testid="input-inspection-time"
                    />
                  </div>
                </div>

                {/* Checklist de 16 ítems por grupo */}
                {ITEMS_INSPECCION.map(grupo => (
                  <div key={grupo.grupo} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{grupo.grupo}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grupo.items.map(item => {
                        const esBien = formData[item.key] === 1;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            data-testid={`toggle-inspeccion-${item.key}`}
                            onClick={() => toggleItem(item.key)}
                            className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors text-left ${
                              esBien
                                ? "border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 text-green-800 dark:text-green-300"
                                : item.critical
                                ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-800 dark:text-red-300"
                                : "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {item.critical && !esBien && (
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              )}
                              <span>{item.label}</span>
                              {item.critical && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Crítico</Badge>
                              )}
                            </span>
                            {esBien ? (
                              <CheckSquare className="h-4 w-4 shrink-0 text-green-600" />
                            ) : (
                              <XSquare className="h-4 w-4 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Resumen de fallas */}
                {(() => {
                  const failingCount = ALL_KEYS.filter(k => formData[k] === 0).length;
                  const hasCriticalFail = CRITICAL_KEYS.some(k => formData[k] === 0);
                  if (failingCount === 0) return null;
                  return (
                    <div className={`flex items-start gap-2 rounded-md border p-3 ${hasCriticalFail ? "border-red-200 bg-red-50 dark:bg-red-950/30" : "border-amber-200 bg-amber-50 dark:bg-amber-950/30"}`}>
                      <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${hasCriticalFail ? "text-red-600" : "text-amber-600"}`} />
                      <p className="text-sm">
                        {failingCount} ítem{failingCount > 1 ? "s" : ""} con falla.{" "}
                        {hasCriticalFail
                          ? "Hay ítems CRÍTICOS fallando — el resultado será NO APTO."
                          : "El resultado será APTO CON OBSERVACIONES."}
                      </p>
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Describa las fallas encontradas o novedades del vehículo..."
                    data-testid="textarea-observations"
                  />
                </div>

                {ALL_KEYS.some(k => formData[k] === 0) && (
                  <div className="space-y-2">
                    <Label htmlFor="correctiveActions">Acciones Correctivas</Label>
                    <Textarea
                      id="correctiveActions"
                      value={formData.correctiveActions}
                      onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                      placeholder="Acciones a tomar antes de conducir..."
                      data-testid="textarea-corrective-actions"
                    />
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createInspectionMutation.isPending} data-testid="button-submit-inspection">
                    {createInspectionMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay inspecciones registradas para esta evaluación</p>
              <p className="text-sm">Haga clic en "Nueva Inspección" para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((inspection) => (
                  <TableRow key={inspection.id} data-testid={`row-inspection-${inspection.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {inspection.inspectionDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        {getVehiclePlate(inspection.vehicleId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {getDriverName(inspection.driverId)}
                      </div>
                    </TableCell>
                    <TableCell>{getResultBadge(inspection.result)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedInspection(inspection);
                            setDetailDialogOpen(true);
                          }}
                          data-testid={`button-view-inspection-${inspection.id}`}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/api/pesv/inspecciones/${inspection.id}/pdf`, '_blank')}
                          data-testid={`button-pdf-inspection-${inspection.id}`}
                          title="Descargar PDF"
                        >
                          <FileDown className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Inspección Preoperacional</DialogTitle>
          </DialogHeader>
          {selectedInspection && (() => {
            const ins = selectedInspection;
            const grupos = [
              { label: "Exterior", items: [
                { label: "Llantas / Neumáticos", val: ins.tires, critical: true },
                { label: "Luces", val: ins.lights },
                { label: "Espejos", val: ins.mirrors },
                { label: "Carrocería", val: ins.bodywork },
              ]},
              { label: "Interior", items: [
                { label: "Cinturones de seguridad", val: ins.seatbelts },
                { label: "Bocina / Pito", val: ins.horn },
                { label: "Parabrisas / Limpiabrisas", val: ins.windshield },
                { label: "Instrumentos / Tablero", val: ins.instruments },
              ]},
              { label: "Mecánica", items: [
                { label: "Frenos", val: ins.brakes, critical: true },
                { label: "Dirección", val: ins.steering },
                { label: "Suspensión", val: ins.suspension },
                { label: "Fluidos (aceite, refrigerante)", val: ins.fluids },
              ]},
              { label: "Equipos de seguridad", items: [
                { label: "Extintor", val: ins.fireExtinguisher, critical: true },
                { label: "Botiquín de primeros auxilios", val: ins.firstAidKit },
                { label: "Triángulos reflectivos", val: ins.reflectiveTriangles },
                { label: "Chaleco reflectivo", val: ins.safetyVest },
              ]},
            ];
            const resultColor = ins.result === 'apto'
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
              : ins.result === 'apto-con-observaciones'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
            const resultText = ins.result === 'apto'
              ? 'text-green-800 dark:text-green-300'
              : ins.result === 'apto-con-observaciones'
              ? 'text-amber-800 dark:text-amber-300'
              : 'text-red-800 dark:text-red-300';
            const failCount = grupos.flatMap(g => g.items).filter(i => !i.val).length;
            return (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 rounded-md border p-3 ${resultColor}`}>
                  {ins.result === 'apto'
                    ? <CheckCircle2 className="h-7 w-7 text-green-600 shrink-0" />
                    : ins.result === 'apto-con-observaciones'
                    ? <AlertCircle className="h-7 w-7 text-amber-500 shrink-0" />
                    : <XCircle className="h-7 w-7 text-red-600 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${resultText}`}>{getResultBadge(ins.result)}</p>
                    <p className="text-xs text-muted-foreground">
                      {ins.inspectionDate} · {ins.inspectionTime || ""}
                      {failCount > 0 && ` · ${failCount} ítem${failCount > 1 ? 's' : ''} con falla`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Vehículo</p>
                    <p className="font-medium">{getVehiclePlate(ins.vehicleId)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Conductor</p>
                    <p className="font-medium">{getDriverName(ins.driverId)}</p>
                  </div>
                </div>

                {grupos.map(grupo => (
                  <div key={grupo.label} className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{grupo.label}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {grupo.items.map(item => (
                        <div
                          key={item.label}
                          className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm ${
                            item.val
                              ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300'
                              : item.critical
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <span className="truncate">
                            {item.label}
                            {item.critical && !item.val && <span className="ml-1 text-[10px] font-semibold">CRÍTICO</span>}
                          </span>
                          {item.val
                            ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            : <XCircle className="h-4 w-4 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {ins.observations && (
                  <div className="rounded-md border p-3 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Observaciones</p>
                    <p className="text-sm">{ins.observations}</p>
                  </div>
                )}
                {ins.correctiveActions && (
                  <div className="rounded-md border p-3 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones Correctivas</p>
                    <p className="text-sm">{ins.correctiveActions}</p>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
