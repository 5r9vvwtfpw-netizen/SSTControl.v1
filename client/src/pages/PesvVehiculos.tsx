import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, ArrowLeft, FileDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Vehicle, insertVehicleSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, canWrite } from "@shared/permissions";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";

export default function PesvVehiculos() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? canWrite(user.role, 'vehicles') : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    companyId: "",
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    type: "automovil" as const,
    ownership: "propio" as const,
    capacity: "" as number | string,
    mileage: "" as number | string,
    color: "",
    vin: "",
    insurancePolicy: "",
    insuranceExpiry: "",
    soatExpiry: "",
    technicalReviewExpiry: "",
    status: "activo" as const,
    defaultMaxSpeed: "" as number | string,
    observations: "",
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });


  const createVehicleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertVehicleSchema>) => {
      const payload = isAdmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/vehicles", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Vehículo creado",
        description: "El vehículo se ha registrado exitosamente",
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

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertVehicleSchema> }) => {
      const res = await apiRequest("PATCH", `/api/vehicles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Vehículo actualizado",
        description: "Los datos del vehículo se han actualizado exitosamente",
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

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Vehículo eliminado",
        description: "El vehículo se ha eliminado exitosamente",
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

    if (!formData.soatExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento del SOAT.", variant: "destructive" });
      return;
    }
    if (!formData.technicalReviewExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento de la Tecnicomecánica.", variant: "destructive" });
      return;
    }
    
    const capacityValue = formData.capacity === '' ? undefined : Number(formData.capacity);
    const mileageValue = formData.mileage === '' ? undefined : Number(formData.mileage);
    const defaultMaxSpeedValue = formData.defaultMaxSpeed === '' ? undefined : Number(formData.defaultMaxSpeed);
    const data = {
      ...formData,
      capacity: capacityValue,
      mileage: mileageValue,
      defaultMaxSpeed: defaultMaxSpeedValue,
      color: formData.color || undefined,
      vin: formData.vin || undefined,
      insurancePolicy: formData.insurancePolicy || undefined,
      insuranceExpiry: formData.insuranceExpiry || undefined,
      soatExpiry: formData.soatExpiry || undefined,
      technicalReviewExpiry: formData.technicalReviewExpiry || undefined,
      observations: formData.observations || undefined,
    };

    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createVehicleMutation.mutate(data);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      companyId: vehicle.companyId || "",
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      ownership: vehicle.ownership,
      capacity: vehicle.capacity ?? "",
      mileage: vehicle.mileage ?? "",
      color: vehicle.color || "",
      vin: vehicle.vin || "",
      insurancePolicy: vehicle.insurancePolicy || "",
      insuranceExpiry: vehicle.insuranceExpiry || "",
      soatExpiry: vehicle.soatExpiry || "",
      technicalReviewExpiry: vehicle.technicalReviewExpiry || "",
      status: vehicle.status,
      defaultMaxSpeed: vehicle.defaultMaxSpeed ?? "",
      observations: vehicle.observations || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este vehículo?")) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      companyId: "",
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      type: "automovil",
      ownership: "propio",
      capacity: "",
      mileage: "",
      color: "",
      vin: "",
      insurancePolicy: "",
      insuranceExpiry: "",
      soatExpiry: "",
      technicalReviewExpiry: "",
      status: "activo",
      defaultMaxSpeed: "",
      observations: "",
    });
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.plate.toLowerCase().includes(searchLower) ||
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower)
    );
  });

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      automovil: "Automóvil",
      camioneta: "Camioneta",
      camion: "Camión",
      motocicleta: "Motocicleta",
      bus: "Bus",
      otro: "Otro",
    };
    return labels[type] || type;
  };

  const getExpiryBadge = (dateStr: string | null | undefined) => {
    if (!dateStr) return (
      <span className="text-xs text-muted-foreground">Sin registro</span>
    );
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return <span className="text-xs text-muted-foreground">Sin registro</span>;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const label = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (diffDays < 0) return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 rounded px-1.5 py-0.5">
        <AlertTriangle className="h-3 w-3" />{label}
      </span>
    );
    if (diffDays <= 30) return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded px-1.5 py-0.5">
        <Clock className="h-3 w-3" />{label}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded px-1.5 py-0.5">
        <CheckCircle2 className="h-3 w-3" />{label}
      </span>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      activo: "Activo",
      mantenimiento: "Mantenimiento",
      inactivo: "Inactivo",
      "dado-de-baja": "Dado de Baja",
    };
    return labels[status] || status;
  };

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Vehículos PESV</h1>
          <p className="text-muted-foreground">Gestión de flota vehicular</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <HelpVideoButton customRoute="/pesv/vehiculos" testId="button-help-video-pesv-vehiculos" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/pesv/vehiculos/pdf', 'vehiculos-pesv.pdf')}
            data-testid="button-download-vehiculos-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H08" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-vehicle">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}</DialogTitle>
                <DialogDescription>Complete los datos del vehículo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {currentCompany && (
                    <div className="space-y-2 col-span-2">
                      <Label>Empresa</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-muted-foreground">
                        {currentCompany.name}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="plate">Placa *</Label>
                    <Input
                      id="plate"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      required
                      placeholder="ABC123"
                      data-testid="input-plate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                      placeholder="Toyota"
                      data-testid="input-brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                      placeholder="Hilux"
                      data-testid="input-model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Año *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                      data-testid="input-year"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type" data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automovil">Automóvil</SelectItem>
                        <SelectItem value="camioneta">Camioneta</SelectItem>
                        <SelectItem value="camion">Camión</SelectItem>
                        <SelectItem value="motocicleta">Motocicleta</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownership">Propiedad *</Label>
                    <Select
                      value={formData.ownership}
                      onValueChange={(value: any) => setFormData({ ...formData, ownership: value })}
                    >
                      <SelectTrigger id="ownership" data-testid="select-ownership">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="propio">Propio</SelectItem>
                        <SelectItem value="arrendado">Arrendado</SelectItem>
                        <SelectItem value="contratado">Contratado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidad (pasajeros)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="0"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value === '' ? '' : e.target.value })}
                      placeholder="5"
                      data-testid="input-capacity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Kilometraje</Label>
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value === '' ? '' : e.target.value })}
                      placeholder="50000"
                      data-testid="input-mileage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultMaxSpeed">Velocidad Máxima Permitida (km/h)</Label>
                    <Input
                      id="defaultMaxSpeed"
                      type="number"
                      min="0"
                      max="200"
                      value={formData.defaultMaxSpeed}
                      onChange={(e) => setFormData({ ...formData, defaultMaxSpeed: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 80"
                      data-testid="input-default-max-speed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Blanco"
                      data-testid="input-color"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input
                      id="vin"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      placeholder="Número de identificación vehicular"
                      data-testid="input-vin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurancePolicy">Póliza Seguro</Label>
                    <Input
                      id="insurancePolicy"
                      value={formData.insurancePolicy}
                      onChange={(e) => setFormData({ ...formData, insurancePolicy: e.target.value })}
                      placeholder="Número de póliza"
                      data-testid="input-insurance-policy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceExpiry">Vencimiento Seguro</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      data-testid="input-insurance-expiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soatExpiry">Vencimiento SOAT <span className="text-red-500">*</span></Label>
                    <Input
                      id="soatExpiry"
                      type="date"
                      value={formData.soatExpiry}
                      onChange={(e) => setFormData({ ...formData, soatExpiry: e.target.value })}
                      data-testid="input-soat-expiry"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technicalReviewExpiry">Vencimiento Tecnicomecánica <span className="text-red-500">*</span></Label>
                    <Input
                      id="technicalReviewExpiry"
                      type="date"
                      value={formData.technicalReviewExpiry}
                      onChange={(e) => setFormData({ ...formData, technicalReviewExpiry: e.target.value })}
                      data-testid="input-technical-review-expiry"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="dado-de-baja">Dado de Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observations">Observaciones</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Notas adicionales sobre el vehículo"
                      data-testid="input-observations"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending} 
                    data-testid="button-submit-vehicle"
                  >
                    {createVehicleMutation.isPending || updateVehicleMutation.isPending ? "Guardando..." : "Guardar"}
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
            placeholder="Buscar por placa, marca o modelo..."
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
              <TableHead data-testid="header-plate">Placa</TableHead>
              <TableHead data-testid="header-brand">Marca</TableHead>
              <TableHead data-testid="header-model">Modelo</TableHead>
              <TableHead data-testid="header-type">Tipo</TableHead>
              <TableHead data-testid="header-soat">Venc. SOAT</TableHead>
              <TableHead data-testid="header-rtm">Venc. Tecnicomecánica</TableHead>
              <TableHead data-testid="header-status">Estado</TableHead>
              {isAdmin && <TableHead data-testid="header-actions">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehiclesLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-loading">
                  Cargando vehículos...
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-no-vehicles">
                  No se encontraron vehículos
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} data-testid={`row-vehicle-${vehicle.id}`}>
                  <TableCell data-testid={`text-plate-${vehicle.id}`}>{vehicle.plate}</TableCell>
                  <TableCell data-testid={`text-brand-${vehicle.id}`}>{vehicle.brand}</TableCell>
                  <TableCell data-testid={`text-model-${vehicle.id}`}>{vehicle.model}</TableCell>
                  <TableCell data-testid={`text-type-${vehicle.id}`}>{getVehicleTypeLabel(vehicle.type)}</TableCell>
                  <TableCell data-testid={`text-soat-${vehicle.id}`}>{getExpiryBadge(vehicle.soatExpiry)}</TableCell>
                  <TableCell data-testid={`text-rtm-${vehicle.id}`}>{getExpiryBadge(vehicle.technicalReviewExpiry)}</TableCell>
                  <TableCell data-testid={`text-status-${vehicle.id}`}>{getStatusLabel(vehicle.status)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(`/api/pesv/vehiculos/${vehicle.id}/pdf`, `vehiculo-${vehicle.plate}.pdf`)}
                          data-testid={`button-pdf-${vehicle.id}`}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(vehicle)}
                          data-testid={`button-edit-${vehicle.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deleteVehicleMutation.isPending}
                          data-testid={`button-delete-${vehicle.id}`}
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
