import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, User, Tag, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { insertEnvironmentalMeasurementSchema, type InsertEnvironmentalMeasurement } from "@shared/schema";

// Schema for the enhanced form (without readonly fields)
const enhancedFormSchema = insertEnvironmentalMeasurementSchema;

// Legal limits configuration for Colombian regulations (Resolución 2400/1979, Decreto 1072/2015)
const LEGAL_LIMITS_BY_TYPE: Record<string, string> = {
  ruido: "85 dB (Res. 2400/1979)",
  iluminacion: "300-500 lux (oficinas) / 500-1000 lux (manufactura)",
  temperatura: "16-24°C",
  agente_quimico: "Según sustancia específica",
  material_particulado: "Según tipo de partícula",
  vibraciones: "Según Res. 2400/1979",
};

const MEASUREMENT_UNITS_BY_TYPE: Record<string, string> = {
  ruido: "dB",
  iluminacion: "lux",
  temperatura: "°C",
  agente_quimico: "mg/m³ o ppm",
  material_particulado: "mg/m³",
  vibraciones: "m/s²",
};

interface MedicionAmbientalFormEnhancedProps {
  onSubmit: (data: InsertEnvironmentalMeasurement) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

// Generate tracking number in format MA-YYYY-NNNN
const generateTrackingNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `MA-${year}-${randomNumber}`;
};

type EnhancedFormData = InsertEnvironmentalMeasurement;

export function MedicionAmbientalFormEnhanced({
  onSubmit,
  isLoading = false,
  onCancel,
}: MedicionAmbientalFormEnhancedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trackingNumber] = useState(generateTrackingNumber());
  const [createdAt] = useState(new Date().toISOString());
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<string>("ruido");

  const form = useForm<EnhancedFormData>({
    resolver: zodResolver(enhancedFormSchema),
    defaultValues: {
      measurementType: "ruido",
      area: "",
      measurementDate: new Date(),
      measuredBy: user?.fullName || "",
      valueNumeric: "",
      unit: MEASUREMENT_UNITS_BY_TYPE["ruido"],
      legalLimit: LEGAL_LIMITS_BY_TYPE["ruido"],
      status: "pendiente_analisis",
      observations: "",
    },
  });

  // Auto-fill legal limit and unit when measurement type changes
  useEffect(() => {
    if (selectedMeasurementType) {
      form.setValue("legalLimit", LEGAL_LIMITS_BY_TYPE[selectedMeasurementType] || "");
      form.setValue("unit", MEASUREMENT_UNITS_BY_TYPE[selectedMeasurementType] || "");
    }
  }, [selectedMeasurementType, form]);

  const handleSubmit = async (data: EnhancedFormData) => {
    try {
      // Add tracking number and creation info to observations for traceability
      const enhancedObservations = `[Trazabilidad: ${trackingNumber}]\n${data.observations || ""}`;
      
      await onSubmit({
        ...data,
        observations: enhancedObservations,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la medición",
        variant: "destructive",
      });
    }
  };

  const currentLegalLimit = LEGAL_LIMITS_BY_TYPE[selectedMeasurementType];
  const currentUnit = MEASUREMENT_UNITS_BY_TYPE[selectedMeasurementType];

  return (
    <div className="space-y-6">
      {/* Traceability Summary Card */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            Sistema de Trazabilidad Automática
          </CardTitle>
          <CardDescription>Identificación única y seguimiento de medición</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tracking Number */}
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Número de Seguimiento</p>
                <p className="font-mono font-bold text-sm">{trackingNumber}</p>
              </div>
            </div>

            {/* Created Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Fecha de Registro</p>
                <p className="font-semibold text-sm">
                  {new Date(createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Evaluator */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Evaluador Asignado</p>
                <p className="font-semibold text-sm truncate">
                  {user?.fullName || "Usuario del Sistema"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Measurement Type and Auto-filled Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipo de Medición y Normativa</CardTitle>
              <CardDescription>
                Los límites legales se cargan automáticamente según la normativa colombiana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="measurementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Medición *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedMeasurementType(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-measurement-type-enhanced">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ruido">Ruido Ocupacional</SelectItem>
                          <SelectItem value="iluminacion">Iluminación</SelectItem>
                          <SelectItem value="temperatura">Temperatura</SelectItem>
                          <SelectItem value="agente_quimico">Agente Químico</SelectItem>
                          <SelectItem value="material_particulado">Material Particulado</SelectItem>
                          <SelectItem value="vibraciones">Vibraciones</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área o Puesto de Trabajo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Sala de Máquinas, Oficina Administrativa"
                          {...field}
                          data-testid="input-area-enhanced"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Auto-filled Legal Limit Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                      Límite Legal Aplicable
                    </p>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mt-1">
                      {currentLegalLimit}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Unidad de Medida Estándar
                    </p>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-1">
                      {currentUnit}
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Measurement Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la Medición</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="measurementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Medición *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          onBlur={field.onBlur}
                          data-testid="input-measurement-date-enhanced" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valueNumeric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Medido</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Ej: 85.5"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || '')}
                          onBlur={field.onBlur}
                          data-testid="input-value-numeric-enhanced"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Unidad: {currentUnit}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="measuredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable de Medición *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre del técnico o evaluador"
                        {...field}
                        data-testid="input-measured-by-enhanced"
                      />
                    </FormControl>
                    <FormDescription className="text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Pre-cargado con usuario: {user?.fullName || "Sistema"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Status and Observations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evaluación y Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de la Medición</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status-enhanced">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="conforme">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Conforme
                          </div>
                        </SelectItem>
                        <SelectItem value="no_conforme">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            No Conforme
                          </div>
                        </SelectItem>
                        <SelectItem value="pendiente_analisis">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            Pendiente Análisis
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Condiciones ambientales, equipos utilizados, recomendaciones, acciones correctivas..."
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || '')}
                        onBlur={field.onBlur}
                        className="resize-none"
                        rows={4}
                        data-testid="input-observations-enhanced"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      El número de seguimiento se agregará automáticamente al registro
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Trazabilidad Automática Activada
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                  <li>Número de seguimiento único: {trackingNumber}</li>
                  <li>Límites legales pre-cargados según Resolución 2400/1979 y Decreto 1072/2015</li>
                  <li>Evaluador registrado: {user?.fullName || "Sistema"}</li>
                  <li>Timestamp de creación: {new Date(createdAt).toLocaleString("es-CO")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading} data-testid="button-submit-enhanced">
              {isLoading ? "Guardando..." : "Guardar Medición"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
