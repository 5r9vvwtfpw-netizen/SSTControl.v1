import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MedicalExam, Worker, JobProfile } from "@shared/schema";
import { insertMedicalExamSchema } from "@shared/schema";
import { medicalExamTypeLabels, medicalAptitudeLabels } from "@shared/arl-rates";
import type { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Activity, Calendar, User, Stethoscope, AlertCircle, CheckCircle2, Clock, FileText, Bell, AlertTriangle, Eye, EyeOff, Mail, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { differenceInDays, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaExamenesMedicos = [
  {
    codigo: 'RES-2346-2007',
    norma: 'Resolución 2346/2007',
    articulo: 'Completa',
    descripcion: 'Evaluaciones médicas ocupacionales y manejo de historias clínicas',
    requisitos: [
      'Exámenes médicos de ingreso, periódicos y de retiro',
      'Profesiogramas por cargo',
      'Custodia de historias clínicas ocupacionales',
      'Conceptos de aptitud médica'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.24',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.24',
    descripcion: 'Medidas de prevención y control - Exámenes médicos',
    requisitos: [
      'Exámenes médicos según exposición a riesgos',
      'Seguimiento a restricciones laborales',
      'Programa de vigilancia epidemiológica',
      'Custodia de información médica'
    ],
    obligatorio: true
  }
];

export default function ExamenesMedicos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<MedicalExam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    workerId: "",
    jobProfileId: "",
    examType: "preocupacional" as "preocupacional" | "periodico" | "cambio_ocupacion" | "post_incapacidad" | "egreso",
    scheduledDate: "",
    performedDate: "",
    medicalCenter: "",
    attendingPhysician: "",
    aptitude: "" as "" | "apto" | "apto_con_restricciones" | "no_apto_temporal" | "no_apto_permanente",
    restrictions: "",
    recommendations: "",
    followUpDate: "",
    examResults: "",
    status: "programado" as "programado" | "realizado" | "vencido" | "cancelado",
  });

  const { data: exams = [], isLoading } = useQuery<MedicalExam[]>({
    queryKey: ["/api/medical-exams"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: jobProfiles = [] } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertMedicalExamSchema>) => {
      const res = await apiRequest("POST", "/api/medical-exams", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-exams"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Examen programado",
        description: "El examen médico se ha programado exitosamente",
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

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertMedicalExamSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/medical-exams/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-exams"] });
      setDialogOpen(false);
      setEditingExam(null);
      resetForm();
      toast({
        title: "Examen actualizado",
        description: "El examen médico se ha actualizado exitosamente",
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

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/medical-exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-exams"] });
      toast({
        title: "Examen eliminado",
        description: "El examen médico se ha eliminado exitosamente",
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

  const resetForm = () => {
    setFormData({
      workerId: "",
      jobProfileId: "",
      examType: "preocupacional",
      scheduledDate: "",
      performedDate: "",
      medicalCenter: "",
      attendingPhysician: "",
      aptitude: "",
      restrictions: "",
      recommendations: "",
      followUpDate: "",
      examResults: "",
      status: "programado",
    });
  };

  const handleEdit = (exam: MedicalExam) => {
    setEditingExam(exam);
    setFormData({
      workerId: exam.workerId,
      jobProfileId: exam.jobProfileId || "",
      examType: exam.examType,
      scheduledDate: exam.scheduledDate,
      performedDate: exam.performedDate || "",
      medicalCenter: exam.medicalCenter || "",
      attendingPhysician: exam.attendingPhysician || "",
      aptitude: exam.aptitude || "",
      restrictions: exam.restrictions || "",
      recommendations: exam.recommendations || "",
      followUpDate: exam.followUpDate || "",
      examResults: exam.examResults || "",
      status: exam.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      // Convert "none" placeholder to undefined for database
      jobProfileId: formData.jobProfileId && formData.jobProfileId !== "none" ? formData.jobProfileId : undefined,
      performedDate: formData.performedDate || undefined,
      medicalCenter: formData.medicalCenter || undefined,
      attendingPhysician: formData.attendingPhysician || undefined,
      aptitude: formData.aptitude || undefined,
      restrictions: formData.restrictions || undefined,
      recommendations: formData.recommendations || undefined,
      followUpDate: formData.followUpDate || undefined,
      examResults: formData.examResults || undefined,
    };

    if (editingExam) {
      updateExamMutation.mutate({ id: editingExam.id, data: dataToSubmit });
    } else {
      createExamMutation.mutate(dataToSubmit);
    }
  };

  const filteredExams = exams.filter(exam => {
    const worker = workers.find(w => w.id === exam.workerId);
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === "" || (
      worker?.name?.toLowerCase().includes(searchLower) ||
      exam.medicalCenter?.toLowerCase().includes(searchLower) ||
      exam.attendingPhysician?.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      "programado": "bg-blue-500",
      "realizado": "bg-green-500",
      "vencido": "bg-red-500",
      "cancelado": "bg-gray-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getAptitudeColor = (aptitude: string) => {
    const colors = {
      "apto": "bg-green-500",
      "apto_con_restricciones": "bg-yellow-500",
      "no_apto_temporal": "bg-orange-500",
      "no_apto_permanente": "bg-red-500"
    };
    return colors[aptitude as keyof typeof colors] || "bg-gray-500";
  };

  // Calcular alertas de exámenes próximos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const getExamAlerts = () => {
    const scheduledExams = exams.filter(e => e.status === "programado");
    const overdueExams = exams.filter(e => e.status === "vencido");
    
    const next7Days = scheduledExams.filter(e => {
      const examDate = parseISO(e.scheduledDate);
      const daysUntil = differenceInDays(examDate, today);
      return daysUntil >= 0 && daysUntil <= 7;
    });
    
    const next15Days = scheduledExams.filter(e => {
      const examDate = parseISO(e.scheduledDate);
      const daysUntil = differenceInDays(examDate, today);
      return daysUntil > 7 && daysUntil <= 15;
    });
    
    const next30Days = scheduledExams.filter(e => {
      const examDate = parseISO(e.scheduledDate);
      const daysUntil = differenceInDays(examDate, today);
      return daysUntil > 15 && daysUntil <= 30;
    });

    return {
      overdue: overdueExams,
      next7Days,
      next15Days,
      next30Days,
      totalAlerts: overdueExams.length + next7Days.length
    };
  };

  const alerts = getExamAlerts();
  const hasAlerts = alerts.totalAlerts > 0;

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

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Exámenes Médicos Ocupacionales</h1>
          <p className="text-muted-foreground">Gestión de exámenes según Resolución 1843/2025</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingExam(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-exam">
              <Plus className="h-4 w-4 mr-2" />
              Programar Examen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExam ? "Editar Examen" : "Programar Examen Médico"}</DialogTitle>
              <DialogDescription>
                Complete la información del examen médico ocupacional
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workerId">Trabajador *</Label>
                  <Select
                    value={formData.workerId}
                    onValueChange={(value) => {
                      const selectedWorker = workers.find(w => w.id === value);
                      let newData = { ...formData, workerId: value };
                      
                      if (selectedWorker && !editingExam) {
                        const autoFilledFields: string[] = [];
                        const suggestions: string[] = [];
                        
                        // 1. Auto-vincular perfil de cargo (primero por jobProfileId directo, luego por nombre)
                        let matchingProfile: typeof jobProfiles[0] | undefined;
                        
                        // Primero intentar con jobProfileId directo del trabajador
                        if ((selectedWorker as any).jobProfileId) {
                          matchingProfile = jobProfiles.find(p => p.id === (selectedWorker as any).jobProfileId);
                        }
                        
                        // Si no tiene jobProfileId, buscar por nombre del cargo
                        if (!matchingProfile && selectedWorker.position) {
                          matchingProfile = jobProfiles.find(
                            p => p.name.toLowerCase().includes(selectedWorker.position.toLowerCase()) ||
                                 selectedWorker.position.toLowerCase().includes(p.name.toLowerCase())
                          );
                        }
                        
                        if (matchingProfile) {
                          newData.jobProfileId = matchingProfile.id;
                          autoFilledFields.push(`Perfil: ${matchingProfile.name}`);
                        }
                        
                        // 2. Determinar tipo de examen sugerido inteligentemente
                        // Solo sugerir si el usuario no ha seleccionado manualmente un tipo diferente
                        const shouldSuggestExamType = formData.examType === 'preocupacional';
                        
                        if (shouldSuggestExamType) {
                          const workerExams = exams.filter(e => e.workerId === value);
                          const completedExams = workerExams.filter(e => 
                            e.status === 'realizado' || e.performedDate
                          );
                          
                          // Obtener frecuencia de exámenes del perfil (por defecto 12 meses)
                          const examFrequencyMonths = matchingProfile?.examFrequencyMonths || 12;
                          
                          // Buscar el último examen realizado
                          const lastExam = completedExams
                            .sort((a, b) => {
                              const dateA = a.performedDate || a.scheduledDate;
                              const dateB = b.performedDate || b.scheduledDate;
                              return new Date(dateB).getTime() - new Date(dateA).getTime();
                            })[0];
                          
                          let suggestedExamType = 'preocupacional';
                          let suggestionReason = '';
                          
                          if (!lastExam) {
                            // No tiene exámenes previos -> Ingreso
                            suggestedExamType = 'preocupacional';
                            suggestionReason = 'Sin exámenes previos registrados';
                          } else {
                            // Tiene exámenes previos - calcular si toca periódico usando date-fns
                            const lastExamDate = parseISO(lastExam.performedDate || lastExam.scheduledDate);
                            const today = new Date();
                            const daysSinceLastExam = differenceInDays(today, lastExamDate);
                            const monthsSinceLastExam = Math.floor(daysSinceLastExam / 30.44); // Promedio días por mes
                            
                            if (monthsSinceLastExam >= examFrequencyMonths) {
                              suggestedExamType = 'periodico';
                              suggestionReason = `Último examen hace ${monthsSinceLastExam} meses (frecuencia: cada ${examFrequencyMonths} meses)`;
                            } else {
                              const monthsRemaining = examFrequencyMonths - monthsSinceLastExam;
                              suggestedExamType = 'periodico';
                              suggestionReason = `Próximo periódico en ~${monthsRemaining} meses`;
                            }
                          }
                          
                          newData.examType = suggestedExamType;
                          if (suggestionReason) {
                            suggestions.push(suggestionReason);
                          }
                        }
                        
                        // Mostrar notificación de auto-llenado
                        if (autoFilledFields.length > 0 || suggestions.length > 0) {
                          const allInfo = [...autoFilledFields];
                          if (suggestions.length > 0) {
                            allInfo.push(`Examen sugerido: ${newData.examType === 'preocupacional' ? 'Ingreso' : 'Periódico'}`);
                          }
                          
                          toast({
                            title: "Datos cargados automáticamente",
                            description: (
                              <div className="space-y-1">
                                {allInfo.map((info, i) => (
                                  <div key={i}>{info}</div>
                                ))}
                                {suggestions.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">{suggestions[0]}</div>
                                )}
                              </div>
                            ),
                            className: "bg-blue-50 border-blue-200",
                          });
                        }
                      }
                      
                      setFormData(newData);
                    }}
                  >
                    <SelectTrigger id="workerId" data-testid="select-worker">
                      <SelectValue placeholder="Seleccionar trabajador" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name} - {worker.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobProfileId">Perfil de Cargo (Opcional)</Label>
                  <Select
                    value={formData.jobProfileId}
                    onValueChange={(value) => setFormData({ ...formData, jobProfileId: value })}
                  >
                    <SelectTrigger id="jobProfileId" data-testid="select-job-profile">
                      <SelectValue placeholder="Seleccionar perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin perfil asignado</SelectItem>
                      {jobProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examType">Tipo de Examen *</Label>
                  <Select
                    value={formData.examType}
                    onValueChange={(value: any) => setFormData({ ...formData, examType: value })}
                  >
                    <SelectTrigger id="examType" data-testid="select-exam-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preocupacional">Pre-ocupacional (Ingreso)</SelectItem>
                      <SelectItem value="periodico">Periódico Programado</SelectItem>
                      <SelectItem value="cambio_ocupacion">Cambio de Ocupación</SelectItem>
                      <SelectItem value="post_incapacidad">Post-Incapacidad</SelectItem>
                      <SelectItem value="egreso">Egreso (Retiro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Fecha Programada *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                    data-testid="input-scheduled-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performedDate">Fecha de Realización</Label>
                  <Input
                    id="performedDate"
                    type="date"
                    value={formData.performedDate}
                    onChange={(e) => setFormData({ ...formData, performedDate: e.target.value })}
                    data-testid="input-performed-date"
                  />
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
                      <SelectItem value="programado">Programado</SelectItem>
                      <SelectItem value="realizado">Realizado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalCenter">Centro Médico / IPS</Label>
                  <Input
                    id="medicalCenter"
                    value={formData.medicalCenter}
                    onChange={(e) => setFormData({ ...formData, medicalCenter: e.target.value })}
                    placeholder="Nombre de la IPS"
                    data-testid="input-medical-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendingPhysician">Médico Ocupacional</Label>
                  <Input
                    id="attendingPhysician"
                    value={formData.attendingPhysician}
                    onChange={(e) => setFormData({ ...formData, attendingPhysician: e.target.value })}
                    placeholder="Nombre del médico"
                    data-testid="input-attending-physician"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aptitude">Concepto de Aptitud</Label>
                  <Select
                    value={formData.aptitude}
                    onValueChange={(value: any) => setFormData({ ...formData, aptitude: value })}
                  >
                    <SelectTrigger id="aptitude" data-testid="select-aptitude">
                      <SelectValue placeholder="Seleccionar aptitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apto">Apto</SelectItem>
                      <SelectItem value="apto_con_restricciones">Apto con Restricciones</SelectItem>
                      <SelectItem value="no_apto_temporal">No Apto Temporal</SelectItem>
                      <SelectItem value="no_apto_permanente">No Apto Permanente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Fecha de Seguimiento</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    data-testid="input-follow-up-date"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="restrictions">Restricciones Laborales</Label>
                  <Textarea
                    id="restrictions"
                    value={formData.restrictions}
                    onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                    placeholder="Restricciones identificadas durante el examen"
                    rows={2}
                    data-testid="input-restrictions"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="recommendations">Recomendaciones Médicas</Label>
                  <Textarea
                    id="recommendations"
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Recomendaciones del médico ocupacional"
                    rows={2}
                    data-testid="input-recommendations"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="examResults">Resultados del Examen</Label>
                  <Textarea
                    id="examResults"
                    value={formData.examResults}
                    onChange={(e) => setFormData({ ...formData, examResults: e.target.value })}
                    placeholder="Resumen general de resultados (sin diagnósticos específicos)"
                    rows={3}
                    data-testid="input-exam-results"
                  />
                  <p className="text-xs text-muted-foreground">
                    No incluir diagnósticos específicos por privacidad
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingExam(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save">
                  {editingExam ? "Actualizar" : "Programar"} Examen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AutomationAssistant
        titulo="Exámenes Médicos Ocupacionales"
        estandar="1.2.1"
        descripcion="Gestión de evaluaciones médicas ocupacionales según Resolución 2346/2007"
        normativaAplicable={normativaExamenesMedicos}
        compact={true}
      />

      {/* Panel de Alertas y Recordatorios */}
      {(alerts.overdue.length > 0 || alerts.next7Days.length > 0 || alerts.next15Days.length > 0 || alerts.next30Days.length > 0) && (
        <Card className="border-l-4 border-l-yellow-500" data-testid="card-exam-alerts">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              Centro de Alertas y Recordatorios
            </CardTitle>
            <CardDescription>Exámenes médicos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Exámenes Vencidos */}
              <div className={`p-4 rounded-lg ${alerts.overdue.length > 0 ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-5 w-5 ${alerts.overdue.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-sm">Vencidos</span>
                </div>
                <p className={`text-2xl font-bold ${alerts.overdue.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {alerts.overdue.length}
                </p>
                {alerts.overdue.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                    {alerts.overdue.slice(0, 3).map(exam => {
                      const worker = workers.find(w => w.id === exam.workerId);
                      return (
                        <p key={exam.id} className="text-xs text-red-600 truncate">
                          {worker?.name} - {format(parseISO(exam.scheduledDate), "dd/MM")}
                        </p>
                      );
                    })}
                    {alerts.overdue.length > 3 && (
                      <p className="text-xs text-red-500">+{alerts.overdue.length - 3} más</p>
                    )}
                  </div>
                )}
              </div>

              {/* Próximos 7 días */}
              <div className={`p-4 rounded-lg ${alerts.next7Days.length > 0 ? 'bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`h-5 w-5 ${alerts.next7Days.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-sm">Próximos 7 días</span>
                </div>
                <p className={`text-2xl font-bold ${alerts.next7Days.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {alerts.next7Days.length}
                </p>
                {alerts.next7Days.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                    {alerts.next7Days.slice(0, 3).map(exam => {
                      const worker = workers.find(w => w.id === exam.workerId);
                      const daysUntil = differenceInDays(parseISO(exam.scheduledDate), today);
                      return (
                        <p key={exam.id} className="text-xs text-orange-600 truncate">
                          {worker?.name} - {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`}
                        </p>
                      );
                    })}
                    {alerts.next7Days.length > 3 && (
                      <p className="text-xs text-orange-500">+{alerts.next7Days.length - 3} más</p>
                    )}
                  </div>
                )}
              </div>

              {/* Próximos 15 días */}
              <div className={`p-4 rounded-lg ${alerts.next15Days.length > 0 ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`h-5 w-5 ${alerts.next15Days.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-sm">8-15 días</span>
                </div>
                <p className={`text-2xl font-bold ${alerts.next15Days.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  {alerts.next15Days.length}
                </p>
                {alerts.next15Days.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                    {alerts.next15Days.slice(0, 3).map(exam => {
                      const worker = workers.find(w => w.id === exam.workerId);
                      return (
                        <p key={exam.id} className="text-xs text-yellow-600 truncate">
                          {worker?.name} - {format(parseISO(exam.scheduledDate), "dd/MM")}
                        </p>
                      );
                    })}
                    {alerts.next15Days.length > 3 && (
                      <p className="text-xs text-yellow-500">+{alerts.next15Days.length - 3} más</p>
                    )}
                  </div>
                )}
              </div>

              {/* Próximos 30 días */}
              <div className={`p-4 rounded-lg ${alerts.next30Days.length > 0 ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`h-5 w-5 ${alerts.next30Days.length > 0 ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-sm">16-30 días</span>
                </div>
                <p className={`text-2xl font-bold ${alerts.next30Days.length > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                  {alerts.next30Days.length}
                </p>
                {alerts.next30Days.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                    {alerts.next30Days.slice(0, 3).map(exam => {
                      const worker = workers.find(w => w.id === exam.workerId);
                      return (
                        <p key={exam.id} className="text-xs text-blue-600 truncate">
                          {worker?.name} - {format(parseISO(exam.scheduledDate), "dd/MM")}
                        </p>
                      );
                    })}
                    {alerts.next30Days.length > 3 && (
                      <p className="text-xs text-blue-500">+{alerts.next30Days.length - 3} más</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar examen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          data-testid="input-search"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-filter-status">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="programado">Programados</SelectItem>
            <SelectItem value="realizado">Realizados</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
            <SelectItem value="cancelado">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredExams.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No hay exámenes médicos registrados
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => {
            const worker = workers.find(w => w.id === exam.workerId);
            const profile = jobProfiles.find(p => p.id === exam.jobProfileId);
            
            return (
              <Card key={exam.id} className="hover-elevate" data-testid={`card-exam-${exam.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Stethoscope className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <CardTitle className="text-base">{worker?.name || "Sin trabajador"}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(exam.status)} text-white flex-shrink-0`}>
                      {exam.status}
                    </Badge>
                  </div>
                  {/* Notification status indicator */}
                  {exam.notificationSentAt && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {exam.readConfirmedAt ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Eye className="h-3 w-3" />
                          Lectura confirmada: {format(new Date(exam.readConfirmedAt), "dd/MM/yyyy HH:mm")}
                        </span>
                      ) : exam.notificationReadAt ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Mail className="h-3 w-3" />
                          Notificación vista (sin confirmar)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600">
                          <EyeOff className="h-3 w-3" />
                          Pendiente de lectura
                        </span>
                      )}
                    </div>
                  )}
                  <CardDescription>{medicalExamTypeLabels[exam.examType]}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Programado:</span>
                      <span className="font-semibold">
                        {format(new Date(exam.scheduledDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                    {exam.performedDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Realizado:</span>
                        <span className="font-semibold">
                          {format(new Date(exam.performedDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                    {exam.medicalCenter && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {exam.medicalCenter}
                        </span>
                      </div>
                    )}
                    {exam.aptitude && (
                      <div className="flex items-center gap-2">
                        <Badge className={`${getAptitudeColor(exam.aptitude)} text-white text-xs`}>
                          {medicalAptitudeLabels[exam.aptitude]}
                        </Badge>
                      </div>
                    )}
                    {exam.followUpDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Seguimiento: {format(new Date(exam.followUpDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                    {profile && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {profile.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(exam)}
                      data-testid={`button-edit-${exam.id}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (confirm("¿Está seguro de eliminar este examen?")) {
                          deleteExamMutation.mutate(exam.id);
                        }
                      }}
                      data-testid={`button-delete-${exam.id}`}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
