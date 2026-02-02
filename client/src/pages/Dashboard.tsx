import { StatCard } from "@/components/StatCard";
import { AccidentCard } from "@/components/AccidentCard";
import { TrainingCard } from "@/components/TrainingCard";
import { DashboardPrintLayout } from "@/components/DashboardPrintLayout";
import { PrintDashboardButton } from "@/components/PrintDashboardButton";
import { PHVASummary } from "@/components/PHVASummary";
import { AlertTriangle, GraduationCap, ClipboardCheck, TrendingUp, Building2, ArrowRight, Users, AlertCircle, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { Accident, Training, Worker } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

interface StatsData {
  monthlyAccidents: number;
  prevMonthAccidents: number;
  diasSinAccidentes: number;
  totalTrainings: number;
  totalInspections: number;
  avgCompliance: number;
  totalWorkers: number;
}

export default function Dashboard() {
  console.log("[Dashboard] Component mounting");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  console.log("[Dashboard] User:", user?.role, user?.companyId);
  
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

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    enabled: !!user?.companyId,
  });

  const { data: accidents = [], isLoading: accidentsLoading } = useQuery<Accident[]>({
    queryKey: ["/api/accidents"],
    enabled: !!user?.companyId,
  });

  const { data: trainings = [], isLoading: trainingsLoading, refetch: refetchTrainings } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
    enabled: !!user?.companyId,
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: false, // Only when page is visible
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
    enabled: !!user?.companyId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const getAccidentTypeLabel = (type: string, customType?: string | null) => {
    if (type === "otro" && customType) return customType;
    
    const labels: Record<string, string> = {
      caida: "Caída",
      golpe: "Golpe",
      corte: "Corte",
      quemadura: "Quemadura",
      intoxicacion: "Intoxicación",
      electrocucion: "Electrocución",
      atrapamiento: "Atrapamiento",
      otro: "Otro",
    };
    return labels[type] || type;
  };

  const recentAccidents = accidents
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const upcomingTrainings = trainings
    .filter(t => t.status === "programada" || t.status === "en-curso")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

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
      ) : statsLoading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-base">Cargando estadísticas...</p>
        </div>
      ) : statsError ? (
        <Alert variant="destructive" data-testid="alert-stats-error" className="border-l-4 border-l-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="ml-2">Error al cargar estadísticas</AlertTitle>
          <AlertDescription className="mt-2 ml-7">
            No se pudieron cargar las estadísticas. Intenta recargar la página.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard 
              title="Trabajadores" 
              value={stats?.totalWorkers ?? 0} 
              icon={Users} 
              variant="default"
            />
            <Card data-testid="card-stat-accidentes-del-mes">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Accidentes del Mes</p>
                <AlertTriangle className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-stat-value-accidentes">{stats?.monthlyAccidents ?? 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  {stats && stats.prevMonthAccidents > 0 && (
                    <span className={`text-xs ${stats.monthlyAccidents < stats.prevMonthAccidents ? 'text-chart-2' : stats.monthlyAccidents > stats.prevMonthAccidents ? 'text-chart-4' : 'text-muted-foreground'}`}>
                      {stats.monthlyAccidents < stats.prevMonthAccidents ? '↓' : stats.monthlyAccidents > stats.prevMonthAccidents ? '↑' : '='} vs mes anterior ({stats.prevMonthAccidents})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-chart-2 font-medium" data-testid="text-dias-sin-accidentes">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats?.diasSinAccidentes ?? 0} días sin accidentes
                </div>
              </CardContent>
            </Card>
            <StatCard 
              title="Capacitaciones" 
              value={stats?.totalTrainings ?? 0} 
              icon={GraduationCap} 
              variant="success"
            />
            <StatCard 
              title="Inspecciones" 
              value={stats?.totalInspections ?? 0} 
              icon={ClipboardCheck} 
              variant="default"
            />
            <StatCard 
              title="Cumplimiento" 
              value={`${stats?.avgCompliance ?? 0}%`} 
              icon={TrendingUp} 
              variant="success"
            />
          </div>

          {/* PHVA Cycle Summary - Consolidated View with Traceability */}
          <PHVASummary companyId={user?.companyId} />

          {/* Main Content Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Recent Accidents Section */}
            <Card className="shadow-sm border border-card-border hover-elevate transition-all duration-200">
              <CardHeader className="border-b border-card-border pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-chart-4" />
                  <CardTitle className="text-lg">Accidentes Recientes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {accidentsLoading ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">Cargando accidentes...</p>
                  </div>
                ) : recentAccidents.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="h-8 w-8 text-chart-2 mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground" data-testid="text-no-accidents">
                      No hay accidentes recientes registrados. Esta es una buena señal para la seguridad de su empresa.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAccidents.map((accident) => {
                      const worker = workers.find(w => w.id === accident.workerId);
                      return (
                        <AccidentCard
                          key={accident.id}
                          id={accident.id}
                          type={getAccidentTypeLabel(accident.type, accident.customType)}
                          description={accident.description}
                          severity={accident.severity}
                          date={formatDate(accident.date)}
                          time={accident.time}
                          worker={worker?.name || "Desconocido"}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Trainings Section */}
            <Card className="shadow-sm border border-card-border hover-elevate transition-all duration-200">
              <CardHeader className="border-b border-card-border pb-4 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-chart-2" />
                  <CardTitle className="text-lg">Próximas Capacitaciones</CardTitle>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => refetchTrainings()}
                  disabled={trainingsLoading}
                  data-testid="button-refresh-trainings"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {trainingsLoading ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">Cargando capacitaciones...</p>
                  </div>
                ) : upcomingTrainings.length === 0 ? (
                  <div className="py-8 text-center">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-muted-foreground" data-testid="text-no-trainings">
                      No hay capacitaciones programadas. Programa capacitaciones para mejorar la seguridad.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTrainings.map((training) => (
                      <TrainingCard
                        key={training.id}
                        id={training.id}
                        title={training.title}
                        date={formatDate(training.date)}
                        attendees={0}
                        totalWorkers={training.totalWorkers}
                        status={training.status as "programada" | "completada" | "en-curso"}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
