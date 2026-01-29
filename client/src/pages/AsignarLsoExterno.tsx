/**
 * Página de Asignación de LSO desde Directorio Externo
 * 
 * Permite a las empresas:
 * - Ver el directorio de profesionales LSO disponibles (desde lso.sst-colombia.com.co)
 * - Buscar por nombre, email o ciudad
 * - Asignar un LSO a su empresa
 * - Ver el LSO actualmente asignado
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  User, 
  MapPin, 
  Mail, 
  Phone,
  Award,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

interface LsoRegistration {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiry?: string;
  professionType?: string;
  signatureUrl?: string;
}

interface LsoAssignment {
  type: 'external' | 'internal';
  assignmentId: string;
  externalLsoId?: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiry?: string;
  signatureUrl?: string;
  assignedAt: string;
}

export default function AsignarLsoExterno() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLso, setSelectedLso] = useState<LsoRegistration | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para verificar el estado de la integración
  const { data: statusData, isLoading: statusLoading } = useQuery<{ ok: boolean; status: string; message: string }>({
    queryKey: ["/api/lso-directory/status"],
  });

  // Query para obtener la asignación actual
  const { data: assignmentData, isLoading: assignmentLoading } = useQuery<{ ok: boolean; data: LsoAssignment | null }>({
    queryKey: ["/api/lso-directory/company-assignment"],
  });

  // Query para obtener el directorio de LSO
  const { data: directoryData, isLoading: directoryLoading, refetch: refetchDirectory } = useQuery<{ ok: boolean; data: LsoRegistration[]; total: number }>({
    queryKey: ["/api/lso-directory/external", searchTerm],
    enabled: statusData?.status === 'connected',
  });

  // Mutation para asignar LSO (solo envía ID, el backend valida y obtiene datos)
  const assignMutation = useMutation({
    mutationFn: async (lso: LsoRegistration) => {
      return apiRequest("POST", "/api/lso-directory/assign-external", {
        externalLsoId: lso.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "LSO Asignado",
        description: "El profesional ha sido asignado exitosamente a su empresa.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lso-directory/company-assignment"] });
      setSelectedLso(null);
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el LSO",
        variant: "destructive",
      });
    },
  });

  // Mutation para remover asignación
  const removeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/lso-directory/company-assignment");
    },
    onSuccess: () => {
      toast({
        title: "Asignación Removida",
        description: "Se ha removido la asignación del LSO.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lso-directory/company-assignment"] });
      setShowRemoveDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo remover la asignación",
        variant: "destructive",
      });
    },
  });

  const handleSelectLso = (lso: LsoRegistration) => {
    setSelectedLso(lso);
    setShowConfirmDialog(true);
  };

  const handleConfirmAssign = () => {
    if (selectedLso) {
      assignMutation.mutate(selectedLso);
    }
  };

  const filteredLsoList = directoryData?.data?.filter((lso) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lso.fullName.toLowerCase().includes(search) ||
      lso.email.toLowerCase().includes(search) ||
      lso.city.toLowerCase().includes(search)
    );
  }) || [];

  // Si la integración no está configurada
  if (statusLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (statusData?.status === 'not_configured') {
    return (
      <div className="p-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Integración No Configurada
            </CardTitle>
            <CardDescription className="text-orange-600">
              La conexión con el directorio de LSO no está configurada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Para usar esta funcionalidad, es necesario configurar la variable de entorno <code className="bg-muted px-1 rounded">LSO_API_KEY</code> con la clave de acceso al directorio de profesionales licenciados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusData?.status === 'error') {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Error de Conexión
            </CardTitle>
            <CardDescription className="text-red-600">
              No se puede conectar con el directorio de LSO.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {statusData.message}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/lso-directory/status"] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Conexión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">
          Asignación de Profesional LSO
        </h1>
        <p className="text-muted-foreground">
          Busque y asigne un Licenciado en Seguridad y Salud en el Trabajo desde el directorio externo.
        </p>
      </div>

      {/* LSO Actualmente Asignado */}
      {assignmentLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : assignmentData?.data ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <UserCheck className="h-5 w-5" />
              LSO Actualmente Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{assignmentData.data.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{assignmentData.data.email}</span>
              </div>
              {assignmentData.data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{assignmentData.data.phone}</span>
                </div>
              )}
              {assignmentData.data.licenseNumber && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Licencia: {assignmentData.data.licenseNumber}</span>
                </div>
              )}
              {assignmentData.data.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{assignmentData.data.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Asignado: {new Date(assignmentData.data.assignedAt).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowRemoveDialog(true)}
              data-testid="button-remove-assignment"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Remover Asignación
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No tiene un LSO asignado. Busque y seleccione uno del directorio a continuación.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Directorio de Profesionales LSO
          </CardTitle>
          <CardDescription>
            Profesionales licenciados disponibles para prestar servicios SST
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-lso"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetchDirectory()}
              data-testid="button-refresh-directory"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {directoryLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredLsoList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron profesionales LSO que coincidan con su búsqueda.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLsoList.map((lso) => (
                <Card 
                  key={lso.id} 
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => handleSelectLso(lso)}
                  data-testid={`card-lso-${lso.id}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{lso.fullName}</span>
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lso.email}
                          </div>
                          {lso.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lso.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lso.city}
                          </div>
                        </div>
                        {lso.licenseNumber && (
                          <div className="flex items-center gap-1 text-sm">
                            <Award className="h-3 w-3 text-primary" />
                            <span>Licencia SST: {lso.licenseNumber}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-select-lso-${lso.id}`}>
                        Seleccionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            <a 
              href="https://lso.sst-colombia.com.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              <ExternalLink className="h-3 w-3" />
              Ver directorio completo en lso.sst-colombia.com.co
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación de asignación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Asignación de LSO</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea asignar este profesional como su Licenciado en SST?
            </DialogDescription>
          </DialogHeader>
          
          {selectedLso && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedLso.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{selectedLso.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedLso.city}</span>
              </div>
              {selectedLso.licenseNumber && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Licencia: {selectedLso.licenseNumber}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAssign}
              disabled={assignMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignMutation.isPending ? "Asignando..." : "Confirmar Asignación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para remover */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover Asignación de LSO?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la asignación actual del LSO. Los documentos ya firmados no se verán afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-remove"
            >
              {removeMutation.isPending ? "Removiendo..." : "Sí, Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
