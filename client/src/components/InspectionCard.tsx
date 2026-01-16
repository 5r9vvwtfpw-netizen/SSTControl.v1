import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface InspectionCardProps {
  id: string;
  area: string;
  date: string;
  findings: number;
  compliance: number;
  status: "aprobada" | "pendiente" | "rechazada";
}

const statusConfig = {
  aprobada: { label: "Aprobada", variant: "default" as const, icon: CheckCircle },
  pendiente: { label: "Pendiente", variant: "secondary" as const, icon: AlertCircle },
  rechazada: { label: "Rechazada", variant: "destructive" as const, icon: AlertCircle },
};

export function InspectionCard({ id, area, date, findings, compliance, status }: InspectionCardProps) {
  const StatusIcon = statusConfig[status].icon;
  const complianceColor = compliance >= 90 ? "text-chart-2" : compliance >= 70 ? "text-chart-3" : "text-chart-4";

  return (
    <Card data-testid={`card-inspection-${id}`} className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{area}</CardTitle>
          <Badge variant={statusConfig[status].variant} data-testid={`badge-status-${id}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>{findings} hallazgos</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Cumplimiento</span>
          <span className={`text-lg font-bold ${complianceColor}`} data-testid={`text-compliance-${id}`}>
            {compliance}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
