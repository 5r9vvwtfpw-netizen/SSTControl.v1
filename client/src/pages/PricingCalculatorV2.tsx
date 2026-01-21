import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Users, Shield, Check, TrendingDown, Building2, FileCheck, Gift, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type RiskLevel = "I" | "II" | "III" | "IV" | "V";

interface PricingV2Result {
  claseRiesgo: RiskLevel;
  trabajadores: number;
  tarifaPorTrabajador: number;
  costoTrabajadores: number;
  estandaresAplicables: number;
  tarifaPorEstandar: number;
  costoEstandares: number;
  costoMensualTotal: number;
  costoAnualTotal: number;
  costoPorTrabajador: number;
  incluye: {
    portalTrabajador: boolean;
    portalLicenciado: boolean;
    valorMercadoPortales: string;
  };
  ahorroEstimado: string;
  currency: string;
  descripcionRiesgo: string;
  ventajaCompetitiva: string[];
}

interface TarifasResponse {
  tarifasPorClaseRiesgo: Record<string, { tarifa: number; descripcion: string }>;
  tarifaPorEstandar: number;
  currency: string;
  estandaresSegunTamano: Record<string, { trabajadores: string; estandares: number }>;
  incluido: string[];
  ventajaCompetitiva: string;
}

const riskLevelLabels: Record<RiskLevel, { label: string; color: string }> = {
  I: { label: "Clase I - Mínimo", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  II: { label: "Clase II - Bajo", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  III: { label: "Clase III - Medio", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  IV: { label: "Clase IV - Alto", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  V: { label: "Clase V - Máximo", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function PricingCalculatorV2() {
  const [trabajadores, setTrabajadores] = useState<string>("");
  const [claseRiesgo, setClaseRiesgo] = useState<RiskLevel>("I");
  const [result, setResult] = useState<PricingV2Result | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: tarifas } = useQuery<TarifasResponse>({
    queryKey: ["/api/pricing-v2/tarifas"],
  });

  const calculateMutation = useMutation({
    mutationFn: async (params: { trabajadores: number; claseRiesgo: RiskLevel }) => {
      const res = await apiRequest("POST", "/api/pricing-v2/calculate", params);
      return res.json() as Promise<PricingV2Result>;
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
    const count = parseInt(trabajadores, 10);
    if (isNaN(count) || count < 1) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número válido de trabajadores (mínimo 1)",
        variant: "destructive",
      });
      return;
    }
    calculateMutation.mutate({ trabajadores: count, claseRiesgo });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="title-pricing-v2">
              Calculadora de Precios SST
            </h1>
            <p className="text-muted-foreground">
              Modelo basado en Riesgo ARL - Único en Colombia
            </p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Fórmula de Precio Transparente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono bg-background/80 p-4 rounded-lg text-center">
              <span className="text-primary font-bold">Precio</span> = (Trabajadores × Tarifa Riesgo) + (Estándares × $8,000)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div className="text-center p-2 bg-background/60 rounded">
                <p className="font-bold text-green-600">Clase I</p>
                <p>$26,000/trab</p>
              </div>
              <div className="text-center p-2 bg-background/60 rounded">
                <p className="font-bold text-blue-600">Clase II</p>
                <p>$24,000/trab</p>
              </div>
              <div className="text-center p-2 bg-background/60 rounded">
                <p className="font-bold text-yellow-600">Clase III</p>
                <p>$22,000/trab</p>
              </div>
              <div className="text-center p-2 bg-background/60 rounded">
                <p className="font-bold text-red-600">Clase IV-V</p>
                <p>$20,000/trab</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simula tu Inversión
              </CardTitle>
              <CardDescription>
                Ingresa los datos de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="trabajadores">Número de trabajadores</Label>
                <Input
                  id="trabajadores"
                  type="number"
                  min="1"
                  placeholder="Ej: 25"
                  value={trabajadores}
                  onChange={(e) => setTrabajadores(e.target.value)}
                  data-testid="input-trabajadores"
                />
              </div>

              <div className="space-y-2">
                <Label>Clase de Riesgo ARL</Label>
                <Select value={claseRiesgo} onValueChange={(v) => setClaseRiesgo(v as RiskLevel)}>
                  <SelectTrigger data-testid="select-clase-riesgo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Clase I - Riesgo Mínimo (Administrativo)</SelectItem>
                    <SelectItem value="II">Clase II - Riesgo Bajo (Comercio)</SelectItem>
                    <SelectItem value="III">Clase III - Riesgo Medio (Manufactura)</SelectItem>
                    <SelectItem value="IV">Clase IV - Riesgo Alto (Construcción)</SelectItem>
                    <SelectItem value="V">Clase V - Riesgo Máximo (Minería)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                data-testid="button-calculate"
              >
                {calculateMutation.isPending ? "Calculando..." : "Calcular Precio"}
              </Button>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Incluido sin costo adicional:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    Portal del Trabajador (valor $3k-$5k/usuario/mes)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    Portal del Licenciado SST (valor $150k-$300k/mes)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="shadow-lg border-primary/20" data-testid="card-result">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Tu Inversión Mensual
                </CardTitle>
                <CardDescription>{result.descripcionRiesgo}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Costo mensual total</p>
                    <p className="text-4xl font-bold text-primary" data-testid="text-costo-mensual">
                      {formatCurrency(result.costoMensualTotal)}
                    </p>
                    <Badge className={riskLevelLabels[result.claseRiesgo].color}>
                      {riskLevelLabels[result.claseRiesgo].label}
                    </Badge>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Trabajadores</span>
                      </div>
                      <span className="font-semibold">{result.trabajadores}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Costo por trabajadores</span>
                      <span className="font-semibold">
                        {result.trabajadores} × {formatCurrency(result.tarifaPorTrabajador)} = {formatCurrency(result.costoTrabajadores)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Estándares aplicables</span>
                      </div>
                      <span className="font-semibold">{result.estandaresAplicables}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Costo por estándares</span>
                      <span className="font-semibold">
                        {result.estandaresAplicables} × {formatCurrency(result.tarifaPorEstandar)} = {formatCurrency(result.costoEstandares)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Costo por trabajador</span>
                      </div>
                      <span className="font-semibold text-green-600" data-testid="text-costo-por-trabajador">
                        {formatCurrency(result.costoPorTrabajador)}
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {result.ahorroEstimado}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t text-center text-sm text-muted-foreground">
                    <p>Costo anual: <strong>{formatCurrency(result.costoAnualTotal)}</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {tarifas && (
          <Card>
            <CardHeader>
              <CardTitle>Estándares según tamaño de empresa</CardTitle>
              <CardDescription>Resolución 0312/2019</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="font-bold text-lg">Microempresa</p>
                  <p className="text-sm text-muted-foreground">1-10 trabajadores</p>
                  <p className="text-2xl font-bold text-primary mt-2">7 estándares</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="font-bold text-lg">Pequeña Empresa</p>
                  <p className="text-sm text-muted-foreground">11-50 trabajadores</p>
                  <p className="text-2xl font-bold text-primary mt-2">21 estándares</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="font-bold text-lg">Mediana/Grande</p>
                  <p className="text-sm text-muted-foreground">51+ trabajadores</p>
                  <p className="text-2xl font-bold text-primary mt-2">61 estándares</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
