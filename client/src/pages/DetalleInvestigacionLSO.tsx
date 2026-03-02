import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, User, Building2, Calendar, Clock, Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InvestigationDetail {
  id: string;
  companyId: string;
  companyName: string;
  companyNit: string;
  companyCity: string;
  companyRiskLevel: number;
  accidentId: string;
  eventType: string;
  eventDate: string;
  eventDescription: string;
  investigationStartDate: string;
  investigationEndDate: string | null;
  dueDate: string;
  slaStatus: string;
  daysRemaining: number | null;
  isSevere: number;
  isFatal: number;
  requiresLicensedProfessional: number;
  status: string;
  immediateActCauses: string | null;
  immediateConditionCauses: string | null;
  rootCause: string | null;
  correctiveActions: string | null;
  preventiveActions: string | null;
  conclusions: string | null;
  licensedProfessionalName: string | null;
  licensedProfessionalDocument: string | null;
  licensedProfessionalLicense: string | null;
  copasstParticipation: number;
  copasstMemberName: string | null;
  accident: {
    id: string;
    workerName?: string;
    description?: string;
    location?: string;
    date?: string;
    bodyPart?: string;
    injuryNature?: string;
  } | null;
  participants: Array<{
    id: string;
    participantName: string;
    participantRole: string;
    participantPosition: string;
  }>;
  findings: Array<{
    id: string;
    findingType: string;
    description: string;
    severity: string;
  }>;
  adminUserId: string | null;
  adminFullName: string | null;
}

export default function DetalleInvestigacionLSO() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showMessage, setShowMessage] = useState(false);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgPriority, setMsgPriority] = useState<"normal" | "urgent">("normal");

  const { data: investigation, isLoading, error } = useQuery<InvestigationDetail>({
    queryKey: ['/api/portal-licenciado/investigacion', id],
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; subject: string; content: string; priority: string }) => {
      return await apiRequest("POST", "/api/internal-messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      toast({ title: "Mensaje enviado", description: `Mensaje enviado al administrador de ${investigation?.companyName}` });
      setShowMessage(false);
      setMsgSubject("");
      setMsgContent("");
      setMsgPriority("normal");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "No se pudo enviar el mensaje", variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!investigation?.adminUserId || !msgSubject.trim() || !msgContent.trim()) return;
    sendMessageMutation.mutate({
      receiverId: investigation.adminUserId,
      subject: msgSubject.trim(),
      content: msgContent.trim(),
      priority: msgPriority,
    });
  };

  const goBackToVault = () => {
    const companyId = investigation?.companyId;
    if (companyId) {
      navigate(`/portal-licenciado?tab=documentos&companyId=${companyId}`);
    } else {
      navigate("/portal-licenciado?tab=documentos");
    }
  };

  const signMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/portal-licenciado/investigacion/${id}/firmar`);
    },
    onSuccess: () => {
      toast({
        title: "Investigación Firmada",
        description: "La investigación ha sido firmada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portal-licenciado'] });
      goBackToVault();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo firmar la investigación",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Error al cargar investigación</h3>
                <p className="text-sm text-muted-foreground">
                  {(error as any)?.message || "La investigación no fue encontrada o no tiene acceso."}
                </p>
              </div>
            </div>
            <Button className="mt-4" onClick={() => navigate("/portal-licenciado?tab=documentos")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Empresa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadySigned = !!investigation.licensedProfessionalName;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="sm" onClick={goBackToVault} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la Empresa
          </Button>
          {investigation.adminUserId && (
            <Button
              size="sm"
              variant="outline"
              data-testid="button-message-admin"
              onClick={() => {
                setShowMessage(true);
                setMsgSubject(`Investigación - ${investigation.accident?.workerName || 'Accidente'} (${format(new Date(investigation.eventDate), "dd/MM/yyyy")})`);
                setMsgContent("");
                setMsgPriority("normal");
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Mensaje
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Revisión de Investigación</h1>
            <p className="text-muted-foreground">Estándar 3.2.1 - Resolución 0312/2019, Resolución 1401/2007</p>
          </div>
        </div>

        {isAlreadySigned ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Firmada
          </Badge>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button data-testid="button-sign" disabled={signMutation.isPending}>
                {signMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Firmar Investigación
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Firma</AlertDialogTitle>
                <AlertDialogDescription>
                  Al firmar esta investigación, usted certifica que ha revisado el contenido
                  y que cumple con los requisitos de la Resolución 1401/2007 para investigaciones
                  de accidentes {investigation.isFatal ? "mortales" : "graves"}.
                  <br /><br />
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => signMutation.mutate()}>
                  Confirmar y Firmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {investigation.eventType}
                </CardTitle>
                <CardDescription>
                  Fecha del evento: {format(new Date(investigation.eventDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {investigation.isFatal === 1 && (
                  <Badge variant="destructive">Mortal</Badge>
                )}
                {investigation.isSevere === 1 && (
                  <Badge className="bg-orange-500">Grave</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Descripción del Evento</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">
                {investigation.eventDescription || "Sin descripción disponible"}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Causas Inmediatas (Actos)</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {investigation.immediateActCauses || "No especificadas"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Causas Inmediatas (Condiciones)</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {investigation.immediateConditionCauses || "No especificadas"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Causa Raíz</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {investigation.rootCause || "No especificada"}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Acciones Correctivas</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {investigation.correctiveActions || "No especificadas"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Acciones Preventivas</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {investigation.preventiveActions || "No especificadas"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Conclusiones</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {investigation.conclusions || "No especificadas"}
              </p>
            </div>

            {investigation.participants.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Participantes en la Investigación</h4>
                  <div className="space-y-2">
                    {investigation.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{p.participantName}</span>
                        <Badge variant="outline" className="text-xs">{p.participantRole}</Badge>
                        {p.participantPosition && (
                          <span className="text-muted-foreground">- {p.participantPosition}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{investigation.companyName}</p>
                <p className="text-sm text-muted-foreground">NIT: {investigation.companyNit}</p>
              </div>
              {investigation.companyCity && (
                <p className="text-sm text-muted-foreground">{investigation.companyCity}</p>
              )}
              <Badge variant="outline">Nivel de Riesgo: {investigation.companyRiskLevel || 'N/A'}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estado SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fecha Límite</span>
                <span className="font-medium">
                  {format(new Date(investigation.dueDate), "dd MMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge variant={
                  investigation.slaStatus === 'vencido' ? 'destructive' :
                  investigation.slaStatus === 'proximo_vencer' ? 'secondary' : 'outline'
                }>
                  {investigation.slaStatus === 'en_tiempo' ? 'En Tiempo' :
                   investigation.slaStatus === 'proximo_vencer' ? 'Próximo a Vencer' : 'Vencido'}
                </Badge>
              </div>
              {investigation.daysRemaining !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Días Restantes</span>
                  <span className={`font-medium ${investigation.daysRemaining <= 3 ? 'text-red-500' : ''}`}>
                    {investigation.daysRemaining} días
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas de Investigación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inicio</span>
                <span>{format(new Date(investigation.investigationStartDate), "dd MMM yyyy", { locale: es })}</span>
              </div>
              {investigation.investigationEndDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cierre</span>
                  <span>{format(new Date(investigation.investigationEndDate), "dd MMM yyyy", { locale: es })}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {isAlreadySigned && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Firma del Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nombre</span>
                  <span className="font-medium">{investigation.licensedProfessionalName}</span>
                </div>
                {investigation.licensedProfessionalLicense && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Licencia</span>
                    <span>{investigation.licensedProfessionalLicense}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {investigation.copasstParticipation === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Participación COPASST</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {investigation.copasstMemberName || "Miembro del COPASST participó en la investigación"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showMessage} onOpenChange={setShowMessage}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Mensaje a {investigation.companyName}
            </DialogTitle>
            <DialogDescription>
              Destinatario: {investigation.adminFullName || 'Administrador'} — Administrador ({investigation.companyName})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3 space-y-1.5">
                <Label>Asunto *</Label>
                <Input
                  placeholder="Escriba el asunto del mensaje..."
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  data-testid="input-inv-msg-subject"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={msgPriority} onValueChange={(v) => setMsgPriority(v as "normal" | "urgent")}>
                  <SelectTrigger data-testid="select-inv-msg-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mensaje *</Label>
              <Textarea
                placeholder="Escriba el contenido del mensaje..."
                rows={5}
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                data-testid="input-inv-msg-content"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowMessage(false)} data-testid="button-cancel-inv-msg">
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !msgSubject.trim() || !msgContent.trim()}
              data-testid="button-send-inv-msg"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Enviar Mensaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
