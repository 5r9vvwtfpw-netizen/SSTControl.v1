import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

interface BackToCronogramaButtonProps {
  className?: string;
}

export function BackToCronogramaButton({ className = "" }: BackToCronogramaButtonProps) {
  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);

  // Always navigate to cronograma - if we have a specific plan, go to that plan's cronograma
  // Otherwise, go to the plans list which will show the active plan's cronograma
  const href = lastPlanTrabajoId 
    ? `/planes-trabajo-anual/${lastPlanTrabajoId}?tab=mensual${lastCronogramaMes ? `&mes=${lastCronogramaMes}` : ''}`
    : `/planes-trabajo-anual?tab=mensual`;

  return (
    <Link 
      href={href}
      className={`text-primary hover:text-primary/80 flex items-center gap-1 text-sm ${className}`}
      data-testid="link-volver-cronograma"
    >
      Volver al cronograma
      <CalendarDays className="h-4 w-4" />
    </Link>
  );
}
