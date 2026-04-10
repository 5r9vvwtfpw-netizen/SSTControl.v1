import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, AlertTriangle, Calendar, MapPin, Car, User, Navigation, Sparkles, Database, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EvaluacionPesv, RoadIncident, Vehicle, Driver, VehicleGpsTracking } from "@shared/schema";

export default function PesvSiniestrosEvaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<RoadIncident | null>(null);
  const [locationFromGps, setLocationFromGps] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    incidentDate: "",
    incidentTime: "",
    location: "",
    type: "colision" as const,
    severity: "solo-danos" as const,
    description: "",
    injuries: "" as number | string,
    fatalities: "" as number | string,
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

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<RoadIncident[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "siniestros"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/siniestros`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar siniestros");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const { data: globalIncidents = [], isLoading: globalIncidentsLoading } = useQuery<RoadIncident[]>({
    queryKey: ["/api/road-incidents"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: gpsRecords = [] } = useQuery<VehicleGpsTracking[]>({
    queryKey: ["/api/vehicle-gps-tracking"],
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/siniestros`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "siniestros"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Siniestro registrado",
        description: "El siniestro vial se ha registrado exitosamente",
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
      incidentDate: "",
      incidentTime: "",
      location: "",
      type: "colision",
      severity: "solo-danos",
      description: "",
      injuries: "",
      fatalities: "",
    });
    setLocationFromGps(false);
  };

  const getLatestGpsForVehicle = (vehicleId: string) => {
    const vehicleRecords = gpsRecords
      .filter(r => r.vehicleId === vehicleId && r.latitude && r.longitude)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return vehicleRecords.length > 0 ? vehicleRecords[0] : null;
  };

  const handleVehicleChange = (vehicleId: string) => {
    const updates: Partial<typeof formData> = { vehicleId };
    const latestGps = getLatestGpsForVehicle(vehicleId);
    if (latestGps) {
      updates.location = `Lat: ${latestGps.latitude}, Lon: ${latestGps.longitude}${latestGps.observations ? ` - ${latestGps.observations}` : ''}`;
      setLocationFromGps(true);
      if (latestGps.driverId) {
        updates.driverId = latestGps.driverId;
      }
    } else {
      setLocationFromGps(false);
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      setFormData(prev => ({
        ...prev,
        incidentDate: prev.incidentDate || dateStr,
        incidentTime: prev.incidentTime || timeStr,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIncidentMutation.mutate({
      ...formData,
      injuries: formData.injuries === '' ? 0 : Number(formData.injuries),
      fatalities: formData.fatalities === '' ? 0 : Number(formData.fatalities),
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

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "solo-danos": "secondary",
      "con-heridos": "default",
      "con-fallecidos": "destructive",
    };
    const labels: Record<string, string> = {
      "solo-danos": "Solo Daños",
      "con-heridos": "Con Heridos",
      "con-fallecidos": "Con Fallecidos",
    };
    return <Badge variant={variants[severity] || "secondary"}>{labels[severity] || severity}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      colision: "Colisión",
      volcamiento: "Volcamiento",
      atropello: "Atropello",
      "caida-ocupante": "Caída de Ocupante",
      incendio: "Incendio",
      otro: "Otro",
    };
    return labels[type] || type;
  };

  const isLoading = evaluacionLoading || incidentsLoading;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Siniestros Viales"
        currentPhase="verificar"
        isLoading={evaluacionLoading}
      />

 <div className="flex items-center gap-2 flex-wrap mb-4">
        <BackToPesvEvaluationButton />
      </div>

      {/* SECCIÓN 1: Siniestros del módulo general */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Siniestros del Módulo General</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/pesv/siniestros")}
            data-testid="button-go-global-siniestros"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ir al módulo
          </Button>
        </CardHeader>
        <CardContent>
          {globalIncidentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : globalIncidents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay siniestros registrados en el módulo general</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Ubicación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalIncidents.map((incident) => (
                  <TableRow key={incident.id} data-testid={`row-global-incident-${incident.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {incident.incidentDate}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeLabel(incident.type)}</TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        {getVehiclePlate(incident.vehicleId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {incident.location || "N/A"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SECCIÓN 2: Siniestros propios de esta evaluación */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Siniestros de esta Evaluación</CardTitle>
          </div>
          {!dialogOpen && (
            <Button data-testid="button-create-incident" onClick={() => handleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Siniestro
            </Button>
          )}
        </CardHeader>
        {dialogOpen && (
          <CardContent>
            <div className="border rounded-md p-4 mb-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Registrar Siniestro Vial</h3>
                <p className="text-sm text-muted-foreground">Complete los datos del siniestro vial</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehículo</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={handleVehicleChange}
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="incidentDate">Fecha</Label>
                      <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
                        <Sparkles className="h-3 w-3" />
                        Auto
                      </Badge>
                    </div>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                      data-testid="input-incident-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="incidentTime">Hora</Label>
                      <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
                        <Sparkles className="h-3 w-3" />
                        Auto
                      </Badge>
                    </div>
                    <Input
                      id="incidentTime"
                      type="time"
                      value={formData.incidentTime}
                      onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                      data-testid="input-incident-time"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="location">Ubicación</Label>
                    {locationFromGps && (
                      <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-300">
                        <Navigation className="h-3 w-3" />
                        GPS
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (locationFromGps) setLocationFromGps(false);
                    }}
                    placeholder="Dirección o lugar del siniestro"
                    data-testid="input-location"
                  />
                  {locationFromGps && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                      Ubicación obtenida del último registro GPS del vehículo
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: typeof formData.type) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger data-testid="select-type">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colision">Colisión</SelectItem>
                        <SelectItem value="volcamiento">Volcamiento</SelectItem>
                        <SelectItem value="atropello">Atropello</SelectItem>
                        <SelectItem value="caida-ocupante">Caída de Ocupante</SelectItem>
                        <SelectItem value="incendio">Incendio</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severidad</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: typeof formData.severity) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger data-testid="select-severity">
                        <SelectValue placeholder="Seleccione severidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo-danos">Solo Daños</SelectItem>
                        <SelectItem value="con-heridos">Con Heridos</SelectItem>
                        <SelectItem value="con-fallecidos">Con Fallecidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="injuries">Heridos</Label>
                    <Input
                      id="injuries"
                      type="number"
                      min="0"
                      value={formData.injuries}
                      onChange={(e) => setFormData({ ...formData, injuries: e.target.value === '' ? '' : e.target.value })}
                      data-testid="input-injuries"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatalities">Fallecidos</Label>
                    <Input
                      id="fatalities"
                      type="number"
                      min="0"
                      value={formData.fatalities}
                      onChange={(e) => setFormData({ ...formData, fatalities: e.target.value === '' ? '' : e.target.value })}
                      data-testid="input-fatalities"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describa los hechos del siniestro..."
                    data-testid="textarea-description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createIncidentMutation.isPending} data-testid="button-submit-incident">
                    {createIncidentMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        )}
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay siniestros registrados para esta evaluación</p>
              <p className="text-sm">Haga clic en "Registrar Siniestro" para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id} data-testid={`row-incident-${incident.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {incident.incidentDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {incident.location || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeLabel(incident.type)}</TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        {getVehiclePlate(incident.vehicleId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setDetailDialogOpen(true);
                        }}
                        data-testid={`button-view-incident-${incident.id}`}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Siniestro</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{selectedIncident.incidentDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hora</Label>
                  <p className="font-medium">{selectedIncident.incidentTime || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vehículo</Label>
                  <p className="font-medium">{getVehiclePlate(selectedIncident.vehicleId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Conductor</Label>
                  <p className="font-medium">{getDriverName(selectedIncident.driverId)}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Ubicación</Label>
                <p className="font-medium">{selectedIncident.location || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{getTypeLabel(selectedIncident.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severidad</Label>
                  <div className="mt-1">{getSeverityBadge(selectedIncident.severity)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Heridos</Label>
                  <p className="font-medium">{selectedIncident.injuries || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fallecidos</Label>
                  <p className="font-medium">{selectedIncident.fatalities || 0}</p>
                </div>
              </div>
              {selectedIncident.description && (
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1">{selectedIncident.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
