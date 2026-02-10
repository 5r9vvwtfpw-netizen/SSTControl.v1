import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, Gift, Shield, Users, Car, AlertCircle, Building2, Hash } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const riskLevelLabels: Record<RiskLevel, { label: string; badgeClass: string }> = {
  I: { label: "Clase I - Minimo", badgeClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  II: { label: "Clase II - Bajo", badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  III: { label: "Clase III - Medio", badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  IV: { label: "Clase IV - Alto", badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  V: { label: "Clase V - Maximo", badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function PlanesSuscripcion() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('[PlanesSuscripcion] Rendering, user:', user?.username, 'companyId:', user?.companyId);

  const { data: company, isLoading: loadingCompany, error: companyError } = useQuery<CompanyData>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId,
  });

  const { data: currentSubscription, error: subError } = useQuery<{ planId: string; status: string } | null>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
  });

  console.log('[PlanesSuscripcion] Data state:', {
    loadingCompany, companyError: companyError?.message,
    subError: subError?.message,
    hasCompany: !!company,
    hasSubscription: !!currentSubscription
  });

  const trialMutation = useMutation({
    mutationFn: async ({ trialDays }: { trialDays: number }) => {
      return await apiRequest('POST', '/api/billing/trial', { trialDays });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      toast({
        title: "Prueba gratuita activada",
        description: data.message || "Tu periodo de prueba ha comenzado",
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al activar prueba",
        description: error.message || "No se pudo activar la prueba gratuita",
      });
    }
  });

  const handleStartTrial = () => {
    trialMutation.mutate({ trialDays: 7 });
  };

  const handleCheckout = () => {
    if (!company) return;
    navigate('/checkout');
  };

  const formatCurrency = (value: number) => {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const hasActiveSubscriptionOrTrial = () => {
    return !!currentSubscription;
  };

  const getSubscriptionStatusLabel = () => {
    if (!currentSubscription) return null;
    const status = currentSubscription.status;
    if (status === 'trial') return 'Periodo de Prueba';
    if (status === 'active') return 'Activa';
    if (status === 'past_due') return 'Pago Pendiente';
    if (status === 'cancelled') return 'Cancelada';
    return status;
  };

  if (loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" data-testid="loader-plans" />
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
            No se pudo cargar la informacion de tu empresa. Por favor contacta a soporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const quotePrice = company.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 ? company.quoteBaseMonthlyPrice : null;
  const riskInfo = riskLevelLabels[(company.riskLevel || 'I') as RiskLevel];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {currentSubscription && (
        <Card className="mb-8 border-primary/30 bg-primary/5" data-testid="card-current-subscription">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground" data-testid="text-subscription-label">
                    Tu suscripcion actual
                  </p>
                  <h3 className="text-xl font-semibold" data-testid="text-current-plan-name">
                    SST Colombia - {company.name}
                  </h3>
                </div>
              </div>
              <Badge
                variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}
                className="px-3 py-1"
                data-testid="badge-subscription-status"
              >
                {getSubscriptionStatusLabel()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-title">
          Tu Plan SST Colombia
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-subtitle">
          Precio acordado desde tu cotizacion en sst-colombia.com.co
        </p>
      </div>

      <div className="space-y-6">
        <Card data-testid="card-company-info">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Datos de tu Empresa
              </CardTitle>
              <Badge className={riskInfo.badgeClass} data-testid="badge-risk-level">
                {riskInfo.label}
              </Badge>
            </div>
            {company.ciiuCode && (
              <CardDescription className="flex items-center gap-2 mt-1" data-testid="text-ciiu-info">
                <Hash className="h-3.5 w-3.5" />
                CIIU {company.ciiuCode}
                {company.economicActivity && ` - ${company.economicActivity}`}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold" data-testid="text-workers-count">{company.numberOfWorkers || 1}</p>
                <p className="text-xs text-muted-foreground">Trabajadores</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Shield className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold" data-testid="text-risk-class">{company.riskLevel || 'I'}</p>
                <p className="text-xs text-muted-foreground">Clase de Riesgo</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Car className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold" data-testid="text-vehicles-count">{company.numberOfVehicles || 0}</p>
                <p className="text-xs text-muted-foreground">Vehiculos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pricing">
          <CardHeader>
            <CardTitle>Tu Precio Acordado</CardTitle>
            <CardDescription>
              Precio definido en tu cotizacion desde sst-colombia.com.co
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotePrice ? (
              <>
                <div className="text-center p-6 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tu inversion mensual</p>
                  <p className="text-4xl font-bold text-primary" data-testid="text-monthly-total">
                    {formatCurrency(quotePrice)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(quotePrice * 12)} / ano
                  </p>
                </div>

                {company.quoteCurrentPeriodPrice !== null && company.quoteCurrentPeriodPrice !== undefined && company.quoteCurrentPeriodPrice < quotePrice && (
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
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

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4" />
                    Incluido sin costo adicional:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-green-600 dark:text-green-400">
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>Portal del Trabajador INCLUIDO</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>Portal del Licenciado SST INCLUIDO</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>Soporte tecnico ilimitado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>Cumplimiento Resolucion 0312/2019 (SST)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>Cumplimiento ISO 45001:2018 (SST)</span>
                    </li>
                    {(company.numberOfVehicles || 0) > 0 && (
                      <>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 shrink-0" />
                          <span>Cumplimiento Resolucion 40595/2022 (PESV)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 shrink-0" />
                          <span>Cumplimiento ISO 39001:2012 (PESV)</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin cotizacion</AlertTitle>
                <AlertDescription>
                  Tu empresa no tiene un precio cotizado. Visita <strong>sst-colombia.com.co</strong> para obtener una cotizacion personalizada.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-3">
            {!quotePrice ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open('https://sst-colombia.com.co', '_blank')}
                data-testid="button-get-quote"
              >
                <Zap className="h-4 w-4 mr-2" />
                Obtener Cotizacion
              </Button>
            ) : currentSubscription?.status === 'active' ? (
              <Button
                className="w-full"
                variant="outline"
                disabled
                data-testid="button-current-plan"
              >
                <Check className="h-4 w-4 mr-2" />
                Suscripcion Activa
              </Button>
            ) : currentSubscription?.status === 'trial' ? (
              <div className="w-full space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                  data-testid="button-trial-active"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Periodo de Prueba Activo
                </Button>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  data-testid="button-upgrade"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Activar Plan Completo - {formatCurrency(quotePrice)}/mes
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-2">
                {!hasActiveSubscriptionOrTrial() && (
                  <>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={handleStartTrial}
                      disabled={trialMutation.isPending}
                      data-testid="button-trial"
                    >
                      {trialMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Gift className="h-4 w-4 mr-2" />
                      )}
                      Prueba Gratis 7 dias
                    </Button>
                    <div className="text-center text-xs text-muted-foreground">o</div>
                  </>
                )}
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  data-testid="button-subscribe"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Suscribirse - {formatCurrency(quotePrice)}/mes
                </Button>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground mt-2">
              Facturacion mensual. Cancela cuando quieras sin penalidad.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
