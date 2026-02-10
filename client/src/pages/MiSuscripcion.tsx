import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Calendar, CreditCard, FileText, Loader2, AlertCircle, AlertTriangle, Check, ScrollText, Shield, Eye, XCircle, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, formatDate } from "@/lib/utils/formatters";
import { SUBSCRIPTION_STATUS_CONFIGS, INVOICE_STATUS_CONFIGS, getBadgeConfig } from "@/lib/utils/badge-helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type ContractData = {
  acceptedTerms: boolean;
  acceptedDataTreatment: boolean;
  acceptedAutoRenewal: boolean;
  planName: string;
};

type Subscription = {
  id: string;
  planId: string;
  status: string;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  contractAcceptedAt: string | null;
  contractTermsVersion: string | null;
  contractData: ContractData | null;
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

type PlanChange = {
  id: number;
  oldPlanId: string | null;
  newPlanId: string;
  changeType: string;
  status: string;
  createdAt: string;
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
  changeHistory: PlanChange[];
};

export default function MiSuscripcion() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  console.log('[MiSuscripcion] Rendering, user:', user?.username, 'companyId:', user?.companyId);

  const { data: subscriptionData, isLoading: isLoadingSubscription, error: subError } = useQuery<MySubscriptionResponse>({
    queryKey: ['/api/billing/my-subscription'],
    enabled: !!user?.companyId,
  });

  const { data: invoices, isLoading: isLoadingInvoices, error: invError } = useQuery<Invoice[]>({
    queryKey: ['/api/billing/my-invoices'],
    enabled: !!user?.companyId,
  });

  const { data: company, error: companyError } = useQuery<{ numberOfWorkers: number; riskLevel: string; numberOfVehicles: number; quoteBaseMonthlyPrice: number | null; quoteCurrentPeriodPrice: number | null; quoteCouponCode: string | null }>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId,
  });

  console.log('[MiSuscripcion] Data state:', { 
    isLoadingSubscription, subError: subError?.message,
    isLoadingInvoices, invError: invError?.message,
    companyError: companyError?.message,
    hasSubscription: !!subscriptionData,
    hasInvoices: !!invoices,
    hasCompany: !!company
  });

  // State for activation loading
  const [isActivating, setIsActivating] = useState(false);

  // Function to activate subscription (pay for current plan)
  const handleActivateSubscription = async () => {
    if (!subscriptionData?.subscription.id) {
      toast({
        title: "Error",
        description: "No hay suscripción activa",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    try {
      const quoteToken = typeof window !== 'undefined' ? localStorage.getItem('sst_quote_token') : null;
      const res = await apiRequest(
        "POST",
        `/api/billing/subscription/${subscriptionData.subscription.id}/activate`,
        quoteToken ? { quoteToken } : {}
      );
      const data = await res.json() as { paymentUrl?: string; error?: string; amount?: number; trial?: boolean; message?: string; trialDays?: number };
      
      if (data.trial) {
        toast({
          title: "Prueba gratuita activada",
          description: data.message || `${data.trialDays || 30} días de prueba gratis activados`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      } else if (data.paymentUrl) {
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
          description: data.error || "No se pudo generar el enlace de pago",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al activar suscripción",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const getStatusBadge = (status: string, type: 'subscription' | 'invoice' = 'subscription') => {
    const configMap = type === 'subscription' ? SUBSCRIPTION_STATUS_CONFIGS : INVOICE_STATUS_CONFIGS;
    const config = getBadgeConfig(status, configMap);
    const testId = type === 'subscription' ? `badge-status-${status}` : `badge-invoice-status-${status}`;
    return <Badge variant={config.variant} data-testid={testId}>{config.label}</Badge>;
  };

  const handleDownloadInvoice = (invoiceId: string, invoiceNumber: string) => {
    // Download PDF directly from backend
    const link = document.createElement('a');
    link.href = `/api/billing/invoice/${invoiceId}/download`;
    link.download = `Factura-${invoiceNumber}.pdf`;
    link.click();
  };

  if (!user?.companyId) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <div>
                <h3 className="font-semibold text-lg">Complete su registro</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Para acceder a su suscripción y comenzar a usar el sistema, primero debe registrar los datos de su empresa.
                </p>
              </div>
              <Button onClick={() => navigate('/crear-empresa')} data-testid="button-create-company">
                Registrar mi empresa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingSubscription) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No tienes suscripción activa</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Explora nuestros planes para comenzar
                </p>
              </div>
              <Button onClick={() => navigate('/planes-suscripcion')} data-testid="button-view-plans">
                Ver planes disponibles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { subscription, plan } = subscriptionData;

  // Check if subscription needs payment (trial, past_due, or suspended)
  const needsPayment = ['trial', 'past_due', 'suspended'].includes(subscription.status);

  // Get appropriate button text based on status
  const getPaymentButtonText = () => {
    switch (subscription.status) {
      case 'trial':
        return 'Activar suscripción';
      case 'past_due':
        return 'Pagar ahora';
      case 'suspended':
        return 'Reactivar cuenta';
      default:
        return 'Pagar';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Mi Suscripción</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu plan y revisa tus facturas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {needsPayment && (
            <Button 
              onClick={handleActivateSubscription}
              disabled={isActivating}
              data-testid="button-activate-subscription"
            >
              {isActivating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {getPaymentButtonText()}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Alert for subscriptions needing activation */}
      {subscription.status === 'past_due' && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-past-due-payment">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
            <span>
              <strong>Pago pendiente:</strong> Tu suscripción al plan <strong>{plan.displayName || plan.name}</strong> está vencida. 
              Realiza el pago para evitar la suspensión del servicio.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {subscription.status === 'suspended' && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-suspended-payment">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
            <span>
              <strong>Cuenta suspendida:</strong> Tu acceso al plan <strong>{plan.displayName || plan.name}</strong> ha sido suspendido por falta de pago. 
              Reactiva tu cuenta para continuar usando el sistema.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {subscription.status === 'trial' && (
        <Alert className="mb-6 border-primary/50 bg-primary/5" data-testid="alert-trial-payment">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
            <span>
              Estás en período de prueba del plan <strong>{plan.displayName || plan.name}</strong>. 
              Activa tu suscripción para asegurar la continuidad del servicio.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl" data-testid="text-plan-name">
                {plan.id === 'sst_dinamico' ? 'SST Colombia - Plan Personalizado' : (plan.displayName || plan.name)}
              </CardTitle>
              <CardDescription>
                {plan.id === 'sst_dinamico' 
                  ? 'Precio calculado din\u00e1micamente seg\u00fan el perfil de tu empresa' 
                  : plan.description}
              </CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Precio mensual</p>
                <p className="text-2xl font-bold" data-testid="text-price">
                  {company?.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 ? formatPrice(company.quoteBaseMonthlyPrice) : formatPrice(plan.priceMonthly)}
                </p>
                {company?.quoteBaseMonthlyPrice && company.quoteBaseMonthlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1" data-testid="text-price-breakdown">
                    Precio acordado desde cotizacion
                  </p>
                )}
              </div>
            </div>

            {subscription.nextBillingDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Próxima facturación</p>
                  <p className="text-lg font-semibold" data-testid="text-next-billing">
                    {formatDate(subscription.nextBillingDate)}
                  </p>
                </div>
              </div>
            )}

            {subscription.trialEndsAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Prueba termina</p>
                  <p className="text-lg font-semibold" data-testid="text-trial-ends">
                    {formatDate(subscription.trialEndsAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Facturas
          </CardTitle>
          <CardDescription>
            Descarga tus facturas en formato PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvoices ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay facturas disponibles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`row-invoice-${invoice.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold" data-testid={`text-invoice-number-${invoice.id}`}>
                        {invoice.invoiceNumber}
                      </p>
                      {getStatusBadge(invoice.status, 'invoice')}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span data-testid={`text-invoice-date-${invoice.id}`}>
                        Emitida: {formatDate(invoice.issueDate)}
                      </span>
                      {invoice.paidDate && (
                        <span data-testid={`text-invoice-paid-${invoice.id}`}>
                          Pagada: {formatDate(invoice.paidDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold" data-testid={`text-invoice-amount-${invoice.id}`}>
                      {formatPrice(invoice.total)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                      data-testid={`button-download-invoice-${invoice.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Section - Ley 527/1999 Comercio Electrónico */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Contrato de Servicios
          </CardTitle>
          <CardDescription>
            Contrato de prestación de servicios SaaS aceptado conforme a la Ley 527/1999
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.contractAcceptedAt ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-300">
                      Contrato aceptado electrónicamente
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Fecha de aceptación: {formatDate(subscription.contractAcceptedAt)}
                    </p>
                    {subscription.contractTermsVersion && (
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Versión del contrato: {subscription.contractTermsVersion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {subscription.contractData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Check className={`h-4 w-4 ${subscription.contractData.acceptedTerms ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Términos y condiciones</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Check className={`h-4 w-4 ${subscription.contractData.acceptedDataTreatment ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Tratamiento de datos</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Check className={`h-4 w-4 ${subscription.contractData.acceptedAutoRenewal ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Renovación automática</span>
                  </div>
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={() => setContractDialogOpen(true)}
                className="w-full sm:w-auto"
                data-testid="button-view-contract"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver contrato completo
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay contrato registrado para esta suscripción</p>
              <p className="text-sm mt-1">
                El contrato se genera automáticamente al realizar el primer pago
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract View Dialog */}
      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Contrato de Servicios SaaS
            </DialogTitle>
            <DialogDescription>
              Contrato aceptado el {subscription.contractAcceptedAt ? formatDate(subscription.contractAcceptedAt) : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose dark:prose-invert max-w-none text-sm">
            <h3>CONTRATO DE PRESTACIÓN DE SERVICIOS DE SOFTWARE COMO SERVICIO (SaaS)</h3>
            
            <p>
              El presente contrato regula la prestación de servicios del Sistema de Gestión de Seguridad 
              y Salud en el Trabajo (SG-SST) conforme a la normativa colombiana vigente.
            </p>

            <h4>CLÁUSULA PRIMERA - OBJETO</h4>
            <p>
              EL PROVEEDOR se compromete a prestar al CLIENTE el servicio de acceso y uso de la 
              plataforma tecnológica "SST Colombia" para la gestión del Sistema de Seguridad y Salud 
              en el Trabajo, conforme a los requisitos de la Resolución 0312 de 2019 y demás normas aplicables.
            </p>

            <h4>CLÁUSULA SEGUNDA - DURACIÓN</h4>
            <p>
              El contrato tiene duración según el período de facturación seleccionado, con renovación 
              automática salvo notificación previa de 15 días antes del vencimiento.
            </p>

            <h4>CLÁUSULA TERCERA - PRECIO</h4>
            <p>
              El precio se determina según la cotización personalizada de su empresa, 
              calculada desde la landing page según su perfil empresarial, más IVA (19%).
            </p>

            <h4>CLÁUSULA CUARTA - PROTECCIÓN DE DATOS (Ley 1581/2012)</h4>
            <p>
              EL PROVEEDOR actúa como Encargado del tratamiento de datos personales, procesando 
              los datos exclusivamente según las instrucciones del CLIENTE y para los fines del contrato.
            </p>

            <h4>CLÁUSULA QUINTA - CONFIDENCIALIDAD</h4>
            <p>
              Las partes se comprometen a mantener la confidencialidad de toda información sensible 
              intercambiada durante la vigencia del contrato.
            </p>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Este contrato fue aceptado electrónicamente conforme a la Ley 527/1999 de Comercio Electrónico 
                y el Decreto 1074/2015. La aceptación electrónica tiene la misma validez legal que una firma manuscrita.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContractDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
