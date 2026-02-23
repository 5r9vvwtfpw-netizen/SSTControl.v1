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
import { Plus, ArrowLeft, Eye, ClipboardCheck, Calendar, Car, User } from "lucide-react";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
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

 <div className="flex gap-2 flex-wrap justify-end mb-4">
        <BackToPesvEvaluationButton />
      </div>

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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedInspection(inspection);
                          setDetailDialogOpen(true);
                        }}
                        data-testid={`button-view-inspection-${inspection.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Inspección</DialogTitle>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{selectedInspection.inspectionDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hora</Label>
                  <p className="font-medium">{selectedInspection.inspectionTime || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vehículo</Label>
                  <p className="font-medium">{getVehiclePlate(selectedInspection.vehicleId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Conductor</Label>
                  <p className="font-medium">{getDriverName(selectedInspection.driverId)}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Resultado</Label>
                <div className="mt-1">{getResultBadge(selectedInspection.result)}</div>
              </div>
              {selectedInspection.observations && (
                <div>
                  <Label className="text-muted-foreground">Observaciones</Label>
                  <p className="mt-1">{selectedInspection.observations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
