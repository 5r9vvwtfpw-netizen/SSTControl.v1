import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

interface AccidentCardProps {
  id: string;
  type: string;
  description: string;
  severity: "leve" | "grave" | "mortal";
  date: string;
  time: string;
  worker: string;
}

const severityConfig = {
  leve: { label: "Leve", variant: "default" as const },
  grave: { label: "Grave", variant: "destructive" as const },
  mortal: { label: "Mortal", variant: "destructive" as const },
};

export function AccidentCard({ id, type, description, severity, date, time, worker }: AccidentCardProps) {
  return (
    <Card data-testid={`card-accident-${id}`} className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{type}</CardTitle>
          <Badge variant={severityConfig[severity].variant} data-testid={`badge-severity-${id}`}>
            {severityConfig[severity].label}
          </Badge>
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
