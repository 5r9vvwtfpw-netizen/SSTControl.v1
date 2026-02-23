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
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { TrazabilidadIndicadores331 } from "@/components/TrazabilidadIndicadores331";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import type { AccidentStatistics } from "@shared/schema";
import {
  calculateFrequencyIndex,
  calculateSeverityIndex,
  calculateAccidentalityRate,
  type AccidentSeverityData,
} from "@/lib/accident-severity-calculator";

function calculateIndicators(data: AccidentStatistics) {
  const hht = parseFloat(data.hoursWorkedHHT?.toString() || "0") || 0;
  const totalAccidents = data.totalAccidents ?? 0;
  const lostDays = data.lostDays ?? 0;
  const totalWorkers = data.totalWorkers ?? 1;
  
  const severityData: AccidentSeverityData = {
    totalDaysLost: lostDays,
    totalWorkerHours: hht,
    numberOfAccidents: totalAccidents,
    numberOfWorkers: totalWorkers,
  };
  
  const indicadorIF = calculateFrequencyIndex(severityData);
  const indicadorIS = calculateSeverityIndex(severityData);
  const tasaAccidentalidad = calculateAccidentalityRate(severityData);
  
  return { indicadorIF, indicadorIS, tasaAccidentalidad };
}

export default function IndiceFrequenciaSeveridad() {
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
    currentYearData ? calculateIndicators(currentYearData) : null, 
    [currentYearData]
  );
  
  const previousIndicators = useMemo(() => 
    previousYearData ? calculateIndicators(previousYearData) : null, 
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
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="title-standard">Estándar 3.3.1</h1>
            <p className="text-muted-foreground">Frecuencia de accidentalidad, Medición de la severidad de AT y EL</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/evaluaciones-sst")} 
            data-testid="button-initial-evaluation"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ir a Evaluación Inicial
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/planes-trabajo-anual")} 
            data-testid="button-work-plan"
          >
            Ir al Cronograma
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32" data-testid="select-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Marco Normativo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Decreto 1072/2015, Art. 2.2.4.6.21:</strong> Indicadores que evalúan el proceso del SG-SST</p>
          <p><strong>Resolución 0312/2019:</strong> Estándar mínimo de medición de frecuencia y severidad</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-if">
          <CardHeader className="pb-2">
            <CardDescription>Índice de Frecuencia (IF)</CardDescription>
            <CardTitle className="text-3xl">
              {currentIndicators ? formatNumber(currentIndicators.indicadorIF) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              IF = (N° Accidentes × 200,000) / HHT
            </p>
            {previousIndicators && currentIndicators && (
              <div className="flex items-center gap-2 text-sm">
                {currentIndicators.indicadorIF < previousIndicators.indicadorIF ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Mejoró vs año anterior</span>
                  </>
                ) : currentIndicators.indicadorIF > previousIndicators.indicadorIF ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Aumentó vs año anterior</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sin cambio vs año anterior</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-is">
          <CardHeader className="pb-2">
            <CardDescription>Índice de Severidad (IS)</CardDescription>
            <CardTitle className="text-3xl">
              {currentIndicators ? formatNumber(currentIndicators.indicadorIS) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              IS = (Días perdidos × 200,000) / HHT
            </p>
            {previousIndicators && currentIndicators && (
              <div className="flex items-center gap-2 text-sm">
                {currentIndicators.indicadorIS < previousIndicators.indicadorIS ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Mejoró vs año anterior</span>
                  </>
                ) : currentIndicators.indicadorIS > previousIndicators.indicadorIS ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Aumentó vs año anterior</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sin cambio vs año anterior</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Base del Período {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead className="text-right">{selectedYear - 1}</TableHead>
                <TableHead className="text-right">{selectedYear}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Trabajadores promedio</TableCell>
                <TableCell className="text-right">{previousYearData?.totalWorkers ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalWorkers ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Horas Hombre Trabajadas (HHT)</TableCell>
                <TableCell className="text-right">{previousYearData?.hoursWorkedHHT ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.hoursWorkedHHT ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Accidentes de Trabajo</TableCell>
                <TableCell className="text-right">{previousYearData?.totalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalAccidents ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Días Perdidos</TableCell>
                <TableCell className="text-right">{previousYearData?.lostDays ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.lostDays ?? "—"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {companyId && (
        <TrazabilidadIndicadores331 
          companyId={companyId} 
          year={selectedYear}
          onNavigateToAccident={(accidentId) => navigate(`/investigacion-accidentes?id=${accidentId}`)}
        />
      )}

      {!currentYearData && !isLoading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-10 text-center space-y-3">
            <Activity className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No se encontraron datos estadísticos para el año {selectedYear}.</p>
            <Button variant="outline" onClick={() => navigate("/indicadores-accidentalidad")} data-testid="button-register-data">
              Registrar datos estadísticos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
