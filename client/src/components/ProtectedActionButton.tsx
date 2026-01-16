import { type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProtectedActionButtonProps extends ButtonProps {
  resource: string;
  action?: "create" | "edit" | "delete";
  children: ReactNode;
  hideIfNoPermission?: boolean;
}

export function ProtectedActionButton({
  resource,
  action = "create",
  children,
  hideIfNoPermission = false,
  disabled,
  ...props
}: ProtectedActionButtonProps) {
  const { canWrite, isWorker } = usePermissions();

  const hasWritePermission = canWrite(resource);

  // Si no tiene permiso y debe ocultarse, no renderizar nada
  if (hideIfNoPermission && !hasWritePermission) {
    return null;
  }

  // Si es trabajador, deshabilitar y mostrar tooltip
  if (isWorker() && !hasWritePermission) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button {...props} disabled={true}>
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Solo tienes acceso de solo lectura a esta información</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Si tiene permiso o no es trabajador, renderizar normalmente
  return (
    <Button {...props} disabled={disabled || !hasWritePermission}>
      {children}
    </Button>
  );
}
