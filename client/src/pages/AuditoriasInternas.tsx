import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ClipboardCheck, Calendar, Users, CheckCircle2, Clock, FileText, Shield, UserCheck } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuditoriaInterna, Company, Worker, CopasstActa, insertAuditoriaInternaSchema } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionFeatures } from "@/hooks/use-subscription-features";
import UpgradeAlert from "@/components/UpgradeAlert";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";

const normativaAuditorias = [
  {
    codigo: 'ISO-45001-9.2',
    norma: 'ISO 45001:2018',
    articulo: 'Capítulo 9.2',
    descripcion: 'Auditoría interna',
    requisitos: [
      'Programa de auditoría planificado',
      'Criterios y alcance definidos',
      'Auditores competentes e imparciales',
      'Informes de auditoría documentados'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-3.1.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 3.1.1',
    descripcion: 'Auditoría anual del SG-SST',
    requisitos: [
      'Auditoría anual con alcance definido',
      'Auditores con formación en SST',
      'Comunicación de resultados a la dirección',
      'Plan de mejora según hallazgos'
    ],
    obligatorio: true
  }
];

const formSchema = insertAuditoriaInternaSchema.extend({
  companyId: z.string().optional(),
}).refine(
  (data) => {
    if (data.planificadaConCopasst) {
      return !!data.copasstActaId && !!data.fechaAprobacionCopasst;
    }
    return true;
  },
  {
    message: "Debe seleccionar un acta COPASST y fecha de aprobación cuando la auditoría es planificada con COPASST",
    path: ["copasstActaId"],
  }
);

export default function AuditoriasInternas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      titulo: "",
      tipo: "interna",
      normaReferencia: "ISO_45001",
      objetivo: "",
      alcance: "",
      fechaProgramada: new Date(),
      auditoristaLider: user?.fullName || user?.username || "",
      estado: "programada",
      planificadaConCopasst: false,
      copasstActaId: undefined,
      fechaAprobacionCopasst: undefined,
      observacionesCopasst: "",
    },
  });

  const { data: features, isLoading: isFeaturesLoading, isError: isFeaturesError } = useSubscriptionFeatures();

  const { data: auditorias = [], isLoading } = useQuery<AuditoriaInterna[]>({
    queryKey: ["/api/auditorias-internas"],
    enabled: !!features?.hasAuditorias, // Only fetch if feature is available
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isAdmin,
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: copasstActas = [] } = useQuery<CopasstActa[]>({
    queryKey: ["/api/copasst-actas"],
  });

  const planificadaConCopasst = form.watch("planificadaConCopasst");

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = isAdmin && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/auditorias-internas", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auditorias-internas"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Auditoría creada",
        description: "La auditoría interna se ha creado exitosamente",
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

  const filteredAuditorias = auditorias.filter((auditoria) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      auditoria.titulo.toLowerCase().includes(searchLower) ||
      (auditoria.codigo?.toLowerCase().includes(searchLower) ?? false) ||
      (auditoria.alcance?.toLowerCase().includes(searchLower) ?? false) ||
      (auditoria.auditoristaLider?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const config = {
      "programada": { label: "Programada", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Calendar },
      "en_progreso": { label: "En Progreso", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: Clock },
      "completada": { label: "Completada", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "aprobada": { label: "Aprobada", className: "bg-green-600/10 text-green-800 dark:text-green-300", icon: Shield },
      "cancelada": { label: "Cancelada", className: "bg-red-500/10 text-red-700 dark:text-red-400", icon: FileText },
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

  const getTipoBadge = (tipo: string) => {
    const config = {
      "interna": { label: "Interna", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      "externa": { label: "Externa", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
      "seguimiento": { label: "Seguimiento", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    };
    const item = config[tipo as keyof typeof config] || config["interna"];
    return <Badge className={item.className}>{item.label}</Badge>;
  };

  // Show upgrade alert if feature not available
  if (isFeaturesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isFeaturesError || !features?.hasAuditorias) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Auditorías Internas SST</h1>
          <p className="text-muted-foreground">ISO 45001:2018 | Resolución 0312/2019</p>
        </div>
        <UpgradeAlert
          feature="Auditorías Internas SST"
          description="Gestiona auditorías internas del sistema de gestión SST conforme a ISO 45001:2018 y Resolución 0312/2019. Incluye registro de hallazgos, planes de acción y seguimiento."
          requiredPlan="profesional"
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Auditorías Internas SST</h1>
          <p className="text-muted-foreground">ISO 45001:2018 | Resolución 0312/2019</p>
        </div>
        <AutomationAssistant
          titulo="Auditoría Interna del SG-SST"
          estandar="3.1.1"
          descripcion="Programa de auditorías internas conforme a ISO 45001 y Resolución 0312"
          normativaAplicable={normativaAuditorias}
          compact={true}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="default" data-testid="button-new-audit">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Auditoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Auditoría Interna</DialogTitle>
              <DialogDescription>
                Crear una nueva auditoría interna del sistema de gestión SST
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Seleccionar empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name} - {company.nit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="AUD-INT-2025-001" data-testid="input-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaProgramada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Programada *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value instanceof Date && !isNaN(field.value.getTime()) 
                              ? field.value.toISOString().split('T')[0] 
                              : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            data-testid="input-date"
                          />
                        </FormControl>
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
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Auditoría Interna SG-SST 2025" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="interna">Interna</SelectItem>
                            <SelectItem value="externa">Externa</SelectItem>
                            <SelectItem value="seguimiento">Seguimiento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="normaReferencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Norma de Referencia *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-standard">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ISO_45001">ISO 45001:2018</SelectItem>
                            <SelectItem value="res_0312_2019">Resolución 0312/2019</SelectItem>
                            <SelectItem value="ambas">Ambas Normas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="objetivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Verificar la conformidad del Sistema de Gestión de SST..."
                          rows={2}
                          data-testid="input-objective"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alcance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcance *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Aplica a todos los procesos del SG-SST..."
                          rows={2}
                          data-testid="input-scope"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="auditoristaLider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auditor Líder *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-lead-auditor">
                            <SelectValue placeholder="Seleccione auditor líder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workers?.map((worker) => (
                            <SelectItem key={worker.id} value={`${worker.name} - ${worker.position}`}>
                              {worker.name} - {worker.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Integración COPASST - Estándar 6.1.4 Resolución 0312/2019 */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Participación COPASST</h4>
                    <span className="text-xs text-muted-foreground">(Estándar 6.1.4)</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="planificadaConCopasst"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 mb-4">
                        <div className="space-y-0.5">
                          <FormLabel>Planificada con COPASST</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            La auditoría fue planificada con participación del Comité Paritario
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            data-testid="switch-copasst"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {planificadaConCopasst && (
                    <>
                      <FormField
                        control={form.control}
                        name="copasstActaId"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Acta COPASST Relacionada</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-copasst-acta">
                                  <SelectValue placeholder="Seleccionar acta de reunión" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {copasstActas.map((acta) => (
                                  <SelectItem key={acta.id} value={acta.id}>
                                    Acta #{acta.numeroActa} - {new Date(acta.fecha).toLocaleDateString()}
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
                        name="fechaAprobacionCopasst"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Fecha de Aprobación COPASST *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value ? new Date(field.value as string | Date).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                data-testid="input-copasst-approval-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="observacionesCopasst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observaciones del COPASST</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Observaciones o recomendaciones del comité COPASST..."
                                rows={2}
                                data-testid="input-copasst-observations"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                    {createMutation.isPending ? "Creando..." : "Crear Auditoría"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, código, alcance o auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAuditorias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay auditorías registradas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Comienza creando tu primera auditoría interna"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Auditoría
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAuditorias.map((auditoria) => (
            <Card key={auditoria.id} className="hover-elevate cursor-pointer" data-testid={`card-audit-${auditoria.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{auditoria.codigo}</CardTitle>
                      {getEstadoBadge(auditoria.estado)}
                    </div>
                    <CardDescription className="line-clamp-2">{auditoria.titulo}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTipoBadge(auditoria.tipo)}
                  {auditoria.planificadaConCopasst && (
                    <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                      <UserCheck className="h-3 w-3 mr-1" />
                      COPASST
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(auditoria.fechaProgramada).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{auditoria.auditoristaLider}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardCheck className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{auditoria.alcance?.substring(0, 50)}...</span>
                  </div>
                </div>

                {(auditoria.numeroHallazgos ?? 0) > 0 && (
                  <div className="flex items-center gap-3 pt-2 border-t text-xs">
                    <span className="text-green-700 dark:text-green-400">
                      ✓ {auditoria.numeroConformidades || 0}
                    </span>
                    <span className="text-yellow-700 dark:text-yellow-400">
                      ⚠ {auditoria.numeroNoConformidadesMenores || 0}
                    </span>
                    <span className="text-red-700 dark:text-red-400">
                      ✕ {auditoria.numeroNoConformidadesMayores || 0}
                    </span>
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
