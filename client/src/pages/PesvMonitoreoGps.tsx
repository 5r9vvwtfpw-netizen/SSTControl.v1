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
import { Plus, Search, Trash2, ArrowLeft, MapPin, Gauge, AlertTriangle, Info, Navigation, Radio, Lock, CalendarDays, TrendingUp, CheckCircle2, XCircle, Wifi, Cable, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VehicleGpsTracking, InsertVehicleGpsTracking, insertVehicleGpsTrackingSchema, Vehicle, Driver, SstSpeedAlert } from "@shared/schema";
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
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split("T")[0]);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [showGpsGuide, setShowGpsGuide] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const realtimeMapRef = useRef<HTMLDivElement>(null);
  const realtimeMapInstanceRef = useRef<L.Map | null>(null);
  const realtimeMarkersRef = useRef<L.Marker[]>([]);
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

  const { data: activeAlerts = [] } = useQuery<SstSpeedAlert[]>({
    queryKey: ["/api/sst-speed-alerts"],
    refetchInterval: 30000,
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

  const autoPopulateFromVehicle = (vehicleId: string) => {
    const vehicleRecords = trackingRecords
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => {
        const tA = `${a.trackingDate} ${a.trackingTime || "00:00"}`;
        const tB = `${b.trackingDate} ${b.trackingTime || "00:00"}`;
        return tB.localeCompare(tA);
      });

    const latest = vehicleRecords[0];
    if (latest) {
      const speed = latest.speed ?? "";
      const maxSpeed = latest.maxSpeedAllowed ?? "";
      const isExceeded = speed !== "" && maxSpeed !== "" && Number(speed) > Number(maxSpeed);

      setFormData((prev) => ({
        ...prev,
        vehicleId,
        trackingDate: latest.trackingDate || new Date().toISOString().split("T")[0],
        trackingTime: latest.trackingTime || "",
        latitude: latest.latitude || "",
        longitude: latest.longitude || "",
        speed: speed,
        maxSpeedAllowed: maxSpeed,
        speedExceeded: isExceeded ? 1 : 0,
        engineStatus: (latest.engineStatus as "encendido" | "apagado" | "ralenti" | "") || "",
        geofenceAlert: latest.geofenceAlert ?? 0,
        alertType: isExceeded ? "Exceso de Velocidad Detectado" : (latest.alertType || ""),
        observations: latest.observations || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        vehicleId,
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
      }));
    }
  };

  const handleSpeedChange = (newSpeed: string) => {
    const speed = newSpeed === "" ? "" : Number(newSpeed);
    const maxSpeed = formData.maxSpeedAllowed === "" ? "" : Number(formData.maxSpeedAllowed);
    const isExceeded = speed !== "" && maxSpeed !== "" && Number(speed) > Number(maxSpeed);

    setFormData((prev) => ({
      ...prev,
      speed: newSpeed === "" ? "" : newSpeed,
      speedExceeded: isExceeded ? 1 : 0,
      alertType: isExceeded ? "Exceso de Velocidad Detectado" : (prev.alertType === "Exceso de Velocidad Detectado" ? "" : prev.alertType),
    }));
  };

  const handleMaxSpeedChange = (newMaxSpeed: string) => {
    const speed = formData.speed === "" ? "" : Number(formData.speed);
    const maxSpeed = newMaxSpeed === "" ? "" : Number(newMaxSpeed);
    const isExceeded = speed !== "" && maxSpeed !== "" && Number(speed) > Number(maxSpeed);

    setFormData((prev) => ({
      ...prev,
      maxSpeedAllowed: newMaxSpeed === "" ? "" : newMaxSpeed,
      speedExceeded: isExceeded ? 1 : 0,
      alertType: isExceeded ? "Exceso de Velocidad Detectado" : (prev.alertType === "Exceso de Velocidad Detectado" ? "" : prev.alertType),
    }));
  };

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
        attributionControl: false,
      });
      L.control.attribution({ prefix: false }).addTo(mapRef.current);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
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

  const vehiclesWithLocation = useMemo(() => {
    const openAlertVehicleIds = new Set(
      activeAlerts
        .filter((a) => a.status === "abierta" || a.status === "en_revision" || a.status === "accion_correctiva")
        .map((a) => a.vehicleId)
    );

    const vehicleMap = new Map<string, {
      vehicleId: string;
      plate: string;
      brand: string;
      model: string;
      lat: number;
      lng: number;
      speed: number | null;
      maxSpeed: number | null;
      date: string;
      time: string | null;
      engineStatus: string | null;
      hasActiveAlert: boolean;
      alertSeverity: string | null;
      alertCount: number;
    }>();

    for (const record of trackingRecords) {
      if (!record.latitude || !record.longitude) continue;
      const lat = parseFloat(record.latitude);
      const lng = parseFloat(record.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      const existing = vehicleMap.get(record.vehicleId);
      const recordTimestamp = `${record.trackingDate} ${record.trackingTime || "00:00"}`;
      const existingTimestamp = existing ? `${existing.date} ${existing.time || "00:00"}` : "";

      if (!existing || recordTimestamp > existingTimestamp) {
        const vehicle = vehicles.find((v) => v.id === record.vehicleId);
        const vehicleAlerts = activeAlerts.filter(
          (a) => a.vehicleId === record.vehicleId &&
            (a.status === "abierta" || a.status === "en_revision" || a.status === "accion_correctiva")
        );
        const worstSeverity = vehicleAlerts.length > 0
          ? (vehicleAlerts.some((a) => a.severity === "critica") ? "critica"
            : vehicleAlerts.some((a) => a.severity === "grave") ? "grave"
            : vehicleAlerts.some((a) => a.severity === "moderada") ? "moderada"
            : "leve")
          : null;

        vehicleMap.set(record.vehicleId, {
          vehicleId: record.vehicleId,
          plate: vehicle?.plate || "Desconocido",
          brand: vehicle?.brand || "",
          model: vehicle?.model || "",
          lat, lng,
          speed: record.speed,
          maxSpeed: record.maxSpeedAllowed,
          date: record.trackingDate,
          time: record.trackingTime,
          engineStatus: record.engineStatus,
          hasActiveAlert: openAlertVehicleIds.has(record.vehicleId),
          alertSeverity: worstSeverity,
          alertCount: vehicleAlerts.length,
        });
      }
    }
    return Array.from(vehicleMap.values());
  }, [trackingRecords, vehicles, activeAlerts]);

  useEffect(() => {
    if (!realtimeMapRef.current) return;

    if (!realtimeMapInstanceRef.current) {
      realtimeMapInstanceRef.current = L.map(realtimeMapRef.current, {
        center: [4.7110, -74.0721],
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      });
      L.control.attribution({ prefix: false }).addTo(realtimeMapInstanceRef.current);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(realtimeMapInstanceRef.current);
    }

    realtimeMarkersRef.current.forEach((m) => m.remove());
    realtimeMarkersRef.current = [];

    const bounds: L.LatLngExpression[] = [];

    for (const v of vehiclesWithLocation) {
      const color = v.hasActiveAlert ? "#ef4444" : "#3b82f6";
      const pulseRing = v.hasActiveAlert
        ? `<div style="position:absolute;top:-6px;left:-6px;width:44px;height:44px;border-radius:50%;border:2px solid ${color};animation:pulse-ring 1.5s ease-out infinite;opacity:0;"></div>`
        : "";

      const iconHtml = `<div style="position:relative;">
        ${pulseRing}
        <div style="
          background:${color};width:32px;height:32px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          position:relative;z-index:2;
        "><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>
      </div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      const severityLabels: Record<string, string> = {
        leve: "Leve", moderada: "Moderada", grave: "Grave", critica: "Crítica",
      };
      const alertInfo = v.hasActiveAlert
        ? `<div style="color:#ef4444;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            ${v.alertCount} alerta${v.alertCount > 1 ? "s" : ""} activa${v.alertCount > 1 ? "s" : ""} (${v.alertSeverity ? severityLabels[v.alertSeverity] || v.alertSeverity : ""})
          </div>`
        : '<div style="color:#22c55e;font-weight:500;margin-bottom:4px;">Sin alertas activas</div>';

      const engineLabel = v.engineStatus === "encendido" ? "Encendido" : v.engineStatus === "apagado" ? "Apagado" : v.engineStatus === "ralenti" ? "Ralentí" : null;

      const popupContent = `
        <div style="font-family:system-ui;min-width:200px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px;">${v.plate}</div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">${v.brand} ${v.model}</div>
          ${alertInfo}
          ${v.speed !== null && v.speed !== undefined ? `<div style="margin-bottom:4px;"><strong>Velocidad:</strong> ${v.speed} km/h${v.maxSpeed ? ` / ${v.maxSpeed} km/h` : ""}</div>` : ""}
          ${engineLabel ? `<div style="margin-bottom:4px;"><strong>Motor:</strong> ${engineLabel}</div>` : ""}
          <div style="font-size:11px;color:#9ca3af;margin-top:6px;">${v.date}${v.time ? ` ${v.time}` : ""} &mdash; ${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}</div>
        </div>
      `;

      const marker = L.marker([v.lat, v.lng], { icon: customIcon })
        .addTo(realtimeMapInstanceRef.current!)
        .bindPopup(popupContent);

      realtimeMarkersRef.current.push(marker);
      bounds.push([v.lat, v.lng]);
    }

    if (bounds.length > 1) {
      realtimeMapInstanceRef.current!.fitBounds(L.latLngBounds(bounds as L.LatLngExpression[]), { padding: [40, 40], maxZoom: 14 });
    } else if (bounds.length === 1) {
      realtimeMapInstanceRef.current!.setView(bounds[0] as L.LatLngExpression, 14);
    } else {
      realtimeMapInstanceRef.current!.setView([4.7110, -74.0721], 6);
    }
  }, [vehiclesWithLocation]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (realtimeMapInstanceRef.current) {
        realtimeMapInstanceRef.current.remove();
        realtimeMapInstanceRef.current = null;
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

  const dailySummary = useMemo(() => {
    const dayRecords = trackingRecords.filter((r) => r.trackingDate === summaryDate);

    const byVehicle = new Map<string, {
      vehicleId: string;
      plate: string;
      brand: string;
      model: string;
      totalRecords: number;
      lastTime: string | null;
      lastLat: string | null;
      lastLng: string | null;
      lastEngineStatus: string | null;
      maxSpeed: number;
      avgSpeed: number;
      speedLimit: number | null;
      speedExceededCount: number;
      geofenceAlertCount: number;
      alertTypes: string[];
      activeAlertCount: number;
      worstSeverity: string | null;
    }>();

    for (const record of dayRecords) {
      const vehicle = vehicles.find((v) => v.id === record.vehicleId);
      const existing = byVehicle.get(record.vehicleId);

      if (!existing) {
        const vehicleAlerts = activeAlerts.filter(
          (a) => a.vehicleId === record.vehicleId &&
            (a.status === "abierta" || a.status === "en_revision" || a.status === "accion_correctiva")
        );
        const worstSev = vehicleAlerts.length > 0
          ? (vehicleAlerts.some((a) => a.severity === "critica") ? "critica"
            : vehicleAlerts.some((a) => a.severity === "grave") ? "grave"
            : vehicleAlerts.some((a) => a.severity === "moderada") ? "moderada"
            : "leve")
          : null;

        byVehicle.set(record.vehicleId, {
          vehicleId: record.vehicleId,
          plate: vehicle?.plate || "Desconocido",
          brand: vehicle?.brand || "",
          model: vehicle?.model || "",
          totalRecords: 1,
          lastTime: record.trackingTime,
          lastLat: record.latitude,
          lastLng: record.longitude,
          lastEngineStatus: record.engineStatus,
          maxSpeed: record.speed ?? 0,
          avgSpeed: record.speed ?? 0,
          speedLimit: record.maxSpeedAllowed,
          speedExceededCount: record.speedExceeded === 1 ? 1 : 0,
          geofenceAlertCount: record.geofenceAlert === 1 ? 1 : 0,
          alertTypes: record.alertType ? [record.alertType] : [],
          activeAlertCount: vehicleAlerts.length,
          worstSeverity: worstSev,
        });
      } else {
        existing.totalRecords += 1;
        if (record.speed !== null && record.speed !== undefined) {
          if (record.speed > existing.maxSpeed) existing.maxSpeed = record.speed;
          existing.avgSpeed = ((existing.avgSpeed * (existing.totalRecords - 1)) + record.speed) / existing.totalRecords;
        }
        if (record.speedExceeded === 1) existing.speedExceededCount += 1;
        if (record.geofenceAlert === 1) existing.geofenceAlertCount += 1;
        if (record.alertType && !existing.alertTypes.includes(record.alertType)) {
          existing.alertTypes.push(record.alertType);
        }
        const recTime = record.trackingTime || "00:00";
        const existTime = existing.lastTime || "00:00";
        if (recTime > existTime) {
          existing.lastTime = record.trackingTime;
          existing.lastLat = record.latitude;
          existing.lastLng = record.longitude;
          existing.lastEngineStatus = record.engineStatus;
          existing.speedLimit = record.maxSpeedAllowed;
        }
      }
    }

    return Array.from(byVehicle.values()).sort((a, b) => {
      if (a.speedExceededCount > 0 && b.speedExceededCount === 0) return -1;
      if (b.speedExceededCount > 0 && a.speedExceededCount === 0) return 1;
      return b.totalRecords - a.totalRecords;
    });
  }, [trackingRecords, vehicles, activeAlerts, summaryDate]);

  const summaryTotals = useMemo(() => {
    const total = dailySummary.length;
    const withExcess = dailySummary.filter((v) => v.speedExceededCount > 0).length;
    const withAlerts = dailySummary.filter((v) => v.activeAlertCount > 0).length;
    const totalRecords = dailySummary.reduce((sum, v) => sum + v.totalRecords, 0);
    return { total, withExcess, withAlerts, totalRecords };
  }, [dailySummary]);

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

      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Información importante</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Este módulo solo aplica para niveles Estándar y Avanzado del PESV. Permite registrar datos de 
          monitoreo GPS, velocidad y alertas de geocerca para el control de la flota vehicular.
        </AlertDescription>
      </Alert>

      {showGpsGuide && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20" data-testid="card-gps-guide">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-amber-100 dark:bg-amber-900/40 p-2 mt-0.5">
                <Cable className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base text-amber-900 dark:text-amber-200">
                  Conecte su proveedor GPS para activar el monitoreo automático
                </CardTitle>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Para cumplir con la Resolución 40595/2022, este módulo requiere datos de un proveedor GPS con dispositivos instalados en sus vehículos.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGpsGuide(false)}
              className="shrink-0 text-amber-600 dark:text-amber-400"
              data-testid="button-close-gps-guide"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start gap-3 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-background px-3 py-3">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 w-7 h-7 flex items-center justify-center shrink-0 text-sm font-bold text-amber-700 dark:text-amber-400">1</div>
                <div>
                  <div className="font-medium text-sm">Contrate un proveedor GPS</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Elija un proveedor certificado (SkyPatrol, Ubicar, GPSTrackit, Securitrac, u otro) que instale dispositivos GPS en sus vehículos.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-background px-3 py-3">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 w-7 h-7 flex items-center justify-center shrink-0 text-sm font-bold text-amber-700 dark:text-amber-400">2</div>
                <div>
                  <div className="font-medium text-sm">Comparta la URL del Webhook</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Entregue a su proveedor la siguiente URL para que configure el envío automático de datos GPS a su plataforma SST.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-background px-3 py-3">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 w-7 h-7 flex items-center justify-center shrink-0 text-sm font-bold text-amber-700 dark:text-amber-400">3</div>
                <div>
                  <div className="font-medium text-sm">Monitoreo automático</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Una vez conectado, los datos de ubicación, velocidad y alertas llegarán automáticamente. No requiere intervención manual.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-background p-3">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span className="text-sm font-medium">URL del Webhook GPS</span>
                <Badge variant="secondary" className="text-xs">Para su proveedor</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted rounded-md px-3 py-2 text-sm font-mono break-all" data-testid="text-webhook-url">
                  {window.location.origin}/api/webhooks/gps
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/gps`);
                    setWebhookCopied(true);
                    setTimeout(() => setWebhookCopied(false), 2000);
                    toast({
                      title: "URL copiada",
                      description: "La URL del webhook GPS se ha copiado al portapapeles. Compártala con su proveedor GPS.",
                      className: "bg-yellow-50 border-yellow-200",
                    });
                  }}
                  data-testid="button-copy-webhook"
                >
                  {webhookCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Su proveedor GPS debe configurar esta URL como destino para el envío de datos. El sistema acepta formato JSON con campos en español o inglés (placa/plate, velocidad/speed, latitud/lat, etc.).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!showGpsGuide && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGpsGuide(true)}
          className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
          data-testid="button-show-gps-guide"
        >
          <Cable className="h-4 w-4 mr-2" />
          Ver guía de conexión GPS
        </Button>
      )}
      
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
                <Radio className="h-4 w-4 mr-2" />
                Vista de Monitoreo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-tracking">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  Vista de Monitoreo GPS
                </DialogTitle>
                <DialogDescription>
                  Seleccione un vehículo para cargar automáticamente sus últimos datos GPS. Los campos de ubicación son de solo lectura para garantizar la integridad ante el PESV.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-gps-tracking">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehículo *</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => {
                        autoPopulateFromVehicle(value);
                      }}
                    >
                      <SelectTrigger id="vehicleId" data-testid="select-vehicle">
                        <SelectValue placeholder="Seleccione un vehículo para cargar datos" />
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
                    <Label htmlFor="latitude" className="flex items-center gap-1.5">
                      Latitud
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-normal">(solo lectura - dato GPS)</span>
                    </Label>
                    <Input
                      id="latitude"
                      type="text"
                      value={formData.latitude}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                      placeholder="Se carga automáticamente del GPS"
                      data-testid="input-latitude"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="flex items-center gap-1.5">
                      Longitud
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-normal">(solo lectura - dato GPS)</span>
                    </Label>
                    <Input
                      id="longitude"
                      type="text"
                      value={formData.longitude}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                      placeholder="Se carga automáticamente del GPS"
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
                      onChange={(e) => handleSpeedChange(e.target.value)}
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
                      onChange={(e) => handleMaxSpeedChange(e.target.value)}
                      placeholder="Límite de velocidad"
                      data-testid="input-max-speed"
                    />
                  </div>

                  {formData.speedExceeded === 1 && (
                    <div className="col-span-2">
                      <Alert className="border-destructive/50 bg-destructive/5">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertTitle className="text-destructive">Exceso de Velocidad Detectado</AlertTitle>
                        <AlertDescription className="text-destructive/80">
                          {formData.speed && formData.maxSpeedAllowed ? (
                            <>
                              Velocidad registrada: <strong>{formData.speed} km/h</strong> — Límite permitido: <strong>{formData.maxSpeedAllowed} km/h</strong> — Exceso: <strong>+{Number(formData.speed) - Number(formData.maxSpeedAllowed)} km/h</strong>
                            </>
                          ) : (
                            "Se ha detectado un exceso de velocidad."
                          )}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

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
                    <Label htmlFor="alertType" className="flex items-center gap-1.5">
                      Tipo de Alerta
                      {formData.speedExceeded === 1 && (
                        <Badge variant="destructive" className="text-xs">Auto-detectado</Badge>
                      )}
                    </Label>
                    <Input
                      id="alertType"
                      type="text"
                      value={formData.alertType}
                      onChange={(e) => {
                        if (formData.speedExceeded !== 1) {
                          setFormData({ ...formData, alertType: e.target.value });
                        }
                      }}
                      readOnly={formData.speedExceeded === 1}
                      className={formData.speedExceeded === 1 ? "bg-destructive/5 border-destructive/30 text-destructive font-medium cursor-not-allowed" : ""}
                      placeholder="Se detecta automáticamente por velocidad"
                      data-testid="input-alert-type"
                    />
                  </div>

                  <div className="space-y-4 col-span-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="speedExceeded"
                          checked={formData.speedExceeded === 1}
                          disabled
                          data-testid="checkbox-speed-exceeded"
                        />
                        <Label htmlFor="speedExceeded" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Exceso de Velocidad <span className="text-xs text-muted-foreground">(automático)</span>
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

      <Card data-testid="card-daily-summary">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              Resumen Diario de Monitoreo
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Estado consolidado de todos los vehículos para el día seleccionado
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="date"
              value={summaryDate}
              onChange={(e) => setSummaryDate(e.target.value)}
              className="w-[180px]"
              data-testid="input-summary-date"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
              <div className="rounded-md bg-primary/10 p-2">
                <Navigation className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold" data-testid="text-summary-vehicles">{summaryTotals.total}</div>
                <div className="text-xs text-muted-foreground">Vehículos</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
              <div className="rounded-md bg-muted p-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xl font-bold" data-testid="text-summary-records">{summaryTotals.totalRecords}</div>
                <div className="text-xs text-muted-foreground">Registros GPS</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
              <div className="rounded-md bg-destructive/10 p-2">
                <Gauge className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <div className="text-xl font-bold" data-testid="text-summary-exceeded">{summaryTotals.withExcess}</div>
                <div className="text-xs text-muted-foreground">Con exceso vel.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
              <div className="rounded-md bg-orange-100 dark:bg-orange-900/30 p-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-xl font-bold" data-testid="text-summary-alerts">{summaryTotals.withAlerts}</div>
                <div className="text-xs text-muted-foreground">Alertas activas</div>
              </div>
            </div>
          </div>

          {dailySummary.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No hay registros GPS para el {summaryDate}.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead className="text-center">Registros</TableHead>
                    <TableHead className="text-center">Últ. Hora</TableHead>
                    <TableHead className="text-center">Vel. Máx</TableHead>
                    <TableHead className="text-center">Vel. Prom</TableHead>
                    <TableHead className="text-center">Límite</TableHead>
                    <TableHead className="text-center">Excesos</TableHead>
                    <TableHead className="text-center">Motor</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySummary.map((row) => {
                    const hasIssue = row.speedExceededCount > 0 || row.activeAlertCount > 0;
                    return (
                      <TableRow key={row.vehicleId} className={hasIssue ? "bg-destructive/5" : ""} data-testid={`row-summary-${row.vehicleId}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasIssue ? "bg-destructive" : "bg-green-500"}`} />
                            <div>
                              <div className="font-medium">{row.plate}</div>
                              <div className="text-xs text-muted-foreground">{row.brand} {row.model}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{row.totalRecords}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {row.lastTime || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${row.speedExceededCount > 0 ? "text-destructive" : ""}`}>
                            {row.maxSpeed > 0 ? `${row.maxSpeed} km/h` : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {row.avgSpeed > 0 ? `${Math.round(row.avgSpeed)} km/h` : "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {row.speedLimit !== null && row.speedLimit !== undefined ? `${row.speedLimit} km/h` : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.speedExceededCount > 0 ? (
                            <Badge variant="destructive" data-testid={`badge-exceeded-${row.vehicleId}`}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {row.speedExceededCount}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">0</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {row.lastEngineStatus === "encendido" ? (
                            <span className="text-green-600 dark:text-green-400">Encendido</span>
                          ) : row.lastEngineStatus === "apagado" ? (
                            <span className="text-muted-foreground">Apagado</span>
                          ) : row.lastEngineStatus === "ralenti" ? (
                            <span className="text-orange-600 dark:text-orange-400">Ralentí</span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasIssue ? (
                            <div className="flex items-center justify-center gap-1">
                              <XCircle className="h-4 w-4 text-destructive" />
                              {row.worstSeverity && (
                                <Badge variant="destructive" className="text-xs">
                                  {row.worstSeverity === "critica" ? "Crítica" : row.worstSeverity === "grave" ? "Grave" : row.worstSeverity === "moderada" ? "Moderada" : "Leve"}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <Card data-testid="card-realtime-monitor">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Monitor en Tiempo Real
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Todos los vehículos con su última posición conocida. Se actualiza cada 30 segundos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6] border-2 border-white shadow-sm" />
              <span className="text-muted-foreground">Normal</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-white shadow-sm" />
              <span className="text-muted-foreground">Con alerta</span>
            </div>
            <Badge variant="secondary" data-testid="badge-vehicle-count">
              {vehiclesWithLocation.length} vehículo{vehiclesWithLocation.length !== 1 ? "s" : ""}
            </Badge>
            {vehiclesWithLocation.filter((v) => v.hasActiveAlert).length > 0 && (
              <Badge variant="destructive" data-testid="badge-alert-count">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {vehiclesWithLocation.filter((v) => v.hasActiveAlert).length} con alerta
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {vehiclesWithLocation.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm mb-2">
              No hay vehículos con registros GPS y coordenadas disponibles.
            </div>
          )}
          <div
            ref={realtimeMapRef}
            data-testid="realtime-map-container"
            className="rounded-md border overflow-hidden"
            style={{ height: "500px", width: "100%" }}
          />
          {vehiclesWithLocation.filter((v) => v.hasActiveAlert).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Vehículos con alertas activas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {vehiclesWithLocation.filter((v) => v.hasActiveAlert).map((v) => (
                  <div
                    key={v.vehicleId}
                    className="flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
                    data-testid={`alert-vehicle-${v.vehicleId}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
                      <span className="font-medium truncate">{v.plate}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.speed !== null && v.speed !== undefined && (
                        <span className="text-muted-foreground">{v.speed} km/h</span>
                      )}
                      <Badge variant="destructive" className="text-xs">
                        {v.alertSeverity === "critica" ? "Crítica" : v.alertSeverity === "grave" ? "Grave" : v.alertSeverity === "moderada" ? "Moderada" : "Leve"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
