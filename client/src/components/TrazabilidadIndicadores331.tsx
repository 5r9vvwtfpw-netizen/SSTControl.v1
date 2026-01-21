import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link2, AlertTriangle, Calendar, User, Clock, ChevronDown, ChevronRight, FileText, ExternalLink } from "lucide-react";
import type { Accident, WorkerAbsence, Worker } from "@shared/schema";

interface TrazabilidadIndicadores331Props {
  companyId: string;
  year: number;
  onNavigateToAccident?: (accidentId: string) => void;
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

export function TrazabilidadIndicadores331({ companyId, year, onNavigateToAccident }: TrazabilidadIndicadores331Props) {
  const { data: accidents = [] } = useQuery<Accident[]>({
    queryKey: [`/api/accidents?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: absences = [] } = useQuery<WorkerAbsence[]>({
    queryKey: [`/api/absences?companyId=${companyId}`],
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

  const yearAbsences = useMemo(() => {
    return absences.filter(a => {
      if (!a.accidentId) return false;
      const startDate = new Date(a.startDate);
      return startDate.getFullYear() === year;
    });
  }, [absences, year]);

  const totalAccidents = yearAccidents.length;
  const totalLostDays = yearAbsences.reduce((sum, a) => sum + (a.daysLost || 0), 0);

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  const getLinkedAbsences = (accidentId: string) => {
    return yearAbsences.filter(a => a.accidentId === accidentId);
  };

  if (totalAccidents === 0) {
    return (
      <Card className="border-dashed border-2" data-testid="card-no-traceability">
        <CardContent className="py-8 text-center space-y-3">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            No hay accidentes de trabajo registrados en {year}
          </p>
          <p className="text-sm text-muted-foreground">
            Los indicadores IF e IS se calculan automáticamente cuando registras accidentes en el módulo de Investigación de Accidentes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-traceability-331">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Trazabilidad de Datos - Período {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalAccidents}</p>
            <p className="text-xs text-muted-foreground">Accidentes Registrados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{totalLostDays}</p>
            <p className="text-xs text-muted-foreground">Días Perdidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{yearAbsences.length}</p>
            <p className="text-xs text-muted-foreground">Incapacidades Vinculadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {totalAccidents > 0 ? (totalLostDays / totalAccidents).toFixed(1) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Días Promedio/AT</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Detalle de Accidentes de Trabajo ({totalAccidents})
          </h4>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Trabajador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead className="text-center">Días Perdidos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearAccidents.map((accident) => {
                const linkedAbsences = getLinkedAbsences(accident.id);
                const daysLost = linkedAbsences.reduce((sum, a) => sum + (a.daysLost || 0), 0);
                const hasAbsences = linkedAbsences.length > 0;

                return (
                  <Collapsible key={accident.id} asChild>
                    <>
                      <TableRow 
                        className={hasAbsences ? "cursor-pointer hover-elevate" : ""}
                        data-testid={`row-accident-trace-${accident.id}`}
                      >
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
                        <TableCell className="text-center">
                          {daysLost > 0 ? (
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-expand-${accident.id}`}>
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{daysLost}</span>
                                <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                              </Button>
                            </CollapsibleTrigger>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Sin incapacidad
                            </span>
                          )}
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
                      
                      {hasAbsences && (
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="px-8 py-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                  <Link2 className="h-3 w-3" />
                                  Incapacidades vinculadas:
                                </p>
                                <div className="space-y-1">
                                  {linkedAbsences.map((absence) => (
                                    <div 
                                      key={absence.id} 
                                      className="flex items-center justify-between text-sm bg-background rounded p-2"
                                    >
                                      <div className="flex items-center gap-4">
                                        <span className="text-muted-foreground">
                                          {formatDate(absence.startDate)} → {formatDate(absence.endDate)}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                          {absence.daysLost || 0} días
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {absence.incapacityNumber ? `Inc. #${absence.incapacityNumber}` : ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      )}
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="font-medium mb-1">Nota sobre trazabilidad:</p>
          <p>Los días perdidos se calculan automáticamente desde las ausencias vinculadas a cada accidente en el módulo de Ausentismo Laboral.</p>
        </div>
      </CardContent>
    </Card>
  );
}
