import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle, CheckCircle, CreditCard, Shield, ArrowLeft, Scale, Users, FileCheck, Car, Hash, Building2 } from 'lucide-react';
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

interface DynamicPricing {
  empresa: {
    trabajadores: number;
    claseRiesgo: RiskLevel;
    descripcionRiesgo: string;
    vehiculos: number;
  };
  desgloseSst: {
    tarifaPorTrabajador: number;
    costoTrabajadores: number;
    estandaresAplicables: number;
    tarifaPorEstandar: number;
    costoEstandares: number;
    subtotalSst: number;
  };
  desglosePesv: {
    nivelPesv: string;
    descripcion: string;
    pasosAplicables: number;
    tarifaPorPaso: number;
    costoPesv: number;
  } | null;
  totales: {
    costoMensualTotal: number;
    costoAnualTotal: number;
    currency: string;
  };
  formula: string;
  mensaje: string;
  incluido: string[];
}

const riskLevelLabels: Record<RiskLevel, string> = {
  I: "Clase I - Minimo",
  II: "Clase II - Bajo",
  III: "Clase III - Medio",
  IV: "Clase IV - Alto",
  V: "Clase V - Maximo",
};

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

  const { data: company, isLoading: loadingCompany } = useQuery<CompanyData>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId && !success && !canceled,
  });

  const { data: currentSubscription } = useQuery<{ planId: string; status: string } | null>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
  });

  const { data: pricing, isLoading: loadingPricing } = useQuery<DynamicPricing>({
    queryKey: ['/api/pricing-v2/calculate-combined-v2', company?.id],
    queryFn: async () => {
      if (!company) throw new Error('No company data');
      const res = await apiRequest('POST', '/api/pricing-v2/calculate-combined-v2', {
        trabajadores: company.numberOfWorkers || 1,
        claseRiesgo: (company.riskLevel || 'I') as RiskLevel,
        vehiculos: company.numberOfVehicles || 0,
        usuariosAdicionales: 0,
      });
      return res.json();
    },
    enabled: !!company && !success && !canceled,
  });

  const isUpgradeFromFree = !currentSubscription || currentSubscription.status === 'trial' || currentSubscription.status === 'expired';

  const createCheckoutV2Mutation = useMutation({
    mutationFn: async (acceptanceData?: ContractAcceptanceData) => {
      if (!company || !pricing) {
        throw new Error('No se pudo cargar la informacion de la empresa');
      }

      if (isUpgradeFromFree && !acceptanceData) {
        throw new Error('Debe aceptar el contrato de servicios para continuar');
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/checkout?canceled=true`;

      const res = await apiRequest('POST', '/api/pricing-v2/create-checkout-v2', {
        companyId: company.id,
        trabajadores: company.numberOfWorkers || 1,
        claseRiesgo: (company.riskLevel || 'I') as RiskLevel,
        vehiculos: company.numberOfVehicles || 0,
        usuariosAdicionales: 0,
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
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
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

  if (loadingCompany || loadingPricing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" data-testid="loader-checkout" />
          <p className="text-muted-foreground">Calculando precio dinamico para tu empresa...</p>
        </div>
      </div>
    );
  }

  if (!company || !pricing) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar la informacion de tu empresa o calcular el precio. Por favor regresa a la pagina de planes.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/planes-suscripcion')} className="mt-4" data-testid="button-back-to-plans">
          Ver Planes
        </Button>
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
          Revisa el desglose de tu precio calculado por CIIU y procede al pago seguro
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
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  SST - Seguridad y Salud en el Trabajo
                </h4>

                <div className="flex justify-between text-sm" data-testid="row-checkout-workers">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Trabajadores ({pricing.empresa.trabajadores})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(pricing.desgloseSst.costoTrabajadores)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground pl-5">
                  {pricing.empresa.trabajadores} x {formatCurrency(pricing.desgloseSst.tarifaPorTrabajador)}/mes (Clase {pricing.empresa.claseRiesgo})
                </div>

                <div className="flex justify-between text-sm" data-testid="row-checkout-standards">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" />
                    Estandares Res. 0312 ({pricing.desgloseSst.estandaresAplicables})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(pricing.desgloseSst.costoEstandares)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground pl-5">
                  {pricing.desgloseSst.estandaresAplicables} x {formatCurrency(pricing.desgloseSst.tarifaPorEstandar)}/mes
                </div>

                <div className="flex justify-between text-sm font-medium pt-1 border-t">
                  <span>Subtotal SST</span>
                  <span className="text-blue-600" data-testid="text-checkout-sst-subtotal">
                    {formatCurrency(pricing.desgloseSst.subtotalSst)}
                  </span>
                </div>
              </div>

              {pricing.desglosePesv && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Car className="h-4 w-4 text-violet-600" />
                      PESV - Seguridad Vial
                      <Badge variant="outline" className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        {pricing.desglosePesv.descripcion}
                      </Badge>
                    </h4>

                    <div className="flex justify-between text-sm" data-testid="row-checkout-pesv">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Car className="h-3.5 w-3.5" />
                        Pasos PESV ({pricing.desglosePesv.pasosAplicables})
                      </span>
                      <span className="font-medium">
                        {formatCurrency(pricing.desglosePesv.costoPesv)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-5">
                      {pricing.desglosePesv.pasosAplicables} pasos x {formatCurrency(pricing.desglosePesv.tarifaPorPaso)}/mes ({pricing.empresa.vehiculos} vehiculos)
                    </div>

                    <div className="flex justify-between text-sm font-medium pt-1 border-t">
                      <span>Subtotal PESV</span>
                      <span className="text-violet-600" data-testid="text-checkout-pesv-subtotal">
                        {formatCurrency(pricing.desglosePesv.costoPesv)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="pt-2">
                {company.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 ? (
                  <>
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-medium">Precio Acordado</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary" data-testid="text-total-price">
                          {formatCurrency(company.quoteBaseMonthlyPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          COP / mes
                        </div>
                      </div>
                    </div>
                    {company.quoteCurrentPeriodPrice !== null && company.quoteCurrentPeriodPrice !== undefined && company.quoteCurrentPeriodPrice < company.quoteBaseMonthlyPrice && (
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
                      <span>{formatCurrency(company.quoteBaseMonthlyPrice * 12)} / ano</span>
                    </div>
                    {pricing.totales.costoMensualTotal !== company.quoteBaseMonthlyPrice && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="line-through">{formatCurrency(pricing.totales.costoMensualTotal)}/mes</span>
                        <span className="ml-1">(precio de lista)</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-medium">Total Mensual</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary" data-testid="text-total-price">
                          {formatCurrency(pricing.totales.costoMensualTotal)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          COP / mes
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Total anual</span>
                      <span>{formatCurrency(pricing.totales.costoAnualTotal)} / ano</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                {pricing.incluido.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-green-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pago Seguro
              </CardTitle>
              <CardDescription>
                Seras redirigido a Stripe para completar tu pago de forma segura. Incluye 7 dias de prueba gratis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  {formatCurrency(company.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 ? company.quoteBaseMonthlyPrice : pricing.totales.costoMensualTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Primer cobro despues de 7 dias de prueba
                </p>
              </div>

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
                ) : isUpgradeFromFree && !contractAccepted ? (
                  <>
                    <Scale className="h-4 w-4 mr-2" />
                    Revisar Contrato y Pagar
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceder al Pago - {formatCurrency(company.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 ? company.quoteBaseMonthlyPrice : pricing.totales.costoMensualTotal)}/mes
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {isUpgradeFromFree
                  ? 'Al continuar, deberas aceptar el contrato de servicios. Tu suscripcion se renovara automaticamente.'
                  : 'Al continuar, aceptas nuestros terminos de servicio. Tu suscripcion se renovara automaticamente.'
                }
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Procesado por Stripe</span>
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
