import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Users, Clock, Shield, Search, Globe } from "lucide-react";
import { useState, useMemo } from "react";

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
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  superusuario: "Super Usuario",
  usuario: "Usuario",
  trabajador: "Trabajador",
  soporte: "Soporte",
  lso: "Licenciado SST",
  contador: "Contador",
  auditor: "Auditor",
  observador: "Observador",
  consultor: "Consultor",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  superusuario: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  usuario: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  trabajador: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  soporte: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  lso: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Nunca";
  const date = new Date(dateStr);
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return "";
}

export default function AdminLoginActivity() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading, isError } = useQuery<LoginActivityUser[]>({
    queryKey: ["/api/admin/login-activity"],
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchTerm ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalLogins = users.reduce((sum, u) => sum + (u.loginCount || 0), 0);
  const activeToday = users.filter((u) => {
    if (!u.lastLoginAt) return false;
    const today = new Date();
    const loginDate = new Date(u.lastLoginAt);
    return loginDate.toDateString() === today.toDateString();
  }).length;
  const neverLoggedIn = users.filter((u) => !u.lastLoginAt).length;

  return (
    <div className="space-y-6 p-6" data-testid="admin-login-activity">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Actividad de Login</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-logins">{totalLogins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-active-today">{activeToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nunca Ingresaron</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-never-logged">{neverLoggedIn}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Accesos</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-role-filter">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="superusuario">Super Usuario</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
                <SelectItem value="trabajador">Trabajador</SelectItem>
                <SelectItem value="soporte">Soporte</SelectItem>
                <SelectItem value="lso">Licenciado SST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando actividad...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">Error al cargar la actividad de login. Verifique sus permisos.</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No se encontraron usuarios</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-login-activity">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Usuario</th>
                    <th className="text-left py-3 px-2 font-medium">Rol</th>
                    <th className="text-left py-3 px-2 font-medium">Empresa</th>
                    <th className="text-left py-3 px-2 font-medium">Último Acceso</th>
                    <th className="text-center py-3 px-2 font-medium">Ingresos</th>
                    <th className="text-left py-3 px-2 font-medium">Última IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover-elevate" data-testid={`row-user-${user.id}`}>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{user.fullName || user.username}</div>
                          <div className="text-xs text-muted-foreground">{user.email || user.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className={roleColors[user.role] || ""}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {user.companyName || "-"}
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div>{formatDate(user.lastLoginAt)}</div>
                          {user.lastLoginAt && (
                            <div className="text-xs text-muted-foreground">{timeAgo(user.lastLoginAt)}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-semibold">{user.loginCount || 0}</span>
                      </td>
                      <td className="py-3 px-2">
                        {user.lastLoginIp ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs font-mono">{user.lastLoginIp}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
    </div>
  );
}
