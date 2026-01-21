import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, AlertTriangle, Calendar, User, FileText, ExternalLink, Activity, Stethoscope, AlertCircle } from "lucide-react";
import type { Accident, OccupationalDisease, Worker, AccidentStatistics } from "@shared/schema";

interface TrazabilidadIndicadores332Props {
  companyId: string;
  year: number;
  onNavigateToAccident?: (accidentId: string) => void;
  onNavigateToDisease?: (diseaseId: string) => void;
}

const accidentTypeLabels: Record<string, string> = {
  caida_altura: "Caída de altura",
  caida_mismo_nivel: "Caída mismo nivel",
  golpe_objeto: "Golpe por objeto",
  atrapamiento: "Atrapamiento",
  corte_herida: "Corte/Herida",
  quemadura: "Quemadura",
  choque_electrico: "Choque eléctrico",
  exposicion_quimicos: "Exposición química",
  sobreesfuerzo: "Sobreesfuerzo",
  accidente_transito: "Accidente de tránsito",
  otro: "Otro"
};

const severityColors: Record<string, string> = {
  leve: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  grave: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  muy_grave: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  mortal: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300"
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function TrazabilidadIndicadores332({ companyId, year, onNavigateToAccident, onNavigateToDisease }: TrazabilidadIndicadores332Props) {
  const [activeTab, setActiveTab] = useState<string>("resumen");

  const { data: accidents = [] } = useQuery<Accident[]>({
    queryKey: [`/api/accidents?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: diseases = [] } = useQuery<OccupationalDisease[]>({
    queryKey: [`/api/occupational-diseases?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: [`/api/workers?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: statistics = [] } = useQuery<AccidentStatistics[]>({
    queryKey: [`/api/accident-statistics?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const yearAccidents = useMemo(() => {
    return accidents.filter(a => {
      const accidentDate = new Date(a.date);
      return accidentDate.getFullYear() === year;
    });
  }, [accidents, year]);

  const yearDiseases = useMemo(() => {
    return diseases.filter(d => {
      const diagnosisDate = new Date(d.diagnosisDate);
      return diagnosisDate.getFullYear() === year;
    });
  }, [diseases, year]);

  const yearStats = useMemo(() => {
    return statistics.find(s => s.year === year && !s.month);
  }, [statistics, year]);

  const totalIncidents = yearStats?.totalIncidents || 0;
  const totalAccidents = yearAccidents.length;
  const totalDiseases = yearDiseases.length;

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  const hasNoData = totalAccidents === 0 && totalDiseases === 0 && totalIncidents === 0;

  if (hasNoData) {
    return (
      <Card className="border-dashed border-2" data-testid="card-no-traceability-332">
        <CardContent className="py-8 text-center space-y-3">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            No hay datos de accidentes, incidentes ni enfermedades laborales para {year}
          </p>
          <p className="text-sm text-muted-foreground">
            Los indicadores ILI y tasas se calculan automáticamente cuando registras eventos en los módulos correspondientes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-traceability-332">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Trazabilidad de Datos - Período {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600" data-testid="text-total-accidents">{totalAccidents}</p>
            <p className="text-xs text-muted-foreground">Accidentes de Trabajo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600" data-testid="text-total-incidents">{totalIncidents}</p>
            <p className="text-xs text-muted-foreground">Incidentes Reportados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600" data-testid="text-total-diseases">{totalDiseases}</p>
            <p className="text-xs text-muted-foreground">Enfermedades Laborales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary" data-testid="text-total-events">{totalAccidents + totalIncidents + totalDiseases}</p>
            <p className="text-xs text-muted-foreground">Total Eventos SST</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumen" className="gap-2" data-testid="tab-summary">
              <Activity className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="accidentes" className="gap-2" data-testid="tab-accidents">
              <AlertTriangle className="h-4 w-4" />
              AT ({totalAccidents})
            </TabsTrigger>
            <TabsTrigger value="enfermedades" className="gap-2" data-testid="tab-diseases">
              <Stethoscope className="h-4 w-4" />
              EL ({totalDiseases})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Accidentes de Trabajo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalAccidents}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registrados en el módulo de Investigación de Accidentes
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Incidentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalIncidents}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor registrado en Estadísticas de Accidentalidad
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-purple-500" />
                    Enfermedades Laborales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalDiseases}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registradas en el módulo de Enfermedades Laborales
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium mb-1">Fuentes de datos para indicadores:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Tasa de AT:</strong> Accidentes registrados en Investigación de Accidentes</li>
                <li><strong>Tasa de Incidentes:</strong> Valor ingresado manualmente en Estadísticas de Accidentalidad</li>
                <li><strong>Tasa de EL:</strong> Enfermedades diagnosticadas en el módulo de Enfermedades Laborales</li>
                <li><strong>ILI:</strong> Calculado automáticamente con IF × IS / 1000</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="accidentes" className="mt-4">
            {totalAccidents === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto opacity-50 mb-2" />
                <p>No hay accidentes de trabajo registrados en {year}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearAccidents.map((accident) => (
                    <TableRow key={accident.id} data-testid={`row-accident-${accident.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(accident.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {getWorkerName(accident.workerId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {accidentTypeLabels[accident.type] || accident.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={severityColors[accident.severity] || "bg-gray-100"}>
                          {accident.severity?.replace("_", " ") || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {onNavigateToAccident && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onNavigateToAccident(accident.id)}
                            data-testid={`button-view-accident-${accident.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="enfermedades" className="mt-4">
            {totalDiseases === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-8 w-8 mx-auto opacity-50 mb-2" />
                <p>No hay enfermedades laborales registradas en {year}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Diagnóstico</TableHead>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearDiseases.map((disease) => (
                    <TableRow key={disease.id} data-testid={`row-disease-${disease.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(disease.diagnosisDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {getWorkerName(disease.workerId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{disease.diagnosis || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={disease.status === "activo" ? "default" : "secondary"}>
                          {disease.status || "Activo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {onNavigateToDisease && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onNavigateToDisease(disease.id)}
                            data-testid={`button-view-disease-${disease.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
