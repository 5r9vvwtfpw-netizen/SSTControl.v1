import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Activity } from "lucide-react";

interface EnvironmentalMeasurementCardProps {
  id: string;
  measurementType: string;
  area: string;
  status: "conforme" | "no_conforme" | "pendiente_analisis";
  date: string;
  valueNumeric?: string | null;
  unit?: string | null;
}

const statusConfig = {
  conforme: { label: "Conforme", variant: "default" as const },
  no_conforme: { label: "No Conforme", variant: "destructive" as const },
  pendiente_analisis: { label: "Pendiente", variant: "secondary" as const },
};

const measurementTypeLabels: Record<string, string> = {
  ruido: "Ruido",
  iluminacion: "Iluminación",
  temperatura: "Temperatura",
  agente_quimico: "Agente Químico",
  material_particulado: "Material Particulado",
  vibraciones: "Vibraciones",
};

export function EnvironmentalMeasurementCard({
  id,
  measurementType,
  area,
  status,
  date,
  valueNumeric,
  unit,
}: EnvironmentalMeasurementCardProps) {
  return (
    <Card data-testid={`card-measurement-${id}`} className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            {measurementTypeLabels[measurementType] || measurementType}
          </CardTitle>
          <Badge variant={statusConfig[status].variant} data-testid={`badge-status-${id}`}>
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span data-testid={`text-area-${id}`}>{area}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span data-testid={`text-date-${id}`}>{date}</span>
          </div>
          {valueNumeric !== null && valueNumeric !== undefined && unit && (
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span data-testid={`text-value-${id}`}>
                {valueNumeric} {unit}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
