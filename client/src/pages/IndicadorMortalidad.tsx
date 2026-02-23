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
import { ArrowLeft, TrendingUp, TrendingDown, Skull, AlertTriangle, Activity } from "lucide-react";
import type { AccidentStatistics } from "@shared/schema";
import { TrazabilidadIndicadores333 } from "@/components/TrazabilidadIndicadores333";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

function calculateMortalityRate(data: AccidentStatistics) {
  const totalWorkers = data.totalWorkers ?? 1;
  const fatalAccidents = data.fatalAccidents ?? 0;
  
  // Tasa de Mortalidad = (Accidentes Mortales / Trabajadores) × 100,000
  const tasaMortalidad = (fatalAccidents / totalWorkers) * 100000;
  
  return { tasaMortalidad, fatalAccidents };
}

export default function IndicadorMortalidad() {
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
    currentYearData ? calculateMortalityRate(currentYearData) : null, 
    [currentYearData]
  );
  
  const previousIndicators = useMemo(() => 
    previousYearData ? calculateMortalityRate(previousYearData) : null, 
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="title-standard">Estándar 3.3.3</h1>
            <p className="text-muted-foreground">Medición de la mortalidad de Accidentes de Trabajo y Enfermedad Laboral</p>
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

      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Marco Normativo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Decreto 1072/2015, Art. 2.2.4.6.21:</strong> Indicadores que evalúan el proceso del SG-SST</p>
          <p><strong>Resolución 0312/2019, Estándar 3.3.3:</strong> Medición de la mortalidad por accidentes de trabajo y enfermedad laboral</p>
          <p><strong>Fórmula:</strong> Tasa de Mortalidad = (Número de Accidentes Mortales / Número de Trabajadores) × 100,000</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card data-testid="card-mortality-rate">
          <CardHeader className="pb-2">
            <CardDescription>Tasa de Mortalidad AT/EL</CardDescription>
            <CardTitle className="text-3xl">
              {currentIndicators ? formatNumber(currentIndicators.tasaMortalidad) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              (Accidentes Mortales × 100,000) / Trabajadores
            </p>
            {previousIndicators && currentIndicators && (
              <div className="flex items-center gap-2 text-sm">
                {currentIndicators.tasaMortalidad < previousIndicators.tasaMortalidad ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Mejoró vs año anterior</span>
                  </>
                ) : currentIndicators.tasaMortalidad > previousIndicators.tasaMortalidad ? (
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

        <Card data-testid="card-fatal-accidents">
          <CardHeader className="pb-2">
            <CardDescription>Accidentes Mortales</CardDescription>
            <CardTitle className="text-3xl">
              {currentIndicators ? currentIndicators.fatalAccidents : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Total de accidentes con resultado de muerte
            </p>
            {currentIndicators && currentIndicators.fatalAccidents === 0 ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Sin accidentes mortales
              </Badge>
            ) : currentIndicators && currentIndicators.fatalAccidents > 0 ? (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                Requiere investigación
              </Badge>
            ) : null}
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
                <TableCell>Accidentes Mortales</TableCell>
                <TableCell className="text-right">{previousYearData?.fatalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.fatalAccidents ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tasa de Mortalidad (×100,000)</TableCell>
                <TableCell className="text-right">{formatNumber(previousIndicators?.tasaMortalidad)}</TableCell>
                <TableCell className="text-right">{formatNumber(currentIndicators?.tasaMortalidad)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trazabilidad de accidentes mortales - Estándar 3.3.3 */}
      {companyId && (
        <TrazabilidadIndicadores333
          companyId={companyId}
          year={selectedYear}
          onNavigateToAccident={(id) => navigate(`/investigacion-accidentes/${id}`)}
        />
      )}

      {currentYearData && currentIndicators && currentIndicators.fatalAccidents > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Skull className="h-5 w-5" />
              Alerta: Accidentes Mortales Registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-red-600 dark:text-red-400">
            <p>Se han registrado {currentIndicators.fatalAccidents} accidente(s) mortal(es) en el período {selectedYear}.</p>
            <p>De acuerdo con la normativa colombiana, todos los accidentes mortales deben ser:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Reportados inmediatamente a la ARL</li>
              <li>Investigados dentro de los 15 días calendario</li>
              <li>Notificados al Ministerio del Trabajo</li>
              <li>Documentados en el FURAT (Formulario Único de Reporte de Accidente de Trabajo)</li>
            </ul>
          </CardContent>
        </Card>
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
