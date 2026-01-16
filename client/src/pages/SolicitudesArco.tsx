import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  FileText, 
  UserCheck, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import type { InsertArcoRequest, ArcoRequest } from "@shared/schema";
import { hasCompanyAdminAccess } from "@shared/permissions";

export default function SolicitudesArco() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ArcoRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<InsertArcoRequest>>({
    companyId: user?.companyId || "",
    requestType: "acceso",
    status: "pendiente",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requesterIdentification: "",
    isRepresentative: 0,
    requestDescription: "",
  });

  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  // Fetch ARCO requests
  const { data: arcoRequests = [], isLoading } = useQuery<ArcoRequest[]>({
    queryKey: ["/api/arco-requests"],
    enabled: !!user,
  });

  // Create ARCO request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: Partial<InsertArcoRequest>) => {
      const res = await apiRequest("POST", "/api/arco-requests", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arco-requests"] });
      setDialogOpen(false);
      setEditingRequest(null);
      resetForm();
      toast({
        title: "Solicitud ARCO creada",
        description: "La solicitud ha sido registrada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la solicitud",
        variant: "destructive",
      });
    },
  });

  // Update ARCO request mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertArcoRequest> }) => {
      const res = await apiRequest("PATCH", `/api/arco-requests/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arco-requests"] });
      setDialogOpen(false);
      setEditingRequest(null);
      resetForm();
      toast({
        title: "Solicitud actualizada",
        description: "Los cambios han sido guardados exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la solicitud",
        variant: "destructive",
      });
    },
  });

  // Assign request mutation
  const assignRequestMutation = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
      const res = await apiRequest("POST", `/api/arco-requests/${id}/assign`, { assignedTo });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arco-requests"] });
      toast({
        title: "Solicitud asignada",
        description: "La solicitud ha sido asignada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar la solicitud",
        variant: "destructive",
      });
    },
  });

  // Escalate request mutation
  const escalateRequestMutation = useMutation({
    mutationFn: async ({ id, escalatedTo, escalationReason }: { id: string; escalatedTo: string; escalationReason: string }) => {
      const res = await apiRequest("POST", `/api/arco-requests/${id}/escalate`, { escalatedTo, escalationReason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arco-requests"] });
      toast({
        title: "Solicitud escalada",
        description: "La solicitud ha sido escalada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo escalar la solicitud",
        variant: "destructive",
      });
    },
  });

  // Complete request mutation
  const completeRequestMutation = useMutation({
    mutationFn: async ({ id, responseDescription }: { id: string; responseDescription: string }) => {
      const res = await apiRequest("POST", `/api/arco-requests/${id}/complete`, { responseDescription });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arco-requests"] });
      toast({
        title: "Solicitud completada",
        description: "La solicitud ha sido marcada como completada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la solicitud",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      companyId: user?.companyId || "",
      requestType: "acceso",
      status: "pendiente",
      requesterName: "",
      requesterEmail: "",
      requesterPhone: "",
      requesterIdentification: "",
      isRepresentative: 0,
      requestDescription: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId) {
      toast({
        title: "Error",
        description: "Debe especificar una empresa",
        variant: "destructive",
      });
      return;
    }

    if (editingRequest) {
      updateRequestMutation.mutate({ id: editingRequest.id, data: formData });
    } else {
      createRequestMutation.mutate(formData);
    }
  };

  const handleOpenDialog = () => {
    setEditingRequest(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditRequest = (request: ArcoRequest) => {
    setEditingRequest(request);
    setFormData({
      companyId: request.companyId,
      requestType: request.requestType,
      status: request.status,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterPhone: request.requesterPhone || "",
      requesterIdentification: request.requesterIdentification,
      isRepresentative: request.isRepresentative,
      dataSubjectName: request.dataSubjectName || "",
      dataSubjectIdentification: request.dataSubjectIdentification || "",
      requestDescription: request.requestDescription,
      specificDataRequested: request.specificDataRequested || "",
      justification: request.justification || "",
    });
    setDialogOpen(true);
  };

  // Filter requests
  const filteredRequests = arcoRequests.filter((request) => {
    if (filterStatus !== "all" && request.status !== filterStatus) return false;
    if (filterType !== "all" && request.requestType !== filterType) return false;
    return true;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { variant: "secondary" as const, icon: Clock, label: "Pendiente" },
      en_proceso: { variant: "default" as const, icon: AlertCircle, label: "En Proceso" },
      completada: { variant: "outline" as const, icon: CheckCircle, label: "Completada" },
      rechazada: { variant: "destructive" as const, icon: AlertCircle, label: "Rechazada" },
      parcialmente_completada: { variant: "secondary" as const, icon: CheckCircle, label: "Parcialmente Completada" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Get request type label
  const getRequestTypeLabel = (type: string) => {
    const typeLabels = {
      acceso: "Acceso",
      rectificacion: "Rectificación",
      cancelacion: "Cancelación",
      oposicion: "Oposición",
      portabilidad: "Portabilidad",
      limitacion: "Limitación",
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Solicitudes ARCO
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) - Ley 1581/2012
          </p>
        </div>
        <Button onClick={handleOpenDialog} data-testid="button-new-arco-request">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Estado</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-testid="filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="parcialmente_completada">Parcialmente Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Tipo de Solicitud</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger data-testid="filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="acceso">Acceso</SelectItem>
                <SelectItem value="rectificacion">Rectificación</SelectItem>
                <SelectItem value="cancelacion">Cancelación</SelectItem>
                <SelectItem value="oposicion">Oposición</SelectItem>
                <SelectItem value="portabilidad">Portabilidad</SelectItem>
                <SelectItem value="limitacion">Limitación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Cargando solicitudes...</p>
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No se encontraron solicitudes</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover-elevate cursor-pointer" onClick={() => handleEditRequest(request)} data-testid={`card-arco-request-${request.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {getRequestTypeLabel(request.requestType)}
                    </CardTitle>
                    <CardDescription>
                      Solicitante: {request.requesterName} ({request.requesterIdentification})
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(request.status)}
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(request.createdAt), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{request.requestDescription}</p>
                {request.assignedTo && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    Asignado
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRequest ? "Editar Solicitud ARCO" : "Nueva Solicitud ARCO"}</DialogTitle>
            <DialogDescription>
              {editingRequest ? "Actualice los datos de la solicitud" : "Complete los datos del solicitante y la solicitud"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="requester" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requester">Datos del Solicitante</TabsTrigger>
                <TabsTrigger value="request">Detalles de la Solicitud</TabsTrigger>
              </TabsList>
              
              <TabsContent value="requester" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="requesterName">Nombre Completo *</Label>
                    <Input
                      id="requesterName"
                      value={formData.requesterName}
                      onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                      required
                      data-testid="input-requester-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requesterIdentification">Identificación *</Label>
                    <Input
                      id="requesterIdentification"
                      value={formData.requesterIdentification}
                      onChange={(e) => setFormData({ ...formData, requesterIdentification: e.target.value })}
                      required
                      data-testid="input-requester-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requesterEmail">Email *</Label>
                    <Input
                      id="requesterEmail"
                      type="email"
                      value={formData.requesterEmail}
                      onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                      required
                      data-testid="input-requester-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requesterPhone">Teléfono</Label>
                    <Input
                      id="requesterPhone"
                      value={formData.requesterPhone || ""}
                      onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                      data-testid="input-requester-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="isRepresentative">¿Actúa como representante?</Label>
                    <Select
                      value={formData.isRepresentative?.toString() || "0"}
                      onValueChange={(value) => setFormData({ ...formData, isRepresentative: parseInt(value) })}
                    >
                      <SelectTrigger data-testid="select-is-representative">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No, soy el titular</SelectItem>
                        <SelectItem value="1">Sí, represento al titular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.isRepresentative === 1 && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="dataSubjectName">Nombre del Titular</Label>
                        <Input
                          id="dataSubjectName"
                          value={formData.dataSubjectName || ""}
                          onChange={(e) => setFormData({ ...formData, dataSubjectName: e.target.value })}
                          data-testid="input-data-subject-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataSubjectIdentification">Identificación del Titular</Label>
                        <Input
                          id="dataSubjectIdentification"
                          value={formData.dataSubjectIdentification || ""}
                          onChange={(e) => setFormData({ ...formData, dataSubjectIdentification: e.target.value })}
                          data-testid="input-data-subject-id"
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="request" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requestType">Tipo de Solicitud *</Label>
                    <Select
                      value={formData.requestType}
                      onValueChange={(value) => setFormData({ ...formData, requestType: value as any })}
                    >
                      <SelectTrigger data-testid="select-request-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acceso">Acceso - Consultar datos</SelectItem>
                        <SelectItem value="rectificacion">Rectificación - Corregir datos</SelectItem>
                        <SelectItem value="cancelacion">Cancelación - Eliminar datos</SelectItem>
                        <SelectItem value="oposicion">Oposición - Objetar tratamiento</SelectItem>
                        <SelectItem value="portabilidad">Portabilidad - Transferir datos</SelectItem>
                        <SelectItem value="limitacion">Limitación - Restringir uso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editingRequest && (
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                      >
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="rechazada">Rechazada</SelectItem>
                          <SelectItem value="parcialmente_completada">Parcialmente Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="requestDescription">Descripción de la Solicitud *</Label>
                  <Textarea
                    id="requestDescription"
                    value={formData.requestDescription}
                    onChange={(e) => setFormData({ ...formData, requestDescription: e.target.value })}
                    rows={4}
                    placeholder="Describa detalladamente lo que solicita..."
                    required
                    data-testid="textarea-request-description"
                  />
                </div>

                <div>
                  <Label htmlFor="specificDataRequested">Datos Específicos Solicitados</Label>
                  <Textarea
                    id="specificDataRequested"
                    value={formData.specificDataRequested || ""}
                    onChange={(e) => setFormData({ ...formData, specificDataRequested: e.target.value })}
                    rows={2}
                    placeholder="Ej: Nombre, cédula, dirección, historial laboral..."
                    data-testid="textarea-specific-data"
                  />
                </div>

                {(formData.requestType === "cancelacion" || formData.requestType === "oposicion") && (
                  <div>
                    <Label htmlFor="justification">Justificación</Label>
                    <Textarea
                      id="justification"
                      value={formData.justification || ""}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      rows={3}
                      placeholder="Explique el motivo de su solicitud..."
                      data-testid="textarea-justification"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createRequestMutation.isPending || updateRequestMutation.isPending}
                data-testid="button-submit-arco-request"
              >
                {createRequestMutation.isPending || updateRequestMutation.isPending
                  ? "Guardando..."
                  : editingRequest
                  ? "Actualizar"
                  : "Crear Solicitud"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
