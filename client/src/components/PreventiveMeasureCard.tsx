import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, AlertTriangle } from "lucide-react";

interface PreventiveMeasureCardProps {
  title: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: string;
  priority: string;
  relatedArea?: string | null;
}

export function PreventiveMeasureCard({
  title,
  description,
  responsible,
  dueDate,
  status,
  priority,
  relatedArea,
}: PreventiveMeasureCardProps) {
  const statusColors = {
    pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    "en-progreso": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    completada: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    vencida: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const priorityColors = {
    alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    media: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    baja: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  };

  const statusLabels = {
    pendiente: "Pendiente",
    "en-progreso": "En Progreso",
    completada: "Completada",
    vencida: "Vencida",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-preventive-measure-${title}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-lg" data-testid="text-measure-title">{title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className={priorityColors[priority as keyof typeof priorityColors]} data-testid="badge-priority">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
            <Badge className={statusColors[status as keyof typeof statusColors]} data-testid="badge-status">
              {statusLabels[status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground" data-testid="text-description">{description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <User className="h-4 w-4" />
            <span data-testid="text-responsible">{responsible}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-due-date">{dueDate}</span>
          </div>
        </div>
        {relatedArea && (
          <p className="text-xs text-muted-foreground">Área: {relatedArea}</p>
        )}
      </CardContent>
    </Card>
  );
}
