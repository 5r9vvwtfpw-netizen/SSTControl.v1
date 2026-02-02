/**
 * Ejemplo de uso del sistema de Formularios Inteligentes PESV
 * 
 * Este componente demuestra cómo integrar el auto-llenado de datos
 * en los formularios del ciclo PESV sin modificar los existentes.
 * 
 * Patrón de integración:
 * 1. Importar usePesvStepPrefill con el código del paso (P01, H02, etc.)
 * 2. Usar SmartPrefillBanner para mostrar campos detectados
 * 3. Aplicar defaultValues al formulario con useEffect
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePesvStepPrefill } from "@/hooks/usePesvStepPrefill";
import { SmartPrefillBanner, SmartPrefillBannerSkeleton } from "./SmartPrefillBanner";

const diagnosticoPesvSchema = z.object({
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  nit: z.string().min(1, "El NIT es requerido"),
  actividadEconomica: z.string().optional(),
  totalVehiculos: z.coerce.number().min(0, "Debe ser 0 o mayor"),
  vehiculosActivos: z.coerce.number().min(0, "Debe ser 0 o mayor"),
  totalConductores: z.coerce.number().min(0, "Debe ser 0 o mayor"),
  conductoresActivos: z.coerce.number().min(0, "Debe ser 0 o mayor"),
  totalTrabajadores: z.coerce.number().min(0, "Debe ser 0 o mayor"),
});

type DiagnosticoPesvFormData = z.infer<typeof diagnosticoPesvSchema>;

export function PesvSmartFormExample() {
  const stepCode = "P03";
  
  const {
    isLoading,
    prefillFields,
    defaultValues,
    rawData,
  } = usePesvStepPrefill(stepCode);

  const form = useForm<DiagnosticoPesvFormData>({
    resolver: zodResolver(diagnosticoPesvSchema),
    defaultValues: {
      nombreEmpresa: "",
      nit: "",
      actividadEconomica: "",
      totalVehiculos: 0,
      vehiculosActivos: 0,
      totalConductores: 0,
      conductoresActivos: 0,
      totalTrabajadores: 0,
    },
  });

  useEffect(() => {
    if (!isLoading && Object.keys(defaultValues).length > 0) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (key in form.getValues()) {
          form.setValue(key as keyof DiagnosticoPesvFormData, value as never, { 
            shouldValidate: true 
          });
        }
      });
    }
  }, [isLoading, defaultValues, form]);

  const handleApplyAll = () => {
    Object.entries(defaultValues).forEach(([key, value]) => {
      if (key in form.getValues()) {
        form.setValue(key as keyof DiagnosticoPesvFormData, value as never, {
          shouldValidate: true
        });
      }
    });
  };

  const handleClearAll = () => {
    form.reset();
  };

  const onSubmit = (data: DiagnosticoPesvFormData) => {
    console.log("Datos del diagnóstico PESV:", data);
  };

  return (
    <Card className="max-w-2xl mx-auto" data-testid="pesv-smart-form-example">
      <CardHeader>
        <CardTitle>P03 - Diagnóstico de la organización</CardTitle>
        <CardDescription>
          Este formulario se auto-llena con datos existentes del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SmartPrefillBannerSkeleton />
        ) : (
          <SmartPrefillBanner
            stepCode={stepCode}
            stepName="Diagnóstico de la organización"
            fields={prefillFields}
            onApplyAll={handleApplyAll}
            onClearAll={handleClearAll}
          />
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombreEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la empresa</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-nombre-empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIT</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-nit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="actividadEconomica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividad económica</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-actividad-economica" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalVehiculos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de vehículos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        data-testid="input-total-vehiculos" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehiculosActivos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículos activos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        data-testid="input-vehiculos-activos" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalConductores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de conductores</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        data-testid="input-total-conductores" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conductoresActivos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductores activos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        data-testid="input-conductores-activos" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalTrabajadores"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total de trabajadores</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      data-testid="input-total-trabajadores" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button type="submit" data-testid="button-submit-diagnostico">
                Guardar diagnóstico
              </Button>
            </div>
          </form>
        </Form>

        {rawData.companyData && (
          <div className="mt-6 p-4 rounded-md bg-muted text-sm">
            <p className="font-medium mb-2">Datos disponibles para auto-llenado:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Empresa: {rawData.companyData.name}</li>
              <li>Vehículos: {rawData.vehicleStats?.total || 0} total, {rawData.vehicleStats?.active || 0} activos</li>
              <li>Conductores: {rawData.driverStats?.total || 0} total, {rawData.driverStats?.active || 0} activos</li>
              <li>Trabajadores: {rawData.workersList.length}</li>
              <li>Objetivos SST: {rawData.sstObjectives.length}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
