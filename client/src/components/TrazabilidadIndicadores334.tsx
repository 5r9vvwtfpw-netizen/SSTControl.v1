import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Stethoscope, Calendar, User, FileText, ExternalLink, Activity } from "lucide-react";
import type { OccupationalDisease, Worker } from "@shared/schema";

interface TrazabilidadIndicadores334Props {
  companyId: string;
  year: number;
  onNavigateToDisease?: (diseaseId: string) => void;
}

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function TrazabilidadIndicadores334({ companyId, year, onNavigateToDisease }: TrazabilidadIndicadores334Props) {
  const { data: diseases = [] } = useQuery<OccupationalDisease[]>({
    queryKey: [`/api/occupational-diseases?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: [`/api/workers?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const yearDiseases = useMemo(() => {
    return diseases.filter(d => {
      const diagnosisDate = new Date(d.diagnosisDate);
      return diagnosisDate.getFullYear() === year;
    });
  }, [diseases, year]);

  const activeDiseases = useMemo(() => {
    return yearDiseases.filter(d => d.status === "en-tratamiento" || d.status === "incapacidad" || !d.status);
  }, [yearDiseases]);

  const totalDiseases = yearDiseases.length;
  const totalActive = activeDiseases.length;

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  if (totalDiseases === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20" data-testid="card-no-diseases-334">
        <CardContent className="py-8 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-green-700 dark:text-green-300 font-medium">
            Sin enfermedades laborales diagnosticadas en {year}
          </p>
          <p className="text-sm text-muted-foreground">
            No se han registrado enfermedades laborales en el período seleccionado.
            La prevalencia es 0.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-traceability-334">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Trazabilidad de Enfermedades Laborales - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600" data-testid="text-total-diseases">{totalDiseases}</p>
            <p className="text-xs text-muted-foreground">Total Diagnosticadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600" data-testid="text-active-diseases">{totalActive}</p>
            <p className="text-xs text-muted-foreground">Casos Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="text-resolved-diseases">{totalDiseases - totalActive}</p>
            <p className="text-xs text-muted-foreground">Casos Resueltos</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-purple-500" />
            Detalle de Enfermedades Laborales ({totalDiseases})
          </h4>

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
                    <span className="text-sm">{disease.diagnosis || "No especificado"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={disease.status === "en-tratamiento" || disease.status === "incapacidad" ? "default" : "secondary"}
                      className={disease.status === "en-tratamiento" || disease.status === "incapacidad" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : ""}
                    >
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
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="font-medium mb-1">Sobre la Prevalencia:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>La prevalencia incluye <strong>todos</strong> los casos de EL (nuevos + existentes)</li>
            <li>Fórmula: (Total casos EL / Promedio trabajadores) × 100,000</li>
            <li>Un valor bajo indica mejor control de riesgos ocupacionales</li>
            <li>Compare con la incidencia para evaluar nuevos casos vs casos totales</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
