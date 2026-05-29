import { Button } from "@/components/ui/button";
import HelpVideoButton from "@/components/HelpVideoButton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, ArrowLeft, FileDown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Driver, Company, Worker, DriverComparendo, insertDriverSchema, insertDriverComparendoSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

export default function PesvConductores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);

  // Comparendos state
  const [comparendoDriverId, setComparendoDriverId] = useState<string | null>(null);
  const [comparendoDriverName, setComparendoDriverName] = useState("");
  const [comparendoDialogOpen, setComparendoDialogOpen] = useState(false);
  const [editingComparendo, setEditingComparendo] = useState<DriverComparendo | null>(null);
  const [deleteComparendoId, setDeleteComparendoId] = useState<string | null>(null);
  const [comparendoForm, setComparendoForm] = useState({
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
    licenseType: "A1" | "A2" | "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
    licenseExpiry: string;
    bloodType: string;
    emergencyContact: string;
    emergencyPhone: string;
    medicalExamExpiry: string;
    status: "activo" | "inactivo" | "retirado" | "suspendido";
    observations: string;
  }>({
    workerId: "",
    name: "",
    identificationNumber: "",
    licenseNumber: "",
    licenseType: "B1",
    licenseExpiry: "",
    bloodType: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalExamExpiry: "",
    status: "activo",
    observations: "",
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: comparendos = [], isLoading: comparendosLoading } = useQuery<DriverComparendo[]>({
    queryKey: ["/api/drivers", comparendoDriverId, "comparendos"],
    enabled: !!comparendoDriverId,
  });

  const createComparendoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDriverComparendoSchema>) => {
      const res = await apiRequest("POST", `/api/drivers/${comparendoDriverId}/comparendos`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", comparendoDriverId, "comparendos"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", comparendoDriverId, "comparendos"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/drivers", comparendoDriverId, "comparendos"] });
      setDeleteComparendoId(null);
      toast({ title: "Comparendo eliminado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetComparendoForm = () => {
    setEditingComparendo(null);
    setComparendoForm({ fechaComparendo: "", numeroComparendo: "", tipoInfraccion: "", descripcion: "", valorComparendo: "", estado: "pendiente", observaciones: "" });
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
    queryKey: ["/api/workers"],
    enabled: !!user?.companyId,
  });

  // Handler para seleccionar trabajador y auto-llenar datos
  const handleWorkerSelect = (workerId: string) => {
    if (workerId === "manual") {
      setFormData({
        ...formData,
        workerId: "",
        name: "",
        identificationNumber: "",
      });
      return;
    }
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
      const res = await apiRequest("POST", "/api/drivers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
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
    
    const data = {
      ...formData,
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
      licenseType: "B1",
      licenseExpiry: "",
      bloodType: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalExamExpiry: "",
      status: "activo",
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
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H07" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {user?.role && hasCompanyAdminAccess(user.role) && (
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
                        value={formData.workerId || "manual"}
                        onValueChange={handleWorkerSelect}
                      >
                        <SelectTrigger id="workerSelect" data-testid="select-worker">
                          <SelectValue placeholder="Seleccione un trabajador o ingrese manualmente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">-- Ingresar datos manualmente --</SelectItem>
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
                        <SelectValue />
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
                      required
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
                    <Label htmlFor="medicalExamExpiry">Vencimiento Examen Médico</Label>
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
                        <SelectValue />
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
                        data-testid={`button-comparendos-${driver.id}`}
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </Button>
                      {user?.role && hasCompanyAdminAccess(user.role) && (
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

      {/* ── Comparendos Dialog ─────────────────────────────────── */}
      <Dialog open={comparendoDialogOpen} onOpenChange={(open) => { setComparendoDialogOpen(open); if (!open) { setComparendoDriverId(null); resetComparendoForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
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
