import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Loader2,
  RefreshCw,
  Eye,
  Ban,
  History,
  Building2,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SupportAccessSession {
  id: string;
  sessionNumber: string;
  supportUserId: string;
  supportUserName: string;
  companyId: string;
  companyName: string;
  status: string;
  justification: string;
  scope: string;
  relatedTicketId: string | null;
  relatedTicketNumber: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  denialReason: string | null;
  requestedDurationMinutes: number;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
  legalBasis: string | null;
  dataProcessingPurpose: string | null;
}

interface SupportAccessEvent {
  id: string;
  sessionId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface SessionWithEvents extends SupportAccessSession {
  events: SupportAccessEvent[];
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  denied: "Denegado",
  expired: "Expirado",
  revoked: "Revocado"
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  revoked: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
};

const scopeLabels: Record<string, string> = {
  read_only: "Solo Lectura",
  read_write: "Lectura y Escritura"
};

const scopeColors: Record<string, string> = {
  read_only: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  read_write: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
};

const eventTypeLabels: Record<string, string> = {
  request_created: "Solicitud Creada",
  request_approved: "Solicitud Aprobada",
  request_denied: "Solicitud Denegada",
  access_started: "Acceso Iniciado",
  access_ended: "Acceso Finalizado",
  access_revoked: "Acceso Revocado",
  session_expired: "Sesión Expirada",
  data_accessed: "Datos Accedidos",
  data_modified: "Datos Modificados"
};

export default function AccesosSoporte() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSession, setSelectedSession] = useState<SessionWithEvents | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [denialReason, setDenialReason] = useState("");
  const [revokedReason, setRevokedReason] = useState("");
  const [sessionToAction, setSessionToAction] = useState<SupportAccessSession | null>(null);

  const canManageAccess = user?.role === 'superusuario' || user?.role === 'admin' || user?.role === 'superadmin';

  if (!canManageAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              Esta página es solo para administradores de la empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: sessions = [], isLoading, refetch } = useQuery<SupportAccessSession[]>({
    queryKey: ['/api/support-access/sessions']
  });

  const { data: pendingSessions = [] } = useQuery<SupportAccessSession[]>({
    queryKey: ['/api/support-access/pending']
  });

  const { data: sessionDetails, isLoading: isLoadingDetails } = useQuery<SessionWithEvents>({
    queryKey: ['/api/support-access/sessions', selectedSession?.id],
    enabled: !!selectedSession?.id && showDetailsDialog
  });

  const approveMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest('POST', `/api/support-access/sessions/${sessionId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/pending'] });
      toast({
        title: "Acceso aprobado",
        description: "El personal de soporte ahora tiene acceso a los datos de la empresa."
      });
      setShowApproveDialog(false);
      setSessionToAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el acceso",
        variant: "destructive"
      });
    }
  });

  const denyMutation = useMutation({
    mutationFn: async (data: { sessionId: string; denialReason: string }) => {
      return await apiRequest('POST', `/api/support-access/sessions/${data.sessionId}/deny`, { 
        denialReason: data.denialReason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/pending'] });
      toast({
        title: "Acceso denegado",
        description: "La solicitud de acceso ha sido rechazada."
      });
      setShowDenyDialog(false);
      setDenialReason("");
      setSessionToAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo denegar el acceso",
        variant: "destructive"
      });
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (data: { sessionId: string; revokedReason: string }) => {
      return await apiRequest('POST', `/api/support-access/sessions/${data.sessionId}/revoke`, { 
        revokedReason: data.revokedReason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/pending'] });
      toast({
        title: "Acceso revocado",
        description: "El acceso del personal de soporte ha sido revocado."
      });
      setShowRevokeDialog(false);
      setRevokedReason("");
      setSessionToAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo revocar el acceso",
        variant: "destructive"
      });
    }
  });

  const handleApprove = (session: SupportAccessSession) => {
    setSessionToAction(session);
    setShowApproveDialog(true);
  };

  const handleDeny = (session: SupportAccessSession) => {
    setSessionToAction(session);
    setShowDenyDialog(true);
  };

  const handleRevoke = (session: SupportAccessSession) => {
    setSessionToAction(session);
    setShowRevokeDialog(true);
  };

  const handleViewDetails = (session: SupportAccessSession) => {
    setSelectedSession(session as SessionWithEvents);
    setShowDetailsDialog(true);
  };

  const confirmApprove = () => {
    if (sessionToAction) {
      approveMutation.mutate(sessionToAction.id);
    }
  };

  const confirmDeny = () => {
    if (sessionToAction && denialReason.trim()) {
      denyMutation.mutate({
        sessionId: sessionToAction.id,
        denialReason: denialReason.trim()
      });
    }
  };

  const confirmRevoke = () => {
    if (sessionToAction && revokedReason.trim()) {
      revokeMutation.mutate({
        sessionId: sessionToAction.id,
        revokedReason: revokedReason.trim()
      });
    }
  };

  const isSessionActive = (session: SupportAccessSession) => {
    if (session.status !== 'approved') return false;
    if (!session.expiresAt) return false;
    return new Date(session.expiresAt) > new Date();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <ShieldCheck className="h-4 w-4" />;
      case 'denied':
        return <ShieldX className="h-4 w-4" />;
      case 'expired':
        return <Clock className="h-4 w-4" />;
      case 'revoked':
        return <Ban className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-accesos-soporte">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-accesos-soporte">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-6 w-6" />
            Accesos de Soporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestione las solicitudes de acceso del personal de soporte a los datos de su empresa
          </p>
        </div>
        
        <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh-sessions">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {pendingSessions.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" data-testid="card-pending-alert">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-700 dark:text-yellow-400" data-testid="text-pending-count">
                  {pendingSessions.length} Solicitud{pendingSessions.length !== 1 ? 'es' : ''} Pendiente{pendingSessions.length !== 1 ? 's' : ''} de Aprobación
                </p>
                <p className="text-sm text-yellow-600/80 dark:text-yellow-500/80">
                  El personal de soporte ha solicitado acceso a los datos de su empresa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card data-testid="card-stat-pending">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-xl font-bold text-yellow-600" data-testid="text-count-pending">
                  {sessions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-approved">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Aprobados</p>
                <p className="text-xl font-bold text-green-600" data-testid="text-count-approved">
                  {sessions.filter(s => s.status === 'approved').length}
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-denied">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Denegados</p>
                <p className="text-xl font-bold text-red-600" data-testid="text-count-denied">
                  {sessions.filter(s => s.status === 'denied').length}
                </p>
              </div>
              <ShieldX className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-expired">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Expirados</p>
                <p className="text-xl font-bold text-gray-600" data-testid="text-count-expired">
                  {sessions.filter(s => s.status === 'expired').length}
                </p>
              </div>
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-revoked">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Revocados</p>
                <p className="text-xl font-bold text-orange-600" data-testid="text-count-revoked">
                  {sessions.filter(s => s.status === 'revoked').length}
                </p>
              </div>
              <Ban className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Sesiones de Acceso</CardTitle>
          <CardDescription>
            {sessions.length} sesion{sessions.length !== 1 ? 'es' : ''} registrada{sessions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-sessions">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay solicitudes de acceso registradas
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Sesión</TableHead>
                    <TableHead>Personal de Soporte</TableHead>
                    <TableHead>Justificación</TableHead>
                    <TableHead>Alcance</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id} data-testid={`row-session-${session.id}`}>
                      <TableCell>
                        <span className="font-mono text-sm" data-testid={`text-session-number-${session.id}`}>
                          {session.sessionNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-support-name-${session.id}`}>
                            {session.supportUserName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p 
                          className="max-w-[200px] truncate" 
                          title={session.justification}
                          data-testid={`text-justification-${session.id}`}
                        >
                          {session.justification}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={scopeColors[session.scope]} data-testid={`badge-scope-${session.id}`}>
                          {scopeLabels[session.scope] || session.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[session.status]} data-testid={`badge-status-${session.id}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(session.status)}
                            {statusLabels[session.status] || session.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground" data-testid={`text-date-${session.id}`}>
                          {format(new Date(session.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(session)}
                            data-testid={`button-view-details-${session.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {session.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(session)}
                                data-testid={`button-approve-${session.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeny(session)}
                                data-testid={`button-deny-${session.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Denegar
                              </Button>
                            </>
                          )}
                          
                          {isSessionActive(session) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              onClick={() => handleRevoke(session)}
                              data-testid={`button-revoke-${session.id}`}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Revocar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detalles de la Sesión
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.sessionNumber}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessionDetails ? (
            <div className="space-y-6" data-testid="session-details-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Personal de Soporte</Label>
                  <p className="font-medium" data-testid="detail-support-name">{sessionDetails.supportUserName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Estado</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[sessionDetails.status]}>
                      {statusLabels[sessionDetails.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Alcance</Label>
                  <div className="mt-1">
                    <Badge className={scopeColors[sessionDetails.scope]}>
                      {scopeLabels[sessionDetails.scope]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Duración Solicitada</Label>
                  <p className="font-medium">{sessionDetails.requestedDurationMinutes} minutos</p>
                </div>
                {sessionDetails.relatedTicketNumber && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Ticket Relacionado</Label>
                    <p className="font-medium font-mono">{sessionDetails.relatedTicketNumber}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground text-xs">Fecha de Solicitud</Label>
                  <p className="font-medium">
                    {format(new Date(sessionDetails.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
                {sessionDetails.approvedAt && (
                  <>
                    <div>
                      <Label className="text-muted-foreground text-xs">Aprobado por</Label>
                      <p className="font-medium">{sessionDetails.approvedByName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Fecha de Aprobación</Label>
                      <p className="font-medium">
                        {format(new Date(sessionDetails.approvedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  </>
                )}
                {sessionDetails.expiresAt && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Expira</Label>
                    <p className="font-medium">
                      {format(new Date(sessionDetails.expiresAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-muted-foreground text-xs">Justificación</Label>
                <p className="mt-1 p-3 bg-muted rounded-md" data-testid="detail-justification">
                  {sessionDetails.justification}
                </p>
              </div>

              {sessionDetails.denialReason && (
                <div>
                  <Label className="text-muted-foreground text-xs text-red-600">Motivo de Denegación</Label>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-950/20 rounded-md text-red-700 dark:text-red-300">
                    {sessionDetails.denialReason}
                  </p>
                </div>
              )}

              {sessionDetails.revokedReason && (
                <div>
                  <Label className="text-muted-foreground text-xs text-orange-600">Motivo de Revocación</Label>
                  <p className="mt-1 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md text-orange-700 dark:text-orange-300">
                    {sessionDetails.revokedReason}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <History className="h-3 w-3" />
                  Historial de Eventos (Auditoría)
                </Label>
                <div className="mt-2 space-y-2">
                  {sessionDetails.events && sessionDetails.events.length > 0 ? (
                    <ScrollArea className="h-[200px] border rounded-md p-3">
                      {sessionDetails.events.map((event) => (
                        <div 
                          key={event.id} 
                          className="flex items-start gap-3 py-2 border-b last:border-0"
                          data-testid={`event-${event.id}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {eventTypeLabels[event.eventType] || event.eventType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Por {event.actorName} ({event.actorRole})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                            </p>
                            {event.details && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No hay eventos registrados
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-4">
                <p><strong>Base Legal:</strong> {sessionDetails.legalBasis || "No especificada"}</p>
                <p><strong>Propósito:</strong> {sessionDetails.dataProcessingPurpose || "No especificado"}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar acceso de soporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Está a punto de aprobar el acceso de <strong>{sessionToAction?.supportUserName}</strong> a los datos de su empresa.
              El acceso tendrá una duración de {sessionToAction?.requestedDurationMinutes} minutos 
              con alcance de <strong>{sessionToAction?.scope === 'read_only' ? 'solo lectura' : 'lectura y escritura'}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-approve">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aprobar Acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denegar Acceso</DialogTitle>
            <DialogDescription>
              Indique el motivo por el cual deniega la solicitud de acceso de {sessionToAction?.supportUserName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="denialReason">Motivo de Denegación *</Label>
              <Textarea
                id="denialReason"
                placeholder="Describa el motivo por el cual deniega esta solicitud..."
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                rows={4}
                data-testid="input-denial-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDenyDialog(false)}
              data-testid="button-cancel-deny"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeny}
              disabled={!denialReason.trim() || denyMutation.isPending}
              data-testid="button-confirm-deny"
            >
              {denyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Denegar Acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revocar Acceso</DialogTitle>
            <DialogDescription>
              Indique el motivo por el cual revoca el acceso de {sessionToAction?.supportUserName}.
              El acceso será terminado inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="revokedReason">Motivo de Revocación *</Label>
              <Textarea
                id="revokedReason"
                placeholder="Describa el motivo por el cual revoca este acceso..."
                value={revokedReason}
                onChange={(e) => setRevokedReason(e.target.value)}
                rows={4}
                data-testid="input-revoke-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRevokeDialog(false)}
              data-testid="button-cancel-revoke"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRevoke}
              disabled={!revokedReason.trim() || revokeMutation.isPending}
              data-testid="button-confirm-revoke"
            >
              {revokeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Revocar Acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
