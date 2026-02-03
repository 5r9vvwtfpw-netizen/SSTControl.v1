import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Car, Users, ClipboardCheck, AlertTriangle, 
  GraduationCap, FileCheck, TrendingUp, TrendingDown,
  Activity, ShieldAlert, Building, Target, BarChart3,
  ArrowLeft
} from "lucide-react";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

export default function Pesv() {
  const { data: vehicles } = useQuery({ queryKey: ["/api/vehicles"] });
  const { data: drivers } = useQuery({ queryKey: ["/api/drivers"] });
  const { data: inspections } = useQuery({ queryKey: ["/api/vehicle-inspections"] });
  const { data: incidents } = useQuery({ queryKey: ["/api/road-incidents"] });
  const { data: trainings } = useQuery({ queryKey: ["/api/road-safety-trainings"] });
  const { data: audits } = useQuery({ queryKey: ["/api/pesv-audits"] });

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
  const totalFatalities = incidents?.reduce((sum: number, i: any) => sum + (i.fatalities || 0), 0) || 0;

  const upcomingTrainings = trainings?.filter((t: any) => {
    const date = new Date(t.trainingDate);
    return date > new Date() && t.status !== "completada" && t.status !== "cancelada";
  }).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/pesv/evaluaciones">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToEvaluationButton />
      </div>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-pesv-title">Plan Estratégico de Seguridad Vial (PESV)</h1>
        <p className="text-muted-foreground mt-1">
          Gestión integral de seguridad vial según Decreto 1252/2021 y Resolución 40595/2022
        </p>
      </div>
      
      <div className="print-date" style={{ display: 'none' }}>
        Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30" data-testid="card-vehicles">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-vehicles-count">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">
              de {vehicles?.length || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30" data-testid="card-drivers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-drivers-count">{activeDrivers}</div>
            <p className="text-xs text-muted-foreground">
              de {drivers?.length || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-950/30" data-testid="card-inspections">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspecciones (Mes)</CardTitle>
            <div className="rounded-full bg-violet-100 p-2 dark:bg-violet-900">
              <ClipboardCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700 dark:text-violet-300" data-testid="text-inspections-count">{thisMonthInspections}</div>
            <p className="text-xs text-muted-foreground">
              realizadas este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30" data-testid="card-incidents">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siniestros (Mes)</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300" data-testid="text-incidents-count">{thisMonthIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthIncidents === 0 ? "Sin siniestros" : "reportados este mes"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacitaciones Próximas</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{upcomingTrainings}</div>
            <p className="text-xs text-muted-foreground">
              programadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50 to-transparent dark:from-rose-950/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesionados (Total)</CardTitle>
            <div className="rounded-full bg-rose-100 p-2 dark:bg-rose-900">
              <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">{totalInjuries}</div>
            <p className="text-xs text-muted-foreground">
              en todos los siniestros
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditorías PESV</CardTitle>
            <div className="rounded-full bg-teal-100 p-2 dark:bg-teal-900">
              <FileCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{audits?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/pesv/vehiculos">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-blue-500" data-testid="card-link-vehicles">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-blue-700 dark:text-blue-300">Vehículos</CardTitle>
              </div>
              <CardDescription>
                Gestión de flota vehicular: propios, arrendados y contratados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950" data-testid="button-goto-vehicles">
                Administrar Vehículos
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/conductores">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-emerald-500" data-testid="card-link-drivers">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-700 dark:text-emerald-300">Conductores</CardTitle>
              </div>
              <CardDescription>
                Registro de conductores, licencias y exámenes médicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950" data-testid="button-goto-drivers">
                Gestionar Conductores
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/inspecciones">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-violet-500" data-testid="card-link-inspections">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900">
                  <ClipboardCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle className="text-violet-700 dark:text-violet-300">Inspecciones Preoperacionales</CardTitle>
              </div>
              <CardDescription>
                Revisiones diarias obligatorias antes de operar vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950" data-testid="button-goto-inspections">
                Ver Inspecciones
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/siniestros">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-amber-500" data-testid="card-link-incidents">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-amber-700 dark:text-amber-300">Siniestros Viales</CardTitle>
              </div>
              <CardDescription>
                Registro e investigación de accidentes de tránsito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950" data-testid="button-goto-incidents">
                Registrar Siniestros
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/capacitaciones">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-purple-500" data-testid="card-link-trainings">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-purple-700 dark:text-purple-300">Capacitaciones</CardTitle>
              </div>
              <CardDescription>
                Formación en seguridad vial y conducción defensiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950" data-testid="button-goto-trainings">
                Ver Capacitaciones
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/auditorias">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-teal-500" data-testid="card-link-audits">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900">
                  <FileCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-teal-700 dark:text-teal-300">Auditorías PESV</CardTitle>
              </div>
              <CardDescription>
                Auditorías anuales del Plan Estratégico de Seguridad Vial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950" data-testid="button-goto-audits">
                Gestionar Auditorías
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/matriz-riesgos">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-green-500" data-testid="card-link-risk-matrix">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                  <ShieldAlert className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-700 dark:text-green-300">Matriz de Riesgos Viales</CardTitle>
              </div>
              <CardDescription>
                Identificación y valoración de riesgos según ISO 31000:2018
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950" data-testid="button-goto-risk-matrix">
                Ver Matriz de Riesgos
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/contexto-organizacional">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-cyan-500" data-testid="card-link-org-context">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-900">
                  <Building className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-cyan-700 dark:text-cyan-300">Contexto Organizacional</CardTitle>
              </div>
              <CardDescription>
                Análisis de factores internos y externos según ISO 31000:2018
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-950" data-testid="button-goto-org-context">
                Gestionar Contexto
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/factores-desempeno">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-indigo-500" data-testid="card-link-spf">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900">
                  <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-indigo-700 dark:text-indigo-300">Factores de Desempeño (SPF)</CardTitle>
              </div>
              <CardDescription>
                Factores de desempeño de seguridad vial según ISO 39001:2012
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950" data-testid="button-goto-spf">
                Gestionar SPF
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/indicadores">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-t-4 border-t-pink-500" data-testid="card-link-spi">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2 dark:bg-pink-900">
                  <BarChart3 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle className="text-pink-700 dark:text-pink-300">Indicadores (SPI)</CardTitle>
              </div>
              <CardDescription>
                Indicadores de desempeño de seguridad vial según ISO 39001:2012
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300 dark:hover:bg-pink-950" data-testid="button-goto-spi">
                Gestionar Indicadores
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-slate-600" />
              Marco Normativo PESV 2025
            </CardTitle>
            <CardDescription>Cumplimiento normativo colombiano vigente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-semibold">Decreto 1252 de 2021</p>
                <p className="text-muted-foreground">Modifica el PESV y lo articula con SG-SST. Obligatorio para empresas con más de 10 vehículos o que contraten 2+ conductores</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-semibold">Resolución 40595 de 2022</p>
                <p className="text-muted-foreground">Metodología vigente: 24 pasos en ciclo PHVA. Reemplaza Res. 1565/2014</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-semibold">Ley 1503 de 2011</p>
                <p className="text-muted-foreground">Marco legal principal modificado por Decreto Ley 2106/2019</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-semibold">Ley 2050 de 2020</p>
                <p className="text-muted-foreground">Asigna competencias de verificación y establece sanciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-orange-600" />
              Niveles de Implementación PESV
            </CardTitle>
            <CardDescription>Según tamaño de flota y conductores (Decreto 1252/2021)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border-l-4 border-l-gray-400 bg-gray-50 dark:bg-gray-900 rounded-r-lg">
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Nivel Simplificado</p>
              <p className="text-sm text-muted-foreground">2-10 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">Pasos simplificados sin Comité SV</p>
            </div>
            <div className="p-3 border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
              <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">Nivel Básico</p>
              <p className="text-sm text-muted-foreground">≥10 hasta 49 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">16 de 18 pasos aplicables</p>
            </div>
            <div className="p-3 border-l-4 border-l-amber-400 bg-amber-50 dark:bg-amber-950 rounded-r-lg">
              <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Nivel Estándar</p>
              <p className="text-sm text-muted-foreground">50-100 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">19 de 22 pasos + Comité SV obligatorio</p>
            </div>
            <div className="p-3 border-l-4 border-l-red-400 bg-red-50 dark:bg-red-950 rounded-r-lg">
              <p className="font-semibold text-sm text-red-700 dark:text-red-300">Nivel Avanzado</p>
              <p className="text-sm text-muted-foreground">&gt;100 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">21 de 24 pasos + Comité SV obligatorio</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Auditoría anual obligatoria en todos los niveles (Paso 22)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-gradient-to-r from-blue-500 via-green-500 to-amber-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-green-50 to-amber-50 dark:from-blue-950/50 dark:via-green-950/50 dark:to-amber-950/50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Metodología PESV: 24 Pasos en Ciclo PHVA
          </CardTitle>
          <CardDescription>Resolución 40595 de 2022 - Estructura completa</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">1. PLANEAR (8 pasos)</p>
              <ul className="text-xs space-y-1 text-blue-600 dark:text-blue-400">
                <li>1. Líder del PESV</li>
                <li>2. Comité de Seguridad Vial</li>
                <li>3. Política de Seguridad Vial</li>
                <li>4. Liderazgo y compromiso</li>
                <li>5. Diagnóstico</li>
                <li>6. Caracterización de riesgos</li>
                <li>7. Objetivos y metas</li>
                <li>8. Programa de riesgos críticos</li>
              </ul>
            </div>
            <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-sm text-green-700 dark:text-green-300">2. HACER (11 pasos)</p>
              <ul className="text-xs space-y-1 text-green-600 dark:text-green-400">
                <li>9. Plan anual de trabajo</li>
                <li>10. Competencia y formación</li>
                <li>11. Fatiga y somnolencia</li>
                <li>12. Preparación emergencias</li>
                <li>13. Investigación siniestros</li>
                <li>14. Vías seguras</li>
                <li>15. Selección conductores</li>
                <li>16. Inspección vehículos</li>
                <li>17. Mantenimiento</li>
                <li>18. Gestión del cambio</li>
                <li>19. Adquisición bienes</li>
              </ul>
            </div>
            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">3. VERIFICAR (3 pasos)</p>
              <ul className="text-xs space-y-1 text-amber-600 dark:text-amber-400">
                <li>20. Indicadores mínimos</li>
                <li>21. Supervisión del PESV</li>
                <li>22. Auditoría anual</li>
              </ul>
            </div>
            <div className="space-y-2 p-3 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-sm text-red-700 dark:text-red-300">4. ACTUAR (2 pasos)</p>
              <ul className="text-xs space-y-1 text-red-600 dark:text-red-400">
                <li>23. Mejora continua</li>
                <li>24. Comunicación y participación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
