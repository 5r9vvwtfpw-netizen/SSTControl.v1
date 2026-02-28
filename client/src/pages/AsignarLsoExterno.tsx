/**
 * Página de Asignación de LSO desde Directorio Externo
 * 
 * Permite a las empresas:
 * - Ver el directorio de profesionales LSO disponibles (desde lso.sst-colombia.com.co)
 * - Buscar por nombre, email o ciudad
 * - Asignar un LSO a su empresa
 * - Ver el LSO actualmente asignado
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { CIIU_CODES } from "@/lib/ciiu-codes";
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
  ExternalLink,
  Camera,
  Eye,
  FileText,
  Briefcase,
  KeyRound,
  ShieldCheck
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
  photoUrl?: string;
  profileVisits?: number;
  documentId?: string;
  department?: string;
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
  portalAccess?: {
    hasAccount: boolean;
    username?: string;
    userId?: string;
  };
}

export default function AsignarLsoExterno() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLso, setSelectedLso] = useState<LsoRegistration | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [confirmNegotiation, setConfirmNegotiation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedCompany, effectiveCompanyId } = useCompanyContext();

  const { data: companyData } = useQuery<any>({
    queryKey: ["/api/company/current"],
    enabled: !!user?.companyId || !!effectiveCompanyId,
  });

  const buildMailtoUrl = useMemo(() => {
    return (lso: LsoRegistration) => {
      const c = companyData || selectedCompany;
      const companyName = c?.name || "";
      const nit = c?.nit || "";
      const ciiuCode = c?.ciiuCode || "";
      const ciiuEntry = CIIU_CODES.find(item => item.code === ciiuCode);
      const ciiuDisplay = ciiuEntry ? `${ciiuCode} - ${ciiuEntry.description}` : ciiuCode;
      const riskLevel = c?.riskLevel || "";
      const workers = c?.numberOfWorkers;
      const vehicles = c?.numberOfVehicles ?? 0;
      const city = c?.city || "";
      const address = c?.address || "";
      const contactPhone = c?.contactPhone || "";
      const contactEmail = c?.contactEmail || "";
      const legalRep = c?.legalRepName || "";
      const legalRepPosition = c?.legalRepPosition || "Representante Legal";

      const subject = encodeURIComponent(`Solicitud de servicios SST - ${companyName} (NIT: ${nit})`);

      let vehicleSection = "";
      if (vehicles && vehicles > 0) {
        vehicleSection = `- Vehículos registrados: ${vehicles} (aplica PESV - Plan Estratégico de Seguridad Vial)\n`;
      }

      const body = encodeURIComponent(
        `Estimado(a) ${lso.fullName},\n\n` +
        `Reciba un cordial saludo. A través de la plataforma SST Colombia hemos identificado su perfil profesional en el directorio de Licenciados en Seguridad y Salud en el Trabajo y nos permitimos presentar nuestra empresa para explorar una posible vinculación de sus servicios profesionales.\n\n` +
        `═══════════════════════════════════════\n` +
        `INFORMACIÓN DE LA EMPRESA\n` +
        `═══════════════════════════════════════\n\n` +
        `Razón Social: ${companyName}\n` +
        `NIT: ${nit}\n` +
        `Actividad Económica (CIIU): ${ciiuDisplay}\n` +
        `Nivel de Riesgo ARL: ${riskLevel}\n` +
        `Ciudad: ${city}\n` +
        (address ? `Dirección: ${address}\n` : "") +
        `Número de trabajadores: ${workers}\n` +
        vehicleSection +
        `\n` +
        `═══════════════════════════════════════\n` +
        `DATOS DE CONTACTO\n` +
        `═══════════════════════════════════════\n\n` +
        `Representante Legal: ${legalRep}\n` +
        `Cargo: ${legalRepPosition}\n` +
        `Teléfono: ${contactPhone}\n` +
        `Correo electrónico: ${contactEmail}\n\n` +
        `═══════════════════════════════════════\n` +
        `SOBRE NUESTRO SISTEMA DE GESTIÓN\n` +
        `═══════════════════════════════════════\n\n` +
        `Nuestra empresa ya tiene implementado el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) a través de la plataforma digital SST Colombia (sst.sagisas.co). El software ya gestiona la documentación, los estándares mínimos, la trazabilidad del ciclo PHVA, los reportes y la mayor parte del cumplimiento normativo de forma automatizada.\n\n` +
        `Buscamos un profesional Licenciado en SST que se vincule para liderar y gestionar el programa directamente dentro de nuestra plataforma, brindando:\n\n` +
        `- Direccionamiento técnico y profesional del SG-SST conforme a la Resolución 0312 de 2019\n` +
        `- Liderazgo en las intervenciones de ley, inspecciones y cumplimiento de estándares mínimos\n` +
        `- Gestión de riesgos laborales, vigilancia epidemiológica y programas de prevención\n` +
        `- Firma y respaldo profesional de los documentos técnicos generados por el sistema\n` +
        `- Participación activa en el COPASST y Comité de Convivencia Laboral\n` +
        (vehicles && vehicles > 0 ? `- Gestión del PESV (Plan Estratégico de Seguridad Vial) conforme a la Resolución 40595 de 2022\n` : "") +
        `\nIMPORTANTE: La plataforma SST Colombia cuenta con un Portal exclusivo para Licenciados en SST. Una vez vinculado, usted accederá a través de este portal dedicado donde podrá gestionar, supervisar y dar direccionamiento al SG-SST de nuestra empresa sin necesidad de ingresar al sistema interno de la empresa. Desde el Portal del Licenciado tendrá visibilidad completa del estado del programa, los indicadores, documentos y el cumplimiento normativo.\n\n` +
        `Nos gustaría agendar una reunión para discutir en detalle:\n` +
        `- Alcance específico del acompañamiento según nuestro perfil empresarial\n` +
        `- Propuesta económica y condiciones contractuales\n` +
        `- Cronograma y disponibilidad\n\n` +
        `Nota: Este contacto se realiza de manera directa entre la empresa y el profesional. SST Colombia actúa únicamente como facilitador del directorio y no interviene en la negociación ni en la relación contractual.\n\n` +
        `Quedamos atentos a su respuesta.\n\n` +
        `Cordialmente,\n\n` +
        `${legalRep}\n` +
        `${legalRepPosition}\n` +
        `${companyName}\n` +
        `NIT: ${nit}\n` +
        `Tel: ${contactPhone}\n` +
        `Email: ${contactEmail}`
      );
      return `mailto:${lso.email}?subject=${subject}&body=${body}`;
    };
  }, [companyData, selectedCompany, user]);

  // Query para verificar el estado de la integración (usando nuevos endpoints JWT)
  const { data: statusData, isLoading: statusLoading } = useQuery<{ ok: boolean; configured: boolean; connected?: boolean; message: string }>({
    queryKey: ["/api/lso-directory-jwt/status"],
  });

  // Query para obtener la asignación actual
  const { data: assignmentData, isLoading: assignmentLoading } = useQuery<{ ok: boolean; data: LsoAssignment | null }>({
    queryKey: ["/api/lso-directory-jwt/current-assignment"],
  });

  // Query para obtener el directorio de LSO (búsqueda en tiempo real)
  const { data: directoryData, isLoading: directoryLoading, refetch: refetchDirectory } = useQuery<{ ok: boolean; data: LsoRegistration[]; total: number }>({
    queryKey: ["/api/lso-directory-jwt/search", searchTerm],
    enabled: statusData?.configured === true,
  });

  // Mutation para asignar LSO (usando endpoint JWT - envía datos completos)
  const assignMutation = useMutation({
    mutationFn: async (lso: LsoRegistration) => {
      // Enviar datos completos del LSO para evitar llamada adicional al directorio
      return apiRequest("POST", "/api/lso-directory-jwt/assign", {
        externalLsoId: lso.id,
        lsoData: {
          fullName: lso.fullName,
          email: lso.email,
          phone: lso.phone,
          city: lso.city,
          status: lso.status,
          licenseNumber: lso.licenseNumber,
          licenseIssuer: lso.licenseIssuer,
          licenseExpiry: lso.licenseExpiry,
          professionType: lso.professionType,
          signatureUrl: lso.signatureUrl,
        }
      });
    },
    onSuccess: async (response: any) => {
      const data = typeof response === 'object' ? response : await response?.json?.();
      const wasAutoCreated = data?.userAutoCreated;
      toast({
        title: "LSO Asignado",
        description: wasAutoCreated
          ? data?.message || "El profesional ha sido asignado y se le creó acceso al Portal del Licenciado automáticamente. Las credenciales fueron enviadas por email."
          : "El profesional ha sido asignado exitosamente a su empresa.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lso-directory-jwt/current-assignment"] });
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
      return apiRequest("DELETE", "/api/lso-directory-jwt/unassign");
    },
    onSuccess: () => {
      toast({
        title: "Asignación Removida",
        description: "Se ha removido la asignación del LSO.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lso-directory-jwt/current-assignment"] });
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
    setShowProfileModal(true);
  };

  const handleAssignFromProfile = () => {
    setShowProfileModal(false);
    setConfirmNegotiation(false);
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

  if (statusData?.configured === false) {
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
              Para usar esta funcionalidad, es necesario configurar la variable de entorno <code className="bg-muted px-1 rounded">LANDING_PAGE_API_KEY</code> con la clave de acceso al directorio de profesionales licenciados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusData?.configured === true && statusData?.connected === false) {
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/lso-directory-jwt/status"] })}
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

      {/* Aviso de proceso de contratación */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300" data-testid="text-process-info">
                Proceso de contratación del Profesional LSO
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Busque en el directorio al profesional que se ajuste a sus necesidades</li>
                <li><strong>Contacte al profesional directamente</strong> por correo o teléfono para negociar los términos del servicio</li>
                <li>Una vez acordados los términos, asígnelo desde esta página para vincularlo a su SG-SST</li>
                <li>Al asignarlo, el profesional recibirá acceso al Portal LSO para firmar documentos</li>
              </ol>
              <p className="text-xs text-blue-600 dark:text-blue-500">
                El profesional LSO es un contratista independiente. SST Colombia facilita el directorio para que usted pueda encontrar profesionales licenciados, pero no participa en la negociación ni en la relación contractual. Los términos del servicio (honorarios, alcance, duración) se acuerdan directamente entre su empresa y el profesional elegido. Asigne al profesional en el sistema solo después de haber formalizado el acuerdo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

            {assignmentData.data.portalAccess && (
              <div className={`mt-4 rounded-md p-3 flex items-center gap-3 ${
                assignmentData.data.portalAccess.hasAccount
                  ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
              }`} data-testid="portal-access-status">
                {assignmentData.data.portalAccess.hasAccount ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Portal del Licenciado: Acceso activo
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Usuario: {assignmentData.data.portalAccess.username} — Las credenciales fueron enviadas por email al profesional.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Portal del Licenciado: Sin acceso
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        El profesional aún no tiene usuario para el portal. Contacte al administrador.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
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

        </CardContent>
      </Card>

      {/* LSO Profile Card Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Información del Usuario</DialogTitle>
          </DialogHeader>
          
          {selectedLso && (
            <div className="space-y-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre completo</p>
                      <p className="font-medium">{selectedLso.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Correo electrónico</p>
                      <p className="font-medium break-all">{selectedLso.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Celular</p>
                      <p className="font-medium">{selectedLso.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {selectedLso.photoUrl ? (
                    <img
                      src={selectedLso.photoUrl}
                      alt={selectedLso.fullName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-muted"
                      data-testid="img-lso-photo"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-muted bg-muted flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ciudad</p>
                    <p className="font-medium">{selectedLso.city}{selectedLso.department ? ` (${selectedLso.department})` : ''}</p>
                  </div>
                </div>
                {selectedLso.profileVisits !== undefined && (
                  <div className="flex items-start gap-2">
                    <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Visitas al perfil</p>
                      <p className="font-medium">{selectedLso.profileVisits}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Información Profesional</p>
                <div className="space-y-3">
                  {selectedLso.documentId && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cédula</p>
                        <p className="font-medium">{selectedLso.documentId}</p>
                      </div>
                    </div>
                  )}
                  {selectedLso.professionType && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Profesión</p>
                        <p className="font-medium">{selectedLso.professionType}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    {(() => {
                      const s = (selectedLso.status || '').toLowerCase();
                      return (
                        <Badge 
                          variant="outline"
                          className={
                            s === 'confirmado' 
                              ? 'bg-green-100 text-green-700 border-green-300' 
                              : s === 'pendiente' 
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                              : s === 'rechazado'
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : ''
                          }
                          data-testid="badge-lso-status"
                        >
                          {s === 'confirmado' ? 'Confirmado' : s === 'pendiente' ? 'Pendiente' : s === 'rechazado' ? 'Rechazado' : selectedLso.status}
                        </Badge>
                      );
                    })()}
                  </div>
                  {(selectedLso.createdAt || selectedLso.confirmedAt) && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Registrado</span>
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(selectedLso.createdAt || selectedLso.confirmedAt!).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {selectedLso.confirmedAt && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Confirmado</span>
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(selectedLso.confirmedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedLso && (
            <div className="border-t pt-4 mt-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Antes de asignar, contacte al profesional
                </p>
                <div className="space-y-1">
                  {selectedLso.email && (
                    <a href={buildMailtoUrl(selectedLso)} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 hover:underline" data-testid="link-contact-email">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedLso.email}
                    </a>
                  )}
                  {selectedLso.phone && (
                    <a href={`tel:${selectedLso.phone}`} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 hover:underline" data-testid="link-contact-phone">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedLso.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>
              Cerrar
            </Button>
            <Button 
              onClick={handleAssignFromProfile}
              data-testid="button-assign-from-profile"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Asignar a mi empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de asignación */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        setShowConfirmDialog(open);
        if (!open) setConfirmNegotiation(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Asignación de LSO</DialogTitle>
            <DialogDescription>
              Confirme que ya ha contactado y llegado a un acuerdo con este profesional antes de asignarlo.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLso && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
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

              <div className="border rounded-md p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <label className="flex items-start gap-3 cursor-pointer" data-testid="label-confirm-negotiation">
                  <input
                    type="checkbox"
                    checked={confirmNegotiation}
                    onChange={(e) => setConfirmNegotiation(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-400 text-primary focus:ring-primary"
                    data-testid="checkbox-confirm-negotiation"
                  />
                  <span className="text-sm text-amber-800 dark:text-amber-300">
                    Confirmo que he contactado previamente a <strong>{selectedLso.fullName}</strong> y hemos llegado a un acuerdo para la prestación de servicios como Licenciado en SST para mi empresa.
                  </span>
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAssign}
              disabled={assignMutation.isPending || !confirmNegotiation}
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
