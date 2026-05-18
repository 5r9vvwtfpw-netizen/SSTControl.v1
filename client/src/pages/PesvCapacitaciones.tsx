import { TrainingCard } from "@/components/TrainingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Filter, Users, Bot } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RoadSafetyTraining, Driver, Worker, insertRoadSafetyTrainingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { TrazabilidadCapacitacionesSstPesvBanner } from "@/components/pesv/TrazabilidadCapacitacionesSstPesvBanner";
import HelpVideoButton from "@/components/HelpVideoButton";

const pesvPlantillas = [
  { codigo: "PESV-01", titulo: "Manejo defensivo y prevención de siniestros viales", descripcion: "Técnicas de conducción defensiva para prevenir accidentes de tránsito. Incluye distancias de seguridad, puntos ciegos, condiciones adversas y técnicas de frenado de emergencia conforme a la Resolución 40595/2022." },
  { codigo: "PESV-02", titulo: "Normas de tránsito y señalización vial", descripcion: "Revisión de las normas de tránsito vigentes, señales de tránsito, semáforos y reglamentación vial conforme al Código Nacional de Tránsito." },
  { codigo: "PESV-03", titulo: "Primeros auxilios en accidentes de tránsito", descripcion: "Procedimientos básicos de primeros auxilios ante un accidente vial: evaluación de la escena, atención al lesionado, llamada de emergencia y posición lateral de seguridad." },
  { codigo: "PESV-04", titulo: "Fatiga y somnolencia al volante", descripcion: "Identificación de síntomas de fatiga y somnolencia, estrategias de prevención, importancia del descanso y efectos del sueño en la conducción." },
  { codigo: "PESV-05", titulo: "Alcohol, drogas y conducción", descripcion: "Efectos del alcohol y sustancias psicoactivas en la conducción, normativa colombiana sobre límites legales y consecuencias legales." },
  { codigo: "PESV-06", titulo: "Revisión técnico-mecánica y mantenimiento preventivo", descripcion: "Importancia de la revisión técnico-mecánica, lista de verificación del vehículo antes de conducir y mantenimiento preventivo básico." },
  { codigo: "PESV-07", titulo: "Seguridad vial para peatones y ciclistas", descripcion: "Comportamiento seguro en vías públicas para peatones y ciclistas, zonas de riesgo y respeto por los actores vulnerables de la vía." },
  { codigo: "PESV-08", titulo: "Manejo del estrés en la conducción", descripcion: "Identificación de factores estresantes al volante, técnicas de control emocional y estrategias para conducción tranquila y segura." },
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
  totalAttendees: 1,
  status: "programada" as const,
  contentType: "presencial" as string,
  contentUrl: "" as string,
  contentText: "" as string,
};

export default function PesvCapacitaciones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [selectedPlantilla, setSelectedPlantilla] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<RoadSafetyTraining | null>(null);
  const [editFormData, setEditFormData] = useState({ ...emptyForm });

  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<RoadSafetyTraining | null>(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const { data: trainings = [], isLoading: trainingsLoading } = useQuery<RoadSafetyTraining[]>({
    queryKey: ["/api/road-safety-trainings"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: allWorkerCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/road-safety-trainings/worker-counts"],
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
    mutationFn: async (data: z.infer<typeof insertRoadSafetyTrainingSchema>) => {
      const res = await apiRequest("POST", "/api/road-safety-trainings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings"] });
      setCreateOpen(false);
      setFormData({ ...emptyForm });
      setSelectedPlantilla("");
      toast({ title: "Capacitación creada", description: "La capacitación se ha registrado exitosamente", className: "bg-yellow-50 border-yellow-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertRoadSafetyTrainingSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/road-safety-trainings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings"] });
      setEditOpen(false);
      setEditingTraining(null);
      toast({ title: "Capacitación actualizada", description: "Los cambios se han guardado exitosamente", className: "bg-green-50 border-green-200" });
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
      toast({ title: "Asistencia guardada", description: "La asistencia se ha registrado exitosamente", className: "bg-yellow-50 border-yellow-200" });
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
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings/worker-counts"] });
      setInviteDialogOpen(false);
      setSelectedWorkerIds([]);
      toast({ title: "Trabajadores invitados", description: "Los trabajadores han sido notificados en su Portal de Empleados", className: "bg-yellow-50 border-yellow-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAutoFill = (codigo: string) => {
    const plantilla = pesvPlantillas.find(p => p.codigo === codigo);
    if (!plantilla) return;
    setFormData(prev => ({ ...prev, title: plantilla.titulo, description: plantilla.descripcion }));
    toast({ title: "Campos auto-completados", description: `Se rellenaron los campos con la plantilla "${plantilla.titulo}"`, className: "bg-green-50 border-green-200" });
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
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      instructor: formData.instructor || undefined,
      trainingDate: formData.trainingDate,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      location: formData.location || undefined,
      topics: formData.topics || undefined,
      totalAttendees: formData.totalAttendees || 1,
      status: formData.status,
      contentType: formData.contentType,
      contentUrl: formData.contentUrl || undefined,
      contentText: formData.contentText || undefined,
    });
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
      totalAttendees: training.totalAttendees || 1,
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
    updateMutation.mutate({
      id: editingTraining.id,
      data: {
        title: editFormData.title,
        description: editFormData.description || undefined,
        instructor: editFormData.instructor || undefined,
        trainingDate: editFormData.trainingDate,
        startTime: editFormData.startTime || undefined,
        endTime: editFormData.endTime || undefined,
        location: editFormData.location || undefined,
        topics: editFormData.topics || undefined,
        totalAttendees: editFormData.totalAttendees || 1,
        status: editFormData.status,
        contentType: editFormData.contentType,
        contentUrl: editFormData.contentUrl || undefined,
        contentText: editFormData.contentText || undefined,
      },
    });
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
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <Label htmlFor="title">Título de la Capacitación *</Label>
        <Input id="title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Ej: Conducción Defensiva" data-testid="input-title" />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Descripción de la capacitación" data-testid="input-description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructor">Instructor</Label>
        <Input id="instructor" value={data.instructor} onChange={e => setData({ ...data, instructor: e.target.value })} placeholder="Nombre del instructor" data-testid="input-instructor" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trainingDate">Fecha *</Label>
        <Input id="trainingDate" type="date" value={data.trainingDate} onChange={e => setData({ ...data, trainingDate: e.target.value })} required data-testid="input-training-date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startTime">Hora de Inicio</Label>
        <Input id="startTime" type="time" value={data.startTime} onChange={e => setData({ ...data, startTime: e.target.value })} data-testid="input-start-time" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endTime">Hora de Fin</Label>
        <Input id="endTime" type="time" value={data.endTime} onChange={e => setData({ ...data, endTime: e.target.value })} data-testid="input-end-time" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input id="location" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} placeholder="Lugar de la capacitación" data-testid="input-location" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalAttendees">Cupo Total</Label>
        <Input id="totalAttendees" type="number" min="1" value={data.totalAttendees || ""} onChange={e => setData({ ...data, totalAttendees: e.target.value === "" ? 1 : parseInt(e.target.value, 10) })} placeholder="Número de cupos" data-testid="input-total-attendees" />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="topics">Temas a Tratar</Label>
        <Textarea id="topics" value={data.topics} onChange={e => setData({ ...data, topics: e.target.value })} placeholder="Listado de temas que se cubrirán en la capacitación" data-testid="input-topics" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select value={data.status} onValueChange={v => setData({ ...data, status: v as typeof data.status })}>
          <SelectTrigger id="status" data-testid="select-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="en-curso">En Curso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contentType">Tipo de Contenido</Label>
        <Select value={data.contentType} onValueChange={v => setData({ ...data, contentType: v, contentUrl: "", contentText: "" })}>
          <SelectTrigger id="contentType" data-testid="select-content-type"><SelectValue /></SelectTrigger>
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
          <Label htmlFor="contentUrl">
            {data.contentType === "video" ? "URL del Video" : data.contentType === "pdf" ? "URL del PDF" : "URL del Formulario"}
          </Label>
          <Input id="contentUrl" type="url" value={data.contentUrl} onChange={e => setData({ ...data, contentUrl: e.target.value })} placeholder="https://..." data-testid="input-content-url" />
        </div>
      )}
      {data.contentType === "texto" && (
        <div className="space-y-2 col-span-2">
          <Label htmlFor="contentText">Contenido de Texto</Label>
          <Textarea id="contentText" value={data.contentText} onChange={e => setData({ ...data, contentText: e.target.value })} placeholder="Escribe aquí el contenido de la capacitación que verán los trabajadores..." rows={5} data-testid="input-content-text" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <BackToPesvEvaluationButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Capacitaciones de Seguridad Vial</h1>
          <p className="text-muted-foreground">Formación en seguridad vial y conducción defensiva</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <HelpVideoButton customRoute="/pesv/capacitaciones" testId="button-help-video-pesv-capacitaciones" />
          {isAdmin && (
            <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) { setFormData({ ...emptyForm }); setSelectedPlantilla(""); } }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-training">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Capacitación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Programar Capacitación</DialogTitle>
                  <DialogDescription>Complete los datos de la capacitación en seguridad vial</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Auto-completar con plantilla</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione una plantilla PESV para auto-rellenar título y descripción</p>
                        </div>
                        <Select value={selectedPlantilla} onValueChange={v => { setSelectedPlantilla(v); handleAutoFill(v); }}>
                          <SelectTrigger className="bg-white dark:bg-gray-950" data-testid="select-plantilla">
                            <SelectValue placeholder="Seleccione una plantilla predefinida..." />
                          </SelectTrigger>
                          <SelectContent>
                            {pesvPlantillas.map(p => (
                              <SelectItem key={p.codigo} value={p.codigo}>{p.codigo} - {p.titulo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <TrainingFormFields data={formData} setData={setFormData} />
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-training">
                      {createMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <TrazabilidadPesvBanner codigoPaso="H02" compacto />
      <TrazabilidadCapacitacionesSstPesvBanner direccion="pesv-to-sst" />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar capacitación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainingsLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground" data-testid="text-loading">
            Cargando capacitaciones...
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground" data-testid="text-no-trainings">
            No se encontraron capacitaciones
          </div>
        ) : (
          filteredTrainings.map(training => (
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
              pdfUrl={`/api/pesv/capacitaciones/${training.id}/lista-asistencia/pdf`}
              onEdit={handleEditClick}
              onManageAttendees={handleManageAttendeesClick}
            />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={open => { setEditOpen(open); if (!open) setEditingTraining(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div className="flex items-center justify-between mb-2">
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
