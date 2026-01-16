import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope, Activity } from "lucide-react";

interface OccupationalDiseaseCardProps {
  workerName: string;
  diseaseName: string;
  diagnosis: string;
  diagnosisDate: string;
  exposureFactor?: string | null;
  status: string;
  treatment?: string | null;
  followUpDate?: string | null;
}

export function OccupationalDiseaseCard({
  workerName,
  diseaseName,
  diagnosis,
  diagnosisDate,
  exposureFactor,
  status,
  treatment,
  followUpDate,
}: OccupationalDiseaseCardProps) {
  const statusColors = {
    activo: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    "en-tratamiento": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    recuperado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    incapacidad: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  };

  const statusLabels = {
    activo: "Activo",
    "en-tratamiento": "En Tratamiento",
    recuperado: "Recuperado",
    incapacidad: "Incapacidad",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-occupational-disease-${diseaseName}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg" data-testid="text-disease-name">{diseaseName}</h3>
            <p className="text-sm text-muted-foreground" data-testid="text-worker-name">{workerName}</p>
          </div>
          <Badge className={statusColors[status as keyof typeof statusColors]} data-testid="badge-status">
            <Activity className="h-3 w-3 mr-1" />
            {statusLabels[status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Diagnóstico:</p>
              <p className="text-sm text-muted-foreground" data-testid="text-diagnosis">{diagnosis}</p>
            </div>
          </div>
          {exposureFactor && (
            <div>
              <p className="text-sm font-medium">Factor de Exposición:</p>
              <p className="text-sm text-muted-foreground" data-testid="text-exposure-factor">{exposureFactor}</p>
            </div>
          )}
          {treatment && (
            <div>
              <p className="text-sm font-medium">Tratamiento:</p>
              <p className="text-sm text-muted-foreground" data-testid="text-treatment">{treatment}</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-diagnosis-date">Diagnóstico: {diagnosisDate}</span>
          </div>
          {followUpDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span data-testid="text-followup-date">Seguimiento: {followUpDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
