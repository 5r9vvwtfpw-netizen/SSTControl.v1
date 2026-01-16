import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintDashboardButtonProps {
  title?: string;
  className?: string;
}

export function PrintDashboardButton({ 
  title = "Imprimir Panel de Control",
  className = ""
}: PrintDashboardButtonProps) {
  const handlePrint = () => {
    // Ocultar navegación y elementos no necesarios antes de imprimir
    const elementsToHide = document.querySelectorAll('[data-print-hide="true"]');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Ejecutar impresión
    window.print();

    // Restaurar elementos después de imprimir o cancelar
    setTimeout(() => {
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className={className}
      data-testid="button-print-dashboard"
      data-print-hide="true"
    >
      <Printer className="h-4 w-4 mr-2" />
      {title}
    </Button>
  );
}
