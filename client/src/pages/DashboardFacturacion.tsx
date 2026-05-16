import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Users, TrendingUp, TrendingDown, Loader2, Ban, CheckCircle, XCircle, ShieldAlert, AlertTriangle, Plus, Search, ArrowLeft, Building2, CalendarClock, ChevronRight, RefreshCw, FileText, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type BillingMetrics = {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnRate: number;
  totalRevenue: number;
};

type SubscriptionWithDetails = {
  id: string;
  companyId: string;
  planId: string;
  status: string;
  trialStart: Date | null;
  trialEnd: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  suspendedAt: Date | null;
  createdAt: Date;
  companyName: string;
  planName: string;
  planPrice: number;
  numberOfWorkers: number;
  quoteBaseMonthlyPrice: number | null;
};

type RevenueDataPoint = {
  month: string;
  revenue: number;
  subscriptions: number;
};

type CompanyWithoutSubscription = {
  id: string;
  name: string;
  nit: string;
  createdAt: Date;
};

type CompanyVault = {
  companyId: string;
  companyName: string;
  subscription: SubscriptionWithDetails;
  planDisplay: string;
  priceDisplay: string;
  nextRenewal: string;
};

export default function DashboardFacturacion() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithDetails | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string }>({
    open: false,
    action: ""
  });
  const [assignTrialDialog, setAssignTrialDialog] = useState<{ open: boolean; company: CompanyWithoutSubscription | null }>({
    open: false,
    company: null
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVaultCompanyId, setSelectedVaultCompanyId] = useState<string | null>(null);

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="access-denied-container">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Este panel es exclusivo para administradores del sistema (proveedor SaaS).
              Si necesitas acceso, contacta al administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: metrics, isLoading: metricsLoading } = useQuery<BillingMetrics>({
    queryKey: ['/api/billing/admin/metrics'],
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<SubscriptionWithDetails[]>({
    queryKey: ['/api/billing/admin/subscriptions'],
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueDataPoint[]>({
    queryKey: ['/api/billing/admin/revenue-chart'],
  });

  const { data: companiesWithoutSub } = useQuery<{ count: number; companies: CompanyWithoutSubscription[] }>({
    queryKey: ['/api/billing/admin/companies-without-subscription'],
  });

  const assignTrialMutation = useMutation({
    mutationFn: async ({ companyId, planId, trialDays }: { companyId: string; planId: string; trialDays: number }) => {
      const response = await apiRequest(
        'POST',
        '/api/billing/admin/assign-trial',
        { companyId, planId, trialDays }
      );
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/companies-without-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/metrics'] });
      toast({
        title: "Trial asignado",
        description: data.message || "Suscripción trial asignada exitosamente",
      });
      setAssignTrialDialog({ open: false, company: null });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el trial",
        variant: "destructive"
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest(
        'PATCH',
        `/api/billing/admin/subscriptions/${id}/status`,
        { status }
      );
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/metrics'] });
      toast({
        title: "Éxito",
        description: data.message || "Estado actualizado correctamente",
      });
      setActionDialog({ open: false, action: "" });
      setSelectedSubscription(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
      });
    }
  });

  const { data: vaultInvoices, isLoading: vaultInvoicesLoading, refetch: refetchVaultInvoices } = useQuery<any[]>({
    queryKey: ['/api/billing/admin/invoices', selectedVaultCompanyId],
    enabled: !!selectedVaultCompanyId,
  });

  const retryAccountingMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest('POST', `/api/billing/admin/retry-accounting/${invoiceId}`);
      return await response.json();
    },
    onSuccess: (data: any) => {
      refetchVaultInvoices();
      toast({
        title: data.ok ? "Factura DIAN generada" : "Sin respuesta del sistema contable",
        description: data.ok
          ? `CUFE: ${data.dianCufe?.substring(0, 30)}...`
          : data.message || "Intenta de nuevo más tarde",
        variant: data.ok ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      active: { variant: "default", label: "Activa", icon: CheckCircle },
      trial: { variant: "secondary", label: "Prueba", icon: TrendingUp },
      past_due: { variant: "destructive", label: "Vencida", icon: XCircle },
      suspended: { variant: "outline", label: "Suspendida", icon: Ban },
      canceled: { variant: "outline", label: "Cancelada", icon: XCircle },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleAction = (subscription: SubscriptionWithDetails, action: string) => {
    setSelectedSubscription(subscription);
    setActionDialog({ open: true, action });
  };

  const executeAction = () => {
    if (!selectedSubscription) return;

    const statusMap: Record<string, string> = {
      suspend: 'suspended',
      activate: 'active',
      cancel: 'canceled'
    };

    const newStatus = statusMap[actionDialog.action];
    if (newStatus) {
      statusMutation.mutate({ id: selectedSubscription.id, status: newStatus });
    }
  };

  const companyVaults = useMemo<CompanyVault[]>(() => {
    if (!subscriptions) return [];
    return subscriptions.map((sub) => ({
      companyId: sub.companyId,
      companyName: sub.companyName,
      subscription: sub,
      planDisplay: 'SST Colombia',
      priceDisplay: (() => {
        // Precio real: quote de la landing page, o cálculo por trabajadores ($10,000/trabajador)
        if (sub.quoteBaseMonthlyPrice && sub.quoteBaseMonthlyPrice > 0) {
          return formatCurrency(sub.quoteBaseMonthlyPrice);
        }
        if (sub.numberOfWorkers && sub.numberOfWorkers > 0) {
          return formatCurrency(sub.numberOfWorkers * 10000);
        }
        return 'Por definir';
      })(),
      nextRenewal: formatDate(sub.currentPeriodEnd),
    }));
  }, [subscriptions]);

  const filteredVaults = useMemo(() => {
    let result = companyVaults;
    if (statusFilter !== "all") {
      result = result.filter(v => v.subscription.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(v => v.companyName.toLowerCase().includes(term));
    }
    return result;
  }, [companyVaults, statusFilter, searchTerm]);

  const selectedVault = selectedVaultCompanyId
    ? companyVaults.find(v => v.companyId === selectedVaultCompanyId) || null
    : null;

  if (metricsLoading || subscriptionsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-dashboard" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-title">
          Panel de Facturación
        </h1>
        <p className="text-muted-foreground" data-testid="text-subtitle">
          Métricas de negocio, análisis de ingresos y gestión de suscripciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card data-testid="card-mrr">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Ingreso Mensual Recurrente)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mrr-value">
              {formatCurrency(metrics?.mrr || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ARR: {formatCurrency(metrics?.arr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-subscriptions">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-count">
              {metrics?.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.trialSubscriptions || 0} en período de prueba
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-churn">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-churn-rate">
              {metrics?.churnRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8" data-testid="card-revenue-chart">
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedVault ? (
        <Card data-testid="card-vault-detail">
          <CardHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVaultCompanyId(null)}
                data-testid="button-back-to-vaults"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver a empresas
              </Button>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{selectedVault.companyName}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium" data-testid="text-vault-plan">{selectedVault.planDisplay}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div data-testid="text-vault-status">{getStatusBadge(selectedVault.subscription.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Mensual</p>
                <p className="font-medium" data-testid="text-vault-price">{selectedVault.priceDisplay}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                <p className="font-medium" data-testid="text-vault-start">{formatDate(selectedVault.subscription.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próxima Renovación</p>
                <p className="font-medium" data-testid="text-vault-renewal">{selectedVault.nextRenewal}</p>
              </div>
              {selectedVault.subscription.trialEnd && (
                <div>
                  <p className="text-sm text-muted-foreground">Fin del Trial</p>
                  <p className="font-medium" data-testid="text-vault-trial-end">{formatDate(selectedVault.subscription.trialEnd)}</p>
                </div>
              )}
            </div>
            {selectedVault.subscription.suspendedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Suspendida desde</p>
                <p className="font-medium text-destructive" data-testid="text-vault-suspended-at">{formatDate(selectedVault.subscription.suspendedAt)}</p>
              </div>
            )}
            {selectedVault.subscription.canceledAt && (
              <div>
                <p className="text-sm text-muted-foreground">Cancelada el</p>
                <p className="font-medium text-destructive" data-testid="text-vault-canceled-at">{formatDate(selectedVault.subscription.canceledAt)}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t flex-wrap">
              {selectedVault.subscription.status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAction(selectedVault.subscription, 'suspend')}
                    data-testid="button-vault-suspend"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Suspender
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction(selectedVault.subscription, 'cancel')}
                    data-testid="button-vault-cancel"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              )}
              {(selectedVault.subscription.status === 'suspended' || selectedVault.subscription.status === 'past_due') && (
                <Button
                  onClick={() => handleAction(selectedVault.subscription, 'activate')}
                  data-testid="button-vault-activate"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Reactivar
                </Button>
              )}
              {selectedVault.subscription.status === 'trial' && (
                <>
                  <Button
                    onClick={() => handleAction(selectedVault.subscription, 'activate')}
                    data-testid="button-vault-activate-trial"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Activar (Fin de Trial)
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction(selectedVault.subscription, 'cancel')}
                    data-testid="button-vault-cancel-trial"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold" data-testid="text-vaults-title">Suscripciones por Empresa</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[220px]"
                    data-testid="input-search-vaults"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="trial">Pruebas</SelectItem>
                    <SelectItem value="past_due">Vencidas</SelectItem>
                    <SelectItem value="suspended">Suspendidas</SelectItem>
                    <SelectItem value="canceled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredVaults.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground" data-testid="text-no-vaults">
                    {searchTerm || statusFilter !== "all"
                      ? "No se encontraron empresas con los filtros aplicados"
                      : "No hay suscripciones registradas"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-vaults">
                {filteredVaults.map((vault) => (
                  <Card
                    key={vault.companyId}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedVaultCompanyId(vault.companyId)}
                    data-testid={`card-vault-${vault.companyId}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                          <CardTitle className="text-base truncate">{vault.companyName}</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="text-sm font-medium" data-testid={`text-vault-plan-${vault.companyId}`}>{vault.planDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Estado</span>
                        <span data-testid={`text-vault-status-${vault.companyId}`}>{getStatusBadge(vault.subscription.status)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Precio</span>
                        <span className="text-sm font-medium" data-testid={`text-vault-price-${vault.companyId}`}>{vault.priceDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          Renovación
                        </span>
                        <span className="text-sm" data-testid={`text-vault-renewal-${vault.companyId}`}>{vault.nextRenewal}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {companiesWithoutSub && companiesWithoutSub.count > 0 && (
            <Card className="mt-8" data-testid="card-companies-without-subscription">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle className="text-warning">Empresas sin Suscripción ({companiesWithoutSub.count})</CardTitle>
                </div>
                <CardDescription>
                  Estas empresas se registraron pero no tienen plan asignado. Asígnales un período de prueba.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>NIT</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companiesWithoutSub.companies.map((company) => (
                      <TableRow key={company.id} data-testid={`row-company-no-sub-${company.id}`}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.nit}</TableCell>
                        <TableCell>{formatDate(company.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setAssignTrialDialog({ open: true, company })}
                            data-testid={`button-assign-trial-${company.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Asignar Trial
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AlertDialog open={assignTrialDialog.open} onOpenChange={(open) => setAssignTrialDialog({ ...assignTrialDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Asignar Período de Prueba</AlertDialogTitle>
            <AlertDialogDescription>
              Asignar un período de prueba de 7 días a <strong>{assignTrialDialog.company?.name}</strong> con el plan dinámico SST Colombia.
              El precio se calculará automáticamente según el perfil de la empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-assign-trial-cancel">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (assignTrialDialog.company) {
                  assignTrialMutation.mutate({
                    companyId: assignTrialDialog.company.id,
                    planId: 'sst_dinamico',
                    trialDays: 7
                  });
                }
              }}
              disabled={assignTrialMutation.isPending}
              data-testid="button-assign-trial-confirm"
            >
              {assignTrialMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Asignar Trial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas {
                actionDialog.action === 'suspend' ? 'suspender' :
                actionDialog.action === 'activate' ? 'reactivar' :
                'cancelar'
              } la suscripción de <strong>{selectedSubscription?.companyName}</strong>?
              {actionDialog.action === 'cancel' && (
                <span className="block mt-2 text-destructive">
                  Esta acción es permanente y no se puede deshacer.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-dialog-cancel">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              disabled={statusMutation.isPending}
              data-testid="button-dialog-confirm"
            >
              {statusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
