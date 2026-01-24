import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, BarChart3, TrendingUp, Calendar, Users, Building2, AlertCircle, ArrowLeft, ClipboardCheck, Target, Shield, Activity, Briefcase, CheckCircle2, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatReportError } from "@/lib/report-error-messages";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

type ReportCategory = "obligatorio" | "indicadores" | "complementario";

interface ReportType {
  id: string;
  name: string;
  icon: typeof FileText;
  description: string;
  category: ReportCategory;
  normativa?: string;
}

const reportTypes: ReportType[] = [
  // Obligatorios para Rendición de Cuentas
  { id: "mensual", name: "Informe de Rendición de Cuentas", icon: ClipboardCheck, description: "Informe consolidado del SG-SST con indicadores clave", category: "obligatorio", normativa: "Decreto 1072/2015 Art. 2.2.4.6.8" },
  { id: "cumplimiento", name: "Autoevaluación Estándares Mínimos", icon: CheckCircle2, description: "Evaluación según Resolución 0312/2019", category: "obligatorio", normativa: "Resolución 0312/2019 Art. 28" },
  { id: "accidentes", name: "Indicadores de Accidentalidad", icon: Activity, description: "Frecuencia, severidad, días sin accidentes", category: "obligatorio", normativa: "Resolución 0312/2019 Art. 30" },
  { id: "capacitaciones", name: "Informe de Capacitaciones", icon: BarChart3, description: "Cumplimiento del programa de formación", category: "obligatorio", normativa: "Decreto 1072/2015 Art. 2.2.4.6.11" },
  
  // Indicadores Oficiales
  { id: "inspecciones", name: "Informe de Inspecciones", icon: TrendingUp, description: "Resultados de inspecciones de seguridad", category: "indicadores", normativa: "Decreto 1072/2015 Art. 2.2.4.6.24" },
  { id: "contratos", name: "Informe de Contratos y Designaciones", icon: Users, description: "Contratos laborales con responsabilidades SST", category: "indicadores", normativa: "Decreto 1072/2015 Art. 2.2.4.6.8" },
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
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  
  const isSuperadmin = user?.role === 'superadmin';
  const effectiveCompanyId = isSuperadmin ? selectedCompanyId : user?.companyId;
  const hasCompanyAssigned = !!effectiveCompanyId;

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

    // Validación para usuarios sin empresa asignada
    if (!isSuperadmin && !user?.companyId) {
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
      let apiUrl = `/api/reports/${reportId}?period=${selectedPeriod}`;
      if (isSuperadmin && selectedCompanyId) {
        apiUrl += `&companyId=${selectedCompanyId}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        // Try to parse JSON for specific error information
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          const error = new Error(errorData.message || `Error al generar el informe: ${response.statusText}`) as any;
          error.response = { data: errorData };
          error.statusCode = response.status;
          throw error;
        }
        
        // Handle specific HTTP status codes
        let statusMessage = response.statusText;
        if (response.status === 403) statusMessage = "Acceso denegado";
        if (response.status === 404) statusMessage = "Informe no encontrado";
        if (response.status === 500) statusMessage = "Error interno del servidor";
        
        const error = new Error(`Error al generar el informe: ${statusMessage}`) as any;
        error.statusCode = response.status;
        throw error;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${reportId}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

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
      <div className="flex justify-end">
        <BackToEvaluationButton />
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

      {!isSuperadmin && !user?.companyId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Su cuenta no tiene una empresa asignada. Por favor vaya a <strong>Configuración → Empresa</strong> para registrar su empresa, o contacte al administrador del sistema.
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
              <Card key={report.id} data-testid={`card-report-${report.id}`} className="hover-elevate border-red-200 dark:border-red-800">
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
              <Link href="/cronograma">
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
