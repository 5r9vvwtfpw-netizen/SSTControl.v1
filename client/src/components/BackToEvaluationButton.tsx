import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackToEvaluationButtonProps {
  className?: string;
}

export function BackToEvaluationButton({ className = "" }: BackToEvaluationButtonProps) {
  const [, setLocation] = useLocation();

  return (
    <Button
      variant="link"
      onClick={() => setLocation("/evaluaciones-sst")}
      className={`text-primary hover:text-primary/80 p-0 h-auto font-normal ${className}`}
      data-testid="button-back-to-evaluation"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Volver a la evaluación inicial
    </Button>
  );
}
