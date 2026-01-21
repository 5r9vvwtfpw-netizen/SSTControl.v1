import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle, Info } from "lucide-react";
import type { AccidentStatistics } from "@shared/schema";
import { TrazabilidadIndicadores335 } from "@/components/TrazabilidadIndicadores335";

function calculateIncidencia(data: AccidentStatistics) {
  const totalWorkers = data.totalWorkers ?? 1;
  const totalAccidents = data.totalAccidents ?? 0;
  const totalOccupationalDiseases = data.totalOccupationalDiseases ?? 0;
  
  const incidenciaAT = (totalAccidents / totalWorkers) * 100000;
  const incidenciaEL = (totalOccupationalDiseases / totalWorkers) * 100000;
  
  return { incidenciaAT, incidenciaEL, totalAccidents, totalOccupationalDiseases, totalWorkers };
}

export default function IncidenciaAccidentesEL() {
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
    currentYearData ? calculateIncidencia(currentYearData) : null, 
    [currentYearData]
  );
  
  const previousIndicators = useMemo(() => 
    previousYearData ? calculateIncidencia(previousYearData) : null, 
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="title-standard">Estándar 3.3.5</h1>
            <p className="text-muted-foreground">Medición de la incidencia de AT y Enfermedad Laboral</p>
          </div>
        </div>
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

      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            Marco Normativo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Decreto 1072/2015, Art. 2.2.4.6.21:</strong> Indicadores que evalúan el proceso del SG-SST</p>
          <p><strong>Resolución 0312/2019:</strong> Estándar mínimo de medición de incidencia AT y EL</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            ¿Qué es la Incidencia?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>La <strong>incidencia</strong> mide el número de casos nuevos de accidentes o enfermedades laborales que ocurren en un período determinado. A diferencia de la prevalencia (casos totales), la incidencia solo cuenta los casos nuevos.</p>
          <p className="text-muted-foreground text-xs">Nota: En este sistema, los casos nuevos se aproximan con el total de AT y EL registrados en el período.</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-incidencia-at">
          <CardHeader className="pb-2">
            <CardDescription>Incidencia de Accidentes de Trabajo</CardDescription>
            <CardTitle className="text-3xl text-rose-600">
              {currentIndicators ? formatNumber(currentIndicators.incidenciaAT) : "—"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">por cada 100,000 trabajadores</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Incidencia AT = (Casos nuevos AT / Trabajadores) × 100,000
            </p>
            {previousIndicators && currentIndicators && (
              <div className="flex items-center gap-2 text-sm">
                {currentIndicators.incidenciaAT < previousIndicators.incidenciaAT ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Mejoró vs año anterior</span>
                  </>
                ) : currentIndicators.incidenciaAT > previousIndicators.incidenciaAT ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Aumentó vs año anterior</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sin cambio</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-incidencia-el">
          <CardHeader className="pb-2">
            <CardDescription>Incidencia de Enfermedad Laboral</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {currentIndicators ? formatNumber(currentIndicators.incidenciaEL) : "—"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">por cada 100,000 trabajadores</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Incidencia EL = (Casos nuevos EL / Trabajadores) × 100,000
            </p>
            {previousIndicators && currentIndicators && (
              <div className="flex items-center gap-2 text-sm">
                {currentIndicators.incidenciaEL < previousIndicators.incidenciaEL ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Mejoró vs año anterior</span>
                  </>
                ) : currentIndicators.incidenciaEL > previousIndicators.incidenciaEL ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Aumentó vs año anterior</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sin cambio</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
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
                <TableCell>Total Accidentes de Trabajo</TableCell>
                <TableCell className="text-right">{previousYearData?.totalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalAccidents ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Enfermedades Laborales</TableCell>
                <TableCell className="text-right">{previousYearData?.totalOccupationalDiseases ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalOccupationalDiseases ?? "—"}</TableCell>
              </TableRow>
              <TableRow className="bg-rose-50 dark:bg-rose-900/20">
                <TableCell className="font-bold text-rose-700 dark:text-rose-400">Incidencia AT</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(previousIndicators?.incidenciaAT)}</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatNumber(currentIndicators?.incidenciaAT)}</TableCell>
              </TableRow>
              <TableRow className="bg-orange-50 dark:bg-orange-900/20">
                <TableCell className="font-bold text-orange-700 dark:text-orange-400">Incidencia EL</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(previousIndicators?.incidenciaEL)}</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatNumber(currentIndicators?.incidenciaEL)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trazabilidad de casos nuevos - Estándar 3.3.5 */}
      {companyId && (
        <TrazabilidadIndicadores335
          companyId={companyId}
          year={selectedYear}
          onNavigateToAccident={(id) => navigate(`/investigacion-accidentes/${id}`)}
          onNavigateToDisease={(id) => navigate(`/enfermedades-laborales/${id}`)}
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
