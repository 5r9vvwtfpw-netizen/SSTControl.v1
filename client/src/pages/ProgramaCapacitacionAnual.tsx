import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Download, Edit, Trash2, Bot, CalendarDays, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrainingProgramSchema } from "@shared/schema";
import type { z } from "zod";
import { OBJETIVOS_POR_CATEGORIA, getObjetivosSugeridos } from "@/data/objetivos-sst-predefinidos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AutomationAssistant, type PlantillaInfo, type NormativaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { CAPACITACIONES_OBLIGATORIAS } from "@/data/catalogos-sst";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

type TrainingProgram = {
  id: string;
  year: number;
  title: string;
  generalObjective: string;
  specificObjectives: string;
  scope: string;
  targetPopulation: string;
  responsible: string;
  status: string;
  copasstApproval?: number | null;
  copasstApprovalDate?: string | null;
  humanResources?: string | null;
  technicalResources?: string | null;
  financialBudget?: number | null;
  methodology?: string | null;
  observations?: string | null;
};

type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;

type TemplatePreFillData = {
  title: string;
  generalObjective: string;
  scope: string;
  targetPopulation: string;
  methodology: string;
};

export default function ProgramaCapacitacionAnual() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<typeof CAPACITACIONES_OBLIGATORIAS[0] | null>(null);
  const [templatePreFill, setTemplatePreFill] = useState<TemplatePreFillData | null>(null);

  // Obtener el ID del plan de trabajo guardado para la navegación de regreso
  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);
  
  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    
    // Always show the link first, then validate in background
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);

  // Get estándar 1.2.1 data for AutomationAssistant
  const estandar121 = useMemo(() => getEstandarByCodigo('1.2.1'), []);

  // Prepare normativa data for AutomationAssistant
  const normativaAplicable: NormativaInfo[] = useMemo(() => {
    if (!estandar121) return [];
    return estandar121.normativaAplicable.map(n => ({
      codigo: n.codigo,
      norma: n.norma,
      articulo: n.articulo,
      descripcion: n.descripcion,
      requisitos: n.requisitos,
      obligatorio: n.obligatorio
    }));
  }, [estandar121]);

  // Create plantillas from CAPACITACIONES_OBLIGATORIAS
  const plantillasCapacitacion: PlantillaInfo[] = useMemo(() => {
    return CAPACITACIONES_OBLIGATORIAS.filter(cap => cap.obligatoria).map(cap => ({
      id: cap.codigo,
      nombre: cap.nombre,
      descripcion: `${cap.duracionHoras} horas - ${cap.frecuencia === 'unica' ? 'Única vez' : cap.frecuencia.charAt(0).toUpperCase() + cap.frecuencia.slice(1)} - Dirigido a: ${cap.dirigidoA.join(', ')}`,
      campos: {
        tema: cap.nombre,
        duracion: cap.duracionHoras,
        frecuencia: cap.frecuencia === 'unica' ? 'Única vez' : cap.frecuencia.charAt(0).toUpperCase() + cap.frecuencia.slice(1),
        dirigidoA: cap.dirigidoA.join(', '),
        contenidoMinimo: cap.contenidoMinimo,
        modalidad: cap.modalidad.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
      },
      normativaBase: cap.normativaBase
    }));
  }, []);

  // Handler for when a plantilla is selected - auto-fills and opens the create dialog
  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    const capacitacion = CAPACITACIONES_OBLIGATORIAS.find(c => c.codigo === plantilla.id);
    if (capacitacion) {
      setSelectedCapacitacion(capacitacion);
      
      // Generate pre-fill data based on the selected training template
      const currentYear = new Date().getFullYear();
      const preFillData: TemplatePreFillData = {
        title: `Programa de ${capacitacion.nombre} - ${currentYear}`,
        generalObjective: `Desarrollar las competencias necesarias en ${capacitacion.nombre.toLowerCase()} para todos los trabajadores, conforme a ${capacitacion.normativaBase}, garantizando el cumplimiento de los requisitos legales y la prevención de riesgos laborales en la organización.`,
        scope: `Este programa aplica a ${capacitacion.dirigidoA.join(', ').toLowerCase()} de la empresa, incluyendo el contenido mínimo establecido: ${capacitacion.contenidoMinimo.slice(0, 3).join(', ')}${capacitacion.contenidoMinimo.length > 3 ? ', entre otros temas.' : '.'}`,
        targetPopulation: capacitacion.dirigidoA.join(', '),
        methodology: `${capacitacion.modalidad.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' / ')} - Duración: ${capacitacion.duracionHoras} horas - Frecuencia: ${capacitacion.frecuencia === 'unica' ? 'Única vez' : capacitacion.frecuencia.charAt(0).toUpperCase() + capacitacion.frecuencia.slice(1)}`
      };
      
      // Set the pre-fill data and open the dialog
      setTemplatePreFill(preFillData);
      setIsCreateOpen(true);
      
      // Show toast notification
      toast({
        title: "Plantilla aplicada",
        description: `Se ha pre-llenado el formulario con: ${capacitacion.nombre} (${capacitacion.duracionHoras} horas). Revise y complete los campos restantes.`,
        className: "bg-yellow-50 border-yellow-200"
      });
    }
  };

  // Queries
  const { data: programs = [], isLoading } = useQuery<TrainingProgram[]>({
    queryKey: ['/api/training-programs'],
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: InsertTrainingProgram) => {
      return await apiRequest('POST', '/api/training-programs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-programs'] });
      toast({ title: "Programa creado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error al crear programa", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTrainingProgram> }) => {
      return await apiRequest('PATCH', `/api/training-programs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-programs'] });
      toast({ title: "Programa actualizado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setIsEditOpen(false);
      setSelectedProgram(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error al actualizar programa", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/training-programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-programs'] });
      toast({ title: "Programa eliminado exitosamente", className: "bg-yellow-50 border-yellow-200" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error al eliminar programa", description: error.message, variant: "destructive" });
    },
  });

  const handleDownloadPDF = (programId: string) => {
    const url = `/api/training-programs/${programId}/pdf`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Botón volver a evaluación */}
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        {lastPlanTrabajoId ? (
          <Link 
            href={`/planes-trabajo-anual/${lastPlanTrabajoId}?tab=mensual${lastCronogramaMes ? `&mes=${lastCronogramaMes}` : ''}`} 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al cronograma
            <CalendarDays className="h-4 w-4" />
          </Link>
        ) : (
          <Link 
            href="/planes-trabajo-anual" 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al Plan Anual
            <CalendarDays className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-title">
            Programa de Capacitación Anual
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión del Programa de Capacitación y Entrenamiento en SST según Decreto 1072/2015
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setTemplatePreFill(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-program">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Programa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <CreateProgramDialog
              onClose={() => {
                setIsCreateOpen(false);
                setTemplatePreFill(null);
              }}
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
              initialValues={templatePreFill}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Automation Assistant */}
      <AutomationAssistant
        titulo="Programa de Capacitación Anual en SST"
        estandar="1.2.1"
        descripcion="Normativa y plantillas para el programa de capacitación según Decreto 1072/2015, Art. 2.2.4.6.11"
        normativaAplicable={normativaAplicable}
        compact={true}
      />

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>Programas Anuales</CardTitle>
          <CardDescription>
            Programas de capacitación organizados por año conforme a la normatividad colombiana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando programas...
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No hay programas registrados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea un programa anual para comenzar
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programs.sort((a, b) => b.year - a.year).map((program) => (
                <Card key={program.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">Año {program.year}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {program.title}
                        </p>
                        <Badge variant={
                          program.status === 'aprobado' || program.status === 'en_ejecucion' ? 'default' : 
                          program.status === 'completado' || program.status === 'cerrado' ? 'default' : 
                          'secondary'
                        } className="mt-2">
                          {program.status === 'borrador' ? 'Borrador' : 
                           program.status === 'aprobado' ? 'Aprobado' : 
                           program.status === 'en_ejecucion' ? 'En Ejecución' :
                           program.status === 'completado' ? 'Completado' :
                           program.status === 'cerrado' ? 'Cerrado' :
                           program.status}
                        </Badge>
                      </div>
                      <Calendar className="w-5 h-5 text-muted-foreground ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {program.generalObjective && (
                      <div>
                        <h4 className="font-semibold text-xs text-muted-foreground mb-1">Objetivo General</h4>
                        <p className="text-sm line-clamp-3">{program.generalObjective}</p>
                      </div>
                    )}
                    
                    {program.responsible && (
                      <div>
                        <h4 className="font-semibold text-xs text-muted-foreground mb-1">Responsable</h4>
                        <p className="text-sm">{program.responsible}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(program.id)}
                        data-testid={`button-download-pdf-${program.id}`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProgram(program);
                          setIsEditOpen(true);
                        }}
                        data-testid={`button-edit-program-${program.id}`}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(program.id)}
                        data-testid={`button-delete-program-${program.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Program Dialog */}
      {selectedProgram && (
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedProgram(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <EditProgramDialog
              program={selectedProgram}
              onClose={() => {
                setIsEditOpen(false);
                setSelectedProgram(null);
              }}
              onSubmit={(data) => updateMutation.mutate({ id: selectedProgram.id, data })}
              isPending={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el programa y todas las capacitaciones asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Create Program Dialog Component
function CreateProgramDialog({
  onClose,
  onSubmit,
  isPending,
  initialValues,
}: {
  onClose: () => void;
  onSubmit: (data: InsertTrainingProgram) => void;
  isPending: boolean;
  initialValues?: TemplatePreFillData | null;
}) {
  const currentYear = new Date().getFullYear();
  
  // Valores predeterminados inteligentes para auto-llenado completo
  const defaultGeneralObjective = `Identificar los peligros, evaluar y valorar los riesgos, y establecer los respectivos controles para minimizar la probabilidad de ocurrencia de accidentes de trabajo y enfermedades laborales, mediante la implementación de un programa integral de capacitación en Seguridad y Salud en el Trabajo.`;
  const defaultScope = `Todas las actividades, procesos y áreas de trabajo de la organización, incluyendo trabajadores directos, contratistas, subcontratistas, proveedores y visitantes que desarrollen actividades en las instalaciones de la empresa.`;
  const defaultTargetPopulation = `Todos los trabajadores de la organización (administrativos y operativos), contratistas, miembros del COPASST/Vigía SST, brigada de emergencias y alta dirección`;
  const defaultResponsible = `Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo`;
  const defaultMethodology = `Presencial / Virtual - Sesiones teórico-prácticas, talleres, simulacros, evaluaciones escritas y prácticas. Frecuencia según cronograma anual establecido.`;

  const form = useForm<InsertTrainingProgram>({
    resolver: zodResolver(insertTrainingProgramSchema.omit({ id: true, companyId: true })),
    defaultValues: {
      year: currentYear,
      title: initialValues?.title || `Programa de Capacitación y Prevención SST ${currentYear}`,
      generalObjective: initialValues?.generalObjective || defaultGeneralObjective,
      specificObjectives: '[]',
      scope: initialValues?.scope || defaultScope,
      targetPopulation: initialValues?.targetPopulation || defaultTargetPopulation,
      responsible: defaultResponsible,
      status: 'borrador',
      copasstApproval: 0,
      methodology: initialValues?.methodology || defaultMethodology,
    },
  });

  // Update form values when initialValues change (when template is selected)
  useEffect(() => {
    if (initialValues) {
      form.reset({
        year: currentYear,
        title: initialValues.title,
        generalObjective: initialValues.generalObjective,
        specificObjectives: '[]',
        scope: initialValues.scope,
        targetPopulation: initialValues.targetPopulation,
        responsible: defaultResponsible,
        status: 'borrador',
        copasstApproval: 0,
        methodology: initialValues.methodology,
      });
    }
  }, [initialValues, form, currentYear, defaultResponsible]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Crear Programa Anual de Capacitación</DialogTitle>
          <DialogDescription>
            Complete la información del programa conforme al Decreto 1072/2015
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-year"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="aprobado">Aprobado</SelectItem>
                      <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del Programa *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asistente inteligente de objetivos SST */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
                  Asistente de Objetivos SST
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-blue-700 dark:text-blue-300">
                Seleccione un objetivo predefinido basado en normativa colombiana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Categoría de Objetivo
                </label>
                <Select
                  onValueChange={(objetivoId) => {
                    const objetivo = getObjetivosSugeridos().find(obj => obj.id === objetivoId);
                    if (objetivo) {
                      form.setValue('generalObjective', objetivo.objetivo);
                      if (objetivo.alcance) {
                        form.setValue('scope', objetivo.alcance);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="bg-background w-full h-auto min-h-9" data-testid="select-predefined-objective">
                    <SelectValue placeholder="Seleccione un objetivo predefinido" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] max-w-[var(--radix-select-trigger-width)]">
                    {Object.entries(OBJETIVOS_POR_CATEGORIA).map(([categoria, objetivos]) => {
                      if (objetivos.length === 0) return null;
                      
                      const categoriaLabels: Record<string, string> = {
                        'general': 'OBJETIVOS GENERALES',
                        'capacitacion': 'CAPACITACIÓN',
                        'sve': 'VIGILANCIA EPIDEMIOLÓGICA',
                        'plan-trabajo': 'PLAN DE TRABAJO',
                        'comunicacion': 'COMUNICACIÓN',
                        'recursos': 'RECURSOS',
                        'emergencias': 'EMERGENCIAS',
                        'pesv': 'SEGURIDAD VIAL (PESV)',
                        'adquisiciones': 'ADQUISICIONES',
                        'copasst': 'COPASST'
                      };

                      return (
                        <div key={categoria}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {categoriaLabels[categoria] || categoria.toUpperCase()}
                          </div>
                          {objetivos.map((obj) => (
                            <SelectItem 
                              key={obj.id} 
                              value={obj.id}
                              className="max-w-full"
                              textValue={obj.objetivo.substring(0, 60) + (obj.objetivo.length > 60 ? '...' : '')}
                            >
                              <div className="flex flex-col max-w-full overflow-hidden">
                                <span className="truncate">{obj.objetivo.substring(0, 100)}{obj.objetivo.length > 100 ? '...' : ''}</span>
                                <span className="text-xs text-muted-foreground truncate">{obj.normativa}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="generalObjective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo General *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} data-testid="input-general-objective" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alcance *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} data-testid="input-scope" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetPopulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Población Objetivo *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} data-testid="input-target-population" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-responsible" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="methodology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodología</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ''} rows={2} data-testid="input-methodology" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} data-testid="button-submit-program">
            {isPending ? "Creando..." : "Crear Programa"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Edit Program Dialog Component
function EditProgramDialog({
  program,
  onClose,
  onSubmit,
  isPending,
}: {
  program: TrainingProgram;
  onClose: () => void;
  onSubmit: (data: Partial<InsertTrainingProgram>) => void;
  isPending: boolean;
}) {
  const form = useForm<InsertTrainingProgram>({
    resolver: zodResolver(insertTrainingProgramSchema.omit({ id: true, companyId: true }).partial()),
    defaultValues: {
      year: program.year,
      title: program.title,
      generalObjective: program.generalObjective,
      specificObjectives: program.specificObjectives,
      scope: program.scope,
      targetPopulation: program.targetPopulation,
      responsible: program.responsible,
      status: program.status as any,
      methodology: program.methodology || '',
      observations: program.observations || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Programa {program.year}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="aprobado">Aprobado</SelectItem>
                      <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del Programa *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="generalObjective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo General *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alcance *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetPopulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Población Objetivo *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="methodology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodología</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ''} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ''} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
