import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SafeRoute, insertSafeRouteSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

export default function PesvRutasSeguras() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<SafeRoute | null>(null);
  const [formData, setFormData] = useState({
    companyId: "",
    routeName: "",
    origin: "",
    destination: "",
    distance: "" as number | string,
    estimatedTime: "" as number | string,
    routeType: "urbana" as "urbana" | "rural" | "mixta" | "autopista",
    riskLevel: "bajo" as "bajo" | "medio" | "alto" | "muy_alto",
    criticalPoints: "",
    speedLimits: "",
    restStops: "",
    emergencyContacts: "",
    restrictions: "",
    mapUrl: "",
    isActive: 1 as number,
    observations: "",
  });

  const { data: safeRoutes = [], isLoading: routesLoading } = useQuery<SafeRoute[]>({
    queryKey: ["/api/safe-routes"],
  });

  const createRouteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSafeRouteSchema>) => {
      const payload = isAdmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/safe-routes", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Ruta creada",
        description: "La ruta segura se ha registrado exitosamente",
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

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertSafeRouteSchema> }) => {
      const res = await apiRequest("PATCH", `/api/safe-routes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Ruta actualizada",
        description: "Los datos de la ruta se han actualizado exitosamente",
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

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/safe-routes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });
      toast({
        title: "Ruta eliminada",
        description: "La ruta se ha eliminado exitosamente",
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
    
    const distanceValue = formData.distance === '' ? undefined : Number(formData.distance);
    const estimatedTimeValue = formData.estimatedTime === '' ? undefined : Number(formData.estimatedTime);
    const data = {
      ...formData,
      distance: distanceValue,
      estimatedTime: estimatedTimeValue,
      criticalPoints: formData.criticalPoints || undefined,
      speedLimits: formData.speedLimits || undefined,
      restStops: formData.restStops || undefined,
      emergencyContacts: formData.emergencyContacts || undefined,
      restrictions: formData.restrictions || undefined,
      mapUrl: formData.mapUrl || undefined,
      observations: formData.observations || undefined,
    };

    if (editingRoute) {
      updateRouteMutation.mutate({ id: editingRoute.id, data });
    } else {
      createRouteMutation.mutate(data);
    }
  };

  const handleEdit = (route: SafeRoute) => {
    setEditingRoute(route);
    setFormData({
      companyId: route.companyId || "",
      routeName: route.routeName,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance ?? "",
      estimatedTime: route.estimatedTime ?? "",
      routeType: route.routeType,
      riskLevel: route.riskLevel,
      criticalPoints: route.criticalPoints || "",
      speedLimits: route.speedLimits || "",
      restStops: route.restStops || "",
      emergencyContacts: route.emergencyContacts || "",
      restrictions: route.restrictions || "",
      mapUrl: route.mapUrl || "",
      isActive: route.isActive,
      observations: route.observations || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta ruta?")) {
      deleteRouteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingRoute(null);
    setFormData({
      companyId: "",
      routeName: "",
      origin: "",
      destination: "",
      distance: "",
      estimatedTime: "",
      routeType: "urbana",
      riskLevel: "bajo",
      criticalPoints: "",
      speedLimits: "",
      restStops: "",
      emergencyContacts: "",
      restrictions: "",
      mapUrl: "",
      isActive: 1,
      observations: "",
    });
  };

  const filteredRoutes = safeRoutes.filter((route) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      route.routeName.toLowerCase().includes(searchLower) ||
      route.origin.toLowerCase().includes(searchLower) ||
      route.destination.toLowerCase().includes(searchLower)
    );
  });

  const getRouteTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      urbana: "Urbana",
      rural: "Rural",
      mixta: "Mixta",
      autopista: "Autopista",
    };
    return labels[type] || type;
  };

  const getRiskLevelBadge = (level: string) => {
    const config: Record<string, { label: string; className: string }> = {
      bajo: { label: "Bajo", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      medio: { label: "Medio", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      alto: { label: "Alto", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
      muy_alto: { label: "Muy Alto", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    };
    const { label, className } = config[level] || { label: level, className: "" };
    return <Badge className={className} data-testid={`badge-risk-${level}`}>{label}</Badge>;
  };

  const getStatusLabel = (isActive: number) => {
    return isActive === 1 ? "Activo" : "Inactivo";
  };

  const formatDistance = (distance: number | null | undefined) => {
    if (distance === null || distance === undefined) return "-";
    return `${distance} km`;
  };

  const formatTime = (minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined) return "-";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm" data-testid="button-back-pesv">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToEvaluationButton />
        <Link href="/pesv/evaluaciones">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md" data-testid="button-ir-evaluacion-pesv">
            <Search className="h-4 w-4 mr-2" />
            Ir a Evaluación PESV
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Rutas Seguras PESV</h1>
          <p className="text-muted-foreground">Gestión de rutas seguras para desplazamientos</p>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H08" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-route">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ruta Segura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-route">
              <DialogHeader>
                <DialogTitle>{editingRoute ? "Editar Ruta Segura" : "Registrar Nueva Ruta Segura"}</DialogTitle>
                <DialogDescription>Complete los datos de la ruta segura</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-route">
                <div className="grid grid-cols-2 gap-4">
                  {currentCompany && (
                    <div className="space-y-2 col-span-2">
                      <Label>Empresa</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-muted-foreground">
                        {currentCompany.name}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="routeName">Nombre de la Ruta *</Label>
                    <Input
                      id="routeName"
                      value={formData.routeName}
                      onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                      required
                      placeholder="Ej: Ruta Bogotá - Medellín"
                      data-testid="input-route-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origen *</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      required
                      placeholder="Ciudad o punto de origen"
                      data-testid="input-origin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destino *</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      required
                      placeholder="Ciudad o punto de destino"
                      data-testid="input-destination"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distancia (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      min="0"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 450"
                      data-testid="input-distance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Tiempo Estimado (minutos)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="0"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 480 (8 horas)"
                      data-testid="input-estimated-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routeType">Tipo de Ruta *</Label>
                    <Select
                      value={formData.routeType}
                      onValueChange={(value: any) => setFormData({ ...formData, routeType: value })}
                    >
                      <SelectTrigger id="routeType" data-testid="select-route-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urbana">Urbana</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                        <SelectItem value="mixta">Mixta</SelectItem>
                        <SelectItem value="autopista">Autopista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Nivel de Riesgo *</Label>
                    <Select
                      value={formData.riskLevel}
                      onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}
                    >
                      <SelectTrigger id="riskLevel" data-testid="select-risk-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bajo">Bajo</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="muy_alto">Muy Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="criticalPoints">Puntos Críticos</Label>
                    <Textarea
                      id="criticalPoints"
                      value={formData.criticalPoints}
                      onChange={(e) => setFormData({ ...formData, criticalPoints: e.target.value })}
                      placeholder="Puntos de alto riesgo en la ruta (curvas peligrosas, zonas de derrumbe, etc.)"
                      data-testid="input-critical-points"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="speedLimits">Límites de Velocidad</Label>
                    <Textarea
                      id="speedLimits"
                      value={formData.speedLimits}
                      onChange={(e) => setFormData({ ...formData, speedLimits: e.target.value })}
                      placeholder="Límites de velocidad por tramo (ej: Km 0-50: 80km/h, Km 50-100: 60km/h)"
                      data-testid="input-speed-limits"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restStops">Lugares de Descanso</Label>
                    <Textarea
                      id="restStops"
                      value={formData.restStops}
                      onChange={(e) => setFormData({ ...formData, restStops: e.target.value })}
                      placeholder="Estaciones de servicio, paraderos autorizados"
                      data-testid="input-rest-stops"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContacts">Contactos de Emergencia</Label>
                    <Textarea
                      id="emergencyContacts"
                      value={formData.emergencyContacts}
                      onChange={(e) => setFormData({ ...formData, emergencyContacts: e.target.value })}
                      placeholder="Números de emergencia, hospitales en ruta, etc."
                      data-testid="input-emergency-contacts"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="restrictions">Restricciones</Label>
                    <Textarea
                      id="restrictions"
                      value={formData.restrictions}
                      onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                      placeholder="Restricciones de tránsito, horarios, tipos de vehículos, etc."
                      data-testid="input-restrictions"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="mapUrl">URL del Mapa</Label>
                    <Input
                      id="mapUrl"
                      type="url"
                      value={formData.mapUrl}
                      onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      data-testid="input-map-url"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive === 1}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
                        data-testid="checkbox-is-active"
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">Ruta Activa</Label>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observations">Observaciones</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Notas adicionales sobre la ruta"
                      data-testid="input-observations"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createRouteMutation.isPending || updateRouteMutation.isPending} 
                    data-testid="button-submit-route"
                  >
                    {createRouteMutation.isPending || updateRouteMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, origen o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-route-name">Nombre Ruta</TableHead>
              <TableHead data-testid="header-origin-destination">Origen → Destino</TableHead>
              <TableHead data-testid="header-distance">Distancia</TableHead>
              <TableHead data-testid="header-time">Tiempo Est.</TableHead>
              <TableHead data-testid="header-type">Tipo</TableHead>
              <TableHead data-testid="header-risk-level">Nivel Riesgo</TableHead>
              <TableHead data-testid="header-status">Estado</TableHead>
              {user?.role && hasCompanyAdminAccess(user.role) && <TableHead data-testid="header-actions">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {routesLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-loading">
                  Cargando rutas...
                </TableCell>
              </TableRow>
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-no-routes">
                  No se encontraron rutas seguras
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.id} data-testid={`row-route-${route.id}`}>
                  <TableCell data-testid={`text-route-name-${route.id}`}>{route.routeName}</TableCell>
                  <TableCell data-testid={`text-origin-destination-${route.id}`}>
                    {route.origin} → {route.destination}
                  </TableCell>
                  <TableCell data-testid={`text-distance-${route.id}`}>{formatDistance(route.distance)}</TableCell>
                  <TableCell data-testid={`text-time-${route.id}`}>{formatTime(route.estimatedTime)}</TableCell>
                  <TableCell data-testid={`text-type-${route.id}`}>{getRouteTypeLabel(route.routeType)}</TableCell>
                  <TableCell data-testid={`text-risk-level-${route.id}`}>{getRiskLevelBadge(route.riskLevel)}</TableCell>
                  <TableCell data-testid={`text-status-${route.id}`}>{getStatusLabel(route.isActive)}</TableCell>
                  {user?.role && hasCompanyAdminAccess(user.role) && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(route)}
                          data-testid={`button-edit-${route.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(route.id)}
                          disabled={deleteRouteMutation.isPending}
                          data-testid={`button-delete-${route.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
