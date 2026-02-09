import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DollarSign, Users, TrendingUp, TrendingDown, Loader2, Ban, CheckCircle, XCircle, ShieldAlert, AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";
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
  // Verificación de acceso: Solo superadmin puede ver este dashboard
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

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<BillingMetrics>({
    queryKey: ['/api/billing/admin/metrics'],
  });

  // Fetch subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<SubscriptionWithDetails[]>({
    queryKey: ['/api/billing/admin/subscriptions'],
  });

  // Fetch revenue chart data
  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueDataPoint[]>({
    queryKey: ['/api/billing/admin/revenue-chart'],
  });

  // Fetch companies without subscription
  const { data: companiesWithoutSub, isLoading: companiesWithoutSubLoading } = useQuery<{ count: number; companies: CompanyWithoutSubscription[] }>({
    queryKey: ['/api/billing/admin/companies-without-subscription'],
  });

  // Assign trial mutation
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

  // Status change mutation
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

  const filteredSubscriptions = subscriptions?.filter(sub => 
    statusFilter === "all" || sub.status === statusFilter
  ) || [];

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card data-testid="card-mrr">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

      {/* Revenue Chart */}
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

      {/* Subscriptions Table */}
      <Card data-testid="card-subscriptions-table">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Suscripciones</CardTitle>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio Mensual</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Próxima Renovación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id} data-testid={`row-subscription-${sub.id}`}>
                  <TableCell className="font-medium">{sub.companyName}</TableCell>
                  <TableCell>{sub.planId === 'sst_dinamico' ? 'Plan Din\u00e1mico' : sub.planName}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>{sub.planId === 'sst_dinamico' ? 'Calculado' : formatCurrency(sub.planPrice)}</TableCell>
                  <TableCell>{formatDate(sub.createdAt)}</TableCell>
                  <TableCell>{formatDate(sub.currentPeriodEnd)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {sub.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(sub, 'suspend')}
                            data-testid={`button-suspend-${sub.id}`}
                          >
                            Suspender
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(sub, 'cancel')}
                            data-testid={`button-cancel-${sub.id}`}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {(sub.status === 'suspended' || sub.status === 'past_due') && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAction(sub, 'activate')}
                          data-testid={`button-activate-${sub.id}`}
                        >
                          Reactivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Companies Without Subscription Section */}
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

      {/* Assign Trial Dialog */}
      <AlertDialog open={assignTrialDialog.open} onOpenChange={(open) => setAssignTrialDialog({ ...assignTrialDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Asignar Per\u00edodo de Prueba</AlertDialogTitle>
            <AlertDialogDescription>
              Asignar un per\u00edodo de prueba de 7 d\u00edas a <strong>{assignTrialDialog.company?.name}</strong> con el plan din\u00e1mico SST Colombia.
              El precio se calcular\u00e1 autom\u00e1ticamente seg\u00fan el perfil de la empresa.
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

      {/* Confirmation Dialog */}
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
