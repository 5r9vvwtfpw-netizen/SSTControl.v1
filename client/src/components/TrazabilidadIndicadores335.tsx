import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, AlertTriangle, Stethoscope, Calendar, User, FileText, ExternalLink, Activity } from "lucide-react";
import type { Accident, OccupationalDisease, Worker } from "@shared/schema";

interface TrazabilidadIndicadores335Props {
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

export function TrazabilidadIndicadores335({ companyId, year, onNavigateToAccident, onNavigateToDisease }: TrazabilidadIndicadores335Props) {
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

  const totalAccidents = yearAccidents.length;
  const totalDiseases = yearDiseases.length;

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  const hasNoData = totalAccidents === 0 && totalDiseases === 0;

  if (hasNoData) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20" data-testid="card-no-incidence-335">
        <CardContent className="py-8 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-green-700 dark:text-green-300 font-medium">
            Sin nuevos casos en {year}
          </p>
          <p className="text-sm text-muted-foreground">
            No se registraron nuevos accidentes de trabajo ni enfermedades laborales.
            La incidencia es 0 para ambos indicadores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-traceability-335">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Trazabilidad de Casos Nuevos - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-600" data-testid="text-new-accidents">{totalAccidents}</p>
            <p className="text-xs text-muted-foreground">Casos Nuevos AT</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600" data-testid="text-new-diseases">{totalDiseases}</p>
            <p className="text-xs text-muted-foreground">Casos Nuevos EL</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary" data-testid="text-total-new">{totalAccidents + totalDiseases}</p>
            <p className="text-xs text-muted-foreground">Total Casos Nuevos</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumen" className="gap-2" data-testid="tab-summary-335">
              <Activity className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="accidentes" className="gap-2" data-testid="tab-accidents-335">
              <AlertTriangle className="h-4 w-4" />
              AT ({totalAccidents})
            </TabsTrigger>
            <TabsTrigger value="enfermedades" className="gap-2" data-testid="tab-diseases-335">
              <Stethoscope className="h-4 w-4" />
              EL ({totalDiseases})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover-elevate border-rose-200 dark:border-rose-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    Incidencia de Accidentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-rose-600">{totalAccidents}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Casos nuevos registrados en {year}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-orange-500" />
                    Incidencia de Enfermedades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{totalDiseases}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Diagnósticos nuevos en {year}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium mb-1">Nota sobre la Incidencia:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>La <strong>incidencia</strong> mide casos NUEVOS en el período</li>
                <li>A diferencia de la prevalencia que mide casos TOTALES (nuevos + existentes)</li>
                <li>Fórmula: (Casos nuevos / Trabajadores expuestos) × 100,000</li>
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
                    <TableRow key={accident.id} data-testid={`row-accident-335-${accident.id}`}>
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
                            data-testid={`button-view-accident-335-${accident.id}`}
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
                <p>No hay enfermedades laborales diagnosticadas en {year}</p>
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
                    <TableRow key={disease.id} data-testid={`row-disease-335-${disease.id}`}>
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
                        <span className="text-sm">{disease.diagnosis || "No especificado"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={disease.status === "en-tratamiento" ? "default" : "secondary"}>
                          {disease.status === "en-tratamiento" ? "En Tratamiento" : 
                           disease.status === "recuperado" ? "Recuperado" : 
                           disease.status === "incapacidad" ? "Incapacidad" : "En Tratamiento"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {onNavigateToDisease && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onNavigateToDisease(disease.id)}
                            data-testid={`button-view-disease-335-${disease.id}`}
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
