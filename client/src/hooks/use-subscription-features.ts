import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export type SubscriptionFeatures = {
  maxWorkers: number | null;
  maxUsers: number | null;
  maxCompanies: number | null;
  maxSedes: number | null;
  hasIPERCCompleto: boolean;
  hasAuditorias: boolean;
  hasPESV: boolean;
  hasRevisionDireccion: boolean;
  hasGestionCambios: boolean;
  hasMatrizLegal: boolean;
  hasObjetivosIndicadores: boolean;
  hasEvaluacionProveedores: boolean;
  hasComunicacionSST: boolean;
  hasAdquisicionesSST: boolean;
  hasDashboardsEjecutivos: boolean;
  hasPDFsNormativos: boolean;
  hasExamenesMedicos: boolean;
  hasMedicionesAmbientales: boolean;
  hasSustanciasQuimicas: boolean;
  hasCOPASST: boolean;
  hasComiteConvivencia: boolean;
  hasAPI: boolean;
  hasExportacionMasiva: boolean;
  hasWhiteLabel: boolean;
  hasSLA: boolean;
  hasGerenteCuenta: boolean;
  hasConsultoriaSST: boolean;
};

export function useSubscriptionFeatures() {
  const { user } = useAuth();

  return useQuery<SubscriptionFeatures>({
    queryKey: ["/api/billing/my-features"],
    enabled: !!user?.companyId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid false locks
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  });
}
