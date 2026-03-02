import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Award, 
  Building2, 
  FileCheck, 
  AlertTriangle, 
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
  Pencil,
  Car,
  ChevronDown,
  ChevronRight,
  Eye,
  BarChart3,
  MessageSquare,
  Send,
  Info,
  Truck,
  ArrowLeft,
  FolderOpen,
  Search,
  History
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import HelpVideoButton from "@/components/HelpVideoButton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardStats {
  totalAssignedCompanies: number;
  pendingDocuments: number;
  signedDocuments: number;
  licenseStatus: string;
  daysUntilExpiry: number | null;
  licenseExpiresAt: string | null;
}

interface AssignedCompany {
  id: string;
  name: string;
  nit: string;
  city: string | null;
  riskLevel: string;
  numberOfWorkers: number;
  numberOfVehicles: number | null;
  assignmentId: string;
  assignedAt: string;
  porcentajeSst: number | null;
  nivelCumplimiento: string | null;
  subscriptionBlocked: boolean;
  lastActivity: string | null;
  adminUserId: string | null;
  adminFullName: string | null;
}

interface PendingDocument {
  id: string;
  companyId: string;
  companyName: string;
  companyNit: string;
  accidentId: string;
  eventType: string;
  eventDate: string;
  eventDescription: string;
  dueDate: string;
  slaStatus: string;
  daysRemaining: number | null;
  isSevere: number;
  isFatal: number;
  status: string;
  createdAt: string;
}

interface AllDocuments {
  investigaciones: Array<{
    id: string;
    companyId: string;
    companyName: string;
    companyNit: string;
    eventType: string;
    eventDate: string;
    eventDescription: string;
    status: string;
    isSevere: number;
    isFatal: number;
    createdAt: string;
    licensedProfessionalName: string | null;
    licensedProfessionalSignatureUrl: string | null;
  }>;
  evaluaciones: Array<{
    id: string;
    companyId: string;
    companyName: string;
    companyNit: string;
    anio: number;
    mes: number;
    estado: string;
    porcentajeCumplimiento: number;
    nivelCumplimiento: string | null;
    fechaEvaluacion: string;
    responsableNombre: string;
    lsoSignatureName: string | null;
    lsoSignatureUrl: string | null;
    lsoSignedAt: string | null;
    createdAt: string;
  }>;
  planesTrabajoAnual: Array<{
    id: string;
    companyId: string;
    companyName: string;
    companyNit: string;
    anio: number;
    estado: string;
    fechaElaboracion: string;
    responsableElaboracion: string;
    porcentajeCumplimiento: number;
    lsoSignatureName: string | null;
    lsoSignatureUrl: string | null;
    lsoSignedAt: string | null;
    createdAt: string;
  }>;
  matricesIperc: Array<{
    id: string;
    companyId: string;
    companyName: string;
    companyNit: string;
    nombre: string;
    area: string;
    estado: string;
    fechaEvaluacion: string;
    metodologia: string;
    version: number;
    lsoSignatureName: string | null;
    lsoSignatureUrl: string | null;
    lsoSignedAt: string | null;
    createdAt: string;
  }>;
}

const SST_PROFESSION_LABELS: Record<string, string> = {
  medico_ocupacional: "Médico Ocupacional",
  profesional_sst: "Profesional SST",
  tecnologo_sst: "Tecnólogo SST",
  tecnico_sst: "Técnico SST",
  fisioterapeuta: "Fisioterapeuta",
  psicologo_sst: "Psicólogo SST",
  fonoaudiologo: "Fonoaudiólogo",
  ingeniero_sst: "Ingeniero SST",
  enfermero_sst: "Enfermero SST",
  otro: "Otro",
};

export default function PortalLicenciado() {
  const { user } = useAuth();
  const validTabs = ["dashboard", "empresas", "documentos", "pesv", "licencia"];
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && validTabs.includes(tab) ? tab : "dashboard";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab && validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    };
    window.addEventListener("lso-tab-change", handler);
    return () => window.removeEventListener("lso-tab-change", handler);
  }, []);

  if (user?.role !== 'lso') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Acceso Restringido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Este portal es exclusivo para profesionales licenciados en SST (rol LSO).
              Si cree que debería tener acceso, contacte al administrador del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Portal del Profesional Licenciado
          </h1>
          <p className="text-muted-foreground">
            Gestione sus empresas asignadas y documentos que requieren su firma profesional
          </p>
        </div>
        <HelpVideoButton customRoute="/portal-licenciado" testId="button-help-video-lso" />
      </div>

      <div data-testid="portal-lso-content">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "empresas" && <EmpresasTab />}
        {activeTab === "documentos" && <DocumentosTab />}
        {activeTab === "pesv" && <PesvAuditoriaTab />}
        {activeTab === "licencia" && <LicenciaTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const { user } = useAuth();
  
  const { data: stats, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ["/api/portal-licenciado/dashboard"],
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar datos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar las estadísticas del dashboard. 
          {error instanceof Error ? ` ${error.message}` : ''} 
          Por favor intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const showLicenseWarning = stats?.licenseStatus === 'por_vencer' || stats?.licenseStatus === 'vencida';

  return (
    <div className="space-y-6">
      {showLicenseWarning && (
        <Alert variant={stats?.licenseStatus === 'vencida' ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {stats?.licenseStatus === 'vencida' ? 'Licencia Vencida' : 'Licencia por Vencer'}
          </AlertTitle>
          <AlertDescription>
            {stats?.licenseStatus === 'vencida' 
              ? 'Su licencia SST ha vencido. Debe renovarla para poder firmar documentos.'
              : `Su licencia SST vence en ${stats?.daysUntilExpiry} días. Recuerde renovarla a tiempo.`
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Empresas Asignadas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-companies">
              {stats?.totalAssignedCompanies ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Empresas bajo su gestión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-docs">
              {stats?.pendingDocuments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren su firma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Documentos Firmados</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-signed-docs">
              {stats?.signedDocuments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Estado Licencia</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <LicenseStatusBadge status={stats?.licenseStatus ?? 'sin_licencia'} />
            </div>
            {stats?.daysUntilExpiry !== null && stats?.daysUntilExpiry > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Vence en {stats.daysUntilExpiry} días
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido, {user?.fullName || user?.username}</CardTitle>
          <CardDescription>
            Desde este portal puede gestionar los documentos SST que requieren su firma profesional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <FileCheck className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium">Investigaciones de Accidentes</h4>
                <p className="text-sm text-muted-foreground">
                  Las investigaciones de accidentes graves o mortales requieren la firma 
                  de un profesional con licencia en SST según la Resolución 1401 de 2007.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium">Su Licencia SST</h4>
                <p className="text-sm text-muted-foreground">
                  Mantenga su licencia SST vigente para poder firmar documentos. 
                  Puede actualizar sus datos en la sección "Mi Licencia".
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SstProgressBar({ porcentaje, nivel }: { porcentaje: number | null; nivel: string | null }) {
  if (porcentaje === null) {
    return <span className="text-xs text-muted-foreground">Sin evaluar</span>;
  }

  let colorClass = "bg-destructive";
  if (porcentaje >= 86) colorClass = "bg-green-500";
  else if (porcentaje >= 60) colorClass = "bg-yellow-500";

  return (
    <div className="space-y-1 min-w-[120px]" data-testid="sst-progress-bar">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{porcentaje}%</span>
        {nivel && <span className="text-xs text-muted-foreground capitalize">{nivel}</span>}
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface HistorialEmpresa {
  id: string;
  name: string;
  nit: string;
  city: string | null;
  riskLevel: string;
  assignmentId: string;
  assignedAt: string;
  unassignedAt: string | null;
}

function EmpresasTab() {
  const { toast } = useToast();
  const { data: empresas = [], isLoading, isError, error } = useQuery<AssignedCompany[]>({
    queryKey: ["/api/portal-licenciado/empresas"],
  });

  const { data: historial = [] } = useQuery<HistorialEmpresa[]>({
    queryKey: ["/api/portal-licenciado/empresas-historial"],
  });

  const [showHistorial, setShowHistorial] = useState(false);
  const [messageTarget, setMessageTarget] = useState<AssignedCompany | null>(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgPriority, setMsgPriority] = useState<"normal" | "urgent">("normal");

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; subject: string; content: string; priority: string }) => {
      return await apiRequest("POST", "/api/internal-messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      toast({ title: "Mensaje enviado", description: `Mensaje enviado al administrador de ${messageTarget?.name}` });
      setMessageTarget(null);
      setMsgSubject("");
      setMsgContent("");
      setMsgPriority("normal");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "No se pudo enviar el mensaje", variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!messageTarget?.adminUserId || !msgSubject.trim() || !msgContent.trim()) return;
    sendMessageMutation.mutate({
      receiverId: messageTarget.adminUserId,
      subject: msgSubject.trim(),
      content: msgContent.trim(),
      priority: msgPriority,
    });
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar empresas</AlertTitle>
        <AlertDescription>
          No se pudieron cargar las empresas asignadas. 
          {error instanceof Error ? ` ${error.message}` : ''} 
          Por favor intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (empresas.length === 0 && historial.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Sin empresas asignadas</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Actualmente no tiene empresas asignadas. El administrador del sistema 
            debe asignarle las empresas que requieran sus servicios profesionales.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatLastActivity = (dateStr: string | null) => {
    if (!dateStr) return "Sin registros";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "Ayer";
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
      return format(date, "dd MMM yyyy", { locale: es });
    } catch {
      return "Sin registros";
    }
  };

  return (
    <div className="space-y-6">
      {empresas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Empresas Asignadas</CardTitle>
            <CardDescription>
              Empresas donde está habilitado para firmar documentos SST
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Trabajadores</TableHead>
                    <TableHead>Vehículos</TableHead>
                    <TableHead>Avance SG-SST</TableHead>
                    <TableHead>Última Actividad</TableHead>
                    <TableHead>Asignación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id} data-testid={`row-empresa-${empresa.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{empresa.name}</span>
                          {empresa.subscriptionBlocked && (
                            <Badge variant="secondary" className="text-xs gap-1" data-testid={`badge-blocked-${empresa.id}`}>
                              <Info className="h-3 w-3" />
                              Acceso suspendido
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{empresa.nit}</TableCell>
                      <TableCell>{empresa.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Nivel {empresa.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {empresa.numberOfWorkers}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          {empresa.numberOfVehicles ?? 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SstProgressBar porcentaje={empresa.porcentajeSst} nivel={empresa.nivelCumplimiento} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{formatLastActivity(empresa.lastActivity)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(empresa.assignedAt), "dd MMM yyyy", { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-message-${empresa.id}`}
                          onClick={() => {
                            if (!empresa.adminUserId) {
                              toast({ title: "Sin destinatario", description: "Esta empresa no tiene un administrador registrado para enviar mensajes.", variant: "destructive" });
                              return;
                            }
                            setMessageTarget(empresa);
                            setMsgSubject("");
                            setMsgContent("");
                            setMsgPriority("normal");
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Mensaje
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!messageTarget} onOpenChange={(open) => { if (!open) setMessageTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Mensaje a {messageTarget?.name}
            </DialogTitle>
            <DialogDescription>
              Destinatario: {messageTarget?.adminFullName || 'Administrador'} — Administrador ({messageTarget?.name})
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
                  data-testid="input-msg-subject"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={msgPriority} onValueChange={(v) => setMsgPriority(v as "normal" | "urgent")}>
                  <SelectTrigger data-testid="select-msg-priority">
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
                data-testid="input-msg-content"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setMessageTarget(null)} data-testid="button-cancel-msg">
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !msgSubject.trim() || !msgContent.trim()}
              data-testid="button-send-msg"
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

      {empresas.length === 0 && historial.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin empresas activas</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Actualmente no tiene empresas asignadas. Consulte el historial a continuación.
            </p>
          </CardContent>
        </Card>
      )}

      {historial.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowHistorial(!showHistorial)} data-testid="button-toggle-historial">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Historial de Empresas</CardTitle>
                  <CardDescription>
                    Empresas donde prestó sus servicios anteriormente ({historial.length})
                  </CardDescription>
                </div>
              </div>
              {showHistorial ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {showHistorial && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>NIT</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Riesgo</TableHead>
                      <TableHead>Fecha Asignación</TableHead>
                      <TableHead>Fecha Finalización</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historial.map((empresa) => (
                      <TableRow key={empresa.assignmentId} className="text-muted-foreground" data-testid={`row-historial-${empresa.assignmentId}`}>
                        <TableCell>
                          <span className="font-medium">{empresa.name}</span>
                        </TableCell>
                        <TableCell>{empresa.nit}</TableCell>
                        <TableCell>{empresa.city || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Nivel {empresa.riskLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(empresa.assignedAt), "dd MMM yyyy", { locale: es })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {empresa.unassignedAt 
                              ? format(new Date(empresa.unassignedAt), "dd MMM yyyy", { locale: es })
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" data-testid={`badge-finalizada-${empresa.assignmentId}`}>
                            Finalizada
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

interface CompanyVault {
  companyId: string;
  companyName: string;
  companyNit: string;
  totalDocs: number;
  pendingDocs: number;
  signedDocs: number;
  investigaciones: AllDocuments['investigaciones'];
  evaluaciones: AllDocuments['evaluaciones'];
  planesTrabajoAnual: AllDocuments['planesTrabajoAnual'];
  matricesIperc: AllDocuments['matricesIperc'];
}

function buildCompanyVaults(docs: AllDocuments): CompanyVault[] {
  const vaultMap = new Map<string, CompanyVault>();

  const getOrCreate = (companyId: string, companyName: string, companyNit: string): CompanyVault => {
    if (!vaultMap.has(companyId)) {
      vaultMap.set(companyId, {
        companyId, companyName, companyNit,
        totalDocs: 0, pendingDocs: 0, signedDocs: 0,
        investigaciones: [], evaluaciones: [], planesTrabajoAnual: [], matricesIperc: [],
      });
    }
    return vaultMap.get(companyId)!;
  };

  for (const inv of docs.investigaciones) {
    const v = getOrCreate(inv.companyId, inv.companyName, inv.companyNit);
    v.investigaciones.push(inv);
    v.totalDocs++;
    if (inv.licensedProfessionalName) v.signedDocs++; else v.pendingDocs++;
  }
  for (const ev of docs.evaluaciones) {
    const v = getOrCreate(ev.companyId, ev.companyName, ev.companyNit);
    v.evaluaciones.push(ev);
    v.totalDocs++;
    if (ev.lsoSignatureName) v.signedDocs++; else v.pendingDocs++;
  }
  for (const plan of docs.planesTrabajoAnual) {
    const v = getOrCreate(plan.companyId, plan.companyName, plan.companyNit);
    v.planesTrabajoAnual.push(plan);
    v.totalDocs++;
    if (plan.lsoSignatureName) v.signedDocs++; else v.pendingDocs++;
  }
  for (const mat of docs.matricesIperc) {
    const v = getOrCreate(mat.companyId, mat.companyName, mat.companyNit);
    v.matricesIperc.push(mat);
    v.totalDocs++;
    if (mat.lsoSignatureName) v.signedDocs++; else v.pendingDocs++;
  }

  return Array.from(vaultMap.values()).sort((a, b) => b.pendingDocs - a.pendingDocs);
}

function PHVADashboardPanel({ companyId }: { companyId: string }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, isError } = useQuery<{
    company: { id: string; name: string; nit: string; numberOfWorkers: number; riskLevel: string };
    year: number;
    hacer: {
      totalInspecciones: number;
      peligrosIdentificados: number;
      controlState: { conforme: number; noConforme: number; observacion: number };
      porcentajeConformidad: number;
    };
    verificar: {
      objetivos: { total: number; activos: number; cumplidos: number; porcentajeCumplimiento: number; promedioAvance: number };
      indicadores: { total: number; estructura: number; proceso: number; resultado: number };
      auditorias: { totalAnio: number; completadas: number; porcentajeConformidad: number; hallazgosPorSeveridad: { baja: number; media: number; alta: number; critica: number } };
      cumplimientoNormativo: { ultimaEvaluacion: number | null; estandaresCriticos: number; estandaresCumplidos: number };
      accidentalidad: { totalAccidentes: number; accidentesUltimoMes: number };
    };
    actuar: {
      accionesMejora: { total: number; completadas: number; enProceso: number; pendientes: number; vencidas: number; porcentajeCompletitud: number; eficacia: { porcentajeEficacia: number } };
      planTrabajo: { porcentajeCumplimiento: number; actividadesCompletadas: number; totalActividades: number };
      consolidado: { totalAcciones: number; tasaCompletitud: number; tasaEficacia: number; accionesVencidasTotal: number };
    };
  }>({
    queryKey: [`/api/portal-licenciado/empresa/${companyId}/dashboard-phva?year=${year}`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No se pudo cargar el panel PHVA</AlertTitle>
            <AlertDescription>Intente nuevamente más tarde.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { hacer, verificar, actuar } = data;
  const cumplimiento = verificar.cumplimientoNormativo.ultimaEvaluacion;
  const cumplimientoColor = cumplimiento !== null
    ? cumplimiento >= 86 ? "text-green-600" : cumplimiento >= 60 ? "text-amber-600" : "text-red-600"
    : "text-muted-foreground";

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <Card data-testid="card-phva-dashboard">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Panel de Control PHVA
          </CardTitle>
          <CardDescription>Ciclo Planear-Hacer-Verificar-Actuar</CardDescription>
        </div>
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-24" data-testid="select-phva-year">
            <Calendar className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {actuar.consolidado.accionesVencidasTotal > 0 && (
          <Alert variant="destructive" data-testid="alert-acciones-vencidas">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acciones Vencidas Requieren Atención</AlertTitle>
            <AlertDescription>
              Hay {actuar.consolidado.accionesVencidasTotal} acciones con fecha de compromiso vencida.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-md border p-3 space-y-1" data-testid="metric-cumplimiento-sst">
            <p className="text-xs text-muted-foreground">Cumplimiento SG-SST</p>
            <p className={`text-2xl font-bold ${cumplimientoColor}`}>
              {cumplimiento !== null ? `${cumplimiento}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Res. 0312/2019</p>
          </div>

          <div className="rounded-md border p-3 space-y-1" data-testid="metric-acciones">
            <p className="text-xs text-muted-foreground">Total Acciones</p>
            <p className="text-2xl font-bold">{actuar.accionesMejora.total}</p>
            <p className="text-xs text-muted-foreground">
              Completitud: {actuar.accionesMejora.porcentajeCompletitud}%
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1" data-testid="metric-eficacia">
            <p className="text-xs text-muted-foreground">Tasa Eficacia</p>
            <p className="text-2xl font-bold">{actuar.consolidado.tasaEficacia}%</p>
            <p className="text-xs text-muted-foreground">Acciones verificadas</p>
          </div>

          <div className="rounded-md border p-3 space-y-1" data-testid="metric-plan-trabajo">
            <p className="text-xs text-muted-foreground">Plan Trabajo Anual</p>
            <p className="text-2xl font-bold">{actuar.planTrabajo.porcentajeCumplimiento}%</p>
            <p className="text-xs text-muted-foreground">
              {actuar.planTrabajo.actividadesCompletadas} de {actuar.planTrabajo.totalActividades} actividades
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border p-3 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-3 w-3 text-muted-foreground" />
              Hacer
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Inspecciones</span>
                <span className="font-medium">{hacer.totalInspecciones}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Peligros</span>
                <span className="font-medium">{hacer.peligrosIdentificados}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Conformidad</span>
                <span className="font-medium">{hacer.porcentajeConformidad}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-3 w-3 text-muted-foreground" />
              Verificar
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Objetivos</span>
                <span className="font-medium">{verificar.objetivos.cumplidos}/{verificar.objetivos.total}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Indicadores</span>
                <span className="font-medium">{verificar.indicadores.total}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Accidentes</span>
                <span className="font-medium">{verificar.accidentalidad.totalAccidentes}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-3 w-3 text-muted-foreground" />
              Actuar
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Completadas</span>
                <span className="font-medium">{actuar.accionesMejora.completadas}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">En proceso</span>
                <span className="font-medium">{actuar.accionesMejora.enProceso}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Vencidas</span>
                <span className={`font-medium ${actuar.accionesMejora.vencidas > 0 ? 'text-red-600' : ''}`}>
                  {actuar.accionesMejora.vencidas}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyVaultDetail({ vault, onBack, isSigning, signingId, onSign }: {
  vault: CompanyVault;
  onBack: () => void;
  isSigning: boolean;
  signingId: string | null;
  onSign: (type: string, id: string, name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="border-l-0 border-r-0 border-t-0 rounded-none bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button className="bg-primary text-primary-foreground border-primary" onClick={onBack} data-testid="button-back-to-vaults">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Todas las Empresas
            </Button>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-background border shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base leading-tight truncate" data-testid="text-vault-company-name">{vault.companyName}</h3>
                <p className="text-xs text-muted-foreground">NIT: {vault.companyNit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{vault.totalDocs} documentos</Badge>
              {vault.pendingDocs > 0 && <Badge variant="destructive">{vault.pendingDocs} pendientes</Badge>}
              {vault.signedDocs > 0 && <Badge className="bg-green-600 text-white">{vault.signedDocs} firmados</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <PHVADashboardPanel companyId={vault.companyId} />

      {vault.investigaciones.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Investigaciones de Accidentes</CardTitle>
              <CardDescription>Res. 1401/2007 - Accidentes graves/mortales</CardDescription>
            </div>
            <Badge variant="outline">{vault.investigaciones.length}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Firma LSO</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vault.investigaciones.map((inv) => (
                  <TableRow key={inv.id} data-testid={`row-inv-${inv.id}`}>
                    <TableCell>
                      <Badge variant="outline">{inv.eventType || 'Investigación'}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(inv.eventDate), "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell>
                      {inv.isFatal === 1 ? (
                        <Badge variant="destructive">Mortal</Badge>
                      ) : inv.isSevere === 1 ? (
                        <Badge className="bg-orange-500 text-white">Grave</Badge>
                      ) : (
                        <Badge variant="secondary">Leve</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {inv.licensedProfessionalName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Firmada
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/portal-licenciado/investigacion/${inv.id}`}>
                        <Button size="sm" data-testid={`button-review-inv-${inv.id}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {inv.licensedProfessionalName ? 'Ver' : 'Revisar'}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {vault.evaluaciones.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Evaluaciones de Estándares Mínimos</CardTitle>
              <CardDescription>Resolución 0312/2019 - Evaluación SG-SST</CardDescription>
            </div>
            <Badge variant="outline">{vault.evaluaciones.length}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Firma LSO</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vault.evaluaciones.map((ev) => (
                  <TableRow key={ev.id} data-testid={`row-eval-${ev.id}`}>
                    <TableCell>{ev.anio} - Mes {ev.mes}</TableCell>
                    <TableCell>
                      <Badge variant={ev.porcentajeCumplimiento >= 86 ? "default" : ev.porcentajeCumplimiento >= 60 ? "secondary" : "destructive"}>
                        {ev.porcentajeCumplimiento}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ev.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      {ev.lsoSignatureName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Firmada
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {ev.lsoSignatureName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {ev.lsoSignatureName}
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          data-testid={`button-sign-eval-${ev.id}`}
                          onClick={() => onSign('evaluacion', ev.id, `Evaluación ${ev.anio} - ${vault.companyName}`)}
                          disabled={isSigning}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          Firmar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {vault.planesTrabajoAnual.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Planes de Trabajo Anual</CardTitle>
              <CardDescription>Decreto 1072/2015 - Plan Anual SG-SST</CardDescription>
            </div>
            <Badge variant="outline">{vault.planesTrabajoAnual.length}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Año</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Firma LSO</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vault.planesTrabajoAnual.map((plan) => (
                  <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                    <TableCell>{plan.anio}</TableCell>
                    <TableCell>
                      <Badge variant={plan.porcentajeCumplimiento >= 80 ? "default" : "secondary"}>
                        {plan.porcentajeCumplimiento}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      {plan.lsoSignatureName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Firmado
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.lsoSignatureName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {plan.lsoSignatureName}
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          data-testid={`button-sign-plan-${plan.id}`}
                          onClick={() => onSign('plan', plan.id, `Plan Trabajo ${plan.anio} - ${vault.companyName}`)}
                          disabled={isSigning}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          Firmar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {vault.matricesIperc.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Matrices de Peligros (IPERC)</CardTitle>
              <CardDescription>GTC-45 / ISO 45001:2018 - Identificación de Peligros</CardDescription>
            </div>
            <Badge variant="outline">{vault.matricesIperc.length}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Firma LSO</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vault.matricesIperc.map((mat) => (
                  <TableRow key={mat.id} data-testid={`row-mat-${mat.id}`}>
                    <TableCell>
                      <div className="text-sm">{mat.nombre}</div>
                      <div className="text-xs text-muted-foreground">v{mat.version} - {mat.metodologia}</div>
                    </TableCell>
                    <TableCell>{mat.area}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{mat.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      {mat.lsoSignatureName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Firmada
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {mat.lsoSignatureName ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {mat.lsoSignatureName}
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          data-testid={`button-sign-mat-${mat.id}`}
                          onClick={() => onSign('matriz', mat.id, `${mat.nombre} - ${vault.companyName}`)}
                          disabled={isSigning}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          Firmar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentosTab() {
  const { toast } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("companyId") || null;
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allDocs, isLoading, isError, error } = useQuery<AllDocuments>({
    queryKey: ["/api/portal-licenciado/documentos-todos"],
  });

  const signEvaluacionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/portal-licenciado/evaluacion-sst/${id}/firmar`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Evaluación firmada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/portal-licenciado/documentos-todos"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error al firmar", description: err.message, variant: "destructive" });
    },
  });

  const signPlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/portal-licenciado/plan-trabajo/${id}/firmar`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Plan de trabajo firmado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/portal-licenciado/documentos-todos"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error al firmar", description: err.message, variant: "destructive" });
    },
  });

  const signMatrizMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/portal-licenciado/matriz-iperc/${id}/firmar`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Matriz IPERC firmada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/portal-licenciado/documentos-todos"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error al firmar", description: err.message, variant: "destructive" });
    },
  });

  const [confirmSign, setConfirmSign] = useState<{ type: string; id: string; name: string } | null>(null);

  const handleConfirmSign = () => {
    if (!confirmSign) return;
    if (confirmSign.type === 'evaluacion') signEvaluacionMutation.mutate(confirmSign.id);
    else if (confirmSign.type === 'plan') signPlanMutation.mutate(confirmSign.id);
    else if (confirmSign.type === 'matriz') signMatrizMutation.mutate(confirmSign.id);
    setConfirmSign(null);
  };

  const isSigning = signEvaluacionMutation.isPending || signPlanMutation.isPending || signMatrizMutation.isPending;
  const signingId = confirmSign?.id || null;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar documentos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los documentos. 
          {error instanceof Error ? ` ${error.message}` : ''} 
          Por favor intente de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const docs = allDocs || { investigaciones: [], evaluaciones: [], planesTrabajoAnual: [], matricesIperc: [] };
  const vaults = buildCompanyVaults(docs);
  const totalDocs = vaults.reduce((s, v) => s + v.totalDocs, 0);
  const totalPending = vaults.reduce((s, v) => s + v.pendingDocs, 0);

  if (totalDocs === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Sin documentos</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No hay documentos registrados en las empresas asignadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedVault = vaults.find(v => v.companyId === selectedCompanyId);

  if (selectedVault) {
    return (
      <>
        <CompanyVaultDetail
          vault={selectedVault}
          onBack={() => { setSelectedCompanyId(null); setConfirmSign(null); }}
          isSigning={isSigning}
          onSign={(type, id, name) => setConfirmSign({ type, id, name })}
        />
        <Dialog open={!!confirmSign} onOpenChange={(open) => { if (!open) setConfirmSign(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Firma Digital</DialogTitle>
              <DialogDescription>
                Está a punto de firmar digitalmente el siguiente documento:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium text-sm">{confirmSign?.name}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Al firmar, su nombre, número de licencia profesional e imagen de firma 
                quedarán registrados permanentemente en el documento. Esta acción no se puede deshacer.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmSign(null)} data-testid="button-cancel-sign">
                Cancelar
              </Button>
              <Button onClick={handleConfirmSign} disabled={isSigning} data-testid="button-confirm-sign">
                {isSigning && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Confirmar Firma
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const filteredVaults = searchTerm
    ? vaults.filter(v => 
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyNit.includes(searchTerm)
      )
    : vaults;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">{vaults.length} empresas</Badge>
        <Badge variant="outline">{totalDocs} documentos</Badge>
        {totalPending > 0 && (
          <Badge variant="destructive">{totalPending} pendientes de firma</Badge>
        )}
        {totalDocs - totalPending > 0 && (
          <Badge className="bg-green-600 text-white">{totalDocs - totalPending} firmados</Badge>
        )}
      </div>

      {vaults.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa por nombre o NIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-vaults"
          />
        </div>
      )}

      <div className="grid gap-3">
        {filteredVaults.map((vault) => (
          <Card 
            key={vault.companyId} 
            className="cursor-pointer hover-elevate transition-colors"
            onClick={() => setSelectedCompanyId(vault.companyId)}
            data-testid={`card-vault-${vault.companyId}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-muted shrink-0">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate" data-testid={`text-vault-name-${vault.companyId}`}>
                    {vault.companyName}
                  </h4>
                  <p className="text-xs text-muted-foreground">NIT: {vault.companyNit}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {vault.pendingDocs > 0 && (
                    <Badge variant="destructive">
                      {vault.pendingDocs} pendiente{vault.pendingDocs !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {vault.signedDocs > 0 && (
                    <Badge className="bg-green-600 text-white">
                      {vault.signedDocs} firmado{vault.signedDocs !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {vault.totalDocs}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 ml-14 flex-wrap">
                {vault.investigaciones.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {vault.investigaciones.length} investigación{vault.investigaciones.length !== 1 ? 'es' : ''}
                  </span>
                )}
                {vault.evaluaciones.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {vault.evaluaciones.length} evaluación{vault.evaluaciones.length !== 1 ? 'es' : ''}
                  </span>
                )}
                {vault.planesTrabajoAnual.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {vault.planesTrabajoAnual.length} plan{vault.planesTrabajoAnual.length !== 1 ? 'es' : ''}
                  </span>
                )}
                {vault.matricesIperc.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {vault.matricesIperc.length} matriz{vault.matricesIperc.length !== 1 ? 'ces' : ''}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVaults.length === 0 && searchTerm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Search className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No se encontraron empresas para "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PesvEvaluacion {
  id: string;
  companyId: string;
  companyName: string;
  companyNit: string;
  anio: number;
  nivel: string;
  estado: string;
  puntajePlanear: number | null;
  puntajeHacer: number | null;
  puntajeVerificar: number | null;
  puntajeActuar: number | null;
  puntajeTotal: number | null;
  puntajeMaximo: number | null;
  porcentajeCumplimiento: number | null;
  numeroVehiculos: number | null;
  numeroConductores: number | null;
  responsableNombre: string | null;
  responsableCargo: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface RespuestaPesv {
  id: string;
  evaluacionId: string;
  pasoId: string;
  cumple: number | null;
  noAplica: number | null;
  justificacionNa: string | null;
  modoVerificacion: string | null;
  evidencias: string | null;
  observaciones: string | null;
  hallazgo: string | null;
  createdAt: string;
  updatedAt: string | null;
}

const PESV_NIVEL_LABELS: Record<string, string> = {
  basico: "Basico",
  estandar: "Estandar",
  avanzado: "Avanzado",
};

const PESV_ESTADO_LABELS: Record<string, string> = {
  "en-progreso": "En Progreso",
  en_progreso: "En Progreso",
  completada: "Completada",
  cerrada: "Cerrada",
};

const PESV_FASES = [
  { key: "planear", label: "Planear", color: "bg-blue-500" },
  { key: "hacer", label: "Hacer", color: "bg-green-500" },
  { key: "verificar", label: "Verificar", color: "bg-amber-500" },
  { key: "actuar", label: "Actuar", color: "bg-purple-500" },
];

const PESV_PASOS_NAMES: Record<string, { nombre: string; fase: string }> = {
  P01: { nombre: "Conformacion del equipo de trabajo", fase: "planear" },
  P02: { nombre: "Politica de seguridad vial", fase: "planear" },
  P03: { nombre: "Diagnostico / Caracterizacion", fase: "planear" },
  P04: { nombre: "Clasificacion del riesgo", fase: "planear" },
  P05: { nombre: "Objetivos y metas", fase: "planear" },
  P06: { nombre: "Plan anual de trabajo", fase: "planear" },
  P07: { nombre: "Indicadores de gestion", fase: "planear" },
  P08: { nombre: "Presupuesto", fase: "planear" },
  H01: { nombre: "Competencia de conductores", fase: "hacer" },
  H02: { nombre: "Infraestructura segura", fase: "hacer" },
  H03: { nombre: "Vehiculos seguros", fase: "hacer" },
  H04: { nombre: "Atencion a victimas", fase: "hacer" },
  H05: { nombre: "Comportamientos seguros", fase: "hacer" },
  H06: { nombre: "Velocidad segura", fase: "hacer" },
  H07: { nombre: "Rutas seguras y desplazamientos", fase: "hacer" },
  H08: { nombre: "Registro y analisis de siniestros", fase: "hacer" },
  H09: { nombre: "Investigacion de siniestros", fase: "hacer" },
  H10: { nombre: "Capacitacion y sensibilizacion", fase: "hacer" },
  H11: { nombre: "Planes de accion de riesgos viales", fase: "hacer" },
  V01: { nombre: "Seguimiento y medicion", fase: "verificar" },
  V02: { nombre: "Auditorias internas", fase: "verificar" },
  V03: { nombre: "Revision por la alta direccion", fase: "verificar" },
  A01: { nombre: "Mejora continua", fase: "actuar" },
  A02: { nombre: "Acciones correctivas y preventivas", fase: "actuar" },
};

function PesvAuditoriaTab() {
  const [expandedEval, setExpandedEval] = useState<string | null>(null);

  const { data: evaluaciones, isLoading } = useQuery<PesvEvaluacion[]>({
    queryKey: ["/api/portal-licenciado/pesv/evaluaciones"],
  });

  const { data: respuestas, isLoading: loadingRespuestas } = useQuery<RespuestaPesv[]>({
    queryKey: ["/api/portal-licenciado/pesv/evaluaciones", expandedEval, "respuestas"],
    enabled: !!expandedEval,
    queryFn: async () => {
      const res = await fetch(`/api/portal-licenciado/pesv/evaluaciones/${expandedEval}/respuestas`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener respuestas");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!evaluaciones || evaluaciones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No hay evaluaciones PESV disponibles para sus empresas asignadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpand = (evalId: string) => {
    setExpandedEval(prev => prev === evalId ? null : evalId);
  };

  const getCumpleBadge = (cumple: number | null, noAplica: number | null) => {
    if (noAplica === 1) return <Badge variant="secondary">N/A</Badge>;
    if (cumple === null) return <Badge variant="outline">Sin evaluar</Badge>;
    if (cumple === 1) return <Badge className="bg-green-600 text-white">Cumple</Badge>;
    return <Badge variant="destructive">No Cumple</Badge>;
  };

  const getProgressColor = (pct: number | null) => {
    if (pct === null) return "bg-muted";
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Evaluaciones PESV - Empresas Asignadas</h2>
        <Badge variant="secondary">{evaluaciones.length}</Badge>
      </div>

      {evaluaciones.map((ev) => {
        const isExpanded = expandedEval === ev.id;
        const pct = ev.porcentajeCumplimiento ?? 0;

        return (
          <Card key={ev.id} data-testid={`card-pesv-eval-${ev.id}`}>
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between gap-4 pb-3"
              onClick={() => toggleExpand(ev.id)}
              data-testid={`button-expand-eval-${ev.id}`}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{ev.companyName}</CardTitle>
                  <Badge variant="outline">{ev.companyNit}</Badge>
                  <Badge variant="secondary">{PESV_NIVEL_LABELS[ev.nivel] || ev.nivel}</Badge>
                  <Badge variant={ev.estado === "completada" ? "default" : "outline"}>
                    {PESV_ESTADO_LABELS[ev.estado] || ev.estado}
                  </Badge>
                </div>
                <CardDescription>
                  Periodo {ev.anio} {ev.numeroVehiculos != null ? `| ${ev.numeroVehiculos} vehiculos` : ""} {ev.numeroConductores != null ? `| ${ev.numeroConductores} conductores` : ""}
                </CardDescription>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right min-w-[80px]">
                  <div className="text-lg font-bold">{pct}%</div>
                  <div className="text-xs text-muted-foreground">
                    {ev.puntajeTotal ?? 0}/{ev.puntajeMaximo ?? 0} pts
                  </div>
                </div>
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {PESV_FASES.map((fase) => {
                    const key = `puntaje${fase.key.charAt(0).toUpperCase() + fase.key.slice(1)}` as keyof PesvEvaluacion;
                    const puntaje = (ev[key] as number | null) ?? 0;
                    return (
                      <div key={fase.key} className="text-center" data-testid={`text-pesv-fase-${fase.key}`}>
                        <div className={`text-xs font-medium mb-1`}>{fase.label}</div>
                        <div className="text-lg font-bold">{puntaje}</div>
                        <div className={`h-1 rounded-full mt-1 ${fase.color} opacity-70`} />
                      </div>
                    );
                  })}
                </div>

                {ev.responsableNombre && (
                  <div className="text-sm text-muted-foreground">
                    Responsable: <span className="font-medium text-foreground">{ev.responsableNombre}</span>
                    {ev.responsableCargo && ` - ${ev.responsableCargo}`}
                  </div>
                )}

                {loadingRespuestas ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : respuestas && respuestas.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Detalle por Paso</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Paso</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="w-[100px]">Estado</TableHead>
                          <TableHead className="w-[80px] text-right">Resultado</TableHead>
                          <TableHead>Observaciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {respuestas
                          .sort((a, b) => (a.pasoId || "").localeCompare(b.pasoId || ""))
                          .map((r) => (
                            <TableRow key={r.id} data-testid={`row-pesv-respuesta-${r.pasoId}`}>
                              <TableCell className="font-mono font-medium">{r.pasoId}</TableCell>
                              <TableCell className="text-sm">
                                {PESV_PASOS_NAMES[r.pasoId]?.nombre || r.pasoId}
                              </TableCell>
                              <TableCell>{getCumpleBadge(r.cumple, r.noAplica)}</TableCell>
                              <TableCell className="text-right font-medium">
                                {r.cumple === 1 ? "Si" : r.noAplica === 1 ? "N/A" : "No"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                {r.observaciones || r.hallazgo || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay respuestas registradas para esta evaluacion.
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function LicenciaTab() {
  const { user } = useAuth();

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), "dd MMMM yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const getLicenseStatusColor = () => {
    if (!user?.sstLicenseExpiresAt) return 'text-muted-foreground';
    
    const expiryDate = new Date(user.sstLicenseExpiresAt);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return 'text-red-500';
    if (daysUntilExpiry <= 30) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Información de Licencia SST
          </CardTitle>
          <CardDescription>
            Datos de su licencia profesional en Seguridad y Salud en el Trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
              <p className="text-lg">{user?.fullName || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Número de Cédula</label>
              <p className="text-lg font-mono" data-testid="text-identification-number">{(user as any)?.sstIdentificationNumber || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Profesión</label>
              <p className="text-lg">
                {user?.sstProfessionType 
                  ? SST_PROFESSION_LABELS[user.sstProfessionType] || user.sstProfessionType 
                  : '-'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número de Licencia</label>
              <p className="text-lg font-mono">{user?.sstLicenseNumber || '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entidad Emisora</label>
              <p className="text-lg">{user?.sstLicenseIssuer || '-'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Expedición</label>
                <p className="text-lg">{formatDate(user?.sstLicenseIssuedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Vencimiento</label>
                <p className={`text-lg ${getLicenseStatusColor()}`}>
                  {formatDate(user?.sstLicenseExpiresAt)}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado de la Licencia</label>
              <div className="mt-1">
                <LicenseStatusBadge status={user?.sstLicenseStatus || 'sin_licencia'} />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono de Contacto</label>
              <p className="text-lg">{user?.sstPhone || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Curso de 50 horas en SST</label>
              <p className="text-lg" data-testid="text-course-50-hours">
                {(user as any)?.sstCourse50Hours
                  ? `Si${(user as any)?.sstCourse50HoursDate ? ` — ${new Date((user as any).sstCourse50HoursDate).toLocaleDateString('es-CO')}` : ''}`
                  : 'No registrado'}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <LicenseEditDialog />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Firma Digital
          </CardTitle>
          <CardDescription>
            Su firma digital para documentos SST
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.sstSignatureUrl ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-white">
                <img 
                  src={user.sstSignatureUrl} 
                  alt="Firma digital" 
                  className="max-h-32 mx-auto"
                  data-testid="img-signature"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Esta firma se utilizará automáticamente en los documentos que firme.
              </p>
            </div>
          ) : (
            <SignatureUploadSection />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LicenseStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    vigente: { variant: "default", label: "Vigente" },
    por_vencer: { variant: "outline", label: "Por Vencer" },
    vencida: { variant: "destructive", label: "Vencida" },
    pendiente_verificacion: { variant: "secondary", label: "Pendiente Verificación" },
    suspendida: { variant: "destructive", label: "Suspendida" },
    sin_licencia: { variant: "secondary", label: "Sin Licencia" },
  };

  const config = variants[status] || variants.sin_licencia;

  return (
    <Badge variant={config.variant} className={status === 'por_vencer' ? 'border-amber-500 text-amber-600' : ''}>
      {config.label}
    </Badge>
  );
}

function SlaStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { className: string; label: string }> = {
    en_tiempo: { className: "bg-green-500", label: "En Tiempo" },
    proximo_vencer: { className: "bg-amber-500", label: "Próximo a Vencer" },
    vencido: { className: "bg-red-500", label: "Vencido" },
  };

  const config = variants[status] || variants.en_tiempo;

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

function LicenseEditDialog() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    sstIdentificationNumber: (user as any)?.sstIdentificationNumber || '',
    sstProfessionType: user?.sstProfessionType || '',
    sstLicenseNumber: user?.sstLicenseNumber || '',
    sstLicenseIssuer: user?.sstLicenseIssuer || '',
    sstLicenseIssuedAt: user?.sstLicenseIssuedAt ? new Date(user.sstLicenseIssuedAt).toISOString().split('T')[0] : '',
    sstLicenseExpiresAt: user?.sstLicenseExpiresAt ? new Date(user.sstLicenseExpiresAt).toISOString().split('T')[0] : '',
    sstPhone: user?.sstPhone || '',
    sstCourse50Hours: (user as any)?.sstCourse50Hours || false,
    sstCourse50HoursDate: (user as any)?.sstCourse50HoursDate ? new Date((user as any).sstCourse50HoursDate).toISOString().split('T')[0] : '',
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('PATCH', '/api/portal-licenciado/license', data);
    },
    onSuccess: () => {
      toast({
        title: "Datos actualizados",
        description: "Su información de licencia ha sido actualizada exitosamente.",
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron actualizar los datos",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-edit-license">
          <Pencil className="h-4 w-4 mr-2" />
          Actualizar Datos de Licencia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Actualizar Datos de Licencia</DialogTitle>
          <DialogDescription>
            Actualice la información de su licencia profesional SST.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                data-testid="input-fullname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sstIdentificationNumber">Número de Cédula</Label>
              <Input
                id="sstIdentificationNumber"
                value={formData.sstIdentificationNumber}
                onChange={(e) => setFormData({ ...formData, sstIdentificationNumber: e.target.value })}
                placeholder="Ej: 1.234.567.890"
                data-testid="input-identification-number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sstProfessionType">Tipo de Profesión</Label>
              <Select
                value={formData.sstProfessionType}
                onValueChange={(value) => setFormData({ ...formData, sstProfessionType: value })}
              >
                <SelectTrigger data-testid="select-profession-type">
                  <SelectValue placeholder="Seleccione tipo de profesión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medico_ocupacional">Médico Ocupacional</SelectItem>
                  <SelectItem value="profesional_sst">Profesional SST</SelectItem>
                  <SelectItem value="tecnologo_sst">Tecnólogo SST</SelectItem>
                  <SelectItem value="tecnico_sst">Técnico SST</SelectItem>
                  <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                  <SelectItem value="psicologo_sst">Psicólogo SST</SelectItem>
                  <SelectItem value="fonoaudiologo">Fonoaudiólogo</SelectItem>
                  <SelectItem value="ingeniero_sst">Ingeniero SST</SelectItem>
                  <SelectItem value="enfermero_sst">Enfermero SST</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sstLicenseNumber">Número de Licencia</Label>
              <Input
                id="sstLicenseNumber"
                value={formData.sstLicenseNumber}
                onChange={(e) => setFormData({ ...formData, sstLicenseNumber: e.target.value })}
                data-testid="input-license-number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sstLicenseIssuer">Entidad Emisora</Label>
              <Input
                id="sstLicenseIssuer"
                value={formData.sstLicenseIssuer}
                onChange={(e) => setFormData({ ...formData, sstLicenseIssuer: e.target.value })}
                placeholder="Ej: POSITIVA, SURA, etc."
                data-testid="input-license-issuer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sstLicenseIssuedAt">Fecha de Expedición</Label>
                <Input
                  id="sstLicenseIssuedAt"
                  type="date"
                  value={formData.sstLicenseIssuedAt}
                  onChange={(e) => setFormData({ ...formData, sstLicenseIssuedAt: e.target.value })}
                  data-testid="input-license-issued-at"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sstLicenseExpiresAt">Fecha de Vencimiento</Label>
                <Input
                  id="sstLicenseExpiresAt"
                  type="date"
                  value={formData.sstLicenseExpiresAt}
                  onChange={(e) => setFormData({ ...formData, sstLicenseExpiresAt: e.target.value })}
                  data-testid="input-license-expires-at"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sstPhone">Teléfono de Contacto</Label>
              <Input
                id="sstPhone"
                value={formData.sstPhone}
                onChange={(e) => setFormData({ ...formData, sstPhone: e.target.value })}
                placeholder="Ej: +57 300 1234567"
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sstCourse50Hours"
                  checked={formData.sstCourse50Hours}
                  onChange={(e) => setFormData({ ...formData, sstCourse50Hours: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                  data-testid="checkbox-course-50-hours"
                />
                <Label htmlFor="sstCourse50Hours" className="cursor-pointer">
                  Tiene Curso de 50 horas o 20 horas en SST
                </Label>
              </div>
              {formData.sstCourse50Hours && (
                <div className="space-y-2">
                  <Label htmlFor="sstCourse50HoursDate">Fecha del Certificado</Label>
                  <Input
                    id="sstCourse50HoursDate"
                    type="date"
                    value={formData.sstCourse50HoursDate}
                    onChange={(e) => setFormData({ ...formData, sstCourse50HoursDate: e.target.value })}
                    data-testid="input-course-50-hours-date"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SignatureUploadSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('signature', file);
      
      const response = await fetch('/api/portal-licenciado/firma', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir la firma');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Firma cargada",
        description: "Su firma digital ha sido guardada exitosamente.",
      });
      setIsOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la firma",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor seleccione una imagen (PNG, JPG)",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no debe superar 2MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h4 className="font-medium mb-2">Sin firma digital</h4>
      <p className="text-sm text-muted-foreground mb-4">
        No tiene una firma digital cargada. Configure su firma para poder 
        firmar documentos electrónicamente.
      </p>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" data-testid="button-upload-signature">
            <Upload className="h-4 w-4 mr-2" />
            Cargar Firma Digital
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cargar Firma Digital</DialogTitle>
            <DialogDescription>
              Suba una imagen de su firma manuscrita. Esta se utilizará para firmar documentos SST electrónicamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-2">
                  <img 
                    src={previewUrl} 
                    alt="Vista previa de firma" 
                    className="max-h-32 mx-auto"
                  />
                  <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Haga clic para seleccionar una imagen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG o JPG, máximo 2MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Asegúrese de que la firma sea clara y legible. Se recomienda usar fondo blanco o transparente.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Guardar Firma'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
