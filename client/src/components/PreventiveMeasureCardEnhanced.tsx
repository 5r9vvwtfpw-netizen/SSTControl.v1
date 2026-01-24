import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, AlertTriangle, Printer, Pencil, Trash2 } from "lucide-react";

interface PreventiveMeasureCardEnhancedProps {
  id: string;
  title: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: string;
  priority: string;
  relatedArea?: string | null;
  onPrint?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function PreventiveMeasureCardEnhanced({
  id,
  title,
  description,
  responsible,
  dueDate,
  status,
  priority,
  relatedArea,
  onPrint,
  onEdit,
  onDelete,
  showActions = true,
}: PreventiveMeasureCardEnhancedProps) {
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
    <Card className="hover-elevate flex flex-col" data-testid={`card-preventive-measure-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2" data-testid="text-measure-title">{title}</h3>
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
      <CardContent className="space-y-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-description">{description}</p>
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
      {showActions && (
        <CardFooter className="pt-3 border-t flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPrint?.(id)}
            data-testid={`button-print-measure-${id}`}
          >
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(id)}
            data-testid={`button-edit-measure-${id}`}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Modificar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete?.(id)}
            data-testid={`button-delete-measure-${id}`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
