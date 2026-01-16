import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { hasGlobalAccess } from "@shared/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Shield, 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  FileText, 
  Activity,
  Search,
  Filter,
  Info,
  AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ProviderAccessLog, Company } from "@shared/schema";

const accessReasonLabels: Record<string, string> = {
  soporte_tecnico: "Soporte Técnico",
  mantenimiento: "Mantenimiento",
  auditoria_interna: "Auditoría Interna",
  verificacion_datos: "Verificación de Datos",
  configuracion: "Configuración",
  capacitacion: "Capacitación",
  migracion: "Migración",
  backup: "Backup",
  otro: "Otro",
};

const accessReasonColors: Record<string, string> = {
  soporte_tecnico: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  mantenimiento: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  auditoria_interna: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  verificacion_datos: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  configuracion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  capacitacion: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  migracion: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  backup: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  otro: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

function AccessLogDetailDialog({ 
  log, 
  open, 
  onOpenChange 
}: { 
  log: ProviderAccessLog | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;

  const isActiveSession = !log.accessEnd;
  const duration = log.accessEnd 
    ? Math.round((new Date(log.accessEnd).getTime() - new Date(log.accessStart).getTime()) / 60000)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-access-log-detail">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-dialog-title">
            <Eye className="h-5 w-5" />
            Detalle del Acceso del Proveedor
          </DialogTitle>
          <DialogDescription>
            Registro de acceso ID: {log.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-1">
            <div className="flex items-center gap-2">
              {isActiveSession ? (
                <Badge variant="destructive" className="animate-pulse" data-testid="badge-active-session">
                  <Activity className="h-3 w-3 mr-1" />
                  Sesión Activa
                </Badge>
              ) : (
                <Badge variant="outline" data-testid="badge-completed-session">
                  <Clock className="h-3 w-3 mr-1" />
                  Sesión Finalizada
                </Badge>
              )}
              <Badge className={accessReasonColors[log.accessReason] || ""}>
                {accessReasonLabels[log.accessReason] || log.accessReason}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Proveedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p data-testid="text-provider-name"><strong>Nombre:</strong> {log.providerName}</p>
                  <p data-testid="text-provider-email"><strong>Email:</strong> {log.providerEmail}</p>
                  <p><strong>Rol:</strong> {log.providerRole}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa Accedida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p data-testid="text-company-name"><strong>Nombre:</strong> {log.clientCompanyName}</p>
                  <p><strong>NIT:</strong> {log.clientCompanyNit || "No registrado"}</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información Temporal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Inicio del Acceso</p>
                  <p className="font-medium" data-testid="text-access-start">
                    {format(new Date(log.accessStart), "PPpp", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fin del Acceso</p>
                  <p className="font-medium" data-testid="text-access-end">
                    {log.accessEnd 
                      ? format(new Date(log.accessEnd), "PPpp", { locale: es })
                      : "En progreso..."
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duración</p>
                  <p className="font-medium" data-testid="text-duration">
                    {duration !== null ? `${duration} minutos` : "En curso"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalles del Acceso
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Descripción</p>
                  <p className="font-medium" data-testid="text-description">{log.accessDescription}</p>
                </div>
                {log.ticketNumber && (
                  <div>
                    <p className="text-muted-foreground">Número de Ticket</p>
                    <p className="font-medium" data-testid="text-ticket">{log.ticketNumber}</p>
                  </div>
                )}
                {log.modulesAccessed && log.modulesAccessed.length > 0 && (
                  <div>
                    <p className="text-muted-foreground">Módulos Accedidos</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.modulesAccessed.map((mod, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-muted-foreground">Registros Visualizados</p>
                    <p className="font-medium" data-testid="text-records-viewed">{log.recordsViewed || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registros Modificados</p>
                    <p className="font-medium" data-testid="text-records-modified">{log.recordsModified || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Contexto Técnico y Legal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dirección IP</p>
                  <p className="font-mono text-xs">{log.ipAddress || "No registrada"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User Agent</p>
                  <p className="font-mono text-xs truncate" title={log.userAgent || ""}>
                    {log.userAgent ? log.userAgent.slice(0, 50) + "..." : "No registrado"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Base Legal</p>
                  <p className="text-xs">{log.legalBasis}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AccessLogsTable({ 
  logs, 
  onSelectLog,
  isSuperAdmin
}: { 
  logs: ProviderAccessLog[]; 
  onSelectLog: (log: ProviderAccessLog) => void;
  isSuperAdmin: boolean;
}) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="text-no-logs">
        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay registros de acceso</p>
        <p className="text-sm">No se han registrado accesos del proveedor a sus datos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table data-testid="table-access-logs">
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Proveedor</TableHead>
            {isSuperAdmin && <TableHead>Empresa</TableHead>}
            <TableHead>Motivo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const isActiveSession = !log.accessEnd;
            const duration = log.accessEnd 
              ? Math.round((new Date(log.accessEnd).getTime() - new Date(log.accessStart).getTime()) / 60000)
              : null;

            return (
              <TableRow 
                key={log.id} 
                className="cursor-pointer hover-elevate"
                onClick={() => onSelectLog(log)}
                data-testid={`row-access-log-${log.id}`}
              >
                <TableCell className="whitespace-nowrap" data-testid={`text-date-${log.id}`}>
                  <div className="text-sm font-medium">
                    {format(new Date(log.accessStart), "dd/MM/yyyy", { locale: es })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(log.accessStart), "HH:mm", { locale: es })}
                  </div>
                </TableCell>
                <TableCell data-testid={`text-provider-${log.id}`}>
                  <div className="text-sm font-medium">{log.providerName}</div>
                  <div className="text-xs text-muted-foreground">{log.providerEmail}</div>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell data-testid={`text-company-${log.id}`}>
                    <div className="text-sm font-medium">{log.clientCompanyName}</div>
                    <div className="text-xs text-muted-foreground">{log.clientCompanyNit || "-"}</div>
                  </TableCell>
                )}
                <TableCell>
                  <Badge 
                    className={`${accessReasonColors[log.accessReason] || ""} text-xs`}
                    data-testid={`badge-reason-${log.id}`}
                  >
                    {accessReasonLabels[log.accessReason] || log.accessReason}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px]" data-testid={`text-desc-${log.id}`}>
                  <span className="truncate block text-sm">{log.accessDescription}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap" data-testid={`text-duration-${log.id}`}>
                  {duration !== null ? `${duration} min` : "-"}
                </TableCell>
                <TableCell>
                  {isActiveSession ? (
                    <Badge variant="destructive" className="animate-pulse" data-testid={`badge-status-${log.id}`}>
                      <Activity className="h-3 w-3 mr-1" />
                      Activa
                    </Badge>
                  ) : (
                    <Badge variant="outline" data-testid={`badge-status-${log.id}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      Finalizada
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLog(log);
                    }}
                    data-testid={`button-view-${log.id}`}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function RegistroAccesosProveedor() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role ? hasGlobalAccess(user.role) : false;
  
  const [selectedLog, setSelectedLog] = useState<ProviderAccessLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    companyId: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperAdmin,
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.companyId && filters.companyId !== "all") {
      params.set("clientCompanyId", filters.companyId);
    }
    if (filters.reason && filters.reason !== "all") {
      params.set("reason", filters.reason);
    }
    if (filters.startDate) {
      params.set("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params.set("endDate", filters.endDate);
    }
    return params.toString();
  };

  const logsEndpoint = isSuperAdmin 
    ? `/api/provider-access-logs${buildQueryString() ? `?${buildQueryString()}` : ""}`
    : `/api/provider-access-logs/company/${user?.companyId}`;

  const { data: logs = [], isLoading, error } = useQuery<ProviderAccessLog[]>({
    queryKey: ["/api/provider-access-logs", filters, user?.companyId, isSuperAdmin],
    queryFn: async () => {
      const response = await fetch(logsEndpoint, { credentials: "include" });
      if (!response.ok) throw new Error("Error al cargar los registros");
      return response.json();
    },
    enabled: !!user,
  });

  const handleSelectLog = (log: ProviderAccessLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const activeSessions = logs.filter(log => !log.accessEnd);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card data-testid="card-access-logs">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2" data-testid="text-page-title">
                <Eye className="h-6 w-6" />
                Registro de Accesos del Proveedor
              </CardTitle>
              <CardDescription data-testid="text-page-description">
                {isSuperAdmin 
                  ? "Historial completo de accesos del proveedor a datos de clientes (transparencia Ley 1581/2012)"
                  : "Historial de accesos del proveedor SST Colombia a los datos de su empresa"
                }
              </CardDescription>
            </div>
            {activeSessions.length > 0 && (
              <Badge variant="destructive" className="animate-pulse self-start" data-testid="badge-active-sessions-count">
                <Activity className="h-3 w-3 mr-1" />
                {activeSessions.length} sesión(es) activa(s)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="filter-company">Empresa</Label>
                    <Select
                      value={filters.companyId}
                      onValueChange={(value) => setFilters({ ...filters, companyId: value })}
                    >
                      <SelectTrigger id="filter-company" data-testid="select-filter-company">
                        <SelectValue placeholder="Todas las empresas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las empresas</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="filter-reason">Motivo de Acceso</Label>
                  <Select
                    value={filters.reason}
                    onValueChange={(value) => setFilters({ ...filters, reason: value })}
                  >
                    <SelectTrigger id="filter-reason" data-testid="select-filter-reason">
                      <SelectValue placeholder="Todos los motivos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los motivos</SelectItem>
                      {Object.entries(accessReasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-start-date">Fecha Inicio</Label>
                  <Input
                    id="filter-start-date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    data-testid="input-filter-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-end-date">Fecha Fin</Label>
                  <Input
                    id="filter-end-date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    data-testid="input-filter-end-date"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ companyId: "", reason: "", startDate: "", endDate: "" })}
                  data-testid="button-clear-filters"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {!isSuperAdmin && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4" data-testid="info-transparency">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Transparencia de Acceso (Ley 1581/2012)</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Este registro muestra todos los accesos que el personal de SST Colombia (proveedor del servicio) 
                    ha realizado a los datos de su empresa. Esto garantiza la transparencia conforme al principio 
                    de Acceso Restringido establecido en la Ley 1581 de 2012.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive" data-testid="text-error">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Error al cargar los registros</p>
              <p className="text-sm">Por favor, intente nuevamente más tarde.</p>
            </div>
          ) : (
            <AccessLogsTable 
              logs={logs} 
              onSelectLog={handleSelectLog}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </CardContent>
      </Card>

      <AccessLogDetailDialog 
        log={selectedLog} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
}
