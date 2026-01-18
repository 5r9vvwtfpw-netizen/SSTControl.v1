import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ClipboardCheck, Calendar, Clock, CheckCircle2, Shield, PlayCircle, Building2, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RevisionDireccion, Company, insertRevisionDireccionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionFeatures } from "@/hooks/use-subscription-features";
import UpgradeAlert from "@/components/UpgradeAlert";
import { z } from "zod";
import { format } from "date-fns";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";

const normativaRevisionesDireccion = [
  {
    codigo: 'ISO-45001-9.3',
    norma: 'ISO 45001:2018',
    articulo: 'Capítulo 9.3',
    descripcion: 'Revisión por la dirección',
    requisitos: [
      'Revisión a intervalos planificados',
      'Entradas de revisión definidas',
      'Salidas con decisiones y acciones',
      'Información documentada de resultados'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.31',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.31',
    descripcion: 'Revisión por la alta dirección',
    requisitos: [
      'Revisión mínimo una vez al año',
      'Evaluación de cumplimiento de política y objetivos',
      'Resultados de auditorías',
      'Acciones de mejora continua'
    ],
    obligatorio: true
  }
];

const formSchema = insertRevisionDireccionSchema.extend({
  companyId: z.string().optional(),
});

export default function RevisionesDireccion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      titulo: "",
      periodicidad: "semestral",
      fechaRevision: new Date(),
      estado: "programada",
      lugar: "",
      duracion: undefined,
      antecedentes: "",
      resumenEjecutivo: "",
      conclusiones: "",
    },
  });

  const { data: features, isLoading: isFeaturesLoading, isError: isFeaturesError } = useSubscriptionFeatures();

  const { data: revisiones = [], isLoading } = useQuery<RevisionDireccion[]>({
    queryKey: ["/api/revisiones-direccion"],
    enabled: !!features?.hasRevisionDireccion, // Only fetch if feature is available
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = isSuperadmin && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/revisiones-direccion", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revisiones-direccion"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Revisión creada",
        description: "La Revisión por Dirección se ha creado exitosamente",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  const filteredRevisiones = revisiones.filter((revision) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      revision.codigo.toLowerCase().includes(searchLower) ||
      revision.titulo.toLowerCase().includes(searchLower) ||
      (revision.lugar?.toLowerCase().includes(searchLower) ?? false) ||
      (revision.resumenEjecutivo?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      "programada": { label: "Programada", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Calendar },
      "en_ejecucion": { label: "En Ejecución", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: Clock },
      "completada": { label: "Completada", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "aprobada": { label: "Aprobada", className: "bg-green-600/10 text-green-800 dark:text-green-300", icon: Shield },
      "seguimiento": { label: "Seguimiento", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: PlayCircle },
    };
    const item = config[estado as keyof typeof config] || config["programada"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  const getPeriodicidadBadge = (periodicidad: string) => {
    const config = {
      "mensual": { label: "Mensual", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      "trimestral": { label: "Trimestral", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      "semestral": { label: "Semestral", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" },
      "anual": { label: "Anual", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    };
    const item = config[periodicidad.toLowerCase() as keyof typeof config];
    return item ? <Badge className={item.className}>{item.label}</Badge> : null;
  };

  // Show upgrade alert if feature not available
  if (isFeaturesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isFeaturesError || !features?.hasRevisionDireccion) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Revisión por Dirección
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de revisiones gerenciales del Sistema de Gestión SST (ISO 45001:2018 / Resolución 0312)
          </p>
        </div>
        <AutomationAssistant
          titulo="Revisión por la Alta Dirección"
          estandar="3.2.1"
          descripcion="Revisiones gerenciales del SG-SST conforme a ISO 45001 y Decreto 1072"
          normativaAplicable={normativaRevisionesDireccion}
          compact={true}
        />
        <UpgradeAlert
          feature="Revisión por Dirección"
          description="Gestiona revisiones gerenciales del Sistema de Gestión SST conforme a ISO 45001:2018 cláusula 9.3 y Resolución 0312/2019. Incluye registro de entradas, salidas, decisiones y seguimiento."
          requiredPlan="empresarial"
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-end">
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Revisión por Dirección
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de revisiones gerenciales del Sistema de Gestión SST (ISO 45001:2018 / Resolución 0312)
          </p>
        </div>
        <AutomationAssistant
          titulo="Revisión por la Alta Dirección"
          estandar="3.2.1"
          descripcion="Revisiones gerenciales del SG-SST conforme a ISO 45001 y Decreto 1072"
          normativaAplicable={normativaRevisionesDireccion}
          compact={true}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-revision" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Revisión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Revisión por Dirección</DialogTitle>
              <DialogDescription>
                Registre una nueva revisión gerencial del Sistema de Gestión SST
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isSuperadmin && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej: RD-2025-01"
                            data-testid="input-codigo"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="periodicidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidad</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-periodicidad">
                              <SelectValue placeholder="Seleccione periodicidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mensual">Mensual</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Título descriptivo de la revisión"
                          data-testid="input-titulo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaRevision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Revisión</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-fecha-revision"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lugar</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Sala de juntas, virtual..."
                            data-testid="input-lugar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración (minutos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="120"
                            data-testid="input-duracion"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="programada">Programada</SelectItem>
                          <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="aprobada">Aprobada</SelectItem>
                          <SelectItem value="seguimiento">Seguimiento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="antecedentes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antecedentes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Contexto y antecedentes de la revisión..."
                          rows={3}
                          data-testid="textarea-antecedentes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumenEjecutivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumen Ejecutivo</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Resumen de los puntos clave discutidos..."
                          rows={3}
                          data-testid="textarea-resumen"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conclusiones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conclusiones</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Conclusiones y acuerdos generales..."
                          rows={3}
                          data-testid="textarea-conclusiones"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? "Creando..." : "Crear Revisión"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar revisiones por código, título, lugar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRevisiones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay revisiones registradas</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchTerm
                ? "No se encontraron revisiones que coincidan con tu búsqueda"
                : "Comienza creando tu primera Revisión por Dirección"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Revisión
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRevisiones.map((revision) => (
            <Card
              key={revision.id}
              className="hover-elevate cursor-pointer"
              data-testid={`card-revision-${revision.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg line-clamp-1">
                    {revision.codigo}
                  </CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    {getEstadoBadge(revision.estado)}
                    {getPeriodicidadBadge(revision.periodicidad)}
                  </div>
                </div>
                <CardDescription className="line-clamp-1">
                  {revision.titulo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">{format(new Date(revision.fechaRevision), 'dd/MM/yyyy')}</span>
                </div>

                {revision.lugar && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Lugar:</span>
                    <span className="font-medium line-clamp-1">{revision.lugar}</span>
                  </div>
                )}

                {revision.duracion && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{revision.duracion} min</span>
                  </div>
                )}

                {revision.resumenEjecutivo && (
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
                    {revision.resumenEjecutivo}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
