import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ConvivenciaPeriodo, InsertConvivenciaPeriodo, insertConvivenciaPeriodoSchema,
  ConvivenciaMiembro, InsertConvivenciaMiembro, insertConvivenciaMiembroSchema,
  ConvivenciaEleccion, InsertConvivenciaEleccion, insertConvivenciaEleccionSchema,
  ConvivenciaCandidato, InsertConvivenciaCandidato, insertConvivenciaCandidatoSchema,
  ConvivenciaActa, InsertConvivenciaActa, insertConvivenciaActaSchema,
  Worker, User as UserType, Company
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Plus, Calendar, Users, Vote, FileText, AlertTriangle,
  CheckCircle, ChevronRight, Download, Crown, Eye, EyeOff, Pencil, Trash2, Upload, FileSignature, CalendarDays
} from "lucide-react";
import { Link } from "wouter";
import { Label } from "@/components/ui/label";
import { format, addYears, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const ELECTION_PHASES = [
  { key: 'convocatoria', label: 'Convocatoria' },
  { key: 'inscripcion', label: 'Inscripción' },
  { key: 'votacion', label: 'Votación' },
  { key: 'escrutinio', label: 'Escrutinio' },
  { key: 'completada', label: 'Completada' },
];

export default function ComiteConvivenciaActas() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("periodo");
  const [isCreatePeriodoOpen, setIsCreatePeriodoOpen] = useState(false);
  const [isCreateEleccionOpen, setIsCreateEleccionOpen] = useState(false);
  const [isAddMiembroOpen, setIsAddMiembroOpen] = useState(false);
  const [isRegisterCandidateOpen, setIsRegisterCandidateOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isCreateActaOpen, setIsCreateActaOpen] = useState(false);
  const [editingActa, setEditingActa] = useState<ConvivenciaActa | null>(null);
  const [uploadingActaId, setUploadingActaId] = useState<string | null>(null);
  const [firmaPresidenteId, setFirmaPresidenteId] = useState<string>("");
  const [firmaSecretarioId, setFirmaSecretarioId] = useState<string>("");

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const isSuperAdmin = user?.role === "superadmin";
  const effectiveCompanyId = isSuperAdmin 
    ? (selectedCompanyId || companies[0]?.id || user?.companyId || "") 
    : (user?.companyId || "");

  useEffect(() => {
    if (isSuperAdmin && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [isSuperAdmin, companies, selectedCompanyId]);

  const { data: activePeriodo, isLoading: loadingPeriodo } = useQuery<ConvivenciaPeriodo | null>({
    queryKey: ["/api/convivencia-periodos/activo", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/convivencia-periodos/activo", {
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) throw new Error("Error al cargar período activo");
      return await res.json();
    },
    enabled: !!effectiveCompanyId,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/workers", {
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) throw new Error("Error al cargar trabajadores");
      return await res.json();
    },
    enabled: !!effectiveCompanyId,
  });

  const { data: elecciones = [], isLoading: loadingElecciones } = useQuery<ConvivenciaEleccion[]>({
    queryKey: ["/api/convivencia-elecciones", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/convivencia-elecciones", {
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) throw new Error("Error al cargar elecciones");
      return await res.json();
    },
    enabled: !!effectiveCompanyId,
  });

  const activeElection = elecciones.find(e => e.estado !== 'completada');
  const completedElection = elecciones.find(e => e.estado === 'completada');

  const { data: miembros = [], isLoading: loadingMiembros } = useQuery<(ConvivenciaMiembro & { worker?: Worker })[]>({
    queryKey: ["/api/convivencia-miembros", activePeriodo?.id, effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch(`/api/convivencia-miembros/${activePeriodo?.id}`, {
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) throw new Error("Error al cargar miembros");
      return await res.json();
    },
    enabled: !!activePeriodo?.id && !!effectiveCompanyId,
  });

  const { data: candidatos = [] } = useQuery<(ConvivenciaCandidato & { worker?: Worker })[]>({
    queryKey: ["/api/convivencia-candidatos", activeElection?.id, effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch(`/api/convivencia-candidatos/${activeElection?.id}`, {
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) throw new Error("Error al cargar candidatos");
      return await res.json();
    },
    enabled: !!activeElection?.id && !!effectiveCompanyId,
  });

  const { data: actas = [], isLoading: loadingActas } = useQuery<ConvivenciaActa[]>({
    queryKey: ["/api/convivencia-actas", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/convivencia-actas", {
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) throw new Error("Error al cargar actas");
      return await res.json();
    },
    enabled: !!effectiveCompanyId,
  });

  const daysUntilExpiry = activePeriodo?.fechaFin
    ? differenceInDays(parseISO(activePeriodo.fechaFin), new Date())
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  const periodoFormSchema = insertConvivenciaPeriodoSchema.omit({ companyId: true });
  const eleccionFormSchema = insertConvivenciaEleccionSchema.omit({ companyId: true });

  const periodoForm = useForm<Omit<InsertConvivenciaPeriodo, 'companyId'>>({
    resolver: zodResolver(periodoFormSchema),
    defaultValues: {
      fechaInicio: format(new Date(), "yyyy-MM-dd"),
      fechaFin: format(addYears(new Date(), 2), "yyyy-MM-dd"),
      estado: 'activo',
    },
  });

  const eleccionForm = useForm<Omit<InsertConvivenciaEleccion, 'companyId'>>({
    resolver: zodResolver(eleccionFormSchema),
    defaultValues: {
      fechaConvocatoria: format(new Date(), "yyyy-MM-dd"),
      fechaInicioInscripcion: "",
      fechaFinInscripcion: "",
      fechaVotacion: "",
      horaInicioVotacion: "08:00",
      horaFinVotacion: "16:00",
      estado: 'convocatoria',
      modalidadVotacion: 'presencial',
      principalesRequeridos: 2,
      suplentesRequeridos: 2,
    },
  });

  const miembroForm = useForm<InsertConvivenciaMiembro>({
    resolver: zodResolver(insertConvivenciaMiembroSchema),
    defaultValues: {
      workerId: "",
      periodoId: "",
      representacion: 'empleador',
      cargo: 'miembro_principal',
      fechaDesignacion: format(new Date(), "yyyy-MM-dd"),
      estado: 'activo',
    },
  });

  const candidatoForm = useForm<InsertConvivenciaCandidato>({
    resolver: zodResolver(insertConvivenciaCandidatoSchema),
    defaultValues: {
      workerId: "",
      eleccionId: "",
      fechaInscripcion: format(new Date(), "yyyy-MM-dd"),
      propuestaLaboral: "",
      estado: 'inscrito',
      votosRecibidos: 0,
    },
  });

  const actaForm = useForm<InsertConvivenciaActa>({
    resolver: zodResolver(insertConvivenciaActaSchema),
    defaultValues: {
      companyId: "",
      tipo: "sesion",
      numero: 1,
      fecha: format(new Date(), "yyyy-MM-dd"),
      asunto: "",
      contenido: "",
      asistentes: [],
      acuerdos: [],
      observaciones: "",
    },
  });

  const createPeriodoMutation = useMutation({
    mutationFn: async (data: InsertConvivenciaPeriodo) => {
      const res = await fetch("/api/convivencia-periodos", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al crear período");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-periodos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-periodos/activo", effectiveCompanyId] });
      toast({ title: "Período creado", description: "El período del Comité de Convivencia se creó exitosamente." });
      setIsCreatePeriodoOpen(false);
      periodoForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createEleccionMutation = useMutation({
    mutationFn: async (data: InsertConvivenciaEleccion) => {
      const res = await fetch("/api/convivencia-elecciones", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al crear elección");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-elecciones", effectiveCompanyId] });
      toast({ title: "Elección creada", description: "El proceso electoral ha iniciado." });
      setIsCreateEleccionOpen(false);
      eleccionForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateEleccionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ConvivenciaEleccion> }) => {
      const res = await fetch(`/api/convivencia-elecciones/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al actualizar elección");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-elecciones", effectiveCompanyId] });
      toast({ title: "Elección actualizada" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createMiembroMutation = useMutation({
    mutationFn: async (data: InsertConvivenciaMiembro) => {
      const res = await fetch("/api/convivencia-miembros", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al agregar miembro");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-miembros", activePeriodo?.id, effectiveCompanyId] });
      toast({ title: "Miembro agregado", description: "El miembro se agregó al Comité de Convivencia." });
      setIsAddMiembroOpen(false);
      miembroForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createCandidatoMutation = useMutation({
    mutationFn: async (data: InsertConvivenciaCandidato) => {
      const res = await fetch("/api/convivencia-candidatos", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al registrar candidatura");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-candidatos", activeElection?.id, effectiveCompanyId] });
      toast({ title: "Candidatura registrada" });
      setIsRegisterCandidateOpen(false);
      candidatoForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createActaMutation = useMutation({
    mutationFn: async (data: InsertConvivenciaActa) => {
      const res = await fetch("/api/convivencia-actas", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify({ ...data, companyId: effectiveCompanyId }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al crear acta");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-actas", effectiveCompanyId] });
      toast({ title: "Acta creada", description: "El acta se ha registrado correctamente." });
      setIsCreateActaOpen(false);
      actaForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateActaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertConvivenciaActa> }) => {
      const res = await fetch(`/api/convivencia-actas/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al actualizar acta");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-actas", effectiveCompanyId] });
      toast({ title: "Acta actualizada" });
      setEditingActa(null);
      actaForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteActaMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comite-convivencia-actas/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al eliminar acta");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-actas", effectiveCompanyId] });
      toast({ title: "Acta eliminada" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const uploadActaFileMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/convivencia-actas/${id}/upload`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al subir archivo");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/convivencia-actas", effectiveCompanyId] });
      toast({ title: "Archivo subido", description: "El documento se adjuntó correctamente." });
      setUploadingActaId(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setUploadingActaId(null);
    },
  });

  const handleAdvancePhase = () => {
    if (!activeElection) return;
    const currentIndex = ELECTION_PHASES.findIndex(p => p.key === activeElection.estado);
    if (currentIndex < ELECTION_PHASES.length - 1) {
      const nextPhase = ELECTION_PHASES[currentIndex + 1].key;
      updateEleccionMutation.mutate({ id: activeElection.id, data: { estado: nextPhase } });
    }
  };

  const onSubmitPeriodo = (data: Omit<InsertConvivenciaPeriodo, 'companyId'>) => {
    if (!effectiveCompanyId) {
      toast({ variant: "destructive", title: "Error", description: "No hay empresa seleccionada" });
      return;
    }
    createPeriodoMutation.mutate({ ...data, companyId: effectiveCompanyId });
  };

  const onSubmitEleccion = (data: Omit<InsertConvivenciaEleccion, 'companyId'>) => {
    if (!effectiveCompanyId) {
      toast({ variant: "destructive", title: "Error", description: "No hay empresa seleccionada" });
      return;
    }
    createEleccionMutation.mutate({
      ...data,
      companyId: effectiveCompanyId,
    });
  };

  const onSubmitMiembro = (data: InsertConvivenciaMiembro) => {
    if (!activePeriodo?.id) return;
    createMiembroMutation.mutate({ ...data, periodoId: activePeriodo.id });
  };

  const onSubmitCandidato = (data: InsertConvivenciaCandidato) => {
    if (!activeElection?.id) return;
    createCandidatoMutation.mutate({ ...data, eleccionId: activeElection.id });
  };

  const openMiembroDialog = () => {
    miembroForm.reset({
      workerId: "",
      periodoId: "",
      representacion: 'empleador',
      cargo: 'miembro_principal',
      fechaDesignacion: format(new Date(), "yyyy-MM-dd"),
      estado: 'activo',
    });
    setIsAddMiembroOpen(true);
  };

  const openCandidatoDialog = () => {
    candidatoForm.reset({
      workerId: "",
      eleccionId: "",
      fechaInscripcion: format(new Date(), "yyyy-MM-dd"),
      propuestaLaboral: "",
      estado: 'inscrito',
      votosRecibidos: 0,
    });
    setIsRegisterCandidateOpen(true);
  };

  const openEditActaDialog = (acta: ConvivenciaActa) => {
    actaForm.reset({
      companyId: acta.companyId,
      tipo: acta.tipo,
      numero: acta.numero,
      fecha: acta.fecha,
      asunto: acta.asunto,
      contenido: acta.contenido,
      asistentes: acta.asistentes || [],
      acuerdos: acta.acuerdos || [],
      observaciones: acta.observaciones || "",
    });
    // Cargar firmas existentes
    const firmas = acta.firmas as Array<{ workerId?: string; cargo: string }> | null;
    if (firmas) {
      const presidente = firmas.find(f => f.cargo === 'presidente');
      const secretario = firmas.find(f => f.cargo === 'secretario');
      setFirmaPresidenteId(presidente?.workerId || "");
      setFirmaSecretarioId(secretario?.workerId || "");
    } else {
      setFirmaPresidenteId("");
      setFirmaSecretarioId("");
    }
    setEditingActa(acta);
  };

  const openCreateActaDialog = () => {
    actaForm.reset({
      companyId: effectiveCompanyId,
      tipo: "sesion",
      numero: (actas.length > 0 ? Math.max(...actas.map(a => a.numero)) + 1 : 1),
      fecha: format(new Date(), "yyyy-MM-dd"),
      asunto: "",
      contenido: "",
      asistentes: [],
      acuerdos: [],
      observaciones: "",
    });
    // Pre-seleccionar presidente y secretario del comité si existen
    const presidente = miembros.find(m => m.cargo === 'presidente' && m.estado === 'activo');
    const secretario = miembros.find(m => m.cargo === 'secretario' && m.estado === 'activo');
    setFirmaPresidenteId(presidente?.workerId || "");
    setFirmaSecretarioId(secretario?.workerId || "");
    setIsCreateActaOpen(true);
  };

  const onSubmitActa = (data: InsertConvivenciaActa) => {
    // Construir objeto de firmas
    const firmas: Array<{ workerId: string; nombre: string; cargo: string; firmado: boolean }> = [];
    if (firmaPresidenteId) {
      const worker = workers.find(w => w.id === firmaPresidenteId);
      firmas.push({
        workerId: firmaPresidenteId,
        nombre: worker?.name || 'Presidente',
        cargo: 'presidente',
        firmado: false,
      });
    }
    if (firmaSecretarioId) {
      const worker = workers.find(w => w.id === firmaSecretarioId);
      firmas.push({
        workerId: firmaSecretarioId,
        nombre: worker?.name || 'Secretario',
        cargo: 'secretario',
        firmado: false,
      });
    }
    
    const dataWithFirmas = { ...data, firmas: firmas.length > 0 ? firmas : null };
    
    if (editingActa) {
      updateActaMutation.mutate({ id: editingActa.id, data: dataWithFirmas });
    } else {
      createActaMutation.mutate({ ...dataWithFirmas, companyId: effectiveCompanyId });
    }
  };

  const handleFileUpload = (actaId: string, file: File) => {
    setUploadingActaId(actaId);
    uploadActaFileMutation.mutate({ id: actaId, file });
  };

  const empleadorMiembros = miembros.filter(m => m.representacion === 'empleador');
  const trabajadorMiembros = miembros.filter(m => m.representacion === 'trabajador');

  const getCargoLabel = (cargo: string) => {
    switch (cargo) {
      case 'presidente': return 'Presidente';
      case 'secretario': return 'Secretario';
      case 'miembro_principal': return 'Principal';
      case 'miembro_suplente': return 'Suplente';
      default: return cargo;
    }
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
    <div className="container mx-auto py-6 space-y-6">
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Gestión Comité de Convivencia Laboral</h1>
          <p className="text-muted-foreground">
            Resolución 652/2012 - Resolución 1356/2012
          </p>
        </div>
      </div>

      {(() => {
        const estandar = getEstandarByCodigo('1.1.8');
        return estandar ? (
          <AutomationAssistant
            titulo="Conformación Comité de Convivencia Laboral"
            estandar={estandar.codigo}
            descripcion="Conformación y funcionamiento del Comité de Convivencia Laboral según Resolución 652/2012 y Resolución 1356/2012"
            normativaAplicable={estandar.normativaAplicable.map(n => ({
              codigo: n.codigo,
              norma: n.norma,
              articulo: n.articulo,
              descripcion: n.descripcion,
              requisitos: n.requisitos,
              obligatorio: n.obligatorio
            }))}
            compact={true}
          />
        ) : null;
      })()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="periodo" data-testid="tab-periodo">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </TabsTrigger>
          <TabsTrigger value="electoral" data-testid="tab-elecciones">
            <Vote className="h-4 w-4 mr-2" />
            Elecciones
          </TabsTrigger>
          <TabsTrigger value="miembros" data-testid="tab-miembros">
            <Users className="h-4 w-4 mr-2" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="actas" data-testid="tab-actas">
            <FileText className="h-4 w-4 mr-2" />
            Actas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periodo" className="space-y-4">
          {loadingPeriodo ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : activePeriodo ? (
            <>
              {isExpiringSoon && (
                <Alert variant="default" className="border-yellow-500 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Período próximo a vencer</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    El período actual vence en {daysUntilExpiry} días. Inicie el proceso electoral para renovar el Comité.
                  </AlertDescription>
                </Alert>
              )}
              {isExpired && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Período vencido</AlertTitle>
                  <AlertDescription>
                    El período del Comité de Convivencia ha vencido. Debe crear un nuevo período y realizar elecciones.
                  </AlertDescription>
                </Alert>
              )}
              <Card data-testid="card-periodo-activo">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Período Vigente
                        <Badge variant={isExpired ? "destructive" : "default"} data-testid="badge-estado">
                          {activePeriodo.estado === 'activo' ? 'Activo' : activePeriodo.estado}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Comité de Convivencia Laboral
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`/api/convivencia-periodos/${activePeriodo.id}/acta-constitucion-pdf`, '_blank')} 
                        data-testid="button-descargar-acta-constitucion"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Acta Constitución
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsCreatePeriodoOpen(true)} data-testid="button-nuevo-periodo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Período
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Vigencia</p>
                      <p className="font-medium" data-testid="text-vigencia">2 años</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                      <p className="font-medium" data-testid="text-fecha-inicio">
                        {format(parseISO(activePeriodo.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                      <p className="font-medium" data-testid="text-fecha-fin">
                        {format(parseISO(activePeriodo.fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card data-testid="card-sin-periodo">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No hay período activo</h3>
                <p className="text-muted-foreground mb-4">
                  Debe crear un período para conformar el Comité de Convivencia Laboral
                </p>
                <Button onClick={() => setIsCreatePeriodoOpen(true)} data-testid="button-crear-periodo">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Período
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="electoral" className="space-y-4">
          {loadingElecciones ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : activeElection ? (
            <>
              <Card data-testid="card-eleccion-activa">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Proceso Electoral en Curso
                    <Badge data-testid="badge-fase-electoral">
                      {ELECTION_PHASES.find(p => p.key === activeElection.estado)?.label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {activeElection.principalesRequeridos} principales + {activeElection.suplentesRequeridos} suplentes por cada parte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                    {ELECTION_PHASES.map((phase, index) => {
                      const currentIndex = ELECTION_PHASES.findIndex(p => p.key === activeElection.estado);
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      return (
                        <div key={phase.key} className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            isCompleted ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <span className={`text-sm whitespace-nowrap ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                            {phase.label}
                          </span>
                          {index < ELECTION_PHASES.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Convocatoria</p>
                      <p className="font-medium">{format(parseISO(activeElection.fechaConvocatoria), "d MMM yyyy", { locale: es })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Inscripción</p>
                      <p className="font-medium">
                        {format(parseISO(activeElection.fechaInicioInscripcion), "d MMM", { locale: es })} - {format(parseISO(activeElection.fechaFinInscripcion), "d MMM", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Votación</p>
                      <p className="font-medium">{format(parseISO(activeElection.fechaVotacion), "d MMM yyyy", { locale: es })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Horario</p>
                      <p className="font-medium">{activeElection.horaInicioVotacion} - {activeElection.horaFinVotacion}</p>
                    </div>
                  </div>

                  {/* SST-2025-0097: Publicación en Portal de Empleados */}
                  <div className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${
                    activeElection.publicadoEnPortal 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                      : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      {activeElection.publicadoEnPortal ? (
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {activeElection.publicadoEnPortal 
                            ? 'Visible en Portal de Empleados' 
                            : 'No visible en Portal de Empleados'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeElection.publicadoEnPortal 
                            ? 'Los trabajadores pueden ver y participar en esta elección' 
                            : 'Los trabajadores no pueden ver esta elección aún'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={activeElection.publicadoEnPortal ? "outline" : "default"}
                      size="sm"
                      onClick={() => updateEleccionMutation.mutate({ 
                        id: activeElection.id, 
                        data: { publicadoEnPortal: !activeElection.publicadoEnPortal } 
                      })}
                      disabled={updateEleccionMutation.isPending}
                      data-testid="button-toggle-publicar-portal"
                    >
                      {updateEleccionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {activeElection.publicadoEnPortal ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ocultar del Portal
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publicar en Portal
                        </>
                      )}
                    </Button>
                  </div>

                  {activeElection.estado === 'inscripcion' && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                        <h4 className="font-medium">Candidatos Inscritos ({candidatos.length})</h4>
                        <Button size="sm" onClick={openCandidatoDialog} data-testid="button-inscribir-candidato">
                          <Plus className="h-4 w-4 mr-2" />
                          Inscribir Candidato
                        </Button>
                      </div>
                      {candidatos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {candidatos.map(c => {
                            const worker = workers.find(w => w.id === c.workerId);
                            return (
                              <Card key={c.id} className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback>{worker?.name?.charAt(0) || '?'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{worker?.name || 'Sin nombre'}</p>
                                    <p className="text-xs text-muted-foreground">{worker?.position || 'Sin cargo'}</p>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No hay candidatos inscritos aún</p>
                      )}
                    </div>
                  )}

                  {activeElection.estado === 'votacion' && (
                    <Alert>
                      <Vote className="h-4 w-4" />
                      <AlertTitle>Votación en Curso</AlertTitle>
                      <AlertDescription>
                        Los trabajadores pueden emitir su voto en el portal de empleados.
                      </AlertDescription>
                    </Alert>
                  )}

                  {activeElection.estado === 'escrutinio' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Resultados del Escrutinio</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidato</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead className="text-right">Votos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidatos
                            .slice()
                            .sort((a, b) => (b.votosRecibidos || 0) - (a.votosRecibidos || 0))
                            .map(c => {
                              const worker = workers.find(w => w.id === c.workerId);
                              return (
                                <TableRow key={c.id}>
                                  <TableCell className="font-medium">{worker?.name || 'Sin nombre'}</TableCell>
                                  <TableCell>{worker?.position || '-'}</TableCell>
                                  <TableCell className="text-right">{c.votosRecibidos || 0}</TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {activeElection.estado !== 'completada' && (
                    <div className="flex justify-between gap-4 flex-wrap">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`/api/convivencia-elecciones/${activeElection.id}/convocatoria-pdf`, '_blank')} 
                        data-testid="button-descargar-convocatoria"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Convocatoria
                      </Button>
                      <Button onClick={handleAdvancePhase} disabled={updateEleccionMutation.isPending} data-testid="button-avanzar-fase">
                        {updateEleccionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Avanzar a Siguiente Fase
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card data-testid="card-sin-eleccion">
              <CardContent className="p-6 text-center">
                <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No hay proceso electoral activo</h3>
                <p className="text-muted-foreground mb-4">
                  Inicie un proceso electoral para elegir representantes de los trabajadores al Comité de Convivencia
                </p>
                <Button onClick={() => setIsCreateEleccionOpen(true)} data-testid="button-iniciar-eleccion">
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Proceso Electoral
                </Button>
              </CardContent>
            </Card>
          )}

          {completedElection && (
            <Card data-testid="card-resultados">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle>Resultados Última Elección</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/api/convivencia-elecciones/${completedElection.id}/acta-escrutinio-pdf`, '_blank')} 
                    data-testid="button-descargar-acta-escrutinio"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Acta de Escrutinio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Votantes</p>
                    <p className="font-medium text-lg">{completedElection.totalVotantes || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votos Válidos</p>
                    <p className="font-medium text-lg">{completedElection.votosValidos || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votos Nulos</p>
                    <p className="font-medium text-lg">{completedElection.votosNulos || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Votos en Blanco</p>
                    <p className="font-medium text-lg">{completedElection.votosEnBlanco || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="miembros" className="space-y-4">
          {!activePeriodo ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sin período activo</AlertTitle>
              <AlertDescription>
                Debe crear un período activo antes de agregar miembros al Comité de Convivencia.
              </AlertDescription>
            </Alert>
          ) : loadingMiembros ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={openMiembroDialog} data-testid="button-agregar-miembro">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Miembro
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card data-testid="card-empleador">
                  <CardHeader>
                    <CardTitle className="text-lg">Representantes del Empleador</CardTitle>
                    <CardDescription>Designados por la empresa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {empleadorMiembros.length > 0 ? (
                      <div className="space-y-3">
                        {empleadorMiembros.map(m => {
                          const worker = workers.find(w => w.id === m.workerId);
                          return (
                            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`miembro-${m.id}`}>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{worker?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{worker?.name || 'Sin nombre'}</p>
                                    {m.cargo === 'presidente' && <Badge variant="default" className="text-xs"><Crown className="h-3 w-3 mr-1" />Presidente</Badge>}
                                    {m.cargo === 'secretario' && <Badge variant="secondary" className="text-xs">Secretario</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {getCargoLabel(m.cargo)} • {worker?.position || 'Sin cargo'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={m.estado === 'activo' ? 'default' : 'secondary'}>
                                {m.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">No hay representantes del empleador</p>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-trabajadores">
                  <CardHeader>
                    <CardTitle className="text-lg">Representantes de los Trabajadores</CardTitle>
                    <CardDescription>Elegidos por votación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trabajadorMiembros.length > 0 ? (
                      <div className="space-y-3">
                        {trabajadorMiembros.map(m => {
                          const worker = workers.find(w => w.id === m.workerId);
                          return (
                            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`miembro-${m.id}`}>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{worker?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{worker?.name || 'Sin nombre'}</p>
                                    {m.cargo === 'presidente' && <Badge variant="default" className="text-xs"><Crown className="h-3 w-3 mr-1" />Presidente</Badge>}
                                    {m.cargo === 'secretario' && <Badge variant="secondary" className="text-xs">Secretario</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {getCargoLabel(m.cargo)} • {m.votosObtenidos ? `${m.votosObtenidos} votos` : 'Sin votos'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={m.estado === 'activo' ? 'default' : 'secondary'}>
                                {m.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">No hay representantes de los trabajadores</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="actas" className="space-y-4">
          <Card data-testid="card-lista-actas">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Actas del Comité</CardTitle>
                <CardDescription>Actas de convocatoria, escrutinio, constitución y sesiones</CardDescription>
              </div>
              <Button onClick={openCreateActaDialog} data-testid="button-nueva-acta">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Acta
              </Button>
            </CardHeader>
            <CardContent>
              {loadingActas ? (
                <Skeleton className="h-32" />
              ) : actas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Asunto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actas.slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(acta => (
                      <TableRow key={acta.id} data-testid={`acta-row-${acta.id}`}>
                        <TableCell className="font-medium">{acta.numero}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {acta.tipo === 'convocatoria' ? 'Convocatoria' :
                             acta.tipo === 'escrutinio' ? 'Escrutinio' :
                             acta.tipo === 'constitucion' ? 'Constitución' :
                             acta.tipo === 'sesion' ? 'Sesión' :
                             acta.tipo === 'queja' ? 'Queja' : acta.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(acta.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{acta.asunto}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {acta.documentoUrl ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(acta.documentoUrl!, '_blank')}
                                data-testid={`button-descargar-acta-${acta.id}`}
                                title="Descargar documento"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            ) : (
                              <label>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  disabled={uploadingActaId === acta.id}
                                  data-testid={`button-subir-acta-${acta.id}`}
                                  title="Subir documento"
                                >
                                  <span>
                                    {uploadingActaId === acta.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4" />
                                    )}
                                  </span>
                                </Button>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(acta.id, file);
                                  }}
                                />
                              </label>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditActaDialog(acta)}
                              data-testid={`button-editar-acta-${acta.id}`}
                              title="Editar acta"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('¿Está seguro de eliminar esta acta?')) {
                                  deleteActaMutation.mutate(acta.id);
                                }
                              }}
                              disabled={deleteActaMutation.isPending}
                              data-testid={`button-eliminar-acta-${acta.id}`}
                              title="Eliminar acta"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No hay actas registradas</p>
                  <Button onClick={openCreateActaDialog} data-testid="button-crear-primera-acta">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Acta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreatePeriodoOpen} onOpenChange={setIsCreatePeriodoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Período</DialogTitle>
          </DialogHeader>
          <Form {...periodoForm}>
            <form onSubmit={periodoForm.handleSubmit(onSubmitPeriodo)} className="space-y-4">
              <FormField
                control={periodoForm.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-inicio" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={periodoForm.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin (2 años)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-fin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={periodoForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Observaciones adicionales" data-testid="input-observaciones" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreatePeriodoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPeriodoMutation.isPending} data-testid="button-guardar-periodo">
                  {createPeriodoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateEleccionOpen} onOpenChange={setIsCreateEleccionOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Iniciar Proceso Electoral</DialogTitle>
          </DialogHeader>
          <Form {...eleccionForm}>
            <form onSubmit={eleccionForm.handleSubmit(onSubmitEleccion)} className="space-y-4">
              <FormField
                control={eleccionForm.control}
                name="fechaConvocatoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Convocatoria</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-convocatoria" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eleccionForm.control}
                  name="fechaInicioInscripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio Inscripción</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-inicio-inscripcion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eleccionForm.control}
                  name="fechaFinInscripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin Inscripción</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-fin-inscripcion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={eleccionForm.control}
                name="fechaVotacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Votación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-votacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eleccionForm.control}
                  name="horaInicioVotacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ""} data-testid="input-hora-inicio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eleccionForm.control}
                  name="horaFinVotacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ""} data-testid="input-hora-fin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eleccionForm.control}
                  name="principalesRequeridos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principales por parte</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onBlur={() => { if (field.value === '' || field.value == null) field.onChange(2); }}
                          data-testid="input-principales-requeridos"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eleccionForm.control}
                  name="suplentesRequeridos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suplentes por parte</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onBlur={() => { if (field.value === '' || field.value == null) field.onChange(2); }}
                          data-testid="input-suplentes-requeridos"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={eleccionForm.control}
                name="modalidadVotacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad de Votación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'presencial'}>
                      <FormControl>
                        <SelectTrigger data-testid="select-modalidad-votacion">
                          <SelectValue placeholder="Seleccionar modalidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="mixta">Mixta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateEleccionOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEleccionMutation.isPending} data-testid="button-iniciar-eleccion-submit">
                  {createEleccionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Iniciar Proceso
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMiembroOpen} onOpenChange={setIsAddMiembroOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Miembro al Comité de Convivencia</DialogTitle>
          </DialogHeader>
          <Form {...miembroForm}>
            <form onSubmit={miembroForm.handleSubmit(onSubmitMiembro)} className="space-y-4">
              <FormField
                control={miembroForm.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-worker">
                          <SelectValue placeholder="Seleccionar trabajador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workers.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name} - {w.position}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={miembroForm.control}
                name="representacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Representación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-representacion">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="empleador">Representante del Empleador</SelectItem>
                        <SelectItem value="trabajador">Representante de Trabajadores</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={miembroForm.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo en el Comité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cargo">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="presidente">Presidente</SelectItem>
                        <SelectItem value="secretario">Secretario</SelectItem>
                        <SelectItem value="miembro_principal">Miembro Principal</SelectItem>
                        <SelectItem value="miembro_suplente">Miembro Suplente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={miembroForm.control}
                name="fechaDesignacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Designación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-designacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddMiembroOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMiembroMutation.isPending} data-testid="button-guardar-miembro">
                  {createMiembroMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterCandidateOpen} onOpenChange={setIsRegisterCandidateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribir Candidato</DialogTitle>
          </DialogHeader>
          <Form {...candidatoForm}>
            <form onSubmit={candidatoForm.handleSubmit(onSubmitCandidato)} className="space-y-4">
              <FormField
                control={candidatoForm.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-candidato-worker">
                          <SelectValue placeholder="Seleccionar candidato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workers.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name} - {w.position}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={candidatoForm.control}
                name="propuestaLaboral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Propuesta Laboral (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Propuesta del candidato para el comité" data-testid="input-propuesta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRegisterCandidateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCandidatoMutation.isPending} data-testid="button-inscribir-candidato-submit">
                  {createCandidatoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Inscribir
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateActaOpen || !!editingActa} onOpenChange={(open) => {
        if (!open) {
          setIsCreateActaOpen(false);
          setEditingActa(null);
          actaForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActa ? 'Editar Acta' : 'Nueva Acta'}</DialogTitle>
          </DialogHeader>
          <Form {...actaForm}>
            <form onSubmit={actaForm.handleSubmit(onSubmitActa)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={actaForm.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Acta *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onBlur={() => { if (field.value === '' || field.value == null) field.onChange(1); }}
                          data-testid="input-numero-acta" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={actaForm.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Acta *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-acta">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="convocatoria">Convocatoria</SelectItem>
                          <SelectItem value="escrutinio">Escrutinio</SelectItem>
                          <SelectItem value="constitucion">Constitución</SelectItem>
                          <SelectItem value="sesion">Sesión</SelectItem>
                          <SelectItem value="queja">Queja</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={actaForm.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-acta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={actaForm.control}
                name="asunto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tema principal del acta" data-testid="input-asunto-acta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={actaForm.control}
                name="contenido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={6}
                        placeholder="Desarrollo de la reunión, temas tratados, acuerdos..." 
                        data-testid="input-contenido-acta" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={actaForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ''}
                        rows={3}
                        placeholder="Observaciones adicionales (opcional)" 
                        data-testid="input-observaciones-acta" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  Firmantes del Acta
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firma-presidente">Presidente</Label>
                    <Select 
                      value={firmaPresidenteId || "none"} 
                      onValueChange={(val) => setFirmaPresidenteId(val === "none" ? "" : val)}
                    >
                      <SelectTrigger id="firma-presidente" data-testid="select-firma-presidente">
                        <SelectValue placeholder="Seleccionar presidente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin firmar</SelectItem>
                        {miembros.filter(m => m.estado === 'activo' && m.workerId).map(m => {
                          const worker = workers.find(w => w.id === m.workerId);
                          return (
                            <SelectItem key={m.id} value={m.workerId}>
                              {worker?.name || 'Sin nombre'} ({getCargoLabel(m.cargo)})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firma-secretario">Secretario</Label>
                    <Select 
                      value={firmaSecretarioId || "none"} 
                      onValueChange={(val) => setFirmaSecretarioId(val === "none" ? "" : val)}
                    >
                      <SelectTrigger id="firma-secretario" data-testid="select-firma-secretario">
                        <SelectValue placeholder="Seleccionar secretario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin firmar</SelectItem>
                        {miembros.filter(m => m.estado === 'activo' && m.workerId).map(m => {
                          const worker = workers.find(w => w.id === m.workerId);
                          return (
                            <SelectItem key={m.id} value={m.workerId}>
                              {worker?.name || 'Sin nombre'} ({getCargoLabel(m.cargo)})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateActaOpen(false);
                    setEditingActa(null);
                    actaForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createActaMutation.isPending || updateActaMutation.isPending} 
                  data-testid="button-guardar-acta"
                >
                  {(createActaMutation.isPending || updateActaMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingActa ? 'Actualizar' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
