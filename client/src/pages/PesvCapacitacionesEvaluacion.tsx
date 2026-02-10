import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, GraduationCap, Calendar, Clock, MapPin, Users, Sparkles, RefreshCw } from "lucide-react";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EvaluacionPesv, RoadSafetyTraining } from "@shared/schema";

interface PlantillaCapacitacion {
  title: string;
  description: string;
  topics: string;
  instructor: string;
  startTime: string;
  endTime: string;
  location: string;
}

const PLANTILLAS_CAPACITACION_PESV: PlantillaCapacitacion[] = [
  {
    title: "Seguridad vial y normas de tránsito vigentes",
    description: "Capacitación sobre normativa de tránsito colombiana, Código Nacional de Tránsito (Ley 769/2002) y Resolución 40595/2022. Incluye señalización, derechos de vía y responsabilidades de conductores y peatones.",
    topics: "Ley 769/2002 - Código Nacional de Tránsito; Resolución 40595/2022 - PESV; Señalización vial (preventiva, reglamentaria, informativa); Derechos de vía y prioridades; Infracciones y sanciones; Responsabilidades del conductor",
    instructor: "Responsable PESV",
    startTime: "08:00",
    endTime: "10:00",
    location: "Sala de capacitación - sede principal",
  },
  {
    title: "Manejo defensivo y prevención de siniestros viales",
    description: "Técnicas de conducción defensiva para prevenir accidentes de tránsito. Incluye distancias de seguridad, puntos ciegos, condiciones adversas y técnicas de frenado de emergencia conforme a la Resolución 40595/2022.",
    topics: "Principios de conducción defensiva; Distancias de seguridad y tiempos de reacción; Manejo de puntos ciegos; Conducción en condiciones adversas (lluvia, niebla, noche); Técnicas de frenado de emergencia; Prevención de siniestros en zona urbana y rural",
    instructor: "Instructor de seguridad vial certificado",
    startTime: "08:00",
    endTime: "12:00",
    location: "Sala de capacitación - sede principal",
  },
  {
    title: "Inspección preoperacional de vehículos",
    description: "Procedimiento estandarizado de inspección preoperacional según la Resolución 40595/2022 Art. 16. Verificación de condiciones mecánicas, llantas, fluidos, luces, frenos y documentación del vehículo.",
    topics: "Formato de inspección preoperacional; Verificación de llantas y presión; Estado de frenos y sistema de dirección; Niveles de fluidos (aceite, refrigerante, frenos); Luces y sistema eléctrico; Espejos y elementos de seguridad; Documentación del vehículo (SOAT, RTM, tarjeta de propiedad)",
    instructor: "Coordinador de mantenimiento vehicular",
    startTime: "07:00",
    endTime: "09:00",
    location: "Patio de vehículos",
  },
  {
    title: "Uso correcto de elementos de protección personal vial",
    description: "Capacitación sobre selección, uso y cuidado de EPP para actividades viales: cinturones, cascos para motociclistas, chalecos reflectivos y elementos de señalización de emergencia.",
    topics: "Cinturón de seguridad - uso correcto; Casco para motociclistas - normativa NTC; Chalecos reflectivos y visibilidad; Kit de carretera (extintor, triángulos, botiquín); Señalización de emergencia en vía; Mantenimiento y reposición de EPP",
    instructor: "Responsable PESV",
    startTime: "09:00",
    endTime: "11:00",
    location: "Sala de capacitación - sede principal",
  },
  {
    title: "Primeros auxilios en siniestros viales",
    description: "Protocolo de atención inicial en caso de siniestro vial conforme a la Resolución 40595/2022 Art. 19. Incluye evaluación de la escena, triage, RCP básico y activación de servicios de emergencia.",
    topics: "Evaluación segura de la escena del siniestro; Activación del sistema de emergencias (123, 125, línea de atención); Triage básico - priorización de víctimas; RCP básico y uso de DEA; Control de hemorragias; Inmovilización básica de fracturas; Cadena de custodia y reporte del siniestro",
    instructor: "Profesional en atención prehospitalaria",
    startTime: "08:00",
    endTime: "12:00",
    location: "Sala de capacitación - sede principal",
  },
  {
    title: "Fatiga, somnolencia y consumo de sustancias psicoactivas",
    description: "Prevención de riesgos por fatiga, somnolencia y consumo de alcohol o sustancias psicoactivas en la conducción. Marco legal colombiano y política de alcohol y drogas de la organización.",
    topics: "Efectos de la fatiga y somnolencia en la conducción; Jornadas de conducción y descansos obligatorios; Ley 1696/2013 - Sanciones por conducción en estado de embriaguez; Política organizacional de alcohol y drogas; Pruebas de alcoholemia y controles; Medicamentos que afectan la conducción; Estrategias de prevención y autocuidado",
    instructor: "Profesional en seguridad y salud en el trabajo",
    startTime: "09:00",
    endTime: "11:00",
    location: "Sala de capacitación - sede principal",
  },
  {
    title: "Plan de emergencias viales y rutas seguras",
    description: "Socialización del plan de emergencias viales de la organización, identificación de rutas seguras, puntos críticos y protocolos de actuación ante siniestros viales conforme al PESV.",
    topics: "Plan de emergencias viales de la organización; Rutas seguras identificadas; Puntos críticos y zonas de alto riesgo; Protocolo de actuación ante siniestro; Cadena de llamadas y contactos de emergencia; Reporte e investigación de siniestros; Lecciones aprendidas de incidentes anteriores",
    instructor: "Responsable PESV",
    startTime: "08:00",
    endTime: "10:00",
    location: "Sala de capacitación - sede principal",
  },
  {
    title: "Seguridad vial para peatones y ciclistas",
    description: "Capacitación dirigida al personal no conductor sobre seguridad vial como actores viales vulnerables: peatones, ciclistas y usuarios de transporte público, conforme a la Resolución 40595/2022.",
    topics: "Derechos y deberes del peatón; Uso correcto de cruces peatonales y semáforos; Seguridad para ciclistas - Ley 1811/2016; Uso de elementos reflectivos y visibilidad; Seguridad en transporte público; Movilidad sostenible; Cultura vial y convivencia en la vía",
    instructor: "Responsable PESV",
    startTime: "10:00",
    endTime: "12:00",
    location: "Sala de capacitación - sede principal",
  },
];

export default function PesvCapacitacionesEvaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<RoadSafetyTraining | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    trainingDate: "",
    startTime: "",
    endTime: "",
    location: "",
    topics: "",
    totalAttendees: "",
    status: "programada" as const,
  });

  const { data: evaluacion, isLoading: evaluacionLoading } = useQuery<EvaluacionPesv>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar evaluación");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const { data: trainings = [], isLoading: trainingsLoading } = useQuery<RoadSafetyTraining[]>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones"],
    queryFn: async () => {
      const res = await fetch(`/api/evaluaciones-pesv/${evaluacionId}/capacitaciones`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar capacitaciones");
      return res.json();
    },
    enabled: !!evaluacionId,
  });

  const createTrainingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/capacitaciones`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Capacitación registrada",
        description: "La capacitación se ha registrado exitosamente",
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructor: "",
      trainingDate: "",
      startTime: "",
      endTime: "",
      location: "",
      topics: "",
      totalAttendees: "",
      status: "programada",
    });
    setAutoFilled(false);
    setSelectedTemplate("");
  };

  const applyTemplate = (templateTitle: string) => {
    const template = PLANTILLAS_CAPACITACION_PESV.find(t => t.title === templateTitle);
    if (!template) return;

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dateStr = nextMonth.toISOString().split("T")[0];

    const attendees = evaluacion?.numeroConductores || evaluacion?.numeroVehiculos || 10;

    setFormData({
      title: template.title,
      description: template.description,
      instructor: template.instructor,
      trainingDate: dateStr,
      startTime: template.startTime,
      endTime: template.endTime,
      location: template.location,
      topics: template.topics,
      totalAttendees: String(attendees),
      status: "programada",
    });
    setAutoFilled(true);
    setSelectedTemplate(templateTitle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      totalAttendees: parseInt(formData.totalAttendees) || 0,
    };
    createTrainingMutation.mutate(payload as any);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      programada: "outline",
      "en-curso": "secondary",
      completada: "default",
      cancelada: "destructive" as "default",
    };
    const labels: Record<string, string> = {
      programada: "Programada",
      "en-curso": "En Curso",
      completada: "Completada",
      cancelada: "Cancelada",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const isLoading = evaluacionLoading || trainingsLoading;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Capacitaciones en Seguridad Vial"
        currentPhase="hacer"
        isLoading={evaluacionLoading}
      />

      <div className="flex justify-end mb-4">
        <BackToPesvEvaluationButton />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Capacitaciones en Seguridad Vial</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-training">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capacitación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Programar Capacitación</DialogTitle>
                <DialogDescription>
                  Complete los datos de la capacitación en seguridad vial
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Auto-completar con plantilla
                  </Label>
                  {autoFilled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      data-testid="button-reset-form"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                <Select
                  value={selectedTemplate}
                  onValueChange={(value) => applyTemplate(value)}
                >
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="Seleccione una plantilla de capacitación..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANTILLAS_CAPACITACION_PESV.map((template) => (
                      <SelectItem key={template.title} value={template.title}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {autoFilled && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Todos los campos han sido auto-completados. Revise y ajuste si es necesario, luego guarde.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nombre de la capacitación"
                    data-testid="input-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describa el contenido de la capacitación..."
                    data-testid="textarea-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Nombre del instructor"
                    data-testid="input-instructor"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingDate">Fecha</Label>
                    <Input
                      id="trainingDate"
                      type="date"
                      value={formData.trainingDate}
                      onChange={(e) => setFormData({ ...formData, trainingDate: e.target.value })}
                      data-testid="input-training-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: typeof formData.status) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programada">Programada</SelectItem>
                        <SelectItem value="en-curso">En Curso</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      data-testid="input-start-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      data-testid="input-end-time"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Lugar de la capacitación"
                    data-testid="input-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topics">Temas</Label>
                  <Textarea
                    id="topics"
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                    placeholder="Temas a tratar en la capacitación..."
                    data-testid="textarea-topics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAttendees">Asistentes Esperados</Label>
                  <Input
                    id="totalAttendees"
                    inputMode="numeric"
                    value={formData.totalAttendees}
                    onChange={(e) => setFormData({ ...formData, totalAttendees: e.target.value })}
                    placeholder="Ej: 10"
                    data-testid="input-total-attendees"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTrainingMutation.isPending} data-testid="button-submit-training">
                    {createTrainingMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : trainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay capacitaciones registradas para esta evaluación</p>
              <p className="text-sm">Haga clic en "Nueva Capacitación" para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Asistentes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((training) => (
                  <TableRow key={training.id} data-testid={`row-training-${training.id}`}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {training.trainingDate}
                      </div>
                    </TableCell>
                    <TableCell>{training.instructor || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {training.totalAttendees || 0}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(training.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTraining(training);
                          setDetailDialogOpen(true);
                        }}
                        data-testid={`button-view-training-${training.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Capacitación</DialogTitle>
          </DialogHeader>
          {selectedTraining && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Título</Label>
                <p className="font-medium text-lg">{selectedTraining.title}</p>
              </div>
              {selectedTraining.description && (
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1">{selectedTraining.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{selectedTraining.trainingDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Horario</Label>
                  <p className="font-medium">
                    {selectedTraining.startTime || "N/A"} - {selectedTraining.endTime || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Instructor</Label>
                  <p className="font-medium">{selectedTraining.instructor || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ubicación</Label>
                  <p className="font-medium">{selectedTraining.location || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Asistentes</Label>
                  <p className="font-medium">{selectedTraining.totalAttendees || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedTraining.status)}</div>
                </div>
              </div>
              {selectedTraining.topics && (
                <div>
                  <Label className="text-muted-foreground">Temas</Label>
                  <p className="mt-1">{selectedTraining.topics}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
