import { PHVASummary } from "@/components/PHVASummary";
import { Building2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect LSO users to their dedicated portal
  useEffect(() => {
    if (user?.role === 'lso') {
      navigate('/portal-licenciado');
    }
  }, [user?.role, navigate]);
  
  // If LSO, don't render the dashboard
  if (user?.role === 'lso') {
    return null;
  }
  
  const needsCompanySetup = !user?.companyId;

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
              Panel de Control
            </h1>
            <p className="text-base text-muted-foreground">
              Resumen del sistema de Salud y Seguridad en el Trabajo
            </p>
          </div>
        </div>
      </div>

      {/* Setup Alert */}
      {needsCompanySetup && (
        <Alert className="border-l-4 border-l-chart-3 bg-gradient-to-r from-muted/50 to-background" data-testid="alert-setup-company">
          <Building2 className="h-5 w-5 text-chart-3" />
          <AlertTitle className="text-lg font-semibold text-foreground ml-2">
            Configura tu empresa para comenzar
          </AlertTitle>
          <AlertDescription className="text-muted-foreground mt-2 ml-7">
            Para acceder a todas las funcionalidades del sistema, necesitas registrar los datos de tu empresa.
            <div className="mt-4">
              <Link href="/crear-empresa">
                <Button size="sm" className="gap-2 mt-2" data-testid="button-setup-company">
                  Configurar Empresa <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* No Data State */}
      {needsCompanySetup ? (
        <Alert className="border-l-4 border-l-muted bg-muted/30" data-testid="alert-no-stats">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <AlertTitle className="text-foreground ml-2">Sin datos disponibles</AlertTitle>
          <AlertDescription className="text-muted-foreground mt-2 ml-7">
            Configura tu empresa para ver las estadísticas del dashboard.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* PHVA Cycle Summary - Consolidated View with Traceability */}
          <PHVASummary companyId={user?.companyId} />
        </>
      )}
    </div>
  );
}
