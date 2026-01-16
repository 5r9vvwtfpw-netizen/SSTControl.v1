import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { ArrowLeft, BarChart3, Calculator, Calendar, TrendingUp, Info } from "lucide-react";
import type { AccidentStatistics } from "@shared/schema";

/**
 * Cálculo de indicadores oficiales según Decreto 1072/2015 y Resolución 0312/2019
 */
function calculateILIIndicators(data: Partial<AccidentStatistics>) {
  const hht = typeof data.hoursWorkedHHT === "string" ? parseFloat(data.hoursWorkedHHT) : (data.hoursWorkedHHT || 0);
  const totalAccidents = data.totalAccidents || 0;
  const lostDays = data.lostDays || 0;
  const totalWorkers = data.totalWorkers || 1;
  const totalIncidents = data.totalIncidents || 0;
  const totalOccupationalDiseases = data.totalOccupationalDiseases || 0;

  // IF = (Número de accidentes de trabajo en el periodo / Número de horas hombre trabajadas en el periodo) * 240.000 (o 200.000 según Res 0312)
  // El código existente usa 200.000
  const indicadorIF = hht > 0 ? (totalAccidents * 200000) / hht : 0;
  
  // IS = (Número de días perdidos por accidentes de trabajo en el periodo / Número de horas hombre trabajadas en el periodo) * 240.000
  const indicadorIS = hht > 0 ? (lostDays * 200000) / hht : 0;
  
  // ILI = (IF * IS) / 1000
  const indicadorILI = (indicadorIF * indicadorIS) / 1000;
  
  // Tasa de incidentes = (Total incidentes / Total trabajadores) * 100
  const tasaIncidentes = (totalIncidents / totalWorkers) * 100;
  
  // Tasa de AT = (Total AT / Total trabajadores) * 100
  const tasaAT = (totalAccidents / totalWorkers) * 100;

  // Tasa de EL = (Total EL / Total trabajadores) * 100
  const tasaEL = (totalOccupationalDiseases / totalWorkers) * 100;

  return { indicadorIF, indicadorIS, indicadorILI, tasaIncidentes, tasaAT, tasaEL };
}

export default function IndiceSeveridadILI() {
  const { user } = useAuth();
  const { selectedCompany, isLoading: isCompanyLoading } = useCompanyContext();
  const [, navigate] = useLocation();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const companyId = selectedCompany?.id || user?.companyId;
  
  const { data: statistics = [], isLoading } = useQuery<AccidentStatistics[]>({
    queryKey: [`/api/accident-statistics?companyId=${companyId}`],
    enabled: !!companyId,
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  const currentYearData = useMemo(() => statistics.find(s => s.year === selectedYear && !s.month), [statistics, selectedYear]);
  const previousYearData = useMemo(() => statistics.find(s => s.year === selectedYear - 1 && !s.month), [statistics, selectedYear]);
  
  const currentIndicators = useMemo(() => 
    currentYearData ? calculateILIIndicators(currentYearData) : null, 
    [currentYearData]
  );
  
  const previousIndicators = useMemo(() => 
    previousYearData ? calculateILIIndicators(previousYearData) : null, 
    [previousYearData]
  );

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "—";
    return num.toFixed(2);
  };

  if (isCompanyLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/evaluaciones-sst")} 
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Índice de Lesión Incapacitante e Incidentes
            </h1>
            <p className="text-muted-foreground">Estándar 3.3.2 - Resolución 0312/2019</p>
          </div>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
              <CardTitle className="text-sm font-semibold text-primary">Definición del Estándar 3.3.2</CardTitle>
              <CardDescription className="text-xs mt-1">
                Severidad de accidentalidad, Medición de la frecuencia de los Incidentes, Accidentes de Trabajo y Enfermedad Laboral.
                Este módulo permite monitorear la efectividad de los controles de seguridad mediante indicadores de resultado.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Período de Selección */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análisis
            </CardTitle>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32" data-testid="select-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">ILI (Índice Lesión Incap.)</CardDescription>
            <CardTitle className="text-3xl text-primary" data-testid="text-ili-value">
              {formatNumber(currentIndicators?.indicadorILI)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono">(IF × IS) / 1000</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Tasa de Incidentes</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-tasa-incidentes-value">
              {formatNumber(currentIndicators?.tasaIncidentes)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono">(Incid / Trabaj.) × 100</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Tasa de Accidentes (AT)</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-tasa-at-value">
              {formatNumber(currentIndicators?.tasaAT)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono">(AT / Trabaj.) × 100</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Tasa Enfermedad (EL)</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-tasa-el-value">
              {formatNumber(currentIndicators?.tasaEL)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono">(EL / Trabaj.) × 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Comparativo Anual ({selectedYear - 1} vs {selectedYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto / Indicador</TableHead>
                <TableHead className="text-right">{selectedYear - 1}</TableHead>
                <TableHead className="text-right">{selectedYear}</TableHead>
                <TableHead className="text-right">Variación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Número de Incidentes</TableCell>
                <TableCell className="text-right">{previousYearData?.totalIncidents ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalIncidents ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {currentYearData && previousYearData && previousYearData.totalIncidents !== undefined ? (
                    <Badge className={(currentYearData.totalIncidents ?? 0) <= (previousYearData.totalIncidents ?? 0) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {(((currentYearData.totalIncidents ?? 0) - (previousYearData.totalIncidents ?? 0)) / (previousYearData.totalIncidents || 1) * 100).toFixed(1)}%
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Accidentes de Trabajo (AT)</TableCell>
                <TableCell className="text-right">{previousYearData?.totalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {currentYearData && previousYearData && previousYearData.totalAccidents !== undefined ? (
                    <Badge className={(currentYearData.totalAccidents ?? 0) <= (previousYearData.totalAccidents ?? 0) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {(((currentYearData.totalAccidents ?? 0) - (previousYearData.totalAccidents ?? 0)) / (previousYearData.totalAccidents || 1) * 100).toFixed(1)}%
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Índice de Frecuencia (IF)</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(previousIndicators?.indicadorIF)}</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(currentIndicators?.indicadorIF)}</TableCell>
                <TableCell className="text-right">—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Índice de Severidad (IS)</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(previousIndicators?.indicadorIS)}</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(currentIndicators?.indicadorIS)}</TableCell>
                <TableCell className="text-right">—</TableCell>
              </TableRow>
              <TableRow className="bg-primary/5">
                <TableCell className="font-bold text-primary">Índice de Lesión Incapacitante (ILI)</TableCell>
                <TableCell className="text-right font-bold font-mono">{formatNumber(previousIndicators?.indicadorILI)}</TableCell>
                <TableCell className="text-right font-bold font-mono text-primary">{formatNumber(currentIndicators?.indicadorILI)}</TableCell>
                <TableCell className="text-right">—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sin datos alert */}
      {!currentYearData && !isLoading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-10 text-center space-y-3">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No se encontraron datos estadísticos para el año {selectedYear}.</p>
            <Button variant="outline" onClick={() => navigate("/indicadores-accidentalidad")}>
              Registrar datos estadísticos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
