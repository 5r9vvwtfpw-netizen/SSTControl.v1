import { useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getSelectedCompanyId } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";

type CompanyAccess = { id: string; companySuspended: boolean };

// Mounted only for LSO roles. The portal itself remains accessible regardless
// of a previously selected company's status.
export function LsoCompanyAccessBoundary({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: companies, isPending, isError, isFetching, refetch } = useQuery<CompanyAccess[]>({
    queryKey: ["/api/portal-licenciado/empresas"],
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: "always",
  });
  const companyId = new URLSearchParams(window.location.search).get("empresa")
    || getSelectedCompanyId() || user?.companyId;
  const portalHome = location === "/portal-licenciado";
  const suspended = companies?.find(company => company.id === companyId)?.companySuspended;
  const suspendedIds = companies?.filter(company => company.companySuspended)
    .map(company => company.id).sort().join(",") || "";

  // Drop old operational snapshots when a company is suspended, so reopening
  // an old module cannot show cached records. Keep portal access metadata.
  useEffect(() => {
    if (!suspendedIds) return;
    queryClient.resetQueries({
      predicate: query => {
        const key = String(query.queryKey[0]);
        return key.startsWith("/api/portal-licenciado/") &&
          key !== "/api/portal-licenciado/empresas" &&
          !key.startsWith("/api/portal-licenciado/firma");
      },
    });
  }, [suspendedIds, queryClient]);

  if (portalHome) return <>{children}</>;
  if (isPending) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (suspended || isError) {
    return (
      <div className="mx-auto max-w-xl p-6 pt-16" data-testid="lso-company-access-blocked">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>{suspended ? "Empresa suspendida" : "No se pudo verificar el acceso"}</AlertTitle>
          <AlertDescription>
            {suspended
              ? "Esta empresa está suspendida por el administrador del sistema. Puede continuar trabajando con sus otras empresas. El acceso se restablecerá cuando la empresa sea reactivada."
              : "No se mostrarán los módulos hasta verificar el estado de la empresa."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setLocation("/portal-licenciado")}>Volver a mis empresas</Button>
          <Button variant="outline" disabled={isFetching} onClick={() => refetch()}>Comprobar acceso</Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
