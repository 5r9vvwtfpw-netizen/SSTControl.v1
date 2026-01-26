import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, ClipboardCheck, Calendar, Users, CheckCircle2, Clock, FileText, 
  Shield, UserCheck, CalendarDays, AlertTriangle, Target, BookOpen, Sparkles,
  ChevronRight, Building2, FileWarning, Clipboard, Eye, Edit2, Trash2, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuditoriaInterna, Company, Worker, CopasstActa, insertAuditoriaInternaSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { hasGlobalAccess, hasCompanyAdminAccess } from "@shared/permissions";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { z } from "zod";

const ELEMENTOS_AUDITORIA_DECRETO_1072 = [
  { id: "1", codigo: "POL-OBJ", nombre: "Política y objetivos del SG-SST", descripcion: "Verificar la política de seguridad y salud en el trabajo y los objetivos establecidos", categoria: "planear" },
  { id: "2", codigo: "EST-MIN", nombre: "Cumplimiento de estándares mínimos", descripcion: "Verificar cumplimiento de estándares mínimos según Resolución 0312/2019", categoria: "verificar" },
  { id: "3", codigo: "ID-RIESG", nombre: "Identificación y evaluación de riesgos", descripcion: "Revisión de la matriz IPERC y metodología de identificación de peligros", categoria: "planear" },
  { id: "4", codigo: "MED-PREV", nombre: "Medidas preventivas y correctivas", descripcion: "Verificar implementación de medidas de prevención y corrección de riesgos", categoria: "hacer" },
  { id: "5", codigo: "PROG-CAP", nombre: "Programas de capacitación", descripcion: "Revisión del plan de capacitación y registros de formación en SST", categoria: "hacer" },
  { id: "6", codigo: "EX-MED", nombre: "Exámenes médicos y vigilancia de salud", descripcion: "Verificar programa de exámenes médicos ocupacionales y seguimiento epidemiológico", categoria: "hacer" },
  { id: "7", codigo: "PREP-EMERG", nombre: "Preparación para emergencias y simulacros", descripcion: "Revisión del plan de emergencias, brigadas y ejecución de simulacros", categoria: "hacer" },
  { id: "8", codigo: "INV-ACCID", nombre: "Investigación de incidentes y accidentes", descripcion: "Verificar metodología de investigación y registro de accidentes e incidentes", categoria: "verificar" },
  { id: "9", codigo: "DOC-REG", nombre: "Documentación y registros", descripcion: "Revisión de la documentación del SG-SST y control de registros", categoria: "planear" },
  { id: "10", codigo: "COPASST", nombre: "Funcionamiento del COPASST/Vigía SST", descripcion: "Verificar conformación, reuniones y funcionamiento del comité", categoria: "verificar" },
  { id: "11", codigo: "CUMPL-LEG", nombre: "Cumplimiento legal de normas SST", descripcion: "Revisión de la matriz legal y cumplimiento de requisitos normativos", categoria: "verificar" },
  { id: "12", codigo: "MEC-COM", nombre: "Mecanismos de comunicación", descripcion: "Verificar canales de comunicación interna y participación de trabajadores", categoria: "hacer" },
  { id: "13", codigo: "ACC-MEJ", nombre: "Acciones de mejora continua", descripcion: "Revisión del plan de mejoramiento y seguimiento a acciones correctivas", categoria: "actuar" },
];

const TIPOS_HALLAZGO = [
  { valor: "conformidad", etiqueta: "Conformidad", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  { valor: "no_conformidad_menor", etiqueta: "No Conformidad Menor", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  { valor: "no_conformidad_mayor", etiqueta: "No Conformidad Mayor", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { valor: "observacion", etiqueta: "Observación", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { valor: "oportunidad_mejora", etiqueta: "Oportunidad de Mejora", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
];

const normativaAuditoriasSST = [
  {
    codigo: 'DEC-1072-2.2.4.6.29',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.29',
    descripcion: 'Auditoría de cumplimiento del SG-SST',
    requisitos: [
      'Auditoría anual planificada con COPASST',
      'Verificación de cumplimiento de estándares',
      'Comunicación de resultados a la alta dirección',
      'Definición de acciones correctivas'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.30',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.30',
    descripcion: 'Alcance de la auditoría de cumplimiento',
    requisitos: [
      'Verificar cumplimiento de política y objetivos SST',
      'Verificar resultado de indicadores de gestión',
      'Verificar participación de trabajadores',
      'Verificar desarrollo de responsabilidades y obligaciones',
      'Verificar mecanismo de comunicación interna',
      'Verificar gestión del cambio',
      'Verificar cumplimiento de requisitos legales',
      'Verificar gestión de peligros y riesgos',
      'Verificar plan de trabajo anual',
      'Verificar condiciones de salud de trabajadores',
      'Verificar programa de vigilancia epidemiológica',
      'Verificar resultados de auditorías anteriores',
      'Verificar acciones correctivas y preventivas'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-6.1.3',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 6.1.3',
    descripcion: 'Planificación de auditoría con el COPASST',
    requisitos: [
      'El programa de auditoría debe ser planificado con participación del COPASST',
      'Definir criterios de auditoría conforme a normatividad vigente',
      'Programar auditoría al menos una vez al año'
    ],
    obligatorio: true
  },
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
    obligatorio: false
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

function generarCodigoAuditoria(tipo: string, year: number, numero: number): string {
  const tipoCode = tipo === 'interna' ? 'INT' : tipo === 'externa' ? 'EXT' : 'SEG';
  return `AUD-${tipoCode}-${year}-${String(numero).padStart(3, '0')}`;
}

export default function AuditoriasInternasEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("auditorias");
  const [selectedElementos, setSelectedElementos] = useState<Set<string>>(new Set());
  
  const hasGlobalAccessUser = user?.role ? hasGlobalAccess(user.role) : false;
  const hasCompanyAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const canAccess = hasGlobalAccessUser || hasCompanyAdmin;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      titulo: "",
      tipo: "interna",
      normaReferencia: "res_0312_2019",
      objetivo: "Verificar el cumplimiento y eficacia del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) conforme a la Resolución 0312/2019 y el Decreto 1072/2015.",
      alcance: "",
      fechaProgramada: new Date(),
      auditoristaLider: user?.fullName || user?.username || "",
      estado: "programada",
      planificadaConCopasst: true,
      copasstActaId: undefined,
      fechaAprobacionCopasst: undefined,
      observacionesCopasst: "",
    },
  });

  const { data: auditorias = [], isLoading } = useQuery<AuditoriaInterna[]>({
    queryKey: ["/api/auditorias-internas"],
    enabled: canAccess,
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: hasGlobalAccessUser,
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: copasstActas = [] } = useQuery<CopasstActa[]>({
    queryKey: ["/api/copasst-actas"],
  });

  const planificadaConCopasst = form.watch("planificadaConCopasst");
  const tipoAuditoria = form.watch("tipo");

  useEffect(() => {
    if (auditorias.length > 0) {
      const currentYear = new Date().getFullYear();
      const auditoriasThisYear = auditorias.filter(a => 
        new Date(a.fechaProgramada).getFullYear() === currentYear
      );
      const nextNumber = auditoriasThisYear.length + 1;
      const codigo = generarCodigoAuditoria(tipoAuditoria || 'interna', currentYear, nextNumber);
      form.setValue("codigo", codigo);
    } else {
      const codigo = generarCodigoAuditoria(tipoAuditoria || 'interna', new Date().getFullYear(), 1);
      form.setValue("codigo", codigo);
    }
  }, [auditorias, tipoAuditoria]);

  useEffect(() => {
    const alcanceTexto = selectedElementos.size > 0
      ? `Alcance definido según Decreto 1072/2015 Art. 2.2.4.6.30:\n${
          ELEMENTOS_AUDITORIA_DECRETO_1072
            .filter(e => selectedElementos.has(e.id))
            .map(e => `- ${e.nombre}`)
            .join('\n')
        }`
      : "";
    form.setValue("alcance", alcanceTexto);
  }, [selectedElementos]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = hasGlobalAccessUser && data.companyId 
        ? { ...data, companyId: data.companyId }
        : data;
      const res = await apiRequest("POST", "/api/auditorias-internas", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auditorias-internas"] });
      setDialogOpen(false);
      form.reset();
      setSelectedElementos(new Set());
      toast({
        title: "Auditoría creada",
        description: "La auditoría interna se ha programado exitosamente",
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

  const toggleElemento = (id: string) => {
    const newSet = new Set(selectedElementos);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedElementos(newSet);
  };

  const selectAllElementos = () => {
    setSelectedElementos(new Set(ELEMENTOS_AUDITORIA_DECRETO_1072.map(e => e.id)));
  };

  const clearAllElementos = () => {
    setSelectedElementos(new Set());
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

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      "planear": "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
      "hacer": "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
      "verificar": "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
      "actuar": "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20",
    };
    return colors[categoria as keyof typeof colors] || "";
  };

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Auditorías Internas SST</h1>
          <p className="text-muted-foreground">ISO 45001:2018 | Resolución 0312/2019 | Decreto 1072/2015</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Este módulo requiere permisos de administrador. Contacte al administrador de su empresa para obtener acceso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Auditorías Internas SST</h1>
          <p className="text-muted-foreground">Decreto 1072/2015 | Resolución 0312/2019 | ISO 45001:2018</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="default" data-testid="button-new-audit">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Auditoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Nueva Auditoría Interna del SG-SST
              </DialogTitle>
              <DialogDescription>
                Programar auditoría conforme al Decreto 1072/2015 Art. 2.2.4.6.29 y Resolución 0312/2019 Estándar 6.1.3
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">Información General</TabsTrigger>
                    <TabsTrigger value="alcance">Alcance (Art. 2.2.4.6.30)</TabsTrigger>
                    <TabsTrigger value="copasst">Participación COPASST</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    {hasGlobalAccessUser && (
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
                            <FormLabel className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Código (Auto-generado)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-muted" data-testid="input-code" />
                            </FormControl>
                            <FormDescription>Generado automáticamente</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Auditoría *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                    </div>

                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título de la Auditoría *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Auditoría Anual del SG-SST 2026" data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="normaReferencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Norma de Referencia *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-norm">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="res_0312_2019">Resolución 0312/2019</SelectItem>
                                <SelectItem value="ISO_45001">ISO 45001:2018</SelectItem>
                                <SelectItem value="ambas">Combinada (Res.0312 + ISO 45001)</SelectItem>
                              </SelectContent>
                            </Select>
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
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
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
                      name="objetivo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo de la Auditoría *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              data-testid="input-objective"
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
                          <FormDescription>
                            El auditor debe ser competente e independiente del área auditada
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="alcance" className="space-y-4 mt-4">
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Elementos a Verificar (Decreto 1072/2015 Art. 2.2.4.6.30)
                        </CardTitle>
                        <CardDescription>
                          Seleccione los elementos que serán objeto de la auditoría. La norma establece 13 elementos obligatorios.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{selectedElementos.size} / 13 elementos</Badge>
                            <Progress value={(selectedElementos.size / 13) * 100} className="w-32 h-2" />
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={selectAllElementos}>
                              Seleccionar Todos
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={clearAllElementos}>
                              Limpiar
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {ELEMENTOS_AUDITORIA_DECRETO_1072.map((elemento) => (
                            <div
                              key={elemento.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-all ${getCategoriaColor(elemento.categoria)} ${selectedElementos.has(elemento.id) ? 'ring-2 ring-primary' : ''}`}
                              onClick={() => toggleElemento(elemento.id)}
                            >
                              <Checkbox
                                checked={selectedElementos.has(elemento.id)}
                                onCheckedChange={() => toggleElemento(elemento.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{elemento.codigo}</span>
                                  <Badge variant="outline" className="text-xs capitalize">{elemento.categoria}</Badge>
                                </div>
                                <p className="font-medium">{elemento.nombre}</p>
                                <p className="text-sm text-muted-foreground">{elemento.descripcion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <FormField
                      control={form.control}
                      name="alcance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alcance Detallado</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder="El alcance se genera automáticamente basado en los elementos seleccionados..."
                              data-testid="input-scope"
                            />
                          </FormControl>
                          <FormDescription>
                            Se genera automáticamente al seleccionar elementos. Puede editar para agregar detalles adicionales.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="copasst" className="space-y-4 mt-4">
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          Participación del COPASST (Estándar 6.1.3)
                        </CardTitle>
                        <CardDescription>
                          Según la Resolución 0312/2019, el programa de auditoría debe ser planificado con participación del COPASST o Vigía de SST.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="planificadaConCopasst"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Planificada con COPASST</FormLabel>
                                <FormDescription>
                                  La auditoría fue planificada con participación del Comité Paritario de SST
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
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
                                <FormItem>
                                  <FormLabel>Acta COPASST Relacionada *</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger data-testid="select-copasst-acta">
                                        <SelectValue placeholder="Seleccionar acta de reunión donde se aprobó" />
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
                                <FormItem>
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
                                      placeholder="Recomendaciones o comentarios del comité..."
                                      rows={3}
                                      data-testid="input-copasst-observations"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                    {createMutation.isPending ? "Creando..." : "Programar Auditoría"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="auditorias" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Auditorías
          </TabsTrigger>
          <TabsTrigger value="normativa" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Marco Normativo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auditorias" className="mt-4 space-y-4">
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
                <h3 className="text-lg font-semibold mb-2">No hay auditorías programadas</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  {searchTerm 
                    ? "No se encontraron resultados para tu búsqueda" 
                    : "Según el Decreto 1072/2015, debe realizarse al menos una auditoría anual del SG-SST planificada con el COPASST."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Programar Primera Auditoría
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAuditorias.map((auditoria) => (
                <Card key={auditoria.id} className="hover-elevate" data-testid={`card-audit-${auditoria.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{auditoria.titulo}</CardTitle>
                        <CardDescription className="truncate">{auditoria.codigo}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getEstadoBadge(auditoria.estado)}
                        {getTipoBadge(auditoria.tipo)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha Programada:</span>
                        <span className="font-medium">
                          {new Date(auditoria.fechaProgramada).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Auditor Líder:</span>
                        <span className="font-medium truncate ml-2">{auditoria.auditoristaLider}</span>
                      </div>
                      {auditoria.planificadaConCopasst && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <UserCheck className="h-3 w-3" />
                          <span className="text-xs">Planificada con COPASST</span>
                        </div>
                      )}
                      {(auditoria.numeroHallazgos ?? 0) > 0 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                          <Badge variant="outline">{auditoria.numeroHallazgos} hallazgos</Badge>
                          {(auditoria.numeroNoConformidadesMayores ?? 0) > 0 && (
                            <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
                              {auditoria.numeroNoConformidadesMayores} NC Mayor
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/auditorias-internas/${auditoria.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="normativa" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {normativaAuditoriasSST.map((norma) => (
              <Card key={norma.codigo} className={norma.obligatorio ? "border-l-4 border-l-red-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{norma.norma}</CardTitle>
                      <CardDescription>{norma.articulo}</CardDescription>
                    </div>
                    {norma.obligatorio && (
                      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">{norma.descripcion}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {norma.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
