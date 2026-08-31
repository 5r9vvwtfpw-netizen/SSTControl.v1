import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Laptop,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LoginActivityUser {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  companyId: string | null;
  companyName: string | null;
  lastLoginAt: string | null;
  loginCount: number | null;
  lastLoginIp: string | null;
  createdAt: string;
  authorizedIps: string[];
  sessionCount: number;
  suspiciousCount: number;
  activeSessionCount: number;
}

interface LoginSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
  accessDecision: "allowed" | "blocked";
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  geoTimezone: string | null;
  geoIsp: string | null;
  geoStatus: "resolved" | "private" | "unavailable" | null;
  loginAt: string;
  lastActivityAt: string | null;
  logoutAt: string | null;
  durationMinutes: number | null;
  isActive: boolean;
  isSuspicious: boolean;
  alertType: "unauthorized_ip" | "simultaneous" | "long_session" | null;
  alertNote: string | null;
}

interface SessionResponse {
  user: Pick<LoginActivityUser, "id" | "username" | "fullName" | "role">;
  sessions: LoginSession[];
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  superusuario: "Super Usuario",
  responsable_sst: "Responsable SST",
  coordinador_salud: "Coordinador de Salud",
  coordinador_sst: "Coordinador SST",
  coordinador_rrhh: "Coordinador RRHH",
  jefe_personal: "Jefe de Personal",
  supervisor: "Supervisor",
  vigia_sst: "Vigía SST",
  auditor_interno: "Auditor Interno",
  trabajador: "Trabajador",
  soporte: "Soporte",
  lso: "Licenciado SST",
  tecnico_mecanico: "Técnico Mecánico",
};

const alertLabels: Record<string, string> = {
  unauthorized_ip: "IP no autorizada",
  blocked_unauthorized_ip: "Acceso bloqueado",
  simultaneous: "Sesión simultánea",
  long_session: "Más de 8 horas",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Nunca";
  return new Date(dateStr).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diffMinutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMinutes < 1) return "Ahora mismo";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `Hace ${days} días` : "";
}

function deviceName(userAgent: string | null) {
  if (!userAgent) return "Dispositivo no identificado";
  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Chrome/")
      ? "Chrome"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Navegador";
  const system = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Android")
      ? "Android"
      : userAgent.includes("iPhone") || userAgent.includes("iPad")
        ? "iOS"
        : userAgent.includes("Mac OS")
          ? "macOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "Sistema desconocido";
  return `${browser} · ${system}`;
}

function durationLabel(minutes: number | null) {
  if (minutes === null || minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h${rest ? ` ${rest}m` : ""}`;
}

export default function AdminLoginActivity() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<LoginActivityUser | null>(null);
  const [managedIps, setManagedIps] = useState<string[]>([]);
  const [newIp, setNewIp] = useState("");
  const [ipToRemove, setIpToRemove] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: users = [], isLoading, isError } = useQuery<LoginActivityUser[]>({
    queryKey: ["/api/admin/login-activity"],
  });

  const { data: sessionData, isLoading: sessionsLoading } = useQuery<SessionResponse>({
    queryKey: ["/api/admin/login-activity", selectedUser?.id, "sessions"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/login-activity/${selectedUser!.id}/sessions`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("No se pudo cargar el historial");
      return response.json();
    },
    enabled: !!selectedUser,
  });

  const updateIpsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/login-activity/${selectedUser!.id}/authorized-ips`,
        { authorizedIps: managedIps },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/login-activity"] });
      setSelectedUser((current) => current ? { ...current, authorizedIps: managedIps } : current);
      toast({
        title: "IP autorizadas actualizadas",
        description: managedIps.length
          ? "Los nuevos accesos se compararán con esta lista."
          : "La cuenta quedó sin restricción por IP.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
    },
  });

  const roles = useMemo(
    () => Array.from(new Set(users.map((user) => user.role))).sort(),
    [users],
  );

  const filteredUsers = useMemo(() => users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search ||
      user.username.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.companyName?.toLowerCase().includes(search);
    return matchesSearch && (roleFilter === "all" || user.role === roleFilter);
  }), [users, searchTerm, roleFilter]);

  const filteredSessions = useMemo(() => {
    const days = dateFilter === "all" ? null : Number(dateFilter);
    const cutoff = days ? Date.now() - days * 86400000 : null;
    return (sessionData?.sessions ?? []).filter((session) => {
      const matchesAlert = alertFilter === "all" ||
        (alertFilter === "suspicious" ? session.isSuspicious : !session.isSuspicious);
      const matchesDate = !cutoff || new Date(session.loginAt).getTime() >= cutoff;
      return matchesAlert && matchesDate;
    });
  }, [sessionData, alertFilter, dateFilter]);

  const totalLogins = users.reduce((sum, user) => sum + (user.loginCount || 0), 0);
  const activeToday = users.filter((user) =>
    user.lastLoginAt && new Date(user.lastLoginAt).toDateString() === new Date().toDateString()
  ).length;
  const suspiciousUsers = users.filter((user) => user.suspiciousCount > 0).length;

  const openUserSecurity = (user: LoginActivityUser) => {
    setSelectedUser(user);
    setManagedIps(user.authorizedIps || []);
    setNewIp("");
    setAlertFilter("all");
    setDateFilter("all");
  };

  const addIp = () => {
    const normalized = newIp.trim().replace(/^::ffff:/, "");
    if (!normalized) return;
    if (managedIps.includes(normalized)) {
      toast({ title: "IP duplicada", description: "Esta IP ya está en la lista.", variant: "destructive" });
      return;
    }
    setManagedIps([...managedIps, normalized]);
    setNewIp("");
  };

  return (
    <div className="space-y-6 p-6" data-testid="admin-login-activity">
      <div>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Actividad de Login</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de sesiones, alertas de seguridad y control de IP autorizadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalLogins}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeToday}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{suspiciousUsers}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Accesos</CardTitle>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Buscar por usuario, nombre, email o empresa..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="flex-1"
              data-testid="input-search-users"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-56" data-testid="select-role-filter">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>{roleLabels[role] || role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando actividad...</div>
          ) : isError ? (
            <div className="py-8 text-center text-destructive">Error al cargar la actividad. Verifique sus permisos.</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No se encontraron usuarios</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm" data-testid="table-login-activity">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-3 text-left font-medium">Usuario</th>
                    <th className="px-2 py-3 text-left font-medium">Rol / Empresa</th>
                    <th className="px-2 py-3 text-left font-medium">Último Acceso</th>
                    <th className="px-2 py-3 text-left font-medium">Última IP</th>
                    <th className="px-2 py-3 text-left font-medium">Control IP</th>
                    <th className="px-2 py-3 text-center font-medium">Alertas</th>
                    <th className="px-2 py-3 text-right font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover-elevate" data-testid={`row-user-${user.id}`}>
                      <td className="px-2 py-3">
                        <div className="font-medium">{user.fullName || user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email || user.username}</div>
                      </td>
                      <td className="px-2 py-3">
                        <Badge variant="secondary">{roleLabels[user.role] || user.role}</Badge>
                        <div className="mt-1 max-w-52 truncate text-xs text-muted-foreground">{user.companyName || "Sin empresa"}</div>
                      </td>
                      <td className="px-2 py-3">
                        <div>{formatDate(user.lastLoginAt)}</div>
                        <div className="text-xs text-muted-foreground">{timeAgo(user.lastLoginAt)}</div>
                      </td>
                      <td className="px-2 py-3 font-mono text-xs">{user.lastLoginIp || "-"}</td>
                      <td className="px-2 py-3">
                        {user.authorizedIps.length ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {user.authorizedIps.length} autorizada{user.authorizedIps.length !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Sin restricción</Badge>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {user.suspiciousCount ? (
                          <Badge variant="destructive">{user.suspiciousCount}</Badge>
                        ) : (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUserSecurity(user)}
                          data-testid={`button-security-${user.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver seguridad
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-6xl overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad de {selectedUser?.fullName || selectedUser?.username}
            </DialogTitle>
            <DialogDescription>
              Una IP nueva genera una alerta. Tras 3 accesos no autorizados en 24 horas, el siguiente intento se bloquea temporalmente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(260px,330px)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">IP autorizadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`rounded-md border p-3 text-sm ${managedIps.length ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-amber-200 bg-amber-50 dark:bg-amber-950/20"}`}>
                  {managedIps.length
                    ? "Monitoreo activo: las IP nuevas se marcarán como sospechosas."
                    : "Sin restricción configurada: cualquier IP se considera permitida."}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-authorized-ip">Agregar IPv4 o IPv6</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-authorized-ip"
                      value={newIp}
                      onChange={(event) => setNewIp(event.target.value)}
                      placeholder="Ej. 190.20.30.40"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addIp();
                        }
                      }}
                      data-testid="input-authorized-ip"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addIp} data-testid="button-add-ip">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {managedIps.length === 0 ? (
                    <p className="py-3 text-center text-sm text-muted-foreground">No hay IP autorizadas.</p>
                  ) : managedIps.map((ip) => (
                    <div key={ip} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="font-mono text-xs">{ip}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setIpToRemove(ip)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => updateIpsMutation.mutate()}
                  disabled={updateIpsMutation.isPending}
                  data-testid="button-save-authorized-ips"
                >
                  {updateIpsMutation.isPending ? "Guardando..." : "Guardar configuración"}
                </Button>
              </CardContent>
            </Card>

            <div className="min-w-0 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">Historial de sesiones</h3>
                  <p className="text-xs text-muted-foreground">Se muestran hasta 100 accesos recientes.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={alertFilter} onValueChange={setAlertFilter}>
                    <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="suspicious">Con alerta</SelectItem>
                      <SelectItem value="normal">Sin alerta</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el período</SelectItem>
                      <SelectItem value="7">Últimos 7 días</SelectItem>
                      <SelectItem value="30">Últimos 30 días</SelectItem>
                      <SelectItem value="90">Últimos 90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {sessionsLoading ? (
                <div className="py-12 text-center text-muted-foreground">Cargando historial...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="rounded-md border py-12 text-center text-muted-foreground">No hay sesiones para este filtro.</div>
              ) : (
                <div className="max-h-[500px] overflow-auto rounded-md border">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left">Ingreso</th>
                        <th className="px-3 py-2 text-left">IP</th>
                        <th className="px-3 py-2 text-left">Ubicación aproximada</th>
                        <th className="px-3 py-2 text-left">Dispositivo</th>
                        <th className="px-3 py-2 text-left">Duración</th>
                        <th className="px-3 py-2 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map((session) => (
                        <tr key={session.id} className="border-b align-top">
                          <td className="px-3 py-3 whitespace-nowrap">{formatDate(session.loginAt)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 font-mono text-xs">
                              <Globe className="h-3 w-3" />{session.ipAddress || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div>{[session.geoCity, session.geoRegion, session.geoCountry].filter(Boolean).join(", ") || "No disponible"}</div>
                            {session.geoIsp && <div className="text-xs text-muted-foreground">{session.geoIsp}</div>}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <Laptop className="h-3 w-3" />{deviceName(session.userAgent)}
                            </div>
                            {session.deviceId && (
                              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                                Equipo: {session.deviceId.slice(0, 8)}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">{durationLabel(session.durationMinutes)}</td>
                          <td className="px-3 py-3">
                            {session.accessDecision === "blocked" ? (
                              <div className="space-y-1">
                                <Badge variant="destructive">Acceso bloqueado</Badge>
                                {session.alertNote && <p className="max-w-64 text-xs text-muted-foreground">{session.alertNote}</p>}
                              </div>
                            ) : session.isSuspicious ? (
                              <div className="space-y-1">
                                <Badge variant="destructive">{alertLabels[session.alertType || ""] || "Sospechosa"}</Badge>
                                {session.alertNote && <p className="max-w-64 text-xs text-muted-foreground">{session.alertNote}</p>}
                              </div>
                            ) : session.isActive ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activa</Badge>
                            ) : (
                              <Badge variant="secondary">Cerrada</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!ipToRemove} onOpenChange={(open) => !open && setIpToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar esta IP autorizada?</AlertDialogTitle>
            <AlertDialogDescription>
              Los próximos accesos desde {ipToRemove} quedarán marcados como sospechosos después de guardar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setManagedIps((ips) => ips.filter((ip) => ip !== ipToRemove));
                setIpToRemove(null);
              }}
            >
              Revocar IP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}