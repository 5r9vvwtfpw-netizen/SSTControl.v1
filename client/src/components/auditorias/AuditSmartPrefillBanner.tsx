import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Link2, CheckCircle2, X } from "lucide-react";

interface AuditSmartPrefillBannerProps {
  detectedFields: string[];
  trazabilidadInfo: {
    estandar: string;
    descripcion: string;
    objetivos: Array<{ id: string; nombre: string }>;
  } | null;
  onApply: () => void;
  onDismiss: () => void;
  isApplied: boolean;
}

export function AuditSmartPrefillBanner({
  detectedFields,
  trazabilidadInfo,
  onApply,
  onDismiss,
  isApplied
}: AuditSmartPrefillBannerProps) {
  if (detectedFields.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              Smart Form - Auditoría Inteligente
              {isApplied && (
                <Badge className="bg-emerald-500 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aplicado
                </Badge>
              )}
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              {detectedFields.length} campos auto-detectados del sistema SST
            </p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {detectedFields.map((field, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-white/50 dark:bg-black/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-xs"
                >
                  {field}
                </Badge>
              ))}
            </div>

            {trazabilidadInfo && (
              <div className="mt-3 p-2 bg-white/50 dark:bg-black/20 rounded border border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  <Link2 className="h-4 w-4" />
                  Trazabilidad Automática
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  <strong>Estándar {trazabilidadInfo.estandar}:</strong> {trazabilidadInfo.descripcion}
                </p>
                {trazabilidadInfo.objetivos.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    <strong>Objetivos SST vinculados:</strong> {trazabilidadInfo.objetivos.length} objetivo(s) activo(s)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isApplied && (
            <Button
              type="button"
              size="sm"
              onClick={onApply}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-apply-smart-prefill"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Aplicar
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onDismiss}
            className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
            data-testid="button-dismiss-smart-prefill"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
