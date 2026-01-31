import { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackToEvaluationButtonProps {
  className?: string;
}

export function BackToEvaluationButton({ className = "" }: BackToEvaluationButtonProps) {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  // Use window.location.search directly for reliable query param access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  }, []);
  
  const { fromEvaluation, evaluationId } = useMemo(() => {
    if (!searchParams) {
      return { fromEvaluation: false, evaluationId: null };
    }
    const from = searchParams.get("from");
    const evalId = searchParams.get("evaluationId");
    return {
      // Support both English "evaluation" and Spanish "evaluacion"
      fromEvaluation: from === "evaluation" || from === "evaluacion",
      evaluationId: evalId,
    };
  }, [searchParams]);
  
  // Always render the button - the evaluation context can be inferred
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
