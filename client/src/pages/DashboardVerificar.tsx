import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target,
  TrendingUp,
  FileCheck,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Activity,
  BarChart3,
  FileText
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

interface DashboardVerificarStats {
  objetivos: {
    total: number;
    activos: number;
    cumplidos: number;
    noCumplidos: number;
    porcentajeCumplimiento: number;
    // Campos adicionales (Add-Only - Decreto 1072/2015)
    promedioAvance?: number;
    completadosPorAvance?: number;
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

export default function DashboardVerificar() {
  const { data: stats, isLoading } = useQuery<DashboardVerificarStats>({
    queryKey: ["/api/dashboard-verificar"],
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Cargando panel...</div>;
  }

  const hallazgosData = [
    { name: "Baja", value: stats?.auditorias?.hallazgosPorSeveridad?.baja ?? 0, color: "#10b981" },
    { name: "Media", value: stats?.auditorias?.hallazgosPorSeveridad?.media ?? 0, color: "#f59e0b" },
    { name: "Alta", value: stats?.auditorias?.hallazgosPorSeveridad?.alta ?? 0, color: "#ef4444" },
    { name: "Crítica", value: stats?.auditorias?.hallazgosPorSeveridad?.critica ?? 0, color: "#dc2626" },
  ];

  const indicadoresData = [
    { tipo: "Estructura", cantidad: stats?.indicadores?.estructura ?? 0, fill: "#3b82f6" },
    { tipo: "Proceso", cantidad: stats?.indicadores?.proceso ?? 0, fill: "#8b5cf6" },
    { tipo: "Resultado", cantidad: stats?.indicadores?.resultado ?? 0, fill: "#10b981" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-black" data-testid="text-dashboard-verificar-title">Panel VERIFICAR</h1>
          <p className="text-muted-foreground">Indicadores SG-SST en Tiempo Real - Fase VERIFICAR del Ciclo PHVA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card data-testid="card-cumplimiento-objetivos">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Objetivos</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-cumplimiento-objetivos">
              {stats?.objetivos?.porcentajeCumplimiento ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.objetivos?.cumplidos ?? 0} de {stats?.objetivos?.total ?? 0} cumplidos
            </p>
          </CardContent>
        </Card>

        {/* Card adicional: Avance de Objetivos (Add-Only - Decreto 1072/2015) */}
        <Card data-testid="card-avance-objetivos">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avance Objetivos</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-avance-objetivos">
              {stats?.objetivos?.promedioAvance ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.objetivos?.completadosPorAvance ?? 0} con 100% avance
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-conformidad-auditorias">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidad Auditorías</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-conformidad-auditorias">
              {stats?.auditorias?.porcentajeConformidad ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.auditorias?.completadas ?? 0} auditorías completadas
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cumplimiento-normativo">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento 0312/2019</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-cumplimiento-normativo">
              {stats?.cumplimientoNormativo?.ultimaEvaluacion ?? 'N/A'}
              {stats?.cumplimientoNormativo?.ultimaEvaluacion != null && '%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.cumplimientoNormativo?.fechaUltimaEvaluacion 
                ? `Última eval: ${stats.cumplimientoNormativo.fechaUltimaEvaluacion}` 
                : 'Sin evaluación'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Objetivos SST - {new Date().getFullYear()}
          </CardTitle>
          <CardDescription>Seguimiento del cumplimiento de objetivos del Sistema de Gestión</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Objetivos</p>
              <p className="text-2xl font-bold" data-testid="text-objetivos-total">{stats?.objetivos?.total ?? 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold text-blue-600" data-testid="text-objetivos-activos">{stats?.objetivos?.activos ?? 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cumplidos</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-objetivos-cumplidos">{stats?.objetivos?.cumplidos ?? 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No Cumplidos</p>
              <p className="text-2xl font-bold text-red-600" data-testid="text-objetivos-no-cumplidos">{stats?.objetivos?.noCumplidos ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Indicadores SST
            </CardTitle>
            <CardDescription>Clasificación por tipo (Decreto 1072/2015)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Indicadores Activos</span>
                <span className="text-lg font-bold" data-testid="text-indicadores-total">{stats?.indicadores?.total ?? 0}</span>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={indicadoresData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center justify-between">
                  <span>Mediciones último mes:</span>
                  <span className="font-medium" data-testid="text-mediciones-recientes">{stats?.indicadores?.ultimasMediciones ?? 0}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              Hallazgos de Auditorías
            </CardTitle>
            <CardDescription>Distribución por severidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hallazgosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hallazgosData.map((entry, index) => (
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
                <span>Baja: {stats?.auditorias?.hallazgosPorSeveridad?.baja ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Media: {stats?.auditorias?.hallazgosPorSeveridad?.media ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Alta: {stats?.auditorias?.hallazgosPorSeveridad?.alta ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Crítica: {stats?.auditorias?.hallazgosPorSeveridad?.critica ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Auditorías Internas {new Date().getFullYear()}
            </CardTitle>
            <CardDescription>Estado de auditorías programadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Año</span>
              <span className="font-bold" data-testid="text-auditorias-total">{stats?.auditorias?.totalAnio ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completadas
              </span>
              <span className="font-bold text-green-600" data-testid="text-auditorias-completadas">{stats?.auditorias?.completadas ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                En Curso
              </span>
              <span className="font-bold text-blue-600" data-testid="text-auditorias-en-curso">{stats?.auditorias?.enCurso ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                Programadas
              </span>
              <span className="font-bold" data-testid="text-auditorias-programadas">{stats?.auditorias?.programadas ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Revisiones por Dirección {new Date().getFullYear()}
            </CardTitle>
            <CardDescription>Seguimiento de decisiones gerenciales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Año</span>
              <span className="font-bold" data-testid="text-revisiones-total">{stats?.revisiones?.totalAnio ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completadas</span>
              <span className="font-bold text-green-600" data-testid="text-revisiones-completadas">{stats?.revisiones?.completadas ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Decisiones Tomadas</span>
              <span className="font-bold text-blue-600" data-testid="text-revisiones-decisiones">{stats?.revisiones?.decisionesTomadas ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Acciones Pendientes</span>
              <span className="font-bold text-yellow-600" data-testid="text-revisiones-acciones-pendientes">{stats?.revisiones?.accionesPendientes ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tendencia de Accidentalidad
          </CardTitle>
          <CardDescription>Últimos 6 meses - Indicador de resultado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total {new Date().getFullYear()}</p>
                <p className="text-2xl font-bold" data-testid="text-accidentes-anio">{stats?.accidentalidad?.totalAccidentes ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Mes</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-accidentes-mes">{stats?.accidentalidad?.accidentesUltimoMes ?? 0}</p>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.accidentalidad?.tendenciaMensual ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cantidad" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {(stats?.auditorias?.hallazgosPorSeveridad?.critica ?? 0) > 0 && (
        <Card className="border-red-600" data-testid="card-alert-critical">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <CardTitle className="text-sm font-medium">Hallazgos Críticos Detectados</CardTitle>
              <CardDescription>
                Se encontraron {stats?.auditorias?.hallazgosPorSeveridad?.critica} hallazgos de severidad crítica que requieren atención inmediata
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {(stats?.revisiones?.accionesPendientes ?? 0) > 0 && (
        <Card className="border-yellow-600" data-testid="card-alert-acciones">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <CardTitle className="text-sm font-medium">Acciones de Dirección Pendientes</CardTitle>
              <CardDescription>
                Hay {stats?.revisiones?.accionesPendientes} acciones derivadas de Revisiones por Dirección pendientes de completar
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Análisis VERIFICAR</CardTitle>
          <CardDescription>Insights clave sobre el desempeño del SG-SST</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Cumplimiento de Objetivos</p>
              <p className="text-sm text-muted-foreground">
                {stats?.objetivos?.porcentajeCumplimiento ?? 0}% de los objetivos SST del año {new Date().getFullYear()} han sido cumplidos.
                {(stats?.objetivos?.porcentajeCumplimiento ?? 0) >= 80 ? (
                  <span className="text-green-600 font-medium"> Excelente desempeño.</span>
                ) : (stats?.objetivos?.porcentajeCumplimiento ?? 0) >= 60 ? (
                  <span className="text-yellow-600 font-medium"> Requiere seguimiento.</span>
                ) : (
                  <span className="text-red-600 font-medium"> Necesita atención urgente.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <FileCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Efectividad de Auditorías</p>
              <p className="text-sm text-muted-foreground">
                Se han completado {stats?.auditorias?.completadas ?? 0} auditorías internas con un {stats?.auditorias?.porcentajeConformidad ?? 0}% de conformidad,
                lo que indica {(stats?.auditorias?.porcentajeConformidad ?? 0) >= 80 ? 'un alto nivel' : 'oportunidades de mejora'} en la implementación del SG-SST.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Cumplimiento Normativo</p>
              <p className="text-sm text-muted-foreground">
                {stats?.cumplimientoNormativo?.ultimaEvaluacion != null ? (
                  <>
                    Última evaluación de estándares mínimos (Res. 0312/2019): {stats?.cumplimientoNormativo?.ultimaEvaluacion}%.
                    {' '}{(stats?.cumplimientoNormativo?.estandaresCriticos ?? 0) > 0 && (
                      <span className="text-red-600 font-medium">
                        Atención: {stats?.cumplimientoNormativo?.estandaresCriticos} estándares críticos sin cumplir.
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-yellow-600 font-medium">No se ha realizado una evaluación de cumplimiento normativo.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Medición de Indicadores</p>
              <p className="text-sm text-muted-foreground">
                Se han registrado {stats?.indicadores?.ultimasMediciones ?? 0} mediciones de indicadores en el último mes,
                permitiendo un seguimiento {(stats?.indicadores?.ultimasMediciones ?? 0) >= (stats?.indicadores?.total ?? 0) * 0.8 ? 'adecuado' : 'parcial'} del desempeño del sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
