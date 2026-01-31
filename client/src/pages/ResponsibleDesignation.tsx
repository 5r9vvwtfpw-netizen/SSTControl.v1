import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Plus, Pencil, Trash2, UserCheck, FileText, CheckCircle, Bot, Download, Award, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ResponsibleDesignation, Worker, JobProfile } from "@shared/schema";
import { insertResponsibleDesignationSchema } from "@shared/schema";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getTodayDateString } from "@/lib/utils/formatters";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

type DesignationFormData = z.infer<typeof insertResponsibleDesignationSchema>;

// Responsabilidades predefinidas según Resolución 0312/2019 - Ahora como arrays
const POSITION_RESPONSIBILITIES: Record<string, string[]> = {
  "Empleador/Gerente": [
    "Definir, firmar y divulgar la política de Seguridad y Salud en el Trabajo a través de documento escrito.",
    "Asignar, documentar y comunicar las responsabilidades específicas en Seguridad y Salud en el Trabajo a todos los niveles de la organización.",
    "Rendir cuentas al interior de la empresa, frente al desempeño del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.",
    "Garantizar la consulta y participación de los trabajadores en la identificación de peligros y control de riesgos, así como la participación en el Comité Paritario de Seguridad y Salud en el Trabajo COPASST.",
    "Garantizar la disponibilidad de personal responsable de la seguridad y salud en el trabajo, cuyo perfil deberá ser acorde con lo establecido en la normatividad vigente.",
    "Garantizar los recursos financieros, técnicos, humanos y de otra índole requeridos para el diseño, implementación, revisión, evaluación y mejora de las medidas de prevención y control.",
    "Cumplir los requisitos normativos aplicables a los peligros y riesgos de la empresa.",
    "Adoptar medidas eficaces para prevenir y controlar los peligros y riesgos identificados en el Sistema de Gestión de la Seguridad y Salud en el Trabajo.",
    "Garantizar que la investigación de los incidentes, accidentes de trabajo y enfermedades laborales se realice de manera sistemática.",
    "Garantizar que los trabajadores reporten de forma inmediata todo evento que pueda afectar la seguridad y salud en el trabajo.",
  ],

  "Responsable del SG-SST": [
    "Planear, organizar, dirigir, desarrollar y aplicar el Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.",
    "Informar a la alta dirección sobre el funcionamiento y los resultados del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.",
    "Promover la participación de todos los miembros de la empresa en la implementación del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.",
    "Coordinar con los responsables de las áreas de la empresa la adopción de medidas preventivas y correctivas.",
    "Verificar el cumplimiento de los estándares mínimos del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.",
    "Gestionar los recursos financieros, técnicos y humanos necesarios para el diseño, implementación y mantenimiento del SG-SST.",
    "Mantener actualizada la matriz legal aplicable a la empresa en materia de seguridad y salud en el trabajo.",
    "Realizar la identificación de peligros, evaluación y valoración de riesgos.",
    "Diseñar e implementar las medidas de prevención y control de los peligros y riesgos identificados.",
    "Reportar a la alta dirección sobre el desempeño del SG-SST y los accidentes de trabajo y enfermedades laborales ocurridas.",
  ],

  "Coordinador SST": [
    "Apoyar al Responsable del SG-SST en la implementación y mantenimiento del sistema de gestión.",
    "Coordinar la ejecución de las actividades del plan de trabajo anual del SG-SST.",
    "Participar en la identificación de peligros y evaluación de riesgos.",
    "Gestionar la documentación del Sistema de Gestión de la Seguridad y Salud en el Trabajo.",
    "Coordinar la programación y ejecución de capacitaciones en seguridad y salud en el trabajo.",
    "Realizar seguimiento a la implementación de medidas preventivas y correctivas.",
    "Apoyar en la investigación de accidentes de trabajo y enfermedades laborales.",
    "Mantener actualizado el archivo de evidencias y registros del SG-SST.",
    "Coordinar con las diferentes áreas de la empresa la implementación de controles operacionales.",
    "Participar en la preparación de informes y estadísticas de seguridad y salud en el trabajo.",
  ],

  "Responsable del Plan de Emergencias": [
    "Diseñar, implementar y mantener actualizado el Plan de Prevención, Preparación y Respuesta ante Emergencias.",
    "Conformar, capacitar y dotar la brigada de emergencias de la empresa.",
    "Realizar simulacros de evacuación periódicos y evaluar su efectividad.",
    "Identificar amenazas, evaluar vulnerabilidades y analizar riesgos de la empresa.",
    "Establecer los procedimientos de actuación antes, durante y después de una emergencia.",
    "Coordinar con organismos de socorro (Bomberos, Cruz Roja, Defensa Civil) planes de ayuda mutua.",
    "Verificar el funcionamiento y mantenimiento de equipos de emergencia (extintores, alarmas, botiquines, señalización).",
    "Elaborar y actualizar planos de evacuación y puntos de encuentro.",
    "Realizar inspecciones periódicas de las condiciones de seguridad de las instalaciones.",
    "Mantener actualizada la información de contacto de personal de emergencias y organismos de socorro.",
  ],

  "Vigía de Seguridad y Salud": [
    "Actuar como instrumento de vigilancia del cumplimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo.",
    "Reportar al empleador las situaciones de riesgo que observe en el ambiente de trabajo.",
    "Proponer al empleador medidas de prevención y control de los riesgos laborales.",
    "Participar en la identificación de peligros y evaluación de riesgos.",
    "Promover la participación de todos los trabajadores en las actividades del SG-SST.",
    "Realizar inspecciones periódicas de los puestos de trabajo.",
    "Participar en la investigación de accidentes e incidentes de trabajo.",
    "Difundir entre los trabajadores la información sobre seguridad y salud en el trabajo.",
    "Colaborar en el análisis de las causas de accidentes de trabajo y enfermedades laborales.",
    "Asistir a las reuniones periódicas sobre seguridad y salud en el trabajo convocadas por el empleador.",
  ],

  "Brigadista de Emergencias": [
    "Participar activamente en las capacitaciones y entrenamientos programados por el Responsable del Plan de Emergencias.",
    "Conocer y aplicar los procedimientos establecidos en el Plan de Prevención, Preparación y Respuesta ante Emergencias.",
    "Realizar la atención inicial de lesionados prestando primeros auxilios según su nivel de capacitación.",
    "Ejecutar acciones de combate contra incendios utilizando correctamente los equipos de extinción disponibles.",
    "Liderar y apoyar los procesos de evacuación y rescate del personal durante situaciones de emergencia.",
    "Participar en los simulacros de evacuación y emergencias programados por la empresa.",
    "Verificar periódicamente el estado y ubicación de los equipos de emergencia asignados (extintores, botiquines, camillas).",
    "Reportar al Responsable del Plan de Emergencias cualquier situación de riesgo o falla en equipos de emergencia.",
    "Mantener la calma y transmitir tranquilidad a las personas durante situaciones de emergencia.",
    "Asistir a las reuniones de evaluación posteriores a emergencias o simulacros para proponer mejoras.",
  ],

  "Líder del COPASST": [
    "Proponer a la administración de la empresa la adopción de medidas y el desarrollo de actividades que procuren y mantengan la salud en los lugares y ambientes de trabajo.",
    "Proponer y participar en actividades de capacitación en salud ocupacional dirigidas a trabajadores, supervisores y directivos de la empresa.",
    "Colaborar con los funcionarios de entidades gubernamentales de salud ocupacional en las actividades que estos adelanten en la empresa.",
    "Vigilar el desarrollo de las actividades que en materia de medicina, higiene y seguridad industrial debe realizar la empresa.",
    "Colaborar en el análisis de las causas de los accidentes de trabajo y enfermedades profesionales y proponer medidas correctivas.",
    "Visitar periódicamente los lugares de trabajo e inspeccionar los ambientes, máquinas, equipos y operaciones en cada área.",
    "Estudiar las sugerencias que presenten los trabajadores en materia de medicina, higiene y seguridad industrial.",
    "Servir como organismo de coordinación entre empleador y trabajadores en la solución de los problemas relativos a la salud ocupacional.",
    "Tramitar los reclamos de los trabajadores relacionados con salud ocupacional.",
    "Solicitar periódicamente a la empresa informes sobre accidentalidad y enfermedades profesionales.",
  ],

  "Presidente del COPASST": [
    "Presidir y orientar las reuniones del COPASST en forma dinámica y eficaz.",
    "Llevar a cabo los arreglos necesarios para determinar el lugar o sitio de las reuniones mensuales.",
    "Notificar por escrito a los miembros del Comité sobre convocatoria a las reuniones con la debida anticipación.",
    "Preparar los temas que van a tratarse en cada reunión del COPASST.",
    "Tramitar ante la administración de la empresa las recomendaciones aprobadas en el seno del Comité.",
    "Coordinar todo lo necesario para la buena marcha del Comité Paritario de Seguridad y Salud en el Trabajo.",
    "Informar a los trabajadores de la empresa acerca de las actividades del COPASST y sus recomendaciones.",
    "Velar por el cumplimiento del reglamento interno del COPASST y las normas de seguridad y salud en el trabajo.",
    "Promover la participación activa de todos los miembros del comité en las discusiones y decisiones.",
    "Garantizar que las actas y documentación del COPASST se mantengan actualizadas y organizadas.",
  ],

  "Secretario del COPASST": [
    "Verificar la asistencia de los miembros del Comité a las reuniones programadas.",
    "Tomar nota detallada de todos los temas tratados en cada reunión del COPASST.",
    "Elaborar el acta de cada reunión y someterla a discusión y aprobación del Comité.",
    "Llevar el archivo organizado de las actas y demás actividades desarrolladas por el comité.",
    "Suministrar toda la información que requieran el empleador y los trabajadores sobre las actividades del COPASST.",
    "Preparar los informes periódicos sobre la gestión del comité cuando sean solicitados.",
    "Mantener actualizado el registro de asistencia a las reuniones del COPASST.",
    "Garantizar la confidencialidad de la información sensible tratada en el comité.",
    "Coordinar con el presidente la preparación de la agenda para cada reunión.",
    "Custodiar los documentos, registros y archivo histórico del COPASST.",
  ],

  "Líder del Comité de Convivencia": [
    "Promover y liderar las actividades del Comité de Convivencia Laboral orientadas a prevenir el acoso laboral.",
    "Recibir y dar trámite a las quejas presentadas en las que se describan situaciones que puedan constituir acoso laboral.",
    "Examinar de manera confidencial los casos específicos o puntuales en los que se formule queja o reclamo.",
    "Escuchar a las partes involucradas de manera individual sobre los hechos que dieron lugar a la queja.",
    "Adelantar reuniones con el fin de crear un espacio de diálogo entre las partes involucradas, promoviendo compromisos mutuos.",
    "Formular recomendaciones constructivas a las partes involucradas para superar las situaciones de conflicto.",
    "Hacer seguimiento a los compromisos adquiridos por las partes involucradas en la queja.",
    "Elaborar informes trimestrales sobre la gestión del Comité que incluyan estadísticas de las quejas, seguimiento y recomendaciones.",
    "Promover espacios de diálogo, campañas de divulgación preventiva, formación y capacitación sobre el acoso laboral.",
    "Hacer seguimiento al cumplimiento de las recomendaciones dadas por el Comité en casos específicos.",
  ],

  "Presidente del Comité de Convivencia": [
    "Presidir las reuniones ordinarias y extraordinarias del Comité de Convivencia Laboral.",
    "Convocar a los miembros del comité a reuniones trimestrales ordinarias y extraordinarias cuando sea necesario.",
    "Coordinar la elaboración de la agenda para cada reunión del comité.",
    "Dirigir las discusiones y garantizar que se cumplan los objetivos de cada reunión.",
    "Tramitar ante la dirección de la empresa las recomendaciones y acciones propuestas por el comité.",
    "Velar por el cumplimiento de los procedimientos establecidos en la Resolución 3461 de 2025.",
    "Garantizar la imparcialidad, confidencialidad y ética en todos los procesos del comité.",
    "Promover campañas de prevención del acoso laboral y mejoramiento del clima organizacional.",
    "Presentar informes de gestión del comité a la alta dirección de la empresa.",
    "Coordinar con el secretario la documentación y archivo de todas las actuaciones del comité.",
  ],

  "Secretario del Comité de Convivencia": [
    "Elaborar las actas de cada reunión del Comité de Convivencia Laboral de manera detallada y fidedigna.",
    "Llevar el registro y archivo organizado de todas las quejas, casos y actuaciones del comité.",
    "Verificar la asistencia de los miembros a las reuniones del comité.",
    "Custodiar de manera confidencial toda la documentación relacionada con casos de acoso laboral.",
    "Preparar y enviar las convocatorias a las reuniones según instrucciones del presidente.",
    "Llevar el control de seguimiento a los compromisos y recomendaciones emitidas por el comité.",
    "Elaborar los informes trimestrales y anuales sobre la gestión del Comité de Convivencia.",
    "Mantener actualizada la base de datos de quejas, investigaciones y resoluciones del comité.",
    "Apoyar al presidente en la preparación de la agenda y materiales para las reuniones.",
    "Garantizar la trazabilidad y documentación de todos los procesos según la normativa vigente.",
  ],

  "Líder del PESV": [
    "Liderar el diseño, implementación, seguimiento y mejora continua del Plan Estratégico de Seguridad Vial (PESV).",
    "Velar por el cumplimiento de las etapas del PESV: planificación, implementación, seguimiento, evaluación y mejora.",
    "Diligenciar el reporte de autogestión anual del PESV ante las autoridades competentes.",
    "Medir y reportar los indicadores de gestión del PESV de acuerdo con la metodología establecida.",
    "Garantizar el cumplimiento de los requisitos legales aplicables en materia de seguridad vial.",
    "Coordinar las actividades de capacitación y sensibilización en seguridad vial para conductores y demás personal.",
    "Realizar el análisis de siniestralidad vial y proponer medidas preventivas y correctivas.",
    "Gestionar los recursos necesarios para la implementación efectiva del PESV.",
    "Coordinar con el Comité de Seguridad Vial (si aplica) las acciones y decisiones relacionadas con seguridad vial.",
    "Promover la cultura de seguridad vial y hábitos de conducción seguros en toda la organización.",
  ],
};

export default function ResponsibleDesignationPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<ResponsibleDesignation | null>(null);
  const [selectedPredefinido, setSelectedPredefinido] = useState("");

  const { data: designations = [], isLoading: designationsLoading } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
  });

  // Query para obtener la asignación actual de LSO
  const { data: lsoAssignmentData } = useQuery<{ ok: boolean; data: { type: string; name: string; email?: string; phone?: string; city?: string; licenseNumber?: string; licenseIssuer?: string; licenseExpiry?: string; assignedAt: string; } | null }>({
    queryKey: ["/api/lso-directory/company-assignment"],
  });
  const lsoAssignment = lsoAssignmentData?.data;

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: jobProfiles = [] } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  const form = useForm<DesignationFormData>({
    resolver: zodResolver(insertResponsibleDesignationSchema),
    defaultValues: {
      workerId: "",
      jobProfileId: undefined,
      designationDate: getTodayDateString(),
      position: "",
      responsibilities: [],
      signatureUrl: "",
      status: "activo",
      licenciaSstTitular: "",
      licenciaSstNumero: "",
      licenciaSstVigencia: undefined,
      curso50Horas: false,
      curso50HorasFecha: undefined,
      nivelFormacion: undefined,
    },
  });

  const curso50HorasChecked = form.watch("curso50Horas");

  const createDesignationMutation = useMutation({
    mutationFn: async (data: DesignationFormData) => {
      const res = await apiRequest("POST", "/api/responsible-designations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/responsible-designations"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Designación creada",
        description: "La designación de responsable se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const updateDesignationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DesignationFormData> }) => {
      const res = await apiRequest("PATCH", `/api/responsible-designations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/responsible-designations"] });
      setDialogOpen(false);
      setEditingDesignation(null);
      form.reset();
      toast({
        title: "Designación actualizada",
        description: "Los datos se han actualizado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const deleteDesignationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/responsible-designations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/responsible-designations"] });
      toast({
        title: "Designación eliminada",
        description: "La designación se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const handleSubmit = (data: DesignationFormData) => {
    if (editingDesignation) {
      updateDesignationMutation.mutate({ id: editingDesignation.id, data });
    } else {
      createDesignationMutation.mutate(data);
    }
  };

  const handleEdit = (designation: ResponsibleDesignation) => {
    setEditingDesignation(designation);
    form.reset({
      workerId: designation.workerId,
      jobProfileId: designation.jobProfileId || undefined,
      designationDate: designation.designationDate,
      position: designation.position,
      responsibilities: designation.responsibilities,
      signatureUrl: designation.signatureUrl || "",
      status: designation.status,
      licenciaSstTitular: designation.licenciaSstTitular || "",
      licenciaSstNumero: designation.licenciaSstNumero || "",
      licenciaSstVigencia: designation.licenciaSstVigencia || undefined,
      curso50Horas: designation.curso50Horas || false,
      curso50HorasFecha: designation.curso50HorasFecha || undefined,
      nivelFormacion: designation.nivelFormacion || undefined,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta designación?")) {
      deleteDesignationMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    setEditingDesignation(null);
    form.reset({
      workerId: "",
      jobProfileId: undefined,
      designationDate: getTodayDateString(),
      position: "",
      responsibilities: [],
      signatureUrl: "",
      status: "activo",
      licenciaSstTitular: "",
      licenciaSstNumero: "",
      licenciaSstVigencia: undefined,
      curso50Horas: false,
      curso50HorasFecha: undefined,
      nivelFormacion: undefined,
    });
    setDialogOpen(true);
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    return worker ? worker.name : "Desconocido";
  };

  // Obtener las responsabilidades disponibles según el cargo seleccionado
  const selectedPosition = form.watch("position");
  const availableResponsibilities = selectedPosition ? POSITION_RESPONSIBILITIES[selectedPosition] : [];
  const selectedResponsibilities = form.watch("responsibilities") || [];

  // Obtener datos del estándar 1.1.1 para el AutomationAssistant
  const estandar111 = getEstandarByCodigo('1.1.1');
  
  // Handler para auto-fill basado en plantilla
  const handleAutoFill = (datos: Record<string, any>) => {
    // Pre-seleccionar posición recomendada según tamaño de empresa
    if (datos.position) {
      form.setValue("position", datos.position);
      if (POSITION_RESPONSIBILITIES[datos.position]) {
        form.setValue("responsibilities", POSITION_RESPONSIBILITIES[datos.position]);
      }
    }
    toast({
      title: "Datos cargados",
      description: "Se han pre-cargado los datos según la normativa aplicable",
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  // Handler para auto-fill desde dropdown predefinido
  const handleAutoFillFromPredefinido = (position: string) => {
    if (!position) return;
    
    form.setValue("position", position);
    if (POSITION_RESPONSIBILITIES[position]) {
      form.setValue("responsibilities", POSITION_RESPONSIBILITIES[position]);
    }
    
    toast({
      title: "Cargo predefinido aplicado",
      description: `Se aplicó: ${position}`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const predefinedPositions = Object.keys(POSITION_RESPONSIBILITIES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" />
                Designación de Responsables
              </CardTitle>
              <CardDescription>
                Gestión de designaciones de responsables del Sistema de Gestión SST
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog} data-testid="button-create-designation">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Designación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDesignation ? "Editar Designación" : "Nueva Designación de Responsable SST"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDesignation
                      ? "Actualice la información de la designación"
                      : "Registre la designación del responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo"}
                  </DialogDescription>
                </DialogHeader>

                {!editingDesignation && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione un cargo predefinido para auto-rellenar las responsabilidades</p>
                        </div>
                        <div className="flex gap-2">
                          <Select value={selectedPredefinido} onValueChange={(value) => {
                            setSelectedPredefinido(value);
                            handleAutoFillFromPredefinido(value);
                          }}>
                            <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-predefinido">
                              <SelectValue placeholder="Seleccione un cargo predefinido..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              {predefinedPositions.map((position) => (
                                <SelectItem key={position} value={position}>
                                  {position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="workerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trabajador *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-fill cargo específico basado en el cargo del trabajador
                              const selectedWorker = workers.find(w => w.id === value);
                              console.log("[ResponsibleDesignation] Worker selected:", {
                                workerId: value,
                                selectedWorker: selectedWorker,
                                hasJobProfileId: selectedWorker?.jobProfileId,
                                jobProfileIdValue: selectedWorker?.jobProfileId || "NO TIENE"
                              });
                              if (selectedWorker && !editingDesignation) {
                                const workerPosition = selectedWorker.position;
                                // Buscar si el cargo del trabajador coincide con algún cargo SST predefinido
                                const matchingPosition = Object.keys(POSITION_RESPONSIBILITIES).find(
                                  pos => workerPosition.toLowerCase().includes(pos.toLowerCase()) ||
                                         pos.toLowerCase().includes(workerPosition.toLowerCase())
                                );
                                if (matchingPosition) {
                                  form.setValue("position", matchingPosition);
                                  form.setValue("responsibilities", POSITION_RESPONSIBILITIES[matchingPosition]);
                                }
                                
                                // PRIORIDAD 1: Si el trabajador tiene jobProfileId asignado, usarlo directamente
                                if (selectedWorker.jobProfileId) {
                                  form.setValue("jobProfileId", selectedWorker.jobProfileId);
                                  const workerProfile = jobProfiles.find(p => p.id === selectedWorker.jobProfileId);
                                  if (workerProfile) {
                                    toast({
                                      title: "Perfil de cargo vinculado",
                                      description: `Se asignó el perfil: ${workerProfile.name}`,
                                      className: "bg-blue-50 border-blue-200",
                                    });
                                  }
                                } else {
                                  // PRIORIDAD 2: Buscar coincidencia por nombre de cargo
                                  const matchingProfile = jobProfiles.find(
                                    p => p.name.toLowerCase().includes(workerPosition.toLowerCase()) ||
                                         workerPosition.toLowerCase().includes(p.name.toLowerCase())
                                  );
                                  if (matchingProfile) {
                                    form.setValue("jobProfileId", matchingProfile.id);
                                  }
                                }
                                
                                // AUTO-FILL: Buscar designaciones anteriores del trabajador para traer información de licencia SST
                                const previousDesignation = designations.find(d => d.workerId === value);
                                if (previousDesignation) {
                                  // Auto-rellenar información de Licencia SST del trabajador
                                  if (previousDesignation.licenciaSstTitular) {
                                    form.setValue("licenciaSstTitular", previousDesignation.licenciaSstTitular);
                                  }
                                  if (previousDesignation.licenciaSstNumero) {
                                    form.setValue("licenciaSstNumero", previousDesignation.licenciaSstNumero);
                                  }
                                  if (previousDesignation.licenciaSstVigencia) {
                                    form.setValue("licenciaSstVigencia", previousDesignation.licenciaSstVigencia);
                                  }
                                  if (previousDesignation.nivelFormacion) {
                                    form.setValue("nivelFormacion", previousDesignation.nivelFormacion);
                                  }
                                  if (previousDesignation.curso50Horas) {
                                    form.setValue("curso50Horas", previousDesignation.curso50Horas);
                                  }
                                  if (previousDesignation.curso50HorasFecha) {
                                    form.setValue("curso50HorasFecha", previousDesignation.curso50HorasFecha);
                                  }
                                  
                                  toast({
                                    title: "Datos de Licencia SST cargados",
                                    description: `Se ha cargado la información de licencia SST del trabajador ${selectedWorker.name}`,
                                    className: "bg-green-50 border-green-200",
                                  });
                                }
                              }
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-worker">
                                <SelectValue placeholder="Seleccione un trabajador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={worker.id} value={worker.id}>
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
                      name="jobProfileId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perfil de Cargo</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-job-profile">
                                <SelectValue placeholder="Ninguno (Opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {jobProfiles
                                .filter((profile) => profile.isActive === 1)
                                .map((profile) => (
                                  <SelectItem key={profile.id} value={profile.id}>
                                    {profile.name} - {profile.riskClass}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Vincule esta designación con un perfil de cargo para ver sus riesgos, EPP y exámenes médicos requeridos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="designationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Designación *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-designation-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo Específico *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Autoseleccionar responsabilidades SOLO al crear una nueva designación
                              // No sobrescribir si estamos editando una existente
                              if (!editingDesignation && POSITION_RESPONSIBILITIES[value]) {
                                form.setValue("responsibilities", POSITION_RESPONSIBILITIES[value]);
                              }
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-position">
                                <SelectValue placeholder="Seleccione el cargo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Empleador/Gerente">Empleador/Gerente</SelectItem>
                              <SelectItem value="Responsable del SG-SST">Responsable del SG-SST</SelectItem>
                              <SelectItem value="Coordinador SST">Coordinador SST</SelectItem>
                              <SelectItem value="Líder del COPASST">Líder del COPASST</SelectItem>
                              <SelectItem value="Presidente del COPASST">Presidente del COPASST</SelectItem>
                              <SelectItem value="Secretario del COPASST">Secretario del COPASST</SelectItem>
                              <SelectItem value="Líder del Comité de Convivencia">Líder del Comité de Convivencia</SelectItem>
                              <SelectItem value="Presidente del Comité de Convivencia">Presidente del Comité de Convivencia</SelectItem>
                              <SelectItem value="Secretario del Comité de Convivencia">Secretario del Comité de Convivencia</SelectItem>
                              <SelectItem value="Responsable del Plan de Emergencias">
                                Responsable del Plan de Emergencias
                              </SelectItem>
                              <SelectItem value="Vigía de Seguridad y Salud">Vigía de Seguridad y Salud</SelectItem>
                              <SelectItem value="Brigadista de Emergencias">Brigadista de Emergencias</SelectItem>
                              <SelectItem value="Líder del PESV">Líder del PESV</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsibilities"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Responsabilidades *</FormLabel>
                            <FormDescription>
                              Las responsabilidades se seleccionan automáticamente al elegir el cargo. 
                              Puede desmarcar las que no apliquen para su empresa.
                            </FormDescription>
                          </div>
                          {availableResponsibilities.length === 0 ? (
                            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                              Seleccione un cargo para ver las responsabilidades según Resolución 0312/2019
                            </div>
                          ) : (
                            <div className="space-y-3 rounded-md border p-4 max-h-96 overflow-y-auto">
                              {availableResponsibilities.map((responsibility, index) => (
                                <FormField
                                  key={index}
                                  control={form.control}
                                  name="responsibilities"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={index}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(responsibility)}
                                            onCheckedChange={(checked) => {
                                              const currentValue = field.value || [];
                                              return checked
                                                ? field.onChange([...currentValue, responsibility])
                                                : field.onChange(
                                                    currentValue.filter((value) => value !== responsibility)
                                                  );
                                            }}
                                            data-testid={`checkbox-responsibility-${index}`}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="text-sm font-normal cursor-pointer">
                                            {index + 1}. {responsibility}
                                          </FormLabel>
                                        </div>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          <FormMessage />
                          {selectedResponsibilities.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              {selectedResponsibilities.length} responsabilidades seleccionadas
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Sección: Información de Licencia SST - Resolución 0312/2019 */}
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Información de Licencia SST (Resolución 0312/2019)
                      </h4>
                      
                      <FormField
                        control={form.control}
                        name="licenciaSstTitular"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Titular de la Licencia</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nombre completo del profesional licenciado" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-licencia-sst-titular" 
                              />
                            </FormControl>
                            <FormDescription>
                              Nombre del profesional que posee la licencia SST
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="licenciaSstNumero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Licencia SST</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ej: 12345-2024" 
                                  {...field} 
                                  value={field.value || ""}
                                  data-testid="input-licencia-sst-numero" 
                                />
                              </FormControl>
                              <FormDescription>
                                Número de resolución de la licencia en SST
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licenciaSstVigencia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Vigencia de Licencia</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  value={field.value || ""}
                                  data-testid="input-licencia-sst-vigencia" 
                                />
                              </FormControl>
                              <FormDescription>
                                Fecha hasta la cual es válida la licencia
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="nivelFormacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel de Formación</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-nivel-formacion">
                                  <SelectValue placeholder="Seleccione el nivel de formación" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Técnico">Técnico</SelectItem>
                                <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                                <SelectItem value="Profesional">Profesional</SelectItem>
                                <SelectItem value="Especialista">Especialista</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Nivel de formación académica en SST
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border-t pt-4">
                        <FormField
                          control={form.control}
                          name="curso50Horas"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-curso-50-horas"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  ¿Tiene Curso de 50 horas en SST?
                                </FormLabel>
                                <FormDescription>
                                  Requerido para empresas de menos de 10 trabajadores sin licencia SST
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {curso50HorasChecked && (
                          <FormField
                            control={form.control}
                            name="curso50HorasFecha"
                            render={({ field }) => (
                              <FormItem className="mt-4 ml-6">
                                <FormLabel>Fecha del Certificado del Curso</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    value={field.value || ""}
                                    data-testid="input-curso-50-horas-fecha" 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Fecha de expedición del certificado del curso virtual de 50 horas
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="activo">Activo</SelectItem>
                              <SelectItem value="inactivo">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createDesignationMutation.isPending || updateDesignationMutation.isPending}
                        data-testid="button-submit-designation"
                      >
                        {editingDesignation ? "Actualizar Designación" : "Crear Designación"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {estandar111 && (
            <AutomationAssistant
              titulo="Designación de Responsable del SG-SST"
              estandar={estandar111.codigo}
              descripcion="Normativa aplicable para la asignación de una persona que diseña el Sistema de Gestión de Seguridad y Salud en el Trabajo"
              normativaAplicable={estandar111.normativaAplicable}
              compact={true}
            />
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-worker">Responsable</TableHead>
                  <TableHead data-testid="header-position">Cargo</TableHead>
                  <TableHead data-testid="header-responsibilities">Responsabilidades</TableHead>
                  <TableHead data-testid="header-licencia-sst">Licencia SST</TableHead>
                  <TableHead data-testid="header-date">Fecha Designación</TableHead>
                  <TableHead data-testid="header-status">Estado</TableHead>
                  <TableHead data-testid="header-actions">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center" data-testid="text-loading">
                      Cargando designaciones...
                    </TableCell>
                  </TableRow>
                ) : designations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center" data-testid="text-no-designations">
                      No hay designaciones registradas. Cree la primera designación para comenzar.
                    </TableCell>
                  </TableRow>
                ) : (
                  designations.map((designation) => (
                    <TableRow key={designation.id} data-testid={`row-designation-${designation.id}`}>
                      <TableCell data-testid={`text-worker-${designation.id}`}>
                        <div className="font-medium">{getWorkerName(designation.workerId)}</div>
                      </TableCell>
                      <TableCell data-testid={`text-position-${designation.id}`}>
                        {designation.position}
                      </TableCell>
                      <TableCell data-testid={`text-responsibilities-${designation.id}`}>
                        <Badge variant="secondary">
                          {designation.responsibilities.length} responsabilidades
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-licencia-sst-${designation.id}`}>
                        <div className="space-y-1">
                          {designation.licenciaSstNumero ? (
                            <div className="text-sm">
                              <span className="font-medium">Lic: </span>
                              {designation.licenciaSstNumero}
                              {designation.licenciaSstVigencia && (
                                <span className="text-muted-foreground ml-1">
                                  (Vence: {new Date(designation.licenciaSstVigencia).toLocaleDateString("es-CO")})
                                </span>
                              )}
                            </div>
                          ) : designation.curso50Horas ? (
                            <Badge variant="outline" className="text-xs">
                              Curso 50h
                              {designation.curso50HorasFecha && (
                                <span className="ml-1">
                                  ({new Date(designation.curso50HorasFecha).toLocaleDateString("es-CO")})
                                </span>
                              )}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                          {designation.nivelFormacion && (
                            <Badge variant="secondary" className="text-xs">
                              {designation.nivelFormacion}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-date-${designation.id}`}>
                        {new Date(designation.designationDate).toLocaleDateString("es-CO")}
                      </TableCell>
                      <TableCell data-testid={`text-status-${designation.id}`}>
                        <Badge variant={designation.status === "activo" ? "default" : "secondary"}>
                          {designation.status === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(designation)}
                            data-testid={`button-edit-${designation.id}`}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(`/api/responsible-designations/${designation.id}/acta-pdf`, '_blank');
                            }}
                            data-testid={`button-acta-pdf-${designation.id}`}
                            title="Generar Acta de Designación (PDF)"
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Acta PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(designation.id)}
                            data-testid={`button-delete-${designation.id}`}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className={lsoAssignment ? "border-green-200 bg-green-50/50" : "border-primary/20"}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className={`h-5 w-5 ${lsoAssignment ? "text-green-600" : "text-primary"}`} />
            Profesional LSO {lsoAssignment ? "Asignado" : ""}
          </CardTitle>
          <CardDescription>
            Licenciado en Seguridad y Salud en el Trabajo para firmar documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lsoAssignment ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{lsoAssignment.name}</span>
                  <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                    {lsoAssignment.type === 'external' ? 'Externo' : 'Interno'}
                  </Badge>
                </div>
                {lsoAssignment.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lsoAssignment.email}</span>
                  </div>
                )}
                {lsoAssignment.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lsoAssignment.phone}</span>
                  </div>
                )}
                {lsoAssignment.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lsoAssignment.city}</span>
                  </div>
                )}
                {lsoAssignment.licenseNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Licencia: {lsoAssignment.licenseNumber}</span>
                  </div>
                )}
                {lsoAssignment.licenseExpiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Vence: {new Date(lsoAssignment.licenseExpiry).toLocaleDateString('es-CO')}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Puede asignar un profesional LSO del directorio externo para que firme las investigaciones de accidentes
                y otros documentos que requieren la validación de un licenciado en SST.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Información Normativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Resolución 0312/2019:</strong> Establece los estándares mínimos del Sistema de Gestión de la
            Seguridad y Salud en el Trabajo (SG-SST).
          </p>
          <p>
            <strong>Responsable del SG-SST:</strong> Persona designada por la alta dirección para liderar la
            implementación, mantenimiento y mejora continua del sistema de gestión.
          </p>
          <p className="text-muted-foreground">
            El responsable debe contar con licencia en Seguridad y Salud en el Trabajo o curso virtual de 50 horas
            (para empresas de menos de 10 trabajadores).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
