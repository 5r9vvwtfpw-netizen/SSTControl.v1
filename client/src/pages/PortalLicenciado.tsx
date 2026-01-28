import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  XCircle
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
  assignmentId: string;
  assignedAt: string;
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
  const [activeTab, setActiveTab] = useState("dashboard");

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
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Portal del Profesional Licenciado
        </h1>
        <p className="text-muted-foreground">
          Gestione sus empresas asignadas y documentos que requieren su firma profesional
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <Building2 className="h-4 w-4 mr-2" />
            Panel
          </TabsTrigger>
          <TabsTrigger value="empresas" data-testid="tab-empresas">
            <Users className="h-4 w-4 mr-2" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="documentos" data-testid="tab-documentos">
            <FileCheck className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="licencia" data-testid="tab-licencia">
            <Award className="h-4 w-4 mr-2" />
            Mi Licencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="empresas" className="mt-6">
          <EmpresasTab />
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <DocumentosTab />
        </TabsContent>

        <TabsContent value="licencia" className="mt-6">
          <LicenciaTab />
        </TabsContent>
      </Tabs>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas Asignadas</CardTitle>
        <CardDescription>
          Empresas donde está habilitado para firmar documentos SST
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Nivel de Riesgo</TableHead>
              <TableHead>Trabajadores</TableHead>
              <TableHead>Fecha Asignación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.map((empresa) => (
              <TableRow key={empresa.id} data-testid={`row-empresa-${empresa.id}`}>
                <TableCell className="font-medium">{empresa.name}</TableCell>
                <TableCell>{empresa.nit}</TableCell>
                <TableCell>{empresa.city || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">Nivel {empresa.riskLevel}</Badge>
                </TableCell>
                <TableCell>{empresa.numberOfWorkers}</TableCell>
                <TableCell>
                  {format(new Date(empresa.assignedAt), "dd MMM yyyy", { locale: es })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            <Link href="/mi-cuenta">
              <Button variant="outline" data-testid="button-edit-license">
                Actualizar Datos de Licencia
              </Button>
            </Link>
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">Sin firma digital</h4>
              <p className="text-sm text-muted-foreground mb-4">
                No tiene una firma digital cargada. Configure su firma para poder 
                firmar documentos electrónicamente.
              </p>
              <Link href="/mi-cuenta">
                <Button variant="outline" data-testid="button-upload-signature">
                  Cargar Firma Digital
                </Button>
              </Link>
            </div>
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
