import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, CheckCircle, Pencil, Trash2, FileText } from "lucide-react";

interface InspectionCardProps {
  id: string;
  area: string;
  date: string;
  findings: number;
  compliance: number;
  status: "aprobada" | "pendiente" | "rechazada";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPrint?: (id: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  aprobada: { label: "Aprobada", variant: "default" as const, icon: CheckCircle },
  pendiente: { label: "Pendiente", variant: "secondary" as const, icon: AlertCircle },
  rechazada: { label: "Rechazada", variant: "destructive" as const, icon: AlertCircle },
};

export function InspectionCard({ 
  id, 
  area, 
  date, 
  findings, 
  compliance, 
  status,
  onEdit,
  onDelete,
  onPrint,
  showActions = true
}: InspectionCardProps) {
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
      {showActions && (
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPrint?.(id)}
            data-testid={`button-print-inspection-${id}`}
            title="Descargar PDF"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(id)}
            data-testid={`button-edit-inspection-${id}`}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete?.(id)}
            data-testid={`button-delete-inspection-${id}`}
            title="Eliminar"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
