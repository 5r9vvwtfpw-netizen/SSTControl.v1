import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, Building2, CreditCard, FileText, Download, Calendar, 
  AlertCircle, Loader2, Mail, Phone, MapPin, Shield, Users, Check, CheckCircle,
  Car, Briefcase, MapPinned, ExternalLink, Receipt
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
  snapshotCiiuCode: string | null;
  snapshotNumberOfWorkers: number | null;
  snapshotNumberOfVehicles: number | null;
  dianCufe: string | null;
  dianPdfUrl: string | null;
  dianXmlUrl: string | null;
  receiptUrl: string | null;
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
  city?: string;
  ciiuCode?: string;
  numWorkers?: number;
  numberOfWorkers?: number;
  riskLevel: string;
  numberOfVehicles?: number;
  vehicleCount: number;
  driverCount: number;
  legalRepName?: string;
  legalRepPosition?: string;
  quoteBaseMonthlyPrice?: number;
  quoteCurrentPeriodPrice?: number;
  quoteCouponCode?: string;
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
  const searchParams = new URLSearchParams(useSearch());
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  
  const activationStatus = searchParams.get('activation');
  const paymentSessionId = searchParams.get('session_id');
  const [paymentProcessing, setPaymentProcessing] = useState(activationStatus === 'success');

  useEffect(() => {
    if (activationStatus === 'success') {
      setPaymentProcessing(true);
      setActiveTab("subscription");
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/my-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/my-invoices'] });
      
      const pollInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/my-subscription'] });
      }, 3000);
      
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        setPaymentProcessing(false);
      }, 30000);
      
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [activationStatus]);

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

  const formatPrice = (price: number) => {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
    link.download = `Comprobante-${invoiceNumber}.pdf`;
    link.click();
  };


  const activateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!subscriptionData?.subscription.id) {
        throw new Error("No hay suscripción activa");
      }
      
      const quoteToken = typeof window !== 'undefined' ? localStorage.getItem('sst_quote_token') : null;
      const res = await apiRequest(
        "POST",
        `/api/billing/subscription/${subscriptionData.subscription.id}/activate`,
        quoteToken ? { quoteToken } : {}
      );
      return await res.json() as { paymentUrl?: string; error?: string; amount?: number; trial?: boolean; message?: string; trialDays?: number; alreadyActive?: boolean };
    },
    onSuccess: (data) => {
      if (data.alreadyActive) {
        toast({
          title: "Suscripción activa",
          description: data.message || "Tu suscripción ya está activa.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/my-subscription'] });
      } else if (data.trial) {
        toast({
          title: "Prueba gratuita activada",
          description: data.message || `${data.trialDays || 30} días de prueba gratis activados`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      } else if (data.paymentUrl) {
        toast({
          title: "Redirigiendo al pago",
          description: data.amount ? `Monto a pagar: ${formatPrice(data.amount)}` : 'Redirigiendo a Stripe...',
        });
        
        setTimeout(() => {
          window.location.href = data.paymentUrl!;
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo generar el enlace de pago",
          variant: "destructive",
        });
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

  const isSubscriptionActive = subscriptionData?.subscription.status === 'active';
  
  useEffect(() => {
    if (paymentProcessing && isSubscriptionActive) {
      setPaymentProcessing(false);
      toast({
        title: "Pago exitoso",
        description: "Tu suscripción ha sido activada correctamente.",
      });
      window.history.replaceState({}, '', '/mi-cuenta');
    }
  }, [isSubscriptionActive, paymentProcessing, toast]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Mi Cuenta</h1>
      </div>

      {paymentProcessing && !isSubscriptionActive && (
        <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-950/50 dark:to-emerald-950/50 dark:border-green-700" data-testid="alert-payment-processing">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="flex items-center gap-3">
            <div>
              <span className="font-bold text-green-800 dark:text-green-200">Pago recibido exitosamente</span>
              <p className="text-sm text-green-700 dark:text-green-300">
                Tu pago ha sido procesado. Estamos activando tu suscripción, esto puede tomar unos segundos...
              </p>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-green-600 dark:text-green-400 shrink-0" />
          </AlertDescription>
        </Alert>
      )}

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
                    <div className="flex items-center gap-2">
                      <span className="text-lg" data-testid="text-company-nit">
                        {companyData.nit}
                      </span>
                    </div>
                  </div>

                  {(companyData.legalRepName) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Representante Legal</label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-company-legal-rep">
                          {companyData.legalRepName}
                          {companyData.legalRepPosition && (
                            <span className="text-muted-foreground ml-1">— {companyData.legalRepPosition}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {companyData.ciiuCode && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Actividad Económica (CIIU)</label>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-company-ciiu">{companyData.ciiuCode}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nivel de Riesgo</label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" data-testid="badge-risk-level">
                        Nivel {companyData.riskLevel}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Número de Empleados</label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-medium" data-testid="text-num-workers">
                        {companyData.numberOfWorkers ?? companyData.numWorkers ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Número de Vehículos (PESV)</label>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-medium" data-testid="text-num-vehicles">
                        {companyData.numberOfVehicles ?? 0}
                      </span>
                    </div>
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

                  {companyData.city && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                      <div className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="text-company-city">{companyData.city}</span>
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
              {subscriptionData.subscription.status === 'trial' && subscriptionData.subscription.trialEndsAt && !paymentProcessing && (
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
                          disabled={activateSubscriptionMutation.isPending || paymentProcessing}
                          data-testid="button-pay-now"
                        >
                          {activateSubscriptionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          Pagar Ahora
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
                        Su Suscripción
                      </CardTitle>
                      <CardDescription>Información de facturación y precio de su plan</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {paymentProcessing ? (
                        <Badge variant="default" className="bg-green-600">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Procesando pago...
                        </Badge>
                      ) : (
                        <>
                          {getStatusBadge(subscriptionData.subscription.status)}
                          {subscriptionData.subscription.status !== 'active' && (
                            <Button 
                              onClick={() => activateSubscriptionMutation.mutate()}
                              disabled={activateSubscriptionMutation.isPending || paymentProcessing}
                              data-testid="button-pay-now-main"
                            >
                              {activateSubscriptionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4 mr-2" />
                              )}
                              Pagar Ahora
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Precio Mensual</label>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {companyData?.quoteCouponCode ? (
                          <div>
                            <span className="text-lg font-bold" data-testid="text-price">
                              {formatPrice(companyData?.quoteCurrentPeriodPrice ?? companyData?.quoteBaseMonthlyPrice ?? 0)}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              Cupón: {companyData.quoteCouponCode}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-lg font-bold" data-testid="text-price">
                            {formatPrice(companyData?.quoteBaseMonthlyPrice ?? 0)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Basado en CIIU {companyData?.ciiuCode || 'N/A'}, {companyData?.numberOfWorkers ?? companyData?.numWorkers ?? 0} empleados, {companyData?.numberOfVehicles ?? 0} vehículos
                      </p>
                    </div>

                    {subscriptionData.subscription.status === 'trial' && subscriptionData.subscription.trialEndsAt && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Prueba Gratuita Termina</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg font-semibold" data-testid="text-trial-ends">
                            {formatDate(subscriptionData.subscription.trialEndsAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    {invoices && invoices.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground" data-testid="text-last-payment-date">
                          Ultimo monto cobrado el {formatDate(invoices[0].paidDate || invoices[0].issueDate)}
                        </label>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg font-bold" data-testid="text-last-payment-amount">
                            {formatPrice(invoices[0].total)}
                          </span>
                          {companyData?.quoteCouponCode && (
                            <Badge variant="outline">con cupón</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Basado en CIIU {invoices[0].snapshotCiiuCode || companyData?.ciiuCode || 'N/A'}, {invoices[0].snapshotNumberOfWorkers ?? companyData?.numberOfWorkers ?? companyData?.numWorkers ?? 0} empleados, {invoices[0].snapshotNumberOfVehicles ?? companyData?.numberOfVehicles ?? 0} vehículos
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Próximo Pago{' '}
                        {(() => {
                          const lastPaymentDate = invoices && invoices.length > 0
                            ? new Date(invoices[0].paidDate || invoices[0].issueDate)
                            : null;
                          if (lastPaymentDate) {
                            const year = lastPaymentDate.getFullYear();
                            const month = lastPaymentDate.getMonth();
                            const day = lastPaymentDate.getDate();
                            const nextMonth = month + 1;
                            const nextYear = nextMonth > 11 ? year + 1 : year;
                            const nextMonthNorm = nextMonth > 11 ? 0 : nextMonth;
                            const daysInNextMonth = new Date(nextYear, nextMonthNorm + 1, 0).getDate();
                            const nextDay = Math.min(day, daysInNextMonth);
                            const next = new Date(nextYear, nextMonthNorm, nextDay);
                            return formatDate(next.toISOString());
                          }
                          if (subscriptionData.subscription.trialEndsAt) {
                            return formatDate(subscriptionData.subscription.trialEndsAt);
                          }
                          return '';
                        })()}
                      </label>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-bold" data-testid="text-next-payment-amount">
                          {formatPrice(companyData?.quoteCurrentPeriodPrice ?? companyData?.quoteBaseMonthlyPrice ?? 0)}
                        </span>
                        {companyData?.quoteCouponCode && (
                          <Badge variant="outline">con cupón</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Basado en CIIU {companyData?.ciiuCode || 'N/A'}, {companyData?.numberOfWorkers ?? companyData?.numWorkers ?? 0} empleados, {companyData?.numberOfVehicles ?? 0} vehículos
                      </p>
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
                      className="p-4 border rounded-lg hover-elevate"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
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
                        <div className="text-right">
                          <p className="text-lg font-bold" data-testid={`text-invoice-amount-${invoice.id}`}>
                            {formatPrice(invoice.total)}
                          </p>
                          {getInvoiceStatusBadge(invoice.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                          data-testid={`button-download-${invoice.id}`}
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          Comprobante SST
                        </Button>
                        {invoice.receiptUrl && (
                          <a href={invoice.receiptUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-stripe-receipt-${invoice.id}`}
                            >
                              <Receipt className="h-4 w-4 mr-1.5" />
                              Recibo de Pago
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </a>
                        )}
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

    </div>
  );
}
