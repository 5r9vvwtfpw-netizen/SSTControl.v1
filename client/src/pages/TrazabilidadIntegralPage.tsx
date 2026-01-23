import { TrazabilidadIntegral } from "@/components/TrazabilidadIntegral";
import { useCompanyContext } from "@/hooks/use-company-context";
import { Loader2 } from "lucide-react";

export default function TrazabilidadIntegralPage() {
  const { effectiveCompanyId, isLoading } = useCompanyContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!effectiveCompanyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No se ha seleccionado una empresa</p>
      </div>
    );
  }

  return <TrazabilidadIntegral companyId={effectiveCompanyId} />;
}
