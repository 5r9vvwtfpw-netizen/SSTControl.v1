import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, CheckCircle, CreditCard, Shield, ArrowLeft, Scale, Users, Car, Hash, Building2, Landmark } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ContratoServiciosSaas, ContractAcceptanceData } from '@/components/ContratoServiciosSaas';
import { ColombianFlag } from '@/components/ColombianFlag';
import { useAuth } from '@/hooks/use-auth';

type RiskLevel = "I" | "II" | "III" | "IV" | "V";

interface CompanyData {
  id: string;
  name: string;
  numberOfWorkers: number;
  riskLevel: RiskLevel;
  numberOfVehicles: number;
  ciiuCode: string | null;
  economicActivity: string | null;
  quoteBaseMonthlyPrice: number | null;
  quoteCurrentPeriodPrice: number | null;
  quoteDiscountDurationMonths: number | null;
  quoteCouponCode: string | null;
}

interface WompiEstado {
  configured: boolean;
  sandbox: boolean;
}

const riskLevelLabels: Record<RiskLevel, string> = {
  I: "Clase I - Minimo",
  II: "Clase II - Bajo",
  III: "Clase III - Medio",
  IV: "Clase IV - Alto",
  V: "Clase V - Maximo",
};

type PaymentMethod = 'stripe' | 'pse';

export default function Checkout() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');
  const { toast } = useToast();
  const { user } = useAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [contractAcceptanceData, setContractAcceptanceData] = useState<ContractAcceptanceData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');

  const { data: company, isLoading: loadingCompany } = useQuery<CompanyData>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId && !success && !canceled,
  });

  const { data: currentSubscription } = useQuery<{ planId: string; status: string } | null>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
  });

  const { data: wompiEstado } = useQuery<WompiEstado>({
    queryKey: ['/api/wompi/estado'],
    enabled: !!user?.companyId && !success && !canceled,
  });

  const isUpgradeFromFree = !currentSubscription || currentSubscription.status === 'trial' || currentSubscription.status === 'expired';
  const isPseAvailable = !!wompiEstado?.configured;

  const createCheckoutV2Mutation = useMutation({
    mutationFn: async (acceptanceData?: ContractAcceptanceData) => {
      if (!company) {
        throw new Error('No se pudo cargar la informacion de la empresa');
      }

      if (!company.quoteBaseMonthlyPrice || company.quoteBaseMonthlyPrice <= 0) {
        throw new Error('Tu empresa no tiene una cotizacion de precio. Visita sst-colombia.com.co para obtener una cotizacion.');
      }

      if (isUpgradeFromFree && !acceptanceData) {
        throw new Error('Debe aceptar el contrato de servicios para continuar');
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/checkout?canceled=true`;

      const res = await apiRequest('POST', '/api/pricing-v2/create-checkout-v2', {
        companyId: company.id,
        customerEmail: user?.email || user?.username || '',
        customerName: company.name,
        successUrl,
        cancelUrl,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.sessionUrl) {
        setIsRedirecting(true);
        window.location.href = data.sessionUrl;
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
    if (selectedMethod === 'pse') {
      navigate('/pago-pse');
      return;
    }

    // Flujo Stripe
    if (isUpgradeFromFree && !contractAccepted) {
      setShowContract(true);
    } else if (contractAcceptanceData) {
      createCheckoutV2Mutation.mutate(contractAcceptanceData);
    } else {
      createCheckoutV2Mutation.mutate(undefined);
    }
  };

  const handleContractAccept = (data: ContractAcceptanceData) => {
    setContractAccepted(true);
    setContractAcceptanceData(data);
    setShowContract(false);
    toast({
      title: 'Contrato aceptado',
      description: 'Has aceptado los terminos del contrato de servicios.',
    });
    createCheckoutV2Mutation.mutate(data);
  };

  const handleCancel = () => {
    navigate('/planes-suscripcion');
  };

  const formatCurrency = (value: number) => {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
              Pago Exitoso
            </CardTitle>
            <CardDescription data-testid="text-success-description">
              Tu suscripcion ha sido activada correctamente.
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
              El proceso de pago fue cancelado. No se realizo ningun cargo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Puedes intentar nuevamente cuando lo desees.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="outline" onClick={() => navigate('/planes-suscripcion')} data-testid="button-view-plans">
                Ver Planes
              </Button>
              <Button onClick={() => navigate('/checkout')} data-testid="button-retry">
                Intentar de Nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" data-testid="loader-checkout" />
          <p className="text-muted-foreground">Cargando informacion de tu empresa...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar la informacion de tu empresa. Por favor regresa a la pagina de planes.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/planes-suscripcion')} className="mt-4" data-testid="button-back-to-plans">
          Ver Planes
        </Button>
      </div>
    );
  }

  const quotePrice = company.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 ? company.quoteBaseMonthlyPrice : null;

  if (!quotePrice) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin cotizacion</AlertTitle>
          <AlertDescription>
            Tu empresa no tiene un precio cotizado. Visita <strong>sst-colombia.com.co</strong> para obtener una cotizacion personalizada antes de proceder al pago.
          </AlertDescription>
        </Alert>
        <div className="flex gap-4 mt-4 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/planes-suscripcion')} data-testid="button-back-to-plans">
            Volver
          </Button>
          <Button onClick={() => window.open('https://sst-colombia.com.co', '_blank')} data-testid="button-get-quote">
            Obtener Cotizacion
          </Button>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-redirecting" />
        <p className="text-muted-foreground">Redirigiendo a la pagina de pago seguro...</p>
      </div>
    );
  }

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
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <ColombianFlag width={32} height={22} />
          <h1 className="text-3xl font-bold" data-testid="text-checkout-title">
            Finalizar Suscripcion
          </h1>
        </div>
        <p className="text-muted-foreground" data-testid="text-checkout-subtitle">
          Revisa tu precio acordado y procede al pago seguro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card data-testid="card-plan-summary">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {company.name}
                </CardTitle>
                <Badge variant="secondary" data-testid="badge-risk-level">
                  {riskLevelLabels[(company.riskLevel || 'I') as RiskLevel]}
                </Badge>
              </div>
              {company.ciiuCode && (
                <CardDescription className="flex items-center gap-2" data-testid="text-ciiu">
                  <Hash className="h-3.5 w-3.5" />
                  CIIU {company.ciiuCode}
                  {company.economicActivity && ` - ${company.economicActivity}`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-muted rounded-lg">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{company.numberOfWorkers || 1}</p>
                  <p className="text-xs text-muted-foreground">Trabajadores</p>
                </div>
                <div className="text-center p-2 bg-muted rounded-lg">
                  <Shield className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{company.riskLevel || 'I'}</p>
                  <p className="text-xs text-muted-foreground">Clase Riesgo</p>
                </div>
                <div className="text-center p-2 bg-muted rounded-lg">
                  <Car className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{company.numberOfVehicles || 0}</p>
                  <p className="text-xs text-muted-foreground">Vehiculos</p>
                </div>
              </div>

              <Separator />

              <div className="pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-medium">Precio Acordado</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary" data-testid="text-total-price">
                      {formatCurrency(quotePrice)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      / mes
                    </div>
                  </div>
                </div>
                {company.quoteCurrentPeriodPrice !== null && company.quoteCurrentPeriodPrice !== undefined && company.quoteCurrentPeriodPrice < quotePrice && (
                  <div className="mt-2 p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Primer mes con descuento
                        {company.quoteCouponCode && ` (${company.quoteCouponCode})`}
                      </span>
                      <span className="text-green-700 dark:text-green-300 font-bold">
                        {formatCurrency(company.quoteCurrentPeriodPrice)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Total anual</span>
                  <span>{formatCurrency(quotePrice * 12)} / ano</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-green-600 shrink-0" />
                  <span>Portal del Trabajador INCLUIDO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-green-600 shrink-0" />
                  <span>Portal del Profesional SST INCLUIDO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-green-600 shrink-0" />
                  <span>Soporte tecnico ilimitado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-green-600 shrink-0" />
                  <span>Cumplimiento Resolucion 0312/2019</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Selector de método de pago */}
          <Card data-testid="card-payment-method">
            <CardHeader>
              <CardTitle className="text-base">Método de pago</CardTitle>
              <CardDescription>
                Seleccione cómo desea pagar su suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Opción: Tarjeta (Stripe) */}
              <button
                type="button"
                onClick={() => setSelectedMethod('stripe')}
                data-testid="button-select-stripe"
                className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                  selectedMethod === 'stripe'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover-elevate'
                }`}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                  selectedMethod === 'stripe'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">Tarjeta de crédito / débito</span>
                    <Badge variant="outline" className="text-xs">7 días gratis</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visa, Mastercard, Amex — procesado por Stripe
                  </p>
                </div>
              </button>

              {/* Opción: PSE */}
              {isPseAvailable && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('pse')}
                  data-testid="button-select-pse"
                  className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                    selectedMethod === 'pse'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover-elevate'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                    selectedMethod === 'pse'
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Landmark className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">PSE — Transferencia bancaria</span>
                    </div>
                  </div>
                </button>
              )}
            </CardContent>
          </Card>

          {isUpgradeFromFree && selectedMethod === 'stripe' && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-contract-notice">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Contrato de Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Al suscribirte, deberas aceptar nuestro contrato de prestacion
                  de servicios SaaS, cumpliendo normativa colombiana:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-600" />
                    Ley 1581 de 2012 (Proteccion de Datos)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-blue-600" />
                    Ley 527 de 1999 (Comercio Electronico)
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
            <CardContent className="pt-6 space-y-4">
              {selectedMethod === 'stripe' ? (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Conexion encriptada SSL/TLS</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Proteccion contra fraude</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Cumplimiento PCI DSS</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>7 dias de prueba gratis incluidos</span>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Se cobrara mensualmente</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-checkout-total">
                      {formatCurrency(quotePrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Primer cobro despues de 7 dias de prueba
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Landmark className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Pago PSE — Transferencia Bancaria</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Procesado por Red ACH Colombia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Débito directo de su cuenta bancaria</span>
                  </div>
                  <div className="bg-primary/5 rounded-md p-3 text-center mt-3">
                    <p className="text-sm text-muted-foreground">Primer pago</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(quotePrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">Sin período de prueba</p>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={createCheckoutV2Mutation.isPending}
                data-testid="button-checkout"
              >
                {createCheckoutV2Mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : selectedMethod === 'pse' ? (
                  <>
                    <Landmark className="h-4 w-4 mr-2" />
                    Continuar con PSE
                  </>
                ) : isUpgradeFromFree && !contractAccepted ? (
                  <>
                    <Scale className="h-4 w-4 mr-2" />
                    Revisar Contrato y Pagar
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceder al Pago - {formatCurrency(quotePrice)}/mes
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {selectedMethod === 'pse'
                  ? 'Será redirigido al portal seguro de su banco para autorizar el pago.'
                  : isUpgradeFromFree
                  ? 'Al continuar, deberas aceptar el contrato de servicios. Tu suscripcion se renovara automaticamente.'
                  : 'Al continuar, aceptas nuestros terminos de servicio. Tu suscripcion se renovara automaticamente.'
                }
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {selectedMethod === 'stripe' ? (
              <span>Procesado por Stripe</span>
            ) : (
              <span>Procesado por Wompi — Red PSE ACH Colombia</span>
            )}
          </div>
        </div>
      </div>

      <ContratoServiciosSaas
        open={showContract}
        onOpenChange={setShowContract}
        onAccept={handleContractAccept}
        planName={`SST Colombia - ${company.name}`}
        companyName={company.name}
        isLoading={createCheckoutV2Mutation.isPending}
      />
    </div>
  );
}
