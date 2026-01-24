import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation, useSearch } from "wouter";

interface BackToEvaluationButtonProps {
  className?: string;
}

export function BackToEvaluationButton({ className = "" }: BackToEvaluationButtonProps) {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  const { fromEvaluation, evaluationId } = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return {
      fromEvaluation: params.get("from") === "evaluation",
      evaluationId: params.get("evaluationId"),
    };
  }, [searchString]);
  
  if (!fromEvaluation) {
    return null;
  }
  
  const handleGoBack = () => {
    if (evaluationId) {
      setLocation(`/evaluaciones-sst/${evaluationId}`);
    } else {
      setLocation("/evaluaciones-sst");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGoBack}
      className={className}
      data-testid="button-back-to-evaluation"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Volver a la evaluación inicial
    </Button>
  );
}
