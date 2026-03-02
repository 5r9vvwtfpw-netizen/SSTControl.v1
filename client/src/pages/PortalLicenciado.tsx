import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  Info,
  Truck
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

function EmpresasTab() {
  const { data: empresas = [], isLoading, isError, error } = useQuery<AssignedCompany[]>({
    queryKey: ["/api/portal-licenciado/empresas"],
  });

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

  if (empresas.length === 0) {
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
                    <Link href={`/mensajes-internos?empresa=${encodeURIComponent(empresa.name)}`}>
                      <Button size="sm" variant="outline" data-testid={`button-message-${empresa.id}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Mensaje
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentosTab() {
  const { data: documentos = [], isLoading, isError, error } = useQuery<PendingDocument[]>({
    queryKey: ["/api/portal-licenciado/documentos-pendientes"],
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar documentos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los documentos pendientes. 
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

  if (documentos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Sin documentos pendientes</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No tiene investigaciones de accidentes pendientes de firma. 
            Todos los documentos han sido revisados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Pendientes de Firma</CardTitle>
        <CardDescription>
          Investigaciones de accidentes graves/mortales que requieren su firma profesional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha Evento</TableHead>
              <TableHead>Severidad</TableHead>
              <TableHead>Estado SLA</TableHead>
              <TableHead>Días Restantes</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((doc) => (
              <TableRow key={doc.id} data-testid={`row-documento-${doc.id}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{doc.companyName}</div>
                    <div className="text-xs text-muted-foreground">NIT: {doc.companyNit}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {doc.eventType || 'Investigación'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(doc.eventDate), "dd MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  {doc.isFatal === 1 ? (
                    <Badge variant="destructive">Mortal</Badge>
                  ) : doc.isSevere === 1 ? (
                    <Badge className="bg-orange-500">Grave</Badge>
                  ) : (
                    <Badge variant="secondary">Leve</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <SlaStatusBadge status={doc.slaStatus} />
                </TableCell>
                <TableCell>
                  {doc.daysRemaining !== null ? (
                    <span className={doc.daysRemaining <= 3 ? "text-red-500 font-medium" : ""}>
                      {doc.daysRemaining} días
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Link href={`/portal-licenciado/investigacion/${doc.id}`}>
                    <Button size="sm" data-testid={`button-review-${doc.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Revisar
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
    sstProfessionType: user?.sstProfessionType || '',
    sstLicenseNumber: user?.sstLicenseNumber || '',
    sstLicenseIssuer: user?.sstLicenseIssuer || '',
    sstLicenseIssuedAt: user?.sstLicenseIssuedAt ? new Date(user.sstLicenseIssuedAt).toISOString().split('T')[0] : '',
    sstLicenseExpiresAt: user?.sstLicenseExpiresAt ? new Date(user.sstLicenseExpiresAt).toISOString().split('T')[0] : '',
    sstPhone: user?.sstPhone || '',
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
