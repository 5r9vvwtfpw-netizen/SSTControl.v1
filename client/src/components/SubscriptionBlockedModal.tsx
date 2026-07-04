import { AlertTriangle, CreditCard, Clock, XCircle, GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const TRAINING_APPROVAL_EMAIL = "admin@sst-colombia.com";

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
  const isPendingTrainingApproval = blockedReason?.includes(TRAINING_APPROVAL_EMAIL);

  const getStatusIcon = () => {
    if (isPendingTrainingApproval) {
      return <GraduationCap className="h-16 w-16 text-blue-500" />;
    }
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
    if (isPendingTrainingApproval) {
      return "Capacitación de Inducción Pendiente";
    }
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
    if (isPendingTrainingApproval) {
      return "border-blue-500 bg-blue-50 dark:bg-blue-950";
    }
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

          {isPendingTrainingApproval && (
            <div className="bg-background rounded-lg p-4 border text-left">
              <p className="text-sm text-muted-foreground">
                Antes de comenzar a usar el sistema, su equipo debe recibir una capacitación
                de inducción a cargo de nuestro equipo de soporte. Escríbanos indicando el
                nombre de su empresa y los datos de contacto, y activaremos su acceso tan
                pronto agendemos la capacitación.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          {isPendingTrainingApproval ? (
            <Button
              asChild
              className="w-full"
              size="lg"
              data-testid="button-request-training"
            >
              <a href={`mailto:${TRAINING_APPROVAL_EMAIL}?subject=${encodeURIComponent("Solicitud de capacitación de inducción - SST Colombia")}`}>
                <Mail className="mr-2 h-5 w-5" />
                Solicitar capacitación por correo
              </a>
            </Button>
          ) : (
            onActivateSubscription && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={onActivateSubscription}
                data-testid="button-activate-subscription"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Activar Suscripción
              </Button>
            )
          )}
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            {isPendingTrainingApproval
              ? `¿Ya solicitó la capacitación? Escríbanos a ${TRAINING_APPROVAL_EMAIL}`
              : "¿Necesita ayuda? Escríbanos a soporte@sst-colombia.com"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SubscriptionBlockedModal;
