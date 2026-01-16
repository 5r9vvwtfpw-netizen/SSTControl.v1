import { Badge } from "@/components/ui/badge";
import { 
  GENERAL_STATUS_CONFIGS, 
  CUMPLIMIENTO_CONFIGS,
  IMPACTO_CONFIGS,
  TIPO_CONFIGS,
  OBJETIVO_STATUS_CONFIGS,
  PROVEEDOR_STATUS_CONFIGS,
  EVALUACION_PROVEEDOR_STATUS_CONFIGS,
  CAMBIO_STATUS_CONFIGS,
  getBadgeConfig,
  type BadgeConfig 
} from "@/lib/utils/badge-helpers";
import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: 'general' | 'cumplimiento' | 'impacto' | 'tipo' | 'objetivo' | 'proveedor' | 'evaluacion-proveedor' | 'cambio';
  testId?: string;
  withIcon?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  activo: CheckCircle2,
  "en-revision": Clock,
  cumplido: CheckCircle2,
  "no-cumplido": XCircle,
  suspendido: XCircle,
  completado: CheckCircle2,
  aprobado: CheckCircle2,
  rechazado: XCircle,
  cancelado: XCircle,
};

/**
 * Componente reutilizable para mostrar badges de estado
 * Centraliza la lógica de renderizado de badges para mantener consistencia
 */
export function StatusBadge({ status, type = 'general', testId, withIcon = false }: StatusBadgeProps) {
  const configMap = {
    general: GENERAL_STATUS_CONFIGS,
    cumplimiento: CUMPLIMIENTO_CONFIGS,
    impacto: IMPACTO_CONFIGS,
    tipo: TIPO_CONFIGS,
    objetivo: OBJETIVO_STATUS_CONFIGS,
    proveedor: PROVEEDOR_STATUS_CONFIGS,
    'evaluacion-proveedor': EVALUACION_PROVEEDOR_STATUS_CONFIGS,
    cambio: CAMBIO_STATUS_CONFIGS,
  }[type];
  
  const config = getBadgeConfig(status, configMap);
  const Icon = withIcon ? ICON_MAP[status] : null;
  
  return (
    <Badge variant={config.variant} data-testid={testId}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
