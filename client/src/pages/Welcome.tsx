import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { 
  Shield, 
  Users, 
  GraduationCap, 
  AlertTriangle, 
  ClipboardCheck, 
  FileText, 
  FileCheck,
  Building2,
  Check,
  CheckCircle,
  Sparkles,
  Rocket,
  UserCircle,
  Factory,
  Building,
  ShieldCheck,
  LogIn,
  Calculator,
  TrendingDown,
  Loader2
} from "lucide-react";
import { ColombianFlag } from "@/components/ColombianFlag";
import { MinisterioFechasCard, MinisterioFechasBanner } from "@/components/MinisterioFechasCard";
import { useToast } from "@/hooks/use-toast";

const PRICE_PER_WORKER = 26000; // $26,000 COP por trabajador

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
    <Card className="border-primary/20 shadow-lg max-w-4xl mx-auto mb-12">
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
                      document.getElementById('cards-planes')?.scrollIntoView({ 
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

const features = [
  {
    icon: Users,
    title: "Gestión de trabajadores y contratos",
    description: "Administra información completa de empleados, contratos y afiliaciones a seguridad social."
  },
  {
    icon: GraduationCap,
    title: "Capacitaciones con asistente inteligente",
    description: "50+ temas predefinidos con generación automática de contenido y seguimiento de asistencia."
  },
  {
    icon: AlertTriangle,
    title: "Matriz IPERC con metodología GTC-45",
    description: "Identificación de peligros y evaluación de riesgos siguiendo la guía técnica colombiana."
  },
  {
    icon: ClipboardCheck,
    title: "Inspecciones de seguridad",
    description: "20+ tipos de inspecciones con checklists predefinidos y seguimiento de hallazgos."
  },
  {
    icon: FileText,
    title: "Registro de accidentes e incidentes",
    description: "Investigación completa según metodología FURAT con análisis de causas y medidas correctivas."
  },
  {
    icon: Shield,
    title: "Políticas SST automatizadas",
    description: "Generación automática de políticas de seguridad y salud en el trabajo actualizadas."
  },
  {
    icon: UserCircle,
    title: "Portal de empleados",
    description: "Acceso para trabajadores a sus capacitaciones, documentos y reportes personales."
  }
];

const plans = [
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
      "Gestión básica de documentos",
      "Capacitaciones esenciales",
      "Inspecciones básicas",
      "Alertas de fechas Ministerio",
      "Soporte por email"
    ]
  },
  {
    id: "pequena",
    name: "Pequeña Empresa",
    riskInfo: "Riesgo I-III",
    icon: Rocket,
    description: "Empresas de 11 a 49 trabajadores",
    minWorkers: 11,
    maxWorkers: 49,
    pricePerWorker: 24000,
    minFee: null,
    standards: 21,
    standardsLabel: "21 estándares",
    features: [
      "11 a 49 trabajadores",
      "Todos los niveles de riesgo",
      "21 estándares completos",
      "Matriz IPERC avanzada",
      "Programa de capacitación anual",
      "Indicadores de gestión",
      "Alertas automáticas Ministerio",
      "Soporte prioritario"
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
      "Cualquier nivel de riesgo",
      "61 estándares completos",
      "Auditorías internas SST",
      "Revisión por dirección",
      "Tableros ejecutivos PHVA",
      "Generación automática informes",
      "Ejecutivo de cuenta personal"
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
      "PESV completo incluido",
      "API de integración (próximamente)",
      "SLA garantizado 99.9%",
      "Capacitación personalizada",
      "Ejecutivo de cuenta personal",
      "Soporte 24/7"
    ]
  }
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/85">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Top Navigation Bar */}
        <div className="relative z-10 container mx-auto px-6 py-4">
          <div className="flex justify-end items-center gap-3">
            <Button 
              asChild 
              variant="ghost" 
              className="text-white hover:bg-white/10 hover:text-white"
              data-testid="button-login-header"
            >
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Content - Centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="container mx-auto px-6 py-8 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              {/* Bandera y Badge de Colombia */}
              <div className="flex flex-col items-center gap-2 mb-8">
                <div 
                  className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
                  data-testid="badge-hero"
                >
                  <ColombianFlag width={28} height={19} className="shadow-sm rounded-sm" />
                  <span className="text-white font-semibold text-lg">Sistema Inteligente SST</span>
                </div>
                <p className="text-white/70 text-sm">
                  Uso autorizado de símbolos patrios - Decreto 1967/1991, Art. 13
                </p>
              </div>
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
                data-testid="text-hero-title"
              >
                Sistema de Gestión SG-SST
              </h1>
              
              <p 
                className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto"
                data-testid="text-hero-subtitle"
              >
                Plataforma diseñada para la gestión del Sistema de Seguridad y Salud en el Trabajo (SG-SST) en empresas colombianas
              </p>

              {/* Compliance Checklist - All Laws */}
              <div className="inline-flex flex-col items-start gap-3 mb-10">
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Resolución 0312 de 2019</strong> <span className="text-white/70">(Estándares Mínimos SST)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Decreto 1072 de 2015</strong> <span className="text-white/70">(Decreto Único Reglamentario)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Ciclo PHVA</strong> <span className="text-white/70">(Planear-Hacer-Verificar-Actuar)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Clasificación de empresas</strong> <span className="text-white/70">según número de trabajadores</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Ley 1581 de 2012</strong> <span className="text-white/70">(Habeas Data) y GDPR</span></span>
                </div>
              </div>

              {/* Certification Badges */}
              <div className="flex flex-wrap justify-center gap-12 mb-10">
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="w-10 h-10 text-white/80" />
                  <span className="text-white font-bold text-xl">100%</span>
                  <span className="text-white/70 text-sm">Cumplimiento</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="w-10 h-10 text-white/80" />
                  <span className="text-white font-bold text-xl">Certificable</span>
                  <span className="text-white/70 text-sm">ISO 45001:2018</span>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 50L48 45.7C96 41.3 192 32.7 288 30.8C384 29 480 34 576 41.5C672 49 768 59 864 60.8C960 62.7 1056 56.3 1152 51.7C1248 47 1344 44 1392 42.5L1440 41V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" 
              className="fill-background"
            />
          </svg>
        </div>
      </section>

    </div>
  );
}
