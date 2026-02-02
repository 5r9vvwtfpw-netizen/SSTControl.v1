import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText,
  Calendar,
  Target,
  Scale,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DashboardPlanearStats {
  evaluaciones: {
    total: number;
    ultimaEvaluacion: number | null;
    fechaUltimaEvaluacion: string | null;
    estandaresCriticos: number;
    tendenciaMejora: boolean;
  };
  planTrabajo: {
    planesActivos: number;
    porcentajeCumplimiento: number;
    actividadesCompletadas: number;
    actividadesPendientes: number;
    actividadesVencidas: number;
  };
  objetivos: {
    total: number;
    activos: number;
    cumplidos: number;
    porVencer: number;
  };
  matrizLegal: {
    requisitosIdentificados: number;
    actualizadosEsteAnio: number;
  };
  peligros: {
    identificados: number;
    altoRiesgo: number;
    controlados: number;
  };
  politicas: {
    vigentes: number;
    porActualizar: number;
  };
}

export default function DashboardPlanear() {
  const { data: stats, isLoading } = useQuery<DashboardPlanearStats>({
    queryKey: ["/api/dashboard-planear"],
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Cargando panel...</div>;
  }

  const objetivosData = [
    { name: "Activos", value: stats?.objetivos?.activos ?? 0, color: "#3b82f6" },
    { name: "Cumplidos", value: stats?.objetivos?.cumplidos ?? 0, color: "#10b981" },
    { name: "Por Vencer", value: stats?.objetivos?.porVencer ?? 0, color: "#f59e0b" },
  ];

  const peligrosData = [
    { name: "Alto Riesgo", value: stats?.peligros?.altoRiesgo ?? 0, color: "#ef4444" },
    { name: "Controlados", value: stats?.peligros?.controlados ?? 0, color: "#10b981" },
    { name: "Otros", value: Math.max(0, (stats?.peligros?.identificados ?? 0) - (stats?.peligros?.altoRiesgo ?? 0) - (stats?.peligros?.controlados ?? 0)), color: "#6b7280" },
  ];

  const planTrabajoData = [
    { name: "Completadas", value: stats?.planTrabajo?.actividadesCompletadas ?? 0, fill: "#10b981" },
    { name: "Pendientes", value: stats?.planTrabajo?.actividadesPendientes ?? 0, fill: "#3b82f6" },
    { name: "Vencidas", value: stats?.planTrabajo?.actividadesVencidas ?? 0, fill: "#ef4444" },
  ];

  const hasEstandaresCriticos = (stats?.evaluaciones?.estandaresCriticos ?? 0) > 0;
  const hasActividadesVencidas = (stats?.planTrabajo?.actividadesVencidas ?? 0) > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-black" data-testid="text-dashboard-planear-title">Panel PLANEAR</h1>
          <p className="text-muted-foreground">Planificación del SG-SST - Fase PLANEAR del Ciclo PHVA</p>
        </div>
      </div>

      {(hasEstandaresCriticos || hasActividadesVencidas) && (
        <Card className="border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-950/20" data-testid="alert-planear-critico">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Planificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
            {hasEstandaresCriticos && (
              <p>
                Hay <strong>{stats?.evaluaciones?.estandaresCriticos}</strong> estándares críticos sin cumplir que requieren planificación de mejora.
              </p>
            )}
            {hasActividadesVencidas && (
              <p>
                Hay <strong>{stats?.planTrabajo?.actividadesVencidas}</strong> actividades del Plan de Trabajo con fecha vencida.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pl-0" data-testid="card-evaluacion-sst">
          <div className="flex">
            <div className="w-1 bg-blue-500 rounded-l-lg"></div>
            <div className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Evaluación SST</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-cumplimiento-0312">
                  {stats?.evaluaciones?.ultimaEvaluacion != null ? `${stats.evaluaciones.ultimaEvaluacion}%` : "N/A"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    Cumplimiento Res. 0312/2019
                  </p>
                  {stats?.evaluaciones?.tendenciaMejora ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                {stats?.evaluaciones?.fechaUltimaEvaluacion && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Última: {new Date(stats.evaluaciones.fechaUltimaEvaluacion).toLocaleDateString('es-CO')}
                  </p>
                )}
              </CardContent>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pl-0" data-testid="card-plan-trabajo">
          <div className="flex">
            <div className="w-1 bg-blue-500 rounded-l-lg"></div>
            <div className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan de Trabajo Anual</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-cumplimiento-plan">
                  {stats?.planTrabajo?.porcentajeCumplimiento ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.planTrabajo?.actividadesCompletadas ?? 0} completadas / {(stats?.planTrabajo?.actividadesCompletadas ?? 0) + (stats?.planTrabajo?.actividadesPendientes ?? 0)} totales
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.planTrabajo?.planesActivos ?? 0} plan(es) activo(s) este año
                </p>
              </CardContent>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pl-0" data-testid="card-objetivos">
          <div className="flex">
            <div className="w-1 bg-blue-500 rounded-l-lg"></div>
            <div className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Objetivos SST</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-objetivos-activos">
                  {stats?.objetivos?.activos ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Objetivos activos de {stats?.objetivos?.total ?? 0} totales
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.objetivos?.cumplidos ?? 0} cumplidos | {stats?.objetivos?.porVencer ?? 0} por vencer
                </p>
              </CardContent>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pl-0" data-testid="card-matriz-legal">
          <div className="flex">
            <div className="w-1 bg-blue-500 rounded-l-lg"></div>
            <div className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matriz Legal</CardTitle>
                <Scale className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-requisitos-identificados">
                  {stats?.matrizLegal?.requisitosIdentificados ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requisitos identificados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.matrizLegal?.actualizadosEsteAnio ?? 0} actualizados este año
                </p>
              </CardContent>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pl-0" data-testid="card-peligros">
          <div className="flex">
            <div className="w-1 bg-blue-500 rounded-l-lg"></div>
            <div className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peligros IPERC</CardTitle>
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-peligros-identificados">
                  {stats?.peligros?.identificados ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Peligros identificados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-600 font-medium">{stats?.peligros?.altoRiesgo ?? 0}</span> alto riesgo | <span className="text-green-600 font-medium">{stats?.peligros?.controlados ?? 0}</span> controlados
                </p>
              </CardContent>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 pl-0" data-testid="card-politicas">
          <div className="flex">
            <div className="w-1 bg-blue-500 rounded-l-lg"></div>
            <div className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Políticas SST</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-politicas-vigentes">
                  {stats?.politicas?.vigentes ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Políticas vigentes
                </p>
                {(stats?.politicas?.porActualizar ?? 0) > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {stats?.politicas?.porActualizar} requieren actualización
                  </p>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Estado de Objetivos SST
            </CardTitle>
            <CardDescription>Distribución por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={objetivosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {objetivosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Activos: {stats?.objetivos?.activos ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Cumplidos: {stats?.objetivos?.cumplidos ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Por Vencer: {stats?.objetivos?.porVencer ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Clasificación de Peligros
            </CardTitle>
            <CardDescription>Estado de control de peligros identificados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={peligrosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {peligrosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Alto Riesgo: {stats?.peligros?.altoRiesgo ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Controlados: {stats?.peligros?.controlados ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>Otros: {Math.max(0, (stats?.peligros?.identificados ?? 0) - (stats?.peligros?.altoRiesgo ?? 0) - (stats?.peligros?.controlados ?? 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Plan de Trabajo Anual - Estado de Actividades
          </CardTitle>
          <CardDescription>Distribución de actividades por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planTrabajoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad de Actividades" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Activity className="h-5 w-5" />
            Insights - Fase PLANEAR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
          <p>
            <strong>Evaluación Inicial:</strong> La evaluación SST según Resolución 0312/2019 identifica el estado actual del 
            SG-SST y genera insumos para la planificación. Los estándares críticos ({stats?.evaluaciones?.estandaresCriticos ?? 0}) 
            deben incluirse en el Plan de Trabajo Anual.
          </p>
          <p>
            <strong>Identificación de Peligros:</strong> La matriz IPERC ha identificado {stats?.peligros?.identificados ?? 0} peligros, 
            de los cuales {stats?.peligros?.altoRiesgo ?? 0} son de alto riesgo y requieren controles prioritarios.
          </p>
          <p>
            <strong>PLANEAR → HACER:</strong> Los objetivos SST ({stats?.objetivos?.activos ?? 0} activos) y el Plan de Trabajo Anual 
            ({stats?.planTrabajo?.porcentajeCumplimiento ?? 0}% cumplimiento) guían la implementación de controles en la fase HACER.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
