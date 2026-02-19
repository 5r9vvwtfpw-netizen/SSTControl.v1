import { AlertTriangle, CreditCard, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface SubscriptionBlockedModalProps {
  subscriptionStatus: string;
  blockedReason: string;
  trialEndsAt?: string | null;
  onActivateSubscription?: () => void;
}

export function SubscriptionBlockedModal({
  subscriptionStatus,
  blockedReason,
  trialEndsAt,
  onActivateSubscription,
}: SubscriptionBlockedModalProps) {
  const getStatusIcon = () => {
    switch (subscriptionStatus) {
      case "trial_expired":
        return <Clock className="h-16 w-16 text-orange-500" />;
      case "past_due":
        return <CreditCard className="h-16 w-16 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-16 w-16 text-gray-500" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (subscriptionStatus) {
      case "trial_expired":
        return "Período de Prueba Expirado";
      case "past_due":
        return "Pago Pendiente";
      case "cancelled":
        return "Suscripción Cancelada";
      case "no_subscription":
        return "Sin Suscripción Activa";
      default:
        return "Acceso Bloqueado";
    }
  };

  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case "trial_expired":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950";
      case "past_due":
        return "border-red-500 bg-red-50 dark:bg-red-950";
      case "cancelled":
        return "border-gray-500 bg-gray-50 dark:bg-gray-900";
      default:
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      data-testid="subscription-blocked-modal"
    >
      <Card className={`w-full max-w-lg mx-4 border-2 ${getStatusColor()}`}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="text-blocked-title">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            SST Colombia - Sistema de Seguridad y Salud en el Trabajo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p 
            className="text-lg text-foreground font-medium"
            data-testid="text-blocked-reason"
          >
            {blockedReason}
          </p>
          
          {subscriptionStatus === "trial_expired" && (
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">
                Su período de prueba de 7 días ha finalizado. 
                Para continuar utilizando el sistema, por favor active su suscripción.
              </p>
            </div>
          )}

          {subscriptionStatus === "past_due" && (
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">
                Hemos intentado procesar su pago sin éxito. 
                Por favor actualice su método de pago para restaurar el acceso.
              </p>
            </div>
          )}

          {trialEndsAt && subscriptionStatus === "trial" && (
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">
                Su prueba gratuita expira el: <strong>{new Date(trialEndsAt).toLocaleDateString('es-CO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          {onActivateSubscription && (
            <Button 
              className="w-full" 
              size="lg"
              onClick={onActivateSubscription}
              data-testid="button-activate-subscription"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Activar Suscripción
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            ¿Necesita ayuda? Escríbanos a soporte@sst-colombia.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SubscriptionBlockedModal;
