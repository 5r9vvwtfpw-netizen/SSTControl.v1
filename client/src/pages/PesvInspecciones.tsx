import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Trash2, ArrowLeft, FileDown, CheckCircle2, XCircle, AlertCircle, CheckSquare, XSquare, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleInspection, Vehicle, Driver, insertVehicleInspectionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

const ITEMS_INSPECCION = [
  {
    grupo: "Exterior",
    items: [
      { key: "tires" as const, label: "Llantas / Neumáticos", critical: true },
      { key: "lights" as const, label: "Luces" },
      { key: "mirrors" as const, label: "Espejos" },
      { key: "bodywork" as const, label: "Carrocería" },
    ],
  },
  {
    grupo: "Interior",
    items: [
      { key: "seatbelts" as const, label: "Cinturones de seguridad" },
      { key: "horn" as const, label: "Bocina / Pito" },
      { key: "windshield" as const, label: "Parabrisas / Limpiabrisas" },
      { key: "instruments" as const, label: "Instrumentos / Tablero" },
    ],
  },
  {
    grupo: "Mecánica",
    items: [
      { key: "brakes" as const, label: "Frenos", critical: true },
      { key: "steering" as const, label: "Dirección" },
      { key: "suspension" as const, label: "Suspensión" },
      { key: "fluids" as const, label: "Fluidos (aceite, refrigerante)" },
    ],
  },
  {
    grupo: "Equipos de seguridad",
    items: [
      { key: "fireExtinguisher" as const, label: "Extintor", critical: true },
      { key: "firstAidKit" as const, label: "Botiquín de primeros auxilios" },
      { key: "reflectiveTriangles" as const, label: "Triángulos reflectivos" },
      { key: "safetyVest" as const, label: "Chaleco reflectivo" },
    ],
  },
];

type ItemKey = "tires" | "lights" | "mirrors" | "bodywork" | "seatbelts" | "horn" | "windshield" | "instruments" | "brakes" | "steering" | "suspension" | "fluids" | "fireExtinguisher" | "firstAidKit" | "reflectiveTriangles" | "safetyVest";

function computeResult(data: Record<ItemKey, number>): "apto" | "apto-con-observaciones" | "no-apto" {
  const criticalKeys: ItemKey[] = ["tires", "brakes", "fireExtinguisher"];
  if (criticalKeys.some(k => data[k] === 0)) return "no-apto";
  const allKeys: ItemKey[] = ["tires", "lights", "mirrors", "bodywork", "seatbelts", "horn", "windshield", "instruments", "brakes", "steering", "suspension", "fluids", "fireExtinguisher", "firstAidKit", "reflectiveTriangles", "safetyVest"];
  if (allKeys.some(k => data[k] === 0)) return "apto-con-observaciones";
  return "apto";
}

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
      await apiRequest("DELETE", `/api/vehicle-inspections/${id}`);
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
    const autoResult = computeResult(formData as Record<ItemKey, number>);
    const data = {
      ...formData,
      result: autoResult,
      observations: formData.observations || undefined,
      correctiveActions: formData.correctiveActions || undefined,
    };
    createInspectionMutation.mutate(data);
  };

  const toggleItem = (key: ItemKey) => {
    setFormData(prev => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
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

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInspections = inspections.filter((inspection) => {
    const searchLower = searchTerm.toLowerCase();
    const vehiclePlate = getVehiclePlate(inspection.vehicleId).toLowerCase();
    const driverName = getDriverName(inspection.driverId).toLowerCase();
    return vehiclePlate.includes(searchLower) || driverName.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Inspecciones Preoperacionales</h1>
          <p className="text-muted-foreground">Revisiones diarias de vehículos antes de operar</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <HelpVideoButton customRoute="/pesv/inspecciones" testId="button-help-video-pesv-inspecciones" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/pesv/inspecciones/pdf', 'inspecciones-preoperacionales.pdf')}
            data-testid="button-download-inspecciones-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H08" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
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

              {/* Ítems de inspección por grupo — toggle buttons */}
              {ITEMS_INSPECCION.map(grupo => (
                <div key={grupo.grupo} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{grupo.grupo}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {grupo.items.map(item => {
                      const esBien = formData[item.key] === 1;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          data-testid={`toggle-inspeccion-${item.key}`}
                          onClick={() => toggleItem(item.key)}
                          className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors text-left ${
                            esBien
                              ? "border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 text-green-800 dark:text-green-300"
                              : item.critical
                              ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-800 dark:text-red-300"
                              : "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {item.critical && !esBien && (
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <span>{item.label}</span>
                            {item.critical && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Crítico</Badge>
                            )}
                          </span>
                          {esBien ? (
                            <CheckSquare className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <XSquare className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Resumen de fallas */}
              {(() => {
                const allKeys: ItemKey[] = ["tires","lights","mirrors","bodywork","seatbelts","horn","windshield","instruments","brakes","steering","suspension","fluids","fireExtinguisher","firstAidKit","reflectiveTriangles","safetyVest"];
                const criticalKeys: ItemKey[] = ["tires","brakes","fireExtinguisher"];
                const failingCount = allKeys.filter(k => formData[k] === 0).length;
                const hasCriticalFail = criticalKeys.some(k => formData[k] === 0);
                if (failingCount === 0) return null;
                return (
                  <div className={`flex items-start gap-2 rounded-md border p-3 ${hasCriticalFail ? "border-red-200 bg-red-50 dark:bg-red-950/30" : "border-amber-200 bg-amber-50 dark:bg-amber-950/30"}`}>
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${hasCriticalFail ? "text-red-600" : "text-amber-600"}`} />
                    <p className="text-sm">
                      {failingCount} ítem{failingCount > 1 ? "s" : ""} con falla.{" "}
                      {hasCriticalFail
                        ? "Hay ítems CRÍTICOS fallando — el resultado será NO APTO."
                        : "El resultado será APTO CON OBSERVACIONES."}
                    </p>
                  </div>
                );
              })()}

              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Describa las fallas encontradas o novedades del vehículo..."
                  data-testid="input-observations"
                />
              </div>
              {(() => {
                const allKeys: ItemKey[] = ["tires","lights","mirrors","bodywork","seatbelts","horn","windshield","instruments","brakes","steering","suspension","fluids","fireExtinguisher","firstAidKit","reflectiveTriangles","safetyVest"];
                if (allKeys.some(k => formData[k] === 0)) return (
                  <div className="space-y-2">
                    <Label htmlFor="correctiveActions">Acciones Correctivas</Label>
                    <Textarea
                      id="correctiveActions"
                      value={formData.correctiveActions}
                      onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                      placeholder="Acciones a tomar antes de conducir..."
                      data-testid="input-corrective-actions"
                    />
                  </div>
                );
                return null;
              })()}

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
                      {user?.role && hasCompanyAdminAccess(user.role) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inspection.id)}
                          disabled={deleteInspectionMutation.isPending}
                          data-testid={`button-delete-${inspection.id}`}
                          title="Eliminar"
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
            const failCount = grupos.flatMap(g => g.items).filter(i => i.val === 0).length;
            return (
              <div className="space-y-4">
                {/* Resultado + cabecera */}
                <div className={`flex items-center gap-3 rounded-md border p-3 ${resultColor}`}>
                  {ins.result === 'apto'
                    ? <CheckCircle2 className="h-7 w-7 text-green-600 shrink-0" />
                    : ins.result === 'apto-con-observaciones'
                    ? <AlertCircle className="h-7 w-7 text-amber-500 shrink-0" />
                    : <XCircle className="h-7 w-7 text-red-600 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${resultText}`}>{getResultLabel(ins.result)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ins.inspectionDate).toLocaleDateString("es-CO")} · {ins.inspectionTime}
                      {failCount > 0 && ` · ${failCount} ítem${failCount > 1 ? 's' : ''} con falla`}
                    </p>
                  </div>
                </div>

                {/* Vehículo y conductor */}
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

                {/* Ítems por grupo */}
                {grupos.map(grupo => (
                  <div key={grupo.label} className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{grupo.label}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {grupo.items.map(item => (
                        <div
                          key={item.label}
                          className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm ${
                            item.val === 1
                              ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300'
                              : item.critical
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <span className="truncate">{item.label}{item.critical && item.val === 0 && <span className="ml-1 text-[10px] font-semibold">CRÍTICO</span>}</span>
                          {item.val === 1
                            ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            : <XCircle className="h-4 w-4 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Observaciones y acciones */}
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
