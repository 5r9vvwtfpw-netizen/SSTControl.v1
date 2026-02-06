import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, XCircle, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getTrialDaysRemaining, getTrialStatusMessage } from "@shared/utils";

type SubscriptionResponse = {
  id: string;
  status: string;
  trialEnd?: string | null;
  trial_end?: string | null;
  plan: {
    name: string;
    displayName: string;
  };
};

export function TrialAlert() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActivating, setIsActivating] = useState(false);

  const { data: subscription } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
    staleTime: 1000 * 60 * 5,
  });

  if (!subscription) return null;

  const { id: subscriptionId, status } = subscription;
  const trialEnd = subscription.trialEnd || subscription.trial_end;

  if (status === 'active') return null;

  const handleActivateSubscription = async () => {
    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "No se encontró ID de suscripción",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    try {
      const quoteToken = typeof window !== 'undefined' ? sessionStorage.getItem('sst_quote_token') : null;
      const res = await apiRequest(
        "POST",
        `/api/billing/subscription/${subscriptionId}/activate`,
        quoteToken ? { quoteToken } : {}
      );
      
      const data = await res.json() as { paymentUrl?: string; error?: string; success?: boolean };
      
      console.log("Activation response:", data);
      
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      
      if (data.paymentUrl) {
        toast({
          title: "Redirigiendo a pasarela de pago",
          description: "Serás redirigido a Stripe para completar el pago...",
        });
        
        setTimeout(() => {
          window.location.href = data.paymentUrl!;
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "No se pudo generar el enlace de pago",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Activation error:", error);
      toast({
        title: "Error al activar suscripción",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

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
            onClick={handleActivateSubscription}
            disabled={isActivating}
            data-testid="button-activate-subscription"
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {isActivating ? 'Procesando...' : 'Activar suscripción'}
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
            onClick={handleActivateSubscription}
            disabled={isActivating}
            data-testid="button-pay-now"
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {isActivating ? 'Procesando...' : 'Pagar ahora'}
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
            onClick={handleActivateSubscription}
            disabled={isActivating}
            data-testid="button-reactivate"
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {isActivating ? 'Procesando...' : 'Reactivar cuenta'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
