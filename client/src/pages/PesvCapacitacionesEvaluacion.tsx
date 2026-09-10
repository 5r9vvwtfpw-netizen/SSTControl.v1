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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, GraduationCap, Search, Sparkles, RefreshCw, Users, UserPlus, UsersRound, Trash2, Bot } from "lucide-react";
import { EvaluacionPesvContextHeader } from "@/components/EvaluacionPesvContextHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { hasCompanyAdminAccess, canWrite } from "@shared/permissions";
import type { EvaluacionPesv, RoadSafetyTraining, Worker } from "@shared/schema";

interface PlantillaCapacitacion {
  title: string;
  description: string;
  topics: string;
  instructor: string;
  startTime: string;
  endTime: string;
  location: string;
}

const PLANTILLAS: PlantillaCapacitacion[] = [
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
  contentType: "presencial" as string,
  contentUrl: "" as string,
  contentText: "" as string,
};

interface PesvTrainingForDialog {
  id: string;
  title: string;
  trainingDate: string;
  totalAttendees: number | null;
}

interface PesvAsistentesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  training: PesvTrainingForDialog;
  workers: Worker[];
  evaluacionId: string;
}

function PesvAsistentesDialog({ isOpen, onClose, training, workers, evaluacionId }: PesvAsistentesDialogProps) {
  const { toast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedCargo, setSelectedCargo] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings", training.id, "worker-attendees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/evaluaciones-pesv", evaluacionId, "capacitaciones", "worker-counts"] });
  };

  const { data: attendees = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/road-safety-trainings", training.id, "worker-attendees"],
    queryFn: async () => {
      const res = await fetch(`/api/road-safety-trainings/${training.id}/worker-attendees`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar asistentes");
      return res.json();
    },
    enabled: isOpen,
  });

  const addMutation = useMutation({
    mutationFn: async (workerIds: string[]) => {
      const res = await apiRequest("POST", `/api/road-safety-trainings/${training.id}/invite-workers`, { workerIds });
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Trabajador agregado", description: "El trabajador ha sido agregado a la capacitación", className: "bg-green-50 border-green-200" });
      setSelectedWorkerId("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addBulkMutation = useMutation({
    mutationFn: async (workerIds: string[]) => {
      const res = await apiRequest("POST", `/api/road-safety-trainings/${training.id}/invite-workers`, { workerIds });
      return res.json();
    },
    onSuccess: (data: any) => {
      invalidate();
      const added = data?.invitations?.length ?? 0;
      toast({
        title: "✅ Trabajadores agregados",
        description: added > 0 ? `${added} trabajador(es) agregado(s) a la capacitación.` : "Todos ya estaban inscritos.",
        className: "bg-green-50 border-green-200",
      });
      setSelectedCargo("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (workerId: string) => {
      return await apiRequest("DELETE", `/api/road-safety-trainings/${training.id}/worker-attendees/${workerId}`);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Asistente eliminado", description: "El trabajador ha sido removido de la capacitación", className: "bg-yellow-50 border-yellow-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addedWorkerIds = new Set(attendees.map((a: any) => a.workerId));
  const availableWorkers = workers.filter(w => w.status === "activo" && !addedWorkerIds.has(w.id));
  const cargosDisponibles = Array.from(
    new Set(availableWorkers.map(w => w.position).filter(Boolean))
  ).sort() as string[];

  const getWorkerPosition = (workerId: string) => {
    const w = workers.find(w => w.id === workerId);
    return w?.position || "";
  };

  const totalCupo = training.totalAttendees ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asistentes a la Capacitación
          </DialogTitle>
          <DialogDescription>
            {training.title} - {new Date(training.trainingDate).toLocaleDateString("es-CO")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── Agregar uno por uno ───────────────────────── */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Agregar Trabajador</label>
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger data-testid="select-worker-attendee">
                  <SelectValue placeholder="Seleccione un trabajador" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Todos los trabajadores ya están agregados
                    </div>
                  ) : (
                    availableWorkers.map(worker => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} - {worker.identificationNumber}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => selectedWorkerId && addMutation.mutate([selectedWorkerId])}
              disabled={!selectedWorkerId || addMutation.isPending}
              className="gap-1"
              data-testid="button-add-attendee"
            >
              <UserPlus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          {/* ── Agregar en grupo ─────────────────────────── */}
          {availableWorkers.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agregar en grupo</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={selectedCargo} onValueChange={setSelectedCargo}>
                  <SelectTrigger className="w-52" data-testid="select-cargo-bulk">
                    <SelectValue placeholder="Filtrar por cargo…" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargosDisponibles.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectedCargo || addBulkMutation.isPending}
                  onClick={() => {
                    const ids = availableWorkers
                      .filter(w => (w.position || "").toLowerCase() === selectedCargo.toLowerCase())
                      .map(w => w.id);
                    if (ids.length > 0) addBulkMutation.mutate(ids);
                  }}
                  data-testid="button-agregar-por-cargo"
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Agregar por cargo
                  {selectedCargo && (
                    <span className="ml-1 text-xs">
                      ({availableWorkers.filter(w => (w.position || "").toLowerCase() === selectedCargo.toLowerCase()).length})
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={addBulkMutation.isPending}
                  onClick={() => addBulkMutation.mutate(availableWorkers.map(w => w.id))}
                  data-testid="button-agregar-todos"
                  className="gap-1"
                >
                  <UsersRound className="h-4 w-4" />
                  Agregar todos ({availableWorkers.length})
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="font-medium mb-2">
              Trabajadores Inscritos ({attendees.length})
            </h4>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Cargando...</div>
            ) : attendees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay trabajadores inscritos</p>
                <p className="text-sm mt-1">Agregue trabajadores usando el selector de arriba</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-center">Confirmó</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee: any) => (
                    <TableRow key={attendee.id} data-testid={`row-attendee-${attendee.id}`}>
                      <TableCell className="font-medium" data-testid={`text-attendee-name-${attendee.id}`}>
                        {attendee.workerName}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-attendee-document-${attendee.id}`}>
                        {attendee.workerDocument}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-attendee-position-${attendee.id}`}>
                        {getWorkerPosition(attendee.workerId)}
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-attendee-confirmed-${attendee.id}`}>
                        {attendee.confirmedAt ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Sí</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("¿Está seguro de eliminar este asistente?")) {
                              removeMutation.mutate(attendee.workerId);
                            }
                          }}
                          title="Eliminar"
                          data-testid={`button-remove-attendee-${attendee.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {attendees.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h5 className="font-medium mb-2">Resumen</h5>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Badge variant="default">{attendees.length}</Badge>
                    <span className="text-muted-foreground">Inscritos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{Math.max(0, totalCupo - attendees.length)}</Badge>
                    <span className="text-muted-foreground">Cupos disponibles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} data-testid="button-close-attendees-dialog">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PesvCapacitacionesEvaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? canWrite(user.role, 'road_safety_trainings') : false;

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

  // Asistentes dialog (SST pattern)
  const [asistentesDialogOpen, setAsistentesDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<RoadSafetyTraining | null>(null);

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

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setAutoFilled(false);
    setSelectedTemplate("");
  };

  const applyTemplate = (templateTitle: string) => {
    const template = PLANTILLAS.find(t => t.title === templateTitle);
    if (!template) return;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dateStr = nextMonth.toISOString().split("T")[0];
    setFormData({
      title: template.title,
      description: template.description,
      instructor: template.instructor,
      trainingDate: dateStr,
      startTime: template.startTime,
      endTime: template.endTime,
      location: template.location,
      topics: template.topics,
      totalAttendees: "",
      status: "programada",
      contentType: "presencial",
      contentUrl: "",
      contentText: "",
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
      totalAttendees: training.totalAttendees || "",
      status: training.status as typeof emptyForm.status,
      contentType: (training as any).contentType || "presencial",
      contentUrl: (training as any).contentUrl || "",
      contentText: (training as any).contentText || "",
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
    setAsistentesDialogOpen(true);
  };

  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const TrainingFormFields = ({ data, setData }: { data: typeof emptyForm; setData: (d: typeof emptyForm) => void }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <Label htmlFor="f-title">Título de la Capacitación *</Label>
        <Input id="f-title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Ej: Manejo defensivo y prevención de siniestros viales" data-testid="input-title" />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="f-description">Descripción (opcional)</Label>
        <Textarea id="f-description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Describa el contenido de la capacitación..." data-testid="textarea-description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-instructor">Instructor (opcional)</Label>
        <Input id="f-instructor" value={data.instructor} onChange={e => setData({ ...data, instructor: e.target.value })} placeholder="Nombre del instructor" data-testid="input-instructor" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-date">Fecha *</Label>
        <Input id="f-date" type="date" value={data.trainingDate} onChange={e => setData({ ...data, trainingDate: e.target.value })} data-testid="input-training-date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-start">Hora de Inicio (opcional)</Label>
        <Input id="f-start" type="time" value={data.startTime} onChange={e => setData({ ...data, startTime: e.target.value })} data-testid="input-start-time" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-end">Hora de Fin (opcional)</Label>
        <Input id="f-end" type="time" value={data.endTime} onChange={e => setData({ ...data, endTime: e.target.value })} data-testid="input-end-time" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-location">Ubicación (opcional)</Label>
        <Input id="f-location" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} placeholder="Lugar de la capacitación" data-testid="input-location" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-total">Cupo Total (opcional)</Label>
        <Input id="f-total" type="number" min="1" value={data.totalAttendees} onChange={e => setData({ ...data, totalAttendees: e.target.value === "" ? "" : parseInt(e.target.value, 10) })} placeholder="Número de cupos" data-testid="input-total-attendees" />
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
      <div className="space-y-2 col-span-2">
        <Label htmlFor="f-topics">Temas (opcional)</Label>
        <Textarea id="f-topics" value={data.topics} onChange={e => setData({ ...data, topics: e.target.value })} placeholder="Temas a tratar..." data-testid="textarea-topics" />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="f-content-type">Tipo de Contenido</Label>
        <Select value={data.contentType} onValueChange={v => setData({ ...data, contentType: v, contentUrl: "", contentText: "" })}>
          <SelectTrigger id="f-content-type" data-testid="select-content-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="presencial">Presencial (sin contenido digital)</SelectItem>
            <SelectItem value="video">Video (URL)</SelectItem>
            <SelectItem value="pdf">PDF (URL)</SelectItem>
            <SelectItem value="formulario">Formulario (URL)</SelectItem>
            <SelectItem value="texto">Texto / Descripción</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(data.contentType === "video" || data.contentType === "pdf" || data.contentType === "formulario") && (
        <div className="space-y-2 col-span-2">
          <Label htmlFor="f-content-url">
            {data.contentType === "video" ? "URL del Video" : data.contentType === "pdf" ? "URL del PDF" : "URL del Formulario"}
          </Label>
          <Input id="f-content-url" type="url" value={data.contentUrl} onChange={e => setData({ ...data, contentUrl: e.target.value })} placeholder={data.contentType === "video" ? "https://youtube.com/..." : data.contentType === "pdf" ? "https://ejemplo.com/doc.pdf" : "https://forms.google.com/..."} data-testid="input-content-url" />
        </div>
      )}
      {data.contentType === "texto" && (
        <div className="space-y-2 col-span-2">
          <Label htmlFor="f-content-text">Contenido de Texto</Label>
          <Textarea id="f-content-text" value={data.contentText} onChange={e => setData({ ...data, contentText: e.target.value })} placeholder="Escribe el contenido que verán los trabajadores..." rows={4} data-testid="input-content-text" />
        </div>
      )}
      <div className="col-span-2 text-xs text-muted-foreground">
        Los campos marcados con * son obligatorios
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Programar Capacitación</DialogTitle>
                  <DialogDescription>Complete los datos de la capacitación en seguridad vial</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione una plantilla para auto-rellenar los campos</p>
                          </div>
                          {autoFilled && (
                            <Button type="button" variant="ghost" size="sm" onClick={resetForm} data-testid="button-reset-form">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Limpiar
                            </Button>
                          )}
                        </div>
                        <Select value={selectedTemplate} onValueChange={applyTemplate}>
                          <SelectTrigger className="bg-white dark:bg-gray-950" data-testid="select-template">
                            <SelectValue placeholder="Seleccione una plantilla de capacitación..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {PLANTILLAS.map(t => (
                              <SelectItem key={t.title} value={t.title}>{t.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {autoFilled && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Campos auto-completados. Revise y ajuste si es necesario.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
          {/* Search + filter */}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Capacitación</DialogTitle>
            <DialogDescription>Modifique los datos de la capacitación en seguridad vial</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <TrainingFormFields data={editFormData} setData={setEditFormData} />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit">Cancelar</Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Asistentes Dialog — mismo patrón que SST */}
      {selectedTraining && (
        <PesvAsistentesDialog
          isOpen={asistentesDialogOpen}
          onClose={() => {
            setAsistentesDialogOpen(false);
            setSelectedTraining(null);
          }}
          training={selectedTraining}
          workers={workers}
          evaluacionId={evaluacionId!}
        />
      )}
    </div>
  );
}
