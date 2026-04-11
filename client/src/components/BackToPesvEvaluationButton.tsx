import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation, useParams } from "wouter";

const PESV_EVAL_STORAGE_KEY = "active_pesv_evaluacion_id";
const PESV_FASE_STORAGE_KEY = "active_pesv_fase";

export function setPesvEvaluacionContext(evaluacionId: string, fase?: string) {
  try {
    sessionStorage.setItem(PESV_EVAL_STORAGE_KEY, evaluacionId);
    if (fase) {
      sessionStorage.setItem(PESV_FASE_STORAGE_KEY, fase);
    }
  } catch {}
}

export function clearPesvEvaluacionContext() {
  try {
    sessionStorage.removeItem(PESV_EVAL_STORAGE_KEY);
    sessionStorage.removeItem(PESV_FASE_STORAGE_KEY);
  } catch {}
}

function getPesvEvaluacionContext(): string | null {
  try {
    return sessionStorage.getItem(PESV_EVAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getPesvFaseContext(): string | null {
  try {
    return sessionStorage.getItem(PESV_FASE_STORAGE_KEY);
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
  const storedFase = getPesvFaseContext();
  
  if (!evaluacionId) return null;

  const faseParam = storedFase ? `?fase=${storedFase}` : '';
  return (
    <Button
      className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md ${className}`}
      onClick={() => setLocation(`/pesv/evaluacion/${evaluacionId}${faseParam}`)}
      data-testid="button-back-to-pesv-evaluation"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver a Evaluación PESV
    </Button>
  );
}

function extractEvaluacionIdFromPath(path: string): string | null {
  const match = path.match(/\/pesv\/evaluacion\/([^/]+)/);
  return match ? match[1] : null;
}
