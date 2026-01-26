import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AccidentInvestigation, Accident, Worker } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  TreePine, 
  AlertTriangle, 
  Calendar,
  User,
  Loader2,
  Info
} from "lucide-react";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { ArbolCausasVisualization } from "@/components/ArbolCausasVisualization";

export default function ArbolCausas() {
  const { user } = useAuth();
  const { effectiveCompanyId } = useCompanyContext();
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);

  // Fetch investigations with arbol_causas methodology
  const { data: investigations = [], isLoading: loadingInvestigations } = useQuery<AccidentInvestigation[]>({
    queryKey: ["/api/investigations", effectiveCompanyId],
    enabled: !!effectiveCompanyId,
  });

  // Fetch accidents for worker info
  const { data: accidents = [] } = useQuery<Accident[]>({
    queryKey: ["/api/accidents", effectiveCompanyId],
    enabled: !!effectiveCompanyId,
  });

  // Fetch workers
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers", effectiveCompanyId],
    enabled: !!effectiveCompanyId,
  });

  // Filter only investigations with arbol_causas methodology
  const arbolCausasInvestigations = investigations.filter(
    inv => inv.analysisMethodology === "arbol_causas"
  );

  const getAccidentInfo = (accidentId: string | null) => {
    if (!accidentId) return null;
    return accidents.find(a => a.id === accidentId);
  };

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return "Trabajador no identificado";
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : "Trabajador no encontrado";
  };

  const selectedInvestigation = selectedInvestigationId 
    ? arbolCausasInvestigations.find(inv => inv.id === selectedInvestigationId)
    : arbolCausasInvestigations[0] || null;

  if (loadingInvestigations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TreePine className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">Árbol de Causas</h1>
            <p className="text-sm text-muted-foreground">
              Metodología de análisis causal según Resolución 1401/2007
            </p>
          </div>
        </div>
        <BackToEvaluationButton />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            ¿Qué es el Árbol de Causas?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            El Árbol de Causas es una metodología de análisis de accidentes que permite identificar 
            las causas raíz partiendo del evento final. Se estructura de la siguiente manera:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded bg-red-400 mt-1 flex-shrink-0" />
              <div>
                <strong>Evento/Accidente:</strong> El incidente que ocurrió
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded bg-amber-400 mt-1 flex-shrink-0" />
              <div>
                <strong>Actos Inseguros:</strong> Comportamientos del trabajador
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded bg-orange-400 mt-1 flex-shrink-0" />
              <div>
                <strong>Condiciones Inseguras:</strong> Factores del ambiente
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded bg-blue-400 mt-1 flex-shrink-0" />
              <div>
                <strong>Factores Personales:</strong> Capacitación, motivación, salud
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded bg-indigo-400 mt-1 flex-shrink-0" />
              <div>
                <strong>Factores del Trabajo:</strong> Supervisión, procedimientos
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded bg-purple-400 mt-1 flex-shrink-0" />
              <div>
                <strong>Causa Raíz:</strong> La causa fundamental identificada
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {arbolCausasInvestigations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <TreePine className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No hay investigaciones con Árbol de Causas</h3>
              <p className="text-sm">
                Aún no se han registrado investigaciones de accidentes con la metodología "Árbol de Causas".
              </p>
              <p className="text-sm mt-2">
                Para crear un árbol de causas, registre un accidente e inicie una investigación 
                seleccionando "Árbol de Causas" como metodología de análisis.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seleccionar Investigación</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedInvestigation?.id || ""} 
                onValueChange={(value) => setSelectedInvestigationId(value)}
              >
                <SelectTrigger className="w-full" data-testid="select-investigation">
                  <SelectValue placeholder="Seleccione una investigación" />
                </SelectTrigger>
                <SelectContent>
                  {arbolCausasInvestigations.map((inv) => {
                    const accident = getAccidentInfo(inv.accidentId);
                    const workerName = accident ? getWorkerName(accident.workerId) : "Sin trabajador";
                    return (
                      <SelectItem key={inv.id} value={inv.id} data-testid={`option-investigation-${inv.id}`}>
                        {workerName} - {format(new Date(inv.eventDate), "dd/MM/yyyy", { locale: es })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedInvestigation && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Análisis de Causas
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(selectedInvestigation.eventDate), "dd MMMM yyyy", { locale: es })}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {(() => {
                          const accident = getAccidentInfo(selectedInvestigation.accidentId);
                          return accident ? getWorkerName(accident.workerId) : "Sin trabajador";
                        })()}
                      </Badge>
                      {selectedInvestigation.isSevere === 1 && (
                        <Badge variant="destructive" className="text-xs">Grave</Badge>
                      )}
                      {selectedInvestigation.isFatal === 1 && (
                        <Badge className="bg-black text-white text-xs">Mortal</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripción del Evento</h4>
                  <p className="text-sm">{selectedInvestigation.eventDescription || "Sin descripción"}</p>
                </div>
                
                <Separator className="my-4" />
                
                <ArbolCausasVisualization 
                  investigation={selectedInvestigation}
                  eventDescription={selectedInvestigation.eventDescription || "Sin descripción del evento"}
                />

                {selectedInvestigation.rootCause && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Conclusión - Causa Raíz Identificada</h4>
                      <p className="text-sm bg-purple-50 dark:bg-purple-950/30 p-3 rounded-md border border-purple-200 dark:border-purple-800">
                        {selectedInvestigation.rootCause}
                      </p>
                    </div>
                  </>
                )}

                {selectedInvestigation.lessonLearned && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Lecciones Aprendidas</h4>
                    <p className="text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                      {selectedInvestigation.lessonLearned}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
