import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, FileText, Send, AlertCircle, BarChart3, 
  Clock, CheckCircle2, AlertTriangle, History, ChevronDown, ChevronUp, Plus, X, Bot, CalendarDays
} from "lucide-react";
import { Link } from "wouter";
import { 
  PlanComunicacionSst,
  ComunicacionSst as ComunicacionSstType,
  ReporteTrabajador,
  HistorialComunicacionSst,
  Worker,
  User,
  insertPlanComunicacionSstSchema,
  insertComunicacionSstSchema
} from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { AutomationAssistant, PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

interface PrefilledFormData {
  tipo: string;
  asunto: string;
  contenido: string;
  publicoObjetivo: string;
}

export default function ComunicacionSst() {
  const [activeTab, setActiveTab] = useState("plan");
  const [prefilledData, setPrefilledData] = useState<PrefilledFormData | null>(null);
  const { toast } = useToast();
  
  const estandarComunicacion = getEstandarByCodigo('2.8.1');
  
  const tiposComunicacion = [
    'Interna (entre niveles de la organización)',
    'Externa (con partes interesadas: ARL, entes de control, proveedores)',
    'Comunicación con contratistas y visitantes',
    'Canales de reporte de peligros y condiciones inseguras'
  ];

  const plantillasComunicacion: PlantillaInfo[] = [
    {
      id: 'comunicacion-interna',
      nombre: 'Comunicación Interna SST',
      descripcion: 'Comunicación entre niveles de la organización sobre temas de seguridad y salud',
      campos: {
        tipo: 'informativo',
        asunto: 'Comunicación Interna SST - Información Importante',
        contenido: `Estimados colaboradores,

Por medio de la presente comunicación, les informamos sobre [TEMA DE SST].

De acuerdo con el Decreto 1072 de 2015 (Art. 2.2.4.6.14), es fundamental mantener canales efectivos de comunicación interna en materia de Seguridad y Salud en el Trabajo.

Puntos importantes:
1. [Punto 1]
2. [Punto 2]
3. [Punto 3]

Recuerden que la seguridad es responsabilidad de todos.

Cordialmente,
Área de SST`,
        publicoObjetivo: 'todos'
      },
      normativaBase: 'DEC-1072-2.2.4.6.14'
    },
    {
      id: 'comunicacion-externa',
      nombre: 'Comunicación Externa SST',
      descripcion: 'Comunicación con partes interesadas externas: ARL, entes de control, proveedores',
      campos: {
        tipo: 'normativo',
        asunto: 'Comunicación Externa SST - Partes Interesadas',
        contenido: `Estimados señores,

En cumplimiento del Decreto 1072 de 2015 y la Resolución 0312 de 2019, nos permitimos comunicar lo siguiente:

[ASUNTO DE LA COMUNICACIÓN]

Esta comunicación se realiza como parte del Sistema de Gestión de Seguridad y Salud en el Trabajo de nuestra organización.

Información relevante:
- [Información 1]
- [Información 2]

Quedamos atentos a sus comentarios.

Atentamente,
Responsable del SG-SST`,
        publicoObjetivo: 'alta_direccion'
      },
      normativaBase: 'DEC-1072-2.2.4.6.14'
    },
    {
      id: 'comunicacion-contratistas',
      nombre: 'Comunicación Contratistas y Visitantes',
      descripcion: 'Información de SST para contratistas y visitantes según Decreto 1072',
      campos: {
        tipo: 'procedimiento',
        asunto: 'Información SST para Contratistas y Visitantes',
        contenido: `Bienvenido a nuestras instalaciones.

De acuerdo con el Decreto 1072 de 2015, es nuestro deber informarle sobre los aspectos de Seguridad y Salud en el Trabajo que aplican durante su permanencia:

NORMAS GENERALES DE SEGURIDAD:
1. Use siempre los elementos de protección personal requeridos
2. Respete la señalización de seguridad
3. En caso de emergencia, siga las instrucciones del personal de la empresa
4. Reporte cualquier condición o acto inseguro que observe

PUNTOS DE ENCUENTRO:
- [Ubicación punto de encuentro]

CONTACTOS DE EMERGENCIA:
- Brigada de emergencias: [Extensión]
- Responsable SST: [Nombre y contacto]

Gracias por contribuir con la seguridad de todos.`,
        publicoObjetivo: 'contratistas'
      },
      normativaBase: 'DEC-1072-2.2.4.6.14'
    },
    {
      id: 'canal-reporte-peligros',
      nombre: 'Canal de Reporte de Peligros',
      descripcion: 'Comunicación sobre canales para reportar peligros y condiciones inseguras',
      campos: {
        tipo: 'alerta',
        asunto: 'Canales de Reporte de Peligros y Condiciones Inseguras',
        contenido: `Estimados colaboradores,

Les recordamos que contamos con canales efectivos para el reporte de peligros y condiciones inseguras, de conformidad con el Decreto 1072 de 2015.

¿QUÉ REPORTAR?
- Condiciones inseguras en instalaciones o equipos
- Actos inseguros observados
- Peligros identificados en su área de trabajo
- Cuasi-accidentes o incidentes
- Sugerencias de mejora en seguridad

¿CÓMO REPORTAR?
1. A través de este sistema de comunicaciones
2. Directamente al COPASST/Vigía SST
3. Mediante el buzón de sugerencias SST
4. Comunicación directa con el Responsable de SST

Recuerde: Su reporte puede prevenir accidentes y salvar vidas.

Ningún reporte será ignorado y todos serán tratados con la debida confidencialidad.

Área de SST`,
        publicoObjetivo: 'todos'
      },
      normativaBase: 'DEC-1072-2.2.4.6.14'
    },
    {
      id: 'alerta-seguridad',
      nombre: 'Alerta de Seguridad',
      descripcion: 'Comunicación de alertas de seguridad y riesgos identificados',
      campos: {
        tipo: 'alerta',
        asunto: 'ALERTA DE SEGURIDAD - Acción Inmediata Requerida',
        contenido: `¡ATENCIÓN!

Se ha identificado la siguiente situación de riesgo que requiere atención inmediata:

DESCRIPCIÓN DEL PELIGRO:
[Describir el peligro identificado]

ÁREA AFECTADA:
[Especificar área o áreas]

MEDIDAS PREVENTIVAS INMEDIATAS:
1. [Medida 1]
2. [Medida 2]
3. [Medida 3]

ACCIONES REQUERIDAS:
- [Acción 1]
- [Acción 2]

En caso de dudas, comunicarse inmediatamente con el Responsable de SST.

La seguridad es prioridad.

COPASST / Área de SST`,
        publicoObjetivo: 'todos'
      },
      normativaBase: 'DEC-1072-2.2.4.6.14'
    },
    {
      id: 'divulgacion-politica',
      nombre: 'Divulgación Política SST',
      descripcion: 'Comunicación de la política de seguridad y salud en el trabajo',
      campos: {
        tipo: 'politica',
        asunto: 'Divulgación de la Política de Seguridad y Salud en el Trabajo',
        contenido: `Estimados colaboradores,

En cumplimiento del Decreto 1072 de 2015 y la Resolución 0312 de 2019, les comunicamos la Política de Seguridad y Salud en el Trabajo de nuestra organización:

POLÍTICA DE SST:
[Incluir el texto de la política de SST de la empresa]

COMPROMISOS:
- Prevención de lesiones y enfermedades laborales
- Cumplimiento de la normatividad legal vigente
- Mejora continua del Sistema de Gestión de SST
- Participación activa de todos los trabajadores

Esta política debe ser conocida y aplicada por todos los colaboradores en el desarrollo de sus actividades.

La Alta Dirección`,
        publicoObjetivo: 'todos'
      },
      normativaBase: 'DEC-1072-2.2.4.6.14'
    }
  ];

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    const campos = plantilla.campos;
    setPrefilledData({
      tipo: campos.tipo || 'informativo',
      asunto: campos.asunto || '',
      contenido: campos.contenido || '',
      publicoObjetivo: campos.publicoObjetivo || 'todos'
    });
    
    setActiveTab("enviar");
    
    toast({
      title: "Plantilla aplicada",
      description: `Se ha cargado la plantilla "${plantilla.nombre}". Puede editar los campos antes de enviar.`,
    });
  };

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
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Comunicación SST</h1>
        <p className="text-muted-foreground">
          Gestión de comunicaciones en seguridad y salud en el trabajo - Decreto 1072/2015 Art. 2.2.4.6.14
        </p>
      </div>

      {estandarComunicacion && (
        <AutomationAssistant
          titulo="Comunicación SST"
          estandar={estandarComunicacion.codigo}
          descripcion="Mecanismos de comunicación interna y externa en seguridad y salud en el trabajo"
          normativaAplicable={estandarComunicacion.normativaAplicable.map(n => ({
            codigo: n.codigo,
            norma: n.norma,
            articulo: n.articulo,
            descripcion: n.descripcion,
            requisitos: n.requisitos,
            obligatorio: n.obligatorio
          }))}
          compact={true}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-5xl grid-cols-6">
          <TabsTrigger value="plan" data-testid="tab-plan">
            <FileText className="h-4 w-4 mr-2" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="enviar" data-testid="tab-enviar">
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="historial" data-testid="tab-historial">
            <MessageSquare className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="reportes" data-testid="tab-reportes">
            <AlertCircle className="h-4 w-4 mr-2" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="trazabilidad" data-testid="tab-trazabilidad">
            <History className="h-4 w-4 mr-2" />
            Trazabilidad
          </TabsTrigger>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Panel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <PlanComunicacionTab />
        </TabsContent>

        <TabsContent value="enviar">
          <EnviarComunicacionTab 
            prefilledData={prefilledData} 
            onPrefilledDataApplied={() => setPrefilledData(null)} 
          />
        </TabsContent>

        <TabsContent value="historial">
          <HistorialComunicacionesTab />
        </TabsContent>

        <TabsContent value="reportes">
          <ReportesRecibidosTab />
        </TabsContent>

        <TabsContent value="trazabilidad">
          <TrazabilidadTab />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== TAB 1: PLAN DE COMUNICACIÓN ====================

const formSchemaPlan = insertPlanComunicacionSstSchema.extend({
  mediosComunicacionInput: z.string().optional(),
  publicosObjetivoInput: z.string().optional(),
  elaboradoPor: z.string().min(1, "Debe seleccionar quién elabora el plan"),
});

// Valores predeterminados según Decreto 1072/2015 Art. 2.2.4.6.14
const defaultMediosComunicacion = [
  "Portal de Empleados",
  "Carteleras informativas",
  "Reuniones periódicas",
  "Intranet corporativa",
  "Capacitaciones presenciales"
];

const defaultPublicosObjetivo = [
  "Trabajadores directos",
  "Contratistas",
  "Subcontratistas",
  "Visitantes",
  "Proveedores",
  "ARL y entidades de control"
];

const defaultObjetivoGeneral = `Establecer los mecanismos de comunicación interna y externa eficaces que permitan garantizar la divulgación oportuna de la información relacionada con el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), en cumplimiento del Decreto 1072 de 2015, Artículo 2.2.4.6.14.

Los objetivos específicos incluyen:
- Mantener informados a todos los trabajadores sobre los peligros y riesgos identificados
- Comunicar las políticas, objetivos y resultados del SG-SST
- Recibir y atender las comunicaciones de las partes interesadas
- Garantizar canales bidireccionales de comunicación efectiva`;

const defaultAlcance = `Este plan de comunicación aplica a todos los trabajadores de la empresa, independientemente de su forma de vinculación laboral, incluyendo contratistas, subcontratistas, trabajadores en misión, visitantes y demás partes interesadas en materia de Seguridad y Salud en el Trabajo.

Cubre las comunicaciones internas (entre niveles de la organización) y externas (con ARL, entes de control, proveedores y otras partes interesadas).`;

function PlanComunicacionTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediosComunicacion, setMediosComunicacion] = useState<string[]>([]);
  const [publicosObjetivo, setPublicosObjetivo] = useState<string[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const { toast } = useToast();

  const { data: planes = [], isLoading } = useQuery<PlanComunicacionSst[]>({
    queryKey: ["/api/comunicacion-sst/plan"],
  });

  // Obtener lista de usuarios para los selectores (la tabla usa references a users, no workers)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<z.infer<typeof formSchemaPlan>>({
    resolver: zodResolver(formSchemaPlan),
    defaultValues: {
      version: "1.0",
      fechaElaboracion: new Date(),
      elaboradoPor: "",
      aprobadoPor: "",
      objetivoGeneral: defaultObjetivoGeneral,
      alcance: defaultAlcance,
      frecuenciaReuniones: "Mensual",
      responsableComunicacionInterna: "",
      responsableComunicacionExterna: "",
      responsableComunicacionContratistas: "",
      observaciones: "",
      estado: "vigente",
    },
  });

  // Pre-cargar valores cuando se abre el diálogo
  const handleOpenDialog = () => {
    if (mediosComunicacion.length === 0) {
      setMediosComunicacion([...defaultMediosComunicacion]);
    }
    if (publicosObjetivo.length === 0) {
      setPublicosObjetivo([...defaultPublicosObjetivo]);
    }
    setDialogOpen(true);
  };

  const createPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchemaPlan>) => {
      const planData = {
        ...data,
        mediosComunicacion: mediosComunicacion.length > 0 ? mediosComunicacion : null,
        publicosObjetivo: publicosObjetivo.length > 0 ? publicosObjetivo : null,
        // Convertir strings vacíos a null para campos opcionales de usuario
        aprobadoPor: data.aprobadoPor || null,
        responsableComunicacionInterna: data.responsableComunicacionInterna || null,
        responsableComunicacionExterna: data.responsableComunicacionExterna || null,
        responsableComunicacionContratistas: data.responsableComunicacionContratistas || null,
      };
      delete (planData as any).mediosComunicacionInput;
      delete (planData as any).publicosObjetivoInput;
      return await apiRequest("POST", "/api/comunicacion-sst/plan", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/plan"] });
      toast({
        title: "Plan creado",
        description: "El plan de comunicación SST ha sido creado exitosamente",
      });
      setDialogOpen(false);
      form.reset();
      setMediosComunicacion([]);
      setPublicosObjetivo([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el plan de comunicación",
        variant: "destructive",
      });
    },
  });

  const generateIntelligentPlanMutation = useMutation({
    mutationFn: async () => {
      setGeneratingPlan(true);
      const response = await apiRequest("POST", "/api/comunicacion-sst/plan/generar-inteligente");
      return response;
    },
    onSuccess: () => {
      toast({ 
        title: "Plan Inteligente Generado", 
        description: "Se ha creado un plan de comunicación completo basado en las normas SST colombianas (Decreto 1072/2015 y Resolución 0312/2019)" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/plan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/comunicaciones"] });
      setGeneratingPlan(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo generar el plan inteligente", 
        variant: "destructive" 
      });
      setGeneratingPlan(false);
    }
  });

  const onSubmit = (data: z.infer<typeof formSchemaPlan>) => {
    createPlanMutation.mutate(data);
  };

  const addMedioComunicacion = () => {
    const input = form.getValues("mediosComunicacionInput");
    if (input && input.trim() && !mediosComunicacion.includes(input.trim())) {
      setMediosComunicacion([...mediosComunicacion, input.trim()]);
      form.setValue("mediosComunicacionInput", "");
    }
  };

  const removeMedioComunicacion = (medio: string) => {
    setMediosComunicacion(mediosComunicacion.filter(m => m !== medio));
  };

  const addPublicoObjetivo = () => {
    const input = form.getValues("publicosObjetivoInput");
    if (input && input.trim() && !publicosObjetivo.includes(input.trim())) {
      setPublicosObjetivo([...publicosObjetivo, input.trim()]);
      form.setValue("publicosObjetivoInput", "");
    }
  };

  const removePublicoObjetivo = (publico: string) => {
    setPublicosObjetivo(publicosObjetivo.filter(p => p !== publico));
  };

  // Helper para resolver ID de usuario a nombre
  const getUserName = (userId: string | null | undefined): string => {
    if (!userId) return "No especificado";
    const user = users.find(u => u.id === userId);
    return user ? (user.fullName || user.username) : userId;
  };

  const planVigente = planes.find(p => p.estado === "vigente");

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center">Cargando...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {planVigente && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Plan de Comunicación SST Vigente</CardTitle>
            <CardDescription>
              Versión {planVigente.version} - Elaborado por {getUserName(planVigente.elaboradoPor)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Objetivo General</h4>
                <p className="text-sm text-muted-foreground">{planVigente.objetivoGeneral}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Alcance</h4>
                <p className="text-sm text-muted-foreground">{planVigente.alcance}</p>
              </div>
              {planVigente.mediosComunicacion && planVigente.mediosComunicacion.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Medios de Comunicación</h4>
                  <p className="text-sm text-muted-foreground">
                    {planVigente.mediosComunicacion.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Planes de Comunicación</CardTitle>
            <div className="flex gap-2">
              <Button 
                data-testid="button-generate-intelligent-plan" 
                variant="outline"
                onClick={() => generateIntelligentPlanMutation.mutate()}
                disabled={generatingPlan || generateIntelligentPlanMutation.isPending}
              >
                <Bot className="h-4 w-4 mr-2" />
                {generatingPlan || generateIntelligentPlanMutation.isPending ? "Generando..." : "Generar Plan Inteligente"}
              </Button>
              <Button data-testid="button-new-plan" onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
              </Button>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Plan de Comunicación SST</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Versión</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-version" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fechaElaboracion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Elaboración *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-fecha-elaboracion"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="elaboradoPor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Elaborado Por *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="input-elaborado-por">
                                  <SelectValue placeholder="Seleccionar usuario" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.fullName || user.username}
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
                        name="aprobadoPor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aprobado Por</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="input-aprobado-por">
                                  <SelectValue placeholder="Seleccionar usuario" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.fullName || user.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="objetivoGeneral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo General *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Establecer los mecanismos de comunicación eficaces..." 
                              rows={3}
                              data-testid="input-objetivo-general"
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
                              placeholder="Aplica a todos los trabajadores, contratistas..." 
                              rows={2}
                              data-testid="input-alcance"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Públicos Objetivo</FormLabel>
                      <div className="flex gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="publicosObjetivoInput"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ej: Trabajadores, Contratistas, Visitantes" 
                                  data-testid="input-publico-objetivo"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={addPublicoObjetivo} size="icon" variant="outline" data-testid="button-add-publico">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {publicosObjetivo.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {publicosObjetivo.map((publico) => (
                            <Badge key={publico} variant="secondary" className="gap-1">
                              {publico}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removePublicoObjetivo(publico)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel>Medios de Comunicación</FormLabel>
                      <div className="flex gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="mediosComunicacionInput"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ej: Portal de Empleados, Cartelera, Reuniones" 
                                  data-testid="input-medio-comunicacion"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={addMedioComunicacion} size="icon" variant="outline" data-testid="button-add-medio">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {mediosComunicacion.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mediosComunicacion.map((medio) => (
                            <Badge key={medio} variant="secondary" className="gap-1">
                              {medio}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeMedioComunicacion(medio)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="frecuenciaReuniones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia de Reuniones</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Ej: Mensual, Trimestral" data-testid="input-frecuencia" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="responsableComunicacionInterna"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsable Com. Interna</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="input-resp-interna">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.fullName || user.username}
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
                        name="responsableComunicacionExterna"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsable Com. Externa</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="input-resp-externa">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.fullName || user.username}
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
                        name="responsableComunicacionContratistas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsable Com. Contratistas</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="input-resp-contratistas">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.fullName || user.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-observaciones" />
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
                        data-testid="button-cancel-plan"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPlanMutation.isPending}
                        data-testid="button-submit-plan"
                      >
                        {createPlanMutation.isPending ? "Creando..." : "Crear Plan"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {planes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay planes de comunicación registrados
            </p>
          ) : (
            <div className="space-y-3">
              {planes.map((plan) => (
                <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base">Versión {plan.version}</CardTitle>
                    <CardDescription>
                      Elaborado el {format(new Date(plan.fechaElaboracion), "PPP", { locale: es })} por {getUserName(plan.elaboradoPor)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{plan.objetivoGeneral}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 2: ENVIAR COMUNICACIÓN ====================

const formSchemaComunicacion = insertComunicacionSstSchema.extend({
  mediosUtilizadosInput: z.string().optional(),
});

interface EnviarComunicacionTabProps {
  prefilledData: PrefilledFormData | null;
  onPrefilledDataApplied: () => void;
}

function EnviarComunicacionTab({ prefilledData, onPrefilledDataApplied }: EnviarComunicacionTabProps) {
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [mediosUtilizados, setMediosUtilizados] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const form = useForm<z.infer<typeof formSchemaComunicacion>>({
    resolver: zodResolver(formSchemaComunicacion),
    defaultValues: {
      tipo: "informativo",
      asunto: "",
      contenido: "",
      publicoObjetivo: "todos",
      departamentoEspecifico: "",
      requiereConfirmacionLectura: 0,
      observaciones: "",
    },
  });

  useEffect(() => {
    if (prefilledData) {
      form.setValue("tipo", prefilledData.tipo as "informativo" | "normativo" | "procedimiento" | "alerta" | "politica" | "formacion" | "emergencia" | "evento");
      form.setValue("asunto", prefilledData.asunto);
      form.setValue("contenido", prefilledData.contenido);
      form.setValue("publicoObjetivo", prefilledData.publicoObjetivo as "todos" | "alta_direccion" | "contratistas" | "trabajadores" | "copasst" | "supervisores" | "area_especifica" | "nuevos_empleados");
      onPrefilledDataApplied();
    }
  }, [prefilledData, form, onPrefilledDataApplied]);

  const createComunicacionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchemaComunicacion>) => {
      const comunicacionData = {
        ...data,
        mediosUtilizados: mediosUtilizados.length > 0 ? mediosUtilizados : null,
        trabajadoresDestinatarios: selectedWorkers,
      };
      delete (comunicacionData as any).mediosUtilizadosInput;
      return await apiRequest("POST", "/api/comunicacion-sst/comunicaciones", comunicacionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunicacion-sst/comunicaciones"] });
      toast({
        title: "Comunicación enviada",
        description: `Comunicación enviada exitosamente a ${selectedWorkers.length} trabajadores`,
      });
      form.reset();
      setSelectedWorkers([]);
      setMediosUtilizados([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la comunicación",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchemaComunicacion>) => {
    if (selectedWorkers.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un trabajador destinatario",
        variant: "destructive",
      });
      return;
    }
    createComunicacionMutation.mutate(data);
  };

  const toggleWorker = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const selectAllWorkers = () => {
    if (selectedWorkers.length === workers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(workers.map(w => w.id));
    }
  };

  const addMedioUtilizado = () => {
    const input = form.getValues("mediosUtilizadosInput");
    if (input && input.trim() && !mediosUtilizados.includes(input.trim())) {
      setMediosUtilizados([...mediosUtilizados, input.trim()]);
      form.setValue("mediosUtilizadosInput", "");
    }
  };

  const removeMedioUtilizado = (medio: string) => {
    setMediosUtilizados(mediosUtilizados.filter(m => m !== medio));
  };

  const activeWorkers = workers.filter(w => w.status === 'activo');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Comunicación SST</CardTitle>
        <CardDescription>
          Crear y enviar comunicaciones de seguridad y salud en el trabajo a los trabajadores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comunicación *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-comunicacion">
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="politica">Política SST</SelectItem>
                        <SelectItem value="procedimiento">Procedimiento</SelectItem>
                        <SelectItem value="alerta">Alerta de Seguridad</SelectItem>
                        <SelectItem value="informativo">Informativo</SelectItem>
                        <SelectItem value="formacion">Formación</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                        <SelectItem value="normativo">Normativo</SelectItem>
                        <SelectItem value="evento">Evento SST</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publicoObjetivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Público Objetivo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-publico-objetivo">
                          <SelectValue placeholder="Seleccione público" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="trabajadores">Trabajadores</SelectItem>
                        <SelectItem value="contratistas">Contratistas</SelectItem>
                        <SelectItem value="copasst">COPASST</SelectItem>
                        <SelectItem value="alta_direccion">Alta Dirección</SelectItem>
                        <SelectItem value="supervisores">Supervisores</SelectItem>
                        <SelectItem value="area_especifica">Área Específica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="asunto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Nueva política de uso de EPP" data-testid="input-asunto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contenido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Escriba el contenido de la comunicación aquí..." 
                      rows={6}
                      data-testid="input-contenido"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Medios Utilizados</FormLabel>
              <div className="flex gap-2 mt-2">
                <FormField
                  control={form.control}
                  name="mediosUtilizadosInput"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ej: Portal de Empleados, Cartelera" 
                          data-testid="input-medio-utilizado"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={addMedioUtilizado} size="icon" variant="outline" data-testid="button-add-medio-utilizado">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {mediosUtilizados.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {mediosUtilizados.map((medio) => (
                    <Badge key={medio} variant="secondary" className="gap-1">
                      {medio}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeMedioUtilizado(medio)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="requiereConfirmacionLectura"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value === 1}
                      onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                      data-testid="checkbox-requiere-confirmacion"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Requiere confirmación de lectura
                    </FormLabel>
                    <FormDescription>
                      Los trabajadores deberán confirmar que leyeron esta comunicación
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Destinatarios *</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllWorkers}
                  data-testid="button-select-all-workers"
                >
                  {selectedWorkers.length === activeWorkers.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                </Button>
              </div>
              <FormDescription>
                Seleccione los trabajadores que recibirán esta comunicación ({selectedWorkers.length} seleccionados)
              </FormDescription>
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3">
                {activeWorkers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay trabajadores activos disponibles
                  </p>
                ) : (
                  activeWorkers.map((worker) => (
                    <div 
                      key={worker.id} 
                      className="flex items-center space-x-2 p-2 hover-elevate rounded-md"
                      data-testid={`worker-item-${worker.id}`}
                    >
                      <Checkbox
                        checked={selectedWorkers.includes(worker.id)}
                        onCheckedChange={() => toggleWorker(worker.id)}
                        data-testid={`checkbox-worker-${worker.id}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{worker.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {worker.position} - {worker.department}
                          {worker.email && ` • ${worker.email}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  setSelectedWorkers([]);
                  setMediosUtilizados([]);
                }}
                data-testid="button-cancel-comunicacion"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createComunicacionMutation.isPending || selectedWorkers.length === 0}
                data-testid="button-submit-comunicacion"
              >
                {createComunicacionMutation.isPending ? "Enviando..." : `Enviar a ${selectedWorkers.length} trabajadores`}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ==================== TAB 3: HISTORIAL DE COMUNICACIONES ====================

function HistorialComunicacionesTab() {
  const { data: comunicaciones = [], isLoading } = useQuery<ComunicacionSstType[]>({
    queryKey: ["/api/comunicacion-sst/comunicaciones"],
  });

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center">Cargando...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Comunicaciones Enviadas</CardTitle>
        <CardDescription>
          Registro de todas las comunicaciones SST enviadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {comunicaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay comunicaciones registradas
          </p>
        ) : (
          <div className="space-y-3">
            {comunicaciones.map((com) => (
              <Card key={com.id} data-testid={`card-comunicacion-${com.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{com.asunto}</CardTitle>
                      <CardDescription className="text-xs">
                        {format(new Date(com.fechaEnvio), "PPP", { locale: es })} • 
                        {com.totalLecturas} de {com.totalDestinatarios} lecturas confirmadas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{com.contenido}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB 4: REPORTES RECIBIDOS ====================

function ReportesRecibidosTab() {
  const { data: reportes = [], isLoading } = useQuery<ReporteTrabajador[]>({
    queryKey: ["/api/comunicacion-sst/reportes"],
  });

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center">Cargando...</CardContent></Card>;
  }

  const reportesPendientes = reportes.filter(r => r.estado === "pendiente" || r.estado === "en_revision");
  const reportesRespondidos = reportes.filter(r => r.estado === "resuelto" || r.estado === "cerrado");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reportes de Trabajadores</CardTitle>
        <CardDescription>
          Gestione reportes de peligros, sugerencias, quejas y consultas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-reportes-pendientes">
                {reportesPendientes.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respondidos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-reportes-respondidos">
                {reportesRespondidos.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {reportes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay reportes registrados
          </p>
        ) : (
          <div className="space-y-3">
            {reportes.map((reporte) => (
              <Card key={reporte.id} data-testid={`card-reporte-${reporte.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {(reporte.prioridad === "urgente" || reporte.prioridad === "alta") && (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                        <CardTitle className="text-base">{reporte.asunto}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {reporte.categoria} • Reportado el {format(new Date(reporte.createdAt), "PPP", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{reporte.descripcion}</p>
                  {reporte.respuesta && (
                    <div className="mt-3 border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium text-primary">Respuesta:</p>
                      <p className="text-sm">{reporte.respuesta}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== TAB 5: DASHBOARD ====================

function DashboardTab() {
  const { data: comunicaciones = [] } = useQuery<ComunicacionSstType[]>({
    queryKey: ["/api/comunicacion-sst/comunicaciones"],
  });

  const { data: reportes = [] } = useQuery<ReporteTrabajador[]>({
    queryKey: ["/api/comunicacion-sst/reportes"],
  });

  const totalComunicaciones = comunicaciones.length;
  const totalLecturas = comunicaciones.reduce((sum, c) => sum + (c.totalLecturas || 0), 0);
  const totalReportes = reportes.length;
  const reportesPendientes = reportes.filter(r => r.estado === "pendiente" || r.estado === "en_revision").length;
  const reportesUrgentes = reportes.filter(r => r.prioridad === "urgente").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comunicaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-comunicaciones">
              {totalComunicaciones}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturas Confirmadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-lecturas">
              {totalLecturas}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-reportes-pendientes">
              {reportesPendientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-reportes-urgentes">
              {reportesUrgentes}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="font-medium">Pendientes de Respuesta</span>
              <span className="text-2xl font-bold">{reportesPendientes}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="font-medium">Reportes Urgentes</span>
              <span className="text-2xl font-bold">{reportesUrgentes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== TAB 6: TRAZABILIDAD ====================

function TrazabilidadTab() {
  const [filtroEntidad, setFiltroEntidad] = useState<string>("");
  const [filtroAccion, setFiltroAccion] = useState<string>("");
  const [filtroUsuario, setFiltroUsuario] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Construir query string con filtros activos
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filtroEntidad) params.append('entidad', filtroEntidad);
    if (filtroAccion) params.append('accion', filtroAccion);
    if (filtroUsuario) params.append('userId', filtroUsuario);
    if (fechaInicio) params.append('fechaInicio', new Date(fechaInicio).toISOString());
    if (fechaFin) params.append('fechaFin', new Date(fechaFin).toISOString());
    return params.toString();
  };

  const queryString = buildQueryString();
  const queryUrl = `/api/comunicacion-sst/trazabilidad${queryString ? `?${queryString}` : ''}`;

  const { data: historial = [], isLoading } = useQuery<HistorialComunicacionSst[]>({
    queryKey: [queryUrl],
  });

  // Obtener lista de usuarios para el filtro
  const { data: usuarios = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const historialFiltrado = historial; // No filter client-side, filtering is done server-side now

  const getAccionLabel = (accion: string) => {
    const labels: Record<string, string> = {
      crear: "Crear",
      actualizar: "Actualizar",
      eliminar: "Eliminar",
      leer: "Leer",
      enviar: "Enviar",
      responder: "Responder",
    };
    return labels[accion] || accion;
  };

  const getEntidadLabel = (entidad: string) => {
    const labels: Record<string, string> = {
      plan: "Plan de Comunicación",
      comunicacion: "Comunicación",
      reporte: "Reporte Trabajador",
      lectura: "Lectura Comunicación",
    };
    return labels[entidad] || entidad;
  };

  const getAccionColor = (accion: string) => {
    const colors: Record<string, string> = {
      crear: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      actualizar: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      eliminar: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      leer: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
      enviar: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      responder: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    };
    return colors[accion] || "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center">Cargando historial...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trazabilidad de Comunicaciones SST</CardTitle>
          <CardDescription>
            Registro completo de auditoría de todas las acciones realizadas en el módulo de comunicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por Entidad</label>
              <select
                value={filtroEntidad}
                onChange={(e) => setFiltroEntidad(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-filtro-entidad"
              >
                <option value="">Todas las Entidades</option>
                <option value="plan">Plan de Comunicación</option>
                <option value="comunicacion">Comunicaciones</option>
                <option value="reporte">Reportes Trabajadores</option>
                <option value="lectura">Lecturas</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por Acción</label>
              <select
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-filtro-accion"
              >
                <option value="">Todas las Acciones</option>
                <option value="crear">Crear</option>
                <option value="editar">Editar</option>
                <option value="eliminar">Eliminar</option>
                <option value="enviar">Enviar</option>
                <option value="confirmar_lectura">Confirmar Lectura</option>
                <option value="responder">Responder</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por Usuario</label>
              <select
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-filtro-usuario"
              >
                <option value="">Todos los Usuarios</option>
                {usuarios.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="input-fecha-inicio"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="input-fecha-fin"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroEntidad("");
                  setFiltroAccion("");
                  setFiltroUsuario("");
                  setFechaInicio("");
                  setFechaFin("");
                }}
                className="w-full"
                data-testid="button-limpiar-filtros"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando {historialFiltrado.length} registros
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          {historialFiltrado.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de auditoría que coincidan con los filtros seleccionados
            </div>
          ) : (
            <div className="space-y-3">
              {historialFiltrado.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-3 hover-elevate"
                  data-testid={`auditoria-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header with badges and date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getAccionColor(item.accion)}`}>
                          {getAccionLabel(item.accion)}
                        </span>
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary">
                          {getEntidadLabel(item.entidad)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "dd MMM yyyy HH:mm:ss", { locale: es })}
                        </span>
                      </div>

                      {/* Description */}
                      {item.descripcion && (
                        <div className="text-sm">
                          <span className="font-medium">Descripción:</span> {item.descripcion}
                        </div>
                      )}
                      
                      {/* User and Role */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Usuario:</span> {item.nombreUsuario || 'Sistema'}
                        </div>
                        {item.rolUsuario && (
                          <div>
                            <span className="font-medium">Rol:</span> {item.rolUsuario}
                          </div>
                        )}
                      </div>

                      {/* Expandable details */}
                      {(item.campoModificado || item.valorAnterior || item.valorNuevo || item.ipAddress) && (
                        <div className="border-t pt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(item.id)}
                            className="w-full justify-between p-2 h-auto"
                            data-testid={`button-toggle-details-${item.id}`}
                          >
                            <span className="text-xs font-medium">
                              {expandedItems.has(item.id) ? 'Ocultar' : 'Mostrar'} Detalles Técnicos
                            </span>
                            {expandedItems.has(item.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {expandedItems.has(item.id) && (
                            <div className="mt-3 space-y-2 bg-muted p-3 rounded-md text-xs">
                              {item.campoModificado && (
                                <div>
                                  <span className="font-medium">Campo Modificado:</span> {item.campoModificado}
                                </div>
                              )}
                              {item.valorAnterior && (
                                <div>
                                  <span className="font-medium">Valor Anterior:</span>
                                  <pre className="mt-1 p-2 bg-background rounded overflow-x-auto">
                                    {item.valorAnterior.startsWith('{') || item.valorAnterior.startsWith('[')
                                      ? JSON.stringify(JSON.parse(item.valorAnterior), null, 2)
                                      : item.valorAnterior}
                                  </pre>
                                </div>
                              )}
                              {item.valorNuevo && (
                                <div>
                                  <span className="font-medium">Valor Nuevo:</span>
                                  <pre className="mt-1 p-2 bg-background rounded overflow-x-auto">
                                    {item.valorNuevo.startsWith('{') || item.valorNuevo.startsWith('[')
                                      ? JSON.stringify(JSON.parse(item.valorNuevo), null, 2)
                                      : item.valorNuevo}
                                  </pre>
                                </div>
                              )}
                              {item.ipAddress && (
                                <div>
                                  <span className="font-medium">IP:</span> {item.ipAddress}
                                </div>
                              )}
                              {item.userAgent && (
                                <div>
                                  <span className="font-medium">User Agent:</span> {item.userAgent}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
