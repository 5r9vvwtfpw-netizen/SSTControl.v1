import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMatrizLegalSchema, type MatrizLegal, type InsertMatrizLegal, type Worker } from "@shared/schema";
import { Plus, Filter, FileText, CheckCircle2, AlertCircle, XCircle, MinusCircle, Download, RefreshCw, Bot } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normasColombianasSST, getNormaByCodigo } from "@/data/normas-colombianas-sst";
import { AutomationAssistant, type NormativaInfo, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const plantillasMatrizLegal: PlantillaInfo[] = [
  {
    id: "sistema-gestion",
    nombre: "Sistema de Gestión SST",
    descripcion: "Requisitos del Sistema de Gestión de Seguridad y Salud en el Trabajo",
    campos: {
      categoria: "sistema-gestion",
      obligaciones: "Implementar y mantener el Sistema de Gestión de Seguridad y Salud en el Trabajo según Decreto 1072/2015 y Resolución 0312/2019. Incluye política SST, objetivos, planificación, asignación de recursos y responsabilidades.",
      normativa: "Decreto 1072/2015, Resolución 0312/2019"
    },
    normativaBase: "DEC-1072-2.2.4.6"
  },
  {
    id: "seguridad-industrial",
    nombre: "Seguridad Industrial",
    descripcion: "Normas de seguridad en el trabajo y prevención de accidentes",
    campos: {
      categoria: "seguridad-industrial",
      obligaciones: "Cumplir con las disposiciones de seguridad industrial según Resolución 2400/1979. Incluye condiciones locativas, manejo de máquinas, herramientas, equipos y elementos de protección personal.",
      normativa: "Resolución 2400/1979"
    },
    normativaBase: "RES-2400-1979"
  },
  {
    id: "medicina-trabajo",
    nombre: "Medicina del Trabajo",
    descripcion: "Evaluaciones médicas ocupacionales, perfiles de cargo y vigilancia epidemiológica",
    campos: {
      categoria: "medicina-trabajo",
      obligaciones: "Realizar evaluaciones médicas ocupacionales según Resolución 1843/2025 (deroga Res. 2346/2007). Incluye: exámenes de ingreso, periódicos (máx. cada 3 años según riesgo), retiro, retorno laboral (>90 días ausencia), post-incapacidad (>30 días) y seguimiento. Elaborar perfiles de cargo detallados (reemplaza profesiograma). Implementar sistemas de vigilancia epidemiológica ocupacional. Asumir costos de evaluaciones, paraclínicos y transporte.",
      normativa: "Resolución 1843/2025"
    },
    normativaBase: "RES-1843-2025"
  },
  {
    id: "higiene-industrial",
    nombre: "Higiene Industrial",
    descripcion: "Control de agentes físicos, químicos y biológicos",
    campos: {
      categoria: "higiene-industrial",
      obligaciones: "Identificar, evaluar y controlar la exposición a agentes físicos (ruido, iluminación, temperatura), químicos (sustancias peligrosas) y biológicos en el ambiente laboral según normativa aplicable.",
      normativa: "Resolución 2400/1979, Decreto 1072/2015"
    },
    normativaBase: "RES-2400-1979"
  },
  {
    id: "emergencias",
    nombre: "Preparación y Respuesta ante Emergencias",
    descripcion: "Plan de prevención, preparación y respuesta ante emergencias",
    campos: {
      categoria: "emergencias",
      obligaciones: "Establecer e implementar el plan de prevención, preparación y respuesta ante emergencias según Decreto 1072/2015 Art. 2.2.4.6.25. Incluye conformación de brigadas, simulacros, equipos de emergencia y procedimientos de evacuación.",
      normativa: "Decreto 1072/2015 Art. 2.2.4.6.25"
    },
    normativaBase: "DEC-1072-2.2.4.6.25"
  },
  {
    id: "comites-sst",
    nombre: "Comités SST",
    descripcion: "COPASST y Comité de Convivencia Laboral",
    campos: {
      categoria: "comites-sst",
      obligaciones: "Conformar y garantizar el funcionamiento del COPASST según Resolución 2013/1986. Conformar Comité de Convivencia Laboral (CCL) según Resolución 3461/2025 (deroga Res. 652/2012): un CCL por centro de trabajo, composición según tamaño de empresa, paridad de género, integración con SG-SST, plazo máximo 65 días para resolver quejas, reportes periódicos obligatorios.",
      normativa: "Resolución 2013/1986, Resolución 3461/2025"
    },
    normativaBase: "RES-2013-1986"
  },
  {
    id: "investigacion-incidentes",
    nombre: "Investigación de Incidentes",
    descripcion: "Investigación de accidentes de trabajo y enfermedades laborales",
    campos: {
      categoria: "investigacion-incidentes",
      obligaciones: "Investigar los incidentes, accidentes de trabajo y enfermedades laborales según Resolución 1401/2007. Determinar causas básicas e inmediatas, implementar acciones correctivas y realizar seguimiento.",
      normativa: "Resolución 1401/2007"
    },
    normativaBase: "RES-1401-2007"
  },
  {
    id: "capacitacion",
    nombre: "Capacitación SST",
    descripcion: "Programa de capacitación en seguridad y salud en el trabajo",
    campos: {
      categoria: "capacitacion",
      obligaciones: "Diseñar e implementar el programa de capacitación en SST según Decreto 1072/2015 Art. 2.2.4.6.11. Incluir inducción, reinducción, capacitación específica por riesgos y formación de brigadas.",
      normativa: "Decreto 1072/2015 Art. 2.2.4.6.11"
    },
    normativaBase: "DEC-1072-2.2.4.6.11"
  },
  {
    id: "trabajo-alturas",
    nombre: "Trabajo en Alturas",
    descripcion: "Prevención y protección contra caídas en trabajo en alturas",
    campos: {
      categoria: "trabajo-alturas",
      obligaciones: "Cumplir con el reglamento de seguridad para protección contra caídas en trabajo en alturas según Resolución 4272/2021. Incluye programa de prevención, certificación de trabajadores y equipos de protección.",
      normativa: "Resolución 4272/2021"
    },
    normativaBase: "RES-4272-2021"
  },
  {
    id: "riesgo-psicosocial",
    nombre: "Riesgo Psicosocial",
    descripcion: "Identificación y control de factores de riesgo psicosocial",
    campos: {
      categoria: "riesgo-psicosocial",
      obligaciones: "Identificar, evaluar e intervenir los factores de riesgo psicosocial según Resolución 2646/2008 y Resolución 2764/2022. Aplicar batería de instrumentos y establecer programa de vigilancia epidemiológica.",
      normativa: "Resolución 2646/2008, Resolución 2764/2022"
    },
    normativaBase: "RES-2646-2008"
  }
];

const categoriaLabels: Record<string, string> = {
  "sistema-gestion": "Sistema de Gestión",
  "seguridad-industrial": "Seguridad Industrial",
  "medicina-trabajo": "Medicina del Trabajo",
  "higiene-industrial": "Higiene Industrial",
  "seguridad-vial": "Seguridad Vial",
  "riesgo-psicosocial": "Riesgo Psicosocial",
  "emergencias": "Emergencias",
  "sustancias-quimicas": "Sustancias Químicas",
  "trabajo-alturas": "Trabajo en Alturas",
  "espacios-confinados": "Espacios Confinados",
  "seguridad-electrica": "Seguridad Eléctrica",
  "prevencion-incendios": "Prevención de Incendios",
  "comites-sst": "Comités SST",
  "investigacion-incidentes": "Investigación de Incidentes",
  "capacitacion": "Capacitación",
  "otras": "Otras"
};

const estadoCumplimientoLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  "cumple": { label: "Cumple", variant: "default", className: "bg-green-600 hover:bg-green-700 text-white" },
  "cumple-parcialmente": { label: "Cumple Parcialmente", variant: "default", className: "bg-yellow-600 hover:bg-yellow-700 text-white" },
  "no-cumple": { label: "No Cumple", variant: "destructive" },
  "no-aplica": { label: "No Aplica", variant: "secondary" }
};

export default function MatrizLegal() {
  const { toast } = useToast();
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MatrizLegal | null>(null);

  const { data: matrizLegal, isLoading } = useQuery<MatrizLegal[]>({
    queryKey: ["/api/matriz-legal"],
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const form = useForm<InsertMatrizLegal>({
    resolver: zodResolver(insertMatrizLegalSchema),
    defaultValues: {
      norma: "",
      titulo: "",
      categoria: "sistema-gestion",
      obligaciones: "",
      estadoCumplimiento: "no-cumple",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertMatrizLegal) =>
      apiRequest("POST", "/api/matriz-legal", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matriz-legal"] });
      toast({ title: "Norma creada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertMatrizLegal> }) =>
      apiRequest("PATCH", `/api/matriz-legal/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matriz-legal"] });
      toast({ title: "Norma actualizada exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/matriz-legal/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matriz-legal"] });
      toast({ title: "Norma eliminada", className: "bg-yellow-50 border-yellow-200" });
    },
  });

  const initializeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/matriz-legal/initialize"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matriz-legal"] });
      toast({ 
        title: "Matriz Legal Inicializada", 
        description: "Se han cargado todas las normas colombianas de SST al 2025",
        className: "bg-yellow-50 border-yellow-200"
      });
    },
  });

  const validateComplianceMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/matriz-legal/validate-compliance"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matriz-legal"] });
      toast({ 
        title: "Validación Completada", 
        description: "El cumplimiento se ha validado automáticamente según los datos del sistema",
        className: "bg-yellow-50 border-yellow-200"
      });
    },
  });

  const handleSubmit = (data: InsertMatrizLegal) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: MatrizLegal) => {
    setEditingItem(item);
    // Only reset with fields that are part of InsertMatrizLegal schema
    const editData: Partial<InsertMatrizLegal> = {
      norma: item.norma,
      titulo: item.titulo,
      categoria: item.categoria,
      obligaciones: item.obligaciones,
      estadoCumplimiento: item.estadoCumplimiento,
      entidadEmisora: item.entidadEmisora || undefined,
      responsableCumplimiento: item.responsableCumplimiento || undefined,
      periodicidad: item.periodicidad || undefined,
      evidencias: item.evidencias || undefined,
      observaciones: item.observaciones || undefined,
    };
    form.reset(editData as InsertMatrizLegal);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset({
      norma: "",
      titulo: "",
      categoria: "sistema-gestion",
      obligaciones: "",
      estadoCumplimiento: "no-cumple",
    });
    setDialogOpen(true);
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    setEditingItem(null);
    form.reset({
      norma: "",
      titulo: plantilla.nombre,
      categoria: plantilla.campos.categoria || "sistema-gestion",
      obligaciones: plantilla.campos.obligaciones || "",
      estadoCumplimiento: "no-cumple",
    });
    setDialogOpen(true);
    toast({
      title: "Plantilla aplicada",
      description: `Se ha cargado la plantilla "${plantilla.nombre}" con los requisitos normativos predefinidos`,
      className: "bg-yellow-50 border-yellow-200"
    });
  };

  const filteredData = matrizLegal?.filter((item) => {
    const matchesCategoria = selectedCategoria === "all" || item.categoria === selectedCategoria;
    const matchesSearch = item.norma.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.obligaciones.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategoria && matchesSearch;
  }) || [];

  const categoryCounts = matrizLegal?.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Para los KPIs, usar estadoAutomatico cuando esté disponible, sino usar estadoCumplimiento
  const estadoStats = matrizLegal?.reduce((acc, item) => {
    const estadoEfectivo = (item.validacionAutomatica === 1 && item.estadoAutomatico) 
      ? item.estadoAutomatico 
      : item.estadoCumplimiento;
    acc[estadoEfectivo] = (acc[estadoEfectivo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const cumplimientoPorcentaje = matrizLegal && matrizLegal.length > 0
    ? Math.round((estadoStats["cumple"] || 0) / matrizLegal.length * 100)
    : 0;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando matriz legal...</div>;
  }

  const isEmpty = !matrizLegal || matrizLegal.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matriz Legal SST</h1>
          <p className="text-muted-foreground mt-1">
            Normatividad colombiana en Seguridad y Salud en el Trabajo al 2025
          </p>
        </div>
        <div className="flex gap-2">
          {isEmpty && (
            <Button 
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              data-testid="button-initialize-matriz"
            >
              <Download className="w-4 h-4 mr-2" />
              Cargar Normas Base
            </Button>
          )}
          {!isEmpty && (
            <Button 
              onClick={() => validateComplianceMutation.mutate()}
              disabled={validateComplianceMutation.isPending}
              variant="outline"
              data-testid="button-validate-compliance"
            >
              <Bot className="w-4 h-4 mr-2" />
              Validar Automáticamente
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} data-testid="button-add-norma">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Norma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Norma" : "Nueva Norma Legal"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Modifique los detalles de la norma" : "Agregue una nueva norma a la matriz legal"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="norma"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Norma *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-rellenar campos cuando se selecciona una norma predefinida
                              const normaPredefinida = getNormaByCodigo(value);
                              if (normaPredefinida) {
                                form.setValue('categoria', normaPredefinida.categoria as any);
                                form.setValue('titulo', normaPredefinida.titulo);
                                form.setValue('obligaciones', normaPredefinida.obligaciones);
                                form.setValue('periodicidad', normaPredefinida.periodicidad || undefined);
                                form.setValue('entidadEmisora', normaPredefinida.entidadEmisora || undefined);
                              }
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-norma">
                                <SelectValue placeholder="Seleccione una norma o escriba una nueva" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {normasColombianasSST.map((norma) => (
                                <SelectItem key={norma.codigo} value={norma.codigo}>
                                  {norma.codigo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Seleccione una norma del catálogo para auto-rellenar los campos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} data-testid="select-categoria">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(categoriaLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre descriptivo de la norma" data-testid="input-titulo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obligaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Obligaciones *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Qué obliga a hacer esta norma" data-testid="textarea-obligaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="entidadEmisora"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entidad Emisora</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Ej: Ministerio del Trabajo" data-testid="input-entidad" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estadoCumplimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado de Cumplimiento *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} data-testid="select-estado">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(estadoCumplimientoLabels).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="responsableCumplimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable de Cumplimiento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-responsable">
                              <SelectValue placeholder="Seleccione un trabajador responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workers?.map((worker) => (
                              <SelectItem key={worker.id} value={`${worker.name} - ${worker.position}`}>
                                {worker.name} - {worker.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="periodicidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidad</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Ej: Anual, Permanente, Cada 2 años" data-testid="input-periodicidad" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evidencias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidencias</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} placeholder="Descripción de evidencias de cumplimiento" data-testid="textarea-evidencias" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} rows={2} placeholder="Notas y comentarios adicionales" data-testid="textarea-observaciones" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-norma">
                      {editingItem ? "Actualizar" : "Crear"} Norma
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Asistente de Automatización - Estándar 2.7.1 Matriz Legal */}
      {(() => {
        const estandarMatrizLegal = getEstandarByCodigo('2.7.1');
        const normativaMatrizLegal: NormativaInfo[] = [
          {
            codigo: 'DEC-1072-2.2.4.6.8',
            norma: 'Decreto 1072/2015',
            articulo: 'Artículo 2.2.4.6.8',
            descripcion: 'Obligaciones de los empleadores - Identificación de requisitos legales',
            requisitos: [
              'Garantizar el cumplimiento de la normatividad nacional vigente aplicable en materia de SST',
              'Identificar la normatividad legal aplicable',
              'Mantener actualizada la matriz de requisitos legales',
              'Verificar el cumplimiento de los requisitos legales',
              'Comunicar los cambios normativos a los trabajadores'
            ],
            obligatorio: true
          },
          ...(estandarMatrizLegal?.normativaAplicable || [])
        ];
        
        const categoriasRequeridas = [
          { campo: 'Sistema de Gestión', valor: 'Decreto 1072/2015, Resolución 0312/2019', normativaReferencia: 'DEC-1072-2.2.4.6' },
          { campo: 'Seguridad Industrial', valor: 'Resolución 2400/1979, normas específicas por actividad', normativaReferencia: 'RES-2400-1979' },
          { campo: 'Medicina del Trabajo', valor: 'Resolución 2346/2007 - Exámenes médicos ocupacionales', normativaReferencia: 'RES-2346-2007' },
          { campo: 'Higiene Industrial', valor: 'Exposición a agentes físicos, químicos y biológicos', normativaReferencia: 'RES-2400-1979' },
          { campo: 'Emergencias', valor: 'Decreto 1072/2015 Art. 2.2.4.6.25 - Plan de prevención', normativaReferencia: 'DEC-1072-2.2.4.6.25' },
          { campo: 'Comités SST', valor: 'Resolución 2013/1986 COPASST, Resolución 652/2012 Convivencia', normativaReferencia: 'RES-2013-1986' },
          { campo: 'Investigación de Incidentes', valor: 'Resolución 1401/2007 - Investigación de AT/EL', normativaReferencia: 'RES-1401-2007' },
          { campo: 'Capacitación', valor: 'Decreto 1072/2015 Art. 2.2.4.6.11 - Programa de capacitación', normativaReferencia: 'DEC-1072-2.2.4.6.11' }
        ];

        return (
          <AutomationAssistant
            titulo="Matriz Legal SST"
            estandar="2.7.1"
            descripcion="Identificación y seguimiento de requisitos legales aplicables según Decreto 1072/2015"
            normativaAplicable={normativaMatrizLegal}
            compact={true}
          />
        );
      })()}

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay normas en la matriz legal</h3>
            <p className="text-muted-foreground text-center mb-4">
              Inicie la matriz con las normas base de Colombia o agregue normas manualmente
            </p>
            <Button onClick={() => initializeMutation.mutate()} disabled={initializeMutation.isPending}>
              <Download className="w-4 h-4 mr-2" />
              Cargar Normas Base de Colombia 2025
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Normas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{matrizLegal.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Cumple
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{estadoStats["cumple"] || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  No Cumple
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{estadoStats["no-cumple"] || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">% Cumplimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{cumplimientoPorcentaje}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar por norma, título o obligaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                  data-testid="input-search"
                />
                <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                  <SelectTrigger className="w-64" data-testid="select-filter-categoria">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(categoriaLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label} ({categoryCounts[value] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredData.map((item) => (
              <Card key={item.id} data-testid={`card-norma-${item.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-lg">{item.norma}</CardTitle>
                        <Badge variant="outline">{categoriaLabels[item.categoria]}</Badge>
                        {item.validacionAutomatica === 1 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            Auto-validable
                          </Badge>
                        )}
                        <Badge 
                          variant={estadoCumplimientoLabels[item.estadoCumplimiento].variant}
                          className={estadoCumplimientoLabels[item.estadoCumplimiento].className}
                        >
                          {estadoCumplimientoLabels[item.estadoCumplimiento].label}
                        </Badge>
                        {item.validacionAutomatica === 1 && item.estadoAutomatico && (
                          <Badge 
                            variant={estadoCumplimientoLabels[item.estadoAutomatico].variant}
                            className={`flex items-center gap-1 ${estadoCumplimientoLabels[item.estadoAutomatico].className || ''}`}
                          >
                            <Bot className="w-3 h-3" />
                            {estadoCumplimientoLabels[item.estadoAutomatico].label}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{item.titulo}</CardDescription>
                      {item.validacionAutomatica === 1 && item.ultimaValidacionAutomatica && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Última validación automática: {new Date(item.ultimaValidacionAutomatica).toLocaleString('es-CO')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong className="text-sm">Obligaciones:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{item.obligaciones}</p>
                  </div>
                  {item.entidadEmisora && (
                    <div className="flex gap-4 text-sm">
                      <span><strong>Emisora:</strong> {item.entidadEmisora}</span>
                    </div>
                  )}
                  {(item.responsableCumplimiento || item.periodicidad) && (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {item.responsableCumplimiento && <span><strong>Responsable:</strong> {item.responsableCumplimiento}</span>}
                      {item.periodicidad && <span><strong>Periodicidad:</strong> {item.periodicidad}</span>}
                    </div>
                  )}
                  {item.evidencias && (
                    <div className="text-sm">
                      <strong>Evidencias:</strong>
                      <p className="text-muted-foreground mt-1">{item.evidencias}</p>
                    </div>
                  )}
                  {item.observaciones && (
                    <div className="text-sm">
                      <strong>Observaciones:</strong>
                      <p className="text-muted-foreground mt-1">{item.observaciones}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
