import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getTodayDateString } from "@/lib/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { 
  ComunicacionSst,
  ReporteTrabajador,
  InsertReporteTrabajador,
  Contract,
  JobProfile,
  Worker,
  InternalMessage,
  RegistroInduccion,
  MedicalExam,
  AudiometryRecord
} from "@shared/schema";
import { insertReporteTrabajadorSchema } from "@shared/schema";
import { z } from "zod";
import { 
  MessageSquare, AlertCircle, Send, CheckCircle, CheckCircle2, FileText, User, Briefcase, FileCheck,
  GraduationCap, Calendar, Clock, MapPin, UserCheck, Users, Mail, KeyRound, Eye, EyeOff, Vote,
  Building2, BarChart3, Shield, UserCog, BookOpen, Award, Play, Trophy, Star, FolderOpen, Inbox, Download, Bell, ChevronDown,
  History, Monitor, Smartphone, Tablet, Video, Heart, ClipboardList, Camera, Upload, Trash2, Loader2, Headphones, Car, Search, X,
  Brain, Pill, Wine, Thermometer, Moon, Truck, CheckSquare, XSquare, AlertTriangle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@shared/schema";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

// Roles administrativos que ven el dashboard de gestión
const ADMIN_ROLES: UserRole[] = [
  'superadmin', 'superusuario', 'admin', 'responsable_sst', 
  'coordinador_sst', 'coordinador_rrhh', 'coordinador_salud', 'lso'
];

function isAdminRole(role: UserRole | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

export default function PortalEmpleados() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  // Log portal access once per session (SST-2025-0082) — only for worker roles
  useEffect(() => {
    if (isAdmin) return;
    const sessionKey = "portal_access_logged";
    if (!sessionStorage.getItem(sessionKey)) {
      apiRequest("POST", "/api/portal/log-access", {})
        .then(() => {
          sessionStorage.setItem(sessionKey, "true");
        })
        .catch((error) => {
          console.error("Failed to log portal access:", error);
        });
    }
  }, [isAdmin]);

  // Si es rol administrativo, mostrar dashboard de gestión
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Si es trabajador/supervisor, mostrar portal personal
  return <WorkerPortal />;
}

// ==================== DASHBOARD PARA ADMINISTRADORES ====================

interface WorkerWithPortalAccess extends Worker {
  hasPortalAccess?: boolean;
  userEmail?: string;
}

interface PortalStats {
  totalWorkers: number;
  workersWithPortalAccess: number;
  pendingReports: number;
  unreadCommunications: number;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Estadísticas del portal
  const { data: stats, isLoading: loadingStats } = useQuery<PortalStats>({
    queryKey: ["/api/portal/admin/stats"],
  });

  // Lista de trabajadores con acceso al portal
  const { data: workers = [], isLoading: loadingWorkers } = useQuery<WorkerWithPortalAccess[]>({
    queryKey: ["/api/workers"],
  });

  // Reportes pendientes de respuesta
  const { data: pendingReports = [], isLoading: loadingReports } = useQuery<ReporteTrabajador[]>({
    queryKey: ["/api/reportes-trabajadores"],
  });

  const workersWithEmail = workers.filter(w => w.email);
  const workersWithAccess = workers.filter(w => w.hasPortalAccess);
  const pendingCount = pendingReports.filter(r => r.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Gestión del Portal de Empleados</h1>
        <p className="text-muted-foreground">
          Administra el acceso de los trabajadores al portal SST y revisa sus reportes
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-workers">
              {loadingWorkers ? "..." : workers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Con Acceso al Portal</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-workers-with-access">
              {loadingWorkers ? "..." : workersWithAccess.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {workersWithEmail.length} con email registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Reportes Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-reports">
              {loadingReports ? "..." : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Uso del Portal</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-portal-usage">
              {loadingWorkers ? "..." : workers.length > 0 
                ? Math.round((workersWithAccess.length / workers.length) * 100) + "%" 
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasa de adopción
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Building2 className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="access" data-testid="tab-access">
            <UserCog className="h-4 w-4 mr-2" />
            Gestión de Accesos
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-admin-reports">
            <FileCheck className="h-4 w-4 mr-2" />
            Reportes de Empleados
          </TabsTrigger>
          <TabsTrigger value="access-logs" data-testid="tab-access-logs">
            <History className="h-4 w-4 mr-2" />
            Historial Accesos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverviewTab workers={workers} pendingReports={pendingReports} />
        </TabsContent>

        <TabsContent value="access">
          <AdminAccessManagementTab workers={workers} isLoading={loadingWorkers} />
        </TabsContent>

        <TabsContent value="reports">
          <AdminReportsTab reports={pendingReports} isLoading={loadingReports} />
        </TabsContent>

        <TabsContent value="access-logs">
          <PortalAccessLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Tab de resumen para administradores
function AdminOverviewTab({ workers, pendingReports }: { workers: WorkerWithPortalAccess[], pendingReports: ReporteTrabajador[] }) {
  const workersWithAccess = workers.filter(w => w.hasPortalAccess);
  const workersWithoutAccess = workers.filter(w => w.email && !w.hasPortalAccess);
  const recentReports = pendingReports.slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estado de Accesos al Portal
          </CardTitle>
          <CardDescription>
            Resumen del acceso de trabajadores al portal SST
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Con acceso activo</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {workersWithAccess.length}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <span>Pendientes (con email)</span>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {workersWithoutAccess.length}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Sin email registrado</span>
            </div>
            <Badge variant="secondary">
              {workers.filter(w => !w.email).length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Reportes Recientes
          </CardTitle>
          <CardDescription>
            Últimos reportes enviados por los empleados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay reportes pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                  data-testid={`card-report-${report.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{report.asunto}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.categoria} - {format(new Date(report.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <Badge 
                    className={report.estado === 'pendiente' ? 'bg-orange-600' : 'bg-green-600'}
                  >
                    {report.estado}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab de gestión de accesos
function AdminAccessManagementTab({ workers, isLoading }: { workers: WorkerWithPortalAccess[], isLoading: boolean }) {
  const { toast } = useToast();
  const [creatingAccessForId, setCreatingAccessForId] = useState<string | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const createAccessMutation = useMutation({
    mutationFn: (workerId: string) => {
      setCreatingAccessForId(workerId);
      return apiRequest("POST", `/api/workers/${workerId}/create-portal-access`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setCreatingAccessForId(null);
      toast({
        title: "Acceso creado",
        description: "Se han enviado las credenciales al email del trabajador",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      setCreatingAccessForId(null);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/workers/bulk-create-portal-access"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setShowBulkDialog(false);
      const emailFailures = (data.results || []).filter((r: any) => r.status === "created_no_email").length;
      const parts: string[] = [];
      parts.push(`${data.created} accesos creados`);
      if (emailFailures > 0) parts.push(`${emailFailures} sin envío de email`);
      if (data.failed > 0) parts.push(`${data.failed} fallaron`);
      if (data.skipped > 0) parts.push(`${data.skipped} omitidos`);
      const hasIssues = data.failed > 0 || emailFailures > 0;
      toast({
        title: hasIssues ? "Accesos creados con advertencias" : "Accesos masivos creados",
        description: parts.join(". ") + ".",
        className: hasIssues ? undefined : "bg-green-50 border-green-200",
        variant: hasIssues ? "destructive" : undefined,
      });
    },
    onError: (error: Error) => {
      setShowBulkDialog(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const workersWithEmail = workers.filter(w => w.email);
  const workersWithoutAccess = workers.filter(w => w.email && !w.hasPortalAccess);

  if (isLoading) {
    return <ListSkeletonLoading items={4} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Gestión de Accesos al Portal
            </CardTitle>
            <CardDescription>
              Crea o revoca acceso al portal para los trabajadores con email registrado
            </CardDescription>
          </div>
          {workersWithoutAccess.length > 0 && (
            <Button
              onClick={() => setShowBulkDialog(true)}
              disabled={bulkCreateMutation.isPending}
              data-testid="button-bulk-create-access"
            >
              {bulkCreateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Crear Accesos Masivos
            </Button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar trabajador por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
            data-testid="input-search-portal-access"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search-portal-access"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>

      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear accesos masivos</DialogTitle>
            <DialogDescription>
              Se crearán credenciales del portal para {workersWithoutAccess.length} trabajadores que tienen email registrado y aún no tienen acceso. Las credenciales serán enviadas por email a cada trabajador.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(false)}
              disabled={bulkCreateMutation.isPending}
              data-testid="button-bulk-cancel"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => bulkCreateMutation.mutate()}
              disabled={bulkCreateMutation.isPending}
              data-testid="button-bulk-confirm"
            >
              {bulkCreateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CardContent>
        {workersWithEmail.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay trabajadores con email registrado
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Registra emails en la sección de Trabajadores para habilitar acceso al portal
            </p>
          </div>
        ) : (() => {
          const normalizedSearch = searchTerm.toLowerCase().trim();
          const filteredWorkers = normalizedSearch
            ? workersWithEmail.filter((w) =>
                (w.name || "").toLowerCase().includes(normalizedSearch) ||
                (w.email || "").toLowerCase().includes(normalizedSearch)
              )
            : workersWithEmail;
          return filteredWorkers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron trabajadores para "{searchTerm}"</p>
            </div>
          ) : (
          <div className="space-y-3">
            {filteredWorkers.map((w) => (
              <div 
                key={w.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg hover-elevate"
                data-testid={`row-worker-access-${w.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{w.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{w.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {w.hasPortalAccess ? (
                    <Badge className="bg-green-600 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Acceso Activo
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => createAccessMutation.mutate(w.id)}
                      disabled={creatingAccessForId === w.id}
                      data-testid={`button-create-access-${w.id}`}
                      className="text-xs sm:text-sm"
                    >
                      <KeyRound className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{creatingAccessForId === w.id ? "Creando..." : "Crear Acceso"}</span>
                      <span className="sm:hidden">{creatingAccessForId === w.id ? "..." : "Crear"}</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}

// Componente individual para cada reporte pendiente con formulario de respuesta
function PendingReportCard({ report }: { report: ReporteTrabajador }) {
  const { toast } = useToast();
  const [respuesta, setRespuesta] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const respondMutation = useMutation({
    mutationFn: ({ id, respuesta }: { id: string; respuesta: string }) =>
      apiRequest("POST", `/api/reportes-trabajadores/${id}/responder`, { respuesta, estado: "resuelto" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reportes-trabajadores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/mis-reportes"] });
      setRespuesta("");
      setIsExpanded(false);
      toast({
        title: "Respuesta enviada",
        description: "El trabajador ha sido notificado",
        className: "bg-green-50 border-green-200",
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

  const handleSubmit = () => {
    if (!respuesta.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe una respuesta",
        variant: "destructive",
      });
      return;
    }
    respondMutation.mutate({ id: report.id, respuesta });
  };

  return (
    <Card className="border-orange-200" data-testid={`card-pending-report-${report.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base">{report.asunto}</CardTitle>
            <CardDescription>
              {report.categoria} - {format(new Date(report.createdAt), "PPP", { locale: es })}
            </CardDescription>
          </div>
          <Badge className="bg-orange-600">Pendiente</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{report.descripcion}</p>
        {report.ubicacion && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {report.ubicacion}
          </p>
        )}
        
        {!isExpanded ? (
          <Button 
            onClick={() => setIsExpanded(true)}
            className="w-full"
            data-testid={`button-respond-${report.id}`}
          >
            <Send className="h-4 w-4 mr-2" />
            Responder al Trabajador
          </Button>
        ) : (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Tu Respuesta *</label>
              <Textarea
                placeholder="Escribe tu respuesta al trabajador..."
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={4}
                data-testid={`input-response-${report.id}`}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsExpanded(false);
                  setRespuesta("");
                }}
                disabled={respondMutation.isPending}
                data-testid={`button-cancel-${report.id}`}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={respondMutation.isPending || !respuesta.trim()}
                data-testid={`button-send-response-${report.id}`}
              >
                {respondMutation.isPending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Respuesta
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Tab de reportes para administradores
function AdminReportsTab({ reports, isLoading }: { reports: ReporteTrabajador[], isLoading: boolean }) {
  if (isLoading) {
    return <ListSkeletonLoading items={4} />;
  }

  const pendingReports = reports.filter(r => r.estado === 'pendiente');
  const respondedReports = reports.filter(r => r.estado !== 'pendiente');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Reportes Pendientes de Respuesta
          </CardTitle>
          <CardDescription>
            Reportes enviados por empleados que requieren atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay reportes pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <PendingReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {respondedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {respondedReports.slice(0, 10).map((report) => (
                <div 
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg"
                  data-testid={`row-report-history-${report.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{report.asunto}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.categoria} - {format(new Date(report.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <Badge className="bg-green-600 self-start sm:self-center flex-shrink-0">{report.estado}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== PORTAL ACCESS LOGS TAB (SST-2025-0082) ====================

interface PortalAccessLogWithWorkerName {
  id: string;
  companyId: string;
  userId: string;
  workerId: string | null;
  accessTime: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: "mobile" | "desktop" | "tablet" | null;
  workerName: string | null;
}

function PortalAccessLogsTab() {
  const [workerFilter, setWorkerFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: logs = [], isLoading } = useQuery<PortalAccessLogWithWorkerName[]>({
    queryKey: ["/api/admin/portal-access-logs", workerFilter, fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workerFilter) params.append("workerId", workerFilter);
      if (fromDate) params.append("from", new Date(fromDate).toISOString());
      if (toDate) params.append("to", new Date(toDate).toISOString());
      
      const url = `/api/admin/portal-access-logs${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch access logs");
      return response.json();
    },
  });

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4 opacity-50" />;
    }
  };

  const getDeviceLabel = (deviceType: string | null) => {
    switch (deviceType) {
      case "mobile":
        return "Móvil";
      case "tablet":
        return "Tablet";
      case "desktop":
        return "Escritorio";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Accesos al Portal
          </CardTitle>
          <CardDescription>
            Registro de cuándo los empleados acceden al Portal de Empleados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Desde</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                data-testid="input-from-date"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Hasta</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                data-testid="input-to-date"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setWorkerFilter("");
                }}
                data-testid="button-clear-filters"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {isLoading ? (
            <ListSkeletonLoading items={5} />
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de acceso</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">Empleado</th>
                    <th className="text-left p-3 font-medium text-sm">Fecha y Hora</th>
                    <th className="text-left p-3 font-medium text-sm hidden sm:table-cell">Dispositivo</th>
                    <th className="text-left p-3 font-medium text-sm hidden sm:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="border-t hover-elevate"
                      data-testid={`row-access-log-${log.id}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.workerName || log.userName || "Usuario sin perfil"}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {format(new Date(log.accessTime), "d MMM yyyy, HH:mm", { locale: es })}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(log.deviceType)}
                          <span className="text-sm">{getDeviceLabel(log.deviceType)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground font-mono hidden sm:table-cell">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Mostrando {logs.length} registro{logs.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== PORTAL PARA TRABAJADORES ====================

// Configuración de navegación agrupada del Portal de Empleados
const portalNavGroups = [
  {
    id: "cuenta",
    label: "Mi Cuenta",
    icon: User,
    items: [
      { id: "contrato", label: "Mi Contrato", icon: FileText },
      { id: "perfil", label: "Mi Perfil", icon: Briefcase },
      { id: "mi-foto", label: "Mi Foto de Carnet", icon: Camera },
      { id: "cambiar-password", label: "Cambiar Contraseña", icon: KeyRound },
    ]
  },
  {
    id: "formacion",
    label: "Formación",
    icon: GraduationCap,
    items: [
      { id: "capacitaciones", label: "Capacitaciones", icon: GraduationCap },
      { id: "mis-inducciones", label: "Mis Inducciones", icon: ClipboardList },
      { id: "inducciones-virtuales", label: "Inducciones Virtuales", icon: Monitor },
    ]
  },
  {
    id: "comunicacion",
    label: "Comunicación",
    icon: MessageSquare,
    items: [
      { id: "comunicaciones", label: "Comunicaciones SST", icon: MessageSquare },
      { id: "reportar", label: "Reportar Incidente", icon: AlertCircle },
      { id: "mis-reportes", label: "Mis Reportes", icon: FileCheck },
    ]
  },
  {
    id: "participacion",
    label: "Participación",
    icon: Vote,
    items: [
      { id: "elecciones-copasst", label: "Elecciones COPASST", icon: Vote },
      { id: "elecciones-convivencia", label: "Elecciones Convivencia", icon: Users },
    ]
  },
  {
    id: "salud",
    label: "Salud",
    icon: Heart,
    items: [
      { id: "mis-examenes-medicos", label: "Mis Exámenes Médicos", icon: Heart },
      { id: "mis-audiometrias", label: "Mis Audiometrías", icon: Headphones },
    ]
  },
  {
    id: "pesv",
    label: "PESV",
    icon: Car,
    items: [
      { id: "comite-pesv", label: "Comité de Seguridad Vial", icon: Shield },
      { id: "capacitaciones-pesv", label: "Capacitaciones PESV", icon: GraduationCap },
      { id: "encuesta-conductor", label: "Encuesta Diaria", icon: ClipboardList },
      { id: "inspeccion-vehiculo", label: "Inspección Vehículo", icon: Truck },
    ]
  },
];

function WorkerPortal() {
  const [activeSection, setActiveSection] = useState("contrato");
  const [expandedBottomGroup, setExpandedBottomGroup] = useState<string | null>(null);

  // Tipo para elecciones con fechas
  type EleccionPortal = {
    id: string;
    estado: string;
    fechaConvocatoria?: string;
    fechaInicioInscripcion?: string;
    fechaFinInscripcion?: string;
    fechaVotacion?: string;
  };

  // Consultar si hay elecciones activas (COPASST o Convivencia)
  const { data: eleccionCopasstData } = useQuery<{ eleccion: EleccionPortal | null }>({
    queryKey: ["/api/portal/copasst/eleccion-activa"],
    refetchInterval: 60000, // Refrescar cada minuto
  });
  
  const { data: eleccionConvivenciaData } = useQuery<{ eleccion: EleccionPortal | null }>({
    queryKey: ["/api/portal/convivencia/eleccion-activa"],
    refetchInterval: 60000,
  });

  const eleccionCopasst = eleccionCopasstData?.eleccion;
  const eleccionConvivencia = eleccionConvivenciaData?.eleccion;
  
  // Función para verificar si una elección está activa según su estado
  // SST-2025-0097: La visibilidad es controlada por publicadoEnPortal en el backend
  // El frontend simplemente muestra cualquier elección que el backend retorne
  // ya que el backend filtra por publicadoEnPortal = true y estados activos
  const esEleccionActiva = (eleccion: EleccionPortal | null | undefined): boolean => {
    if (!eleccion) return false;
    
    const estado = eleccion.estado;
    
    // Estados activos que deben mostrarse a los trabajadores
    // El backend ya filtra por publicadoEnPortal = true
    const estadosActivos = ['convocatoria', 'inscripcion', 'votacion', 'escrutinio'];
    
    return estadosActivos.includes(estado);
  };
  
  const hayEleccionCopasstActiva = esEleccionActiva(eleccionCopasst);
  const hayEleccionConvivenciaActiva = esEleccionActiva(eleccionConvivencia);

  // Detectar si el trabajador es conductor para mostrar encuesta diaria
  const { data: conductorStatus } = useQuery<{ esConductor: boolean; conductorNombre?: string }>({
    queryKey: ["/api/portal/conductor-status"],
    staleTime: 5 * 60 * 1000,
  });

  // Filtrar items PESV según perfil de conductor
  const filteredNavGroups = portalNavGroups.map(group => {
    if (group.id === 'pesv' && !conductorStatus?.esConductor) {
      return { ...group, items: group.items.filter(i => i.id !== 'encuesta-conductor' && i.id !== 'inspeccion-vehiculo') };
    }
    return group;
  });

  // Encontrar el grupo y el item activo para mostrar en el header
  const findActiveInfo = () => {
    for (const group of filteredNavGroups) {
      const item = group.items.find(i => i.id === activeSection);
      if (item) {
        return { group, item };
      }
    }
    return { group: filteredNavGroups[0], item: filteredNavGroups[0].items[0] };
  };

  const { group: activeGroup, item: activeItem } = findActiveInfo();
  const ActiveIcon = activeItem.icon;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      {/* Banner de Elecciones Activas */}
      {(hayEleccionCopasstActiva || hayEleccionConvivenciaActiva) && (
        <div className="space-y-2">
          {hayEleccionCopasstActiva && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950/30" data-testid="banner-eleccion-copasst">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Vote className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        {eleccionCopasst?.estado === 'votacion' 
                          ? '¡Elecciones COPASST en curso!' 
                          : eleccionCopasst?.estado === 'inscripcion'
                          ? '¡Inscripciones COPASST abiertas!'
                          : '¡Proceso Electoral COPASST Convocado!'}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {eleccionCopasst?.estado === 'votacion' 
                          ? 'Ejerce tu derecho al voto para elegir a los representantes de los trabajadores'
                          : eleccionCopasst?.estado === 'inscripcion'
                          ? 'Puedes inscribirte como candidato para representar a los trabajadores'
                          : 'Se ha convocado elección de representantes de los trabajadores al COPASST'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveSection("elecciones-copasst")}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-ir-elecciones-copasst"
                  >
                    {eleccionCopasst?.estado === 'votacion' ? 'Votar ahora' : 'Ver elección'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {hayEleccionConvivenciaActiva && (
            <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950/30" data-testid="banner-eleccion-convivencia">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800 dark:text-purple-200">
                        {eleccionConvivencia?.estado === 'votacion' 
                          ? '¡Elecciones Comité de Convivencia en curso!' 
                          : eleccionConvivencia?.estado === 'inscripcion'
                          ? '¡Inscripciones Comité de Convivencia abiertas!'
                          : '¡Proceso Electoral Comité de Convivencia Convocado!'}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {eleccionConvivencia?.estado === 'votacion' 
                          ? 'Ejerce tu derecho al voto para elegir a los representantes'
                          : eleccionConvivencia?.estado === 'inscripcion'
                          ? 'Puedes inscribirte como candidato'
                          : 'Se ha convocado elección del Comité de Convivencia Laboral'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveSection("elecciones-convivencia")}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-ir-elecciones-convivencia"
                  >
                    {eleccionConvivencia?.estado === 'votacion' ? 'Votar ahora' : 'Ver elección'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" data-testid="text-page-title">
            Portal de Empleados SST
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Información de tu contrato, perfil de cargo y canal de comunicación con el equipo SST
          </p>
        </div>
      </div>

      {/* Navegación Profesional con Menús Desplegables — escritorio */}
      <Card className="border-0 shadow-sm bg-card/50 hidden sm:block">
        <CardContent className="p-2 sm:p-3">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {filteredNavGroups.map((group) => {
              const GroupIcon = group.icon;
              const isActiveGroup = group.items.some(item => item.id === activeSection);
              
              return (
                <DropdownMenu key={group.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActiveGroup ? "default" : "ghost"}
                      size="sm"
                      className="h-9 px-3 gap-2"
                      data-testid={`menu-${group.id}`}
                    >
                      <GroupIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{group.label}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`cursor-pointer gap-3 ${isActive ? 'bg-accent' : ''}`}
                          data-testid={`nav-${item.id}`}
                        >
                          <ItemIcon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {isActive && <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumb / Indicador de sección actual */}
      <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
        <activeGroup.icon className="h-4 w-4" />
        <span>{activeGroup.label}</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground flex items-center gap-2">
          <ActiveIcon className="h-4 w-4" />
          {activeItem.label}
        </span>
      </div>

      {/* Contenido de cada sección */}
      <div className="min-h-[400px]">
        {activeSection === "contrato" && <MiContratoTab />}
        {activeSection === "perfil" && <MiPerfilTab />}
        {activeSection === "mi-foto" && <MiFotoCarnetTab />}
        {activeSection === "cambiar-password" && <CambiarPasswordTab />}
        {/* MisDocumentosTab eliminado - info duplicada con MiContratoTab */}

        {activeSection === "capacitaciones" && <MisCapacitacionesTab />}
        {activeSection === "mis-inducciones" && <MisInduccionesTab />}
        {activeSection === "inducciones-virtuales" && <InduccionesVirtualesTab />}
        {activeSection === "comunicaciones" && <ComunicacionesTab />}
        {activeSection === "reportar" && <ReportarTab />}
        {activeSection === "mis-reportes" && <MisReportesTab />}
        {activeSection === "elecciones-copasst" && <EleccionesCopasstTab />}
        {activeSection === "elecciones-convivencia" && <EleccionesConvivenciaTab />}
        {activeSection === "mis-examenes-medicos" && <MisExamenesMedicosTab />}
        {activeSection === "mis-audiometrias" && <MisAudiometriasTab />}
        {activeSection === "comite-pesv" && <MiComitePesvTab />}
        {activeSection === "capacitaciones-pesv" && <MisCapacitacionesPesvTab />}
        {activeSection === "encuesta-conductor" && <EncuestaConductorPortalTab />}
        {activeSection === "inspeccion-vehiculo" && <InspeccionVehiculoPortalTab />}
      </div>

      {/* ===== BOTTOM NAV — solo mobile (sm:hidden) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        {/* Panel expandido con items del grupo seleccionado */}
        {expandedBottomGroup && (
          <>
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setExpandedBottomGroup(null)}
            />
            <div className="relative z-10 bg-card border-t shadow-xl">
              <div className="grid grid-cols-3 gap-1 p-3">
                {filteredNavGroups
                  .find(g => g.id === expandedBottomGroup)
                  ?.items.map(item => {
                    const ItemIcon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setExpandedBottomGroup(null);
                        }}
                        className={`touch-manipulation flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                        data-testid={`bottom-nav-item-${item.id}`}
                      >
                        <ItemIcon className="h-5 w-5 shrink-0" />
                        <span className="text-center leading-tight line-clamp-2">{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* Barra principal inferior */}
        <div className="bg-card border-t shadow-lg">
          <div className="flex items-stretch justify-around h-16">
            {filteredNavGroups.map(group => {
              const GroupIcon = group.icon;
              const isActiveGroup = group.items.some(item => item.id === activeSection);
              const isExpanded = expandedBottomGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    if (group.items.length === 1) {
                      setActiveSection(group.items[0].id);
                      setExpandedBottomGroup(null);
                    } else {
                      setExpandedBottomGroup(isExpanded ? null : group.id);
                    }
                  }}
                  className={`touch-manipulation flex flex-col items-center justify-center gap-0.5 flex-1 px-1 text-[10px] transition-colors ${
                    isActiveGroup || isExpanded ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={`bottom-nav-group-${group.id}`}
                >
                  <div className={`p-1.5 rounded-full transition-colors ${
                    isActiveGroup || isExpanded ? "bg-primary/10" : ""
                  }`}>
                    <GroupIcon className="h-5 w-5" />
                  </div>
                  <span className="truncate w-full text-center leading-tight">{group.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== REUSABLE SKELETON LOADING COMPONENTS ====================

function CardSkeletonLoading({ rows = 4 }: { rows?: number }) {
  return (
    <Card data-testid="skeleton-loading">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full max-w-xs" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ListSkeletonLoading({ items = 3 }: { items?: number }) {
  return (
    <Card data-testid="skeleton-loading-list">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ==================== EMPTY STATE COMPONENT ====================

interface EmptyStateProps {
  icon: typeof FileText;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12" data-testid="empty-state">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-4" data-testid="button-empty-action">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ==================== TAB 1: MI CONTRATO ====================

function MiContratoTab() {
  const { data: contract, isLoading, error } = useQuery<Contract>({
    queryKey: ["/api/portal/my-contract"],
  });

  if (isLoading) {
    return <CardSkeletonLoading rows={6} />;
  }

  if (error || !contract) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={FileText}
            title="Sin contrato activo"
            description="No se encontró un contrato activo asociado a tu cuenta. Contacta a recursos humanos si crees que esto es un error."
          />
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    activo: "bg-green-600",
    vencido: "bg-red-600",
    terminado: "bg-gray-600",
    suspendido: "bg-orange-600"
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl">Mi Contrato Laboral</CardTitle>
            <CardDescription className="text-sm">Información de tu contrato activo</CardDescription>
          </div>
          <Badge className={`${statusColors[contract.status]} text-white self-start`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Número de Contrato</p>
            <p className="text-base font-semibold" data-testid="text-contract-number">{contract.contractNumber}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tipo de Contrato</p>
            <p className="text-base">{contract.contractType}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
            <p className="text-base">{format(new Date(contract.startDate), "PPP", { locale: es })}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Fecha de Finalización</p>
            <p className="text-base">
              {contract.endDate ? format(new Date(contract.endDate), "PPP", { locale: es }) : "Indefinido"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Cargo</p>
            <p className="text-base">{contract.position || "No especificado"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Departamento</p>
            <p className="text-base">{contract.department || "No especificado"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Salario</p>
            <p className="text-base">{contract.salary && contract.salary > 0 ? formatCurrency(contract.salary) : "No especificado"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Jornada Laboral</p>
            <p className="text-base">{contract.workSchedule || "No especificado"}</p>
          </div>
        </div>

        {contract.additionalClauses && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Cláusulas Adicionales</p>
            <p className="text-sm text-muted-foreground">{contract.additionalClauses}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB 2: MI PERFIL DE CARGO Y CUENTA ====================

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual requerida"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

function MiPerfilTab() {
  const { data: profile, isLoading: loadingProfile } = useQuery<JobProfile>({
    queryKey: ["/api/portal/my-job-profile"],
  });

  const getRiskColor = (riskClass: string) => {
    if (riskClass === "I") return "bg-blue-600";
    if (riskClass === "II") return "bg-green-600";
    if (riskClass === "III") return "bg-yellow-600";
    if (riskClass === "IV") return "bg-orange-600";
    return "bg-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Sección de Perfil de Cargo */}
      {loadingProfile ? (
        <CardSkeletonLoading rows={5} />
      ) : !profile ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={Briefcase}
              title="Sin perfil de cargo"
              description="No se encontró un perfil de cargo asociado a tu contrato. Contacta al área de SST para más información."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl">Mi Perfil de Cargo</CardTitle>
                <CardDescription className="text-sm">Información completa de tu cargo y responsabilidades</CardDescription>
              </div>
              <Badge className={`${getRiskColor(profile.riskClass)} text-white self-start`}>
                Clase {profile.riskClass}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2" data-testid="text-job-title">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.description}</p>
            </div>

            {profile.physicalDemands && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Demandas Físicas</h4>
                <p className="text-sm text-muted-foreground">{profile.physicalDemands}</p>
              </div>
            )}

            {profile.mentalDemands && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Demandas Mentales/Cognitivas</h4>
                <p className="text-sm text-muted-foreground">{profile.mentalDemands}</p>
              </div>
            )}

            {profile.riskFactors && profile.riskFactors.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Factores de Riesgo</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.riskFactors.map((factor, idx) => (
                    <Badge key={idx} variant="secondary">{factor}</Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.requiredTrainings && profile.requiredTrainings.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Capacitaciones Requeridas</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.requiredTrainings.map((training, idx) => (
                    <Badge key={idx} variant="outline">{training}</Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.requiredExams && profile.requiredExams.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Exámenes Médicos Requeridos</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.requiredExams.map((exam, idx) => (
                    <Badge key={idx} variant="outline">{exam}</Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.requiredPpe && profile.requiredPpe.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Elementos de Protección Personal (EPP) Requeridos</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.requiredPpe.map((ppe, idx) => (
                    <Badge key={idx} className="bg-primary text-white">{ppe}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== TAB: NOTIFICACIONES ====================

interface MessageWithSender extends InternalMessage {
  sender?: {
    firstName: string;
    lastName: string;
    position?: string;
  };
}

function NotificacionesTab() {
  const { toast } = useToast();

  const { data: messages = [], isLoading: loadingMessages } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/internal-messages"],
    refetchInterval: 60000,
  });

  const { data: capacitaciones = [], isLoading: loadingCapacitaciones } = useQuery<WorkerCapacitacion[]>({
    queryKey: ["/api/portal/mis-capacitaciones"],
    refetchInterval: 60000,
  });

  const { data: comunicaciones = [], isLoading: loadingComunicaciones } = useQuery<ComunicacionSst[]>({
    queryKey: ["/api/comunicacion-sst/trabajador"],
    refetchInterval: 60000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("PATCH", `/api/internal-messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/internal-messages/mark-all-read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      toast({
        title: "Mensajes marcados como leídos",
        description: "Todos los mensajes han sido marcados como leídos",
      });
    },
  });

  const isLoading = loadingMessages || loadingCapacitaciones || loadingComunicaciones;

  if (isLoading) {
    return <ListSkeletonLoading items={5} />;
  }

  const unreadMessages = messages.filter((m) => !m.readAt);
  const recentTrainingInvitations = capacitaciones
    .filter((c) => c.estado === "invitado" || c.estado === "confirmado")
    .slice(0, 5);
  // Mostrar las comunicaciones recientes (las lecturas se registran en tabla separada)
  const recentCommunications = comunicaciones.slice(0, 5);

  const hasNotifications = unreadMessages.length > 0 || recentTrainingInvitations.length > 0 || recentCommunications.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Centro de Notificaciones
              </CardTitle>
              <CardDescription className="text-sm">
                Mensajes, invitaciones y comunicaciones pendientes
              </CardDescription>
            </div>
            {unreadMessages.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar todo como leído
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasNotifications ? (
            <EmptyState
              icon={Inbox}
              title="Sin notificaciones pendientes"
              description="No tienes mensajes, invitaciones o comunicaciones pendientes. ¡Estás al día!"
            />
          ) : (
            <div className="space-y-6">
              {/* Mensajes Internos */}
              {unreadMessages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Mensajes Internos ({unreadMessages.length})
                  </h3>
                  <div className="space-y-2">
                    {unreadMessages.slice(0, 5).map((message) => (
                      <div 
                        key={message.id} 
                        className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                        data-testid={`notification-message-${message.id}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1" data-testid={`text-message-subject-${message.id}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.sender ? `De: ${message.sender.firstName ?? ''} ${message.sender.lastName ?? ''}`.trim() : ''} 
                            {message.createdAt && ` • ${format(new Date(message.createdAt), "d MMM yyyy, HH:mm", { locale: es })}`}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markAsReadMutation.mutate(message.id)}
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${message.id}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invitaciones a Capacitación */}
              {recentTrainingInvitations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Invitaciones a Capacitación ({recentTrainingInvitations.length})
                  </h3>
                  <div className="space-y-2">
                    {recentTrainingInvitations.map((cap) => (
                      <div 
                        key={cap.id} 
                        className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        data-testid={`notification-training-${cap.id}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1" data-testid={`text-training-title-${cap.id}`}>
                            {cap.tituloCurso}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(cap.fechaInicio), "d MMM yyyy", { locale: es })}
                            {cap.lugar && ` • ${cap.lugar}`}
                          </p>
                        </div>
                        <Badge className={cap.estado === "confirmado" ? "bg-green-600" : "bg-blue-600"}>
                          {cap.estado === "confirmado" ? "Confirmado" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comunicaciones SST */}
              {recentCommunications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Comunicaciones SST ({recentCommunications.length})
                  </h3>
                  <div className="space-y-2">
                    {recentCommunications.map((com) => (
                      <div 
                        key={com.id} 
                        className="flex items-start gap-3 p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                        data-testid={`notification-sst-${com.id}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1" data-testid={`text-sst-title-${com.id}`}>
                            {com.asunto}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {com.contenido}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {com.createdAt && format(new Date(com.createdAt), "d MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {com.tipo}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB: MI FOTO DE CARNET ====================

function MiFotoCarnetTab() {
  const { toast } = useToast();

  // Fetch current photo
  const { data: photoData, isLoading, refetch } = useQuery<{ photoUrl: string | null; workerName: string }>({
    queryKey: ["/api/portal/me/photo"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      
      const response = await fetch("/api/portal/me/photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la foto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Foto actualizada",
        description: "Tu foto de carnet ha sido actualizada correctamente",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/portal/me/photo"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/portal/me/photo", {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar la foto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Foto eliminada",
        description: "Tu foto de carnet ha sido eliminada",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/portal/me/photo"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Por favor selecciona una imagen (JPG o PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const isPending = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Mi Foto de Carnet</CardTitle>
              <CardDescription>
                Sube tu foto para el carnet de identificación de la empresa
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {/* Photo preview */}
              <div className="relative">
                <div className="w-40 h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30">
                  {photoData?.photoUrl ? (
                    <img 
                      src={photoData.photoUrl} 
                      alt="Mi foto de carnet"
                      className="w-full h-full object-cover"
                      data-testid="img-mi-foto-carnet"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">Sin foto</p>
                    </div>
                  )}
                </div>
                
                {isPending && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center max-w-md">
                <p className="text-sm text-muted-foreground">
                  La foto será utilizada en tu carnet de identificación. 
                  Asegúrate de que sea una foto reciente, con fondo claro y tu rostro visible.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="default"
                  disabled={isPending}
                  onClick={() => document.getElementById("photo-upload-input")?.click()}
                  data-testid="button-subir-foto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {photoData?.photoUrl ? "Cambiar foto" : "Subir foto"}
                </Button>
                
                {photoData?.photoUrl && (
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => deleteMutation.mutate()}
                    data-testid="button-eliminar-foto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                id="photo-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isPending}
              />

              {/* Tips */}
              <Card className="w-full max-w-md bg-muted/30 border-dashed">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Recomendaciones para tu foto:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Foto reciente (menos de 6 meses)</li>
                    <li>• Fondo claro y uniforme</li>
                    <li>• Rostro completamente visible</li>
                    <li>• Formato JPG o PNG (máx. 5MB)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB: CAMBIAR CONTRASEÑA ====================

function CambiarPasswordTab() {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/change-password", data),
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente. Por favor, inicia sesión nuevamente.",
        className: "bg-green-50 border-green-200",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    },
  });

  const onSubmitPassword = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
            <CardDescription className="text-sm">
              Actualiza la contraseña de tu cuenta para mayor seguridad
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        className="pr-10"
                        data-testid="input-current-password-tab"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-10"
                        data-testid="input-new-password-tab"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repite la nueva contraseña"
                        className="pr-10"
                        data-testid="input-confirm-password-tab"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
              data-testid="button-submit-change-password"
              className="w-full sm:w-auto"
            >
              {changePasswordMutation.isPending ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ==================== TAB: MIS DOCUMENTOS ====================

interface WorkerDocument {
  id: string;
  type: "contract" | "training_certificate" | "copasst_certificate" | "other";
  title: string;
  description?: string;
  date: string;
  url?: string;
  status?: string;
}

function MisDocumentosTab() {
  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ["/api/portal/my-contract"],
  });

  if (isLoading) {
    return <ListSkeletonLoading items={2} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Información Laboral
          </CardTitle>
          <CardDescription className="text-sm">
            Información de su vinculación laboral con la empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!contract ? (
            <EmptyState
              icon={FolderOpen}
              title="Sin información"
              description="No se encontró información de contrato laboral registrada."
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tipo de Contrato</p>
                    <p className="font-medium">{contract.contractType ?? 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Cargo</p>
                    <p className="font-medium">{contract.position ?? 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Departamento</p>
                    <p className="font-medium">{contract.department || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Fecha de Ingreso</p>
                    <p className="font-medium">
                      {contract.startDate ? format(new Date(contract.startDate), "d 'de' MMMM, yyyy", { locale: es }) : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Estado</p>
                    <Badge variant={contract.status === 'activo' ? 'default' : 'secondary'}>
                      {contract.status === 'activo' ? 'Activo' : contract.status === 'vencido' ? 'Vencido' : contract.status === 'terminado' ? 'Terminado' : contract.status === 'suspendido' ? 'Suspendido' : contract.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 3: MIS CAPACITACIONES ====================

interface WorkerCapacitacion {
  id: string;
  eventoId: string;
  tituloCurso: string;
  categoria: string;
  fechaInicio: string;
  fechaFin: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  lugar: string | null;
  instructor: string | null;
  duracionHoras: number | null;
  normativa: string | null;
  estado: string;
  asistenciaId: string;
  contentType: string | null;
  contentUrl: string | null;
  contentText: string | null;
}


interface AssignedDocument {
  assignmentId: string;
  documentId: string;
  title: string;
  code: string | null;
  category: string | null;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  assignedAt: string;
  dueDate: string | null;
  isRequired: boolean;
  priority: string;
  message: string | null;
  isAcknowledged: boolean;
  acknowledgedAt: string | null;
}

function MisCapacitacionesTab() {
  const { toast } = useToast();
  const [videoModal, setVideoModal] = useState<{ open: boolean; url: string; titulo: string }>({ open: false, url: "", titulo: "" });
  
  const { data: capacitaciones = [], isLoading } = useQuery<WorkerCapacitacion[]>({
    queryKey: ["/api/portal/mis-capacitaciones"],
  });
  
  const confirmarAsistenciaMutation = useMutation({
    mutationFn: (asistenciaId: string) =>
      apiRequest("POST", `/api/portal/capacitaciones/${asistenciaId}/confirmar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/mis-capacitaciones"] });
      toast({
        title: "Asistencia confirmada",
        description: "Ha confirmado su asistencia a esta capacitación",
        className: "bg-green-50 border-green-200",
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
  
  if (isLoading) {
    return <ListSkeletonLoading items={4} />;
  }
  
  const estadoLabels: Record<string, { label: string; color: string }> = {
    invitado: { label: "Invitado", color: "bg-blue-600" },
    confirmado: { label: "Confirmado", color: "bg-green-600" },
    asistio: { label: "Asistió", color: "bg-emerald-600" },
    ausente: { label: "Ausente", color: "bg-red-600" },
    excusado: { label: "Excusado", color: "bg-orange-600" },
  };
  
  const pendientes = capacitaciones.filter(c => c.estado === 'invitado' || c.estado === 'confirmado');
  const historial = capacitaciones.filter(c => c.estado === 'asistio' || c.estado === 'ausente' || c.estado === 'excusado');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Mis Capacitaciones Programadas
          </CardTitle>
          <CardDescription>
            Capacitaciones a las que ha sido invitado(a). Confirme su asistencia antes de la fecha programada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendientes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No tiene capacitaciones programadas en este momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendientes.map((cap) => {
                const estadoInfo = estadoLabels[cap.estado] || { label: cap.estado, color: "bg-gray-600" };
                const fechaEvento = new Date(cap.fechaInicio);
                // Consider event time for "future" check - if event has horaFin, use that; otherwise use end of day
                let fechaFinEvento = new Date(cap.fechaInicio);
                if (cap.horaFin) {
                  const [hh, mm] = cap.horaFin.split(':').map(Number);
                  fechaFinEvento.setHours(hh || 23, mm || 59, 59);
                } else if (cap.horaInicio) {
                  const [hh, mm] = cap.horaInicio.split(':').map(Number);
                  fechaFinEvento.setHours((hh || 0) + 2, mm || 0, 0); // Assume 2 hour duration
                } else {
                  fechaFinEvento.setHours(23, 59, 59);
                }
                const esFuturo = fechaFinEvento > new Date();
                
                return (
                  <Card key={cap.asistenciaId} data-testid={`card-capacitacion-${cap.asistenciaId}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{cap.tituloCurso}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(fechaEvento, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                            {cap.horaInicio && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {cap.horaInicio}{cap.horaFin ? ` - ${cap.horaFin}` : ''}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${estadoInfo.color} text-white`} data-testid={`badge-estado-${cap.asistenciaId}`}>
                            {estadoInfo.label}
                          </Badge>
                          {cap.estado === 'invitado' && esFuturo && (
                            <Button
                              size="sm"
                              onClick={() => confirmarAsistenciaMutation.mutate(cap.asistenciaId)}
                              disabled={confirmarAsistenciaMutation.isPending}
                              className="gap-1"
                              data-testid={`button-confirmar-header-${cap.asistenciaId}`}
                            >
                              <UserCheck className="h-4 w-4" />
                              {confirmarAsistenciaMutation.isPending ? "..." : "Confirmar"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {cap.lugar && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{cap.lugar}</span>
                          </div>
                        )}
                        {cap.instructor && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Instructor: {cap.instructor}</span>
                          </div>
                        )}
                        {cap.duracionHoras && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Duración: {cap.duracionHoras} horas</span>
                          </div>
                        )}
                        {cap.normativa && (
                          <div className="col-span-2 text-xs text-muted-foreground mt-1">
                            Normativa: {cap.normativa}
                          </div>
                        )}
                      </div>

                      {cap.estado === 'confirmado' && (
                        <div className="mt-4 pt-3 border-t">
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Usted ha confirmado asistencia a esta capacitación
                          </p>
                        </div>
                      )}
                      
                      {/* Banner de trazabilidad PESV para capacitaciones de seguridad vial */}
                      {cap.categoria === 'seguridad-vial' && (
                        <div className="mt-4 pt-3 border-t">
                          <TrazabilidadPesvBanner codigoPaso="H02" compacto={true} />
                        </div>
                      )}
                      {/* Contenido digital adjunto */}
                      {cap.contentType && cap.contentType !== "presencial" && (
                        <div className="mt-3 pt-3 border-t">
                          {cap.contentType === "video" && cap.contentUrl && (
                            <button
                              onClick={() => setVideoModal({ open: true, url: cap.contentUrl!, titulo: cap.tituloCurso })}
                              className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-red-700"
                              data-testid={`link-video-sst-${cap.asistenciaId}`}
                            >
                              <Play className="h-4 w-4" />
                              Ver Video
                            </button>
                          )}
                          {cap.contentType === "pdf" && cap.contentUrl && (
                            <a
                              href={cap.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-orange-700"
                              data-testid={`link-pdf-sst-${cap.asistenciaId}`}
                            >
                              <FileText className="h-4 w-4" />
                              Ver PDF
                            </a>
                          )}
                          {cap.contentType === "formulario" && cap.contentUrl && (
                            <a
                              href={cap.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-purple-700"
                              data-testid={`link-formulario-sst-${cap.asistenciaId}`}
                            >
                              <ClipboardList className="h-4 w-4" />
                              Completar Formulario
                            </a>
                          )}
                          {cap.contentType === "texto" && cap.contentText && (
                            <div className="bg-muted/40 rounded-md p-3 text-sm text-foreground whitespace-pre-wrap" data-testid={`text-contenido-sst-${cap.asistenciaId}`}>
                              {cap.contentText}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de Capacitaciones</CardTitle>
            <CardDescription>Capacitaciones completadas o pasadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historial.map((cap) => {
                const estadoInfo = estadoLabels[cap.estado] || { label: cap.estado, color: "bg-gray-600" };
                const esPesv = cap.categoria === 'seguridad-vial';
                return (
                  <div 
                    key={cap.asistenciaId} 
                    className="p-3 bg-muted/30 rounded-lg space-y-2"
                    data-testid={`historial-capacitacion-${cap.asistenciaId}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{cap.tituloCurso}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(cap.fechaInicio), "d MMM yyyy", { locale: es })}
                          {cap.duracionHoras && ` - ${cap.duracionHoras}h`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {esPesv && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            PESV
                          </Badge>
                        )}
                        <Badge className={`${estadoInfo.color} text-white`} data-testid={`badge-historial-estado-${cap.asistenciaId}`}>
                          {estadoInfo.label}
                        </Badge>
                      </div>
                    </div>
                    {esPesv && (
                      <TrazabilidadPesvBanner codigoPaso="H02" compacto={true} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Video SST */}
      <Dialog open={videoModal.open} onOpenChange={(open) => setVideoModal(v => ({ ...v, open }))}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Play className="h-4 w-4 text-red-500" />
              {videoModal.titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              key={videoModal.url}
              src={getEmbedUrl(videoModal.url)}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={videoModal.titulo}
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <a href={videoModal.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline">
              Abrir en nueva pestaña
            </a>
            <Button variant="outline" size="sm" onClick={() => setVideoModal(v => ({ ...v, open: false }))}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== TAB: MIS INDUCCIONES ====================

function MisInduccionesTab() {
  const { data: inducciones = [], isLoading } = useQuery<RegistroInduccion[]>({
    queryKey: ["/api/portal/mis-inducciones"],
  });

  if (isLoading) {
    return (
      <Card data-testid="loading-inducciones">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inducciones.length === 0) {
    return (
      <Card data-testid="empty-inducciones">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin registros de inducción</h3>
            <p className="text-muted-foreground">
              Aún no tiene inducciones registradas en el sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card data-testid="card-mis-inducciones">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Historial de Inducciones
          </CardTitle>
          <CardDescription>
            Registro de todas las inducciones y reinducciones que ha recibido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inducciones.map((induccion) => (
              <Card key={induccion.id} className="border" data-testid={`card-induccion-${induccion.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        className={induccion.tipo === 'induccion' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                        data-testid={`badge-tipo-${induccion.id}`}
                      >
                        {induccion.tipo === 'induccion' ? 'Inducción General' : 'Reinducción'}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(induccion.fecha).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {induccion.duracionMinutos && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {induccion.duracionMinutos} minutos
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Responsable:</p>
                      <p className="font-medium">{induccion.responsableNombre}</p>
                    </div>
                    {induccion.horaInicio && (
                      <div>
                        <p className="text-muted-foreground">Hora de inicio:</p>
                        <p className="font-medium">{induccion.horaInicio}</p>
                      </div>
                    )}
                    {induccion.cargoFuncion && (
                      <div>
                        <p className="text-muted-foreground">Cargo evaluado:</p>
                        <p className="font-medium">{induccion.cargoFuncion}</p>
                      </div>
                    )}
                    {induccion.observaciones && (
                      <div className="col-span-full">
                        <p className="text-muted-foreground">Observaciones:</p>
                        <p>{induccion.observaciones}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB: INDUCCIONES VIRTUALES ====================

function InduccionesVirtualesTab() {
  const { toast } = useToast();

  type SesionVirtual = {
    id: string;
    token: string;
    tipoInduccion: string;
    estado: string;
    fechaEnvio: string;
    fechaExpiracion: string;
    fechaInicio: string | null;
    fechaFinalizacion: string | null;
    puntajeEvaluacion: number | null;
    aprobado: number | null;
  };

  const { data: sesiones = [], isLoading } = useQuery<SesionVirtual[]>({
    queryKey: ["/api/portal/mis-inducciones-virtuales"],
  });

  if (isLoading) {
    return (
      <Card data-testid="loading-inducciones-virtuales">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendientes = sesiones.filter(s => s.estado === "pendiente" || s.estado === "en_progreso");
  const completadas = sesiones.filter(s => s.estado === "completada");
  const expiradas = sesiones.filter(s => s.estado === "expirada");

  if (sesiones.length === 0) {
    return (
      <Card data-testid="empty-inducciones-virtuales">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin inducciones virtuales</h3>
            <p className="text-muted-foreground">
              No tiene inducciones virtuales asignadas actualmente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendientes.length > 0 && (
        <Card data-testid="card-inducciones-pendientes">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Inducciones Pendientes
            </CardTitle>
            <CardDescription>
              Complete estas inducciones lo antes posible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendientes.map((sesion) => {
                const diasRestantes = Math.max(0, Math.ceil((new Date(sesion.fechaExpiracion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                return (
                  <Card key={sesion.id} className="border-amber-200 dark:border-amber-800" data-testid={`card-induccion-virtual-${sesion.id}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={sesion.tipoInduccion === 'induccion' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}>
                              {sesion.tipoInduccion === 'induccion' ? 'Inducción' : 'Reinducción'}
                            </Badge>
                            <Badge variant={sesion.estado === "en_progreso" ? "default" : "outline"}>
                              {sesion.estado === "en_progreso" ? "En Progreso" : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Asignada: {new Date(sesion.fechaEnvio).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {diasRestantes > 0 
                              ? `Expira en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}` 
                              : 'Expira hoy'}
                          </p>
                        </div>
                        <a href={`/induccion-virtual/${sesion.token}`} target="_blank" rel="noopener noreferrer">
                          <Button data-testid={`button-iniciar-induccion-${sesion.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            {sesion.estado === "en_progreso" ? "Continuar" : "Iniciar"}
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {completadas.length > 0 && (
        <Card data-testid="card-inducciones-completadas">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Inducciones Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completadas.map((sesion) => (
                <Card key={sesion.id} className="border" data-testid={`card-induccion-completada-${sesion.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {sesion.tipoInduccion === 'induccion' ? 'Inducción' : 'Reinducción'}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completada
                          </Badge>
                          {sesion.puntajeEvaluacion !== null && (
                            <Badge className={sesion.aprobado 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}>
                              {sesion.puntajeEvaluacion}% - {sesion.aprobado ? "Aprobado" : "No aprobado"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completada: {sesion.fechaFinalizacion ? new Date(sesion.fechaFinalizacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {expiradas.length > 0 && (
        <Card data-testid="card-inducciones-expiradas">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Inducciones Expiradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiradas.map((sesion) => (
                <Card key={sesion.id} className="border opacity-60" data-testid={`card-induccion-expirada-${sesion.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {sesion.tipoInduccion === 'induccion' ? 'Inducción' : 'Reinducción'}
                        </Badge>
                        <Badge variant="secondary">Expirada</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expiró: {new Date(sesion.fechaExpiracion).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== TAB 4: COMUNICACIONES RECIBIDAS ====================

type ComunicacionConLectura = ComunicacionSst & { fechaLecturaConfirmada: Date | string | null };

function ComunicacionesTab() {
  const { toast } = useToast();
  const { data: comunicaciones = [], isLoading } = useQuery<ComunicacionConLectura[]>({
    queryKey: ["/api/comunicacion-sst/mis-comunicaciones"],
    refetchInterval: 60000,
  });

  const marcarLeidaMutation = useMutation({
    mutationFn: (comunicacionId: string) =>
      apiRequest("POST", `/api/comunicacion-sst/comunicaciones/${comunicacionId}/lectura`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/mis-comunicaciones"] });
      toast({
        title: "Lectura confirmada",
        description: "Ha confirmado la lectura de esta comunicación",
      });
    },
  });

  const handleMarcarLeida = (comunicacionId: string) => {
    marcarLeidaMutation.mutate(comunicacionId);
  };

  if (isLoading) {
    return <ListSkeletonLoading items={4} />;
  }

  const pendientes = comunicaciones.filter(c => !c.fechaLecturaConfirmada);
  const leidas = comunicaciones.filter(c => c.fechaLecturaConfirmada);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Comunicaciones SST Recibidas</CardTitle>
        <CardDescription className="text-sm">
          Comunicaciones importantes sobre seguridad y salud en el trabajo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {comunicaciones.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Sin comunicaciones"
            description="No hay comunicaciones SST disponibles en este momento. Las comunicaciones importantes aparecerán aquí."
          />
        ) : (
          <div className="space-y-6">
            {pendientes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Pendientes de confirmar ({pendientes.length})
                </h3>
                {pendientes.map((com) => (
                  <Card key={com.id} className="border-amber-200 dark:border-amber-800" data-testid={`card-comunicacion-${com.id}`}>
                    <CardHeader className="pb-2 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start sm:items-center gap-2 mb-1">
                            <CardTitle className="text-sm sm:text-base">{com.asunto}</CardTitle>
                            <Badge variant="outline" className="text-xs">{com.tipo}</Badge>
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                              Pendiente
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            Enviado el {format(new Date(com.fechaEnvio), "PPP", { locale: es })}
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarcarLeida(com.id)}
                          disabled={marcarLeidaMutation.isPending}
                          data-testid={`button-marcar-leida-${com.id}`}
                          className="self-end sm:self-start gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Confirmar lectura</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">{com.contenido}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {leidas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Confirmadas ({leidas.length})
                </h3>
                {leidas.map((com) => (
                  <Card key={com.id} className="border-green-200 dark:border-green-800 opacity-80" data-testid={`card-comunicacion-${com.id}`}>
                    <CardHeader className="pb-2 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start sm:items-center gap-2 mb-1">
                            <CardTitle className="text-sm sm:text-base">{com.asunto}</CardTitle>
                            <Badge variant="outline" className="text-xs">{com.tipo}</Badge>
                            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Confirmado
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            Enviado el {format(new Date(com.fechaEnvio), "PPP", { locale: es })}
                            {com.fechaLecturaConfirmada && (
                              <span className="ml-2">
                                | Leído el {format(new Date(com.fechaLecturaConfirmada), "PPP", { locale: es })}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="self-end sm:self-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500" data-testid={`icon-leida-${com.id}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">{com.contenido}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB 4: REPORTAR ====================

function ReportarTab() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InsertReporteTrabajador>({
    resolver: zodResolver(insertReporteTrabajadorSchema),
    defaultValues: {
      categoria: "peligro",
      prioridad: "media",
      asunto: "",
      descripcion: "",
      ubicacion: "",
      esAnonimo: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertReporteTrabajador) => {
      const response = await apiRequest("POST", "/api/comunicacion-sst/reportes", data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || "Error al enviar el reporte");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/mis-reportes"] });
      toast({ 
        title: "Reporte enviado exitosamente", 
        description: "El equipo SST revisará su reporte y le responderá a la brevedad",
        className: "bg-yellow-50 border-yellow-200" 
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Error al enviar reporte:", error);
      toast({ 
        title: "Error al enviar el reporte", 
        description: error.message || "Hubo un problema al enviar su reporte. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (data: InsertReporteTrabajador) => {
    createMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Reportar Inquietud, Peligro o Sugerencia</CardTitle>
        <CardDescription className="text-sm">
          Utilice este formulario para reportar cualquier situación de riesgo, hacer sugerencias o consultas sobre SST
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-medium text-sm mb-2">¿Qué puede reportar?</h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <li>• <strong>Peligros:</strong> Condiciones inseguras, equipos dañados</li>
            <li>• <strong>Sugerencias:</strong> Ideas para mejorar la seguridad</li>
            <li>• <strong>Quejas:</strong> Situaciones que afecten su bienestar</li>
            <li>• <strong>Consultas:</strong> Dudas sobre procedimientos SST</li>
          </ul>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-categoria">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="peligro">Peligro o Riesgo</SelectItem>
                        <SelectItem value="sugerencia">Sugerencia de Mejora</SelectItem>
                        <SelectItem value="queja">Queja o Reclamo</SelectItem>
                        <SelectItem value="consulta">Consulta o Pregunta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-prioridad">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baja">Baja - Puede esperar</SelectItem>
                        <SelectItem value="media">Media - Normal</SelectItem>
                        <SelectItem value="alta">Alta - Importante</SelectItem>
                        <SelectItem value="urgente">Urgente - Riesgo Inmediato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="asunto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ej: Escalera dañada en área de producción" 
                      data-testid="input-asunto" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Detallada</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={6} 
                      placeholder="Describa la situación con el mayor detalle posible..." 
                      data-testid="input-descripcion" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ""}
                      placeholder="Ej: Planta 2, Área de empaque" 
                      data-testid="input-ubicacion" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="esAnonimo"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value === 1}
                        onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                        data-testid="checkbox-anonimo"
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Enviar reporte de forma anónima</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                data-testid="button-limpiar"
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-enviar-reporte"
              >
                <Send className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Enviando..." : "Enviar Reporte"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ==================== TAB 5: MIS REPORTES ====================

function MisReportesTab() {
  const { data: reportes = [], isLoading } = useQuery<ReporteTrabajador[]>({
    queryKey: ["/api/comunicacion-sst/mis-reportes"],
    refetchInterval: 60000, // Refrescar cada minuto para ver respuestas del equipo SST
  });

  if (isLoading) {
    return <ListSkeletonLoading items={3} />;
  }

  const reportesPendientes = reportes.filter(r => r.estado === "pendiente" || r.estado === "en_revision");
  const reportesRespondidos = reportes.filter(r => r.estado === "resuelto" || r.estado === "cerrado");

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Mis Reportes SST</CardTitle>
        <CardDescription className="text-sm">
          Estado y seguimiento de sus reportes enviados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">En Proceso</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold" data-testid="stat-mis-reportes-pendientes">
                {reportesPendientes.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Respondidos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold" data-testid="stat-mis-reportes-respondidos">
                {reportesRespondidos.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {reportes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Sin reportes"
            description="No ha enviado reportes aún. Utilice la pestaña 'Reportar' para enviar su primer reporte sobre seguridad, sugerencias o consultas."
          />
        ) : (
          <div className="space-y-3">
            {reportes.map((reporte) => (
              <Card key={reporte.id} data-testid={`card-reporte-${reporte.id}`}>
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-start sm:items-center gap-2">
                        <CardTitle className="text-sm sm:text-base">{reporte.asunto}</CardTitle>
                        <Badge 
                          variant={(reporte.estado === "resuelto" || reporte.estado === "cerrado") ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {reporte.estado === "pendiente" && "Pendiente"}
                          {reporte.estado === "en_revision" && "En Revisión"}
                          {reporte.estado === "resuelto" && "Resuelto"}
                          {reporte.estado === "cerrado" && "Cerrado"}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {reporte.categoria} • {format(new Date(reporte.createdAt), "d MMM yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{reporte.descripcion}</p>
                  </div>
                  {reporte.respuesta && (
                    <div className="border-l-2 border-primary pl-3 bg-primary/5 p-3 rounded-r">
                      <p className="text-sm font-medium text-primary mb-1">Respuesta del equipo SST:</p>
                      <p className="text-sm">{reporte.respuesta}</p>
                      {reporte.fechaRespuesta && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Respondido el {format(new Date(reporte.fechaRespuesta), "PPP", { locale: es })}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB: CURSOS VIRTUALES (COPASST) ====================

interface CursoVirtual {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  duracionMinutos: number;
  ordenCurso: number;
  esObligatorio: boolean;
  puntosCompletar: number;
  activo: boolean;
}

interface ProgresoUsuario {
  cursoId: string;
  progreso: number;
  completado: boolean;
  puntosObtenidos: number;
}

interface EvsActivityPortal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
  modality: string | null;
  meetingLink: string | null;
  facilitatorName: string;
  status: string;
}

const EVS_CATEGORY_LABELS: Record<string, string> = {
  tabaquismo: "Prevención del Tabaquismo",
  alcoholismo: "Prevención del Alcoholismo",
  drogadiccion: "Prevención de Drogadicción",
  actividad_fisica: "Actividad Física",
  alimentacion_saludable: "Alimentación Saludable",
  salud_mental: "Salud Mental",
  prevencion_riesgo_cardiovascular: "Riesgo Cardiovascular",
  otro: "Otro",
};

function EvsActivityCard({ activity }: { activity: EvsActivityPortal }) {
  const categoryLabel = EVS_CATEGORY_LABELS[activity.category] || activity.category;
  const scheduledDate = new Date(activity.scheduledDate + "T00:00:00");
  const dateStr = scheduledDate.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  
  return (
    <Card className="hover-elevate transition-all border-pink-200 dark:border-pink-800" data-testid={`card-evs-activity-${activity.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{activity.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {activity.description || categoryLabel}
            </CardDescription>
          </div>
          <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 text-xs flex-shrink-0">
            {activity.modality === "virtual" ? "Virtual" : "Mixta"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateStr}
          </span>
          {activity.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {activity.startTime}{activity.endTime ? ` - ${activity.endTime}` : ""}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {activity.facilitatorName ?? ''}
          </span>
        </div>

        {activity.meetingLink ? (
          <a href={activity.meetingLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full" data-testid={`button-join-evs-${activity.id}`}>
              <Video className="h-4 w-4 mr-2" />
              Unirse a la Reunión
            </Button>
          </a>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            <Video className="h-4 w-4 mr-2" />
            Enlace pendiente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB: ELECCIONES COPASST ====================

interface CandidatoConInfo {
  id: string;
  eleccionId: string;
  workerId: string;
  fechaInscripcion: string;
  propuestas: string | null;
  aceptaCandidatura: boolean | null;
  estado: string;
  votosObtenidos: number | null;
  ordenEleccion: number | null;
  createdAt: Date | null;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string | null;
    position: string | null;
    department: string | null;
  } | null;
}

interface EleccionData {
  id: string;
  companyId: string;
  periodoId: string | null;
  fechaConvocatoria: string;
  fechaInicioInscripcion: string;
  fechaFinInscripcion: string;
  fechaVotacion: string;
  horaInicioVotacion: string | null;
  horaFinVotacion: string | null;
  estado: string;
  totalTrabajadores: number;
  principalesRequeridos: number;
  suplentesRequeridos: number;
  totalVotantes: number | null;
  votosValidos: number | null;
  votosNulos: number | null;
  votosEnBlanco: number | null;
  convocatoriaUrl: string | null;
  actaEscrutinioUrl: string | null;
  observaciones: string | null;
  createdAt: Date | null;
}

function EleccionesCopasstTab() {
  const { toast } = useToast();
  const [selectedCandidatos, setSelectedCandidatos] = useState<string[]>([]);
  const [propuestas, setPropuestas] = useState("");
  const [showPostularseForm, setShowPostularseForm] = useState(false);

  // Fetch active election
  const { data: eleccionData, isLoading: isLoadingEleccion, refetch: refetchEleccion } = useQuery<{ eleccion: EleccionData | null }>({
    queryKey: ["/api/portal/copasst/eleccion-activa"],
  });

  const eleccion = eleccionData?.eleccion;

  // Fetch candidates (only if election exists)
  const { data: candidatosData, isLoading: isLoadingCandidatos, refetch: refetchCandidatos } = useQuery<{ candidatos: CandidatoConInfo[] }>({
    queryKey: ["/api/portal/copasst/candidatos", eleccion?.id],
    enabled: !!eleccion?.id,
  });

  const candidatos = candidatosData?.candidatos || [];

  // Check if worker already voted
  const { data: miVotoData, refetch: refetchMiVoto } = useQuery<{ yaVoto: boolean }>({
    queryKey: ["/api/portal/copasst/mi-voto", eleccion?.id],
    enabled: !!eleccion?.id && eleccion?.estado === 'votacion',
  });

  const yaVoto = miVotoData?.yaVoto || false;

  // Fetch results (only in escrutinio/completada phase)
  const { data: resultadosData, isLoading: isLoadingResultados } = useQuery<{ 
    eleccion: EleccionData; 
    resultados: CandidatoConInfo[];
    totalVotantes: number;
    votosValidos: number;
  }>({
    queryKey: ["/api/portal/copasst/resultados", eleccion?.id],
    enabled: !!eleccion?.id && ['escrutinio', 'completada'].includes(eleccion?.estado || ''),
  });

  // Mutation: Postularse como candidato
  const postularseMutation = useMutation({
    mutationFn: async (data: { eleccionId: string; propuestas: string }) => {
      const response = await apiRequest("POST", "/api/portal/copasst/postularse", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Inscripción exitosa", description: "Te has inscrito como candidato correctamente" });
      setShowPostularseForm(false);
      setPropuestas("");
      refetchCandidatos();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al inscribirse como candidato", variant: "destructive" });
    }
  });

  // Mutation: Emitir voto
  const votarMutation = useMutation({
    mutationFn: async (data: { eleccionId: string; candidatoIds: string[] }) => {
      const response = await apiRequest("POST", "/api/portal/copasst/votar", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Voto registrado", description: "Tu voto ha sido registrado exitosamente. Gracias por participar." });
      setSelectedCandidatos([]);
      refetchMiVoto();
      refetchCandidatos();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al registrar el voto", variant: "destructive" });
    }
  });

  const handleCandidatoSelect = (candidatoId: string) => {
    if (!eleccion) return;
    const maxSeleccion = (eleccion.principalesRequeridos || 0) + (eleccion.suplentesRequeridos || 0);
    
    setSelectedCandidatos(prev => {
      if (prev.includes(candidatoId)) {
        return prev.filter(id => id !== candidatoId);
      }
      if (prev.length >= maxSeleccion) {
        toast({ title: "Límite alcanzado", description: `Solo puedes seleccionar hasta ${maxSeleccion} candidatos`, variant: "destructive" });
        return prev;
      }
      return [...prev, candidatoId];
    });
  };

  const handlePostularse = () => {
    if (!eleccion?.id) return;
    postularseMutation.mutate({
      eleccionId: eleccion.id,
      propuestas: propuestas.trim()
    });
  };

  const handleVotar = () => {
    if (!eleccion?.id || selectedCandidatos.length === 0) return;
    votarMutation.mutate({
      eleccionId: eleccion.id,
      candidatoIds: selectedCandidatos
    });
  };

  const getEstadoBadge = (estado: string) => {
    const estadoConfig: Record<string, { label: string; className: string }> = {
      convocatoria: { label: "Convocatoria", className: "bg-blue-600" },
      inscripcion: { label: "Inscripción", className: "bg-yellow-600" },
      votacion: { label: "Votación", className: "bg-green-600" },
      escrutinio: { label: "Escrutinio", className: "bg-purple-600" },
      completada: { label: "Completada", className: "bg-gray-600" }
    };
    const config = estadoConfig[estado] || { label: estado, className: "bg-gray-600" };
    return <Badge className={config.className} data-testid="badge-election-status">{config.label}</Badge>;
  };

  if (isLoadingEleccion) {
    return <CardSkeletonLoading rows={5} />;
  }

  if (!eleccion) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={Vote}
            title="No hay elecciones activas"
            description="Actualmente no hay procesos electorales COPASST en curso para tu empresa. Cuando se inicie un proceso electoral, podrás participar desde aquí."
          />
        </CardContent>
      </Card>
    );
  }

  const maxSeleccion = (eleccion.principalesRequeridos || 0) + (eleccion.suplentesRequeridos || 0);

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl" data-testid="text-election-title">
                Elecciones COPASST {new Date(eleccion.fechaConvocatoria).getFullYear()}
              </CardTitle>
              <CardDescription className="text-sm">
                Representantes de los trabajadores al Comité Paritario de Seguridad y Salud en el Trabajo
              </CardDescription>
            </div>
            {getEstadoBadge(eleccion.estado)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg border ${eleccion.estado === 'convocatoria' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Convocatoria</p>
              <p className="text-sm font-semibold" data-testid="text-fecha-convocatoria">
                {format(new Date(eleccion.fechaConvocatoria + 'T12:00:00'), "d MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${eleccion.estado === 'inscripcion' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Inscripción</p>
              <p className="text-sm font-semibold" data-testid="text-fecha-inscripcion">
                {format(new Date(eleccion.fechaInicioInscripcion + 'T12:00:00'), "d MMM", { locale: es })} - {format(new Date(eleccion.fechaFinInscripcion + 'T12:00:00'), "d MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${eleccion.estado === 'votacion' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Votación</p>
              <p className="text-sm font-semibold" data-testid="text-fecha-votacion">
                {format(new Date(eleccion.fechaVotacion + 'T12:00:00'), "d MMM yyyy", { locale: es })}
              </p>
              {eleccion.horaInicioVotacion && eleccion.horaFinVotacion && (
                <p className="text-xs text-muted-foreground">{eleccion.horaInicioVotacion} - {eleccion.horaFinVotacion}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg border ${['escrutinio', 'completada'].includes(eleccion.estado) ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Escrutinio</p>
              <p className="text-sm font-semibold">
                {['escrutinio', 'completada'].includes(eleccion.estado) ? 'Disponible' : 'Pendiente'}
              </p>
            </div>
          </div>

          {/* Download PDF - Convocatoria phase */}
          {eleccion.convocatoriaUrl && (
            <div className="pt-2">
              <a 
                href={eleccion.convocatoriaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-download-convocatoria"
              >
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar Convocatoria (PDF)
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inscripción Phase - Postularse */}
      {eleccion.estado === 'inscripcion' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inscripción de Candidatos</CardTitle>
            <CardDescription>
              Período de inscripción abierto. Si deseas participar como candidato, inscríbete aquí.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPostularseForm ? (
              <Button 
                onClick={() => setShowPostularseForm(true)}
                data-testid="button-postularse"
              >
                <Users className="h-4 w-4 mr-2" />
                Inscribirme como Candidato
              </Button>
            ) : (
              <div className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Propuestas (opcional)
                  </label>
                  <Textarea
                    placeholder="Describe brevemente tus propuestas para mejorar la seguridad y salud en el trabajo..."
                    value={propuestas}
                    onChange={(e) => setPropuestas(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-propuestas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo 500 caracteres. Estas propuestas serán visibles para todos los trabajadores.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePostularse}
                    disabled={postularseMutation.isPending}
                    data-testid="button-confirmar-inscripcion"
                  >
                    {postularseMutation.isPending ? "Inscribiendo..." : "Confirmar Inscripción"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setShowPostularseForm(false); setPropuestas(""); }}
                    data-testid="button-cancelar-inscripcion"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Candidatos List */}
      {['inscripcion', 'votacion'].includes(eleccion.estado) && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Candidatos Inscritos</CardTitle>
                <CardDescription>
                  {eleccion.estado === 'votacion' 
                    ? `Selecciona hasta ${maxSeleccion} candidatos (${eleccion.principalesRequeridos ?? 0} principales + ${eleccion.suplentesRequeridos ?? 0} suplentes)`
                    : `${candidatos.length} candidato(s) inscrito(s)`
                  }
                </CardDescription>
              </div>
              {eleccion.estado === 'votacion' && yaVoto && (
                <Badge className="bg-green-600 self-start" data-testid="badge-ya-voto">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ya votaste
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCandidatos ? (
              <p className="text-center py-4 text-muted-foreground">Cargando candidatos...</p>
            ) : candidatos.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No hay candidatos inscritos aún.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidatos.map((candidato) => (
                    <div
                      key={candidato.id}
                      className={`p-4 border rounded-lg ${
                        eleccion.estado === 'votacion' && !yaVoto
                          ? selectedCandidatos.includes(candidato.id)
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'hover-elevate cursor-pointer'
                          : ''
                      }`}
                      onClick={() => eleccion.estado === 'votacion' && !yaVoto && handleCandidatoSelect(candidato.id)}
                      data-testid={`card-candidato-${candidato.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {eleccion.estado === 'votacion' && !yaVoto && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                            selectedCandidatos.includes(candidato.id) 
                              ? 'border-green-500 bg-green-500 text-white' 
                              : 'border-muted-foreground'
                          }`}>
                            {selectedCandidatos.includes(candidato.id) && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" data-testid={`text-candidato-nombre-${candidato.id}`}>
                            {candidato.worker?.firstName ?? ''} {candidato.worker?.lastName ?? ''}
                          </p>
                          {candidato.worker?.position && (
                            <p className="text-sm text-muted-foreground">
                              {candidato.worker.position ?? ''}
                              {candidato.worker.department && ` - ${candidato.worker.department}`}
                            </p>
                          )}
                          {candidato.propuestas && (
                            <p className="text-sm mt-2 text-muted-foreground italic">
                              "{candidato.propuestas}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vote Button */}
                {eleccion.estado === 'votacion' && !yaVoto && (
                  <div className="pt-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Seleccionados: {selectedCandidatos.length} de {maxSeleccion}
                      </p>
                      <Button
                        onClick={handleVotar}
                        disabled={selectedCandidatos.length === 0 || votarMutation.isPending}
                        data-testid="button-emitir-voto"
                      >
                        {votarMutation.isPending ? "Registrando voto..." : "Emitir mi Voto"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultados - Escrutinio/Completada Phase */}
      {['escrutinio', 'completada'].includes(eleccion.estado) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados de la Elección</CardTitle>
            <CardDescription>
              {resultadosData ? (
                `${resultadosData.totalVotantes || 0} trabajadores participaron en la votación`
              ) : (
                "Cargando resultados..."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingResultados ? (
              <p className="text-center py-4 text-muted-foreground">Cargando resultados...</p>
            ) : resultadosData?.resultados && resultadosData.resultados.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {resultadosData.resultados.map((candidato, index) => {
                    const esPrincipal = index < (eleccion.principalesRequeridos || 0);
                    const esSuplente = !esPrincipal && index < maxSeleccion;
                    return (
                      <div
                        key={candidato.id}
                        className={`p-4 border rounded-lg flex items-center justify-between ${
                          esPrincipal ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                          esSuplente ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''
                        }`}
                        data-testid={`row-resultado-${candidato.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-resultado-nombre-${candidato.id}`}>
                              {candidato.worker?.firstName ?? ''} {candidato.worker?.lastName ?? ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {candidato.worker?.position ?? ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" data-testid={`text-votos-${candidato.id}`}>
                            {candidato.votosObtenidos || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">votos</p>
                          {(esPrincipal || esSuplente) && (
                            <Badge className={esPrincipal ? "bg-green-600" : "bg-yellow-600"} data-testid={`badge-electo-${candidato.id}`}>
                              {esPrincipal ? 'Principal' : 'Suplente'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {eleccion.actaEscrutinioUrl && (
                  <div className="pt-4">
                    <a 
                      href={eleccion.actaEscrutinioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-download-acta"
                    >
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Descargar Acta de Escrutinio (PDF)
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No hay resultados disponibles.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EleccionesConvivenciaTab() {
  const { toast } = useToast();
  const [selectedCandidatos, setSelectedCandidatos] = useState<string[]>([]);
  const [propuestas, setPropuestas] = useState("");
  const [showPostularseForm, setShowPostularseForm] = useState(false);

  // Fetch active election
  const { data: eleccionData, isLoading: isLoadingEleccion, refetch: refetchEleccion } = useQuery<{ eleccion: EleccionData | null }>({
    queryKey: ["/api/portal/convivencia/eleccion-activa"],
  });

  const eleccion = eleccionData?.eleccion;

  // Fetch candidates (only if election exists)
  const { data: candidatosData, isLoading: isLoadingCandidatos, refetch: refetchCandidatos } = useQuery<{ candidatos: CandidatoConInfo[] }>({
    queryKey: ["/api/portal/convivencia/candidatos", eleccion?.id],
    enabled: !!eleccion?.id,
  });

  const candidatos = candidatosData?.candidatos || [];

  // Check if worker already voted
  const { data: miVotoData, refetch: refetchMiVoto } = useQuery<{ yaVoto: boolean }>({
    queryKey: ["/api/portal/convivencia/mi-voto", eleccion?.id],
    enabled: !!eleccion?.id && eleccion?.estado === 'votacion',
  });

  const yaVoto = miVotoData?.yaVoto || false;

  // Fetch results (only in escrutinio/completada phase)
  const { data: resultadosData, isLoading: isLoadingResultados } = useQuery<{ 
    eleccion: EleccionData; 
    resultados: CandidatoConInfo[];
    totalVotantes: number;
    votosValidos: number;
  }>({
    queryKey: ["/api/portal/convivencia/resultados", eleccion?.id],
    enabled: !!eleccion?.id && ['escrutinio', 'completada'].includes(eleccion?.estado || ''),
  });

  // Mutation: Postularse como candidato
  const postularseMutation = useMutation({
    mutationFn: async (data: { eleccionId: string; propuestas: string }) => {
      const response = await apiRequest("POST", "/api/portal/convivencia/postularse", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Inscripción exitosa", description: "Te has inscrito como candidato correctamente" });
      setShowPostularseForm(false);
      setPropuestas("");
      refetchCandidatos();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al inscribirse como candidato", variant: "destructive" });
    }
  });

  // Mutation: Emitir voto
  const votarMutation = useMutation({
    mutationFn: async (data: { eleccionId: string; candidatoIds: string[] }) => {
      const response = await apiRequest("POST", "/api/portal/convivencia/votar", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Voto registrado", description: "Tu voto ha sido registrado exitosamente. Gracias por participar." });
      setSelectedCandidatos([]);
      refetchMiVoto();
      refetchCandidatos();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al registrar el voto", variant: "destructive" });
    }
  });

  const handleCandidatoSelect = (candidatoId: string) => {
    if (!eleccion) return;
    const maxSeleccion = (eleccion.principalesRequeridos || 0) + (eleccion.suplentesRequeridos || 0);
    
    setSelectedCandidatos(prev => {
      if (prev.includes(candidatoId)) {
        return prev.filter(id => id !== candidatoId);
      }
      if (prev.length >= maxSeleccion) {
        toast({ title: "Límite alcanzado", description: `Solo puedes seleccionar hasta ${maxSeleccion} candidatos`, variant: "destructive" });
        return prev;
      }
      return [...prev, candidatoId];
    });
  };

  const handlePostularse = () => {
    if (!eleccion?.id) return;
    postularseMutation.mutate({
      eleccionId: eleccion.id,
      propuestas: propuestas.trim()
    });
  };

  const handleVotar = () => {
    if (!eleccion?.id || selectedCandidatos.length === 0) return;
    votarMutation.mutate({
      eleccionId: eleccion.id,
      candidatoIds: selectedCandidatos
    });
  };

  const getEstadoBadge = (estado: string) => {
    const estadoConfig: Record<string, { label: string; className: string }> = {
      convocatoria: { label: "Convocatoria", className: "bg-blue-600" },
      inscripcion: { label: "Inscripción", className: "bg-yellow-600" },
      votacion: { label: "Votación", className: "bg-green-600" },
      escrutinio: { label: "Escrutinio", className: "bg-purple-600" },
      completada: { label: "Completada", className: "bg-gray-600" }
    };
    const config = estadoConfig[estado] || { label: estado, className: "bg-gray-600" };
    return <Badge className={config.className} data-testid="badge-election-status">{config.label}</Badge>;
  };

  if (isLoadingEleccion) {
    return <CardSkeletonLoading rows={5} />;
  }

  if (!eleccion) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={Vote}
            title="No hay elecciones activas"
            description="Actualmente no hay procesos electorales del Comité de Convivencia Laboral en curso para tu empresa. Cuando se inicie un proceso electoral, podrás participar desde aquí."
          />
        </CardContent>
      </Card>
    );
  }

  const maxSeleccion = (eleccion.principalesRequeridos || 0) + (eleccion.suplentesRequeridos || 0);

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl" data-testid="text-election-title">
                Elecciones Convivencia {new Date(eleccion.fechaConvocatoria).getFullYear()}
              </CardTitle>
              <CardDescription className="text-sm">
                Representantes de los trabajadores al Comité de Convivencia Laboral
              </CardDescription>
            </div>
            {getEstadoBadge(eleccion.estado)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg border ${eleccion.estado === 'convocatoria' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Convocatoria</p>
              <p className="text-sm font-semibold" data-testid="text-fecha-convocatoria">
                {format(new Date(eleccion.fechaConvocatoria + 'T12:00:00'), "d MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${eleccion.estado === 'inscripcion' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Inscripción</p>
              <p className="text-sm font-semibold" data-testid="text-fecha-inscripcion">
                {format(new Date(eleccion.fechaInicioInscripcion + 'T12:00:00'), "d MMM", { locale: es })} - {format(new Date(eleccion.fechaFinInscripcion + 'T12:00:00'), "d MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${eleccion.estado === 'votacion' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Votación</p>
              <p className="text-sm font-semibold" data-testid="text-fecha-votacion">
                {format(new Date(eleccion.fechaVotacion + 'T12:00:00'), "d MMM yyyy", { locale: es })}
              </p>
              {eleccion.horaInicioVotacion && eleccion.horaFinVotacion && (
                <p className="text-xs text-muted-foreground">{eleccion.horaInicioVotacion} - {eleccion.horaFinVotacion}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg border ${['escrutinio', 'completada'].includes(eleccion.estado) ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-border'}`}>
              <p className="text-xs text-muted-foreground font-medium">Escrutinio</p>
              <p className="text-sm font-semibold">
                {['escrutinio', 'completada'].includes(eleccion.estado) ? 'Disponible' : 'Pendiente'}
              </p>
            </div>
          </div>

          {/* Download PDF - Convocatoria phase */}
          {eleccion.convocatoriaUrl && (
            <div className="pt-2">
              <a 
                href={eleccion.convocatoriaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-download-convocatoria"
              >
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar Convocatoria (PDF)
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inscripción Phase - Postularse */}
      {eleccion.estado === 'inscripcion' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inscripción de Candidatos</CardTitle>
            <CardDescription>
              Período de inscripción abierto. Si deseas participar como candidato, inscríbete aquí.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPostularseForm ? (
              <Button 
                onClick={() => setShowPostularseForm(true)}
                data-testid="button-postularse"
              >
                <Users className="h-4 w-4 mr-2" />
                Inscribirme como Candidato
              </Button>
            ) : (
              <div className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Propuestas (opcional)
                  </label>
                  <Textarea
                    placeholder="Describe brevemente tus propuestas para mejorar la seguridad y salud en el trabajo..."
                    value={propuestas}
                    onChange={(e) => setPropuestas(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-propuestas"
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo 500 caracteres. Estas propuestas serán visibles para todos los trabajadores.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePostularse}
                    disabled={postularseMutation.isPending}
                    data-testid="button-confirmar-inscripcion"
                  >
                    {postularseMutation.isPending ? "Inscribiendo..." : "Confirmar Inscripción"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setShowPostularseForm(false); setPropuestas(""); }}
                    data-testid="button-cancelar-inscripcion"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Candidatos List */}
      {['inscripcion', 'votacion'].includes(eleccion.estado) && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Candidatos Inscritos</CardTitle>
                <CardDescription>
                  {eleccion.estado === 'votacion' 
                    ? `Selecciona hasta ${maxSeleccion} candidatos (${eleccion.principalesRequeridos ?? 0} principales + ${eleccion.suplentesRequeridos ?? 0} suplentes)`
                    : `${candidatos.length} candidato(s) inscrito(s)`
                  }
                </CardDescription>
              </div>
              {eleccion.estado === 'votacion' && yaVoto && (
                <Badge className="bg-green-600 self-start" data-testid="badge-ya-voto">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ya votaste
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCandidatos ? (
              <p className="text-center py-4 text-muted-foreground">Cargando candidatos...</p>
            ) : candidatos.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No hay candidatos inscritos aún.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidatos.map((candidato) => (
                    <div
                      key={candidato.id}
                      className={`p-4 border rounded-lg ${
                        eleccion.estado === 'votacion' && !yaVoto
                          ? selectedCandidatos.includes(candidato.id)
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'hover-elevate cursor-pointer'
                          : ''
                      }`}
                      onClick={() => eleccion.estado === 'votacion' && !yaVoto && handleCandidatoSelect(candidato.id)}
                      data-testid={`card-candidato-${candidato.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {eleccion.estado === 'votacion' && !yaVoto && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                            selectedCandidatos.includes(candidato.id) 
                              ? 'border-green-500 bg-green-500 text-white' 
                              : 'border-muted-foreground'
                          }`}>
                            {selectedCandidatos.includes(candidato.id) && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" data-testid={`text-candidato-nombre-${candidato.id}`}>
                            {candidato.worker?.firstName ?? ''} {candidato.worker?.lastName ?? ''}
                          </p>
                          {candidato.worker?.position && (
                            <p className="text-sm text-muted-foreground">
                              {candidato.worker.position ?? ''}
                              {candidato.worker.department && ` - ${candidato.worker.department}`}
                            </p>
                          )}
                          {candidato.propuestas && (
                            <p className="text-sm mt-2 text-muted-foreground italic">
                              "{candidato.propuestas}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vote Button */}
                {eleccion.estado === 'votacion' && !yaVoto && (
                  <div className="pt-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Seleccionados: {selectedCandidatos.length} de {maxSeleccion}
                      </p>
                      <Button
                        onClick={handleVotar}
                        disabled={selectedCandidatos.length === 0 || votarMutation.isPending}
                        data-testid="button-emitir-voto"
                      >
                        {votarMutation.isPending ? "Registrando voto..." : "Emitir mi Voto"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultados - Escrutinio/Completada Phase */}
      {['escrutinio', 'completada'].includes(eleccion.estado) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados de la Elección</CardTitle>
            <CardDescription>
              {resultadosData ? (
                `${resultadosData.totalVotantes || 0} trabajadores participaron en la votación`
              ) : (
                "Cargando resultados..."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingResultados ? (
              <p className="text-center py-4 text-muted-foreground">Cargando resultados...</p>
            ) : resultadosData?.resultados && resultadosData.resultados.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {resultadosData.resultados.map((candidato, index) => {
                    const esPrincipal = index < (eleccion.principalesRequeridos || 0);
                    const esSuplente = !esPrincipal && index < maxSeleccion;
                    return (
                      <div
                        key={candidato.id}
                        className={`p-4 border rounded-lg flex items-center justify-between ${
                          esPrincipal ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                          esSuplente ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''
                        }`}
                        data-testid={`row-resultado-${candidato.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-resultado-nombre-${candidato.id}`}>
                              {candidato.worker?.firstName ?? ''} {candidato.worker?.lastName ?? ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {candidato.worker?.position ?? ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" data-testid={`text-votos-${candidato.id}`}>
                            {candidato.votosObtenidos || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">votos</p>
                          {(esPrincipal || esSuplente) && (
                            <Badge className={esPrincipal ? "bg-green-600" : "bg-yellow-600"} data-testid={`badge-electo-${candidato.id}`}>
                              {esPrincipal ? 'Principal' : 'Suplente'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {eleccion.actaEscrutinioUrl && (
                  <div className="pt-4">
                    <a 
                      href={eleccion.actaEscrutinioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-download-acta"
                    >
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Descargar Acta de Escrutinio (PDF)
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No hay resultados disponibles.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== TAB: MIS EXÁMENES MÉDICOS ====================
// Resolución 2346/2007 - Estándar 3.1.4

function MisExamenesMedicosTab() {
  const { toast } = useToast();
  
  const { data: examenes = [], isLoading } = useQuery<MedicalExam[]>({
    queryKey: ["/api/portal/mis-examenes-medicos"],
  });
  
  const confirmarLecturaMutation = useMutation({
    mutationFn: (examId: string) =>
      apiRequest("POST", `/api/portal/mis-examenes-medicos/${examId}/confirmar-lectura`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/mis-examenes-medicos"] });
      toast({
        title: "Lectura confirmada",
        description: "Ha confirmado la lectura de este examen médico",
        className: "bg-green-50 border-green-200",
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
  
  if (isLoading) {
    return <ListSkeletonLoading items={4} />;
  }
  
  const tipoExamenLabels: Record<string, string> = {
    preocupacional: "Examen Pre-ocupacional (Ingreso)",
    egreso: "Examen de Egreso",
    seguimiento: "Examen de Seguimiento",
    periodico: "Examen Periódico",
    retiro: "Examen de Retiro",
    cambio_ocupacion: "Examen por Cambio de Ocupación",
    reintegro: "Examen de Reintegro",
    post_incapacidad: "Examen Post-Incapacidad",
  };
  
  const getEstadoInfo = (exam: MedicalExam): { label: string; color: string } => {
    const now = new Date();
    const scheduledDate = exam.scheduledDate ? new Date(exam.scheduledDate) : null;
    
    if (exam.completedDate) {
      return { label: "Realizado", color: "bg-green-600" };
    }
    if (scheduledDate && scheduledDate < now) {
      return { label: "Vencido", color: "bg-red-600" };
    }
    return { label: "Programado", color: "bg-blue-600" };
  };
  
  const programados = examenes.filter(e => !e.completedDate);
  const completados = examenes.filter(e => e.completedDate);
  
  return (
    <div className="space-y-6">
      {/* Exámenes Programados */}
      <Card data-testid="card-examenes-programados">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Exámenes Médicos Programados
          </CardTitle>
          <CardDescription>
            Exámenes médicos ocupacionales que tiene programados. Confirme la lectura de la notificación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programados.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No tiene exámenes médicos programados en este momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {programados.map((exam) => {
                const estadoInfo = getEstadoInfo(exam);
                const fechaProgramada = exam.scheduledDate ? new Date(exam.scheduledDate) : null;
                const requiereConfirmacion = exam.notificationSentAt && !exam.readConfirmedAt;
                const tipoLabel = tipoExamenLabels[exam.examType || ''] || exam.examType || "Examen Médico";
                
                return (
                  <Card key={exam.id} data-testid={`card-examen-${exam.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base" data-testid={`text-tipo-examen-${exam.id}`}>
                            {tipoLabel}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            {fechaProgramada && (
                              <span className="flex items-center gap-1" data-testid={`text-fecha-examen-${exam.id}`}>
                                <Calendar className="h-3 w-3" />
                                {format(fechaProgramada, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${estadoInfo.color} text-white`} data-testid={`badge-estado-${exam.id}`}>
                            {estadoInfo.label}
                          </Badge>
                          {requiereConfirmacion && (
                            <Button
                              size="sm"
                              onClick={() => confirmarLecturaMutation.mutate(exam.id)}
                              disabled={confirmarLecturaMutation.isPending}
                              className="gap-1"
                              data-testid={`button-confirmar-lectura-${exam.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {confirmarLecturaMutation.isPending ? "..." : "Confirmar Lectura"}
                            </Button>
                          )}
                          {exam.readConfirmedAt && (
                            <Badge variant="outline" className="text-green-600 border-green-600" data-testid={`badge-confirmado-${exam.id}`}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Lectura confirmada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {(exam.medicalCenter || exam.centroMedico) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span data-testid={`text-centro-medico-${exam.id}`}>
                              {exam.medicalCenter || exam.centroMedico}
                            </span>
                          </div>
                        )}
                        {exam.examType && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{exam.examType}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Exámenes */}
      <Card data-testid="card-examenes-historial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Exámenes
          </CardTitle>
          <CardDescription>
            Exámenes médicos ocupacionales que ya ha completado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completados.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No hay exámenes completados en su historial
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completados.map((exam) => {
                const estadoInfo = getEstadoInfo(exam);
                const fechaCompletado = exam.completedDate ? new Date(exam.completedDate) : null;
                const tipoLabel = tipoExamenLabels[exam.examType || ''] || exam.examType || "Examen Médico";
                
                return (
                  <div 
                    key={exam.id} 
                    className="flex items-center justify-between p-3 border rounded-lg gap-2 flex-wrap"
                    data-testid={`row-examen-historial-${exam.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-green-100 dark:bg-green-950 rounded-full flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate" data-testid={`text-tipo-historial-${exam.id}`}>
                          {tipoLabel}
                        </p>
                        {fechaCompletado && (
                          <p className="text-xs text-muted-foreground" data-testid={`text-fecha-historial-${exam.id}`}>
                            Realizado el {format(fechaCompletado, "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        )}
                        {(exam.medicalCenter || exam.centroMedico) && (
                          <p className="text-xs text-muted-foreground">
                            {exam.medicalCenter || exam.centroMedico}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={`${estadoInfo.color} text-white flex-shrink-0`} data-testid={`badge-historial-${exam.id}`}>
                      {estadoInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB: MIS AUDIOMETRÍAS ====================
// Programa de Conservación Auditiva - Resolución 8321/1983 Art. 53

function MisAudiometriasTab() {
  const { data: audiometrias = [], isLoading } = useQuery<AudiometryRecord[]>({
    queryKey: ["/api/portal/mis-audiometrias"],
  });
  
  if (isLoading) {
    return <ListSkeletonLoading items={4} />;
  }
  
  const tipoAudiometriaLabels: Record<string, string> = {
    ingreso: "Audiometría de Ingreso",
    inicial_90_dias: "Audiometría Inicial (90 días)",
    periodica: "Audiometría Periódica",
    seguimiento: "Audiometría de Seguimiento",
    retiro: "Audiometría de Retiro",
  };
  
  const resultadoLabels: Record<string, { label: string; color: string }> = {
    normal: { label: "Normal", color: "bg-green-600" },
    trauma_leve: { label: "Trauma Leve", color: "bg-yellow-600" },
    trauma_moderado: { label: "Trauma Moderado", color: "bg-orange-600" },
    trauma_severo: { label: "Trauma Severo", color: "bg-red-600" },
    pendiente: { label: "Pendiente", color: "bg-gray-600" },
  };
  
  const getEstadoInfo = (record: AudiometryRecord): { label: string; color: string } => {
    if (record.status === "realizada") {
      return { label: "Realizada", color: "bg-green-600" };
    }
    if (record.status === "vencida") {
      return { label: "Vencida", color: "bg-red-600" };
    }
    if (record.status === "cancelada") {
      return { label: "Cancelada", color: "bg-gray-600" };
    }
    return { label: "Programada", color: "bg-blue-600" };
  };
  
  const programadas = audiometrias.filter(a => a.status === "programada");
  const completadas = audiometrias.filter(a => a.status === "realizada");
  
  return (
    <div className="space-y-6">
      {/* Audiometrías Programadas */}
      <Card data-testid="card-audiometrias-programadas">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Audiometrías Programadas
          </CardTitle>
          <CardDescription>
            Exámenes audiométricos que tiene programados según el Programa de Conservación Auditiva (Res. 8321/1983).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programadas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No tiene audiometrías programadas en este momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {programadas.map((record) => {
                const estadoInfo = getEstadoInfo(record);
                const fechaProgramada = record.scheduledDate ? new Date(record.scheduledDate) : null;
                const tipoLabel = tipoAudiometriaLabels[record.audiometryType] || "Audiometría";
                
                return (
                  <Card key={record.id} data-testid={`card-audiometria-${record.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base" data-testid={`text-tipo-audiometria-${record.id}`}>
                            {tipoLabel}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            {fechaProgramada && (
                              <span className="flex items-center gap-1" data-testid={`text-fecha-audiometria-${record.id}`}>
                                <Calendar className="h-3 w-3" />
                                {format(fechaProgramada, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge className={`${estadoInfo.color} text-white`} data-testid={`badge-estado-audiometria-${record.id}`}>
                          {estadoInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {record.clinicName && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span data-testid={`text-clinica-${record.id}`}>
                              {record.clinicName}
                            </span>
                          </div>
                        )}
                        {record.observations && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{record.observations}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Audiometrías */}
      <Card data-testid="card-audiometrias-historial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Audiometrías
          </CardTitle>
          <CardDescription>
            Exámenes audiométricos que ya ha completado con sus resultados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completadas.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No hay audiometrías completadas en su historial
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completadas.map((record) => {
                const fechaRealizada = record.examDate ? new Date(record.examDate) : null;
                const tipoLabel = tipoAudiometriaLabels[record.audiometryType] || "Audiometría";
                const resultadoInfo = record.overallResult 
                  ? resultadoLabels[record.overallResult] 
                  : { label: "Sin Resultado", color: "bg-gray-600" };
                
                return (
                  <Card key={record.id} data-testid={`card-audiometria-historial-${record.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 dark:bg-green-950 rounded-full flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base" data-testid={`text-tipo-historial-audiometria-${record.id}`}>
                                {tipoLabel}
                              </CardTitle>
                              {fechaRealizada && (
                                <p className="text-xs text-muted-foreground" data-testid={`text-fecha-historial-audiometria-${record.id}`}>
                                  Realizada el {format(fechaRealizada, "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${resultadoInfo.color} text-white`} data-testid={`badge-resultado-audiometria-${record.id}`}>
                            {resultadoInfo.label}
                          </Badge>
                          {record.isBaseline === 1 && (
                            <Badge variant="outline" className="border-blue-600 text-blue-600" data-testid={`badge-baseline-${record.id}`}>
                              Línea Base
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Resultados por Oído */}
                        {(record.rightEarAverage || record.leftEarAverage) && (
                          <div className="grid sm:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                            {record.rightEarAverage && (
                              <div data-testid={`text-oido-derecho-${record.id}`}>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Oído Derecho (Promedio)</p>
                                <p className="text-lg font-semibold">{record.rightEarAverage} dB</p>
                              </div>
                            )}
                            {record.leftEarAverage && (
                              <div data-testid={`text-oido-izquierdo-${record.id}`}>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Oído Izquierdo (Promedio)</p>
                                <p className="text-lg font-semibold">{record.leftEarAverage} dB</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Alerta de Cambio de Umbral */}
                        {record.thresholdShiftDetected === 1 && (
                          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-orange-800 dark:text-orange-200">Cambio de Umbral Detectado</p>
                              {record.thresholdShiftDetails && (
                                <p className="text-sm text-orange-700 dark:text-orange-300">{record.thresholdShiftDetails}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Recomendaciones */}
                        {record.recommendations && (
                          <div className="text-sm">
                            <p className="font-medium mb-1">Recomendaciones:</p>
                            <p className="text-muted-foreground">{record.recommendations}</p>
                          </div>
                        )}
                        
                        {/* Próxima Audiometría */}
                        {record.nextAudiometryDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Próxima audiometría: {format(new Date(record.nextAudiometryDate), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        )}
                        
                        {/* Información del profesional */}
                        <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground border-t pt-3">
                          {record.clinicName && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{record.clinicName}</span>
                            </div>
                          )}
                          {record.performedBy && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{record.performedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MI COMITÉ PESV TAB (Resolución 40595/2022) ====================

interface PesvComiteMembresia {
  id: string;
  rol: string;
  cargo: string;
  fechaIngreso: string;
  fechaRetiro?: string | null;
  estado: string;
  observaciones?: string | null;
}

interface PesvComiteActa {
  id: string;
  numeroActa: number;
  fecha: string;
  horaInicio?: string | null;
  horaFin?: string | null;
  lugar?: string | null;
  modalidad?: string | null;
  temasDiscutidos: string;
  desarrolloReunion?: string | null;
  compromisos?: string | null;
  proximaReunion?: string | null;
  estado: string;
}

interface PesvComiteData {
  membresia: PesvComiteMembresia | null;
  actas: PesvComiteActa[];
}

const rolPesvLabels: Record<string, string> = {
  lider_pesv: "Líder PESV",
  miembro: "Miembro",
  representante_trabajadores: "Representante de Trabajadores",
  representante_alta_direccion: "Representante de Alta Dirección",
  asesor_externo: "Asesor Externo",
};

function MiComitePesvTab() {
  const { data, isLoading } = useQuery<PesvComiteData>({
    queryKey: ["/api/portal/worker/pesv-comite"],
  });

  if (isLoading) {
    return <CardSkeletonLoading rows={5} />;
  }

  const membresia = data?.membresia;

  return (
    <div className="space-y-6">
      <TrazabilidadPesvBanner codigoPaso="P01" compacto={false} />

      {membresia ? (
        <Card data-testid="card-mi-membresia-pesv">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-full">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg" data-testid="text-titulo-membresia">
                    Integrante del Comité de Seguridad Vial
                  </CardTitle>
                  <CardDescription>
                    Designado según Resolución 40595 de 2022
                  </CardDescription>
                </div>
              </div>
              <Badge 
                className={membresia.estado === "activo" ? "bg-green-600 text-white" : "bg-gray-500 text-white"} 
                data-testid="badge-estado-membresia"
              >
                {membresia.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div data-testid="text-rol-pesv">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Rol en el Comité</p>
                  <p className="font-semibold">{rolPesvLabels[membresia.rol] || membresia.rol}</p>
                </div>
                <div data-testid="text-cargo-pesv">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Cargo</p>
                  <p className="font-semibold">{membresia.cargo}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div data-testid="text-fecha-ingreso-pesv">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Fecha de Designación</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(membresia.fechaIngreso), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                {membresia.fechaRetiro && (
                  <div data-testid="text-fecha-retiro-pesv">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Fecha de Retiro</p>
                    <p className="font-semibold">
                      {format(new Date(membresia.fechaRetiro), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {membresia.observaciones && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg" data-testid="text-observaciones-pesv">
                <p className="text-xs font-medium text-muted-foreground mb-1">Observaciones</p>
                <p className="text-sm">{membresia.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="card-no-membresia-pesv">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Car className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No es integrante del Comité PESV</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Actualmente no está designado como integrante del Comité de Seguridad Vial de su empresa.
                El nombramiento se realiza mediante acto administrativo según la Resolución 40595 de 2022.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== CAPACITACIONES PESV TAB ====================

interface PesvCapacitacion {
  id: string;
  trainingId: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  horaInicio: string | null;
  horaFin: string | null;
  lugar: string | null;
  instructor: string | null;
  temas: string[] | null;
  estado: string;
  invitado: boolean;
  asistio: boolean;
  notificadoEn: string | null;
  confirmadoEn: string | null;
  contentType: string | null;
  contentUrl: string | null;
  contentText: string | null;
}

function getEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    // Generic — return as-is (works for direct mp4, Google Drive preview, etc.)
    return url;
  } catch {
    return url;
  }
}

function MisCapacitacionesPesvTab() {
  const [videoModal, setVideoModal] = useState<{ open: boolean; url: string; titulo: string }>({ open: false, url: "", titulo: "" });

  const { data, isLoading } = useQuery<{ capacitaciones: PesvCapacitacion[] }>({
    queryKey: ["/api/portal/worker/pesv-capacitaciones"],
  });

  if (isLoading) {
    return <CardSkeletonLoading rows={5} />;
  }

  const capacitaciones = data?.capacitaciones || [];
  const pendientes = capacitaciones.filter(c => c.estado === "programada" || c.estado === "scheduled");
  const completadas = capacitaciones.filter(c => c.estado === "completada" || c.estado === "completed");

  return (
    <div className="space-y-6">
      <TrazabilidadPesvBanner codigoPaso="H02" compacto={false} />

      <Card data-testid="card-capacitaciones-pesv-pendientes">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-full">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg" data-testid="text-titulo-capacitaciones-pesv">
                Capacitaciones PESV Programadas
              </CardTitle>
              <CardDescription>
                Capacitaciones de seguridad vial a las que ha sido invitado(a) según Resolución 40595/2022, Paso 10
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendientes.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Calendar className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No tiene capacitaciones PESV pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendientes.map((cap) => (
                <div 
                  key={cap.id} 
                  className="border rounded-lg p-4"
                  data-testid={`card-capacitacion-pesv-${cap.id}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <h4 className="font-semibold" data-testid={`text-titulo-${cap.id}`}>
                        {cap.titulo}
                      </h4>
                      {cap.descripcion && (
                        <p className="text-sm text-muted-foreground">{cap.descripcion}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(cap.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        {cap.horaInicio && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {cap.horaInicio} {cap.horaFin && `- ${cap.horaFin}`}
                          </span>
                        )}
                        {cap.lugar && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {cap.lugar}
                          </span>
                        )}
                      </div>
                      {cap.instructor && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Instructor:</span> {cap.instructor}
                        </p>
                      )}
                      {cap.temas && cap.temas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cap.temas.map((tema, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tema}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {cap.invitado && (
                        <Badge className="bg-blue-600 text-white" data-testid={`badge-invitado-${cap.id}`}>
                          <Bell className="h-3 w-3 mr-1" />
                          Invitado
                        </Badge>
                      )}
                      {cap.confirmadoEn && (
                        <Badge className="bg-green-600 text-white" data-testid={`badge-confirmado-${cap.id}`}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Confirmado
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Contenido digital adjunto */}
                  {cap.contentType && cap.contentType !== "presencial" && (
                    <div className="mt-3 pt-3 border-t">
                      {cap.contentType === "video" && cap.contentUrl && (
                        <button
                          onClick={() => setVideoModal({ open: true, url: cap.contentUrl!, titulo: cap.titulo })}
                          className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-red-700"
                          data-testid={`link-video-${cap.id}`}
                        >
                          <Play className="h-4 w-4" />
                          Ver Video
                        </button>
                      )}
                      {cap.contentType === "pdf" && cap.contentUrl && (
                        <a
                          href={cap.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-orange-700"
                          data-testid={`link-pdf-${cap.id}`}
                        >
                          <FileText className="h-4 w-4" />
                          Ver PDF
                        </a>
                      )}
                      {cap.contentType === "formulario" && cap.contentUrl && (
                        <a
                          href={cap.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-purple-700"
                          data-testid={`link-formulario-${cap.id}`}
                        >
                          <ClipboardList className="h-4 w-4" />
                          Completar Formulario
                        </a>
                      )}
                      {cap.contentType === "texto" && cap.contentText && (
                        <div className="bg-muted/40 rounded-md p-3 text-sm text-foreground whitespace-pre-wrap" data-testid={`text-contenido-${cap.id}`}>
                          {cap.contentText}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completadas.length > 0 && (
        <Card data-testid="card-capacitaciones-pesv-historial">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Capacitaciones PESV
            </CardTitle>
            <CardDescription>Capacitaciones completadas o pasadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completadas.map((cap) => (
                <div 
                  key={cap.id} 
                  className="flex items-center justify-between border rounded-lg p-3"
                  data-testid={`card-capacitacion-pesv-historial-${cap.id}`}
                >
                  <div>
                    <p className="font-medium">{cap.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(cap.fecha), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <Badge 
                    className={cap.asistio ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                    data-testid={`badge-asistencia-${cap.id}`}
                  >
                    {cap.asistio ? "Asistió" : "No asistió"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Video */}
      <Dialog open={videoModal.open} onOpenChange={(open) => setVideoModal(v => ({ ...v, open }))}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Play className="h-4 w-4 text-red-500" />
              {videoModal.titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              key={videoModal.url}
              src={getEmbedUrl(videoModal.url)}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={videoModal.titulo}
              data-testid="iframe-video-modal"
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <a
              href={videoModal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline"
            >
              Abrir en nueva pestaña
            </a>
            <Button variant="outline" size="sm" onClick={() => setVideoModal(v => ({ ...v, open: false }))}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== ENCUESTA DIARIA DEL CONDUCTOR (Portal Auto-diligenciamiento) ====================
// ==================== INSPECCIÓN PREOPERACIONAL VEHÍCULO TAB ====================

type VehiculoPortal = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: string;
};

type InspeccionVehiculoPortal = {
  id: string;
  inspectionDate: string;
  inspectionTime: string;
  result: string;
  observations: string | null;
  vehiclePlate: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  tires: number; lights: number; mirrors: number; bodywork: number;
  seatbelts: number; horn: number; windshield: number; instruments: number;
  brakes: number; steering: number; suspension: number; fluids: number;
  fireExtinguisher: number; firstAidKit: number; reflectiveTriangles: number; safetyVest: number;
};

type ItemInspeccion = {
  key: keyof Omit<InspeccionVehiculoPortal, 'id'|'inspectionDate'|'inspectionTime'|'result'|'observations'|'vehiclePlate'|'vehicleBrand'|'vehicleModel'>;
  label: string;
  critical?: boolean;
};

const ITEMS_INSPECCION: { grupo: string; items: ItemInspeccion[] }[] = [
  {
    grupo: "Exterior",
    items: [
      { key: "tires", label: "Llantas", critical: true },
      { key: "lights", label: "Luces" },
      { key: "mirrors", label: "Espejos" },
      { key: "bodywork", label: "Carrocería" },
    ],
  },
  {
    grupo: "Interior",
    items: [
      { key: "seatbelts", label: "Cinturones de seguridad" },
      { key: "horn", label: "Bocina" },
      { key: "windshield", label: "Parabrisas" },
      { key: "instruments", label: "Instrumentos / tablero" },
    ],
  },
  {
    grupo: "Mecánica",
    items: [
      { key: "brakes", label: "Frenos", critical: true },
      { key: "steering", label: "Dirección" },
      { key: "suspension", label: "Suspensión" },
      { key: "fluids", label: "Fluidos (aceite, refrigerante)" },
    ],
  },
  {
    grupo: "Equipos de seguridad",
    items: [
      { key: "fireExtinguisher", label: "Extintor", critical: true },
      { key: "firstAidKit", label: "Botiquín de primeros auxilios" },
      { key: "reflectiveTriangles", label: "Triángulos reflectivos" },
      { key: "safetyVest", label: "Chaleco reflectivo" },
    ],
  },
];

type InspeccionState = Record<string, number>;

function InspeccionVehiculoPortalTab() {
  const { toast } = useToast();
  const hoyStr = getTodayDateString();

  const [enviadoFecha, setEnviadoFecha] = useState<string | null>(null);
  const [resultadoEnvio, setResultadoEnvio] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [items, setItems] = useState<InspeccionState>(() => {
    const init: InspeccionState = {};
    ITEMS_INSPECCION.forEach(g => g.items.forEach(i => { init[i.key] = 1; }));
    return init;
  });
  const [observations, setObservations] = useState("");
  const [correctiveActions, setCorrectiveActions] = useState("");

  const { data: vehiculosData, isLoading: vehiculosLoading } = useQuery<{ vehiculos: VehiculoPortal[] }>({
    queryKey: ["/api/portal/mis-vehiculos"],
  });
  const vehiculos = vehiculosData?.vehiculos || [];

  const { data: historialData, isLoading: historialLoading } = useQuery<{ inspecciones: InspeccionVehiculoPortal[] }>({
    queryKey: ["/api/portal/mis-inspecciones-vehiculo"],
  });
  const inspecciones = historialData?.inspecciones || [];

  const inspeccionHoy = inspecciones.find(i => i.inspectionDate === hoyStr && i.vehiclePlate === vehiculos.find(v => v.id === vehicleId)?.plate);
  const yaEnviada = (enviadoFecha === hoyStr) || !!inspeccionHoy;

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = { vehicleId, observations, correctiveActions };
      ITEMS_INSPECCION.forEach(g => g.items.forEach(i => { payload[i.key] = items[i.key]; }));
      return apiRequest("POST", "/api/portal/inspeccion-vehiculo", payload);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setResultadoEnvio(data.result);
      setEnviadoFecha(getTodayDateString());
      queryClient.invalidateQueries({ queryKey: ["/api/portal/mis-inspecciones-vehiculo"] });
      toast({
        title: data.result === 'apto' ? "Vehículo APTO" : data.result === 'apto-con-observaciones' ? "Vehículo APTO con observaciones" : "Vehículo NO APTO",
        description: "Inspección registrada exitosamente.",
        variant: data.result === 'no-apto' ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      toast({ title: "Error al enviar inspección", description: error.message, variant: "destructive" });
    },
  });

  const toggleItem = (key: string) => {
    setItems(prev => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
  };

  const failingItems = Object.entries(items).filter(([, v]) => v === 0).length;

  return (
    <div className="space-y-4">
      {/* Banner normativo */}
      <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-3">
        <Truck className="h-5 w-5 text-green-700 dark:text-green-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">
            Inspección Preoperacional del Vehículo — Paso H06
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
            Resolución 40595/2022 · PESV · Registro obligatorio antes de cada jornada de conducción
          </p>
        </div>
      </div>

      {/* Ya enviada hoy */}
      {yaEnviada ? (
        <Card data-testid="card-inspeccion-ya-enviada">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 text-center py-4">
              {(resultadoEnvio ?? inspeccionHoy?.result) === 'apto' ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (resultadoEnvio ?? inspeccionHoy?.result) === 'apto-con-observaciones' ? (
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              ) : (
                <XSquare className="h-12 w-12 text-red-600" />
              )}
              <div>
                <p className="font-semibold text-base">
                  {(resultadoEnvio ?? inspeccionHoy?.result) === 'apto'
                    ? "Vehículo APTO para circular"
                    : (resultadoEnvio ?? inspeccionHoy?.result) === 'apto-con-observaciones'
                    ? "Apto con observaciones"
                    : "Vehículo NO APTO — No conduzca"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  La inspección de hoy fue registrada exitosamente.
                </p>
              </div>
              {inspeccionHoy && (
                <Badge variant="outline" className="text-xs">
                  Registrada a las {inspeccionHoy.inspectionTime}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="card-formulario-inspeccion-vehiculo">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inspección del día</CardTitle>
            <CardDescription>Marque cada ítem como Bien (✓) o Falla (✗). Ítems críticos en rojo generan resultado NO APTO.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Selector de vehículo */}
            <div className="space-y-1.5">
              <Label htmlFor="vehiculo-select" className="text-sm font-medium">Vehículo a inspeccionar</Label>
              {vehiculosLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : vehiculos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay vehículos activos registrados en su empresa.</p>
              ) : (
                <Select value={vehicleId} onValueChange={setVehicleId} data-testid="select-vehiculo-inspeccion">
                  <SelectTrigger id="vehiculo-select">
                    <SelectValue placeholder="Seleccione un vehículo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} — {v.brand} {v.model} {v.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Ítems de inspección por grupo */}
            {ITEMS_INSPECCION.map(grupo => (
              <div key={grupo.grupo} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{grupo.grupo}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {grupo.items.map(item => {
                    const esBien = items[item.key] === 1;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        data-testid={`toggle-inspeccion-${item.key}`}
                        onClick={() => toggleItem(item.key)}
                        className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors text-left ${
                          esBien
                            ? "border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 text-green-800 dark:text-green-300"
                            : item.critical
                            ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-800 dark:text-red-300"
                            : "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.critical && !esBien && (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span>{item.label}</span>
                          {item.critical && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Crítico</Badge>}
                        </span>
                        {esBien ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <XSquare className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Resumen de fallas */}
            {failingItems > 0 && (
              <div className={`flex items-start gap-2 rounded-md border p-3 ${
                ITEMS_INSPECCION.flatMap(g => g.items).filter(i => i.critical && items[i.key] === 0).length > 0
                  ? "border-red-200 bg-red-50 dark:bg-red-950/30"
                  : "border-amber-200 bg-amber-50 dark:bg-amber-950/30"
              }`}>
                <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                  ITEMS_INSPECCION.flatMap(g => g.items).filter(i => i.critical && items[i.key] === 0).length > 0
                    ? "text-red-600" : "text-amber-600"
                }`} />
                <p className="text-sm">
                  {failingItems} ítem{failingItems > 1 ? 's' : ''} con falla.{" "}
                  {ITEMS_INSPECCION.flatMap(g => g.items).filter(i => i.critical && items[i.key] === 0).length > 0
                    ? "Hay ítems CRÍTICOS fallando — el resultado será NO APTO."
                    : "El resultado será APTO CON OBSERVACIONES."}
                </p>
              </div>
            )}

            {/* Observaciones */}
            <div className="space-y-1.5">
              <Label htmlFor="obs-inspeccion" className="text-sm font-medium">Observaciones</Label>
              <Textarea
                id="obs-inspeccion"
                placeholder="Describa las fallas encontradas o novedades del vehículo..."
                value={observations}
                onChange={e => setObservations(e.target.value)}
                className="min-h-[72px]"
                data-testid="textarea-observaciones-inspeccion"
              />
            </div>

            {failingItems > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="ac-inspeccion" className="text-sm font-medium">Acciones correctivas</Label>
                <Textarea
                  id="ac-inspeccion"
                  placeholder="Acciones a tomar antes de conducir..."
                  value={correctiveActions}
                  onChange={e => setCorrectiveActions(e.target.value)}
                  className="min-h-[60px]"
                  data-testid="textarea-acciones-inspeccion"
                />
              </div>
            )}

            <Button
              className="w-full"
              disabled={!vehicleId || mutation.isPending}
              onClick={() => mutation.mutate()}
              data-testid="button-enviar-inspeccion-vehiculo"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Registrando...</>
              ) : (
                <><CheckSquare className="h-4 w-4 mr-2" />Registrar Inspección</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card data-testid="card-historial-inspecciones-vehiculo">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de Inspecciones
          </CardTitle>
          <CardDescription>Últimas 30 inspecciones registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {historialLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : inspecciones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay inspecciones registradas aún</p>
          ) : (
            <div className="space-y-2">
              {inspecciones.map(ins => {
                const failCount = [ins.tires, ins.lights, ins.mirrors, ins.bodywork,
                  ins.seatbelts, ins.horn, ins.windshield, ins.instruments,
                  ins.brakes, ins.steering, ins.suspension, ins.fluids,
                  ins.fireExtinguisher, ins.firstAidKit, ins.reflectiveTriangles, ins.safetyVest
                ].filter(v => v === 0).length;
                return (
                  <div
                    key={ins.id}
                    data-testid={`card-inspeccion-historial-${ins.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border p-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {ins.vehiclePlate ? `${ins.vehiclePlate} — ${ins.vehicleBrand} ${ins.vehicleModel}` : "Vehículo eliminado"}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(ins.inspectionDate + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{ins.inspectionTime}
                        </span>
                        {failCount > 0 && <span className="text-amber-600">{failCount} falla{failCount > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <Badge
                      className={
                        ins.result === 'apto'
                          ? "bg-green-600 text-white shrink-0"
                          : ins.result === 'apto-con-observaciones'
                          ? "bg-amber-500 text-white shrink-0"
                          : "bg-red-600 text-white shrink-0"
                      }
                      data-testid={`badge-resultado-inspeccion-${ins.id}`}
                    >
                      {ins.result === 'apto' ? 'APTO' : ins.result === 'apto-con-observaciones' ? 'OBS' : 'NO APTO'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type PesvEncuestaConductorPortal = {
  id: string;
  fechaRegistro: string;
  horaRegistro: string;
  horasSueno: number;
  estadoFisico: string;
  estadoEmocional: string;
  tomaMedicamentos: number;
  medicamentosDetalle?: string | null;
  consumoAlcohol: number;
  presentaEnfermedad: number;
  enfermedadDetalle?: string | null;
  resultado: string;
  observaciones?: string | null;
};

function EncuestaConductorPortalTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [horasSueno, setHorasSueno] = useState(7);
  const [estadoFisico, setEstadoFisico] = useState<'bueno' | 'regular' | 'malo'>('bueno');
  const [estadoEmocional, setEstadoEmocional] = useState<'bueno' | 'regular' | 'malo'>('bueno');
  const [tomaMedicamentos, setTomaMedicamentos] = useState(false);
  const [medicamentosDetalle, setMedicamentosDetalle] = useState('');
  const [consumoAlcohol, setConsumoAlcohol] = useState(false);
  const [presentaEnfermedad, setPresentaEnfermedad] = useState(false);
  const [enfermedadDetalle, setEnfermedadDetalle] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [enviadoFecha, setEnviadoFecha] = useState<string | null>(null);
  const [resultadoEnvio, setResultadoEnvio] = useState<'apto' | 'no_apto' | null>(null);

  const { data: historialData, isLoading: historialLoading } = useQuery<{
    encuestas: PesvEncuestaConductorPortal[];
    conductorNombre: string | null;
  }>({
    queryKey: ["/api/portal/mis-encuestas-conductor"],
  });

  const encuestas = historialData?.encuestas || [];

  const hoyStr = getTodayDateString();

  const encuestaHoy = encuestas.find(e => e.fechaRegistro === hoyStr);
  const yaEnviada = (enviadoFecha === hoyStr) || !!encuestaHoy;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/portal/encuesta-conductor", {
        horasSueno,
        estadoFisico,
        estadoEmocional,
        tomaMedicamentos: tomaMedicamentos ? 1 : 0,
        medicamentosDetalle: tomaMedicamentos ? medicamentosDetalle : null,
        consumoAlcohol: consumoAlcohol ? 1 : 0,
        presentaEnfermedad: presentaEnfermedad ? 1 : 0,
        enfermedadDetalle: presentaEnfermedad ? enfermedadDetalle : null,
        observaciones: observaciones || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEnviadoFecha(getTodayDateString());
      setResultadoEnvio(data.resultado);
      queryClient.invalidateQueries({ queryKey: ["/api/portal/mis-encuestas-conductor"] });
      toast({
        title: data.resultado === 'apto' ? "Encuesta enviada — APTO" : "Encuesta enviada — NO APTO",
        description: data.resultado === 'apto'
          ? "Su condición cumple los requisitos para conducir hoy."
          : "Se ha registrado una condición que requiere evaluación antes de conducir.",
        variant: data.resultado === 'apto' ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar encuesta",
        description: error.message || "Intente nuevamente",
        variant: "destructive",
      });
    },
  });

  const estadoOpciones = {
    bueno: { label: "Bueno", bg: "bg-green-600" },
    regular: { label: "Regular", bg: "bg-amber-500" },
    malo: { label: "Malo", bg: "bg-red-600" },
  };

  const renderEstadoSelector = (
    value: 'bueno' | 'regular' | 'malo',
    onChange: (v: 'bueno' | 'regular' | 'malo') => void,
    testPrefix: string
  ) => (
    <div className="flex gap-2 flex-wrap">
      {(['bueno', 'regular', 'malo'] as const).map((opcion) => (
        <button
          key={opcion}
          type="button"
          onClick={() => onChange(opcion)}
          data-testid={`btn-${testPrefix}-${opcion}`}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            value === opcion
              ? `${estadoOpciones[opcion].bg} text-white border-transparent`
              : 'bg-background border-border text-foreground hover:bg-muted'
          }`}
        >
          {estadoOpciones[opcion].label}
        </button>
      ))}
    </div>
  );

  const renderToggle = (
    value: boolean,
    onChange: (v: boolean) => void,
    testId: string
  ) => (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(false)}
        data-testid={`${testId}-no`}
        className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
          !value ? 'bg-green-600 text-white border-transparent' : 'bg-background border-border text-foreground hover:bg-muted'
        }`}
      >
        No
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        data-testid={`${testId}-si`}
        className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
          value ? 'bg-red-600 text-white border-transparent' : 'bg-background border-border text-foreground hover:bg-muted'
        }`}
      >
        Sí
      </button>
    </div>
  );

  const hayAlertaNoApto = estadoFisico === 'malo' || estadoEmocional === 'malo' || consumoAlcohol || presentaEnfermedad || horasSueno < 6;

  return (
    <div className="space-y-6">
      {/* Banner normativo */}
      <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full mt-0.5">
              <Car className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
                Encuesta Pre-operacional del Conductor — Paso H06
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Resolución 40595/2022 · PESV · Registro obligatorio antes de cada jornada de conducción
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado si ya fue enviada hoy */}
      {yaEnviada && (
        <Card data-testid="card-encuesta-ya-enviada">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              {(resultadoEnvio ?? encuestaHoy?.resultado) === 'apto' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400" data-testid="text-resultado-apto">
                      APTO para conducir hoy
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Su encuesta del {format(new Date(hoyStr + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: es })} fue registrada exitosamente.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400" data-testid="text-resultado-no-apto">
                      NO APTO — Requiere evaluación
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Informe a su supervisor antes de iniciar operaciones.
                    </p>
                  </div>
                </>
              )}
              {encuestaHoy && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Registrada a las {encuestaHoy.horaRegistro}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario — solo si no se ha enviado hoy */}
      {!yaEnviada && (
        <Card data-testid="card-formulario-encuesta-conductor">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-full">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Encuesta del día</CardTitle>
                <CardDescription>
                  Responda con honestidad. Sus respuestas garantizan su seguridad y la de los demás.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Horas de sueño */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 flex-wrap">
                <Moon className="h-4 w-4 text-indigo-500" />
                ¿Cuántas horas durmió anoche?
                <span className="ml-auto text-lg font-bold text-indigo-600" data-testid="text-horas-sueno-valor">
                  {horasSueno}h
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={12}
                value={horasSueno}
                onChange={e => setHorasSueno(Number(e.target.value))}
                className="w-full accent-indigo-600"
                data-testid="input-horas-sueno"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1h</span>
                <span className={horasSueno < 6 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                  {horasSueno < 6 ? "Insuficiente para conducir" : "Suficiente"}
                </span>
                <span>12h</span>
              </div>
            </div>

            {/* Estado físico */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Estado físico general hoy
              </label>
              {renderEstadoSelector(estadoFisico, setEstadoFisico, "fisico")}
            </div>

            {/* Estado emocional */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Estado emocional hoy
              </label>
              {renderEstadoSelector(estadoEmocional, setEstadoEmocional, "emocional")}
            </div>

            {/* Toma medicamentos */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Pill className="h-4 w-4 text-amber-500" />
                ¿Está tomando medicamentos que puedan afectar la conducción?
              </label>
              {renderToggle(tomaMedicamentos, setTomaMedicamentos, "medicamentos")}
              {tomaMedicamentos && (
                <Textarea
                  placeholder="Indique cuáles medicamentos..."
                  value={medicamentosDetalle}
                  onChange={e => setMedicamentosDetalle(e.target.value)}
                  className="mt-2 text-sm"
                  rows={2}
                  data-testid="input-medicamentos-detalle"
                />
              )}
            </div>

            {/* Consumo de alcohol */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wine className="h-4 w-4 text-red-500" />
                ¿Consumió bebidas alcohólicas en las últimas 12 horas?
              </label>
              {renderToggle(consumoAlcohol, setConsumoAlcohol, "alcohol")}
            </div>

            {/* Presenta enfermedad */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                ¿Presenta alguna enfermedad o malestar que pueda afectar la conducción?
              </label>
              {renderToggle(presentaEnfermedad, setPresentaEnfermedad, "enfermedad")}
              {presentaEnfermedad && (
                <Textarea
                  placeholder="Describa el malestar o enfermedad..."
                  value={enfermedadDetalle}
                  onChange={e => setEnfermedadDetalle(e.target.value)}
                  className="mt-2 text-sm"
                  rows={2}
                  data-testid="input-enfermedad-detalle"
                />
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Observaciones adicionales (opcional)
              </label>
              <Textarea
                placeholder="Cualquier otra información relevante..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                className="text-sm"
                rows={2}
                data-testid="input-observaciones"
              />
            </div>

            {/* Alerta previa si va a quedar no apto */}
            {hayAlertaNoApto && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  Con las condiciones indicadas el resultado será <strong>NO APTO</strong>. Informe a su supervisor antes de continuar.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              data-testid="button-enviar-encuesta-conductor"
            >
              {submitMutation.isPending ? "Enviando..." : "Enviar Encuesta"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card data-testid="card-historial-encuestas-conductor">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Historial de Encuestas</CardTitle>
              <CardDescription>Últimas 30 encuestas registradas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historialLoading ? (
            <CardSkeletonLoading rows={4} />
          ) : encuestas.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <ClipboardList className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No hay encuestas registradas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {encuestas.map((enc) => (
                <div
                  key={enc.id}
                  className="flex items-center justify-between border rounded-lg p-3 gap-3 flex-wrap"
                  data-testid={`card-encuesta-historial-${enc.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {format(new Date(enc.fechaRegistro + 'T12:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {enc.horaRegistro}
                      </span>
                      <span>{enc.horasSueno}h sueño</span>
                      <span>Físico: {estadoOpciones[enc.estadoFisico as keyof typeof estadoOpciones]?.label ?? enc.estadoFisico}</span>
                      <span>Emocional: {estadoOpciones[enc.estadoEmocional as keyof typeof estadoOpciones]?.label ?? enc.estadoEmocional}</span>
                    </div>
                  </div>
                  <Badge
                    className={enc.resultado === 'apto'
                      ? "bg-green-600 text-white shrink-0"
                      : "bg-red-600 text-white shrink-0"}
                    data-testid={`badge-resultado-encuesta-${enc.id}`}
                  >
                    {enc.resultado === 'apto' ? 'APTO' : 'NO APTO'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
