import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Trash2 } from "lucide-react";

interface AccidentCardProps {
  id: string;
  type: string;
  description: string;
  severity: "leve" | "grave" | "mortal";
  date: string;
  time: string;
  worker: string;
  showDeleteButton?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const severityConfig = {
  leve: { label: "Leve", variant: "default" as const },
  grave: { label: "Grave", variant: "destructive" as const },
  mortal: { label: "Mortal", variant: "destructive" as const },
};

export function AccidentCard({ id, type, description, severity, date, time, worker, showDeleteButton, onDelete, isDeleting }: AccidentCardProps) {
  return (
    <Card data-testid={`card-accident-${id}`} className="hover-elevate relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{type}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={severityConfig[severity].variant} data-testid={`badge-severity-${id}`}>
              {severityConfig[severity].label}
            </Badge>
            {showDeleteButton && onDelete && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm('¿Está seguro de eliminar este accidente? Esta acción no se puede deshacer.')) {
                    onDelete(id);
                  }
                }}
                disabled={isDeleting}
                data-testid={`button-delete-accident-${id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span data-testid={`text-date-${id}`}>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{worker}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
