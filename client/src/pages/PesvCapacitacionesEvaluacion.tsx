import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { TrainingCard } from "@/components/TrainingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, GraduationCap, Search, Sparkles, RefreshCw } from "lucide-react";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { hasCompanyAdminAccess } from "@shared/permissions";
import type { EvaluacionPesv, RoadSafetyTraining, Driver, Worker } from "@shared/schema";

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

const emptyForm = {
  title: "",
  description: "",
  instructor: "",
  trainingDate: "",
  startTime: "",
  endTime: "",
  location: "",
  topics: "",
  totalAttendees: "" as string | number,
  status: "programada" as "programada" | "en-curso" | "completada" | "cancelada",
};

export default function PesvCapacitacionesEvaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [autoFilled, setAutoFilled] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<RoadSafetyTraining | null>(null);
  const [editFormData, setEditFormData] = useState({ ...emptyForm });

  // Attendance / invite dialogs
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<RoadSafetyTraining | null>(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

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

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: allWorkerCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones", "worker-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const training of trainings) {
        try {
          const res = await fetch(`/api/road-safety-trainings/${training.id}/worker-attendees`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            counts[training.id] = Array.isArray(data) ? data.length : 0;
          } else {
            counts[training.id] = 0;
          }
        } catch {
          counts[training.id] = 0;
        }
      }
      return counts;
    },
    enabled: trainings.length > 0,
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ["/api/road-safety-attendees", selectedTraining?.id],
    queryFn: async () => {
      if (!selectedTraining?.id) return [];
      const res = await fetch(`/api/road-safety-attendees/${selectedTraining.id}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: !!selectedTraining,
  });

  const { data: invitedWorkers = [] } = useQuery({
    queryKey: ["/api/road-safety-trainings", selectedTraining?.id, "worker-attendees"],
    queryFn: async () => {
      if (!selectedTraining?.id) return [];
      const res = await fetch(`/api/road-safety-trainings/${selectedTraining.id}/worker-attendees`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedTraining,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", `/api/evaluaciones-pesv/${evaluacionId}/capacitaciones`, {
        ...data,
        totalAttendees: parseInt(String(data.totalAttendees)) || 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones"] });
      setCreateOpen(false);
      resetForm();
      toast({ title: "Capacitación registrada", description: "La capacitación se ha registrado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) => {
      const res = await apiRequest("PATCH", `/api/road-safety-trainings/${id}`, {
        ...data,
        totalAttendees: parseInt(String(data.totalAttendees)) || 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones"] });
      setEditOpen(false);
      setEditingTraining(null);
      toast({ title: "Capacitación actualizada", description: "Los cambios se han guardado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: { trainingId: string; attendance: Array<{ driverId: string; attended: number }> }) => {
      const res = await apiRequest("POST", "/api/road-safety-attendees/bulk", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-attendees", selectedTraining?.id] });
      setAttendanceDialogOpen(false);
      toast({ title: "Asistencia guardada", description: "La asistencia se ha registrado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const inviteWorkersMutation = useMutation({
    mutationFn: async (data: { trainingId: string; workerIds: string[] }) => {
      const res = await apiRequest("POST", `/api/road-safety-trainings/${data.trainingId}/invite-workers`, { workerIds: data.workerIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings", selectedTraining?.id, "worker-attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones", "worker-counts"] });
      setInviteDialogOpen(false);
      setSelectedWorkerIds([]);
      toast({ title: "Trabajadores invitados", description: "Los trabajadores han sido notificados en su Portal de Empleados" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setAutoFilled(false);
    setSelectedTemplate("");
  };

  const applyTemplate = (templateTitle: string) => {
    const template = PLANTILLAS_CAPACITACION_PESV.find(t => t.title === templateTitle);
    if (!template) return;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dateStr = nextMonth.toISOString().split("T")[0];
    const attendeesCount = (evaluacion as any)?.numeroConductores || (evaluacion as any)?.numeroVehiculos || 10;
    setFormData({
      title: template.title,
      description: template.description,
      instructor: template.instructor,
      trainingDate: dateStr,
      startTime: template.startTime,
      endTime: template.endTime,
      location: template.location,
      topics: template.topics,
      totalAttendees: String(attendeesCount),
      status: "programada",
    });
    setAutoFilled(true);
    setSelectedTemplate(templateTitle);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }
    if (!formData.trainingDate) {
      toast({ title: "Error", description: "La fecha es obligatoria", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditClick = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    if (!training) return;
    setEditingTraining(training);
    setEditFormData({
      title: training.title,
      description: training.description || "",
      instructor: training.instructor || "",
      trainingDate: training.trainingDate,
      startTime: training.startTime || "",
      endTime: training.endTime || "",
      location: training.location || "",
      topics: training.topics || "",
      totalAttendees: training.totalAttendees ?? "",
      status: training.status as typeof emptyForm.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;
    if (!editFormData.title.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ id: editingTraining.id, data: editFormData });
  };

  const handleManageAttendeesClick = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    if (!training) return;
    setSelectedTraining(training);
    const existingAttendance: Record<string, boolean> = {};
    attendees.forEach((a: any) => {
      existingAttendance[a.driverId] = a.attended === 1;
    });
    setAttendanceData(existingAttendance);
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedTraining) return;
    const attendance = Object.entries(attendanceData).map(([driverId, attended]) => ({
      driverId,
      attended: attended ? 1 : 0,
    }));
    saveAttendanceMutation.mutate({ trainingId: selectedTraining.id, attendance });
  };

  const handleInviteWorkers = () => {
    if (!selectedTraining || selectedWorkerIds.length === 0) return;
    inviteWorkersMutation.mutate({ trainingId: selectedTraining.id, workerIds: selectedWorkerIds });
  };

  const availableWorkers = workers.filter(w =>
    w.status === "activo" &&
    !invitedWorkers.some((inv: any) => inv.workerId === w.id)
  );

  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const TrainingFormFields = ({ data, setData }: { data: typeof emptyForm; setData: (d: typeof emptyForm) => void }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="f-title">Título *</Label>
        <Input id="f-title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Nombre de la capacitación" data-testid="input-title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-description">Descripción</Label>
        <Textarea id="f-description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Describa el contenido de la capacitación..." data-testid="textarea-description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-instructor">Instructor</Label>
        <Input id="f-instructor" value={data.instructor} onChange={e => setData({ ...data, instructor: e.target.value })} placeholder="Nombre del instructor" data-testid="input-instructor" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="f-date">Fecha *</Label>
          <Input id="f-date" type="date" value={data.trainingDate} onChange={e => setData({ ...data, trainingDate: e.target.value })} data-testid="input-training-date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-status">Estado</Label>
          <Select value={data.status} onValueChange={v => setData({ ...data, status: v as typeof data.status })}>
            <SelectTrigger id="f-status" data-testid="select-status"><SelectValue /></SelectTrigger>
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
          <Label htmlFor="f-start">Hora Inicio</Label>
          <Input id="f-start" type="time" value={data.startTime} onChange={e => setData({ ...data, startTime: e.target.value })} data-testid="input-start-time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-end">Hora Fin</Label>
          <Input id="f-end" type="time" value={data.endTime} onChange={e => setData({ ...data, endTime: e.target.value })} data-testid="input-end-time" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-location">Ubicación</Label>
        <Input id="f-location" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} placeholder="Lugar de la capacitación" data-testid="input-location" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-topics">Temas</Label>
        <Textarea id="f-topics" value={data.topics} onChange={e => setData({ ...data, topics: e.target.value })} placeholder="Temas a tratar..." data-testid="textarea-topics" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-attendees">Asistentes Esperados</Label>
        <Input id="f-attendees" type="number" min="1" value={data.totalAttendees || ""} onChange={e => setData({ ...data, totalAttendees: e.target.value === "" ? "" : parseInt(e.target.value, 10) })} placeholder="Ej: 10" data-testid="input-total-attendees" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <EvaluacionPesvContextHeader
        evaluacion={evaluacion}
        currentModule="Capacitaciones en Seguridad Vial"
        currentPhase="hacer"
        isLoading={evaluacionLoading}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Capacitaciones en Seguridad Vial</CardTitle>
          </div>
          {isAdmin && (
            <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-training">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Capacitación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Programar Capacitación</DialogTitle>
                  <DialogDescription>Complete los datos de la capacitación en seguridad vial</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Auto-completar con plantilla
                    </Label>
                    {autoFilled && (
                      <Button type="button" variant="ghost" size="sm" onClick={resetForm} data-testid="button-reset-form">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <Select value={selectedTemplate} onValueChange={applyTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue placeholder="Seleccione una plantilla de capacitación..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANTILLAS_CAPACITACION_PESV.map(t => (
                        <SelectItem key={t.title} value={t.title}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {autoFilled && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Campos auto-completados. Revise y ajuste si es necesario.
                      </p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <TrainingFormFields data={formData} setData={setFormData} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-training">
                      {createMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search + filter bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar capacitaciones..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="en-curso">En Curso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards grid */}
          {trainingsLoading || evaluacionLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : filteredTrainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay capacitaciones registradas para esta evaluación</p>
              {isAdmin && <p className="text-sm">Haga clic en "Nueva Capacitación" para comenzar</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrainings.map(training => (
                <TrainingCard
                  key={training.id}
                  id={training.id}
                  title={training.title}
                  date={new Date(training.trainingDate).toLocaleDateString("es-CO")}
                  attendees={allWorkerCounts[training.id] ?? 0}
                  totalWorkers={training.totalAttendees}
                  status={training.status as any}
                  canEdit={isAdmin}
                  canPrint
                  pdfUrl={`/api/evaluaciones-pesv/${evaluacionId}/capacitaciones/${training.id}/lista-asistencia/pdf`}
                  onEdit={handleEditClick}
                  onManageAttendees={handleManageAttendeesClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={open => { setEditOpen(open); if (!open) setEditingTraining(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Capacitación</DialogTitle>
            <DialogDescription>Modifique los datos de la capacitación</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <TrainingFormFields data={editFormData} setData={setEditFormData} />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendance Management Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Asistencia</DialogTitle>
            <DialogDescription>
              {selectedTraining?.title} — {selectedTraining && new Date(selectedTraining.trainingDate).toLocaleDateString("es-CO")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Conductores</p>
              {drivers.filter(d => d.status === "activo").length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay conductores activos registrados</p>
              ) : (
                drivers.filter(d => d.status === "activo").map(driver => (
                  <div key={driver.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`driver-${driver.id}`}
                      checked={attendanceData[driver.id] || false}
                      onCheckedChange={checked => setAttendanceData({ ...attendanceData, [driver.id]: checked as boolean })}
                      data-testid={`checkbox-driver-${driver.id}`}
                    />
                    <Label htmlFor={`driver-${driver.id}`}>{driver.name}</Label>
                  </div>
                ))
              )}
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-semibold text-sm">Trabajadores invitados al portal</p>
                <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)} data-testid="button-invite-workers">
                  <Plus className="h-4 w-4 mr-2" />
                  Invitar Trabajadores
                </Button>
              </div>
              {invitedWorkers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay trabajadores invitados</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-center">Confirmó</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitedWorkers.map((inv: any) => (
                      <TableRow key={inv.id} data-testid={`row-invited-worker-${inv.workerId}`}>
                        <TableCell className="font-medium">{inv.workerName}</TableCell>
                        <TableCell className="text-center">
                          {inv.confirmedAt ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Confirmó</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Pendiente</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>Cerrar</Button>
            <Button onClick={handleSaveAttendance} disabled={saveAttendanceMutation.isPending} data-testid="button-save-attendance">
              {saveAttendanceMutation.isPending ? "Guardando..." : "Guardar Asistencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Workers Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invitar Trabajadores</DialogTitle>
            <DialogDescription>
              Seleccione los trabajadores a invitar. Recibirán una notificación en su Portal de Empleados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableWorkers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay trabajadores disponibles para invitar</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableWorkers.map(worker => (
                  <div key={worker.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`worker-${worker.id}`}
                      checked={selectedWorkerIds.includes(worker.id)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedWorkerIds([...selectedWorkerIds, worker.id]);
                        } else {
                          setSelectedWorkerIds(selectedWorkerIds.filter(id => id !== worker.id));
                        }
                      }}
                      data-testid={`checkbox-worker-${worker.id}`}
                    />
                    <Label htmlFor={`worker-${worker.id}`}>
                      {worker.name}
                      <span className="text-muted-foreground ml-2 text-sm">({worker.position || "Sin cargo"})</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleInviteWorkers}
              disabled={inviteWorkersMutation.isPending || selectedWorkerIds.length === 0}
              data-testid="button-confirm-invite"
            >
              {inviteWorkersMutation.isPending ? "Invitando..." : `Invitar (${selectedWorkerIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
