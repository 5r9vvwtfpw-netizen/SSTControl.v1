import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Target, CheckCircle2, Clock, XCircle, Trash2, Edit, TrendingUp, BarChart3, Activity, Zap, History, Calendar, Bot, Lightbulb, AlertTriangle, Bell, LineChart, CalendarDays, Percent, Save, Link2, Calculator, Check, X, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ObjetivoSst, IndicadorSst, MedicionIndicador, DatosCalculo, Company, Worker, insertObjetivoSstSchema, insertIndicadorSstSchema, insertMedicionIndicadorSchema, insertDatosCalculoSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { indicadoresSstPredefinidos, getIndicadorByCodigo, formulasSugeridas } from "@/data/indicadores-sst-predefinidos";
import { OBJETIVOS_SST_PREDEFINIDOS, OBJETIVOS_POR_CATEGORIA, ObjetivoSst as ObjetivoPredefinido } from "@/data/objetivos-sst-predefinidos";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const normativaObjetivos = [
  {
    codigo: 'DEC-1072-2.2.4.6.18',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.18',
    descripcion: 'Objetivos del Sistema de Gestión de SST',
    requisitos: [
      'Objetivos medibles y alcanzables',
      'Coherencia con la política de SST',
      'Comunicación a todos los niveles',
      'Evaluación periódica del cumplimiento'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-1.1.3',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 1.1.3',
    descripcion: 'Objetivos y metas del SG-SST',
    requisitos: [
      'Objetivos definidos y documentados',
      'Indicadores de gestión medibles',
      'Metas con plazos definidos',
      'Seguimiento y medición de indicadores'
    ],
    obligatorio: true
  }
];

const categoriaObjetivoLabels: Record<string, string> = {
  general: 'Objetivos Generales SG-SST',
  capacitacion: 'Capacitación y Competencias',
  sve: 'Vigilancia Epidemiológica',
  'plan-trabajo': 'Plan de Trabajo Anual',
  comunicacion: 'Comunicación SST',
  recursos: 'Asignación de Recursos',
  emergencias: 'Plan de Emergencias',
  pesv: 'Seguridad Vial (PESV)',
  adquisiciones: 'Adquisiciones y Compras',
  copasst: 'COPASST',
};

const objetivoFormSchema = insertObjetivoSstSchema;
const indicadorFormSchema = insertIndicadorSstSchema;

export default function ObjetivosSst() {
  const [activeTab, setActiveTab] = useState("objetivos");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Objetivos e Indicadores SST</h1>
        <p className="text-muted-foreground">Gestión integral de objetivos SMART e indicadores del Sistema de Gestión de Seguridad y Salud en el Trabajo</p>
      </div>

      <AutomationAssistant
        titulo="Objetivos del SG-SST"
        estandar="1.1.3"
        descripcion="Definición de objetivos y metas del Sistema de Gestión de SST"
        normativaAplicable={normativaObjetivos}
        compact={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="objetivos" data-testid="tab-objetivos">
            <Target className="h-4 w-4 mr-2" />
            Objetivos SST
          </TabsTrigger>
          <TabsTrigger value="indicadores" data-testid="tab-indicadores">
            <BarChart3 className="h-4 w-4 mr-2" />
            Indicadores SST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objetivos">
          <ObjetivosTab />
        </TabsContent>

        <TabsContent value="indicadores">
          <IndicadoresTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ObjetivosTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<ObjetivoSst | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user?.companyId || "");
  const [formCompanyId, setFormCompanyId] = useState<string>("");
  const [selectedPredefinido, setSelectedPredefinido] = useState<string>("");
  
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const { data: workers = [] } = useQuery<any[]>({
    queryKey: isAdmin && selectedCompanyId 
      ? ["/api/workers", selectedCompanyId]
      : ["/api/workers"],
    queryFn: async () => {
      const url = isAdmin && selectedCompanyId 
        ? `/api/workers?companyId=${selectedCompanyId}`
        : "/api/workers";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar trabajadores");
      return res.json();
    },
    enabled: !isAdmin || !!selectedCompanyId,
  });

  const form = useForm<z.infer<typeof objetivoFormSchema>>({
    resolver: zodResolver(objetivoFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      meta: "",
      valorMeta: undefined,
      responsable: user?.fullName || user?.username || "",
      anio: new Date().getFullYear(),
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      frecuenciaRevision: "trimestral",
      estado: "activo",
      categoriaObjetivo: "",
      area: "",
      alineadoConNorma: "",
      observaciones: "",
      planesAccion: "",
      fechaUltimaRevision: undefined,
    },
  });

  const handleAutoFillFromPredefinido = (objetivoId: string) => {
    const objetivo = OBJETIVOS_SST_PREDEFINIDOS[objetivoId];
    if (!objetivo) return;

    const nombreCorto = objetivo.objetivo.length > 100 
      ? objetivo.objetivo.substring(0, objetivo.objetivo.indexOf(',') > 0 ? objetivo.objetivo.indexOf(',') : 80) + '...'
      : objetivo.objetivo;

    const indicadoresTexto = objetivo.indicadores?.length 
      ? `Indicadores sugeridos:\n${objetivo.indicadores.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}`
      : '';

    // Generar meta cuantificable basada en el primer indicador o plantilla por defecto
    let metaSugerida = '';
    if (objetivo.indicadores && objetivo.indicadores.length > 0) {
      const primerIndicador = objetivo.indicadores[0];
      if (primerIndicador.toLowerCase().includes('porcentaje')) {
        metaSugerida = 'Alcanzar el 90% de cumplimiento';
      } else if (primerIndicador.toLowerCase().includes('número') || primerIndicador.toLowerCase().includes('índice')) {
        metaSugerida = 'Reducir en un 20% respecto al período anterior';
      } else {
        metaSugerida = `Cumplir: ${primerIndicador}`;
      }
    } else {
      metaSugerida = 'Cumplir el 100% de las actividades programadas';
    }

    form.setValue('nombre', nombreCorto);
    form.setValue('descripcion', objetivo.objetivo);
    form.setValue('meta', metaSugerida);
    form.setValue('categoriaObjetivo', categoriaObjetivoLabels[objetivo.categoria] || objetivo.categoria);
    form.setValue('alineadoConNorma', objetivo.normativa);
    if (objetivo.alcance) {
      form.setValue('area', objetivo.alcance);
    }
    if (indicadoresTexto) {
      form.setValue('observaciones', indicadoresTexto);
    }

    toast({
      title: "Objetivo predefinido cargado",
      description: "Se han completado los campos con la información del objetivo seleccionado. Puede personalizar según sus necesidades.",
      className: "bg-blue-50 border-blue-200",
    });
  };

  const { data: objetivos = [], isLoading } = useQuery<ObjetivoSst[]>({
    queryKey: isAdmin && selectedCompanyId 
      ? ["/api/objetivos-sst", selectedCompanyId]
      : ["/api/objetivos-sst"],
    queryFn: async () => {
      const url = isAdmin && selectedCompanyId 
        ? `/api/objetivos-sst?companyId=${selectedCompanyId}`
        : "/api/objetivos-sst";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Error al cargar objetivos");
      }
      return res.json();
    },
    enabled: !isAdmin || !!selectedCompanyId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof objetivoFormSchema>) => {
      const payload = isAdmin 
        ? { ...data, companyId: formCompanyId }
        : data;
      const res = await apiRequest("POST", "/api/objetivos-sst", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst"] });
      if (isAdmin && selectedCompanyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst", selectedCompanyId] });
      }
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Objetivo creado",
        description: "El objetivo SST se ha creado exitosamente",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof objetivoFormSchema>> }) => {
      const payload = isAdmin 
        ? { ...data, companyId: formCompanyId }
        : data;
      const res = await apiRequest("PATCH", `/api/objetivos-sst/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst"] });
      if (isAdmin && selectedCompanyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst", selectedCompanyId] });
      }
      setDialogOpen(false);
      setEditingObjetivo(null);
      form.reset();
      toast({
        title: "Objetivo actualizado",
        description: "El objetivo SST se ha actualizado exitosamente",
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

  const deleteMutation = useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId?: string }) => {
      const params = isAdmin && companyId 
        ? `?companyId=${companyId}`
        : "";
      await apiRequest("DELETE", `/api/objetivos-sst/${id}${params}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst"] });
      if (isAdmin && selectedCompanyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst", selectedCompanyId] });
      }
      toast({
        title: "Objetivo eliminado",
        description: "El objetivo SST se ha eliminado exitosamente",
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

  // Mutation para actualizar solo el porcentaje de avance (Add-Only - Decreto 1072/2015)
  const updateAvanceMutation = useMutation({
    mutationFn: async ({ id, porcentajeAvance, companyId }: { id: string; porcentajeAvance: number; companyId?: string }) => {
      const payload = isAdmin && companyId
        ? { porcentajeAvance, companyId }
        : { porcentajeAvance };
      const res = await apiRequest("PATCH", `/api/objetivos-sst/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst"] });
      if (isAdmin && selectedCompanyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst", selectedCompanyId] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-verificar"] });
      toast({
        title: "Avance actualizado",
        description: "El porcentaje de avance se ha guardado exitosamente",
        className: "bg-purple-50 border-purple-200",
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

  // Mutation para generar objetivos base del año de gestión
  const generateObjetivosMutation = useMutation({
    mutationFn: async () => {
      const currentYear = 2026; // Año de gestión SST
      // Objetivos basados en los 7 componentes de la Resolución 0312/2019 y Decreto 1072/2015
      const objetivosBase = [
        // === COMPONENTE 1: RECURSOS (10%) ===
        {
          nombre: `Designación del Responsable SG-SST ${currentYear}`,
          descripcion: 'Designar un responsable del Sistema de Gestión de SST con formación y licencia vigente, asignando funciones y responsabilidades específicas.',
          meta: 'Mantener designación documentada y vigente del responsable SST',
          valorMeta: 100,
          responsable: user?.fullName || 'Gerencia General',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'anual',
          estado: 'activo',
          categoriaObjetivo: 'recursos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 1.1.1',
        },
        {
          nombre: `Asignación de Recursos SST ${currentYear}`,
          descripcion: 'Garantizar la asignación de recursos humanos, técnicos y financieros necesarios para la implementación del SG-SST.',
          meta: 'Ejecutar el 100% del presupuesto asignado para SST',
          valorMeta: 100,
          responsable: user?.fullName || 'Gerencia General',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'recursos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 1.1.3',
        },
        {
          nombre: `Afiliación al Sistema de Seguridad Social ${currentYear}`,
          descripcion: 'Garantizar la afiliación del 100% de trabajadores al Sistema General de Seguridad Social (EPS, AFP, ARL).',
          meta: 'Mantener al 100% del personal afiliado y con pagos al día',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'recursos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 1.1.4',
        },
        {
          nombre: `Conformación COPASST/Vigía SST ${currentYear}`,
          descripcion: 'Conformar y mantener vigente el Comité Paritario de Seguridad y Salud en el Trabajo o designar Vigía SST según número de trabajadores.',
          meta: 'Mantener COPASST/Vigía conformado con actas de reuniones mensuales',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'recursos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 1.1.6',
        },
        {
          nombre: `Comité de Convivencia Laboral ${currentYear}`,
          descripcion: 'Conformar y mantener vigente el Comité de Convivencia Laboral para prevenir el acoso laboral.',
          meta: 'Mantener comité conformado con reuniones trimestrales documentadas',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'recursos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 1.1.8',
        },

        // === COMPONENTE 2: GESTIÓN INTEGRAL DEL SG-SST (15%) ===
        {
          nombre: `Política de SST ${currentYear}`,
          descripcion: 'Establecer, documentar y divulgar la política de Seguridad y Salud en el Trabajo firmada por la alta dirección.',
          meta: 'Política documentada, firmada y comunicada al 100% del personal',
          valorMeta: 100,
          responsable: user?.fullName || 'Gerencia General',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'anual',
          estado: 'activo',
          categoriaObjetivo: 'gestion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 2.1.1',
        },
        {
          nombre: `Objetivos del SG-SST ${currentYear}`,
          descripcion: 'Definir objetivos medibles y cuantificables del SG-SST compatibles con el plan de trabajo anual.',
          meta: 'Cumplir el 85% de los objetivos SST definidos para el período',
          valorMeta: 85,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'gestion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 2.2.1',
        },
        {
          nombre: `Evaluación Inicial del SG-SST ${currentYear}`,
          descripcion: 'Realizar la evaluación inicial del Sistema de Gestión de SST identificando prioridades en SST.',
          meta: 'Completar evaluación inicial con puntaje mínimo del 85%',
          valorMeta: 85,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'anual',
          estado: 'activo',
          categoriaObjetivo: 'gestion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 2.3.1',
        },
        {
          nombre: `Plan de Trabajo Anual SST ${currentYear}`,
          descripcion: 'Diseñar y ejecutar el plan de trabajo anual con cronograma, metas, responsables y recursos.',
          meta: 'Ejecutar el 90% de las actividades del plan de trabajo anual',
          valorMeta: 90,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'gestion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 2.4.1',
        },
        {
          nombre: `Inducción y Reinducción SST ${currentYear}`,
          descripcion: 'Realizar inducción en SST al 100% de nuevos trabajadores y reinducción anual a todo el personal.',
          meta: 'Cobertura del 100% en inducción y reinducción SST',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'capacitacion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 2.5.1',
        },
        {
          nombre: `Programa de Capacitación SST ${currentYear}`,
          descripcion: 'Diseñar y ejecutar el programa anual de capacitación en SST con cobertura del 100% del personal.',
          meta: 'Capacitar al 100% del personal en los temas programados',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'capacitacion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 2.6.1',
        },

        // === COMPONENTE 3: GESTIÓN DE LA SALUD (20%) ===
        {
          nombre: `Evaluaciones Médicas Ocupacionales ${currentYear}`,
          descripcion: 'Realizar evaluaciones médicas de ingreso, periódicas y de egreso según profesiograma.',
          meta: 'Cobertura del 100% en exámenes médicos ocupacionales',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.1.1',
        },
        {
          nombre: `Custodia de Historias Clínicas ${currentYear}`,
          descripcion: 'Garantizar la custodia de las historias clínicas ocupacionales bajo reserva y confidencialidad.',
          meta: 'Mantener el 100% de historias clínicas bajo custodia apropiada',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'semestral',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.1.2',
        },
        {
          nombre: `Restricciones y Recomendaciones Médicas ${currentYear}`,
          descripcion: 'Implementar y hacer seguimiento a las restricciones y recomendaciones médico-laborales.',
          meta: 'Cumplir el 100% de restricciones y recomendaciones médicas',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.1.3',
        },
        {
          nombre: `Vigilancia Epidemiológica ${currentYear}`,
          descripcion: 'Implementar programas de vigilancia epidemiológica según los riesgos prioritarios identificados.',
          meta: 'Ejecutar el 100% de los SVE programados',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.1.4',
        },
        {
          nombre: `Estilos de Vida Saludable ${currentYear}`,
          descripcion: 'Desarrollar actividades de promoción de la salud y prevención de enfermedades.',
          meta: 'Ejecutar el 90% de actividades de estilos de vida saludable',
          valorMeta: 90,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.1.7',
        },
        {
          nombre: `Gestión del Agua Potable ${currentYear}`,
          descripcion: 'Garantizar suministro de agua potable, servicios sanitarios y manejo de residuos.',
          meta: 'Mantener condiciones sanitarias básicas al 100%',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.1.8',
        },
        {
          nombre: `Reporte de Accidentes y Enfermedades ${currentYear}`,
          descripcion: 'Reportar oportunamente los accidentes de trabajo y enfermedades laborales a la ARL.',
          meta: 'Reportar el 100% de AT/EL dentro de los 2 días hábiles',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.2.1',
        },
        {
          nombre: `Investigación de AT/EL ${currentYear}`,
          descripcion: 'Investigar los accidentes de trabajo y enfermedades laborales identificando causas y acciones correctivas.',
          meta: 'Investigar el 100% de AT/EL dentro de los 15 días calendario',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.2.2',
        },
        {
          nombre: `Indicadores de Accidentalidad ${currentYear}`,
          descripcion: 'Calcular y analizar los indicadores de frecuencia, severidad y mortalidad de AT.',
          meta: 'Reducir la tasa de accidentalidad en un 10% respecto al año anterior',
          valorMeta: 10,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'salud',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 3.3.1',
        },

        // === COMPONENTE 4: GESTIÓN DE PELIGROS Y RIESGOS (30%) ===
        {
          nombre: `Identificación de Peligros IPERC ${currentYear}`,
          descripcion: 'Identificar peligros, evaluar y valorar riesgos con participación de los trabajadores.',
          meta: 'Actualizar el 100% de la matriz IPERC anualmente',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'semestral',
          estado: 'activo',
          categoriaObjetivo: 'riesgos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 4.1.2',
        },
        {
          nombre: `Medidas de Prevención y Control ${currentYear}`,
          descripcion: 'Implementar medidas de prevención y control según jerarquía de controles.',
          meta: 'Implementar el 90% de controles priorizados en la matriz',
          valorMeta: 90,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'riesgos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 4.2.1',
        },
        {
          nombre: `Inspecciones de Seguridad ${currentYear}`,
          descripcion: 'Realizar inspecciones sistemáticas de instalaciones, máquinas, equipos y herramientas.',
          meta: 'Ejecutar el 100% de inspecciones programadas',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'riesgos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 4.2.2',
        },
        {
          nombre: `Mantenimiento de Equipos ${currentYear}`,
          descripcion: 'Ejecutar el programa de mantenimiento preventivo de instalaciones, equipos y herramientas.',
          meta: 'Cumplir el 95% del programa de mantenimiento preventivo',
          valorMeta: 95,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'riesgos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 4.2.3',
        },
        {
          nombre: `Suministro de EPP ${currentYear}`,
          descripcion: 'Suministrar EPP adecuados según los peligros identificados y capacitar en su uso.',
          meta: 'Cobertura del 100% en entrega y capacitación de EPP',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'riesgos',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 4.2.4',
        },

        // === COMPONENTE 5: GESTIÓN DE AMENAZAS (10%) ===
        {
          nombre: `Plan de Emergencias ${currentYear}`,
          descripcion: 'Elaborar e implementar el plan de prevención, preparación y respuesta ante emergencias.',
          meta: 'Mantener plan de emergencias actualizado y divulgado',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'anual',
          estado: 'activo',
          categoriaObjetivo: 'emergencias',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 5.1.1',
        },
        {
          nombre: `Brigadas de Emergencia ${currentYear}`,
          descripcion: 'Conformar, capacitar y dotar la brigada de emergencias.',
          meta: 'Mantener brigada conformada y capacitada según estándar',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'emergencias',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 5.1.2',
        },

        // === COMPONENTE 6: VERIFICACIÓN (5%) ===
        {
          nombre: `Gestión de Indicadores SST ${currentYear}`,
          descripcion: 'Definir y calcular indicadores de estructura, proceso y resultado del SG-SST.',
          meta: 'Mantener el 100% de indicadores SST actualizados mensualmente',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'verificacion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 6.1.1',
        },
        {
          nombre: `Auditoría Interna del SG-SST ${currentYear}`,
          descripcion: 'Realizar auditoría anual del cumplimiento del SG-SST con auditor competente.',
          meta: 'Ejecutar auditoría interna anual con informe documentado',
          valorMeta: 100,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'anual',
          estado: 'activo',
          categoriaObjetivo: 'verificacion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 6.1.3',
        },
        {
          nombre: `Revisión por la Alta Dirección ${currentYear}`,
          descripcion: 'Realizar revisión anual del SG-SST por la alta dirección.',
          meta: 'Documentar revisión gerencial con plan de mejora',
          valorMeta: 100,
          responsable: user?.fullName || 'Gerencia General',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'anual',
          estado: 'activo',
          categoriaObjetivo: 'verificacion',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 6.1.4',
        },

        // === COMPONENTE 7: MEJORAMIENTO (10%) ===
        {
          nombre: `Acciones Correctivas y Preventivas ${currentYear}`,
          descripcion: 'Implementar acciones correctivas, preventivas y de mejora resultantes de hallazgos.',
          meta: 'Cerrar el 90% de acciones correctivas en el plazo establecido',
          valorMeta: 90,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'mensual',
          estado: 'activo',
          categoriaObjetivo: 'mejoramiento',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 7.1.1',
        },
        {
          nombre: `Plan de Mejoramiento del SG-SST ${currentYear}`,
          descripcion: 'Formular e implementar el plan de mejoramiento continuo del SG-SST.',
          meta: 'Ejecutar el 85% de las acciones del plan de mejoramiento',
          valorMeta: 85,
          responsable: user?.fullName || 'Responsable SG-SST',
          anio: currentYear,
          fechaInicio: new Date(currentYear, 0, 1),
          fechaFin: new Date(currentYear, 11, 31),
          frecuenciaRevision: 'trimestral',
          estado: 'activo',
          categoriaObjetivo: 'mejoramiento',
          alineadoConNorma: 'Resolución 0312/2019 - Estándar 7.1.2',
        },
      ];

      const results = [];
      for (const objetivo of objetivosBase) {
        const payload = isAdmin ? { ...objetivo, companyId: selectedCompanyId || formCompanyId } : objetivo;
        const res = await apiRequest("POST", "/api/objetivos-sst", payload);
        results.push(await res.json());
      }
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst"] });
      if (isAdmin && selectedCompanyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sst", selectedCompanyId] });
      }
      toast({
        title: "Objetivos generados",
        description: `Se han creado ${data.length} objetivos base para ${new Date().getFullYear()}`,
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

  const onSubmit = (values: z.infer<typeof objetivoFormSchema>) => {
    // Validate company selection for admins
    if (isAdmin && !formCompanyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
    if (editingObjetivo) {
      updateMutation.mutate({ id: editingObjetivo.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (objetivo: ObjetivoSst) => {
    setEditingObjetivo(objetivo);
    // Set the form company ID from the record being edited
    if (isAdmin && objetivo.companyId) {
      setFormCompanyId(objetivo.companyId);
    }
    form.reset({
      nombre: objetivo.nombre,
      descripcion: objetivo.descripcion,
      meta: objetivo.meta,
      valorMeta: objetivo.valorMeta || undefined,
      responsable: objetivo.responsable,
      anio: objetivo.anio,
      fechaInicio: new Date(objetivo.fechaInicio),
      fechaFin: new Date(objetivo.fechaFin),
      frecuenciaRevision: objetivo.frecuenciaRevision,
      estado: objetivo.estado,
      categoriaObjetivo: objetivo.categoriaObjetivo || "",
      area: objetivo.area || "",
      alineadoConNorma: objetivo.alineadoConNorma || "",
      observaciones: objetivo.observaciones || "",
      planesAccion: objetivo.planesAccion || "",
      fechaUltimaRevision: objetivo.fechaUltimaRevision ? new Date(objetivo.fechaUltimaRevision) : undefined,
    });
    setDialogOpen(true);
  };

  const handleDelete = (objetivo: ObjetivoSst) => {
    if (confirm("¿Está seguro de eliminar este objetivo? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate({ id: objetivo.id, companyId: objetivo.companyId });
    }
  };

  const filteredObjetivos = objetivos.filter((objetivo) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      objetivo.nombre.toLowerCase().includes(searchLower) ||
      objetivo.descripcion.toLowerCase().includes(searchLower) ||
      objetivo.responsable.toLowerCase().includes(searchLower) ||
      (objetivo.categoriaObjetivo?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      {isSuperadmin && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <label className="block text-sm font-medium mb-2">
            Seleccionar Empresa
          </label>
          <Select
            value={selectedCompanyId}
            onValueChange={setSelectedCompanyId}
          >
            <SelectTrigger data-testid="select-company-filter">
              <SelectValue placeholder="Seleccione una empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Seleccione la empresa para ver y gestionar sus objetivos SST
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar objetivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-objetivos"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingObjetivo(null);
            setFormCompanyId("");
            setSelectedPredefinido("");
            form.reset();
          } else if (isAdmin && !editingObjetivo) {
            // When opening dialog for new objetivo, use current filter selection
            setFormCompanyId(selectedCompanyId);
          }
        }}>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => generateObjetivosMutation.mutate()}
              disabled={generateObjetivosMutation.isPending || (isAdmin && !selectedCompanyId)}
              data-testid="button-generate-objetivos"
            >
              <Zap className="h-4 w-4 mr-2" />
              {generateObjetivosMutation.isPending ? "Generando..." : `Generar Objetivos ${new Date().getFullYear()}`}
            </Button>
            <DialogTrigger asChild>
              <Button data-testid="button-create-objetivo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Objetivo
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingObjetivo ? "Editar Objetivo SST" : "Nuevo Objetivo SST"}</DialogTitle>
              <DialogDescription>
                {editingObjetivo ? "Modifique los datos del objetivo" : "Defina un objetivo SMART para el Sistema de Gestión SST"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isSuperadmin && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <label className="block text-sm font-medium mb-2">
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formCompanyId}
                      onValueChange={setFormCompanyId}
                      disabled={!!editingObjetivo}
                    >
                      <SelectTrigger data-testid="select-company">
                        <SelectValue placeholder="Seleccione la empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      {editingObjetivo 
                        ? "Empresa del objetivo (no se puede cambiar)"
                        : "Seleccione la empresa para la cual desea crear este objetivo"
                      }
                    </p>
                  </div>
                )}
                
                {!editingObjetivo && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione un objetivo predefinido para auto-rellenar los campos</p>
                        </div>
                        <div className="flex gap-2">
                          <Select value={selectedPredefinido} onValueChange={(value) => {
                            setSelectedPredefinido(value);
                            handleAutoFillFromPredefinido(value);
                          }}>
                            <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-objetivo-predefinido">
                              <SelectValue placeholder="Seleccione un objetivo predefinido..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              {Object.entries(categoriaObjetivoLabels).map(([cat, label]) => {
                                const objetivosInCategoria = OBJETIVOS_POR_CATEGORIA[cat as keyof typeof OBJETIVOS_POR_CATEGORIA] || [];
                                if (objetivosInCategoria.length === 0) return null;
                                return (
                                  <div key={cat}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                      {label}
                                    </div>
                                    {objetivosInCategoria.map((objetivo) => (
                                      <SelectItem key={objetivo.id} value={objetivo.id}>
                                        <span className="line-clamp-1">
                                          {objetivo.objetivo.length > 60 
                                            ? objetivo.objetivo.substring(0, 60) + '...' 
                                            : objetivo.objetivo}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Objetivo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Reducir accidentes laborales" data-testid="input-nombre" />
                      </FormControl>
                      <FormDescription>Nombre corto y claro del objetivo (criterio: Específico)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción Detallada</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describa de forma clara y precisa qué se busca lograr con este objetivo..."
                          rows={3}
                          data-testid="input-descripcion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Cuantificable</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Reducir AT en 20%" data-testid="input-meta" />
                        </FormControl>
                        <FormDescription>Criterio SMART: Medible</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valorMeta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Numérico (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ""}
                            placeholder="20"
                            data-testid="input-valor-meta"
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
                    name="responsable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-responsable">
                              <SelectValue placeholder="Seleccione un responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workers.length === 0 ? (
                              <SelectItem value="no-workers" disabled>
                                No hay trabajadores disponibles
                              </SelectItem>
                            ) : (
                              workers.map((worker) => (
                                <SelectItem key={worker.id} value={`${worker.fullName} - ${worker.position || 'Sin cargo'}`}>
                                  {worker.fullName} - {worker.position || 'Sin cargo'}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>Cargo del responsable</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Aplicación (opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Producción, Logística" data-testid="input-area" value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="anio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-anio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Inicio</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
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
                        <FormLabel>Fecha Fin</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-fecha-fin"
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
                    name="frecuenciaRevision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frecuencia de Revisión</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-frecuencia">
                              <SelectValue placeholder="Seleccione frecuencia" />
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
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="en-revision">En Revisión</SelectItem>
                            <SelectItem value="cumplido">Cumplido</SelectItem>
                            <SelectItem value="no-cumplido">No Cumplido</SelectItem>
                            <SelectItem value="suspendido">Suspendido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoriaObjetivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría del Objetivo (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Prevención, Promoción, Gestión del Riesgo" data-testid="input-categoria" value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alineadoConNorma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alineado con Norma (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Decreto 1072/2015 Art. 2.2.4.6.19" data-testid="input-norma" value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Referencia normativa colombiana</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Observaciones adicionales..."
                          rows={2}
                          data-testid="input-observaciones"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                    {editingObjetivo ? "Guardar Cambios" : "Crear Objetivo"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredObjetivos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm ? "No se encontraron objetivos con ese término de búsqueda" : "No hay objetivos registrados. Cree el primer objetivo SST."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjetivos.map((objetivo) => (
            <Card key={objetivo.id} className="hover-elevate" data-testid={`card-objetivo-${objetivo.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{objetivo.nombre}</CardTitle>
                    <CardDescription className="mt-1">
                      Año {objetivo.anio} · {objetivo.responsable}
                    </CardDescription>
                  </div>
                  <StatusBadge status={objetivo.estado} type="objetivo" withIcon />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {objetivo.descripcion}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Meta:</span>
                    <span className="text-muted-foreground">{objetivo.meta}</span>
                  </div>
                  {objetivo.area && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Área:</span>
                      <span className="text-muted-foreground">{objetivo.area}</span>
                    </div>
                  )}
                </div>

                {/* Control de Avance (Add-Only - Decreto 1072/2015 Art. 2.2.4.6.19) */}
                <AvanceControl
                  objetivo={objetivo}
                  onSave={(porcentaje) => updateAvanceMutation.mutate({
                    id: objetivo.id,
                    porcentajeAvance: porcentaje,
                    companyId: objetivo.companyId
                  })}
                  isPending={updateAvanceMutation.isPending}
                />

                {/* Trazabilidad Estándares-Objetivos (Add-Only - Resolución 0312/2019) */}
                <EstandardesVinculadosControl
                  objetivo={objetivo}
                  onAvanceUpdate={(avance) => {
                    queryClient.invalidateQueries({ queryKey: ['/api/objetivos-sst'] });
                  }}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(objetivo)}
                    className="flex-1"
                    data-testid={`button-edit-${objetivo.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(objetivo)}
                    className="flex-1"
                    data-testid={`button-delete-${objetivo.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function IndicadoresTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndicador, setEditingIndicador] = useState<IndicadorSst | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [medicionesDialogOpen, setMedicionesDialogOpen] = useState(false);
  const [selectedIndicador, setSelectedIndicador] = useState<IndicadorSst | null>(null);
  const [selectedPredefIndicador, setSelectedPredefIndicador] = useState<string>("");

  const form = useForm<z.infer<typeof indicadorFormSchema>>({
    resolver: zodResolver(indicadorFormSchema),
    defaultValues: {
      nombre: "",
      definicion: "",
      interpretacion: "",
      tipo: "estructura",
      formula: "",
      fuenteInformacion: "",
      meta: "",
      unidadMedida: "",
      frecuenciaMedicion: "trimestral",
      responsables: "",
      valorMeta: undefined,
      esCalculoAutomatico: 0,
      codigoCalculo: "",
      normasRelacionadas: "",
      activo: 1,
      objetivoId: undefined,
    },
  });

  const { data: indicadores = [], isLoading } = useQuery<IndicadorSst[]>({
    queryKey: ["/api/indicadores-sst"],
  });

  const { data: objetivos = [] } = useQuery<ObjetivoSst[]>({
    queryKey: ["/api/objetivos-sst"],
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const handleAutoFillFromPredefinido = (codigo: string) => {
    const indicador = getIndicadorByCodigo(codigo);
    if (!indicador) return;

    form.setValue("nombre", indicador.nombre);
    form.setValue("tipo", indicador.tipo);
    form.setValue("definicion", indicador.definicion);
    form.setValue("interpretacion", indicador.interpretacion);
    form.setValue("formula", indicador.formula);
    form.setValue("unidadMedida", indicador.unidadMedida);
    form.setValue("frecuenciaMedicion", indicador.frecuenciaMedicion);
    form.setValue("fuenteInformacion", indicador.fuenteInformacion);
    if (indicador.meta) {
      form.setValue("meta", indicador.meta);
    }

    toast({
      title: "Campos auto-rellenados",
      description: `Los campos se han rellenado con el indicador predefinido "${indicador.nombre}"`,
      className: "bg-green-50 border-green-200",
    });
  };

  const currentTipo = form.watch("tipo");
  const suggestedFormulas = formulasSugeridas[currentTipo as keyof typeof formulasSugeridas] || [];

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof indicadorFormSchema>) => {
      const res = await apiRequest("POST", "/api/indicadores-sst", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sst"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Indicador creado",
        description: "El indicador SST se ha creado exitosamente",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof indicadorFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/indicadores-sst/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sst"] });
      setDialogOpen(false);
      setEditingIndicador(null);
      form.reset();
      toast({
        title: "Indicador actualizado",
        description: "El indicador SST se ha actualizado exitosamente",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/indicadores-sst/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sst"] });
      toast({
        title: "Indicador eliminado",
        description: "El indicador SST se ha eliminado exitosamente",
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

  const onSubmit = (values: z.infer<typeof indicadorFormSchema>) => {
    if (editingIndicador) {
      updateMutation.mutate({ id: editingIndicador.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (indicador: IndicadorSst) => {
    setEditingIndicador(indicador);
    form.reset({
      nombre: indicador.nombre,
      definicion: indicador.definicion,
      interpretacion: indicador.interpretacion,
      tipo: indicador.tipo,
      formula: indicador.formula,
      fuenteInformacion: indicador.fuenteInformacion,
      meta: indicador.meta,
      unidadMedida: indicador.unidadMedida || "",
      frecuenciaMedicion: indicador.frecuenciaMedicion,
      responsables: indicador.responsables,
      valorMeta: indicador.valorMeta || undefined,
      esCalculoAutomatico: indicador.esCalculoAutomatico,
      codigoCalculo: indicador.codigoCalculo || "",
      normasRelacionadas: indicador.normasRelacionadas || "",
      activo: indicador.activo,
      objetivoId: indicador.objetivoId || undefined,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este indicador? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredIndicadores = indicadores.filter((indicador) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      indicador.nombre.toLowerCase().includes(searchLower) ||
      indicador.definicion.toLowerCase().includes(searchLower) ||
      indicador.responsables.toLowerCase().includes(searchLower);
    
    const matchesType = tipoFilter === "all" || indicador.tipo === tipoFilter;
    
    return matchesSearch && matchesType;
  });

  const getTipoBadge = (tipo: string) => {
    const config = {
      "estructura": { label: "Estructura", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Target },
      "proceso": { label: "Proceso", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: Activity },
      "resultado": { label: "Resultado", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: TrendingUp },
    };
    const item = config[tipo as keyof typeof config] || config["estructura"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  const getIndicadorStats = () => {
    return {
      estructura: indicadores.filter(i => i.tipo === "estructura").length,
      proceso: indicadores.filter(i => i.tipo === "proceso").length,
      resultado: indicadores.filter(i => i.tipo === "resultado").length,
    };
  };

  const stats = getIndicadorStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Estructura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.estructura}</div>
                <p className="text-xs text-muted-foreground">Recursos y procesos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.proceso}</div>
                <p className="text-xs text-muted-foreground">Implementación y actividades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.resultado}</div>
                <p className="text-xs text-muted-foreground">Impactos y logros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar indicadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-indicadores"
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-tipo">
              <SelectValue placeholder="Tipo de indicador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="estructura">Estructura</SelectItem>
              <SelectItem value="proceso">Proceso</SelectItem>
              <SelectItem value="resultado">Resultado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingIndicador(null);
            setSelectedPredefIndicador("");
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-indicador">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Indicador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingIndicador ? "Editar Indicador SST" : "Nuevo Indicador SST"}</DialogTitle>
              <DialogDescription>
                {editingIndicador ? "Modifique los datos del indicador" : "Defina un nuevo indicador de Estructura, Proceso o Resultado"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!editingIndicador && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione un indicador predefinido para auto-rellenar los campos</p>
                        </div>
                        <div className="flex gap-2">
                          <Select value={selectedPredefIndicador} onValueChange={(value) => {
                            setSelectedPredefIndicador(value);
                            handleAutoFillFromPredefinido(value);
                          }}>
                            <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-indicador-predefinido">
                              <SelectValue placeholder="Seleccione un indicador predefinido..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Estructura</div>
                              {indicadoresSstPredefinidos.filter(i => i.tipo === "estructura").map((ind) => (
                                <SelectItem key={ind.codigo} value={ind.codigo}>
                                  {ind.codigo} - {ind.nombre}
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Proceso</div>
                              {indicadoresSstPredefinidos.filter(i => i.tipo === "proceso").map((ind) => (
                                <SelectItem key={ind.codigo} value={ind.codigo}>
                                  {ind.codigo} - {ind.nombre}
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Resultado</div>
                              {indicadoresSstPredefinidos.filter(i => i.tipo === "resultado").map((ind) => (
                                <SelectItem key={ind.codigo} value={ind.codigo}>
                                  {ind.codigo} - {ind.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Indicador</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Índice de Frecuencia" data-testid="input-indicador-nombre" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Indicador</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-indicador-tipo">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="estructura">Estructura</SelectItem>
                            <SelectItem value="proceso">Proceso</SelectItem>
                            <SelectItem value="resultado">Resultado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Estructura (recursos), Proceso (actividades), Resultado (impacto)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="objetivoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo Asociado (opcional)</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value === "none" ? undefined : value);
                          // Auto-rellenar norma del objetivo seleccionado
                          if (value !== "none") {
                            const objetivoSeleccionado = objetivos.find(o => o.id === value);
                            if (objetivoSeleccionado?.alineadoConNorma) {
                              const normaActual = form.getValues("normasRelacionadas") || "";
                              // Solo agregar si no está ya incluida
                              if (!normaActual.includes(objetivoSeleccionado.alineadoConNorma)) {
                                form.setValue("normasRelacionadas", 
                                  normaActual 
                                    ? `${normaActual}, ${objetivoSeleccionado.alineadoConNorma}`
                                    : objetivoSeleccionado.alineadoConNorma
                                );
                              }
                            }
                          }
                        }} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-objetivo-asociado">
                            <SelectValue placeholder="Seleccione un objetivo (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin objetivo asociado</SelectItem>
                          {objetivos.map((obj) => (
                            <SelectItem key={obj.id} value={obj.id}>
                              {obj.nombre} ({obj.anio})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Vincule este indicador con un objetivo específico</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="normasRelacionadas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Normas Relacionadas</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Se auto-rellena al seleccionar un objetivo..."
                          rows={2}
                          data-testid="input-indicador-normas"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Auto-completado desde el objetivo seleccionado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="definicion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Definición</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Qué mide este indicador..."
                          rows={2}
                          data-testid="input-indicador-definicion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interpretacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interpretación</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Cómo se interpreta el resultado..."
                          rows={2}
                          data-testid="input-indicador-interpretacion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="formula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fórmula de Cálculo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: (AT * K) / HHT" data-testid="input-formula" />
                        </FormControl>
                        <FormDescription>Fórmula matemática del indicador</FormDescription>
                        {suggestedFormulas.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">Fórmulas sugeridas:</p>
                                <div className="space-y-1">
                                  {suggestedFormulas.map((formula, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => form.setValue("formula", formula)}
                                      className="block w-full text-left text-xs bg-white dark:bg-gray-950 hover-elevate active-elevate-2 px-2 py-1 rounded border border-amber-200 dark:border-amber-700"
                                    >
                                      {formula}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unidadMedida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad de Medida (opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unidad-medida">
                              <SelectValue placeholder="Seleccione unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="%">% (Porcentaje)</SelectItem>
                            <SelectItem value="Índice">Índice</SelectItem>
                            <SelectItem value="Tasa">Tasa</SelectItem>
                            <SelectItem value="Número">Número</SelectItem>
                            <SelectItem value="Días">Días</SelectItem>
                            <SelectItem value="Horas">Horas</SelectItem>
                            <SelectItem value="Casos">Casos</SelectItem>
                            <SelectItem value="Personas">Personas</SelectItem>
                            <SelectItem value="Actividades">Actividades</SelectItem>
                            <SelectItem value="Documentos">Documentos</SelectItem>
                            <SelectItem value="Capacitaciones">Capacitaciones</SelectItem>
                            <SelectItem value="Inspecciones">Inspecciones</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frecuenciaMedicion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frecuencia de Medición</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-indicador-frecuencia">
                              <SelectValue placeholder="Seleccione frecuencia" />
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
                  <FormField
                    control={form.control}
                    name="responsables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsables</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-indicador-responsables">
                              <SelectValue placeholder="Seleccione un trabajador responsable" />
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
                        <FormDescription>Quién conoce el resultado</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fuenteInformacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente de Información</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Registro de accidentes, Sistema de gestión" data-testid="input-fuente" />
                      </FormControl>
                      <FormDescription>De dónde se obtienen los datos para el cálculo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: ≥ 90%, < 5" data-testid="input-meta-indicador" />
                        </FormControl>
                        <FormDescription>Valor esperado</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valorMeta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Numérico Meta (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ""}
                            placeholder="90"
                            data-testid="input-valor-meta-indicador"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-indicador-submit">
                    {editingIndicador ? "Guardar Cambios" : "Crear Indicador"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredIndicadores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm || tipoFilter !== "all" ? "No se encontraron indicadores con los filtros seleccionados" : "No hay indicadores registrados. Cree el primer indicador SST."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIndicadores.map((indicador) => (
            <Card key={indicador.id} className="hover-elevate" data-testid={`card-indicador-${indicador.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{indicador.nombre}</CardTitle>
                    <CardDescription className="mt-1">
                      {indicador.responsables} · {indicador.frecuenciaMedicion}
                    </CardDescription>
                  </div>
                  {getTipoBadge(indicador.tipo)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {indicador.definicion}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fórmula:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded line-clamp-1">{indicador.formula}</code>
                  </div>
                  {indicador.unidadMedida && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Unidad:</span>
                      <span className="text-muted-foreground">{indicador.unidadMedida}</span>
                    </div>
                  )}
                  {indicador.valorMeta !== null && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Meta:</span>
                      <span className="text-muted-foreground">{indicador.meta}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedIndicador(indicador);
                      setMedicionesDialogOpen(true);
                    }}
                    className="w-full"
                    data-testid={`button-mediciones-${indicador.id}`}
                  >
                    <History className="h-4 w-4 mr-1" />
                    Ver Mediciones
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(indicador)}
                      className="flex-1"
                      data-testid={`button-edit-indicador-${indicador.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(indicador.id)}
                      className="flex-1"
                      data-testid={`button-delete-indicador-${indicador.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedIndicador && (
        <MedicionesDialog
          indicador={selectedIndicador}
          open={medicionesDialogOpen}
          onOpenChange={setMedicionesDialogOpen}
        />
      )}
    </div>
  );
}

interface MedicionesDialogProps {
  indicador: IndicadorSst;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MedicionesDialog({ indicador, open, onOpenChange }: MedicionesDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [calculando, setCalculando] = useState(false);

  const medicionFormSchema = insertMedicionIndicadorSchema.extend({
    fechaMedicion: z.coerce.date(),
    valorNumerico: z.number().optional().nullable(),
    cumpleMeta: z.number().optional().nullable(),
    desviacion: z.number().optional().nullable(),
  });

  const form = useForm<z.infer<typeof medicionFormSchema>>({
    resolver: zodResolver(medicionFormSchema),
    defaultValues: {
      indicadorId: indicador.id,
      periodo: "",
      fechaMedicion: new Date(),
      valorMedido: "",
      valorNumerico: undefined,
      cumpleMeta: undefined,
      desviacion: undefined,
      analisis: "",
      accionesCorrectivas: "",
      responsableMedicion: user?.fullName || user?.username || "",
    },
  });

  const handleCalcularAutomatico = async () => {
    const periodo = form.getValues("periodo");
    if (!periodo) {
      toast({
        title: "Periodo requerido",
        description: "Ingrese el periodo primero (ej: 2025-Q1)",
        variant: "destructive",
      });
      return;
    }

    setCalculando(true);
    try {
      const res = await apiRequest("POST", `/api/indicadores/${indicador.id}/calcular`, { periodo });
      const resultado = await res.json();
      
      form.setValue("valorMedido", resultado.valorMedidoTexto);
      form.setValue("valorNumerico", Math.round(resultado.valorCalculado * 100) / 100);
      
      toast({
        title: "Cálculo completado",
        description: `${indicador.codigoCalculo} = ${resultado.valorMedidoTexto}`,
      });
    } catch (error: any) {
      toast({
        title: "Error al calcular",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCalculando(false);
    }
  };

  const { data: mediciones = [], isLoading } = useQuery<MedicionIndicador[]>({
    queryKey: ["/api/indicadores-sst", indicador.id, "mediciones"],
    queryFn: async () => {
      const res = await fetch(`/api/indicadores-sst/${indicador.id}/mediciones`);
      if (!res.ok) throw new Error("Error al cargar mediciones");
      return res.json();
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof medicionFormSchema>) => {
      const res = await apiRequest("POST", `/api/mediciones-indicadores`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sst", indicador.id, "mediciones"] });
      setShowAddForm(false);
      form.reset({
        indicadorId: indicador.id,
        periodo: "",
        fechaMedicion: new Date(),
        valorMedido: "",
        valorNumerico: undefined,
        cumpleMeta: undefined,
        desviacion: undefined,
        analisis: "",
        accionesCorrectivas: "",
        responsableMedicion: user?.fullName || user?.username || "",
      });
      toast({
        title: "Medición registrada",
        description: "La medición se ha registrado exitosamente",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/mediciones-indicadores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicadores-sst", indicador.id, "mediciones"] });
      toast({
        title: "Medición eliminada",
        description: "La medición se ha eliminado exitosamente",
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

  const onSubmit = (values: z.infer<typeof medicionFormSchema>) => {
    createMutation.mutate(values);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta medición? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  const getCumpleBadge = (cumple: number | null) => {
    if (cumple === null) return null;
    return cumple === 1 ? (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Cumple
      </Badge>
    ) : (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
        <XCircle className="h-3 w-3 mr-1" />
        No Cumple
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Mediciones: {indicador.nombre}
          </DialogTitle>
          <DialogDescription>
            Historial de mediciones del indicador · Fórmula: {indicador.formula}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del indicador */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Información del Indicador</CardTitle>
                <Badge variant="outline">{indicador.tipo}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Meta:</span> {indicador.meta}
              </div>
              <div>
                <span className="font-medium">Frecuencia:</span> {indicador.frecuenciaMedicion}
              </div>
              {indicador.unidadMedida && (
                <div>
                  <span className="font-medium">Unidad:</span> {indicador.unidadMedida}
                </div>
              )}
              <div>
                <span className="font-medium">Fuente:</span> {indicador.fuenteInformacion}
              </div>
            </CardContent>
          </Card>

          {/* Botón para agregar medición */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full"
              data-testid="button-add-medicion"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Nueva Medición
            </Button>
          )}

          {/* Formulario de nueva medición */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nueva Medición</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="periodo"
                        render={({ field }) => {
                          const currentYear = 2026; // Año de gestión SST
                          const periodos = [
                            { value: `${currentYear}-Q1`, label: `${currentYear} - Trimestre 1 (Ene-Mar)` },
                            { value: `${currentYear}-Q2`, label: `${currentYear} - Trimestre 2 (Abr-Jun)` },
                            { value: `${currentYear}-Q3`, label: `${currentYear} - Trimestre 3 (Jul-Sep)` },
                            { value: `${currentYear}-Q4`, label: `${currentYear} - Trimestre 4 (Oct-Dic)` },
                            { value: `${currentYear}-S1`, label: `${currentYear} - Semestre 1 (Ene-Jun)` },
                            { value: `${currentYear}-S2`, label: `${currentYear} - Semestre 2 (Jul-Dic)` },
                            { value: `${currentYear}`, label: `${currentYear} - Anual` },
                            { value: `${currentYear}-01`, label: `${currentYear} - Enero` },
                            { value: `${currentYear}-02`, label: `${currentYear} - Febrero` },
                            { value: `${currentYear}-03`, label: `${currentYear} - Marzo` },
                            { value: `${currentYear}-04`, label: `${currentYear} - Abril` },
                            { value: `${currentYear}-05`, label: `${currentYear} - Mayo` },
                            { value: `${currentYear}-06`, label: `${currentYear} - Junio` },
                            { value: `${currentYear}-07`, label: `${currentYear} - Julio` },
                            { value: `${currentYear}-08`, label: `${currentYear} - Agosto` },
                            { value: `${currentYear}-09`, label: `${currentYear} - Septiembre` },
                            { value: `${currentYear}-10`, label: `${currentYear} - Octubre` },
                            { value: `${currentYear}-11`, label: `${currentYear} - Noviembre` },
                            { value: `${currentYear}-12`, label: `${currentYear} - Diciembre` },
                          ];
                          return (
                            <FormItem>
                              <FormLabel>Periodo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-periodo">
                                    <SelectValue placeholder="Seleccione periodo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {periodos.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>Trimestre, semestre, mes o año</FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="fechaMedicion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Medición</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-fecha-medicion"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {indicador.esCalculoAutomatico === 1 && indicador.codigoCalculo && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              <Zap className="inline h-4 w-4 mr-1" />
                              Cálculo Automático Disponible
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                              Este indicador usa la fórmula <strong>{indicador.codigoCalculo}</strong> según NTC-3701/3793
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={handleCalcularAutomatico}
                            disabled={calculando}
                            data-testid="button-calcular-automatico"
                          >
                            {calculando ? "Calculando..." : "Calcular Automáticamente"}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="valorMedido"
                        render={({ field }) => {
                          const valoresComunes = [
                            "100%", "95%", "90%", "85%", "80%", "75%", "70%", "65%", "60%", "55%", "50%",
                            "0", "1", "2", "3", "4", "5", "10", "15", "20", "25", "30",
                            "0 días", "1 día", "2 días", "3 días", "5 días", "7 días", "15 días", "30 días"
                          ];
                          return (
                            <FormItem>
                              <FormLabel>Valor Medido</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-valor-medido">
                                    <SelectValue placeholder="Seleccione valor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {valoresComunes.map((v) => (
                                    <SelectItem key={v} value={v}>{v}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>Valor del resultado</FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="valorNumerico"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Numérico (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                value={field.value || ""}
                                placeholder="95"
                                data-testid="input-valor-numerico"
                              />
                            </FormControl>
                            <FormDescription>Para gráficas</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cumpleMeta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>¿Cumple Meta? (opcional)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))} value={field.value?.toString() || "none"}>
                              <FormControl>
                                <SelectTrigger data-testid="select-cumple-meta">
                                  <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No especificado</SelectItem>
                                <SelectItem value="1">Sí, cumple</SelectItem>
                                <SelectItem value="0">No cumple</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="desviacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desviación % (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                value={field.value || ""}
                                placeholder="-5 o +10"
                                data-testid="input-desviacion"
                              />
                            </FormControl>
                            <FormDescription>% respecto a la meta</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="analisis"
                      render={({ field }) => {
                        const sugerenciasAnalisis = [
                          "Cumplimiento sin desviaciones significativas",
                          "Desviación menor al 10% con tendencia estable",
                          "Desviación mayor al 10% con tendencia negativa",
                          "Se requiere análisis de causa raíz",
                          "Resultado afectado por factores externos",
                        ];
                        return (
                          <FormItem>
                            <FormLabel>Análisis del Resultado (opcional)</FormLabel>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {sugerenciasAnalisis.map((s, i) => (
                                <Badge 
                                  key={i} 
                                  variant="outline" 
                                  className="cursor-pointer text-xs"
                                  onClick={() => field.onChange(field.value ? `${field.value}. ${s}` : s)}
                                >
                                  + {s}
                                </Badge>
                              ))}
                            </div>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Análisis e interpretación del resultado obtenido..."
                                rows={3}
                                data-testid="input-analisis"
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="accionesCorrectivas"
                      render={({ field }) => {
                        const sugerenciasAcciones = [
                          "Actualizar Plan de Trabajo Anual",
                          "Implementar plan de mejora con responsable y plazo",
                          "Reforzar capacitación específica",
                          "Ajustar controles operativos existentes",
                          "Convocar COPASST para seguimiento",
                          "Informar a la alta dirección",
                        ];
                        return (
                          <FormItem>
                            <FormLabel>Acciones Correctivas (opcional)</FormLabel>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {sugerenciasAcciones.map((s, i) => (
                                <Badge 
                                  key={i} 
                                  variant="outline" 
                                  className="cursor-pointer text-xs"
                                  onClick={() => field.onChange(field.value ? `${field.value}. ${s}` : s)}
                                >
                                  + {s}
                                </Badge>
                              ))}
                            </div>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Acciones a tomar si no se cumplió la meta..."
                                rows={2}
                                data-testid="input-acciones"
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="responsableMedicion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable de la Medición (opcional)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-responsable-medicion" value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-medicion">
                        Guardar Medición
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          form.reset({
                            indicadorId: indicador.id,
                            periodo: "",
                            fechaMedicion: new Date(),
                            valorMedido: "",
                            valorNumerico: undefined,
                            cumpleMeta: undefined,
                            desviacion: undefined,
                            analisis: "",
                            accionesCorrectivas: "",
                            responsableMedicion: user?.fullName || user?.username || "",
                          });
                        }}
                        data-testid="button-cancel-medicion"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Tendencias */}
          {(() => {
            const chartData = mediciones
              .filter(m => m.valorNumerico !== null && m.valorNumerico !== undefined)
              .sort((a, b) => new Date(a.fechaMedicion).getTime() - new Date(b.fechaMedicion).getTime())
              .map(m => ({
                periodo: m.periodo,
                valor: m.valorNumerico,
                cumple: m.cumpleMeta === 1,
                meta: indicador.valorMeta ?? undefined
              }));
            
            if (chartData.length < 2) return null;
            
            return (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-blue-500" />
                    Tendencia del Indicador
                  </CardTitle>
                  {indicador.valorMeta !== null && indicador.valorMeta !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Meta: {indicador.valorMeta}{indicador.unidadMedida || '%'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="periodo" 
                        tick={{ fontSize: 12 }} 
                        className="fill-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        className="fill-muted-foreground"
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                        formatter={(value: number) => [`${value}${indicador.unidadMedida || '%'}`, 'Valor']}
                      />
                      <Legend />
                      {indicador.valorMeta !== null && indicador.valorMeta !== undefined && (
                        <ReferenceLine 
                          y={indicador.valorMeta} 
                          stroke="hsl(var(--primary))" 
                          strokeDasharray="5 5"
                          label={{ value: 'Meta', position: 'right', fontSize: 11, fill: 'hsl(var(--primary))' }}
                        />
                      )}
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        name="Valor Medido"
                        stroke="hsl(142, 76%, 36%)" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: "hsl(142, 76%, 36%)" }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            );
          })()}

          {/* Alertas de Incumplimiento */}
          {mediciones.some(m => m.cumpleMeta === 0) && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas de Indicador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mediciones
                    .filter(m => m.cumpleMeta === 0)
                    .slice(0, 3)
                    .map(m => (
                      <div 
                        key={m.id} 
                        className="flex items-start gap-3 p-3 bg-white dark:bg-gray-950 rounded-md border border-amber-200 dark:border-amber-800"
                      >
                        <Bell className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            No cumple meta en periodo {m.periodo}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            Valor: {m.valorMedido}
                            {m.desviacion !== null && (
                              <span className="ml-2">· Desviación: {m.desviacion}%</span>
                            )}
                          </p>
                          {m.accionesCorrectivas && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Acciones: {m.accionesCorrectivas}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  {mediciones.filter(m => m.cumpleMeta === 0).length > 3 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center pt-2">
                      + {mediciones.filter(m => m.cumpleMeta === 0).length - 3} alertas más
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de mediciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Mediciones</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando mediciones...</div>
              ) : mediciones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay mediciones registradas para este indicador</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Cumple</TableHead>
                        <TableHead>Desv. %</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mediciones.map((medicion) => (
                        <TableRow key={medicion.id} data-testid={`row-medicion-${medicion.id}`}>
                          <TableCell className="font-medium">{medicion.periodo}</TableCell>
                          <TableCell>{format(new Date(medicion.fechaMedicion), "dd/MMM/yyyy", { locale: es })}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{medicion.valorMedido}</div>
                              {medicion.valorNumerico !== null && (
                                <div className="text-xs text-muted-foreground">({medicion.valorNumerico})</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getCumpleBadge(medicion.cumpleMeta)}</TableCell>
                          <TableCell>
                            {medicion.desviacion !== null ? (
                              <span className={medicion.desviacion >= 0 ? "text-green-600" : "text-red-600"}>
                                {medicion.desviacion > 0 ? "+" : ""}{medicion.desviacion}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{medicion.responsableMedicion || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(medicion.id)}
                              data-testid={`button-delete-medicion-${medicion.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para control de avance inline (Add-Only - Decreto 1072/2015 Art. 2.2.4.6.19)
function AvanceControl({ 
  objetivo, 
  onSave, 
  isPending 
}: { 
  objetivo: ObjetivoSst; 
  onSave: (porcentaje: number) => void;
  isPending: boolean;
}) {
  const [localValue, setLocalValue] = useState<number>(objetivo.porcentajeAvance ?? 0);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar cuando el valor del objetivo cambie externamente
  useEffect(() => {
    setLocalValue(objetivo.porcentajeAvance ?? 0);
    setHasChanges(false);
  }, [objetivo.porcentajeAvance]);

  const handleSliderChange = (value: number[]) => {
    setLocalValue(value[0]);
    setHasChanges(value[0] !== (objetivo.porcentajeAvance ?? 0));
  };

  const handleSave = () => {
    onSave(localValue);
    setHasChanges(false);
  };

  // Color dinámico basado en el porcentaje
  const getProgressColor = (value: number) => {
    if (value >= 100) return "text-green-600";
    if (value >= 75) return "text-blue-600";
    if (value >= 50) return "text-yellow-600";
    if (value >= 25) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-2 pt-2 border-t border-dashed" data-testid={`avance-control-${objetivo.id}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">Avance:</span>
          <span className={`text-lg font-bold ${getProgressColor(localValue)}`}>
            {localValue}%
          </span>
        </div>
        {hasChanges && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="h-7 text-purple-600 border-purple-300 hover:bg-purple-50"
            data-testid={`button-save-avance-${objetivo.id}`}
          >
            <Save className="h-3 w-3 mr-1" />
            {isPending ? "..." : "Guardar"}
          </Button>
        )}
      </div>
      <Slider
        value={[localValue]}
        onValueChange={handleSliderChange}
        min={0}
        max={100}
        step={5}
        className="w-full"
        data-testid={`slider-avance-${objetivo.id}`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ============================================================================
// TRAZABILIDAD OBJETIVOS-ESTÁNDARES SST
// Componente para vincular estándares con objetivos (Add-Only - Principio de No Modificación)
// Decreto 1072/2015 + Resolución 0312/2019
// ============================================================================

interface EstandarSst {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  capitulo?: string;
  valor?: number;
}

interface Vinculacion {
  id: string;
  objetivoId: string;
  estandarId: string;
  pesoRelativo: number;
  createdAt?: string;
}

interface VinculacionConCumplimiento {
  vinculacion: Vinculacion;
  estandar: EstandarSst | null;
  cumple: number | null;
}

function EstandardesVinculadosControl({
  objetivo,
  evaluacionId: propEvaluacionId,
  onAvanceUpdate
}: {
  objetivo: ObjetivoSst;
  evaluacionId?: string;
  onAvanceUpdate?: (avance: number) => void;
}) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEstandarId, setSelectedEstandarId] = useState<string>("");
  const [pesoRelativo, setPesoRelativo] = useState<number>(1);

  // Query para obtener la última evaluación de la empresa si no se proporciona una
  const { data: evaluaciones = [] } = useQuery<Array<{ id: string; fechaEvaluacion?: string; createdAt?: string }>>({
    queryKey: ['/api/evaluaciones-sst'],
    enabled: !propEvaluacionId,
  });
  
  // Ordenar por fecha (más reciente primero) y usar la primera
  const sortedEvaluaciones = [...evaluaciones].sort((a, b) => {
    const dateA = new Date(a.fechaEvaluacion || a.createdAt || 0).getTime();
    const dateB = new Date(b.fechaEvaluacion || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  const evaluacionId = propEvaluacionId || (sortedEvaluaciones.length > 0 ? sortedEvaluaciones[0]?.id : undefined);

  // Query para obtener vinculaciones del objetivo
  const { data: vinculaciones = [], isLoading: isLoadingVinculaciones, refetch: refetchVinculaciones } = useQuery<Vinculacion[]>({
    queryKey: ['/api/objetivos-estandares-vinculacion/objetivo', objetivo.id],
    enabled: true,
  });

  // Query para obtener vinculaciones con cumplimiento (si hay evaluación)
  const { data: vinculacionesConCumplimiento = [], refetch: refetchConCumplimiento } = useQuery<VinculacionConCumplimiento[]>({
    queryKey: ['/api/objetivos-estandares-vinculacion/objetivo', objetivo.id, 'cumplimiento', evaluacionId],
    enabled: !!evaluacionId && vinculaciones.length > 0,
  });

  // Query para obtener todos los estándares disponibles
  const { data: estandares = [] } = useQuery<EstandarSst[]>({
    queryKey: ['/api/estandares-sst'],
  });

  // Mutation para crear vinculación
  const createVinculacion = useMutation({
    mutationFn: async (data: { objetivoId: string; estandarId: string; pesoRelativo: number }) => {
      const res = await apiRequest("POST", '/api/objetivos-estandares-vinculacion', data);
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: "Éxito", description: "Estándar vinculado correctamente" });
      await queryClient.invalidateQueries({ queryKey: ['/api/objetivos-estandares-vinculacion/objetivo', objetivo.id] });
      setSelectedEstandarId("");
      setPesoRelativo(1);
      // Actualizar avance automáticamente
      if (evaluacionId) {
        setTimeout(() => aplicarAvanceAutomatico(), 500);
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al vincular estándar", variant: "destructive" });
    }
  });

  // Mutation para eliminar vinculación
  const deleteVinculacion = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/objetivos-estandares-vinculacion/${id}`);
    },
    onSuccess: async () => {
      toast({ title: "Éxito", description: "Vinculación eliminada" });
      await queryClient.invalidateQueries({ queryKey: ['/api/objetivos-estandares-vinculacion/objetivo', objetivo.id] });
      // Actualizar avance automáticamente
      if (evaluacionId) {
        setTimeout(() => aplicarAvanceAutomatico(), 500);
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al eliminar vinculación", variant: "destructive" });
    }
  });

  // Función para aplicar avance automáticamente (sin toast para uso automático)
  const aplicarAvanceAutomatico = async () => {
    if (!evaluacionId) return;
    try {
      const res = await apiRequest("POST", `/api/objetivos-estandares-vinculacion/aplicar-avance/${objetivo.id}/${evaluacionId}`);
      const data = await res.json();
      if (onAvanceUpdate) {
        onAvanceUpdate(data.avance);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/objetivos-sst'] });
    } catch (error) {
      console.error("Error auto-updating avance:", error);
    }
  };

  // Mutation para calcular y aplicar avance (manual)
  const aplicarAvance = useMutation({
    mutationFn: async (): Promise<{ avance: number }> => {
      if (!evaluacionId) throw new Error("Se requiere una evaluación para calcular el avance");
      const res = await apiRequest("POST", `/api/objetivos-estandares-vinculacion/aplicar-avance/${objetivo.id}/${evaluacionId}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Avance Actualizado", 
        description: `El avance se ha calculado automáticamente: ${data.avance}%` 
      });
      if (onAvanceUpdate) {
        onAvanceUpdate(data.avance);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/objetivos-sst'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Error al calcular avance", variant: "destructive" });
    }
  });

  // Estándares ya vinculados (para filtrar del selector)
  const estandaresVinculadosIds = vinculaciones.map(v => v.estandarId);
  const estandaresDisponibles = estandares.filter(e => !estandaresVinculadosIds.includes(e.id));

  const handleAddVinculacion = () => {
    if (!selectedEstandarId) return;
    createVinculacion.mutate({
      objetivoId: objetivo.id,
      estandarId: selectedEstandarId,
      pesoRelativo: pesoRelativo
    });
  };

  // Calcular cumplimiento promedio para mostrar indicador
  const calcularCumplimientoPromedio = () => {
    if (vinculacionesConCumplimiento.length === 0) return null;
    let totalPeso = 0;
    let sumaCumplimiento = 0;
    for (const vc of vinculacionesConCumplimiento) {
      if (vc.cumple !== null) {
        const peso = vc.vinculacion.pesoRelativo || 1;
        totalPeso += peso;
        sumaCumplimiento += (vc.cumple * 100) * peso;
      }
    }
    if (totalPeso === 0) return null;
    return Math.round(sumaCumplimiento / totalPeso);
  };

  const cumplimientoPromedio = calcularCumplimientoPromedio();

  return (
    <div className="space-y-2 pt-2 border-t border-dashed border-blue-200" data-testid={`estandares-control-${objetivo.id}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Estándares Vinculados:</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {vinculaciones.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="h-7 text-blue-600 border-blue-300 hover:bg-blue-50"
          data-testid={`button-vincular-estandares-${objetivo.id}`}
        >
          <Link2 className="h-3 w-3 mr-1" />
          Vincular
        </Button>
      </div>

      {/* Indicador de cumplimiento si hay evaluación */}
      {evaluacionId && cumplimientoPromedio !== null && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Cumplimiento estándares:</span>
            <span className={`font-bold ${cumplimientoPromedio >= 80 ? 'text-green-600' : cumplimientoPromedio >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {cumplimientoPromedio}%
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => aplicarAvance.mutate()}
            disabled={aplicarAvance.isPending}
            data-testid={`button-aplicar-avance-${objetivo.id}`}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${aplicarAvance.isPending ? 'animate-spin' : ''}`} />
            Aplicar Avance
          </Button>
        </div>
      )}

      {/* Lista de estándares vinculados (compacta) */}
      {vinculaciones.length > 0 && (
        <div className="space-y-1">
          {vinculacionesConCumplimiento.length > 0 ? (
            vinculacionesConCumplimiento.slice(0, 3).map((vc) => (
              <div key={vc.vinculacion.id} className="flex items-center justify-between text-xs p-1 bg-gray-50 rounded">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {vc.cumple === 1 ? (
                    <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : vc.cumple === 0 ? (
                    <X className="h-3 w-3 text-red-600 flex-shrink-0" />
                  ) : (
                    <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="truncate text-muted-foreground">
                    {vc.estandar?.codigo || 'N/A'} - {vc.estandar?.nombre?.substring(0, 40)}...
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] ml-1">
                  Peso: {vc.vinculacion.pesoRelativo}
                </Badge>
              </div>
            ))
          ) : (
            vinculaciones.slice(0, 3).map((v) => {
              const estandar = estandares.find(e => e.id === v.estandarId);
              return (
                <div key={v.id} className="flex items-center justify-between text-xs p-1 bg-gray-50 rounded">
                  <span className="truncate text-muted-foreground flex-1">
                    {estandar?.codigo || 'N/A'} - {estandar?.nombre?.substring(0, 40) || 'Cargando...'}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Peso: {v.pesoRelativo}
                  </Badge>
                </div>
              );
            })
          )}
          {vinculaciones.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{vinculaciones.length - 3} más...
            </div>
          )}
        </div>
      )}

      {/* Dialog para gestionar vinculaciones */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-600" />
              Vincular Estándares con Objetivo
            </DialogTitle>
            <DialogDescription>
              Vincule estándares de la Resolución 0312/2019 para calcular automáticamente el avance del objetivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Formulario para agregar vinculación */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Vinculación
              </h4>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7">
                  <Select value={selectedEstandarId} onValueChange={setSelectedEstandarId}>
                    <SelectTrigger data-testid="select-estandar">
                      <SelectValue placeholder="Seleccionar estándar..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {estandaresDisponibles.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          <span className="text-xs">{e.codigo} - {e.nombre?.substring(0, 50)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select value={String(pesoRelativo)} onValueChange={(v) => setPesoRelativo(Number(v))}>
                    <SelectTrigger data-testid="select-peso">
                      <SelectValue placeholder="Peso" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          Peso {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Button
                    variant="default"
                    onClick={handleAddVinculacion}
                    disabled={!selectedEstandarId || createVinculacion.isPending}
                    className="w-full"
                    data-testid="button-agregar-vinculacion"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de vinculaciones existentes */}
            {vinculaciones.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Estándar</TableHead>
                      <TableHead className="text-center">Peso</TableHead>
                      {evaluacionId && <TableHead className="text-center">Cumple</TableHead>}
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vinculaciones.map((v) => {
                      const estandar = estandares.find(e => e.id === v.estandarId);
                      const vc = vinculacionesConCumplimiento.find(vcc => vcc.vinculacion.id === v.id);
                      return (
                        <TableRow key={v.id}>
                          <TableCell className="font-mono text-xs">
                            {estandar?.codigo || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {estandar?.nombre || 'Cargando...'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{v.pesoRelativo}</Badge>
                          </TableCell>
                          {evaluacionId && (
                            <TableCell className="text-center">
                              {vc?.cumple === 1 ? (
                                <Badge className="bg-green-100 text-green-700">Sí</Badge>
                              ) : vc?.cumple === 0 ? (
                                <Badge className="bg-red-100 text-red-700">No</Badge>
                              ) : (
                                <Badge variant="outline">N/E</Badge>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteVinculacion.mutate(v.id)}
                              disabled={deleteVinculacion.isPending}
                              className="text-destructive"
                              data-testid={`button-delete-vinculacion-${v.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {vinculaciones.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No hay estándares vinculados a este objetivo.</p>
                <p className="text-sm">Agregue estándares para calcular el avance automáticamente.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
