import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Users, ArrowLeft, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RoadSafetyTraining, Driver, Worker, insertRoadSafetyTrainingSchema } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { TrazabilidadCapacitacionesSstPesvBanner } from "@/components/pesv/TrazabilidadCapacitacionesSstPesvBanner";

export default function PesvCapacitaciones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<RoadSafetyTraining | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    trainingDate: "",
    startTime: "",
    endTime: "",
    location: "",
    topics: "",
    totalAttendees: 0,
    status: "programada" as const,
  });

  const { data: trainings = [], isLoading: trainingsLoading } = useQuery<RoadSafetyTraining[]>({
    queryKey: ["/api/road-safety-trainings"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ["/api/road-safety-attendees", selectedTraining?.id],
    queryFn: async () => {
      if (!selectedTraining?.id) return [];
      const res = await fetch(`/api/road-safety-attendees/${selectedTraining.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: !!selectedTraining,
  });

  const { data: invitedWorkers = [] } = useQuery({
    queryKey: ["/api/road-safety-trainings", selectedTraining?.id, "worker-attendees"],
    queryFn: async () => {
      if (!selectedTraining?.id) return [];
      const res = await fetch(`/api/road-safety-trainings/${selectedTraining.id}/worker-attendees`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedTraining,
  });

  const createTrainingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRoadSafetyTrainingSchema>) => {
      const res = await apiRequest("POST", "/api/road-safety-trainings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Capacitación creada",
        description: "La capacitación se ha registrado exitosamente",
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

  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: { trainingId: string; attendance: Array<{ driverId: string; attended: number }> }) => {
      const res = await apiRequest("POST", "/api/road-safety-attendees/bulk", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-attendees", selectedTraining?.id] });
      setAttendanceDialogOpen(false);
      toast({
        title: "Asistencia guardada",
        description: "La asistencia se ha registrado exitosamente",
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

  const inviteWorkersMutation = useMutation({
    mutationFn: async (data: { trainingId: string; workerIds: string[] }) => {
      const res = await apiRequest("POST", `/api/road-safety-trainings/${data.trainingId}/invite-workers`, { workerIds: data.workerIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/road-safety-trainings", selectedTraining?.id, "worker-attendees"] });
      setInviteDialogOpen(false);
      setSelectedWorkerIds([]);
      toast({
        title: "Trabajadores invitados",
        description: "Los trabajadores han sido notificados de la capacitación",
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

  useEffect(() => {
    if (selectedTraining && attendees.length >= 0) {
      const existingAttendance: Record<string, boolean> = {};
      attendees.forEach((a: any) => {
        existingAttendance[a.driverId] = a.attended === 1;
      });
      setAttendanceData(existingAttendance);
    }
  }, [attendees, selectedTraining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      description: formData.description || undefined,
      instructor: formData.instructor || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      location: formData.location || undefined,
      topics: formData.topics || undefined,
    };
    createTrainingMutation.mutate(data);
  };

  const handleOpenAttendance = (training: RoadSafetyTraining) => {
    setSelectedTraining(training);
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedTraining) return;
    const attendance = Object.entries(attendanceData).map(([driverId, attended]) => ({
      driverId,
      attended: attended ? 1 : 0,
    }));
    saveAttendanceMutation.mutate({
      trainingId: selectedTraining.id,
      attendance,
    });
  };

  const handleInviteWorkers = () => {
    if (!selectedTraining || selectedWorkerIds.length === 0) return;
    inviteWorkersMutation.mutate({
      trainingId: selectedTraining.id,
      workerIds: selectedWorkerIds,
    });
  };

  const availableWorkers = workers.filter(w => 
    w.status === "activo" && 
    !invitedWorkers.some((inv: any) => inv.workerId === w.id)
  );

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
      totalAttendees: 0,
      status: "programada",
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      programada: "Programada",
      "en-curso": "En Curso",
      completada: "Completada",
      cancelada: "Cancelada",
    };
    return labels[status] || status;
  };

  const filteredTrainings = trainings.filter((training) => {
    const searchLower = searchTerm.toLowerCase();
    return training.title.toLowerCase().includes(searchLower);
  });

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAttendeeCount = (trainingId: string) => {
    return attendees.filter((a: any) => a.trainingId === trainingId && a.attended === 1).length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Capacitaciones de Seguridad Vial</h1>
          <p className="text-muted-foreground">Formación en seguridad vial y conducción defensiva</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPdf('/api/pesv/capacitaciones/pdf', 'capacitaciones-seguridad-vial.pdf')}
          data-testid="button-download-capacitaciones-pdf"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H02" compacto />
      
      <TrazabilidadCapacitacionesSstPesvBanner direccion="pesv-to-sst" />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-training">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capacitación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Capacitación</DialogTitle>
                <DialogDescription>Complete los datos de la capacitación</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Título de la Capacitación *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ej: Conducción Defensiva"
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción de la capacitación"
                      data-testid="input-description"
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
                  <div className="space-y-2">
                    <Label htmlFor="trainingDate">Fecha *</Label>
                    <Input
                      id="trainingDate"
                      type="date"
                      value={formData.trainingDate}
                      onChange={(e) => setFormData({ ...formData, trainingDate: e.target.value })}
                      required
                      data-testid="input-training-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      data-testid="input-start-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      data-testid="input-end-time"
                    />
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
                    <Label htmlFor="totalAttendees">Cupo Total *</Label>
                    <Input
                      id="totalAttendees"
                      type="number"
                      min="1"
                      value={formData.totalAttendees || ""}
                      onChange={(e) => setFormData({ ...formData, totalAttendees: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                      onBlur={(e) => { if (e.target.value === '' || formData.totalAttendees === '') setFormData(prev => ({ ...prev, totalAttendees: 1 })); }}
                      required
                      placeholder="Número de cupos"
                      data-testid="input-total-attendees"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="topics">Temas a Tratar</Label>
                    <Textarea
                      id="topics"
                      value={formData.topics}
                      onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                      placeholder="Listado de temas que se cubrirán en la capacitación"
                      data-testid="input-topics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue />
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
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createTrainingMutation.isPending} 
                    data-testid="button-submit-training"
                  >
                    {createTrainingMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar capacitación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainingsLoading ? (
          <div className="col-span-full text-center py-8" data-testid="text-loading">
            Cargando capacitaciones...
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="col-span-full text-center py-8" data-testid="text-no-trainings">
            No se encontraron capacitaciones
          </div>
        ) : (
          filteredTrainings.map((training) => (
            <Card key={training.id} data-testid={`card-training-${training.id}`}>
              <CardHeader>
                <CardTitle data-testid={`text-title-${training.id}`}>{training.title}</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    <p data-testid={`text-date-${training.id}`}>
                      Fecha: {new Date(training.trainingDate).toLocaleDateString("es-CO")}
                    </p>
                    {training.startTime && training.endTime && (
                      <p>
                        Horario: {training.startTime} - {training.endTime}
                      </p>
                    )}
                    {training.location && <p>Lugar: {training.location}</p>}
                    <p data-testid={`text-status-${training.id}`}>
                      Estado: {getStatusLabel(training.status)}
                    </p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {training.description && (
                  <p className="text-sm text-muted-foreground">{training.description}</p>
                )}
                {training.topics && (
                  <div>
                    <p className="font-semibold text-sm">Temas:</p>
                    <p className="text-sm text-muted-foreground">{training.topics}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span data-testid={`text-attendees-${training.id}`}>
                    {getAttendeeCount(training.id)} / {training.totalAttendees} asistentes
                  </span>
                </div>
                {user?.role && hasCompanyAdminAccess(user.role) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOpenAttendance(training)}
                    data-testid={`button-attendance-${training.id}`}
                  >
                    Gestionar Asistencia
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Asistencia</DialogTitle>
            <DialogDescription>
              {selectedTraining?.title} - {selectedTraining && new Date(selectedTraining.trainingDate).toLocaleDateString("es-CO")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-semibold">Marcar asistencia de conductores:</p>
              {drivers.filter(d => d.status === "activo").map((driver) => (
                <div key={driver.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`driver-${driver.id}`}
                    checked={attendanceData[driver.id] || false}
                    onCheckedChange={(checked) => setAttendanceData({ 
                      ...attendanceData, 
                      [driver.id]: checked as boolean 
                    })}
                    data-testid={`checkbox-driver-${driver.id}`}
                  />
                  <Label htmlFor={`driver-${driver.id}`}>{driver.name}</Label>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Trabajadores invitados (no conductores):</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInviteDialogOpen(true)}
                  data-testid="button-invite-workers"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invitar Trabajadores
                </Button>
              </div>
              {invitedWorkers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay trabajadores invitados</p>
              ) : (
                <div className="space-y-2">
                  {invitedWorkers.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-2 bg-muted/50 rounded" data-testid={`invited-worker-${inv.workerId}`}>
                      <span>{inv.workerName}</span>
                      <Badge variant={inv.attended ? "default" : "secondary"} className="no-default-active-elevate">
                        {inv.attended ? "Asistió" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveAttendance}
              disabled={saveAttendanceMutation.isPending}
              data-testid="button-save-attendance"
            >
              {saveAttendanceMutation.isPending ? "Guardando..." : "Guardar Asistencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invitar Trabajadores</DialogTitle>
            <DialogDescription>
              Seleccione los trabajadores que desea invitar a la capacitación PESV.
              Estos trabajadores podrán ver la capacitación en su Portal de Empleados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableWorkers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay trabajadores disponibles para invitar
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableWorkers.map((worker) => (
                  <div key={worker.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`worker-${worker.id}`}
                      checked={selectedWorkerIds.includes(worker.id)}
                      onCheckedChange={(checked) => {
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
                      <span className="text-muted-foreground ml-2 text-sm">({worker.position || 'Sin cargo'})</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancelar
            </Button>
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
