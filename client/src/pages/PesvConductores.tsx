import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, ArrowLeft, FileDown, AlertTriangle, Truck, Link2Off, Download, Upload } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Driver, Company, Worker, DriverComparendo, insertDriverSchema, insertDriverComparendoSchema } from "@shared/schema";
import { apiRequest, buildHeaders, getSelectedCompanyId, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, canWrite } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

type DriverVehicleAssignmentRow = {
  id: string;
  driverId: string;
  vehicleId: string;
  startDate: string;
  endDate: string | null;
  isActive: number;
  observations: string | null;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleStatus: string;
};

export default function PesvConductores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? canWrite(user.role, 'drivers') : false;
  const activeCompanyId = getSelectedCompanyId() ?? user?.companyId ?? null;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);
  const [assignmentDriverId, setAssignmentDriverId] = useState<string | null>(null);
  const [assignmentDriverName, setAssignmentDriverName] = useState("");
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    vehicleId: "",
    startDate: new Date().toISOString().slice(0, 10),
    observations: "",
  });

  // Comparendos state
  const [comparendoDriverId, setComparendoDriverId] = useState<string | null>(null);
  const [comparendoDriverName, setComparendoDriverName] = useState("");
  const [comparendoDialogOpen, setComparendoDialogOpen] = useState(false);
  const [editingComparendo, setEditingComparendo] = useState<DriverComparendo | null>(null);
  const [deleteComparendoId, setDeleteComparendoId] = useState<string | null>(null);
  const [comparendoForm, setComparendoForm] = useState({
    placaVehiculo: "",
    fechaComparendo: "",
    numeroComparendo: "",
    tipoInfraccion: "",
    descripcion: "",
    valorComparendo: "",
    estado: "pendiente" as "pendiente" | "pagado" | "recurrido" | "prescrito",
    observaciones: "",
  });
  const [formData, setFormData] = useState<{
    workerId: string;
    name: string;
    identificationNumber: string;
    licenseNumber: string;
    licenseType: "" | "A1" | "A2" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
    licenseExpiry: string;
    bloodType: string;
    emergencyContact: string;
    emergencyPhone: string;
    medicalExamExpiry: string;
    status: "" | "activo" | "inactivo" | "retirado" | "suspendido";
    observations: string;
  }>({
    workerId: "",
    name: "",
    identificationNumber: "",
    licenseNumber: "",
    licenseType: "",
    licenseExpiry: "",
    bloodType: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalExamExpiry: "",
    status: "",
    observations: "",
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["pesv-drivers", activeCompanyId],
    queryFn: async () => {
      const response = await fetch("/api/drivers", { credentials: "include", headers: buildHeaders() });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  const { data: comparendos = [], isLoading: comparendosLoading } = useQuery<DriverComparendo[]>({
    queryKey: ["/api/drivers", comparendoDriverId, "comparendos", activeCompanyId],
    queryFn: async () => {
      const response = await fetch(`/api/drivers/${comparendoDriverId}/comparendos`, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: !!comparendoDriverId,
  });

  const { data: vehicles = [] } = useQuery<{ id: string; plate: string; brand: string; model: string; year: number; status: string }[]>({
    queryKey: ["pesv-vehicles", activeCompanyId],
    queryFn: async () => {
      const response = await fetch("/api/vehicles", { credentials: "include", headers: buildHeaders() });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  const { data: vehicleAssignments = [], isLoading: assignmentsLoading } = useQuery<DriverVehicleAssignmentRow[]>({
    queryKey: ["/api/drivers", assignmentDriverId, "vehicle-assignments", activeCompanyId],
    queryFn: async () => {
      const res = await fetch(`/api/drivers/${assignmentDriverId}/vehicle-assignments`, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!assignmentDriverId,
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/drivers/${assignmentDriverId}/vehicle-assignments`, assignmentForm);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", assignmentDriverId, "vehicle-assignments", activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/mis-vehiculos"] });
      setAssignmentForm({
        vehicleId: "",
        startDate: new Date().toISOString().slice(0, 10),
        observations: "",
      });
      toast({ title: "Vehículo asignado", description: "La asignación quedó activa para el conductor." });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo asignar", description: error.message, variant: "destructive" });
    },
  });

  const finishAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const res = await apiRequest("PATCH", `/api/drivers/${assignmentDriverId}/vehicle-assignments/${assignmentId}`, {
        isActive: 0,
        endDate: new Date().toISOString().slice(0, 10),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", assignmentDriverId, "vehicle-assignments", activeCompanyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/mis-vehiculos"] });
      toast({ title: "Asignación finalizada", description: "El historial se conservó correctamente." });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo finalizar", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenAssignments = (driver: Driver) => {
    setAssignmentDriverId(driver.id);
    setAssignmentDriverName(driver.name);
    setAssignmentDialogOpen(true);
    setAssignmentForm({
      vehicleId: "",
      startDate: new Date().toISOString().slice(0, 10),
      observations: "",
    });
  };

  const activeAssignedVehicleIds = new Set(
    vehicleAssignments.filter((assignment) => assignment.isActive === 1).map((assignment) => assignment.vehicleId),
  );
  const availableVehicles = vehicles.filter(
    (vehicle) =>
      (vehicle.status === "activo" || vehicle.status === "mantenimiento") &&
      !activeAssignedVehicleIds.has(vehicle.id),
  );

  const createComparendoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDriverComparendoSchema>) => {
      const res = await apiRequest("POST", `/api/drivers/${comparendoDriverId}/comparendos`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", comparendoDriverId, "comparendos", activeCompanyId] });
      resetComparendoForm();
      toast({ title: "Comparendo registrado", description: "El comparendo se guardó exitosamente." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateComparendoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertDriverComparendoSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/drivers/${comparendoDriverId}/comparendos/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", comparendoDriverId, "comparendos", activeCompanyId] });
      resetComparendoForm();
      toast({ title: "Comparendo actualizado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteComparendoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/drivers/${comparendoDriverId}/comparendos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", comparendoDriverId, "comparendos", activeCompanyId] });
      setDeleteComparendoId(null);
      toast({ title: "Comparendo eliminado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetComparendoForm = () => {
    setEditingComparendo(null);
    setComparendoForm({ placaVehiculo: "", fechaComparendo: "", numeroComparendo: "", tipoInfraccion: "", descripcion: "", valorComparendo: "", estado: "pendiente", observaciones: "" });
  };

  const handleOpenComparendos = (driver: Driver) => {
    setComparendoDriverId(driver.id);
    setComparendoDriverName(driver.name);
    setComparendoDialogOpen(true);
    resetComparendoForm();
  };

  const handleEditComparendo = (c: DriverComparendo) => {
    setEditingComparendo(c);
    setComparendoForm({
      placaVehiculo: c.placaVehiculo || "",
      fechaComparendo: c.fechaComparendo,
      numeroComparendo: c.numeroComparendo || "",
      tipoInfraccion: c.tipoInfraccion,
      descripcion: c.descripcion || "",
      valorComparendo: c.valorComparendo?.toString() || "",
      estado: c.estado,
      observaciones: c.observaciones || "",
    });
  };

  const handleSubmitComparendo = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      driverId: comparendoDriverId!,
      placaVehiculo: comparendoForm.placaVehiculo || undefined,
      fechaComparendo: comparendoForm.fechaComparendo,
      tipoInfraccion: comparendoForm.tipoInfraccion,
      estado: comparendoForm.estado,
      numeroComparendo: comparendoForm.numeroComparendo || undefined,
      descripcion: comparendoForm.descripcion || undefined,
      valorComparendo: comparendoForm.valorComparendo ? parseInt(comparendoForm.valorComparendo) : undefined,
      observaciones: comparendoForm.observaciones || undefined,
    };
    if (editingComparendo) {
      updateComparendoMutation.mutate({ id: editingComparendo.id, data: payload });
    } else {
      createComparendoMutation.mutate(payload);
    }
  };

  const estadoLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pendiente: { label: "Pendiente", variant: "destructive" },
    pagado: { label: "Pagado", variant: "default" },
    recurrido: { label: "Recurrido", variant: "secondary" },
    prescrito: { label: "Prescrito", variant: "outline" },
  };

  // Query para obtener la empresa del usuario (modelo single-company por suscripción)
  const { data: userCompany } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !!user?.companyId,
  });

  // Query para obtener trabajadores de la empresa (integración SST-PESV)
  // Modelo single-company: siempre usar companyId del usuario
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["pesv-workers", activeCompanyId],
    queryFn: async () => {
      const response = await fetch("/api/workers", { credentials: "include", headers: buildHeaders() });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: !!activeCompanyId,
  });

  // Handler para seleccionar trabajador y auto-llenar datos
  const handleWorkerSelect = (workerId: string) => {
    const selectedWorker = workers.find(w => w.id === workerId);
    if (selectedWorker) {
      setFormData({
        ...formData,
        workerId: selectedWorker.id,
        name: selectedWorker.name,
        identificationNumber: selectedWorker.identificationNumber,
      });
    }
  };

  const createDriverMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDriverSchema>) => {
      if (isAdmin && !activeCompanyId) {
        throw new Error("Seleccione una empresa activa antes de registrar el conductor.");
      }
      const payload = isAdmin
        ? { ...data, companyId: activeCompanyId! }
        : data;
      const res = await apiRequest("POST", "/api/drivers", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pesv-drivers", activeCompanyId] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Conductor creado",
        description: "El conductor se ha registrado exitosamente",
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

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertDriverSchema> }) => {
      const res = await apiRequest("PATCH", `/api/drivers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pesv-drivers", activeCompanyId] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Conductor actualizado",
        description: "Los datos del conductor se han actualizado exitosamente",
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

  const deleteDriverMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/drivers/${id}`);
    },
    onSuccess: () => {
      setDeletingDriverId(null);
      queryClient.invalidateQueries({ queryKey: ["pesv-drivers", activeCompanyId] });
      toast({
        title: "Conductor eliminado",
        description: "El conductor se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      setDeletingDriverId(null);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDriver && isAdmin && !activeCompanyId) {
      toast({
        title: "Empresa requerida",
        description: "Seleccione una empresa activa antes de registrar el conductor.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.licenseExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento de la licencia de conducción.", variant: "destructive" });
      return;
    }
    if (!formData.licenseType) {
      toast({ title: "Campo requerido", description: "Seleccione la categoría de la licencia de conducción.", variant: "destructive" });
      return;
    }
    if (!formData.medicalExamExpiry) {
      toast({ title: "Campo requerido", description: "Ingrese la fecha de vencimiento del examen médico.", variant: "destructive" });
      return;
    }

    const data = {
      ...formData,
      licenseType: formData.licenseType as "A1" | "A2" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3",
      status: formData.status || undefined,
      workerId: formData.workerId || undefined,
      bloodType: formData.bloodType || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      emergencyPhone: formData.emergencyPhone || undefined,
      medicalExamExpiry: formData.medicalExamExpiry || undefined,
      observations: formData.observations || undefined,
    };

    if (editingDriver) {
      updateDriverMutation.mutate({ id: editingDriver.id, data });
    } else {
      createDriverMutation.mutate(data);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      workerId: driver.workerId || "",
      name: driver.name,
      identificationNumber: driver.identificationNumber,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiry: driver.licenseExpiry,
      bloodType: driver.bloodType || "",
      emergencyContact: driver.emergencyContact || "",
      emergencyPhone: driver.emergencyPhone || "",
      medicalExamExpiry: driver.medicalExamExpiry || "",
      status: driver.status,
      observations: driver.observations || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      workerId: "",
      name: "",
      identificationNumber: "",
      licenseNumber: "",
      licenseType: "",
      licenseExpiry: "",
      bloodType: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalExamExpiry: "",
      status: "",
      observations: "",
    });
  };

  const filteredDrivers = drivers.filter((driver) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      driver.name.toLowerCase().includes(searchLower) ||
      driver.identificationNumber.toLowerCase().includes(searchLower) ||
      driver.licenseNumber.toLowerCase().includes(searchLower)
    );
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      activo: "Activo",
      inactivo: "Inactivo",
      suspendido: "Suspendido",
      retirado: "Retirado",
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

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/drivers/template/download", {
        credentials: "include",
        headers: activeCompanyId ? { "X-Company-Id": activeCompanyId } : undefined,
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Error al descargar la plantilla");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "plantilla_conductores_pesv.xlsx";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      toast({
        title: "Plantilla descargada",
        description: "La plantilla Excel de conductores se descargó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo descargar la plantilla", variant: "destructive" });
    }
  };

  const driverImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await fetch("/api/drivers/import", {
        method: "POST",
        credentials: "include",
        headers: activeCompanyId ? { "X-Company-Id": activeCompanyId } : undefined,
        body: formDataUpload,
      });
      if (!response.ok) {
        let message = "Error al importar conductores";
        try {
          const error = await response.json();
          message = error.error || message;
        } catch {
          message = await response.text() || message;
        }
        throw new Error(message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["pesv-drivers", activeCompanyId] });
      if (data.failed === 0) {
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${data.successful} conductores correctamente.`,
          className: "bg-yellow-50 border-yellow-200",
        });
      } else {
        toast({
          title: "Importación completada con errores",
          description: `${data.successful} exitosos, ${data.failed} con errores.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedImportFile(file);
    setImportResults(null);
  };

  const handleImport = () => {
    if (!selectedImportFile) {
      toast({ title: "Archivo requerido", description: "Seleccione un archivo Excel para importar.", variant: "destructive" });
      return;
    }
    driverImportMutation.mutate(selectedImportFile);
  };

  const resetImport = () => {
    setSelectedImportFile(null);
    setImportResults(null);
    setImportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Conductores PESV</h1>
          <p className="text-muted-foreground">Gestión de conductores y licencias</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <HelpVideoButton customRoute="/pesv/conductores" testId="button-help-video-pesv-conductores" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadPdf('/api/pesv/conductores/pdf', 'conductores-pesv.pdf')}
            data-testid="button-download-conductores-pdf"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                data-testid="button-download-template"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={(open) => {
                setImportDialogOpen(open);
                if (!open) {
                  setSelectedImportFile(null);
                  setImportResults(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-import-excel">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Importar Conductores PESV</DialogTitle>
                    <DialogDescription>
                      Seleccione la plantilla diligenciada con los datos de los conductores.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="driverImportFile">Archivo Excel</Label>
                      <Input
                        id="driverImportFile"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleImportFileSelect}
                        data-testid="input-import-file"
                      />
                      {selectedImportFile && (
                        <p className="text-sm text-muted-foreground">
                          Archivo: {selectedImportFile.name}
                        </p>
                      )}
                    </div>
                    {importResults && (
                      <div className="space-y-2">
                        <Alert className={importResults.failed === 0 ? "border-green-500" : "border-yellow-500"}>
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium">Resultados de la importación:</p>
                              <p className="text-green-600">Exitosos: {importResults.successful}</p>
                              {importResults.failed > 0 && (
                                <p className="text-red-600">Con errores: {importResults.failed}</p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                        {importResults.errors.length > 0 && (
                          <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                            {importResults.errors.map((error, index) => (
                              <p key={`${error.row}-${index}`} className="text-red-500">
                                Fila {error.row}: {error.error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    {importResults ? (
                      <Button onClick={resetImport} data-testid="button-close-import">
                        Cerrar
                      </Button>
                    ) : (
                      <Button
                        onClick={handleImport}
                        disabled={!selectedImportFile || driverImportMutation.isPending}
                        data-testid="button-submit-import"
                      >
                        {driverImportMutation.isPending ? "Importando..." : "Importar"}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H07" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-driver">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Conductor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDriver ? "Editar Conductor" : "Registrar Nuevo Conductor"}</DialogTitle>
                <DialogDescription>Complete los datos del conductor</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Mostrar nombre de empresa (modelo single-company por suscripción) */}
                  {userCompany && (
                    <div className="space-y-2 col-span-2">
                      <Label>Empresa</Label>
                      <Input
                        value={userCompany.name}
                        disabled
                        className="bg-muted"
                        data-testid="input-company-name-readonly"
                      />
                    </div>
                  )}
                  {/* Selector de trabajador integrado con SST */}
                  {!editingDriver && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="workerSelect">Seleccionar Trabajador (Integración SST)</Label>
                      <Select
                        value={formData.workerId || undefined}
                        onValueChange={handleWorkerSelect}
                      >
                        <SelectTrigger id="workerSelect" data-testid="select-worker">
                          <SelectValue placeholder="Seleccione un trabajador" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} - {worker.identificationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Seleccione un trabajador registrado en el SST para auto-completar sus datos
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="identificationNumber">Número de Identificación *</Label>
                    <Input
                      id="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                      required
                      placeholder="1234567890"
                      data-testid="input-identification-number"
                      className={formData.workerId ? "bg-muted" : ""}
                      readOnly={!!formData.workerId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Número de Licencia *</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                      placeholder="L12345678"
                      data-testid="input-license-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseType">Tipo de Licencia *</Label>
                    <Select
                      value={formData.licenseType}
                      onValueChange={(value: any) => setFormData({ ...formData, licenseType: value })}
                    >
                      <SelectTrigger id="licenseType" data-testid="select-license-type">
                        <SelectValue placeholder="Seleccione categoría de licencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Motocicletas hasta 125cc</SelectItem>
                        <SelectItem value="A2">A2 - Motocicletas más de 125cc</SelectItem>
                        <SelectItem value="B1">B1 - Automóviles, motocarros, cuatrimotor</SelectItem>
                        <SelectItem value="B2">B2 - Camionetas, camperos, microbuses</SelectItem>
                        <SelectItem value="B3">B3 - Vehículos B1 y B2</SelectItem>
                        <SelectItem value="C1">C1 - Camiones rígidos, buses</SelectItem>
                        <SelectItem value="C2">C2 - Vehículos articulados</SelectItem>
                        <SelectItem value="C3">C3 - Vehículos C1 y C2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">Vencimiento Licencia *</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      data-testid="input-license-expiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Tipo de Sangre</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                    >
                      <SelectTrigger id="bloodType" data-testid="select-blood-type">
                        <SelectValue placeholder="Seleccione tipo de sangre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="Nombre del contacto"
                      data-testid="input-emergency-contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="3001234567"
                      data-testid="input-emergency-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalExamExpiry">Vencimiento Examen Médico <span className="text-red-500">*</span></Label>
                    <Input
                      id="medicalExamExpiry"
                      type="date"
                      value={formData.medicalExamExpiry}
                      onChange={(e) => setFormData({ ...formData, medicalExamExpiry: e.target.value })}
                      data-testid="input-medical-exam-expiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue placeholder="Seleccione el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="suspendido">Suspendido</SelectItem>
                        <SelectItem value="retirado">Retirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observations">Observaciones</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Notas adicionales sobre el conductor"
                      data-testid="input-observations"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createDriverMutation.isPending || updateDriverMutation.isPending} 
                    data-testid="button-submit-driver"
                  >
                    {createDriverMutation.isPending || updateDriverMutation.isPending ? "Guardando..." : "Guardar"}
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
            placeholder="Buscar por nombre, cédula o licencia..."
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
              <TableHead data-testid="header-name">Nombre</TableHead>
              <TableHead data-testid="header-identification">Cédula</TableHead>
              <TableHead data-testid="header-license">Licencia</TableHead>
              <TableHead data-testid="header-license-type">Tipo Licencia</TableHead>
              <TableHead data-testid="header-status">Estado</TableHead>
              <TableHead data-testid="header-actions">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center" data-testid="text-loading">
                  Cargando conductores...
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center" data-testid="text-no-drivers">
                  No se encontraron conductores
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id} data-testid={`row-driver-${driver.id}`}>
                  <TableCell data-testid={`text-name-${driver.id}`}>{driver.name}</TableCell>
                  <TableCell data-testid={`text-identification-${driver.id}`}>{driver.identificationNumber}</TableCell>
                  <TableCell data-testid={`text-license-${driver.id}`}>{driver.licenseNumber}</TableCell>
                  <TableCell data-testid={`text-license-type-${driver.id}`}>{driver.licenseType}</TableCell>
                  <TableCell data-testid={`text-status-${driver.id}`}>{getStatusLabel(driver.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenComparendos(driver)}
                        title="Ver comparendos"
                        className="bg-orange-500 hover:bg-orange-600"
                        data-testid={`button-comparendos-${driver.id}`}
                      >
                        <AlertTriangle className="h-5 w-5 text-black" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPdf(`/api/pesv/conductores/${driver.id}/pdf`, `conductor-${driver.identificationNumber}.pdf`)}
                        title="Descargar PDF individual"
                        data-testid={`button-pdf-${driver.id}`}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => handleOpenAssignments(driver)}
                         title="Vehículos asignados"
                         data-testid={`button-vehicle-assignments-${driver.id}`}
                       >
                         <Truck className="h-4 w-4" />
                       </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(driver)}
                            data-testid={`button-edit-${driver.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(driver.id)}
                            disabled={deletingDriverId === driver.id}
                            data-testid={`button-delete-${driver.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conductor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro del conductor será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => { if (deleteConfirmId) { setDeletingDriverId(deleteConfirmId); deleteDriverMutation.mutate(deleteConfirmId); } setDeleteConfirmId(null); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignmentDialogOpen} onOpenChange={(open) => {
        setAssignmentDialogOpen(open);
        if (!open) {
          setAssignmentDriverId(null);
          setAssignmentDriverName("");
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehículos asignados — {assignmentDriverName}
            </DialogTitle>
            <DialogDescription>
              Un conductor puede tener varios vehículos activos. Al finalizar una asignación, el historial se conserva.
            </DialogDescription>
          </DialogHeader>

          {isAdmin && (
            <form
              className="grid gap-4 rounded-lg border p-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (assignmentForm.vehicleId) createAssignmentMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="assignment-vehicle">Vehículo *</Label>
                <Select
                  value={assignmentForm.vehicleId}
                  onValueChange={(vehicleId) => setAssignmentForm((current) => ({ ...current, vehicleId }))}
                >
                  <SelectTrigger id="assignment-vehicle" data-testid="select-assignment-vehicle">
                    <SelectValue placeholder="Seleccione un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} — {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableVehicles.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay otros vehículos activos disponibles para asignar.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-start-date">Fecha de inicio *</Label>
                <Input
                  id="assignment-start-date"
                  type="date"
                  value={assignmentForm.startDate}
                  onChange={(event) => setAssignmentForm((current) => ({ ...current, startDate: event.target.value }))}
                  required
                  data-testid="input-assignment-start-date"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assignment-observations">Observaciones</Label>
                <Textarea
                  id="assignment-observations"
                  value={assignmentForm.observations}
                  onChange={(event) => setAssignmentForm((current) => ({ ...current, observations: event.target.value }))}
                  placeholder="Turno, ruta habitual o condiciones de uso"
                  data-testid="textarea-assignment-observations"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={!assignmentForm.vehicleId || !assignmentForm.startDate || createAssignmentMutation.isPending}
                  data-testid="button-create-vehicle-assignment"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createAssignmentMutation.isPending ? "Asignando..." : "Asignar vehículo"}
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Asignaciones e historial</h4>
            {assignmentsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando asignaciones...</p>
            ) : vehicleAssignments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Este conductor todavía no tiene vehículos asignados.
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium">{assignment.vehiclePlate}</div>
                          <div className="text-xs text-muted-foreground">
                            {assignment.vehicleBrand} {assignment.vehicleModel} · {assignment.vehicleYear}
                          </div>
                          {assignment.observations && (
                            <div className="text-xs text-muted-foreground mt-1">{assignment.observations}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {assignment.startDate}
                          <span className="mx-1">→</span>
                          {assignment.endDate || "Actual"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.isActive === 1 ? "default" : "secondary"}>
                            {assignment.isActive === 1 ? "Activa" : "Finalizada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && assignment.isActive === 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`¿Finalizar la asignación del vehículo ${assignment.vehiclePlate}?`)) {
                                  finishAssignmentMutation.mutate(assignment.id);
                                }
                              }}
                              disabled={finishAssignmentMutation.isPending}
                              data-testid={`button-finish-assignment-${assignment.id}`}
                            >
                              <Link2Off className="h-4 w-4 mr-2" />
                              Finalizar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Comparendos Dialog ─────────────────────────────────── */}
      <Dialog open={comparendoDialogOpen} onOpenChange={(open) => { setComparendoDialogOpen(open); if (!open) { setComparendoDriverId(null); resetComparendoForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center bg-orange-500 rounded p-1">
                <AlertTriangle className="h-4 w-4 text-black" />
              </span>
              Comparendos — {comparendoDriverName}
            </DialogTitle>
            <DialogDescription>Infracciones de tránsito registradas para este conductor</DialogDescription>
          </DialogHeader>

          {/* Form */}
          {isAdmin && (
            <form onSubmit={handleSubmitComparendo} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium text-sm">{editingComparendo ? "Editar comparendo" : "Registrar nuevo comparendo"}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="comp-placa">Vehículo (placa)</Label>
                  <Select value={comparendoForm.placaVehiculo || "__none__"} onValueChange={v => setComparendoForm(f => ({ ...f, placaVehiculo: v === "__none__" ? "" : v }))}>
                    <SelectTrigger id="comp-placa" data-testid="select-comp-placa"><SelectValue placeholder="Seleccionar vehículo..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Sin especificar —</SelectItem>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.plate}>{v.plate} — {v.brand} {v.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="comp-fecha">Fecha del comparendo *</Label>
                  <Input id="comp-fecha" type="date" value={comparendoForm.fechaComparendo} onChange={e => setComparendoForm(f => ({ ...f, fechaComparendo: e.target.value }))} required data-testid="input-comp-fecha" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="comp-numero">N° comparendo</Label>
                  <Input id="comp-numero" placeholder="Ej. C-2024-001234" value={comparendoForm.numeroComparendo} onChange={e => setComparendoForm(f => ({ ...f, numeroComparendo: e.target.value }))} data-testid="input-comp-numero" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="comp-tipo">Tipo de infracción *</Label>
                  <Select value={comparendoForm.tipoInfraccion} onValueChange={v => setComparendoForm(f => ({ ...f, tipoInfraccion: v }))}>
                    <SelectTrigger id="comp-tipo" data-testid="select-comp-tipo"><SelectValue placeholder="Seleccionar infracción..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Exceso de velocidad">Exceso de velocidad</SelectItem>
                      <SelectItem value="Semáforo en rojo">Semáforo en rojo</SelectItem>
                      <SelectItem value="No usar cinturón de seguridad">No usar cinturón de seguridad</SelectItem>
                      <SelectItem value="Uso de celular conduciendo">Uso de celular conduciendo</SelectItem>
                      <SelectItem value="Conducción bajo el efecto del alcohol">Conducción bajo el efecto del alcohol</SelectItem>
                      <SelectItem value="Conducción bajo el efecto de sustancias psicoactivas">Conducción bajo el efecto de sustancias psicoactivas</SelectItem>
                      <SelectItem value="Licencia de conducción vencida">Licencia de conducción vencida</SelectItem>
                      <SelectItem value="No portar documentos del vehículo">No portar documentos del vehículo</SelectItem>
                      <SelectItem value="Estacionamiento indebido">Estacionamiento indebido</SelectItem>
                      <SelectItem value="Adelantamiento indebido">Adelantamiento indebido</SelectItem>
                      <SelectItem value="Giro prohibido">Giro prohibido</SelectItem>
                      <SelectItem value="Otra infracción">Otra infracción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="comp-valor">Valor (COP)</Label>
                  <Input id="comp-valor" type="number" placeholder="Ej. 547200" value={comparendoForm.valorComparendo} onChange={e => setComparendoForm(f => ({ ...f, valorComparendo: e.target.value }))} data-testid="input-comp-valor" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="comp-estado">Estado *</Label>
                  <Select value={comparendoForm.estado} onValueChange={v => setComparendoForm(f => ({ ...f, estado: v as any }))}>
                    <SelectTrigger id="comp-estado" data-testid="select-comp-estado"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="recurrido">Recurrido</SelectItem>
                      <SelectItem value="prescrito">Prescrito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="comp-obs">Observaciones</Label>
                  <Textarea id="comp-obs" rows={2} placeholder="Notas adicionales..." value={comparendoForm.observaciones} onChange={e => setComparendoForm(f => ({ ...f, observaciones: e.target.value }))} data-testid="input-comp-obs" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {editingComparendo && (
                  <Button type="button" variant="outline" onClick={resetComparendoForm} data-testid="button-cancel-comp">Cancelar</Button>
                )}
                <Button type="submit" disabled={createComparendoMutation.isPending || updateComparendoMutation.isPending} data-testid="button-save-comp">
                  {editingComparendo ? "Guardar cambios" : "Registrar comparendo"}
                </Button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-2">
            {comparendosLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
            ) : comparendos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay comparendos registrados para este conductor.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Infracción</TableHead>
                    <TableHead>N° Comparendo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    {isAdmin && <TableHead>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparendos.map(c => (
                    <TableRow key={c.id} data-testid={`row-comparendo-${c.id}`}>
                      <TableCell className="text-sm">{c.fechaComparendo}</TableCell>
                      <TableCell className="text-sm font-mono">{c.placaVehiculo || "—"}</TableCell>
                      <TableCell className="text-sm">{c.tipoInfraccion}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.numeroComparendo || "—"}</TableCell>
                      <TableCell className="text-sm">{c.valorComparendo ? `$${c.valorComparendo.toLocaleString("es-CO")}` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={estadoLabels[c.estado]?.variant ?? "secondary"} data-testid={`badge-estado-${c.id}`}>
                          {estadoLabels[c.estado]?.label ?? c.estado}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleEditComparendo(c)} data-testid={`button-edit-comp-${c.id}`}><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteComparendoId(c.id)} data-testid={`button-delete-comp-${c.id}`}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete comparendo confirm */}
      <AlertDialog open={!!deleteComparendoId} onOpenChange={(open) => { if (!open) setDeleteComparendoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comparendo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteComparendoId) deleteComparendoMutation.mutate(deleteComparendoId); }}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
