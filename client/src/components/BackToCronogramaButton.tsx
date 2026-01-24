import { CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { PlanTrabajoAnual } from "@shared/schema";

interface BackToCronogramaButtonProps {
  className?: string;
}

export function BackToCronogramaButton({ className = "" }: BackToCronogramaButtonProps) {
  // Obtener el plan de trabajo activo (aprobado del año actual)
  const { data: planes } = useQuery<PlanTrabajoAnual[]>({
    queryKey: ["/api/planes-trabajo-anual"],
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Buscar el plan aprobado del año actual, o el más reciente aprobado
  const currentYear = new Date().getFullYear();
  const planActivo = planes?.find(p => p.estado === "aprobado" && p.anio === currentYear) 
    || planes?.find(p => p.estado === "aprobado")
    || planes?.[0];

  // Si hay un plan activo, ir directamente al cronograma
  // Si no, ir a la lista de planes para que el usuario seleccione uno
  const href = planActivo 
    ? `/planes-trabajo-anual/${planActivo.id}?tab=cronograma`
    : `/planes-trabajo-anual`;

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
