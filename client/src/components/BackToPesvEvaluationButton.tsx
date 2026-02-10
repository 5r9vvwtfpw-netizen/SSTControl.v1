import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";

const PESV_EVAL_STORAGE_KEY = "active_pesv_evaluacion_id";

export function setPesvEvaluacionContext(evaluacionId: string) {
  try {
    sessionStorage.setItem(PESV_EVAL_STORAGE_KEY, evaluacionId);
  } catch {}
}

export function clearPesvEvaluacionContext() {
  try {
    sessionStorage.removeItem(PESV_EVAL_STORAGE_KEY);
  } catch {}
}

function getPesvEvaluacionContext(): string | null {
  try {
    return sessionStorage.getItem(PESV_EVAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface BackToPesvEvaluationButtonProps {
  className?: string;
}

export function BackToPesvEvaluationButton({ className = "" }: BackToPesvEvaluationButtonProps) {
  const [location, setLocation] = useLocation();
  const params = useParams<{ evaluacionId?: string }>();
  const [storedEvalId, setStoredEvalId] = useState<string | null>(null);

  useEffect(() => {
    setStoredEvalId(getPesvEvaluacionContext());
  }, []);

  const evaluacionId = params.evaluacionId || extractEvaluacionIdFromPath(location) || storedEvalId;
  
  if (evaluacionId) {
    return (
      <Button
        className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md ${className}`}
        onClick={() => setLocation(`/pesv/evaluacion/${evaluacionId}`)}
        data-testid="button-back-to-pesv-evaluation"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Evaluación PESV
      </Button>
    );
  }

  return (
    <Link href="/pesv/evaluaciones">
      <Button
        className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md ${className}`}
        data-testid="button-ir-evaluacion-pesv"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Ir a Evaluación PESV
      </Button>
    </Link>
  );
}

function extractEvaluacionIdFromPath(path: string): string | null {
  const match = path.match(/\/pesv\/evaluacion\/([^/]+)/);
  return match ? match[1] : null;
}
