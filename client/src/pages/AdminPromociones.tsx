/**
 * Panel Administrativo de Promociones y Referidos
 * 
 * PLUGIN SIDECAR: Página independiente para gestión del plugin de promociones
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tag, 
  Users, 
  FileText, 
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  RefreshCw,
  Percent,
  DollarSign,
  Calendar,
  Hash,
  TrendingUp,
  Gift,
  Eye,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PromotionCoupon {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  discountDurationMonths: number | null;
  maxUses: number | null;
  currentUses: number | null;
  minEmployees: number | null;
  maxEmployees: number | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
}

interface ReferralLedger {
  id: number;
  referrerId: string;
  refereeId: string;
  programType: string;
  creditPoolTotal: string;
  remainingBalance: string;
  activatedAt: string | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
}

interface DigitalContract {
  id: number;
  companyId: string;
  jwtPayload: any;
  baseMonthlyPrice: string;
  currentPeriodPrice: string;
  discountDurationMonths: number;
  currency: string;
  couponCode: string | null;
  referrerId: string | null;
  employees: number | null;
  riskLevel: string | null;
  vehicles: number | null;
  stripeSubscriptionId: string | null;
  stripeScheduleId: string | null;
  acceptedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface PromotionStats {
  totalCoupons: number;
  activeCoupons: number;
  totalContracts: number;
  totalReferrals: number;
  activeReferrals: number;
  totalCreditsIssued: number;
  totalCreditsUsed: number;
}

export default function AdminPromociones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClientInstance = useQueryClient();
  const [activeTab, setActiveTab] = useState("cupones");
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [showContractDetail, setShowContractDetail] = useState<DigitalContract | null>(null);
  
  // Form state for new coupon
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    discountDurationMonths: 1,
    maxUses: "",
    minEmployees: "",
    maxEmployees: "",
    validFrom: "",
    validUntil: "",
  });

  // Queries
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery<PromotionStats>({
    queryKey: ["/api/plugins/promotions/stats"],
  });

  const { data: coupons, isLoading: loadingCoupons, refetch: refetchCoupons } = useQuery<PromotionCoupon[]>({
    queryKey: ["/api/plugins/promotions/coupons"],
  });

  const { data: referrals, isLoading: loadingReferrals, refetch: refetchReferrals } = useQuery<ReferralLedger[]>({
    queryKey: ["/api/plugins/promotions/referrals"],
  });

  const { data: contracts, isLoading: loadingContracts, refetch: refetchContracts } = useQuery<DigitalContract[]>({
    queryKey: ["/api/plugins/promotions/contracts"],
  });

  // Mutations
  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/plugins/promotions/coupons", data);
    },
    onSuccess: () => {
      toast({ title: "Cupón creado exitosamente" });
      setShowCreateCoupon(false);
      setNewCoupon({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        discountDurationMonths: 1,
        maxUses: "",
        minEmployees: "",
        maxEmployees: "",
        validFrom: "",
        validUntil: "",
      });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/plugins/promotions/coupons"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/plugins/promotions/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/plugins/promotions/coupons/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Cupón eliminado" });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/plugins/promotions/coupons"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/plugins/promotions/stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleCouponMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/plugins/promotions/coupons/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      toast({ title: "Estado del cupón actualizado" });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/plugins/promotions/coupons"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateCoupon = () => {
    const data: any = {
      code: newCoupon.code.toUpperCase(),
      description: newCoupon.description || null,
      discountType: newCoupon.discountType,
      discountValue: parseFloat(newCoupon.discountValue),
      discountDurationMonths: newCoupon.discountDurationMonths,
    };
    
    if (newCoupon.maxUses) data.maxUses = parseInt(newCoupon.maxUses);
    if (newCoupon.minEmployees) data.minEmployees = parseInt(newCoupon.minEmployees);
    if (newCoupon.maxEmployees) data.maxEmployees = parseInt(newCoupon.maxEmployees);
    if (newCoupon.validFrom) data.validFrom = new Date(newCoupon.validFrom).toISOString();
    if (newCoupon.validUntil) data.validUntil = new Date(newCoupon.validUntil).toISOString();
    
    createCouponMutation.mutate(data);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return '$' + new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      active: { label: "Activo", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      exhausted: { label: "Agotado", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
      expired: { label: "Expirado", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta sección.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Promociones y Referidos</h1>
          <p className="text-muted-foreground">Gestión del plugin de promociones (Lobby Digital)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/api/propuesta-comercial/pdf', '_blank')}
            data-testid="button-download-propuesta"
          >
            <Download className="h-4 w-4 mr-2" />
            Propuesta Comercial PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              refetchStats();
              refetchCoupons();
              refetchReferrals();
              refetchContracts();
            }}
            data-testid="button-refresh-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupones Activos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-coupons">
              {loadingStats ? "..." : `${stats?.activeCoupons || 0} / ${stats?.totalCoupons || 0}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Digitales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-contracts">
              {loadingStats ? "..." : stats?.totalContracts || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-referrals">
              {loadingStats ? "..." : `${stats?.activeReferrals || 0} / ${stats?.totalReferrals || 0}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Usados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-credits-used">
              {loadingStats ? "..." : formatCurrency(stats?.totalCreditsUsed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              de {formatCurrency(stats?.totalCreditsIssued || 0)} emitidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cupones" data-testid="tab-cupones">
            <Tag className="h-4 w-4 mr-2" />
            Cupones
          </TabsTrigger>
          <TabsTrigger value="referidos" data-testid="tab-referidos">
            <Gift className="h-4 w-4 mr-2" />
            Ledger Aliados
          </TabsTrigger>
          <TabsTrigger value="contratos" data-testid="tab-contratos">
            <FileText className="h-4 w-4 mr-2" />
            Contratos Digitales
          </TabsTrigger>
        </TabsList>

        {/* Cupones Tab */}
        <TabsContent value="cupones">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Gestión de Cupones</CardTitle>
                <CardDescription>Crear, editar y eliminar cupones de descuento</CardDescription>
              </div>
              <Button onClick={() => setShowCreateCoupon(true)} data-testid="button-create-coupon">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cupón
              </Button>
            </CardHeader>
            <CardContent>
              {loadingCoupons ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !coupons?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay cupones creados. Crea el primero.
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead>Validez</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                          <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                          <TableCell>
                            {coupon.discountType === "percentage" ? (
                              <span className="flex items-center gap-1">
                                <Percent className="h-4 w-4" />
                                {coupon.discountValue}%
                              </span>
                            ) : (
                              formatCurrency(coupon.discountValue)
                            )}
                          </TableCell>
                          <TableCell>{coupon.discountDurationMonths} mes(es)</TableCell>
                          <TableCell>
                            {coupon.currentUses || 0} / {coupon.maxUses || "∞"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {coupon.validUntil ? (
                              <span>
                                Hasta {format(new Date(coupon.validUntil), "dd MMM yyyy", { locale: es })}
                              </span>
                            ) : (
                              "Sin expiración"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                              {coupon.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleCouponMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                                data-testid={`button-toggle-${coupon.id}`}
                              >
                                {coupon.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("¿Eliminar este cupón?")) {
                                    deleteCouponMutation.mutate(coupon.id);
                                  }
                                }}
                                data-testid={`button-delete-${coupon.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referidos Tab */}
        <TabsContent value="referidos">
          <Card>
            <CardHeader>
              <CardTitle>Ledger de Aliados (Programa de Referidos)</CardTitle>
              <CardDescription>Seguimiento de créditos y beneficios del programa Net-Zero Risk</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReferrals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !referrals?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay referidos registrados aún.
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referidor</TableHead>
                        <TableHead>Nuevo Usuario</TableHead>
                        <TableHead>Programa</TableHead>
                        <TableHead>Crédito Total</TableHead>
                        <TableHead>Saldo Restante</TableHead>
                        <TableHead>Activación</TableHead>
                        <TableHead>Expira</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((ref) => (
                        <TableRow key={ref.id} data-testid={`row-referral-${ref.id}`}>
                          <TableCell className="font-mono text-sm">{ref.referrerId}</TableCell>
                          <TableCell className="font-mono text-sm">{ref.refereeId}</TableCell>
                          <TableCell>{ref.programType}</TableCell>
                          <TableCell>{formatCurrency(ref.creditPoolTotal)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(ref.remainingBalance)}</TableCell>
                          <TableCell>
                            {ref.activatedAt ? format(new Date(ref.activatedAt), "dd MMM yyyy", { locale: es }) : "-"}
                          </TableCell>
                          <TableCell>
                            {ref.expiresAt ? format(new Date(ref.expiresAt), "dd MMM yyyy", { locale: es }) : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(ref.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contratos Digitales Tab */}
        <TabsContent value="contratos">
          <Card>
            <CardHeader>
              <CardTitle>Auditoría de Contratos Digitales (JWT)</CardTitle>
              <CardDescription>Registro de todos los contratos digitales aceptados</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingContracts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !contracts?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay contratos digitales registrados.
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Empleados</TableHead>
                        <TableHead>Riesgo</TableHead>
                        <TableHead>Precio Inicial</TableHead>
                        <TableHead>Precio Base</TableHead>
                        <TableHead>Cupón</TableHead>
                        <TableHead>Referidor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Ver</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id} data-testid={`row-contract-${contract.id}`}>
                          <TableCell className="font-mono text-sm">{contract.companyId}</TableCell>
                          <TableCell>{contract.employees || "-"}</TableCell>
                          <TableCell>{contract.riskLevel || "-"}</TableCell>
                          <TableCell className="text-green-600 font-bold">
                            {formatCurrency(contract.currentPeriodPrice)}
                          </TableCell>
                          <TableCell>{formatCurrency(contract.baseMonthlyPrice)}</TableCell>
                          <TableCell>
                            {contract.couponCode ? (
                              <Badge variant="outline">{contract.couponCode}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {contract.referrerId || "-"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(contract.acceptedAt), "dd MMM yyyy HH:mm", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setShowContractDetail(contract)}
                              data-testid={`button-view-${contract.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Coupon Dialog */}
      <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cupón</DialogTitle>
            <DialogDescription>Configura los parámetros del cupón de descuento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código del Cupón</Label>
              <Input
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder="ej: PROMO2026"
                data-testid="input-coupon-code"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                placeholder="Descripción del cupón"
                data-testid="input-coupon-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Descuento</Label>
                <Select
                  value={newCoupon.discountType}
                  onValueChange={(v) => setNewCoupon({ ...newCoupon, discountType: v })}
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed_amount">Monto Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor del Descuento</Label>
                <Input
                  type="number"
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                  placeholder={newCoupon.discountType === "percentage" ? "25" : "50000"}
                  data-testid="input-discount-value"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duración (meses)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newCoupon.discountDurationMonths}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountDurationMonths: parseInt(e.target.value) || 1 })}
                  data-testid="input-duration-months"
                />
              </div>
              <div className="space-y-2">
                <Label>Usos Máximos</Label>
                <Input
                  type="number"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                  placeholder="Ilimitado"
                  data-testid="input-max-uses"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mín. Empleados</Label>
                <Input
                  type="number"
                  value={newCoupon.minEmployees}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minEmployees: e.target.value })}
                  placeholder="Sin mínimo"
                  data-testid="input-min-employees"
                />
              </div>
              <div className="space-y-2">
                <Label>Máx. Empleados</Label>
                <Input
                  type="number"
                  value={newCoupon.maxEmployees}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxEmployees: e.target.value })}
                  placeholder="Sin máximo"
                  data-testid="input-max-employees"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válido Desde</Label>
                <Input
                  type="date"
                  value={newCoupon.validFrom}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                  data-testid="input-valid-from"
                />
              </div>
              <div className="space-y-2">
                <Label>Válido Hasta</Label>
                <Input
                  type="date"
                  value={newCoupon.validUntil}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                  data-testid="input-valid-until"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCoupon(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCoupon} 
              disabled={!newCoupon.code || !newCoupon.discountValue || createCouponMutation.isPending}
              data-testid="button-submit-coupon"
            >
              {createCouponMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Crear Cupón
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog open={!!showContractDetail} onOpenChange={() => setShowContractDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Contrato Digital</DialogTitle>
            <DialogDescription>Información completa del JWT aceptado</DialogDescription>
          </DialogHeader>
          {showContractDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-mono">{showContractDetail.companyId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Aceptación</Label>
                  <p>{format(new Date(showContractDetail.acceptedAt), "dd MMM yyyy HH:mm:ss", { locale: es })}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empleados</Label>
                  <p className="font-bold">{showContractDetail.employees || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nivel de Riesgo</Label>
                  <p className="font-bold">{showContractDetail.riskLevel || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vehículos</Label>
                  <p className="font-bold">{showContractDetail.vehicles || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Precio Promocional</Label>
                  <p className="text-green-600 font-bold text-xl">{formatCurrency(showContractDetail.currentPeriodPrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Precio Base</Label>
                  <p className="font-bold text-xl">{formatCurrency(showContractDetail.baseMonthlyPrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duración Descuento</Label>
                  <p className="font-bold">{showContractDetail.discountDurationMonths} mes(es)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cupón Usado</Label>
                  <p>{showContractDetail.couponCode || "Ninguno"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referidor</Label>
                  <p className="font-mono">{showContractDetail.referrerId || "Ninguno"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">IP de Origen</Label>
                <p className="font-mono text-sm">{showContractDetail.ipAddress || "No registrada"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">JWT Payload Completo</Label>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(showContractDetail.jwtPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDetail(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
