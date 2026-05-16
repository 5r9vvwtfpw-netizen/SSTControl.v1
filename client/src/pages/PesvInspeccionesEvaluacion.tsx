import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowLeft, Eye, ClipboardCheck, Calendar, Car, User, CheckCircle2, XCircle, AlertCircle, FileDown } from "lucide-react";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EvaluacionPesv, VehicleInspection, Vehicle, Driver } from "@shared/schema";

export default function PesvInspeccionesEvaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspection | null>(null);
  const [formData, setFormData] = useState<{
    vehicleId: string;
    driverId: string;
    inspectionDate: string;
    inspectionTime: string;
    result: "apto" | "apto-con-observaciones" | "no-apto";
    observations: string;
  }>({
    vehicleId: "",
    driverId: "",
    inspectionDate: "",
    inspectionTime: "",
    result: "apto",
    observations: "",
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
      result: "apto",
      observations: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInspectionMutation.mutate(formData);
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Inspección Preoperacional</DialogTitle>
                <DialogDescription>
                  Complete los datos de la inspección del vehículo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehículo</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    >
                      <SelectTrigger data-testid="select-vehicle">
                        <SelectValue placeholder="Seleccione vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Conductor</Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                    >
                      <SelectTrigger data-testid="select-driver">
                        <SelectValue placeholder="Seleccione conductor" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inspectionDate">Fecha</Label>
                    <Input
                      id="inspectionDate"
                      type="date"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      data-testid="input-inspection-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionTime">Hora</Label>
                    <Input
                      id="inspectionTime"
                      type="time"
                      value={formData.inspectionTime}
                      onChange={(e) => setFormData({ ...formData, inspectionTime: e.target.value })}
                      data-testid="input-inspection-time"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result">Resultado</Label>
                  <Select
                    value={formData.result}
                    onValueChange={(value: "apto" | "apto-con-observaciones" | "no-apto") => 
                      setFormData({ ...formData, result: value })
                    }
                  >
                    <SelectTrigger data-testid="select-result">
                      <SelectValue placeholder="Seleccione resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apto">Apto</SelectItem>
                      <SelectItem value="apto-con-observaciones">Apto con Observaciones</SelectItem>
                      <SelectItem value="no-apto">No Apto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Ingrese observaciones de la inspección..."
                    data-testid="textarea-observations"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
