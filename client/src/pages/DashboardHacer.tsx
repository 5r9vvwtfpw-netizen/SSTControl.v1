import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YearSelector } from "@/components/dashboard/YearSelector";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Users, 
  Shield, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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

export default function DashboardHacer() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { data: stats, isLoading } = useQuery<DashboardHacerStats>({
    queryKey: ["/api/dashboard-hacer", selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard-hacer?year=${selectedYear}`);
      if (!response.ok) throw new Error("Error al cargar dashboard");
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Cargando panel...</div>;
  }

  // Prepare data for pie chart
  const controlStateData = [
    { name: "Conforme", value: stats?.controlState.conforme || 0, color: "#10b981" },
    { name: "No Conforme", value: stats?.controlState.noConforme || 0, color: "#ef4444" },
    { name: "Observación", value: stats?.controlState.observacion || 0, color: "#f59e0b" },
  ];

  // Prepare data for bar chart - comparison
  const comparisonData = [
    { 
      name: "Riesgos", 
      Identificados: stats?.peligrosIdentificados || 0, 
      Vinculados: stats?.peligrosVinculados || 0 
    },
  ];

  const chartConfig = {
    conforme: { label: "Conforme", color: "hsl(var(--chart-2))" },
    noConforme: { label: "No Conforme", color: "hsl(var(--chart-4))" },
    observacion: { label: "Observación", color: "hsl(var(--chart-3))" },
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black" data-testid="text-dashboard-hacer-title">Panel HACER</h1>
          <p className="text-muted-foreground">Métricas de Controles Operacionales - Fase HACER del Ciclo PHVA</p>
        </div>
        <YearSelector 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear}
          minYear={2020}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-inspecciones">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inspecciones</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-inspecciones">{stats?.totalInspecciones || 0}</div>
            <p className="text-xs text-muted-foreground">Inspecciones realizadas</p>
          </CardContent>
        </Card>

        <Card data-testid="card-peligros-vinculados">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peligros Vinculados</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-peligros-vinculados">{stats?.peligrosVinculados || 0}</div>
            <p className="text-xs text-muted-foreground">De {stats?.peligrosIdentificados || 0} identificados</p>
          </CardContent>
        </Card>

        <Card data-testid="card-trabajadores-riesgos">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores con Riesgos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-trabajadores-riesgos">{stats?.trabajadoresConRiesgos || 0}</div>
            <p className="text-xs text-muted-foreground">Con riesgos asignados</p>
          </CardContent>
        </Card>

        <Card data-testid="card-conformidad">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Conformidad</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-porcentaje-conformidad">{stats?.porcentajeConformidad || 0}%</div>
            <p className="text-xs text-muted-foreground">Controles conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* Control State Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-conforme">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-conforme">{stats?.controlState.conforme || 0}</div>
            <p className="text-xs text-muted-foreground">Controles verificados como conformes</p>
          </CardContent>
        </Card>

        <Card data-testid="card-no-conforme">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Conformes</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-no-conforme">{stats?.controlState.noConforme || 0}</div>
            <p className="text-xs text-muted-foreground">Requieren acción correctiva</p>
          </CardContent>
        </Card>

        <Card data-testid="card-observacion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Observaciones</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-observacion">{stats?.controlState.observacion || 0}</div>
            <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending controls */}
      {(stats?.controlesPendientesVerificacion || 0) > 0 && (
        <Card className="border-yellow-600" data-testid="card-alert-pending">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <CardTitle className="text-sm font-medium">Controles Pendientes de Verificación</CardTitle>
              <CardDescription>
                Hay {stats?.controlesPendientesVerificacion} peligros identificados que aún no han sido vinculados a inspecciones
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Controles</CardTitle>
            <CardDescription>Distribución del estado de los controles verificados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={controlStateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {controlStateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cobertura de Verificación</CardTitle>
            <CardDescription>Peligros identificados vs peligros vinculados a inspecciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Identificados" fill="#3b82f6" />
                  <Bar dataKey="Vinculados" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis HACER</CardTitle>
          <CardDescription>Insights clave sobre los controles operacionales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Ciclo PLANEAR → HACER</p>
              <p className="text-sm text-muted-foreground">
                De {stats?.peligrosIdentificados || 0} peligros identificados en la Matriz IPERC, 
                {' '}{stats?.peligrosVinculados || 0} han sido vinculados a inspecciones de seguridad.
                {(stats?.controlesPendientesVerificacion || 0) > 0 && (
                  <span className="text-yellow-600 font-medium">
                    {' '}Quedan {stats?.controlesPendientesVerificacion} pendientes de verificación.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Efectividad de Controles</p>
              <p className="text-sm text-muted-foreground">
                {stats?.porcentajeConformidad || 0}% de los controles verificados están conformes, 
                lo que indica {stats?.porcentajeConformidad && stats.porcentajeConformidad >= 80 ? 'una buena' : 'una baja'} efectividad
                en la implementación de las medidas de control.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Cobertura de Trabajadores</p>
              <p className="text-sm text-muted-foreground">
                {stats?.trabajadoresConRiesgos || 0} trabajadores tienen riesgos asignados según 
                su departamento y cargo, permitiendo un seguimiento personalizado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
