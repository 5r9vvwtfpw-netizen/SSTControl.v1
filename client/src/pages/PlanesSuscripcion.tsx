import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, Zap, Gift, Shield, Users, FileCheck, Car, AlertCircle, Building2, Hash } from "lucide-react";
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

  const { data: company, isLoading: loadingCompany } = useQuery<CompanyData>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId,
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
    enabled: !!company,
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
    if (!company || !pricing) return;
    const params = new URLSearchParams({
      companyId: company.id,
      workers: (company.numberOfWorkers || 1).toString(),
      risk: (company.riskLevel || 'I'),
      vehicles: (company.numberOfVehicles || 0).toString(),
      total: pricing.totales.costoMensualTotal.toString(),
    });
    navigate(`/checkout?${params.toString()}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
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

  if (loadingCompany || loadingPricing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" data-testid="loader-plans" />
          <p className="text-muted-foreground">Calculando precio personalizado para tu empresa...</p>
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
          Tu Plan Personalizado
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-subtitle">
          Precio calculado automaticamente segun tu codigo CIIU, nivel de riesgo ARL y datos de tu empresa
        </p>
      </div>

      {pricing && (
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
              {company.ciiuCode && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                  Tu codigo CIIU <strong>{company.ciiuCode}</strong> determina automaticamente tu clase de riesgo ARL (<strong>Clase {company.riskLevel || 'I'}</strong>) segun Decreto 1607/2002, lo que define la tarifa por trabajador y los estandares aplicables de la Resolucion 0312/2019.
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Hash className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold" data-testid="text-ciiu-code">{company.ciiuCode || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Codigo CIIU</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold" data-testid="text-workers-count">{company.numberOfWorkers || 1}</p>
                  <p className="text-xs text-muted-foreground">Trabajadores</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <FileCheck className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold" data-testid="text-standards-count">{pricing.desgloseSst.estandaresAplicables}</p>
                  <p className="text-xs text-muted-foreground">Estandares Res. 0312</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Car className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold" data-testid="text-vehicles-count">{company.numberOfVehicles || 0}</p>
                  <p className="text-xs text-muted-foreground">Vehiculos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pricing-breakdown">
            <CardHeader>
              <CardTitle>Desglose de Inversion Mensual</CardTitle>
              <CardDescription>
                {pricing.formula}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  SST - Seguridad y Salud en el Trabajo
                </h4>

                <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-muted rounded-lg text-sm" data-testid="row-workers-cost">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Trabajadores ({pricing.empresa.trabajadores})</span>
                  </div>
                  <span className="font-medium">
                    {pricing.empresa.trabajadores} x {formatCurrency(pricing.desgloseSst.tarifaPorTrabajador)} = {formatCurrency(pricing.desgloseSst.costoTrabajadores)}
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-muted rounded-lg text-sm" data-testid="row-standards-cost">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Estandares Res. 0312 ({pricing.desgloseSst.estandaresAplicables})</span>
                  </div>
                  <span className="font-medium">
                    {pricing.desgloseSst.estandaresAplicables} x {formatCurrency(pricing.desgloseSst.tarifaPorEstandar)} = {formatCurrency(pricing.desgloseSst.costoEstandares)}
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                  <span className="font-medium">Subtotal SST</span>
                  <span className="font-bold text-blue-600" data-testid="text-sst-subtotal">
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
                      PESV - Plan Estrategico de Seguridad Vial (Res. 40595/2022)
                    </h4>

                    <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-200 dark:border-violet-800 text-xs text-violet-700 dark:text-violet-300">
                      Tu empresa tiene <strong>{pricing.empresa.vehiculos} vehiculos</strong>, lo que determina el nivel PESV <strong>{pricing.desglosePesv.descripcion}</strong> con <strong>{pricing.desglosePesv.pasosAplicables} pasos</strong> de cumplimiento obligatorio.
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-muted rounded-lg text-sm" data-testid="row-pesv-level">
                      <span>Nivel PESV</span>
                      <Badge variant="outline" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        {pricing.desglosePesv.descripcion}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-muted rounded-lg text-sm" data-testid="row-pesv-cost">
                      <span>Pasos aplicables ({pricing.desglosePesv.pasosAplicables})</span>
                      <span className="font-medium">
                        {pricing.desglosePesv.pasosAplicables} x {formatCurrency(pricing.desglosePesv.tarifaPorPaso)} = {formatCurrency(pricing.desglosePesv.costoPesv)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-sm border border-violet-200 dark:border-violet-800">
                      <span className="font-medium">Subtotal PESV</span>
                      <span className="font-bold text-violet-600" data-testid="text-pesv-subtotal">
                        {formatCurrency(pricing.desglosePesv.costoPesv)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {!pricing.desglosePesv && (company.numberOfVehicles || 0) === 0 && (
                <>
                  <Separator />
                  <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                    <Car className="h-4 w-4 inline mr-2" />
                    Tu empresa no tiene vehiculos registrados. Si adquieres vehiculos, se activara el modulo PESV con costo adicional segun Resolucion 40595/2022.
                  </div>
                </>
              )}

              <Separator />

              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tu inversion mensual total</p>
                <p className="text-4xl font-bold text-primary" data-testid="text-monthly-total">
                  {formatCurrency(pricing.totales.costoMensualTotal)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(pricing.totales.costoAnualTotal)} / ano
                </p>
                {pricing.desglosePesv && (
                  <p className="text-xs text-muted-foreground mt-2">
                    SST: {formatCurrency(pricing.desgloseSst.subtotalSst)} + PESV: {formatCurrency(pricing.desglosePesv.costoPesv)}
                  </p>
                )}
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4" />
                  Incluido sin costo adicional:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-green-600 dark:text-green-400">
                  {pricing.incluido.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              {currentSubscription?.status === 'active' ? (
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
                    Activar Plan Completo - {formatCurrency(pricing.totales.costoMensualTotal)}/mes
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
                    Suscribirse - {formatCurrency(pricing.totales.costoMensualTotal)}/mes
                  </Button>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground mt-2">
                Facturacion mensual en COP. Cancela cuando quieras sin penalidad.
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

