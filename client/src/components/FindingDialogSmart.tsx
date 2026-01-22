import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { adaptFindingPayload } from "@/lib/finding-payload-adapter";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Shield, Wrench } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { AccidentInvestigation, Worker } from "@shared/schema";

const FINDING_TYPES = [
  { value: "inmediata_acto", label: "Causa Inmediata - Acto Inseguro", icon: AlertTriangle, color: "text-red-600" },
  { value: "inmediata_condicion", label: "Causa Inmediata - Condición Insegura", icon: Shield, color: "text-orange-600" },
  { value: "basica_personal", label: "Causa Básica - Factor Personal", icon: Lightbulb, color: "text-blue-600" },
  { value: "basica_trabajo", label: "Causa Básica - Factor del Trabajo", icon: Wrench, color: "text-purple-600" },
  { value: "raiz", label: "Causa Raíz", icon: Sparkles, color: "text-emerald-600" },
];

const IMMEDIATE_ACT_CAUSES = [
  { value: "operar_sin_autorizacion", label: "Operar sin autorización", suggestion: "Implementar sistema de permisos de trabajo y verificación de autorizaciones antes de operar equipos o realizar tareas críticas" },
  { value: "no_uso_epp", label: "No usar equipo de protección personal", suggestion: "Reforzar programa de uso obligatorio de EPP, realizar inspecciones diarias y capacitar sobre riesgos específicos" },
  { value: "velocidad_inadecuada", label: "Velocidad inadecuada", suggestion: "Establecer límites de velocidad señalizados y controles de velocidad en áreas de trabajo" },
  { value: "no_seguir_procedimiento", label: "No seguir procedimiento establecido", suggestion: "Revisar y socializar procedimientos, implementar listas de verificación y supervisión directa" },
  { value: "posicion_inadecuada", label: "Posición inadecuada para la tarea", suggestion: "Capacitar en ergonomía y posturas seguras, adecuar estaciones de trabajo" },
  { value: "levantar_peso_incorrecto", label: "Levantamiento incorrecto de cargas", suggestion: "Capacitar en manipulación manual de cargas, proveer ayudas mecánicas cuando sea necesario" },
  { value: "distraccion", label: "Distracción durante la tarea", suggestion: "Eliminar fuentes de distracción, establecer zonas de concentración y pausas programadas" },
  { value: "fatiga", label: "Fatiga del trabajador", suggestion: "Revisar turnos de trabajo, implementar pausas activas y rotación de tareas" },
];

const CONDITION_CAUSES = [
  { value: "proteccion_inadecuada", label: "Protecciones inadecuadas o inexistentes", suggestion: "Instalar guardas de seguridad y dispositivos de protección en equipos y maquinaria" },
  { value: "herramienta_defectuosa", label: "Herramientas o equipos defectuosos", suggestion: "Implementar programa de mantenimiento preventivo y reemplazo oportuno de herramientas" },
  { value: "orden_limpieza", label: "Falta de orden y limpieza", suggestion: "Implementar metodología 5S y establecer rutinas de orden y aseo en cada turno" },
  { value: "iluminacion_deficiente", label: "Iluminación deficiente", suggestion: "Realizar estudio de iluminación y adecuar niveles según normativa técnica colombiana" },
  { value: "ventilacion_inadecuada", label: "Ventilación inadecuada", suggestion: "Instalar sistemas de ventilación natural o mecánica según requerimientos del área" },
  { value: "espacio_reducido", label: "Espacio de trabajo reducido", suggestion: "Reorganizar layout del área de trabajo, demarcar zonas y optimizar flujos de circulación" },
  { value: "senalizacion_deficiente", label: "Señalización deficiente o inexistente", suggestion: "Instalar señalización según NTC 1461, capacitar sobre significado de señales" },
  { value: "piso_resbaloso", label: "Piso resbaloso o en mal estado", suggestion: "Aplicar tratamiento antideslizante, reparar superficies dañadas, señalizar áreas húmedas" },
];

const BASIC_PERSONAL_CAUSES = [
  { value: "falta_conocimiento", label: "Falta de conocimiento o capacitación", suggestion: "Diseñar programa de capacitación específico para la tarea, verificar competencias" },
  { value: "falta_habilidad", label: "Falta de habilidad para la tarea", suggestion: "Implementar programa de entrenamiento práctico con supervisión hasta alcanzar competencia" },
  { value: "motivacion_inadecuada", label: "Motivación inadecuada", suggestion: "Revisar programa de incentivos, mejorar comunicación sobre importancia de seguridad" },
  { value: "estres_tension", label: "Estrés o tensión", suggestion: "Implementar programa de vigilancia de riesgo psicosocial, proveer apoyo psicológico" },
  { value: "problemas_salud", label: "Problemas de salud física o mental", suggestion: "Realizar exámenes médicos periódicos, adaptar puesto de trabajo según recomendaciones" },
  { value: "fatiga_cansancio", label: "Fatiga o cansancio", suggestion: "Revisar carga laboral y turnos, implementar pausas obligatorias y monitoreo de fatiga" },
];

const BASIC_WORK_CAUSES = [
  { value: "supervision_inadecuada", label: "Supervisión inadecuada", suggestion: "Reforzar competencias de supervisores, establecer ratios adecuados supervisor/trabajador" },
  { value: "liderazgo_deficiente", label: "Liderazgo deficiente", suggestion: "Capacitar líderes en gestión SST, establecer responsabilidades claras y rendición de cuentas" },
  { value: "ingenieria_inadecuada", label: "Ingeniería inadecuada", suggestion: "Realizar análisis de ingeniería del puesto de trabajo, implementar controles técnicos" },
  { value: "herramientas_inadecuadas", label: "Herramientas o equipos inadecuados", suggestion: "Evaluar y adquirir herramientas apropiadas para cada tarea, capacitar en su uso" },
  { value: "mantenimiento_deficiente", label: "Mantenimiento deficiente", suggestion: "Fortalecer programa de mantenimiento preventivo, establecer indicadores de cumplimiento" },
  { value: "comunicacion_deficiente", label: "Comunicación deficiente", suggestion: "Establecer canales de comunicación efectivos, implementar reuniones de seguridad" },
  { value: "procedimientos_ausentes", label: "Procedimientos ausentes o inadecuados", suggestion: "Desarrollar o actualizar procedimientos de trabajo seguro, socializar y verificar cumplimiento" },
];

const findingFormSchema = z.object({
  findingType: z.string().min(1, "Por favor seleccione el tipo de hallazgo"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  correctiveAction: z.string().min(5, "La acción correctiva debe tener al menos 5 caracteres"),
  responsibleName: z.string().min(1, "Por favor ingrese el nombre del responsable"),
  responsibleArea: z.string().optional(),
  dueDate: z.string().min(1, "Por favor seleccione la fecha límite"),
});

type FindingFormData = z.infer<typeof findingFormSchema>;

interface SmartSuggestion {
  type: string;
  typeLabel: string;
  cause: string;
  causeLabel: string;
  description: string;
  correctiveAction: string;
  icon: any;
  color: string;
  priority: "alta" | "media" | "baja";
}

interface FindingDialogSmartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investigationId: string | null;
  investigation: AccidentInvestigation | null;
  workers: Worker[];
}

export function FindingDialogSmart({ 
  open, 
  onOpenChange, 
  investigationId, 
  investigation,
  workers 
}: FindingDialogSmartProps) {
  const { toast } = useToast();
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  const findingForm = useForm<FindingFormData>({
    resolver: zodResolver(findingFormSchema),
    defaultValues: {
      findingType: "",
      description: "",
      correctiveAction: "",
      responsibleName: "",
      responsibleArea: "",
      dueDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    },
  });

  const smartSuggestions = useMemo<SmartSuggestion[]>(() => {
    if (!investigation) return [];
    
    const suggestions: SmartSuggestion[] = [];
    
    const immediateActCauses = (investigation.immediateActCauses as string[]) || [];
    const immediateConditionCauses = (investigation.immediateConditionCauses as string[]) || [];
    const basicPersonalCauses = (investigation.basicPersonalCauses as string[]) || [];
    const basicWorkCauses = (investigation.basicWorkCauses as string[]) || [];
    
    immediateActCauses.forEach(causeValue => {
      const causeData = IMMEDIATE_ACT_CAUSES.find(c => c.value === causeValue);
      if (causeData) {
        suggestions.push({
          type: "inmediata_acto",
          typeLabel: "Causa Inmediata - Acto Inseguro",
          cause: causeValue,
          causeLabel: causeData.label,
          description: `Se identificó: ${causeData.label.toLowerCase()}`,
          correctiveAction: causeData.suggestion,
          icon: AlertTriangle,
          color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
          priority: "alta"
        });
      }
    });

    immediateConditionCauses.forEach(causeValue => {
      const causeData = CONDITION_CAUSES.find(c => c.value === causeValue);
      if (causeData) {
        suggestions.push({
          type: "inmediata_condicion",
          typeLabel: "Causa Inmediata - Condición Insegura",
          cause: causeValue,
          causeLabel: causeData.label,
          description: `Se detectó: ${causeData.label.toLowerCase()}`,
          correctiveAction: causeData.suggestion,
          icon: Shield,
          color: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
          priority: "alta"
        });
      }
    });

    basicPersonalCauses.forEach(causeValue => {
      const causeData = BASIC_PERSONAL_CAUSES.find(c => c.value === causeValue);
      if (causeData) {
        suggestions.push({
          type: "basica_personal",
          typeLabel: "Causa Básica - Factor Personal",
          cause: causeValue,
          causeLabel: causeData.label,
          description: `Factor personal identificado: ${causeData.label.toLowerCase()}`,
          correctiveAction: causeData.suggestion,
          icon: Lightbulb,
          color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
          priority: "media"
        });
      }
    });

    basicWorkCauses.forEach(causeValue => {
      const causeData = BASIC_WORK_CAUSES.find(c => c.value === causeValue);
      if (causeData) {
        suggestions.push({
          type: "basica_trabajo",
          typeLabel: "Causa Básica - Factor del Trabajo",
          cause: causeValue,
          causeLabel: causeData.label,
          description: `Factor del trabajo identificado: ${causeData.label.toLowerCase()}`,
          correctiveAction: causeData.suggestion,
          icon: Wrench,
          color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
          priority: "media"
        });
      }
    });

    if (investigation.rootCause && investigation.rootCause.trim().length > 0) {
      suggestions.push({
        type: "raiz",
        typeLabel: "Causa Raíz",
        cause: "root_cause",
        causeLabel: "Causa Raíz Identificada",
        description: investigation.rootCause,
        correctiveAction: "Implementar acciones correctivas que eliminen la causa raíz identificada",
        icon: Sparkles,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
        priority: "alta"
      });
    }

    const priorityOrder = { "alta": 0, "media": 1, "baja": 2 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [investigation]);

  const applySuggestion = (suggestion: SmartSuggestion) => {
    findingForm.setValue("findingType", suggestion.type);
    findingForm.setValue("description", suggestion.description);
    findingForm.setValue("correctiveAction", suggestion.correctiveAction);
    
    toast({
      title: "Sugerencia aplicada",
      description: "Los campos se han llenado automáticamente. Puedes editarlos según sea necesario.",
    });
  };

  const createFindingMutation = useMutation({
    mutationFn: async (data: FindingFormData & { investigationId: string }) => {
      const { investigationId, ...rest } = data;
      // Use adapter to ensure both description and finding_description are populated
      const adaptedPayload = adaptFindingPayload(rest);
      const res = await apiRequest("POST", `/api/investigations/${investigationId}/findings`, adaptedPayload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      onOpenChange(false);
      findingForm.reset();
      toast({
        title: "Hallazgo agregado",
        description: "El hallazgo se ha registrado exitosamente",
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

  const handleSubmit = (data: FindingFormData) => {
    if (!investigationId) return;
    createFindingMutation.mutate({ ...data, investigationId });
  };

  useEffect(() => {
    if (open) {
      findingForm.reset();
      setSuggestionsOpen(true);
    }
  }, [open]);

  const hasSuggestions = smartSuggestions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Agregar Hallazgo Inteligente
          </DialogTitle>
          <DialogDescription>
            Registre los hallazgos y acciones correctivas de la investigación
          </DialogDescription>
        </DialogHeader>

        {hasSuggestions && (
          <Collapsible open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">
                    Sugerencias basadas en la investigación ({smartSuggestions.length})
                  </span>
                </div>
                {suggestionsOpen ? (
                  <ChevronUp className="h-4 w-4 text-amber-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-amber-600" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-2">
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Haz clic en una sugerencia para llenar automáticamente el formulario:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {smartSuggestions.map((suggestion, idx) => (
                    <Card 
                      key={idx} 
                      className={`cursor-pointer hover:shadow-md transition-shadow border ${suggestion.color}`}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <suggestion.icon className={`h-5 w-5 mt-0.5 ${suggestion.color.split(' ')[0]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{suggestion.causeLabel}</span>
                              <Badge variant={suggestion.priority === "alta" ? "destructive" : "secondary"} className="text-xs">
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {suggestion.correctiveAction}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {!hasSuggestions && investigation && (
          <div className="p-4 bg-muted/50 rounded-lg border text-center">
            <p className="text-sm text-muted-foreground">
              No se encontraron causas identificadas en la investigación inicial.
              Puede agregar hallazgos manualmente a continuación.
            </p>
          </div>
        )}

        <Form {...findingForm}>
          <form onSubmit={findingForm.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={findingForm.control}
              name="findingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Hallazgo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-finding-type-smart">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FINDING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={`h-4 w-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={findingForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Hallazgo *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describa el hallazgo identificado..." 
                      data-testid="textarea-finding-desc-smart"
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={findingForm.control}
              name="correctiveAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acción Correctiva *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describa la acción correctiva propuesta..." 
                      data-testid="textarea-corrective-action-smart"
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={findingForm.control}
                name="responsibleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable *</FormLabel>
                    <Select 
                      onValueChange={(workerId) => {
                        const worker = workers.find(w => String(w.id) === workerId);
                        if (worker) {
                          field.onChange(worker.name || "");
                          findingForm.setValue("responsibleArea", worker.department || "");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-finding-responsible-smart">
                          <SelectValue placeholder={field.value || "Seleccionar responsable"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workers.filter(w => w.status === "activo").map((worker) => (
                          <SelectItem key={worker.id} value={String(worker.id)}>
                            {worker.name} - {worker.position || "Sin cargo"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={findingForm.control}
                name="responsibleArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Área o departamento" 
                        data-testid="input-finding-area-smart" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={findingForm.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Límite *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-finding-due-date-smart" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createFindingMutation.isPending}
                data-testid="button-submit-finding-smart"
              >
                {createFindingMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Agregar Hallazgo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
