/**
 * SubscriptionGate - Componente de protección de rutas por suscripción
 * 
 * Envuelve páginas premium para verificar que la empresa tenga acceso
 * según su plan de suscripción. Si no tiene acceso, muestra un mensaje
 * de upgrade en lugar del contenido.
 * 
 * Uso: <SubscriptionGate feature="hasPESV" featureName="Módulo PESV">
 *        <PesvPage />
 *      </SubscriptionGate>
 * 
 * Principio de Código Seguro: Componente nuevo, no modifica componentes existentes.
 */

import { useSubscriptionFeatures, type SubscriptionFeatures } from "@/hooks/use-subscription-features";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowUpCircle } from "lucide-react";
import { Link } from "wouter";

const GLOBAL_ACCESS_ROLES = ["superadmin", "admin", "soporte", "lso"];

interface SubscriptionGateProps {
  feature: keyof SubscriptionFeatures;
  featureName: string;
  children: React.ReactNode;
}

export function SubscriptionGate({ feature, featureName, children }: SubscriptionGateProps) {
  const { user } = useAuth();
  const { data: features, isLoading } = useSubscriptionFeatures();

  if (user?.role && GLOBAL_ACCESS_ROLES.includes(user.role)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="subscription-gate-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!features) {
    return <>{children}</>;
  }

  if (features[feature]) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4" data-testid="subscription-gate-blocked">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Funcionalidad no disponible</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            <strong>{featureName}</strong> no está incluido en su plan actual.
            Actualice su suscripción para acceder a esta funcionalidad.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/mi-cuenta" data-testid="link-upgrade-plan">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Actualizar Plan
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" data-testid="link-back-home">
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
