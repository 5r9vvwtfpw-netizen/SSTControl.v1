import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackToEvaluationButtonProps {
  className?: string;
}

export function BackToEvaluationButton({ className = "" }: BackToEvaluationButtonProps) {
  const [, setLocation] = useLocation();
  
  const searchString = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(searchString);
  const fromEvaluation = params.get("from") === "evaluation";
  const evaluationId = params.get("evaluationId");
  
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
      variant="ghost"
      onClick={handleGoBack}
      className={`text-primary hover:text-primary/80 hover:bg-transparent p-0 h-auto font-normal no-default-hover-elevate ${className}`}
      data-testid="button-back-to-evaluation"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Volver a la evaluación inicial
    </Button>
  );
}
