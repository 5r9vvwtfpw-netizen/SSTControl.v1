import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPeligroIpercSchema, PeligroIperc } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useEffect } from "react";
import { peligrosGTC45Predefinidos, getPeligroByCodigo, clasificacionPeligroLabels } from "@/data/peligros-gtc45-predefinidos";

const defaultValuesByClasificacion = {
  biologico: {
    actividadProceso: "Manipulación de material biológico",
    fuenteGeneradora: "Agentes biológicos",
    ubicacion: "Área de trabajo"
  },
  fisico: {
    actividadProceso: "Operación de equipos",
    fuenteGeneradora: "Equipos y maquinaria",
    ubicacion: "Área de producción"
  },
  quimico: {
    actividadProceso: "Manipulación de sustancias químicas",
    fuenteGeneradora: "Sustancias químicas",
    ubicacion: "Área de almacenamiento/proceso"
  },
  psicosocial: {
    actividadProceso: "Actividades laborales",
    fuenteGeneradora: "Condiciones organizacionales",
    ubicacion: "Todas las áreas"
  },
  biomecanico: {
    actividadProceso: "Tareas repetitivas/posturas",
    fuenteGeneradora: "Puesto de trabajo",
    ubicacion: "Área administrativa/operativa"
  },
  condiciones_seguridad: {
    actividadProceso: "Operaciones generales",
    fuenteGeneradora: "Condiciones del lugar",
    ubicacion: "Instalaciones"
  },
  fenomenos_naturales: {
    actividadProceso: "Actividades en exteriores",
    fuenteGeneradora: "Fenómenos naturales",
    ubicacion: "Toda la empresa"
  }
};

const formSchema = insertPeligroIpercSchema.omit({
  matrizId: true,
  nivelRiesgo: true, // Se calcula automáticamente
  valorRiesgo: true, // Se calcula automáticamente
});

interface PeligroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrizId: string;
  peligro?: PeligroIperc | null;
  prefillValues?: Partial<z.infer<typeof formSchema>>;
}

export function PeligroDialog({ open, onOpenChange, matrizId, peligro, prefillValues }: PeligroDialogProps) {
  const { toast } = useToast();
  const [selectedPredefPeligro, setSelectedPredefPeligro] = useState("");
  const isEditing = !!peligro;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clasificacion: "fisico",
      descripcionPeligro: "",
      fuenteGeneradora: "",
      actividadProceso: "",
      ubicacion: "",
      numeroPersonasExpuestas: 1,
      tipoExposicion: "permanente",
      tiempoExposicion: "8 horas/día",
      efectosPosibles: "",
      parteCuerpoAfectada: "",
      nivelProbabilidad: "baja",
      nivelSeveridad: "ligeramente_danino",
      controlesExistentes: "",
      efectividadControlesExistentes: "media",
      requiereControles: 1,
      controlesPropuestos: "",
      tipoControlPrincipal: "eliminacion",
      responsableImplementacion: "",
      estadoImplementacion: "pendiente",
      requiereSeguimiento: 1,
    },
  });

  useEffect(() => {
    if (peligro) {
      form.reset({
        clasificacion: peligro.clasificacion as any,
        subclasificacion: peligro.subclasificacion || undefined,
        descripcionPeligro: peligro.descripcionPeligro,
        fuenteGeneradora: peligro.fuenteGeneradora,
        actividadProceso: peligro.actividadProceso,
        ubicacion: peligro.ubicacion || undefined,
        numeroPersonasExpuestas: peligro.numeroPersonasExpuestas,
        tipoExposicion: peligro.tipoExposicion || undefined,
        tiempoExposicion: peligro.tiempoExposicion || undefined,
        efectosPosibles: peligro.efectosPosibles,
        parteCuerpoAfectada: peligro.parteCuerpoAfectada || undefined,
        nivelProbabilidad: peligro.nivelProbabilidad as any,
        nivelSeveridad: peligro.nivelSeveridad as any,
        controlesExistentes: peligro.controlesExistentes || undefined,
        efectividadControlesExistentes: peligro.efectividadControlesExistentes || undefined,
        requiereControles: peligro.requiereControles,
        controlesPropuestos: peligro.controlesPropuestos || undefined,
        tipoControlPrincipal: peligro.tipoControlPrincipal as any,
        tipoControlSecundario: peligro.tipoControlSecundario as any,
        responsableImplementacion: peligro.responsableImplementacion || undefined,
        estadoImplementacion: peligro.estadoImplementacion || "pendiente",
        observaciones: peligro.observaciones || undefined,
        requiereSeguimiento: peligro.requiereSeguimiento,
      });
    } else if (prefillValues && Object.keys(prefillValues).length > 0) {
      // Pre-llenar desde datos externos (ej: Sustancias Químicas)
      form.reset({
        clasificacion: "fisico",
        descripcionPeligro: "",
        fuenteGeneradora: "",
        actividadProceso: "",
        ubicacion: "",
        numeroPersonasExpuestas: 1,
        tipoExposicion: "permanente",
        tiempoExposicion: "8 horas/día",
        efectosPosibles: "",
        parteCuerpoAfectada: "",
        nivelProbabilidad: "baja",
        nivelSeveridad: "ligeramente_danino",
        controlesExistentes: "",
        efectividadControlesExistentes: "media",
        requiereControles: 1,
        controlesPropuestos: "",
        tipoControlPrincipal: "eliminacion",
        responsableImplementacion: "",
        estadoImplementacion: "pendiente",
        requiereSeguimiento: 1,
        ...prefillValues,
      });
    } else {
      form.reset();
    }
  }, [peligro, prefillValues, form]);

  // Auto-fill desde catálogo GTC-45
  useEffect(() => {
    if (selectedPredefPeligro && !isEditing) {
      const peligroData = getPeligroByCodigo(selectedPredefPeligro);
      if (peligroData) {
        form.setValue("clasificacion", peligroData.clasificacion as any);
        form.setValue("descripcionPeligro", peligroData.peligro);
        form.setValue("efectosPosibles", peligroData.efectosPosibles);
        form.setValue("controlesPropuestos", peligroData.medidasControl.join(", "));
        
        // Set default values based on classification
        const defaults = defaultValuesByClasificacion[peligroData.clasificacion];
        if (defaults) {
          form.setValue("actividadProceso", defaults.actividadProceso);
          form.setValue("fuenteGeneradora", defaults.fuenteGeneradora);
          form.setValue("ubicacion", defaults.ubicacion);
        }
      }
    }
  }, [selectedPredefPeligro, isEditing, form]);

  // Auto-fill when classification changes (without using predefined assistant)
  const watchedClasificacion = form.watch("clasificacion");
  useEffect(() => {
    // Only auto-fill if not editing and not using the predefined assistant
    if (!isEditing && !selectedPredefPeligro && watchedClasificacion) {
      const defaults = defaultValuesByClasificacion[watchedClasificacion as keyof typeof defaultValuesByClasificacion];
      if (defaults) {
        // Only fill if fields are empty
        const currentActividad = form.getValues("actividadProceso");
        const currentFuente = form.getValues("fuenteGeneradora");
        const currentUbicacion = form.getValues("ubicacion");
        
        if (!currentActividad) form.setValue("actividadProceso", defaults.actividadProceso);
        if (!currentFuente) form.setValue("fuenteGeneradora", defaults.fuenteGeneradora);
        if (!currentUbicacion) form.setValue("ubicacion", defaults.ubicacion);
      }
    }
  }, [watchedClasificacion, isEditing, selectedPredefPeligro, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Calcular nivel de riesgo
      const probabilidadMap = { baja: 1, media: 2, alta: 3, muy_alta: 4 };
      const severidadMap = { ligeramente_danino: 1, danino: 2, muy_danino: 3, extremadamente_danino: 4 };
      const valorRiesgo = probabilidadMap[data.nivelProbabilidad] * severidadMap[data.nivelSeveridad];
      
      let nivelRiesgo: string;
      if (valorRiesgo === 1) nivelRiesgo = "trivial";
      else if (valorRiesgo <= 3) nivelRiesgo = "tolerable";
      else if (valorRiesgo <= 6) nivelRiesgo = "moderado";
      else if (valorRiesgo <= 9) nivelRiesgo = "importante";
      else nivelRiesgo = "intolerable";

      const payload = { ...data, valorRiesgo, nivelRiesgo };
      const res = await apiRequest("POST", `/api/matrices-iperc/${matrizId}/peligros`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matrices-iperc/${matrizId}/peligros`] });
      onOpenChange(false);
      setSelectedPredefPeligro("");
      form.reset();
      toast({
        title: "Peligro registrado",
        description: "El peligro se ha agregado exitosamente a la matriz",
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

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const probabilidadMap = { baja: 1, media: 2, alta: 3, muy_alta: 4 };
      const severidadMap = { ligeramente_danino: 1, danino: 2, muy_danino: 3, extremadamente_danino: 4 };
      const valorRiesgo = probabilidadMap[data.nivelProbabilidad] * severidadMap[data.nivelSeveridad];
      
      let nivelRiesgo: string;
      if (valorRiesgo === 1) nivelRiesgo = "trivial";
      else if (valorRiesgo <= 3) nivelRiesgo = "tolerable";
      else if (valorRiesgo <= 6) nivelRiesgo = "moderado";
      else if (valorRiesgo <= 9) nivelRiesgo = "importante";
      else nivelRiesgo = "intolerable";

      const payload = { ...data, valorRiesgo, nivelRiesgo };
      const res = await apiRequest("PATCH", `/api/peligros-iperc/${peligro!.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matrices-iperc/${matrizId}/peligros`] });
      onOpenChange(false);
      toast({
        title: "Peligro actualizado",
        description: "El peligro se ha actualizado exitosamente",
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Submitting peligro data:", data);
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Debug: log form errors if submit fails
  const handleSubmitWithDebug = form.handleSubmit(onSubmit, (errors) => {
    console.error("Form validation errors:", errors);
    toast({
      title: "Error de validación",
      description: "Por favor complete todos los campos requeridos correctamente",
      variant: "destructive",
    });
  });

  const handleClose = () => {
    onOpenChange(false);
    setSelectedPredefPeligro("");
    if (!isEditing) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Peligro" : "Agregar Peligro a la Matriz"}</DialogTitle>
          <DialogDescription>
            Complete los campos para identificar el peligro según la metodología GTC-45:2012
          </DialogDescription>
        </DialogHeader>

        {/* Asistente Inteligente - Solo visible al crear */}
        {!isEditing && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 mb-4">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <CardTitle className="text-base text-blue-900 dark:text-blue-100">Asistente Inteligente GTC-45</CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    Seleccione un peligro predefinido para auto-completar los campos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={selectedPredefPeligro} onValueChange={setSelectedPredefPeligro}>
                <SelectTrigger className="bg-white dark:bg-gray-950" data-testid="select-peligro-gtc45">
                  <SelectValue placeholder="Seleccione un peligro predefinido GTC-45..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(clasificacionPeligroLabels).map(([clasificacion, label]) => (
                    <div key={clasificacion}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
                      {peligrosGTC45Predefinidos.filter(p => p.clasificacion === clasificacion).map((peligro) => (
                        <SelectItem key={peligro.codigo} value={peligro.codigo}>
                          {peligro.codigo} - {peligro.peligro}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmitWithDebug} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clasificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clasificación del Peligro *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-clasificacion">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fisico">Físico</SelectItem>
                        <SelectItem value="quimico">Químico</SelectItem>
                        <SelectItem value="biologico">Biológico</SelectItem>
                        <SelectItem value="psicosocial">Psicosocial</SelectItem>
                        <SelectItem value="biomecanico">Biomecánico</SelectItem>
                        <SelectItem value="condiciones_seguridad">Condiciones de Seguridad</SelectItem>
                        <SelectItem value="fenomenos_naturales">Fenómenos Naturales</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actividadProceso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actividad/Proceso *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Operación de maquinaria" data-testid="input-actividad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcionPeligro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Peligro *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Describa el peligro identificado" data-testid="input-descripcion" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuenteGeneradora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente Generadora *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Sierra circular" data-testid="input-fuente" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ej: Área de producción" data-testid="input-ubicacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numeroPersonasExpuestas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº Personas Expuestas *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} onBlur={() => { if (field.value === '' || field.value == null) field.onChange(1); }} data-testid="input-personas" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoExposicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Exposición</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="permanente/ocasional" data-testid="input-tipo-exposicion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiempoExposicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo de Exposición</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="8 horas/día" data-testid="input-tiempo-exposicion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="efectosPosibles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Efectos Posibles *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Lesiones o enfermedades que puede causar" data-testid="input-efectos" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nivelProbabilidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Probabilidad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-probabilidad">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baja">Baja (1)</SelectItem>
                        <SelectItem value="media">Media (2)</SelectItem>
                        <SelectItem value="alta">Alta (3)</SelectItem>
                        <SelectItem value="muy_alta">Muy Alta (4)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nivelSeveridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Severidad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-severidad">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ligeramente_danino">Ligeramente Dañino (1)</SelectItem>
                        <SelectItem value="danino">Dañino (2)</SelectItem>
                        <SelectItem value="muy_danino">Muy Dañino (3)</SelectItem>
                        <SelectItem value="extremadamente_danino">Extremadamente Dañino (4)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="controlesPropuestos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Controles Propuestos</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} rows={2} placeholder="Medidas de control según jerarquía" data-testid="input-controles" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoControlPrincipal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Control Principal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger data-testid="select-tipo-control">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="eliminacion">Eliminación</SelectItem>
                      <SelectItem value="sustitucion">Sustitución</SelectItem>
                      <SelectItem value="controles_ingenieria">Controles de Ingeniería</SelectItem>
                      <SelectItem value="controles_administrativos">Controles Administrativos</SelectItem>
                      <SelectItem value="epp">EPP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                data-testid="button-submit-peligro"
              >
                {createMutation.isPending || updateMutation.isPending ? "Guardando..." : isEditing ? "Actualizar" : "Agregar Peligro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
