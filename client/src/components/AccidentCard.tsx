import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, User, Trash2, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [downloadingFurat, setDownloadingFurat] = useState(false);
  const { toast } = useToast();

  const handleDownloadFurat = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloadingFurat(true);
    try {
      const response = await fetch(`/api/accidents/${id}/furat-excel`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : `FURAT_${id.substring(0, 8)}.xlsx`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "FURAT generado", description: "El archivo Excel fue descargado exitosamente." });
    } catch (err: any) {
      toast({ title: "Error al generar FURAT", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingFurat(false);
    }
  };

  return (
    <Card data-testid={`card-accident-${id}`} className="hover-elevate relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{type}</CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant={severityConfig[severity].variant} data-testid={`badge-severity-${id}`}>
              {severityConfig[severity].label}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDownloadFurat}
                  disabled={downloadingFurat}
                  data-testid={`button-furat-excel-${id}`}
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar FURAT Excel</p>
                <p className="text-xs text-muted-foreground">Pre-diligenciado para enviar a la ARL</p>
              </TooltipContent>
            </Tooltip>
            {showDeleteButton && onDelete && (
              <Button
                size="icon"
                variant="ghost"
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
                <Trash2 className="h-4 w-4 text-destructive" />
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
