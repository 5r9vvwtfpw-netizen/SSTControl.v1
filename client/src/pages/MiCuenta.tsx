import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, Building2, CreditCard, FileText, Download, Calendar, 
  AlertCircle, Loader2, Mail, Phone, MapPin, Shield, Users,
  TrendingUp, ArrowUpRight, ArrowDownRight, Check
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Subscription = {
  id: string;
  planId: string;
  status: string;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number | null;
  maxWorkers: number | null;
  maxSedes: number | null;
  sortOrder: number;
  hasAuditorias: number;
  hasPESV: number;
  hasRevisionDireccion: number;
  hasDashboardsEjecutivos: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
};

type MySubscriptionResponse = {
  subscription: Subscription;
  plan: SubscriptionPlan;
};

type CompanyData = {
  id: string;
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  email?: string;
  numWorkers: number;
  riskLevel: string;
  vehicleCount: number;
  driverCount: number;
};

type PlanChangeQuote = {
  changeType: string;
  requiresPayment: boolean;
  amountToCharge: number;
  creditFromOldPlan: number;
  chargeForNewPlan: number;
  currentPlan: {
    id: string;
    name: string;
    priceMonthly: number;
  };
  newPlan: {
    id: string;
    name: string;
    priceMonthly: number;
  };
  validationErrors: string[];
  validationWarnings: string[];
};

const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-primary" />
    <span>{children}</span>
  </div>
);

const getWorkerLimitText = (maxWorkers: number | null) => {
  if (maxWorkers === -1) return 'Trabajadores ilimitados';
  return `Hasta ${maxWorkers} trabajadores`;
};

const getSedesLimitText = (maxSedes: number | null) => {
  if (maxSedes === -1) return 'Sedes ilimitadas';
  if (maxSedes === 1) return '1 sede';
  return `Hasta ${maxSedes} sedes`;
};

export default function MiCuenta() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [quote, setQuote] = useState<PlanChangeQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const { data: companyData, isLoading: isLoadingCompany } = useQuery<CompanyData>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId,
  });

  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery<MySubscriptionResponse>({
    queryKey: ['/api/billing/my-subscription'],
    enabled: !!user?.companyId,
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/billing/my-invoices'],
    enabled: !!user?.companyId,
  });

  const { data: allPlans, isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/billing/plans'],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      superadmin: "Super Administrador",
      superusuario: "Super Usuario",
      admin: "Administrador",
      responsable_sst: "Responsable SST",
      coordinador_sst: "Coordinador SST",
      coordinador_rrhh: "Coordinador RRHH",
      coordinador_salud: "Coordinador de Salud",
      lso: "LSO",
      supervisor: "Supervisor",
      trabajador: "Trabajador",
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Activa", variant: "default" },
      trial: { label: "Prueba Gratuita", variant: "secondary" },
      past_due: { label: "Vencida", variant: "destructive" },
      suspended: { label: "Suspendida", variant: "destructive" },
      canceled: { label: "Cancelada", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  const getTrialDaysRemaining = (trialEndsAt: string | null): number | null => {
    if (!trialEndsAt) return null;
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getInvoiceStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      paid: { label: "Pagada", variant: "default" },
      pending: { label: "Pendiente", variant: "secondary" },
      overdue: { label: "Vencida", variant: "destructive" },
      canceled: { label: "Cancelada", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant} data-testid={`badge-invoice-status-${status}`}>{config.label}</Badge>;
  };

  const handleDownloadInvoice = (invoiceId: string, invoiceNumber: string) => {
    const link = document.createElement('a');
    link.href = `/api/billing/invoice/${invoiceId}/download`;
    link.download = `Factura-${invoiceNumber}.pdf`;
    link.click();
  };

  const fetchQuote = async (planId: string) => {
    if (!subscriptionData?.subscription.id) {
      toast({
        title: "Error",
        description: "No hay suscripción activa",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingQuote(true);
    try {
      const response = await fetch(
        `/api/billing/subscription/${subscriptionData.subscription.id}/change-plan/quote?newPlanId=${planId}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al obtener cotización");
      }

      const quoteData = await response.json();
      setQuote(quoteData);
    } catch (error: any) {
      toast({
        title: "Error al obtener cotización",
        description: error.message,
        variant: "destructive",
      });
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const changePlanMutation = useMutation({
    mutationFn: async (newPlanId: string) => {
      if (!subscriptionData?.subscription.id) {
        throw new Error("No hay suscripción activa");
      }
      
      return await apiRequest(
        "POST",
        `/api/billing/subscription/${subscriptionData.subscription.id}/change-plan`,
        { newPlanId }
      );
    },
    onSuccess: async (data: any) => {
      if (data.requiresPayment && data.paymentUrl) {
        toast({
          title: "Pago requerido",
          description: "Redirigiendo a pasarela de pago...",
        });
        
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1500);
      } else {
        toast({
          title: "¡Plan actualizado!",
          description: data.message || "Tu plan ha sido cambiado exitosamente.",
        });
        
        await queryClient.invalidateQueries({ queryKey: ['/api/billing/my-subscription'] });
        setChangePlanDialogOpen(false);
        setSelectedPlanId(null);
        setQuote(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al cambiar plan",
        description: error.message || "No se pudo cambiar el plan. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleCloseDialog = () => {
    setChangePlanDialogOpen(false);
    setSelectedPlanId(null);
    setQuote(null);
  };

  // Mutation para activar suscripción con pago inmediato
  const activateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!subscriptionData?.subscription.id) {
        throw new Error("No hay suscripción activa");
      }
      
      return await apiRequest(
        "POST",
        `/api/billing/subscription/${subscriptionData.subscription.id}/activate`,
        {}
      );
    },
    onSuccess: async (data: any) => {
      if (data.paymentUrl) {
        toast({
          title: "Redirigiendo al pago",
          description: `Monto a pagar: ${formatPrice(data.amount / 100)}`,
        });
        
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1500);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al activar suscripción",
        description: error.message || "No se pudo procesar el pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  if (!user?.companyId) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p>Usuario no asociado a una empresa</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Mi Cuenta</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="company" data-testid="tab-company">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="subscription" data-testid="tab-subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Suscripción
          </TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">
            <FileText className="h-4 w-4 mr-2" />
            Facturación
          </TabsTrigger>
        </TabsList>

        {/* EMPRESA TAB */}
        <TabsContent value="company" className="space-y-6">
          {isLoadingCompany ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-company" />
            </div>
          ) : companyData ? (
            <Card data-testid="card-company-info">
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>Datos de tu organización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Razón Social</label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-medium" data-testid="text-company-name">
                        {companyData.name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">NIT</label>
                    <span className="text-lg" data-testid="text-company-nit">
                      {companyData.nit}
                    </span>
                  </div>

                  {companyData.address && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-company-address">{companyData.address}</span>
                      </div>
                    </div>
                  )}

                  {companyData.phone && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-company-phone">{companyData.phone}</span>
                      </div>
                    </div>
                  )}

                  {companyData.email && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email Corporativo</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-company-email">{companyData.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nivel de Riesgo</label>
                    <Badge variant="outline" data-testid="badge-risk-level">
                      Nivel {companyData.riskLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Número de Trabajadores</label>
                    <span className="text-lg font-medium" data-testid="text-num-workers">
                      {companyData.numWorkers}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No se pudo cargar la información de la empresa</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SUSCRIPCIÓN TAB */}
        <TabsContent value="subscription" className="space-y-6">
          {isLoadingSubscription ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-subscription" />
            </div>
          ) : subscriptionData ? (
            <>
              {/* Trial Banner */}
              {subscriptionData.subscription.status === 'trial' && subscriptionData.subscription.trialEndsAt && (
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20" data-testid="card-trial-banner">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Período de Prueba Gratuita</h3>
                          <p className="text-muted-foreground">
                            {(() => {
                              const daysLeft = getTrialDaysRemaining(subscriptionData.subscription.trialEndsAt);
                              if (daysLeft === null) return 'Disfruta de todas las funcionalidades';
                              if (daysLeft === 0) return 'Tu prueba termina hoy';
                              if (daysLeft === 1) return 'Te queda 1 día de prueba';
                              return `Te quedan ${daysLeft} días de prueba`;
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={() => activateSubscriptionMutation.mutate()}
                          disabled={activateSubscriptionMutation.isPending}
                          data-testid="button-pay-now"
                        >
                          {activateSubscriptionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          Pagar Ahora
                        </Button>
                        <Button variant="outline" onClick={() => setChangePlanDialogOpen(true)} data-testid="button-upgrade-trial">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Cambiar Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card data-testid="card-current-subscription">
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-2xl" data-testid="text-plan-name">
                        {subscriptionData.plan.displayName || subscriptionData.plan.name}
                      </CardTitle>
                      <CardDescription>{subscriptionData.plan.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(subscriptionData.subscription.status)}
                      <Button 
                        onClick={() => activateSubscriptionMutation.mutate()}
                        disabled={activateSubscriptionMutation.isPending}
                        data-testid="button-pay-now-main"
                      >
                        {activateSubscriptionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Pagar Ahora
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setChangePlanDialogOpen(true)}
                        data-testid="button-change-plan"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Cambiar Plan
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {subscriptionData.subscription.status === 'trial' ? (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Durante la prueba</p>
                          <p className="text-2xl font-bold text-primary" data-testid="text-price">
                            GRATIS
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Después: {formatPrice(subscriptionData.plan.priceMonthly / 100)}/mes
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Precio mensual</p>
                          <p className="text-2xl font-bold" data-testid="text-price">
                            {formatPrice(subscriptionData.plan.priceMonthly / 100)}
                          </p>
                        </div>
                      </div>
                    )}

                    {subscriptionData.subscription.nextBillingDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Próxima facturación</p>
                          <p className="text-lg font-semibold" data-testid="text-next-billing">
                            {formatDate(subscriptionData.subscription.nextBillingDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {subscriptionData.subscription.trialEndsAt && subscriptionData.subscription.status === 'trial' && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Prueba termina el</p>
                          <p className="text-lg font-semibold" data-testid="text-trial-ends">
                            {formatDate(subscriptionData.subscription.trialEndsAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Plan Features */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Características del plan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FeatureItem>{getWorkerLimitText(subscriptionData.plan.maxWorkers)}</FeatureItem>
                      <FeatureItem>{getSedesLimitText(subscriptionData.plan.maxSedes)}</FeatureItem>
                      {subscriptionData.plan.hasAuditorias === 1 && (
                        <FeatureItem>Auditorías Internas SST</FeatureItem>
                      )}
                      {subscriptionData.plan.hasPESV === 1 && (
                        <FeatureItem>PESV completo</FeatureItem>
                      )}
                      {subscriptionData.plan.hasRevisionDireccion === 1 && (
                        <FeatureItem>Revisión por Dirección</FeatureItem>
                      )}
                      {subscriptionData.plan.hasDashboardsEjecutivos === 1 && (
                        <FeatureItem>Tableros Ejecutivos</FeatureItem>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <p>No tienes una suscripción activa</p>
                </div>
                <Button onClick={() => navigate('/planes-suscripcion')} data-testid="button-view-plans">
                  Ver planes disponibles
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FACTURACIÓN TAB */}
        <TabsContent value="billing" className="space-y-6">
          <Card data-testid="card-invoices">
            <CardHeader>
              <CardTitle>Historial de Facturas</CardTitle>
              <CardDescription>Tus facturas y comprobantes de pago</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-invoices" />
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium" data-testid={`text-invoice-number-${invoice.id}`}>
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Emitida: {formatDate(invoice.issueDate)}
                          </p>
                          {invoice.paidDate && (
                            <p className="text-sm text-muted-foreground">
                              Pagada: {formatDate(invoice.paidDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold" data-testid={`text-invoice-amount-${invoice.id}`}>
                            {formatPrice(invoice.total)}
                          </p>
                          {getInvoiceStatusBadge(invoice.status)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                          data-testid={`button-download-${invoice.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes facturas disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cambiar Plan de Suscripción
            </DialogTitle>
            <DialogDescription>
              Selecciona un nuevo plan. Los upgrades requieren pago inmediato, los downgrades se aplicarán al final de tu período actual.
            </DialogDescription>
          </DialogHeader>

          {isLoadingPlans ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {allPlans?.sort((a, b) => a.sortOrder - b.sortOrder).map((planOption) => {
                const isCurrentPlan = planOption.id === subscriptionData?.plan.id;
                const isSelected = selectedPlanId === planOption.id;
                const isUpgrade = planOption.sortOrder > (subscriptionData?.plan.sortOrder || 0);
                
                return (
                  <Card
                    key={planOption.id}
                    className={`cursor-pointer transition-all ${
                      isCurrentPlan 
                        ? 'border-primary bg-primary/5' 
                        : isSelected 
                          ? 'border-primary border-2' 
                          : 'hover-elevate'
                    }`}
                    onClick={() => !isCurrentPlan && setSelectedPlanId(planOption.id)}
                    data-testid={`card-plan-option-${planOption.name}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-lg">{planOption.displayName || planOption.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {planOption.tagline || planOption.description}
                          </CardDescription>
                        </div>
                        {isCurrentPlan && (
                          <Badge variant="default">Plan actual</Badge>
                        )}
                        {!isCurrentPlan && isUpgrade && (
                          <Badge variant="secondary">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Upgrade
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-2xl font-bold">
                            {formatPrice(planOption.priceMonthly / 100)}
                          </p>
                          <p className="text-sm text-muted-foreground">por mes</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <FeatureItem>{getWorkerLimitText(planOption.maxWorkers)}</FeatureItem>
                          <FeatureItem>{getSedesLimitText(planOption.maxSedes)}</FeatureItem>
                          {planOption.hasAuditorias === 1 && (
                            <FeatureItem>Auditorías Internas SST</FeatureItem>
                          )}
                          {planOption.hasPESV === 1 && (
                            <FeatureItem>PESV completo</FeatureItem>
                          )}
                          {planOption.hasRevisionDireccion === 1 && (
                            <FeatureItem>Revisión por Dirección</FeatureItem>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isCurrentPlan ? (
                        <Button variant="outline" disabled className="w-full">
                          Plan actual
                        </Button>
                      ) : (
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanId(planOption.id);
                            fetchQuote(planOption.id);
                          }}
                          disabled={isLoadingQuote}
                          data-testid={`button-select-plan-${planOption.name}`}
                        >
                          {isLoadingQuote && selectedPlanId === planOption.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Calculando...
                            </>
                          ) : isSelected ? (
                            'Seleccionado'
                          ) : (
                            'Seleccionar'
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Proration Breakdown */}
          {quote && selectedPlanId && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {quote.changeType === 'upgrade' ? (
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  {quote.changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'} de Plan
                </CardTitle>
                <CardDescription>
                  {quote.changeType === 'upgrade' 
                    ? 'El cargo será prorrateado basado en el tiempo restante de tu período actual.'
                    : 'El crédito se aplicará en tu próxima factura.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan actual ({quote.currentPlan.name})</span>
                  <span>{formatPrice(quote.currentPlan.priceMonthly / 100)}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nuevo plan ({quote.newPlan.name})</span>
                  <span>{formatPrice(quote.newPlan.priceMonthly / 100)}/mes</span>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  {quote.creditFromOldPlan > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Crédito del plan actual</span>
                      <span className="text-green-600 dark:text-green-400">
                        -{formatPrice(quote.creditFromOldPlan / 100)}
                      </span>
                    </div>
                  )}
                  {quote.chargeForNewPlan > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cargo prorrateado del nuevo plan</span>
                      <span>{formatPrice(quote.chargeForNewPlan / 100)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total {quote.requiresPayment ? 'a pagar ahora' : 'de crédito'}</span>
                    <span className={quote.requiresPayment ? 'text-primary' : 'text-green-600 dark:text-green-400'}>
                      {quote.requiresPayment ? '' : '-'}{formatPrice(Math.abs(quote.amountToCharge) / 100)}
                    </span>
                  </div>
                </div>

                {quote.validationErrors && quote.validationErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md p-3 mt-3">
                    <p className="text-sm text-red-800 dark:text-red-400">
                      <strong>Error:</strong> {quote.validationErrors.join('. ')}
                    </p>
                  </div>
                )}

                {quote.validationWarnings && quote.validationWarnings.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-md p-3 mt-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      <strong>Advertencia:</strong> {quote.validationWarnings.join('. ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedPlanId && changePlanMutation.mutate(selectedPlanId)}
              disabled={!selectedPlanId || !quote || changePlanMutation.isPending || (quote?.validationErrors?.length ?? 0) > 0}
              data-testid="button-confirm-change-plan"
            >
              {changePlanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : quote?.requiresPayment ? (
                `Pagar ${formatPrice(Math.abs(quote.amountToCharge) / 100)}`
              ) : (
                'Confirmar cambio'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
