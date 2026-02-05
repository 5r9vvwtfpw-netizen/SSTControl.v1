import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation, useParams } from "wouter";

interface BackToPesvEvaluationButtonProps {
  className?: string;
}

/**
 * Botón para volver a la evaluación PESV específica.
 * Detecta automáticamente el evaluacionId desde la URL path.
 * Solo se muestra si estamos en contexto de evaluación PESV.
 * 
 * Ejemplo: Si estamos en /pesv/evaluacion/123/mantenimiento
 * → El botón lleva a /pesv/evaluacion/123
 */
export function BackToPesvEvaluationButton({ className = "" }: BackToPesvEvaluationButtonProps) {
  const [location, setLocation] = useLocation();
  const params = useParams<{ evaluacionId?: string }>();
  
  // Detectar evaluacionId desde params o desde la URL directamente
  const evaluacionId = params.evaluacionId || extractEvaluacionIdFromPath(location);
  
  // Solo mostrar si estamos en contexto de evaluación PESV
  if (!evaluacionId) {
    return null;
  }
  
  const handleGoBack = () => {
    setLocation(`/pesv/evaluacion/${evaluacionId}`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGoBack}
      className={className}
      data-testid="button-back-to-pesv-evaluation"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Volver a Evaluación PESV
    </Button>
  );
}

/**
 * Extrae el evaluacionId desde una ruta PESV.
 * Soporta rutas como: /pesv/evaluacion/123/mantenimiento
 */
function extractEvaluacionIdFromPath(path: string): string | null {
  const match = path.match(/\/pesv\/evaluacion\/([^/]+)/);
  return match ? match[1] : null;
}
