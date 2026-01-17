import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from "@/hooks/use-company-context";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  pricingUnit: string;
  maxWorkers: number | null;
  maxUsers: number | null;
  maxCompanies: number | null;
  features: string[];
  isActive: boolean;
};

// Determina el plan correspondiente según el número de trabajadores
function getPlanIdForWorkers(numberOfWorkers: number): string {
  if (numberOfWorkers <= 10) return "microempresa";
  if (numberOfWorkers <= 49) return "pequena";
  if (numberOfWorkers <= 199) return "mediana";
  return "grande";
}

export default function PlanesSuscripcion() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedCompany } = useCompanyContext();

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/billing/plans'],
  });

  // Filtrar para mostrar solo el plan que corresponde al tamaño de la empresa
  const filteredPlans = plans?.filter(plan => {
    if (!selectedCompany?.numberOfWorkers) return true; // Si no hay empresa, mostrar todos
    const matchingPlanId = getPlanIdForWorkers(selectedCompany.numberOfWorkers);
    return plan.id === matchingPlanId;
  });

  const { data: currentSubscription } = useQuery<{ planId: string; status: string } | null>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
  });

  const trialMutation = useMutation({
    mutationFn: async ({ planId, trialDays }: { planId: string; trialDays: number }) => {
      return await apiRequest('POST', '/api/billing/trial', { planId, trialDays });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      toast({
        title: "¡Prueba gratuita activada!",
        description: data.message || "Tu período de prueba ha comenzado",
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

  const handleSelectPlan = (planId: string) => {
    // Pasar el número de trabajadores de la empresa para calcular el precio correcto
    // y guardar workersPurchased en la suscripción
    const workerCount = selectedCompany?.numberOfWorkers || 2; // Mínimo 2 para Microempresa
    navigate(`/checkout?planId=${planId}&workersPurchased=${workerCount}`);
  };

  const handleStartTrial = (planId: string, trialDays: number) => {
    trialMutation.mutate({ planId, trialDays });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    const features: string[] = [];
    
    if (plan.maxWorkers === null) {
      features.push("Trabajadores ilimitados");
    } else {
      features.push(`Hasta ${plan.maxWorkers} trabajadores`);
    }
    
    if (plan.maxUsers === null) {
      features.push("Usuarios ilimitados");
    } else {
      features.push(`Hasta ${plan.maxUsers} usuarios`);
    }
    
    if (plan.maxCompanies === null) {
      features.push("Empresas ilimitadas");
    } else if (plan.maxCompanies > 1) {
      features.push(`Hasta ${plan.maxCompanies} empresas`);
    }

    // Features adicionales por plan
    if (plan.name === 'Pro' || plan.name === 'Enterprise') {
      features.push("Reportes avanzados PDF");
      features.push("Auditorías internas ilimitadas");
      features.push("Soporte prioritario");
    }

    if (plan.name === 'Enterprise') {
      features.push("API de integración");
      features.push("Gestor de cuenta dedicado");
      features.push("Capacitación personalizada");
      features.push("SLA garantizado 99.9%");
    }

    return features;
  };

  const isCurrentPlan = (planId: string) => {
    // Include both 'active' and 'trial' status as current plans
    return currentSubscription?.planId === planId && 
           (currentSubscription?.status === 'active' || currentSubscription?.status === 'trial');
  };

  const hasActiveSubscriptionOrTrial = () => {
    // Architect feedback: Hide trial buttons if ANY subscription exists (any status)
    return !!currentSubscription;
  };

  // Helper to get subscription status label
  const getSubscriptionStatusLabel = () => {
    if (!currentSubscription) return null;
    const status = currentSubscription.status;
    if (status === 'trial') return 'Período de Prueba';
    if (status === 'active') return 'Activa';
    if (status === 'past_due') return 'Pago Pendiente';
    if (status === 'cancelled') return 'Cancelada';
    return status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-plans" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Current Subscription Status Banner */}
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
                    Tu suscripción actual
                  </p>
                  <h3 className="text-xl font-semibold" data-testid="text-current-plan-name">
                    {(currentSubscription as any).plan?.name || 'Plan Activo'}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge 
                  variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}
                  className="px-3 py-1"
                  data-testid="badge-subscription-status"
                >
                  {getSubscriptionStatusLabel()}
                </Badge>
                {currentSubscription.status === 'trial' && (currentSubscription as any).trialEnd && (
                  <span className="text-sm text-muted-foreground" data-testid="text-trial-ends">
                    Vence: {new Date((currentSubscription as any).trialEnd).toLocaleDateString('es-CO')}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
          Planes de Suscripción
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="text-subtitle">
          {currentSubscription 
            ? 'Puedes cambiar tu plan en cualquier momento. Los cambios se prorratean automáticamente.'
            : selectedCompany?.numberOfWorkers 
              ? `Plan recomendado según el tamaño de tu empresa (${selectedCompany.numberOfWorkers} trabajadores).`
              : 'Selecciona el plan que mejor se adapte a las necesidades de tu empresa.'}
        </p>
      </div>

      <div className={`grid gap-6 mb-8 ${filteredPlans?.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        {filteredPlans?.map((plan) => {
          const features = getPlanFeatures(plan);
          const isCurrent = isCurrentPlan(plan.id);
          const isPopular = plan.name === 'Pro';

          return (
            <Card
              key={plan.id}
              className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground" data-testid="badge-popular">
                    <Zap className="h-3 w-3 mr-1" />
                    Más Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl" data-testid={`text-plan-name-${plan.id}`}>
                  {plan.name}
                </CardTitle>
                <CardDescription data-testid={`text-plan-description-${plan.id}`}>
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold" data-testid={`text-plan-price-${plan.id}`}>
                    {formatPrice(plan.priceMonthly)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    por {plan.pricingUnit}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3"
                      data-testid={`text-feature-${plan.id}-${index}`}
                    >
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex-col gap-2">
                {isCurrent ? (
                  <div className="w-full space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                      data-testid={`button-current-plan-${plan.id}`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {currentSubscription?.status === 'trial' ? 'Tu Plan (Prueba)' : 'Plan Actual'}
                    </Button>
                    {currentSubscription?.status === 'trial' && (
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => handleSelectPlan(plan.id)}
                        data-testid={`button-upgrade-trial-${plan.id}`}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Activar Plan Completo
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {!hasActiveSubscriptionOrTrial() && (
                      <div className="w-full space-y-2">
                        <Button
                          className="w-full"
                          variant="secondary"
                          onClick={() => handleStartTrial(plan.id, 7)}
                          disabled={trialMutation.isPending}
                          data-testid={`button-trial-14-${plan.id}`}
                        >
                          {trialMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Gift className="h-4 w-4 mr-2" />
                          )}
                          Prueba Gratis 7 días
                        </Button>
                        <div className="text-center text-xs text-muted-foreground pt-1">
                          o
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                      data-testid={`button-select-plan-${plan.id}`}
                    >
                      {currentSubscription ? 'Cambiar a este plan' : 'Suscribirse Ahora'}
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>¿Necesitas un plan personalizado? Contáctanos para una solución empresarial a medida.</p>
      </div>
    </div>
  );
}
