import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Target, Car } from "lucide-react";
import { Link } from "wouter";
import { EvaluacionPesv } from "@shared/schema";

interface EvaluacionPesvContextHeaderProps {
  evaluacion: EvaluacionPesv | undefined;
  currentModule: string;
  currentPhase?: "planear" | "hacer" | "verificar" | "actuar";
  isLoading?: boolean;
}

const PHASE_COLORS = {
  planear: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  hacer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  verificar: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  actuar: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const PHASE_LABELS = {
  planear: "PLANEAR",
  hacer: "HACER",
  verificar: "VERIFICAR",
  actuar: "ACTUAR",
};

const LEVEL_LABELS: Record<string, string> = {
  basico: "Básico",
  estandar: "Estándar",
  avanzado: "Avanzado",
};

export function EvaluacionPesvContextHeader({
  evaluacion,
  currentModule,
  currentPhase,
  isLoading = false,
}: EvaluacionPesvContextHeaderProps) {
  if (isLoading) {
    return (
      <Card className="mb-4 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-3">
          <div className="animate-pulse flex items-center gap-4">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!evaluacion) {
    return null;
  }

  return (
    <Card className="mb-4 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent" data-testid="card-evaluacion-context">
      <CardContent className="py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/pesv/evaluacion/${evaluacion.id}`}>
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back-to-evaluation">
                <ArrowLeft className="h-4 w-4" />
                Volver a Evaluación PESV
              </Button>
            </Link>
            
            <div className="h-4 w-px bg-border hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold" data-testid="text-evaluation-year">
                Evaluación PESV {evaluacion.anio}
              </span>
            </div>
            
            {currentPhase && (
              <Badge className={PHASE_COLORS[currentPhase]} data-testid="badge-current-phase">
                {PHASE_LABELS[currentPhase]}
              </Badge>
            )}
            
            <Badge variant="outline" data-testid="badge-current-module">
              {currentModule}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{LEVEL_LABELS[evaluacion.nivel] || evaluacion.nivel}</span>
            </div>
            
            {(evaluacion.numeroVehiculos || evaluacion.numeroConductores) && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>
                  {evaluacion.numeroVehiculos || 0} vehículos / {evaluacion.numeroConductores || 0} conductores
                </span>
              </div>
            )}
            
            {evaluacion.porcentajeCumplimiento && (
              <Badge 
                variant={Number(evaluacion.porcentajeCumplimiento) >= 80 ? "default" : "secondary"}
                data-testid="badge-compliance-percentage"
              >
                {evaluacion.porcentajeCumplimiento}% cumplimiento
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
