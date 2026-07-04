import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, ArrowLeft, Wrench, FileDown } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleMaintenance, InsertVehicleMaintenance, insertVehicleMaintenanceSchema, Vehicle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

export default function PesvMantenimientoVehicular() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  // tecnico_mecanico tiene acceso completo a este módulo (crear/editar/eliminar)
  const isAdmin = user?.role ? (hasCompanyAdminAccess(user.role) || user.role === 'tecnico_mecanico') : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<VehicleMaintenance | null>(null);
  const [formData, setFormData] = useState({
    companyId: "",
    vehicleId: "",
    maintenanceType: "preventivo" as "preventivo" | "correctivo" | "predictivo",
    description: "",
    maintenanceDate: "",
    mileageAtMaintenance: "" as number | string,
    nextMaintenanceDate: "",
    nextMaintenanceMileage: "" as number | string,
    cost: "" as number | string,
    provider: "",
    invoiceNumber: "",
    partsReplaced: "",
    observations: "",
    documentUrl: "",
  });

  const { data: maintenances = [], isLoading: maintenancesLoading } = useQuery<VehicleMaintenance[]>({
    queryKey: ["/api/vehicle-maintenances"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertVehicleMaintenanceSchema>) => {
      const payload = isAdmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/vehicle-maintenances", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-maintenances"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Mantenimiento registrado",
        description: "El mantenimiento se ha registrado exitosamente",
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

  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertVehicleMaintenanceSchema> }) => {
      const res = await apiRequest("PATCH", `/api/vehicle-maintenances/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-maintenances"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Mantenimiento actualizado",
        description: "Los datos del mantenimiento se han actualizado exitosamente",
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

  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vehicle-maintenances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-maintenances"] });
      toast({
        title: "Mantenimiento eliminado",
        description: "El registro de mantenimiento se ha eliminado exitosamente",
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
    
    const mileageAtMaintenanceValue = formData.mileageAtMaintenance === '' ? undefined : Number(formData.mileageAtMaintenance);
    const nextMaintenanceMileageValue = formData.nextMaintenanceMileage === '' ? undefined : Number(formData.nextMaintenanceMileage);
    const costValue = formData.cost === '' ? undefined : Number(formData.cost);
    
    const data = {
      ...formData,
      mileageAtMaintenance: mileageAtMaintenanceValue,
      nextMaintenanceMileage: nextMaintenanceMileageValue,
      cost: costValue,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      provider: formData.provider || undefined,
      invoiceNumber: formData.invoiceNumber || undefined,
      partsReplaced: formData.partsReplaced || undefined,
      observations: formData.observations || undefined,
      documentUrl: formData.documentUrl || undefined,
    };

    if (editingMaintenance) {
      updateMaintenanceMutation.mutate({ id: editingMaintenance.id, data });
    } else {
      createMaintenanceMutation.mutate(data);
    }
  };

  const handleEdit = (maintenance: VehicleMaintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      companyId: maintenance.companyId || "",
      vehicleId: maintenance.vehicleId,
      maintenanceType: maintenance.maintenanceType,
      description: maintenance.description,
      maintenanceDate: maintenance.maintenanceDate,
      mileageAtMaintenance: maintenance.mileageAtMaintenance ?? "",
      nextMaintenanceDate: maintenance.nextMaintenanceDate || "",
      nextMaintenanceMileage: maintenance.nextMaintenanceMileage ?? "",
      cost: maintenance.cost ?? "",
      provider: maintenance.provider || "",
      invoiceNumber: maintenance.invoiceNumber || "",
      partsReplaced: maintenance.partsReplaced || "",
      observations: maintenance.observations || "",
      documentUrl: maintenance.documentUrl || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro de mantenimiento?")) {
      deleteMaintenanceMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingMaintenance(null);
    setFormData({
      companyId: "",
      vehicleId: "",
      maintenanceType: "preventivo",
      description: "",
      maintenanceDate: "",
      mileageAtMaintenance: "",
      nextMaintenanceDate: "",
      nextMaintenanceMileage: "",
      cost: "",
      provider: "",
      invoiceNumber: "",
      partsReplaced: "",
      observations: "",
      documentUrl: "",
    });
  };

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.plate : "Desconocido";
  };

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const searchLower = searchTerm.toLowerCase();
    const vehiclePlate = getVehiclePlate(maintenance.vehicleId).toLowerCase();
    return (
      vehiclePlate.includes(searchLower) ||
      maintenance.description.toLowerCase().includes(searchLower) ||
      maintenance.maintenanceType.toLowerCase().includes(searchLower) ||
      (maintenance.provider && maintenance.provider.toLowerCase().includes(searchLower))
    );
  });

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      preventivo: "Preventivo",
      correctivo: "Correctivo",
      predictivo: "Predictivo",
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO');
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Wrench className="h-8 w-8" />
            Mantenimiento Vehicular PESV
          </h1>
          <p className="text-muted-foreground">Gestión de mantenimientos preventivos, correctivos y predictivos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <HelpVideoButton customRoute="/pesv/mantenimiento" testId="button-help-video-pesv-mantenimiento" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/pesv/mantenimientos/pdf', 'mantenimientos-pesv.pdf')}
            data-testid="button-download-mantenimientos-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H09" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-maintenance">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Mantenimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-maintenance">
              <DialogHeader>
                <DialogTitle>{editingMaintenance ? "Editar Mantenimiento" : "Registrar Nuevo Mantenimiento"}</DialogTitle>
                <DialogDescription>Complete los datos del mantenimiento vehicular</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-maintenance">
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
                    <Label htmlFor="vehicleId">Vehículo *</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    >
                      <SelectTrigger id="vehicleId" data-testid="select-vehicle">
                        <SelectValue placeholder="Seleccionar vehículo" />
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
                    <Label htmlFor="maintenanceType">Tipo de Mantenimiento *</Label>
                    <Select
                      value={formData.maintenanceType}
                      onValueChange={(value: any) => setFormData({ ...formData, maintenanceType: value })}
                    >
                      <SelectTrigger id="maintenanceType" data-testid="select-maintenance-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventivo">Preventivo</SelectItem>
                        <SelectItem value="correctivo">Correctivo</SelectItem>
                        <SelectItem value="predictivo">Predictivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="Describa el mantenimiento realizado"
                      data-testid="input-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceDate">Fecha de Mantenimiento *</Label>
                    <Input
                      id="maintenanceDate"
                      type="date"
                      value={formData.maintenanceDate}
                      onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                      required
                      data-testid="input-maintenance-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileageAtMaintenance">Kilometraje al Mantenimiento</Label>
                    <Input
                      id="mileageAtMaintenance"
                      type="number"
                      min="0"
                      value={formData.mileageAtMaintenance}
                      onChange={(e) => setFormData({ ...formData, mileageAtMaintenance: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 50000"
                      data-testid="input-mileage-at-maintenance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextMaintenanceDate">Próxima Fecha de Mantenimiento</Label>
                    <Input
                      id="nextMaintenanceDate"
                      type="date"
                      value={formData.nextMaintenanceDate}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                      data-testid="input-next-maintenance-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextMaintenanceMileage">Próximo Kilometraje de Mantenimiento</Label>
                    <Input
                      id="nextMaintenanceMileage"
                      type="number"
                      min="0"
                      value={formData.nextMaintenanceMileage}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceMileage: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 60000"
                      data-testid="input-next-maintenance-mileage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 500000"
                      data-testid="input-cost"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Proveedor</Label>
                    <Input
                      id="provider"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      placeholder="Nombre del taller o proveedor"
                      data-testid="input-provider"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Número de Factura</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      placeholder="Ej: FAC-2024-001"
                      data-testid="input-invoice-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentUrl">URL Documento Soporte</Label>
                    <Input
                      id="documentUrl"
                      value={formData.documentUrl}
                      onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                      placeholder="https://..."
                      data-testid="input-document-url"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="partsReplaced">Partes Reemplazadas</Label>
                    <Textarea
                      id="partsReplaced"
                      value={formData.partsReplaced}
                      onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
                      placeholder="Lista de repuestos o partes cambiadas"
                      data-testid="input-parts-replaced"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observations">Observaciones</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Notas adicionales sobre el mantenimiento"
                      data-testid="input-observations"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMaintenanceMutation.isPending || updateMaintenanceMutation.isPending} 
                    data-testid="button-submit-maintenance"
                  >
                    {createMaintenanceMutation.isPending || updateMaintenanceMutation.isPending ? "Guardando..." : "Guardar"}
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
            placeholder="Buscar por placa, descripción, tipo o proveedor..."
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
              <TableHead data-testid="header-vehicle">Vehículo</TableHead>
              <TableHead data-testid="header-type">Tipo</TableHead>
              <TableHead data-testid="header-date">Fecha</TableHead>
              <TableHead data-testid="header-cost">Costo</TableHead>
              <TableHead data-testid="header-next-maintenance">Próximo Mant.</TableHead>
              {isAdmin && <TableHead data-testid="header-actions">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenancesLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center" data-testid="text-loading">
                  Cargando mantenimientos...
                </TableCell>
              </TableRow>
            ) : filteredMaintenances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center" data-testid="text-no-maintenances">
                  No se encontraron registros de mantenimiento
                </TableCell>
              </TableRow>
            ) : (
              filteredMaintenances.map((maintenance) => (
                <TableRow key={maintenance.id} data-testid={`row-maintenance-${maintenance.id}`}>
                  <TableCell data-testid={`text-vehicle-${maintenance.id}`}>{getVehiclePlate(maintenance.vehicleId)}</TableCell>
                  <TableCell data-testid={`text-type-${maintenance.id}`}>{getMaintenanceTypeLabel(maintenance.maintenanceType)}</TableCell>
                  <TableCell data-testid={`text-date-${maintenance.id}`}>{formatDate(maintenance.maintenanceDate)}</TableCell>
                  <TableCell data-testid={`text-cost-${maintenance.id}`}>{formatCurrency(maintenance.cost)}</TableCell>
                  <TableCell data-testid={`text-next-maintenance-${maintenance.id}`}>{formatDate(maintenance.nextMaintenanceDate)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(`/api/pesv/mantenimientos/${maintenance.id}/pdf`, `mantenimiento-${maintenance.id}.pdf`)}
                          data-testid={`button-pdf-${maintenance.id}`}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(maintenance)}
                          data-testid={`button-edit-${maintenance.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(maintenance.id)}
                          disabled={deleteMaintenanceMutation.isPending}
                          data-testid={`button-delete-${maintenance.id}`}
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
