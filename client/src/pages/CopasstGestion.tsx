import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  CopasstPeriodo, InsertCopasstPeriodo, insertCopasstPeriodoSchema,
  CopasstMiembro, InsertCopasstMiembro, insertCopasstMiembroSchema,
  CopasstEleccion, InsertCopasstEleccion, insertCopasstEleccionSchema,
  CopasstCandidato, InsertCopasstCandidato, insertCopasstCandidatoSchema,
  CopasstActa, InsertCopasstActa, insertCopasstActaSchema, Worker, User as UserType, Company
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Plus, Calendar, Users, Vote, FileText, AlertTriangle,
  CheckCircle, Clock, User, Crown, Pencil, ChevronRight, Download,
  Trash2, Search, Printer, Upload, X, Eye, EyeOff, CalendarDays
} from "lucide-react";
import { Link } from "wouter";
import { format, addYears, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

function calcularComposicion(numTrabajadores: number) {
  if (numTrabajadores < 10) return { tipo: 'vigia', principales: 1, suplentes: 0 };
  if (numTrabajadores <= 49) return { tipo: 'copasst', principales: 1, suplentes: 1 };
  if (numTrabajadores <= 499) return { tipo: 'copasst', principales: 2, suplentes: 2 };
  if (numTrabajadores <= 999) return { tipo: 'copasst', principales: 3, suplentes: 3 };
  return { tipo: 'copasst', principales: 4, suplentes: 4 };
}

const ELECTION_PHASES = [
  { key: 'convocatoria', label: 'Convocatoria' },
  { key: 'inscripcion', label: 'Inscripción' },
  { key: 'votacion', label: 'Votación' },
  { key: 'escrutinio', label: 'Escrutinio' },
  { key: 'completada', label: 'Completada' },
];

export default function CopasstGestion() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("periodo");
  const [isCreatePeriodoOpen, setIsCreatePeriodoOpen] = useState(false);
  const [isCreateEleccionOpen, setIsCreateEleccionOpen] = useState(false);
  const [isAddMiembroOpen, setIsAddMiembroOpen] = useState(false);
  const [isRegisterCandidateOpen, setIsRegisterCandidateOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // States for actas management
  const [isCreateActaOpen, setIsCreateActaOpen] = useState(false);
  const [isEditActaOpen, setIsEditActaOpen] = useState(false);
  const [deleteActaId, setDeleteActaId] = useState<string | null>(null);
  const [editingActa, setEditingActa] = useState<CopasstActa | null>(null);
  const [actaSearchTerm, setActaSearchTerm] = useState("");

  // Workers selected for create acta form
  const [selectedActaPresidente, setSelectedActaPresidente] = useState<Worker | null>(null);
  const [selectedActaSecretaria, setSelectedActaSecretaria] = useState<Worker | null>(null);

  // Workers selected for edit acta form
  const [editSelectedActaPresidente, setEditSelectedActaPresidente] = useState<Worker | null>(null);
  const [editSelectedActaSecretaria, setEditSelectedActaSecretaria] = useState<Worker | null>(null);

  // File upload state for actas
  const actaCreateFileInputRef = useRef<HTMLInputElement>(null);
  const [actaCreateSelectedFile, setActaCreateSelectedFile] = useState<File | null>(null);
  const actaFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingActaId, setUploadingActaId] = useState<string | null>(null);

  // Get current user and companies
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Determine effective companyId (for superadmin, use selected company, first company, or user's company as fallback)
  const isSuperAdmin = user?.role === "superadmin";
  const effectiveCompanyId = isSuperAdmin 
    ? (selectedCompanyId || companies[0]?.id || user?.companyId || "") 
    : (user?.companyId || "");

  // Set default company for superadmin when companies load
  useEffect(() => {
    if (isSuperAdmin && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [isSuperAdmin, companies, selectedCompanyId]);

  const { data: activePeriodo, isLoading: loadingPeriodo } = useQuery<CopasstPeriodo | null>({
    queryKey: ["/api/copasst-periodos/activo", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/copasst-periodos/activo", {
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

  const { data: elecciones = [], isLoading: loadingElecciones } = useQuery<CopasstEleccion[]>({
    queryKey: ["/api/copasst-elecciones", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/copasst-elecciones", {
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

  const { data: miembros = [], isLoading: loadingMiembros } = useQuery<(CopasstMiembro & { worker?: Worker })[]>({
    queryKey: ["/api/copasst-miembros", activePeriodo?.id, effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch(`/api/copasst-miembros/${activePeriodo?.id}`, {
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

  const { data: candidatos = [] } = useQuery<(CopasstCandidato & { worker?: Worker })[]>({
    queryKey: ["/api/copasst-candidatos", activeElection?.id, effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch(`/api/copasst-candidatos/${activeElection?.id}`, {
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

  const { data: actas = [], isLoading: loadingActas } = useQuery<CopasstActa[]>({
    queryKey: ["/api/copasst-actas", effectiveCompanyId],
    queryFn: async () => {
      const res = await fetch("/api/copasst-actas", {
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

  // Schema for client-side validation (companyId added on submit)
  const periodoFormSchema = insertCopasstPeriodoSchema.omit({ companyId: true });
  const eleccionFormSchema = insertCopasstEleccionSchema.omit({ companyId: true });

  const periodoForm = useForm<Omit<InsertCopasstPeriodo, 'companyId'>>({
    resolver: zodResolver(periodoFormSchema),
    defaultValues: {
      tipoComite: 'copasst',
      fechaInicio: format(new Date(), "yyyy-MM-dd"),
      fechaFin: format(addYears(new Date(), 2), "yyyy-MM-dd"),
      estado: 'activo',
    },
  });

  const eleccionForm = useForm<Omit<InsertCopasstEleccion, 'companyId'>>({
    resolver: zodResolver(eleccionFormSchema),
    defaultValues: {
      fechaConvocatoria: format(new Date(), "yyyy-MM-dd"),
      fechaInicioInscripcion: "",
      fechaFinInscripcion: "",
      fechaVotacion: "",
      horaInicioVotacion: "08:00",
      horaFinVotacion: "16:00",
      estado: 'convocatoria',
      totalTrabajadores: workers.length || 1,
      principalesRequeridos: 1,
      suplentesRequeridos: 1,
    },
  });

  const miembroForm = useForm<InsertCopasstMiembro>({
    resolver: zodResolver(insertCopasstMiembroSchema),
    defaultValues: {
      workerId: "",
      periodoId: "",
      tipoRepresentante: 'empleador',
      rolMiembro: 'principal',
      cargo: 'miembro',
      fechaDesignacion: format(new Date(), "yyyy-MM-dd"),
      activo: true,
      capacitado: false,
    },
  });

  const candidatoForm = useForm<InsertCopasstCandidato>({
    resolver: zodResolver(insertCopasstCandidatoSchema),
    defaultValues: {
      workerId: "",
      eleccionId: "",
      fechaInscripcion: format(new Date(), "yyyy-MM-dd"),
      propuestas: "",
      aceptaCandidatura: true,
      estado: 'inscrito',
      votosObtenidos: 0,
    },
  });

  // Forms for actas
  const actaCreateForm = useForm<InsertCopasstActa>({
    resolver: zodResolver(insertCopasstActaSchema),
    defaultValues: {
      fecha: format(new Date(), "yyyy-MM-dd"),
      notas: "",
      presidenteWorkerId: null,
      presidente: null,
      secretariaWorkerId: null,
      secretaria: null,
    },
  });

  const actaEditForm = useForm<InsertCopasstActa>({
    resolver: zodResolver(insertCopasstActaSchema),
  });

  const createPeriodoMutation = useMutation({
    mutationFn: async (data: InsertCopasstPeriodo) => {
      const res = await fetch("/api/copasst-periodos", {
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
      // Invalidate all COPASST periodo queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-periodos"] });
      // Must include effectiveCompanyId since query uses ["/api/copasst-periodos/activo", effectiveCompanyId]
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-periodos/activo", effectiveCompanyId] });
      toast({ title: "Período COPASST creado", description: "El período se creó exitosamente." });
      setIsCreatePeriodoOpen(false);
      periodoForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createEleccionMutation = useMutation({
    mutationFn: async (data: InsertCopasstEleccion) => {
      const res = await fetch("/api/copasst-elecciones", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-elecciones", effectiveCompanyId] });
      toast({ title: "Elección creada", description: "El proceso electoral ha iniciado." });
      setIsCreateEleccionOpen(false);
      eleccionForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateEleccionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CopasstEleccion> }) => {
      const res = await fetch(`/api/copasst-elecciones/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-elecciones", effectiveCompanyId] });
      toast({ title: "Elección actualizada" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createMiembroMutation = useMutation({
    mutationFn: async (data: InsertCopasstMiembro) => {
      const res = await fetch("/api/copasst-miembros", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-miembros", activePeriodo?.id, effectiveCompanyId] });
      toast({ title: "Miembro agregado", description: "El miembro se agregó al COPASST." });
      setIsAddMiembroOpen(false);
      miembroForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMiembroMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CopasstMiembro> }) => {
      const res = await fetch(`/api/copasst-miembros/${id}`, {
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
        throw new Error(errorText || "Error al actualizar miembro");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-miembros", activePeriodo?.id, effectiveCompanyId] });
      toast({ title: "Miembro actualizado" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createCandidatoMutation = useMutation({
    mutationFn: async (data: InsertCopasstCandidato) => {
      const res = await fetch("/api/copasst-candidatos", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-candidatos", activeElection?.id, effectiveCompanyId] });
      toast({ title: "Candidatura registrada" });
      setIsRegisterCandidateOpen(false);
      candidatoForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateCandidatoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCopasstCandidato> }) => {
      const res = await fetch(`/api/copasst-candidatos/${id}`, {
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
        throw new Error(errorText || "Error al actualizar candidato");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-candidatos", activeElection?.id, effectiveCompanyId] });
      toast({ title: "Candidato actualizado" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Mutations for actas
  const createActaMutation = useMutation({
    mutationFn: async (data: InsertCopasstActa) => {
      const res = await apiRequest("POST", "/api/copasst-actas", data);
      const newActa = await res.json();
      if (actaCreateSelectedFile && newActa.id) {
        const formData = new FormData();
        formData.append('archivo', actaCreateSelectedFile);
        await fetch(`/api/copasst-actas/${newActa.id}/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
          },
        });
      }
      return newActa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-actas", effectiveCompanyId] });
      toast({
        title: "Acta COPASST creada",
        description: actaCreateSelectedFile 
          ? "El acta se creó exitosamente con el archivo adjunto."
          : "El acta se creó exitosamente con número automático.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setIsCreateActaOpen(false);
      setSelectedActaPresidente(null);
      setSelectedActaSecretaria(null);
      setActaCreateSelectedFile(null);
      if (actaCreateFileInputRef.current) {
        actaCreateFileInputRef.current.value = '';
      }
      actaCreateForm.reset({
        fecha: format(new Date(), "yyyy-MM-dd"),
        notas: "",
        presidenteWorkerId: null,
        presidente: null,
        secretariaWorkerId: null,
        secretaria: null,
      });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateActaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertCopasstActa }) => {
      const res = await apiRequest("PATCH", `/api/copasst-actas/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-actas", effectiveCompanyId] });
      toast({
        title: "Acta actualizada",
        description: "El acta se actualizó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setIsEditActaOpen(false);
      setEditingActa(null);
      setEditSelectedActaPresidente(null);
      setEditSelectedActaSecretaria(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteActaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/copasst-actas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-actas", effectiveCompanyId] });
      toast({
        title: "Acta eliminada",
        description: "El acta se eliminó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setDeleteActaId(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const uploadActaFileMutation = useMutation({
    mutationFn: async ({ actaId, file }: { actaId: string; file: File }) => {
      const formData = new FormData();
      formData.append('archivo', file);
      const res = await fetch(`/api/copasst-actas/${actaId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          ...(effectiveCompanyId ? { "X-Company-Id": effectiveCompanyId } : {}),
        },
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json().catch(() => ({ error: 'Error al subir archivo' }));
          throw new Error(errorData.error || 'Error al subir archivo');
        } else {
          const textError = await res.text().catch(() => 'Error al subir archivo');
          throw new Error(textError || 'Error al subir archivo');
        }
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-actas", effectiveCompanyId] });
      toast({
        title: "Archivo subido",
        description: "El archivo PDF se subió exitosamente.",
        className: "bg-green-50 border-green-200",
      });
      setUploadingActaId(null);
      if (actaFileInputRef.current) {
        actaFileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error al subir archivo", description: error.message });
      setUploadingActaId(null);
      if (actaFileInputRef.current) {
        actaFileInputRef.current.value = '';
      }
    },
  });

  const deleteActaFileMutation = useMutation({
    mutationFn: async (actaId: string) => {
      const res = await apiRequest("DELETE", `/api/copasst-actas/${actaId}/upload`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-actas", effectiveCompanyId] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo se eliminó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
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

  const onSubmitPeriodo = (data: Omit<InsertCopasstPeriodo, 'companyId'>) => {
    if (!effectiveCompanyId) {
      toast({ variant: "destructive", title: "Error", description: "No hay empresa seleccionada" });
      return;
    }
    createPeriodoMutation.mutate({ ...data, companyId: effectiveCompanyId });
  };

  const onSubmitEleccion = (data: Omit<InsertCopasstEleccion, 'companyId'>) => {
    if (!effectiveCompanyId) {
      toast({ variant: "destructive", title: "Error", description: "No hay empresa seleccionada" });
      return;
    }
    const composition = calcularComposicion(data.totalTrabajadores);
    createEleccionMutation.mutate({
      ...data,
      companyId: effectiveCompanyId,
      principalesRequeridos: composition.principales,
      suplentesRequeridos: composition.suplentes,
    });
  };

  const onSubmitMiembro = (data: InsertCopasstMiembro) => {
    if (!activePeriodo?.id) return;
    createMiembroMutation.mutate({ ...data, periodoId: activePeriodo.id });
  };

  const onSubmitCandidato = (data: InsertCopasstCandidato) => {
    if (!activeElection?.id) return;
    createCandidatoMutation.mutate({ ...data, eleccionId: activeElection.id });
  };

  // Funciones para abrir diálogos con reset de formulario
  const openMiembroDialog = () => {
    miembroForm.reset({
      workerId: "",
      periodoId: "",
      tipoRepresentante: 'empleador',
      rolMiembro: 'principal',
      cargo: 'miembro',
      fechaDesignacion: format(new Date(), "yyyy-MM-dd"),
      activo: true,
      capacitado: false,
    });
    setIsAddMiembroOpen(true);
  };

  const openCandidatoDialog = () => {
    candidatoForm.reset({
      workerId: "",
      eleccionId: "",
      fechaInscripcion: format(new Date(), "yyyy-MM-dd"),
      propuestas: "",
      aceptaCandidatura: true,
      estado: 'inscrito',
      votosObtenidos: 0,
    });
    setIsRegisterCandidateOpen(true);
  };

  // Handlers for actas
  const handleActaPresidenteSelect = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    setSelectedActaPresidente(worker || null);
    if (worker) {
      actaCreateForm.setValue('presidente', worker.name || null);
    }
  };

  const handleActaSecretariaSelect = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    setSelectedActaSecretaria(worker || null);
    if (worker) {
      actaCreateForm.setValue('secretaria', worker.name || null);
    }
  };

  const handleEditActaPresidenteSelect = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    setEditSelectedActaPresidente(worker || null);
    if (worker) {
      actaEditForm.setValue('presidente', worker.name || null);
    }
  };

  const handleEditActaSecretariaSelect = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    setEditSelectedActaSecretaria(worker || null);
    if (worker) {
      actaEditForm.setValue('secretaria', worker.name || null);
    }
  };

  const handleActaFileSelect = (actaId: string) => {
    setUploadingActaId(actaId);
    actaFileInputRef.current?.click();
  };

  const MAX_ACTA_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleActaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadingActaId) {
      if (file.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF.",
        });
        setUploadingActaId(null);
        if (actaFileInputRef.current) {
          actaFileInputRef.current.value = '';
        }
        return;
      }
      if (file.size > MAX_ACTA_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: "El archivo excede el límite de 10MB.",
        });
        setUploadingActaId(null);
        if (actaFileInputRef.current) {
          actaFileInputRef.current.value = '';
        }
        return;
      }
      uploadActaFileMutation.mutate({ actaId: uploadingActaId, file });
    } else if (actaFileInputRef.current) {
      actaFileInputRef.current.value = '';
    }
  };

  const handleActaCreate = (data: InsertCopasstActa) => {
    createActaMutation.mutate(data);
  };

  const handleActaEdit = (acta: CopasstActa) => {
    setEditingActa(acta);
    if (acta.presidenteWorkerId) {
      const presidenteWorker = workers.find(w => w.id === acta.presidenteWorkerId);
      setEditSelectedActaPresidente(presidenteWorker || null);
    } else {
      setEditSelectedActaPresidente(null);
    }
    if (acta.secretariaWorkerId) {
      const secretariaWorker = workers.find(w => w.id === acta.secretariaWorkerId);
      setEditSelectedActaSecretaria(secretariaWorker || null);
    } else {
      setEditSelectedActaSecretaria(null);
    }
    actaEditForm.reset({
      fecha: acta.fecha,
      notas: acta.notas,
      presidenteWorkerId: acta.presidenteWorkerId,
      presidente: acta.presidente,
      secretariaWorkerId: acta.secretariaWorkerId,
      secretaria: acta.secretaria,
    });
    setIsEditActaOpen(true);
  };

  const handleActaUpdate = (data: InsertCopasstActa) => {
    if (!editingActa) return;
    updateActaMutation.mutate({ id: editingActa.id, data });
  };

  const handleActaDownloadPdf = (actaId: string) => {
    window.open(`/api/copasst-actas/${actaId}/pdf`, '_blank');
  };

  // Filtered actas
  const filteredActas = actas.filter(
    (acta) =>
      acta.numeroActa.toLowerCase().includes(actaSearchTerm.toLowerCase()) ||
      (acta.presidente && acta.presidente.toLowerCase().includes(actaSearchTerm.toLowerCase())) ||
      (acta.secretaria && acta.secretaria.toLowerCase().includes(actaSearchTerm.toLowerCase()))
  );

  const empleadorMiembros = miembros.filter(m => m.tipoRepresentante === 'empleador');
  const trabajadorMiembros = miembros.filter(m => m.tipoRepresentante === 'trabajador');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const hasCurrentMonthActa = actas.some(a => {
    const actaDate = new Date(a.fecha);
    return actaDate.getMonth() === currentMonth && actaDate.getFullYear() === currentYear;
  });

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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Gestión COPASST</h1>
          <p className="text-muted-foreground">
            Comité Paritario de Seguridad y Salud en el Trabajo
          </p>
        </div>
      </div>

      {(() => {
        const estandar = getEstandarByCodigo('1.1.6');
        return estandar ? (
          <AutomationAssistant
            titulo="Conformación COPASST / Vigía SST"
            estandar={estandar.codigo}
            descripcion="Conformación y funcionamiento del COPASST según Resolución 2013/1986 y Decreto 1072/2015"
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
            Período Vigente
          </TabsTrigger>
          <TabsTrigger value="electoral" data-testid="tab-electoral">
            <Vote className="h-4 w-4 mr-2" />
            Proceso Electoral
          </TabsTrigger>
          <TabsTrigger value="miembros" data-testid="tab-miembros">
            <Users className="h-4 w-4 mr-2" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="actas" data-testid="tab-actas">
            <FileText className="h-4 w-4 mr-2" />
            Actas Mensuales
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
                    El período actual vence en {daysUntilExpiry} días. Inicie el proceso electoral para renovar el COPASST.
                  </AlertDescription>
                </Alert>
              )}
              {isExpired && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Período vencido</AlertTitle>
                  <AlertDescription>
                    El período del COPASST ha vencido. Debe crear un nuevo período y realizar elecciones.
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
                        {activePeriodo.tipoComite === 'vigia' ? 'Vigía SST' : 'COPASST'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`/api/copasst-periodos/${activePeriodo.id}/acta-constitucion-pdf`, '_blank')} 
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
                      <p className="text-sm text-muted-foreground">Tipo de Comité</p>
                      <p className="font-medium" data-testid="text-tipo-comite">
                        {activePeriodo.tipoComite === 'vigia' ? 'Vigía SST' : 'COPASST'}
                      </p>
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
                  Debe crear un período para conformar el COPASST
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
                    {activeElection.totalTrabajadores} trabajadores - {activeElection.principalesRequeridos} principales + {activeElection.suplentesRequeridos} suplentes
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
                      data-testid="button-toggle-publicar-portal-copasst"
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
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Fase de Escrutinio</AlertTitle>
                        <AlertDescription>
                          Revise los votos y marque los candidatos electos. Necesita {activeElection.principalesRequeridos || 1} principal(es) y {activeElection.suplentesRequeridos || 1} suplente(s).
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Resultados de Votación</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidato</TableHead>
                              <TableHead>Cargo</TableHead>
                              <TableHead className="text-center">Votos</TableHead>
                              <TableHead className="text-center">Estado</TableHead>
                              <TableHead className="text-center">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...candidatos]
                              .sort((a, b) => (b.votosObtenidos || 0) - (a.votosObtenidos || 0))
                              .map((c, index) => {
                                const worker = workers.find(w => w.id === c.workerId);
                                return (
                                  <TableRow key={c.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-muted-foreground">#{index + 1}</span>
                                        <span>{worker?.name || 'Sin nombre'}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{worker?.position || '-'}</TableCell>
                                    <TableCell className="text-center font-bold">{c.votosObtenidos || 0}</TableCell>
                                    <TableCell className="text-center">
                                      {c.estado === 'electo_principal' && (
                                        <Badge className="bg-green-600">Principal Electo</Badge>
                                      )}
                                      {c.estado === 'electo_suplente' && (
                                        <Badge className="bg-blue-600">Suplente Electo</Badge>
                                      )}
                                      {c.estado === 'inscrito' && (
                                        <Badge variant="secondary">Inscrito</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex gap-1 justify-center">
                                        <Button
                                          size="sm"
                                          variant={c.estado === 'electo_principal' ? 'default' : 'outline'}
                                          onClick={() => updateCandidatoMutation.mutate({
                                            id: c.id,
                                            data: { estado: c.estado === 'electo_principal' ? 'inscrito' : 'electo_principal' }
                                          })}
                                          disabled={updateCandidatoMutation.isPending}
                                          data-testid={`button-principal-${c.id}`}
                                        >
                                          <Crown className="h-3 w-3 mr-1" />
                                          Principal
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={c.estado === 'electo_suplente' ? 'default' : 'outline'}
                                          onClick={() => updateCandidatoMutation.mutate({
                                            id: c.id,
                                            data: { estado: c.estado === 'electo_suplente' ? 'inscrito' : 'electo_suplente' }
                                          })}
                                          disabled={updateCandidatoMutation.isPending}
                                          data-testid={`button-suplente-${c.id}`}
                                        >
                                          <User className="h-3 w-3 mr-1" />
                                          Suplente
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                        
                        {candidatos.length === 0 && (
                          <p className="text-muted-foreground text-sm text-center py-4">No hay candidatos registrados</p>
                        )}
                        
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          <span>Electos:</span>
                          <Badge variant="outline" className="bg-green-50">
                            {candidatos.filter(c => c.estado === 'electo_principal').length} / {activeElection.principalesRequeridos || 1} Principales
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50">
                            {candidatos.filter(c => c.estado === 'electo_suplente').length} / {activeElection.suplentesRequeridos || 1} Suplentes
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeElection.estado !== 'completada' && (
                    <div className="flex justify-between gap-4 flex-wrap">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`/api/copasst-elecciones/${activeElection.id}/convocatoria-pdf`, '_blank')} 
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
                  Inicie un proceso electoral para elegir representantes de los trabajadores
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
                    onClick={() => window.open(`/api/copasst-elecciones/${completedElection.id}/acta-escrutinio-pdf`, '_blank')} 
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
                Debe crear un período activo antes de agregar miembros al COPASST.
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
                                    {m.rolMiembro === 'principal' ? 'Principal' : 'Suplente'} • {worker?.position || 'Sin cargo'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={m.capacitado || false}
                                  onCheckedChange={(checked) => updateMiembroMutation.mutate({ id: m.id, data: { capacitado: !!checked } })}
                                  data-testid={`checkbox-capacitado-${m.id}`}
                                />
                                <span className="text-xs text-muted-foreground">Capacitado</span>
                              </div>
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
                                    {m.rolMiembro === 'principal' ? 'Principal' : 'Suplente'} • {m.votosObtenidos ? `${m.votosObtenidos} votos` : 'Sin votos'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={m.capacitado || false}
                                  onCheckedChange={(checked) => updateMiembroMutation.mutate({ id: m.id, data: { capacitado: !!checked } })}
                                  data-testid={`checkbox-capacitado-${m.id}`}
                                />
                                <span className="text-xs text-muted-foreground">Capacitado</span>
                              </div>
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
          {!hasCurrentMonthActa && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Acta pendiente</AlertTitle>
              <AlertDescription className="text-yellow-700">
                No se ha registrado el acta de la reunión mensual de {format(new Date(), "MMMM yyyy", { locale: es })}.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de acta, presidente o secretario..."
                value={actaSearchTerm}
                onChange={(e) => setActaSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-actas"
              />
            </div>
            <Button
              onClick={() => setIsCreateActaOpen(true)}
              className="gap-2"
              data-testid="button-create-acta"
            >
              <Plus className="h-4 w-4" />
              Nueva Acta
            </Button>
          </div>

          <Card data-testid="card-calendario-actas">
            <CardHeader>
              <CardTitle>Calendario de Reuniones {new Date().getFullYear()}</CardTitle>
              <CardDescription>Reuniones mensuales obligatorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const hasActa = actas.some(a => {
                    const actaDate = new Date(a.fecha);
                    return actaDate.getMonth() === i && actaDate.getFullYear() === currentYear;
                  });
                  const isPast = i < currentMonth;
                  const isCurrent = i === currentMonth;
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded text-center text-sm ${
                        hasActa ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                        isPast ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                        isCurrent ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                        'bg-muted text-muted-foreground'
                      }`}
                      data-testid={`mes-${i}`}
                    >
                      {format(new Date(currentYear, i, 1), "MMM", { locale: es })}
                      {hasActa && <CheckCircle className="h-3 w-3 mx-auto mt-1" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-lista-actas">
            <CardHeader>
              <CardTitle>Actas Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingActas ? (
                <Skeleton className="h-32" />
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número de Acta</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Presidente</TableHead>
                        <TableHead>Secretario(a)</TableHead>
                        <TableHead>Archivo Adjunto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron actas COPASST</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredActas.slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(acta => (
                          <TableRow key={acta.id} data-testid={`acta-row-${acta.id}`}>
                            <TableCell className="font-medium">{acta.numeroActa}</TableCell>
                            <TableCell>{new Date(acta.fecha).toLocaleDateString('es-CO')}</TableCell>
                            <TableCell>{acta.presidente || '-'}</TableCell>
                            <TableCell>{acta.secretaria || '-'}</TableCell>
                            <TableCell>
                              {acta.archivoAdjuntoUrl ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={acta.archivoAdjuntoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                                    title={acta.archivoAdjuntoNombre || 'Descargar archivo'}
                                    data-testid={`link-archivo-${acta.id}`}
                                  >
                                    <Download className="h-4 w-4" />
                                    <span className="max-w-[120px] truncate">{acta.archivoAdjuntoNombre || 'Archivo PDF'}</span>
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteActaFileMutation.mutate(acta.id)}
                                    disabled={deleteActaFileMutation.isPending}
                                    title="Eliminar archivo"
                                    data-testid={`button-delete-file-${acta.id}`}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActaFileSelect(acta.id)}
                                  disabled={uploadActaFileMutation.isPending && uploadingActaId === acta.id}
                                  data-testid={`button-upload-${acta.id}`}
                                  title="Subir PDF firmado"
                                >
                                  {uploadActaFileMutation.isPending && uploadingActaId === acta.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-1" />
                                      Subir PDF
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActaDownloadPdf(acta.id)}
                                  data-testid={`button-print-${acta.id}`}
                                  title="Imprimir PDF"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActaEdit(acta)}
                                  data-testid={`button-edit-${acta.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteActaId(acta.id)}
                                  data-testid={`button-delete-${acta.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <input
            type="file"
            ref={actaFileInputRef}
            onChange={handleActaFileChange}
            accept="application/pdf"
            className="hidden"
            data-testid="input-file-acta"
          />
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
                name="tipoComite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-comite">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="copasst">COPASST</SelectItem>
                        <SelectItem value="vigia">Vigía SST</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="totalTrabajadores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Trabajadores</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        onBlur={() => { if (field.value === '' || field.value == null) field.onChange(1); }}
                        data-testid="input-total-trabajadores"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const comp = calcularComposicion(field.value || 0);
                        return `${comp.tipo.toUpperCase()} - ${comp.principales} principales + ${comp.suplentes} suplentes`;
                      })()}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <DialogTitle>Agregar Miembro al COPASST</DialogTitle>
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
                name="tipoRepresentante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Representante</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo-representante">
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
                name="rolMiembro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-rol">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="suplente">Suplente</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cargo">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="miembro">Miembro</SelectItem>
                        <SelectItem value="presidente">Presidente</SelectItem>
                        <SelectItem value="secretario">Secretario</SelectItem>
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
                name="propuestas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Propuestas (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Propuestas del candidato" data-testid="input-propuestas" />
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

      <Dialog open={isCreateActaOpen} onOpenChange={setIsCreateActaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Acta de Reunión COPASST</DialogTitle>
          </DialogHeader>
          <Form {...actaCreateForm}>
            <form onSubmit={actaCreateForm.handleSubmit(handleActaCreate)} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  El número de acta se generará automáticamente al guardar
                </p>
              </div>

              <FormField
                control={actaCreateForm.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-acta-fecha" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actaCreateForm.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido del Acta *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada del acta de reunión del COPASST..."
                        rows={12}
                        {...field}
                        data-testid="input-acta-notas"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actaCreateForm.control}
                name="presidenteWorkerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presidente (Opcional)</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleActaPresidenteSelect(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-acta-presidente">
                          <SelectValue placeholder="Seleccionar presidente" />
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
                control={actaCreateForm.control}
                name="secretariaWorkerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secretario(a) (Opcional)</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleActaSecretariaSelect(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-acta-secretaria">
                          <SelectValue placeholder="Seleccionar secretario(a)" />
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

              <div className="space-y-2">
                <Label>Archivo PDF (Opcional)</Label>
                <Input
                  type="file"
                  ref={actaCreateFileInputRef}
                  accept="application/pdf"
                  onChange={(e) => setActaCreateSelectedFile(e.target.files?.[0] || null)}
                  data-testid="input-acta-create-file"
                />
                {actaCreateSelectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {actaCreateSelectedFile.name}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateActaOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createActaMutation.isPending} data-testid="button-guardar-acta">
                  {createActaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditActaOpen} onOpenChange={setIsEditActaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Acta COPASST</DialogTitle>
          </DialogHeader>
          <Form {...actaEditForm}>
            <form onSubmit={actaEditForm.handleSubmit(handleActaUpdate)} className="space-y-4">
              {editingActa && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Acta N° {editingActa.numeroActa}</p>
                </div>
              )}

              <FormField
                control={actaEditForm.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-acta-fecha" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actaEditForm.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido del Acta *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada del acta de reunión del COPASST..."
                        rows={12}
                        {...field}
                        data-testid="input-edit-acta-notas"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={actaEditForm.control}
                name="presidenteWorkerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presidente (Opcional)</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleEditActaPresidenteSelect(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-acta-presidente">
                          <SelectValue placeholder="Seleccionar presidente" />
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
                control={actaEditForm.control}
                name="secretariaWorkerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secretario(a) (Opcional)</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleEditActaSecretariaSelect(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-acta-secretaria">
                          <SelectValue placeholder="Seleccionar secretario(a)" />
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditActaOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateActaMutation.isPending} data-testid="button-actualizar-acta">
                  {updateActaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Actualizar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteActaId} onOpenChange={(open) => !open && setDeleteActaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El acta y su archivo adjunto (si existe) serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancelar-eliminar-acta">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteActaId && deleteActaMutation.mutate(deleteActaId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirmar-eliminar-acta"
            >
              {deleteActaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
