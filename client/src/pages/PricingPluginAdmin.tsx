import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PricingConfigData {
  minFeeSmall: number;
  price1To10: number;
  price11To49: number;
  price50To199: number;
  price200Plus: number;
  currency: string;
}

const pricingSchema = z.object({
  minFeeSmall: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  price1To10: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  price11To49: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  price50To199: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  price200Plus: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  currency: z.string().min(1, "Seleccione una moneda"),
});

type PricingFormValues = z.infer<typeof pricingSchema>;

export default function PricingPluginAdmin() {
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<PricingConfigData>({
    queryKey: ["/api/pricing-plugin/admin/pricing"],
  });

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      minFeeSmall: 0,
      price1To10: 0,
      price11To49: 0,
      price50To199: 0,
      price200Plus: 0,
      currency: "COP",
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        minFeeSmall: config.minFeeSmall,
        price1To10: config.price1To10,
        price11To49: config.price11To49,
        price50To199: config.price50To199,
        price200Plus: config.price200Plus,
        currency: config.currency,
      });
    }
  }, [config, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: PricingFormValues) => {
      const res = await apiRequest("POST", "/api/pricing-plugin/admin/pricing", {
        min_fee_small: values.minFeeSmall,
        price_1_10: values.price1To10,
        price_11_49: values.price11To49,
        price_50_199: values.price50To199,
        price_200_plus: values.price200Plus,
        currency: values.currency,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-plugin/admin/pricing"] });
      toast({
        title: "Configuración guardada",
        description: "Los precios han sido actualizados exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PricingFormValues) => {
    saveMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configuración de Precios</h1>
            <p className="text-muted-foreground">
              Configure los parámetros de precios por tier de empleados
            </p>
          </div>
          <Link href="/pricing-plugin/calculator">
            <Button variant="outline">
              Ver Calculadora
            </Button>
          </Link>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Parámetros Globales
                </CardTitle>
                <CardDescription>
                  Estos valores se aplican a todos los clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Seleccione moneda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                          <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tier 1-10 Empleados
                </CardTitle>
                <CardDescription>
                  Empresas pequeñas pagan tarifa mínima + precio por licencia
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="minFeeSmall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa mínima mensual</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field}
                          data-testid="input-min-fee-small"
                        />
                      </FormControl>
                      <FormDescription>
                        Monto fijo que se cobra además del precio por licencia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price1To10"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio por licencia</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field}
                          data-testid="input-price-1-10"
                        />
                      </FormControl>
                      <FormDescription>
                        Precio por cada empleado en este tier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precios por Tier (11+ empleados)
                </CardTitle>
                <CardDescription>
                  Solo se cobra precio por licencia, sin tarifa mínima
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price11To49"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>11-49 empleados</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field}
                          data-testid="input-price-11-49"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price50To199"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>50-199 empleados</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field}
                          data-testid="input-price-50-199"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price200Plus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>200+ empleados</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field}
                          data-testid="input-price-200-plus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                data-testid="button-save-pricing"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
