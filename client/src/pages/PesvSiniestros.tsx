import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Trash2, AlertTriangle, Users, Skull, DollarSign, ArrowLeft, FileDown } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RoadIncident, Vehicle, Driver, Company, insertRoadIncidentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

export default function PesvSiniestros() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<RoadIncident | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyId: "",
    vehicleId: "",
    driverId: "",
    incidentDate: "",
    incidentTime: "",
    location: "",
    type: "colision" as const,
    customType: "",
    severity: "solo-danos" as const,
    description: "",
    weatherConditions: "",
    roadConditions: "",
    witnesses: "",
    authoritiesNotified: 0,
    policeReport: "",
    injuries: "" as number | string,
    fatalities: "" as number | string,
    estimatedCost: "" as number | string,
    rootCause: "",
    correctiveActions: "",
    preventiveActions: "",
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<RoadIncident[]>({
    queryKey: ["/api/road-incidents"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const filteredVehicles = isSuperadmin && formData.companyId
    ? vehicles.filter(v => v.companyId === formData.companyId)
    : vehicles;

  const filteredDrivers = isSuperadmin && formData.companyId
    ? drivers.filter(d => d.companyId === formData.companyId)
    : drivers;

  const createIncidentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRoadIncidentSchema>) => {
      const payload = isSuperadmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/road-incidents", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-incidents"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Siniestro registrado",
        description: "El siniestro vial se ha registrado exitosamente",
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

  const deleteIncidentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/road-incidents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-incidents"] });
      toast({
        title: "Siniestro eliminado",
        description: "El siniestro se ha eliminado exitosamente",
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
    
    const injuriesValue = formData.injuries === '' ? 0 : Number(formData.injuries);
    const fatalitiesValue = formData.fatalities === '' ? 0 : Number(formData.fatalities);
    const estimatedCostValue = formData.estimatedCost === '' ? undefined : Number(formData.estimatedCost);
    const data = {
      ...formData,
      injuries: injuriesValue,
      fatalities: fatalitiesValue,
      estimatedCost: estimatedCostValue,
      customType: formData.type === "otro" ? formData.customType : undefined,
      weatherConditions: formData.weatherConditions || undefined,
      roadConditions: formData.roadConditions || undefined,
      witnesses: formData.witnesses || undefined,
      policeReport: formData.policeReport || undefined,
      rootCause: formData.rootCause || undefined,
      correctiveActions: formData.correctiveActions || undefined,
      preventiveActions: formData.preventiveActions || undefined,
    };
    createIncidentMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleViewDetail = (incident: RoadIncident) => {
    setSelectedIncident(incident);
    setDetailDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      companyId: "",
      vehicleId: "",
      driverId: "",
      incidentDate: "",
      incidentTime: "",
      location: "",
      type: "colision",
      customType: "",
      severity: "solo-danos",
      description: "",
      weatherConditions: "",
      roadConditions: "",
      witnesses: "",
      authoritiesNotified: 0,
      policeReport: "",
      injuries: "",
      fatalities: "",
      estimatedCost: "",
      rootCause: "",
      correctiveActions: "",
      preventiveActions: "",
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

  const getTypeLabel = (type: string, customType?: string | null) => {
    if (type === "otro" && customType) return customType;
    const labels: Record<string, string> = {
      colision: "Colisión",
      volcamiento: "Volcamiento",
      atropello: "Atropello",
      "salida-via": "Salida de Vía",
      "choque-objeto": "Choque con Objeto",
      otro: "Otro",
    };
    return labels[type] || type;
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      "solo-danos": "Solo Daños",
      "con-heridos": "Con Heridos",
      mortal: "Mortal",
    };
    return labels[severity] || severity;
  };

  const filteredIncidents = incidents.filter((incident) => {
    const searchLower = searchTerm.toLowerCase();
    const vehiclePlate = getVehiclePlate(incident.vehicleId).toLowerCase();
    const driverName = getDriverName(incident.driverId).toLowerCase();
    const typeLabel = getTypeLabel(incident.type, incident.customType).toLowerCase();
    return vehiclePlate.includes(searchLower) || driverName.includes(searchLower) || typeLabel.includes(searchLower);
  });

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncidents = incidents.length;
  const totalInjuries = incidents.reduce((sum, i) => sum + (i.injuries || 0), 0);
  const totalFatalities = incidents.reduce((sum, i) => sum + (i.fatalities || 0), 0);
  const totalCost = incidents.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel PESV
          </Button>
        </Link>
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Siniestros Viales</h1>
          <p className="text-muted-foreground">Registro e investigación de accidentes de tránsito</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <HelpVideoButton customRoute="/pesv/siniestros" testId="button-help-video-pesv-siniestros" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/pesv/siniestros/pdf', 'siniestros-viales.pdf')}
            data-testid="button-download-siniestros-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="V02" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-incident">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Siniestro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Siniestro Vial</DialogTitle>
                <DialogDescription>Complete los detalles del siniestro</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {isSuperadmin ? (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="companyId">Empresa *</Label>
                      <Select
                        value={formData.companyId}
                        onValueChange={(value) => setFormData({ ...formData, companyId: value, vehicleId: "", driverId: "" })}
                      >
                        <SelectTrigger id="companyId" data-testid="select-company">
                          <SelectValue placeholder="Seleccionar empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : currentCompany && (
                    <div className="space-y-2 col-span-2">
                      <Label>Empresa</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-muted-foreground">
                        {currentCompany.name}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehículo *</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                      disabled={isSuperadmin && !formData.companyId}
                    >
                      <SelectTrigger id="vehicleId" data-testid="select-vehicle">
                        <SelectValue placeholder={isSuperadmin && !formData.companyId ? "Primero seleccione empresa" : "Seleccionar vehículo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVehicles.map((vehicle) => (
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
                      disabled={isSuperadmin && !formData.companyId}
                    >
                      <SelectTrigger id="driverId" data-testid="select-driver">
                        <SelectValue placeholder={isSuperadmin && !formData.companyId ? "Primero seleccione empresa" : "Seleccionar conductor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentDate">Fecha del Siniestro *</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                      required
                      data-testid="input-incident-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentTime">Hora del Siniestro *</Label>
                    <Input
                      id="incidentTime"
                      type="time"
                      value={formData.incidentTime}
                      onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                      required
                      data-testid="input-incident-time"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="Dirección o lugar del siniestro"
                      data-testid="input-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Siniestro *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type" data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colision">Colisión</SelectItem>
                        <SelectItem value="volcamiento">Volcamiento</SelectItem>
                        <SelectItem value="atropello">Atropello</SelectItem>
                        <SelectItem value="salida-via">Salida de Vía</SelectItem>
                        <SelectItem value="choque-objeto">Choque con Objeto</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.type === "otro" && (
                    <div className="space-y-2">
                      <Label htmlFor="customType">Especificar Tipo *</Label>
                      <Input
                        id="customType"
                        value={formData.customType}
                        onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                        required={formData.type === "otro"}
                        placeholder="Especifique el tipo de siniestro"
                        data-testid="input-custom-type"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severidad *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger id="severity" data-testid="select-severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo-danos">Solo Daños</SelectItem>
                        <SelectItem value="con-heridos">Con Heridos</SelectItem>
                        <SelectItem value="mortal">Mortal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción del Siniestro *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="Descripción detallada de cómo ocurrió el siniestro"
                      data-testid="input-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weatherConditions">Condiciones Climáticas</Label>
                    <Input
                      id="weatherConditions"
                      value={formData.weatherConditions}
                      onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                      placeholder="Ej: Lluvia, Despejado, Neblina"
                      data-testid="input-weather-conditions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roadConditions">Condiciones de la Vía</Label>
                    <Input
                      id="roadConditions"
                      value={formData.roadConditions}
                      onChange={(e) => setFormData({ ...formData, roadConditions: e.target.value })}
                      placeholder="Ej: Pavimentada, Húmeda, Con huecos"
                      data-testid="input-road-conditions"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="witnesses">Testigos</Label>
                    <Textarea
                      id="witnesses"
                      value={formData.witnesses}
                      onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                      placeholder="Nombres y datos de contacto de testigos"
                      data-testid="input-witnesses"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="authoritiesNotified"
                        checked={formData.authoritiesNotified === 1}
                        onCheckedChange={(checked) => setFormData({ ...formData, authoritiesNotified: checked ? 1 : 0 })}
                        data-testid="checkbox-authorities-notified"
                      />
                      <Label htmlFor="authoritiesNotified">Autoridades Notificadas</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policeReport">Número de Reporte Policial</Label>
                    <Input
                      id="policeReport"
                      value={formData.policeReport}
                      onChange={(e) => setFormData({ ...formData, policeReport: e.target.value })}
                      placeholder="Número de informe policial"
                      data-testid="input-police-report"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="injuries">Número de Lesionados *</Label>
                    <Input
                      id="injuries"
                      type="number"
                      min="0"
                      value={formData.injuries}
                      onChange={(e) => setFormData({ ...formData, injuries: e.target.value === '' ? '' : e.target.value })}
                      required
                      data-testid="input-injuries"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatalities">Número de Fallecidos *</Label>
                    <Input
                      id="fatalities"
                      type="number"
                      min="0"
                      value={formData.fatalities}
                      onChange={(e) => setFormData({ ...formData, fatalities: e.target.value === '' ? '' : e.target.value })}
                      required
                      data-testid="input-fatalities"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Costo Estimado ($)</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      min="0"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value === '' ? '' : e.target.value })}
                      placeholder="0"
                      data-testid="input-estimated-cost"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="rootCause">Causa Raíz</Label>
                    <Textarea
                      id="rootCause"
                      value={formData.rootCause}
                      onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                      placeholder="Análisis de la causa raíz del siniestro"
                      data-testid="input-root-cause"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="correctiveActions">Acciones Correctivas</Label>
                    <Textarea
                      id="correctiveActions"
                      value={formData.correctiveActions}
                      onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                      placeholder="Acciones inmediatas para corregir la situación"
                      data-testid="input-corrective-actions"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="preventiveActions">Acciones Preventivas</Label>
                    <Textarea
                      id="preventiveActions"
                      value={formData.preventiveActions}
                      onChange={(e) => setFormData({ ...formData, preventiveActions: e.target.value })}
                      placeholder="Acciones para prevenir futuros siniestros similares"
                      data-testid="input-preventive-actions"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createIncidentMutation.isPending} 
                    data-testid="button-submit-incident"
                  >
                    {createIncidentMutation.isPending ? "Guardando..." : "Registrar Siniestro"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-incidents">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siniestros</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-incidents">{totalIncidents}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-injuries">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lesionados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-injuries">{totalInjuries}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-fatalities">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fallecidos</CardTitle>
            <Skull className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-fatalities">{totalFatalities}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Estimados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cost">
              ${totalCost.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por vehículo, conductor o tipo..."
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
              <TableHead data-testid="header-date">Fecha</TableHead>
              <TableHead data-testid="header-vehicle">Vehículo</TableHead>
              <TableHead data-testid="header-driver">Conductor</TableHead>
              <TableHead data-testid="header-type">Tipo</TableHead>
              <TableHead data-testid="header-severity">Severidad</TableHead>
              <TableHead data-testid="header-injuries">Lesionados</TableHead>
              <TableHead data-testid="header-fatalities">Fallecidos</TableHead>
              <TableHead data-testid="header-actions">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidentsLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-loading">
                  Cargando siniestros...
                </TableCell>
              </TableRow>
            ) : filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-no-incidents">
                  No se encontraron siniestros
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} data-testid={`row-incident-${incident.id}`}>
                  <TableCell data-testid={`text-date-${incident.id}`}>
                    {new Date(incident.incidentDate).toLocaleDateString("es-CO")}
                  </TableCell>
                  <TableCell data-testid={`text-vehicle-${incident.id}`}>
                    {getVehiclePlate(incident.vehicleId)}
                  </TableCell>
                  <TableCell data-testid={`text-driver-${incident.id}`}>
                    {getDriverName(incident.driverId)}
                  </TableCell>
                  <TableCell data-testid={`text-type-${incident.id}`}>
                    {getTypeLabel(incident.type, incident.customType)}
                  </TableCell>
                  <TableCell data-testid={`text-severity-${incident.id}`}>
                    {getSeverityLabel(incident.severity)}
                  </TableCell>
                  <TableCell data-testid={`text-injuries-${incident.id}`}>{incident.injuries}</TableCell>
                  <TableCell data-testid={`text-fatalities-${incident.id}`}>{incident.fatalities}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(incident)}
                        data-testid={`button-view-${incident.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user?.role && hasCompanyAdminAccess(user.role) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(incident.id)}
                          disabled={deleteIncidentMutation.isPending}
                          data-testid={`button-delete-${incident.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Siniestro Vial</DialogTitle>
            <DialogDescription>
              Fecha: {selectedIncident && new Date(selectedIncident.incidentDate).toLocaleDateString("es-CO")}
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Vehículo:</p>
                  <p>{getVehiclePlate(selectedIncident.vehicleId)}</p>
                </div>
                <div>
                  <p className="font-semibold">Conductor:</p>
                  <p>{getDriverName(selectedIncident.driverId)}</p>
                </div>
                <div>
                  <p className="font-semibold">Hora:</p>
                  <p>{selectedIncident.incidentTime}</p>
                </div>
                <div>
                  <p className="font-semibold">Ubicación:</p>
                  <p>{selectedIncident.location}</p>
                </div>
                <div>
                  <p className="font-semibold">Tipo:</p>
                  <p>{getTypeLabel(selectedIncident.type, selectedIncident.customType)}</p>
                </div>
                <div>
                  <p className="font-semibold">Severidad:</p>
                  <p>{getSeverityLabel(selectedIncident.severity)}</p>
                </div>
                <div>
                  <p className="font-semibold">Lesionados:</p>
                  <p>{selectedIncident.injuries}</p>
                </div>
                <div>
                  <p className="font-semibold">Fallecidos:</p>
                  <p>{selectedIncident.fatalities}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Descripción:</p>
                <p className="text-sm">{selectedIncident.description}</p>
              </div>
              {selectedIncident.weatherConditions && (
                <div>
                  <p className="font-semibold">Condiciones Climáticas:</p>
                  <p className="text-sm">{selectedIncident.weatherConditions}</p>
                </div>
              )}
              {selectedIncident.roadConditions && (
                <div>
                  <p className="font-semibold">Condiciones de la Vía:</p>
                  <p className="text-sm">{selectedIncident.roadConditions}</p>
                </div>
              )}
              {selectedIncident.witnesses && (
                <div>
                  <p className="font-semibold">Testigos:</p>
                  <p className="text-sm">{selectedIncident.witnesses}</p>
                </div>
              )}
              <div>
                <p className="font-semibold">Autoridades Notificadas:</p>
                <p className="text-sm">{selectedIncident.authoritiesNotified ? "Sí" : "No"}</p>
              </div>
              {selectedIncident.policeReport && (
                <div>
                  <p className="font-semibold">Reporte Policial:</p>
                  <p className="text-sm">{selectedIncident.policeReport}</p>
                </div>
              )}
              {selectedIncident.estimatedCost && (
                <div>
                  <p className="font-semibold">Costo Estimado:</p>
                  <p className="text-sm">${selectedIncident.estimatedCost.toLocaleString()}</p>
                </div>
              )}
              {selectedIncident.rootCause && (
                <div>
                  <p className="font-semibold">Causa Raíz:</p>
                  <p className="text-sm">{selectedIncident.rootCause}</p>
                </div>
              )}
              {selectedIncident.correctiveActions && (
                <div>
                  <p className="font-semibold">Acciones Correctivas:</p>
                  <p className="text-sm">{selectedIncident.correctiveActions}</p>
                </div>
              )}
              {selectedIncident.preventiveActions && (
                <div>
                  <p className="font-semibold">Acciones Preventivas:</p>
                  <p className="text-sm">{selectedIncident.preventiveActions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar siniestro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro del siniestro será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteConfirmId) deleteIncidentMutation.mutate(deleteConfirmId); setDeleteConfirmId(null); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
