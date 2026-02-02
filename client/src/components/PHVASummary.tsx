import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  FileText, 
  Wrench, 
  CheckSquare, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Target,
  ClipboardCheck,
  Activity
} from "lucide-react";

interface DashboardHacerStats {
  totalInspecciones: number;
  peligrosVinculados: number;
  controlState: {
    conforme: number;
    noConforme: number;
    observacion: number;
  };
  trabajadoresConRiesgos: number;
  peligrosIdentificados: number;
  controlesPendientesVerificacion: number;
  porcentajeConformidad: number;
}

interface DashboardVerificarStats {
  objetivos: {
    total: number;
    activos: number;
    cumplidos: number;
    noCumplidos: number;
    porcentajeCumplimiento: number;
  };
  indicadores: {
    total: number;
    estructura: number;
    proceso: number;
    resultado: number;
    ultimasMediciones: number;
  };
  auditorias: {
    totalAnio: number;
    completadas: number;
    enCurso: number;
    programadas: number;
    hallazgosPorSeveridad: {
      baja: number;
      media: number;
      alta: number;
      critica: number;
    };
    porcentajeConformidad: number;
  };
  revisiones: {
    totalAnio: number;
    completadas: number;
    enEjecucion: number;
    programadas: number;
    decisionesTomadas: number;
    accionesPendientes: number;
  };
  cumplimientoNormativo: {
    ultimaEvaluacion: number | null;
    fechaUltimaEvaluacion: string | null;
    estandaresCriticos: number;
    estandaresCumplidos: number;
  };
  accidentalidad: {
    totalAccidentes: number;
    accidentesUltimoMes: number;
    tendenciaMensual: Array<{ mes: string; cantidad: number }>;
  };
}

interface DashboardActuarStats {
  accionesMejora: {
    total: number;
    completadas: number;
    enProceso: number;
    pendientes: number;
    vencidas: number;
    porcentajeCompletitud: number;
    eficacia: {
      eficaces: number;
      noEficaces: number;
      noVerificadas: number;
      porcentajeEficacia: number;
    };
    porPrioridad: {
      baja: number;
      media: number;
      alta: number;
      critica: number;
    };
    promedioAvance: number;
  };
  accionesRevision: {
    total: number;
    completadas: number;
    enProceso: number;
    pendientes: number;
    vencidas: number;
    porcentajeCompletitud: number;
    eficacia: {
      eficaces: number;
      noEficaces: number;
      noVerificadas: number;
      porcentajeEficacia: number;
    };
    porPrioridad: {
      baja: number;
      media: number;
      alta: number;
      critica: number;
    };
    promedioAvance: number;
  };
  planTrabajo: {
    porcentajeCumplimiento: number;
    actividadesCompletadas: number;
    totalActividades: number;
  };
  consolidado: {
    totalAcciones: number;
    tasaCompletitud: number;
    tasaEficacia: number;
    accionesVencidasTotal: number;
  };
}

interface PHVASummaryProps {
  companyId?: number | string | null;
}

export function PHVASummary({ companyId }: PHVASummaryProps) {
  const { data: hacerStats, isLoading: hacerLoading } = useQuery<DashboardHacerStats>({
    queryKey: ["/api/dashboard-hacer"],
    enabled: !!companyId,
  });

  const { data: verificarStats, isLoading: verificarLoading } = useQuery<DashboardVerificarStats>({
    queryKey: ["/api/dashboard-verificar"],
    enabled: !!companyId,
  });

  const { data: actuarStats, isLoading: actuarLoading } = useQuery<DashboardActuarStats>({
    queryKey: ["/api/dashboard-actuar"],
    enabled: !!companyId,
  });

  const isLoading = hacerLoading || verificarLoading || actuarLoading;

  if (!companyId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Ciclo PHVA - Consolidado
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const phvaCards = [
    {
      phase: "PLANEAR",
      icon: FileText,
      color: "blue",
      bgGradient: "from-blue-50 to-transparent dark:from-blue-950/30",
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-700 dark:text-blue-300",
      link: "/dashboard-planear",
      linkLabel: "Ver Panel PLANEAR",
      metrics: [
        { 
          label: "Cumplimiento 0312", 
          value: verificarStats?.cumplimientoNormativo?.ultimaEvaluacion != null 
            ? `${verificarStats.cumplimientoNormativo.ultimaEvaluacion}%` 
            : "N/A" 
        },
        { 
          label: "Objetivos Activos", 
          value: verificarStats?.objetivos?.activos ?? 0 
        },
      ],
    },
    {
      phase: "HACER",
      icon: Wrench,
      color: "green",
      bgGradient: "from-green-50 to-transparent dark:from-green-950/30",
      borderColor: "border-l-green-500",
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-700 dark:text-green-300",
      link: "/dashboard-hacer",
      linkLabel: "Ver Panel HACER",
      metrics: [
        { 
          label: "Inspecciones", 
          value: hacerStats?.totalInspecciones ?? 0 
        },
        { 
          label: "Conformidad", 
          value: `${hacerStats?.porcentajeConformidad ?? 0}%` 
        },
      ],
    },
    {
      phase: "VERIFICAR",
      icon: CheckSquare,
      color: "purple",
      bgGradient: "from-purple-50 to-transparent dark:from-purple-950/30",
      borderColor: "border-l-purple-500",
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-700 dark:text-purple-300",
      link: "/dashboard-verificar",
      linkLabel: "Ver Panel VERIFICAR",
      metrics: [
        { 
          label: "Auditorías", 
          value: verificarStats?.auditorias?.completadas ?? 0 
        },
        { 
          label: "Indicadores", 
          value: verificarStats?.indicadores?.total ?? 0 
        },
      ],
    },
    {
      phase: "ACTUAR",
      icon: RefreshCw,
      color: "amber",
      bgGradient: "from-amber-50 to-transparent dark:from-amber-950/30",
      borderColor: "border-l-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-amber-700 dark:text-amber-300",
      link: "/dashboard-actuar",
      linkLabel: "Ver Panel ACTUAR",
      metrics: [
        { 
          label: "Acciones", 
          value: actuarStats?.consolidado?.totalAcciones ?? 0 
        },
        { 
          label: "Completitud", 
          value: `${actuarStats?.consolidado?.tasaCompletitud ?? 0}%` 
        },
      ],
    },
  ];

  const hasVencidas = (actuarStats?.consolidado?.accionesVencidasTotal ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-phva-title">
          <Activity className="h-6 w-6 text-primary" />
          Ciclo PHVA - Consolidado
        </h2>
        <p className="text-sm text-muted-foreground">
          Resumen del Sistema de Gestión SST
        </p>
      </div>

      {hasVencidas && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{actuarStats?.consolidado?.accionesVencidasTotal}</strong> acciones vencidas requieren atención inmediata
          </span>
          <Link href="/dashboard-actuar">
            <Button variant="ghost" size="sm" className="ml-auto gap-1 text-amber-700" data-testid="link-acciones-vencidas">
              Ver detalle <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {phvaCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.phase}
              className={`${card.borderColor} border-l-4 bg-gradient-to-r ${card.bgGradient} hover-elevate transition-all duration-200`}
              data-testid={`card-phva-${card.phase.toLowerCase()}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.phase}</CardTitle>
                <div className={`rounded-full ${card.iconBg} p-2`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {card.metrics.map((metric, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className={`text-lg font-bold ${card.textColor}`} data-testid={`text-${card.phase.toLowerCase()}-metric-${idx}`}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
                <Link href={card.link}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full gap-1 text-xs mt-2"
                    data-testid={`link-${card.phase.toLowerCase()}-detail`}
                  >
                    {card.linkLabel} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50 to-transparent dark:from-rose-950/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peligros Identificados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300" data-testid="text-peligros-total">
              {hacerStats?.peligrosIdentificados ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {hacerStats?.peligrosVinculados ?? 0} vinculados a controles
            </p>
            <Link href="/iperc">
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs mt-2" data-testid="link-iperc">
                Ver Matriz IPERC <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-transparent dark:from-cyan-950/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos SST</CardTitle>
            <Target className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300" data-testid="text-objetivos-cumplimiento">
              {verificarStats?.objetivos?.porcentajeCumplimiento ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {verificarStats?.objetivos?.cumplidos ?? 0} de {verificarStats?.objetivos?.total ?? 0} cumplidos
            </p>
            <Link href="/objetivos-sst">
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs mt-2" data-testid="link-objetivos">
                Ver Objetivos <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan de Trabajo</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-plan-cumplimiento">
              {actuarStats?.planTrabajo?.porcentajeCumplimiento ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {actuarStats?.planTrabajo?.actividadesCompletadas ?? 0} de {actuarStats?.planTrabajo?.totalActividades ?? 0} actividades
            </p>
            <Link href="/planes-trabajo-anual">
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs mt-2" data-testid="link-plan-trabajo">
                Ver Plan Anual <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
