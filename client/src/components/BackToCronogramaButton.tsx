import { CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { PlanTrabajoAnual } from "@shared/schema";

interface BackToCronogramaButtonProps {
  className?: string;
}

export function BackToCronogramaButton({ className = "" }: BackToCronogramaButtonProps) {
  const { data: planes } = useQuery<PlanTrabajoAnual[]>({
    queryKey: ["/api/planes-trabajo-anual"],
    staleTime: 5 * 60 * 1000,
  });

  const currentYear = new Date().getFullYear();
  const planActivo = planes?.find(p => p.estado === "aprobado" && p.anio === currentYear) 
    || planes?.find(p => p.estado === "aprobado")
    || planes?.[0];

  const href = planActivo 
    ? `/planes-trabajo-anual/${planActivo.id}?tab=cronograma`
    : `/planes-trabajo-anual`;

  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="sm"
        className={className}
        data-testid="link-volver-cronograma"
      >
        Volver al cronograma
        <CalendarDays className="h-4 w-4 ml-2" />
      </Button>
    </Link>
  );
}
