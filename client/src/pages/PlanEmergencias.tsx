import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Shield, Users, AlertTriangle, Package, Calendar, MapPin, FileText, CheckCircle2, Clock, Edit2, Trash2, Eye, Route, Target, Sparkles, Info } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  PlanEmergencia, insertPlanEmergenciaSchema,
  BrigadaEmergencia, insertBrigadaEmergenciaSchema,
  MiembroBrigada, insertMiembroBrigadaSchema,
  AnalisisVulnerabilidad, insertAnalisisVulnerabilidadSchema,
  RecursoEmergencia, insertRecursoEmergenciaSchema,
  InspeccionRecursoEmergencia, insertInspeccionRecursoEmergenciaSchema,
  Simulacro, insertSimulacroSchema,
  ParticipanteSimulacro, insertParticipanteSimulacroSchema,
  ZonaEvacuacion, insertZonaEvacuacionSchema,
  RutaEvacuacion, insertRutaEvacuacionSchema,
  PuntoEncuentro, insertPuntoEncuentroSchema,
  Company, Worker
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import {
  TIPOS_PLANES_EMERGENCIA, TIPOS_BRIGADAS, CATEGORIAS_AMENAZAS, TIPOS_AMENAZAS,
  METODOLOGIAS_VULNERABILIDAD, TIPOS_RECURSOS_EMERGENCIA, TIPOS_SIMULACROS,
  ROLES_SIMULACRO, TIPOS_ZONAS_EVACUACION, TIPOS_RUTAS_EVACUACION,
  TIPOS_PUNTOS_ENCUENTRO,
  generarCodigoPlan, generarNombrePlan,
  generarCodigoRecurso, generarCodigoSimulacro, generarCodigoZona,
  generarCodigoRuta, generarCodigoPuntoEncuentro, getAmenazasPorCategoria,
  TipoPlan, TipoBrigada, TipoAmenaza, TipoSimulacro, TipoRecurso,
  TipoZona, TipoRutaEvacuacion, TipoPuntoEncuentro
} from "@/data/plan-emergencias-automatizacion";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { useSearch } from "wouter";

const normativaPlanEmergencias = [
  {
    codigo: 'DEC-1072-2.2.4.6.25',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.25',
    descripcion: 'Plan de prevención, preparación y respuesta ante emergencias',
    requisitos: [
      'Identificación de amenazas y vulnerabilidades',
      'Análisis de riesgos de emergencia',
      'Procedimientos de respuesta',
      'Recursos para atención de emergencias',
      'Simulacros periódicos'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-2.5.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 2.5.1',
    descripcion: 'Plan de emergencias implementado',
    requisitos: [
      'Plan de emergencias documentado',
      'Brigadas de emergencia conformadas',
      'Equipos de emergencia disponibles',
      'Rutas de evacuación señalizadas'
    ],
    obligatorio: true
  }
];

const planFormSchema = insertPlanEmergenciaSchema.extend({
  companyId: z.string().optional(),
});

const brigadaFormSchema = insertBrigadaEmergenciaSchema.extend({
  companyId: z.string().optional(),
});

const miembroFormSchema = insertMiembroBrigadaSchema;

const analisisFormSchema = insertAnalisisVulnerabilidadSchema.extend({
  companyId: z.string().optional(),
});

const recursoFormSchema = insertRecursoEmergenciaSchema.extend({
  companyId: z.string().optional(),
});

const inspeccionRecursoFormSchema = insertInspeccionRecursoEmergenciaSchema;

const simulacroFormSchema = insertSimulacroSchema.extend({
  companyId: z.string().optional(),
});

const participanteFormSchema = insertParticipanteSimulacroSchema;

const zonaFormSchema = insertZonaEvacuacionSchema.extend({
  companyId: z.string().optional(),
});

const rutaFormSchema = insertRutaEvacuacionSchema.extend({
  companyId: z.string().optional(),
});

const puntoFormSchema = insertPuntoEncuentroSchema.extend({
  companyId: z.string().optional(),
});

export default function PlanEmergencias() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tabFromUrl = searchParams.get("tab");
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  
  const validTabs = ["planes", "brigadas", "analisis", "recursos", "simulacros", "evacuacion"];
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "planes";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [planSearchTerm, setPlanSearchTerm] = useState("");
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanEmergencia | null>(null);
  
  const [brigadaSearchTerm, setBrigadaSearchTerm] = useState("");
  const [brigadaDialogOpen, setBrigadaDialogOpen] = useState(false);
  const [editingBrigada, setEditingBrigada] = useState<BrigadaEmergencia | null>(null);
  const [selectedBrigadaId, setSelectedBrigadaId] = useState<string | null>(null);
  const [miembroDialogOpen, setMiembroDialogOpen] = useState(false);
  
  const [analisisSearchTerm, setAnalisisSearchTerm] = useState("");
  const [analisisDialogOpen, setAnalisisDialogOpen] = useState(false);
  const [editingAnalisis, setEditingAnalisis] = useState<AnalisisVulnerabilidad | null>(null);
  
  const [recursoSearchTerm, setRecursoSearchTerm] = useState("");
  const [recursoDialogOpen, setRecursoDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<RecursoEmergencia | null>(null);
  const [selectedRecursoId, setSelectedRecursoId] = useState<string | null>(null);
  const [inspeccionDialogOpen, setInspeccionDialogOpen] = useState(false);
  
  const [simulacroSearchTerm, setSimulacroSearchTerm] = useState("");
  const [simulacroDialogOpen, setSimulacroDialogOpen] = useState(false);
  const [editingSimulacro, setEditingSimulacro] = useState<Simulacro | null>(null);
  const [selectedSimulacroId, setSelectedSimulacroId] = useState<string | null>(null);
  const [participanteDialogOpen, setParticipanteDialogOpen] = useState(false);
  
  const [zonaSearchTerm, setZonaSearchTerm] = useState("");
  const [zonaDialogOpen, setZonaDialogOpen] = useState(false);
  const [editingZona, setEditingZona] = useState<ZonaEvacuacion | null>(null);
  
  const [rutaDialogOpen, setRutaDialogOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<RutaEvacuacion | null>(null);
  
  const [puntoDialogOpen, setPuntoDialogOpen] = useState(false);
  const [editingPunto, setEditingPunto] = useState<PuntoEncuentro | null>(null);

  const [tipoPlanSeleccionado, setTipoPlanSeleccionado] = useState<TipoPlan | null>(null);
  const [tipoBrigadaSeleccionado, setTipoBrigadaSeleccionado] = useState<TipoBrigada | null>(null);
  const [categoriaAmenazaSeleccionada, setCategoriaAmenazaSeleccionada] = useState<string>("");
  const [tipoAmenazaSeleccionado, setTipoAmenazaSeleccionado] = useState<TipoAmenaza | null>(null);
  const [tipoRecursoSeleccionado, setTipoRecursoSeleccionado] = useState<TipoRecurso | null>(null);
  const [tipoSimulacroSeleccionado, setTipoSimulacroSeleccionado] = useState<TipoSimulacro | null>(null);
  const [tipoZonaSeleccionado, setTipoZonaSeleccionado] = useState<TipoZona | null>(null);
  const [tipoRutaSeleccionado, setTipoRutaSeleccionado] = useState<TipoRutaEvacuacion | null>(null);
  const [tipoPuntoSeleccionado, setTipoPuntoSeleccionado] = useState<TipoPuntoEncuentro | null>(null);

  const amenazasFiltradas = categoriaAmenazaSeleccionada 
    ? getAmenazasPorCategoria(categoriaAmenazaSeleccionada) 
    : TIPOS_AMENAZAS;

  const planForm = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      nombre: "",
      version: "1.0",
      estado: "borrador",
      fechaElaboracion: new Date(),
      elaboradoPor: user?.fullName || "",
      alcance: "",
      objetivoGeneral: "",
    },
  });

  const brigadaForm = useForm<z.infer<typeof brigadaFormSchema>>({
    resolver: zodResolver(brigadaFormSchema),
    defaultValues: {
      companyId: "",
      nombre: "",
      tipo: "integral",
      descripcion: "",
      funcionesAntes: "",
      funcionesDurante: "",
      funcionesDespues: "",
      equipamientoAsignado: "",
      activa: 1,
    },
  });

  const miembroForm = useForm<z.infer<typeof miembroFormSchema>>({
    resolver: zodResolver(miembroFormSchema),
    defaultValues: {
      brigadaId: "",
      workerId: "",
      rol: "brigadista",
      fechaIngreso: new Date(),
      activo: 1,
    },
  });

  const analisisForm = useForm<z.infer<typeof analisisFormSchema>>({
    resolver: zodResolver(analisisFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      fechaAnalisis: new Date(),
      realizadoPor: user?.fullName || "",
      metodologia: "diamante",
    },
  });

  const recursoForm = useForm<z.infer<typeof recursoFormSchema>>({
    resolver: zodResolver(recursoFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      tipo: "extintor",
      nombre: "",
      ubicacion: "",
      estado: "operativo",
    },
  });

  const inspeccionRecursoForm = useForm<z.infer<typeof inspeccionRecursoFormSchema>>({
    resolver: zodResolver(inspeccionRecursoFormSchema),
    defaultValues: {
      recursoId: "",
      fechaInspeccion: new Date(),
      inspectorNombre: user?.fullName || "",
      estadoEncontrado: "operativo",
      cumpleNormativa: 1,
    },
  });

  const simulacroForm = useForm<z.infer<typeof simulacroFormSchema>>({
    resolver: zodResolver(simulacroFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      nombre: "",
      tipo: "evacuacion",
      fechaProgramada: new Date(),
      estado: "programado",
      avisado: 1,
      coordinadorNombre: user?.fullName || "",
    },
  });

  const participanteForm = useForm<z.infer<typeof participanteFormSchema>>({
    resolver: zodResolver(participanteFormSchema),
    defaultValues: {
      simulacroId: "",
      workerId: "",
      rolSimulacro: "evacuado",
    },
  });

  const zonaForm = useForm<z.infer<typeof zonaFormSchema>>({
    resolver: zodResolver(zonaFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      nombre: "",
      activa: 1,
    },
  });

  const rutaForm = useForm<z.infer<typeof rutaFormSchema>>({
    resolver: zodResolver(rutaFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      nombre: "",
      puntoInicio: "",
      puntoFin: "",
      rutaPrincipal: 1,
      activa: 1,
    },
  });

  const puntoForm = useForm<z.infer<typeof puntoFormSchema>>({
    resolver: zodResolver(puntoFormSchema),
    defaultValues: {
      companyId: "",
      codigo: "",
      nombre: "",
      ubicacion: "",
      puntoPrincipal: 1,
      activo: 1,
    },
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: planes = [], isLoading: planesLoading } = useQuery<PlanEmergencia[]>({
    queryKey: ["/api/planes-emergencia"],
  });

  const { data: brigadas = [], isLoading: brigadasLoading } = useQuery<BrigadaEmergencia[]>({
    queryKey: ["/api/brigadas-emergencia"],
  });

  const { data: miembros = [] } = useQuery<MiembroBrigada[]>({
    queryKey: ["/api/miembros-brigada", selectedBrigadaId],
    enabled: !!selectedBrigadaId,
  });

  const { data: analisis = [], isLoading: analisisLoading } = useQuery<AnalisisVulnerabilidad[]>({
    queryKey: ["/api/analisis-vulnerabilidad"],
  });

  const { data: recursos = [], isLoading: recursosLoading } = useQuery<RecursoEmergencia[]>({
    queryKey: ["/api/recursos-emergencia"],
  });

  const { data: inspeccionesRecurso = [] } = useQuery<InspeccionRecursoEmergencia[]>({
    queryKey: ["/api/inspecciones-recursos-emergencia", selectedRecursoId],
    enabled: !!selectedRecursoId,
  });

  const { data: simulacros = [], isLoading: simulacrosLoading } = useQuery<Simulacro[]>({
    queryKey: ["/api/simulacros"],
  });

  const { data: participantes = [] } = useQuery<ParticipanteSimulacro[]>({
    queryKey: ["/api/participantes-simulacro", selectedSimulacroId],
    enabled: !!selectedSimulacroId,
  });

  const { data: zonas = [], isLoading: zonasLoading } = useQuery<ZonaEvacuacion[]>({
    queryKey: ["/api/zonas-evacuacion"],
  });

  const { data: rutas = [] } = useQuery<RutaEvacuacion[]>({
    queryKey: ["/api/rutas-evacuacion"],
  });

  const { data: puntos = [] } = useQuery<PuntoEncuentro[]>({
    queryKey: ["/api/puntos-encuentro"],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof planFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/planes-emergencia", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-emergencia"] });
      setPlanDialogOpen(false);
      planForm.reset();
      setEditingPlan(null);
      toast({ title: "Plan creado", description: "El plan de emergencias se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof planFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/planes-emergencia/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-emergencia"] });
      setPlanDialogOpen(false);
      planForm.reset();
      setEditingPlan(null);
      toast({ title: "Plan actualizado", description: "El plan de emergencias se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/planes-emergencia/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-emergencia"] });
      toast({ title: "Plan eliminado", description: "El plan de emergencias se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createBrigadaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof brigadaFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/brigadas-emergencia", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brigadas-emergencia"] });
      setBrigadaDialogOpen(false);
      brigadaForm.reset();
      setEditingBrigada(null);
      toast({ title: "Brigada creada", description: "La brigada de emergencia se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateBrigadaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof brigadaFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/brigadas-emergencia/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brigadas-emergencia"] });
      setBrigadaDialogOpen(false);
      brigadaForm.reset();
      setEditingBrigada(null);
      toast({ title: "Brigada actualizada", description: "La brigada de emergencia se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBrigadaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/brigadas-emergencia/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brigadas-emergencia"] });
      toast({ title: "Brigada eliminada", description: "La brigada de emergencia se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createMiembroMutation = useMutation({
    mutationFn: async (data: z.infer<typeof miembroFormSchema>) => {
      const res = await apiRequest("POST", "/api/miembros-brigada", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/miembros-brigada", selectedBrigadaId] });
      setMiembroDialogOpen(false);
      miembroForm.reset();
      toast({ title: "Miembro agregado", description: "El miembro se ha agregado a la brigada exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMiembroMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/miembros-brigada/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/miembros-brigada", selectedBrigadaId] });
      toast({ title: "Miembro eliminado", description: "El miembro se ha eliminado de la brigada exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createAnalisisMutation = useMutation({
    mutationFn: async (data: z.infer<typeof analisisFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/analisis-vulnerabilidad", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analisis-vulnerabilidad"] });
      setAnalisisDialogOpen(false);
      analisisForm.reset();
      setEditingAnalisis(null);
      toast({ title: "Análisis creado", description: "El análisis de vulnerabilidad se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAnalisisMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof analisisFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/analisis-vulnerabilidad/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analisis-vulnerabilidad"] });
      setAnalisisDialogOpen(false);
      analisisForm.reset();
      setEditingAnalisis(null);
      toast({ title: "Análisis actualizado", description: "El análisis de vulnerabilidad se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAnalisisMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/analisis-vulnerabilidad/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analisis-vulnerabilidad"] });
      toast({ title: "Análisis eliminado", description: "El análisis de vulnerabilidad se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createRecursoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recursoFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/recursos-emergencia", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recursos-emergencia"] });
      setRecursoDialogOpen(false);
      recursoForm.reset();
      setEditingRecurso(null);
      toast({ title: "Recurso creado", description: "El recurso de emergencia se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRecursoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof recursoFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/recursos-emergencia/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recursos-emergencia"] });
      setRecursoDialogOpen(false);
      recursoForm.reset();
      setEditingRecurso(null);
      toast({ title: "Recurso actualizado", description: "El recurso de emergencia se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteRecursoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/recursos-emergencia/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recursos-emergencia"] });
      toast({ title: "Recurso eliminado", description: "El recurso de emergencia se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createInspeccionRecursoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inspeccionRecursoFormSchema>) => {
      const res = await apiRequest("POST", "/api/inspecciones-recursos-emergencia", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspecciones-recursos-emergencia", selectedRecursoId] });
      queryClient.invalidateQueries({ queryKey: ["/api/recursos-emergencia"] });
      setInspeccionDialogOpen(false);
      inspeccionRecursoForm.reset();
      toast({ title: "Inspección registrada", description: "La inspección del recurso se ha registrado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createSimulacroMutation = useMutation({
    mutationFn: async (data: z.infer<typeof simulacroFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/simulacros", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulacros"] });
      setSimulacroDialogOpen(false);
      simulacroForm.reset();
      setEditingSimulacro(null);
      toast({ title: "Simulacro creado", description: "El simulacro de emergencia se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSimulacroMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof simulacroFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/simulacros/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulacros"] });
      setSimulacroDialogOpen(false);
      simulacroForm.reset();
      setEditingSimulacro(null);
      toast({ title: "Simulacro actualizado", description: "El simulacro de emergencia se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSimulacroMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/simulacros/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulacros"] });
      toast({ title: "Simulacro eliminado", description: "El simulacro de emergencia se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createParticipanteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof participanteFormSchema>) => {
      const res = await apiRequest("POST", "/api/participantes-simulacro", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participantes-simulacro", selectedSimulacroId] });
      setParticipanteDialogOpen(false);
      participanteForm.reset();
      toast({ title: "Participante agregado", description: "El participante se ha agregado al simulacro exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteParticipanteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/participantes-simulacro/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participantes-simulacro", selectedSimulacroId] });
      toast({ title: "Participante eliminado", description: "El participante se ha eliminado del simulacro exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createZonaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof zonaFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/zonas-evacuacion", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zonas-evacuacion"] });
      setZonaDialogOpen(false);
      zonaForm.reset();
      setEditingZona(null);
      toast({ title: "Zona creada", description: "La zona de evacuación se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateZonaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof zonaFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/zonas-evacuacion/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zonas-evacuacion"] });
      setZonaDialogOpen(false);
      zonaForm.reset();
      setEditingZona(null);
      toast({ title: "Zona actualizada", description: "La zona de evacuación se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteZonaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/zonas-evacuacion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zonas-evacuacion"] });
      toast({ title: "Zona eliminada", description: "La zona de evacuación se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createRutaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rutaFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/rutas-evacuacion", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rutas-evacuacion"] });
      setRutaDialogOpen(false);
      rutaForm.reset();
      setEditingRuta(null);
      toast({ title: "Ruta creada", description: "La ruta de evacuación se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRutaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof rutaFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/rutas-evacuacion/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rutas-evacuacion"] });
      setRutaDialogOpen(false);
      rutaForm.reset();
      setEditingRuta(null);
      toast({ title: "Ruta actualizada", description: "La ruta de evacuación se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteRutaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/rutas-evacuacion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rutas-evacuacion"] });
      toast({ title: "Ruta eliminada", description: "La ruta de evacuación se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createPuntoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof puntoFormSchema>) => {
      const payload = isAdmin && data.companyId ? data : { ...data, companyId: undefined };
      const res = await apiRequest("POST", "/api/puntos-encuentro", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/puntos-encuentro"] });
      setPuntoDialogOpen(false);
      puntoForm.reset();
      setEditingPunto(null);
      toast({ title: "Punto creado", description: "El punto de encuentro se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePuntoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof puntoFormSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/puntos-encuentro/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/puntos-encuentro"] });
      setPuntoDialogOpen(false);
      puntoForm.reset();
      setEditingPunto(null);
      toast({ title: "Punto actualizado", description: "El punto de encuentro se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePuntoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/puntos-encuentro/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/puntos-encuentro"] });
      toast({ title: "Punto eliminado", description: "El punto de encuentro se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openEditPlan = (plan: PlanEmergencia) => {
    setEditingPlan(plan);
    planForm.reset({
      companyId: plan.companyId || "",
      codigo: plan.codigo,
      nombre: plan.nombre,
      version: plan.version,
      estado: plan.estado,
      fechaElaboracion: plan.fechaElaboracion ? new Date(plan.fechaElaboracion) : new Date(),
      elaboradoPor: plan.elaboradoPor || "",
      alcance: plan.alcance || "",
      objetivoGeneral: plan.objetivoGeneral || "",
    });
    setPlanDialogOpen(true);
  };

  const openEditBrigada = (brigada: BrigadaEmergencia) => {
    setEditingBrigada(brigada);
    brigadaForm.reset({
      companyId: brigada.companyId || "",
      nombre: brigada.nombre,
      tipo: brigada.tipo,
      descripcion: brigada.descripcion || "",
      funcionesAntes: brigada.funcionesAntes || "",
      funcionesDurante: brigada.funcionesDurante || "",
      funcionesDespues: brigada.funcionesDespues || "",
      equipamientoAsignado: brigada.equipamientoAsignado || "",
      activa: brigada.activa,
    });
    setBrigadaDialogOpen(true);
  };

  const openEditAnalisis = (item: AnalisisVulnerabilidad) => {
    setEditingAnalisis(item);
    analisisForm.reset({
      companyId: item.companyId || "",
      codigo: item.codigo,
      fechaAnalisis: item.fechaAnalisis ? new Date(item.fechaAnalisis) : new Date(),
      realizadoPor: item.realizadoPor,
      metodologia: item.metodologia || "diamante",
    });
    setAnalisisDialogOpen(true);
  };

  const openEditRecurso = (recurso: RecursoEmergencia) => {
    setEditingRecurso(recurso);
    recursoForm.reset({
      companyId: recurso.companyId || "",
      codigo: recurso.codigo,
      tipo: recurso.tipo,
      nombre: recurso.nombre,
      ubicacion: recurso.ubicacion,
      estado: recurso.estado,
    });
    setRecursoDialogOpen(true);
  };

  const openEditSimulacro = (simulacro: Simulacro) => {
    setEditingSimulacro(simulacro);
    simulacroForm.reset({
      companyId: simulacro.companyId || "",
      codigo: simulacro.codigo,
      nombre: simulacro.nombre,
      tipo: simulacro.tipo,
      fechaProgramada: simulacro.fechaProgramada ? new Date(simulacro.fechaProgramada) : new Date(),
      estado: simulacro.estado,
      avisado: simulacro.avisado ?? 1,
      coordinadorNombre: simulacro.coordinadorNombre || "",
    });
    setSimulacroDialogOpen(true);
  };

  const openEditZona = (zona: ZonaEvacuacion) => {
    setEditingZona(zona);
    zonaForm.reset({
      companyId: zona.companyId || "",
      codigo: zona.codigo,
      nombre: zona.nombre,
      activa: zona.activa,
    });
    setZonaDialogOpen(true);
  };

  const openEditRuta = (ruta: RutaEvacuacion) => {
    setEditingRuta(ruta);
    rutaForm.reset({
      companyId: ruta.companyId || "",
      codigo: ruta.codigo,
      nombre: ruta.nombre,
      puntoInicio: ruta.puntoInicio,
      puntoFin: ruta.puntoFin,
      rutaPrincipal: ruta.rutaPrincipal ?? 1,
      activa: ruta.activa,
    });
    setRutaDialogOpen(true);
  };

  const openEditPunto = (punto: PuntoEncuentro) => {
    setEditingPunto(punto);
    puntoForm.reset({
      companyId: punto.companyId || "",
      codigo: punto.codigo,
      nombre: punto.nombre,
      ubicacion: punto.ubicacion,
      puntoPrincipal: punto.puntoPrincipal ?? 1,
      activo: punto.activo,
    });
    setPuntoDialogOpen(true);
  };

  const onSubmitPlan = (values: z.infer<typeof planFormSchema>) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: values });
    } else {
      createPlanMutation.mutate(values);
    }
  };

  const onSubmitBrigada = (values: z.infer<typeof brigadaFormSchema>) => {
    if (editingBrigada) {
      updateBrigadaMutation.mutate({ id: editingBrigada.id, data: values });
    } else {
      createBrigadaMutation.mutate(values);
    }
  };

  const onSubmitMiembro = (values: z.infer<typeof miembroFormSchema>) => {
    createMiembroMutation.mutate({ ...values, brigadaId: selectedBrigadaId! });
  };

  const onSubmitAnalisis = (values: z.infer<typeof analisisFormSchema>) => {
    if (editingAnalisis) {
      updateAnalisisMutation.mutate({ id: editingAnalisis.id, data: values });
    } else {
      createAnalisisMutation.mutate(values);
    }
  };

  const onSubmitRecurso = (values: z.infer<typeof recursoFormSchema>) => {
    if (editingRecurso) {
      updateRecursoMutation.mutate({ id: editingRecurso.id, data: values });
    } else {
      createRecursoMutation.mutate(values);
    }
  };

  const onSubmitInspeccionRecurso = (values: z.infer<typeof inspeccionRecursoFormSchema>) => {
    createInspeccionRecursoMutation.mutate({ ...values, recursoId: selectedRecursoId! });
  };

  const onSubmitSimulacro = (values: z.infer<typeof simulacroFormSchema>) => {
    if (editingSimulacro) {
      updateSimulacroMutation.mutate({ id: editingSimulacro.id, data: values });
    } else {
      createSimulacroMutation.mutate(values);
    }
  };

  const onSubmitParticipante = (values: z.infer<typeof participanteFormSchema>) => {
    createParticipanteMutation.mutate({ ...values, simulacroId: selectedSimulacroId! });
  };

  const onSubmitZona = (values: z.infer<typeof zonaFormSchema>) => {
    if (editingZona) {
      updateZonaMutation.mutate({ id: editingZona.id, data: values });
    } else {
      createZonaMutation.mutate(values);
    }
  };

  const onSubmitRuta = (values: z.infer<typeof rutaFormSchema>) => {
    if (editingRuta) {
      updateRutaMutation.mutate({ id: editingRuta.id, data: values });
    } else {
      createRutaMutation.mutate(values);
    }
  };

  const onSubmitPunto = (values: z.infer<typeof puntoFormSchema>) => {
    if (editingPunto) {
      updatePuntoMutation.mutate({ id: editingPunto.id, data: values });
    } else {
      createPuntoMutation.mutate(values);
    }
  };

  const getEstadoPlanBadge = (estado: string) => {
    const config: Record<string, { label: string; className: string; icon: typeof FileText }> = {
      "borrador": { label: "Borrador", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400", icon: FileText },
      "vigente": { label: "Vigente", className: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle2 },
      "en_revision": { label: "En Revisión", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Clock },
      "obsoleto": { label: "Obsoleto", className: "bg-red-500/10 text-red-700 dark:text-red-400", icon: AlertTriangle },
    };
    const item = config[estado] || config["borrador"];
    const Icon = item.icon;
    return (
      <Badge className={item.className}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    );
  };

  const getEstadoRecursoBadge = (estado: string) => {
    const config: Record<string, { label: string; className: string }> = {
      "operativo": { label: "Operativo", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      "requiere_mantenimiento": { label: "Requiere Mantenimiento", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      "vencido": { label: "Vencido", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
      "fuera_servicio": { label: "Fuera de Servicio", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
    };
    const item = config[estado] || config["operativo"];
    return <Badge className={item.className}>{item.label}</Badge>;
  };

  const getEstadoSimulacroBadge = (estado: string) => {
    const config: Record<string, { label: string; className: string }> = {
      "programado": { label: "Programado", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      "en_ejecucion": { label: "En Ejecución", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      "completado": { label: "Completado", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      "cancelado": { label: "Cancelado", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
    };
    const item = config[estado] || config["programado"];
    return <Badge className={item.className}>{item.label}</Badge>;
  };

  const filteredPlanes = planes.filter((plan) => {
    const searchLower = planSearchTerm.toLowerCase();
    return (
      plan.nombre.toLowerCase().includes(searchLower) ||
      plan.codigo.toLowerCase().includes(searchLower)
    );
  });

  const filteredBrigadas = brigadas.filter((brigada) => {
    const searchLower = brigadaSearchTerm.toLowerCase();
    return brigada.nombre.toLowerCase().includes(searchLower);
  });

  const filteredAnalisis = analisis.filter((item) => {
    const searchLower = analisisSearchTerm.toLowerCase();
    return (
      item.codigo.toLowerCase().includes(searchLower) ||
      item.realizadoPor.toLowerCase().includes(searchLower)
    );
  });

  const filteredRecursos = recursos.filter((recurso) => {
    const searchLower = recursoSearchTerm.toLowerCase();
    return (
      recurso.nombre.toLowerCase().includes(searchLower) ||
      recurso.codigo.toLowerCase().includes(searchLower) ||
      recurso.ubicacion.toLowerCase().includes(searchLower)
    );
  });

  const filteredSimulacros = simulacros.filter((simulacro) => {
    const searchLower = simulacroSearchTerm.toLowerCase();
    return (
      simulacro.nombre.toLowerCase().includes(searchLower) ||
      simulacro.codigo.toLowerCase().includes(searchLower)
    );
  });

  const filteredZonas = zonas.filter((zona) => {
    const searchLower = zonaSearchTerm.toLowerCase();
    return (
      zona.nombre.toLowerCase().includes(searchLower) ||
      zona.codigo.toLowerCase().includes(searchLower)
    );
  });

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return "N/A";
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Desconocido";
  };

  const tipoBrigadaLabels: Record<string, string> = {
    "primeros_auxilios": "Primeros Auxilios",
    "evacuacion": "Evacuación",
    "control_incendios": "Control de Incendios",
    "busqueda_rescate": "Búsqueda y Rescate",
    "comunicaciones": "Comunicaciones",
    "integral": "Integral",
  };

  const tipoRecursoLabels: Record<string, string> = {
    "extintor": "Extintor",
    "botiquin": "Botiquín",
    "camilla": "Camilla",
    "dea": "DEA",
    "kit_derrames": "Kit Derrames",
    "linterna_emergencia": "Linterna Emergencia",
    "megafono": "Megáfono",
    "equipo_rescate": "Equipo Rescate",
    "senalizacion": "Señalización",
    "otro": "Otro",
  };

  const tipoSimulacroLabels: Record<string, string> = {
    "evacuacion": "Evacuación",
    "incendio": "Incendio",
    "sismo": "Sismo",
    "derrame_quimico": "Derrame Químico",
    "primeros_auxilios": "Primeros Auxilios",
    "confinamiento": "Confinamiento",
    "integral": "Integral",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Plan de Emergencias</h1>
          <p className="text-muted-foreground">Gestión de Amenazas | Resolución 0312/2019 Estándar 1.1.8</p>
        </div>
        <AutomationAssistant
          titulo="Plan de Emergencias"
          estandar="2.5.1"
          descripcion="Plan de prevención, preparación y respuesta ante emergencias"
          normativaAplicable={normativaPlanEmergencias}
          compact={true}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6" data-testid="tabs-plan-emergencias">
          <TabsTrigger value="planes" data-testid="tab-planes">
            <FileText className="h-4 w-4 mr-2" />
            Planes
          </TabsTrigger>
          <TabsTrigger value="brigadas" data-testid="tab-brigadas">
            <Users className="h-4 w-4 mr-2" />
            Brigadas
          </TabsTrigger>
          <TabsTrigger value="vulnerabilidad" data-testid="tab-vulnerabilidad">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Vulnerabilidad
          </TabsTrigger>
          <TabsTrigger value="recursos" data-testid="tab-recursos">
            <Package className="h-4 w-4 mr-2" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="simulacros" data-testid="tab-simulacros">
            <Calendar className="h-4 w-4 mr-2" />
            Simulacros
          </TabsTrigger>
          <TabsTrigger value="evacuacion" data-testid="tab-evacuacion">
            <MapPin className="h-4 w-4 mr-2" />
            Evacuación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planes" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planes..."
                value={planSearchTerm}
                onChange={(e) => setPlanSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-planes"
              />
            </div>
            <Dialog open={planDialogOpen} onOpenChange={(open) => { setPlanDialogOpen(open); if (!open) { setEditingPlan(null); planForm.reset(); setTipoPlanSeleccionado(null); } }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-plan">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? "Editar Plan de Emergencias" : "Nuevo Plan de Emergencias"}</DialogTitle>
                  <DialogDescription>Complete la información del plan de emergencias. Seleccione un tipo para auto-llenar campos.</DialogDescription>
                </DialogHeader>
                <Form {...planForm}>
                  <form onSubmit={planForm.handleSubmit(onSubmitPlan)} className="space-y-4">
                    {isSuperadmin && (
                      <FormField control={planForm.control} name="companyId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-company-plan"><SelectValue placeholder="Seleccione empresa" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Tipo de Plan (Auto-llenado)
                      </FormLabel>
                      <Select 
                        value={tipoPlanSeleccionado?.codigo || ""} 
                        onValueChange={(value) => {
                          const tipo = TIPOS_PLANES_EMERGENCIA.find(t => t.codigo === value);
                          setTipoPlanSeleccionado(tipo || null);
                          if (tipo) {
                            const consecutivo = planes.length + 1;
                            planForm.setValue("codigo", generarCodigoPlan(tipo.codigo, consecutivo));
                            planForm.setValue("nombre", generarNombrePlan(tipo));
                            planForm.setValue("alcance", tipo.alcancePredefinido);
                            planForm.setValue("objetivoGeneral", tipo.objetivoPredefinido);
                          }
                        }}
                        data-testid="select-tipo-plan"
                      >
                        <SelectTrigger data-testid="select-tipo-plan-trigger">
                          <SelectValue placeholder="Seleccione tipo de plan para auto-llenar" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_PLANES_EMERGENCIA.map((tipo) => (
                            <SelectItem key={tipo.codigo} value={tipo.codigo}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {tipoPlanSeleccionado && (
                        <FormDescription className="text-xs">
                          <strong>Normativa:</strong> {tipoPlanSeleccionado.normativa}
                        </FormDescription>
                      )}
                    </FormItem>

                    {tipoPlanSeleccionado && (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Info className="h-4 w-4" />
                          Componentes Requeridos
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tipoPlanSeleccionado.componentesRequeridos.map((comp, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{comp}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={planForm.control} name="codigo" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Código *
                            {tipoPlanSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                          </FormLabel>
                          <FormControl><Input {...field} data-testid="input-codigo-plan" placeholder="PE-2024-001" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={planForm.control} name="version" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versión</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} data-testid="input-version-plan" placeholder="1.0" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={planForm.control} name="nombre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Nombre del Plan *
                          {tipoPlanSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Input {...field} data-testid="input-nombre-plan" placeholder="Plan de Emergencias 2024" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={planForm.control} name="estado" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger data-testid="select-estado-plan"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="borrador">Borrador</SelectItem>
                            <SelectItem value="vigente">Vigente</SelectItem>
                            <SelectItem value="en_revision">En Revisión</SelectItem>
                            <SelectItem value="obsoleto">Obsoleto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={planForm.control} name="elaboradoPor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elaborado Por</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} data-testid="input-elaborado-plan" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={planForm.control} name="alcance" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Alcance
                          {tipoPlanSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-alcance-plan" rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={planForm.control} name="objetivoGeneral" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Objetivo General
                          {tipoPlanSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-objetivo-plan" rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setPlanDialogOpen(false); setEditingPlan(null); planForm.reset(); }}>Cancelar</Button>
                      <Button type="submit" disabled={createPlanMutation.isPending || updatePlanMutation.isPending} data-testid="button-submit-plan">
                        {(createPlanMutation.isPending || updatePlanMutation.isPending) ? "Guardando..." : editingPlan ? "Actualizar" : "Crear Plan"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {planesLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Cargando planes...</p></div>
          ) : filteredPlanes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay planes de emergencia</h3>
                  <p className="text-muted-foreground mb-4">{planSearchTerm ? "No se encontraron planes que coincidan con la búsqueda" : "Comience creando su primer plan de emergencias"}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlanes.map((plan) => (
                <Card key={plan.id} className="hover-elevate" data-testid={`card-plan-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{plan.nombre}</CardTitle>
                        <CardDescription className="truncate">{plan.codigo} - v{plan.version}</CardDescription>
                      </div>
                      {getEstadoPlanBadge(plan.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="font-medium">{plan.fechaElaboracion ? new Date(plan.fechaElaboracion).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Elaborado por:</span>
                        <span className="font-medium truncate ml-2">{plan.elaboradoPor || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openEditPlan(plan)} data-testid={`button-edit-plan-${plan.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deletePlanMutation.mutate(plan.id)} data-testid={`button-delete-plan-${plan.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="brigadas" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar brigadas..."
                value={brigadaSearchTerm}
                onChange={(e) => setBrigadaSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-brigadas"
              />
            </div>
            <Dialog open={brigadaDialogOpen} onOpenChange={(open) => { setBrigadaDialogOpen(open); if (!open) { setEditingBrigada(null); brigadaForm.reset(); setTipoBrigadaSeleccionado(null); } }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-brigada">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Brigada
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBrigada ? "Editar Brigada" : "Nueva Brigada de Emergencia"}</DialogTitle>
                  <DialogDescription>Complete la información de la brigada. Seleccione un tipo para auto-llenar campos.</DialogDescription>
                </DialogHeader>
                <Form {...brigadaForm}>
                  <form onSubmit={brigadaForm.handleSubmit(onSubmitBrigada)} className="space-y-4">
                    {isSuperadmin && (
                      <FormField control={brigadaForm.control} name="companyId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-company-brigada"><SelectValue placeholder="Seleccione empresa" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    <FormField control={brigadaForm.control} name="tipo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Tipo de Brigada * (Auto-llenado)
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            const tipo = TIPOS_BRIGADAS.find(t => t.tipoEnum === value);
                            setTipoBrigadaSeleccionado(tipo || null);
                            if (tipo) {
                              brigadaForm.setValue("nombre", `Brigada de ${tipo.nombre}`, { shouldValidate: true });
                              brigadaForm.setValue("descripcion", tipo.descripcion, { shouldValidate: true });
                              brigadaForm.setValue("funcionesAntes", tipo.funcionesAntes, { shouldValidate: true });
                              brigadaForm.setValue("funcionesDurante", tipo.funcionesDurante, { shouldValidate: true });
                              brigadaForm.setValue("funcionesDespues", tipo.funcionesDespues, { shouldValidate: true });
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl><SelectTrigger data-testid="select-tipo-brigada"><SelectValue placeholder="Seleccione tipo de brigada" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {TIPOS_BRIGADAS.map((tipo) => (
                              <SelectItem key={tipo.tipoEnum} value={tipo.tipoEnum}>{tipo.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {tipoBrigadaSeleccionado && (
                          <FormDescription className="text-xs">
                            <strong>Normativa:</strong> {tipoBrigadaSeleccionado.normativa}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )} />

                    {tipoBrigadaSeleccionado && (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Info className="h-4 w-4" />
                          Equipamiento y Capacitaciones Requeridas
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium mb-1">Equipamiento:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoBrigadaSeleccionado.equipamientoRequerido.slice(0, 4).map((equipo, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{equipo}</Badge>
                              ))}
                              {tipoBrigadaSeleccionado.equipamientoRequerido.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{tipoBrigadaSeleccionado.equipamientoRequerido.length - 4}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1">Capacitaciones:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoBrigadaSeleccionado.capacitacionRequerida.slice(0, 3).map((cap, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{cap}</Badge>
                              ))}
                              {tipoBrigadaSeleccionado.capacitacionRequerida.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{tipoBrigadaSeleccionado.capacitacionRequerida.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <FormField control={brigadaForm.control} name="nombre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Nombre de la Brigada *
                          {tipoBrigadaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Input {...field} data-testid="input-nombre-brigada" placeholder="Brigada de Primeros Auxilios" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={brigadaForm.control} name="descripcion" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Descripción
                          {tipoBrigadaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-descripcion-brigada" rows={2} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={brigadaForm.control} name="funcionesAntes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Funciones Antes de Emergencia
                          {tipoBrigadaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-funciones-antes" rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={brigadaForm.control} name="funcionesDurante" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Funciones Durante Emergencia
                          {tipoBrigadaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-funciones-durante" rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={brigadaForm.control} name="funcionesDespues" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Funciones Después de Emergencia
                          {tipoBrigadaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-funciones-despues" rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setBrigadaDialogOpen(false); setEditingBrigada(null); brigadaForm.reset(); setTipoBrigadaSeleccionado(null); }}>Cancelar</Button>
                      <Button type="submit" disabled={createBrigadaMutation.isPending || updateBrigadaMutation.isPending} data-testid="button-submit-brigada">
                        {(createBrigadaMutation.isPending || updateBrigadaMutation.isPending) ? "Guardando..." : editingBrigada ? "Actualizar" : "Crear Brigada"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {brigadasLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Cargando brigadas...</p></div>
          ) : filteredBrigadas.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay brigadas de emergencia</h3>
                  <p className="text-muted-foreground mb-4">{brigadaSearchTerm ? "No se encontraron brigadas que coincidan" : "Comience creando su primera brigada"}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBrigadas.map((brigada) => (
                <Card key={brigada.id} className="hover-elevate" data-testid={`card-brigada-${brigada.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{brigada.nombre}</CardTitle>
                        <CardDescription className="truncate">{tipoBrigadaLabels[brigada.tipo] || brigada.tipo}</CardDescription>
                      </div>
                      <Badge className={brigada.activa ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>
                        {brigada.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {brigada.descripcion && (
                        <p className="text-muted-foreground truncate">{brigada.descripcion}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedBrigadaId(brigada.id); }} data-testid={`button-view-miembros-${brigada.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> Miembros
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditBrigada(brigada)} data-testid={`button-edit-brigada-${brigada.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteBrigadaMutation.mutate(brigada.id)} data-testid={`button-delete-brigada-${brigada.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedBrigadaId && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Miembros de la Brigada</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={miembroDialogOpen} onOpenChange={(open) => { setMiembroDialogOpen(open); if (!open) { miembroForm.reset(); } }}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-miembro">
                          <Plus className="h-4 w-4 mr-2" /> Agregar Miembro
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Miembro a la Brigada</DialogTitle>
                        </DialogHeader>
                        <Form {...miembroForm}>
                          <form onSubmit={miembroForm.handleSubmit(onSubmitMiembro)} className="space-y-4">
                            <FormField control={miembroForm.control} name="workerId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trabajador *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger data-testid="select-worker-miembro"><SelectValue placeholder="Seleccione trabajador" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    {workers.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name} - {w.position || "Sin cargo"}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                                {field.value && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Cargo: {workers.find(w => w.id === field.value)?.position || "Sin cargo asignado"}
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={miembroForm.control} name="rol" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger data-testid="select-rol-miembro"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="jefe_brigada">Jefe de Brigada</SelectItem>
                                    <SelectItem value="subjefe">Subjefe</SelectItem>
                                    <SelectItem value="brigadista">Brigadista</SelectItem>
                                    <SelectItem value="coordinador_zona">Coordinador de Zona</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setMiembroDialogOpen(false)}>Cancelar</Button>
                              <Button type="submit" disabled={createMiembroMutation.isPending} data-testid="button-submit-miembro">
                                {createMiembroMutation.isPending ? "Agregando..." : "Agregar"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => setSelectedBrigadaId(null)}>Cerrar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {miembros.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay miembros en esta brigada</p>
                ) : (
                  <div className="space-y-2">
                    {miembros.map((m) => {
                      const worker = workers.find(w => w.id === m.workerId);
                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`miembro-${m.id}`}>
                          <div>
                            <p className="font-medium">{getWorkerName(m.workerId)}</p>
                            <p className="text-sm text-muted-foreground">{worker?.position || "Sin cargo"} - {m.rol}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => deleteMiembroMutation.mutate(m.id)} data-testid={`button-delete-miembro-${m.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vulnerabilidad" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar análisis..."
                value={analisisSearchTerm}
                onChange={(e) => setAnalisisSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-analisis"
              />
            </div>
            <Dialog open={analisisDialogOpen} onOpenChange={(open) => { setAnalisisDialogOpen(open); if (!open) { setEditingAnalisis(null); analisisForm.reset(); setCategoriaAmenazaSeleccionada(""); setTipoAmenazaSeleccionado(null); } }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-analisis">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Análisis
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAnalisis ? "Editar Análisis" : "Nuevo Análisis de Vulnerabilidad"}</DialogTitle>
                  <DialogDescription>Análisis de vulnerabilidad según normativa colombiana. Seleccione categoría y tipo de amenaza.</DialogDescription>
                </DialogHeader>
                <Form {...analisisForm}>
                  <form onSubmit={analisisForm.handleSubmit(onSubmitAnalisis)} className="space-y-4">
                    {isSuperadmin && (
                      <FormField control={analisisForm.control} name="companyId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-company-analisis"><SelectValue placeholder="Seleccione empresa" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Categoría de Amenaza
                        </FormLabel>
                        <Select 
                          value={categoriaAmenazaSeleccionada} 
                          onValueChange={(value) => {
                            setCategoriaAmenazaSeleccionada(value);
                            setTipoAmenazaSeleccionado(null);
                          }}
                          data-testid="select-categoria-amenaza"
                        >
                          <SelectTrigger data-testid="select-categoria-amenaza-trigger">
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS_AMENAZAS.map((cat) => (
                              <SelectItem key={cat.codigo} value={cat.codigo}>{cat.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Tipo de Amenaza
                        </FormLabel>
                        <Select 
                          value={tipoAmenazaSeleccionado?.codigo || ""} 
                          onValueChange={(value) => {
                            const tipo = TIPOS_AMENAZAS.find(t => t.codigo === value);
                            setTipoAmenazaSeleccionado(tipo || null);
                            if (tipo) {
                              const consecutivo = analisis.length + 1;
                              const codigoGenerado = `AV-${new Date().getFullYear()}-${String(consecutivo).padStart(3, '0')}`;
                              analisisForm.setValue("codigo", codigoGenerado);
                              analisisForm.setValue("realizadoPor", user?.fullName || "");
                            }
                          }}
                          disabled={!categoriaAmenazaSeleccionada}
                          data-testid="select-tipo-amenaza"
                        >
                          <SelectTrigger data-testid="select-tipo-amenaza-trigger">
                            <SelectValue placeholder={categoriaAmenazaSeleccionada ? "Seleccione amenaza" : "Primero seleccione categoría"} />
                          </SelectTrigger>
                          <SelectContent>
                            {amenazasFiltradas.map((amenaza) => (
                              <SelectItem key={amenaza.codigo} value={amenaza.codigo}>{amenaza.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    </div>

                    {tipoAmenazaSeleccionado && (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Info className="h-4 w-4" />
                          Información de la Amenaza: {tipoAmenazaSeleccionado.nombre}
                        </div>
                        <p className="text-sm text-muted-foreground">{tipoAmenazaSeleccionado.descripcion}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-medium mb-1">Fuente Generadora:</p>
                            <Badge variant="secondary" className="text-xs">{tipoAmenazaSeleccionado.fuenteGeneradora}</Badge>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Posibles Efectos:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoAmenazaSeleccionado.posiblesEfectos.slice(0, 3).map((efecto, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{efecto}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">Medidas Preventivas Sugeridas:</p>
                          <div className="flex flex-wrap gap-1">
                            {tipoAmenazaSeleccionado.medidasPreventivas.slice(0, 4).map((medida, idx) => (
                              <Badge key={idx} className="text-xs bg-green-500/10 text-green-700">{medida}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <FormField control={analisisForm.control} name="codigo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Código *
                          {tipoAmenazaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Input {...field} data-testid="input-codigo-analisis" placeholder="AV-2024-001" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={analisisForm.control} name="realizadoPor" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Realizado Por *
                          {tipoAmenazaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                        </FormLabel>
                        <FormControl><Input {...field} data-testid="input-realizado-analisis" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={analisisForm.control} name="metodologia" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Metodología
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "diamante"}>
                          <FormControl><SelectTrigger data-testid="select-metodologia-analisis"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {METODOLOGIAS_VULNERABILIDAD.map((met) => (
                              <SelectItem key={met.codigo} value={met.codigo}>{met.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setAnalisisDialogOpen(false); setEditingAnalisis(null); analisisForm.reset(); setCategoriaAmenazaSeleccionada(""); setTipoAmenazaSeleccionado(null); }}>Cancelar</Button>
                      <Button type="submit" disabled={createAnalisisMutation.isPending || updateAnalisisMutation.isPending} data-testid="button-submit-analisis">
                        {(createAnalisisMutation.isPending || updateAnalisisMutation.isPending) ? "Guardando..." : editingAnalisis ? "Actualizar" : "Crear Análisis"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {analisisLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Cargando análisis...</p></div>
          ) : filteredAnalisis.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay análisis de vulnerabilidad</h3>
                  <p className="text-muted-foreground mb-4">{analisisSearchTerm ? "No se encontraron análisis que coincidan" : "Comience creando su primer análisis"}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAnalisis.map((item) => (
                <Card key={item.id} className="hover-elevate" data-testid={`card-analisis-${item.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg truncate">{item.codigo}</CardTitle>
                    <CardDescription>Metodología: {item.metodologia || "Diamante"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="font-medium">{item.fechaAnalisis ? new Date(item.fechaAnalisis).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Realizado por:</span>
                        <span className="font-medium truncate ml-2">{item.realizadoPor}</span>
                      </div>
                      {item.nivelRiesgoGlobal && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nivel Riesgo:</span>
                          <Badge>{item.nivelRiesgoGlobal}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openEditAnalisis(item)} data-testid={`button-edit-analisis-${item.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteAnalisisMutation.mutate(item.id)} data-testid={`button-delete-analisis-${item.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recursos" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recursos..."
                value={recursoSearchTerm}
                onChange={(e) => setRecursoSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-recursos"
              />
            </div>
            <Dialog open={recursoDialogOpen} onOpenChange={(open) => { setRecursoDialogOpen(open); if (!open) { setEditingRecurso(null); recursoForm.reset(); setTipoRecursoSeleccionado(null); } }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-recurso">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Recurso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRecurso ? "Editar Recurso" : "Nuevo Recurso de Emergencia"}</DialogTitle>
                  <DialogDescription>Inventario de recursos para emergencias. Seleccione un tipo para auto-llenar.</DialogDescription>
                </DialogHeader>
                <Form {...recursoForm}>
                  <form onSubmit={recursoForm.handleSubmit(onSubmitRecurso)} className="space-y-4">
                    {isSuperadmin && (
                      <FormField control={recursoForm.control} name="companyId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-company-recurso"><SelectValue placeholder="Seleccione empresa" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    
                    <FormField control={recursoForm.control} name="tipo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Tipo de Recurso * (Auto-llenado)
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const selectedTipo = TIPOS_RECURSOS_EMERGENCIA.find(t => t.codigo === value);
                            field.onChange(selectedTipo?.tipo || value);
                            setTipoRecursoSeleccionado(selectedTipo || null);
                            if (selectedTipo) {
                              const consecutivo = recursos.length + 1;
                              const ubicacion = recursoForm.getValues("ubicacion") || "PEND";
                              recursoForm.setValue("codigo", generarCodigoRecurso(selectedTipo.tipo, ubicacion, consecutivo));
                              recursoForm.setValue("nombre", selectedTipo.nombre);
                            }
                          }} 
                          value={tipoRecursoSeleccionado?.codigo || ""}
                        >
                          <FormControl><SelectTrigger data-testid="select-tipo-recurso"><SelectValue placeholder="Seleccione tipo de recurso" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {TIPOS_RECURSOS_EMERGENCIA.map((tipo) => (
                              <SelectItem key={tipo.codigo} value={tipo.codigo}>{tipo.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {tipoRecursoSeleccionado && (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Info className="h-4 w-4" />
                          Especificaciones del Recurso
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-medium mb-1">Especificaciones Técnicas:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoRecursoSeleccionado.especificacionesTecnicas.slice(0, 3).map((spec, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Ubicaciones Sugeridas:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoRecursoSeleccionado.ubicacionesSugeridas.slice(0, 3).map((ub, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{ub}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div><strong>Normativa:</strong> {tipoRecursoSeleccionado.normativaCertificacion}</div>
                          <div><strong>Inspección:</strong> {tipoRecursoSeleccionado.frecuenciaInspeccion}</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={recursoForm.control} name="codigo" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Código *
                            {tipoRecursoSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                          </FormLabel>
                          <FormControl><Input {...field} data-testid="input-codigo-recurso" placeholder="EXT-001" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={recursoForm.control} name="nombre" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Nombre *
                            {tipoRecursoSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                          </FormLabel>
                          <FormControl><Input {...field} data-testid="input-nombre-recurso" placeholder="Extintor PQS 10 lbs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={recursoForm.control} name="ubicacion" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación *</FormLabel>
                        {tipoRecursoSeleccionado ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-ubicacion-recurso"><SelectValue placeholder="Seleccione ubicación sugerida" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {tipoRecursoSeleccionado.ubicacionesSugeridas.map((ub, idx) => (
                                <SelectItem key={idx} value={ub}>{ub}</SelectItem>
                              ))}
                              <SelectItem value="otra">Otra ubicación</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl><Input {...field} data-testid="input-ubicacion-recurso" placeholder="Piso 1, Área de Recepción" /></FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={recursoForm.control} name="estado" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger data-testid="select-estado-recurso"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="operativo">Operativo</SelectItem>
                            <SelectItem value="requiere_mantenimiento">Requiere Mantenimiento</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                            <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setRecursoDialogOpen(false); setEditingRecurso(null); recursoForm.reset(); setTipoRecursoSeleccionado(null); }}>Cancelar</Button>
                      <Button type="submit" disabled={createRecursoMutation.isPending || updateRecursoMutation.isPending} data-testid="button-submit-recurso">
                        {(createRecursoMutation.isPending || updateRecursoMutation.isPending) ? "Guardando..." : editingRecurso ? "Actualizar" : "Crear Recurso"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {recursosLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Cargando recursos...</p></div>
          ) : filteredRecursos.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay recursos de emergencia</h3>
                  <p className="text-muted-foreground mb-4">{recursoSearchTerm ? "No se encontraron recursos que coincidan" : "Comience agregando recursos al inventario"}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecursos.map((recurso) => (
                <Card key={recurso.id} className="hover-elevate" data-testid={`card-recurso-${recurso.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{recurso.nombre}</CardTitle>
                        <CardDescription className="truncate">{recurso.codigo} - {tipoRecursoLabels[recurso.tipo] || recurso.tipo}</CardDescription>
                      </div>
                      {getEstadoRecursoBadge(recurso.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ubicación:</span>
                        <span className="font-medium truncate ml-2">{recurso.ubicacion}</span>
                      </div>
                      {recurso.fechaVencimiento && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vencimiento:</span>
                          <span className="font-medium">{new Date(recurso.fechaVencimiento).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedRecursoId(recurso.id); }} data-testid={`button-view-inspecciones-${recurso.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> Inspecciones
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditRecurso(recurso)} data-testid={`button-edit-recurso-${recurso.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteRecursoMutation.mutate(recurso.id)} data-testid={`button-delete-recurso-${recurso.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedRecursoId && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Inspecciones del Recurso</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={inspeccionDialogOpen} onOpenChange={(open) => { setInspeccionDialogOpen(open); if (!open) { inspeccionRecursoForm.reset(); } }}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-inspeccion-recurso">
                          <Plus className="h-4 w-4 mr-2" /> Nueva Inspección
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Inspección</DialogTitle>
                        </DialogHeader>
                        <Form {...inspeccionRecursoForm}>
                          <form onSubmit={inspeccionRecursoForm.handleSubmit(onSubmitInspeccionRecurso)} className="space-y-4">
                            <FormField control={inspeccionRecursoForm.control} name="inspectorNombre" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inspector *</FormLabel>
                                <FormControl><Input {...field} data-testid="input-inspector-inspeccion" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={inspeccionRecursoForm.control} name="estadoEncontrado" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado Encontrado *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger data-testid="select-estado-inspeccion"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="operativo">Operativo</SelectItem>
                                    <SelectItem value="requiere_mantenimiento">Requiere Mantenimiento</SelectItem>
                                    <SelectItem value="vencido">Vencido</SelectItem>
                                    <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={inspeccionRecursoForm.control} name="hallazgos" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hallazgos</FormLabel>
                                <FormControl><Textarea {...field} value={field.value || ""} data-testid="input-hallazgos-inspeccion" rows={2} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setInspeccionDialogOpen(false)}>Cancelar</Button>
                              <Button type="submit" disabled={createInspeccionRecursoMutation.isPending} data-testid="button-submit-inspeccion-recurso">
                                {createInspeccionRecursoMutation.isPending ? "Registrando..." : "Registrar"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => setSelectedRecursoId(null)}>Cerrar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {inspeccionesRecurso.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay inspecciones registradas</p>
                ) : (
                  <div className="space-y-2">
                    {inspeccionesRecurso.map((insp) => (
                      <div key={insp.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`inspeccion-${insp.id}`}>
                        <div>
                          <p className="font-medium">{insp.inspectorNombre}</p>
                          <p className="text-sm text-muted-foreground">{new Date(insp.fechaInspeccion).toLocaleDateString()}</p>
                        </div>
                        {getEstadoRecursoBadge(insp.estadoEncontrado)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="simulacros" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar simulacros..."
                value={simulacroSearchTerm}
                onChange={(e) => setSimulacroSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-simulacros"
              />
            </div>
            <Dialog open={simulacroDialogOpen} onOpenChange={(open) => { setSimulacroDialogOpen(open); if (!open) { setEditingSimulacro(null); simulacroForm.reset(); setTipoSimulacroSeleccionado(null); } }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-simulacro">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Simulacro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingSimulacro ? "Editar Simulacro" : "Nuevo Simulacro de Emergencia"}</DialogTitle>
                  <DialogDescription>Programación y seguimiento de simulacros. Seleccione un tipo para auto-llenar.</DialogDescription>
                </DialogHeader>
                <Form {...simulacroForm}>
                  <form onSubmit={simulacroForm.handleSubmit(onSubmitSimulacro)} className="space-y-4">
                    {isSuperadmin && (
                      <FormField control={simulacroForm.control} name="companyId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-company-simulacro"><SelectValue placeholder="Seleccione empresa" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    
                    <FormField control={simulacroForm.control} name="tipo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Tipo de Simulacro * (Auto-llenado)
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            const tipo = TIPOS_SIMULACROS.find(t => t.tipoEnum === value);
                            setTipoSimulacroSeleccionado(tipo || null);
                            if (tipo) {
                              const consecutivo = simulacros.length + 1;
                              const fecha = new Date().toLocaleDateString('es-CO');
                              simulacroForm.setValue("codigo", generarCodigoSimulacro(tipo.codigo, consecutivo), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              simulacroForm.setValue("nombre", `${tipo.nombre} - ${fecha}`, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              simulacroForm.setValue("coordinadorNombre", user?.fullName || "Coordinador SST", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              simulacroForm.setValue("estado", "programado", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                              // Trigger revalidation after setting all values
                              setTimeout(() => {
                                simulacroForm.trigger(["codigo", "nombre", "coordinadorNombre", "estado"]);
                              }, 100);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl><SelectTrigger data-testid="select-tipo-simulacro"><SelectValue placeholder="Seleccione tipo de simulacro" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {TIPOS_SIMULACROS.map((tipo) => (
                              <SelectItem key={tipo.tipoEnum} value={tipo.tipoEnum}>{tipo.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {tipoSimulacroSeleccionado && (
                          <FormDescription className="text-xs">
                            <strong>Normativa:</strong> {tipoSimulacroSeleccionado.normativa}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )} />

                    {tipoSimulacroSeleccionado && (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Info className="h-4 w-4" />
                          Información del Simulacro
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-medium mb-1">Objetivos:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoSimulacroSeleccionado.objetivos.slice(0, 3).map((obj, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{obj}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Actividades Principales:</p>
                            <div className="flex flex-wrap gap-1">
                              {tipoSimulacroSeleccionado.actividadesPrincipales.slice(0, 3).map((act, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{act}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">Indicadores de Evaluación:</p>
                          <div className="flex flex-wrap gap-1">
                            {tipoSimulacroSeleccionado.indicadoresEvaluacion.slice(0, 4).map((ind, idx) => (
                              <Badge key={idx} className="text-xs bg-blue-500/10 text-blue-700">{ind}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div><strong>Frecuencia Mínima:</strong> {tipoSimulacroSeleccionado.frecuenciaMinima}</div>
                          <div><strong>Normativa:</strong> {tipoSimulacroSeleccionado.normativa}</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={simulacroForm.control} name="codigo" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Código *
                            <span className="flex items-center gap-1 text-xs text-primary"><Sparkles className="h-3 w-3" /> Auto</span>
                          </FormLabel>
                          <FormControl><Input {...field} data-testid="input-codigo-simulacro" placeholder="SIM-2024-001" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={simulacroForm.control} name="nombre" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Nombre *
                            <span className="flex items-center gap-1 text-xs text-primary"><Sparkles className="h-3 w-3" /> Auto</span>
                          </FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value)} data-testid="input-nombre-simulacro" placeholder="Simulacro de Evacuación General" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={simulacroForm.control} name="coordinadorNombre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Coordinador
                          <span className="flex items-center gap-1 text-xs text-primary"><Sparkles className="h-3 w-3" /> Auto</span>
                        </FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} data-testid="input-coordinador-simulacro" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={simulacroForm.control} name="estado" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Estado
                          <span className="flex items-center gap-1 text-xs text-primary"><Sparkles className="h-3 w-3" /> Auto</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger data-testid="select-estado-simulacro"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="programado">Programado</SelectItem>
                            <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => { setSimulacroDialogOpen(false); setEditingSimulacro(null); simulacroForm.reset(); setTipoSimulacroSeleccionado(null); }}>Cancelar</Button>
                      <Button type="submit" disabled={createSimulacroMutation.isPending || updateSimulacroMutation.isPending} data-testid="button-submit-simulacro">
                        {(createSimulacroMutation.isPending || updateSimulacroMutation.isPending) ? "Guardando..." : editingSimulacro ? "Actualizar" : "Crear Simulacro"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {simulacrosLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Cargando simulacros...</p></div>
          ) : filteredSimulacros.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay simulacros programados</h3>
                  <p className="text-muted-foreground mb-4">{simulacroSearchTerm ? "No se encontraron simulacros que coincidan" : "Comience programando su primer simulacro"}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSimulacros.map((simulacro) => (
                <Card key={simulacro.id} className="hover-elevate" data-testid={`card-simulacro-${simulacro.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{simulacro.nombre}</CardTitle>
                        <CardDescription className="truncate">{simulacro.codigo} - {tipoSimulacroLabels[simulacro.tipo] || simulacro.tipo}</CardDescription>
                      </div>
                      {getEstadoSimulacroBadge(simulacro.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha Programada:</span>
                        <span className="font-medium">{simulacro.fechaProgramada ? new Date(simulacro.fechaProgramada).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinador:</span>
                        <span className="font-medium truncate ml-2">{simulacro.coordinadorNombre || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedSimulacroId(simulacro.id); }} data-testid={`button-view-participantes-${simulacro.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> Participantes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditSimulacro(simulacro)} data-testid={`button-edit-simulacro-${simulacro.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteSimulacroMutation.mutate(simulacro.id)} data-testid={`button-delete-simulacro-${simulacro.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedSimulacroId && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Participantes del Simulacro</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={participanteDialogOpen} onOpenChange={(open) => { setParticipanteDialogOpen(open); if (!open) { participanteForm.reset(); } }}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-participante">
                          <Plus className="h-4 w-4 mr-2" /> Agregar Participante
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Participante</DialogTitle>
                        </DialogHeader>
                        <Form {...participanteForm}>
                          <form onSubmit={participanteForm.handleSubmit(onSubmitParticipante)} className="space-y-4">
                            <FormField control={participanteForm.control} name="workerId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trabajador</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl><SelectTrigger data-testid="select-worker-participante"><SelectValue placeholder="Seleccione trabajador" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    {workers.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name} - {w.position || "Sin cargo"}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                                {field.value && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Cargo: {workers.find(w => w.id === field.value)?.position || "Sin cargo asignado"}
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={participanteForm.control} name="rolSimulacro" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Rol en Simulacro
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || "evacuado"}>
                                  <FormControl><SelectTrigger data-testid="select-rol-participante"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    {ROLES_SIMULACRO.map((rol) => (
                                      <SelectItem key={rol.valor} value={rol.valor}>{rol.etiqueta}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setParticipanteDialogOpen(false)}>Cancelar</Button>
                              <Button type="submit" disabled={createParticipanteMutation.isPending} data-testid="button-submit-participante">
                                {createParticipanteMutation.isPending ? "Agregando..." : "Agregar"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => setSelectedSimulacroId(null)}>Cerrar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {participantes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay participantes registrados</p>
                ) : (
                  <div className="space-y-2">
                    {participantes.map((p) => {
                      const worker = p.workerId ? workers.find(w => w.id === p.workerId) : null;
                      return (
                        <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`participante-${p.id}`}>
                          <div>
                            <p className="font-medium">{p.workerId ? getWorkerName(p.workerId) : p.nombreParticipante || "Participante"}</p>
                            <p className="text-sm text-muted-foreground">{worker?.position || "Sin cargo"} - {p.rolSimulacro || "Evacuado"}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => deleteParticipanteMutation.mutate(p.id)} data-testid={`button-delete-participante-${p.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evacuacion" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Zonas de Evacuación
                  </CardTitle>
                  <Dialog open={zonaDialogOpen} onOpenChange={(open) => { setZonaDialogOpen(open); if (!open) { setEditingZona(null); zonaForm.reset(); setTipoZonaSeleccionado(null); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-zona">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{editingZona ? "Editar Zona" : "Nueva Zona de Evacuación"}</DialogTitle>
                        <DialogDescription>Defina las zonas de evacuación. Seleccione un tipo para ver información.</DialogDescription>
                      </DialogHeader>
                      <Form {...zonaForm}>
                        <form onSubmit={zonaForm.handleSubmit(onSubmitZona)} className="space-y-4">
                          {isSuperadmin && (
                            <FormField control={zonaForm.control} name="companyId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Empresa</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger data-testid="select-company-zona"><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                                  <SelectContent>{companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          )}
                          
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Tipo de Zona
                            </FormLabel>
                            <Select 
                              value={tipoZonaSeleccionado?.codigo || ""} 
                              onValueChange={(value) => {
                                const tipo = TIPOS_ZONAS_EVACUACION.find(t => t.codigo === value);
                                setTipoZonaSeleccionado(tipo || null);
                                if (tipo) {
                                  const consecutivo = zonas.length + 1;
                                  zonaForm.setValue("codigo", generarCodigoZona(tipo.codigo, consecutivo));
                                  zonaForm.setValue("nombre", `${tipo.nombre} - Área ${consecutivo}`);
                                }
                              }}
                              data-testid="select-tipo-zona"
                            >
                              <SelectTrigger data-testid="select-tipo-zona-trigger">
                                <SelectValue placeholder="Seleccione tipo de zona" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_ZONAS_EVACUACION.map((tipo) => (
                                  <SelectItem key={tipo.codigo} value={tipo.codigo}>{tipo.nombre}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>

                          {tipoZonaSeleccionado && (
                            <div className="rounded-lg border bg-muted/50 p-3 space-y-2 text-xs">
                              <p className="text-sm text-muted-foreground">{tipoZonaSeleccionado.descripcion}</p>
                              <div>
                                <p className="font-medium mb-1">Características:</p>
                                <div className="flex flex-wrap gap-1">
                                  {tipoZonaSeleccionado.caracteristicas.slice(0, 4).map((car, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{car}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <FormField control={zonaForm.control} name="codigo" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Código *
                                {tipoZonaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                              </FormLabel>
                              <FormControl><Input {...field} data-testid="input-codigo-zona" placeholder="ZONA-A" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={zonaForm.control} name="nombre" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Nombre *
                                {tipoZonaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                              </FormLabel>
                              <FormControl><Input {...field} data-testid="input-nombre-zona" placeholder="Zona A - Piso 1" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setZonaDialogOpen(false); setEditingZona(null); zonaForm.reset(); setTipoZonaSeleccionado(null); }}>Cancelar</Button>
                            <Button type="submit" disabled={createZonaMutation.isPending || updateZonaMutation.isPending} data-testid="button-submit-zona">
                              {(createZonaMutation.isPending || updateZonaMutation.isPending) ? "Guardando..." : editingZona ? "Actualizar" : "Crear"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar zonas..."
                    value={zonaSearchTerm}
                    onChange={(e) => setZonaSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-zonas"
                  />
                </div>
                {zonasLoading ? (
                  <p className="text-muted-foreground text-center py-4">Cargando...</p>
                ) : filteredZonas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay zonas</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredZonas.map((zona) => (
                      <div key={zona.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`zona-${zona.id}`}>
                        <div>
                          <p className="font-medium">{zona.nombre}</p>
                          <p className="text-sm text-muted-foreground">{zona.codigo}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditZona(zona)} data-testid={`button-edit-zona-${zona.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteZonaMutation.mutate(zona.id)} data-testid={`button-delete-zona-${zona.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Rutas de Evacuación
                  </CardTitle>
                  <Dialog open={rutaDialogOpen} onOpenChange={(open) => { setRutaDialogOpen(open); if (!open) { setEditingRuta(null); rutaForm.reset(); setTipoRutaSeleccionado(null); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-ruta">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{editingRuta ? "Editar Ruta" : "Nueva Ruta de Evacuación"}</DialogTitle>
                        <DialogDescription>Defina las rutas de evacuación. Seleccione un tipo para ver información.</DialogDescription>
                      </DialogHeader>
                      <Form {...rutaForm}>
                        <form onSubmit={rutaForm.handleSubmit(onSubmitRuta)} className="space-y-4">
                          {isSuperadmin && (
                            <FormField control={rutaForm.control} name="companyId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Empresa</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger data-testid="select-company-ruta"><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                                  <SelectContent>{companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          )}
                          
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Tipo de Ruta
                            </FormLabel>
                            <Select 
                              value={tipoRutaSeleccionado?.codigo || ""} 
                              onValueChange={(value) => {
                                const tipo = TIPOS_RUTAS_EVACUACION.find(t => t.codigo === value);
                                setTipoRutaSeleccionado(tipo || null);
                                if (tipo) {
                                  const consecutivo = rutas.length + 1;
                                  const puntoInicio = rutaForm.getValues("puntoInicio") || "ORIGEN";
                                  const puntoFin = rutaForm.getValues("puntoFin") || "DESTINO";
                                  rutaForm.setValue("codigo", generarCodigoRuta(puntoInicio, puntoFin));
                                  rutaForm.setValue("nombre", `${tipo.nombre} ${consecutivo}`);
                                }
                              }}
                              data-testid="select-tipo-ruta"
                            >
                              <SelectTrigger data-testid="select-tipo-ruta-trigger">
                                <SelectValue placeholder="Seleccione tipo de ruta" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_RUTAS_EVACUACION.map((tipo) => (
                                  <SelectItem key={tipo.codigo} value={tipo.codigo}>{tipo.nombre}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>

                          {tipoRutaSeleccionado && (
                            <div className="rounded-lg border bg-muted/50 p-3 space-y-2 text-xs">
                              <p className="text-sm text-muted-foreground">{tipoRutaSeleccionado.descripcion}</p>
                              <div>
                                <p className="font-medium mb-1">Señalización Requerida:</p>
                                <div className="flex flex-wrap gap-1">
                                  {tipoRutaSeleccionado.senalizacionRequerida.slice(0, 4).map((sen, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{sen}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Características:</p>
                                <div className="flex flex-wrap gap-1">
                                  {tipoRutaSeleccionado.caracteristicas.slice(0, 3).map((car, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{car}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <FormField control={rutaForm.control} name="codigo" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Código *
                                {tipoRutaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                              </FormLabel>
                              <FormControl><Input {...field} data-testid="input-codigo-ruta" placeholder="RUTA-A1" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={rutaForm.control} name="nombre" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Nombre *
                                {tipoRutaSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                              </FormLabel>
                              <FormControl><Input {...field} data-testid="input-nombre-ruta" placeholder="Salida Principal" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={rutaForm.control} name="puntoInicio" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Punto Inicio *</FormLabel>
                              <FormControl><Input {...field} data-testid="input-inicio-ruta" placeholder="Oficina 101" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={rutaForm.control} name="puntoFin" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Punto Fin *</FormLabel>
                              <FormControl><Input {...field} data-testid="input-fin-ruta" placeholder="Punto de Encuentro 1" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setRutaDialogOpen(false); setEditingRuta(null); rutaForm.reset(); setTipoRutaSeleccionado(null); }}>Cancelar</Button>
                            <Button type="submit" disabled={createRutaMutation.isPending || updateRutaMutation.isPending} data-testid="button-submit-ruta">
                              {(createRutaMutation.isPending || updateRutaMutation.isPending) ? "Guardando..." : editingRuta ? "Actualizar" : "Crear"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {rutas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay rutas</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {rutas.map((ruta) => (
                      <div key={ruta.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`ruta-${ruta.id}`}>
                        <div>
                          <p className="font-medium">{ruta.nombre}</p>
                          <p className="text-sm text-muted-foreground">{ruta.puntoInicio} → {ruta.puntoFin}</p>
                        </div>
                        <div className="flex gap-1">
                          {ruta.rutaPrincipal === 1 && <Badge className="bg-green-500/10 text-green-700">Principal</Badge>}
                          <Button size="icon" variant="ghost" onClick={() => openEditRuta(ruta)} data-testid={`button-edit-ruta-${ruta.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteRutaMutation.mutate(ruta.id)} data-testid={`button-delete-ruta-${ruta.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Puntos de Encuentro
                  </CardTitle>
                  <Dialog open={puntoDialogOpen} onOpenChange={(open) => { setPuntoDialogOpen(open); if (!open) { setEditingPunto(null); puntoForm.reset(); setTipoPuntoSeleccionado(null); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-punto">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{editingPunto ? "Editar Punto" : "Nuevo Punto de Encuentro"}</DialogTitle>
                        <DialogDescription>Defina los puntos de encuentro. Seleccione un tipo para ver criterios.</DialogDescription>
                      </DialogHeader>
                      <Form {...puntoForm}>
                        <form onSubmit={puntoForm.handleSubmit(onSubmitPunto)} className="space-y-4">
                          {isSuperadmin && (
                            <FormField control={puntoForm.control} name="companyId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Empresa</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger data-testid="select-company-punto"><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                                  <SelectContent>{companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          )}
                          
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Tipo de Punto de Encuentro
                            </FormLabel>
                            <Select 
                              value={tipoPuntoSeleccionado?.codigo || ""} 
                              onValueChange={(value) => {
                                const tipo = TIPOS_PUNTOS_ENCUENTRO.find(t => t.codigo === value);
                                setTipoPuntoSeleccionado(tipo || null);
                                if (tipo) {
                                  const consecutivo = puntos.length + 1;
                                  puntoForm.setValue("codigo", generarCodigoPuntoEncuentro(consecutivo));
                                  puntoForm.setValue("nombre", `${tipo.nombre} ${consecutivo}`);
                                }
                              }}
                              data-testid="select-tipo-punto"
                            >
                              <SelectTrigger data-testid="select-tipo-punto-trigger">
                                <SelectValue placeholder="Seleccione tipo de punto" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_PUNTOS_ENCUENTRO.map((tipo) => (
                                  <SelectItem key={tipo.codigo} value={tipo.codigo}>{tipo.nombre}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>

                          {tipoPuntoSeleccionado && (
                            <div className="rounded-lg border bg-muted/50 p-3 space-y-2 text-xs">
                              <p className="text-sm text-muted-foreground">{tipoPuntoSeleccionado.descripcion}</p>
                              <div>
                                <p className="font-medium mb-1">Criterios de Selección:</p>
                                <div className="flex flex-wrap gap-1">
                                  {tipoPuntoSeleccionado.criterios.slice(0, 4).map((crit, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{crit}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <FormField control={puntoForm.control} name="codigo" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Código *
                                {tipoPuntoSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                              </FormLabel>
                              <FormControl><Input {...field} data-testid="input-codigo-punto" placeholder="PE-01" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={puntoForm.control} name="nombre" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Nombre *
                                {tipoPuntoSeleccionado && <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />Auto</Badge>}
                              </FormLabel>
                              <FormControl><Input {...field} data-testid="input-nombre-punto" placeholder="Punto de Encuentro Principal" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={puntoForm.control} name="ubicacion" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ubicación *</FormLabel>
                              <FormControl><Input {...field} data-testid="input-ubicacion-punto" placeholder="Parqueadero Principal" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setPuntoDialogOpen(false); setEditingPunto(null); puntoForm.reset(); setTipoPuntoSeleccionado(null); }}>Cancelar</Button>
                            <Button type="submit" disabled={createPuntoMutation.isPending || updatePuntoMutation.isPending} data-testid="button-submit-punto">
                              {(createPuntoMutation.isPending || updatePuntoMutation.isPending) ? "Guardando..." : editingPunto ? "Actualizar" : "Crear"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {puntos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay puntos</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {puntos.map((punto) => (
                      <div key={punto.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`punto-${punto.id}`}>
                        <div>
                          <p className="font-medium">{punto.nombre}</p>
                          <p className="text-sm text-muted-foreground">{punto.ubicacion}</p>
                        </div>
                        <div className="flex gap-1">
                          {punto.puntoPrincipal === 1 && <Badge className="bg-green-500/10 text-green-700">Principal</Badge>}
                          <Button size="icon" variant="ghost" onClick={() => openEditPunto(punto)} data-testid={`button-edit-punto-${punto.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deletePuntoMutation.mutate(punto.id)} data-testid={`button-delete-punto-${punto.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
