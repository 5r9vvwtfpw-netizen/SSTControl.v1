import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleInspection, Vehicle, Driver, insertVehicleInspectionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { Link } from "wouter";

export default function PesvInspecciones() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
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
    result: "apto" as const,
    observations: "",
    correctiveActions: "",
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery<VehicleInspection[]>({
    queryKey: ["/api/vehicle-inspections"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertVehicleInspectionSchema>) => {
      const res = await apiRequest("POST", "/api/vehicle-inspections", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Inspección registrada",
        description: "La inspección preoperacional se ha registrado exitosamente",
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

  const deleteInspectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/vehicle-inspections/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      toast({
        title: "Inspección eliminada",
        description: "La inspección se ha eliminado exitosamente",
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
    
    const data = {
      ...formData,
      observations: formData.observations || undefined,
      correctiveActions: formData.correctiveActions || undefined,
    };
    createInspectionMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta inspección?")) {
      deleteInspectionMutation.mutate(id);
    }
  };

  const handleViewDetail = (inspection: VehicleInspection) => {
    setSelectedInspection(inspection);
    setDetailDialogOpen(true);
  };

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

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.plate || "N/A";
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || "N/A";
  };

  const getResultLabel = (result: string) => {
    const labels: Record<string, string> = {
      apto: "Apto",
      "apto-con-observaciones": "Apto con Observaciones",
      "no-apto": "No Apto",
    };
    return labels[result] || result;
  };

  const filteredInspections = inspections.filter((inspection) => {
    const searchLower = searchTerm.toLowerCase();
    const vehiclePlate = getVehiclePlate(inspection.vehicleId).toLowerCase();
    const driverName = getDriverName(inspection.driverId).toLowerCase();
    return vehiclePlate.includes(searchLower) || driverName.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Inspecciones Preoperacionales</h1>
          <p className="text-muted-foreground">Revisiones diarias de vehículos antes de operar</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-inspection">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Inspección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Inspección Preoperacional</DialogTitle>
              <DialogDescription>Complete todos los ítems de verificación</DialogDescription>
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
                  <Label htmlFor="vehicleId">Vehículo *</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                  >
                    <SelectTrigger id="vehicleId" data-testid="select-vehicle">
                      <SelectValue placeholder="Seleccionar vehículo" />
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
                    <SelectTrigger id="driverId" data-testid="select-driver">
                      <SelectValue placeholder="Seleccionar conductor" />
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
                  <Label htmlFor="inspectionDate">Fecha de Inspección *</Label>
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
                  <Label htmlFor="inspectionTime">Hora de Inspección *</Label>
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

              <div className="space-y-3">
                <h3 className="font-semibold">Revisión Exterior</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tires"
                      checked={formData.tires === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, tires: checked ? 1 : 0 })}
                      data-testid="checkbox-tires"
                    />
                    <Label htmlFor="tires">Neumáticos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lights"
                      checked={formData.lights === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, lights: checked ? 1 : 0 })}
                      data-testid="checkbox-lights"
                    />
                    <Label htmlFor="lights">Luces</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mirrors"
                      checked={formData.mirrors === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, mirrors: checked ? 1 : 0 })}
                      data-testid="checkbox-mirrors"
                    />
                    <Label htmlFor="mirrors">Espejos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bodywork"
                      checked={formData.bodywork === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, bodywork: checked ? 1 : 0 })}
                      data-testid="checkbox-bodywork"
                    />
                    <Label htmlFor="bodywork">Carrocería</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Revisión Interior</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seatbelts"
                      checked={formData.seatbelts === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, seatbelts: checked ? 1 : 0 })}
                      data-testid="checkbox-seatbelts"
                    />
                    <Label htmlFor="seatbelts">Cinturones de Seguridad</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="horn"
                      checked={formData.horn === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, horn: checked ? 1 : 0 })}
                      data-testid="checkbox-horn"
                    />
                    <Label htmlFor="horn">Pito/Claxon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="windshield"
                      checked={formData.windshield === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, windshield: checked ? 1 : 0 })}
                      data-testid="checkbox-windshield"
                    />
                    <Label htmlFor="windshield">Parabrisas/Limpiabrisas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instruments"
                      checked={formData.instruments === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, instruments: checked ? 1 : 0 })}
                      data-testid="checkbox-instruments"
                    />
                    <Label htmlFor="instruments">Instrumentos/Panel</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Revisión Mecánica</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="brakes"
                      checked={formData.brakes === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, brakes: checked ? 1 : 0 })}
                      data-testid="checkbox-brakes"
                    />
                    <Label htmlFor="brakes">Frenos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="steering"
                      checked={formData.steering === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, steering: checked ? 1 : 0 })}
                      data-testid="checkbox-steering"
                    />
                    <Label htmlFor="steering">Dirección</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="suspension"
                      checked={formData.suspension === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, suspension: checked ? 1 : 0 })}
                      data-testid="checkbox-suspension"
                    />
                    <Label htmlFor="suspension">Suspensión</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fluids"
                      checked={formData.fluids === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, fluids: checked ? 1 : 0 })}
                      data-testid="checkbox-fluids"
                    />
                    <Label htmlFor="fluids">Niveles de Fluidos</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Kit de Seguridad</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fireExtinguisher"
                      checked={formData.fireExtinguisher === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, fireExtinguisher: checked ? 1 : 0 })}
                      data-testid="checkbox-fire-extinguisher"
                    />
                    <Label htmlFor="fireExtinguisher">Extintor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="firstAidKit"
                      checked={formData.firstAidKit === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, firstAidKit: checked ? 1 : 0 })}
                      data-testid="checkbox-first-aid-kit"
                    />
                    <Label htmlFor="firstAidKit">Botiquín</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reflectiveTriangles"
                      checked={formData.reflectiveTriangles === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, reflectiveTriangles: checked ? 1 : 0 })}
                      data-testid="checkbox-reflective-triangles"
                    />
                    <Label htmlFor="reflectiveTriangles">Triángulos Reflectivos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="safetyVest"
                      checked={formData.safetyVest === 1}
                      onCheckedChange={(checked) => setFormData({ ...formData, safetyVest: checked ? 1 : 0 })}
                      data-testid="checkbox-safety-vest"
                    />
                    <Label htmlFor="safetyVest">Chaleco Reflectivo</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="result">Resultado de la Inspección *</Label>
                  <Select
                    value={formData.result}
                    onValueChange={(value: any) => setFormData({ ...formData, result: value })}
                  >
                    <SelectTrigger id="result" data-testid="select-result">
                      <SelectValue />
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
                    placeholder="Detalles de hallazgos o problemas encontrados"
                    data-testid="input-observations"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correctiveActions">Acciones Correctivas</Label>
                  <Textarea
                    id="correctiveActions"
                    value={formData.correctiveActions}
                    onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                    placeholder="Acciones tomadas o programadas para corregir hallazgos"
                    data-testid="input-corrective-actions"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createInspectionMutation.isPending} 
                  data-testid="button-submit-inspection"
                >
                  {createInspectionMutation.isPending ? "Guardando..." : "Guardar Inspección"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por vehículo o conductor..."
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
              <TableHead data-testid="header-result">Resultado</TableHead>
              <TableHead data-testid="header-actions">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspectionsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center" data-testid="text-loading">
                  Cargando inspecciones...
                </TableCell>
              </TableRow>
            ) : filteredInspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center" data-testid="text-no-inspections">
                  No se encontraron inspecciones
                </TableCell>
              </TableRow>
            ) : (
              filteredInspections.map((inspection) => (
                <TableRow key={inspection.id} data-testid={`row-inspection-${inspection.id}`}>
                  <TableCell data-testid={`text-date-${inspection.id}`}>
                    {new Date(inspection.inspectionDate).toLocaleDateString("es-CO")}
                  </TableCell>
                  <TableCell data-testid={`text-vehicle-${inspection.id}`}>
                    {getVehiclePlate(inspection.vehicleId)}
                  </TableCell>
                  <TableCell data-testid={`text-driver-${inspection.id}`}>
                    {getDriverName(inspection.driverId)}
                  </TableCell>
                  <TableCell data-testid={`text-result-${inspection.id}`}>
                    {getResultLabel(inspection.result)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(inspection)}
                        data-testid={`button-view-${inspection.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user?.role && hasCompanyAdminAccess(user.role) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inspection.id)}
                          disabled={deleteInspectionMutation.isPending}
                          data-testid={`button-delete-${inspection.id}`}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Inspección Preoperacional</DialogTitle>
            <DialogDescription>
              Fecha: {selectedInspection && new Date(selectedInspection.inspectionDate).toLocaleDateString("es-CO")}
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Vehículo:</p>
                  <p>{getVehiclePlate(selectedInspection.vehicleId)}</p>
                </div>
                <div>
                  <p className="font-semibold">Conductor:</p>
                  <p>{getDriverName(selectedInspection.driverId)}</p>
                </div>
                <div>
                  <p className="font-semibold">Hora:</p>
                  <p>{selectedInspection.inspectionTime}</p>
                </div>
                <div>
                  <p className="font-semibold">Resultado:</p>
                  <p>{getResultLabel(selectedInspection.result)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Ítems Revisados:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Neumáticos: {selectedInspection.tires ? "✓" : "✗"}</p>
                  <p>Luces: {selectedInspection.lights ? "✓" : "✗"}</p>
                  <p>Espejos: {selectedInspection.mirrors ? "✓" : "✗"}</p>
                  <p>Carrocería: {selectedInspection.bodywork ? "✓" : "✗"}</p>
                  <p>Cinturones: {selectedInspection.seatbelts ? "✓" : "✗"}</p>
                  <p>Pito: {selectedInspection.horn ? "✓" : "✗"}</p>
                  <p>Parabrisas: {selectedInspection.windshield ? "✓" : "✗"}</p>
                  <p>Instrumentos: {selectedInspection.instruments ? "✓" : "✗"}</p>
                  <p>Frenos: {selectedInspection.brakes ? "✓" : "✗"}</p>
                  <p>Dirección: {selectedInspection.steering ? "✓" : "✗"}</p>
                  <p>Suspensión: {selectedInspection.suspension ? "✓" : "✗"}</p>
                  <p>Fluidos: {selectedInspection.fluids ? "✓" : "✗"}</p>
                  <p>Extintor: {selectedInspection.fireExtinguisher ? "✓" : "✗"}</p>
                  <p>Botiquín: {selectedInspection.firstAidKit ? "✓" : "✗"}</p>
                  <p>Triángulos: {selectedInspection.reflectiveTriangles ? "✓" : "✗"}</p>
                  <p>Chaleco: {selectedInspection.safetyVest ? "✓" : "✗"}</p>
                </div>
              </div>
              {selectedInspection.observations && (
                <div>
                  <p className="font-semibold">Observaciones:</p>
                  <p className="text-sm">{selectedInspection.observations}</p>
                </div>
              )}
              {selectedInspection.correctiveActions && (
                <div>
                  <p className="font-semibold">Acciones Correctivas:</p>
                  <p className="text-sm">{selectedInspection.correctiveActions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
