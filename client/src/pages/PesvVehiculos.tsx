import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, ArrowLeft, FileDown, FileSpreadsheet, Download, Upload, AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Vehicle, insertVehicleSchema, vehicleAssetCategoryValues, machineryTypeValues } from "@shared/schema";
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

type VehicleImportResults = {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: Record<string, unknown> }>;
};

type VehicleFormData = {
  companyId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: Vehicle["type"];
  ownership: Vehicle["ownership"];
  capacity: number | string;
  mileage: number | string;
  color: string;
  vin: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  soatExpiry: string;
  technicalReviewExpiry: string;
  status: Vehicle["status"];
  defaultMaxSpeed: number | string;
  assetCategory: typeof vehicleAssetCategoryValues[number];
  machineryType: typeof machineryTypeValues[number] | "";
  serialNumber: string;
  engineHours: number | string;
  fuelType: string;
  operatingCapacity: string;
  availableImplements: string;
  lastInspectionDate: string;
  nextMaintenanceDate: string;
  workLocation: string;
  technicalObservations: string;
  observations: string;
};

const FUEL_TYPE_OPTIONS = [
  "Diésel (ACPM)",
  "Gasolina corriente",
  "Gasolina extra",
  "Gas natural vehicular (GNV)",
  "Gas licuado de petróleo (GLP)",
  "Biodiésel",
  "Etanol",
  "Eléctrico",
  "Híbrido gasolina-eléctrico",
  "Híbrido diésel-eléctrico",
  "Hidrógeno",
  "Solar",
  "Batería recargable",
  "Manual / Sin combustible",
  "Otro",
];

const OPERATING_CAPACITY_OPTIONS = [
  "Hasta 250 kg",
  "Hasta 500 kg",
  "Hasta 1 tonelada",
  "Hasta 2 toneladas",
  "Hasta 3 toneladas",
  "Hasta 5 toneladas",
  "Hasta 7 toneladas",
  "Hasta 10 toneladas",
  "Hasta 15 toneladas",
  "Hasta 20 toneladas",
  "Hasta 30 toneladas",
  "Hasta 40 toneladas",
  "Hasta 50 toneladas",
  "Más de 50 toneladas",
  "0,05 m³",
  "0,09 m³",
  "0,25 m³",
  "0,50 m³",
  "0,75 m³",
  "1 m³",
  "1,5 m³",
  "2 m³",
  "3 m³",
  "5 m³",
  "10 m³",
  "Hasta 5 personas",
  "De 6 a 10 personas",
  "De 11 a 20 personas",
  "Más de 20 personas",
  "No aplica",
  "Otra",
];

const IMPLEMENT_OPTIONS = [
  "Balde estándar",
  "Balde de excavación",
  "Balde de limpieza",
  "Balde trapezoidal",
  "Balde para roca",
  "Balde de alto volteo",
  "Martillo hidráulico",
  "Pinza hidráulica",
  "Pinza forestal",
  "Garra para troncos",
  "Pulgar hidráulico",
  "Cizalla hidráulica",
  "Triturador de concreto",
  "Fresadora",
  "Ahoyador / Barrena",
  "Ripper / Escarificador",
  "Hoja topadora",
  "Hoja niveladora",
  "Hoja quitanieves",
  "Rodillo compactador",
  "Placa compactadora",
  "Horquillas para carga",
  "Brazo telescópico",
  "Pluma grúa",
  "Gancho de izaje",
  "Cabrestante / Winche",
  "Cucharón mezclador",
  "Barredora",
  "Zanjadora",
  "Desbrozadora",
  "Trituradora",
  "Arado",
  "Rastrillo",
  "Estabilizadores",
  "Canasta para personal",
  "Tanque de agua",
  "Tanque de combustible",
  "Compresor",
  "Generador eléctrico",
  "Sin implementos",
  "Otro",
];

export default function PesvVehiculos() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany, effectiveCompanyId } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? canWrite(user.role, 'vehicles') : false;
  const canViewGlobalFleet = user?.role === "superadmin";
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<VehicleImportResults | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
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
    assetCategory: "vehiculo_carretera",
    machineryType: "",
    serialNumber: "",
    engineHours: "" as number | string,
    fuelType: "",
    operatingCapacity: "",
    availableImplements: "",
    lastInspectionDate: "",
    nextMaintenanceDate: "",
    workLocation: "",
    technicalObservations: "",
    observations: "",
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", effectiveCompanyId || "todas-las-empresas"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/vehicles");
      return response.json();
    },
    enabled: !!effectiveCompanyId || canViewGlobalFleet,
  });


  const createVehicleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertVehicleSchema>) => {
      if (isAdmin && !effectiveCompanyId) {
        throw new Error("Seleccione una empresa activa antes de registrar el vehículo.");
      }
      const payload = isAdmin
        ? { ...data, companyId: effectiveCompanyId! }
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

  const importVehiclesMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const headers: Record<string, string> = {};
      if (currentCompany?.id) {
        headers["X-Company-Id"] = currentCompany.id;
      }

      const response = await fetch("/api/vehicles/import", {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });
      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { error: responseText };
      }
      if (!response.ok) {
        throw new Error(responseData.error || "Error al importar vehículos");
      }
      return responseData as VehicleImportResults;
    },
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: data.failed === 0 ? "Importación exitosa" : "Importación completada con errores",
        description: `${data.successful} vehículos creados${data.failed > 0 ? `, ${data.failed} con errores` : ""}.`,
        variant: data.failed === 0 ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error al importar vehículos", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVehicle && isAdmin && !effectiveCompanyId) {
      toast({
        title: "Empresa requerida",
        description: "Seleccione una empresa activa antes de registrar el vehículo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.insuranceExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento del Seguro.", variant: "destructive" });
      return;
    }
    if (formData.assetCategory === "vehiculo_carretera" && !formData.soatExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento del SOAT.", variant: "destructive" });
      return;
    }
    if (formData.assetCategory === "vehiculo_carretera" && !formData.technicalReviewExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento de la Tecnicomecánica.", variant: "destructive" });
      return;
    }
    if (formData.assetCategory !== "vehiculo_carretera" && !formData.machineryType) {
      toast({ title: "Campo requerido", description: "Seleccione el tipo de maquinaria.", variant: "destructive" });
      return;
    }
    
    const capacityValue = formData.capacity === '' ? undefined : Number(formData.capacity);
    const mileageValue = formData.mileage === '' ? undefined : Number(formData.mileage);
    const defaultMaxSpeedValue = formData.defaultMaxSpeed === '' ? undefined : Number(formData.defaultMaxSpeed);
    const engineHoursValue = formData.engineHours === '' ? undefined : Number(formData.engineHours);
    const data = {
      ...formData,
      type: formData.assetCategory === "vehiculo_carretera" ? formData.type : "otro",
      capacity: capacityValue,
      mileage: mileageValue,
      defaultMaxSpeed: defaultMaxSpeedValue,
      engineHours: engineHoursValue,
      color: formData.color || undefined,
      vin: formData.vin || undefined,
      insurancePolicy: formData.insurancePolicy || undefined,
      insuranceExpiry: formData.insuranceExpiry || undefined,
      soatExpiry: formData.soatExpiry || undefined,
      technicalReviewExpiry: formData.technicalReviewExpiry || undefined,
      machineryType: formData.machineryType || undefined,
      serialNumber: formData.serialNumber || undefined,
      fuelType: formData.fuelType || undefined,
      operatingCapacity: formData.operatingCapacity || undefined,
      availableImplements: formData.availableImplements || undefined,
      lastInspectionDate: formData.lastInspectionDate || undefined,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      workLocation: formData.workLocation || undefined,
      technicalObservations: formData.technicalObservations || undefined,
      classificationStatus: "clasificado" as const,
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
      assetCategory: (vehicle.assetCategory || "vehiculo_carretera") as VehicleFormData["assetCategory"],
      machineryType: (vehicle.machineryType || "") as VehicleFormData["machineryType"],
      serialNumber: vehicle.serialNumber || "",
      engineHours: vehicle.engineHours ?? "",
      fuelType: vehicle.fuelType || "",
      operatingCapacity: vehicle.operatingCapacity || "",
      availableImplements: vehicle.availableImplements || "",
      lastInspectionDate: vehicle.lastInspectionDate || "",
      nextMaintenanceDate: vehicle.nextMaintenanceDate || "",
      workLocation: vehicle.workLocation || "",
      technicalObservations: vehicle.technicalObservations || "",
      observations: vehicle.observations || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este vehículo?")) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setImportResults(null);
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({ title: "Archivo requerido", description: "Seleccione un archivo Excel o CSV.", variant: "destructive" });
      return;
    }
    importVehiclesMutation.mutate(selectedFile);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResults(null);
    setImportDialogOpen(false);
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
      assetCategory: "vehiculo_carretera",
      machineryType: "",
      serialNumber: "",
      engineHours: "",
      fuelType: "",
      operatingCapacity: "",
      availableImplements: "",
      lastInspectionDate: "",
      nextMaintenanceDate: "",
      workLocation: "",
      technicalObservations: "",
      observations: "",
    });
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      vehicle.plate.toLowerCase().includes(searchLower) ||
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      (vehicle.serialNumber || "").toLowerCase().includes(searchLower)
    );
    const category = vehicle.assetCategory || "vehiculo_carretera";
    const visibleType = category === "vehiculo_carretera" ? vehicle.type : vehicle.machineryType;
    return matchesSearch
      && (categoryFilter === "todos" || category === categoryFilter)
      && (typeFilter === "todos" || visibleType === typeFilter)
      && (statusFilter === "todos" || vehicle.status === statusFilter);
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

  const getAssetCategoryLabel = (category: string) => ({
    vehiculo_carretera: "Vehículo de carretera",
    maquinaria_amarilla: "Maquinaria amarilla",
    equipo_especial: "Equipo especial",
  }[category] || category);

  const getMachineryTypeLabel = (type: string | null | undefined) => ({
    excavadora: "Excavadora",
    excavadora_compacta: "Excavadora compacta",
    retroexcavadora: "Retroexcavadora",
    cargador: "Cargador",
    motoniveladora: "Motoniveladora",
    bulldozer: "Bulldozer",
    grua: "Grúa",
    montacargas: "Montacargas",
    compactador: "Compactador",
    otro: "Otro",
  }[type || ""] || type || "Sin clasificar");

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
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.assign("/api/vehicles/template/download")}
                data-testid="button-download-vehicle-template"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar plantilla
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={(open) => {
                setImportDialogOpen(open);
                if (!open) {
                  setSelectedFile(null);
                  setImportResults(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-import-vehicles">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Importar vehículos PESV</DialogTitle>
                    <DialogDescription>
                      Cargue la plantilla de vehículos para crear varios registros de una sola vez. Los duplicados no se sobrescriben.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Use la hoja “Vehículos”</p>
                          <p className="text-muted-foreground mt-1">
                            La plantilla incluye una hoja de instrucciones. Se aceptan archivos .xlsx, .xls o .csv de hasta 2.000 filas.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-import-file">Archivo Excel</Label>
                      <Input
                        id="vehicle-import-file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        data-testid="input-vehicle-import-file"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">Archivo: {selectedFile.name}</p>
                      )}
                    </div>
                    {importResults && (
                      <div className="space-y-2">
                        <div className={`rounded-lg border p-3 text-sm ${importResults.failed === 0 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
                          <p className="font-medium">Resultado de la importación</p>
                          <p className="text-green-700">Vehículos creados: {importResults.successful}</p>
                          {importResults.failed > 0 && (
                            <p className="text-red-700">Filas con errores: {importResults.failed}</p>
                          )}
                          <p className="text-muted-foreground">Total de filas procesadas: {importResults.total}</p>
                        </div>
                        {importResults.errors.length > 0 && (
                          <div className="max-h-48 overflow-y-auto rounded border p-3 text-sm space-y-1">
                            {importResults.errors.map((item) => (
                              <p key={`${item.row}-${item.error}`} className="text-red-600">
                                <strong>Fila {item.row}:</strong> {item.error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    {importResults ? (
                      <Button onClick={resetImport} data-testid="button-close-vehicle-import">Cerrar</Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancelar</Button>
                        <Button
                          onClick={handleImport}
                          disabled={!selectedFile || importVehiclesMutation.isPending}
                          data-testid="button-submit-vehicle-import"
                        >
                          {importVehiclesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {importVehiclesMutation.isPending ? "Importando..." : "Importar vehículos"}
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
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
      
      <TrazabilidadPesvBanner codigoPaso="H04" compacto />
      
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
                     <Label htmlFor="assetCategory">Categoría del activo *</Label>
                     <Select
                       value={formData.assetCategory}
                       onValueChange={(value: VehicleFormData["assetCategory"]) => setFormData({ ...formData, assetCategory: value, type: value === "vehiculo_carretera" ? formData.type : "otro" })}
                     >
                       <SelectTrigger id="assetCategory" data-testid="select-asset-category"><SelectValue /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="vehiculo_carretera">Vehículo de carretera</SelectItem>
                         <SelectItem value="maquinaria_amarilla">Maquinaria amarilla</SelectItem>
                         <SelectItem value="equipo_especial">Equipo especial</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   {formData.assetCategory !== "vehiculo_carretera" && (
                     <>
                       <div className="space-y-2">
                         <Label htmlFor="machineryType">Tipo de maquinaria *</Label>
                         <Select value={formData.machineryType} onValueChange={(value) => setFormData({ ...formData, machineryType: value as VehicleFormData["machineryType"] })}>
                           <SelectTrigger id="machineryType" data-testid="select-machinery-type"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                           <SelectContent>
                             {machineryTypeValues.map((value) => <SelectItem key={value} value={value}>{getMachineryTypeLabel(value)}</SelectItem>)}
                           </SelectContent>
                         </Select>
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="serialNumber">Número de serie del fabricante</Label>
                         <Input id="serialNumber" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} placeholder="Serial o identificación del fabricante" data-testid="input-serial-number" />
                       </div>
                     </>
                   )}
                   {formData.assetCategory === "vehiculo_carretera" && <div className="space-y-2">
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
                   </div>}
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
                   {formData.assetCategory === "vehiculo_carretera" && <div className="space-y-2">
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
                   </div>}
                  <div className="space-y-2">
                     <Label htmlFor="mileage">{formData.assetCategory === "vehiculo_carretera" ? "Kilometraje" : "Horómetro (horas)"}</Label>
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                       value={formData.assetCategory === "vehiculo_carretera" ? formData.mileage : formData.engineHours}
                       onChange={(e) => formData.assetCategory === "vehiculo_carretera"
                         ? setFormData({ ...formData, mileage: e.target.value })
                         : setFormData({ ...formData, engineHours: e.target.value })}
                       placeholder={formData.assetCategory === "vehiculo_carretera" ? "50000" : "1200"}
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
                    <Label htmlFor="insuranceExpiry">Vencimiento Seguro <span className="text-red-500">*</span></Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      data-testid="input-insurance-expiry"
                    />
                  </div>
                   {formData.assetCategory === "vehiculo_carretera" && <div className="space-y-2">
                    <Label htmlFor="soatExpiry">Vencimiento SOAT <span className="text-red-500">*</span></Label>
                    <Input
                      id="soatExpiry"
                      type="date"
                      value={formData.soatExpiry}
                      onChange={(e) => setFormData({ ...formData, soatExpiry: e.target.value })}
                      data-testid="input-soat-expiry"
                    />
                   </div>}
                   {formData.assetCategory === "vehiculo_carretera" && <div className="space-y-2">
                    <Label htmlFor="technicalReviewExpiry">Vencimiento Tecnicomecánica <span className="text-red-500">*</span></Label>
                    <Input
                      id="technicalReviewExpiry"
                      type="date"
                      value={formData.technicalReviewExpiry}
                      onChange={(e) => setFormData({ ...formData, technicalReviewExpiry: e.target.value })}
                      data-testid="input-technical-review-expiry"
                    />
                   </div>}
                   {formData.assetCategory !== "vehiculo_carretera" && (
                     <>
                       <div className="space-y-2">
                         <Label htmlFor="fuelType">Tipo de combustible</Label>
                          <Select value={formData.fuelType || undefined} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                            <SelectTrigger id="fuelType" data-testid="select-fuel-type">
                              <SelectValue placeholder="Seleccione el combustible" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {formData.fuelType && !FUEL_TYPE_OPTIONS.includes(formData.fuelType) && (
                                <SelectItem value={formData.fuelType}>{formData.fuelType}</SelectItem>
                              )}
                              {FUEL_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="operatingCapacity">Capacidad operativa</Label>
                          <Select value={formData.operatingCapacity || undefined} onValueChange={(value) => setFormData({ ...formData, operatingCapacity: value })}>
                            <SelectTrigger id="operatingCapacity" data-testid="select-operating-capacity">
                              <SelectValue placeholder="Seleccione la capacidad" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {formData.operatingCapacity && !OPERATING_CAPACITY_OPTIONS.includes(formData.operatingCapacity) && (
                                <SelectItem value={formData.operatingCapacity}>{formData.operatingCapacity}</SelectItem>
                              )}
                              {OPERATING_CAPACITY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2 col-span-2">
                         <Label htmlFor="availableImplements">Implementos disponibles</Label>
                          <Select value={formData.availableImplements || undefined} onValueChange={(value) => setFormData({ ...formData, availableImplements: value })}>
                            <SelectTrigger id="availableImplements" data-testid="select-available-implements">
                              <SelectValue placeholder="Seleccione el implemento principal" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {formData.availableImplements && !IMPLEMENT_OPTIONS.includes(formData.availableImplements) && (
                                <SelectItem value={formData.availableImplements}>{formData.availableImplements}</SelectItem>
                              )}
                              {IMPLEMENT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="lastInspectionDate">Fecha de última revisión</Label>
                         <Input id="lastInspectionDate" type="date" value={formData.lastInspectionDate} onChange={(e) => setFormData({ ...formData, lastInspectionDate: e.target.value })} data-testid="input-last-inspection-date" />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="nextMaintenanceDate">Próximo mantenimiento</Label>
                         <Input id="nextMaintenanceDate" type="date" value={formData.nextMaintenanceDate} onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })} data-testid="input-next-maintenance-date" />
                       </div>
                       <div className="space-y-2 col-span-2">
                         <Label htmlFor="workLocation">Ubicación o frente de trabajo</Label>
                         <Input id="workLocation" value={formData.workLocation} onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })} placeholder="Obra, sede o frente de trabajo" data-testid="input-work-location" />
                       </div>
                       <div className="space-y-2 col-span-2">
                         <Label htmlFor="technicalObservations">Observaciones técnicas</Label>
                         <Textarea id="technicalObservations" value={formData.technicalObservations} onChange={(e) => setFormData({ ...formData, technicalObservations: e.target.value })} placeholder="Condición, restricciones e información técnica del equipo" data-testid="input-technical-observations" />
                       </div>
                     </>
                   )}
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

      <div className="flex flex-wrap items-center gap-3">
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
        <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setTypeFilter("todos"); }}>
          <SelectTrigger className="w-[210px]" data-testid="filter-asset-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            <SelectItem value="vehiculo_carretera">Vehículos de carretera</SelectItem>
            <SelectItem value="maquinaria_amarilla">Maquinaria amarilla</SelectItem>
            <SelectItem value="equipo_especial">Equipos especiales</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[210px]" data-testid="filter-equipment-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {categoryFilter !== "maquinaria_amarilla" && categoryFilter !== "equipo_especial" && (
              <>
                <SelectItem value="automovil">Automóvil</SelectItem>
                <SelectItem value="camioneta">Camioneta</SelectItem>
                <SelectItem value="camion">Camión</SelectItem>
                <SelectItem value="motocicleta">Motocicleta</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
              </>
            )}
            {categoryFilter !== "vehiculo_carretera" && machineryTypeValues.map((value) => (
              <SelectItem key={value} value={value}>{getMachineryTypeLabel(value)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="filter-vehicle-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="dado-de-baja">Dado de baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-plate">Placa / Identificación</TableHead>
              <TableHead data-testid="header-category">Categoría</TableHead>
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
                <TableCell colSpan={9} className="text-center" data-testid="text-loading">
                  Cargando vehículos...
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center" data-testid="text-no-vehicles">
                  No se encontraron vehículos
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} data-testid={`row-vehicle-${vehicle.id}`}>
                  <TableCell data-testid={`text-plate-${vehicle.id}`}>
                    <div className="font-medium">{vehicle.plate}</div>
                    {vehicle.serialNumber && <div className="text-xs text-muted-foreground">Serie: {vehicle.serialNumber}</div>}
                  </TableCell>
                  <TableCell data-testid={`text-category-${vehicle.id}`}>{getAssetCategoryLabel(vehicle.assetCategory || "vehiculo_carretera")}</TableCell>
                  <TableCell data-testid={`text-brand-${vehicle.id}`}>{vehicle.brand}</TableCell>
                  <TableCell data-testid={`text-model-${vehicle.id}`}>{vehicle.model}</TableCell>
                  <TableCell data-testid={`text-type-${vehicle.id}`}>
                    {vehicle.classificationStatus === "pendiente"
                      ? <span className="text-amber-700 font-medium">Pendiente de clasificar</span>
                      : (vehicle.assetCategory || "vehiculo_carretera") === "vehiculo_carretera"
                        ? getVehicleTypeLabel(vehicle.type)
                        : getMachineryTypeLabel(vehicle.machineryType)}
                  </TableCell>
                  <TableCell data-testid={`text-soat-${vehicle.id}`}>{(vehicle.assetCategory || "vehiculo_carretera") === "vehiculo_carretera" ? getExpiryBadge(vehicle.soatExpiry) : <span className="text-xs text-muted-foreground">No aplica</span>}</TableCell>
                  <TableCell data-testid={`text-rtm-${vehicle.id}`}>{(vehicle.assetCategory || "vehiculo_carretera") === "vehiculo_carretera" ? getExpiryBadge(vehicle.technicalReviewExpiry) : <span className="text-xs text-muted-foreground">No aplica</span>}</TableCell>
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
