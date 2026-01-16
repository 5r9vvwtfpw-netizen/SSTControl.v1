import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Shield, TrendingUp, Building2, Rocket, Building, Factory, Calculator, Users, TrendingDown, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { ColombianFlag } from "@/components/ColombianFlag";
import { MinisterioFechasCard } from "@/components/MinisterioFechasCard";
import { useToast } from "@/hooks/use-toast";

interface PricingResult {
  tier: string;
  employeeCount: number;
  pricePerLicense: number;
  minimumFee: number;
  monthlyCost: number;
  costPerEmployee: number;
  currency: string;
}

const pricingTiers = [
  { tier: "1-10", label: "Microempresa", employees: "1-10", pricePerWorker: 26000, minFee: 60000 },
  { tier: "11-49", label: "Pequeña Empresa", employees: "11-49", pricePerWorker: 24000, minFee: null },
  { tier: "50-199", label: "Mediana Empresa", employees: "50-199", pricePerWorker: 22000, minFee: null },
  { tier: "200+", label: "Gran Empresa", employees: "200+", pricePerWorker: 20000, minFee: null },
];

type PlanTier = {
  id: string;
  name: string;
  riskInfo: string;
  icon: typeof Building2;
  description: string;
  minWorkers: number;
  maxWorkers: number | null;
  pricePerWorker: number;
  minFee: number | null;
  standards: number;
  standardsLabel: string;
  isPopular?: boolean;
  features: string[];
};

const plans: PlanTier[] = [
  {
    id: "microempresa",
    name: "Microempresa",
    riskInfo: "Riesgo I-III",
    icon: Building2,
    description: "Empresas de 1 a 10 trabajadores",
    minWorkers: 1,
    maxWorkers: 10,
    pricePerWorker: 26000,
    minFee: 60000,
    standards: 7,
    standardsLabel: "7 estándares mínimos",
    features: [
      "1 a 10 trabajadores",
      "Niveles de riesgo I, II, III",
      "7 estándares mínimos Res. 0312",
      "Gestión de trabajadores y contratos",
      "Capacitaciones con asistente IA",
      "Inspecciones con checklists",
      "Registro de accidentes",
      "Matriz IPERC básica",
      "Políticas SST automatizadas",
      "Portal de empleados",
      "Alertas Ministerio de Trabajo",
      "Almacenamiento 5GB",
      "Soporte por email"
    ]
  },
  {
    id: "pequena",
    name: "Pequeña Empresa",
    riskInfo: "Riesgo I-III",
    icon: Rocket,
    description: "Empresas de 11 a 50 trabajadores",
    minWorkers: 11,
    maxWorkers: 49,
    pricePerWorker: 24000,
    minFee: null,
    standards: 21,
    standardsLabel: "21 estándares",
    isPopular: true,
    features: [
      "11 a 50 trabajadores",
      "Niveles de riesgo I, II, III",
      "21 estándares Res. 0312",
      "Todo lo del plan Microempresa",
      "Matriz IPERC avanzada GTC-45",
      "Programa de capacitación anual",
      "Indicadores de gestión SST",
      "Auditorías internas",
      "Gestión de cambios",
      "Evaluación de proveedores",
      "Almacenamiento 20GB",
      "Soporte prioritario 24h"
    ]
  },
  {
    id: "mediana",
    name: "Mediana Empresa",
    riskInfo: "Riesgo I-V",
    icon: Building,
    description: "Empresas de 50 a 199 trabajadores",
    minWorkers: 50,
    maxWorkers: 199,
    pricePerWorker: 22000,
    minFee: null,
    standards: 61,
    standardsLabel: "61 estándares completos",
    features: [
      "50 a 199 trabajadores",
      "Cualquier nivel de riesgo (I-V)",
      "61 estándares Res. 0312",
      "Todo lo del plan Pequeña Empresa",
      "Revisión por dirección ISO 45001",
      "Tableros ejecutivos PHVA",
      "Matriz Legal actualizada",
      "Objetivos e Indicadores SST",
      "Comunicación SST integrada",
      "Generación automática informes",
      "Almacenamiento 50GB",
      "Gerente de cuenta dedicado"
    ]
  },
  {
    id: "grande",
    name: "Gran Empresa",
    riskInfo: "Riesgo I-V",
    icon: Factory,
    description: "Empresas de 200+ trabajadores",
    minWorkers: 200,
    maxWorkers: null,
    pricePerWorker: 20000,
    minFee: null,
    standards: 61,
    standardsLabel: "61 estándares completos",
    features: [
      "200+ trabajadores",
      "Multi-sede / Multi-NIT",
      "61 estándares completos",
      "Todo lo del plan Mediana Empresa",
      "PESV completo incluido",
      "API REST para integraciones",
      "White-label (marca propia)",
      "SSO (Single Sign-On)",
      "SLA garantizado 99.9%",
      "Almacenamiento ilimitado",
      "Capacitación personalizada",
      "Soporte 24/7"
    ]
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

function PriceCalculator() {
  const [employees, setEmployees] = useState<string>("");
  const [result, setResult] = useState<PricingResult | null>(null);
  const { toast } = useToast();

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

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "1-10": return "Microempresa (1-10 empleados)";
      case "11-49": return "Pequeña Empresa (11-49 empleados)";
      case "50-199": return "Mediana Empresa (50-199 empleados)";
      case "200+": return "Gran Empresa (200+ empleados)";
      default: return tier;
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
        <div className="flex justify-center mb-2">
          <Calculator className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Calculadora de Precios</CardTitle>
        <CardDescription>
          Ingresa el número de empleados para calcular tu costo mensual
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="calc-employees" className="text-base font-medium">Número de empleados</Label>
              <div className="flex gap-2">
                <Input
                  id="calc-employees"
                  type="number"
                  min="1"
                  placeholder="Ej: 25"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                  className="text-lg"
                  data-testid="input-calc-employees"
                />
                <Button 
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                  size="lg"
                  data-testid="button-calculate-price"
                >
                  {calculateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Calcular"
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium mb-3 text-sm">Tabla de Precios por Empleado:</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tier</th>
                    <th className="text-right py-2">Precio/Empleado</th>
                    <th className="text-right py-2">Tarifa Mín.</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier) => (
                    <tr key={tier.tier} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{tier.employees}</td>
                      <td className="text-right py-2 font-medium">{formatPrice(tier.pricePerWorker)}</td>
                      <td className="text-right py-2 text-muted-foreground">
                        {tier.minFee ? formatPrice(tier.minFee) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {result ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Costo mensual total</p>
                  <p className="text-4xl font-bold text-primary" data-testid="text-monthly-cost">
                    {formatPrice(result.monthlyCost)}
                  </p>
                </div>

                <div className="space-y-3">
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
                    <Badge variant="secondary" data-testid="text-tier">
                      {getTierLabel(result.tier)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Precio por empleado</span>
                    <span className="font-semibold" data-testid="text-price-per-license">
                      {formatPrice(result.pricePerLicense)}
                    </span>
                  </div>

                  {result.minimumFee > 0 && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <span className="text-sm">Tarifa mínima aplicada</span>
                      <span className="font-semibold text-amber-600" data-testid="text-minimum-fee">
                        {formatPrice(result.minimumFee)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Costo efectivo por empleado</span>
                    </div>
                    <span className="font-semibold text-green-600" data-testid="text-cost-per-employee">
                      {formatPrice(result.costPerEmployee)}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    size="lg" 
                    data-testid="button-start-trial-from-calc"
                    onClick={() => {
                      document.getElementById('planes-precios')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                  >
                    Comenzar Prueba Gratis de 14 Días
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Sin tarjeta de crédito requerida
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 bg-muted/30 rounded-lg">
                <div>
                  <Calculator className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Ingresa el número de empleados y presiona "Calcular" para ver tu precio personalizado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-3 bg-primary px-6 py-3 rounded-full">
              <ColombianFlag width={28} height={19} className="shadow-sm rounded-sm" />
              <span className="text-white font-semibold text-lg">Sistema Inteligente SST</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Uso autorizado de símbolos patrios - Decreto 1967/1991, Art. 13
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Planes de Suscripción SG-SST
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Solución completa de SG-SST para empresas colombianas.
            Cumplimiento garantizado de Resolución 0312/2019, Decreto 1072/2015 e ISO 45001:2018.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-xl font-bold text-primary">Desde {formatPrice(20000)}</span>
            <span className="text-muted-foreground">por trabajador/mes</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <PriceCalculator />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col hover-elevate ${
                  plan.isPopular ? 'border-primary border-2 shadow-lg' : ''
                }`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="shadow-md">
                      MÁS POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-8 h-8 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {plan.riskInfo}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground">Desde</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.minFee 
                          ? Math.max(plan.minFee, plan.minWorkers * plan.pricePerWorker)
                          : plan.minWorkers * plan.pricePerWorker
                        )}
                      </span>
                      <span className="text-muted-foreground text-sm">/mes</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPrice(plan.pricePerWorker)} por trabajador
                    </p>
                    {plan.minFee && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        Tarifa mínima: {formatPrice(plan.minFee)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      7 días de prueba gratis
                    </p>
                  </div>

                  <Badge variant="secondary" className="mb-4">
                    {plan.standardsLabel}
                  </Badge>

                  <div className="space-y-2">
                    {plan.features.slice(0, 8).map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2"
                        data-testid={`feature-${plan.id}-${idx}`}
                      >
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 8 && (
                      <p className="text-xs text-muted-foreground pl-6">
                        + {plan.features.length - 8} más...
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    asChild 
                    variant={plan.isPopular ? "default" : "outline"} 
                    className="w-full"
                    data-testid={`button-start-trial-${plan.id}`}
                  >
                    <Link href={`/auth?mode=register&plan=${plan.id}&workers=${plan.minWorkers}`}>
                      Comenzar Prueba Gratis
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Sin tarjeta de crédito requerida
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <MinisterioFechasCard compact />
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">¿Por qué elegir SST Colombia?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">70%</div>
                  <p className="text-sm text-muted-foreground">
                    Más económico que consultores tradicionales
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">20h</div>
                  <p className="text-sm text-muted-foreground">
                    Ahorro mensual en documentación
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">
                    Cumplimiento normativa colombiana
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">7</div>
                  <p className="text-sm text-muted-foreground">
                    Alertas automáticas Ministerio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <ColombianFlag width={24} height={16} />
              </div>
              <CardTitle className="text-xl">Comparación Rápida de Planes</CardTitle>
              <CardDescription>
                Según clasificación de la Resolución 0312 de 2019
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Característica</th>
                      <th className="text-center py-3 px-2">Microempresa</th>
                      <th className="text-center py-3 px-2 bg-primary/5">Pequeña</th>
                      <th className="text-center py-3 px-2">Mediana</th>
                      <th className="text-center py-3 px-2">Gran Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Trabajadores</td>
                      <td className="text-center py-3 px-2">1 - 10</td>
                      <td className="text-center py-3 px-2 bg-primary/5">11 - 49</td>
                      <td className="text-center py-3 px-2">50 - 199</td>
                      <td className="text-center py-3 px-2">200+</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Precio por empleado</td>
                      <td className="text-center py-3 px-2">{formatPrice(26000)}</td>
                      <td className="text-center py-3 px-2 bg-primary/5">{formatPrice(24000)}</td>
                      <td className="text-center py-3 px-2">{formatPrice(22000)}</td>
                      <td className="text-center py-3 px-2">{formatPrice(20000)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Tarifa mínima</td>
                      <td className="text-center py-3 px-2">{formatPrice(60000)}</td>
                      <td className="text-center py-3 px-2 bg-primary/5">-</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2">-</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Estándares Res. 0312</td>
                      <td className="text-center py-3 px-2">7</td>
                      <td className="text-center py-3 px-2 bg-primary/5">21</td>
                      <td className="text-center py-3 px-2">60</td>
                      <td className="text-center py-3 px-2">60+</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Auditorías Internas</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Tableros ejecutivos PHVA</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2 bg-primary/5">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">PESV Completo</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2 bg-primary/5">-</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-medium">SLA Garantizado</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2 bg-primary/5">-</td>
                      <td className="text-center py-3 px-2">-</td>
                      <td className="text-center py-3 px-2">99.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h2>
          <p className="text-muted-foreground mb-6">
            Todos nuestros planes incluyen soporte, actualizaciones normativas automáticas,
            alertas del Ministerio de Trabajo, y acceso completo durante el periodo de prueba gratuita.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/auth?mode=register">
                Comenzar Prueba Gratis
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/terminos-servicio">
                Ver Términos de Servicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
