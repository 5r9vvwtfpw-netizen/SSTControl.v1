import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CheckCircle2, Pencil, UserPlus, Printer } from "lucide-react";

interface TrainingCardProps {
  id: string;
  title: string;
  date: string;
  attendees: number;
  totalWorkers: number;
  status: "programada" | "completada" | "en-curso" | "cancelada";
  onEdit?: (id: string) => void;
  onManageAttendees?: (id: string) => void;
  canEdit?: boolean;
  canPrint?: boolean;
}

const statusConfig = {
  programada: { label: "Programada", variant: "secondary" as const },
  completada: { label: "Completada", variant: "default" as const },
  "en-curso": { label: "En Curso", variant: "default" as const },
  cancelada: { label: "Cancelada", variant: "destructive" as const },
};

export function TrainingCard({ id, title, date, attendees, totalWorkers, status, onEdit, onManageAttendees, canEdit, canPrint }: TrainingCardProps) {
  // Corregir división por cero y mostrar 100% cuando está completada
  // Limitar a máximo 100% para evitar desbordamiento visual
  const rawPercentage = totalWorkers > 0 
    ? Math.round((attendees / totalWorkers) * 100) 
    : (status === "completada" ? 100 : 0);
  const percentage = Math.min(rawPercentage, 100);
  const config = statusConfig[status] || statusConfig.programada;

  return (
    <Card data-testid={`card-training-${id}`} className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} data-testid={`badge-status-${id}`}>
              {config.label}
            </Badge>
            {canEdit && onManageAttendees && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageAttendees(id);
                }}
                title="Gestionar Asistentes"
                data-testid={`button-manage-attendees-${id}`}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            {canEdit && onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                data-testid={`button-edit-training-${id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{attendees}/{totalWorkers} asistentes</span>
          </div>
        </div>
        {status === "completada" && (
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-2 rounded-full bg-chart-2"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-chart-2">{percentage}%</span>
          </div>
        )}
        {canPrint && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`/api/trainings/${id}/lista-asistencia/pdf`, '_blank')}
            data-testid={`button-attendance-pdf-${id}`}
          >
            <Printer className="h-4 w-4 mr-2" />
            Lista de Asistencia (PDF)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
