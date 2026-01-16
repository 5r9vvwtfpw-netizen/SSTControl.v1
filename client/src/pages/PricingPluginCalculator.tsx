import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, Users, DollarSign, TrendingDown, Check, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PricingResult {
  tier: string;
  employeeCount: number;
  pricePerLicense: number;
  minimumFee: number;
  monthlyCost: number;
  costPerEmployee: number;
  currency: string;
}

interface CheckoutResponse {
  sessionUrl: string;
  sessionId: string;
  pricing: PricingResult;
}

interface UserData {
  id: number;
  companyId: string | null;
}

export default function PricingPluginCalculator() {
  const [employees, setEmployees] = useState<string>("");
  const [result, setResult] = useState<PricingResult | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<UserData>({
    queryKey: ["/api/user"],
  });

  const calculateMutation = useMutation({
    mutationFn: async (employeeCount: number) => {
      const res = await apiRequest("POST", "/api/pricing-plugin/calculate", { employees: employeeCount });
      return res.json() as Promise<PricingResult>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (employeeCount: number) => {
      if (!user?.companyId) {
        throw new Error("Debe iniciar sesión con una empresa para suscribirse");
      }
      const res = await apiRequest("POST", "/api/pricing-plugin/checkout", {
        customerId: user.companyId,
        employeeCount,
      });
      return res.json() as Promise<CheckoutResponse>;
    },
    onSuccess: (data) => {
      window.location.href = data.sessionUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    const employeeCount = parseInt(employees, 10);
    if (isNaN(employeeCount) || employeeCount < 1) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número válido de empleados (mínimo 1)",
        variant: "destructive",
      });
      return;
    }
    calculateMutation.mutate(employeeCount);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "1-10": return "Pequeña (1-10 empleados)";
      case "11-49": return "Mediana (11-49 empleados)";
      case "50-199": return "Grande (50-199 empleados)";
      case "200+": return "Corporativa (200+ empleados)";
      default: return tier;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Calculadora de Precios</h1>
          <p className="text-xl text-muted-foreground">
            Calcula el costo mensual de tu licencia de software SST
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulador de Precios
              </CardTitle>
              <CardDescription>
                Ingresa el número de empleados de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employees">Número de empleados</Label>
                <div className="flex gap-2">
                  <Input
                    id="employees"
                    type="number"
                    min="1"
                    placeholder="Ej: 25"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                    data-testid="input-employees"
                  />
                  <Button 
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                    data-testid="button-calculate"
                  >
                    {calculateMutation.isPending ? "Calculando..." : "Calcular"}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Tiers de precios:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    1-10 empleados: Tarifa mínima + precio por licencia
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    11-49 empleados: Solo precio por licencia
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    50-199 empleados: Precio reducido por volumen
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    200+ empleados: Mejor precio por licencia
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resultado del Cálculo
                </CardTitle>
                <CardDescription>
                  Tu estimación de costo mensual
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Costo mensual total</p>
                    <p className="text-4xl font-bold text-primary" data-testid="text-monthly-cost">
                      {formatCurrency(result.monthlyCost, result.currency)}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Empleados</span>
                      </div>
                      <span className="font-semibold" data-testid="text-employee-count">
                        {result.employeeCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Categoría</span>
                      <span className="font-semibold" data-testid="text-tier">
                        {getTierLabel(result.tier)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Precio por licencia</span>
                      <span className="font-semibold" data-testid="text-price-per-license">
                        {formatCurrency(result.pricePerLicense, result.currency)}
                      </span>
                    </div>

                    {result.minimumFee > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">Tarifa mínima aplicada</span>
                        <span className="font-semibold" data-testid="text-minimum-fee">
                          {formatCurrency(result.minimumFee, result.currency)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Costo efectivo por empleado</span>
                      </div>
                      <span className="font-semibold text-green-600" data-testid="text-cost-per-employee">
                        {formatCurrency(result.costPerEmployee, result.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    {user?.companyId ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => checkoutMutation.mutate(result.employeeCount)}
                        disabled={checkoutMutation.isPending}
                        data-testid="button-subscribe"
                      >
                        {checkoutMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Suscribirse Ahora
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        <p>Inicie sesión para suscribirse</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
