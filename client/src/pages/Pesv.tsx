import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, Users, ClipboardCheck, AlertTriangle, 
  GraduationCap, FileCheck,
  Activity, BarChart3, ArrowRight, ClipboardList
} from "lucide-react";

export default function Pesv() {
  const { data: vehicles } = useQuery({ queryKey: ["/api/vehicles"] });
  const { data: drivers } = useQuery({ queryKey: ["/api/drivers"] });
  const { data: inspections } = useQuery({ queryKey: ["/api/vehicle-inspections"] });
  const { data: incidents } = useQuery({ queryKey: ["/api/road-incidents"] });
  const { data: trainings } = useQuery({ queryKey: ["/api/road-safety-trainings"] });
  const { data: audits } = useQuery({ queryKey: ["/api/pesv-audits"] });
  const { data: evaluaciones } = useQuery({ queryKey: ["/api/evaluaciones-pesv"] });

  const activeVehicles = vehicles?.filter((v: any) => v.status === "activo").length || 0;
  const activeDrivers = drivers?.filter((d: any) => d.status === "activo").length || 0;
  
  const thisMonthInspections = inspections?.filter((i: any) => {
    const date = new Date(i.inspectionDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length || 0;

  const thisMonthIncidents = incidents?.filter((i: any) => {
    const date = new Date(i.incidentDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length || 0;

  const totalInjuries = incidents?.reduce((sum: number, i: any) => sum + (i.injuries || 0), 0) || 0;

  const upcomingTrainings = trainings?.filter((t: any) => {
    const date = new Date(t.trainingDate);
    return date > new Date() && t.status !== "completada" && t.status !== "cancelada";
  }).length || 0;

  const evaluacionesActivas = evaluaciones?.filter((e: any) => e.estado === "en-progreso") || [];
  const evaluacionesCompletadas = evaluaciones?.filter((e: any) => e.estado === "completada") || [];
  const promedioCumplimiento = evaluacionesCompletadas.length > 0
    ? Math.round(evaluacionesCompletadas.reduce((sum: number, e: any) => sum + parseFloat(e.porcentajeCumplimiento || "0"), 0) / evaluacionesCompletadas.length)
    : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-pesv-title">Plan Estratégico de Seguridad Vial (PESV)</h1>
        <p className="text-muted-foreground mt-1">
          Gestión integral de seguridad vial según Decreto 1252/2021 y Resolución 40595/2022
        </p>
      </div>
      
      <div className="print-date" style={{ display: 'none' }}>
        Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Estadísticas operativas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-vehicles">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-vehicles-count">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">de {vehicles?.length || 0} totales</p>
          </CardContent>
        </Card>

        <Card data-testid="card-drivers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-drivers-count">{activeDrivers}</div>
            <p className="text-xs text-muted-foreground">de {drivers?.length || 0} totales</p>
          </CardContent>
        </Card>

        <Card data-testid="card-inspections">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspecciones (Mes)</CardTitle>
            <div className="rounded-full bg-violet-100 p-2 dark:bg-violet-900">
              <ClipboardCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-inspections-count">{thisMonthInspections}</div>
            <p className="text-xs text-muted-foreground">realizadas este mes</p>
          </CardContent>
        </Card>

        <Card data-testid="card-incidents">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siniestros (Mes)</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-incidents-count">{thisMonthIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthIncidents === 0 ? "Sin siniestros" : "reportados este mes"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacitaciones Próximas</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrainings}</div>
            <p className="text-xs text-muted-foreground">programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesionados (Total)</CardTitle>
            <div className="rounded-full bg-rose-100 p-2 dark:bg-rose-900">
              <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInjuries}</div>
            <p className="text-xs text-muted-foreground">en todos los siniestros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditorías PESV</CardTitle>
            <div className="rounded-full bg-teal-100 p-2 dark:bg-teal-900">
              <FileCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits?.length || 0}</div>
            <p className="text-xs text-muted-foreground">realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Evaluaciones PESV */}
      <Card data-testid="card-evaluaciones-pesv">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Estado de Evaluaciones PESV
              </CardTitle>
              <CardDescription>Evaluaciones de los 24 pasos según Resolución 40595/2022</CardDescription>
            </div>
            <Link href="/evaluaciones-pesv">
              <Button variant="outline" size="sm" data-testid="button-ver-evaluaciones">
                Ver evaluaciones
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground" data-testid="text-total-evaluaciones">
                {evaluaciones?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Evaluaciones totales</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-evaluaciones-activas">
                {evaluacionesActivas.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">En progreso</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-promedio-cumplimiento">
                {promedioCumplimiento !== null ? `${promedioCumplimiento}%` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cumplimiento promedio</p>
            </div>
          </div>

          {evaluacionesActivas.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Evaluaciones en curso:</p>
              {evaluacionesActivas.slice(0, 3).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-2 bg-muted/40 rounded-md">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">Año {e.anio}</span>
                    <Badge variant="secondary" className="text-xs capitalize">{e.nivel}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {e.porcentajeCumplimiento ? `${Math.round(parseFloat(e.porcentajeCumplimiento))}%` : "Sin puntaje"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(!evaluaciones || evaluaciones.length === 0) && (
            <div className="mt-4 text-center py-4 text-muted-foreground text-sm">
              No hay evaluaciones registradas. 
              <Link href="/evaluaciones-pesv" className="text-primary ml-1 hover:underline">
                Crear primera evaluación
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marco normativo y niveles */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-slate-600" />
              Marco Normativo PESV 2025
            </CardTitle>
            <CardDescription>Cumplimiento normativo colombiano vigente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Decreto 1252 de 2021</p>
                <p className="text-muted-foreground">Articula el PESV con el SG-SST. Obligatorio para empresas con más de 10 vehículos o que contraten 2+ conductores</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Resolución 40595 de 2022</p>
                <p className="text-muted-foreground">Metodología vigente: 24 pasos en ciclo PHVA. Reemplaza Res. 1565/2014</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Ley 1503 de 2011</p>
                <p className="text-muted-foreground">Marco legal principal modificado por Decreto Ley 2106/2019</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Ley 2050 de 2020</p>
                <p className="text-muted-foreground">Asigna competencias de verificación y establece sanciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-orange-600" />
              Niveles de Implementación PESV
            </CardTitle>
            <CardDescription>Según Decreto 1252/2021 y Resolución 40595/2022</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">Nivel Básico</p>
                <Badge variant="secondary" className="text-xs">21 de 24 pasos</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">≤10 vehículos o conductores</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Nivel Estándar</p>
                <Badge variant="secondary" className="text-xs">24 de 24 pasos</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">11-50 vehículos o conductores</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="font-semibold text-sm text-red-700 dark:text-red-300">Nivel Avanzado</p>
                <Badge variant="secondary" className="text-xs">24 de 24 pasos</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">&gt;50 vehículos o conductores</p>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Los pasos H07, H08 y V03 aplican únicamente a niveles Estándar y Avanzado.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 24 pasos PHVA — datos exactos de pasos-pesv.ts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Metodología PESV: 24 Pasos en Ciclo PHVA
          </CardTitle>
          <CardDescription>Resolución 40595/2022 — Estructura completa</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">1. PLANEAR — 8 pasos</p>
              <ul className="text-xs space-y-1 text-blue-600 dark:text-blue-400">
                <li>P01. Conformación del equipo de trabajo</li>
                <li>P02. Política de seguridad vial</li>
                <li>P03. Diagnóstico de la organización</li>
                <li>P04. Caracterización y evaluación del riesgo vial</li>
                <li>P05. Objetivos y metas del PESV</li>
                <li>P06. Programas y planes de acción</li>
                <li>P07. Roles y responsabilidades</li>
                <li>P08. Recursos para el PESV</li>
              </ul>
            </div>
            <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-sm text-green-700 dark:text-green-300">2. HACER — 11 pasos</p>
              <ul className="text-xs space-y-1 text-green-600 dark:text-green-400">
                <li>H01. Fortalecimiento institucional</li>
                <li>H02. Capacitación en seguridad vial</li>
                <li>H03. Control de documentación de conductores</li>
                <li>H04. Gestión de vehículos seguros</li>
                <li>H05. Plan de mantenimiento de vehículos</li>
                <li>H06. Inspecciones preoperacionales</li>
                <li className="opacity-70">H07. Gestión de la velocidad *</li>
                <li className="opacity-70">H08. Gestión de rutas seguras *</li>
                <li>H09. Gestión de fatiga y somnolencia</li>
                <li>H10. Gestión de alcohol y sustancias psicoactivas</li>
                <li>H11. Atención a víctimas de siniestros viales</li>
              </ul>
            </div>
            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">3. VERIFICAR — 3 pasos</p>
              <ul className="text-xs space-y-1 text-amber-600 dark:text-amber-400">
                <li>V01. Indicadores de gestión del PESV</li>
                <li>V02. Registro y análisis de siniestros viales</li>
                <li className="opacity-70">V03. Auditoría del PESV *</li>
              </ul>
            </div>
            <div className="space-y-2 p-3 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-sm text-red-700 dark:text-red-300">4. ACTUAR — 2 pasos</p>
              <ul className="text-xs space-y-1 text-red-600 dark:text-red-400">
                <li>A01. Acciones de mejora continua</li>
                <li>A02. Revisión por la alta dirección</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Los pasos marcados aplican únicamente a niveles Estándar y Avanzado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
