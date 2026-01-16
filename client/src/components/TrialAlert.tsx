import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, XCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getTrialDaysRemaining, getTrialStatusMessage } from "@shared/utils";

type SubscriptionResponse = {
  id: string;
  status: string;
  trialEnd: string | null;
  plan: {
    name: string;
    displayName: string;
  };
};

export function TrialAlert() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: subscription } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
    staleTime: 1000 * 60 * 5,
  });

  if (!subscription) return null;

  const { status, trialEnd } = subscription;

  if (status === 'active') return null;

  if (status === 'trial' && trialEnd) {
    const daysRemaining = getTrialDaysRemaining(trialEnd);
    const { message, severity } = getTrialStatusMessage(daysRemaining);

    if (!message || (daysRemaining !== null && daysRemaining > 14)) return null;

    const isUrgent = severity === 'error' || (daysRemaining !== null && daysRemaining <= 3);
    const Icon = isUrgent ? AlertTriangle : Clock;

    return (
      <Alert 
        variant={isUrgent ? 'destructive' : 'warning'} 
        className={`mb-4 ${!isUrgent ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 dark:from-amber-950/50 dark:to-orange-950/50 dark:border-amber-600' : ''}`}
        data-testid="alert-trial"
      >
        <Icon className={`h-4 w-4 ${!isUrgent ? 'text-amber-600 dark:text-amber-400 animate-pulse' : ''}`} />
        <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className={`font-bold ${!isUrgent ? 'text-amber-800 dark:text-amber-200' : ''}`}>Período de Prueba</span>
            <span className={!isUrgent ? 'text-amber-700 dark:text-amber-300' : ''} data-testid="text-trial-message">{message}</span>
          </div>
          <Button 
            size="sm" 
            className={isUrgent ? '' : 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md'}
            onClick={() => navigate('/mi-suscripcion')}
            data-testid="button-activate-subscription"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Activar suscripción
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'past_due') {
    return (
      <Alert variant="destructive" className="mb-4" data-testid="alert-past-due">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
          <span data-testid="text-past-due-message">
            Tu suscripción está vencida. Realiza el pago para evitar la suspensión del servicio.
          </span>
          <Button 
            size="sm" 
            onClick={() => navigate('/mi-suscripcion')}
            data-testid="button-pay-now"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pagar ahora
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'suspended') {
    return (
      <Alert variant="destructive" className="mb-4" data-testid="alert-suspended">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
          <span data-testid="text-suspended-message">
            Tu cuenta ha sido suspendida por falta de pago. Reactiva tu suscripción para continuar.
          </span>
          <Button 
            size="sm" 
            onClick={() => navigate('/mi-suscripcion')}
            data-testid="button-reactivate"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Reactivar cuenta
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
