import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrintDashboardButton } from "@/components/PrintDashboardButton";
import { Link } from "wouter";
import { 
  Car, Users, ClipboardCheck, AlertTriangle, 
  GraduationCap, FileCheck, TrendingUp, TrendingDown,
  Activity, ShieldAlert, Building
} from "lucide-react";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
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
      <div className="flex items-center justify-between mb-2">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-pesv-title">Plan Estratégico de Seguridad Vial (PESV)</h1>
          <p className="text-muted-foreground mt-1">
            Gestión integral de seguridad vial según Decreto 1252/2021 y Resolución 40595/2022
          </p>
        </div>
        <PrintDashboardButton title="Imprimir Panel PESV" />
      </div>
      
      <div className="print-date" style={{ display: 'none' }}>
        Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-vehicles">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-vehicles-count">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">
              de {vehicles?.length || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-drivers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-drivers-count">{activeDrivers}</div>
            <p className="text-xs text-muted-foreground">
              de {drivers?.length || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-inspections">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspecciones (Mes)</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-inspections-count">{thisMonthInspections}</div>
            <p className="text-xs text-muted-foreground">
              realizadas este mes
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-incidents">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siniestros (Mes)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-incidents-count">{thisMonthIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthIncidents === 0 ? "Sin siniestros" : "reportados este mes"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacitaciones Próximas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrainings}</div>
            <p className="text-xs text-muted-foreground">
              programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesionados (Total)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInjuries}</div>
            <p className="text-xs text-muted-foreground">
              en todos los siniestros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditorías PESV</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/pesv/vehiculos">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-link-vehicles">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <CardTitle>Vehículos</CardTitle>
              </div>
              <CardDescription>
                Gestión de flota vehicular: propios, arrendados y contratados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-vehicles">
                Administrar Vehículos
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/conductores">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-link-drivers">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Conductores</CardTitle>
              </div>
              <CardDescription>
                Registro de conductores, licencias y exámenes médicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-drivers">
                Gestionar Conductores
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/inspecciones">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-link-inspections">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                <CardTitle>Inspecciones Preoperacionales</CardTitle>
              </div>
              <CardDescription>
                Revisiones diarias obligatorias antes de operar vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-inspections">
                Ver Inspecciones
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/siniestros">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-link-incidents">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Siniestros Viales</CardTitle>
              </div>
              <CardDescription>
                Registro e investigación de accidentes de tránsito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-incidents">
                Registrar Siniestros
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/capacitaciones">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-link-trainings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <CardTitle>Capacitaciones</CardTitle>
              </div>
              <CardDescription>
                Formación en seguridad vial y conducción defensiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-trainings">
                Ver Capacitaciones
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/auditorias">
          <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-link-audits">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                <CardTitle>Auditorías PESV</CardTitle>
              </div>
              <CardDescription>
                Auditorías anuales del Plan Estratégico de Seguridad Vial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-audits">
                Gestionar Auditorías
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/matriz-riesgos">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-green-200 dark:border-green-800" data-testid="card-link-risk-matrix">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-green-600" />
                <CardTitle>Matriz de Riesgos Viales</CardTitle>
              </div>
              <CardDescription>
                Identificación y valoración de riesgos según ISO 31000:2018
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-risk-matrix">
                Ver Matriz de Riesgos
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pesv/contexto-organizacional">
          <Card className="hover-elevate active-elevate-2 cursor-pointer border-green-200 dark:border-green-800" data-testid="card-link-org-context">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <CardTitle>Contexto Organizacional</CardTitle>
              </div>
              <CardDescription>
                Análisis de factores internos y externos según ISO 31000:2018
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-goto-org-context">
                Gestionar Contexto
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Marco Normativo PESV 2025</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Niveles de Implementación PESV</CardTitle>
            <CardDescription>Según tamaño de flota y conductores (Decreto 1252/2021)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="font-semibold text-sm">Nivel Simplificado</p>
              <p className="text-sm text-muted-foreground">2-10 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">Pasos simplificados sin Comité SV</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-semibold text-sm">Nivel Básico</p>
              <p className="text-sm text-muted-foreground">≥10 hasta 49 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">16 de 18 pasos aplicables</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-semibold text-sm">Nivel Estándar</p>
              <p className="text-sm text-muted-foreground">50-100 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">19 de 22 pasos + Comité SV obligatorio</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-semibold text-sm">Nivel Avanzado</p>
              <p className="text-sm text-muted-foreground">&gt;100 vehículos o conductores</p>
              <p className="text-xs text-muted-foreground mt-1">21 de 24 pasos + Comité SV obligatorio</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold">Auditoría anual obligatoria en todos los niveles (Paso 22)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metodología PESV: 24 Pasos en Ciclo PHVA</CardTitle>
          <CardDescription>Resolución 40595 de 2022 - Estructura completa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="font-semibold text-sm">1. PLANEAR (8 pasos)</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
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
            <div className="space-y-2">
              <p className="font-semibold text-sm">2. HACER (11 pasos)</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
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
            <div className="space-y-2">
              <p className="font-semibold text-sm">3. VERIFICAR (3 pasos)</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>20. Indicadores mínimos</li>
                <li>21. Supervisión del PESV</li>
                <li>22. Auditoría anual</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-sm">4. ACTUAR (2 pasos)</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
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
