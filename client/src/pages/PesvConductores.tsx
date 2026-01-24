import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Driver, Company, insertDriverSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

export default function PesvConductores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    companyId: "",
    workerId: "",
    name: "",
    identificationNumber: "",
    licenseNumber: "",
    licenseType: "B1" as const,
    licenseExpiry: "",
    bloodType: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalExamExpiry: "",
    status: "activo" as const,
    observations: "",
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isAdmin,
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDriverSchema>) => {
      const payload = isAdmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/drivers", payload);
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
      const res = await apiRequest("DELETE", `/api/drivers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Conductor eliminado",
        description: "El conductor se ha eliminado exitosamente",
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
    
    if (isAdmin && !formData.companyId && !editingDriver) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
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
    if (confirm("¿Está seguro de eliminar este conductor?")) {
      deleteDriverMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      companyId: "",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Conductores PESV</h1>
          <p className="text-muted-foreground">Gestión de conductores y licencias</p>
        </div>
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
                  {isAdmin && !editingDriver && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="companyId">Empresa *</Label>
                      <Select
                        value={formData.companyId}
                        onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                      >
                        <SelectTrigger id="companyId" data-testid="select-company">
                          <SelectValue placeholder="Seleccione empresa" />
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
                  )}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Juan Pérez García"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identificationNumber">Número de Identificación *</Label>
                    <Input
                      id="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                      required
                      placeholder="1234567890"
                      data-testid="input-identification-number"
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
                    <Input
                      id="bloodType"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      placeholder="O+"
                      data-testid="input-blood-type"
                    />
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
              {user?.role && hasCompanyAdminAccess(user.role) && <TableHead data-testid="header-actions">Acciones</TableHead>}
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
                  {user?.role && hasCompanyAdminAccess(user.role) && (
                    <TableCell>
                      <div className="flex gap-2">
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
                          disabled={deleteDriverMutation.isPending}
                          data-testid={`button-delete-${driver.id}`}
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
