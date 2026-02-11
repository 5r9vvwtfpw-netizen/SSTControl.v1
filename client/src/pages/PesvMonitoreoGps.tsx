import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Trash2, ArrowLeft, MapPin, Gauge, AlertTriangle, Info, Navigation } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VehicleGpsTracking, InsertVehicleGpsTracking, insertVehicleGpsTrackingSchema, Vehicle, Driver } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

export default function PesvMonitoreoGps() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMapVehicleId, setSelectedMapVehicleId] = useState<string>("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    trackingDate: new Date().toISOString().split("T")[0],
    trackingTime: "",
    latitude: "",
    longitude: "",
    speed: "" as number | string,
    maxSpeedAllowed: "" as number | string,
    speedExceeded: 0,
    engineStatus: "" as "encendido" | "apagado" | "ralenti" | "",
    geofenceAlert: 0,
    alertType: "",
    observations: "",
  });

  const { data: trackingRecords = [], isLoading: trackingLoading } = useQuery<VehicleGpsTracking[]>({
    queryKey: ["/api/vehicle-gps-tracking"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createTrackingMutation = useMutation({
    mutationFn: async (data: InsertVehicleGpsTracking) => {
      const res = await apiRequest("POST", "/api/vehicle-gps-tracking", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-gps-tracking"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Registro GPS creado",
        description: "El registro de monitoreo GPS se ha guardado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const deleteTrackingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/vehicle-gps-tracking/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-gps-tracking"] });
      toast({
        title: "Registro eliminado",
        description: "El registro de monitoreo GPS se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCompany) {
      toast({
        title: "Error",
        description: "No hay empresa seleccionada",
        variant: "destructive",
      });
      return;
    }
    
    const data: InsertVehicleGpsTracking = {
      companyId: currentCompany.id,
      vehicleId: formData.vehicleId,
      driverId: formData.driverId && formData.driverId !== "none" ? formData.driverId : undefined,
      trackingDate: formData.trackingDate,
      trackingTime: formData.trackingTime || undefined,
      latitude: formData.latitude || undefined,
      longitude: formData.longitude || undefined,
      speed: formData.speed === "" ? undefined : Number(formData.speed),
      maxSpeedAllowed: formData.maxSpeedAllowed === "" ? undefined : Number(formData.maxSpeedAllowed),
      speedExceeded: formData.speedExceeded,
      engineStatus: formData.engineStatus || undefined,
      geofenceAlert: formData.geofenceAlert,
      alertType: formData.alertType || undefined,
      observations: formData.observations || undefined,
    };

    createTrackingMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro de monitoreo GPS?")) {
      deleteTrackingMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      driverId: "",
      trackingDate: new Date().toISOString().split("T")[0],
      trackingTime: "",
      latitude: "",
      longitude: "",
      speed: "",
      maxSpeedAllowed: "",
      speedExceeded: 0,
      engineStatus: "",
      geofenceAlert: 0,
      alertType: "",
      observations: "",
    });
  };

  const getVehicleLabel = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : vehicleId;
  };

  const getDriverLabel = (driverId: string | null | undefined) => {
    if (!driverId) return "-";
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? driver.name : driverId;
  };

  const getEngineStatusLabel = (status: string | null | undefined) => {
    if (!status) return "-";
    const labels: Record<string, string> = {
      encendido: "Encendido",
      apagado: "Apagado",
      ralenti: "Ralentí",
    };
    return labels[status] || status;
  };

  const lastKnownLocation = useMemo(() => {
    if (!selectedMapVehicleId) return null;
    const vehicleRecords = trackingRecords
      .filter((r) => r.vehicleId === selectedMapVehicleId && r.latitude && r.longitude)
      .sort((a, b) => {
        const dateA = `${a.trackingDate} ${a.trackingTime || "00:00"}`;
        const dateB = `${b.trackingDate} ${b.trackingTime || "00:00"}`;
        return dateB.localeCompare(dateA);
      });
    if (vehicleRecords.length === 0) return null;
    const latest = vehicleRecords[0];
    const lat = parseFloat(latest.latitude!);
    const lng = parseFloat(latest.longitude!);
    if (isNaN(lat) || isNaN(lng)) return null;
    return {
      lat,
      lng,
      speed: latest.speed,
      maxSpeed: latest.maxSpeedAllowed,
      date: latest.trackingDate,
      time: latest.trackingTime,
      engineStatus: latest.engineStatus,
      speedExceeded: latest.speedExceeded === 1,
    };
  }, [selectedMapVehicleId, trackingRecords]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [4.7110, -74.0721],
        zoom: 6,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (lastKnownLocation) {
      const { lat, lng, speed, maxSpeed, date, time, engineStatus, speedExceeded } = lastKnownLocation;
      const vehicle = vehicles.find((v) => v.id === selectedMapVehicleId);
      const plateLabel = vehicle ? vehicle.plate : "Vehículo";

      const iconHtml = `<div style="
        background: ${speedExceeded ? "#ef4444" : "#3b82f6"};
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      const popupContent = `
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">${plateLabel}</div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${date}${time ? ` ${time}` : ""}</div>
          ${speed !== null && speed !== undefined ? `<div style="margin-bottom: 4px;"><strong>Velocidad:</strong> ${speed} km/h${maxSpeed ? ` / ${maxSpeed} km/h` : ""}</div>` : ""}
          ${speedExceeded ? '<div style="color: #ef4444; font-weight: 600; margin-bottom: 4px;">Exceso de velocidad</div>' : ""}
          ${engineStatus ? `<div><strong>Motor:</strong> ${engineStatus === "encendido" ? "Encendido" : engineStatus === "apagado" ? "Apagado" : "Ralentí"}</div>` : ""}
          <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
        </div>
      `;

      markerRef.current = L.marker([lat, lng], { icon: customIcon })
        .addTo(mapRef.current!)
        .bindPopup(popupContent)
        .openPopup();

      mapRef.current!.setView([lat, lng], 14, { animate: true });
    } else {
      mapRef.current!.setView([4.7110, -74.0721], 6, { animate: true });
    }

    return () => {};
  }, [lastKnownLocation, selectedMapVehicleId, vehicles]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const filteredRecords = trackingRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    const vehicle = vehicles.find((v) => v.id === record.vehicleId);
    const vehiclePlate = vehicle?.plate?.toLowerCase() || "";
    return (
      vehiclePlate.includes(searchLower) ||
      record.trackingDate.toLowerCase().includes(searchLower) ||
      (record.alertType?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm" data-testid="button-back-pesv">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToPesvEvaluationButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Monitoreo GPS / Velocidad</h1>
          <p className="text-muted-foreground">Seguimiento en tiempo real de ubicación y velocidad de vehículos (Resolución 40595/2022)</p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Información importante</AlertTitle>
        <AlertDescription className="text-blue-700">
          Este módulo solo aplica para niveles Estándar y Avanzado del PESV. Permite registrar datos de 
          monitoreo GPS, velocidad y alertas de geocerca para el control de la flota vehicular.
        </AlertDescription>
      </Alert>
      
      <TrazabilidadPesvBanner codigoPaso="H07" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, fecha o tipo de alerta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-tracking">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro GPS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-tracking">
              <DialogHeader>
                <DialogTitle>Registrar Monitoreo GPS</DialogTitle>
                <DialogDescription>Complete los datos del registro de monitoreo GPS/Velocidad</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-gps-tracking">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehículo *</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    >
                      <SelectTrigger id="vehicleId" data-testid="select-vehicle">
                        <SelectValue placeholder="Seleccione un vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Conductor (opcional)</Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                    >
                      <SelectTrigger id="driverId" data-testid="select-driver">
                        <SelectValue placeholder="Seleccione un conductor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin conductor asignado</SelectItem>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - {driver.licenseNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingDate">Fecha de Rastreo *</Label>
                    <Input
                      id="trackingDate"
                      type="date"
                      value={formData.trackingDate}
                      onChange={(e) => setFormData({ ...formData, trackingDate: e.target.value })}
                      required
                      data-testid="input-tracking-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingTime">Hora de Rastreo</Label>
                    <Input
                      id="trackingTime"
                      type="time"
                      value={formData.trackingTime}
                      onChange={(e) => setFormData({ ...formData, trackingTime: e.target.value })}
                      data-testid="input-tracking-time"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitud</Label>
                    <Input
                      id="latitude"
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="Ej: 4.7110"
                      data-testid="input-latitude"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitud</Label>
                    <Input
                      id="longitude"
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="Ej: -74.0721"
                      data-testid="input-longitude"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speed">Velocidad (km/h)</Label>
                    <Input
                      id="speed"
                      type="number"
                      min="0"
                      value={formData.speed}
                      onChange={(e) => setFormData({ ...formData, speed: e.target.value === "" ? "" : e.target.value })}
                      placeholder="Velocidad registrada"
                      data-testid="input-speed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSpeedAllowed">Velocidad Máxima Permitida (km/h)</Label>
                    <Input
                      id="maxSpeedAllowed"
                      type="number"
                      min="0"
                      value={formData.maxSpeedAllowed}
                      onChange={(e) => setFormData({ ...formData, maxSpeedAllowed: e.target.value === "" ? "" : e.target.value })}
                      placeholder="Límite de velocidad"
                      data-testid="input-max-speed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engineStatus">Estado del Motor</Label>
                    <Select
                      value={formData.engineStatus}
                      onValueChange={(value: "encendido" | "apagado" | "ralenti") => setFormData({ ...formData, engineStatus: value })}
                    >
                      <SelectTrigger id="engineStatus" data-testid="select-engine-status">
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encendido">Encendido</SelectItem>
                        <SelectItem value="apagado">Apagado</SelectItem>
                        <SelectItem value="ralenti">Ralentí</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alertType">Tipo de Alerta</Label>
                    <Input
                      id="alertType"
                      type="text"
                      value={formData.alertType}
                      onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
                      placeholder="Ej: Exceso de velocidad, Salida de geocerca"
                      data-testid="input-alert-type"
                    />
                  </div>

                  <div className="space-y-4 col-span-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="speedExceeded"
                          checked={formData.speedExceeded === 1}
                          onCheckedChange={(checked) => setFormData({ ...formData, speedExceeded: checked ? 1 : 0 })}
                          data-testid="checkbox-speed-exceeded"
                        />
                        <Label htmlFor="speedExceeded" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Exceso de Velocidad
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="geofenceAlert"
                          checked={formData.geofenceAlert === 1}
                          onCheckedChange={(checked) => setFormData({ ...formData, geofenceAlert: checked ? 1 : 0 })}
                          data-testid="checkbox-geofence-alert"
                        />
                        <Label htmlFor="geofenceAlert" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Alerta de Geocerca
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observations">Observaciones</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Observaciones adicionales del registro"
                      rows={3}
                      data-testid="textarea-observations"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTrackingMutation.isPending} data-testid="button-submit">
                    {createTrackingMutation.isPending ? "Guardando..." : "Guardar Registro"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {trackingLoading ? (
        <div className="text-center py-8">Cargando registros de monitoreo GPS...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No se encontraron registros que coincidan con la búsqueda" : "No hay registros de monitoreo GPS. Agregue el primer registro."}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Velocidad</TableHead>
                <TableHead>Exceso</TableHead>
                <TableHead>Motor</TableHead>
                <TableHead>Alertas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} data-testid={`row-tracking-${record.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {getVehicleLabel(record.vehicleId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.trackingDate}
                    {record.trackingTime && <span className="text-muted-foreground ml-1">{record.trackingTime}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      {record.speed !== null ? `${record.speed} km/h` : "-"}
                      {record.maxSpeedAllowed !== null && (
                        <span className="text-muted-foreground text-sm">/ {record.maxSpeedAllowed}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.speedExceeded === 1 ? (
                      <Badge variant="destructive" data-testid={`badge-speed-exceeded-${record.id}`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Sí
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getEngineStatusLabel(record.engineStatus)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {record.geofenceAlert === 1 && (
                        <Badge variant="destructive" data-testid={`badge-geofence-alert-${record.id}`}>
                          <MapPin className="h-3 w-3 mr-1" />
                          Geocerca
                        </Badge>
                      )}
                      {record.alertType && (
                        <span className="text-sm text-muted-foreground">{record.alertType}</span>
                      )}
                      {record.geofenceAlert !== 1 && !record.alertType && "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {user?.role && hasCompanyAdminAccess(user.role) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                        disabled={deleteTrackingMutation.isPending}
                        data-testid={`button-delete-${record.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Card data-testid="card-vehicle-map">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5" />
            Ubicación del Vehículo
          </CardTitle>
          <Select
            value={selectedMapVehicleId}
            onValueChange={setSelectedMapVehicleId}
          >
            <SelectTrigger className="w-[280px]" data-testid="select-map-vehicle">
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand} {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {selectedMapVehicleId && !lastKnownLocation && (
            <div className="text-center py-4 text-muted-foreground text-sm mb-2">
              No se encontraron registros GPS con coordenadas para este vehículo.
            </div>
          )}
          {selectedMapVehicleId && lastKnownLocation && (
            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
              <Badge variant={lastKnownLocation.speedExceeded ? "destructive" : "secondary"} data-testid="badge-map-speed">
                <Gauge className="h-3 w-3 mr-1" />
                {lastKnownLocation.speed !== null && lastKnownLocation.speed !== undefined
                  ? `${lastKnownLocation.speed} km/h`
                  : "Sin datos"}
              </Badge>
              <span className="text-muted-foreground">
                {lastKnownLocation.date}{lastKnownLocation.time ? ` ${lastKnownLocation.time}` : ""}
              </span>
              <span className="text-muted-foreground">
                {lastKnownLocation.lat.toFixed(5)}, {lastKnownLocation.lng.toFixed(5)}
              </span>
            </div>
          )}
          <div
            ref={mapContainerRef}
            data-testid="map-container"
            className="rounded-md border overflow-hidden"
            style={{ height: "400px", width: "100%" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
