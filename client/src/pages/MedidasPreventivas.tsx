import { PreventiveMeasureCard } from "@/components/PreventiveMeasureCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Filter, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PreventiveMeasure, insertPreventiveMeasureSchema, Worker } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaMedidasPreventivas = [
  {
    codigo: 'DEC-1072-2.2.4.6.33',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.33',
    descripcion: 'Acciones preventivas y correctivas',
    requisitos: [
      'Identificación de causas raíz de problemas',
      'Implementación de acciones para eliminar causas',
      'Seguimiento a la eficacia de las acciones',
      'Documentación de cambios y resultados'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-4.1.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 4.1.1',
    descripcion: 'Acciones de mejora',
    requisitos: [
      'Plan de acción con responsables y fechas',
      'Recursos asignados para implementación',
      'Verificación de cierre efectivo',
      'Retroalimentación a las partes interesadas'
    ],
    obligatorio: true
  }
];

const formSchema = insertPreventiveMeasureSchema.extend({
  relatedArea: z.string().optional(),
});

export default function MedidasPreventivas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      responsible: "",
      dueDate: "",
      status: "pendiente",
      priority: "media",
      relatedArea: "",
    },
  });

  const { data: measures = [], isLoading: measuresLoading } = useQuery<PreventiveMeasure[]>({
    queryKey: ["/api/preventive-measures"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const createMeasureMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!user?.companyId) {
        throw new Error("Usuario sin empresa asignada");
      }
      const payload = {
        ...data,
        companyId: user.companyId,
      };
      const res = await apiRequest("POST", "/api/preventive-measures", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-measures"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Medida preventiva creada",
        description: "La medida preventiva se ha registrado exitosamente",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMeasureMutation.mutate(values);
  };

  const filteredMeasures = measures.filter((measure) => {
    const matchesSearch = 
      measure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measure.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || measure.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);

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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Medidas Preventivas</h1>
          <p className="text-muted-foreground">Acciones de prevención y control de riesgos</p>
        </div>
        <AutomationAssistant
          titulo="Acciones Preventivas y Correctivas"
          estandar="4.1.1"
          descripcion="Gestión de medidas de prevención y control para mejora continua del SG-SST"
          normativaAplicable={normativaMedidasPreventivas}
          compact={true}
        />
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-measure">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Medida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Medida Preventiva</DialogTitle>
                <DialogDescription>Complete los datos de la medida preventiva</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Capacitación en uso de EPP" 
                            data-testid="input-title"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa la medida preventiva en detalle"
                            data-testid="input-description"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="responsible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-responsible">
                                <SelectValue placeholder="Seleccione un responsable" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={worker.id} value={worker.name}>
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Vencimiento</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-due-date"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="baja">Baja</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en-progreso">En Progreso</SelectItem>
                              <SelectItem value="completada">Completada</SelectItem>
                              <SelectItem value="vencida">Vencida</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="relatedArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Relacionada (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Producción, Almacén, etc." 
                            data-testid="input-related-area"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMeasureMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createMeasureMutation.isPending ? "Guardando..." : "Guardar Medida"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar medidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en-progreso">En Progreso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {measuresLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando medidas preventivas...</p>
        </div>
      ) : filteredMeasures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron medidas preventivas</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeasures.map((measure) => (
            <PreventiveMeasureCard
              key={measure.id}
              title={measure.title}
              description={measure.description}
              responsible={measure.responsible}
              dueDate={formatDate(measure.dueDate)}
              status={measure.status}
              priority={measure.priority}
              relatedArea={measure.relatedArea}
            />
          ))}
        </div>
      )}
    </div>
  );
}
