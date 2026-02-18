/**
 * SubscriptionProtectedRoute - Ruta protegida con verificación de suscripción
 * 
 * Extiende ProtectedRoute agregando verificación de features del plan.
 * Si la empresa no tiene acceso a la feature, muestra pantalla de upgrade.
 * 
 * Principio de Código Seguro: Componente nuevo que envuelve ProtectedRoute
 * sin modificar su implementación original.
 */

import { useMemo } from "react";
import { Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import type { SubscriptionFeatures } from "@/hooks/use-subscription-features";
import { ProtectedRoute } from "./protected-route";

interface SubscriptionProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  feature: keyof SubscriptionFeatures;
  featureName: string;
}

export function SubscriptionProtectedRoute({
  path,
  component: Component,
  feature,
  featureName,
}: SubscriptionProtectedRouteProps) {
  const GatedComponent = useMemo(() => {
    return function GatedWrapper() {
      return (
        <SubscriptionGate feature={feature} featureName={featureName}>
          <Component />
        </SubscriptionGate>
      );
    };
  }, [Component, feature, featureName]);

  return <ProtectedRoute path={path} component={GatedComponent} />;
}
