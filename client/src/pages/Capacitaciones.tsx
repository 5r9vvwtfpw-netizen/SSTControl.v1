import { TrainingCard } from "@/components/TrainingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Filter, Bot, Users, UserPlus, Trash2, CalendarDays, Target } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Training, Company, Worker, insertTrainingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { capacitacionesSstPredefinidas, getCapacitacionByCodigo, categoriaLabels } from "@/data/capacitaciones-sst-predefinidas";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const normativaCapacitaciones = [
  {
    codigo: 'RES-0312-EST-1.1.4',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 1.1.4',
    descripcion: 'Programa de capacitación anual en SST',
    requisitos: [
      'Programa de capacitación anual actualizado',
      'Registro de asistencia de trabajadores',
      'Evaluación de la efectividad de capacitaciones',
      'Inclusión de reinducción y capacitación continua'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.11',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.11',
    descripcion: 'Capacitación en Seguridad y Salud en el Trabajo',
    requisitos: [
      'Definir requisitos de conocimiento y práctica en SST',
      'Capacitación sobre peligros y riesgos del trabajo',
      'Incluir a contratistas y subcontratistas',
      'Documentar y mantener registros de capacitación'
    ],
    obligatorio: true
  }
];

interface TrainingAttendee {
  id: string;
  trainingId: string;
  workerId: string;
  companyId: string;
  createdAt: string;
}

export default function Capacitaciones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [selectedPredefCapacitacion, setSelectedPredefCapacitacion] = useState<string>("");
  const [asistentesDialogOpen, setAsistentesDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  const [formData, setFormData] = useState({
    companyId: "",
    title: "",
    description: "",
    instructor: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    totalWorkers: "" as number | string,
    validityMonths: "" as number | string,
    status: "programada" as const,
    contentType: "presencial" as string,
    contentUrl: "" as string,
    contentText: "" as string,
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    totalWorkers: "" as number | string,
    validityMonths: "" as number | string,
    status: "programada" as "programada" | "en-curso" | "completada" | "cancelada",
    contentType: "presencial" as string,
    contentUrl: "" as string,
    contentText: "" as string,
  });

  const { data: trainings = [], isLoading: trainingsLoading } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isAdmin,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: allAttendeesCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/trainings/attendees-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const training of trainings) {
        try {
          const res = await fetch(`/api/trainings/${training.id}/attendees`, {
            credentials: 'include',
          });
          if (res.ok) {
            const attendees = await res.json();
            counts[training.id] = attendees.length;
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

  const handleAutoFillFromPredefinido = (codigo: string) => {
    const capacitacion = getCapacitacionByCodigo(codigo);
    if (!capacitacion) return;

    setFormData({
      ...formData,
      title: capacitacion.titulo,
      description: capacitacion.descripcion,
      totalWorkers: "",
      validityMonths: capacitacion.validezMeses ?? "",
    });

    toast({
      title: "Campos auto-rellenados",
      description: `Los campos se han rellenado con la capacitación predefinida "${capacitacion.titulo}"`,
      className: "bg-green-50 border-green-200",
    });
  };

  const createTrainingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertTrainingSchema>) => {
      const payload = { ...data, companyId: user!.companyId };
      const res = await apiRequest("POST", "/api/trainings", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      setFormData({
        companyId: "",
        title: "",
        description: "",
        instructor: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        totalWorkers: "",
        validityMonths: "",
        status: "programada",
        contentType: "presencial",
        contentUrl: "",
        contentText: "",
      });
      toast({
        title: "Capacitación creada",
        description: "La capacitación se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      if (error.message.includes("title")) {
        errorMessage = "El título de la capacitación es obligatorio";
      } else if (error.message.includes("date")) {
        errorMessage = "La fecha de la capacitación es obligatoria";
      } else if (error.message.includes("totalWorkers") || error.message.includes("total_workers")) {
        errorMessage = "El cupo total debe ser al menos 1 trabajador";
      } else if (error.message.includes("companyId") || error.message.includes("company_id")) {
        errorMessage = "Debe seleccionar una empresa";
      }
      toast({
        title: "Error al crear capacitación",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertTrainingSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/trainings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setEditDialogOpen(false);
      setEditingTraining(null);
      toast({
        title: "Capacitación actualizada",
        description: "La capacitación se ha actualizado exitosamente",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar capacitación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: string[] = [];
    
    if (!user?.companyId) {
      toast({
        title: "Error de configuración",
        description: "Su usuario no está asociado a una empresa. Contacte al administrador.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || formData.title.trim().length === 0) {
      validationErrors.push("Título de la Capacitación: este campo es obligatorio");
    }
    
    if (!formData.date) {
      validationErrors.push("Fecha: debe seleccionar una fecha para la capacitación");
    }
    
    const totalWorkersValue = formData.totalWorkers === '' ? 0 : Number(formData.totalWorkers);
    if (!totalWorkersValue || totalWorkersValue < 1) {
      validationErrors.push("Cupo Total: debe indicar al menos 1 trabajador");
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Campos requeridos incompletos",
        description: (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }
    
    const validityMonthsValue = formData.validityMonths === '' ? null : Number(formData.validityMonths);
    createTrainingMutation.mutate({
      ...formData,
      totalWorkers: totalWorkersValue,
      description: formData.description || "",
      instructor: formData.instructor || "",
      startTime: formData.startTime || "",
      endTime: formData.endTime || "",
      location: formData.location || "",
      validityMonths: validityMonthsValue,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;
    
    const validationErrors: string[] = [];
    
    if (!editFormData.title || editFormData.title.trim().length === 0) {
      validationErrors.push("Título de la Capacitación: este campo es obligatorio");
    }
    
    if (!editFormData.date) {
      validationErrors.push("Fecha: debe seleccionar una fecha para la capacitación");
    }
    
    const editTotalWorkersValue = editFormData.totalWorkers === '' ? 0 : Number(editFormData.totalWorkers);
    if (!editTotalWorkersValue || editTotalWorkersValue < 1) {
      validationErrors.push("Cupo Total: debe indicar al menos 1 trabajador");
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Campos requeridos incompletos",
        description: (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }
    
    const editValidityMonthsValue = editFormData.validityMonths === '' ? null : Number(editFormData.validityMonths);
    updateTrainingMutation.mutate({
      id: editingTraining.id,
      data: {
        title: editFormData.title,
        description: editFormData.description || "",
        instructor: editFormData.instructor || "",
        date: editFormData.date,
        startTime: editFormData.startTime || "",
        endTime: editFormData.endTime || "",
        location: editFormData.location || "",
        totalWorkers: editTotalWorkersValue,
        validityMonths: editValidityMonthsValue,
        status: editFormData.status,
        contentType: editFormData.contentType || "presencial",
        contentUrl: editFormData.contentUrl || null,
        contentText: editFormData.contentText || null,
      },
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
      date: training.date,
      startTime: training.startTime || "",
      endTime: training.endTime || "",
      location: training.location || "",
      totalWorkers: training.totalWorkers ?? "",
      validityMonths: training.validityMonths ?? "",
      status: training.status as "programada" | "en-curso" | "completada" | "cancelada",
      contentType: (training as any).contentType || "presencial",
      contentUrl: (training as any).contentUrl || "",
      contentText: (training as any).contentText || "",
    });
    setEditDialogOpen(true);
  };

  const handleManageAttendeesClick = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    if (!training) return;
    
    setSelectedTraining(training);
    setAsistentesDialogOpen(true);
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || training.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
        <Link href="/pesv/evaluaciones">
          <Button variant="outline" size="sm" data-testid="button-ir-evaluacion-pesv">
            <Target className="h-4 w-4 mr-2" />
            Evaluación PESV
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Capacitaciones</h1>
          <p className="text-muted-foreground">Gestión de entrenamientos y formación SST</p>
        </div>
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedPredefCapacitacion("");
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-training">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capacitación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Capacitación</DialogTitle>
                <DialogDescription>Complete los datos de la capacitación</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione una capacitación predefinida para auto-rellenar los campos</p>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedPredefCapacitacion} onValueChange={(value) => {
                          setSelectedPredefCapacitacion(value);
                          handleAutoFillFromPredefinido(value);
                        }}>
                          <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-capacitacion-predefinida">
                            <SelectValue placeholder="Seleccione una capacitación predefinida..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            {Object.entries(categoriaLabels).map(([categoria, label]) => (
                              <div key={categoria}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
                                {capacitacionesSstPredefinidas.filter(c => c.categoria === categoria).map((cap) => (
                                  <SelectItem key={cap.codigo} value={cap.codigo}>
                                    {cap.codigo} - {cap.titulo}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Título de la Capacitación *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Uso de EPP - Equipos de Protección Personal"
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción de la capacitación"
                      data-testid="input-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor (opcional)</Label>
                    <Input
                      id="instructor"
                      placeholder="Nombre del instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      data-testid="input-instructor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      data-testid="input-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de Inicio (opcional)</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      data-testid="input-start-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de Fin (opcional)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      data-testid="input-end-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación (opcional)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Lugar de la capacitación"
                      data-testid="input-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalWorkers">Cupo Total *</Label>
                    <Input
                      id="totalWorkers"
                      type="number"
                      min="1"
                      value={formData.totalWorkers}
                      onChange={(e) => setFormData({ ...formData, totalWorkers: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Número de cupos"
                      data-testid="input-total-workers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validityMonths">Vigencia (meses)</Label>
                    <Input
                      id="validityMonths"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.validityMonths}
                      onChange={(e) => setFormData({ ...formData, validityMonths: e.target.value === '' ? '' : e.target.value })}
                      placeholder="Ej: 12 para un año"
                      data-testid="input-validity-months"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tiempo en meses antes de requerir renovación (opcional)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Tipo de Contenido</Label>
                    <Select
                      value={formData.contentType}
                      onValueChange={(value: string) => setFormData({ ...formData, contentType: value, contentUrl: "", contentText: "" })}
                    >
                      <SelectTrigger id="contentType" data-testid="select-content-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial (sin contenido digital)</SelectItem>
                        <SelectItem value="video">Video (URL)</SelectItem>
                        <SelectItem value="pdf">PDF (URL)</SelectItem>
                        <SelectItem value="formulario">Formulario (URL)</SelectItem>
                        <SelectItem value="texto">Texto / Descripción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData.contentType === "video" || formData.contentType === "pdf" || formData.contentType === "formulario") && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="contentUrl">
                        {formData.contentType === "video" ? "URL del Video" : formData.contentType === "pdf" ? "URL del PDF" : "URL del Formulario"}
                      </Label>
                      <Input
                        id="contentUrl"
                        type="url"
                        value={formData.contentUrl}
                        onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                        placeholder={formData.contentType === "video" ? "https://youtube.com/..." : formData.contentType === "pdf" ? "https://ejemplo.com/doc.pdf" : "https://forms.google.com/..."}
                        data-testid="input-content-url"
                      />
                    </div>
                  )}
                  {formData.contentType === "texto" && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="contentText">Contenido de Texto</Label>
                      <Textarea
                        id="contentText"
                        value={formData.contentText}
                        onChange={(e) => setFormData({ ...formData, contentText: e.target.value })}
                        placeholder="Escribe el contenido que verán los trabajadores..."
                        rows={4}
                        data-testid="input-content-text"
                      />
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Los campos marcados con * son obligatorios
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createTrainingMutation.isPending} data-testid="button-submit-training">
                    {createTrainingMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Capacitación</DialogTitle>
            <DialogDescription>Modifique los datos de la capacitación</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-title">Título de la Capacitación *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Ej: Uso de EPP - Equipos de Protección Personal"
                  data-testid="input-edit-title"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Descripción (opcional)</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Descripción de la capacitación"
                  data-testid="input-edit-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">Instructor (opcional)</Label>
                <Input
                  id="edit-instructor"
                  placeholder="Nombre del instructor"
                  value={editFormData.instructor}
                  onChange={(e) => setEditFormData({ ...editFormData, instructor: e.target.value })}
                  data-testid="input-edit-instructor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Fecha *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  data-testid="input-edit-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Hora de Inicio (opcional)</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                  data-testid="input-edit-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">Hora de Fin (opcional)</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                  data-testid="input-edit-end-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación (opcional)</Label>
                <Input
                  id="edit-location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="Lugar de la capacitación"
                  data-testid="input-edit-location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalWorkers">Cupo Total *</Label>
                <Input
                  id="edit-totalWorkers"
                  type="number"
                  min="1"
                  value={editFormData.totalWorkers}
                  onChange={(e) => setEditFormData({ ...editFormData, totalWorkers: e.target.value === '' ? '' : e.target.value })}
                  placeholder="Número de cupos"
                  data-testid="input-edit-total-workers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-validityMonths">Vigencia (meses)</Label>
                <Input
                  id="edit-validityMonths"
                  type="number"
                  min="1"
                  max="120"
                  value={editFormData.validityMonths}
                  onChange={(e) => setEditFormData({ ...editFormData, validityMonths: e.target.value === '' ? '' : e.target.value })}
                  placeholder="Ej: 12 para un año"
                  data-testid="input-edit-validity-months"
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo en meses antes de requerir renovación (opcional)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: any) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger id="edit-status" data-testid="select-edit-status">
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
              <div className="space-y-2">
                <Label htmlFor="edit-contentType">Tipo de Contenido</Label>
                <Select
                  value={editFormData.contentType}
                  onValueChange={(value: string) => setEditFormData({ ...editFormData, contentType: value, contentUrl: "", contentText: "" })}
                >
                  <SelectTrigger id="edit-contentType" data-testid="select-edit-content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial (sin contenido digital)</SelectItem>
                    <SelectItem value="video">Video (URL)</SelectItem>
                    <SelectItem value="pdf">PDF (URL)</SelectItem>
                    <SelectItem value="formulario">Formulario (URL)</SelectItem>
                    <SelectItem value="texto">Texto / Descripción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(editFormData.contentType === "video" || editFormData.contentType === "pdf" || editFormData.contentType === "formulario") && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-contentUrl">
                    {editFormData.contentType === "video" ? "URL del Video" : editFormData.contentType === "pdf" ? "URL del PDF" : "URL del Formulario"}
                  </Label>
                  <Input
                    id="edit-contentUrl"
                    type="url"
                    value={editFormData.contentUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, contentUrl: e.target.value })}
                    placeholder={editFormData.contentType === "video" ? "https://youtube.com/..." : editFormData.contentType === "pdf" ? "https://ejemplo.com/doc.pdf" : "https://forms.google.com/..."}
                    data-testid="input-edit-content-url"
                  />
                </div>
              )}
              {editFormData.contentType === "texto" && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-contentText">Contenido de Texto</Label>
                  <Textarea
                    id="edit-contentText"
                    value={editFormData.contentText}
                    onChange={(e) => setEditFormData({ ...editFormData, contentText: e.target.value })}
                    placeholder="Escribe el contenido que verán los trabajadores..."
                    rows={4}
                    data-testid="input-edit-content-text"
                  />
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Los campos marcados con * son obligatorios
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-edit">
                Cancelar
              </Button>
              <Button type="submit" disabled={updateTrainingMutation.isPending} data-testid="button-submit-edit-training">
                {updateTrainingMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AutomationAssistant
        titulo="Programa de Capacitación SST"
        estandar="1.1.4"
        descripcion="Gestión de capacitaciones en Seguridad y Salud en el Trabajo"
        normativaAplicable={normativaCapacitaciones}
        compact={true}
      />

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar capacitaciones..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-trainings"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="en-curso">En Curso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {trainingsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando capacitaciones...</p>
        </div>
      ) : filteredTrainings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron capacitaciones</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainings.map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              date={formatDate(training.date)}
              attendees={allAttendeesCounts[training.id] || 0}
              totalWorkers={training.totalWorkers}
              status={training.status as "programada" | "completada" | "en-curso" | "cancelada"}
              onEdit={handleEditClick}
              onManageAttendees={handleManageAttendeesClick}
              canEdit={user?.role ? hasCompanyAdminAccess(user.role) : false}
            />
          ))}
        </div>
      )}

      {selectedTraining && (
        <AsistentesDialog
          isOpen={asistentesDialogOpen}
          onClose={() => {
            setAsistentesDialogOpen(false);
            setSelectedTraining(null);
          }}
          training={selectedTraining}
          workers={workers}
        />
      )}
    </div>
  );
}

interface AsistentesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  training: Training;
  workers: Worker[];
}

function AsistentesDialog({ isOpen, onClose, training, workers }: AsistentesDialogProps) {
  const { toast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  const { data: attendees = [], isLoading } = useQuery<TrainingAttendee[]>({
    queryKey: ["/api/trainings", training.id, "attendees"],
    queryFn: async () => {
      const res = await fetch(`/api/trainings/${training.id}/attendees`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al cargar asistentes');
      return res.json();
    },
    enabled: isOpen,
  });

  const addAttendeeMutation = useMutation({
    mutationFn: async (workerId: string) => {
      return await apiRequest("POST", `/api/trainings/${training.id}/attendees`, {
        workerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings", training.id, "attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings/attendees-counts"] });
      toast({
        title: "Trabajador agregado",
        description: "El trabajador ha sido agregado a la capacitación",
        className: "bg-green-50 border-green-200",
      });
      setSelectedWorkerId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAttendeeMutation = useMutation({
    mutationFn: async (workerId: string) => {
      return await apiRequest("DELETE", `/api/trainings/${training.id}/attendees/${workerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings", training.id, "attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings/attendees-counts"] });
      toast({
        title: "Asistente eliminado",
        description: "El trabajador ha sido removido de la capacitación",
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

  const addedWorkerIds = new Set(attendees.map(a => a.workerId));
  const availableWorkers = workers.filter(w => !addedWorkerIds.has(w.id));

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : "Trabajador desconocido";
  };

  const getWorkerDocument = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.identificationNumber || "";
  };

  const getWorkerPosition = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.position || "";
  };

  const handleAddAttendee = () => {
    if (selectedWorkerId) {
      addAttendeeMutation.mutate(selectedWorkerId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asistentes a la Capacitación
          </DialogTitle>
          <DialogDescription>
            {training.title} - {new Date(training.date).toLocaleDateString('es-CO')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                    availableWorkers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} - {worker.identificationNumber}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddAttendee}
              disabled={!selectedWorkerId || addAttendeeMutation.isPending}
              className="gap-1"
              data-testid="button-add-attendee"
            >
              <UserPlus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

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
                  {attendees.map((attendee) => (
                    <TableRow key={attendee.id} data-testid={`row-attendee-${attendee.id}`}>
                      <TableCell className="font-medium" data-testid={`text-attendee-name-${attendee.id}`}>
                        {getWorkerName(attendee.workerId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-attendee-document-${attendee.id}`}>
                        {getWorkerDocument(attendee.workerId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-attendee-position-${attendee.id}`}>
                        {getWorkerPosition(attendee.workerId)}
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-attendee-confirmed-${attendee.id}`}>
                        {attendee.confirmed ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            Sí
                          </Badge>
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
                              removeAttendeeMutation.mutate(attendee.workerId);
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
                    <Badge variant="outline">{training.totalWorkers - attendees.length}</Badge>
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
