import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Skull, Calendar, User, FileText, ExternalLink, MapPin } from "lucide-react";
import type { Accident, Worker } from "@shared/schema";

interface TrazabilidadIndicadores333Props {
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

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function TrazabilidadIndicadores333({ companyId, year, onNavigateToAccident }: TrazabilidadIndicadores333Props) {
  const { data: accidents = [] } = useQuery<Accident[]>({
    queryKey: [`/api/accidents?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: [`/api/workers?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const fatalAccidents = useMemo(() => {
    return accidents.filter(a => {
      const accidentDate = new Date(a.date);
      return accidentDate.getFullYear() === year && a.severity === "mortal";
    });
  }, [accidents, year]);

  const totalFatalAccidents = fatalAccidents.length;

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  if (totalFatalAccidents === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20" data-testid="card-no-fatal-accidents">
        <CardContent className="py-8 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-green-700 dark:text-green-300 font-medium">
            Sin accidentes mortales en {year}
          </p>
          <p className="text-sm text-muted-foreground">
            No se han registrado accidentes con severidad "mortal" en el período seleccionado.
            La tasa de mortalidad es 0.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 dark:border-red-800" data-testid="card-traceability-333">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <Link2 className="h-5 w-5" />
          Trazabilidad de Accidentes Mortales - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-fatal-count">{totalFatalAccidents}</p>
            <p className="text-xs text-muted-foreground">Accidentes Mortales Registrados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Skull className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requiere acción inmediata</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-red-700 dark:text-red-300">
            <Skull className="h-4 w-4" />
            Detalle de Accidentes Mortales ({totalFatalAccidents})
          </h4>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Trabajador</TableHead>
                <TableHead>Tipo de Accidente</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fatalAccidents.map((accident) => (
                <TableRow key={accident.id} className="bg-red-50/50 dark:bg-red-900/10" data-testid={`row-fatal-accident-${accident.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
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
                    <Badge variant="destructive" className="text-xs">
                      {accidentTypeLabels[accident.type] || accident.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {accident.location || "No especificado"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {onNavigateToAccident && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onNavigateToAccident(accident.id)}
                        data-testid={`button-view-fatal-${accident.id}`}
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

        <div className="text-xs p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          <p className="font-medium text-red-700 dark:text-red-300 mb-1">Obligaciones legales ante accidente mortal:</p>
          <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
            <li>Reporte inmediato a la ARL (máximo 2 días hábiles)</li>
            <li>Notificación al Ministerio del Trabajo</li>
            <li>Investigación completa en máximo 15 días calendario</li>
            <li>Diligenciamiento del FURAT</li>
            <li>Implementación de acciones correctivas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
