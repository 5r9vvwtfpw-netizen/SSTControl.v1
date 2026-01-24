import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CapacitacionCatalogo, CapacitacionEvento, Worker, Company } from "@shared/schema";
import { getTodayDateString } from "@/lib/utils/formatters";
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Scale,
  CheckCircle2,
  GraduationCap,
  Pencil,
  Trash2,
  UserPlus,
  AlertCircle,
  MapPin,
  BookOpen,
  Send
} from "lucide-react";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { 
  INSTRUCTORES_PREDEFINIDOS, 
  LUGARES_PREDEFINIDOS, 
  HORARIOS_PREDEFINIDOS,
  calcularDuracionSugerida,
  getInstructorSugerido
} from "@/data/capacitacion-automatizacion";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const eventoFormSchema = z.object({
  catalogoId: z.string().min(1, "Seleccione una capacitación del catálogo"),
  fechaInicio: z.string().min(1, "Fecha de inicio es requerida"),
  fechaFin: z.string().optional(),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  lugar: z.string().optional(),
  instructor: z.string().optional(),
  observaciones: z.string().optional(),
  companyId: z.string().optional(),
  requireCompanyId: z.boolean().optional(),
}).refine((data) => {
  // If requireCompanyId is true (admin mode), companyId must be provided
  if (data.requireCompanyId && !data.companyId) {
    return false;
  }
  return true;
}, {
  message: "Debe seleccionar una empresa",
  path: ["companyId"],
});

type EventoFormValues = z.infer<typeof eventoFormSchema>;

const estadoLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  programado: { label: "Programado", variant: "secondary" },
  en_curso: { label: "En Curso", variant: "default" },
  completado: { label: "Completado", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
  pospuesto: { label: "Pospuesto", variant: "outline" },
};

const categoriaColors: Record<string, string> = {
  normatividad: "bg-blue-100 text-blue-800",
  seguridad: "bg-red-100 text-red-800",
  salud: "bg-green-100 text-green-800",
  emergencias: "bg-orange-100 text-orange-800",
  especializadas: "bg-purple-100 text-purple-800",
  induccion: "bg-blue-100 text-blue-800",
  reinduccion: "bg-indigo-100 text-indigo-800",
  prevencion_riesgos: "bg-amber-100 text-amber-800",
  trabajo_alturas: "bg-red-100 text-red-800",
  ergonomia: "bg-green-100 text-green-800",
  higiene_industrial: "bg-cyan-100 text-cyan-800",
  seguridad_vial: "bg-purple-100 text-purple-800",
  primeros_auxilios: "bg-rose-100 text-rose-800",
  riesgo_psicosocial: "bg-pink-100 text-pink-800",
  riesgo_electrico: "bg-yellow-100 text-yellow-800",
  sustancias_quimicas: "bg-lime-100 text-lime-800",
  espacios_confinados: "bg-stone-100 text-stone-800",
  copasst: "bg-teal-100 text-teal-800",
  comite_convivencia: "bg-emerald-100 text-emerald-800",
  otro: "bg-slate-100 text-slate-800",
};

export default function ProgramaCapacitacion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  
  const [isEventoDialogOpen, setIsEventoDialogOpen] = useState(false);
  const [editingEventoId, setEditingEventoId] = useState<string | null>(null);
  const [selectedCatalogo, setSelectedCatalogo] = useState<CapacitacionCatalogo | null>(null);
  const [isAsistentesDialogOpen, setIsAsistentesDialogOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<CapacitacionEvento | null>(null);
  const [activeTab, setActiveTab] = useState("eventos");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [sendToPortalOnCreate, setSendToPortalOnCreate] = useState(true);

  const form = useForm<EventoFormValues>({
    resolver: zodResolver(eventoFormSchema),
    defaultValues: {
      catalogoId: "",
      fechaInicio: getTodayDateString(),
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
      lugar: "",
      instructor: "",
      observaciones: "",
      companyId: "",
      requireCompanyId: isSuperadmin,
    },
  });

  // Update requireCompanyId when user role changes
  useEffect(() => {
    form.setValue("requireCompanyId", isSuperadmin);
  }, [user?.role, form]);

  // Fetch catalog
  const { data: catalogo = [], isLoading: loadingCatalogo } = useQuery<CapacitacionCatalogo[]>({
    queryKey: ["/api/capacitaciones-catalogo"],
  });

  // Fetch events
  const { data: eventos = [], isLoading: loadingEventos } = useQuery<CapacitacionEvento[]>({
    queryKey: ["/api/capacitacion-eventos"],
  });

  // Fetch workers for assignees (company-scoped)
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  // Fetch companies (for superadmin only)
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  // When catalog selection changes, update the selectedCatalogo and auto-fill fields
  const watchCatalogoId = form.watch("catalogoId");
  
  useEffect(() => {
    if (watchCatalogoId) {
      const selected = catalogo.find(c => c.id === watchCatalogoId);
      setSelectedCatalogo(selected || null);
      
      if (selected && !editingEventoId) {
        const duracionSugerida = calcularDuracionSugerida(selected.duracionHoras);
        form.setValue("horaInicio", duracionSugerida.horaInicio);
        form.setValue("horaFin", duracionSugerida.horaFin);
        
        const instructorSugerido = getInstructorSugerido(selected.categoria || '');
        if (instructorSugerido && !form.getValues("instructor")) {
          form.setValue("instructor", instructorSugerido.nombre);
        }
        
        if (!form.getValues("lugar")) {
          form.setValue("lugar", "Sala de Capacitación");
        }
      }
    } else {
      setSelectedCatalogo(null);
    }
  }, [watchCatalogoId, catalogo, editingEventoId, form]);

  // Create evento mutation - now also adds selected workers and optionally sends to portal
  const createEventoMutation = useMutation({
    mutationFn: async (values: Omit<EventoFormValues, 'requireCompanyId'> & { workerIds?: string[]; sendToPortal?: boolean }) => {
      const { workerIds, sendToPortal, ...eventoValues } = values;
      const evento = await apiRequest("POST", "/api/capacitacion-eventos", eventoValues);
      const eventoData = await evento.json();
      
      // Add selected workers as attendees
      if (workerIds && workerIds.length > 0) {
        for (const workerId of workerIds) {
          await apiRequest("POST", `/api/capacitacion-eventos/${eventoData.id}/asistentes`, {
            workerId,
            estado: "invitado",
          });
        }
        
        // Send to portal if requested
        if (sendToPortal) {
          const fechaFormateada = new Date(eventoData.fechaInicio).toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const horaInfo = eventoData.horaInicio 
            ? ` a las ${eventoData.horaInicio}${eventoData.horaFin ? ` - ${eventoData.horaFin}` : ''}`
            : '';
          
          const lugarInfo = eventoData.lugar ? `\n\n📍 Lugar: ${eventoData.lugar}` : '';
          const instructorInfo = eventoData.instructor ? `\n👨‍🏫 Instructor: ${eventoData.instructor}` : '';
          const duracionInfo = eventoData.duracionHoras ? `\n⏱️ Duración: ${eventoData.duracionHoras} horas` : '';
          
          const contenido = `Estimado(a) trabajador(a),

Le informamos que ha sido convocado(a) a la siguiente capacitación obligatoria:

📚 **${eventoData.tituloCurso}**

📅 Fecha: ${fechaFormateada}${horaInfo}${lugarInfo}${instructorInfo}${duracionInfo}

${eventoData.normativa ? `📋 Normativa: ${eventoData.normativa}` : ''}

Esta capacitación es importante para su desarrollo profesional y cumplimiento normativo en Seguridad y Salud en el Trabajo.

Por favor confirme su asistencia.

Atentamente,
Área de Seguridad y Salud en el Trabajo`;

          await apiRequest("POST", "/api/comunicaciones-sst", {
            tipo: "formacion",
            asunto: `Convocatoria: ${eventoData.tituloCurso} - ${fechaFormateada}`,
            contenido,
            publicoObjetivo: "trabajadores",
            mediosUtilizados: ["portal"],
            requiereConfirmacionLectura: 1,
            relacionadoCon: "capacitacion",
            relacionadoId: eventoData.id,
            trabajadoresDestinatarios: workerIds,
          });
        }
      }
      return { ...eventoData, sentToPortal: sendToPortal && workerIds && workerIds.length > 0 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/capacitacion-eventos"] });
      const workerCount = selectedWorkerIds.length;
      let description = workerCount > 0 
        ? `Evento creado con ${workerCount} trabajador(es) invitado(s)`
        : "El evento de capacitación ha sido creado exitosamente";
      
      if (data.sentToPortal) {
        description += " y notificación enviada al Portal";
      }
      
      toast({
        title: "Capacitación programada",
        description,
        className: "bg-green-50 border-green-200",
      });
      handleCloseEventoDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update evento mutation
  const updateEventoMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<EventoFormValues> }) => {
      return await apiRequest("PATCH", `/api/capacitacion-eventos/${id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capacitacion-eventos"] });
      toast({
        title: "Capacitación actualizada",
        description: "Los cambios han sido guardados exitosamente",
        className: "bg-green-50 border-green-200",
      });
      handleCloseEventoDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete evento mutation
  const deleteEventoMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/capacitacion-eventos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capacitacion-eventos"] });
      toast({
        title: "Capacitación eliminada",
        description: "El evento ha sido eliminado exitosamente",
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

  // Send to employee portal mutation
  const sendToPortalMutation = useMutation({
    mutationFn: async (evento: CapacitacionEvento) => {
      // First get attendees for this event
      const asistentesRes = await fetch(`/api/capacitacion-eventos/${evento.id}/asistentes`, {
        credentials: 'include',
      });
      if (!asistentesRes.ok) throw new Error('Error al obtener asistentes');
      const asistentes = await asistentesRes.json();
      
      if (asistentes.length === 0) {
        throw new Error('No hay trabajadores invitados a esta capacitación');
      }
      
      // Create a communication for all attendees
      const trabajadoresIds = asistentes.map((a: { workerId: string }) => a.workerId);
      
      const fechaFormateada = new Date(evento.fechaInicio).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const horaInfo = evento.horaInicio 
        ? ` a las ${evento.horaInicio}${evento.horaFin ? ` - ${evento.horaFin}` : ''}`
        : '';
      
      const lugarInfo = evento.lugar ? `\n\n📍 Lugar: ${evento.lugar}` : '';
      const instructorInfo = evento.instructor ? `\n👨‍🏫 Instructor: ${evento.instructor}` : '';
      const duracionInfo = evento.duracionHoras ? `\n⏱️ Duración: ${evento.duracionHoras} horas` : '';
      
      const contenido = `Estimado(a) trabajador(a),

Le informamos que ha sido convocado(a) a la siguiente capacitación obligatoria:

📚 **${evento.tituloCurso}**

📅 Fecha: ${fechaFormateada}${horaInfo}${lugarInfo}${instructorInfo}${duracionInfo}

${evento.normativa ? `📋 Normativa: ${evento.normativa}` : ''}

Esta capacitación es importante para su desarrollo profesional y cumplimiento normativo en Seguridad y Salud en el Trabajo.

Por favor confirme su asistencia.

Atentamente,
Área de Seguridad y Salud en el Trabajo`;

      return await apiRequest("POST", "/api/comunicaciones-sst", {
        tipo: "formacion",
        asunto: `Convocatoria: ${evento.tituloCurso} - ${fechaFormateada}`,
        contenido,
        publicoObjetivo: "trabajadores",
        mediosUtilizados: ["portal"],
        requiereConfirmacionLectura: 1,
        relacionadoCon: "capacitacion",
        relacionadoId: evento.id,
        trabajadoresDestinatarios: trabajadoresIds,
      });
    },
    onSuccess: () => {
      toast({
        title: "Enviado al Portal",
        description: "La convocatoria ha sido enviada a todos los trabajadores invitados",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCloseEventoDialog = () => {
    setIsEventoDialogOpen(false);
    setEditingEventoId(null);
    setSelectedCatalogo(null);
    setSelectedWorkerIds([]);
    setSendToPortalOnCreate(true);
    form.reset({
      catalogoId: "",
      fechaInicio: getTodayDateString(),
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
      lugar: "",
      instructor: "",
      observaciones: "",
      companyId: "",
      requireCompanyId: isSuperadmin,
    });
  };

  // Watch companyId for filtering workers
  const watchCompanyId = form.watch("companyId");
  
  // Filter workers by selected company (superadmin) or user's company (non-superadmin)
  const filteredWorkers = useMemo(() => {
    if (isSuperadmin && watchCompanyId) {
      return workers.filter(w => w.companyId === watchCompanyId);
    } else if (!isSuperadmin && user?.companyId) {
      return workers.filter(w => w.companyId === user.companyId);
    }
    return [];
  }, [workers, user?.role, watchCompanyId, user?.companyId]);
  
  // Toggle worker selection
  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };
  
  // Select/deselect all workers
  const toggleAllWorkers = () => {
    if (selectedWorkerIds.length === filteredWorkers.length) {
      setSelectedWorkerIds([]);
    } else {
      setSelectedWorkerIds(filteredWorkers.map(w => w.id));
    }
  };

  const handleEditEvento = (evento: CapacitacionEvento) => {
    setEditingEventoId(evento.id);
    form.reset({
      catalogoId: evento.catalogoId,
      fechaInicio: evento.fechaInicio,
      fechaFin: evento.fechaFin || "",
      horaInicio: evento.horaInicio || "",
      horaFin: evento.horaFin || "",
      lugar: evento.lugar || "",
      instructor: evento.instructor || "",
      observaciones: evento.observaciones || "",
      companyId: evento.companyId,
      requireCompanyId: isSuperadmin,
    });
    setIsEventoDialogOpen(true);
  };

  const handleDeleteEvento = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta capacitación programada?")) {
      deleteEventoMutation.mutate(id);
    }
  };

  const handleOpenAsistentes = (evento: CapacitacionEvento) => {
    setSelectedEvento(evento);
    setIsAsistentesDialogOpen(true);
  };

  const onSubmitEvento = (values: EventoFormValues) => {
    // Remove the requireCompanyId field before sending to backend
    const { requireCompanyId, ...submitValues } = values;
    
    if (editingEventoId) {
      const { catalogoId, ...updateValues } = submitValues;
      updateEventoMutation.mutate({ id: editingEventoId, values: updateValues });
    } else {
      // Include selected workers when creating new event, with optional portal notification
      createEventoMutation.mutate({ 
        ...submitValues, 
        workerIds: selectedWorkerIds,
        sendToPortal: sendToPortalOnCreate && selectedWorkerIds.length > 0,
      });
    }
  };

  // Group catalog by category
  const catalogoByCategory = catalogo.reduce((acc, item) => {
    const cat = item.categoria || 'otro';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, CapacitacionCatalogo[]>);

  const categoryLabels: Record<string, string> = {
    normatividad: "Normatividad SST",
    seguridad: "Seguridad Industrial",
    salud: "Salud Ocupacional",
    emergencias: "Emergencias",
    especializadas: "Capacitaciones Especializadas",
    induccion: "Inducción",
    reinduccion: "Reinducción",
    prevencion_riesgos: "Prevención de Riesgos",
    trabajo_alturas: "Trabajo en Alturas",
    ergonomia: "Ergonomía",
    higiene_industrial: "Higiene Industrial",
    seguridad_vial: "Seguridad Vial",
    primeros_auxilios: "Primeros Auxilios",
    riesgo_psicosocial: "Riesgo Psicosocial",
    riesgo_electrico: "Riesgo Eléctrico",
    sustancias_quimicas: "Sustancias Químicas",
    espacios_confinados: "Espacios Confinados",
    copasst: "COPASST",
    comite_convivencia: "Comité de Convivencia",
    otro: "Otros",
  };

  const formatCategoria = (cat: string) => categoryLabels[cat] || cat;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-end">
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Programa de Capacitación</h1>
          <p className="text-muted-foreground mt-2">
            Gestión integral de capacitaciones SST - Resolución 0312/2019
          </p>
        </div>
        <Button 
          onClick={() => setIsEventoDialogOpen(true)} 
          className="gap-2"
          data-testid="button-programar-capacitacion"
        >
          <Plus className="h-4 w-4" />
          Programar Capacitación
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eventos" className="gap-2" data-testid="tab-eventos">
            <Calendar className="h-4 w-4" />
            Eventos Programados
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="gap-2" data-testid="tab-catalogo">
            <BookOpen className="h-4 w-4" />
            Catálogo de Capacitaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Capacitaciones Programadas
              </CardTitle>
              <CardDescription>
                Eventos de capacitación programados y su estado de ejecución
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEventos ? (
                <div className="text-center py-8 text-muted-foreground">Cargando eventos...</div>
              ) : eventos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay capacitaciones programadas</p>
                  <p className="text-sm mt-1">Haga clic en "Programar Capacitación" para crear un nuevo evento</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Capacitación</TableHead>
                      <TableHead>Normativa</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventos.map((evento) => (
                      <TableRow key={evento.id} data-testid={`row-evento-${evento.id}`}>
                        <TableCell>
                          <div>
                            <span className="font-medium" data-testid={`text-titulo-${evento.id}`}>
                              {evento.tituloCurso}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${categoriaColors[evento.categoria || 'otro']}`}
                              >
                                {formatCategoria(evento.categoria || 'otro')}
                              </Badge>
                              {evento.obligatoria && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Obligatoria
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {evento.normativa || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(evento.fechaInicio).toLocaleDateString('es-CO')}
                          </div>
                          {evento.horaInicio && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {evento.horaInicio}{evento.horaFin ? ` - ${evento.horaFin}` : ""}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{evento.duracionHoras}h</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={estadoLabels[evento.estado]?.variant || "secondary"}>
                            {estadoLabels[evento.estado]?.label || evento.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenAsistentes(evento)}
                              title="Ver asistentes"
                              data-testid={`button-asistentes-${evento.id}`}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditEvento(evento)}
                              title="Editar"
                              data-testid={`button-editar-${evento.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEvento(evento.id)}
                              title="Eliminar"
                              data-testid={`button-eliminar-${evento.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalogo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Catálogo de Capacitaciones SST
              </CardTitle>
              <CardDescription>
                Capacitaciones predefinidas según normativa colombiana vigente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCatalogo ? (
                <div className="text-center py-8 text-muted-foreground">Cargando catálogo...</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(catalogoByCategory).map(([categoria, items]) => (
                    <div key={categoria}>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Badge className={categoriaColors[categoria]} variant="outline">
                          {formatCategoria(categoria)}
                        </Badge>
                        <span className="text-muted-foreground text-sm">({items.length})</span>
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((item) => (
                          <Card key={item.id} className="hover-elevate" data-testid={`card-catalogo-${item.id}`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {item.codigo}
                                    </span>
                                    {item.obligatoria && (
                                      <Badge variant="destructive" className="text-xs">
                                        Obligatoria
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium">{item.titulo}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.descripcion}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {item.duracionHoras}h
                                    </span>
                                    {item.normativa && (
                                      <span className="flex items-center gap-1">
                                        <Scale className="h-3 w-3" />
                                        {item.normativa}
                                      </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {item.nivel}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    form.setValue("catalogoId", item.id);
                                    setIsEventoDialogOpen(true);
                                  }}
                                  className="ml-2"
                                  data-testid={`button-programar-${item.id}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para programar/editar evento */}
      <Dialog open={isEventoDialogOpen} onOpenChange={setIsEventoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEventoId ? "Editar Capacitación" : "Programar Nueva Capacitación"}
            </DialogTitle>
            <DialogDescription>
              {editingEventoId 
                ? "Modifique los detalles del evento de capacitación"
                : "Seleccione una capacitación del catálogo y programe el evento"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEvento)} className="space-y-6">
              {/* Selector de catálogo */}
              {!editingEventoId && (
                <FormField
                  control={form.control}
                  name="catalogoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacitación *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-catalogo">
                            <SelectValue placeholder="Seleccione una capacitación del catálogo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {Object.entries(catalogoByCategory).map(([categoria, items]) => (
                            <SelectGroup key={categoria}>
                              <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted">
                                {formatCategoria(categoria)}
                              </SelectLabel>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <span className="font-mono text-xs text-muted-foreground mr-2">
                                    {item.codigo}
                                  </span>
                                  <span>{item.titulo}</span>
                                  {item.obligatoria && (
                                    <Badge variant="destructive" className="text-xs ml-2">
                                      Obl.
                                    </Badge>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Info del catálogo seleccionado (auto-fill preview) */}
              {selectedCatalogo && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Información del Curso (Auto-llenado)
                      </h4>
                      {selectedCatalogo.obligatoria && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Obligatoria
                        </Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Código:</span>
                        <span className="ml-2 font-mono">{selectedCatalogo.codigo}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duración:</span>
                        <span className="ml-2">{selectedCatalogo.duracionHoras} horas</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categoría:</span>
                        <span className="ml-2">{formatCategoria(selectedCatalogo.categoria || '')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nivel:</span>
                        <span className="ml-2 capitalize">{selectedCatalogo.nivel}</span>
                      </div>
                      {selectedCatalogo.normativa && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Normativa:</span>
                          <span className="ml-2 text-primary font-medium">{selectedCatalogo.normativa}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedCatalogo.descripcion}</p>
                  </CardContent>
                </Card>
              )}

              {/* Superadmin: Selector de empresa */}
              {isSuperadmin && !editingEventoId && (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company">
                            <SelectValue placeholder="Seleccione una empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              {/* Datos del evento */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-fecha-inicio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaFin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Fin</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-fecha-fin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          data-testid="input-hora-inicio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horaFin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Fin</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          data-testid="input-hora-fin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-lugar" className={field.value ? "bg-muted/30" : ""}>
                          <SelectValue placeholder="Seleccione el lugar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">Presencial</SelectLabel>
                          {LUGARES_PREDEFINIDOS.filter(l => l.tipo === 'presencial').map(lugar => (
                            <SelectItem key={lugar.id} value={lugar.nombre}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{lugar.nombre}</span>
                                {lugar.capacidad && (
                                  <span className="text-xs text-muted-foreground">({lugar.capacidad} pers.)</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">Virtual</SelectLabel>
                          {LUGARES_PREDEFINIDOS.filter(l => l.tipo === 'virtual').map(lugar => (
                            <SelectItem key={lugar.id} value={lugar.nombre}>
                              <div className="flex items-center gap-2">
                                <span>{lugar.nombre}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">En Campo</SelectLabel>
                          {LUGARES_PREDEFINIDOS.filter(l => l.tipo === 'campo').map(lugar => (
                            <SelectItem key={lugar.id} value={lugar.nombre}>
                              <div className="flex items-center gap-2">
                                <span>{lugar.nombre}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-instructor" className={field.value ? "bg-muted/30" : ""}>
                          <SelectValue placeholder="Seleccione el instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">Personal Interno</SelectLabel>
                          {INSTRUCTORES_PREDEFINIDOS.filter(i => i.tipo === 'interno').map(inst => (
                            <SelectItem key={inst.id} value={inst.nombre}>
                              <div className="flex flex-col">
                                <span>{inst.nombre}</span>
                                <span className="text-xs text-muted-foreground">{inst.especialidad}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">ARL</SelectLabel>
                          {INSTRUCTORES_PREDEFINIDOS.filter(i => i.tipo === 'arl').map(inst => (
                            <SelectItem key={inst.id} value={inst.nombre}>
                              <div className="flex flex-col">
                                <span>{inst.nombre}</span>
                                <span className="text-xs text-muted-foreground">{inst.especialidad}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">Externos</SelectLabel>
                          {INSTRUCTORES_PREDEFINIDOS.filter(i => i.tipo === 'externo').map(inst => (
                            <SelectItem key={inst.id} value={inst.nombre}>
                              <div className="flex flex-col">
                                <span>{inst.nombre}</span>
                                <span className="text-xs text-muted-foreground">{inst.especialidad}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                      <Textarea 
                        {...field} 
                        placeholder="Notas adicionales sobre la capacitación..."
                        rows={3}
                        data-testid="textarea-observaciones"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Worker Selection Section - Only show when creating new event */}
              {!editingEventoId && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Invitar Trabajadores
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {(isSuperadmin && !watchCompanyId) 
                            ? "Seleccione primero una empresa para ver sus trabajadores"
                            : `${selectedWorkerIds.length} de ${filteredWorkers.length} trabajador(es) seleccionado(s)`}
                        </p>
                      </div>
                      {filteredWorkers.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={toggleAllWorkers}
                          data-testid="button-toggle-all-workers"
                        >
                          {selectedWorkerIds.length === filteredWorkers.length 
                            ? "Deseleccionar todos" 
                            : "Seleccionar todos"}
                        </Button>
                      )}
                    </div>

                    {/* Quick selection by department and position */}
                    {filteredWorkers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Selección rápida:</p>
                        <div className="flex flex-wrap gap-1">
                          {/* Get unique departments */}
                          {Array.from(new Set(filteredWorkers.map(w => w.department).filter(Boolean))).map(dept => (
                            <Button
                              key={`dept-${dept}`}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                const deptWorkerIds = filteredWorkers.filter(w => w.department === dept).map(w => w.id);
                                const allSelected = deptWorkerIds.every(id => selectedWorkerIds.includes(id));
                                if (allSelected) {
                                  setSelectedWorkerIds(prev => prev.filter(id => !deptWorkerIds.includes(id)));
                                } else {
                                  setSelectedWorkerIds(prev => [...new Set([...prev, ...deptWorkerIds])]);
                                }
                              }}
                              data-testid={`button-select-dept-${dept}`}
                            >
                              {dept}
                            </Button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {/* Get unique positions */}
                          {Array.from(new Set(filteredWorkers.map(w => w.position).filter(Boolean))).slice(0, 8).map(pos => (
                            <Badge
                              key={`pos-${pos}`}
                              variant="secondary"
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                const posWorkerIds = filteredWorkers.filter(w => w.position === pos).map(w => w.id);
                                const allSelected = posWorkerIds.every(id => selectedWorkerIds.includes(id));
                                if (allSelected) {
                                  setSelectedWorkerIds(prev => prev.filter(id => !posWorkerIds.includes(id)));
                                } else {
                                  setSelectedWorkerIds(prev => [...new Set([...prev, ...posWorkerIds])]);
                                }
                              }}
                              data-testid={`badge-select-pos-${pos}`}
                            >
                              {pos}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(isSuperadmin && !watchCompanyId) ? (
                      <div className="text-center py-4 text-muted-foreground text-sm border rounded-md bg-muted/30">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Seleccione una empresa para ver los trabajadores disponibles
                      </div>
                    ) : filteredWorkers.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm border rounded-md bg-muted/30">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No hay trabajadores registrados en esta empresa
                      </div>
                    ) : (
                      <ScrollArea className="h-[180px] border rounded-md p-2" data-testid="scroll-workers">
                        <div className="space-y-1">
                          {filteredWorkers.map((worker) => (
                            <label
                              key={worker.id}
                              className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover-elevate"
                              data-testid={`worker-item-${worker.id}`}
                            >
                              <Checkbox
                                checked={selectedWorkerIds.includes(worker.id)}
                                onCheckedChange={() => toggleWorkerSelection(worker.id)}
                                data-testid={`checkbox-worker-${worker.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm">
                                  {worker.name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {worker.identificationNumber}
                                </span>
                              </div>
                              {worker.position && (
                                <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                                  {worker.position}
                                </Badge>
                              )}
                            </label>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                  
                  {/* Checkbox to send to portal when creating - only shown when creating new event and workers are selected */}
                  {!editingEventoId && selectedWorkerIds.length > 0 && (
                    <label 
                      className="flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20 cursor-pointer mt-3"
                      data-testid="label-send-portal-on-create"
                    >
                      <Checkbox
                        checked={sendToPortalOnCreate}
                        onCheckedChange={(checked) => setSendToPortalOnCreate(checked === true)}
                        data-testid="checkbox-send-portal-on-create"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-sm">
                          <Send className="h-4 w-4 text-primary" />
                          Enviar notificación al Portal de Empleados
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Los trabajadores seleccionados recibirán la convocatoria en su portal
                        </p>
                      </div>
                    </label>
                  )}
                </>
              )}

              <div className="flex justify-between gap-2 pt-4">
                {/* Send to Portal Button - Only when editing */}
                {editingEventoId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={sendToPortalMutation.isPending}
                    onClick={() => {
                      const evento = eventos.find(e => e.id === editingEventoId);
                      if (evento) sendToPortalMutation.mutate(evento);
                    }}
                    data-testid="button-enviar-portal"
                  >
                    <Send className="h-4 w-4" />
                    {sendToPortalMutation.isPending ? "Enviando..." : "Enviar al Portal"}
                  </Button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseEventoDialog}
                    data-testid="button-cancelar"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEventoMutation.isPending || updateEventoMutation.isPending}
                    data-testid="button-guardar"
                  >
                    {createEventoMutation.isPending || updateEventoMutation.isPending
                      ? "Guardando..."
                      : editingEventoId
                      ? "Actualizar"
                      : "Programar Capacitación"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para asistentes */}
      {selectedEvento && (
        <AsistentesDialog
          isOpen={isAsistentesDialogOpen}
          onClose={() => {
            setIsAsistentesDialogOpen(false);
            setSelectedEvento(null);
          }}
          evento={selectedEvento}
          workers={workers}
        />
      )}
    </div>
  );
}

// Componente separado para asistentes
interface AsistentesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evento: CapacitacionEvento;
  workers: Worker[];
}

type EstadoAsistente = "invitado" | "confirmado" | "asistio" | "ausente" | "excusado";

interface CapacitacionAsistente {
  id: string;
  eventoId: string;
  workerId: string;
  companyId: string;
  estado: EstadoAsistente;
  observaciones: string | null;
  createdAt: string;
}

const estadoAsistenteLabels: Record<EstadoAsistente, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  invitado: { label: "Invitado", variant: "outline" },
  confirmado: { label: "Confirmado", variant: "secondary" },
  asistio: { label: "Asistió", variant: "default" },
  ausente: { label: "Ausente", variant: "destructive" },
  excusado: { label: "Excusado", variant: "outline" },
};

function AsistentesDialog({ isOpen, onClose, evento, workers }: AsistentesDialogProps) {
  const { toast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  // Fetch attendees for this event
  const { data: asistentes = [], isLoading } = useQuery<CapacitacionAsistente[]>({
    queryKey: ["/api/capacitacion-eventos", evento.id, "asistentes"],
    queryFn: async () => {
      const res = await fetch(`/api/capacitacion-eventos/${evento.id}/asistentes`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al cargar asistentes');
      return res.json();
    },
    enabled: isOpen,
  });

  // Add attendee mutation
  const addAsistenteMutation = useMutation({
    mutationFn: async (workerId: string) => {
      return await apiRequest("POST", `/api/capacitacion-eventos/${evento.id}/asistentes`, {
        workerId,
        estado: "invitado",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capacitacion-eventos", evento.id, "asistentes"] });
      toast({
        title: "Trabajador agregado",
        description: "El trabajador ha sido invitado a la capacitación",
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

  // Update attendee state mutation
  const updateAsistenteMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: EstadoAsistente }) => {
      return await apiRequest("PATCH", `/api/capacitacion-asistentes/${id}`, { estado });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capacitacion-eventos", evento.id, "asistentes"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de asistencia ha sido actualizado",
        className: "bg-green-50 border-green-200",
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

  // Delete attendee mutation
  const deleteAsistenteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/capacitacion-asistentes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capacitacion-eventos", evento.id, "asistentes"] });
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

  // Get workers not yet added
  const addedWorkerIds = new Set(asistentes.map(a => a.workerId));
  const availableWorkers = workers.filter(w => !addedWorkerIds.has(w.id));

  // Get worker name helper
  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : "Trabajador desconocido";
  };

  const getWorkerCedula = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.identificationNumber || "";
  };

  const handleAddAsistente = () => {
    if (selectedWorkerId) {
      addAsistenteMutation.mutate(selectedWorkerId);
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
            {evento.tituloCurso} - {new Date(evento.fechaInicio).toLocaleDateString('es-CO')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agregar trabajador */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Agregar Trabajador</label>
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger data-testid="select-worker">
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
              onClick={handleAddAsistente}
              disabled={!selectedWorkerId || addAsistenteMutation.isPending}
              className="gap-1"
              data-testid="button-agregar-asistente"
            >
              <UserPlus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          <Separator />

          {/* Lista de asistentes */}
          <div>
            <h4 className="font-medium mb-2">
              Trabajadores Inscritos ({asistentes.length})
            </h4>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Cargando...</div>
            ) : asistentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay trabajadores inscritos</p>
                <p className="text-sm mt-1">Agregue trabajadores usando el selector de arriba</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asistentes.map((asistente) => (
                    <TableRow key={asistente.id} data-testid={`row-asistente-${asistente.id}`}>
                      <TableCell className="font-medium">
                        {getWorkerName(asistente.workerId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getWorkerCedula(asistente.workerId)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={asistente.estado}
                          onValueChange={(value: EstadoAsistente) => {
                            updateAsistenteMutation.mutate({ id: asistente.id, estado: value });
                          }}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-estado-${asistente.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="invitado">Invitado</SelectItem>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="asistio">Asistió</SelectItem>
                            <SelectItem value="ausente">Ausente</SelectItem>
                            <SelectItem value="excusado">Excusado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("¿Está seguro de eliminar este asistente?")) {
                              deleteAsistenteMutation.mutate(asistente.id);
                            }
                          }}
                          title="Eliminar"
                          data-testid={`button-eliminar-asistente-${asistente.id}`}
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

          {/* Resumen de asistencia */}
          {asistentes.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h5 className="font-medium mb-2">Resumen de Asistencia</h5>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{asistentes.filter(a => a.estado === 'invitado').length}</Badge>
                    <span className="text-muted-foreground">Invitados</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">{asistentes.filter(a => a.estado === 'confirmado').length}</Badge>
                    <span className="text-muted-foreground">Confirmados</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="default">{asistentes.filter(a => a.estado === 'asistio').length}</Badge>
                    <span className="text-muted-foreground">Asistieron</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="destructive">{asistentes.filter(a => a.estado === 'ausente').length}</Badge>
                    <span className="text-muted-foreground">Ausentes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{asistentes.filter(a => a.estado === 'excusado').length}</Badge>
                    <span className="text-muted-foreground">Excusados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
