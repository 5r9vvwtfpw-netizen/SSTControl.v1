import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { canAccessRoute } from "@shared/route-permissions";
import { getRolePermissions } from "@shared/permissions";
import { useMemo } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  
  const userPermissions = useMemo(() => {
    if (!user?.role) return [];
    return getRolePermissions(user.role);
  }, [user?.role]);

  const hasAccess = useMemo(() => {
    if (!user) return false;
    return canAccessRoute(userPermissions, path);
  }, [userPermissions, path, user]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role === "superusuario" && !user.companyId && path !== "/crear-empresa") {
    return (
      <Route path={path}>
        <Redirect to="/crear-empresa" />
      </Route>
    );
  }

  // TRABAJADORES: Solo pueden acceder al Portal de Empleados, capacitación COPASST, y flujo de suscripción/pago
  const trabajadorAllowedPaths = ["/portal-empleados", "/capacitacion-copasst", "/mi-suscripcion", "/checkout"];
  if (user.role === "trabajador" && !trabajadorAllowedPaths.includes(path)) {
    return (
      <Route path={path}>
        <Redirect to="/portal-empleados" />
      </Route>
    );
  }

  // LSO (Licenciados): Pueden acceder a su portal y a cualquier módulo SST para el que
  // tengan permiso (sst_management:view/create/edit, workers:view, etc.).
  // Rutas administrativas que requieren permisos que LSO no tiene quedan bloqueadas
  // por el check hasAccess más abajo.
  // Solo rutas explícitamente excluidas se redirigen al portal.
  const lsoExcludedPaths = [
    "/admin",
    "/crear-empresa",
    "/portal-empleados",
  ];
  const isLsoExcluded = lsoExcludedPaths.some(excluded =>
    path === excluded || path.startsWith(excluded + "/")
  );
  if ((user.role === "lso" || user.role === "lso_externo") && isLsoExcluded) {
    return (
      <Route path={path}>
        <Redirect to="/portal-licenciado" />
      </Route>
    );
  }

  // LSO sin acceso por permisos → redirigir a portal en lugar de "/"
  if ((user.role === "lso" || user.role === "lso_externo") && !hasAccess) {
    return (
      <Route path={path}>
        <Redirect to="/portal-licenciado" />
      </Route>
    );
  }

  // Rutas de pago/suscripción: siempre accesibles para cualquier usuario autenticado
  const paymentPaths = ["/checkout", "/pago-pse", "/planes-suscripcion", "/mi-suscripcion", "/dashboard-facturacion"];
  const isPaymentPath = paymentPaths.some(p => path === p || path.startsWith(p + "/"));

  // Si no tiene acceso a la ruta, redirigir a la página principal
  if (!hasAccess && !isPaymentPath) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
