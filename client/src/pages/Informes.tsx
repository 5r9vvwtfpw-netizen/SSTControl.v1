import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, BarChart3, TrendingUp, Calendar, Users, Building2, AlertCircle, ArrowLeft, ClipboardCheck, Target, Shield, Activity, Briefcase, CheckCircle2, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatReportError } from "@/lib/report-error-messages";
import { downloadAuthenticatedReport } from "@/lib/download-report";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import type { PlanTrabajoAnual } from "@shared/schema";

type ReportCategory = "obligatorio" | "indicadores" | "complementario";

interface ReportType {
  id: string;
  name: string;
  icon: typeof FileText;
  description: string;
  category: ReportCategory;
  normativa?: string;
  documentCode: string;
  version: string;
  endpoint?: string;
  filename: string;
}

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

const reportTypes: ReportType[] = [
  // Obligatorios para Rendición de Cuentas
  { id: "mensual", name: "Informe de Rendición de Cuentas", icon: ClipboardCheck, description: "Informe mensual consolidado del SG-SST con indicadores clave", category: "obligatorio", normativa: "Decreto 1072/2015 Art. 2.2.4.6.8", documentCode: `SST-MEN-${currentYear}-${currentMonth}`, version: "1.0", endpoint: `/api/reports/rendicion-cuentas?year=${currentYear}&month=${Number(currentMonth)}`, filename: `rendicion-cuentas-${currentYear}-${currentMonth}.pdf` },
  { id: "cumplimiento", name: "Autoevaluación Estándares Mínimos", icon: CheckCircle2, description: "Evaluación según Resolución 0312/2019", category: "obligatorio", normativa: "Resolución 0312/2019 Art. 28", documentCode: `SST-EVAL-${currentYear}`, version: "1.0", filename: `cumplimiento-${currentYear}.pdf` },
  { id: "accidentes", name: "Indicadores de Accidentalidad", icon: Activity, description: "Frecuencia, severidad, días sin accidentes", category: "obligatorio", normativa: "Resolución 0312/2019 Art. 30", documentCode: `SST-IND-ACC-${currentYear}`, version: "1.0", filename: `accidentes-${currentYear}.pdf` },
  { id: "capacitaciones", name: "Informe de Capacitaciones", icon: BarChart3, description: "Cumplimiento del programa de formación", category: "obligatorio", normativa: "Decreto 1072/2015 Art. 2.2.4.6.11", documentCode: `SST-INF-CAP-${currentYear}`, version: "1.0", filename: `capacitaciones-${currentYear}.pdf` },
  
  // Indicadores Oficiales
  { id: "inspecciones", name: "Informe de Inspecciones", icon: TrendingUp, description: "Resultados de inspecciones de seguridad", category: "indicadores", normativa: "Decreto 1072/2015 Art. 2.2.4.6.24", documentCode: `SST-INF-INS-${currentYear}`, version: "1.0", filename: `inspecciones-${currentYear}.pdf` },
  { id: "contratos", name: "Informe de Contratos y Designaciones", icon: Users, description: "Contratos laborales con responsabilidades SST", category: "indicadores", normativa: "Decreto 1072/2015 Art. 2.2.4.6.8", documentCode: `SST-CNT-${currentYear}`, version: "1.0", filename: `contratos-${currentYear}.pdf` },
];

const consolidatedReports = [
  { id: "evaluaciones-sst", name: "Evaluaciones SST consolidadas", description: "Consolidado de estándares mínimos y cumplimiento.", endpoint: "/api/reportes/evaluaciones-sst-consolidado/pdf", filename: `evaluaciones-sst-consolidado-${currentYear}.pdf` },
  { id: "auditorias", name: "Auditorías internas consolidadas", description: "Programa, hallazgos y resultados de auditoría.", endpoint: "/api/reportes/auditorias-internas-consolidado/pdf", filename: `auditorias-internas-${currentYear}.pdf` },
  { id: "objetivos-indicadores", name: "Objetivos e indicadores consolidados", description: "Seguimiento de metas e indicadores del SG-SST.", endpoint: "/api/reportes/objetivos-indicadores-consolidado/pdf", filename: `objetivos-indicadores-${currentYear}.pdf` },
  { id: "revisiones-direccion", name: "Revisiones por dirección consolidadas", description: "Decisiones y acciones de las revisiones gerenciales.", endpoint: "/api/reportes/revisiones-direccion-consolidado/pdf", filename: `revisiones-direccion-${currentYear}.pdf` },
  { id: "acciones-contexto", name: "Acciones de mejora del contexto", description: "Plan de acciones derivado del análisis de contexto.", endpoint: "/api/acciones-mejora-contexto/pdf", filename: `acciones-mejora-contexto-${currentYear}.pdf` },
];

const newReports = [
  { id: "condiciones-salud", name: "Condiciones de salud", description: "Diagnóstico consolidado de condiciones de salud.", endpoint: "/api/reportes/condiciones-salud/pdf", filename: `condiciones-salud-${currentYear}.pdf` },
  { id: "examenes-medicos", name: "Exámenes médicos", description: "Consolidado de evaluaciones médicas ocupacionales.", endpoint: "/api/reportes/examenes-medicos/pdf", filename: `examenes-medicos-${currentYear}.pdf` },
  { id: "conservacion-auditiva", name: "Conservación auditiva", description: "Perfiles de exposición, audiometrías y controles.", endpoint: "/api/conservacion-auditiva/pdf", filename: `conservacion-auditiva-${currentYear}.pdf` },
  { id: "partes-interesadas", name: "Partes interesadas", description: "Matriz de necesidades, expectativas y comunicación.", endpoint: "/api/partes-interesadas/pdf", filename: `partes-interesadas-${currentYear}.pdf` },
  { id: "sedes", name: "Sedes y plantas", description: "Relación consolidada de sedes, ubicación y personal.", endpoint: "/api/company-sedes/pdf", filename: `sedes-${currentYear}.pdf` },
  { id: "rutas-seguras", name: "Rutas seguras PESV", description: "Reporte general de rutas y controles de seguridad vial.", endpoint: "/api/pesv/rutas-seguras/pdf", filename: `rutas-seguras-pesv-${currentYear}.pdf` },
  { id: "liderazgo-pesv", name: "Liderazgo PESV", description: "Evidencias de liderazgo y compromiso de alta dirección.", endpoint: "/api/pesv/liderazgo/pdf", filename: `liderazgo-pesv-${currentYear}.pdf` },
];

const categoryLabels: Record<ReportCategory, { label: string; color: string }> = {
  obligatorio: { label: "Obligatorio", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  indicadores: { label: "Indicador Oficial", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  complementario: { label: "Complementario", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

export default function Informes() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes-actual");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    selectedCompanyId,
    selectedCompany,
    effectiveCompanyId: companyContextId,
  } = useCompanyContext();
  
  const isSuperadmin = user?.role === 'superadmin';
  const isLso = user?.role === 'lso' || user?.role === 'lso_externo';
  const effectiveCompanyId = isSuperadmin ? selectedCompanyId : companyContextId;
  const hasCompanyAssigned = !!effectiveCompanyId;

  // Obtener planes de trabajo para enlace al cronograma activo
  const { data: planes } = useQuery<PlanTrabajoAnual[]>({
    queryKey: ["/api/planes-trabajo-anual"],
    staleTime: 5 * 60 * 1000,
  });

  // Buscar el plan aprobado del año actual, o el más reciente aprobado
  const currentYear = new Date().getFullYear();
  const planActivo = planes?.find(p => p.estado === "aprobado" && p.anio === currentYear) 
    || planes?.find(p => p.estado === "aprobado")
    || planes?.[0];

  // Si hay un plan activo, ir directamente al cronograma, si no, ir a la lista
  const cronogramaHref = planActivo 
    ? `/planes-trabajo-anual/${planActivo.id}?tab=cronograma`
    : `/planes-trabajo-anual`;

  const handleGenerateReport = async (reportId: string) => {
    // Validación para superadmin sin empresa seleccionada
    if (isSuperadmin && !selectedCompanyId) {
      toast({
        title: "Seleccione una empresa",
        description: "Como proveedor, debe seleccionar una empresa del selector en la barra de navegación",
        variant: "destructive",
      });
      return;
    }

    // Los LSO trabajan con una empresa autorizada en el contexto del portal,
    // no con user.companyId. El servidor volverá a validar la asignación activa.
    if (!effectiveCompanyId) {
      if (isLso) {
        toast({
          title: "Seleccione una empresa asignada",
          description: "Abra la empresa autorizada desde el Portal del Licenciado e intente generar el informe nuevamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Empresa no asignada",
        description: "Su cuenta no tiene una empresa asignada. Por favor complete el registro de su empresa en Configuración.",
        variant: "destructive",
      });
      return;
    }

    setSelectedReport(reportId);
    setIsGenerating(true);

    try {
      const report = reportTypes.find(item => item.id === reportId)
        || consolidatedReports.find(item => item.id === reportId)
        || newReports.find(item => item.id === reportId);
      if (!report) throw new Error("Informe no encontrado.");
      const endpoint = "endpoint" in report && report.endpoint
        ? report.endpoint
        : `/api/reports/${reportId}?period=${selectedPeriod}`;
      await downloadAuthenticatedReport({
        url: endpoint,
        filename: report.filename,
        companyId: isSuperadmin || isLso ? effectiveCompanyId : undefined,
      });

      toast({
        title: "Informe generado",
        description: "El informe se ha descargado correctamente",
        className: "bg-yellow-300 text-black border-yellow-400",
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      const { title, description } = formatReportError(error);
      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSelectedReport(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          data-testid="button-back"
        >
          <Link href="/evaluaciones-sst">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Informes y Reportes</h1>
          <p className="text-muted-foreground">Generación de informes estadísticos y cumplimiento normativo</p>
        </div>
      </div>

      {isSuperadmin && !selectedCompanyId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Como proveedor, debe seleccionar una empresa del menú superior para generar informes.
          </AlertDescription>
        </Alert>
      )}

      {!isSuperadmin && !isLso && !user?.companyId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Su cuenta no tiene una empresa asignada. Por favor vaya a <strong>Configuración → Empresa</strong> para registrar su empresa, o contacte al administrador del sistema.
          </AlertDescription>
        </Alert>
      )}

      {isLso && !effectiveCompanyId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Abra una empresa con asignación activa desde el Portal del Licenciado para generar informes.
          </AlertDescription>
        </Alert>
      )}

      {isSuperadmin && selectedCompany && (
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            Generando informes para: <strong>{selectedCompany.name}</strong> (NIT: {selectedCompany.nit})
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configurar Período de Reporte</CardTitle>
          <CardDescription>Seleccione el período para generar los informes</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full md:w-[300px]" data-testid="select-period">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes-actual">Mes Actual</SelectItem>
              <SelectItem value="mes-anterior">Mes Anterior</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
              <SelectItem value="semestre">Último Semestre</SelectItem>
              <SelectItem value="anio">Año Actual</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Informes Obligatorios para Rendición de Cuentas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Obligatorios para Rendición de Cuentas</h2>
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Requeridos</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reportTypes.filter(r => r.category === "obligatorio").map((report) => {
            const Icon = report.icon;
            const categoryInfo = categoryLabels[report.category];
            return (
              <Card key={report.id} data-testid={`card-report-${report.id}`} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                      </div>
                      <CardDescription>{report.description}</CardDescription>
                      {report.normativa && (
                        <p className="text-xs text-muted-foreground mt-1">{report.normativa}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {report.documentCode}
                        </span>
                        <span className="text-muted-foreground">
                          Versión {report.version}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={isGenerating}
                    data-testid={`button-generate-${report.id}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating && selectedReport === report.id ? "Generando..." : "Generar y Descargar PDF"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Indicadores Oficiales */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Indicadores Oficiales</h2>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Medición</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.filter(r => r.category === "indicadores").map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} data-testid={`card-report-${report.id}`} className="hover-elevate border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                      {report.normativa && (
                        <p className="text-xs text-muted-foreground mt-1">{report.normativa}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {report.documentCode}
                        </span>
                        <span className="text-muted-foreground">
                          Versión {report.version}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={isGenerating}
                    data-testid={`button-generate-${report.id}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating && selectedReport === report.id ? "Generando..." : "Generar y Descargar PDF"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Informes consolidados</h2>
          <Badge className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">SG-SST</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {consolidatedReports.map((report) => (
            <Card key={report.id} data-testid={`card-report-${report.id}`} className="hover-elevate border-violet-200 dark:border-violet-800">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => handleGenerateReport(report.id)} disabled={isGenerating} data-testid={`button-download-${report.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating && selectedReport === report.id ? "Descargando..." : "Descargar PDF"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Reportes especializados</h2>
          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">SST y PESV</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {newReports.map((report) => (
            <Card key={report.id} data-testid={`card-report-${report.id}`} className="hover-elevate border-teal-200 dark:border-teal-800">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => handleGenerateReport(report.id)} disabled={isGenerating} data-testid={`button-download-${report.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating && selectedReport === report.id ? "Descargando..." : "Descargar PDF"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cronograma de Actividades - Estándar 2.6.1 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Planificación Anual</h2>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Estándar 2.6.1</Badge>
        </div>
        <Card className="hover-elevate border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Cronograma de Actividades SST</CardTitle>
                <CardDescription>Plan de trabajo anual con actividades, responsables y fechas de ejecución</CardDescription>
                <p className="text-xs text-muted-foreground mt-1">Resolución 0312/2019 Art. 16 - Estándar 2.6.1</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              asChild
              data-testid="button-go-cronograma"
            >
              <Link href={cronogramaHref}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Ir al Cronograma de Actividades
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedReport && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileText className="h-5 w-5 text-primary" />
              <p>
                Generando informe <strong>{reportTypes.find(r => r.id === selectedReport)?.name}</strong> para <strong>{selectedPeriod}</strong>...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
