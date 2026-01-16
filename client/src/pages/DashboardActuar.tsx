import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  RefreshCw,
  BarChart3,
  Activity
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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

export default function DashboardActuar() {
  const { data: stats, isLoading } = useQuery<DashboardActuarStats>({
    queryKey: ["/api/dashboard-actuar"],
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Cargando panel...</div>;
  }

  const statusDataMejora = [
    { name: "Completadas", value: stats?.accionesMejora?.completadas ?? 0, color: "#10b981" },
    { name: "En Proceso", value: stats?.accionesMejora?.enProceso ?? 0, color: "#3b82f6" },
    { name: "Pendientes", value: stats?.accionesMejora?.pendientes ?? 0, color: "#f59e0b" },
    { name: "Vencidas", value: stats?.accionesMejora?.vencidas ?? 0, color: "#ef4444" },
  ];

  const eficaciaDataMejora = [
    { name: "Eficaces", value: stats?.accionesMejora?.eficacia?.eficaces ?? 0, color: "#10b981" },
    { name: "No Eficaces", value: stats?.accionesMejora?.eficacia?.noEficaces ?? 0, color: "#ef4444" },
    { name: "No Verificadas", value: stats?.accionesMejora?.eficacia?.noVerificadas ?? 0, color: "#9ca3af" },
  ];

  const prioridadData = [
    { prioridad: "Baja", cantidad: stats?.accionesMejora?.porPrioridad?.baja ?? 0, fill: "#10b981" },
    { prioridad: "Media", cantidad: stats?.accionesMejora?.porPrioridad?.media ?? 0, fill: "#f59e0b" },
    { prioridad: "Alta", cantidad: stats?.accionesMejora?.porPrioridad?.alta ?? 0, fill: "#ef4444" },
    { prioridad: "Crítica", cantidad: stats?.accionesMejora?.porPrioridad?.critica ?? 0, fill: "#dc2626" },
  ];

  const hasVencidasCriticas = (stats?.consolidado?.accionesVencidasTotal ?? 0) > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-black" data-testid="text-dashboard-actuar-title">Panel ACTUAR</h1>
          <p className="text-muted-foreground">Eficacia de Acciones Correctivas y Preventivas - Fase ACTUAR del Ciclo PHVA</p>
        </div>
      </div>

      {hasVencidasCriticas && (
        <Card className="border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-950/20" data-testid="alert-vencidas">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Acciones Vencidas Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Hay <strong>{stats?.consolidado?.accionesVencidasTotal}</strong> acciones con fecha de compromiso vencida que requieren seguimiento inmediato.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-acciones">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-total-acciones">
              {stats?.consolidado?.totalAcciones ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Mejora + Revisión
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completitud">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Completitud</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-tasa-completitud">
              {stats?.consolidado?.tasaCompletitud ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Acciones completadas
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-eficacia">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Eficacia</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-tasa-eficacia">
              {stats?.consolidado?.tasaEficacia ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              De acciones verificadas
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-plan-trabajo">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Trabajo Anual</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-plan-trabajo">
              {stats?.planTrabajo?.porcentajeCumplimiento ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.planTrabajo?.actividadesCompletadas ?? 0} de {stats?.planTrabajo?.totalActividades ?? 0} actividades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Acciones de Mejora (Evaluaciones SST)
            </CardTitle>
            <CardDescription>Estado y avance de acciones correctivas y preventivas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold" data-testid="text-mejora-total">{stats?.accionesMejora?.total ?? 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Completitud</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-mejora-completitud">
                  {stats?.accionesMejora?.porcentajeCompletitud ?? 0}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avance Promedio</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-mejora-avance">
                  {stats?.accionesMejora?.promedioAvance ?? 0}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-mejora-vencidas">
                  {stats?.accionesMejora?.vencidas ?? 0}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Completadas
                </span>
                <span className="font-bold">{stats?.accionesMejora?.completadas ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  En Proceso
                </span>
                <span className="font-bold">{stats?.accionesMejora?.enProceso ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pendientes
                </span>
                <span className="font-bold">{stats?.accionesMejora?.pendientes ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Vencidas
                </span>
                <span className="font-bold">{stats?.accionesMejora?.vencidas ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              Acciones de Revisión (Dirección)
            </CardTitle>
            <CardDescription>Decisiones derivadas de revisiones por la dirección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold" data-testid="text-revision-total">{stats?.accionesRevision?.total ?? 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Completitud</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-revision-completitud">
                  {stats?.accionesRevision?.porcentajeCompletitud ?? 0}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avance Promedio</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-revision-avance">
                  {stats?.accionesRevision?.promedioAvance ?? 0}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-revision-vencidas">
                  {stats?.accionesRevision?.vencidas ?? 0}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Completadas
                </span>
                <span className="font-bold">{stats?.accionesRevision?.completadas ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  En Proceso
                </span>
                <span className="font-bold">{stats?.accionesRevision?.enProceso ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pendientes
                </span>
                <span className="font-bold">{stats?.accionesRevision?.pendientes ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Vencidas
                </span>
                <span className="font-bold">{stats?.accionesRevision?.vencidas ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Estado Acciones de Mejora
            </CardTitle>
            <CardDescription>Distribución por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDataMejora}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDataMejora.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Completadas: {stats?.accionesMejora?.completadas ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>En Proceso: {stats?.accionesMejora?.enProceso ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Pendientes: {stats?.accionesMejora?.pendientes ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Vencidas: {stats?.accionesMejora?.vencidas ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Verificación de Eficacia
            </CardTitle>
            <CardDescription>Resultados de verificación de acciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eficaciaDataMejora}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eficaciaDataMejora.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Eficaces
                </span>
                <span className="font-bold">{stats?.accionesMejora?.eficacia?.eficaces ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  No Eficaces
                </span>
                <span className="font-bold">{stats?.accionesMejora?.eficacia?.noEficaces ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  No Verificadas
                </span>
                <span className="font-bold">{stats?.accionesMejora?.eficacia?.noVerificadas ?? 0}</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between font-medium">
                <span>Tasa Eficacia:</span>
                <span className="text-blue-600">{stats?.accionesMejora?.eficacia?.porcentajeEficacia ?? 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Distribución por Prioridad
          </CardTitle>
          <CardDescription>Clasificación de acciones de mejora por nivel de prioridad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prioridadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prioridad" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" name="Cantidad de Acciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <RefreshCw className="h-5 w-5" />
            Insights - Mejora Continua
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
          <p>
            <strong>VERIFICAR → ACTUAR:</strong> Las acciones de mejora se generan automáticamente de las evaluaciones SST 
            (Estándares Mínimos) cuando se detectan incumplimientos. Las acciones de revisión provienen de las decisiones 
            tomadas en las Revisiones por Dirección.
          </p>
          <p>
            <strong>Eficacia de Acciones:</strong> La tasa de eficacia ({stats?.consolidado?.tasaEficacia ?? 0}%) mide qué porcentaje 
            de las acciones verificadas realmente resolvieron el problema raíz. Las acciones "No Eficaces" generan nuevas acciones 
            (re-planning) para cerrar el ciclo PHVA.
          </p>
          <p>
            <strong>ACTUAR → PLANEAR:</strong> El ciclo se cierra cuando las acciones eficaces mejoran el cumplimiento normativo 
            (verificado en próxima evaluación SST) o cuando las acciones no eficaces generan nueva planificación en la Matriz IPERC 
            o el Plan de Trabajo Anual.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
