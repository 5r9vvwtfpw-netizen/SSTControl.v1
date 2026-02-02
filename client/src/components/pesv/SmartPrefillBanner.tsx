import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface PrefillField {
  label: string;
  value: string | number | null | undefined;
  applied: boolean;
}

interface SmartPrefillBannerProps {
  stepCode: string;
  stepName: string;
  fields: PrefillField[];
  onApplyAll?: () => void;
  onClearAll?: () => void;
  isLoading?: boolean;
}

export function SmartPrefillBanner({
  stepCode,
  stepName,
  fields,
  onApplyAll,
  onClearAll,
  isLoading = false,
}: SmartPrefillBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const appliedCount = fields.filter((f) => f.applied && f.value != null).length;
  const totalCount = fields.filter((f) => f.value != null).length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div 
      className="mb-4 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
      data-testid="smart-prefill-banner"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Formulario Inteligente
            </span>
            <Badge variant="secondary" className="text-xs">
              {stepCode}
            </Badge>
            {!isLoading && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {appliedCount}/{totalCount} campos auto-llenados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onApplyAll && totalCount > appliedCount && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onApplyAll}
                className="h-7 text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300"
                data-testid="button-apply-all-prefill"
              >
                <Check className="mr-1 h-3 w-3" />
                Aplicar todos
              </Button>
            )}
            {onClearAll && appliedCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearAll}
                className="h-7 text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300"
                data-testid="button-clear-all-prefill"
              >
                <X className="mr-1 h-3 w-3" />
                Limpiar
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                data-testid="button-toggle-prefill-details"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="border-t border-blue-200 px-3 py-2 dark:border-blue-800">
            <p className="mb-2 text-xs text-blue-700 dark:text-blue-300">
              Campos detectados para <strong>{stepName}</strong>:
            </p>
            <div className="grid gap-1">
              {fields
                .filter((f) => f.value != null)
                .map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-white/50 px-2 py-1 text-xs dark:bg-black/20"
                    data-testid={`prefill-field-${index}`}
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="max-w-[150px] truncate font-medium text-gray-900 dark:text-gray-100">
                        {typeof field.value === "object"
                          ? JSON.stringify(field.value)
                          : String(field.value)}
                      </span>
                      {field.applied ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border border-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function SmartPrefillBannerSkeleton() {
  return (
    <div 
      className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950"
      data-testid="smart-prefill-banner-loading"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-blue-800 dark:text-blue-200">
          Cargando datos inteligentes...
        </span>
      </div>
    </div>
  );
}
