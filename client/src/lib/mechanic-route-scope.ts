export type MechanicModuleScope = "maintenance" | "vehicles" | "inspections";

const MECHANIC_MODULE_ROUTES: Array<{ path: string; scope: MechanicModuleScope }> = [
  { path: "/pesv/mantenimiento", scope: "maintenance" },
  { path: "/pesv/vehiculos", scope: "vehicles" },
  { path: "/pesv/inspecciones", scope: "inspections" },
];

function cleanPath(location: string): string {
  return location.split("?")[0].replace(/\/+$/, "") || "/";
}

export function getMechanicScopeForRoute(location: string): MechanicModuleScope | null {
  const path = cleanPath(location);
  const directRoute = MECHANIC_MODULE_ROUTES.find(({ path: route }) =>
    path === route || path.startsWith(`${route}/`)
  );
  if (directRoute) return directRoute.scope;

  const evaluationRoute = path.match(
    /^\/pesv\/evaluacion\/[^/]+\/(mantenimiento|vehiculos|inspecciones)(?:\/.*)?$/,
  );
  if (!evaluationRoute) return null;
  const scopeBySegment: Record<string, MechanicModuleScope> = {
    mantenimiento: "maintenance",
    vehiculos: "vehicles",
    inspecciones: "inspections",
  };
  return scopeBySegment[evaluationRoute[1]] ?? null;
}

export function isMechanicRouteAllowed(location: string, companyScopes: string[]): boolean {
  const path = cleanPath(location);
  if (path === "/invitaciones-mecanico") return true;

  const requiredScope = getMechanicScopeForRoute(path);
  return requiredScope !== null && companyScopes.includes(requiredScope);
}
