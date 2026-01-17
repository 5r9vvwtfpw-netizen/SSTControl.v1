import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, CheckCircle, CreditCard, Shield, ArrowLeft, Scale } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ContratoServiciosSaas, ContractAcceptanceData } from '@/components/ContratoServiciosSaas';
import { ColombianFlag } from '@/components/ColombianFlag';
import { useAuth } from '@/hooks/use-auth';

type SubscriptionPlan = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxWorkers: number | null;
  maxUsers: number | null;
  maxCompanies: number | null;
  features: string[];
  stripeProductId: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const planId = searchParams.get('planId');
  const interval = searchParams.get('interval') || 'monthly';
  const workersPurchasedParam = searchParams.get('workersPurchased');
  const workersPurchased = workersPurchasedParam ? parseInt(workersPurchasedParam, 10) : undefined;
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');
  const { toast } = useToast();
  const { user } = useAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [contractAcceptanceData, setContractAcceptanceData] = useState<ContractAcceptanceData | null>(null);

  const { data: plans, isLoading: loadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/stripe/plans-mapping'],
    enabled: !!planId,
  });

  const { data: currentSubscription } = useQuery<{ planId: string; status: string } | null>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
  });

  const plan = plans?.find(p => p.id === planId);

  const isUpgradeFromFree = !currentSubscription || currentSubscription.status === 'trial' || currentSubscription.status === 'expired';

  const createCheckoutMutation = useMutation({
    mutationFn: async (acceptanceData?: ContractAcceptanceData) => {
      const priceId = interval === 'yearly' ? plan?.stripePriceIdYearly : plan?.stripePriceIdMonthly;
      
      if (!priceId) {
        throw new Error('No se encontró el precio para este plan');
      }

      if (isUpgradeFromFree && !acceptanceData) {
        throw new Error('Debe aceptar el contrato de servicios para continuar');
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}&planId=${planId}`;
      const cancelUrl = `${baseUrl}/checkout?canceled=true&planId=${planId}&interval=${interval}`;

      const res = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        priceId,
        successUrl,
        cancelUrl,
        workersPurchased: workersPurchased || 2, // Mínimo 2 trabajadores para Microempresa
        contractAccepted: acceptanceData ? true : false,
        contractAcceptedAt: acceptanceData?.acceptedAt || null,
        contractData: acceptanceData ? {
          acceptedTerms: acceptanceData.acceptedTerms,
          acceptedDataTreatment: acceptanceData.acceptedDataTreatment,
          acceptedAutoRenewal: acceptanceData.acceptedAutoRenewal,
          planName: acceptanceData.planName,
        } : null,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        setIsRedirecting(true);
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al iniciar el pago',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (success === 'true' && sessionId) {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription'] });
    }
  }, [success, sessionId]);

  const handleCheckout = () => {
    if (isUpgradeFromFree && !contractAccepted) {
      setShowContract(true);
    } else if (contractAcceptanceData) {
      createCheckoutMutation.mutate(contractAcceptanceData);
    } else {
      createCheckoutMutation.mutate(undefined);
    }
  };

  const handleContractAccept = (data: ContractAcceptanceData) => {
    setContractAccepted(true);
    setContractAcceptanceData(data);
    setShowContract(false);
    toast({
      title: 'Contrato aceptado',
      description: 'Has aceptado los términos del contrato de servicios. Verificación de aceptación registrada.',
    });
    createCheckoutMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate('/planes-suscripcion');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  if (success === 'true') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="text-center" data-testid="card-success">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-success-title">
              ¡Pago Exitoso!
            </CardTitle>
            <CardDescription data-testid="text-success-description">
              Tu suscripción ha sido activada correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ya puedes acceder a todas las funcionalidades de tu plan.
            </p>
            <Button onClick={() => navigate('/')} data-testid="button-go-dashboard">
              Ir al Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (canceled === 'true') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="text-center" data-testid="card-canceled">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-canceled-title">
              Pago Cancelado
            </CardTitle>
            <CardDescription data-testid="text-canceled-description">
              El proceso de pago fue cancelado. No se realizó ningún cargo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Puedes intentar nuevamente cuando lo desees.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/planes-suscripcion')} data-testid="button-view-plans">
                Ver Planes
              </Button>
              <Button onClick={handleCheckout} data-testid="button-retry">
                Intentar de Nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!planId) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se ha seleccionado un plan. Por favor regresa a la página de planes.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/planes-suscripcion')} className="mt-4">
          Ver Planes
        </Button>
      </div>
    );
  }

  if (loadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-checkout" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar la información del plan seleccionado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-redirecting" />
        <p className="text-muted-foreground">Redirigiendo a la página de pago seguro...</p>
      </div>
    );
  }

  const currentPrice = interval === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const hasStripePrice = interval === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a planes
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ColombianFlag width={32} height={22} />
          <h1 className="text-3xl font-bold" data-testid="text-checkout-title">
            Finalizar Suscripción
          </h1>
        </div>
        <p className="text-muted-foreground" data-testid="text-checkout-subtitle">
          Revisa tu selección y procede al pago seguro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card data-testid="card-plan-summary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resumen del Plan</CardTitle>
                <Badge variant="secondary" data-testid="badge-plan-name">{plan.displayName}</Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trabajadores:</span>
                  <span className="font-medium" data-testid="text-max-workers">
                    {plan.maxWorkers === -1 || plan.maxWorkers === null ? 'Ilimitados' : `Hasta ${plan.maxWorkers}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usuarios:</span>
                  <span className="font-medium" data-testid="text-max-users">
                    {plan.maxUsers === -1 || plan.maxUsers === null ? 'Ilimitados' : `Hasta ${plan.maxUsers}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Período:</span>
                  <span className="font-medium" data-testid="text-interval">
                    {interval === 'yearly' ? 'Anual' : 'Mensual'}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-muted-foreground mb-3">Incluye:</div>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {plan.features?.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features && plan.features.length > 5 && (
                    <li className="text-sm text-muted-foreground">
                      + {plan.features.length - 5} más...
                    </li>
                  )}
                </ul>
              </div>

              <Separator />

              <div className="pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-medium">Total</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold" data-testid="text-total-price">
                      {formatPrice(currentPrice)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      por {interval === 'yearly' ? 'año' : 'mes'}
                    </div>
                  </div>
                </div>
              </div>

              {interval === 'yearly' && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <AlertDescription className="text-xs text-green-700 dark:text-green-300">
                    ¡Ahorra 2 meses con el plan anual!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contract Notice for upgrades */}
          {isUpgradeFromFree && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-contract-notice">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Contrato de Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Al suscribirte a un plan de pago, deberás aceptar nuestro contrato de prestación 
                  de servicios SaaS, el cual cumple con la normativa colombiana incluyendo:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-600" />
                    Ley 1581 de 2012 (Protección de Datos)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-600" />
                    Ley 527 de 1999 (Comercio Electrónico)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-600" />
                    Decreto 1074 de 2015 (Sector Comercio)
                  </li>
                </ul>
                {contractAccepted && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Contrato Aceptado
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          <Card data-testid="card-payment">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pago Seguro
              </CardTitle>
              <CardDescription>
                Serás redirigido a Stripe para completar tu pago de forma segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Conexión encriptada SSL/TLS</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Protección contra fraude</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Cumplimiento PCI DSS</span>
                </div>
              </div>

              {!hasStripePrice ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error de Configuración</AlertTitle>
                  <AlertDescription>
                    Este plan no está disponible para compra en este momento. Por favor contacta a soporte.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={createCheckoutMutation.isPending}
                  data-testid="button-checkout"
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : isUpgradeFromFree && !contractAccepted ? (
                    <>
                      <Scale className="h-4 w-4 mr-2" />
                      Revisar Contrato y Pagar
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceder al Pago
                    </>
                  )}
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                {isUpgradeFromFree 
                  ? 'Al continuar, deberás aceptar el contrato de servicios. Tu suscripción se renovará automáticamente.'
                  : 'Al continuar, aceptas nuestros términos de servicio y política de privacidad. Tu suscripción se renovará automáticamente.'
                }
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <img 
              src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/svg/color/visa.svg" 
              alt="Visa" 
              className="h-6"
            />
            <img 
              src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/svg/color/mastercard.svg" 
              alt="Mastercard" 
              className="h-6"
            />
            <span>Procesado por Stripe</span>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      <ContratoServiciosSaas
        open={showContract}
        onOpenChange={setShowContract}
        onAccept={handleContractAccept}
        planName={plan.displayName}
        companyName={undefined}
        isLoading={createCheckoutMutation.isPending}
      />
    </div>
  );
}
